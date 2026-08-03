# DRILL-MATRIX.md — auto-progress and timing, every drill and exercise

LIVING DOCUMENT. Canonical reference for how each scored surface
behaves: how many attempts, what happens on correct, what happens on
incorrect, and how long the app waits. Original behavior and port
behavior are both recorded, and every deliberate departure is marked
**[D-n]** against DIVERGENCE-LOG.md.

Updated 2026-07-28 (VERIFY-5D decisions A4, A5, B5, D1). New chapters
add rows here at spec time; the classes are fixed, so a new drill is
assigned to a class rather than given its own rule.

## 1. The two constants (D-14, ratified with new values in VERIFY-5D)

Every auto-advance in the app reads one of two numbers, defined once in
`src/lib/timing.js`:

| Constant | Value | Was | Applies to |
| --- | --- | --- | --- |
| `ADVANCE_CORRECT_MS` | **2000** | 900 (5D proposal) | every surface that auto-advances after a correct answer |
| `ADVANCE_INCORRECT_MS` | **4000** | 2500 (5D proposal) | only `autoBoth` surfaces |
| `HINT_VISIBLE_MS` | 7000 | — | spellVerse Major Hint linger (VERIFY-5D B6, ratified) |

2000/4000 restores the ORIGINAL's observed pace (~2s correct, ~4s
incorrect). The 900/2500 tuning proposed at 5D was rejected on device.
**These values are retroactive**: chapter 2's per-activity `4000`
literals and any 900ms component defaults are replaced by the shared
constants, so ch1, ch2 and ch3 all read the same two numbers. No
component or data file may carry its own advance duration.

## 2. The four classes

| Class | Attempts | On correct | On incorrect | Completion |
| --- | --- | --- | --- | --- |
| `retry` | unlimited until correct | auto-advance after CORRECT_MS | feedback, item stays open, student tries again | all items correct |
| `manualOnIncorrect` | 1 | auto-advance after CORRECT_MS | feedback + reveal, options lock, wait for **Next** | all items attempted |
| `autoBoth` | 1 | auto-advance after CORRECT_MS | feedback + reveal, auto-advance after INCORRECT_MS | all items attempted |
| `manual` | unlimited (Check Answer) | feedback, wait for Next | feedback, wait for Next | all items attempted |

**Is there a rule behind which class the original used?** Yes, and it
is consistent once stated: **the original auto-advances only when the
answer is a single tap, and it retries only when the item has no
"correct answer to reveal" beyond the tap itself.** Concretely:

- One-tap SELECT of a factual property (how many syllables, which
  accent rule) → `retry`. Nothing to reveal; repetition is the
  pedagogy.
- One-tap SELECT among content options (which Greek form, which
  translation, which parsing, which gloss) → **one attempt**, because
  a wrong tap reveals the right option and re-tapping would be
  meaningless. Whether it then waits for Next or advances itself is
  the one genuinely inconsistent axis in the original — chapter 3's
  verb drills wait, its Scripture Memory drill does not.
- TYPED or MANIPULATED answers (spelling, dividing syllables, placing
  an accent) → `manual`, always. The student drives Check Answer.

So: the class follows the INPUT MODE, and the only true irregularity
in the source material is auto-vs-manual on incorrect within
one-attempt select drills. The port keeps that irregularity where the
original had it rather than smoothing it, because it tracks a real
distinction — the SM drill's ten options are a memorization loop worth
cycling, the verb drills' wrong answer is worth sitting with.

## 3. Chapter 1

| Activity | Type | Original | Port | Class | Departure |
| --- | --- | --- | --- | --- | --- |
| Letter Names / Transliteration / Capitals / Diphthong "drills" | exploreGrid (contentAudio) | tap to hear, not scored | same | n/a | — |
| Vocabulary: Greek to English | select | 1 tap, retry until correct, ~2s | retry, CORRECT_MS | `retry` | — |
| Vocabulary: English to Greek | select | as above | as above | `retry` | — |
| Letter to Name | select | retry, ~2s | retry, CORRECT_MS | `retry` | — |
| Name to Letter | select | retry, ~2s | retry, CORRECT_MS | `retry` | — |
| Transliteration | select | retry, ~2s | retry, CORRECT_MS | `retry` | — |
| Transcribe | select | retry, ~2s | retry, CORRECT_MS | `retry` | — |
| Pronounce Letters | selfCheckStepper | self-paced, shuffled | same | `manual` | — |
| Phonetic Reading | selfCheckSequence | self-paced; audio on Answer only | same | `manual` | — |
| Reading: People and Places | selfCheckSequence | self-paced | same | `manual` | — |
| Vocabulary Spelling | spell | Check Answer, self-paced | same | `manual` | — |

## 4. Chapter 2

| Activity | Type | Original | Port | Class | Departure |
| --- | --- | --- | --- | --- | --- |
| Syllable Counting | select | retry until correct | retry | `retry` | — |
| Accent Rule | select | 1 attempt, reveal, ~4s correct, NO auto on incorrect | same, CORRECT_MS / manual | `manualOnIncorrect` | — |
| Marking Recognition | select | 1 attempt, ~4s both | same, CORRECT_MS / INCORRECT_MS | `autoBoth` | pool is 25, not the dialog's 35 **[D-6]** |
| Part of Speech | select | 1 attempt, ~4s both | same | `autoBoth` | — |
| Vocabulary: Greek to English | select | retry | retry | `retry` | — |
| Vocabulary: English to Greek | select | retry | retry | `retry` | — |
| Syllable Division | divide | Check Answer, reveal | same | `manual` | rebuilt as draggable dividers **[D-7]** |
| Accent Mark Placement | placeAccent | Check Answer, reveal | same | `manual` | 5 circumflex items merged in **[D-4]** |
| Vocabulary Spelling | spell | Check Answer | same | `manual` | — |

## 5. Chapter 3

| Activity | Type | Original | Port | Class | Departure |
| --- | --- | --- | --- | --- | --- |
| Verb Translating | select (6 opts) | 1 attempt, ~2s correct, manual Next on incorrect | same, CORRECT_MS | `manualOnIncorrect` | — |
| Greek Verb | select (3 opts) | as above | as above | `manualOnIncorrect` | — |
| Parsing | select (6 opts, 2 groups) | as above | as above | `manualOnIncorrect` | — |
| Vocabulary: Greek to English | select | 1 attempt, ~2s correct, manual on incorrect | same | `manualOnIncorrect` | — |
| Vocabulary: English to Greek | select | as above | same | `manualOnIncorrect` | — |
| Scripture Memory Drill | select (10 opts) | 1 attempt, ~2s correct, ~4s incorrect | same, CORRECT_MS / INCORRECT_MS | `autoBoth` | — |
| Present Active Verb Spelling | spell | Check Answer | same | `manual` | authored 3rd-plural is -ουσι, exactly as the original; leniency withdrawn **[D-16 WITHDRAWN]** |
| Vocabulary Spelling | spell | Check Answer | same | `manual` | — |
| Scripture Memory Spelling | spellVerse | one shot at the whole verse; hint hidden after typing starts | Major Hint always available **[D-11]**, "Restart Exercise" **[D-12]**, wrong word named not numbered **[D-13]** | `manual` | three departures, all usability |

## 6. Cross-cutting rules

**Revisiting an answered item resets it (NEW, VERIFY-5D A5).** In the
original, navigating back to an earlier item presents it fresh — the
student may guess again. The port was retaining the previous answer
and its correct/incorrect styling. Every scored surface must clear the
item's selection, feedback and lock state on revisit; the SCORE
already recorded for that item stands (the score counts attempts, not
current state), matching the original's score dialog.

**Scoring** is unchanged everywhere: Number Correct / Number Attempted
/ Percentage / items completed, shown on the Score button.

**"Pronounce Each Drill"** defaults ON wherever the original had it,
and plays the item's Greek audio on presentation.

**Option buttons never carry audio** (standing directive 9), in every
class and every chapter.

## 7. Where the port departs from the original — summary

Only four rows above are departures of BEHAVIOR rather than of
presentation, and all four were requested or ratified by Nathanael:

1. **[D-14]** timing centralized into two constants — values 2000/4000
   match the original's pace; the centralization is the departure.
2. **[D-11] [D-12] [D-13]** the three spellVerse usability changes.
3. **[D-6]** chapter 2's item count follows reality, not the dialog.
4. **[D-16] WITHDRAWN** — movable-nu leniency is GONE. See
   DIVERGENCE-LOG for why it should never have been added.

Everything else in this matrix is the original's own behavior.
