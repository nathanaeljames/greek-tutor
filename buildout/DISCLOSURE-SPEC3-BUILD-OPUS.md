# DISCLOSURE-SPEC3-BUILD-OPUS

Cumulative build record for DISCLOSURE-SPEC3 (§0). Checkpointed after each work
item; this is its final state.

- Implementer: Opus (claude-opus-5)
- Base: repo head `967d47c` (the spec, the two amended rules files and the two
  delivered data files), on `e294683` (DISCLOSURE-SPEC2 merged)
- Date: 2026-08-25
- Version control: NONE run. Read-only `git show` / `git diff` / `git status`
  only. No commit, no stage, no push.

## 0. New files (untracked; listed verbatim)

| Path | What it is |
| --- | --- |
| `scripts/shots-disclosure3.mjs` | The checklist's own screenshot pass — one screen per checklist row, with the W7 rows taken at 390x520 so the modal content is forced to scroll. Separate from `ui-disclosure --shots`, which photographs what the assertions look at rather than what Nathanael is asked to look at. |
| `buildout/DISCLOSURE-SPEC3-RESULTS-OPUS.md` | Deliverable. |
| `buildout/DISCLOSURE-SPEC3-BUILD-OPUS.md` | This file. |
| `buildout/DISCLOSURE-VISUAL-CHECKLIST3-OPUS.md` | Deliverable. |
| `buildout/screenshots/disclosure3-opus/` | 30 PNGs, the checklist's evidence. |
| `buildout/screenshots/disclosure3-harness/` | The harness's own `--shots` pass. |
| `buildout/screenshots/disclosure3-w8/` | The W8 addendum's before/after pair, three screens each. The "before" state no longer exists to be regenerated, which is why this directory is kept rather than folded into the pass above. |

Harness runs also write `buildout/screenshots/modals-*/` and
`buildout/screenshots/walk-*/`. Those from this round were deleted after their
results were read: they are regenerable from the scripts, they are large, and
the two directories above are the round's evidence.

**No new renderer file, and no renderer change at all for W8.** Every change
this round landed in a file that already existed, which is itself worth
recording: the round's biggest change (W7) was a convergence, and a convergence
that needed a new component would not have been one. W8 likewise turned out to
need no code — the `hintCharts` register and the one-chart resolution path were
already there, so the addendum is a data edit plus a harness block.

## 1. Work-item checkpoint log

| # | Item | Build state at checkpoint |
| --- | --- | --- |
| W1 | Data verification: structural JSON diff of `chapt-07.json` and `chapt-08.json` against `e294683` | 5 differences total, all named by §1; no third file arrived |
| W2 | Initial load, DRILL-BEHAVIOR-RULES B-last | 219-activity census; 13 changed, 4 exempted; build green |
| W3 | The keyboard's Shift key | build green; measured at 320 and 390 |
| W4 | The half-screen modal bug | build green; clamp + four triggers + measure-at-modal-open |
| W5 | Green-underline exclusivity | app-wide audit run BEFORE the fix (3 hosts found), then after (0) |
| W6 | Title links go green | one declaration deleted; build green |
| W7 | One divider owner | measured across 15 modals x 2 heights before and after |
| W8 | ch5 hint chart uncollapse | BLOCKED on data at the round's close; nothing built, nothing invented |
| -- | Harness: D13 rewritten and extended to the three non-hint modals; D16/D17/D18/D19 added; W1/W2/W3 blocks added to ui-behavior; one SPEC1 assertion adjusted | full suite green |
| -- | Final confirmation run of all six suites on a clean rebuild | 902 + 195 + 155 + 73 + walk + offline, all green |
| -- | Deliverables | -- |
| W8 | **ADDENDUM**: `ch5railwalk.pdf` arrives; the hint chart is transcribed and both ch5 drills re-pointed at it | `check:shapes` PASS, build green, `ui-disclosure` 206/206 |

## 2. Verification at final state

| Gate | Result |
| --- | --- |
| `npm run check:shapes` | PASS |
| `npm run build` | green |
| `npm run check:lazy-chunk` | PASS |
| `node scripts/ui-disclosure.mjs` | 206/206 (117 at base, +89; D20 added with the W8 addendum) |
| `node scripts/ui-behavior.mjs` | 902/902 (861 at base, +41) |
| `node scripts/ui-modals.mjs` | 155/155 modal states clean, 0 BAD |
| `node scripts/ui-smoke-5f.mjs` | 73/73 |
| `node scripts/ui-walk.mjs` | 105 stops x 2 widths, no overflow, no console errors |
| `node scripts/ui-offline.mjs` | 44 stops offline, 0 missing, refresh OK |
| `npm run check:docs` | FAILS — pre-existing, see RESULTS §0 |

## 3. Cumulative diff — renderer and harness

The two files delivered with the spec are NOT in this diff: they arrived
committed at `967d47c` and were verified, not edited (RESULTS §1).
`chapt-05.json` IS in it — that is the W8 addendum, the round's only data edit,
made under §0.3 with its before/after in RESULTS §8.2.

```
 scripts/ui-behavior.mjs                  | 374 ++++++++++++++++++-
 scripts/ui-disclosure.mjs                | 604 ++++++++++++++++++++++++++++---
 src/app.css                              | 215 ++++++++---
 src/components/ContentAudio.svelte       |  85 ++++-
 src/components/Paradigm.svelte           |  11 +-
 src/components/RichContent.svelte        |  12 +-
 src/components/SpellActivity.svelte      |   6 +-
 src/components/SpellVerseActivity.svelte |   6 +-
 src/components/SpellerKeyboard.svelte    |  78 +++-
 src/data/chapt-05.json                   |  98 ++++-
 src/lib/answer-check.js                  |  17 +-
 src/lib/audio.js                         |  68 +++-
 src/lib/viewport.js                      | 103 +++++-
 13 files changed, 1539 insertions(+), 138 deletions(-)
```

### 3.1 What each file was for

| File | Work item | The change in one line |
| --- | --- | --- |
| `src/components/ContentAudio.svelte` | W2 | `maybeInitialLoad` + the four begin screens retired; `onStep` takes the player as a parameter so the mount clip can be the guarded one |
| `src/lib/audio.js` | W2.4 | `playOnLoad`: a blocked autoplay is silent and the clip is held for the first gesture |
| `src/components/SpellerKeyboard.svelte` | W3 | `CAPITALS` + `capitalOf` + `greekForKey`; the one-shot `shifted` state; the bottom row |
| `src/components/SpellActivity.svelte`, `SpellVerseActivity.svelte` | W3.4 | `KEYMAP[key.toLowerCase()]` -> `greekForKey(key)` — three lines each, one table |
| `src/lib/answer-check.js` | W3.1 | Comment only. It said the keyboard has no capitals and never will; now it says why folding still holds after it got some |
| `src/lib/viewport.js` | W4 | The clamp, three resume triggers, and the modal-open measurement in the observer it already had |
| `src/components/RichContent.svelte` | W5.1 | The `head-underline` class binding deleted |
| `src/app.css` | W5, W6, W7, W3 | The green-`u` rule; `.topic-title-link`'s colour override deleted; the one divider owner; the shift key |
| `src/components/Paradigm.svelte` | W7.1 | `.pg-body` also carries `.modal-scroll` in a modal — one scroller name, so one selector can own the divider |
| `src/data/chapt-05.json` | W8 (addendum) | `hintCharts.firstDeclensionHint` added; the two ch5 drills' `hintRef` re-pointed at it. Three structural changes, nothing else |
| `scripts/ui-disclosure.mjs` | W5, W6, W7, W4, W1, W8 | D13 rewritten; D16, D17, D18, D19 added; D20 added with the addendum |
| `scripts/ui-behavior.mjs` | W2, W3, W1 | Three new blocks; one SPEC1 assertion adjusted for the new start state |

## 4. The two things a reader should look at first

**`src/app.css`, the "THE ONE DIVIDER" block.** W7 is the round's only
structural change and it is a deletion: `.modal-actions`' `border-top` and
`.pg-controls`' `border-top` are both gone and the scroller's `border-bottom`
replaces them. Everything else in that block exists to stop something else
contributing to the two strips — the paradigm's 2px bottom margin, the control
rows' 10-12px top margins, the last content block's escaping bottom margin, and
a `padding` shorthand in a `max-height` media query that was silently
overriding the strip below the line on every short viewport.

**`src/data/chapt-05.json`, `hintCharts.firstDeclensionHint`.** The W8
addendum, and the smallest change in the round with the largest comment on it.
Read its `_note` before touching it: those five rows are the same table the
Learn page's Meanings popup prints, so they look like duplicate data and are
not — they are two screens of the original that happen to share a body, and
collapsing them is the defect item 6 reported.

**`src/components/ContentAudio.svelte`, `maybeInitialLoad`.** W2 is four lines
of behaviour and a page of reasoning: the rule is "as if Next had been pressed
once", so the function calls the same `onStep` the Next button calls rather
than declaring an audio policy of its own. That is why the ledger rows did not
have to be read at runtime, and why a future change to what a step pronounces
moves the mount clip with it.
