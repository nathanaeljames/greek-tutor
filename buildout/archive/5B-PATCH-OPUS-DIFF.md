# 5B-PATCH-OPUS-DIFF.md — working-tree diff for the chapter 2 data patch

Snapshot date: 2026-07-24
Base commit: `3186ac8e98e0ac62e091fdbeeac0382c751e2092`

This records the component patch produced for `5B-PATCH-SPEC.md` (the chapter 2
data patch and answer-flow alignment), against the base commit above. The three
replacement DATA files (`chapt-02.json`, `lexicon-chapt02.json`,
`font-map.json`) are already IN that base commit and were not edited, so they do
not appear here.

Scope of this record: every change under `src/` from this round -- tracked
modifications plus the two new source files, rendered as add-patches. The
handoff prose (§9 of `HANDOFF-5B-OPUS.md`) and the PNG screenshots are listed
but not embedded; screenshots are represented by SHA-256 checksums. This record
excludes itself.

## Working-tree status at capture

```text
D buildout/HANDOFF-5B-SOL.md
 M src/app.css
 M src/components/ActivityHost.svelte
 M src/components/ContentAudio.svelte
 M src/components/DivideActivity.svelte
 M src/components/PlaceAccentActivity.svelte
 M src/components/RichContent.svelte
 M src/components/SelectActivity.svelte
 M src/lib/content.js
 M src/lib/greek.js
?? buildout/HANDOFF-5B-OPUS.md
?? buildout/screenshots/5B-patch/
?? src/components/Marked.svelte
?? src/lib/markup.js
```

`buildout/HANDOFF-5B-SOL.md` shows as deleted and `buildout/HANDOFF-5B-OPUS.md`
as untracked because the handoff file was renamed outside this round; §9 of the
new file is this round's handoff.

## Diffstat (src only)

```text
src/app.css                               | 54 +++++++++++++++++-
 src/components/ActivityHost.svelte        |  3 +-
 src/components/ContentAudio.svelte        |  3 +
 src/components/DivideActivity.svelte      | 67 +++++++++++++++++-----
 src/components/PlaceAccentActivity.svelte | 76 ++++++++++++++++++-------
 src/components/RichContent.svelte         | 49 +++++++++-------
 src/components/SelectActivity.svelte      | 94 ++++++++++++++++++++++++++-----
 src/lib/content.js                        | 22 ++++++--
 src/lib/greek.js                          | 18 +++++-
 9 files changed, 313 insertions(+), 73 deletions(-)
```

## Text patch

```diff
diff --git a/src/app.css b/src/app.css
index 04aeabd..64a9c94 100644
--- a/src/app.css
+++ b/src/app.css
@@ -47,14 +47,31 @@ button { font: inherit; cursor: pointer; }
 .grid.letters { grid-template-columns: repeat(6, 1fr); }
 .grid.options { grid-template-columns: repeat(2, 1fr); }
 .grid.options.wide { grid-template-columns: repeat(4, 1fr); }
+.grid.options.single { grid-template-columns: 1fr; }
 .tile { background: var(--card); border: 2px solid transparent; border-radius: 10px;
   padding: 10px 4px; font-size: 1.35rem; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
 .tile.small { font-size: 0.95rem; padding: 10px 6px; }
 .tile:active { border-color: var(--teal); }
 .tile.correct { border-color: var(--ok); background: #e6f2e6; }
 .tile.incorrect { border-color: var(--bad); background: #f7e5e1; }
+/* 5B patch 2b: on the chapter-2 static-option drills a SELECTION reads blue
+   and the confirmed answer reads green; red is reserved for the feedback
+   banner. .tile.incorrect stays for chapter 1's retry drills. */
+.tile.selected { border-color: var(--link); background: #e8f0fb; }
+.tile.selected.correct { border-color: var(--ok); background: #e6f2e6; }
 .prompt { font-size: 3rem; text-align: center; padding: 18px; }
 .prompt.select-sentence { font-size: 1.25rem; line-height: 1.5; }
+/* 2e: Marking Recognition asks about ONE mark, drawn red inside the word.
+   The word itself stays a blue greek-say tap (directive 9); the marked
+   grapheme cluster's own color rule beats the inherited link blue. */
+.prompt.red-mark { font-size: 2.5rem; }
+.mark-red { color: var(--accent); }
+/* Revealed after a one-attempt item is finalized: the gloss and, for the
+   Accent Rule drill, the properly accented form. */
+.reveal-row { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: center;
+  gap: 14px; margin: 2px 0 6px; }
+.reveal-gloss { color: var(--teal-dark); font-size: 1rem; }
+.reveal-form { font-size: 1.6rem; color: var(--ok); }
 .feedback { text-align: center; min-height: 1.5em; font-weight: 600; margin: 8px 0; }
 .feedback.ok { color: var(--ok); }
 .feedback.bad { color: var(--bad); }
@@ -194,12 +211,23 @@ button { font: inherit; cursor: pointer; }
   gap: 8px; width: 100%; align-items: center; }
 .rc-greekhead { padding: 7px 6px; border-bottom: 2px solid rgba(0,0,0,0.1); color: var(--teal-dark);
   font-size: 0.78rem; font-weight: 700; text-align: center; text-transform: uppercase; }
+/* Long headers ("Antepenult Possibilities") must wrap inside their column;
+   without this they overlap the neighboring cell instead of clipping, which
+   overflow checks never catch. break-word keeps whole words together where a
+   column can hold them and only splits a word that cannot fit at all. */
+.rc-greekhead > span { min-width: 0; overflow-wrap: break-word; line-height: 1.25; }
+.syllable-matrix .rc-greekhead { font-size: 0.68rem; letter-spacing: -0.01em; }
 .rc-syllable-row { border: none; border-bottom: 1px solid rgba(0,0,0,0.06); background: transparent;
   padding: 10px 6px; font-size: 1.35rem; text-align: center; }
 .rc-syllable-row.greek-say { color: var(--link); }
 .rc-greekrow { display: grid; grid-template-columns: repeat(var(--greek-cols), minmax(0, 1fr)); gap: 10px;
   align-items: baseline; border-bottom: 1px solid rgba(0,0,0,0.06); padding: 9px 6px; min-width: 0; }
 .rc-greeklabel { font-weight: 600; overflow-wrap: anywhere; }
+/* Accent Possibilities chart: each row is legended in a trailing unheaded
+   column ("Short Ultima" / "Long Ultima") -- English, so it opts out of the
+   row's Greek font. */
+.rc-rowlabel { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
+  font-size: 0.8rem; font-weight: 700; color: var(--teal-dark); overflow-wrap: anywhere; }
 .rc-greekword { min-width: 0; font-size: 1.3rem; }
 .rc-greekword.greek-say { width: auto; color: var(--link); }
 .rc-greekgloss { color: var(--teal-dark); overflow-wrap: anywhere; }
@@ -266,6 +294,7 @@ button { font: inherit; cursor: pointer; }
 .rv-greek { font-size: 1.5rem; }
 .rv-gloss { font-size: 1rem; }
 .rv-freq { color: #8a8472; font-size: 0.9rem; }
+.rv-footnote { font-size: 0.85rem; color: #5a5a52; line-height: 1.45; margin-top: 10px; }
 
 /* ---- Review Letters Quick Chart (4-col matrix, A18: Pronounce col dropped) ---- */
 .letters-matrix { display: flex; flex-direction: column; }
@@ -341,6 +370,14 @@ button { font: inherit; cursor: pointer; }
   align-self: stretch; border: none; border-bottom: 2px solid #b9af91; background: transparent; color: var(--link);
   padding: 0; font-size: 0.65rem; font-weight: 700; }
 .divide-gap.selected { border-color: var(--link); background: #e8f0fb; }
+.divide-gap.correct { border-color: var(--ok); background: #e6f2e6; color: var(--ok); }
+.divide-gap.locked { opacity: 0.35; }
+/* 2c: the original's full-width "only one syllable" bar under the word. */
+.one-syllable-bar { display: block; width: 100%; margin: 4px 0 2px; padding: 11px 10px;
+  border: 2px solid #d8d0b8; border-radius: 10px; background: white; color: var(--ink);
+  font-size: 0.9rem; font-weight: 600; text-align: center; }
+.one-syllable-bar.selected { border-color: var(--link); background: #e8f0fb; color: var(--link); }
+.one-syllable-bar.correct { border-color: var(--ok); background: #e6f2e6; color: var(--ok); }
 .accent-types { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-bottom: 14px; }
 .accent-slots { display: flex; justify-content: center; width: 100%; min-width: 0; }
 .accent-slot { flex: 1 1 0; min-width: 0; max-width: 48px; display: flex; flex-direction: column; align-items: center;
@@ -349,6 +386,20 @@ button { font: inherit; cursor: pointer; }
 .accent-slot span { font-size: 1.5rem; }
 .accent-slot small { color: #776f5d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 0.65rem; }
 .accent-slot.selected { border-color: var(--link); background: #e8f0fb; box-shadow: inset 0 0 0 1px var(--link); }
+.accent-slot.correct { border-color: var(--ok); background: #e6f2e6; box-shadow: inset 0 0 0 1px var(--ok); color: var(--ok); }
+/* Accent-type buttons follow the same selection semantics as the slots, so
+   they use the blue/green pair rather than the teal .chip.active state. */
+.accent-types .chip.selected { border-color: var(--link); background: #e8f0fb; color: var(--link); }
+.accent-types .chip.correct { border-color: var(--ok); background: #e6f2e6; color: var(--ok); }
+/* 2d: root word + gloss header above the position row. */
+.accent-root { background: white; border-radius: 8px; padding: 8px 12px; margin-bottom: 14px; }
+.accent-root .label { font-size: 0.75rem; color: var(--teal-dark); font-weight: 700; text-transform: uppercase; }
+.accent-root-line { display: flex; flex-wrap: wrap; align-items: baseline; gap: 10px; }
+.accent-root-word { background: transparent; border: none; padding: 0; font-size: 1.7rem;
+  color: var(--link); text-align: left; }
+.accent-root-word:active { opacity: 0.6; }
+.accent-root-gloss { color: var(--teal-dark); font-size: 0.95rem; }
+.exercise-ref { color: var(--teal-dark); font-size: 0.85rem; font-weight: 700; }
 
 /* ---- Reading People, Places and Letters ---- */
 .cat-buttons { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 12px; }
@@ -399,7 +450,8 @@ button, a, input, select, textarea, label,
 .tile, .tk-key, .chip, .act-row, .menu-item, .eq-cell, .diph-tile, .diph-ex,
 .rv-greek, .lm-row, .rc-defrow, .rc-example, .greek-chip, .greek-tap,
 .seg, .flash-hidden, .icon-btn, .bb-item, .section-head, .collapse-head,
-.rc-expander summary, .divide-letter, .divide-gap, .accent-slot {
+.rc-expander summary, .divide-letter, .divide-gap, .accent-slot,
+.one-syllable-bar, .accent-root-word {
   touch-action: manipulation;
 }
 
diff --git a/src/components/ActivityHost.svelte b/src/components/ActivityHost.svelte
index 5b5caf7..a15fd0a 100644
--- a/src/components/ActivityHost.svelte
+++ b/src/components/ActivityHost.svelte
@@ -3,6 +3,7 @@
   // Records progress on mount: contentAudio pages count completed on visit;
   // scored activities complete on finish (handled inside their components).
   import { getChapter, getActivity } from '../lib/content.js';
+  import { stripMarkup } from '../lib/markup.js';
   import { markVisited, markCompleted } from '../lib/progress.js';
   import ContentAudio from './ContentAudio.svelte';
   import SelectActivity from './SelectActivity.svelte';
@@ -38,7 +39,7 @@
 
 {#if chapter && activity}
   {#if activity.instructions && !activity.instructions.startsWith('_verify')}
-    <div class="instructions">{activity.instructions}</div>
+    <div class="instructions">{stripMarkup(activity.instructions)}</div>
   {/if}
   <!-- Consecutive routes often render the SAME component type; Svelte would
        reuse the instance and its per-activity state (question list, counters,
diff --git a/src/components/ContentAudio.svelte b/src/components/ContentAudio.svelte
index 11e2ef8..24c7554 100644
--- a/src/components/ContentAudio.svelte
+++ b/src/components/ContentAudio.svelte
@@ -348,6 +348,9 @@
         </div>
       {/each}
     </div>
+    <!-- The original prints the ntFreq legend under the chart, not as a note
+         banner: it explains the numbers already on screen. -->
+    {#if activity.footnote}<div class="rv-footnote">{activity.footnote}</div>{/if}
     <div class="controls">
       {#if activity.playAll || activity.sayWholeListAudio}
         <button class="btn secondary" on:click={() => play(activity.playAll?.audio || activity.sayWholeListAudio)}>{activity.playAll?.label || 'Say Whole List'}</button>
diff --git a/src/components/DivideActivity.svelte b/src/components/DivideActivity.svelte
index 9c30576..4ef57f9 100644
--- a/src/components/DivideActivity.svelte
+++ b/src/components/DivideActivity.svelte
@@ -1,4 +1,11 @@
 <script>
+  // Syllable Division Exercise: tap the numbered gaps between letters where
+  // the word breaks into syllables, then Check Answer.
+  //
+  // ANSWER POLICY (5B patch 2a): answerPolicy.attemptsPerItem === 1 means
+  // Check Answer finalizes the item right or wrong, reveals the hyphen-joined
+  // divided form, and auto-advances after autoAdvanceMs. The timer is cancelled
+  // on manual Previous/Next and on unmount. Completion = all items ATTEMPTED.
   import { onDestroy } from 'svelte';
   import { play } from '../lib/audio.js';
   import { randomFeedback } from '../lib/content.js';
@@ -12,6 +19,7 @@
   const items = activity.items || [];
   let itemIndex = 0;
   let selected = new Set();
+  let oneSyllable = false;
   let attempts = 0;
   let correct = 0;
   let feedback = '';
@@ -22,12 +30,15 @@
   let showScore = false;
   let pronounceEach = false;
   let advanceTimer = null;
-  const completedItems = new Set();
+  const attemptedItems = new Set();
 
   $: item = items[itemIndex] || null;
   $: letters = splitGraphemes(item && item.greek);
   $: pending = !item || !item.greek || !Array.isArray(item.division);
   $: hintBlocks = resolveHintBlocks(chapter, activity.hint);
+  $: oneAttempt = activity.answerPolicy?.attemptsPerItem === 1;
+  $: autoAdvanceMs = activity.answerPolicy?.autoAdvanceMs ?? 900;
+  $: revealed = answered && oneAttempt;
 
   function resolveHintBlocks(ch, hint) {
     if (!hint) return [];
@@ -44,6 +55,8 @@
   }
 
   function toggleGap(gap) {
+    if (answered) return;
+    oneSyllable = false;
     const next = new Set(selected);
     if (next.has(gap)) next.delete(gap);
     else next.add(gap);
@@ -51,6 +64,15 @@
     feedback = '';
   }
 
+  // 2c: the one-syllable bar clears and locks the gap selections; the answer
+  // it submits is the empty division (kai is the pool's only one-syllable word).
+  function toggleOneSyllable() {
+    if (answered) return;
+    oneSyllable = !oneSyllable;
+    if (oneSyllable) selected = new Set();
+    feedback = '';
+  }
+
   function sameGaps(answer) {
     if (selected.size !== answer.length) return false;
     return answer.every(gap => selected.has(gap));
@@ -59,23 +81,22 @@
   function check() {
     if (pending || answered) return;
     attempts += 1;
-    if (sameGaps(item.division)) {
-      correct += 1;
-      completedItems.add(itemIndex);
-      feedback = randomFeedback(chapter, 'correct');
-      feedbackKind = 'ok';
+    attemptedItems.add(itemIndex);
+    const right = sameGaps(item.division);
+    if (right) correct += 1;
+    feedback = randomFeedback(chapter, right ? 'correct' : 'incorrect');
+    feedbackKind = right ? 'ok' : 'bad';
+    if (right || oneAttempt) {
       answered = true;
-      if (completedItems.size === items.length) markCompleted(activity.id);
+      if (attemptedItems.size === items.length) markCompleted(activity.id);
       clearTimeout(advanceTimer);
-      advanceTimer = setTimeout(() => move(1), 900);
-    } else {
-      feedback = randomFeedback(chapter, 'incorrect');
-      feedbackKind = 'bad';
+      advanceTimer = setTimeout(() => move(1), autoAdvanceMs);
     }
   }
 
   function resetItem() {
     selected = new Set();
+    oneSyllable = false;
     feedback = '';
     feedbackKind = '';
     answered = false;
@@ -97,6 +118,10 @@
     return `${correct} correct out of ${attempts} attempts (${Math.round((correct / attempts) * 100)}%)`;
   }
 
+  // Answer submitted, so Check Answer is live even with nothing selected once
+  // the one-syllable bar is the answer.
+  $: canCheck = !pending && !answered && (oneSyllable || selected.size > 0);
+
   onDestroy(() => clearTimeout(advanceTimer));
 </script>
 
@@ -112,14 +137,28 @@
           <span class="divide-letter greek">{letter}</span>
         {/if}
         {#if index < letters.length - 1}
-          <button class="divide-gap" class:selected={selected.has(index + 1)} aria-pressed={selected.has(index + 1)} on:click={() => toggleGap(index + 1)}>
+          <button class="divide-gap"
+            class:selected={selected.has(index + 1)}
+            class:correct={revealed && item.division.includes(index + 1)}
+            class:locked={oneSyllable}
+            aria-pressed={selected.has(index + 1)}
+            on:click={() => toggleGap(index + 1)}>
             <span>{index + 1}</span>
           </button>
         {/if}
       {/each}
     </div>
+    {#if activity.oneSyllableButton}
+      <button class="one-syllable-bar"
+        class:selected={oneSyllable}
+        class:correct={revealed && item.division.length === 0}
+        aria-pressed={oneSyllable}
+        on:click={toggleOneSyllable}>
+        {activity.oneSyllableButton}
+      </button>
+    {/if}
     <div class="feedback {feedbackKind}">{feedback}</div>
-    {#if showAnswer}
+    {#if showAnswer || revealed}
       <div class="exercise-answer"><span>Answer</span><span class="greek">{dividedForm(item.greek, item.division)}</span></div>
     {/if}
   {/if}
@@ -129,7 +168,7 @@
     <button class="btn secondary" disabled={itemIndex <= 0} on:click={() => move(-1)}>Previous</button>
     <button class="btn secondary" on:click={() => (showScore = !showScore)}>Score</button>
     <button class="btn secondary" disabled={itemIndex >= items.length - 1} on:click={() => move(1)}>Next</button>
-    <button class="btn" disabled={pending || answered || !selected.size} on:click={check}>Check Answer</button>
+    <button class="btn" disabled={!canCheck} on:click={check}>Check Answer</button>
     <button class="btn secondary" on:click={() => (showHint = !showHint)}>{activity.hint?.label || 'Hint'}</button>
   </div>
   <div class="exercise-checks">
diff --git a/src/components/PlaceAccentActivity.svelte b/src/components/PlaceAccentActivity.svelte
index eb4a3ec..f16fccf 100644
--- a/src/components/PlaceAccentActivity.svelte
+++ b/src/components/PlaceAccentActivity.svelte
@@ -1,17 +1,25 @@
 <script>
+  // Accent Mark Placement Exercise. Each item shows a ROOT word plus its gloss
+  // in the header and one UNACCENTED inflected form (breathings retained) in
+  // the numbered position row; the learner picks an accent type and the letter
+  // it belongs on, then Check Answer. The chapter's own Scripture reference for
+  // the form sits by the checkbox row, as in the original.
+  //
+  // ANSWER POLICY (5B patch 2a): attemptsPerItem === 1 finalizes on Check
+  // Answer either way, reveals answerForm, and auto-advances after
+  // autoAdvanceMs; the timer is cancelled on manual Previous/Next and unmount.
+  // Completion = all items ATTEMPTED.
   import { onDestroy } from 'svelte';
   import { play } from '../lib/audio.js';
-  import { getLemma, randomFeedback } from '../lib/content.js';
+  import { randomFeedback } from '../lib/content.js';
   import { analyzeAccent, splitGraphemes } from '../lib/greek.js';
   import { markCompleted } from '../lib/progress.js';
+  import RichContent from './RichContent.svelte';
 
   export let chapter;
   export let activity;
 
-  const words = (activity.items || []).map(item => {
-    const lemma = getLemma(item.ref, chapter.id, item.pool) || {};
-    return { ...item, audio: item.audio || lemma.audio || null };
-  });
+  const words = activity.items || [];
   let wordIndex = 0;
   let accentType = null;
   let accentPosition = null;
@@ -21,14 +29,19 @@
   let feedbackKind = '';
   let answered = false;
   let showAnswer = false;
+  let showHint = false;
   let showScore = false;
   let pronounceEach = false;
   let advanceTimer = null;
-  const completedWords = new Set();
+  const attemptedWords = new Set();
 
   $: word = words[wordIndex] || null;
   $: answer = analyzeAccent(word && word.answerForm);
   $: pending = !word || !word.answerForm || !answer.type || answer.position < 0;
+  $: hintBlocks = (activity.hint && activity.hint.content) || [];
+  $: oneAttempt = activity.answerPolicy?.attemptsPerItem === 1;
+  $: autoAdvanceMs = activity.answerPolicy?.autoAdvanceMs ?? 900;
+  $: revealed = answered && oneAttempt;
 
   function resetWord() {
     accentType = null;
@@ -57,18 +70,15 @@
     const candidate = clusters.join('').normalize('NFC');
     const ok = candidate === word.answerForm.normalize('NFC');
     attempts += 1;
-    if (ok) {
-      correct += 1;
-      completedWords.add(wordIndex);
-      feedback = randomFeedback(chapter, 'correct');
-      feedbackKind = 'ok';
+    attemptedWords.add(wordIndex);
+    if (ok) correct += 1;
+    feedback = randomFeedback(chapter, ok ? 'correct' : 'incorrect');
+    feedbackKind = ok ? 'ok' : 'bad';
+    if (ok || oneAttempt) {
       answered = true;
-      if (completedWords.size === words.length) markCompleted(activity.id);
+      if (attemptedWords.size === words.length) markCompleted(activity.id);
       clearTimeout(advanceTimer);
-      advanceTimer = setTimeout(() => move(1), 900);
-    } else {
-      feedback = randomFeedback(chapter, 'incorrect');
-      feedbackKind = 'bad';
+      advanceTimer = setTimeout(() => move(1), autoAdvanceMs);
     }
   }
 
@@ -81,23 +91,41 @@
 </script>
 
 <div class="card accent-activity">
+  {#if word && (word.root || word.rootGloss)}
+    <div class="accent-root">
+      <div class="label">{activity.ui?.header || 'Root Greek Word'}</div>
+      <div class="accent-root-line">
+        <button class="accent-root-word greek greek-say" disabled={!word.audio} on:click={() => word.audio && play(word.audio)}>{word.root}</button>
+        {#if word.rootGloss}<span class="accent-root-gloss">({word.rootGloss})</span>{/if}
+      </div>
+    </div>
+  {/if}
+
   {#if pending}
     <div class="pending-verification" role="status">Accent-placement word {wordIndex + 1} is pending content verification.</div>
   {:else}
     <div class="accent-types" aria-label="Choose accent type">
       {#each activity.accentTypes || [] as type}
-        <button class="chip" class:active={accentType === type} aria-pressed={accentType === type} on:click={() => { accentType = type; feedback = ''; }}>{type}</button>
+        <button class="chip"
+          class:selected={accentType === type}
+          class:correct={revealed && answer.type === type}
+          aria-pressed={accentType === type}
+          on:click={() => { if (!answered) { accentType = type; feedback = ''; } }}>{type}</button>
       {/each}
     </div>
     <div class="accent-slots" aria-label="Choose accent position">
       {#each answer.displayClusters as letter, index}
-        <button class="accent-slot greek" class:selected={accentPosition === index} aria-pressed={accentPosition === index} on:click={() => { accentPosition = index; feedback = ''; }}>
+        <button class="accent-slot greek"
+          class:selected={accentPosition === index}
+          class:correct={revealed && answer.position === index}
+          aria-pressed={accentPosition === index}
+          on:click={() => { if (!answered) { accentPosition = index; feedback = ''; } }}>
           <span>{letter}</span><small>{index + 1}</small>
         </button>
       {/each}
     </div>
     <div class="feedback {feedbackKind}">{feedback}</div>
-    {#if showAnswer}
+    {#if showAnswer || revealed}
       <div class="exercise-answer"><span>Answer</span><span class="greek">{word.answerForm}</span></div>
     {/if}
   {/if}
@@ -108,11 +136,21 @@
     <button class="btn secondary" on:click={() => (showScore = !showScore)}>Score</button>
     <button class="btn secondary" disabled={wordIndex >= words.length - 1} on:click={() => move(1)}>Next</button>
     <button class="btn" disabled={pending || answered || accentType == null || accentPosition == null} on:click={check}>Check Answer</button>
+    {#if hintBlocks.length}
+      <button class="btn secondary" on:click={() => (showHint = !showHint)}>{activity.hint?.label || 'Hint'}</button>
+    {/if}
   </div>
   <div class="exercise-checks">
     <label><input type="checkbox" bind:checked={showAnswer} disabled={pending} /> Show Answer</label>
     <label><input type="checkbox" bind:checked={pronounceEach} disabled={!word?.audio} /> Pronounce Each Exercise</label>
+    {#if word?.ref}<span class="exercise-ref">{word.ref}</span>{/if}
   </div>
   <div class="scorebox exercise-count">{wordIndex + 1} of {words.length}</div>
   {#if showScore}<div class="scorebox">{scoreText()}</div>{/if}
 </div>
+
+{#if showHint && hintBlocks.length}
+  <div class="card">
+    <RichContent blocks={hintBlocks} />
+  </div>
+{/if}
diff --git a/src/components/RichContent.svelte b/src/components/RichContent.svelte
index f9d94f3..971a1fc 100644
--- a/src/components/RichContent.svelte
+++ b/src/components/RichContent.svelte
@@ -10,6 +10,7 @@
   // font and play their clip on tap. defList rows [term, value, audio?] play
   // the row's clip when present.
   import { play } from '../lib/audio.js';
+  import Marked from './Marked.svelte';
 
   export let blocks = [];
 
@@ -20,8 +21,13 @@
   // chips (A6, Six Points "Linguistic Pronunciation Descriptions").
   const isLettersList = v => v && typeof v === 'object' && Array.isArray(v.letters);
   const defRows = block => block.rows || (block.items || []).map(item => [item.term, item.def, item.audio]);
+  // A matrix row fills the declared columns with cells instead of the usual
+  // greek-word + gloss pair. Rows may also carry a row LABEL: the Accent
+  // Possibilities chart legends its two rows "Short Ultima" / "Long Ultima"
+  // in a trailing unheaded column.
   const isSyllableMatrix = block => Array.isArray(block.columns)
-    && block.rows.every(row => Array.isArray(row.syllables) && row.syllables.length === block.columns.length && !row.gloss && !row.label);
+    && block.rows.every(row => Array.isArray(row.syllables) && row.syllables.length === block.columns.length && !row.gloss);
+  const hasRowLabels = block => block.rows.some(row => row.label);
 
   // greekTaps: split an item's text on STANDALONE substring matches (first
   // standalone occurrence per key) and render those substrings as tappable
@@ -66,10 +72,10 @@
 <div class="rich">
   {#each blocks as b}
     {#if b.type === 'heading'}
-      <div class="rc-heading">{b.text}</div>
+      <div class="rc-heading"><Marked text={b.text} /></div>
 
     {:else if b.type === 'para'}
-      <p class="rc-para">{b.text}</p>
+      <p class="rc-para"><Marked text={b.text} /></p>
       {#if b.example}
         <button class="rc-example" class:tappable={b.example.audio} on:click={() => playAudio(b.example.audio)}>
           <span class="greek">{b.example.greek}</span>
@@ -78,12 +84,12 @@
       {/if}
 
     {:else if b.type === 'numbered'}
-      {#if b.preamble}<p class="rc-preamble">{b.preamble}</p>{/if}
+      {#if b.preamble}<p class="rc-preamble"><Marked text={b.preamble} /></p>{/if}
       {@const selfNum = (() => { const re = /^\(?\d+[.)]/; return b.items.length > 0 && b.items.every(it => it.label && re.test(it.label)); })()}
       <ol class="rc-list" class:authored-labels={selfNum}>
         {#each b.items as it}
           <li>
-            {#if it.label}{#if selfNum}<span class="rc-num">{it.label}</span>{it.text ? ' ' : ''}{:else}<span class="rc-lead">{it.label}</span>{it.text ? ' — ' : ''}{/if}{/if}{#if it.greekTaps}{#each splitTaps(it.text, it.greekTaps) as seg}{#if seg.audio}<button class="greek-tap greek" on:click={() => playAudio(seg.audio)}>{seg.t}</button>{:else}{seg.t}{/if}{/each}{:else}{it.text || ''}{/if}
+            {#if it.label}{#if selfNum}<span class="rc-num">{it.label}</span>{it.text ? ' ' : ''}{:else}<span class="rc-lead">{it.label}</span>{it.text ? ' — ' : ''}{/if}{/if}{#if it.greekTaps}{#each splitTaps(it.text, it.greekTaps) as seg}{#if seg.audio}<button class="greek-tap greek" on:click={() => playAudio(seg.audio)}>{seg.t}</button>{:else}{seg.t}{/if}{/each}{:else}<Marked text={it.text || ''} />{/if}
             {#if it.example}
               <button class="rc-example" class:tappable={it.example.audio} on:click={() => playAudio(it.example.audio)}>
                 <span class="greek">{it.example.greek}</span>
@@ -104,14 +110,14 @@
                     </div>
                   {:else}
                     <button class="rc-defrow" class:tappable={row[2]} on:click={() => playAudio(row[2])}>
-                      <span class="rc-term greek">{row[0]}</span>
-                      <span class="rc-val greek">{row[1]}</span>
+                      <span class="rc-term greek"><Marked text={row[0]} /></span>
+                      <span class="rc-val greek"><Marked text={row[1]} /></span>
                     </button>
                   {/if}
                 {/each}
               </div>
             {/if}
-            {#if it.note}<div class="rc-inlinenote">{it.note}</div>{/if}
+            {#if it.note}<div class="rc-inlinenote"><Marked text={it.note} /></div>{/if}
           </li>
         {/each}
       </ol>
@@ -130,8 +136,8 @@
             </div>
           {:else}
             <button class="rc-defrow" class:tappable={row[2]} on:click={() => playAudio(row[2])}>
-              <span class="rc-term greek">{row[0]}</span>
-              <span class="rc-val greek">{row[1]}</span>
+              <span class="rc-term greek"><Marked text={row[0]} /></span>
+              <span class="rc-val greek"><Marked text={row[1]} /></span>
             </button>
           {/if}
         {/each}
@@ -139,27 +145,32 @@
 
     {:else if b.type === 'greekRows'}
       {@const syllableMatrix = isSyllableMatrix(b)}
+      {@const rowLabels = syllableMatrix && hasRowLabels(b)}
+      {@const matrixCols = syllableMatrix ? b.columns.length + (rowLabels ? 1 : 0) : 0}
       <div class="rc-greekrows" class:syllable-matrix={syllableMatrix}>
         {#if b.columns}
-          <div class="rc-greekhead" style={`--greek-cols:${b.columns.length}`}>
+          <div class="rc-greekhead" style={`--greek-cols:${syllableMatrix ? matrixCols : b.columns.length}`}>
             {#each b.columns as column}<span>{column}</span>{/each}
+            {#if rowLabels}<span>&nbsp;</span>{/if}
           </div>
         {/if}
         {#each b.rows as row}
           {#if syllableMatrix}
             {#if row.audio}
-              <button class="rc-syllable-row greek greek-say" style={`--greek-cols:${b.columns.length}`} on:click={() => playAudio(row.audio)}>
+              <button class="rc-syllable-row greek greek-say" style={`--greek-cols:${matrixCols}`} on:click={() => playAudio(row.audio)}>
                 {#each row.syllables as syllable}<span>{syllable || '\u00a0'}</span>{/each}
+                {#if rowLabels}<span class="rc-rowlabel">{row.label || '\u00a0'}</span>{/if}
               </button>
             {:else}
-              <div class="rc-syllable-row greek" style={`--greek-cols:${b.columns.length}`}>
+              <div class="rc-syllable-row greek" style={`--greek-cols:${matrixCols}`}>
                 {#each row.syllables as syllable}<span>{syllable || '\u00a0'}</span>{/each}
+                {#if rowLabels}<span class="rc-rowlabel">{row.label || '\u00a0'}</span>{/if}
               </div>
             {/if}
           {:else}
             {@const cellCount = (row.label ? 1 : 0) + (row.greek ? 1 : 0) + (row.gloss != null && row.gloss !== '' ? 1 : 0)}
             <div class="rc-greekrow" style={`--greek-cols:${Math.max(cellCount, 1)}`}>
-              {#if row.label}<span class="rc-greeklabel">{row.label}</span>{/if}
+              {#if row.label}<span class="rc-greeklabel"><Marked text={row.label} /></span>{/if}
               {#if row.greek}
                 {#if row.audio}
                   <button class="rc-greekword greek greek-say" on:click={() => playAudio(row.audio)}>
@@ -175,7 +186,7 @@
                   </span>
                 {/if}
               {/if}
-              {#if row.gloss != null && row.gloss !== ''}<span class="rc-greekgloss">{row.gloss}</span>{/if}
+              {#if row.gloss != null && row.gloss !== ''}<span class="rc-greekgloss"><Marked text={row.gloss} /></span>{/if}
             </div>
           {/if}
         {/each}
@@ -184,7 +195,7 @@
 
     {:else if b.type === 'expander'}
       <details class="rc-expander">
-        <summary>{b.label}</summary>
+        <summary><Marked text={b.label} /></summary>
         <div class="rc-expander-body">
           {#if b.content && b.content.length}
             <svelte:self blocks={b.content} />
@@ -198,15 +209,15 @@
       {#if b.starNote}<div class="rc-starnote">{b.starNote}</div>{/if}
       <div class="rc-biblist">
         {#each b.items as entry}
-          <div class="rc-bibentry">{entry}</div>
+          <div class="rc-bibentry"><Marked text={entry} /></div>
         {/each}
       </div>
 
     {:else if b.type === 'refs'}
-      <div class="rc-refs">{b.text}</div>
+      <div class="rc-refs"><Marked text={b.text} /></div>
 
     {:else if b.type === 'note'}
-      <div class="note">{b.text}</div>
+      <div class="note"><Marked text={b.text} /></div>
     {/if}
   {/each}
 </div>
diff --git a/src/components/SelectActivity.svelte b/src/components/SelectActivity.svelte
index e4b5c92..479d932 100644
--- a/src/components/SelectActivity.svelte
+++ b/src/components/SelectActivity.svelte
@@ -1,9 +1,23 @@
 <script>
   // The scored "workhorse": prompt + full option grid + feedback + score.
-  // Covers letter exercises (24-option generator) and vocab drills (10 lemmas).
+  // Covers letter exercises (24-option generator), vocab drills (10 lemmas)
+  // and chapter 2's four static-option drills.
+  //
+  // ANSWER POLICY (5B patch 2a). activity.answerPolicy decides what a tap on an
+  // option means:
+  //   { attemptsPerItem: 1, autoAdvanceMs: 4000 } — the tap FINALIZES the item
+  //     right or wrong, the answer is revealed, and the drill auto-advances
+  //     after autoAdvanceMs (cancelled on unmount). Completion = every item
+  //     ATTEMPTED, not every item correct.
+  //   { attemptsPerItem: "retry" } / absent — the original retry loop: a wrong
+  //     tap leaves the item open, only a correct tap advances (chapter 1 and
+  //     the Syllable Counting drill).
+  import { onDestroy } from 'svelte';
   import { buildSelectQuestions, randomFeedback } from '../lib/content.js';
+  import { markClusters } from '../lib/greek.js';
   import { play } from '../lib/audio.js';
   import { markCompleted } from '../lib/progress.js';
+  import RichContent from './RichContent.svelte';
   export let chapter;
   export let activity;
 
@@ -20,6 +34,8 @@
   let answered = false;       // current question resolved
   let pronounceEach = true;
   let finished = false;
+  let showHint = false;
+  let advanceTimer = null;
 
   init();
   function init() {
@@ -30,6 +46,7 @@
     optionClass = built.optionClass || '';
     qIndex = 0; attempts = 0; correct = 0;
     feedback = ''; picked = null; answered = false; finished = false;
+    clearTimeout(advanceTimer);
     maybePronounce();
   }
 
@@ -38,6 +55,23 @@
   $: wideOptions = !staticOptions || optionClass === 'wide';
   $: showPronounce = !staticOptions || !!activity.ui?.buttons?.includes('Pronounce');
   $: showPronounceEach = !staticOptions || !!activity.ui?.checkboxes?.includes('Pronounce Each Drill');
+  $: hintBlocks = (activity.hint && activity.hint.content) || [];
+  $: showHintButton = hintBlocks.length > 0;
+  // One-attempt drills finalize on the option tap; retry drills keep the loop.
+  $: oneAttempt = activity.answerPolicy?.attemptsPerItem === 1;
+  $: autoAdvanceMs = activity.answerPolicy?.autoAdvanceMs ?? null;
+  // 2c: the original's full-width "only one syllable" bar under the word. In
+  // this drill it answers "1" -- the same value as the first number tile.
+  $: oneSyllableOption = activity.oneSyllableButton
+    ? options.find(option => option.id === '1') || null
+    : null;
+
+  // 2e: the mark being asked about is rendered RED -- that IS the question.
+  // redMarkCluster is a 1-based grapheme cluster; see markClusters() for why
+  // the whole cluster reddens rather than just its diacritic.
+  $: redParts = current && current.redMarkCluster
+    ? markClusters(current.prompt, current.redMarkCluster)
+    : null;
 
   function maybePronounce() {
     const q = questions[qIndex];
@@ -48,22 +82,23 @@
     if (answered || finished || current.pending) return;
     picked = opt.id;
     attempts += 1;
-    if (opt.id === current.answerId) {
-      correct += 1;
-      feedback = randomFeedback(chapter, 'correct');
-      feedbackKind = 'ok';
+    const right = opt.id === current.answerId;
+    if (right) correct += 1;
+    feedback = randomFeedback(chapter, right ? 'correct' : 'incorrect');
+    feedbackKind = right ? 'ok' : 'bad';
+    if (right || oneAttempt) {
+      // One attempt: the item is done either way and the answer is revealed.
       answered = true;
-      setTimeout(advance, 900);
-    } else {
-      feedback = randomFeedback(chapter, 'incorrect');
-      feedbackKind = 'bad';
+      clearTimeout(advanceTimer);
+      advanceTimer = setTimeout(advance, autoAdvanceMs ?? 900);
     }
   }
 
   function advance() {
+    clearTimeout(advanceTimer);
     if (qIndex < questions.length - 1) {
       qIndex += 1;
-      picked = null; answered = false; feedback = '';
+      picked = null; answered = false; feedback = ''; feedbackKind = '';
       maybePronounce();
     } else {
       finished = true;
@@ -83,6 +118,8 @@
     return [text.slice(0, at), text.slice(at, at + underline.length), text.slice(at + underline.length)];
   }
   let showScore = false;
+
+  onDestroy(() => clearTimeout(advanceTimer));
 </script>
 
 <div class="card">
@@ -95,7 +132,11 @@
     <!-- Greek-tap rule (P6/P8/P9): a Greek PROMPT with audio pronounces itself
          on tap (blue). The tap never answers, advances, or re-shuffles.
          English prompts stay static; options are answers, never audio taps. -->
-    {#if promptIsGreek && current.promptAudio}
+    {#if redParts}
+      <!-- Still displayed Greek, so still a greek-say tap (directive 9); the
+           asked-about mark simply overrides the blue with red. -->
+      <button class="prompt greek greek-say red-mark" disabled={!current.promptAudio} on:click={() => current.promptAudio && play(current.promptAudio)}>{#each redParts as part}<span class:mark-red={part.red}>{part.text}</span>{/each}</button>
+    {:else if promptIsGreek && current.promptAudio}
       <button class="prompt greek greek-say" on:click={() => play(current.promptAudio)}>{current.prompt}</button>
     {:else if current.underline && sentenceParts(current.prompt, current.underline)}
       {@const parts = sentenceParts(current.prompt, current.underline)}
@@ -106,25 +147,46 @@
     {#if current.pending}
       <div class="pending-verification" role="status">This activity item is pending content verification.</div>
     {:else}
+      <!-- Reveal on a finalized item: the gloss, and the properly accented
+           form the Accent Rule drill's misaccented prompt should have had. -->
+      {#if answered && (current.gloss || current.correctForm)}
+        <div class="reveal-row">
+          {#if current.gloss}<span class="reveal-gloss">{current.gloss}</span>{/if}
+          {#if current.correctForm}<span class="reveal-form greek">{current.correctForm}</span>{/if}
+        </div>
+      {/if}
       <div class="feedback {feedbackKind}">{feedback}</div>
-      <div class="grid options" class:wide={wideOptions}>
+      <div class="grid options" class:wide={wideOptions} class:single={optionClass === 'single'}>
         {#each options as opt}
           <button
             class="tile small"
             class:greek={activity.options === 'greek' || activity.generator?.options === 'lower'}
+            class:selected={staticOptions && picked === opt.id}
             class:correct={answered && opt.id === current.answerId}
-            class:incorrect={picked === opt.id && opt.id !== current.answerId}
+            class:incorrect={!staticOptions && picked === opt.id && opt.id !== current.answerId}
             on:click={() => choose(opt)}>
             {opt.label}
           </button>
         {/each}
       </div>
+      {#if oneSyllableOption}
+        <button
+          class="one-syllable-bar"
+          class:selected={picked === oneSyllableOption.id}
+          class:correct={answered && current.answerId === oneSyllableOption.id}
+          on:click={() => choose(oneSyllableOption)}>
+          {activity.oneSyllableButton}
+        </button>
+      {/if}
     {/if}
     <div class="controls">
       <button class="btn secondary" on:click={() => (showScore = !showScore)}>Score</button>
       {#if showPronounce}
         <button class="btn" disabled={!current.promptAudio} on:click={() => current.promptAudio && play(current.promptAudio)}>Pronounce</button>
       {/if}
+      {#if showHintButton}
+        <button class="btn secondary" on:click={() => (showHint = !showHint)}>Hint</button>
+      {/if}
       {#if showPronounceEach}
         <label style="display:flex; align-items:center; gap:6px; font-size:0.9rem">
           <input type="checkbox" bind:checked={pronounceEach} disabled={!current.promptAudio} /> Pronounce each
@@ -137,3 +199,9 @@
     </div>
   {/if}
 </div>
+
+{#if showHint && hintBlocks.length}
+  <div class="card">
+    <RichContent blocks={hintBlocks} />
+  </div>
+{/if}
diff --git a/src/lib/content.js b/src/lib/content.js
index dd16e68..d08334e 100644
--- a/src/lib/content.js
+++ b/src/lib/content.js
@@ -20,6 +20,7 @@
 import toc from '../data/toc.json';
 import intro from '../data/intro.json';
 import spellerTiles from '../data/speller-tiles.json';
+import { stripMarkup } from './markup.js';
 
 // Per-chapter chunk loaders, keyed by chapter id. Vite emits one JS chunk per
 // matched file and vite-plugin-pwa precaches each (audit-proven). Filenames are
@@ -261,11 +262,11 @@ export function resolveItems(chapter, activity) {
       if (item.ref) {
         const lemma = getLemma(item.ref, chapter.id, item.pool);
         return lemma ? {
-          display: lemma.greek, secondary: lemma.gloss, audio: lemma.audio,
+          display: lemma.greek, secondary: stripMarkup(lemma.gloss), audio: lemma.audio,
           meta: { ...lemma, ref: item.ref }
         } : { display: item.ref, secondary: '(missing lemma)', audio: null, meta: {} };
       }
-      return { display: item.display || '(Greek text -- extraction pending)', secondary: item.answer || '',
+      return { display: item.display || '(Greek text -- extraction pending)', secondary: stripMarkup(item.answer) || '',
                audio: item.audio || null, meta: item };
     });
   }
@@ -334,14 +335,25 @@ export function buildSelectQuestions(chapter, activity) {
           : item[promptField];
       const needsUnderline = promptField === 'sentence' && !item.underline;
       return {
-        prompt: prompt || '',
+        prompt: stripMarkup(prompt) || '',
         promptAudio: promptIsGreek ? (item.promptAudio || item.audio || (lemma && lemma.audio) || null) : null,
         answerId: item.answer == null ? null : String(item.answer),
-        underline: item.underline || null,
+        underline: stripMarkup(item.underline) || null,
+        // Revealed once the item is finalized (one-attempt drills): the gloss,
+        // the properly accented form (Accent Rule), and which grapheme cluster
+        // carries the mark being asked about (Marking Recognition).
+        gloss: stripMarkup(item.gloss || (lemma && (lemma.glossShort || lemma.gloss))) || null,
+        correctForm: item.correctForm || null,
+        redMarkCluster: item.redMarkCluster || null,
         pending: !prompt || item.answer == null || needsUnderline
       };
     }));
-    const optionClass = options.every(option => option.label.length <= 8) ? 'wide' : '';
+    // Option-grid density follows label length: number tiles four-up, short
+    // names two-up, and the Accent Rule's full sentences one per row (the
+    // original stacks those full width; two-up clips nothing but reads badly
+    // at 320px).
+    const longest = options.reduce((n, option) => Math.max(n, option.label.length), 0);
+    const optionClass = longest <= 8 ? 'wide' : longest > 24 ? 'single' : '';
     return { options, questions, optionClass, promptIsGreek };
   }
 
diff --git a/src/lib/greek.js b/src/lib/greek.js
index 1b5dcdd..62fb1dc 100644
--- a/src/lib/greek.js
+++ b/src/lib/greek.js
@@ -41,10 +41,26 @@ export function analyzeAccent(answerForm) {
   return { type, position, displayClusters, display: displayClusters.join('') };
 }
 
+// Hyphen join, not the raised dot: that glyph is the Greek colon this very
+// chapter teaches (Learn Other Marks -> Punctuation), so a dot-joined
+// "ἄγ·γε·λος" would read as punctuation to a learner mid-lesson.
 export function dividedForm(greek, division) {
   const gaps = new Set(division || []);
   const clusters = splitGraphemes(greek);
   return clusters.map((cluster, index) =>
-    index < clusters.length - 1 && gaps.has(index + 1) ? `${cluster} · ` : cluster
+    index < clusters.length - 1 && gaps.has(index + 1) ? `${cluster}-` : cluster
   ).join('');
 }
+
+// Marking Recognition asks about ONE mark and draws it red. Splitting the
+// cluster into base + combining mark and coloring only the mark does not
+// work: browsers keep shaping across an inline boundary that differs only in
+// color, so the mark glyph is painted with the BASE run's color and the red
+// never shows (verified in Chrome; the DOM color was correct, the glyph was
+// not). Marking the whole target cluster is the spec's sanctioned fallback.
+export function markClusters(text, redIndex) {
+  return splitGraphemes(text).map((cluster, index) => ({
+    text: cluster,
+    red: index + 1 === redIndex
+  }));
+}
diff --git a/src/lib/markup.js b/src/lib/markup.js
new file mode 100644
index 0000000..c7f3866
--- /dev/null
+++ b/src/lib/markup.js
@@ -0,0 +1,35 @@
+// Inline markup carried inside authored content strings.
+//
+// The chapter-2 English Grammar Review pages underline the exact word or
+// phrase a rule is about ("[[u]]Terry[[/u]] went to the store"). The
+// underlining IS the pedagogy there, so the pipeline ships it inline rather
+// than splitting every example into fragments. Only RichContent renders the
+// spans; every other surface strips the markers so a marker can never reach
+// the screen as literal text.
+
+const UNDERLINE = /\[\[u\]\]([\s\S]*?)\[\[\/u\]\]/g;
+const ANY_MARKER = /\[\[\/?u\]\]/g;
+
+// [{ t, u }] segments in source order; u marks an underlined run.
+export function splitUnderline(text) {
+  const src = text == null ? '' : String(text);
+  if (!src.includes('[[')) return [{ t: src, u: false }];
+  const parts = [];
+  let at = 0;
+  UNDERLINE.lastIndex = 0;
+  for (let m = UNDERLINE.exec(src); m; m = UNDERLINE.exec(src)) {
+    if (m.index > at) parts.push({ t: src.slice(at, m.index), u: false });
+    if (m[1]) parts.push({ t: m[1], u: true });
+    at = m.index + m[0].length;
+  }
+  if (at < src.length) parts.push({ t: src.slice(at), u: false });
+  // An unbalanced marker leaves stray text; strip it rather than print it.
+  return parts.map(p => (p.u ? p : { ...p, t: p.t.replace(ANY_MARKER, '') }));
+}
+
+// Defensive: the same string on a surface with no underline support.
+export function stripMarkup(text) {
+  if (text == null) return text;
+  const src = String(text);
+  return src.includes('[[') ? src.replace(ANY_MARKER, '') : src;
+}
diff --git a/src/components/Marked.svelte b/src/components/Marked.svelte
new file mode 100644
index 0000000..4971d8f
--- /dev/null
+++ b/src/components/Marked.svelte
@@ -0,0 +1,8 @@
+<script>
+  // Renders one authored string, honoring inline [[u]]...[[/u]] underline
+  // spans (see lib/markup.js). Segments are plain text nodes -- never {@html}.
+  import { splitUnderline } from '../lib/markup.js';
+  export let text = '';
+</script>
+
+{#each splitUnderline(text) as seg}{#if seg.u}<u>{seg.t}</u>{:else}{seg.t}{/if}{/each}
```

## Screenshots (not embedded)

```text
buildout/screenshots/5B-patch/accent-placement.png  a196c2d0e43f8458ae2f6cba3c80fcea8b7f5dd1abe5588507223345bd740962  116287 bytes
buildout/screenshots/5B-patch/accent-possibilities-chart.png  82eb816387dba339c1c8cef88798092b53b08f7b37a445e7c2c5770630fb541a  111401 bytes
buildout/screenshots/5B-patch/accent-rule-reveal.png  1105b91e70f8741253aa5bbb5120dc5fe814225dee698c0adbc30b31f5999cd8  132295 bytes
buildout/screenshots/5B-patch/divide-reveal.png  c8d61da7a3428e4c44c5bc90c246cc158e4316ee831b618d4bf011fb1956b656  106915 bytes
buildout/screenshots/5B-patch/grammar-underline.png  31850a95aec7136345962a50c9b268eafbc20a283ee6338dc1c3152db53f0323  144631 bytes
buildout/screenshots/5B-patch/marking-red-mark.png  505afb6c21754b8339e34785520322522bec4efe4741b3985ae6ba6d60277275  96252 bytes
```
