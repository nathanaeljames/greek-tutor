# 5H-SPEC2-RESULTS-OPUS

Implementation handoff for 5H-SPEC2 Revision 1a — cohort 5H's closure plus the
LOOKBACK pass over chapters 3-12. Base: `15bbe3b` ("saving revised data files
and restarting 5H spec 2"), working tree clean at start.

No git was run beyond read-only `git status` / `git diff` / `git show` and one
`git stash` round-trip used to prove a pre-existing check failure is
pre-existing (section 6.2). Nothing is staged, committed or pushed.

Companion documents: `5H-SPEC2-BUILD-OPUS.md` (the complete cumulative diff,
the tool log and the wall clock), `VERIFY-5H-2.md` (the items only Nathanael
can settle, authored this round per the new standing rule 0.2) and the
`5H-VISUAL-CHECKLIST-2` section appended to `5H-VISUAL-CHECKLIST-OPUS.md`.

---

## 1. Headline

**All six delivered data files carry exactly what sections 2-4 say they
carry**, so nothing STOPPED and no data file was edited. Every renderer item
shipped, every harness item shipped, and the round's code is six small
renderer changes plus one shape-check strengthening — no new block type, no
new mode, no new component.

Two things are worth your attention before the detail.

**First, the round found three stale harness assertions**, all of them
downstream of the retired `ui.hintPages` key, and one of them was passing
while measuring something other than what its name said. That is the ONBOARD
§7 failure mode ("a harness that still passes after testing markup that no
longer exists is worse than no harness"), and it is section 4.

**Second, the ch8 rail walk does not obviously agree with spec section 3.1**,
and I shipped 3.1 as written while flagging it. `ch8railwalk` p7 bottom-right
shows the Aὐτός Translation Drill's Hint carrying **More | Cancel**, and p8
top-left shows the Three Uses page carrying **Back | Cancel** — a two-page
stack, which is what the port had before this round and what 3.1 removed. It
is genuinely ambiguous, because every hint screen in that walk was opened from
a PARADIGM item; section 5.1 lays out both readings and `VERIFY-5H-2` (s) asks
the two DOSBox questions that separate them. **If the answer comes back
"stack", the revert is the data key plus about six lines here.**

| Spec item | State |
| --- | --- |
| 2.1 (a) RESTORE the Relative Pronouns Introduction | done — data only; the pending banner is gone and the walk confirms it |
| 2.2 Demonstrative Examples Jn 13:35 line break | done — data only; re-screenshotted |
| 2.3 / 2.4 ὅς Neut.-A, μέν, prompt 24, both slips | done — data only; verified in the walk and the modal pass |
| 2.5 (o) objectives taps — RENDERER + DATA CONTRACT | done — `{text, audioMap}`, three taps, twelve-chapter census |
| 2.6 Augment hint taps | done — inline hints apply `audioMap` the way topics do; 4 positives, 2 negatives |
| 2.7 οὗτος says all three | done — and it found a real disagreement inside chapter 8; section 5.2 |
| 2.8 ὅς parts | data only; `parts` is deliberately unrendered pending `VERIFY-5H-2` (r) |
| 2.9 (p) Quick Review say-all consolidation | done — the inverse assertion is in, and the Learn-toggle family was NOT extended |
| 3.1 ch8 form-dependent hints | done — the topic-id fall-through plus the check that would have caught the gap; see section 5.1 |
| 3.3 Greek toggle labels | done — the section 3.3 default applied, the other five rows asserted unchanged |
| 4 audio-leak gate generalised | done — the triple selects exactly four activities, computed from the data by the harness |
| 5 NIT-LOG | done — N-1 and N-2 appended |
| 6 harness, acceptance, VERIFY-5H-2 | done |
| 7 D-52..D-56 + D-51 amend | done — appended verbatim (spec 1's default) |

---

## 2. The STOP gate: what the delivered data actually carries

Section 1 says to STOP if a file does not carry what its section describes. I
checked all six against their sections before writing any code. Every claim
holds:

| Claim | Verified |
| --- | --- |
| 2.1 the ch11 Introduction topic's key is `_verify_note`, not `_verify` | yes — and that is why no banner renders |
| 2.2 Jn 13:35 is ONE `greek` string with no `greek2` | yes |
| 2.3 `k_osnap` survives at exactly ONE site (speller item 14, answer οὕς); the Learn cell, the Quick Review copy and the `relativeParadigm` hint are `k_osnns` | yes — 1 occurrence of `k_osnap`, 7 of `k_osnns` |
| 2.4 μέν gloss, prompt 24, τούτου, ἐκεῖνοί | yes, all four |
| 2.5 ch11 objective 1 and ch7 objective **5** carry `audioMap` | yes — Revision 1a's off-by-one fix is in the file; objective 4 is a plain string again |
| 2.6 `hint.audioMap` on `c12_drill_augment` with l_ex11-14 | yes |
| 2.7 lexicon `houtos.audio` is `k_voc7` | yes |
| 2.8 `hos.parts` wires k_osmns / k_osfns / k_osnns; `audio` stays k_voc5 | yes |
| 2.9 ch11's three Review pages carry `sayWhole` on the PLURAL half only | yes — 2 of 4, 1 of 2, 3 of 6, always the odd index |
| 3.1 ch8 per-item `hintRef` on both drills; `ui.hintPages` removed | yes — and the removed value is preserved as `_hint_pages_removed` |
| 4.2 the 4.1 triple selects ch3/ch4/ch5/ch12 and nothing else | yes — computed over every select activity in twelve chapters, in the harness rather than by hand |

`npm run check:shapes` passes over all twelve chapters, which includes the
manifest existence check on every new audio id (`chapt_7_g_eimi1s`,
`chapt_11_k_ekemns`, `chapt_11_k_outmns`, `chapt_12_l_ex11-14`,
`chapt_11_k_osnns`, `chapt_11_k_osmns`, `chapt_11_k_osfns`).

---

## 3. What was built, module by module

### 3.1 `src/lib/content.js` — three changes

**`paradigmToggleLabels` (spec 3.3).** One line plus a local `GREEK_LETTER`
regex: a contrast word that is Greek falls back to More/Back. Stated as
DISCLOSURE-RULES §4.1's own rule ("a LEXICAL contrast goes to More/Back")
rather than as a chapter-12 exception, so there is one rule in one place. The
regex is a local copy of `lib/greek.js`'s, character for character, rather than
an import — `content.js` is the module every route gates on and it has no
other dependency on the typography layer, which carries `mark-geometry.json`
with it. Two copies of a five-character range is the cheaper of the two costs;
flagged here so it is a decision rather than an accident.

**`sensePool` untagged card audio (spec 2.7).** `(sense && sense.audio) ||
lemma.audio` became `lemma.audio || (sense && sense.audio)`. The untagged
branch is the one-card-for-every-form case — the card prints the whole
`lexicalForm` — so the recording that matches what is on screen is the lemma's
recitation of all of them, and a sense clip speaks one form and belongs to the
drills. See section 5.2 for what this reached beyond chapter 11.

**`resolveHintPage` (spec 3.1), new export.** `resolveContentById` returned
blocks only, so a hint that borrowed a teaching topic arrived untitled — which
is why the retired `hintPages` route had to author "Three Uses" a second time
in the data. `resolveHintPage` returns `{ blocks, title }` from one walk and
`resolveContentById` now delegates to it, so its two existing callers are
unchanged.

### 3.2 `src/components/ContentAudio.svelte` — the objectives contract (2.5)

An `objectives[]` entry is now either a string or `{ text, audioMap }`. The
object form renders through `splitTaps`, the same helper prose taps use, so a
Greek word in an objective renders exactly as it does anywhere else
(`.greek-tap.greek`, blue, directive 8/9). Every other objective in twelve
chapters is a string and takes the unchanged path.

### 3.3 `src/components/SelectActivity.svelte` — three changes

**The inline hint's `audioMap` (2.6).** `<RichContent blocks={hintBlocks} />`
gained `greekTaps={activity.hint?.audioMap || null}`. That is the same prop a
topic's `audioMap` travels on, so the Augment hint's four compound forms tap
and the Greek in the rule lines does not — the map is a list of what speaks,
not a switch that turns the page's Greek on.

**The topic-id hint fall-through (3.1).** *Deviation from the spec's wording,
same result.* 3.1 says to add the fall-through inside `resolveHintRef`. That
function answers "which CHART", and all three of its call sites feed the
result straight to `<Paradigm>`; returning blocks from it would have needed a
type check at each. The fall-through is instead at the resolution SITE:

```js
$: hintRefPage = activeHintRef && !hintChart
  ? resolveHintPage(chapter, activeHintRef)
  : { blocks: [], title: null };
```

plus one modal branch and one term in `showHintButton`. It is still one
branch, it still uses the pre-existing topic-id resolver, and no existing
route changed. The new modal carries `data-hint-page-ref` so the harness can
tell the two routes apart by more than their heading text.

**The audio-leak gate, generalised (4.1).** The condition's first leg was
`promptIsGreek`, which fenced it to chapter 12. It is now
`advancePolicy.advanceClass !== 'autoBoth'`:

```js
$: answerClipPrompt = greekOptions && audioTiming === 'afterGuess'
  && advancePolicy.advanceClass !== 'autoBoth';
```

The ink-prompt half of the gate is unchanged and already conditioned on
`promptIsGreek`, so on the three English-prompt drills it is vacuous rather
than skipped — only the Pronounce half bites there, which is what 4.2
describes. The Pronounce button's comment, which used to say the original's
Pronounce speaks the answer form there and stop, now says that AND that
Nathanael's (d) ruling gates it anyway.

### 3.4 `scripts/check-content-shapes.mjs` — the check that would have caught it

ONBOARD §7: "when a new defect class is found and fixed, add the check that
would have caught it." `hintRef: "threeUses"` shipped in the delivered data,
passed this file cleanly, and resolved to NOTHING in the app — a Hint button
that silently does not render, which is the exact class the existing block was
written to catch, one level down. The old set was "every id, type and title
slug anywhere in the chapter"; the new `resolvableRefs` models the renderer's
two real paths — a CHART (a paradigm block under the named node, a bare
`paradigm` object, a chart title slug, or a `hintCharts` composite) or a PAGE
(a topic id with its own non-empty `content`).

Negative-tested: pointing one item's `hintRef` at `c8_drill_case` — an id that
exists, that the OLD check accepted, and that resolves to neither — now fails
with `"c8_drill_case" resolves to no chart and no content page`. The data was
restored from a copy immediately; `git diff` on `src/data/` is empty.

### 3.5 Harness

- `ui-behavior.mjs`: a new 5H-SPEC2 block, **42 assertions**, plus the two
  repairs in section 4. Each is a census rather than a sample where a census
  is possible: the objectives check reads every chapter's own objective count
  and audioMap key count, and the gate check computes the 4.1 triple over
  every select activity in twelve chapters and compares the result with the
  four ids the spec names. If a thirteenth chapter ships a fifth gated drill,
  the census grows with it; if the renderer's condition drifts from 4.1, the
  two lists part.
- `ui-modals.mjs`: five new surfaces (the Case Drill's three person routes,
  both translation routes) — 47 surfaces at five device heights.
- `ui-disclosure.mjs`: the ch8 Autos entry became two, one per route, and the
  MODALS tuple gained an eighth field that seeks a named prompt before opening
  the Hint. Without it a form-dependent hint measures whichever item the
  shuffle drew.

---

## 4. Three stale harness assertions, and what they teach

All three are downstream of `ui.hintPages` being removed from the delivered
data. The first failed honestly; the other two are the interesting ones.

**(a) `ui-behavior` W1 — failed, correctly.** It pressed More until the Three
Uses topic appeared. There is no More any more, so the DISCLOSURE-SPEC3 check
that the two crossed reflexive clips are right on BOTH surfaces lost its
second surface. It now stands on an item whose `hintRef` routes there. What it
asserts is unchanged; only the route it walks changed.

**(b) `ui-behavior` P3.2 "ch8 Aὐτός Translation Drill Hint (modal pager)" —
PASSED, while measuring something else.** It takes `.pg-nav` inside the modal.
The hint pager is gone, but the third-person paradigm is a three-chart stack,
so `Paradigm` draws its own `.pg-nav` — and the check happily measured that
instead, under a name that says "modal pager". It is renamed to say what it
measures and pinned to a named item, because the drill's items are shuffled
and only some of them route to a chart at all: without the pin it would pass
or fail on the draw.

**(c) `ui-disclosure` D13 "ch8 Autos Translation hint (4 pages)" — failed,
and was the wrong shape twice over.** It expected a pinned nav line. Worse,
even repaired it would have been nondeterministic for the same shuffle reason.
It is now two entries, one per route, each seeking its own form first: the
paradigm route is a three-chart §4.2 pinned pair, the Three Uses route pins
nothing.

One more reference survives deliberately: `scripts/shots-disclosure3.mjs` line
175 captures `w7-ch8-autos-hint-page4` by pressing More three times. That file
is a one-round screenshot script for DISCLOSURE-SPEC3, not a gate, and its
captures are historical evidence of a state that has since been ruled on. It
is named here rather than edited, so nobody re-runs it and reports a mystery.

---

## 5. Three findings that need Nathanael

### 5.1 The ch8 rail walk reads like a two-page stack

Spec 3.1's correction says the port "did NOT lack a Hint here; it stacked BOTH
payloads as a two-page `ui.hintPages`... the per-item routing is the
original's." I shipped that. But the rail walk is not a clean confirmation:

- **ch8railwalk p7 bottom-left**: the drill, on item 1
  (κατὰ τὸ αὐτὸ πνεῦμα, 1 Cor 12:8) — a `thirdPersonParadigm` item.
- **p7 bottom-right**: the Hint it opened. Third Person Paradigm,
  **More | Cancel**.
- **p8 top-left**: Three Uses, all three numbered points, **Back | Cancel**.
- **p8 bottom-left**, for contrast: the Case Drill's Hint on the αὐτή item —
  the same paradigm, **Cancel only**. So the original does distinguish a hint
  that pages from one that does not, and the Autos hint is one that pages.

Two readings survive, because every hint screen in that walk was opened from a
paradigm item:

- **A** — the Hint is always a two-page stack, paradigm first, and the
  dispatch at `0x7bf39` means something else. The port would then be opening
  the wrong page for eight items AND missing the navigation.
- **B** — the dispatch chooses the FIRST page and More/Back reaches the other.
  Item 1 opening at the paradigm with More available is exactly the capture.
  The port would then be routing correctly and missing only the navigation.

Under BOTH readings the port is missing a More/Back pair the original has.
I did not add it, because 3.1 says in as many words not to re-introduce
`hintPages`, and because which shape to add depends on which reading is true.
`VERIFY-5H-2` (s) asks the two questions that separate them — step to item 4
in DOSBox, see which page opens and what buttons it has — and gives the page
references above so the question can be answered against the same evidence.

This is also, I think, an instance of the spec's own new rule 0.4: a rail-walk
screen that departs from what the extraction expects gets reported before the
work proceeds. The extraction read a dispatch table; the walk shows navigation
the dispatch reading does not predict.

### 5.2 Rule 2.7 reached chapter 8, and found the two surfaces disagreeing

2.7 says "confirm the flashcard and the review row read the lemma's `audio`,
not `senses[0].audio`". Stating that as a rule — rather than as a οὗτος
special case — reaches every one-card-many-forms lemma in the app. There are
exactly three: ch11 `houtos`, and ch8 `ego` (ἐγώ / ἡμεῖς) and `su` (σύ /
ὑμεῖς).

What I found while bounding it is why I am confident it is right rather than
merely consistent: **chapter 8's two vocabulary surfaces already disagreed
with each other.** `c8_qr_vocab` draws from the `lemmas` pool and has always
played `h_voc3` on that row; `c8_learn_vocab` draws from `senses` and played
`h_voc3a`, one of the two words printed on the card. The change aligns the
flashcard with the Review chart's shipped, device-verified behaviour rather
than inventing a third answer, and the harness asserts the pair together for
exactly that reason.

It still deserves an ear, because nobody has confirmed what `h_voc3` and
`h_voc9` actually recite. `VERIFY-5H-2` (v).

### 5.3 The ch12 εἰμί hint is ONE screen in the original, not two

Found while cropping `ch12railwalk` p8 for the section 3.3 comparison, and it
reframes the labelling question rather than answering it.

**p8 top-right** — and **p8 bottom-left**, the same panel with the cursor
moved — is the Imperfect Indicative Parsing Drill's Hint on an εἰμί form.
**"Imperfect of εἰμί" and "Imperfect of ἔχω" are both on that one screen**,
stacked, with a single **Cancel**. No More, no Back, no toggle.

The port shows one chart at a time behind a two-state toggle. That split came
in with 5H-SPEC1; the 5H visual checklist passed it (row 12.14) against this
same panel, and 5H-SPEC2's own section 3.3 describes the pair as "consecutive
screens". Reading the panel again, I think it is a stack and both documents
read it as a toggle.

If that is right, it is a DISCLOSURE-RULES departure of exactly the kind
VERIFY-5H item (l) listed for veto row by row, and it was not on that list —
which under the standing rule makes it a silent divergence. It also makes item
(t) possibly moot: with both charts stacked there is no toggle left to label.

**I did not change it.** This spec's 3.3 asks about the LABEL on a toggle;
whether the toggle should exist is a disclosure decision, and deciding it
inside a labelling item is precisely the kind of scope creep the round rules
forbid. Both charts are narrow (three numbered rows, a Singular and a Plural
column, short glosses) so a stack would very likely fit at 320 px the way the
Quick Review pages do under §4.6. `VERIFY-5H-2` (w) asks, and (t) now points
at it.

---

One spec detail worth correcting for the pipeline's model of the code: 2.7
says "the drills keep `k_voc7a` via `senses`". The outcome is right and the
mechanism is not — chapter 11's two vocabulary drills carry AUTHORED items
with `options: "static"`, so they read `item.audio` and never touch the
lexicon's `senses` at all. `pool: "senses"` on those drills resolves through
`lemmaPool`, which falls back to the `lemmas` bucket. Nothing needed to
change; the note is here so the next spec does not reason from the wrong path.

---

## 6. Acceptance

### 6.1 Gates (spec 6.1)

| Gate | Result |
| --- | --- |
| `npm run check:shapes` | PASS, twelve chapters, with the new hintRef resolution rule |
| `npm run build` | PASS, clean; 41 precache entries |
| `npm run check:lazy-chunk` | PASS — twelve chapter chunks + twelve lexicon chunks emitted, precached, out of the index bundle |
| `node scripts/ui-behavior.mjs` | **1094/1094** (was 1052 before this round; +42) |
| `node scripts/ui-modals.mjs` | PASS — 47 surfaces x 5 device heights, zero BAD, zero overlay scroll range |
| `node scripts/ui-disclosure.mjs` | **308/308** |
| `node scripts/ui-disclosure3.mjs` | **84/84**, census unchanged at 270 activities |
| `node scripts/ui-walk.mjs --chapters=chapt_7,chapt_8,chapt_11,chapt_12` | PASS — zero 320 px overflow, zero interaction errors, all rail counts and Next actions live, all expanders and chart states opened, no console errors |
| `node scripts/ui-offline.mjs --chapters=chapt_8,chapt_11,chapt_12` | PASS — 76 stops rendered, 0 missing, refresh OK, no console errors |

### 6.2 One gate that fails, and failed before this round

`npm run check:docs` reports **44 document-integrity failures**. They are
pre-existing: I ran it at `15bbe3b` with my work stashed and got the identical
44, and diffed the two lists to confirm they match line for line. It is not in
the spec's 6.1 gate list. My DIVERGENCE-LOG and NIT-LOG edits are appends and
add no new failure.

### 6.3 Visual pass (spec 6.2)

`5H-VISUAL-CHECKLIST-2`, appended to `5H-VISUAL-CHECKLIST-OPUS.md`: every page
whose data or renderer changed, at 320 px and 768 px, against the rail-walk
panel rendered from the PDF with pymupdf. Every row PASS. Three of them are
also in `VERIFY-5H-2` (u), because "matches the original" and "reads well on a
phone" could disagree there and that is Nathanael's call, not mine.

---

## 7. Deviations from the spec

1. **3.1's fall-through is at the resolution site, not inside
   `resolveHintRef`** (section 3.2). Same branch count, same resolver, no
   existing route touched.
2. **2.8's `parts` are deliberately not rendered.** The spec wires them in the
   data and makes the surface question a VERIFY listen; rendering them now
   would pre-empt (r).
3. **Section 3.3's default was applied** because no kickoff ruling arrived.
   NIT-LOG N-2 records it as the default and `VERIFY-5H-2` (t) asks for
   confirmation; the revert is one line plus four assertions.
4. **Section 7's divergence entries were appended by the implementer
   verbatim**, which is section 1's stated default.
5. **DRILL-BEHAVIOR-RULES A1c is cited as "A1c, pending"** per spec 4.2 — the
   pipeline writes that amendment, and the spec's section 8 debts
   (`post_patches()`, TITLE-SWEEP-RULES, CHAT-HANDOFF) are pipeline work and
   were not touched.

---

## 8. Surprises

- The delivered `hintRef: "threeUses"` passed `check:shapes` and resolved to
  nothing in the app. Both facts were true simultaneously, which is the whole
  reason section 3.4 exists.
- `c8_qr_vocab` and `c8_learn_vocab` have been playing different clips for the
  same card since chapter 8 shipped (section 5.2).
- The `.card .prompt` of a two-line translation item renders BOTH lines inside
  one button, so seeking an item by its `greek` field alone silently fails on
  any item with a `greek2`. That cost one harness run; the seeks now pick
  single-line items and say so.
