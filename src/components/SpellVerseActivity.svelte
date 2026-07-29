<script>
  // SCRIPTURE MEMORY SPELLING EXERCISE (5D, activity type `spellVerse`).
  // The whole verse is typed as free text and graded word by word against
  // answerWords[] when Check Answer is pressed — one surface, not a
  // word-at-a-time stepper, exactly as the original.
  //
  // Three logged departures from the original live here:
  //   D-11  Major Hint (verse + translation) is ALWAYS available; the original
  //         hides the verse once typing begins.
  //   D-12  "Repeat This Exercise" is labelled "Restart Exercise".
  //   D-13  wrong/missing-word feedback names the WORD. The original prints a
  //         bare index ("The word you missed was: 2"), which tells a learner
  //         to go and count.
  // The keyboard it types on is the shared one (D-15): the same component the
  // word spellers mount, with the space bar and punctuation row Nathanael
  // selected at the Phase 0 checkpoint.
  import { onMount, onDestroy } from 'svelte';
  import { randomFeedback } from '../lib/content.js';
  import { play } from '../lib/audio.js';
  import { markCompleted } from '../lib/progress.js';
  import { checkVerse } from '../lib/answer-check.js';
  import SpellerKeyboard, { KEYMAP, PUNCT_KEYS } from './SpellerKeyboard.svelte';
  export let chapter;
  export let activity;

  $: answerWords = activity.answerWords || [];
  $: verseText = answerWords.join(' ');

  let built = '';
  let feedback = '';
  let feedbackKind = '';
  let detail = null;          // { text, word? } — the word renders in the Greek face
  let showHint = false;
  let showKeyboard = false;
  let withAccents = false;
  let solved = false;

  const fallbackLetters = chapter.alphabet && chapter.alphabet.letters
    ? chapter.alphabet.letters.map(l => (l.lower === 'σ/ς' ? 'σ' : l.lower))
    : [];

  function appendChar(ch) { if (!solved) built += ch; }
  function appendMark(apply) {
    if (solved || !built) return;                 // nothing to combine onto
    built = (built + apply).normalize('NFC');
  }
  function backspace() {
    if (solved || !built) return;
    // Drop a whole grapheme: strip trailing combining marks then the base.
    const nfd = built.normalize('NFD');
    let end = nfd.length;
    while (end > 0 && /\p{M}/u.test(nfd[end - 1])) end -= 1;
    if (end > 0) end -= 1;
    built = nfd.slice(0, end).normalize('NFC');
  }
  function clearInput() { if (!solved) built = ''; }

  function check() {
    const result = checkVerse(built, answerWords, {
      withAccents,
      punctuationOptional: activity.punctuationOptional !== false,
      movableNu: activity.movableNu !== false
    });
    if (result.ok) {
      solved = true;
      feedback = randomFeedback(chapter, 'correct');
      feedbackKind = 'ok';
      detail = null;
      markCompleted(activity.id);
      return;
    }
    feedback = randomFeedback(chapter, 'incorrect');
    feedbackKind = 'bad';
    // D-13: name the word, not its position.
    detail = result.expected
      ? { text: 'The word you missed was:', word: result.expected }
      : { text: 'There are more words here than the verse has.' };
  }

  function restart() {
    built = '';
    feedback = '';
    feedbackKind = '';
    detail = null;
    solved = false;
  }

  function onKey(e) {
    if (showKeyboard || showHint) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'Backspace') { e.preventDefault(); backspace(); return; }
    if (e.key === 'Enter') { e.preventDefault(); check(); return; }
    if (PUNCT_KEYS[e.key]) { e.preventDefault(); appendChar(PUNCT_KEYS[e.key]); return; }
    const g = KEYMAP[e.key.toLowerCase()];
    if (g) { e.preventDefault(); appendChar(g); }
  }
  onMount(() => window.addEventListener('keydown', onKey));
  onDestroy(() => window.removeEventListener('keydown', onKey));
</script>

<div class="card speller spellverse">
  {#if activity.reference}<div class="sv-ref">{activity.reference}</div>{/if}

  <div class="flash-pane">
    <div class="label">{activity.ui?.fields?.[0] || 'Spell Greek'}</div>
    <div class="value greek sv-target">{built}{#if !solved}<span class="caret">|</span>{/if}</div>
  </div>

  <div class="feedback {feedbackKind}">{feedback}</div>
  {#if detail}
    <div class="sv-detail" role="status">{detail.text}{#if detail.word}&nbsp;<span class="greek sv-word">{detail.word}</span>{/if}</div>
  {/if}

  <div class="controls grouped">
    <button class="btn secondary" on:click={() => (showHint = !showHint)}>Major Hint</button>
    <button class="btn" disabled={!activity.audio} on:click={() => activity.audio && play(activity.audio)}>Pronounce</button>
    <button class="btn" on:click={check}>Check Answer</button>
    <button class="btn secondary" on:click={() => (showKeyboard = true)}>Greek Keyboard</button>
    <button class="btn secondary" on:click={restart}>Restart Exercise</button>
  </div>

  <div class="spell-checks">
    <label><input type="checkbox" bind:checked={withAccents} /> With Accents</label>
  </div>

  {#if showHint}
    <!-- D-11: available at any time, typing started or not. -->
    <div class="sv-hint">
      <div class="label">{activity.reference || 'Verse'}</div>
      <div class="greek sv-verse">{verseText}</div>
      {#if activity.translation}<div class="sv-translation">{activity.translation}</div>{/if}
    </div>
  {/if}

  <SpellerKeyboard
    tilesRef={activity.spellerTilesRef}
    inlineTiles={activity.spellerTiles}
    {fallbackLetters}
    bind:showHelp={showKeyboard}
    on:insert={e => appendChar(e.detail)}
    on:mark={e => appendMark(e.detail)}
    on:backspace={backspace}
    on:clear={clearInput} />
</div>
