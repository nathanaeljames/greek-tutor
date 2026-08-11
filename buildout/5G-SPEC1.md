# 5G-SPEC1 -- Chapters 9 and 10 Implementation Spec (Cohort 5G, Revision 1)

Produced by Fable (chat pipeline), 2026-08-10. Governs the first
implementation round for chapters 9 (Present Middle/Passive) and 10
(Future Indicative Verbs). This spec supersedes nothing; it extends the
5F conventions to two new chapters and introduces the renderer
novelties listed in section 4. Where this spec and a rail-walk PDF
disagree, THE SPEC WINS; flag the conflict in RESULTS instead of
improvising.

## 0. Standing round rules

- Attachments for this round: `5G-SPEC1.md` (this file),
  `ch9railwalk.pdf`, `ch10railwalk.pdf`, `RECON-RESULTS.pdf` (standing
  attachment for every coding round).
- Deliverables from the implementer: a BUILD document that contains the
  EXACT `git diff` of the round (not a prose summary of it), a RESULTS
  document, and the visual checklist (screenshot every built page and
  compare against the DOSBox originals in the rail walks).
- The audio manifest is FROZEN. No manifest edits of any kind this
  round. Every clip id referenced by the new data files already exists
  in the CHAPT_9 / CHAPT_10 packs.
- Data files (`chapt-09.json`, `chapt-10.json`, `lexicon-chapt09.json`,
  `lexicon-chapt10.json`) are authored by the chat pipeline and are
  regenerated only from the committed GitHub copy. Implementers never
  edit data files. If a data bug blocks you, STOP on that item, note it
  in RESULTS, and continue elsewhere.
- Behavior fields (`audioTiming`, `answerPolicy`, `pronounceEach`) were
  stamped from `DRILLBEHAVIORLEDGER.csv` rows 79-95 (all CONFIRMED).
  Do not hand-adjust them.
- All four advance classes are already in the renderer (D-28); correct
  answers ALWAYS auto-advance. `Show Answer` is the sole reveal control
  app-wide (C8/D-30). Combining breathing mark and elision apostrophe
  are never interchangeable, including the spell checker (C9/D-29).
  Timing constants remain 2000ms/4000ms.

## 1. Data file inventory

| File | Pages | Distinct clips | Notes |
|---|---|---|---|
| chapt-09.json | 22 rail pages | 123 | Present Middle/Passive |
| chapt-10.json | 22 rail pages | 158 | Future Indicative |
| lexicon-chapt09.json | 10 lemmas | -- | senses pool, ntFreq present |
| lexicon-chapt10.json | 10 lemmas | -- | senses pool, ntFreq present |

Rail order is in each chapter's `sequence` array, taken verbatim from
the rail walks. Chapter 10's Drill Menu label: the original prints
"Future Indication Translation Drill" (typo) on the menu but
"Indicative" on the drill page itself; the port uses "Indicative" on
both surfaces (see `_menu_note`).

## 2. Chapter 9 walkthrough (what is new vs. chapter 8)

1. **Learn English Concepts** -- three topics (Definitions,
   Identifying Traits, Translation). Underlines come from the TBK run
   tables and are already in the data as `[[u]]..[[/u]]`. The
   Translation topic's four annotated examples are a single para with
   embedded `\n` line breaks -- render them as separate lines.
2. **Learn Middle/Passive Verbs** -- six topics. Introduction carries
   two popup links (`punctiliar`, `continuous`); Deponent Verbs carries
   one (`frequentVerbs`). Popups use the `content[]` block-list shape
   (section 4.3). The Accompanying Cases and Introduction (cont.)
   topics contain `numbered` blocks (section 4.6).
3. **Compound Verbs topic** -- `greekRows` layout where each row is a
   compound verb with an optional tappable `(preposition)` suffix that
   plays its own clip. NOTE: the original glosses erchomai as "I go in,
   enter" (identical to eiserchomai); shipped verbatim; VERIFY item (f).
4. **Parsing Drill** -- twoStageGrid, 2 stages (Voice, Person/Number),
   16 items, commit on final click. Same semantics as c8_drill_case
   (VERIFY-5F item 7).
5. **Translation Drill** -- fullOptionGrid, perItem options, 14 items,
   two-line Greek prompts (`greek` + optional `greek2`).
6. **Spelling Exercises** -- verb speller (11 items) and vocab speller
   (10). Answers are all lowercase forms.
7. **Scripture Memory** (Rom 6:23b) -- learn interlinear, drill with the
   ten-option static grid, spellVerse speller WITH the new
   `repeatCheckbox` (section 4.5).
8. **Quick Review** -- vocabulary chart, Present Middle + Present
   Passive paradigms stacked (`paradigmChart` with two `paradigms`),
   and five interlinear verses (Rom 3:23, Jn 1:1, Rom 6:23a lifted from
   ch8 and rekeyed to chapt_9; Rom 6:23b native; all clips ship in the
   CHAPT_9 pack).

## 3. Chapter 10 walkthrough (what is new vs. chapter 9)

1. **Learn English Concepts** -- ONE topic only. The topic rail must be
   hidden when `topics.length == 1` (section 4.2).
2. **Learn Future Indicative Verbs** -- SEVEN topics: Introduction,
   Future Active Paradigm, Future Middle Paradigm, 5 Stem Variations,
   Future of eimi, Deponent Futures, Irregular Futures.
   - Introduction contains a `numbered` block and a CENTERED
     three-line formula para (`align: "center"`, embedded `\n`):
     Stem + Sigma + Ending / lu + s + o / (luso -- I will loose).
   - 5 Stem Variations: numbered items 1-5, each carrying one popup
     link (palatal/labial/dental/liquid/sibilant); items 1-3 embed a
     second line (`\n`) with the literal-bracket formula, e.g.
     `s + [ k, g, x] ==> ks`. Brackets and `==>` are LITERAL notation
     from the original -- render as text, never interpret.
   - The five popups are pure `presentFutureRows` (section 4.4) with
     the consonant group in the popup title.
   - Future of eimi: the topic title's Greek word taps to `l_eimi`
     (`titleAudio`); VERIFY item (c).
   - Deponent Futures / Irregular Futures: para above a
     `presentFutureRows` chart with underlined Present/Future headers;
     deponent rows carry future-side glosses only, irregular rows carry
     glosses on BOTH sides.
3. **Parsing Drill** -- twoStageGrid generalized to THREE optionStages
   (Tense, Voice, Person/Number), 30 items (section 4.1). The
   `optionGroups: [2, 2, 2]` on stage 3 reproduces the original's
   paired column layout.
4. **Translation Drill** -- 31 items, perItem options in a single
   stacked column (`optionLayout: "stack1col"`), scripture reference
   shown per item (`ref`).
5. **Spelling Exercises** -- future-forms speller (18 items = the three
   paradigms), the ROOTS speller (22 items = 11 present/future pairs),
   vocab speller (10).
6. **Scripture Memory** (Mat 6:33a) -- learn interlinear (11 words),
   drill (10 items; the repeated article uses one option "the (acc.)"
   vs "the (gen.)"), spellVerse speller with `repeatCheckbox`.
7. **Quick Review** -- vocabulary chart, Future Active + Future Middle
   paradigms stacked, and SIX interlinear verses (Rom 3:23, Jn 1:1,
   Rom 6:23a from ch8; Rom 6:23b from ch9; Mat 6:33a native).

## 4. Renderer novelties this cohort

### 4.1 twoStageGrid generalizes to N optionStages
`optionStages` is now an array of arbitrary length (ch10 parsing uses
three). Selections accumulate left to right; the guess COMMITS on the
final stage's click, exactly as the two-stage c8_drill_case behaves
(VERIFY-5F item 7 resolution). Earlier stages stay re-clickable until
the final click. The `answer` array parallels the stages.

### 4.2 Topic rail hidden for single-topic pages
When a `topicPages` activity has `topics.length == 1`, render no radio
list at all (the original shows none on ch10's English Concepts page).
Content fills the full width.

### 4.3 Popups are content[] block lists
Ch9/ch10 popups carry the same block vocabulary as topics (`para`,
`numbered`, `presentFutureRows`), not the ch6 flexible-dict shapes.
One popup component, driven by blocks.

### 4.4 presentFutureRows block
Two-column Greek chart rows: `{present: {greek, audio, gloss?},
future: {greek, audio, gloss?}}` with optional underlined `headers`
pair. Greek cells are tappable (Greek-tap rule, directive 9); glosses
are not. Used in topics (dep/irr) and popups (stem variations).

### 4.5 repeatCheckbox on spellVerse
`repeatCheckbox: true` adds a "Repeat This Exercise" checkbox (present
in both ch9 and ch10 originals on the SM speller page). Modeled
semantics, default OFF: when checked, a successful Check Answer plays
the whole verse, then CLEARS the slate for another pass; completion
state is unaffected (the exercise still counts as done after the first
success). These semantics are EXTRAPOLATED, not DOSBox-proven --
VERIFY item (d) settles them; do not invent additional behavior.

### 4.6 numbered block
`{type: "numbered", items: [..]}` renders `1) .. 2) ..` with hanging
indents matching the original's list style. Items may contain
`[[u]]`, `[[link:id]]`, and embedded `\n` line breaks.

### 4.7 Formula/centered para
A `para` block may carry `align: "center"` and embedded `\n` (ch10
intro worked example). Render centered, line breaks respected, Greek
inside is tappable per the Greek-tap rule only where an audio wrapper
exists (the formula letters have none -- plain text).

### 4.8 hintCharts composite (paradigmRefs)
`hintCharts.futureParadigms` references BOTH future paradigms by id
(`paradigmRefs`). Hint opens one popup with the two charts stacked.
Ch9's hint chart (`middlePassiveParadigms`) works the same way. Do NOT
wire any cycling to additional charts (VERIFY item (h) pending).

## 5. Audio wiring notes (read before testing sound)

- Ch10 parsing item 18 plays `j_luwm1s`: the original's dispatch entry
  is blank (broken); the same form as item 5 is wired as a fidelity
  restoration. Expect silence in DOSBox on that item, not in the port.
- Ch10 translation audio is the original's SHIFTED table: item 1 ->
  `j_TvD1`, item N -> `j_TvD(N+1)`. `j_TvD2` exists in the pack but is
  unreferenced BY DESIGN. Do not "fix" this.
- `j_epa*` clips are the PRESENT of eimi; `j_eimi*` clips are the
  FUTURE. The names lie; the wiring is table-read.
- Ch9 `i_mpar` is emitted for the passive paradigm's Say Paradigm and
  is a VERIFY listen (item (a)).
- SM verse-position clips: ch10's table lists sm12-14 for a stale
  14-word buffer; they are ignored and must not 404 anything (they are
  never referenced by the data).

## 6. VERIFY-5G items (human-in-the-loop; produce VERIFY-5G.md answers)

(a) Listen to `chapt_9_i_mpar` and run the ch9 Passive Paradigm's Say
    Paradigm in DOSBox: does the original play a distinct passive
    paradigm recording, and does `i_mpar` match it?
(b) Listen to `chapt_9_i_voc11`: confirm it says dierchomai (it backs
    the compound-verbs row wiring).
(c) Listen to `chapt_10_l_eimi`: confirm it is the standalone word
    eimi (wired to the Future-of-eimi topic title tap).
(d) In DOSBox, on either chapter's SM Spelling Exercise: check "Repeat
    This Exercise", answer correctly, and record exactly what happens
    (replay? slate clear? counter?). This settles section 4.5.
(e) Ch9 objective 6 reads "memorize Jn 6:23b in Greek." -- the verse is
    Rom 6:23b. Keep the original's typo or fix? (Divergence log entry
    either way.)
(f) Ch9 Compound Verbs glosses erchomai "I go in, enter" (the
    original's copy slip). Keep verbatim or fix to "I come, go"?
(g) In DOSBox, parse one PRESENT eimi item (e.g. item 21 eimi) in the
    ch10 Parsing Drill and record which VOICE the original accepts.
    The port derives Active for present eimi, Middle for future eimi.
(h) On the ch10 Parsing Drill, click Major Hint's successor (Hint) --
    does the original cycle beyond the FA+FM charts to the Present
    Active or Present eimi charts? The port wires FA+FM only.
(i) Listen to `j_TvD2` and `j_palp` (both unreferenced): confirm
    orphan status (nothing to wire) or report what they contain.

## 7. Grading and closure

The grader audits BUILD diffs against RESULTS claims per
GRADER-PROMPT.md. Cross-patch BUILD documents are not required -- only
the diff and a RESULTS amendment. VERIFY-5G.md excludes anything the
Playwright harness can settle; extend the harness for the
three-stage-commit, single-topic-rail, and repeatCheckbox paths (the
last one only after item (d) resolves its semantics).
