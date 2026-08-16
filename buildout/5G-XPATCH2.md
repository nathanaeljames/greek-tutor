# 5G-XPATCH2.md — accept the Sol base; port one comment and harden one assertion

Base accepted: the **Sol** 5G-SPEC2 working tree.
Target: Codex, same repo copy that produced `5G-SPEC2-RESULTS-SOL.md`.
Deliverables: the complete `git diff` of this patch appended to (or
beside) a new §  in `5G-SPEC2-RESULTS-SOL.md`. No BUILD narrative.
Nothing pushed. VERIFY-5G2 authoring is a separate task.

This is the smallest patch of the series, and that is the finding: the
two trees started from the same commit (`021a03d`), the spec-mandated
work landed correctly in both, and the Sol tree additionally carries
four things the parallel tree does not. Nothing needs undoing.

## Why this base

For the record, since the previous round shipped the other model's
tree and the direction reverses here. Both models ran this round from
`021a03d`, so neither has a lineage claim. Comparing what is uniquely
present:

- **Sol only:** the `.pg-greek-tap` boundary fix in `Paradigm.svelte`
  and `MeaningsCard.svelte` (a live directive-9 violation on the other
  tree, across all ten chapters); the 320px arrow-chart clip fix; a
  BUILD-TIME rejection of `repeatCheckbox` / "Repeat This Exercise" in
  `check-content-shapes.mjs`; `ui-walk` hint-route inventory that fails
  on an absent modal instead of skipping it.
- **Opus only:** a header comment in `SpellVerseActivity.svelte`
  recording why D-42 must never return.

Porting four items onto the other tree — one of them a shared-renderer
structural change requiring a ten-chapter regression — to avoid porting
one comment is the wrong trade. Take the Sol tree.

## 1. Port: the D-42 "why" comment, at the point of re-addition

**Why.** The Sol tree enforces D-42's retirement in the right place —
`check-content-shapes.mjs` fails the build if any chapter's data ever
reintroduces `repeatCheckbox` or the checkbox label. That is stronger
than a comment, and it stays.

What it does not do is answer the question at the place a future round
would ask it. Someone reading the original's DOSBox behavior — one
Check Answer, then the whole screen clears — and opening
`SpellVerseActivity.svelte` to implement it will find no explanation
there; they will hit the build guard afterwards, having already written
the code. The parallel run put the rationale in the component, which is
where the question gets asked.

**Change.** In `src/components/SpellVerseActivity.svelte`, at the top of
the component's script block (or immediately above `clearSlate`, whichever
sits closer to where a Repeat implementation would land), add:

```js
  // NO "REPEAT THIS EXERCISE" CONTROL (D-42 RETIRED, 5G-SPEC2 section 2).
  // The original gives one Check Answer and then clears the whole screen.
  // That behavior was OBSERVED and then DELIBERATELY REJECTED by Nathanael.
  // Do not add this control back, in any chapter, regardless of what a
  // future DOSBox observation shows — the observation is not in dispute.
  // A wrong Check Answer keeps what was typed (retry-until-right); the
  // only thing that clears the slate is the learner pressing Restart
  // Exercise (D-12). check-content-shapes.mjs fails the build if any
  // chapter's data reintroduces the key.
```

No code change. Verify the build guard's message and this comment agree
on the rule; if they drift, the comment is wrong and the guard is right.

**Acceptance.** `npm run check:shapes` and `npm run build` unchanged and
green. No behavior change to assert.

## 2. Harden: assert the gloss plays NOTHING

**Why.** This is the assertion whose absence let the parallel run ship
the directive-9 violation. Its harness confirmed that
`button.pg-gloss, .pg-gloss button` counted zero — true and useless,
because the gloss was a span *inside* the enclosing `.pg-cell` button.
It then clicked `.pg-cell` and confirmed a clip played, which the bug
also satisfies. Every assertion passed while a gloss tap played Greek.

The Sol tree's structural fix makes the violation impossible, and its
current checks (12 enabled `button.pg-greek-tap`, 12 `.pg-gloss`
siblings) pin the DOM shape correctly. Add the behavioral half so a
future refactor that re-nests the gloss fails on conduct, not only on
shape — a structural assertion can be satisfied by markup that has
drifted back.

**Change.** In `scripts/ui-behavior.mjs`, in the block that already
counts the Greek buttons and glosses on the εἰμί hint stack, add a
negative tap check using the same audio-log method the existing cell
taps use (P3.1 — read the run's audio log, not the element `src`, which
is a blob URL):

```js
  // The gloss must play NOTHING. This is the check the parallel 5G-SPEC2
  // run did not have: it asserted no BUTTON inside .pg-gloss, which the
  // pre-fix DOM satisfied trivially while the gloss sat inside the
  // .pg-cell button and a tap on it played the Greek clip. Assert the
  // conduct, not just the shape.
  const before = audioLog.length;
  await modal.locator('.pg-gloss').first().click();
  await page.waitForTimeout(250);
  check('5G-SPEC2 eimi hint: tapping an English gloss plays no audio',
    audioLog.length === before,
    `${audioLog.length - before} clip(s) played on a gloss tap`);
```

using this harness's existing audio-log accessor and `check()` signature.

Then apply the same negative check to **one ordinary chapter paradigm**
outside the hint modal — chapter 9's Present Middle chart is the natural
choice — so the guarantee covers the shared renderer generally and not
only the surface this round touched.

**Acceptance.** Both new checks pass on the Sol tree. Then prove they
BITE: temporarily revert `Paradigm.svelte` to wrap the gloss inside the
cell button, confirm both new checks FAIL, and restore. Record the
failure output in the RESULTS amendment — an assertion nobody has seen
fail is an assertion nobody has tested.

## 3. Not ported, and why

- The parallel tree's §8 write-up of the 320px overflow, with its
  measurements and suggested `@media` one-liner. The Sol tree already
  fixed the clip with a scoped `max-width: 359px` rule and re-measured
  0px at every chapter 9/10 stop. The two fixes differ (wrap the row
  vs. shrink and tighten the gap); the shipped one is verified, so it
  stands. Nothing to take but a description of a problem that is gone.
- Its 881-vs-871 harness count. The two totals rest on different
  accounting bases, both internally consistent; neither is a measure of
  coverage. No action.

## 4. RESULTS amendment shape

Append to `5G-SPEC2-RESULTS-SOL.md`:

```markdown
## XPATCH2 (cross-patch from the parallel run)

1. **D-42 rationale recorded in the component** — a header comment in
   `SpellVerseActivity.svelte` states why the Repeat control is gone and
   that no future DOSBox observation reinstates it, at the place a
   future round would add it back. The build-time guard in
   check-content-shapes.mjs is unchanged and remains the enforcement.
2. **Gloss-taps-play-nothing assertions added** — on the eimi hint stack
   and on one ordinary chapter-9 paradigm, using the audio-log method.
   Proven to bite by temporarily restoring the pre-fix cell structure:
   [paste the failure output].

Suite: 871 -> [new total], all passing.
```

Re-run `npm run check:shapes`, `npm run build`, `npm run ui:behavior`,
`npm run ui:modals`, `npm run ui:walk` (chapters 1-10), and
`npm run ui:offline`; report the counts.
