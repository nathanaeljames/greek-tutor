# DISCLOSURE-SPEC1-RESULTS-OPUS

Handoff for the DISCLOSURE round (§0.5). Implementer: Opus (claude-opus-5).
Base: repo head `81bd9fb`. Date: 2026-08-16.

No git was run beyond read-only `git diff` / `git show` (§0.2). Nothing is
committed, staged or pushed.

## 0. Status

All ten work items are complete. Every gate is green:

| Gate | Result |
| --- | --- |
| `npm run check:shapes` | PASS |
| `npm run build` | green |
| `npm run check:lazy-chunk` | PASS |
| `node scripts/ui-behavior.mjs` | 877/877 |
| `node scripts/ui-disclosure.mjs` (new this round) | 53/53 |
| `node scripts/ui-modals.mjs` | 155/155 modal states clean |
| `node scripts/ui-smoke-5f.mjs` | 73/73 over 70 rail stops |
| `node scripts/ui-walk.mjs` | 105 stops x 2 widths, no horizontal overflow, no console errors |
| `node scripts/ui-offline.mjs` (directive 4) | 44 stops offline, 0 missing, refresh OK, no console errors |

One gate is RED and was red before this round started: `npm run check:docs`.
See §7 — it is a pre-existing Windows/CRLF defect in the guard itself, not a
document loss, and it is out of this round's scope.

## 1. Mid-round correction (pipeline-side), and where it lands

At 19:20 EDT, after W4-W6 were complete, three files were replaced on disk:
`src/data/chapt-08.json` (the Three Uses conversion, omitted from the
2026-08-15 pass), `DISCLOSURE-SPEC1.md` (sections 2, W1 and W8 amended), and
`DISCLOSURE-PATCH.md` (reference only).

PRE-CORRECTION, W1's `wordUsage` guard required `greek` and `gloss` and W8's
renderer drew the chapter-7 shape only. Both were correct against the first
delivery: every `wordUsage` block in it carried a Greek headword.

POST-CORRECTION rework, 19:23-19:49 EDT (wall clock 0:26), attributable to the
pipeline omission:

- guard relaxed to the amended schema (`examples` required; at least one of
  `title`/`greek`; everything else optional-per-source);
- renderer draws both variants, each field only when present;
- `.rc-wu-title` added, mirroring `.popup-title` (see §3, W8);
- four new harness checks for the chapter-8 variant;
- the retired `asAPronoun` popup removed from the modal census.

Expected ch8 state confirmed on screen: three collapsed "Examples" accordions,
all seven example taps live, and the `c8_drill_translation_autos` hint (page 2,
`contentRef: threeUses`) mirroring the converted topic — which is correct, not
a stacking violation, because the accordions disclose IN the modal rather than
opening one over it.

## 2. Per-work-item wall clock (§5.2)

ROUND TOTAL: 2h26m (18:52 to 21:18 EDT, 2026-08-16).

Per-item figures are approximate, reconstructed from file mtimes and the
checkpoint boundaries rather than timed at the item. They are honest about
overlap: the long harness runs (`ui-behavior`, `ui-walk`, `ui-modals`) ran in
the background while later work continued, so the segments below are elapsed
wall clock over the round, not additive effort.

| Segment | Elapsed | Items |
| --- | --- | --- |
| 18:52-19:05 | 0:13 | W1 data + shape guard; W2 R1; W7 termList; W8 wordUsage (ch7 variant); W9 poolKind; W3 R2 accordions + Six Points + R6 Meanings |
| 19:05-19:20 | 0:15 | W4/W5/W6 — R3 pinned rows, R4 no stacking, R5 toggle, as one `Paradigm.svelte` restructure |
| 19:20-19:23 | 0:03 | Reading the mid-round correction and the amended spec sections |
| 19:23-19:49 | 0:26 | CORRECTION REWORK (pipeline defect, see §1) |
| 19:49-21:00 | 1:11 | W10 harness and checklist; visual verification; the two defects it found and their fixes; reconciling six existing harness assertions; full suite |
| 21:00-21:18 | 0:18 | Deliverables |

W4, W5 and W6 were taken as one item because all three rewrite the same control
row in the same component; splitting them would have meant three passes over
`Paradigm.svelte` with two intermediate states that never ship.

The largest single segment is W10, and most of it is not harness authoring: it
is looking at screens, which is where both defects in §4 and §6 were found.

## 3. What was built, item by item

**W1 — data in, guard green.** The eleven files were already in the working
copy. Verified: all eleven parse; the four ch9/ch10 vocabulary drills differ
from their committed copies by exactly the two inserted keys and nothing else
(JSON-level structural diff, not a text diff). `check-content-shapes.mjs`
learned `termList`, `wordUsage` and `poolKind`, and now also resolves a
`termList` item's `link` field against its own activity's popups — the existing
`[[link:id]]` scan could not see it, because the target is a field rather than
a run inside a string.

**W2 — R1.** `.popup-link` is `--teal-dark` with the underline kept. The
chapter-6 in-chart triggers DID share the class, so it was split: `.rc-sense-link`
keeps `--link` blue per §3.3. Verified at both ends (harness D4.1/D4.2). The
dead "link is blue" comment was replaced with why green is not a directive-8
violation. Numbers were already excluded by the data; verified, not re-fixed.

**W3 — R2, Six Points, R6.** `.rc-expander` lost its card frame and its ink
summary: green summary, left caret in the same green (both `::marker` and
`::-webkit-details-marker`, because older iOS WebKit ignores the former), no
underline. `summaryStyle: "green"` collapsed into the universal style; the
conditional class is gone and the key is harmless if it stays in data.
Accordion labels render through `stripMarkup` rather than `<Marked>`, so a C2
title drawn from rule text cannot carry the rule's `[[u]]`. Chapter 1's Six
Points now renders through the stepper's ordinary `content[]`; the bespoke
`sixPointsContent` card, its chevron, its open flag, its `slide` import and its
three CSS classes are all deleted. R6: `.pg-meanings-toggle` is green,
underlined, `display: list-item` (which is what restores the caret the old
`inline-block` suppressed), no margins.

**W4/W5/W6 — R3, R4, R5.** `Paradigm.svelte` was restructured once:

- the chart body moved into `.pg-body` and the say-all + navigation moved into
  one `.pg-controls` block, so a stack carrying both (ch8: say-all over a pair)
  pins as ONE surface rather than two competing sticky bars;
- a new `modalHost` prop makes the chart the dialog's body — `.pg-body` is the
  scroller and `.pg-controls` sits outside it, the same shape
  `.modal`/`.modal-scroll`/`.modal-actions` already uses;
- in main content the row is `position: sticky; bottom: 0`, pinned only when it
  actually carries navigation (§4.3 calls it a navigation surface; a Quick
  Review page's per-chart say-all is not one, and §4.6 keeps those in place);
- `endings` in a modal host is an in-place STATE, not a second modal; the
  heading names the state; the state carries its own say button in the say-all
  slot; NOTHING autoplays. `openEndings()` no longer plays on open. D-10's clip
  is still restored — behind the explicit tap, which is what D-10's own text
  required;
- main content keeps its single-level Endings modal (W5.4), which also loses
  the autoplay and gains the say button in its fixed footer;
- the CHART COUNT decides the control: two charts get one toggle on the say-all
  line whatever the declared `switch` kind (`named` labels it with the target
  chart's name, `moreBack` alternates More/Back); three or more get the centred
  pair, whatever the data spelled, because `named` is defined as the one-word
  contrast between a PAIR;
- `HINT_DISCLOSURE_REFS` is replaced by the structural rule: a bundle of
  exactly two paradigms renders the §4.1 toggle, three or more the §4.2 pair.
  The allowlist and the structural rule agree exactly on today's data;
- `ui.hintPages` at exactly two pages renders one alternating More/Back button
  in the pinned footer instead of a half-greyed pair;
- §4.5: `.hint-paradigm-controls.no-say` centres its remaining control instead
  of leaving it in the empty say-all row's right-hand slot.

`EndingsGrid.svelte` is new: the endings table has two hosts now, and two
copies of it is how the two would drift.

**W7 — termList.** Term on its own line in green, definition full width
beneath. A linked term takes `.popup-link` (green, underlined, tappable); an
unlinked one is plain green and inert. Measured, not asserted by class name:
every definition starts at the block's own left edge, beneath its term (D5.3).

**W8 — wordUsage.** Both source shapes, one block, each field drawn only when
present, mirroring `PopupSheet.svelte` field for field. ch7: blue Greek
headword tap, gloss and condition, then examples. ch8: a title line over the
examples. Examples identical in both: Greek tap, gloss, reference.

**W9 — poolKind.** `vocabularyPool` gains an explicit route. It only ever ADDS
a drill to the class, so no activity without the key can move. All eight
verified two-up at 390px and four-up at 820px, with a named non-vocabulary
authored grid held at two-up on both.

**W10 — harness.** `scripts/ui-disclosure.mjs` is new: 53 checks reading
computed styles and measured boxes, plus a screenshot pass over the visual
checklist's own screens so the checklist can be regenerated rather than
re-walked by hand. Five existing assertions were reconciled to the ratified
contracts; see §5.

## 4. Two defects found during visual verification, and fixed

Both are renderer defects surfaced by looking at real screens. Neither is a
data edit.

**4.1 Nested inline markup printed at the learner.** The chapter 4 and 5 Learn
Nouns Introductions author their C3 links as
`[[u]][[link:declensions]]declensions[[/link]][[/u]]`. `splitUnderline` matched
the outer emphasis pair and passed its inner text through unparsed, so all four
links rendered the literal string `[[link:declensions]]declensions[[/link]]` on
screen — and the unbreakable run pushed the paragraph 3px past the card at the
320px floor, which is how `ui-walk.mjs` caught it. The module's own header had
recorded "the spans never nest in shipped data" as a standing assumption; this
data pass nests them, and nesting is a legitimate way to author "an underlined
thing that is also a link". `splitUnderline` now recurses into a run's inner
text carrying the outer flags inward. `Marked.svelte` resolves `link` first,
which is right: a C3 link already draws its own underline (§3.2).

**4.2 The ch5 Review Definite Article restack shipped with no say-all at all.**
Reported as a data edit under §0.3 — see §6.

## 5. Existing harness assertions reconciled (all ratified reversals)

Five assertions in `ui-behavior.mjs` and `ui-modals.mjs` asserted the state
DISCLOSURE-RULES reverses. Each was rewritten to the new contract rather than
deleted, and each names what changed and why:

1. **§6.7 "only `.modal-scroll` may scroll"** — a chart hint's scroller is now
   `.pg-body`, because §4.3 puts the control row outside it. The rule (one
   scroller, and the overlay is not it) is unchanged; the element playing the
   part depends on what the dialog shows.
2. **5F §5 "authored vocabulary grid stays 2-up at both widths (D-32)"** — the
   exact inverse of W9. Rewritten to assert that all eight carry `poolKind` and
   join D-19, which is D-32 closed.
3. **P3.2 nav-pair census** — four surfaces left the list because they now
   disclose two states with a single toggle. None lost coverage: `ui-disclosure`
   D7/D10 assert the toggle AND the pair's absence.
4. **P3.3 labelled-stack subtitles** — steps by whichever control the stack
   draws instead of naming `[data-paradigm-switch="more"]`.
5. **P3.4 "the οὐ/οὐκ/οὐχ word is a popup link"** — reversed by §6.3/§7. It now
   asserts the popup route is ABSENT and that the words are ordinary audio taps
   inside three "Examples" accordions.
6. **`ui-modals.mjs` census** — `ch7-popup-ou` and `ch8-popup-autos-as-a-pronoun`
   removed with the popups they opened, with a comment recording where their
   coverage moved.

## 6. Standing data-edit report (§0.3)

ONE edit, to `src/data/chapt-05.json`, activity `c5_qr_article`.

BEFORE: the restacked Singular and Plural charts carried no say control, and
neither did the activity. The page rendered two charts and zero say-all
buttons, against W10's own acceptance line ("two charts, two say-alls").

AFTER: each chart carries
`"sayWhole": { "label": "Say Whole Paradigm", "audio": "chapt_5_e_artsg" }` and
`... "chapt_5_e_artpl"` respectively. The `_layout_note` was APPENDED with a
description of the edit, not replaced.

Nothing was chosen or invented. The pre-split chart in the committed copy
carried exactly these two clips as a `sayWholeEach` pair, one per column group,
in this order; the Learn page's Singular and Plural charts carry the same two
clips in the same pairing; the label is the string this chart already shipped
with; and the delivered `_layout_note` asks the implementer in as many words to
"verify the per-chart say control against the ch9 QR pattern", which is a
per-chart `sayWhole` on each half of an unnamed stacked pair. The split had
simply dropped both controls.

The file was re-serialized to make this edit. Verified byte-faithful: the
serializer round-trips the other delivered chapter files identically (modulo a
trailing newline, which was stripped to match).

## 7. Known gaps and things Nathanael should know

**7.1 `npm run check:docs` fails on 47 documents, and did before this round.**
Not a document loss. `scripts/check-doc-integrity.mjs` compares section
headings between `git show HEAD:` (LF) and the working tree (CRLF), and its
heading normalizer is `l.replace(/\s*\(.*$/, '')` — in JavaScript, `.` does not
match `\r` and `$` without `/m` anchors at end of INPUT, so a heading with a
trailing parenthetical never has it stripped on a CRLF checkout while the HEAD
copy does. Every "section lost" it reports is a heading whose parenthetical was
stripped on one side only. No document in `buildout/` was modified by this
round except the three new deliverables. The pre-commit hook path is unaffected
because `--staged` reads the index, which is LF. Left alone as out of scope;
flagged because `npm run verify` includes it.

**7.2 Only ONE chart in the whole app carries an `endings` table** — chapter
3's λύω Paradigm. W5.1 anticipates "the ch3 x3, ch4 x2, ch5 x3 drill hints
whose hintRefs resolve to charts carrying `endings`"; in the delivered data
that qualifier selects the three chapter-3 drills only. The ch4 and ch5 hints
are "as ch3" in the other senses (one modal, pinned row, no autoplay, in-place
switching) and their in-place control is the chart toggle rather than
Paradigm/Endings. The Paradigm/Endings code path is general and will serve any
future chart that ships `endings`.

**7.3 `.rc-word-popup` and `.rc-num-popup` are now dead paths.** No data uses
`numberPopupRef` any more. The branches are left in `RichContent.svelte`
because removing them is a separate decision from this round's, and P3.4 now
asserts they render nothing.

## 8. VERIFY items (§5.2, §5.4)

**8.1 The Say Endings label (W5.2, explicitly a VERIFY decision).** The
replaced state's say button reads **"Say Endings"**. Observation, since the
spec asks for one: against the model screens it reads correctly but not
obviously — the chart it sits under is titled "Endings" once the state is open,
so the button says the same word the heading does. The alternative that reads
best on screen is "Say Whole Paradigm", matching the other state's button
exactly and letting the heading carry the difference; "Say Endings" is
better only if the distinction between hearing the full forms and hearing the
bare morphemes is worth naming. It is a one-string change (`endingsSayLabel` in
`Paradigm.svelte`, or a `sayLabel` on the chart's `endings` object, which the
renderer already reads). Recommendation: keep "Say Endings" — the clip really
is the endings, and D-10's clip being distinct from the paradigm clip is the
whole reason it needed a button of its own.

**8.2 Items for VERIFY-DISCLOSURE.md** (to be authored by the winning model
after any XPATCH), all JUDGEMENT rather than fact:

- the iPhone look of the borderless accordion restyle, especially six of them
  stacked down a C2 rule list;
- the pinned rows against real WebKit — the Chrome computed-style and
  bounding-box checks in `ui-disclosure.mjs` D8 are not adequate for iOS
  sticky/flex behaviour;
- the centred no-say toggle on the εἰμί hint;
- the ch5 Review Definite Article restack, including whether the restored
  per-chart say-all is in the right place;
- whether the ch1 Capitals Note reads well at its restored length;
- Say Endings: keep or rename (§8.1);
- airplane-mode pass on device.

## 9. Divergence-log entries to cite (§6)

- D-31 amended: number-marker popups retired; οὐ/οὐκ/οὐχ is C2. Implemented;
  `numberPopupRef` is unused in all ten chapters.
- D-38 amended: modal More/Back fixed to the footer; slot rule unchanged.
- D-32 CLOSED by W9: `poolKind: "vocabulary"` is the marker Stage 8.8 owed, and
  the eight authored vocabulary drills now join D-19.
- D-10 preserved and relocated: the endings clip stays restored, moved from
  "plays on open" to an explicit say button.
- New entry: DISCLOSURE-RULES adoption — supersedes per-case disclosure
  decisions; nested modals abolished; Endings autoplay removed in favour of an
  explicit say button.
- Worth a new entry: inline markup spans NEST as of this data pass
  (`[[u]][[link:id]]…[[/link]][[/u]]`), and `splitUnderline` now recurses. The
  module's previous "spans never nest" assumption is void (§4.1).
