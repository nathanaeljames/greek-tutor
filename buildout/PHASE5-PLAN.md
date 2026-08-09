# PHASE5-PLAN.md — vertical buildout roadmap (LIVING DOCUMENT)

Status date: 2026-08-08 (5E closed, 5F BUILT — implementation complete,
awaiting VERIFY-5F closure). Roadmap only; per-cohort detail lives in
the numbered specs. Updated at every cohort boundary.

## Principles (unchanged)

1. Cohorts sized by NOVELTY: new-mode chapters get small cohorts (1-2)
   with their own VERIFY gate; pure-reuse runs batch 3-5 per spec.
2. Every cohort ends with a VERIFY-*.md returned by Nathanael before
   the next cohort's spec is drafted.
3. Every cohort ends with an airplane-mode check + 320px chart checks.
4. Pipeline protocol: PIPELINE-INSIGHTS-v3.md §VIII + the mode
   vocabulary contracts in CHAT-HANDOFF.md. New modes are REGISTERED
   here, never invented silently.
5. Data files regenerate only from committed copies; DOSBox answers
   route to Fable, never directly to the implementer.

## Cohort ledger

COHORT 5A — B5 lazy chapter loading. Spec: 5A-SPEC.md. Gate: VERIFY-5A.
  Status: SHIPPED + DEVICE-VERIFIED (2026-07-23).

COHORT 5B — Chapter 2 (Syllables & Accents), solo. Specs: 5B-SPEC.md
  (+ 5B-MERGE-SPEC), 5B-SPEC2/3/4. Gates: VERIFY-chapt02, VERIFY-5B,
  VERIFY2, VERIFY3. Status: CLOSED AND DEVICE-VERIFIED (2026-07-27).
  Cost note: four rounds, three of them typography now inherited as
  standing infrastructure. Handoff: 5B-SPEC4-RESULTS.md.

COHORT 5C — RECON PASS chapters 3-8 + bounded rich-text parser
  experiment. Chat-side only, no build. Status: CLOSED 2026-07-28.
  Record: 5C-RECON-FINDINGS.md (repo). Outcomes: `$` and `!` promoted
  in font-map.json; Hebrew tell-tale model corrected; PARSER
  EXPERIMENT SUCCEEDED (scripts/tbk_richtext.py) — drill pools,
  paradigm charts, underline spans and Greek-font runs are now
  machine-extractable; the 75% ceiling is retired (see
  PIPELINE-INSIGHTS-v3 Stage 4b).

The ledger below replaces the old 5D+ placeholder. Evidence basis:
chapters 3-8 string+audio recon; chapters 9-28 sized by ISO volume
and title only (marked INFERENCE — each cohort's own extraction pass
confirms before its spec).

COHORT 5D — Chapter 3 (Present Active Verbs), SOLO. **CLOSED
  2026-08-03.** The one-time-cost chapter: registered paradigm mode
  (+ Say Whole Paradigm), parse and translate select variants, and the
  Scripture Memory family (word-stepper drill, whole-verse speller,
  cumulative review chart). Two rounds: 5D-SPEC (build) and 5D-SPEC2
  (VERIFY-5D corrections + the Playwright harnesses). Nathanael's
  visual pass on the round-2 tree was a full pass, so no VERIFY-5D2
  document was raised — the 5B-SPEC4 precedent. Records:
  5D-SPEC{,2}.md, 5D-SPEC-RESULTS-OPUS.md, 5D-SPEC2-RESULTS.md and
  the matching BUILD docs, VERIFY-5D.md.
  Cost note: two rounds, and the second was mostly infrastructure
  (Playwright harnesses, shared speller input model) now inherited.

COHORT 5E — Chapters 4 + 5 (Second/First Declension Nouns), BATCHED.
  **CLOSED 2026-08-07.** Four rounds: 5E-SPEC1 (dual Sol/Opus build +
  XPATCH1), 5E-SPEC2 (behavior correction against Nathanael's DOSBox
  pass — six advance classes, wrong on the correct-answer path for 14
  activities), 5E-SPEC3 (corrected SPEC2's over-reach — four classes,
  every correct answer auto-advances, D-28), 5E-SPEC3-PATCH (five
  addenda of real device feedback — modal geometry, an audio-on-arrival
  reactivity bug, the elision-mark/breathing distinction, the
  apostrophe key, `Show Answer` replacing `Major Hint` app-wide).
  Confirmed still 4+5 at spec time against a full DOSBox rail walk of
  both chapters plus a fresh extraction pass: chapter 5 is chapter 4
  plus the definite-article family, so batching them cost one set of
  renderer changes instead of two. The seven renderer items from
  5E-SPEC1 §4 (paradigm row `label`; multi-chart blocks with
  More/Back and Singular/Plural switching; the Meanings expander; the
  D-19 exemption for paradigm-shaped grids; generic reveal buttons;
  `spell` prompt-label and per-item ref; chart `note`) all shipped and
  are now registered vocabulary — see the mode registry below.
  DRILL-MATRIX.md is DELETED, replaced by DRILL-BEHAVIOR-RULES.md +
  DRILLBEHAVIORLEDGER.csv, which now cover all 78 activities across
  chapters 1-8 (chapters 6-8 CONFIRMED ahead of being built — see 5F).
  Records: 5E-SPEC{1,2,3}.md, 5E-XPATCH1.md, 5E-SPEC{1,2,3}-RESULTS*.md,
  5E-SPEC3-PATCH.md, VERIFY-5E.md + VERIFY-5E-RESPONSE.pdf.

COHORT 5F — Chapters 6 + 7 + 8 (Prepositions, Adjectives and the verb
  εἰμί, Pronouns), BATCHED. **OPEN 2026-08-07.** Reuse at volume — no
  new renderer items are expected, pending the rail walks. Process
  DEPARTS from 5E on purpose: behavior is ledger-first this time.
  `DRILLBEHAVIORLEDGER.csv` already carries CONFIRMED rows for all 28
  chapter 6-8 activities (Nathanael's DOSBox pass, cross-checked
  against a fresh TBK extraction), so the rail walks now supplied
  chapter-by-chapter are for page content, prose and layout — not
  behavior discovery. Per-chapter loop: rail walk in -> Fable extracts
  the TBK, assembles `chapt-0N.json` + `lexicon-chapt0N.json` via a new
  `assemble_ch{6,7,8}.py`, stamps behavior via
  `apply-behavior-matrix.py` against the already-confirmed rows,
  delivers for review. Repeat for all three chapters, THEN issue one
  `5F-SPEC1.md` covering all three, matching 5E's batching precedent.
  Contains the cohort's only interaction novelty flagged so far: the
  ch8 Personal Pronoun Case Drill's two-step person-then-case selection
  (confirmed via TBK instruction text, "Click on the person then the
  case" — a genuinely different option layout from every other Case
  Drill in the app, not covered by any existing rule). Also: Autos has
  no Case Drill, only Translation — confirmed by exhaustive TBK title
  search, not assumed; do not add one.

  **BUILT 2026-08-08 (5F-SPEC1, one round, one implementer).** All 70
  activities ship: ch6 20 rail stops, ch7 25, ch8 25, all lazily
  chunked and offline. `npm run verify` passes; the behaviour harness
  is 586/586 (388 before the round), the new 70-stop smoke walk is
  73/73 and the modal pass 85/85. Records: `5F-SPEC1.md`,
  `5F-SPEC1-RESULTS.md`, `5F-SPEC1-BUILD.md`, `5F-EXTRACTION-MAP.md`,
  `VERIFY-5F.md`.
  Renderer novelty delivered: `prepositionsChart` (an SVG DIAGRAM, on
  two surfaces), full-page `popups[]` with three declaration routes,
  `pronounParadigm` plus a `paradigms[]` More/Back stack,
  `twoStageGrid` (the cohort's one new interaction — nothing judged
  until BOTH stages are chosen, VERIFY-5F item 7), `answerAlt` in two
  shapes, `options: "perItem"`, `greek2`, `note`, and the case-split
  `pool: "senses"` vocabulary. New divergences D-31, D-32, D-33.
  NOT closed: the delivered data is missing the teaching paradigms for
  chapters 7 and 8 and every Hint chart in the cohort (5 of 6 hintRefs
  dangle, 8 drills show no Hint button), chapter 7's popups ship with
  no anchors, and chapter 8's two Quick Review pronoun charts carry
  six rows of untransliterated Latin. All are pipeline-side and are
  itemised in `5F-SPEC1-RESULTS.md` §8; no data file was edited, and
  the rail walks CONFIRM every one of them.
  The page-by-page rail-walk comparison is DONE (§6) and produced eight
  further fixes — half of them defects no harness could see, half of
  them my own inventions the original does not make. PROCESS LESSON,
  now standing: do not start a spec until every file it names is in
  hand; this round ran once without the rail walks and had to be redone
  against them.

COHORT 5G+ (INFERENCE, pending each cohort's extraction pass) —
  chapters 9-28 grouped by grammatical family, expecting the first
  chapter of each family to carry the novelty and the rest to reuse:
  * 5G: 9-10 (Middle/Passive, Future) — first non-active paradigms.
  * 5H: 11-12 (Demonstratives, Imperfect).
  * 5I: 13-14-15-16 (3rd Declension, Aorists, Passives) — volume run.
  * 5J: 17-18 (Contract, Perfect).
  * 5K: 19-20-21 (Participles) — likely one new paradigm-display
    wrinkle at 19, then reuse.
  * 5L: 22-23-24 (Infinitives, Subjunctive, Imperative).
  * 5M: 25-26-27-28 (Mi Verbs, Numbers/Interrogatives, Clauses, Case
    Revisited) — 26-28 titles suggest chart/reading-heavy pages;
    confirm at extraction.

END-OF-PHASE — cross-chapter surfaces (REV_VOC, REV_PAR, JOHN, VOCAB
index), deliberately last. Note from 5C: chapter TBKs link to
vocab\vocab1.tbk from every "Learn Vocabulary Builder" page — that
page's treatment inside chapters is a 5D design decision; the VOCAB
book itself stays end-of-phase.

## Mode/type vocabulary registry

Chapter 1 (final): objectivesPage, textPage, stepper, flashcard,
equationChart, vowelStair, diphthongRows, exploreGrid, fullOptionGrid,
selfCheckStepper, selfCheckSequence, reviewVocab, reviewLetters.

Added in 5B: mode topicPages; RichContent blocks greekRows, expander
and subheading (+ defList object form, numbered self-labeling,
reviewVocab playAll); activity types divide + placeAccent; select
static option sets, red-mark contract, speller-tiles.json shared
keyboard contract.

Added in 5D (shipped): mode `paradigmChart` and the `paradigm`
RichContent block (per-cell audio, Say Whole Paradigm, Endings); mode
`interlinearVerse`; activity type `spellVerse`; select variants for
parsing and translation prompts; `[[g]]` green inline terms;
`labelStyle` on numbered lists; `para` `emphasis`/`indent`;
`greekTaps` on `para` blocks.

Added in 5E (registered here, defined in 5E-SPEC1 §4): `label` on
paradigm rows (superseding `person`; `person` retained for ch3
back-compat); `charts[]` + `switch: "moreBack" | "named"` on a
paradigm block; `meanings` on a chart; `note` on a chart;
`revealButtons` on select activities; `promptLabel` and per-item `ref`
on `spell`; an explicit layout flag marking paradigm-shaped option
grids (D-26).

Added in 5F (shipped): content blocks `prepositionsChart` (an SVG
diagram — nodes carry `greek`/`gloss`/`slot`/`arrow`) and
`pronounParadigm` (four case rows over Singular/Plural, each row ONE
line of set text rather than cells); `paradigms[]` on a `paradigmChart`
activity (a More/Back stack) and a `sayWhole` beside the chart;
activity-level `popups[]` reached three ways (`popupRef` on a greekRows
row, an `[[u]]` run whose slug is a popup id, or the popup's own
`greek` headword — D-31); `senses[]`, `partAudio[]`, `bracket`, `ref`
and `greek2` on greekRows rows; `note` on select and speller items
(ink, never a tap); `options: "static" | "perItem"` and
`optionLayout: "stack1col"`; `mode: "twoStageGrid"` with
`optionStages[]` and a two-element `answer`; `answerAlt` on a speller
item (a second acceptable spelling, parentheses meaning optional —
D-33) and on a two-stage item (a list of extra acceptable pairs);
`pool: "senses"` (one card per caseTag plus one for the untagged
remainder); `audioMap` on an activity (inflected form -> clip, folded
chapter-wide).

Expected later: match/audioPlayer from the original seven-type plan
have NOT yet been witnessed in chapters 3-8; parse/translate resolve
to select variants.

Standing infrastructure from 5B, inherited and not re-derived: the
bundled derived Greek face + the font-derived mark-geometry table
(matched pair). New from 5C: scripts/tbk_richtext.py (extraction-side,
chat pipeline tool — lives in the repo for provenance, not in the app
build).

Registry debt: explicit layout flag on greekRows; single-source
speller tiles at next chapt-01 regen; lexicon-chaptNN naming (no
dash); unify paradigm row `person` onto `label` at the next chapt-03
regeneration.

## Font-map unknowns tracker

Resolved by ch2: '#' smooth+circumflex; '[' rough (second slot); ';'
question mark; ':' raised-dot colon; 'v' nu provisional.
Resolved by 5C recon (chapters 3-8 word evidence): '$' =
rough+circumflex (ὧραι, οὗτος); '!' = rough+acute (ὥρα family) —
REVERSING the ch2 exclusion; '!' also appears in Hebrew regions, so
region exclusion still precedes conversion. THIRD EVIDENCE SOURCE
OBTAINED 2026-08-03: the ch5 rail walk shows the First
Declension--Alpha chart rendered in DOSBox, where `w!ra` prints ὥρα
and `w$rai` prints ὧραι. Both codes now carry the full three sources
(glyph rendering, word cross-reference, screenshot) the Stage-3 lesson
requires. Closed.
Still unknown: { } ~ | \ `  (all junk-context only) and '=' (OpenScript
comparator, re-confirmed in 5C). None witnessed in rendered text;
never convert silently.
