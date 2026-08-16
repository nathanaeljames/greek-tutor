# 5G-SPEC3 Build Record

Date: 2026-08-16

Baseline: `4f18b3d10a3d83224a7848ec454dbedfc50e7f7f`
(`prepping for 5G spec 3 - missed uploading part of the feedback`). The baseline
and `origin/main` were identical and the working tree was clean when this round
began.

Commit/staging/push status: none. The implementation, harness, Results, and
this Build record remain working-tree files under Nathanael's version control.

Wall-clock window: approximately 2026-08-16 01:49 EDT through 02:40 EDT,
approximately 51 minutes. The behavior, modal, full-rail, and offline browser
suites ran concurrently where independent; the 790.6-second behavior suite
was the longest acceptance path.

## Scope and result

This is the exact cumulative 5G-SPEC3 patch: the delivered future formula's
renderer and schema guard, three narrowly whitelisted two-state drill-Hint
surfaces, state/audio ownership corrections, strengthened behavior/modal/walk
coverage, and the Results handoff.

Final acceptance summary:

```text
check:shapes        PASS, 10 chapters including formula contracts
production build   PASS, 101 modules; PWA precache 37 entries
lazy chunks        PASS, 10 chapter + 10 lexicon chunks
ui:behavior        PASS, 898/898
ui:modals          PASS, 165/165 across five viewports
ui:walk all        PASS, 219 stops x 2 widths; 612/612; 8 extra toggle captures
ui:offline         PASS, 44 stops; 0 missing; refresh OK; no console errors
node --check       PASS, four changed .mjs files
git diff --check   PASS (line-ending notices only)
```

One literal section 4 requirement is data-blocked and not concealed: the
inline `eimiParadigms` charts have no `sayWhole`, and the chapter 10 pack has no
authored Present-εἰμί whole-paradigm clip. The Present/Future disclosure and
per-cell audio are implemented and verified, but the εἰμί footer intentionally
has no Say button. No audio or data was invented, borrowed, or edited.

## Decision and tool log

This is an execution and decision record, not private chain-of-thought.

1. Read `buildout/ONBOARD-SOL.md`, `buildout/5G-SPEC3.md`,
   `buildout/DISCLOSURE-RULES.md`, and `buildout/GRADER-PROMPT.md` in full before
   editing. Kept the round confined to the three feedback items and their
   acceptance harness.
2. Audited Git before changes. HEAD and `origin/main` were the clean baseline
   `4f18b3d`. The delivered chapter 10 v2 was already present, so the user's
   no-commit instruction required no checkpoint action.
3. Compared the baseline data file with its parent, parsed its formula shape,
   inspected the relevant Hint registry and audio IDs, and computed the
   delivered JSON hash. The only delivered data delta is the Introduction
   formula; no data or manifest edit was necessary or authorized.
4. Rendered and visually inspected all three supplied feedback-PDF pages in a
   system temporary directory. Used the PDF's control placement, formula
   boundary, and unchanged Quick Review page as visual evidence.
5. Delegated bounded audits of the formula/data contract, the Hint disclosure
   architecture, and all affected harness routes. Main-agent review confirmed
   that the existing resolver already normalizes both chart sources and that a
   three-ref whitelist in `SelectActivity` avoids an out-of-scope generalized
   disclosure component.
6. Diagnosed the spec/data conflict before implementation: normal chapter 9
   and 10 charts own both state-level Say clips, while neither inline εἰμί
   chart owns one. The manifest contains no chapter 10 Present whole-paradigm
   counterpart. Applied Disclosure Rules section 4 to the toggle, but preserved
   offline pack ownership and reported the missing Say behavior instead of
   silently borrowing chapter 7 audio.
7. Added the `formula` dispatch to `RichContent.svelte`: one inert line, one
   full-width whole-line Greek button, and one ordinary inline Greek segment.
   Added only the spacing/alignment CSS needed to preserve the old paragraph's
   layout.
8. Added permanent formula-shape validation for alignment, lines, exclusive
   tap contracts, audio placement, and standalone Greek-word boundaries. The
   existing manifest walk continues to enforce clip existence.
9. Implemented D-48f1 and the related chapter 10 disclosure in
   `SelectActivity.svelte`. The footer owns the selected chart's Say action and
   target-labelled toggle; only the chart body scrolls. Quick Review remains on
   the established stacked renderer.
10. Exercised the implementation at 320x360 and reviewed it again after the
    first green pass. That review exposed two lifecycle edges: a shuffled item
    could auto-advance to a different `hintRef` behind an open state-2 modal,
    and a state-1 Say clip could continue after its chart was replaced. Added a
    reactive ref-identity reset and `stopAudio()` at the state boundary, then
    added deterministic browser assertions for both corrections.
11. Strengthened audio evidence rather than relying on cumulative requests or
    constructor counts. The browser helper removes only the expected key from
    the existing test origin's existing audio store, observes the per-tap
    request window, and requires both one clip and the exact authored file.
    Added negative coordinate coverage outside inline λύσω and computed
    centering evidence for the formula.
12. Replaced stale stacked-Hint behavior assertions with exact initial state,
    target, title, state audio, zero-autoplay, outgoing-audio-stop, gloss
    boundary, toggle-back, auto-advance ref-reset, and Quick Review checks. The
    suite moved from 873 to 898 assertions.
13. Expanded the modal inventory from 30 to 33 surfaces. At five viewports it
    now captures both states of all three Hint refs and proves the controls are
    within the modal, remain pinned through body scroll, share a line, and put
    the toggle to the right of Say where Say is authored.
14. Updated the full rail walker to capture alternate Hint states, verify one
    visible chart and the changed target/title, restore state 1, and close. Its
    page denominator stays 612 while eight extra interaction captures exercise
    the new states.
15. Ran final verification against a fresh production build served at numeric
    loopback `127.0.0.1:4184`: 898/898 behavior checks, 165/165 modal states,
    the complete 219-stop two-width rail, and 44-stop offline refresh all
    passed. Independent long suites used fresh system-temp evidence paths.
16. Audited the final scope with Git status/diff, data/manifest path checks,
    hashes, JavaScript syntax checks, and whitespace checks. Confirmed no
    staged change and no modifications to data, lexicon, audio manifest,
    cache/store architecture, route remounting, or load-path scans.
17. Recorded rather than repaired two delivered-source surprises: provenance
    notes still describe the superseded stacked Hint, and the out-of-scope
    `scripts/assemble_ch10.py` would regenerate the old paragraph/incomplete
    Hint registry.

Representative commands used:

```powershell
git status --short
git diff 4f18b3d -- src/data public/audio/audio-manifest.json
Get-FileHash src/data/chapt-10.json -Algorithm SHA256
npm.cmd run verify
$env:BASE='http://127.0.0.1:4184'; npm.cmd run ui:behavior
npm.cmd run ui:modals -- --base=http://127.0.0.1:4184 --out=<system-temp-directory>
npm.cmd run ui:walk -- --base=http://127.0.0.1:4184 --chapters=chapt_1,...,chapt_10 --out=<system-temp-directory>
$env:BASE='http://127.0.0.1:4184'; npm.cmd run ui:offline
node --check scripts/check-content-shapes.mjs
node --check scripts/ui-behavior.mjs
node --check scripts/ui-modals.mjs
node --check scripts/ui-walk.mjs
git diff --check
git diff --cached --name-only
```

The final behavior evidence is
`C:\Users\NATHAN~1\AppData\Local\Temp\greekapp-5g-spec3-behavior-final-01fa953d52cc4b84b9dfc24ab6625091`;
modal evidence is
`C:\Users\NATHAN~1\AppData\Local\Temp\greekapp-spec3-modals-final-20260816-022156-0b91ef987bdf41a9bc063c817011cb25`;
and full-walk evidence is
`C:\Users\NATHAN~1\AppData\Local\Temp\greekapp-5g-spec3-final-walk-20260816-022211683`.

The build retains the pre-existing `DivideActivity.svelte:370` accessibility
warning. That component is absent from this diff.

## Exact cumulative diff

The fenced block below is the exact regular Git diff from baseline `4f18b3d`
for the eight implementation/harness files plus the new
`5G-SPEC3-RESULTS-SOL.md`. This Build file necessarily excludes itself to avoid
a self-referential diff that changes when embedded.

```diff
diff --git a/scripts/check-content-shapes.mjs b/scripts/check-content-shapes.mjs
index 1467e95..65a86d8 100644
--- a/scripts/check-content-shapes.mjs
+++ b/scripts/check-content-shapes.mjs
@@ -15,7 +15,7 @@ const problems = [];
 // the build, which is where a new pipeline block type should be noticed
 // (5B-SPEC3 D4). Add the type here in the same change that adds its branch.
 const BLOCK_TYPES = new Set([
-  'heading', 'subheading', 'para', 'numbered', 'defList',
+  'heading', 'subheading', 'para', 'formula', 'numbered', 'defList',
   'biblist', 'refs', 'note', 'greekRows', 'expander', 'paradigm',
   // 5F: chapter 6's preposition DIAGRAM.
   'prepositionsChart',
@@ -323,6 +323,62 @@ for (const file of files) {
     if (block.type === 'para' && typeof block.text === 'string' && /^\s*\(?\d{1,2}[.)]\s/.test(block.text)) {
       problems.push(`${path}: para text starts with a hand-authored number ("${block.text.slice(0, 24)}...") — use a numbered block instead so wrapped lines hang under their own text.`);
     }
+    // 5G-SPEC3: the three-line future formula has two distinct tap contracts.
+    // A tapUnit owns its WHOLE line and one clip; a greekTap owns only one
+    // standalone Greek word inside an otherwise inert line. Reject ambiguous
+    // or incomplete shapes before they can silently widen a tap target.
+    if (block.type === 'formula') {
+      if (block.align !== 'center') {
+        problems.push(`${path}.align: formula must be centered.`);
+      }
+      if (!Array.isArray(block.lines) || !block.lines.length) {
+        problems.push(`${path}: formula has no lines array.`);
+      } else {
+        block.lines.forEach((line, index) => {
+          const linePath = `${path}.lines[${index}]`;
+          if (!line || typeof line !== 'object' || typeof line.text !== 'string' || !line.text.trim()) {
+            problems.push(`${linePath}: expected an object with non-empty text.`);
+            return;
+          }
+          const hasTapUnit = Object.prototype.hasOwnProperty.call(line, 'tapUnit');
+          const hasGreekTap = Object.prototype.hasOwnProperty.call(line, 'greekTap');
+          if (hasTapUnit && line.tapUnit !== true) {
+            problems.push(`${linePath}.tapUnit: when present, expected true.`);
+          }
+          if (hasTapUnit && hasGreekTap) {
+            problems.push(`${linePath}: tapUnit and greekTap are mutually exclusive.`);
+          }
+          if (hasTapUnit) {
+            if (typeof line.audio !== 'string' || !line.audio.trim()) {
+              problems.push(`${linePath}.audio: tapUnit requires a non-empty audio id.`);
+            }
+          } else if (Object.prototype.hasOwnProperty.call(line, 'audio')) {
+            problems.push(`${linePath}.audio: top-level audio is only valid on a tapUnit line.`);
+          }
+          if (hasGreekTap) {
+            const tap = line.greekTap;
+            if (!tap || typeof tap !== 'object'
+                || typeof tap.word !== 'string' || !tap.word.trim()
+                || typeof tap.audio !== 'string' || !tap.audio.trim()) {
+              problems.push(`${linePath}.greekTap: expected non-empty word and audio strings.`);
+            } else {
+              let standalone = false;
+              for (let at = line.text.indexOf(tap.word); at !== -1; at = line.text.indexOf(tap.word, at + 1)) {
+                const before = at > 0 ? line.text[at - 1] : '';
+                const after = line.text[at + tap.word.length] || '';
+                if (!/[Ͱ-Ͽἀ-῿]/u.test(before) && !/[Ͱ-Ͽἀ-῿]/u.test(after)) {
+                  standalone = true;
+                  break;
+                }
+              }
+              if (!standalone) {
+                problems.push(`${linePath}.greekTap.word: "${tap.word}" is not a standalone Greek substring of the line.`);
+              }
+            }
+          }
+        });
+      }
+    }
     // Every contentAudio mode must have a branch in ContentAudio.svelte; an
     // unknown one silently falls through to the generic chart layout.
     if (block.type === 'contentAudio' && block.mode && !CONTENT_MODES.has(block.mode)) {
@@ -791,4 +847,4 @@ if (problems.length) {
   process.exit(1);
 }
 
-console.log(`PASS: content shapes intact — ${files.join(', ')} checked (biblist entries are strings; numbered items render something; greekRows rows carry content; paradigm rows match their columns; spellVerse answers are single words; retired Repeat controls are absent; every contentAudio mode has a branch; every advanceClass is one of the four and every audioTiming one of the five; every reddened cluster has a font-derived geometry row; every spelling answer is typeable on the shared keyboard; every displayed elision mark is U+0027; no numbered point is hand-numbered inside a plain para; no paragraph is split line-by-line across consecutive paras; every presentFutureRows row has both sides; every hintChart has paradigmRefs or inline charts; every hintRef, paradigmRef, [[link:id]] and topic titleLink resolves; every audio id the data names exists in the audio manifest).`);
+console.log(`PASS: content shapes intact — ${files.join(', ')} checked (biblist entries are strings; numbered items render something; greekRows rows carry content; paradigm rows match their columns; formula lines have exclusive whole-line/inline tap contracts; spellVerse answers are single words; retired Repeat controls are absent; every contentAudio mode has a branch; every advanceClass is one of the four and every audioTiming one of the five; every reddened cluster has a font-derived geometry row; every spelling answer is typeable on the shared keyboard; every displayed elision mark is U+0027; no numbered point is hand-numbered inside a plain para; no paragraph is split line-by-line across consecutive paras; every presentFutureRows row has both sides; every hintChart has paradigmRefs or inline charts; every hintRef, paradigmRef, [[link:id]] and topic titleLink resolves; every audio id the data names exists in the audio manifest).`);
diff --git a/scripts/ui-behavior.mjs b/scripts/ui-behavior.mjs
index bb383d8..60f2da2 100644
--- a/scripts/ui-behavior.mjs
+++ b/scripts/ui-behavior.mjs
@@ -164,6 +164,38 @@ const audioPath = id => {
   const m = String(id || '').match(/^(chapt_\d+|vocab\d*|john\d*|rev_par|rev_voc|intro)_(.+)$/);
   return m ? `/audio/${m[1]}/${m[2]}.m4a` : null;
 };
+// Force one named clip through the play-time miss path, then report both the
+// Audio creation count and ONLY the requests caused by this tap. A cumulative
+// request log plus a source-data pin can bless a wrong click handler if the
+// expected file happened to play earlier; targeted eviction makes that
+// impossible without opening another byte store or changing app code.
+async function exactAudioTap(locator, id) {
+  const path = audioPath(id);
+  await page.evaluate(audioPathKey => new Promise((resolve, reject) => {
+    const open = indexedDB.open('greek-tutor', 1);
+    open.onupgradeneeded = () => {
+      if (!open.result.objectStoreNames.contains('audio')) open.result.createObjectStore('audio');
+    };
+    open.onerror = () => reject(open.error);
+    open.onsuccess = () => {
+      const database = open.result;
+      const tx = database.transaction('audio', 'readwrite');
+      tx.objectStore('audio').delete(audioPathKey);
+      tx.oncomplete = () => { database.close(); resolve(); };
+      tx.onerror = () => { database.close(); reject(tx.error); };
+    };
+  }), path);
+  await page.evaluate(() => { window.__clips.length = 0; });
+  const mark = audioRequests.length;
+  await locator.click();
+  await page.waitForFunction(() => window.__clips.length >= 1, null, { timeout: 8000 }).catch(() => {});
+  await page.waitForTimeout(120);
+  return {
+    clipCount: (await clips()).length,
+    fetched: audioRequests.slice(mark),
+    path
+  };
+}
 
 // The activity's OWN stepper, never the sequential rail's Previous/Next at the
 // bottom of the screen (both are labelled "Next"; only the in-card pair moves
@@ -3406,6 +3438,79 @@ for (const [chapterId, activityId, expected] of [
       && normalizeText(await page.locator('.topic-count').innerText()) === '1 of 7');
 }
 
+// ---- 5G-SPEC3 the future-construction formula tap boundaries -------------
+{
+  const futureVerbs = activityById(ch10, 'c10_learn_future_verbs');
+  const formulaData = futureVerbs.topics[0].content.find(block => block.type === 'formula');
+  await go('#/activity/chapt_10/c10_learn_future_verbs');
+  const formula = page.locator('.rc-formula');
+  const lines = formula.locator('.rc-formula-line');
+  const unit = formula.locator('button.rc-formula-unit');
+  const inline = lines.nth(2).locator('button.greek-tap');
+  const plain = lines.first();
+  const geometry = await formula.evaluate(root => {
+    const whole = root.getBoundingClientRect();
+    const button = root.querySelector('.rc-formula-unit').getBoundingClientRect();
+    const lines = [...root.querySelectorAll('.rc-formula-line')];
+    return {
+      whole: whole.width,
+      button: button.width,
+      align: getComputedStyle(root).textAlign,
+      lineAligns: lines.map(line => getComputedStyle(line).textAlign)
+    };
+  });
+  check('5G-SPEC3 formula: three centered lines preserve the two exact tap boundaries',
+    await lines.count() === 3
+      && normalizeText(await plain.innerText()) === 'Stem + Sigma + Ending'
+      && await plain.locator('button, [role="button"]').count() === 0
+      && await unit.count() === 1
+      && normalizeText(await unit.innerText()) === 'λύ + σ + ω'
+      && Math.abs(geometry.whole - geometry.button) < 1
+      && geometry.align === 'center' && geometry.lineAligns.every(align => align === 'center')
+      && normalizeText(await lines.nth(2).innerText()) === '(λύσω — I will loose)'
+      && await lines.nth(2).locator('button').count() === 1
+      && normalizeText(await inline.innerText()) === 'λύσω',
+    `${await lines.count()} lines; widths ${geometry.button.toFixed(1)}/${geometry.whole.toFixed(1)}`);
+  check('5G-SPEC3 formula source pins both authored taps to chapt_10_j_luw1s',
+    formulaData?.align === 'center'
+      && formulaData?.lines?.[0]?.text === 'Stem + Sigma + Ending'
+      && formulaData?.lines?.[1]?.tapUnit === true
+      && formulaData?.lines?.[1]?.audio === 'chapt_10_j_luw1s'
+      && formulaData?.lines?.[2]?.greekTap?.word === 'λύσω'
+      && formulaData?.lines?.[2]?.greekTap?.audio === 'chapt_10_j_luw1s',
+    JSON.stringify(formulaData?.lines));
+
+  const unitTap = await exactAudioTap(unit, 'chapt_10_j_luw1s');
+  check('5G-SPEC3 formula: tapping the whole λύ + σ + ω unit plays exactly one j_luw1s clip',
+    unitTap.clipCount === 1 && unitTap.fetched.some(url => url.includes(unitTap.path)),
+    `${unitTap.clipCount} clip(s); requests ${JSON.stringify(unitTap.fetched)}`);
+
+  const inlineTap = await exactAudioTap(inline, 'chapt_10_j_luw1s');
+  check('5G-SPEC3 formula: tapping only λύσω in the worked line plays exactly one j_luw1s clip',
+    inlineTap.clipCount === 1 && inlineTap.fetched.some(url => url.includes(inlineTap.path)),
+    `${inlineTap.clipCount} clip(s); requests ${JSON.stringify(inlineTap.fetched)}`);
+
+  // Click immediately to the right of λύσω, on the authored dash/English run
+  // rather than on empty line space. Text nodes have no target of their own,
+  // so the event lands on the inert line container if the boundary is right.
+  const outsideGreek = await lines.nth(2).evaluate(line => {
+    const box = line.getBoundingClientRect();
+    const greek = line.querySelector('button.greek-tap').getBoundingClientRect();
+    return { x: Math.min(box.width - 2, greek.right - box.left + 10), y: box.height / 2 };
+  });
+  await page.evaluate(() => { window.__clips.length = 0; });
+  await lines.nth(2).click({ position: outsideGreek });
+  await page.waitForTimeout(250);
+  check('5G-SPEC3 formula: tapping the parentheses/English outside λύσω plays no audio',
+    (await clips()).length === 0, `${(await clips()).length} clip(s)`);
+
+  await page.evaluate(() => { window.__clips.length = 0; });
+  await plain.click();
+  await page.waitForTimeout(250);
+  check('5G-SPEC3 formula: tapping Stem + Sigma + Ending plays no audio',
+    (await clips()).length === 0, `${(await clips()).length} clip(s)`);
+}
+
 // ---- G4 popups written as content blocks (5G-SPEC1 §4.3) -----------------
 {
   // ch9: an ordinary word in running prose is the link, named outright by
@@ -3545,7 +3650,7 @@ for (const [chapterId, activityId, expected] of [
   }
 }
 
-// ---- G7 composite + form-dependent Hints (5G-SPEC2 §3) -----------------
+// ---- G7 one-at-a-time + form-dependent Hints (5G-SPEC3 §§1-2) ----------
 // Two-stage questions are shuffled at mount, so a form-dependent assertion
 // must seek the authored form through the real Next control. Testing whatever
 // happens to load first would make the eimi/luo route nondeterministic.
@@ -3564,12 +3669,14 @@ const seekSelectPrompt = async (hash, expectedPrompt, itemCount) => {
 };
 
 const parsing10 = activityById(ch10, 'c10_drill_parsing');
-for (const [chapterId, activityId, first, second, target] of [
-  ['chapt_9', 'c9_drill_parsing', 'Present Middle Indicative Paradigm', 'Present Passive Indicative Paradigm', null],
-  ['chapt_9', 'c9_drill_translation', 'Present Middle Indicative Paradigm', 'Present Passive Indicative Paradigm', null],
+for (const [chapterId, activityId, first, second, firstTarget, secondTarget, target, sayAudio] of [
+  ['chapt_9', 'c9_drill_parsing', 'Present Middle Indicative Paradigm', 'Present Passive Indicative Paradigm', 'Passive', 'Middle', null,
+    ['chapt_9_i_midpar', 'chapt_9_i_mpar']],
+  ['chapt_9', 'c9_drill_translation', 'Present Middle Indicative Paradigm', 'Present Passive Indicative Paradigm', 'Passive', 'Middle', null, null],
   // Item 16 has no override and must retain the drill-level future pair.
-  ['chapt_10', 'c10_drill_parsing', 'Future Active Indicative Paradigm', 'Future Middle Indicative Paradigm', 'λύω'],
-  ['chapt_10', 'c10_drill_translation', 'Future Active Indicative Paradigm', 'Future Middle Indicative Paradigm', null]
+  ['chapt_10', 'c10_drill_parsing', 'Future Active Indicative Paradigm', 'Future Middle Indicative Paradigm', 'Middle', 'Active', 'λύω',
+    ['chapt_10_j_luwpar', 'chapt_10_j_lumpar']],
+  ['chapt_10', 'c10_drill_translation', 'Future Active Indicative Paradigm', 'Future Middle Indicative Paradigm', 'Middle', 'Active', null, null]
 ]) {
   const hash = `#/activity/${chapterId}/${activityId}`;
   const sourceMatches = !target || (activityId === 'c10_drill_parsing'
@@ -3577,90 +3684,240 @@ for (const [chapterId, activityId, first, second, target] of [
     && !Object.prototype.hasOwnProperty.call(parsing10.items[15], 'hintRef'));
   const reached = target ? await seekSelectPrompt(hash, target, parsing10.items.length) : (await go(hash), true);
   if (!reached) {
-    check(`5G G7 ${activityId}: Hint opens ONE popup holding BOTH charts, stacked`, false,
+    check(`5G-SPEC3 ${activityId}: Hint opens in state 1 with a target-labelled toggle`, false,
       `never reached ${JSON.stringify(target)}`);
-    check(`5G G7 ${activityId}: the Hint closes`, false, 'target form not reached');
+    check(`5G-SPEC3 ${activityId}: toggle replaces the chart without autoplay`, false, 'target form not reached');
+    check(`5G-SPEC3 ${activityId}: toggling back restores state 1`, false, 'target form not reached');
+    check(`5G-SPEC3 ${activityId}: the Hint closes`, false, 'target form not reached');
     continue;
   }
+  await page.evaluate(() => { window.__clips.length = 0; });
   await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
   await page.waitForTimeout(150);
   const modal = page.locator('.hint-modal');
-  const titles = (await modal.locator('.pg-title').allInnerTexts()).map(normalizeText);
-  check(`5G G7 ${activityId}: Hint opens ONE popup holding BOTH charts, stacked`,
-    sourceMatches && await modal.count() === 1 && await modal.locator('.paradigm').count() === 2
-      && titles[0] === first && titles[1] === second
-      && await modal.locator('[data-paradigm-switch]').count() === 0,
-    JSON.stringify(titles));
+  const toggle = modal.locator('[data-hint-paradigm-toggle]');
+  check(`5G-SPEC3 ${activityId}: Hint opens in state 1 with a target-labelled toggle`,
+    sourceMatches && await modal.count() === 1 && await modal.locator('.paradigm').count() === 1
+      && normalizeText(await modal.locator('.pg-title').innerText()) === first
+      && normalizeText(await toggle.innerText()) === firstTarget
+      && await modal.locator('[data-paradigm-switch]').count() === 1
+      && (await clips()).length === 0,
+    `${JSON.stringify((await modal.locator('.pg-title').allInnerTexts()).map(normalizeText))}; toggle ${JSON.stringify(await toggle.innerText())}`);
+
+  if (sayAudio) {
+    const say = modal.locator('[data-hint-paradigm-say]');
+    const played = await exactAudioTap(say, sayAudio[0]);
+    check(`5G-SPEC3 ${activityId}: state 1 Say Paradigm plays its exact authored clip`,
+      await say.getAttribute('data-audio-id') === sayAudio[0]
+        && played.clipCount === 1
+        && played.fetched.some(url => url.includes(played.path)),
+      `${await say.getAttribute('data-audio-id')}; ${played.clipCount} clip(s); requests ${JSON.stringify(played.fetched)}`);
+  }
+
+  if (!sayAudio) await page.evaluate(() => { window.__clips.length = 0; });
+  const clipsBeforeToggle = (await clips()).length;
+  const playingBeforeToggle = await clipsPlaying();
+  await toggle.click();
+  await page.waitForTimeout(250);
+  const clipsAfterToggle = (await clips()).length;
+  const playingAfterToggle = await clipsPlaying();
+  check(`5G-SPEC3 ${activityId}: toggle replaces the chart without autoplay`,
+    await modal.locator('.paradigm').count() === 1
+      && normalizeText(await modal.locator('.pg-title').innerText()) === second
+      && normalizeText(await toggle.innerText()) === secondTarget
+      && clipsAfterToggle === clipsBeforeToggle
+      && (!sayAudio || (playingBeforeToggle === 1 && playingAfterToggle === 0)),
+    `${normalizeText(await modal.locator('.pg-title').innerText())}; toggle ${JSON.stringify(await toggle.innerText())}; clips ${clipsBeforeToggle}->${clipsAfterToggle}; playing ${playingBeforeToggle}->${playingAfterToggle}`);
+
+  if (sayAudio) {
+    const say = modal.locator('[data-hint-paradigm-say]');
+    const played = await exactAudioTap(say, sayAudio[1]);
+    check(`5G-SPEC3 ${activityId}: state 2 Say Paradigm plays its exact authored clip`,
+      await say.getAttribute('data-audio-id') === sayAudio[1]
+        && played.clipCount === 1
+        && played.fetched.some(url => url.includes(played.path)),
+      `${await say.getAttribute('data-audio-id')}; ${played.clipCount} clip(s); requests ${JSON.stringify(played.fetched)}`);
+
+    await page.evaluate(() => { window.__clips.length = 0; });
+    await modal.locator('.pg-gloss').first().click();
+    await page.waitForTimeout(250);
+    check(`5G-SPEC3 ${activityId}: a gloss in toggled state 2 plays no audio`,
+      (await clips()).length === 0, `${(await clips()).length} clip(s)`);
+  }
+
+  await page.evaluate(() => { window.__clips.length = 0; });
+  await toggle.click();
+  await page.waitForTimeout(200);
+  check(`5G-SPEC3 ${activityId}: toggling back restores state 1`,
+    normalizeText(await modal.locator('.pg-title').innerText()) === first
+      && normalizeText(await toggle.innerText()) === firstTarget
+      && (await clips()).length === 0,
+    `${normalizeText(await modal.locator('.pg-title').innerText())}; toggle ${JSON.stringify(await toggle.innerText())}`);
   await modal.getByRole('button', { name: 'Close', exact: true }).click();
   await page.waitForTimeout(80);
-  check(`5G G7 ${activityId}: the Hint closes`, await page.locator('.hint-modal').count() === 0);
+  check(`5G-SPEC3 ${activityId}: the Hint closes`, await page.locator('.hint-modal').count() === 0);
 }
 
 // Items 21 (present eimi) and 25 (future eimi) both override the drill-level
-// future-luo pair. They open the same two inline eimi charts, stacked in one
-// modal with one footer Close and no paging.
+// future-luo pair. They open the same two inline eimi charts one at a time.
+// The delivered pair has no sayWhole fields and the chapter-10 audio pack has
+// no Present εἰμί whole-paradigm clip, so this harness explicitly rejects an
+// invented Say action while proving each state's authored cell audio instead.
 for (const [itemIndex, expectedGreek] of [[20, 'εἰμί'], [24, 'ἔσομαι']]) {
   const item = parsing10.items[itemIndex];
   const reached = await seekSelectPrompt('#/activity/chapt_10/c10_drill_parsing', expectedGreek, parsing10.items.length);
-  const label = `5G-SPEC2 item ${itemIndex + 1}`;
+  const label = `5G-SPEC3 item ${itemIndex + 1}`;
   if (!reached) {
-    check(`${label}: item-level hintRef opens Present and Future eimi charts`, false,
+    check(`${label}: item-level hintRef opens Present eimi state 1`, false,
       `never reached ${JSON.stringify(expectedGreek)}`);
+    check(`${label}: Future toggle replaces the eimi chart without autoplay`, false, 'target form not reached');
+    check(`${label}: Present toggle restores the first eimi state`, false, 'target form not reached');
     check(`${label}: the form-dependent Hint closes`, false, 'target form not reached');
     continue;
   }
+  await page.evaluate(() => { window.__clips.length = 0; });
   await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
   await page.waitForTimeout(150);
   const modal = page.locator('.hint-modal');
-  const titles = (await modal.locator('.pg-title').allInnerTexts()).map(normalizeText);
-  check(`${label}: item-level hintRef opens Present and Future eimi charts`,
+  const toggle = modal.locator('[data-hint-paradigm-toggle]');
+  check(`${label}: item-level hintRef opens Present eimi state 1`,
     normalizeText(item?.greek) === normalizeText(expectedGreek)
       && item?.hintRef === 'eimiParadigms'
       && await modal.count() === 1
-      && await modal.locator('.paradigm-stack > .paradigm').count() === 2
-      && titles.some(title => title.includes('Present Active Indicative of'))
-      && titles.some(title => title.includes('Future Active Indicative of'))
-      && await modal.locator('.pg-nav, [data-paradigm-switch]').count() === 0
+      && await modal.locator('.paradigm').count() === 1
+      && normalizeText(await modal.locator('.pg-title').innerText()) === 'Present Active Indicative of εἰμί'
+      && normalizeText(await toggle.innerText()) === 'Future'
+      && await modal.locator('[data-hint-paradigm-say]').count() === 0
+      && (await clips()).length === 0
       && await modal.locator('.modal-actions').getByRole('button', { name: 'Close', exact: true }).count() === 1,
-    JSON.stringify(titles));
+    `${JSON.stringify((await modal.locator('.pg-title').allInnerTexts()).map(normalizeText))}; toggle ${JSON.stringify(await toggle.innerText())}`);
+
+  if (itemIndex === 20) {
+    const greekButtons = modal.locator('button.pg-greek-tap:not([disabled])');
+    const firstPresentAudio = ch10.hintCharts?.eimiParadigms?.charts?.[0]?.rows?.[0]?.cells?.[0]?.audio;
+    const played = await exactAudioTap(greekButtons.first(), firstPresentAudio);
+    check('5G-SPEC3 eimi Present state: six Greek forms are tappable and the first uses its authored clip',
+      await greekButtons.count() === 6 && played.clipCount === 1
+        && firstPresentAudio === 'chapt_10_g_eimi1s'
+        && played.fetched.some(url => url.includes(played.path)),
+      `${await greekButtons.count()} Greek buttons, first audio ${JSON.stringify(firstPresentAudio)}, requests ${JSON.stringify(played.fetched)}`);
+  }
+
+  await page.evaluate(() => { window.__clips.length = 0; });
+  await toggle.click();
+  await page.waitForTimeout(250);
+  check(`${label}: Future toggle replaces the eimi chart without autoplay`,
+    await modal.locator('.paradigm').count() === 1
+      && normalizeText(await modal.locator('.pg-title').innerText()) === 'Future Active Indicative of εἰμί'
+      && normalizeText(await toggle.innerText()) === 'Present'
+      && await modal.locator('button.pg-greek-tap:not([disabled])').count() === 6
+      && await modal.locator('.pg-gloss').count() === 6
+      && (await clips()).length === 0,
+    `${normalizeText(await modal.locator('.pg-title').innerText())}; toggle ${JSON.stringify(await toggle.innerText())}; ${(await clips()).length} clip(s)`);
 
   if (itemIndex === 20) {
     const greekButtons = modal.locator('button.pg-greek-tap:not([disabled])');
     const glosses = modal.locator('.pg-gloss');
+    const firstFutureAudio = ch10.hintCharts?.eimiParadigms?.charts?.[1]?.rows?.[0]?.cells?.[0]?.audio;
+    const played = await exactAudioTap(greekButtons.first(), firstFutureAudio);
+    check('5G-SPEC3 eimi Future state: the first Greek form plays its authored cell clip',
+      played.clipCount === 1 && firstFutureAudio === 'chapt_10_j_eimi1s'
+        && played.fetched.some(url => url.includes(played.path)),
+      `${played.clipCount} clip(s), first audio ${JSON.stringify(firstFutureAudio)}, requests ${JSON.stringify(played.fetched)}`);
     const glossesPlain = await glosses.evaluateAll(nodes => nodes.every(node =>
       !node.closest('button, [role="button"]') && getComputedStyle(node).color !== 'rgb(22, 99, 199)'));
     await page.evaluate(() => { window.__clips.length = 0; });
-    await greekButtons.first().click();
-    await page.waitForTimeout(300);
-    const firstPresentAudio = ch10.hintCharts?.eimiParadigms?.charts?.[0]?.rows?.[0]?.cells?.[0]?.audio;
-    check('5G-SPEC2 eimi charts: all Greek forms are tappable and the present form uses its authored clip',
-      await greekButtons.count() === 12 && (await clips()).length === 1
-        && firstPresentAudio === 'chapt_10_g_eimi1s',
-      `${await greekButtons.count()} Greek buttons, first audio ${JSON.stringify(firstPresentAudio)}`);
-    check('5G-SPEC2 eimi charts: all English glosses are plain, ink, and not tappable',
-      await glosses.count() === 12 && glossesPlain,
-      `${await glosses.count()} glosses, plain ${glossesPlain}`);
-
-    // The gloss must play NOTHING. This is the check the parallel 5G-SPEC2
-    // run did not have: it asserted no BUTTON inside .pg-gloss, which the
-    // pre-fix DOM satisfied trivially while the gloss sat inside the
-    // .pg-cell button and a tap on it played the Greek clip. Assert the
-    // conduct, not just the shape.
-    await page.evaluate(() => { window.__clips.length = 0; });
-    const before = (await clips()).length;
     await glosses.first().click();
     await page.waitForTimeout(250);
-    const after = (await clips()).length;
-    check('5G-SPEC2 eimi hint: tapping an English gloss plays no audio',
-      after === before,
-      `${after - before} clip(s) played on a gloss tap`);
+    check('5G-SPEC3 eimi Future state: all six English glosses are inert ink and a tap plays no audio',
+      await glosses.count() === 6 && glossesPlain && (await clips()).length === 0,
+      `${await glosses.count()} glosses, plain ${glossesPlain}, ${(await clips()).length} clip(s)`);
   }
 
+  await page.evaluate(() => { window.__clips.length = 0; });
+  await toggle.click();
+  await page.waitForTimeout(200);
+  check(`${label}: Present toggle restores the first eimi state`,
+    normalizeText(await modal.locator('.pg-title').innerText()) === 'Present Active Indicative of εἰμί'
+      && normalizeText(await toggle.innerText()) === 'Future'
+      && (await clips()).length === 0,
+    `${normalizeText(await modal.locator('.pg-title').innerText())}; toggle ${JSON.stringify(await toggle.innerText())}`);
   await modal.getByRole('button', { name: 'Close', exact: true }).click();
   await page.waitForTimeout(80);
   check(`${label}: the form-dependent Hint closes`, await page.locator('.hint-modal').count() === 0);
 }
 
+// A Hint can remain open during the ordinary correct-answer advance delay.
+// When the shuffled next form crosses λύω ↔ εἰμί, its item-level hintRef
+// changes behind that modal. The new surface must start at state 1; carrying
+// state 2 across unlike refs would disclose a chart the learner did not choose.
+{
+  await go('#/activity/chapt_10/c10_drill_parsing');
+  const pronounceEach = page.locator('.exercise-checks input').first();
+  if (await pronounceEach.count() && await pronounceEach.isChecked()) await pronounceEach.uncheck();
+  const sequence = [];
+  let currentPosition = 0;
+  for (let position = 0; position < parsing10.items.length; position++) {
+    currentPosition = position;
+    const prompt = await promptOnScreen();
+    const matches = parsing10.items.filter(item => normalizeText(item.greek) === prompt);
+    const identities = new Set(matches.map(item => JSON.stringify({
+      answer: item.answer,
+      hintRef: item.hintRef ?? parsing10.ui?.hintRef
+    })));
+    const item = identities.size === 1 ? matches[0] : null;
+    sequence.push(item ? { prompt, item, hintRef: item.hintRef ?? parsing10.ui?.hintRef } : null);
+    const next = stepper('Next');
+    if (await next.isDisabled()) break;
+    await next.click();
+    await page.waitForTimeout(45);
+  }
+  const boundary = sequence.findIndex((entry, index) => entry && sequence[index + 1]
+    && entry.hintRef !== sequence[index + 1].hintRef);
+  if (boundary < 0) {
+    check('5G-SPEC3 an open Hint resets to state 1 when auto-advance changes hintRef', false,
+      'no uniquely identified adjacent λύω/eimi forms in the shuffled sequence');
+  } else {
+    for (let position = currentPosition; position > boundary; position--) {
+      await stepper('Previous').click();
+      await page.waitForTimeout(45);
+    }
+    const from = sequence[boundary];
+    const to = sequence[boundary + 1];
+    for (let stageIndex = 0; stageIndex < from.item.answer.length; stageIndex++) {
+      await page.locator(`[data-stage="${stageIndex}"]`)
+        .getByRole('button', { name: from.item.answer[stageIndex], exact: true }).click();
+    }
+    await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
+    const modal = page.locator('.hint-modal');
+    const controls = modal.locator('[data-hint-paradigm-controls]');
+    await controls.waitFor();
+    await controls.locator('[data-hint-paradigm-toggle]').click();
+    await page.waitForTimeout(100);
+    const stateTwoBeforeAdvance = await controls.getAttribute('data-state-index');
+    await page.evaluate(() => { window.__clips.length = 0; });
+    await page.waitForFunction(previous => {
+      const prompt = document.querySelector('.card .prompt');
+      const shown = String(prompt?.textContent || '').replace(/\s+/g, ' ').trim().normalize('NFC');
+      return shown !== previous;
+    }, from.prompt, { timeout: 6000 });
+    await page.locator(`.hint-modal [data-hint-paradigm-controls][data-hint-ref="${to.hintRef}"][data-state-index="0"]`).waitFor();
+    const firstState = to.hintRef === 'eimiParadigms'
+      ? { title: 'Present Active Indicative of εἰμί', target: 'Future' }
+      : { title: 'Future Active Indicative Paradigm', target: 'Middle' };
+    check('5G-SPEC3 an open Hint resets to state 1 when auto-advance changes hintRef',
+      stateTwoBeforeAdvance === '1'
+        && await controls.getAttribute('data-hint-ref') === to.hintRef
+        && await controls.getAttribute('data-state-index') === '0'
+        && normalizeText(await modal.locator('.pg-title').innerText()) === firstState.title
+        && normalizeText(await controls.locator('[data-hint-paradigm-toggle]').innerText()) === firstState.target
+        && (await clips()).length === 0,
+      `${from.hintRef}/state ${stateTwoBeforeAdvance} -> ${await controls.getAttribute('data-hint-ref')}/state ${await controls.getAttribute('data-state-index')}`);
+    await modal.getByRole('button', { name: 'Close', exact: true }).click();
+    await page.waitForTimeout(80);
+  }
+}
+
 // The same negative conduct contract must hold on an ordinary lesson chart,
 // not only inside the new eimi Hint. Prewarm the authored first form so this
 // remains deterministic even when the browser starts with an empty audio DB.
@@ -3682,15 +3939,15 @@ for (const [itemIndex, expectedGreek] of [[20, 'εἰμί'], [24, 'ἔσομαι
     `${after - before} clip(s) played on a gloss tap`);
 }
 
-// ---- G8 the Quick Review paradigm pair is stacked, not paged ------------
+// ---- G8 Quick Review remains stacked, with no drill-hint toggle ----------
 for (const [chapterId, activityId] of [
   ['chapt_9', 'c9_qr_paradigms'], ['chapt_10', 'c10_qr_paradigms']
 ]) {
   await go(`#/activity/${chapterId}/${activityId}`);
-  check(`5G G8 ${activityId}: both charts on one page, no More/Back pager`,
+  check(`5G-SPEC3 ${activityId}: both Quick Review charts stay stacked with no toggle`,
     await page.locator('.paradigm-stack .paradigm').count() === 2
-      && await page.locator('.pg-nav').count() === 0,
-    `${await page.locator('.paradigm').count()} charts, ${await page.locator('.pg-nav').count()} pagers`);
+      && await page.locator('.pg-nav, [data-paradigm-switch], [data-hint-paradigm-toggle]').count() === 0,
+    `${await page.locator('.paradigm').count()} charts, ${await page.locator('.pg-nav').count()} pagers, ${await page.locator('[data-paradigm-switch]').count()} toggles`);
 }
 // Chapter 8's three-chart stack is NAMED and stays a More/Back sequence: the
 // naming rule is what tells the two apart, so this is what proves the
diff --git a/scripts/ui-modals.mjs b/scripts/ui-modals.mjs
index 8429910..883c50d 100644
--- a/scripts/ui-modals.mjs
+++ b/scripts/ui-modals.mjs
@@ -81,7 +81,19 @@ const go = async hash => {
   await page.waitForTimeout(150);
 };
 
-const hint = (chapterId, activityId, meanings) => async () => {
+const setHintDisclosureState = async stateIndex => {
+  const controls = page.locator('.modal [data-hint-paradigm-controls]');
+  await controls.waitFor({ state: 'visible' });
+  const expected = String(stateIndex);
+  const current = await controls.getAttribute('data-state-index');
+  if (current !== expected) {
+    await controls.locator('[data-hint-paradigm-toggle]').click();
+    await page.locator(`.modal [data-hint-paradigm-controls][data-state-index="${expected}"]`).waitFor();
+    await page.waitForTimeout(180);
+  }
+};
+
+const hint = (chapterId, activityId, meanings, disclosureState = null) => async () => {
   await go(`#/activity/${chapterId}/${activityId}`);
   await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
   await page.waitForTimeout(180);
@@ -89,13 +101,14 @@ const hint = (chapterId, activityId, meanings) => async () => {
     const toggle = page.locator('.modal [data-paradigm-meanings] summary');
     if (await toggle.count()) { await toggle.first().click(); await page.waitForTimeout(200); }
   }
+  if (disclosureState !== null) await setHintDisclosureState(disclosureState);
 };
 
 // Form-dependent Hints cannot be covered by opening whichever shuffled item
 // happens to mount first. Seek the named form through the activity's real Next
 // control, then open the modal variant that form routes to.
 const normalizeText = value => String(value ?? '').replace(/\s+/g, ' ').trim().normalize('NFC');
-const hintAtPrompt = (chapterId, activityId, prompt, itemCount) => async () => {
+const hintAtPrompt = (chapterId, activityId, prompt, itemCount, disclosureState = null) => async () => {
   await go(`#/activity/${chapterId}/${activityId}`);
   const next = () => page.locator('.card').getByRole('button', { name: 'Next', exact: true });
   let found = false;
@@ -109,6 +122,7 @@ const hintAtPrompt = (chapterId, activityId, prompt, itemCount) => async () => {
   if (!found) throw new Error(`never reached Hint form ${JSON.stringify(prompt)}`);
   await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
   await page.waitForTimeout(180);
+  if (disclosureState !== null) await setHintDisclosureState(disclosureState);
 };
 
 const SURFACES = [
@@ -171,16 +185,19 @@ const SURFACES = [
     await page.locator('.popup-link').first().click();
     await page.waitForTimeout(180);
   }],
-  // 5G: the cohort's new modals. The COMPOSITE hint is the tallest thing in
-  // the app now — two full paradigm charts with glosses in one dialog — so it
-  // is exactly the surface the modal-sizing rule exists for, and it is
-  // captured on both chapters. Chapter 10's parsing Hint has two payloads, so
-  // its luo and eimi forms are sought explicitly instead of trusting shuffle.
+  // 5G: each two-chart Hint now discloses one chart at a time. Capture both
+  // states independently so neither replacement chart can evade the modal
+  // sizing check. Chapter 10's parsing Hint has two payloads, so its luo and
+  // eimi forms are sought explicitly instead of trusting shuffle. The third
+  // tuple field requires the pinned disclosure-control row on these surfaces.
   // The remaining popups are the content[] shape: a one-line aside and a
   // six-row Greek list. Stem derivations are interspersed accordions now.
-  ['ch9-composite-hint-middle-passive', hint('chapt_9', 'c9_drill_parsing', false)],
-  ['ch10-composite-hint-future-active-middle', hintAtPrompt('chapt_10', 'c10_drill_parsing', 'λύω', 30)],
-  ['ch10-composite-hint-eimi-present-future', hintAtPrompt('chapt_10', 'c10_drill_parsing', 'εἰμί', 30)],
+  ['ch9-hint-middle', hint('chapt_9', 'c9_drill_parsing', false, 0), true, true],
+  ['ch9-hint-passive', hint('chapt_9', 'c9_drill_parsing', false, 1), true, true],
+  ['ch10-hint-future-active', hintAtPrompt('chapt_10', 'c10_drill_parsing', 'λύω', 30, 0), true, true],
+  ['ch10-hint-future-middle', hintAtPrompt('chapt_10', 'c10_drill_parsing', 'λύω', 30, 1), true, true],
+  ['ch10-hint-eimi-present', hintAtPrompt('chapt_10', 'c10_drill_parsing', 'εἰμί', 30, 0), true, false],
+  ['ch10-hint-eimi-future', hintAtPrompt('chapt_10', 'c10_drill_parsing', 'εἰμί', 30, 1), true, false],
   ['ch9-popup-punctiliar', async () => {
     await go('#/activity/chapt_9/c9_learn_mp_verbs');
     await page.locator('.rc-para .popup-link').first().click();
@@ -232,7 +249,7 @@ const report = [];
 let bad = 0;
 for (const { name, width, height } of VIEWPORTS) {
   await page.setViewportSize({ width, height });
-  for (const [label, open] of SURFACES) {
+  for (const [label, open, expectHintControls = false, expectHintSay = false] of SURFACES) {
     try {
       await open();
     } catch (e) {
@@ -257,11 +274,30 @@ for (const { name, width, height } of VIEWPORTS) {
       const m = modal.getBoundingClientRect();
       const action = [...modal.querySelectorAll('.modal-actions .btn')].pop();
       const a = action ? action.getBoundingClientRect() : null;
+      const hintControls = modal.querySelector('[data-hint-paradigm-controls]');
+      const hc = hintControls ? hintControls.getBoundingClientRect() : null;
+      const hintSay = modal.querySelector('[data-hint-paradigm-say]');
+      const hs = hintSay ? hintSay.getBoundingClientRect() : null;
+      const hintToggle = modal.querySelector('[data-hint-paradigm-toggle]');
+      const ht = hintToggle ? hintToggle.getBoundingClientRect() : null;
       const bar = sel => { const el = document.querySelector(sel); return el ? el.getBoundingClientRect() : null; };
       const tb = bar('.topbar'), bb = bar('.bottom-bar');
       return {
         top: Math.round(m.top), bottom: Math.round(m.bottom),
+        left: Math.round(m.left), right: Math.round(m.right),
         action: a ? { top: Math.round(a.top), bottom: Math.round(a.bottom) } : null,
+        hintControls: hc ? {
+          top: Math.round(hc.top), bottom: Math.round(hc.bottom),
+          left: Math.round(hc.left), right: Math.round(hc.right)
+        } : null,
+        hintSay: hs ? {
+          top: Math.round(hs.top), bottom: Math.round(hs.bottom),
+          left: Math.round(hs.left), right: Math.round(hs.right)
+        } : null,
+        hintToggle: ht ? {
+          top: Math.round(ht.top), bottom: Math.round(ht.bottom),
+          left: Math.round(ht.left), right: Math.round(ht.right)
+        } : null,
         ceiling: tb ? Math.round(tb.bottom) : 0,
         floor: bb ? Math.round(bb.top) : window.innerHeight,
         overlayRange: ov.scrollHeight - ov.clientHeight,
@@ -281,9 +317,21 @@ for (const { name, width, height } of VIEWPORTS) {
       const m = modal.getBoundingClientRect();
       const action = [...modal.querySelectorAll('.modal-actions .btn')].pop();
       const a = action ? action.getBoundingClientRect() : null;
+      const hintControls = modal.querySelector('[data-hint-paradigm-controls]');
+      const hc = hintControls ? hintControls.getBoundingClientRect() : null;
+      const hintToggle = modal.querySelector('[data-hint-paradigm-toggle]');
+      const ht = hintToggle ? hintToggle.getBoundingClientRect() : null;
       return {
         top: Math.round(m.top), bottom: Math.round(m.bottom),
-        action: a ? { top: Math.round(a.top), bottom: Math.round(a.bottom) } : null
+        action: a ? { top: Math.round(a.top), bottom: Math.round(a.bottom) } : null,
+        hintControls: hc ? {
+          top: Math.round(hc.top), bottom: Math.round(hc.bottom),
+          left: Math.round(hc.left), right: Math.round(hc.right)
+        } : null,
+        hintToggle: ht ? {
+          top: Math.round(ht.top), bottom: Math.round(ht.bottom),
+          left: Math.round(ht.left), right: Math.round(ht.right)
+        } : null
       };
     });
     await page.screenshot({ path: `${OUT}/${name}--${label}--2-content-scrolled.png` });
@@ -295,10 +343,33 @@ for (const { name, width, height } of VIEWPORTS) {
     // The pinned block must not have moved when the content did.
     const pinnedOk = !rest.action || !scrolled.action
       || Math.abs(rest.action.bottom - scrolled.action.bottom) <= 1;
-    const ok = topOk && bottomOk && actionOk && fitsOk && pinnedOk;
+    const hintControlsVisibleOk = !expectHintControls || (rest.hintControls
+      && rest.hintControls.top >= rest.ceiling - 1
+      && rest.hintControls.bottom <= rest.floor + 1);
+    const hintControlsPinnedOk = !expectHintControls || (rest.hintControls && scrolled.hintControls
+      && Math.abs(rest.hintControls.top - scrolled.hintControls.top) <= 1
+      && Math.abs(rest.hintControls.bottom - scrolled.hintControls.bottom) <= 1
+      && Math.abs(rest.hintControls.left - scrolled.hintControls.left) <= 1
+      && Math.abs(rest.hintControls.right - scrolled.hintControls.right) <= 1);
+    const hintControlsInsideOk = !expectHintControls || (rest.hintControls
+      && rest.hintControls.top >= rest.top - 1 && rest.hintControls.bottom <= rest.bottom + 1
+      && rest.hintControls.left >= rest.left - 1 && rest.hintControls.right <= rest.right + 1);
+    const hintTogglePinnedOk = !expectHintControls || (rest.hintToggle && scrolled.hintToggle
+      && Math.abs(rest.hintToggle.top - scrolled.hintToggle.top) <= 1
+      && Math.abs(rest.hintToggle.left - scrolled.hintToggle.left) <= 1);
+    const hintOrderOk = !expectHintSay || (rest.hintSay && rest.hintToggle
+      && Math.abs(rest.hintSay.top - rest.hintToggle.top) <= 1
+      && Math.abs(rest.hintSay.bottom - rest.hintToggle.bottom) <= 1
+      && rest.hintToggle.left >= rest.hintSay.right - 1);
+    const ok = topOk && bottomOk && actionOk && fitsOk && pinnedOk
+      && hintControlsVisibleOk && hintControlsPinnedOk && hintControlsInsideOk
+      && hintTogglePinnedOk && hintOrderOk;
     if (!ok) bad += 1;
-    console.log(`${ok ? 'OK  ' : 'BAD '} ${name.padEnd(24)} ${label.padEnd(34)} modal ${String(rest.top).padStart(4)}..${String(rest.bottom).padStart(4)} in ${String(rest.ceiling).padStart(3)}..${String(rest.floor).padStart(4)}  overlay ${String(rest.overlayRange).padStart(4)}  content ${String(rest.contentRange).padStart(5)}  pinned ${pinnedOk}`);
-    report.push({ viewport: name, width, height, surface: label, atRest: rest, afterContentScroll: scrolled, ok });
+    console.log(`${ok ? 'OK  ' : 'BAD '} ${name.padEnd(24)} ${label.padEnd(34)} modal ${String(rest.top).padStart(4)}..${String(rest.bottom).padStart(4)} in ${String(rest.ceiling).padStart(3)}..${String(rest.floor).padStart(4)}  overlay ${String(rest.overlayRange).padStart(4)}  content ${String(rest.contentRange).padStart(5)}  pinned ${pinnedOk}${expectHintControls ? `  hint-controls ${hintControlsPinnedOk}/${hintControlsInsideOk} toggle ${hintTogglePinnedOk}${expectHintSay ? ` right-of-say ${hintOrderOk}` : ''}` : ''}`);
+    report.push({
+      viewport: name, width, height, surface: label,
+      expectHintControls, expectHintSay, atRest: rest, afterContentScroll: scrolled, ok
+    });
   }
 }
diff --git a/scripts/ui-walk.mjs b/scripts/ui-walk.mjs
index 706eb19..f241285 100644
--- a/scripts/ui-walk.mjs
+++ b/scripts/ui-walk.mjs
@@ -188,6 +188,11 @@ const activityFor = (data, id) => Object.values(data)
   .filter(Array.isArray).flat().find(activity => activity && activity.id === id);
 const slug = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
   .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'state';
+const TWO_STATE_HINT_REFS = new Set([
+  'middlePassiveParadigms',
+  'futureParadigms',
+  'eimiParadigms'
+]);
 const chartGroupsIn = (node, found = []) => {
   if (Array.isArray(node)) {
     node.forEach(value => chartGroupsIn(value, found));
@@ -415,7 +420,8 @@ for (const size of WIDTHS) {
 
         // A topic-id or item-level hintRef exercises the resolver through its
         // real modal host. Capture the payload that the shuffled current form
-        // selects, label it from the rendered titles, and prove it closes.
+        // selects. The three direct two-chart composites expose one chart at a
+        // time, so walk both states and restore state 1 before closing.
         if (activity?.ui?.hintRef || activity?.items?.some(item => item?.hintRef)) {
           const hint = page.locator('.card').first().getByRole('button', { name: 'Hint', exact: true });
           if (!await hint.count() || !await hint.isVisible()) {
@@ -426,9 +432,56 @@ for (const size of WIDTHS) {
             if (!await modal.count() || !await modal.isVisible() || !await modal.locator('.paradigm').count()) {
               report.interactionErrors.push({ ...evidence, state: activityId, error: 'Hint did not open a paradigm' });
             } else {
-              const titles = (await modal.locator('.pg-title').allInnerTexts())
+              const titles = (await modal.locator('.pg-title:visible').allInnerTexts())
                 .map(text => text.replace(/\s+/g, ' ').trim()).filter(Boolean);
               await recordExtra(`${activityId}--hint`, `hint: ${titles.join(' + ') || activity.ui?.hintRef || 'item hint'}`);
+
+              const hintRefs = [activity?.ui?.hintRef,
+                ...(activity?.items || []).map(item => item?.hintRef)].filter(Boolean);
+              const expectsTwoStateHint = hintRefs.some(ref => TWO_STATE_HINT_REFS.has(ref));
+              if (expectsTwoStateHint) {
+                const visibleCharts = modal.locator('.paradigm:visible');
+                const toggle = modal.locator('[data-hint-paradigm-toggle]:visible');
+                const initialTitle = titles[0] || '';
+                const initialTarget = await toggle.count()
+                  ? (await toggle.first().innerText()).replace(/\s+/g, ' ').trim()
+                  : '';
+
+                if (await visibleCharts.count() !== 1) {
+                  report.interactionErrors.push({ ...evidence, state: `${activityId}--hint`, error: 'two-state Hint did not show exactly one paradigm in state 1' });
+                }
+                if (await toggle.count() !== 1 || !initialTarget) {
+                  report.interactionErrors.push({ ...evidence, state: `${activityId}--hint`, error: 'two-state Hint has no single target-labelled toggle' });
+                } else {
+                  await toggle.first().click();
+                  await page.waitForTimeout(80);
+                  const alternateTitles = (await modal.locator('.pg-title:visible').allInnerTexts())
+                    .map(text => text.replace(/\s+/g, ' ').trim()).filter(Boolean);
+                  const alternateTitle = alternateTitles[0] || '';
+                  const alternateTarget = (await toggle.first().innerText()).replace(/\s+/g, ' ').trim();
+                  if (await visibleCharts.count() !== 1) {
+                    report.interactionErrors.push({ ...evidence, state: `${activityId}--hint-${slug(initialTarget)}`, error: 'two-state Hint did not show exactly one paradigm in state 2' });
+                  }
+                  if (!initialTitle || !alternateTitle || alternateTitle === initialTitle) {
+                    report.interactionErrors.push({ ...evidence, state: `${activityId}--hint-${slug(initialTarget)}`, error: 'two-state Hint toggle did not replace the chart title' });
+                  }
+                  if (!alternateTarget || alternateTarget === initialTarget) {
+                    report.interactionErrors.push({ ...evidence, state: `${activityId}--hint-${slug(initialTarget)}`, error: 'two-state Hint toggle did not replace its target label' });
+                  }
+                  await recordExtra(`${activityId}--hint-${slug(alternateTitle || initialTarget)}`,
+                    `hint state 2: ${alternateTitle || initialTarget}`);
+
+                  await toggle.first().click();
+                  await page.waitForTimeout(80);
+                  const restoredTitles = (await modal.locator('.pg-title:visible').allInnerTexts())
+                    .map(text => text.replace(/\s+/g, ' ').trim()).filter(Boolean);
+                  const restoredTarget = (await toggle.first().innerText()).replace(/\s+/g, ' ').trim();
+                  if (await visibleCharts.count() !== 1 || restoredTitles[0] !== initialTitle || restoredTarget !== initialTarget) {
+                    report.interactionErrors.push({ ...evidence, state: `${activityId}--hint-restored`, error: 'two-state Hint did not restore state 1' });
+                  }
+                }
+              }
+
               await modal.getByRole('button', { name: 'Close', exact: true }).click();
               await page.waitForTimeout(50);
               if (await modal.count()) report.interactionErrors.push({ ...evidence, state: activityId, error: 'Hint did not close' });
diff --git a/src/app.css b/src/app.css
index 82de7f9..3871e55 100644
--- a/src/app.css
+++ b/src/app.css
@@ -393,6 +393,13 @@ button { font: inherit; cursor: pointer; }
   margin-top: 16px; padding-top: 12px; background: var(--card);
   box-shadow: 0 -10px 12px -12px rgba(0, 0, 0, 0.35); }
 .modal-actions .btn { width: 100%; min-height: 44px; }
+/* 5G-SPEC3: a two-state Hint keeps Say Paradigm and its target-labelled
+   disclosure control together in the pinned footer. The toggle is always the
+   right-hand control; εἰμί has no authored whole-paradigm clip, so its empty
+   first slot remains empty rather than borrowing or inventing audio. */
+.hint-paradigm-controls { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
+  gap: 8px; width: 100%; }
+.hint-paradigm-controls.no-say .hint-paradigm-toggle { grid-column: 2; }
 /* A SHORT SCREEN CANNOT PIN A TALL BUTTON STACK. The end-of-chapter dialog
    offers four full-width actions: at 44px each plus gaps that is 234px, and in
    a 320x360 window the gap between the app's bars is only 226px. A sticky
@@ -423,6 +430,12 @@ button { font: inherit; cursor: pointer; }
   color: var(--accent-ink); margin: 14px 0 2px; }
 .rc-subheading:first-child { margin-top: 0; }
 .rc-para { margin: 0 0 10px; }
+/* 5G-SPEC3: the authored future formula keeps the paragraph rhythm it
+   replaces. Its morpheme equation is one full-width tap unit; the worked
+   example uses the ordinary inline Greek-tap boundary. */
+.rc-formula { margin: 0 0 12px; }
+.rc-formula.rc-center { text-align: center; }
+.rc-formula-unit { display: block; width: 100%; line-height: inherit; text-align: center; }
 /* An EXAMPLE BLOCK is a para that carries its own line breaks. The original
    sets these as an indented panel, one example per line, under the sentence
    that introduces them ("Zachary drove the car." / "Elliott is a good kid.";
@@ -1445,10 +1458,9 @@ button, a, input, select, textarea, label,
   cursor: pointer; }
 .rc-greeksuffix:disabled { color: var(--ink); cursor: default; }
 
-/* ---- §2.8/§3.7/§4.8 two charts on one page ----
-   The Middle+Passive and Future Active+Middle pairs are printed together, in
-   the Quick Review page and in the drills' Hint popup alike. Not a pager: a
-   rule separates them and both are on screen at once. */
+/* ---- §2.8/§3.7 two charts on one page ----
+   Quick Review keeps its Middle+Passive and Future Active+Middle pairs
+   printed together. Drill hints use the scoped one-at-a-time disclosure. */
 .paradigm-stack { display: flex; flex-direction: column; gap: 4px; }
 .paradigm-stack-rule { height: 1px; background: rgba(0,0,0,0.12); margin: 14px 0 10px; }
diff --git a/src/components/RichContent.svelte b/src/components/RichContent.svelte
index e48abe8..ac88ccc 100644
--- a/src/components/RichContent.svelte
+++ b/src/components/RichContent.svelte
@@ -5,9 +5,9 @@
   // rows and underlined list lead-ins are all load-bearing, not decoration.
   //
   // Block types: heading | subheading | para | numbered | defList | biblist |
-  // refs | note | greekRows | expander | paradigm | presentFutureRows. An
-  // unknown type renders LOUD (see the dispatch's final else) rather than
-  // vanishing.
+  // refs | note | greekRows | expander | paradigm | presentFutureRows |
+  // formula. An unknown type renders LOUD (see the dispatch's final else)
+  // rather than vanishing.
   // Trailing { greek, caption?, audio? } "example" objects render in the Greek
   // font and play their clip on tap. defList rows [term, value, audio?] play
   // the row's clip when present.
@@ -203,6 +203,26 @@
         </button>
       {/if}
 
+    {:else if b.type === 'formula'}
+      <!-- 5G-SPEC3: the future-tense construction is three centred authored
+           lines with two deliberately different tap boundaries. The whole
+           morpheme equation is ONE button (including plus signs), while only
+           the named Greek word inside the worked example is a button. Plain
+           English remains inert ink. -->
+      <div class="rc-formula" class:rc-center={b.align === 'center'}
+           class:rc-gap-before={b.gapBefore}>
+        {#each b.lines || [] as line}
+          {#if line.tapUnit}
+            <button class="rc-formula-line rc-formula-unit greek-tap greek"
+                    on:click={() => playAudio(line.audio)}>{line.text}</button>
+          {:else if line.greekTap}
+            <div class="rc-formula-line">{#each splitTaps(line.text, { [line.greekTap.word]: line.greekTap.audio }) as seg}{#if seg.audio}<button class="greek-tap greek" on:click={() => playAudio(seg.audio)}>{seg.t}</button>{:else}<Marked text={seg.t} />{/if}{/each}</div>
+          {:else}
+            <div class="rc-formula-line"><Marked text={line.text} /></div>
+          {/if}
+        {/each}
+      </div>
+
     {:else if b.type === 'numbered'}
       {#if b.preamble}<p class="rc-preamble" class:rc-gap-before={b.gapBefore}><Marked text={b.preamble} /></p>{/if}
       {@const items = listItems(b)}
diff --git a/src/components/SelectActivity.svelte b/src/components/SelectActivity.svelte
index c7d0122..407a84e 100644
--- a/src/components/SelectActivity.svelte
+++ b/src/components/SelectActivity.svelte
@@ -189,6 +189,37 @@
   // activity-level Hint.
   $: activeHintRef = current?.hintRef ?? activity.ui?.hintRef;
   $: hintChart = activeHintRef ? resolveHintRef(chapter, activeHintRef) : null;
+  // 5G-SPEC3 / D-48f1: these exact two-chart drill hints disclose one chart
+  // at a time. The button always names the OTHER state, so the learner sees
+  // where it goes rather than a generic "switch" instruction. This policy is
+  // deliberately scoped by hintRef; Quick Review and every unrelated chart
+  // retain their existing renderer behavior.
+  const HINT_DISCLOSURE_TARGETS = {
+    middlePassiveParadigms: ['Passive', 'Middle'],
+    futureParadigms: ['Middle', 'Active'],
+    eimiParadigms: ['Future', 'Present']
+  };
+  let hintParadigmIndex = 0;
+  let hintParadigmRef = null;
+  // A correct answer may auto-advance behind an already-open Hint. If the new
+  // form changes its item-level hintRef (future λύω ↔ εἰμί), that is a newly
+  // disclosed surface and must begin at its authored state 1 just like a
+  // freshly opened modal. Retaining state 2 across unlike refs would show the
+  // learner a chart they did not choose for the new form.
+  $: if (activeHintRef !== hintParadigmRef) {
+    hintParadigmRef = activeHintRef;
+    hintParadigmIndex = 0;
+  }
+  $: hintDisclosureTargets = HINT_DISCLOSURE_TARGETS[activeHintRef] || null;
+  $: hintDisclosure = hintDisclosureTargets
+    && Array.isArray(hintChart?.paradigms) && hintChart.paradigms.length === 2;
+  $: hintParadigm = hintDisclosure ? hintChart.paradigms[hintParadigmIndex] : null;
+  // The selected chart's Say action belongs in the pinned modal footer beside
+  // the disclosure control, not in Paradigm's scrolling chart body.
+  $: hintParadigmBody = hintParadigm ? { ...hintParadigm, sayWhole: null } : null;
+  $: hintParadigmTarget = hintDisclosureTargets
+    ? hintDisclosureTargets[hintParadigmIndex]
+    : null;
   // 5F-FEEDBACK2 items 13/28 (Nathanael, 2026-08-09): a MULTI-PAGE hint, the
   // original's More/Back-paged popup. ui.hintPages lists pages by reference —
   // { hintRef } (a chart; a stack of N charts flattens to N pages, one chart
@@ -205,10 +236,10 @@
       if (def.hintRef) {
         const target = resolveHintRef(chapterData, def.hintRef);
         if (!target) continue;
-        // A COMPOSITE ref (5G §4.8) resolves to several charts. Reached from
-        // hintPages it means one chart per page, the same as a charts[] stack;
-        // reached from ui.hintRef it means one page with both charts stacked.
-        // Which one the data asked for is which field it used.
+        // A COMPOSITE ref resolves to several charts. Reached from hintPages
+        // it means one chart per page, the same as a charts[] stack. The
+        // direct drill-hint route applies its own target-labelled disclosure
+        // policy below; which route the data asked for is which field it used.
         const charts = Array.isArray(target.paradigms) && target.paradigms.length
           ? target.paradigms
           : (Array.isArray(target.charts) && target.charts.length ? target.charts : [target]);
@@ -227,6 +258,14 @@
   function toggleHint() {
     showHint = !showHint;
     hintPageIndex = 0;   // a reopened hint starts back at page 1
+    hintParadigmIndex = 0; // and a disclosure starts at its authored state 1
+  }
+  function toggleHintParadigm() {
+    // The old chart no longer owns the screen after this click. Stop anything
+    // it started before replacing both its cells and its Say action; the new
+    // state itself remains silent until the learner taps it.
+    stopAudio();
+    hintParadigmIndex = hintParadigmIndex === 0 ? 1 : 0;
   }
   $: showHintButton = hintPages.length > 0 || hintBlocks.length > 0 || !!hintChart;
   $: orderedRevealControls = orderControls([
@@ -739,13 +778,18 @@
       <!-- 5F-FEEDBACK.pdf §8.1 root-cause fix: every paradigm the Hint route
            can resolve now ships in the one standard cell-audio shape, so
            there is no second renderer to keep in sync. -->
-      {#if Array.isArray(hintChart.paradigms)}
-        <!-- 5G-SPEC1 §4.8: a COMPOSITE hint — several of the chapter's charts
-             stacked in ONE popup under one Close, which is how the original
-             draws chapter 10's Future Active + Future Middle pair
-             (ch10railwalk p7) and chapter 9's Middle + Passive pair. Not a
-             pager: nothing here cycles, and item (h) of VERIFY-5G is what
-             would settle whether the original cycles further. -->
+      {#if hintDisclosure}
+        <!-- D-48f1: one chart at a time. Only the body scrolls; the state Say
+             action and target-labelled toggle live with Close in the pinned
+             footer below. -->
+        <div class="paradigm-stack">
+          {#if hintChart.title}<div class="rc-heading">{hintChart.title}</div>{/if}
+          <Paradigm paradigm={hintParadigmBody} title={hintParadigm.title || null} />
+        </div>
+      {:else if Array.isArray(hintChart.paradigms)}
+        <!-- A future composite outside the three scoped disclosure refs keeps
+             the established stacked rendering until its own source requires
+             a different policy. -->
         <div class="paradigm-stack">
           {#if hintChart.title}<div class="rc-heading">{hintChart.title}</div>{/if}
           {#each hintChart.paradigms as chart, chartIndex}
@@ -759,6 +803,23 @@
       {/if}
       </div>
       <div class="modal-actions">
+        {#if hintDisclosure}
+          <div class="hint-paradigm-controls" class:no-say={!hintParadigm.sayWhole?.audio}
+               data-hint-paradigm-controls data-hint-ref={activeHintRef}
+               data-state-index={hintParadigmIndex}>
+            {#if hintParadigm.sayWhole?.audio}
+              <button class="btn secondary" data-hint-paradigm-say
+                      data-audio-id={hintParadigm.sayWhole.audio}
+                      on:click={() => play(hintParadigm.sayWhole.audio)}>
+                {hintParadigm.sayWhole.label || 'Say Paradigm'}
+              </button>
+            {/if}
+            <button class="btn secondary hint-paradigm-toggle"
+                    data-paradigm-switch="hint" data-hint-paradigm-toggle
+                    data-target-index={hintParadigmIndex === 0 ? 1 : 0}
+                    on:click={toggleHintParadigm}>{hintParadigmTarget}</button>
+          </div>
+        {/if}
         <!-- svelte-ignore a11y-autofocus -->
         <button class="btn" autofocus on:click={() => (showHint = false)}>Close</button>
       </div>
diff --git a/src/lib/content.js b/src/lib/content.js
index af8cd60..621809d 100644
--- a/src/lib/content.js
+++ b/src/lib/content.js
@@ -679,18 +679,18 @@ function optionClassForLayout(layout, activity, activityOptions, questions) {
 // A hintRef names a chart source in the chapter: an existing chart by id/type/
 // title, or a chapter-level hintCharts entry. Chapter 3's three verb drills all
 // open the same λύω paradigm the Learn page draws; later composite entries may
-// bundle referenced or inline paradigms for one stacked Hint popup.
+// bundle referenced or inline paradigms for a surface-specific disclosure.
 export function resolveHintRef(chapter, ref) {
   if (!chapter || !ref) return null;
   // A chapter-level `hintCharts` register names a COMPOSITE hint: one popup
   // holding several paradigms, either referenced by id (`paradigmRefs`) or
-  // authored inline (`charts`). It resolves to one `paradigms[]` bundle the
-  // surface renders as a stack. Checked FIRST, so a composite id can never be
+  // authored inline (`charts`). It resolves to one `paradigms[]` bundle whose
+  // surface chooses the disclosure policy. Checked FIRST, so a composite id can never be
   // shadowed by an activity or topic that happens to share its name.
   const composite = chapter.hintCharts && chapter.hintCharts[ref];
   if (composite) {
     // Composites either reference charts authored elsewhere in the chapter or
-    // own inline paradigm blocks. Normalize both forms to the same stack.
+    // own inline paradigm blocks. Normalize both forms to the same bundle.
     const paradigms = Array.isArray(composite.charts) && composite.charts.length
       ? composite.charts.filter(Boolean)
       : (composite.paradigmRefs || [])
diff --git a/buildout/5G-SPEC3-RESULTS-SOL.md b/buildout/5G-SPEC3-RESULTS-SOL.md
new file mode 100644
index 0000000..16e1787
--- /dev/null
+++ b/buildout/5G-SPEC3-RESULTS-SOL.md
@@ -0,0 +1,208 @@
+# 5G-SPEC3 Results
+
+Date: 2026-08-16
+
+Status: implemented and verified, with one explicitly data-blocked part of the
+rule-derived εἰμί extension. No file was staged, committed, or pushed.
+
+## Outcome
+
+The three feedback items are implemented:
+
+- chapter 9 drill Hints disclose Present Middle and Present Passive one at a
+  time, with the other state named on a right-hand toggle;
+- chapter 10 drill Hints use the same one-chart disclosure for Future Active
+  and Future Middle;
+- the rule-derived εἰμί Hint extension discloses Present and Future one at a
+  time;
+- the selected chart, title, toggle target, and authored Say Paradigm action
+  replace one another in place, without autoplay;
+- an active whole-paradigm clip is stopped before its chart is replaced;
+- the three-line future formula preserves its centered layout while giving the
+  whole morpheme equation one Greek tap target and only λύσω an inline target;
+- both Quick Review pages retain their simultaneous stacked charts and have no
+  toggle; and
+- shape, behavior, modal, full-rail, build, lazy-chunk, and offline checks are
+  green.
+
+The one data-blocked exception is prominent because it affects the literal
+wording of section 4: neither inline `eimiParadigms` chart has `sayWhole`, and
+the chapter 10 pack contains no authored Present-εἰμί whole-paradigm clip.
+The εἰμί surface therefore has the required Present/Future toggle and working
+per-cell audio, but no Say Paradigm button. I did not fabricate a clip, borrow
+chapter 7 audio, concatenate cells, or edit delivered data.
+
+## Inputs and baseline
+
+The clean implementation baseline and `origin/main` were both:
+
+```text
+4f18b3d10a3d83224a7848ec454dbedfc50e7f7f
+prepping for 5G spec 3 - missed uploading part of the feedback
+```
+
+That baseline already contains the delivered full replacement
+`src/data/chapt-10.json` v2. Relative to its parent, its only data change is the
+Introduction formula block described by section 3. I retained it verbatim; its
+SHA-256 is
+`69169F69D5DC0EBF1D7307D82FF621A444DCC625786ECF4CBDEBC8D70B997CCC`.
+The working-tree diff for `src/data`, `src/lexicon`, and
+`public/audio/audio-manifest.json` is empty.
+
+I also inspected all three pages of the supplied
+`F:\greekapp\5F-5G-DISCLOSURERULES-UPDATE\5G-FEEDBACK-1.pdf`
+(SHA-256
+`7107A62252CB38C19E1BFFC074B0F858F14E5768354AC0B070476D468D2AB5FA`).
+They show the chapter 9 Middle/Passive disclosure, the centered future formula
+and chapter 10 Active/Middle disclosure, and the unchanged Quick Review
+treatment.
+
+## Implementation by module
+
+### Formula rendering and validation
+
+`RichContent.svelte` now handles `formula` blocks explicitly. Each authored
+line remains separate and centered. A `tapUnit` line is one full-width
+`button.greek-tap` containing `λύ + σ + ω`, including both plus signs. A
+`greekTap` line uses the existing segment renderer so only `λύσω` is a
+button; parentheses, dash, and the authored English `I will loose` remain inert
+ink. The plain heading line is inert. The small CSS addition preserves the
+paragraph rhythm and standard blue Greek-tap semantics.
+
+`check-content-shapes.mjs` recognizes the new block and rejects non-centered
+or empty formulae, ambiguous `tapUnit`/`greekTap` ownership, misplaced or
+missing audio, and a named Greek word that is not a standalone substring.
+Existing manifest traversal validates both nested and line-level clip IDs.
+
+### Scoped two-state Hint disclosure
+
+`SelectActivity.svelte` applies the one-at-a-time policy only to
+`middlePassiveParadigms`, `futureParadigms`, and `eimiParadigms`. This is the
+deliberate D-48f1 departure for chapter 9 and the corresponding chapter 10
+application of Disclosure Rules section 4. The existing resolver continues to
+normalize referenced and inline chart bundles; unrelated Hint and Quick Review
+renderers are unchanged.
+
+The modal body renders exactly one selected chart. Its pinned footer contains
+the selected chart's Say Paradigm action, when authored, and the one-word
+target-labelled toggle to its right, followed by Close. State 1 is restored on
+open, on toggle-back, and when an item-level Hint reference changes behind an
+open modal during normal answer auto-advance. Switching state stops audio owned
+by the outgoing chart, creates no new clip, and then replaces the title, chart,
+Say action, and target label.
+
+The exact normal-surface mapping is:
+
+| Hint | State 1 / target | State 2 / target | Say clips |
+| --- | --- | --- | --- |
+| ch9 Middle/Passive | Present Middle / `Passive` | Present Passive / `Middle` | `chapt_9_i_midpar`, `chapt_9_i_mpar` |
+| ch10 Active/Middle | Future Active / `Middle` | Future Middle / `Active` | `chapt_10_j_luwpar`, `chapt_10_j_lumpar` |
+| ch10 εἰμί | Present / `Future` | Future / `Present` | none authored on the inline charts |
+
+### Harness changes
+
+`ui-behavior.mjs` now proves the formula's DOM and computed centering, exact
+button boundaries, exact per-tap `chapt_10_j_luw1s` requests, and zero audio
+from both the plain first line and the worked example outside `λύσω`. Its
+audio helper evicts only the expected existing audio-cache key before a tap so
+an incorrect cached clip cannot satisfy an exact-ID assertion.
+
+For all three Hint surfaces it verifies state-1 title/target, one visible
+chart, state replacement, no toggle autoplay, toggle-back restoration, and an
+English-gloss negative check on a toggled state. The normal chapter 9/10
+surfaces additionally pin both whole-paradigm audio IDs and prove switching
+stops the old playing clip. The εἰμί route pins one exact cell clip in each
+state and proves that no un-authored Say control appears. A deterministic
+shuffle traversal also verifies that auto-advance across λύω/εἰμί Hint refs
+resets an already-open modal to the new ref's state 1. Separate Quick Review
+assertions require both charts to remain stacked and reject every disclosure
+toggle.
+
+`ui-modals.mjs` expands the matrix from 30 to 33 surfaces by capturing both
+states of each new disclosure. Across all five viewports it verifies the
+control row stays inside and pinned to the modal, the toggle stays on the same
+line and to the right of Say on the normal surfaces, and the one-chart state is
+deterministic.
+
+`ui-walk.mjs` requires exactly one chart for the three scoped Hint refs, records
+the alternate state, verifies changed title and target, then restores state 1
+before Close. These are extra interaction captures rather than rail pages, so
+the established 612-state checklist denominator remains unchanged.
+
+Suite accounting:
+
+- behavior: 873 before this round to 898, all passing;
+- modal matrix: 30 surfaces / 150 viewport states to 33 surfaces / 165 states,
+  all passing; and
+- full rail: unchanged at 219 stops at two widths and 612 checklist states,
+  with eight additional alternate-Hint captures.
+
+## Verification evidence
+
+| Command/check | Final result |
+| --- | --- |
+| `npm.cmd run verify` | PASS: shapes for all 10 chapters; 101 modules transformed; PWA precache 37 entries; 10 chapter and 10 lexicon chunks emitted and precached |
+| `npm.cmd run ui:behavior` with `BASE=http://127.0.0.1:4184` | PASS: 898/898 behavior checks in 790.6 seconds |
+| `npm.cmd run ui:modals -- --base=http://127.0.0.1:4184 ...` | PASS: 165/165 states in 150.020 seconds at 390x844, 390x734, 390x664, 320x360, and 768x1024; pinned/in-modal controls; toggle right of Say; zero overlay movement |
+| `npm.cmd run ui:walk -- --base=http://127.0.0.1:4184 --chapters=chapt_1,...,chapt_10 ...` | PASS in 327.663 seconds: 219 stops x 2 widths; 612/612 checklist states; eight alternate-Hint captures; 0px overflow; zero rail, interaction, or console errors |
+| `npm.cmd run ui:offline` with `BASE=http://127.0.0.1:4184` | PASS in 3.824 seconds: 44 stops rendered; zero missing; offline refresh OK; zero console errors |
+| `node --check` on all four changed `.mjs` files | PASS |
+| `git diff --check` | PASS; Git emits only the repository's LF-to-CRLF working-copy notices |
+
+Final browser evidence is in the system temporary directory:
+
+- behavior:
+  `C:\Users\NATHAN~1\AppData\Local\Temp\greekapp-5g-spec3-behavior-final-01fa953d52cc4b84b9dfc24ab6625091`;
+- modal matrix:
+  `C:\Users\NATHAN~1\AppData\Local\Temp\greekapp-spec3-modals-final-20260816-022156-0b91ef987bdf41a9bc063c817011cb25`;
+- full walk:
+  `C:\Users\NATHAN~1\AppData\Local\Temp\greekapp-5g-spec3-final-walk-20260816-022211683`
+  (`walk-report.json` SHA-256
+  `DAC12B1EADD92BA39BAE4CAF251DB359B619FD3025BEC9AE4B3EE9588BE5F870`).
+
+The production build retains the pre-existing Svelte accessibility warning at
+`DivideActivity.svelte:370` (`tabIndex` on a noninteractive element). This
+round does not touch that component.
+
+## Deviations and surprises
+
+1. **Rule-derived εἰμί extension and audio constraint.** Per Disclosure
+   Rules section 4.1, I implemented and prominently flag the Present/Future
+   one-chart toggle so Nathanael can reverse the extension during its objection
+   window. However, the two delivered inline charts have no `sayWhole`. The
+   manifest has the Future clip `chapt_10_j_eimpar` elsewhere, but no chapter
+   10 Present-εἰμί whole-paradigm counterpart. Borrowing chapter 7's
+   `chapt_7_g_ispar` would cross offline-pack ownership and still would not be
+   the delivered chart contract. Fidelity and the inviolable-data rule take
+   precedence over inventing that missing audio; this is the sole partial
+   literal acceptance item.
+2. The delivered `hintCharts` provenance notes still describe the older
+   stacked-popup presentation. They do not render, and I left the full
+   replacement JSON unedited as required.
+3. `scripts/assemble_ch10.py` remains an out-of-scope, pre-v2 generator: it
+   authors the old multiline paragraph and does not emit the complete current
+   Hint registry. Rerunning it would regress the delivered JSON. The new shape
+   guard catches the formula half of such a regression; I did not reshape the
+   generator without authorization.
+
+## Acceptance checklist
+
+- [x] Delivered `chapt-10.json` v2 was already present and remains unedited.
+- [x] Both chapter 9 drills use the Middle/Passive disclosure per section 1
+      and D-48f1.
+- [x] Both chapter 10 drills use the Active/Middle disclosure per section 2.
+- [x] The rule-derived εἰμί Present/Future toggle is implemented and
+      prominently flagged.
+- [ ] A Say Paradigm action plays both εἰμί states' whole clips; the
+      delivered charts and chapter 10 audio pack do not contain those two
+      authored actions, so none was fabricated. Per-cell clips are verified.
+- [x] Chapter 9 and chapter 10 Quick Review pages remain stacked and have no
+      disclosure toggle.
+- [x] Formula taps and both required negative boundaries are implemented and
+      verified with exact audio-log conduct checks.
+- [x] Build, shapes, lazy chunks, 898 behavior checks, 165 modal states, full
+      ten-chapter rail, and 44-stop offline verification are green.
+- [x] No data, lexicon, manifest, cache architecture, load-path scan, route
+      remount behavior, or audio-byte writer changed.
+- [x] Results and exact cumulative BUILD handoffs are delivered; nothing was
+      staged, committed, or pushed.
```
