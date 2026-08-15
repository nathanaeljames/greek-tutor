# 5D-SPEC.md — Cohort 5D round 1: Chapter 3 (Present Active Verbs)

Date: 2026-07-28. Base: current main (chapter 2 closed at 5B-SPEC4).
Process: buildout v2 (CHAT-HANDOFF.md). BOTH implementers execute this
spec in isolated repo copies and return 5D-SPEC-RESULTS-<MODEL>.md
(claims, decisions, deviations, test evidence) and
5D-SPEC-BUILD-<MODEL>.md (exact git diff + full thought/tool log +
wall-clock time). Grading and any XPATCH follow per process; the
winner authors VERIFY-5D.md.

Data files, delivered with this spec and committed AS-IS (never edited
by implementers; corrections route to Fable): src/data/chapt-03.json,
src/data/lexicon-chapt03.json. Both passed the Stage 7 pipeline
checks (sequence coverage, audio-id resolution against the CHAPT_3
inventory, NFC, no combining marks after spaces). Audio pack: the 64
CHAPT_3 clips transcode user-side as chapt_3_*.

All standing directives apply (CHAT-HANDOFF "Standing directives");
highlights that bite here: no emoji; blue means tappable only;
Greek-tap rule (exceptions logged in data _notes); no dead-end Next;
offline never regresses; audio stops on page exit; every new chart
passes 320px (clipping, not scrolling); mode-keyed dispatch, zero
id-keyed special cases.

## Phase 0 — KEYBOARD CHECKPOINT (STOP-AND-ASK, before any other work)

Chapter 3's Scripture Memory Spelling Exercise types a multi-word
verse. The shared speller keyboard (speller-tiles.json, 39 tiles) has
no space key and no punctuation, and iPhone users have no physical
keyboard (D8). Before building anything else:

1. Research: enumerate every key required to answer any typing surface
   in chapters 1-3 as shipped/specced, and survey chapters 4-8 recon
   (5C-RECON-FINDINGS) for near-future needs. Known candidates —
   verify and complete this list, do not assume it is final:
   * SPACE (required now; ch3 verse).
   * Comma and the raised-dot colon U+00B7 (both occur inside the ch3
     verse; whether the checker REQUIRES them depends on decision 3
     below).
   * Greek question mark ';' (ch4+ verses may carry it).
   * Period.
   * Capitals: the verse contains Ἰησοῦς and Ἐγώ. Recommend
     case-insensitive checking rather than adding a shift layer, but
     present the trade-off.
2. Proposal: 2-3 keyboard layout WIREFRAMES/mockups (e.g. add a
   bottom row: space bar + minimal punctuation; vs. a paged keyboard;
   vs. space-only now + punctuation-optional checking). State the
   recommended option and why, including 320px fit.
3. Checking policy proposal: with "With Accents" off, compare
   case-insensitive, accent/breathing-insensitive, punctuation-
   optional, movable-nu-lenient (data flags accentsOptional /
   punctuationOptional exist). State what "With Accents" ON should
   require.
4. PAUSE. Present 1-3 to Nathanael in the RESULTS doc (or chat
   hand-back) and WAIT for his selection before implementing the
   keyboard change or the spellVerse activity. Everything in Phase 1
   that does not depend on the keyboard may proceed while waiting.

The chosen keyboard ships as a revision of the SHARED speller
contract (speller-tiles.json) used by ALL spell surfaces app-wide,
chapters 1-3 included — one keyboard, no per-chapter forks.

## Phase 1 — registrations (new vocabulary, one-time cost)

Register exactly these; names are final:

1. RichContent block `paradigm` (data shape in chapt-03.json,
   c3_learn_verbs -> topic 'paradigm'): title, lemma {greek, gloss,
   audio}, columns[2], rows[{person, cells[2]{greek, gloss, audio}}],
   sayWhole {label, audio}, optional endings {label, audio, rows,
   _note}. Layout mirrors the original chart (D4 screenshot):
   numbered person rows, Singular/Plural columns, Greek cell + gloss
   beneath/beside, Say Whole Paradigm and Endings buttons inside the
   chart frame. Every Greek cell is tappable (blue) and plays its
   clip. Endings opens a modal/expander showing the endings rows AND
   plays its audio clip (chapt_3_c_ending — a RESTORATION departure,
   see divergence log D-10; keep the play behind the button tap).
2. contentAudio mode `paradigmChart` (c3_qr_paradigm): full-page
   render of a paradigm object, chart title above, NO endings button
   when the data omits it. Reuses the block renderer.
3. contentAudio mode `interlinearVerse` (c3_learn_scripture,
   c3_qr_scripture): words[] rendered as flowing Greek lines with the
   gloss under each word (D6 layout: Greek row, gloss row, wrapped);
   each Greek word tappable playing its c_sm clip; a word with gloss
   null (the article before Ἰησοῦς) still renders and plays; Say
   Whole Verse button; reference right-aligned at the end.
4. Activity type `spellVerse` (c3_ex_scripture_speller): free-typed
   whole verse against answerWords[], word-by-word checking on Check
   Answer; feedback names the FIRST wrong/missing word by its text,
   not its index (the original's "The word you missed was: 2" shows a
   bare number — D8; departure logged D-13); Major Hint (verse +
   translation) ALWAYS available (D-11); "Restart Exercise" button
   label (D-12); With Accents checkbox honoring the Phase 0 checking
   policy. BLOCKED on Phase 0 selection.
5. select extensions: per-item `optionValues`/`options` (component
   reads item-level first, falls back to activity-level — needed by
   the two verb drills), `optionsAreGreek` (Greek option buttons: Greek
   face, no audio on options per the Greek-tap rule), `optionGroups`
   ([3,3] renders the parsing options as two visually separated
   stacks, matching the original), and `translate` on items (the
   Translate button reveals the item's translate string under the
   prompt, as in the original; present on VTD and Parsing).
6. answerPolicy `advanceClass` + two SHARED app-level constants (see
   Timing). No per-activity timing numbers anywhere in components.

`npm run check:shapes` must learn the new shapes and fail loudly on
unknowns, as it does today.

## Phase 2 — build list (activity by activity)

Learn:
- c3_learn_objectives: objectivesPage, existing renderer. NOTE: the
  objectives item wording in the data carries _objectives_verify;
  render as delivered.
- c3_learn_english_concepts, c3_learn_verbs: topicPages, existing
  renderer + the new paradigm block + expander blocks for the
  original's popups (Voice/Person examples, Historical Present).
  Multi-line para text uses \n line breaks — preserve them (visual
  arrangement is pedagogy).
- c3_learn_vocab: flashcard over lemmas — existing.
- c3_learn_scripture: interlinearVerse (new).
- c3_learn_bibliography: textPage biblist — existing.

Drill:
- c3_drill_verb_translating: select, Greek prompt with audio +
  Pronounce, 6 per-item English options (2x3 grid per the original),
  Translate reveal, Hint opens the lambda-upsilon-omega paradigm as a
  modal (hintRef 'paradigm' resolves to the chapter's paradigm block —
  the original's Hint popup, D9-D11).
- c3_drill_greek_verb: select, English prompt + ref, 3 Greek options
  stacked, answer audio plays on correct/Pronounce.
- c3_drill_parsing: select, static 6 parsing options in [3,3] groups.
- c3_drill_vocab_gk_en / c3_drill_vocab_en_gk: existing generators
  over the 10 lemmas (ch2 pattern; en_gk uses Greek options).
- c3_drill_scripture_memory: select, static 10 English options in a
  2x5 grid (order in optionValues), advanceClass autoBoth.

Exercise:
- c3_ex_verb_speller / c3_ex_vocab_speller: existing spell component;
  verb speller items are inline {gloss, greek, audio} (support this
  item shape alongside {ref}).
- c3_ex_scripture_speller: spellVerse (new, Phase 0-gated).

Quick Review: c3_qr_vocab (reviewVocab + playAll, existing),
c3_qr_paradigm (paradigmChart), c3_qr_scripture (interlinearVerse).

Sequence: as delivered (18 stops, DOSBox-verified). End-of-chapter
dialog on final Next per directive 7. Chapter registers in the lazy
chunk glob; ch1/ch2 chunk hashes must not change.

## Timing and advance semantics (THE RULE SET — read carefully)

Two shared constants, app-level, single source:
- ADVANCE_CORRECT_MS = 900 (the device-approved feel from 5B; the
  original's ~2s reads slow on device — departure logged D-14).
- ADVANCE_INCORRECT_MS = 2500 (only for autoBoth surfaces; the
  original's ~4s, shortened for device feel — same departure entry;
  Nathanael may retune both in VERIFY).

advanceClass semantics:
- `manualOnIncorrect` (the three verb drills + both vocab drills):
  one attempt per item; correct -> feedback + auto-advance after
  ADVANCE_CORRECT_MS; incorrect -> feedback + "Click Next to
  continue" state, NO auto-advance, options lock.
- `autoBoth` (Scripture Memory Drill): one attempt; correct ->
  ADVANCE_CORRECT_MS; incorrect -> ADVANCE_INCORRECT_MS.
- `retry` (unchanged, ch1/ch2 surfaces): advance only on correct.
Completion: one-attempt activities complete on all-attempted; retry
on all-correct (established semantics — do not change ch1/ch2).

## Tests and evidence (required in RESULTS)

- Full ch3 rail walk online + airplane-equivalent, 320px and 768px,
  zero console errors; ch1 and ch2 regression rails green.
- 320px screenshots: paradigm chart, interlinear verse, parsing
  option groups, SM drill grid, the new keyboard.
- check:shapes green; precache entry/size delta reported; ch1/ch2
  chunk hashes unchanged.
- Spot-play evidence for: paradigm cells, c_paipar, c_ending,
  c_vocl3, three sm clips, one clip per verb family in VTD.
- The pist* audio _verify items surface in the VERIFY doc, not
  resolved silently.

## Out of scope

Chapters 4+; the VOCAB book (the original's "Learn Vocabulary
Builder" launcher page is NOT ported this round — the chapter rail
as verified by D1 does not include it); any refactor of ch1/ch2
components beyond the shared keyboard and the select extensions.
