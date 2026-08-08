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
  import { authoredOptionSource, buildSelectQuestions, buildTwoStageQuestions, chapterAudioMap, randomFeedback, resolveHintBlocks, resolveHintRef } from '../lib/content.js';
  import { combiningForMarkName, firstAccentCluster, markOverlayParts } from '../lib/greek.js';
  import { play, playThrough, stop as stopAudio } from '../lib/audio.js';
  import { markCompleted } from '../lib/progress.js';
  import { resolveAdvance, waitsForNext } from '../lib/timing.js';
  import RichContent from './RichContent.svelte';
  import Paradigm from './Paradigm.svelte';
  import PronounParadigm from './PronounParadigm.svelte';
  export let chapter;
  export let activity;

  // Form -> clip for chart cells that are not lexicon lemmas (chapter 8's
  // pronoun charts), for the Hint popup.
  $: formAudio = chapterAudioMap(chapter);

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
  // A stage opens only once the stage before it has a pick — the instruction
  // line reads "Click on the person then the case", and that order is what
  // makes the CASE click the committing one however many times the person is
  // changed first.
  const stageOpen = (index, picks) => picks.slice(0, index).every(pick => pick != null);
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
  $: greekOptions = !!activity.optionsAreGreek || activity.options === 'greek' || activity.generator?.options === 'lower';
  // The responsive vocabulary pool (D-19), in either direction. A vocabulary
  // select is the non-generator, non-authored branch in buildSelectQuestions.
  // Explicit pedagogical layouts remain outside this responsive class.
  $: vocabularyPool = !activity.generator && !authoredOptions && !wideOptions
    && optionClass !== 'single'
    && optionClass !== 'paradigm2col';
  // A LONG Greek prompt cannot have the 3rem type a single letter gets. At
  // 320px, πιστεύουσι sets 268px of glyph into 260px of card and the tail is
  // lost in silence (overflow-x is hidden app-wide). Declared here rather than
  // guessed in CSS, which cannot see how long a string is; chapter 1's letter
  // prompts and chapter 2's short words are below the threshold and unchanged.
  $: longPrompt = promptIsGreek && [...String(current?.prompt || '')].length > 7;
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
  $: hintChart = activity.ui?.hintRef ? resolveHintRef(chapter, activity.ui.hintRef) : null;
  $: showHintButton = hintBlocks.length > 0 || !!hintChart;
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

  // §2.9: a stage click. Any stage but the last only RECORDS — no attempt is
  // counted, no feedback appears, nothing advances — so changing the person is
  // free. Filling the last stage completes the pair and commits it, which is
  // where the ordinary scoring path below takes over.
  function chooseStage(index, opt) {
    if (answered || finished || current.pending) return;
    if (!stageOpen(index, stagePicks)) return;
    stagePicks = stagePicks.map((pick, at) => (at === index ? opt.id : (at > index ? null : pick)));
    if (stagePicks.some(pick => pick == null)) return;
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

  $: glossRevealed = !!current && shownReveals.some(field => revealValue(field) === current.gloss);

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
    {:else if promptIsGreek && current.promptAudio}
      <!-- The red-mark branch above deliberately does NOT take this class: its
           mark offsets are em-relative and correct, and nothing about mark
           geometry moves in this round.
           5F §2.7: a two-line Greek prompt is ONE phrase and one clip, so the
           second line lives inside the same tap target. -->
      <button class="prompt greek greek-say" class:long={longPrompt} class:two-line={current.prompt2}
              on:click={() => play(current.promptAudio)}>{current.prompt}{#if current.prompt2}<span class="prompt-line2">{current.prompt2}</span>{/if}</button>
    {:else if current.underline && sentenceParts(current.prompt, current.underline)}
      {@const parts = sentenceParts(current.prompt, current.underline)}
      <div class="prompt select-sentence">{parts[0]}<u>{parts[1]}</u>{parts[2]}</div>
    {:else}
      <div class="prompt" class:greek={promptIsGreek}>{current.prompt}</div>
    {/if}
    <!-- 5F §2.5: the case tag / parse tag / disambiguator beside the prompt,
         in plain ink at a smaller size. NEVER tappable, even when it holds
         Greek — the "(not ἐκ)" pair is the logged exception to directive 9. -->
    {#if current.note}<div class="prompt-note">{current.note}</div>{/if}
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
        <!-- §2.9: one grid per stage, in authored order. A stage that is not
             open yet is visibly inert rather than hidden — the learner has to
             see that the case grid is the SECOND click, which is what the
             instruction line says. Nothing here is judged until the last
             stage is filled; see chooseStage(). -->
        {#each stages as stage, stageIndex}
          {@const open = stageOpen(stageIndex, stagePicks) && !answered}
          {@const correctIds = showAnswerReveal ? stageCorrectIds(stageIndex, current) : null}
          <div class="grid options stage-grid"
               class:paradigm2col={stage.optionClass === 'paradigm2col'}
               class:single={stage.optionClass === 'single'}
               class:stage-locked={!open}
               data-stage={stageIndex} data-stage-label={stage.label}>
            {#each stage.options as opt}
              <button
                class="tile small"
                class:selected={stagePicks[stageIndex] === opt.id}
                class:correct={correctIds && correctIds.has(opt.id)}
                disabled={!open}
                on:click={() => chooseStage(stageIndex, opt)}>
                {opt.label}
              </button>
            {/each}
          </div>
        {/each}
      {:else if optionGroups}
        <!-- Parsing drill: two separated stacks, as the original draws them. -->
        <div class="option-groups">
          {#each optionGroups as group}
            <div class="grid options single option-group">
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
             the original's Pronounce does there. -->
        {@const say = current.promptAudio || current.answerAudio}
        <button class="btn" disabled={!say} on:click={() => say && play(say)}>Pronounce</button>
      {/if}
      {#each orderedRevealControls as control}
        {#if control.kind === 'hint'}
          <button class="btn secondary" on:click={() => (showHint = !showHint)}>Hint</button>
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
    {#if showScore}<div class="scorebox live-score">{scoreLine}</div>{/if}
    <div class="scorebox" style="font-weight:400; font-size:0.85rem; margin-top:8px">
      {qIndex + 1} of {questions.length}
    </div>
  {/if}
</div>

{#if showHint && hintChart}
  <!-- The original's Hint POPUP: the chapter's paradigm chart over the drill. -->
  <div class="modal-overlay" on:click|self={() => (showHint = false)} role="presentation">
    <div class="modal hint-modal" role="dialog" aria-modal="true" aria-label="Hint">
      <div class="modal-scroll">
      {#if hintChart.type === 'pronounParadigm'}
        <PronounParadigm paradigm={hintChart} audioMap={formAudio} title={hintChart.title || null} />
      {:else}
        <Paradigm paradigm={hintChart} title={hintChart.title || hintChart.charts?.[0]?.title || null} />
      {/if}
      </div>
      <div class="modal-actions">
        <!-- svelte-ignore a11y-autofocus -->
        <button class="btn" autofocus on:click={() => (showHint = false)}>Close</button>
      </div>
    </div>
  </div>
{:else if showHint && hintBlocks.length}
  <div class="card">
    <RichContent blocks={hintBlocks} />
  </div>
{/if}
