<script>
  import { onDestroy } from 'svelte';
  import { play } from '../lib/audio.js';
  import { randomFeedback } from '../lib/content.js';
  import { dividedForm, splitGraphemes } from '../lib/greek.js';
  import { markCompleted } from '../lib/progress.js';
  import RichContent from './RichContent.svelte';

  export let chapter;
  export let activity;

  const items = activity.items || [];
  let itemIndex = 0;
  let selected = new Set();
  let attempts = 0;
  let correct = 0;
  let feedback = '';
  let feedbackKind = '';
  let answered = false;
  let showAnswer = false;
  let showHint = false;
  let showScore = false;
  let pronounceEach = false;
  let advanceTimer = null;
  const completedItems = new Set();

  $: item = items[itemIndex] || null;
  $: letters = splitGraphemes(item && item.greek);
  $: pending = !item || !item.greek || !Array.isArray(item.division);
  $: hintBlocks = resolveHintBlocks(chapter, activity.hint);

  function resolveHintBlocks(ch, hint) {
    if (!hint) return [];
    if (Array.isArray(hint.content)) return hint.content;
    if (!hint.contentRef) return [];
    const toRef = text => (text || '').replace(/[^A-Za-z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^[A-Z]/, c => c.toLowerCase());
    for (const section of ['learn', 'drill', 'exercise', 'quickReview']) {
      for (const candidate of ch[section] || []) {
        const blocks = candidate.content || [];
        if (blocks.some(block => block.type === 'heading' && toRef(block.text) === hint.contentRef)) return blocks;
      }
    }
    return [];
  }

  function toggleGap(gap) {
    const next = new Set(selected);
    if (next.has(gap)) next.delete(gap);
    else next.add(gap);
    selected = next;
    feedback = '';
  }

  function sameGaps(answer) {
    if (selected.size !== answer.length) return false;
    return answer.every(gap => selected.has(gap));
  }

  function check() {
    if (pending || answered) return;
    attempts += 1;
    if (sameGaps(item.division)) {
      correct += 1;
      completedItems.add(itemIndex);
      feedback = randomFeedback(chapter, 'correct');
      feedbackKind = 'ok';
      answered = true;
      if (completedItems.size === items.length) markCompleted(activity.id);
      clearTimeout(advanceTimer);
      advanceTimer = setTimeout(() => move(1), 900);
    } else {
      feedback = randomFeedback(chapter, 'incorrect');
      feedbackKind = 'bad';
    }
  }

  function resetItem() {
    selected = new Set();
    feedback = '';
    feedbackKind = '';
    answered = false;
    showAnswer = false;
  }

  function move(delta) {
    clearTimeout(advanceTimer);
    const nextIndex = Math.max(0, Math.min(items.length - 1, itemIndex + delta));
    if (nextIndex === itemIndex) return;
    itemIndex = nextIndex;
    resetItem();
    const nextItem = items[itemIndex];
    if (pronounceEach && nextItem && nextItem.audio) play(nextItem.audio);
  }

  function scoreText() {
    if (!attempts) return chapter.feedback?.scorePrompt || 'Give it a try first';
    return `${correct} correct out of ${attempts} attempts (${Math.round((correct / attempts) * 100)}%)`;
  }

  onDestroy(() => clearTimeout(advanceTimer));
</script>

<div class="card divide-activity">
  {#if pending}
    <div class="pending-verification" role="status">Syllable-division word {itemIndex + 1} is pending content verification.</div>
  {:else}
    <div class="divide-word" style={`--divide-size:${Math.max(13, Math.min(32, 240 / Math.max(letters.length + (letters.length - 1) * 0.55, 1)))}px`} aria-label="Choose syllable division gaps">
      {#each letters as letter, index}
        {#if item.audio}
          <button class="divide-letter greek greek-say" aria-label="Pronounce word" on:click={() => play(item.audio)}>{letter}</button>
        {:else}
          <span class="divide-letter greek">{letter}</span>
        {/if}
        {#if index < letters.length - 1}
          <button class="divide-gap" class:selected={selected.has(index + 1)} aria-pressed={selected.has(index + 1)} on:click={() => toggleGap(index + 1)}>
            <span>{index + 1}</span>
          </button>
        {/if}
      {/each}
    </div>
    <div class="feedback {feedbackKind}">{feedback}</div>
    {#if showAnswer}
      <div class="exercise-answer"><span>Answer</span><span class="greek">{dividedForm(item.greek, item.division)}</span></div>
    {/if}
  {/if}

  <div class="controls">
    <button class="btn" disabled={!item?.audio} on:click={() => item?.audio && play(item.audio)}>Pronounce</button>
    <button class="btn secondary" disabled={itemIndex <= 0} on:click={() => move(-1)}>Previous</button>
    <button class="btn secondary" on:click={() => (showScore = !showScore)}>Score</button>
    <button class="btn secondary" disabled={itemIndex >= items.length - 1} on:click={() => move(1)}>Next</button>
    <button class="btn" disabled={pending || answered || !selected.size} on:click={check}>Check Answer</button>
    <button class="btn secondary" on:click={() => (showHint = !showHint)}>{activity.hint?.label || 'Hint'}</button>
  </div>
  <div class="exercise-checks">
    <label><input type="checkbox" bind:checked={showAnswer} disabled={pending} /> Show Answer</label>
    <label><input type="checkbox" bind:checked={pronounceEach} disabled={!item?.audio} /> Pronounce Each Exercise</label>
  </div>
  <div class="scorebox exercise-count">{itemIndex + 1} of {items.length}</div>
  {#if showScore}<div class="scorebox">{scoreText()}</div>{/if}
</div>

{#if showHint}
  <div class="card">
    {#if hintBlocks.length}
      <RichContent blocks={hintBlocks} />
    {:else}
      <div class="pending-verification">Hint content pending verification.</div>
    {/if}
  </div>
{/if}
