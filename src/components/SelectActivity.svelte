<script>
  // The scored "workhorse": prompt + full option grid + feedback + score.
  // Covers letter exercises (24-option generator), vocab drills (10 lemmas)
  // and chapter 2's four static-option drills.
  //
  // ANSWER POLICY. activity.answerPolicy declares WHAT a tap on an option
  // means; src/lib/timing.js decides how long anything waits (D-14 — no
  // timing number lives in this file). The three classes:
  //   retry              a wrong tap leaves the item open; only a correct tap
  //                      advances (chapter 1, Syllable Counting).
  //   manualOnIncorrect  one attempt; correct auto-advances, incorrect reveals
  //                      the answer, LOCKS the options and waits for Next
  //                      (ch2 Accent Rule, ch3's five drills).
  //   autoBoth           one attempt; both outcomes auto-advance, incorrect on
  //                      the longer wait (ch3 Scripture Memory Drill).
  // Chapter 2's older attemptsPerItem/autoAdvanceOnIncorrect fields map onto
  // the same three classes; its durations now come from the shared constants.
  // Completion: one-attempt drills complete on all-ATTEMPTED, retry drills on
  // all-correct.
  //
  // CONTROLS come from activity.ui.buttons, so each drill shows exactly the
  // original's button block (Previous / Next / Pronounce / Translate / Hint /
  // Score); chapter 1's two-button drills are unaffected.
  import { onDestroy } from 'svelte';
  import { buildSelectQuestions, randomFeedback, resolveHintBlocks, resolveHintRef } from '../lib/content.js';
  import { combiningForMarkName, firstAccentCluster, markOverlayParts } from '../lib/greek.js';
  import { play } from '../lib/audio.js';
  import { markCompleted } from '../lib/progress.js';
  import { resolveAdvance } from '../lib/timing.js';
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
  let showGloss = false;
  let showScore = false;
  let advanceTimer = null;
  const attemptedItems = new Set();

  init();
  function init() {
    const built = buildSelectQuestions(chapter, activity);
    options = built.options;
    questions = built.questions;
    promptIsGreek = !!built.promptIsGreek;
    optionClass = built.optionClass || '';
    qIndex = 0; attempts = 0; correct = 0;
    feedback = ''; picked = null; answered = false; finished = false;
    showGloss = false;
    attemptedItems.clear();
    pronounceEach = activity.ui?.defaults?.pronounceEach ?? true;
    // D1: the score line starts HIDDEN on every scored surface. ui.liveScore
    // says the line updates live once revealed, not that it opens by itself --
    // Score is what reveals it, as in the original, and toggles it after.
    showScore = false;
    clearTimeout(advanceTimer);
    maybePronounce();
  }

  $: current = questions[qIndex];
  // An item may carry its OWN option set (5D: the six verb-family
  // translations, the three Greek forms) — item-level first, activity-level
  // as the fallback.
  $: currentOptions = (current && current.options) || options;
  $: authoredOptions = !!activity.optionsPerItem || Array.isArray(activity.optionValues);
  // Four-up unless the labels are GREEK WORDS. The English-to-Greek vocabulary
  // drills put ten polytonic words in a four-column grid, which needs ~33px
  // more than a 320px screen has; overflow-x is hidden app-wide, so the ends
  // of the longest words were being cut off in silence rather than wrapping
  // (measured on ch1, ch2 and ch3 — it predates this cohort and the same
  // expression is in the shipped build). The 24-letter grids keep their four
  // columns because their generator declares optionClass 'wide' explicitly:
  // single glyphs, no width problem.
  $: wideOptions = optionClass === 'wide' || (!authoredOptions && !greekOptions);
  // optionGroups ([3,3]) splits the option list into visually separated
  // stacks, as the original's Parsing drill does. Groups stack vertically at
  // phone width and sit side by side once there is room (the six full parsing
  // labels are 46 characters — two columns inside 320px would be unreadable).
  $: optionGroups = optionClass === 'grouped' ? sliceGroups(currentOptions, activity.optionGroups) : null;
  $: greekOptions = !!activity.optionsAreGreek || activity.options === 'greek' || activity.generator?.options === 'lower';
  // The two-up Greek pool (D-19): the ch1/ch2/ch3 English-to-Greek vocabulary
  // grids. Four-up from the iPad breakpoint, where the width exists — the CSS
  // owns the breakpoint, this only says which grid it applies to. Excludes the
  // single-column and grouped layouts, which are stacked for label length.
  $: greekPool = greekOptions && !wideOptions && optionClass !== 'single';
  // A LONG Greek prompt cannot have the 3rem type a single letter gets. At
  // 320px, πιστεύουσι sets 268px of glyph into 260px of card and the tail is
  // lost in silence (overflow-x is hidden app-wide). Declared here rather than
  // guessed in CSS, which cannot see how long a string is; chapter 1's letter
  // prompts and chapter 2's short words are below the threshold and unchanged.
  $: longPrompt = promptIsGreek && [...String(current?.prompt || '')].length > 7;
  $: uiButtons = activity.ui?.buttons || [];
  $: showPronounce = !authoredOptions || uiButtons.includes('Pronounce');
  $: showStepper = uiButtons.includes('Previous') || uiButtons.includes('Next');
  $: showTranslate = uiButtons.includes('Translate');
  $: showPronounceEach = !authoredOptions || !!activity.ui?.checkboxes?.includes('Pronounce Each Drill');
  // A hint either carries its own blocks (chapter 2's inline charts, rendered
  // below the card) or NAMES a chart the chapter already draws — chapter 3's
  // three verb drills all open the λύω paradigm, which the original shows as a
  // popup, so a hintRef opens a modal.
  $: hintBlocks = resolveHintBlocks(chapter, activity.hint);
  $: hintChart = activity.ui?.hintRef ? resolveHintRef(chapter, activity.ui.hintRef) : null;
  $: showHintButton = hintBlocks.length > 0 || !!hintChart;
  // Grouped button block (the original stacks them two-up) once there are more
  // than the chapter-1 pair.
  $: groupedControls = 1 + (showPronounce ? 1 : 0) + (showStepper ? 2 : 0)
    + (showTranslate ? 1 : 0) + (showHintButton ? 1 : 0) > 3;
  // Timing and advance semantics: declared by the data, resolved centrally.
  $: advancePolicy = resolveAdvance(activity.answerPolicy);
  $: oneAttempt = advancePolicy.oneAttempt;
  // The "Click Next to continue" state: the item is final, wrong, and nothing
  // is going to move on its own.
  $: waitingForNext = answered && oneAttempt && !advancePolicy.autoOnIncorrect
    && picked !== null && picked !== current?.answerId;

  function sliceGroups(list, sizes) {
    const groups = [];
    let at = 0;
    for (const size of sizes || []) { groups.push(list.slice(at, at + size)); at += size; }
    if (at < list.length) groups.push(list.slice(at));   // never drop an option
    return groups;
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
    // Prompt audio only. A drill whose ANSWER is the Greek (Greek Verb Drill)
    // has no prompt clip, and speaking the answer here would hand it over.
    if (pronounceEach && q && !q.pending && q.promptAudio) play(q.promptAudio);
  }

  function choose(opt) {
    if (answered || finished || current.pending) return;
    picked = opt.id;
    attempts += 1;
    attemptedItems.add(qIndex);
    const right = opt.id === current.answerId;
    if (right) correct += 1;
    feedback = randomFeedback(chapter, right ? 'correct' : 'incorrect');
    feedbackKind = right ? 'ok' : 'bad';
    // English-prompt / Greek-answer drills speak the answer once it is won.
    if (right && pronounceEach && current.answerAudio) play(current.answerAudio);
    if (right || oneAttempt) {
      // One attempt: the item is done either way and the answer is revealed.
      // "One attempt" is scoped to this VISIT — coming back to the item
      // reopens it (see restore()).
      answered = true;
      // Completion is defined by attempted items, so record the final item when
      // it is ANSWERED. Route exit cancels the timer, not progress.
      if (oneAttempt && attemptedItems.size === questions.length && activity.id) markCompleted(activity.id);
      clearTimeout(advanceTimer);
      if (right) advanceTimer = setTimeout(advance, advancePolicy.correctMs);
      else if (advancePolicy.autoOnIncorrect) advanceTimer = setTimeout(advance, advancePolicy.incorrectMs);
      // manualOnIncorrect: nothing is scheduled — the options are locked and
      // the learner reads the revealed answer until they press Next.
    }
  }

  function advance() {
    clearTimeout(advanceTimer);
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
    showGloss = false;
    picked = null; answered = false; feedback = ''; feedbackKind = '';
  }

  function move(delta) {
    clearTimeout(advanceTimer);
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

  onDestroy(() => clearTimeout(advanceTimer));
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
           geometry moves in this round. -->
      <button class="prompt greek greek-say" class:long={longPrompt} on:click={() => play(current.promptAudio)}>{current.prompt}</button>
    {:else if current.underline && sentenceParts(current.prompt, current.underline)}
      {@const parts = sentenceParts(current.prompt, current.underline)}
      <div class="prompt select-sentence">{parts[0]}<u>{parts[1]}</u>{parts[2]}</div>
    {:else}
      <div class="prompt" class:greek={promptIsGreek}>{current.prompt}</div>
    {/if}
    <!-- The scripture citation the original prints beside the drill word. -->
    {#if current.citation}<div class="prompt-citation">{current.citation}</div>{/if}
    {#if current.pending}
      <div class="pending-verification" role="status">This activity item is pending content verification.</div>
    {:else}
      <!-- Translate: the original's gloss line under the word, on demand. -->
      {#if showGloss && (current.translate || current.gloss)}<div class="gloss-line">{current.translate || current.gloss}</div>{/if}
      <!-- Reveal on a finalized item: the gloss, and the properly accented
           form the Accent Rule drill's misaccented prompt should have had. -->
      {#if answered && (current.gloss || current.correctForm)}
        <div class="reveal-row">
          {#if current.gloss && !showGloss}<span class="reveal-gloss">{current.gloss}</span>{/if}
          {#if current.correctForm}<span class="reveal-form greek">{current.correctForm}</span>{/if}
        </div>
      {/if}
      <div class="feedback {feedbackKind}">{feedback}</div>
      {#if optionGroups}
        <!-- Parsing drill: two separated stacks, as the original draws them. -->
        <div class="option-groups">
          {#each optionGroups as group}
            <div class="grid options single option-group">
              {#each group as opt}
                <button
                  class="tile small"
                  class:greek={greekOptions}
                  class:selected={authoredOptions && picked === opt.id}
                  class:correct={answered && opt.id === current.answerId}
                  class:incorrect={!authoredOptions && picked === opt.id && opt.id !== current.answerId}
                  on:click={() => choose(opt)}>
                  {opt.label}
                </button>
              {/each}
            </div>
          {/each}
        </div>
      {:else}
        <div class="grid options" class:wide={wideOptions} class:single={optionClass === 'single'} class:greek-pool={greekPool}>
          {#each currentOptions as opt}
            <button
              class="tile small"
              class:greek={greekOptions}
              class:selected={authoredOptions && picked === opt.id}
              class:correct={answered && opt.id === current.answerId}
              class:incorrect={!authoredOptions && picked === opt.id && opt.id !== current.answerId}
              on:click={() => choose(opt)}>
              {opt.label}
            </button>
          {/each}
        </div>
      {/if}
      <!-- One attempt, wrong, nothing auto-advancing: say so rather than
           leaving a locked grid with no explanation (advanceClass
           manualOnIncorrect). The sequential rail's Next works too. -->
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
      {#if showTranslate}
        <button class="btn secondary" disabled={!(current.translate || current.gloss)} on:click={() => (showGloss = !showGloss)}>Translate</button>
      {/if}
      {#if showHintButton}
        <button class="btn secondary" on:click={() => (showHint = !showHint)}>Hint</button>
      {/if}
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
      <Paradigm paradigm={hintChart} title={hintChart.title} />
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
