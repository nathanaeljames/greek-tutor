# 5E-XPATCH1 resultant diff

Base: `f04982e` (`sol won this round, saving results before crosspatch`).

This is the complete XPATCH1 implementation and deliverable diff. It excludes
the supplied untracked `buildout/5E-XPATCH1.md` input and this file itself,
which cannot include its own diff without becoming self-referential. No
generated `src/data/*.json` content changed.

```diff
diff --git a/buildout/5E-SPEC1-RESULTS-SOL.md b/buildout/5E-SPEC1-RESULTS-SOL.md
index 67a3a2b..f1d6d4b 100644
--- a/buildout/5E-SPEC1-RESULTS-SOL.md
+++ b/buildout/5E-SPEC1-RESULTS-SOL.md
@@ -216,3 +216,69 @@ The judgement list for that later pass is:
 | Model / tooling | Codex GPT-5.6 Sol; PowerShell, Node.js, Vite, Svelte, Playwright/Chrome; three parallel read-only implementation/PDF audits after bounded initial edits |
 | Approximate cost | Not exposed by the runtime |
 | Turns / sessions | One continuous implementation session |
+
+## 11. XPATCH1 (cross-patch from the parallel Opus run)
+
+1. **Sentence prompt resolved in code.** `buildSelectQuestions` now
+   infers `promptField = "sentence"` when an activity declares no
+   `promptFrom` and its items carry `sentence`. The two `promptFrom`
+   data keys added under §0 remain and still win when present; the
+   fallback means a regenerated Chapter 4/5 file cannot silently return
+   both noun drills to a pending placeholder. Acceptance used a temporary
+   Chapter 4 scratch state with the data key absent: **22/22 questions had
+   nonblank sentence prompts, 0/22 were pending**, the real drill rendered
+   its underlined sentence, and `check:shapes` passed both without and with
+   the restored key.
+2. **Reveal-button order read from `ui.buttons`.** Chapter 3 renders
+   Translate before Hint and Chapters 4/5 render Hint first, each following
+   its own authored order, which is what both rail walks show. The real-UI
+   assertions passed for all four reveal hosts: Chapter 3 Verb Translating,
+   Chapter 4 Declining Noun, Chapter 5 Declining Noun, and Chapter 5 Definite
+   Article. The complete behavior suite passed **100/100** checks.
+3. **`MeaningsCard.svelte` extracted.** The Translation of Inflectional
+   Forms table moved out of `Paradigm.svelte` into its own component. Learn
+   expanders and drill Hint paradigms both consume it through their existing
+   `Paradigm` host. This was a pure move: the required before/after PNGs were
+   byte-identical at both widths (Chapter 4 Neuter: SHA-256
+   `FDCC41CA…B8C3B47` at 320 and `41485225…CC9DB8` at 768; Chapter 5 Eta:
+   `2B1A96DA…E242D15` at 320 and `B8A0918E…94C65C` at 768). The full walker
+   remained green at **105 stops × 2 widths**, **124/124** required Chapter
+   4/5 captures, **41/41** new-chapter stops at 0px overflow, and zero rail,
+   interaction, or console errors.
+4. **Offline preview rail walk** was run for Chapters 4 and 5; the previous
+   pass was only a route smoke test. Under an installed and controlling
+   production service worker, a hard-refreshed Chapter 4 activity rendered
+   offline, the Chapter 4 walk completed **27 screens / 18 rail routes** and
+   reached its end dialog, and the Chapter 5 walk completed **35 screens / 23
+   rail routes** and reached its end dialog. Offline spot checks for Chapters
+   1, 2, and 3 also rendered under service-worker control. There were **9
+   expected missing-audio resource failures** (with 9 paired browser console
+   messages) and **0 unexpected exceptions or non-audio request failures**.
+
+Regression build evidence: `check:shapes`, production build, and
+`check:lazy-chunk` pass; the build has 27 precache entries / 684.33 KiB. The
+Chapter 1–3 chunks remain `chapt-01-8ZoFoXk9.js`,
+`chapt-02-CFgjCaAb.js`, `chapt-03-CPP2o90H.js`,
+`lexicon-chapt01-DWCL8L3K.js`, `lexicon-chapt02-DMecEUSp.js`, and
+`lexicon-chapt03-DU3wQSch.js`, exactly matching the accepted base hashes.
+
+Two patch premises differed from the accepted Sol source. First, Sol already
+had a limited `hintBeforeReveal` implementation, so the visible authored
+orders were correct before XPATCH1; the patch generalizes that special case
+to stable label ordering, including unlisted controls. Second, Sol had one
+direct recursive Meanings renderer with two runtime hosts, while its styles
+already lived globally in `app.css`. The extraction therefore replaces that
+single recursive call and deliberately leaves the global rules and the full
+Hint-paradigm host unchanged. Also, the XPATCH acceptance text names Chapter
+4 Greek Noun and Chapter 5 First Declension Noun for reveal ordering, but
+those activities author Hint only; the assertions use the actual Declining
+Noun reveal hosts. The first full-walk invocation reached an unrelated stale
+listener through `localhost`; its evidence was discarded and the complete
+walk was rerun successfully against the explicit `127.0.0.1` preview URL.
+
+Unchanged from the base and explicitly not touched: topic-id
+`resolveHintRef`, `getGreekTapMap`, `lexicalForm` display, `[[i]]` markup, the
+fourteen §0 data edits, `check-content-shapes` validators, and the `ui:walk`
+harness. `ui:behavior` received only the four order assertions required by
+XPATCH1 §2; this is the narrow exception to the preamble's otherwise
+conflicting instruction not to touch either harness.
diff --git a/scripts/ui-behavior.mjs b/scripts/ui-behavior.mjs
index eef48fd..f24434b 100644
--- a/scripts/ui-behavior.mjs
+++ b/scripts/ui-behavior.mjs
@@ -385,6 +385,21 @@ await checkReveal('ch4 Declining Noun', ch4, 'c4_drill_declining', 'Translate',
 await checkReveal('ch5 Declining Noun', ch5, 'c5_drill_declining', 'Translate', 'translate');
 await checkReveal('ch5 Definite Article', ch5, 'c5_drill_article', 'Gender', 'gender');

+async function checkControlOrder(label, chapterId, activity) {
+  await go(`#/activity/${chapterId}/${activity.id}`);
+  const actual = (await page.locator('.card > .controls').first().getByRole('button').allInnerTexts())
+    .map(normalizeText);
+  const expected = activity.ui.buttons;
+  check(`XPATCH1 §2 ${label}: controls follow ui.buttons`,
+    JSON.stringify(actual) === JSON.stringify(expected),
+    `${JSON.stringify(actual)} expected ${JSON.stringify(expected)}`);
+}
+
+await checkControlOrder('ch3 Verb Translating', 'chapt_3', activityById(ch3, 'c3_drill_verb_translating'));
+await checkControlOrder('ch4 Declining Noun', 'chapt_4', activityById(ch4, 'c4_drill_declining'));
+await checkControlOrder('ch5 Declining Noun', 'chapt_5', activityById(ch5, 'c5_drill_declining'));
+await checkControlOrder('ch5 Definite Article', 'chapt_5', activityById(ch5, 'c5_drill_article'));
+
 // ---------------------------------------------------------------- §3 timing
 // The two constants, measured through the UI rather than read out of the
 // module: the item must still be on screen at ~55% of its deadline and gone by
diff --git a/src/components/Paradigm.svelte b/src/components/Paradigm.svelte
index 97e4365..e139dd1 100644
--- a/src/components/Paradigm.svelte
+++ b/src/components/Paradigm.svelte
@@ -6,13 +6,15 @@
   //
   // A 5E block may wrap several full charts in `charts`. The switch is local
   // chart state, never rail navigation; replacing the block resets chart 1.
-  // A chart's `meanings` is itself paradigm-shaped and recursively uses this
-  // renderer inside its expander, so row/audio/gloss behavior cannot drift.
+  // A chart's `meanings` is itself paradigm-shaped. MeaningsCard owns that
+  // shared table in both Learn expanders and the Paradigm rendered by a drill
+  // Hint, so row/audio/gloss behavior cannot drift between the two hosts.
   //
   // Greek-tap rule: every Greek cell and lemma is tappable when it carries an
   // audio clip. Endings rows are bare morphemes with no clips of their own, so
   // they render in ink rather than tappable blue.
   import { play } from '../lib/audio.js';
+  import MeaningsCard from './MeaningsCard.svelte';
   export let paradigm;
   export let title = null;

@@ -142,7 +144,7 @@
       <details class="pg-meanings" data-paradigm-meanings>
         <summary class="pg-meanings-toggle">{chart.meanings.label || 'Meanings'}</summary>
         <div class="pg-meanings-card">
-          <svelte:self paradigm={chart.meanings} title={chart.meanings.title || null} />
+          <MeaningsCard meanings={chart.meanings} title={chart.meanings.title || null} />
         </div>
       </details>
     {/if}
diff --git a/src/components/SelectActivity.svelte b/src/components/SelectActivity.svelte
index 5ea8605..b3e182a 100644
--- a/src/components/SelectActivity.svelte
+++ b/src/components/SelectActivity.svelte
@@ -110,8 +110,11 @@
   $: revealButtons = (activity.revealButtons && activity.revealButtons.length)
     ? activity.revealButtons
     : (uiButtons.includes('Translate') ? [{ label: 'Translate', field: 'translate' }] : []);
-  $: hintBeforeReveal = revealButtons.length > 0 && uiButtons.includes('Hint')
-    && uiButtons.indexOf('Hint') < Math.min(...revealButtons.map(button => uiButtons.indexOf(button.label)));
+  // The button ORDER is authored: ch3 lists Translate before Hint, ch4 and
+  // ch5 list Hint first, and both rail walks agree with their own chapter's
+  // data. Order from the data rather than from the template so no chapter is
+  // wrong on screen. Unlisted controls retain their template order at the end.
+  $: buttonOrder = Array.isArray(activity.ui?.buttons) ? activity.ui.buttons : null;
   $: showPronounceEach = !authoredOptions || !!activity.ui?.checkboxes?.includes('Pronounce Each Drill');
   // A hint either carries its own blocks (chapter 2's inline charts, rendered
   // below the card) or NAMES a chart the chapter already draws — chapter 3's
@@ -120,6 +123,10 @@
   $: hintBlocks = resolveHintBlocks(chapter, activity.hint);
   $: hintChart = activity.ui?.hintRef ? resolveHintRef(chapter, activity.ui.hintRef) : null;
   $: showHintButton = hintBlocks.length > 0 || !!hintChart;
+  $: orderedRevealControls = orderControls([
+    ...revealButtons.map(reveal => ({ kind: 'reveal', label: reveal.label, reveal })),
+    ...(showHintButton ? [{ kind: 'hint', label: 'Hint' }] : [])
+  ], buttonOrder);
   // Grouped button block (the original stacks them two-up) once there are more
   // than the chapter-1 pair.
   $: groupedControls = 1 + (showPronounce ? 1 : 0) + (showStepper ? 2 : 0)
@@ -139,6 +146,20 @@
     if (at < list.length) groups.push(list.slice(at));   // never drop an option
     return groups;
   }
+
+  function orderControls(controls, order) {
+    if (!order) return controls;
+    return controls.map((control, index) => ({
+      control,
+      index,
+      authoredIndex: order.indexOf(control.label)
+    })).sort((a, b) => {
+      if (a.authoredIndex < 0 && b.authoredIndex < 0) return a.index - b.index;
+      if (a.authoredIndex < 0) return 1;
+      if (b.authoredIndex < 0) return -1;
+      return a.authoredIndex - b.authoredIndex || a.index - b.index;
+    }).map(entry => entry.control);
+  }
   // 2c: the original's full-width "only one syllable" bar under the word. In
   // this drill it answers "1" -- the same value as the first number tile.
   $: oneSyllableOption = activity.oneSyllableButton
@@ -382,15 +403,13 @@
         {@const say = current.promptAudio || current.answerAudio}
         <button class="btn" disabled={!say} on:click={() => say && play(say)}>Pronounce</button>
       {/if}
-      {#if showHintButton && hintBeforeReveal}
-        <button class="btn secondary" on:click={() => (showHint = !showHint)}>Hint</button>
-      {/if}
-      {#each revealButtons as reveal}
-        <button class="btn secondary" disabled={!revealValue(reveal.field)} on:click={() => toggleReveal(reveal.field)}>{reveal.label}</button>
+      {#each orderedRevealControls as control}
+        {#if control.kind === 'hint'}
+          <button class="btn secondary" on:click={() => (showHint = !showHint)}>Hint</button>
+        {:else}
+          <button class="btn secondary" disabled={!revealValue(control.reveal.field)} on:click={() => toggleReveal(control.reveal.field)}>{control.reveal.label}</button>
+        {/if}
       {/each}
-      {#if showHintButton && !hintBeforeReveal}
-        <button class="btn secondary" on:click={() => (showHint = !showHint)}>Hint</button>
-      {/if}
       <button class="btn secondary" on:click={() => (showScore = !showScore)}>Score</button>
     </div>
     {#if showPronounceEach}
diff --git a/src/lib/content.js b/src/lib/content.js
index a2dd794..fb474d4 100644
--- a/src/lib/content.js
+++ b/src/lib/content.js
@@ -373,7 +373,17 @@ export function buildSelectQuestions(chapter, activity) {
   // drill may mix the two. Missing prompt/answer fields remain in the sequence
   // as visible pending-verification questions instead of becoming bad answers.
   if (activity.optionsPerItem || Array.isArray(activity.optionValues)) {
-    const promptField = activity.promptFrom && activity.promptFrom.show;
+    // Chapters 4 and 5 carry the prompt inline on the item with no
+    // promptFrom. Without this fallback every item resolves to
+    // pending:true and the whole drill renders as a pending placeholder --
+    // silently, which is how it would survive a "did the card render"
+    // check. An explicit promptFrom still wins; this only fires when the
+    // activity declares none and the items carry `sentence`.
+    const impliedSentence = !activity.promptFrom
+      && Array.isArray(activity.items)
+      && activity.items.some(it => it && it.sentence != null);
+    const promptField = (activity.promptFrom && activity.promptFrom.show)
+      || (impliedSentence ? 'sentence' : null);
     // 5D: an activity may DECLARE its prompt side rather than implying it via
     // promptFrom (the ch3 drills have no promptFrom — their prompts are inline
     // on the items). Same Greek-tap contract either way: declared, never
diff --git a/src/components/MeaningsCard.svelte b/src/components/MeaningsCard.svelte
new file mode 100644
index 0000000..37b77a4
--- /dev/null
+++ b/src/components/MeaningsCard.svelte
@@ -0,0 +1,65 @@
+<script>
+  // The Translation of Inflectional Forms table has two runtime hosts: the
+  // expander under a Learn chart and the same Paradigm inside a drill Hint.
+  // Keep its DOM and shared pg-* classes identical in both places.
+  import { play } from '../lib/audio.js';
+  export let meanings;
+  export let title = null;
+
+  $: columns = meanings?.columns || [];
+  $: rows = meanings?.rows || [];
+  $: hasCaseLabels = rows.some(row => row.label != null);
+  $: hasLongCaseLabels = rows.some(row => String(row.label || '').length > 5);
+  $: hasLongForms = hasCaseLabels && rows.some(row => (row.cells || [])
+    .some(cell => [...String(cell.greek || '')].length > 7));
+</script>
+
+<div
+  class="paradigm"
+  class:pg-case-labels={hasCaseLabels}
+  class:pg-long-case-labels={hasLongCaseLabels}
+  class:pg-long-forms={hasLongForms}
+  class:pg-many-columns={columns.length > 3}
+  data-chart-index={0}
+  data-chart-count={1}
+  data-chart-name="">
+  {#if title}<div class="pg-title">{title}</div>{/if}
+
+  <div class="pg-grid" style="--pg-cols:{columns.length}">
+    {#if columns.length}
+      <div class="pg-head">
+        <span class="pg-person pg-head-spacer">&nbsp;</span>
+        {#each columns as column, columnIndex}
+          <span class="pg-column" data-column-index={columnIndex}>{column}</span>
+        {/each}
+      </div>
+    {/if}
+    {#each rows as row, rowIndex}
+      <div class="pg-row" data-row-index={rowIndex}>
+        <span class="pg-person pg-row-label">{row.label ?? row.person ?? ''}</span>
+        {#each row.cells || [] as cell, cellIndex}
+          <button
+            class="pg-cell"
+            data-cell-index={cellIndex}
+            disabled={!cell.audio}
+            on:click={() => cell.audio && play(cell.audio)}>
+            <span class="greek pg-greek">{cell.greek}</span>
+            {#if cell.gloss}<span class="pg-gloss">{cell.gloss}</span>{/if}
+          </button>
+        {/each}
+      </div>
+    {/each}
+  </div>
+
+  {#if meanings.legend && meanings.legend.length}
+    <div class="pg-legend">
+      {#each meanings.legend as entry, legendIndex}
+        <div class="pg-legend-row" data-legend-index={legendIndex}>
+          <span class="pg-legend-label">{entry.label}</span>
+          <span class="pg-legend-text">{entry.text}</span>
+        </div>
+      {/each}
+    </div>
+  {/if}
+  {#if meanings.closing}<div class="pg-closing">{meanings.closing}</div>{/if}
+</div>
diff --git a/buildout/VERIFY-5E.md b/buildout/VERIFY-5E.md
new file mode 100644
index 0000000..fa8f741
--- /dev/null
+++ b/buildout/VERIFY-5E.md
@@ -0,0 +1,112 @@
+# VERIFY-5E.md
+
+This pass is limited to judgement, device reality, audio, and decisions that
+the automated Chapter 1–5 walk and behavior harness cannot settle.
+
+## Judgement calls
+
+- [ ] **1. More/Back discoverability.** Does the switch read as “there is a second chart here,” or as a dead end? Check Chapter 4 Masculine Declension, Chapter 5 First Declension--Alpha, and Chapter 5 Definite Article Paradigm.
+
+  **Verdict:**
+  **Notes:**
+
+- [ ] **2. Singular/Plural toggle wording.** Does the definite-article toggle read correctly when the button names the chart that is not currently shown?
+
+  **Verdict:**
+  **Notes:**
+
+- [ ] **3. Declining Noun translation reveal.** In the original, does the translation appear automatically after an answer, or only after pressing Translate? Check both chapters in DOSBox; this behavior was deliberately not guessed from still images.
+
+  **Verdict:**
+  **Notes:**
+
+- [ ] **4. Seven-topic phone layout.** Do the seven-topic Learn pages read well at phone width, or does the radio rail crowd the content panel?
+
+  **Verdict:**
+  **Notes:**
+
+- [ ] **5. Repeated English Concepts page.** Is Chapter 5’s near-duplicate page tedious enough on-device to warrant a divergence, or does the original’s “proceed with haste” line handle it?
+
+  **Verdict:**
+  **Notes:**
+
+## Audio listening pass
+
+- [ ] **6. Paradigm audio.** Listen to individual cells and Say Whole Paradigm/Say Whole List across all four Chapter 4 charts and all four Chapter 5 charts.
+
+  **Verdict:**
+  **Notes:**
+
+- [ ] **7. Review Vocabulary lists.** Listen to Say Whole List on both Review Vocabulary charts: `d_vocl4` and `e_vocl5`.
+
+  **Verdict:**
+  **Notes:**
+
+- [ ] **8. Cumulative Scripture clips.** Listen to Chapter 4’s local `c_sm*` copies for John 14:6a and Chapter 5’s local `c_sm*` and `d_sm*` copies.
+
+  **Verdict:**
+  **Notes:**
+
+- [ ] **9. Chapter 4 εἰ / μὴ assignment.** Listen-check `d_sm6`, `d_sm6b`, and `d_sm7` for εἰ, μὴ, and “εἰ μὴ” respectively. This assignment is carried from the delivered data.
+
+  **Verdict:**
+  **Notes:**
+
+- [ ] **10. Chapter 5 `e_graphn`.** The clip is referenced on both γραφή and γραφῇ. Listen and record which form it belongs to.
+
+  **Verdict:**
+  **Notes:**
+
+- [ ] **11. Playback interruption and exit.** Confirm audio stops on route exit and that a second tap interrupts the first clip cleanly.
+
+  **Verdict:**
+  **Notes:**
+
+## Device reality
+
+- [ ] **12. Airplane-mode device walk.** Download each chapter’s audio pack through the app, enable airplane mode, and walk Chapters 4 and 5.
+
+  **Verdict:**
+  **Notes:**
+
+- [ ] **13. Widest WebKit surfaces.** Check Chapter 4’s ten-option paradigm grid and Chapter 5’s six-column Quick Review article chart on real WebKit. Chromium measured only 0.6px of headroom on the latter at 320px, and iOS text metrics can differ.
+
+  **Verdict:**
+  **Notes:**
+
+## Decisions the build could not make
+
+- [ ] **14. Scripture Memory option pools.** Chapter 4 ships 8 choices and Chapter 5 ships 9, while DRILL-MATRIX says 10. Both the rail walks and delivered data agree on 8/9, so neither implementer invented distractors. Keep the source-faithful pools, or author the missing distractors?
+
+  **Verdict:**
+  **Notes:**
+
+- [ ] **15. Definite-article column headers.** The data ships one clip per gender-and-number column (`e_artms`, `e_artfs`, `e_artns`, `e_artmp`, `e_artfp`, `e_artnp`). Surfacing them makes the English headers tappable and blue, the only blue English in the app. Are those headers tap targets in the original, or should they remain ink with the clips unreferenced?
+
+  **Verdict:**
+  **Notes:**
+
+- [ ] **16. Unused Chapter 5 article clips.** `e_artmas`, `e_artfem`, `e_artneu`, and `e_artpar` have no surface in the rail walk and neither implementation found one. Is that intentional?
+
+  **Verdict:**
+  **Notes:**
+
+- [ ] **17. Chapter 4 `d_adepar`.** The ἀδελφός whole-paradigm clip still has no chart on any Learn page; ἀδελφός appears only as the Declining Noun Drill’s third family. Is that intentional?
+
+  **Verdict:**
+  **Notes:**
+
+- [ ] **18. Chapter 4 Greek Noun Drill item 3.** For Matthew 5:24, the shipped underline is `brother`, while the run table said `to`. Confirm the original in DOSBox.
+
+  **Verdict:**
+  **Notes:**
+
+- [ ] **19. δόξα merged-row label.** Should the label be `Nom./Voc` as delivered and shown in the rail walk, or `Nom./Voc.` as 5E-SPEC1 §3.2 states?
+
+  **Verdict:**
+  **Notes:**
+
+- [ ] **20. English gloss option grids.** Both Vocabulary: Greek to English drills render four-up, while the original is two-up. This divergence predates Chapter 4, was device-verified in Chapters 1–3, and is out of this round’s scope. Decide whether a later cohort should change it.
+
+  **Verdict:**
+  **Notes:**
```
