# 5E-SPEC1.md — Cohort 5E round 1: chapters 4 and 5

Date: 2026-08-03. Base: the 5D round-2 tree (chapter 3 shipped and
visually passed by Nathanael; no VERIFY-5D2 document was raised —
see §7).

Companion documents, which ride WITH this spec and must be open while
you build:

- **ch4railwalk.pdf** — a complete DOSBox rail walk of chapter 4,
  every page, in order.
- **ch5railwalk.pdf** — the same for chapter 5.

Where this spec and a rail-walk screenshot disagree, **the spec wins**.
Where the spec is silent, **the screenshot governs**. Do not invent a
third answer.

**Reading the rail walks.** Where the mouse cursor appears as a HAND,
the element it is near is CLICKABLE in the original — Nathanael used
this deliberately to mark words that are tappable and play audio. The
marking is **not exhaustive**; he did not hover near every word. So a
hand is positive evidence, and its absence is not evidence of absence.
The delivered data is the authority on which items carry audio; when
the data and a hand disagree, report it rather than silently choosing.

Deliverables from this round:

1. **5E-SPEC1-RESULTS.md** — the handoff. What you built, what you
   found, every data edit made under §0 with before/after, and the
   open items for the device pass.
2. **5E-SPEC1-BUILD.md** — the audit record. **It MUST contain the
   exact `git diff` of the whole round**, plus the full thought/tool
   log and wall-clock time. The grading chat reads the diff, not the
   claims; a BUILD document without a complete diff cannot be graded
   and the round does not count.
3. **VERIFY-5E.md** — authored by you AFTER 1 and 2, listing the
   device tests that a script cannot settle. See §10 for what belongs
   in it and what does not.

Data files are DELIVERED WITH THIS SPEC. Commit them as delivered:
`src/data/chapt-04.json`, `src/data/lexicon-chapt04.json`,
`src/data/chapt-05.json`, `src/data/lexicon-chapt05.json`, plus
`scripts/assemble_ch45.py` (pipeline provenance, not a build input).
Do not re-derive their content; §4 describes the shapes so the
renderer work is legible.

---

## 0. VISUAL VERIFICATION — standing process, restated because it is the round's biggest risk

Chapters 4 and 5 are the first cohort where you build TWO chapters at
once, and they are 80% the same chapter twice. That is exactly the
condition under which a page gets built once and assumed twice.

**Load every page you build in a real browser, screenshot it, and
compare it side by side against the corresponding rail-walk
screenshot.** Asserting that a string is present in the JSON is not
verification. Compare specifically:

- line breaks and indentation inside example panels and green popups;
- underline and other emphasis;
- list markers and hanging indents;
- citation alignment;
- which words are tappable (see the hand-cursor note above);
- chart column alignment, and which chart rows are merged;
- the exact button set under each chart and each drill.

`playwright-core` is already a devDependency and `npm run ui:walk` /
`npm run ui:behavior` already exist. **Extend both to cover chapters 4
and 5** rather than writing new one-off harnesses, and keep the
chapter-1/2/3 coverage green. Everything a script can settle MUST be
settled by a script before it reaches Nathanael.

**You are authorized to edit `src/data/*.json`** when visual
verification finds obviously missing formatting or text. This is the
standing exception to the implementers-never-edit-data rule. Report
every such edit in RESULTS with before/after so the pipeline can
absorb it — a hand edit is lost at the next regeneration.

---

## 1. What these two chapters are

**Chapter 4 — Second Declension Nouns.** Teaches the English noun
concepts (gender, number, case), then the Greek noun system and the
second-declension masculine (λόγος, ἄνθρωπος) and neuter (ἱερόν)
paradigms. Ten new vocabulary words. Scripture memory: John 14:6b.

**Chapter 5 — First Declension Nouns.** Repeats the English concepts
page almost verbatim, adds a fifth topic on the definite article, then
teaches first-declension eta (γραφή), alpha (ὥρα, δόξα) and masculine
(προφήτης), then the definite article as its own Learn page with a
full three-gender paradigm. Ten new vocabulary words. Scripture
memory: Rom 3:23.

The original itself flags the overlap. Chapter 5's English Concepts
Introduction ends: "This page is largely a repetition of what was done
in chapter 4 except for the section on the definite article. If you
understood it there, then proceed with haste." That line is in the
delivered data verbatim — it is not a note to you, it is on the page.

**Near-pure reuse.** Every mode, block and activity type these
chapters need already exists except the items in §4. Do not invent new
modes. If you believe a page needs one, stop and say so in RESULTS
rather than registering one silently (PIPELINE-INSIGHTS §III: dispatch
is mode-keyed, never id-keyed, and a new visual arrangement gets a
registered mode, not a special case on an id).

---

## 2. Chapter 4 rail

The `sequence` array in `chapt-04.json` is authoritative and matches
the rail walk. For orientation:

| # | id | title | mode / type |
| --- | --- | --- | --- |
| 1 | `c4_learn_objectives` | Learn Chapter Objectives | objectivesPage |
| 2 | `c4_learn_english_concepts` | Learn English Concepts | topicPages |
| 3 | `c4_learn_nouns` | Learn Greek Nouns: Second Declension | topicPages |
| 4 | `c4_drill_greek_noun` | Greek Noun Drill | select / fullOptionGrid |
| 5 | `c4_drill_declining` | Declining Noun Drill | select / fullOptionGrid |
| 6 | `c4_ex_noun_speller` | Second Declension Noun Spelling Exercise | spell |
| 7 | `c4_learn_vocab` | Learn Vocabulary | flashcard |
| 8 | `c4_drill_vocab_gk_en` | Vocabulary: Greek to English Drill | select |
| 9 | `c4_drill_vocab_en_gk` | Vocabulary: English to Greek Drill | select |
| 10 | `c4_ex_vocab_speller` | Vocabulary Spelling Exercise | spell |
| 11 | `c4_learn_scripture` | Learn Scripture Memory | interlinearVerse |
| 12 | `c4_drill_scripture_memory` | Scripture Memory Drill | select |
| 13 | `c4_ex_scripture_speller` | Scripture Memory Spelling Exercise | spellVerse |
| 14 | `c4_qr_vocab` | Review Vocabulary Chart | reviewVocab |
| 15 | `c4_qr_nouns` | Review Nouns: Second Declension | paradigmChart |
| 16 | `c4_qr_scripture_a` | Review Scripture Memory: Jn 14:6a | interlinearVerse |
| 17 | `c4_qr_scripture_b` | Review Scripture Memory: Jn 14:6b | interlinearVerse |
| 18 | `c4_learn_bibliography` | Learn Bibliography | textPage |

### 2.1 Learn English Concepts (topicPages, 4 topics)

Topics: Introduction, Gender, Number, Case. The Case topic carries
three blue hotwords — Subjective case, Objective case, Possessive case
— each opening a green popup. Those are `expander` blocks, exactly as
chapter 3 renders its hotword popups: the label is underlined and
non-tappable in the list, and the card sits below.

The Gender topic ends with three Greek examples in a two-column
arrangement (οἶκος / "house" is masculine, and so on). The Greek is
tappable and plays; the English gloss is not (directive 9).

### 2.2 Learn Greek Nouns: Second Declension (topicPages, 7 topics)

Topics, in order: Introduction, Gender, Number and Agreement,
Inflectional Forms, Masculine Declension, Neuter Declension, Word
Order.

- **Introduction** has two blue hotwords, `declensions` and
  `definite article`, opening two green popups ("Declensions: First,
  Second, Third" and "Definite Article").
- **Inflectional Forms** has five blue hotwords — Nominative form,
  Genitive form, Dative form, Accusative form, Vocative form — each
  opening its own green case popup. Five expanders on one topic; check
  the stack reads well at 320px.
- **Masculine Declension** carries TWO paradigm charts: λόγος with a
  **More** button, and ἄνθρωπος with a **Back** button. See §4.2.
- **Neuter Declension** carries the ἱερόν chart, which has FOUR rows,
  not five: its first row label is `Nom./Voc.` because neuter
  nominative and vocative are identical. Do not pad it to five.
- Every chart carries a blue **Meanings** link opening the
  "Translation of Inflectional Forms" table. See §4.3.
- Seven topics is the longest topic list shipped so far. Verify the
  radio rail does not push the content panel off-screen at 320px.

### 2.3 Greek Noun Drill

English sentence prompt with ONE WORD UNDERLINED, a Scripture
reference below it, and **ten Greek options laid out five rows by two
columns**. This is the chapter-2 underlined-English contract for the
prompt and the chapter-3 `fullOptionGrid` for the options — but see
§4.4, because the two-column layout here is pedagogy and is exempt
from D-19.

### 2.4 Declining Noun Drill

A Greek form and a reference are shown; the student taps the matching
case and number from ten grouped options (Nominative Singular |
Nominative Plural, Genitive Singular | Genitive Plural, and so on,
five rows by two columns). Buttons: Previous / Next, Pronounce, Hint,
**Translate**, Score. See §4.5 for the Translate reveal.

### 2.5 Exercises, vocabulary, Scripture

- **Second Declension Noun Spelling Exercise** — prompt is an English
  gloss ("to or by a word") under the label "English Word". Reuses
  `spell`.
- **Learn Vocabulary / the two vocabulary drills / Vocabulary
  Spelling** — identical contracts to chapter 3. Ten lemmas.
- **Learn Scripture Memory** — John 14:6b, `interlinearVerse`, Say
  Whole Verse.
- **Scripture Memory Drill** — ten options, `autoBoth`, as chapter 3.
- **Scripture Memory Spelling Exercise** — `spellVerse` over the whole
  of John 14:6b.

### 2.6 Quick Review

Four charts. `c4_qr_nouns` is the λόγος paradigm WITH its glosses
inline and a **Say Whole Paradigm** button (the Learn charts show
Greek only and say "Say Whole List" — see §4.2). The two Scripture
charts are cumulative: chapter 4 reviews John 14:6a, which is chapter
3's verse, as well as its own 14:6b. Its audio pack ships chapter 3's
`c_sm*` clips locally for exactly this reason; the data references the
LOCAL copies (`chapt_4_c_sm1`, not `chapt_3_c_sm1`). Do not
cross-reference packs to save bytes.

---

## 3. Chapter 5 rail

| # | id | title | mode / type |
| --- | --- | --- | --- |
| 1 | `c5_learn_objectives` | Learn Chapter Objectives | objectivesPage |
| 2 | `c5_learn_english_concepts` | Learn English Concepts | topicPages |
| 3 | `c5_learn_nouns` | Learn Greek Nouns: 1st Declension | topicPages |
| 4 | `c5_drill_first_decl_noun` | First Declension Noun Drill | select |
| 5 | `c5_drill_declining` | Declining Noun Drill | select |
| 6 | `c5_ex_noun_speller` | First Declension Noun Spelling Exercise | spell |
| 7 | `c5_learn_article` | Learn Definite Article | topicPages |
| 8 | `c5_drill_article` | Definite Article Drill | select |
| 9 | `c5_ex_article_speller` | Definite Article Spelling Exercise | spell |
| 10 | `c5_learn_vocab` | Learn Vocabulary | flashcard |
| 11 | `c5_drill_vocab_gk_en` | Vocabulary: Greek to English Drill | select |
| 12 | `c5_drill_vocab_en_gk` | Vocabulary: English to Greek Drill | select |
| 13 | `c5_ex_vocab_speller` | Vocabulary Spelling Exercise | spell |
| 14 | `c5_learn_scripture` | Learn Scripture Memory | interlinearVerse |
| 15 | `c5_drill_scripture_memory` | Scripture Memory Drill | select |
| 16 | `c5_ex_scripture_speller` | Scripture Memory Spelling Exercise | spellVerse |
| 17 | `c5_qr_vocab` | Review Vocabulary Chart | reviewVocab |
| 18 | `c5_qr_nouns` | Review Nouns: First Declension | paradigmChart |
| 19 | `c5_qr_article` | Review Definite Article | paradigmChart |
| 20 | `c5_qr_scripture_146a` | Review Scripture Memory: Jn 14:6a | interlinearVerse |
| 21 | `c5_qr_scripture_146b` | Review Scripture Memory: Jn 14:6b | interlinearVerse |
| 22 | `c5_qr_scripture_rom` | Review Scripture Memory: Rom 3:23 | interlinearVerse |
| 23 | `c5_learn_bibliography` | Learn Bibliography | textPage |

### 3.1 Learn English Concepts (5 topics)

Introduction, Gender, Number, Case, **Definite Article**. Same three
case popups as chapter 4. The Introduction carries the "proceed with
haste" paragraph noted in §1.

This page is deliberately near-duplicate teaching text. It is NOT
shared between chapters: each chapter's data carries its own copy,
because the wording differs in small ways ("Nouns are commonly defined
as words that stand for a person, place, or thing" in ch5 versus "A
noun is commonly defined as a word that stands for a person, place or
thing" in ch4), and the chunking model gives each chapter its own
file. Do not factor it out.

### 3.2 Learn Greek Nouns: 1st Declension (7 topics)

Introduction, Gender, Number and Agreement, Inflectional Forms, First
Declension--Eta, First Declension--Alpha, First Declension--Masc.

- The Eta chart (γραφή) has FOUR rows; its first row label is
  `Nom.\Voc.` — with a BACKSLASH. That is what the original prints
  and the rail walk confirms it. The Alpha and Masculine charts use
  `Nom./Voc.` and `Nom.` respectively. Ship all three verbatim; this
  is an original inconsistency, not a typo to normalize, and it is not
  covered by typo policy A1.
- **First Declension--Alpha** carries TWO charts: ὥρα with a **More**
  button, and δόξα with a **Back** button. The δόξα chart carries an
  extra note line under Meanings: "This form occurs with nouns ending
  in ζ, ξ, ψ, σ or λλ."
- **First Declension--Masc** (προφήτης) has five rows including a
  distinct vocative.

### 3.3 Learn Definite Article (3 topics)

Introduction, Examples, Definite Article Paradigm.

- **Examples** is a Greek-rows table: bare form, then articled form,
  each with its parsing label and a reference. The Greek is tappable;
  the parsing labels and references are not.
- **Definite Article Paradigm** is a three-gender chart (Masc. / Fem.
  / Neut.) by four cases, with a **Singular / Plural toggle** — the
  button prints the name of the chart you are NOT looking at. Each
  chart carries a Say Whole List button and the note "Note ὁ and ἡ are
  enclitics with no accents." (plural: "Note οἱ and αἱ …"). See §4.2.

### 3.4 Drills and exercises unique to chapter 5

- **First Declension Noun Drill** — underlined-English prompt, but
  only FOUR Greek options in a SINGLE column (ἀγάπη, ἀγάπης, ἀγάπῃ,
  ἀγάπην). Use the existing `single` option layout, not the ch4
  five-by-two grid.
- **Definite Article Drill** — a definite-article form and a reference
  are shown; the student taps the matching case and number from EIGHT
  grouped options (four cases × singular/plural; the article has no
  vocative). Buttons: Previous / Next, Pronounce, Hint, **Gender**,
  Score. The Gender button reveals "Masculine" / "Feminine" /
  "Neuter" under the reference — same reveal mechanism as chapter 4's
  Translate (§4.5), different field.
- **Definite Article Spelling Exercise** — the prompt is a PARSING
  LABEL, not a gloss: "acc. sing. masc.", under the label "Definite
  Article Inflection", with a reference chip below it ("Jn 1:1"). See
  §4.6.

### 3.5 Quick Review

Six charts. `c5_qr_article` shows Singular AND Plural **side by side**
in one six-column table with a Say Whole Paradigm button under each
half — not the toggle used on the Learn page. Three cumulative
Scripture charts: Jn 14:6a (ch3), Jn 14:6b (ch4), Rom 3:23 (ch5).
Chapter 5's pack ships `c_sm*`, `d_sm*` and `e_sm*` locally; reference
the local copies.

---

## 4. New renderer support

Seven items. Everything else in these chapters reuses an existing
contract unchanged.

### 4.1 Paradigm row labels

`paradigm` rows currently carry `person` ("1.", "2.", "3."). Noun and
article paradigms are keyed by CASE, not person. The rows in the
delivered data carry **`label`** ("Nom.", "Gen.", "Dat.", "Acc.",
"Voc.", "Nom./Voc.", "Nom.\\Voc.").

Renderer rule: `row.label ?? row.person`. Chapter 3's data is NOT
touched — its chunk hash must stay put — so `person` keeps working.
Note it in RESULTS as registry debt: unify on `label` at the next
chapter-3 regeneration.

### 4.2 Multiple charts in one paradigm block

Three surfaces need two charts where one block sits today: ch4
Masculine Declension (λόγος → ἄνθρωπος), ch5 First Declension--Alpha
(ὥρα → δόξα), ch5 Definite Article Paradigm (Singular ↔ Plural).

The delivered data uses an optional `charts` array on the `paradigm`
block. Each entry is a full chart (`lemma`, `columns`, `rows`,
`sayWhole`, `meanings`, optional `note`) plus a `name`. When `charts`
is absent the block IS the chart, so chapter 3 is unaffected.

The block also carries `switch`, one of:

- `"moreBack"` — chart 1 shows a **More** button, the last chart shows
  **Back**, intermediate charts show both. Used by the two noun pairs.
- `"named"` — the button prints the OTHER chart's `name`, so the
  singular chart offers **Plural** and the plural chart offers
  **Singular**. Used by the definite article.

One mechanism, two labelings. Do not build two.

State is LOCAL to the activity: switching charts is not rail
navigation, the sequential Previous/Next rail stays live throughout
(directive 7), and leaving the page and returning resets to chart 1.

### 4.3 The Meanings expander on a chart

Every noun chart in both chapters carries a blue **Meanings** link
that opens a green card titled "Translation of Inflectional Forms" (in
chapter 5: "Meanings: Translation of Inflectional Forms" — follow the
data). The card holds a singular/plural table of forms WITH glosses,
followed by a legend of the five case meanings, and in some charts a
closing note ("Note that in the neuter the Nominative, Accusative and
Vocative form are always the same.").

Data shape: a `meanings` key on a chart, rendered as an `expander`
positioned directly below the chart with the label "Meanings". Colour
the label `--link`, because it is tappable, and only because it is
tappable (directive 8).

### 4.4 Paradigm-shaped option grids are exempt from D-19

D-19 says Greek option grids are two-up at phone width and four-up at
the iPad breakpoint. **Chapter 4's Greek Noun Drill and both
chapters' Declining Noun Drills are exempt and stay TWO COLUMNS at
every width**, because their two columns are Singular and Plural and
their five rows are the five cases. The grid IS the paradigm; reflowing
it to four columns destroys the teaching (directive 2 — visual
arrangement is pedagogy).

Mark these pools with an explicit layout flag in the data rather than
inferring the exemption from option count. D-19 continues to apply
unchanged to the vocabulary drills in both chapters.

Chapter 5's First Declension Noun Drill (four options) is `single`
column at every width, matching the original.

### 4.5 Reveal buttons on select drills

The Declining Noun Drill has a **Translate** button; the Definite
Article Drill has a **Gender** button. Both print a per-item string
into the prompt panel, under the reference, when tapped.

Data shape: `revealButtons: [{ "label": "Translate", "field":
"translate" }]` on the activity, with the value on each item. Generic
by design — chapter 6+ will want a third.

The revealed text is INK, not blue: it is output, not a tap target.
It clears when the item changes.

**One behavioral question is deliberately left open**: whether the
original also reveals the translation automatically once the item is
answered. The rail-walk screenshots show it present in both the
correct and incorrect states, but Nathanael may have pressed the
button first. **Build it button-driven only**, and put the question in
VERIFY-5E. Do not guess a behavior into existence (directive 1).

### 4.6 Spell prompt variants

`spell` gains two optional keys:

- `promptLabel` — the caption above the prompt panel. "English Word"
  in ch4's noun speller and both vocabulary spellers; **"Definite
  Article Inflection"** in ch5's article speller.
- per-item `ref` — a reference chip below the prompt, used only by
  ch5's article speller ("Jn 1:1").

No change to the checking policy, the keyboard, or the answer model.

### 4.7 The `note` line under a chart

Three charts print a short note below the grid: the two definite
article charts (the enclitics note) and δόξα (the ζ/ξ/ψ/σ/λλ note).
This is a `note` string on the chart, rendered in ink beneath the
table, NOT a green banner — green banners are parenthetical asides
(directive 2) and these are part of the chart's own teaching.

### 4.8 Smaller data keys the assembly needed

Found while assembling chapter 4; each is one line in a renderer and
none changes an existing chapter.

- **`lexicalForm` on a lemma.** `greek` stays the BARE lemma, because
  the drills and the Vocabulary Spelling Exercise answer against it —
  the speller answer for οἶκος is οἶκος, not "οἶκος, -ου, ὁ".
  `lexicalForm` carries the citation form with its genitive ending and
  article, which is what the Learn Vocabulary flashcard and the Review
  Vocabulary Chart print. Verbs and particles have no `lexicalForm`;
  fall back to `greek`.
- **`showGlosses` on a chart.** The Learn charts print Greek only and
  keep the glosses in the Meanings card; the Quick Review chart prints
  both inline. Same block, one flag.
- **`optionLayout: "paradigm2col"`** — the explicit D-19 exemption
  flag required by §4.4. Never inferred from option count.
- **`numbered: false` on a `numbered` block.** The Case and
  Inflectional Forms lists are label-plus-text lists with underlined
  labels and NO numerals — the ch3 `{label, text}` + `labelStyle`
  shape, minus the counter. Absent, the block numbers as today.
- **`layout` on `greekRows`** — `"glossOnly"` for the two-column
  Greek/description tables (οἶκος "house" is masculine),
  `"englishPairs"` for the singular/plural English table on the Number
  topic. This is the layout flag already on the registry-debt list.
- **`legend` and `closing` on a `meanings` card** — the five case
  meanings printed under the table, and the neuter chart's closing
  note.
- **`audio` on a `spellVerse`** — the whole-verse clip for its
  Pronounce button. Chapter 3 gets this from its Learn page; chapter 4
  states it directly.

---

## 5. Drill matrix additions

DRILL-MATRIX.md ships updated with this spec and is canonical. New
drills are ASSIGNED to an existing class; none gets its own rule.

| Chapter | Activity | Class | Notes |
| --- | --- | --- | --- |
| 4 | Greek Noun Drill | `manualOnIncorrect` | "Try again" + "Click on 'Next' to continue" in the rail walk |
| 4 | Declining Noun Drill | `manualOnIncorrect` | same evidence |
| 4 | Vocabulary: Greek to English | `manualOnIncorrect` | as ch3 |
| 4 | Vocabulary: English to Greek | `manualOnIncorrect` | as ch3 |
| 4 | Scripture Memory Drill | `autoBoth` | as ch3 |
| 4 | all three spellers | `manual` | as ch3 |
| 5 | First Declension Noun Drill | `manualOnIncorrect` | |
| 5 | Declining Noun Drill | `manualOnIncorrect` | |
| 5 | Definite Article Drill | `manualOnIncorrect` | |
| 5 | Vocabulary: Greek to English | `manualOnIncorrect` | |
| 5 | Vocabulary: English to Greek | `manualOnIncorrect` | |
| 5 | Scripture Memory Drill | `autoBoth` | |
| 5 | all four spellers | `manual` | |

`ADVANCE_CORRECT_MS` = 2000 and `ADVANCE_INCORRECT_MS` = 4000 are
inherited unchanged. No new constant, no per-activity override; the
`check:shapes` guard that fails the build on `autoAdvanceMs` stays.

Revisit-resets-item (VERIFY-5D A5) applies to every new scored surface
in both chapters, with no new code — it falls out of the existing
components if the new pools use them.

---

## 6. Carried forward from 5D round 2 — no action unless stated

These shipped in the previous round and are RATIFIED as shipped. Do
not revisit them; if you disagree, say so in RESULTS rather than
changing them.

- **768px is the iPad breakpoint** for the four-up Greek vocabulary
  grids. Kept.
- **Punctuation stays optional** under "With Accents" ON. The raised
  dot and the comma are not required (D-18 unchanged).
- **A `greekTaps` key marks every standalone occurrence**, not just
  the first. Kept, and now a standing rule — the delivered chapter-4
  and chapter-5 data assumes it.
- The shared speller input model (`lib/speller-input.js` +
  `SpellerField.svelte`), the caret-placement behavior and the held
  pending-mark behavior are unchanged and both new spellers mount
  them.
- The five clipping fixes from 5D-SPEC2 §8 stay. **Re-measure them**
  on the new pages: chapter 4's ten-option paradigm grid and chapter
  5's six-column Quick Review article chart are the two widest things
  the app has ever rendered, and both must be checked at 320px.

---

## 7. On the missing VERIFY-5D2

Nathanael's visual pass on the 5D round-2 tree came back as a pass
("Chapter 3 looks great"), so no formal VERIFY-5D2 document was raised
— the same call he made at 5B-SPEC4. Cohort 5D is CLOSED. Nothing in
this round reopens it, and the judgement items from 5D-SPEC2-RESULTS
§10 that were not settled by §6 above roll forward into VERIFY-5E.

---

## 8. Tests and evidence

The BUILD document must show all of this, and the diff must be
complete.

1. **Rail walk, machine-driven.** `npm run ui:walk` extended to
   chapters 4 and 5: every rail stop at 320px and 768px, every topic
   of every `topicPages` activity stepped, every paradigm chart
   switched through all of its charts, every expander opened.
   Screenshots to `buildout/screenshots/5e-spec1/`.
2. **Side-by-side comparison** against the rail-walk PDFs for every
   Learn page and every Quick Review chart in both chapters. Report
   which pages you compared, not just that you compared.
3. **Horizontal-overflow measurement** on every stop in both new
   chapters, with the numbers, at 320px. Zero tolerated overruns
   except any you argue for explicitly.
4. **Behavior assertions** (`npm run ui:behavior`, extended): the
   More/Back switch on all three surfaces; the Singular/Plural toggle;
   the Translate and Gender reveals; revisit-reset on one drill per
   new chapter; advance timing measured through the UI on one
   `manualOnIncorrect` and one `autoBoth` surface per chapter.
5. **Regression**: chapters 1, 2 and 3 still green on both harnesses,
   and **the chapter-1, chapter-2 and chapter-3 chunk hashes are
   UNCHANGED**. If any of them moves, you edited data you should not
   have; report it and explain.
6. `npm run check:shapes` and `npm run check:lazy-chunk` green.
   Report the precache entry count and size delta.
7. **Airplane-mode walk of chapters 4 and 5** — device, Nathanael,
   in VERIFY-5E.

---

## 9. Out of scope

Chapters 6+; the VOCAB, JOHN, REV_VOC and REV_PAR books; any change to
the Greek font, `mark-geometry.json` or the mark-overlay path; any
change to the audio storage layer; any refactoring not required by §4.

---

## 10. What belongs in VERIFY-5E

Judgement, not facts. A script settles facts; Nathanael settles taste
and device reality. Specifically, ask him about:

1. Does the More/Back switch read as "there is a second chart here",
   or does it read as a dead end? (Directive 7 — the sequential rail
   must stay live behind it.)
2. Does the Singular/Plural toggle on the definite article read
   correctly, given the button names the chart you are NOT on?
3. Does the Declining Noun Drill reveal its translation automatically
   on answer in the original? (§4.5 — the one behavior deliberately
   not guessed.)
4. Do the seven-topic Learn pages read well at phone width, or does
   the radio rail crowd the panel?
5. Is chapter 5's near-duplicate English Concepts page tedious enough
   on device to be worth a divergence, or does the original's own
   "proceed with haste" line handle it?
6. Real WebKit audio: the paradigm cells, the `Say Whole List` clips,
   and the forward-shipped cumulative Scripture clips.
7. Airplane-mode walk of both chapters.
8. Anything the rail walks show that the build does not.

Do NOT ask him to confirm anything a click-through can confirm.
