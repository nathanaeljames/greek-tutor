<script>
  // Accent Mark Placement Exercise. Each item shows a ROOT word plus its gloss
  // in the header and one UNACCENTED inflected form (breathings retained) in
  // the numbered position row; the learner picks an accent type and the letter
  // it belongs on, then Check Answer. The chapter's own Scripture reference for
  // the form sits by the checkbox row, as in the original.
  //
  // ANSWER POLICY (5B patch 2a): attemptsPerItem === 1 finalizes on Check
  // Answer either way, reveals answerForm, and auto-advances after
  // autoAdvanceMs; the timer is cancelled on manual Previous/Next and unmount.
  // Completion = all items ATTEMPTED.
  import { onDestroy } from 'svelte';
  import { play } from '../lib/audio.js';
  import { randomFeedback } from '../lib/content.js';
  import { analyzeAccent, splitGraphemes } from '../lib/greek.js';
  import { markCompleted } from '../lib/progress.js';
  import RichContent from './RichContent.svelte';

  export let chapter;
  export let activity;

  // POOL (5B-SPEC3 A1/item 7): the five circumflex extension items are now
  // MERGED and interleaved into the authored pool at fixed positions, with no
  // banner -- a labelled block at the end made every extension item deducibly
  // a circumflex. The items carry `extended: true` for provenance only; it is
  // never rendered and never affects scoring, and completion is all 25.
  const words = activity.items || [];
  let wordIndex = 0;
  let accentType = null;
  let accentPosition = null;
  let attempts = 0;
  let correct = 0;
  let feedback = '';
  let feedbackKind = '';
  let answered = false;
  let showAnswer = false;
  let showHint = false;
  // D1: hidden until the first Score press; ui.liveScore governs whether the
  // revealed line keeps updating, not whether it starts open.
  let showScore = false;
  let pronounceEach = activity.ui?.defaults?.pronounceEach ?? false;
  let advanceTimer = null;
  const attemptedWords = new Set();
  const results = new Map();

  $: word = words[wordIndex] || null;
  $: answer = analyzeAccent(word && word.answerForm);
  $: pending = !word || !word.answerForm || !answer.type || answer.position < 0;
  $: hintBlocks = (activity.hint && activity.hint.content) || [];
  $: oneAttempt = activity.answerPolicy?.attemptsPerItem === 1;
  $: autoAdvanceMs = activity.answerPolicy?.autoAdvanceMs ?? 900;
  $: revealed = answered && oneAttempt;
  // A root identical to the answer form would print the answer above the slots.
  $: showRootWord = !!(word && word.root)
    && (!word.answerForm || word.root.normalize('NFC') !== word.answerForm.normalize('NFC'));
  // Live score (C3): reactive so it tracks every answer instead of freezing.
  $: scoreLine = scoreText(attempts, correct);

  // Under attemptsPerItem: 1 a finalized word stays finalized on revisit --
  // reopening it would let a wrong answer be retried and re-count attempts.
  // showAnswer stays user-controlled; the reveal is derived from `revealed`.
  function restoreWord() {
    const result = results.get(wordIndex);
    if (result) {
      accentType = result.accentType;
      accentPosition = result.accentPosition;
      feedback = result.feedback;
      feedbackKind = result.feedbackKind;
      answered = true;
      return;
    }
    accentType = null;
    accentPosition = null;
    feedback = '';
    feedbackKind = '';
    answered = false;
    showAnswer = false;
  }

  function move(delta) {
    clearTimeout(advanceTimer);
    const nextIndex = Math.max(0, Math.min(words.length - 1, wordIndex + delta));
    if (nextIndex === wordIndex) return;
    wordIndex = nextIndex;
    restoreWord();
    const nextWord = words[wordIndex];
    if (pronounceEach && nextWord && nextWord.audio) play(nextWord.audio);
  }

  function check() {
    if (pending || answered || accentType == null || accentPosition == null) return;
    const ACCENTS = { Acute: '\u0301', Grave: '\u0300', Circumflex: '\u0342' };
    const clusters = splitGraphemes(answer.display);
    clusters[accentPosition] = (clusters[accentPosition] + ACCENTS[accentType]).normalize('NFC');
    const candidate = clusters.join('').normalize('NFC');
    const ok = candidate === word.answerForm.normalize('NFC');
    attempts += 1;
    attemptedWords.add(wordIndex);
    if (ok) correct += 1;
    feedback = randomFeedback(chapter, ok ? 'correct' : 'incorrect');
    feedbackKind = ok ? 'ok' : 'bad';
    if (ok || oneAttempt) {
      answered = true;
      if (attemptedWords.size === words.length) markCompleted(activity.id);
      results.set(wordIndex, {
        accentType,
        accentPosition,
        feedback,
        feedbackKind,
        correct: ok
      });
      clearTimeout(advanceTimer);
      advanceTimer = setTimeout(() => move(1), autoAdvanceMs);
    }
  }

  function scoreText(a, c) {
    if (!a) return chapter.feedback?.scorePrompt || 'Give it a try first';
    return `${c} correct out of ${a} attempts (${Math.round((c / a) * 100)}%)`;
  }

  onDestroy(() => clearTimeout(advanceTimer));
</script>

<div class="card accent-activity">
  <!-- The header exists to show the ROOT an inflected form derives from
       (Βαπτίζω -> βάπτισαι). On the merged circumflex items the root IS the
       answer form, so printing it accented would show the learner both the
       accent type and its position before they choose. Those items show the
       gloss alone -- which is also what keeps them indistinguishable from the
       original twenty now that the banner is gone. -->
  {#if word && (showRootWord || word.rootGloss)}
    <div class="accent-root">
      <div class="label">{showRootWord ? (activity.ui?.header || 'Root Greek Word') : 'Word Meaning'}</div>
      <div class="accent-root-line">
        <!-- Inert: word.audio (b_ex2_N) belongs to the inflected answerForm,
             not the root, so tapping the root would play the wrong clip. The
             inflected clip stays reachable via Pronounce Each Exercise. -->
        {#if showRootWord}<span class="accent-root-word greek">{word.root}</span>{/if}
        {#if word.rootGloss}<span class="accent-root-gloss">{showRootWord ? `(${word.rootGloss})` : word.rootGloss}</span>{/if}
      </div>
    </div>
  {/if}

  {#if pending}
    <div class="pending-verification" role="status">Accent-placement word {wordIndex + 1} is pending content verification.</div>
  {:else}
    <div class="accent-types" aria-label="Choose accent type">
      {#each activity.accentTypes || [] as type}
        <button class="chip"
          class:selected={accentType === type}
          class:correct={revealed && answer.type === type}
          aria-pressed={accentType === type}
          on:click={() => { if (!answered) { accentType = type; feedback = ''; } }}>{type}</button>
      {/each}
    </div>
    <div
      class="accent-slots"
      style={`--accent-size:${Math.max(14, Math.min(24, 230 / Math.max(answer.displayClusters.length, 1)))}px`}
      aria-label="Choose accent position">
      {#each answer.displayClusters as letter, index}
        <button class="accent-slot greek"
          class:selected={accentPosition === index}
          class:correct={revealed && answer.position === index}
          aria-pressed={accentPosition === index}
          on:click={() => { if (!answered) { accentPosition = index; feedback = ''; } }}>
          <span>{letter}</span><small>{index + 1}</small>
        </button>
      {/each}
    </div>
    <div class="feedback {feedbackKind}">{feedback}</div>
    {#if showAnswer || revealed}
      <div class="exercise-answer"><span>Answer</span><span class="greek">{word.answerForm}</span></div>
    {/if}
  {/if}

  <div class="controls grouped">
    <button class="btn" disabled={pending || answered || accentType == null || accentPosition == null} on:click={check}>Check Answer</button>
    <!-- V3 resolved: "Pronounce Word" speaks the CURRENT item's clip -- the
         same clip Pronounce Each plays. There is no separate root recording. -->
    <button class="btn" disabled={!word?.audio} on:click={() => word?.audio && play(word.audio)}>Pronounce Word</button>
    <button class="btn secondary" disabled={wordIndex <= 0} on:click={() => move(-1)}>Previous</button>
    <button class="btn secondary" disabled={wordIndex >= words.length - 1} on:click={() => move(1)}>Next</button>
    {#if hintBlocks.length}
      <button class="btn secondary" on:click={() => (showHint = !showHint)}>{activity.hint?.label || 'Hint'}</button>
    {/if}
    <button class="btn secondary" on:click={() => (showScore = !showScore)}>Score</button>
  </div>
  <div class="exercise-checks">
    <label><input type="checkbox" bind:checked={showAnswer} disabled={pending} /> Show Answer</label>
    <label><input type="checkbox" bind:checked={pronounceEach} /> Pronounce Each Exercise</label>
    {#if word?.ref}<span class="exercise-ref">{word.ref}</span>{/if}
  </div>
  {#if showScore}<div class="scorebox live-score">{scoreLine}</div>{/if}
  <div class="scorebox exercise-count">{wordIndex + 1} of {words.length}</div>
</div>

{#if showHint && hintBlocks.length}
  <div class="card">
    <RichContent blocks={hintBlocks} />
  </div>
{/if}
