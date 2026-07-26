# 5B-MERGE-SPEC.md -- Port Opus improvements into the Sol base

Base: GPT Sol Ultra 5B working tree (accepted).
Purpose: Five targeted patches from the Opus 4.8 run that improve
architecture, robustness, or UX without touching the accepted surfaces.

Handoff source: HANDOFF-5B-SOL.md (the accepted base handoff).

## Patch 1: Static speller tiles (replaces cross-chunk loadChapter)

**Problem:** The Sol base resolves `spellerTilesRef` by calling
`loadChapter("chapt_1")` at route-gate time inside `loadChapter("chapt_2")`.
This works but adds runtime coupling: a direct chapter-2 speller route
triggers a chapter-1 chunk fetch, and the dependency-scanning loop in
`loadChapter` adds complexity.

**Fix:**
1. Create `src/data/speller-tiles.json` containing the 39-tile keyboard
   contract (25 letters + 11 diacritics + 3 composites). Copy the exact
   inventory from `chapt-01.json`'s `spellerTiles` block.
2. In `src/lib/content.js`:
   - Add `import spellerTiles from '../data/speller-tiles.json';`
   - Add `export function getSpellerTiles(_ref) { return spellerTiles; }`
   - Remove the `spellerTilesRef` dependency-resolution loop inside
     `loadChapter()` (the `refs` Set, the section scan, and the
     `Promise.all([...refs].map(loadChapter))` call).
3. In `src/components/SpellActivity.svelte`:
   - Replace `import { getChapter, getLemma, ... }` with
     `import { getSpellerTiles, getLemma, ... }`.
   - Replace the `tileChapter` / `referencedTiles` resolution block with:
     ```js
     const tiles = activity.spellerTiles
       || (activity.spellerTilesRef ? getSpellerTiles(activity.spellerTilesRef) : {});
     ```
   - Keep the existing `fallbackLetters` guard for `chapter.alphabet`.

**Acceptance:** `npm run verify` passes; direct-load `#/activity/chapt_2/c2_ex_speller`
renders 39 tiles without triggering a chapter-1 chunk fetch.

## Patch 2: Precise self-numbering heuristic

**Problem:** The Sol base applies `authored-labels` class when ANY item
has a `.label`, which matches chapter-1's named labels ("Final Sigma") and
drops list-style on those too. Only numeric markers should trigger this.

**Fix:** In `src/components/RichContent.svelte`, replace:
```js
class:authored-labels={b.items.some(item => item.label)}
```
with:
```js
{@const selfNum = (() => { const re = /^\(?\d+[.)]/; return b.items.length > 0 && b.items.every(it => it.label && re.test(it.label)); })()}
```
```svelte
<ol class="rc-list" class:authored-labels={selfNum}>
```
When `selfNum` is true, render the label in a `<span class="rc-num">` instead
of `<span class="rc-lead">`, and use a space separator instead of ` -- `.

In `src/app.css`, add:
```css
.rc-num { font-weight: 600; margin-right: 0.15em; }
```

**Acceptance:** Chapter-1's "Final Sigma" / "Nasal Gamma" items retain their
`rc-lead` underline and the `<ol>` auto-number. Chapter-2's "1)" items
render with the explicit marker and no duplicate auto-number.

## Patch 3: String-reconstruction answer check in PlaceAccent

**Problem:** The Sol base compares accent type and position index
separately. This works for the current data but is fragile: if a word has
multiple valid accent positions for the same type (unlikely but possible in
future data), the position-index comparison could yield false positives.

**Fix:** In `src/components/PlaceAccentActivity.svelte`, change the `check()`
function to reconstruct the full string:
```js
function check() {
  if (pending || answered || accentType == null || accentPosition == null) return;
  const ACCENTS = { Acute: '\u0301', Grave: '\u0300', Circumflex: '\u0342' };
  const clusters = splitGraphemes(answer.display);
  clusters[accentPosition] = (clusters[accentPosition] + ACCENTS[accentType]).normalize('NFC');
  const candidate = clusters.join('').normalize('NFC');
  const ok = candidate === word.answerForm.normalize('NFC');
  attempts += 1;
  if (ok) {
    correct += 1;
    completedWords.add(wordIndex);
    feedback = randomFeedback(chapter, 'correct');
    feedbackKind = 'ok';
    answered = true;
    if (completedWords.size === words.length) markCompleted(activity.id);
  } else {
    feedback = randomFeedback(chapter, 'incorrect');
    feedbackKind = 'bad';
  }
}
```
Import `splitGraphemes` from `../lib/greek.js` (already available from the
Sol base).

**Acceptance:** placeAccent item 1 (aggelos, Acute@pos1) still scores
correct; an intentionally wrong pick scores incorrect.

## Patch 4: LEMMA_BUCKETS abstraction in content.js

**Problem:** The Sol base's `getLemma` explicitly walks three bucket names
inline. Adding a fourth bucket later means editing every call path.

**Fix:** In `src/lib/content.js`, extract:
```js
const LEMMA_BUCKETS = ['lemmas', 'exampleWords', 'ch1_lemma_mirror'];
function lemmaFromLexicon(lex, ref) {
  if (!lex) return null;
  for (const bucket of LEMMA_BUCKETS) {
    if (lex[bucket] && lex[bucket][ref]) return lex[bucket][ref];
  }
  return null;
}
```
Then simplify `getLemma(ref, chapterId, pool)`:
- The `pool` override stays as-is (it handles `item.pool` lookups).
- After the pool check, call `lemmaFromLexicon(lex, ref)` instead of the
  inline bucket walk.
- The fallback loop across all registries also uses `lemmaFromLexicon`.

**Acceptance:** No behavioral change; `npm run verify` passes.

## Patch 5: Auto-advance on correct answer

**Problem:** The Sol base's PlaceAccent and Divide components do not
auto-advance after a correct answer. The original application advances
automatically.

**Fix:** In both `PlaceAccentActivity.svelte` and `DivideActivity.svelte`,
after setting `answered = true` (or the equivalent correct-answer path), add:
```js
clearTimeout(advanceTimer);
advanceTimer = setTimeout(() => move(1), 900);
```
Add `let advanceTimer = null;` to the component state. Clear on manual
Previous/Next and on unmount.

**Acceptance:** Correct answer in placeAccent auto-advances after ~1 second;
manual Next still works immediately.

## Out of scope

- No data file changes.
- No new components.
- No CSS layout changes beyond the `rc-num` class addition.
- No changes to the build guard, emoji cleanup, touch-action, or AGENTS.md
  (all already handled by the Sol base).

## Handoff update

After all five patches land, append the following section to
`HANDOFF-5B-SOL.md`:

```markdown
## 8. Post-merge patches (5B-MERGE-SPEC)

Five targeted improvements ported from a parallel Opus 4.8 implementation:

1. **Static speller tiles** -- `spellerTilesRef` now resolves via a static
   `src/data/speller-tiles.json` file and `getSpellerTiles()`, replacing the
   cross-chunk `loadChapter` dependency resolution. No runtime coupling
   between chapter lazy chunks.
2. **Precise self-numbering** -- The `authored-labels` heuristic now uses a
   `/^\(?\d+[.)]/` regex so only numeric markers suppress `<ol>` auto-
   numbering. Chapter-1's named labels ("Final Sigma") are unaffected.
3. **String-reconstruction answer check** -- PlaceAccent's `check()` now
   reconstructs the full accented string and NFC-compares to `answerForm`
   instead of comparing type + position separately.
4. **LEMMA_BUCKETS abstraction** -- `getLemma` delegates to a shared
   `lemmaFromLexicon()` helper with a `LEMMA_BUCKETS` array, making future
   bucket additions a one-line change.
5. **Auto-advance on correct** -- PlaceAccent and Divide auto-advance to the
   next item ~900ms after a correct answer, matching the original's behavior.

No data files, build guard, emoji cleanup, touch-action extensions, or
AGENTS.md were changed by these patches.
```

Record acceptance results (build hash, rail walk confirmation) inline in that
same section.
