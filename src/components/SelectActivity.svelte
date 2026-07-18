<script>
  // The scored "workhorse": prompt + full option grid + feedback + score.
  // Covers letter exercises (24-option generator) and vocab drills (10 lemmas).
  import { buildSelectQuestions, randomFeedback } from '../lib/content.js';
  import { play } from '../lib/audio.js';
  import { markCompleted } from '../lib/progress.js';
  export let chapter;
  export let activity;

  let options = [];
  let questions = [];
  let promptIsGreek = false;   // generator-declared (P6-P9): Greek prompts are tappable
  let qIndex = 0;
  let attempts = 0;
  let correct = 0;
  let feedback = '';
  let feedbackKind = '';
  let picked = null;          // option id last clicked
  let answered = false;       // current question resolved
  let pronounceEach = true;
  let finished = false;

  init();
  function init() {
    const built = buildSelectQuestions(chapter, activity);
    options = built.options;
    questions = built.questions;
    promptIsGreek = !!built.promptIsGreek;
    qIndex = 0; attempts = 0; correct = 0;
    feedback = ''; picked = null; answered = false; finished = false;
    maybePronounce();
  }

  $: current = questions[qIndex];

  function maybePronounce() {
    const q = questions[qIndex];
    if (pronounceEach && q && q.promptAudio) play(q.promptAudio);
  }

  function choose(opt) {
    if (answered || finished) return;
    picked = opt.id;
    attempts += 1;
    if (opt.id === current.answerId) {
      correct += 1;
      feedback = randomFeedback(chapter, 'correct');
      feedbackKind = 'ok';
      answered = true;
      setTimeout(advance, 900);
    } else {
      feedback = randomFeedback(chapter, 'incorrect');
      feedbackKind = 'bad';
    }
  }

  function advance() {
    if (qIndex < questions.length - 1) {
      qIndex += 1;
      picked = null; answered = false; feedback = '';
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
  let showScore = false;
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
    {#if promptIsGreek && current.promptAudio}
      <button class="prompt greek greek-say" on:click={() => play(current.promptAudio)}>{current.prompt}</button>
    {:else}
      <div class="prompt greek">{current.prompt}</div>
    {/if}
    <div class="feedback {feedbackKind}">{feedback}</div>
    <div class="grid options wide">
      {#each options as opt}
        <button
          class="tile small"
          class:greek={activity.options === 'greek' || activity.generator?.options === 'lower'}
          class:correct={answered && opt.id === current.answerId}
          class:incorrect={picked === opt.id && opt.id !== current.answerId}
          on:click={() => choose(opt)}>
          {opt.label}
        </button>
      {/each}
    </div>
    <div class="controls">
      <button class="btn secondary" on:click={() => (showScore = !showScore)}>Score</button>
      <button class="btn" on:click={() => current.promptAudio && play(current.promptAudio)}>Pronounce</button>
      <label style="display:flex; align-items:center; gap:6px; font-size:0.9rem">
        <input type="checkbox" bind:checked={pronounceEach} /> Pronounce each
      </label>
    </div>
    {#if showScore}<div class="scorebox">{scoreText()}</div>{/if}
    <div class="scorebox" style="font-weight:400; font-size:0.85rem; margin-top:8px">
      {qIndex + 1} of {questions.length}
    </div>
  {/if}
</div>
