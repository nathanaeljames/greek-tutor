<script>
  // The scored "workhorse": prompt + full option grid + feedback + score.
  // Covers letter exercises (24-option generator), vocab drills (10 lemmas)
  // and chapter 2's four static-option drills.
  //
  // ANSWER POLICY. activity.answerPolicy declares WHAT a tap on an option
  // means; src/lib/timing.js decides how long anything waits (D-14 — no
  // timing number lives in this file) and which outcomes move by themselves.
  // The four classes and their behavior live in that module's header; this
  // component reads the resolved FLAGS (autoOnCorrect / autoOnIncorrect /
  // revealOnIncorrect / oneAttempt) and never compares a class name — which is
  // why 5E-SPEC3's six-to-four collapse needed no edit here at all.
  // Completion: one-attempt drills complete on all-ATTEMPTED, "until right"
  // drills on all-correct.
  //
  // AUDIO TIMING (5E-SPEC2 §2) is likewise declared by the data, in
  // activity.audioTiming, and never inferred from the prompt language here:
  //   beforeGuess  the prompt clip plays when the item appears (Greek prompt)
  //   afterGuess   the clip plays once the answer is in, and the next item
  //                does not appear until it has FINISHED (English prompt —
  //                speaking the Greek any earlier hands over the answer)
  //   none         this drill has no clip of its own
  //
  // CONTROLS come from activity.ui.buttons, so each drill shows exactly the
  // original's button block (Previous / Next / Pronounce / Translate / Hint /
  // Score); chapter 1's two-button drills are unaffected.
  //
  // TWO-STAGE ITEMS (5F §2.9). Chapter 8's Personal Pronoun Case Drill asks
  // for a PAIR — the person column, then the case-and-number grid — and
  // NOTHING is judged until both are chosen: the learner may change their mind
  // on the person as often as they like and only the last stage commits
  // (Nathanael, VERIFY-5F item 7). That is the whole of the new interaction;
  // once the pair is in, it is scored, timed and advanced by exactly the same
  // policy machinery as a one-stage item, so no timing or advance rule below
  // has a special case for it.
  import { onDestroy } from 'svelte';
  import { authoredOptionSource, buildSelectQuestions, buildTwoStageQuestions, headingCovers, headingKey, paradigmToggleLabels, randomFeedback, resolveContentById, resolveHintBlocks, resolveHintPage, resolveHintRef } from '../lib/content.js';
  import { stripMarkup } from '../lib/markup.js';
  import { combiningForMarkName, firstAccentCluster, markOverlayParts } from '../lib/greek.js';
  import { play, playThrough, stop as stopAudio } from '../lib/audio.js';
  import { markCompleted } from '../lib/progress.js';
  import { resolveAdvance, waitsForNext } from '../lib/timing.js';
  import RichContent from './RichContent.svelte';
  import Paradigm from './Paradigm.svelte';
  export let chapter;
  export let activity;

  let options = [];
  let questions = [];
  let promptIsGreek = false;   // generator-declared (P6-P9): Greek prompts are tappable
  let optionClass = 'wide';
  let qIndex = 0;
  let attempts = 0;
  let correct = 0;
  let feedback = '';
  let feedbackKind = '';
  let picked = null;          // option id last clicked
  let answered = false;       // current question resolved
  let pronounceEach = true;
  let finished = false;
  let showHint = false;
  let shownReveals = [];
  let showScore = false;
  let advanceTimer = null;
  // Bumped by every scheduled advance and by everything that cancels one
  // (manual Previous/Next, a new answer, unmount). An advance that has to wait
  // for a clip to finish resolves asynchronously, so the token — not the timer
  // handle alone — is what keeps a superseded advance from firing. §2.3: Next
  // stops the audio and moves at once, which is this token plus stopAudio().
  let advanceToken = 0;
  let answeredCorrect = false;
  const attemptedItems = new Set();

  // Two-stage state. `stages` is empty on every one-stage drill, which is what
  // every `twoStage` guard below reads.
  let stages = [];
  let stagePicks = [];        // stage index -> chosen option id (or null)
  let pairKey = list => (list || []).join(' ');
  $: twoStage = stages.length > 1;

  init();
  function init() {
    const built = activity.mode === 'twoStageGrid'
      ? buildTwoStageQuestions(chapter, activity)
      : buildSelectQuestions(chapter, activity);
    stages = built.stages || [];
    pairKey = built.pairKey || pairKey;
    stagePicks = stages.map(() => null);
    options = built.options || [];
    questions = built.questions;
    promptIsGreek = !!built.promptIsGreek;
    optionClass = built.optionClass || '';
    qIndex = 0; attempts = 0; correct = 0;
    feedback = ''; picked = null; answered = false; finished = false;
    shownReveals = [];
    attemptedItems.clear();
    pronounceEach = activity.ui?.defaults?.pronounceEach ?? true;
    // D1: the score line starts HIDDEN on every scored surface. ui.liveScore
    // says the line updates live once revealed, not that it opens by itself --
    // Score is what reveals it, as in the original, and toggles it after.
    showScore = false;
    answeredCorrect = false;
    cancelAdvance();
    maybePronounce();
  }

  $: current = questions[qIndex];
  // EVERY STAGE IS LIVE FROM THE START. An earlier pass greyed the case grid
  // out until a person was chosen, to make the instruction line's order
  // ("Click on the person then the case") visible. The rail walk says no:
  // ch8railwalk p8 shows the case grid in exactly the same state before and
  // after the person click. What holds the pair together is the COMMIT rule,
  // not a disabled control — nothing is judged until both stages are filled,
  // whichever order they are filled in (VERIFY-5F item 7).
  // Every value acceptable at a stage, over answer + answerAlt. BOTH neuter
  // plural cells of αὐτά light up, because the original grades both right
  // (VERIFY-5F item 8) — showing only the first would call one of them a miss.
  function stageCorrectIds(index, question) {
    const ids = new Set();
    for (const pair of (question && question.pairs) || []) {
      if (pair[index] != null) ids.add(String(pair[index]));
    }
    return ids;
  }
  // An item may carry its OWN option set (5D: the six verb-family
  // translations, the three Greek forms) — item-level first, activity-level
  // as the fallback.
  $: currentOptions = (current && current.options) || options;
  // Same question the builder asked (5F: `options: "perItem"` counts too, so
  // the three translation drills get the authored-grid styling — selection
  // plus a revealed answer — rather than the vocabulary pool's red miss).
  $: authoredOptions = authoredOptionSource(activity);
  // Only explicitly wide grids stay four-up at phone width. Vocabulary pools
  // in BOTH directions follow D-19 (two-up below 768px, four-up from 768px):
  // long English glosses can split just as badly as long Greek forms. The
  // 24-letter generators declare `wide`, so their single glyphs stay four-up.
  $: wideOptions = optionClass === 'wide';
  // optionGroups ([3,3]) splits the option list into visually separated
  // stacks, as the original's Parsing drill does. Groups stack vertically at
  // phone width and sit side by side once there is room (the six full parsing
  // labels are 46 characters — two columns inside 320px would be unreadable).
  $: optionGroups = optionClass === 'grouped' ? sliceGroups(currentOptions, activity.optionGroups) : null;
  // How WIDE a group is. Chapter 3's six full parsings are 48 characters and
  // stack one per line; chapter 9's "Second Singular" is fifteen and the
  // original draws its six options as three PAIRED rows — same optionGroups
  // mechanism, two different densities, decided by the labels rather than by
  // the chapter. The threshold is the same 24 the ungrouped grids use, so a
  // grouped drill and a plain one break to one column at the same width.
  $: groupClass = groupClassFor(currentOptions);
  function groupClassFor(list) {
    const longest = (list || []).reduce((n, option) => Math.max(n, String(option.label).length), 0);
    return longest > 24 ? 'single' : '';
  }
  $: greekOptions = !!activity.optionsAreGreek || activity.options === 'greek' || activity.generator?.options === 'lower';
  // The responsive vocabulary pool (D-19), in either direction. A vocabulary
  // select is the non-generator, non-authored branch in buildSelectQuestions.
  // Explicit pedagogical layouts remain outside this responsive class.
  //
  // D-32 and its extension (5G-SPEC1, landed with DISCLOSURE-SPEC1 W9): the
  // INFERENCE below is a proxy for "this is a vocabulary pool", and it is wrong
  // for the eight case-split vocabulary drills in chapters 6, 8, 9 and 10.
  // Those ship an AUTHORED option list — the original draws a fixed grid of
  // fifteen or sixteen words, not a pool sampled from the lexicon — so
  // authoredOptions is true and they fell out of the responsive class, staying
  // two-up on a tablet while chapter 3's identical-looking vocabulary drill
  // went four-up. `poolKind: "vocabulary"` is the data saying outright what the
  // inference could not see. It only ever ADDS a drill to the class: no
  // activity without the key changes, which is what keeps the explicit
  // pedagogical layouts (wide letter grids, paradigm2col, single) exactly where
  // they are.
  $: vocabularyPool = activity.poolKind === 'vocabulary'
    || (!activity.generator && !authoredOptions && !wideOptions
      && optionClass !== 'single'
      && optionClass !== 'paradigm2col');
  // A LONG Greek prompt cannot have the 3rem type a single letter gets. At
  // 320px, πιστεύουσι sets 268px of glyph into 260px of card and the tail is
  // lost in silence (overflow-x is hidden app-wide). Declared here rather than
  // guessed in CSS, which cannot see how long a string is; chapter 1's letter
  // prompts and chapter 2's short words are below the threshold and unchanged.
  // 5I-SPEC2 §3.1: the WHOLE prompt, continuation included. `prompt2` is no
  // longer a second line but the tail of the same flowing verse, so it is part
  // of what the type ramp has to fit.
  $: promptFullText = [current?.prompt, current?.prompt2].filter(Boolean).join(' ');
  $: longPrompt = promptIsGreek && [...String(promptFullText)].length > 7;
  // The second step of the ramp. `two-line` used to mark a prompt that had a
  // continuation and sized it down for the extra line; a joined verse needs the
  // same step down for the same reason (it is the longest thing the panel ever
  // holds), but it needs it because of its LENGTH rather than because a key is
  // present. 47 clusters is the longest prompt in the app that has NO
  // continuation and therefore already shipped at 2.2rem and was accepted;
  // above it are the joined verses alone, which is exactly the set that wants
  // the smaller step.
  $: veryLongPrompt = promptIsGreek && [...String(promptFullText)].length > 47;
  $: uiButtons = activity.ui?.buttons || [];
  $: showPronounce = !authoredOptions || uiButtons.includes('Pronounce');
  $: showStepper = uiButtons.includes('Previous') || uiButtons.includes('Next');
  // Generic button-driven prompt reveals. Older chapter-3 data predates the
  // revealButtons contract, so its authored Translate control normalizes to
  // the same shape; chapter 4+ declares the field explicitly (Translate or
  // Gender), and later chapters can add another without a component branch.
  $: revealButtons = (activity.revealButtons && activity.revealButtons.length)
    ? activity.revealButtons
    : (uiButtons.includes('Translate') ? [{ label: 'Translate', field: 'translate' }] : []);
  // The button ORDER is authored: ch3 lists Translate before Hint, ch4 and
  // ch5 list Hint first, and both rail walks agree with their own chapter's
  // data. Order from the data rather than from the template so no chapter is
  // wrong on screen. Unlisted controls retain their template order at the end.
  $: buttonOrder = Array.isArray(activity.ui?.buttons) ? activity.ui.buttons : null;
  $: showPronounceEach = !authoredOptions || !!activity.ui?.checkboxes?.includes('Pronounce Each Drill');
  // A hint either carries its own blocks (chapter 2's inline charts, rendered
  // below the card) or NAMES a chart the chapter already draws — chapter 3's
  // three verb drills all open the λύω paradigm, which the original shows as a
  // popup, so a hintRef opens a modal.
  $: hintBlocks = resolveHintBlocks(chapter, activity.hint);
  // A form may override the drill's default chart. The question builder keeps
  // that reference attached while shuffling; forms without one retain the
  // activity-level Hint.
  $: activeHintRef = current?.hintRef ?? activity.ui?.hintRef;
  $: hintChart = activeHintRef ? resolveHintRef(chapter, activeHintRef) : null;
  // 5H-SPEC2 3.1: A PER-ITEM hintRef MAY NAME A TEACHING PAGE, not only a
  // chart. Chapter 8's Aὐτός Translation Drill routes eight of its twenty-one
  // items to the Learn topic "Three Uses" and the rest to the Third Person
  // paradigm — the original's own WordCounter dispatch (8_PRONS.TBK 0x7bf39),
  // one page per item. The port used to stack BOTH as a two-page hintPages
  // popup, which showed every item both answers; the data has dropped that key
  // so this per-item routing governs.
  //
  // resolveHintRef answers "which CHART" and three call sites feed its result
  // straight to Paradigm, so the topic-id fall-through lands here rather than
  // inside it: when a ref resolves to no chart, ask resolveContentById for the
  // topic's own blocks — the identical array the retired `contentRef` page
  // rendered. A ref that resolves to neither still yields no Hint button,
  // which is what check:shapes now refuses to let ship.
  $: hintRefPage = activeHintRef && !hintChart
    ? resolveHintPage(chapter, activeHintRef)
    : { blocks: [], title: null };
  $: hintRefBlocks = hintRefPage.blocks;
  // 5G-SPEC3 / D-48f1: a composite drill hint discloses one chart at a time,
  // and the button always names the OTHER state so the learner sees where it
  // goes rather than a generic "switch" instruction.
  //
  // DISCLOSURE-SPEC1 W6.3: that policy used to be scoped by an ALLOWLIST of
  // three hintRefs — the three composites that existed when it was written.
  // DISCLOSURE-RULES §5 states the rule structurally instead: a resolved bundle
  // of exactly two paradigms renders the §4.1 toggle, three or more render the
  // §4.2 Back/More pair. The allowlist and the structural rule agree exactly on
  // today's data (all three named bundles hold two charts); what changes is
  // that the NEXT composite a chapter ships discloses correctly without an edit
  // here, and that a bundle of three no longer falls through to the stacked
  // rendering the surface never asked for. Quick Review does not route through
  // hintRef and is unaffected.
  let hintParadigmIndex = 0;
  let hintParadigmRef = null;
  // A correct answer may auto-advance behind an already-open Hint. If the new
  // form changes its item-level hintRef (future λύω ↔ εἰμί), that is a newly
  // disclosed surface and must begin at its authored state 1 just like a
  // freshly opened modal. Retaining state 2 across unlike refs would show the
  // learner a chart they did not choose for the new form.
  $: if (activeHintRef !== hintParadigmRef) {
    hintParadigmRef = activeHintRef;
    hintParadigmIndex = 0;
  }
  // 5I-SPEC2 §4.7 (VERIFY-5I I-3): A HINT MAY RESOLVE TO A CONTENT BLOCK, not
  // only to a paradigm. Chapters 14 and 15 modelled their "Verb Forms" hints as
  // two-column paradigms, which put the English gloss in the row-LABEL slot and
  // therefore printed it FIRST; the original prints it last, and the Learn page
  // of each chapter already draws the same list correctly as a `stemList`
  // greekRows block. Rather than teach Paradigm a trailing-gloss column that
  // exists to imitate a block the app already has, the hint now names that
  // block: `hintCharts.<ref>.charts[0]` may be any RichContent block, and a
  // resolved ref that is not a chart is rendered by RichContent in the same
  // modal shell. The contract touched is `hintCharts`, which gains "a chart
  // entry may be a content block"; nothing about the paradigm route changes.
  $: hintChartIsBlock = !!hintChart && !!hintChart.type
    && hintChart.type !== 'paradigm' && hintChart.type !== 'pronounParadigm';
  $: hintBundle = !hintChartIsBlock && Array.isArray(hintChart?.paradigms) ? hintChart.paradigms : [];
  $: hintDisclosure = hintBundle.length >= 2;
  // §4.1 at exactly two, §4.2 at three or more — the same split Paradigm makes
  // for a charts[] stack, stated once per host because the two hosts own their
  // control rows separately (this one pins its row in the modal's own footer
  // beside Close; Paradigm pins its own).
  $: hintPairToggle = hintBundle.length === 2;
  $: hintParadigm = hintDisclosure
    ? hintBundle[Math.min(hintParadigmIndex, hintBundle.length - 1)]
    : null;
  $: hintToggleLabels = paradigmToggleLabels(hintBundle.map(chart => chart.title));
  $: hintParadigmTarget = hintPairToggle
    ? hintToggleLabels[1 - hintParadigmIndex]
    : null;
  // 5F-FEEDBACK2 items 13/28 (Nathanael, 2026-08-09): a MULTI-PAGE hint, the
  // original's More/Back-paged popup. ui.hintPages lists pages by reference —
  // { hintRef } (a chart; a stack of N charts flattens to N pages, one chart
  // per page, so the MODAL owns all the paging, and `chartIndex` picks ONE
  // chart of that stack for this page), { contentRef } (a Learn topic's whole
  // content array, by topic id) or inline { content } — plus an optional
  // title. Nav uses item 27's fixed-slot model: Back always left,
  // More always right, neither ever moves between pages.
  $: hintPages = buildHintPages(chapter, activity.ui?.hintPages);
  let hintPageIndex = 0;
  function buildHintPages(chapterData, defs) {
    if (!Array.isArray(defs) || !defs.length) return [];
    const pages = [];
    for (const def of defs) {
      if (def.hintRef) {
        const target = resolveHintRef(chapterData, def.hintRef);
        if (!target) continue;
        // A COMPOSITE ref resolves to several charts. Reached from hintPages
        // it means one chart per page, the same as a charts[] stack. The
        // direct drill-hint route applies its own target-labelled disclosure
        // policy below; which route the data asked for is which field it used.
        const charts = Array.isArray(target.paradigms) && target.paradigms.length
          ? target.paradigms
          : (Array.isArray(target.charts) && target.charts.length ? target.charts : [target]);
        // 5H-SPEC3 2 (VERIFY-5H-2 (s), DOSBox): A PAGE MAY NAME ONE CHART OF A
        // STACK. Chapter 8's Aὐτός Translation Drill opens the same four-page
        // Hint on every item -- the Third Person Paradigm's Masculine,
        // Feminine and Neuter charts, then the Three Uses teaching page -- and
        // all three charts live under ONE ref (`thirdPersonParadigm`). Without
        // `chartIndex` the flatten below would turn each of the data's three
        // entries into three pages and the hint would be ten pages long,
        // three of them repeated. With it, a page names its own chart and the
        // data's title is the one on screen, so the page ORDER is the data's
        // rather than the stack's.
        const selected = Number.isInteger(def.chartIndex) ? [charts[def.chartIndex]] : charts;
        for (const chart of selected) {
          if (!chart) continue;
          const title = def.title || target.title || null;
          // The SAME heading said at two lengths, which is what the
          // deduplication rule in content.js is for. A page that names one
          // chart of a stack titles itself "Third Person Paradigm: Masculine"
          // while the chart under it carries "Masculine" as its own green
          // section label, and printing both puts the word on screen twice.
          // The page title is the fuller one and it is the one the data
          // authored for this page, so it stands and the label it repeats is
          // dropped. A page whose title does NOT say what the subtitle says
          // (chapter 7's "Adjective Paradigm" over Singular / Plural) keeps
          // both, unchanged.
          const covered = chart.subtitle
            && (headingKey(title) === headingKey(chart.subtitle) || headingCovers(title, chart.subtitle));
          pages.push({
            chart: { ...target, charts: [covered ? { ...chart, subtitle: null } : chart] },
            title
          });
        }
      } else if (def.contentRef) {
        const blocks = resolveContentById(chapterData, def.contentRef);
        if (blocks.length) pages.push({ blocks, title: def.title || null });
      } else if (Array.isArray(def.content)) {
        pages.push({ blocks: def.content, title: def.title || null });
      }
    }
    return pages;
  }
  function toggleHint() {
    showHint = !showHint;
    hintPageIndex = 0;   // a reopened hint starts back at page 1
    hintParadigmIndex = 0; // and a disclosure starts at its authored state 1
  }
  function toggleHintParadigm() {
    // The old chart no longer owns the screen after this click. Stop anything
    // it started before replacing both its cells and its Say action; the new
    // state itself remains silent until the learner taps it.
    stopAudio();
    hintParadigmIndex = hintParadigmIndex === 0 ? 1 : 0;
  }
  // §4.2, for a bundle of three or more: step, do not alternate.
  function stepHintParadigm(delta) {
    stopAudio();
    hintParadigmIndex = Math.max(0, Math.min(hintBundle.length - 1, hintParadigmIndex + delta));
  }
  $: showHintButton = hintPages.length > 0 || hintBlocks.length > 0 || !!hintChart
    || hintRefBlocks.length > 0;
  $: orderedRevealControls = orderControls([
    ...revealButtons.map(reveal => ({ kind: 'reveal', label: reveal.label, reveal })),
    ...(showHintButton ? [{ kind: 'hint', label: 'Hint' }] : [])
  ], buttonOrder);
  // Grouped button block (the original stacks them two-up) once there are more
  // than the chapter-1 pair.
  $: groupedControls = 1 + (showPronounce ? 1 : 0) + (showStepper ? 2 : 0)
    + revealButtons.length + (showHintButton ? 1 : 0) > 3;
  // Timing and advance semantics: declared by the data, resolved centrally.
  $: advancePolicy = resolveAdvance(activity.answerPolicy);
  $: oneAttempt = advancePolicy.oneAttempt;
  // §2: the moment this drill's clip is spoken, straight from the data. A
  // drill with no stamped timing keeps the pre-5E behavior (speak the prompt
  // on arrival) rather than falling silent; check:shapes rejects any value
  // outside the five, and apply-behavior-matrix.py stamps every shipped drill.
  $: audioTiming = activity.audioTiming || 'beforeGuess';
  // 5H-SPEC1 3.5 / proposed D-50 -- THE ANSWER-CLIP PROMPT GATE. Chapter 12's
  // Augment Drill shows a present-tense lemma and asks which of three GREEK
  // forms is its correctly augmented imperfect; the item's clip (ledger row
  // 108, CONFIRMED) records the AUGMENTED ANSWER, not the lemma on screen, so
  // the prompt tap and Pronounce would hand the answer over before the guess.
  //
  // Stated structurally rather than by activity id: when the options are Greek
  // AND the clip is afterGuess, that clip cannot be the prompt's own -- the
  // answer is one of the displayed forms and the recording is of it. Until the
  // item is answered the Greek prompt renders in INK (the Syllable Division
  // exception treatment, directive 9) and Pronounce is disabled; afterwards
  // both go live and replay the clip.
  //
  // 5H-SPEC2 4.1, ADOPTED FORWARD AND BACKWARD (Nathanael, VERIFY-5H (d)):
  // DOSBox confirms the ORIGINAL leaks -- its Pronounce speaks the augmented
  // answer before the guess -- and the gate is kept anyway, as a deliberate
  // improvement, everywhere the same shape occurs. The condition's first leg
  // was "the prompt is Greek", which fenced it to chapter 12; the leg that
  // actually states the rule is the ADVANCE CLASS:
  //   afterGuess + Greek options + NOT autoBoth
  // `autoBoth` is every English-to-Greek vocabulary drill, and there a
  // disabled Pronounce is a dead button -- the item auto-advances on any
  // answer, so the control would never come alive while its item is on screen.
  // Excluded by the same ruling, structurally rather than by name: the
  // spellers, where pronouncing the target IS the exercise (they are not this
  // component at all). What that leaves, across the 270-activity census, is
  // FOUR: chapter 12's Augment Drill and the English-prompt form drills of
  // chapters 3, 4 and 5, whose Pronounce speaks the Greek ANSWER. Their
  // prompts are English, so only the Pronounce half of the gate bites there --
  // the ink-prompt half is vacuous, not skipped.
  $: answerClipPrompt = greekOptions && audioTiming === 'afterGuess'
    && advancePolicy.advanceClass !== 'autoBoth';
  // Whether the prompt tap and Pronounce may speak the clip right now.
  $: promptClipLive = !answerClipPrompt || answered;
  // §5.5: the item is final and nothing is going to move it. Which outcomes
  // those are is the class's business, not this component's.
  $: waitingForNext = answered && waitsForNext(advancePolicy, answeredCorrect);
  // §1: whether the ANSWER is shown. A correct item always shows what it got
  // right; a wrong one shows the answer only where the class says to, because
  // revealing it would destroy an "until right" exercise (rule B5).
  $: showAnswerReveal = answered && (answeredCorrect || advancePolicy.revealOnIncorrect);

  function sliceGroups(list, sizes) {
    const groups = [];
    let at = 0;
    for (const size of sizes || []) { groups.push(list.slice(at, at + size)); at += size; }
    if (at < list.length) groups.push(list.slice(at));   // never drop an option
    return groups;
  }

  function orderControls(controls, order) {
    if (!order) return controls;
    return controls.map((control, index) => ({
      control,
      index,
      authoredIndex: order.indexOf(control.label)
    })).sort((a, b) => {
      if (a.authoredIndex < 0 && b.authoredIndex < 0) return a.index - b.index;
      if (a.authoredIndex < 0) return 1;
      if (b.authoredIndex < 0) return -1;
      return a.authoredIndex - b.authoredIndex || a.index - b.index;
    }).map(entry => entry.control);
  }
  // 2c: the original's full-width "only one syllable" bar under the word. In
  // this drill it answers "1" -- the same value as the first number tile.
  $: oneSyllableOption = activity.oneSyllableButton
    ? options.find(option => option.id === '1') || null
    : null;

  // The mark being asked about is drawn RED -- that IS the question. The
  // Marking Recognition drill names the cluster (redMarkCluster); the Accent
  // Rule drill reddens the word's FIRST accent. Both resolve to the same
  // overlay parts, which colour ONLY the mark (5B-SPEC2 C5).
  $: redParts = current ? redPartsFor(current) : null;
  function redPartsFor(question) {
    if (question.redMarkCluster) {
      return markOverlayParts(question.prompt, question.redMarkCluster, combiningForMarkName(question.answerId));
    }
    if (activity.redFirstAccent) {
      const first = firstAccentCluster(question.prompt);
      if (first.index > 0) return markOverlayParts(question.prompt, first.index, first.mark);
    }
    return null;
  }

  // Live score (5B-SPEC2 C3): a reactive statement, so the line re-renders on
  // every answer. The old score box called scoreText() from the template with
  // no reactive dependency and went stale the moment it was opened.
  $: scoreLine = scoreText(attempts, correct);
  function scoreText(a, c) {
    if (a === 0) return chapter.feedback?.scorePrompt || 'Give it a try first';
    return `${c} correct out of ${a} attempts (${Math.round((c / a) * 100)}%)`;
  }

  function maybePronounce() {
    const q = questions[qIndex];
    // §2.1: the prompt clip on arrival, and only where the data says so. A
    // drill whose ANSWER is the Greek (Greek Verb Drill) is `afterGuess`, and
    // speaking anything here would hand the answer over.
    //
    // READ FROM THE DATA, NOT FROM THE REACTIVE `audioTiming`. init() runs in
    // the component's instance body, and Svelte does not evaluate `$:`
    // declarations until after that body returns — so at first mount
    // `audioTiming` is still undefined here, this returned early, and the
    // FIRST item of every beforeGuess drill arrived silent while every item
    // after it spoke (5E-SPEC3-RESPONSE item 3). Stepping to item 2 worked,
    // which is exactly why it survived a round of testing: nothing asserted
    // the clip on ARRIVAL.
    if ((activity.audioTiming || 'beforeGuess') !== 'beforeGuess') return;
    if (pronounceEach && q && !q.pending && q.promptAudio) play(q.promptAudio);
  }

  // §2.2: the clip that follows a guess on an `afterGuess` drill. It is the
  // ANSWER's clip where the answer is the Greek (English-prompt drills) and
  // the prompt's own clip where the prompt was the Greek all along (chapter
  // 1's letter exercises, which the DOSBox pass records as speaking after the
  // guess). Either way the item is finalized before it is spoken.
  function afterGuessAudio() {
    if (audioTiming !== 'afterGuess' || !pronounceEach || !current) return null;
    return current.answerAudio || current.promptAudio || null;
  }

  function cancelAdvance() {
    advanceToken += 1;
    clearTimeout(advanceTimer);
    advanceTimer = null;
  }

  // Schedule the move to the next item: no sooner than the class minimum, and
  // no sooner than the end of the afterGuess clip (§2.2 — the wait is
  // max(class minimum, audio duration), never shorter than 2000/4000). Both
  // halves are cancelled by cancelAdvance(), so Next always wins (§2.3).
  function scheduleAdvance(ms, clip) {
    cancelAdvance();
    const token = advanceToken;
    const minimum = new Promise(resolve => { advanceTimer = setTimeout(resolve, ms); });
    const spoken = clip ? playThrough(clip) : Promise.resolve();
    Promise.all([minimum, spoken]).then(() => { if (token === advanceToken) advance(); });
  }

  // §2.9: a stage click. A click that leaves any stage empty only RECORDS — no
  // attempt is counted, no feedback appears, nothing advances — so changing an
  // earlier stage is free. The click that fills the LAST EMPTY stage completes
  // the tuple and commits it, which is where the ordinary scoring path below
  // takes over.
  //
  // 5G-XPATCH1 §2 asked whether N > 2 needs a separate rule, because
  // 5G-SPEC1 §4.1 says both "commits on the final stage's click" and "exactly
  // as the two-stage c8_drill_case behaves" (device-verified either-order,
  // VERIFY-5F item 7). The two readings cannot diverge HERE, whatever the
  // stage count: the guard below returns while any pick is still null, so the
  // only click that can reach `commit` is the one that filled the last empty
  // stage — "every stage now holds a value" and "this click filled the last
  // empty one" are the same click, and once committed `answered` closes the
  // grid so no later click can re-open a full tuple. A separate N > 2 branch
  // would be two code paths that cannot produce two answers. The literal
  // reading that WOULD differ — commit only when the last stage BY INDEX is
  // clicked — is the one XPATCH1's own acceptance criteria rule out ("a
  // revision to stage 1 after stages 2+3 are filled still commits on the
  // stage-1 click"). ui-behavior G1 pins both fill orders.
  function chooseStage(index, opt) {
    if (answered || finished || current.pending) return;
    stagePicks = stagePicks.map((pick, at) => (at === index ? opt.id : pick));
    if (stagePicks.some(pick => pick == null)) return;   // tuple incomplete: record only
    commit(current.accepted.has(pairKey(stagePicks)));
  }

  function choose(opt) {
    if (answered || finished || current.pending) return;
    picked = opt.id;
    commit(opt.id === current.answerId);
  }

  function commit(right) {
    attempts += 1;
    attemptedItems.add(qIndex);
    if (right) correct += 1;
    feedback = randomFeedback(chapter, right ? 'correct' : 'incorrect');
    feedbackKind = right ? 'ok' : 'bad';
    const clip = afterGuessAudio();
    if (right || oneAttempt) {
      // One attempt: the item is done either way and the answer is revealed.
      // "One attempt" is scoped to this VISIT — coming back to the item
      // reopens it (see restore()).
      answered = true;
      answeredCorrect = right;
      // Completion is defined by attempted items, so record the final item when
      // it is ANSWERED. Route exit cancels the timer, not progress.
      if (oneAttempt && attemptedItems.size === questions.length && activity.id) markCompleted(activity.id);
      if (right && advancePolicy.autoOnCorrect) scheduleAdvance(advancePolicy.correctMs, clip);
      else if (!right && advancePolicy.autoOnIncorrect) scheduleAdvance(advancePolicy.incorrectMs, clip);
      else {
        // The one waiting outcome left (manualOnIncorrect, wrong): nothing is
        // scheduled, the surface says so (waitingForNext), and the clip still
        // gets spoken. A CORRECT answer can never reach this branch — B1a
        // makes autoOnCorrect a constant.
        cancelAdvance();
        if (clip) play(clip);
      }
    } else if (clip) {
      // retryUntilRight, wrong: the item stays open and nothing is revealed,
      // but the guess has been made, so the clip is still due.
      play(clip);
    }
  }

  function advance() {
    cancelAdvance();
    if (qIndex < questions.length - 1) {
      qIndex += 1;
      restore();
      maybePronounce();
    } else {
      finished = true;
      feedback = '';
      if (activity && activity.id) markCompleted(activity.id);
    }
  }

  // REVISITING AN ITEM RESETS IT (5D-SPEC2 §3, VERIFY-5D A5). This is the
  // original's behavior and it reverses what the port shipped: a one-attempt
  // item used to stay finalized, so stepping back showed the previous
  // selection, its correct/incorrect styling and the locked grid. Now every
  // arrival at an item presents it fresh and the student may answer again.
  //
  // The SCORE is not rewound. attempts/correct count attempts, not the current
  // state of the grid, and `attemptedItems` (which drives completion for
  // one-attempt drills) is a set — answering an item twice neither
  // double-counts completion nor un-completes it.
  function restore() {
    shownReveals = [];
    picked = null; answered = false; answeredCorrect = false;
    stagePicks = stages.map(() => null);
    feedback = ''; feedbackKind = '';
  }

  function revealValue(field) {
    if (!current || !field) return null;
    return (current.reveals && current.reveals[field])
      || current[field]
      || (field === 'translate' ? current.gloss : null);
  }

  function toggleReveal(field) {
    shownReveals = shownReveals.includes(field)
      ? shownReveals.filter(value => value !== field)
      : [...shownReveals, field];
  }

  // ...or, on a `promptGloss` drill, already standing in the prompt panel from
  // the moment the item mounted. Either way the answer reveal does not print
  // the same English a second time.
  $: glossRevealed = !!current && (!!activity.promptGloss
    || shownReveals.some(field => revealValue(field) === current.gloss));

  // §2.3: pressing Previous/Next stops the clip and shows the item AT ONCE.
  // The afterGuess wait is a courtesy, not a lock.
  function move(delta) {
    cancelAdvance();
    stopAudio();
    const nextIndex = Math.max(0, Math.min(questions.length - 1, qIndex + delta));
    if (nextIndex === qIndex) return;
    qIndex = nextIndex;
    restore();
    maybePronounce();
  }

  function sentenceParts(text, underline) {
    if (!underline) return null;
    const at = text.indexOf(underline);
    if (at === -1) return null;
    return [text.slice(0, at), text.slice(at, at + underline.length), text.slice(at + underline.length)];
  }

  // §3.1: leaving the activity stops whatever it started. The route change
  // stops audio in App.svelte too; this covers the rail's same-route remounts
  // and keeps the rule local to the surface that owns the clip.
  onDestroy(() => { cancelAdvance(); stopAudio(); });
</script>

<svelte:window on:keydown={showHint ? (e) => { if (e.key === 'Escape') showHint = false; } : null} />

<!-- 5I-SPEC1 §4.4: THE INSTRUCTION LINE, WHEN IT BELONGS TO THE ITEM. Chapter
     16's Passive Verbs Form Drill shows the same prompt panel for a verb's
     aorist question and its future one, and the original switches the line
     above the options between "Click on the correct matching aorist form" and
     "...future form" per item. ActivityHost stops drawing the static line for
     an `instructionsPerItem` activity and this takes over the same slot,
     immediately above the card, with the same class -- so the line does not
     move, it only changes. The activity-level string is the fallback for an
     item that carries none. -->
{#if activity.instructionsPerItem && (current?.instructions || activity.instructions)}
  <div class="instructions" data-instructions-per-item>{current?.instructions || stripMarkup(activity.instructions)}</div>
{/if}

<div class="card">
  {#if finished}
    <div class="scorebox" style="font-size:1.2rem; padding: 20px 0">
      Finished! {scoreLine}
    </div>
    <div class="controls"><button class="btn" on:click={init}>Start Over</button></div>
  {:else if current}
    <!-- Greek-tap rule (P6/P8/P9): a Greek PROMPT with audio pronounces itself
         on tap (blue). The tap never answers, advances, or re-shuffles. -->
    {#if redParts}
      <!-- Still displayed Greek, so still a greek-say tap (directive 9); the
           asked-about mark simply overrides the blue with red. -->
      <!-- The rendered cluster is base-minus-marks plus positioned mark glyphs,
           which reads as an unaccented word to a screen reader; the label
           restores the real prompt. -->
      <!-- The mark spans carry ZERO advance and sit in normal flow BEFORE the
           base, so the browser puts them on the same baseline at the same pen
           position the base glyph starts from -- the font's own offsets then
           place them exactly. Absolute positioning against the cluster box was
           what made marks ride low: its origin depends on line-height and on
           which metric the browser picks for the strut. -->
      <button class="prompt greek greek-say red-mark" aria-label={current.prompt} disabled={!current.promptAudio} on:click={() => current.promptAudio && play(current.promptAudio)}>{#each redParts as part}{#if part.marks}<span class="rm-cluster" class:legacy={part.layout} style={part.bx || part.aw ? `--bx:${part.bx || 0}em; --aw:${part.aw || 0}em` : null}><span class="rm-marks {part.layout || ''}" class:capital={part.capital} aria-hidden="true">{#each part.marks as mark}<span class="rm-mark {mark.slot || ''}" class:red={mark.red} style={mark.x != null ? `--mx:${mark.x}em; --my:${mark.y}em${mark.clip ? `; clip-path:polygon(${mark.clip[0]}em -3em, ${mark.clip[1]}em -3em, ${mark.clip[1]}em 3em, ${mark.clip[0]}em 3em)` : ''}` : null}>{mark.glyph}</span>{/each}</span><span class="rm-base">{part.base}</span></span>{:else if part.red}<span class="mark-red">{part.text}</span>{:else}{part.text}{/if}{/each}</button>
    {:else if promptIsGreek && current.promptAudio && promptClipLive}
      <!-- The red-mark branch above deliberately does NOT take this class: its
           mark offsets are em-relative and correct, and nothing about mark
           geometry moves in this round.
           5F §2.7: a two-line Greek prompt is ONE phrase and one clip, so the
           second line lives inside the same tap target.
           5I-SPEC2 §3.1 / DISCLOSURE-RULES §4.10: AND IT IS NOT A LINE ANY
           MORE. A verse is continuous text everywhere; the original's two-line
           prompt is a storage artifact of its own fixed-width panel, never a
           break the port reproduces. `prompt2` joins `prompt` with ONE SPACE
           inside the same button and wraps only where the card's width wraps
           it. The span survives so the surface can still say which items carry
           a continuation (`greek2` stays in the data as extraction
           provenance); it is inline and contributes nothing but that space. -->
      <!-- The type ramp reads the JOINED string, not the first line alone: a
           two-line verse became one long line in this round and sizing it off
           `prompt` would leave the longest prompts in the app at the size a
           short one wants. -->
      <!-- The note sits on the prompt's line but OUTSIDE its button, so it is
           not part of the tap target and can never speak. -->
      <div class="prompt-row" class:with-note={current.note}>
        <button class="prompt greek greek-say" class:long={longPrompt} class:very-long={veryLongPrompt}
                on:click={() => play(current.promptAudio)}>{current.prompt}{#if current.prompt2}<span class="prompt-cont">{` ${current.prompt2}`}</span>{/if}</button>
        {#if current.note}<span class="prompt-note">{current.note}</span>{/if}
      </div>
    {:else if current.underline && sentenceParts(current.prompt, current.underline)}
      {@const parts = sentenceParts(current.prompt, current.underline)}
      <div class="prompt select-sentence">{parts[0]}<u>{parts[1]}</u>{parts[2]}</div>
    {:else}
      <!-- INK, not link blue: either the prompt carries no clip at all, or the
           answer-clip gate above is holding its clip until the guess. `long`
           rides along so the type does not jump size when the gate opens. -->
      <div class="prompt" class:greek={promptIsGreek} class:long={promptIsGreek && longPrompt}>{current.prompt}</div>
    {/if}
    <!-- 5F §2.5: the case tag / parse tag / disambiguator sits BESIDE the
         prompt, on the same line, in plain ink at a smaller size — "πρός (to)",
         "ἐπί (with dat.)" (ch6railwalk p8/p10), "παρά (with dat.)"
         (ch8railwalk p10). It is never tappable even when it holds Greek: the
         "(not ἐκ)" pair is the logged exception to directive 9, and it stays
         inert inside the prompt's tap target below. -->
    {#if current.note && !(promptIsGreek && current.promptAudio)}
      <div class="prompt-note standalone">{current.note}</div>
    {/if}
    <!-- 5H-SPEC1 3.5: the Augment Drill's prompt panel is THREE lines -- the
         present lemma, its English gloss beneath it, and the reference in the
         corner. `promptGloss` says the item's gloss belongs to the PROMPT
         PANEL rather than to a Translate reveal (this drill has no Translate
         control), so it prints under the lemma from the moment the item
         mounts. It is English and never a tap target. -->
    {#if activity.promptGloss && current.gloss}<div class="prompt-gloss">{current.gloss}</div>{/if}
    <!-- The scripture citation the original prints beside the drill word. -->
    {#if current.citation}<div class="prompt-citation">{current.citation}</div>{/if}
    {#if current.pending}
      <div class="pending-verification" role="status">This activity item is pending content verification.</div>
    {:else}
      <!-- Button-driven reveal output is ink, never tappable blue. -->
      {#each revealButtons as reveal}
        {#if shownReveals.includes(reveal.field) && revealValue(reveal.field)}
          <div class="gloss-line" data-reveal={reveal.field}>{revealValue(reveal.field)}</div>
        {/if}
      {/each}
      <!-- Reveal on a finalized item: the gloss, and the properly accented
           form the Accent Rule drill's misaccented prompt should have had. -->
      {#if showAnswerReveal && (current.gloss || current.correctForm)}
        <div class="reveal-row">
          {#if current.gloss && !glossRevealed}<span class="reveal-gloss">{current.gloss}</span>{/if}
          {#if current.correctForm}<span class="reveal-form greek">{current.correctForm}</span>{/if}
        </div>
      {/if}
      <div class="feedback {feedbackKind}">{feedback}</div>
      {#if twoStage}
        <!-- §2.9: one grid per stage, in authored order, BOTH live from the
             start (ch8railwalk p8). Nothing here is judged until the last
             empty stage is filled; see chooseStage(). -->
        {#each stages as stage, stageIndex}
          {@const correctIds = showAnswerReveal ? stageCorrectIds(stageIndex, current) : null}
          {#if stage.optionClass === 'grouped'}
            <!-- 5G-SPEC1 §4.1: a stage that declares its own optionGroups is
                 drawn in separated groups, the same way an activity-level
                 optionGroups is — chapter 10's person/number stage is three
                 paired rows in the original. Same commit rule: the stage is
                 still one stage, however many groups it is drawn in. -->
            <div class="option-groups stage-grid" class:paired-groups={groupClassFor(stage.options) !== 'single'}
                 class:stage-separated={stages.length > 2 && stageIndex > 0}
                 data-stage={stageIndex} data-stage-label={stage.label}>
              {#each sliceGroups(stage.options, stage.optionGroups) as group}
                <div class="grid options option-group" class:single={groupClassFor(stage.options) === 'single'}>
                  {#each group as opt}
                    <button
                      class="tile small"
                      class:selected={stagePicks[stageIndex] === opt.id}
                      class:correct={correctIds && correctIds.has(opt.id)}
                      disabled={answered}
                      on:click={() => chooseStage(stageIndex, opt)}>
                      {opt.label}
                    </button>
                  {/each}
                </div>
              {/each}
            </div>
          {:else}
            <div class="grid options stage-grid"
                 class:paradigm2col={stage.optionClass === 'paradigm2col'}
                 class:single={stage.optionClass === 'single'}
                 class:stage-separated={stages.length > 2 && stageIndex > 0}
                 data-stage={stageIndex} data-stage-label={stage.label}>
              {#each stage.options as opt}
                <button
                  class="tile small"
                  class:selected={stagePicks[stageIndex] === opt.id}
                  class:correct={correctIds && correctIds.has(opt.id)}
                  disabled={answered}
                  on:click={() => chooseStage(stageIndex, opt)}>
                  {opt.label}
                </button>
              {/each}
            </div>
          {/if}
        {/each}
      {:else if optionGroups}
        <!-- Parsing drill: separated stacks, as the original draws them. -->
        <div class="option-groups" class:paired-groups={groupClass !== 'single'}>
          {#each optionGroups as group}
            <div class="grid options option-group" class:single={groupClass === 'single'}>
              {#each group as opt}
                <button
                  class="tile small"
                  class:greek={greekOptions}
                  class:selected={authoredOptions && picked === opt.id}
                  class:correct={showAnswerReveal && opt.id === current.answerId}
                  class:incorrect={!authoredOptions && picked === opt.id && opt.id !== current.answerId}
                  on:click={() => choose(opt)}>
                  {opt.label}
                </button>
              {/each}
            </div>
          {/each}
        </div>
      {:else}
        <div class="grid options" class:wide={wideOptions} class:single={optionClass === 'single'}
             class:paradigm2col={optionClass === 'paradigm2col'} class:vocab-pool={vocabularyPool}>
          {#each currentOptions as opt}
            <button
              class="tile small"
              class:greek={greekOptions}
              class:selected={authoredOptions && picked === opt.id}
              class:correct={showAnswerReveal && opt.id === current.answerId}
              class:incorrect={!authoredOptions && picked === opt.id && opt.id !== current.answerId}
              on:click={() => choose(opt)}>
              {opt.label}
            </button>
          {/each}
        </div>
      {/if}
      <!-- One attempt, wrong, nothing auto-advancing: say so rather than
           leaving a locked grid with no explanation. Since rule B1a this is
           the app's ONLY waiting outcome — `manualOnIncorrect` on a wrong
           answer. The sequential rail's Next works too. -->
      {#if waitingForNext}<div class="await-next" role="status">Click Next to continue</div>{/if}
      {#if oneSyllableOption}
        <button
          class="one-syllable-bar"
          class:selected={picked === oneSyllableOption.id}
          class:correct={answered && current.answerId === oneSyllableOption.id}
          on:click={() => choose(oneSyllableOption)}>
          {activity.oneSyllableButton}
        </button>
      {/if}
    {/if}
    <div class="controls" class:grouped={groupedControls}>
      {#if showStepper}
        <button class="btn secondary" disabled={qIndex <= 0} on:click={() => move(-1)}>Previous</button>
        <button class="btn secondary" disabled={qIndex >= questions.length - 1} on:click={() => move(1)}>Next</button>
      {/if}
      {#if showPronounce}
        <!-- Speaks the prompt where the prompt is the Greek; on the Greek Verb
             Drill (English prompt) it speaks the answer form, which is what
             the original's Pronounce does there -- but only once the guess is
             in. `promptClipLive` is the 4.1 gate: the original speaks the
             answer whenever it is asked, and Nathanael's ruling on VERIFY-5H
             (d) keeps that clip from arriving before the learner has answered
             on all four drills where the clip IS the answer. -->
        {@const say = promptClipLive ? (current.promptAudio || current.answerAudio) : null}
        <button class="btn" disabled={!say} on:click={() => say && play(say)}>Pronounce</button>
      {/if}
      {#each orderedRevealControls as control}
        {#if control.kind === 'hint'}
          <button class="btn secondary" on:click={toggleHint}>Hint</button>
        {:else}
          <button class="btn secondary" disabled={!revealValue(control.reveal.field)} on:click={() => toggleReveal(control.reveal.field)}>{control.reveal.label}</button>
        {/if}
      {/each}
      <button class="btn secondary" on:click={() => (showScore = !showScore)}>Score</button>
    </div>
    {#if showPronounceEach}
      <div class="exercise-checks">
        <label><input type="checkbox" bind:checked={pronounceEach} /> Pronounce each</label>
      </div>
    {/if}
    <!-- 5G-SPEC1 §3.3: a standing note the original prints under the drill's
         controls, beside the Pronounce Each checkbox — chapter 10's parsing
         drill reminds the learner that a middle ending is usually deponent.
         It is a parenthetical aside about the whole drill, not about the item
         on screen, so it sits with the controls and never above the prompt
         (directive 2: core lesson text is what goes on top). -->
    {#if activity.note}<div class="note drill-note">{activity.note}</div>{/if}
    {#if showScore}<div class="scorebox live-score">{scoreLine}</div>{/if}
    <div class="scorebox" style="font-weight:400; font-size:0.85rem; margin-top:8px">
      {qIndex + 1} of {questions.length}
    </div>
  {/if}
</div>

{#if showHint && hintPages.length}
  <!-- The original's PAGED Hint popup (More/Back inside the modal). Same
       shell as the single-page routes below; only the page body swaps. -->
  {@const hintPage = hintPages[Math.min(hintPageIndex, hintPages.length - 1)]}
  <div class="modal-overlay" on:click|self={() => (showHint = false)} role="presentation">
    <div class="modal hint-modal" role="dialog" aria-modal="true" aria-label="Hint">
      {#if hintPage.chart}
        <!-- W4.1: a chart page IS the dialog's body — Paradigm owns the scroll
             and pins its own say-all row above the footer, so the say action
             never scrolls away from the chart it speaks. -->
        <Paradigm paradigm={hintPage.chart} title={hintPage.title} modalHost={true} />
      {:else}
        <div class="modal-scroll">
          {#if hintPage.title}<div class="rc-heading">{hintPage.title}</div>{/if}
          <RichContent blocks={hintPage.blocks} />
        </div>
      {/if}
      <div class="modal-actions">
        {#if hintPages.length === 2}
          <!-- W6.4 / §4.1: TWO pages are a two-state disclosure, so they get
               the single alternating button, not a pair with one half always
               greyed. The label is More on page 1 and Back on page 2: these
               two pages have no one-word contrast to name them by (chapter 7's
               "Adjective Paradigm" against "Attributive & Predicate
               Positions"), which is exactly the case §4.1 sends to More/Back. -->
          <div class="hint-paradigm-controls no-say" data-hint-page-controls>
            <button class="btn secondary hint-paradigm-toggle"
                    data-hint-page-nav={hintPageIndex === 0 ? 'more' : 'back'}
                    data-target-index={hintPageIndex === 0 ? 1 : 0}
                    on:click={() => (hintPageIndex = hintPageIndex === 0 ? 1 : 0)}>{hintPageIndex === 0 ? 'More' : 'Back'}</button>
          </div>
        {:else if hintPages.length > 2}
          <!-- §4.2: three or more pages keep the centred always-both-visible
               pair (5F-PATCH3 addendum) — the invalid direction greys out,
               never disappears. -->
          <div class="pg-nav hint-page-nav">
            <button class="btn secondary" data-hint-page-nav="back"
                    disabled={hintPageIndex <= 0}
                    on:click={() => (hintPageIndex -= 1)}>Back</button>
            <button class="btn secondary" data-hint-page-nav="more"
                    disabled={hintPageIndex >= hintPages.length - 1}
                    on:click={() => (hintPageIndex += 1)}>More</button>
          </div>
        {/if}
        <!-- svelte-ignore a11y-autofocus -->
        <button class="btn" autofocus on:click={() => (showHint = false)}>Close</button>
      </div>
    </div>
  </div>
{:else if showHint && hintChart}
  <!-- The original's Hint POPUP: the chapter's paradigm chart over the drill. -->
  <div class="modal-overlay" on:click|self={() => (showHint = false)} role="presentation">
    <div class="modal hint-modal" role="dialog" aria-modal="true" aria-label="Hint">
      <!-- 5F-FEEDBACK.pdf §8.1 root-cause fix: every paradigm the Hint route
           can resolve now ships in the one standard cell-audio shape, so
           there is no second renderer to keep in sync. -->
      {#if hintChartIsBlock}
        <!-- 5I-SPEC2 §4.7: the resolved hint is a CONTENT BLOCK — chapters 14
             and 15's Verb Forms lists, which are the Learn page's own
             `stemList` and therefore already read "present — aorist (gloss)"
             with the gloss last and both Greek forms tapping. Same modal shell
             and the same scroller as every other Hint route; there is no
             navigation, so nothing is pinned above Close (§4.3). -->
        <div class="modal-scroll">
          <RichContent blocks={[hintChart]} />
        </div>
      {:else if hintDisclosure}
        <!-- D-48f1: one chart at a time. A composite bundle is the one hint
             shape whose state the HOST owns — it picks which of the bundle's
             paradigms is on screen — so the host also owns the pinned line.
             DISCLOSURE-SPEC2 W3.4: only at TWO states. `actionsPinned` hands
             the say button to the footer, and at three or more the amended
             §4.3 explicitly leaves it in the scrolling content with its chart,
             so the pinned line is the Back/More pair alone. Passing
             `hintPairToggle` here is what makes that switch. -->
        <div class="modal-scroll">
          <div class="paradigm-stack">
            {#if hintChart.title}<div class="rc-heading">{hintChart.title}</div>{/if}
            <Paradigm paradigm={hintParadigm} title={hintParadigm.title || null}
                      actionsPinned={hintPairToggle} />
          </div>
        </div>
      {:else}
        <!-- W4.1: every other hint chart IS the dialog's body. Paradigm owns
             the scroller and pins its own control row outside it, which is what
             gives the ch3/4/5/7 chart hints a say-all and a toggle that never
             scroll away — and, for chapter 3's λύω chart, an in-place
             Paradigm/Endings toggle instead of a second modal (§4.4). -->
        <Paradigm paradigm={hintChart} title={hintChart.title || hintChart.charts?.[0]?.title || null}
                  switchLabels={activity.ui?.hintSwitchLabels || null} modalHost={true} />
      {/if}
      <div class="modal-actions">
        {#if hintDisclosure}
          <!-- W3.4: at three or more states the say button is NOT here — it is
               above, in the scrolling content, drawn by the Paradigm itself.
               `no-say` therefore covers both reasons the say slot can be empty:
               a chart with no whole-paradigm clip (εἰμί), and a three-plus
               bundle whose say button is deliberately unpinned. Either way the
               remaining control centres on its own line (§4.5). -->
          <div class="hint-paradigm-controls"
               class:no-say={!hintPairToggle || !hintParadigm.sayWhole?.audio}
               data-hint-paradigm-controls data-hint-ref={activeHintRef}
               data-state-index={hintParadigmIndex}>
            {#if hintPairToggle && hintParadigm.sayWhole?.audio}
              <button class="btn secondary" data-hint-paradigm-say
                      data-audio-id={hintParadigm.sayWhole.audio}
                      on:click={() => play(hintParadigm.sayWhole.audio)}>
                {hintParadigm.sayWhole.label || 'Say Paradigm'}
              </button>
            {/if}
            {#if hintPairToggle}
              <button class="btn secondary hint-paradigm-toggle"
                      data-paradigm-switch="hint" data-hint-paradigm-toggle
                      data-target-index={hintParadigmIndex === 0 ? 1 : 0}
                      on:click={toggleHintParadigm}>{hintParadigmTarget}</button>
            {:else}
              <!-- §4.2: three or more charts in the bundle — the centred pair,
                   both always visible, the invalid direction disabled. -->
              <div class="pg-nav">
                <button class="btn secondary pg-switch pg-switch-back"
                        data-paradigm-switch="back" data-hint-paradigm-nav="back"
                        disabled={hintParadigmIndex <= 0}
                        on:click={() => stepHintParadigm(-1)}>Back</button>
                <button class="btn secondary pg-switch pg-switch-more"
                        data-paradigm-switch="more" data-hint-paradigm-nav="more"
                        disabled={hintParadigmIndex >= hintBundle.length - 1}
                        on:click={() => stepHintParadigm(1)}>More</button>
              </div>
            {/if}
          </div>
        {/if}
        <!-- svelte-ignore a11y-autofocus -->
        <button class="btn" autofocus on:click={() => (showHint = false)}>Close</button>
      </div>
    </div>
  </div>
{:else if showHint && hintRefBlocks.length}
  <!-- 5H-SPEC2 3.1: the per-item hintRef resolved to a TEACHING PAGE rather
       than a chart (chapter 8's "Three Uses"). Same modal shell as every other
       Hint route; the topic's own title heads it, so the data does not author
       the heading a second time. -->
  <div class="modal-overlay" on:click|self={() => (showHint = false)} role="presentation">
    <div class="modal hint-modal" role="dialog" aria-modal="true" aria-label="Hint"
         data-hint-page-ref={activeHintRef}>
      <div class="modal-scroll">
        {#if hintRefPage.title}<div class="rc-heading">{hintRefPage.title}</div>{/if}
        <RichContent blocks={hintRefBlocks} />
      </div>
      <div class="modal-actions">
        <!-- svelte-ignore a11y-autofocus -->
        <button class="btn" autofocus on:click={() => (showHint = false)}>Close</button>
      </div>
    </div>
  </div>
{:else if showHint && hintBlocks.length}
  <!-- 5F-FEEDBACK.pdf item 15/16 root cause: this branch used to render a
       bare .card stacked under the drill -- no dim overlay, no Close, easy
       to mistake for a broken "half screen" fragment rather than the
       original's full-screen Hint popup. It now shares the identical modal
       shell as the chart-hint branch above so every Hint route behaves the
       same way regardless of whether the underlying content is a chart or
       prose. -->
  <div class="modal-overlay" on:click|self={() => (showHint = false)} role="presentation">
    <div class="modal hint-modal" role="dialog" aria-modal="true" aria-label="Hint">
      <!-- 5H-SPEC2 2.6 (VERIFY-5H-RESPONSE 5): the hint's own Greek taps. An
           inline hint carries an `audioMap` exactly as a teaching TOPIC does,
           and it is applied the same way — chapter 12's Augment hint prints
           ἐκβάλλω / ἐξεβάλλον / ἀποκτείνω / ἀπέκτεινον in points 3 and 4 and
           each speaks its own clip. The map lists what speaks, so the Greek
           in the rule lines above (the bare ε of the augment rule) stays
           inert, which is the map doing its job rather than an exception. -->
      <div class="modal-scroll">
        <RichContent blocks={hintBlocks} greekTaps={activity.hint?.audioMap || null} />
      </div>
      <div class="modal-actions">
        <!-- svelte-ignore a11y-autofocus -->
        <button class="btn" autofocus on:click={() => (showHint = false)}>Close</button>
      </div>
    </div>
  </div>
{/if}
