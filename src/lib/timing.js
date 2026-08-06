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

// THE FOUR ADVANCE CLASSES (DRILL-BEHAVIOR-RULES §B1, 5E-SPEC3 §1). There are
// four and there are no per-activity exceptions: a new activity is ASSIGNED to
// a class, and if it needs a fifth that is a finding to report, not a special
// case to write.
//
//   none               not scored
//   autoBoth           correct auto-advances; incorrect reveals the answer and
//                      auto-advances on the longer wait
//   manualOnIncorrect  correct auto-advances; incorrect reveals the answer,
//                      locks the surface and waits for Next
//   retryUntilRight    correct auto-advances; incorrect reveals NOTHING, keeps
//                      what was entered and leaves the item open for another
//                      attempt (all twelve spellers, plus ch2 Syllable Counting)
//
// THE CORRECT PATH IS NOT A CLASS PROPERTY (§B1a). Every correct answer
// auto-advances, in every class, on every surface. 5E-SPEC2 shipped two extra
// classes -- `spellUntilRight` and `manualCorrectAutoIncorrect` -- whose only
// distinguishing feature was waiting for Next on a CORRECT answer. That was
// never observed and never asked for; once §B1a was stated each of them
// collapsed into a class above (see DIVERGENCE-LOG D-28), which is why there
// are four rows here and not six.
//
// The two withdrawn names, and the older `retry`/`manual` pair that preceded
// them, are normalized below to the class they migrate to, so a stale cached
// data file behaves CORRECTLY at runtime rather than falling into an unknown
// branch. That is a safety net, not a supported spelling:
// scripts/check-content-shapes.mjs fails the build on anything outside the
// four, and names the migration when it sees a withdrawn one.
export const ADVANCE_CLASSES = [
  'none',
  'autoBoth',
  'manualOnIncorrect',
  'retryUntilRight'
];

// Withdrawn and legacy spellings -> the class they migrate to (5E-SPEC3 §1).
export const WITHDRAWN_CLASSES = {
  spellUntilRight: 'retryUntilRight',
  manualCorrectAutoIncorrect: 'autoBoth'
};
const LEGACY_CLASSES = { retry: 'retryUntilRight', manual: 'retryUntilRight', ...WITHDRAWN_CLASSES };

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

// The class, expanded into the questions a surface actually asks. Every scored
// component reads these flags rather than comparing class names, so adding a
// class means adding a row here and nothing else.
export function resolveAdvance(policy) {
  const advanceClass = classOf(policy || {});
  return {
    advanceClass,
    // A one-attempt item is finalized by the first answer, right or wrong.
    // `retryUntilRight` leaves a WRONG item open for another attempt.
    oneAttempt: advanceClass !== 'retryUntilRight',
    // §B1a: a constant, deliberately. No class, activity or chapter may opt
    // out of auto-advancing on a correct answer, so this is not a per-class
    // expression and a future class cannot quietly make it one. It stays a
    // field so the components keep asking the module rather than assuming, and
    // so that breaking §B1a would be one visible edit here.
    autoOnCorrect: true,
    autoOnIncorrect: advanceClass === 'autoBoth',
    // Revealing the answer would destroy an "until right" exercise (§B5/§C0a),
    // so that class never does it.
    revealOnIncorrect: advanceClass === 'autoBoth' || advanceClass === 'manualOnIncorrect',
    correctMs: ADVANCE_CORRECT_MS,
    incorrectMs: ADVANCE_INCORRECT_MS
  };
}

// §B4/5E-SPEC2 §5.5: if a surface waits, it must SAY so. One predicate, so the
// "Click Next to continue" line appears on exactly the outcomes that wait and
// never on an outcome something is about to move by itself.
//
// Since §B1a there is exactly ONE waiting outcome in the whole app:
// manualOnIncorrect on a WRONG answer. A correct answer never waits. A wrong
// answer on `retryUntilRight` does not qualify either — the item is still open
// and the next thing to do is try again, not press Next.
export function waitsForNext(advance, wasCorrect) {
  if (wasCorrect) return false;                       // §B1a, no exceptions
  return advance.oneAttempt && !advance.autoOnIncorrect;
}
