# DISCLOSURE-SPEC3-XPATCH.md — port Sol pieces onto the Opus base

Base accepted: the **Opus 5** DISCLOSURE-SPEC3 working tree (all eight
work items including the W8 addendum, gates green).
Target: Claude Code, same worktree that produced
`DISCLOSURE-SPEC3-RESULTS-OPUS.md`.
Deliverables: the complete `git diff` of this patch appended to (or
beside) a new §11 in `DISCLOSURE-SPEC3-RESULTS-OPUS.md`. No BUILD
narrative. **Nothing committed, staged, or pushed.**

Two ports from the parallel Sol run. Both are harness infrastructure —
the two implementations converged on every structural call in W2-W7,
the parallel run did not receive the W8 input, and nothing in the app
code needs to move in either direction. Everything in the Opus tree
stands as shipped.

Source access: the Sol worktree sits on this machine as a sibling repo
copy. Nathanael will state its path when handing this patch over. Port
1 copies a file from it; if the path is not supplied, STOP and ask
rather than reconstructing the script from its description.

## 1. Port: `ui-disclosure3.mjs` — the exact-census harness

**Why.** The parallel run wrote a dedicated 73-check script that pins
this round's W2 census as a PERMANENT contract rather than a one-round
finding: the exact 219-activity partition (13 changed / 202
already-loaded / 4 exempted), all 95 drill/exercise IDs mapping
one-to-one onto ledger rows 1-95, a direct-load probe for every changed
and every exempt route, the mount-audio path for all changed routes
that pronounce, the two silent self-check starts (ledger rows 7 and
12), and the blocked-autoplay contract under an injected
`NotAllowedError`. The Opus tree asserts the same census inside
`ui-behavior`'s W2 block, but as authored checks of this round's
change — the standalone script makes the partition itself the thing a
future round cannot silently shift. A chapter 11 whose new activity
mounts empty, or a refactor that reintroduces a begin screen on one
route, fails this script by count before anyone reads a diff.

Its harness hygiene is also worth having verbatim: contexts block
service workers, and every probe requires the exact route hash, the
authored top-bar title, and route-specific visible readiness before
inspecting anything — three preconditions that kill the
wrong-page-measured class of false pass.

**Change.**

1. Copy `scripts/ui-disclosure3.mjs` from the Sol worktree into
   `scripts/` unchanged, and add the `ui:disclosure3` entry to
   `package.json` scripts, mirroring the existing `ui:disclosure`
   invocation shape.
2. Reconcile the ONE contract the two trees implement differently: the
   blocked-autoplay block. Both trees suppress a mount-time
   `NotAllowedError` with no toast and no console error while item 1
   renders; the Sol tree then cleans up and stops, while THIS tree
   holds the blocked clip and plays it on the learner's first gesture
   (`playOnLoad`). If the copied block asserts "exactly one play
   attempt and none after," it will fail here — correctly, against the
   wrong contract. Rewrite that block to this tree's contract and say
   so in a comment:

   ```js
   // BLOCKED AUTOPLAY (W2). This tree HOLDS a NotAllowedError-blocked
   // mount clip and releases it on the first user gesture — the
   // parallel implementation suppressed and stopped. Assert THIS
   // contract: one blocked attempt at mount, no toast, no console
   // error, item 1 visible; then one gesture, and the held clip (and
   // only the held clip) plays.
   ```

   Every other check in the script asserts route-level behavior the two
   trees share; selectors that drifted (if any) are adapted, not
   deleted, and every adaptation is listed in the RESULTS amendment.
3. Do NOT fold the script into `ui-disclosure.mjs`. It is a census with
   its own read-the-data-first setup, and merging it would re-blur the
   line between "this round's assertions" and "the standing partition"
   that makes it valuable.

**Acceptance.** `npm run ui:disclosure3` reports 73/73 (or the adapted
total, with every delta from 73 named). Then PROVE THE CENSUS COUNTS:
change the expected partition constant from 13 to 14, confirm the run
FAILS naming the discrepancy, restore, confirm 73/73 again. Paste the
failure line into the RESULTS amendment.

## 2. Port: console-error strictness in `ui-walk.mjs`

**Why.** The parallel run hit two context-free Chromium 404 console
messages on fast exits after audio pages, investigated rather than
waived them wholesale, and landed on the right rule: the walker records
`ConsoleMessage.location().url` with every message, and waives ONLY a
resource-load error whose message plus location prove it is blob/audio
teardown; a generic 404 — a missing image, a bad fetch, a mistyped
asset path — remains a walk failure. The Opus tree's walker currently
treats console errors as a flat failure list, which is stricter on
paper but means the first benign teardown message in a future
environment forces someone to either waive broadly or ignore the
walker. The location-proven narrow waiver is the durable form:
strictness that survives contact with real teardown noise.

**Change.** In `scripts/ui-walk.mjs`, where console messages are
collected, retain `msg.location()` alongside text and type. In the
failure evaluation, add the single narrow waiver:

```js
// A resource-load error is waived ONLY when the message and its
// location URL together prove blob/audio teardown (revoked blob: URL
// or an /audio/ path released on route exit). Anything else — any
// generic 404, any script or asset failure — stays a walk failure.
// Waiving by text alone is how a real missing asset would hide behind
// teardown noise; the location is what makes the proof.
```

with the predicate reading both fields. Report every waived message,
with its location, in the walk report even when the walk passes —
a waiver that leaves no trace is a blind spot.

**Acceptance.** Both full walks re-run green at both widths with zero
failures and zero (or explicitly listed) waived messages. Then PROVE IT
BITES: on one stop, inject `page.evaluate(() => fetch('/definitely-
missing-asset'))`, confirm the walk FAILS on the resulting 404 with its
location recorded, remove the injection, re-run green. Paste the
failure line into the RESULTS amendment.

## 3. Not ported, and why

- The parallel run's W2/W3/W7 implementations, its D13 walk, its
  divider work, its Shift geometry: converged with this tree's on every
  structural decision; nothing to take.
- Its `playOnMount` suppress-and-stop autoplay contract. This tree's
  hold-for-first-gesture is the richer behavior and VERIFY item 3
  already covers how it feels on device.
- Its 226-check `ui-disclosure` bookkeeping. Same contracts, different
  authoring granularity; counts are not coverage.
- W8: the parallel run closed data-gated without the ch5 railwalk, as
  the spec permits. Nothing to reconcile — this tree's W8 stands.

## 4. RESULTS amendment shape

Append to `DISCLOSURE-SPEC3-RESULTS-OPUS.md`:

```markdown
## 11. XPATCH (cross-patch from the parallel Sol run)

1. **`ui-disclosure3.mjs` census harness adopted** — the exact
   13/202/4 partition, the 95-row ledger mapping, direct-load probes
   for every changed and exempt route, and the blocked-autoplay
   contract are now a standing suite. Adapted to this tree's
   hold-for-first-gesture autoplay contract: [list every adapted
   check]. Census proven to count: [partition-mutation failure line].
2. **`ui-walk` console strictness** — messages retain their source
   location; only location-proven blob/audio teardown is waived; a
   generic 404 fails the walk. Proven to bite: [injected-404 failure
   line]. Waived messages this run: [list or "none"].

Gates re-run: check:shapes, build, ui:disclosure 206/206,
ui:disclosure3 [n]/[n], ui:behavior 902/902, ui:walk both spans at
both widths. Nothing committed, staged, or pushed.
```
