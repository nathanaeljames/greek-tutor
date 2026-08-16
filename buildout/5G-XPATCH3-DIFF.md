# 5G-XPATCH3-DIFF.md — the cross-patch's diff

Base: `2857e92` (`sol wins 5g spec 3, saving before xpatch`), the accepted Sol 5G-SPEC3 tree.

This is the complete 5G-XPATCH3 implementation: title-derived toggle labels, the `actionsPinned` renderer contract, four D-48 divergence entries, the independently named stop-on-toggle assertions, and the XPATCH3 amendment to `5G-SPEC3-RESULTS-SOL.md`. It excludes this file itself, which cannot contain its own diff. The supplied `buildout/5G-XPATCH3.md` input is unchanged. No `src/data/*.json`, lexicon, audio manifest, cache/store, or audio-byte ownership content changed. Nothing is staged, committed, or pushed.

`src/lib/content.js` contains a pre-existing literal NUL delimiter, so Git classifies it as binary by default. This carrier uses `git diff --text` to include its complete textual patch.

## Summary

```text
 buildout/5G-SPEC3-RESULTS-SOL.md     | 89 ++++++++++++++++++++++++++++++++++++
 buildout/DIVERGENCE-LOG.md           | 23 ++++++++++
 scripts/ui-behavior.mjs              | 26 +++++++++--
 src/components/Paradigm.svelte       |  8 +++-
 src/components/SelectActivity.svelte | 26 +++++------
 src/lib/content.js                   | 26 +++++++++++
 6 files changed, 180 insertions(+), 18 deletions(-)
```

## The diff

```diff
diff --git a/buildout/5G-SPEC3-RESULTS-SOL.md b/buildout/5G-SPEC3-RESULTS-SOL.md
index 16e1787..2f32996 100644
--- a/buildout/5G-SPEC3-RESULTS-SOL.md
+++ b/buildout/5G-SPEC3-RESULTS-SOL.md
@@ -206,3 +206,92 @@ round does not touch that component.
       remount behavior, or audio-byte writer changed.
 - [x] Results and exact cumulative BUILD handoffs are delivered; nothing was
       staged, committed, or pushed.
+
+---
+
+## XPATCH3 (cross-patch from the parallel run)
+
+Base: `2857e92` (`sol wins 5g spec 3, saving before xpatch`), the accepted Sol
+5G-SPEC3 tree. The working tree was clean before this patch. Nathanael has not
+reversed the rule-derived εἰμί extension, so its label derivation and existing
+assertions remain included while the objection window stays open. Nothing was
+staged, committed, or pushed.
+
+1. **Toggle labels derived from chart titles** — `paradigmToggleLabels()` in
+   `content.js` replaces the hardcoded label table; the explicit three-ref gate
+   still scopes which Hint surfaces toggle. The returned words are indexed by
+   state and `SelectActivity` reads the target state, preserving all six
+   requested readings: Passive/Middle, Middle/Active, and Future/Present.
+2. **`actionsPinned` replaces the nulled-`sayWhole` spread** — `Paradigm` takes
+   an optional, default-false prop and the two-state Hint passes the real chart
+   object with `actionsPinned={true}`. The pinned footer remains the sole Say
+   Paradigm control, and all other hosts keep the existing default. There was
+   no visual regression in the ten-chapter walk: 219 rail stops at both widths,
+   612/612 checklist states, eight alternate-Hint captures, 0px overflow, and
+   zero rail, interaction, or console errors.
+3. **Four D-48 divergence entries** — D-48f1, D-48f2, D-48f3, and D-48f3e are
+   backfilled into `DIVERGENCE-LOG.md` in the existing format. D-48f3e records
+   that the εἰμί extension remains reversible during its objection window.
+4. **Two named stop assertions and six retained label pins** — chapter 9 and
+   chapter 10 now report the outgoing-clip stop as independent conduct checks.
+   The existing state assertions continue to pin each derived target word, so
+   a title change that falls back to More/Back fails loudly.
+
+### Spec/code drift
+
+XPATCH3 item 4 said neither run had these guards, but the accepted Sol harness
+already covered both conducts: playback stop was a conjunct inside the broader
+"toggle replaces the chart without autoplay" assertion, and the six expected
+labels were already read in the state-transition assertions. This patch split
+the two authored-audio stop cases into independently named checks and retained
+the folded label pins. That is why behavior accounting moves by exactly two,
+from 898 to 900, rather than adding eight duplicate checks.
+
+The base also had no separate `HINT_DISCLOSURE_REFS` list: its hardcoded label
+object doubled as the scope gate. The patch replaces that object with an
+explicit refs-only gate containing the same three refs; disclosure is not
+generalized.
+
+`content.js` contains a pre-existing literal NUL delimiter in `pairKey`, so Git
+classifies the file as binary by default. The diff carrier uses `git diff
+--text` to show the complete helper patch rather than a `Binary files differ`
+placeholder; the delimiter itself is unchanged.
+
+### Assertion bite proof
+
+I temporarily removed only `stopAudio()` from `toggleHintParadigm()`, built the
+regressed artifact, and restored the source immediately. The restored
+`SelectActivity.svelte` SHA-256 matched before and after as
+`6C4AC61ECA3AB32C507AA3ABCE9C9803C938342A839203FC1A817E9A238322E3`.
+The full maintained behavior harness against the isolated mutant build failed
+only the two new checks:
+
+```text
+FAIL  5G-XPATCH3 c9_drill_parsing: toggling stops the outgoing paradigm clip — playing 1 -> 1
+FAIL  5G-XPATCH3 c10_drill_parsing: toggling stops the outgoing paradigm clip — playing 1 -> 1
+898/900 behavior checks passed
+```
+
+The final restored build then passed 900/900.
+
+### Final verification
+
+| Command/check | Result |
+| --- | --- |
+| `npm.cmd run check:shapes` | PASS: all 10 chapter files and their content/audio/reference invariants |
+| `npm.cmd run build` | PASS: 101 modules transformed; PWA precache 37 entries |
+| `npm.cmd run ui:behavior` with `BASE=http://127.0.0.1:4194` | PASS: 900/900 behavior checks in 787.4 seconds |
+| Mutant build, same full behavior command | Expected failure: 898/900; both outgoing-clip checks reported `playing 1 -> 1` |
+| `npm.cmd run ui:modals -- --base=http://127.0.0.1:4194 ...` | PASS: 165/165 states, 33 surfaces across five device viewports, in 158.336 seconds |
+| `npm.cmd run ui:walk -- --base=http://127.0.0.1:4194 --chapters=chapt_1,...,chapt_10 ...` | PASS in 343.1 seconds: 219 stops x 2 widths; 612/612 checklist states; eight alternate-Hint captures; 0px overflow; zero rail, interaction, or console errors |
+| `npm.cmd run ui:offline` with `BASE=http://127.0.0.1:4194` | PASS: 44 stops rendered; zero missing; offline refresh OK; zero console errors |
+| `node --check scripts/ui-behavior.mjs`, stale-symbol grep, and `git diff --check` | PASS |
+
+The production build retains the pre-existing Svelte accessibility warning at
+`DivideActivity.svelte:370` (`tabIndex` on a noninteractive element). This
+patch does not touch that component. No chapter data, lexicon, audio manifest,
+cache/store path, route remount behavior, or audio-byte writer changed.
+
+Suite: 898 -> 900, all passing. The complete patch diff, including this
+amendment and excluding its self-referential carrier, is in
+`buildout/5G-XPATCH3-DIFF.md`.
diff --git a/buildout/DIVERGENCE-LOG.md b/buildout/DIVERGENCE-LOG.md
index 2100751..3854763 100644
--- a/buildout/DIVERGENCE-LOG.md
+++ b/buildout/DIVERGENCE-LOG.md
@@ -482,6 +482,29 @@ D-47 | app | DISCLOSURE FRAMEWORK ADOPTED (DISCLOSURE-RULES.md,
      renderer items R1-R7 assigned to DISCLOSURE-SPEC1. | Nathanael,
      DISCLOSURE-RULES.md.
 
+D-48f1 | ch9 | DRILL HINTS SHOW ONE PARADIGM AT A TIME WITH A
+     MIDDLE/PASSIVE TOGGLE. The original draws only the Middle chart;
+     the port previously stacked Middle and Passive in one scrolling
+     modal. A two-state control is closer to the original than the
+     stack was. | Nathanael, 5G-FEEDBACK-1 item 1.
+
+D-48f2 | ch10 | THE INTRODUCTION FORMULA IS TAPPABLE. The derivation
+     line `λύ + σ + ω` is one tap unit playing `chapt_10_j_luw1s`,
+     and λύσω in the gloss line taps to the same clip. The original's
+     formula is silent. | Nathanael, 5G-FEEDBACK-1 item 2.
+
+D-48f3 | ch10 | DRILL HINTS SHOW ONE PARADIGM AT A TIME WITH AN
+     ACTIVE/MIDDLE TOGGLE. The port previously stacked Future Active
+     and Future Middle in one scrolling modal. For the same reasoning
+     as D-48f1, a two-state control is closer to the original than the
+     stack was. | Nathanael, 5G-FEEDBACK-1 item 3.
+
+D-48f3e | ch10 | THE εἰμί HINT GETS THE SAME TWO-STATE TREATMENT,
+     DERIVED from DISCLOSURE-RULES §4.1 rather than requested in the
+     feedback. This extension remains inside its objection window and
+     is flagged for reversal; reversing it is a two-line change. |
+     Implementer, 5G-SPEC3 §2.
+
 ## Auto-progress / advance rule matrix
 
 MOVED. The full exercise-by-exercise, chapter-by-chapter matrix —
diff --git a/scripts/ui-behavior.mjs b/scripts/ui-behavior.mjs
index 60f2da2..54f8373 100644
--- a/scripts/ui-behavior.mjs
+++ b/scripts/ui-behavior.mjs
@@ -3669,6 +3669,11 @@ const seekSelectPrompt = async (hash, expectedPrompt, itemCount) => {
 };
 
 const parsing10 = activityById(ch10, 'c10_drill_parsing');
+// XPATCH3 item 1 derives these labels from the chart titles. A retitle that
+// breaks the one-word contrast degrades to More/Back SILENTLY, so the expected
+// words stay pinned here and in the eimi state assertions below. A failure
+// means the data changed and the labels need a decision, not that the
+// derivation itself should be bypassed.
 for (const [chapterId, activityId, first, second, firstTarget, secondTarget, target, sayAudio] of [
   ['chapt_9', 'c9_drill_parsing', 'Present Middle Indicative Paradigm', 'Present Passive Indicative Paradigm', 'Passive', 'Middle', null,
     ['chapt_9_i_midpar', 'chapt_9_i_mpar']],
@@ -3687,6 +3692,8 @@ for (const [chapterId, activityId, first, second, firstTarget, secondTarget, tar
     check(`5G-SPEC3 ${activityId}: Hint opens in state 1 with a target-labelled toggle`, false,
       `never reached ${JSON.stringify(target)}`);
     check(`5G-SPEC3 ${activityId}: toggle replaces the chart without autoplay`, false, 'target form not reached');
+    if (sayAudio) check(`5G-XPATCH3 ${activityId}: toggling stops the outgoing paradigm clip`, false,
+      'target form not reached');
     check(`5G-SPEC3 ${activityId}: toggling back restores state 1`, false, 'target form not reached');
     check(`5G-SPEC3 ${activityId}: the Hint closes`, false, 'target form not reached');
     continue;
@@ -3709,31 +3716,44 @@ for (const [chapterId, activityId, first, second, firstTarget, secondTarget, tar
     const played = await exactAudioTap(say, sayAudio[0]);
     check(`5G-SPEC3 ${activityId}: state 1 Say Paradigm plays its exact authored clip`,
       await say.getAttribute('data-audio-id') === sayAudio[0]
+        && await modal.locator('[data-hint-paradigm-say]').count() === 1
+        && await modal.locator('.modal-scroll .pg-actions').count() === 0
         && played.clipCount === 1
         && played.fetched.some(url => url.includes(played.path)),
       `${await say.getAttribute('data-audio-id')}; ${played.clipCount} clip(s); requests ${JSON.stringify(played.fetched)}`);
+    await page.waitForTimeout(400);
   }
 
   if (!sayAudio) await page.evaluate(() => { window.__clips.length = 0; });
   const clipsBeforeToggle = (await clips()).length;
   const playingBeforeToggle = await clipsPlaying();
   await toggle.click();
-  await page.waitForTimeout(250);
+  await page.waitForTimeout(sayAudio ? 200 : 250);
   const clipsAfterToggle = (await clips()).length;
   const playingAfterToggle = await clipsPlaying();
   check(`5G-SPEC3 ${activityId}: toggle replaces the chart without autoplay`,
     await modal.locator('.paradigm').count() === 1
       && normalizeText(await modal.locator('.pg-title').innerText()) === second
       && normalizeText(await toggle.innerText()) === secondTarget
-      && clipsAfterToggle === clipsBeforeToggle
-      && (!sayAudio || (playingBeforeToggle === 1 && playingAfterToggle === 0)),
+      && clipsAfterToggle === clipsBeforeToggle,
     `${normalizeText(await modal.locator('.pg-title').innerText())}; toggle ${JSON.stringify(await toggle.innerText())}; clips ${clipsBeforeToggle}->${clipsAfterToggle}; playing ${playingBeforeToggle}->${playingAfterToggle}`);
+  if (sayAudio) {
+    // Press Say Paradigm, let it get going, then toggle. The OLD clip must
+    // stop: it belongs to the chart that just left the screen. Asserting
+    // "no new clip started" is not this check — a clip that is still playing
+    // satisfies that trivially, which is how this bug passes a green suite.
+    check(`5G-XPATCH3 ${activityId}: toggling stops the outgoing paradigm clip`,
+      playingBeforeToggle === 1 && playingAfterToggle === 0,
+      `playing ${playingBeforeToggle} -> ${playingAfterToggle}`);
+  }
 
   if (sayAudio) {
     const say = modal.locator('[data-hint-paradigm-say]');
     const played = await exactAudioTap(say, sayAudio[1]);
     check(`5G-SPEC3 ${activityId}: state 2 Say Paradigm plays its exact authored clip`,
       await say.getAttribute('data-audio-id') === sayAudio[1]
+        && await modal.locator('[data-hint-paradigm-say]').count() === 1
+        && await modal.locator('.modal-scroll .pg-actions').count() === 0
         && played.clipCount === 1
         && played.fetched.some(url => url.includes(played.path)),
       `${await say.getAttribute('data-audio-id')}; ${played.clipCount} clip(s); requests ${JSON.stringify(played.fetched)}`);
diff --git a/src/components/Paradigm.svelte b/src/components/Paradigm.svelte
index a5d86f4..365325f 100644
--- a/src/components/Paradigm.svelte
+++ b/src/components/Paradigm.svelte
@@ -18,6 +18,12 @@
   import MeaningsCard from './MeaningsCard.svelte';
   export let paradigm;
   export let title = null;
+  // The control row (Say Paradigm, and the switch where a chart has one)
+  // normally lives inside the chart body. A host that pins its own row —
+  // the two-state Hint modal, whose footer holds Say + toggle + Close
+  // outside the scroller (DISCLOSURE-RULES 4.3) — passes true and draws
+  // the row itself. Every other host passes nothing and is unaffected.
+  export let actionsPinned = false;
   // 5F-FEEDBACK2 item 12 (Nathanael, 2026-08-09): a HOST may rename the
   // More/Back pair per chart index — the Adjective Case Drill's Hint reads
   // "Plural"/"Singular" while the Learn topic showing the SAME chart stack
@@ -234,7 +240,7 @@
       <div class="pg-note">{#each splitTaps(chart.note, chart.noteTaps) as seg}{#if seg.audio}<button class="greek-tap greek" on:click={() => play(seg.audio)}>{seg.t}</button>{:else}{seg.t}{/if}{/each}</div>
     {/if}
 
-    {#if hasActions}
+    {#if !actionsPinned && hasActions}
       <div class="pg-actions" class:pg-actions-each={sayWholeEach.length > 0} style={`--pg-action-count:${sayWholeEach.length || 1}`}>
         {#if chart.sayWhole}
           <button class="btn secondary pg-say-whole" on:click={() => play(chart.sayWhole.audio)}>{chart.sayWhole.label || 'Say Whole Paradigm'}</button>
diff --git a/src/components/SelectActivity.svelte b/src/components/SelectActivity.svelte
index 407a84e..c94cc72 100644
--- a/src/components/SelectActivity.svelte
+++ b/src/components/SelectActivity.svelte
@@ -34,7 +34,7 @@
   // policy machinery as a one-stage item, so no timing or advance rule below
   // has a special case for it.
   import { onDestroy } from 'svelte';
-  import { authoredOptionSource, buildSelectQuestions, buildTwoStageQuestions, randomFeedback, resolveContentById, resolveHintBlocks, resolveHintRef } from '../lib/content.js';
+  import { authoredOptionSource, buildSelectQuestions, buildTwoStageQuestions, paradigmToggleLabels, randomFeedback, resolveContentById, resolveHintBlocks, resolveHintRef } from '../lib/content.js';
   import { combiningForMarkName, firstAccentCluster, markOverlayParts } from '../lib/greek.js';
   import { play, playThrough, stop as stopAudio } from '../lib/audio.js';
   import { markCompleted } from '../lib/progress.js';
@@ -194,11 +194,11 @@
   // where it goes rather than a generic "switch" instruction. This policy is
   // deliberately scoped by hintRef; Quick Review and every unrelated chart
   // retain their existing renderer behavior.
-  const HINT_DISCLOSURE_TARGETS = {
-    middlePassiveParadigms: ['Passive', 'Middle'],
-    futureParadigms: ['Middle', 'Active'],
-    eimiParadigms: ['Future', 'Present']
-  };
+  const HINT_DISCLOSURE_REFS = [
+    'middlePassiveParadigms',
+    'futureParadigms',
+    'eimiParadigms'
+  ];
   let hintParadigmIndex = 0;
   let hintParadigmRef = null;
   // A correct answer may auto-advance behind an already-open Hint. If the new
@@ -210,15 +210,13 @@
     hintParadigmRef = activeHintRef;
     hintParadigmIndex = 0;
   }
-  $: hintDisclosureTargets = HINT_DISCLOSURE_TARGETS[activeHintRef] || null;
-  $: hintDisclosure = hintDisclosureTargets
+  $: hintDisclosure = HINT_DISCLOSURE_REFS.includes(activeHintRef)
     && Array.isArray(hintChart?.paradigms) && hintChart.paradigms.length === 2;
   $: hintParadigm = hintDisclosure ? hintChart.paradigms[hintParadigmIndex] : null;
-  // The selected chart's Say action belongs in the pinned modal footer beside
-  // the disclosure control, not in Paradigm's scrolling chart body.
-  $: hintParadigmBody = hintParadigm ? { ...hintParadigm, sayWhole: null } : null;
-  $: hintParadigmTarget = hintDisclosureTargets
-    ? hintDisclosureTargets[hintParadigmIndex]
+  $: hintToggleLabels = paradigmToggleLabels(
+    (hintChart?.paradigms || []).map(chart => chart.title));
+  $: hintParadigmTarget = hintDisclosure
+    ? hintToggleLabels[1 - hintParadigmIndex]
     : null;
   // 5F-FEEDBACK2 items 13/28 (Nathanael, 2026-08-09): a MULTI-PAGE hint, the
   // original's More/Back-paged popup. ui.hintPages lists pages by reference —
@@ -784,7 +782,7 @@
              footer below. -->
         <div class="paradigm-stack">
           {#if hintChart.title}<div class="rc-heading">{hintChart.title}</div>{/if}
-          <Paradigm paradigm={hintParadigmBody} title={hintParadigm.title || null} />
+          <Paradigm paradigm={hintParadigm} title={hintParadigm.title || null} actionsPinned={true} />
         </div>
       {:else if Array.isArray(hintChart.paradigms)}
         <!-- A future composite outside the three scoped disclosure refs keeps
diff --git a/src/lib/content.js b/src/lib/content.js
index 621809d..8dd24c1 100644
--- a/src/lib/content.js
+++ b/src/lib/content.js
@@ -676,6 +676,32 @@ function optionClassForLayout(layout, activity, activityOptions, questions) {
   return longest <= 3 ? 'wide' : '';
 }
 
+// THE TOGGLE LABELS OF A TWO-STATE HINT (5G-SPEC3, DISCLOSURE-RULES 4.1).
+// If a one-word contrast exists that is meaningful without the noun, the
+// toggle reads that word; otherwise it falls back to More/Back. The three
+// shipped pairs each differ in EXACTLY ONE word of their titles, and that
+// word IS the contrast the rule asks for:
+//   Present [Middle] Indicative Paradigm  / Present [Passive] Indicative Paradigm
+//   Future [Active] Indicative Paradigm   / Future [Middle] Indicative Paradigm
+//   [Present] Active Indicative of eimi   / [Future] Active Indicative of eimi
+// So the label is DERIVED from the titles the data already carries rather
+// than authored beside them: a second place to write "Passive" is a second
+// place for it to disagree with the chart it names. Titles that do not
+// differ in exactly one word get More/Back, the rule's own fallback.
+// The returned array is indexed BY STATE: entry i is the contrast word of
+// title i. Callers index it by the TARGET state, so the button names where
+// it goes, not where it is.
+export function paradigmToggleLabels(titles) {
+  const words = (titles || []).map(title => String(title || '').trim().split(/\s+/));
+  const fallback = (titles || []).map((_, index) => (index === 0 ? 'Back' : 'More'));
+  if (words.length !== 2 || words[0].length !== words[1].length || !words[0].length) return fallback;
+  const differing = words[0].map((word, index) => word !== words[1][index]).reduce(
+    (found, differs, index) => (differs ? [...found, index] : found), []);
+  if (differing.length !== 1) return fallback;
+  const at = differing[0];
+  return [words[0][at], words[1][at]];
+}
+
 // A hintRef names a chart source in the chapter: an existing chart by id/type/
 // title, or a chapter-level hintCharts entry. Chapter 3's three verb drills all
 // open the same λύω paradigm the Learn page draws; later composite entries may
```

