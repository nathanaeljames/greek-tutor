<script>
  // Vocabulary Spelling Exercise. English meaning is shown; the student spells
  // the Greek word using the on-screen tile keyboard or a physical keyboard
  // (legacy roman->Greek layout). Diacritic tiles combine onto the previous
  // character and NFC-normalize. Grading honors the "With Accents" toggle.
  import { onMount, onDestroy } from 'svelte';
  import { getLemma, randomFeedback } from '../lib/content.js';
  import { play } from '../lib/audio.js';
  import { markCompleted } from '../lib/progress.js';
  export let chapter;
  export let activity;

  const words = (activity.items || []).map(it => {
    const l = getLemma(it.ref) || {};
    return { ref: it.ref, greek: l.greek || '', gloss: l.gloss || '', audio: l.audio || null };
  });

  // Base lowercase letters (sigma shown medial; final sigma is its own tile).
  const letterTiles = chapter.alphabet.letters.map(l => (l.lower === 'σ/ς' ? 'σ' : l.lower));

  // Diacritic tiles: [display glyph, combining codepoints to append]. Composite
  // iota-subscript vowels are inserted whole.
  const diacriticTiles = [
    { label: '´', marks: ['́'] },        // acute
    { label: '`', marks: ['̀'] },        // grave
    { label: '῀', marks: ['͂'] },        // circumflex
    { label: '῾', marks: ['̔'] },        // rough breathing
    { label: '᾿', marks: ['̓'] },        // smooth breathing
    { label: '῎', marks: ['̓', '́'] }, // smooth + acute
    { label: '῞', marks: ['̔', '́'] }, // rough + acute
    { label: '῏', marks: ['̓', '͂'] }, // smooth + circumflex
    { label: '῟', marks: ['̔', '͂'] }, // rough + circumflex
    { label: '῍', marks: ['̓', '̀'] }  // smooth + grave
  ];
  const compositeTiles = ['ᾳ', 'ῃ', 'ῳ'];

  // Physical keyboard: legacy roman->Greek layout (font-map _keyboard_layout_note).
  const KEYMAP = {
    a: 'α', b: 'β', g: 'γ', d: 'δ', e: 'ε', z: 'ζ', h: 'η', q: 'θ', i: 'ι',
    k: 'κ', l: 'λ', m: 'μ', n: 'ν', c: 'ξ', o: 'ο', p: 'π', r: 'ρ', s: 'σ',
    t: 'τ', u: 'υ', f: 'φ', x: 'χ', y: 'ψ', w: 'ω', j: 'ς'
  };

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
  function appendMark(marks) {
    if (!built) return;                       // nothing to combine onto
    built = (built + marks.join('')).normalize('NFC');
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

  function stripAccents(s) {
    return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/ς/g, 'σ');
  }

  function check() {
    if (!word) return;
    const ok = withAccents
      ? built.normalize('NFC') === word.greek.normalize('NFC')
      : stripAccents(built) === stripAccents(word.greek);
    totalAttempts += 1;
    if (ok) {
      totalCorrect += 1;
      completedWords.add(wordIndex);
      feedback = randomFeedback(chapter, 'correct');
      feedbackKind = 'ok';
      if (completedWords.size === words.length) markCompleted(activity.id);
      clearTimeout(advanceTimer);
      advanceTimer = setTimeout(() => goNext(), 900);
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

  <!-- Tile keyboard -->
  <div class="tile-keyboard">
    <div class="tk-letters">
      {#each letterTiles as ch}
        <button class="tk-key greek" on:click={() => appendChar(ch)}>{ch}</button>
      {/each}
      <button class="tk-key greek" on:click={() => appendChar('ς')}>ς</button>
    </div>
    <div class="tk-marks">
      {#each diacriticTiles as d}
        <button class="tk-key mark" on:click={() => appendMark(d.marks)}>{d.label}</button>
      {/each}
      {#each compositeTiles as ch}
        <button class="tk-key greek" on:click={() => appendChar(ch)}>{ch}</button>
      {/each}
    </div>
    <div class="tk-edit">
      <button class="btn secondary" on:click={backspace}>⌫ Backspace</button>
      <button class="btn secondary" on:click={clearInput}>Clear</button>
    </div>
  </div>

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

{#if showKeyboard}
  <div class="modal-overlay">
    <div class="modal kb-ref" role="dialog" aria-label="Greek keyboard reference">
      <h2 class="modal-title">Greek Keyboard</h2>
      <p class="modal-body">Type these keys to enter Greek letters:</p>
      <div class="kb-grid">
        {#each Object.entries(KEYMAP) as [k, g]}
          <div class="kb-cell"><span class="kb-roman">{k}</span><span class="kb-greek greek">{g}</span></div>
        {/each}
      </div>
      <p class="modal-note">Diacritics: use the mark tiles (they combine onto the previous letter). Enter = Check, Backspace = delete.</p>
      <div class="modal-actions"><button class="btn" on:click={() => (showKeyboard = false)}>Close</button></div>
    </div>
  </div>
{/if}
