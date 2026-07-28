# 5B-XPATCH1.md — port Sol pieces onto the Opus 5 base

Base accepted: the **Opus 5** 5B-SPEC2 working tree (`14dfc3e` + its diff).
Target environment: Claude Code, same worktree that produced
`5B-SPEC2-RESULTS-OPUS.md`.
Deliverable: no BUILD document. Append an XPATCH section to
`5B-SPEC2-RESULTS-OPUS.md` (shape given in §6 below).

Four items. Two are code, two are verification gaps that must be closed
before this tree ships. Nothing else in the Opus base changes — in
particular `markOverlayParts()`, `check-content-shapes.mjs`, the injected-
stylesheet blue probe, the measured divide sizing, and the expander dedupe
all stand as shipped.

## 1. Non-audio defList rows become static elements, not buttons

**Why.** The Opus base fixed feedback item 11 by giving `.rc-defrow` an
explicit colour so WebKit's unstyled-button blue loses. That is correct and
it works. But the row is still a `<button>` when it has no audio, so every
Grammar Review term remains a focusable, screen-reader-announced control
that does nothing. The parallel Sol run converted those rows to static
elements instead, which removes the UA-blue vector at its source and fixes
the semantics at the same time. Keep the Opus colour rules AND take the
structural change — they are complementary, not alternatives.

**Change.** In `src/components/RichContent.svelte`, at BOTH defList render
sites (the `numbered` item's nested `it.defList`, and the top-level
`defList` block), split the current two-branch structure into three:

```svelte
{#if isLettersList(row[1])}
  <div class="rc-defrow letters-row" class:no-term={!row[0]}>
    ...unchanged...
  </div>
{:else if row[2]}
  <button class="rc-defrow tappable" class:no-term={!row[0]} on:click={() => playAudio(row[2])}>
    <span class="rc-term greek"><Marked text={row[0]} /></span>
    <span class="rc-val greek"><Marked text={row[1]} /></span>
  </button>
{:else}
  <div class="rc-defrow static" class:no-term={!row[0]}>
    <span class="rc-term greek"><Marked text={row[0]} /></span>
    <span class="rc-val greek"><Marked text={row[1]} /></span>
  </div>
{/if}
```

Note the audio branch now keys off `row[2]` directly rather than
`class:tappable={row[2]}` on an always-button.

In `src/app.css`, add beside the existing `.rc-defrow` rules:

```css
.rc-defrow.static { color: var(--ink); cursor: default; }
```

Keep every existing Opus rule, including `.rc-term { color: var(--accent-ink); }`
and the explicit `.rc-defrow` / `.rc-example` colours. Do not remove the
`.rc-deflist.termless` handling.

**Acceptance.**
- Grammar Review "Identifying Verbs" renders its six terms; none of them is a
  `<button>` in the DOM (`document.querySelectorAll('.rc-defrow.static button')`
  is empty and the rows themselves are `DIV`).
- A defList row that DOES carry audio is still a button and still plays.
- Under the injected `button { color: #007aff }` probe already in the harness,
  the deep sweep still reports no non-tappable blue.
- Tab order through a Grammar Review topic no longer stops on the term rows.

## 2. Do not redden a target cluster that contains no mark

**Why.** `c2_drill_marking_recognition` item `φαρισαῖος` carries
`redMarkCluster: 6`, but cluster 6 is a bare `α` (the circumflex is on 7).
Both implementers found this and correctly refused to fix the data. The
Opus base then applies the whole-cluster fallback, so a plain alpha renders
red — a learner reading that prompt is told the answer is "Circumflex" while
the red sits on a letter with no mark. The spec's fallback (C5) is scoped to
"if the overlay technique fails on some cluster shapes"; a bad authored index
is not that case. The Sol run rendered the item unmarked instead, which is
the safer failure: absent signal rather than false signal.

**Change.** In `src/lib/greek.js`, in `markOverlayParts()`, when the target
cluster is located but contains no combining mark (and is not itself a
standalone mark glyph), emit the cluster as a PLAIN run rather than as a
`{ text, red }` fallback part. The six by-design whole-cluster cases
(`᾽`, `·`, `;` — where the cluster IS the mark) must be unaffected: those
have no base to separate from and must keep reddening whole.

Concretely, the fallback should fire only when `spacingMarks(cluster)` is
non-empty. If the cluster has no marks at all, return it unhighlighted.

**Acceptance.**
- `markOverlayParts` over the real Marking Recognition pool: 18 overlay,
  6 whole-cluster (the punctuation items), 1 plain (`φαρισαῖος`), 0 red on a
  mark-less cluster.
- `φαρισαῖος` renders with no red anywhere in the prompt.
- `δι᾽ αὐτοῦ`, `λόγος·`, `λόγος;` still redden their mark cluster whole.
- `Ἠσαΐας`, `Ἀχαΐα`, `τοὔνομα` still redden only the named mark.

## 3. Offline preview regression — MUST run before ship

**Why.** Standing directive 4: "offline behaviour never regresses; every
phase ends with an airplane-mode check (Nathanael's device pass; you run the
preview equivalent)." Neither `5B-SPEC2-BUILD-OPUS.md` nor
`5B-SPEC2-RESULTS-OPUS.md` contains any offline check — the production-preview
walk was run with the service worker in control but online, which is a
different claim. The parallel Sol run did close this and found nothing
alarming, which is reassuring but is not evidence about this tree.

**Run, do not change code.** Against the built preview with the service
worker installed and in control:

1. Force the browser offline (`Network.emulateNetworkConditions` with
   `offline: true`, or the equivalent in the existing harness).
2. Hard-refresh on an ACTIVITY route and confirm it renders under SW control.
3. Full chapter-2 rail walk, 20/20 plus the end-of-chapter dialog.
4. Full chapter-1 rail walk, 26/26 plus its end dialog.
5. Record console output, separating expected missing-audio resource errors
   (the Sol run logged 11 caught `net::ERR_INTERNET_DISCONNECTED` entries
   from pronounce-each surfaces hitting absent IDB audio — pre-existing,
   frozen-code behaviour) from any unexpected exception.

**Acceptance.** Both rails complete offline, both end dialogs reachable, zero
unexpected exceptions. If anything fails, STOP and report rather than fixing
audio code — the 4.5 audio architecture is frozen.

## 4. Chapter-1 regression at tablet width

**Why.** Spec E asks for the rail walks "at 320px AND a tablet width
(~768px)". The Opus base ran chapter 2 at both widths but chapter 1 at 320px
only. This round changed shared components (`RichContent`, `SelectActivity`,
`Marked`, `app.css`), so the chapter-1 tablet case is genuinely unverified.

**Run, do not change code.** Chapter-1 full rail walk at 768px under the
existing harness, including the injected-stylesheet blue probe and the
overflow/clipping check.

**Acceptance.** 26/26 plus end dialog, zero console errors, no horizontal
overflow, no non-tappable blue.

## 5. Out of scope for this patch

- Do NOT port Sol's per-mark-family overlay offsets (`left: 31%` for
  breathings, `left: 54%` default, and the three others). They are hand-tuned
  against macOS Chrome with no stated measurement procedure, whereas the Opus
  offset was read off a six-offset comparison grid against the precomposed
  glyph. Five knobs are worse than one to re-tune on device. This goes to
  VERIFY2 instead (item V2-1 below), not into the code.
- Do NOT reorder the `.greek` font stack. The in-word circumflex tilde is
  real and documented in RESULTS 5.5, but it changes the Greek face on
  device-verified chapter 1 and is Nathanael's call.
- Do NOT touch `src/data/*.json`. The `φαρισαῖος` index and the two
  combining-mark chart cells are pipeline fixes.
- No refactors, no chapter-1 behaviour changes, no audio/SW/loader/progress
  changes.

## 6. RESULTS update

Append to `5B-SPEC2-RESULTS-OPUS.md`:

```markdown
## 10. XPATCH1 (cross-patch from the parallel Sol run)

1. **Non-audio defList rows are now static elements.** Rows without audio
   render as `<div class="rc-defrow static">` rather than an inert
   `<button>`, removing the WebKit unstyled-button blue vector at its source
   and fixing the semantics (no phantom controls in the tab order or the
   accessibility tree). The explicit colour rules from the base are retained.
2. **A mark-less target cluster is no longer reddened.** `markOverlayParts`
   emits a plain run when the authored `redMarkCluster` points at a cluster
   with no combining mark, so `φαρισαῖος` renders unmarked instead of
   reddening a bare alpha. The six by-design whole-cluster punctuation items
   are unaffected.
3. **Offline preview regression run** (directive 4, missing from the original
   pass): [results].
4. **Chapter-1 regression at 768px** (spec E): [results].

Ported from Sol; the base's overlay technique, build guard, blue probe,
divide sizing, and expander dedupe are unchanged.
```

Record the actual acceptance numbers inline. Re-run `npm run verify` and
confirm `chapt-01-8ZoFoXk9.js` is still unchanged.

## 7. VERIFY2 additions

Add to the existing VERIFY2 candidate list:

- **V2-1 — overlay offset on iOS.** The red mark overlay uses ONE measured
  offset (`translateY(0.08em)`, horizontally centred) tuned on macOS Chrome.
  The parallel Sol run used five per-mark-family offsets instead
  (breathings and coronis pulled left to 31%, circumflex reduced to 0.76em).
  If the marks look off-centre on the iPhone, the per-family approach is the
  fallback to try — capture a photo of a breathing item (`ῥῆμα`, `υἱός`) and
  a circumflex item (`αὐτοῦ`) so the direction of the error is legible.
- **V2-2 — `φαρισαῖος` renders with no red at all** after this patch. Confirm
  that reads acceptably as a temporary state, or prioritise the data fix.
