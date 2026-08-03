# PHASE5-PLAN.md — vertical buildout roadmap (LIVING DOCUMENT)

Status date: 2026-08-03 (5D closed, 5E open). Roadmap only; per-cohort
detail lives in the numbered specs. Updated at every cohort boundary.

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
  **OPEN, round 1 issued 2026-08-03 (5E-SPEC1.md).** Confirmed still
  4+5 at spec time against a full DOSBox rail walk of both chapters
  plus a fresh extraction pass: chapter 5 is chapter 4 plus the
  definite-article family, so batching them costs one set of renderer
  changes instead of two. Near-pure reuse of 5D vocabulary. The seven
  new renderer items (5E-SPEC1 §4) are: paradigm row `label`;
  multi-chart paradigm blocks with More/Back and Singular/Plural
  switching; the Meanings expander on a chart; the D-19 exemption for
  paradigm-shaped option grids; generic reveal buttons on select
  drills (Translate, Gender); `spell` prompt-label and per-item ref;
  the `note` line under a chart. Recon: none owed — the ch4/ch5 rail
  walks arrived with the request and serve as RECON-RESULTS. Gate:
  VERIFY-5E.
  Rail walks for chapters 6, 7 and 8 exist and can be supplied on
  request, which shortens 5F's recon step the same way.

COHORT 5F — Chapters 6 + 7 + 8 (Prepositions, Adjectives, Pronouns),
  BATCHED. Reuse at volume. Contains the cohort's only interaction
  novelties: Spell Greek Phrase (space tile), the ch8 two-step
  person-then-case drill, and the possible ch6 prepositions graphic
  (recon question — if it is a real spatial diagram, decide render
  approach in the spec).

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

Expected later: whatever 5F needs for the ch8 two-step drill and the
phrase speller. match/audioPlayer from the original seven-type plan
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
