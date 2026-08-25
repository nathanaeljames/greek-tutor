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
  // 5E-SPEC3 §1/§5: every speller in the app is `retryUntilRight`. A correct
  // spelling AUTO-ADVANCES like every other correct answer in the app (rule
  // B1a — there are no exceptions and this class does not get one); a wrong
  // one reveals nothing, keeps what was typed, and leaves the item open for
  // another attempt or a manual Next. §2.2: the word's clip is spoken after a
  // correct spelling — `afterGuess`, because the prompt is an English gloss
  // and pronouncing the Greek before the answer would hand it over — and the
  // next word does not appear until that clip has FINISHED, so the wait is
  // max(ADVANCE_CORRECT_MS, clip) rather than a flat 2000ms.
  //
  // 5E-SPEC2 shipped this surface as `spellUntilRight`, waiting for Next on a
  // correct spelling. That class is withdrawn; see DIVERGENCE-LOG D-28.
  import { onMount, onDestroy } from 'svelte';
  import { getLemma, randomFeedback } from '../lib/content.js';
  import { play, playThrough, stop as stopAudio } from '../lib/audio.js';
  import { markCompleted } from '../lib/progress.js';
  import { spellingMatches } from '../lib/answer-check.js';
  import { resolveAdvance, waitsForNext } from '../lib/timing.js';
  import * as input from '../lib/speller-input.js';
  import SpellerKeyboard, { greekForKey, PUNCT_KEYS } from './SpellerKeyboard.svelte';
  import SpellerField from './SpellerField.svelte';
  export let chapter;
  export let activity;

  // THREE item shapes, all reduced to one record here.
  //
  //   {ref}                    looks the word up in the chapter's lexicon (the
  //                            vocabulary spellers). `ref` is a LEXICON KEY.
  //   {gloss, greek, audio}    carries it inline (chapter 3's verb speller,
  //                            whose 27 inflected forms are not lemmas).
  //   {prompt, answer, ref}    5F. The prompt is an English phrase or a parse
  //                            label, the ANSWER is the Greek, and `ref` is a
  //                            scripture citation printed beside the prompt —
  //                            the same field name carrying a different thing,
  //                            which is why a ref that resolves to no lemma is
  //                            treated as a citation rather than a lookup.
  //
  // §3: `ref` may legitimately be NULL (chapter 8's "they (fem nom 3 pl)" — the
  // original shows a blank there), and a blank must render as nothing, not as
  // an empty chip.
  //
  // §2.10: `answerAlt` is a SECOND ACCEPTABLE SPELLING, not a hint. Chapter 7's
  // εἰμί speller prints the moveable nu in parentheses — ἐστί(ν) — and accepts
  // both that and the bare ἐστίν. This is not general movable-nu leniency
  // (D-16 stays withdrawn); it is this field, on these six items.
  const words = (activity.items || []).map(it => {
    const inline = it.greek || it.answer;
    if (inline) {
      const lemma = it.ref ? getLemma(it.ref, chapter.id, it.pool) : null;
      return {
        ref: lemma ? null : (it.ref || null),
        greek: inline,
        alts: altSpellings(it),
        gloss: it.prompt != null ? it.prompt : (it.gloss || ''),
        note: it.note || null,
        audio: it.audio || (lemma && lemma.audio) || null
      };
    }
    const l = getLemma(it.ref, chapter.id, it.pool) || {};
    return {
      ref: null,
      greek: l.greek || '',
      alts: altSpellings(it),
      // A 5F vocabulary speller authors its own prompt ("from") rather than
      // taking the lemma's full gloss ("from (with gen.)"), and carries the
      // case tag beside it as a note.
      gloss: it.prompt != null ? it.prompt : (l.gloss || ''),
      note: it.note || null,
      audio: l.audio || null
    };
  });

  // answerAlt is one string or a list of them; the printed form is often the
  // same as the answer, in which case it adds nothing and costs nothing.
  //
  // A PARENTHESISED SEGMENT IS OPTIONAL, which is the whole reason the field
  // exists here. ἐστί(ν) is the chapter's own notation for "the nu may or may
  // not be there", so it is expanded into ἐστί(ν) — which the shared checker
  // already folds to ἐστίν, punctuation being optional — AND ἐστί. Without the
  // expansion the alternate collapses onto the answer and the field does
  // nothing at all, which is how it first shipped.
  //
  // This is NOT general movable-nu leniency (D-16 stays withdrawn). It fires
  // only on an authored parenthesised alternate, so the item next door — whose
  // answerAlt is its own answer — still rejects a stray nu.
  function altSpellings(item) {
    const alt = item.answerAlt;
    if (!alt) return [];
    const out = [];
    for (const value of Array.isArray(alt) ? alt : [alt]) {
      if (typeof value !== 'string' || !value.trim()) continue;
      out.push(value);
      if (value.includes('(')) out.push(value.replace(/\([^()]*\)/g, ''));
    }
    return out;
  }

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
  // This word is spelled right and the surface is moving on by itself. The
  // input is locked for the length of the wait so a stray keystroke cannot
  // edit a won answer out from under the clip that is speaking it.
  let solved = false;
  let advanceTimer = null;
  // Bumped by every scheduled advance and by everything that cancels one
  // (manual Previous/Next, unmount). An advance that waits for a clip resolves
  // asynchronously, so the token — not the timer handle alone — is what keeps
  // a superseded advance from firing. §2.3: Next stops the audio and moves at
  // once, which is this token plus stopAudio().
  let advanceToken = 0;

  $: advancePolicy = resolveAdvance(activity.answerPolicy);
  $: audioTiming = activity.audioTiming || 'afterGuess';
  // §B4/§5.5: this surface has no waiting outcome left. A correct spelling
  // moves by itself (B1a) and a wrong one leaves the item open, where the next
  // thing to do is try again rather than press Next. Kept as a live predicate
  // rather than deleted so the surface would start SAYING so if the class it
  // is assigned to ever acquires a waiting outcome.
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
    const options = { withAccents, punctuationOptional: activity.punctuationOptional !== false };
    // §2.10: any of the authored spellings is right. The parenthesised form is
    // compared like any other answer — the parentheses are punctuation, which
    // the shared policy already treats as optional, so ἐστίν, ἐστί(ν) and
    // ἐστι(ν) all land on the same key without a movable-nu rule anywhere.
    const ok = [word.greek, ...word.alts].some(answer => spellingMatches(built, answer, options));
    totalAttempts += 1;
    if (ok) {
      totalCorrect += 1;
      completedWords.add(wordIndex);
      feedback = randomFeedback(chapter, 'correct');
      feedbackKind = 'ok';
      solved = true;
      if (completedWords.size === words.length) markCompleted(activity.id);
      // §B1a: move on by ourselves. The clip is handed to scheduleAdvance
      // rather than played beside it, so the next word cannot arrive while the
      // previous word is still being spoken — the defect VERIFY-5E item 11
      // reports against every afterGuess surface.
      const clip = pronounceEach && audioTiming === 'afterGuess' && word.audio ? word.audio : null;
      if (advancePolicy.autoOnCorrect) scheduleAdvance(advancePolicy.correctMs, clip);
      else if (clip) play(clip);
    } else {
      // §4.4/C1/C2: what was typed STAYS (the port's standing divergence — the
      // manual Clear button is how the slate gets wiped) and the correct
      // spelling is never revealed.
      feedback = randomFeedback(chapter, 'incorrect');
      feedbackKind = 'bad';
    }
  }

  function cancelAdvance() {
    advanceToken += 1;
    clearTimeout(advanceTimer);
    advanceTimer = null;
  }

  // Schedule the move to the next word: no sooner than the class minimum, and
  // no sooner than the end of the afterGuess clip (§2.2 — the wait is
  // max(class minimum, audio duration), never shorter than 2000ms). Both
  // halves are cancelled by cancelAdvance(), so Next always wins (§2.3).
  function scheduleAdvance(ms, clip) {
    cancelAdvance();
    const token = advanceToken;
    const minimum = new Promise(resolve => { advanceTimer = setTimeout(resolve, ms); });
    const spoken = clip ? playThrough(clip) : Promise.resolve();
    Promise.all([minimum, spoken]).then(() => { if (token === advanceToken) goNext(); });
  }

  function resetWordState() {
    buffer = input.clear();
    feedback = '';
    feedbackKind = '';
    solved = false;
    showAnswer = false;                       // Next resets Show Answer (critique 21)
  }
  // §2.3: moving stops whatever is being spoken and shows the word at once.
  // This is also where the scheduled advance lands, so it cancels its own
  // token on the way through — an advance that fires must not leave a live
  // timer behind it.
  function goNext() {
    cancelAdvance();
    stopAudio();
    wordIndex = (wordIndex + 1) % words.length;
    resetWordState();
  }
  function goPrev() {
    cancelAdvance();
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
    // W3.4: uppercase roman goes through the same capital table the tiles use,
    // so the desktop convenience layer can spell everything the tiles can.
    const g = greekForKey(e.key);
    if (g) { e.preventDefault(); appendChar(g); }
  }
  onMount(() => window.addEventListener('keydown', onKey));
  // §3.1: audio stops when the learner leaves the exercise, and a pending
  // advance does not fire into a destroyed component.
  onDestroy(() => { window.removeEventListener('keydown', onKey); cancelAdvance(); stopAudio(); });
</script>

<!-- data-word-index is the item the surface is ON. Chapter 7's adjective
     speller prints the SAME English prompt ("good") on six consecutive items
     and distinguishes them by their parse note, so "has the prompt changed"
     is not a sound way to observe an advance — the harness reads this. -->
<div class="card speller" data-word-index={wordIndex} data-word-count={words.length}>
  <div class="spell-panes">
    <div class="flash-pane"><div class="label">{activity.promptLabel || 'English Meaning'}</div>
      <!-- §2.5: the case or parse tag sits BESIDE the prompt on the same line,
           plain ink and smaller — "from God (not ἐκ)" (ch6railwalk p10),
           "from (gen.)" (p12), "good (acc. pl. masc.)" (ch7railwalk p6),
           "I (nom sg)" (ch8railwalk p9). Never tappable; nothing on this pane
           is. -->
      <div class="value" style="font-size:1.2rem">{word ? word.gloss : ''}{#if word && word.note}<span class="spell-prompt-note">{word.note}</span>{/if}</div>
      <!-- §3: a null ref renders NOTHING, not an empty chip. -->
      {#if word && word.ref}<div class="spell-prompt-ref">{word.ref}</div>{/if}
    </div>
    <!-- The answer field's caption is the original's, from the data: chapters
         6-8 spell PHRASES ("Spell Greek Phrase") where chapters 1-5 spell
         words. ui.fields is [prompt caption, answer caption]. -->
    <SpellerField
      state={buffer}
      label={(activity.ui?.fields && activity.ui.fields[1]) || 'Spell Greek Word'}
      locked={solved}
      on:caret={e => { if (!solved) buffer = input.placeCaret(buffer, e.detail.index, e.detail.after); }}
      on:caretEnd={() => { if (!solved) buffer = input.caretToEnd(buffer); }} />
  </div>

  <div class="feedback {feedbackKind}">{feedback}</div>
  <!-- §B4: the message appears on exactly the outcomes that WAIT. Since §B1a
       this speller has none — a correct spelling is already on its way to the
       next word — so this renders nothing today and would start rendering by
       itself if the class ever acquired a waiting outcome. -->
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
    <!-- §2.10: Show Answer prints the form the chapter PRINTS. Where the two
         differ that is the parenthesised one (ἐστί(ν)); the bare spelling is
         accepted just the same. -->
    <div class="spell-answer"><span class="label">Answer</span> <span class="greek">{word ? (word.alts[0] || word.greek) : ''}</span></div>
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

