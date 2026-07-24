<script>
  // The scored "workhorse": prompt + full option grid + feedback + score.
  // Covers letter exercises (24-option generator), vocab drills (10 lemmas)
  // and chapter 2's four static-option drills.
  //
  // ANSWER POLICY (5B patch 2a). activity.answerPolicy decides what a tap on an
  // option means:
  //   { attemptsPerItem: 1, autoAdvanceMs: 4000 } — the tap FINALIZES the item
  //     right or wrong, the answer is revealed, and the drill auto-advances
  //     after autoAdvanceMs (cancelled on unmount). Completion = every item
  //     ATTEMPTED, not every item correct.
  //   { attemptsPerItem: "retry" } / absent — the original retry loop: a wrong
  //     tap leaves the item open, only a correct tap advances (chapter 1 and
  //     the Syllable Counting drill).
  import { onDestroy } from 'svelte';
  import { buildSelectQuestions, randomFeedback } from '../lib/content.js';
  import { markClusters } from '../lib/greek.js';
  import { play } from '../lib/audio.js';
  import { markCompleted } from '../lib/progress.js';
  import RichContent from './RichContent.svelte';
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
  let advanceTimer = null;

  init();
  function init() {
    const built = buildSelectQuestions(chapter, activity);
    options = built.options;
    questions = built.questions;
    promptIsGreek = !!built.promptIsGreek;
    optionClass = built.optionClass || '';
    qIndex = 0; attempts = 0; correct = 0;
    feedback = ''; picked = null; answered = false; finished = false;
    clearTimeout(advanceTimer);
    maybePronounce();
  }

  $: current = questions[qIndex];
  $: staticOptions = Array.isArray(activity.optionValues);
  $: wideOptions = !staticOptions || optionClass === 'wide';
  $: showPronounce = !staticOptions || !!activity.ui?.buttons?.includes('Pronounce');
  $: showPronounceEach = !staticOptions || !!activity.ui?.checkboxes?.includes('Pronounce Each Drill');
  $: hintBlocks = (activity.hint && activity.hint.content) || [];
  $: showHintButton = hintBlocks.length > 0;
  // One-attempt drills finalize on the option tap; retry drills keep the loop.
  $: oneAttempt = activity.answerPolicy?.attemptsPerItem === 1;
  $: autoAdvanceMs = activity.answerPolicy?.autoAdvanceMs ?? null;
  // 2c: the original's full-width "only one syllable" bar under the word. In
  // this drill it answers "1" -- the same value as the first number tile.
  $: oneSyllableOption = activity.oneSyllableButton
    ? options.find(option => option.id === '1') || null
    : null;

  // 2e: the mark being asked about is rendered RED -- that IS the question.
  // redMarkCluster is a 1-based grapheme cluster; see markClusters() for why
  // the whole cluster reddens rather than just its diacritic.
  $: redParts = current && current.redMarkCluster
    ? markClusters(current.prompt, current.redMarkCluster)
    : null;

  function maybePronounce() {
    const q = questions[qIndex];
    if (pronounceEach && q && !q.pending && q.promptAudio) play(q.promptAudio);
  }

  function choose(opt) {
    if (answered || finished || current.pending) return;
    picked = opt.id;
    attempts += 1;
    const right = opt.id === current.answerId;
    if (right) correct += 1;
    feedback = randomFeedback(chapter, right ? 'correct' : 'incorrect');
    feedbackKind = right ? 'ok' : 'bad';
    if (right || oneAttempt) {
      // One attempt: the item is done either way and the answer is revealed.
      answered = true;
      clearTimeout(advanceTimer);
      advanceTimer = setTimeout(advance, autoAdvanceMs ?? 900);
    }
  }

  function advance() {
    clearTimeout(advanceTimer);
    if (qIndex < questions.length - 1) {
      qIndex += 1;
      picked = null; answered = false; feedback = ''; feedbackKind = '';
      maybePronounce();
    } else {
      finished = true;
      feedback = '';
      if (activity && activity.id) markCompleted(activity.id);
    }
  }

  function scoreText() {
    if (attempts === 0) return chapter.feedback?.scorePrompt || 'Give it a try first';
    return `${correct} correct out of ${attempts} attempts (${Math.round((correct / attempts) * 100)}%)`;
  }
  function sentenceParts(text, underline) {
    if (!underline) return null;
    const at = text.indexOf(underline);
    if (at === -1) return null;
    return [text.slice(0, at), text.slice(at, at + underline.length), text.slice(at + underline.length)];
  }
  let showScore = false;

  onDestroy(() => clearTimeout(advanceTimer));
</script>

<div class="card">
  {#if finished}
    <div class="scorebox" style="font-size:1.2rem; padding: 20px 0">
      Finished! {scoreText()}
    </div>
    <div class="controls"><button class="btn" on:click={init}>Start Over</button></div>
  {:else if current}
    <!-- Greek-tap rule (P6/P8/P9): a Greek PROMPT with audio pronounces itself
         on tap (blue). The tap never answers, advances, or re-shuffles.
         English prompts stay static; options are answers, never audio taps. -->
    {#if redParts}
      <!-- Still displayed Greek, so still a greek-say tap (directive 9); the
           asked-about mark simply overrides the blue with red. -->
      <button class="prompt greek greek-say red-mark" disabled={!current.promptAudio} on:click={() => current.promptAudio && play(current.promptAudio)}>{#each redParts as part}<span class:mark-red={part.red}>{part.text}</span>{/each}</button>
    {:else if promptIsGreek && current.promptAudio}
      <button class="prompt greek greek-say" on:click={() => play(current.promptAudio)}>{current.prompt}</button>
    {:else if current.underline && sentenceParts(current.prompt, current.underline)}
      {@const parts = sentenceParts(current.prompt, current.underline)}
      <div class="prompt select-sentence">{parts[0]}<u>{parts[1]}</u>{parts[2]}</div>
    {:else}
      <div class="prompt" class:greek={promptIsGreek}>{current.prompt}</div>
    {/if}
    {#if current.pending}
      <div class="pending-verification" role="status">This activity item is pending content verification.</div>
    {:else}
      <!-- Reveal on a finalized item: the gloss, and the properly accented
           form the Accent Rule drill's misaccented prompt should have had. -->
      {#if answered && (current.gloss || current.correctForm)}
        <div class="reveal-row">
          {#if current.gloss}<span class="reveal-gloss">{current.gloss}</span>{/if}
          {#if current.correctForm}<span class="reveal-form greek">{current.correctForm}</span>{/if}
        </div>
      {/if}
      <div class="feedback {feedbackKind}">{feedback}</div>
      <div class="grid options" class:wide={wideOptions} class:single={optionClass === 'single'}>
        {#each options as opt}
          <button
            class="tile small"
            class:greek={activity.options === 'greek' || activity.generator?.options === 'lower'}
            class:selected={staticOptions && picked === opt.id}
            class:correct={answered && opt.id === current.answerId}
            class:incorrect={!staticOptions && picked === opt.id && opt.id !== current.answerId}
            on:click={() => choose(opt)}>
            {opt.label}
          </button>
        {/each}
      </div>
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
    <div class="controls">
      <button class="btn secondary" on:click={() => (showScore = !showScore)}>Score</button>
      {#if showPronounce}
        <button class="btn" disabled={!current.promptAudio} on:click={() => current.promptAudio && play(current.promptAudio)}>Pronounce</button>
      {/if}
      {#if showHintButton}
        <button class="btn secondary" on:click={() => (showHint = !showHint)}>Hint</button>
      {/if}
      {#if showPronounceEach}
        <label style="display:flex; align-items:center; gap:6px; font-size:0.9rem">
          <input type="checkbox" bind:checked={pronounceEach} disabled={!current.promptAudio} /> Pronounce each
        </label>
      {/if}
    </div>
    {#if showScore}<div class="scorebox">{scoreText()}</div>{/if}
    <div class="scorebox" style="font-weight:400; font-size:0.85rem; margin-top:8px">
      {qIndex + 1} of {questions.length}
    </div>
  {/if}
</div>

{#if showHint && hintBlocks.length}
  <div class="card">
    <RichContent blocks={hintBlocks} />
  </div>
{/if}
