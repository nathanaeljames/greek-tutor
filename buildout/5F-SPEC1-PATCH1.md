# 5F-SPEC1-PATCH1.md — the chapter 7 regression, why it happened, and what changed

Nothing committed, nothing pushed. This addresses `5F-FEEDBACK.pdf` (17
numbered items, Nathanael, 2026-08-09) against the chapters 6/7/8 build from
`5F-SPEC1-BUILD.md`, plus the standing instruction that came with it:

> "I want to know exactly why and how this regression happened, how it
> passed visual verification, and what steps we are taking to ensure that
> our harness is uniform between rounds and this doesn't happen again."

That question is answered first, in full, before the item-by-item fixes —
it is the actual point of this document, not a footnote to it.

| File | What |
| --- | --- |
| `src/components/PronounParadigm.svelte` | **Deleted.** Chapter 8's bespoke paradigm renderer — root cause of items 8/9/13. |
| `src/components/Paradigm.svelte` | Now the ONLY paradigm renderer in the app. Added `chart.subtitle` display (Masculine/Feminine/Neuter). |
| `src/components/ContentAudio.svelte` | paradigmChart mode no longer branches on shape — one path for every chart. Fixed a duplicate "Say Whole Paradigm" button. |
| `src/components/SelectActivity.svelte` | Hint chart route simplified to the one Paradigm component. **The prose-hint route (`hintBlocks`) no longer renders as a bare, undismissable `.card` — it is a real modal, item 15/16 root cause.** |
| `src/components/DivideActivity.svelte`, `PlaceAccentActivity.svelte` | Same bare-`.card` Hint bug, same fix — found by auditing every `{#if showHint}` in the app, not just chapter 7's. |
| `src/components/RichContent.svelte` | Removed the retired `pronounParadigm` branch and `splitPopupHeadwords`. Added `numberPopupRef` (item 15: the NUMBER opens the popup, not the Greek word — supersedes D-31). |
| `src/components/PrepositionsChart.svelte` | Rebuilt on polar geometry around a shared ellipse (item 1) — every arrow now meets the boundary at its own label's exact angle. |
| `src/app.css` | Fixed the `.gloss-only .rc-greekrow` / `.parts-row` specificity bug (items 2/3, phrases splitting across lines). Widened the two-word gloss-only column. Added `.rc-item-below`, `.rc-num-popup`, `.pg-subtitle`. |
| `src/lib/popups.js` | Removed the dead `byGreek` index — popups now resolve only by id. |
| `src/data/chapt-06.json` | Hint chart for the dangling `prepositionsCaseChart` ref. |
| `src/data/chapt-07.json` | Rebuilt: adjective paradigms (items 8/13), εἰμί paradigm + duplicate-heading fix, οὐ/οὐκ/οὐχ popups re-keyed to `numberPopupRef` (item 15), OCR/mojibake fixes (item 4), hanging-indent conversions (items 5/6), Hint modal content restructured to a real `numbered` block (item 13's hanging-indent bug, caught only by the harness re-run — see below). |
| `src/data/chapt-08.json` | Retired `pronounParadigm` shape entirely (items 8/9); Types of Pronouns / Case converted to hanging-indent lists (item 5); enclitics/declension-format worked examples added (items 10/11); elision U+0027 fix (item 6-class defect, C9). |
| `scripts/check-content-shapes.mjs` | Two new build-time guards (below): hand-numbered para text, and unnamed charts in a `paradigms[]` stack. |
| `scripts/ui-behavior.mjs`, `ui-modals.mjs`, `ui-shots-5f.mjs` | Rewritten wherever they still asserted against the deleted `PronounParadigm` markup or the superseded word-based popup mechanism — three separate scripts, all stale in the same way. |
| `buildout/DIVERGENCE-LOG.md` | D-31 revised (numberPopupRef supersedes the word-based reading). D-34 added (the prepositions chart is a best-effort reconstruction, not a pixel trace — flagged, not claimed). |
| `buildout/ONBOARD-SOL.md` | Three new §7/§8 entries: interaction-complete verification, grep-the-harness-before-deleting-markup, add-the-check-that-would-have-caught-it. §9 status note. |

---

## Why this happened

Nathanael's question has two parts — why the regression shipped, and why
visual verification did not catch it — and they have two different answers.

### Why it shipped: one shape, two renderers

Chapter 8's third-person pronoun table (μασ/fem/neut, first/second person)
had its own component, `PronounParadigm.svelte`, built in the 5F-SPEC1
round as a parallel path alongside the app-wide `Paradigm.svelte` every
other chart in the app already used. It read a Latin-transliterated,
free-text-row shape instead of the standard `{columns, rows:[{label,
cells:[{greek,gloss,audio}]}]}` contract, which is how the chapter 8 pronoun
tables ended up showing untransliterated Latin case labels, no More/Back,
no Say Whole, and no subtitle (items 8/9): none of the work already done to
make `Paradigm.svelte` correct — column audio, chart-switching, subtitle
bands, Say Whole dedup — had ever been applied to its twin, because it was
a twin nobody had reason to remember existed until this chart broke.

**Two components that draw conceptually the same thing, built at different
times under different pressure, are two places for the same bug to be
present in one and absent in the other.** That is the general lesson, not
just this component's: `PronounParadigm.svelte` is deleted, chapter 8's
pronoun charts now ship in the identical `{columns, rows, charts[]}` shape
the adjective and εἰμί charts use, and there is exactly one paradigm
renderer in the app again.

Two smaller instances of the same root cause, both in chapter 7:

- The οὐ/οὐκ/οὐχ topic shipped as eleven flat `para` blocks with no
  `numbered`/`greekRows` structure, because those blocks did not exist yet
  when that page was drafted — most of the surrounding pages in the same
  round used a shape the popups and hanging-indent CSS never got wired
  into. Items 5/6/7/11/14/15 are, structurally, one bug: teaching prose
  authored as `para` sequences instead of the `numbered` / `greekRows`
  blocks the CSS's hanging-indent and tap-target rules are built for.
- A drill's Hint route that resolves to prose (`hint.content`) instead of
  a chart (`ui.hintRef`) rendered as a bare `.card` with no modal shell —
  in THREE different activity components (`SelectActivity`,
  `PlaceAccentActivity`, `DivideActivity`), all copy-pasted from the same
  original pattern, all missing the same overlay. Item 15's "half screen
  module" and the garbled English inside it were two independent bugs
  that happened to compound on the same page: the modal shell was
  missing everywhere this route was used, and chapter 7's specific
  popups additionally had swapped/garbled example fields. Fixing the
  content without fixing the shell would have looked fixed on the one
  page that got screenshotted and stayed broken everywhere else — which
  is exactly what a spot-check misses and a grep across every component
  does not.

### Why it passed visual verification

The honest answer is that a screenshot at rest is not the same thing as
verification, and the round leaned on the former. Every one of the defects
above is invisible in a single static capture of a page as it loads, and
only shows up on interaction:

- The hanging-indent bug (a hand-numbered `"1) ..."` string inside a plain
  `para`) looks IDENTICAL to a real `numbered` block for a one-line item —
  the marker sits in the same place either way. It only diverges once an
  item is long enough to wrap, and nothing about "does this page have a
  numbered list on it" checks that.
- The duplicate "Say Whole Paradigm" button and the missing subtitle only
  appeared after stepping through More to the second or third chart — a
  screenshot of the page as it first loads shows chart one, which was
  correct.
- The bare-`.card` Hint bug only appears after clicking Hint. A rail walk
  that photographs each page as it arrives, without also opening every
  Hint, every popup and every More/Back step, cannot see it.
- The garbled popup content only appears after opening the specific
  popup with the swapped fields — three popups on one page, and the
  defect was on two of the three.

**A pass counts as verification only if it interacts with everything a
learner can interact with, not only the state a page loads in.** That
sentence is now written into `ONBOARD-SOL.md` §7. The tooling to do this
mechanically already existed (`ui-walk.mjs`, `ui-behavior.mjs`,
`ui-modals.mjs`) — the first build's spec closeout did not run all three of
them against every surface it touched. This round did, and used the
failures to find defects the spec text alone would not have surfaced (the
duplicate εἰμί heading, the unnamed `c8_qr_third` charts — both described
below — were caught by re-running the harness, not by re-reading the
feedback PDF).

### Why the harness itself was not uniform between rounds

Three scripts (`ui-behavior.mjs`, `ui-modals.mjs`, `ui-shots-5f.mjs`) still
asserted against `PronounParadigm`'s `.pronoun-paradigm` / `data-gender`
markup and the superseded word-based `.popup-link` mechanism after both
were retired from the app. All three still reported PASS on their OTHER
485+ assertions, which is exactly the failure mode Nathanael's question
anticipates: **a harness that is stale in one place still looks green
everywhere else, and "the suite passed" quietly stops meaning what it
sounds like it means.** This was only caught by deliberately re-running the
full suite after the renderer changes and reading every failure rather
than trusting a partial pass — see Verification below for the actual
sequence (first run: 6 interaction errors + 1 crash + 2 real content bugs;
each one fixed, harness re-run again, down to clean).

The rule this produces, written into `ONBOARD-SOL.md` §8: **grep every
`scripts/ui-*.mjs` for a class, attribute or id before deleting or
renaming it in a component.** A harness that still passes after testing
markup that no longer exists is worse than no harness — it reports green
while proving nothing.

---

## Item-by-item

Grouped by root cause rather than listed 1-17, since several items are one
underlying defect surfacing on different pages (noted above). Every item is
accounted for below or in the file table.

**1 — Prepositions Chart geometry.** Rebuilt on polar coordinates around a
shared ellipse (`src/components/PrepositionsChart.svelte`): every node sits
at a fixed clock-angle read off `ch6railwalk` p6/p14's own layout (three
prepositions cluster at the top, four run the sides, two anchor the bottom
corners), and every straight arrow is computed from that SAME angle at a
near/far radius, so it always meets the ellipse boundary exactly under its
own label instead of at an independently hand-picked point. The curved περί
sweep, the ἐπί arc over the top, and the διά cross-through are preserved.
This is a geometric reconstruction from the rail-walk image, not a
pixel-coordinate trace — logged honestly as a limitation in
DIVERGENCE-LOG D-34, since this environment has no tool that extracts exact
vector coordinates from a scanned page. Verified on both the Learn topic
and the Review chart (identical component, both screenshotted).

**2, 3 — Phrases splitting across lines** (δια + εμου, μετα + ημερας, μεθ'
ημερας + "after days", δια + βλεπω + "through I see"). Root cause: `.rc-
greekrows.gloss-only .rc-greekrow { grid-template-columns: minmax(4.5em,
35%) minmax(0, 1fr); }` was a more specific selector than the parts-row's
own `--greek-cols:1` custom property, so a row authored to occupy ONE wide
column was still being forced into the two-column 35%/65% split and
wrapping. Fixed with `.rc-greekrows.gloss-only .rc-greekrow.parts-row {
grid-template-columns: minmax(0, 1fr); }`, and the gloss-only two-word
column widened from 35% to 55% (measured directly against "ἄνθρωπός μου",
the longest two-word phrase in the affected rows, via Playwright
`getBoundingClientRect`) so the fix does not just move the wrap point.
Verified: Elision, Compounds and the enclitics worked examples all render
on single lines at 320px; no regression on the shorter rows already
passing (ch6's hint case chart, δι' ἐμοῦ).

**4 — OCR garble ("What kind of ___ is it? ... Soft The snow was soft").**
Chapter 7's adjective Definition topic now reads "An adjective is a word
used to modify a noun or pronoun... It often answers the question 'What
kind of ______ is it?'" followed by the indented worked example ("The
[[u]]soft[[/u]] snow hit the windshield. / Answers: what kind of snow?
soft / The snow was [[u]]soft[[/u]].") with both underlines authored.

**5, 6, 7, 11, 14 — Hanging indent / paragraph spacing / all Greek phrases
tappable.** One structural fix applied everywhere it was missing: teaching
prose that had been authored as flat `para` sequences is now `numbered` /
`greekRows` blocks, which carry the app's existing hanging-indent CSS and
Greek-tap contract for free. Specific pages: chapter 7's "3 Uses of
Adjectives" (examples embedded in flowing item text, not a `note` box —
see the correction below), chapter 8's "Types of Pronouns" and "Case"
(hanging-indent lists), chapter 8's enclitics and declension-format topics
(new `greekRows layout:'glossOnly'` worked examples, every Greek phrase
tappable). One correction made mid-round and worth stating: the FIRST
draft of "3 Uses of Adjectives" and the ch8 pronoun-type lists used
`labelStyle: "underline"` on their own authored labels ("Attributive:",
"Personal pronouns:", etc.) — this renders an underline on text that was
never marked `[[u]]...[[/u]]` anywhere in the data, which the harness's
own §2.4 check (underlining is data, not a renderer decision) correctly
failed. Changed to `labelStyle: "plain"` (bold, no underline), matching
the sibling "Examples" topic that already used it correctly.

**8, 9 — Three columns, duplicate text centering, all Greek tappable, the
More box, Say Whole List.** Root cause and fix covered above (one paradigm
renderer, not two). Chapter 7's ἀγαθός and δίκαιος paradigms, and chapter
8's first/second/third-person pronoun tables, all now ship full singular
+ plural `charts[]` with `switch:'moreBack'`, real per-cell audio, and
`sayWhole` on each chart. Verified: lemma line ("ἀγαθός = good"),
Masculine/Feminine/Neuter column headers, More/Back stepping through all
three chapter 8 genders with the subtitle band updating each time, and
exactly one Say Whole button per chart (the duplicate-button bug below).

**10 — Duplicate formatting (ditto marks under "the good word"), all Greek
phrases clickable.** The ditto-mark rows (`ὁ λόγος ὁ ἀγαθός` / `"`) sit in
a `greekRows layout:'glossOnly'` table with the quote mark in the gloss
column directly under the translation it doubles, and the Greek phrase
carries its own audio tap like every other row.

**12 — Spacing between paragraphs.** Covered by the same `numbered` /
`greekRows` conversions as 5/6/7 — flowing `para` sequences already carry
the app's standard paragraph margin; the pages that read as collapsed were
the ones missing block structure entirely, not missing CSS.

**13 — Recreate columns, Say Whole list, all Greek tappable, hanging
indents, extra line before Things to Note.** The εἰμί paradigm (chapter
7) ships as a real `paradigm` block: Singular/Plural columns, all six
forms tappable, Say Whole List, and a `numbered` "Things to Note" list
(hanging indent, auto-numbered "1)"/"2)") separated from the chart by its
own Say Whole button — the same visual gap the original uses. This is
also where the hint.content route needed the SAME fix as item 5/6: the
Adjective Translation Drill's Hint (Attributive/Predicate/Substantive
examples) had been authored with the numbering baked into `para` text
("1) Attributive adjectives..."), which defeats hanging indent for a
long item — rebuilt as a `numbered` block with the worked-example table
nested under each item via a new `it.below` field (renders through the
same recursive block renderer the `expander` type already uses, so a
wrapped line now hangs under its own text instead of under the marker).

**15 — οὐ/οὐκ/οὐχ audio, the numbers open the popups, the "half screen"
module, garbled English.** Four things, all fixed: (a) the Greek words
οὐ/οὐκ/οὐχ are ordinary audio taps; (b) the NUMBER marker in front of each
line opens its popup (`numberPopupRef`, a real `<button>` in place of the
generated "N)" counter — DIVERGENCE-LOG D-31 revised); (c) the "half
screen module" was the bare-`.card`-instead-of-modal bug described above,
now a real full-screen sheet with a dim overlay and Close, same as every
other popup in the app; (d) the garbled English was swapped/wrong example
fields, reconstructed from `ch7railwalk.pdf` p8 (condition text, glosses
and references all re-checked against the source).

**16 — Broken modal, check all modals in this chapter.** Audited every
`{#if show...}` popup/modal surface across chapters 6-8, not just chapter
7: `PopupSheet.svelte` (ch6/7/8 reference pages), the paradigm Hint route,
and the three prose-Hint routes in `SelectActivity`, `PlaceAccentActivity`
and `DivideActivity` (the bare-`.card` bug — found in all three, fixed in
all three). Re-ran `ui-modals.mjs` at five device heights: 85/85 modal
states now show both borders and Close at rest, zero unresolved overlay
scroll range.

**17.** Not populated in the feedback PDF as received.

---

## Two bugs found only by re-running the harness

Neither of these was in the feedback PDF; both were structural regressions
the fixes above introduced, and both were caught by re-running
`ui-behavior.mjs` in full rather than assuming a green run because the
targeted fixes looked right on screen.

**Duplicate heading on chapter 7's εἰμί paradigm page.** The topic prints
"Present Indicative of εἰμί"; the paradigm block ALSO carried its own
`title: "\"εἰμί\" Paradigm"`, and the two are different enough strings that
the existing title-dedup key (built for chapter 5's "Masc"/"Masculine"
abbreviation, D on that in 5E-SPEC1) did not fold them together — both
printed, stacked. This is the identical defect class the dedup key exists
to prevent, just with different text. Fixed by removing the redundant
title from the block, matching how the sibling adjective-paradigm topic
already behaves (topic heading only; the chart supplies no title of its
own). The harness's existing global title-mismatch sweep caught this the
moment it was extended to run against chapters 6-8, which it had not
previously been.

**`c8_qr_third`'s three charts had no `name`.** Chapter 8's third-person
Review chart carried `title`/`subtitle` on each of its three More/Back
pages but no `name` — harmless for display, but it meant
`data-chart-name` (what `Paradigm.svelte` stamps onto its root element so
anything outside the component, including the harness, can tell which
chart is on screen) rendered empty, and every §2.8 More/Back assertion
failed as a result. Fixed by adding `name` alongside `subtitle` on all
three charts. `check-content-shapes.mjs` now enforces this going forward:
a `paradigms[]` stack of more than one page is a More/Back sequence, and
every page in it must carry a non-empty `name`.

---

## New harness assertions

- **`check-content-shapes.mjs`**: a `para` block whose text opens with a
  hand-authored `"N) "` or `"N. "` is now a build failure — it renders
  something and passes every other check, which is exactly how it shipped
  undetected. The message names the fix (`use a numbered block instead`).
- **`check-content-shapes.mjs`**: a `paradigms[]` stack of more than one
  chart must give every chart a non-empty `name` (the bug above).
- **`ui-behavior.mjs` §2.2**: the ch7 popup-reachability check now opens
  `.rc-num-popup` (the number marker) instead of the retired
  word-based `.popup-link`.
- **`ui-behavior.mjs` §2.8**: rewritten against `.paradigm` /
  `data-chart-name` (the generic component) instead of the deleted
  `.pronoun-paradigm` / `data-gender`.
- **`ui-modals.mjs`, `ui-shots-5f.mjs`**: same selector fix as §2.2, so
  screenshot evidence and behavior assertions cannot silently diverge
  from each other again.

---

## Verification

| | |
| --- | --- |
| `npm run check:shapes` | PASS, all 8 chapters, including the two new guards |
| `npm run build` | clean |
| `ui-behavior.mjs` | 587/587 (first re-run after the renderer changes: 6 interaction errors from a dangling `hintRef` cleanup, then a crash on the deleted `.pronoun-paradigm` locator, then 2 content failures — duplicate εἰμί heading and an invented underline on two labelStyle blocks — each fixed and the full suite re-run to clean) |
| `ui-modals.mjs` | 85/85 modal states clean at five device heights, both borders + Close visible at rest, zero unresolved overlay scroll |
| `ui-walk.mjs --chapters=chapt_6,chapt_7,chapt_8` | 70 stops x 2 widths, 0 interaction errors, no horizontal overflow, no console errors — full screen-by-screen rewalk, not a sample |

Screenshots: `buildout/screenshots/5f-patch/` (targeted before/after captures
per item) and `buildout/screenshots/5f-patch-rewalk-final/` (the complete
rewalk, 320px and 768px, every activity in chapters 6-8).
