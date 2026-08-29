# 5I-SPEC1.md — Cohort 5I buildout: chapters 13, 14, 15, 16

Issued by the chat pipeline (Fable), 2026-08-29. First VOLUME cohort: four
chapters in one round, against repo HEAD `aaf3370`.

Chapters: 13 Third Declension Nouns, 14 Second Aorist Verbs, 15 First
Aorist Verbs, 16 Aorist and Future Passive Verbs.

---

## 0. WHAT YOU ARE GIVEN, AND WHAT OUTRANKS WHAT

Delivered with this spec, to be committed AS-IS into `src/data/`:

```
chapt-13.json   lexicon-chapt13.json
chapt-14.json   lexicon-chapt14.json
chapt-15.json   lexicon-chapt15.json
chapt-16.json   lexicon-chapt16.json
```

Also attached, as standing reference for the whole round:
`ch13railwalk.pdf`, `ch14railwalk.pdf`, `ch15railwalk.pdf`,
`ch16railwalk.pdf`, and `ch13decliningdrill` (sixteen screenshots of the
πᾶς Declining Drill).

**Order of authority, when two sources disagree:**

1. **THIS SPEC.** It is complete; nothing in it is pending further data.
2. **The rail walks and screenshots**, which are the fidelity reference
   for anything the spec does not address — layout, line breaks,
   emphasis, which words are tappable, chart alignment. Consult them
   constantly; they are not optional background.
3. Existing code and shipped chapters, as precedent.

Where the rail walk and this spec disagree, **the spec wins and you
report the disagreement** in RESULTS. Do not silently follow either one.

**The data files are the pipeline's.** You commit them unedited. The one
standing exception (CHAT-HANDOFF, visual verification rule 4): if
loading a page in a browser against its rail-walk screenshot reveals
**obviously missing formatting or text**, you are authorised to edit
`src/data` to fix it — and you must list every such edit in RESULTS with
its before and after, so the pipeline can absorb it. A hand edit is lost
at the next regeneration, so an unreported one is a silent regression.

**You never run git beyond read-only inspection.** No `commit`, no
`push`, no `add`, no staging. `git diff` and `git status` only. All
version control is Nathanael's.

**The audio manifest is FROZEN (Stage 8.6).** Every clip these four
chapters name already resolves in `audio-manifest.json` — verified. If
anything you do would add, remove or alter a manifest entry, STOP and
report it instead; a single edit re-prompts every installed device to
re-download its audio packs.

---

## 1. WALL-CLOCK TIMING — READ THIS BEFORE YOU START

**Per-TURN timing, not per-round.** This round is expected to span
several turns with gaps between them. Record the wall-clock **start and
stop time of each TURN** — the moment you begin working on a message and
the moment you finish responding to it. Downtime between turns is not
your time and is not counted.

Keep a running table from turn one. In the BUILD document, publish the
table and a **cumulative ACTIVE time** — the sum of the per-turn
durations across every turn required to complete this spec, excluding
all gaps.

```
| Turn | Started (local) | Stopped (local) | Active |
| ---- | --------------- | --------------- | ------ |
| 1    | 14:02           | 15:48           | 1h46m  |
| 2    | 09:11           | 10:03           | 0h52m  |
| ...  |                 |                 |        |
| CUMULATIVE ACTIVE TIME |        |        | 2h38m  |
```

Timing is MANDATORY and permanent (CHAT-HANDOFF, 2026-08-25). A BUILD
document without it is automatically penalised by the grader. Do not
reconstruct times from memory at the end — record each turn as it
closes.

---

## 2. THE THREE DOCUMENTS YOU PRODUCE

Every spec round yields three documents, all authored by you, all in the
same round.

### 2.1 `5I-SPEC1-BUILD-<MODEL>.md`

**Its one purpose is the complete, exact `git diff` of the round's
cumulative work.** Not a summary, not excerpts, not "see the tree". If
the diff is absent or partial the document has failed and the grader
applies an automatic penalty. This is what the assessment pipeline reads
to check every claim in RESULTS against what actually changed.

Contents, in order:

1. The per-turn wall-clock table from §1, with the cumulative active
   total.
2. The full `git diff` of every file you touched, in one block.
3. Your complete thought and tool log for the round.

Addenda and follow-up patches add their time to the same cumulative
total; they do not start a new count.

### 2.2 `5I-SPEC1-RESULTS-<MODEL>.md`

The handoff. What you built, what you found, what you could not do:

- every section of this spec, with what you did for it;
- **every `src/data` edit** made under the visual-verification exception,
  with before and after;
- every place the rail walk and this spec disagreed;
- every gate you ran and its result (§8);
- anything you believe is wrong in the delivered data — report it, do
  not fix it beyond the visual-verification exception;
- open questions your build work raised that this spec does not answer.

### 2.3 `VERIFY-5I.md`

The document Nathanael works from on the device. **You author it**, and
it is built from TWO sources, which must both be present:

- **Pipeline items**, handed down in §9 of this spec. Carry every one of
  them across; they are findings from extraction that only a human with
  DOSBox or a device can settle, and the pipeline cannot answer them.
- **Implementation items** — questions your own build work uncovered.
  Things you had to guess, places where two readings were defensible,
  behaviour you implemented but could not confirm, anything a script
  could not settle for you.

Structure:

1. **PREVIOUS-RESPONSE CHECKLIST.** Cohort 5H closed clean, so for this
   round the checklist carries the four rulings Nathanael made during
   data production, one or two lines each, as boxes he ticks by LOOKING
   rather than assuming, each with a route line telling him where on the
   device to look. They are listed in §9.0.
2. Then the pipeline items from §9.
3. Then your implementation items.

Rules for this document:

- **Ask for JUDGEMENT, not for facts a script can establish.** Anything
  Playwright can check, check it yourself and report it in RESULTS
  instead. A VERIFY item that a script could have answered is a defect
  in the VERIFY document.
- **No airplane-mode items.** The scripted offline walk during your own
  testing suffices; all later testing is assumed offline and Nathanael
  reports what does not play.
- Each item gets a route line: exactly where to tap to reach the screen.

---

## 3. VISUAL VERIFICATION — MANDATORY, EVERY PAGE

This is the standing requirement that exists because cohort 5D shipped
four teaching pages with flattened formatting that a single screenshot
comparison would have caught.

**Load EVERY page you build in a real browser, screenshot it, and
compare it against the corresponding rail-walk screen.** Checking that a
string is present in the JSON is NOT visual verification — every 5D
failure was present-but-misrendered.

Four chapters × roughly 24 rail pages each is about 98 screens. Drive it
with `playwright-core`, which is already a devDependency; page loads,
clicks, typing and screenshots are all scriptable. Budget for this from
the start rather than leaving it to the end.

What to compare, explicitly:

- line breaks and indentation inside example panels;
- underlines and other emphasis;
- list markers and hanging indents;
- citation alignment;
- **which words are tappable** — in a rail walk a HAND cursor marks a
  clickable element. The marking is deliberate but NOT exhaustive, so a
  hand is positive evidence and its absence is not evidence of absence;
- chart column alignment, especially the wide ones in §4;
- anything the original sets apart visually.

**Every new chart is checked at 320px.** Overflow is CLIPPED app-wide,
not scrolled, so a too-wide chart silently loses its right-hand columns
and nothing errors. The three widest surfaces in this cohort are called
out in §4.1, §4.7 and §4.8.

**Every modal is checked at forced scroll** (DISCLOSURE §4.3): resize
until the content must scroll, then confirm the light padding appears
above AND below the divider, with no doubled padding on either side.

---

## 4. RENDERER WORK

Everything below is new or changed. Nothing else in the renderer should
need to move; if you find otherwise, report it.

### 4.1 `paradigm` with `columnGroups` — chapter 13's πᾶς chart

`c13_learn_third_declension` topic `pasAdjective`, and the Quick Review
page `c13_qr_pas`, ship a SIX-column paradigm:

```
columns:      Masculine  Feminine  Neuter  Masculine  Feminine  Neuter
columnGroups: [{label: "Singular", span: 3}, {label: "Plural", span: 3}]
```

`columnGroups` already validates in `check-content-shapes.mjs`; confirm
it RENDERS as a spanning header row above the column labels. This is the
widest chart in the app. At 320px it must not clip — if it cannot fit,
report what you did rather than inventing a pager, because DISCLOSURE
§4.6 forbids pagination on the Quick Review copy.

### 4.2 `objectivesPostamble` — NEW chapter-level key, chapter 13 only

Chapter 13's objectives page prints a closing paragraph BELOW the
numbered list:

> Congratulations!  After mastering this chapter, you will know all the
> noun forms in the New Testament.

`objectivesPage` currently renders preamble + list and stops. Add the
postamble beneath the list, in ordinary body style. **It is not an
objective** — it must not be folded into the `<ol>`, and it must not
render for the twelve chapters that do not have it.

### 4.3 `playAllGroups` — NEW contract, chapter 13's Review Vocabulary Chart

`c13_qr_vocab` carries:

```json
"playAllGroups": [
  {"afterRow": 5,  "label": "Say List", "audio": "chapt_13_m_vocla"},
  {"afterRow": 10, "label": "Say List", "audio": "chapt_13_m_voclb"}
]
```

The original pages this chart five-and-five behind More/Back with a
separate recording per half. DISCLOSURE §4.6 forbids a pager on a Review
page, so the port shows all ten rows in one scroll and keeps both
recordings: **five rows, a Say List button, five more rows, a second Say
List button.** Ruled by Nathanael 2026-08-29; recorded as NIT-LOG N-6.

This is the first chart app-wide with more than one say-all. `playAll`
(single) stays as-is everywhere else and the two keys are mutually
exclusive. Note the label is **"Say List"**, not chapters 14–16's "Say
Whole List" — carry each verbatim.

### 4.4 Per-item instructions — chapter 16's Passive Verbs Form Drill

`c16_drill_forms` has 22 questions for 15 verbs. Six verbs appear twice:
once the question wants the **aorist passive**, once the **future
passive**. The prompt panel is identical both times — Greek present-tense
lemma plus English gloss, e.g. "βάλλω / I cast, throw" — so the ONLY
thing distinguishing them is the instruction line above the options.

CONFIRMED by Nathanael in DOSBox, 2026-08-29: the original swaps that
line between "Click on the correct matching aorist form" and "Click on
the correct matching future form" per item.

The activity carries `instructionsPerItem: true` and every item carries
its own `instructions` string. When `instructionsPerItem` is set, render
the CURRENT ITEM's instructions in the place the activity-level
`instructions` normally occupies. The activity-level string stays as the
fallback for any surface that has not loaded an item yet.

Each item also carries `"tense": "aorist" | "future"` — provenance only,
never rendered.

### 4.5 Per-item answer label — chapter 16's Forms Spelling Exercise

`c16_ex_speller_forms` does the same one screen along: the label on the
box you type into reads **"Passive Aorist Form"** on some items and
**"Passive Future Form"** on others. Also CONFIRMED in DOSBox.

Every item carries `answerLabel`. When present, it overrides the second
entry of `ui.fields` for that item. `ui.fields` keeps
`["Present Tense", "Passive Aorist Form"]` as the static fallback.

### 4.6 `greekRows` — five new layouts

All five are `greekRows` blocks whose rows carry `parts` and, in two
cases, `label`, `popupRef`, `note` and `noteAudioMap`.

| layout | chapter | what it draws |
| --- | --- | --- |
| `keyLetterBox` | 13 | 3×3 consonant grid with clickable column headers AND row labels |
| `transformation` | 13 | three labelled rule lines (Labials / Velars / Dentals) |
| `stemList` | 14, 15 | `lemma — aorist (gloss)`, both Greek forms tapping |
| `endingTransformation` | 15, 16 | labelled rule line plus a worked example beneath |
| `shiftSummary` | 16 | four bare `κ, γ — χ` notation lines |
| `principalParts` | 16 | six labelled rows, one Greek form each |

Two things to get right:

- **`keyLetterBox` triggers.** The three column headers (Unvoiced,
  Voiced, Aspirate) and the three row labels (Labial, Velar, Dental) are
  each C3 in-chart triggers opening their own popup — six in all.
  DISCLOSURE §3.3: in-chart triggers keep their existing appearance and
  get **no green underline**, because that would collide with the blue
  Greek-tap convention. The nine consonant cells are NOTATION: no clip
  exists for any of them and no hand cursor appears over one, so they do
  not tap (same treatment as chapter 12's augment rule lines).
- **`noteAudioMap`** on `endingTransformation` rows maps forms inside the
  worked example to clips, so both sides of `διδάσκω + σα = ἐδίδαξα` tap.

### 4.7 Three-column `paradigm` with mixed cells — chapter 16's Passive Stems

`Present Active / Aorist Passive / Future Passive`. Eight of the fifteen
verbs have no future passive; the original prints `--` and the data ships
an em dash as a **`text` cell** rather than a `greek` cell, so it renders
inert with no tap. Confirm a `text` cell renders correctly inside a
`paradigm` row alongside `greek` cells. Check at 320px.

### 4.8 `popups` is an ARRAY at ACTIVITY level

Stated because the pipeline got it wrong once already and it fails
silently. `popups` is an array of `{id, title, content}` hanging off the
ACTIVITY, never a dict and never on a topic — the register is
per-activity via `providePopups` and Svelte context, so a topic-level
object never reaches the renderer and every popup silently renders
nothing.

Three activities in this cohort carry popups:
`c13_learn_concepts` (six), `c14_learn_second_aorist` (one),
`c14_qr_forms` (one), `c15_learn_first_aorist` (four).

### 4.9 Hint charts with three or more charts

DISCLOSURE §4.2 applies to two hints in this cohort:

- `c15` `aoristVsImperfect` — **four** charts (Aorist Active, Aorist
  Middle, Imperfect Active, Imperfect Middle/Passive);
- `c16` `passiveParadigms` — **three** charts (First Aorist Passive,
  Future Passive, Second Aorist Passive);
- `c16` `passiveStemsHint` — two halves of the Passive Stems table.

Back and More as a pair on their own line beneath the content, BOTH
always visible, Back disabled on the first page and More on the last.
Buttons never disappear or move. None of these charts carries a say-all,
so per §4.5 of DISCLOSURE the pair is **centred**, not left-aligned.

`c15` `firstAoristParadigms` is the two-chart case and takes the §4.1
single toggle. Its `switchLabels` are `["Active", "Middle"]` — a
Greek-free contrast, so the named pair is correct there rather than
More/Back.

### 4.10 The A1c audio-leak gate — THREE new activities

`c14_drill_forms`, `c15_drill_forms`, `c16_drill_forms`.

A1c (DRILL-BEHAVIOR-RULES): when `audioTiming` is `afterGuess` AND the
options are Greek AND the advance class is not `autoBoth`, the prompt
carries **no tap** and **Pronounce is disabled** until the item is
answered; after the guess the clip plays and both become live.

All three qualify. The reason is A1b — the clip is the ANSWER form, not
the prompt lemma. This is not inference: each chapter's SayWord table
dispatches the aorist/passive clips and never the paired present clips,
read independently in all three TBKs. The renderer already states A1c
structurally; confirm the three new activities pick it up and that no
per-activity flag was needed.

The gate does NOT apply to the matching Forms **spellers**
(`c14/15/16_ex_speller_forms`) — spellers are excluded by ruling, because
pronouncing the target is the exercise's design.

### 4.11 `revealButtons` Translate on `twoStageGrid`

Four drills carry a Translate reveal on a two-stage grid, which earlier
chapters only did on `fullOptionGrid`: `c13_drill_pas_declining`,
`c14_drill_parsing`, `c15_drill_parsing`, `c16_drill_parsing`. Confirm
the button renders and reveals inside the two-stage shape.

---

## 5. WHAT IS ALREADY DONE — DO NOT REDO

- **TOC**: `toc.json` already lists all 28 chapters. No edit.
- **Chapter registry**: `content.js` globs `../data/chapt-*.json`, so the
  four new files register automatically. Confirm the lazy chunks emit —
  the glob map must stay reachable from executed code or the chunk is
  tree-shaken silently, which `check:lazy-chunk` guards.
- **Audio manifest**: frozen and already complete for these chapters.
- **Behaviour fields**: every `audioTiming` and `advanceClass` in the
  four files is already stamped from `DRILLBEHAVIORLEDGER.csv` rows
  116–154, all CONFIRMED. Do not run `apply-behavior-matrix.py` and do
  not re-derive them.

---

## 6. SEQUENCE AND SCALE

| Ch | Rail pages | Scored items | Clips | Largest drill |
| --- | --- | --- | --- | --- |
| 13 | 24 | 130 | 155 | Declining 30 |
| 14 | 24 | 114 | 140 | Translation 28 |
| 15 | 25 | 109 | 156 | Translation 29 |
| 16 | 25 | 143 | 151 | Translation 28 |

Rail order in each file's `sequence` comes from that chapter's rail walk,
cross-checked against its Drill / Exercise / Quick Review menus. Standing
directive 7 still holds: no dead-end Next — at the end of a chapter's
rail, Next opens the end-of-chapter dialog, and the sequential rail stays
live on every page even where an activity-local stepper greys out.

---

## 7. THINGS THE ORIGINAL GETS WRONG — SHIPPED AS DECIDED

Listed so you do not "fix" them and so RESULTS does not report them as
defects.

**Carried VERBATIM:**

- ch15 Ending Transformations prints **"ofen"** for "often".
- ch15 Review Vocabulary Chart prints **"other (155 )"** with a space
  before the bracket.
- ch16 Form topic prints **`λυ + θησ + ν = λυθήσομαι`** — the ending
  shown is nu although the form ends `-ομαι`.
- ch13 πᾶς Declining Drill items 15 AND 16 both translate as **"every"**;
  the Translate pool is byte-exactly fifteen lines for sixteen items and
  its last line serves both. Confirmed in DOSBox 2026-08-29.
- ch16 δύναμαι: the Passive Stems chart prints `--` for its future
  passive, yet the Form Drill asks for one and its own key gives
  δυνήσομαι. Taken from the key, flagged on the item.

**CORRECTED, on the ch12 D-55 precedent:**

- ch13's two Tau/Delta HINT screens misprint the genitive plural as
  χαρίτῶν — an acute and a circumflex on one syllable. The chapter's own
  Learn and Review charts print χαρίτων. Corrected.
- ch13's πᾶς HINT screen alone prints πᾶσαις where the Learn and Review
  charts print πάσαις. Corrected.

**RESTRICTED, deliberately NOT divergence-logged:**

- ch13 πᾶς Declining Drill item 2 (πάντα). The original's compiled key is
  an OR-of-ORs and accepts the full six-cell cross product, three cells
  of which hold other words (πάντες, πάντας, πᾶν). Ruled 2026-08-29: the
  port accepts only the **three** parses the chapter's own πᾶς chart
  licenses. A compiled-condition defect corrected, not a departure from
  the original's teaching.

---

## 8. GATES

Run all of these and report each result in RESULTS. Green is not assumed.

```
npm run check:shapes        # currently PASSES across all 16 chapters
npm run check:lazy-chunk
npm run build
npm run ui-behavior
npm run ui-modals
npm run ui-disclosure
npm run ui-disclosure3
npm run ui-walk             # extend to chapters 13-16
npm run ui-offline          # one of the new chapters
npm run check:docs
```

Two known conditions, so you do not chase them:

- `check:docs` reports ~44 failures against a pre-existing CRLF-guard
  baseline. Report the count; a CHANGE in it is the signal, not the
  count itself.
- A build that dies mid-run can leave a stale `dist` behind a green gate.
  If disk space runs low — it has bitten this project before — verify
  `dist` is fresh before trusting any gate that reads it.

Extend `ui-walk` to cover the four new chapters: every rail page loads,
no console error, no horizontal overflow at 320px.

---

## 9. PIPELINE ITEMS FOR `VERIFY-5I.md`

Carry every item below into the VERIFY document you author, then add your
own implementation items after them.

### 9.0 PREVIOUS-RESPONSE CHECKLIST (the four rulings)

- [ ] **Review Vocabulary Chart does not page** — five rows, Say List,
      five rows, Say List. Route: ch13 → Quick Review → Review Vocabulary
      Chart.
- [ ] **πᾶς Declining Drill is 16 items** and item 2 (πάντα) now REJECTS
      Masculine / Nominative Plural. Route: ch13 → Drill → πᾶς Declining
      Drill, item 2.
- [ ] **Third Declension Translation Drill is 19 items.** Route: ch13 →
      Drill → Third Declension Translation Drill, press Next to the end.
- [ ] **ch16 Form Drill instruction line and Forms Speller field label
      change per item.** Route: ch16 → Drill → Passive Verbs Form Drill,
      compare βάλλω's two appearances; then Exercise → Passive Verbs
      Forms Spelling Exercise.

### 9.1 Listens — clips wired by inference

- **ch13 `m_voc5`** carries the Learn Introduction's three-form citation
  "πᾶς, πᾶσα, πᾶν". CHAPT_13 ships no `m_pas` lemma clip, so this is the
  vocabulary clip whose lexical form is exactly those three words.
  Confirm it recites all three.
- **ch13 `m_pasmns`** carries the πᾶς topic title and the Quick Review
  πᾶς page title. It is the chart's own masculine-nominative-singular
  cell, which is the single word those titles print.
- **ch14 `n_labp` vs `n_lamp`.** Both ship. The stem list uses `n_lamp`
  for λαμβάνω present and `n_labp` is unwired. A listen decides which is
  the present lemma.
- **ch13 `m_sm4` and `m_sm8`** are both σου in Mat 6:10a. Confirm they
  are distinct recordings.

### 9.2 Clips the pack ships that nothing plays

Report only; no action expected this round.

| Ch | Unwired |
| --- | --- |
| 13 | `m_ad5` (orphan of ch12's augment family), `m_onoss`, `m_vocl` (declared as an alias at 0x10294, played by nothing), `msargs` (missing underscore, duplicate of `m_sargs`) |
| 14 | `n_agaf1p`, `n_kri`, `n_kri1s`, `n_krif1s`, `n_labp` |
| 15 | `l_ap9`, `m_mt610`, `o_luw`, `o_nothin` |
| 16 | `m_mt610a`, `n_mt610c`, `p_balpp`, `p_eurf`, `p_ginm`, `p_krif`, `p_luwp`, `p_parp` |

One inverse case worth its own line: **ch14's SayWord table names
`n_sm7`, which the pack does NOT ship** and the six-word Mat 6:10c pool
never reaches — a dangling dispatch entry rather than a stray clip.

### 9.3 Say-all naming, four chapters four conventions

`m_vocl` / `m_vocla` / `m_voclb` (ch13), `n_vocl14` (ch14), `o_vocl15`
(ch15), `vocl16` (ch16 — no prefix at all). Worth one listen pass
alongside 9.1, and worth knowing before the final audio split/merge job
(NIT-LOG N-1 and N-6).

### 9.4 Two pipeline errors caught during data production

Recorded so the round has an honest history and so the fixes get looked
at on device.

- **ch16 Quick Review merges Mat 6:10.** The pipeline first shipped
  ch15's `Mat 6:10a` page. The original's page is titled "Review
  Scripture Memory: Mat 6:10" and joins both halves into one fourteen-word
  interlinear with its own whole-verse recording `m_mt610`. This is the
  only page in the project that joins them; chapters 14 and 15 keep 6:10a
  and 6:10c apart. Fixed before delivery — confirm the merged page reads
  correctly and its Say Whole Verse plays the full verse.
- **ch15's Translation Drill hint was the wrong charts.** The pipeline
  first gave it the Parsing Drill's aorist hint. Its own screens
  (0x11703e, 0x118df2) hold FOUR charts and the point of them is the
  aorist-versus-imperfect contrast while translating. Fixed before
  delivery — confirm the four-chart hint pages correctly and that the
  imperfect charts are the ones the original shows.

### 9.5 New shapes worth a human eye

- ch13 **Key Letter Box** — six in-chart popups, a shape no earlier
  chapter has.
- ch13 **πᾶς six-column chart** at phone width.
- ch16 **three-column Passive Stems** table with em dashes at phone width.
- ch16 **three-chart hint** paging.
- ch15 **four-chart hint** paging.

---

## 10. THE ONE-PARAGRAPH SUMMARY

Commit eight delivered data files unedited, add nine renderer capabilities
(§4), verify roughly 98 pages against their rail walks in a real browser,
run the gates in §8, and produce BUILD (with the complete git diff and
the per-turn wall-clock table), RESULTS, and VERIFY-5I (pipeline items
from §9 plus your own). Do not run git beyond `diff` and `status`, do not
touch the audio manifest, and do not edit the data except under the
visual-verification exception — reporting every such edit.
