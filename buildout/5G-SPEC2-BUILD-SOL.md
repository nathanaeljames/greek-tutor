# 5G-SPEC2 Build Record

Date: 2026-08-16

Baseline: `021a03df2ab0862f296cbb58614aacdd0e2e7b3f` (`saving all data files prior to phase 5g spec 2`), immediately above the spec's `ecc5365` lineage.

Commit/push status: none. Nathanael's baseline already contains the delivered data-only checkpoint; every implementation and handoff change below remains uncommitted.

Wall-clock window: approximately 2026-08-15 22:40 EDT through 2026-08-16 00:40 EDT, approximately 2 hours. Most elapsed time is the complete Playwright behavior suite run three times, the 150-state modal matrix run three times, and successive focused/full rail walks used to diagnose and close narrow-width regressions.

## Scope and result

This record covers the exact cumulative working-tree patch for 5G-SPEC2: Repeat retirement, per-item hint routing, inline composite paradigms, Greek-only paradigm tap targets, narrow layout preservation, permanent shape guards, browser/modal/rail harness updates, and the Results handoff.

Final acceptance summary:

```text
check:shapes        PASS, 10 chapters
production build   PASS, 101 modules; PWA precache 37 entries
lazy chunks        PASS, 10 chapter + 10 lexicon chunks
ui:behavior        PASS, 871/871
ui:modals          PASS, 150/150
ui:walk ch9/ch10   PASS, 44 stops x 2 widths; 114/114 states; 0px overflow
ui:walk all        PASS, 219 stops x 2 widths; 612/612 states; 0px overflow
ui:offline         PASS, 44 stops; 0 missing; refresh OK; no console errors
git diff --check   PASS (line-ending notices only)
```

The build has one pre-existing Svelte warning at `src/components/DivideActivity.svelte:370` concerning `tabIndex` on a noninteractive element. That file is absent from this diff.

## Decision and tool log

This is an execution and decision record, not private chain-of-thought.

1. Read `buildout/ONBOARD-SOL.md` and `buildout/5G-SPEC2.md` in full before edits. Established that the active spec is limited to the delivered chapter 9/10 corrections, Repeat retirement, form-dependent Hint, answer-key harness changes, and handoff evidence.
2. Inspected Git state. Found a clean implementation baseline at `021a03d`; `git show` proved that commit contains the two delivered JSON changes as a data-only checkpoint. Followed the user's stronger no-commit instruction and made no new commit.
3. Parsed all `src/data/*.json`, counted retired/new keys, computed data hashes, and inspected the six named zero-based answer indices, ten item overrides, both hint-chart shapes, and five `below` expanders. Confirmed no need or authorization to edit data.
4. Rendered and visually inspected the relevant pages of `F:\greekapp\ch9railwalkFIXED.pdf` and `F:\greekapp\ch10railwalkFIXED.pdf` using PyMuPDF and local image inspection. Kept all derived images in the system temporary directory.
5. Delegated three bounded parallel reviews: Repeat-component removal, hint/resolver implementation, and a read-only harness/spec audit. Integrated each result only after main-agent review. The audit identified the stale modal surface, silent-SKIP denominator, unpinned six-form key, and the English-inside-button drift.
6. Removed the Repeat checkbox UI and replay-then-clear lifecycle from `SpellVerseActivity.svelte`; retained one success play, retry-until-right, Restart, completion, and audio-stop-on-exit behavior. Removed the now-false `playThrough` caller comment without removing the timing helper.
7. Preserved item `hintRef` through question construction, added item-over-drill resolution, and normalized referenced and inline `hintCharts` forms in `content.js` without adding a load-time scan.
8. Corrected the shared paradigm cell boundary: `.pg-cell` became inert layout, `.pg-greek-tap` contains only Greek, and English gloss is a sibling. Applied the same contract in `MeaningsCard.svelte` so the two shared row renderers cannot drift.
9. Extended `check-content-shapes.mjs` to reject retired Repeat data permanently and validate both composite shapes plus all item/UI hint references.
10. Reworked `ui-behavior.mjs` to seek prompt-specific shuffled items through the real Next control, pin all six Active answers independently of JSON answers, verify both εἰμί routes, verify 12 Greek/12 English cell contracts, verify the five interspersed disclosures, and replace the retired Repeat lifecycle with absence/retry checks.
11. Reworked `ui-modals.mjs` to target λύω and εἰμί explicitly, replace the removed palatal popup surface, and count missing/opening failures as failures. Updated `ui-walk.mjs` for the Greek-button selector and item-level hints.
12. Ran static/build verification, then a full browser behavior pass. The first attempt accidentally reached an older preview bound to `localhost:4173`; DOM comparison proved `127.0.0.1:4173` served the fresh bundle. All recorded final browser commands were pinned to the numeric loopback address.
13. Ran the chapter 9/10 rail walk. Its first pass exposed new internal width measurements caused by the inert wrapper and newly nested arrow charts. Added explicit gloss wrapping and a narrow-only nested-arrow fit rule; the 44-stop rerun passed with zero overflow.
14. Ran the all-chapter walk because the paradigm renderer is shared. It found 2–3px intrinsic overflow in three chapter 7 adjective states. Added a class-gated, 320px-only adjustment for three-column long-form paradigms. A focused chapter 7 walk and the final 219-stop walk both passed with zero overflow.
15. Rebuilt after every runtime/CSS correction. Repeated offline and modal checks against the last build and ran the full behavior suite again so the recorded results correspond to the exact final bundle.
16. Audited scope with `git diff`, `git diff --check`, targeted searches for cache/store/audio changes, hashes, and status. Confirmed no data, lexicon, manifest, cache architecture, or generated screenshot change.
17. Recorded two delivered-source surprises without expanding scope: stale `scripts/assemble_ch10.py` would regenerate retired shapes, and `chapt-09.json` retains an obsolete contradictory provenance note beside the corrected objective.

Representative commands used:

```powershell
git status --short
git show --name-status 021a03d -- src/data/chapt-09.json src/data/chapt-10.json
Get-FileHash src/data/chapt-09.json,src/data/chapt-10.json -Algorithm SHA256
npm.cmd run verify
$env:BASE='http://127.0.0.1:4173'; npm.cmd run ui:behavior
npm.cmd run ui:modals -- --base=http://127.0.0.1:4173 --out=<temporary-directory>
npm.cmd run ui:walk -- --base=http://127.0.0.1:4173 --chapters=chapt_9,chapt_10 --out=<temporary-directory>
npm.cmd run ui:walk -- --base=http://127.0.0.1:4173 --chapters=chapt_1,...,chapt_10 --out=<temporary-directory>
$env:BASE='http://127.0.0.1:4173'; npm.cmd run ui:offline
node --check scripts/check-content-shapes.mjs
node --check scripts/ui-behavior.mjs
node --check scripts/ui-modals.mjs
node --check scripts/ui-walk.mjs
git diff --check
```

## Exact cumulative diff

The fenced block below is the exact regular Git diff from baseline `021a03d` for every implementation file plus the new `5G-SPEC2-RESULTS.md`. This BUILD file necessarily excludes itself to avoid a self-referential diff that changes when embedded.

```diff
diff --git a/scripts/check-content-shapes.mjs b/scripts/check-content-shapes.mjs
index 4686f2c..1467e95 100644
--- a/scripts/check-content-shapes.mjs
+++ b/scripts/check-content-shapes.mjs
@@ -378,6 +378,16 @@ for (const file of files) {
         });
       }
     }
+    // D-42 is retired: Scripture Memory spellers always keep a wrong attempt
+    // available for retry and never offer the old Repeat This Exercise mode.
+    // Reject either half of the former data contract if a future assembly
+    // accidentally stamps it back onto any activity.
+    if (Object.prototype.hasOwnProperty.call(block, 'repeatCheckbox')) {
+      problems.push(`${path}.repeatCheckbox: Repeat This Exercise was retired by D-42.`);
+    }
+    if (Array.isArray(block.ui?.checkboxes) && block.ui.checkboxes.includes('Repeat This Exercise')) {
+      problems.push(`${path}.ui.checkboxes: Repeat This Exercise was retired by D-42.`);
+    }
     // TIMING IS NOT A DATA FIELD (5D-SPEC2 §3, D-14 at 2000/4000). Advance
     // durations live in src/lib/timing.js and nowhere else, so ch1, ch2 and
     // ch3 always read the same two numbers. A regenerated data file that
@@ -440,10 +450,10 @@ for (const file of files) {
 // Five of chapter 6-8's six hintRefs dangled once, and a dangling reference
 // fails SILENTLY in both directions: a hintRef that resolves to nothing simply
 // removes the Hint button, and a [[link:id]] that names no popup renders as
-// plain text. Both look like a deliberate absence on screen. 5G adds two more
-// reference kinds — the chapter-level `hintCharts` register and its
-// `paradigmRefs`, and the explicit link markup — so the whole class is checked
-// here rather than one kind at a time.
+// plain text. Both look like a deliberate absence on screen. 5G adds the
+// chapter-level `hintCharts` register (referenced `paradigmRefs` or inline
+// `charts`) and explicit link markup, so the whole class is checked here
+// rather than one kind at a time.
 //
 // The resolver accepts an id, a block type, or the camelCase slug of a chart
 // title (src/lib/content.js resolveHintRef). That slug rule is copied rather
@@ -473,21 +483,38 @@ for (const file of files) {
 
   for (const [name, composite] of Object.entries(data.hintCharts || {})) {
     const refs = composite && composite.paradigmRefs;
-    if (!Array.isArray(refs) || !refs.length) {
-      problems.push(`${file}.hintCharts.${name}: expected a non-empty paradigmRefs array.`);
+    const charts = composite && composite.charts;
+    const hasRefs = Array.isArray(refs) && refs.length > 0;
+    const hasCharts = Array.isArray(charts) && charts.length > 0;
+    if (!hasRefs && !hasCharts) {
+      problems.push(`${file}.hintCharts.${name}: expected a non-empty paradigmRefs or charts array.`);
       continue;
     }
-    refs.forEach((ref, index) => {
-      if (!chartRefs.has(ref)) {
-        problems.push(`${file}.hintCharts.${name}.paradigmRefs[${index}]: "${ref}" names no chart, topic or block in this chapter — the Hint would open empty.`);
-      }
-    });
+    if (hasRefs && hasCharts) {
+      problems.push(`${file}.hintCharts.${name}: use paradigmRefs or inline charts, not both.`);
+    }
+    if (hasRefs) {
+      refs.forEach((ref, index) => {
+        if (!chartRefs.has(ref)) {
+          problems.push(`${file}.hintCharts.${name}.paradigmRefs[${index}]: "${ref}" names no chart, topic or block in this chapter — the Hint would open empty.`);
+        }
+      });
+    }
+    if (hasCharts) {
+      charts.forEach((chart, index) => {
+        if (!chart || typeof chart !== 'object' || Array.isArray(chart) || chart.type !== 'paradigm') {
+          problems.push(`${file}.hintCharts.${name}.charts[${index}]: expected an inline paradigm block.`);
+        }
+      });
+    }
   }
 
   walk(data, file, (node, path) => {
-    const ref = node.ui && node.ui.hintRef;
+    // Walking every object reaches ui, item and hint-page records alike, so
+    // one own-property check covers both drill defaults and item overrides.
+    const ref = node.hintRef;
     if (typeof ref === 'string' && !chartRefs.has(ref)) {
-      problems.push(`${path}.ui.hintRef: "${ref}" resolves to nothing — the Hint control would silently not render.`);
+      problems.push(`${path}.hintRef: "${ref}" resolves to nothing — the Hint control would silently not render.`);
     }
   });
 
@@ -764,4 +791,4 @@ if (problems.length) {
   process.exit(1);
 }
 
-console.log(`PASS: content shapes intact — ${files.join(', ')} checked (biblist entries are strings; numbered items render something; greekRows rows carry content; paradigm rows match their columns; spellVerse answers are single words; every contentAudio mode has a branch; every advanceClass is one of the four and every audioTiming one of the five; every reddened cluster has a font-derived geometry row; every spelling answer is typeable on the shared keyboard; every displayed elision mark is U+0027; no numbered point is hand-numbered inside a plain para; no paragraph is split line-by-line across consecutive paras; every presentFutureRows row has both sides; every hintRef, paradigmRef, [[link:id]] and topic titleLink resolves; every audio id the data names exists in the audio manifest).`);
+console.log(`PASS: content shapes intact — ${files.join(', ')} checked (biblist entries are strings; numbered items render something; greekRows rows carry content; paradigm rows match their columns; spellVerse answers are single words; retired Repeat controls are absent; every contentAudio mode has a branch; every advanceClass is one of the four and every audioTiming one of the five; every reddened cluster has a font-derived geometry row; every spelling answer is typeable on the shared keyboard; every displayed elision mark is U+0027; no numbered point is hand-numbered inside a plain para; no paragraph is split line-by-line across consecutive paras; every presentFutureRows row has both sides; every hintChart has paradigmRefs or inline charts; every hintRef, paradigmRef, [[link:id]] and topic titleLink resolves; every audio id the data names exists in the audio manifest).`);
diff --git a/scripts/ui-behavior.mjs b/scripts/ui-behavior.mjs
index d276928..70b88c4 100644
--- a/scripts/ui-behavior.mjs
+++ b/scripts/ui-behavior.mjs
@@ -2790,7 +2790,7 @@ for (const [chapterId, activityId, opener] of [
     `${await chart.locator('.pg-row').count()} rows`);
   // Directive 9: a cell whose form has a clip plays it.
   await page.evaluate(() => { window.__clips.length = 0; });
-  await chart.locator('.pg-cell').first().click();
+  await chart.locator('.pg-greek-tap:not([disabled])').first().click();
   await page.waitForTimeout(200);
   check('5F §2.8 a paradigm cell plays its own clip', (await clips()).length === 1);
 
@@ -3220,8 +3220,8 @@ for (const [chapterId, activityId, expected] of [
 // ledger read-back). What follows is what only they have: the parsing drill
 // generalized to THREE stages, the single-topic page with no topic rail, the
 // popup written as content blocks, the present/future chart in both of its
-// printed forms, the composite Hint, the compound-verb suffix, and the
-// "Repeat This Exercise" checkbox.
+// printed forms, the form-dependent composite Hint, the compound-verb suffix,
+// and the retired Repeat control's preserved retry-until-right path.
 
 // ---- G1 the THREE-stage parsing drill (5G-SPEC1 §4.1) --------------------
 {
@@ -3441,29 +3441,40 @@ for (const [chapterId, activityId, expected] of [
   await page.locator('.popup-sheet').getByRole('button', { name: 'Cancel', exact: true }).click();
   await page.waitForTimeout(80);
 
-  // ch10: five stem-variation popups whose bodies are presentFutureRows in
-  // the ARROW form the original prints inside a popup.
+  // ch10: the five stem-variation examples are now interspersed disclosure
+  // rows. Each numbered variation owns exactly one collapsed "Examples"
+  // expander; none may drift into a detached group at the end of the topic.
   await go('#/activity/chapt_10/c10_learn_future_verbs');
   await gotoTopic(3);
-  const stemLinks = page.locator('.rc-list .popup-link');
-  check('5G G4 all five stem variations carry a popup link on their own line',
-    await stemLinks.count() === 5, `${await stemLinks.count()} links`);
-  await stemLinks.first().click();
+  const stemItems = page.locator('.rc-list > li');
+  const placement = await stemItems.evaluateAll(items => items.map(item => {
+    const expanders = item.querySelectorAll(':scope > .rc-item-below > .rich > details.rc-expander');
+    return [...expanders].map(expander => ({
+      label: expander.querySelector('summary')?.textContent?.replace(/\s+/g, ' ').trim(),
+      open: expander.open
+    }));
+  }));
+  check('5G-SPEC2 stem variations: five collapsed Examples accordions, one under each numbered variation',
+    await stemItems.count() === 5
+      && placement.length === 5
+      && placement.every(entries => entries.length === 1 && entries[0].label === 'Examples' && !entries[0].open)
+      && await page.locator('.card details.rc-expander').count() === 5
+      && await page.locator('.rc-list .popup-link').count() === 0,
+    JSON.stringify(placement));
+  await stemItems.first().locator('summary', { hasText: 'Examples' }).click();
   await page.waitForTimeout(150);
-  const sheet = page.locator('.popup-sheet');
-  check('5G G4 the palatal popup is a presentFutureRows chart in ARROW form, Greek tappable on both sides',
-    await sheet.getAttribute('data-popup-id') === 'palatal'
-      && await sheet.locator('.rc-pfrows.arrow-form').count() === 1
-      && await sheet.locator('.rc-pfrow').count() === 2
-      && await sheet.locator('.rc-pfgreek:not([disabled])').count() === 4,
-    normalizeText(await sheet.innerText()));
+  const examples = stemItems.first().locator('details.rc-expander');
+  check('5G-SPEC2 the first interspersed Examples accordion reveals its existing arrow-form chart',
+    await examples.getAttribute('open') !== null
+      && await examples.locator('.rc-pfrows.arrow-form').count() === 1
+      && await examples.locator('.rc-pfrow').count() === 2
+      && await examples.locator('.rc-pfgreek:not([disabled])').count() === 4,
+    normalizeText(await examples.innerText()));
   await page.evaluate(() => { window.__clips.length = 0; });
-  await sheet.locator('.rc-pfgreek').first().click();
+  await examples.locator('.rc-pfgreek').first().click();
   await page.waitForTimeout(250);
-  check('5G G4 a Greek cell in a popup plays its own clip (directive 9)',
+  check('5G-SPEC2 a Greek cell in an interspersed example plays its own clip (directive 9)',
     (await clips()).length === 1, JSON.stringify(await clips()));
-  await sheet.getByRole('button', { name: 'Cancel', exact: true }).click();
-  await page.waitForTimeout(80);
 }
 
 // ---- G5 presentFutureRows in the HEADED form (5G-SPEC1 §4.4) -------------
@@ -3534,20 +3545,49 @@ for (const [chapterId, activityId, expected] of [
   }
 }
 
-// ---- G7 the composite Hint: two charts, one popup (5G-SPEC1 §4.8) --------
-for (const [chapterId, activityId, first, second] of [
-  ['chapt_9', 'c9_drill_parsing', 'Present Middle Indicative Paradigm', 'Present Passive Indicative Paradigm'],
-  ['chapt_9', 'c9_drill_translation', 'Present Middle Indicative Paradigm', 'Present Passive Indicative Paradigm'],
-  ['chapt_10', 'c10_drill_parsing', 'Future Active Indicative Paradigm', 'Future Middle Indicative Paradigm'],
-  ['chapt_10', 'c10_drill_translation', 'Future Active Indicative Paradigm', 'Future Middle Indicative Paradigm']
+// ---- G7 composite + form-dependent Hints (5G-SPEC2 §3) -----------------
+// Two-stage questions are shuffled at mount, so a form-dependent assertion
+// must seek the authored form through the real Next control. Testing whatever
+// happens to load first would make the eimi/luo route nondeterministic.
+const seekSelectPrompt = async (hash, expectedPrompt, itemCount) => {
+  await go(hash);
+  const pronounceEach = page.locator('.exercise-checks input').first();
+  if (await pronounceEach.count() && await pronounceEach.isChecked()) await pronounceEach.uncheck();
+  for (let step = 0; step < itemCount; step++) {
+    if (await promptOnScreen() === normalizeText(expectedPrompt)) return true;
+    const next = stepper('Next');
+    if (await next.isDisabled()) break;
+    await next.click();
+    await page.waitForTimeout(45);
+  }
+  return false;
+};
+
+const parsing10 = activityById(ch10, 'c10_drill_parsing');
+for (const [chapterId, activityId, first, second, target] of [
+  ['chapt_9', 'c9_drill_parsing', 'Present Middle Indicative Paradigm', 'Present Passive Indicative Paradigm', null],
+  ['chapt_9', 'c9_drill_translation', 'Present Middle Indicative Paradigm', 'Present Passive Indicative Paradigm', null],
+  // Item 16 has no override and must retain the drill-level future pair.
+  ['chapt_10', 'c10_drill_parsing', 'Future Active Indicative Paradigm', 'Future Middle Indicative Paradigm', 'λύω'],
+  ['chapt_10', 'c10_drill_translation', 'Future Active Indicative Paradigm', 'Future Middle Indicative Paradigm', null]
 ]) {
-  await go(`#/activity/${chapterId}/${activityId}`);
+  const hash = `#/activity/${chapterId}/${activityId}`;
+  const sourceMatches = !target || (activityId === 'c10_drill_parsing'
+    && normalizeText(parsing10.items[15]?.greek) === normalizeText(target)
+    && !Object.prototype.hasOwnProperty.call(parsing10.items[15], 'hintRef'));
+  const reached = target ? await seekSelectPrompt(hash, target, parsing10.items.length) : (await go(hash), true);
+  if (!reached) {
+    check(`5G G7 ${activityId}: Hint opens ONE popup holding BOTH charts, stacked`, false,
+      `never reached ${JSON.stringify(target)}`);
+    check(`5G G7 ${activityId}: the Hint closes`, false, 'target form not reached');
+    continue;
+  }
   await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
   await page.waitForTimeout(150);
   const modal = page.locator('.hint-modal');
   const titles = (await modal.locator('.pg-title').allInnerTexts()).map(normalizeText);
   check(`5G G7 ${activityId}: Hint opens ONE popup holding BOTH charts, stacked`,
-    await modal.count() === 1 && await modal.locator('.paradigm').count() === 2
+    sourceMatches && await modal.count() === 1 && await modal.locator('.paradigm').count() === 2
       && titles[0] === first && titles[1] === second
       && await modal.locator('[data-paradigm-switch]').count() === 0,
     JSON.stringify(titles));
@@ -3556,6 +3596,60 @@ for (const [chapterId, activityId, first, second] of [
   check(`5G G7 ${activityId}: the Hint closes`, await page.locator('.hint-modal').count() === 0);
 }
 
+// Items 21 (present eimi) and 25 (future eimi) both override the drill-level
+// future-luo pair. They open the same two inline eimi charts, stacked in one
+// modal with one footer Close and no paging.
+for (const [itemIndex, expectedGreek] of [[20, 'εἰμί'], [24, 'ἔσομαι']]) {
+  const item = parsing10.items[itemIndex];
+  const reached = await seekSelectPrompt('#/activity/chapt_10/c10_drill_parsing', expectedGreek, parsing10.items.length);
+  const label = `5G-SPEC2 item ${itemIndex + 1}`;
+  if (!reached) {
+    check(`${label}: item-level hintRef opens Present and Future eimi charts`, false,
+      `never reached ${JSON.stringify(expectedGreek)}`);
+    check(`${label}: the form-dependent Hint closes`, false, 'target form not reached');
+    continue;
+  }
+  await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
+  await page.waitForTimeout(150);
+  const modal = page.locator('.hint-modal');
+  const titles = (await modal.locator('.pg-title').allInnerTexts()).map(normalizeText);
+  check(`${label}: item-level hintRef opens Present and Future eimi charts`,
+    normalizeText(item?.greek) === normalizeText(expectedGreek)
+      && item?.hintRef === 'eimiParadigms'
+      && await modal.count() === 1
+      && await modal.locator('.paradigm-stack > .paradigm').count() === 2
+      && titles.some(title => title.includes('Present Active Indicative of'))
+      && titles.some(title => title.includes('Future Active Indicative of'))
+      && await modal.locator('.pg-nav, [data-paradigm-switch]').count() === 0
+      && await modal.locator('.modal-actions').getByRole('button', { name: 'Close', exact: true }).count() === 1,
+    JSON.stringify(titles));
+
+  if (itemIndex === 20) {
+    const greekButtons = modal.locator('button.pg-greek-tap:not([disabled])');
+    const glosses = modal.locator('.pg-gloss');
+    const glossesPlain = await glosses.evaluateAll(nodes => nodes.every(node =>
+      !node.closest('button, [role="button"]') && getComputedStyle(node).color !== 'rgb(22, 99, 199)'));
+    await page.evaluate(() => { window.__clips.length = 0; });
+    await greekButtons.first().click();
+    await page.waitForTimeout(300);
+    const firstPresentAudio = ch10.hintCharts?.eimiParadigms?.charts?.[0]?.rows?.[0]?.cells?.[0]?.audio;
+    check('5G-SPEC2 eimi charts: all Greek forms are tappable and the present form uses its authored clip',
+      await greekButtons.count() === 12 && (await clips()).length === 1
+        && firstPresentAudio === 'chapt_10_g_eimi1s',
+      `${await greekButtons.count()} Greek buttons, first audio ${JSON.stringify(firstPresentAudio)}`);
+    await page.evaluate(() => { window.__clips.length = 0; });
+    await glosses.first().click();
+    await page.waitForTimeout(120);
+    check('5G-SPEC2 eimi charts: all English glosses are plain, ink, and not tappable',
+      await glosses.count() === 12 && glossesPlain && (await clips()).length === 0,
+      `${await glosses.count()} glosses, plain ${glossesPlain}, clips ${(await clips()).length}`);
+  }
+
+  await modal.getByRole('button', { name: 'Close', exact: true }).click();
+  await page.waitForTimeout(80);
+  check(`${label}: the form-dependent Hint closes`, await page.locator('.hint-modal').count() === 0);
+}
+
 // ---- G8 the Quick Review paradigm pair is stacked, not paged ------------
 for (const [chapterId, activityId] of [
   ['chapt_9', 'c9_qr_paradigms'], ['chapt_10', 'c10_qr_paradigms']
@@ -3575,130 +3669,37 @@ check('5G G8 ch8 third person stays a More/Back sequence (its charts are named)'
     && await page.locator('.paradigm').count() === 1
     && await page.locator('[data-paradigm-switch="more"]').count() === 1);
 
-// ---- G9 "Repeat This Exercise" (5G-SPEC1 §4.5) ---------------------------
-// PRESENCE and DEFAULT only. The behavior behind the box is EXTRAPOLATED
-// (replay the verse, clear the slate, completion unaffected) and VERIFY-5G
-// item (d) is what settles it; asserting modelled semantics here would pin
-// down a guess as though it were the original. 5G-SPEC1 §7 says the same:
-// extend the harness for this path only after item (d) resolves.
+// ---- G9 Repeat is retired; retry-until-right remains (5G-SPEC2 §2/§5) ----
 for (const [chapterId, activityId] of [
   ['chapt_9', 'c9_ex_scripture_speller'], ['chapt_10', 'c10_ex_scripture_speller']
 ]) {
   await go(`#/activity/${chapterId}/${activityId}`);
-  const box = page.locator('.spell-checks [data-repeat-exercise] input');
-  check(`5G G9 ${activityId}: the Repeat This Exercise checkbox is present and OFF by default`,
-    await box.count() === 1 && !await box.isChecked()
-      && normalizeText(await page.locator('.spell-checks [data-repeat-exercise]').innerText()) === 'Repeat This Exercise');
-}
-// The whole-verse spellers of the earlier chapters have no such control in
-// the original and gain none here.
-for (const [chapterId, activityId] of [
-  ['chapt_3', 'c3_ex_scripture_speller'], ['chapt_8', 'c8_ex_scripture_speller']
-]) {
-  const activity = activityById(CHAPTERS[chapterId], activityId);
-  if (!activity) continue;
-  await go(`#/activity/${chapterId}/${activityId}`);
-  check(`5G G9 ${activityId} (pre-ch9): no Repeat checkbox`,
-    await page.locator('.spell-checks [data-repeat-exercise]').count() === 0);
+  check(`5G-SPEC2 ${activityId}: Repeat This Exercise is absent and Restart remains`,
+    await page.locator('[data-repeat-exercise]').count() === 0
+      && !(await page.locator('.spell-checks').innerText()).includes('Repeat This Exercise')
+      && await page.locator('.card').getByRole('button', { name: 'Restart Exercise', exact: true }).count() === 1);
+
+  // A deliberately wrong first word must stay in the field, reveal no answer,
+  // and remain editable for another attempt.
+  await setAccents(false);
+  await typeGreek('α');
+  const before = normalizeText(await typed());
+  await stepper('Check Answer').click();
+  await page.waitForTimeout(120);
+  await typeGreek('β');
+  const after = normalizeText(await typed());
+  check(`5G-SPEC2 ${activityId}: a wrong Check Answer keeps the typed text and permits retry`,
+    before === 'α' && after === 'αβ' && await feedbackKind() === 'bad'
+      && await page.locator('.spell-answer').count() === 0,
+    `field ${JSON.stringify(before)} -> ${JSON.stringify(after)}, feedback ${await feedbackKind()}`);
 }
 
 
 
 // ===================================================================
-// 5G-XPATCH1: the two cross-ported pieces
+// 5G-XPATCH1: N-stage commit-order coverage retained
 // ===================================================================
 
-// ---- X1 the repeat lifecycle only fires on a clip that FINISHED ---------
-// D-42 clears what the learner typed once the verse has been spoken. "Spoken"
-// has to mean ENDED: a clip cut off by a route exit, a screen lock or a
-// superseding tap is not the learner hearing their verse, and wiping the slate
-// on the strength of one would be the worst possible reading of a checkbox
-// they ticked. playThrough now reports which happened; this pins all three
-// paths on chapter 9's SM speller (chapter 10 mounts the same component).
-{
-  const HASH = '#/activity/chapt_9/c9_ex_scripture_speller';
-  const activity = activityById(ch9, 'c9_ex_scripture_speller');
-  const verseWords = stripAccents((activity.answerWords || []).join(' '));
-  const repeatBox = () => page.locator('.spell-checks [data-repeat-exercise] input');
-  const completedIn = () => page.evaluate(() => {
-    try { return JSON.parse(localStorage.getItem('greek-tutor-progress-v1') || '{}').completed || {}; }
-    catch { return {}; }
-  });
-  // The preview ships no audio, so the verse clip is seeded into the store the
-  // app already reads (the same route §6.2's long-clip cases use). A SHORT one
-  // here: the point is a clip that reaches its own `ended` quickly.
-  const versePath = audioPath(activity.audio);
-  const solveIt = async () => {
-    await setAccents(false);
-    await typeAccented(verseWords);
-    await stepper('Check Answer').click();
-  };
-
-  // (c) REPEAT OFF is unchanged: the verse is spoken and what was typed STAYS.
-  await go(HASH);
-  await seedLongClip([versePath], 0.4);
-  await go(HASH);
-  await solveIt();
-  await page.waitForTimeout(1200);
-  check('5G-X1 repeat OFF: a solved verse plays and the slate is left alone',
-    await feedbackKind() === 'ok' && normalizeText(await typed()).length > 0
-      && !await repeatBox().isChecked(),
-    `feedback ${await feedbackKind()}, field ${JSON.stringify((await typed()).slice(0, 24))}`);
-
-  // (a) REPEAT ON, clip plays to its natural end -> the slate clears for
-  // another pass, and completion is recorded and STAYS recorded.
-  await go(HASH);
-  await repeatBox().check();
-  await solveIt();
-  await page.waitForTimeout(1600);
-  {
-    const completed = await completedIn();
-    check('5G-X1 repeat ON, clip reaches its end: the slate clears and completion stands',
-      normalizeText(await typed()) === '' && completed.c9_ex_scripture_speller === true
-        && await repeatBox().isChecked(),
-      `field ${JSON.stringify(await typed())}, completed ${completed.c9_ex_scripture_speller}`);
-  }
-
-  // (b) REPEAT ON, but the clip is CUT OFF. This is the assertion that
-  // discriminates: under the old contract playThrough resolved the same way
-  // whether a clip ended or was interrupted, so an interrupted verse cleared
-  // the slate exactly as a finished one did.
-  //
-  // The interruption used here is a SUPERSEDING TAP — Pronounce, mid-verse —
-  // because it leaves the component mounted and the field readable. A route
-  // exit and a screen lock reach the same pause; a route exit additionally
-  // unmounts, which the `destroyed` guard covers and which is checked below
-  // for the thing that IS observable across it, completion.
-  await go(HASH);
-  await seedLongClip([versePath], 5);          // long enough to interrupt
-  await go(HASH);
-  await repeatBox().check();
-  await solveIt();
-  await page.waitForTimeout(300);
-  const typedMidClip = normalizeText(await typed());
-  await stepper('Pronounce').click();          // supersedes the verse mid-play
-  await page.waitForTimeout(900);
-  check('5G-X1 repeat ON, verse INTERRUPTED mid-clip: the slate is NOT wiped',
-    typedMidClip.length > 0 && normalizeText(await typed()).length > 0,
-    `field mid-clip ${JSON.stringify(typedMidClip.slice(0, 24))}, field after the interruption ${JSON.stringify((await typed()).slice(0, 24))}`);
-
-  // ...and leaving the page mid-clip does not un-complete the exercise. The
-  // clear itself is unobservable across an unmount (the page comes back
-  // freshly mounted either way); completion is the state that survives, and
-  // it is what D-42 says the repeat pass must not touch.
-  await go(HASH);
-  await repeatBox().check();
-  await solveIt();
-  await page.waitForTimeout(250);
-  await go('#/activity/chapt_9/c9_learn_scripture');      // route exit mid-clip
-  await page.waitForTimeout(600);
-  const completedAfter = await completedIn();
-  check('5G-X1 repeat ON, page left mid-clip: completion still stands',
-    completedAfter.c9_ex_scripture_speller === true,
-    `completed ${completedAfter.c9_ex_scripture_speller}`);
-  await seedLongClip([versePath], 0.4);
-}
-
 // ---- X2 the N-stage commit order --------------------------------------
 // 5G-SPEC1 §4.1 says both "commits on the final stage's click" and "exactly as
 // the two-stage c8_drill_case behaves" (device-verified either-order,
@@ -3790,6 +3791,56 @@ for (const [chapterId, activityId] of [
   }
 }
 
+// ---- G10 six future-eimi answer-key flips (5G-SPEC2 §4/§5) -------------
+// These fixtures are deliberately independent of the JSON's answer field. A
+// harness that reads "Active" from the same data it is meant to police would
+// bless a future Active -> Middle regression instead of catching it. The spec
+// names zero-based indices 22, 23, 24, 25, 26 and 28.
+for (const [itemIndex, greek, personNumber] of [
+  [22, 'ἔσῃ', 'Second Singular'],
+  [23, 'ἔσεσθε', 'Second Plural'],
+  [24, 'ἔσομαι', 'First Singular'],
+  [25, 'ἔσται', 'Third Singular'],
+  [26, 'ἐσόμεθα', 'First Plural'],
+  [28, 'ἔσονται', 'Third Plural']
+]) {
+  const label = `5G-SPEC2 parsing index ${itemIndex} ${greek}`;
+  const stage = index => page.locator(`[data-stage="${index}"]`);
+  const choose = async (index, value) => {
+    await stage(index).getByRole('button', { name: value, exact: true }).click();
+    await page.waitForTimeout(70);
+  };
+
+  let reached = await seekSelectPrompt('#/activity/chapt_10/c10_drill_parsing', greek, parsing10.items.length);
+  if (reached) {
+    await choose(0, 'Future');
+    await choose(1, 'Active');
+    await choose(2, personNumber);
+    await page.waitForTimeout(180);
+  }
+  check(`${label}: Future Active grades correct`,
+    normalizeText(parsing10.items[itemIndex]?.greek) === normalizeText(greek)
+      && reached && await feedbackKind() === 'ok'
+      && normalizeText(await stage(1).locator('.tile.selected').innerText()) === 'Active',
+    reached ? `feedback ${await feedbackKind()}` : 'target form not reached');
+
+  reached = await seekSelectPrompt('#/activity/chapt_10/c10_drill_parsing', greek, parsing10.items.length);
+  if (reached) {
+    await choose(0, 'Future');
+    await choose(1, 'Middle');
+    await choose(2, personNumber);
+    await page.waitForTimeout(180);
+  }
+  const revealedVoice = reached
+    ? (await stage(1).locator('.tile.correct').allInnerTexts()).map(normalizeText)
+    : [];
+  check(`${label}: Future Middle grades incorrect and reveals Active`,
+    reached && await feedbackKind() === 'bad'
+      && normalizeText(await stage(1).locator('.tile.selected').innerText()) === 'Middle'
+      && revealedVoice.includes('Active'),
+    reached ? `feedback ${await feedbackKind()}, revealed ${JSON.stringify(revealedVoice)}` : 'target form not reached');
+}
+
 
 await browser.close();
 const failed = results.filter(r => !r.ok);
diff --git a/scripts/ui-modals.mjs b/scripts/ui-modals.mjs
index 91aff6d..8429910 100644
--- a/scripts/ui-modals.mjs
+++ b/scripts/ui-modals.mjs
@@ -91,6 +91,26 @@ const hint = (chapterId, activityId, meanings) => async () => {
   }
 };
 
+// Form-dependent Hints cannot be covered by opening whichever shuffled item
+// happens to mount first. Seek the named form through the activity's real Next
+// control, then open the modal variant that form routes to.
+const normalizeText = value => String(value ?? '').replace(/\s+/g, ' ').trim().normalize('NFC');
+const hintAtPrompt = (chapterId, activityId, prompt, itemCount) => async () => {
+  await go(`#/activity/${chapterId}/${activityId}`);
+  const next = () => page.locator('.card').getByRole('button', { name: 'Next', exact: true });
+  let found = false;
+  for (let step = 0; step < itemCount; step++) {
+    const shown = normalizeText(await page.locator('.card .prompt').first().innerText());
+    if (shown === normalizeText(prompt)) { found = true; break; }
+    if (await next().isDisabled()) break;
+    await next().click();
+    await page.waitForTimeout(45);
+  }
+  if (!found) throw new Error(`never reached Hint form ${JSON.stringify(prompt)}`);
+  await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
+  await page.waitForTimeout(180);
+};
+
 const SURFACES = [
   // Chapter 2's four Hint surfaces, added 2026-08-13. Two of them are the ONLY
   // coverage of DivideActivity and PlaceAccentActivity, which -- with
@@ -154,10 +174,13 @@ const SURFACES = [
   // 5G: the cohort's new modals. The COMPOSITE hint is the tallest thing in
   // the app now — two full paradigm charts with glosses in one dialog — so it
   // is exactly the surface the modal-sizing rule exists for, and it is
-  // captured on both chapters. The popups are the content[] shape: a one-line
-  // aside, a six-row Greek list, and the arrow-form derivation chart.
+  // captured on both chapters. Chapter 10's parsing Hint has two payloads, so
+  // its luo and eimi forms are sought explicitly instead of trusting shuffle.
+  // The remaining popups are the content[] shape: a one-line aside and a
+  // six-row Greek list. Stem derivations are interspersed accordions now.
   ['ch9-composite-hint-middle-passive', hint('chapt_9', 'c9_drill_parsing', false)],
-  ['ch10-composite-hint-future-active-middle', hint('chapt_10', 'c10_drill_parsing', false)],
+  ['ch10-composite-hint-future-active-middle', hintAtPrompt('chapt_10', 'c10_drill_parsing', 'λύω', 30)],
+  ['ch10-composite-hint-eimi-present-future', hintAtPrompt('chapt_10', 'c10_drill_parsing', 'εἰμί', 30)],
   ['ch9-popup-punctiliar', async () => {
     await go('#/activity/chapt_9/c9_learn_mp_verbs');
     await page.locator('.rc-para .popup-link').first().click();
@@ -169,12 +192,6 @@ const SURFACES = [
     await page.locator('.rc-para .popup-link').first().click();
     await page.waitForTimeout(180);
   }],
-  ['ch10-popup-palatal', async () => {
-    await go('#/activity/chapt_10/c10_learn_future_verbs');
-    for (let i = 0; i < 3; i++) { await page.getByRole('button', { name: 'Next Topic', exact: true }).click(); await page.waitForTimeout(80); }
-    await page.locator('.rc-list .popup-link').first().click();
-    await page.waitForTimeout(180);
-  }],
   ['ch10-verse-speller-greek-keyboard', async () => {
     await go('#/activity/chapt_10/c10_ex_scripture_speller');
     await page.locator('.card').getByRole('button', { name: 'Greek Keyboard', exact: true }).click();
@@ -216,8 +233,22 @@ let bad = 0;
 for (const { name, width, height } of VIEWPORTS) {
   await page.setViewportSize({ width, height });
   for (const [label, open] of SURFACES) {
-    try { await open(); } catch (e) { console.log(`SKIP  ${label} @ ${name}: ${e.message.split('\n')[0]}`); continue; }
-    if (await page.locator('.modal-overlay').count() === 0) { console.log(`SKIP  ${label} @ ${name}: no modal opened`); continue; }
+    try {
+      await open();
+    } catch (e) {
+      const error = e.message.split('\n')[0];
+      console.log(`BAD  ${label} @ ${name}: ${error}`);
+      bad += 1;
+      report.push({ viewport: name, width, height, surface: label, error, ok: false });
+      continue;
+    }
+    if (await page.locator('.modal-overlay').count() === 0) {
+      const error = 'no modal opened';
+      console.log(`BAD  ${label} @ ${name}: ${error}`);
+      bad += 1;
+      report.push({ viewport: name, width, height, surface: label, error, ok: false });
+      continue;
+    }
 
     // AT REST. Nothing is scrolled before this measurement or this capture.
     const rest = await page.evaluate(() => {
diff --git a/scripts/ui-walk.mjs b/scripts/ui-walk.mjs
index 9c00b07..706eb19 100644
--- a/scripts/ui-walk.mjs
+++ b/scripts/ui-walk.mjs
@@ -109,7 +109,7 @@ const EXTRACT = () => {
     .map(el => ({ role: roleOf(el), text: el.textContent.trim() }));
   // Which words are tappable is a fidelity question (directive 9), so the dump
   // names them: prose taps, chart rows, paradigm cells and the lemma.
-  const taps = [...card.querySelectorAll('button.greek-tap, button.greek-say, button.pg-cell:not([disabled]), button.pg-lemma, button.rv-greek, button.ilv-word:not([disabled])')]
+  const taps = [...card.querySelectorAll('button.greek-tap, button.greek-say, button.pg-greek-tap:not([disabled]), button.pg-lemma, button.rv-greek, button.ilv-word:not([disabled])')]
     .filter(visible)
     .map(el => (el.querySelector('.greek') || el).textContent.trim()).filter(Boolean);
   const lists = [...card.querySelectorAll('ol')].filter(visible).map(ol => ({
@@ -413,9 +413,10 @@ for (const size of WIDTHS) {
         }
         await captureInteractiveStates(page, activity || {}, activityId, recordExtra, evidence);
 
-        // A topic-id hintRef exercises the 5E resolver through its real modal
-        // host. Capture it at both widths and prove it can close cleanly.
-        if (activity?.ui?.hintRef) {
+        // A topic-id or item-level hintRef exercises the resolver through its
+        // real modal host. Capture the payload that the shuffled current form
+        // selects, label it from the rendered titles, and prove it closes.
+        if (activity?.ui?.hintRef || activity?.items?.some(item => item?.hintRef)) {
           const hint = page.locator('.card').first().getByRole('button', { name: 'Hint', exact: true });
           if (!await hint.count() || !await hint.isVisible()) {
             report.interactionErrors.push({ ...evidence, state: activityId, error: 'missing Hint control' });
@@ -423,9 +424,11 @@ for (const size of WIDTHS) {
             await hint.click();
             const modal = page.locator('.hint-modal');
             if (!await modal.count() || !await modal.isVisible() || !await modal.locator('.paradigm').count()) {
-              report.interactionErrors.push({ ...evidence, state: activityId, error: `Hint did not open paradigm "${activity.ui.hintRef}"` });
+              report.interactionErrors.push({ ...evidence, state: activityId, error: 'Hint did not open a paradigm' });
             } else {
-              await recordExtra(`${activityId}--hint`, `hint: ${activity.ui.hintRef}`);
+              const titles = (await modal.locator('.pg-title').allInnerTexts())
+                .map(text => text.replace(/\s+/g, ' ').trim()).filter(Boolean);
+              await recordExtra(`${activityId}--hint`, `hint: ${titles.join(' + ') || activity.ui?.hintRef || 'item hint'}`);
               await modal.getByRole('button', { name: 'Close', exact: true }).click();
               await page.waitForTimeout(50);
               if (await modal.count()) report.interactionErrors.push({ ...evidence, state: activityId, error: 'Hint did not close' });
diff --git a/src/app.css b/src/app.css
index f1efb34..82de7f9 100644
--- a/src/app.css
+++ b/src/app.css
@@ -838,8 +838,9 @@ button { font: inherit; cursor: pointer; }
 
 /* ---- PARADIGM CHART ----
    One grid, three hosts (Learn topic block, Quick Review page, drill Hint
-   popup). Person column + one column per number; each cell is a tappable
-   Greek form over its gloss. The glosses are the widest thing in the chart
+   popup). Person column + one column per number; each cell holds a tappable
+   Greek form over a static English gloss. The glosses are the widest thing in
+   the chart
    ("He/she/it looses/is loosing"), so the columns are fr units with min-width
    0 and the text wraps — at 320px the two data columns get ~110px each and
    the gloss runs to three lines rather than clipping. */
@@ -878,17 +879,27 @@ button { font: inherit; cursor: pointer; }
   color: var(--teal-dark); font-weight: 700; font-size: 0.9rem; }
 .pg-row-label { overflow-wrap: break-word; line-height: 1.2; }
 .pg-cell { display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 0;
-  background: transparent; border: none; padding: 9px 2px; text-align: center; }
-.pg-cell:active { background: rgba(0,0,0,0.04); border-radius: 8px; }
-.pg-cell:disabled { cursor: default; }
+  padding: 0 2px; text-align: center; }
+.pg-greek-tap { display: flex; align-items: center; justify-content: center; width: 100%; min-width: 0;
+  background: transparent; border: none; padding: 9px 0; text-align: inherit; }
+/* Keep the old cell geometry while leaving the English outside the button:
+   with a gloss, the button owns the top padding and the gloss owns the bottom. */
+.pg-cell-gloss .pg-greek-tap { padding-bottom: 0; }
+.pg-cell-gloss > .pg-gloss { padding-bottom: 9px; }
+.pg-greek-tap:active { background: rgba(0,0,0,0.04); border-radius: 8px; }
+.pg-greek-tap:disabled { cursor: default; }
 .pg-greek { font-size: 1.35rem; color: var(--link); overflow-wrap: anywhere; }
 .pg-long-forms { --pg-gap: 4px; }
 .pg-long-forms .pg-greek { font-size: 1.08rem; white-space: nowrap; overflow-wrap: normal; }
-.pg-cell:disabled .pg-greek { color: var(--ink); }
-.pg-gloss { font-size: 0.78rem; line-height: 1.3; color: var(--teal-dark); overflow-wrap: break-word; }
+.pg-greek-tap:disabled .pg-greek { color: var(--ink); }
+.pg-gloss { min-width: 0; max-width: 100%; font-size: 0.78rem; line-height: 1.3;
+  color: var(--teal-dark); overflow-wrap: anywhere; }
 .pg-many-columns .pg-head { font-size: 0.66rem; }
 .pg-many-columns .pg-person { font-size: 0.78rem; }
-.pg-many-columns .pg-cell { padding: 8px 0; }
+.pg-many-columns .pg-cell { padding: 0; }
+.pg-many-columns .pg-greek-tap { padding-top: 8px; padding-bottom: 8px; }
+.pg-many-columns .pg-cell-gloss .pg-greek-tap { padding-bottom: 0; }
+.pg-many-columns .pg-cell-gloss > .pg-gloss { padding-bottom: 8px; }
 .pg-many-columns .pg-greek { font-size: 0.92rem; white-space: nowrap; overflow-wrap: normal; }
 @media (min-width: 560px) {
   .pg-long-forms:not(.pg-many-columns) { --pg-gap: 6px; }
@@ -1131,7 +1142,7 @@ button, a, input, select, textarea, label,
 .rv-greek, .lm-row, .rc-defrow, .rc-example, .greek-chip, .greek-tap,
 .seg, .flash-hidden, .icon-btn, .bb-item, .section-head, .collapse-head,
 .rc-expander summary, .accent-slot,
-.pg-cell, .pg-lemma, .ilv-word,
+.pg-greek-tap, .pg-lemma, .ilv-word,
 .one-syllable-bar {
   touch-action: manipulation;
 }
@@ -1401,6 +1412,21 @@ button, a, input, select, textarea, label,
 .rc-pfrows.arrow-form .rc-pfcell { flex-direction: row; align-items: baseline; }
 .rc-pfrows.arrow-form .rc-pfgloss { grid-column: 1 / -1; margin-bottom: 8px; }
 .rc-pfarrow { color: var(--ink); font-size: 0.95rem; }
+/* 5G-SPEC2: Stem Variations places the existing arrow chart inside both a
+   numbered item's hanging indent and an Examples accordion. At the 320px
+   floor, reclaim the accordion padding and tighten only that nested chart so
+   long forms such as ἀποστέλλω stay inside the card. */
+@media (max-width: 359px) {
+  /* The three-column adjective charts sit at the font's exact intrinsic
+     width. Once Greek and gloss became siblings, two forms and the Masculine
+     heading exposed 2-3px of that old button overflow; keep them inside their
+     columns at the supported 320px floor. */
+  .paradigm.pg-three-columns.pg-long-forms .pg-head { font-size: 0.7rem; }
+  .paradigm.pg-three-columns.pg-long-forms .pg-greek { font-size: 1.04rem; }
+  .rc-item-below .rc-expander-body { padding-left: 8px; padding-right: 8px; }
+  .rc-item-below .rc-pfrows.arrow-form { column-gap: 4px; }
+  .rc-item-below .rc-pfrows.arrow-form .rc-pfgreek { font-size: 1.05rem; }
+}
 @media (min-width: 560px) {
   .rc-pfrows.arrow-form { grid-template-columns: auto auto auto minmax(0, 1fr); }
   .rc-pfrows.arrow-form .rc-pfgloss { grid-column: auto; margin-bottom: 0; }
diff --git a/src/components/MeaningsCard.svelte b/src/components/MeaningsCard.svelte
index 37b77a4..6dc51c8 100644
--- a/src/components/MeaningsCard.svelte
+++ b/src/components/MeaningsCard.svelte
@@ -38,14 +38,18 @@
       <div class="pg-row" data-row-index={rowIndex}>
         <span class="pg-person pg-row-label">{row.label ?? row.person ?? ''}</span>
         {#each row.cells || [] as cell, cellIndex}
-          <button
+          <div
             class="pg-cell"
-            data-cell-index={cellIndex}
-            disabled={!cell.audio}
-            on:click={() => cell.audio && play(cell.audio)}>
-            <span class="greek pg-greek">{cell.greek}</span>
+            class:pg-cell-gloss={!!cell.gloss}
+            data-cell-index={cellIndex}>
+            <button
+              class="pg-greek-tap"
+              disabled={!cell.audio}
+              on:click={() => cell.audio && play(cell.audio)}>
+              <span class="greek pg-greek">{cell.greek}</span>
+            </button>
             {#if cell.gloss}<span class="pg-gloss">{cell.gloss}</span>{/if}
-          </button>
+          </div>
         {/each}
       </div>
     {/each}
diff --git a/src/components/Paradigm.svelte b/src/components/Paradigm.svelte
index 85972f5..a5d86f4 100644
--- a/src/components/Paradigm.svelte
+++ b/src/components/Paradigm.svelte
@@ -113,6 +113,7 @@
   class:pg-case-labels={hasCaseLabels}
   class:pg-long-case-labels={hasLongCaseLabels}
   class:pg-long-forms={hasLongForms}
+  class:pg-three-columns={columns.length === 3}
   class:pg-many-columns={columns.length > 3}
   data-chart-index={chartIndex}
   data-chart-count={charts.length}
@@ -188,14 +189,18 @@
         <div class="pg-row" data-row-index={rowIndex}>
           <span class="pg-person pg-row-label">{row.label ?? row.person ?? ''}</span>
           {#each row.cells || [] as cell, cellIndex}
-            <button
+            <div
               class="pg-cell"
-              data-cell-index={cellIndex}
-              disabled={!cell.audio}
-              on:click={() => cell.audio && play(cell.audio)}>
-              <span class="greek pg-greek">{cell.greek}</span>
+              class:pg-cell-gloss={showGlosses && !!cell.gloss}
+              data-cell-index={cellIndex}>
+              <button
+                class="pg-greek-tap"
+                disabled={!cell.audio}
+                on:click={() => cell.audio && play(cell.audio)}>
+                <span class="greek pg-greek">{cell.greek}</span>
+              </button>
               {#if showGlosses && cell.gloss}<span class="pg-gloss">{cell.gloss}</span>{/if}
-            </button>
+            </div>
           {/each}
         </div>
       {/each}
diff --git a/src/components/SelectActivity.svelte b/src/components/SelectActivity.svelte
index 49a8a21..c7d0122 100644
--- a/src/components/SelectActivity.svelte
+++ b/src/components/SelectActivity.svelte
@@ -184,7 +184,11 @@
   // three verb drills all open the λύω paradigm, which the original shows as a
   // popup, so a hintRef opens a modal.
   $: hintBlocks = resolveHintBlocks(chapter, activity.hint);
-  $: hintChart = activity.ui?.hintRef ? resolveHintRef(chapter, activity.ui.hintRef) : null;
+  // A form may override the drill's default chart. The question builder keeps
+  // that reference attached while shuffling; forms without one retain the
+  // activity-level Hint.
+  $: activeHintRef = current?.hintRef ?? activity.ui?.hintRef;
+  $: hintChart = activeHintRef ? resolveHintRef(chapter, activeHintRef) : null;
   // 5F-FEEDBACK2 items 13/28 (Nathanael, 2026-08-09): a MULTI-PAGE hint, the
   // original's More/Back-paged popup. ui.hintPages lists pages by reference —
   // { hintRef } (a chart; a stack of N charts flattens to N pages, one chart
diff --git a/src/components/SpellVerseActivity.svelte b/src/components/SpellVerseActivity.svelte
index 4e488ed..0e8b190 100644
--- a/src/components/SpellVerseActivity.svelte
+++ b/src/components/SpellVerseActivity.svelte
@@ -35,17 +35,9 @@
   // is waiting — 5E-SPEC2 shipped a "Click Next to continue" line here for the
   // withdrawn `spellUntilRight` class, and it is gone with the class (D-28).
   //
-  // 5G-SPEC1 §4.5 adds the original's "Repeat This Exercise" CHECKBOX, which
-  // first appears on this page in chapter 9. Default OFF; when it is on, a
-  // successful Check Answer plays the verse (C7, as always) and then clears
-  // the slate for another pass. Completion is unaffected — the exercise is
-  // done the first time it is answered, and a learner choosing to type it
-  // again is practising, not re-earning it. THESE SEMANTICS ARE EXTRAPOLATED,
-  // not observed in DOSBox: VERIFY-5G item (d) settles them, and nothing
-  // beyond replay-and-clear is invented here in the meantime.
   import { onMount, onDestroy } from 'svelte';
   import { randomFeedback } from '../lib/content.js';
-  import { play, playThrough, stop as stopAudio } from '../lib/audio.js';
+  import { play, stop as stopAudio } from '../lib/audio.js';
   import { markCompleted } from '../lib/progress.js';
   import { checkVerse } from '../lib/answer-check.js';
   import * as input from '../lib/speller-input.js';
@@ -70,18 +62,6 @@
   let showKeyboard = false;
   let withAccents = false;
   let solved = false;
-  // §4.5. Present only where the data declares it (chapters 9 and 10); the
-  // three earlier whole-verse spellers have no such control in the original
-  // and gain none here. `repeatToken` cancels a pending replay-then-clear the
-  // way advanceToken does in SelectActivity: Restart, a route change or an
-  // unmount must not have the slate cleared out from under it a clip later.
-  // `destroyed` says the same thing for the unmount case in its own right,
-  // because clearing state on a dead component is worth refusing explicitly
-  // rather than by side effect (5G-XPATCH1 §1).
-  $: repeatCheckbox = activity.repeatCheckbox === true;
-  let repeatExercise = false;
-  let repeatToken = 0;
-  let destroyed = false;
 
   $: audioTiming = activity.audioTiming || 'afterGuess';
 
@@ -111,36 +91,12 @@
       feedback = randomFeedback(chapter, 'correct');
       feedbackKind = 'ok';
       detail = null;
-      // Completion is recorded on the FIRST success and is not touched by the
-      // repeat pass (§4.5): the exercise stays done.
       markCompleted(activity.id);
       // §2.5 / C7: hear the verse you just spelled. Nothing is waiting on the
       // clip here — rule B1b: one item, so there is no next item for it to
       // talk over and nothing for the auto-advance to advance to.
-      const repeating = repeatCheckbox && repeatExercise;
       if (audioTiming !== 'none' && activity.audio) {
-        if (repeating) {
-          // The verse is spoken in FULL before the slate clears — clearing it
-          // under the clip would leave the learner listening to a verse that
-          // is no longer on screen.
-          //
-          // AND ONLY IF IT ACTUALLY FINISHED (5G-XPATCH1 §1). playThrough
-          // resolves false for a clip cut off by a route exit, a screen lock
-          // or a superseding tap, and none of those is the learner hearing
-          // their verse — wiping what they typed on the strength of a clip
-          // that never played would be the worst possible reading of a
-          // checkbox they ticked. The token and `destroyed` cover the other
-          // half: a Restart or an unmount BETWEEN the success and the clip's
-          // end, and the checkbox being unticked while it played.
-          const token = ++repeatToken;
-          playThrough(activity.audio).then(finished => {
-            if (finished && repeatExercise && !destroyed && token === repeatToken) clearSlate();
-          });
-        } else {
-          play(activity.audio);
-        }
-      } else if (repeating) {
-        clearSlate();
+        play(activity.audio);
       }
       return;
     }
@@ -152,8 +108,7 @@
       : { text: 'There are more words here than the verse has.' };
   }
 
-  // An empty surface, ready to be typed again. Shared by Restart and by the
-  // repeat pass, so "another go" means exactly one thing on this page.
+  // An empty surface, ready to be typed again via Restart Exercise.
   function clearSlate() {
     buffer = input.clear();
     feedback = '';
@@ -165,7 +120,6 @@
 
   function restart() {
     stopAudio();
-    repeatToken += 1;                 // cancel a replay-then-clear in flight
     clearSlate();
   }
 
@@ -185,8 +139,6 @@
   onMount(() => window.addEventListener('keydown', onKey));
   onDestroy(() => {
     window.removeEventListener('keydown', onKey);
-    destroyed = true;
-    repeatToken += 1;                              // no clear after unmount
     stopAudio();                                   // §3.1
   });
 </script>
@@ -217,9 +169,6 @@
   <div class="spell-checks">
     <label><input type="checkbox" bind:checked={showAnswer} /> Show Answer</label>
     <label><input type="checkbox" bind:checked={withAccents} /> With Accents</label>
-    {#if repeatCheckbox}
-      <label data-repeat-exercise><input type="checkbox" bind:checked={repeatExercise} /> Repeat This Exercise</label>
-    {/if}
   </div>
 
   <SpellerKeyboard
diff --git a/src/lib/audio.js b/src/lib/audio.js
index 7247a5e..8504603 100644
--- a/src/lib/audio.js
+++ b/src/lib/audio.js
@@ -135,14 +135,10 @@ export function stop() {
 // no longer playing. It NEVER rejects — a caller's advance must not be lost to
 // a missing file.
 //
-// IT ALSO REPORTS HOW PLAYBACK ENDED (5G-XPATCH1 §1): `true` only when the
-// clip reached its own `ended`, `false` when it was paused, errored, failed to
-// start, or was superseded by a newer play. Every advance caller races this
-// against a minimum timer and ignores the value — an interrupted clip should
-// release the wait either way. The caller that needs the distinction is the
-// whole-verse speller's repeat pass (D-42): it clears what the learner typed
-// once the verse has been spoken, and a clip cut off by a route exit, a screen
-// lock or a superseding tap must NOT go on to wipe the slate.
+// It also reports how playback ended: `true` only when the clip reached its
+// own `ended`, `false` when it was paused, errored, failed to start, or was
+// superseded by a newer play. Current advance callers ignore that distinction;
+// either outcome releases their wait immediately.
 // WHICH EVENT FIRED IS NOT THE ANSWER — `audio.ended` IS. A clip that reaches
 // its end fires `pause` AND `ended` (the spec pauses the element on the way
 // out, and Chrome delivers them in that order), so a listener that resolved
diff --git a/src/lib/content.js b/src/lib/content.js
index 6b1b613..af8cd60 100644
--- a/src/lib/content.js
+++ b/src/lib/content.js
@@ -486,6 +486,10 @@ export function buildTwoStageQuestions(chapter, activity) {
       // disabled — a control the original has, that does nothing.
       translate: stripMarkup(item.translate) || null,
       gloss: stripMarkup(item.gloss) || null,
+      // A parsing form may route Hint to a chart specific to that form.
+      // Preserve the override through the shuffle; the surface falls back to
+      // the drill-level reference when this is absent.
+      hintRef: item.hintRef,
       answer,
       pairs,
       accepted: new Set(pairs.map(pairKey)),
@@ -597,6 +601,7 @@ export function buildSelectQuestions(chapter, activity) {
         // from `gloss`, which chapter 2's one-attempt drills reveal on their
         // own once an item is answered — a translation is shown on request.
         translate: stripMarkup(item.translate) || null,
+        hintRef: item.hintRef,
         reveals,
         correctForm: item.correctForm || null,
         redMarkCluster: item.redMarkCluster || null,
@@ -671,26 +676,26 @@ function optionClassForLayout(layout, activity, activityOptions, questions) {
   return longest <= 3 ? 'wide' : '';
 }
 
-// A hintRef names a CHART TYPE that already exists in the chapter — chapter
-// 3's three verb drills all open the same λύω paradigm the Learn page draws
-// (the original's Hint popup). Resolving by block type keeps the hint from
-// duplicating, or inventing, authored content and stays mode-keyed: any later
-// chapter whose drills point at their own paradigm gets this for free.
+// A hintRef names a chart source in the chapter: an existing chart by id/type/
+// title, or a chapter-level hintCharts entry. Chapter 3's three verb drills all
+// open the same λύω paradigm the Learn page draws; later composite entries may
+// bundle referenced or inline paradigms for one stacked Hint popup.
 export function resolveHintRef(chapter, ref) {
   if (!chapter || !ref) return null;
-  // 5G-SPEC1 §4.8: a chapter-level `hintCharts` register may name a COMPOSITE
-  // hint — one popup holding several of the chapter's charts, referenced by
-  // id (`paradigmRefs`). Both chapter-9 drills open the Middle and Passive
-  // paradigms together and both chapter-10 drills open Future Active and
-  // Future Middle together; the original draws them stacked under one Cancel
-  // (ch10railwalk p7), so the composite resolves to a `paradigms[]` bundle the
+  // A chapter-level `hintCharts` register names a COMPOSITE hint: one popup
+  // holding several paradigms, either referenced by id (`paradigmRefs`) or
+  // authored inline (`charts`). It resolves to one `paradigms[]` bundle the
   // surface renders as a stack. Checked FIRST, so a composite id can never be
   // shadowed by an activity or topic that happens to share its name.
   const composite = chapter.hintCharts && chapter.hintCharts[ref];
   if (composite) {
-    const paradigms = (composite.paradigmRefs || [])
-      .map(chartRef => resolveHintRef(chapter, chartRef))
-      .filter(Boolean);
+    // Composites either reference charts authored elsewhere in the chapter or
+    // own inline paradigm blocks. Normalize both forms to the same stack.
+    const paradigms = Array.isArray(composite.charts) && composite.charts.length
+      ? composite.charts.filter(Boolean)
+      : (composite.paradigmRefs || [])
+        .map(chartRef => resolveHintRef(chapter, chartRef))
+        .filter(Boolean);
     if (!paradigms.length) return null;
     if (paradigms.length === 1) return paradigms[0];
     return { paradigms, title: composite.title || null };
diff --git a/buildout/5G-SPEC2-RESULTS.md b/buildout/5G-SPEC2-RESULTS.md
new file mode 100644
index 0000000..dbc557d
--- /dev/null
+++ b/buildout/5G-SPEC2-RESULTS.md
@@ -0,0 +1,138 @@
+# 5G-SPEC2 Results
+
+Date: 2026-08-16
+
+Status: implemented and verified. No commit or push was made by this implementation round.
+
+## Outcome
+
+The chapter 9/10 closure work is complete:
+
+- the retired Scripture Memory Repeat control and its replay-then-clear state are removed;
+- a wrong whole-verse answer still leaves the slate intact and editable, while `Restart Exercise` remains;
+- parsing questions retain an item-level `hintRef` through shuffle and use it ahead of the drill default;
+- `hintCharts` resolves both referenced `paradigmRefs` and inline `charts` to the existing stacked-modal renderer;
+- chapter 10 εἰμί forms open one Present/Future modal with two stacked charts, no pager, no autoplay path, and one pinned Close control;
+- paradigm Greek is the audio button while its English gloss is an inert sibling;
+- the six corrected future-εἰμί forms are independently pinned as Future Active in the browser harness;
+- the five Stem Variations render as interspersed, initially collapsed `Examples` accordions; and
+- the shape, behavior, modal, rail-walk, production-build, lazy-chunk, and offline guards are updated and green.
+
+## Delivered data and checkpoint
+
+The requested data checkpoint already existed before implementation began:
+
+```text
+021a03df2ab0862f296cbb58614aacdd0e2e7b3f
+saving all data files prior to phase 5g spec 2
+M src/data/chapt-09.json
+M src/data/chapt-10.json
+```
+
+That is Nathanael's commit, immediately above the stated `ecc5365` lineage. The user explicitly requested no commit, so I treated `021a03d` as the required first/data-only checkpoint and left every implementation change uncommitted.
+
+The two delivered files were not edited during this round. Their SHA-256 values are:
+
+| File | SHA-256 |
+| --- | --- |
+| `src/data/chapt-09.json` | `BC806C190154B0736043A99A5DBCE988C5065DBBDE7078C7C7BCEB4BBB2EF2AB` |
+| `src/data/chapt-10.json` | `92A5C49C980DDD9E0867F1041F93D2498D93D536D2352B384F15AACE011F86F5` |
+
+Post-replacement checks:
+
+- all 24 JSON files under `src/data` parse;
+- the PowerShell equivalent of `grep -c repeatCheckbox src/data/*.json` found 0 matches;
+- `eimiParadigms` occurs 11 times in `chapt-10.json` (10 item references plus the registry entry);
+- chapter 9 objective 6 reads `memorize Rom 6:23b in Greek.`;
+- chapter 9 contains the corrected `I come, go` gloss;
+- both Scripture Memory spellers contain only `Show Answer` and `With Accents` in `ui.checkboxes`;
+- chapter 10 parsing has 30 items, with exactly 10 `eimiParadigms` overrides;
+- `futureParadigms` contains two `paradigmRefs`, while `eimiParadigms` contains two inline `charts`;
+- zero-based indices 22, 23, 24, 25, 26, and 28 are respectively `ἔσῃ`, `ἔσεσθε`, `ἔσομαι`, `ἔσται`, `ἐσόμεθα`, and `ἔσονται`, all authored Future Active with the specified person/number; and
+- every one of the five Stem Variation items has exactly one `below` expander labelled `Examples`.
+
+`git diff --name-only -- src/data public/audio/audio-manifest.json` is empty. No chapter data, lexicon, or audio manifest changed.
+
+## Implementation by module
+
+### Repeat retirement
+
+`src/components/SpellVerseActivity.svelte` no longer imports `playThrough`, renders `[data-repeat-exercise]`, or maintains `repeatExercise`, `repeatToken`, `repeatCheckbox`, or destroyed/replay-clear state. A correct answer still marks the activity complete and plays its verse once. The wrong-answer branch is unchanged. `Restart Exercise` still stops audio and clears the slate, and unmount still stops audio.
+
+`src/lib/audio.js` retains `playThrough` because four advancing activity components still use completion timing, but its obsolete comment naming the retired Repeat pass as the boolean-result consumer was removed.
+
+### Form-dependent hints
+
+`src/lib/content.js` now preserves `item.hintRef` in both two-stage and authored select question builders. `resolveHintRef` checks `hintCharts` first, accepts exactly the existing referenced shape or the new inline shape, and normalizes either to the same `paradigms` stack.
+
+`src/components/SelectActivity.svelte` resolves `current.hintRef ?? activity.ui.hintRef`. The existing composite modal therefore renders the two inline εἰμί charts in one stack with their authored titles, no More/Back controls, and the existing single Close footer.
+
+### Greek-tap contract and narrow layout
+
+While implementing section 3.4, I found code/spec drift: both `Paradigm.svelte` and its shared `MeaningsCard.svelte` made the entire Greek-plus-English cell a button. Clicking the English gloss therefore played the Greek clip, contrary to Directive 9 and this spec's explicit English-not-tappable requirement.
+
+The surgical correction makes `.pg-cell` an inert layout container, puts only the Greek in `button.pg-greek-tap`, and leaves `.pg-gloss` as a sibling. The CSS retains the old padding and disabled-ink treatment. This is an interaction-boundary correction, not the out-of-scope Meanings disclosure restyle.
+
+The first 320px rail pass then exposed two width effects from the corrected structure and data nesting: slash-separated gloss text contributed intrinsic width, and the arrow examples lost width to both the numbered-list indent and accordion padding. Explicit gloss wrapping plus a `max-width: 359px` rule scoped to arrow charts inside `.rc-item-below` removed the overflow. The rerun measured 0px at every chapter 9/10 stop and retained the wide layouts unchanged.
+
+## Harness changes
+
+| Harness | Change |
+| --- | --- |
+| `check-content-shapes.mjs` | Permanently rejects any owned `repeatCheckbox` or `Repeat This Exercise` checkbox; validates exactly one non-empty hint-chart shape; validates inline paradigm blocks; walks every item/UI `hintRef`. |
+| `ui-behavior.mjs` | Replaces popup-era Stem checks; targets λύω and both εἰμί forms independent of shuffle; asserts 12 Greek buttons and 12 inert glosses; asserts Repeat absence plus retained retry semantics on both spellers; hard-codes Active-correct/Middle-wrong checks for all six corrected forms. |
+| `ui-modals.mjs` | Replaces the removed palatal popup with an explicit εἰμί hint surface, explicitly seeks both chapter 10 hint variants, and treats an opener failure or absent modal as `BAD` rather than silently skipping it. |
+| `ui-walk.mjs` | Inventories `pg-greek-tap`, recognizes activity- or item-level hint routes, and labels captured hints from the rendered chart titles. Its generic disclosure walk opens all five Stem accordions. |
+
+Suite totals:
+
+- behavior: 857 at the actual starting HEAD to 871, all passing. The older 856 figure in the XPATCH handoff predates a later checked-in accordion assertion;
+- modal matrix: 150 to 150. One obsolete popup surface was removed and one explicit εἰμί surface was added, preserving 30 surfaces across five viewports; and
+- chapter 9/10 rail scope: 44 stops at two widths, with 114 expected width-specific page states.
+- full shared-renderer regression scope: 219 stops at two widths, with 612 expected width-specific page states.
+
+## Verification evidence
+
+| Command/check | Final result |
+| --- | --- |
+| `npm.cmd run check:shapes` | PASS: all 10 chapter files and the expanded Repeat/hint-reference invariants |
+| `npm.cmd run build` (through `npm.cmd run verify`) | PASS: 101 modules transformed; PWA precache 37 entries |
+| `npm.cmd run check:lazy-chunk` | PASS: 10 chapter chunks plus 10 lexicon chunks emitted and precached; chapter data absent from the main chunk |
+| `npm.cmd run ui:behavior` with `BASE=http://127.0.0.1:4173` | PASS: 871/871 behavior checks |
+| `npm.cmd run ui:modals -- --base=http://127.0.0.1:4173 ...` | PASS: 150/150 modal states at 390x844, 390x734, 390x664, 320x360, and 768x1024; pinned Close; zero overlay overflow |
+| `npm.cmd run ui:walk -- --base=http://127.0.0.1:4173 --chapters=chapt_9,chapt_10 ...` | PASS: 44 stops x 2 widths; 114/114 expected page states; 0px horizontal overflow; live rail Next; all authored expanders/chart states opened; no console errors |
+| `npm.cmd run ui:walk -- --base=http://127.0.0.1:4173 --chapters=chapt_1,...,chapt_10 ...` | PASS: 219 stops x 2 widths; 612/612 expected page states; 0px horizontal overflow in all ten chapters; live rail Next; all authored expanders/chart states opened; no console errors |
+| `npm.cmd run ui:offline` with `BASE=http://127.0.0.1:4173` | PASS: 44 stops rendered, 0 missing, activity-route refresh OK, no console errors |
+| `node --check` on changed `.mjs` files | PASS |
+| `git diff --check` | PASS; Git reports only the repository's LF-to-CRLF working-copy notices |
+
+The production build still emits the pre-existing Svelte accessibility warning at `DivideActivity.svelte:370` (`tabIndex` on a noninteractive element). This round did not touch that component, and the warning is not introduced by 5G-SPEC2.
+
+## Fixed-PDF comparison
+
+I used the supplied `F:\greekapp\ch9railwalkFIXED.pdf` (13 pages, SHA-256 `10D8B9899A807A24A6BF9F8232BD73B8AA253C459BB2A2BD68875E109C4B4656`) and `F:\greekapp\ch10railwalkFIXED.pdf` (14 pages, SHA-256 `871B1558486A3FCE8F5C17B4BFA725F7DC498A2897CC2B319CAE8AC00353F4B8`) as the visual references.
+
+- The chapter 9 fixed walk confirms the corrected `I come, go` wording.
+- The chapter 10 walk shows the five Stem Variations and their arrow-form examples; the corrected delivered data intentionally relocates those examples from old popup links into one disclosure under each numbered rule.
+- The chapter 10 parsing reference shows the Future Active/Future Middle pair; the form-dependent εἰμί exception now uses the same stacked visual treatment.
+- Neither fixed walkthrough supports retaining the rejected whole-verse Repeat control.
+
+## Deviations and surprises
+
+1. The spec says the delivered JSON must be the first commit, while the user says not to commit. Nathanael had already created the exact data-only checkpoint `021a03d`, so no additional commit was needed or made.
+2. The shared paradigm DOM wrapped English glosses inside the Greek audio button. This was unratified drift against section 3.4, so both shared row renderers received the same small structural correction.
+3. `scripts/assemble_ch10.py` is stale and out of this spec's authorized data scope: lines around 501-509 still author `repeatCheckbox`/`Repeat This Exercise`, the Stem builder remains popup-era, and its hint registry contains only `futureParadigms`. Rerunning it would regress the delivered JSON. I did not edit it; the new shape guard will fail such regenerated output. There is no checked-in `assemble_ch9.py`.
+4. The delivered `chapt-09.json` retains an older `_objectives_note` saying the Rom 6:23b fix was pending, alongside the corrected objective and a later `_objective_note` recording the fix. This metadata contradiction has no rendered effect and was left verbatim under the data rule.
+5. Two preview processes were present locally: `localhost:4173` initially resolved to a stale bundle while `127.0.0.1:4173` served the fresh build. All recorded final browser evidence was explicitly pinned to `127.0.0.1`.
+
+## Acceptance checklist
+
+- [x] Delivered data exists verbatim in the pre-work, data-only first checkpoint (`021a03d`); no implementation commit was made.
+- [x] Section 1 parse/count/content assertions pass and are recorded above.
+- [x] Repeat is fully removed; retry-until-right and Restart are verified.
+- [x] Item-level hint routing and both `hintCharts` shapes are implemented; the εἰμί stack follows section 3.
+- [x] Stem Variations show five interspersed, collapsed `Examples` disclosures.
+- [x] All six answer flips independently grade Active correct and Middle incorrect.
+- [x] Build, shape, lazy-chunk, behavior, modal, rail, and 44-stop offline checks are green.
+- [x] No data, lexicon, audio manifest, cache architecture, route-mount scan, or audio-byte writer changed.
+- [x] Results and cumulative BUILD handoffs are delivered; nothing was committed or pushed.
```
