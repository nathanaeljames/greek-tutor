# 5E-EXTRACTION-MAP.md — where chapters 4 and 5 live in their TBKs

Pipeline-side working document, cohort 5E. Produced 2026-08-03 from
`GKTUTOR/CHAPT_4/4_NOUNS2.TBK` (1,079,230 B) and
`GKTUTOR/CHAPT_5/5_NOUNS1.TBK`, using `scripts/tbk_fields.py` +
`scripts/tbk_richtext.py`.

Every offset below was READ and eyeballed against the corresponding
page of ch4railwalk.pdf / ch5railwalk.pdf. This file exists so the
assembly step is mechanical and so a future chapter's extraction does
not repeat the search. It is provenance, not a build input.

**Reading rule** (see the header of `tbk_fields.py`): the u16 length
prefix gives the read, the DOSBox screenshot gives the cut. ToolBook
does not zero a field buffer on rewrite, so many of these regions
carry a stale tail after their real text — most conspicuously
chapter-7 adjective prose ("...a group interacting within itself
(reciprocal). e.g. Terry kicked himself.") sitting behind half of
chapter 4's teaching pages, and chapter-2 accent-rule prose behind
others. That tail is not part of the page and is not on the screen.

---

## 1. Chapter 4 — 4_NOUNS2.TBK

### 1.1 Front matter

| Content | Offset | Notes |
| --- | --- | --- |
| Objectives (5 lines) | `0x09415c` | Matches the rail walk exactly. A near-duplicate at `0x0b7706` drops the "the" in line 1 — a stale buffer, NOT the page. Use `0x09415c`. |
| Bibliography (4 entries) | `0x0135d6` | Machen 23-28, Mounce 28-54, Summers 15-20, Wenham 30-39. Two shorter partial copies precede it at `0x0135c8` / `0x0135ce`. |
| Vocabulary lemmas (10) | `0x0169fa` | Tail after `w[j` is Hebrew-region junk; cut at 10. |
| Vocabulary glosses (10) | `0x016ba2` | Tail lines 11+ belong to a later chapter's pool. |
| Review Vocabulary chart | `0x0206c2` | Two-column with NT frequencies. Hebrew region follows immediately — exclude per the corrected Stage-4 tell-tales. |

### 1.2 Learn English Concepts

| Topic | Offset |
| --- | --- |
| Introduction | `0x084d90` |
| Gender | `0x0856ac` |
| Number | `0x085d30` |
| Case | `0x08609a` |
| popup: Subjective Case | `0x086d38` |
| popup: Objective Case | `0x08714e` |
| popup: Possessive Case | `0x087564` |

A second full copy of the three case popups sits at `0x0238c6` /
`0x023cdc` / `0x0240f2`. Identical text; either is fine.

### 1.3 Learn Greek Nouns: Second Declension

| Topic / popup | Offset |
| --- | --- |
| Introduction | `0x0d9c3c` |
| Gender | `0x0da5fc` |
| Number and Agreement | `0x0dacf6` |
| Inflectional Forms | `0x0db054` |
| Masculine Declension — λόγος chart | `0x0db74a` |
| Masculine Declension — ἄνθρωπος chart | `0x0dfefc` |
| Neuter Declension — ἱερόν chart | `0x0dcc50` |
| Word Order | `0x0e11a4` |
| popup: Declensions: First, Second, Third | `0x0ddee0` |
| popup: Definite Article | `0x0de334` |
| popup: Nominative Case | `0x0ddab6` |
| popup: Genitive Case | `0x0deb8a` |
| popup: Dative Case | `0x0defdc` |
| popup: Accusative Case | `0x0df40c` |
| popup: Vocative Case | `0x0df838` |

Meanings tables ("Translation of Inflectional Forms"):

| Chart | Offset |
| --- | --- |
| λόγος | `0x00edc6` |
| ἄνθρωπος | `0x00fdf2` |
| ἱερόν | `0x0e3a34` |

The ἱερόν table carries the closing note "Note that in the neuter the
Nominative, Accusative and Vocative form are always the same." The
λόγος table is duplicated at `0x0e4b22`, ἄνθρωπος at `0x0e5b4e`.

### 1.4 Greek Noun Drill (22 items)

| Column | Offset | Depth |
| --- | --- | --- |
| prompt line 1 | `0x09dfbe` | 22 |
| prompt line 2 | `0x0a1dcc` | 22 (several deliberately blank) |
| Scripture references | `0x0a2092` | 22 |
| option slot 1 (Nom. sg) | `0x09fc7c` | 2 |
| option slot 2 (Nom. pl) | `0x0a01f2` | 2 |
| option slot 3 (Gen. sg) | `0x0a0534` | 2 |
| option slot 4 (Gen. pl) | `0x0a0870` | 2 |
| option slot 5 (Dat. sg) | `0x0a0bb2` | 2 |
| option slot 6 (Dat. pl) | `0x0a0eee` | 2 |
| option slot 7 (Acc. sg) | `0x0a1232` | 2 |
| option slot 8 (Acc. pl) | `0x0a156e` | 2 |
| option slot 9 (Voc. sg) | `0x0a18b0` | 2 |
| option slot 10 (Voc. pl) | `0x0a1bec` | 2 |

**The option columns are two lines deep, not twenty-two, and that is
correct.** The drill runs two word FAMILIES: items 1-11 are ἀδελφός
and items 12-22 are λόγος, and every item in a family offers the same
ten forms. Line 1 of each slot is the ἀδελφός form, line 2 the λόγος
form. Read down the slot list and the 5×2 grid of the rail-walk
screenshot falls out in order.

**Underlines are recoverable.** `tbk_richtext.associate()` pairs both
prompt fields with run tables; format id `0x7aa` is the underline
against a `0x1`/`0xade` body. Item 1 gives `brothers`, item 4
`brothers`, item 7 `brother`, item 12 `word`, and so on. Two cautions:
the underline for an item may sit in EITHER prompt field, and at least
one line-1 span looks implausible (`to` in "first be reconciled to
your", whose real target is `brother` on line 2). Cross-check every
underline against the rail walk before shipping; where the run table
and the screenshot disagree, the screenshot wins and the disagreement
goes in the assembly log.

### 1.5 Declining Noun Drill (28 items)

| Column | Offset |
| --- | --- |
| Greek forms | `0x079a94` |
| Scripture references | `0x079c74` |
| translations (the Translate reveal) | `0x079e54` |

Item 18 reads `a@nqropoi` in the TBK — omicron for omega, against
`a@nqrwpoi` everywhere else in the same column. Original defect;
correct data-side with `_legacy` provenance, same treatment as ch3's
`pistu<ei` (D-8/D-9 precedent).

Answers are RULE-DERIVED from the form itself (case + number off the
paradigm) and must be cross-checked against the recovered OpenScript
answer literals — see §1.7.

### 1.6 Second Declension Noun Spelling Exercise (20 items)

Prompt column (English glosses): `0x061532`. Order is λόγος ×8,
ἄνθρωπος ×9, ἱερόν ×3. Answers are rule-derived and validated against
§1.7.

### 1.7 OpenScript answer literals

`= "…"` comparison literals recovered across the file, in both
accented and unaccented sets, exactly as chapter 3 had them:
`logoj logoi logou logwn logoij logon logouj lo<g& lo<gon lo<gou
a]nqrwpe a]nqrwpon a]nqrwpwn a]nqrwpoij a]nqrwpouj i[eron i[erou
i[er& i[ero<n i[er&?` and the ten vocabulary lemmas.

Some literals are interleaved with binary and read as fragments
(`lo<ÀR`, `a]Áª<p&`). Use them as a CHECK on rule-derivation, never as
the primary source: the assembler fails if a derived form disagrees
with a cleanly-recovered literal, and ignores fragments.

### 1.8 Scripture Memory

| Content | Offset |
| --- | --- |
| John 14:6b interlinear (14 words + glosses) | `0x0251d2` |
| John 14:6a interlinear (cumulative review) | `0x0332a2` |
| Review Nouns: Second Declension chart | `0x037cb6` |

Audio: `d_sm1..9`, `d_sm6b`, `d_jn146b` for 14:6b; chapter 3's
`c_sm1..14`, `c_sm14_6` ship forward inside CHAPT_4 for the cumulative
14:6a chart. Reference the LOCAL copies (`chapt_4_c_sm1`).

### 1.9 Audio inventory (91 files)

- `d_voc1..10` + `d_vocl4` (Say Whole List) — vocabulary, alphabetical.
- Named lemma clips: `d_agapaw d_gaphw d_de d_doulos d_euriskw d_iera
  d_laos d_nomos d_oikos d_ws`.
- Paradigm cells: `d_log*` (8), `d_anth*`/`d_ant*` (10), `d_ier*` (6),
  `d_adel*`/`d_ade*` (10).
- Whole-paradigm: `d_logpar d_antpar d_ierpar d_adepar`.
- `d_ho d_hn d_to` — the three definite articles used by the Gender
  topic.
- `d_chrono d_chrons d_etos d_hnmera d_ekkles` — the Gender topic's
  example words.
- **`d_adepar` has no chart on any chapter-4 Learn page.** ἀδελφός
  appears only as the Declining Noun Drill's third family. Leave
  unwired; logged as an open question in CHAT-HANDOFF.

---

## 2. Chapter 5 — 5_NOUNS1.TBK

### 2.1 Front matter

| Content | Offset |
| --- | --- |
| Objectives (5 lines) | `0x0e8ab8` |
| Bibliography | `0x014084` |
| Vocabulary lemmas (10) | `0x01749c` |
| Vocabulary glosses (10) | `0x01766e` |
| Review Vocabulary chart | `0x0dfe12` |

### 2.2 Learn English Concepts (5 topics)

| Topic | Offset |
| --- | --- |
| Introduction (carries "proceed with haste") | `0x0270e2` |
| Gender | `0x027a46` |
| Number | `0x02805e` |
| Case | `0x028370` |
| Definite Article | `0x029bfc` |
| popup: Subjective Case | `0x02900e` |
| popup: Objective Case | `0x029424` |
| popup: Possessive Case | `0x02983a` |

### 2.3 Learn Greek Nouns: 1st Declension

| Topic / popup | Offset |
| --- | --- |
| Introduction | `0x0040e6` |
| Gender | `0x004a12` |
| Number and Agreement | `0x0053a4` |
| Inflectional Forms | `0x005702` |
| First Declension--Eta (γραφή) | `0x005de2` |
| First Declension--Alpha (ὥρα) | `0x0070e6` |
| First Declension--Alpha (δόξα) | `0x00a29e` |
| First Declension--Masculine (προφήτης) | `0x00b14c` |
| popup: Declensions | `0x00831e` |
| popup: Definite Article | `0x008788` |
| popup: Nominative Case | `0x007ef4` |
| popup: Genitive Case | `0x008fa0` |
| popup: Dative Case | `0x0093f2` |
| popup: Accusative Case | `0x009822` |
| popup: Vocative Case | `0x009c4e` |

Meanings tables: `0x00d704`, `0x00e6d8`, `0x00f744`, `0x010ed8` (γραφή,
ὥρα, δόξα, προφήτης — confirm the pairing against the rail walk at
assembly; all four are titled "Meanings: Translation of Inflectional
Forms" in this chapter, not the bare ch4 title).

The γραφή chart prints its first row label `Nom.\Voc.` with a
BACKSLASH; ὥρα and δόξα use `Nom./Voc.`. Both verbatim — D-27.
The δόξα chart carries the extra line "This form occurs with nouns
ending in ζ, ξ, ψ, σ or λλ."

`w!ra` / `w$rai` / `w[rw?n` in these charts are the third-source
confirmation of font-map `!` = rough+acute and `$` = rough+circumflex,
now visible rendered in the rail walk.

### 2.4 Learn Definite Article

| Topic | Offset |
| --- | --- |
| Introduction | `0x040b6a` |
| Examples | `0x0410f0` |
| Paradigm — Singular | `0x0417d6` |
| Paradigm — Plural | `0x0432e6` |
| Quick Review combined chart | `0x08ecba` |

Each paradigm carries its own enclitics note ("Note ὁ and ἡ are
enclitics with no accents." / "Note οἱ and αἱ …").

### 2.5 Drills and exercises

| Pool | Offset |
| --- | --- |
| First Declension Noun Drill — prompts | `0x093710` |
| — option slot 1 | `0x095382` |
| — option slot 2 | `0x0958fe` |
| — option slot 3 | `0x095c40` |
| — option slot 4 | `0x095f84` |
| — translations | `0x096164` |
| — references | `0x0965a4` |
| Declining Noun Drill — forms | `0x09c336` |
| — references | `0x09c516` |
| — translations | `0x09c6f6` |
| Definite Article Drill — forms | `0x08d57e` |
| — references | `0x08d75e` |
| — genders (the Gender reveal) | `0x08d93e` |
| First Declension Noun Spelling — prompts | `0x0618c4` |
| Definite Article Spelling — prompts | `0x0c20d0` |
| — references | `0x0c2ff2` |

The First Declension Noun Drill's four option slots run the same
family-column layout as chapter 4's ten, so the same reader handles
both. The Definite Article Drill's gender column is a flat run of
`Masculine` ×8, `Feminine` ×8, `Neuter` ×9 — which also tells you the
item ordering.

### 2.6 Scripture Memory

| Content | Offset |
| --- | --- |
| Rom 3:23 interlinear | `0x023d34` (dup `0x0da830`) |
| Rom 3:23 whole-verse line | `0x084a48` |
| John 14:6a (cumulative) | `0x0d5f6e` |
| John 14:6b (cumulative) | `0x02b04c` |
| Review Nouns: First Declension chart | `0x048cc2` |
| Definite Article paradigm, review form | `0x08ecba` |

### 2.7 Audio inventory (135 files)

`e_voc1..10` + `e_vocl5`; the four noun paradigms (`e_grap*`,
`e_hwr*`, `e_dox*`, `e_prop*`) with `e_grapar e_hwrpar e_doxpar
e_propar`; the definite article set (`e_artms e_artmp e_artfs e_artfp
e_artns e_artnp e_artmas e_artfem e_artneu e_artsg e_artpl e_artpar`
plus the individual forms `e_ho e_hn e_to e_hoi e_hai e_ta e_ton
e_tnn e_tou e_tns e_tw e_tn e_twn e_tois e_tais e_tous e_tas`);
`e_sm1..9` + `e_rom323`; and the forward-shipped `c_sm*` and `d_sm*`
families for the two cumulative review verses.

---

## 3. Excluded regions (Hebrew, per the corrected Stage-4 model)

Both files carry the shared Attributive / Predicate / Substantive
"Hints" popups whose agreement list includes **Definiteness** — a
Hebrew agreement category, and the reliable tell-tale. Chapter 4:
`0x077ffe`, `0x078368`, `0x0787d0` and a second set at `0x09e584`,
`0x09e8ee`, `0x09ed56`. Chapter 5: `0x08baea`, `0x08be54`, `0x08c2bc`
and `0x093c8a`, `0x093ff4`, `0x09445c` and `0x09a8a0`, `0x09ac0a`,
`0x09b072`. Excluded from the port wholesale.

Genuine Hebrew content sits immediately after chapter 4's Review
Vocabulary chart (`(Hi)` / `(Ni)` stem labels, "to sacrifice", "to
depart"). Exclude the region, and note that this is a REGION
exclusion — the `Hebrew*` FIELD NAMES nearby are shared drill-engine
plumbing and must not be keyed on.
