# 5C-RECON-FINDINGS.md — chapters 3-8 recon + rich-text parser experiment

Cohort 5C, chat-side only, executed 2026-07-28. This is the evidence
record behind the PHASE5-PLAN cohort ledger, the font-map promotions,
and 5D-RECON-TASKS. Repo archive document; the durable conclusions are
harvested into PHASE5-PLAN.md, PIPELINE-INSIGHTS-v3.md and
CHAT-HANDOFF.md.

## 1. Chapter inventory (from the ISO)

| ch | TBK | TBK bytes | WAVs | WAV bytes |
|---|---|---|---|---|
| 3 | 3_VERBS.TBK | 794,148 | 64 | 1.24 MB |
| 4 | 4_NOUNS2.TBK | 1,079,230 | 91 | 2.09 MB |
| 5 | 5_NOUNS1.TBK | 1,014,800 | 135 | 3.87 MB |
| 6 | 6_PREPS.TBK | 1,125,282 | 145 | 4.27 MB |
| 7 | 7_ADJS.TBK | 1,057,998 | 190 | 6.17 MB |
| 8 | 8_PRONS.TBK | 1,406,600 | 179 | 5.22 MB |

Chapters 9-28 (volumes only, no string pass): 115-274 WAVs each,
TBKs 0.84-1.50 MB. Trend is flat-to-rising; no chapter is an outlier
in either direction. Titles per toc.json.

## 2. The fixed chapter skeleton (chapters 3-8, from page/button names)

Every chapter 3-8 carries the same frame:

- Learn: Chapter Objectives, English Concepts, <grammar topic>,
  Vocabulary, Vocabulary Builder, Scripture Memory, Bibliography.
- Drills: Vocabulary Greek-to-English, Vocabulary English-to-Greek,
  Scripture Memory Drill, plus 1-3 topic drills (below).
- Exercises: Vocabulary Spelling, Scripture Memory Spelling
  ("Enter all of <verse> then click Check Answer"), plus a topic
  spelling exercise.
- Quick Review: Review <topic> Paradigm/Chart, Review Vocabulary
  Chart, Review Scripture Memory (CUMULATIVE: each chapter reviews all
  prior verses; ch8 reviews Jn 14:6a, Jn 14:6b, Rom 3:23, Jn 1:1,
  Rom 6:23a), with Say Whole Paradigm / Say Whole List / Say Whole
  Verse buttons.

Topic drills per chapter, with their on-page instruction strings:

- ch3: Greek Verb Drill ("Click on the correct Greek Verb form"),
  Verb Translating Drill ("Click on the correct translation"),
  Parsing Drill ("Click on the matching parsing").
- ch4: Greek Noun Drill ("Click on the correct Greek Noun form to
  replace the underlined English word"), Declining Noun Drill
  ("Click on the matching case and number").
- ch5: First Declension Noun Drill (underlined-English form, as ch4),
  Declining Noun Drill (case+number), Definite Article Drill.
- ch6: Preposition Case Drill ("Click on the matching case"),
  Preposition Translation Drill ("Click on the correct English
  translation"), Spell Greek Phrase variant in the speller.
- ch7: Adjective Case Drill, Adjective Translation Drill, "Eimi"
  Translation Drill, Parsing "Eimi" Drill, plus Learn Verb: "Eimi".
- ch8: Personal Pronoun Case Drill ("Click on the person then the
  case" — the one two-step selection in the cohort), Personal Pronoun
  Translation Drill.

Every drill instruction observed maps onto the existing `select`
contract (static option sets; {sentence, underline} prompts already
exist from chapter 2). The two-step ch8 drill and the whole-verse
speller are the only interaction shapes without a shipped component.

## 3. Audio taxonomy (chapters 3-8)

Per-chapter prefix = chapter letter (c_=3 ... h_=8). Families:

- N_voc1..10 + N_vocl (Say Whole List) — vocabulary, every chapter.
- N_sm* + whole-verse clip — Scripture Memory word-by-word audio
  (c_sm1..14 + c_sm14_6 for Jn 14:6a; d_sm1..9 + d_sm6b; e_sm 9 +
  e_rom; f_sm 12-13 + f_jn1_1; h_sm 6 + h_rm623a; i_rm623b appears in
  CHAPT_8 — chapter 9's verse pre-shipped, follow the ISO).
  Earlier chapters' sm clips are DUPLICATED FORWARD into every later
  chapter folder (cumulative review self-containment, mirrors the ISO).
- Paradigm cell audio: ch3 five verbs conjugated (c_luw, c_lueis...);
  ch4/5 noun declensions (d_logos..., e_doxa..., e_grap*, e_hwr*,
  e_prop*); ch5 definite article (e_art* + e_t* forms); ch7 full
  adjective paradigms 24 forms each (g_aga***, g_dik***) + eimi
  (g_eimi1s..3p) + negatives (g_ou/ouk/oux); ch8 pronoun paradigms
  (h_1*, h_2*, h_3[mfn]*).
- Drill item clips: f_tpd1..40 (preposition translation), g_atd1..15,
  g_etd1..14 (adjective / eimi translation), h_d2_1..20, h_d3_1..21.
- ch6 prepositions carry 3-6 clips each (f_apo1..3, f_dia1..4,
  f_elis1..6 = elision examples, f_comp1..3 = compounds?) — the only
  audio family whose exact surface mapping needs recon.

## 4. Font-map findings (word evidence, non-Hebrew regions)

- `$` = ROUGH BREATHING + CIRCUMFLEX. Witnesses: `w$rai` = ὧραι in
  the ch5 hōra paradigm chart (Singular/Plural, Nom./Voc. row, next to
  `w!ra`/`w!raj`/`w[rw?n`); `ou$toj` = οὗτος in ch7 "kai> o[ a@nqrwpoj
  ou$toj di<kaioj" glossed "and this man was righteous (Lk 2:25)".
  This fills the exact gap v3 predicted.
- `!` = ROUGH BREATHING + ACUTE — reversal of the chapter-2
  exclusion. Clean ch5 witnesses: `w!ra` ὥρα, `w!raj` ὥρας, `w!raij`
  ὥραις, `w!ran` ὥραν, `w!r%` ὥρᾳ. Chapter 2's finding also stands:
  its only `!` hits were inside genuine Hebrew regions, and no ch2
  Greek word carries rough+acute on a single letter. `!` still ALSO
  occurs in Hebrew-font regions — region exclusion runs before
  conversion.
- `=` re-confirmed as OpenScript comparator only (`="lo<goj"`-style
  script literals in ch4/5/7 answer-checking code — themselves a
  useful answer-extraction source). `{ } | ~` remain font-metric
  junk; `\` remains DOS paths. None witnessed in rendered text.

## 5. Hebrew-contamination model, corrected

The v3 tell-tale list over-flags. `HebrewWord`, `HebrewWords`,
`HebrewWordCounter`, `ShowAnswerBeforeTyping` etc. are FIELD NAMES of
the SHARED DRILL ENGINE and appear inside fully legitimate GREEK
drills (the ch2 part-of-speech pool lives in a field named
"HebrewWord"; ch5 Greek spelling pools sit adjacent to
"HebrewWordCounter"). Reliable contamination tell-tales are:
`(Hi)`/`(Ni)` stem labels, Hebrew glosses with no Greek nearby, and
the Attributive/Predicate/Substantive "Hints" popups whose agreement
list includes "Definiteness" (a Hebrew category; Greek agrees in
case). Region exclusion stays, but keyed on those, not on `Hebrew*`
field names.

## 6. Rich-text parser experiment — SUCCESS

Structure (derived from ch2 ground truth, validated on ch1, blind-
tested on ch5 and ch3):

- Field text: `[b0:1][len:u16 LE][text bytes]`, CRLF line breaks.
- Format-run table follows its text: `[u16 nruns][u16 nruns]
  [00 00][01 00][7 bytes]` then (nruns-1) records of
  `[u16 charOffset][u16 formatId][7 aux]`; run 0 is implicit
  (offset 0, default format). charOffset is a plain byte offset.
- formatId values are file-scoped format records. Anchoring per file
  classifies them (Greek font vs English vs decorated); underline and
  Greek-font switches both surface as run boundaries.

Validation: every underline span in the ch2 part-of-speech pool
matched the device-verified data exactly (Greek 4-9, amazing 48-55,
Persistently 240-252, multimedia 503-513, ...). Blind ch5 test
recovered the complete hōra and doxa paradigm charts (row/column
labels, Greek cells, Mounce citation), the First Declension Noun
Drill sentence pool WITH its underlined-word spans, four parallel
Greek option columns, the gloss pool and the per-item Scripture
reference pool. Ch3 recovers the Present Active paradigm (both the
Learn page and the Quick Review chart), the vocab chart with glosses,
and the drill pools follow from plain-string regions (six option
columns for the Greek Verb Drill, three for the Translating Drill,
prompts and refs for the Parsing Drill, the Jn 14:6a word list).

Known limits (declared): field NAMES are located by proximity only
(no object-tree walk); adjacent fields can abut and a few boundaries
stay ambiguous; the 7 aux bytes are not understood; formatId ->
concrete style is anchored per file, not decoded from format records;
fields with uniform formatting have no run table (they are plain-
string-reachable anyway). Coverage on run-table fields: 23-37
recovered pairs per chapter across ch1/2/3/5.

Consequence: the ~75% extraction ceiling is retired. The residual
manual share is now sequence order, screen-layout confirmation for
NEW modes, mechanics that only behavior shows (timing, scoring,
shuffle), and spot-checks of rule-derived answers.

## 7. Novelty verdict per chapter (drives the ledger)

- ch3: THE one-time-cost chapter. New: paradigm mode (+ Say Whole
  Paradigm), parse-type select variant, translate-type select
  variant, Scripture Memory family (word-stepper drill + whole-verse
  speller + cumulative review chart), Vocabulary Builder page (links
  toward vocab\vocab1.tbk — cross-book, likely deferred surface).
- ch4: pure reuse of ch3 vocabulary (noun paradigms, case+number
  select, underlined-English select from ch2). Second verse added.
- ch5: reuse of ch4 + definite-article paradigm (same mode).
- ch6: reuse + possible prepositions GRAPHIC (recon item), elision/
  proclitic teaching, Spell Greek Phrase (space in speller).
- ch7: reuse at larger volume (full 24-cell adjective paradigms,
  eimi, enclitic teaching); no new interaction shape found.
- ch8: reuse + the two-step person-then-case drill.
