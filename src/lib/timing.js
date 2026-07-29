// ADVANCE TIMING — the single source (5D-SPEC "Timing and advance semantics",
// divergence log D-14). No component and no activity carries its own timing
// number: a surface declares WHAT it does (answerPolicy.advanceClass) and this
// module says HOW LONG it waits. Nathanael retunes the feel by editing the two
// constants here, once, for the whole app.
//
// The original's per-surface waits were ~2s on correct and ~4s on incorrect.
// Both read slow on device (5B), so the port ships the numbers below; the
// SEMANTICS (which surfaces auto-advance, and on which outcome) stay faithful.

export const ADVANCE_CORRECT_MS = 900;
export const ADVANCE_INCORRECT_MS = 2500;

// The three advance classes (D-14 matrix):
//   retry             attempts until correct; correct auto-advances, a wrong
//                     answer leaves the item open (ch1 drills, ch2 syllable
//                     counting and accent rule)
//   manualOnIncorrect one attempt; correct auto-advances, incorrect reveals
//                     the answer, locks the options and waits for Next
//                     (ch3's three verb drills + both vocab drills)
//   autoBoth          one attempt; both outcomes auto-advance, incorrect on
//                     the longer wait (ch3 Scripture Memory Drill)
//
// Chapter 2 predates advanceClass and declares its policy with the older
// attemptsPerItem / autoAdvanceMs / autoAdvanceOnIncorrect fields. Those map
// onto exactly the same three classes and an explicit autoAdvanceMs still
// wins, so ch2's shipped ~4s feel is unchanged until it is retuned at its next
// touch (D-14).
export function resolveAdvance(policy) {
  const p = policy || {};
  const advanceClass = p.advanceClass || (
    p.attemptsPerItem === 1
      ? (p.autoAdvanceOnIncorrect === false ? 'manualOnIncorrect' : 'autoBoth')
      : 'retry'
  );
  // `?? ` and not `||`: chapter 2 writes autoAdvanceMs: null to mean "the
  // default", which is what the components did with it before this module.
  const correctMs = p.autoAdvanceMs ?? ADVANCE_CORRECT_MS;
  return {
    advanceClass,
    oneAttempt: advanceClass !== 'retry',
    autoOnIncorrect: advanceClass === 'autoBoth',
    correctMs,
    incorrectMs: p.autoAdvanceMs ?? ADVANCE_INCORRECT_MS
  };
}
