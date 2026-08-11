# 5G-SPEC1-RESULTS.md — chapters 9 and 10

Implementer round, cohort 5G, written against `5G-SPEC1.md` section by
section. Nothing is pushed and nothing is committed; the working tree
holds the round.

---

## 0. Summary

Both chapters are built, rail-ordered and reachable: 22 stops each, 44
in all, every activity in `sequence` exactly once, every id resolving.
`npm run verify` passes end to end — shapes, build, and the lazy-chunk
split now asserted for all **ten** chapters.

The eight renderer novelties of §4 are all in, and two of them needed
less code than the spec expected: `twoStageGrid` already mapped
`optionStages` as an array, so the three-stage drill needed only the
per-stage `optionGroups` and the `translate` field the builder was
dropping (§2.1). The commit rule needed no change at all — "commit when
the last empty stage is filled" was already written that way in
5F.

**Six data defects were found by holding the pages next to the rail
walks, and all six are fixed in the data** under the standing visual
verification authorization (CHAT-HANDOFF, "amended 2026-07-28"). One of
them was blocking: 31 of chapter 10's translation-drill clips were
keyed with the TBK dispatch key's mixed case (`j_TvD1`) against a
manifest that is lowercase throughout, so the entire drill would have
toasted "Audio not found" on device. They are listed with before/after
in §4, and every one is a pipeline-side fix, not a local repair to be
carried.

Three divergences are logged: **D-40** (one heading where a chart's
title says the topic's and more), **D-41** (the three-stage grid is
stacked, not columned) and **D-42** (the modelled "Repeat This
Exercise" semantics, pending VERIFY-5G (d)). **D-32** is extended to
cover chapters 9 and 10's vocabulary grids.

One conflict between the spec and the data is flagged rather than
improvised around: **§2.4 describes chapter 9's Parsing Drill as a
two-stage `twoStageGrid` and the delivered data is a single-stage
`fullOptionGrid`** — and the rail walk agrees with the data. §5.1.

---

## 1. What was built

The four data files were already committed; the chapters were picked up
by the existing `import.meta.glob` registry with no per-chapter wiring,
exactly as chapters 6-8 were.

| | learn | drill | exercise | quickReview | rail stops | distinct clips |
|---|---|---|---|---|---|---|
| chapter 9 | 6 | 5 | 3 | 8 | 22 | 124 |
| chapter 10 | 6 | 5 | 4 | 7 | 22 | 159 |

The clip counts are one higher than the spec's table in each chapter
(123 / 158); the difference is arithmetic, not content — every id the
two files name resolves in `public/audio/audio-manifest.json` and
nothing was added to it. **The manifest is untouched this round**, as
§0 of the spec requires; `git status` shows no change under
`public/audio/`.

`scripts/check-lazy-chunk.mjs` proved the split for eight chapters and
now proves it for ten: ten chapter chunks, ten lexicon chunks, all
precached, no chapter data in the index bundle.

---

## 2. The renderer novelties (§4)

### 2.1 `twoStageGrid` generalizes to N stages (§4.1)

Almost free. `buildTwoStageQuestions` already mapped `optionStages`
with no arity assumption, `stagePicks` was already `stages.map(...)`,
and `chooseStage` already committed on "no stage is still null". Three
things were missing:

- **per-stage `optionGroups`.** Chapter 10's person/number stage
  declares `[2, 2, 2]` and the original draws it as three paired rows.
  The builder now carries `stage.optionGroups` through and the surface
  renders that stage in the same `.option-groups` shape an
  activity-level `optionGroups` gets.
- **`translate`.** Chapter 10's parsing drill carries per-item
  translations and lists a Translate button; the two-stage builder
  never carried the field, so the control rendered permanently
  disabled — a button the original has that does nothing. Fixed;
  asserted in ui-behavior G1.
- **the activity-level `note`.** "Remember that most verbs marked with a
  middle ending are deponent..." is a standing aside about the drill,
  so it renders in the note banner beside the controls, never above the
  prompt (directive 2).

Layout is D-41: the original's three side-by-side columns become three
stacked stages in the same reading order, separated by the dark-green
rule the grouped option stacks already use. Nothing about the commit
rule changed, which is the point — ui-behavior G1 re-asserts the whole
of VERIFY-5F item 7 against three stages (fill two, nothing is judged;
change stage 1 freely; the tuple commits on the last EMPTY stage in
whatever order it is filled; wrong tuple reveals, waits and stays).

### 2.2 Topic rail hidden for single-topic pages (§4.2)

This port draws no radio rail; its equivalent is the Previous Topic /
"1 of N" / Next Topic stepper. With one topic that is three dead
controls, so `topicPages` renders none when `topics.length === 1`. The
seven-topic page next door still steps, which is what ui-behavior G3
pins so the rule stays scoped.

### 2.3 Popups are `content[]` block lists (§4.3)

`PopupSheet` gained one branch: a `content[]` popup renders through
`RichContent`, the same renderer the teaching topics use. The three
flexible-dict fields chapters 6-8 ship are untouched.

Two link routes reach them, both NAMED by the data:

- **`[[link:id]]` inline markup** (new in `lib/markup.js` /
  `Marked.svelte`). Chapters 6-8 could resolve a link from the
  underlined run's own slug because the run text WAS the popup's title;
  chapters 9 and 10 link ordinary words to popups titled something else
  ("punctiliar" -> "Punctiliar (single point in time)"), so the target
  is named outright.
- **`titleLink` on a topic**, for chapter 9's Deponent Verbs heading,
  which is the link in the original too.

A link run that resolves to nothing renders as PLAIN TEXT, never as a
dead blue word (directive 8), and `check-content-shapes` now fails the
build on any `[[link:id]]` or `titleLink` that names no popup on its own
activity — the popup register is per-activity, so an id that exists
elsewhere is still a dangling link.

**One fidelity restoration came out of this.** The chapters 6-8 slug
route fired on a coincidence: chapter 9 underlines the lead-in
`deponent:` inside a numbered teaching point and also ships a
`deponent` popup, so the port turned a plain black underline blue. The
slug route is now scoped to the popup SHAPE it was built for — a popup
written as `content[]` is reached only by a link the data names. Chapter
8's three underline-slug links still resolve (verified on the surface).

### 2.4 `presentFutureRows` (§4.4)

One block, two printed forms, because the original prints it two ways
and the difference is exactly whether the chart is headed:

- **headed** -> a two-column chart under Present / Future, each form's
  gloss on its own line beneath it (the Deponent and Irregular Futures
  topics).
- **unheaded** -> one derivation per line, `ἔχω ==> ἕξω`, gloss beside
  it (the five stem-variation popups).

A block may also declare `layout: "arrow" | "columns"` outright. Greek
cells are tap targets on both sides; glosses are ink (directive 9).

### 2.5 `repeatCheckbox` on `spellVerse` (§4.5)

Present only where the data declares it. Default OFF. A successful
Check Answer plays the whole verse (rule C7 as always) and then, only
when the box is checked, clears the slate — the replay finishes BEFORE
the slate clears, and a Restart or an unmount cancels the pending clear
through the same token pattern `SelectActivity` uses for advances.
Completion is recorded on the first success and the repeat pass does
not touch it.

**The harness deliberately asserts only the control's presence and its
default** (ui-behavior G9), because §4.5's semantics are extrapolated
and VERIFY-5G item (d) is what settles them; pinning a guess as though
it were the original is how 5E got 23 of 50 behavior rows wrong. §7 of
the spec says the same. D-42.

### 2.6 `numbered` with hard line breaks (§4.6)

The block already existed; what was new is an item carrying its own
line breaks. Chapter 10's stem variations put the rule on line one and
its formula on line two, indented under it. Lines are SPLIT rather than
left to a `white-space` rule, because the original indents the
continuation further than the item text and no white-space rule can
reach one line inside a flow. A single-line item renders exactly as
before — the wrapper span is inline until there is a second line — so
no list in chapters 1-8 moved.

Brackets and `==>` pass through as text. They are the original's own
notation and are never interpreted.

**This reached back into chapters 1, 4 and 5, and I checked all three
against their rail walks before leaving it that way.** Three numbered
items already carried `\n` and the renderer had been collapsing it to a
space:

- **chapters 4 and 5, the Case topic.** The original sets the example
  sentence on its own indented line under its label — "Subjective case
  (Gk: nominative):" over "He hit the ball." (ch4railwalk p2-3). The
  port had been running them together on one line. That is a fidelity
  RESTORATION, so it is not logged as a divergence, but it does change
  two device-verified pages and is called out here.
- **chapter 1, Six Points.** Its pronunciation note carries `\n\n` — a
  PARAGRAPH break, not a set-apart line. So the two are distinguished:
  a single `\n` indents the next line under this one, a blank line is
  air with no indent. Without that distinction chapter 1's second
  paragraph would have picked up an indent it never had.

### 2.7 Centred formula para (§4.7)

`align: "center"` plus embedded `\n` already had both halves in the
renderer (`rc-center`, `example-block`); the combination needed nothing
new. The formula letters carry no audio wrapper and stay plain text.

### 2.8 `hintCharts` composite (§4.8)

`resolveHintRef` learned the chapter-level `hintCharts` register first,
so a composite id can never be shadowed by an activity or topic sharing
its name. `paradigmRefs` resolve through the same resolver, recursively,
and the result is a `{ paradigms: [...] }` bundle the drill surface
renders as a **stack**: both charts on screen under one Close, which is
what p7-1 of both rail walks shows (one Cancel over both). No cycling is
wired; VERIFY-5G (h) is what would add any.

The same question — stack or pager — arises for the Quick Review pages,
and the data answers it: a paged stack NAMES each chart (the name is
what the More/Back control and `data-chart-name` report), a stacked pair
has no names because nothing is being switched between. Chapter 8's
three-chart More/Back sequence is unaffected and is pinned as such.
`check-content-shapes` fails a MIXED stack, which is the only shape the
renderer could not choose for.

---

## 3. Audio (§5)

Read, not re-derived. The shifted `j_tvd` table, the `j_epa*` /
`j_eimi*` inversion, item 18's restored clip and the ignored sm12-14
entries are all data facts; the port wires what the data says and
nothing in the renderer knows any of it. `i_mpar`, `i_voc11`, `l_eimi`,
`j_TvD2` and `j_palp` are VERIFY-5G listens, unchanged.

Every audio id either chapter names exists in the manifest — which is
how §4.1 below was caught.

---

## 4. Data defects fixed under the visual-verification authorization

Standing rule: implementers do not edit data, EXCEPT where visual
verification finds obviously missing formatting or text, which must
then be reported with before/after so the pipeline can absorb it. Six
qualify. All six are pipeline-side; none is a local repair to carry.

### 4.1 chapter 10: 31 audio ids in the wrong CASE (BLOCKING)
```
- "audio": "chapt_10_j_TvD1"      (and TvD3 .. TvD32)
+ "audio": "chapt_10_j_tvd1"
```
Audio ids are lowercase throughout — the ISO-path contract in
`src/lib/audio.js`. The assembler emitted the TBK dispatch KEY verbatim,
so every item of the Future Indicative Translation Drill pointed at a
clip that does not exist under that name. `check-content-shapes` caught
it (the manifest-existence rule added in 5F), but its message said only
"not in the manifest", which sends the reader hunting for a missing
file that is right there; the check now says "…but the lowercase id IS —
fix the case".

### 4.2 chapter 9: `ωηατ͂̔` where the original prints `what?"`
```
- "text": "\"Zach is hit by ωηατ͂̔ — the ball."
+ "text": "\"Zach is hit by what?\" — the ball."
```
Panel p1-4. The Greek-font converter took the Latin `what` for `ωηατ`
and the `?"` for a circumflex-plus-rough-breathing stack — the same
class the assembler docstrings warn about for formula fields
("English 'go?' matches the circumflex byte pattern"), reaching a
teaching field. The line is the point of the whole topic and it rendered
as nonsense Greek.

### 4.3 chapter 10: a dropped gloss word
```
- "future": { "greek": "γνώσομαι", "gloss": "I will" }
+ "future": { "greek": "γνώσομαι", "gloss": "I will know" }
```
Panels p5-4 / p6-1 print "I will   know" — the gap is two runs in the
field and only the first was taken. The Irregular Futures chart has the
same word pair right, which is what made the difference visible.

### 4.4 chapter 10: four chart titles missing their last word
```
- "title": "Future Active Indicative"      (x2: learn topic + QR copy)
+ "title": "Future Active Indicative Paradigm"
- "title": "Future Middle Indicative"      (x2)
+ "title": "Future Middle Indicative Paradigm"
```
Panels p2-1, p2-3, p7-1. Same class as §4.3.

### 4.5 chapter 10: the English Concepts quotes belong on their own line
```
- "text": "In the past we say, \"We went to college.\""
+ "text": "In the past we say,\n     \"We went to college.\"",
+ "flush": true
```
Panel p1-3 sets each quoted sentence on its own indented line under its
lead. Written as ONE para block with a `\n` — the Stage 8.1-sanctioned
shape for a hard break inside a paragraph — not as new blocks.

### 4.6 chapter 10: one word too many in an instruction line
```
- "instructions": "Click on the correct English translation"
+ "instructions": "Click on the correct translation"
```
Panel p7-4 of the chapter-10 walk; chapter 9's equivalent panel does
print "English" and the chapter-10 data had chapter 9's wording.
Instruction text is directive-1 content and is not ad-libbed in either
direction.

---

## 5. Where the spec and the delivered data disagree

### 5.1 Chapter 9's Parsing Drill is one stage, not two

§2.4 says "twoStageGrid, 2 stages (Voice, Person/Number), 16 items,
commit on final click". The delivered `c9_drill_parsing` is
`mode: "fullOptionGrid"`, `options: "static"`, six person/number values
with `optionGroups: [2,2,2]`, instruction line "Click on the matching
person and number", and no voice stage anywhere. Panel p6-4 of the rail
walk shows exactly that: one 2x3 grid, no voice column.

§0 says the spec wins over a rail walk. It does not say the spec wins
over the DATA, and the data is what the renderer reads: implementers
never edit data files, and inventing a voice stage would mean authoring
sixteen answers the chapter does not contain. **Built as delivered —
one stage, three paired rows — and flagged here.** Chapter 10's parsing
drill is the genuine three-stage one and it is built as three stages.

### 5.2 Irregular Futures headers

§3.2 says both Deponent and Irregular Futures carry underlined
Present/Future headers, and the data marks both. Panel p6-2 shows the
Irregular Futures headers NOT underlined. The spec wins per §0 and the
port underlines both; worth a keep-or-fix decision alongside items (e)
and (f). (Visual checklist §4.)

### 5.3 The Quick Review verse counts in §2.8 and §3.7 are off by one, both ways

§2.8 says chapter 9's Quick Review carries "five interlinear verses";
the data carries six (Jn 14:6a, Jn 14:6b, Rom 3:23, Jn 1:1, Rom 6:23a,
Rom 6:23b) and the original's Quick Review menu (rw9 p14-2) lists
exactly those six. §3.7 says chapter 10 carries "SIX"; the data carries
five and the original's menu (rw10 p15-2) lists five. Built as
delivered in both chapters — the data and the rail walks agree with
each other. Same class as the clip counts in §1: arithmetic in the
spec's prose, not a content question.

### 5.4 Neither rail walk DRAWS the "Repeat This Exercise" checkbox

§4.5 says the checkbox is "present in both ch9 and ch10 originals on the
SM speller page", and the data records the label's address in the TBK
(`0x64d0c` / `0xba6ec`). The panels do not show it: rw9 p13-2 and rw10
p14-2 both draw exactly one checkbox, "With Accents", beside Major Hint
/ Pronounce / Check Answer / Greek Keyboard and the Previous Page /
Next Page pair. A label can exist in a TBK page record without the page
drawing it, and both panels are captured on page ONE of a paged entry
surface, so it may simply be on the second page.

Built as the spec says (§0), default OFF, so nothing on the page changes
until a learner checks it. **This matters for VERIFY-5G (d):** if the
control is not drawn in DOSBox, item (d) cannot be answered by clicking
it, and the answer is instead "the original has no such control", which
would retire D-42 rather than correct it. Worth knowing before that
pass starts.

### 5.5 Chapter 9's Scripture Memory speller has no page pair

The original's SM speller carries Previous Page / Next Page (panel
p13-2); the port's `spellVerse` has been a single field since chapter 3
and the delivered `ui.buttons` does not list them. No change made; noted
because it is a visible difference from the panel that predates this
cohort.

---

## 6. Acceptance

| check | result |
|---|---|
| `npm run check:shapes` | PASS, ten chapters |
| `npm run build` | clean; 37 precache entries |
| `npm run check:lazy-chunk` | PASS, ten chapter + ten lexicon chunks, all precached, no chapter data in the index bundle |
| `npm run ui:behavior` | 849/849, up from 683/683 at the start of the round |
| `npm run ui:walk` | 219 rail stops x 2 widths, all ten chapters: no horizontal overflow, no rail errors, no interaction errors, no console errors |
| `npm run ui:modals` | 115/115 modal states clean over five device heights (was 85/85; the six new 5G surfaces add 30) |
| `npm run ui:offline` | 44 stops rendered offline, 0 missing, refresh on an activity route OK, no console errors |
| visual comparison against both rail walks | done, `5G-VISUAL-CHECKLIST.md` |

### 6.1 What those runs cover

- **behavior** — every sweep in the file now runs over ten chapters, and
  the 5G section adds G1-G9 (§7). The three-stage drill is asserted on
  all four of its paths, the paired grids on both the new chapters AND
  chapter 3 (which must NOT pair), the stacked Quick Review pair on both
  new chapters AND chapter 8 (which must stay a pager).
- **walk** — every rail stop of every chapter at 320px and 768px, every
  topic stepped, every expander opened, every chart switched, and — new
  this round — every popup opened, screenshotted and cancelled. Zero
  console errors, zero rail errors, zero interaction errors and zero
  horizontal overflow is the pass condition; anything else fails the
  run.
- **modals** — every modal surface at five device heights, including
  the six new 5G ones. The composite Hint is now the tallest dialog in
  the app and it fits at rest at all five heights with its Close pinned.
- **offline** — service worker installed, network cut, both new
  chapters' rails walked, and a refresh on an activity route. This is
  the preview half of directive 4; the device half stays Nathanael's.

---

## 7. Harness changes

- **chapters 9 and 10 join every sweep.** They are in `CHAPTERS` (so
  every census, ledger read-back, spelling rule and elision check covers
  them) and in the 5F ledger read-back set, which reads
  `audioTiming`, the Pronounce-Each default and the Previous/Next pair
  back off the shipped surface for all 17 of the cohort's scored
  activities.
- **a zero-padding bug that would have thrown on chapter 10.**
  `ui-walk.mjs` and `ui-behavior.mjs` both built their data paths as
  `` `chapt-0${n}.json` `` — correct for exactly the nine chapters that
  existed when it was written, `chapt-010.json` for this one.
- **`ui-walk.mjs`'s cohort gate was a hard-coded `/^chapt_[45]$/`**, so
  cohort 5F walked chapters 6-8 and reported checklist evidence and
  320px overflow for neither. It now defaults to every chapter WALKED,
  with `--focus=` to narrow. A cohort gate written as a chapter number
  rots silently at the next cohort, and silence is the failure mode that
  script exists to break.
- **`ui-walk.mjs` now opens every popup on every page it walks**, and
  fails the walk if one opens nothing, has no Cancel, or does not close.
  `ui-modals.mjs` photographs a hand-listed set at five device heights
  to judge SIZING; nothing walked all of them. Five 5G surfaces are
  added to the modal list too, including the composite Hint, which is
  now the tallest dialog in the app.
- **two existing sweeps assumed something a new chapter broke, and both
  are generalized rather than exempted.** The Say-Whole census matched
  a BUTTON NAMED `/^Say Whole/` — chapters 9 and 10 print the original's
  own "Say Paradigm" and the check read that as a missing control; it
  matches the `.pg-say-whole` control now, because the wording is the
  original's business chapter by chapter. And the option-grid census
  asserted that a `grouped` layout is always one option per line, which
  is chapter 3's answer, not the rule; it now asks the same question the
  renderer asks (label length).
- **new: 5G section, G1-G9** — the three-stage commit in all four of
  its paths, the paired ch9 grid (plus the ch3 regression pin that
  proves long labels still stack), the single-topic page (plus the
  seven-topic page next door), both popup link routes and both popup
  shapes, `presentFutureRows` in both printed forms, the compound-verb
  suffix playing its own clip, the composite Hint on all four drills,
  the stacked Quick Review pair (plus the ch8 pager pin), and the
  Repeat checkbox's presence and default.
- **`npm run ui:offline` is a script now.** Directive 4 (offline behavior
  never regresses) has been a standing per-round check since phase 4 and
  every round has done it by hand. `scripts/ui-offline.mjs` installs the
  service worker, cuts the network, walks the rails and refreshes on an
  activity route, which is the whole of the preview-side check; the
  device half stays Nathanael's.
- **new build-time checks, in the "add the check that would have caught
  it" tradition:** every `hintRef`, `paradigmRef`, `[[link:id]]` and
  `titleLink` must resolve (Stage 8.4's rule, extended to the two new
  reference kinds and to the link markup); `presentFutureRows` rows must
  carry both sides; a `paradigms[]` stack must name every chart or none;
  and a wrong-CASE audio id now says so instead of reporting a missing
  file.

---

## 8. Notes for the chat side

1. **The five §4 fixes are pipeline defects.** Three of them (§4.2,
   §4.3, §4.4) are one class: a field's last run dropped or
   mis-converted. §4.1 is an id-casing rule the assembler does not
   apply. §4.5 is an arrangement the extractor flattened.
2. **`assemble_ch9.py` / `assemble_ch10.py` no longer reproduce the
   shipped data.** CHAT-HANDOFF says that holds "only until the first
   hand repair lands in an implementation round". It has landed: the
   repo JSON is now the source of truth for chapters 9 and 10 too,
   same as 6-8 (Stage 8.7).
3. **The vocabulary-pool marker (Stage 8.8 / D-32) should cover
   chapters 9 and 10.** Their vocabulary is not case-split, but the
   pipeline authored `optionValues` rather than naming a lexicon pool,
   which reaches the renderer as the same undistinguished authored grid
   and lands two-up at 768px.
4. **§2.4 of the spec describes a drill the chapter does not have**
   (§5.1 above). Worth correcting in the next spec so the next reader
   does not go looking for the voice stage.

---

## 9. XPATCH1 (cross-patch from the parallel Sol run)

Two ports requested, one taken as code and one taken as assertions. The
rest of the Opus base stands as shipped, as the patch directs — the six
§4 data fixes, D-40/D-41/D-42, `ui:offline`, the zero-padding and
cohort-gate harness fixes and the popup-walk assertions are untouched.

### 9.1 `playThrough()` reports HOW playback ended — TAKEN

`src/lib/audio.js` now resolves `true` only when the clip reached its
own end, and `false` when it was paused, errored, failed to start or was
superseded. The never-reject contract is unchanged.

**The obvious implementation of that sentence is wrong, and the
assertion is what caught it.** Resolving `true` from the `ended`
listener and `false` from the `pause` listener reads correctly and fails
in practice: a clip that finishes fires `pause` AND `ended` — the spec
pauses the element on the way out and Chrome delivers them in that
order — so every completed clip resolved `false` from whichever landed
first, and the repeat pass then never cleared anything. Written that
way, shipped, and caught within the hour by the acceptance assertion the
patch asked for; the probe that diagnosed it recorded one clip with
`started`, `ended` AND `stopped` all true.

What the listeners settle on now is the `ended` ATTRIBUTE, not which
event arrived. It is positional rather than event-ordered: already true
when that trailing pause fires, still false when `stop()` pauses
mid-clip. Only a real `error` resolves false on its own account. The
early-exit path (the clip was already over before we could listen)
answers the same way.

Every other caller races the promise against a minimum timer and ignores
the value (`SelectActivity`, `SpellActivity`, `DivideActivity`,
`PlaceAccentActivity`), so nothing else moves.

`SpellVerseActivity`'s repeat pass now clears the slate only when all
four hold: the clip finished, the checkbox is still ticked, the
component is still mounted (`destroyed`), and no Restart or later
attempt has bumped the token. Sol's stale-completion guard is included —
`destroyed` is set in `onDestroy` alongside the existing token bump.

The reasoning matters more than the diff: D-42 wipes what the learner
typed, and it does that on the strength of a checkbox they ticked. A
verse cut off by a route exit, a screen lock or a superseding tap is not
the learner hearing their verse, and the old contract could not tell the
two apart.

**Assertions** (ui-behavior, "5G-X1", on chapter 9's SM speller; chapter
10 mounts the same component):

- repeat OFF: a solved verse plays and the slate is left alone.
- repeat ON, clip reaches its own end: the slate clears AND completion
  is recorded and stays recorded.
- repeat ON, verse INTERRUPTED mid-clip: the slate is NOT wiped. The
  interruption is a superseding Pronounce tap rather than a route exit,
  deliberately — it leaves the component mounted so the field is still
  readable, which is what makes this the assertion that discriminates.
  Under the old contract it would have cleared.
- repeat ON, page left mid-clip: completion still stands.

The verse clip is seeded into the audio store the app already reads (the
route §6.2's long-clip cases use), short for the natural-end case and
five seconds for the interruption case, because the preview ships no
audio.

### 9.2 The N-stage commit order — INSPECTED, no code change, assertions added

XPATCH1 §2 anticipated this outcome and asked for the code path if it
held. It holds.

`chooseStage()` in `SelectActivity.svelte` (the only place a staged
guess commits) reads:

```js
    stagePicks = stagePicks.map((pick, at) => (at === index ? opt.id : pick));
    if (stagePicks.some(pick => pick == null)) return;   // tuple incomplete
    commit(current.accepted.has(pairKey(stagePicks)));
```

The guard returns while any pick is still null, so the only click that
can reach `commit` is the one that filled the last empty stage — and
that is also the click after which every stage holds a value. "Every
stage now holds a value" and "this click filled the last empty stage"
name the SAME click, at any stage count; once committed, `answered`
closes the grid, so no later click can re-open a full tuple. A separate
`stages.length <= 2` branch would be two code paths that cannot produce
two answers.

The reading that WOULD differ is "commit only when the last stage BY
INDEX is clicked" — and XPATCH1's own acceptance criteria rule it out
("a revision to stage 1 after stages 2+3 are filled still commits on the
stage-1 click"). So the split is not needed and adding it would ship a
distinction without a difference.

What IS durable is the fill order, and it is asserted (ui-behavior,
"5G-X2"), exactly as the patch asks:

- ch10 parsing, fill order 3 -> 1 -> 2: neither the stage-3 nor the
  stage-1 click judges anything; the stage-2 click commits.
- ch10 parsing, fill order 2 -> 3 -> 1: the stage-1 click commits, even
  though it is not the last stage by index.
- ch8 case drill, person then case: still commits on the second value
  (VERIFY-5F item 7). §2.9's existing case-then-person assertion is
  unchanged and still passes, so the two-stage drill is pinned in both
  orders.

The commit site carries a comment recording why the two readings of
§4.1 cannot diverge here, so the next reader of that sentence does not
have to re-derive it.

### 9.3 Acceptance

Re-run in full after the patch:

| check | result |
|---|---|
| `npm run check:shapes` | PASS, ten chapters |
| `npm run build` | clean; 37 precache entries |
| `npm run check:lazy-chunk` | PASS, ten chapter + ten lexicon chunks |
| `npm run ui:behavior` | 856/856 behavior checks passed |
| `npm run ui:walk` | walked 219 stops x 2 widths, all ten chapters: no overflow, no rail errors, no interaction errors, no console errors |
| `npm run ui:modals` | 115/115 modal states clean |
| `npm run ui:offline` | offline: 44 stops rendered, 0 missing, refresh OK |

All four G1 paths re-run green, and so does every assertion the round
already had.

Diff: `5G-XPATCH1-DIFF.md` (this patch alone, against the 5G-SPEC1
tree).
