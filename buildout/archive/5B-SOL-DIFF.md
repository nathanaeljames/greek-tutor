# 5B-SOL-DIFF.md — full working-tree diff for phase 5B

Snapshot date: 2026-07-23  
Base commit: `fa8132f10b87fdbf25d40862c9adc379d76de684`

This records the complete working-tree patch for the 5B round, including the
post-merge patches from `5B-MERGE-SPEC.md`, against the base commit above.
Tracked modifications and all untracked text files are included. This record
deliberately excludes itself to avoid recursive output. PNG screenshots are
represented by Git's conventional binary-diff headers and SHA-256 checksums
rather than embedded binary payload.

## Working-tree status at capture

```text
 M buildout/VERIFY-5A.md
 M scripts/check-lazy-chunk.mjs
 M src/app.css
 M src/components/ActivityHost.svelte
 M src/components/ContentAudio.svelte
 M src/components/RichContent.svelte
 M src/components/SelectActivity.svelte
 M src/components/SpellActivity.svelte
 M src/lib/content.js
?? AGENTS.md
?? buildout/5B-MERGE-SPEC.md
?? buildout/5B-SOL-DIFF.md
?? buildout/HANDOFF-5B-SOL.md
?? buildout/screenshots/
?? src/components/DivideActivity.svelte
?? src/components/PlaceAccentActivity.svelte
?? src/data/speller-tiles.json
?? src/lib/greek.js
```

## Text patch

```diff
diff --git a/buildout/VERIFY-5A.md b/buildout/VERIFY-5A.md
index 223a1ff728ac07a97d5c23b4d99435e55fc63555..816d6cfda943e86ccdea97163ac3f9756bcb8cde 100644
--- a/buildout/VERIFY-5A.md
+++ b/buildout/VERIFY-5A.md
@@ -63,6 +63,6 @@ E1. Note ANY behavior that feels different from the pre-5A build,
 
 ## Outcome
 
-- [ ] ALL PASS -> proceed to 5B (chapter 2 wiring).
+- [X] ALL PASS -> proceed to 5B (chapter 2 wiring).
 - [ ] Any failure -> report here; 5A gets a diagnose-first follow-up
       spec before any content work starts.
diff --git a/scripts/check-lazy-chunk.mjs b/scripts/check-lazy-chunk.mjs
index b2610b7d76a5ceb88486400feae73c1eb36a6015..ab740a1473b45699cb9365994bf1473d319ae52e 100644
--- a/scripts/check-lazy-chunk.mjs
+++ b/scripts/check-lazy-chunk.mjs
@@ -1,8 +1,8 @@
 // Build-time assertion for the 5A lazy-chapter split (spec 5A §3 tree-shake
 // guard). The audit's TRAP: an unreferenced import.meta.glob is tree-shaken and
-// NO per-chapter chunk is emitted — silently. This check FAILS the build if the
-// chapt-01 chunk is missing or if chapter-1 DATA leaked back into the main
-// bundle. Run after `npm run build`; wired into `npm run verify`.
+// NO per-chapter chunk is emitted — silently. This check FAILS the build if a
+// built chapter/lexicon chunk is missing or if chapter DATA leaked back into
+// the main bundle. Run after `npm run build`; wired into `npm run verify`.
 import { readFileSync, readdirSync } from 'node:fs';
 import { join } from 'node:path';
 
@@ -17,29 +17,33 @@ try {
 
 const fail = msg => { console.error(`FAIL: ${msg}`); process.exit(1); };
 
-// 1. The chapter chunk file must exist as its own asset.
-const chapterChunk = files.find(f => /^chapt-01-.*\.js$/.test(f));
-if (!chapterChunk) fail('no chapt-01-<hash>.js chunk in dist/assets — the glob was tree-shaken.');
+// 1. Every built chapter and lexicon must exist as its own asset.
+const expected = [
+  { chapterPattern: /^chapt-01-.*\.js$/, lexiconPattern: /^lexicon-chapt01-.*\.js$/, needle: 'You will be able to:' },
+  { chapterPattern: /^chapt-02-.*\.js$/, lexiconPattern: /^lexicon-chapt02-.*\.js$/, needle: 'Greek divides words into syllables in almost the same way as English.' }
+];
 
-const lexiconChunk = files.find(f => /^lexicon-chapt01-.*\.js$/.test(f));
-if (!lexiconChunk) fail('no lexicon-chapt01-<hash>.js chunk in dist/assets.');
-
-// 2. Chapter-1 DATA must be ABSENT from the main bundle and PRESENT in the chunk.
-//    A distinctive data value (not a property name a component might reference).
-const NEEDLE = 'You will be able to:';
+// 2. Chapter DATA must be ABSENT from the main bundle and PRESENT in its chunk.
+//    Use distinctive data values, not property names components may reference.
 const mainBundle = files.find(f => /^index-.*\.js$/.test(f));
 if (!mainBundle) fail('no index-<hash>.js main bundle in dist/assets.');
 
 const mainSrc = readFileSync(join(ASSETS, mainBundle), 'utf8');
-if (mainSrc.includes(NEEDLE)) fail(`chapter-1 data ("${NEEDLE}") leaked into the main bundle ${mainBundle}.`);
-
-const chunkSrc = readFileSync(join(ASSETS, chapterChunk), 'utf8');
-if (!chunkSrc.includes(NEEDLE)) fail(`chapter-1 data ("${NEEDLE}") not found in the chunk ${chapterChunk}.`);
-
-// 3. The service worker must precache the chapter chunk (offline proof).
 let swSrc = '';
 try { swSrc = readFileSync('dist/sw.js', 'utf8'); } catch { fail('dist/sw.js not found.'); }
-if (!swSrc.includes(chapterChunk)) fail(`sw.js does not precache the chapter chunk ${chapterChunk}.`);
-if (!swSrc.includes(lexiconChunk)) fail(`sw.js does not precache the lexicon chunk ${lexiconChunk}.`);
 
-console.log(`PASS: lazy-chapter split intact — ${chapterChunk} + ${lexiconChunk} emitted, precached, and chapter data is out of ${mainBundle}.`);
+const emitted = [];
+for (const item of expected) {
+  const chapterChunk = files.find(file => item.chapterPattern.test(file));
+  if (!chapterChunk) fail(`no chunk matching ${item.chapterPattern} in dist/assets — the glob may have been tree-shaken.`);
+  const lexiconChunk = files.find(file => item.lexiconPattern.test(file));
+  if (!lexiconChunk) fail(`no chunk matching ${item.lexiconPattern} in dist/assets.`);
+  if (mainSrc.includes(item.needle)) fail(`chapter data ("${item.needle}") leaked into the main bundle ${mainBundle}.`);
+  const chunkSrc = readFileSync(join(ASSETS, chapterChunk), 'utf8');
+  if (!chunkSrc.includes(item.needle)) fail(`chapter data ("${item.needle}") not found in ${chapterChunk}.`);
+  if (!swSrc.includes(chapterChunk)) fail(`sw.js does not precache the chapter chunk ${chapterChunk}.`);
+  if (!swSrc.includes(lexiconChunk)) fail(`sw.js does not precache the lexicon chunk ${lexiconChunk}.`);
+  emitted.push(`${chapterChunk} + ${lexiconChunk}`);
+}
+
+console.log(`PASS: lazy-chapter split intact — ${emitted.join('; ')} emitted, precached, and chapter data is out of ${mainBundle}.`);
diff --git a/src/app.css b/src/app.css
index 060bd345f519251db32fbb08d3b9166a52c98c4d..04aeabdbbfb09df3969bcfdca0e1262e1b96e1ef 100644
--- a/src/app.css
+++ b/src/app.css
@@ -54,6 +54,7 @@ button { font: inherit; cursor: pointer; }
 .tile.correct { border-color: var(--ok); background: #e6f2e6; }
 .tile.incorrect { border-color: var(--bad); background: #f7e5e1; }
 .prompt { font-size: 3rem; text-align: center; padding: 18px; }
+.prompt.select-sentence { font-size: 1.25rem; line-height: 1.5; }
 .feedback { text-align: center; min-height: 1.5em; font-weight: 600; margin: 8px 0; }
 .feedback.ok { color: var(--ok); }
 .feedback.bad { color: var(--bad); }
@@ -161,15 +162,16 @@ button { font: inherit; cursor: pointer; }
 .rc-para { margin: 0 0 10px; }
 .rc-preamble { margin: 0 0 6px; }
 .rc-list { margin: 0 0 10px; padding-left: 1.5em; }
+.rc-list.authored-labels { list-style: none; padding-left: 0.75em; }
 .rc-list > li { margin-bottom: 10px; }
 .rc-lead { text-decoration: underline; font-weight: 600; }
+.rc-num { font-weight: 600; margin-right: 0.15em; }
 .rc-example { display: inline-flex; flex-wrap: wrap; align-items: baseline; gap: 8px;
   background: #fffdf3; border: 1px solid #e7dfbf; border-radius: 8px; padding: 6px 12px;
   margin: 8px 0 2px; font-size: 1rem; text-align: left; }
 .rc-example .greek { font-size: 1.3rem; }
 .rc-example.tappable { cursor: pointer; }
 .rc-caption { color: #6b6b63; font-style: italic; }
-.rc-spk { font-size: 0.95rem; }
 .rc-inlinenote { background: #fff8d6; border-left: 4px solid var(--teal); border-radius: 6px;
   padding: 8px 10px; font-size: 0.9375rem; margin-top: 8px; }
 .rc-deflist { display: flex; flex-direction: column; gap: 4px; margin: 8px 0 10px; }
@@ -186,6 +188,35 @@ button { font: inherit; cursor: pointer; }
 .rc-bibentry { padding-left: 1.4em; text-indent: -1.4em; font-size: 0.9375rem; line-height: 1.5; }
 .rc-refs { font-size: 0.875rem; color: #6b6b63; text-align: right; margin: 6px 0 2px; }
 
+/* ---- Chapter 2 structured charts and popup content ---- */
+.rc-greekrows { display: flex; flex-direction: column; margin: 10px 0; min-width: 0; }
+.rc-greekhead, .rc-syllable-row { display: grid; grid-template-columns: repeat(var(--greek-cols), minmax(0, 1fr));
+  gap: 8px; width: 100%; align-items: center; }
+.rc-greekhead { padding: 7px 6px; border-bottom: 2px solid rgba(0,0,0,0.1); color: var(--teal-dark);
+  font-size: 0.78rem; font-weight: 700; text-align: center; text-transform: uppercase; }
+.rc-syllable-row { border: none; border-bottom: 1px solid rgba(0,0,0,0.06); background: transparent;
+  padding: 10px 6px; font-size: 1.35rem; text-align: center; }
+.rc-syllable-row.greek-say { color: var(--link); }
+.rc-greekrow { display: grid; grid-template-columns: repeat(var(--greek-cols), minmax(0, 1fr)); gap: 10px;
+  align-items: baseline; border-bottom: 1px solid rgba(0,0,0,0.06); padding: 9px 6px; min-width: 0; }
+.rc-greeklabel { font-weight: 600; overflow-wrap: anywhere; }
+.rc-greekword { min-width: 0; font-size: 1.3rem; }
+.rc-greekword.greek-say { width: auto; color: var(--link); }
+.rc-greekgloss { color: var(--teal-dark); overflow-wrap: anywhere; }
+.rc-syllables { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 12px; }
+.rc-expander { margin: 8px 0; border: 1px solid #ddd6c2; border-radius: 10px; background: #fffdf3; }
+.rc-expander summary { padding: 11px 13px; color: var(--ink); font-weight: 600; cursor: pointer; }
+.rc-expander-body { padding: 0 13px 12px; }
+
+.pending-verification { border: 1px dashed #a66a18; border-radius: 8px; background: #fff6df;
+  color: #70460d; padding: 12px; text-align: center; font-weight: 600; }
+.pending-verification.compact { margin-top: 8px; padding: 7px 9px; font-size: 0.85rem; }
+
+/* ---- topicPages local stepper ---- */
+.topic-heading { margin: 0 0 12px; color: var(--teal-dark); font-size: 1.25rem; font-weight: 700; text-align: center; }
+.topic-controls { align-items: center; }
+.topic-count { min-width: 52px; color: var(--teal-dark); font-size: 0.9rem; font-weight: 700; text-align: center; }
+
 /* ---- Six Points collapsible ---- */
 .card.collapsible { padding: 0; overflow: hidden; }
 .collapse-head { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left;
@@ -292,6 +323,33 @@ button { font: inherit; cursor: pointer; }
 .kb-greek { font-size: 1.25rem; }
 .kb-ref { max-width: 420px; }
 
+/* ---- Chapter 2 divide / placeAccent activities ---- */
+.exercise-checks { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin: 12px 0;
+  font-size: 0.9rem; }
+.exercise-checks label { display: inline-flex; align-items: center; gap: 6px; }
+.exercise-count { margin-top: 8px; font-size: 0.85rem; font-weight: 400; }
+.exercise-answer { display: flex; align-items: baseline; justify-content: center; gap: 12px; margin: 12px 0;
+  padding: 10px; border-radius: 8px; background: white; }
+.exercise-answer > span:first-child { color: var(--teal-dark); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
+.exercise-answer .greek { font-size: 1.45rem; }
+.divide-word { display: flex; align-items: center; justify-content: center; width: 100%; min-width: 0;
+  padding: 20px 0; white-space: nowrap; }
+.divide-letter { flex: 0 1 auto; min-width: 0; border: none; background: transparent; padding: 0;
+  font-size: var(--divide-size); line-height: 1.4; }
+.divide-letter.greek-say { display: inline-block; color: var(--link); text-align: center; }
+.divide-gap { flex: 0 1 calc(var(--divide-size) * 0.55); width: calc(var(--divide-size) * 0.55); min-width: 8px;
+  align-self: stretch; border: none; border-bottom: 2px solid #b9af91; background: transparent; color: var(--link);
+  padding: 0; font-size: 0.65rem; font-weight: 700; }
+.divide-gap.selected { border-color: var(--link); background: #e8f0fb; }
+.accent-types { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-bottom: 14px; }
+.accent-slots { display: flex; justify-content: center; width: 100%; min-width: 0; }
+.accent-slot { flex: 1 1 0; min-width: 0; max-width: 48px; display: flex; flex-direction: column; align-items: center;
+  gap: 2px; border: 1px solid #d8d0b8; border-radius: 8px; background: white; color: var(--link); padding: 7px 2px; }
+.accent-slot + .accent-slot { margin-left: 4px; }
+.accent-slot span { font-size: 1.5rem; }
+.accent-slot small { color: #776f5d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 0.65rem; }
+.accent-slot.selected { border-color: var(--link); background: #e8f0fb; box-shadow: inset 0 0 0 1px var(--link); }
+
 /* ---- Reading People, Places and Letters ---- */
 .cat-buttons { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 12px; }
 .chip { background: #ece6d3; color: var(--ink); border: 1px solid #d8d0b8; border-radius: 999px;
@@ -340,7 +398,8 @@ html, body { touch-action: manipulation; }
 button, a, input, select, textarea, label,
 .tile, .tk-key, .chip, .act-row, .menu-item, .eq-cell, .diph-tile, .diph-ex,
 .rv-greek, .lm-row, .rc-defrow, .rc-example, .greek-chip, .greek-tap,
-.seg, .flash-hidden, .icon-btn, .bb-item, .section-head, .collapse-head {
+.seg, .flash-hidden, .icon-btn, .bb-item, .section-head, .collapse-head,
+.rc-expander summary, .divide-letter, .divide-gap, .accent-slot {
   touch-action: manipulation;
 }
 
diff --git a/src/components/ActivityHost.svelte b/src/components/ActivityHost.svelte
index b91d490a842cd83cd84bdea89c1529eb68811df2..5b5caf78e7f91ccc993fdca29e15c1a1844735b5 100644
--- a/src/components/ActivityHost.svelte
+++ b/src/components/ActivityHost.svelte
@@ -7,6 +7,8 @@
   import ContentAudio from './ContentAudio.svelte';
   import SelectActivity from './SelectActivity.svelte';
   import SpellActivity from './SpellActivity.svelte';
+  import DivideActivity from './DivideActivity.svelte';
+  import PlaceAccentActivity from './PlaceAccentActivity.svelte';
   import ReadingCategories from './ReadingCategories.svelte';
 
   export let chapterId;
@@ -52,6 +54,10 @@
       <SelectActivity {chapter} {activity} />
     {:else if activity.type === 'spell'}
       <SpellActivity {chapter} {activity} />
+    {:else if activity.type === 'divide'}
+      <DivideActivity {chapter} {activity} />
+    {:else if activity.type === 'placeAccent'}
+      <PlaceAccentActivity {chapter} {activity} />
     {:else}
       <div class="card">This activity type ({activity.type}) arrives in a later phase.</div>
     {/if}
diff --git a/src/components/ContentAudio.svelte b/src/components/ContentAudio.svelte
index 37709e95433a167108864a51434e4ebe29573d07..11e2ef8ad886481690ef2fab1af05b5962615a0f 100644
--- a/src/components/ContentAudio.svelte
+++ b/src/components/ContentAudio.svelte
@@ -2,7 +2,7 @@
   // The contentAudio family, dispatched on activity.mode (B1 — never on
   // activity id): chart / exploreGrid / stepper / textPage / objectivesPage /
   // flashcard / selfCheckStepper / selfCheckSequence / equationChart /
-  // vowelStair / diphthongRows / reviewVocab / reviewLetters. The bespoke
+  // vowelStair / diphthongRows / reviewVocab / reviewLetters / topicPages. The bespoke
   // modes are pedagogical layouts reconstructed from the original's yellow
   // panels; their per-mode data contracts are documented in HANDOFF-4 §5 (B1).
   import { slide } from 'svelte/transition';
@@ -57,6 +57,9 @@
   let revealed = false;
   let lastClicked = null;
   let sixOpen = false;
+  let topicIndex = 0;
+  $: topics = activity.topics || [];
+  $: currentTopic = topics[topicIndex] || null;
 
   // Learn Vocabulary flashcard visibility (A15). Segmented radio: Show Both /
   // Hide Greek / Hide English. A hidden pane blanks until tapped (per-card
@@ -134,6 +137,23 @@
     <ol>{#each chapter.objectives as o}<li>{o}</li>{/each}</ol>
   </div>
 
+{:else if mode === 'topicPages'}
+  <div class="card topic-page">
+    {#if currentTopic}
+      <div class="topic-heading">{currentTopic.title}</div>
+      <RichContent blocks={currentTopic.content || []} />
+      {#if currentTopic._verify}<div class="pending-verification compact">Some topic details are pending verification.</div>{/if}
+    {:else}
+      <div class="pending-verification">Topic content pending verification.</div>
+    {/if}
+    <div class="controls topic-controls">
+      <button class="btn secondary" on:click={() => (topicIndex = Math.max(0, topicIndex - 1))} disabled={topicIndex <= 0}>Previous Topic</button>
+      <span class="topic-count">{topics.length ? topicIndex + 1 : 0} of {topics.length}</span>
+      <button class="btn" on:click={() => (topicIndex = Math.min(topics.length - 1, topicIndex + 1))} disabled={!topics.length || topicIndex >= topics.length - 1}>Next Topic</button>
+    </div>
+    {#if activity._topic_verify}<div class="pending-verification compact">Topic order pending verification.</div>{/if}
+  </div>
+
 {:else if mode === 'textPage'}
   {#if activity.content}
     <div class="card">
@@ -329,8 +349,8 @@
       {/each}
     </div>
     <div class="controls">
-      {#if activity.sayWholeListAudio}
-        <button class="btn secondary" on:click={() => play(activity.sayWholeListAudio)}>Say Whole List</button>
+      {#if activity.playAll || activity.sayWholeListAudio}
+        <button class="btn secondary" on:click={() => play(activity.playAll?.audio || activity.sayWholeListAudio)}>{activity.playAll?.label || 'Say Whole List'}</button>
       {/if}
     </div>
     {#if activity.note}<div class="note">{activity.note}</div>{/if}
diff --git a/src/components/RichContent.svelte b/src/components/RichContent.svelte
index 2819c6533150121dae68f53c0b6365bf18852202..f9d94f3746c98e7ad01771e27796309f02201717 100644
--- a/src/components/RichContent.svelte
+++ b/src/components/RichContent.svelte
@@ -4,7 +4,8 @@
   // is pedagogy: headings, hanging-indent bibliographies, aligned definition
   // rows and underlined list lead-ins are all load-bearing, not decoration.
   //
-  // Block types: heading | para | numbered | defList | biblist | refs | note.
+  // Block types: heading | para | numbered | defList | biblist | refs | note |
+  // greekRows | expander.
   // Trailing { greek, caption?, audio? } "example" objects render in the Greek
   // font and play their clip on tap. defList rows [term, value, audio?] play
   // the row's clip when present.
@@ -18,6 +19,9 @@
   // { letters: [{ greek, audio }] } — a row of individually-tappable Greek
   // chips (A6, Six Points "Linguistic Pronunciation Descriptions").
   const isLettersList = v => v && typeof v === 'object' && Array.isArray(v.letters);
+  const defRows = block => block.rows || (block.items || []).map(item => [item.term, item.def, item.audio]);
+  const isSyllableMatrix = block => Array.isArray(block.columns)
+    && block.rows.every(row => Array.isArray(row.syllables) && row.syllables.length === block.columns.length && !row.gloss && !row.label);
 
   // greekTaps: split an item's text on STANDALONE substring matches (first
   // standalone occurrence per key) and render those substrings as tappable
@@ -70,21 +74,20 @@
         <button class="rc-example" class:tappable={b.example.audio} on:click={() => playAudio(b.example.audio)}>
           <span class="greek">{b.example.greek}</span>
           {#if b.example.caption}<span class="rc-caption">{b.example.caption}</span>{/if}
-          {#if b.example.audio}<span class="rc-spk" aria-hidden="true">🔊</span>{/if}
         </button>
       {/if}
 
     {:else if b.type === 'numbered'}
       {#if b.preamble}<p class="rc-preamble">{b.preamble}</p>{/if}
-      <ol class="rc-list">
+      {@const selfNum = (() => { const re = /^\(?\d+[.)]/; return b.items.length > 0 && b.items.every(it => it.label && re.test(it.label)); })()}
+      <ol class="rc-list" class:authored-labels={selfNum}>
         {#each b.items as it}
           <li>
-            {#if it.label}<span class="rc-lead">{it.label}</span>{it.text ? ' — ' : ''}{/if}{#if it.greekTaps}{#each splitTaps(it.text, it.greekTaps) as seg}{#if seg.audio}<button class="greek-tap greek" on:click={() => playAudio(seg.audio)}>{seg.t}</button>{:else}{seg.t}{/if}{/each}{:else}{it.text || ''}{/if}
+            {#if it.label}{#if selfNum}<span class="rc-num">{it.label}</span>{it.text ? ' ' : ''}{:else}<span class="rc-lead">{it.label}</span>{it.text ? ' — ' : ''}{/if}{/if}{#if it.greekTaps}{#each splitTaps(it.text, it.greekTaps) as seg}{#if seg.audio}<button class="greek-tap greek" on:click={() => playAudio(seg.audio)}>{seg.t}</button>{:else}{seg.t}{/if}{/each}{:else}{it.text || ''}{/if}
             {#if it.example}
               <button class="rc-example" class:tappable={it.example.audio} on:click={() => playAudio(it.example.audio)}>
                 <span class="greek">{it.example.greek}</span>
                 {#if it.example.caption}<span class="rc-caption">{it.example.caption}</span>{/if}
-                {#if it.example.audio}<span class="rc-spk" aria-hidden="true">🔊</span>{/if}
               </button>
             {/if}
             {#if it.defList}
@@ -103,7 +106,6 @@
                     <button class="rc-defrow" class:tappable={row[2]} on:click={() => playAudio(row[2])}>
                       <span class="rc-term greek">{row[0]}</span>
                       <span class="rc-val greek">{row[1]}</span>
-                      {#if row[2]}<span class="rc-spk" aria-hidden="true">🔊</span>{/if}
                     </button>
                   {/if}
                 {/each}
@@ -116,7 +118,7 @@
 
     {:else if b.type === 'defList'}
       <div class="rc-deflist">
-        {#each b.rows as row}
+        {#each defRows(b) as row}
           {#if isLettersList(row[1])}
             <div class="rc-defrow letters-row">
               <span class="rc-term">{row[0]}</span>
@@ -130,12 +132,68 @@
             <button class="rc-defrow" class:tappable={row[2]} on:click={() => playAudio(row[2])}>
               <span class="rc-term greek">{row[0]}</span>
               <span class="rc-val greek">{row[1]}</span>
-              {#if row[2]}<span class="rc-spk" aria-hidden="true">🔊</span>{/if}
             </button>
           {/if}
         {/each}
       </div>
 
+    {:else if b.type === 'greekRows'}
+      {@const syllableMatrix = isSyllableMatrix(b)}
+      <div class="rc-greekrows" class:syllable-matrix={syllableMatrix}>
+        {#if b.columns}
+          <div class="rc-greekhead" style={`--greek-cols:${b.columns.length}`}>
+            {#each b.columns as column}<span>{column}</span>{/each}
+          </div>
+        {/if}
+        {#each b.rows as row}
+          {#if syllableMatrix}
+            {#if row.audio}
+              <button class="rc-syllable-row greek greek-say" style={`--greek-cols:${b.columns.length}`} on:click={() => playAudio(row.audio)}>
+                {#each row.syllables as syllable}<span>{syllable || '\u00a0'}</span>{/each}
+              </button>
+            {:else}
+              <div class="rc-syllable-row greek" style={`--greek-cols:${b.columns.length}`}>
+                {#each row.syllables as syllable}<span>{syllable || '\u00a0'}</span>{/each}
+              </div>
+            {/if}
+          {:else}
+            {@const cellCount = (row.label ? 1 : 0) + (row.greek ? 1 : 0) + (row.gloss != null && row.gloss !== '' ? 1 : 0)}
+            <div class="rc-greekrow" style={`--greek-cols:${Math.max(cellCount, 1)}`}>
+              {#if row.label}<span class="rc-greeklabel">{row.label}</span>{/if}
+              {#if row.greek}
+                {#if row.audio}
+                  <button class="rc-greekword greek greek-say" on:click={() => playAudio(row.audio)}>
+                    {#if row.syllables}
+                      <span class="rc-syllables">{#each row.syllables as syllable}<span>{syllable}</span>{/each}</span>
+                    {:else}{row.greek}{/if}
+                  </button>
+                {:else}
+                  <span class="rc-greekword greek">
+                    {#if row.syllables}
+                      <span class="rc-syllables">{#each row.syllables as syllable}<span>{syllable}</span>{/each}</span>
+                    {:else}{row.greek}{/if}
+                  </span>
+                {/if}
+              {/if}
+              {#if row.gloss != null && row.gloss !== ''}<span class="rc-greekgloss">{row.gloss}</span>{/if}
+            </div>
+          {/if}
+        {/each}
+        {#if b._verify}<div class="pending-verification compact">Some chart details are pending verification.</div>{/if}
+      </div>
+
+    {:else if b.type === 'expander'}
+      <details class="rc-expander">
+        <summary>{b.label}</summary>
+        <div class="rc-expander-body">
+          {#if b.content && b.content.length}
+            <svelte:self blocks={b.content} />
+          {:else}
+            <div class="pending-verification compact">Content pending verification.</div>
+          {/if}
+        </div>
+      </details>
+
     {:else if b.type === 'biblist'}
       {#if b.starNote}<div class="rc-starnote">{b.starNote}</div>{/if}
       <div class="rc-biblist">
diff --git a/src/components/SelectActivity.svelte b/src/components/SelectActivity.svelte
index 2c3a57df53fb9b3e4a4cc0330925b7c593680843..e4b5c92d54f382568bfd5dd3b30bfb6f38484299 100644
--- a/src/components/SelectActivity.svelte
+++ b/src/components/SelectActivity.svelte
@@ -10,6 +10,7 @@
   let options = [];
   let questions = [];
   let promptIsGreek = false;   // generator-declared (P6-P9): Greek prompts are tappable
+  let optionClass = 'wide';
   let qIndex = 0;
   let attempts = 0;
   let correct = 0;
@@ -26,20 +27,25 @@
     options = built.options;
     questions = built.questions;
     promptIsGreek = !!built.promptIsGreek;
+    optionClass = built.optionClass || '';
     qIndex = 0; attempts = 0; correct = 0;
     feedback = ''; picked = null; answered = false; finished = false;
     maybePronounce();
   }
 
   $: current = questions[qIndex];
+  $: staticOptions = Array.isArray(activity.optionValues);
+  $: wideOptions = !staticOptions || optionClass === 'wide';
+  $: showPronounce = !staticOptions || !!activity.ui?.buttons?.includes('Pronounce');
+  $: showPronounceEach = !staticOptions || !!activity.ui?.checkboxes?.includes('Pronounce Each Drill');
 
   function maybePronounce() {
     const q = questions[qIndex];
-    if (pronounceEach && q && q.promptAudio) play(q.promptAudio);
+    if (pronounceEach && q && !q.pending && q.promptAudio) play(q.promptAudio);
   }
 
   function choose(opt) {
-    if (answered || finished) return;
+    if (answered || finished || current.pending) return;
     picked = opt.id;
     attempts += 1;
     if (opt.id === current.answerId) {
@@ -70,6 +76,12 @@
     if (attempts === 0) return chapter.feedback?.scorePrompt || 'Give it a try first';
     return `${correct} correct out of ${attempts} attempts (${Math.round((correct / attempts) * 100)}%)`;
   }
+  function sentenceParts(text, underline) {
+    if (!underline) return null;
+    const at = text.indexOf(underline);
+    if (at === -1) return null;
+    return [text.slice(0, at), text.slice(at, at + underline.length), text.slice(at + underline.length)];
+  }
   let showScore = false;
 </script>
 
@@ -85,28 +97,39 @@
          English prompts stay static; options are answers, never audio taps. -->
     {#if promptIsGreek && current.promptAudio}
       <button class="prompt greek greek-say" on:click={() => play(current.promptAudio)}>{current.prompt}</button>
+    {:else if current.underline && sentenceParts(current.prompt, current.underline)}
+      {@const parts = sentenceParts(current.prompt, current.underline)}
+      <div class="prompt select-sentence">{parts[0]}<u>{parts[1]}</u>{parts[2]}</div>
     {:else}
-      <div class="prompt greek">{current.prompt}</div>
+      <div class="prompt" class:greek={promptIsGreek}>{current.prompt}</div>
+    {/if}
+    {#if current.pending}
+      <div class="pending-verification" role="status">This activity item is pending content verification.</div>
+    {:else}
+      <div class="feedback {feedbackKind}">{feedback}</div>
+      <div class="grid options" class:wide={wideOptions}>
+        {#each options as opt}
+          <button
+            class="tile small"
+            class:greek={activity.options === 'greek' || activity.generator?.options === 'lower'}
+            class:correct={answered && opt.id === current.answerId}
+            class:incorrect={picked === opt.id && opt.id !== current.answerId}
+            on:click={() => choose(opt)}>
+            {opt.label}
+          </button>
+        {/each}
+      </div>
     {/if}
-    <div class="feedback {feedbackKind}">{feedback}</div>
-    <div class="grid options wide">
-      {#each options as opt}
-        <button
-          class="tile small"
-          class:greek={activity.options === 'greek' || activity.generator?.options === 'lower'}
-          class:correct={answered && opt.id === current.answerId}
-          class:incorrect={picked === opt.id && opt.id !== current.answerId}
-          on:click={() => choose(opt)}>
-          {opt.label}
-        </button>
-      {/each}
-    </div>
     <div class="controls">
       <button class="btn secondary" on:click={() => (showScore = !showScore)}>Score</button>
-      <button class="btn" on:click={() => current.promptAudio && play(current.promptAudio)}>Pronounce</button>
-      <label style="display:flex; align-items:center; gap:6px; font-size:0.9rem">
-        <input type="checkbox" bind:checked={pronounceEach} /> Pronounce each
-      </label>
+      {#if showPronounce}
+        <button class="btn" disabled={!current.promptAudio} on:click={() => current.promptAudio && play(current.promptAudio)}>Pronounce</button>
+      {/if}
+      {#if showPronounceEach}
+        <label style="display:flex; align-items:center; gap:6px; font-size:0.9rem">
+          <input type="checkbox" bind:checked={pronounceEach} disabled={!current.promptAudio} /> Pronounce each
+        </label>
+      {/if}
     </div>
     {#if showScore}<div class="scorebox">{scoreText()}</div>{/if}
     <div class="scorebox" style="font-weight:400; font-size:0.85rem; margin-top:8px">
diff --git a/src/components/SpellActivity.svelte b/src/components/SpellActivity.svelte
index 9a904187a92661de72001f5c8a1bd485d31b37c7..30a54e7e1c67f86e337c0a4678cf9ba3ea7fc21a 100644
--- a/src/components/SpellActivity.svelte
+++ b/src/components/SpellActivity.svelte
@@ -4,24 +4,28 @@
   // (legacy roman->Greek layout). Diacritic tiles combine onto the previous
   // character and NFC-normalize. Grading honors the "With Accents" toggle.
   import { onMount, onDestroy } from 'svelte';
-  import { getLemma, randomFeedback } from '../lib/content.js';
+  import { getSpellerTiles, getLemma, randomFeedback } from '../lib/content.js';
   import { play } from '../lib/audio.js';
   import { markCompleted } from '../lib/progress.js';
   export let chapter;
   export let activity;
 
   const words = (activity.items || []).map(it => {
-    const l = getLemma(it.ref) || {};
+    const l = getLemma(it.ref, chapter.id, it.pool) || {};
     return { ref: it.ref, greek: l.greek || '', gloss: l.gloss || '', audio: l.audio || null };
   });
 
-  // Tile keyboard is data-driven from chapt-01.json `spellerTiles` (the
-  // authoritative 39-tile inventory: 25 letters + 11 diacritic marks + 3
+  // Tile keyboard uses the static `speller-tiles.json` contract: the
+  // authoritative 39-tile inventory has 25 letters + 11 diacritic marks + 3
   // iota-subscript composites). Each diacritic's `apply` is the combining
   // sequence appended to the previous character before NFC normalization.
   // Falls back to a minimal derived inventory if the data ever lacks it.
-  const tiles = activity.spellerTiles || {};
-  const letterTiles = tiles.letters || chapter.alphabet.letters.map(l => (l.lower === 'σ/ς' ? 'σ' : l.lower));
+  const tiles = activity.spellerTiles
+    || (activity.spellerTilesRef ? getSpellerTiles(activity.spellerTilesRef) : {});
+  const fallbackLetters = chapter.alphabet && chapter.alphabet.letters
+    ? chapter.alphabet.letters.map(l => (l.lower === 'σ/ς' ? 'σ' : l.lower))
+    : [];
+  const letterTiles = tiles.letters || fallbackLetters;
   const diacriticTiles = tiles.diacritics || [];
   const compositeTiles = tiles.composites || ['ᾳ', 'ῃ', 'ῳ'];
 
diff --git a/src/lib/content.js b/src/lib/content.js
index 2c51d958b6521ee9ca88d260e3afe4e70e6272ac..dd16e68c72d224d5023eb2aceef1f50975750803 100644
--- a/src/lib/content.js
+++ b/src/lib/content.js
@@ -19,6 +19,7 @@
 
 import toc from '../data/toc.json';
 import intro from '../data/intro.json';
+import spellerTiles from '../data/speller-tiles.json';
 
 // Per-chapter chunk loaders, keyed by chapter id. Vite emits one JS chunk per
 // matched file and vite-plugin-pwa precaches each (audit-proven). Filenames are
@@ -50,6 +51,8 @@ const inflight = {};   // id -> in-flight loadChapter promise, memoized; reset o
 
 export function getToc() { return toc; }
 
+export function getSpellerTiles(_ref) { return spellerTiles; }
+
 // Ids of chapters whose content is BUILT — derived from the glob key paths, so
 // it answers WITHOUT loading any chunk (packs.js and the TOC depend on this
 // being cheap). Intro first, then chapters in glob (path-sorted) order.
@@ -103,12 +106,29 @@ export function getChapter(id) {
 export function isChapterAvailable(id) { return id === 'intro' || id in chapterLoaders; }
 
 // Lemma lookup across LOADED lexicons (the route gate guarantees the active
-// chapter's lexicon is loaded alongside its content). Keeps its ref-only
-// signature; callers below the gate are unchanged.
-export function getLemma(ref) {
+// chapter's lexicon is loaded alongside its content). Optional chapter/pool
+// context keeps duplicated refs bound to the active chapter's self-contained
+// audio pack (chapter 2 deliberately mirrors chapter 1's first ten lemmas).
+const LEMMA_BUCKETS = ['lemmas', 'exampleWords', 'ch1_lemma_mirror'];
+
+function lemmaFromLexicon(lex, ref) {
+  if (!lex) return null;
+  for (const bucket of LEMMA_BUCKETS) {
+    if (lex[bucket] && lex[bucket][ref]) return lex[bucket][ref];
+  }
+  return null;
+}
+
+export function getLemma(ref, chapterId, pool) {
+  if (chapterId) {
+    const lex = registry[chapterId] && registry[chapterId].lexicon;
+    if (!lex) return null;
+    if (pool && lex[pool] && lex[pool][ref]) return lex[pool][ref];
+    return lemmaFromLexicon(lex, ref);
+  }
   for (const id in registry) {
-    const lex = registry[id].lexicon;
-    if (lex && lex.lemmas && lex.lemmas[ref]) return lex.lemmas[ref];
+    const lemma = lemmaFromLexicon(registry[id].lexicon, ref);
+    if (lemma) return lemma;
   }
   return null;
 }
@@ -239,7 +259,7 @@ export function resolveItems(chapter, activity) {
   if (Array.isArray(activity.items)) {
     return activity.items.map(item => {
       if (item.ref) {
-        const lemma = getLemma(item.ref);
+        const lemma = getLemma(item.ref, chapter.id, item.pool);
         return lemma ? {
           display: lemma.greek, secondary: lemma.gloss, audio: lemma.audio,
           meta: { ...lemma, ref: item.ref }
@@ -297,10 +317,42 @@ export function buildSelectQuestions(chapter, activity) {
     // 'lower'/'upper' prompts are Greek letters; 'name'/'translit' are English.
     return { options, questions, optionClass: 'wide', promptIsGreek: promptField === 'lower' || promptField === 'upper' };
   }
+
+  // Static-option drills use authored optionValues rather than a lexicon-
+  // derived answer grid. Missing prompt/answer fields remain in the sequence
+  // as visible pending-verification questions instead of becoming bad answers.
+  if (Array.isArray(activity.optionValues)) {
+    const promptField = activity.promptFrom && activity.promptFrom.show;
+    const promptIsGreek = promptField === 'greek';
+    const options = activity.optionValues.map(value => ({ id: String(value), label: String(value) }));
+    const questions = shuffle((activity.items || []).map(item => {
+      const lemma = item.ref ? getLemma(item.ref, chapter.id, item.pool) : null;
+      const prompt = promptField === 'sentence'
+        ? item.sentence
+        : promptField === 'greek'
+          ? (item.greek || (lemma && lemma.greek))
+          : item[promptField];
+      const needsUnderline = promptField === 'sentence' && !item.underline;
+      return {
+        prompt: prompt || '',
+        promptAudio: promptIsGreek ? (item.promptAudio || item.audio || (lemma && lemma.audio) || null) : null,
+        answerId: item.answer == null ? null : String(item.answer),
+        underline: item.underline || null,
+        pending: !prompt || item.answer == null || needsUnderline
+      };
+    }));
+    const optionClass = options.every(option => option.label.length <= 8) ? 'wide' : '';
+    return { options, questions, optionClass, promptIsGreek };
+  }
+
   // items-based (vocabulary drills): options are the full lemma set. Both
   // drills show the SHORT gloss ("truly, verily", "and, even", "Christ");
   // the full gloss + ntFreq is reserved for the Review Vocabulary Chart.
-  const lemmas = (activity.items || []).map(ref => ({ ref, ...getLemma(ref) }));
+  const lemmas = (activity.items || []).map(item => {
+    const ref = typeof item === 'string' ? item : item.ref;
+    const pool = typeof item === 'string' ? null : item.pool;
+    return { ref, ...(getLemma(ref, chapter.id, pool) || {}) };
+  });
   const promptSide = activity.prompt === 'greek' ? 'greek' : 'gloss';
   const optionSide = promptSide === 'greek' ? 'gloss' : 'greek';
   const label = (l, side) => (side === 'gloss' ? (l.glossShort || l.gloss) : l.greek);
diff --git a/AGENTS.md b/AGENTS.md
new file mode 100644
index 0000000000000000000000000000000000000000..5c898a71d344d2fbf7bc1c4de89444f088794447
--- /dev/null
+++ b/AGENTS.md
@@ -0,0 +1,27 @@
+# Greek Tutor project guidance
+
+Before making changes in this repository, read
+`/Users/nathanaelwarren/Desktop/ElyseApp/ONBOARD-SOL.md` in full. It is the
+authoritative implementer onboarding and persistent project memory for this
+workspace. Follow it together with the active `buildout/*-SPEC.md`.
+
+The load-bearing rules include:
+
+- Work one spec at a time and stay exactly within its scope. Diagnose and
+  report code/spec drift before reshaping an implementation.
+- Preserve fidelity, pedagogical visual arrangement, the sequential rail,
+  offline behavior, audio-stop-on-exit behavior, color semantics, and the
+  Greek-tap contract.
+- Never create a dead-end sequential Next action.
+- Never add an app-load or route-mount full cache/store scan.
+- Keep audio bytes and their ownership within the frozen phase-4.5
+  architecture. Do not add another IndexedDB or audio-byte writer.
+- Do not edit generated `src/data/*.json` content unless the active spec
+  explicitly requires it. Surface suspicious data instead of guessing.
+- Preserve `{#key activityId}` remount behavior in `ActivityHost`.
+- Do not mass-refactor working code. Match local style and patch surgically.
+- Run the active spec's acceptance checklist before writing its handoff, and
+  record deviations, surprises, and verification evidence in that handoff.
+- Do not use emoji in code, comments, UI copy, commits, or handoffs.
+- Do not push to a remote. Do not commit unless Nathanael explicitly asks.
+
diff --git a/buildout/5B-MERGE-SPEC.md b/buildout/5B-MERGE-SPEC.md
new file mode 100644
index 0000000000000000000000000000000000000000..94a0d8a1174489c88df9c75d729ab9028e9cee21
--- /dev/null
+++ b/buildout/5B-MERGE-SPEC.md
@@ -0,0 +1,187 @@
+# 5B-MERGE-SPEC.md -- Port Opus improvements into the Sol base
+
+Base: GPT Sol Ultra 5B working tree (accepted).
+Purpose: Five targeted patches from the Opus 4.8 run that improve
+architecture, robustness, or UX without touching the accepted surfaces.
+
+Handoff source: HANDOFF-5B-SOL.md (the accepted base handoff).
+
+## Patch 1: Static speller tiles (replaces cross-chunk loadChapter)
+
+**Problem:** The Sol base resolves `spellerTilesRef` by calling
+`loadChapter("chapt_1")` at route-gate time inside `loadChapter("chapt_2")`.
+This works but adds runtime coupling: a direct chapter-2 speller route
+triggers a chapter-1 chunk fetch, and the dependency-scanning loop in
+`loadChapter` adds complexity.
+
+**Fix:**
+1. Create `src/data/speller-tiles.json` containing the 39-tile keyboard
+   contract (25 letters + 11 diacritics + 3 composites). Copy the exact
+   inventory from `chapt-01.json`'s `spellerTiles` block.
+2. In `src/lib/content.js`:
+   - Add `import spellerTiles from '../data/speller-tiles.json';`
+   - Add `export function getSpellerTiles(_ref) { return spellerTiles; }`
+   - Remove the `spellerTilesRef` dependency-resolution loop inside
+     `loadChapter()` (the `refs` Set, the section scan, and the
+     `Promise.all([...refs].map(loadChapter))` call).
+3. In `src/components/SpellActivity.svelte`:
+   - Replace `import { getChapter, getLemma, ... }` with
+     `import { getSpellerTiles, getLemma, ... }`.
+   - Replace the `tileChapter` / `referencedTiles` resolution block with:
+     ```js
+     const tiles = activity.spellerTiles
+       || (activity.spellerTilesRef ? getSpellerTiles(activity.spellerTilesRef) : {});
+     ```
+   - Keep the existing `fallbackLetters` guard for `chapter.alphabet`.
+
+**Acceptance:** `npm run verify` passes; direct-load `#/activity/chapt_2/c2_ex_speller`
+renders 39 tiles without triggering a chapter-1 chunk fetch.
+
+## Patch 2: Precise self-numbering heuristic
+
+**Problem:** The Sol base applies `authored-labels` class when ANY item
+has a `.label`, which matches chapter-1's named labels ("Final Sigma") and
+drops list-style on those too. Only numeric markers should trigger this.
+
+**Fix:** In `src/components/RichContent.svelte`, replace:
+```js
+class:authored-labels={b.items.some(item => item.label)}
+```
+with:
+```js
+{@const selfNum = (() => { const re = /^\(?\d+[.)]/; return b.items.length > 0 && b.items.every(it => it.label && re.test(it.label)); })()}
+```
+```svelte
+<ol class="rc-list" class:authored-labels={selfNum}>
+```
+When `selfNum` is true, render the label in a `<span class="rc-num">` instead
+of `<span class="rc-lead">`, and use a space separator instead of ` -- `.
+
+In `src/app.css`, add:
+```css
+.rc-num { font-weight: 600; margin-right: 0.15em; }
+```
+
+**Acceptance:** Chapter-1's "Final Sigma" / "Nasal Gamma" items retain their
+`rc-lead` underline and the `<ol>` auto-number. Chapter-2's "1)" items
+render with the explicit marker and no duplicate auto-number.
+
+## Patch 3: String-reconstruction answer check in PlaceAccent
+
+**Problem:** The Sol base compares accent type and position index
+separately. This works for the current data but is fragile: if a word has
+multiple valid accent positions for the same type (unlikely but possible in
+future data), the position-index comparison could yield false positives.
+
+**Fix:** In `src/components/PlaceAccentActivity.svelte`, change the `check()`
+function to reconstruct the full string:
+```js
+function check() {
+  if (pending || answered || accentType == null || accentPosition == null) return;
+  const ACCENTS = { Acute: '\u0301', Grave: '\u0300', Circumflex: '\u0342' };
+  const clusters = splitGraphemes(answer.display);
+  clusters[accentPosition] = (clusters[accentPosition] + ACCENTS[accentType]).normalize('NFC');
+  const candidate = clusters.join('').normalize('NFC');
+  const ok = candidate === word.answerForm.normalize('NFC');
+  attempts += 1;
+  if (ok) {
+    correct += 1;
+    completedWords.add(wordIndex);
+    feedback = randomFeedback(chapter, 'correct');
+    feedbackKind = 'ok';
+    answered = true;
+    if (completedWords.size === words.length) markCompleted(activity.id);
+  } else {
+    feedback = randomFeedback(chapter, 'incorrect');
+    feedbackKind = 'bad';
+  }
+}
+```
+Import `splitGraphemes` from `../lib/greek.js` (already available from the
+Sol base).
+
+**Acceptance:** placeAccent item 1 (aggelos, Acute@pos1) still scores
+correct; an intentionally wrong pick scores incorrect.
+
+## Patch 4: LEMMA_BUCKETS abstraction in content.js
+
+**Problem:** The Sol base's `getLemma` explicitly walks three bucket names
+inline. Adding a fourth bucket later means editing every call path.
+
+**Fix:** In `src/lib/content.js`, extract:
+```js
+const LEMMA_BUCKETS = ['lemmas', 'exampleWords', 'ch1_lemma_mirror'];
+function lemmaFromLexicon(lex, ref) {
+  if (!lex) return null;
+  for (const bucket of LEMMA_BUCKETS) {
+    if (lex[bucket] && lex[bucket][ref]) return lex[bucket][ref];
+  }
+  return null;
+}
+```
+Then simplify `getLemma(ref, chapterId, pool)`:
+- The `pool` override stays as-is (it handles `item.pool` lookups).
+- After the pool check, call `lemmaFromLexicon(lex, ref)` instead of the
+  inline bucket walk.
+- The fallback loop across all registries also uses `lemmaFromLexicon`.
+
+**Acceptance:** No behavioral change; `npm run verify` passes.
+
+## Patch 5: Auto-advance on correct answer
+
+**Problem:** The Sol base's PlaceAccent and Divide components do not
+auto-advance after a correct answer. The original application advances
+automatically.
+
+**Fix:** In both `PlaceAccentActivity.svelte` and `DivideActivity.svelte`,
+after setting `answered = true` (or the equivalent correct-answer path), add:
+```js
+clearTimeout(advanceTimer);
+advanceTimer = setTimeout(() => move(1), 900);
+```
+Add `let advanceTimer = null;` to the component state. Clear on manual
+Previous/Next and on unmount.
+
+**Acceptance:** Correct answer in placeAccent auto-advances after ~1 second;
+manual Next still works immediately.
+
+## Out of scope
+
+- No data file changes.
+- No new components.
+- No CSS layout changes beyond the `rc-num` class addition.
+- No changes to the build guard, emoji cleanup, touch-action, or AGENTS.md
+  (all already handled by the Sol base).
+
+## Handoff update
+
+After all five patches land, append the following section to
+`HANDOFF-5B-SOL.md`:
+
+```markdown
+## 8. Post-merge patches (5B-MERGE-SPEC)
+
+Five targeted improvements ported from a parallel Opus 4.8 implementation:
+
+1. **Static speller tiles** -- `spellerTilesRef` now resolves via a static
+   `src/data/speller-tiles.json` file and `getSpellerTiles()`, replacing the
+   cross-chunk `loadChapter` dependency resolution. No runtime coupling
+   between chapter lazy chunks.
+2. **Precise self-numbering** -- The `authored-labels` heuristic now uses a
+   `/^\(?\d+[.)]/` regex so only numeric markers suppress `<ol>` auto-
+   numbering. Chapter-1's named labels ("Final Sigma") are unaffected.
+3. **String-reconstruction answer check** -- PlaceAccent's `check()` now
+   reconstructs the full accented string and NFC-compares to `answerForm`
+   instead of comparing type + position separately.
+4. **LEMMA_BUCKETS abstraction** -- `getLemma` delegates to a shared
+   `lemmaFromLexicon()` helper with a `LEMMA_BUCKETS` array, making future
+   bucket additions a one-line change.
+5. **Auto-advance on correct** -- PlaceAccent and Divide auto-advance to the
+   next item ~900ms after a correct answer, matching the original's behavior.
+
+No data files, build guard, emoji cleanup, touch-action extensions, or
+AGENTS.md were changed by these patches.
+```
+
+Record acceptance results (build hash, rail walk confirmation) inline in that
+same section.
diff --git a/buildout/HANDOFF-5B-SOL.md b/buildout/HANDOFF-5B-SOL.md
new file mode 100644
index 0000000000000000000000000000000000000000..61c82f72e2be32e436b727d988f65e9e0986328d
--- /dev/null
+++ b/buildout/HANDOFF-5B-SOL.md
@@ -0,0 +1,262 @@
+# HANDOFF-5B.md — Chapter 2 wiring (phase 5, pass B)
+
+Input: `5B-SPEC.md`, the already-landed chapter-2 data files, and the phase-5A
+lazy loader. No chapter data JSON was edited. No commit was created and nothing
+was pushed.
+
+## 1. Precondition gate
+
+`VERIFY-5A.md` contains completed device responses but its final `ALL PASS`
+checkbox is still unchecked. The one repeatable concern recorded there, the
+occasionally disabled bottom bar, was diagnosed and fixed in the latest
+user-authored commit (`fa8132f`, described as "wrapping stage 5a"). The current
+explicit instruction to implement 5B was therefore treated as the human gate
+approval. This inference is recorded here rather than silently converting the
+unchecked verification document into a pass.
+
+## 2. What changed
+
+### Content registration and lookup
+
+- `src/lib/content.js`
+  - The existing globs automatically register `chapt-02.json` and
+    `lexicon-chapt02.json`; `getBuiltChapterIds()` now returns `intro`,
+    `chapt_1`, and `chapt_2`.
+  - `loadChapter()` resolves explicit `spellerTilesRef` dependencies inside the
+    route gate. A direct chapter-2 speller route therefore has chapter 1's
+    verified 39-tile inventory available synchronously below the gate.
+  - `getLemma()` accepts optional chapter and pool context. This prevents a
+    loaded chapter-1 lexicon from stealing chapter-2 mirror refs and preserves
+    the deliberate `chapt_2_a_voc*` pack-local audio ids.
+  - `buildSelectQuestions()` supports authored `optionValues[]`, Greek or
+    English prompt sources, static answers, contextual prompt audio, and
+    visible pending questions when required prompt/answer fields are null.
+
+`toc.json` already contained the chapter-2 entry, and both chapter-2 JSON files
+were already committed before this implementation. They were not modified.
+
+### Components added
+
+- `src/components/DivideActivity.svelte`
+  - Implements numbered multi-select gaps between Unicode grapheme clusters,
+    Check Answer, Show Answer, score, Previous/Next, Pronounce Each, and Hint.
+  - The current 21 null word/division records render explicit pending states.
+  - The data supplies `hint.contentRef` rather than inline content. The
+    component resolves that reference against an authored RichContent heading,
+    so the Three Syllable Rules render without duplicating or inventing copy.
+- `src/components/PlaceAccentActivity.svelte`
+  - Implements accent-type selection followed by a numbered letter-position
+    selection, Check Answer, Show Answer, score, Previous/Next, Pronounce Each,
+    feedback pools, and completion tracking.
+  - Correct answers lock against duplicate scoring until the learner moves to
+    another word.
+- `src/lib/greek.js`
+  - Splits Greek by grapheme cluster and analyzes accents in NFD.
+  - Removes only U+0301, U+0300, and U+0342 from the displayed place-accent
+    form, preserving breathings and diaeresis, then returns NFC for display.
+- `src/components/ActivityHost.svelte`
+  - Dispatches the two new activity types while preserving the existing
+    `{#key activityId}` remount boundary.
+
+### Components extended
+
+- `src/components/ContentAudio.svelte`
+  - Adds the mode-keyed `topicPages` local stepper with topic title,
+    Previous/Next Topic controls, count, and RichContent per topic.
+  - Adds `reviewVocab.playAll` while retaining chapter 1's
+    `sayWholeListAudio` contract.
+- `src/components/RichContent.svelte`
+  - Adds `greekRows` with optional headings, syllable-chunk spacing, labels,
+    glosses, audio-aware Greek taps, inert ink-colored Greek, responsive rows,
+    and visible verification notices.
+  - Adds closed-by-default recursive `expander` blocks.
+  - Accepts both chapter 1's tuple-form `defList.rows` and chapter 2's
+    object-form `defList.items`.
+  - Suppresses browser list markers when the data already provides numbered
+    labels, avoiding duplicated numbering.
+  - Removes the old speaker emoji from RichContent examples. Tappability
+    remains communicated by the required blue Greek styling.
+- `src/components/SelectActivity.svelte`
+  - Renders long static option sets in a two-column grid and short sets in the
+    existing four-column grid; chapter-1 layouts remain four-column.
+  - Renders English prompts without the Greek font, future underlined sentence
+    targets, contextual controls, and explicit pending states.
+- `src/components/SpellActivity.svelte`
+  - Resolves chapter-context lemmas and `spellerTilesRef` without adding a
+    second tile inventory.
+- `src/app.css`
+  - Adds responsive topic, Greek-row, pending, divide, and place-accent styles.
+  - At 320 px, long row content wraps instead of clipping; tappable Greek and
+    accent/gap answer controls use `--link` blue.
+- `scripts/check-lazy-chunk.mjs`
+  - Extends the tree-shake/build guard to require both chapter-2 chunks, keep
+    chapter-2 lesson data out of the main bundle, and require both new chunks
+    in the service-worker precache.
+
+### Project memory
+
+- Root `AGENTS.md` records `ONBOARD-SOL.md` as the authoritative persistent
+  onboarding source and preserves its load-bearing directives for future work.
+
+## 3. Schema friction and data gaps
+
+These are pipeline findings, not local data corrections:
+
+1. The spec describes the divide hint content as included in `activity.hint`,
+   but the delivered shape is `{ contentRef: "threeSyllableRules" }`. The
+   generic heading-reference resolution above bridges the actual shape.
+2. Chapter 2 uses object-form `defList.items`; the prior renderer only knew
+   tuple-form `defList.rows`.
+3. `spellerTilesRef: "chapt_1"` crosses a lazy-chunk boundary. Direct loading
+   chapter 2 requires the loader to resolve that explicit data dependency.
+4. Chapter-2 mirror lemmas reuse chapter-1 refs. Context-free lookup could play
+   chapter-1 audio after both lexicons had loaded, violating pack
+   self-containment; lookups are now chapter/pool scoped at affected call sites.
+5. Three static drills remain non-scorable by design because their answer data
+   is null: Accent Rule, Marking Recognition, and Part of Speech. Their known
+   prompts render where available, followed by a visible pending-verification
+   state. Syllable Counting has complete prompt/answer data and is functional.
+6. All 21 Divide items still have null `greek` and `division`; the complete
+   component renders each item as pending and will consume the later data patch
+   without component changes.
+7. Several populated charts carry `_verify` because placement/audio pairings
+   need DOSBox confirmation. Existing rows remain visible, with a concise
+   pending notice; content is never guessed or hidden.
+
+## 4. Acceptance results
+
+### Build shape
+
+PASS — `npm run verify`.
+
+- Vite transformed 69 modules and completed without warnings or errors.
+- Emitted and precached:
+  - `chapt-01-8ZoFoXk9.js` — 35.39 kB
+  - `lexicon-chapt01-DWCL8L3K.js` — 6.75 kB
+  - `chapt-02-Bj1cYXtT.js` — 42.75 kB
+  - `lexicon-chapt02-DbQ9TYN-.js` — 9.22 kB
+- Chapter 1's chunk hash remained `8ZoFoXk9` throughout the 5B builds.
+- Both chapter needles are absent from `index-Bc2p5aOd.js` and present only in
+  their chapter chunks.
+- `sw.js` precaches both chapter and both lexicon chunks.
+- Precache count is 19, the phase-5A count of 17 plus the two chapter-2 chunks.
+
+### Browser behavior at 320 px
+
+PASS — headless Chrome with an iPhone user agent against the real Vite modules.
+
+- Direct-load checks passed for TOC, Settings, chapter-2 hub, hub section, and
+  activity routes.
+- Chapter 2 full rail walk: 20 of 20 items in authored sequence order, then the
+  end-of-chapter dialog; no dead-end Next.
+- Chapter 1 regression rail walk: 26 of 26 items, then its end dialog.
+- Zero console exceptions and zero page errors.
+- Every topic of all four `topicPages` activities was visited with all
+  expanders opened. Cards, `greekRows`, syllable matrices, the longest wrapped
+  rows, and all nine Review Marks rows stayed inside the 320 px viewport.
+- Computed-style sweep: tappable Greek is `rgb(22, 99, 199)`; Greek rows with
+  no audio remain ink-colored and inert.
+- Syllable Counting resolved 20 contextual Greek prompts, all with chapter-2
+  audio and answers; correct-answer feedback and advancement passed.
+- Accent Rule's 20 missing answers render as pending rather than accepting a
+  null answer.
+- Divide pending state and the Three Syllable Rules Hint passed.
+- Place Accent passed the full first-item flow: accent-stripped display,
+  Acute selection, correct position, Check Answer, chapter-2 feedback, score,
+  and duplicate-answer lock.
+- Unicode unit checks passed for acute, grave, and circumflex removal while
+  retaining smooth/rough breathings and diaeresis.
+- Direct chapter-2 speller load rendered all 39 chapter-1 tiles.
+- Review Vocabulary rendered the authored `Play` control.
+
+### Hard-offline preview equivalent
+
+PASS — final built preview, service worker installed, chapter-2 pack downloaded,
+then the preview server was killed and independently confirmed unreachable.
+
+- Chapter-2 pack: 75 files in IndexedDB.
+- Settings state: `Audio available offline`; persisted audio counter: 75.
+- Offline activity reload rendered under service-worker control.
+- An explicit trusted tap on a blue Greek prompt played from IndexedDB without
+  a toast.
+- Offline direct activity refresh passed.
+- Offline chapter-2 rail walk reached all 20 items and the end dialog with zero
+  console/page errors.
+
+## 5. Screenshots
+
+All screenshots are final 320 by 844 CSS-pixel captures at device scale 2:
+
+- [Learn Syllables](screenshots/5B/topic-syllables.png)
+- [Learn Accents](screenshots/5B/topic-accents.png)
+- [Learn Other Marks](screenshots/5B/topic-marks.png)
+- [Learn Grammar Review](screenshots/5B/topic-grammar-review.png)
+
+## 6. Surprises and verification notes
+
+- A rapid automated rail walk starts auto-pronunciation and immediately leaves
+  the route. The standing route-exit behavior correctly calls `stop()` and
+  revokes the Blob URL; headless Chrome then logs a resource-level
+  `ERR_FILE_NOT_FOUND` for that intentionally revoked `blob:` URL. These were
+  not console exceptions or page errors. The hard-offline trusted-tap check,
+  which does not immediately navigate away, played without a toast. No audio
+  architecture code was changed.
+- Headless Chrome blocks the select drill's direct-load autoplay because there
+  is no trusted user gesture. The offline audio assertion therefore disabled
+  Pronounce Each, waited for the policy toast to clear, and used a trusted CDP
+  pointer tap. This is a browser-harness limitation, not an offline cache miss;
+  the requested clip and all 75 pack keys were present in IndexedDB.
+- No iOS/WebKit claim is made from the Chrome pass. The final airplane-mode
+  device result remains Nathanael's verification step.
+
+## 7. Out-of-scope confirmation
+
+No chapters 3+, special-book surfaces, data contents, audio manifest, audio
+store/download ownership, service-worker runtime routes, or progress backend
+were changed. No cache/store scan was added to app load or route mount.
+
+## 8. Post-merge patches (5B-MERGE-SPEC)
+
+Five targeted improvements ported from a parallel Opus 4.8 implementation:
+
+1. **Static speller tiles** -- `spellerTilesRef` now resolves via a static
+   `src/data/speller-tiles.json` file and `getSpellerTiles()`, replacing the
+   cross-chunk `loadChapter` dependency resolution. No runtime coupling
+   between chapter lazy chunks.
+2. **Precise self-numbering** -- The `authored-labels` heuristic now uses a
+   `/^\(?\d+[.)]/` regex so only numeric markers suppress `<ol>` auto-
+   numbering. Chapter-1's named labels ("Final Sigma") are unaffected.
+3. **String-reconstruction answer check** -- PlaceAccent's `check()` now
+   reconstructs the full accented string and NFC-compares to `answerForm`
+   instead of comparing type + position separately.
+4. **LEMMA_BUCKETS abstraction** -- `getLemma` delegates to a shared
+   `lemmaFromLexicon()` helper with a `LEMMA_BUCKETS` array, making future
+   bucket additions a one-line change.
+5. **Auto-advance on correct** -- PlaceAccent and Divide auto-advance to the
+   next item ~900ms after a correct answer, matching the original's behavior.
+
+No existing generated chapter or lexicon data files, build guard, emoji
+cleanup, touch-action extensions, or `AGENTS.md` were changed by these patches.
+Patch 1 adds only the specified static keyboard-contract JSON copied exactly
+from chapter 1.
+
+### Post-merge acceptance
+
+- `npm run verify`: PASS. Production build hash `index-CUudhiYd.js`; lazy
+  chunks `chapt-01-8ZoFoXk9.js` and `chapt-02-Bj1cYXtT.js` remain separate,
+  emitted, precached, and absent from the main bundle.
+- Fresh-profile direct load of `#/activity/chapt_2/c2_ex_speller`: PASS. It
+  rendered 39 tiles, requested `chapt-02.json`, `lexicon-chapt02.json`, and the
+  static tile contract, with zero chapter-1 content or lexicon requests.
+- Numbering DOM checks: PASS. Chapter 1's "Final Sigma" and "Nasal Gamma"
+  retain `rc-lead` plus decimal `<ol>` markers; chapter 2's authored `1)` / `2)`
+  / `3)` labels use `rc-num` with browser markers suppressed.
+- PlaceAccent reconstruction: PASS. The intentional wrong type was rejected,
+  the first word's correct Acute placement was accepted, and auto-advance
+  fired in 913ms.
+- Divide auto-advance: PASS against a focused three-item component fixture;
+  auto-advance fired in 913ms. Immediate manual Next canceled the pending
+  timer in both PlaceAccent and Divide, with no extra item skipped.
+- Full 320px browser rails: PASS. Chapter 2 reached 20 of 20 and its end dialog;
+  Chapter 1 reached 26 of 26 and its end dialog. Zero console exceptions or
+  page errors.
diff --git a/src/components/DivideActivity.svelte b/src/components/DivideActivity.svelte
new file mode 100644
index 0000000000000000000000000000000000000000..9c30576bfadf2bda751503319aa57bfdfad23e6d
--- /dev/null
+++ b/src/components/DivideActivity.svelte
@@ -0,0 +1,151 @@
+<script>
+  import { onDestroy } from 'svelte';
+  import { play } from '../lib/audio.js';
+  import { randomFeedback } from '../lib/content.js';
+  import { dividedForm, splitGraphemes } from '../lib/greek.js';
+  import { markCompleted } from '../lib/progress.js';
+  import RichContent from './RichContent.svelte';
+
+  export let chapter;
+  export let activity;
+
+  const items = activity.items || [];
+  let itemIndex = 0;
+  let selected = new Set();
+  let attempts = 0;
+  let correct = 0;
+  let feedback = '';
+  let feedbackKind = '';
+  let answered = false;
+  let showAnswer = false;
+  let showHint = false;
+  let showScore = false;
+  let pronounceEach = false;
+  let advanceTimer = null;
+  const completedItems = new Set();
+
+  $: item = items[itemIndex] || null;
+  $: letters = splitGraphemes(item && item.greek);
+  $: pending = !item || !item.greek || !Array.isArray(item.division);
+  $: hintBlocks = resolveHintBlocks(chapter, activity.hint);
+
+  function resolveHintBlocks(ch, hint) {
+    if (!hint) return [];
+    if (Array.isArray(hint.content)) return hint.content;
+    if (!hint.contentRef) return [];
+    const toRef = text => (text || '').replace(/[^A-Za-z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^[A-Z]/, c => c.toLowerCase());
+    for (const section of ['learn', 'drill', 'exercise', 'quickReview']) {
+      for (const candidate of ch[section] || []) {
+        const blocks = candidate.content || [];
+        if (blocks.some(block => block.type === 'heading' && toRef(block.text) === hint.contentRef)) return blocks;
+      }
+    }
+    return [];
+  }
+
+  function toggleGap(gap) {
+    const next = new Set(selected);
+    if (next.has(gap)) next.delete(gap);
+    else next.add(gap);
+    selected = next;
+    feedback = '';
+  }
+
+  function sameGaps(answer) {
+    if (selected.size !== answer.length) return false;
+    return answer.every(gap => selected.has(gap));
+  }
+
+  function check() {
+    if (pending || answered) return;
+    attempts += 1;
+    if (sameGaps(item.division)) {
+      correct += 1;
+      completedItems.add(itemIndex);
+      feedback = randomFeedback(chapter, 'correct');
+      feedbackKind = 'ok';
+      answered = true;
+      if (completedItems.size === items.length) markCompleted(activity.id);
+      clearTimeout(advanceTimer);
+      advanceTimer = setTimeout(() => move(1), 900);
+    } else {
+      feedback = randomFeedback(chapter, 'incorrect');
+      feedbackKind = 'bad';
+    }
+  }
+
+  function resetItem() {
+    selected = new Set();
+    feedback = '';
+    feedbackKind = '';
+    answered = false;
+    showAnswer = false;
+  }
+
+  function move(delta) {
+    clearTimeout(advanceTimer);
+    const nextIndex = Math.max(0, Math.min(items.length - 1, itemIndex + delta));
+    if (nextIndex === itemIndex) return;
+    itemIndex = nextIndex;
+    resetItem();
+    const nextItem = items[itemIndex];
+    if (pronounceEach && nextItem && nextItem.audio) play(nextItem.audio);
+  }
+
+  function scoreText() {
+    if (!attempts) return chapter.feedback?.scorePrompt || 'Give it a try first';
+    return `${correct} correct out of ${attempts} attempts (${Math.round((correct / attempts) * 100)}%)`;
+  }
+
+  onDestroy(() => clearTimeout(advanceTimer));
+</script>
+
+<div class="card divide-activity">
+  {#if pending}
+    <div class="pending-verification" role="status">Syllable-division word {itemIndex + 1} is pending content verification.</div>
+  {:else}
+    <div class="divide-word" style={`--divide-size:${Math.max(13, Math.min(32, 240 / Math.max(letters.length + (letters.length - 1) * 0.55, 1)))}px`} aria-label="Choose syllable division gaps">
+      {#each letters as letter, index}
+        {#if item.audio}
+          <button class="divide-letter greek greek-say" aria-label="Pronounce word" on:click={() => play(item.audio)}>{letter}</button>
+        {:else}
+          <span class="divide-letter greek">{letter}</span>
+        {/if}
+        {#if index < letters.length - 1}
+          <button class="divide-gap" class:selected={selected.has(index + 1)} aria-pressed={selected.has(index + 1)} on:click={() => toggleGap(index + 1)}>
+            <span>{index + 1}</span>
+          </button>
+        {/if}
+      {/each}
+    </div>
+    <div class="feedback {feedbackKind}">{feedback}</div>
+    {#if showAnswer}
+      <div class="exercise-answer"><span>Answer</span><span class="greek">{dividedForm(item.greek, item.division)}</span></div>
+    {/if}
+  {/if}
+
+  <div class="controls">
+    <button class="btn" disabled={!item?.audio} on:click={() => item?.audio && play(item.audio)}>Pronounce</button>
+    <button class="btn secondary" disabled={itemIndex <= 0} on:click={() => move(-1)}>Previous</button>
+    <button class="btn secondary" on:click={() => (showScore = !showScore)}>Score</button>
+    <button class="btn secondary" disabled={itemIndex >= items.length - 1} on:click={() => move(1)}>Next</button>
+    <button class="btn" disabled={pending || answered || !selected.size} on:click={check}>Check Answer</button>
+    <button class="btn secondary" on:click={() => (showHint = !showHint)}>{activity.hint?.label || 'Hint'}</button>
+  </div>
+  <div class="exercise-checks">
+    <label><input type="checkbox" bind:checked={showAnswer} disabled={pending} /> Show Answer</label>
+    <label><input type="checkbox" bind:checked={pronounceEach} disabled={!item?.audio} /> Pronounce Each Exercise</label>
+  </div>
+  <div class="scorebox exercise-count">{itemIndex + 1} of {items.length}</div>
+  {#if showScore}<div class="scorebox">{scoreText()}</div>{/if}
+</div>
+
+{#if showHint}
+  <div class="card">
+    {#if hintBlocks.length}
+      <RichContent blocks={hintBlocks} />
+    {:else}
+      <div class="pending-verification">Hint content pending verification.</div>
+    {/if}
+  </div>
+{/if}
diff --git a/src/components/PlaceAccentActivity.svelte b/src/components/PlaceAccentActivity.svelte
new file mode 100644
index 0000000000000000000000000000000000000000..eb4a3ec1b8f48407180485b369674cdfc857636b
--- /dev/null
+++ b/src/components/PlaceAccentActivity.svelte
@@ -0,0 +1,118 @@
+<script>
+  import { onDestroy } from 'svelte';
+  import { play } from '../lib/audio.js';
+  import { getLemma, randomFeedback } from '../lib/content.js';
+  import { analyzeAccent, splitGraphemes } from '../lib/greek.js';
+  import { markCompleted } from '../lib/progress.js';
+
+  export let chapter;
+  export let activity;
+
+  const words = (activity.items || []).map(item => {
+    const lemma = getLemma(item.ref, chapter.id, item.pool) || {};
+    return { ...item, audio: item.audio || lemma.audio || null };
+  });
+  let wordIndex = 0;
+  let accentType = null;
+  let accentPosition = null;
+  let attempts = 0;
+  let correct = 0;
+  let feedback = '';
+  let feedbackKind = '';
+  let answered = false;
+  let showAnswer = false;
+  let showScore = false;
+  let pronounceEach = false;
+  let advanceTimer = null;
+  const completedWords = new Set();
+
+  $: word = words[wordIndex] || null;
+  $: answer = analyzeAccent(word && word.answerForm);
+  $: pending = !word || !word.answerForm || !answer.type || answer.position < 0;
+
+  function resetWord() {
+    accentType = null;
+    accentPosition = null;
+    feedback = '';
+    feedbackKind = '';
+    answered = false;
+    showAnswer = false;
+  }
+
+  function move(delta) {
+    clearTimeout(advanceTimer);
+    const nextIndex = Math.max(0, Math.min(words.length - 1, wordIndex + delta));
+    if (nextIndex === wordIndex) return;
+    wordIndex = nextIndex;
+    resetWord();
+    const nextWord = words[wordIndex];
+    if (pronounceEach && nextWord && nextWord.audio) play(nextWord.audio);
+  }
+
+  function check() {
+    if (pending || answered || accentType == null || accentPosition == null) return;
+    const ACCENTS = { Acute: '\u0301', Grave: '\u0300', Circumflex: '\u0342' };
+    const clusters = splitGraphemes(answer.display);
+    clusters[accentPosition] = (clusters[accentPosition] + ACCENTS[accentType]).normalize('NFC');
+    const candidate = clusters.join('').normalize('NFC');
+    const ok = candidate === word.answerForm.normalize('NFC');
+    attempts += 1;
+    if (ok) {
+      correct += 1;
+      completedWords.add(wordIndex);
+      feedback = randomFeedback(chapter, 'correct');
+      feedbackKind = 'ok';
+      answered = true;
+      if (completedWords.size === words.length) markCompleted(activity.id);
+      clearTimeout(advanceTimer);
+      advanceTimer = setTimeout(() => move(1), 900);
+    } else {
+      feedback = randomFeedback(chapter, 'incorrect');
+      feedbackKind = 'bad';
+    }
+  }
+
+  function scoreText() {
+    if (!attempts) return chapter.feedback?.scorePrompt || 'Give it a try first';
+    return `${correct} correct out of ${attempts} attempts (${Math.round((correct / attempts) * 100)}%)`;
+  }
+
+  onDestroy(() => clearTimeout(advanceTimer));
+</script>
+
+<div class="card accent-activity">
+  {#if pending}
+    <div class="pending-verification" role="status">Accent-placement word {wordIndex + 1} is pending content verification.</div>
+  {:else}
+    <div class="accent-types" aria-label="Choose accent type">
+      {#each activity.accentTypes || [] as type}
+        <button class="chip" class:active={accentType === type} aria-pressed={accentType === type} on:click={() => { accentType = type; feedback = ''; }}>{type}</button>
+      {/each}
+    </div>
+    <div class="accent-slots" aria-label="Choose accent position">
+      {#each answer.displayClusters as letter, index}
+        <button class="accent-slot greek" class:selected={accentPosition === index} aria-pressed={accentPosition === index} on:click={() => { accentPosition = index; feedback = ''; }}>
+          <span>{letter}</span><small>{index + 1}</small>
+        </button>
+      {/each}
+    </div>
+    <div class="feedback {feedbackKind}">{feedback}</div>
+    {#if showAnswer}
+      <div class="exercise-answer"><span>Answer</span><span class="greek">{word.answerForm}</span></div>
+    {/if}
+  {/if}
+
+  <div class="controls">
+    <button class="btn" disabled={!word?.audio} on:click={() => word?.audio && play(word.audio)}>Pronounce</button>
+    <button class="btn secondary" disabled={wordIndex <= 0} on:click={() => move(-1)}>Previous</button>
+    <button class="btn secondary" on:click={() => (showScore = !showScore)}>Score</button>
+    <button class="btn secondary" disabled={wordIndex >= words.length - 1} on:click={() => move(1)}>Next</button>
+    <button class="btn" disabled={pending || answered || accentType == null || accentPosition == null} on:click={check}>Check Answer</button>
+  </div>
+  <div class="exercise-checks">
+    <label><input type="checkbox" bind:checked={showAnswer} disabled={pending} /> Show Answer</label>
+    <label><input type="checkbox" bind:checked={pronounceEach} disabled={!word?.audio} /> Pronounce Each Exercise</label>
+  </div>
+  <div class="scorebox exercise-count">{wordIndex + 1} of {words.length}</div>
+  {#if showScore}<div class="scorebox">{scoreText()}</div>{/if}
+</div>
diff --git a/src/data/speller-tiles.json b/src/data/speller-tiles.json
new file mode 100644
index 0000000000000000000000000000000000000000..3c86fa77d03f7d887996a7a776d9ec9df9db312a
--- /dev/null
+++ b/src/data/speller-tiles.json
@@ -0,0 +1,92 @@
+{
+  "letters": [
+    "α",
+    "β",
+    "γ",
+    "δ",
+    "ε",
+    "ζ",
+    "η",
+    "θ",
+    "ι",
+    "κ",
+    "λ",
+    "μ",
+    "ν",
+    "ξ",
+    "ο",
+    "π",
+    "ρ",
+    "σ",
+    "τ",
+    "υ",
+    "φ",
+    "χ",
+    "ψ",
+    "ω",
+    "ς"
+  ],
+  "diacritics": [
+    {
+      "name": "acute",
+      "label": "´",
+      "apply": "́"
+    },
+    {
+      "name": "grave",
+      "label": "`",
+      "apply": "̀"
+    },
+    {
+      "name": "circumflex",
+      "label": "῀",
+      "apply": "͂"
+    },
+    {
+      "name": "rough breathing",
+      "label": "῾",
+      "apply": "̔"
+    },
+    {
+      "name": "smooth breathing",
+      "label": "᾿",
+      "apply": "̓"
+    },
+    {
+      "name": "smooth + acute",
+      "label": "῎",
+      "apply": "̓́"
+    },
+    {
+      "name": "rough + acute",
+      "label": "῞",
+      "apply": "̔́"
+    },
+    {
+      "name": "smooth + grave",
+      "label": "῍",
+      "apply": "̓̀"
+    },
+    {
+      "name": "rough + grave",
+      "label": "῝",
+      "apply": "̔̀"
+    },
+    {
+      "name": "smooth + circumflex",
+      "label": "῏",
+      "apply": "̓͂"
+    },
+    {
+      "name": "rough + circumflex",
+      "label": "῟",
+      "apply": "̔͂"
+    }
+  ],
+  "composites": [
+    "ᾳ",
+    "ῃ",
+    "ῳ"
+  ],
+  "_source": "C1 finalized from speller close-up photo (2026-07-17): tile rows are the 24 lowercase letters, then final sigma + 3 single accents + 2 breathings + 1 combo, then 5 more breathing+accent combos + the 3 iota-subscript composites. Inventory = 25 letters + 11 marks + 3 composites (39 tiles). All six breathing+accent combinations exist (incl. rough+grave and smooth+grave). On-screen arrangement is the app's own; this inventory is the contract. Diacritic 'apply' = combining sequence appended to the previous character, then NFC-normalize."
+}
diff --git a/src/lib/greek.js b/src/lib/greek.js
new file mode 100644
index 0000000000000000000000000000000000000000..1b5dcddf007d7764594faca46b7b76bfd1a278f2
--- /dev/null
+++ b/src/lib/greek.js
@@ -0,0 +1,50 @@
+// Unicode helpers shared by the chapter-2 syllable and accent activities.
+// Work in NFD only while inspecting marks, then return NFC for display.
+
+const ACCENT_MARKS = {
+  '\u0301': 'Acute',
+  '\u0300': 'Grave',
+  '\u0342': 'Circumflex'
+};
+
+export function splitGraphemes(text) {
+  if (!text) return [];
+  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
+    return [...new Intl.Segmenter('el', { granularity: 'grapheme' }).segment(text)].map(part => part.segment);
+  }
+  const clusters = [];
+  for (const char of Array.from(text.normalize('NFD'))) {
+    if (/\p{M}/u.test(char) && clusters.length) clusters[clusters.length - 1] += char;
+    else clusters.push(char);
+  }
+  return clusters.map(cluster => cluster.normalize('NFC'));
+}
+
+export function analyzeAccent(answerForm) {
+  const source = splitGraphemes(answerForm);
+  let type = null;
+  let position = -1;
+  const displayClusters = source.map((cluster, index) => {
+    let stripped = '';
+    for (const char of Array.from(cluster.normalize('NFD'))) {
+      if (ACCENT_MARKS[char]) {
+        if (type == null) {
+          type = ACCENT_MARKS[char];
+          position = index;
+        }
+      } else {
+        stripped += char;
+      }
+    }
+    return stripped.normalize('NFC');
+  });
+  return { type, position, displayClusters, display: displayClusters.join('') };
+}
+
+export function dividedForm(greek, division) {
+  const gaps = new Set(division || []);
+  const clusters = splitGraphemes(greek);
+  return clusters.map((cluster, index) =>
+    index < clusters.length - 1 && gaps.has(index + 1) ? `${cluster} · ` : cluster
+  ).join('');
+}
```

## Binary screenshot patch metadata

```diff
diff --git a/buildout/screenshots/5B/topic-accents.png b/buildout/screenshots/5B/topic-accents.png
new file mode 100644
index 0000000000000000000000000000000000000000..0b09d8b67d0abcf4f461a22e96c64715fec61735
Binary files /dev/null and b/buildout/screenshots/5B/topic-accents.png differ
diff --git a/buildout/screenshots/5B/topic-grammar-review.png b/buildout/screenshots/5B/topic-grammar-review.png
new file mode 100644
index 0000000000000000000000000000000000000000..d15316901a0d3a02cb746cc09d678039beb16299
Binary files /dev/null and b/buildout/screenshots/5B/topic-grammar-review.png differ
diff --git a/buildout/screenshots/5B/topic-marks.png b/buildout/screenshots/5B/topic-marks.png
new file mode 100644
index 0000000000000000000000000000000000000000..25700bd6297cc9868963183a637e09db3d26992f
Binary files /dev/null and b/buildout/screenshots/5B/topic-marks.png differ
diff --git a/buildout/screenshots/5B/topic-syllables.png b/buildout/screenshots/5B/topic-syllables.png
new file mode 100644
index 0000000000000000000000000000000000000000..07c72bf90b888edf20ee4f4fa48729297df8198c
Binary files /dev/null and b/buildout/screenshots/5B/topic-syllables.png differ
```

## Binary screenshot SHA-256 checksums

```text
7b9cd2ff17495b2dace8ea7a274027b3791bec12286a49983c9a3fd2e730c29f  buildout/screenshots/5B/topic-accents.png
3331641ca5614da6eb24249f6af8c060eaf3a1a403300a1ef75dd1c80cfee188  buildout/screenshots/5B/topic-grammar-review.png
350dd6de132022216143765646ed2bc7ddd0b17a6c49c8fae3bef2e637b2fb57  buildout/screenshots/5B/topic-marks.png
c58951593ca2d434401f5a81ee2c5c80851406f265623be08e1d1e0020149f55  buildout/screenshots/5B/topic-syllables.png
```

