# 5E-SPEC2.md — cohort 5E round 2: behavior correction across chapters 1-5

Date: 2026-08-06. Base: the Sol 5E-SPEC1 tree with XPATCH1 applied.
Single implementer, in place. No branches, no pushes.

Companion documents, both NEW and both canonical from this round on:

- **DRILL-BEHAVIOR-RULES.md** — the ruleset governing drill and exercise
  behavior, derived from Nathanael's DOSBox pass over all 50 drills and
  exercises in chapters 1-5.
- **DRILL-BEHAVIOR-LEDGER.csv** — the per-activity record: what the
  ORIGINAL does, and the TARGET the port must reach.

**These two replace DRILL-MATRIX.md, which is deleted this round.** It
was built from screenshots and inference and was wrong on 23 of 50 rows.
Do not consult it, and do not port anything forward from it.

Deliverables: `5E-SPEC2-RESULTS.md` and `5E-SPEC2-BUILD.md`. The BUILD
document must contain the complete `git diff` against your starting
commit, embedded inline, plus any new files' contents. Structure both as
in the previous round; no separate templates this time.

## 0. What is already done, and what you must not redo

**The data is already correct. Do not edit `src/data/*.json` for
behavior.** All five chapter files ship with this spec, restamped by the
pipeline, and now carry:

- `audioTiming` on every drill and exercise: one of `beforeGuess`,
  `afterGuess`, `afterTap`, `afterCheck`, `none`.
- `answerPolicy.advanceClass` from the six-class vocabulary in
  DRILL-BEHAVIOR-RULES §B1, with `attemptsPerItem` set to match.
- `ui.defaults.pronounceEach: true` everywhere the checkbox exists —
  thirteen activities were wrong.
- Previous/Next removed from `c3_drill_vocab_gk_en` and
  `c3_drill_vocab_en_gk`, which had them and should not.
- Em dashes in place of the eight displayed double hyphens.

`scripts/apply-behavior-matrix.py` ships too. It reads the ledger and
stamps these fields onto any chapter file, and it **must run after every
`assemble_chNN.py`** from now on — otherwise a regenerated chapter
silently reverts to whatever the assembler hard-coded. It fails loudly
if an activity has no CONFIRMED ledger row, which is how chapters 6-8
will be prevented from shipping unverified.

Your job is the CODE that reads these fields. Nothing in §1-§6 requires
a data edit; if you believe one does, stop and report it.

## 1. The six advance classes

`advanceClass` currently has four values in the renderer. It now has
six. Two are new and two change meaning.

| Class | On correct | On incorrect |
| --- | --- | --- |
| `autoBoth` | auto-advance | reveal the answer, auto-advance |
| `manualOnIncorrect` | auto-advance | reveal the answer, wait for Next |
| `retryUntilRight` | auto-advance | do NOT reveal, item stays open for another attempt |
| `manualCorrectAutoIncorrect` | wait for Next | reveal the answer, auto-advance |
| `spellUntilRight` | wait for Next | do NOT reveal, KEEP what was typed, retry or Next |
| absent | not scored | not scored |

`retryUntilRight` replaces the old `retry`; `spellUntilRight` replaces
the old `manual` on spellers; `manualCorrectAutoIncorrect` is new and is
used by chapter 2's Syllable Division and Accent Mark Placement
exercises, which wait on correct but auto-advance on incorrect.

Minimum delays stay `ADVANCE_CORRECT_MS` = 2000 and
`ADVANCE_INCORRECT_MS` = 4000, shared, with no per-activity override.
`check:shapes` must now fail the build on any `advanceClass` outside the
six, in addition to its existing `autoAdvanceMs` guard.

**Departures from the original, deliberate, keep them:** the spellers do
not clear the slate on a wrong answer (the original does; the port has a
manual Clear button for that), and the Syllable Counting Drill does not
reveal the answer on a wrong guess (the original does).

## 2. Audio timing — the largest change in this round

Read `audioTiming` from the activity. Do not infer it from the prompt
language at runtime; the data already encodes the decision.

**2.1 `beforeGuess`** — play the prompt clip when the item appears, as
today.

**2.2 `afterGuess`** — play the clip AFTER the answer is given, and
**the clip must finish before the next item appears**. The advance delay
becomes:

```
delay = max(classMinimum, audioDuration)
```

never shorter than 2000/4000, longer whenever the clip needs it. Today
the clip starts and the next question replaces it mid-word, which is the
single most confusing thing in the app.

**2.3 Pressing Next stops the audio and advances immediately.** The wait
in 2.2 is a courtesy, not a lock.

**2.4 `afterTap` / `afterCheck` / `none`** — explore grids play on tap,
self-check surfaces play when the answer is revealed, and `none` plays
nothing. No advance interaction.

**2.5 The whole-verse spellers play the verse clip after a successful
spelling.** They currently play nothing at all. Chapters 3, 4 and 5.

## 3. Audio lifecycle — three real bugs

**3.1 Audio must stop on navigation away.** Nathanael reproduced this:
start Say Whole List on chapter 4's Masculine Declension, navigate to
Neuter Declension and then to Word Order, and the λόγος paradigm is
still reading. It predates chapter 4 and is present in earlier chapters.

Stopping must cover all three exits: the sequential rail, a topic switch
inside a `topicPages` activity, and a route change. A topic switch is
the one most likely to be missed — it does not remount the activity.

**3.2 Audio must pause when the device screen turns off** and not resume
by itself. Use `visibilitychange` (and `pagehide` for the iOS Safari
case, where `visibilitychange` is unreliable). Verify on device.

**3.3 A new tap interrupts the current clip cleanly.** Already true.
Keep it true, and assert it.

## 4. Spelling exercises

**4.1 Final forms are REQUIRED.** ἄγγελος must not validate with a
non-final sigma in final position. The original enforces this; the port
does not. All chapters.

**4.2 Breathing marks are REQUIRED even with "With Accents" OFF.** The
checkbox governs acute, grave and circumflex — nothing else. ἀδελφός
must not validate without its smooth breathing at either setting. All
chapters.

**4.3 `Show Answer` clears as soon as typing resumes.** Does not apply
to Major Hint on the whole-verse spellers.

**4.4 A wrong answer keeps what was typed** and never reveals the
correct spelling. This is `spellUntilRight`; see §1.

Punctuation stays optional (D-18, unchanged).

## 5. Layout, typography, and the "click Next" message

**5.1 Every modal, popup and expander must scroll to its close control**
at every supported width down to 320px. Reported case: chapters 4 and 5,
any drill, Hint then Meanings — the card scrolls well past the close
button, which never comes fully on screen. **Audit every modal surface
in every chapter**, not only the reported one, and report the list you
checked.

**5.2 Every list uses hanging indents**, everywhere — teaching pages,
popups, hint dialogs, bibliographies. Known offenders: chapter 2's
Syllable Division hint, chapter 2's Accent Rule Drill hint and its six
points, the three syllable rules in the Syllable Division exercise. Not
exhaustive; audit all of them.

**5.3 In chapter 2's Accent Rule Drill hint, underline "Nouns are
retentive" and "Verbs are recessive."**

**5.4 Two hyphens are never displayed.** The eight in the data are
already fixed. Sweep the UI copy — components, labels, dialogs — for any
remaining `--`.

**5.5 Where an activity waits for Next, say so.** Any surface whose
class waits (`manualOnIncorrect`, `manualCorrectAutoIncorrect`,
`spellUntilRight`) shows a message after the answer telling the student
to click Next. Some already do; make it universal and consistent.

**5.6 Greek AND English option grids are two-up at phone width, four-up
at 768px.** The English-gloss grids on the Greek-to-English vocabulary
drills currently render four-up at all widths. D-19 applies to every
option grid in every chapter, past and future. The paradigm-shaped grids
stay two-up at every width (D-26) and are the only exception.

## 6. Tests

Extend `ui:behavior` to assert, per class and per chapter:

1. Advance behavior for all six classes — correct and incorrect paths.
2. `afterGuess` audio completes before the next item renders, including
   one clip longer than 2000ms.
3. Next during `afterGuess` playback stops audio and advances at once.
4. Audio stops on rail navigation, topic switch, and route change.
5. Speller rejects a missing final form and a missing breathing mark
   with "With Accents" off.
6. `Show Answer` clears on typing.
7. Every modal reaches its close control at 320px.
8. Option grids: two-up at 320px, four-up at 768px, except paradigm
   grids.

Regression: chapters 1-5 green on both harnesses. **Chunk hashes for all
five chapters WILL change this round** — the data was restamped
deliberately. Report the new hashes rather than treating the change as a
failure.

Device items (Nathanael, in VERIFY-5E2): screen-off audio pause, real
WebKit modal scrolling, and the `afterGuess` timing feel.

## 7. Out of scope

Chapters 6+; the audio storage layer; the service worker; any content
change; any refactoring not required above.
