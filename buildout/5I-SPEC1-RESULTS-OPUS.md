# 5I-SPEC1-RESULTS-OPUS.md — cohort 5I buildout handoff

Model: Opus 5 (1M context), Claude Code. Spec: `buildout/5I-SPEC1.md`.
Base: `175cfae` ("saving opus 5 generated cohort 5I before implementation"),
which already carries the eight delivered data files. Rail walks for chapters
13, 14, 15 and 16 supplied with the round.

Nothing is committed, staged or pushed. `git diff` and `git status` only.
The audio manifest is untouched: no entry added, removed or altered.

---

## 0. HEADLINE — a systematic defect in the delivered data

**Every two-line prompt in the Translation Drills of chapters 13, 14 and 16 was
attached to the wrong item.** Thirty-two items across three chapters printed a
first line from their own verse and a second line from a different one — the
Gal 1:12 screen, for instance, read

```
οὔτε ἐδιδάχθην ἀλλὰ δι' ἀποκαλύψεως Ἰησοῦ
χάριτος τοῦ θεοῦ                              <- from Eph 3:7, ten items later
```

The `greek2` values are the right SET in the right ORDER; each simply sits a
fixed number of items before the item it belongs to (chapter 13 by one,
chapters 14 and 16 by two). Chapter 15 is correct and untouched. Repaired under
the visual-verification exception and recorded in full in §3 below, with the
complete corrected mapping so the pipeline can fix it at source. **This is a
generator bug, not thirty-two typos** — a hand fix is lost at the next
regeneration, so the mapping in §3.2 is the deliverable, not the diff.

Twelve further data defects were found and fixed, all of the same family: text
the extraction pipeline emitted with its Greek font runs unconverted (`qh` for
θη, `sa` for σα, `(l and r)` for `(λ and ρ)`), and three paragraphs that
swallowed the whole panel — chart included — and printed it above the chart
that renders it properly. §3.1 lists every one with before and after.

---

## 1. WALL-CLOCK

| Turn | Started (local) | Stopped (local) | Active |
| ---- | --------------- | --------------- | ------ |
| 1    | 17:38           | 21:05           | 3h27m  |
| CUMULATIVE ACTIVE TIME | | | **3h27m** |

Recorded as each turn closed, per §1 of the spec. The table is repeated in the
BUILD document.

---

## 2. RENDERER WORK (spec §4)

Nine capabilities, plus three fixes the visual pass forced. Every one is
commented in place with the section it implements and the evidence for it.

### 2.1 §4.1 `paradigm` with `columnGroups` — the πᾶς chart

`columnGroups` validated in `check-content-shapes.mjs` and rendered as a
spanning header row over six columns. **It did not fit at 320px and this app
clips rather than scrolls**, so the shipped render lost columns silently:
measured overrun of 10px on the grid and up to 10px per cell, with the header
row printing `MASCULFEMININEUTER`. Screenshot evidence in
`buildout/screenshots/5i-walk/320/chapt_13/`.

A pager is forbidden on the Quick Review copy (DISCLOSURE-RULES §4.6) and the
spec rules it out explicitly. **What the same rule asks for instead is already
written down**: a C9 page "stacks paradigms vertically (Singular above
Plural)". So `Paradigm.svelte` now draws **one block per column group, stacked
down the page**, each headed by its group label and carrying its own copy of
the case-label column. Nothing is hidden, nothing pages, and the widest thing
on screen becomes a three-column chart. `Say Paradigm` still speaks the whole
paradigm once, beneath both halves (NIT-LOG N-1's Quick Review ruling).

At 320px: zero overflow, all 24 cells legible, all 24 taps live.

**Reported as a departure from the original's arrangement**, which prints one
six-across chart. The content is identical and complete; the arrangement is
not. It applies to all three copies of the chart (Learn topic, Quick Review
page, and the πᾶς Declining Drill hint) — chapter 13's πᾶς chart is the only
chart in sixteen chapters that declares `columnGroups`, so nothing else moved.
A judgement item is in VERIFY-5I (I-1).

Density classes now key off `effectiveColumnCount` — how many columns are on
screen at once — so a grouped six-column chart takes the three-column type
sizes rather than the crushed six-column ones.

### 2.2 §4.2 `objectivesPostamble` — NEW chapter-level key, chapter 13 only

Renders beneath the `<ol>`, in ordinary body style, outside the list. Not an
objective, not numbered. Guarded on the key's presence, so the fifteen chapters
without it are byte-identical on that surface. The card is `white-space:
pre-wrap`, so the newline between list and paragraph already draws the blank
line the original prints above "Congratulations!"; the paragraph adds no margin
of its own on top of it.

### 2.3 §4.3 `playAllGroups` — NEW contract, chapter 13's Review Vocabulary Chart

Renders exactly as ruled: five rows, a **Say List** button, five more rows, a
second **Say List** button, then the footnote. Verified in the browser that the
two buttons carry `chapt_13_m_vocla` and `chapt_13_m_voclb` respectively and
that both labels read "Say List" verbatim (chapters 14-16 keep "Say Whole
List"). `playAll` and `playAllGroups` are mutually exclusive in the renderer;
the fifteen charts using the single key are unchanged.

**One spec/data disagreement.** `c13_qr_vocab` carries `"columns": 2`, which
would lay the chart out column-major at ≥768px — and `afterRow: 5` counts down
the printed list, so at that width a button "after row 5" would land in the
middle of the chart rather than under the half it speaks. The original's own
chapter 13 page is a SINGLE column of five (ch13railwalk p16/p17) where
chapters 14-16 print two columns of five, so one column is also the faithful
shape here. The renderer therefore ignores `columns` while `playAllGroups` is
present. `columns: 2` on that activity is inert; the pipeline may want to drop
it.

### 2.4 §4.4 Per-item instructions — chapter 16's Passive Verbs Form Drill

`instructionsPerItem` suppresses the static line in `ActivityHost` and
`SelectActivity` draws the current item's line in the same slot with the same
class, so the line does not move — it only changes. `buildSelectQuestions`
carries `item.instructions` through the shuffle. The activity-level string
remains the fallback.

Walked all 22 items in the browser: βάλλω appears at items 1 and 12 with an
identical prompt panel ("βάλλω / I cast, throw") and the instruction line reads
"…matching future form" then "…matching aorist form". γινώσκω, σῴζω, δύναμαι,
ἐγείρω and εὑρίσκω likewise. Full item-by-item dump in BUILD §3.9.

### 2.5 §4.5 Per-item answer label — chapter 16's Forms Spelling Exercise

`answerLabel` on the item overrides `ui.fields[1]`. Verified across four
consecutive items: βάλλω → "Passive Aorist Form", βάλλω → "Passive Future
Form", ἀποστέλλω → "Passive Aorist Form", ἐγείρω → "Passive Aorist Form".
Chapters 14 and 15 hold their static labels ("Second Aorist Form", "Aorist
Form").

**One thing the spec did not cover, found by the visual pass and implemented.**
The three Forms spellers of chapters 14-16 are the first spellers in the app
whose prompt pane holds **Greek** (`promptIsGreek: true`, a key no earlier
speller sets), and `SpellActivity` had no path for it — the present lemma
rendered in the body face, the one thing the typography canon forbids ("no
Greek surface may use a different glyph source"). It now takes the bundled
Greek face. It stays INK and untappable: the item's clip is the ANSWER
(A1b/`afterGuess`), no present-tense clip is wired for these prompts, and blue
means tappable and nothing else.

### 2.6 §4.6 `greekRows` — five new layouts

All five implemented in `RichContent.svelte` with their own CSS, all checked at
320px and 768px against their rail-walk panels.

| layout | ch | notes |
| --- | --- | --- |
| `keyLetterBox` | 13 | 3×3 boxed consonant grid; six in-chart triggers |
| `transformation` | 13 | three labelled rule lines |
| `stemList` | 14, 15 | `lemma — aorist (gloss)`, both Greek forms tapping |
| `endingTransformation` | 15, 16 | labelled rule + indented worked example |
| `shiftSummary` | 16 | four label-less notation lines |
| `principalParts` | 16 | six labelled rows, one Greek form each |

**`keyLetterBox` triggers.** All six are live (three column headers, three row
labels), each opening its own popup. Per DISCLOSURE-RULES §3.3 they keep their
existing appearance and take **no green underline**. Computed style confirmed:
`rgb(22, 99, 199)` with `text-decoration-line: none` — blue because they are
tappable (directive 8) and nothing else. The nine consonant cells are inert
notation in the Greek face: no clip exists for any of them, the rail walk shows
no hand over one, and the chart teaches what the letters look like across three
voiced classes rather than how each sounds alone.

**`noteAudioMap`** on `endingTransformation` rows: both sides of
`διδάσκω + σα = ἐδίδαξα` tap, and the connectors between them do not.

**One judgement call worth flagging.** Chapter 14's `stemList` row for βλέπω
carries BOTH an audio clip on εἶδον and a `popupRef` on the row — the original
prints εἶδον blue with a hand cursor over it because it opens a note about
which verb that aorist really belongs to. One press cannot both speak and open
a page, so the note gets a small circled marker beside the form rather than
stealing the form's clip. VERIFY-5I item I-2.

**`principalParts`** is emitted by the data as six labelled rows and rendered
that way, per the spec's table and the data's own `_disclosure` note. The
original sets them as a three-across grid with each label over its form; six
rows is what leaves room for a label as long as "Perf mid/pass" at phone width.
Reported, not a defect.

### 2.7 §4.7 Three-column `paradigm` with mixed cells — chapter 16's Passive Stems

A `text` cell renders as inert notation: ink, no Greek face, no clip, no
button, so no screen reader offers it and no tap can reach it. `greek` and
`text` are alternatives on a cell; every chart in sixteen chapters that ships
only `greek` cells is untouched.

**Two more things this chart forced, both found at 320px.** Every row's label
is `null`, so (a) the label gutter was a blank column stealing width from three
columns of long passive forms, and (b) none of the density rules fired, because
every one of them keys off having case labels — ἀποστέλλω, ἐγερθήσομαι and
γνωσθήσομαι each printed across two lines, broken mid-word. A label-free chart
of three or more columns now reclaims the gutter and takes its own type ramp
(0.82rem at the floor, growing back to the ordinary size at 400px and 560px).
Scoped to three-plus columns so the one other label-less chart in sixteen
chapters — chapter 7's two-column εἰμί paradigm, device-verified as it stands —
is untouched. At 320px: zero overflow, all fifteen verbs and all three columns
on screen.

One trap worth recording: hiding the empty label span with `display: none` takes
it OUT of grid flow and shifts every cell in the row one column left, dropping
the last one off the edge. The span stays and sits in a zero-width track.

### 2.8 §4.8 `popups` is an ARRAY at ACTIVITY level

Confirmed in the delivered data: `c13_learn_concepts` (6), `c14_learn_second_aorist`
(1), `c14_qr_forms` (1), `c15_learn_first_aorist` (4). No topic-level `popups`
object anywhere in the four files. All twelve popup surfaces open and render
their content — proved at five device heights by `ui-modals`, not by eye.

**One orphan found and wired.** `c15_learn_first_aorist` ships a fourth popup,
`liquids`, and the topic's own `_disclosure` note says "The liquids link opens
the fourth popup" — but the paragraph carried no `[[link:liquids]]` markup, so
the popup was unreachable and rendered nothing, silently. The rail walk
(ch15railwalk p14) shows "liquids" blue with a hand cursor over it. Wired; see
§3.1 E5.

### 2.9 §4.9 Hint charts with three or more charts

Verified page by page in the browser, and every state is now its own surface in
`ui-modals` at all five device heights:

- `c15` `aoristVsImperfect` — **four** charts: Aorist Active, Aorist Middle,
  Imperfect Active, Imperfect Middle/Passive. Back/More pair, both always
  visible, Back disabled on page 1 and More on page 4, neither ever moving.
- `c16` `passiveParadigms` — **three** charts: First Aorist Passive, Future
  Passive, Second Aorist Passive. Same.
- `c15` `firstAoristParadigms` — two charts, §4.1 single toggle labelled
  Active / Middle, exactly as the spec states.
- None of these carries a say-all, so the control is centred (`no-say`,
  §4.5 of DISCLOSURE).

**One disagreement with the spec, reported rather than followed.** §4.9 lists
`c16` `passiveStemsHint` under "DISCLOSURE §4.2 applies", but that bundle holds
**two** charts (the two halves of the Passive Stems table), and §4.2 is the
three-or-more rule. Applying it would draw a permanently-greyed Back beside a
live More — the exact regression DISCLOSURE-SPEC1 W6 fixed. The port draws the
§4.1 single alternating control (More on half 1, Back on half 2; the two chart
titles are identical, so the contrast is lexical and More/Back is right per
§4.1). The spec's own next sentence — "`c15` `firstAoristParadigms` is the
two-chart case and takes the §4.1 single toggle" — agrees with this reading,
and its lead-in says "applies to **two** hints" while listing three bullets. I
read the third bullet as descriptive rather than as a §4.2 assignment.

### 2.10 §4.10 The A1c audio-leak gate — three new activities

`c14_drill_forms`, `c15_drill_forms`, `c16_drill_forms` all pick the gate up
structurally. **No per-activity flag was needed and none was added.** Measured
in the browser, before and after a guess, on all three:

| activity | prompt tappable before | Pronounce before | after |
| --- | --- | --- | --- |
| `c14_drill_forms` | no | disabled | tappable, enabled |
| `c15_drill_forms` | no | disabled | tappable, enabled |
| `c16_drill_forms` | no | disabled | tappable, enabled |

The three Forms **spellers** are excluded by ruling and confirmed excluded:
their Pronounce is live from the first item.

`ui-behavior.mjs` now sweeps chapters 13-16 alongside 1-12, so the gate, the
advance-class census, the spelling rules and the option-grid census all reach
these three drills without any of them being restated. The A1c census itself —
which derives the gated set from the data and compares it against a typed list,
so that a chapter shipping the shape unexpectedly fails rather than passes
silently — moved from **four activities to seven**, and the three that joined
are exactly `c14_drill_forms`, `c15_drill_forms` and `c16_drill_forms`. That is
the proof §4.10 asks for: the condition selected them, nothing selected anything
else, and each was then driven in the browser to confirm the gate opens on the
guess.

### 2.11 §4.11 `revealButtons` Translate on `twoStageGrid`

All four confirmed rendering and revealing inside the two-stage shape, with
both stage grids present:

| drill | Translate | reveals |
| --- | --- | --- |
| `c13_drill_pas_declining` | present, enabled | "to all" |
| `c14_drill_parsing` | present, enabled | "he/she/it became" |
| `c15_drill_parsing` | present, enabled | "I loosed myself" |
| `c16_drill_parsing` | present, enabled | "they were written" |

`buildTwoStageQuestions` already carried `translate`; no code change was needed
for this section.

---

## 3. EVERY `src/data` EDIT (the visual-verification exception)

Thirteen string edits and one structural repair, all under ONBOARD-SOL §2b rule
1 / CHAT-HANDOFF visual-verification rule 4. **Every one of them is a pipeline
bug, and every one is lost at the next regeneration unless the pipeline absorbs
it.**

### 3.1 Unconverted Greek-font runs, and paragraphs that swallowed their chart

The extraction pipeline emits ToolBook Greek font runs as the roman letters
that font maps (`q`→θ, `s`→σ, `l`→λ, `m`→μ, `n`→ν, `r`→ρ, …). Eleven strings
across three chapters shipped with those runs unconverted; four of them ALSO
carried the entire panel — chart rows included — as one run-on paragraph above
the structured block that renders the same content properly, so the page
printed everything twice, once garbled.

| # | Where | Before | After |
| --- | --- | --- | --- |
| E1 | ch14 `/learn/1/topics/1/content/1` | `…with an augment and a suffixed sa.` | `…with an augment and a suffixed σα.` |
| E2 | ch15 `/learn/1/topics/1/content/1` | `…off the present stem with an augment and a suffixed sa.` | `…a suffixed σα.` |
| E3 | ch15 `/learn/2/topics/0/content/1` | `…an augment is prefixed and an sa is affixed along with…` | `…and an σα is affixed along with…` |
| E4 | ch15 `/learn/2/topics/6/content/0` | `The sigma ending is added in basically the same way as the sigma was added for future tense verbs. Palatals (k, g, x) + s become c διδάσκω + sa = ἐδίδαξα Labials (p, b, f) + s become y βλέπω + sa = ἔβλεψα Dentals (t, d, q) + s drops the dental πείθω + sa = ἔπεισα` | `The sigma ending is added in basically the same way as the sigma was added for future tense verbs.` |
| E5 | ch15 `/learn/2/topics/6/content/2` | `With liquids (l and r) and nasals (m and n) ofen the sigma…` | `With [[link:liquids]]liquids[[/link]] (λ and ρ) and nasals (μ and ν) ofen the sigma…` |
| E6 | ch15 `/learn/2/topics/6/content/3` | one `para`: `μένω + sa = ἔμεινα ἀποστέλλω + sa = ἀπέστειλα These transformations are not always predictable. Thus it is necessary to learn the aorist for each verb.` | a `greekRows` block of the two derivations (`μένω + σα = ἔμεινα`, `ἀποστέλλω + σα = ἀπέστειλα`, each Greek form tapping its own clip from the topic's existing `audioMap`) followed by a `para` carrying the prose alone |
| E7 | ch16 `/learn/1/topics/1/content/0` | `…the sixth (last) principal part. [[u]]Present Future Aorist[[/u]] βάλλω, βαλῶ, ἔβαλον, [[u]]Perfect Perf mid/pass Aorist pass[[/u]] βέβληκα, βέβλημαι, ἐβλήθην` | `…the sixth (last) principal part.` |
| E8 | ch16 `/learn/2/topics/1/content/0` | `The aorist passives are formed by adding qh before the ending:` | `…by adding θη before the ending:` |
| E9 | ch16 `/learn/2/topics/1/content/2` | `The future passives add qhs before the ending and drop the augment. lu + qhs + n = λυθήσομαι Stem Pass Ending (I will be loosed)` | `The future passives add θησ before the ending and drop the augment.` |
| E10 | ch16 `/learn/2/topics/2/content/0` | `When a stem ends in a consonant the following changes take place when the qh is added. Palatals: k and g become x diwk + qh = ἐδιώχθην Labials: p and b become f λείπ + qh = ἐλείφθην f causes the q to drop out graf + qh = ἐγράφην` | `When a stem ends in a consonant the following changes take place when the θη is added.` |
| E11 | ch16 `/learn/2/topics/0/content/1` | `…because of the characteristic q just before the ending.` | `…the characteristic θ just before the ending.` |
| E13 | ch14 `/quickReview/1/paradigms/0` and `/hintCharts/secondAoristParadigms/charts/0`; ch15 `/quickReview/1/paradigms/0` | `"gloss": "i took"` / `"gloss": "i loosed"` | `"I took"` / `"I loosed"` |

E13 note: the rest of the case pattern in those three charts is lowercase and
was LEFT ALONE — the original's Review and hint screens really do print "we
took / you took / he/she/it took" in lower case while its Learn screens
capitalise them, and the port reproduces that. Only the English first-person
pronoun, which is never lower case in any source, was corrected.

The detection was mechanical and is repeatable: a scan for roman tokens
adjacent to `+`/`=` or standing alone beside Greek, plus a scan for a `para`
whose text contains a string that a sibling structured block also holds. Both
scripts are in the BUILD log; after the edits both come back empty across all
four chapters.

### 3.2 E12 — the Translation Drills' second prompt lines

The complete corrected mapping. In each case the delivered item's first line
ends mid-clause with no continuation while an earlier item, complete on one
line, carried it. Confirmed twice for every row: against the chapter's own rail
walk, and against the Greek.

**Chapter 13 — each line moves forward ONE item:**

| from item | to item | ref | line |
| --- | --- | --- | --- |
| 1 | 2 | Rom 1:7 | καὶ κυρίου Ἰησοῦ Χριστοῦ |
| 3 | 4 | Phil 4:23 | πνεύματος ὑμῶν |
| 4 | 5 | 2 Thes 3:18 | πάντων ὑμῶν |
| 12 | 13 | Jn 8:15 | οὐδένα |
| 15 | 16 | Mat 10:2 | ταῦτα: |

**Chapter 14 — each line moves forward TWO items:**

| from | to | ref | line |
| --- | --- | --- | --- |
| 1 | 3 | Jn 1:50 | πιστεύεις; |
| 5 | 7 | Acts 13:22 | καρδίαν μου |
| 6 | 8 | Mat 4:18 | καὶ Ἀνδρέαν τὸν ἀδελφὸν αὐτοῦ |
| 7 | 9 | Jn 17:25 | σε ἔγνων |
| 8 | 10 | Jn 9:39 | τοῦτον ἦλθον |
| 12 | 14 | Luk 2:15 | οὐρανὸν οἱ ἄγγελοι |
| 18 | 20 | Jn 3:26 | Ῥαββί ... |
| 19 | 21 | Jn 1:25 | εἶ ὁ Χριστὸς |
| 20 | 22 | Mat 26:71 | μετὰ Ἰησοῦ |
| 23 | 25 | Luk 2:46 | ἐν τῷ ἱερῷ |
| 24 | 26 | Jn 3:22 | αὐτοῦ εἰς τὴν Ἰουδαίαν γῆν |
| 25 | 27 | Jn 4:28 | ἀνθρώποις |

**Chapter 16 — each line moves forward TWO items:**

| from | to | ref | line |
| --- | --- | --- | --- |
| 1 | 3 | Acts 22:8 | με, Ἐγώ εἰμι Ἰησοῦς |
| 5 | 7 | Jn 2:19 | ναὸν τοῦτον καὶ ... ἐγερῶ αὐτόν |
| 6 | 8 | Jn 3:3 | λέγω σοι |
| 7 | 9 | Mat 15:24 | ἀπολωλότα οἴκου Ἰσραήλ |
| 8 | 10 | Mat 14:2 | ἠγέρθη ἀπὸ τῶν νεκρῶν |
| 10 | 12 | Mat 17:23 | ἐγερθήσεται |
| 11 | 13 | Mat 24:7 | ἐπὶ βασιλείαν |
| 12 | 14 | Mat 24:11 | πλανήσουσιν πολλούς |
| 14 | 16 | Mat 28:16 | Γαλιλαίαν |
| 16 | 18 | Jn 6:29 | τὸ ἔργον τοῦ θεοῦ |
| 17 | 19 | Heb 3:19 | δι' ἀπιστίαν |
| 18 | 20 | Gal 1:12 | Χριστοῦ |
| 20 | 22 | Eph 3:7 | χάριτος τοῦ θεοῦ |
| 25 | 27 | Rom 10:13 | σωθήσεται |
| 26 | 28 | Jn 1:49 | τοῦ θεοῦ |

**Chapter 15's sixteen continuation lines are all correct** and were not
touched — which is itself a useful fact for the pipeline: whatever produced the
offset did not fire on that chapter.

After the move the counts are exact in every chapter: as many continuation
lines as there are items whose first line ends mid-clause, with none left over
and none missing.

---

## 4. WHERE THE RAIL WALK AND THE SPEC DISAGREED

Reported, per §0 of the spec, rather than silently followed either way.

1. **§4.9's third bullet** puts `c16 passiveStemsHint` under DISCLOSURE §4.2
   while the bundle holds two charts. Implemented as §4.1. Full reasoning in
   §2.9 above.
2. **§4.3 vs the data's `columns: 2`** on `c13_qr_vocab`. The original's own
   chapter 13 Review Vocabulary Chart is one column of five (ch13railwalk
   p16/p17) where chapters 14-16 print two columns of five. Implemented as one
   column; `columns: 2` is inert while `playAllGroups` is present. §2.3 above.
3. **The original's six-across πᾶς chart** does not fit at the supported
   width. Stacked by column group. §2.1 above; VERIFY item I-1.
4. **ch14/15's "Verb Forms" hint charts put the English gloss in the ROW-LABEL
   gutter**, i.e. to the LEFT of the two Greek forms, where the original prints
   it to the right (`ἀπέρχομαι -- ἀπῆλθον (I departed)`, ch14railwalk p10). The
   data models it as a two-column paradigm with the gloss as the row label. Not
   changed — it is a legitimate chart shape and a hint surface — but it is an
   arrangement divergence from the original and the pipeline may want the
   three-column `stemList` shape it uses on the Learn page instead.
5. **ch14's and ch15's Aorist Stems pages, and ch16's Passive Stems page, stack
   both halves** where the original pages them behind More/Back on a LEARN
   page (paging is permitted there). That is the pipeline's own decision,
   recorded in each topic's `_disclosure`, and the port renders what it was
   given. Noted so it is not mistaken for a renderer omission.

---

## 5. THINGS I BELIEVE ARE WRONG IN THE DELIVERED DATA (not fixed)

Reported, not touched, per §0.

1. **ch13 `_audioVerify` names a clip that does not exist.** It asks for a
   listen on "m_pas (confirm it recites pas, pasa, pan and not pas alone)", and
   `chapt_13_m_pas` is not in the manifest — the pack has no such clip. The
   spec's §9.1 has the right account: the three-form citation is carried by
   `m_voc5`, the vocabulary clip whose lexical form is exactly those three
   words. The same note also says the Review chart plays "vocl13a/vocl13b"
   where the data and the manifest both say `m_vocla` / `m_voclb`. A stale
   note, not a data error, but it will mislead the next reader.
2. **`c13_qr_vocab` carries `columns: 2`** — see §4 item 2 above.
3. **ch16 δύναμαι** ships `--` in the Passive Stems chart and δυνήσομαι as the
   Form Drill's key, exactly as §7 of the spec says it should. Rendering both
   as delivered; flagged here only so the VERIFY reader knows it is deliberate.

---

## 6. GATES (spec §8)

Every gate run against the final tree. Names in the spec use hyphens
(`npm run ui-behavior`); the package scripts use colons (`npm run ui:behavior`).

| gate | result |
| --- | --- |
| `npm run check:shapes` | **PASS** — all 16 chapters |
| `npm run check:lazy-chunk` | **PASS** — 16 chapter + 16 lexicon chunks emitted and precached, chapter data out of the main bundle |
| `npm run build` | **clean**, 49 precache entries, no warnings |
| `npm run ui:behavior` | **1227/1227** (was 1125/1125 over chapters 1-12; +102 from the four new chapters joining the sweep) |
| `npm run ui:modals` | **480/480** modal states clean at five device heights (was 270/270; +210 from this cohort's 42 new surfaces) |
| `npm run ui:disclosure` | **303/303** |
| `npm run ui:disclosure3` | **100/100** (was 84/84 over chapters 1-12) |
| `npm run ui:walk` (13-16) | **98 rail stops × 2 widths, 129 pages**; zero horizontal overflow at 320px, zero console errors, every rail count and Next action live, every authored expander and chart state opened |
| `npm run ui:walk` (1-12 regression) | **270 stops × 2 widths, 372 pages**; zero overflow, zero console errors |
| `node scripts/ui-offline.mjs --chapters=chapt_16` | SW installed, offline: **25 stops rendered, 0 missing, refresh OK**, no console errors |
| `npm run check:docs` | **43 failures** — the pre-existing CRLF-guard baseline, unchanged before and after this round's work |

`check:docs` reports 43 rather than the ~44 the handoff records; the count at
`175cfae` is 43 before any of my changes, so the drift is between commits, not
mine. The list of failing files is identical before and after this round.

Disk was checked before trusting any gate that reads `dist`: the tree was
rebuilt immediately before each run and `dist/assets` carries this build's
hashes (the lazy-chunk PASS above names them).

### 6.1 Harness changes made in the same round as the code (ONBOARD §7)

- `ui-walk.mjs`: chapters 13-16 join the DEFAULT chapter list, so `npm run
  ui:walk` with no arguments covers them.
- `ui-behavior.mjs`: chapters 13-16 join `CHAPTERS`, which is what carries the
  A1c gate and every census onto the new drills. Two asserted sets moved with
  them: the A1c census 4→7 (§2.10), and the 5E-R1 replaced-heading allowlist,
  which named chapter 11 alone. Chapter 13's πᾶς topic is the same shape — the
  topic named for the original's radio label ("πᾶς Adjective"), the panel headed
  with the chart's own title ("πᾶς (all) Forms") — and the surface assertion
  beneath it (exactly ONE heading prints, the fuller one) passes for chapter 13
  on its own. The allowlist now names both chapters rather than being dropped:
  it is what stops a genuinely doubled heading passing as "just another
  replacement".
- `ui-disclosure3.mjs`: sweeps chapters 1-16; census numbers moved 270→368
  activities, 115→154 ledger rows, 15/251/4 → 19/345/4 classification.
- `ui-disclosure.mjs`: the `poolKind` census moved 12→20 drills (all 20 behave
  correctly; only the asserted count was stale).
- `ui-modals.mjs`: **42 new surfaces** — all six Key Letter Box popups, the
  stem-list popup from both its hosts, chapter 15's four sound popups, every
  state of every new hint bundle, and a speller and verse-speller keyboard per
  chapter. Two new helpers: `hintState` (steps a 3+ bundle with its Back/More
  pair) and `chartTrigger` (presses an in-chart C3 trigger on a topicPages
  surface).
- `ui-modals.mjs` assertion widened: `hintTogglePinnedOk` measured only
  `[data-hint-paradigm-toggle]`, the two-state single control. Chapter 15's
  four-chart hint and chapter 16's three-chart one are the first 3+ bundles
  ever to appear inside a modal, and they draw the Back/More pair instead — so
  the harness reported them BAD for drawing the control DISCLOSURE-RULES §4.2
  requires. It now measures whichever control the state draws and applies the
  same pinning assertion to it.
- `check-lazy-chunk.mjs`: chapters 13-16 added, with needles unique to one
  chapter file each (chapters 14 and 15 open with the same English-concepts
  paragraph, so neither may be keyed on it).

---

## 7. VISUAL VERIFICATION (spec §3)

Every page loaded in a real browser at 320px and 768px and compared against its
rail-walk panel: **129 pages per width, 258 captures**, in
`buildout/screenshots/5i-walk/`, plus 372 regression pages for chapters 1-12 in
`buildout/screenshots/5i-walk-regression/` and 480 modal captures at five
heights in `buildout/screenshots/modals-*/`.

What the pass covered beyond "the page loads": every topic step of every
`topicPages` activity as its own capture; every accordion opened; every
`charts[]` state traversed; every modal opened and then scrolled to its end to
prove the pinned row does not move; the six Key Letter Box popups pressed
individually; all 22 items of chapter 16's Form Drill stepped through to read
its instruction line; four consecutive items of its Forms Speller stepped
through to read the answer-field label.

Findings from that pass are §2.1, §2.5, §2.7 (renderer) and all of §3 (data).
Everything else matched.

**Overflow is reported in pixels, not as a boolean**, because this app clips.
Final state: zero at 320px on all 98 new rail stops and all 270 old ones.

---

## 8. OPEN QUESTIONS THIS BUILD RAISED

Carried into VERIFY-5I as items I-1..I-6; repeated here so the handoff is
self-contained.

1. The stacked πᾶς chart (§2.1) — a deliberate departure from the original's
   six-across arrangement, forced by the 320px floor and by the no-pager rule.
   Wants a look on the device before it is treated as settled.
2. The circled note marker beside chapter 14's εἶδον (§2.6) — one press cannot
   both speak a form and open a page.
3. Whether ch14/15's Verb Forms hint charts should carry their gloss on the
   right, as the original prints them, rather than in the row-label gutter
   (§4.4 above). Pipeline question, device judgement.
4. Whether `c13_qr_vocab` should keep `columns: 2` at all (§2.3).
5. The lower-case gloss pattern on the three charts of §3.1 E13 — the port now
   reproduces the original's own inconsistency between its Learn and Review
   screens. Worth one look to confirm that is really what the original does.
6. The two derivations restored in §3.1 E6 render at the generic `greekRows`
   equation size, one step larger than the worked examples in the chart above
   them, and `ἀποστέλλω + σα = ἀπέστειλα` wraps at 320px. Correct and complete,
   but it is the one block on that page that does not sit at the size of its
   neighbours.

---

## 9. WHAT I DID NOT DO

- No git beyond `diff` and `status`. Nothing committed, staged or pushed.
- No change to `public/audio/audio-manifest.json`. Every clip the four chapters
  name resolves; `check:shapes` proves it.
- `apply-behavior-matrix.py` not run; no `audioTiming` or `advanceClass`
  re-derived. Every behaviour field is as delivered.
- `toc.json` and `content.js` untouched — the glob registers the four files by
  itself, and `check:lazy-chunk` now proves all sixteen chunks emit.
- No pipeline document edited: DIVERGENCE-LOG, NIT-LOG, DRILL-BEHAVIOR-RULES,
  DISCLOSURE-RULES and the assemblers are the pipeline's, and the departures in
  §2.1 and §4 above are reported here for the pipeline to log rather than
  logged by me.
