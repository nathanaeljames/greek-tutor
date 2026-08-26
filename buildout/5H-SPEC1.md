# 5H-SPEC1 -- Chapters 11 and 12 Implementation Spec (Cohort 5H, Revision 2)

Produced by Fable (chat pipeline), 2026-08-25, from a fresh extraction
pass over 11_DEMON.TBK and 12_IMPF.TBK plus ch11railwalk.pdf and
ch12railwalk.pdf. Governs the first implementation round for chapters
11 (Demonstrative and Relative Pronouns) and 12 (Imperfect Verbs).
Base: repo head `efa5971` (disclosure spike closed and merged,
accepted head `cc89c9f`). Authority documents, cited by section:
DISCLOSURE-RULES.md (as amended 2026-08-18), DRILL-BEHAVIOR-RULES.md
(B-last included), TITLE-SWEEP-RULES.md, DIVERGENCE-LOG.md,
CHAT-HANDOFF.md standing directives 1-10.

**REVISION STATUS.** Revision 2 (2026-08-25) is the ROUND-READY spec.
Revision 1 was issued pre-data so Nathanael could compare the
extrapolated ledger rows 96-115 against his DOSBox pass first
(LEDGER-FIRST RULE); that comparison CONFIRMED all twenty rows, one
corrected: the ch12 Augment Drill is `afterGuess` because its clips
record the augmented ANSWER (DRILL-BEHAVIOR-RULES A1b, new). The four
data files, both assemblers (`scripts/assemble_ch11.py`,
`scripts/assemble_ch12.py`) and the amended rules ship with this
revision; `npm run check:shapes` passes over all twelve chapters with
the new data in place. Changes from Revision 1 are marked [R2].

Where this spec and a rail-walk PDF disagree, THE SPEC WINS; flag the
conflict in RESULTS instead of improvising. Where this spec and the
committed data disagree, the DATA wins and the spec has a bug -- say
so in RESULTS.

## 0. Standing round rules

0.1 **Directives 1-10 apply** (CHAT-HANDOFF "Standing directives").
    Called out: directive 1 (no ad-libbed content; behavioral claims
    about the original need evidence or a VERIFY item), directive 4
    (the round ends with an airplane-mode check), directive 6 (no
    emoji anywhere, including code comments, docs and commit-ready
    text), directive 7 (no dead-end Next at either chapter's rail
    end), directive 8/9 (blue is exclusively tappable; all displayed
    Greek taps and plays; option buttons never carry audio),
    directive 10 (no cache/store scan on load or route mount).

0.2 **Implementers NEVER run git.** No commit, no stage, no push, no
    `git add -N`. All version control is Nathanael's. Diffs are
    produced with read-only `git diff`; untracked new files are listed
    verbatim in the BUILD document.

0.3 **Data files are copied in verbatim, never content-edited.** The
    one standing exception: obviously missing formatting or text found
    during visual verification may be fixed, and every such edit is
    reported in RESULTS with before/after so the pipeline can absorb
    it. If a data bug blocks an item, STOP on that item, note it in
    RESULTS, continue elsewhere.

0.4 **STOP conditions.** If any file this spec names is absent from
    what you were given (four data files, two rail walks), STOP and
    say so -- do not substitute, infer or proceed partially. If data
    carries a shape this spec does not describe and the renderer does
    not know, STOP on it and report; `npm run check:shapes` fails the
    build on unknown block types by design.

0.5 **Attachments for this round:** `5H-SPEC1.md` (this file,
    Revision 2), `chapt-11.json`, `chapt-12.json`,
    `lexicon-chapt11.json`, `lexicon-chapt12.json`, `ch11railwalk.pdf`,
    `ch12railwalk.pdf`, `DRILLBEHAVIORLEDGER.csv` (confirmed rows).
    The rail walks are the FIDELITY REFERENCE and a standing attachment
    for every 5H coding round; the spec is the AUTHORITY. In a rail
    walk a HAND CURSOR marks a clickable element (positive evidence;
    its absence is not evidence of absence -- DISCLOSURE-RULES §4.7
    makes the hand cursor binding for tappability). Nathanael marked
    hands on several Greek words deliberately but not exhaustively;
    the data's `audio`/`greekTaps`/`audioMap` wiring (dispatch-read
    from the TBK) is the complete tap inventory.

0.6 **Deliverables** (both implementers, separate physical repo
    copies):
    - `5H-SPEC1-RESULTS-<MODEL>.md` -- the handoff: what was built per
      module, deviations with reasons, acceptance results, data edits
      (if any) with before/after, surprises, and the initial-load
      classification table of section 7.4.
    - `5H-SPEC1-BUILD-<MODEL>.md` -- (a) the COMPLETE exact cumulative
      `git diff` of the round, not a summary, not excerpts; (b) the
      full thought/tool log; (c) WALL-CLOCK TIME: a start timestamp,
      an end timestamp, and the total, with any later patch or
      addendum ADDING its own time to that total. Both (a) and (c) are
      MANDATORY and the grader auto-penalizes either omission by a
      full letter (GRADER-PROMPT step 0). Treat them as acceptance
      gates equal to a green build.
    - `5H-VISUAL-CHECKLIST-<MODEL>.md` -- the resumable page-by-page
      visual checklist of section 7.2, in its committed state at
      round end.

0.7 **Checkpoint discipline.** After each work item in section 4
    (W1..W9): regenerate the cumulative diff into the BUILD doc and
    tick the visual checklist. A window death must never cost more
    than one work item. The BUILD doc is a running document, not an
    end-of-round export.

0.8 **Behavior fields** (`audioTiming`, `answerPolicy`,
    `pronounceEach`) are stamped by the pipeline from
    DRILLBEHAVIORLEDGER.csv rows 96-115 once CONFIRMED. Do not
    hand-adjust them. All four advance classes are in the renderer
    (D-28); correct answers ALWAYS auto-advance; timing constants stay
    2000 ms / 4000 ms; `Show Answer` is the sole reveal control (C8);
    "Repeat This Exercise" stays retired (D-42) and the shapes guard
    fails the build if it reappears.

0.9 **The audio manifest is FROZEN.** No manifest edits. Every clip id
    in the new data resolves in the CHAPT_11 (245 WAV) and CHAPT_12
    (163 WAV) packs already present in `audio-manifest.json`.

## 1. Data file inventory [R2: delivered]

| File | Rail pages | Distinct clips | Notes |
| --- | --- | --- | --- |
| chapt-11.json | 27 | 236 | 11 activities (7 drills, 4 exercises), 6 Learn pages, 9 Quick Review pages, Bibliography |
| chapt-12.json | 24 | 161 | 9 activities (6 drills, 3 exercises), 4 Learn pages, 9 Quick Review pages, Bibliography |
| lexicon-chapt11.json | -- | -- | 11 lemmas; `senses` pool for the case-split ὑπέρ (gen./acc.), as ch6/ch8; `parts` + `audioFull` on οὗτος, αὕτη, τοῦτο |
| lexicon-chapt12.json | -- | -- | 10 lemmas, ntFreq from the Review Vocabulary Chart |

Provenance: `scripts/assemble_ch11.py` and `scripts/assemble_ch12.py`
(Stage 8.7 banners; they refuse to overwrite an existing output without
`ALLOW_REGRESSIVE_REBUILD=1`). Every clip id is dispatch-read or
asserted present in the TBK and resolves in `audio-manifest.json`
(check:shapes verifies the manifest). `toc.json` ALREADY carries
chapters 11 and 12 (the TOC menu's own titles, "Demonstrative Pronouns"
and "Imperfect Verbs"); the chapter data's `title` is the window title
"Demonstrative and Relative Pronouns" -- both are as printed, no change.
The lazy-chunk glob picks the new files up by name; W1 is the
`check:lazy` confirmation, not an edit.

What the assemblers READ that Revision 1 only predicted [R2]:
- Both ch11 three-stage drills' COMPLETE answer keys sit in each page's
  AnalyzeAnswer script (case-button set x type x gender set per item).
  The original accepts every valid parse -- ὅ as nominative OR
  accusative, τῷ as masculine OR neuter, οἷς as masculine OR neuter --
  and the data carries all of them (`answer` + `answerAlt` tuples).
  Revision 1's VERIFY (b)(2) is therefore SETTLED by the TBK.
- The ch12 Parsing Drill key likewise accepts BOTH First Singular and
  Third Plural for ἔλυον and εἶχον (VERIFY (c) settled).
- The ch12 Augment Drill's correct column per item (A/B/C) is in its
  AnalyzeAnswer script; 19 items, refs Mat 1:25 ... Mat 9:35.
- Blank SayWord entries (the ch10 item-18 class) at ch11 This and That
  Drill item 18 and ch12 Parsing Drill item 23; both wired to the
  form's own cell clip, each carrying an `_audio_note`.
- The two "blank" Who and The prompts are ᾗ and ᾧ: forms that BEGIN
  with the composite iota-subscript codes `^`/`&`, which the shared
  converter parked as a leading mark. `make_conv11` treats them as base
  letters. VERIFY (b)(1) settled: 30 items.
- The Relative and Reflexive speller's item 14 prompt reads "whom
  (masc. acc. pl.)" but the original dispatches the NEUTER clip (ἅ)
  while its check script accepts οὕς; the port wires οὕς's own clip
  (`_audio_note`).
- The ch11 Demonstrative Examples field types τοὺτου with a GRAVE and
  ἐ̓στε with a doubled breathing (normalised); the This and That
  Translation item 13 types ἐκεῖνοί with NO breathing. All verbatim,
  flagged `_verify`.
- Ch11 SM Drill dispatch confirms the cumulative pool (VERIFY (i)
  settled): j_sm1,2,3,4,5,8,10,11 + k_sm2-5.

Inventory provenance: title sweep per TITLE-SWEEP-RULES F1 (no end
anchoring), validated against chapter 10's nine CONFIRMED activities
(F2) and cross-checked against each chapter's Drill/Exercise/Quick
Review Menu screenshots (F3): ch11 Drill Menu 7 / Exercise Menu 4;
ch12 Drill Menu 6 / Exercise Menu 3 -- both agree with the sweep.
Chapter 11 is the "extra activities" chapter the corrected sweep
flagged in 5G: it carries TWO case-style drills and TWO translation
drills and TWO chapter spellers (F5) but no drill titled "Parsing".

Menu-vs-page title discrepancies (5G precedent: the port prints the
PAGE title on both surfaces, recorded in `_menu_note`): ch12's Drill
Menu prints "Imperfect Parsing Indicative Drill" while the page prints
"Imperfect Indicative Parsing Drill" -- use the latter. Ch11's TBK page
name is "Relative/Reflexive Spelling Exercise" but both the page and
the Exercise Menu print "Relative and Reflexive Spelling Exercise" --
use the printed form.

Rail order is each chapter's `sequence` array, taken from the rail
walks:

Chapter 11: c11_learn_objectives, c11_learn_english_concepts,
c11_learn_demonstratives, c11_drill_this_that,
c11_drill_translation_this_that, c11_ex_speller_this_that,
c11_learn_relatives, c11_drill_who_the, c11_drill_translation_relative,
c11_ex_speller_relative, c11_learn_vocab, c11_drill_vocab_gk_en,
c11_drill_vocab_en_gk, c11_ex_vocab_speller, c11_learn_scripture,
c11_drill_scripture_memory, c11_ex_scripture_speller, c11_qr_vocab,
c11_qr_this_that, c11_qr_relative, c11_qr_reflexive,
c11_qr_scripture_jn11, c11_qr_scripture_rom623a,
c11_qr_scripture_rom623b, c11_qr_scripture_mat633a,
c11_qr_scripture_mat633b, c11_learn_bibliography.

Chapter 12: c12_learn_objectives, c12_learn_english_concepts,
c12_learn_imperfect, c12_drill_parsing, c12_drill_augment,
c12_drill_translation, c12_ex_speller, c12_learn_vocab,
c12_drill_vocab_gk_en, c12_drill_vocab_en_gk, c12_ex_vocab_speller,
c12_learn_scripture, c12_drill_scripture_memory,
c12_ex_scripture_speller, c12_qr_vocab, c12_qr_paradigms, c12_qr_eimi,
c12_qr_scripture_jn11, c12_qr_scripture_rom623a,
c12_qr_scripture_rom623b, c12_qr_scripture_mat633a,
c12_qr_scripture_mat633b, c12_qr_scripture_mat69,
c12_learn_bibliography.

Note the interleaving: in BOTH chapters the chapter-specific drills
and speller sit between the Learn pages they exercise and the next
Learn page (ch11 twice: demonstratives, then relatives), exactly as
ch10 interleaves its spellers. Chapter 11's Quick Review carries FIVE
cumulative verses (no Rom 3:23 -- the pack ships F_JN1_1, H_RM623A,
I_RM623B, J_MT633A and the native K_MT633B and nothing else); chapter
12 carries SIX (adds the native Mat 6:9, L_MT6_9).

## 2. Chapter 11 walkthrough (what is new vs. chapter 10)

1. **Learn Chapter Objectives** -- seven objectives from field 0x5e176;
   objective 1 wraps onto an indented second line naming ἐκεῖνος
   (that) and οὗτος (this) -- both Greek words are taps.
2. **Learn English Concepts** -- FOUR topics: Introduction,
   Demonstratives, Relatives, Reflexives/Reciprocals. Underlines come
   from the TBK run tables as `[[u]]`: Demonstratives / adjectives /
   pronouns / this / This on topic 2; who / which on topic 3;
   Reflexive / himself / Reciprocal / one another on topic 4.
   Topic 4's two example sentences are hanging-indent lines inside
   one block (`\n`, `flush`), not separate paras (Stage 8.1).
3. **Learn Demonstrative Pronouns** -- three topics as printed:
   Introduction, "That" Paradigm, "This" Paradigm (the quotation
   marks are part of the printed labels).
   - Introduction: two-line Greek list (ἐκεῖνος -- that (plural =
     those); οὗτος/αὕτη/τοῦτο -- this (plural = these)) with hand
     cursors on both Greek entries; the compound entry is ONE tap
     (clip K_OUTMFN by dispatch, VERIFY item (k)). Its More page is
     headed "Demonstratives" and carries a "Greek Examples" link:
     see the classification log (section 5) -- C6 accordion titled
     "Demonstratives", and inside it a C3 green-underlined link that
     opens the "Demonstrative Examples" modal (four verses, Greek line
     tappable per hand cursor, gloss + reference beneath; clips
     K_EX1-4).
   - "That" Paradigm: ἐκεῖνος -- that/those. Six Greek columns
     (Masc./Fem./Neut. x Singular/Plural), rows N G D A, one Say
     Paradigm (K_EKEPAR). Rendered as the ch7 adjective shape:
     `switch: "named"` Singular/Plural, two three-column charts
     (§4.1). BOTH halves carry the SAME say-all clip -- the original
     has one recording for the whole paradigm (a new data fact, not a
     new renderer feature; the button simply keeps its clip across the
     toggle).
   - "This" Paradigm: οὗτος -- this/these, same shape, plus the chart
     `note` "Note: When there is an α or η in the ending, the stem will
     have an αυ, otherwise it is ου." The note's four Greek fragments
     are NOT taps (no clips exist; they are notation).
4. **This and That Drill** -- `twoStageGrid` with THREE optionStages:
   This/That (2), Masculine/Feminine/Neuter (3), and the eight
   case+number cells arranged as the original's two columns
   (`optionGroups: [2, 2, 2, 2]` -> Nom Sg | Nom Pl, Gen Sg | Gen Pl,
   Dat Sg | Dat Pl, Acc Sg | Acc Pl; D-41 stacked layout). 30 items,
   commit on the final click (the c10 semantic). Prev/Next, Pronounce,
   Hint, Score, Pronounce Each Drill (default ON).
   **Form-dependent Hint (D-46):** items whose form is οὗτος open the
   "This" chart, ἐκεῖνος items the "That" chart -- per-item `hintRef`
   over the drill-level one, exactly the ch10 mechanism. Each hint is
   a C4 modal holding a §4.1 two-state Singular/Plural toggle with NO
   say-all (the original's hint has Cancel only) -- the lone toggle is
   CENTRED (§4.5). The οὗτος hint carries the same note as the Learn
   chart (transcribed from its own screen, §4.7 -- it does appear
   there).
5. **This and That Translation Drill** -- `fullOptionGrid`, `perItem`
   options (three, `stack1col`), 18 items, `ref` per item (Acts 2:18
   ... Mat 16:18), multi-word Greek prompts. Per-item hint as above,
   keyed by which demonstrative the sentence contains. Item 18 is the
   rail end of this drill: the activity-local Next greys and the
   sequential rail continues (directive 7).
6. **This and That Spelling Exercise** -- 25 items; English prompt
   with a parse tag ("those (masc. nom. pl.)") under the label
   "English", answer box labelled "Spell Greek"; standard speller
   controls. Answers are derived by rule from the two paradigms and
   cross-checked against the TBK's own answer literals at assembly.
7. **Learn Relative Pronouns** -- four topics: Introduction, Relatives
   Paradigm, Reflexive/Reciprocal, Reflexive Paradigm.
   - Introduction [R2: shipped as the TBK text, flagged]: in the rail
     walk BOTH the Introduction and the Reflexive/Reciprocal radios show
     the SAME "Reflexive/Reciprocal" box. The TBK holds an unshown "Relative Pronouns" field
     (0x4136e, "A relative pronoun often introduces a subordinate
     clause...") and its "(cont.)" (0x420fc, the case-of-antecedent
     rule with the οὗ/ὕδατος note), and the pack ships six clips
     (K_AGREE1-4, K_UNDER1-2) that nothing else references -- the
     original's Introduction radio is evidently mis-wired. Revision 2
     ships whatever VERIFY item (a) decides; until then treat the
     Introduction as the TBK text, flagged `_verify`.
   - Reflexive/Reciprocal: prose with hand cursors on αὐτός and
     ἀλλήλων -> taps (K_AUTOS, K_ALLHLW). "myself, yourself..." stays
     English.
   - Relatives Paradigm: ὅς -- who/which; six columns, N G D A, note
     "Note how similar these are to the noun endings and to the
     definite article.", Say Paradigm K_OSPAR. Same sg/pl split as
     the demonstratives (the ch5 Definite Article precedent applies:
     short forms still split, for uniformity with its hint twin).
   - Reflexive Paradigm: THREE screens in the original (First Person
     "myself" masc/fem; Second Person "yourself" masc/fem; Third
     Person "him/her/itself" masc/fem/neut), rows G D A only, each
     with the note "Note: There are no nominative forms since the
     personal pronouns fill that role." and its own Say Paradigm
     (K_AUTPAR / K_SEAPAR / K_EAUPAR by dispatch -- names verified at
     assembly, VERIFY (k)). The original switches with in-page
     First/Second/Third Person links. Port: ONE `paradigms[]`
     More/Back stack (§4.2) of SIX charts -- each person split
     Singular/Plural so nothing exceeds three Greek columns at 320 px
     -- with the person's say-all repeated on both of its halves. The
     alternative (three charts each carrying an inner sg/pl toggle)
     nests two navigations and is rejected. Veto item (l).
8. **Who and The Drill** -- three-stage grid: Who/which vs The (2),
   gender (3), case+number (8 as above). Pool alternates article and
   relative forms; two pool lines are blank (VERIFY (b)). Per-item
   hint (D-46): article items open the Definite Article "the" chart
   (row labels Nom./Gen./Dat./Acc., Singular/Plural headers underlined
   in the original -- `headerUnderline` is inert provenance, §3.2),
   relative items open the ὅς chart WITH its note. Both modal hints
   are the centred two-state sg/pl toggle. Context-free ambiguous forms
   (ὅ, ἅ, τό, τά nom/acc; τῷ, τοῦ, οὗ, οἷς masc/neut; ὧν and τῶν all
   three genders) accept every valid parse in the original's own key;
   the data carries them as `answer` + `answerAlt` three-element tuples
   (the 5F list shape generalised) [R2: settled from the TBK, not a
   VERIFY item].
9. **Relative Pronoun Translation Drill** -- nine items, perItem
   options, refs (Jn 6:9 ... Mat 10:27), single hint = the ὅς chart.
10. **Relative and Reflexive Spelling Exercise** -- 26 items mixing
    relative and reflexive prompts ("who (masc. nom. sg.)", "myself
    (masc. gen. sg.)"). Prompt 24 reads "whom (masc. nom. pl.)" in
    the original; VERIFY (h).
11. **Vocabulary** -- ELEVEN entries: ὑπέρ prints twice on the Review
    Vocabulary Chart ("for, about (gen.)(150)" and "above, beyond
    (acc.)") and as two cells in the English-to-Greek grid, so the
    lexicon carries `senses` and both vocab drills use
    `pool: "senses"` (ch6/ch8 shape); the Greek-to-English grid has 11
    options plus one empty cell (the original's 12-cell grid). οὗτος,
    αὕτη, τοῦτο is one lemma with three tappable parts (K_VOC7A/B/C)
    and ὅς, ἥ, ὅ likewise if dispatch confirms; `partAudio[]` on the
    review-chart row. Learn Vocabulary is the standard flashcard
    stepper.
12. **Scripture Memory** -- Learn: Mat 6:33b interlinear (καὶ ταῦτα
    πάντα / προστεθήσεται ὑμῖν., five words, Say Whole Verse
    K_MT633B). Drill: the pool is TWELVE words spanning BOTH halves of
    Mat 6:33 (ζητεῖτε ... ὑμῖν, τοῦ θεοῦ omitted) with a 12-option
    static English grid -- a cumulative pool, new relative to ch10's
    single-half drill; clips j_sm* (shipped forward in CHAPT_11) plus
    k_sm1-5. Speller: `spellVerse`, Mat 6:33b, the English hint line
    "and all these things / will be added to you" under the keyboard,
    no Repeat control.
13. **Quick Review** -- Review Vocabulary Chart (11 rows, ntFreq,
    K_VOCL11 Say Whole List); Review This and That Paradigms (the
    original pages ἐκεῖνος/οὗτος with a This/That button: C9 stacks
    ALL FOUR half-charts -- ἐκεῖνος Singular, ἐκεῖνος Plural, οὗτος
    Singular (+note), οὗτος Plural -- one say-all per chart, the two
    halves of a demonstrative sharing its clip; no toggles, §4.6);
    Review Relative Pronoun Paradigm (two stacked halves + note);
    Review Reflexive Pronouns Paradigms (the original pages three
    persons via links: C9 stacks all six half-charts); five
    interlinear verses; Learn Bibliography (Machen, Mounce, Summers,
    Wenham -- four plain-string biblist items with hanging indents).

## 3. Chapter 12 walkthrough (what is new vs. chapter 11)

1. **Learn Chapter Objectives** -- six objectives (0x301ca); objectives
   1 and 2 wrap to indented continuation lines.
2. **Learn English Concepts** -- TWO topics (Introduction; Comparison
   with Greek). Underlines: drove / was driving; aorist / imperfect.
3. **Learn Imperfect Indicative Verbs** -- SEVEN topics as printed:
   Introduction, Form, Imperfect Active, Imperfect Middle/Passive,
   Augments, εἰμί Imperfect, ἔχω Imperfect (Greek in the radio labels
   is an inert control label, §3.5).
   - Form: prose, then the centred formula block (ch10 D-48f2 shape,
     `align: "center"`, `\n`): "Augment + Verb stem + Connecting vowel
     / + Secondary active endings" and "ε + λυ + ο + ν = ἔλυον / Aug
     Stem CV Ending". Hand cursors sit on ε, λυ and ἔλυον; which clips
     they dispatch is read at assembly (VERIFY (j)). The More page
     "Form (cont.)" (connecting vowel: ο before μ and ν, ε elsewhere)
     MERGES into the Form topic as C5 (section 5).
   - Imperfect Active / Imperfect Middle/Passive: full-page paradigms
     of λύω, two columns (Singular, Plural) with English glosses in
     the cells, rows 1 2 3, Say Paradigm (L_IPFPAR / L_IPMPAR), chart
     titles tappable (D-40: L_LUW). Middle/Passive carries the note
     paragraph beneath ("The above paradigm is translated using the
     passive voice...") as a `note`. ἔλυε(ν) prints with its movable
     nu in parentheses -- verbatim, and the speller accepts both
     spellings via `answerAlt`.
   - Augments: rules 1-2 as a `numbered` block; rule 2's contraction
     table (α + ε = η ... ευ + ε = ηυ, eight equations in three
     printed rows) is emitted as three `\n` lines inside item 2 so
     the original's row grouping survives; it is notation, not taps.
     The "Examples" link beneath the table becomes a C1 accordion
     titled "Contraction Examples" (five rows: rule, form, derivation
     -- e.g. "ε + α = η   ἤκουον   ἀκούω + ε augment"; hand cursors on
     the Greek forms -> taps, L_EX* by dispatch). The More page
     "Augments (cont.)" -- rules 3-4 with ἐκβάλλω becomes ἐξεβάλλον /
     ἀποκτείνω becomes ἀπέκτεινον (taps) -- MERGES as C5 into ONE
     numbered list 1-4; the original's own Augment Drill hint prints
     all four rules on one screen, which is the evidence for the
     merge.
   - εἰμί Imperfect: two-column paradigm (ἤμην ... ἦσαν), L_EIMPAR;
     title Greek tappable (L_EIMI).
   - ἔχω Imperfect: paradigm (εἶχον ... εἶχον), L_EIXPAR, title tap
     L_EXW, plus the exception `note` whose θέλω and ἤθελεν are taps
     (hand cursors; L_THELW, L_NTHEL).
4. **Imperfect Indicative Parsing Drill** -- `twoStageGrid`, TWO
   stages: Active | Middle/Passive; then the six person/number cells
   (`optionGroups: [2, 2, 2]`). 23 items, `translate` per item (the
   Translate button, ch10 shape; the gloss pool prints "I was
   loosing/they were loosing" for the ambiguous forms and is shipped
   verbatim). Form-dependent Hint (D-46): λύω forms open Imperfect
   Active + Middle/Passive of λύω; εἰμί and ἔχω forms open "Imperfect
   of εἰμί" + "Imperfect of ἔχω" (the hint's own titles, §4.7; the
   hint's ἔχω chart carries NO exception note and lowercase glosses
   -- transcribe the hint screen, not the Learn page). Each hint is a
   §4.1 two-state toggle -- labels Active / Middle/Passive and
   εἰμί / ἔχω -- with no say-all, centred (§4.5; D-48f1/f3 precedent).
   Ambiguity: ἔλυον and εἶχον are 1 sg AND 3 pl; the original's key
   accepts both and the data carries both (`answer` First Singular,
   `answerAlt` Third Plural) [R2: settled from the TBK].
5. **Augment Drill -- NEW DRILL SHAPE.** Instruction "Click on the
   correctly augmented verb". Prompt panel: a present-tense lemma in
   Greek, its gloss beneath ("I know") and a reference ("Mat 1:25") in
   the corner (`promptGloss: true`; items carry `greek`, `gloss`,
   `ref`). Three GREEK options stacked in one column (`options:
   "perItem"`, `optionsAreGreek: true`, `optionLayout: "stack1col"`):
   the correctly augmented form and two wrong augmentations, the
   correct column per item read from the page's AnalyzeAnswer script.
   Option buttons carry no audio (directive 9). Prev/Next, Pronounce,
   Hint, Score, Pronounce Each Drill. Hint: the full-page "The augment
   is added in 4 ways:" chart, transcribed from the hint's own field
   0x10fae6 as inline `hint.content` (C4/C7 flowing modal, no toggle).
   19 items (clips l_ad1-19, dispatch table 0xa4706).
   **[R2] AUDIO IS `afterGuess` (ledger row 108 CONFIRMED; RULES A1b):
   the clip is the AUGMENTED ANSWER form, not the lemma shown.** That
   creates a directive-9 problem the original did not solve well: the
   displayed lemma is normally a tap and the Pronounce button exists,
   but either would play ἐγίνωσκεν and hand over the augment before the
   guess. Build it this way, flagged for veto (VERIFY (d), proposed
   D-50): the prompt lemma renders in INK (non-tappable, the Syllable
   Division exception treatment) and Pronounce is DISABLED until the
   item is answered; after the guess the clip plays (A2: it finishes
   before the next item), and both the lemma tap and Pronounce become
   live and replay it. The Augment Drill therefore mounts SILENT
   (B-last: afterGuess means no pronounce-on-advance, so none on load).
   No renderer novelty beyond the prompt panel's three-line layout and
   the answered-gate on the prompt tap; if the panel needs a new prompt
   style, report it as W4 friction rather than inventing a mode.
6. **Imperfect Indicative Translation Drill** -- 20 items, perItem
   options, refs (Mat 1:25 ... Rev 13:11), two-line Greek where the
   original wraps (item 20: `greek2`). Single hint = λύω Active +
   Middle/Passive two-state toggle (the same hintCharts entry the
   parsing drill's λύω items use).
7. **Imperfect Indicative Spelling Exercise** -- 23 items, English
   prompts ("I was loosing", "she was loosing for herself", "you
   (sg.) were"); rule-derived answers cross-checked against the TBK's
   answer literals; ἔλυε/ἔλυεν and εἶχε/εἶχεν accepted via
   `answerAlt`.
8. **Vocabulary** -- 10 lemmas (ἀποθνῄσκω, ἐκεῖ, ἕως, ἰδού, ἵνα,
   Ἰωάννης -ου ὁ, μέν, ὅλος -η -ον, ὅτε, σύν), l_voc1-10, L_VOCL. The
   Review chart prints μέν's gloss as "one the one hand, indeed" (the
   original's typo; VERIFY (g)).
9. **Scripture Memory** -- Learn: Mat 6:9, ten words in three
   interlinear lines (Πάτερ ἡμῶν ὁ ἐν τοῖς / οὐρανοῖς· ἁγιασθήτω τὸ /
   ὄνομά σου·), Say Whole Verse L_MT6_9. Drill: SEVEN prompts (the
   articles are not drilled), 8-cell grid with one empty cell as in
   the original; clips l_sm1-10 by verse position. Speller: the whole
   verse with the English hint "Our Father which art in heaven, /
   hallowed be your name," beneath the keyboard; the ano teleia after
   οὐρανοῖς and σου stays optional (C6/D-18) and is stored as U+00B7.
10. **Quick Review** -- Review Vocabulary Chart; Review Imperfect
    Paradigms (the original pages Active/Middle-Passive with a toggle
    and titles the page "Review Imperfect Paradigm": C9 stacks both,
    each with its say-all, the Middle/Passive note beneath its chart;
    page title per the menu's plural, veto (l)); Review Imperfect
    Indicative of εἰμί (one chart, its title Greek a tap; ἔχω is NOT
    reviewed in the original -- do not add it); six interlinear
    verses (Jn 1:1, Rom 6:23a, Rom 6:23b, Mat 6:33a, Mat 6:33b, Mat
    6:9); Learn Bibliography (four items).

## 4. Work items (W1..W9) and renderer notes

W1 Register chapters 11 and 12 in the lazy-chunk glob and the TOC
   (toc.json entries delivered with the data); `npm run check:lazy`
   green for both.
W2 Learn pages, both chapters, including the disclosure shapes of
   section 5 (C6 accordion + C3 modal in ch11 Demonstratives; C1
   "Contraction Examples" accordion and the two C5 merges in ch12).
W3 Paradigm surfaces: named sg/pl toggles sharing one say-all clip
   across both states (verify the button keeps working after toggling
   -- a state change must not drop the clip); the six-chart
   More/Back reflexive stack (§4.2: Back and More always visible,
   disabled at the ends, Back left / More right, D-38).
W4 The four ch11 drills and the three ch12 drills, including: the
   Augment Drill's afterGuess gate (ink lemma, disabled Pronounce until
   answered, section 3.5); the
   8-cell third stage with `optionGroups: [2, 2, 2, 2]`; per-item
   `hintRef` (D-46, already in the renderer -- confirm it takes
   precedence over the drill-level ref on EVERY item, not just the
   first); `answerAlt` accepted on three-stage items (extend the
   two-stage check from 5F -- a list of alternate full tuples); the
   Augment Drill prompt panel (Greek + gloss + ref).
W5 Hint modals: two-state toggles with Greek labels (εἰμί / ἔχω),
   centred lone toggle where no say-all exists (§4.5), fixed-footer
   composition measured as painted strips at forced scroll (§4.3, the
   D13 harness), never stacked (§4.4).
W6 Spellers: four ch11 + three ch12, `answerAlt` movable-nu pairs,
   parse-tag prompts, whole-verse spellers with their English hint
   line, no Repeat control, Show Answer as the only reveal.
W7 Vocabulary surfaces with the 11-entry `senses` pool (ch11) and the
   cumulative 12-word Scripture Memory drill; D-19 grid sizing
   applies (`poolKind: "vocabulary"`).
W8 Quick Review pages: C9 stacks (four half-charts; six half-charts;
   Active + Middle/Passive), never paging, one say-all per chart.
W9 Harness extensions (section 7.3), the visual checklist, airplane
   mode, RESULTS/BUILD/CHECKLIST.

[R2] Data keys the shipped files use, so nothing is guessed at build
time (all pass `check:shapes`; the ones marked NEW are minor
extensions of existing shapes, not modes):
- three-stage `twoStageGrid` with `optionStages[2].layout:
  "paradigm2col"` and `answerAlt` as a list of three-element tuples;
- per-item `hintRef` (D-46) on every item of the five form-dependent
  drills; `hintCharts.<id>.charts` two-chart bundles whose TITLES
  differ in exactly one word (Singular/Plural; Active/Middle-Passive;
  εἰμί/ἔχω), which is how `paradigmToggleLabels` derives the toggle;
- `switch: "named"` paradigm blocks with `charts[].subtitle` and
  `showGlosses: false`; the six-chart `switch: "moreBack"` reflexive
  stack; Quick Review `paradigms[]` lists of the same chart objects;
- `headerUnderline: true` on the article hint charts (INERT, §3.2);
- Augment Drill: `promptGloss: true` with item `gloss` + `ref`; inline
  `hint: {title, content[]}` (the ch2 inline-hint shape); NEW: the
  afterGuess prompt gate of section 3.5;
- `greekRows` rows with `layout: "verseExamples"` (ch8 shape) in the
  Demonstrative Examples popup, reached by `[[link:demonstrativeExamples]]`
  inside an `expander`; NEW: `greekRows` `layout: "contraction"` whose
  rows carry `gloss` (the rule, notation) and `parts[]` mixing
  `{greek, audio}` and `{text}` entries -- render as one line per row,
  rule / augmented form / lemma + "ε augment", both Greek forms tapping;
- topic-level `audioMap` (ch7 shape) for the ἔχω-note, reflexive prose
  and compound-verb taps; `titleAudio` on topics (ch10 shape) and NEW on
  the `c12_qr_eimi` Quick Review page;
- `formula` block (D-48f2 shape) in the ch12 Form topic;
- speller `answerAlt` strings for the movable-nu pair; lexicon `parts[]`
  + `audioFull` on the three-form οὗτος entry (flashcard plays the
  full recitation, drills the single form).

Expected renderer novelty: NONE that requires a new mode or block
type. Every shape above is registered (PHASE5-PLAN mode registry)
or is a data fact riding an existing shape. If that expectation fails,
STOP on the item and report the missing shape with the data excerpt
(0.4); do not add a mode.

## 5. Disclosure classification log (DISCLOSURE-RULES §2, decisions logged per §5)

| Chapter / screen | Cat | Decision | Veto? |
| --- | --- | --- | --- |
| 11 Demonstratives > Introduction More page "Demonstratives" | C6 | own header -> accordion titled "Demonstratives", collapsed, boxed (§3.1) | yes (l) |
| 11 Demonstratives > "Greek Examples" link | C3 | green underlined link inside the accordion -> modal "Demonstrative Examples" (C7 flowing, four verses) -- payload is verses, not a chart, so C1 does not outrank it | yes (l) |
| 11 "That"/"This"/ὅς paradigms | C8-main | `switch: "named"` Singular/Plural on the say-all line (§4.1); §4.1 label rule: one-word contrast exists | no |
| 11 Reflexive Paradigm (3 persons x sg/pl) | C8-main 3+ | six-chart More/Back stack (§4.2) | yes (l) |
| 11 all four drill hints | C4 + C8 | per-item chart (D-46); modal holds a centred sg/pl two-state toggle, no say-all | no |
| 11 Review This and That / Relative / Reflexive | C9 | stacked half-charts, no toggles (§4.6) | no |
| 12 Form > "Form (cont.)" | C5 | header is the same title with "(cont.)": continuation, merged with `gapBefore` | yes (l) |
| 12 Augments > contraction table | -- | notation lines inside numbered item 2 | no |
| 12 Augments > "Examples" link | C1 | chart payload outranks the link trigger (§6.1) -> accordion "Contraction Examples" (§3.5 qualifier form), placed immediately after item 2 | yes (l) |
| 12 Augments > "Augments (cont.)" | C5 | rules 3-4 continue the numbered list; one list 1-4 (the Augment Drill hint shows all four on one screen) | yes (l) |
| 12 Parsing Drill hints | C4 + C8 | two two-state toggles (Active/Middle-Passive; εἰμί/ἔχω), form-dependent | no |
| 12 Augment Drill hint | C4 / C7 | one flowing page, transcribed from field 0x10fae6 | no |
| 12 Translation Drill hint | C4 + C8 | Active/Middle-Passive two-state toggle | no |
| 12 Review Imperfect Paradigms | C9 | Active above Middle/Passive, note beneath the second | no |

## 6. Audio wiring notes (read before testing sound)

- EVERY clip id in the data is dispatch-read from the TBK's SayWord /
  WordSelection tables (Stage 8.2) or asserted present in one; the
  assembler fails otherwise. Filename sequence is never evidence.
- Ch11 K_VOC7A/B/C are the three parts of the οὗτος, αὕτη, τοῦτο
  entry; K_VOC10 and K_VOC11 back the two ὑπέρ senses; K_VOCL11 is the
  Say Whole List. Whether the This and That Drill pronounces the
  isolated form from the K_OUT*/K_EKE* paradigm-cell clips (24 + 24)
  or a separate set is a dispatch read -- expect the cell clips.
- Ch11 E_* (17 article forms) and K_OS* (24 cells) back the Who and
  The Drill and the ὅς paradigm; K_AUT*/K_SEA*/K_EAU* (12/12/18) back
  the reflexive charts. K_AGREE1-4 and K_UNDER1-2 are unreferenced
  until VERIFY (a) resolves the Relative Pronouns Introduction.
- Ch11 Scripture Memory clips: j_sm1,2,3,4,5,8,10,11 (Mat 6:33a
  positions, shipped forward) + k_sm2-5 (6:33b), table-read at 0xa2ba4;
  the Learn interlinear uses k_sm1-5 and K_MT633B.
- Ch12 L_EIS1-3/L_EIP1-3 = εἰμί singular/plural cells; L_EIXS/L_EIXP =
  ἔχω; L_AS*/L_AP*/L_MS*/L_MP* = λύω active/middle-passive cells
  (L_A3S is a separate clip -- the ἔλυε(ν) variant or a re-recording;
  VERIFY (k)); L_IPFPAR / L_IPMPAR / L_EIMPAR / L_EIXPAR say-alls;
  L_EX1-14 = the ten contraction-example forms plus the four
  compound-verb forms; L_LUW / L_EIMI / L_EXW title taps; L_THELW /
  L_NTHEL the ἔχω note taps; L_A1S and L_AP9 are unreferenced by any
  dispatch table (listen, VERIFY (k)); l_ad1-19 the Augment Drill's AUGMENTED ANSWER forms (A1b); l_td1-20
  translation prompts; l_sm1-10 verse positions; L_MT6_9 whole verse.
- Per DRILL-BEHAVIOR-RULES A2, `afterGuess` clips finish before the
  next item; the multi-word translation clips in both chapters are
  the long ones -- watch for overlap.

## 7. Acceptance and verification

7.1 **Gates**: `npm run verify` green (shapes, docs guard noted as
    the standing CRLF false-failure only, lazy-chunk); `npm run
    build`; ui-behavior extended to all 20 new activities (every
    advance class path exercised: correct auto-advance, incorrect
    reveal-and-wait on the seven manualOnIncorrect drills, incorrect
    reveal-and-auto on the six autoBoth drills, retry-until-right on
    the seven spellers); ui-modals over every new hint and the
    Demonstrative Examples modal at forced scroll with the strip
    measurement; ui-walk over all 51 new rail stops at both widths, 0
    interaction errors; ui-offline covering both chapters; the
    ui-disclosure3 census re-run with the new activities classified
    per B-last (section 7.4).

7.2 **Visual walkthrough (MANDATORY, every page)**: load EVERY page
    of both chapters in a real browser at 320 px and 768 px,
    screenshot, and compare against the corresponding rail-walk
    screenshot. Compare explicitly: line breaks and indentation
    inside prose and example blocks; every underline and its extent;
    list markers and hanging indents; citation alignment; WHICH WORDS
    ARE TAPPABLE (every hand-cursor word in the rail walk must tap;
    everything tappable must be blue or green-underlined and nothing
    else may be); chart column alignment and that no chart clips at
    320 px (overflow is hidden app-wide -- a clipped column errors
    nothing); the note lines beneath charts; the Augment Drill prompt
    panel's three lines; the empty grid cell on the ch11 Gk->En and
    ch12 Scripture Memory drills; hint content matching the HINT's
    original screen (not the Learn page's); modal footer strips at
    forced scroll. Record each page in `5H-VISUAL-CHECKLIST-<MODEL>.md`
    with pass/fail and the rail-walk page number. Asserting that a
    string exists in JSON is NOT visual verification.

7.3 **Harness extensions**: three-stage grid with an 8-value final
    stage; `answerAlt` on three-stage and two-stage parsing items;
    per-item hintRef switching (assert the modal title changes between
    an οὗτος item and an ἐκεῖνος item, and between a λύω item and an
    εἰμί item); named toggle retaining its say-all across states;
    six-chart More/Back bounds; Greek perItem options on the Augment
    Drill; the cumulative 12-word SM grid.

7.4 **Initial load (B-last)**: RESULTS lists all 20 activities in one
    table -- sequence-stepped (auto-load item 1, pronounce on mount
    iff pronounce-on-advance) vs selection-driven -- each with its
    ledger row. All 20 are sequence-stepped; there is no afterTap
    surface in either chapter. [R2] The Augment Drill loads item 1 and
    mounts SILENT (afterGuess).

7.5 **Airplane mode**: both chapters fully walkable offline after one
    online visit, audio packs installed from Settings; no manifest
    change.

## 8. VERIFY-5H items (human-in-the-loop; produce VERIFY-5H.md answers)

Nathanael's DOSBox/device pass; the implementer's VERIFY-5H.md asks
for JUDGEMENT and DOSBox facts only, never for what a script can
establish.

(a) Learn Relative Pronouns > Introduction: does the original EVER
    show "Relative Pronouns -- A relative pronoun often introduces a
    subordinate clause..." (and its "(cont.)" page with the
    οὗ/ὕδατος note)? If not, decide: RESTORE the TBK text under
    Introduction (evident-intent restoration, like ch10 parsing item
    18) or MIRROR the original's duplicated Reflexive box. Six clips
    (K_AGREE1-4, K_UNDER1-2) exist for that text.
(b) [R2: SETTLED from the TBK -- 30 items, the blanks are ᾗ and ᾧ; the
    key accepts every valid parse. No action.]
(c) [R2: SETTLED -- the key accepts both readings. No action.]
(d) [R2, replaces the resolved listen] Augment Drill in DOSBox: does
    clicking Pronounce BEFORE guessing play the augmented form? If it
    does, the original leaks the answer through Pronounce and the
    port's ink-lemma / disabled-Pronounce default (section 3.5) stands
    as a deliberate improvement (D-50 to be logged); if Pronounce is
    disabled or silent before the guess, the port is mirroring, and
    D-50 records only the ink lemma.
(e) Ch12 Parsing Drill Hint: confirm λύω items open the λύω charts and
    εἰμί/ἔχω items open the εἰμί + ἔχω page (D-46 pattern); confirm
    the Translation Drill's Hint opens the λύω charts only.
(f) Ch11: confirm form-dependent hints on the This and That Drill and
    This and That Translation Drill (οὗτος vs ἐκεῖνος charts) and on
    the Who and The Drill (article vs ὅς chart).
(g) μέν gloss "one the one hand, indeed" on the ch12 Review chart:
    keep verbatim (typo policy A1) or fix? Divergence entry either
    way.
(h) Relative and Reflexive Spelling Exercise prompt 24 "whom (masc.
    nom. pl.)": verbatim or "who"? The answer form is οἵ either way.
(i) [R2: SETTLED by the dispatch table at 0xa2ba4 -- the drill plays
    the 6:33a position clips for the first eight prompts. No action.]
(j) Ch12 Form topic: which clips play on ε, λυ and ἔλυον in the
    formula (hand cursors)? If none, the port ships them inert.
(k) Listens: K_OUTMFN (the οὗτος/αὕτη/τοῦτο entry?), K_AUTOS, K_ALLHLW,
    K_VOC7 (three-form recitation?) vs K_VOC7A/B/C, K_VOC10 vs K_VOC11
    (which ὑπέρ sense is which), K_AUTPAR / K_SEAPAR / K_EAUPAR (which
    person each recites), L_AP3 (third-plural ἔλυον?) vs the
    unreferenced L_A1S and L_AP9, L_EX1-14 order (rows then compound
    examples), L_EX5/6 (ὠρχούμην / ὀρχέομαι as printed).
(m) [R2] Ch11 Demonstrative Examples: τοὺτου is typed with a GRAVE in
    the original's field (the drill pool has the acute) and item 13 of
    the This and That Translation Drill types ἐκεῖνοί with no
    breathing. Keep verbatim or fix? Divergence entries either way.
(n) [R2] Ch11 vocabulary speller has TEN items (ὑπέρ once, prompted
    "for, about (gen.)") although the chapter has eleven entries;
    confirm in DOSBox that the speller does not offer an eleventh.
(l) Classification vetoes (section 5 rows marked yes) and the ch12
    Quick Review page title ("Review Imperfect Paradigms" vs the
    page's singular).

## 9. Grading and closure

Both implementers run this spec (small behavior-focused shapes, two
chapters -- the standing scheduling heuristic favours a dual run; if
Sol's credit budget is at risk, Opus solo and say so in the ledger).
The grader audits BUILD diffs against RESULTS claims per
GRADER-PROMPT.md v2, applies the step-0 automatic penalties for a
missing wall clock or an incomplete diff, and emits 5H-XPATCH1.md only
with a strong case. The winner applies any XPATCH, updates its RESULTS
with an XPATCH section (no BUILD doc for the patch phase), and authors
VERIFY-5H.md. VERIFY-5H.md excludes anything the Playwright harness
can settle. Cohort 5H closes on Nathanael's VERIFY-5H-RESULTS and a
device pass. DRILLBEHAVIORLEDGER.csv rows 96-115 are already CONFIRMED
(2026-08-25). Project-file uploads due with this revision:
DRILLBEHAVIORLEDGER.csv, DRILL-BEHAVIOR-RULES.md (A1b), 5H-SPEC1.md,
chapt-11.json, chapt-12.json, lexicon-chapt11.json, lexicon-chapt12.json.
Standing from this cohort on: every spec ships WITH its data files and
assemblers (Nathanael, 2026-08-25).
