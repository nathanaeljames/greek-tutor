<script>
  // Syllable Division Exercise.
  //
  // REBUILT IN 5B-SPEC4 C. Through SPEC3 this was the original's numbered
  // buttons-and-arrows above each gap; VERIFY3 struck that whole thread out and
  // replaced it: "Fuck it, I'm completely re-imagining this exercise." The word
  // is now the only control. Tap it to drop a DIVIDER at the nearest place
  // between two letters and drag it; tap somewhere else to drop another; tap
  // where one already is to move that one instead. Clear Answer wipes them.
  //
  // Three things follow from that and are easy to undo by accident:
  //   * ONE TYPE SIZE for the whole pool (C1). The longest word sets it and
  //     every other word matches, so stepping through the pool never resizes
  //     the type. SPEC2 did this, SPEC3 reversed it to per-word, VERIFY3
  //     reverses it back and is the last word.
  //   * THE WORD IS NOT AN AUDIO TAP any more. It cannot be: a tap on it places
  //     a divider. It therefore renders in INK, not the tappable blue, and
  //     Pronounce / Pronounce Each are the audio path. This is a standing
  //     exception to directive 9, alongside Phonetic Reading and the speller.
  //   * A REVISIT RE-OPENS A FINISHED ITEM, which attemptsPerItem: 1 otherwise
  //     forbids. VERIFY3 asked for it by name ("upon revisiting a previously
  //     answered word, all cursors and answer texts should disappear and let
  //     the user try that word again"); 5D-SPEC2 §3 makes it the app-wide rule.
  //     Clear Answer does the same thing without leaving the item. Score
  //     history already spent is not rewound.
  //
  // ANSWER POLICY. Check Answer finalizes the item right or wrong and reveals
  // the hyphen-joined divided form. The CLASS decides what happens next, and
  // this exercise's class is `manualCorrectAutoIncorrect` (5E-SPEC2 §1, from
  // the DOSBox pass): a correct division WAITS for Next, a wrong one
  // auto-advances on the longer wait. That is the opposite of the obvious
  // arrangement and it is what the original does. The advance is cancelled by
  // manual Previous/Next, by Clear Answer and on unmount.
  //
  // AUDIO (§2.2) is `afterGuess`: the word is spoken once the answer is in,
  // and the next word does not appear until the clip has finished.
  import { afterUpdate, onDestroy, onMount, tick } from 'svelte';
  import { play, playThrough, stop as stopAudio } from '../lib/audio.js';
  import { randomFeedback, resolveHintBlocks } from '../lib/content.js';
  import { dividedForm, splitGraphemes } from '../lib/greek.js';
  import { markCompleted } from '../lib/progress.js';
  import { resolveAdvance, waitsForNext } from '../lib/timing.js';
  import RichContent from './RichContent.svelte';

  export let chapter;
  export let activity;

  const items = activity.items || [];
  let itemIndex = 0;
  let dividers = new Set();      // 1-based gap indices, same contract as division[]
  let oneSyllable = false;
  let attempts = 0;
  let correct = 0;
  let feedback = '';
  let feedbackKind = '';
  let answered = false;
  let showAnswer = false;
  let showHint = false;
  // D1 (SPEC3): hidden until the first Score press; ui.liveScore governs whether
  // the revealed line keeps updating, not whether it starts open.
  let showScore = false;
  // A7: Pronounce Each defaults ON wherever the checkbox exists.
  let pronounceEach = activity.ui?.defaults?.pronounceEach ?? true;
  let advanceTimer = null;
  let advanceToken = 0;
  let answeredCorrect = false;
  const attemptedItems = new Set();

  // ---- SIZING (C1): one size, set by the longest word in the pool ----
  // Measured, not guessed: a hidden probe renders every word at a reference
  // size so real glyph advances -- not a character count -- decide how large
  // the type can be. bind:clientWidth is NOT used: it reports once, while
  // font-display:block still has the row in the fallback face, and never
  // reports the reflow when the bundled Greek font swaps in (SPEC3 finding 3).
  const PROBE_PX = 100;
  const LETTER_GAP_EM = 0.12;   // lane for the divider, in em of the letter size
  const MAX_LETTER_PX = 84;
  const MIN_LETTER_PX = 20;
  let railWidth = 0;
  let probeEls = [];
  let probeWidths = [];
  let fontEpoch = 0;

  $: itemLetters = items.map(item => splitGraphemes(item && item.greek));
  $: letters = itemLetters[itemIndex] || [];
  $: letterSize = fitPool(railWidth, probeWidths, itemLetters, fontEpoch);
  $: letterGap = letterSize * LETTER_GAP_EM;

  // The row must always FIT: overflow-x is hidden app-wide, so a row that is
  // too wide is not scrollable, it is deleted.
  function fitPool(rail, widths, clusters) {   // fontEpoch is a trigger only
    if (!(rail > 0) || !widths.length) return 28;
    let worst = 0;
    for (let i = 0; i < clusters.length; i++) {
      const width = widths[i] || 0;
      if (!width) continue;
      worst = Math.max(worst, width / PROBE_PX + Math.max(clusters[i].length - 1, 0) * LETTER_GAP_EM);
    }
    if (!worst) return 28;
    // Budget slightly under the rail: per-glyph rounding accumulates across a
    // long word, and being 2px over means 2px CLIPPED, not 2px scrolled.
    return Math.max(MIN_LETTER_PX, Math.min(MAX_LETTER_PX, (rail * 0.97) / worst));
  }

  // ---- DIVIDER GEOMETRY ----
  // gapCentres[g] is the x of the lane between letter g and letter g+1,
  // relative to the word element. Read from the laid-out letters rather than
  // computed, so letter-spacing, kerning and the font swap are all accounted
  // for by the browser.
  let wordEl;
  let letterEls = [];
  let gapCentres = [];
  let dragging = null;          // gap index being dragged, or null
  let dragPointer = null;

  function measureGaps() {
    if (!wordEl) return;
    const origin = wordEl.getBoundingClientRect().left;
    const next = [];
    for (let i = 1; i < letters.length; i++) {
      const before = letterEls[i - 1];
      const after = letterEls[i];
      if (!before || !after) return;
      next[i] = (before.getBoundingClientRect().right + after.getBoundingClientRect().left) / 2 - origin;
    }
    if (next.length !== gapCentres.length || next.some((x, i) => Math.abs(x - gapCentres[i]) > 0.5)) {
      gapCentres = next;
    }
  }
  afterUpdate(() => {
    for (let i = 0; i < probeEls.length; i++) {
      if (!probeEls[i]) continue;
      const width = probeEls[i].getBoundingClientRect().width;
      if (Math.abs(width - (probeWidths[i] || 0)) > 0.5) probeWidths[i] = width;
    }
    probeWidths = probeWidths;
    measureGaps();
  });

  function nearestGap(clientX) {
    if (!wordEl || gapCentres.length < 2) return null;
    const x = clientX - wordEl.getBoundingClientRect().left;
    let best = null;
    let bestDistance = Infinity;
    for (let i = 1; i < gapCentres.length; i++) {
      const distance = Math.abs(x - gapCentres[i]);
      if (distance < bestDistance) { bestDistance = distance; best = i; }
    }
    return best;
  }

  // A little bump per letter crossed. Android honours it; iOS Safari has no
  // Vibration API at all, so this must be a no-op there rather than a throw.
  function bump() {
    try { navigator.vibrate && navigator.vibrate(8); } catch { /* no haptics */ }
  }

  function onPointerDown(event) {
    if (answered || pending) return;
    const gap = nearestGap(event.clientX);
    if (gap == null) return;
    event.preventDefault();
    oneSyllable = false;
    feedback = '';
    // Landing on an existing divider grabs it; anywhere else creates one.
    if (!dividers.has(gap)) {
      dividers = new Set(dividers).add(gap);
      bump();
    }
    dragging = gap;
    dragPointer = event.pointerId;
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* not captureable */ }
  }

  function onPointerMove(event) {
    if (dragging == null || event.pointerId !== dragPointer) return;
    const gap = nearestGap(event.clientX);
    // An occupied lane is not a drop target: two dividers in one place would
    // silently become one and the learner would not know which they lost.
    if (gap == null || gap === dragging || dividers.has(gap)) return;
    const next = new Set(dividers);
    next.delete(dragging);
    next.add(gap);
    dividers = next;
    dragging = gap;
    bump();
  }

  function endDrag(event) {
    if (event && dragPointer != null && event.pointerId !== dragPointer) return;
    dragging = null;
    dragPointer = null;
  }

  // ---- KEYBOARD (the word is a control, so it needs one) ----
  let focusGap = 1;
  function onKeyDown(event) {
    if (answered || pending || letters.length < 2) return;
    const last = letters.length - 1;
    if (event.key === 'ArrowRight') { focusGap = Math.min(last, focusGap + 1); }
    else if (event.key === 'ArrowLeft') { focusGap = Math.max(1, focusGap - 1); }
    else if (event.key === ' ' || event.key === 'Enter') {
      const next = new Set(dividers);
      if (next.has(focusGap)) next.delete(focusGap); else next.add(focusGap);
      dividers = next;
      oneSyllable = false;
      feedback = '';
    } else return;
    event.preventDefault();
  }

  $: item = items[itemIndex] || null;
  $: pending = !item || !item.greek || !Array.isArray(item.division);
  $: hintBlocks = resolveHintBlocks(chapter, activity.hint);
  $: advancePolicy = resolveAdvance(activity.answerPolicy);
  $: oneAttempt = advancePolicy.oneAttempt;
  $: audioTiming = activity.audioTiming || 'afterGuess';
  $: revealed = answered && oneAttempt;
  // §5.5: manualCorrectAutoIncorrect waits on a CORRECT answer, so say so.
  $: awaitingNext = answered && waitsForNext(advancePolicy, answeredCorrect);
  $: answerGaps = new Set((!pending && item.division) || []);
  // Live score (C3): reactive, so the line follows every answer instead of
  // freezing at whatever it said when the box was opened.
  $: scoreLine = scoreText(attempts, correct);

  // The one-syllable bar clears and locks the divider lane; the answer it
  // submits is the empty division (kai is the pool's only one-syllable word).
  function toggleOneSyllable() {
    if (answered) return;
    oneSyllable = !oneSyllable;
    if (oneSyllable) dividers = new Set();
    feedback = '';
  }

  function sameGaps(answer) {
    if (dividers.size !== answer.length) return false;
    return answer.every(gap => dividers.has(gap));
  }

  function cancelAdvance() {
    advanceToken += 1;
    clearTimeout(advanceTimer);
    advanceTimer = null;
  }

  // max(class minimum, clip duration) — §2.2. The minimum is a timer, the clip
  // is a promise, and the advance happens when both are done unless the token
  // says a manual move got there first.
  function scheduleAdvance(ms, clip) {
    cancelAdvance();
    const token = advanceToken;
    const minimum = new Promise(resolve => { advanceTimer = setTimeout(resolve, ms); });
    const spoken = clip ? playThrough(clip) : Promise.resolve();
    Promise.all([minimum, spoken]).then(() => { if (token === advanceToken) move(1); });
  }

  function check() {
    if (pending || answered) return;
    attempts += 1;
    attemptedItems.add(itemIndex);
    const right = sameGaps(item.division);
    if (right) correct += 1;
    feedback = randomFeedback(chapter, right ? 'correct' : 'incorrect');
    feedbackKind = right ? 'ok' : 'bad';
    const clip = (audioTiming === 'afterGuess' && pronounceEach && item.audio) ? item.audio : null;
    if (right || oneAttempt) {
      answered = true;
      answeredCorrect = right;
      endDrag();
      if (attemptedItems.size === items.length) markCompleted(activity.id);
      if (right && advancePolicy.autoOnCorrect) scheduleAdvance(advancePolicy.correctMs, clip);
      else if (!right && advancePolicy.autoOnIncorrect) scheduleAdvance(advancePolicy.incorrectMs, clip);
      else { cancelAdvance(); if (clip) play(clip); }
    } else if (clip) {
      play(clip);
    }
  }

  // C4. Wipes the dividers and re-opens the item without leaving it. Attempts
  // already counted stay counted.
  function clearAnswer() {
    cancelAdvance();
    stopAudio();
    endDrag();
    dividers = new Set();
    oneSyllable = false;
    feedback = '';
    feedbackKind = '';
    answered = false;
    answeredCorrect = false;
  }

  // REVISITING AN ITEM RESETS IT (5D-SPEC2 §3, VERIFY-5D A5). Arriving at a
  // word -- forwards or backwards, answered before or not -- presents it
  // fresh. This is what Clear Answer used to be the manual workaround for
  // (VERIFY3 asked for exactly this behavior on revisit); the button stays
  // because it also re-opens an item without leaving it. Scores stand.
  function restoreItem() {
    dividers = new Set();
    oneSyllable = false;
    feedback = '';
    feedbackKind = '';
    answered = false;
    answeredCorrect = false;
    showAnswer = false;
  }

  // §2.3: Previous/Next stops the clip and shows the word at once. The word is
  // NOT spoken on arrival any more — this exercise is `afterGuess`, so its
  // clip belongs after Check Answer (and Pronounce is always there).
  function move(delta) {
    cancelAdvance();
    stopAudio();
    endDrag();
    const nextIndex = Math.max(0, Math.min(items.length - 1, itemIndex + delta));
    if (nextIndex === itemIndex) return;
    itemIndex = nextIndex;
    focusGap = 1;
    gapCentres = [];
    restoreItem();
  }

  function scoreText(a, c) {
    if (!a) return chapter.feedback?.scorePrompt || 'Give it a try first';
    return `${c} correct out of ${a} attempts (${Math.round((c / a) * 100)}%)`;
  }

  // Answer submitted, so Check Answer is live even with nothing placed once the
  // one-syllable bar is the answer.
  $: canCheck = !pending && !answered && (oneSyllable || dividers.size > 0);
  $: canClear = !pending && (answered || oneSyllable || dividers.size > 0);

  let observer = null;
  onMount(async () => {
    if (typeof document !== 'undefined' && document.fonts) {
      // The bundled face changes every advance in the row; re-measure once it
      // has actually arrived rather than trusting the fallback's metrics.
      document.fonts.ready.then(async () => { fontEpoch += 1; await tick(); measureGaps(); });
    }
    if (typeof ResizeObserver === 'undefined') return;
    observer = new ResizeObserver(() => measureGaps());
    if (wordEl) observer.observe(wordEl);
  });

  onDestroy(() => {
    cancelAdvance();
    stopAudio();                                   // §3.1
    if (observer) observer.disconnect();
  });
</script>

<div class="card divide-activity">
  <!-- Off-screen probe: EVERY word at a known size. The widest sets the type
       size for the whole pool, so stepping never resizes the row (C1). -->
  <div class="divide-probes" aria-hidden="true">
    {#each items as probe, index}
      <span class="greek" style="font-size:{PROBE_PX}px" bind:this={probeEls[index]}>{probe.greek || ''}</span>
    {/each}
  </div>
  {#if pending}
    <div class="pending-verification" role="status">Syllable-division word {itemIndex + 1} is pending content verification.</div>
  {:else}
    <div class="divide-rail" bind:clientWidth={railWidth}>
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <div class="divide-word greek"
        class:answered={revealed}
        bind:this={wordEl}
        style={`--divide-size:${letterSize}px; --letter-gap:${letterGap}px`}
        role="application"
        tabindex={pending ? -1 : 0}
        aria-label={`Place syllable dividers in ${item.greek}. Arrow keys move, space places.`}
        on:pointerdown={onPointerDown}
        on:pointermove={onPointerMove}
        on:pointerup={endDrag}
        on:pointercancel={endDrag}
        on:keydown={onKeyDown}>
        {#each letters as letter, index}
          <span class="divide-letter" bind:this={letterEls[index]}>{letter}</span>
        {/each}
        <!-- Dividers ride above the letters in their own layer so a letter's
             ink never sits on top of one. Correct positions show green after
             Check Answer, including ones the learner missed; a divider in the
             wrong lane shows red (C5). -->
        {#each gapCentres as centre, gap}
          {#if gap > 0 && (dividers.has(gap) || (revealed && answerGaps.has(gap)))}
            <span class="divide-cursor"
              class:correct={revealed && answerGaps.has(gap)}
              class:wrong={revealed && !answerGaps.has(gap)}
              class:dragging={dragging === gap}
              style={`left:${centre}px`}
              aria-hidden="true"></span>
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
    <!-- §5.5: a correct division waits for Next; say so. -->
    {#if awaitingNext}<div class="await-next" role="status">Click Next to continue</div>{/if}
  {/if}

  <div class="controls grouped">
    <button class="btn" disabled={!canCheck} on:click={check}>Check Answer</button>
    <button class="btn secondary" disabled={!canClear} on:click={clearAnswer}>Clear Answer</button>
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
