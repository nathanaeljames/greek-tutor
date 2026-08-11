# 5G-XPATCH1.md — port Sol pieces onto the Opus base

Base accepted: the **Opus 5** 5G-SPEC1 working tree (chapters 9 and 10
built, six data fixes applied, `npm run verify` green).
Target: Claude Code, same worktree that produced `5G-SPEC1-RESULTS.md`.
Deliverables: the complete `git diff` of this patch appended to (or
beside) a new §9 in `5G-SPEC1-RESULTS.md`. No BUILD narrative. Nothing
pushed. VERIFY-5G authoring is a SEPARATE task with its own
instructions (`VERIFY-5G-TASK.md`); do not fold it into this patch.

Two code ports. Everything else in the Opus base stands as shipped —
in particular the six §4 data fixes, D-40/D-41/D-42, the `ui:offline`
script, the zero-padding and cohort-gate harness fixes, and the
popup-walk assertions are all correct and are NOT touched.

Note: `buildout/ONBOARD-SOL.md` has been updated CHAT-SIDE this round
(new §2b, the unified data-file rule). Nathanael will land the file;
you do not edit it. If your worktree's copy still lacks §2b when you
read it, ignore the stale data-rule bullet in §2 — §2b is the rule.

## 1. Port: `playThrough()` reports HOW playback ended

**Why.** The parallel Sol run changed `playThrough` in `src/lib/audio.js`
to resolve `true` only on a natural `ended` event and `false` on
pause/error, keeping the shared never-reject contract. The Opus base
resolves identically either way. The difference is not cosmetic: D-42's
repeat lifecycle clears the slate after the success clip finishes, and
"finishes" must mean ENDED — a clip cut off by route exit, a screen
lock (`visibilitychange` pause), or a superseding tap must NOT go on to
wipe the learner's typed verse. Sol additionally guarded the repeat
clear against stale completion (restart/unmount between success and
clip end); take that too.

**Change.** In `src/lib/audio.js`, have `playThrough()` resolve a
boolean: `true` from the `ended` listener, `false` from `pause`/`error`
or an interrupting `stop()`. Callers that ignore the value are
unaffected (the advance path already races it against the minimum
timer and treats early interruption correctly).

In `SpellVerseActivity.svelte`, the repeat path becomes:

```js
      const finished = await playThrough(activity.audio);
      // Only a clip that actually reached its end clears the slate for
      // another pass; a paused, superseded or navigated-away clip must
      // not wipe what the learner typed. Guard against a Restart or
      // route exit that happened while the clip was playing.
      if (finished && repeatEnabled && !destroyed && attemptToken === token) {
        clearSlate();
      }
```

using whatever the component's existing unmount/restart guards are
named — the shape matters, not the identifiers.

**Acceptance.** ui-behavior: (a) repeat ON, correct answer, clip plays
to natural end → slate clears; (b) repeat ON, correct answer, navigate
away mid-clip → return shows the slate NOT cleared and completion still
recorded; (c) repeat OFF unchanged. Assert on ch9's SM speller; ch10
inherits the component.

## 2. Port: the N-stage commit-order split

**Why.** Spec §4.1 says selections commit "on the final stage's click,
exactly as the two-stage c8_drill_case behaves." Those two clauses
conflict: the DEVICE-VERIFIED chapter-8 contract (VERIFY-5F item 7)
commits as soon as both values exist, in either click order. The Opus
base kept the either-order rule everywhere, reading the spec's "final
stage's click" loosely; the Sol run split it — either-order for
two-stage (preserving the ch8 verification), final-stage-only for
N > 2 (the new ch10 case, honouring the spec's literal wording). Sol's
reading is the more careful one: it regresses nothing that a device
pass has pinned while giving the new three-stage drill the exact
semantics its spec sentence describes. On a three-stage drill the
difference is real — a learner who fills stages 3, 1, 2 in that order
commits on the stage-2 click under either-order, which can judge a
tuple they were still revising.

**Change.** In `SelectActivity.svelte` (or the staged-commit helper in
`content.js`, wherever the Opus base decides commit), gate on stage
count:

```js
  // Two-stage drills keep the DEVICE-VERIFIED ch8 contract: commit the
  // moment every stage holds a value, in either click order
  // (VERIFY-5F item 7). Drills with more than two stages commit only
  // when the click that just landed FILLED THE LAST EMPTY stage —
  // 5G-SPEC1 §4.1's literal rule. Do not unify these: the first is
  // pinned by a device pass, the second by the spec.
  const commitNow = stages.length <= 2
    ? stagePicks.every(pick => pick !== null)
    : filledLastEmptyStage;
```

where `filledLastEmptyStage` is true when the current click's stage was
the only remaining null before it landed. Earlier stages stay
re-clickable before commit in both modes, as they do today.

**Acceptance.** ui-behavior: ch8 case drill still commits on the second
value in either order (existing assertion must not change); ch10
parsing with fill order 3→1→2 does NOT commit on the stage-2 click
until stage 2 was the last empty one — and a revision to stage 1 after
stages 2+3 are filled still commits on the stage-1 click, because that
click filled the last empty stage. All four G1 paths re-run green.

If inspection shows the Opus base's existing rule already produces
exactly these outcomes on both drills, say so in §9 with the code path
cited, add the fill-order assertion anyway, and skip the change — the
assertion is the durable part.

## 3. RESULTS amendment shape

Append to `5G-SPEC1-RESULTS.md`:

```markdown
## 9. XPATCH1 (cross-patch from the parallel Sol run)

1. **playThrough reports completion honestly** — resolves true only on
   a natural ended event; the repeat lifecycle clears the slate only on
   true, with restart/unmount guards. [assertions]
2. **N-stage commit order split** — two-stage drills keep the
   device-verified either-order commit (VERIFY-5F item 7); three-plus
   stages commit on the click that fills the last empty stage
   (5G-SPEC1 §4.1 literal). [assertions, or the no-change finding]

Diff: [inline or adjacent file].
```

Re-run `npm run verify` and the four harnesses; report the counts.
