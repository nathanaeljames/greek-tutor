# 5B-PATCH-MERGE-SPEC.md — port Sol pieces onto the Opus 4.8 base

Base to accept: the **Opus 4.8** 5B-patch working tree.
Handoff to update: `HANDOFF-5B-OPUS.md` (append §9.6, see below).

Four surgical ports plus three VERIFY items. No data edits. No refactors.
Everything else in the Opus base stands as-is — in particular its
`markClusters()` whole-cluster red mark and its `isSyllableMatrix` row-label
change are CORRECT and must not be reverted.

## Patch 1: Lock finalized items on revisit (score integrity)

**Problem.** `DivideActivity.svelte` and `PlaceAccentActivity.svelte` still call
`resetItem()` / `resetWord()` from `move()`. Under `attemptsPerItem: 1` an
already-finalized item therefore re-opens when the learner navigates back, and
`attempts += 1` fires again — inflating the score denominator and letting a
wrong answer be retried. This contradicts the policy the same component
implements.

**Fix (both components, same shape).** Replace the reset-on-move with a
restore-on-move backed by a results map.

In `DivideActivity.svelte`, add alongside the existing `attemptedItems` set:

```js
  const results = new Map();
```

In `check()`, inside the existing `if (right || oneAttempt) { ... }` block and
before the `clearTimeout(advanceTimer)` line, record the finalized state:

```js
      results.set(itemIndex, {
        selected: [...selected],
        oneSyllable,
        feedback,
        feedbackKind,
        correct: right
      });
```

Replace `resetItem()` with:

```js
  function restoreItem() {
    const result = results.get(itemIndex);
    if (result) {
      selected = new Set(result.selected);
      oneSyllable = result.oneSyllable;
      feedback = result.feedback;
      feedbackKind = result.feedbackKind;
      answered = true;
      return;
    }
    selected = new Set();
    oneSyllable = false;
    feedback = '';
    feedbackKind = '';
    answered = false;
    showAnswer = false;
  }
```

and change the call site inside `move()` from `resetItem()` to `restoreItem()`.

Do NOT set `showAnswer` in the restore path — the Opus base derives the reveal
from `revealed = answered && oneAttempt`, which already re-derives correctly and
keeps the user's Show Answer checkbox under user control. Preserve that.

Apply the identical change to `PlaceAccentActivity.svelte` using
`accentType` / `accentPosition` in place of `selected` / `oneSyllable`, keyed on
`wordIndex`, replacing `resetWord()` with `restoreWord()`.

**Acceptance.** Answer item 1 wrong, manual Next, manual Previous: item 1 is
still finalized, its Check Answer is disabled, the revealed form is still shown,
and Score still reads 1 attempt — not 2.

## Patch 2: Root word is inert, not a tap target (fidelity)

**Problem.** `PlaceAccentActivity.svelte` renders the root word as a
`greek-say` button playing `word.audio`. Verified against `chapt-02.json`:
`audio` is `chapt_2_b_ex2_N`, indexed to the **inflected** `answerForm`, not the
root. All ten Βαπτίζω items share one root but carry ten different clips, so
tapping the root plays the wrong word. Directive 1 (fidelity) and directive 9
(displayed Greek plays ITS audio).

**Fix.** Replace the root-word button with an inert span:

```svelte
        <span class="accent-root-word greek">{word.root}</span>
```

Remove `.accent-root-word` from the universal `touch-action` selector list in
`app.css` (it is no longer interactive), and change its color from
`var(--link)` to `var(--ink)` so it does not read as tappable under directive 8.
Leave `.accent-root-word:active` removed.

The item's own audio remains reachable through the existing "Pronounce Each
Exercise" checkbox, which plays `word.audio` against the inflected form — the
form that clip actually belongs to.

**Acceptance.** Root word renders ink-colored and does not respond to tap;
computed color is not `rgb(22, 99, 199)`.

## Patch 3: Responsive accent-slot sizing at 320px

**Problem.** `.accent-slot span` is a fixed `1.5rem`. The longest answer form in
the pool, `ἐβαπτίσθημεν`, is 12 grapheme clusters; at 320px each slot gets about
26px of width while the glyph stays 24px plus 2x2px padding, so the row is at
risk of overflow — and overflow CLIPS in this app. The Opus base asserted 320px
on the charts but not on the longest position row.

**Fix.** In `PlaceAccentActivity.svelte`, add a derived size on the slots
container:

```svelte
    <div
      class="accent-slots"
      style={`--accent-size:${Math.max(14, Math.min(24, 230 / Math.max(answer.displayClusters.length, 1)))}px`}
      aria-label="Choose accent position">
```

In `app.css`:

```css
.accent-slot span { font-size: var(--accent-size, 1.5rem); }
.accent-slot + .accent-slot { margin-left: 2px; }
```

**Acceptance.** Accent Placement item 2 (`ἐβαπτίσθημεν`, 12 slots) renders every
slot fully at 320px with `scrollWidth` 320; short forms are visually unchanged.

## Patch 4: Progress survives route exit during the auto-advance window

**Problem.** In `SelectActivity.svelte`, completion is recorded inside
`advance()`, which for a one-attempt drill only runs after the 4000ms timer.
Leaving the route within that window cancels the timer, so answering the final
item does not record completion.

**Fix.** In `choose()`, inside the existing `if (right || oneAttempt) { ... }`
block, record completion for the final item at answer time:

```js
      // Completion is defined by attempted items, so record the final item when
      // it is ANSWERED. Route exit cancels the timer, not progress.
      if (oneAttempt && qIndex === questions.length - 1 && activity.id) markCompleted(activity.id);
```

Leave the existing `advance()` completion path in place for the retry drills.
Double-marking is idempotent.

**Acceptance.** Answer the final Part of Speech item, immediately navigate away
before 4s: the activity shows completed on the chapter map.

## Out of scope

- No data file edits.
- Do NOT revert `markClusters()` to per-mark coloring (see V1).
- Do NOT revert the `isSyllableMatrix` row-label change — it is what makes the
  Accent Possibilities chart render its cells at all.
- No changes to `.grid.options.single`, `stripMarkup` coverage, `Marked.svelte`,
  or `markup.js`.
- Do not add the missing `ui.buttons` controls (see V2/V3) — they need a
  decision first.

## Handoff update

Append to `HANDOFF-5B-OPUS.md`:

```markdown
### 9.6 Merge ports from the parallel Sol run (5B-PATCH-MERGE-SPEC)

1. **Revisit lock** — DivideActivity and PlaceAccentActivity now restore a
   finalized item's recorded state on manual navigation instead of resetting it.
   Under attemptsPerItem: 1 an answered item stays answered and cannot inflate
   the attempt count.
2. **Root word inert** — the Accent Placement root header no longer plays audio.
   The item's `audio` belongs to the inflected `answerForm`, not the root, so
   the tap was playing the wrong clip. Root renders ink; the inflected form's
   clip remains reachable via Pronounce Each Exercise.
3. **Responsive accent slots** — slot glyph size is derived from cluster count
   so the 12-cluster forms fit at 320px.
4. **Completion at answer time** — one-attempt select drills record completion
   when the final item is answered rather than after the auto-advance timer, so
   leaving the route inside the 4s window no longer loses progress.

Retained from the Opus base and explicitly NOT reverted: whole-cluster red mark
(`markClusters`), the `isSyllableMatrix` row-label allowance, `stripMarkup`
coverage, and the `single` option-grid class.
```

Record acceptance results (chapt-01 hash unchanged, both rails green, the four
acceptance checks above) inline in that section.

## VERIFY items for Nathanael (DOSBox / device)

- **V1 — red mark rendering.** Open Marking Recognition on device. Item 3
  (Μωϋσῆς, combining diaeresis) and the λόγος; item (standalone punctuation).
  Confirm the asked-about mark is visibly RED in both cases. This decides a
  direct disagreement between the two implementers: Opus reports that colouring
  only the combining mark fails to paint (shaping carries the base run's colour
  across the inline boundary) and shipped the spec's whole-cluster fallback; Sol
  reported per-mark colouring working, evidenced only by computed style. The
  shipped base uses the whole-cluster fallback, which is sanctioned either way —
  V1 confirms it looks right, and settles the technique for chapters 3+.
  RESPONSE: the current version shows the accent AND letter in red, let's confirm this definitively because if we can isolate the accent only to be colored that is much preferred.
- **V2 — Syllable Counting one-syllable bar.** In the original, does the drill
  show number buttons 1-4 AND a separate "Click Here If There Is Only One
  Syllable" bar, or does the bar replace the "1" button? The shipped base shows
  both (option "1" appears as a tile and as the bar).
  RESPONSE: No, the original does not have it for this exercise please remove it
- **V3 — Pronounce Word.** `c2_ex_accent_placement.ui.buttons` lists "Pronounce
  Word", which is not implemented. Does the original have a per-word pronounce
  button distinct from the Pronounce Each checkbox, and which form does it
  speak — the root or the inflected form?
  RESPONSE: No idea what you're talking about - which exercise? Most exercises with a "pronounce each" checkbox also have a "pronounce" button which pronounces the same exact thing as pronounce each pronounces
