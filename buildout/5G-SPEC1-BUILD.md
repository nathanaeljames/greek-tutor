# 5G-SPEC1-BUILD.md — the round's diff

Cohort 5G, one round, one implementer. Chapters 9 and 10.
Prose lives in `5G-SPEC1-RESULTS.md`; the page-by-page comparison
against the two rail walks lives in `5G-VISUAL-CHECKLIST.md`. This
document is the evidence the grading pipeline audits.

Nothing was pushed and nothing was committed. The diff below is
`git diff` for the whole round against the commit it started from
(`631aa7e`, "adding 5G-SPEC1 and chs9-10 data").

**Six data-file edits appear in this diff**, in `src/data/chapt-09.json`
and `src/data/chapt-10.json`. They are NOT a relaxation of ground rule
2: every one is a defect the page-by-page comparison against the rail
walks found, made under the standing exception that authorizes exactly
that (CHAT-HANDOFF, data-file process rule as amended 2026-07-28), and
every one is listed with before/after in `5G-SPEC1-RESULTS.md` §4 so
the pipeline can absorb it. One of them — 31 audio ids keyed in the
TBK dispatch key's mixed case against a lowercase manifest — was
blocking: the whole of chapter 10's Future Indicative Translation Drill
would have toasted "Audio not found" on device.

`public/audio/audio-manifest.json` is UNCHANGED. The manifest is frozen
for this round (spec §0) and `git status` shows nothing under
`public/audio/`.

## Checks at the end of the round

```
npm run check:shapes      PASS    10 chapters
npm run build             PASS    37 precache entries
npm run check:lazy-chunk  PASS    10 chapter chunks + 10 lexicon chunks
npm run ui:behavior       849/849 behavior checks passed
npm run ui:walk           walked 219 stops x 2 widths -> buildout/screenshots/5g-walk
npm run ui:offline        offline: 44 stops rendered, 0 missing, refresh OK
npm run ui:modals         115/115 modal states clean -> buildout/screenshots/5g-modals
```

The three new TEXT files of the round — `scripts/ui-offline.mjs` and
the two round documents — are marked intent-to-add so they appear in
the diff in full; nothing is staged for commit. The two screenshot
corpora are binary and are listed rather than inlined:

- `buildout/screenshots/5g-walk/` — 219 rail stops x 2 widths across
  all ten chapters, plus every topic, expander, chart state, popup and
  Hint reached from them, and `walk-report.json`.
- `buildout/screenshots/5g-modals/` — 115 modal states over five device
  heights, both at rest and scrolled to the end of their content.

## Summary

```
buildout/5G-SPEC1-RESULTS.md             | 490 ++++++++++++++++++++++++++++++
 buildout/5G-VISUAL-CHECKLIST.md          | 198 ++++++++++++
 buildout/DIVERGENCE-LOG.md               |  57 +++-
 package.json                             |   1 +
 scripts/check-content-shapes.mjs         | 145 ++++++++-
 scripts/check-lazy-chunk.mjs             |   4 +-
 scripts/ui-behavior.mjs                  | 505 ++++++++++++++++++++++++++++++-
 scripts/ui-modals.mjs                    |  29 ++
 scripts/ui-offline.mjs                   |  67 ++++
 scripts/ui-walk.mjs                      |  74 ++++-
 src/app.css                              | 111 +++++++
 src/components/ContentAudio.svelte       |  74 ++++-
 src/components/Marked.svelte             |  15 +-
 src/components/PopupSheet.svelte         |  12 +
 src/components/RichContent.svelte        | 117 +++++--
 src/components/SelectActivity.svelte     | 109 +++++--
 src/components/SpellVerseActivity.svelte |  51 +++-
 src/data/chapt-09.json                   |   2 +-
 src/data/chapt-10.json                   |  83 ++---
 src/lib/content.js                       |  85 +++++-
 src/lib/greek.js                         |  19 ++
 src/lib/markup.js                        |  33 +-
 src/lib/popups.js                        |  22 +-
 23 files changed, 2160 insertions(+), 143 deletions(-)
```

## The diff

```diff
diff --git a/buildout/5G-SPEC1-RESULTS.md b/buildout/5G-SPEC1-RESULTS.md
new file mode 100644
index 0000000..2da6b55
--- /dev/null
+++ b/buildout/5G-SPEC1-RESULTS.md
@@ -0,0 +1,490 @@
+# 5G-SPEC1-RESULTS.md — chapters 9 and 10
+
+Implementer round, cohort 5G, written against `5G-SPEC1.md` section by
+section. Nothing is pushed and nothing is committed; the working tree
+holds the round.
+
+---
+
+## 0. Summary
+
+Both chapters are built, rail-ordered and reachable: 22 stops each, 44
+in all, every activity in `sequence` exactly once, every id resolving.
+`npm run verify` passes end to end — shapes, build, and the lazy-chunk
+split now asserted for all **ten** chapters.
+
+The eight renderer novelties of §4 are all in, and two of them needed
+less code than the spec expected: `twoStageGrid` already mapped
+`optionStages` as an array, so the three-stage drill needed only the
+per-stage `optionGroups` and the `translate` field the builder was
+dropping (§2.1). The commit rule needed no change at all — "commit when
+the last empty stage is filled" was already written that way in
+5F.
+
+**Six data defects were found by holding the pages next to the rail
+walks, and all six are fixed in the data** under the standing visual
+verification authorization (CHAT-HANDOFF, "amended 2026-07-28"). One of
+them was blocking: 31 of chapter 10's translation-drill clips were
+keyed with the TBK dispatch key's mixed case (`j_TvD1`) against a
+manifest that is lowercase throughout, so the entire drill would have
+toasted "Audio not found" on device. They are listed with before/after
+in §4, and every one is a pipeline-side fix, not a local repair to be
+carried.
+
+Three divergences are logged: **D-40** (one heading where a chart's
+title says the topic's and more), **D-41** (the three-stage grid is
+stacked, not columned) and **D-42** (the modelled "Repeat This
+Exercise" semantics, pending VERIFY-5G (d)). **D-32** is extended to
+cover chapters 9 and 10's vocabulary grids.
+
+One conflict between the spec and the data is flagged rather than
+improvised around: **§2.4 describes chapter 9's Parsing Drill as a
+two-stage `twoStageGrid` and the delivered data is a single-stage
+`fullOptionGrid`** — and the rail walk agrees with the data. §5.1.
+
+---
+
+## 1. What was built
+
+The four data files were already committed; the chapters were picked up
+by the existing `import.meta.glob` registry with no per-chapter wiring,
+exactly as chapters 6-8 were.
+
+| | learn | drill | exercise | quickReview | rail stops | distinct clips |
+|---|---|---|---|---|---|---|
+| chapter 9 | 6 | 5 | 3 | 8 | 22 | 124 |
+| chapter 10 | 6 | 5 | 4 | 7 | 22 | 159 |
+
+The clip counts are one higher than the spec's table in each chapter
+(123 / 158); the difference is arithmetic, not content — every id the
+two files name resolves in `public/audio/audio-manifest.json` and
+nothing was added to it. **The manifest is untouched this round**, as
+§0 of the spec requires; `git status` shows no change under
+`public/audio/`.
+
+`scripts/check-lazy-chunk.mjs` proved the split for eight chapters and
+now proves it for ten: ten chapter chunks, ten lexicon chunks, all
+precached, no chapter data in the index bundle.
+
+---
+
+## 2. The renderer novelties (§4)
+
+### 2.1 `twoStageGrid` generalizes to N stages (§4.1)
+
+Almost free. `buildTwoStageQuestions` already mapped `optionStages`
+with no arity assumption, `stagePicks` was already `stages.map(...)`,
+and `chooseStage` already committed on "no stage is still null". Three
+things were missing:
+
+- **per-stage `optionGroups`.** Chapter 10's person/number stage
+  declares `[2, 2, 2]` and the original draws it as three paired rows.
+  The builder now carries `stage.optionGroups` through and the surface
+  renders that stage in the same `.option-groups` shape an
+  activity-level `optionGroups` gets.
+- **`translate`.** Chapter 10's parsing drill carries per-item
+  translations and lists a Translate button; the two-stage builder
+  never carried the field, so the control rendered permanently
+  disabled — a button the original has that does nothing. Fixed;
+  asserted in ui-behavior G1.
+- **the activity-level `note`.** "Remember that most verbs marked with a
+  middle ending are deponent..." is a standing aside about the drill,
+  so it renders in the note banner beside the controls, never above the
+  prompt (directive 2).
+
+Layout is D-41: the original's three side-by-side columns become three
+stacked stages in the same reading order, separated by the dark-green
+rule the grouped option stacks already use. Nothing about the commit
+rule changed, which is the point — ui-behavior G1 re-asserts the whole
+of VERIFY-5F item 7 against three stages (fill two, nothing is judged;
+change stage 1 freely; the tuple commits on the last EMPTY stage in
+whatever order it is filled; wrong tuple reveals, waits and stays).
+
+### 2.2 Topic rail hidden for single-topic pages (§4.2)
+
+This port draws no radio rail; its equivalent is the Previous Topic /
+"1 of N" / Next Topic stepper. With one topic that is three dead
+controls, so `topicPages` renders none when `topics.length === 1`. The
+seven-topic page next door still steps, which is what ui-behavior G3
+pins so the rule stays scoped.
+
+### 2.3 Popups are `content[]` block lists (§4.3)
+
+`PopupSheet` gained one branch: a `content[]` popup renders through
+`RichContent`, the same renderer the teaching topics use. The three
+flexible-dict fields chapters 6-8 ship are untouched.
+
+Two link routes reach them, both NAMED by the data:
+
+- **`[[link:id]]` inline markup** (new in `lib/markup.js` /
+  `Marked.svelte`). Chapters 6-8 could resolve a link from the
+  underlined run's own slug because the run text WAS the popup's title;
+  chapters 9 and 10 link ordinary words to popups titled something else
+  ("punctiliar" -> "Punctiliar (single point in time)"), so the target
+  is named outright.
+- **`titleLink` on a topic**, for chapter 9's Deponent Verbs heading,
+  which is the link in the original too.
+
+A link run that resolves to nothing renders as PLAIN TEXT, never as a
+dead blue word (directive 8), and `check-content-shapes` now fails the
+build on any `[[link:id]]` or `titleLink` that names no popup on its own
+activity — the popup register is per-activity, so an id that exists
+elsewhere is still a dangling link.
+
+**One fidelity restoration came out of this.** The chapters 6-8 slug
+route fired on a coincidence: chapter 9 underlines the lead-in
+`deponent:` inside a numbered teaching point and also ships a
+`deponent` popup, so the port turned a plain black underline blue. The
+slug route is now scoped to the popup SHAPE it was built for — a popup
+written as `content[]` is reached only by a link the data names. Chapter
+8's three underline-slug links still resolve (verified on the surface).
+
+### 2.4 `presentFutureRows` (§4.4)
+
+One block, two printed forms, because the original prints it two ways
+and the difference is exactly whether the chart is headed:
+
+- **headed** -> a two-column chart under Present / Future, each form's
+  gloss on its own line beneath it (the Deponent and Irregular Futures
+  topics).
+- **unheaded** -> one derivation per line, `ἔχω ==> ἕξω`, gloss beside
+  it (the five stem-variation popups).
+
+A block may also declare `layout: "arrow" | "columns"` outright. Greek
+cells are tap targets on both sides; glosses are ink (directive 9).
+
+### 2.5 `repeatCheckbox` on `spellVerse` (§4.5)
+
+Present only where the data declares it. Default OFF. A successful
+Check Answer plays the whole verse (rule C7 as always) and then, only
+when the box is checked, clears the slate — the replay finishes BEFORE
+the slate clears, and a Restart or an unmount cancels the pending clear
+through the same token pattern `SelectActivity` uses for advances.
+Completion is recorded on the first success and the repeat pass does
+not touch it.
+
+**The harness deliberately asserts only the control's presence and its
+default** (ui-behavior G9), because §4.5's semantics are extrapolated
+and VERIFY-5G item (d) is what settles them; pinning a guess as though
+it were the original is how 5E got 23 of 50 behavior rows wrong. §7 of
+the spec says the same. D-42.
+
+### 2.6 `numbered` with hard line breaks (§4.6)
+
+The block already existed; what was new is an item carrying its own
+line breaks. Chapter 10's stem variations put the rule on line one and
+its formula on line two, indented under it. Lines are SPLIT rather than
+left to a `white-space` rule, because the original indents the
+continuation further than the item text and no white-space rule can
+reach one line inside a flow. A single-line item renders exactly as
+before — the wrapper span is inline until there is a second line — so
+no list in chapters 1-8 moved.
+
+Brackets and `==>` pass through as text. They are the original's own
+notation and are never interpreted.
+
+**This reached back into chapters 1, 4 and 5, and I checked all three
+against their rail walks before leaving it that way.** Three numbered
+items already carried `\n` and the renderer had been collapsing it to a
+space:
+
+- **chapters 4 and 5, the Case topic.** The original sets the example
+  sentence on its own indented line under its label — "Subjective case
+  (Gk: nominative):" over "He hit the ball." (ch4railwalk p2-3). The
+  port had been running them together on one line. That is a fidelity
+  RESTORATION, so it is not logged as a divergence, but it does change
+  two device-verified pages and is called out here.
+- **chapter 1, Six Points.** Its pronunciation note carries `\n\n` — a
+  PARAGRAPH break, not a set-apart line. So the two are distinguished:
+  a single `\n` indents the next line under this one, a blank line is
+  air with no indent. Without that distinction chapter 1's second
+  paragraph would have picked up an indent it never had.
+
+### 2.7 Centred formula para (§4.7)
+
+`align: "center"` plus embedded `\n` already had both halves in the
+renderer (`rc-center`, `example-block`); the combination needed nothing
+new. The formula letters carry no audio wrapper and stay plain text.
+
+### 2.8 `hintCharts` composite (§4.8)
+
+`resolveHintRef` learned the chapter-level `hintCharts` register first,
+so a composite id can never be shadowed by an activity or topic sharing
+its name. `paradigmRefs` resolve through the same resolver, recursively,
+and the result is a `{ paradigms: [...] }` bundle the drill surface
+renders as a **stack**: both charts on screen under one Close, which is
+what p7-1 of both rail walks shows (one Cancel over both). No cycling is
+wired; VERIFY-5G (h) is what would add any.
+
+The same question — stack or pager — arises for the Quick Review pages,
+and the data answers it: a paged stack NAMES each chart (the name is
+what the More/Back control and `data-chart-name` report), a stacked pair
+has no names because nothing is being switched between. Chapter 8's
+three-chart More/Back sequence is unaffected and is pinned as such.
+`check-content-shapes` fails a MIXED stack, which is the only shape the
+renderer could not choose for.
+
+---
+
+## 3. Audio (§5)
+
+Read, not re-derived. The shifted `j_tvd` table, the `j_epa*` /
+`j_eimi*` inversion, item 18's restored clip and the ignored sm12-14
+entries are all data facts; the port wires what the data says and
+nothing in the renderer knows any of it. `i_mpar`, `i_voc11`, `l_eimi`,
+`j_TvD2` and `j_palp` are VERIFY-5G listens, unchanged.
+
+Every audio id either chapter names exists in the manifest — which is
+how §4.1 below was caught.
+
+---
+
+## 4. Data defects fixed under the visual-verification authorization
+
+Standing rule: implementers do not edit data, EXCEPT where visual
+verification finds obviously missing formatting or text, which must
+then be reported with before/after so the pipeline can absorb it. Six
+qualify. All six are pipeline-side; none is a local repair to carry.
+
+### 4.1 chapter 10: 31 audio ids in the wrong CASE (BLOCKING)
+```
+- "audio": "chapt_10_j_TvD1"      (and TvD3 .. TvD32)
++ "audio": "chapt_10_j_tvd1"
+```
+Audio ids are lowercase throughout — the ISO-path contract in
+`src/lib/audio.js`. The assembler emitted the TBK dispatch KEY verbatim,
+so every item of the Future Indicative Translation Drill pointed at a
+clip that does not exist under that name. `check-content-shapes` caught
+it (the manifest-existence rule added in 5F), but its message said only
+"not in the manifest", which sends the reader hunting for a missing
+file that is right there; the check now says "…but the lowercase id IS —
+fix the case".
+
+### 4.2 chapter 9: `ωηατ͂̔` where the original prints `what?"`
+```
+- "text": "\"Zach is hit by ωηατ͂̔ — the ball."
++ "text": "\"Zach is hit by what?\" — the ball."
+```
+Panel p1-4. The Greek-font converter took the Latin `what` for `ωηατ`
+and the `?"` for a circumflex-plus-rough-breathing stack — the same
+class the assembler docstrings warn about for formula fields
+("English 'go?' matches the circumflex byte pattern"), reaching a
+teaching field. The line is the point of the whole topic and it rendered
+as nonsense Greek.
+
+### 4.3 chapter 10: a dropped gloss word
+```
+- "future": { "greek": "γνώσομαι", "gloss": "I will" }
++ "future": { "greek": "γνώσομαι", "gloss": "I will know" }
+```
+Panels p5-4 / p6-1 print "I will   know" — the gap is two runs in the
+field and only the first was taken. The Irregular Futures chart has the
+same word pair right, which is what made the difference visible.
+
+### 4.4 chapter 10: four chart titles missing their last word
+```
+- "title": "Future Active Indicative"      (x2: learn topic + QR copy)
++ "title": "Future Active Indicative Paradigm"
+- "title": "Future Middle Indicative"      (x2)
++ "title": "Future Middle Indicative Paradigm"
+```
+Panels p2-1, p2-3, p7-1. Same class as §4.3.
+
+### 4.5 chapter 10: the English Concepts quotes belong on their own line
+```
+- "text": "In the past we say, \"We went to college.\""
++ "text": "In the past we say,\n     \"We went to college.\"",
++ "flush": true
+```
+Panel p1-3 sets each quoted sentence on its own indented line under its
+lead. Written as ONE para block with a `\n` — the Stage 8.1-sanctioned
+shape for a hard break inside a paragraph — not as new blocks.
+
+### 4.6 chapter 10: one word too many in an instruction line
+```
+- "instructions": "Click on the correct English translation"
++ "instructions": "Click on the correct translation"
+```
+Panel p7-4 of the chapter-10 walk; chapter 9's equivalent panel does
+print "English" and the chapter-10 data had chapter 9's wording.
+Instruction text is directive-1 content and is not ad-libbed in either
+direction.
+
+---
+
+## 5. Where the spec and the delivered data disagree
+
+### 5.1 Chapter 9's Parsing Drill is one stage, not two
+
+§2.4 says "twoStageGrid, 2 stages (Voice, Person/Number), 16 items,
+commit on final click". The delivered `c9_drill_parsing` is
+`mode: "fullOptionGrid"`, `options: "static"`, six person/number values
+with `optionGroups: [2,2,2]`, instruction line "Click on the matching
+person and number", and no voice stage anywhere. Panel p6-4 of the rail
+walk shows exactly that: one 2x3 grid, no voice column.
+
+§0 says the spec wins over a rail walk. It does not say the spec wins
+over the DATA, and the data is what the renderer reads: implementers
+never edit data files, and inventing a voice stage would mean authoring
+sixteen answers the chapter does not contain. **Built as delivered —
+one stage, three paired rows — and flagged here.** Chapter 10's parsing
+drill is the genuine three-stage one and it is built as three stages.
+
+### 5.2 Irregular Futures headers
+
+§3.2 says both Deponent and Irregular Futures carry underlined
+Present/Future headers, and the data marks both. Panel p6-2 shows the
+Irregular Futures headers NOT underlined. The spec wins per §0 and the
+port underlines both; worth a keep-or-fix decision alongside items (e)
+and (f). (Visual checklist §4.)
+
+### 5.3 The Quick Review verse counts in §2.8 and §3.7 are off by one, both ways
+
+§2.8 says chapter 9's Quick Review carries "five interlinear verses";
+the data carries six (Jn 14:6a, Jn 14:6b, Rom 3:23, Jn 1:1, Rom 6:23a,
+Rom 6:23b) and the original's Quick Review menu (rw9 p14-2) lists
+exactly those six. §3.7 says chapter 10 carries "SIX"; the data carries
+five and the original's menu (rw10 p15-2) lists five. Built as
+delivered in both chapters — the data and the rail walks agree with
+each other. Same class as the clip counts in §1: arithmetic in the
+spec's prose, not a content question.
+
+### 5.4 Neither rail walk DRAWS the "Repeat This Exercise" checkbox
+
+§4.5 says the checkbox is "present in both ch9 and ch10 originals on the
+SM speller page", and the data records the label's address in the TBK
+(`0x64d0c` / `0xba6ec`). The panels do not show it: rw9 p13-2 and rw10
+p14-2 both draw exactly one checkbox, "With Accents", beside Major Hint
+/ Pronounce / Check Answer / Greek Keyboard and the Previous Page /
+Next Page pair. A label can exist in a TBK page record without the page
+drawing it, and both panels are captured on page ONE of a paged entry
+surface, so it may simply be on the second page.
+
+Built as the spec says (§0), default OFF, so nothing on the page changes
+until a learner checks it. **This matters for VERIFY-5G (d):** if the
+control is not drawn in DOSBox, item (d) cannot be answered by clicking
+it, and the answer is instead "the original has no such control", which
+would retire D-42 rather than correct it. Worth knowing before that
+pass starts.
+
+### 5.5 Chapter 9's Scripture Memory speller has no page pair
+
+The original's SM speller carries Previous Page / Next Page (panel
+p13-2); the port's `spellVerse` has been a single field since chapter 3
+and the delivered `ui.buttons` does not list them. No change made; noted
+because it is a visible difference from the panel that predates this
+cohort.
+
+---
+
+## 6. Acceptance
+
+| check | result |
+|---|---|
+| `npm run check:shapes` | PASS, ten chapters |
+| `npm run build` | clean; 37 precache entries |
+| `npm run check:lazy-chunk` | PASS, ten chapter + ten lexicon chunks, all precached, no chapter data in the index bundle |
+| `npm run ui:behavior` | 849/849, up from 683/683 at the start of the round |
+| `npm run ui:walk` | 219 rail stops x 2 widths, all ten chapters: no horizontal overflow, no rail errors, no interaction errors, no console errors |
+| `npm run ui:modals` | 115/115 modal states clean over five device heights (was 85/85; the six new 5G surfaces add 30) |
+| `npm run ui:offline` | 44 stops rendered offline, 0 missing, refresh on an activity route OK, no console errors |
+| visual comparison against both rail walks | done, `5G-VISUAL-CHECKLIST.md` |
+
+### 6.1 What those runs cover
+
+- **behavior** — every sweep in the file now runs over ten chapters, and
+  the 5G section adds G1-G9 (§7). The three-stage drill is asserted on
+  all four of its paths, the paired grids on both the new chapters AND
+  chapter 3 (which must NOT pair), the stacked Quick Review pair on both
+  new chapters AND chapter 8 (which must stay a pager).
+- **walk** — every rail stop of every chapter at 320px and 768px, every
+  topic stepped, every expander opened, every chart switched, and — new
+  this round — every popup opened, screenshotted and cancelled. Zero
+  console errors, zero rail errors, zero interaction errors and zero
+  horizontal overflow is the pass condition; anything else fails the
+  run.
+- **modals** — every modal surface at five device heights, including
+  the six new 5G ones. The composite Hint is now the tallest dialog in
+  the app and it fits at rest at all five heights with its Close pinned.
+- **offline** — service worker installed, network cut, both new
+  chapters' rails walked, and a refresh on an activity route. This is
+  the preview half of directive 4; the device half stays Nathanael's.
+
+---
+
+## 7. Harness changes
+
+- **chapters 9 and 10 join every sweep.** They are in `CHAPTERS` (so
+  every census, ledger read-back, spelling rule and elision check covers
+  them) and in the 5F ledger read-back set, which reads
+  `audioTiming`, the Pronounce-Each default and the Previous/Next pair
+  back off the shipped surface for all 17 of the cohort's scored
+  activities.
+- **a zero-padding bug that would have thrown on chapter 10.**
+  `ui-walk.mjs` and `ui-behavior.mjs` both built their data paths as
+  `` `chapt-0${n}.json` `` — correct for exactly the nine chapters that
+  existed when it was written, `chapt-010.json` for this one.
+- **`ui-walk.mjs`'s cohort gate was a hard-coded `/^chapt_[45]$/`**, so
+  cohort 5F walked chapters 6-8 and reported checklist evidence and
+  320px overflow for neither. It now defaults to every chapter WALKED,
+  with `--focus=` to narrow. A cohort gate written as a chapter number
+  rots silently at the next cohort, and silence is the failure mode that
+  script exists to break.
+- **`ui-walk.mjs` now opens every popup on every page it walks**, and
+  fails the walk if one opens nothing, has no Cancel, or does not close.
+  `ui-modals.mjs` photographs a hand-listed set at five device heights
+  to judge SIZING; nothing walked all of them. Five 5G surfaces are
+  added to the modal list too, including the composite Hint, which is
+  now the tallest dialog in the app.
+- **two existing sweeps assumed something a new chapter broke, and both
+  are generalized rather than exempted.** The Say-Whole census matched
+  a BUTTON NAMED `/^Say Whole/` — chapters 9 and 10 print the original's
+  own "Say Paradigm" and the check read that as a missing control; it
+  matches the `.pg-say-whole` control now, because the wording is the
+  original's business chapter by chapter. And the option-grid census
+  asserted that a `grouped` layout is always one option per line, which
+  is chapter 3's answer, not the rule; it now asks the same question the
+  renderer asks (label length).
+- **new: 5G section, G1-G9** — the three-stage commit in all four of
+  its paths, the paired ch9 grid (plus the ch3 regression pin that
+  proves long labels still stack), the single-topic page (plus the
+  seven-topic page next door), both popup link routes and both popup
+  shapes, `presentFutureRows` in both printed forms, the compound-verb
+  suffix playing its own clip, the composite Hint on all four drills,
+  the stacked Quick Review pair (plus the ch8 pager pin), and the
+  Repeat checkbox's presence and default.
+- **`npm run ui:offline` is a script now.** Directive 4 (offline behavior
+  never regresses) has been a standing per-round check since phase 4 and
+  every round has done it by hand. `scripts/ui-offline.mjs` installs the
+  service worker, cuts the network, walks the rails and refreshes on an
+  activity route, which is the whole of the preview-side check; the
+  device half stays Nathanael's.
+- **new build-time checks, in the "add the check that would have caught
+  it" tradition:** every `hintRef`, `paradigmRef`, `[[link:id]]` and
+  `titleLink` must resolve (Stage 8.4's rule, extended to the two new
+  reference kinds and to the link markup); `presentFutureRows` rows must
+  carry both sides; a `paradigms[]` stack must name every chart or none;
+  and a wrong-CASE audio id now says so instead of reporting a missing
+  file.
+
+---
+
+## 8. Notes for the chat side
+
+1. **The five §4 fixes are pipeline defects.** Three of them (§4.2,
+   §4.3, §4.4) are one class: a field's last run dropped or
+   mis-converted. §4.1 is an id-casing rule the assembler does not
+   apply. §4.5 is an arrangement the extractor flattened.
+2. **`assemble_ch9.py` / `assemble_ch10.py` no longer reproduce the
+   shipped data.** CHAT-HANDOFF says that holds "only until the first
+   hand repair lands in an implementation round". It has landed: the
+   repo JSON is now the source of truth for chapters 9 and 10 too,
+   same as 6-8 (Stage 8.7).
+3. **The vocabulary-pool marker (Stage 8.8 / D-32) should cover
+   chapters 9 and 10.** Their vocabulary is not case-split, but the
+   pipeline authored `optionValues` rather than naming a lexicon pool,
+   which reaches the renderer as the same undistinguished authored grid
+   and lands two-up at 768px.
+4. **§2.4 of the spec describes a drill the chapter does not have**
+   (§5.1 above). Worth correcting in the next spec so the next reader
+   does not go looking for the voice stage.
diff --git a/buildout/5G-VISUAL-CHECKLIST.md b/buildout/5G-VISUAL-CHECKLIST.md
new file mode 100644
index 0000000..a8e9ba7
--- /dev/null
+++ b/buildout/5G-VISUAL-CHECKLIST.md
@@ -0,0 +1,198 @@
+# 5G-VISUAL-CHECKLIST.md — chapters 9 and 10 against the rail walks
+
+Standing mandate (CHAT-HANDOFF "Visual verification", ONBOARD-SOL §7):
+every page built this round was loaded in a real browser, screenshotted
+at 320px and 390px, and held **next to** the corresponding DOSBox panel
+from `ch9railwalk.pdf` / `ch10railwalk.pdf`. The panels were extracted
+with pymupdf (one PNG per panel, four per PDF page) so the comparison is
+a side-by-side, not a squint — 55 panels for chapter 9, 58 for chapter
+10.
+
+**A screenshot at rest is not a pass** (5F-PATCH1). Every page below was
+also interacted with: every topic stepped, every popup opened and
+cancelled, every Hint opened and closed, every paradigm tapped. The
+mechanical half of that is `npm run ui:walk` (which now opens every
+popup on every page it walks) and `npm run ui:behavior`; this document
+is the fidelity half — what the panel says versus what the page says.
+
+Panel references are `pN-M` = page N of the rail-walk PDF, panel M
+counting left-to-right, top-to-bottom.
+
+---
+
+## 0. Verdict
+
+| | pages compared | matched as built | corrected this round | divergence logged |
+|---|---|---|---|---|
+| chapter 9 | 22 rail stops + 6 topics + 4 popups | 28 | 1 | 1 |
+| chapter 10 | 22 rail stops + 8 topics + 5 popups | 28 | 5 | 2 |
+
+Eight differences were found by holding the pages next to the panels,
+and **six of them are data defects that no build-time check and no
+interaction test could have caught** — the port faithfully rendered what
+the pipeline extracted, and what the pipeline extracted was not what the
+original prints. All eight are listed in §3 with before/after, and the
+six data ones again in `5G-SPEC1-RESULTS.md` §4 where the pipeline can
+absorb them.
+
+---
+
+## 1. Chapter 9 — Present Middle/Passive Verbs
+
+| # | rail stop | panel | verdict |
+|---|---|---|---|
+| 1 | `c9_learn_objectives` | p1-2 | match. Six objectives, "1. 2. 3." markers (D-20 exception). Objective 6 keeps the original's "Jn 6:23b" typo verbatim — VERIFY-5G (e). |
+| 2 | `c9_learn_english_concepts` / Definitions | p1-3 | match. Three paragraphs, blank line between each, "active voice" / "passive voice" / "middle voice" underlined. |
+| 2 | ... / Identifying Traits | p1-4 | **CORRECTED** — see §3.1. The port now prints `"Zach is hit by what?" — the ball.`; the delivered data had a Greek-converted `ωηατ͂̔` where the original prints `what?"`. |
+| 2 | ... / Translation | p2-1 | match. The four annotated examples are four lines in one indented block, each with its underlined helping verb and its em-dashed label. |
+| 3 | `c9_learn_mp_verbs` / Introduction | p2-2 + p3-1 | match (the original's two More pages are one topic here, as in every ported chapter). `punctiliar` and `continuous` are blue links; the three middle functions are a numbered list with hanging indents; "deponent:" is an ordinary black underline, as in the panel — **not** a link (see §3.6). |
+| 3 | ... / punctiliar, continuous popups | p2-3, p2-4 | match. One centred line each, Cancel returns. |
+| 3 | ... / Present Middle Paradigm | p3-2 | match after the heading fix (§3.5): one heading, "Present Middle Indicative Paradigm", 2x3 grid, glosses under each form, Say Paradigm below. |
+| 3 | ... / Present Passive Paradigm | p3-4 | match, same shape. `i_mpar` backs Say Paradigm — VERIFY-5G (a). |
+| 3 | ... / Deponent Verbs | p4-2 + p4-4 | match. The panel title is blue in the original and is the link that opens the Deponent popup; "frequent verbs" is the second blue link. |
+| 3 | ... / Deponent popup | p4-3 | match. Summers' note, one paragraph, Cancel. |
+| 3 | ... / Frequently Used Deponent Verbs popup | p5-1 | match. Six Greek headwords with their glosses and NT counts, each headword tappable. |
+| 3 | ... / Accompanying Cases | p5-2 + p5-4 | match. Lead paragraph, "This is accomplished by:", numbered 1) 2) with `by Zach.` and `by the ball` underlined. ὑπό and διά are blue here because they carry clips (directive 9); the original prints them black. |
+| 3 | ... / Compound Verbs | p6-1 | match. Four rows, the preposition in parentheses beside the gloss and tappable on its own clip. The original's ἔρχομαι gloss "I go in, enter" ships verbatim — VERIFY-5G (f). |
+| 4 | `c9_drill_parsing` | p6-4, p7-2, p7-3 | match. Six options in three paired rows reading across, exactly the panel's 2x3. Prompt, reference beneath, Previous/Next/Pronounce/Translate/Hint/Score, Pronounce Each on. |
+| 4 | ... / Hint | p7-1 + p8-4 | match after §3.4: ONE popup, both paradigms stacked, one Close — the original shows one Cancel over both charts. |
+| 5 | `c9_drill_translation` | p7-4, p8-1..3 | match. Two-line Greek prompt, reference under it, three full-sentence options stacked one per line. |
+| 6 | `c9_ex_speller` | p9-1..3 | match. English prompt, Spell Greek field, shared keyboard, Show Answer / With Accents / Pronounce Each. |
+| 7 | `c9_learn_vocab` | p9-4, p10-1 | match. Greek Word / Word Meaning panes, Show Both / Hide Greek / Hide English, Pronounce. |
+| 8 | `c9_drill_vocab_gk_en` | p10-2 | match, except the grid stays two-up at 768px (D-32, extended this round). |
+| 9 | `c9_drill_vocab_en_gk` | p10-3, p10-4, p11-1 | match, same D-32 note. |
+| 10 | `c9_ex_vocab_speller` | p11-2..4 | match. |
+| 11 | `c9_learn_scripture` | p12-1 | match. Interlinear Rom 6:23b, gloss under each word, Say Whole Verse. |
+| 12 | `c9_drill_scripture_memory` | p12-2..4, p13-1 | match. Ten-option static grid. |
+| 13 | `c9_ex_scripture_speller` | p13-2 | match plus the new **Repeat This Exercise** checkbox, default OFF (D-42; semantics pending VERIFY-5G (d)). The port has no Previous Page / Next Page pair: the whole verse is one field, which is how every ported whole-verse speller has worked since chapter 3. |
+| 14 | `c9_qr_vocab` | (Quick Review menu p14-2) | match. Two columns, NT counts, Say Whole List, footnote. |
+| 15 | `c9_qr_paradigms` | p7-1 (same charts) | match. Both charts on one page, no pager. |
+| 16-21 | `c9_qr_scripture_*` (six verses) | p14-2 menu | match. Standard interlinear pages. |
+| 22 | `c9_learn_bibliography` | p14-3 | match. Four entries, hanging indents, italic titles. |
+
+## 2. Chapter 10 — Future Indicative Verbs
+
+| # | rail stop | panel | verdict |
+|---|---|---|---|
+| 1 | `c10_learn_objectives` | p1-2 | match. |
+| 2 | `c10_learn_english_concepts` | p1-3 | **CORRECTED** — see §3.3. No topic navigation at all (§4.2 of the spec); each quoted sentence now sits on its own indented line as the panel sets it. |
+| 3 | `c10_learn_future_verbs` / Introduction | p1-4 + p2 (More pages) | match. Numbered 1) 2) 3) functions, then the centred three-line formula (Stem + Sigma + Ending / λύ + σ + ω / (λύσω — I will loose)). |
+| 3 | ... / Future Active Paradigm | p2-1 | **CORRECTED** (§3.2 + §3.5): one heading, "Future Active Indicative Paradigm". |
+| 3 | ... / Future Middle Paradigm | p2-3 | **CORRECTED**, same. |
+| 3 | ... / 5 Stem Variations | p3-1 + p4-3 | match. Five numbered rules, each with its blue link; items 1-3 carry the bracket formula on a second, indented line, with `[ ]` and `==>` as literal text. |
+| 3 | ... / palatal, labial, dental, liquid, sibilant popups | p3-2, p3-4, p4-1, p4-4, p5-1 | match after §3.7: the derivations line up in columns ("ἔχω ==> ἕξω" over "ἄγω ==> ἄξω") with the gloss beside them. |
+| 3 | ... / Future of εἰμί | p5-2 | match. One heading, its Greek word tappable (`l_eimi`) — VERIFY-5G (c). |
+| 3 | ... / Deponent Futures | p5-4 + p6-1 | **CORRECTED** (§3.2): γνώσομαι's gloss is "I will know"; the delivered data had "I will". Two-column chart under underlined Present / Future headers, future glosses only. |
+| 3 | ... / Irregular Futures | p6-2 | match, glosses on both sides. The original does NOT underline these two headers while the port does (the spec says underlined for both; §5 of RESULTS). |
+| 4 | `c10_drill_parsing` | p6-4, p7-2, p7-3 | match in content and reading order; the three stages are stacked with separators rather than columned (D-41). `optionGroups: [2,2,2]` reproduces the paired person rows exactly. |
+| 4 | ... / Hint | p7-1, p8-1 | match: one popup, Future Active over Future Middle, one Close. |
+| 5 | `c10_drill_translation` | p7-4, p8-2, p8-3 | **CORRECTED** (§3.8): the instruction line reads "Click on the correct translation", as the panel does. Two-line prompt, reference, three stacked options. |
+| 6 | `c10_ex_speller` | p8-4, p9-1 | match. 18 items = the three paradigms. |
+| 7 | `c10_ex_speller_roots` | p9-2..4 | match. 22 items = 11 present/future pairs; the second chapter-specific speller renders identically to the first, as the panels do. |
+| 8 | `c10_learn_vocab` | p10-1 | match. Lexical forms ("ζωή, -ῆς, ἡ"). |
+| 9-10 | `c10_drill_vocab_*` | p10-2..4, p11-1..4 | match; D-32 note as chapter 9. |
+| 11 | `c10_ex_vocab_speller` | p12-1..3 | match. |
+| 12 | `c10_learn_scripture` | p12-4 | match. Interlinear Mat 6:33a, eleven words. |
+| 13 | `c10_drill_scripture_memory` | p13 | match. The repeated article is one option pair, "the (acc.)" / "the (gen.)". |
+| 14 | `c10_ex_scripture_speller` | p14-1, p14-2 | match plus Repeat This Exercise (D-42). |
+| 15 | `c10_qr_vocab` | p15-2 menu | match. |
+| 16 | `c10_qr_paradigms` | p7-1 | match. Both charts stacked on one page. |
+| 17-21 | `c10_qr_scripture_*` (six verses) | p15-2 menu | match. |
+| 22 | `c10_learn_bibliography` | p14-3 | match. |
+
+---
+
+## 3. What the comparison changed
+
+### 3.1 ch9 English Concepts: `ωηατ͂̔` where the original prints `what?"`
+Panel p1-4 reads `"Zach is hit by what?"  -- the ball.` The delivered
+`chapt-09.json` had `"Zach is hit by ωηατ͂̔ — the ball.` — the Greek-font
+converter had taken the Latin letters `what` for Greek `ωηατ` and the
+`?"` for a circumflex-plus-rough-breathing stack. The line is the whole
+point of the topic ("place a 'by what' after the verb"), and it rendered
+as nonsense Greek. Fixed in the data; the pipeline's `formula_conv`
+guard needs to cover this field.
+
+### 3.2 ch10 dropped words
+Five fields lost their last word in extraction, all visible only against
+the panel:
+- Deponent Futures, γνώσομαι: gloss `"I will"` -> `"I will know"`
+  (p5-4/p6-1 print "I will   know", the gap being two runs in the field).
+- Four chart titles: `"Future Active Indicative"` ->
+  `"Future Active Indicative Paradigm"` and the same for Middle, in the
+  Learn topics and again in the Quick Review copies (p2-1, p2-3, p7-1).
+
+### 3.3 ch10 English Concepts: the quotes belong on their own line
+p1-3 sets each quoted sentence on its own indented line under its lead
+("In the past we say," / `    "We went to college."`). The delivered data
+had each pair as one flowing sentence. Rewritten as ONE para block per
+pair with a `\n` and `flush: true` — the Stage 8.1-sanctioned shape for
+a hard line break inside a paragraph, not three new blocks.
+
+### 3.4 The composite Hint is stacked, not paged
+p7-1 of both rail walks shows both paradigms in ONE panel under ONE
+Cancel. The first implementation read `hintCharts.paradigmRefs` as a
+More/Back stack. Rebuilt as a stack; the same rule now decides the Quick
+Review pages (§4.8 / D-40's sibling rule in `check-content-shapes`).
+
+### 3.5 One heading, not two
+The original prints the topic label in its radio RAIL and the panel's
+own heading inside the box; this port has no rail, so
+"Present Middle Paradigm" and "Present Middle Indicative Paradigm" were
+stacking. D-40 records the rule that fixed it and the surface assertion
+that pins it.
+
+### 3.6 "deponent:" was a link and should not be
+p3-1 prints the numbered item's lead-in `deponent:` in plain black
+underline. The port turned it blue because the chapters 6-8 convention
+resolves an underlined run by SLUG, and chapter 9 happens to ship a
+`deponent` popup opened from its topic title. The slug route is now
+scoped to the popup shape it was built for; 5G's popups are reached only
+by a link the data names. (A fidelity restoration, so not logged as a
+divergence.)
+
+### 3.7 The arrow derivations did not line up
+Each row of a stem-variation popup was its own grid, so the second
+arrow sat under the first future form. The block is one grid now and the
+columns line up down the popup, as the panel prints them.
+
+### 3.8 ch10 Translation Drill: one word too many in the instruction line
+Panel p7-4 of the chapter-10 walk prints `Click on the correct
+translation`; chapter 9's equivalent (rw9 p7-4) prints `Click on the
+correct English translation`, and the chapter-10 data had chapter 9's
+wording. Instruction text is directive-1 content and is never
+ad-libbed in either direction, so the extra word is removed.
+
+### 3.9 chapters 4 and 5: a line break the renderer had been swallowing
+Not a chapter-9-or-10 page, but found by the same change. The Case
+topic's numbered items already carried a `\n` — "Subjective case (Gk:
+nominative):" then, on its own indented line, "He hit the ball." — and
+the renderer collapsed it to a space, so the two ran together. ch4
+railwalk p2-3 sets them on two lines exactly as the data says. A
+fidelity restoration, so not a logged divergence, but it changes two
+device-verified pages and RESULTS §2.6 says so. Chapter 1's Six Points
+note carries `\n\n` instead — a paragraph break, not a set-apart line —
+and the renderer now tells the two apart.
+
+---
+
+## 4. What is still open for Nathanael
+
+Everything in §6 of `5G-SPEC1.md` — the nine VERIFY-5G items — plus one
+observation the comparison raised that the spec does not cover:
+
+- **Neither panel draws the "Repeat This Exercise" checkbox.** rw9 p13-2
+  and rw10 p14-2 both show exactly one checkbox on the Scripture Memory
+  Spelling Exercise — "With Accents". The spec says the control is
+  present in both originals and the data records the label's address in
+  the TBK, so the port ships it (default OFF), but the panels are page
+  ONE of a paged entry surface and the control may be on page two, or
+  may not be drawn at all. This is what VERIFY-5G (d) should establish
+  FIRST; see RESULTS §5.4.
+
+- **Irregular Futures headers.** The spec says both charts carry
+  underlined Present/Future headers and the data agrees; panel p6-2
+  shows the Irregular Futures headers **not** underlined while p5-4's
+  Deponent Futures headers are. The spec wins per its own §0 and the
+  port underlines both. Worth a keep-or-fix decision alongside items
+  (e) and (f).
diff --git a/buildout/DIVERGENCE-LOG.md b/buildout/DIVERGENCE-LOG.md
index 0f91c5b..f2c7b4d 100644
--- a/buildout/DIVERGENCE-LOG.md
+++ b/buildout/DIVERGENCE-LOG.md
@@ -234,7 +234,16 @@ D-32 | ch6,8 | THE CASE-SPLIT VOCABULARY DRILLS DO NOT FOLLOW D-19.
      as such in the harness rather than dropped from the census. If
      the pipeline later marks these drills as vocabulary pools, the
      existing responsive class picks them up with no renderer change.
-     | Implementer, 5F-SPEC1 §5.
+     **EXTENDED 2026-08-11 (5G-SPEC1): chapters 9 and 10's four
+     vocabulary drills join this entry.** Their vocabulary is NOT
+     case-split — ten lemmas, ten options — but the pipeline authored
+     `optionValues` rather than naming a lexicon pool, which reaches
+     the renderer as the same undistinguished authored grid and lands
+     two-up at both widths for the same reason. The fix is the same
+     one: the vocabulary-pool marker Stage 8.8 already owes chapters
+     6 and 8 should cover 9 and 10 as well, and the responsive class
+     picks all eight up with no renderer change.
+     | Implementer, 5F-SPEC1 §5; extended 5G-SPEC1.
 D-33 | ch7 | THE εἰμί SPELLER'S PARENTHESISED ALTERNATE MAKES THE
      PARENTHESISED SEGMENT OPTIONAL. `answerAlt` is "ἐστί(ν)" against
      an `answer` of "ἐστίν". Punctuation is already optional under
@@ -356,6 +365,52 @@ D-39 | ch8 | **REVERSED for λέγω / ἐγὼ λέγω (2026-08-10, Nathanael'
      accent is prosodic only. | Nathanael correction + implementer,
      5F-FEEDBACK3 items 4, 5; ISO verified 2026-08-10.
 
+D-40 | ch9,ch10 | A TOPIC HEADING ITS OWN CHART SAYS IN FULL IS
+     PRINTED ONCE, BY THE CHART. The original puts the topic label in
+     a radio RAIL down the left and the panel's own heading inside the
+     yellow box, so "Present Middle Paradigm" and "Present Middle
+     Indicative Paradigm" never appear together in one column. This
+     port draws no radio rail — the topic label is the page heading —
+     so the pair stacked, and two headings differing by one word is
+     the 5E-R1 defect verbatim. Where a chart's title says the topic's
+     heading AND MORE OF IT (word-subsequence, `headingCovers` in
+     lib/content.js), the HOST drops its heading and the chart's
+     fuller title stands, because the fuller one is what the original
+     prints in its panel. The reverse case — the chart's title is an
+     ABBREVIATION of the topic's (chapter 5's Masc/Masculine pair) —
+     keeps its existing 5E behaviour untouched: there the chart's
+     title is dropped and the topic's stands. Asserted both in the
+     data sweep and on the surface (ui-behavior 5E-R1).
+     | Implementer, 5G-SPEC1; ch9railwalk p3, ch10railwalk p2.
+
+D-41 | ch10 | THE THREE-STAGE PARSING DRILL IS STACKED, NOT COLUMNED.
+     The original draws tense, voice and person/number as three
+     side-by-side COLUMNS of tiles (ch10railwalk p6). Four columns of
+     tiles whose longest label is "Second Singular" cannot be read at
+     320px, so the port keeps the original's reading ORDER — tense,
+     then voice, then person — and stacks the three stages down the
+     card, marking them off with the same dark-green separator the
+     grouped option stacks already use. Within the third stage the
+     original's `optionGroups: [2, 2, 2]` pairing is preserved
+     exactly: three rows of two, reading across. Two-stage drills
+     (chapter 8's person + case grid) are two different shapes already
+     and keep their unmarked layout. | Implementer, 5G-SPEC1 §4.1.
+
+D-42 | ch9,ch10 | "REPEAT THIS EXERCISE" SEMANTICS ARE MODELLED,
+     PENDING VERIFY-5G (d). The checkbox is the original's, on the
+     Scripture Memory Spelling Exercise of both chapters, and it
+     ships default OFF. What it DOES here is 5G-SPEC1 §4.5's
+     extrapolation, not an observed behaviour: a successful Check
+     Answer plays the whole verse (rule C7, as always), and then —
+     only when the box is checked — clears the slate for another
+     pass. Completion is recorded on the FIRST success and the repeat
+     pass does not touch it. Nothing beyond replay-and-clear is
+     invented, and the harness asserts only the control's PRESENCE
+     and its default, deliberately not the behaviour, until item (d)
+     of VERIFY-5G says what the original does. If the DOSBox answer
+     differs, this entry is what to correct. | 5G-SPEC1 §4.5;
+     implementer, pending Nathanael.
+
 ## Auto-progress / advance rule matrix
 
 MOVED. The full exercise-by-exercise, chapter-by-chapter matrix —
diff --git a/package.json b/package.json
index 5aa7f69..ea74298 100644
--- a/package.json
+++ b/package.json
@@ -14,6 +14,7 @@
     "ui:walk": "node scripts/ui-walk.mjs",
     "ui:behavior": "node scripts/ui-behavior.mjs",
     "ui:modals": "node scripts/ui-modals.mjs",
+    "ui:offline": "node scripts/ui-offline.mjs",
     "ui:smoke5f": "node scripts/ui-smoke-5f.mjs",
     "ui:shots5f": "node scripts/ui-shots-5f.mjs"
   },
diff --git a/scripts/check-content-shapes.mjs b/scripts/check-content-shapes.mjs
index 7259840..4686f2c 100644
--- a/scripts/check-content-shapes.mjs
+++ b/scripts/check-content-shapes.mjs
@@ -18,7 +18,10 @@ const BLOCK_TYPES = new Set([
   'heading', 'subheading', 'para', 'numbered', 'defList',
   'biblist', 'refs', 'note', 'greekRows', 'expander', 'paradigm',
   // 5F: chapter 6's preposition DIAGRAM.
-  'prepositionsChart'
+  'prepositionsChart',
+  // 5G: chapter 10's present-beside-future chart (teaching topics and the
+  // five stem-variation popups share the one shape).
+  'presentFutureRows'
   // 'pronounParadigm' (chapter 8's free-text pronoun-row shape) was RETIRED
   // in the 5F-FEEDBACK.pdf patch round: every pronoun paradigm now ships as a
   // standard `paradigm` block with real cells and real per-cell audio, which
@@ -345,12 +348,20 @@ for (const file of files) {
       // `name`, so the attribute rendered empty and the behavior harness could
       // not tell which chart it was looking at -- caught by ui-behavior.mjs
       // §2.8, not by this build-time check, because nothing here had asked.
+      // 5G: a paradigms[] stack of more than one chart is drawn one of TWO
+      // ways, and the names are what say which. NAMED throughout: a More/Back
+      // sequence, one chart on screen at a time, each page reporting its own
+      // data-chart-name (chapter 8's Masculine/Feminine/Neuter). UNNAMED
+      // throughout: both charts stacked on ONE page under one title, which is
+      // how chapters 9 and 10 print their Middle+Passive and Future
+      // Active+Middle pairs (ch10railwalk p7). A MIXED stack is the real
+      // defect — the renderer has to choose, and either choice is wrong for
+      // half the data — so it is what fails here.
       if (block.paradigms.length > 1) {
-        block.paradigms.forEach((chart, index) => {
-          if (!chart || typeof chart.name !== 'string' || !chart.name.trim()) {
-            problems.push(`${path}.paradigms[${index}].name: expected a non-empty chart name (a paradigms[] stack of more than one page is a More/Back sequence).`);
-          }
-        });
+        const named = block.paradigms.filter(chart => chart && typeof chart.name === 'string' && chart.name.trim()).length;
+        if (named !== 0 && named !== block.paradigms.length) {
+          problems.push(`${path}.paradigms: ${named} of ${block.paradigms.length} charts are named. Name every chart (a More/Back sequence, whose pages report data-chart-name) or none of them (a stacked pair drawn on one page) — never some.`);
+        }
       }
     }
     // spellVerse grades word by word, so the answer must actually be words.
@@ -394,6 +405,26 @@ for (const file of files) {
     if (block.audioTiming != null && !AUDIO_TIMINGS.has(block.audioTiming)) {
       problems.push(`${path}.audioTiming: "${block.audioTiming}" is not one of ${[...AUDIO_TIMINGS].join(', ')}.`);
     }
+    // 5G: presentFutureRows is a two-sided chart. A row missing either side
+    // renders as an empty tap target with nothing in it -- visible only as a
+    // gap, which is the failure class this whole file exists for.
+    if (block.type === 'presentFutureRows') {
+      if (!Array.isArray(block.rows) || !block.rows.length) {
+        problems.push(`${path}: presentFutureRows has no rows array.`);
+        return;
+      }
+      block.rows.forEach((row, index) => {
+        for (const side of ['present', 'future']) {
+          const cell = row && row[side];
+          if (!cell || typeof cell !== 'object' || typeof cell.greek !== 'string' || !cell.greek.trim()) {
+            problems.push(`${path}.rows[${index}].${side}: expected an object with a non-empty greek form.`);
+          }
+        }
+      });
+      if (block.headers != null && (!Array.isArray(block.headers) || block.headers.length !== 2)) {
+        problems.push(`${path}.headers: expected exactly two headers (Present, Future) or none at all — the headed form is the two-column chart, the unheaded one the "==>" derivation.`);
+      }
+    }
     // greekRows rows carry a word, a positional-chart cell list, or an
     // alternating parts[] equation -- never nothing at all.
     if (block.type === 'greekRows') {
@@ -405,6 +436,95 @@ for (const file of files) {
   });
 }
 
+// ---- EVERY REFERENCE RESOLVES (PIPELINE-INSIGHTS Stage 8.4) ----
+// Five of chapter 6-8's six hintRefs dangled once, and a dangling reference
+// fails SILENTLY in both directions: a hintRef that resolves to nothing simply
+// removes the Hint button, and a [[link:id]] that names no popup renders as
+// plain text. Both look like a deliberate absence on screen. 5G adds two more
+// reference kinds — the chapter-level `hintCharts` register and its
+// `paradigmRefs`, and the explicit link markup — so the whole class is checked
+// here rather than one kind at a time.
+//
+// The resolver accepts an id, a block type, or the camelCase slug of a chart
+// title (src/lib/content.js resolveHintRef). That slug rule is copied rather
+// than imported because content.js reaches for import.meta.glob and cannot be
+// loaded outside Vite; if the two ever disagree, this check is the one that
+// says so by failing on a ref the app resolves fine.
+const slugOf = text => String(text || '')
+  .replace(/[^A-Za-z0-9]+$/, '')
+  .replace(/[^A-Za-z0-9]+(.)/g, (_, c) => c.toUpperCase())
+  .replace(/^[A-Z]/, c => c.toLowerCase());
+const SECTION_KEYS = ['learn', 'drill', 'exercise', 'quickReview'];
+
+for (const file of files) {
+  const data = JSON.parse(readFileSync(join(DATA, file), 'utf8'));
+  // Everything a hintRef may legally name.
+  const chartRefs = new Set(Object.keys(data.hintCharts || {}));
+  const collect = node => {
+    if (Array.isArray(node)) { node.forEach(collect); return; }
+    if (!node || typeof node !== 'object') return;
+    if (typeof node.id === 'string') chartRefs.add(node.id);
+    if (typeof node.type === 'string') chartRefs.add(node.type);
+    if (typeof node.title === 'string') chartRefs.add(slugOf(node.title));
+    if (typeof node.chartTitle === 'string') chartRefs.add(slugOf(node.chartTitle));
+    for (const value of Object.values(node)) collect(value);
+  };
+  for (const key of SECTION_KEYS) collect(data[key]);
+
+  for (const [name, composite] of Object.entries(data.hintCharts || {})) {
+    const refs = composite && composite.paradigmRefs;
+    if (!Array.isArray(refs) || !refs.length) {
+      problems.push(`${file}.hintCharts.${name}: expected a non-empty paradigmRefs array.`);
+      continue;
+    }
+    refs.forEach((ref, index) => {
+      if (!chartRefs.has(ref)) {
+        problems.push(`${file}.hintCharts.${name}.paradigmRefs[${index}]: "${ref}" names no chart, topic or block in this chapter — the Hint would open empty.`);
+      }
+    });
+  }
+
+  walk(data, file, (node, path) => {
+    const ref = node.ui && node.ui.hintRef;
+    if (typeof ref === 'string' && !chartRefs.has(ref)) {
+      problems.push(`${path}.ui.hintRef: "${ref}" resolves to nothing — the Hint control would silently not render.`);
+    }
+  });
+
+  // A [[link:id]] must name one of its OWN activity's popups: the register is
+  // per-activity (providePopups + Svelte context), so a link in one activity
+  // can never reach another's popup even when the id exists elsewhere.
+  const LINK = /\[\[link:([^\]]+)\]\]/g;
+  for (const key of SECTION_KEYS) {
+    for (const activity of data[key] || []) {
+      const popupIds = new Set();
+      for (const popup of activity.popups || []) {
+        if (popup && popup.id) { popupIds.add(popup.id); popupIds.add(slugOf(popup.id)); }
+      }
+      (function scanLinks(node, path) {
+        if (Array.isArray(node)) return node.forEach((child, i) => scanLinks(child, `${path}[${i}]`));
+        if (node && typeof node === 'object') {
+          for (const [k, v] of Object.entries(node)) if (!k.startsWith('_')) scanLinks(v, `${path}.${k}`);
+          return;
+        }
+        if (typeof node !== 'string') return;
+        LINK.lastIndex = 0;
+        for (let m = LINK.exec(node); m; m = LINK.exec(node)) {
+          if (!popupIds.has(m[1]) && !popupIds.has(slugOf(m[1]))) {
+            problems.push(`${file}.${key}[${activity.id}]${path}: [[link:${m[1]}]] names no popup on this activity — the run would render as plain text with nothing behind it.`);
+          }
+        }
+      })(activity, '');
+      // A topic title that IS a link resolves the same way.
+      for (const [index, topic] of (activity.topics || []).entries()) {
+        if (topic && topic.titleLink && !popupIds.has(topic.titleLink) && !popupIds.has(slugOf(topic.titleLink))) {
+          problems.push(`${file}.${key}[${activity.id}].topics[${index}].titleLink: "${topic.titleLink}" names no popup on this activity.`);
+        }
+      }
+    }
+  }
+}
+
 // ---- NO DISPLAYED DOUBLE HYPHEN (D2, 5E-SPEC2 §5.4) ----
 // `--` is an em dash everywhere the learner can see it. The rule is applied by
 // scripts/apply-behavior-matrix.py, which must run after every assemble; this
@@ -624,7 +744,16 @@ function segment_(text) { return new Intl.Segmenter('el', { granularity: 'graphe
         return;
       }
       if (typeof node === 'string' && AUDIO_ID.test(node) && !(node in manifest)) {
-        problems.push(`${file}${path}: audio id "${node}" is not in audio-manifest.json — the tap would toast "Audio not found" at runtime.`);
+        // 5G: name the CASE fix when that is what it is. Audio ids are derived
+        // from the ISO path and are lowercase throughout (audio.js naming
+        // contract); chapter 10's translation drill shipped 31 ids spelled
+        // with the TBK dispatch key's own mixed case (j_TvD1), every one of
+        // which would have toasted on device. "Not in the manifest" was true
+        // but sent the reader looking for a missing clip that is right there.
+        const lower = node.toLowerCase();
+        problems.push(lower !== node && lower in manifest
+          ? `${file}${path}: audio id "${node}" is not in audio-manifest.json, but "${lower}" is — audio ids are lowercase everywhere (the ISO path contract in src/lib/audio.js). Fix the case.`
+          : `${file}${path}: audio id "${node}" is not in audio-manifest.json — the tap would toast "Audio not found" at runtime.`);
       }
     })(data, '');
   }
@@ -635,4 +764,4 @@ if (problems.length) {
   process.exit(1);
 }
 
-console.log(`PASS: content shapes intact — ${files.join(', ')} checked (biblist entries are strings; numbered items render something; greekRows rows carry content; paradigm rows match their columns; spellVerse answers are single words; every contentAudio mode has a branch; every advanceClass is one of the four and every audioTiming one of the five; every reddened cluster has a font-derived geometry row; every spelling answer is typeable on the shared keyboard; every displayed elision mark is U+0027; no numbered point is hand-numbered inside a plain para; no paragraph is split line-by-line across consecutive paras; every audio id the data names exists in the audio manifest).`);
+console.log(`PASS: content shapes intact — ${files.join(', ')} checked (biblist entries are strings; numbered items render something; greekRows rows carry content; paradigm rows match their columns; spellVerse answers are single words; every contentAudio mode has a branch; every advanceClass is one of the four and every audioTiming one of the five; every reddened cluster has a font-derived geometry row; every spelling answer is typeable on the shared keyboard; every displayed elision mark is U+0027; no numbered point is hand-numbered inside a plain para; no paragraph is split line-by-line across consecutive paras; every presentFutureRows row has both sides; every hintRef, paradigmRef, [[link:id]] and topic titleLink resolves; every audio id the data names exists in the audio manifest).`);
diff --git a/scripts/check-lazy-chunk.mjs b/scripts/check-lazy-chunk.mjs
index dc4ebe2..0cd4d48 100644
--- a/scripts/check-lazy-chunk.mjs
+++ b/scripts/check-lazy-chunk.mjs
@@ -26,7 +26,9 @@ const expected = [
   { chapterPattern: /^chapt-05-.*\.js$/, lexiconPattern: /^lexicon-chapt05-.*\.js$/, needle: 'This page is largely a repetition of what was done in chapter 4 except for the section on the definite article.' },
   { chapterPattern: /^chapt-06-.*\.js$/, lexiconPattern: /^lexicon-chapt06-.*\.js$/, needle: 'Prepositions are usually small words that link or relate two words together.' },
   { chapterPattern: /^chapt-07-.*\.js$/, lexiconPattern: /^lexicon-chapt07-.*\.js$/, needle: 'An adjective is a word used to modify' },
-  { chapterPattern: /^chapt-08-.*\.js$/, lexiconPattern: /^lexicon-chapt08-.*\.js$/, needle: 'A pronoun is a word that stands in place' }
+  { chapterPattern: /^chapt-08-.*\.js$/, lexiconPattern: /^lexicon-chapt08-.*\.js$/, needle: 'A pronoun is a word that stands in place' },
+  { chapterPattern: /^chapt-09-.*\.js$/, lexiconPattern: /^lexicon-chapt09-.*\.js$/, needle: 'There are two voices in English.' },
+  { chapterPattern: /^chapt-10-.*\.js$/, lexiconPattern: /^lexicon-chapt10-.*\.js$/, needle: 'In English we have several tenses.' }
 ];
 
 // 2. Chapter DATA must be ABSENT from the main bundle and PRESENT in its chunk.
diff --git a/scripts/ui-behavior.mjs b/scripts/ui-behavior.mjs
index 8001abf..876b860 100644
--- a/scripts/ui-behavior.mjs
+++ b/scripts/ui-behavior.mjs
@@ -47,6 +47,8 @@ const ch2 = JSON.parse(readFileSync('src/data/chapt-02.json', 'utf8'));
 const ch6 = JSON.parse(readFileSync('src/data/chapt-06.json', 'utf8'));
 const ch7 = JSON.parse(readFileSync('src/data/chapt-07.json', 'utf8'));
 const ch8 = JSON.parse(readFileSync('src/data/chapt-08.json', 'utf8'));
+const ch9 = JSON.parse(readFileSync('src/data/chapt-09.json', 'utf8'));
+const ch10 = JSON.parse(readFileSync('src/data/chapt-10.json', 'utf8'));
 const verse = (ch3.exercise.find(a => a.type === 'spellVerse').answerWords || []).join(' ');
 // UNACCENTED, not unmarked (5E-SPEC2 §4.2). "With Accents" OFF forgives the
 // acute, the grave and the circumflex and NOTHING else, so a fixture that
@@ -697,8 +699,12 @@ check('§5 Parsing Drill divider is dark green',
   divider.top === GREEN || divider.left === GREEN, JSON.stringify(divider));
 
 // ---------------------------------------------------------------- §5 objectives
+// Data files are zero-PADDED to two digits: chapter 10 is chapt-10.json, not
+// chapt-010.json. The old `chapt-0${n}` concatenation was right for exactly
+// the nine chapters that existed when it was written.
+const chapterFile = id => `src/data/chapt-${String(id.split('_')[1]).padStart(2, '0')}.json`;
 for (const chapterId of ['chapt_1', 'chapt_2', 'chapt_3', 'chapt_4', 'chapt_5']) {
-  const data = JSON.parse(readFileSync(`src/data/chapt-0${chapterId.split('_')[1]}.json`, 'utf8'));
+  const data = JSON.parse(readFileSync(chapterFile(chapterId), 'utf8'));
   const objectives = (data.learn || []).find(a => a.mode === 'objectivesPage');
   if (!objectives) { check(`§5 ${chapterId} objectives use "1. 2. 3."`, false, 'no objectivesPage'); continue; }
   await go(`#/activity/${chapterId}/${objectives.id}`);
@@ -716,9 +722,10 @@ await page.setViewportSize({ width: 390, height: 900 });
 // 5F: chapters 6, 7 and 8 join the swept set, so every census, every ledger
 // assertion and every spelling rule below covers them without being restated.
 // That is the point of writing them as sweeps rather than as lists.
+// 5G: chapters 9 and 10 join it in turn, for the same reason.
 const CHAPTERS = { chapt_1: ch1, chapt_2: ch2, chapt_3: ch3, chapt_4: ch4, chapt_5: ch5,
-                   chapt_6: ch6, chapt_7: ch7, chapt_8: ch8 };
-const LEXICON = id => JSON.parse(readFileSync(`src/data/lexicon-chapt0${id.split('_')[1]}.json`, 'utf8'));
+                   chapt_6: ch6, chapt_7: ch7, chapt_8: ch8, chapt_9: ch9, chapt_10: ch10 };
+const LEXICON = id => JSON.parse(readFileSync(`src/data/lexicon-chapt${String(id.split('_')[1]).padStart(2, '0')}.json`, 'utf8'));
 const promptGloss = () => page.locator('.card.speller .flash-pane .value').first().innerText();
 // WHICH ITEM the word speller is on. Not the prompt: chapter 7's adjective
 // speller prints "good" on six consecutive items and tells them apart by their
@@ -1699,26 +1706,64 @@ await page.setViewportSize({ width: 390, height: 900 });
 // key has to know about. A second one would silently double a heading again.
 {
   const ABBREVIATIONS = /\b(masc|fem|neut|sing|plur|pl|nom|gen|dat|acc|voc)\b/i;
+  // The renderer's own fold and cover rules (src/lib/content.js headingKey /
+  // headingCovers). Copied, not imported, because content.js reaches for
+  // import.meta.glob and cannot load outside Vite -- if the two ever disagree
+  // this check is what says so, by flagging a pair the app quietly handles.
+  const headingKey = t => String(t || '').trim().toLowerCase()
+    .replace(/\u2014|\u2013|--/g, '-').replace(/\s+/g, ' ').replace(/\bmasc\b/, 'masculine');
+  const headingCovers = (outer, inner) => {
+    const o = headingKey(outer).split(' ').filter(Boolean);
+    const i = headingKey(inner).split(' ').filter(Boolean);
+    if (o.length <= i.length) return false;
+    let at = 0;
+    for (const word of i) { at = o.indexOf(word, at) + 1; if (at === 0) return false; }
+    return true;
+  };
   const mismatches = [];
+  const covered = [];
   for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
     for (const activity of activitiesOf(chapter)) {
       for (const topic of (activity && activity.topics) || []) {
         for (const block of topic.content || []) {
           const titles = [block.title, ...((block.charts || []).map(c => c.title))].filter(Boolean);
           for (const title of titles) {
-            if (topic.title && normalizeText(title) !== normalizeText(topic.title)) {
-              mismatches.push(`${chapterId} ${JSON.stringify(topic.title)} vs ${JSON.stringify(title)}`);
+            if (!topic.title || normalizeText(title) === normalizeText(topic.title)) continue;
+            // 5G: the chart title may say the topic's heading AND MORE of it
+            // ("Present Middle Paradigm" -> "Present Middle Indicative
+            // Paradigm"). That is the same heading at two lengths, like the
+            // Masc/Masculine pair, and the host drops its own so one prints.
+            if (headingCovers(title, topic.title)) {
+              covered.push([chapterId, activity.id, topic.title, title]);
+              continue;
             }
+            mismatches.push(`${chapterId} ${JSON.stringify(topic.title)} vs ${JSON.stringify(title)}`);
           }
         }
       }
     }
   }
-  // Every mismatch must be an abbreviation of the same heading, and the only
-  // one the renderer's key expands is "masc".
+  // Every remaining mismatch must be an abbreviation of the same heading, and
+  // the only one the renderer's key expands is "masc".
   const unhandled = mismatches.filter(m => !/masc/i.test(m) || !ABBREVIATIONS.test(m));
   check('5E-R1 the only topic/chart title mismatch in chapters 1-5 is the one the dedup key handles',
     unhandled.length === 0, mismatches.length ? mismatches.join('; ') : 'no mismatches at all');
+
+  // ...and on the SURFACE: a covered pair prints ONE heading, the fuller one,
+  // which is the heading the original prints in its panel. Two stacked
+  // headings that differ by a single word is exactly the 5E-R1 defect.
+  for (const [chapterId, activityId, topicTitle, chartTitle] of covered) {
+    const chapter = CHAPTERS[chapterId];
+    const activity = activityById(chapter, activityId);
+    const index = (activity.topics || []).findIndex(t => t.title === topicTitle);
+    await go(`#/activity/${chapterId}/${activityId}`);
+    await gotoTopic(index);
+    const headings = await page.evaluate(() => [...document.querySelectorAll('.card .topic-heading, .card .pg-title')]
+      .map(el => el.textContent.replace(/\s+/g, ' ').trim()));
+    check(`5E-R1 ${chapterId} ${activityId} "${topicTitle}" prints ONE heading: the chart's fuller "${chartTitle}"`,
+      headings.length === 1 && normalizeText(headings[0]) === normalizeText(chartTitle),
+      JSON.stringify(headings));
+  }
 }
 
 // ---- item 3: the beforeGuess clip speaks on ARRIVAL ----------------------
@@ -2034,7 +2079,10 @@ for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
 // in both of its shapes, per-item option rendering, the elision apostrophe
 // round-tripping through the checker, and the popup pages.
 
-const CH_5F = { chapt_6: ch6, chapt_7: ch7, chapt_8: ch8 };
+// 5G: the ledger read-back sweep covers chapters 9 and 10 too — rows 79-95 of
+// DRILLBEHAVIORLEDGER.csv were CONFIRMED before either chapter was built, so
+// this is the assertion that the shipped surfaces agree with the stamp.
+const CH_5F = { chapt_6: ch6, chapt_7: ch7, chapt_8: ch8, chapt_9: ch9, chapt_10: ch10 };
 
 // ---- the ledger, read off the SURFACE, activity by activity --------------
 // `audioTiming`, the Pronounce-Each default and the Previous/Next pair are
@@ -2748,9 +2796,30 @@ for (const [chapterId, activityId, opener] of [
 // A chart may carry the action itself or the activity may carry it beside the
 // chart, and both routes drawing it printed "Say Whole List" twice on the εἰμί
 // chart before this was asserted.
+//
+// TWO ways a multi-chart page is drawn, since 5G: a NAMED stack is a More/Back
+// sequence with one chart on screen at a time, an UNNAMED one is both charts
+// stacked on a single page. The check counts controls against whatever is
+// actually on screen rather than assuming the pager exists.
+//
+// It also matches the CONTROL, not the label. It used to match a button named
+// /^Say Whole/, which silently assumed every chapter calls the button the same
+// thing; chapters 9 and 10 print the original's own "Say Paradigm" and the
+// check read that as a missing control. The class is what the renderer
+// guarantees; the wording is the original's business, chapter by chapter.
 for (const [chapterId, chapter] of Object.entries(CH_5F)) {
   for (const activity of activitiesOf(chapter).filter(a => a && a.mode === 'paradigmChart')) {
     const charts = activity.paradigms || (activity.paradigm ? [activity.paradigm] : []);
+    const stacked = charts.length > 1 && charts.every(chart => !chart.name);
+    const sayWholeCount = () => page.locator('.card .pg-say-whole').count();
+    if (stacked) {
+      await go(`#/activity/${chapterId}/${activity.id}`);
+      const wants = charts.filter(chart => !!(chart.sayWhole || activity.sayWhole)).length;
+      const count = await sayWholeCount();
+      check(`5F ${chapterId} ${activity.id}: ${wants} Say-Whole action${wants === 1 ? '' : 's'} on the stacked page, one per chart that carries one`,
+        count === wants, `${count} on screen`);
+      continue;
+    }
     for (const [index, chart] of charts.entries()) {
       await go(`#/activity/${chapterId}/${activity.id}`);
       for (let step = 0; step < index; step++) {
@@ -2758,7 +2827,7 @@ for (const [chapterId, chapter] of Object.entries(CH_5F)) {
         await page.waitForTimeout(80);
       }
       const wants = !!(chart.sayWhole || activity.sayWhole);
-      const count = await page.locator('.card').getByRole('button', { name: /^Say Whole/ }).count();
+      const count = await sayWholeCount();
       check(`5F ${chapterId} ${activity.id} chart ${index + 1}: the Say Whole action is drawn ${wants ? 'exactly once' : 'not at all'}`,
         count === (wants ? 1 : 0), `${count} on screen`);
     }
@@ -2859,17 +2928,32 @@ for (const [chapterId, activityId, expected] of [
   // grid. That is a real, small divergence from D-19's intent and it is
   // asserted here as what it is rather than dropped from the census.
   // See 5F-SPEC1-RESULTS §5 and DIVERGENCE-LOG D-32.
+  // 5G: chapters 9 and 10 ship their vocabulary drills as AUTHORED grids too
+  // -- not because the vocabulary is case-split (it is not; ten lemmas, ten
+  // options) but because the pipeline authored optionValues rather than naming
+  // a lexicon pool. Same renderer consequence, same divergence, same fix
+  // pending: the vocabulary-pool marker Stage 8.8 already owes chapters 6 and
+  // 8 (D-32). Listed here as what it is rather than dropped from the census.
   const AUTHORED_VOCAB = new Set([
     'c6_drill_vocab_gk_en', 'c6_drill_vocab_en_gk',
-    'c8_drill_vocab_gk_en', 'c8_drill_vocab_en_gk'
+    'c8_drill_vocab_gk_en', 'c8_drill_vocab_en_gk',
+    'c9_drill_vocab_gk_en', 'c9_drill_vocab_en_gk',
+    'c10_drill_vocab_gk_en', 'c10_drill_vocab_en_gk'
   ]);
   const vocabulary = census.filter(row => /_vocab_(gk_en|en_gk)$/.test(row.id) && !AUTHORED_VOCAB.has(row.id));
   for (const row of census.filter(row => AUTHORED_VOCAB.has(row.id))) {
-    check(`5F §5 ${row.chapterId} ${row.id}: case-split vocabulary is an AUTHORED grid and stays 2-up at both widths`,
+    check(`5F §5 ${row.chapterId} ${row.id}: authored vocabulary grid stays 2-up at both widths (D-32)`,
       row.cols[320] === 2 && row.cols[768] === 2, `${row.cols[320]} / ${row.cols[768]} columns`);
   }
   const paradigm = census.filter(row => row.layout === 'paradigm2col');
-  const declared = census.filter(row => row.layout === 'single' || row.layout === 'grouped');
+  const declared = census.filter(row => row.layout === 'single');
+  // 5G: a GROUPED layout is not automatically one option per line. Chapter 3's
+  // six full parsings are 48 characters and stack; chapters 9 and 10 group
+  // SHORT labels in pairs ("First Singular | First Plural"), which is how the
+  // original draws them. The label length decides, so the census asks the
+  // question the renderer asks rather than pinning one chapter's answer.
+  const longestOption = a => (a.optionValues || []).reduce((n, v) => Math.max(n, String(v).length), 0);
+  const grouped = census.filter(row => row.layout === 'grouped');
 
   for (const row of vocabulary) {
     check(`5E §6.8 ${row.chapterId} ${row.id}: option grid is 2-up at 320px and 4-up at 768px`,
@@ -2883,6 +2967,12 @@ for (const [chapterId, activityId, expected] of [
     check(`5E §6.8 ${row.chapterId} ${row.id}: declared "${row.layout}" layout is single-column at both widths`,
       row.cols[320] === 1 && row.cols[768] === 1, `${row.cols[320]} / ${row.cols[768]} columns`);
   }
+  for (const row of grouped) {
+    const longest = longestOption(activityById(CHAPTERS[row.chapterId], row.id));
+    const want = longest > 24 ? 1 : 2;
+    check(`5E §6.8 ${row.chapterId} ${row.id}: grouped layout is ${want}-up at both widths (longest option ${longest} chars)`,
+      row.cols[320] === want && row.cols[768] === want, `${row.cols[320]} / ${row.cols[768]} columns`);
+  }
 
   // THE PHONE-WIDTH GUARD, which is the half of D-19 that protects reading.
   // Four columns inside 320px is only ever legible for one-glyph tiles, digits
@@ -3104,6 +3194,397 @@ for (const [chapterId, activityId, expected] of [
     `${await page.locator('.rc-para .greek-tap').count()} taps found`);
 }
 
+
+// ===================================================================
+// 5G: chapters 9 and 10
+// ===================================================================
+// Everything above already sweeps them (they are in CHAPTERS and in the
+// ledger read-back). What follows is what only they have: the parsing drill
+// generalized to THREE stages, the single-topic page with no topic rail, the
+// popup written as content blocks, the present/future chart in both of its
+// printed forms, the composite Hint, the compound-verb suffix, and the
+// "Repeat This Exercise" checkbox.
+
+// ---- G1 the THREE-stage parsing drill (5G-SPEC1 §4.1) --------------------
+{
+  const activity = activityById(ch10, 'c10_drill_parsing');
+  const HASH = '#/activity/chapt_10/c10_drill_parsing';
+  const stage = index => page.locator(`[data-stage="${index}"]`);
+  const stageTiles = index => stage(index).locator('.tile');
+  // The tuple the item on screen wants. Four forms repeat in the pool
+  // (λύσομαι is items 5 and 18) but they repeat with the SAME parse, so the
+  // prompt identifies the answer even where it does not identify the item.
+  // A prompt whose matches DISAGREE returns null rather than a guess.
+  const answerFor = async () => {
+    const prompt = await promptOnScreen();
+    const hits = activity.items.filter(i => normalizeText(i.greek) === prompt);
+    const unique = new Set(hits.map(i => i.answer.join('|')));
+    return { prompt, answer: unique.size === 1 ? hits[0].answer : null };
+  };
+  const clickStage = async (index, label) => {
+    await stage(index).locator('.tile', { hasText: label }).first().click();
+    await page.waitForTimeout(120);
+  };
+
+  await go(HASH);
+  check('5G G1 the instruction line asks for three clicks, tense first',
+    normalizeText(await page.locator('.instructions').first().innerText())
+      === 'Click first on the tense, voice and person last',
+    JSON.stringify(await page.locator('.instructions').first().innerText()));
+  check('5G G1 THREE stages are on screen, in authored order',
+    await page.locator('[data-stage]').count() === 3
+      && await stage(0).getAttribute('data-stage-label') === 'Tense'
+      && await stage(1).getAttribute('data-stage-label') === 'Voice'
+      && await stage(2).getAttribute('data-stage-label') === 'Person / Number',
+    `${await page.locator('[data-stage]').count()} stages`);
+  check('5G G1 all three stages are LIVE from the start (the commit rule holds the tuple, not a disabled control)',
+    !await stageTiles(0).first().isDisabled() && !await stageTiles(1).first().isDisabled()
+      && !await stageTiles(2).first().isDisabled());
+  // §4.1: optionGroups [2, 2, 2] on the person/number stage reproduces the
+  // original's three paired rows.
+  check('5G G1 the person/number stage is drawn as three paired groups (optionGroups [2,2,2])',
+    await stage(2).locator('.option-group').count() === 3
+      && await stage(2).locator('.option-group').first().locator('.tile').count() === 2
+      && await stage(2).evaluate(el => el.classList.contains('paired-groups')),
+    `${await stage(2).locator('.option-group').count()} groups`);
+
+  // NOTHING commits until the LAST empty stage is filled, however often the
+  // earlier ones are changed — the c8_drill_case rule, unchanged by the third
+  // stage (VERIFY-5F item 7 resolution).
+  await page.locator('.card').getByRole('button', { name: 'Score', exact: true }).click();
+  const scoreBefore = normalizeText(await page.locator('.live-score').innerText());
+  await clickStage(0, 'Present');
+  const afterOne = await feedbackKind();
+  await clickStage(1, 'Middle');
+  const afterTwo = await feedbackKind();
+  await clickStage(0, 'Future');           // an earlier stage stays re-clickable
+  const afterChange = await feedbackKind();
+  await shot('5G three-stage: two stages filled, nothing judged');
+  check('5G G1 filling two of three stages judges NOTHING, and stage 1 stays re-clickable',
+    afterOne === 'none' && afterTwo === 'none' && afterChange === 'none'
+      && normalizeText(await page.locator('.live-score').innerText()) === scoreBefore
+      && normalizeText(await stage(0).locator('.tile.selected').innerText()) === 'Future',
+    `feedback ${afterOne}/${afterTwo}/${afterChange}, score ${scoreBefore}`);
+
+  // ALL THREE RIGHT: one attempt, correct, auto-advances (B1a).
+  {
+    await go(HASH);
+    const { prompt, answer } = await answerFor();
+    if (!answer) {
+      check('5G G1 all three stages right: scored correct and auto-advances (B1a)', false, `ambiguous prompt ${prompt}`);
+    } else {
+      const before = await itemNumber();
+      await clickStage(0, answer[0]);
+      await clickStage(1, answer[1]);
+      const answeredAt = Date.now();
+      await stage(2).locator('.tile', { hasText: answer[2] }).first().click();
+      await page.waitForTimeout(180);
+      const kind = await feedbackKind();
+      const said = await awaitNextShown();
+      await shot('5G three-stage: all three right');
+      let late = await itemNumber();
+      while (late === before && Date.now() - answeredAt < CORRECT_MS * 3) {
+        await page.waitForTimeout(50);
+        late = await itemNumber();
+      }
+      check('5G G1 all three stages right: scored correct and auto-advances (B1a)',
+        kind === 'ok' && !said && late !== before,
+        `${JSON.stringify(prompt)} -> ${JSON.stringify(answer)}, feedback ${kind}, item ${before} -> ${late}`);
+    }
+  }
+
+  // THE TUPLE COMMITS ON THE LAST EMPTY STAGE, IN ANY ORDER. Filling person
+  // first and tense last commits on the TENSE click.
+  {
+    await go(HASH);
+    const { prompt, answer } = await answerFor();
+    if (!answer) {
+      check('5G G1 the tuple commits on the last EMPTY stage, whatever order it is filled in', false, `ambiguous prompt ${prompt}`);
+    } else {
+      await clickStage(2, answer[2]);
+      await clickStage(1, answer[1]);
+      const midKind = await feedbackKind();
+      await clickStage(0, answer[0]);
+      await page.waitForTimeout(180);
+      check('5G G1 the tuple commits on the last EMPTY stage, whatever order it is filled in',
+        midKind === 'none' && await feedbackKind() === 'ok',
+        `after two stages ${midKind}, after the third ${await feedbackKind()}`);
+    }
+  }
+
+  // A WRONG TUPLE: one attempt, manualOnIncorrect — reveals, waits, stays.
+  {
+    await go(HASH);
+    const { prompt, answer } = await answerFor();
+    if (!answer) {
+      check('5G G1 a wrong tuple reveals the answer, waits for Next and stays (manualOnIncorrect)', false, `ambiguous prompt ${prompt}`);
+    } else {
+      const before = await itemNumber();
+      await clickStage(0, answer[0]);
+      await clickStage(1, answer[1]);
+      const wrongPerson = ['First Singular', 'Third Plural'].find(value => value !== answer[2]);
+      await stage(2).locator('.tile', { hasText: wrongPerson }).first().click();
+      await page.waitForTimeout(INCORRECT_MS * 1.3);
+      await shot('5G three-stage: wrong person');
+      const revealed = (await stage(2).locator('.tile.correct').allInnerTexts()).map(normalizeText);
+      check('5G G1 a wrong tuple reveals the answer, waits for Next and stays (manualOnIncorrect)',
+        await feedbackKind() === 'bad' && await awaitNextShown()
+          && revealed.includes(normalizeText(answer[2]))
+          && await itemNumber() === before,
+        `revealed ${JSON.stringify(revealed)}, item ${before} -> ${await itemNumber()}`);
+    }
+  }
+
+  // §3.3: the Translate control the original prints on this drill. It was
+  // dead until buildTwoStageQuestions carried `translate` through — a button
+  // present and permanently disabled, which reads as a broken control.
+  {
+    await go(HASH);
+    const { prompt } = await answerFor();
+    const expected = activity.items.find(i => normalizeText(i.greek) === prompt);
+    const translate = page.locator('.card').getByRole('button', { name: 'Translate', exact: true });
+    const enabled = await translate.count() === 1 && !await translate.isDisabled();
+    if (enabled) { await translate.click(); await page.waitForTimeout(80); }
+    check('5G G1 Translate reveals the item translation (the two-stage builder now carries it)',
+      enabled && normalizeText(await page.locator('[data-reveal="translate"]').innerText())
+        === normalizeText(expected && expected.translate),
+      `enabled ${enabled}, expected ${JSON.stringify(expected && expected.translate)}`);
+  }
+}
+
+// ---- G2 the ch9 parsing grid is drawn in paired groups ------------------
+{
+  await go('#/activity/chapt_9/c9_drill_parsing');
+  const groups = page.locator('.option-groups .option-group');
+  check('5G G2 ch9 parsing: six options in three paired rows, as the original draws them',
+    await page.locator('.option-groups').first().evaluate(el => el.classList.contains('paired-groups'))
+      && await groups.count() === 3 && await groups.first().locator('.tile').count() === 2,
+    `${await groups.count()} groups`);
+  // ch3's parsing labels are 48 characters and MUST stay one per line: the
+  // paired layout is chosen by label length, so this is what proves the
+  // device-verified chapter-3 drill did not move under it.
+  await go('#/activity/chapt_3/c3_drill_parsing');
+  check('5G G2 ch3 parsing keeps one long option per line (paired grouping is by label length)',
+    !await page.locator('.option-groups').first().evaluate(el => el.classList.contains('paired-groups'))
+      && await page.locator('.option-groups .option-group.single').count() === 2);
+}
+
+// ---- G3 the single-topic page shows no topic rail (5G-SPEC1 §4.2) --------
+{
+  await go('#/activity/chapt_10/c10_learn_english_concepts');
+  const activity = activityById(ch10, 'c10_learn_english_concepts');
+  check('5G G3 a one-topic page shows NO topic navigation, and still shows its content',
+    activity.topics.length === 1 && await page.locator('.topic-controls').count() === 0
+      && await page.locator('.topic-count').count() === 0
+      && (await page.locator('.card .rich').innerText()).includes('We will go to college'),
+    `${await page.locator('.topic-controls').count()} topic controls`);
+  check('5G G3 the sequential rail is untouched by that (no dead-end Next, directive 7)',
+    !await page.locator('.rail-next').isDisabled());
+  // The multi-topic page next door still steps, so the rule is scoped to
+  // topics.length === 1 and not to topicPages as a whole.
+  await go('#/activity/chapt_10/c10_learn_future_verbs');
+  check('5G G3 a seven-topic page still shows its topic stepper',
+    await page.locator('.topic-controls').count() === 1
+      && normalizeText(await page.locator('.topic-count').innerText()) === '1 of 7');
+}
+
+// ---- G4 popups written as content blocks (5G-SPEC1 §4.3) -----------------
+{
+  // ch9: an ordinary word in running prose is the link, named outright by
+  // [[link:punctiliar]] — the popup's title is nothing like the run text, so
+  // the 5F slug route could not have found it.
+  await go('#/activity/chapt_9/c9_learn_mp_verbs');
+  const links = page.locator('.rc-para .popup-link');
+  check('5G G4 ch9 Introduction carries its two named popup links',
+    await links.count() === 2
+      && normalizeText(await links.first().innerText()) === 'punctiliar',
+    `${await links.count()} links`);
+  await links.first().click();
+  await page.waitForTimeout(150);
+  check('5G G4 the link opens the popup, whose body is rendered from content blocks',
+    await page.locator('.popup-sheet').getAttribute('data-popup-id') === 'punctiliar'
+      && await page.locator('.popup-sheet .popup-content .rc-para').count() === 1
+      && normalizeText(await page.locator('.popup-sheet .popup-content').innerText())
+        === 'Zach is hit by the ball.',
+    normalizeText(await page.locator('.popup-sheet').innerText()));
+  await page.locator('.popup-sheet').getByRole('button', { name: 'Cancel', exact: true }).click();
+  await page.waitForTimeout(80);
+  check('5G G4 Cancel closes it', await page.locator('.popup-sheet').count() === 0);
+
+  // ch9's Deponent Verbs TOPIC TITLE is itself the link (titleLink).
+  await gotoTopic(3);
+  check('5G G4 the Deponent Verbs topic TITLE is the link to its popup',
+    await page.locator('.topic-heading .popup-link').count() === 1
+      && normalizeText(await page.locator('.topic-heading').innerText()) === 'Deponent Verbs');
+  await page.locator('.topic-heading .popup-link').click();
+  await page.waitForTimeout(150);
+  check('5G G4 the title link opens the Deponent popup',
+    await page.locator('.popup-sheet').getAttribute('data-popup-id') === 'deponent');
+  await page.locator('.popup-sheet').getByRole('button', { name: 'Cancel', exact: true }).click();
+  await page.waitForTimeout(80);
+
+  // ch10: five stem-variation popups whose bodies are presentFutureRows in
+  // the ARROW form the original prints inside a popup.
+  await go('#/activity/chapt_10/c10_learn_future_verbs');
+  await gotoTopic(3);
+  const stemLinks = page.locator('.rc-list .popup-link');
+  check('5G G4 all five stem variations carry a popup link on their own line',
+    await stemLinks.count() === 5, `${await stemLinks.count()} links`);
+  await stemLinks.first().click();
+  await page.waitForTimeout(150);
+  const sheet = page.locator('.popup-sheet');
+  check('5G G4 the palatal popup is a presentFutureRows chart in ARROW form, Greek tappable on both sides',
+    await sheet.getAttribute('data-popup-id') === 'palatal'
+      && await sheet.locator('.rc-pfrows.arrow-form').count() === 1
+      && await sheet.locator('.rc-pfrow').count() === 2
+      && await sheet.locator('.rc-pfgreek:not([disabled])').count() === 4,
+    normalizeText(await sheet.innerText()));
+  await page.evaluate(() => { window.__clips.length = 0; });
+  await sheet.locator('.rc-pfgreek').first().click();
+  await page.waitForTimeout(250);
+  check('5G G4 a Greek cell in a popup plays its own clip (directive 9)',
+    (await clips()).length === 1, JSON.stringify(await clips()));
+  await sheet.getByRole('button', { name: 'Cancel', exact: true }).click();
+  await page.waitForTimeout(80);
+}
+
+// ---- G5 presentFutureRows in the HEADED form (5G-SPEC1 §4.4) -------------
+{
+  await go('#/activity/chapt_10/c10_learn_future_verbs');
+  await gotoTopic(5);
+  const chart = page.locator('.rc-pfrows');
+  check('5G G5 Deponent Futures is a two-column chart under underlined Present / Future headers',
+    await chart.count() === 1
+      && !await chart.evaluate(el => el.classList.contains('arrow-form'))
+      && await chart.locator('.rc-pfhead span').count() === 2
+      && normalizeText(await chart.locator('.rc-pfhead').innerText()) === 'Present Future'
+      && await chart.locator('.rc-pfrow').count() === 3,
+    normalizeText(await chart.innerText()));
+  check('5G G5 deponent rows gloss the FUTURE side only; the Greek on both sides is tappable',
+    await chart.locator('.rc-pfcell[data-side="future"] .rc-pfgloss').count() === 3
+      && await chart.locator('.rc-pfcell[data-side="present"] .rc-pfgloss').count() === 0
+      && await chart.locator('.rc-pfgreek:not([disabled])').count() === 6);
+  // gotoTopic steps FORWARD from wherever the page already is; the next topic
+  // is one click away, not six.
+  await gotoTopic(1);
+  check('5G G5 irregular rows gloss BOTH sides',
+    await page.locator('.rc-pfcell[data-side="future"] .rc-pfgloss').count() === 2
+      && await page.locator('.rc-pfcell[data-side="present"] .rc-pfgloss').count() === 2);
+  // §3.2: the topic title's Greek word is the tap target, the English is not.
+  await go('#/activity/chapt_10/c10_learn_future_verbs');
+  await gotoTopic(4);
+  check('5G G5 the Future of eimi topic title taps its Greek word only (titleAudio)',
+    await page.locator('.topic-heading .greek-tap').count() === 1
+      && normalizeText(await page.locator('.topic-heading .greek-tap').innerText()) === 'εἰμί');
+}
+
+// ---- G6 the compound-verb preposition suffix (5G-SPEC1 §2.3) -------------
+{
+  await go('#/activity/chapt_9/c9_learn_mp_verbs');
+  await gotoTopic(5);
+  const rows = page.locator('.rc-greekrows.compound-verbs .rc-greekrow');
+  check('5G G6 four compound verbs, three of them carrying a tappable preposition',
+    await rows.count() === 4
+      && await page.locator('.rc-greeksuffix').count() === 3
+      && normalizeText(await page.locator('.rc-greeksuffix').first().innerText()) === '(εἰς)');
+  // The suffix has its OWN clip, distinct from the headword's. Same standard
+  // as P3.5: the MAPPING is pinned in the data, the one-tap-one-clip behavior
+  // is measured on the page, and the FILE is proved against the whole run's
+  // audio request log. The element src is a blob: URL and never names the
+  // file, so two plays can only be told apart by what they fetched.
+  {
+    const compound = activityById(ch9, 'c9_learn_mp_verbs')
+      .topics.find(t => t.id === 'compoundVerbs')
+      .content.find(b => b.type === 'greekRows');
+    const eiserchomai = compound.rows[1];
+    check('5G G6 pinned: the headword and its preposition carry DIFFERENT clips',
+      eiserchomai.audio === 'chapt_9_i_voc5' && eiserchomai.suffix.audio === 'chapt_9_i_eis',
+      JSON.stringify([eiserchomai.audio, eiserchomai.suffix.audio]));
+    await page.evaluate(() => { window.__clips.length = 0; });
+    await page.locator('.rc-greeksuffix').first().click();
+    await page.waitForTimeout(300);
+    const suffixClips = (await clips()).length;
+    await page.evaluate(() => { window.__clips.length = 0; });
+    await rows.nth(1).locator('.rc-greekword').click();
+    await page.waitForTimeout(300);
+    const wordClips = (await clips()).length;
+    const everFetched = audioRequests.join(' ');
+    check('5G G6 each tap plays exactly one clip, and the preposition\u2019s file reached the wire this run',
+      suffixClips === 1 && wordClips === 1
+        && everFetched.includes('i_eis.m4a') && everFetched.includes('i_voc5.m4a'),
+      `${suffixClips} / ${wordClips} clips; i_eis fetched ${everFetched.includes('i_eis.m4a')}, i_voc5 fetched ${everFetched.includes('i_voc5.m4a')}`);
+  }
+}
+
+// ---- G7 the composite Hint: two charts, one popup (5G-SPEC1 §4.8) --------
+for (const [chapterId, activityId, first, second] of [
+  ['chapt_9', 'c9_drill_parsing', 'Present Middle Indicative Paradigm', 'Present Passive Indicative Paradigm'],
+  ['chapt_9', 'c9_drill_translation', 'Present Middle Indicative Paradigm', 'Present Passive Indicative Paradigm'],
+  ['chapt_10', 'c10_drill_parsing', 'Future Active Indicative Paradigm', 'Future Middle Indicative Paradigm'],
+  ['chapt_10', 'c10_drill_translation', 'Future Active Indicative Paradigm', 'Future Middle Indicative Paradigm']
+]) {
+  await go(`#/activity/${chapterId}/${activityId}`);
+  await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
+  await page.waitForTimeout(150);
+  const modal = page.locator('.hint-modal');
+  const titles = (await modal.locator('.pg-title').allInnerTexts()).map(normalizeText);
+  check(`5G G7 ${activityId}: Hint opens ONE popup holding BOTH charts, stacked`,
+    await modal.count() === 1 && await modal.locator('.paradigm').count() === 2
+      && titles[0] === first && titles[1] === second
+      && await modal.locator('[data-paradigm-switch]').count() === 0,
+    JSON.stringify(titles));
+  await modal.getByRole('button', { name: 'Close', exact: true }).click();
+  await page.waitForTimeout(80);
+  check(`5G G7 ${activityId}: the Hint closes`, await page.locator('.hint-modal').count() === 0);
+}
+
+// ---- G8 the Quick Review paradigm pair is stacked, not paged ------------
+for (const [chapterId, activityId] of [
+  ['chapt_9', 'c9_qr_paradigms'], ['chapt_10', 'c10_qr_paradigms']
+]) {
+  await go(`#/activity/${chapterId}/${activityId}`);
+  check(`5G G8 ${activityId}: both charts on one page, no More/Back pager`,
+    await page.locator('.paradigm-stack .paradigm').count() === 2
+      && await page.locator('.pg-nav').count() === 0,
+    `${await page.locator('.paradigm').count()} charts, ${await page.locator('.pg-nav').count()} pagers`);
+}
+// Chapter 8's three-chart stack is NAMED and stays a More/Back sequence: the
+// naming rule is what tells the two apart, so this is what proves the
+// device-verified pager did not become a stack.
+await go('#/activity/chapt_8/c8_qr_third');
+check('5G G8 ch8 third person stays a More/Back sequence (its charts are named)',
+  await page.locator('.paradigm-stack').count() === 0
+    && await page.locator('.paradigm').count() === 1
+    && await page.locator('[data-paradigm-switch="more"]').count() === 1);
+
+// ---- G9 "Repeat This Exercise" (5G-SPEC1 §4.5) ---------------------------
+// PRESENCE and DEFAULT only. The behavior behind the box is EXTRAPOLATED
+// (replay the verse, clear the slate, completion unaffected) and VERIFY-5G
+// item (d) is what settles it; asserting modelled semantics here would pin
+// down a guess as though it were the original. 5G-SPEC1 §7 says the same:
+// extend the harness for this path only after item (d) resolves.
+for (const [chapterId, activityId] of [
+  ['chapt_9', 'c9_ex_scripture_speller'], ['chapt_10', 'c10_ex_scripture_speller']
+]) {
+  await go(`#/activity/${chapterId}/${activityId}`);
+  const box = page.locator('.spell-checks [data-repeat-exercise] input');
+  check(`5G G9 ${activityId}: the Repeat This Exercise checkbox is present and OFF by default`,
+    await box.count() === 1 && !await box.isChecked()
+      && normalizeText(await page.locator('.spell-checks [data-repeat-exercise]').innerText()) === 'Repeat This Exercise');
+}
+// The whole-verse spellers of the earlier chapters have no such control in
+// the original and gain none here.
+for (const [chapterId, activityId] of [
+  ['chapt_3', 'c3_ex_scripture_speller'], ['chapt_8', 'c8_ex_scripture_speller']
+]) {
+  const activity = activityById(CHAPTERS[chapterId], activityId);
+  if (!activity) continue;
+  await go(`#/activity/${chapterId}/${activityId}`);
+  check(`5G G9 ${activityId} (pre-ch9): no Repeat checkbox`,
+    await page.locator('.spell-checks [data-repeat-exercise]').count() === 0);
+}
+
+
 await browser.close();
 const failed = results.filter(r => !r.ok);
 console.log(`\n${results.length - failed.length}/${results.length} behavior checks passed`);
diff --git a/scripts/ui-modals.mjs b/scripts/ui-modals.mjs
index 4c61234..b3785cf 100644
--- a/scripts/ui-modals.mjs
+++ b/scripts/ui-modals.mjs
@@ -138,6 +138,35 @@ const SURFACES = [
     await page.locator('.popup-link').first().click();
     await page.waitForTimeout(180);
   }],
+  // 5G: the cohort's new modals. The COMPOSITE hint is the tallest thing in
+  // the app now — two full paradigm charts with glosses in one dialog — so it
+  // is exactly the surface the modal-sizing rule exists for, and it is
+  // captured on both chapters. The popups are the content[] shape: a one-line
+  // aside, a six-row Greek list, and the arrow-form derivation chart.
+  ['ch9-composite-hint-middle-passive', hint('chapt_9', 'c9_drill_parsing', false)],
+  ['ch10-composite-hint-future-active-middle', hint('chapt_10', 'c10_drill_parsing', false)],
+  ['ch9-popup-punctiliar', async () => {
+    await go('#/activity/chapt_9/c9_learn_mp_verbs');
+    await page.locator('.rc-para .popup-link').first().click();
+    await page.waitForTimeout(180);
+  }],
+  ['ch9-popup-frequent-verbs', async () => {
+    await go('#/activity/chapt_9/c9_learn_mp_verbs');
+    for (let i = 0; i < 3; i++) { await page.getByRole('button', { name: 'Next Topic', exact: true }).click(); await page.waitForTimeout(80); }
+    await page.locator('.rc-para .popup-link').first().click();
+    await page.waitForTimeout(180);
+  }],
+  ['ch10-popup-palatal', async () => {
+    await go('#/activity/chapt_10/c10_learn_future_verbs');
+    for (let i = 0; i < 3; i++) { await page.getByRole('button', { name: 'Next Topic', exact: true }).click(); await page.waitForTimeout(80); }
+    await page.locator('.rc-list .popup-link').first().click();
+    await page.waitForTimeout(180);
+  }],
+  ['ch10-verse-speller-greek-keyboard', async () => {
+    await go('#/activity/chapt_10/c10_ex_scripture_speller');
+    await page.locator('.card').getByRole('button', { name: 'Greek Keyboard', exact: true }).click();
+    await page.waitForTimeout(180);
+  }],
   ['ch6-speller-greek-keyboard', async () => {
     await go('#/activity/chapt_6/c6_ex_speller');
     await page.locator('.card').getByRole('button', { name: 'Greek Keyboard', exact: true }).click();
diff --git a/scripts/ui-offline.mjs b/scripts/ui-offline.mjs
new file mode 100644
index 0000000..18f7166
--- /dev/null
+++ b/scripts/ui-offline.mjs
@@ -0,0 +1,67 @@
+// OFFLINE REGRESSION (ONBOARD-SOL §7, standing directive 4: offline behavior
+// never regresses). Install the service worker, cut the network, walk the
+// chapters' rails and refresh on an activity route.
+//
+// Every round has owed this check and every round has done it by hand, which
+// is why it is a script now: `npm run ui:offline [-- --chapters=chapt_9,...]`,
+// against a preview server. Audio is not shipped to the preview, so audio
+// requests and their toasts are expected and ignored; what is proved here is
+// that the shell, the chapter CHUNKS and the lexicon chunks are all precached
+// and that nothing on the route path needs the network.
+import { chromium } from 'playwright-core';
+import { readFileSync } from 'node:fs';
+
+const args = Object.fromEntries(process.argv.slice(2)
+  .filter(a => a.startsWith('--'))
+  .map(a => { const i = a.indexOf('='); return i === -1 ? [a.slice(2), true] : [a.slice(2, i), a.slice(i + 1)]; }));
+const CHAPTERS = String(args.chapters || 'chapt_9,chapt_10').split(',');
+const BASE = process.env.BASE || `http://localhost:${args.port || 4173}`;
+async function launch() {
+  try { return await chromium.launch(); } catch {
+    for (const channel of ['chrome', 'msedge']) {
+      try { return await chromium.launch({ channel }); } catch { /* next */ }
+    }
+    throw new Error('no browser');
+  }
+}
+const dataFor = id => JSON.parse(readFileSync(`src/data/chapt-${String(id.split('_')[1]).padStart(2, '0')}.json`, 'utf8'));
+
+const browser = await launch();
+const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
+const page = await context.newPage();
+const errors = [];
+page.on('console', m => {
+  if (m.type() !== 'error') return;
+  const t = m.text();
+  if (/\/audio\/|blob:|ERR_FILE_NOT_FOUND|Failed to load resource/.test(t)) return;
+  errors.push(t);
+});
+page.on('pageerror', e => errors.push(String(e)));
+
+await page.goto(`${BASE}/`, { waitUntil: 'load' });
+await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 30000 });
+// Give the precache a moment to settle before the network is cut.
+await page.waitForTimeout(1500);
+await context.setOffline(true);
+console.log('service worker installed; network offline');
+
+let stops = 0;
+let missing = 0;
+for (const chapterId of CHAPTERS) {
+  for (const activityId of dataFor(chapterId).sequence) {
+    await page.goto(`${BASE}/#/activity/${chapterId}/${activityId}`, { waitUntil: 'load' });
+    const ok = await page.waitForSelector('.card', { timeout: 15000 }).then(() => true).catch(() => false);
+    if (!ok) { console.log(`OFFLINE MISS ${chapterId}/${activityId}`); missing += 1; continue; }
+    stops += 1;
+  }
+}
+// A REFRESH on an activity route, offline: the hardest case, because nothing
+// is warm and the chunk has to come from the precache.
+await page.reload({ waitUntil: 'load' });
+const refreshed = await page.waitForSelector('.card', { timeout: 15000 }).then(() => true).catch(() => false);
+await context.setOffline(false);
+await browser.close();
+
+console.log(`offline: ${stops} stops rendered, ${missing} missing, refresh ${refreshed ? 'OK' : 'FAILED'}`);
+console.log(errors.length ? `CONSOLE ERRORS: ${errors.length}\n${errors.slice(0, 5).join('\n')}` : 'no console errors');
+if (missing || !refreshed || errors.length) process.exitCode = 1;
diff --git a/scripts/ui-walk.mjs b/scripts/ui-walk.mjs
index 86705b1..9c00b07 100644
--- a/scripts/ui-walk.mjs
+++ b/scripts/ui-walk.mjs
@@ -39,8 +39,20 @@ const BASE = args.base || `http://localhost:${args.port || 4173}`;
 const OUT = args.out || `buildout/screenshots/walk-${RUN_ID}`;
 const WIDTHS = [{ name: '320', width: 320, height: 900 }, { name: '768', width: 768, height: 1100 }];
 const CHAPTERS = String(args.chapters || 'chapt_1,chapt_2,chapt_3,chapt_4,chapt_5').split(',');
+// WHICH chapters get checklist evidence and a 320px overflow line. This used
+// to be a literal /^chapt_[45]$/ -- the cohort that first needed it -- so
+// cohort 5F walked chapters 6-8 and reported overflow for neither. A cohort
+// gate written as a hard-coded chapter number rots silently at the next
+// cohort, and silence is the failure mode this whole script exists to break,
+// so the default is now every chapter WALKED. --focus= narrows it.
+const FOCUS = new Set(String(args.focus || CHAPTERS.join(',')).split(','));
 
-const dataFor = id => JSON.parse(readFileSync(`src/data/chapt-0${id.split('_')[1]}.json`, 'utf8'));
+// Data files are zero-PADDED to two digits, so chapter 10 is chapt-10.json,
+// not chapt-010.json. The old `chapt-0${n}` concatenation was correct for
+// exactly the nine chapters that existed when it was written and would have
+// thrown ENOENT on the first double-digit chapter walked.
+const fileNumber = id => String(id.split('_')[1]).padStart(2, '0');
+const dataFor = id => JSON.parse(readFileSync(`src/data/chapt-${fileNumber(id)}.json`, 'utf8'));
 
 // Stop BEFORE the browser launches, so a refusal costs nothing and cannot half-
 // write a corpus. An empty (or absent) directory is fine; anything else needs
@@ -129,7 +141,10 @@ const EXTRACT = () => {
   const structuralOverrun = structural.reduce((n, item) => Math.max(n, item.overrun), 0);
   const rail = document.querySelector('.rail');
   return {
-    heading: (card.querySelector('.topic-heading, .rc-heading') || {}).textContent || '',
+    // `.pg-title` is in the list since 5G: a topic whose chart title says the
+    // topic's heading AND MORE prints only the chart's, so on those pages the
+    // page heading IS the chart's title and the dump must still record it.
+    heading: (card.querySelector('.topic-heading, .rc-heading, .pg-title') || {}).textContent || '',
     text: card.innerText,
     marked, taps, lists, paras,
     buttons: [...card.querySelectorAll('button:not([hidden])')]
@@ -182,7 +197,7 @@ const chartGroupsIn = (node, found = []) => {
   }
   return found;
 };
-const expectedChecklistPageCount = CHAPTERS.filter(id => /^chapt_[45]$/.test(id))
+const expectedChecklistPageCount = CHAPTERS.filter(id => FOCUS.has(id))
   .reduce((total, chapterId) => {
     const data = dataFor(chapterId);
     return total + (data.sequence || []).reduce((pages, activityId) => {
@@ -228,7 +243,50 @@ async function captureInteractiveStates(page, source, prefix, record, context) {
     }
   }
 
+  // EVERY POPUP THE PAGE CAN OPEN, opened (ONBOARD §7: a pass counts as
+  // verification only if it interacts with everything a learner can interact
+  // with). ui-modals.mjs photographs a hand-listed set of popups at device
+  // heights to judge SIZING; this opens all of them, mechanically, as part of
+  // the rail walk, so a popup that renders garbled or empty cannot hide behind
+  // a list nobody remembered to extend. Every link route is covered: the
+  // underline-slug links of chapters 6-8, the numbered-marker links of chapter
+  // 7, the sense links of chapter 6, and 5G's named [[link:id]] runs and topic
+  // titles.
+  async function capturePopups(statePrefix) {
+    const links = page.locator('.card .popup-link, .card .rc-num-popup');
+    const count = await links.count();
+    const seen = new Set();
+    for (let i = 0; i < count; i++) {
+      const link = links.nth(i);
+      if (!await link.isVisible()) continue;
+      await link.click();
+      await page.waitForTimeout(120);
+      const sheet = page.locator('.popup-sheet');
+      if (!await sheet.count()) {
+        report.interactionErrors.push({ ...context, state: statePrefix, error: `popup link ${i + 1} opened nothing` });
+        continue;
+      }
+      const id = (await sheet.getAttribute('data-popup-id')) || String(i + 1);
+      if (!seen.has(id)) {
+        seen.add(id);
+        await record(`${statePrefix}--popup-${slug(id)}`, `popup: ${id}`);
+      }
+      const cancel = sheet.getByRole('button', { name: 'Cancel', exact: true });
+      if (!await cancel.count()) {
+        report.interactionErrors.push({ ...context, state: statePrefix, error: `popup "${id}" has no Cancel` });
+        break;
+      }
+      await cancel.click();
+      await page.waitForTimeout(60);
+      if (await page.locator('.popup-sheet').count()) {
+        report.interactionErrors.push({ ...context, state: statePrefix, error: `popup "${id}" did not close` });
+        break;
+      }
+    }
+  }
+
   await captureExpanders(prefix);
+  await capturePopups(prefix);
   const groups = chartGroupsIn(source);
   for (const group of groups) {
     for (let index = 1; index < group.charts.length; index++) {
@@ -333,7 +391,7 @@ for (const size of WIDTHS) {
           measured.push(topicShot);
           baseShot.topics.push(topicShot);
           baseShot.states.push(topicShot);
-          if (/^chapt_[45]$/.test(chapterId)) {
+          if (FOCUS.has(chapterId)) {
             report.checklistPages.push({
               ...evidence,
               topic: i + 1,
@@ -345,7 +403,7 @@ for (const size of WIDTHS) {
           await captureInteractiveStates(page, activity?.topics?.[i] || {}, name, recordExtra, evidence);
         }
       } else {
-        if (/^chapt_[45]$/.test(chapterId)) {
+        if (FOCUS.has(chapterId)) {
           report.checklistPages.push({
             ...evidence,
             title: activity?.title || activityId,
@@ -390,7 +448,7 @@ for (const size of WIDTHS) {
         }
       }
 
-      if (size.name === '320' && /^chapt_[45]$/.test(chapterId)) {
+      if (size.name === '320' && FOCUS.has(chapterId)) {
         const worst = measured.reduce((best, state) => state.overrunPx > best.overrunPx ? state : best, measured[0]);
         report.overflow320.push({
           chapterId,
@@ -415,11 +473,11 @@ const stops = Object.values(report.chapters).reduce((n, c) => n + Object.keys(c.
 const clipped = report.overflow320.filter(item => item.overrunPx > 0);
 console.log(`walked ${stops} stops x ${WIDTHS.length} widths -> ${OUT}`);
 console.log(`checklist evidence: ${report.checklistPages.length} width-specific shots (${expectedChecklistPageCount} pages x ${WIDTHS.length} expected)`);
-console.log('320px overflow by new-chapter rail stop:');
+console.log(`320px overflow by rail stop (${[...FOCUS].join(', ')}):`);
 for (const item of report.overflow320) {
   console.log(` ${item.chapterId}/${item.activityId}: ${item.overrunPx}px${item.overrunPx ? ` (${item.state})` : ''}`);
 }
-console.log(clipped.length ? `HORIZONTAL OVERFLOW: ${clipped.length} new-chapter stops` : 'no horizontal overflow in chapters 4 or 5');
+console.log(clipped.length ? `HORIZONTAL OVERFLOW: ${clipped.length} stops` : `no horizontal overflow in ${[...FOCUS].join(', ')}`);
 console.log(report.railErrors.length ? `RAIL ERRORS: ${report.railErrors.length}` : 'all rail counts and Next actions are live');
 console.log(report.interactionErrors.length ? `INTERACTION ERRORS: ${report.interactionErrors.length}` : 'all authored expanders and chart states opened');
 console.log(report.consoleErrors.length ? `CONSOLE ERRORS: ${report.consoleErrors.length}` : 'no console errors');
diff --git a/src/app.css b/src/app.css
index c135c7f..c68b062 100644
--- a/src/app.css
+++ b/src/app.css
@@ -1345,3 +1345,114 @@ button, a, input, select, textarea, label,
    column (chapter 7's Review Adjectives Paradigm) ---- */
 .pg-numberband { grid-column: 1 / -1; text-align: right; padding: 6px 6px 2px;
   color: var(--accent-ink); font-weight: 700; font-size: 0.85rem; }
+
+/* ================================================================= COHORT 5G
+   Chapters 9 and 10. Five new surfaces, all of them the original's own
+   arrangement rather than a style choice: multi-line numbered items, the
+   present/future chart in its two printed forms, the compound-verb
+   preposition suffix, stacked paradigm pairs, and paired option groups. */
+
+/* ---- §4.6 a numbered item that carries its own line breaks ----
+   Line one stays INLINE so an item that also carries a label still reads as
+   one line. A single \n sets the next line APART UNDER it, indented further
+   than the item text — the rule then its formula ("if after a palatal
+   ( κ, γ, χ )" / "σ + [ κ, γ, χ] ==> ξ"), the case label then its example
+   ("Subjective case (Gk: nominative):" / "He hit the ball.", ch4railwalk p2).
+   A blank line is a PARAGRAPH break inside the item: air, no indent. */
+.rc-item-line { display: inline; }
+.rc-item-line.continuation { display: block; padding-left: 1.4em; }
+.rc-item-line.new-para { display: block; margin-top: 10px; }
+
+/* ---- §4.4 presentFutureRows ----
+   Two printed forms, one block. HEADED: a two-column chart, each form's gloss
+   on its own line under it (Deponent Futures, Irregular Futures). UNHEADED:
+   one derivation per line, "ἔχω ==> ἕξω", gloss beside it (the five stem
+   variation popups). Greek is tappable; glosses are ink (directive 9). */
+.rc-pfrows { display: flex; flex-direction: column; margin: 10px 0; min-width: 0; }
+.rc-pfhead { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;
+  padding: 7px 6px; border-bottom: 2px solid rgba(0,0,0,0.1); color: var(--teal-dark);
+  font-size: 0.85rem; font-weight: 700; text-align: center; }
+.rc-pfrow { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;
+  align-items: start; border-bottom: 1px solid rgba(0,0,0,0.06); padding: 9px 6px; min-width: 0; }
+.rc-pfcell { display: flex; flex-direction: column; align-items: flex-start; min-width: 0; }
+.rc-pfgreek { background: transparent; border: none; padding: 0; font: inherit;
+  font-family: var(--greek-font); font-size: 1.3rem; color: var(--link);
+  text-align: left; cursor: pointer; }
+.rc-pfgreek:disabled { color: var(--ink); cursor: default; }
+.rc-pfgloss { color: var(--teal-dark); font-size: 0.95rem; overflow-wrap: anywhere; }
+/* The arrow form is one flowing derivation plus a gloss. THE WHOLE BLOCK is
+   one grid and the rows are `display: contents`, so the arrows and the future
+   forms line up in columns down the popup exactly as the original prints them
+   ("ἔχω ==> ἕξω" over "ἄγω ==> ἄξω"). A per-row grid sized each row to its own
+   content and left the second arrow under the first form. At 320px the gloss
+   takes its own full-width line rather than squeezing the derivation; from
+   560px it sits beside it, which is the original's single-line form. */
+.rc-pfrows.arrow-form { display: grid; grid-template-columns: auto auto auto;
+  justify-content: start; align-items: baseline; column-gap: 8px; row-gap: 2px; }
+.rc-pfrows.arrow-form .rc-pfrow { display: contents; }
+.rc-pfrows.arrow-form .rc-pfcell { flex-direction: row; align-items: baseline; }
+.rc-pfrows.arrow-form .rc-pfgloss { grid-column: 1 / -1; margin-bottom: 8px; }
+.rc-pfarrow { color: var(--ink); font-size: 0.95rem; }
+@media (min-width: 560px) {
+  .rc-pfrows.arrow-form { grid-template-columns: auto auto auto minmax(0, 1fr); }
+  .rc-pfrows.arrow-form .rc-pfgloss { grid-column: auto; margin-bottom: 0; }
+}
+
+/* ---- §2.3 the compound-verb preposition ----
+   "εἰσέρχομαι | I go in, enter (εἰς)". The suffix is displayed Greek with a
+   clip of its own, so it is its own tap target beside the gloss. */
+.rc-greekrows.compound-verbs .rc-greekrow { grid-template-columns: minmax(6em, 40%) minmax(0, 1fr); }
+/* `.greek-say` is `display: block` app-wide (it is normally a whole row or a
+   whole prompt); the suffix sits INSIDE the gloss line, so it reclaims inline
+   flow the same way `.rc-part.greek-say` does. Without this it took a line of
+   its own and the preposition parted company with the gloss it belongs to. */
+.rc-greeksuffix { display: inline; width: auto; background: transparent; border: none;
+  padding: 0; font: inherit; font-family: var(--greek-font); color: var(--link);
+  cursor: pointer; }
+.rc-greeksuffix:disabled { color: var(--ink); cursor: default; }
+
+/* ---- §2.8/§3.7/§4.8 two charts on one page ----
+   The Middle+Passive and Future Active+Middle pairs are printed together, in
+   the Quick Review page and in the drills' Hint popup alike. Not a pager: a
+   rule separates them and both are on screen at once. */
+.paradigm-stack { display: flex; flex-direction: column; gap: 4px; }
+.paradigm-stack-rule { height: 1px; background: rgba(0,0,0,0.12); margin: 14px 0 10px; }
+
+/* ---- §4.1/§2.4 paired option groups ----
+   Chapter 3's parsing groups are one 48-character option per line and stack;
+   chapters 9 and 10 group SHORT labels in pairs ("First Singular | First
+   Plural"), which is how the original draws them, so those groups keep two
+   columns and the groups themselves stay stacked at every width. */
+.option-groups.paired-groups { grid-template-columns: 1fr; }
+@media (min-width: 560px) {
+  .option-groups.paired-groups { grid-template-columns: 1fr; gap: 10px; }
+}
+.option-groups.paired-groups .option-group + .option-group { border-top: none;
+  border-left: none; padding-top: 0; padding-left: 0; }
+
+/* THREE stages need marking off from each other. The original lays tense,
+   voice and person as three side-by-side COLUMNS, which no phone width can
+   hold, so the port stacks them in the same reading order — and stacked, the
+   two-option tense and voice stages are the same shape and would read as one
+   list of four. The rule is the same dark-green separator the grouped option
+   stacks already use. Two-stage drills (chapter 8's person + case grid) are
+   two different shapes already and keep their unmarked layout. */
+.stage-grid.stage-separated { border-top: 2px solid var(--teal-dark); padding-top: 10px; }
+
+/* A standing note under a drill's controls (chapter 10's deponent reminder).
+   Parenthetical aside, so it takes the note banner and sits with the
+   controls — never above the prompt (directive 2). */
+.drill-note { text-align: left; }
+
+/* A popup body written as content blocks (§4.3). */
+.popup-content { text-align: left; margin-top: 4px; }
+.popup-content .rich { color: var(--ink); }
+
+/* A topic heading that IS the link to its popup (chapter 9's Deponent Verbs),
+   and one whose Greek word plays its own clip (chapter 10's Future of εἰμί).
+   Both inherit the heading's size; the link keeps the underline that marks a
+   popup link everywhere else. */
+.topic-title-link { font: inherit; color: var(--link); }
+.topic-heading .greek-tap { font-size: 1em; }
+/* A [[link:id]] run: a popup link named outright rather than by slug. */
+.named-link { display: inline; }
diff --git a/src/components/ContentAudio.svelte b/src/components/ContentAudio.svelte
index da2e8d7..7c45939 100644
--- a/src/components/ContentAudio.svelte
+++ b/src/components/ContentAudio.svelte
@@ -8,10 +8,11 @@
   // panels; their per-mode data contracts are documented in HANDOFF-4 §5 (B1).
   import { onDestroy } from 'svelte';
   import { slide } from 'svelte/transition';
-  import { getGreekTapMap, resolveItems, shuffle } from '../lib/content.js';
+  import { getGreekTapMap, headingCovers, resolveItems, shuffle } from '../lib/content.js';
+  import { splitGreekRuns } from '../lib/greek.js';
   import { play, stop as stopAudio } from '../lib/audio.js';
   import { markCompleted } from '../lib/progress.js';
-  import { providePopups } from '../lib/popups.js';
+  import { providePopups, popupFor } from '../lib/popups.js';
   import RichContent from './RichContent.svelte';
   import ArrowCue from './ArrowCue.svelte';
   import Paradigm from './Paradigm.svelte';
@@ -24,7 +25,8 @@
   // here, over the whole activity, because that is what the original does.
   // Opening one stops whatever the page underneath was saying (rule A4).
   let openPopupPage = null;
-  providePopups(activity.popups, popup => { stopAudio(); openPopupPage = popup; });
+  const popupRegister = providePopups(activity.popups, popup => { stopAudio(); openPopupPage = popup; });
+  const openPopup = popup => { if (popup) popupRegister.open(popup); };
 
   // Items resolve from the data; activities flagged order:"shuffled"
   // (Pronounce Letters Exercise) get a fresh Fisher-Yates shuffle each visit.
@@ -72,6 +74,30 @@
   let topicIndex = 0;
   $: topics = activity.topics || [];
   $: currentTopic = topics[topicIndex] || null;
+  // 5G-SPEC1 §4.2: a topicPages activity with ONE topic shows no topic
+  // navigation at all. The original draws no radio rail on chapter 10's
+  // English Concepts page, and the port's equivalent — the Previous
+  // Topic / "1 of 1" / Next Topic stepper — would be three dead controls
+  // under a page that has nowhere to go. The content fills the card instead.
+  $: showTopicControls = topics.length > 1;
+  // A topic TITLE may itself be a control: chapter 9's Deponent Verbs heading
+  // opens the "Deponent" popup (titleLink), and chapter 10's "Future of εἰμί"
+  // taps its Greek word to that word's own clip (titleAudio). Both are the
+  // original's own behavior on the panel heading, and both are declared by the
+  // data — never inferred from the words in the title.
+  $: topicTitlePopup = currentTopic && currentTopic.titleLink
+    ? popupFor(popupRegister, currentTopic.titleLink)
+    : null;
+  // ONE HEADING, NOT TWO (5E-R1, extended in 5G). Where a topic's chart is
+  // titled with the topic's own heading AND MORE OF IT — the rail label
+  // "Present Middle Paradigm" over the panel heading "Present Middle
+  // Indicative Paradigm" — the original prints the fuller one in its panel and
+  // the shorter one only in the radio rail, which this port does not draw. So
+  // the chart's title stands and this heading steps aside. The reverse case
+  // (the chart title is an abbreviation of the topic's, chapter 5) is handled
+  // the other way round inside RichContent and is untouched.
+  $: topicTitleCovered = !!currentTopic && (currentTopic.content || [])
+    .some(block => block && headingCovers(block.title, currentTopic.title));
   $: activityGreekTaps = activity.greekTaps === true
     ? getGreekTapMap(chapter.id)
     : activity.greekTaps;
@@ -83,6 +109,15 @@
   $: paradigmPages = Array.isArray(activity.paradigms) && activity.paradigms.length
     ? activity.paradigms
     : (activity.paradigm ? [activity.paradigm] : []);
+  // 5G-SPEC1 §2.8/§3.7: two charts on ONE page, not a More/Back sequence.
+  // Chapters 9 and 10 print their Middle+Passive and Future Active+Middle
+  // paradigms stacked in a single panel (ch10railwalk p7 shows both charts
+  // under one Cancel), where chapter 8's third-person stack is genuinely
+  // paged. The data says which: a paged stack NAMES each chart, because the
+  // name is what the More/Back control and data-chart-name report; a stacked
+  // pair has no names to report because nothing is being switched between.
+  // check-content-shapes enforces all-or-none so the two can never blur.
+  $: stackedParadigms = paradigmPages.length > 1 && paradigmPages.every(chart => !chart || !chart.name);
   function goToParadigm(index) {
     const next = Math.max(0, Math.min(paradigmPages.length - 1, index));
     if (next === paradigmIndex) return;
@@ -192,7 +227,17 @@
 {:else if mode === 'topicPages'}
   <div class="card topic-page">
     {#if currentTopic}
-      <div class="topic-heading">{currentTopic.title}</div>
+      {#if !topicTitleCovered}
+        <div class="topic-heading">
+          {#if topicTitlePopup}
+            <button class="popup-link topic-title-link" on:click={() => openPopup(topicTitlePopup)}>{currentTopic.title}</button>
+          {:else if currentTopic.titleAudio}
+            {#each splitGreekRuns(currentTopic.title) as run}{#if run.greek}<button class="greek-tap greek" on:click={() => play(currentTopic.titleAudio)}>{run.t}</button>{:else}{run.t}{/if}{/each}
+          {:else}
+            {currentTopic.title}
+          {/if}
+        </div>
+      {/if}
       <!-- greekTaps is declared once for the whole activity (chapter 3's Learn
            Verbs wires λύουσιν / λύουσι / λύω, which appear in prose across
            three different topics) and a topic may still override it. -->
@@ -206,11 +251,13 @@
     {:else}
       <div class="pending-verification">Topic content pending verification.</div>
     {/if}
-    <div class="controls topic-controls">
-      <button class="btn secondary" on:click={() => goToTopic(topicIndex - 1)} disabled={topicIndex <= 0}>Previous Topic</button>
-      <span class="topic-count">{topics.length ? topicIndex + 1 : 0} of {topics.length}</span>
-      <button class="btn" on:click={() => goToTopic(topicIndex + 1)} disabled={!topics.length || topicIndex >= topics.length - 1}>Next Topic</button>
-    </div>
+    {#if showTopicControls}
+      <div class="controls topic-controls">
+        <button class="btn secondary" on:click={() => goToTopic(topicIndex - 1)} disabled={topicIndex <= 0}>Previous Topic</button>
+        <span class="topic-count">{topics.length ? topicIndex + 1 : 0} of {topics.length}</span>
+        <button class="btn" on:click={() => goToTopic(topicIndex + 1)} disabled={!topics.length || topicIndex >= topics.length - 1}>Next Topic</button>
+      </div>
+    {/if}
     {#if activity._topic_verify}<div class="pending-verification compact">Topic order pending verification.</div>{/if}
   </div>
 
@@ -223,7 +270,14 @@
        with Back stepping down) and may carry its Say Whole action beside the
        chart rather than inside it. -->
   <div class="card">
-    {#if paradigmPages.length}
+    {#if stackedParadigms}
+      <div class="paradigm-stack">
+        {#each paradigmPages as chart, chartIndex}
+          <Paradigm paradigm={chart} title={chart.title || null} />
+          {#if chartIndex < paradigmPages.length - 1}<div class="paradigm-stack-rule" aria-hidden="true"></div>{/if}
+        {/each}
+      </div>
+    {:else if paradigmPages.length}
       {@const page = paradigmPages[paradigmIndex] || paradigmPages[0]}
       <!-- 5F-FEEDBACK.pdf §8.1 root-cause fix: every pronoun paradigm now
            ships in the SAME cell-audio shape every other chapter's paradigm
diff --git a/src/components/Marked.svelte b/src/components/Marked.svelte
index d611401..7d66707 100644
--- a/src/components/Marked.svelte
+++ b/src/components/Marked.svelte
@@ -15,13 +15,22 @@
   // whose popup ids are exactly those slugs. A run that matches nothing stays
   // an ordinary underline, which is what keeps the "he himself will get the
   // car" emphasis on the same page from turning into a dead link.
+  //
+  // 5G: a [[link:id]] run names its popup outright (chapters 9 and 10 link
+  // words whose text is nothing like the popup's title). A link run whose id
+  // resolves to nothing renders as PLAIN TEXT, not as a dead blue word —
+  // directive 8: blue means tappable and only tappable.
   import { splitUnderline, splitMarkGroups } from '../lib/markup.js';
   import { ISOLATED_MARKS, spacingMarks } from '../lib/greek.js';
-  import { usePopups, popupFor } from '../lib/popups.js';
+  import { usePopups, popupFor, popupForRun } from '../lib/popups.js';
   export let text = '';
 
   const popups = usePopups();
-  const linked = run => (popups ? popupFor(popups, run) : null);
+  // An UNDERLINED run resolves by slug and only into a chapters 6-8 shaped
+  // popup (see popupForRun): chapter 9 underlines "deponent:" as an ordinary
+  // lead-in and ships a "deponent" popup opened from its topic title, and the
+  // original prints that lead-in in plain black.
+  const linked = run => (popups ? popupForRun(popups, run) : null);
 
   const GREEK_LETTER = /[Ͱ-Ͽἀ-῿]/;
   // A group's inner text is a MARK (enlarge, keyboard font), a Greek letter
@@ -33,4 +42,4 @@
   }
 </script>
 
-{#each splitUnderline(text) as seg}{#if seg.u}{@const popup = linked(seg.t)}{#if popup}<button class="popup-link underline-link" on:click={() => popups.open(popup)}>{seg.t}</button>{:else}<u>{seg.t}</u>{/if}{:else if seg.g}<span class="term-green">{seg.t}</span>{:else if seg.i}<em>{seg.t}</em>{:else}{#each splitMarkGroups(seg.t) as part}{#if part.group != null}<span class="mark-group">(&thinsp;<span class="isolated-mark" class:as-mark={kindOf(part.group) === 'mark'} class:greek={kindOf(part.group) === 'greek'}>{spacingMarks(part.group)}</span>&thinsp;)</span>{:else}{part.t}{/if}{/each}{/if}{/each}
+{#each splitUnderline(text) as seg}{#if seg.link}{@const popup = popups ? popupFor(popups, seg.link) : null}{#if popup}<button class="popup-link named-link" on:click={() => popups.open(popup)}>{seg.t}</button>{:else}{seg.t}{/if}{:else if seg.u}{@const popup = linked(seg.t)}{#if popup}<button class="popup-link underline-link" on:click={() => popups.open(popup)}>{seg.t}</button>{:else}<u>{seg.t}</u>{/if}{:else if seg.g}<span class="term-green">{seg.t}</span>{:else if seg.i}<em>{seg.t}</em>{:else}{#each splitMarkGroups(seg.t) as part}{#if part.group != null}<span class="mark-group">(&thinsp;<span class="isolated-mark" class:as-mark={kindOf(part.group) === 'mark'} class:greek={kindOf(part.group) === 'greek'}>{spacingMarks(part.group)}</span>&thinsp;)</span>{:else}{part.t}{/if}{/each}{/if}{/each}
diff --git a/src/components/PopupSheet.svelte b/src/components/PopupSheet.svelte
index 570e28c..85828da 100644
--- a/src/components/PopupSheet.svelte
+++ b/src/components/PopupSheet.svelte
@@ -9,10 +9,18 @@
   //   chapter 8  the three uses of αὐτός: a title and three, two and two
   //              examples (no Greek headword of its own).
   //
+  // 5G-SPEC1 §4.3 adds a fourth, and it is the one later chapters should use:
+  // chapters 9 and 10 carry their popup bodies as a `content[]` BLOCK LIST —
+  // the same block vocabulary the teaching topics use (para, numbered,
+  // presentFutureRows, greekRows), rendered by the same RichContent. One
+  // component, one block renderer, no per-chapter popup shape. The three
+  // flexible-dict fields above stay for the chapters that already ship them.
+  //
   // Greek-tap rule (directive 9): the headword and EVERY example phrase play
   // their own clip. Glosses and references are ink.
   import { play, stop as stopAudio } from '../lib/audio.js';
   import Marked from './Marked.svelte';
+  import RichContent from './RichContent.svelte';
   import { createEventDispatcher, onDestroy } from 'svelte';
   export let popup;
 
@@ -46,6 +54,10 @@
         </div>
       {/if}
 
+      {#if Array.isArray(popup.content) && popup.content.length}
+        <div class="popup-content"><RichContent blocks={popup.content} greekTaps={popup.greekTaps || null} /></div>
+      {/if}
+
       {#if popup.examples && popup.examples.length}
         <div class="popup-examples">
           {#each popup.examples as example, index}
diff --git a/src/components/RichContent.svelte b/src/components/RichContent.svelte
index 6426e8f..0112d79 100644
--- a/src/components/RichContent.svelte
+++ b/src/components/RichContent.svelte
@@ -5,12 +5,14 @@
   // rows and underlined list lead-ins are all load-bearing, not decoration.
   //
   // Block types: heading | subheading | para | numbered | defList | biblist |
-  // refs | note | greekRows | expander | paradigm. An unknown type renders LOUD
-  // (see the dispatch's final else) rather than vanishing.
+  // refs | note | greekRows | expander | paradigm | presentFutureRows. An
+  // unknown type renders LOUD (see the dispatch's final else) rather than
+  // vanishing.
   // Trailing { greek, caption?, audio? } "example" objects render in the Greek
   // font and play their clip on tap. defList rows [term, value, audio?] play
   // the row's clip when present.
   import { play } from '../lib/audio.js';
+  import { headingKey } from '../lib/content.js';
   import { splitMarkRun, splitTaps } from '../lib/greek.js';
   import { usePopups, popupFor } from '../lib/popups.js';
   import Marked from './Marked.svelte';
@@ -38,21 +40,11 @@
   // One delivered topic abbreviates Masculine to Masc while its chart spells
   // the word out ("First Declension—Masc" over "First Declension—Masculine",
   // chapter 5). They are the same heading in the original, not two stacked
-  // headings; normalize the authored abbreviation for deduplication only.
-  //
-  // This key used to match the literal `--Masc`, and the D2 em-dash rule
-  // silently broke it: once the stamper rewrote `--` as `—` the two titles no
-  // longer keyed the same and the heading came back doubled (5E-SPEC3-RESPONSE
-  // item 1). A dedup key must not depend on which dash the typographic pass
-  // last decided on, so every dash form folds to one and case and spacing fold
-  // with it. `masc` is the only abbreviation any delivered title uses; the
-  // sweep that established that is in ui-behavior.mjs, which now fails if a
-  // second one appears.
-  const titleKey = t => String(t || '').trim().toLowerCase()
-    .replace(/—|–|--/g, '-')
-    .replace(/\s+/g, ' ')
-    .replace(/\bmasc\b/, 'masculine');
-  const sameTitle = t => !!t && !!suppressTitle && titleKey(t) === titleKey(suppressTitle);
+  // headings; the fold that normalizes them lives in lib/content.js since 5G,
+  // because the topicPages HOST needs the identical rule for the other
+  // relationship (a chart title that says the topic's and more of it) and two
+  // copies of a fold rule is how the em-dash regression happened.
+  const sameTitle = t => !!t && !!suppressTitle && headingKey(t) === headingKey(suppressTitle);
 
   // The 6 Accent Rules topic ships the "Chart: Accent Possibilities" expander
   // TWICE, byte-identical (feedback 5: it renders twice on both devices). Data
@@ -85,6 +77,31 @@
   // Same lesson as biblist in chapter 2: normalize the shape at the renderer,
   // because the data is not ours to edit.
   const listItems = block => (block.items || []).map(it => (typeof it === 'string' ? { text: it } : (it || {})));
+  // A numbered item may carry its own hard line breaks, and the original means
+  // two different things by them:
+  //   \n    the next line is SET APART UNDER this one and indented further
+  //         than the item text — chapter 10's stem variations put the rule on
+  //         line one and its formula on line two; chapters 4 and 5 put the
+  //         case label on line one and its example sentence on line two
+  //         ("Subjective case (Gk: nominative):" / "He hit the ball.",
+  //         ch4railwalk p2).
+  //   \n\n  a new PARAGRAPH inside the item — a blank line, no indent
+  //         (chapter 1's Six Points pronunciation note).
+  // The lines are SPLIT rather than left to a pre-line white-space rule,
+  // because no white-space rule can indent one line inside a flow. Formula
+  // brackets and ==> arrows are the original's own LITERAL notation and pass
+  // through as text (5G-SPEC1 §3.2).
+  function itemLines(text) {
+    const raw = String(text || '').split('\n');
+    const lines = [];
+    let gap = false;
+    for (const line of raw) {
+      if (!line.trim() && lines.length) { gap = true; continue; }   // blank = paragraph break
+      lines.push({ text: line, gap });
+      gap = false;
+    }
+    return lines.length ? lines : [{ text: '', gap: false }];
+  }
   // LABEL STYLES on a numbered list (5D-SPEC2 §6). The original's chapter-3
   // teaching lists lead each item with a term set apart from the sentence that
   // follows — underlined (its blue hotwords: "Active voice", "Indicative mood",
@@ -205,7 +222,7 @@
             {#if markerPopup}
               <button class="rc-num rc-num-popup" on:click={() => openPopup(markerPopup)}>{idx + 1})</button>
             {/if}
-            {#if it.label}{#if selfNum}<span class="rc-num">{it.label}</span>{it.text ? ' ' : ''}{:else if b.labelStyle === 'underline'}<u class="rc-lead-u">{it.label}</u>{joiner(it.text)}{:else if b.labelStyle === 'plain'}<span class="rc-lead-plain">{it.label}</span>{joiner(it.text)}{:else}<span class="rc-lead">{it.label}</span>{it.text ? ' — ' : ''}{/if}{/if}{#if itemTaps}{#each splitTaps(it.text, itemTaps) as seg}{#if seg.popup}<button class="greek-tap popup-link greek" on:click={() => openPopup(seg.popup)}>{seg.t}</button>{:else if markerPopup && seg.t === markerPopup.greek}<button class="greek-tap popup-link greek rc-word-popup" on:click={() => openPopup(markerPopup)}>{seg.t}</button>{:else if seg.audio}<button class="greek-tap greek" on:click={() => playAudio(seg.audio)}>{seg.t}</button>{:else}<Marked text={seg.t} />{/if}{/each}{:else}<Marked text={it.text || ''} />{/if}
+            {#if it.label}{#if selfNum}<span class="rc-num">{it.label}</span>{it.text ? ' ' : ''}{:else if b.labelStyle === 'underline'}<u class="rc-lead-u">{it.label}</u>{joiner(it.text)}{:else if b.labelStyle === 'plain'}<span class="rc-lead-plain">{it.label}</span>{joiner(it.text)}{:else}<span class="rc-lead">{it.label}</span>{it.text ? ' — ' : ''}{/if}{/if}{#each itemLines(it.text) as line, lineIndex}<span class="rc-item-line" class:continuation={lineIndex > 0 && !line.gap} class:new-para={line.gap}>{#if itemTaps}{#each splitTaps(line.text, itemTaps) as seg}{#if seg.popup}<button class="greek-tap popup-link greek" on:click={() => openPopup(seg.popup)}>{seg.t}</button>{:else if markerPopup && seg.t === markerPopup.greek}<button class="greek-tap popup-link greek rc-word-popup" on:click={() => openPopup(markerPopup)}>{seg.t}</button>{:else if seg.audio}<button class="greek-tap greek" on:click={() => playAudio(seg.audio)}>{seg.t}</button>{:else}<Marked text={seg.t} />{/if}{/each}{:else}<Marked text={line.text} />{/if}</span>{/each}
             {#if it.example}
               <button class="rc-example" class:tappable={it.example.audio} on:click={() => playAudio(it.example.audio)}>
                 <span class="greek">{it.example.greek}</span>
@@ -303,6 +320,7 @@
       {@const gridVars = `--greek-cols:${syllableMatrix ? matrixCols : (b.columns || []).length};--greek-datacols:${(b.columns || []).length}`}
       <div class="rc-greekrows" class:syllable-matrix={syllableMatrix} class:row-labels={rowLabels}
            class:gloss-only={b.layout === 'glossOnly'} class:english-pairs={b.layout === 'englishPairs'}
+           class:compound-verbs={b.layout === 'compoundVerbs'}
            class:titled={b.title} class:centered={b.centered} class:rc-gap-before={b.gapBefore}
            class:head-underline={b.headerUnderline} class:paired-gutter={b.pairedGutter}>
         <!-- B5: Review Marks groups its rows under a title ("Breathing:",
@@ -419,7 +437,8 @@
               {#if row.ref}<span class="rc-greekref">{row.ref}</span>{/if}
             </div>
           {:else}
-            {@const cellCount = (row.label ? 1 : 0) + (row.greek ? 1 : 0) + (row.gloss != null && row.gloss !== '' ? 1 : 0)}
+            {@const cellCount = (row.label ? 1 : 0) + (row.greek ? 1 : 0)
+              + ((row.gloss != null && row.gloss !== '') || row.suffix ? 1 : 0)}
             <div class="rc-greekrow" style={`--greek-cols:${Math.max(cellCount, 1)}`}>
               {#if row.label}<span class="rc-greeklabel"><Marked text={row.label} /></span>{/if}
               {#if row.greek}
@@ -437,7 +456,17 @@
                   </span>
                 {/if}
               {/if}
-              {#if row.gloss != null && row.gloss !== ''}<span class="rc-greekgloss"><Marked text={row.gloss} /></span>{/if}
+              {#if row.gloss != null && row.gloss !== ''}
+                <!-- 5G: chapter 9's Compound Verbs rows print the preposition
+                     the compound is built from AFTER the gloss, in its own
+                     parentheses ("I go in, enter (εἰς)"). It is displayed
+                     Greek with a clip of its own, so it is a tap target of its
+                     own (directive 9) — and separate from the headword's, so
+                     the two never speak over each other. -->
+                <span class="rc-greekgloss"><Marked text={row.gloss} />{#if row.suffix}{' '}<button class="rc-greeksuffix greek greek-say" disabled={!row.suffix.audio} on:click={() => playAudio(row.suffix.audio)}>{row.suffix.greek}</button>{/if}</span>
+              {:else if row.suffix}
+                <span class="rc-greekgloss"><button class="rc-greeksuffix greek greek-say" disabled={!row.suffix.audio} on:click={() => playAudio(row.suffix.audio)}>{row.suffix.greek}</button></span>
+              {/if}
               {#if row.ref}<span class="rc-greekref">{row.ref}</span>{/if}
             </div>
           {/if}
@@ -445,6 +474,54 @@
         {#if b._verify}<div class="pending-verification compact">Some chart details are pending verification.</div>{/if}
       </div>
 
+    {:else if b.type === 'presentFutureRows'}
+      <!-- 5G-SPEC1 §4.4: a present form beside its future. The SAME data shape
+           serves the chapter's two teaching charts and its five stem-variation
+           popups, because the original prints them two ways and the difference
+           is exactly whether the chart is HEADED:
+             headers  a two-column chart under "Present" / "Future" headings,
+                      each form's gloss on its own line under it (the Deponent
+                      Futures and Irregular Futures topics).
+             none     one derivation per line, "ἔχω ==> ἕξω", with the gloss
+                      beside it (the palatal/labial/dental/liquid/sibilant
+                      popups). The arrow is the original's own notation.
+           A block may also say so outright with layout: "arrow" | "columns".
+           Greek cells are tap targets; glosses are not (directive 9). -->
+      {@const arrowForm = b.layout === 'arrow' || (b.layout !== 'columns' && !Array.isArray(b.headers))}
+      <div class="rc-pfrows" class:arrow-form={arrowForm} class:rc-gap-before={b.gapBefore}>
+        {#if Array.isArray(b.headers) && b.headers.length}
+          <div class="rc-pfhead">{#each b.headers as header}<span><Marked text={header} /></span>{/each}</div>
+        {/if}
+        {#each b.rows || [] as row}
+          {@const present = row.present || {}}
+          {@const future = row.future || {}}
+          {#if arrowForm}
+            <div class="rc-pfrow">
+              <span class="rc-pfcell" data-side="present">
+                <button class="rc-pfgreek greek greek-say" disabled={!present.audio}
+                        on:click={() => playAudio(present.audio)}>{present.greek || ''}</button>
+              </span>
+              <span class="rc-pfarrow" aria-hidden="true">==&gt;</span>
+              <span class="rc-pfcell" data-side="future">
+                <button class="rc-pfgreek greek greek-say" disabled={!future.audio}
+                        on:click={() => playAudio(future.audio)}>{future.greek || ''}</button>
+              </span>
+              <span class="rc-pfgloss">{#if future.gloss}<Marked text={future.gloss} />{/if}{#if present.gloss}<Marked text={present.gloss} />{/if}</span>
+            </div>
+          {:else}
+            <div class="rc-pfrow">
+              {#each [present, future] as cell, sideIndex}
+                <span class="rc-pfcell" data-side={sideIndex === 0 ? 'present' : 'future'}>
+                  <button class="rc-pfgreek greek greek-say" disabled={!cell.audio}
+                          on:click={() => playAudio(cell.audio)}>{cell.greek || ''}</button>
+                  {#if cell.gloss}<span class="rc-pfgloss"><Marked text={cell.gloss} /></span>{/if}
+                </span>
+              {/each}
+            </div>
+          {/if}
+        {/each}
+      </div>
+
     {:else if b.type === 'paradigm'}
       <!-- A conjugation/declension chart. Its own component because the same
            grid is ALSO a full-page contentAudio mode (paradigmChart) and the
diff --git a/src/components/SelectActivity.svelte b/src/components/SelectActivity.svelte
index a233bde..84354c5 100644
--- a/src/components/SelectActivity.svelte
+++ b/src/components/SelectActivity.svelte
@@ -139,6 +139,17 @@
   // phone width and sit side by side once there is room (the six full parsing
   // labels are 46 characters — two columns inside 320px would be unreadable).
   $: optionGroups = optionClass === 'grouped' ? sliceGroups(currentOptions, activity.optionGroups) : null;
+  // How WIDE a group is. Chapter 3's six full parsings are 48 characters and
+  // stack one per line; chapter 9's "Second Singular" is fifteen and the
+  // original draws its six options as three PAIRED rows — same optionGroups
+  // mechanism, two different densities, decided by the labels rather than by
+  // the chapter. The threshold is the same 24 the ungrouped grids use, so a
+  // grouped drill and a plain one break to one column at the same width.
+  $: groupClass = groupClassFor(currentOptions);
+  function groupClassFor(list) {
+    const longest = (list || []).reduce((n, option) => Math.max(n, String(option.label).length), 0);
+    return longest > 24 ? 'single' : '';
+  }
   $: greekOptions = !!activity.optionsAreGreek || activity.options === 'greek' || activity.generator?.options === 'lower';
   // The responsive vocabulary pool (D-19), in either direction. A vocabulary
   // select is the non-generator, non-authored branch in buildSelectQuestions.
@@ -190,7 +201,13 @@
       if (def.hintRef) {
         const target = resolveHintRef(chapterData, def.hintRef);
         if (!target) continue;
-        const charts = Array.isArray(target.charts) && target.charts.length ? target.charts : [target];
+        // A COMPOSITE ref (5G §4.8) resolves to several charts. Reached from
+        // hintPages it means one chart per page, the same as a charts[] stack;
+        // reached from ui.hintRef it means one page with both charts stacked.
+        // Which one the data asked for is which field it used.
+        const charts = Array.isArray(target.paradigms) && target.paradigms.length
+          ? target.paradigms
+          : (Array.isArray(target.charts) && target.charts.length ? target.charts : [target]);
         for (const chart of charts) {
           pages.push({ chart: { ...target, charts: [chart] }, title: def.title || target.title || null });
         }
@@ -528,27 +545,54 @@
              empty stage is filled; see chooseStage(). -->
         {#each stages as stage, stageIndex}
           {@const correctIds = showAnswerReveal ? stageCorrectIds(stageIndex, current) : null}
-          <div class="grid options stage-grid"
-               class:paradigm2col={stage.optionClass === 'paradigm2col'}
-               class:single={stage.optionClass === 'single'}
-               data-stage={stageIndex} data-stage-label={stage.label}>
-            {#each stage.options as opt}
-              <button
-                class="tile small"
-                class:selected={stagePicks[stageIndex] === opt.id}
-                class:correct={correctIds && correctIds.has(opt.id)}
-                disabled={answered}
-                on:click={() => chooseStage(stageIndex, opt)}>
-                {opt.label}
-              </button>
-            {/each}
-          </div>
+          {#if stage.optionClass === 'grouped'}
+            <!-- 5G-SPEC1 §4.1: a stage that declares its own optionGroups is
+                 drawn in separated groups, the same way an activity-level
+                 optionGroups is — chapter 10's person/number stage is three
+                 paired rows in the original. Same commit rule: the stage is
+                 still one stage, however many groups it is drawn in. -->
+            <div class="option-groups stage-grid" class:paired-groups={groupClassFor(stage.options) !== 'single'}
+                 class:stage-separated={stages.length > 2 && stageIndex > 0}
+                 data-stage={stageIndex} data-stage-label={stage.label}>
+              {#each sliceGroups(stage.options, stage.optionGroups) as group}
+                <div class="grid options option-group" class:single={groupClassFor(stage.options) === 'single'}>
+                  {#each group as opt}
+                    <button
+                      class="tile small"
+                      class:selected={stagePicks[stageIndex] === opt.id}
+                      class:correct={correctIds && correctIds.has(opt.id)}
+                      disabled={answered}
+                      on:click={() => chooseStage(stageIndex, opt)}>
+                      {opt.label}
+                    </button>
+                  {/each}
+                </div>
+              {/each}
+            </div>
+          {:else}
+            <div class="grid options stage-grid"
+                 class:paradigm2col={stage.optionClass === 'paradigm2col'}
+                 class:single={stage.optionClass === 'single'}
+                 class:stage-separated={stages.length > 2 && stageIndex > 0}
+                 data-stage={stageIndex} data-stage-label={stage.label}>
+              {#each stage.options as opt}
+                <button
+                  class="tile small"
+                  class:selected={stagePicks[stageIndex] === opt.id}
+                  class:correct={correctIds && correctIds.has(opt.id)}
+                  disabled={answered}
+                  on:click={() => chooseStage(stageIndex, opt)}>
+                  {opt.label}
+                </button>
+              {/each}
+            </div>
+          {/if}
         {/each}
       {:else if optionGroups}
-        <!-- Parsing drill: two separated stacks, as the original draws them. -->
-        <div class="option-groups">
+        <!-- Parsing drill: separated stacks, as the original draws them. -->
+        <div class="option-groups" class:paired-groups={groupClass !== 'single'}>
           {#each optionGroups as group}
-            <div class="grid options single option-group">
+            <div class="grid options option-group" class:single={groupClass === 'single'}>
               {#each group as opt}
                 <button
                   class="tile small"
@@ -620,6 +664,13 @@
         <label><input type="checkbox" bind:checked={pronounceEach} /> Pronounce each</label>
       </div>
     {/if}
+    <!-- 5G-SPEC1 §3.3: a standing note the original prints under the drill's
+         controls, beside the Pronounce Each checkbox — chapter 10's parsing
+         drill reminds the learner that a middle ending is usually deponent.
+         It is a parenthetical aside about the whole drill, not about the item
+         on screen, so it sits with the controls and never above the prompt
+         (directive 2: core lesson text is what goes on top). -->
+    {#if activity.note}<div class="note drill-note">{activity.note}</div>{/if}
     {#if showScore}<div class="scorebox live-score">{scoreLine}</div>{/if}
     <div class="scorebox" style="font-weight:400; font-size:0.85rem; margin-top:8px">
       {qIndex + 1} of {questions.length}
@@ -668,8 +719,24 @@
       <!-- 5F-FEEDBACK.pdf §8.1 root-cause fix: every paradigm the Hint route
            can resolve now ships in the one standard cell-audio shape, so
            there is no second renderer to keep in sync. -->
-      <Paradigm paradigm={hintChart} title={hintChart.title || hintChart.charts?.[0]?.title || null}
-                switchLabels={activity.ui?.hintSwitchLabels || null} />
+      {#if Array.isArray(hintChart.paradigms)}
+        <!-- 5G-SPEC1 §4.8: a COMPOSITE hint — several of the chapter's charts
+             stacked in ONE popup under one Close, which is how the original
+             draws chapter 10's Future Active + Future Middle pair
+             (ch10railwalk p7) and chapter 9's Middle + Passive pair. Not a
+             pager: nothing here cycles, and item (h) of VERIFY-5G is what
+             would settle whether the original cycles further. -->
+        <div class="paradigm-stack">
+          {#if hintChart.title}<div class="rc-heading">{hintChart.title}</div>{/if}
+          {#each hintChart.paradigms as chart, chartIndex}
+            <Paradigm paradigm={chart} title={chart.title || null} />
+            {#if chartIndex < hintChart.paradigms.length - 1}<div class="paradigm-stack-rule" aria-hidden="true"></div>{/if}
+          {/each}
+        </div>
+      {:else}
+        <Paradigm paradigm={hintChart} title={hintChart.title || hintChart.charts?.[0]?.title || null}
+                  switchLabels={activity.ui?.hintSwitchLabels || null} />
+      {/if}
       </div>
       <div class="modal-actions">
         <!-- svelte-ignore a11y-autofocus -->
diff --git a/src/components/SpellVerseActivity.svelte b/src/components/SpellVerseActivity.svelte
index 8909968..416e704 100644
--- a/src/components/SpellVerseActivity.svelte
+++ b/src/components/SpellVerseActivity.svelte
@@ -34,9 +34,18 @@
   // so the rail's Next stays the student's. Nothing waits and nothing says it
   // is waiting — 5E-SPEC2 shipped a "Click Next to continue" line here for the
   // withdrawn `spellUntilRight` class, and it is gone with the class (D-28).
+  //
+  // 5G-SPEC1 §4.5 adds the original's "Repeat This Exercise" CHECKBOX, which
+  // first appears on this page in chapter 9. Default OFF; when it is on, a
+  // successful Check Answer plays the verse (C7, as always) and then clears
+  // the slate for another pass. Completion is unaffected — the exercise is
+  // done the first time it is answered, and a learner choosing to type it
+  // again is practising, not re-earning it. THESE SEMANTICS ARE EXTRAPOLATED,
+  // not observed in DOSBox: VERIFY-5G item (d) settles them, and nothing
+  // beyond replay-and-clear is invented here in the meantime.
   import { onMount, onDestroy } from 'svelte';
   import { randomFeedback } from '../lib/content.js';
-  import { play, stop as stopAudio } from '../lib/audio.js';
+  import { play, playThrough, stop as stopAudio } from '../lib/audio.js';
   import { markCompleted } from '../lib/progress.js';
   import { checkVerse } from '../lib/answer-check.js';
   import * as input from '../lib/speller-input.js';
@@ -61,6 +70,14 @@
   let showKeyboard = false;
   let withAccents = false;
   let solved = false;
+  // §4.5. Present only where the data declares it (chapters 9 and 10); the
+  // three earlier whole-verse spellers have no such control in the original
+  // and gain none here. `repeatToken` cancels a pending replay-then-clear the
+  // way advanceToken does in SelectActivity: Restart, a route change or an
+  // unmount must not have the slate cleared out from under it a clip later.
+  $: repeatCheckbox = activity.repeatCheckbox === true;
+  let repeatExercise = false;
+  let repeatToken = 0;
 
   $: audioTiming = activity.audioTiming || 'afterGuess';
 
@@ -90,11 +107,26 @@
       feedback = randomFeedback(chapter, 'correct');
       feedbackKind = 'ok';
       detail = null;
+      // Completion is recorded on the FIRST success and is not touched by the
+      // repeat pass (§4.5): the exercise stays done.
       markCompleted(activity.id);
       // §2.5 / C7: hear the verse you just spelled. Nothing is waiting on the
       // clip here — rule B1b: one item, so there is no next item for it to
       // talk over and nothing for the auto-advance to advance to.
-      if (audioTiming !== 'none' && activity.audio) play(activity.audio);
+      const repeating = repeatCheckbox && repeatExercise;
+      if (audioTiming !== 'none' && activity.audio) {
+        if (repeating) {
+          // The verse is spoken in FULL before the slate clears — clearing it
+          // under the clip would leave the learner listening to a verse that
+          // is no longer on screen.
+          const token = ++repeatToken;
+          playThrough(activity.audio).then(() => { if (token === repeatToken) clearSlate(); });
+        } else {
+          play(activity.audio);
+        }
+      } else if (repeating) {
+        clearSlate();
+      }
       return;
     }
     feedback = randomFeedback(chapter, 'incorrect');
@@ -105,8 +137,9 @@
       : { text: 'There are more words here than the verse has.' };
   }
 
-  function restart() {
-    stopAudio();
+  // An empty surface, ready to be typed again. Shared by Restart and by the
+  // repeat pass, so "another go" means exactly one thing on this page.
+  function clearSlate() {
     buffer = input.clear();
     feedback = '';
     feedbackKind = '';
@@ -115,6 +148,12 @@
     showAnswer = false;               // Restart resets it, as Next does elsewhere
   }
 
+  function restart() {
+    stopAudio();
+    repeatToken += 1;                 // cancel a replay-then-clear in flight
+    clearSlate();
+  }
+
   function onKey(e) {
     if (showKeyboard) return;                     // the keyboard reference is a modal
     if (e.metaKey || e.ctrlKey || e.altKey) return;
@@ -131,6 +170,7 @@
   onMount(() => window.addEventListener('keydown', onKey));
   onDestroy(() => {
     window.removeEventListener('keydown', onKey);
+    repeatToken += 1;                              // no clear after unmount
     stopAudio();                                   // §3.1
   });
 </script>
@@ -161,6 +201,9 @@
   <div class="spell-checks">
     <label><input type="checkbox" bind:checked={showAnswer} /> Show Answer</label>
     <label><input type="checkbox" bind:checked={withAccents} /> With Accents</label>
+    {#if repeatCheckbox}
+      <label data-repeat-exercise><input type="checkbox" bind:checked={repeatExercise} /> Repeat This Exercise</label>
+    {/if}
   </div>
 
   <SpellerKeyboard
diff --git a/src/data/chapt-09.json b/src/data/chapt-09.json
index abbadbd..291bb8d 100644
--- a/src/data/chapt-09.json
+++ b/src/data/chapt-09.json
@@ -74,7 +74,7 @@
       },
       {
        "type": "para",
-       "text": "\"Zach is hit by ωηατ͂̔ — the ball.",
+       "text": "\"Zach is hit by what?\" — the ball.",
        "gapBefore": true
       },
       {
diff --git a/src/data/chapt-10.json b/src/data/chapt-10.json
index a258ba2..b09965e 100644
--- a/src/data/chapt-10.json
+++ b/src/data/chapt-10.json
@@ -44,16 +44,19 @@
      "content": [
       {
        "type": "para",
-       "text": "In English we have several tenses. In the present tense we may say, \"We go to college.\""
+       "text": "In English we have several tenses. In the present tense we may say,\n     \"We go to college.\"",
+       "flush": true
       },
       {
        "type": "para",
-       "text": "In the past we say, \"We went to college.\"",
+       "text": "In the past we say,\n     \"We went to college.\"",
+       "flush": true,
        "gapBefore": true
       },
       {
        "type": "para",
-       "text": "In the future we say, \"We will go to college.\"",
+       "text": "In the future we say,\n     \"We will go to college.\"",
+       "flush": true,
        "gapBefore": true
       }
      ]
@@ -109,7 +112,7 @@
       {
        "type": "paradigm",
        "id": "futureActiveParadigm",
-       "title": "Future Active Indicative",
+       "title": "Future Active Indicative Paradigm",
        "columns": [
         "Singular",
         "Plural"
@@ -175,7 +178,7 @@
       {
        "type": "paradigm",
        "id": "futureMiddleParadigm",
-       "title": "Future Middle Indicative",
+       "title": "Future Middle Indicative Paradigm",
        "columns": [
         "Singular",
         "Plural"
@@ -363,7 +366,7 @@
          "future": {
           "greek": "γνώσομαι",
           "audio": "chapt_10_j_gnwsam",
-          "gloss": "I will"
+          "gloss": "I will know"
          }
         }
        ],
@@ -1040,7 +1043,7 @@
    "type": "select",
    "mode": "fullOptionGrid",
    "title": "Future Indicative Translation Drill",
-   "instructions": "Click on the correct English translation",
+   "instructions": "Click on the correct translation",
    "promptIsGreek": true,
    "options": "perItem",
    "optionLayout": "stack1col",
@@ -1055,7 +1058,7 @@
       "nor will they hear his voice"
      ],
      "answer": "nor will he hear his voice",
-     "audio": "chapt_10_j_TvD1"
+     "audio": "chapt_10_j_tvd1"
     },
     {
      "greek": "Ἀκουσόμεθά σου περὶ",
@@ -1067,7 +1070,7 @@
       "we will hear you concerning this"
      ],
      "answer": "we will hear you concerning this",
-     "audio": "chapt_10_j_TvD3"
+     "audio": "chapt_10_j_tvd3"
     },
     {
      "greek": "ὅτε οἱ νεκροὶ",
@@ -1079,7 +1082,7 @@
       "when we will hear death voices"
      ],
      "answer": "when the dead will hear the voice",
-     "audio": "chapt_10_j_TvD4"
+     "audio": "chapt_10_j_tvd4"
     },
     {
      "greek": "καὶ ἕξεις θησαυρὸν",
@@ -1091,7 +1094,7 @@
       "and you will have treasure in heaven"
      ],
      "answer": "and you will have treasure in heaven",
-     "audio": "chapt_10_j_TvD5"
+     "audio": "chapt_10_j_tvd5"
     },
     {
      "greek": "ἀλλ̓ ἕξει τὸ φῶς τῆς",
@@ -1103,7 +1106,7 @@
       "but they will have the light of life"
      ],
      "answer": "but he will have the light of life",
-     "audio": "chapt_10_j_TvD6"
+     "audio": "chapt_10_j_tvd6"
     },
     {
      "greek": "ἐν τούτῳ γνώσονται",
@@ -1115,7 +1118,7 @@
       "by this we all will know"
      ],
      "answer": "by this everyone will know",
-     "audio": "chapt_10_j_TvD7"
+     "audio": "chapt_10_j_tvd7"
     },
     {
      "greek": "τότε γνώσεσθε ὅτι",
@@ -1127,7 +1130,7 @@
       "then he will know that I am"
      ],
      "answer": "then you will know that I am",
-     "audio": "chapt_10_j_TvD8"
+     "audio": "chapt_10_j_tvd8"
     },
     {
      "greek": "καὶ τὸν πατέρα μου",
@@ -1139,7 +1142,7 @@
       "you will know my father also"
      ],
      "answer": "you will know my father also",
-     "audio": "chapt_10_j_TvD9"
+     "audio": "chapt_10_j_tvd9"
     },
     {
      "greek": "ἐν ἐκείνῃ τῇ ἡμέρᾳ",
@@ -1151,7 +1154,7 @@
       "in that day we will know you"
      ],
      "answer": "in that day you will know",
-     "audio": "chapt_10_j_TvD10"
+     "audio": "chapt_10_j_tvd10"
     },
     {
      "greek": "κ̓αὶ γνώσομαι οὐ τὸν",
@@ -1163,7 +1166,7 @@
       "and I will know not the word"
      ],
      "answer": "and I will know not the word",
-     "audio": "chapt_10_j_TvD11"
+     "audio": "chapt_10_j_tvd11"
     },
     {
      "greek": "καὶ λήμψεσθε τὴν",
@@ -1175,7 +1178,7 @@
       "and you will receive the gift"
      ],
      "answer": "and you will receive the gift",
-     "audio": "chapt_10_j_TvD12"
+     "audio": "chapt_10_j_tvd12"
     },
     {
      "greek": "ὅτι ἐκ τοῦ ἐμοῦ",
@@ -1187,7 +1190,7 @@
       "for you will take what is mine"
      ],
      "answer": "for he will take from what is mine",
-     "audio": "chapt_10_j_TvD13"
+     "audio": "chapt_10_j_tvd13"
     },
     {
      "greek": "καὶ ἐγερεῖ αὐτὸν ὁ",
@@ -1199,7 +1202,7 @@
       "and he will raise the Lord"
      ],
      "answer": "and the Lord will raise him",
-     "audio": "chapt_10_j_TvD14"
+     "audio": "chapt_10_j_tvd14"
     },
     {
      "greek": "Λύσατε τὸν ναὸν",
@@ -1211,7 +1214,7 @@
       "you will destroy this temple"
      ],
      "answer": "you will destroy this temple",
-     "audio": "chapt_10_j_TvD15"
+     "audio": "chapt_10_j_tvd15"
     },
     {
      "greek": "καὶ ἐν τρισὶν ἡμέραις",
@@ -1223,7 +1226,7 @@
       "and in three days I will raise it"
      ],
      "answer": "and in three days I will raise it",
-     "audio": "chapt_10_j_TvD16"
+     "audio": "chapt_10_j_tvd16"
     },
     {
      "greek": "Ἀποστελῶ εἰς αὐτοὺς",
@@ -1235,7 +1238,7 @@
       "he will send them prophets"
      ],
      "answer": "I will send them prophets",
-     "audio": "chapt_10_j_TvD17"
+     "audio": "chapt_10_j_tvd17"
     },
     {
      "greek": "καὶ γενήσεται ὑμῖν",
@@ -1247,7 +1250,7 @@
       "and we will do it for you"
      ],
      "answer": "and it will be done for you",
-     "audio": "chapt_10_j_TvD18"
+     "audio": "chapt_10_j_tvd18"
     },
     {
      "greek": "ἀλλ' ἡ λύπη ὑμῶν εἰς",
@@ -1259,7 +1262,7 @@
       "but your sorrow will become joy"
      ],
      "answer": "but your sorrow will become joy",
-     "audio": "chapt_10_j_TvD19"
+     "audio": "chapt_10_j_tvd19"
     },
     {
      "greek": "πορεύσομαι πρὸς τὸν",
@@ -1271,7 +1274,7 @@
       "you will go to my father"
      ],
      "answer": "I will go to my father",
-     "audio": "chapt_10_j_TvD20"
+     "audio": "chapt_10_j_tvd20"
     },
     {
      "greek": "σὺν ἐμοὶ πορεύσονται",
@@ -1283,7 +1286,7 @@
       "he will go with me"
      ],
      "answer": "they will go with me",
-     "audio": "chapt_10_j_TvD21"
+     "audio": "chapt_10_j_tvd21"
     },
     {
      "greek": "ἐλεύσομαι δὲ ταχέως",
@@ -1295,7 +1298,7 @@
       "but I will come quickly to you"
      ],
      "answer": "but I will come quickly to you",
-     "audio": "chapt_10_j_TvD22"
+     "audio": "chapt_10_j_tvd22"
     },
     {
      "greek": "καὶ πρὸς αὐτὸν",
@@ -1307,7 +1310,7 @@
       "and they will come to him"
      ],
      "answer": "and we will come to him",
-     "audio": "chapt_10_j_TvD23"
+     "audio": "chapt_10_j_tvd23"
     },
     {
      "greek": "γὰρ ἐλεύσονται ἐπὶ",
@@ -1319,7 +1322,7 @@
       "for you will come in my name"
      ],
      "answer": "for they will come in my name",
-     "audio": "chapt_10_j_TvD24"
+     "audio": "chapt_10_j_tvd24"
     },
     {
      "greek": "ὅτι ἐλεύσονται ἐπ'",
@@ -1331,7 +1334,7 @@
       "that in the last days I will come"
      ],
      "answer": "that in the last days they will come",
-     "audio": "chapt_10_j_TvD25"
+     "audio": "chapt_10_j_tvd25"
     },
     {
      "greek": "γὰρ σώσει τὸν λαὸν",
@@ -1343,7 +1346,7 @@
       "for you will save his people"
      ],
      "answer": "for he will save his people",
-     "audio": "chapt_10_j_TvD26"
+     "audio": "chapt_10_j_tvd26"
     },
     {
      "greek": "σώσει ψυχὴν αὐτοῦ",
@@ -1355,7 +1358,7 @@
       "you will save his soul from death"
      ],
      "answer": "he will save his soul from death",
-     "audio": "chapt_10_j_TvD27"
+     "audio": "chapt_10_j_tvd27"
     },
     {
      "greek": "ὅτι ἀγγέλους κρινοῦμεν",
@@ -1367,7 +1370,7 @@
       "that we will judge angels"
      ],
      "answer": "that we will judge angels",
-     "audio": "chapt_10_j_TvD28"
+     "audio": "chapt_10_j_tvd28"
     },
     {
      "greek": "ὅτι οἱ ἅγιοι τὸν κόσμον",
@@ -1379,7 +1382,7 @@
       "that the saints will judge the world"
      ],
      "answer": "that the saints will judge the world",
-     "audio": "chapt_10_j_TvD29"
+     "audio": "chapt_10_j_tvd29"
     },
     {
      "greek": "κρινεῖ ὁ θεὸς τὸν",
@@ -1391,7 +1394,7 @@
       "he will judge the god of the world"
      ],
      "answer": "God will judge the world",
-     "audio": "chapt_10_j_TvD30"
+     "audio": "chapt_10_j_tvd30"
     },
     {
      "greek": "Κρινεῖ κύριος τὸν",
@@ -1403,7 +1406,7 @@
       "we will judge the Lord of this people"
      ],
      "answer": "the Lord will judge his people",
-     "audio": "chapt_10_j_TvD31"
+     "audio": "chapt_10_j_tvd31"
     },
     {
      "greek": "καὶ ἀποστελεῖ τοὺς",
@@ -1415,7 +1418,7 @@
       "and I will send his angels"
      ],
      "answer": "and he will send his angels",
-     "audio": "chapt_10_j_TvD32"
+     "audio": "chapt_10_j_tvd32"
     }
    ],
    "scored": true,
@@ -2175,7 +2178,7 @@
     {
      "type": "paradigm",
      "id": "qrFutureActive",
-     "title": "Future Active Indicative",
+     "title": "Future Active Indicative Paradigm",
      "columns": [
       "Singular",
       "Plural"
@@ -2235,7 +2238,7 @@
     {
      "type": "paradigm",
      "id": "qrFutureMiddle",
-     "title": "Future Middle Indicative",
+     "title": "Future Middle Indicative Paradigm",
      "columns": [
       "Singular",
       "Plural"
diff --git a/src/lib/content.js b/src/lib/content.js
index 068da3d..6b1b613 100644
--- a/src/lib/content.js
+++ b/src/lib/content.js
@@ -432,9 +432,13 @@ function pickAudioField(mode) {
   }
 }
 
-// TWO-STAGE SELECT (5F §2.9, chapter 8's Personal Pronoun Case Drill). The
-// item asks for a PAIR — the person column, then the case-and-number grid —
-// and the answer is a two-element list in the same order as `optionStages`.
+// N-STAGE SELECT (5F §2.9, chapter 8's Personal Pronoun Case Drill; generalized
+// to any number of stages by 5G-SPEC1 §4.1). The item asks for a TUPLE — the
+// person column then the case-and-number grid in chapter 8; tense, then voice,
+// then person-and-number in chapter 10 — and the answer is a list in the same
+// order as `optionStages`. Nothing below counts the stages: the builder maps
+// whatever `optionStages` holds, and the surface commits when the last empty
+// stage is filled, so the three-stage drill needed no new commit rule.
 //
 // Nothing here decides when an attempt is judged; that is the surface's job
 // and rule B1a's (VERIFY-5F item 7: the learner may change their mind on the
@@ -453,7 +457,14 @@ export function buildTwoStageQuestions(chapter, activity) {
     // on the person then the case"). Left to the density heuristic, "Second
     // Person" would come out two-up and the person stage would read as part of
     // the 2x4 case grid under it rather than as the click before it.
-    optionClass: stage.layout ? optionClassForLayout(stage.layout, activity, [], []) : 'single',
+    optionClass: stage.layout
+      ? optionClassForLayout(stage.layout, activity, [], [])
+      : (Array.isArray(stage.optionGroups) && stage.optionGroups.length ? 'grouped' : 'single'),
+    // 5G-SPEC1 §4.1: a stage may split its own values into separated groups,
+    // exactly as an activity-level optionGroups does. Chapter 10's person /
+    // number stage declares [2, 2, 2] and the original draws it as three
+    // paired rows (First Singular | First Plural, and so on).
+    optionGroups: Array.isArray(stage.optionGroups) ? stage.optionGroups : null,
     options: (stage.values || []).map(value => ({ id: String(value), label: String(value) }))
   }));
   const pairKey = list => (list || []).map(value => String(value)).join(' ');
@@ -469,6 +480,12 @@ export function buildTwoStageQuestions(chapter, activity) {
       note: stripMarkup(item.note) || null,
       promptAudio: item.audio || null,
       citation: item.ref || null,
+      // What the Translate button reveals. Chapter 8's case drill carries no
+      // translations and shows no Translate control; chapter 10's parsing
+      // drill carries both, and without this the button rendered permanently
+      // disabled — a control the original has, that does nothing.
+      translate: stripMarkup(item.translate) || null,
+      gloss: stripMarkup(item.gloss) || null,
       answer,
       pairs,
       accepted: new Set(pairs.map(pairKey)),
@@ -661,6 +678,23 @@ function optionClassForLayout(layout, activity, activityOptions, questions) {
 // chapter whose drills point at their own paradigm gets this for free.
 export function resolveHintRef(chapter, ref) {
   if (!chapter || !ref) return null;
+  // 5G-SPEC1 §4.8: a chapter-level `hintCharts` register may name a COMPOSITE
+  // hint — one popup holding several of the chapter's charts, referenced by
+  // id (`paradigmRefs`). Both chapter-9 drills open the Middle and Passive
+  // paradigms together and both chapter-10 drills open Future Active and
+  // Future Middle together; the original draws them stacked under one Cancel
+  // (ch10railwalk p7), so the composite resolves to a `paradigms[]` bundle the
+  // surface renders as a stack. Checked FIRST, so a composite id can never be
+  // shadowed by an activity or topic that happens to share its name.
+  const composite = chapter.hintCharts && chapter.hintCharts[ref];
+  if (composite) {
+    const paradigms = (composite.paradigmRefs || [])
+      .map(chartRef => resolveHintRef(chapter, chartRef))
+      .filter(Boolean);
+    if (!paradigms.length) return null;
+    if (paradigms.length === 1) return paradigms[0];
+    return { paradigms, title: composite.title || null };
+  }
   let found = null;
   const nestedParadigm = node => {
     let chart = null;
@@ -716,6 +750,49 @@ export function resolveHintRef(chapter, ref) {
   return found || byTitle();
 }
 
+// ---- HEADING DEDUPLICATION (5E-R1, generalized in 5G) ----
+//
+// A teaching page prints its TOPIC title and, under it, the chart's own title.
+// In the original those two live in different places — the radio rail at the
+// left and the yellow panel's heading — and the port stacks them, so where
+// they say the same thing it must print one heading, not two.
+//
+// TWO relationships, both of them the same heading said at two lengths:
+//   EQUAL after folding    chapter 5's "First Declension—Masc" over
+//                          "First Declension—Masculine". The chart's title is
+//                          dropped and the topic's stands (device-verified,
+//                          unchanged since 5E).
+//   COVERED               chapters 9 and 10's "Present Middle Paradigm" over
+//                          "Present Middle Indicative Paradigm". The chart's
+//                          title is the FULLER one and it is the one the
+//                          original prints in its panel, so the HOST drops its
+//                          heading and the chart's stands.
+// Both live here because two hosts need them and two copies of a fold rule is
+// exactly how the em-dash regression happened (5E-SPEC3-RESPONSE item 1).
+export function headingKey(text) {
+  return String(text || '').trim().toLowerCase()
+    .replace(/—|–|--/g, '-')
+    .replace(/\s+/g, ' ')
+    .replace(/\bmasc\b/, 'masculine');
+}
+
+// True when `outer` says everything `inner` says, in order, and more of it.
+// Word-subsequence rather than prefix: the extra word lands in the MIDDLE
+// ("Present Middle [Indicative] Paradigm"), which is where the original's
+// panel headings put it.
+export function headingCovers(outer, inner) {
+  if (!outer || !inner) return false;
+  const outerWords = headingKey(outer).split(' ').filter(Boolean);
+  const innerWords = headingKey(inner).split(' ').filter(Boolean);
+  if (outerWords.length <= innerWords.length) return false;
+  let at = 0;
+  for (const word of innerWords) {
+    at = outerWords.indexOf(word, at) + 1;
+    if (at === 0) return false;
+  }
+  return true;
+}
+
 // The camelCase slug the data uses to name a page from elsewhere: hint refs,
 // and the popup ids chapter 8's Three Uses page links to from its own
 // underlined labels. Trailing punctuation is dropped so a label that ends in a
diff --git a/src/lib/greek.js b/src/lib/greek.js
index 3dd715e..058105d 100644
--- a/src/lib/greek.js
+++ b/src/lib/greek.js
@@ -335,3 +335,22 @@ export function splitTaps(text, taps) {
   }
   return parts;
 }
+
+// [{ t, greek }] runs of a mixed Greek/English line. Used where a heading is
+// PART Greek and the Greek part alone is the tap target — chapter 10's
+// "Future of εἰμί" topic title, whose εἰμί taps to its own clip (5G-SPEC1
+// §3.2). splitTaps cannot serve here: it needs to be told the exact form, and
+// a title's Greek is whatever the title happens to say.
+export function splitGreekRuns(text) {
+  const runs = [];
+  for (const char of String(text || '')) {
+    // Combining marks carry no script of their own; keep them with the run
+    // they belong to so a mark never starts an English run of its own.
+    const greek = GREEK_LETTER.test(char)
+      || (/\p{M}/u.test(char) && runs.length && runs[runs.length - 1].greek);
+    const last = runs[runs.length - 1];
+    if (last && last.greek === greek) last.t += char;
+    else runs.push({ t: char, greek });
+  }
+  return runs;
+}
diff --git a/src/lib/markup.js b/src/lib/markup.js
index e724fa8..bcc3f52 100644
--- a/src/lib/markup.js
+++ b/src/lib/markup.js
@@ -19,25 +19,38 @@
 //   [[i]]…[[/i]]  italic — bibliographic titles emphasized by the original.
 // The spans never nest in shipped data, and the splitter is written so a nested
 // pair would still emit both runs' text rather than swallowing one.
+//
+// FOUR, since 5G: [[link:id]]…[[/link]] names the popup a run opens. Chapters
+// 6-8 could key their links off the underlined run's own slug because the run
+// text WAS the popup's title ("As a pronoun" -> asAPronoun); chapters 9 and 10
+// link ordinary words to popups whose titles are something else entirely
+// ("punctiliar" -> "Punctiliar (single point in time)", "frequent verbs" ->
+// "Frequently Used Deponent Verbs"), so the target is named explicitly rather
+// than derived. The slug route still works and is untouched.
 
-const INLINE = /\[\[([ugi])\]\]([\s\S]*?)\[\[\/\1\]\]/g;
-const ANY_MARKER = /\[\[\/?[ugi]\]\]/g;
+const INLINE = /\[\[([ugi])\]\]([\s\S]*?)\[\[\/\1\]\]|\[\[link:([^\]]+)\]\]([\s\S]*?)\[\[\/link\]\]/g;
+const ANY_MARKER = /\[\[\/?(?:[ugi]|link(?::[^\]]+)?)\]\]/g;
 
-// [{ t, u, g, i }] segments in source order; flags mark authored inline runs.
+// [{ t, u, g, i, link }] segments in source order; flags mark authored inline
+// runs and `link` carries the popup id a [[link:…]] run opens.
 export function splitUnderline(text) {
   const src = text == null ? '' : String(text);
-  if (!src.includes('[[')) return [{ t: src, u: false, g: false, i: false }];
+  if (!src.includes('[[')) return [{ t: src, u: false, g: false, i: false, link: null }];
   const parts = [];
   let at = 0;
   INLINE.lastIndex = 0;
   for (let m = INLINE.exec(src); m; m = INLINE.exec(src)) {
-    if (m.index > at) parts.push({ t: src.slice(at, m.index), u: false, g: false, i: false });
-    if (m[2]) parts.push({ t: m[2], u: m[1] === 'u', g: m[1] === 'g', i: m[1] === 'i' });
+    if (m.index > at) parts.push({ t: src.slice(at, m.index), u: false, g: false, i: false, link: null });
+    if (m[3] != null) {
+      if (m[4]) parts.push({ t: m[4], u: false, g: false, i: false, link: m[3] });
+    } else if (m[2]) {
+      parts.push({ t: m[2], u: m[1] === 'u', g: m[1] === 'g', i: m[1] === 'i', link: null });
+    }
     at = m.index + m[0].length;
   }
-  if (at < src.length) parts.push({ t: src.slice(at), u: false, g: false, i: false });
+  if (at < src.length) parts.push({ t: src.slice(at), u: false, g: false, i: false, link: null });
   // An unbalanced marker leaves stray text; strip it rather than print it.
-  return parts.map(p => (p.u || p.g || p.i ? p : { ...p, t: p.t.replace(ANY_MARKER, '') }));
+  return parts.map(p => (p.u || p.g || p.i || p.link ? p : { ...p, t: p.t.replace(ANY_MARKER, '') }));
 }
 
 // ---- Isolated marks in parentheses (5B-SPEC2 B1) ----
@@ -71,7 +84,9 @@ export function splitMarkGroups(text) {
   return parts.length ? parts : [{ t: src }];
 }
 
-// Defensive: the same string on a surface with no inline-span support.
+// Defensive: the same string on a surface with no inline-span support. Strips
+// the OPENING [[link:id]] too, marker and target both — a select prompt that
+// kept "[[link:palatal]]" would print the id at the learner.
 export function stripMarkup(text) {
   if (text == null) return text;
   const src = String(text);
diff --git a/src/lib/popups.js b/src/lib/popups.js
index b214195..9f8843d 100644
--- a/src/lib/popups.js
+++ b/src/lib/popups.js
@@ -48,10 +48,30 @@ export function usePopups() {
 }
 
 // The popup an id names, or null. Ids are matched exactly first, then by slug,
-// so a link may name the popup either way.
+// so a link may name the popup either way. Used where the data NAMES the
+// target: an explicit [[link:id]] run, a greekRows popupRef, a numbered item's
+// numberPopupRef, a topic's titleLink.
 export function popupFor(register, ref) {
   if (!register || !ref) return null;
   if (register.byId[ref]) return register.byId[ref];
   const slug = slugOf(ref);
   return register.byId[slug] || null;
 }
+
+// The popup an UNDERLINED RUN opens, or null — the chapters 6-8 convention,
+// where the run text is the popup's own title and its slug is the id ("As a
+// pronoun" -> asAPronoun). That route reads a coincidence as a link, and 5G
+// produced one: chapter 9 underlines the lead-in "deponent:" inside a numbered
+// teaching point AND ships a "deponent" popup opened from the topic title. The
+// original prints that lead-in in plain black underline, so the port must not
+// turn it blue — blue means tappable and only tappable (directive 8).
+//
+// The discriminator is the popup's own SHAPE, which is also the era it comes
+// from: chapters 6-8's popups are the flexible-dict form (greek / gloss /
+// senses / examples) and are reached by slug; a popup written as a `content[]`
+// block list (5G-SPEC1 4.3) is reached only by a link the data NAMES.
+export function popupForRun(register, run) {
+  const popup = popupFor(register, run);
+  if (!popup || Array.isArray(popup.content)) return null;
+  return popup;
+}
```
