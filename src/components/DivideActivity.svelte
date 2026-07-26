<script>
  // Syllable Division Exercise: tap the numbered gaps between letters where
  // the word breaks into syllables, then Check Answer.
  //
  // LAYOUT (5B-SPEC2 C2) follows the original: a numbered BUTTON above each
  // gap with an arrow pointing down into the space between the two letters.
  // Sizing is breakpoint-static, not per-word -- the whole pool is measured
  // once by its LONGEST word so the letters are as large as that word allows
  // and every other word renders at the same size.
  //
  // ANSWER POLICY (5B patch 2a): answerPolicy.attemptsPerItem === 1 means
  // Check Answer finalizes the item right or wrong, reveals the hyphen-joined
  // divided form, and auto-advances after autoAdvanceMs. The timer is cancelled
  // on manual Previous/Next and on unmount. Completion = all items ATTEMPTED.
  import { onDestroy } from 'svelte';
  import { play } from '../lib/audio.js';
  import { randomFeedback, resolveHintBlocks } from '../lib/content.js';
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
  let showScore = !!activity.ui?.liveScore;
  let pronounceEach = activity.ui?.defaults?.pronounceEach ?? false;
  let advanceTimer = null;
  const attemptedItems = new Set();
  const results = new Map();

  // Fat-finger sizing (C2). The row is measured, not guessed: a hidden probe
  // renders the pool's longest word at a reference size, so the glyphs' real
  // advance widths -- not a character count -- decide how large the letters can
  // be. `railWidth` re-measures at every breakpoint; the WORD does not change
  // the size, so stepping through the pool never resizes anything.
  const PROBE_PX = 100;
  const GAP_RATIO = 0.34;          // gap column as a share of the letter size
  const MAX_LETTER_PX = 76;        // stop growing on tablet widths
  const longest = items.reduce((best, item) => {
    const count = splitGraphemes(item.greek).length;
    return count > best.count ? { count, greek: item.greek } : best;
  }, { count: 0, greek: '' });
  let railWidth = 0;
  let probeWidth = 0;
  $: letterSize = (railWidth > 0 && probeWidth > 0 && longest.count > 0)
    ? Math.max(16, Math.min(MAX_LETTER_PX,
        railWidth / (probeWidth / PROBE_PX + GAP_RATIO * Math.max(longest.count - 1, 0))))
    : 24;
  $: gapSize = Math.max(11, letterSize * GAP_RATIO);

  $: item = items[itemIndex] || null;
  $: letters = splitGraphemes(item && item.greek);
  $: pending = !item || !item.greek || !Array.isArray(item.division);
  $: hintBlocks = resolveHintBlocks(chapter, activity.hint);
  $: oneAttempt = activity.answerPolicy?.attemptsPerItem === 1;
  $: autoAdvanceMs = activity.answerPolicy?.autoAdvanceMs ?? 900;
  $: revealed = answered && oneAttempt;
  // Live score (C3): reactive, so the line follows every answer instead of
  // freezing at whatever it said when the box was opened.
  $: scoreLine = scoreText(attempts, correct);

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

  function scoreText(a, c) {
    if (!a) return chapter.feedback?.scorePrompt || 'Give it a try first';
    return `${c} correct out of ${a} attempts (${Math.round((c / a) * 100)}%)`;
  }

  // Answer submitted, so Check Answer is live even with nothing selected once
  // the one-syllable bar is the answer.
  $: canCheck = !pending && !answered && (oneSyllable || selected.size > 0);

  onDestroy(() => clearTimeout(advanceTimer));
</script>

<div class="card divide-activity">
  <!-- Off-screen probe: the pool's longest word at a known size. Its measured
       width is what the live row is scaled from. -->
  <span class="divide-probe greek" style="font-size:{PROBE_PX}px" bind:clientWidth={probeWidth}>{longest.greek}</span>
  {#if pending}
    <div class="pending-verification" role="status">Syllable-division word {itemIndex + 1} is pending content verification.</div>
  {:else}
    <div class="divide-rail" bind:clientWidth={railWidth}>
      <div class="divide-word"
        style={`--divide-size:${letterSize}px; --gap-size:${gapSize}px`}
        aria-label="Choose syllable division gaps">
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
              aria-label={`Divide after letter ${index + 1}`}
              on:click={() => toggleGap(index + 1)}>
              <span class="gap-num">{index + 1}</span>
              <svg class="gap-arrow" viewBox="0 0 12 24" width="12" height="24" aria-hidden="true">
                <path d="M6 1 V16" stroke="currentColor" stroke-width="2" fill="none" />
                <path d="M1.5 15 L6 22 L10.5 15 Z" fill="currentColor" />
              </svg>
            </button>
          {/if}
        {/each}
      </div>
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

  <div class="controls grouped">
    <button class="btn" disabled={!canCheck} on:click={check}>Check Answer</button>
    <button class="btn" disabled={!item?.audio} on:click={() => item?.audio && play(item.audio)}>Pronounce</button>
    <button class="btn secondary" disabled={itemIndex <= 0} on:click={() => move(-1)}>Previous</button>
    <button class="btn secondary" disabled={itemIndex >= items.length - 1} on:click={() => move(1)}>Next</button>
    <button class="btn secondary" on:click={() => (showHint = !showHint)}>{activity.hint?.label || 'Hint'}</button>
    <button class="btn secondary" on:click={() => (showScore = !showScore)}>Score</button>
  </div>
  <div class="exercise-checks">
    <label><input type="checkbox" bind:checked={showAnswer} disabled={pending} /> Show Answer</label>
    <label><input type="checkbox" bind:checked={pronounceEach} /> Pronounce Each Exercise</label>
  </div>
  {#if showScore}<div class="scorebox live-score">{scoreLine}</div>{/if}
  <div class="scorebox exercise-count">{itemIndex + 1} of {items.length}</div>
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
