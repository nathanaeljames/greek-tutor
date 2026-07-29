# VERIFY-5D.md — device verification for the 5D build (chapter 3)

Scope: the code shipped in 5D — chapter 3 (Present Active Verbs, 18
stops), the shared speller keyboard, the shared timing constants, the
shared spelling checker, and the two app-wide changes that reach back
into chapters 1 and 2 (D-18 case folding, D-19 two-column vocab grids).
Chapter 3's data is complete: no pending placeholders on any route.

Device: iPhone (the target device) unless an item says otherwise.
iPad only where noted.

**Return this document as VERIFY-5D-RESULTS** (PDF, or this markdown
with your answers filled in). Every item has a checkbox, a PASS/FAIL and
a NOTES line. Items marked **DECISION** need a keep/drop or a number
from you, not just a pass — those route into the divergence log.

Legend: [C] confirm · [W] walkthrough · [L] listen · [D] decision

---

## A. Open questions carried out of the build

These are the items the build could not settle. They are first because
they are what 5E depends on.

### A1. [L] The five pist* audio clips (D-16 conflict)

Your D-16 recon note heard `c_pistei` on the `πιστεύετε` item, which
conflicts with what the filename implies (`c_pisete`). The whole
πιστεύω row is wired by filename inference, and the same row carries
the `pistu<ei` typo the assembly corrected — so the original may simply
be miswired here.

The task named five clips. The delivered data wires **six**, and the
audio pack ships a seventh that nothing references. All six are below;
please do all six, since a swap between any two is what we are hunting.

Easiest surface: the **Verb Translating Drill** (Drill → first item),
with "Pronounce Each Drill" left ON. Items **23-28 of 28** are the
πιστεύω row. Tap through and write down the Greek word you actually
HEAR.

| Item | Clip | Authored Greek prompt | What you HEAR |
| --- | --- | --- | --- |
| 23 | `c_piseis` | πιστεύεις (you believe, sg) | |
| 24 | `c_pisome` | πιστεύομεν (we believe) | |
| 25 | `c_pistew` | πιστεύω (I believe) | |
| 26 | `c_pistei` | πιστεύει (he/she/it believes) | |
| 27 | `c_pisete` | πιστεύετε (you believe, pl) | |
| 28 | `c_pisous` | πιστεύουσιν (they believe) | |

Also on the pack but referenced by nothing in chapter 3 — if you can
reach it any other way, note what it says; otherwise leave blank:

| — | `c_pisou2` | (unreferenced) | |

- [ ] A1  PASS / FAIL
- Does every clip match its authored prompt? YES / NO
- If NO, which pairs are swapped:
- NOTES:

### A2. [C] Objectives page wording (`_objectives_verify`)

Open **c3_learn_objectives** (stop 1 of 18). The preamble is
TBK-confirmed; the four objective lines were never checked against the
DOSBox Objectives page and are flagged in the data.

As shipped:

> You will be able to:
> 1. Recognize and translate the present active indicative verb forms.
> 2. Learn the present active indicative paradigm of λύω.
> 3. Master ten new vocabulary words.
> 4. Memorize John 14:6a.

- [ ] A2  PASS / FAIL
- Does anything read as placeholder or draft rather than the original?
- NOTES:

### A3. [D] D-10 — the Endings button plays `c_ending`

Learn → **Learn Verbs: Present Active Indicative** → topic 3,
"Paradigm". Tap **Endings** inside the chart frame.

- [ ] Endings opens the endings display (3 rows, endings in ink)
- [ ] Endings ALSO plays audio on the same tap

The original ships a `c_ending` clip but its button plays nothing —
treated as an original defect and restored (D-10).

**DECISION — keep or drop:** should this button play audio on tap, or
open the display silently?

- [ ] A3  PASS / FAIL — KEEP / DROP
- NOTES:

### A4. [D] D-16 — movable-nu leniency

Exercise → **Present Active Verb Spelling Exercise** (Verb Speller).
**Item 3 of 27** is `they loose` → **λύουσιν**.

| Type this | Setting | Expected | Result |
| --- | --- | --- | --- |
| `λυουσι` (no final nu) | With Accents **OFF** | accepted | |
| `λύουσι` (no final nu) | With Accents **ON** | accepted | |
| `λυουσιν` (with nu) | either | accepted | |

Then, as a control that the leniency is *scoped* and not a blanket rule
— **chapter 1**, Vocabulary Spelling Exercise, item 2 of 10, `ἀμήν`
(there is no ἀμήν in chapter 3's vocabulary):

| Type this | Setting | Expected | Result |
| --- | --- | --- | --- |
| `αμην` | With Accents **OFF** | accepted (no nu involved) | |

One more control worth 10 seconds, because a blanket rule would have
broken it: Verb Speller **item 25 of 27**, `we believe` →
**πιστεύομεν**. Type `πιστευομε`, dropping the nu. It should be
**REJECTED** — that is a genuinely wrong form. The leniency was
deliberately scoped to -σι(ν) and NOT -ε(ν) to protect exactly this;
λύομεν, ἦλθεν and κατέλαβεν all sit in the set a broad rule would have
swallowed.

| `πιστευομε` for πιστεύομεν | With Accents OFF | **rejected** | |

**DECISION — keep or drop:** is optional movable nu right for a Greek
learner, or should the final nu be required exactly as authored?

- [ ] A4  PASS / FAIL — KEEP / DROP
- NOTES:

### A5. [D] D-14 — the two timing constants

Everything auto-advancing in the app now reads two numbers:
`ADVANCE_CORRECT_MS = 900` and `ADVANCE_INCORRECT_MS = 2500`. The
original's per-surface waits were ~2s and ~4s; both read slow on device
at 5B, so these are a tuning proposal awaiting your ratification.

Chapter 2 is deliberately unchanged — it still declares its own ~4s and
that still wins — so if ch2 feels slower than ch3, that is expected,
not a bug.

Work through several items on **at least three different drills**:

| Feel | Where | Ratify / propose |
| --- | --- | --- |
| ~900ms after a CORRECT answer before auto-advance | any ch3 drill | |
| the "Click Next to continue" state after a WRONG answer, no auto-advance | Verb Translating, Greek Verb, Parsing, either vocab drill | |
| ~2500ms after a WRONG answer before auto-advance | Scripture Memory Drill only | |

- [ ] A5  PASS / FAIL
- **DECISION:** ratify 900 / 2500, or propose new values: ______ / ______
- Does the manual "Click Next" state feel right, or should it also
  auto-advance?
- NOTES:

### A6. [D] D-18 — the checking policy on device

Exercise → **Scripture Memory Spelling Exercise** (John 14:6a). Use
Major Hint to read the verse, then Restart Exercise between attempts.

| Type | Setting | Expected | Result |
| --- | --- | --- | --- |
| the verse with NO accents or breathings | With Accents **OFF** | accepted | |
| the verse with full accents/breathings | With Accents **ON** | accepted | |
| the verse with NO accents | With Accents **ON** | rejected | |
| the verse omitting the comma after Ἰησοῦς and the raised dot after ζωή | With Accents **ON** | accepted (punctuation is optional under BOTH settings) | |
| any word typed lowercase where the verse capitalizes (Ἰησοῦς, Ἐγώ) | either setting | accepted (case is NEVER required) | |

Case is never required by design: the keyboard has no capitals and no
shift layer, so requiring them would make those words untypeable. This
is also what retroactively un-breaks chapter 1's Χριστός and chapter 2's
Π-/Φ- words with "With Accents" ON — see D1 below.

**DECISION:** does this feel right for a learner? In particular — should
"With Accents" ON also require the raised dot and comma, or is
punctuation-optional correct?

- [ ] A6  PASS / FAIL — policy KEEP / CHANGE
- NOTES:

### A7. [C] D-19 — two-column English-to-Greek vocabulary grids

This one changes **three** chapters, two of which you have already
device-verified, which is why it is here rather than in the regression
section. Ten polytonic Greek words in a four-column grid need ~33px
more than a 320px screen has, and `overflow-x` is hidden app-wide, so
the longest words were being clipped in silence. Measured on ch1, ch2
AND ch3; the expression is identical in the shipped build, so it
predates this cohort. Greek option pools are now two-up.

Open all three English-to-Greek vocabulary drills on the phone:

- [ ] ch1 → Drill → Vocabulary: English to Greek Drill
- [ ] ch2 → Drill → Vocabulary: English to Greek Drill
- [ ] ch3 → Drill → Vocabulary: English to Greek Drill

For each: two columns, five rows, every word fully visible, nothing cut
off at the right edge, no horizontal scroll.

The 24-letter grids keep four columns (single glyphs, no width
problem) — confirm ch1's letter drills still look as they did:

- [ ] ch1 letter/transliteration grids unchanged, still four-up

- [ ] A7  PASS / FAIL
- Does two columns read better or worse than four for these?
- NOTES:

### A8. [C] Blank numbered lists — the device-pass fix (AMENDMENT 1)

Your screenshots caught four teaching lists printing bare numbers over
empty lines. The text was in the data all along; the renderer only read
the object shape (`{label, text}`) that chapters 1-2 use, and chapter 3
ships bare strings, so a string item rendered an empty `<li>`. Fixed in
`RichContent.svelte`, with a build-time check added so it cannot ship
silently again. **No data file was touched.**

Confirm each list now prints its text:

- [ ] Learn English Concepts → **Voice** — 3 items (Active / Passive /
      Middle voice)
- [ ] Learn English Concepts → **Mood** — 3 items (Indicative /
      Imperative / Subjunctive)
- [ ] Learn English Concepts → **Person** — 3 items (First / Second /
      Third person)
- [ ] Learn Verbs → **Translation** — 2 items (Undefined action /
      Continuous action)

Two known fidelity gaps against DOSBox, for your call — **not** bugs
introduced here, and both are data-side so they route to Fable:

- The original underlines the lead-in words ("Active voice",
  "Indicative mood", "First person") as blue hotwords that open the
  Examples popups. The port renders the popups as the expander cards
  below each list, but the lead-ins are plain text.
- The original numbers these "1) 2) 3)"; the port shows "1. 2. 3."
  (chapters 1-2 preserve the original punctuation).

- [ ] A8  PASS / FAIL
- Do the underline and "1)" numbering matter enough to fix in data?
- While you are on these pages: does any OTHER list, chart or panel
  anywhere in ch3 look short of text compared to your DOSBox
  screenshots? This is the one bug class the automated walks cannot
  see, so a human eye on it is worth a lot.
- NOTES:

---

## B. Chapter 3 rail

### B1. [W] Full 18-stop rail walk

In sequence order. Every stop renders real content — no blank cards, no
error screens, no pending placeholders. Every sequential Next is
enabled. The final Next opens the end-of-chapter dialog (standing
directive 7).

| # | Stop | OK | Note |
| --- | --- | --- | --- |
| 1 | Learn Chapter Objectives | | |
| 2 | Learn English Concepts (6 topics) | | |
| 3 | Learn Verbs: Present Active Indicative (6 topics) | | |
| 4 | Verb Translating Drill (28) | | |
| 5 | Greek Verb Drill (28) | | |
| 6 | Parsing Drill (28) | | |
| 7 | Present Active Verb Spelling Exercise | | |
| 8 | Learn Vocabulary (flashcard) | | |
| 9 | Vocabulary: Greek to English Drill | | |
| 10 | Vocabulary: English to Greek Drill | | |
| 11 | Vocabulary Spelling Exercise | | |
| 12 | Learn Scripture Memory (interlinear) | | |
| 13 | Scripture Memory Drill (10) | | |
| 14 | Scripture Memory Spelling Exercise | | |
| 15 | Review Vocabulary Chart | | |
| 16 | Review Present Active Indicative Paradigm | | |
| 17 | Review Scripture Memory | | |
| 18 | Learn Bibliography | | |

- [ ] Final Next opens the end-of-chapter dialog
- [ ] The bottom nav bar (Learn/Drill/Exercise/Review) stayed responsive
      throughout — the greyout watch item from 5A/5B
- [ ] B1  PASS / FAIL
- NOTES:

### B2. [C] Paradigm chart at 320px

Learn → Learn Verbs → topic 3 "Paradigm".

- [ ] Six Greek cells visible, each over its gloss
- [ ] Numbered person column (1. 2. 3.), Singular and Plural headings
- [ ] All six cells are BLUE and each plays its own clip on tap
      (λύω, λύομεν, λύεις, λύετε, λύει, λύουσι)
- [ ] The λύω lemma above the chart is blue and plays
- [ ] **Say Whole Paradigm** plays `c_paipar` (the whole recitation, not
      a single form)
- [ ] Say Whole Paradigm and Endings sit INSIDE the chart frame
- [ ] No horizontal clipping at phone width
- [ ] The heading "Paradigm" appears ONCE, not twice (the topic and the
      chart share the title; the renderer suppresses the repeat)

Then Quick Review → **Review Present Active Indicative Paradigm**:

- [ ] Same six cells, all tappable
- [ ] **No Endings button** here (the QR page's data omits it)
- [ ] Chart title reads "Present Active Indicative Paradigm"

- [ ] B2  PASS / FAIL
- NOTES:

### B3. [C] Interlinear verse at 320px

Learn → **Learn Scripture Memory**, and again at Quick Review →
**Review Scripture Memory**.

- [ ] 14 words, each wrapping as a WHOLE unit — a Greek word never
      parts company with the gloss under it
- [ ] The gloss-less article **ὁ** (word 3) renders, holds its column
      open, and still plays on tap
- [ ] Every word plays its own clip
- [ ] **Say Whole Verse** plays the whole-verse clip
- [ ] The reference "John 14:6a" is right-aligned at the end
- [ ] Greek renders in the bundled font — rounded circumflex on
      Ἰησοῦς, not a tilde

- [ ] B3  PASS / FAIL
- NOTES:

### B4. [C] Parsing option groups

Drill → **Parsing Drill**.

- [ ] Six options in two visually separated groups of three (singular
      block, then plural block, with a divider between)
- [ ] The 46-character labels ("Second Person Plural Present Active
      Indicative") are readable at phone width and not clipped

At phone width the groups stack vertically; from ~560px up they sit
side by side, which is the original's arrangement. On the **iPad**:

- [ ] iPad shows the two groups side by side

- [ ] B4  PASS / FAIL
- NOTES:

### B5. [C] Scripture Memory drill grid and autoBoth

Drill → **Scripture Memory Drill**.

- [ ] 10 options in a 2-column x 5-row grid
- [ ] A correct answer auto-advances after ~900ms
- [ ] A wrong answer auto-advances after ~2500ms (this is the ONLY ch3
      drill that auto-advances on a wrong answer)
- [ ] Option buttons never play audio (standing directive 9); the Greek
      prompt does

- [ ] B5  PASS / FAIL
- NOTES:

### B6. [C] SpellVerse exercise

Exercise → **Scripture Memory Spelling Exercise**.

- [ ] Reference "John 14:6a" shown
- [ ] Check Answer gives word-by-word feedback that names the first
      wrong or missing word **by its Greek text** — "The word you
      missed was: ὁ" — not a bare index (D-13; the original prints "2")
- [ ] **Major Hint** is available at any time, including after typing
      has begun (D-11; the original hides the verse once you start),
      and shows the verse AND the English translation
- [ ] The button reads **"Restart Exercise"**, not "Repeat This
      Exercise" (D-12)
- [ ] Restart Exercise clears the field and resets the exercise
- [ ] A fully correct verse reaches the completion state

- [ ] B6  PASS / FAIL
- NOTES:

### B7. [C] Verb Speller inline items

Exercise → **Present Active Verb Spelling Exercise**.

- [ ] Each item shows an English gloss as the prompt
- [ ] **Show Answer** reveals the Greek form as a BLUE tappable button
- [ ] Tapping that button plays the word's audio

- [ ] B7  PASS / FAIL
- NOTES:

### B8. [C] Verb Translating Drill hint and translate

Drill → **Verb Translating Drill**.

- [ ] 6 options in a 2x3 grid, readable at phone width
- [ ] The scripture citation prints under the Greek prompt
- [ ] **Translate** reveals the lexical form ("to believe")
- [ ] **Hint** opens the λύω paradigm as a modal, and Escape / the close
      control dismisses it

Note on expected behavior, so it does not read as a bug: on a
one-attempt drill, a wrong answer on the FINAL item leaves you on the
revealed answer rather than reaching a "Finished!" screen. The activity
is already marked complete and the sequential rail stays live. This is
chapter 2's existing behavior, kept for parity.

- [ ] B8  PASS / FAIL
- NOTES:

---

## C. The shared keyboard (D-15)

### C1. [C] Keyboard inventory at 320px

Open any word speller — ch1, ch2 or ch3.

- [ ] 25 letter tiles (24 lowercase + final sigma)
- [ ] The mark rows: 11 diacritics + 3 iota-subscript composites
- [ ] The new bottom punctuation row
- [ ] A space bar
- [ ] Everything fits at 320px with no clipping

The punctuation row as shipped is **comma , · raised dot . period ;
Greek question mark** — four keys. (The task sheet said "comma, period,
raised dot, semicolon"; the Greek question mark is written with the
semicolon character, U+003B, which is what U+037E normalizes to. Same
key, different name.)

- [ ] The four punctuation keys are the four above

At 320px the four 44px punctuation keys leave only ~64px of the row, so
the space bar drops to a full-width row of its own; where there is room
it takes the remainder of the punctuation row.

- [ ] The space bar is comfortably tappable in whichever row it lands in

- [ ] C1  PASS / FAIL
- NOTES:

### C2. [C] The same keyboard everywhere

- [ ] **Chapter 1** speller shows the punctuation row and space bar
- [ ] **Chapter 2** speller shows the punctuation row and space bar
- [ ] **Chapter 3** word spellers show them
- [ ] **Scripture Memory Speller** shows the same keyboard, and the
      space bar actually works for multi-word entry

Chapter 1's data carries its own inline copy of the old 39 tiles. The
component now prefers the shared contract, so ch1 must NOT be on the
old keyboard — that is what this item is checking.

- [ ] C2  PASS / FAIL
- NOTES:

---

## D. Regression — chapters 1 and 2

### D1. [W] Chapter 1 (26 stops) and chapter 2 (20 stops)

Quick walk of both. No new visual issues compared with VERIFY-5A,
VERIFY-5B and the chapter-2 passes.

- [ ] ch1 26/26 stops render, end-of-chapter dialog fires
- [ ] ch2 20/20 stops render, end-of-chapter dialog fires
- [ ] No regression in either chapter's charts or drills

Two chapter-1/2 surfaces changed on purpose in 5D — check them
specifically:

- [ ] ch1 Speller: **Χριστός** can now be spelled successfully with
      "With Accents" **ON** (type `χριστος` with accents ON — the capital
      chi is untypeable, so case folding is what makes this winnable; it
      had been silently impossible since chapter 1 shipped)
- [ ] ch2 Speller: the Π- and Φ- words likewise pass with "With
      Accents" ON
- [ ] A7's two-column vocab grids (already checked above)

Timing note: chapter 2's one-attempt surfaces still use their own ~4s
wait by design. Only flag it if the INCONSISTENCY with chapter 3
bothers you — that is a real decision for D-14, not a defect.

- [ ] D1  PASS / FAIL
- NOTES:

---

## E. Offline (standing directive 4)

### E1. [W] Airplane mode

- [ ] Airplane mode ON
- [ ] Refresh the app while sitting on a chapter-3 activity route —
      content renders
- [ ] Full chapter-3 rail walk offline: 18 stops + end-of-chapter dialog
- [ ] Spot-check one chapter-1 activity offline
- [ ] Spot-check one chapter-2 activity offline
- [ ] Greek renders in the bundled font offline — rounded circumflex,
      not a tilde
- [ ] Audio plays from the on-device library (download the chapt_3 pack
      in Settings first if you have not)
- [ ] Kill the app and relaunch directly into a chapter-3 activity from
      the app switcher — renders offline

- [ ] E1  PASS / FAIL
- NOTES:

---

## F. Data observations — confirm or note, not bugs

These are shipped-data items. They are not code defects and were left
exactly as delivered; the question is only whether they reach the
learner and want a data patch from Fable.

### F1. [C] "he/she believess believes"

`c3_ex_verb_speller`, **item 27 of 27** (πιστεύει) — the last item in
the Verb Speller. The gloss has a doubled word.

- [ ] Visible to the learner as written? YES / NO
- [ ] Needs a data fix? YES / NO
- NOTES:

### F2. [C] "they believe pt"

`c3_drill_parsing`, item 28 (πιστεύουσιν) — the string revealed by the
**Translate** button. The trailing "pt" looks like a stray fragment.

- [ ] Visible to the learner as written? YES / NO
- [ ] Needs a data fix? YES / NO
- NOTES:

---

## Outcome

- [ ] ALL PASS — 5D code is device-accepted; the decisions in section A
      go to the divergence log and 5E opens.
- [ ] Any failure — report; diagnose-first follow-up spec for the next
      round.

### Decisions summary (fill this in even if everything passes)

| Item | Decision | Value |
| --- | --- | --- |
| A3 — D-10 Endings plays audio | KEEP / DROP | |
| A4 — D-16 movable nu optional | KEEP / DROP | |
| A5 — D-14 correct advance | RATIFY 900ms / retune | |
| A5 — D-14 incorrect advance | RATIFY 2500ms / retune | |
| A6 — D-18 checking policy | KEEP / CHANGE | |
| A7 — D-19 two-column grids | KEEP / REVERT | |
| A8 — list underlines + "1)" | DATA FIX / LEAVE | |
| F1 — "believess believes" | DATA FIX / LEAVE | |
| F2 — "they believe pt" | DATA FIX / LEAVE | |
