# 5F-EXTRACTION-MAP.md — where chapters 6, 7 and 8 live in their TBKs

Pipeline-side working document, cohort 5F. Produced 2026-08-07 from
`GKTUTOR/CHAPT_6/6_PREPS.TBK` (1,125,282 B), using
`scripts/tbk_fields.py` + `scripts/tbk_richtext.py`. Chapters 7 and 8
follow in sections 2 and 3 as they are extracted.

Every offset below was READ and eyeballed against the corresponding page
of `ch6railwalk.pdf`. This file is provenance, not a build input.

**Reading rule** (see the header of `tbk_fields.py`): the u16 length
prefix gives the read, the DOSBox screenshot gives the cut. ToolBook
does not zero a field buffer on rewrite, so several of these regions
carry a stale tail after their real text — most conspicuously
chapter-7 adjective prose ("...(reciprocal). e.g. Terry kicked
himself.") behind the English-concepts pages, chapter-5 προφήτης
speller prompts behind the Preposition Spelling Exercise, and
chapter-2 accent-rule prose behind two others. That tail is not part of
the page and is not on the screen.

---

## 1. Chapter 6 — 6_PREPS.TBK

### 1.1 Front matter

| Content | Offset | Notes |
| --- | --- | --- |
| Objectives (6 lines) | `0x0be274` | Matches the rail walk exactly. |
| Bibliography (4 entries) | `0x011c38` | Machen 39-43, Mounce 28-54, Summers 21-23, Wenham 39-42 — **byte-identical to chapter 5's**. That is what the original ships; not a copy-paste error on this side. |
| Review Vocabulary chart | `0x0b55a0` | Two-column, with NT frequencies. Source of `ntFreq`. |

### 1.2 Learn English Concepts

| Topic | Offset |
| --- | --- |
| Definition | `0x020210` |
| Prepositional Phrase | `0x02076c` |
| Preposition and Case | `0x020a80` |

**Underlines are DATA and are now extracted, not eyeballed.**
`scripts/underline.py` walks forward from the end of each
length-prefixed field to the first run table whose offsets all land
inside it, and marks format id `0x62e` (underline against a `0x502`
body). Applied to all three chapters. It also marks the GREEK runs,
which solves two problems a token heuristic could not:

- accentless Greek — chapter 8's Enclitics page lists μου, μοι, με,
  σου, σοι, σε, none of which carries a diacritic code and one of
  which ("me") is also an English word on the same line as its own
  gloss;
- English that looks Greek — "Elijah?" is a letter followed by `?`,
  which is exactly the legacy circumflex sequence, and the token
  heuristic turned it into a Greek word.

The Greek vote is a MAJORITY of runs per format id across every
teaching field in the chapter; a single accidental sighting cannot
flip a format. Conversion runs on the WHOLE field before it is split
into lines, because a Greek run can span a line break.

### 1.3 Learn Greek Prepositions

| Topic | Offset |
| --- | --- |
| Introduction | `0x0044e0` |
| One Case Prepositions | `0x004bda` |
| Two Case Prepositions | `0x005988` |
| Three Case Preposition | `0x006606` |
| Prepositions Chart | `0x03a186` |
| Elision | `0x0072ca` |
| Proclitics | `0x007b52` |
| Compounds | `0x00f434` |

The three Case panels carry run tables that split each line into
`[Greek][gloss][case tag]` — three separate runs. The **gloss** run is
the blue, popup-opening one; the case tag is black. Colour itself lives
in the 7 aux bytes the rich-text parser declares as not understood, but
the SPLIT is enough to place the link, so no eyeballing is needed.

Older, superseded copies of the Prepositions Chart sit at `0x00dd1e`,
`0x039a02` and `0x08499e`; all three spell ἐπί without its breathing
(`epi<`) and `0x00dd1e` also loses ἐν from the centre. `0x03a186` is
the live one and has `e]pi<`. Use it.

The eleven green preposition pages (headword + three worked examples):

| Page | Offset | Head audio | Example audio |
| --- | --- | --- | --- |
| ἀπό | `0x0082a4` | `f_voc1` | `f_apo1..3` |
| εἰς | `0x008ac2` | `f_voc3` | `f_eis1..3` |
| ἐκ | `0x0092e0` | `f_voc4` | `f_ek1..3` |
| ἐν | `0x009af6` | `f_voc5` | `f_en1..3` |
| πρός | `0x00a304` | `f_voc10` | `f_pros1..3` |
| σύν | `0x00ab3a` | `f_sun` | `f_sun1..3` |
| διά | `0x00b362` | `f_voc2` | `f_dia1..3` |
| κατά | `0x00bb82` | `f_voc7` | `f_kata1..3` |
| μετά | `0x00c3aa` | `f_voc8` | `f_meta1..3` |
| περί | `0x00cbe8` | `f_voc9` | `f_peri1..3` |
| ἐπί | `0x00d424` | `f_voc6` | `f_epi1..3` |

σύν is taught here but is NOT a chapter-6 vocabulary word, which is why
it alone has a bare `f_sun` clip rather than an `f_vocN`.

### 1.4 Preposition Case Drill (16 items)

| Column | Offset | Depth |
| --- | --- | --- |
| prompts (`preposition (gloss)`) | `0x0d4802` | 16 |
| Hint chart | `0x0d5372` | — |

Options are three fixed buttons (Genitive / Dative / Accusative) at
`0x0d4cc2` / `0x0d4ed2` / `0x0d50da`. **The answer is not stored.** It
is DERIVED: each prompt's gloss matches exactly one line of the Hint
chart, which names the case. `assemble_ch6.py` asserts all sixteen
`gloss (with case` pairs appear verbatim in that chart before using any
of them, and STOPS otherwise.

Item audio is the preposition's own vocabulary clip. The mapping is
SCRIPT-VERIFIED, not assumed: the drill pages' `SayWord1` dispatch at
`0x90930` reads `apo1 → f_voc1`, `dia1 → f_voc2`, `eis1 → f_voc3`,
`ek1 → f_voc4`, `en1 → f_voc5`, `epi1 → f_voc6`, `kata1 → f_voc7`,
`meta1 → f_voc8`, `peri1 → f_voc9`, `pros1 → f_voc10`.

### 1.5 Preposition Translation Drill (40 items)

| Column | Offset | Depth |
| --- | --- | --- |
| Greek prompt phrases | `0x06a490` | 40 |
| option column 1 | `0x06c112` | 40 |
| option column 2 | `0x06c83c` | 40 |
| option column 3 | `0x06cd0c` | 40 |
| Scripture references | `0x06d0ac` | 40 |
| Hint chart | `0x06da06` | — |

Item audio is positional and SCRIPT-VERIFIED: the page's `SayWord`
dispatch at `0x900aa` is a plain `WordCounter = N → F_TPDN.wav` table,
1 to 40.

**No answer key exists in the file** — not as text, not as a byte
array; both were searched for. Thirty-six of forty were derived from
the chapter's own gloss sets. The remaining four shipped `_verify` and
were then answered by Nathanael's DOSBox pass (VERIFY-5F, 2026-08-08):

| # | Phrase | Ref | Derived | Confirmed |
| --- | --- | --- | --- | --- |
| 26 | ἐπὶ τοῖς λόγοις | Mk 10:24 | at the words | at the words |
| 32 | καθ' ἡμέραν | Mat 26:55 | during a day | **daily** |
| 36 | δι' ἡμερῶν | Mk 2:1 | after days | after days |
| 37 | ἐπὶ τὸν υἱὸν τοῦ ἀνθρώπου | Mk 9:12 | about the son of man | about the son of man |

Item 32 was wrong and is corrected; the flags are cleared. The lesson
worth keeping: the κατά popup renders this very phrase as "during the
day", and reasoning from that chapter-internal evidence beat the
idiom — and lost.

### 1.6 Preposition Spelling Exercise (12 items)

| Column | Offset | Depth |
| --- | --- | --- |
| English phrase prompts | `0x0dba72` | 12 |
| Scripture references | `0x0dd21a` | 12 |

Answers are derived by a DOUBLE key: each prompt matches exactly one
Translation Drill item on BOTH its reference and its correct English
option. The assembler asserts a unique hit per item and STOPS on any
other count. Two prompts carry a disambiguating tail — `from God
(not ἐκ)` and `from the sins (not ἐκ)` — which is preserved as a
`note`, with only the Greek inside it font-converted.

Item 12's answer is **ἐπ' ἀληθείας**. The elision mark is U+0027, is
REQUIRED, and is not interchangeable with a smooth breathing (RULES C9
/ D-29). The original has no apostrophe key and draws elision as a
free-standing smooth-breathing glyph after the clipped word
(`e]p ]  a]lhqei<aj`); `assemble_ch6.py` recognises a `]` that stands
alone between spaces and binds it to the preceding word as U+0027,
protected from the diacritic pass by a sentinel.

### 1.7 Vocabulary

**Chapter 6 teaches TEN prepositions but presents SIXTEEN case-split
entries** — διά, κατά, μετά, περί twice and ἐπί three times — on the
flashcard and in both vocabulary drills. `f_voc1..10` are therefore
shared across sixteen surfaces. Chapters 1-5 produced no such split;
the lexicon carries it as `senses[]`.

| Column | Offset | Depth |
| --- | --- | --- |
| flashcard Greek (16) | `0x0151ac` | 16 |
| flashcard glosses (16) | `0x01555e` | 16 |
| Gk→En drill prompts (16) | `0x07e7d8` | 16 |
| En→Gk drill prompts / glossShort (16) | `0x0479c4` | 16 |
| En→Gk drill Greek options | `0x048f32` … `0x04ad30` | 16 fields |
| Vocabulary Speller prompts (10) | `0x0e2046` | 10 |

**The Gk→En option captions are sixteen individual button fields, not a
pooled list, and two of them differ from the En→Gk prompt pool**:
`after, behind` vs `after`, and `around, near` vs `around`. They are
read from their own offsets — `0x07f714, 0x07ee56, 0x07f13e, 0x07f886,
0x07efca, 0x07f5a6, 0x07f430, 0x07ecde, 0x07f2b8, 0x07f9fc, 0x0813c2,
0x08124c, 0x080de4, 0x0810d6, 0x080c66, 0x080f62` for Word1..Word16 —
and the resulting sixteen match the rail-walk grid cell for cell.

Both vocabulary drills score positionally: prompt *i* against Word *i*.
That is script-verified, not inferred, and the rail walk's two answered
screens (ἐπί (with dat.) → "on, at, in"; "around" → περί (acc)) confirm
it.

### 1.8 Scripture Memory (Jn 1:1, first two clauses)

| Content | Offset | Notes |
| --- | --- | --- |
| Learn page (interlinear) | `0x0afdc2` | glosses "in / **the beginning** / was / the / word" |
| Review page (interlinear) | `0x030336` | glosses "in / **beginning** / was / the / word" — a real difference between the two pages, shipped verbatim (the D-27 precedent) |
| Drill prompts (9) | `0x04d846` | 9 distinct words |
| Drill option captions (9) | `0x04d9aa` … `0x04e6ae` | Word1..Word9: in, beginning, was, the (nom), word, and, with, the (acc), God |
| Speller instructions | `0x072904` | |
| Speller English translation | `0x073620` | |
| Speller comparison string | `0x0cd066` | a lenient accent-stripped copy; the shipped answer is the Learn page's twelve words |

Chapter 6 teaches only the first two clauses (12 words, `f_sm1..12`);
chapter 7 completes the verse. `6_PREPS.TBK` also *references*
`f_sm13..15`, whose WAVs are not in `CHAPT_6` — chapter-7 plumbing in a
shared template, not a chapter-6 gap.

**Gloss gaps.** A gloss line can carry fewer glosses than its Greek
line has words. Byte columns cannot resolve which word is unglossed,
because legacy Greek codes are wider than the glyphs they draw, so the
gap position comes from the rail-walk screenshot and is declared in the
assembler's `GAPS` table: τόν on both Jn 1:1 pages, ὁ on Jn 14:6a, and
μή on Jn 14:6b. The last two match what chapter 5 shipped and
device-verified.

### 1.9 Quick Review

| Page | Offset |
| --- | --- |
| Review Vocabulary Chart | `0x0b55a0` |
| Review Prepositions Chart | `0x03a186` |
| Review Scripture Memory: Jn 14:6a | `0x03ddb6` |
| Review Scripture Memory: Jn 14:6b | `0x022040` |
| Review Scripture Memory: Rom 3:23 | `0x01d1cc` |
| Review Scripture Memory: Jn 1:1 | `0x030336` |

### 1.10 Audio inventory

`CHAPT_6` ships **145 WAVs**. Cumulative-review duplication is exactly
as Stage 6 documents: chapter 3's `c_sm*`, chapter 4's `d_sm*` and
chapter 5's `e_sm*` all ship forward for the three review verses, and
the data references those LOCAL copies.

140 clips are wired. **Five are not**, and all five were checked
against the TBK's dispatch tables rather than guessed:

| Clip | Why it is unwired |
| --- | --- |
| `a_alpha` | the chapter-1 alphabet clip; no surface here |
| `c_sm10` | the second ἡ in Jn 14:6a; the review page reuses `c_sm7` for every occurrence of the same word, exactly as chapter 5 wired it |
| `d_sm6b` | a second take inside Jn 14:6b |
| `f_comp3` | the Compounds page offers three taps and the script dispatches only `comp1` and `comp2` |
| `f_dia` | a bare διά clip with no dispatch entry; the teaching pages tap διά through `f_voc2` |

This answers the standing per-chapter unused-audio ask (VERIFY-5E #16).

**One listen-check is owed.** The six Elision clips `f_elis1..6` are
wired in page reading order — δι' ἐμοῦ, διά, ἐμοῦ, μεθ' ἡμέρας, μετά,
ἡμέρας. The script confirms six tokens on that page but not which
phrase each one names.

---

## 2. Chapter 7 — 7_ADJS.TBK

Produced 2026-08-07 from `GKTUTOR/CHAPT_7/7_ADJS.TBK` (1,057,998 B).

**Reading-rule amendment, new at chapter 7.** Chapter 6's pools could be
read from their printable REGION; chapter 7's cannot. Every drill and
exercise buffer here carries a long chapter-6 tail with no separating
run of spaces, so a region read merges the last item with the tail
(`Μωϋσέως` ran into `τῶν ἁμαρτιῶν`; `Jn 8:33` into `Jn 8:33333k 8:8`).
**`assemble_ch7.py` reads every pool by u16 length prefix**, which cuts
all of them exactly. Some buffers open with one blank line before item
1 and some do not; the reader accepts both and STOPS on a short pool
rather than padding.

### 2.1 Front matter

| Content | Offset | Notes |
| --- | --- | --- |
| Objectives (7 lines) | `0x0f34ae` | Objective 5 contains Greek (`ei]mi<`) inside English; only the legacy-Greek tokens are converted. |
| Bibliography (4 entries) | `0x0233ba` | Machen 33-38, Mounce 63-70, Summers 25-28, Wenham 47-52. Two older partial copies follow in the same buffer. |
| Review Vocabulary chart | `0x0ea40e` | Source of `ntFreq`; footnote at `0x0ec880`. |

### 2.2 Learn English Concepts

| Topic | Offset |
| --- | --- |
| Definition | `0x02f9d8` |
| 3 Uses of Adjectives | `0x02ff48` |
| Examples | `0x0302be` |

### 2.3 Learn Greek Adjectives

| Topic / chart | Offset |
| --- | --- |
| Introduction | `0x0155ee` |
| Adjective Paradigm — Singular | `0x015ce6` |
| Adjective Paradigm — Plural | `0x01a4aa` |
| 2nd Adjective Paradigm — Singular | `0x0171b2` |
| 2nd Adjective Paradigm — Plural | `0x01ba78` |
| Attributive Position | `0x01852e` |
| Predicate Position | `0x01d1d6` |
| Substantive Use | `0x019348` |
| Predicate or Attributive | `0x01cd68` |
| Hint popup: ἀγαθός full chart | `0x057410` |
| Hint popup: δίκαιος full chart | `0x059bae` |
| Hint popup: Attributive & Predicate Positions | `0x0a6cdc` |

Each paradigm topic prints the Singular chart with a `More` button to
the Plural chart — the ch5 `More`/`Back` pattern.

Every paradigm cell has its own clip: `g_aga` / `g_dik` + case letter
(`n g d a v`) + gender letter (`m f n`) + number letter (`s p`). The
token in the TBK's own dispatch table IS the filename stem, so the
assembler derives the clip and then asserts the TBK dispatches it.

### 2.4 Learn Verb: εἰμί

| Topic / popup | Offset | Audio |
| --- | --- | --- |
| Introduction | `0x0d0890` | |
| Present Indicative of εἰμί | `0x0d1082` | `g_eimi1s..3p`, whole list `g_ispar` |
| Examples | `0x0d1a90` | `g_ex1`, `g_ex2` |
| οὐ, οὐκ and οὐχ | `0x0d60c0` | |
| popup: οὐ | `0x0d6d1e` | head `g_ou`, examples `g_ou1..2` |
| popup: οὐκ | `0x0d7468` | head `g_ouk`, examples `g_ouk1..2` |
| popup: οὐχ | `0x0d7b84` | head `g_oux`, examples `g_oux1..2` |
| Hint popup: εἰμί paradigm | `0x0ad2cc` | |

Two copies of the εἰμί paradigm popup exist: `0x09763c` glosses the
third singular "he is", `0x0ad2cc` glosses it "he/she/it is". The
latter is the live one and matches the rail walk.

### 2.5 The twenty-item adjective pool — ONE pool, TWO activities

| Column | Offset | Depth |
| --- | --- | --- |
| Greek forms (Case Drill prompts) | `0x055960` | 20 |
| Case Drill references | `0x056d54` | 20 |
| Parse labels (Spelling Exercise prompts) | `0x066742` | 20 |
| Spelling Exercise references | `0x067e26` | 20 |

**This is the cleanest answer key the pipeline has yet had.** The
Adjective Case Drill shows the Greek form and asks for the parse; the
Adjective Spelling Exercise shows the parse and asks for the Greek
form — and they are the SAME twenty items in the SAME order. Each is
the other's key. `assemble_ch7.py` asserts the two reference columns
cite the same twenty passages (normalising `Luk`/`Lk` and `Rom.`/`Rom`)
before using either, and STOPS otherwise. No inference anywhere.

The Case Drill's ten options are individual button fields at
`0x055eba`, `0x0560c2`, `0x0562c8`, `0x0564cc`, `0x0566d4`, `0x0568dc`,
`0x056ae0`, `0x056ce2`, `0x057148`, `0x05734e`; the grid is
`paradigm2col` (D-26), case down and number across.

### 2.6 Adjective Translation Drill (15 items)

| Column | Offset |
| --- | --- |
| prompt line 1 | `0x0a15dc` |
| prompt line 2 | `0x0a4592` |
| option column 1 / 2 / 3 | `0x0a323e` / `0x0a3968` / `0x0a3e38` |
| references | `0x0a41d8` |

Two prompt lines, several deliberately blank — the ch4 Greek Noun Drill
shape. Audio is positional, `g_atd1..15`. Answers were derived from the
adjective's POSITION and agreement, then CONFIRMED against Nathanael's
DOSBox pass (`Ch7AdjectiveTranslationDrill.pdf`), which answered all
fifteen. **Fourteen of fifteen derivations were right**; item 4
(Rom 13:3) was wrong — "they are not fearful to good work", not
"...to good deeds" — and is corrected. This is now a verified key.

That pass also surfaced feedback strings chapters 1-5 never showed:
"Awesome!", "Good student!", "Well done!" on the correct side and
"Persistence", "Practice makes perfect", "Not quite" on the incorrect
side. All are now in the chapter-7 feedback pools.

### 2.7 Parsing εἰμί Drill (6 items) and εἰμί Spelling Exercise (6 items)

| Column | Offset |
| --- | --- |
| Parsing prompts | `0x0ac0b8` |
| Parsing references | `0x0ad01a` |
| Speller prompts | `0x0990fe` |
| Speller references | `0x09a7e4` |

Both derive from the chapter's own Present Indicative chart. The drill's
prompt column accents its forms differently from the chart (`ἐστὶν` vs
`ἐστί(ν)`, `εἰμὶ` vs `εἰμί`) and prints or drops the moveable nu, so the
match is made on bare letters — which is exactly what the chapter's own
note 2 says is the same form. The speller's two "you are" glosses are
disambiguated by their own `(sg)` / `(pl)` tag.

### 2.8 εἰμί Translation Drill (14 items)

| Column | Offset |
| --- | --- |
| prompt line 1 / 2 | `0x094214` / `0x0971ca` |
| option column 1 / 2 / 3 | `0x095e76` / `0x0965a0` / `0x096a70` |
| references | `0x096e10` |

Audio positional, `g_etd1..14`. **All fourteen separate on person and
number alone** — the three options differ only in the person of the
verb, which the chapter's own chart settles. No `_verify` items in
chapter 7.

### 2.9 Vocabulary and Scripture Memory

| Content | Offset |
| --- | --- |
| lexical forms (10) | `0x026930` |
| glosses (10) | `0x026cec` |
| bare forms (10) | `0x0be544` |
| short glosses (10) | `0x091ff0` |
| Vocabulary Speller prompts (10) | `0x07cacc` |
| Scripture Memory Drill prompts (9) | `0x05e03e` |
| Learn Scripture Memory (Jn 1:1, complete) | `0x0e28ba` |
| Review Scripture Memory: Jn 1:1 | `0x03f2e6` |
| Speller verse | `0x08a15c` |

Chapter 7 returns to the plain ten-lemma vocabulary shape of chapters
1-5, so both vocabulary drills use the existing `glossShortPool` /
`greekPool` paths — no chapter-6-style case split.

**Jn 1:1 is now complete: seventeen words over thirteen clips.** The
repeats reuse the clip of their first occurrence
(`f_sm13..17 → f_sm6, f_sm13, f_sm3, f_sm4, f_sm5`), and `f_sm13` is
the new θεός.

**Gloss gaps: chapter 7 has almost none.** Chapter 7's verse pages gloss
τόν "the" on both Jn 1:1 pages and ὁ "the" on Jn 14:6a, where chapters
5 and 6 left them blank. Only Jn 14:6b still drops μή. Per-chapter
extraction is why this is caught rather than inherited.

### 2.10 Audio inventory

`CHAPT_7` ships **190 WAVs**; 182 are wired. Eight are not, each checked
against the dispatch tables:

| Clip | Why it is unwired |
| --- | --- |
| `c_sm10`, `d_sm6b` | second takes inside the cumulative Jn 14:6 verses, as chapters 5 and 6 also left them |
| `g_dikvfp` | vocative feminine plural of δίκαιος; the chart merges N.V. in the plural, so no cell claims it |
| `g_ei`, `g_estin`, `g_este`, `g_eisin`, `g_esmen` | bare εἰμί-form clips superseded by the `g_eimi1s..3p` paradigm-cell family, which is what the TBK actually dispatches |

---

## 3. Chapter 8 — 8_PRONS.TBK

Produced 2026-08-07 from `GKTUTOR/CHAPT_8/8_PRONS.TBK` (1,406,600 B).
Every pool is read by u16 length prefix, per the chapter-7 amendment.

### 3.1 Front matter, Learn English Concepts

| Content | Offset |
| --- | --- |
| Objectives (7) | `0x0f8f4e` |
| Bibliography | `0x01c7ae` (Machen 44-51, Mounce 86-100, Summers 39-44, Wenham 79-82) |
| Review Vocabulary chart | `0x0f01bc` |
| Definition | `0x02ab1e` |
| Types of Pronouns / (cont.) | `0x02b08e` / `0x02bde6` |
| Case | `0x02b3d8` |
| Number | `0x02c5e2` |

### 3.2 Learn Greek Personal Pronouns / Third Person Pronoun

| Topic | Offset |
| --- | --- |
| Introduction | `0x0130c0` |
| First Person Paradigm | `0x01375a` |
| Second Person Paradigm | `0x014624` |
| Examples | `0x0171de` |
| Enclitics / (More) | `0x015a56` / `0x017f5e` |
| Declension Format | `0x0163a8` |
| Third Person: Introduction | `0x122db8` |
| Third Person Paradigm: Masc / Fem / Neut | `0x124088` / `0x125026` / `0x12637e` |
| Three Uses / (More) | `0x1234cc` / `0x127510` |
| popup: αὐτός as a pronoun | `0x127b8c` (`h_ex31..33`) |
| popup: as a Reflexive Intensifier | `0x1283c4` (`h_ex3r1..2`) |
| popup: as an Adjective meaning "same" | `0x128b16` (`h_ex3a1..2`) |
| Hint: 1st / 2nd / 3rd person charts | `0x07fad8` / `0x080a62` / `0x0a79c8` |

### 3.3 The three paradigms are the single answer key

`assemble_ch8.py` carries the forty paradigm cells (person, gender,
case, number, form, clip) as an explicit table and, before using any of
them, asserts every form appears verbatim in the chapter's own chart
field for its person and gender AND that its clip is dispatched by the
TBK. Both the Case Drill and the Spelling Exercise resolve against that
one table.

### 3.4 Personal Pronoun Case Drill (31 items) — NEW INTERACTION

Prompts at `0x0c3e16`. **This drill wants TWO clicks per item**: the
person column first, then the case-and-number grid, and the item is
wrong if either is. No earlier chapter has a two-stage select; the data
carries `mode: "twoStageGrid"` with an `optionStages` array and each
item's `answer` as a two-element list.

Because the drill asks for person, case and number but NEVER gender,
the third person's gender syncretism (αὐτῶν, αὐτοῖς across genders)
does not make an item ambiguous. **One item is: αὐτά**, which the
chart prints in both the neuter nominative plural and the neuter
accusative plural. Nathanael's DOSBox pass confirms the original
**grades BOTH as correct**, so the item carries `answerAlt` with the
second reading rather than a `_verify` flag.

### 3.5 Personal Pronoun Spelling Exercise (40 items)

Prompts `0x090f0a`, references `0x092a52`. The forty prompts run the
three paradigms in chart order — 1st sg/pl, 2nd sg/pl, then 3rd
masculine/feminine/neuter sg/pl, four cases each. Each prompt's own
case and number tag is asserted against that order before the form is
taken from the chart.

**One of the forty references is blank in the original.** That is real
data, not a read failure; `cut_ref` returns null for a blank and still
STOPs on anything non-blank it cannot parse.

### 3.6 Translation drills

| Drill | prompt 1 / 2 | options 1 / 2 / 3 | refs | audio |
| --- | --- | --- | --- | --- |
| Personal Pronoun (20) | `0x07c6a8` / `0x07f666` | `0x07e30a` / `0x07ea34` / `0x07ef04` | `0x07f2a4` | `h_d2_1..20` |
| Αὐτός (21) | `0x0a458e` / `0x0a754c` | `0x0a61f0` / `0x0a691a` / `0x0a6dea` | `0x0a718a` | `h_d3_1..21` |

All 41 separate: drill 2's option triples differ only in the person and
number of the pronoun, drill 3's only in which of the three uses of
αὐτός is taken. No `_verify` items.

### 3.7 Vocabulary — ten lemmas, thirteen cards, fifteen drill entries

| Column | Offset | Depth |
| --- | --- | --- |
| lexical forms | `0x01fd1a` | 13 |
| glosses | `0x0200d6` | 13 |
| bare forms (drill options) | `0x09de82` | 15 |
| short glosses (drill options) | `0x056b44` | 15 |
| Vocabulary Speller prompts | `0x09787a` | 12 |

Chapter 8 combines **both** earlier splitting patterns and adds a third
count. παρά splits three ways and ὑπό two by case (the chapter-6
pattern), and ἐγώ/ἡμεῖς and σύ/ὑμεῖς are **paired lemmas** that print
as one card but two drill options each — a shape no earlier chapter
produced. So: 10 lemmas, 13 flashcard entries, 15 drill entries, 12
speller items. `senses[]` carries the split.

### 3.8 Scripture Memory (Rom 6:23a) and gloss splitting

| Content | Offset |
| --- | --- |
| Learn page | `0x0e1838` |
| Drill prompts (6) | `0x05c760` |
| Speller verse | `0x069eaa` |
| Review: Jn 14:6a / 14:6b / Rom 3:23 / Jn 1:1 / Rom 6:23a | `0x00ae26` / `0x00d7e6` / `0x008922` / `0x041d56` / `0x044ae6` |

**Gloss-splitting rule amended.** A fixed two-space threshold breaks
here: the Learn page sets `of   sin` with three spaces INSIDE one gloss
and eight between the next two. `split_glosses()` now takes every run
of 2+ spaces as a candidate boundary and keeps the widest *k*−1 — the
original is column-set, so the real boundaries are always the widest
gaps on the line — and STOPs if there are too few candidates. This is
worth back-porting to chapters 6 and 7, whose narrower columns happened
not to trip it.

Gaps: τῆς is unglossed on the Learn Rom 6:23a page but glossed "the" on
the Review page; ὁ on Jn 14:6a and μή on Jn 14:6b, as in earlier
chapters.

### 3.9 Audio inventory

`CHAPT_8` ships **181 WAVs**, including chapter 9's `i_rm623b` shipped
forward and unused here. Four single-word clips — `h_kai`, `h_kagw`,
`h_gs1`, `h_exx2` — have surfaces the extraction did NOT settle; they
are left unwired and are a VERIFY-5F ask rather than a guess.
