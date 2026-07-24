<script>
  // Syllable Division Exercise: tap the numbered gaps between letters where
  // the word breaks into syllables, then Check Answer.
  //
  // ANSWER POLICY (5B patch 2a): answerPolicy.attemptsPerItem === 1 means
  // Check Answer finalizes the item right or wrong, reveals the hyphen-joined
  // divided form, and auto-advances after autoAdvanceMs. The timer is cancelled
  // on manual Previous/Next and on unmount. Completion = all items ATTEMPTED.
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
  let oneSyllable = false;
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
  const attemptedItems = new Set();
  const results = new Map();

  $: item = items[itemIndex] || null;
  $: letters = splitGraphemes(item && item.greek);
  $: pending = !item || !item.greek || !Array.isArray(item.division);
  $: hintBlocks = resolveHintBlocks(chapter, activity.hint);
  $: oneAttempt = activity.answerPolicy?.attemptsPerItem === 1;
  $: autoAdvanceMs = activity.answerPolicy?.autoAdvanceMs ?? 900;
  $: revealed = answered && oneAttempt;

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
    if (answered) return;
    oneSyllable = false;
    const next = new Set(selected);
    if (next.has(gap)) next.delete(gap);
    else next.add(gap);
    selected = next;
    feedback = '';
  }

  // 2c: the one-syllable bar clears and locks the gap selections; the answer
  // it submits is the empty division (kai is the pool's only one-syllable word).
  function toggleOneSyllable() {
    if (answered) return;
    oneSyllable = !oneSyllable;
    if (oneSyllable) selected = new Set();
    feedback = '';
  }

  function sameGaps(answer) {
    if (selected.size !== answer.length) return false;
    return answer.every(gap => selected.has(gap));
  }

  function check() {
    if (pending || answered) return;
    attempts += 1;
    attemptedItems.add(itemIndex);
    const right = sameGaps(item.division);
    if (right) correct += 1;
    feedback = randomFeedback(chapter, right ? 'correct' : 'incorrect');
    feedbackKind = right ? 'ok' : 'bad';
    if (right || oneAttempt) {
      answered = true;
      if (attemptedItems.size === items.length) markCompleted(activity.id);
      results.set(itemIndex, {
        selected: [...selected],
        oneSyllable,
        feedback,
        feedbackKind,
        correct: right
      });
      clearTimeout(advanceTimer);
      advanceTimer = setTimeout(() => move(1), autoAdvanceMs);
    }
  }

  // Under attemptsPerItem: 1 a finalized item stays finalized on revisit --
  // reopening it would let a wrong answer be retried and re-count attempts.
  // showAnswer stays user-controlled; the reveal is derived from `revealed`.
  function restoreItem() {
    const result = results.get(itemIndex);
    if (result) {
      selected = new Set(result.selected);
      oneSyllable = result.oneSyllable;
      feedback = result.feedback;
      feedbackKind = result.feedbackKind;
      answered = true;
      return;
    }
    selected = new Set();
    oneSyllable = false;
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
    restoreItem();
    const nextItem = items[itemIndex];
    if (pronounceEach && nextItem && nextItem.audio) play(nextItem.audio);
  }

  function scoreText() {
    if (!attempts) return chapter.feedback?.scorePrompt || 'Give it a try first';
    return `${correct} correct out of ${attempts} attempts (${Math.round((correct / attempts) * 100)}%)`;
  }

  // Answer submitted, so Check Answer is live even with nothing selected once
  // the one-syllable bar is the answer.
  $: canCheck = !pending && !answered && (oneSyllable || selected.size > 0);

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
          <button class="divide-gap"
            class:selected={selected.has(index + 1)}
            class:correct={revealed && item.division.includes(index + 1)}
            class:locked={oneSyllable}
            aria-pressed={selected.has(index + 1)}
            on:click={() => toggleGap(index + 1)}>
            <span>{index + 1}</span>
          </button>
        {/if}
      {/each}
    </div>
    {#if activity.oneSyllableButton}
      <button class="one-syllable-bar"
        class:selected={oneSyllable}
        class:correct={revealed && item.division.length === 0}
        aria-pressed={oneSyllable}
        on:click={toggleOneSyllable}>
        {activity.oneSyllableButton}
      </button>
    {/if}
    <div class="feedback {feedbackKind}">{feedback}</div>
    {#if showAnswer || revealed}
      <div class="exercise-answer"><span>Answer</span><span class="greek">{dividedForm(item.greek, item.division)}</span></div>
    {/if}
  {/if}

  <div class="controls">
    <button class="btn" disabled={!item?.audio} on:click={() => item?.audio && play(item.audio)}>Pronounce</button>
    <button class="btn secondary" disabled={itemIndex <= 0} on:click={() => move(-1)}>Previous</button>
    <button class="btn secondary" on:click={() => (showScore = !showScore)}>Score</button>
    <button class="btn secondary" disabled={itemIndex >= items.length - 1} on:click={() => move(1)}>Next</button>
    <button class="btn" disabled={!canCheck} on:click={check}>Check Answer</button>
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
