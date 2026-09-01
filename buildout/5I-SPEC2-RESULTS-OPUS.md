# 5I-SPEC2-RESULTS-OPUS.md — cohort 5I feedback round, handoff

Model: Opus 5 (1M context), Claude Code. Spec: `buildout/5I-SPEC2.md`
(FINAL, TBK-confirmed). Base: `ff5239b` ("saving verified 5I SPEC 2"),
a clean tree. Rail walks for chapters 13-16 and
`VERIFY-5I-RESPONSE` supplied with the round.

Nothing is committed, staged or pushed. No assembler was run, no
`ALLOW_REGRESSIVE_REBUILD` was set, no assembler guard was touched. The
audio manifest is unchanged: no entry added, removed or altered — every
clip this round wires already ships (`chapt_13_m_pasmns`, `m_pasfns`,
`m_pasnns`, `m_paspar`; `chapt_16_p_ginm`, `p_diwa`, `p_leia`, `p_graa`,
`p_peia`, `p_doca`; all checked against `public/audio/audio-manifest.json`
before use, and `check:shapes` re-checks every one).

---

## 1. WALL-CLOCK

| Turn | Started (local) | Stopped (local) | Active |
| ---- | --------------- | --------------- | ------ |
| 1 | 21:41 | 23:40 | 1h59m |
| CUMULATIVE ACTIVE TIME | | | **1h59m** |

One continuous working turn, no downtime. Times are from the machine
clock as the turn ran, not reconstructed: the start is the first tool
call (`date -u` = 2026-09-01 01:41:44Z = 21:41 local) and the stop is
the last. A large share of that wall clock is the Playwright harnesses,
which run for tens of minutes each; they were run in parallel wherever
they did not contend for the machine, and serially where they did. The
same table is in the BUILD document.

---

## 2. WHAT WAS BUILT

Seven renderer changes (§3 — one of them not in the spec, §3.7),
forty-nine authorized data edits across
four chapters (§4-§5, one before/after row each), two app-wide sweeps
(§6), and the harness work that keeps all of it from drifting back (§7).

The through-line of the round is that five separate things 5I got wrong
were the same mistake: **a rule that existed only as a habit.** The πᾶς
chart stacked on Learn because stacking was what the Review page did;
the Consonant Shifts header survived because the header test was applied
without asking whether the header belonged; the prose rule labels went
blue because a `greekRows` block was assumed to be a chart; the hint
bundles were derived from the linguistics because nobody read the TBK's
own conditional; the verse broke in two because the original's panel
did. Each now has a written rule and a machine assertion behind it.

---

## 3. RENDERER WORK

### 3.1 Continuous verses (DISCLOSURE-RULES §4.10)

Two forced breaks existed in the app and both are removed.

| File | Before | After |
| --- | --- | --- |
| `src/app.css` | `.prompt-line2 { display: block; }` | `.prompt-cont { display: inline; }` — the class is renamed because it is no longer a line |
| `src/app.css` | `.prompt.two-line { font-size: 1.7rem; … }` | `.prompt.greek.very-long { … }` — same declarations, keyed to LENGTH rather than to the presence of `greek2`, and at a specificity that actually applies (§9.3) |
| `src/app.css` | `.rc-verse-line { display: block; … }` | `.rc-verse-line { display: inline; … }` |
| `SelectActivity.svelte` | `{prompt}<span class="prompt-line2">{prompt2}</span>` | `{prompt}<span class="prompt-cont">{` ` + prompt2}</span>` — one space, same button, same clip |
| `RichContent.svelte` | two sibling `.rc-verse-line` spans | one span plus a space-prefixed second, no line box between them |

The type ramp had to move with it. `longPrompt` measured `prompt`
alone; it now measures the JOINED string, and the second step down
(1.7rem) fires at **more than 47 clusters** rather than at "this item
has a `greek2`". 47 is the threshold because it is the longest prompt in
the app with NO continuation: every one-line prompt therefore keeps
exactly the size it has, and the set that steps down is precisely the
joined verses. Measured across all sixteen chapters: 1,065 select
prompts, 130 of them with a continuation, lengths 22-77 clusters;
without a continuation, 1-47.

That step DOES change what is on screen for 51 renders, because the
5F rule it replaces had never applied at all — see §9.3, which is the
one thing in this round that alters a page nobody complained about, and
is a VERIFY eye item (C1) for exactly that reason.

**The scan, not the assumption (§3.1, §6.2).** Every surface in the app
that prints a verse was walked, in the code and in the data:

| Surface | Renderer | Verdict |
| --- | --- | --- |
| Drill prompt (`prompt` + `prompt2`) | `SelectActivity.svelte` | FIXED — was the forced break |
| Worked verse example (`row.greek` + `row.greek2`) | `RichContent.svelte` `verseExamples` | FIXED — was the forced break |
| Translate reveal | `SelectActivity.svelte` `.gloss-line` | clean — one English string, no split |
| Learn / Review Scripture Memory interlinear | `ContentAudio.svelte` `interlinearVerse` | clean — `.ilv` is `flex-wrap`, one word per box, wraps to the card |
| Whole-verse speller target and answer | `SpellVerseActivity.svelte` `.sv-verse` | clean — `answerWords.join(' ')` |
| Verses in prose (`para`, `textPage`) | `RichContent.svelte` | clean — see the newline census below |
| Popup examples | `PopupSheet` `.popup-example-greek` | clean — one element per verse |

Data census: `greek2` appears in exactly two shapes app-wide —
`.drill[].items[]` (127 items) and
`.learn[].topics[].content[].rows[]` (3 rows) — in twelve translation
drills and three `verseExamples` blocks:

| Chapter | Drill | Items with a continuation |
| --- | --- | --- |
| 7 | `c7_drill_translation` | 7 of 15 |
| 7 | `c7_drill_translation_eimi` | 9 of 14 |
| 8 | `c8_drill_translation` | 8 of 20 |
| 8 | `c8_drill_translation_autos` | 10 of 21 |
| 9 | `c9_drill_translation` | 10 of 14 |
| 10 | `c10_drill_translation` | 28 of 31 |
| 11 | `c11_drill_translation_this_that` | 1 of 18 |
| 12 | `c12_drill_translation` | 4 of 20 |
| 13 | `c13_drill_translation` | 5 of 19 |
| 14 | `c14_drill_translation` | 12 of 28 |
| 15 | `c15_drill_translation` | 17 of 29 |
| 16 | `c16_drill_translation` | 16 of 28 |
| 7 | `predicatePosition` verse examples | 2 blocks |
| 8 | `examples` verse examples | 1 block (3 rows) |

And a separate census for the OTHER way a break can enter — a literal
`\n` inside a Greek-bearing string. Sixteen chapters hold 21 such
strings; **none is a verse.** They are rule notation and letter lists
(ch1 letter names, ch3's parsing example, ch10/ch12/ch14/ch15's augment
contraction table, ch12's connecting-vowel rule) rendered by
`white-space: pre-wrap` blocks that are meant to hold their lines. Full
list in §6.2.

The `greek2` DATA key is untouched everywhere, as §3.1 requires: it is
the positional pool's second entry and the assemblers reproduce it.

### 3.2 The half-screen modal (VERIFY-5I-RESPONSE item 4)

`src/lib/viewport.js` is byte-identical to `6a4369c`, so this was never
a revert — it is a trigger the clamp never covered. The diagnosis in the
file's new comment block, which is the substance of the fix:

**Why the existing W4.2 clamp let it through.** That clamp calls a
reading a phantom when `visualViewport.height` is far below
`window.innerHeight`, and its stated premise is that the iOS software
keyboard does not shrink `innerHeight`. That is true of Safari's tab UI
and NOT true of a standalone home-screen PWA, which is the only way this
app is used: there the layout viewport is resized too, so a stale
reading shrinks both numbers together, their ratio stays near 1, and the
clamp sees nothing wrong with half a screen. Nathanael's observation
that it regresses after a screenshot — with no modal open, on a page
with no modal — is the resume path the file already documents; an iOS
screenshot can background and foreground a standalone PWA.

Four changes, all in `trackVisualViewport`:

1. **`focus` and the Page Lifecycle `resume` join the trigger list.** An
   iOS screenshot can hand the app back without a `visibilitychange` at
   all — the window blurs to the screenshot UI and refocuses. `focus` is
   the trigger that covers the reported case.
2. **A resume now MEANS something.** It opens a 600 ms window
   (`RESUME_WINDOW_MS`) during which the last height the app itself
   published (`lastGoodHeight`) may overrule a measurement. Nothing
   about coming back from a screenshot makes the screen shorter, and
   that reference is not derived from either number that goes stale
   together. Outside the window an ordinary resize shrinks the viewport
   by any amount it likes — which is what keeps a window drag, a
   rotation and the harness's own viewport switches out of the clamp's
   way.
3. **A resume settles rather than snapshots.** `RESUME_SETTLE_MS =
   [0, 60, 180, 400]`: four measurements instead of one rAF, so the last
   word belongs to a viewport that has stopped moving. One frame was
   enough for bfcache and is not enough here.
4. **The reference cannot poison itself.** iOS is free to deliver the
   phantom as an ordinary `resize` a few milliseconds BEFORE the
   foreground event, and a reference that had already swallowed that
   reading would have nothing left to compare against. So a materially
   smaller height is PUBLISHED at once (a real resize must take effect
   immediately) but is not BELIEVED until it has been reported again
   `SHRINK_CONFIRM_MS` (750 ms) later — past the end of any resume
   window. That is also what makes a genuinely smaller screen correct
   itself in under a second instead of never.

The reference is dropped outright on `orientationchange` and on any
measurement whose WIDTH differs from the one it was recorded at: that is
a different rectangle and history about it must not vote.

**The guard against re-regression** (Nathanael's explicit ask) is in
`scripts/ui-modals.mjs` under the heading "5I-SPEC2 §3.2", and it drives
the real path rather than a proxy for it. It opens the app's TALLEST
modal — ch16's fifteen-row stem list, the only kind whose box is actually
governed by `--modal-vh` — forges BOTH `visualViewport.height` and
`window.innerHeight` at 45%, delivers a plain `resize` FIRST (because iOS
may, and a fix whose reference had already swallowed that number would be
no fix), then the foreground events. Five assertions:

- **G0** the guard is pointed at a modal tall enough for the symptom to
  be visible at all;
- **G1** the forged viewport really does shrink the published height AND
  the modal with it — measured at `--modal-vh 844 -> 380px, modal
  710 -> 300px`. **This is the half-screen bug, reproduced on demand.**
  If G1 ever stops failing on the old code it has stopped reproducing
  anything and everything under it is worthless;
- **G2** the resume clamp refuses it: `--modal-vh` and the modal's own
  box are back at 844/710 while the forged readings are STILL installed;
- **G3** the settle chain finds the truth. Mid-resume, with NO event to
  announce it, the viewport becomes a real, plausible, DIFFERENT height
  (800px); only a re-measure can find that, because the single rAF the
  pre-5I code scheduled fired long ago and what is on screen is the
  clamp's substitute rather than a reading. Asserted exactly: `800px`;
- **G4** the constants and the DO-NOT-TRIM comment block are still in
  `src/lib/viewport.js`, so a refactor cannot delete the machinery and
  leave a passing test that no longer tests it.

A loud comment block naming this round sits on the clamp itself.

The guard did not work first time, and how it was fixed matters more
than that it was: G1 failed, reporting no shrink. Rather than relax it,
three throwaway probes established that the forge does take
(`inner=380 vv=380`), that the app republishes on a real resize, that a
synthetic `resize` does reach the listener, and that the publish lands
about 250 ms later — outside the 120 ms the guard first allowed. The
guard was then rewritten to be decisive rather than merely passing:
a tall modal, enough time, and a third assertion that isolates the settle
chain instead of passing whenever the clamp had already done the work.

**Honest limit, unchanged from W4.4:** the root cause is still a
hypothesis. What is now verified is that the trigger list covers the
screenshot path, that the clamp rejects a phantom that agrees with
itself, and that the settle chain re-asks. The device soak stays a
VERIFY item.

### 3.3 Green underline for prose triggers, and the note marker

New class `.rc-prose-trigger`, whose whole job is to NOT be
`.rc-chart-trigger`: it keeps `.popup-link`'s green underline instead of
overriding it to blue, and restates only the bold weight (`.popup-link`
resets the button to `font: inherit`). Two call sites move to it:

- the `endingTransformation` row LABEL (ch15 Palatals / Labials /
  Dentals) — §3.11's ratifying instance;
- the circled note marker `.rc-stem-note` (ch14 εἶδον, D-59).

The Key Letter Box and the ch6 case-chart glosses keep
`.rc-chart-trigger` and their blue, per §3.3 as reaffirmed. Full sweep
table in §6.1.

### 3.4 The frozen header row (§4.9)

`Paradigm.svelte` gains `frozenHead` — `modalHost && charts.length === 1
&& !groupedColumns.length && columns.length > 0`, i.e. exactly "one
chart, drawn as one grid, in a modal" — and the class `.pg-frozen-head`.
CSS sticks `.pg-head` to `top: 0` of `.pg-body`, which is the modal's
scroller, with an opaque `var(--card)` background (required, not
decoration: rows scroll THROUGH the space a sticky element occupies) and
the 2px rule it already draws.

No height threshold and no guess about one: a list too short to scroll
never shows the difference. The §4.3 footer composition is untouched —
this is inside the scroller, the footer is outside it, and neither knows
about the other. `ui-disclosure`'s standing assertion that nothing in
MAIN content computes to `position: sticky` still passes, because the
rule is scoped to `.pg-modal-host`.

### 3.5 Paged-paradigm rendering — no gap found

Confirmed, no new capability needed. The ch13 πᾶς Learn chart uses the
identical `switch: 'named'` shape as ch11's `thatParadigmChart`
(wrapper with no title of its own, `name`/`title`/`subtitle` on each
half, `sayWhole` on both), and the hint composite uses ch11's
`hintCharts` shape with the titles carrying ", Singular" / ", Plural" so
`paradigmToggleLabels` reads Singular/Plural off them. The one thing
that looked like it might need renderer work was D-58's say-all in the
hint, and it did not: `SelectActivity` already renders
`hintParadigm.sayWhole` on a two-chart bundle, so §4.8 was a data edit
and nothing else.

### 3.6 The derivation block comes down a step (I-6)

`layout: 'derivation'` had no class bound, so the two liquid/nasal lines
fell through to the generic `.rc-part` size of 1.35rem. `class:derivation`
is now bound (one data instance app-wide, ch15) and
`.rc-greekrows.derivation .rc-part` sets 1.15rem — the size of the three
worked examples in the chart above them (`.rc-etf-example`). Wrapping at
320px is reported in §8.

### 3.7 NOT IN THE SPEC: a topic's `audioMap` did not reach its own prose

**§4.2's data edit alone would not have made the three taps work.** The
data said `{πᾶς: m_pasmns, πᾶσα: m_pasfns, πᾶν: m_pasnns}` and the page
still rendered three inert words — which is what the new `ui-behavior`
assertion caught, reporting `[]` where it expected three taps.

The cause, found by reading the render path rather than guessing:
`ContentAudio` passes a topic's `audioMap` to `RichContent` as
`noteTaps`, which the paragraph branch does not consult; paragraphs read
`greekTaps`, which resolves to `currentTopic.greekTaps ||
activityGreekTaps`. So a topic's own map reached chart notes and nothing
else.

It LOOKED as though it worked everywhere, because `getGreekTapMap` folds
every `audioMap` in a chapter — activity level and topic level — into
the chapter-wide map. Any activity declaring `greekTaps: true` therefore
receives its topics' maps by that other route. Nine topics in sixteen
chapters carry an `audioMap`; **eight of them sit on an activity that
declares `greekTaps: true`.** Chapter 13's Learn Third Declension Nouns
is the ninth and the only one that does not — so it is the only page
where the gap is visible, and it is precisely the page item 3 reported.

| Chapter | Activity | Topic with an `audioMap` | Activity `greekTaps` |
| --- | --- | --- | --- |
| 11 | `c11_learn_relatives` | `reflexiveReciprocal` | `true` |
| 12 | `c12_learn_imperfect` | `augments`, `echoImperfect` | `true` |
| 13 | `c13_learn_third_declension` | **`introduction`** | **absent** |
| 14 | `c14_learn_second_aorist` | `augments` | `true` |
| 15 | `c15_learn_first_aorist` | `augments`, `endingTransformations` | `true` |
| 16 | `c16_learn_passives` | `endingTransformations`, `deponent` | `true` |

**The fix is a merge, not a substitution**, and that choice is the whole
of the risk management: `topicPageTaps` is
`{...resolvedTaps, ...currentTopic.audioMap}`, so nothing that taps
today stops tapping, and where both maps name a form the topic's clip
wins — which is what "the topic that prints the forms declares them"
has to mean. For the eight topics already covered by the chapter map,
`chapterAudioMap` had folded in the identical pairs, so the merge is a
no-op on those pages. Verified rather than assumed: the four other
audioMap topics were re-driven after the change and tap exactly what
they tapped before (ch16 Deponent ἀπεκρίθην ×2 / ἐγενόμην / ἐγενήθην,
ch12 Augments ἐκβάλλω / ἐξεβάλλον / ἀποκτείνω / ἀπέκτεινον, ch11
Reflexive αὐτός / ἀλλήλων, ch15 Ending Transformations διδάσκω /
ἐδίδαξα / βλέπω / ἔβλεψα / πείθω / ἔπεισα).

Why not the alternative — adding `"greekTaps": true` to ch13's learn
activity, which would have been a one-key data edit? Because the ch13
lexicon's πᾶς entry carries the LEXICAL FORM "πᾶς, πᾶσα, πᾶν" with
`m_voc5`, and `getGreekTapMap` sorts its entries longest-first: the
whole phrase would have claimed the run before any of the three words
could, restoring exactly the single-tap behaviour §4.2 exists to remove.
The data edit is right and the renderer had to move with it.

---

## 4. AUTHORIZED DATA EDITS (rule 4 / §4-§5) — EVERY ONE, BEFORE AND AFTER

This is the table the same-cohort absorption rule consumes. Applied by
three idempotent Python scripts that assert the shipped shape before
touching it; each file round-trips through
`json.dumps(..., ensure_ascii=False, indent=1)` with no trailing newline
— byte-identical formatting to what `assemble_chNN.py` writes, verified
by round-tripping every unedited file first.

### 4.1 ch13 — the πᾶς chart pages on Learn and in the hint (items 1, 2; I-1)

| Path | BEFORE | AFTER |
| --- | --- | --- |
| `chapt-13 .learn[2].topics[5].content[0]` (`learnPasParadigm`) | one six-column `paradigm`: `columns` = Masc/Fem/Neut twice, `columnGroups` = [Singular span 3, Plural span 3], four rows, ONE `sayWhole` | `{type:'paradigm', id:'learnPasParadigm', switch:'named', charts:[…]}`; each half `{name, title:'πᾶς  (all) Forms', subtitle:'Singular'\|'Plural', columns:[Masculine,Feminine,Neuter], rows:4, showGlosses:false, sayWhole:{label:'Say Paradigm', audio:'chapt_13_m_paspar'}}` — ids `learnPasSingular`, `learnPasPlural`; new `_split_note` citing §4.6's surface matrix and NIT-LOG N-1 |
| `chapt-13 .hintCharts.pasParadigm.charts` | `[one six-column chart]`, no `sayWhole`, no paging | `[hintPasSingular, hintPasPlural]`, three columns each, titles `πᾶς  Forms, Singular` / `πᾶς  Forms, Plural`, `subtitle` Singular/Plural, `sayWhole` = `chapt_13_m_paspar` on BOTH |
| `chapt-13 .hintCharts.pasParadigm._note` | recorded only that the hint's title differs from the Learn page's | keeps that, and adds the §4.1 split, the §4.3 paging and D-58's added Say Paradigm button with its reason |
| `chapt-13 .hintCharts.pasParadigm.charts[1]._verify_note` | on the single chart | moved to the PLURAL half — the D-55 πάσαις correction it describes is in that half |

The Review copy `qrPas` is **untouched**, as §4.1 requires, and
`ui-behavior` now asserts that it still stacks with no pager, so the two
surfaces cannot drift into each other.

**NIT-LOG N-1, new instance for the pipeline to append** (implementers
do not edit the logs): *ch13 `M_PASPAR` (πᾶς) — Learn toggle, 2 halves;
drill hint, 2 halves. Quick Review keeps its single button after the
Plural half and is unchanged.* This is the first N-1 instance outside
chapter 11.

### 4.2 ch13 — πᾶς, πᾶσα, πᾶν tap independently (item 3; B1)

| Path | BEFORE | AFTER |
| --- | --- | --- |
| `chapt-13 .learn[2].topics[0].audioMap` | `{"πᾶς, πᾶσα, πᾶν": "chapt_13_m_voc5"}` — one phrase, one clip | `{"πᾶς": "chapt_13_m_pasmns", "πᾶσα": "chapt_13_m_pasfns", "πᾶν": "chapt_13_m_pasnns"}` |
| `chapt-13 .learn[2].topics[0]._audio_note` | "CHAPT_13 ships NO m_pas lemma clip … Both wanted on the listen list." | records the TBK's three WordSelection buttons (13_3DECL.TBK 0x21c0b, 0x21ce9, 0x21de4), B1's listen outcome (m_voc5 speaks πᾶς alone), and that m_voc5 is now unwired here |
| `chapt-13 ._audioVerify` | "Listens wanted: … m_pas (confirm it recites pas, pasa, pan and not pas alone) …" — names a clip the pack does not ship | names `m_voc5`, records B1's and B4's outcomes as SETTLED, and adds `m_voc5` to the unwired (D-39 class) list |

`πᾶν` uses the nominative neuter `m_pasnns`, the original's own
dispatch, not the `m_pasnas` accusative fallback VERIFY-5I offered.
The commas and spaces stay ink: `splitTaps` only claims the exact mapped
forms, and `standaloneIndexOf` requires non-Greek boundaries, so "πᾶς"
cannot claim the head of "πᾶσα" (and could not anyway — final vs medial
sigma).

**Consequence for §D of VERIFY-5I:** ch13's unwired list grows by one.
It was `m_ad5, m_onoss, m_vocl, msargs`; it is now those four plus
`m_voc5`. Recorded in the chapter's own `_audioVerify`.

### 4.3 ch14 + ch16 — tap boundaries in worked examples (item 6)

| Path | BEFORE | AFTER |
| --- | --- | --- |
| `chapt-14 .learn[2].topics[1].content[1].lines[2]` (`ε + λαβ + ο + ν = ἔλαβον`) | `{text, audio:'chapt_14_n_lab1s', tapUnit:true}` — the whole line is one tap | `{text, greekTap:{word:'ἔλαβον', audio:'chapt_14_n_lab1s'}}` |
| `chapt-14 .learn[2].topics[1].content[1]._note` | "D-48f2 shape: the Greek line is one tap unit…" | states the 5G-SPEC3 boundary and why this line is not a `tapUnit` case |
| `chapt-16 .learn[2].topics[1].content[1].lines[0]` (`ἐ + λυ + θη + ν = ἐλύθην`) | `{text, audio:'chapt_16_p_luw1s', tapUnit:true}` | `{text, greekTap:{word:'ἐλύθην', audio:'chapt_16_p_luw1s'}}` |
| `chapt-16 .learn[2].topics[1].content[3].lines[0]` (`λυ + θησ + ν = λυθήσομαι`) | `{text, audio:'chapt_16_p_luwf1s', tapUnit:true}` | `{text, greekTap:{word:'λυθήσομαι', audio:'chapt_16_p_luwf1s'}}` |
| `chapt-16 .learn[2].topics[1].content[1]._note`, `content[3]._note` | absent / the nu-slip `_verify_note` only | the tap-boundary canon appended; the `_verify_note` on the nu slip is UNCHANGED and still present |
| `chapt-16 .learn[2].topics[2].content[1].rows[0..4]` | `note` strings with no tap: `διωκ + θη = ἐδιώχθην`, `λείπ + θη = ἐλείφθην`, `γραφ + θη = ἐγράφην`, `πειθ + θη = ἐπείσθην`, `δοξαζ + θη = ἐδοξάσθην` | each row gains `noteAudioMap`: ἐδιώχθην→`p_diwa`, ἐλείφθην→`p_leia`, ἐγράφην→`p_graa`, ἐπείσθην→`p_peia`, ἐδοξάσθην→`p_doca` |
| `chapt-16 .learn[2].topics[2].content[1]._tap_note` | absent | records the boundary, that the morphemes stay ink, that the ORIGINAL has buttons on ἐλείφθην and ἐγράφην only (all five tap under the standing all-Greek-taps rule because all five clips exist), and that ἐγράφην plays the page's own `p_graa` |

**No contract addition was needed** (§4.3 asked me to report one if it
was). `noteAudioMap` on a `greekRows` row already exists and is already
the mechanism ch15's copy of the very same block uses — `RichContent`
line 659 splits `row.note` through it. What ch16 lacked was the data, not
the shape. (Related, reported not fixed: `RichContent`'s `noteTaps` prop
is threaded down the recursion but never consulted by the
`endingTransformation` branch. It is inert either way; naming it here so
the pipeline knows the row-level map is the live path.)

### 4.4 ch16 — one Ending Transformations chart (item 7; D-61)

| Path | BEFORE | AFTER |
| --- | --- | --- |
| `chapt-16 .learn[2].topics[2].content[1].rows` | 3 rows (Palatals, Labials, the φ row) | 5 rows — Dentals and Sibilants appended from the deleted topic |
| `chapt-16 .learn[2].topics[2].content` | `[para, greekRows/endingTransformation]` | `[para, greekRows/endingTransformation (5 rows), greekRows/shiftSummary]` |
| `chapt-16 .learn[2].topics[2].audioMap` | `{ἐδιώχθην, ἐλείφθην, ἐγράφην}` | `{ἐδιώχθην, ἐλείφθην, ἐγράφην, ἐπείσθην, ἐδοξάσθην}` |
| `chapt-16 .learn[2].topics[2]._disclosure` | absent | D-61: the header does not belong there at all; both screens show ending transformations and the second is a continuation |
| `chapt-16 .learn[2].topics[3]` (`consonantShifts`) | a topic of its own titled "Consonant Shifts": 2 rule rows + the shiftSummary block + its own `audioMap` and `_disclosure` | **DELETED** |

**Topic and progress counts follow with no further edit.** The rail's
per-chapter stop count is the `sequence` array (25 stops for ch16) and is
unchanged — a topic is not a rail stop. The "n of N" topic counter, the
Previous/Next Topic controls and the topic dots are all derived from
`topics.length` in `ContentAudio.svelte`, so the Learn activity reads
"n of 8" from the same data. Nothing in the app stores a topic count;
`check:shapes` and `ui-disclosure3`'s activity census (368 activities)
are unaffected because no ACTIVITY was added or removed. `ui-behavior`
asserts both the 8 and the absence of `consonantShifts`.

### 4.5 ch16 — Passive Stems is one list (item 11)

| Path | BEFORE | AFTER |
| --- | --- | --- |
| `chapt-16 .learn[2]` topic `passiveStems` `.content` | two `paradigm` blocks — `learnPassiveStems1` (7 rows) and `learnPassiveStems2` (8 rows), each printing its own "Passive Stems" header | one block `learnPassiveStems`, 15 rows, ONE header row |
| `chapt-16 .learn[2]` topic `passiveStems` `._disclosure` | "C5 (NIT-LOG N-6 standing method): … STACKED here in the original's own split." | C5: the seven-and-eight split is the ORIGINAL WINDOW's page break, not a structure — same heading, same columns, no split audio — so one fifteen-row list under one header |
| `chapt-16 .quickReview[4].paradigms` | `[qrStems1 (7), qrStems2 (8)]`, two headers | `[qrStems (15)]`, one header |
| `chapt-16 .quickReview[4]._disclosure` | described the stacked two-chart split | C9: one list, one header, no pager |
| `chapt-16 .hintCharts.passiveStemsHint` | `charts:[hintStems1 (7), hintStems2 (8)]`, `switch:'moreBack'` — a two-page modal | `charts:[hintStems (15)]`, `switch` REMOVED — one scrolling list under §4.9's frozen header |
| the three merged charts' `_note` | the em-dash note only | the em-dash note plus the §4.5 reasoning |

### 4.6 ch16 — ἐγενόμην taps (item 10)

| Path | BEFORE | AFTER |
| --- | --- | --- |
| `chapt-16 .learn[2]` topic `deponent` `.audioMap` | `{"ἀπεκρίθην":"chapt_16_p_apea", "ἐγενήθην":"chapt_16_p_gina"}` | `{"ἀπεκρίθην":"chapt_16_p_apea", "ἐγενόμην":"chapt_16_p_ginm", "ἐγενήθην":"chapt_16_p_gina"}` |
| `chapt-16 .learn[2]` topic `deponent` `._audio_note` | "egenomen is the ch14 second aorist middle and has no clip in this pack" — factually wrong | records the TBK dispatch (apea, apea, ginm, gina at 16_FAPAS.TBK 0x21828-0x21ab6), that `p_ginm` ships, and that the second `apea` is the repeat of ἀπεκρίθην later in the paragraph, which `splitTaps` already covers |

### 4.7 ch14 + ch15 — Forms-hint charts read gloss LAST (I-3)

| Path | BEFORE | AFTER |
| --- | --- | --- |
| `chapt-14 .hintCharts.secondAoristForms.charts[0]` | `type:'paradigm'`, `columns:['Present','Second Aorist']`, 13 rows whose `label` is the English gloss — so the gloss printed FIRST | `type:'greekRows'`, `layout:'stemList'`, 13 rows `{greek, audio, gloss:'(…)', parts:[{text:'—'},{greek, audio}]}` — the Learn topic-6 shape, gloss LAST, both forms tapping |
| `chapt-15 .hintCharts.firstAoristForms.charts[0]` | same shape, `columns:['Present','First Aorist']`, 10 rows | same conversion, 10 rows |
| both `_note`s | described the two-column table | record I-3, the reshape, and that the two chapters are reshaped identically |

**Contract touched, as §4.7 asks me to report:** `hintCharts.<ref>.charts[]`
may now hold **any RichContent block**, not only a `paradigm`.
`SelectActivity` gains `hintChartIsBlock` and renders a non-paradigm
resolved hint through `RichContent` inside the same modal shell (same
`.modal-scroll`, no navigation, so nothing is pinned above Close per
§4.3). `scripts/check-content-shapes.mjs` is widened to match: a chart
entry must be a paradigm **or** a block whose `type` the renderer draws
(checked against the file's existing `BLOCK_TYPES` set), so a typo is
still caught.

Chosen over "extend paradigm rows with a trailing gloss" because that
would have been a second renderer imitating a block the app already has,
and §4.7's requirement is that the hint read *exactly* like Learn topic
6 — which is guaranteed when it IS Learn topic 6's block.

Not carried across: the `popupRef` note marker on ch14's βλέπω row. The
original's hint screen is the plain two-column list, the marker belongs
to the Learn/Review stem lists, and a `popupRef` on a drill would resolve
against a popup register the drill does not have.

### 4.8 ch14 + ch15 — capitalized glosses (I-5; D-60)

| Path | BEFORE | AFTER |
| --- | --- | --- |
| `chapt-14 .quickReview[1].paradigms[0]` (`qrSecondAoristActive`) cell glosses | "we took", "you took", "you took", "he/she/it took", "they took" | "We took", "You took", "You took", "He/she/it took", "They took" |
| `chapt-14 .hintCharts.secondAoristParadigms.charts[0]` (Aorist Active of λαμβάνω) cell glosses | same five | same five, capitalized |
| `chapt-15 .quickReview[1].paradigms[0]` (`qrFirstAoristActive`) cell glosses | "we loosed", "you loosed", "you loosed", "he/she/it loosed", "they loosed" | "We loosed", "You loosed", "You loosed", "He/she/it loosed", "They loosed" |
| all three charts' `_note` | as shipped | D-60 cited, with the ruling date |

**First character only.** "he/she/it took" is ONE gloss, not three, and
capitalizing at each slash would have produced "He / She / It took" —
which is neither the original nor the Learn copy. The Middle charts,
already capitalized, are the model and are untouched.

`ui-behavior` runs a census rather than checking the three charts:
**no paradigm cell gloss in chapters 13-16 starts lower case.** Not
"in sixteen chapters" — writing it that way first is what surfaced
§9.6, which is the one genuinely open question this round leaves:
110 lower-case paradigm glosses survive in chapters 5, 7, 8, 9, 10 and
12, they are all noun case meanings rather than the verb-person glosses
D-60 is about, and they are outside what §4 authorizes. Reported, not
edited, and put to Nathanael in VERIFY I-5.

### 5. Conditional hints (item 12; C4; C5) — read from the TBKs

Wired exactly as the spec transcribes them. Nothing was derived.

| Path | BEFORE | AFTER |
| --- | --- | --- |
| `chapt-16 .hintCharts.luwPassivePair` | absent | NEW: `charts` = [First Aorist Passive Indicative of λύω, Future Passive Indicative of λύω], copied from `passiveParadigms[0:2]` |
| `chapt-16 .hintCharts.graphoPassive` | absent | NEW: `charts` = [Second Aorist Passive Indicative of γράφω], copied from `passiveParadigms[2]` |
| `chapt-16 .hintCharts.passiveParadigms._note` | described a three-chart bundle as both drills' hint | marked RETIRED AS A TARGET; kept as extraction provenance, referenced by nothing |
| `chapt-16 .drill[0].ui.hintRef` (`c16_drill_parsing`) | `passiveParadigms` | `luwPassivePair` (the else branch) |
| `chapt-16 .drill[0].items[1..18].hintRef` | all 18 `passiveParadigms` | items **5, 6, 9, 12, 17, 18** → `graphoPassive`; the other 12 → `luwPassivePair` |
| `chapt-16 .drill[0]._hint_note` | absent | NEW: 16_FAPAS.TBK 0xb5e30, the conditional verbatim |
| `chapt-16 .drill[2].ui.hintRef` (`c16_drill_translation`) | `passiveParadigms` | `luwPassivePair` |
| `chapt-16 .drill[2].items[1..28].hintRef` | all 28 `passiveParadigms` | all 28 `luwPassivePair` |
| `chapt-16 .drill[2]._hint_note` | absent | NEW: 0xc08a7 is an unconditional `show Hint1`, and Hint1 (0xc1044-0xc11d1) holds the λύω charts only |
| `chapt-15 .hintCharts.aoristPair` | absent | NEW: `charts` = [Aorist Active of λύω, Aorist Middle of λύω], copied from `aoristVsImperfect[0:2]` |
| `chapt-15 .hintCharts.imperfectPair` | absent | NEW: `charts` = [Imperfect Active Indicative of λύω, Imperfect Middle/Passive Indicative of λύω], copied from `aoristVsImperfect[2:4]` |
| `chapt-15 .hintCharts.aoristVsImperfect._note` | described a four-chart bundle | marked RETIRED AS A TARGET; kept as provenance, referenced by nothing |
| `chapt-15 .drill[2].ui.hintRef` (`c15_drill_translation`) | `aoristVsImperfect` | `aoristPair` (the else branch) |
| `chapt-15 .drill[2].items[1..29].hintRef` | all 29 `aoristVsImperfect` | items **1 (Mar 4:2)** and **11 (Luk 4:15)** → `imperfectPair`; the other 27 → `aoristPair` |
| `chapt-15 .drill[2]._hint_note` | absent | NEW: 15_1AOR.TBK 0x116f1e, the conditional verbatim, plus the note that items 6 and 7 show the AORIST charts in the original and are transcribed, not "fixed" |

**Two confirmations the edit scripts made, not assumptions:**

- ch16's six `graphoPassive` items are exactly the six γράφω forms in the
  pool (ἐγράφημεν, ἐγράφης, ἐγράφη, ἐγράφητε, ἐγράφην, ἐγράφησαν) and no
  λύω form is among them. The script asserts this as an equality, both
  directions, so a transcription slip would have failed the run rather
  than shipped. The TBK read and the linguistics agree — which is
  evidence for the read, not a substitute for it.
- ch15's items 1 and 11 are `Mar 4:2` and `Luk 4:15` in the authored
  order, asserted by `ref` before the write.

**Rendering of the new composites**, since §5.1 cites "§4.2 Back/More
paging" and the ratified sheet routes two charts elsewhere: a bundle of
exactly TWO renders per DISCLOSURE-RULES **§4.1** — one alternating
toggle, not a pair with one half always greyed. `paradigmToggleLabels`
reads the labels off the chart titles: `aoristPair` → Active/Middle,
`imperfectPair` → Active / Middle/Passive, `luwPassivePair` → **More/Back**
(the titles differ in word count, so there is no one-word contrast,
which is exactly the case §4.1 sends to More/Back). `graphoPassive` holds
one chart, so `resolveHintRef` returns it directly and the modal shows it
with no navigation at all. Reported here rather than silently resolved.

**`passiveStemsHint` is no longer a bundle either** (§4.5), so ch16's
Form Drill hint is a single chart in a modal — which is what makes it the
first §4.9 frozen-header surface.

---

## 6. APP-WIDE SWEEPS

### 6.1 In-text modal triggers (§3.2 / §3.11 / §3.12; item 9)

Every modal or popup trigger in chapters 1-16 reaches the screen through
one of four data shapes. The census below is the whole population,
computed from the data rather than typed, and `ui-disclosure` D21.5 now
recomputes it on every run.

| Shape | Instances | Where | Verdict |
| --- | --- | --- | --- |
| `[[link:id]]` markup in prose | 11 | ch2 (5), ch4 (1), ch5 (1), ch9 (2), ch11 (1), ch15 (1 — the `liquids` link) | ALREADY §3.2 green underlined (`.popup-link`). No change. |
| `termList` item `link` | ch2 Identifying Verbs | ch2 | ALREADY green underlined. No change. |
| topic `titleLink` | 1 | ch9 Deponent Verbs | ALREADY green underlined (converted at DISCLOSURE-SPEC3 W6). No change. |
| `popupRef` on a CHART row/column | 17 | ch6 prepositionSenses (11), ch13 keyLetterBox (6) | **EXEMPT (§3.3, reaffirmed).** ch6 keeps `.rc-sense-link` blue; ch13's six keep `.rc-chart-trigger` blue and unmarked. Nathanael named the Key Letter Box; not touched. |
| `popupRef` on a PROSE-layout row | 3 | ch15 `endingTransformation` — Palatals, Labials, Dentals | **CONVERTED.** Now `.rc-prose-trigger`: green, underlined, bold kept. §3.11's ratifying instance. |
| `popupRef` note marker on a stemList row | 2 (one popup, two hosts) | ch14 Learn topic 6 and Review Second Aorist Indicative Forms — the βλέπω/εἶδον note | **CONVERTED, with one judgement call — see below.** |

Census total: **22 `popupRef` occurrences** app-wide — 17 in chart
layouts (exempt), 5 in prose layouts (converted). The five prose ones are
ch15's three rule labels plus the ch14 note marker, which is ONE
`popupRef` reached from two hosts; the population is counted where it is
DRAWN, because that is where a style rule can reach it. Nothing else in
sixteen chapters opens a modal from non-button text. `numberPopupRef` is
retired and appears nowhere.

**The judgement calls, reported rather than made silently, as §6.1
requires:**

1. **The ch14 note marker's ring and glyph.** The marker shipped
   carrying `.rc-chart-trigger`, which is the §3.3 exemption class, so
   its glyph rendered BLUE and un-underlined — beside a form that is
   itself a blue Greek tap, which is the one collision §3.3 exists to
   prevent. §3.12 says the marker is a modal trigger and takes §3.11
   styling, so it moves to `.rc-prose-trigger` and both its "?" and its
   1px ring are the trigger green. Nathanael accepted the marker on
   device (I-2), so this changes only its colour, not its shape or
   placement.
2. **...and the marker does NOT take the underline.** §3.2 underlines an
   in-text LINK so a run of words reads as tappable; the marker is a
   single glyph whose ring already says so, and a rule drawn under a "?"
   inside a 1.35em circle reads as a drawing fault rather than a link.
   The COLOUR — which is what §3.2 is actually distinguishing the
   trigger by — is green. Stated in `app.css` as
   `button.rc-prose-trigger.rc-stem-note { text-decoration: none; }`
   with the reasoning beside it. **If Nathanael wants the underline,
   this is a one-line revert.**
3. **`endingTransformation` is prose, `keyLetterBox` is a chart.** Both
   are `greekRows` blocks, so the class name is not the discriminator —
   §3.11 is ("a `greekRows` block that lays out a page's prose does not
   make its labels in-chart triggers; §3.3 applies to cells and labels of
   an actual chart"). `endingTransformation` draws a rule LINE with a
   worked example indented beneath it, which is teaching prose;
   `keyLetterBox` draws a 3x3 grid of consonants with labels on two
   axes, which is a chart. `stemList` is the third case and is neither: it
   is a list, and what it carries is not a label trigger but the §3.12
   marker, which has its own rule.
4. **Accordion titles are not swept.** They are green and deliberately
   NOT underlined (§3.1), and an accordion is not a modal.
5. **The Meanings label** is green underlined and tappable (§3.9) —
   conforming, untouched.

### 6.2 Verse continuity (§4.10; G2/G3)

The §3.1 scan run app-wide. Two forced breaks existed; both removed;
none survives. The surface table and the 130-instance data census are in
§3.1 above. The newline census, which is the other way a break can
enter:

| Chapter | Strings with a literal `\n` and Greek in them | Are any of them verses? |
| --- | --- | --- |
| 1 | 3 (the pronunciation note; two letter-name lists) | no |
| 3 | 1 (a parsing example set over three lines) | no |
| 10 | 3 (the sigma-contraction rules) | no |
| 12 | 7 (the augment contraction table and the compound-verb rules, in the Learn topic and its hint) | no |
| 14 | 4 (the connecting-vowel rule; the augment rules) | no |
| 15 | 3 (the augment rules) | no |
| 2, 4-9, 11, 13, 16 | 0 | — |

All 21 are rule notation in `white-space: pre-wrap` blocks whose lines
are the teaching. **No Bible verse anywhere in sixteen chapters carries
a literal newline**, and after §3.1 no verse render inserts one.

---

## 7. MACHINE GATES

All run against a fresh `npm run build` served by `vite preview`, and
all re-run after the §3.7 shared-component change rather than assumed to
still hold.

| Gate | Result |
| --- | --- |
| `npm run check:shapes` | **PASS**, all sixteen chapters. Widened for §4.7 (a `hintCharts` chart entry may be a content block) and still refuses an unknown `type`. |
| `npm run build` | **PASS**. 49 precache entries, 1456 KiB; every chapter and lexicon chunk emitted. |
| `npm run check:lazy-chunk` | **PASS**. Sixteen chapter chunks and sixteen lexicon chunks emitted and precached; no chapter data in the main bundle. |
| `npm run check:docs` | 43 failures — the STANDING baseline, reproduced on a clean tree before any work (§9.5). `npm run verify` stops here, so the three gates above were run individually. |
| `npm run ui:behavior` | **1257/1257**, including 29 new 5I-SPEC2 assertions. |
| `npm run ui:modals` | **481/481 modal states clean** across five device heights, plus the five §3.2 guard assertions (G0-G4) all green. |
| `npm run ui:disclosure` | **309/309**, including the six new D21 assertions for the §6.1 sweep. |
| `npm run ui:disclosure3` | **100/100**. Unchanged and re-run: the activity census still reads 368 stored / 368 sequenced and 19 / 345 / 4. |
| `npm run ui:walk` | **368 stops x 2 widths, ALL SIXTEEN CHAPTERS, zero horizontal overflow** at 320px and at 768px, no console errors. Widened from the default nine-chapter set because this round changes shared components. That run also exited 1 on four interaction errors, all one thing: its Hint prober knew a paradigm and a teaching page and did not know §4.7's content block, so ch14's and ch15's reshaped Forms hints read as broken at both widths. Prober taught; ch14 and ch15 re-walked (49 stops x 2 widths, exit 0, zero errors, zero overflow). |
| `npm run ui:offline` | **51 stops rendered, 0 missing, refresh OK**, no console errors. |
| `npm run ui:verseflow` (new) | **514/514 item renders clean** — 257 items of twelve translation drills at 320px and 768px: no forced break, no overflow, one tap target each. |

`scan_garble.py` was not run and is wired into no gate, per §7.

### 7.1 What was added to the harnesses

**`ui-behavior.mjs`** — the §2.7 block rewritten for the join, plus a
new `5I-SPEC2` section carrying 29 assertions:

- §3.1 the continuation is inline AND costs no line, measured against a
  single-text-node probe in the same box;
- §4.1 the surface matrix on ALL THREE πᾶς surfaces at once — Learn
  toggles, hint pages with the D-58 say-all on both halves, Review
  stacks with no pager — so one of the three cannot drift again;
- §4.2 three separate taps, commas still ink;
- §4.3 the tap boundaries in ch14's and ch16's Form topics and in all
  five ch16 rule examples;
- §4.4 one five-row chart, the four labels, the shift summary, and the
  topic count reading "of 8" with `consonantShifts` absent;
- §4.5 one chart / one header / fifteen rows in all three hosts;
- §3.4/§4.9 the frozen header under a REAL scroll — sticky, the list
  scrolled, the header ends flush with the top of the scroller and the
  last row has climbed above where the header began;
- §4.6 every Greek word on the Deponent page taps;
- §4.7 both reshaped hints read lemma / forms / gloss in that DOM order
  with two taps;
- §4.8 a census: no paradigm CELL gloss in sixteen chapters starts lower
  case;
- §5 both mapping classes of the ch16 Parsing Drill, the ch16
  Translation Drill's single unconditional pair, both classes of the
  ch15 Translation Drill — each reached by walking the drill's own Next
  control to a named form, because the drills shuffle — plus the two
  item-number censuses behind those samples.

**`ui-disclosure.mjs`** — a new D21 block for the §6.1 sweep: the three
ch15 prose labels green, underlined and still bold; the Key Letter Box's
six triggers still blue and unmarked; the note marker green in both its
hosts; and the whole `popupRef` population recomputed from the data and
classified.

**`ui-modals.mjs`** — the surface list rewritten (the ch13 πᾶς hint is
two paged surfaces now; ch15's four-chart bundle is two two-chart hints
reached per item; ch16's three-chart bundle is a pair and a single
chart; the stems hint is one list), and the §3.2 guard described in
§3.2 above.

**`ui-walk.mjs`** — its Hint prober learned the §4.7 route. It knew two
payloads, a paradigm and a teaching page, and reported the two reshaped
Forms hints as "Hint did not open a paradigm or a page" at both widths.
A content block is now captured as itself, the same way the 5H page
route is. (Found by running the walk, not by reasoning about it.)

**`scripts/ui-verse-flow.mjs`** (new, and the only new source file in
the round): every item of every translation drill at 320px and 768px,
measured. Not wired into `npm run verify` — it is a measurement pass for
when a verse surface or a prompt style changes, and `ui-behavior`
carries the standing per-commit assertion on chapters 7 and 8. It is in
the tree because it found §9.3, and the next person to touch a prompt
style should be able to re-run it in one command.

### 7.2 Assertions that were WRONG when first written

Both were fixed by measuring rather than by loosening, and both are
worth recording because a green test that asserts the wrong thing is
worse than a red one:

1. **The §6.1 census claimed 17 triggers.** The true population is 22
   occurrences — 17 chart, 5 prose — because ch14's note marker is ONE
   `popupRef` drawn on two pages. Counted where it is DRAWN, since that
   is where a style rule reaches it.
2. **The §3.1 flow assertion required the continuation to share a line
   box with the head.** That is not what "no forced break" means: 54 of
   514 renders legitimately wrap AT the join. Replaced with the probe.
3. **The §4.9 header assertion required the header not to move at all.**
   A sticky element travels with the content until it reaches the top of
   the scroll area and then stops; this one starts 31px below that top,
   under the chart's title. Replaced with the four-part assertion above.
4. **The D-60 gloss census was over-scoped twice.** First it swept every
   `gloss` key in the data and caught eight chapter-2 VOCABULARY glosses
   ("truly, verily"); then, scoped to paradigm cells, it caught 178 more,
   68 of them a chart's Meanings AFFORDANCE. With both excluded, 110
   genuine ones remain in six chapters this round is not authorized to
   edit, and they are noun case meanings rather than the verb-person
   glosses D-60 is about. Scoped to chapters 13-16, where the answer is
   zero; the 110 are §9.6 and a question for Nathanael.

---

## 8. VISUAL VERIFICATION

Every page this round touched was loaded in a real browser and looked
at, per the standing requirement. Two capture passes plus the modal
pass:

- **the §8 list**, photographed at 320px and 390px — the three πᾶς
  surfaces, the ch13 Introduction, ch16's merged Ending Transformations
  and the topic after it, ch16's Passive Stems in all three hosts (the
  hint at rest and scrolled), ch14's and ch16's Form topics, ch16's
  Deponent, both reshaped Forms hints, ch15's Ending Transformations,
  ch13's Key Letter Box, ch14's stem-list marker, ch8's verse examples,
  and the longest joined prompts of chapters 14, 15 and 16;
- **`ui-modals`**, which photographs every modal surface in the app at
  five device heights, at rest and content-scrolled;
- **`ui-verse-flow`**, which is measurement rather than photography and
  is what §8 actually needed for the joined prompts.

What the eyes confirmed, page by page:

| Page | Against | Verdict |
| --- | --- | --- |
| ch13 Learn πᾶς | ch11's Learn Demonstrative Pronouns (the GOOD screenshot of item 2) | Matches: title, "Singular", three columns, Say Paradigm beside the Plural toggle, Previous/Next Topic under them |
| ch13 πᾶς hint | ch11's paged modal (the GOOD screenshot of item 1) | Matches, and additionally carries the D-58 Say Paradigm the original's hint screen lacks |
| ch13 Review πᾶς | itself, before the round | Unchanged: stacked Singular over Plural, one Say Paradigm, no pager |
| ch13 Introduction | ch13railwalk | Three blue words, commas in ink between them |
| ch16 Ending Transformations | both original screens | One chart, five rules, no Consonant Shifts header, shift summary beneath, "3 of 8"; the five result forms blue, every morpheme ink |
| ch16 Passive Stems (Learn, Review, hint) | ch16railwalk | One list, one header, fifteen verbs, em dashes reading as "no form"; in the hint the header stays put while the list scrolls |
| ch16 Form | ch16railwalk p3 | Only ἐλύθην and λυθήσομαι blue |
| ch14 Form | ch14railwalk p3 | Only ἔλαβον blue; the "(ε)" parentheses of G1 intact |
| ch16 Deponent | ch16railwalk | All four Greek words blue, ἐγενόμην included |
| ch14 / ch15 Forms hints | the Learn topic-6 stem lists | Identical shape: lemma, dash, aorist, gloss beneath — gloss LAST |
| ch15 Ending Transformations | ch15railwalk p8 | Palatals / Labials / Dentals green, underlined, still bold; the two derivations now at the worked examples' size, and `ἀποστέλλω + σα = ἀπέστειλα` fits ONE line at 320px (§3.6 answered) |
| ch13 Key Letter Box | itself, before the round | Unchanged — six blue labels, no underline |
| ch14 note marker | itself, before the round | Same shape and place; ring and glyph now green |
| ch8 verse examples | ch8railwalk | The two-line example is one flowing verse |
| the longest joined prompts | — | See below |

**The joined prompts, measured rather than eyeballed.** All 257 items of
twelve translation drills, at 320px and 768px — 514 renders:

- **zero** horizontal overflow, on the card, the page and the prompt
  itself, at either width (this is the §7 requirement, and the one that
  mattered most: `overflow-x` is hidden app-wide, so a clipped verse
  neither scrolls nor errors);
- **zero** forced breaks: every continuation is `display: inline` and
  every joined prompt lays out to exactly the height the same string
  lays out to as a single text node;
- exactly **one** tap target per item, on all 514;
- two computed sizes at 320px — 35.2px on 206 renders and 27.2px on 51,
  and all 51 of the smaller ones are items with a continuation. Before
  the specificity fix in §9.3 there was exactly ONE size on all 514,
  which is how the dead 5F rule was found.

---

## 9. DEVIATIONS, READINGS AND FINDINGS

Nothing in the spec was skipped. What follows is every place where the
work departed from the letter of the spec, resolved an ambiguity in it,
or found something the spec could not have known.

### 9.1 Readings taken where the spec pointed two ways

- **§5.1 says "§4.2 Back/More paging" for `luwPassivePair`, a bundle of
  TWO.** DISCLOSURE-RULES §4.2 is the three-or-more composition (a
  centred Back/More PAIR, both always visible, one greyed); §4.1 is the
  two-screen composition (ONE alternating button). A two-chart bundle
  renders per §4.1, which is what the app does and what ch11's paged
  hints look like. The LABELS are More/Back, which is the part §5.1 was
  fixing: `paradigmToggleLabels` falls back to More/Back exactly when
  there is no one-word contrast, and "First Aorist Passive Indicative of
  λύω" against "Future Passive Indicative of λύω" has none. So the
  reading is: §4.1's control, §4.2's labels — which is what §4.1 itself
  prescribes for a lexical contrast. Reported rather than silently
  resolved.
- **§3.3 says "confirm [the note marker] takes §3.2 styling".** It did
  not. It shipped carrying `.rc-chart-trigger`, the §3.3 exemption
  class, so its glyph was BLUE and un-underlined — beside a Greek form
  that is itself a blue tap, which is the collision §3.3 exists to
  prevent. Converted (green glyph, green ring) and reported in §6.1 as a
  judged conversion, with the underline deliberately not taken and the
  reason stated in the CSS beside it.

### 9.2 Contracts touched, as the spec asks me to report

- **`hintCharts.<ref>.charts[]` may now hold a content block**, not only
  a `paradigm` (§4.7). `SelectActivity` renders a non-paradigm resolved
  hint through `RichContent` in the same modal shell;
  `check-content-shapes.mjs` is widened to accept a block whose `type`
  the renderer draws, so a typo is still caught.
- **No contract addition was needed for §4.3's note taps.** The spec
  offered `noteTap: {word, audio}` if the row note could not carry a
  word tap. It can: `noteAudioMap` on a `greekRows` row already exists,
  and chapter 15's copy of the identical block already uses it. Chapter
  16 lacked the data, not the shape.

### 9.3 Two latent defects this round exposed

The first is in §3.7 above: **a topic's own `audioMap` never reached its
own prose**, and chapter 13's Introduction is the only page in sixteen
chapters where that is visible. The §4.2 data edit alone would have left
three inert words on the screen, and the new assertion is what caught
it. The second follows.

#### The 5F type ramp

**`.prompt.two-line` had never taken effect.** It was written as
`.prompt.two-line { font-size: 1.7rem }` — specificity (0,2,0) — while
`.prompt.greek.long { font-size: 2.2rem }` sits at (0,3,0) at the top of
the same file. Specificity beats source order, so since 5F **every
two-line prompt in the app has rendered at 2.2rem** and the second step
of the type ramp has been dead text.

Found by measuring rather than by reading: the §8 pass walks all 514
prompt renders of twelve translation drills at two widths, and reported
exactly ONE computed size, 35.2px. The replacement is written
`.prompt.greek.very-long`, at equal specificity and later in the file,
so it wins on source order.

**This changes what is on screen**, which is why it is called out rather
than buried: 51 of 257 items — the joined verses over 47 clusters — now
set at 1.7rem where they used to set at 2.2rem. Every other prompt is
unchanged. It is a VERIFY eye item (C1), and reverting it is deleting
`.greek` from one selector.

### 9.4 Things the spec asked for that needed no work

- **§3.5 found no gap.** The ch11 `switch: 'named'` shape and the
  `hintCharts` pair shape carried the ch13 πᾶς conversion with no
  component change, including D-58's say-all — `SelectActivity` already
  renders `hintParadigm.sayWhole` on a pair.
- **`ui-disclosure3` needed no change.** Its subject is the W2
  initial-load and iOS-audio-block census, counted in ACTIVITIES (368)
  and ledger rows. §4.4 merged two TOPICS inside one activity, which
  moves none of those numbers, and nothing else this round adds or
  removes an activity. Run and green, unchanged.
- **The §4.4 topic count needed no data edit beyond the deletion.** No
  toc, progress record or sequence entry stores a topic count: the
  "n of N" counter, the Previous/Next Topic controls and the rail's own
  stop list are all derived (`topics.length`, and `sequence` for the
  rail, which counts activities). ch16 still has 25 rail stops.
- **`scan_garble.py` is wired into no gate**, per §7. It was not run and
  not touched.

### 9.5 Pre-existing conditions, verified rather than assumed

- **`npm run check:docs` reports 43 document-integrity failures.** This
  is the standing CRLF-guard baseline described in CHAT-HANDOFF, not
  something this round caused: the same 43 were reproduced on a CLEAN
  tree (`git stash -u`, run, `git stash pop`) before any document was
  written, and every one names a `buildout/*.md` file from phase 4 or
  cohort 5A-5E that this round does not touch. `npm run verify` stops
  there, so `check:shapes`, `build` and `check:lazy-chunk` were run
  individually and are green.

### 9.6 D-60's reach is a ruling, not an implementer's call — and it is NOT app-wide today

The D-60 index line in CHAT-HANDOFF reads "Paradigm glosses capitalize
app-wide", and my first version of the §4.8 census asserted exactly
that. It failed, twice, on two different populations — and both failures
were the census being wrong rather than the data:

1. **Every `gloss` key in the data** caught eight chapter-2 VOCABULARY
   glosses ("truly, verily", "glory, fame"). Lower case is the
   dictionary convention there.
2. **Every paradigm CELL gloss** still caught 178, of which 68 are a
   chart's **Meanings affordance** — a chart affordance rather than its
   cells (DISCLOSURE-RULES §3.9), printing "a word / of a word / to a
   word" in the same lexicographic register.

With both of those excluded, **110 genuine paradigm cell glosses in
chapters 5, 7, 8, 9, 10 and 12 still start lower case**, and every one
of them is a NOUN-DECLENSION case meaning:

| Chapter | Lower-case paradigm cell glosses | What they are |
| --- | --- | --- |
| 5 | 10 | "a writing", "of writings (possessive)" — the First Declension hint |
| 7 | 5 | adjective paradigm case meanings |
| 8 | 63 | pronoun paradigm case meanings |
| 9 | 10 | case meanings |
| 10 | 10 | case meanings |
| 12 | 12 | case meanings |
| **13-16** | **0** | — |

That is a different register from what I-5 and D-60 are actually about:
the VERB-PERSON gloss, "We took / You took / He/she/it took", where the
inconsistency Nathanael saw was between two copies of the SAME chart.
Capitalizing "a writing" to "A writing" is not obviously what he ruled,
and §4 of the spec authorizes edits to chapters 13-16 only — "anything
beyond them routes back to the pipeline".

**So the census asserts chapters 13-16 (zero, and it will stay zero),
and the 110 are reported here.** If D-60 really is app-wide in the
noun-declension sense too, that is one normalization pass over six
chapters and one line in the census; it wants a ruling first.

---

## 10. FOR THE PIPELINE — the absorption checklist

The same-cohort absorption rule (CHAT-HANDOFF, visual-verification rule
5) consumes §4 and §5 above verbatim. Forty-nine before/after rows, all
four chapters, none of them reproducible by the current assemblers — which is
correct and expected: each `assemble_ch13..16.py` now diffs its output
against the committed chapter and REFUSES to write, so the moment anyone
regenerates, these edits announce themselves rather than vanishing. No
assembler was run and no guard was touched.

Grouped by what the fix at source looks like:

| Edit | Likely pipeline shape |
| --- | --- |
| §4.1 the πᾶς split (Learn + hint) | a SURFACE-AWARE emitter: the same six-column source chart becomes `switch: 'named'` halves on Learn and in a hint, and stays `columnGroups` on Review. This is §4.6's matrix expressed in the assembler, and it will recur on every wide chart from here on. |
| §4.1 `sayWhole` on both halves | NIT-LOG N-1's ruling, applied at emit time |
| §4.2 the three Introduction taps | the WordSelection decoder already reads button counts; this page emitted one mapping for three buttons |
| §4.3 the four `greekTap` conversions | the 5G-SPEC3 boundary as an emit rule: a formula line that prints a RESULT gets `greekTap`, never `tapUnit` |
| §4.3 the five `noteAudioMap`s | ch15's copy of this block already emits them; ch16's does not — one code path, two behaviours |
| §4.4 the topic merge (D-61) | a named exception to the §2.7 header test, or a per-screen ruling table |
| §4.5 the three Passive Stems merges | a rule that a page-break split with the same heading, the same columns and no split audio is ONE list |
| §4.6 ἐγενόμην | the dispatch decoder read three of the four handlers on that page |
| §4.7 the two Forms hints | emit the Learn `stemList` block as the hint rather than re-modelling it as a paradigm |
| §4.8 the ten capitalized glosses (D-60) | a normalization pass over paradigm cell glosses |
| §5 the three per-item `hintRef` tables | the conditional-hint decoder, now written up in PIPELINE-INSIGHTS; these five composites are its first output |

Three further items for the pipeline's own logs, which implementers do
not edit:

- **NIT-LOG N-1 gains its first instance outside chapter 11:** ch13
  `M_PASPAR` (πᾶς) — Learn toggle, 2 halves; drill hint, 2 halves. Quick
  Review keeps one button after the Plural half.
- **ch13's unwired-clip list (VERIFY-5I §D) grows by one:** `m_voc5`.
  The Introduction's citation dispatches `m_pasmns` / `m_pasfns` /
  `m_pasnns` now, and nothing plays `m_voc5`. The chapter's own
  `_audioVerify` string records this; §D's table should follow.
- **`RichContent`'s `noteTaps` prop is threaded down the recursion and
  never read by the `endingTransformation` branch.** Harmless — the live
  path is the row-level `noteAudioMap` — but it is a dead wire and
  someone will eventually assume it works.
