# 5H-SPEC2-BUILD-OPUS

The build record for 5H-SPEC2 Revision 1a, per ONBOARD-SOL's permanent rule of
2026-08-25: (a) the COMPLETE exact cumulative `git diff`, not a summary and not
excerpts; (b) the work log; (c) the wall clock.

Base commit: `15bbe3b` ("saving revised data files and restarting 5H spec 2").
Handoff: `5H-SPEC2-RESULTS-OPUS.md`. VERIFY document: `VERIFY-5H-2.md`.

---

## (c) Wall clock

| | |
| --- | --- |
| Start | 2026-08-27 21:31:00 UTC |
| End | 2026-08-27 23:28:15 UTC |
| **Elapsed** | **1 h 57 m 15 s** |

There is no prior blocked attempt to add to this total: the Revision 1a data
was already in the tree at the base commit, and the section 1 STOP check
passed on the first read (RESULTS section 2). Any later addendum adds its time
to the figure above, per the standing rule.

Roughly two thirds of that clock is browser-harness runtime rather than
authoring: `ui-behavior.mjs` alone takes about 30 minutes per pass and was run
four times (a baseline before the new assertions were spliced in, a first full
pass, the pass after the two seek repairs, and a confirmation pass over the
final tree), plus one `ui-modals` pass over 47 surfaces at 5 heights, two
`ui-walk` passes over four chapters at two widths, two `ui-disclosure` passes,
one `ui-disclosure3` and one `ui-offline`.

---

## (b) The work log

### 1. Read before touching anything

- `buildout/5H-SPEC2.md` in full (298 lines), then `AGENTS.md` and
  `buildout/ONBOARD-SOL.md` in full, as AGENTS.md requires.
- `buildout/NIT-LOG.md`, the tail of `buildout/DIVERGENCE-LOG.md` (D-50, D-51),
  `buildout/5H-VISUAL-CHECKLIST-OPUS.md`, and `VERIFY-5H-RESPONSE.pdf` (supplied
  with the task).
- `git show --stat HEAD` and `HEAD~1`: the Revision 1a data was already
  committed at the base, along with `NIT-LOG.md`, the 5H verify-walk corpus
  and two `assemble_ch*.py` provenance-key fixes.

### 2. The section 1 STOP gate

Section 1 says to STOP and report if a delivered file does not carry what its
section describes, and not to edit. So every claim in sections 2-4 was checked
against the files BEFORE any code was written — `git diff HEAD~2 HEAD` per
data file, plus targeted greps and a small Python pass over all twelve
chapters. The table in RESULTS section 2 is that check. Every claim held, so
nothing stopped and no data file was edited. `git diff -- src/data/` is empty
at the end of the round.

Two facts worth recording from that pass, because both shaped the work:

- `grep -n "k_osnap" src/data/chapt-11.json` returns exactly one hit (speller
  item 14) against seven `k_osnns`, which is D-56 exactly as written.
- A Python census over all twelve chapters for
  `audioTiming == afterGuess AND greekOptions AND advanceClass != autoBoth`
  returned precisely the four activities section 4.2 names. That census is now
  an assertion rather than a one-off, because a one-off proves nothing about
  chapter 13.

### 3. Reading the code before changing it

`src/lib/content.js` (910 lines), `src/components/SelectActivity.svelte`,
`src/components/ContentAudio.svelte`, `src/components/RichContent.svelte`,
`src/lib/greek.js`, `scripts/check-content-shapes.mjs` and the five `ui-*.mjs`
harness scripts, focused on: how a topic-level `audioMap` reaches
`RichContent`; how `resolveHintRef` and `resolveHintBlocks` differ; how
`sensePool` builds a card; where the 5H-SPEC1 audio gate lives; and which
harness scripts touch the surfaces the data change moved.

Three things found here changed the plan:

1. `resolveHintRef` returns a CHART and three call sites feed the result
   straight to `<Paradigm>`. Spec 3.1 says to add the topic-id fall-through
   inside it; doing that would have needed a type check at each call site, so
   the fall-through went to the resolution site instead (RESULTS 3.3).
2. `resolveContentById` returns blocks with no title, which is why the
   retired `hintPages` route had to author "Three Uses" a second time in the
   data. `resolveHintPage` now returns `{ blocks, title }` and
   `resolveContentById` delegates to it.
3. Spec 2.7 says chapter 11's drills "keep k_voc7a via `senses`". They do keep
   it, but not that way: they carry AUTHORED items with `options: "static"`
   and read `item.audio`. The outcome is unaffected; the note is in RESULTS
   5.2 so the next spec does not reason from the wrong path.

### 4. The code changes, in the order they were made

1. `content.js` `paradigmToggleLabels` — the Greek-contrast fallback (3.3).
2. `content.js` `sensePool` — the untagged card reads the lemma's clip (2.7).
   Bounded first: a survey of every lexicon found exactly three lemmas whose
   untagged sense carries a clip different from the lemma's (ch11 `houtos`,
   ch8 `ego` and `su`), which is what made this a rule rather than a guess.
3. `ContentAudio.svelte` — the objectives contract (2.5), through `splitTaps`.
4. `SelectActivity.svelte` — the inline hint's `audioMap` (2.6), the topic-id
   hint fall-through (3.1), and the generalised gate (4.1).
5. `check-content-shapes.mjs` — `resolvableRefs`, the check that would have
   caught `hintRef: "threeUses"` resolving to nothing (3.4).

One self-inflicted error in there: the `sensePool` edit dropped the two lines
that close the `cards.push({...})` call, and `npm run build` caught it
immediately with a parse error at the next brace. Repaired in one edit.

### 5. Negative-testing the new shape check

A check that has never failed is a check that has never been shown to work.
`src/data/chapt-08.json` was copied to the scratchpad, one item's
`hintRef: "threeUses"` was pointed at `c8_drill_case` — an id that EXISTS in
the chapter (so the old check accepted it) and that resolves to neither a
chart nor a content page — and the checker was run:

```
FAIL: chapt-08.json.drill[1].items[3].hintRef: "c8_drill_case" resolves to no
chart and no content page — the Hint control would silently not render.
```

The file was restored from the copy in the same command. `git diff --stat
src/data/chapt-08.json` is empty.

### 6. The harness, and the three stale assertions it turned up

The baseline pass (before any new assertion) was run first, to separate "my
change broke this" from "this was already broken". It returned **1051/1052**
with one failure: `W1 the ch8 Aὐτός Translation hint reaches the Three Uses
topic through its contentRef`, which pressed More until the topic appeared and
had no More to press any more.

Grepping every `ui-*.mjs` for the retired shape — the discipline ONBOARD §7
imposes after `PronounParadigm.svelte` left three scripts asserting against
deleted markup — found two more, and the second is the instructive one:

- `ui-behavior` P3.2 "ch8 Aὐτός Translation Drill Hint (modal pager)" was
  PASSING while measuring the paradigm's own three-chart pager, under a name
  that says it measures the hint's pager. Renamed to say what it measures, and
  pinned to a named item, because the drill's items are shuffled and only some
  of them route to a chart at all.
- `ui-disclosure` D13 "ch8 Autos Translation hint (4 pages)" expected a pinned
  nav line and failed. Split into two entries, one per route, and the MODALS
  tuple gained an eighth field that seeks a named prompt first.
- `ui-walk` reported one interaction error, "Hint did not open a paradigm", on
  the draw that opened the Three Uses page. A hint payload is not always a
  chart now; the page route is captured as itself by the ref it resolved.

Then the new 5H-SPEC2 block (42 assertions) was written and spliced in ahead
of `await browser.close()`, and the suite re-run.

**One harness bug of my own, caught by the suite rather than by inspection.**
The first full pass returned 1088/1092 with four failures, all one cause: I
seeded three seeks with `λέγει ἡ μήτηρ τοῦ`, which is item 4's `greek` — but
item 4 also carries a `greek2`, and `SelectActivity` renders both lines inside
ONE `.prompt` button, so `innerText` never equalled the one-line fixture. The
seeks now use `ἡ ὥρα αὐτοῦ` (a `threeUses` item with no second line) and the
W1 selector asks the data for `hintRef === 'threeUses' && !item.greek2` rather
than taking the first match. Final pass: **1094/1094**.

### 7. The visual pass

`ui-walk` over chapters 7, 8, 11 and 12 at 320 and 768 px, and `ui-modals`
over 47 surfaces at five device heights, then the rail-walk PDFs rendered with
pymupdf at 200 dpi and cropped to the quadrant each row needed. Twenty-five
page rows and five modal rows are in the `5H-VISUAL-CHECKLIST-2` section.

Two rows came back PASS+note rather than PASS, and both are rail-walk
departures rather than rendering faults:

- **ch8railwalk p7 bottom-right and p8 top-left**: the Aὐτός Translation
  Drill's Hint carries **More | Cancel** and the Three Uses page carries
  **Back | Cancel** — navigation the port no longer has. RESULTS 5.1 lays out
  the two readings that survive the evidence; `VERIFY-5H-2` (s) asks the two
  DOSBox questions that separate them.
- **ch12railwalk p8 top-right**: the Imperfect Parsing Drill's Hint on an εἰμί
  form shows **both charts stacked on one screen with a single Cancel**, where
  the port shows one at a time behind a toggle. That is a DISCLOSURE-RULES
  departure that was not on the VERIFY-5H (l) veto list. RESULTS 5.3;
  `VERIFY-5H-2` (w).

Neither was changed. Both are reported, which is what spec 0.4 asks for and
what the standing rule "a departure you never see is a silent divergence"
requires.

### 8. Gates, in the state they finished in

| Gate | Result |
| --- | --- |
| `npm run check:shapes` | PASS, twelve chapters |
| `npm run build` | PASS, 41 precache entries |
| `npm run check:lazy-chunk` | PASS |
| `node scripts/ui-behavior.mjs` | 1094/1094 |
| `node scripts/ui-modals.mjs` | 47 surfaces x 5 heights, zero BAD |
| `node scripts/ui-disclosure.mjs` | 308/308 |
| `node scripts/ui-disclosure3.mjs` | 84/84, census 270 |
| `node scripts/ui-walk.mjs --chapters=chapt_7,chapt_8,chapt_11,chapt_12` | zero overflow, zero interaction errors, no console errors |
| `node scripts/ui-offline.mjs --chapters=chapt_8,chapt_11,chapt_12` | all stops rendered, refresh OK, no console errors |
| `npm run check:docs` | 44 failures, all pre-existing — proved by stashing the round's work, re-running at `15bbe3b` and diffing the two sorted failure lists, which are identical |

### 9. Git

Read-only throughout except for one index-only round trip: `git add -N` on the
two NEW documents so they appear in the cumulative diff below, immediately
followed by `git reset`. Nothing was staged at the end, nothing committed,
nothing pushed; `git status --short` shows the same eleven modified files, two
new documents and two new screenshot directories it showed before the reset.
One `git stash` / `git stash pop` pair was used for the `check:docs`
before/after comparison in section 8.

---

## (a) The complete cumulative diff

Screenshot corpora are excluded from the diff and shipped as files:
`buildout/screenshots/5h2-walk-opus/` (the four-chapter rail walk at both
widths, plus `walk-report.json`) and `buildout/screenshots/5h2-modals-opus/`
(47 surfaces at five heights, at rest and content-scrolled). Everything else
this round produced is below, verbatim.

```diff
diff --git a/buildout/5H-SPEC2-RESULTS-OPUS.md b/buildout/5H-SPEC2-RESULTS-OPUS.md
new file mode 100644
index 0000000..2e2a8f8
--- /dev/null
+++ b/buildout/5H-SPEC2-RESULTS-OPUS.md
@@ -0,0 +1,402 @@
+# 5H-SPEC2-RESULTS-OPUS
+
+Implementation handoff for 5H-SPEC2 Revision 1a — cohort 5H's closure plus the
+LOOKBACK pass over chapters 3-12. Base: `15bbe3b` ("saving revised data files
+and restarting 5H spec 2"), working tree clean at start.
+
+No git was run beyond read-only `git status` / `git diff` / `git show` and one
+`git stash` round-trip used to prove a pre-existing check failure is
+pre-existing (section 6.2). Nothing is staged, committed or pushed.
+
+Companion documents: `5H-SPEC2-BUILD-OPUS.md` (the complete cumulative diff,
+the tool log and the wall clock), `VERIFY-5H-2.md` (the items only Nathanael
+can settle, authored this round per the new standing rule 0.2) and the
+`5H-VISUAL-CHECKLIST-2` section appended to `5H-VISUAL-CHECKLIST-OPUS.md`.
+
+---
+
+## 1. Headline
+
+**All six delivered data files carry exactly what sections 2-4 say they
+carry**, so nothing STOPPED and no data file was edited. Every renderer item
+shipped, every harness item shipped, and the round's code is six small
+renderer changes plus one shape-check strengthening — no new block type, no
+new mode, no new component.
+
+Two things are worth your attention before the detail.
+
+**First, the round found three stale harness assertions**, all of them
+downstream of the retired `ui.hintPages` key, and one of them was passing
+while measuring something other than what its name said. That is the ONBOARD
+§7 failure mode ("a harness that still passes after testing markup that no
+longer exists is worse than no harness"), and it is section 4.
+
+**Second, the ch8 rail walk does not obviously agree with spec section 3.1**,
+and I shipped 3.1 as written while flagging it. `ch8railwalk` p7 bottom-right
+shows the Aὐτός Translation Drill's Hint carrying **More | Cancel**, and p8
+top-left shows the Three Uses page carrying **Back | Cancel** — a two-page
+stack, which is what the port had before this round and what 3.1 removed. It
+is genuinely ambiguous, because every hint screen in that walk was opened from
+a PARADIGM item; section 5.1 lays out both readings and `VERIFY-5H-2` (s) asks
+the two DOSBox questions that separate them. **If the answer comes back
+"stack", the revert is the data key plus about six lines here.**
+
+| Spec item | State |
+| --- | --- |
+| 2.1 (a) RESTORE the Relative Pronouns Introduction | done — data only; the pending banner is gone and the walk confirms it |
+| 2.2 Demonstrative Examples Jn 13:35 line break | done — data only; re-screenshotted |
+| 2.3 / 2.4 ὅς Neut.-A, μέν, prompt 24, both slips | done — data only; verified in the walk and the modal pass |
+| 2.5 (o) objectives taps — RENDERER + DATA CONTRACT | done — `{text, audioMap}`, three taps, twelve-chapter census |
+| 2.6 Augment hint taps | done — inline hints apply `audioMap` the way topics do; 4 positives, 2 negatives |
+| 2.7 οὗτος says all three | done — and it found a real disagreement inside chapter 8; section 5.2 |
+| 2.8 ὅς parts | data only; `parts` is deliberately unrendered pending `VERIFY-5H-2` (r) |
+| 2.9 (p) Quick Review say-all consolidation | done — the inverse assertion is in, and the Learn-toggle family was NOT extended |
+| 3.1 ch8 form-dependent hints | done — the topic-id fall-through plus the check that would have caught the gap; see section 5.1 |
+| 3.3 Greek toggle labels | done — the section 3.3 default applied, the other five rows asserted unchanged |
+| 4 audio-leak gate generalised | done — the triple selects exactly four activities, computed from the data by the harness |
+| 5 NIT-LOG | done — N-1 and N-2 appended |
+| 6 harness, acceptance, VERIFY-5H-2 | done |
+| 7 D-52..D-56 + D-51 amend | done — appended verbatim (spec 1's default) |
+
+---
+
+## 2. The STOP gate: what the delivered data actually carries
+
+Section 1 says to STOP if a file does not carry what its section describes. I
+checked all six against their sections before writing any code. Every claim
+holds:
+
+| Claim | Verified |
+| --- | --- |
+| 2.1 the ch11 Introduction topic's key is `_verify_note`, not `_verify` | yes — and that is why no banner renders |
+| 2.2 Jn 13:35 is ONE `greek` string with no `greek2` | yes |
+| 2.3 `k_osnap` survives at exactly ONE site (speller item 14, answer οὕς); the Learn cell, the Quick Review copy and the `relativeParadigm` hint are `k_osnns` | yes — 1 occurrence of `k_osnap`, 7 of `k_osnns` |
+| 2.4 μέν gloss, prompt 24, τούτου, ἐκεῖνοί | yes, all four |
+| 2.5 ch11 objective 1 and ch7 objective **5** carry `audioMap` | yes — Revision 1a's off-by-one fix is in the file; objective 4 is a plain string again |
+| 2.6 `hint.audioMap` on `c12_drill_augment` with l_ex11-14 | yes |
+| 2.7 lexicon `houtos.audio` is `k_voc7` | yes |
+| 2.8 `hos.parts` wires k_osmns / k_osfns / k_osnns; `audio` stays k_voc5 | yes |
+| 2.9 ch11's three Review pages carry `sayWhole` on the PLURAL half only | yes — 2 of 4, 1 of 2, 3 of 6, always the odd index |
+| 3.1 ch8 per-item `hintRef` on both drills; `ui.hintPages` removed | yes — and the removed value is preserved as `_hint_pages_removed` |
+| 4.2 the 4.1 triple selects ch3/ch4/ch5/ch12 and nothing else | yes — computed over every select activity in twelve chapters, in the harness rather than by hand |
+
+`npm run check:shapes` passes over all twelve chapters, which includes the
+manifest existence check on every new audio id (`chapt_7_g_eimi1s`,
+`chapt_11_k_ekemns`, `chapt_11_k_outmns`, `chapt_12_l_ex11-14`,
+`chapt_11_k_osnns`, `chapt_11_k_osmns`, `chapt_11_k_osfns`).
+
+---
+
+## 3. What was built, module by module
+
+### 3.1 `src/lib/content.js` — three changes
+
+**`paradigmToggleLabels` (spec 3.3).** One line plus a local `GREEK_LETTER`
+regex: a contrast word that is Greek falls back to More/Back. Stated as
+DISCLOSURE-RULES §4.1's own rule ("a LEXICAL contrast goes to More/Back")
+rather than as a chapter-12 exception, so there is one rule in one place. The
+regex is a local copy of `lib/greek.js`'s, character for character, rather than
+an import — `content.js` is the module every route gates on and it has no
+other dependency on the typography layer, which carries `mark-geometry.json`
+with it. Two copies of a five-character range is the cheaper of the two costs;
+flagged here so it is a decision rather than an accident.
+
+**`sensePool` untagged card audio (spec 2.7).** `(sense && sense.audio) ||
+lemma.audio` became `lemma.audio || (sense && sense.audio)`. The untagged
+branch is the one-card-for-every-form case — the card prints the whole
+`lexicalForm` — so the recording that matches what is on screen is the lemma's
+recitation of all of them, and a sense clip speaks one form and belongs to the
+drills. See section 5.2 for what this reached beyond chapter 11.
+
+**`resolveHintPage` (spec 3.1), new export.** `resolveContentById` returned
+blocks only, so a hint that borrowed a teaching topic arrived untitled — which
+is why the retired `hintPages` route had to author "Three Uses" a second time
+in the data. `resolveHintPage` returns `{ blocks, title }` from one walk and
+`resolveContentById` now delegates to it, so its two existing callers are
+unchanged.
+
+### 3.2 `src/components/ContentAudio.svelte` — the objectives contract (2.5)
+
+An `objectives[]` entry is now either a string or `{ text, audioMap }`. The
+object form renders through `splitTaps`, the same helper prose taps use, so a
+Greek word in an objective renders exactly as it does anywhere else
+(`.greek-tap.greek`, blue, directive 8/9). Every other objective in twelve
+chapters is a string and takes the unchanged path.
+
+### 3.3 `src/components/SelectActivity.svelte` — three changes
+
+**The inline hint's `audioMap` (2.6).** `<RichContent blocks={hintBlocks} />`
+gained `greekTaps={activity.hint?.audioMap || null}`. That is the same prop a
+topic's `audioMap` travels on, so the Augment hint's four compound forms tap
+and the Greek in the rule lines does not — the map is a list of what speaks,
+not a switch that turns the page's Greek on.
+
+**The topic-id hint fall-through (3.1).** *Deviation from the spec's wording,
+same result.* 3.1 says to add the fall-through inside `resolveHintRef`. That
+function answers "which CHART", and all three of its call sites feed the
+result straight to `<Paradigm>`; returning blocks from it would have needed a
+type check at each. The fall-through is instead at the resolution SITE:
+
+```js
+$: hintRefPage = activeHintRef && !hintChart
+  ? resolveHintPage(chapter, activeHintRef)
+  : { blocks: [], title: null };
+```
+
+plus one modal branch and one term in `showHintButton`. It is still one
+branch, it still uses the pre-existing topic-id resolver, and no existing
+route changed. The new modal carries `data-hint-page-ref` so the harness can
+tell the two routes apart by more than their heading text.
+
+**The audio-leak gate, generalised (4.1).** The condition's first leg was
+`promptIsGreek`, which fenced it to chapter 12. It is now
+`advancePolicy.advanceClass !== 'autoBoth'`:
+
+```js
+$: answerClipPrompt = greekOptions && audioTiming === 'afterGuess'
+  && advancePolicy.advanceClass !== 'autoBoth';
+```
+
+The ink-prompt half of the gate is unchanged and already conditioned on
+`promptIsGreek`, so on the three English-prompt drills it is vacuous rather
+than skipped — only the Pronounce half bites there, which is what 4.2
+describes. The Pronounce button's comment, which used to say the original's
+Pronounce speaks the answer form there and stop, now says that AND that
+Nathanael's (d) ruling gates it anyway.
+
+### 3.4 `scripts/check-content-shapes.mjs` — the check that would have caught it
+
+ONBOARD §7: "when a new defect class is found and fixed, add the check that
+would have caught it." `hintRef: "threeUses"` shipped in the delivered data,
+passed this file cleanly, and resolved to NOTHING in the app — a Hint button
+that silently does not render, which is the exact class the existing block was
+written to catch, one level down. The old set was "every id, type and title
+slug anywhere in the chapter"; the new `resolvableRefs` models the renderer's
+two real paths — a CHART (a paradigm block under the named node, a bare
+`paradigm` object, a chart title slug, or a `hintCharts` composite) or a PAGE
+(a topic id with its own non-empty `content`).
+
+Negative-tested: pointing one item's `hintRef` at `c8_drill_case` — an id that
+exists, that the OLD check accepted, and that resolves to neither — now fails
+with `"c8_drill_case" resolves to no chart and no content page`. The data was
+restored from a copy immediately; `git diff` on `src/data/` is empty.
+
+### 3.5 Harness
+
+- `ui-behavior.mjs`: a new 5H-SPEC2 block, **42 assertions**, plus the two
+  repairs in section 4. Each is a census rather than a sample where a census
+  is possible: the objectives check reads every chapter's own objective count
+  and audioMap key count, and the gate check computes the 4.1 triple over
+  every select activity in twelve chapters and compares the result with the
+  four ids the spec names. If a thirteenth chapter ships a fifth gated drill,
+  the census grows with it; if the renderer's condition drifts from 4.1, the
+  two lists part.
+- `ui-modals.mjs`: five new surfaces (the Case Drill's three person routes,
+  both translation routes) — 47 surfaces at five device heights.
+- `ui-disclosure.mjs`: the ch8 Autos entry became two, one per route, and the
+  MODALS tuple gained an eighth field that seeks a named prompt before opening
+  the Hint. Without it a form-dependent hint measures whichever item the
+  shuffle drew.
+
+---
+
+## 4. Three stale harness assertions, and what they teach
+
+All three are downstream of `ui.hintPages` being removed from the delivered
+data. The first failed honestly; the other two are the interesting ones.
+
+**(a) `ui-behavior` W1 — failed, correctly.** It pressed More until the Three
+Uses topic appeared. There is no More any more, so the DISCLOSURE-SPEC3 check
+that the two crossed reflexive clips are right on BOTH surfaces lost its
+second surface. It now stands on an item whose `hintRef` routes there. What it
+asserts is unchanged; only the route it walks changed.
+
+**(b) `ui-behavior` P3.2 "ch8 Aὐτός Translation Drill Hint (modal pager)" —
+PASSED, while measuring something else.** It takes `.pg-nav` inside the modal.
+The hint pager is gone, but the third-person paradigm is a three-chart stack,
+so `Paradigm` draws its own `.pg-nav` — and the check happily measured that
+instead, under a name that says "modal pager". It is renamed to say what it
+measures and pinned to a named item, because the drill's items are shuffled
+and only some of them route to a chart at all: without the pin it would pass
+or fail on the draw.
+
+**(c) `ui-disclosure` D13 "ch8 Autos Translation hint (4 pages)" — failed,
+and was the wrong shape twice over.** It expected a pinned nav line. Worse,
+even repaired it would have been nondeterministic for the same shuffle reason.
+It is now two entries, one per route, each seeking its own form first: the
+paradigm route is a three-chart §4.2 pinned pair, the Three Uses route pins
+nothing.
+
+One more reference survives deliberately: `scripts/shots-disclosure3.mjs` line
+175 captures `w7-ch8-autos-hint-page4` by pressing More three times. That file
+is a one-round screenshot script for DISCLOSURE-SPEC3, not a gate, and its
+captures are historical evidence of a state that has since been ruled on. It
+is named here rather than edited, so nobody re-runs it and reports a mystery.
+
+---
+
+## 5. Three findings that need Nathanael
+
+### 5.1 The ch8 rail walk reads like a two-page stack
+
+Spec 3.1's correction says the port "did NOT lack a Hint here; it stacked BOTH
+payloads as a two-page `ui.hintPages`... the per-item routing is the
+original's." I shipped that. But the rail walk is not a clean confirmation:
+
+- **ch8railwalk p7 bottom-left**: the drill, on item 1
+  (κατὰ τὸ αὐτὸ πνεῦμα, 1 Cor 12:8) — a `thirdPersonParadigm` item.
+- **p7 bottom-right**: the Hint it opened. Third Person Paradigm,
+  **More | Cancel**.
+- **p8 top-left**: Three Uses, all three numbered points, **Back | Cancel**.
+- **p8 bottom-left**, for contrast: the Case Drill's Hint on the αὐτή item —
+  the same paradigm, **Cancel only**. So the original does distinguish a hint
+  that pages from one that does not, and the Autos hint is one that pages.
+
+Two readings survive, because every hint screen in that walk was opened from a
+paradigm item:
+
+- **A** — the Hint is always a two-page stack, paradigm first, and the
+  dispatch at `0x7bf39` means something else. The port would then be opening
+  the wrong page for eight items AND missing the navigation.
+- **B** — the dispatch chooses the FIRST page and More/Back reaches the other.
+  Item 1 opening at the paradigm with More available is exactly the capture.
+  The port would then be routing correctly and missing only the navigation.
+
+Under BOTH readings the port is missing a More/Back pair the original has.
+I did not add it, because 3.1 says in as many words not to re-introduce
+`hintPages`, and because which shape to add depends on which reading is true.
+`VERIFY-5H-2` (s) asks the two questions that separate them — step to item 4
+in DOSBox, see which page opens and what buttons it has — and gives the page
+references above so the question can be answered against the same evidence.
+
+This is also, I think, an instance of the spec's own new rule 0.4: a rail-walk
+screen that departs from what the extraction expects gets reported before the
+work proceeds. The extraction read a dispatch table; the walk shows navigation
+the dispatch reading does not predict.
+
+### 5.2 Rule 2.7 reached chapter 8, and found the two surfaces disagreeing
+
+2.7 says "confirm the flashcard and the review row read the lemma's `audio`,
+not `senses[0].audio`". Stating that as a rule — rather than as a οὗτος
+special case — reaches every one-card-many-forms lemma in the app. There are
+exactly three: ch11 `houtos`, and ch8 `ego` (ἐγώ / ἡμεῖς) and `su` (σύ /
+ὑμεῖς).
+
+What I found while bounding it is why I am confident it is right rather than
+merely consistent: **chapter 8's two vocabulary surfaces already disagreed
+with each other.** `c8_qr_vocab` draws from the `lemmas` pool and has always
+played `h_voc3` on that row; `c8_learn_vocab` draws from `senses` and played
+`h_voc3a`, one of the two words printed on the card. The change aligns the
+flashcard with the Review chart's shipped, device-verified behaviour rather
+than inventing a third answer, and the harness asserts the pair together for
+exactly that reason.
+
+It still deserves an ear, because nobody has confirmed what `h_voc3` and
+`h_voc9` actually recite. `VERIFY-5H-2` (v).
+
+### 5.3 The ch12 εἰμί hint is ONE screen in the original, not two
+
+Found while cropping `ch12railwalk` p8 for the section 3.3 comparison, and it
+reframes the labelling question rather than answering it.
+
+**p8 top-right** — and **p8 bottom-left**, the same panel with the cursor
+moved — is the Imperfect Indicative Parsing Drill's Hint on an εἰμί form.
+**"Imperfect of εἰμί" and "Imperfect of ἔχω" are both on that one screen**,
+stacked, with a single **Cancel**. No More, no Back, no toggle.
+
+The port shows one chart at a time behind a two-state toggle. That split came
+in with 5H-SPEC1; the 5H visual checklist passed it (row 12.14) against this
+same panel, and 5H-SPEC2's own section 3.3 describes the pair as "consecutive
+screens". Reading the panel again, I think it is a stack and both documents
+read it as a toggle.
+
+If that is right, it is a DISCLOSURE-RULES departure of exactly the kind
+VERIFY-5H item (l) listed for veto row by row, and it was not on that list —
+which under the standing rule makes it a silent divergence. It also makes item
+(t) possibly moot: with both charts stacked there is no toggle left to label.
+
+**I did not change it.** This spec's 3.3 asks about the LABEL on a toggle;
+whether the toggle should exist is a disclosure decision, and deciding it
+inside a labelling item is precisely the kind of scope creep the round rules
+forbid. Both charts are narrow (three numbered rows, a Singular and a Plural
+column, short glosses) so a stack would very likely fit at 320 px the way the
+Quick Review pages do under §4.6. `VERIFY-5H-2` (w) asks, and (t) now points
+at it.
+
+---
+
+One spec detail worth correcting for the pipeline's model of the code: 2.7
+says "the drills keep `k_voc7a` via `senses`". The outcome is right and the
+mechanism is not — chapter 11's two vocabulary drills carry AUTHORED items
+with `options: "static"`, so they read `item.audio` and never touch the
+lexicon's `senses` at all. `pool: "senses"` on those drills resolves through
+`lemmaPool`, which falls back to the `lemmas` bucket. Nothing needed to
+change; the note is here so the next spec does not reason from the wrong path.
+
+---
+
+## 6. Acceptance
+
+### 6.1 Gates (spec 6.1)
+
+| Gate | Result |
+| --- | --- |
+| `npm run check:shapes` | PASS, twelve chapters, with the new hintRef resolution rule |
+| `npm run build` | PASS, clean; 41 precache entries |
+| `npm run check:lazy-chunk` | PASS — twelve chapter chunks + twelve lexicon chunks emitted, precached, out of the index bundle |
+| `node scripts/ui-behavior.mjs` | **1094/1094** (was 1052 before this round; +42) |
+| `node scripts/ui-modals.mjs` | PASS — 47 surfaces x 5 device heights, zero BAD, zero overlay scroll range |
+| `node scripts/ui-disclosure.mjs` | **308/308** |
+| `node scripts/ui-disclosure3.mjs` | **84/84**, census unchanged at 270 activities |
+| `node scripts/ui-walk.mjs --chapters=chapt_7,chapt_8,chapt_11,chapt_12` | PASS — zero 320 px overflow, zero interaction errors, all rail counts and Next actions live, all expanders and chart states opened, no console errors |
+| `node scripts/ui-offline.mjs --chapters=chapt_8,chapt_11,chapt_12` | PASS — 76 stops rendered, 0 missing, refresh OK, no console errors |
+
+### 6.2 One gate that fails, and failed before this round
+
+`npm run check:docs` reports **44 document-integrity failures**. They are
+pre-existing: I ran it at `15bbe3b` with my work stashed and got the identical
+44, and diffed the two lists to confirm they match line for line. It is not in
+the spec's 6.1 gate list. My DIVERGENCE-LOG and NIT-LOG edits are appends and
+add no new failure.
+
+### 6.3 Visual pass (spec 6.2)
+
+`5H-VISUAL-CHECKLIST-2`, appended to `5H-VISUAL-CHECKLIST-OPUS.md`: every page
+whose data or renderer changed, at 320 px and 768 px, against the rail-walk
+panel rendered from the PDF with pymupdf. Every row PASS. Three of them are
+also in `VERIFY-5H-2` (u), because "matches the original" and "reads well on a
+phone" could disagree there and that is Nathanael's call, not mine.
+
+---
+
+## 7. Deviations from the spec
+
+1. **3.1's fall-through is at the resolution site, not inside
+   `resolveHintRef`** (section 3.2). Same branch count, same resolver, no
+   existing route touched.
+2. **2.8's `parts` are deliberately not rendered.** The spec wires them in the
+   data and makes the surface question a VERIFY listen; rendering them now
+   would pre-empt (r).
+3. **Section 3.3's default was applied** because no kickoff ruling arrived.
+   NIT-LOG N-2 records it as the default and `VERIFY-5H-2` (t) asks for
+   confirmation; the revert is one line plus four assertions.
+4. **Section 7's divergence entries were appended by the implementer
+   verbatim**, which is section 1's stated default.
+5. **DRILL-BEHAVIOR-RULES A1c is cited as "A1c, pending"** per spec 4.2 — the
+   pipeline writes that amendment, and the spec's section 8 debts
+   (`post_patches()`, TITLE-SWEEP-RULES, CHAT-HANDOFF) are pipeline work and
+   were not touched.
+
+---
+
+## 8. Surprises
+
+- The delivered `hintRef: "threeUses"` passed `check:shapes` and resolved to
+  nothing in the app. Both facts were true simultaneously, which is the whole
+  reason section 3.4 exists.
+- `c8_qr_vocab` and `c8_learn_vocab` have been playing different clips for the
+  same card since chapter 8 shipped (section 5.2).
+- The `.card .prompt` of a two-line translation item renders BOTH lines inside
+  one button, so seeking an item by its `greek` field alone silently fails on
+  any item with a `greek2`. That cost one harness run; the seeks now pick
+  single-line items and say so.
diff --git a/buildout/5H-VISUAL-CHECKLIST-OPUS.md b/buildout/5H-VISUAL-CHECKLIST-OPUS.md
index 1108c2e..a404d57 100644
--- a/buildout/5H-VISUAL-CHECKLIST-OPUS.md
+++ b/buildout/5H-VISUAL-CHECKLIST-OPUS.md
@@ -133,3 +133,74 @@ Modal sizing at five device heights (390x844, 390x734, 390x664, 320x360,
 768x1024) is covered by `ui-modals.mjs`, extended this round with sixteen new
 surfaces including both form-dependent hint routes of each D-46 drill and both
 new Greek-keyboard references.
+
+---
+
+# 5H-VISUAL-CHECKLIST-2 (5H-SPEC2, section 6.2)
+
+Every page whose DATA or RENDERER changed in 5H-SPEC2, at 320 px and 768 px,
+compared against its rail-walk panel. Appended to this file rather than opened
+as a new one, per spec 6.2.
+
+METHOD. `npm run preview`, then
+`node scripts/ui-walk.mjs --chapters=chapt_7,chapt_8,chapt_11,chapt_12 --out=buildout/screenshots/5h2-walk-opus`
+and `node scripts/ui-modals.mjs --out=buildout/screenshots/5h2-modals-opus`.
+The rail-walk panels were rendered from the PDFs with pymupdf at 200 dpi and
+cropped to the quadrant named in each row — `ch7railwalk.pdf` (16 pages),
+`ch8railwalk.pdf` (15), `ch11railwalk.pdf` (24), `ch12railwalk.pdf` (21).
+Modal states come from the modal corpus, which photographs every surface at
+five device heights; the row names the height it was read at.
+
+320 px OVERFLOW: **zero stops overflow** in any of the four chapters
+(`ui-walk.mjs`: "no horizontal overflow in chapt_7, chapt_8, chapt_11,
+chapt_12"). The walk also reports zero interaction errors, all rail counts and
+Next actions live, and all authored expanders and chart states opened.
+
+Status: PASS / PASS+note / FAIL. Every row is PASS at the state delivered.
+
+| # | Page or state | Rail walk | What was compared | Status |
+| --- | --- | --- | --- | --- |
+| 2.1 | `chapt_11/c11_learn_objectives` | ch11 p1 top-right | Seven objectives, objective 1 wrapping onto an indented second line, **ἐκεῖνος** and **οὗτος** now BLUE taps with "(that)" and "(this)" left in ink beside them; word order and punctuation unchanged | PASS (the two words were ink before this round; VERIFY-5H (o)) |
+| 2.2 | `chapt_7/c7_learn_objectives` | ch7 p1 top-right | Seven objectives; **εἰμί** on objective 5 is a tap, objective 4 is a plain string again after Revision 1a's off-by-one fix | PASS |
+| 2.3 | ...every other objectives page, chapters 1-12 | — | No page gained a tap and none lost a line | PASS (machine census, `ui-behavior` 5H-SPEC2 2.5) |
+| 2.4 | `chapt_11` Demonstrative Examples modal, Jn 13:35 | ch11 p3 bottom-right | **One flowing Greek line** — ἐμοὶ and μαθηταί are no longer split across a hard break; the line wraps where the column ends, as the original's does | PASS (RESPONSE 1) |
+| 2.5 | ...the same modal, Jn 8:23 | ch11 p3 bottom-right | **τούτου** with an ACUTE on the penult, matching the drill pool and the rest of the chapter | PASS (D-53) |
+| 2.6 | `chapt_11/c11_drill_translation_this_that` item 13 | ch11 p8 | **ἐκεῖνοί** with its smooth breathing restored; the second acute is unchanged (the enclitic accent thrown back by εἰσιν) | PASS (D-53) |
+| 2.7 | `chapt_11/c11_learn_relatives` topic 2, Neut.-A cell | ch11 p12 top-left | The ὅς chart's plural neuter accusative **ἅ**; the cell is unchanged on screen and its clip is now `k_osnns` | PASS (D-56; the change is audible, not visible) |
+| 2.8 | `chapt_11/c11_learn_relatives` topic 1 (Introduction) | ch11 p11 top-right | The TBK's own "Relative Pronouns" text and its (cont.) rule, **with no pending-verification banner** — the data key is `_verify_note` now | PASS (D-52; the 5H row 11.15 note is discharged) |
+| 2.9 | `chapt_11/c11_ex_speller_relative` prompt 24 | ch11 p17 top-right | Reads **"who (masc. nom. pl.)"**; the answer οἵ and the tile keyboard are unchanged | PASS (D-54) |
+| 2.10 | `chapt_11/c11_qr_this_that` | ch11 p20 bottom-left, bottom-right | Four stacked halves, **TWO Say Paradigm buttons**, each after its Plural half; the αὐ/ου note on both halves of the οὗτος pair | PASS (VERIFY-5H (p); the original prints one button per paradigm on one screen, which is what two matches) |
+| 2.11 | `chapt_11/c11_qr_relative` | ch11 p21 top-left | Two stacked halves, **ONE Say Paradigm button** after the Plural half, the "Note how similar…" line on both halves | PASS |
+| 2.12 | `chapt_11/c11_qr_reflexive` | ch11 p21 top-right, p22 | Six stacked halves, **THREE Say Paradigm buttons**, one after each person's Plural half; the no-nominative note on all six | PASS |
+| 2.13 | `chapt_11/c11_learn_vocab`, the οὗτος card | ch11 p17 bottom-left | Card prints **οὗτος, αὕτη, τοῦτο** and now plays `k_voc7`, the three-form recitation, rather than `k_voc7a` | PASS (RESPONSE 6; audible, not visible) |
+| 2.14 | `chapt_11/c11_qr_vocab`, the οὗτος row | ch11 p20 top-right | Same row text and the same "(1388)" frequency; the row's tap is now `k_voc7` | PASS (RESPONSE 6) |
+| 2.15 | `chapt_12/c12_qr_vocab`, the μέν row | ch12 p17 bottom-left | Gloss reads **"on the one hand, indeed (179)"**; the drills' and flashcard's short gloss "indeed" is untouched | PASS (D-55) |
+| 2.16 | `chapt_12/c12_drill_augment` Hint | ch12 p6 (Augments cont.), read at 390x844 | Four numbered rules on one screen; **ἐκβάλλω, ἐξεβάλλον, ἀποκτείνω, ἀπέκτεινον in points 3 and 4 are blue taps**; the contraction table in point 2 and the augment vowel in point 1 stay INK | PASS (RESPONSE 5; the two kinds of Greek on one screen are flagged for Nathanael in VERIFY-5H-2 (u)) |
+| 2.17 | `chapt_8/c8_drill_case` Hint, three routes | ch8 p8 bottom-left | A first-person form opens the First Person paradigm, a second-person form the Second, an αὐτ- form the Third — three different modal titles off one drill. The original's panel (the third-person route) carries **Cancel only**, which the port matches | PASS (spec 3.1; whether the original routes all three is VERIFY-5H-2 (s)) |
+| 2.18 | `chapt_8/c8_drill_translation_autos` Hint, paradigm route | ch8 p7 bottom-right | The Third Person Paradigm, Masculine / Feminine / Neuter on the §4.2 Back-More pair | PASS+note (**the original's panel carries More \| Cancel and the port carries Close** — see RESULTS §5.1 and VERIFY-5H-2 (s)) |
+| 2.19 | ...its Three Uses route | ch8 p8 top-left | The teaching page as a Hint: title, the "αὐτός can be used in three ways" line, three numbered points with hanging indents and their underlined lead terms, and the three Examples accordions the C2 conversion put there | PASS+note (**the original's panel carries Back \| Cancel**; same item) |
+| 2.20 | ...both routes at 320x360 | — | Both fit with the overlay unscrolled and Close pinned; the Three Uses body scrolls inside the modal, the shell does not | PASS (`ui-modals.mjs`, 47 surfaces x 5 heights, zero BAD) |
+| 2.21 | `chapt_12/c12_drill_parsing` Hint on an εἰμί form | ch12 p8 top-right | The "Imperfect of εἰμί" chart with its toggle now reading **More** / **Back** rather than **ἔχω** / **εἰμί** | PASS+note (**the original's panel shows BOTH charts stacked on one screen with a single Cancel** — RESULTS §5.3, VERIFY-5H-2 (w)) |
+| 2.22 | ...on a λύω form | ch12 p8 | The Active chart with its toggle still reading **Middle/Passive** — an English contrast, untouched by the 3.3 rule | PASS |
+| 2.23 | `chapt_10/c10_drill_parsing` Hint on an εἰμί form | ch10 p (5G corpus) | Toggle still reads **Future** / **Present** | PASS (regression row for 3.3) |
+| 2.24 | `chapt_11` four drill hints | ch11 p5, p6, p14 | Toggles still read **Singular** / **Plural** | PASS (regression row for 3.3) |
+| 2.25 | `chapt_3/c3_drill_greek_verb`, `chapt_4/c4_drill_greek_noun`, `chapt_5/c5_drill_first_decl_noun` | ch3 p, ch4 p, ch5 p (5D/5E corpora) | English prompt in ink (unchanged — these prompts were never taps), Greek options unchanged, **Pronounce greyed until the item is answered and live afterwards** | PASS (D-51 amend; the ink-prompt half of the gate is vacuous here because the prompt is English) |
+
+## Modal states added this round
+
+| # | Modal state | Route | Status |
+| --- | --- | --- | --- |
+| S2.1 | ch8 Case Drill hint, First Person | `chapt_8/c8_drill_case` → seek ἡμεῖς → Hint | PASS |
+| S2.2 | ch8 Case Drill hint, Second Person | ...seek σοι → Hint | PASS |
+| S2.3 | ch8 Case Drill hint, Third Person | ...seek αὐτή → Hint | PASS |
+| S2.4 | ch8 Aὐτός Translation hint, paradigm route | `chapt_8/c8_drill_translation_autos` → seek κατὰ τὸ αὐτὸ πνεῦμα → Hint | PASS |
+| S2.5 | ch8 Aὐτός Translation hint, Three Uses route | ...seek ἡ ὥρα αὐτοῦ → Hint | PASS |
+
+All five are sought by FORM rather than trusted to the shuffle: this drill's
+Hint payload now depends on which item is on screen, so opening "the Hint"
+would photograph whichever the draw gave (`ui-modals.mjs`, `ui-disclosure.mjs`
+and `ui-behavior.mjs` all seek).
+
+`ui-disclosure.mjs` D13 covers the same two translation routes at 390x520
+under forced scroll: the paradigm route keeps the §4.2 pinned pair, the Three
+Uses route pins nothing, and each seeks its own form first.
diff --git a/buildout/DIVERGENCE-LOG.md b/buildout/DIVERGENCE-LOG.md
index 00d4b4c..9174a13 100644
--- a/buildout/DIVERGENCE-LOG.md
+++ b/buildout/DIVERGENCE-LOG.md
@@ -548,6 +548,34 @@ D-51 | ch12 | AUGMENT DRILL: THE ANSWER-CLIP PROMPT GATE. The drill's
      half is a deliberate improvement or a mirror. | 5H-SPEC1 3.5,
      implementer.
 
+D-51 (amend) | app | The Augment Drill gate generalised to the section
+     4.1 triple; applies to ch3/ch4/ch5's English-prompt form drills;
+     English-to-Greek vocabulary drills and spellers excluded by
+     ruling. | Nathanael, VERIFY-5H (d), 2026-08-26.
+
+D-52 | ch11 | RELATIVE PRONOUNS INTRODUCTION RESTORED. The original's
+     Introduction radio shows the Reflexive/Reciprocal box (rail walk
+     p11-12, DOSBox-confirmed); the port shows the TBK's own unshown
+     "Relative Pronouns" + "(cont.)" fields (0x4136e, 0x420fc). Six
+     clips (k_agree1-4, k_under1-2) remain unwired. | Nathanael,
+     VERIFY-5H (a), 2026-08-26.
+
+D-53 | ch11 | Two typographic slips of the original corrected: τοὺτου ->
+     τούτου (Demonstrative Examples, Jn 8:23); εκεῖνοί -> ἐκεῖνοί (This
+     and That Translation item 13). | Nathanael, VERIFY-5H (m).
+
+D-54 | ch11 | Relative and Reflexive Spelling prompt 24 "whom (masc.
+     nom. pl.)" -> "who (masc. nom. pl.)"; answer οἵ unchanged. |
+     VERIFY-5H (h).
+
+D-55 | ch12 | Review Vocabulary Chart μέν gloss "one the one hand,
+     indeed" -> "on the one hand, indeed". | VERIFY-5H (g).
+
+D-56 | ch11 | K_OSNAP records οὕς, not the neuter ἅ its name implies;
+     every ἅ cell now plays K_OSNNS (same form); the speller item whose
+     answer is οὕς mirrors the original and keeps K_OSNAP. | Nathanael
+     listen, VERIFY-5H (q) + RESPONSE 2.
+
 ## Auto-progress / advance rule matrix
 
 MOVED. The full exercise-by-exercise, chapter-by-chapter matrix —
diff --git a/buildout/NIT-LOG.md b/buildout/NIT-LOG.md
index b106b55..f79785e 100644
--- a/buildout/NIT-LOG.md
+++ b/buildout/NIT-LOG.md
@@ -33,6 +33,19 @@ Instances to date (clip -> halves):
   original recorded (ch5 article E_ARTSG/E_ARTPL, ch7 adjectives
   G_AGPARS/G_AGPARP, ch8 third person H_3MPAR/H_3FPAR/H_3NPAR).
 - Chapter 12: none (its charts are two columns and fit unsplit).
+- APPLIED 2026-08-27 (5H-SPEC2 2.9, implementer). The Quick Review half of
+  the ruling now ships: `c11_qr_this_that` 2 buttons over 4 halves,
+  `c11_qr_relative` 1 over 2, `c11_qr_reflexive` 3 over 6 -- twelve buttons
+  down to six, each after its Plural half. The Learn toggles and every modal
+  are untouched, which is the other half of the same ruling; ui-behavior
+  asserts both directions ("named toggle keeps its say-all" for the toggles,
+  "no Singular half carries the button" for the Review pages) so neither can
+  drift into the other.
+- FULL SPLIT LIST, for the future audio-pipeline job. Six recordings, twelve
+  half-charts each side of the Learn/Review divide:
+  K_EKEPAR, K_OUTPAR, K_OSPAR, K_AUTPAR, K_SEAPAR, K_EAUPAR. Nothing in
+  chapters 1-10 or 12 joins them. This is the complete record Nathanael asked
+  for before deciding whether to cut the clips.
 
 **N-2 | Two-state toggles whose only contrast is a Greek word.**
 DISCLOSURE-RULES §4.1 sends a lexical contrast to More/Back
@@ -43,6 +56,17 @@ decision pending Nathanael. Instances: ch4 Learn Nouns λόγος/ἄνθρωπ
 (More/Back), ch5 Learn Nouns ὥρα/δόξα (More/Back), ch12 Parsing Drill
 hint εἰμί/ἔχω (Greek labels).
 
+DEFAULT APPLIED 2026-08-27 (5H-SPEC2 3.3, no kickoff ruling to the
+contrary). `paradigmToggleLabels` falls back to More/Back whenever the one
+differing word of the two titles is GREEK, so the ch12 εἰμί/ἔχω hint now
+reads More / Back and joins the other two lexical contrasts. Stated as the
+§4.1 rule rather than as a chapter-12 exception, so it is one rule in one
+place. The five English contrasts in the section 3.3 matrix are asserted
+UNCHANGED in the same ui-behavior pass (Present/Future on ch10,
+Middle/Passive on ch12's λύω pair, Singular/Plural on ch11). Reversing it is
+a one-line revert plus those assertions; VERIFY-5H-2 (t) asks Nathanael to
+confirm or reverse.
+
 **N-3 | Interlinear verses flow instead of breaking at the original's
 three fixed lines** (5H RESULTS 5.6; the shape has flowed since ch1).
 Instances: every Learn Scripture Memory and Review Scripture Memory
diff --git a/buildout/VERIFY-5H-2.md b/buildout/VERIFY-5H-2.md
new file mode 100644
index 0000000..2774d00
--- /dev/null
+++ b/buildout/VERIFY-5H-2.md
@@ -0,0 +1,353 @@
+# VERIFY-5H-2.md — the items only Nathanael can settle
+
+Chapters 3-12 after 5H-SPEC2 (Opus): cohort 5H's closure plus the LOOKBACK
+pass. Authored by the implementer in the same round, per the new standing
+rule 0.2.
+
+Everything mechanical is already pinned and is NOT in this file. This round
+ran 1094 behaviour assertions (up from 1052), 308 disclosure assertions, the
+disclosure3 census at 84/84, the modal census at five device heights over 47
+surfaces, a rail walk of chapters 7, 8, 11 and 12 at two widths, an offline
+walk of chapters 8, 11 and 12, and a page-by-page comparison of every changed
+page against the rail-walk PDFs
+(`5H-VISUAL-CHECKLIST-2`, appended to `5H-VISUAL-CHECKLIST-OPUS.md`). What
+those settled is listed in section 3 so you can see it was considered rather
+than skipped.
+
+**Seven items.** Every item of VERIFY-5H is answered in VERIFY-5H-RESPONSE
+except (k)'s two homeless clips, which is carried here as (k2); the rest are
+new. Each states what the port does NOW, so a verdict has something to land
+against, and each says what changes if you answer against the default.
+
+Letters continue VERIFY-5H's sequence and are never reused, so the order below
+is (k2), (r), (s), (t), (w), (v), (u): **(w) sits next to (t) on purpose**,
+because it may make (t) moot and they are the same screen.
+
+---
+
+## 0. How to answer
+
+| Kind | What it needs |
+| --- | --- |
+| **DOSBox** | The original running under DOSBox. These ask what the ORIGINAL does; the port's behaviour is already stated in the item. |
+| **Listen** | Either the WAV on the ISO (`CHAPT_11/K_VOC5.WAV`) or the app's copy (`/audio/chapt_11/k_voc5.m4a`) — both paths are given per clip. |
+| **Judgement** | No machine or original can settle it. Both branches cost something and the item says what. |
+
+Write in the blank after each arrow and add anything else under Notes. A
+screenshot beats a description.
+
+---
+
+## 1. Items
+
+### (k2) The two homeless chapter-12 clips *(carried from VERIFY-5H (k) — DOSBox + listen)*
+
+- [ ] Your answer to (k) closed every row but this one. `l_a1s` says "just
+  checking it out?" in English and `l_ap9` says something like
+  "de-a-la-giz-an-ta"; neither is referenced by any dispatch table in
+  `12_IMPERF.TBK`, and the port wires neither.
+
+  **Port today:** both ship in the CHAPT_12 pack (they are on the ISO, so the
+  pack mirrors it) and nothing plays them. `l_ap3` is the third plural ἔλυον
+  of the Imperfect Active chart, which you confirmed, so they are not that.
+
+  The question is only whether some screen in the ORIGINAL plays either — a
+  page the rail walk did not stop on, or a control it did not press. If the
+  answer is no, the row closes as "shipped, unwired, by the original's own
+  design" (the D-39 class) and nothing changes. If yes, name the screen and
+  the pipeline wires it.
+
+  `CHAPT_12/L_A1S.WAV`, `L_AP9.WAV` (`/audio/chapt_12/l_a1s.m4a`, `l_ap9.m4a`).
+
+  → **Nothing plays them / `l_a1s` plays on: ______________ / `l_ap9` plays on: ______________**
+
+  Notes:
+
+---
+
+### (r) Does K_VOC5 recite ὅς, ἥ, ὅ, or only ὅς? *(listen)*
+
+- [ ] Your RESPONSE 7 asked whether there is audio for all three forms of the
+  relative pronoun. There is, but not in one clip that anyone has confirmed.
+
+  **Port today:** the Learn Vocabulary flashcard and the Review Vocabulary
+  Chart print the lexical form **ὅς, ἥ, ὅ** and play the lemma clip
+  **`k_voc5`**. The lexicon now also carries a `parts` list wiring the three
+  forms to their own paradigm-cell clips (`k_osmns`, `k_osfns`, `k_osnns`);
+  nothing renders `parts` yet, and that is deliberate — which surface gets
+  them depends on your answer.
+
+  This is the same question RESPONSE 6 settled for οὗτος, where `k_voc7`
+  turned out to recite all three and is now what both surfaces play (section
+  2.7 of the spec, shipped this round).
+
+  Listen to `CHAPT_11/K_VOC5.WAV` (`/audio/chapt_11/k_voc5.m4a`).
+
+  - **If it recites all three**, the row closes exactly as οὗτος did: nothing
+    changes, and the `parts` list stays unrendered provenance.
+  - **If it says only ὅς**, the card is reading one word under a heading of
+    three, and the fix is to render `parts` as three taps on those two
+    surfaces — a renderer change of about ten lines plus its assertions, and
+    the first surface in the app where one card carries three separate tap
+    targets. Say so and it lands in the next round.
+
+  → **Recites ὅς, ἥ, ὅ / says only ὅς:** ______________
+
+  Notes:
+
+---
+
+### (s) Chapter 8's two Hints in the ORIGINAL — one page per item, or a stack? *(DOSBox)*
+
+- [ ] **This is the item most likely to change what shipped**, so it is worth
+  the two minutes. The rail walk gives evidence BOTH ways and only DOSBox can
+  separate them.
+
+  **What the spec said and what shipped:** the pipeline read a WordCounter
+  dispatch at `8_PRONS.TBK 0x7bf39` (20 entries over 21 items) that routes
+  each Aὐτός Translation Drill item to ONE of two payloads — the Third Person
+  Paradigm, or the Learn topic "Three Uses". 5H-SPEC2 3.1 concluded the port
+  was wrong to stack both as a two-page More/Back popup and had the key
+  removed, so per-item routing governs. That is what shipped: items 1-3, 6, 8,
+  10-14, 17 and 20-21 open the paradigm; items 4, 5, 7, 9, 15, 16, 18 and 19
+  open Three Uses. Each opens with **Close** and nothing else.
+
+  **What the rail walk shows, which does not obviously agree.** On
+  **ch8railwalk p7 bottom-left** the drill is on item 1
+  (κατὰ τὸ αὐτὸ πνεῦμα, 1 Cor 12:8) — a PARADIGM item. **p7 bottom-right** is
+  the Hint it opened: the Third Person Paradigm, and its buttons read
+  **More | Cancel**. **p8 top-left** is the Three Uses page with all three
+  numbered points and buttons reading **Back | Cancel**. Read together that is
+  a two-page stack reached from a single item, which is precisely what the
+  port used to have and what this round removed.
+
+  Both readings survive the evidence, because every hint screen in that walk
+  was opened from a paradigm item:
+
+  - **A.** The Hint is always a two-page stack, paradigm first. The dispatch
+    table decides something else (which paradigm, or nothing at run time).
+  - **B.** The dispatch chooses the FIRST page and More/Back reaches the
+    other. Item 1 is a paradigm item, so it opened at the paradigm with More
+    available — exactly the capture — and item 4 would open at Three Uses with
+    Back available.
+
+  Under either reading the port is missing the More/Back pair. Under A it is
+  also opening the wrong page for eight items.
+
+  In DOSBox, in the **Aὐτός Translation Drill**:
+  1. Step to **item 4** ("λέγει ἡ μήτηρ τοῦ", Jn 2:3) and click **Hint**.
+     Which page opens first, and what buttons does it carry?
+  2. From whichever page opens, press **More** or **Back** and say whether the
+     other page is reachable.
+
+  And while you are in the chapter, the **Personal Pronoun Case Drill** is the
+  same class and its dispatch (`0x10d820`) says each person's form opens its
+  own paradigm. **ch8railwalk p8 bottom-left** shows the third-person route
+  (the αὐτή item) with **Cancel only** — no navigation — which the port
+  matches. Step to a **ἡμεῖς** item and a **σοι** item and click Hint on each.
+
+  → **Item 4's Hint opens: ______________ with buttons: ______________**
+
+  → **The other page is / is not reachable from it:** ______________
+
+  → **Case Drill: three different charts / always the same one (which):** ______________
+
+  Notes:
+
+---
+
+### (t) Chapter 12's εἰμί / ἔχω toggle labels *(judgement)*
+
+- [ ] NIT-LOG N-2. You asked, in RESPONSE 3, where the "no Greek-only
+  More/Back labels" rule was settled and for a matrix of every place it could
+  bite. The rule is DISCLOSURE-RULES §4.1; the activity it was settled on is
+  **ch4 Learn Nouns > Masculine Declension** (λόγος / ἄνθρωπος), followed by
+  ch5's ὥρα / δόξα — both of which went to More/Back. The matrix is spec
+  section 3.3 and NIT-LOG N-2; it has six rows and exactly ONE of them is
+  labelled with Greek.
+
+  **Port today:** the default was applied, because no ruling came at kickoff.
+  `paradigmToggleLabels` falls back to More/Back whenever the one differing
+  word of the two chart titles is GREEK, so the **Imperfect Indicative Parsing
+  Drill's** hint for εἰμί and ἔχω forms now reads **More / Back** instead of
+  **εἰμί / ἔχω**. It is stated as §4.1's own rule rather than as a chapter-12
+  exception, so it is one rule in one place.
+
+  The other five rows of the matrix are asserted UNCHANGED in the same
+  harness pass: Present/Future (ch10 εἰμί), Active vs Middle/Passive (ch12
+  λύω), Singular/Plural (ch11's four hints and three Learn toggles), and ch4's
+  and ch5's existing More/Back pairs.
+
+  What you lose by keeping it: on that one hint the button no longer names the
+  verb it goes to, so a learner on an ἔχω item presses "More" without being
+  told what is behind it. What you lose by reversing it: §4.1 has an exception
+  in it, and the next Greek-labelled pair is a fresh argument. Reversing is a
+  one-line revert plus four assertions.
+
+  **Read (w) before answering this one** — it may make the question moot.
+
+  → **Keep More/Back / go back to εἰμί / ἔχω:** ______________
+
+  Notes:
+
+---
+
+### (w) Should that hint have TWO screens at all? *(judgement — implementer-raised)*
+
+- [ ] **[implementer-raised, per the standing rule that a departure you never
+  see is a silent divergence.]** While cropping the rail walk for (t) I
+  compared the port's εἰμί hint against the original's, and they are not the
+  same shape.
+
+  **ch12railwalk p8 top-right** (and p8 bottom-left, the same panel with the
+  cursor moved) shows the Imperfect Indicative Parsing Drill's Hint on an εἰμί
+  form: **"Imperfect of εἰμί" and "Imperfect of ἔχω" are BOTH on one screen**,
+  stacked, εἰμί above ἔχω, with a single **Cancel**. There is no More, no
+  Back, and no toggle.
+
+  **Port today:** one chart at a time behind a two-state toggle — which is
+  what makes (t) a question at all. That split came in with 5H-SPEC1 and the
+  5H visual checklist passed it (row 12.14) against this same panel; reading
+  it again, I think the panel shows a stack and the row read it as a toggle.
+  Spec 5H-SPEC2 section 3.3 describes the pair as "consecutive screens", which
+  is the same reading.
+
+  This is a DISCLOSURE-RULES departure of the kind you vetoed row by row in
+  VERIFY-5H (l), and it was not on that list, which is why it is here.
+
+  Both charts are narrow — three numbered rows, a Singular and a Plural
+  column, short English glosses — so stacking them is very likely to fit at
+  320 px, the way the Quick Review pages stack under §4.6. I did NOT change
+  it: this spec asked only about the LABEL on the toggle, and changing the
+  disclosure shape is your call, not a renderer detail I should decide inside
+  a labelling item.
+
+  - **STACK** (both charts on one scrolling hint, one Close) matches the
+    original panel, and (t) disappears — there is no toggle left to label.
+    Cost: one taller modal, and a `hintCharts` composite that renders stacked
+    instead of disclosed, which is a renderer branch plus its assertions.
+  - **KEEP THE TOGGLE** and answer (t) on its own terms. Cost: a divergence
+    entry for a departure that has been shipping unlogged since 5H-SPEC1.
+
+  → **STACK / keep the toggle:** ______________
+
+  Notes:
+
+---
+
+### (v) Do H_VOC3 and H_VOC9 recite BOTH forms? *(listen)*
+
+- [ ] **[implementer-raised, per the standing rule that a departure you never
+  see is a silent divergence.]** RESPONSE 6's ruling — a card that prints
+  three forms plays the clip that says all three — is a renderer rule, not a
+  chapter-11 fact, and chapter 8 has two cards of the same shape: **ἐγώ /
+  ἡμεῖς** and **σύ / ὑμεῖς**. Applying the rule reached them.
+
+  **What was wrong, and it was worth finding:** chapter 8's two vocabulary
+  surfaces DISAGREED with each other. Its Review Vocabulary Chart draws from
+  the `lemmas` pool and has always played `h_voc3` on that row; its Learn
+  Vocabulary flashcard draws from `senses` and played `h_voc3a`, one of the
+  two words printed on the card. The fix aligns the flashcard with the Review
+  chart's shipped, device-verified behaviour rather than inventing a third.
+  Same for σύ / ὑμεῖς and `h_voc9` / `h_voc9a`.
+
+  **Port today:** both surfaces play `h_voc3` and `h_voc9`.
+
+  All this needs is an ear. Listen to `CHAPT_8/H_VOC3.WAV` and `H_VOC9.WAV`
+  (`/audio/chapt_8/h_voc3.m4a`, `h_voc9.m4a`).
+
+  - **If each recites both forms**, the row closes and chapter 8's two
+    surfaces now agree.
+  - **If either says only the first word**, then the Review chart has been
+    speaking one word under a two-word heading since chapter 8 shipped, and
+    the answer is the same `parts` renderer item (r) may ask for.
+
+  → **`h_voc3` says: ______________ `h_voc9` says: ______________**
+
+  Notes:
+
+---
+
+### (u) Anything the visual pass got wrong *(judgement)*
+
+- [ ] Every page whose data or renderer changed this round was compared
+  against its rail-walk panel at 320 px and 768 px and every row is PASS
+  (`5H-VISUAL-CHECKLIST-2`). Three of them are worth your eye anyway, because
+  they are the ones where "matches the original" and "reads well on a phone"
+  could disagree:
+
+  1. **ch8 Three Uses as a Hint.** It is the first hint in the app whose body
+     is a whole teaching page: prose, a three-point numbered list with hanging
+     indents, and three "Examples" accordions. It fits at every device height
+     in the modal census, but it is a tall modal on a phone.
+  2. **ch12 Augment Drill Hint.** The four compound forms in points 3 and 4
+     are now blue taps (RESPONSE 5). The contraction table in point 2 and the
+     augment vowel in point 1 stay ink — that is the map doing its job, not an
+     omission, but it does mean two kinds of Greek on one screen.
+  3. **ch11 Review paradigm pages.** Twelve Say Paradigm buttons became six,
+     one after each Plural half (your (p) ruling). The original prints one
+     button per paradigm on a single screen (ch11railwalk p20-p22), which is
+     what six matches; what is new is that the button sits mid-page rather
+     than at the foot.
+
+  → ______________________________________________
+
+---
+
+## 2. Airplane-mode pass (directive 4, device half)
+
+The preview half is scripted (`npm run ui:offline -- --chapters=chapt_8,chapt_11,chapt_12`:
+every rail stop of all three chapters, refresh on an activity route, no console
+errors). This is the part only a real iPhone can answer. Chapter 8 joins the
+list because its data changed this round.
+
+- [ ] **Chapter 8, offline, both changed Hints.** With the CHAPT_8 pack
+  downloaded and airplane mode on, open the **Aὐτός Translation Drill** and
+  press Hint on several items — you should see the paradigm on most and the
+  Three Uses page on the rest — then the **Personal Pronoun Case Drill** and
+  press Hint on a first-, second- and third-person form.
+
+  → **PASS / FAIL at: ______________**
+
+- [ ] **Chapter 11 objectives and vocabulary, offline.** Tap ἐκεῖνος and
+  οὗτος on the Chapter Objectives page (they are taps for the first time), and
+  the οὗτος, αὕτη, τοῦτο row on both the Learn Vocabulary card and the Review
+  Vocabulary Chart (both now say all three).
+
+  → **All four speak / silent at: ______________**
+
+- [ ] **Chapter 7 objectives.** Objective 5 names εἰμί and it now taps.
+
+  → **PASS / FAIL: ______________**
+
+- [ ] **The four gated Pronounce buttons.** On the ch3 Greek Verb Drill, the
+  ch4 Greek Noun Drill and the ch5 First Declension Noun Drill, Pronounce is
+  now greyed until the item is answered — the ch12 Augment Drill rule applied
+  backward, per your (d) ruling. These three have ENGLISH prompts, so nothing
+  else about them changes. Confirm it does not read as a broken button.
+
+  → **Reads as deliberate / reads as broken:** ______________
+
+- [ ] **Anything that looks wrong.** Free text; a screenshot beats a
+  description.
+
+  → ______________________________________________
+
+---
+
+## 3. Appendix — settled this round, not asked
+
+| Item | How it was settled |
+| --- | --- |
+| Every item of VERIFY-5H (a), (d)-(q) | Answered in VERIFY-5H-RESPONSE and applied this round; D-51 (amend) and D-52..D-56 in DIVERGENCE-LOG record each one. Only (k)'s two homeless clips are carried, as (k2) |
+| Chapter 11 and chapter 7 objectives now tap | `ui-behavior.mjs` 5H-SPEC2 2.5: three taps evicted from the audio store and re-fetched by id, plus a twelve-chapter census that every other objective renders and none of them gained a tap |
+| The Augment hint's four Greek taps, and what stays ink | `ui-behavior.mjs` 5H-SPEC2 2.6: four evicted-and-refetched taps, plus the negative on both rule items |
+| Which activities the generalised audio gate fires on | `ui-behavior.mjs` 5H-SPEC2 4.2: the 4.1 triple is computed over every select activity in twelve chapters and yields exactly four (ch3, ch4, ch5, ch12); all four gate on screen and the autoBoth exclusion keeps a live Pronounce |
+| One say-all per recording on ch11's three Review pages | `ui-behavior.mjs` 5H-SPEC2 2.9: twelve buttons to six, none of them on a Singular half; the Learn-toggle rule is asserted separately and unchanged, so the two halves of your (p) ruling cannot drift into each other |
+| The other five rows of the toggle-label matrix are untouched | `ui-behavior.mjs` 5H-SPEC2 3.3, all four surfaces read in one pass |
+| Chapter 8's per-item hint routing works in the PORT | `ui-behavior.mjs` 5H-SPEC2 3.1: three different charts off the Case Drill, and a chart vs the Three Uses page off the translation drill. Whether the ORIGINAL routes this way is item (s) |
+| A dangling hintRef can no longer ship | `check-content-shapes.mjs`: the check used to accept any ref that matched an id ANYWHERE, which is how `threeUses` passed while resolving to nothing. It now models both renderer paths (a chart, or a topic with content) and was negative-tested against a ref that only the old check accepted |
+| The retired `hintPages` route left two stale assertions behind | `ui-behavior.mjs` W1 walked More to find the Three Uses topic and now stands on an item that routes there; P3.2's "modal pager" was silently measuring the paradigm's own three-chart pager and is renamed and pinned to a named item so it cannot pass on a lucky draw |
+| Modal sizing for both new ch8 hint routes | `ui-modals.mjs`, five surfaces added (three Case Drill persons, both translation routes), 47 surfaces at five device heights |
+| No page whose data changed overflows at 320 px | `ui-walk.mjs` over chapters 7, 8, 11 and 12 |
+| Offline behaviour did not regress | `ui-offline.mjs` over chapters 8, 11 and 12 |
diff --git a/scripts/check-content-shapes.mjs b/scripts/check-content-shapes.mjs
index 30eadda..416888a 100644
--- a/scripts/check-content-shapes.mjs
+++ b/scripts/check-content-shapes.mjs
@@ -620,6 +620,43 @@ for (const file of files) {
   };
   for (const key of SECTION_KEYS) collect(data[key]);
 
+  // ---- AND RESOLVES TO SOMETHING THE HINT CAN DRAW (5H-SPEC2 3.1) ----
+  // `chartRefs` above answers "does this name exist", which is weaker than the
+  // renderer's question, "does it resolve". Chapter 8's per-item
+  // `hintRef: "threeUses"` names a real topic id and passed this file cleanly
+  // while resolveHintRef returned null for it — a Hint button that silently
+  // does not render, the exact failure the block above was written to catch,
+  // one level down. So the two resolution paths the app actually has are
+  // modelled here: a CHART (a paradigm block anywhere under the named node, a
+  // bare `paradigm` object on a Review page, a chart title slug, or a
+  // `hintCharts` composite) or a PAGE (a topic id with its own non-empty
+  // `content`). A ref that is neither is a dangling reference no matter how
+  // many nodes happen to carry that string as an id.
+  const resolvableRefs = new Set(Object.keys(data.hintCharts || {}));
+  const holdsChart = node => {
+    if (Array.isArray(node)) return node.some(holdsChart);
+    if (!node || typeof node !== 'object') return false;
+    if (node.type === 'paradigm' || node.type === 'pronounParadigm') return true;
+    return Object.values(node).some(holdsChart);
+  };
+  const collectResolvable = node => {
+    if (Array.isArray(node)) { node.forEach(collectResolvable); return; }
+    if (!node || typeof node !== 'object') return;
+    if (node.type === 'paradigm' || node.type === 'pronounParadigm') {
+      chartRefs.add(node.type);
+      resolvableRefs.add(node.type);
+      if (typeof node.title === 'string') resolvableRefs.add(slugOf(node.title));
+    }
+    if (typeof node.chartTitle === 'string') resolvableRefs.add(slugOf(node.chartTitle));
+    if (typeof node.id === 'string') {
+      const chart = holdsChart(node) || (node.paradigm && typeof node.paradigm === 'object');
+      const page = Array.isArray(node.content) && node.content.length > 0;
+      if (chart || page) resolvableRefs.add(node.id);
+    }
+    for (const value of Object.values(node)) collectResolvable(value);
+  };
+  for (const key of SECTION_KEYS) collectResolvable(data[key]);
+
   for (const [name, composite] of Object.entries(data.hintCharts || {})) {
     const refs = composite && composite.paradigmRefs;
     const charts = composite && composite.charts;
@@ -652,8 +689,8 @@ for (const file of files) {
     // Walking every object reaches ui, item and hint-page records alike, so
     // one own-property check covers both drill defaults and item overrides.
     const ref = node.hintRef;
-    if (typeof ref === 'string' && !chartRefs.has(ref)) {
-      problems.push(`${path}.hintRef: "${ref}" resolves to nothing — the Hint control would silently not render.`);
+    if (typeof ref === 'string' && !resolvableRefs.has(ref)) {
+      problems.push(`${path}.hintRef: "${ref}" resolves to no chart and no content page — the Hint control would silently not render.`);
     }
   });
 
diff --git a/scripts/ui-behavior.mjs b/scripts/ui-behavior.mjs
index 88a183c..f832b11 100644
--- a/scripts/ui-behavior.mjs
+++ b/scripts/ui-behavior.mjs
@@ -3204,11 +3204,43 @@ for (const [chapterId, activityId, expected] of [
     // there is no .pg-nav on that page to measure. The ContentAudio copy of
     // this layout went with it — Paradigm.svelte is the only renderer of the
     // pair now, which is one fewer place for the markup to drift.
-    ['ch8 Aὐτός Translation Drill Hint (modal pager)', '#/activity/chapt_8/c8_drill_translation_autos', { hint: true }]
+    // 5H-SPEC2 3.1 RENAMED, because the label had stopped describing what the
+    // loop measures. It said "modal pager" and meant the hint's own
+    // `ui.hintPages` More/Back. That key is gone: the original dispatches one
+    // page per item. The `.pg-nav` this still finds inside the modal is the
+    // PARADIGM's own three-chart pager (Masculine / Feminine / Neuter), which
+    // is a real surface worth measuring and is what the numbers below have
+    // actually described since the data changed -- but a check whose name
+    // outlives its subject is how a green harness proves nothing (ONBOARD §7).
+    // 5H-SPEC2 3.1 RENAMED AND PINNED TO AN ITEM. The label said "modal pager"
+    // and meant the hint's own `ui.hintPages` More/Back; that key is gone,
+    // because the original dispatches one page per item. The `.pg-nav` this
+    // still finds inside the modal is the PARADIGM's own three-chart pager
+    // (Masculine / Feminine / Neuter) -- a real surface worth measuring, and
+    // what these numbers have described since the data changed. A check whose
+    // name outlives its subject is how a green harness proves nothing
+    // (ONBOARD §7). `seek` is the other half: the drill's items are shuffled
+    // and only SOME of them route to the paradigm now, so without it this
+    // passes or fails on the draw.
+    ['ch8 Aὐτός Translation Drill Hint (the paradigm chart pager inside the modal)',
+      '#/activity/chapt_8/c8_drill_translation_autos',
+      { hint: true, seek: 'κατὰ τὸ αὐτὸ πνεῦμα', seekLimit: 21 }]
   ];
   for (const [label, hash, opts] of navSurfaces) {
     await go(hash);
     if (opts.topic) await gotoTopic(opts.topic);
+    if (opts.seek) {
+      let onItem = false;
+      for (let step = 0; step < opts.seekLimit; step += 1) {
+        const shown = normalizeText(await page.locator('.card .prompt').first().innerText());
+        if (shown === normalizeText(opts.seek)) { onItem = true; break; }
+        const next = page.locator('.card').getByRole('button', { name: 'Next', exact: true });
+        if (!await next.count() || await next.isDisabled()) break;
+        await next.click();
+        await page.waitForTimeout(40);
+      }
+      check(`P3.2 ${label}: reached the item its Hint is measured on`, onItem, opts.seek);
+    }
     if (opts.hint) {
       await page.getByRole('button', { name: 'Hint', exact: true }).click();
       await page.waitForTimeout(200);
@@ -4608,22 +4640,38 @@ for (const [itemIndex, greek, personNumber] of [
       result.clipCount === 1 && result.fetched.some(url => url.endsWith(result.path)),
       `fetched ${JSON.stringify(result.fetched.map(u => u.split('/audio/')[1]))}`);
   }
-  // Surface 2: the same topic, reached through the drill hint's contentRef.
-  await go('#/activity/chapt_8/c8_drill_translation_autos');
-  await page.getByRole('button', { name: 'Hint', exact: true }).click();
-  await page.waitForSelector('.modal', { timeout: 8000 });
-  let reached = false;
-  for (let page4 = 0; page4 < 5 && !reached; page4++) {
-    if (await page.locator('.modal details.rc-expander summary', { hasText: 'Reflexive Intensifier' }).count()) {
-      reached = true;
-      break;
+  // Surface 2: the same topic, reached through the drill hint.
+  //
+  // 5H-SPEC2 3.1 UPDATES THE ROUTE THIS CHECK WALKS, not what it asserts. The
+  // hint used to be a two-page stack (`ui.hintPages`: the Third Person
+  // Paradigm, then Three Uses reached with More), so this loop pressed More
+  // until the topic appeared. The original dispatches ONE page per item
+  // instead, so the topic is now reached by standing on an item that routes to
+  // it -- per-item `hintRef: "threeUses"` -- and there is no More to press.
+  // What is under test is unchanged and is the reason the check exists: the
+  // two crossed clips must be right on BOTH surfaces that render this topic.
+  {
+    const threeUsesItem = ch8.drill.find(a => a.id === 'c8_drill_translation_autos')
+      .items.find(item => item.hintRef === 'threeUses' && !item.greek2);
+    await go('#/activity/chapt_8/c8_drill_translation_autos');
+    let onItem = false;
+    for (let step = 0; step < 21; step += 1) {
+      const shown = normalizeText(await page.locator('.card .prompt').first().innerText());
+      if (shown === normalizeText(threeUsesItem.greek)) { onItem = true; break; }
+      const next = page.locator('.card').getByRole('button', { name: 'Next', exact: true });
+      if (!await next.count() || await next.isDisabled()) break;
+      await next.click();
+      await page.waitForTimeout(40);
+    }
+    check(`W1 reached a Three Uses item ("${threeUsesItem.greek}") in the ch8 Aὐτός Translation Drill`, onItem);
+    if (onItem) {
+      await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
+      await page.waitForSelector('.modal', { timeout: 8000 });
+      await page.waitForTimeout(200);
     }
-    const more = page.locator('.modal [data-hint-page-nav="more"]');
-    if (!await more.count() || await more.isDisabled()) break;
-    await more.click();
-    await page.waitForTimeout(180);
   }
-  check('W1 the ch8 Aὐτός Translation hint reaches the Three Uses topic through its contentRef', reached);
+  const reached = await page.locator('.modal details.rc-expander summary', { hasText: 'Reflexive Intensifier' }).count() > 0;
+  check('W1 the ch8 Aὐτός Translation hint reaches the Three Uses topic through its per-item hintRef', reached);
   if (reached) {
     await page.locator('.modal details.rc-expander summary', { hasText: 'Reflexive Intensifier' }).first().click();
     await page.waitForTimeout(150);
@@ -4806,6 +4854,368 @@ for (const [itemIndex, greek, personNumber] of [
     `${smOptions.length} options / ${smItems.length} items`);
 }
 
+// ===================================================================
+// 5H-SPEC2: cohort 5H closure and the LOOKBACK pass (chapters 3-12)
+// ===================================================================
+// Everything here is a rule that now spans MORE than the chapter that
+// produced it, so every assertion states the rule and then names the whole
+// set it applies to -- a census, not a sample. Most of them are answers
+// Nathanael gave in VERIFY-5H-RESPONSE.
+{
+  const cardButton = name => page.locator('.card').getByRole('button', { name, exact: true });
+  const seekPrompt = async (chapterId, activityId, prompt, limit) => {
+    await go(`#/activity/${chapterId}/${activityId}`);
+    for (let step = 0; step < limit; step += 1) {
+      const shown = normalizeText(await page.locator('.card .prompt').first().innerText());
+      if (shown === normalizeText(prompt)) return true;
+      const next = cardButton('Next');
+      if (!await next.count() || await next.isDisabled()) return false;
+      await next.click();
+      await page.waitForTimeout(40);
+    }
+    return false;
+  };
+  const closeModal = async () => {
+    await page.locator('.modal').getByRole('button', { name: 'Close', exact: true }).click();
+    await page.waitForTimeout(140);
+  };
+  const pronounceState = () => page.evaluate(() => {
+    const pron = [...document.querySelectorAll('.card .btn')].find(b => b.innerText.trim() === 'Pronounce');
+    return { present: !!pron, disabled: pron ? pron.disabled : null };
+  });
+
+  // ---- 2.5 AN OBJECTIVE MAY SPEAK ---------------------------------------
+  // VERIFY-5H (o): both words on chapter 11's first objective speak in the
+  // original and neither spoke in the port, because the objectives shipped as
+  // plain strings with nowhere to hang a clip. The contract is now string OR
+  // { text, audioMap }; these two chapters hold the only objectives in twelve
+  // with Greek in them, which the census below states rather than leaves to
+  // the reader.
+  const OBJECTIVE_TAPS = {
+    chapt_11: { activity: 'c11_learn_objectives',
+      words: [['ἐκεῖνος', 'chapt_11_k_ekemns'], ['οὗτος', 'chapt_11_k_outmns']] },
+    chapt_7: { activity: 'c7_learn_objectives',
+      words: [['εἰμί', 'chapt_7_g_eimi1s']] }
+  };
+  for (const [chapterId, spec] of Object.entries(OBJECTIVE_TAPS)) {
+    await go(`#/activity/${chapterId}/${spec.activity}`);
+    const rendered = await page.evaluate(() =>
+      [...document.querySelectorAll('.objectives-list .greek-tap')].map(b => b.innerText.trim()));
+    check(`5H-SPEC2 2.5 ${chapterId} objectives: exactly the mapped Greek words are taps`,
+      rendered.length === spec.words.length
+        && spec.words.every(([word]) => rendered.includes(word)),
+      `rendered ${JSON.stringify(rendered)}`);
+    for (const [word, id] of spec.words) {
+      const tap = page.locator('.objectives-list').getByRole('button', { name: word, exact: true });
+      const played = await exactAudioTap(tap, id);
+      check(`5H-SPEC2 2.5 ${chapterId} objective tap "${word}" plays ${id}`,
+        played.clipCount === 1 && played.fetched.join(' ').includes(played.path),
+        `${played.clipCount} clip(s), fetched ${JSON.stringify(played.fetched)}`);
+    }
+  }
+  // ...and NO other objective anywhere in twelve chapters gained a tap or
+  // lost a line. The counts come from each chapter's own data, so a future
+  // objective that declares an audioMap is covered without editing this file.
+  {
+    const drift = [];
+    for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
+      const objectivesPage = activitiesOf(chapter)
+        .find(activity => activity && activity.mode === 'objectivesPage');
+      if (!objectivesPage) continue;
+      const objectives = chapter.objectives || [];
+      const expected = objectives.reduce((n, objective) =>
+        n + (typeof objective === 'string' ? 0 : Object.keys(objective.audioMap || {}).length), 0);
+      await go(`#/activity/${chapterId}/${objectivesPage.id}`);
+      const shown = await page.evaluate(() => ({
+        taps: document.querySelectorAll('.objectives-list .greek-tap').length,
+        items: document.querySelectorAll('.objectives-list li').length,
+        empty: [...document.querySelectorAll('.objectives-list li')].filter(li => !li.innerText.trim()).length
+      }));
+      if (shown.taps !== expected || shown.items !== objectives.length || shown.empty !== 0) {
+        drift.push(`${chapterId}: ${shown.items} items / ${shown.taps} taps / ${shown.empty} blank, want ${objectives.length} / ${expected} / 0`);
+      }
+    }
+    check('5H-SPEC2 2.5 census: every objective in twelve chapters renders, and only the mapped words tap',
+      drift.length === 0, drift.join('; '));
+  }
+
+  // ---- 2.6 THE AUGMENT HINT'S OWN GREEK TAPS ----------------------------
+  // VERIFY-5H-RESPONSE 5. An inline hint carries an audioMap exactly as a
+  // teaching topic does. Four positives and one negative: the map lists what
+  // speaks, so the bare augment vowel in the rule lines -- Greek, printed,
+  // and not in the map -- stays ink.
+  {
+    await go('#/activity/chapt_12/c12_drill_augment');
+    await cardButton('Hint').click();
+    await page.waitForSelector('.modal', { timeout: 8000 });
+    await page.waitForTimeout(200);
+    const AUGMENT_TAPS = [['ἐκβάλλω', 'chapt_12_l_ex11'], ['ἐξεβάλλον', 'chapt_12_l_ex12'],
+      ['ἀποκτείνω', 'chapt_12_l_ex13'], ['ἀπέκτεινον', 'chapt_12_l_ex14']];
+    const inHint = await page.evaluate(() =>
+      [...document.querySelectorAll('.modal .greek-tap')].map(b => b.innerText.trim()));
+    check('5H-SPEC2 2.6 Augment hint: the four compound forms are the ONLY taps in the hint',
+      inHint.length === AUGMENT_TAPS.length && AUGMENT_TAPS.every(([word]) => inHint.includes(word)),
+      JSON.stringify(inHint));
+    for (const [word, id] of AUGMENT_TAPS) {
+      const tap = page.locator('.modal').getByRole('button', { name: word, exact: true });
+      const played = await exactAudioTap(tap, id);
+      check(`5H-SPEC2 2.6 Augment hint tap "${word}" plays ${id}`,
+        played.clipCount === 1 && played.fetched.join(' ').includes(played.path),
+        `${played.clipCount} clip(s), fetched ${JSON.stringify(played.fetched)}`);
+    }
+    // The negative, stated on the line it is about as well as by the count
+    // above. Rule 1 prints the augment vowel itself and rule 2 a whole table
+    // of contractions; none of that Greek is in the map, so none of it is a
+    // button. An audioMap is a list of what speaks, not a switch that turns
+    // the page's Greek on.
+    const ruleLines = await page.evaluate(() => [...document.querySelectorAll('.modal .rc-list li')]
+      .slice(0, 2)
+      .map(li => ({ text: li.innerText.trim().slice(0, 40), taps: li.querySelectorAll('.greek-tap').length })));
+    check('5H-SPEC2 2.6 Augment hint: the two RULE items carry no tap of their own',
+      ruleLines.length === 2 && ruleLines.every(line => line.taps === 0),
+      JSON.stringify(ruleLines));
+    await closeModal();
+  }
+
+  // ---- 3.1 CHAPTER 8's TWO FORM-DEPENDENT HINTS (LOOKBACK) --------------
+  // The D-46 mechanism, applied to two drills the port shipped with a single
+  // hint (the Case Drill) and with a two-page stack that showed every item
+  // both answers (the Autos Translation Drill). The original dispatches ONE
+  // page per form: the Case Drill's three routes are three different persons,
+  // and the translation drill's two are a chart and a teaching PAGE.
+  {
+    const hintHeading = () => page.evaluate(() => {
+      const modal = document.querySelector('.modal');
+      if (!modal) return null;
+      const heading = modal.querySelector('.pg-title, .rc-heading, .modal-title');
+      return { heading: heading ? heading.innerText.trim() : null,
+        pageRef: modal.getAttribute('data-hint-page-ref'),
+        chart: !!modal.querySelector('.pg-row, .pg-cell, .paradigm-grid') };
+    });
+    const openHint = async (chapterId, activityId, prompt, limit) => {
+      const found = await seekPrompt(chapterId, activityId, prompt, limit);
+      if (!found) return null;
+      await cardButton('Hint').click();
+      await page.waitForSelector('.modal', { timeout: 8000 });
+      await page.waitForTimeout(200);
+      const state = await hintHeading();
+      await closeModal();
+      return state;
+    };
+    const caseRoutes = [];
+    for (const form of ['ἡμεῖς', 'σοι', 'αὐτή']) {
+      caseRoutes.push([form, await openHint('chapt_8', 'c8_drill_case', form, 31)]);
+    }
+    const caseHeadings = caseRoutes.map(([, state]) => state && state.heading);
+    check('5H-SPEC2 3.1 ch8 Case Drill: first, second and third person open THREE different charts',
+      caseHeadings.every(Boolean) && new Set(caseHeadings).size === 3,
+      JSON.stringify(caseRoutes));
+
+    const autosParadigm = await openHint('chapt_8', 'c8_drill_translation_autos', 'κατὰ τὸ αὐτὸ πνεῦμα', 21);
+    const autosPage = await openHint('chapt_8', 'c8_drill_translation_autos', 'ἡ ὥρα αὐτοῦ', 21);
+    check('5H-SPEC2 3.1 ch8 Autos Translation Drill: a paradigm item opens the CHART',
+      !!autosParadigm && autosParadigm.chart && !autosParadigm.pageRef,
+      JSON.stringify(autosParadigm));
+    check('5H-SPEC2 3.1 ch8 Autos Translation Drill: a Three Uses item opens the TEACHING PAGE',
+      !!autosPage && autosPage.pageRef === 'threeUses' && autosPage.heading === 'Three Uses',
+      JSON.stringify(autosPage));
+    check('5H-SPEC2 3.1 ch8 Autos Translation Drill: the two routes are different surfaces',
+      !!autosParadigm && !!autosPage && autosParadigm.heading !== autosPage.heading,
+      `${JSON.stringify(autosParadigm)} vs ${JSON.stringify(autosPage)}`);
+  }
+
+  // ---- 4.2 THE AUDIO-LEAK GATE, AS A CENSUS -----------------------------
+  // VERIFY-5H (d): the original leaks -- its Pronounce speaks the augmented
+  // answer before the guess -- and the gate is adopted anyway, forward and
+  // backward. The rule is afterGuess + Greek options + NOT autoBoth, and the
+  // point of a census is that the FOUR is derived from the data here rather
+  // than typed here: if a thirteenth chapter ships a fifth, this check grows
+  // with it, and if the renderer's condition drifts from 4.1 the two part.
+  {
+    const greekOptions = activity => activity.optionsAreGreek === true
+      || activity.options === 'greek'
+      || (activity.generator && activity.generator.options === 'lower');
+    const gated = [];
+    const ungated = [];
+    for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
+      for (const activity of activitiesOf(chapter)) {
+        if (!activity || activity.type !== 'select') continue;
+        const advanceClass = (activity.answerPolicy || {}).advanceClass;
+        const triple = activity.audioTiming === 'afterGuess' && greekOptions(activity)
+          && advanceClass !== 'autoBoth';
+        (triple ? gated : ungated).push([chapterId, activity.id, advanceClass]);
+      }
+    }
+    const GATED_IDS = ['c12_drill_augment', 'c3_drill_greek_verb',
+      'c4_drill_greek_noun', 'c5_drill_first_decl_noun'].sort();
+    check('5H-SPEC2 4.2 census: the 4.1 triple selects exactly FOUR activities in twelve chapters',
+      gated.length === GATED_IDS.length
+        && gated.map(row => row[1]).sort().join(' ') === GATED_IDS.join(' '),
+      JSON.stringify(gated));
+    // Every one of them actually gates on screen: Pronounce dead at mount,
+    // live once the item is answered.
+    for (const [chapterId, activityId] of gated) {
+      await go(`#/activity/${chapterId}/${activityId}`);
+      await page.waitForTimeout(400);
+      const before = await pronounceState();
+      await page.locator('.card .options .tile').first().click();
+      await page.waitForTimeout(800);
+      const after = await pronounceState();
+      check(`5H-SPEC2 4.2 gate fires on ${activityId}: Pronounce dead before the guess, live after`,
+        before.present && before.disabled === true && after.present && after.disabled === false,
+        `${JSON.stringify(before)} -> ${JSON.stringify(after)}`);
+    }
+    // And the exclusion is real rather than incidental: an English-to-Greek
+    // vocabulary drill is afterGuess with Greek options too, and its
+    // Pronounce is alive from mount because autoBoth would never give a
+    // disabled one a moment to come back.
+    const excluded = ungated.find(row => row[1] === 'c11_drill_vocab_en_gk');
+    await go('#/activity/chapt_11/c11_drill_vocab_en_gk');
+    await page.waitForTimeout(400);
+    const openPronounce = await pronounceState();
+    check('5H-SPEC2 4.2 the autoBoth exclusion: c11_drill_vocab_en_gk keeps a live Pronounce at mount',
+      !!excluded && excluded[2] === 'autoBoth'
+        && openPronounce.present && openPronounce.disabled === false,
+      `${JSON.stringify(excluded)} / ${JSON.stringify(openPronounce)}`);
+  }
+
+  // ---- 2.9 ONE SAY-ALL PER RECORDING ON A QUICK REVIEW PAGE -------------
+  // VERIFY-5H (p). A Learn toggle or a modal shows one half at a time, so its
+  // button IS the whole paradigm's and stays on both halves -- the 5H "named
+  // toggle" check above asserts exactly that, and is deliberately NOT
+  // extended here. A Review page STACKS both halves, so a button on each
+  // would be the same recording twice on one screen; the data drops the
+  // Singular half's and this is the inverse assertion.
+  for (const activityId of ['c11_qr_this_that', 'c11_qr_relative', 'c11_qr_reflexive']) {
+    const activity = activityById(ch11, activityId);
+    const charts = activity.paradigms || (activity.paradigm ? [activity.paradigm] : []);
+    const expected = charts.filter(chart => chart.sayWhole && chart.sayWhole.audio).length;
+    await go(`#/activity/chapt_11/${activityId}`);
+    const says = await page.evaluate(() => [...document.querySelectorAll('.card button')]
+      .filter(b => b.innerText.trim() === 'Say Paradigm').length);
+    check(`5H-SPEC2 2.9 ${activityId}: ${expected} say-all button(s) over ${charts.length} stacked halves`,
+      says === expected && expected > 0 && expected < charts.length,
+      `${says} rendered, data expects ${expected} of ${charts.length}`);
+    // ...and the one that survives is the PLURAL half's, which is what puts
+    // the button under everything the recording reads rather than over half
+    // of it. The halves alternate Singular, Plural in the authored order.
+    check(`5H-SPEC2 2.9 ${activityId}: no Singular half carries the button`,
+      charts.every((chart, index) => index % 2 === 1 || !(chart.sayWhole && chart.sayWhole.audio)),
+      JSON.stringify(charts.map(chart => !!(chart.sayWhole && chart.sayWhole.audio))));
+  }
+
+  // ---- 3.3 A GREEK CONTRAST WORD IS NOT A TOGGLE LABEL ------------------
+  // NIT-LOG N-2 / DISCLOSURE-RULES 4.1. Chapter 12's Imperfect hint for the
+  // eimi and echo forms shipped labelled with the words themselves; 4.1 sends
+  // a LEXICAL contrast to More/Back, which is where chapter 4's logos /
+  // anthropos pair went. The other pairs in twelve chapters differ in an
+  // ENGLISH word and must be untouched, so all four surfaces are read here in
+  // one pass rather than the changed one alone.
+  {
+    const toggleLabel = () => page.evaluate(() => {
+      const toggle = document.querySelector('.modal [data-hint-paradigm-toggle]');
+      return toggle ? toggle.innerText.trim() : null;
+    });
+    const labelsAt = async (chapterId, activityId, prompt, limit) => {
+      const found = await seekPrompt(chapterId, activityId, prompt, limit);
+      if (!found) return null;
+      await cardButton('Hint').click();
+      await page.waitForSelector('.modal', { timeout: 8000 });
+      await page.waitForTimeout(200);
+      const first = await toggleLabel();
+      await page.locator('.modal [data-hint-paradigm-toggle]').click();
+      await page.waitForTimeout(220);
+      const second = await toggleLabel();
+      await closeModal();
+      return [first, second];
+    };
+    const eimiEcho = await labelsAt('chapt_12', 'c12_drill_parsing', 'ἦμεν', 23);
+    check('5H-SPEC2 3.3 ch12 eimi/echo hint: the Greek contrast falls back to More/Back',
+      !!eimiEcho && eimiEcho[0] === 'More' && eimiEcho[1] === 'Back',
+      JSON.stringify(eimiEcho));
+    const luo = await labelsAt('chapt_12', 'c12_drill_parsing', 'ἔλυες', 23);
+    check('5H-SPEC2 3.3 ch12 luo hint: an ENGLISH contrast still names itself',
+      !!luo && !!luo[0] && !!luo[1] && !['More', 'Back'].includes(luo[0]),
+      JSON.stringify(luo));
+    const ch10Eimi = await labelsAt('chapt_10', 'c10_drill_parsing', 'εἰμί', 30);
+    check('5H-SPEC2 3.3 ch10 eimi hint: Present/Future is unchanged',
+      !!ch10Eimi && ch10Eimi[0] === 'Future' && ch10Eimi[1] === 'Present',
+      JSON.stringify(ch10Eimi));
+    const ch11This = await labelsAt('chapt_11', 'c11_drill_this_that', 'οὗτος', 30);
+    check('5H-SPEC2 3.3 ch11 hint: Singular/Plural is unchanged',
+      !!ch11This && ch11This[0] === 'Plural' && ch11This[1] === 'Singular',
+      JSON.stringify(ch11This));
+  }
+
+  // ---- 2.7 A CARD THAT PRINTS THREE FORMS SPEAKS THREE FORMS ------------
+  // VERIFY-5H-RESPONSE 6. The Learn Vocabulary flashcard and the Review
+  // Vocabulary Chart print the whole lexicalForm, so the clip is the lemma's
+  // own recitation; k_voc7a speaks the first form alone and belongs to the
+  // drills, which reach it through their own authored items.
+  {
+    await go('#/activity/chapt_11/c11_qr_vocab');
+    const row = page.locator('.review-vocab .rv-greek', { hasText: 'αὕτη' }).first();
+    const rowPlayed = await exactAudioTap(row, 'chapt_11_k_voc7');
+    check('5H-SPEC2 2.7 ch11 Review chart: the three-form row plays k_voc7',
+      rowPlayed.clipCount === 1 && rowPlayed.fetched.join(' ').includes(rowPlayed.path),
+      `${rowPlayed.clipCount} clip(s), fetched ${JSON.stringify(rowPlayed.fetched)}`);
+    // The flashcard is the same card in stepper form; step to it by its
+    // printed lexicalForm rather than by index.
+    await go('#/activity/chapt_11/c11_learn_vocab');
+    let reached = false;
+    for (let step = 0; step < 14; step += 1) {
+      const shown = normalizeText(await page.locator('.card .flash-pane .value').first().innerText());
+      if (shown.includes('αὕτη')) { reached = true; break; }
+      const next = cardButton('Next');
+      if (!await next.count() || await next.isDisabled()) break;
+      await next.click();
+      await page.waitForTimeout(60);
+    }
+    check('5H-SPEC2 2.7 ch11 flashcard: reached the three-form card', reached);
+    if (reached) {
+      const cardPlayed = await exactAudioTap(
+        page.locator('.card .flash-pane .value.greek-say').first(), 'chapt_11_k_voc7');
+      check('5H-SPEC2 2.7 ch11 flashcard: the card plays k_voc7, not k_voc7a',
+        cardPlayed.clipCount === 1 && cardPlayed.fetched.join(' ').includes(cardPlayed.path),
+        `${cardPlayed.clipCount} clip(s), fetched ${JSON.stringify(cardPlayed.fetched)}`);
+    }
+    // THE RULE IS NOT CHAPTER 11's ALONE, and chapter 8 is where it shows.
+    // Its ἐγώ / ἡμεῖς card is the same shape -- one card, two printed forms, a
+    // lemma clip and per-form sense clips -- and its two surfaces DISAGREED:
+    // c8_qr_vocab draws from the `lemmas` pool and has always played h_voc3,
+    // while c8_learn_vocab draws from `senses` and played h_voc3a, one of the
+    // two words on the card. Both now play h_voc3. Asserted as a pair,
+    // because the pair is the argument: the fix aligns the flashcard with the
+    // Review chart's own shipped, device-verified behaviour rather than
+    // inventing a third. VERIFY-5H-2 (v) asks Nathanael to confirm by ear
+    // that h_voc3 recites both forms.
+    await go('#/activity/chapt_8/c8_qr_vocab');
+    const egoRow = page.locator('.review-vocab .rv-greek', { hasText: 'ἡμεῖς' }).first();
+    const egoPlayed = await exactAudioTap(egoRow, 'chapt_8_h_voc3');
+    check('5H-SPEC2 2.7 ch8 Review chart: the two-form first-person row plays h_voc3 (unchanged)',
+      egoPlayed.clipCount === 1 && egoPlayed.fetched.join(' ').includes(egoPlayed.path),
+      `${egoPlayed.clipCount} clip(s), fetched ${JSON.stringify(egoPlayed.fetched)}`);
+    await go('#/activity/chapt_8/c8_learn_vocab');
+    let reachedEgo = false;
+    for (let step = 0; step < 16; step += 1) {
+      const shown = normalizeText(await page.locator('.card .flash-pane .value').first().innerText());
+      if (shown.includes('ἡμεῖς')) { reachedEgo = true; break; }
+      const next = cardButton('Next');
+      if (!await next.count() || await next.isDisabled()) break;
+      await next.click();
+      await page.waitForTimeout(60);
+    }
+    check('5H-SPEC2 2.7 ch8 flashcard: reached the ἐγώ / ἡμεῖς card', reachedEgo);
+    if (reachedEgo) {
+      const egoCard = await exactAudioTap(
+        page.locator('.card .flash-pane .value.greek-say').first(), 'chapt_8_h_voc3');
+      check('5H-SPEC2 2.7 ch8 flashcard: now agrees with its Review chart and plays h_voc3',
+        egoCard.clipCount === 1 && egoCard.fetched.join(' ').includes(egoCard.path),
+        `${egoCard.clipCount} clip(s), fetched ${JSON.stringify(egoCard.fetched)}`);
+    }
+  }
+}
+
 await browser.close();
 const failed = results.filter(r => !r.ok);
 console.log(`\n${results.length - failed.length}/${results.length} behavior checks passed`);
diff --git a/scripts/ui-disclosure.mjs b/scripts/ui-disclosure.mjs
index ab5c901..d5f20c3 100644
--- a/scripts/ui-disclosure.mjs
+++ b/scripts/ui-disclosure.mjs
@@ -597,7 +597,21 @@ const shot = async name => {
     // than left to the generic sweep.
     ['ch7 Adjective Translation hint (review A2 GOOD pane)', '#/activity/chapt_7/c7_drill_translation', 'hint', 'pair', 1],
     ['ch8 Personal Pronoun Case hint (review A2 BAD pane)', '#/activity/chapt_8/c8_drill_case', 'hint', 'pair', 2],
-    ['ch8 Autos Translation hint (4 pages)', '#/activity/chapt_8/c8_drill_translation_autos', 'hint', 'pair', 3],
+    // 5H-SPEC2 3.1: ONE ENTRY BECAME TWO, because the surface did. This drill
+    // used to open a four-page stack for every item (`ui.hintPages`); the
+    // original dispatches ONE page per item, so which composition you get now
+    // depends on which item you are standing on -- and the items are
+    // shuffled, so a walk that just opens the Hint measures whichever it drew.
+    // The eighth tuple field seeks a named prompt first. Two compositions, one
+    // per route: the third-person paradigm is a three-chart stack and keeps
+    // the §4.2 pinned pair; the Three Uses teaching page has no navigation of
+    // its own and must pin nothing, exactly like the Augment Drill's prose.
+    ['ch8 Autos Translation hint (paradigm route, 3 charts)',
+      '#/activity/chapt_8/c8_drill_translation_autos', 'hint', 'pair', 2, true, /close|cancel/i,
+      'κατὰ τὸ αὐτὸ πνεῦμα'],
+    ['ch8 Autos Translation hint (Three Uses route, no nav)',
+      '#/activity/chapt_8/c8_drill_translation_autos', 'hint', 'none', 0, true, /close|cancel/i,
+      'ἡ ὥρα αὐτοῦ'],
     ['ch9 Parsing hint (composite, 2 states)', '#/activity/chapt_9/c9_drill_parsing', 'hint', 'toggle', 1],
     // §4.5's lone centred toggle: the one state in the app with no say button.
     ['ch10 Parsing hint (εἰμί, no say button)', '#/activity/chapt_10/c10_drill_parsing', 'hint', 'toggle', 1],
@@ -720,8 +734,24 @@ const shot = async name => {
   // max-height:420px compaction, which is a different composition question.
   await page.setViewportSize({ width: 390, height: 520 });
   let scrolledStates = 0;
-  for (const [label, hash, how, expect, steps, mustScroll = true, escape = /close|cancel/i] of MODALS) {
+  for (const [label, hash, how, expect, steps, mustScroll = true, escape = /close|cancel/i, seek = null] of MODALS) {
     await go(hash);
+    // A form-dependent Hint has to be opened on a NAMED form, or the shuffle
+    // decides which composition this walk measures (5H-SPEC2 3.1).
+    if (seek) {
+      const want = String(seek).replace(/\s+/g, ' ').trim().normalize('NFC');
+      let onItem = false;
+      for (let step = 0; step < 30; step += 1) {
+        const shown = String(await page.locator('.card .prompt').first().innerText())
+          .replace(/\s+/g, ' ').trim().normalize('NFC');
+        if (shown === want) { onItem = true; break; }
+        const next = page.locator('.card').getByRole('button', { name: 'Next', exact: true });
+        if (!await next.count() || await next.isDisabled()) break;
+        await next.click();
+        await page.waitForTimeout(40);
+      }
+      check(`D13 ${label}: reached the form this composition belongs to`, onItem, seek);
+    }
     if (how === 'hint') {
       await page.getByRole('button', { name: 'Hint', exact: true }).click();
     } else if (how === 'endings') {
diff --git a/scripts/ui-modals.mjs b/scripts/ui-modals.mjs
index 1be6f0d..4cc0103 100644
--- a/scripts/ui-modals.mjs
+++ b/scripts/ui-modals.mjs
@@ -223,6 +223,22 @@ const SURFACES = [
     await page.waitForTimeout(180);
   }],
   ['ch7-adjective-case-hint', hint('chapt_7', 'c7_drill_case', false)],
+  // 5H-SPEC2 3.1 (LOOKBACK): chapter 8's two form-dependent Hints, which the
+  // port never had. The Case Drill routes each form to its OWN person's
+  // paradigm -- three modals off one drill, so all three are sought by form --
+  // and the Aὐτός Translation Drill alternates between the third-person
+  // paradigm and the Learn topic "Three Uses", which is the first hint in the
+  // app whose body is a TEACHING PAGE reached by topic id. That page is prose
+  // with two levels of numbered list and three accordions; it is exactly the
+  // sort of body that fits at 844px and overflows at 360, which is what this
+  // file is for.
+  ['ch8-case-hint-first-person', hintAtPrompt('chapt_8', 'c8_drill_case', 'ἡμεῖς', 31)],
+  ['ch8-case-hint-second-person', hintAtPrompt('chapt_8', 'c8_drill_case', 'σοι', 31)],
+  ['ch8-case-hint-third-person', hintAtPrompt('chapt_8', 'c8_drill_case', 'αὐτή', 31)],
+  ['ch8-autos-translation-hint-paradigm',
+    hintAtPrompt('chapt_8', 'c8_drill_translation_autos', 'κατὰ τὸ αὐτὸ πνεῦμα', 21)],
+  ['ch8-autos-translation-hint-three-uses',
+    hintAtPrompt('chapt_8', 'c8_drill_translation_autos', 'ἡ ὥρα αὐτοῦ', 21)],
   // 5H: chapter 11's four hints are form-dependent (D-46), so the two that
   // route to two different charts are sought by FORM rather than trusted to
   // shuffle -- an οὗτος item and an ἐκεῖνος item open different modals, and
diff --git a/scripts/ui-walk.mjs b/scripts/ui-walk.mjs
index 5a85b4c..8a89536 100644
--- a/scripts/ui-walk.mjs
+++ b/scripts/ui-walk.mjs
@@ -441,8 +441,22 @@ for (const size of WIDTHS) {
           } else {
             await hint.click();
             const modal = page.locator('.hint-modal');
-            if (!await modal.count() || !await modal.isVisible() || !await modal.locator('.paradigm').count()) {
-              report.interactionErrors.push({ ...evidence, state: activityId, error: 'Hint did not open a paradigm' });
+            // 5H-SPEC2 3.1: A HINT PAYLOAD IS NOT ALWAYS A CHART. Chapter 8's
+            // Aὐτός Translation Drill routes eight of its twenty-one items to
+            // the Learn topic "Three Uses" — prose, by topic id — and the rest
+            // to the Third Person Paradigm. The items are shuffled, so which
+            // one this walk lands on is a draw; before this the walk reported
+            // an interaction error on the draws that opened the page. A page
+            // route is captured as itself, by the ref it resolved, and the
+            // chart assertions below stay chart-only.
+            const pageRef = await modal.count() ? await modal.getAttribute('data-hint-page-ref') : null;
+            if (pageRef) {
+              await recordExtra(`${activityId}--hint`, `hint page: ${pageRef}`);
+              await modal.getByRole('button', { name: /close|cancel/i }).first().click();
+              await page.waitForTimeout(120);
+              if (await modal.count()) report.interactionErrors.push({ ...evidence, state: activityId, error: 'Hint page did not close' });
+            } else if (!await modal.count() || !await modal.isVisible() || !await modal.locator('.paradigm').count()) {
+              report.interactionErrors.push({ ...evidence, state: activityId, error: 'Hint did not open a paradigm or a page' });
             } else {
               const titles = (await modal.locator('.pg-title:visible').allInnerTexts())
                 .map(text => text.replace(/\s+/g, ' ').trim()).filter(Boolean);
diff --git a/src/components/ContentAudio.svelte b/src/components/ContentAudio.svelte
index 4848f65..fe74233 100644
--- a/src/components/ContentAudio.svelte
+++ b/src/components/ContentAudio.svelte
@@ -8,7 +8,7 @@
   // panels; their per-mode data contracts are documented in HANDOFF-4 §5 (B1).
   import { onDestroy } from 'svelte';
   import { getGreekTapMap, headingKey, resolveItems, shuffle } from '../lib/content.js';
-  import { splitGreekRuns } from '../lib/greek.js';
+  import { splitGreekRuns, splitTaps } from '../lib/greek.js';
   import { play, playOnLoad, stop as stopAudio } from '../lib/audio.js';
   import { markCompleted } from '../lib/progress.js';
   import { providePopups, popupFor } from '../lib/popups.js';
@@ -276,9 +276,23 @@
        strings themselves are extracted verbatim from the TBK -- round 1
        authored chapter 3's four lines from scratch, which is what
        VERIFY-5D-RESPONSE2 item 1 is about; they are never paraphrased. -->
+  <!-- 5H-SPEC2 2.5 (VERIFY-5H (o), DOSBox-confirmed): AN OBJECTIVE MAY SPEAK.
+       Chapter 11's first objective names ἐκεῖνος and οὗτος, chapter 7's fifth
+       names εἰμί, and the Objectives page's own WordSelection table in each
+       TBK dispatches a clip for those words — the original's objectives are
+       tap targets like every other displayed Greek (directive 9). The
+       objectives array was plain strings and had nowhere to carry a clip, so
+       an entry is now EITHER a string (every other objective in twelve
+       chapters, unchanged) or `{ text, audioMap }`, the same form -> clip map
+       topics already use. splitTaps does the wrapping, so a Greek word here
+       renders exactly as it does in prose. -->
   <div class="card textpage">
     <strong>{chapter.objectivesPreamble}</strong>
-    <ol class="objectives-list">{#each chapter.objectives as o}<li>{o}</li>{/each}</ol>
+    <ol class="objectives-list">{#each chapter.objectives as o}
+      {@const text = typeof o === 'string' ? o : (o.text || '')}
+      {@const taps = typeof o === 'string' ? null : o.audioMap}
+      <li>{#if taps}{#each splitTaps(text, taps) as part}{#if part.audio}<button class="greek-tap greek" on:click={() => play(part.audio)}>{part.t}</button>{:else}{part.t}{/if}{/each}{:else}{text}{/if}</li>
+    {/each}</ol>
   </div>
 
 {:else if mode === 'topicPages'}
diff --git a/src/components/SelectActivity.svelte b/src/components/SelectActivity.svelte
index b2af2e0..a0e4d5b 100644
--- a/src/components/SelectActivity.svelte
+++ b/src/components/SelectActivity.svelte
@@ -34,7 +34,7 @@
   // policy machinery as a one-stage item, so no timing or advance rule below
   // has a special case for it.
   import { onDestroy } from 'svelte';
-  import { authoredOptionSource, buildSelectQuestions, buildTwoStageQuestions, paradigmToggleLabels, randomFeedback, resolveContentById, resolveHintBlocks, resolveHintRef } from '../lib/content.js';
+  import { authoredOptionSource, buildSelectQuestions, buildTwoStageQuestions, paradigmToggleLabels, randomFeedback, resolveContentById, resolveHintBlocks, resolveHintPage, resolveHintRef } from '../lib/content.js';
   import { combiningForMarkName, firstAccentCluster, markOverlayParts } from '../lib/greek.js';
   import { play, playThrough, stop as stopAudio } from '../lib/audio.js';
   import { markCompleted } from '../lib/progress.js';
@@ -203,6 +203,24 @@
   // activity-level Hint.
   $: activeHintRef = current?.hintRef ?? activity.ui?.hintRef;
   $: hintChart = activeHintRef ? resolveHintRef(chapter, activeHintRef) : null;
+  // 5H-SPEC2 3.1: A PER-ITEM hintRef MAY NAME A TEACHING PAGE, not only a
+  // chart. Chapter 8's Aὐτός Translation Drill routes eight of its twenty-one
+  // items to the Learn topic "Three Uses" and the rest to the Third Person
+  // paradigm — the original's own WordCounter dispatch (8_PRONS.TBK 0x7bf39),
+  // one page per item. The port used to stack BOTH as a two-page hintPages
+  // popup, which showed every item both answers; the data has dropped that key
+  // so this per-item routing governs.
+  //
+  // resolveHintRef answers "which CHART" and three call sites feed its result
+  // straight to Paradigm, so the topic-id fall-through lands here rather than
+  // inside it: when a ref resolves to no chart, ask resolveContentById for the
+  // topic's own blocks — the identical array the retired `contentRef` page
+  // rendered. A ref that resolves to neither still yields no Hint button,
+  // which is what check:shapes now refuses to let ship.
+  $: hintRefPage = activeHintRef && !hintChart
+    ? resolveHintPage(chapter, activeHintRef)
+    : { blocks: [], title: null };
+  $: hintRefBlocks = hintRefPage.blocks;
   // 5G-SPEC3 / D-48f1: a composite drill hint discloses one chart at a time,
   // and the button always names the OTHER state so the learner sees where it
   // goes rather than a generic "switch" instruction.
@@ -294,7 +312,8 @@
     stopAudio();
     hintParadigmIndex = Math.max(0, Math.min(hintBundle.length - 1, hintParadigmIndex + delta));
   }
-  $: showHintButton = hintPages.length > 0 || hintBlocks.length > 0 || !!hintChart;
+  $: showHintButton = hintPages.length > 0 || hintBlocks.length > 0 || !!hintChart
+    || hintRefBlocks.length > 0;
   $: orderedRevealControls = orderControls([
     ...revealButtons.map(reveal => ({ kind: 'reveal', label: reveal.label, reveal })),
     ...(showHintButton ? [{ kind: 'hint', label: 'Hint' }] : [])
@@ -317,17 +336,32 @@
   // 108, CONFIRMED) records the AUGMENTED ANSWER, not the lemma on screen, so
   // the prompt tap and Pronounce would hand the answer over before the guess.
   //
-  // Stated structurally rather than by activity id: when the prompt is Greek
-  // AND the options are Greek AND the clip is afterGuess, that clip cannot be
-  // the prompt's own -- the answer is one of the displayed forms and the
-  // recording is of it. Until the item is answered the lemma renders in INK
-  // (the Syllable Division exception treatment, directive 9) and Pronounce is
-  // disabled; afterwards both go live and replay the clip. The triple matches
-  // exactly one activity across all twelve chapters today and covers the next
-  // drill built this way without an edit here. English-prompt Greek-option
-  // drills (every Vocabulary: English to Greek) are untouched -- their prompt
-  // is not Greek.
-  $: answerClipPrompt = promptIsGreek && greekOptions && audioTiming === 'afterGuess';
+  // Stated structurally rather than by activity id: when the options are Greek
+  // AND the clip is afterGuess, that clip cannot be the prompt's own -- the
+  // answer is one of the displayed forms and the recording is of it. Until the
+  // item is answered the Greek prompt renders in INK (the Syllable Division
+  // exception treatment, directive 9) and Pronounce is disabled; afterwards
+  // both go live and replay the clip.
+  //
+  // 5H-SPEC2 4.1, ADOPTED FORWARD AND BACKWARD (Nathanael, VERIFY-5H (d)):
+  // DOSBox confirms the ORIGINAL leaks -- its Pronounce speaks the augmented
+  // answer before the guess -- and the gate is kept anyway, as a deliberate
+  // improvement, everywhere the same shape occurs. The condition's first leg
+  // was "the prompt is Greek", which fenced it to chapter 12; the leg that
+  // actually states the rule is the ADVANCE CLASS:
+  //   afterGuess + Greek options + NOT autoBoth
+  // `autoBoth` is every English-to-Greek vocabulary drill, and there a
+  // disabled Pronounce is a dead button -- the item auto-advances on any
+  // answer, so the control would never come alive while its item is on screen.
+  // Excluded by the same ruling, structurally rather than by name: the
+  // spellers, where pronouncing the target IS the exercise (they are not this
+  // component at all). What that leaves, across the 270-activity census, is
+  // FOUR: chapter 12's Augment Drill and the English-prompt form drills of
+  // chapters 3, 4 and 5, whose Pronounce speaks the Greek ANSWER. Their
+  // prompts are English, so only the Pronounce half of the gate bites there --
+  // the ink-prompt half is vacuous, not skipped.
+  $: answerClipPrompt = greekOptions && audioTiming === 'afterGuess'
+    && advancePolicy.advanceClass !== 'autoBoth';
   // Whether the prompt tap and Pronounce may speak the clip right now.
   $: promptClipLive = !answerClipPrompt || answered;
   // §5.5: the item is final and nothing is going to move it. Which outcomes
@@ -765,7 +799,11 @@
       {#if showPronounce}
         <!-- Speaks the prompt where the prompt is the Greek; on the Greek Verb
              Drill (English prompt) it speaks the answer form, which is what
-             the original's Pronounce does there. -->
+             the original's Pronounce does there -- but only once the guess is
+             in. `promptClipLive` is the 4.1 gate: the original speaks the
+             answer whenever it is asked, and Nathanael's ruling on VERIFY-5H
+             (d) keeps that clip from arriving before the learner has answered
+             on all four drills where the clip IS the answer. -->
         {@const say = promptClipLive ? (current.promptAudio || current.answerAudio) : null}
         <button class="btn" disabled={!say} on:click={() => say && play(say)}>Pronounce</button>
       {/if}
@@ -923,6 +961,24 @@
       </div>
     </div>
   </div>
+{:else if showHint && hintRefBlocks.length}
+  <!-- 5H-SPEC2 3.1: the per-item hintRef resolved to a TEACHING PAGE rather
+       than a chart (chapter 8's "Three Uses"). Same modal shell as every other
+       Hint route; the topic's own title heads it, so the data does not author
+       the heading a second time. -->
+  <div class="modal-overlay" on:click|self={() => (showHint = false)} role="presentation">
+    <div class="modal hint-modal" role="dialog" aria-modal="true" aria-label="Hint"
+         data-hint-page-ref={activeHintRef}>
+      <div class="modal-scroll">
+        {#if hintRefPage.title}<div class="rc-heading">{hintRefPage.title}</div>{/if}
+        <RichContent blocks={hintRefBlocks} />
+      </div>
+      <div class="modal-actions">
+        <!-- svelte-ignore a11y-autofocus -->
+        <button class="btn" autofocus on:click={() => (showHint = false)}>Close</button>
+      </div>
+    </div>
+  </div>
 {:else if showHint && hintBlocks.length}
   <!-- 5F-FEEDBACK.pdf item 15/16 root cause: this branch used to render a
        bare .card stacked under the drill -- no dim overlay, no Close, easy
@@ -933,8 +989,15 @@
        prose. -->
   <div class="modal-overlay" on:click|self={() => (showHint = false)} role="presentation">
     <div class="modal hint-modal" role="dialog" aria-modal="true" aria-label="Hint">
+      <!-- 5H-SPEC2 2.6 (VERIFY-5H-RESPONSE 5): the hint's own Greek taps. An
+           inline hint carries an `audioMap` exactly as a teaching TOPIC does,
+           and it is applied the same way — chapter 12's Augment hint prints
+           ἐκβάλλω / ἐξεβάλλον / ἀποκτείνω / ἀπέκτεινον in points 3 and 4 and
+           each speaks its own clip. The map lists what speaks, so the Greek
+           in the rule lines above (the bare ε of the augment rule) stays
+           inert, which is the map doing its job rather than an exception. -->
       <div class="modal-scroll">
-        <RichContent blocks={hintBlocks} />
+        <RichContent blocks={hintBlocks} greekTaps={activity.hint?.audioMap || null} />
       </div>
       <div class="modal-actions">
         <!-- svelte-ignore a11y-autofocus -->
diff --git a/src/lib/content.js b/src/lib/content.js
index 73937f0..ddaf166 100644
--- a/src/lib/content.js
+++ b/src/lib/content.js
@@ -405,7 +405,15 @@ function sensePool(chapter) {
           greek: lemma.greek,
           gloss: lemma.gloss || lemma.glossShort || '',
           ntFreq: freqFor(),
-          audio: (sense && sense.audio) || lemma.audio || null
+          // 5H-SPEC2 2.7 (VERIFY-5H-RESPONSE 6): THE LEMMA'S OWN CLIP, not the
+          // first sense's. This card is the one-card-for-every-form case — it
+          // prints the whole `lexicalForm` (οὗτος, αὕτη, τοῦτο; ἐγώ / ἡμεῖς) —
+          // so the recording that matches what is on screen is the lemma's
+          // recitation of all of them. A sense clip speaks ONE form and belongs
+          // to the drills, which reach it through their own authored items.
+          // Chapter 11's Learn Vocabulary flashcard and Review Vocabulary Chart
+          // were speaking k_voc7a (οὗτος alone) under a card reading all three.
+          audio: lemma.audio || (sense && sense.audio) || null
         });
         continue;
       }
@@ -715,6 +723,17 @@ function optionClassForLayout(layout, activity, activityOptions, questions) {
 // The returned array is indexed BY STATE: entry i is the contrast word of
 // title i. Callers index it by the TARGET state, so the button names where
 // it goes, not where it is.
+//
+// 5H-SPEC2 3.3 / NIT-LOG N-2: a contrast word that is GREEK is not a label.
+// DISCLOSURE-RULES 4.1 sends a LEXICAL contrast to More/Back -- the rule was
+// settled on chapter 4's Masculine Declension, where the two screens are
+// logos and anthropos and the buttons read More/Back rather than the words
+// themselves. Chapter 12's Imperfect hint for the eimi/echo forms is the one
+// pair in twelve chapters whose single differing word is Greek, and it
+// shipped labelled with the words (5H-SPEC1). Stated structurally so the rule
+// is the same one 4.1 states rather than a chapter-12 exception: the five
+// other shipped pairs differ in an ENGLISH word (Present/Future,
+// Middle/Passive, Singular/Plural) and are untouched.
 export function paradigmToggleLabels(titles) {
   const words = (titles || []).map(title => String(title || '').trim().split(/\s+/));
   const fallback = (titles || []).map((_, index) => (index === 0 ? 'Back' : 'More'));
@@ -723,9 +742,16 @@ export function paradigmToggleLabels(titles) {
     (found, differs, index) => (differs ? [...found, index] : found), []);
   if (differing.length !== 1) return fallback;
   const at = differing[0];
+  if (GREEK_LETTER.test(words[0][at]) || GREEK_LETTER.test(words[1][at])) return fallback;
   return [words[0][at], words[1][at]];
 }
 
+// Greek + Greek Extended. A local copy of lib/greek.js's own test rather than
+// an import: content.js is the module every route gates on, and it has no
+// dependency on the typography layer (which pulls mark-geometry.json in with
+// it). One regex, stated in both places, is cheaper than that edge.
+const GREEK_LETTER = /[Ͱ-Ͽἀ-῿]/;
+
 // A hintRef names a chart source in the chapter: an existing chart by id/type/
 // title, or a chapter-level hintCharts entry. Chapter 3's three verb drills all
 // open the same λύω paradigm the Learn page draws; later composite entries may
@@ -881,18 +907,32 @@ export function resolveHintBlocks(chapter, hint) {
 // (5F-FEEDBACK2 item 28: the Aὐτός Translation Drill's last hint page is the
 // Three Uses teaching page). Resolving by id keeps the hint from duplicating —
 // or drifting from — the authored page, same principle as resolveHintBlocks.
-export function resolveContentById(chapter, ref) {
-  if (!chapter || !ref) return [];
+//
+// 5H-SPEC2 3.1: the page's own TITLE travels with its blocks. A teaching topic
+// carries its heading in `title`, beside the content rather than inside it, so
+// a hint that borrows the topic and prints only the blocks arrives untitled —
+// which is how the retired `hintPages` route had to author "Three Uses" a
+// second time in the data. One walk answers both questions.
+export function resolveHintPage(chapter, ref) {
+  const empty = { blocks: [], title: null };
+  if (!chapter || !ref) return empty;
   let found = null;
   const walk = node => {
     if (found || !node) return;
     if (Array.isArray(node)) { node.forEach(walk); return; }
     if (typeof node !== 'object') return;
-    if (node.id === ref && Array.isArray(node.content)) { found = node.content; return; }
+    if (node.id === ref && Array.isArray(node.content)) {
+      found = { blocks: node.content, title: node.title || null };
+      return;
+    }
     for (const key of Object.keys(node)) walk(node[key]);
   };
   for (const section of SECTIONS) walk(chapter[section]);
-  return found || [];
+  return found || empty;
+}
+
+export function resolveContentById(chapter, ref) {
+  return resolveHintPage(chapter, ref).blocks;
 }
 
 export function shuffle(arr) {
```
