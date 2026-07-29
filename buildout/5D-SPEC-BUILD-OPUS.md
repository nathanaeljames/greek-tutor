# 5D-SPEC-BUILD-OPUS.md — exact build record

Model: Opus 5 in Claude Code. Date: 2026-07-28.
Base: main @ `281774a` — phase 5d spec
Nothing pushed to the remote.

Wall clock: one continuous session, approx. 1h55m from spec read to final
verify. Phase 0 (required-key scan, wireframes, checkpoint question) took
the first ~20 minutes; Nathanael's selection arrived in-session, so no
non-keyboard work had to be deferred behind the checkpoint.

## 1. File inventory

```
 M buildout/DIVERGENCE-LOG.md
 M scripts/check-content-shapes.mjs
 M scripts/check-lazy-chunk.mjs
 M src/app.css
 M src/components/ActivityHost.svelte
 M src/components/ContentAudio.svelte
 M src/components/DivideActivity.svelte
 M src/components/PlaceAccentActivity.svelte
 M src/components/RichContent.svelte
 M src/components/SelectActivity.svelte
 M src/components/SpellActivity.svelte
 M src/data/speller-tiles.json
 M src/lib/content.js
?? buildout/5D-SPEC-BUILD-OPUS.md
?? buildout/5D-SPEC-RESULTS-OPUS.md
?? buildout/screenshots/5D/
?? src/components/Paradigm.svelte
?? src/components/SpellVerseActivity.svelte
?? src/components/SpellerKeyboard.svelte
?? src/lib/answer-check.js
?? src/lib/timing.js
```

Diffstat (tracked files):

```
 buildout/DIVERGENCE-LOG.md                |  37 +++++++
 scripts/check-content-shapes.mjs          | 104 +++++++++++++++++-
 scripts/check-lazy-chunk.mjs              |   3 +-
 src/app.css                               | 118 +++++++++++++++++++++
 src/components/ActivityHost.svelte        |   3 +
 src/components/ContentAudio.svelte        |  37 ++++++-
 src/components/DivideActivity.svelte      |   3 +-
 src/components/PlaceAccentActivity.svelte |   3 +-
 src/components/RichContent.svelte         |  18 +++-
 src/components/SelectActivity.svelte      | 169 +++++++++++++++++++++++-------
 src/components/SpellActivity.svelte       | 102 +++++++-----------
 src/data/speller-tiles.json               |  30 +++++-
 src/lib/content.js                        | 130 +++++++++++++++++++----
 13 files changed, 618 insertions(+), 139 deletions(-)
```

## 2. Test suites run (sources in §4)

| Suite | What it does | Result |
| --- | --- | --- |
| `walk.mjs` @320px | Every stop of all 3 chapter rails; measures horizontal overflow against `.content` and the document, flags missing cards and unsupported blocks | 64 activities, 0 overflow, console clean |
| `walk.mjs` @768px | Same | 64 activities, 0 overflow, console clean |
| `interact.mjs` | 49 behavioural assertions on the real UI across every new surface | 49/49, console clean; re-run 6x to cover both random branches of the advance test |
| `offline.mjs` | Warms the SW, cuts the network, reloads a COLD document offline, walks all 3 rails | TOC 33 entries, 64 activities, 0 blank/errored, 0 non-audio request failures |
| `audio-wiring.mjs` | Drives each spot-play tap with the audio route aborted (so IndexedDB caching cannot hide a repeat tap) and checks the resolved path against the shipped pack | all 19 clips resolve, all present on disk |
| `keyscan.mjs` | Phase 0 research: every typing-surface answer vs. what the tiles can produce | produced the required-key table |
| `npm run verify` | check:shapes -> build -> check:lazy-chunk | green |

Build numbers:

```
precache   21 entries / 479.92 KiB  ->  23 entries / 553.43 KiB   (+2, +73.51 KiB)
unchanged  chapt-01-8ZoFoXk9.js  lexicon-chapt01-DWCL8L3K.js
unchanged  chapt-02-B6HjUK2Y.js  lexicon-chapt02-DMecEUSp.js
new        chapt-03-DCLxQLAM.js (38.50 kB)  lexicon-chapt03-DU3wQSch.js (1.94 kB)
```

## 3. Diff of tracked files

```diff
diff --git a/buildout/DIVERGENCE-LOG.md b/buildout/DIVERGENCE-LOG.md
index 5c68b00..24ce862 100644
--- a/buildout/DIVERGENCE-LOG.md
+++ b/buildout/DIVERGENCE-LOG.md
@@ -59,6 +59,36 @@ D-15 | ch3+ | Speller keyboard extended app-wide (space +
      punctuation per the 5D Phase 0 checkpoint; layout chosen by
      Nathanael). Original on-screen keyboard has no space key. |
      Nathanael, 5D-RECON D8.
+     RESOLVED 2026-07-28 at the Phase 0 checkpoint — LAYOUT A: one
+     added bottom row, four punctuation keys (comma, raised dot,
+     period, Greek question mark) plus a space bar that takes the rest
+     of the row and drops to a full-width row of its own where there
+     is not room. Letter and mark rows untouched. Inventory is now
+     25 letters + 11 marks + 3 composites + 4 punctuation + space
+     (44 tiles). Ships in speller-tiles.json, the SHARED contract; the
+     component reads it in preference to any inline
+     activity.spellerTiles copy, so chapter 1's byte-identical inline
+     duplicate can no longer fork the keyboard.
+D-18 | app | SPELLING CHECK POLICY (5D Phase 0, Nathanael). "With
+     Accents" OFF: accent/breathing/subscript-insensitive, case-
+     insensitive, final sigma = sigma, punctuation optional, movable
+     nu optional, whitespace normalized. ON: every mark exact —
+     and nothing else changes (still case-insensitive, still
+     punctuation-optional per the data flag, still movable-nu
+     lenient). CASE IS NEVER REQUIRED under either setting: the
+     shared keyboard has no capitals and the decision was to keep it
+     that way rather than add a shift layer. This also RETROACTIVELY
+     fixes chapters 1-2, where Χριστός / Π- / Φ- items had been
+     unwinnable with "With Accents" ON since their cohorts shipped.
+     | Nathanael, 5D Phase 0.
+D-19 | app | English-to-Greek vocabulary drills drop from a four-
+     column to a two-column option grid. Ten polytonic Greek words
+     four-up need ~33px more than a 320px screen has, and overflow-x
+     is hidden app-wide, so the longest words were being clipped in
+     silence (measured on ch1, ch2 AND ch3; the expression is
+     identical in the shipped build, so it predates this cohort). The
+     24-letter grids keep four columns — single glyphs, no width
+     problem. | 5D, measured; confirm in VERIFY-5D.
 D-16 | ch3 | Movable-nu leniency: verb spelling checker accepts
      3rd-plural forms with or without final nu (original acceptance
      behavior unverified). | 5D assembly, _verify pending.
@@ -75,6 +105,13 @@ D-17 | intro | "Getting Around" navigation copy is new-authored (the
 | autoBoth | 1 | ADVANCE_CORRECT_MS auto | ADVANCE_INCORRECT_MS auto | ch3+ Scripture Memory Drill; ch2 one-attempt reveal surfaces (migrate at next touch) |
 | manual | n/a | manual | manual | all spell/spellVerse/divide/placeAccent (Check Answer flows) |
 
+Implemented 5D in src/lib/timing.js: the two constants plus
+resolveAdvance(answerPolicy), which maps BOTH the advanceClass field
+(ch3+) and chapter 2's older attemptsPerItem/autoAdvanceMs/
+autoAdvanceOnIncorrect triple onto the same three classes. An explicit
+autoAdvanceMs still wins, so chapter 2's shipped ~4s feel is unchanged
+until it is retuned. No component file contains a timing number.
+
 Original observed timings for the record: ch2 one-attempt reveal ~4s
 (J1); ch3 drills ~2s correct, manual incorrect; ch3 SM drill ~2s/~4s.
 Completion semantics (unchanged): retry completes on all-correct;
diff --git a/scripts/check-content-shapes.mjs b/scripts/check-content-shapes.mjs
index d9b96da..dc5a3a8 100644
--- a/scripts/check-content-shapes.mjs
+++ b/scripts/check-content-shapes.mjs
@@ -15,12 +15,21 @@ const problems = [];
 // (5B-SPEC3 D4). Add the type here in the same change that adds its branch.
 const BLOCK_TYPES = new Set([
   'heading', 'subheading', 'para', 'numbered', 'defList',
-  'biblist', 'refs', 'note', 'greekRows', 'expander'
+  'biblist', 'refs', 'note', 'greekRows', 'expander', 'paradigm'
 ]);
 // "type" is also the ACTIVITY discriminator, so the activity types are listed
 // here as the known non-block use of the key. Anything else carrying a "type"
 // is a content block and must have a renderer.
-const ACTIVITY_TYPES = new Set(['contentAudio', 'select', 'spell', 'divide', 'placeAccent']);
+const ACTIVITY_TYPES = new Set(['contentAudio', 'select', 'spell', 'divide', 'placeAccent', 'spellVerse']);
+// contentAudio dispatches on `mode`; a mode with no branch in
+// ContentAudio.svelte falls through to the generic chart and renders a grid of
+// nothing, which is exactly the kind of failure that only shows up on device.
+const CONTENT_MODES = new Set([
+  'chart', 'exploreGrid', 'stepper', 'textPage', 'objectivesPage', 'flashcard',
+  'selfCheckStepper', 'selfCheckSequence', 'equationChart', 'vowelStair',
+  'diphthongRows', 'reviewVocab', 'reviewLetters', 'topicPages',
+  'paradigmChart', 'interlinearVerse'
+]);
 
 // walk every nested block array a chapter can carry (content, topics[].content,
 // expander.content, hint.content, ...) without hard-coding the nesting.
@@ -57,6 +66,44 @@ for (const file of files) {
         }
       });
     }
+    // Every contentAudio mode must have a branch in ContentAudio.svelte; an
+    // unknown one silently falls through to the generic chart layout.
+    if (block.type === 'contentAudio' && block.mode && !CONTENT_MODES.has(block.mode)) {
+      problems.push(`${path}: contentAudio mode "${block.mode}" has no ContentAudio branch.`);
+    }
+    // A paradigm chart's rows must line up with its declared columns, or cells
+    // land under the wrong number heading.
+    if (block.type === 'paradigm' || (block.paradigm && block.mode === 'paradigmChart')) {
+      const chart = block.type === 'paradigm' ? block : block.paradigm;
+      const columns = (chart.columns || []).length;
+      if (!columns) problems.push(`${path}: paradigm has no columns.`);
+      (chart.rows || []).forEach((row, index) => {
+        if (!Array.isArray(row.cells) || row.cells.length !== columns) {
+          problems.push(`${path}.rows[${index}]: paradigm row has ${(row.cells || []).length} cells, expected ${columns}.`);
+        }
+      });
+      if (chart.endings) {
+        (chart.endings.rows || []).forEach((row, index) => {
+          if (!Array.isArray(row) || row.length !== columns * 2) {
+            problems.push(`${path}.endings.rows[${index}]: expected ${columns * 2} entries (ending + gloss per column).`);
+          }
+        });
+      }
+    }
+    // spellVerse grades word by word, so the answer must actually be words.
+    if (block.type === 'spellVerse') {
+      if (!Array.isArray(block.answerWords) || !block.answerWords.length) {
+        problems.push(`${path}: spellVerse has no answerWords array.`);
+      } else {
+        block.answerWords.forEach((word, index) => {
+          if (typeof word !== 'string' || !word.trim()) {
+            problems.push(`${path}.answerWords[${index}]: not a non-empty string.`);
+          } else if (/\s/.test(word)) {
+            problems.push(`${path}.answerWords[${index}]: "${word}" contains whitespace — one word per entry.`);
+          }
+        });
+      }
+    }
     // greekRows rows carry a word, a positional-chart cell list, or an
     // alternating parts[] equation -- never nothing at all.
     if (block.type === 'greekRows') {
@@ -113,9 +160,60 @@ for (const file of files) {
   });
 }
 
+// ---- KEYBOARD COVERAGE (5D Phase 0) ----
+// Every answer on a typing surface must be reachable on the SHARED speller
+// keyboard. This is the check that was missing: chapter 1 shipped Χριστός and
+// chapter 2 shipped Π-/Φ- words whose capitals no tile can produce, so "With
+// Accents" ON was unwinnable on those items from the day they landed, and
+// nothing said so. Folded exactly as the checker folds (case always,
+// punctuation when the surface allows it), so a pass here means the item can
+// actually be answered under both toggle settings.
+const TILES = JSON.parse(readFileSync(join(DATA, 'speller-tiles.json'), 'utf8'));
+const PRODUCIBLE = new Set([...(TILES.letters || []), ...(TILES.composites || [])]);
+for (const base of [...PRODUCIBLE]) {
+  for (const mark of (TILES.diacritics || [])) PRODUCIBLE.add((base + mark.apply).normalize('NFC'));
+}
+for (const p of TILES.punctuation || []) PRODUCIBLE.add(p.insert);
+if (TILES.space) PRODUCIBLE.add(TILES.space.insert);
+
+for (const file of files) {
+  const data = JSON.parse(readFileSync(join(DATA, file), 'utf8'));
+  const lexName = `lexicon-${file.replace('chapt-0', 'chapt0').replace('chapt-', 'chapt')}`;
+  let lexicon = null;
+  try { lexicon = JSON.parse(readFileSync(join(DATA, lexName), 'utf8')); } catch { /* optional */ }
+  const lemmaGreek = ref => {
+    for (const bucket of ['lemmas', 'exampleWords', 'ch1_lemma_mirror']) {
+      if (lexicon && lexicon[bucket] && lexicon[bucket][ref]) return lexicon[bucket][ref].greek;
+    }
+    return null;
+  };
+  walk(data, file, (activity, path) => {
+    if (activity.type !== 'spell' && activity.type !== 'spellVerse') return;
+    const answers = [...(activity.answerWords || [])];
+    for (const item of activity.items || []) {
+      const greek = item.greek || (item.ref ? lemmaGreek(item.ref) : null);
+      if (greek) answers.push(greek);
+    }
+    const punctuationOptional = activity.punctuationOptional !== false;
+    for (const answer of answers) {
+      // The checker lowercases under both toggle settings (no shift layer),
+      // and drops punctuation unless the surface requires it.
+      let folded = answer.toLowerCase();
+      if (punctuationOptional) folded = folded.replace(/[.,;:!?'"()\[\]··;᾽’ʼ‘“”«»—–-]/gu, '');
+      for (const { segment } of segment_(folded)) {
+        const cluster = segment.normalize('NFC');
+        if (!PRODUCIBLE.has(cluster)) {
+          problems.push(`${path}: "${answer}" needs "${cluster}" (U+${[...cluster].map(c => c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).join('+')}), which no speller tile can produce.`);
+        }
+      }
+    }
+  });
+}
+function segment_(text) { return new Intl.Segmenter('el', { granularity: 'grapheme' }).segment(text); }
+
 if (problems.length) {
   for (const problem of problems) console.error(`FAIL: ${problem}`);
   process.exit(1);
 }
 
-console.log(`PASS: content shapes intact — ${files.join(', ')} checked (biblist entries are strings; greekRows rows carry content; every reddened cluster has a font-derived geometry row).`);
+console.log(`PASS: content shapes intact — ${files.join(', ')} checked (biblist entries are strings; greekRows rows carry content; paradigm rows match their columns; spellVerse answers are single words; every contentAudio mode has a branch; every reddened cluster has a font-derived geometry row; every spelling answer is typeable on the shared keyboard).`);
diff --git a/scripts/check-lazy-chunk.mjs b/scripts/check-lazy-chunk.mjs
index ab740a1..e3e2da6 100644
--- a/scripts/check-lazy-chunk.mjs
+++ b/scripts/check-lazy-chunk.mjs
@@ -20,7 +20,8 @@ const fail = msg => { console.error(`FAIL: ${msg}`); process.exit(1); };
 // 1. Every built chapter and lexicon must exist as its own asset.
 const expected = [
   { chapterPattern: /^chapt-01-.*\.js$/, lexiconPattern: /^lexicon-chapt01-.*\.js$/, needle: 'You will be able to:' },
-  { chapterPattern: /^chapt-02-.*\.js$/, lexiconPattern: /^lexicon-chapt02-.*\.js$/, needle: 'Greek divides words into syllables in almost the same way as English.' }
+  { chapterPattern: /^chapt-02-.*\.js$/, lexiconPattern: /^lexicon-chapt02-.*\.js$/, needle: 'Greek divides words into syllables in almost the same way as English.' },
+  { chapterPattern: /^chapt-03-.*\.js$/, lexiconPattern: /^lexicon-chapt03-.*\.js$/, needle: 'Verbs are words of action or state of being.' }
 ];
 
 // 2. Chapter DATA must be ABSENT from the main bundle and PRESENT in its chunk.
diff --git a/src/app.css b/src/app.css
index ce80b80..1033d39 100644
--- a/src/app.css
+++ b/src/app.css
@@ -557,6 +557,123 @@ button { font: inherit; cursor: pointer; }
 .kb-greek { font-size: 1.25rem; }
 .kb-ref { max-width: 420px; }
 
+/* ================= Chapter 3 (5D) ================= */
+
+/* ---- PARADIGM CHART ----
+   One grid, three hosts (Learn topic block, Quick Review page, drill Hint
+   popup). Person column + one column per number; each cell is a tappable
+   Greek form over its gloss. The glosses are the widest thing in the chart
+   ("He/she/it looses/is loosing"), so the columns are fr units with min-width
+   0 and the text wraps — at 320px the two data columns get ~110px each and
+   the gloss runs to three lines rather than clipping. */
+.paradigm { margin: 6px 0 2px; }
+.pg-title { text-align: center; font-size: 1.1rem; font-weight: 700; color: var(--teal-dark);
+  margin-bottom: 8px; }
+.pg-lemma { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: center;
+  gap: 4px 12px; width: 100%; background: transparent; border: none; padding: 2px 0 10px; }
+.pg-lemma-greek { font-size: 1.7rem; color: var(--link); }
+.pg-lemma-gloss { color: var(--teal-dark); font-size: 0.95rem; }
+.pg-grid { display: flex; flex-direction: column; }
+.pg-head, .pg-row { display: grid; grid-template-columns: 1.6em repeat(var(--pg-cols, 2), minmax(0, 1fr));
+  gap: 6px; align-items: stretch; }
+.pg-head { padding: 6px 2px; border-bottom: 2px solid rgba(0,0,0,0.1); color: var(--teal-dark);
+  font-size: 0.75rem; font-weight: 700; text-transform: uppercase; text-align: center; }
+.pg-head > span { min-width: 0; overflow-wrap: break-word; }
+.pg-row { border-bottom: 1px solid rgba(0,0,0,0.06); }
+.pg-person { display: flex; align-items: center; justify-content: flex-start;
+  color: var(--teal-dark); font-weight: 700; font-size: 0.9rem; }
+.pg-cell { display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 0;
+  background: transparent; border: none; padding: 9px 2px; text-align: center; }
+.pg-cell:active { background: rgba(0,0,0,0.04); border-radius: 8px; }
+.pg-cell:disabled { cursor: default; }
+.pg-greek { font-size: 1.35rem; color: var(--link); overflow-wrap: anywhere; }
+.pg-cell:disabled .pg-greek { color: var(--ink); }
+.pg-gloss { font-size: 0.78rem; line-height: 1.3; color: var(--teal-dark); overflow-wrap: break-word; }
+/* The original keeps Say Whole Paradigm / Endings INSIDE the chart frame. */
+.pg-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 12px; }
+
+/* Endings popup: the same two number columns, ending over its English. The
+   endings are bare morphemes with no clips, so they stay INK — the tappable
+   blue would promise audio that does not exist. */
+.pg-endings { max-width: 380px; }
+.pg-endgrid { display: flex; flex-direction: column; margin: 4px 0 2px; }
+.pg-endhead { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px;
+  padding: 5px 2px; border-bottom: 2px solid rgba(0,0,0,0.1); color: var(--teal-dark);
+  font-size: 0.72rem; font-weight: 700; text-transform: uppercase; text-align: center; }
+.pg-endrow { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px;
+  padding: 8px 2px; border-bottom: 1px solid rgba(0,0,0,0.06); }
+.pg-endpair { display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 0; }
+.pg-ending { font-size: 1.3rem; color: var(--ink); }
+.pg-endgloss { font-size: 0.78rem; color: var(--teal-dark); overflow-wrap: break-word; text-align: center; }
+
+/* Hint popup: the paradigm over the drill (the original's Hint window). */
+.hint-modal { max-width: 400px; max-height: 86vh; overflow-y: auto; }
+
+/* ---- INTERLINEAR VERSE (Scripture Memory) ----
+   Greek row over gloss row, wrapping as whole words so a word never parts
+   company with its gloss (D6). Each word is its own tap target and clip. */
+.ilv { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 4px 14px; }
+.ilv-word { display: flex; flex-direction: column; align-items: center; gap: 1px;
+  background: transparent; border: none; padding: 4px 2px; }
+.ilv-word:active { background: rgba(0,0,0,0.04); border-radius: 8px; }
+.ilv-word:disabled { cursor: default; }
+.ilv-greek { font-size: 1.5rem; line-height: 1.35; color: var(--link); }
+.ilv-word:disabled .ilv-greek { color: var(--ink); }
+/* A word with no gloss (the article before Ἰησοῦς) keeps its slot so the two
+   rows stay on their own baselines instead of jostling. */
+.ilv-gloss { font-size: 0.78rem; line-height: 1.3; color: var(--teal-dark); min-height: 1.3em;
+  white-space: pre; }
+.ilv-ref { text-align: right; color: var(--teal-dark); font-size: 0.85rem; font-weight: 700;
+  margin-top: 10px; }
+
+/* ---- Drill additions ---- */
+/* The scripture citation the original prints with the drill word. */
+.prompt-citation { text-align: center; color: var(--teal-dark); font-size: 0.82rem;
+  font-weight: 700; margin: -10px 0 6px; }
+/* advanceClass manualOnIncorrect: the item is final and nothing is moving. */
+.await-next { text-align: center; color: var(--teal-dark); font-size: 0.9rem;
+  font-weight: 600; margin-top: 10px; }
+/* optionGroups [3,3]: two separated stacks. Six 46-character parsing labels
+   cannot share 320px in two columns, so the groups stack vertically on the
+   phone (still visibly two blocks, divided) and sit side by side once there is
+   room, which is the original's arrangement. */
+.option-groups { display: grid; grid-template-columns: 1fr; gap: 10px; }
+.option-group { gap: 8px; }
+.option-group + .option-group { border-top: 1px solid rgba(0,0,0,0.12); padding-top: 10px; }
+@media (min-width: 560px) {
+  .option-groups { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
+  .option-group + .option-group { border-top: none; border-left: 1px solid rgba(0,0,0,0.12);
+    padding-top: 0; padding-left: 12px; }
+}
+
+/* ---- SHARED KEYBOARD: punctuation + space row (D-15, Phase 0 layout A) ----
+   The letter and mark rows above are untouched. This row keeps the four
+   punctuation keys at a real touch target and gives the rest to the space
+   bar, which is the key the whole-verse speller lives on. */
+.tk-punct { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; }
+.tk-punct .tk-key { flex: 0 0 auto; min-width: 44px; }
+.tk-key.punct { font-family: var(--greek-font); color: var(--teal-dark); }
+/* The space bar takes the rest of the row where there is room and drops to a
+   full-width row of its own where there is not — four 44px punctuation keys
+   leave only 64px inside 320px, which is a space bar in name only. The
+   flex-basis is what decides: it wraps when the remainder is under 140px. */
+.tk-key.tk-space { flex: 1 1 140px; min-width: 140px; font-size: 0.85rem; font-weight: 600;
+  color: var(--teal-dark); }
+
+/* ---- WHOLE-VERSE SPELLER ---- */
+.sv-ref { text-align: right; color: var(--teal-dark); font-size: 0.85rem; font-weight: 700;
+  margin-bottom: 8px; }
+/* Free-typed multi-word Greek: wraps, and grows instead of scrolling sideways. */
+.spellverse .sv-target { font-size: 1.35rem; line-height: 1.5; min-height: 4.5rem;
+  display: block; white-space: pre-wrap; overflow-wrap: anywhere; }
+.sv-detail { text-align: center; color: var(--teal-dark); font-size: 0.95rem; margin: -4px 0 8px; }
+.sv-word { font-size: 1.2rem; }
+.sv-hint { background: #fffdf3; border: 1px solid #e7dfbf; border-radius: 10px;
+  padding: 10px 12px; margin: 10px 0; }
+.sv-hint .label { font-size: 0.75rem; color: var(--teal-dark); font-weight: 700; text-transform: uppercase; }
+.sv-verse { font-size: 1.25rem; line-height: 1.5; margin: 4px 0 6px; overflow-wrap: anywhere; }
+.sv-translation { font-size: 0.95rem; color: var(--teal-dark); }
+
 /* ---- Chapter 2 divide / placeAccent activities ---- */
 .exercise-checks { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin: 12px 0;
   font-size: 0.9rem; }
@@ -670,6 +787,7 @@ button, a, input, select, textarea, label,
 .rv-greek, .lm-row, .rc-defrow, .rc-example, .greek-chip, .greek-tap,
 .seg, .flash-hidden, .icon-btn, .bb-item, .section-head, .collapse-head,
 .rc-expander summary, .accent-slot,
+.pg-cell, .pg-lemma, .ilv-word,
 .one-syllable-bar {
   touch-action: manipulation;
 }
diff --git a/src/components/ActivityHost.svelte b/src/components/ActivityHost.svelte
index a15fd0a..5edda39 100644
--- a/src/components/ActivityHost.svelte
+++ b/src/components/ActivityHost.svelte
@@ -8,6 +8,7 @@
   import ContentAudio from './ContentAudio.svelte';
   import SelectActivity from './SelectActivity.svelte';
   import SpellActivity from './SpellActivity.svelte';
+  import SpellVerseActivity from './SpellVerseActivity.svelte';
   import DivideActivity from './DivideActivity.svelte';
   import PlaceAccentActivity from './PlaceAccentActivity.svelte';
   import ReadingCategories from './ReadingCategories.svelte';
@@ -55,6 +56,8 @@
       <SelectActivity {chapter} {activity} />
     {:else if activity.type === 'spell'}
       <SpellActivity {chapter} {activity} />
+    {:else if activity.type === 'spellVerse'}
+      <SpellVerseActivity {chapter} {activity} />
     {:else if activity.type === 'divide'}
       <DivideActivity {chapter} {activity} />
     {:else if activity.type === 'placeAccent'}
diff --git a/src/components/ContentAudio.svelte b/src/components/ContentAudio.svelte
index 24c7554..abf4f59 100644
--- a/src/components/ContentAudio.svelte
+++ b/src/components/ContentAudio.svelte
@@ -2,7 +2,8 @@
   // The contentAudio family, dispatched on activity.mode (B1 — never on
   // activity id): chart / exploreGrid / stepper / textPage / objectivesPage /
   // flashcard / selfCheckStepper / selfCheckSequence / equationChart /
-  // vowelStair / diphthongRows / reviewVocab / reviewLetters / topicPages. The bespoke
+  // vowelStair / diphthongRows / reviewVocab / reviewLetters / topicPages /
+  // paradigmChart / interlinearVerse. The bespoke
   // modes are pedagogical layouts reconstructed from the original's yellow
   // panels; their per-mode data contracts are documented in HANDOFF-4 §5 (B1).
   import { slide } from 'svelte/transition';
@@ -11,6 +12,7 @@
   import { markCompleted } from '../lib/progress.js';
   import RichContent from './RichContent.svelte';
   import ArrowCue from './ArrowCue.svelte';
+  import Paradigm from './Paradigm.svelte';
   export let chapter;
   export let activity;
 
@@ -141,7 +143,7 @@
   <div class="card topic-page">
     {#if currentTopic}
       <div class="topic-heading">{currentTopic.title}</div>
-      <RichContent blocks={currentTopic.content || []} />
+      <RichContent blocks={currentTopic.content || []} suppressTitle={currentTopic.title} />
       {#if currentTopic._verify}<div class="pending-verification compact">Some topic details are pending verification.</div>{/if}
     {:else}
       <div class="pending-verification">Topic content pending verification.</div>
@@ -154,6 +156,37 @@
     {#if activity._topic_verify}<div class="pending-verification compact">Topic order pending verification.</div>{/if}
   </div>
 
+{:else if mode === 'paradigmChart'}
+  <!-- Quick Review's full-page paradigm: the same chart the Learn topic and
+       the drill Hint render, with the chart title above it. The Endings button
+       simply isn't there when the data omits the endings block. -->
+  <div class="card">
+    <Paradigm paradigm={activity.paradigm || {}} title={activity.chartTitle} />
+  </div>
+
+{:else if mode === 'interlinearVerse'}
+  <!-- Scripture Memory: the verse set as flowing Greek with each word's gloss
+       under it, wrapping as a unit so a word never parts company with its
+       gloss. Every Greek word is tappable and plays its own c_sm clip; a word
+       with no gloss (the article before Ἰησοῦς) still renders and still
+       plays, holding its column open so the two rows stay aligned. -->
+  <div class="card">
+    <div class="ilv">
+      {#each activity.words || [] as w}
+        <button class="ilv-word" disabled={!w.audio} on:click={() => w.audio && play(w.audio)}>
+          <span class="greek ilv-greek">{w.greek}</span>
+          <span class="ilv-gloss">{w.gloss || ' '}</span>
+        </button>
+      {/each}
+    </div>
+    {#if activity.reference}<div class="ilv-ref">{activity.reference}</div>{/if}
+    {#if activity.sayWhole}
+      <div class="controls">
+        <button class="btn secondary" on:click={() => play(activity.sayWhole.audio)}>{activity.sayWhole.label || 'Say Whole Verse'}</button>
+      </div>
+    {/if}
+  </div>
+
 {:else if mode === 'textPage'}
   {#if activity.content}
     <div class="card">
diff --git a/src/components/DivideActivity.svelte b/src/components/DivideActivity.svelte
index dc4c191..06b0146 100644
--- a/src/components/DivideActivity.svelte
+++ b/src/components/DivideActivity.svelte
@@ -32,6 +32,7 @@
   import { randomFeedback, resolveHintBlocks } from '../lib/content.js';
   import { dividedForm, splitGraphemes } from '../lib/greek.js';
   import { markCompleted } from '../lib/progress.js';
+  import { resolveAdvance } from '../lib/timing.js';
   import RichContent from './RichContent.svelte';
 
   export let chapter;
@@ -203,7 +204,7 @@
   $: pending = !item || !item.greek || !Array.isArray(item.division);
   $: hintBlocks = resolveHintBlocks(chapter, activity.hint);
   $: oneAttempt = activity.answerPolicy?.attemptsPerItem === 1;
-  $: autoAdvanceMs = activity.answerPolicy?.autoAdvanceMs ?? 900;
+  $: autoAdvanceMs = resolveAdvance(activity.answerPolicy).correctMs;
   $: revealed = answered && oneAttempt;
   $: answerGaps = new Set((!pending && item.division) || []);
   // Live score (C3): reactive, so the line follows every answer instead of
diff --git a/src/components/PlaceAccentActivity.svelte b/src/components/PlaceAccentActivity.svelte
index b8a6b90..623c434 100644
--- a/src/components/PlaceAccentActivity.svelte
+++ b/src/components/PlaceAccentActivity.svelte
@@ -14,6 +14,7 @@
   import { randomFeedback } from '../lib/content.js';
   import { analyzeAccent, splitGraphemes } from '../lib/greek.js';
   import { markCompleted } from '../lib/progress.js';
+  import { resolveAdvance } from '../lib/timing.js';
   import RichContent from './RichContent.svelte';
 
   export let chapter;
@@ -48,7 +49,7 @@
   $: pending = !word || !word.answerForm || !answer.type || answer.position < 0;
   $: hintBlocks = (activity.hint && activity.hint.content) || [];
   $: oneAttempt = activity.answerPolicy?.attemptsPerItem === 1;
-  $: autoAdvanceMs = activity.answerPolicy?.autoAdvanceMs ?? 900;
+  $: autoAdvanceMs = resolveAdvance(activity.answerPolicy).correctMs;
   $: revealed = answered && oneAttempt;
   // ROOT DISPLAY (5B-SPEC4 D2). Every item shows a Greek word in the header --
   // VERIFY3 item 3 found six that showed only a gloss. Those six are the ones
diff --git a/src/components/RichContent.svelte b/src/components/RichContent.svelte
index 8c64fdf..2591b71 100644
--- a/src/components/RichContent.svelte
+++ b/src/components/RichContent.svelte
@@ -5,16 +5,24 @@
   // rows and underlined list lead-ins are all load-bearing, not decoration.
   //
   // Block types: heading | subheading | para | numbered | defList | biblist |
-  // refs | note | greekRows | expander. An unknown type renders LOUD (see the
-  // dispatch's final else) rather than vanishing.
+  // refs | note | greekRows | expander | paradigm. An unknown type renders LOUD
+  // (see the dispatch's final else) rather than vanishing.
   // Trailing { greek, caption?, audio? } "example" objects render in the Greek
   // font and play their clip on tap. defList rows [term, value, audio?] play
   // the row's clip when present.
   import { play } from '../lib/audio.js';
   import { splitMarkRun } from '../lib/greek.js';
   import Marked from './Marked.svelte';
+  import Paradigm from './Paradigm.svelte';
 
   export let blocks = [];
+  // The heading the HOST already printed above these blocks (topicPages prints
+  // the topic title). A chart whose own title repeats it prints one heading,
+  // not two — the chapter-3 Paradigm topic is titled "Paradigm" and so is its
+  // chart. Same principle as dedupeExpanders below: the data is not ours to
+  // edit, so the renderer declines to say it twice.
+  export let suppressTitle = null;
+  const sameTitle = t => !!t && !!suppressTitle && t.trim() === suppressTitle.trim();
 
   // The 6 Accent Rules topic ships the "Chart: Accent Possibilities" expander
   // TWICE, byte-identical (feedback 5: it renders twice on both devices). Data
@@ -261,6 +269,12 @@
         {#if b._verify}<div class="pending-verification compact">Some chart details are pending verification.</div>{/if}
       </div>
 
+    {:else if b.type === 'paradigm'}
+      <!-- A conjugation/declension chart. Its own component because the same
+           grid is ALSO a full-page contentAudio mode (paradigmChart) and the
+           Hint popup on three chapter-3 drills — one renderer, three hosts. -->
+      <Paradigm paradigm={b} title={sameTitle(b.title) ? null : b.title} />
+
     {:else if b.type === 'expander'}
       <details class="rc-expander">
         <summary><Marked text={b.label} /></summary>
diff --git a/src/components/SelectActivity.svelte b/src/components/SelectActivity.svelte
index 9e5d626..70091bc 100644
--- a/src/components/SelectActivity.svelte
+++ b/src/components/SelectActivity.svelte
@@ -3,28 +3,32 @@
   // Covers letter exercises (24-option generator), vocab drills (10 lemmas)
   // and chapter 2's four static-option drills.
   //
-  // ANSWER POLICY (5B patch 2a). activity.answerPolicy decides what a tap on an
-  // option means:
-  //   { attemptsPerItem: 1, autoAdvanceMs: 4000 } — the tap FINALIZES the item
-  //     right or wrong, the answer is revealed, and the drill auto-advances
-  //     after autoAdvanceMs (cancelled on unmount). Completion = every item
-  //     ATTEMPTED, not every item correct.
-  //   { attemptsPerItem: "retry" } / absent — the original retry loop: a wrong
-  //     tap leaves the item open, only a correct tap advances (chapter 1 and
-  //     the Syllable Counting drill).
-  //   { autoAdvanceOnIncorrect: false } — a WRONG answer is still final, but
-  //     nothing moves: the learner studies the revealed form for as long as
-  //     they like and clicks Next (5B-SPEC2 C4, Accent Rule drill).
+  // ANSWER POLICY. activity.answerPolicy declares WHAT a tap on an option
+  // means; src/lib/timing.js decides how long anything waits (D-14 — no
+  // timing number lives in this file). The three classes:
+  //   retry              a wrong tap leaves the item open; only a correct tap
+  //                      advances (chapter 1, Syllable Counting).
+  //   manualOnIncorrect  one attempt; correct auto-advances, incorrect reveals
+  //                      the answer, LOCKS the options and waits for Next
+  //                      (ch2 Accent Rule, ch3's five drills).
+  //   autoBoth           one attempt; both outcomes auto-advance, incorrect on
+  //                      the longer wait (ch3 Scripture Memory Drill).
+  // Chapter 2's older attemptsPerItem/autoAdvanceMs/autoAdvanceOnIncorrect
+  // fields map onto the same three classes, so its shipped feel is unchanged.
+  // Completion: one-attempt drills complete on all-ATTEMPTED, retry drills on
+  // all-correct.
   //
   // CONTROLS come from activity.ui.buttons, so each drill shows exactly the
   // original's button block (Previous / Next / Pronounce / Translate / Hint /
   // Score); chapter 1's two-button drills are unaffected.
   import { onDestroy } from 'svelte';
-  import { buildSelectQuestions, randomFeedback, resolveHintBlocks } from '../lib/content.js';
+  import { buildSelectQuestions, randomFeedback, resolveHintBlocks, resolveHintRef } from '../lib/content.js';
   import { combiningForMarkName, firstAccentCluster, markOverlayParts } from '../lib/greek.js';
   import { play } from '../lib/audio.js';
   import { markCompleted } from '../lib/progress.js';
+  import { resolveAdvance } from '../lib/timing.js';
   import RichContent from './RichContent.svelte';
+  import Paradigm from './Paradigm.svelte';
   export let chapter;
   export let activity;
 
@@ -70,23 +74,57 @@
   }
 
   $: current = questions[qIndex];
-  $: staticOptions = Array.isArray(activity.optionValues);
-  $: wideOptions = !staticOptions || optionClass === 'wide';
+  // An item may carry its OWN option set (5D: the six verb-family
+  // translations, the three Greek forms) — item-level first, activity-level
+  // as the fallback.
+  $: currentOptions = (current && current.options) || options;
+  $: authoredOptions = !!activity.optionsPerItem || Array.isArray(activity.optionValues);
+  // Four-up unless the labels are GREEK WORDS. The English-to-Greek vocabulary
+  // drills put ten polytonic words in a four-column grid, which needs ~33px
+  // more than a 320px screen has; overflow-x is hidden app-wide, so the ends
+  // of the longest words were being cut off in silence rather than wrapping
+  // (measured on ch1, ch2 and ch3 — it predates this cohort and the same
+  // expression is in the shipped build). The 24-letter grids keep their four
+  // columns because their generator declares optionClass 'wide' explicitly:
+  // single glyphs, no width problem.
+  $: wideOptions = optionClass === 'wide' || (!authoredOptions && !greekOptions);
+  // optionGroups ([3,3]) splits the option list into visually separated
+  // stacks, as the original's Parsing drill does. Groups stack vertically at
+  // phone width and sit side by side once there is room (the six full parsing
+  // labels are 46 characters — two columns inside 320px would be unreadable).
+  $: optionGroups = optionClass === 'grouped' ? sliceGroups(currentOptions, activity.optionGroups) : null;
+  $: greekOptions = !!activity.optionsAreGreek || activity.options === 'greek' || activity.generator?.options === 'lower';
   $: uiButtons = activity.ui?.buttons || [];
-  $: showPronounce = !staticOptions || uiButtons.includes('Pronounce');
+  $: showPronounce = !authoredOptions || uiButtons.includes('Pronounce');
   $: showStepper = uiButtons.includes('Previous') || uiButtons.includes('Next');
   $: showTranslate = uiButtons.includes('Translate');
-  $: showPronounceEach = !staticOptions || !!activity.ui?.checkboxes?.includes('Pronounce Each Drill');
+  $: showPronounceEach = !authoredOptions || !!activity.ui?.checkboxes?.includes('Pronounce Each Drill');
+  // A hint either carries its own blocks (chapter 2's inline charts, rendered
+  // below the card) or NAMES a chart the chapter already draws — chapter 3's
+  // three verb drills all open the λύω paradigm, which the original shows as a
+  // popup, so a hintRef opens a modal.
   $: hintBlocks = resolveHintBlocks(chapter, activity.hint);
-  $: showHintButton = hintBlocks.length > 0;
+  $: hintChart = activity.ui?.hintRef ? resolveHintRef(chapter, activity.ui.hintRef) : null;
+  $: showHintButton = hintBlocks.length > 0 || !!hintChart;
   // Grouped button block (the original stacks them two-up) once there are more
   // than the chapter-1 pair.
   $: groupedControls = 1 + (showPronounce ? 1 : 0) + (showStepper ? 2 : 0)
     + (showTranslate ? 1 : 0) + (showHintButton ? 1 : 0) > 3;
-  // One-attempt drills finalize on the option tap; retry drills keep the loop.
-  $: oneAttempt = activity.answerPolicy?.attemptsPerItem === 1;
-  $: autoAdvanceMs = activity.answerPolicy?.autoAdvanceMs ?? null;
-  $: waitOnIncorrect = activity.answerPolicy?.autoAdvanceOnIncorrect === false;
+  // Timing and advance semantics: declared by the data, resolved centrally.
+  $: advancePolicy = resolveAdvance(activity.answerPolicy);
+  $: oneAttempt = advancePolicy.oneAttempt;
+  // The "Click Next to continue" state: the item is final, wrong, and nothing
+  // is going to move on its own.
+  $: waitingForNext = answered && oneAttempt && !advancePolicy.autoOnIncorrect
+    && picked !== null && picked !== current?.answerId;
+
+  function sliceGroups(list, sizes) {
+    const groups = [];
+    let at = 0;
+    for (const size of sizes || []) { groups.push(list.slice(at, at + size)); at += size; }
+    if (at < list.length) groups.push(list.slice(at));   // never drop an option
+    return groups;
+  }
   // 2c: the original's full-width "only one syllable" bar under the word. In
   // this drill it answers "1" -- the same value as the first number tile.
   $: oneSyllableOption = activity.oneSyllableButton
@@ -120,6 +158,8 @@
 
   function maybePronounce() {
     const q = questions[qIndex];
+    // Prompt audio only. A drill whose ANSWER is the Greek (Greek Verb Drill)
+    // has no prompt clip, and speaking the answer here would hand it over.
     if (pronounceEach && q && !q.pending && q.promptAudio) play(q.promptAudio);
   }
 
@@ -132,6 +172,8 @@
     if (right) correct += 1;
     feedback = randomFeedback(chapter, right ? 'correct' : 'incorrect');
     feedbackKind = right ? 'ok' : 'bad';
+    // English-prompt / Greek-answer drills speak the answer once it is won.
+    if (right && pronounceEach && current.answerAudio) play(current.answerAudio);
     if (right || oneAttempt) {
       // One attempt: the item is done either way and the answer is revealed.
       answered = true;
@@ -140,7 +182,10 @@
       // it is ANSWERED. Route exit cancels the timer, not progress.
       if (oneAttempt && attemptedItems.size === questions.length && activity.id) markCompleted(activity.id);
       clearTimeout(advanceTimer);
-      if (right || !waitOnIncorrect) advanceTimer = setTimeout(advance, autoAdvanceMs ?? 900);
+      if (right) advanceTimer = setTimeout(advance, advancePolicy.correctMs);
+      else if (advancePolicy.autoOnIncorrect) advanceTimer = setTimeout(advance, advancePolicy.incorrectMs);
+      // manualOnIncorrect: nothing is scheduled — the options are locked and
+      // the learner reads the revealed answer until they press Next.
     }
   }
 
@@ -191,6 +236,8 @@
   onDestroy(() => clearTimeout(advanceTimer));
 </script>
 
+<svelte:window on:keydown={showHint ? (e) => { if (e.key === 'Escape') showHint = false; } : null} />
+
 <div class="card">
   {#if finished}
     <div class="scorebox" style="font-size:1.2rem; padding: 20px 0">
@@ -221,11 +268,13 @@
     {:else}
       <div class="prompt" class:greek={promptIsGreek}>{current.prompt}</div>
     {/if}
+    <!-- The scripture citation the original prints beside the drill word. -->
+    {#if current.citation}<div class="prompt-citation">{current.citation}</div>{/if}
     {#if current.pending}
       <div class="pending-verification" role="status">This activity item is pending content verification.</div>
     {:else}
       <!-- Translate: the original's gloss line under the word, on demand. -->
-      {#if showGloss && current.gloss}<div class="gloss-line">{current.gloss}</div>{/if}
+      {#if showGloss && (current.translate || current.gloss)}<div class="gloss-line">{current.translate || current.gloss}</div>{/if}
       <!-- Reveal on a finalized item: the gloss, and the properly accented
            form the Accent Rule drill's misaccented prompt should have had. -->
       {#if answered && (current.gloss || current.correctForm)}
@@ -235,19 +284,44 @@
         </div>
       {/if}
       <div class="feedback {feedbackKind}">{feedback}</div>
-      <div class="grid options" class:wide={wideOptions} class:single={optionClass === 'single'}>
-        {#each options as opt}
-          <button
-            class="tile small"
-            class:greek={activity.options === 'greek' || activity.generator?.options === 'lower'}
-            class:selected={staticOptions && picked === opt.id}
-            class:correct={answered && opt.id === current.answerId}
-            class:incorrect={!staticOptions && picked === opt.id && opt.id !== current.answerId}
-            on:click={() => choose(opt)}>
-            {opt.label}
-          </button>
-        {/each}
-      </div>
+      {#if optionGroups}
+        <!-- Parsing drill: two separated stacks, as the original draws them. -->
+        <div class="option-groups">
+          {#each optionGroups as group}
+            <div class="grid options single option-group">
+              {#each group as opt}
+                <button
+                  class="tile small"
+                  class:greek={greekOptions}
+                  class:selected={authoredOptions && picked === opt.id}
+                  class:correct={answered && opt.id === current.answerId}
+                  class:incorrect={!authoredOptions && picked === opt.id && opt.id !== current.answerId}
+                  on:click={() => choose(opt)}>
+                  {opt.label}
+                </button>
+              {/each}
+            </div>
+          {/each}
+        </div>
+      {:else}
+        <div class="grid options" class:wide={wideOptions} class:single={optionClass === 'single'}>
+          {#each currentOptions as opt}
+            <button
+              class="tile small"
+              class:greek={greekOptions}
+              class:selected={authoredOptions && picked === opt.id}
+              class:correct={answered && opt.id === current.answerId}
+              class:incorrect={!authoredOptions && picked === opt.id && opt.id !== current.answerId}
+              on:click={() => choose(opt)}>
+              {opt.label}
+            </button>
+          {/each}
+        </div>
+      {/if}
+      <!-- One attempt, wrong, nothing auto-advancing: say so rather than
+           leaving a locked grid with no explanation (advanceClass
+           manualOnIncorrect). The sequential rail's Next works too. -->
+      {#if waitingForNext}<div class="await-next" role="status">Click Next to continue</div>{/if}
       {#if oneSyllableOption}
         <button
           class="one-syllable-bar"
@@ -264,10 +338,14 @@
         <button class="btn secondary" disabled={qIndex >= questions.length - 1} on:click={() => move(1)}>Next</button>
       {/if}
       {#if showPronounce}
-        <button class="btn" disabled={!current.promptAudio} on:click={() => current.promptAudio && play(current.promptAudio)}>Pronounce</button>
+        <!-- Speaks the prompt where the prompt is the Greek; on the Greek Verb
+             Drill (English prompt) it speaks the answer form, which is what
+             the original's Pronounce does there. -->
+        {@const say = current.promptAudio || current.answerAudio}
+        <button class="btn" disabled={!say} on:click={() => say && play(say)}>Pronounce</button>
       {/if}
       {#if showTranslate}
-        <button class="btn secondary" disabled={!current.gloss} on:click={() => (showGloss = !showGloss)}>Translate</button>
+        <button class="btn secondary" disabled={!(current.translate || current.gloss)} on:click={() => (showGloss = !showGloss)}>Translate</button>
       {/if}
       {#if showHintButton}
         <button class="btn secondary" on:click={() => (showHint = !showHint)}>Hint</button>
@@ -286,7 +364,18 @@
   {/if}
 </div>
 
-{#if showHint && hintBlocks.length}
+{#if showHint && hintChart}
+  <!-- The original's Hint POPUP: the chapter's paradigm chart over the drill. -->
+  <div class="modal-overlay" on:click|self={() => (showHint = false)} role="presentation">
+    <div class="modal hint-modal" role="dialog" aria-modal="true" aria-label="Hint">
+      <Paradigm paradigm={hintChart} title={hintChart.title} />
+      <div class="modal-actions">
+        <!-- svelte-ignore a11y-autofocus -->
+        <button class="btn" autofocus on:click={() => (showHint = false)}>Close</button>
+      </div>
+    </div>
+  </div>
+{:else if showHint && hintBlocks.length}
   <div class="card">
     <RichContent blocks={hintBlocks} />
   </div>
diff --git a/src/components/SpellActivity.svelte b/src/components/SpellActivity.svelte
index 30a54e7..2c8d734 100644
--- a/src/components/SpellActivity.svelte
+++ b/src/components/SpellActivity.svelte
@@ -1,40 +1,35 @@
 <script>
-  // Vocabulary Spelling Exercise. English meaning is shown; the student spells
-  // the Greek word using the on-screen tile keyboard or a physical keyboard
-  // (legacy roman->Greek layout). Diacritic tiles combine onto the previous
-  // character and NFC-normalize. Grading honors the "With Accents" toggle.
+  // Word Spelling Exercise (Vocabulary, and from chapter 3 the Present Active
+  // Verb speller). English meaning is shown; the student spells the Greek word
+  // using the shared tile keyboard or a physical keyboard (legacy roman->Greek
+  // layout). Diacritic tiles combine onto the previous character and
+  // NFC-normalize. Grading honors the "With Accents" toggle and otherwise
+  // follows the one shared policy in lib/answer-check.js.
   import { onMount, onDestroy } from 'svelte';
-  import { getSpellerTiles, getLemma, randomFeedback } from '../lib/content.js';
+  import { getLemma, randomFeedback } from '../lib/content.js';
   import { play } from '../lib/audio.js';
   import { markCompleted } from '../lib/progress.js';
+  import { spellingMatches } from '../lib/answer-check.js';
+  import { ADVANCE_CORRECT_MS } from '../lib/timing.js';
+  import SpellerKeyboard, { KEYMAP, PUNCT_KEYS } from './SpellerKeyboard.svelte';
   export let chapter;
   export let activity;
 
+  // Two item shapes. {ref} looks the word up in the chapter's lexicon (the
+  // vocabulary spellers); {gloss, greek, audio} carries it inline (chapter 3's
+  // verb speller, whose 27 inflected forms are not lexicon lemmas).
   const words = (activity.items || []).map(it => {
+    if (it.greek) return { ref: null, greek: it.greek, gloss: it.gloss || '', audio: it.audio || null };
     const l = getLemma(it.ref, chapter.id, it.pool) || {};
     return { ref: it.ref, greek: l.greek || '', gloss: l.gloss || '', audio: l.audio || null };
   });
 
-  // Tile keyboard uses the static `speller-tiles.json` contract: the
-  // authoritative 39-tile inventory has 25 letters + 11 diacritic marks + 3
-  // iota-subscript composites). Each diacritic's `apply` is the combining
-  // sequence appended to the previous character before NFC normalization.
-  // Falls back to a minimal derived inventory if the data ever lacks it.
-  const tiles = activity.spellerTiles
-    || (activity.spellerTilesRef ? getSpellerTiles(activity.spellerTilesRef) : {});
+  // The tile keyboard is a shared component reading the shared
+  // speller-tiles.json contract. Chapter 1's inline copy is handed over only
+  // as a last-resort fallback — see SpellerKeyboard for why it must not win.
   const fallbackLetters = chapter.alphabet && chapter.alphabet.letters
     ? chapter.alphabet.letters.map(l => (l.lower === 'σ/ς' ? 'σ' : l.lower))
     : [];
-  const letterTiles = tiles.letters || fallbackLetters;
-  const diacriticTiles = tiles.diacritics || [];
-  const compositeTiles = tiles.composites || ['ᾳ', 'ῃ', 'ῳ'];
-
-  // Physical keyboard: legacy roman->Greek layout (font-map _keyboard_layout_note).
-  const KEYMAP = {
-    a: 'α', b: 'β', g: 'γ', d: 'δ', e: 'ε', z: 'ζ', h: 'η', q: 'θ', i: 'ι',
-    k: 'κ', l: 'λ', m: 'μ', n: 'ν', c: 'ξ', o: 'ο', p: 'π', r: 'ρ', s: 'σ',
-    t: 'τ', u: 'υ', f: 'φ', x: 'χ', y: 'ψ', w: 'ω', j: 'ς'
-  };
 
   let wordIndex = 0;
   let built = '';
@@ -70,15 +65,15 @@
   }
   function clearInput() { built = ''; }
 
-  function stripAccents(s) {
-    return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/ς/g, 'σ');
-  }
-
   function check() {
     if (!word) return;
-    const ok = withAccents
-      ? built.normalize('NFC') === word.greek.normalize('NFC')
-      : stripAccents(built) === stripAccents(word.greek);
+    // One shared policy (Phase 0): "With Accents" ON requires every mark to be
+    // right; case, punctuation and the movable nu stay lenient either way.
+    const ok = spellingMatches(built, word.greek, {
+      withAccents,
+      punctuationOptional: activity.punctuationOptional !== false,
+      movableNu: activity.movableNu !== false
+    });
     totalAttempts += 1;
     if (ok) {
       totalCorrect += 1;
@@ -87,7 +82,7 @@
       feedbackKind = 'ok';
       if (completedWords.size === words.length) markCompleted(activity.id);
       clearTimeout(advanceTimer);
-      advanceTimer = setTimeout(() => goNext(), 900);
+      advanceTimer = setTimeout(() => goNext(), ADVANCE_CORRECT_MS);
     } else {
       feedback = randomFeedback(chapter, 'incorrect');
       feedbackKind = 'bad';
@@ -122,6 +117,8 @@
     if (e.metaKey || e.ctrlKey || e.altKey) return;
     if (e.key === 'Backspace') { e.preventDefault(); backspace(); return; }
     if (e.key === 'Enter') { e.preventDefault(); check(); return; }
+    // Space would scroll the page, so it is claimed here as well as mapped.
+    if (PUNCT_KEYS[e.key]) { e.preventDefault(); appendChar(PUNCT_KEYS[e.key]); return; }
     const g = KEYMAP[e.key.toLowerCase()];
     if (g) { e.preventDefault(); appendChar(g); }
   }
@@ -154,26 +151,16 @@
     <label><input type="checkbox" bind:checked={pronounceEach} /> Pronounce Each Exercise</label>
   </div>
 
-  <!-- Tile keyboard -->
-  <div class="tile-keyboard">
-    <div class="tk-letters">
-      {#each letterTiles as ch}
-        <button class="tk-key greek" on:click={() => appendChar(ch)}>{ch}</button>
-      {/each}
-    </div>
-    <div class="tk-marks">
-      {#each diacriticTiles as d}
-        <button class="tk-key mark" title={d.name} on:click={() => appendMark(d.apply)}>{d.label}</button>
-      {/each}
-      {#each compositeTiles as ch}
-        <button class="tk-key greek" on:click={() => appendChar(ch)}>{ch}</button>
-      {/each}
-    </div>
-    <div class="tk-edit">
-      <button class="btn secondary" on:click={backspace}>⌫ Backspace</button>
-      <button class="btn secondary" on:click={clearInput}>Clear</button>
-    </div>
-  </div>
+  <!-- Tile keyboard: the one shared keyboard, app-wide (D-15). -->
+  <SpellerKeyboard
+    tilesRef={activity.spellerTilesRef}
+    inlineTiles={activity.spellerTiles}
+    {fallbackLetters}
+    bind:showHelp={showKeyboard}
+    on:insert={e => appendChar(e.detail)}
+    on:mark={e => appendMark(e.detail)}
+    on:backspace={backspace}
+    on:clear={clearInput} />
 
   {#if showAnswer}
     <div class="spell-answer"><span class="label">Answer</span> <span class="greek">{word ? word.greek : ''}</span></div>
@@ -190,18 +177,3 @@
   {/if}
 </div>
 
-{#if showKeyboard}
-  <div class="modal-overlay">
-    <div class="modal kb-ref" role="dialog" aria-label="Greek keyboard reference">
-      <h2 class="modal-title">Greek Keyboard</h2>
-      <p class="modal-body">Type these keys to enter Greek letters:</p>
-      <div class="kb-grid">
-        {#each Object.entries(KEYMAP) as [k, g]}
-          <div class="kb-cell"><span class="kb-roman">{k}</span><span class="kb-greek greek">{g}</span></div>
-        {/each}
-      </div>
-      <p class="modal-note">Diacritics: use the mark tiles (they combine onto the previous letter). Enter = Check, Backspace = delete.</p>
-      <div class="modal-actions"><button class="btn" on:click={() => (showKeyboard = false)}>Close</button></div>
-    </div>
-  </div>
-{/if}
diff --git a/src/data/speller-tiles.json b/src/data/speller-tiles.json
index 3c86fa7..1b12496 100644
--- a/src/data/speller-tiles.json
+++ b/src/data/speller-tiles.json
@@ -88,5 +88,33 @@
     "ῃ",
     "ῳ"
   ],
-  "_source": "C1 finalized from speller close-up photo (2026-07-17): tile rows are the 24 lowercase letters, then final sigma + 3 single accents + 2 breathings + 1 combo, then 5 more breathing+accent combos + the 3 iota-subscript composites. Inventory = 25 letters + 11 marks + 3 composites (39 tiles). All six breathing+accent combinations exist (incl. rough+grave and smooth+grave). On-screen arrangement is the app's own; this inventory is the contract. Diacritic 'apply' = combining sequence appended to the previous character, then NFC-normalize."
+  "punctuation": [
+    {
+      "name": "comma",
+      "label": ",",
+      "insert": ","
+    },
+    {
+      "name": "raised dot",
+      "label": "·",
+      "insert": "·"
+    },
+    {
+      "name": "period",
+      "label": ".",
+      "insert": "."
+    },
+    {
+      "name": "question mark",
+      "label": ";",
+      "insert": ";"
+    }
+  ],
+  "space": {
+    "name": "space",
+    "label": "space",
+    "insert": " "
+  },
+  "_source": "C1 finalized from speller close-up photo (2026-07-17): tile rows are the 24 lowercase letters, then final sigma + 3 single accents + 2 breathings + 1 combo, then 5 more breathing+accent combos + the 3 iota-subscript composites. Inventory = 25 letters + 11 marks + 3 composites (39 tiles). All six breathing+accent combinations exist (incl. rough+grave and smooth+grave). On-screen arrangement is the app's own; this inventory is the contract. Diacritic 'apply' = combining sequence appended to the previous character, then NFC-normalize.",
+  "_extension_5d": "5D Phase 0 (divergence log D-15, layout A chosen by Nathanael): one added bottom row of 4 punctuation keys + a space bar. The original on-screen keyboard has neither, and the chapter-3 Scripture Memory Spelling Exercise types a 14-word verse; chapter 6's Spell Greek Phrase needs the space too. Punctuation covers the Scripture Memory family through chapter 8 (comma, raised dot, period) plus the Greek question mark. NO CAPITALS and no shift layer: the checking policy folds case under both 'With Accents' settings instead. The question-mark tile inserts U+003B, which is what U+037E normalizes to under NFC. This file is the SHARED contract for every spell surface app-wide; SpellActivity reads it in preference to any inline activity.spellerTiles copy so a chapter cannot fork the keyboard."
 }
diff --git a/src/lib/content.js b/src/lib/content.js
index b0ad50e..bea95b8 100644
--- a/src/lib/content.js
+++ b/src/lib/content.js
@@ -270,9 +270,33 @@ export function resolveItems(chapter, activity) {
                audio: item.audio || null, meta: item };
     });
   }
+  // 5D convention: instead of spelling out ten {ref} items, an activity names
+  // a lexicon BUCKET (pool: "lemmas") and the chapter's own vocab list
+  // supplies the refs. Same resolved shape, so flashcard and reviewVocab are
+  // untouched.
+  if (activity.pool || (activity.promptFrom && activity.promptFrom.lexicon)) {
+    return lemmaPool(chapter, activity).map(lemma => ({
+      display: lemma.greek, secondary: stripMarkup(lemma.gloss), audio: lemma.audio, meta: lemma
+    }));
+  }
   return [];
 }
 
+// The lemma list a vocabulary surface works over: either an explicit items
+// array (chapters 1-2) or a named lexicon bucket over the chapter's vocab
+// refs (chapter 3 onward). Both yield { ref, ...lemma } records.
+function lemmaPool(chapter, activity) {
+  if (Array.isArray(activity.items) && activity.items.length) {
+    return activity.items.map(item => {
+      const ref = typeof item === 'string' ? item : item.ref;
+      const pool = typeof item === 'string' ? null : item.pool;
+      return { ref, ...(getLemma(ref, chapter.id, pool) || {}) };
+    });
+  }
+  const bucket = activity.pool || (activity.promptFrom && activity.promptFrom.lexicon) || 'lemmas';
+  return (chapter.vocab || []).map(ref => ({ ref, ...(getLemma(ref, chapter.id, bucket) || {}) }));
+}
+
 function pickDisplay(letter, mode) {
   switch (mode) {
     case 'upper': return letter.upper;
@@ -319,53 +343,74 @@ export function buildSelectQuestions(chapter, activity) {
     return { options, questions, optionClass: 'wide', promptIsGreek: promptField === 'lower' || promptField === 'upper' };
   }
 
-  // Static-option drills use authored optionValues rather than a lexicon-
-  // derived answer grid. Missing prompt/answer fields remain in the sequence
+  // AUTHORED-OPTION drills: the option set comes from the data rather than
+  // from a lexicon-derived answer grid. Two flavours share this branch —
+  // activity-level optionValues (one grid for the whole drill: chapter 2's
+  // four drills, chapter 3's Parsing and Scripture Memory drills) and
+  // PER-ITEM options (5D: the Verb Translating drill's six verb-family
+  // translations, the Greek Verb Drill's three Greek forms). An item's own
+  // optionValues/options win; the activity-level set is the fallback, so a
+  // drill may mix the two. Missing prompt/answer fields remain in the sequence
   // as visible pending-verification questions instead of becoming bad answers.
-  if (Array.isArray(activity.optionValues)) {
+  if (activity.optionsPerItem || Array.isArray(activity.optionValues)) {
     const promptField = activity.promptFrom && activity.promptFrom.show;
-    const promptIsGreek = promptField === 'greek';
-    const options = activity.optionValues.map(value => ({ id: String(value), label: String(value) }));
+    // 5D: an activity may DECLARE its prompt side rather than implying it via
+    // promptFrom (the ch3 drills have no promptFrom — their prompts are inline
+    // on the items). Same Greek-tap contract either way: declared, never
+    // guessed from the glyphs.
+    const promptIsGreek = activity.promptIsGreek != null ? !!activity.promptIsGreek : promptField === 'greek';
+    const toOptions = values => (values || []).map(value => ({ id: String(value), label: String(value) }));
+    const options = toOptions(activity.optionValues);
     const questions = shuffle((activity.items || []).map(item => {
       const lemma = item.ref ? getLemma(item.ref, chapter.id, item.pool) : null;
       const prompt = promptField === 'sentence'
         ? item.sentence
-        : promptField === 'greek'
+        : promptIsGreek
           ? (item.greek || (lemma && lemma.greek))
-          : item[promptField];
+          : (item.prompt != null ? item.prompt : (promptField ? item[promptField] : undefined));
       const needsUnderline = promptField === 'sentence' && !item.underline;
+      const itemOptions = item.optionValues || item.options;
       return {
         prompt: stripMarkup(prompt) || '',
         promptAudio: promptIsGreek ? (item.promptAudio || item.audio || (lemma && lemma.audio) || null) : null,
+        // The answer's OWN clip, for surfaces where Pronounce speaks the
+        // answer rather than the prompt (Greek Verb Drill: English prompt,
+        // Greek answer). Never played before the item is finalized.
+        answerAudio: promptIsGreek ? null : (item.audio || null),
         answerId: item.answer == null ? null : String(item.answer),
+        options: itemOptions ? toOptions(itemOptions) : null,
         underline: stripMarkup(item.underline) || null,
+        // `ref` is overloaded in the data: chapter 2's syllable drill uses it
+        // as a LEXICON key, chapter 3's drills as a scripture citation to
+        // print beside the prompt. Whether it resolved to a lemma is the
+        // discriminator — no id-keyed special case needed.
+        citation: !lemma && item.ref ? item.ref : null,
         // Revealed once the item is finalized (one-attempt drills): the gloss,
         // the properly accented form (Accent Rule), and which grapheme cluster
         // carries the mark being asked about (Marking Recognition).
         gloss: stripMarkup(item.gloss || (lemma && (lemma.glossShort || lemma.gloss))) || null,
+        // 5D: what the Translate button reveals under the prompt. Distinct
+        // from `gloss`, which chapter 2's one-attempt drills reveal on their
+        // own once an item is answered — a translation is shown on request.
+        translate: stripMarkup(item.translate) || null,
         correctForm: item.correctForm || null,
         redMarkCluster: item.redMarkCluster || null,
         pending: !prompt || item.answer == null || needsUnderline
       };
     }));
-    // Option-grid density follows label length: number tiles four-up, short
-    // names two-up, and the Accent Rule's full sentences one per row (the
-    // original stacks those full width; two-up clips nothing but reads badly
-    // at 320px).
-    const longest = options.reduce((n, option) => Math.max(n, option.label.length), 0);
-    const optionClass = longest <= 8 ? 'wide' : longest > 24 ? 'single' : '';
-    return { options, questions, optionClass, promptIsGreek };
+    return { options, questions, optionClass: optionClassFor(activity, options, questions), promptIsGreek };
   }
 
-  // items-based (vocabulary drills): options are the full lemma set. Both
-  // drills show the SHORT gloss ("truly, verily", "and, even", "Christ");
-  // the full gloss + ntFreq is reserved for the Review Vocabulary Chart.
-  const lemmas = (activity.items || []).map(item => {
-    const ref = typeof item === 'string' ? item : item.ref;
-    const pool = typeof item === 'string' ? null : item.pool;
-    return { ref, ...(getLemma(ref, chapter.id, pool) || {}) };
-  });
-  const promptSide = activity.prompt === 'greek' ? 'greek' : 'gloss';
+  // Vocabulary drills: options are the full lemma set. Both drills show the
+  // SHORT gloss ("truly, verily", "and, even", "Christ"); the full gloss +
+  // ntFreq is reserved for the Review Vocabulary Chart.
+  const lemmas = lemmaPool(chapter, activity);
+  // Chapters 1-2 declare the prompt side with `prompt`; chapter 3 declares it
+  // as promptFrom.show. Either way it is DECLARED — the Greek-tap rule may
+  // never be inferred from the glyphs (P6-P9).
+  const promptSide = activity.prompt
+    ? (activity.prompt === 'greek' ? 'greek' : 'gloss')
+    : ((activity.promptFrom && activity.promptFrom.show) === 'greek' ? 'greek' : 'gloss');
   const optionSide = promptSide === 'greek' ? 'gloss' : 'greek';
   const label = (l, side) => (side === 'gloss' ? (l.glossShort || l.gloss) : l.greek);
   const options = lemmas.map(l => ({ id: l.ref, label: label(l, optionSide) }));
@@ -379,6 +424,45 @@ export function buildSelectQuestions(chapter, activity) {
   return { options, questions, optionClass: '', promptIsGreek: promptSide === 'greek' };
 }
 
+// Option-grid density, from the data — never from the activity id.
+//   grouped  the drill declares optionGroups ([3,3]); the component lays the
+//            groups out as separate stacks (ch3 Parsing).
+//   single   labels too long for two columns (ch2's Accent Rule sentences,
+//            ch3's six full parsings), or a per-item GREEK option set, which
+//            the original stacks (ch3 Greek Verb Drill's three forms).
+//   wide     four-up, for number/one-glyph tiles only (ch2 syllable counting).
+//   ''       the two-column default: ch2's mark and part-of-speech grids,
+//            ch3's 2x3 verb translations and 2x5 Scripture Memory grid.
+function optionClassFor(activity, activityOptions, questions) {
+  if (Array.isArray(activity.optionGroups) && activity.optionGroups.length) return 'grouped';
+  if (activity.optionsPerItem && activity.optionsAreGreek) return 'single';
+  const all = activityOptions.length
+    ? activityOptions
+    : questions.reduce((acc, q) => acc.concat(q.options || []), []);
+  const longest = all.reduce((n, option) => Math.max(n, option.label.length), 0);
+  if (longest > 24) return 'single';
+  return longest <= 3 ? 'wide' : '';
+}
+
+// A hintRef names a CHART TYPE that already exists in the chapter — chapter
+// 3's three verb drills all open the same λύω paradigm the Learn page draws
+// (the original's Hint popup). Resolving by block type keeps the hint from
+// duplicating, or inventing, authored content and stays mode-keyed: any later
+// chapter whose drills point at their own paradigm gets this for free.
+export function resolveHintRef(chapter, ref) {
+  if (!chapter || !ref) return null;
+  let found = null;
+  const walk = node => {
+    if (found || !node) return;
+    if (Array.isArray(node)) { node.forEach(walk); return; }
+    if (typeof node !== 'object') return;
+    if (node.type === ref) { found = node; return; }
+    for (const key of Object.keys(node)) walk(node[key]);
+  };
+  for (const section of SECTIONS) walk(chapter[section]);
+  return found;
+}
+
 // An activity's Hint either carries its own blocks or REFERS to a chart that
 // already exists elsewhere in the chapter (the Syllable Counting drill and the
 // Division exercise both open the Three Syllable Rules). Resolving the
```

## 4. New files (full contents)

### src/lib/timing.js

```
// ADVANCE TIMING — the single source (5D-SPEC "Timing and advance semantics",
// divergence log D-14). No component and no activity carries its own timing
// number: a surface declares WHAT it does (answerPolicy.advanceClass) and this
// module says HOW LONG it waits. Nathanael retunes the feel by editing the two
// constants here, once, for the whole app.
//
// The original's per-surface waits were ~2s on correct and ~4s on incorrect.
// Both read slow on device (5B), so the port ships the numbers below; the
// SEMANTICS (which surfaces auto-advance, and on which outcome) stay faithful.

export const ADVANCE_CORRECT_MS = 900;
export const ADVANCE_INCORRECT_MS = 2500;

// The three advance classes (D-14 matrix):
//   retry             attempts until correct; correct auto-advances, a wrong
//                     answer leaves the item open (ch1 drills, ch2 syllable
//                     counting and accent rule)
//   manualOnIncorrect one attempt; correct auto-advances, incorrect reveals
//                     the answer, locks the options and waits for Next
//                     (ch3's three verb drills + both vocab drills)
//   autoBoth          one attempt; both outcomes auto-advance, incorrect on
//                     the longer wait (ch3 Scripture Memory Drill)
//
// Chapter 2 predates advanceClass and declares its policy with the older
// attemptsPerItem / autoAdvanceMs / autoAdvanceOnIncorrect fields. Those map
// onto exactly the same three classes and an explicit autoAdvanceMs still
// wins, so ch2's shipped ~4s feel is unchanged until it is retuned at its next
// touch (D-14).
export function resolveAdvance(policy) {
  const p = policy || {};
  const advanceClass = p.advanceClass || (
    p.attemptsPerItem === 1
      ? (p.autoAdvanceOnIncorrect === false ? 'manualOnIncorrect' : 'autoBoth')
      : 'retry'
  );
  // `?? ` and not `||`: chapter 2 writes autoAdvanceMs: null to mean "the
  // default", which is what the components did with it before this module.
  const correctMs = p.autoAdvanceMs ?? ADVANCE_CORRECT_MS;
  return {
    advanceClass,
    oneAttempt: advanceClass !== 'retry',
    autoOnIncorrect: advanceClass === 'autoBoth',
    correctMs,
    incorrectMs: p.autoAdvanceMs ?? ADVANCE_INCORRECT_MS
  };
}
```

### src/lib/answer-check.js

```
// SPELLING COMPARISON — shared by the word speller (SpellActivity) and the
// whole-verse speller (SpellVerseActivity), so the two can never drift.
//
// The policy is the one Nathanael selected at the 5D Phase 0 checkpoint:
//
//   With Accents OFF   accent/breathing/subscript-insensitive, case-
//                      insensitive, final sigma = sigma, punctuation
//                      optional, movable nu optional, whitespace normalized.
//   With Accents ON    every mark must be exactly right — and nothing else
//                      changes: still case-insensitive, still punctuation-
//                      optional, still movable-nu lenient.
//
// CASE IS NEVER REQUIRED, under either toggle, because the shared keyboard
// has no capitals and the Phase 0 decision was to keep it that way rather
// than add a shift layer. That is not only a chapter-3 concern: chapter 1's
// Χριστός and chapter 2's Π-/Φ- items have shipped since their cohorts with
// no way to type their capital, so "With Accents" ON was unwinnable on them.
// Folding case fixes those retroactively.

// Punctuation the checker may drop: the marks that appear in (or plausibly
// appear in) a Scripture Memory verse. U+0387 GREEK ANO TELEIA and U+00B7
// MIDDLE DOT are the same mark spelled two ways; NFC maps the former onto the
// latter, so both are listed for input typed before normalization.
const PUNCTUATION = /[.,;:!?'"()\[\]··;᾽’ʼ‘“”«»—–-]/gu;

export function stripPunctuation(text) {
  return (text || '').replace(PUNCTUATION, '');
}

// MOVABLE NU (divergence log D-16). Scoped deliberately to -σι(ν): that is the
// 3rd-plural case D-16 authorizes and the only one the chapter-3 data flags.
// The chapter text also mentions words ending in ε, but a blanket -ε(ν) fold
// would swallow the real 1st-plural ending: λύομεν would collapse to λύομε and
// the drill would accept a genuinely wrong form.
function foldMovableNu(word) {
  return word.replace(/σιν$/u, 'σι');
}

// One comparison key. Two spellings match iff their keys are equal.
export function spellingKey(text, options) {
  const {
    withAccents = false,
    punctuationOptional = true,
    movableNu = true
  } = options || {};
  let out = (text || '').normalize('NFC');
  if (punctuationOptional) out = stripPunctuation(out);
  out = out.replace(/\s+/gu, ' ').trim().toLowerCase();
  if (!withAccents) out = out.normalize('NFD').replace(/\p{M}/gu, '');
  out = out.replace(/ς/gu, 'σ').normalize('NFC');
  if (movableNu) out = out.split(' ').map(foldMovableNu).join(' ');
  return out;
}

export function spellingMatches(typed, answer, options) {
  return spellingKey(typed, options) === spellingKey(answer, options);
}

// Whole-verse comparison, word by word (spellVerse). Returns the index of the
// FIRST word that is wrong or missing, plus what was expected there — the
// component names that word rather than printing a bare index (D-13).
// A trailing run of extra typed words reports at answerWords.length.
export function checkVerse(typed, answerWords, options) {
  const expected = (answerWords || []).map(w => spellingKey(w, options));
  const got = spellingKey(typed, options).split(' ').filter(Boolean);
  for (let i = 0; i < expected.length; i++) {
    if (got[i] !== expected[i]) {
      return { ok: false, index: i, expected: answerWords[i], typed: got[i] || null };
    }
  }
  if (got.length > expected.length) {
    return { ok: false, index: expected.length, expected: null, typed: got[expected.length] };
  }
  return { ok: true, index: -1, expected: null, typed: null };
}
```

### src/components/Paradigm.svelte

```
<script>
  // PARADIGM CHART (5D). One renderer, three hosts: a `paradigm` RichContent
  // block inside a Learn topic, the full-page `paradigmChart` contentAudio
  // mode in Quick Review, and the Hint popup on the three chapter-3 verb
  // drills. The original draws all three from the same chart, so the port does
  // too — nothing here is keyed to an activity id.
  //
  // Layout follows the original: a numbered person column, one column per
  // number (Singular / Plural), each cell a Greek form over its gloss, and the
  // Say Whole Paradigm / Endings buttons INSIDE the chart frame.
  //
  // Greek-tap rule: every Greek cell and the lemma are tappable and play their
  // own clip. The ENDINGS rows are bare morphemes with no clips of their own,
  // so they render in ink rather than the tappable blue — the same exception
  // the chapter's "Stem + Pronominal ending" line takes (logged in the data's
  // _note).
  import { play } from '../lib/audio.js';
  export let paradigm;
  export let title = null;

  let endingsOpen = false;
  $: columns = paradigm.columns || [];
  $: rows = paradigm.rows || [];
  // Endings rows are flat [ending, gloss, ending, gloss] tuples — one pair per
  // number column, so the popup lines up with the chart above it.
  $: endingRows = (paradigm.endings && paradigm.endings.rows) || [];

  function openEndings() {
    endingsOpen = true;
    // D-10: the original ships c_ending but its button plays nothing. Treated
    // as an original defect and restored — behind the tap, never on render.
    if (paradigm.endings && paradigm.endings.audio) play(paradigm.endings.audio);
  }
  function onKeydown(e) { if (e.key === 'Escape') endingsOpen = false; }
</script>

<svelte:window on:keydown={endingsOpen ? onKeydown : null} />

<div class="paradigm">
  {#if title}<div class="pg-title">{title}</div>{/if}

  {#if paradigm.lemma}
    <button class="pg-lemma" on:click={() => paradigm.lemma.audio && play(paradigm.lemma.audio)}>
      <span class="greek pg-lemma-greek">{paradigm.lemma.greek}</span>
      {#if paradigm.lemma.gloss}<span class="pg-lemma-gloss">{paradigm.lemma.gloss}</span>{/if}
    </button>
  {/if}

  <div class="pg-grid" style="--pg-cols:{columns.length}">
    {#if columns.length}
      <div class="pg-head">
        <span class="pg-person">&nbsp;</span>
        {#each columns as column}<span>{column}</span>{/each}
      </div>
    {/if}
    {#each rows as row}
      <div class="pg-row">
        <span class="pg-person">{row.person}</span>
        {#each row.cells as cell}
          <button class="pg-cell" disabled={!cell.audio} on:click={() => cell.audio && play(cell.audio)}>
            <span class="greek pg-greek">{cell.greek}</span>
            {#if cell.gloss}<span class="pg-gloss">{cell.gloss}</span>{/if}
          </button>
        {/each}
      </div>
    {/each}
  </div>

  {#if paradigm.sayWhole || paradigm.endings}
    <div class="pg-actions">
      {#if paradigm.sayWhole}
        <button class="btn secondary" on:click={() => play(paradigm.sayWhole.audio)}>{paradigm.sayWhole.label || 'Say Whole Paradigm'}</button>
      {/if}
      {#if paradigm.endings}
        <button class="btn secondary" on:click={openEndings}>{paradigm.endings.label || 'Endings'}</button>
      {/if}
    </div>
  {/if}
</div>

{#if endingsOpen}
  <div class="modal-overlay" on:click|self={() => (endingsOpen = false)} role="presentation">
    <div class="modal pg-endings" role="dialog" aria-modal="true" aria-label={paradigm.endings.label || 'Endings'}>
      <h2 class="modal-title">{paradigm.endings.label || 'Endings'}</h2>
      <div class="pg-endgrid">
        {#if columns.length === 2}
          <div class="pg-endhead"><span>{columns[0]}</span><span>{columns[1]}</span></div>
        {/if}
        {#each endingRows as row}
          <div class="pg-endrow">
            <span class="pg-endpair"><span class="greek pg-ending">{row[0]}</span><span class="pg-endgloss">{row[1]}</span></span>
            <span class="pg-endpair"><span class="greek pg-ending">{row[2]}</span><span class="pg-endgloss">{row[3]}</span></span>
          </div>
        {/each}
      </div>
      <div class="modal-actions">
        <!-- svelte-ignore a11y-autofocus -->
        <button class="btn" autofocus on:click={() => (endingsOpen = false)}>Close</button>
      </div>
    </div>
  </div>
{/if}
```

### src/components/SpellerKeyboard.svelte

```
<script context="module">
  // PHYSICAL KEYBOARD MAP (legacy roman->Greek layout, font-map
  // _keyboard_layout_note) plus the 5D punctuation keys. Exported so the tile
  // keyboard, the reference popup and every speller's keydown handler read one
  // table — the iPhone this app is built for has no physical keyboard at all,
  // so the TILES are the contract and this is the desktop convenience layer.
  export const KEYMAP = {
    a: 'α', b: 'β', g: 'γ', d: 'δ', e: 'ε', z: 'ζ', h: 'η', q: 'θ', i: 'ι',
    k: 'κ', l: 'λ', m: 'μ', n: 'ν', c: 'ξ', o: 'ο', p: 'π', r: 'ρ', s: 'σ',
    t: 'τ', u: 'υ', f: 'φ', x: 'χ', y: 'ψ', w: 'ω', j: 'ς'
  };
  // Keys that type themselves. Space is here because the whole-verse speller
  // needs word boundaries; the punctuation follows the tiles.
  export const PUNCT_KEYS = { ' ': ' ', ',': ',', '.': '.', ';': ';' };
</script>

<script>
  // THE SHARED SPELLER KEYBOARD (divergence log D-15). One keyboard for every
  // spell surface in the app: the chapter-1/2/3 word spellers and the
  // chapter-3 whole-verse speller all mount this component, so a layout change
  // lands everywhere at once and no chapter can fork it.
  //
  // Layout A, chosen by Nathanael at the 5D Phase 0 checkpoint: the shipped
  // letter and mark rows are untouched and ONE row is added at the bottom —
  // four punctuation keys and a space bar. Everything stays visible; there is
  // no paging, because a learner who never opens a "punctuation" page would
  // never discover that a space key exists.
  import { createEventDispatcher } from 'svelte';
  import { getSpellerTiles } from '../lib/content.js';

  export let tilesRef = null;
  export let fallbackLetters = [];
  export let showHelp = false;

  const dispatch = createEventDispatcher();

  // The SHARED contract wins over any inline activity.spellerTiles copy.
  // Chapter 1's data carries its own byte-identical duplicate of the 39 tiles,
  // and honouring that first would have left chapter 1 on the old keyboard —
  // exactly the per-chapter fork the spec rules out. The inline copy survives
  // only as the fallback if the shared file is ever unreachable.
  export let inlineTiles = null;
  $: tiles = getSpellerTiles(tilesRef) || inlineTiles || {};
  $: letterTiles = tiles.letters || (inlineTiles && inlineTiles.letters) || fallbackLetters;
  $: diacriticTiles = tiles.diacritics || (inlineTiles && inlineTiles.diacritics) || [];
  $: compositeTiles = tiles.composites || (inlineTiles && inlineTiles.composites) || ['ᾳ', 'ῃ', 'ῳ'];
  $: punctuationTiles = tiles.punctuation || [];
  $: spaceTile = tiles.space || null;
</script>

<div class="tile-keyboard">
  <div class="tk-letters">
    {#each letterTiles as ch}
      <button class="tk-key greek" on:click={() => dispatch('insert', ch)}>{ch}</button>
    {/each}
  </div>
  <div class="tk-marks">
    {#each diacriticTiles as d}
      <button class="tk-key mark" title={d.name} on:click={() => dispatch('mark', d.apply)}>{d.label}</button>
    {/each}
    {#each compositeTiles as ch}
      <button class="tk-key greek" on:click={() => dispatch('insert', ch)}>{ch}</button>
    {/each}
  </div>
  {#if punctuationTiles.length || spaceTile}
    <div class="tk-punct">
      {#each punctuationTiles as p}
        <button class="tk-key punct" title={p.name} on:click={() => dispatch('insert', p.insert)}>{p.label}</button>
      {/each}
      {#if spaceTile}
        <button class="tk-key tk-space" on:click={() => dispatch('insert', spaceTile.insert)}>{spaceTile.label}</button>
      {/if}
    </div>
  {/if}
  <div class="tk-edit">
    <button class="btn secondary" on:click={() => dispatch('backspace')}>⌫ Backspace</button>
    <button class="btn secondary" on:click={() => dispatch('clear')}>Clear</button>
  </div>
</div>

<svelte:window on:keydown={showHelp ? (e) => { if (e.key === 'Escape') showHelp = false; } : null} />

{#if showHelp}
  <div class="modal-overlay" on:click|self={() => (showHelp = false)} role="presentation">
    <div class="modal kb-ref" role="dialog" aria-modal="true" aria-label="Greek keyboard reference">
      <h2 class="modal-title">Greek Keyboard</h2>
      <p class="modal-body">Type these keys to enter Greek letters:</p>
      <div class="kb-grid">
        {#each Object.entries(KEYMAP) as [k, g]}
          <div class="kb-cell"><span class="kb-roman">{k}</span><span class="kb-greek greek">{g}</span></div>
        {/each}
      </div>
      <p class="modal-note">Diacritics: use the mark tiles (they combine onto the previous letter). Space, comma, period and ; type themselves. Enter = Check, Backspace = delete.</p>
      <div class="modal-actions">
        <!-- svelte-ignore a11y-autofocus -->
        <button class="btn" autofocus on:click={() => (showHelp = false)}>Close</button>
      </div>
    </div>
  </div>
{/if}
```

### src/components/SpellVerseActivity.svelte

```
<script>
  // SCRIPTURE MEMORY SPELLING EXERCISE (5D, activity type `spellVerse`).
  // The whole verse is typed as free text and graded word by word against
  // answerWords[] when Check Answer is pressed — one surface, not a
  // word-at-a-time stepper, exactly as the original.
  //
  // Three logged departures from the original live here:
  //   D-11  Major Hint (verse + translation) is ALWAYS available; the original
  //         hides the verse once typing begins.
  //   D-12  "Repeat This Exercise" is labelled "Restart Exercise".
  //   D-13  wrong/missing-word feedback names the WORD. The original prints a
  //         bare index ("The word you missed was: 2"), which tells a learner
  //         to go and count.
  // The keyboard it types on is the shared one (D-15): the same component the
  // word spellers mount, with the space bar and punctuation row Nathanael
  // selected at the Phase 0 checkpoint.
  import { onMount, onDestroy } from 'svelte';
  import { randomFeedback } from '../lib/content.js';
  import { play } from '../lib/audio.js';
  import { markCompleted } from '../lib/progress.js';
  import { checkVerse } from '../lib/answer-check.js';
  import SpellerKeyboard, { KEYMAP, PUNCT_KEYS } from './SpellerKeyboard.svelte';
  export let chapter;
  export let activity;

  $: answerWords = activity.answerWords || [];
  $: verseText = answerWords.join(' ');

  let built = '';
  let feedback = '';
  let feedbackKind = '';
  let detail = null;          // { text, word? } — the word renders in the Greek face
  let showHint = false;
  let showKeyboard = false;
  let withAccents = false;
  let solved = false;

  const fallbackLetters = chapter.alphabet && chapter.alphabet.letters
    ? chapter.alphabet.letters.map(l => (l.lower === 'σ/ς' ? 'σ' : l.lower))
    : [];

  function appendChar(ch) { if (!solved) built += ch; }
  function appendMark(apply) {
    if (solved || !built) return;                 // nothing to combine onto
    built = (built + apply).normalize('NFC');
  }
  function backspace() {
    if (solved || !built) return;
    // Drop a whole grapheme: strip trailing combining marks then the base.
    const nfd = built.normalize('NFD');
    let end = nfd.length;
    while (end > 0 && /\p{M}/u.test(nfd[end - 1])) end -= 1;
    if (end > 0) end -= 1;
    built = nfd.slice(0, end).normalize('NFC');
  }
  function clearInput() { if (!solved) built = ''; }

  function check() {
    const result = checkVerse(built, answerWords, {
      withAccents,
      punctuationOptional: activity.punctuationOptional !== false,
      movableNu: activity.movableNu !== false
    });
    if (result.ok) {
      solved = true;
      feedback = randomFeedback(chapter, 'correct');
      feedbackKind = 'ok';
      detail = null;
      markCompleted(activity.id);
      return;
    }
    feedback = randomFeedback(chapter, 'incorrect');
    feedbackKind = 'bad';
    // D-13: name the word, not its position.
    detail = result.expected
      ? { text: 'The word you missed was:', word: result.expected }
      : { text: 'There are more words here than the verse has.' };
  }

  function restart() {
    built = '';
    feedback = '';
    feedbackKind = '';
    detail = null;
    solved = false;
  }

  function onKey(e) {
    if (showKeyboard || showHint) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'Backspace') { e.preventDefault(); backspace(); return; }
    if (e.key === 'Enter') { e.preventDefault(); check(); return; }
    if (PUNCT_KEYS[e.key]) { e.preventDefault(); appendChar(PUNCT_KEYS[e.key]); return; }
    const g = KEYMAP[e.key.toLowerCase()];
    if (g) { e.preventDefault(); appendChar(g); }
  }
  onMount(() => window.addEventListener('keydown', onKey));
  onDestroy(() => window.removeEventListener('keydown', onKey));
</script>

<div class="card speller spellverse">
  {#if activity.reference}<div class="sv-ref">{activity.reference}</div>{/if}

  <div class="flash-pane">
    <div class="label">{activity.ui?.fields?.[0] || 'Spell Greek'}</div>
    <div class="value greek sv-target">{built}{#if !solved}<span class="caret">|</span>{/if}</div>
  </div>

  <div class="feedback {feedbackKind}">{feedback}</div>
  {#if detail}
    <div class="sv-detail" role="status">{detail.text}{#if detail.word}&nbsp;<span class="greek sv-word">{detail.word}</span>{/if}</div>
  {/if}

  <div class="controls grouped">
    <button class="btn secondary" on:click={() => (showHint = !showHint)}>Major Hint</button>
    <button class="btn" disabled={!activity.audio} on:click={() => activity.audio && play(activity.audio)}>Pronounce</button>
    <button class="btn" on:click={check}>Check Answer</button>
    <button class="btn secondary" on:click={() => (showKeyboard = true)}>Greek Keyboard</button>
    <button class="btn secondary" on:click={restart}>Restart Exercise</button>
  </div>

  <div class="spell-checks">
    <label><input type="checkbox" bind:checked={withAccents} /> With Accents</label>
  </div>

  {#if showHint}
    <!-- D-11: available at any time, typing started or not. -->
    <div class="sv-hint">
      <div class="label">{activity.reference || 'Verse'}</div>
      <div class="greek sv-verse">{verseText}</div>
      {#if activity.translation}<div class="sv-translation">{activity.translation}</div>{/if}
    </div>
  {/if}

  <SpellerKeyboard
    tilesRef={activity.spellerTilesRef}
    inlineTiles={activity.spellerTiles}
    {fallbackLetters}
    bind:showHelp={showKeyboard}
    on:insert={e => appendChar(e.detail)}
    on:mark={e => appendMark(e.detail)}
    on:backspace={backspace}
    on:clear={clearInput} />
</div>
```

### Test harnesses (scratchpad — not committed to the app tree)

#### keyscan.mjs

```js
// Phase 0 research: enumerate every character required to ANSWER any typing
// surface in chapters 1-3, and compare against the shipped speller inventory.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DATA = 'src/data';
const tiles = JSON.parse(readFileSync(join(DATA, 'speller-tiles.json'), 'utf8'));
const files = readdirSync(DATA).filter(n => /^chapt-\d+\.json$/.test(n)).sort();

// What the current keyboard can produce: letters, composites, and every
// letter+mark combination reachable by applying a diacritic tile.
const producible = new Set([...tiles.letters, ...tiles.composites]);
const marks = tiles.diacritics.map(d => d.apply);
for (const l of [...tiles.letters, ...tiles.composites]) {
  for (const m of marks) producible.add((l + m).normalize('NFC'));
}

const surfaces = [];
function walk(node, path, file) {
  if (Array.isArray(node)) { node.forEach((c, i) => walk(c, `${path}[${i}]`, file)); return; }
  if (!node || typeof node !== 'object') return;
  if (node.type === 'spell' || node.type === 'spellVerse') surfaces.push({ file, path, a: node });
  for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`, file);
}
for (const f of files) walk(JSON.parse(readFileSync(join(DATA, f), 'utf8')), f, f);

const lexFor = f => {
  const n = f.match(/chapt-(\d+)/)[1];
  for (const cand of [`lexicon-chapt${n}.json`, `lexicon-chapt-${n}.json`]) {
    try { return JSON.parse(readFileSync(join(DATA, cand), 'utf8')); } catch {}
  }
  return null;
};

const globalChars = new Map();   // char -> Set of surface ids
for (const s of surfaces) {
  const lex = lexFor(s.file);
  const answers = [];
  if (s.a.type === 'spellVerse') answers.push(...(s.a.answerWords || []));
  for (const it of s.a.items || []) {
    if (it.greek) answers.push(it.greek);
    else if (it.ref && lex) {
      for (const b of ['lemmas', 'exampleWords', 'ch1_lemma_mirror']) {
        if (lex[b] && lex[b][it.ref]) { answers.push(lex[b][it.ref].greek); break; }
      }
    }
  }
  const clusters = new Set();
  for (const a of answers) {
    for (const { segment } of new Intl.Segmenter('el', { granularity: 'grapheme' }).segment(a)) {
      clusters.add(segment.normalize('NFC'));
    }
  }
  const missing = [...clusters].filter(c => !producible.has(c));
  console.log(`\n${s.file} :: ${s.a.id} (${s.a.type}) — ${answers.length} answers, ${clusters.size} distinct clusters`);
  if (missing.length) {
    console.log(`  NOT PRODUCIBLE by the 39-tile keyboard: ${missing.map(c => `${JSON.stringify(c)} U+${[...c].map(ch => ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).join('+')}`).join(', ')}`);
  } else {
    console.log('  all clusters producible');
  }
  for (const c of clusters) {
    if (!producible.has(c)) {
      if (!globalChars.has(c)) globalChars.set(c, new Set());
      globalChars.get(c).add(`${s.a.id}`);
    }
  }
}

console.log('\n=== UNION OF MISSING KEYS (chapters 1-3) ===');
for (const [c, ids] of globalChars) {
  const cps = [...c].map(ch => 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).join(' ');
  console.log(`  ${JSON.stringify(c)}  ${cps}  <- ${[...ids].join(', ')}`);
}
if (!globalChars.size) console.log('  (none)');
```

#### walk.mjs

```js
// Full rail walk over the real built app: every activity in a chapter's
// sequence, at a given viewport, collecting console errors and page errors.
import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'f:/greekapp/opus-space';
const BASE = process.env.BASE || 'http://localhost:4173';
const WIDTH = Number(process.env.WIDTH || 320);
const HEIGHT = Number(process.env.HEIGHT || 720);
const CHAPTERS = (process.env.CHAPTERS || 'chapt_1,chapt_2,chapt_3').split(',');
const SHOTS = process.env.SHOTS ? process.env.SHOTS.split(',') : [];
const SHOTDIR = process.env.SHOTDIR || null;
if (SHOTDIR) mkdirSync(SHOTDIR, { recursive: true });

const seqOf = id => {
  const n = id.replace('chapt_', '').padStart(2, '0');
  const data = JSON.parse(readFileSync(join(ROOT, 'src/data', `chapt-${n}.json`), 'utf8'));
  return { seq: data.sequence, title: data.title };
};

const browser = await chromium.launch({ channel: undefined, executablePath: process.env.CHROME || undefined });
const ctx = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

const problems = [];
page.on('console', m => {
  if (m.type() !== 'error' && m.type() !== 'warning') return;
  const t = m.text();
  // Known non-bugs in a headless preview (HANDOFF-4.5): revoked blob URLs on
  // fast route exits, and /audio/* misses because the preview ships no audio.
  if (/ERR_FILE_NOT_FOUND|net::ERR_|Failed to load resource|blob:/.test(t)) return;
  problems.push(`[console.${m.type()}] ${page.url()} :: ${t}`);
});
page.on('pageerror', e => problems.push(`[pageerror] ${page.url()} :: ${e.message}`));

let visited = 0;
for (const chapterId of CHAPTERS) {
  const { seq, title } = seqOf(chapterId);
  console.log(`\n=== ${chapterId} (${title}) — ${seq.length} stops @ ${WIDTH}px ===`);
  for (const activityId of seq) {
    // Hash navigation: a full goto only reloads the document the first time,
    // and networkidle never settles once the SW is registered.
    if (!page.url().startsWith(BASE)) {
      await page.goto(`${BASE}/#/activity/${chapterId}/${activityId}`, { waitUntil: 'load' });
    } else {
      await page.evaluate(h => { location.hash = h; }, `#/activity/${chapterId}/${activityId}`);
    }
    await page.waitForTimeout(220);
    const shell = await page.evaluate(() => {
      const el = document.querySelector('.content');
      const doc = document.documentElement;
      return {
        heading: (document.querySelector('.topbar-title') || {}).textContent,
        railText: (document.querySelector('.rail-count') || {}).textContent || '',
        cards: document.querySelectorAll('.card').length,
        unsupported: [...document.querySelectorAll('.pending-verification')].map(n => n.textContent.trim()),
        // Horizontal overflow is silent app-wide (overflow-x: hidden), so
        // measure it rather than trusting the eye.
        overflow: Math.max(0, (el ? el.scrollWidth : 0) - (el ? el.clientWidth : 0)),
        docOverflow: Math.max(0, doc.scrollWidth - doc.clientWidth)
      };
    });
    visited += 1;
    const flags = [];
    if (!shell.cards) flags.push('NO CARD');
    if (shell.overflow > 1) flags.push(`CONTENT OVERFLOW +${shell.overflow}px`);
    if (shell.docOverflow > 1) flags.push(`DOC OVERFLOW +${shell.docOverflow}px`);
    if (shell.unsupported.some(t => /Unsupported content block|data shape error|renderer needs updating/.test(t))) {
      flags.push('UNSUPPORTED BLOCK');
    }
    console.log(`  ${activityId.padEnd(30)} ${String(shell.railText).padEnd(10)} cards=${shell.cards} ${flags.join(' ') || 'ok'}`);
    if (SHOTS.includes(activityId) && SHOTDIR) {
      await page.screenshot({ path: join(SHOTDIR, `${activityId}-${WIDTH}.png`), fullPage: true });
    }
  }
}

console.log(`\nvisited ${visited} activities @ ${WIDTH}px`);
if (problems.length) {
  console.log(`\nPROBLEMS (${problems.length}):`);
  for (const p of problems.slice(0, 40)) console.log('  ' + p);
} else {
  console.log('console: clean (0 errors, 0 warnings)');
}
await browser.close();
```

#### interact.mjs

```js
// Behavioural checks on the real UI for every 5D surface.
import { chromium } from 'playwright-core';
const BASE = 'http://localhost:4173';
const results = [];
const ok = (n, pass, detail = '') => { results.push({ n, pass, detail }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${n}${detail ? ' — ' + detail : ''}`); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 320, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error' && !/ERR_|Failed to load/.test(m.text())) errors.push(m.text()); });

const go = async hash => {
  if (!page.url().startsWith(BASE)) await page.goto(`${BASE}/${hash}`, { waitUntil: 'load' });
  else await page.evaluate(h => { location.hash = h.slice(1); }, hash);
  await page.waitForTimeout(300);
};

// ---------- paradigm chart (Learn topic, topic 3 of 6) ----------
await go('#/activity/chapt_3/c3_learn_verbs');
for (let i = 0; i < 2; i++) { await page.click('button:has-text("Next Topic")'); await page.waitForTimeout(150); }
ok('paradigm renders in the Learn topic', await page.locator('.paradigm .pg-cell').count() === 6,
   `${await page.locator('.paradigm .pg-cell').count()} cells`);
ok('paradigm cells are blue (tappable)',
   await page.locator('.pg-greek').first().evaluate(el => getComputedStyle(el).color) === 'rgb(22, 99, 199)');
ok('Say Whole Paradigm + Endings sit inside the chart frame',
   await page.locator('.paradigm .pg-actions .btn').count() === 2);
await page.click('.paradigm button:has-text("Endings")');
await page.waitForTimeout(200);
ok('Endings opens a modal with 3 rows', await page.locator('.pg-endings .pg-endrow').count() === 3);
ok('endings are INK, not tappable blue',
   await page.locator('.pg-ending').first().evaluate(el => getComputedStyle(el).color) !== 'rgb(22, 99, 199)');
await page.keyboard.press('Escape');
await page.waitForTimeout(150);
ok('Escape closes the Endings modal', await page.locator('.pg-endings').count() === 0);

// ---------- quick-review paradigm: NO endings button ----------
await go('#/activity/chapt_3/c3_qr_paradigm');
ok('paradigmChart page renders 6 cells', await page.locator('.pg-cell').count() === 6);
ok('paradigmChart has NO Endings button (data omits it)',
   await page.locator('.pg-actions button:has-text("Endings")').count() === 0);
ok('paradigmChart shows the chart title',
   (await page.locator('.pg-title').textContent()) === 'Present Active Indicative Paradigm');

// ---------- interlinear verse ----------
await go('#/activity/chapt_3/c3_learn_scripture');
ok('interlinearVerse renders 14 words', await page.locator('.ilv-word').count() === 14);
ok('the gloss-less article still renders and is tappable',
   await page.locator('.ilv-word').nth(2).evaluate(el => !el.disabled && el.querySelector('.ilv-greek').textContent === 'ὁ'));
ok('reference is right-aligned at the end',
   await page.locator('.ilv-ref').evaluate(el => el.textContent.trim() === 'John 14:6a' && getComputedStyle(el).textAlign === 'right'));
ok('Say Whole Verse button present', await page.locator('button:has-text("Say Whole Verse")').count() === 1);

// ---------- Verb Translating Drill: per-item options, 2x3, Translate, Hint modal ----------
await go('#/activity/chapt_3/c3_drill_verb_translating');
ok('VTD shows 6 per-item options', await page.locator('.grid.options .tile').count() === 6);
ok('VTD option grid is 2 columns',
   await page.locator('.grid.options').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length === 2));
ok('VTD prints the scripture citation', await page.locator('.prompt-citation').count() === 1,
   await page.locator('.prompt-citation').textContent());
await page.click('button:has-text("Translate")');
await page.waitForTimeout(120);
ok('Translate reveals the item translate string', (await page.locator('.gloss-line').count()) === 1,
   await page.locator('.gloss-line').textContent());
await page.click('button:has-text("Hint")');
await page.waitForTimeout(200);
ok('Hint opens the paradigm as a MODAL', await page.locator('.hint-modal .pg-cell').count() === 6);
await page.keyboard.press('Escape');
await page.waitForTimeout(150);
ok('Escape closes the Hint modal', await page.locator('.hint-modal').count() === 0);

// manualOnIncorrect: pick a wrong option, options lock, nothing advances
const at = async () => (await page.locator('.scorebox').last().textContent()).trim();
const before = await at();
const answerLabel = await page.locator('.grid.options .tile').first().textContent();
// click every tile until one is wrong (the first differing from the correct one)
await page.evaluate(() => {
  const tiles = [...document.querySelectorAll('.grid.options .tile')];
  tiles[0].click();
});
await page.waitForTimeout(400);
const kind = await page.locator('.feedback').getAttribute('class');
if (/bad/.test(kind)) {
  ok('manualOnIncorrect: no auto-advance after a wrong answer', (await at()) === before, `still ${await at()}`);
  ok('manualOnIncorrect: shows "Click Next to continue"', await page.locator('.await-next').count() === 1);
  const optsBefore = await page.locator('.grid.options .tile.selected').count();
  await page.locator('.grid.options .tile').nth(1).click();
  await page.waitForTimeout(200);
  ok('manualOnIncorrect: options lock after the attempt',
     await page.locator('.grid.options .tile.selected').count() === optsBefore);
} else {
  // ADVANCE_CORRECT_MS is 900 — the 400ms above is deliberately inside it, so
  // wait past it before asserting that the drill moved.
  await page.waitForTimeout(900);
  ok('manualOnIncorrect: correct answer auto-advances', (await at()) !== before, `${before} -> ${await at()}`);
}

// ---------- Greek Verb Drill: 3 Greek options, stacked ----------
await go('#/activity/chapt_3/c3_drill_greek_verb');
ok('GVD shows 3 options', await page.locator('.grid.options .tile').count() === 3);
ok('GVD options are stacked (1 column)',
   await page.locator('.grid.options').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length === 1));
ok('GVD options render in the Greek face',
   await page.locator('.grid.options .tile').first().evaluate(el => /GreekTutor/.test(getComputedStyle(el).fontFamily)));
ok('GVD prompt is English (not a greek-say tap)', await page.locator('.prompt.greek-say').count() === 0);

// ---------- Parsing drill: [3,3] groups ----------
await go('#/activity/chapt_3/c3_drill_parsing');
ok('Parsing renders two option groups', await page.locator('.option-group').count() === 2);
ok('Parsing groups hold 3 options each',
   await page.locator('.option-group').nth(0).locator('.tile').count() === 3
   && await page.locator('.option-group').nth(1).locator('.tile').count() === 3);
ok('Parsing groups are visibly separated',
   await page.locator('.option-group').nth(1).evaluate(el => getComputedStyle(el).borderTopWidth !== '0px'));

// ---------- Scripture Memory drill: 2x5 grid, autoBoth ----------
await go('#/activity/chapt_3/c3_drill_scripture_memory');
ok('SM drill shows 10 options', await page.locator('.grid.options .tile').count() === 10);
ok('SM drill grid is 2 columns (2x5)',
   await page.locator('.grid.options').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length === 2));
const smBefore = (await page.locator('.scorebox').last().textContent()).trim();
await page.locator('.grid.options .tile').first().click();
await page.waitForTimeout(3200);   // incorrect waits ADVANCE_INCORRECT_MS
ok('SM drill (autoBoth) auto-advances on either outcome',
   (await page.locator('.scorebox').last().textContent()).trim() !== smBefore,
   `${smBefore} -> ${(await page.locator('.scorebox').last().textContent()).trim()}`);

// ---------- shared keyboard on a CHAPTER 1 speller (no per-chapter fork) ----------
await go('#/activity/chapt_1/c1_ex_speller');
ok('ch1 speller has the new punctuation row', await page.locator('.tk-punct .tk-key').count() === 5);
ok('ch1 speller has a space bar', await page.locator('.tk-space').count() === 1);
ok('ch1 keeps its 25 letter tiles', await page.locator('.tk-letters .tk-key').count() === 25);
ok('space bar is the wide key',
   await page.locator('.tk-space').evaluate(el => el.getBoundingClientRect().width > 140),
   `${Math.round(await page.locator('.tk-space').evaluate(el => el.getBoundingClientRect().width))}px`);
ok('punctuation keys keep a 44px touch target',
   await page.locator('.tk-punct .tk-key').first().evaluate(el => {
     const r = el.getBoundingClientRect(); return r.width >= 44 && r.height >= 44;
   }));

// ---------- ch1 Χριστός with accents ON: the capital case, now winnable ----------
await go('#/activity/chapt_1/c1_ex_speller');
await page.locator('.spell-checks label:has-text("With Accents") input').check();
// walk to the Χριστός card
for (let i = 0; i < 10; i++) {
  const gloss = (await page.locator('.flash-pane .value').first().textContent()).trim();
  if (/Christ/i.test(gloss)) break;
  await page.click('.controls button:has-text("Next")');
  await page.waitForTimeout(120);
}
await page.evaluate(() => {
  const tiles = [...document.querySelectorAll('.tk-letters .tk-key')];
  const by = ch => tiles.find(t => t.textContent.trim() === ch);
  for (const ch of ['χ', 'ρ', 'ι', 'σ', 'τ', 'ο']) by(ch).click();
});
// acute on the omicron, then final sigma
await page.locator('.tk-marks .tk-key[title="acute"]').click();
await page.evaluate(() => {
  const t = [...document.querySelectorAll('.tk-letters .tk-key')].find(x => x.textContent.trim() === 'ς');
  t.click();
});
await page.waitForTimeout(120);
const typed = (await page.locator('.spell-target').textContent()).replace('|', '').trim();
await page.click('button:has-text("Check Answer")');
await page.waitForTimeout(300);
ok('ch1 Χριστός passes with accents ON (case folded)',
   /ok/.test(await page.locator('.feedback').getAttribute('class')),
   `typed "${typed}"`);

// ---------- spellVerse ----------
await go('#/activity/chapt_3/c3_ex_scripture_speller');
ok('spellVerse renders its own surface', await page.locator('.spellverse').count() === 1);
ok('spellVerse shows the reference', (await page.locator('.sv-ref').textContent()).trim() === 'John 14:6a');
ok('Restart Exercise label (D-12)', await page.locator('button:has-text("Restart Exercise")').count() === 1);
ok('no "Repeat This Exercise" label', await page.locator('button:has-text("Repeat This Exercise")').count() === 0);
await page.click('button:has-text("Major Hint")');
await page.waitForTimeout(150);
ok('Major Hint available before typing (D-11)', await page.locator('.sv-hint .sv-verse').count() === 1);
ok('Major Hint shows the translation',
   (await page.locator('.sv-translation').textContent()).includes('I am the way'));
await page.click('button:has-text("Major Hint")');

// type a wrong verse: first two words right, third wrong
await page.evaluate(() => {
  const tiles = [...document.querySelectorAll('.tk-letters .tk-key, .tk-punct .tk-key')];
  const by = t => tiles.find(x => x.textContent.trim() === t);
  for (const ch of ['λ','ε','γ','ε','ι']) by(ch).click();
  by('space').click();
  for (const ch of ['α','υ','τ','ω']) by(ch).click();
  by('space').click();
  by('κ').click();          // wrong: should be ὁ
});
await page.click('button:has-text("Check Answer")');
await page.waitForTimeout(250);
ok('spellVerse names the missed WORD, not an index (D-13)',
   await page.locator('.sv-word').count() === 1 && !/\d/.test(await page.locator('.sv-detail').textContent()),
   (await page.locator('.sv-detail').textContent()).trim());

// now type the whole verse unaccented, accents OFF -> should pass
await page.click('button:has-text("Restart Exercise")');
await page.waitForTimeout(150);
await page.evaluate(() => {
  const tiles = [...document.querySelectorAll('.tk-letters .tk-key, .tk-punct .tk-key')];
  const by = t => tiles.find(x => x.textContent.trim() === t);
  const verse = 'λεγει αυτω ο ιησους εγω ειμι η οδος και η αληθεια και η ζωη';
  for (const ch of verse) (ch === ' ' ? by('space') : by(ch)).click();
});
await page.click('button:has-text("Check Answer")');
await page.waitForTimeout(250);
ok('spellVerse accepts the unaccented verse with "With Accents" off',
   /ok/.test(await page.locator('.feedback').getAttribute('class')),
   (await page.locator('.feedback').textContent()).trim());

// same input with accents ON must now FAIL (marks are required)
await page.locator('.spell-checks label:has-text("With Accents") input').check();
await page.click('button:has-text("Check Answer")');
await page.waitForTimeout(250);
ok('"With Accents" ON requires the marks',
   /bad/.test(await page.locator('.feedback').getAttribute('class')));

// ---------- movable nu (D-16) on the verb speller ----------
await go('#/activity/chapt_3/c3_ex_verb_speller');
ok('verb speller reads inline {gloss, greek, audio} items',
   (await page.locator('.flash-pane .value').first().textContent()).trim() === 'he looses');
// walk to "they loose" (λύουσιν) and type it WITHOUT the final nu
for (let i = 0; i < 5; i++) {
  const gloss = (await page.locator('.flash-pane .value').first().textContent()).trim();
  if (gloss === 'they loose') break;
  await page.click('.controls button:has-text("Next")');
  await page.waitForTimeout(120);
}
await page.evaluate(() => {
  const tiles = [...document.querySelectorAll('.tk-letters .tk-key')];
  const by = ch => tiles.find(t => t.textContent.trim() === ch);
  for (const ch of ['λ','υ','ο','υ','σ','ι']) by(ch).click();   // λυουσι — no final nu
});
await page.click('button:has-text("Check Answer")');
await page.waitForTimeout(250);
ok('movable nu: λύουσι accepted for λύουσιν (D-16)',
   /ok/.test(await page.locator('.feedback').getAttribute('class')),
   (await page.locator('.feedback').textContent()).trim());

console.log(`\n${results.filter(r => r.pass).length}/${results.length} passed`);
if (errors.length) console.log('CONSOLE/PAGE ERRORS:\n  ' + errors.join('\n  '));
else console.log('console: clean');
await browser.close();
process.exit(results.every(r => r.pass) && !errors.length ? 0 : 1);
```

#### offline.mjs

```js
// Airplane-equivalent walk: warm the service worker, cut the network, then
// walk every chapter rail from a COLD DOCUMENT (reload while offline), which
// is what an installed PWA does when the phone has no signal.
import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
const BASE = 'http://localhost:4173';
const ROOT = 'f:/greekapp/opus-space';
const seqOf = id => {
  const n = id.replace('chapt_', '').padStart(2, '0');
  return JSON.parse(readFileSync(join(ROOT, 'src/data', `chapt-${n}.json`), 'utf8')).sequence;
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 320, height: 900 } });
const page = await ctx.newPage();
const problems = [];
page.on('pageerror', e => problems.push(`[pageerror] ${e.message}`));
page.on('console', m => {
  if (m.type() !== 'error') return;
  const t = m.text();
  if (/\/audio\/|blob:|ERR_FILE_NOT_FOUND/.test(t)) return;   // preview ships no audio
  problems.push(`[console] ${page.url()} :: ${t}`);
});

await page.goto(BASE, { waitUntil: 'load' });
await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller !== null, null, { timeout: 20000 })
  .catch(() => console.log('  (no SW controller yet — reloading to claim)'));
await page.reload({ waitUntil: 'load' });
// Touch every chapter once online so its chunk is fetched and precached.
for (const id of ['chapt_1', 'chapt_2', 'chapt_3']) {
  await page.evaluate(h => { location.hash = h; }, `#/chapter/${id}`);
  await page.waitForTimeout(300);
}
const controlled = await page.evaluate(() => !!(navigator.serviceWorker && navigator.serviceWorker.controller));
console.log(`service worker controlling: ${controlled}`);

await ctx.setOffline(true);
console.log('network: OFFLINE');
// Cold document while offline — the real airplane-mode case.
await page.goto(`${BASE}/#/`, { waitUntil: 'load' });
await page.waitForTimeout(400);
const tocOk = await page.locator('.menu-item').count();
console.log(`offline cold start: TOC rendered ${tocOk} chapter entries`);

let visited = 0, blank = 0;
for (const chapterId of ['chapt_1', 'chapt_2', 'chapt_3']) {
  for (const activityId of seqOf(chapterId)) {
    await page.evaluate(h => { location.hash = h; }, `#/activity/${chapterId}/${activityId}`);
    await page.waitForTimeout(180);
    const state = await page.evaluate(() => ({
      cards: document.querySelectorAll('.card').length,
      loadError: document.querySelectorAll('.load-error').length
    }));
    visited += 1;
    if (!state.cards || state.loadError) { blank += 1; console.log(`  BLANK/ERROR: ${chapterId}/${activityId}`); }
  }
}
console.log(`offline walk: ${visited} activities, ${blank} blank or errored`);
console.log(problems.length ? `PROBLEMS:\n  ${problems.slice(0, 20).join('\n  ')}` : 'console: clean');
await browser.close();
process.exit(blank === 0 && problems.length === 0 && tocOk > 0 ? 0 : 1);
```

#### audio-wiring.mjs

```js
// SPOT-PLAY WIRING EVIDENCE. The preview build ships no audio bytes, so
// "did it play" is not observable here; what IS observable, and is the thing
// that actually breaks, is WHICH clip each tap asks for. Every tap below is
// driven on the real UI and its resolved /audio/... request is captured and
// checked against the shipped CHAPT_3 pack on disk.
import { chromium } from 'playwright-core';
import { existsSync } from 'node:fs';
const BASE = 'http://localhost:4173';
const PACK = 'f:/greekapp/opus-space/public/audio';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 320, height: 900 } });
const page = await ctx.newPage();
// audio.js caches a fetched clip in IndexedDB, so a second tap on the same
// clip makes no request at all. Aborting the route keeps every tap observable:
// the app resolves the id to a path, asks for it, and gets nothing.
await page.route('**/audio/**', r => r.abort());
let asked = [];
page.on('request', r => { if (/\/audio\/.*\.m4a$/.test(r.url())) asked.push(new URL(r.url()).pathname); });

const go = async hash => {
  if (!page.url().startsWith(BASE)) await page.goto(`${BASE}/${hash}`, { waitUntil: 'load' });
  else await page.evaluate(h => { location.hash = h.slice(1); }, hash);
  await page.waitForTimeout(350);
};
const tap = async (label, fn) => {
  asked = [];
  await fn();
  await page.waitForTimeout(400);
  const got = [...new Set(asked)];
  const onDisk = got.map(p => `${p}${existsSync(PACK + p.replace('/audio', '')) ? ' [on disk]' : '  MISSING ON DISK'}`);
  console.log(`  ${label.padEnd(42)} -> ${onDisk.join(', ') || '(no request)'}`);
  return got;
};

console.log('PARADIGM (Learn topic)');
await go('#/activity/chapt_3/c3_learn_verbs');
for (let i = 0; i < 2; i++) { await page.click('button:has-text("Next Topic")'); await page.waitForTimeout(180); }
const cells = ['λύω', 'λύομεν', 'λύεις', 'λύετε', 'λύει', 'λύουσι'];
for (let i = 0; i < 6; i++) {
  await tap(`cell ${i + 1} (${cells[i]})`, () => page.locator('.pg-cell').nth(i).click());
}
await tap('lemma λύω', () => page.locator('.pg-lemma').click());
await tap('Say Whole Paradigm (c_paipar)', () => page.click('button:has-text("Say Whole Paradigm")'));
await tap('Endings button (c_ending, D-10)', () => page.click('.paradigm button:has-text("Endings")'));
await page.keyboard.press('Escape');

console.log('\nSCRIPTURE MEMORY');
await go('#/activity/chapt_3/c3_learn_scripture');
for (const i of [0, 3, 13]) {
  const w = await page.locator('.ilv-word').nth(i).locator('.ilv-greek').textContent();
  await tap(`sm word ${i + 1} (${w})`, () => page.locator('.ilv-word').nth(i).click());
}
await tap('Say Whole Verse (c_sm14_6)', () => page.click('button:has-text("Say Whole Verse")'));

console.log('\nQUICK REVIEW');
await go('#/activity/chapt_3/c3_qr_vocab');
await tap('Say Whole List (c_vocl3)', () => page.click('button:has-text("Say Whole List")'));
await go('#/activity/chapt_3/c3_qr_paradigm');
await tap('QR paradigm cell 1', () => page.locator('.pg-cell').nth(0).click());

console.log('\nVERB TRANSLATING DRILL — one clip per verb family');
await go('#/activity/chapt_3/c3_drill_verb_translating');
const families = { 'λύ': null, 'ἀκού': null, 'λέγ': null, 'βλέπ': null, 'πιστεύ': null };
for (let step = 0; step < 28 && Object.values(families).some(v => !v); step++) {
  const prompt = (await page.locator('.prompt').first().textContent()).trim();
  const stem = Object.keys(families).find(s => prompt.startsWith(s));
  if (stem && !families[stem]) {
    families[stem] = (await tap(`${stem}… (${prompt})`, () => page.click('button:has-text("Pronounce")')))[0];
  }
  if (step < 27) { await page.click('.controls button:has-text("Next")'); await page.waitForTimeout(200); }
}
const missed = Object.entries(families).filter(([, v]) => !v).map(([k]) => k);
console.log(missed.length ? `  families with no clip observed: ${missed.join(', ')}` : '  all five verb families covered');

await browser.close();
```

#### shots.mjs

```js
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
const BASE = 'http://localhost:4173';
const OUT = 'f:/greekapp/opus-space/buildout/screenshots/5D';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 320, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const go = async hash => {
  if (!page.url().startsWith(BASE)) await page.goto(`${BASE}/${hash}`, { waitUntil: 'load' });
  else await page.evaluate(h => { location.hash = h.slice(1); }, hash);
  await page.waitForTimeout(400);
};
// The app shell is height:100dvh with overflow:hidden — fullPage equals the
// viewport, so anything below the inner .scroll-area fold needs scrolling to.
const shot = (name) => page.screenshot({ path: join(OUT, `${name}-320.png`), fullPage: true });
const shotBottom = async (name) => {
  await page.evaluate(() => { const el = document.querySelector('.scroll-area'); el.scrollTop = el.scrollHeight; });
  await page.waitForTimeout(250);
  await page.screenshot({ path: join(OUT, `${name}-320.png`) });
};

// 1. paradigm chart, in the Learn topic (with Say Whole Paradigm + Endings)
await go('#/activity/chapt_3/c3_learn_verbs');
for (let i = 0; i < 2; i++) { await page.click('button:has-text("Next Topic")'); await page.waitForTimeout(180); }
await shot('paradigm-learn');

// 1b. the Endings popup
await page.click('.paradigm button:has-text("Endings")');
await page.waitForTimeout(300);
await page.screenshot({ path: join(OUT, 'paradigm-endings-320.png') });
await page.keyboard.press('Escape');

// 2. quick-review paradigm page (no Endings button)
await go('#/activity/chapt_3/c3_qr_paradigm');
await shot('paradigm-quickreview');

// 3. interlinear verse
await go('#/activity/chapt_3/c3_learn_scripture');
await shot('interlinear-verse');

// 4. parsing option groups
await go('#/activity/chapt_3/c3_drill_parsing');
await shot('parsing-option-groups');

// 5. Scripture Memory drill 2x5 grid
await go('#/activity/chapt_3/c3_drill_scripture_memory');
await shot('sm-drill-grid');

// 6. the new keyboard (on the whole-verse speller, mid-verse)
await go('#/activity/chapt_3/c3_ex_scripture_speller');
await page.evaluate(() => {
  const tiles = [...document.querySelectorAll('.tk-letters .tk-key, .tk-punct .tk-key')];
  const by = t => tiles.find(x => x.textContent.trim() === t);
  for (const ch of 'λεγει αυτω ο ιησους') (ch === ' ' ? by('space') : by(ch)).click();
});
await page.waitForTimeout(200);
await shotBottom('keyboard-spellverse');

// 6b. the same keyboard on a CHAPTER 1 speller — one keyboard, no fork
await go('#/activity/chapt_1/c1_ex_speller');
await shotBottom('keyboard-chapter1');

// 7. Hint popup over a drill
await go('#/activity/chapt_3/c3_drill_verb_translating');
await page.click('button:has-text("Hint")');
await page.waitForTimeout(350);
await page.screenshot({ path: join(OUT, 'hint-paradigm-modal-320.png') });

// 8. verb speller (inline item shape)
await go('#/activity/chapt_3/c3_ex_verb_speller');
await shot('verb-speller');
await shotBottom('verb-speller-keyboard');

console.log('screenshots written to', OUT);
await browser.close();
```
