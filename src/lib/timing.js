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
// outcome) were always faithful; only these two numbers move.
//
// THESE VALUES ARE RETROACTIVE. Chapter 2's per-activity `autoAdvanceMs: 4000`
// literals were removed from the data in 5D-SPEC2, so ch1, ch2 and ch3 all
// read the same two numbers. No component and no data file carries its own
// advance duration: the per-activity `autoAdvanceMs` override is gone from
// resolveAdvance as well as from the data.

export const ADVANCE_CORRECT_MS = 2000;
export const ADVANCE_INCORRECT_MS = 4000;

// How long a Major Hint stays on screen before clearing itself (5D device
// pass, Nathanael). The hint is a GLANCE, not a crib sheet: it is available at
// any time (D-11), but the learner has to ask for it again rather than leaving
// the verse parked next to the answer box while they copy it out. Lives here
// for the same reason the advance constants do — one number, one place.
export const HINT_VISIBLE_MS = 7000;

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
// attemptsPerItem / autoAdvanceOnIncorrect fields. Those map onto exactly the
// same three classes. The DURATION is no longer negotiable: the per-activity
// autoAdvanceMs override is gone (5D-SPEC2 §3), the ch2 literals that used it
// were removed from the data, and scripts/check-content-shapes.mjs fails the
// build if any data file re-introduces one.
export function resolveAdvance(policy) {
  const p = policy || {};
  const advanceClass = p.advanceClass || (
    p.attemptsPerItem === 1
      ? (p.autoAdvanceOnIncorrect === false ? 'manualOnIncorrect' : 'autoBoth')
      : 'retry'
  );
  return {
    advanceClass,
    oneAttempt: advanceClass !== 'retry',
    autoOnIncorrect: advanceClass === 'autoBoth',
    correctMs: ADVANCE_CORRECT_MS,
    incorrectMs: ADVANCE_INCORRECT_MS
  };
}
