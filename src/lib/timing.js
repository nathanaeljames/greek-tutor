// ADVANCE TIMING — the single source (5D-SPEC "Timing and advance semantics",
// divergence log D-14). No component and no activity carries its own timing
// number: a surface declares WHAT it does (answerPolicy.advanceClass) and this
// module says HOW LONG it waits. Nathanael retunes the feel by editing the two
// constants here, once, for the whole app.
//
// The original's per-surface waits were ~2s on correct and ~4s on incorrect.
// The 5D proposal tuned them down to 900/2500; the device pass REJECTED that
// (VERIFY-5D, D-14 ratified at the values below) and the port now restores the
// original's pace. The SEMANTICS (which surfaces auto-advance, and on which
// outcome) come from DRILL-BEHAVIOR-LEDGER.csv; only these two numbers move.
//
// THESE VALUES ARE RETROACTIVE. Chapter 2's per-activity `autoAdvanceMs: 4000`
// literals were removed from the data in 5D-SPEC2, so every chapter reads the
// same two numbers. No component and no data file carries its own advance
// duration: the per-activity `autoAdvanceMs` override is gone from
// resolveAdvance as well as from the data.
//
// 5E-SPEC2 §2.2 adds ONE modifier and it is not a number either: where the
// activity's audioTiming is `afterGuess`, the clip must FINISH before the next
// item appears, so the effective wait is max(class minimum, audio duration).
// The waiting is done by the components through audio.js's playThrough(); the
// minimum still comes from here and from nowhere else.

export const ADVANCE_CORRECT_MS = 2000;
export const ADVANCE_INCORRECT_MS = 4000;

// How long a Major Hint stays on screen before clearing itself (5D device
// pass, Nathanael). The hint is a GLANCE, not a crib sheet: it is available at
// any time (D-11), but the learner has to ask for it again rather than leaving
// the verse parked next to the answer box while they copy it out. Lives here
// for the same reason the advance constants do — one number, one place.
export const HINT_VISIBLE_MS = 7000;

// THE SIX ADVANCE CLASSES (DRILL-BEHAVIOR-RULES §B1, 5E-SPEC2 §1). There are
// six and there are no per-activity exceptions: a new activity is ASSIGNED to
// a class, and if it needs a seventh that is a finding to report, not a
// special case to write.
//
//   none                        not scored
//   autoBoth                    correct auto-advances; incorrect reveals the
//                               answer and auto-advances on the longer wait
//   manualOnIncorrect           correct auto-advances; incorrect reveals the
//                               answer, locks the surface and waits for Next
//   retryUntilRight             correct auto-advances; incorrect reveals
//                               NOTHING and the item stays open (ch2 Syllable
//                               Counting is the only non-speller in this class)
//   manualCorrectAutoIncorrect  correct waits for Next; incorrect reveals the
//                               answer and auto-advances (ch2 Syllable
//                               Division and Accent Mark Placement)
//   spellUntilRight             correct waits for Next; incorrect reveals
//                               nothing, KEEPS what was typed, retry or Next
//
// `retryUntilRight` replaces the old `retry` and `spellUntilRight` replaces the
// old `manual`; both legacy names are still normalized below so a data file
// that predates the ledger cannot silently fall into the wrong branch.
// scripts/check-content-shapes.mjs fails the build on anything outside the six.
export const ADVANCE_CLASSES = [
  'none',
  'autoBoth',
  'manualOnIncorrect',
  'retryUntilRight',
  'manualCorrectAutoIncorrect',
  'spellUntilRight'
];

const LEGACY_CLASSES = { retry: 'retryUntilRight', manual: 'spellUntilRight' };

// Chapter 2 predates advanceClass and declares its policy with the older
// attemptsPerItem / autoAdvanceOnIncorrect fields; the delivered data now
// carries advanceClass everywhere, so this is the fallback for a data file
// that has not been through scripts/apply-behavior-matrix.py.
function classOf(policy) {
  const declared = policy.advanceClass;
  if (declared) return LEGACY_CLASSES[declared] || declared;
  if (policy.attemptsPerItem === 1) {
    return policy.autoAdvanceOnIncorrect === false ? 'manualOnIncorrect' : 'autoBoth';
  }
  return 'retryUntilRight';
}

// The class, expanded into the four questions a surface actually asks. Every
// scored component reads these flags rather than comparing class names, so
// adding a class means adding a row here and nothing else.
export function resolveAdvance(policy) {
  const advanceClass = classOf(policy || {});
  return {
    advanceClass,
    // A one-attempt item is finalized by the first answer, right or wrong. The
    // two "until right" classes leave a wrong item open for another attempt.
    oneAttempt: advanceClass !== 'retryUntilRight' && advanceClass !== 'spellUntilRight',
    autoOnCorrect: advanceClass === 'autoBoth'
      || advanceClass === 'manualOnIncorrect'
      || advanceClass === 'retryUntilRight',
    autoOnIncorrect: advanceClass === 'autoBoth'
      || advanceClass === 'manualCorrectAutoIncorrect',
    // Revealing the answer would destroy an "until right" exercise (§B5), so
    // those two classes never do it.
    revealOnIncorrect: advanceClass === 'autoBoth'
      || advanceClass === 'manualOnIncorrect'
      || advanceClass === 'manualCorrectAutoIncorrect',
    correctMs: ADVANCE_CORRECT_MS,
    incorrectMs: ADVANCE_INCORRECT_MS
  };
}

// §B4/5E-SPEC2 §5.5: if a surface waits, it must SAY so. One predicate, so the
// "Click Next to continue" line appears on exactly the outcomes that wait and
// never on an outcome something is about to move by itself.
//
// A wrong answer on an "until right" class does NOT qualify: the item is still
// open and the next thing to do is try again, not press Next. The three
// waiting outcomes are manualCorrectAutoIncorrect/spellUntilRight on correct
// and manualOnIncorrect on incorrect — exactly 5E-SPEC2 §5.5's list.
export function waitsForNext(advance, wasCorrect) {
  if (wasCorrect) return !advance.autoOnCorrect;
  return advance.oneAttempt && !advance.autoOnIncorrect;
}
