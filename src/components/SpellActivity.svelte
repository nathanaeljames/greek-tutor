<script>
  // Word Spelling Exercise (Vocabulary, and from chapter 3 the Present Active
  // Verb speller). English meaning is shown; the student spells the Greek word
  // using the shared tile keyboard or a physical keyboard (legacy roman->Greek
  // layout). Typing goes through the shared buffer in lib/speller-input.js
  // (tap-to-position caret, diacritics that combine onto the cluster before the
  // caret and wait for a letter when there is none). Grading honors the "With
  // Accents" toggle and otherwise follows the one shared policy in
  // lib/answer-check.js.
  //
  // 5E-SPEC2 §1/§4: every speller in the app is `spellUntilRight`. A correct
  // spelling WAITS for Next (so the learner can look at what they got right);
  // a wrong one reveals nothing, keeps what was typed, and leaves the item
  // open. §2.2: the word's clip is spoken after a correct spelling —
  // `afterGuess`, because the prompt is an English gloss and pronouncing the
  // Greek before the answer would hand it over.
  import { onMount, onDestroy } from 'svelte';
  import { getLemma, randomFeedback } from '../lib/content.js';
  import { play, stop as stopAudio } from '../lib/audio.js';
  import { markCompleted } from '../lib/progress.js';
  import { spellingMatches } from '../lib/answer-check.js';
  import { resolveAdvance, waitsForNext } from '../lib/timing.js';
  import * as input from '../lib/speller-input.js';
  import SpellerKeyboard, { KEYMAP, PUNCT_KEYS } from './SpellerKeyboard.svelte';
  import SpellerField from './SpellerField.svelte';
  export let chapter;
  export let activity;

  // Two item shapes. {ref} looks the word up in the chapter's lexicon (the
  // vocabulary spellers); {gloss, greek, audio} carries it inline (chapter 3's
  // verb speller, whose 27 inflected forms are not lexicon lemmas).
  const words = (activity.items || []).map(it => {
    if (it.greek) return {
      ref: it.ref || null, greek: it.greek, gloss: it.gloss || '', audio: it.audio || null
    };
    const l = getLemma(it.ref, chapter.id, it.pool) || {};
    return { ref: null, greek: l.greek || '', gloss: l.gloss || '', audio: l.audio || null };
  });

  // The tile keyboard is a shared component reading the shared
  // speller-tiles.json contract. Chapter 1's inline copy is handed over only
  // as a last-resort fallback — see SpellerKeyboard for why it must not win.
  const fallbackLetters = chapter.alphabet && chapter.alphabet.letters
    ? chapter.alphabet.letters.map(l => (l.lower === 'σ/ς' ? 'σ' : l.lower))
    : [];

  let wordIndex = 0;
  // One typing model for every spell surface (lib/speller-input.js): the same
  // grapheme-cluster buffer, caret and held-diacritic rules the whole-verse
  // speller uses. The keyboard has been shared since D-15; letting the two
  // surfaces keep private copies of "what a keystroke does" is the same fork
  // by another route, and it is where the VERIFY-5D A6 defects lived.
  let buffer = input.clear();
  $: built = buffer.text;
  let feedback = '';
  let feedbackKind = '';
  let showAnswer = false;
  let withAccents = false;
  // A7: Pronounce Each defaults to ON wherever the checkbox exists. The
  // default is the DATA's (ui.defaults.pronounceEach), which the ledger stamps;
  // thirteen activities shipped with it off before 5E-SPEC2.
  let pronounceEach = activity.ui?.defaults?.pronounceEach ?? true;
  let showScore = false;
  let showKeyboard = false;
  let solved = false;              // this word is spelled right and waiting for Next

  $: advancePolicy = resolveAdvance(activity.answerPolicy);
  $: audioTiming = activity.audioTiming || 'afterGuess';
  // §5.5: spellUntilRight waits for Next on a correct answer, so it says so.
  $: awaitingNext = solved && waitsForNext(advancePolicy, true);

  // Scoring
  let totalAttempts = 0;
  let totalCorrect = 0;
  const completedWords = new Set();

  $: word = words[wordIndex];

  // §4.3: Show Answer clears the moment typing resumes. Every edit path goes
  // through these four, so there is one place to enforce it.
  function typingResumed() { showAnswer = false; }
  function appendChar(ch) { if (solved) return; typingResumed(); buffer = input.insertText(buffer, ch); }
  function appendMark(apply) { if (solved) return; typingResumed(); buffer = input.applyMark(buffer, apply); }
  function backspace() { if (solved) return; typingResumed(); buffer = input.backspace(buffer); }
  function clearInput() { if (solved) return; typingResumed(); buffer = input.clear(); }

  function check() {
    if (!word || solved) return;
    // One shared policy (Phase 0, amended by 5E-SPEC2 §4): "With Accents" ON
    // requires every accent to be right; final forms and breathings are
    // required at BOTH settings; case and punctuation stay lenient either way.
    // A final nu is compared like any other letter (D-16 withdrawn).
    const ok = spellingMatches(built, word.greek, {
      withAccents,
      punctuationOptional: activity.punctuationOptional !== false
    });
    totalAttempts += 1;
    if (ok) {
      totalCorrect += 1;
      completedWords.add(wordIndex);
      feedback = randomFeedback(chapter, 'correct');
      feedbackKind = 'ok';
      // spellUntilRight: the item is won and waits for Next. Nothing is
      // scheduled, so there is no clip racing the next word onto the screen —
      // the defect the ledger records against all nine spellers.
      solved = true;
      if (completedWords.size === words.length) markCompleted(activity.id);
      if (pronounceEach && audioTiming === 'afterGuess' && word.audio) play(word.audio);
    } else {
      // §4.4/C1/C2: what was typed STAYS (the port's standing divergence — the
      // manual Clear button is how the slate gets wiped) and the correct
      // spelling is never revealed.
      feedback = randomFeedback(chapter, 'incorrect');
      feedbackKind = 'bad';
    }
  }

  function resetWordState() {
    buffer = input.clear();
    feedback = '';
    feedbackKind = '';
    solved = false;
    showAnswer = false;                       // Next resets Show Answer (critique 21)
  }
  // §2.3: moving stops whatever is being spoken and shows the word at once.
  function goNext() {
    stopAudio();
    wordIndex = (wordIndex + 1) % words.length;
    resetWordState();
  }
  function goPrev() {
    stopAudio();
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
    if (solved) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); buffer = input.placeCaret(buffer, buffer.caret - 1, false); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); buffer = input.placeCaret(buffer, buffer.caret + 1, false); return; }
    // Space would scroll the page, so it is claimed here as well as mapped.
    if (PUNCT_KEYS[e.key]) { e.preventDefault(); appendChar(PUNCT_KEYS[e.key]); return; }
    const g = KEYMAP[e.key.toLowerCase()];
    if (g) { e.preventDefault(); appendChar(g); }
  }
  onMount(() => window.addEventListener('keydown', onKey));
  // §3.1: audio stops when the learner leaves the exercise.
  onDestroy(() => { window.removeEventListener('keydown', onKey); stopAudio(); });
</script>

<div class="card speller">
  <div class="spell-panes">
    <div class="flash-pane"><div class="label">{activity.promptLabel || 'English Meaning'}</div>
      <div class="value" style="font-size:1.2rem">{word ? word.gloss : ''}</div>
      {#if word && word.ref}<div class="spell-prompt-ref">{word.ref}</div>{/if}
    </div>
    <SpellerField
      state={buffer}
      label="Spell Greek Word"
      locked={solved}
      on:caret={e => { if (!solved) buffer = input.placeCaret(buffer, e.detail.index, e.detail.after); }}
      on:caretEnd={() => { if (!solved) buffer = input.caretToEnd(buffer); }} />
  </div>

  <div class="feedback {feedbackKind}">{feedback}</div>
  <!-- §5.5: spellUntilRight waits on a correct answer, so it says so rather
       than sitting on a won word with nothing happening. -->
  {#if awaitingNext}<div class="await-next" role="status">Click Next to continue</div>{/if}

  <div class="controls">
    <button class="btn" on:click={pronounce}>Pronounce</button>
    <button class="btn secondary" on:click={goPrev}>Previous</button>
    <button class="btn secondary" on:click={goNext}>Next</button>
    <button class="btn" disabled={solved} on:click={check}>Check Answer</button>
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

