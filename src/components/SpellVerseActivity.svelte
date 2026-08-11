<script>
  // SCRIPTURE MEMORY SPELLING EXERCISE (5D, activity type `spellVerse`).
  // The whole verse is typed as free text and graded word by word against
  // answerWords[] when Check Answer is pressed — one surface, not a
  // word-at-a-time stepper, exactly as the original.
  //
  // Three logged departures from the original live here:
  //   D-11  The verse + translation are ALWAYS available; the original hides
  //         the verse once typing begins. REVISED 2026-08-07 (D-30): this was
  //         a "Major Hint" BUTTON that opened a panel above the keyboard and
  //         withdrew it again after HINT_VISIBLE_MS. It is now a `Show Answer`
  //         CHECKBOX beside `With Accents`, drawing below the keyboard, and it
  //         clears the moment typing resumes — which is what every other
  //         speller and drill in the app already does. One idiom, not two: the
  //         seven-second timer was this surface's alone and nothing else in
  //         the app made a learner race a clock.
  //   D-12  "Repeat This Exercise" is labelled "Restart Exercise".
  //   D-13  wrong/missing-word feedback names the WORD. The original prints a
  //         bare index ("The word you missed was: 2"), which tells a learner
  //         to go and count.
  // The keyboard it types on is the shared one (D-15): the same component the
  // word spellers mount, with the space bar and punctuation row Nathanael
  // selected at the Phase 0 checkpoint.
  // 5E-SPEC2 §2.5 / rule C7: the verse clip plays after a SUCCESSFUL spelling.
  // The whole-verse spellers played nothing at all before that round — the one
  // surface in the app where the learner had just reconstructed a verse from
  // memory and never got to hear it.
  //
  // The class is `retryUntilRight`, like every other speller: a wrong answer
  // keeps what was typed and reveals nothing. Rule B1b covers the correct
  // path here. This activity holds ONE item, so there is nothing to
  // auto-advance TO: it marks correct, plays the verse, and stops. Auto-driving
  // the sequential rail to the next activity would be a navigation surprise,
  // so the rail's Next stays the student's. Nothing waits and nothing says it
  // is waiting — 5E-SPEC2 shipped a "Click Next to continue" line here for the
  // withdrawn `spellUntilRight` class, and it is gone with the class (D-28).
  //
  // 5G-SPEC1 §4.5 adds the original's "Repeat This Exercise" CHECKBOX, which
  // first appears on this page in chapter 9. Default OFF; when it is on, a
  // successful Check Answer plays the verse (C7, as always) and then clears
  // the slate for another pass. Completion is unaffected — the exercise is
  // done the first time it is answered, and a learner choosing to type it
  // again is practising, not re-earning it. THESE SEMANTICS ARE EXTRAPOLATED,
  // not observed in DOSBox: VERIFY-5G item (d) settles them, and nothing
  // beyond replay-and-clear is invented here in the meantime.
  import { onMount, onDestroy } from 'svelte';
  import { randomFeedback } from '../lib/content.js';
  import { play, playThrough, stop as stopAudio } from '../lib/audio.js';
  import { markCompleted } from '../lib/progress.js';
  import { checkVerse } from '../lib/answer-check.js';
  import * as input from '../lib/speller-input.js';
  import SpellerKeyboard, { KEYMAP, PUNCT_KEYS } from './SpellerKeyboard.svelte';
  import SpellerField from './SpellerField.svelte';
  export let chapter;
  export let activity;

  $: answerWords = activity.answerWords || [];
  $: verseText = answerWords.join(' ');

  // The typing buffer is the shared model (lib/speller-input.js): a string, a
  // grapheme-cluster caret, and any diacritic still waiting for a letter. The
  // two VERIFY-5D A6 typing defects both lived in the hand-rolled version this
  // replaces — see that file for what each of them was.
  let buffer = input.clear();
  $: built = buffer.text;
  let feedback = '';
  let feedbackKind = '';
  let detail = null;          // { text, word? } — the word renders in the Greek face
  let showAnswer = false;
  let showKeyboard = false;
  let withAccents = false;
  let solved = false;
  // §4.5. Present only where the data declares it (chapters 9 and 10); the
  // three earlier whole-verse spellers have no such control in the original
  // and gain none here. `repeatToken` cancels a pending replay-then-clear the
  // way advanceToken does in SelectActivity: Restart, a route change or an
  // unmount must not have the slate cleared out from under it a clip later.
  // `destroyed` says the same thing for the unmount case in its own right,
  // because clearing state on a dead component is worth refusing explicitly
  // rather than by side effect (5G-XPATCH1 §1).
  $: repeatCheckbox = activity.repeatCheckbox === true;
  let repeatExercise = false;
  let repeatToken = 0;
  let destroyed = false;

  $: audioTiming = activity.audioTiming || 'afterGuess';

  const fallbackLetters = chapter.alphabet && chapter.alphabet.letters
    ? chapter.alphabet.letters.map(l => (l.lower === 'σ/ς' ? 'σ' : l.lower))
    : [];

  // §4.3, as on every other speller: Show Answer clears the moment typing
  // resumes. Every edit path goes through these four, so there is one place to
  // enforce it. Caret moves deliberately do NOT clear it — repositioning is
  // not typing, and the word spellers behave the same way.
  function typingResumed() { showAnswer = false; }
  function appendChar(ch) { if (!solved) { typingResumed(); buffer = input.insertText(buffer, ch); } }
  function appendMark(apply) { if (!solved) { typingResumed(); buffer = input.applyMark(buffer, apply); } }
  function backspace() { if (!solved) { typingResumed(); buffer = input.backspace(buffer); } }
  function clearInput() { if (!solved) { typingResumed(); buffer = input.clear(); } }
  function moveCaret(index, after) { if (!solved) buffer = input.placeCaret(buffer, index, after); }
  function caretToEnd() { if (!solved) buffer = input.caretToEnd(buffer); }

  function check() {
    const result = checkVerse(built, answerWords, {
      withAccents,
      punctuationOptional: activity.punctuationOptional !== false
    });
    if (result.ok) {
      solved = true;
      feedback = randomFeedback(chapter, 'correct');
      feedbackKind = 'ok';
      detail = null;
      // Completion is recorded on the FIRST success and is not touched by the
      // repeat pass (§4.5): the exercise stays done.
      markCompleted(activity.id);
      // §2.5 / C7: hear the verse you just spelled. Nothing is waiting on the
      // clip here — rule B1b: one item, so there is no next item for it to
      // talk over and nothing for the auto-advance to advance to.
      const repeating = repeatCheckbox && repeatExercise;
      if (audioTiming !== 'none' && activity.audio) {
        if (repeating) {
          // The verse is spoken in FULL before the slate clears — clearing it
          // under the clip would leave the learner listening to a verse that
          // is no longer on screen.
          //
          // AND ONLY IF IT ACTUALLY FINISHED (5G-XPATCH1 §1). playThrough
          // resolves false for a clip cut off by a route exit, a screen lock
          // or a superseding tap, and none of those is the learner hearing
          // their verse — wiping what they typed on the strength of a clip
          // that never played would be the worst possible reading of a
          // checkbox they ticked. The token and `destroyed` cover the other
          // half: a Restart or an unmount BETWEEN the success and the clip's
          // end, and the checkbox being unticked while it played.
          const token = ++repeatToken;
          playThrough(activity.audio).then(finished => {
            if (finished && repeatExercise && !destroyed && token === repeatToken) clearSlate();
          });
        } else {
          play(activity.audio);
        }
      } else if (repeating) {
        clearSlate();
      }
      return;
    }
    feedback = randomFeedback(chapter, 'incorrect');
    feedbackKind = 'bad';
    // D-13: name the word, not its position.
    detail = result.expected
      ? { text: 'The word you missed was:', word: result.expected }
      : { text: 'There are more words here than the verse has.' };
  }

  // An empty surface, ready to be typed again. Shared by Restart and by the
  // repeat pass, so "another go" means exactly one thing on this page.
  function clearSlate() {
    buffer = input.clear();
    feedback = '';
    feedbackKind = '';
    detail = null;
    solved = false;
    showAnswer = false;               // Restart resets it, as Next does elsewhere
  }

  function restart() {
    stopAudio();
    repeatToken += 1;                 // cancel a replay-then-clear in flight
    clearSlate();
  }

  function onKey(e) {
    if (showKeyboard) return;                     // the keyboard reference is a modal
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'Backspace') { e.preventDefault(); backspace(); return; }
    if (e.key === 'Enter') { e.preventDefault(); check(); return; }
    // Tap-to-position is the contract (A6 defect 1); the arrow keys are the
    // desktop convenience layer, same as KEYMAP.
    if (e.key === 'ArrowLeft') { e.preventDefault(); if (!solved) buffer = input.placeCaret(buffer, buffer.caret - 1, false); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); if (!solved) buffer = input.placeCaret(buffer, buffer.caret + 1, false); return; }
    if (PUNCT_KEYS[e.key]) { e.preventDefault(); appendChar(PUNCT_KEYS[e.key]); return; }
    const g = KEYMAP[e.key.toLowerCase()];
    if (g) { e.preventDefault(); appendChar(g); }
  }
  onMount(() => window.addEventListener('keydown', onKey));
  onDestroy(() => {
    window.removeEventListener('keydown', onKey);
    destroyed = true;
    repeatToken += 1;                              // no clear after unmount
    stopAudio();                                   // §3.1
  });
</script>

<div class="card speller spellverse">
  {#if activity.reference}<div class="sv-ref">{activity.reference}</div>{/if}

  <SpellerField
    state={buffer}
    label={activity.ui?.fields?.[0] || 'Spell Greek'}
    fieldClass="sv-target"
    locked={solved}
    on:caret={e => moveCaret(e.detail.index, e.detail.after)}
    on:caretEnd={caretToEnd} />

  <div class="feedback {feedbackKind}">{feedback}</div>
  {#if detail}
    <div class="sv-detail" role="status">{detail.text}{#if detail.word}&nbsp;<span class="greek sv-word">{detail.word}</span>{/if}</div>
  {/if}

  <div class="controls grouped">
    <button class="btn" disabled={!activity.audio} on:click={() => activity.audio && play(activity.audio)}>Pronounce</button>
    <button class="btn" on:click={check}>Check Answer</button>
    <button class="btn secondary" on:click={() => (showKeyboard = true)}>Greek Keyboard</button>
    <button class="btn secondary" on:click={restart}>Restart Exercise</button>
  </div>

  <div class="spell-checks">
    <label><input type="checkbox" bind:checked={showAnswer} /> Show Answer</label>
    <label><input type="checkbox" bind:checked={withAccents} /> With Accents</label>
    {#if repeatCheckbox}
      <label data-repeat-exercise><input type="checkbox" bind:checked={repeatExercise} /> Repeat This Exercise</label>
    {/if}
  </div>

  <SpellerKeyboard
    tilesRef={activity.spellerTilesRef}
    inlineTiles={activity.spellerTiles}
    {fallbackLetters}
    bind:showHelp={showKeyboard}
    on:insert={e => appendChar(e.detail)}
    on:mark={e => appendMark(e.detail)}
    on:backspace={backspace}
    on:clear={clearInput} />

  <!-- BELOW the keyboard, where every other speller puts its answer (D-11 as
       revised). The reference and translation come with it because on this
       surface the "answer" IS the whole verse. -->
  {#if showAnswer}
    <div class="spell-answer sv-answer">
      <span class="label">{activity.reference || 'Answer'}</span>
      <span class="greek sv-verse">{verseText}</span>
      {#if activity.translation}<span class="sv-translation">{activity.translation}</span>{/if}
    </div>
  {/if}
</div>
