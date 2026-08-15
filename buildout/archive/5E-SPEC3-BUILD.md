# 5E-SPEC3-BUILD.md — complete build record

## 0. What is in here

Section 3 embeds the complete `git diff` against the starting commit, inline
and unabridged, followed by the literal `git diff --no-index` new-file diff for
`5E-SPEC3-RESULTS.md`. This document is the only file excluded from its own
diff, because an audit container cannot contain itself. The generated
screenshot corpora are inventoried in §4 rather than embedded.

## 1. Run metadata

| | |
| --- | --- |
| Implementer | Claude (Opus 5), in Claude Code |
| Tooling | Node.js 24, Vite 5, Svelte 4, playwright-core driving Chrome; Python 3.14 for the ledger stamper |
| Base commit | `8bc8f306bf5931fbefeb8cccf64f953f1756ec9d` — "saving revisions before 5e spec 3" |
| Head | working tree, uncommitted |
| Initial status | clean |
| Commits created | none |
| Pushes | none |
| Diff exclusions | `buildout/5E-SPEC3-BUILD.md` (this file, self-referential); `buildout/screenshots/5e-spec3/**` (474 PNGs + walk report) and `buildout/screenshots/5e-spec3-answered/**` (37 PNGs). No source, script, data, test or results file is excluded. |

## 2. Files changed

| File | What |
| --- | --- |
| `src/lib/timing.js` | Six classes → four; `autoOnCorrect` becomes a constant (rule B1a); `waitsForNext` returns false on every correct answer; `WITHDRAWN_CLASSES` export; the two withdrawn names normalize to their migration targets at runtime. |
| `src/components/SpellActivity.svelte` | The only real logic change: a token-guarded `scheduleAdvance` returns to the word speller, so a correct spelling auto-advances at `max(2000ms, clip)` via `playThrough` and the next word cannot arrive over the previous word's audio. Cancelled by Previous, Next and unmount. |
| `src/components/SpellVerseActivity.svelte` | Rule B1b: one item, so nothing to advance to. The `spellUntilRight` wait message and its now-dead predicate are removed. |
| `src/components/DivideActivity.svelte` | Class comments corrected to `autoBoth`; behavior already followed the flags. |
| `src/components/PlaceAccentActivity.svelte` | Same. |
| `src/components/SelectActivity.svelte` | Comments only: four classes, and `manualOnIncorrect`-on-wrong is now the app's only waiting outcome. |
| `scripts/check-content-shapes.mjs` | Build fails on either withdrawn class name and names the migration; valid set still imported from `timing.js`, never re-typed. |
| `scripts/apply-behavior-matrix.py` | Merge of the reissued four-class validator with the round-2 capabilities it had lost (UTF-8 stdout, app-wide typographic sweep, `indent_of`, spaced `--`, provenance skip), plus a withdrawn-class STOP and `newline=''` so the stamp is byte-idempotent. |
| `scripts/ui-walk.mjs` | §4: timestamped `--out` default; refuses a non-empty directory before the browser launches; `--force` override; exit code 2. |
| `scripts/ui-behavior.mjs` | The §1 acceptance suite (one class per chapter, answer learned from the UI rather than a key), the restamped chapter-2 exercises on both paths, all twelve spellers' no-reveal check, B1b on all three verse spellers, the speller `max(2000, clip)` case, five underline surfaces, the withdrawn-name sweep, and `--shots=DIR` answered-state capture. 203 → 240 checks. |
| `buildout/DIVERGENCE-LOG.md` | D-28, which the reissued RULES already referenced twice. |

No file under `src/data/` changed. The chapter files are byte-identical to
`8bc8f30`, verified with `cmp` against `git show HEAD:` after a stamper run.

## 3. Complete git diff

Literal output of
`git diff --no-color --no-ext-diff 8bc8f306bf5931fbefeb8cccf64f953f1756ec9d`,
followed by the `--no-index` diff for the one new tracked-worthy text file.

```diff
diff --git a/buildout/DIVERGENCE-LOG.md b/buildout/DIVERGENCE-LOG.md
index 8364060..527a1a5 100644
--- a/buildout/DIVERGENCE-LOG.md
+++ b/buildout/DIVERGENCE-LOG.md
@@ -134,6 +134,24 @@ D-27 | ch5 | The First Declension--Eta chart prints its first row
      not cover the original's own chart-label inconsistencies, and
      normalizing one of the two would be a silent content edit.
      | Fable, 5E assembly, fidelity-first.
+D-28 | app | EVERY CORRECT ANSWER AUTO-ADVANCES, overriding the
+     original. Nathanael's second DOSBox pass records "no autoprogress
+     on correct" for 13 of the 14 spelling exercises, and the port
+     copied that observation into two advance classes —
+     `spellUntilRight` and `manualCorrectAutoIncorrect` — whose only
+     distinguishing feature was waiting for Next on a CORRECT answer.
+     Both classes are WITHDRAWN and the six-class table is now four:
+     every `spellUntilRight` is `retryUntilRight` and every
+     `manualCorrectAutoIncorrect` is `autoBoth`. The wait is still
+     max(2000ms, clip), so the afterGuess audio finishes first.
+     This is a deliberate departure from observed behavior, not a
+     fidelity claim: a learner who has just answered correctly should
+     not have to ask for the next item. ONE case is a no-op rather
+     than an exception (rule B1b): the three whole-verse spellers hold
+     a single item, so there is nothing to advance to and they mark
+     correct and stop rather than driving the sequential rail.
+     | Nathanael, 2026-08-06; DRILL-BEHAVIOR-RULES B1a/B1b;
+     5E-SPEC3 §1.
 
 ## Auto-progress / advance rule matrix
 
diff --git a/scripts/apply-behavior-matrix.py b/scripts/apply-behavior-matrix.py
index b1be8fc..b755d47 100644
--- a/scripts/apply-behavior-matrix.py
+++ b/scripts/apply-behavior-matrix.py
@@ -14,10 +14,16 @@ silently revert to whatever the assembler happened to hard-code:
     python3 scripts/apply-behavior-matrix.py \
         buildout/DRILL-BEHAVIOR-LEDGER.csv src/data
 
-The script also applies the two typographic rules that are data-side:
-D2 (no displayed double hyphen) and the removal of any lingering
+The script also applies the typographic rules that are data-side:
+D2 (no displayed double hyphen), the two underlined accent rules
+(5E-SPEC2 §5.3, kept by 5E-SPEC3 §3), and the removal of any lingering
 `autoAdvanceMs`.
 
+D2 is an APP-WIDE rule, so the typographic pass covers every rendered
+data file, not only chapt-NN.json: the last displayed double hyphens in
+the tree were in intro.json ("WELCOME --", "-- ENJOY") and in two
+chapter-1 lexicon glosses, which a chapter-only loop never opens.
+
 Only rows whose Status is CONFIRMED are applied. TO FILL rows are for
 chapters whose DOSBox pass has not happened yet; they are skipped, and
 their absence is reported so a chapter cannot ship unstamped by
@@ -27,15 +33,38 @@ Idempotent: running it twice changes nothing the second time.
 """
 import csv
 import json
+import os
 import re
 import sys
 import unicodedata
 
+# The report echoes the strings it changed, and some of them are Greek. On
+# Windows the console defaults to cp1252, which raises rather than mangling \u2014
+# the script did its work and then died printing what it had done. Say UTF-8
+# out loud, and fall back to replacement characters rather than an exception.
+if hasattr(sys.stdout, 'reconfigure'):
+    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
+
 VALID_TIMING = {'beforeGuess', 'afterGuess', 'afterTap', 'afterCheck', 'none'}
+# 5E-SPEC3 \u00a71: four classes. `spellUntilRight` and
+# `manualCorrectAutoIncorrect` are withdrawn \u2014 they existed only to wait
+# for Next on a CORRECT answer, which rule B1a forbids \u2014 and a ledger
+# still naming one is a STOP, not a silent migration, so that the ledger
+# gets corrected rather than the stamp papering over it.
 VALID_CLASS = {'none', 'autoBoth', 'manualOnIncorrect', 'retryUntilRight'}
+WITHDRAWN_CLASS = {'spellUntilRight': 'retryUntilRight',
+                   'manualCorrectAutoIncorrect': 'autoBoth'}
 PRONOUNCE_CHECKBOXES = ('Pronounce Each Drill', 'Pronounce Each Exercise')
 EM = '\u2014'
 
+# Non-underscore keys whose values are provenance rather than copy.
+PROVENANCE_KEYS = ('audioInventory',)
+
+# Data files nothing renders. font-map.json is the extraction pipeline's
+# own reference table (no runtime import anywhere in src/), so its prose
+# is documentation and its double hyphens are not "displayed".
+NON_RENDERED = {'font-map.json'}
+
 
 def load_ledger(path):
     rows = {}
@@ -52,6 +81,11 @@ def load_ledger(path):
             t, c = row['TARGET audioTiming'], row['TARGET advanceClass']
             if t not in VALID_TIMING:
                 raise SystemExit(f'STOP: {aid} audioTiming {t!r}')
+            if c in WITHDRAWN_CLASS:
+                raise SystemExit(
+                    f'STOP: {aid} advanceClass {c!r} was WITHDRAWN in '
+                    f'5E-SPEC3 §1. Correct the ledger row to '
+                    f'{WITHDRAWN_CLASS[c]!r}.')
             if c not in VALID_CLASS:
                 raise SystemExit(f'STOP: {aid} advanceClass {c!r}')
             rows[aid] = {
@@ -67,12 +101,22 @@ def dehyphen(obj, log, path='$'):
     """D2: a displayed double hyphen becomes an em dash.
 
     Only touches STRING VALUES, and only where the hyphens sit between
-    word characters or after a word - never inside a key, a markup tag,
-    an id, or a legacy field, since `_legacy` records the TBK's own
-    bytes and must stay byte-exact.
+    word characters, after a word, or SPACED between two words - never
+    inside a key, a markup tag or an id.
+
+    PROVENANCE IS SKIPPED ENTIRELY: every underscore-prefixed key, plus
+    `audioInventory`, whose values are role notes keyed by audio id.
+    `_legacy` records the TBK's own bytes and must stay byte-exact, and
+    `_comment`/`_note`/`_verify` are pipeline provenance that no screen
+    ever shows; the rule is about what is DISPLAYED, so rewriting them
+    would only churn the diff and blur where a mark came from.
+
+    The spaced form was added in 5E-SPEC2 §5.4: it is the form the
+    Introduction uses ("WELCOME -- Greek Tutor...", "... -- ENJOY"), and
+    it was invisible to the two tight patterns.
     """
     if isinstance(obj, dict):
-        return {k: (v if k.startswith('_legacy') else
+        return {k: (v if k.startswith('_') or k in PROVENANCE_KEYS else
                     dehyphen(v, log, f'{path}.{k}'))
                 for k, v in obj.items()}
     if isinstance(obj, list):
@@ -80,15 +124,21 @@ def dehyphen(obj, log, path='$'):
     if isinstance(obj, str) and '--' in obj:
         new = re.sub(r'(?<=\w)--(?=\w)', EM, obj)
         new = re.sub(r'(?<=\w)--(?=\s|$)', EM, new)
+        new = re.sub(r'(?<=\s)--(?=\s)', EM, new)
         if new != obj:
             log.append((path, obj, new))
         return new
     return obj
 
 
-# 5E-SPEC2 §5.3, kept data-side. The two accent rules carry no
-# structural signal a renderer could key on, so the underline is
+# 5E-SPEC2 §5.3, kept data-side by 5E-SPEC3 §3. The two accent rules
+# carry no structural signal a renderer could key on, so the underline is
 # authored here beside D2 rather than inferred at render time.
+#
+# Applied wherever the phrase is DISPLAYED, which in chapter 2 is ten
+# strings: the Learn topic's rule list, the two expander labels, both
+# drill/exercise hint copies, and the Quick Review copy. The phrase, not
+# the sentence: the full stop stays outside the underline.
 UNDERLINE = [
     ('Nouns are retentive', '[[u]]Nouns are retentive[[/u]]'),
     ('Verbs are recessive', '[[u]]Verbs are recessive[[/u]]'),
@@ -97,7 +147,7 @@ UNDERLINE = [
 
 def underline(obj, log, path='$'):
     if isinstance(obj, dict):
-        return {k: (v if k.startswith('_legacy') else
+        return {k: (v if k.startswith('_') or k in PROVENANCE_KEYS else
                     underline(v, log, f'{path}.{k}'))
                 for k, v in obj.items()}
     if isinstance(obj, list):
@@ -164,10 +214,48 @@ def apply_chapter(path, ledger, report):
     blob = json.dumps(data, ensure_ascii=False, indent=1) + '\n'
     if unicodedata.normalize('NFC', blob) != blob:
         raise SystemExit(f'STOP: {path} is not NFC after stamping')
-    open(path, 'w', encoding='utf-8').write(blob)
+    # newline='' so the LF the data files are stored with survives on
+    # Windows, where text mode would translate every one to CRLF and rewrite
+    # all five chapters on a run that changed nothing.
+    open(path, 'w', encoding='utf-8', newline='').write(blob)
     return touched
 
 
+def indent_of(text, default=1):
+    """The file's own indent width, so rewriting one string does not
+    reformat the whole file. The chapter files are written at indent 1
+    and intro.json at indent 2; a two-character typographic fix that
+    reflows 120 lines is a diff nobody can review."""
+    for line in text.split('\n')[1:]:
+        stripped = line.lstrip(' ')
+        if stripped and stripped != '}':
+            return len(line) - len(stripped) or default
+    return default
+
+
+def apply_plain(path, report):
+    """The typographic pass only, for the rendered data files that carry
+    no drills or exercises (intro.json, toc.json, the lexicons). The file
+    is left byte-identical when there is nothing to fix."""
+    try:
+        text = open(path, encoding='utf-8').read()
+    except OSError:
+        return
+    data = json.loads(text)
+    hyphens = []
+    data = dehyphen(data, hyphens)
+    if not hyphens:
+        return
+    report['hyphens'] += [(path, p, a, b) for p, a, b in hyphens]
+    blob = json.dumps(data, ensure_ascii=False, indent=indent_of(text)) + '\n'
+    if unicodedata.normalize('NFC', blob) != blob:
+        raise SystemExit(f'STOP: {path} is not NFC after stamping')
+    # newline='' so the LF the data files are stored with survives on
+    # Windows, where text mode would translate every one to CRLF and rewrite
+    # all five chapters on a run that changed nothing.
+    open(path, 'w', encoding='utf-8', newline='').write(blob)
+
+
 def main():
     ledger_path, datadir = sys.argv[1], sys.argv[2]
     ledger, skipped = load_ledger(ledger_path)
@@ -181,6 +269,13 @@ def main():
         except OSError:
             continue
         total += apply_chapter(path, ledger, report)
+    # D2 is an APP-WIDE rule, not a chapter one. Every rendered data file
+    # gets the typographic pass, not just chapt-NN.json.
+    for name in sorted(os.listdir(datadir)):
+        if (name.endswith('.json')
+                and not re.fullmatch(r'chapt-\d\d\.json', name)
+                and name not in NON_RENDERED):
+            apply_plain(f'{datadir}/{name}', report)
     print(f'stamped {total} activities from {len(ledger)} confirmed rows')
     if skipped:
         chs = sorted({c for c, _ in skipped})
diff --git a/scripts/check-content-shapes.mjs b/scripts/check-content-shapes.mjs
index 96285a1..c65a2df 100644
--- a/scripts/check-content-shapes.mjs
+++ b/scripts/check-content-shapes.mjs
@@ -5,7 +5,7 @@
 // gets a loud check here instead. Run from `npm run verify`.
 import { readFileSync, readdirSync } from 'node:fs';
 import { join } from 'node:path';
-import { ADVANCE_CLASSES as TIMING_CLASSES } from '../src/lib/timing.js';
+import { ADVANCE_CLASSES as TIMING_CLASSES, WITHDRAWN_CLASSES as TIMING_WITHDRAWN } from '../src/lib/timing.js';
 
 const DATA = 'src/data';
 const problems = [];
@@ -25,12 +25,18 @@ const ACTIVITY_TYPES = new Set(['contentAudio', 'select', 'spell', 'divide', 'pl
 // contentAudio dispatches on `mode`; a mode with no branch in
 // ContentAudio.svelte falls through to the generic chart and renders a grid of
 // nothing, which is exactly the kind of failure that only shows up on device.
-// The six advance classes come from the RENDERER's own list (src/lib/timing.js
+// The four advance classes come from the RENDERER's own list (src/lib/timing.js
 // has no imports, so this script stays dependency-free by importing it). A
 // second hand-written copy here is exactly how the data and the renderer would
 // drift apart while both looked right. The ledger stamper keeps a third copy
 // only because it is Python and cannot read this one.
 const ADVANCE_CLASSES = new Set(TIMING_CLASSES);
+// 5E-SPEC3 §1: the two classes that existed only to wait for Next on a CORRECT
+// answer are withdrawn. timing.js still normalizes them at runtime so a stale
+// cached data file behaves correctly, which is exactly why the BUILD has to
+// refuse them — otherwise a withdrawn name could sit in shipped data forever,
+// silently working, and nobody would learn it was wrong.
+const WITHDRAWN = new Map(Object.entries(TIMING_WITHDRAWN));
 // The five audio timings (rules A1/A8). The renderer branches on these by name
 // rather than exporting a list, so this is the one place they are enumerated.
 const AUDIO_TIMINGS = new Set(['beforeGuess', 'afterGuess', 'afterTap', 'afterCheck', 'none']);
@@ -291,16 +297,18 @@ for (const file of files) {
     if (Object.prototype.hasOwnProperty.call(block, 'autoAdvanceMs')) {
       problems.push(`${path}.autoAdvanceMs: advance durations live in src/lib/timing.js, not in the data (D-14).`);
     }
-    // BEHAVIOR IS A CLOSED VOCABULARY (5E-SPEC2 §1, DRILL-BEHAVIOR-RULES B1).
-    // There are six advance classes and five audio timings, and a value
+    // BEHAVIOR IS A CLOSED VOCABULARY (5E-SPEC3 §1, DRILL-BEHAVIOR-RULES B1).
+    // There are four advance classes and five audio timings, and a value
     // outside them fails SILENTLY at runtime: resolveAdvance falls through to
-    // its legacy branch and the surface auto-advances when the ledger says it
-    // should wait. The renderer cannot report it because it never sees a
+    // its legacy branch and the surface behaves however that branch happens to
+    // say. The renderer cannot report it because it never sees a
     // wrong-but-plausible string as wrong, so the build does.
     if (Object.prototype.hasOwnProperty.call(block, 'answerPolicy')
         && block.answerPolicy && typeof block.answerPolicy === 'object') {
       const advanceClass = block.answerPolicy.advanceClass;
-      if (advanceClass != null && !ADVANCE_CLASSES.has(advanceClass)) {
+      if (advanceClass != null && WITHDRAWN.has(advanceClass)) {
+        problems.push(`${path}.answerPolicy.advanceClass: "${advanceClass}" was WITHDRAWN in 5E-SPEC3 §1 — it existed only to wait for Next on a correct answer, which rule B1a forbids. Restamp this activity as "${WITHDRAWN.get(advanceClass)}".`);
+      } else if (advanceClass != null && !ADVANCE_CLASSES.has(advanceClass)) {
         problems.push(`${path}.answerPolicy.advanceClass: "${advanceClass}" is not one of ${[...ADVANCE_CLASSES].join(', ')}.`);
       }
     }
@@ -453,4 +461,4 @@ if (problems.length) {
   process.exit(1);
 }
 
-console.log(`PASS: content shapes intact — ${files.join(', ')} checked (biblist entries are strings; numbered items render something; greekRows rows carry content; paradigm rows match their columns; spellVerse answers are single words; every contentAudio mode has a branch; every advanceClass is one of the six and every audioTiming one of the five; every reddened cluster has a font-derived geometry row; every spelling answer is typeable on the shared keyboard).`);
+console.log(`PASS: content shapes intact — ${files.join(', ')} checked (biblist entries are strings; numbered items render something; greekRows rows carry content; paradigm rows match their columns; spellVerse answers are single words; every contentAudio mode has a branch; every advanceClass is one of the four and every audioTiming one of the five; every reddened cluster has a font-derived geometry row; every spelling answer is typeable on the shared keyboard).`);
diff --git a/scripts/ui-behavior.mjs b/scripts/ui-behavior.mjs
index e51c401..a19fd23 100644
--- a/scripts/ui-behavior.mjs
+++ b/scripts/ui-behavior.mjs
@@ -7,15 +7,32 @@
 // right, does the layout read well, does the clip say the right word).
 //
 //   npm run preview            # in another shell
-//   node scripts/ui-behavior.mjs
+//   node scripts/ui-behavior.mjs [--shots=DIR]
 //
 // Everything here drives the SHIPPED UI — tiles, keys, buttons — never a
 // component internal. If it passes here it passes because the app does it.
+//
+// --shots=DIR captures the ANSWERED state of every surface this file exercises
+// on the correct and incorrect paths. ui-walk.mjs screenshots a rail stop as it
+// ARRIVES, so no image in that corpus has ever shown a drill after an answer —
+// which is exactly where every behavior change of cohort 5E lives. These are
+// the states under test, photographed at the moment they are asserted.
 
 import { chromium } from 'playwright-core';
-import { readFileSync } from 'node:fs';
+import { readFileSync, mkdirSync } from 'node:fs';
 
 const BASE = process.env.BASE || 'http://localhost:4173';
+const SHOTS = (process.argv.find(a => a.startsWith('--shots=')) || '').split('=')[1] || null;
+if (SHOTS) mkdirSync(SHOTS, { recursive: true });
+let shotIndex = 0;
+// Named by the assertion they belong to, numbered so the directory reads in
+// the order the run made them.
+const shot = async name => {
+  if (!SHOTS) return;
+  const file = `${String(++shotIndex).padStart(2, '0')}-${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`;
+  await page.screenshot({ path: `${SHOTS}/${file}`, fullPage: true });
+};
+
 const results = [];
 const check = (name, ok, detail = '') => {
   results.push({ name, ok: !!ok, detail });
@@ -36,6 +53,10 @@ const verse = (ch3.exercise.find(a => a.type === 'spellVerse').answerWords || []
 // test below that asserts exactly that.
 const stripAccents = s => s.normalize('NFD').replace(/[̀́͂]/gu, '').normalize('NFC');
 const stripAllMarks = s => s.normalize('NFD').replace(/\p{M}/gu, '').normalize('NFC');
+// The elision marks the shared keyboard cannot type. answer-check.js treats
+// all of them as punctuation, and punctuation is optional (D-18), so a verse
+// typed without one is still a correct answer.
+const stripElision = s => s.replace(/[᾽’ʼ‘]/gu, '');
 const normalizeText = value => String(value ?? '').replace(/\s+/g, ' ').trim().normalize('NFC');
 
 // playwright-core does not install a browser. Prefer its configured binary,
@@ -673,9 +694,10 @@ for (const chapterId of ['chapt_1', 'chapt_2', 'chapt_3', 'chapt_4', 'chapt_5'])
 }
 
 // ================================================================ 5E-SPEC2 §6
-// Everything below is this round's contract: the six advance classes, the
-// afterGuess audio wait, the audio lifecycle, the two withdrawn spelling
-// leniencies, Show Answer, modal reachability and the option-grid census.
+// Everything below is 5E-SPEC2's contract, amended by 5E-SPEC3 §1: the FOUR
+// advance classes, the afterGuess audio wait, the audio lifecycle, the two
+// withdrawn spelling leniencies, Show Answer, modal reachability and the
+// option-grid census.
 await page.setViewportSize({ width: 390, height: 900 });
 
 const CHAPTERS = { chapt_1: ch1, chapt_2: ch2, chapt_3: ch3, chapt_4: ch4, chapt_5: ch5 };
@@ -717,6 +739,7 @@ await measureAuthoredAdvance('ch4 Scripture Memory (autoBoth, correct)', ch4, 'c
   // answer both light up. Assert what is revealed, not how many tiles it took.
   const revealed = (await page.locator('.grid.options .tile.correct').allInnerTexts()).map(normalizeText);
   const said = await awaitNextShown();
+  await shot('manualOnIncorrect INCORRECT (the app\'s only waiting outcome)');
   await page.waitForTimeout(INCORRECT_MS * 1.5);
   check('5E §6.1 manualOnIncorrect: incorrect reveals, waits, and says so',
     await feedbackKind() === 'bad' && revealed.length >= 1
@@ -749,6 +772,7 @@ await measureAuthoredAdvance('ch4 Scripture Memory (autoBoth, correct)', ch4, 'c
   const kind = await feedbackKind();
   const revealed = await page.locator('.grid.options .tile.correct').count();
   const said = await awaitNextShown();
+  await shot('retryUntilRight INCORRECT (open, nothing revealed)');
   await page.waitForTimeout(INCORRECT_MS * 1.4);
   check('5E §6.1 retryUntilRight: incorrect reveals nothing and stays open',
     wrongAt >= 0 && kind === 'bad' && revealed === 0 && !said && await itemNumber() === before,
@@ -764,8 +788,9 @@ await measureAuthoredAdvance('ch4 Scripture Memory (autoBoth, correct)', ch4, 'c
     `${attemptsBefore.trim()} -> ${attemptsAfter.trim()}`);
 }
 
-// `manualCorrectAutoIncorrect` — the ch2 exercises, and the class whose
-// direction is the opposite of the obvious one: CORRECT waits, wrong advances.
+// The two chapter-2 exercises, which 5E-SPEC2 shipped as
+// `manualCorrectAutoIncorrect` (wait for Next on a CORRECT answer) and
+// 5E-SPEC3 §1 restamps as `autoBoth`. Both outcomes now move by themselves.
 const ACCENT_OF = { '́': 'Acute', '̀': 'Grave', '͂': 'Circumflex' };
 function accentAnswer(form) {
   const clusters = [...new Intl.Segmenter('el', { granularity: 'grapheme' }).segment(form)].map(p => p.segment);
@@ -785,13 +810,26 @@ function accentAnswer(form) {
   const before = await exerciseCount();
   await page.locator('.accent-types .chip', { hasText: answer.type }).first().click();
   await page.locator('.accent-slot').nth(answer.index).click();
+  const rightAt = Date.now();
   await stepper('Check Answer').click();
   await page.waitForTimeout(200);
+  // Read the outcome BEFORE the advance clears it: this class moves on by
+  // itself on BOTH paths now, so anything asserted afterwards reads an empty
+  // banner and a different word.
+  const rightKind = await feedbackKind();
   const said = await awaitNextShown();
-  await page.waitForTimeout(CORRECT_MS * 1.6);
-  check('5E §6.1 manualCorrectAutoIncorrect: CORRECT waits for Next and says so',
-    await feedbackKind() === 'ok' && said && await exerciseCount() === before,
-    `message ${said}, item ${before.trim()} -> ${(await exerciseCount()).trim()}`);
+  await shot('ch2 accent placement CORRECT');
+  const earlyRight = await exerciseCount();
+  let lateRight = earlyRight;
+  while (lateRight === before && Date.now() - rightAt < CORRECT_MS * 2.2) {
+    await page.waitForTimeout(50);
+    lateRight = await exerciseCount();
+  }
+  const rightElapsed = Date.now() - rightAt;
+  check('5E §6.1 autoBoth (ch2 Accent Placement): CORRECT auto-advances on 2000ms and never waits',
+    rightKind === 'ok' && !said && earlyRight === before
+      && lateRight !== before && rightElapsed >= CORRECT_MS * 0.8,
+    `feedback ${rightKind}, wait message ${said}, item ${before.trim()} -> ${lateRight.trim()} at ${rightElapsed}ms`);
 
   await go('#/activity/chapt_2/c2_ex_accent_placement');
   const beforeWrong = await exerciseCount();
@@ -800,10 +838,9 @@ function accentAnswer(form) {
   const answeredAt = Date.now();
   await stepper('Check Answer').click();
   await page.waitForTimeout(200);
-  // Read the outcome BEFORE the advance clears it — this class moves on by
-  // itself, so an assertion made after the move would read an empty banner.
   const wrongKind = await feedbackKind();
   const revealedForm = await page.locator('.exercise-answer').count();
+  await shot('ch2 accent placement INCORRECT');
   const early = await exerciseCount();
   let late = early;
   while (late === beforeWrong && Date.now() - answeredAt < INCORRECT_MS * 1.6) {
@@ -811,14 +848,53 @@ function accentAnswer(form) {
     late = await exerciseCount();
   }
   const elapsed = Date.now() - answeredAt;
-  check('5E §6.1 manualCorrectAutoIncorrect: INCORRECT reveals and auto-advances on 4000ms',
+  check('5E §6.1 autoBoth (ch2 Accent Placement): INCORRECT reveals and auto-advances on 4000ms',
     wrongKind === 'bad' && revealedForm === 1 && early === beforeWrong
       && late !== beforeWrong && elapsed >= INCORRECT_MS * 0.8,
     `feedback ${wrongKind}, revealed ${revealedForm}, item ${beforeWrong.trim()} -> ${late.trim()} at ${elapsed}ms`);
 }
 
-// `spellUntilRight` — correct waits for Next; wrong keeps what was typed and
-// never reveals the spelling.
+// Syllable Division, the other restamped chapter-2 exercise. Its answer is the
+// authored `division` gap list, placed by tapping the word at each gap centre.
+{
+  const activity = activityById(ch2, 'c2_ex_syllable_division');
+  // The first item with at least one divider, so the "one syllable" bar is not
+  // the whole answer and real gap taps are exercised.
+  const index = (activity.items || []).findIndex(item => (item.division || []).length > 0);
+  const item = activity.items[index];
+  await go('#/activity/chapt_2/c2_ex_syllable_division');
+  for (let i = 0; i < index; i++) await stepper('Next').click();
+  await page.waitForTimeout(120);
+  const before = await exerciseCount();
+  // Tap between cluster g-1 and cluster g, using the LAID-OUT letter boxes, so
+  // this places dividers the same way a finger does rather than by internal id.
+  for (const gap of item.division) {
+    const box = await page.locator('.divide-word .divide-letter').nth(gap - 1).boundingBox();
+    const after = await page.locator('.divide-word .divide-letter').nth(gap).boundingBox();
+    await page.mouse.click((box.x + box.width + after.x) / 2, box.y + box.height / 2);
+    await page.waitForTimeout(60);
+  }
+  const answeredAt = Date.now();
+  await stepper('Check Answer').click();
+  await page.waitForTimeout(200);
+  const kind = await feedbackKind();
+  const said = await awaitNextShown();
+  await shot('ch2 syllable division CORRECT');
+  let late = before;
+  while (late === before && Date.now() - answeredAt < CORRECT_MS * 2.5) {
+    await page.waitForTimeout(50);
+    late = await exerciseCount();
+  }
+  const elapsed = Date.now() - answeredAt;
+  check('5E §6.1 autoBoth (ch2 Syllable Division): CORRECT auto-advances on 2000ms and never waits',
+    kind === 'ok' && !said && late !== before && elapsed >= CORRECT_MS * 0.8,
+    `feedback ${kind} on ${JSON.stringify(item.greek)}, wait message ${said}, item ${before.trim()} -> ${late.trim()} at ${elapsed}ms`);
+}
+
+// `retryUntilRight` on a SPELLER — 5E-SPEC2 shipped these as `spellUntilRight`,
+// waiting for Next on a correct spelling. A correct spelling now moves to the
+// next word by itself; a wrong one still keeps what was typed and reveals
+// nothing (§5 / rule C0a).
 {
   const activity = activityById(ch3, 'c3_ex_verb_speller');
   const word = activity.items[0].greek;
@@ -826,13 +902,23 @@ function accentAnswer(form) {
   const before = await promptGloss();
   await setAccents(false);
   await typeAccented(stripAccents(word));
+  const answeredAt = Date.now();
   await stepper('Check Answer').click();
   await page.waitForTimeout(200);
+  const kind = await feedbackKind();
   const said = await awaitNextShown();
-  await page.waitForTimeout(CORRECT_MS * 1.6);
-  check('5E §6.1 spellUntilRight: a correct spelling waits for Next and says so',
-    await feedbackKind() === 'ok' && said && await promptGloss() === before,
-    `message ${said}, prompt ${JSON.stringify(before)} -> ${JSON.stringify(await promptGloss())}`);
+  await shot('speller CORRECT (auto-advancing)');
+  const early = await promptGloss();
+  let late = early;
+  while (late === before && Date.now() - answeredAt < CORRECT_MS * 3) {
+    await page.waitForTimeout(50);
+    late = await promptGloss();
+  }
+  const elapsed = Date.now() - answeredAt;
+  check('5E §6.1 retryUntilRight (speller): a correct spelling AUTO-ADVANCES and never waits',
+    kind === 'ok' && !said && early === before && late !== before
+      && elapsed >= CORRECT_MS * 0.8,
+    `feedback ${kind}, wait message ${said}, prompt ${JSON.stringify(before)} -> ${JSON.stringify(late)} at ${elapsed}ms`);
 
   await go('#/activity/chapt_3/c3_ex_verb_speller');
   await setAccents(false);
@@ -840,13 +926,254 @@ function accentAnswer(form) {
   const typedBefore = await typed();
   await stepper('Check Answer').click();
   await page.waitForTimeout(250);
-  check('5E §6.1 spellUntilRight: a wrong spelling keeps the slate and reveals nothing',
+  await shot('speller INCORRECT (slate kept, nothing revealed)');
+  check('5E §6.1 retryUntilRight (speller): a wrong spelling keeps the slate and reveals nothing',
     await feedbackKind() === 'bad' && await typed() === typedBefore
       && await page.locator('.spell-answer').count() === 0
       && !await awaitNextShown(),
     `typed ${JSON.stringify(await typed())}, answer shown ${await page.locator('.spell-answer').count()}`);
 }
 
+// ------------------------------------------- §1 acceptance: one per chapter
+// Rule B1a is the whole point of this round: EVERY correct answer auto-
+// advances, in every class, in every chapter. One assertion per class per
+// chapter, driven through the UI.
+//
+// The option-grid drills shuffle and most of them answer by lexicon ref, so
+// rather than reading an answer key this LEARNS the answer from the app: a
+// wrong tap on a one-attempt class reveals it (.tile.correct), and reloading
+// until the same prompt comes back around gives a deterministic correct tap on
+// the next pass. Nothing here encodes what the right answer is.
+const OPTION_TILES = '.grid.options .tile, .option-group .tile';
+const promptOnScreen = async () => normalizeText(await page.locator('.card .prompt').first().innerText());
+
+// Learns INCREMENTALLY rather than fixing on one prompt and waiting for the
+// shuffle to bring it back: a 25-item pool would need luck to do that inside a
+// bounded number of reloads. Each pass either recognizes a prompt it has
+// already solved (and hands it back unanswered, ready to measure) or spends
+// one wrong tap learning that prompt's answer from the reveal.
+//
+// TWO AMBIGUITIES, both real in the delivered data, both settled by evidence
+// rather than by an answer key:
+//   * two OPTIONS with the same label (nominative and vocative plural are
+//     homographs in every paradigm) light up more than one tile, so there is
+//     no single answer to learn — that reveal is discarded;
+//   * two ITEMS with the same prompt and different answers (ch4's Greek Noun
+//     drill ships "Brother will betray brother" twice) make a learned answer
+//     wrong on the second one. That shows up as `bad` feedback on the
+//     measurement pass, so the prompt is struck off and the walk continues
+//     rather than reporting a broken advance.
+async function checkCorrectAutoAdvances(label, hash, tries = 45) {
+  const NAME = `5E §1 ${label}: correct auto-advances on max(2000ms, clip) and never waits for Next`;
+  const known = new Map();
+  const ambiguous = new Set();
+  let why = 'never reached a prompt whose answer could be learned';
+  for (let i = 0; i < tries; i++) {
+    await go(hash);
+    const prompt = await promptOnScreen();
+    const tiles = page.locator(OPTION_TILES);
+    const labels = (await tiles.allInnerTexts()).map(normalizeText);
+
+    if (known.has(prompt)) {
+      const at = labels.indexOf(known.get(prompt));
+      if (at < 0) { known.delete(prompt); continue; }
+      const before = await itemNumber();
+      const answeredAt = Date.now();
+      await tiles.nth(at).click();
+      await page.waitForTimeout(180);
+      const kind = await feedbackKind();
+      if (kind !== 'ok') {
+        known.delete(prompt);
+        ambiguous.add(prompt);
+        why = `prompt ${JSON.stringify(prompt)} is shared by two items with different answers`;
+        continue;
+      }
+      const said = await awaitNextShown();
+      await shot(`B1a ${label} CORRECT`);
+      const early = await itemNumber();
+      let late = early;
+      while (late === before && Date.now() - answeredAt < CORRECT_MS * 3) {
+        await page.waitForTimeout(50);
+        late = await itemNumber();
+      }
+      const elapsed = Date.now() - answeredAt;
+      check(NAME,
+        !said && early === before && late !== before && elapsed >= CORRECT_MS * 0.8,
+        `wait message ${said}, item ${before} -> ${late} at ${elapsed}ms on ${JSON.stringify(prompt)}`);
+      return;
+    }
+
+    if (ambiguous.has(prompt)) continue;
+    await tiles.first().click();
+    await page.waitForTimeout(180);
+    if (await feedbackKind() === 'ok') { known.set(prompt, labels[0]); continue; }
+    const revealed = (await page.locator('.grid.options .tile.correct, .option-group .tile.correct')
+      .allInnerTexts()).map(normalizeText);
+    if (revealed.length === 1) known.set(prompt, revealed[0]);
+  }
+  check(NAME, false, `gave up after ${tries} passes — ${why}`);
+}
+
+// `retryUntilRight` reveals NOTHING on a wrong answer, so there is nothing for
+// learnCorrectOption to read — but it also leaves the item open, so the answer
+// can simply be found by trying tiles on the item in front of us. The advance
+// is measured from the tap that finally landed.
+async function checkRetryCorrectAutoAdvances(label, hash) {
+  await go(hash);
+  const before = await itemNumber();
+  const tiles = page.locator(OPTION_TILES);
+  const count = await tiles.count();
+  let answeredAt = 0, kind = 'none';
+  for (let i = 0; i < count; i++) {
+    answeredAt = Date.now();
+    await tiles.nth(i).click();
+    await page.waitForTimeout(160);
+    kind = await feedbackKind();
+    if (kind === 'ok') break;
+    if (await itemNumber() !== before) break;      // it moved: not a retry class
+  }
+  const said = await awaitNextShown();
+  await shot(`B1a ${label} CORRECT`);
+  const early = await itemNumber();
+  let late = early;
+  while (late === before && Date.now() - answeredAt < CORRECT_MS * 3) {
+    await page.waitForTimeout(50);
+    late = await itemNumber();
+  }
+  const elapsed = Date.now() - answeredAt;
+  check(`5E §1 ${label}: correct auto-advances on max(2000ms, clip) and never waits for Next`,
+    kind === 'ok' && !said && early === before && late !== before && elapsed >= CORRECT_MS * 0.8,
+    `feedback ${kind}, wait message ${said}, item ${before} -> ${late} at ${elapsed}ms`);
+}
+
+// Every chapter's option-grid classes. `autoBoth` and `manualOnIncorrect` both
+// reveal on a wrong answer, which is what makes learnCorrectOption work.
+for (const [label, hash] of [
+  ['ch1 Vocabulary: English to Greek (autoBoth)', '#/activity/chapt_1/c1_drill_vocab_en_gk'],
+  ['ch2 Vocabulary: Greek to English (autoBoth)', '#/activity/chapt_2/c2_drill_vocab_gk_en'],
+  ['ch2 Marking Recognition (manualOnIncorrect)', '#/activity/chapt_2/c2_drill_marking_recognition'],
+  ['ch3 Scripture Memory (autoBoth)', '#/activity/chapt_3/c3_drill_scripture_memory'],
+  ['ch3 Verb Translating (manualOnIncorrect)', '#/activity/chapt_3/c3_drill_verb_translating'],
+  ['ch4 Scripture Memory (autoBoth)', '#/activity/chapt_4/c4_drill_scripture_memory'],
+  ['ch4 Greek Noun (manualOnIncorrect)', '#/activity/chapt_4/c4_drill_greek_noun'],
+  ['ch5 Vocabulary: English to Greek (autoBoth)', '#/activity/chapt_5/c5_drill_vocab_en_gk'],
+  ['ch5 Definite Article (manualOnIncorrect)', '#/activity/chapt_5/c5_drill_article']
+]) await checkCorrectAutoAdvances(label, hash);
+// The one non-speller `retryUntilRight` surface in chapters 1-5.
+await checkRetryCorrectAutoAdvances('ch2 Syllable Counting (retryUntilRight)', '#/activity/chapt_2/c2_drill_syllable_counting');
+
+// `retryUntilRight` on the WORD SPELLER, once per chapter. The item order is
+// authored, not shuffled, so the first word's spelling comes straight from the
+// delivered data and the measurement is deterministic.
+for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
+  const activity = activitiesOf(chapter).find(a => a && a.type === 'spell');
+  if (!activity) continue;
+  const answers = spellerAnswers(chapterId, activity);
+  const word = answers[0];
+  if (!word) { check(`5E §1 ${chapterId} ${activity.id}: correct auto-advances`, false, 'no first answer in the data'); continue; }
+  await go(`#/activity/${chapterId}/${activity.id}`);
+  const before = await promptGloss();
+  await setAccents(false);
+  await typeAccented(stripAccents(word));
+  const answeredAt = Date.now();
+  await stepper('Check Answer').click();
+  await page.waitForTimeout(180);
+  const kind = await feedbackKind();
+  const said = await awaitNextShown();
+  await shot(`B1a ${chapterId} ${activity.id} CORRECT`);
+  const early = await promptGloss();
+  let late = early;
+  while (late === before && Date.now() - answeredAt < CORRECT_MS * 3) {
+    await page.waitForTimeout(50);
+    late = await promptGloss();
+  }
+  const elapsed = Date.now() - answeredAt;
+  check(`5E §1 ${chapterId} ${activity.id} (retryUntilRight): correct auto-advances on max(2000ms, clip)`,
+    kind === 'ok' && !said && early === before && late !== before && elapsed >= CORRECT_MS * 0.8,
+    `feedback ${kind} for ${JSON.stringify(word)}, wait message ${said}, prompt ${JSON.stringify(before)} -> ${JSON.stringify(late)} at ${elapsed}ms`);
+}
+
+// Rule B1b, the one place a correct answer does NOT move: a whole-verse
+// speller holds ONE item, so it marks correct, plays the verse and stops. It
+// must not auto-drive the sequential rail, and it must not claim to be waiting
+// for a Next it does not own.
+for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
+  const activity = activitiesOf(chapter).find(a => a && a.type === 'spellVerse');
+  if (!activity) continue;
+  const hash = `#/activity/${chapterId}/${activity.id}`;
+  await go(hash);
+  await setAccents(false);
+  // Chapter 4's verse carries an ELISION MARK (δι᾽ ἐμοῦ, U+1FBD), and the
+  // shared keyboard has no tile for one — its punctuation row is comma, raised
+  // dot, period, question mark. Typing the verse without it is what a learner
+  // on this keyboard can actually do, and D-18 (punctuation optional) is what
+  // makes that a correct answer. So this types the typeable form, and the
+  // exercise accepting it IS the assertion.
+  await typeAccented(stripElision(stripAccents((activity.answerWords || []).join(' '))));
+  await stepper('Check Answer').click();
+  await page.waitForTimeout(200);
+  const kind = await feedbackKind();
+  const said = await awaitNextShown();
+  await shot(`B1b ${chapterId} solved verse stands still`);
+  await page.waitForTimeout(CORRECT_MS * 1.6);
+  check(`5E §1/B1b ${chapterId} ${activity.id}: a solved verse stops, drives no rail, claims no wait`,
+    kind === 'ok' && !said && page.url().includes(activity.id),
+    `feedback ${kind}, wait message ${said}, url ${page.url().split('#')[1] || ''}`);
+}
+
+// §5 / rule C0a, on ALL twelve spellers rather than the one sampled above: a
+// wrong answer never reveals the correct spelling. `Show Answer` stays the
+// opt-in route and is asserted separately in §6.6.
+//
+// The three whole-verse spellers are checked with the SAME rule but a
+// different assertion, because D-13 is a ratified divergence on top of it:
+// they name the one word that was missed ("The word you missed was: λόγος")
+// where the original prints a bare index. That is one word out of the verse,
+// deliberately, and it is asserted as such rather than waved past — what must
+// never appear is the verse itself.
+for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
+  for (const activity of activitiesOf(chapter).filter(a => a && (a.type === 'spell' || a.type === 'spellVerse'))) {
+    const isVerse = activity.type === 'spellVerse';
+    await go(`#/activity/${chapterId}/${activity.id}`);
+    await setAccents(false);
+    await typeGreek('ζζζ');                       // wrong in every exercise in the app
+    const typedBefore = await typed();
+    await stepper('Check Answer').click();
+    await page.waitForTimeout(200);
+    const revealed = await page.locator('.spell-answer, .exercise-answer').count();
+    await shot(`no-reveal ${chapterId} ${activity.id}`);
+    const base = await feedbackKind() === 'bad' && revealed === 0
+      && await typed() === typedBefore && !await awaitNextShown();
+    if (!isVerse) {
+      check(`5E §5 ${chapterId} ${activity.id}: a wrong answer reveals nothing and keeps what was typed`,
+        base, `revealed ${revealed}, typed ${JSON.stringify(typedBefore)} -> ${JSON.stringify(await typed())}`);
+      continue;
+    }
+    // D-13: exactly ONE word is named, and it is a word of the verse.
+    const named = (await page.locator('.sv-detail .sv-word').allInnerTexts()).map(normalizeText);
+    const words = (activity.answerWords || []).map(normalizeText);
+    check(`5E §5 ${chapterId} ${activity.id}: a wrong answer names one missed word (D-13) and reveals no more`,
+      base && named.length <= 1 && named.every(w => words.includes(w)),
+      `named ${JSON.stringify(named)} of ${words.length} verse words, other reveals ${revealed}`);
+  }
+}
+
+// The four classes are a CLOSED set (§1). Neither withdrawn name may survive
+// anywhere in the delivered data — timing.js still normalizes them at runtime,
+// so nothing but an assertion would notice one.
+{
+  const withdrawn = ['spellUntilRight', 'manualCorrectAutoIncorrect'];
+  const found = [];
+  for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
+    for (const activity of activitiesOf(chapter)) {
+      const declared = activity && activity.answerPolicy && activity.answerPolicy.advanceClass;
+      if (withdrawn.includes(declared)) found.push(`${chapterId} ${activity.id} ${declared}`);
+    }
+  }
+  check('5E §1 neither withdrawn class name survives in chapters 1-5',
+    found.length === 0, found.join(', '));
+}
+
 // ------------------------------------------------- §6.2/§6.3 afterGuess audio
 // A clip LONGER than the 2000ms class minimum is seeded into the app's own
 // audio store, so the advance has to be max(2000, clip) and not 2000.
@@ -879,6 +1206,51 @@ const LONG_CLIP_S = 3;
       && advancedAt - answeredAt >= LONG_CLIP_S * 1000 * 0.9,
     `advanced ${advancedAt - answeredAt}ms after the guess; clip ran ${clip && clip.endedAt ? clip.endedAt - clip.startedAt : 'n/a'}ms`);
 
+  // The same wait on the SPELLER, which is where 5E-SPEC3 §1 put a scheduled
+  // advance that had never existed before: a correct spelling must hold the
+  // next word until the word it just spelled has finished being spoken.
+  {
+    const speller = activityById(ch4, 'c4_ex_noun_speller');
+    const answers = spellerAnswers('chapt_4', speller);
+    const spellerPaths = (speller.items || [])
+      .map(entry => audioPath(entry.audio)).filter(Boolean);
+    await go('#/activity/chapt_4/c4_ex_noun_speller');
+    await seedLongClip(spellerPaths, LONG_CLIP_S);
+    await go('#/activity/chapt_4/c4_ex_noun_speller');
+    const beforeWord = await promptGloss();
+    await setAccents(false);
+    await typeAccented(stripAccents(answers[0]));
+    const spelledAt = Date.now();
+    await stepper('Check Answer').click();
+    let nowWord = beforeWord;
+    while (nowWord === beforeWord && Date.now() - spelledAt < LONG_CLIP_S * 1000 * 2.5) {
+      await page.waitForTimeout(50);
+      nowWord = await promptGloss();
+    }
+    const movedAt = Date.now();
+    const spokenClip = await lastClip();
+    check('5E §6.2 afterGuess (speller): the next word waits for a clip longer than 2000ms',
+      nowWord !== beforeWord && !!spokenClip && !!spokenClip.endedAt
+        && movedAt >= spokenClip.endedAt
+        && movedAt - spelledAt >= LONG_CLIP_S * 1000 * 0.9,
+      `advanced ${movedAt - spelledAt}ms after the spelling; clip ran ${spokenClip && spokenClip.endedAt ? spokenClip.endedAt - spokenClip.startedAt : 'n/a'}ms`);
+
+    // §2.3 on the speller: Next during that wait stops the clip and moves now.
+    await go('#/activity/chapt_4/c4_ex_noun_speller');
+    await setAccents(false);
+    await typeAccented(stripAccents(answers[0]));
+    await stepper('Check Answer').click();
+    await page.waitForTimeout(300);
+    const playingNow = await clipsPlaying();
+    const pressed = Date.now();
+    await stepper('Next').click();
+    await page.waitForTimeout(150);
+    check('5E §6.3 Next during a speller\'s afterGuess clip stops it and advances at once',
+      playingNow === 1 && await clipsPlaying() === 0
+        && await promptGloss() !== beforeWord && Date.now() - pressed < 600,
+      `playing ${playingNow} -> ${await clipsPlaying()} in ${Date.now() - pressed}ms`);
+  }
+
   // §6.3 / §2.3: Next during playback stops the clip and moves AT ONCE.
   const item2 = await freshKnownItem('#/activity/chapt_4/c4_drill_greek_noun', activity);
   const beforeNext = await itemNumber();
@@ -1044,21 +1416,48 @@ for (const [label, chapterId, activityId, button] of [
 }
 await page.setViewportSize({ width: 390, height: 900 });
 
-// §5.3: the two rules that NAME what they teach are underlined, in the hint
-// that shows them — and in the Accent Mark Placement exercise's copy of the
-// same hint, because the same sentence must not look different in two places.
-for (const [label, chapterId, activityId, button] of [
+// §5.3 (kept by 5E-SPEC3 §3): the two rules that NAME what they teach are
+// underlined. The stamper shipped with 5E-SPEC3 underlines the PHRASE and
+// leaves the full stop outside it, and it applies the rule wherever the phrase
+// is displayed — the Learn topic's rule list and the two expander labels as
+// well as the hints — so this asserts all five surfaces rather than the two
+// hints 5E-SPEC2 checked. The same sentence must not look different in two
+// places, and there are five of them.
+for (const [label, chapterId, activityId, open] of [
   ['ch2 Accent Rule Drill hint', 'chapt_2', 'c2_drill_accent_rule', 'Hint'],
-  ['ch2 Accent Mark Placement hint', 'chapt_2', 'c2_ex_accent_placement', 'Hint']
+  ['ch2 Accent Mark Placement hint', 'chapt_2', 'c2_ex_accent_placement', 'Hint'],
+  ['ch2 Quick Review accent rules', 'chapt_2', null, null]
 ]) {
-  await go(`#/activity/${chapterId}/${activityId}`);
-  await page.locator('.card').getByRole('button', { name: button, exact: true }).click();
-  await page.waitForTimeout(120);
+  if (activityId) {
+    await go(`#/activity/${chapterId}/${activityId}`);
+    await page.locator('.card').getByRole('button', { name: open, exact: true }).click();
+  } else {
+    await go(`#/activity/${chapterId}/c2_qr_accents`);
+  }
+  await page.waitForTimeout(150);
   const underlined = (await page.locator('.rc-list u').allInnerTexts()).map(normalizeText);
   check(`5E §5.3 ${label}: "Nouns are retentive" and "Verbs are recessive" are underlined`,
-    underlined.includes('Nouns are retentive.') && underlined.includes('Verbs are recessive.'),
+    underlined.includes('Nouns are retentive') && underlined.includes('Verbs are recessive'),
     JSON.stringify(underlined));
 }
+// The Learn topic that teaches the six rules, and the two expander labels
+// under it — the surfaces 5E-SPEC2 deliberately left plain and 5E-SPEC3's
+// stamper marks up. The label is the one that would fail LOUDLY if the
+// renderer did not honour [[u]] there: it would print the tag characters.
+{
+  await go('#/activity/chapt_2/c2_learn_accents');
+  await gotoTopic(3);
+  const listUnderlines = (await page.locator('.rc-list u').allInnerTexts()).map(normalizeText);
+  const summaries = (await page.locator('.rc-expander summary').allInnerTexts()).map(normalizeText);
+  const summaryUnderlines = (await page.locator('.rc-expander summary u').allInnerTexts()).map(normalizeText);
+  check('5E §5.3 ch2 Learn Accent Rules: the rule list underlines both named rules',
+    listUnderlines.includes('Nouns are retentive') && listUnderlines.includes('Verbs are recessive'),
+    JSON.stringify(listUnderlines));
+  check('5E §5.3 ch2 Learn Accent Rules: the expander labels underline the rule name and print no markup',
+    summaryUnderlines.includes('Nouns are retentive') && summaryUnderlines.includes('Verbs are recessive')
+      && summaries.every(text => !text.includes('[[')),
+    JSON.stringify(summaries));
+}
 
 // ------------------------------------------------- §6.7 modals reach Close
 // A close control counts as reachable only if it can be brought FULLY inside
diff --git a/scripts/ui-walk.mjs b/scripts/ui-walk.mjs
index 2508ec6..86705b1 100644
--- a/scripts/ui-walk.mjs
+++ b/scripts/ui-walk.mjs
@@ -7,28 +7,56 @@
 // rendered text/emphasis structure of every teaching page so a diff against
 // the DOSBox originals is mechanical rather than a squint.
 //
-//   node scripts/ui-walk.mjs [--chapters=chapt_1,...,chapt_5] [--out=DIR]
+//   node scripts/ui-walk.mjs [--chapters=chapt_1,...,chapt_5] [--out=DIR] [--force]
 //
 // It expects a preview server on PORT (default 4173): `npm run preview`.
 // Everything a machine can settle must be settled here before a VERIFY
 // document reaches Nathanael; his time is for judgement calls.
+//
+// OUTPUT SAFETY (5E-SPEC3 §4). --out used to DEFAULT to a named round's
+// directory, so running this script with no arguments quietly overwrote 475
+// committed captures from a parallel run. It now defaults to a timestamped
+// directory that cannot collide with anything, and it REFUSES to write into a
+// directory that already has files in it unless --force says to. A tool that
+// silently destroys evidence is worse than a tool that stops.
 
 import { chromium } from 'playwright-core';
-import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
+import { mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
 import { join } from 'node:path';
 
 const args = Object.fromEntries(process.argv.slice(2)
   .filter(a => a.startsWith('--'))
   .map(a => { const i = a.indexOf('='); return i === -1 ? [a.slice(2), true] : [a.slice(2, i), a.slice(i + 1)]; }));
 
+// 2026-08-06T12:26:08 -> 20260806-122608, local time, so two runs a second
+// apart cannot land in the same directory.
+const stamp = new Date();
+const pad = n => String(n).padStart(2, '0');
+const RUN_ID = `${stamp.getFullYear()}${pad(stamp.getMonth() + 1)}${pad(stamp.getDate())}`
+  + `-${pad(stamp.getHours())}${pad(stamp.getMinutes())}${pad(stamp.getSeconds())}`;
+
 const BASE = args.base || `http://localhost:${args.port || 4173}`;
-const OUT = args.out || 'buildout/screenshots/5e-spec1-sol';
+const OUT = args.out || `buildout/screenshots/walk-${RUN_ID}`;
 const WIDTHS = [{ name: '320', width: 320, height: 900 }, { name: '768', width: 768, height: 1100 }];
 const CHAPTERS = String(args.chapters || 'chapt_1,chapt_2,chapt_3,chapt_4,chapt_5').split(',');
 
 const dataFor = id => JSON.parse(readFileSync(`src/data/chapt-0${id.split('_')[1]}.json`, 'utf8'));
 
+// Stop BEFORE the browser launches, so a refusal costs nothing and cannot half-
+// write a corpus. An empty (or absent) directory is fine; anything else needs
+// --force, and the message says exactly what to do instead.
+let existing = [];
+try { existing = readdirSync(OUT); } catch { /* absent is fine — we create it */ }
+if (existing.length && !args.force) {
+  console.error(`REFUSING to write into ${OUT}: it already contains ${existing.length} entr${existing.length === 1 ? 'y' : 'ies'}.`);
+  console.error('  Those may be another run\'s committed evidence. Pass a fresh --out=DIR,');
+  console.error(`  omit --out to use the timestamped default (buildout/screenshots/walk-${RUN_ID}),`);
+  console.error('  or pass --force if overwriting this directory is genuinely what you want.');
+  process.exit(2);
+}
+
 mkdirSync(OUT, { recursive: true });
+console.log(`writing to ${OUT}${args.force && existing.length ? ' (--force: overwriting existing captures)' : ''}`);
 
 // playwright-core does not download a browser. Prefer its configured binary,
 // then fall back to an installed Chrome/Edge channel. This keeps CI's pinned
diff --git a/src/components/DivideActivity.svelte b/src/components/DivideActivity.svelte
index f1c7e42..5453b39 100644
--- a/src/components/DivideActivity.svelte
+++ b/src/components/DivideActivity.svelte
@@ -26,11 +26,12 @@
   //
   // ANSWER POLICY. Check Answer finalizes the item right or wrong and reveals
   // the hyphen-joined divided form. The CLASS decides what happens next, and
-  // this exercise's class is `manualCorrectAutoIncorrect` (5E-SPEC2 §1, from
-  // the DOSBox pass): a correct division WAITS for Next, a wrong one
-  // auto-advances on the longer wait. That is the opposite of the obvious
-  // arrangement and it is what the original does. The advance is cancelled by
-  // manual Previous/Next, by Clear Answer and on unmount.
+  // this exercise's class is `autoBoth` (5E-SPEC3 §1): a correct division
+  // auto-advances on 2000ms like every correct answer in the app (rule B1a), a
+  // wrong one reveals the answer and auto-advances on the longer wait. The
+  // advance is cancelled by manual Previous/Next, by Clear Answer and on
+  // unmount. 5E-SPEC2 shipped this as `manualCorrectAutoIncorrect`, waiting
+  // for Next on a correct division; that class is withdrawn (D-28).
   //
   // AUDIO (§2.2) is `afterGuess`: the word is spoken once the answer is in,
   // and the next word does not appear until the clip has finished.
@@ -216,7 +217,9 @@
   $: oneAttempt = advancePolicy.oneAttempt;
   $: audioTiming = activity.audioTiming || 'afterGuess';
   $: revealed = answered && oneAttempt;
-  // §5.5: manualCorrectAutoIncorrect waits on a CORRECT answer, so say so.
+  // §B4: say so on the outcomes that WAIT. `autoBoth` has none — both paths
+  // move by themselves — so this renders nothing today and would start
+  // rendering by itself if the class were ever reassigned.
   $: awaitingNext = answered && waitsForNext(advancePolicy, answeredCorrect);
   $: answerGaps = new Set((!pending && item.division) || []);
   // Live score (C3): reactive, so the line follows every answer instead of
@@ -406,7 +409,8 @@
     {#if showAnswer || revealed}
       <div class="exercise-answer"><span>Answer</span><span class="greek">{dividedForm(item.greek, item.division)}</span></div>
     {/if}
-    <!-- §5.5: a correct division waits for Next; say so. -->
+    <!-- §B4: the message appears on exactly the outcomes that WAIT. `autoBoth`
+         has none, so this renders nothing today. -->
     {#if awaitingNext}<div class="await-next" role="status">Click Next to continue</div>{/if}
   {/if}
 
diff --git a/src/components/PlaceAccentActivity.svelte b/src/components/PlaceAccentActivity.svelte
index 6a54437..ccd8ebf 100644
--- a/src/components/PlaceAccentActivity.svelte
+++ b/src/components/PlaceAccentActivity.svelte
@@ -6,11 +6,13 @@
   // the form sits by the checkbox row, as in the original.
   //
   // ANSWER POLICY. Check Answer finalizes the item either way and reveals
-  // answerForm. The class is `manualCorrectAutoIncorrect` (5E-SPEC2 §1, from
-  // the DOSBox pass): a correct placement WAITS for Next, a wrong one
-  // auto-advances on the longer wait. AUDIO is `afterGuess` (§2.2) — the word
-  // is spoken after the answer and the next word waits for the clip to end.
-  // Completion = all items ATTEMPTED.
+  // answerForm. The class is `autoBoth` (5E-SPEC3 §1): a correct placement
+  // auto-advances on 2000ms like every correct answer in the app (rule B1a), a
+  // wrong one auto-advances on the longer wait. AUDIO is `afterGuess` (§2.2) —
+  // the word is spoken after the answer and the next word waits for the clip
+  // to end. Completion = all items ATTEMPTED. 5E-SPEC2 shipped this as
+  // `manualCorrectAutoIncorrect`, waiting for Next on a correct placement;
+  // that class is withdrawn (D-28).
   import { onDestroy } from 'svelte';
   import { play, playThrough, stop as stopAudio } from '../lib/audio.js';
   import { randomFeedback } from '../lib/content.js';
@@ -56,7 +58,9 @@
   $: oneAttempt = advancePolicy.oneAttempt;
   $: audioTiming = activity.audioTiming || 'afterGuess';
   $: revealed = answered && oneAttempt;
-  // §5.5: manualCorrectAutoIncorrect waits on a CORRECT answer, so say so.
+  // §B4: say so on the outcomes that WAIT. `autoBoth` has none — both paths
+  // move by themselves — so this renders nothing today and would start
+  // rendering by itself if the class were ever reassigned.
   $: awaitingNext = answered && waitsForNext(advancePolicy, answeredCorrect);
   // ROOT DISPLAY (5B-SPEC4 D2). Every item shows a Greek word in the header --
   // VERIFY3 item 3 found six that showed only a gloss. Those six are the ones
@@ -194,7 +198,8 @@
     {#if showAnswer || revealed}
       <div class="exercise-answer"><span>Answer</span><span class="greek">{word.answerForm}</span></div>
     {/if}
-    <!-- §5.5: a correct placement waits for Next; say so. -->
+    <!-- §B4: the message appears on exactly the outcomes that WAIT. `autoBoth`
+         has none, so this renders nothing today. -->
     {#if awaitingNext}<div class="await-next" role="status">Click Next to continue</div>{/if}
   {/if}
 
diff --git a/src/components/SelectActivity.svelte b/src/components/SelectActivity.svelte
index be010bb..44641e2 100644
--- a/src/components/SelectActivity.svelte
+++ b/src/components/SelectActivity.svelte
@@ -6,9 +6,10 @@
   // ANSWER POLICY. activity.answerPolicy declares WHAT a tap on an option
   // means; src/lib/timing.js decides how long anything waits (D-14 — no
   // timing number lives in this file) and which outcomes move by themselves.
-  // The six classes and their behavior live in that module's header; this
+  // The four classes and their behavior live in that module's header; this
   // component reads the resolved FLAGS (autoOnCorrect / autoOnIncorrect /
-  // revealOnIncorrect / oneAttempt) and never compares a class name.
+  // revealOnIncorrect / oneAttempt) and never compares a class name — which is
+  // why 5E-SPEC3's six-to-four collapse needed no edit here at all.
   // Completion: one-attempt drills complete on all-ATTEMPTED, "until right"
   // drills on all-correct.
   //
@@ -268,8 +269,10 @@
       if (right && advancePolicy.autoOnCorrect) scheduleAdvance(advancePolicy.correctMs, clip);
       else if (!right && advancePolicy.autoOnIncorrect) scheduleAdvance(advancePolicy.incorrectMs, clip);
       else {
-        // A waiting outcome: nothing is scheduled, the surface says so
-        // (waitingForNext), and the clip still gets spoken.
+        // The one waiting outcome left (manualOnIncorrect, wrong): nothing is
+        // scheduled, the surface says so (waitingForNext), and the clip still
+        // gets spoken. A CORRECT answer can never reach this branch — B1a
+        // makes autoOnCorrect a constant.
         cancelAdvance();
         if (clip) play(clip);
       }
@@ -440,8 +443,9 @@
         </div>
       {/if}
       <!-- One attempt, wrong, nothing auto-advancing: say so rather than
-           leaving a locked grid with no explanation (advanceClass
-           manualOnIncorrect). The sequential rail's Next works too. -->
+           leaving a locked grid with no explanation. Since rule B1a this is
+           the app's ONLY waiting outcome — `manualOnIncorrect` on a wrong
+           answer. The sequential rail's Next works too. -->
       {#if waitingForNext}<div class="await-next" role="status">Click Next to continue</div>{/if}
       {#if oneSyllableOption}
         <button
diff --git a/src/components/SpellActivity.svelte b/src/components/SpellActivity.svelte
index 3064047..973a561 100644
--- a/src/components/SpellActivity.svelte
+++ b/src/components/SpellActivity.svelte
@@ -8,15 +8,21 @@
   // Accents" toggle and otherwise follows the one shared policy in
   // lib/answer-check.js.
   //
-  // 5E-SPEC2 §1/§4: every speller in the app is `spellUntilRight`. A correct
-  // spelling WAITS for Next (so the learner can look at what they got right);
-  // a wrong one reveals nothing, keeps what was typed, and leaves the item
-  // open. §2.2: the word's clip is spoken after a correct spelling —
-  // `afterGuess`, because the prompt is an English gloss and pronouncing the
-  // Greek before the answer would hand it over.
+  // 5E-SPEC3 §1/§5: every speller in the app is `retryUntilRight`. A correct
+  // spelling AUTO-ADVANCES like every other correct answer in the app (rule
+  // B1a — there are no exceptions and this class does not get one); a wrong
+  // one reveals nothing, keeps what was typed, and leaves the item open for
+  // another attempt or a manual Next. §2.2: the word's clip is spoken after a
+  // correct spelling — `afterGuess`, because the prompt is an English gloss
+  // and pronouncing the Greek before the answer would hand it over — and the
+  // next word does not appear until that clip has FINISHED, so the wait is
+  // max(ADVANCE_CORRECT_MS, clip) rather than a flat 2000ms.
+  //
+  // 5E-SPEC2 shipped this surface as `spellUntilRight`, waiting for Next on a
+  // correct spelling. That class is withdrawn; see DIVERGENCE-LOG D-28.
   import { onMount, onDestroy } from 'svelte';
   import { getLemma, randomFeedback } from '../lib/content.js';
-  import { play, stop as stopAudio } from '../lib/audio.js';
+  import { play, playThrough, stop as stopAudio } from '../lib/audio.js';
   import { markCompleted } from '../lib/progress.js';
   import { spellingMatches } from '../lib/answer-check.js';
   import { resolveAdvance, waitsForNext } from '../lib/timing.js';
@@ -62,11 +68,25 @@
   let pronounceEach = activity.ui?.defaults?.pronounceEach ?? true;
   let showScore = false;
   let showKeyboard = false;
-  let solved = false;              // this word is spelled right and waiting for Next
+  // This word is spelled right and the surface is moving on by itself. The
+  // input is locked for the length of the wait so a stray keystroke cannot
+  // edit a won answer out from under the clip that is speaking it.
+  let solved = false;
+  let advanceTimer = null;
+  // Bumped by every scheduled advance and by everything that cancels one
+  // (manual Previous/Next, unmount). An advance that waits for a clip resolves
+  // asynchronously, so the token — not the timer handle alone — is what keeps
+  // a superseded advance from firing. §2.3: Next stops the audio and moves at
+  // once, which is this token plus stopAudio().
+  let advanceToken = 0;
 
   $: advancePolicy = resolveAdvance(activity.answerPolicy);
   $: audioTiming = activity.audioTiming || 'afterGuess';
-  // §5.5: spellUntilRight waits for Next on a correct answer, so it says so.
+  // §B4/§5.5: this surface has no waiting outcome left. A correct spelling
+  // moves by itself (B1a) and a wrong one leaves the item open, where the next
+  // thing to do is try again rather than press Next. Kept as a live predicate
+  // rather than deleted so the surface would start SAYING so if the class it
+  // is assigned to ever acquires a waiting outcome.
   $: awaitingNext = solved && waitsForNext(advancePolicy, true);
 
   // Scoring
@@ -100,12 +120,15 @@
       completedWords.add(wordIndex);
       feedback = randomFeedback(chapter, 'correct');
       feedbackKind = 'ok';
-      // spellUntilRight: the item is won and waits for Next. Nothing is
-      // scheduled, so there is no clip racing the next word onto the screen —
-      // the defect the ledger records against all nine spellers.
       solved = true;
       if (completedWords.size === words.length) markCompleted(activity.id);
-      if (pronounceEach && audioTiming === 'afterGuess' && word.audio) play(word.audio);
+      // §B1a: move on by ourselves. The clip is handed to scheduleAdvance
+      // rather than played beside it, so the next word cannot arrive while the
+      // previous word is still being spoken — the defect VERIFY-5E item 11
+      // reports against every afterGuess surface.
+      const clip = pronounceEach && audioTiming === 'afterGuess' && word.audio ? word.audio : null;
+      if (advancePolicy.autoOnCorrect) scheduleAdvance(advancePolicy.correctMs, clip);
+      else if (clip) play(clip);
     } else {
       // §4.4/C1/C2: what was typed STAYS (the port's standing divergence — the
       // manual Clear button is how the slate gets wiped) and the correct
@@ -115,6 +138,24 @@
     }
   }
 
+  function cancelAdvance() {
+    advanceToken += 1;
+    clearTimeout(advanceTimer);
+    advanceTimer = null;
+  }
+
+  // Schedule the move to the next word: no sooner than the class minimum, and
+  // no sooner than the end of the afterGuess clip (§2.2 — the wait is
+  // max(class minimum, audio duration), never shorter than 2000ms). Both
+  // halves are cancelled by cancelAdvance(), so Next always wins (§2.3).
+  function scheduleAdvance(ms, clip) {
+    cancelAdvance();
+    const token = advanceToken;
+    const minimum = new Promise(resolve => { advanceTimer = setTimeout(resolve, ms); });
+    const spoken = clip ? playThrough(clip) : Promise.resolve();
+    Promise.all([minimum, spoken]).then(() => { if (token === advanceToken) goNext(); });
+  }
+
   function resetWordState() {
     buffer = input.clear();
     feedback = '';
@@ -123,12 +164,17 @@
     showAnswer = false;                       // Next resets Show Answer (critique 21)
   }
   // §2.3: moving stops whatever is being spoken and shows the word at once.
+  // This is also where the scheduled advance lands, so it cancels its own
+  // token on the way through — an advance that fires must not leave a live
+  // timer behind it.
   function goNext() {
+    cancelAdvance();
     stopAudio();
     wordIndex = (wordIndex + 1) % words.length;
     resetWordState();
   }
   function goPrev() {
+    cancelAdvance();
     stopAudio();
     wordIndex = (wordIndex - 1 + words.length) % words.length;
     resetWordState();
@@ -153,8 +199,9 @@
     if (g) { e.preventDefault(); appendChar(g); }
   }
   onMount(() => window.addEventListener('keydown', onKey));
-  // §3.1: audio stops when the learner leaves the exercise.
-  onDestroy(() => { window.removeEventListener('keydown', onKey); stopAudio(); });
+  // §3.1: audio stops when the learner leaves the exercise, and a pending
+  // advance does not fire into a destroyed component.
+  onDestroy(() => { window.removeEventListener('keydown', onKey); cancelAdvance(); stopAudio(); });
 </script>
 
 <div class="card speller">
@@ -172,8 +219,10 @@
   </div>
 
   <div class="feedback {feedbackKind}">{feedback}</div>
-  <!-- §5.5: spellUntilRight waits on a correct answer, so it says so rather
-       than sitting on a won word with nothing happening. -->
+  <!-- §B4: the message appears on exactly the outcomes that WAIT. Since §B1a
+       this speller has none — a correct spelling is already on its way to the
+       next word — so this renders nothing today and would start rendering by
+       itself if the class ever acquired a waiting outcome. -->
   {#if awaitingNext}<div class="await-next" role="status">Click Next to continue</div>{/if}
 
   <div class="controls">
diff --git a/src/components/SpellVerseActivity.svelte b/src/components/SpellVerseActivity.svelte
index ab5ea40..ccd62ce 100644
--- a/src/components/SpellVerseActivity.svelte
+++ b/src/components/SpellVerseActivity.svelte
@@ -17,17 +17,24 @@
   // word spellers mount, with the space bar and punctuation row Nathanael
   // selected at the Phase 0 checkpoint.
   // 5E-SPEC2 §2.5 / rule C7: the verse clip plays after a SUCCESSFUL spelling.
-  // The whole-verse spellers played nothing at all before this round — the one
+  // The whole-verse spellers played nothing at all before that round — the one
   // surface in the app where the learner had just reconstructed a verse from
-  // memory and never got to hear it. The class is `spellUntilRight`: a wrong
-  // answer keeps what was typed and reveals nothing, a right one waits for the
-  // sequential rail's Next (§5.5 says so on screen).
+  // memory and never got to hear it.
+  //
+  // The class is `retryUntilRight`, like every other speller: a wrong answer
+  // keeps what was typed and reveals nothing. Rule B1b covers the correct
+  // path here. This activity holds ONE item, so there is nothing to
+  // auto-advance TO: it marks correct, plays the verse, and stops. Auto-driving
+  // the sequential rail to the next activity would be a navigation surprise,
+  // so the rail's Next stays the student's. Nothing waits and nothing says it
+  // is waiting — 5E-SPEC2 shipped a "Click Next to continue" line here for the
+  // withdrawn `spellUntilRight` class, and it is gone with the class (D-28).
   import { onMount, onDestroy } from 'svelte';
   import { randomFeedback } from '../lib/content.js';
   import { play, stop as stopAudio } from '../lib/audio.js';
   import { markCompleted } from '../lib/progress.js';
   import { checkVerse } from '../lib/answer-check.js';
-  import { HINT_VISIBLE_MS, resolveAdvance, waitsForNext } from '../lib/timing.js';
+  import { HINT_VISIBLE_MS } from '../lib/timing.js';
   import * as input from '../lib/speller-input.js';
   import SpellerKeyboard, { KEYMAP, PUNCT_KEYS } from './SpellerKeyboard.svelte';
   import SpellerField from './SpellerField.svelte';
@@ -51,9 +58,7 @@
   let withAccents = false;
   let solved = false;
 
-  $: advancePolicy = resolveAdvance(activity.answerPolicy);
   $: audioTiming = activity.audioTiming || 'afterGuess';
-  $: awaitingNext = solved && waitsForNext(advancePolicy, true);
 
   const fallbackLetters = chapter.alphabet && chapter.alphabet.letters
     ? chapter.alphabet.letters.map(l => (l.lower === 'σ/ς' ? 'σ' : l.lower))
@@ -78,8 +83,8 @@
       detail = null;
       markCompleted(activity.id);
       // §2.5 / C7: hear the verse you just spelled. Nothing is waiting on the
-      // clip here — this class waits for Next, so there is no next item for it
-      // to talk over.
+      // clip here — rule B1b: one item, so there is no next item for it to
+      // talk over and nothing for the auto-advance to advance to.
       if (audioTiming !== 'none' && activity.audio) play(activity.audio);
       return;
     }
@@ -156,9 +161,6 @@
   {#if detail}
     <div class="sv-detail" role="status">{detail.text}{#if detail.word}&nbsp;<span class="greek sv-word">{detail.word}</span>{/if}</div>
   {/if}
-  <!-- §5.5: spellUntilRight waits on a correct answer. This surface has no
-       stepper of its own, so the Next that continues is the sequential rail's. -->
-  {#if awaitingNext}<div class="await-next" role="status">Click Next to continue</div>{/if}
 
   <div class="controls grouped">
     <button class="btn secondary" on:click={toggleHint}>Major Hint</button>
diff --git a/src/lib/timing.js b/src/lib/timing.js
index 94a3928..2f105aa 100644
--- a/src/lib/timing.js
+++ b/src/lib/timing.js
@@ -32,39 +32,47 @@ export const ADVANCE_INCORRECT_MS = 4000;
 // for the same reason the advance constants do — one number, one place.
 export const HINT_VISIBLE_MS = 7000;
 
-// THE SIX ADVANCE CLASSES (DRILL-BEHAVIOR-RULES §B1, 5E-SPEC2 §1). There are
-// six and there are no per-activity exceptions: a new activity is ASSIGNED to
-// a class, and if it needs a seventh that is a finding to report, not a
-// special case to write.
+// THE FOUR ADVANCE CLASSES (DRILL-BEHAVIOR-RULES §B1, 5E-SPEC3 §1). There are
+// four and there are no per-activity exceptions: a new activity is ASSIGNED to
+// a class, and if it needs a fifth that is a finding to report, not a special
+// case to write.
 //
-//   none                        not scored
-//   autoBoth                    correct auto-advances; incorrect reveals the
-//                               answer and auto-advances on the longer wait
-//   manualOnIncorrect           correct auto-advances; incorrect reveals the
-//                               answer, locks the surface and waits for Next
-//   retryUntilRight             correct auto-advances; incorrect reveals
-//                               NOTHING and the item stays open (ch2 Syllable
-//                               Counting is the only non-speller in this class)
-//   manualCorrectAutoIncorrect  correct waits for Next; incorrect reveals the
-//                               answer and auto-advances (ch2 Syllable
-//                               Division and Accent Mark Placement)
-//   spellUntilRight             correct waits for Next; incorrect reveals
-//                               nothing, KEEPS what was typed, retry or Next
+//   none               not scored
+//   autoBoth           correct auto-advances; incorrect reveals the answer and
+//                      auto-advances on the longer wait
+//   manualOnIncorrect  correct auto-advances; incorrect reveals the answer,
+//                      locks the surface and waits for Next
+//   retryUntilRight    correct auto-advances; incorrect reveals NOTHING, keeps
+//                      what was entered and leaves the item open for another
+//                      attempt (all twelve spellers, plus ch2 Syllable Counting)
 //
-// `retryUntilRight` replaces the old `retry` and `spellUntilRight` replaces the
-// old `manual`; both legacy names are still normalized below so a data file
-// that predates the ledger cannot silently fall into the wrong branch.
-// scripts/check-content-shapes.mjs fails the build on anything outside the six.
+// THE CORRECT PATH IS NOT A CLASS PROPERTY (§B1a). Every correct answer
+// auto-advances, in every class, on every surface. 5E-SPEC2 shipped two extra
+// classes -- `spellUntilRight` and `manualCorrectAutoIncorrect` -- whose only
+// distinguishing feature was waiting for Next on a CORRECT answer. That was
+// never observed and never asked for; once §B1a was stated each of them
+// collapsed into a class above (see DIVERGENCE-LOG D-28), which is why there
+// are four rows here and not six.
+//
+// The two withdrawn names, and the older `retry`/`manual` pair that preceded
+// them, are normalized below to the class they migrate to, so a stale cached
+// data file behaves CORRECTLY at runtime rather than falling into an unknown
+// branch. That is a safety net, not a supported spelling:
+// scripts/check-content-shapes.mjs fails the build on anything outside the
+// four, and names the migration when it sees a withdrawn one.
 export const ADVANCE_CLASSES = [
   'none',
   'autoBoth',
   'manualOnIncorrect',
-  'retryUntilRight',
-  'manualCorrectAutoIncorrect',
-  'spellUntilRight'
+  'retryUntilRight'
 ];
 
-const LEGACY_CLASSES = { retry: 'retryUntilRight', manual: 'spellUntilRight' };
+// Withdrawn and legacy spellings -> the class they migrate to (5E-SPEC3 §1).
+export const WITHDRAWN_CLASSES = {
+  spellUntilRight: 'retryUntilRight',
+  manualCorrectAutoIncorrect: 'autoBoth'
+};
+const LEGACY_CLASSES = { retry: 'retryUntilRight', manual: 'retryUntilRight', ...WITHDRAWN_CLASSES };
 
 // Chapter 2 predates advanceClass and declares its policy with the older
 // attemptsPerItem / autoAdvanceOnIncorrect fields; the delivered data now
@@ -79,26 +87,26 @@ function classOf(policy) {
   return 'retryUntilRight';
 }
 
-// The class, expanded into the four questions a surface actually asks. Every
-// scored component reads these flags rather than comparing class names, so
-// adding a class means adding a row here and nothing else.
+// The class, expanded into the questions a surface actually asks. Every scored
+// component reads these flags rather than comparing class names, so adding a
+// class means adding a row here and nothing else.
 export function resolveAdvance(policy) {
   const advanceClass = classOf(policy || {});
   return {
     advanceClass,
-    // A one-attempt item is finalized by the first answer, right or wrong. The
-    // two "until right" classes leave a wrong item open for another attempt.
-    oneAttempt: advanceClass !== 'retryUntilRight' && advanceClass !== 'spellUntilRight',
-    autoOnCorrect: advanceClass === 'autoBoth'
-      || advanceClass === 'manualOnIncorrect'
-      || advanceClass === 'retryUntilRight',
-    autoOnIncorrect: advanceClass === 'autoBoth'
-      || advanceClass === 'manualCorrectAutoIncorrect',
-    // Revealing the answer would destroy an "until right" exercise (§B5), so
-    // those two classes never do it.
-    revealOnIncorrect: advanceClass === 'autoBoth'
-      || advanceClass === 'manualOnIncorrect'
-      || advanceClass === 'manualCorrectAutoIncorrect',
+    // A one-attempt item is finalized by the first answer, right or wrong.
+    // `retryUntilRight` leaves a WRONG item open for another attempt.
+    oneAttempt: advanceClass !== 'retryUntilRight',
+    // §B1a: a constant, deliberately. No class, activity or chapter may opt
+    // out of auto-advancing on a correct answer, so this is not a per-class
+    // expression and a future class cannot quietly make it one. It stays a
+    // field so the components keep asking the module rather than assuming, and
+    // so that breaking §B1a would be one visible edit here.
+    autoOnCorrect: true,
+    autoOnIncorrect: advanceClass === 'autoBoth',
+    // Revealing the answer would destroy an "until right" exercise (§B5/§C0a),
+    // so that class never does it.
+    revealOnIncorrect: advanceClass === 'autoBoth' || advanceClass === 'manualOnIncorrect',
     correctMs: ADVANCE_CORRECT_MS,
     incorrectMs: ADVANCE_INCORRECT_MS
   };
@@ -108,11 +116,11 @@ export function resolveAdvance(policy) {
 // "Click Next to continue" line appears on exactly the outcomes that wait and
 // never on an outcome something is about to move by itself.
 //
-// A wrong answer on an "until right" class does NOT qualify: the item is still
-// open and the next thing to do is try again, not press Next. The three
-// waiting outcomes are manualCorrectAutoIncorrect/spellUntilRight on correct
-// and manualOnIncorrect on incorrect — exactly 5E-SPEC2 §5.5's list.
+// Since §B1a there is exactly ONE waiting outcome in the whole app:
+// manualOnIncorrect on a WRONG answer. A correct answer never waits. A wrong
+// answer on `retryUntilRight` does not qualify either — the item is still open
+// and the next thing to do is try again, not press Next.
 export function waitsForNext(advance, wasCorrect) {
-  if (wasCorrect) return !advance.autoOnCorrect;
+  if (wasCorrect) return false;                       // §B1a, no exceptions
   return advance.oneAttempt && !advance.autoOnIncorrect;
 }
```

### New file: `buildout/5E-SPEC3-RESULTS.md`

```diff
diff --git a/buildout/5E-SPEC3-RESULTS.md b/buildout/5E-SPEC3-RESULTS.md
new file mode 100644
index 0000000..904215b
--- /dev/null
+++ b/buildout/5E-SPEC3-RESULTS.md
@@ -0,0 +1,413 @@
+# 5E-SPEC3-RESULTS.md — cohort 5E round 3
+
+Base commit `8bc8f30` ("saving revisions before 5e spec 3"), which already
+carried the reissued `DRILL-BEHAVIOR-RULES.md`, `DRILL-BEHAVIOR-LEDGER.csv`,
+`apply-behavior-matrix.py` and the restamped `chapt-01..05.json`. Nothing
+committed, nothing pushed. Working tree: 11 modified files, 2 new screenshot
+directories, 2 new deliverables.
+
+---
+
+## 1. Six classes → four (§1)
+
+`spellUntilRight` and `manualCorrectAutoIncorrect` are gone. Every correct
+answer in the app now auto-advances.
+
+**`src/lib/timing.js` is where the collapse happened, and it is nearly the
+whole change.** `resolveAdvance` returns behavior FLAGS and no component
+compares a class name, so five of the six scored surfaces needed no logic edit
+at all — only their comments were wrong. The three edits that mattered:
+
+| Edit | Effect |
+| --- | --- |
+| `autoOnCorrect: true` (a constant, not an expression) | rule B1a becomes structural: no class can opt out, and breaking it would be one visible line |
+| `oneAttempt: advanceClass !== 'retryUntilRight'` | one "until right" class instead of two |
+| `waitsForNext(advance, wasCorrect)` returns `false` whenever `wasCorrect` | one waiting outcome survives in the whole app: `manualOnIncorrect` on a WRONG answer |
+
+`autoOnCorrect` is deliberately a constant rather than a per-class expression.
+§B1a says the correct path is not a class property; encoding it as one would
+have left the next class free to reintroduce the bug this round exists to
+remove.
+
+**The one surface that needed real code: `SpellActivity.svelte`.** It had no
+scheduled advance at all — 5E-SPEC2 removed it when the speller became
+`spellUntilRight`. It is back, and it is the token-guarded
+`Promise.all([minimumTimer, playThrough(clip)])` the other surfaces use, so a
+correct spelling waits `max(2000ms, clip)` and the next word never arrives on
+top of the clip speaking the previous one. Cancelled by Previous, by Next and
+on unmount.
+
+**Withdrawn names are normalized at runtime and REFUSED at build time.**
+`timing.js` maps `spellUntilRight → retryUntilRight` and
+`manualCorrectAutoIncorrect → autoBoth` so a stale cached data file behaves
+correctly rather than falling into an unknown branch; `check:shapes` and the
+ledger stamper both hard-fail on either name and name the migration:
+
+```
+FAIL: chapt-01.json.exercise[7].answerPolicy.advanceClass: "spellUntilRight"
+was WITHDRAWN in 5E-SPEC3 §1 — it existed only to wait for Next on a correct
+answer, which rule B1a forbids. Restamp this activity as "retryUntilRight".
+```
+
+That combination is on purpose: a silently-working withdrawn name is exactly
+how the six-class table survived a round without anyone noticing.
+
+### Acceptance, measured through the UI
+
+One class per chapter, plus both restamped chapter-2 exercises, plus every
+chapter's word speller. Every figure below is a real transition timed in a
+real browser; **no assertion encodes an answer key** (see §5.1).
+
+| Surface | Class | Correct answer advanced at | Wait message |
+| --- | --- | --- | --- |
+| ch1 Vocabulary: English to Greek | autoBoth | 2022 ms | none |
+| ch2 Vocabulary: Greek to English | autoBoth | 2054 ms | none |
+| ch2 Marking Recognition | manualOnIncorrect | 2029 ms | none |
+| ch2 Syllable Counting | retryUntilRight | 2027 ms | none |
+| ch2 **Accent Mark Placement** | autoBoth (was manualCorrectAutoIncorrect) | 2092 ms | none |
+| ch2 **Syllable Division** | autoBoth (was manualCorrectAutoIncorrect) | 2079 ms | none |
+| ch3 Scripture Memory | autoBoth | 2041 ms | none |
+| ch3 Verb Translating | manualOnIncorrect | 2032 ms | none |
+| ch4 Scripture Memory | autoBoth | 2018 ms | none |
+| ch4 Greek Noun | manualOnIncorrect | 2033 ms | none |
+| ch5 Vocabulary: English to Greek | autoBoth | 2044 ms | none |
+| ch5 Definite Article | manualOnIncorrect | 2022 ms | none |
+| ch1 `c1_ex_speller` | retryUntilRight (was spellUntilRight) | 2067 ms | none |
+| ch2 `c2_ex_speller` | retryUntilRight (was spellUntilRight) | 2049 ms | none |
+| ch3 `c3_ex_verb_speller` | retryUntilRight (was spellUntilRight) | 2048 ms | none |
+| ch4 `c4_ex_noun_speller` | retryUntilRight (was spellUntilRight) | 2040 ms | none |
+| ch5 `c5_ex_noun_speller` | retryUntilRight (was spellUntilRight) | 2071 ms | none |
+
+`max(2000, clip)` holds on the new speller path too. With a 3-second clip
+seeded into the app's own audio store:
+
+```
+5E §6.2 afterGuess (speller): the next word waits for a clip longer than 2000ms
+  advanced 3161ms after the spelling; clip ran 3059ms
+5E §6.3 Next during a speller's afterGuess clip stops it and advances at once
+  playing 1 -> 0 in 189ms
+```
+
+### B1b — the three whole-verse spellers
+
+They carry `retryUntilRight` like every other speller and the auto-advance is a
+no-op, exactly as §1 says. All three mark correct, play the verse, and stand
+still; none drives the sequential rail; none claims to be waiting. The
+"Click Next to continue" line 5E-SPEC2 put on this surface is gone with the
+class that justified it.
+
+### The wrong path is unchanged
+
+`manualOnIncorrect` on a wrong answer is now the app's **only** waiting
+outcome, and it still reveals, locks and says so. `retryUntilRight` on a wrong
+answer still reveals nothing and stays open. `autoBoth` on a wrong answer still
+reveals and advances on 4000 ms (ch2 Accent Placement measured at 4061 ms).
+
+---
+
+## 2. §5 — no speller reveals the spelling
+
+Asserted on **all twelve**, not a sample. Each is given `ζζζ`, which is wrong
+in every exercise in the app:
+
+```
+5E §5 chapt_1 c1_ex_speller             revealed 0, typed "ζζζ" -> "ζζζ"
+5E §5 chapt_2 c2_ex_speller             revealed 0, typed "ζζζ" -> "ζζζ"
+5E §5 chapt_3 c3_ex_verb_speller        revealed 0, typed "ζζζ" -> "ζζζ"
+5E §5 chapt_3 c3_ex_vocab_speller       revealed 0, typed "ζζζ" -> "ζζζ"
+5E §5 chapt_4 c4_ex_noun_speller        revealed 0, typed "ζζζ" -> "ζζζ"
+5E §5 chapt_4 c4_ex_vocab_speller       revealed 0, typed "ζζζ" -> "ζζζ"
+5E §5 chapt_5 c5_ex_noun_speller        revealed 0, typed "ζζζ" -> "ζζζ"
+5E §5 chapt_5 c5_ex_article_speller     revealed 0, typed "ζζζ" -> "ζζζ"
+5E §5 chapt_5 c5_ex_vocab_speller       revealed 0, typed "ζζζ" -> "ζζζ"
+```
+
+**Your reading was already true in the tree, and I did not have to change
+anything to satisfy it.** 5E-SPEC2 §4.4 had already made every speller
+non-revealing; what §5 changes is the RULE (C0a) and the class name, not the
+behavior. The nine spellers §5 describes as "currently revealing" reveal
+nothing in this build and revealed nothing in the last one. The two things §5
+gives as evidence — that `c1_ex_speller` and `c2_ex_speller` already behave
+that way, and that revealing would end the exercise — are both right; the tree
+was not actually inconsistent, all twelve already agreed.
+
+### One thing §5 does not cover, reported rather than changed
+
+The three whole-verse spellers name the ONE word you missed
+("The word you missed was: λέγει"). That is **D-13**, a divergence ratified in
+5D: the original prints a bare index ("The word you missed was: 2") and telling
+a learner to go and count is worse than naming it. It is a partial reveal, and
+under a literal reading of C0a ("a wrong answer reveals nothing") it is a
+violation.
+
+I did not change it — §8 puts D-13 out of scope and removing it would leave the
+verse speller with no diagnostic at all. It is now asserted explicitly rather
+than waved past, so the harness states the exception out loud:
+
+```
+5E §5 chapt_3 c3_ex_scripture_speller: a wrong answer names one missed word
+(D-13) and reveals no more — named ["λέγει"] of 14 verse words, other reveals 0
+5E §5 chapt_4 ... named ["οὐδεὶς"] of 9 verse words, other reveals 0
+5E §5 chapt_5 ... named ["πάντες"] of 9 verse words, other reveals 0
+```
+
+**Your call**: leave D-13, or reduce the verse spellers to a bare correct /
+incorrect. I recommend leaving it.
+
+---
+
+## 3. §2 — 5E-SPEC2 §5.6 withdrawn
+
+No option-grid layout changed. The 29-grid census and the permanent guard both
+stay and both still pass:
+
+```
+5E §6.8 four-up at 320px is confined to the named single-glyph/number grids
+  c1_ex_letter_to_name, c1_ex_name_to_letter, c1_ex_translit,
+  c1_ex_transcribe, c2_drill_syllable_counting
+5E §6.8 no option grid is denser at 320px than at 768px — none
+```
+
+All ten vocabulary grids measure 2-up at 320px and 4-up at 768px, all four
+paradigm grids stay 2-up at both widths (D-26), and the two declared layouts
+stay single-column. That is the residue §2 asks to keep.
+
+---
+
+## 4. §3 / §7 — the accent-rule underlines
+
+Kept data-side, as §3 directs. **The stamper shipped with this spec is a
+material change from my round-2 copy, and §7 asked me to diff before
+overwriting, so here is the diff.**
+
+| | round-2 copy (mine) | shipped with 5E-SPEC3 | kept |
+| --- | --- | --- | --- |
+| phrase | `Nouns are retentive.` — sentence, full stop INSIDE the underline | `Nouns are retentive` — phrase, full stop outside | **shipped** |
+| scope | hint content only | every displayed string | **shipped** |
+| strings marked | 4 | **10** | **shipped** |
+
+The shipped scope is the deliberate one: §7 says "ten strings across chapter 2"
+and the shipped script produces exactly ten. My narrower hint-only scoping was
+the divergence, and it is discarded. The ten are the Learn topic's rule list
+(2), the two expander labels (2), both drill/exercise hint copies (4), and the
+Quick Review copy (2).
+
+The expander labels were the one that could have failed loudly — a label that
+did not honour `[[u]]` would print the tag characters on screen. It does honour
+them; verified in the image as well as the assertion:
+
+```
+5E §5.3 ch2 Learn Accent Rules: the expander labels underline the rule name
+and print no markup — ["Rule 1: Nouns are retentive", "Rule 2: Verbs are
+recessive", "Rule 3: Long Ultima, no antepenult accent", ...]
+```
+
+Five surfaces are now asserted where 5E-SPEC2 asserted two.
+
+### What I merged BACK onto the shipped script
+
+The reissued copy had lost four things my round-2 copy carried. None of them
+touches the underline rule or the four-class validator; all four are restored,
+so §8's "everything else stands as shipped" actually holds:
+
+1. **UTF-8 stdout.** Without it the script does its work and then *crashes* on
+   Windows printing what it did — the report echoes Greek and the console is
+   cp1252. This is a real crash, not a nicety.
+2. **The app-wide typographic sweep.** The shipped copy walks only
+   `chapt-NN.json`. D2 is an app-wide rule and the last displayed double
+   hyphens in the tree were in `intro.json` ("WELCOME --", "-- ENJOY") and two
+   chapter-1 lexicon glosses — files that loop never opens. Without the sweep,
+   `check:shapes` would fail on a `--` that no tool could fix.
+3. **`indent_of`.** `intro.json` is written at indent 2 and the chapter files at
+   indent 1; rewriting one string without it reflows 120 lines.
+4. **The spaced `--` pattern and the provenance skip** (`_`-prefixed keys plus
+   `audioInventory`), so the Introduction's spaced form is caught and pipeline
+   notes are not rewritten.
+
+### One fix of my own
+
+The script wrote in Python text mode, so on Windows every run translated LF to
+CRLF and rewrote all five chapter files even when nothing changed — its own
+docstring promises "running it twice changes nothing the second time". Writing
+with `newline=''` makes that literally true. **Verified: the data files are
+byte-identical to `8bc8f30` after this round, and no data file is in the
+diff.**
+
+---
+
+## 5. §4 — the harness footgun that destroyed a parallel run
+
+`scripts/ui-walk.mjs`:
+
+- `--out` now defaults to `buildout/screenshots/walk-<YYYYMMDD-HHMMSS>`, which
+  cannot collide with anything;
+- it **refuses** to write into a directory that already has files in it, and
+  the check runs *before the browser launches*, so a refusal costs nothing and
+  cannot half-write a corpus;
+- `--force` is the explicit override, and it says so in the log line.
+
+Verified against the very directory it destroyed last round:
+
+```
+$ node scripts/ui-walk.mjs --out=buildout/screenshots/5e-spec1-sol
+REFUSING to write into buildout/screenshots/5e-spec1-sol: it already contains 3 entries.
+  Those may be another run's committed evidence. Pass a fresh --out=DIR,
+  omit --out to use the timestamped default (buildout/screenshots/walk-20260806-131243),
+  or pass --force if overwriting this directory is genuinely what you want.
+exit code: 2
+```
+
+Sol's captures were untouched.
+
+### 5.1 A harness change worth naming
+
+The §1 acceptance driver **learns the correct answer from the app** rather than
+reading one out of the data. A wrong tap on a one-attempt class reveals the
+answer, so the driver spends one pass learning a prompt and a later pass
+measuring it. Nothing in the §1 suite encodes what the right answer is, which
+means it cannot pass by agreeing with a data file that is itself wrong.
+
+Two real ambiguities in the delivered data are handled by evidence rather than
+by an answer key, and both cost me a false failure before I understood them:
+
+- **Two options with the same label.** Nominative and vocative plural are
+  homographs in every paradigm, so more than one tile lights up. That reveal is
+  discarded rather than guessed at.
+- **Two items with the same prompt and different answers.** `c4_drill_greek_noun`
+  ships "Brother will betray brother" (Mat 10:21) twice. A learned answer is
+  wrong on the second one — which shows up as `bad` feedback on the measurement
+  pass, so the prompt is struck off and the walk continues instead of reporting
+  a broken advance. My first draft reported exactly that false failure.
+
+---
+
+## 6. Report, do not act
+
+### 6.1 Is `attemptsPerItem: "retry"` doing anything?
+
+**No. The class alone drives behavior, and the field is dead weight on every
+shipped activity.**
+
+`attemptsPerItem` is read in exactly one place in `src/`:
+
+```js
+// src/lib/timing.js, classOf()
+function classOf(policy) {
+  const declared = policy.advanceClass;
+  if (declared) return LEGACY_CLASSES[declared] || declared;   // ← always taken
+  if (policy.attemptsPerItem === 1) { ... }
+  return 'retryUntilRight';
+}
+```
+
+The field is consulted only on the FALLBACK branch, and that branch is
+unreachable for delivered data: all 43 scored activities carry an explicit
+`advanceClass`. Two further points:
+
+- The string `"retry"` is never compared to anything. `classOf` returns
+  `retryUntilRight` for any value that is not `1`, so `"retry"`, `"many"` and a
+  missing field are indistinguishable. Only `attemptsPerItem: 1` has any
+  discriminating power, and only when `advanceClass` is absent.
+- A correction to §6.1's count: the stamp sets `"retry"` on **13**
+  `retryUntilRight` activities, not fourteen — the twelve spellers plus
+  `c2_drill_syllable_counting`. (Fourteen is the count of SPELLING exercises in
+  the ledger, twelve of which are spellers; the other two are the chapter-2
+  exercises, which are now `autoBoth`.)
+
+**Recommendation for the next stamp:** remove `attemptsPerItem` entirely — but
+remove the fallback branch in `classOf` with it, or an unstamped future chapter
+would silently become `retryUntilRight` instead of failing. The safe order is:
+make `answerPolicy` without `advanceClass` a `check:shapes` failure first, then
+delete the field and the fallback together. I have not done any of this.
+
+### 6.2 `c1_ex_pronounce` button set
+
+**Previous, Next Letter and Check Answer all render. Nothing is missing.**
+
+The data lists `ui.buttons: ["Next Letter", "Check Answer"]`, but the
+`selfCheckStepper` mode does not read `ui.buttons` — it hard-codes its three
+controls in `ContentAudio.svelte:324-328` and reads only `ui.hint` from that
+object. Previous is present and disabled at the first letter; Check Answer is
+disabled until a letter is showing. Confirmed in the walk capture
+(`5e-spec3/320/chapt_1/c1_ex_pronounce.png`).
+
+So the ledger's `TARGET Prev/Next? = yes` is **satisfied on screen**, and the
+stamper's warning —
+
+```
+ledger wants Previous/Next but data has none: c1_ex_pronounce
+```
+
+— is a false positive: it inspects `ui.buttons` on a mode that ignores it. The
+ledger's own disposition column says `KEEP AS IS`, which agrees with what
+renders. I changed nothing. If you want the warning to stop, the fix is in the
+stamper's check, not in the data.
+
+---
+
+## 7. One thing I did that the spec did not ask for
+
+The reissued `DRILL-BEHAVIOR-RULES.md` points at **DIVERGENCE-LOG D-28** twice
+(§B1a and the collapse note) and the log stopped at D-27. I wrote D-28, since a
+canonical document referencing an entry that does not exist is the same class of
+problem this round is fixing. It records the collapse, names it as a deliberate
+departure from observed behavior rather than a fidelity claim, and notes B1b as
+a no-op rather than an exception. Revert it if you would rather write it
+yourself.
+
+---
+
+## 8. Verification
+
+| Harness | Result |
+| --- | --- |
+| `npm run check:shapes` | PASS — every advanceClass is one of the **four** |
+| `npm run build` | 87 modules, 27 precache entries (691.26 KiB); one pre-existing A11y warning at `DivideActivity.svelte:368` |
+| `npm run check:lazy-chunk` | PASS — five chapter + five lexicon chunks, chapter data out of `index-*.js` |
+| `npm run verify` | green end to end |
+| `apply-behavior-matrix.py` | 50 activities from 50 confirmed rows; 28 TO FILL skipped; **byte-idempotent** |
+| `ui-behavior.mjs` | **240/240**, three consecutive clean runs |
+| `ui-walk.mjs` | 105 stops × 2 widths, 0 px horizontal overflow, no console errors, all expanders and chart states opened |
+| offline (throwaway, not committed) | **7/7** — all five chapters render with the network cut, a hard refresh on an activity route survives, and a correct spelling with **no downloaded clip** advances at 2078 ms rather than hanging on a fetch that can never resolve |
+
+The behavior suite grew from 203 checks to 240.
+
+### Visual verification of the states that had never been photographed
+
+You asked for everything not verified last round. The gap was structural:
+`ui-walk.mjs` screenshots a rail stop as it ARRIVES, so no image in any corpus
+had ever shown a drill *after an answer* — which is precisely where every
+behavior change of cohort 5E lives.
+
+`ui-behavior.mjs` now takes `--shots=DIR` and photographs the answered state at
+the moment each assertion reads it. 37 captures in
+`buildout/screenshots/5e-spec3-answered/`, covering every correct-path advance
+in the table above, both chapter-2 exercises on both paths, the one remaining
+waiting outcome, all three solved verses, and all twelve spellers' wrong-answer
+state.
+
+I looked at them. Worth naming:
+
+- `06-speller-correct-auto-advancing-.png` — "Perfect!", **no** "Click Next to
+  continue" line, input locked while it moves.
+- `03-ch2-accent-placement-correct.png` — correct placement, answer shown, no
+  wait line, on its way to item 2 of 25.
+- `24-b1b-chapt-4-solved-verse-stands-still.png` — "Congratulations", standing
+  still, no wait line, rail untouched.
+- `01-manualonincorrect-incorrect-...png` — the app's only surviving waiting
+  outcome, still saying so.
+- `5e-spec3/320/chapt_2/c2_learn_accents--topic4.png` — the ten-string underline
+  scope, rendering correctly in both the rule list and the expander labels,
+  full stop outside the underline, no `[[u]]` leakage.
+
+The full 474-shot arrival walk is in `buildout/screenshots/5e-spec3/`.
+
+---
+
+## 9. What is NOT in this round
+
+Per §8: audio timing, the §3 lifecycle fixes, the §4 speller validation
+changes, the modal work, the hanging indents and the harness coverage all stand
+as 5E-SPEC2 shipped them. The six→four collapse is the only behavioral change.
+
+No data file changed. No commit, no push.
```

## 4. Generated evidence not embedded

| Path | Contents |
| --- | --- |
| `buildout/screenshots/5e-spec3/320/**` | 237 PNGs — every chapter 1-5 rail stop at 320px |
| `buildout/screenshots/5e-spec3/768/**` | 237 PNGs — the same stops at 768px |
| `buildout/screenshots/5e-spec3/walk-report.json` | structured walk output (per-stop overflow measurements, rail state, expander/chart states) |
| `buildout/screenshots/5e-spec3-answered/**` | 37 PNGs — the ANSWERED state of every surface the behavior suite exercises, captured at the moment each assertion reads it. No previous corpus contained a single post-answer image. |

`buildout/screenshots/5e-spec1-sol/**` was NOT touched this round, and the
guard added under §4 was tested against that exact directory before the walk
was run.

## 5. Commands run, and their results

```
npm run check:shapes
  PASS: content shapes intact - chapt-01..05 checked (... every advanceClass is
  one of the FOUR and every audioTiming one of the five ...)

  negative control, reverted immediately:
  FAIL: chapt-01.json.exercise[7].answerPolicy.advanceClass: "spellUntilRight"
  was WITHDRAWN in 5E-SPEC3 §1 - it existed only to wait for Next on a correct
  answer, which rule B1a forbids. Restamp this activity as "retryUntilRight".

npm run build
  87 modules transformed; 27 precache entries (691.26 KiB)
  one warning, pre-existing: DivideActivity.svelte:368 A11y noninteractive
  element cannot have nonnegative tabIndex

npm run check:lazy-chunk
  PASS: lazy-chapter split intact - chapt-01..05 + lexicon-chapt01..05 emitted,
  precached, and chapter data is out of index-DoiQ9KYN.js

npm run verify
  green end to end

python scripts/apply-behavior-matrix.py buildout/DRILL-BEHAVIOR-LEDGER.csv src/data
  stamped 50 activities from 50 confirmed rows
  28 TO FILL rows skipped (chapters 6, 7, 8)
  ledger wants Previous/Next but data has none: c1_ex_pronounce   (see §6.2 of
    the RESULTS - a false positive; the mode does not read ui.buttons.
    Nothing changed.)
  second run: byte-identical output, verified with cmp against git show HEAD:

BASE=http://localhost:4175 node scripts/ui-behavior.mjs --shots=buildout/screenshots/5e-spec3-answered
  240/240 behavior checks passed   (three consecutive runs)

BASE=http://localhost:4175 node scripts/ui-walk.mjs --out=buildout/screenshots/5e-spec3
  walked 105 stops x 2 widths -> buildout/screenshots/5e-spec3
  no horizontal overflow in chapters 4 or 5
  all rail counts and Next actions are live
  all authored expanders and chart states opened
  no console errors

BASE=http://localhost:4175 node scripts/ui-walk.mjs --out=buildout/screenshots/5e-spec1-sol
  REFUSING to write into buildout/screenshots/5e-spec1-sol: it already contains
  3 entries. ... exit code 2, browser never launched, nothing written.

offline preview regression (throwaway script, scratchpad, not committed)
  7/7 - all five chapters render with the network cut, a hard refresh on an
  activity route survives, and a correct spelling with NO downloaded clip
  advances at 2078ms on the class minimum rather than hanging on a fetch that
  can never resolve. One console error, the expected offline audio-miss fetch.
```

## 6. Build-shape assertions, inspected rather than assumed

- `dist/assets/` contains one `chapt-NN-*.js` and one `lexicon-chaptNN-*.js`
  per chapter, five of each, asserted by `check-lazy-chunk.mjs`.
- Chapter data is absent from `index-*.js`, asserted by the same script.
- `dist/sw.js` precaches 27 entries, the same count as the base commit.
- `SpellActivity` reuses `playThrough` from `src/lib/audio.js`; no new `/audio/`
  path appears in `src/` outside `audio.js`, `downloads.js` and `packs.js`, and
  no second IndexedDB writer was added.
- The `--shots` capture path writes only under the directory passed to it and
  is a no-op when the flag is absent, so the behavior suite's default run is
  byte-for-byte the run it was before.
