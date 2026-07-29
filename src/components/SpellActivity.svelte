<script>
  // Word Spelling Exercise (Vocabulary, and from chapter 3 the Present Active
  // Verb speller). English meaning is shown; the student spells the Greek word
  // using the shared tile keyboard or a physical keyboard (legacy roman->Greek
  // layout). Diacritic tiles combine onto the previous character and
  // NFC-normalize. Grading honors the "With Accents" toggle and otherwise
  // follows the one shared policy in lib/answer-check.js.
  import { onMount, onDestroy } from 'svelte';
  import { getLemma, randomFeedback } from '../lib/content.js';
  import { play } from '../lib/audio.js';
  import { markCompleted } from '../lib/progress.js';
  import { spellingMatches } from '../lib/answer-check.js';
  import { ADVANCE_CORRECT_MS } from '../lib/timing.js';
  import SpellerKeyboard, { KEYMAP, PUNCT_KEYS } from './SpellerKeyboard.svelte';
  export let chapter;
  export let activity;

  // Two item shapes. {ref} looks the word up in the chapter's lexicon (the
  // vocabulary spellers); {gloss, greek, audio} carries it inline (chapter 3's
  // verb speller, whose 27 inflected forms are not lexicon lemmas).
  const words = (activity.items || []).map(it => {
    if (it.greek) return { ref: null, greek: it.greek, gloss: it.gloss || '', audio: it.audio || null };
    const l = getLemma(it.ref, chapter.id, it.pool) || {};
    return { ref: it.ref, greek: l.greek || '', gloss: l.gloss || '', audio: l.audio || null };
  });

  // The tile keyboard is a shared component reading the shared
  // speller-tiles.json contract. Chapter 1's inline copy is handed over only
  // as a last-resort fallback — see SpellerKeyboard for why it must not win.
  const fallbackLetters = chapter.alphabet && chapter.alphabet.letters
    ? chapter.alphabet.letters.map(l => (l.lower === 'σ/ς' ? 'σ' : l.lower))
    : [];

  let wordIndex = 0;
  let built = '';
  let feedback = '';
  let feedbackKind = '';
  let showAnswer = false;
  let withAccents = false;
  let pronounceEach = false;
  let showScore = false;
  let showKeyboard = false;
  let advanceTimer = null;

  // Scoring
  let totalAttempts = 0;
  let totalCorrect = 0;
  const completedWords = new Set();

  $: word = words[wordIndex];

  function appendChar(ch) { built += ch; }
  function appendMark(apply) {
    if (!built) return;                       // nothing to combine onto
    built = (built + apply).normalize('NFC');
  }
  function backspace() {
    if (!built) return;
    // Drop a whole grapheme: strip trailing combining marks then the base.
    const nfd = built.normalize('NFD');
    let end = nfd.length;
    while (end > 0 && /\p{M}/u.test(nfd[end - 1])) end -= 1;
    if (end > 0) end -= 1;
    built = nfd.slice(0, end).normalize('NFC');
  }
  function clearInput() { built = ''; }

  function check() {
    if (!word) return;
    // One shared policy (Phase 0): "With Accents" ON requires every mark to be
    // right; case, punctuation and the movable nu stay lenient either way.
    const ok = spellingMatches(built, word.greek, {
      withAccents,
      punctuationOptional: activity.punctuationOptional !== false,
      movableNu: activity.movableNu !== false
    });
    totalAttempts += 1;
    if (ok) {
      totalCorrect += 1;
      completedWords.add(wordIndex);
      feedback = randomFeedback(chapter, 'correct');
      feedbackKind = 'ok';
      if (completedWords.size === words.length) markCompleted(activity.id);
      clearTimeout(advanceTimer);
      advanceTimer = setTimeout(() => goNext(), ADVANCE_CORRECT_MS);
    } else {
      feedback = randomFeedback(chapter, 'incorrect');
      feedbackKind = 'bad';
    }
  }

  function resetWordState() {
    built = '';
    feedback = '';
    feedbackKind = '';
    showAnswer = false;                       // Next resets Show Answer (critique 21)
  }
  function goNext() {
    clearTimeout(advanceTimer);
    wordIndex = (wordIndex + 1) % words.length;
    resetWordState();
    if (pronounceEach && word && word.audio) play(word.audio);
  }
  function goPrev() {
    clearTimeout(advanceTimer);
    wordIndex = (wordIndex - 1 + words.length) % words.length;
    resetWordState();
  }
  function pronounce() { if (word && word.audio) play(word.audio); }

  function scorePct() {
    return totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  }

  function onKey(e) {
    if (showKeyboard || showScore) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'Backspace') { e.preventDefault(); backspace(); return; }
    if (e.key === 'Enter') { e.preventDefault(); check(); return; }
    // Space would scroll the page, so it is claimed here as well as mapped.
    if (PUNCT_KEYS[e.key]) { e.preventDefault(); appendChar(PUNCT_KEYS[e.key]); return; }
    const g = KEYMAP[e.key.toLowerCase()];
    if (g) { e.preventDefault(); appendChar(g); }
  }
  onMount(() => window.addEventListener('keydown', onKey));
  onDestroy(() => { window.removeEventListener('keydown', onKey); clearTimeout(advanceTimer); });
</script>

<div class="card speller">
  <div class="spell-panes">
    <div class="flash-pane"><div class="label">English Meaning</div>
      <div class="value" style="font-size:1.2rem">{word ? word.gloss : ''}</div></div>
    <div class="flash-pane"><div class="label">Spell Greek Word</div>
      <div class="value greek spell-target">{built}<span class="caret">|</span></div></div>
  </div>

  <div class="feedback {feedbackKind}">{feedback}</div>

  <div class="controls">
    <button class="btn" on:click={pronounce}>Pronounce</button>
    <button class="btn secondary" on:click={goPrev}>Previous</button>
    <button class="btn secondary" on:click={goNext}>Next</button>
    <button class="btn" on:click={check}>Check Answer</button>
    <button class="btn secondary" on:click={() => (showScore = true)}>Score</button>
    <button class="btn secondary" on:click={() => (showKeyboard = true)}>Greek Keyboard</button>
  </div>

  <div class="spell-checks">
    <label><input type="checkbox" bind:checked={showAnswer} /> Show Answer</label>
    <label><input type="checkbox" bind:checked={withAccents} /> With Accents</label>
    <label><input type="checkbox" bind:checked={pronounceEach} /> Pronounce Each Exercise</label>
  </div>

  <!-- Tile keyboard: the one shared keyboard, app-wide (D-15). -->
  <SpellerKeyboard
    tilesRef={activity.spellerTilesRef}
    inlineTiles={activity.spellerTiles}
    {fallbackLetters}
    bind:showHelp={showKeyboard}
    on:insert={e => appendChar(e.detail)}
    on:mark={e => appendMark(e.detail)}
    on:backspace={backspace}
    on:clear={clearInput} />

  {#if showAnswer}
    <div class="spell-answer"><span class="label">Answer</span> <span class="greek">{word ? word.greek : ''}</span></div>
  {/if}

  {#if showScore}
    <div class="score-dialog">
      <div class="score-row"><span>Number Correct</span><span>{totalCorrect}</span></div>
      <div class="score-row"><span>Total Attempted</span><span>{totalAttempts}</span></div>
      <div class="score-row"><span>Percentage</span><span>{scorePct()}%</span></div>
      <div class="score-row"><span>Exercises Completed</span><span>{completedWords.size} out of {words.length}</span></div>
      <div class="controls"><button class="btn" on:click={() => (showScore = false)}>Close</button></div>
    </div>
  {/if}
</div>

