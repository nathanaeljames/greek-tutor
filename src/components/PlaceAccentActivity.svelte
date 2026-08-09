<script>
  // Accent Mark Placement Exercise. Each item shows a ROOT word plus its gloss
  // in the header and one UNACCENTED inflected form (breathings retained) in
  // the numbered position row; the learner picks an accent type and the letter
  // it belongs on, then Check Answer. The chapter's own Scripture reference for
  // the form sits by the checkbox row, as in the original.
  //
  // ANSWER POLICY. Check Answer finalizes the item either way and reveals
  // answerForm. The class is `autoBoth` (5E-SPEC3 §1): a correct placement
  // auto-advances on 2000ms like every correct answer in the app (rule B1a), a
  // wrong one auto-advances on the longer wait. AUDIO is `afterGuess` (§2.2) —
  // the word is spoken after the answer and the next word waits for the clip
  // to end. Completion = all items ATTEMPTED. 5E-SPEC2 shipped this as
  // `manualCorrectAutoIncorrect`, waiting for Next on a correct placement;
  // that class is withdrawn (D-28).
  import { onDestroy } from 'svelte';
  import { play, playThrough, stop as stopAudio } from '../lib/audio.js';
  import { randomFeedback } from '../lib/content.js';
  import { analyzeAccent, splitGraphemes } from '../lib/greek.js';
  import { markCompleted } from '../lib/progress.js';
  import { resolveAdvance, waitsForNext } from '../lib/timing.js';
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
  // A7: Pronounce Each defaults ON wherever the checkbox exists.
  let pronounceEach = activity.ui?.defaults?.pronounceEach ?? true;
  let advanceTimer = null;
  let advanceToken = 0;
  let answeredCorrect = false;
  const attemptedWords = new Set();

  $: word = words[wordIndex] || null;
  $: answer = analyzeAccent(word && word.answerForm);
  $: pending = !word || !word.answerForm || !answer.type || answer.position < 0;
  $: hintBlocks = (activity.hint && activity.hint.content) || [];
  $: advancePolicy = resolveAdvance(activity.answerPolicy);
  $: oneAttempt = advancePolicy.oneAttempt;
  $: audioTiming = activity.audioTiming || 'afterGuess';
  $: revealed = answered && oneAttempt;
  // §B4: say so on the outcomes that WAIT. `autoBoth` has none — both paths
  // move by themselves — so this renders nothing today and would start
  // rendering by itself if the class were ever reassigned.
  $: awaitingNext = answered && waitsForNext(advancePolicy, answeredCorrect);
  // ROOT DISPLAY (5B-SPEC4 D2). Every item shows a Greek word in the header --
  // VERIFY3 item 3 found six that showed only a gloss. Those six are the ones
  // whose root IS their answer form (the original's ἄνθρωπος item and the five
  // merged circumflex items), where printing the root prints the accented
  // answer directly above the unaccented slots. Nathanael's call of three
  // options: print it with its ACCENT stripped and its breathings kept, so
  // there is Greek on every item and none of them answers itself.
  $: rootIdentical = !!(word && word.root && word.answerForm)
    && word.root.normalize('NFC') === word.answerForm.normalize('NFC');
  $: rootWord = !word || !word.root ? '' : (rootIdentical ? analyzeAccent(word.root).display : word.root);
  // Live score (C3): reactive so it tracks every answer instead of freezing.
  $: scoreLine = scoreText(attempts, correct);

  // REVISITING A WORD RESETS IT (5D-SPEC2 §3, VERIFY-5D A5). Arriving at a
  // word presents it fresh — mark type and position cleared, feedback cleared,
  // the slots unlocked — even if it was answered on an earlier pass, which is
  // the original's behavior. Attempts already scored stand.
  // showAnswer stays user-controlled; the reveal is derived from `revealed`.
  function restoreWord() {
    accentType = null;
    accentPosition = null;
    feedback = '';
    feedbackKind = '';
    answered = false;
    answeredCorrect = false;
    showAnswer = false;
  }

  // \u00a72.3: Previous/Next stops the clip and shows the word at once. The word is
  // no longer spoken on ARRIVAL \u2014 this exercise is `afterGuess`, so its clip
  // belongs after Check Answer (Pronounce Word remains the on-demand path).
  function move(delta) {
    cancelAdvance();
    stopAudio();
    const nextIndex = Math.max(0, Math.min(words.length - 1, wordIndex + delta));
    if (nextIndex === wordIndex) return;
    wordIndex = nextIndex;
    restoreWord();
  }

  function cancelAdvance() {
    advanceToken += 1;
    clearTimeout(advanceTimer);
    advanceTimer = null;
  }

  // max(class minimum, clip duration) \u2014 \u00a72.2.
  function scheduleAdvance(ms, clip) {
    cancelAdvance();
    const token = advanceToken;
    const minimum = new Promise(resolve => { advanceTimer = setTimeout(resolve, ms); });
    const spoken = clip ? playThrough(clip) : Promise.resolve();
    Promise.all([minimum, spoken]).then(() => { if (token === advanceToken) move(1); });
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
    const clip = (audioTiming === 'afterGuess' && pronounceEach && word.audio) ? word.audio : null;
    if (ok || oneAttempt) {
      answered = true;
      answeredCorrect = ok;
      if (attemptedWords.size === words.length) markCompleted(activity.id);
      if (ok && advancePolicy.autoOnCorrect) scheduleAdvance(advancePolicy.correctMs, clip);
      else if (!ok && advancePolicy.autoOnIncorrect) scheduleAdvance(advancePolicy.incorrectMs, clip);
      else { cancelAdvance(); if (clip) play(clip); }
    } else if (clip) {
      play(clip);
    }
  }

  function scoreText(a, c) {
    if (!a) return chapter.feedback?.scorePrompt || 'Give it a try first';
    return `${c} correct out of ${a} attempts (${Math.round((c / a) * 100)}%)`;
  }

  onDestroy(() => { cancelAdvance(); stopAudio(); });     // §3.1
</script>

<svelte:window on:keydown={showHint ? (e) => { if (e.key === 'Escape') showHint = false; } : null} />

<div class="card accent-activity">
  <!-- The header shows the ROOT an inflected form derives from (Βαπτίζω ->
       βάπτισαι), plus its gloss. Where the root IS the answer form it is
       printed unaccented (see rootWord above), and the label says so rather
       than calling an unaccented string a root. -->
  {#if word && (rootWord || word.rootGloss)}
    <div class="accent-root">
      <div class="label">{rootIdentical ? 'Greek Word (Unaccented)' : (activity.ui?.header || 'Root Greek Word')}</div>
      <div class="accent-root-line">
        <!-- Inert: word.audio (b_ex2_N) belongs to the inflected answerForm,
             not the root, so tapping the root would play the wrong clip. The
             inflected clip stays reachable via Pronounce Each Exercise. -->
        {#if rootWord}<span class="accent-root-word greek">{rootWord}</span>{/if}
        {#if word.rootGloss}<span class="accent-root-gloss">{rootWord ? `(${word.rootGloss})` : word.rootGloss}</span>{/if}
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
    <!-- §B4: the message appears on exactly the outcomes that WAIT. `autoBoth`
         has none, so this renders nothing today. -->
    {#if awaitingNext}<div class="await-next" role="status">Click Next to continue</div>{/if}
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
  <!-- 5F-FEEDBACK.pdf item 15/16 root cause: this used to be a bare .card
       stacked under the activity -- no dim overlay, no Close, indistinguishable
       from a broken layout fragment. Every Hint route now shares the one
       modal shell (SelectActivity, this, DivideActivity). -->
  <div class="modal-overlay" on:click|self={() => (showHint = false)} role="presentation">
    <div class="modal hint-modal" role="dialog" aria-modal="true" aria-label="Hint">
      <div class="modal-scroll">
        <RichContent blocks={hintBlocks} />
      </div>
      <div class="modal-actions">
        <!-- svelte-ignore a11y-autofocus -->
        <button class="btn" autofocus on:click={() => (showHint = false)}>Close</button>
      </div>
    </div>
  </div>
{/if}
