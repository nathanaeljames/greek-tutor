# 5F-SPEC1.md — Chapters 6, 7 and 8

Single implementation spec for cohort 5F. One round, one implementer.
Phase 5E is closed; the app currently ships the intro plus chapters
1-5.

**Read this document end to end before writing any code.** Where this
spec and any other document disagree, **this spec wins** — including
the rail walks, which are recon, and including your own reading of the
original.

---

## 0. Ground rules

1. **Do not push.** You are working in a separate physical copy of the
   repo. Commit locally; Nathanael deploys. There is no branch to
   create and no remote to touch.
2. **Do not edit the data files.** `chapt-06.json`, `chapt-07.json`,
   `chapt-08.json` and their three lexicons are authored by the chat
   pipeline. Commit them byte-for-byte as delivered. If you believe a
   data file is wrong, say so in RESULTS and stop — do not fix it.
3. **The ledger is the behavior source of truth.** `audioTiming`,
   `answerPolicy.advanceClass`, the Pronounce-Each default and
   Previous/Next presence are already stamped into the data from
   `DRILLBEHAVIORLEDGER.csv`. Read them from the data. Do not infer
   behavior from the rail walks and do not hard-code it in components.
4. **Every deliberate departure from the original goes in
   `DIVERGENCE-LOG.md` at the time you make it**, not afterwards.
5. **No emoji anywhere** — not in code, comments, commits, or the
   documents you produce.
6. Follow the existing code style. Svelte 4, Vite 5. Keep changes
   simple and readable; prefer extending an existing component over
   adding a parallel one.

---

## 1. What you are building

Three chapters, 70 activities, added to the loaded-chapters registry
with per-chapter lazy chunks via `import.meta.glob`, exactly as
chapters 4 and 5 are wired.

| Chapter | Title | Learn | Drill | Exercise | Quick Review | Rail |
| --- | --- | --- | --- | --- | --- | --- |
| 6 | Prepositions | 6 | 5 | 3 | 6 | 20 |
| 7 | Adjectives | 7 | 7 | 4 | 7 | 25 |
| 8 | Personal Pronouns | 7 | 6 | 3 | 9 | 25 |

Each chapter's `sequence` array is the rail order. The Drill, Exercise
and Quick Review menus list only their own section's activities, in
the order they appear in that section's array.

Audio: 145 clips for chapter 6, 190 for chapter 7, 181 for chapter 8,
already transcoded and keyed `chapt_6_*` / `chapt_7_*` / `chapt_8_*`.
The three chapters each ship their own LOCAL copies of the earlier
cumulative Scripture clips (`c_sm*`, `d_sm*`, `e_sm*`, `f_sm*`); the
data references those local keys and you should not try to
de-duplicate them.

---

## 2. New renderer work

This is the whole of it. Everything else in these three chapters uses
components that already exist. Read this section carefully — it is
where the round will be won or lost.

### 2.1 `prepositionsChart` (chapter 6, two surfaces)

A **diagram**, not a table: a circle labelled ἐν at the centre with
nine prepositions arranged around it and arrows showing direction of
motion. It appears twice, identically — as a Learn topic and as
`c6_qr_prepositions`.

The data gives you `nodes[]`, each with `greek`, `gloss`, `slot`
(`topLeft`, `topRight`, `top`, `left`, `right`, `lowerLeft`,
`lowerRight`, `bottomLeft`, `bottomRight`, `centre`) and `arrow`
(`in`, `out`, `over`, `across`, `down`, `curveIn`, or null). Render it
as inline SVG sized to the phone viewport. Every Greek label is
tappable and plays its clip (directive 9).

Match the original's spatial arrangement — see the rail walk — but do
NOT attempt a pixel copy of the 1990s line art. A clean, legible
diagram at 380px is the goal.

### 2.2 `popupRef` and full-page popups (chapters 6, 7, 8)

Chapter 6's One/Two/Three Case panels list prepositions whose **gloss**
is a link that opens a full green page: headword, its sense lines, and
three worked examples with references. Chapter 7 does the same for
οὐ/οὐκ/οὐχ (two examples each) and chapter 8 for the three uses of
αὐτός (three, two and two examples).

The popups live in an activity-level `popups[]` array; a
`greekRows` row carries `popupRef: "<id>"`. Render the popup as a
full-screen sheet with a Cancel control, matching the original's
modal behaviour. Every Greek phrase on the popup is tappable.

### 2.3 `greekRows` extensions

- `senses[]` on a row: one or more `{gloss, caseTag}` pairs stacked
  under the Greek. The **gloss** is the link (2.2); the `caseTag` is
  plain ink.
- `parts[]` + `partAudio[]`: a row rendered as an inline sequence
  (`διά` `+` `βλέπω`) where individual parts are separately tappable
  and some parts (the `+`) have no audio.
- `bracket: true`: the row is parenthesised, as the Elision page sets
  its derivations.

### 2.4 Underlining is DATA — do not derive it

`[[u]]...[[/u]]` markers now come from the TBK's own run tables and are
carried in the chapter data for **all three** chapters' teaching pages.
Format id `0x62e` is the underline against a `0x502` body; the pipeline
reads it, you render it. Do not decide from a screenshot which words
are underlined, and do not hand any of it back to the pipeline.

`[[i]]...[[/i]]` (bibliography titles) works the same way.

### 2.5 `note` on prompts

Select-drill items and speller items may carry `note` alongside
`greek`/`prompt` — the case tag on a chapter-6 or chapter-8 vocabulary
prompt, the parse tag on a chapter-7 or chapter-8 speller prompt, the
`(not ἐκ)` disambiguator on two chapter-6 speller prompts. Render it
beside the prompt in plain ink at a smaller size. `note` is never
tappable even when it contains Greek — the `(not ἐκ)` case is a
deliberate exception to directive 9 and is already logged.

### 2.6 `options: "perItem"`

The three translation drills (c6 40 items, c7 15, c8 20 and 21) carry
their three options **per item** rather than as a shared pool. Each
item has `options[]` and `answer`. Layout is `stack1col`.

### 2.7 `greek2` — two-line Greek prompts

Chapter 7's and chapter 8's translation drills print the prompt over
two lines, and `greek2` is null on the items that are one line only.
This is the chapter-4 Greek Noun Drill shape; reuse it.

### 2.8 `paradigmChart` (chapter 7) and `pronounParadigm` (chapter 8)

Chapter 7's adjective paradigm is three gender columns by nine rows,
every cell independently tappable with its own clip, plus a
`sayWhole`. Chapter 7's εἰμί chart is two columns by three rows with
a gloss under each cell.

Chapter 8's pronoun paradigms are four rows (N./G./D./A.) with a
Singular and a Plural column, and the third-person one carries
`paradigms[]` — three of them, Masculine then Feminine then Neuter,
reached by a `More` control with `Back` stepping down. Chapter 7's
adjective topics use the same `More` pattern for Singular/Plural.

### 2.9 `twoStageGrid` — chapter 8's Personal Pronoun Case Drill

**The one genuinely new interaction in this cohort.** The original
wants two clicks per item: the person column (First/Second/Third),
then the case-and-number grid. The instruction line reads "Click on
the person then the case".

**Nothing is judged until BOTH are chosen.** The learner may click a
person, change their mind, and click a different person as many times
as they like; only the case click commits the answer, and the attempt
is then scored on the pair. Do not judge the person click on its own.
(DOSBox-confirmed, VERIFY-5F item 7.)

Data: `optionStages[]` with two entries, and each item's `answer` is a
two-element list `["Third Person", "Nominative Singular"]`. The second
stage uses `paradigm2col` layout. Scoring is one attempt per item
under `manualOnIncorrect`, from the ledger.

### 2.10 `answerAlt` — two shapes, both meaning "accept any of these"

**Chapter 7 εἰμί speller.** The third singular and plural print a
moveable nu in parentheses — `ἐστί(ν)`. `answer` is the bare form,
`answerAlt` the printed one. Accept both. This is not general
movable-nu leniency (D-16 stays withdrawn); it is this exercise,
driven by this field.

**Chapter 8 Personal Pronoun Case Drill.** `αὐτά` prints in both the
neuter nominative plural and the neuter accusative plural, and the
original **grades both as correct** (DOSBox-confirmed, VERIFY-5F item
8, with screenshot). The item carries `answerAlt` as a list of
additional acceptable `[person, caseNumber]` pairs, plus an
`_ambiguous_note`. Accept any of `answer` + `answerAlt`; the feedback
must be the correct-answer path, not a near-miss.

---

## 3. Things that will bite you

- **Elision is U+0027 and is required.** Chapter 6 speller item 12 is
  `ἐπ' ἀληθείας`; chapters 7 and 8 have `δι'`, `καθ'`, `μεθ'`, `ἀφ'`,
  `ἀλλ'`. The apostrophe is NOT interchangeable with a smooth
  breathing anywhere, including the checker, and the speller keyboard
  has its own U+0027 tile (C9 / D-29). Verify the tile is reachable in
  all three chapters' spellers.
- **`Show Answer` is the only reveal control.** There is no Major Hint
  button and no `HINT_VISIBLE_MS` (C8 / D-30). The rail walks show a
  `Major Hint` button on the Scripture Memory Spelling Exercise pages;
  ignore it. The spec wins.
- **Every correct answer auto-advances** (D-28), including in the
  `manualOnIncorrect` drills. Timing constants are 2000ms and 4000ms.
- **Chapter 6's ἐπί prints without its breathing** on the Three Case
  panel and the ἐπί popup. That is what the field says and what the
  data ships. Do not "fix" it — it is a live VERIFY item.
- **Chapter 6 has 16 vocabulary entries over 10 lemmas**; chapter 8
  has 15 drill entries, 13 cards and 12 speller items over 10 lemmas.
  Do not assume a chapter's vocabulary count is 10 anywhere.
- **There are no `_verify` items left.** Every answer in all three
  chapters is either cross-keyed inside the chapter or DOSBox-confirmed
  by Nathanael. Build the data as it stands.
- **`ref` is null** on chapter 8 speller item "they (fem nom 3 pl)".
  The original shows a blank there. Render nothing, not an empty chip.
- **Chapter 8's Examples page has three tappable verses**
  (`h_ex1`, `h_exx2`, `h_ex3`) with underlined pronouns. `h_ex2` is
  never dispatched — do not wire it.

---

## 4. Visual walkthrough (required)

Walk **every page of all three rails** in the browser at a 380px
viewport, and compare each against the corresponding DOSBox screenshot
in `ch6railwalk.pdf`, `ch7railwalk.pdf`, `ch8railwalk.pdf`. That is 70
activities plus 25 popup and chart pages.

The rail walks are recon: consult them for layout, wording, and which
elements are clickable, but **defer to this spec** where they differ.
The cursor "hand" in a screenshot marks a clickable, audio-playing
element — it is a positive signal but NOT exhaustive, so also check
every Greek string against directive 9 (all displayed Greek is
tappable and plays audio; exceptions remain the Phonetic Reading
Exercise, speller keyboard tiles, and the Review Letters Quick Chart —
plus `note` fields, per 2.4).

For each page confirm: title, instruction line, prompt, option text
and order, button set, checkbox set, feedback strings, and that audio
fires at the ledger's `audioTiming`.

---

## 5. Automated harness

Extend the Playwright harness to cover all 70 new activities. The
harness currently carries 240+ behavioural assertions across five
chapters; hold the same standard. At minimum, per activity: correct
answer advances; incorrect answer behaves per its `advanceClass`;
audio fires at the right time; Pronounce-Each default matches the
ledger; Previous/Next present or absent per the ledger.

Add specific cases for the new shapes: the two-stage case drill
(wrong first stage, wrong second stage, both right), `answerAlt`
acceptance in the εἰμί speller, `perItem` option rendering, and the
elision apostrophe round-tripping through the checker.

**Anything the harness can settle does not belong in VERIFY.**

---

## 6. Deliverables

Two documents, both required.

**`5F-SPEC1-RESULTS.md`** — what you built, in prose. Every section of
this spec, addressed. Where you departed from the spec, say so and say
why. Where you were unsure, say that too. Include the visual
walkthrough findings page by page for anything that did not match, and
the harness pass/fail summary.

**`5F-SPEC1-BUILD.md`** — **must contain the full `git diff`** for the
round. This document feeds the assessment pipeline; grading audits
your claims against the actual diff, not against RESULTS prose. A
BUILD document without the diff fails the round.

Also update, in the repo: `DIVERGENCE-LOG.md` (new departures),
`CHAT-HANDOFF.md` (state at end of round), and `PHASE5-PLAN.md`
(5F marked complete).

---

## 7. Definition of done

- All 70 activities reachable, correct, and rail-ordered.
- All three chapters load lazily and offline; audio plays from
  IndexedDB with no full store scan on the load or route-mount path
  (directive 10).
- `npm run check:shapes` passes.
- The full Playwright harness passes, including the new cases.
- Visual walkthrough complete for all three rails.
- Both documents produced, BUILD containing the diff.
