# 5G-XPATCH2-DIFF.md — the cross-patch's diff

Base: `26b83827f55abbf5207c8561863faab6207dab01` (`sol wins 5g spec 2, implementing xpatch from opus`), the accepted Sol 5G-SPEC2 tree.

This is the complete 5G-XPATCH2 implementation: the D-42 rationale comment, the two independently named gloss-tap conduct assertions, and the XPATCH2 amendment to `5G-SPEC2-RESULTS-SOL.md`. It excludes the supplied `buildout/5G-XPATCH2.md` input and this file itself, which cannot contain its own diff. No `src/data/*.json`, lexicon, audio manifest, cache/store, or shared renderer content changed. Nothing is committed and nothing is pushed.

## Summary

```text
 buildout/5G-SPEC2-RESULTS-SOL.md         | 40 ++++++++++++++++++++++++++++++++
 scripts/ui-behavior.mjs                  | 40 ++++++++++++++++++++++++++++----
 src/components/SpellVerseActivity.svelte | 10 ++++++++
 3 files changed, 86 insertions(+), 4 deletions(-)
```

## The diff

```diff
diff --git a/buildout/5G-SPEC2-RESULTS-SOL.md b/buildout/5G-SPEC2-RESULTS-SOL.md
index dbc557d..9286b88 100644
--- a/buildout/5G-SPEC2-RESULTS-SOL.md
+++ b/buildout/5G-SPEC2-RESULTS-SOL.md
@@ -136,3 +136,43 @@ I used the supplied `F:\greekapp\ch9railwalkFIXED.pdf` (13 pages, SHA-256 `10D8B
 - [x] Build, shape, lazy-chunk, behavior, modal, rail, and 44-stop offline checks are green.
 - [x] No data, lexicon, audio manifest, cache architecture, route-mount scan, or audio-byte writer changed.
 - [x] Results and cumulative BUILD handoffs are delivered; nothing was committed or pushed.
+
+---
+
+## XPATCH2 (cross-patch from the parallel run)
+
+Base: `26b83827f55abbf5207c8561863faab6207dab01` (`sol wins 5g spec 2, implementing xpatch from opus`). Nathanael had incorporated the accepted Sol SPEC2 tree before this patch began; the XPATCH2 working tree was clean at that baseline. No commit or push was made in this patch.
+
+1. **D-42 rationale recorded in the component** — a header comment in `SpellVerseActivity.svelte` states why the Repeat control is gone and that no future DOSBox observation reinstates it, at the place a future round would add it back. The build-time guard in `check-content-shapes.mjs` is unchanged and remains the enforcement.
+2. **Gloss-taps-play-nothing assertions hardened** — the εἰμί hint stack now has a separately named audio-log conduct assertion in addition to its 12-Greek/12-English structural checks. One ordinary chapter 9 Present Middle lesson paradigm has the same negative conduct assertion, after prewarming its authored first clip so an empty audio DB cannot make the test vacuously pass.
+
+### Spec/code drift
+
+The accepted Sol base already cleared the audio log, clicked the first εἰμί gloss, and required zero clips. That conduct was bundled into the existing 12-gloss/plain-ink structural assertion rather than independently named. XPATCH2's stated absence was therefore stale. This patch preserved the existing structural coverage, split the εἰμί conduct into its own assertion, and added the missing ordinary-paradigm assertion. The accounting change is 871 to 873 checks.
+
+### Assertion bite proof
+
+I temporarily moved the rendered `.pg-gloss` inside the existing `button.pg-greek-tap` in `Paradigm.svelte`. Retaining the current selector let the full maintained harness reach both new assertions while behaviorally recreating the rejected gloss-plays-Greek defect. I built that regressed artifact, restored the source immediately, and verified the component's SHA-256 before and after as `EC7BA73DCB706E24E6CC1822F7A264A7911F7EA69CAE4E94A8CC82303B994214` with no `Paradigm.svelte` diff. The isolated regressed build produced:
+
+```text
+FAIL  5G-SPEC2 eimi charts: all English glosses are plain, ink, and not tappable  — 12 glosses, plain false
+FAIL  5G-SPEC2 eimi hint: tapping an English gloss plays no audio  — 1 clip(s) played on a gloss tap
+FAIL  5G-XPATCH2 chapter 9 Present Middle paradigm: tapping an English gloss plays no audio  — 1 clip(s) played on a gloss tap
+870/873 behavior checks passed
+```
+
+The first failure is the retained structural sibling check; the latter two are the requested conduct checks. Both new assertions therefore demonstrably bite. The restored final build then passed 873/873.
+
+### Final verification
+
+| Command/check | Result |
+| --- | --- |
+| `npm.cmd run verify` | PASS: shapes for all 10 chapters; 101 modules transformed; PWA precache 37 entries; 10 chapter plus 10 lexicon chunks emitted and precached |
+| `npm.cmd run ui:behavior` with `BASE=http://127.0.0.1:4183` | PASS: 873/873 behavior checks |
+| Temporary nested-gloss build, same behavior command | Expected failure: 870/873; both new checks reported one clip from a gloss tap |
+| `npm.cmd run ui:modals -- --base=http://127.0.0.1:4183 ...` | PASS: 150/150 modal states; zero failures |
+| `npm.cmd run ui:walk -- --base=http://127.0.0.1:4183 --chapters=chapt_1,...,chapt_10 ...` | PASS: 219 stops x 2 widths; 612/612 states; zero overflow, rail, interaction, or console errors |
+| `npm.cmd run ui:offline` with `BASE=http://127.0.0.1:4183` | PASS: 44 stops; zero missing; offline refresh OK; zero console errors |
+| `node --check scripts/ui-behavior.mjs` and `git diff --check` | PASS |
+
+The build retains the pre-existing `DivideActivity.svelte:370` accessibility warning; XPATCH2 does not touch that component. No chapter data, lexicon, audio manifest, cache/store path, or shared paradigm renderer changed. The complete patch diff, including this amendment and excluding its self-referential carrier, is in `buildout/5G-XPATCH2-DIFF.md`.
diff --git a/scripts/ui-behavior.mjs b/scripts/ui-behavior.mjs
index 70b88c4..bb383d8 100644
--- a/scripts/ui-behavior.mjs
+++ b/scripts/ui-behavior.mjs
@@ -3637,12 +3637,23 @@ for (const [itemIndex, expectedGreek] of [[20, 'εἰμί'], [24, 'ἔσομαι
       await greekButtons.count() === 12 && (await clips()).length === 1
         && firstPresentAudio === 'chapt_10_g_eimi1s',
       `${await greekButtons.count()} Greek buttons, first audio ${JSON.stringify(firstPresentAudio)}`);
+    check('5G-SPEC2 eimi charts: all English glosses are plain, ink, and not tappable',
+      await glosses.count() === 12 && glossesPlain,
+      `${await glosses.count()} glosses, plain ${glossesPlain}`);
+
+    // The gloss must play NOTHING. This is the check the parallel 5G-SPEC2
+    // run did not have: it asserted no BUTTON inside .pg-gloss, which the
+    // pre-fix DOM satisfied trivially while the gloss sat inside the
+    // .pg-cell button and a tap on it played the Greek clip. Assert the
+    // conduct, not just the shape.
     await page.evaluate(() => { window.__clips.length = 0; });
+    const before = (await clips()).length;
     await glosses.first().click();
-    await page.waitForTimeout(120);
-    check('5G-SPEC2 eimi charts: all English glosses are plain, ink, and not tappable',
-      await glosses.count() === 12 && glossesPlain && (await clips()).length === 0,
-      `${await glosses.count()} glosses, plain ${glossesPlain}, clips ${(await clips()).length}`);
+    await page.waitForTimeout(250);
+    const after = (await clips()).length;
+    check('5G-SPEC2 eimi hint: tapping an English gloss plays no audio',
+      after === before,
+      `${after - before} clip(s) played on a gloss tap`);
   }
 
   await modal.getByRole('button', { name: 'Close', exact: true }).click();
@@ -3650,6 +3661,27 @@ for (const [itemIndex, expectedGreek] of [[20, 'εἰμί'], [24, 'ἔσομαι
   check(`${label}: the form-dependent Hint closes`, await page.locator('.hint-modal').count() === 0);
 }
 
+// The same negative conduct contract must hold on an ordinary lesson chart,
+// not only inside the new eimi Hint. Prewarm the authored first form so this
+// remains deterministic even when the browser starts with an empty audio DB.
+{
+  await go('#/activity/chapt_9/c9_learn_mp_verbs');
+  await gotoTopic(1);
+  const middleChart = page.locator('.card .paradigm')
+    .filter({ hasText: 'Present Middle Indicative Paradigm' }).first();
+  const firstCell = middleChart.locator('.pg-cell').first();
+  await firstCell.locator('button.pg-greek-tap:not([disabled])').click();
+  await page.waitForFunction(() => window.__clips.length > 0, null, { timeout: 5000 });
+  await page.evaluate(() => { window.__clips.length = 0; });
+  const before = (await clips()).length;
+  await firstCell.locator('.pg-gloss').click();
+  await page.waitForTimeout(250);
+  const after = (await clips()).length;
+  check('5G-XPATCH2 chapter 9 Present Middle paradigm: tapping an English gloss plays no audio',
+    after === before,
+    `${after - before} clip(s) played on a gloss tap`);
+}
+
 // ---- G8 the Quick Review paradigm pair is stacked, not paged ------------
 for (const [chapterId, activityId] of [
   ['chapt_9', 'c9_qr_paradigms'], ['chapt_10', 'c10_qr_paradigms']
diff --git a/src/components/SpellVerseActivity.svelte b/src/components/SpellVerseActivity.svelte
index 0e8b190..9e648e7 100644
--- a/src/components/SpellVerseActivity.svelte
+++ b/src/components/SpellVerseActivity.svelte
@@ -1,4 +1,14 @@
 <script>
+  // NO "REPEAT THIS EXERCISE" CONTROL (D-42 RETIRED, 5G-SPEC2 section 2).
+  // The original gives one Check Answer and then clears the whole screen.
+  // That behavior was OBSERVED and then DELIBERATELY REJECTED by Nathanael.
+  // Do not add this control back, in any chapter, regardless of what a
+  // future DOSBox observation shows — the observation is not in dispute.
+  // A wrong Check Answer keeps what was typed (retry-until-right); the
+  // only thing that clears the slate is the learner pressing Restart
+  // Exercise (D-12). check-content-shapes.mjs fails the build if any
+  // chapter's data reintroduces the key.
+
   // SCRIPTURE MEMORY SPELLING EXERCISE (5D, activity type `spellVerse`).
   // The whole verse is typed as free text and graded word by word against
   // answerWords[] when Check Answer is pressed — one surface, not a
```

