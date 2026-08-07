# DRILL-BEHAVIOR-RULES.md

Derived 2026-08-06 from Nathanael's DOSBox pass over every drill and
exercise in chapters 1-5, second revision
(`drill_behavior_unify_2.xlsx`), which corrected the
`Behavior on correct?` column. Re-deriving the ledger from that revision
changed nothing in any chapter file, so the four classes below are
confirmed against two independent passes.

Extended 2026-08-07 with Nathanael's verified pass over chapters 6-8.
**All 78 rows across all eight chapters are now CONFIRMED — this is the
first point at which the ledger has no open rows.** One new sub-rule,
A1a below, came out of that pass: five predictions built from the rest
of this document were wrong, all in the same direction, and the
explanation turned out to be architectural rather than linguistic. **This document
and `DRILL-BEHAVIOR-LEDGER.csv` together replace DRILL-MATRIX.md**,
which was built from screenshots and inference and was wrong on 23 of
50 rows.

The ledger is the per-activity record. This document is the ruleset:
when a future chapter's behavior has not been observed in DOSBox, these
rules are the default, and a spec may only depart from them by naming
the rule and saying why.

---

## A. Audio timing

**A1. Audio timing follows the PROMPT LANGUAGE, not the activity type.**
This is the single rule that explains most of the table.

- **Greek prompt → audio plays BEFORE the guess** (`beforeGuess`). The
  student sees the Greek, hears it, then answers. Hearing it is part of
  learning it.
- **English prompt → audio plays AFTER the guess** (`afterGuess`).
  Pronouncing the Greek before the answer would hand over the answer.

Applies uniformly: Vocabulary Greek-to-English is `beforeGuess`,
Vocabulary English-to-Greek is `afterGuess`, and every spelling exercise
whose prompt is an English gloss is `afterGuess`. It also covers the
drills whose prompt is an English sentence with an underlined word (the
Greek Verb, Greek Noun and First Declension Noun drills): `afterGuess`.

**A1a. A long multi-word Greek phrase defers its audio to
`afterGuess` even when Greek is the prompt — because the ORIGINAL
cannot accept a guess while its own audio is playing.** A1's
before/after split was derived from single-word and short-phrase
prompts (vocabulary lemmas, individual paradigm forms) where the delay
before the student can act is negligible. The five "Translation Drill"
activities in chapters 6-8 (Preposition, Adjective, "Eimi", Personal
Pronoun, Autos) prompt with a multi-word Greek phrase, and in DOSBox the
student is locked out of clicking until that clip finishes. Making the
student wait several seconds before they can even attempt an answer is
the actual defect A1a describes; the original's fix was to defer the
clip until after the guess, which sidesteps the wait rather than
shortening it.

**The port does not share the input-lockout constraint the original
has**, so this rule has no functional necessity for the port — a
multi-word `beforeGuess` clip could play in the port while the option
grid stays fully interactive underneath it, and nothing would break.
**Rule anyway: match the original's audioTiming value for uniformity.**
Do not re-derive this case from "Greek is the prompt, so play before" —
check length/word-count first. A drill whose Greek prompt is a single
word or short paradigm form stays `beforeGuess` (every Case Drill and
every Vocabulary Greek-to-English drill in chapters 1-8 confirms this);
a drill whose Greek prompt is a multi-word phrase is `afterGuess`
regardless of which language is textually first.

**A2. `afterGuess` audio must FINISH before the next item appears.** The
advance delay is `max(class minimum, audio duration)` — never shorter
than the class minimum, longer whenever the clip needs it. Audio playing
over the top of the next question is the defect this rule exists to
prevent.

**A3. Pressing Next stops the audio and shows the next item at once.**
The wait in A2 is a courtesy, not a lock.

**A4. Audio stops the moment the user navigates away** from the page or
topic that started it — including rail navigation, topic switches inside
a `topicPages` activity, and route exits. A whole-paradigm clip that
keeps reading over the next page is a bug, not a feature.

**A5. A new tap interrupts the currently playing clip.** Two clips never
overlap. (Already true; stated so it stays true.)

**A6. Audio pauses when the device screen turns off** and does not
continue in the background.

**A7. `Pronounce Each Drill` / `Pronounce Each Exercise` defaults to ON**
wherever the checkbox exists. Spelling exercises are the ones that were
wrong; the rule is general.

**A8. Non-scored explore surfaces play on tap** (`afterTap`), and
self-check surfaces play when the answer is revealed (`afterCheck`).
Neither has a guess, so before/after does not apply to them.

---

## B. Advance behavior

**B1. There are FOUR classes and no per-activity exceptions.** A new
activity is ASSIGNED to a class. If it needs a fifth, that is a finding
to report, not a special case to write.

| Class | On correct | On incorrect |
| --- | --- | --- |
| `none` | not scored | not scored |
| `autoBoth` | auto-advance | reveal the answer, auto-advance |
| `manualOnIncorrect` | auto-advance | reveal the answer, wait for Next |
| `retryUntilRight` | auto-advance | do NOT reveal, item stays open for another attempt |

**B1a. EVERY correct answer auto-advances. There are no exceptions and
no class may introduce one.** Nathanael, 2026-08-06, overriding both the
original and the port: 13 of 14 spelling exercises observe "no
autoprogress" on correct in DOSBox, and the port copied that. It is
wrong for the port regardless. Auto-advance is subject to A2, so the
`afterGuess` clip still finishes first.

An earlier six-class table had `spellUntilRight` and
`manualCorrectAutoIncorrect` waiting on correct. Both were errors of
mine, never observed and never requested; each collapsed into a class
above once B1a was stated. See DIVERGENCE-LOG D-28.

**B1b. A single-item activity has nothing to advance to.** The three
whole-verse spellers hold one verse each. They take `retryUntilRight`
like every other speller, and the auto-advance is a no-op there: mark
correct, stop, leave the sequential rail to the student. Auto-driving
the rail would be a navigation surprise.

**B2. Minimum delays are `ADVANCE_CORRECT_MS` = 2000 and
`ADVANCE_INCORRECT_MS` = 4000**, shared by every surface, and subject to
A2. No per-activity override, ever.

**B3. Previous/Next presence predicts advance behavior, and the
direction is the opposite of the obvious one.** An activity with NO
Previous/Next pair auto-advances on both outcomes, because the student
has no way to move themselves. An activity WITH the pair may wait.

Nathanael's rule 3 as stated — "any drill without Previous/Next uses
autoprogress" — holds in every observed row. The converse does not:
having the buttons does not force manual advance (the Marking
Recognition and Part of Speech drills have them and still wait, but the
Syllable Division and Accent Mark exercises have them and auto-advance
on incorrect).

**B4. If an activity waits for Next, it must SAY so.** A dialog or
banner appears after the answer telling the student to click Next. If a
surface waits and says nothing, add the message.

**B5. Multi-guess is not spelling-only.** Nathanael's rule 4 as stated
is nearly right but has one exception: the **Syllable Counting Drill**
(ch2) is `retryUntilRight` alongside the spellers. The accurate rule: **an activity allows
repeated guesses only when revealing the answer would destroy the
exercise.** For a speller the answer IS the exercise; for syllable
counting the answer is a number the student must arrive at. Everything
else reveals and moves on.

**B6. "Try again" in the feedback pool means nothing.** Feedback strings
are drawn from a shared chapter-level pool and carry no information
about attempts, advance, or class. Nathanael's rule 6, and the specific
error that produced most of the wrong rows in DRILL-MATRIX.md. **Never
infer behavior from a feedback string.**

---

## C. Spelling exercises

**C0. A correct answer auto-advances**, exactly as everywhere else
(B1a). Spelling exercises are not special on the correct path; they are
special only on the wrong path.

**C0a. A wrong answer NEVER reveals the correct spelling.** All twelve
spellers are `retryUntilRight`. The original does not reveal, and
revealing would end the exercise. `Show Answer` is the opt-in route and
stays that way (C2).

**C1. A wrong answer keeps what the student typed.** The original clears
the slate; the port deliberately does not — there is a manual Clear
button for that. Standing divergence.

**C2. A wrong answer never reveals the correct spelling.** `Show Answer`
is opt-in and stays that way.

**C3. `Show Answer` clears as soon as typing resumes.** On every
spelling surface without exception, including the whole-verse spellers
(see C8). A caret move is not typing and does not clear it.

**C4. Final forms are REQUIRED.** Final sigma is not optional: ἄγγελος
must not be accepted as ἄγγελοϲ or with a medial sigma in final
position. The original enforces this and the port does not.

**C5. Breathing marks are REQUIRED even with "With Accents" OFF.**
"With Accents" governs ACCENTS — acute, grave, circumflex — and nothing
else. ἀδελφός must not be accepted without its smooth breathing. The
original enforces this at both settings.

**C6. Punctuation stays optional** on the whole-verse spellers (D-18,
unchanged).

**C7. Whole-verse spellers play the verse audio after a successful
spelling.** They currently play nothing.

**C8. `Show Answer` IS THE ONE REVEAL CONTROL. There is no
`Major Hint`, on any surface, ever again.** Standing contract,
Nathanael 2026-08-07 (divergence log D-30). Every spelling exercise and
drill reveals its answer the same way:

  * a **checkbox** labelled `Show Answer`, beside `With Accents` where
    that exists — never a button;
  * the panel draws **BELOW the keyboard**, where every other answer in
    the app appears;
  * it clears **when typing resumes** (C3) — never on a timer.

The whole-verse spellers were the one exception: a `Major Hint` button
opening a panel above the keyboard that withdrew itself after 7
seconds. That was the app's only self-hiding reveal and its only
timed one, and it is gone. `HINT_VISIBLE_MS` is deleted from
`timing.js`; do not reintroduce it. Nothing in this app makes a learner
race a clock.

A new chapter's data may not declare a `Major Hint` button. What it
declares must match what the surface renders.

**C9. AN ELISION MARK AND A SMOOTH BREATHING ARE DIFFERENT MARKS AND
ARE NEVER INTERCHANGEABLE.** Nathanael, 2026-08-07.

  * The elision mark is **U+0027**, everywhere: in the verses, in the
    chapter-2 pages that teach it, and in the drills that score it.
    `check:shapes` fails on any other spelling of it in rendered data.
  * A smooth breathing is a **diacritic on a vowel**; an apostrophe is
    a **spacing character** standing for a dropped letter.
  * The checker accepts neither for the other. Answer has an
    apostrophe, only an apostrophe passes; answer has a breathing, only
    that breathing passes. U+1FBD and the curled quotes still fold to
    U+0027, because those are alternate ENCODINGS of the same spacing
    mark — that is normalization, not leniency.
  * **The mark is REQUIRED where a verse elides.** Omitting it is a
    misspelling, unlike sentence punctuation (C6/D-18), because it
    stands for a letter that was dropped.

The ORIGINAL had no apostrophe key and drew elision as a breathing on
the preceding vowel. The port has the key (D-29) and does not imitate
the workaround. The coronis (crasis: κἀγώ, τοὔνομα) is a real
combining breathing and is compared exactly, like every other mark.

---

## D. Layout and typography

**D1. Every list uses hanging indents** — teaching pages, popups, hint
dialogs, bibliographies, everywhere — unless a rule explicitly says
otherwise.

**D2. Two hyphens are never displayed.** `--` becomes an em dash
throughout the app, in data and in UI copy.

**D3. Every modal, popup and expander must be fully scrollable to its
close control** at every supported width. A close button the user cannot
reach is a trap. Check every modal surface, not only the one that was
reported.

**D4. Greek option grids are two-up at phone width and four-up at the
768px iPad breakpoint** (D-19), and this applies to ALL chapters, past
and future, including the English-gloss grids on the Greek-to-English
vocabulary drills.

**D5. Paradigm-shaped option grids are exempt from D4** and stay two
columns at every width, because their columns are singular and plural
(D-26).

---

## E. Using these rules

**E1. Order of authority:** DOSBox observation > this document > the
spec > inference. Inference is last and is marked as such.

**E2. A chapter's ledger rows are filled from DOSBox BEFORE its spec is
written.** The 5E round proved the alternative: 23 of 50 rows wrong,
carried into shipped data, corrected a round later.

**E3. When a rule and an observation disagree, the observation wins and
the rule gets amended here**, with the row that broke it named.

**E4b. A same-chapter precedent is not enough when more than one shape
exists in that chapter.** Chapter 3 has two verb drills with opposite
audioTiming — Verb Translating Drill (`beforeGuess`, bare Greek form)
and Greek Verb Drill (`afterGuess`, English sentence with an underlined
word). A chapter-6 prediction matched the first by name resemblance
("Translation" / "Translating") without confirming which SHAPE the
new drill actually had, and picked wrong. When a chapter offers more
than one candidate precedent, name similarity is not a tiebreaker;
locate the actual prompt pool and read it, or mark the prediction
low-confidence and say why.

**E4a. A rule may not be derived from a value nobody wrote down.**
The six-class table invented "wait for Next on correct" for fourteen
activities from a column that was never marked for change. Once it was
in a table it propagated without re-checking. Every cell of a rule
table must trace to an observation or to an explicit instruction, and
the ones that do not must be marked.

**E4. Never infer behavior from:** a feedback string (B6), the presence
of a button, the name of an activity, or how the same-named activity
behaves in another chapter. The Vocabulary drills changed class between
chapters in DRILL-MATRIX.md purely because of that last error.
