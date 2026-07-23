<script>
  import { onDestroy } from 'svelte';
  import { play } from '../lib/audio.js';
  import { getLemma, randomFeedback } from '../lib/content.js';
  import { analyzeAccent, splitGraphemes } from '../lib/greek.js';
  import { markCompleted } from '../lib/progress.js';

  export let chapter;
  export let activity;

  const words = (activity.items || []).map(item => {
    const lemma = getLemma(item.ref, chapter.id, item.pool) || {};
    return { ...item, audio: item.audio || lemma.audio || null };
  });
  let wordIndex = 0;
  let accentType = null;
  let accentPosition = null;
  let attempts = 0;
  let correct = 0;
  let feedback = '';
  let feedbackKind = '';
  let answered = false;
  let showAnswer = false;
  let showScore = false;
  let pronounceEach = false;
  let advanceTimer = null;
  const completedWords = new Set();

  $: word = words[wordIndex] || null;
  $: answer = analyzeAccent(word && word.answerForm);
  $: pending = !word || !word.answerForm || !answer.type || answer.position < 0;

  function resetWord() {
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
    resetWord();
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
    if (ok) {
      correct += 1;
      completedWords.add(wordIndex);
      feedback = randomFeedback(chapter, 'correct');
      feedbackKind = 'ok';
      answered = true;
      if (completedWords.size === words.length) markCompleted(activity.id);
      clearTimeout(advanceTimer);
      advanceTimer = setTimeout(() => move(1), 900);
    } else {
      feedback = randomFeedback(chapter, 'incorrect');
      feedbackKind = 'bad';
    }
  }

  function scoreText() {
    if (!attempts) return chapter.feedback?.scorePrompt || 'Give it a try first';
    return `${correct} correct out of ${attempts} attempts (${Math.round((correct / attempts) * 100)}%)`;
  }

  onDestroy(() => clearTimeout(advanceTimer));
</script>

<div class="card accent-activity">
  {#if pending}
    <div class="pending-verification" role="status">Accent-placement word {wordIndex + 1} is pending content verification.</div>
  {:else}
    <div class="accent-types" aria-label="Choose accent type">
      {#each activity.accentTypes || [] as type}
        <button class="chip" class:active={accentType === type} aria-pressed={accentType === type} on:click={() => { accentType = type; feedback = ''; }}>{type}</button>
      {/each}
    </div>
    <div class="accent-slots" aria-label="Choose accent position">
      {#each answer.displayClusters as letter, index}
        <button class="accent-slot greek" class:selected={accentPosition === index} aria-pressed={accentPosition === index} on:click={() => { accentPosition = index; feedback = ''; }}>
          <span>{letter}</span><small>{index + 1}</small>
        </button>
      {/each}
    </div>
    <div class="feedback {feedbackKind}">{feedback}</div>
    {#if showAnswer}
      <div class="exercise-answer"><span>Answer</span><span class="greek">{word.answerForm}</span></div>
    {/if}
  {/if}

  <div class="controls">
    <button class="btn" disabled={!word?.audio} on:click={() => word?.audio && play(word.audio)}>Pronounce</button>
    <button class="btn secondary" disabled={wordIndex <= 0} on:click={() => move(-1)}>Previous</button>
    <button class="btn secondary" on:click={() => (showScore = !showScore)}>Score</button>
    <button class="btn secondary" disabled={wordIndex >= words.length - 1} on:click={() => move(1)}>Next</button>
    <button class="btn" disabled={pending || answered || accentType == null || accentPosition == null} on:click={check}>Check Answer</button>
  </div>
  <div class="exercise-checks">
    <label><input type="checkbox" bind:checked={showAnswer} disabled={pending} /> Show Answer</label>
    <label><input type="checkbox" bind:checked={pronounceEach} disabled={!word?.audio} /> Pronounce Each Exercise</label>
  </div>
  <div class="scorebox exercise-count">{wordIndex + 1} of {words.length}</div>
  {#if showScore}<div class="scorebox">{scoreText()}</div>{/if}
</div>
