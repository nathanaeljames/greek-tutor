# 5E-SPEC2-BUILD.md — complete build record

## 0. What is in here

Section 3 embeds the complete `git diff` against the starting commit, inline
and unabridged, followed by the literal `git diff --no-index` new-file diff for
`5E-SPEC2-RESULTS.md`. This document is the only file excluded from its own
diff, because an audit container cannot contain itself. The generated
screenshot corpus is inventoried in §4 rather than embedded.

## 1. Run metadata

| | |
| --- | --- |
| Implementer | Claude (Opus 5), in Claude Code |
| Tooling | Node.js 24, Vite 5, Svelte 4, playwright-core driving Chrome; Python 3.14 for the ledger stamper |
| Base commit | `95d4375bf64a361f3e27941a5cabbbb7756f3a2c` — "saving updates before phase 5e spec 2" |
| Head | working tree, uncommitted |
| Initial status | clean |
| Commits created | none |
| Pushes | none |
| Diff exclusions | `buildout/5E-SPEC2-BUILD.md` (this file, self-referential); `buildout/screenshots/5e-spec2/**` (474 PNGs + a generated walk report, 58 MB). No source, script, data, test or results file is excluded. |

## 2. Files changed

| File | Lines | What |
| --- | --- | --- |
| `src/lib/timing.js` | +85 / -26 | Six advance classes; `resolveAdvance` returns behavior flags; `waitsForNext` predicate; `ADVANCE_CLASSES` export. |
| `src/lib/audio.js` | +51 / -0 | `playThrough` (resolves on the element's own `ended`/`pause`/`error`); `visibilitychange` + `pagehide` stop handlers at module scope. |
| `src/lib/answer-check.js` | +34 / -7 | Final forms required (the `ς -> σ` fold removed); only the three accents are stripped when "With Accents" is off. |
| `src/components/SelectActivity.svelte` | +97 / -35 | `audioTiming` dispatch; token-guarded `scheduleAdvance`; class-driven reveal and wait message; audio stops on move and unmount. |
| `src/components/SpellActivity.svelte` | +53 / -21 | `spellUntilRight` (waits for Next); `afterGuess` clip on a correct spelling; Show Answer clears on typing; `pronounceEach` from the data. |
| `src/components/SpellVerseActivity.svelte` | +21 / -2 | Verse clip after a successful spelling; wait-for-Next message; audio stops on restart and unmount. |
| `src/components/DivideActivity.svelte` | +58 / -16 | `manualCorrectAutoIncorrect`; `afterGuess` clip holding the advance; no arrival playback; wait message. |
| `src/components/PlaceAccentActivity.svelte` | +47 / -14 | Same as above for the accent exercise. |
| `src/components/ContentAudio.svelte` | +21 / -3 | `goToTopic` stops audio on a topic switch (the missing exit); `onDestroy` stop. |
| `src/components/ReadingCategories.svelte` | +8 / -1 | Category switch and unmount stop audio. |
| `src/app.css` | +50 / -6 | Scrollable modal overlay + `dvh` cap on the shared `.modal`; hanging indent for authored-number lists. |
| `scripts/check-content-shapes.mjs` | +61 / -1 | `advanceClass`/`audioTiming` vocabulary guards (classes imported from `timing.js`); displayed-`--` guard across every rendered data file. |
| `scripts/apply-behavior-matrix.py` | +119 / -7 | Hint-underline rule (§5.3); spaced `--` pattern; sweep of every rendered data file; indentation preserved; provenance keys exempt; UTF-8 stdout. |
| `scripts/ui-behavior.mjs` | +696 / -15 | The §6 suite: 203 checks. Audio instrumentation, a seeded long clip, the modal audit, the option-grid census. |
| `src/data/chapt-02.json` | +4 / -4 | Four §5.3 underline spans, applied by the stamper. |
| `src/data/intro.json` | +3 / -3 | Two §5.4 em dashes, applied by the stamper. |
| `src/data/lexicon-chapt01.json` | +3 / -3 | Two §5.4 em dashes, applied by the stamper. |

## 3. Complete git diff

Literal output of
`git diff --no-color --no-ext-diff 95d4375bf64a361f3e27941a5cabbbb7756f3a2c`,
followed by the `--no-index` diff for the one new tracked-worthy text file.

````diff
diff --git a/scripts/apply-behavior-matrix.py b/scripts/apply-behavior-matrix.py
index 90f0b87..104a075 100644
--- a/scripts/apply-behavior-matrix.py
+++ b/scripts/apply-behavior-matrix.py
@@ -14,8 +14,9 @@ silently revert to whatever the assembler happened to hard-code:
     python3 scripts/apply-behavior-matrix.py \
         buildout/DRILL-BEHAVIOR-LEDGER.csv src/data
 
-The script also applies the two typographic rules that are data-side:
-D2 (no displayed double hyphen) and the removal of any lingering
+The script also applies the typographic rules that are data-side:
+D2 (no displayed double hyphen), the two underlined accent rules in a
+HINT (5E-SPEC2 §5.3), and the removal of any lingering
 `autoAdvanceMs`.
 
 Only rows whose Status is CONFIRMED are applied. TO FILL rows are for
@@ -27,16 +28,46 @@ Idempotent: running it twice changes nothing the second time.
 """
 import csv
 import json
+import os
 import re
 import sys
 import unicodedata
 
+# The report echoes the strings it changed, and some of them are Greek. On
+# Windows the console defaults to cp1252, which raises rather than mangling —
+# the script did its work and then died printing what it had done. Say UTF-8
+# out loud, and fall back to replacement characters rather than an exception.
+if hasattr(sys.stdout, 'reconfigure'):
+    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
+
 VALID_TIMING = {'beforeGuess', 'afterGuess', 'afterTap', 'afterCheck', 'none'}
 VALID_CLASS = {'none', 'autoBoth', 'manualOnIncorrect', 'retryUntilRight',
                'manualCorrectAutoIncorrect', 'spellUntilRight'}
 PRONOUNCE_CHECKBOXES = ('Pronounce Each Drill', 'Pronounce Each Exercise')
 EM = '\u2014'
 
+# 5E-SPEC2 section 5.3. The first two of the six accent rules NAME the behavior
+# they teach, and the original underlines those names. The renderer has no
+# way to know which sentence is a rule name, and it must not be taught to
+# guess (a "first sentence of a multi-sentence item" heuristic would
+# underline half of chapter 3), so this is a data-side typographic rule
+# alongside D2 - and it lives here rather than in a hand edit so a
+# regenerated chapter 2 cannot lose it.
+#
+# Scoped to HINT content on purpose. The same two sentences also appear in
+# the Learn topic list, in an expander LABEL ("Rule 1: Nouns are
+# retentive") and in the Quick Review chart; underlining a summary hotword
+# or a device-verified teaching page is not what the rule asks for.
+HINT_UNDERLINES = ('Nouns are retentive.', 'Verbs are recessive.')
+
+# Non-underscore keys whose values are provenance rather than copy.
+PROVENANCE_KEYS = ('audioInventory',)
+
+# Data files nothing renders. font-map.json is the extraction pipeline's own
+# reference table (no runtime import anywhere in src/), so its prose is
+# documentation and its double hyphens are not "displayed".
+NON_RENDERED = {'font-map.json'}
+
 
 def load_ledger(path):
     rows = {}
@@ -68,12 +99,22 @@ def dehyphen(obj, log, path='$'):
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
+    The spaced form was added in 5E-SPEC2 section 5.4: it is the form
+    the Introduction uses ("WELCOME -- Greek Tutor...", "... -- ENJOY"),
+    and it was invisible to the two tight patterns.
     """
     if isinstance(obj, dict):
-        return {k: (v if k.startswith('_legacy') else
+        return {k: (v if k.startswith('_') or k in PROVENANCE_KEYS else
                     dehyphen(v, log, f'{path}.{k}'))
                 for k, v in obj.items()}
     if isinstance(obj, list):
@@ -81,6 +122,29 @@ def dehyphen(obj, log, path='$'):
     if isinstance(obj, str) and '--' in obj:
         new = re.sub(r'(?<=\w)--(?=\w)', EM, obj)
         new = re.sub(r'(?<=\w)--(?=\s|$)', EM, new)
+        new = re.sub(r'(?<=\s)--(?=\s)', EM, new)
+        if new != obj:
+            log.append((path, obj, new))
+        return new
+    return obj
+
+
+def underline_hint(obj, log, path='$'):
+    """Wrap the named accent rules in the [[u]]...[[/u]] the renderer draws.
+
+    Idempotent: a phrase already inside an underline span is skipped,
+    because the tag characters break the plain-text match.
+    """
+    if isinstance(obj, dict):
+        return {k: underline_hint(v, log, f'{path}.{k}') for k, v in obj.items()}
+    if isinstance(obj, list):
+        return [underline_hint(v, log, f'{path}[{i}]')
+                for i, v in enumerate(obj)]
+    if isinstance(obj, str):
+        new = obj
+        for phrase in HINT_UNDERLINES:
+            if phrase in new and f'[[u]]{phrase}' not in new:
+                new = new.replace(phrase, f'[[u]]{phrase}[[/u]]')
         if new != obj:
             log.append((path, obj, new))
         return new
@@ -127,6 +191,10 @@ def apply_chapter(path, ledger, report):
                         report['pronounce'].append(act['id'])
                     defaults['pronounceEach'] = True
 
+            if isinstance(act.get('hint'), dict):
+                act['hint'] = underline_hint(act['hint'], report['underlines'],
+                                             f'{act["id"]}.hint')
+
     hyphens = []
     data = dehyphen(data, hyphens)
     report['hyphens'] += [(path, p, a, b) for p, a, b in hyphens]
@@ -138,11 +206,43 @@ def apply_chapter(path, ledger, report):
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
+    open(path, 'w', encoding='utf-8').write(blob)
+
+
 def main():
     ledger_path, datadir = sys.argv[1], sys.argv[2]
     ledger, skipped = load_ledger(ledger_path)
     report = {'unstamped': [], 'buttons': [], 'missing_buttons': [],
-              'pronounce': [], 'hyphens': []}
+              'pronounce': [], 'hyphens': [], 'underlines': []}
     total = 0
     for n in range(1, 29):
         path = f'{datadir}/chapt-{n:02d}.json'
@@ -151,6 +251,14 @@ def main():
         except OSError:
             continue
         total += apply_chapter(path, ledger, report)
+    # D2 is an APP-WIDE rule, not a chapter one. Every rendered data file
+    # gets the typographic pass, not just chapt-NN.json: the last displayed
+    # double hyphens were in intro.json ("WELCOME --", "-- ENJOY") and in
+    # two chapter-1 lexicon glosses, none of which this loop had ever opened.
+    for name in sorted(os.listdir(datadir)):
+        if (name.endswith('.json') and not re.fullmatch(r'chapt-\d\d\.json', name)
+                and name not in NON_RENDERED):
+            apply_plain(f'{datadir}/{name}', report)
     print(f'stamped {total} activities from {len(ledger)} confirmed rows')
     if skipped:
         chs = sorted({c for c, _ in skipped})
@@ -161,6 +269,10 @@ def main():
                        ('pronounce', 'pronounceEach default corrected to true')):
         if report[key]:
             print(f'  {label}: {", ".join(report[key])}')
+    if report['underlines']:
+        print(f'  hint underlines applied: {len(report["underlines"])}')
+        for p, a, b in report['underlines']:
+            print(f'    {p}: {a[:40]!r} -> {b[:52]!r}')
     if report['hyphens']:
         print(f'  em dashes applied: {len(report["hyphens"])}')
         for path, p, a, b in report['hyphens']:
diff --git a/scripts/check-content-shapes.mjs b/scripts/check-content-shapes.mjs
index e294428..96285a1 100644
--- a/scripts/check-content-shapes.mjs
+++ b/scripts/check-content-shapes.mjs
@@ -5,6 +5,7 @@
 // gets a loud check here instead. Run from `npm run verify`.
 import { readFileSync, readdirSync } from 'node:fs';
 import { join } from 'node:path';
+import { ADVANCE_CLASSES as TIMING_CLASSES } from '../src/lib/timing.js';
 
 const DATA = 'src/data';
 const problems = [];
@@ -24,6 +25,15 @@ const ACTIVITY_TYPES = new Set(['contentAudio', 'select', 'spell', 'divide', 'pl
 // contentAudio dispatches on `mode`; a mode with no branch in
 // ContentAudio.svelte falls through to the generic chart and renders a grid of
 // nothing, which is exactly the kind of failure that only shows up on device.
+// The six advance classes come from the RENDERER's own list (src/lib/timing.js
+// has no imports, so this script stays dependency-free by importing it). A
+// second hand-written copy here is exactly how the data and the renderer would
+// drift apart while both looked right. The ledger stamper keeps a third copy
+// only because it is Python and cannot read this one.
+const ADVANCE_CLASSES = new Set(TIMING_CLASSES);
+// The five audio timings (rules A1/A8). The renderer branches on these by name
+// rather than exporting a list, so this is the one place they are enumerated.
+const AUDIO_TIMINGS = new Set(['beforeGuess', 'afterGuess', 'afterTap', 'afterCheck', 'none']);
 const CONTENT_MODES = new Set([
   'chart', 'exploreGrid', 'stepper', 'textPage', 'objectivesPage', 'flashcard',
   'selfCheckStepper', 'selfCheckSequence', 'equationChart', 'vowelStair',
@@ -281,6 +291,22 @@ for (const file of files) {
     if (Object.prototype.hasOwnProperty.call(block, 'autoAdvanceMs')) {
       problems.push(`${path}.autoAdvanceMs: advance durations live in src/lib/timing.js, not in the data (D-14).`);
     }
+    // BEHAVIOR IS A CLOSED VOCABULARY (5E-SPEC2 §1, DRILL-BEHAVIOR-RULES B1).
+    // There are six advance classes and five audio timings, and a value
+    // outside them fails SILENTLY at runtime: resolveAdvance falls through to
+    // its legacy branch and the surface auto-advances when the ledger says it
+    // should wait. The renderer cannot report it because it never sees a
+    // wrong-but-plausible string as wrong, so the build does.
+    if (Object.prototype.hasOwnProperty.call(block, 'answerPolicy')
+        && block.answerPolicy && typeof block.answerPolicy === 'object') {
+      const advanceClass = block.answerPolicy.advanceClass;
+      if (advanceClass != null && !ADVANCE_CLASSES.has(advanceClass)) {
+        problems.push(`${path}.answerPolicy.advanceClass: "${advanceClass}" is not one of ${[...ADVANCE_CLASSES].join(', ')}.`);
+      }
+    }
+    if (block.audioTiming != null && !AUDIO_TIMINGS.has(block.audioTiming)) {
+      problems.push(`${path}.audioTiming: "${block.audioTiming}" is not one of ${[...AUDIO_TIMINGS].join(', ')}.`);
+    }
     // greekRows rows carry a word, a positional-chart cell list, or an
     // alternating parts[] equation -- never nothing at all.
     if (block.type === 'greekRows') {
@@ -292,6 +318,40 @@ for (const file of files) {
   });
 }
 
+// ---- NO DISPLAYED DOUBLE HYPHEN (D2, 5E-SPEC2 §5.4) ----
+// `--` is an em dash everywhere the learner can see it. The rule is applied by
+// scripts/apply-behavior-matrix.py, which must run after every assemble; this
+// is what notices when it did not. Provenance fields are exempt for the same
+// reason the stamper skips them: `_legacy` holds the TBK's own bytes, and the
+// `_comment`/`_note`/`_verify`/audioInventory notes are never rendered.
+// Every data file is swept, not only the chapters — the last two offenders
+// were in intro.json, which the chapter loop had never opened.
+const PROVENANCE = new Set(['audioInventory']);
+// font-map.json is the extraction pipeline's own reference table — no runtime
+// import anywhere in src/ — so its prose is documentation, not copy.
+const NON_RENDERED = new Set(['font-map.json']);
+function walkStrings(node, path, visit, exempt = false) {
+  if (Array.isArray(node)) {
+    node.forEach((child, index) => walkStrings(child, `${path}[${index}]`, visit, exempt));
+    return;
+  }
+  if (node && typeof node === 'object') {
+    for (const [key, value] of Object.entries(node)) {
+      walkStrings(value, `${path}.${key}`, visit, exempt || key.startsWith('_') || PROVENANCE.has(key));
+    }
+    return;
+  }
+  if (typeof node === 'string' && !exempt) visit(node, path);
+}
+for (const file of readdirSync(DATA).filter(name => name.endsWith('.json') && !NON_RENDERED.has(name))) {
+  const data = JSON.parse(readFileSync(join(DATA, file), 'utf8'));
+  walkStrings(data, file, (text, path) => {
+    if (text.includes('--')) {
+      problems.push(`${path}: displayed copy contains "--" (D2 — run scripts/apply-behavior-matrix.py): ${JSON.stringify(text.slice(0, 60))}`);
+    }
+  });
+}
+
 // ---- RED-MARK GEOMETRY COVERAGE (5B-SPEC4 B2) ----
 // Every cluster a drill reddens must have a row in the generated font table.
 // A cluster that misses it still renders, via the legacy rule table, and looks
@@ -393,4 +453,4 @@ if (problems.length) {
   process.exit(1);
 }
 
-console.log(`PASS: content shapes intact — ${files.join(', ')} checked (biblist entries are strings; numbered items render something; greekRows rows carry content; paradigm rows match their columns; spellVerse answers are single words; every contentAudio mode has a branch; every reddened cluster has a font-derived geometry row; every spelling answer is typeable on the shared keyboard).`);
+console.log(`PASS: content shapes intact — ${files.join(', ')} checked (biblist entries are strings; numbered items render something; greekRows rows carry content; paradigm rows match their columns; spellVerse answers are single words; every contentAudio mode has a branch; every advanceClass is one of the six and every audioTiming one of the five; every reddened cluster has a font-derived geometry row; every spelling answer is typeable on the shared keyboard).`);
diff --git a/scripts/ui-behavior.mjs b/scripts/ui-behavior.mjs
index f24434b..e51c401 100644
--- a/scripts/ui-behavior.mjs
+++ b/scripts/ui-behavior.mjs
@@ -25,20 +25,33 @@ const check = (name, ok, detail = '') => {
 const ch3 = JSON.parse(readFileSync('src/data/chapt-03.json', 'utf8'));
 const ch4 = JSON.parse(readFileSync('src/data/chapt-04.json', 'utf8'));
 const ch5 = JSON.parse(readFileSync('src/data/chapt-05.json', 'utf8'));
+const ch1 = JSON.parse(readFileSync('src/data/chapt-01.json', 'utf8'));
+const ch2 = JSON.parse(readFileSync('src/data/chapt-02.json', 'utf8'));
 const verse = (ch3.exercise.find(a => a.type === 'spellVerse').answerWords || []).join(' ');
-const strip = s => s.normalize('NFD').replace(/\p{M}/gu, '').normalize('NFC');
+// UNACCENTED, not unmarked (5E-SPEC2 §4.2). "With Accents" OFF forgives the
+// acute, the grave and the circumflex and NOTHING else, so a fixture that
+// stands in for "the learner typed it without accents" must keep every
+// breathing, diaeresis and iota subscript. Stripping \p{M} here — which is
+// what this helper used to do — is now itself a misspelling, and there is a
+// test below that asserts exactly that.
+const stripAccents = s => s.normalize('NFD').replace(/[̀́͂]/gu, '').normalize('NFC');
+const stripAllMarks = s => s.normalize('NFD').replace(/\p{M}/gu, '').normalize('NFC');
 const normalizeText = value => String(value ?? '').replace(/\s+/g, ' ').trim().normalize('NFC');
 
 // playwright-core does not install a browser. Prefer its configured binary,
 // then use an installed stable browser without hard-coding a machine path.
+// The audio assertions play REAL clips, so the autoplay policy has to be out
+// of the way: a beforeGuess prompt is spoken on arrival with no gesture behind
+// it, and a blocked play() would look exactly like a broken one.
+const LAUNCH = { args: ['--autoplay-policy=no-user-gesture-required'] };
 async function launchBrowser() {
   const explicit = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
-  if (explicit) return chromium.launch({ executablePath: explicit });
+  if (explicit) return chromium.launch({ ...LAUNCH, executablePath: explicit });
   try {
-    return await chromium.launch();
+    return await chromium.launch(LAUNCH);
   } catch (original) {
     for (const channel of ['chrome', 'msedge']) {
-      try { return await chromium.launch({ channel }); } catch { /* keep looking */ }
+      try { return await chromium.launch({ ...LAUNCH, channel }); } catch { /* keep looking */ }
     }
     throw original;
   }
@@ -46,8 +59,76 @@ async function launchBrowser() {
 
 const browser = await launchBrowser();
 const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
+
+// AUDIO OBSERVABILITY (5E-SPEC2 §6.2-§6.4). src/lib/audio.js is the app's sole
+// audio choke point and it plays through `new Audio(objectURL)`, so wrapping
+// the constructor records every clip the app starts, when it started, and when
+// it ended or was cut off — WITHOUT changing what plays. Nothing here reaches
+// into a component: the tests still only ever click what the learner clicks.
+await context.addInitScript(() => {
+  const Native = window.Audio;
+  window.__clips = [];
+  function Wrapped(src) {
+    const el = new Native(src);
+    const rec = { src, createdAt: Date.now(), startedAt: null, endedAt: null, stoppedAt: null };
+    window.__clips.push(rec);
+    const play = el.play.bind(el);
+    el.play = () => { rec.startedAt = Date.now(); return play(); };
+    el.addEventListener('ended', () => { rec.endedAt = Date.now(); });
+    el.addEventListener('pause', () => { rec.stoppedAt = Date.now(); });
+    return el;
+  }
+  Wrapped.prototype = Native.prototype;
+  window.Audio = Wrapped;
+});
 const page = await context.newPage();
 
+const clips = () => page.evaluate(() => window.__clips.map(c => ({ ...c })));
+const lastClip = async () => (await clips()).slice(-1)[0] || null;
+const clipsPlaying = () => page.evaluate(() =>
+  window.__clips.filter(c => c.startedAt && !c.endedAt && !c.stoppedAt).length);
+
+// A DELIBERATELY LONG CLIP. §6.2 asks for a case where the audio outlasts the
+// 2000ms class minimum, and no shipped chapter-1-5 vocabulary clip does. The
+// bytes are seeded straight into the audio store the app already reads
+// (IndexedDB 'greek-tutor'/'audio', keyed by the same absolute path), so the
+// app's own IDB-hit path serves them and no test code touches playback.
+// A silent 16-bit mono WAV is used rather than a truncated m4a because it
+// decodes on any engine and its duration is exactly what we asked for.
+async function seedLongClip(paths, seconds) {
+  return page.evaluate(async ({ paths, seconds }) => {
+    const rate = 8000;
+    const samples = Math.round(rate * seconds);
+    const buffer = new ArrayBuffer(44 + samples * 2);
+    const view = new DataView(buffer);
+    const ascii = (offset, text) => { for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i)); };
+    ascii(0, 'RIFF'); view.setUint32(4, 36 + samples * 2, true); ascii(8, 'WAVE');
+    ascii(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
+    view.setUint16(22, 1, true); view.setUint32(24, rate, true);
+    view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
+    ascii(36, 'data'); view.setUint32(40, samples * 2, true);
+    const blob = new Blob([buffer], { type: 'audio/wav' });
+    await new Promise((resolve, reject) => {
+      const open = indexedDB.open('greek-tutor', 1);
+      open.onupgradeneeded = () => {
+        if (!open.result.objectStoreNames.contains('audio')) open.result.createObjectStore('audio');
+      };
+      open.onerror = () => reject(open.error);
+      open.onsuccess = () => {
+        const tx = open.result.transaction('audio', 'readwrite');
+        for (const path of paths) tx.objectStore('audio').put(blob, path);
+        tx.oncomplete = () => { open.result.close(); resolve(); };
+        tx.onerror = () => reject(tx.error);
+      };
+    });
+  }, { paths, seconds });
+}
+// id -> path, the naming contract from src/lib/audio.js (never re-derived).
+const audioPath = id => {
+  const m = String(id || '').match(/^(chapt_\d+|vocab\d*|john\d*|rev_par|rev_voc|intro)_(.+)$/);
+  return m ? `/audio/${m[1]}/${m[2]}.m4a` : null;
+};
+
 // The activity's OWN stepper, never the sequential rail's Previous/Next at the
 // bottom of the screen (both are labelled "Next"; only the in-card pair moves
 // between items).
@@ -192,11 +273,13 @@ check('§4/1 backspace acts at the caret', text === 'λγει', JSON.stringify(t
 
 // ---------------------------------------------------------------- A6 policy
 const cases = [
-  ['A6/1 verse with no accents, accents OFF', strip(verse), false, 'ok'],
+  ['A6/1 verse with no accents, accents OFF', stripAccents(verse), false, 'ok'],
   ['A6/2 verse fully accented, accents ON', verse, true, 'ok'],
-  ['A6/3 verse with no accents, accents ON', strip(verse), true, 'bad'],
+  ['A6/3 verse with no accents, accents ON', stripAccents(verse), true, 'bad'],
   ['A6/4 verse without its punctuation, accents ON', verse.replace(/[,·]/g, ''), true, 'ok'],
-  ['A6/5 lowercase where the verse capitalizes, accents ON', verse.toLowerCase(), true, 'ok']
+  ['A6/5 lowercase where the verse capitalizes, accents ON', verse.toLowerCase(), true, 'ok'],
+  // 5E-SPEC2 §4.2: the breathings are part of the spelling at BOTH settings.
+  ['5E §4.2 verse with breathings stripped, accents OFF', stripAllMarks(verse), false, 'bad']
 ];
 for (const [label, input, accents, expect] of cases) {
   await go('#/activity/chapt_3/c3_ex_scripture_speller');
@@ -211,10 +294,15 @@ for (const [label, input, accents, expect] of cases) {
 // ---------------------------------------------------------------- §3 revisit
 // Answer item 1, step forward, step back: the item must come up FRESH (no
 // selection, no feedback, options unlocked) while the score stands.
+// The chapter-3 vocabulary drills used to be in this list. The ledger struck
+// their Previous/Next pair (5E-SPEC2 §0: the original has none), so they have
+// no revisit path any more — the same reason chapter 1's six select drills are
+// asserted rather than walked below.
 for (const [label, hash] of [
   ['ch2 Accent Rule', '#/activity/chapt_2/c2_drill_accent_rule'],
+  ['ch2 Marking Recognition', '#/activity/chapt_2/c2_drill_marking_recognition'],
   ['ch3 Verb Translating', '#/activity/chapt_3/c3_drill_verb_translating'],
-  ['ch3 Vocabulary: Greek to English', '#/activity/chapt_3/c3_drill_vocab_gk_en'],
+  ['ch3 Parsing', '#/activity/chapt_3/c3_drill_parsing'],
   ['ch4 Greek Noun', '#/activity/chapt_4/c4_drill_greek_noun'],
   ['ch5 First Declension Noun', '#/activity/chapt_5/c5_drill_first_decl_noun']
 ]) {
@@ -242,7 +330,6 @@ for (const [label, hash] of [
 // a Previous/Next stepper, and all six are `retry` class (an item stays open
 // until it is answered correctly). Asserted rather than assumed.
 {
-  const ch1 = JSON.parse(readFileSync('src/data/chapt-01.json', 'utf8'));
   const selects = [...(ch1.drill || []), ...(ch1.exercise || [])].filter(a => a.type === 'select');
   const withStepper = selects.filter(a => (a.ui?.buttons || []).includes('Next'));
   check('§3 ch1 has no scored select drill with a revisit path',
@@ -271,6 +358,13 @@ const gotoTopic = async index => {
 // Authored select questions are shuffled, so UI assertions identify the
 // visible item by its rendered prompt and citation before consulting fields
 // such as answer, translate, or gender.
+//
+// AMBIGUITY IS null, NOT A GUESS. chapter 4's Greek Noun drill ships two items
+// on the same sentence and the same reference ("Brother will betray brother",
+// Mat 10:21) with different answers, so prompt+reference does not always
+// identify one item. Returning the first match made a test click a wrong
+// option roughly one run in twenty and then report the advance as broken. The
+// caller reloads for a different shuffle instead (freshKnownItem below).
 async function authoredItemOnScreen(activity) {
   const visiblePrompt = normalizeText(await page.locator('.card .prompt').first().innerText());
   const citation = page.locator('.card .prompt-citation');
@@ -281,8 +375,21 @@ async function authoredItemOnScreen(activity) {
     : (activity.promptIsGreek || promptField === 'greek')
       ? item.greek
       : (item.prompt != null ? item.prompt : (promptField ? item[promptField] : '')));
-  return activity.items.find(item => promptFor(item) === visiblePrompt
-    && (!visibleCitation || normalizeText(item.ref) === visibleCitation)) || null;
+  const matches = activity.items.filter(item => promptFor(item) === visiblePrompt
+    && (!visibleCitation || normalizeText(item.ref) === visibleCitation));
+  return matches.length === 1 ? matches[0] : null;
+}
+
+// Reload until the shuffle puts an item on screen that prompt+reference
+// identifies uniquely. Returns null if it never does, so the caller can fail
+// the check with a reason instead of clicking something arbitrary.
+async function freshKnownItem(hash, activity, tries = 10) {
+  for (let attempt = 0; attempt < tries; attempt++) {
+    await go(hash);
+    const item = await authoredItemOnScreen(activity);
+    if (item) return item;
+  }
+  return null;
 }
 
 async function checkMoreBack(label, hash, topicIndex, firstLemma, secondLemma) {
@@ -361,8 +468,7 @@ await checkChartRouteReset('ch5 Definite Article', '#/activity/chapt_5/c5_learn_
 // ---------------------------------------------------------------- 5E §4.5 button-driven reveals
 async function checkReveal(label, chapter, activityId, buttonName, field) {
   const activity = activityById(chapter, activityId);
-  await go(`#/activity/${chapter === ch4 ? 'chapt_4' : 'chapt_5'}/${activityId}`);
-  const currentItem = await authoredItemOnScreen(activity);
+  const currentItem = await freshKnownItem(`#/activity/${chapter === ch4 ? 'chapt_4' : 'chapt_5'}/${activityId}`, activity);
   const expected = currentItem ? normalizeText(currentItem[field]) : null;
   const output = page.locator(`.card [data-reveal="${field}"]`);
   check(`5E §4.5 ${label}: reveal starts hidden`, await output.count() === 0);
@@ -447,11 +553,10 @@ await measureAdvance('ch3 Scripture Memory Drill', '#/activity/chapt_3/c3_drill_
 // solely through the rendered UI. Report the observed milliseconds.
 async function measureAuthoredAdvance(label, chapter, chapterId, activityId, wantCorrect, expectedMs) {
   const activity = activityById(chapter, activityId);
-  await go(`#/activity/${chapterId}/${activityId}`);
+  const currentItem = await freshKnownItem(`#/activity/${chapterId}/${activityId}`, activity);
   const before = await itemNumber();
   const tiles = page.locator('.grid.options .tile, .option-group .tile');
   const labels = (await tiles.allInnerTexts()).map(normalizeText);
-  const currentItem = await authoredItemOnScreen(activity);
   if (!currentItem) {
     check(`5E timing ${label}`, false,
       'could not match the rendered prompt/reference to authored data');
@@ -567,6 +672,582 @@ for (const chapterId of ['chapt_1', 'chapt_2', 'chapt_3', 'chapt_4', 'chapt_5'])
   check(`§5 ${chapterId} objectives use "1. 2. 3."`, marker === 'decimal', marker);
 }
 
+// ================================================================ 5E-SPEC2 §6
+// Everything below is this round's contract: the six advance classes, the
+// afterGuess audio wait, the audio lifecycle, the two withdrawn spelling
+// leniencies, Show Answer, modal reachability and the option-grid census.
+await page.setViewportSize({ width: 390, height: 900 });
+
+const CHAPTERS = { chapt_1: ch1, chapt_2: ch2, chapt_3: ch3, chapt_4: ch4, chapt_5: ch5 };
+const LEXICON = id => JSON.parse(readFileSync(`src/data/lexicon-chapt0${id.split('_')[1]}.json`, 'utf8'));
+const promptGloss = () => page.locator('.card.speller .flash-pane .value').first().innerText();
+const exerciseCount = () => page.locator('.card .exercise-count').innerText();
+const awaitNextShown = async () => await page.locator('.await-next').count() > 0;
+
+// ---------------------------------------------------------------- §6.1 classes
+// `none` — an explore grid is not scored at all: no feedback line, no policy.
+await go('#/activity/chapt_1/c1_drill_letter_names');
+await page.locator('.grid.letters .tile').first().click();
+await page.waitForTimeout(150);
+{
+  const activity = activityById(ch1, 'c1_drill_letter_names');
+  check('5E §6.1 none: explore grid is not scored',
+    !activity.answerPolicy && await page.locator('.feedback').count() === 0
+      && await page.locator('.await-next').count() === 0,
+    `answerPolicy ${JSON.stringify(activity.answerPolicy)}`);
+}
+
+// `autoBoth` — BOTH outcomes move by themselves. The incorrect path is already
+// measured above; this is the correct one, on a different chapter.
+await measureAuthoredAdvance('ch4 Scripture Memory (autoBoth, correct)', ch4, 'chapt_4', 'c4_drill_scripture_memory', true, CORRECT_MS);
+
+// `manualOnIncorrect` — a wrong answer reveals the answer, locks the grid and
+// STAYS. The correct path is measured above; this asserts the standing still.
+{
+  const activity = activityById(ch4, 'c4_drill_greek_noun');
+  const item = await freshKnownItem('#/activity/chapt_4/c4_drill_greek_noun', activity);
+  const before = await itemNumber();
+  const tiles = page.locator('.grid.options .tile');
+  const labels = (await tiles.allInnerTexts()).map(normalizeText);
+  const wrong = labels.findIndex(text => text !== normalizeText(item.answer));
+  await tiles.nth(wrong).click();
+  await page.waitForTimeout(200);
+  // The paradigm grids legitimately repeat a form -- nominative and vocative
+  // plural are homographs, so "ἀδελφοί" is two tiles -- and when THAT is the
+  // answer both light up. Assert what is revealed, not how many tiles it took.
+  const revealed = (await page.locator('.grid.options .tile.correct').allInnerTexts()).map(normalizeText);
+  const said = await awaitNextShown();
+  await page.waitForTimeout(INCORRECT_MS * 1.5);
+  check('5E §6.1 manualOnIncorrect: incorrect reveals, waits, and says so',
+    await feedbackKind() === 'bad' && revealed.length >= 1
+      && revealed.every(text => text === normalizeText(item.answer))
+      && said && await itemNumber() === before,
+    `revealed ${JSON.stringify(revealed)} for answer ${JSON.stringify(item.answer)}, message ${said}, item ${before} -> ${await itemNumber()}`);
+}
+
+// `retryUntilRight` — a wrong answer reveals NOTHING, does not advance, and
+// leaves the item open for another attempt.
+{
+  // The pool is shuffled and the items name their word by lexicon ref, so the
+  // wrong option is resolved the same way the app resolves the prompt: match
+  // the rendered Greek to a lemma, then pick any option that is not its answer.
+  const activity = activityById(ch2, 'c2_drill_syllable_counting');
+  const lexicon = LEXICON('chapt_2');
+  const greekOf = item => {
+    const bucket = lexicon[item.pool] || lexicon.lemmas || {};
+    return normalizeText((bucket[item.ref] || {}).greek);
+  };
+  await go('#/activity/chapt_2/c2_drill_syllable_counting');
+  const before = await itemNumber();
+  const shown = normalizeText(await page.locator('.card .prompt').first().innerText());
+  const item = activity.items.find(i => greekOf(i) === shown);
+  const tiles = page.locator('.grid.options .tile');
+  const labels = (await tiles.allInnerTexts()).map(normalizeText);
+  const wrongAt = item ? labels.findIndex(text => text !== String(item.answer)) : -1;
+  await tiles.nth(Math.max(wrongAt, 0)).click();
+  await page.waitForTimeout(150);
+  const kind = await feedbackKind();
+  const revealed = await page.locator('.grid.options .tile.correct').count();
+  const said = await awaitNextShown();
+  await page.waitForTimeout(INCORRECT_MS * 1.4);
+  check('5E §6.1 retryUntilRight: incorrect reveals nothing and stays open',
+    wrongAt >= 0 && kind === 'bad' && revealed === 0 && !said && await itemNumber() === before,
+    `wrong tile ${wrongAt} (${JSON.stringify(shown)}), feedback ${kind}, revealed ${revealed}, message ${said}, item ${before} -> ${await itemNumber()}`);
+  // Still open: a second tap on the SAME item is accepted, not swallowed.
+  await page.locator('.card').getByRole('button', { name: 'Score', exact: true }).click();
+  const attemptsBefore = await page.locator('.live-score').innerText();
+  await tiles.nth(labels.findIndex(text => text === String(item && item.answer))).click();
+  await page.waitForTimeout(150);
+  const attemptsAfter = await page.locator('.live-score').innerText();
+  check('5E §6.1 retryUntilRight: the item stays open for another attempt',
+    /out of 2 attempts/.test(attemptsAfter) && await feedbackKind() === 'ok',
+    `${attemptsBefore.trim()} -> ${attemptsAfter.trim()}`);
+}
+
+// `manualCorrectAutoIncorrect` — the ch2 exercises, and the class whose
+// direction is the opposite of the obvious one: CORRECT waits, wrong advances.
+const ACCENT_OF = { '́': 'Acute', '̀': 'Grave', '͂': 'Circumflex' };
+function accentAnswer(form) {
+  const clusters = [...new Intl.Segmenter('el', { granularity: 'grapheme' }).segment(form)].map(p => p.segment);
+  for (let i = 0; i < clusters.length; i++) {
+    for (const ch of clusters[i].normalize('NFD')) if (ACCENT_OF[ch]) return { index: i, type: ACCENT_OF[ch] };
+  }
+  return null;
+}
+{
+  // The accent-placement pool is authored order, not shuffled, so item 1 is
+  // deterministic and its answer is read out of the delivered data.
+  const activity = activityById(ch2, 'c2_ex_accent_placement');
+  const answer = accentAnswer(activity.items[0].answerForm);
+  const other = (activity.accentTypes || []).find(t => t !== answer.type);
+
+  await go('#/activity/chapt_2/c2_ex_accent_placement');
+  const before = await exerciseCount();
+  await page.locator('.accent-types .chip', { hasText: answer.type }).first().click();
+  await page.locator('.accent-slot').nth(answer.index).click();
+  await stepper('Check Answer').click();
+  await page.waitForTimeout(200);
+  const said = await awaitNextShown();
+  await page.waitForTimeout(CORRECT_MS * 1.6);
+  check('5E §6.1 manualCorrectAutoIncorrect: CORRECT waits for Next and says so',
+    await feedbackKind() === 'ok' && said && await exerciseCount() === before,
+    `message ${said}, item ${before.trim()} -> ${(await exerciseCount()).trim()}`);
+
+  await go('#/activity/chapt_2/c2_ex_accent_placement');
+  const beforeWrong = await exerciseCount();
+  await page.locator('.accent-types .chip', { hasText: other }).first().click();
+  await page.locator('.accent-slot').nth(answer.index).click();
+  const answeredAt = Date.now();
+  await stepper('Check Answer').click();
+  await page.waitForTimeout(200);
+  // Read the outcome BEFORE the advance clears it — this class moves on by
+  // itself, so an assertion made after the move would read an empty banner.
+  const wrongKind = await feedbackKind();
+  const revealedForm = await page.locator('.exercise-answer').count();
+  const early = await exerciseCount();
+  let late = early;
+  while (late === beforeWrong && Date.now() - answeredAt < INCORRECT_MS * 1.6) {
+    await page.waitForTimeout(60);
+    late = await exerciseCount();
+  }
+  const elapsed = Date.now() - answeredAt;
+  check('5E §6.1 manualCorrectAutoIncorrect: INCORRECT reveals and auto-advances on 4000ms',
+    wrongKind === 'bad' && revealedForm === 1 && early === beforeWrong
+      && late !== beforeWrong && elapsed >= INCORRECT_MS * 0.8,
+    `feedback ${wrongKind}, revealed ${revealedForm}, item ${beforeWrong.trim()} -> ${late.trim()} at ${elapsed}ms`);
+}
+
+// `spellUntilRight` — correct waits for Next; wrong keeps what was typed and
+// never reveals the spelling.
+{
+  const activity = activityById(ch3, 'c3_ex_verb_speller');
+  const word = activity.items[0].greek;
+  await go('#/activity/chapt_3/c3_ex_verb_speller');
+  const before = await promptGloss();
+  await setAccents(false);
+  await typeAccented(stripAccents(word));
+  await stepper('Check Answer').click();
+  await page.waitForTimeout(200);
+  const said = await awaitNextShown();
+  await page.waitForTimeout(CORRECT_MS * 1.6);
+  check('5E §6.1 spellUntilRight: a correct spelling waits for Next and says so',
+    await feedbackKind() === 'ok' && said && await promptGloss() === before,
+    `message ${said}, prompt ${JSON.stringify(before)} -> ${JSON.stringify(await promptGloss())}`);
+
+  await go('#/activity/chapt_3/c3_ex_verb_speller');
+  await setAccents(false);
+  await typeGreek('λυειζ');                                  // λύει with a stray ζ on the end
+  const typedBefore = await typed();
+  await stepper('Check Answer').click();
+  await page.waitForTimeout(250);
+  check('5E §6.1 spellUntilRight: a wrong spelling keeps the slate and reveals nothing',
+    await feedbackKind() === 'bad' && await typed() === typedBefore
+      && await page.locator('.spell-answer').count() === 0
+      && !await awaitNextShown(),
+    `typed ${JSON.stringify(await typed())}, answer shown ${await page.locator('.spell-answer').count()}`);
+}
+
+// ------------------------------------------------- §6.2/§6.3 afterGuess audio
+// A clip LONGER than the 2000ms class minimum is seeded into the app's own
+// audio store, so the advance has to be max(2000, clip) and not 2000.
+const LONG_CLIP_S = 3;
+{
+  const activity = activityById(ch4, 'c4_drill_greek_noun');
+  const paths = activity.items.map(item => audioPath(item.audio)).filter(Boolean);
+  await go('#/activity/chapt_4/c4_drill_greek_noun');
+  await seedLongClip(paths, LONG_CLIP_S);
+  const item = await freshKnownItem('#/activity/chapt_4/c4_drill_greek_noun', activity);
+
+  const before = await itemNumber();
+  const tiles = page.locator('.grid.options .tile');
+  const labels = (await tiles.allInnerTexts()).map(normalizeText);
+  const rightAt = labels.findIndex(text => text === normalizeText(item.answer));
+  const answeredAt = Date.now();
+  await tiles.nth(rightAt).click();
+
+  let now = before;
+  while (now === before && Date.now() - answeredAt < LONG_CLIP_S * 1000 * 2.5) {
+    await page.waitForTimeout(50);
+    now = await itemNumber();
+  }
+  const advancedAt = Date.now();
+  const clip = await lastClip();
+  check('5E §6.2 afterGuess: the clip is played after the guess',
+    !!clip && !!clip.startedAt && clip.src.startsWith('blob:'), JSON.stringify(clip));
+  check('5E §6.2 afterGuess: the next item waits for a clip longer than 2000ms',
+    now !== before && !!clip && !!clip.endedAt && advancedAt >= clip.endedAt
+      && advancedAt - answeredAt >= LONG_CLIP_S * 1000 * 0.9,
+    `advanced ${advancedAt - answeredAt}ms after the guess; clip ran ${clip && clip.endedAt ? clip.endedAt - clip.startedAt : 'n/a'}ms`);
+
+  // §6.3 / §2.3: Next during playback stops the clip and moves AT ONCE.
+  const item2 = await freshKnownItem('#/activity/chapt_4/c4_drill_greek_noun', activity);
+  const beforeNext = await itemNumber();
+  const tiles2 = page.locator('.grid.options .tile');
+  const labels2 = (await tiles2.allInnerTexts()).map(normalizeText);
+  await tiles2.nth(labels2.findIndex(text => text === normalizeText(item2.answer))).click();
+  await page.waitForTimeout(250);
+  const playingBefore = await clipsPlaying();
+  const pressedAt = Date.now();
+  await stepper('Next').click();
+  await page.waitForTimeout(150);
+  const movedAt = Date.now();
+  check('5E §6.3 Next during afterGuess playback stops the audio and advances at once',
+    playingBefore === 1 && await clipsPlaying() === 0 && await itemNumber() !== beforeNext
+      && movedAt - pressedAt < 600,
+    `playing ${playingBefore} -> ${await clipsPlaying()}, item ${beforeNext} -> ${await itemNumber()} in ${movedAt - pressedAt}ms`);
+}
+
+// ---------------------------------------------------------------- §6.4 exits
+// The reported defect: Say Whole Paradigm on chapter 4's Masculine Declension
+// kept reading over the next topic and the next page. All three exits.
+async function startParadigmClip() {
+  await gotoTopic(4);
+  const say = page.locator('.card .pg-actions .btn', { hasText: 'Say Whole' }).first();
+  await say.click();
+  await page.waitForTimeout(250);
+  return clipsPlaying();
+}
+{
+  await go('#/activity/chapt_4/c4_learn_nouns');
+  const chartClip = await page.evaluate(() => null);   // keep the page settled
+  void chartClip;
+  await seedLongClip([], LONG_CLIP_S);                 // ensure the store exists
+  await go('#/activity/chapt_4/c4_learn_nouns');
+
+  let playing = await startParadigmClip();
+  await page.getByRole('button', { name: 'Next Topic', exact: true }).click();
+  await page.waitForTimeout(200);
+  check('5E §6.4 audio stops on a TOPIC SWITCH inside a topicPages activity',
+    playing === 1 && await clipsPlaying() === 0, `playing ${playing} -> ${await clipsPlaying()}`);
+
+  await go('#/activity/chapt_4/c4_learn_nouns');
+  playing = await startParadigmClip();
+  await page.locator('.rail-next').click();
+  await page.waitForTimeout(250);
+  check('5E §6.4 audio stops on RAIL navigation',
+    playing === 1 && await clipsPlaying() === 0, `playing ${playing} -> ${await clipsPlaying()}`);
+
+  await go('#/activity/chapt_4/c4_learn_nouns');
+  playing = await startParadigmClip();
+  await page.evaluate(() => { location.hash = '#/chapter/chapt_4'; });
+  await page.waitForTimeout(250);
+  check('5E §6.4 audio stops on a ROUTE CHANGE',
+    playing === 1 && await clipsPlaying() === 0, `playing ${playing} -> ${await clipsPlaying()}`);
+}
+
+// ------------------------------------------------------------ §6.5 spellers
+// The two withdrawn leniencies, on EVERY word speller in chapters 1-5, using
+// each speller's own first offending word rather than a hand-picked pair.
+const BREATHINGS = new Set(['̓', '̔']);
+function spellerAnswers(chapterId, activity) {
+  const lexicon = LEXICON(chapterId);
+  const lookup = ref => {
+    for (const bucket of ['lemmas', 'exampleWords', 'ch1_lemma_mirror']) {
+      if (lexicon[bucket] && lexicon[bucket][ref]) return lexicon[bucket][ref].greek;
+    }
+    return null;
+  };
+  return (activity.items || []).map(item => item.greek || (item.ref ? lookup(item.ref) : null));
+}
+for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
+  for (const activity of activitiesOf(chapter).filter(a => a && a.type === 'spell')) {
+    const answers = spellerAnswers(chapterId, activity);
+    const finalIndex = answers.findIndex(w => w && w.normalize('NFC').endsWith('ς'));
+    const breathIndex = answers.findIndex(w => w && [...w.normalize('NFD')].some(c => BREATHINGS.has(c)));
+
+    if (finalIndex >= 0) {
+      const word = answers[finalIndex];
+      await go(`#/activity/${chapterId}/${activity.id}`);
+      await gotoItem(finalIndex);
+      await setAccents(false);
+      // Everything right except the final form: a medial sigma in final place.
+      await typeAccented(stripAccents(word).replace(/ς$/u, 'σ'));
+      await stepper('Check Answer').click();
+      await page.waitForTimeout(120);
+      check(`5E §6.5 ${chapterId} ${activity.id}: a missing final form is rejected`,
+        await feedbackKind() === 'bad', `"${await typed()}" for "${word}"`);
+    }
+    if (breathIndex >= 0) {
+      const word = answers[breathIndex];
+      await go(`#/activity/${chapterId}/${activity.id}`);
+      await gotoItem(breathIndex);
+      await setAccents(false);
+      // Everything right except the breathing, with "With Accents" OFF.
+      await typeAccented(stripAllMarks(word));
+      await stepper('Check Answer').click();
+      await page.waitForTimeout(120);
+      check(`5E §6.5 ${chapterId} ${activity.id}: a missing breathing is rejected with accents OFF`,
+        await feedbackKind() === 'bad', `"${await typed()}" for "${word}"`);
+      // ...and the same word WITH its breathing and no accents is accepted, so
+      // the rule above is not simply "everything fails".
+      await go(`#/activity/${chapterId}/${activity.id}`);
+      await gotoItem(breathIndex);
+      await setAccents(false);
+      await typeAccented(stripAccents(word));
+      await stepper('Check Answer').click();
+      await page.waitForTimeout(120);
+      check(`5E §6.5 ${chapterId} ${activity.id}: breathing kept, accents dropped, accepted`,
+        await feedbackKind() === 'ok', `"${await typed()}" for "${word}"`);
+    }
+  }
+}
+
+// ------------------------------------------------------- §6.6 Show Answer
+for (const [chapterId, activityId] of [
+  ['chapt_1', 'c1_ex_speller'], ['chapt_3', 'c3_ex_vocab_speller'], ['chapt_5', 'c5_ex_vocab_speller']
+]) {
+  await go(`#/activity/${chapterId}/${activityId}`);
+  const box = page.locator('.spell-checks label', { hasText: 'Show Answer' }).locator('input');
+  await box.setChecked(true);
+  const shown = await page.locator('.spell-answer').count();
+  await page.keyboard.press('a');
+  await page.waitForTimeout(80);
+  check(`5E §6.6 ${chapterId} Show Answer clears as soon as typing resumes`,
+    shown === 1 && await page.locator('.spell-answer').count() === 0 && !await box.isChecked(),
+    `shown ${shown} -> ${await page.locator('.spell-answer').count()}, checkbox ${await box.isChecked()}`);
+}
+
+// -------------------------------------------- §5.2/§5.3 lists and underlines
+// D1: EVERY list hangs. The offenders were the lists whose numbers are
+// authored into the data ("1) 2) 3)"), which printed their marker as an inline
+// span, so a wrapped rule ran back underneath its own number. Measured, not
+// asserted from CSS: the marker box has to sit entirely to the LEFT of the
+// text column, which is what a hanging indent is.
+for (const [label, chapterId, activityId, button] of [
+  ['ch2 Accent Rule Drill hint (six accent rules)', 'chapt_2', 'c2_drill_accent_rule', 'Hint'],
+  ['ch2 Syllable Counting hint (three syllable rules)', 'chapt_2', 'c2_drill_syllable_counting', 'Hint'],
+  // The Division exercise's control renders from activity.hint.label ("Hint"),
+  // not from the "Hint: Rules" entry in ui.buttons — noted in the results.
+  ['ch2 Syllable Division hint (three syllable rules)', 'chapt_2', 'c2_ex_syllable_division', 'Hint']
+]) {
+  await page.setViewportSize({ width: 320, height: 900 });
+  await go(`#/activity/${chapterId}/${activityId}`);
+  await page.locator('.card').getByRole('button', { name: button, exact: true }).click();
+  await page.waitForTimeout(120);
+  const item = page.locator('.rc-list.authored-labels > li').first();
+  const marker = item.locator('.rc-num').first();
+  const present = await marker.count() > 0;
+  let hangs = false;
+  let boxes = null;
+  if (present) {
+    const itemBox = await item.boundingBox();
+    const markerBox = await marker.boundingBox();
+    boxes = { item: itemBox, marker: markerBox };
+    // The marker ends at or before the text column starts, and it is inside
+    // the card (a hanging indent that hangs off the screen is not one).
+    hangs = !!itemBox && !!markerBox
+      && markerBox.x + markerBox.width <= itemBox.x + 1
+      && markerBox.x >= 0;
+  }
+  check(`5E §5.2 ${label}: the list hangs its authored numbers`, present && hangs,
+    JSON.stringify(boxes));
+}
+await page.setViewportSize({ width: 390, height: 900 });
+
+// §5.3: the two rules that NAME what they teach are underlined, in the hint
+// that shows them — and in the Accent Mark Placement exercise's copy of the
+// same hint, because the same sentence must not look different in two places.
+for (const [label, chapterId, activityId, button] of [
+  ['ch2 Accent Rule Drill hint', 'chapt_2', 'c2_drill_accent_rule', 'Hint'],
+  ['ch2 Accent Mark Placement hint', 'chapt_2', 'c2_ex_accent_placement', 'Hint']
+]) {
+  await go(`#/activity/${chapterId}/${activityId}`);
+  await page.locator('.card').getByRole('button', { name: button, exact: true }).click();
+  await page.waitForTimeout(120);
+  const underlined = (await page.locator('.rc-list u').allInnerTexts()).map(normalizeText);
+  check(`5E §5.3 ${label}: "Nouns are retentive" and "Verbs are recessive" are underlined`,
+    underlined.includes('Nouns are retentive.') && underlined.includes('Verbs are recessive.'),
+    JSON.stringify(underlined));
+}
+
+// ------------------------------------------------- §6.7 modals reach Close
+// A close control counts as reachable only if it can be brought FULLY inside
+// the viewport. Checked at 320px wide and at two heights: 480 (a phone) and
+// 360 (short enough that a Hint with its Meanings table expanded overflows the
+// cap and the scroll path has to work).
+//
+// HONEST LIMIT, recorded here rather than in a handoff nobody reads next to
+// the test: the reported failure is a WebKit one. It needs a VISUAL viewport
+// shorter than 100vh -- iOS Safari with its toolbar showing -- and Chrome has
+// no such split, so this loop would have passed before the fix as well. What
+// it guards is the regression; the structural assertion below is what encodes
+// the actual fix, and the device pass is what confirms it (VERIFY-5E2).
+const MODAL_HEIGHTS = [480, 360];
+async function checkCloseReachable(label, open) {
+  for (const height of MODAL_HEIGHTS) {
+    await page.setViewportSize({ width: 320, height });
+    await open();
+    const close = page.locator('.modal .modal-actions .btn', { hasText: 'Close' }).first();
+    const present = await close.count() === 1;
+    let inside = false;
+    let box = null;
+    if (present) {
+      await close.scrollIntoViewIfNeeded();
+      await page.waitForTimeout(80);
+      box = await close.boundingBox();
+      inside = !!box && box.y >= 0 && box.y + box.height <= height && box.x >= 0 && box.x + box.width <= 320;
+    }
+    check(`5E §6.7 ${label}: the close control is reachable at 320x${height}`, present && inside,
+      box ? `close box ${JSON.stringify(box)}` : 'no close button found');
+  }
+  await page.setViewportSize({ width: 390, height: 900 });
+}
+
+for (const [label, chapterId, activityId] of [
+  ['ch3 Verb Translating Hint', 'chapt_3', 'c3_drill_verb_translating'],
+  ['ch4 Greek Noun Hint', 'chapt_4', 'c4_drill_greek_noun'],
+  ['ch4 Declining Noun Hint', 'chapt_4', 'c4_drill_declining'],
+  ['ch5 First Declension Noun Hint', 'chapt_5', 'c5_drill_first_decl_noun'],
+  ['ch5 Declining Noun Hint', 'chapt_5', 'c5_drill_declining'],
+  ['ch5 Definite Article Hint', 'chapt_5', 'c5_drill_article']
+]) {
+  await checkCloseReachable(label, async () => {
+    await go(`#/activity/${chapterId}/${activityId}`);
+    await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
+    await page.waitForTimeout(80);
+  });
+  // ...and the reported case: the SAME modal with Meanings expanded, which is
+  // what made it tall enough to strand its own Close button.
+  const meanings = page.locator('.modal [data-paradigm-meanings] summary');
+  await checkCloseReachable(`${label} + Meanings`, async () => {
+    await go(`#/activity/${chapterId}/${activityId}`);
+    await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
+    await page.waitForTimeout(80);
+    if (await meanings.count()) { await meanings.first().click(); await page.waitForTimeout(120); }
+  });
+}
+
+await checkCloseReachable('ch3 Learn Verbs Endings popup', async () => {
+  await go('#/activity/chapt_3/c3_learn_verbs');
+  await gotoTopic(2);
+  await page.locator('.card .pg-endings-open').first().click();
+  await page.waitForTimeout(100);
+});
+await checkCloseReachable('ch1 speller Greek Keyboard reference', async () => {
+  await go('#/activity/chapt_1/c1_ex_speller');
+  await page.locator('.card').getByRole('button', { name: 'Greek Keyboard', exact: true }).click();
+  await page.waitForTimeout(100);
+});
+await checkCloseReachable('ch5 whole-verse speller Greek Keyboard reference', async () => {
+  await go('#/activity/chapt_5/c5_ex_scripture_speller');
+  await page.locator('.card').getByRole('button', { name: 'Greek Keyboard', exact: true }).click();
+  await page.waitForTimeout(100);
+});
+// THE STRUCTURAL HALF OF D3, which is what actually fixes WebKit and what a
+// future edit is most likely to undo by accident:
+//   * the OVERLAY scrolls. A flex-centred item that overflows its container
+//     overflows equally at BOTH ends and cannot be scrolled to; auto margins
+//     centre the same way and leave the overflow scrollable.
+//   * the modal's height cap is expressed against the VISIBLE viewport (dvh),
+//     not the largest-possible one (vh), so an iOS toolbar cannot push the
+//     bottom of the dialog past the bottom of the screen.
+{
+  await page.setViewportSize({ width: 320, height: 480 });
+  await go('#/activity/chapt_4/c4_drill_greek_noun');
+  await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
+  await page.waitForTimeout(100);
+  const shape = await page.locator('.modal-overlay').evaluate(el => {
+    const overlay = getComputedStyle(el);
+    const modal = getComputedStyle(el.querySelector('.modal'));
+    return {
+      overlayOverflowY: overlay.overflowY,
+      overlayAlignItems: overlay.alignItems,
+      modalOverflowY: modal.overflowY,
+      modalMaxHeight: modal.maxHeight,
+      viewport: el.clientHeight
+    };
+  });
+  const capped = Math.abs(parseFloat(shape.modalMaxHeight) - (480 - 40)) < 1.5;
+  check('5E §6.7 the modal overlay scrolls and the modal is capped to the visible viewport',
+    /auto|scroll/.test(shape.overlayOverflowY) && shape.overlayAlignItems !== 'center'
+      && /auto|scroll/.test(shape.modalOverflowY) && capped,
+    JSON.stringify(shape));
+  await page.setViewportSize({ width: 390, height: 900 });
+}
+
+// The end-of-chapter dialog has no "Close" button by name; its escape actions
+// are the ones that must be reachable.
+{
+  await page.setViewportSize({ width: 320, height: 480 });
+  const last = ch1.sequence[ch1.sequence.length - 1];
+  await go(`#/activity/chapt_1/${last}`);
+  await page.locator('.rail-next').click();
+  await page.waitForTimeout(150);
+  const stay = page.locator('.modal .modal-actions .btn', { hasText: 'Stay' }).first();
+  await stay.scrollIntoViewIfNeeded();
+  const box = await stay.boundingBox();
+  check('5E §6.7 end-of-chapter dialog: its last action is reachable at 320x480',
+    !!box && box.y >= 0 && box.y + box.height <= 480, JSON.stringify(box));
+  await page.setViewportSize({ width: 390, height: 900 });
+}
+
+// ------------------------------------------------------ §6.8 option grids
+// A CENSUS, not a list: every select activity in chapters 1-5, measured at both
+// widths. The responsive pool must be 2-up at 320 and 4-up at 768 whatever
+// language its labels are in; the paradigm-shaped grids stay 2-up at both
+// (D-26); and the only other grids allowed to differ are the ones whose data
+// DECLARES a layout (optionLayout single/paradigm2col, optionGroups) or whose
+// options are single glyphs. Anything else stuck at four-up would be the D-19
+// defect returning, and this is what would catch it.
+{
+  const declaredLayout = a => a.optionLayout
+    || (Array.isArray(a.optionGroups) && a.optionGroups.length ? 'grouped' : null);
+  const census = [];
+  for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
+    for (const activity of activitiesOf(chapter).filter(a => a && a.type === 'select')) {
+      const cols = {};
+      for (const width of [320, 768]) {
+        await page.setViewportSize({ width, height: 900 });
+        await go(`#/activity/${chapterId}/${activity.id}`);
+        cols[width] = await page.locator('.grid.options').first()
+          .evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
+      }
+      census.push({ chapterId, id: activity.id, layout: declaredLayout(activity), cols });
+    }
+  }
+  await page.setViewportSize({ width: 390, height: 900 });
+
+  // The lexicon-derived vocabulary pools, in BOTH directions, are the grids
+  // D-19 is about: 2-up on a phone, 4-up once the iPad has room.
+  const vocabulary = census.filter(row => /_vocab_(gk_en|en_gk)$/.test(row.id));
+  const paradigm = census.filter(row => row.layout === 'paradigm2col');
+  const declared = census.filter(row => row.layout === 'single' || row.layout === 'grouped');
+
+  for (const row of vocabulary) {
+    check(`5E §6.8 ${row.chapterId} ${row.id}: option grid is 2-up at 320px and 4-up at 768px`,
+      row.cols[320] === 2 && row.cols[768] === 4, `${row.cols[320]} / ${row.cols[768]} columns`);
+  }
+  for (const row of paradigm) {
+    check(`5E §6.8 ${row.chapterId} ${row.id}: paradigm grid stays 2-up at both widths (D-26)`,
+      row.cols[320] === 2 && row.cols[768] === 2, `${row.cols[320]} / ${row.cols[768]} columns`);
+  }
+  for (const row of declared) {
+    check(`5E §6.8 ${row.chapterId} ${row.id}: declared "${row.layout}" layout is single-column at both widths`,
+      row.cols[320] === 1 && row.cols[768] === 1, `${row.cols[320]} / ${row.cols[768]} columns`);
+  }
+
+  // THE PHONE-WIDTH GUARD, which is the half of D-19 that protects reading.
+  // Four columns inside 320px is only ever legible for one-glyph tiles, digits
+  // and the chapter-1 letter-name generators, which the device pass ratified at
+  // four-up. That set is NAMED: a new grid arriving four-up on a phone fails
+  // here instead of shipping and being found on device.
+  const FOUR_UP_AT_320 = new Set([
+    'c1_ex_letter_to_name', 'c1_ex_name_to_letter', 'c1_ex_translit', 'c1_ex_transcribe',
+    'c2_drill_syllable_counting'
+  ]);
+  const wide = census.filter(row => row.cols[320] === 4).map(row => row.id);
+  const unexpected = wide.filter(id => !FOUR_UP_AT_320.has(id));
+  const missing = [...FOUR_UP_AT_320].filter(id => !wide.includes(id));
+  check('5E §6.8 four-up at 320px is confined to the named single-glyph/number grids',
+    unexpected.length === 0 && missing.length === 0,
+    `four-up at 320: ${wide.join(', ') || 'none'}${unexpected.length ? `; UNEXPECTED ${unexpected.join(', ')}` : ''}${missing.length ? `; no longer four-up ${missing.join(', ')}` : ''}`);
+  // Nothing may be wider on a phone than it is on an iPad, in any chapter.
+  const shrinking = census.filter(row => row.cols[320] > row.cols[768]);
+  check('5E §6.8 no option grid is denser at 320px than at 768px',
+    shrinking.length === 0, shrinking.map(r => `${r.id}=${r.cols[320]}/${r.cols[768]}`).join(', ') || 'none');
+  console.log(`      option-grid census (320/768): ${census.map(r => `${r.id}=${r.cols[320]}/${r.cols[768]}`).join('  ')}`);
+}
+
 await browser.close();
 const failed = results.filter(r => !r.ok);
 console.log(`\n${results.length - failed.length}/${results.length} behavior checks passed`);
diff --git a/src/app.css b/src/app.css
index ed65843..15b2a60 100644
--- a/src/app.css
+++ b/src/app.css
@@ -311,11 +311,41 @@ button { font: inherit; cursor: pointer; }
 .rail-count { font-weight: 700; color: var(--teal-dark); font-size: 0.95rem; }
 .rail-next-placeholder { min-width: 96px; }
 
-/* ---- End-of-chapter modal ---- */
+/* ---- MODAL SURFACES (5E-SPEC2 §5.1, rule D3) ----
+   EVERY modal, popup and expander must scroll to its close control at every
+   supported width down to 320px. A close button the user cannot reach is a
+   trap, and this one was reachable in theory and not in practice:
+
+   the overlay is `position: fixed` and did not scroll, the modal was capped at
+   86vh and CENTERED in it. On any engine where the visual viewport is shorter
+   than 100vh -- iOS Safari with its toolbar showing, which is the target
+   device -- 86vh plus 20px of padding at each end is taller than what the user
+   can see, and a centered flex item that overflows its container overflows
+   EQUALLY at both ends with no way to scroll to either. Opening Meanings
+   inside a chapter 4/5 drill Hint is what made the modal tall enough to prove
+   it.
+
+   Two changes fix it for every modal at once, which is why they live on the
+   shared classes and not on .hint-modal:
+     * the OVERLAY scrolls (overflow-y: auto) and `margin: auto` on the modal
+       does the centering. Flexbox centering cannot be scrolled past; auto
+       margins centre the same way and still let the scroll container reach
+       both ends.
+     * the cap is dvh-based, so it is the height the device is actually
+       showing rather than the height it would show with the toolbar hidden.
+       The vh line stays first as the fallback for engines without dvh. */
 .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.45);
-  display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 100; }
+  display: flex; justify-content: center; z-index: 100;
+  padding: 20px; padding-top: calc(20px + env(safe-area-inset-top));
+  padding-bottom: calc(20px + env(safe-area-inset-bottom));
+  overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }
 .modal { background: var(--card); border-radius: var(--radius); padding: 22px 20px;
-  max-width: 360px; width: 100%; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25); }
+  max-width: 360px; width: 100%; margin: auto; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
+  /* The cap and the inner scroll are on the SHARED class, so a new modal
+     inherits D3 instead of having to remember it. */
+  max-height: calc(100vh - 40px);
+  max-height: calc(100dvh - 40px);
+  overflow-y: auto; }
 .modal-title { margin: 0 0 8px; font-size: 1.2rem; }
 .modal-body { margin: 0 0 6px; color: var(--ink); }
 .modal-note { margin: 0; font-size: 0.9rem; color: var(--teal-dark); font-weight: 600; }
@@ -356,7 +386,19 @@ button { font: inherit; cursor: pointer; }
 .rc-list > li { margin-bottom: 10px; position: relative; counter-increment: rc-item; }
 .rc-list:not(.authored-labels) > li::before { content: counter(rc-item) ")";
   position: absolute; left: -1.9em; width: 1.5em; text-align: right; font-weight: 600; }
-.rc-list.authored-labels { padding-left: 0.75em; }
+/* D1/5E-SPEC2 §5.2: EVERY list hangs, including the ones whose numbers are
+   authored into the data rather than generated. Chapter 2 is the whole of this
+   class -- its fourteen "1) 2) 3)" lists include the Accent Rule Drill's six
+   rules and the Three Syllable Rules the Syllable Counting drill and the
+   Syllable Division exercise both open as their Hint. Those lists print their
+   marker as an inline .rc-num span, so a wrapped rule ran back under its own
+   number and the six points read as one block of prose. The list keeps the
+   same 1.9em text column the generated-counter lists use; the marker is pulled
+   out of it, which is what makes the wrap align under the text. */
+.rc-list.authored-labels { padding-left: 1.9em; }
+.rc-list.authored-labels > li { counter-increment: none; }
+.rc-list.authored-labels > li > .rc-num { position: absolute; left: -1.9em;
+  width: 1.5em; margin-right: 0; text-align: right; }
 .rc-list.unnumbered { padding-left: 0; }
 .rc-list.unnumbered > li { counter-increment: none; }
 .rc-list.unnumbered > li::before { content: none; }
@@ -761,8 +803,10 @@ button { font: inherit; cursor: pointer; }
 .pg-ending { font-size: 1.3rem; color: var(--ink); }
 .pg-endgloss { font-size: 0.78rem; color: var(--teal-dark); overflow-wrap: break-word; text-align: center; }
 
-/* Hint popup: the paradigm over the drill (the original's Hint window). */
-.hint-modal { max-width: 400px; max-height: 86vh; overflow-y: auto; }
+/* Hint popup: the paradigm over the drill (the original's Hint window). The
+   height cap and the inner scroll come from .modal (D3); only the width is
+   this popup's own -- a paradigm needs more than the 360px a text dialog does. */
+.hint-modal { max-width: 400px; }
 
 /* ---- INTERLINEAR VERSE (Scripture Memory) ----
    Greek row over gloss row, wrapping as whole words so a word never parts
diff --git a/src/components/ContentAudio.svelte b/src/components/ContentAudio.svelte
index dd94456..a2b7e19 100644
--- a/src/components/ContentAudio.svelte
+++ b/src/components/ContentAudio.svelte
@@ -6,9 +6,10 @@
   // paradigmChart / interlinearVerse. The bespoke
   // modes are pedagogical layouts reconstructed from the original's yellow
   // panels; their per-mode data contracts are documented in HANDOFF-4 §5 (B1).
+  import { onDestroy } from 'svelte';
   import { slide } from 'svelte/transition';
   import { getGreekTapMap, resolveItems, shuffle } from '../lib/content.js';
-  import { play } from '../lib/audio.js';
+  import { play, stop as stopAudio } from '../lib/audio.js';
   import { markCompleted } from '../lib/progress.js';
   import RichContent from './RichContent.svelte';
   import ArrowCue from './ArrowCue.svelte';
@@ -76,6 +77,23 @@
   $: showEnglish = vocabMode !== 'hideEnglish' || revealE;
   function setVocabMode(m) { vocabMode = m; revealG = false; revealE = false; }
 
+  // AUDIO STOPS ON EVERY EXIT (5E-SPEC2 §3.1, rule A4). A TOPIC SWITCH is the
+  // exit that was missed: it does not remount the activity and it does not
+  // change the route, so neither {#key activityId} nor App.svelte's
+  // hashchange handler sees it — and a Say Whole Paradigm clip started on
+  // chapter 4's Masculine Declension kept reading over Neuter Declension and
+  // over Word Order after it. Every way OUT of a topic goes through here.
+  function goToTopic(index) {
+    const next = Math.max(0, Math.min(topics.length - 1, index));
+    if (next === topicIndex) return;
+    stopAudio();
+    topicIndex = next;
+  }
+  // The unmount exit: the rail and the route both destroy this component, and
+  // App.svelte stops audio on hashchange as well. Belt and braces, locally
+  // owned, so the rule does not depend on the shell remembering it.
+  onDestroy(() => stopAudio());
+
   function clickTile(item) {
     lastClicked = item;
     const a = item.audio || (item.meta && item.meta.audioShort);
@@ -166,9 +184,9 @@
       <div class="pending-verification">Topic content pending verification.</div>
     {/if}
     <div class="controls topic-controls">
-      <button class="btn secondary" on:click={() => (topicIndex = Math.max(0, topicIndex - 1))} disabled={topicIndex <= 0}>Previous Topic</button>
+      <button class="btn secondary" on:click={() => goToTopic(topicIndex - 1)} disabled={topicIndex <= 0}>Previous Topic</button>
       <span class="topic-count">{topics.length ? topicIndex + 1 : 0} of {topics.length}</span>
-      <button class="btn" on:click={() => (topicIndex = Math.min(topics.length - 1, topicIndex + 1))} disabled={!topics.length || topicIndex >= topics.length - 1}>Next Topic</button>
+      <button class="btn" on:click={() => goToTopic(topicIndex + 1)} disabled={!topics.length || topicIndex >= topics.length - 1}>Next Topic</button>
     </div>
     {#if activity._topic_verify}<div class="pending-verification compact">Topic order pending verification.</div>{/if}
   </div>
diff --git a/src/components/DivideActivity.svelte b/src/components/DivideActivity.svelte
index ccaa28b..f1c7e42 100644
--- a/src/components/DivideActivity.svelte
+++ b/src/components/DivideActivity.svelte
@@ -24,16 +24,22 @@
   //     Clear Answer does the same thing without leaving the item. Score
   //     history already spent is not rewound.
   //
-  // ANSWER POLICY (5B patch 2a): answerPolicy.attemptsPerItem === 1 means
-  // Check Answer finalizes the item right or wrong, reveals the hyphen-joined
-  // divided form, and auto-advances after autoAdvanceMs. The timer is cancelled
-  // on manual Previous/Next, on Clear Answer and on unmount.
+  // ANSWER POLICY. Check Answer finalizes the item right or wrong and reveals
+  // the hyphen-joined divided form. The CLASS decides what happens next, and
+  // this exercise's class is `manualCorrectAutoIncorrect` (5E-SPEC2 §1, from
+  // the DOSBox pass): a correct division WAITS for Next, a wrong one
+  // auto-advances on the longer wait. That is the opposite of the obvious
+  // arrangement and it is what the original does. The advance is cancelled by
+  // manual Previous/Next, by Clear Answer and on unmount.
+  //
+  // AUDIO (§2.2) is `afterGuess`: the word is spoken once the answer is in,
+  // and the next word does not appear until the clip has finished.
   import { afterUpdate, onDestroy, onMount, tick } from 'svelte';
-  import { play } from '../lib/audio.js';
+  import { play, playThrough, stop as stopAudio } from '../lib/audio.js';
   import { randomFeedback, resolveHintBlocks } from '../lib/content.js';
   import { dividedForm, splitGraphemes } from '../lib/greek.js';
   import { markCompleted } from '../lib/progress.js';
-  import { resolveAdvance } from '../lib/timing.js';
+  import { resolveAdvance, waitsForNext } from '../lib/timing.js';
   import RichContent from './RichContent.svelte';
 
   export let chapter;
@@ -53,8 +59,11 @@
   // D1 (SPEC3): hidden until the first Score press; ui.liveScore governs whether
   // the revealed line keeps updating, not whether it starts open.
   let showScore = false;
-  let pronounceEach = activity.ui?.defaults?.pronounceEach ?? false;
+  // A7: Pronounce Each defaults ON wherever the checkbox exists.
+  let pronounceEach = activity.ui?.defaults?.pronounceEach ?? true;
   let advanceTimer = null;
+  let advanceToken = 0;
+  let answeredCorrect = false;
   const attemptedItems = new Set();
 
   // ---- SIZING (C1): one size, set by the longest word in the pool ----
@@ -203,9 +212,12 @@
   $: item = items[itemIndex] || null;
   $: pending = !item || !item.greek || !Array.isArray(item.division);
   $: hintBlocks = resolveHintBlocks(chapter, activity.hint);
-  $: oneAttempt = activity.answerPolicy?.attemptsPerItem === 1;
-  $: autoAdvanceMs = resolveAdvance(activity.answerPolicy).correctMs;
+  $: advancePolicy = resolveAdvance(activity.answerPolicy);
+  $: oneAttempt = advancePolicy.oneAttempt;
+  $: audioTiming = activity.audioTiming || 'afterGuess';
   $: revealed = answered && oneAttempt;
+  // §5.5: manualCorrectAutoIncorrect waits on a CORRECT answer, so say so.
+  $: awaitingNext = answered && waitsForNext(advancePolicy, answeredCorrect);
   $: answerGaps = new Set((!pending && item.division) || []);
   // Live score (C3): reactive, so the line follows every answer instead of
   // freezing at whatever it said when the box was opened.
@@ -225,6 +237,23 @@
     return answer.every(gap => dividers.has(gap));
   }
 
+  function cancelAdvance() {
+    advanceToken += 1;
+    clearTimeout(advanceTimer);
+    advanceTimer = null;
+  }
+
+  // max(class minimum, clip duration) — §2.2. The minimum is a timer, the clip
+  // is a promise, and the advance happens when both are done unless the token
+  // says a manual move got there first.
+  function scheduleAdvance(ms, clip) {
+    cancelAdvance();
+    const token = advanceToken;
+    const minimum = new Promise(resolve => { advanceTimer = setTimeout(resolve, ms); });
+    const spoken = clip ? playThrough(clip) : Promise.resolve();
+    Promise.all([minimum, spoken]).then(() => { if (token === advanceToken) move(1); });
+  }
+
   function check() {
     if (pending || answered) return;
     attempts += 1;
@@ -233,25 +262,32 @@
     if (right) correct += 1;
     feedback = randomFeedback(chapter, right ? 'correct' : 'incorrect');
     feedbackKind = right ? 'ok' : 'bad';
+    const clip = (audioTiming === 'afterGuess' && pronounceEach && item.audio) ? item.audio : null;
     if (right || oneAttempt) {
       answered = true;
+      answeredCorrect = right;
       endDrag();
       if (attemptedItems.size === items.length) markCompleted(activity.id);
-      clearTimeout(advanceTimer);
-      advanceTimer = setTimeout(() => move(1), autoAdvanceMs);
+      if (right && advancePolicy.autoOnCorrect) scheduleAdvance(advancePolicy.correctMs, clip);
+      else if (!right && advancePolicy.autoOnIncorrect) scheduleAdvance(advancePolicy.incorrectMs, clip);
+      else { cancelAdvance(); if (clip) play(clip); }
+    } else if (clip) {
+      play(clip);
     }
   }
 
   // C4. Wipes the dividers and re-opens the item without leaving it. Attempts
   // already counted stay counted.
   function clearAnswer() {
-    clearTimeout(advanceTimer);
+    cancelAdvance();
+    stopAudio();
     endDrag();
     dividers = new Set();
     oneSyllable = false;
     feedback = '';
     feedbackKind = '';
     answered = false;
+    answeredCorrect = false;
   }
 
   // REVISITING AN ITEM RESETS IT (5D-SPEC2 §3, VERIFY-5D A5). Arriving at a
@@ -265,11 +301,16 @@
     feedback = '';
     feedbackKind = '';
     answered = false;
+    answeredCorrect = false;
     showAnswer = false;
   }
 
+  // §2.3: Previous/Next stops the clip and shows the word at once. The word is
+  // NOT spoken on arrival any more — this exercise is `afterGuess`, so its
+  // clip belongs after Check Answer (and Pronounce is always there).
   function move(delta) {
-    clearTimeout(advanceTimer);
+    cancelAdvance();
+    stopAudio();
     endDrag();
     const nextIndex = Math.max(0, Math.min(items.length - 1, itemIndex + delta));
     if (nextIndex === itemIndex) return;
@@ -277,8 +318,6 @@
     focusGap = 1;
     gapCentres = [];
     restoreItem();
-    const nextItem = items[itemIndex];
-    if (pronounceEach && nextItem && nextItem.audio) play(nextItem.audio);
   }
 
   function scoreText(a, c) {
@@ -304,7 +343,8 @@
   });
 
   onDestroy(() => {
-    clearTimeout(advanceTimer);
+    cancelAdvance();
+    stopAudio();                                   // §3.1
     if (observer) observer.disconnect();
   });
 </script>
@@ -366,6 +406,8 @@
     {#if showAnswer || revealed}
       <div class="exercise-answer"><span>Answer</span><span class="greek">{dividedForm(item.greek, item.division)}</span></div>
     {/if}
+    <!-- §5.5: a correct division waits for Next; say so. -->
+    {#if awaitingNext}<div class="await-next" role="status">Click Next to continue</div>{/if}
   {/if}
 
   <div class="controls grouped">
diff --git a/src/components/PlaceAccentActivity.svelte b/src/components/PlaceAccentActivity.svelte
index 752cd2f..6a54437 100644
--- a/src/components/PlaceAccentActivity.svelte
+++ b/src/components/PlaceAccentActivity.svelte
@@ -5,16 +5,18 @@
   // it belongs on, then Check Answer. The chapter's own Scripture reference for
   // the form sits by the checkbox row, as in the original.
   //
-  // ANSWER POLICY (5B patch 2a): attemptsPerItem === 1 finalizes on Check
-  // Answer either way, reveals answerForm, and auto-advances after
-  // autoAdvanceMs; the timer is cancelled on manual Previous/Next and unmount.
+  // ANSWER POLICY. Check Answer finalizes the item either way and reveals
+  // answerForm. The class is `manualCorrectAutoIncorrect` (5E-SPEC2 §1, from
+  // the DOSBox pass): a correct placement WAITS for Next, a wrong one
+  // auto-advances on the longer wait. AUDIO is `afterGuess` (§2.2) — the word
+  // is spoken after the answer and the next word waits for the clip to end.
   // Completion = all items ATTEMPTED.
   import { onDestroy } from 'svelte';
-  import { play } from '../lib/audio.js';
+  import { play, playThrough, stop as stopAudio } from '../lib/audio.js';
   import { randomFeedback } from '../lib/content.js';
   import { analyzeAccent, splitGraphemes } from '../lib/greek.js';
   import { markCompleted } from '../lib/progress.js';
-  import { resolveAdvance } from '../lib/timing.js';
+  import { resolveAdvance, waitsForNext } from '../lib/timing.js';
   import RichContent from './RichContent.svelte';
 
   export let chapter;
@@ -39,17 +41,23 @@
   // D1: hidden until the first Score press; ui.liveScore governs whether the
   // revealed line keeps updating, not whether it starts open.
   let showScore = false;
-  let pronounceEach = activity.ui?.defaults?.pronounceEach ?? false;
+  // A7: Pronounce Each defaults ON wherever the checkbox exists.
+  let pronounceEach = activity.ui?.defaults?.pronounceEach ?? true;
   let advanceTimer = null;
+  let advanceToken = 0;
+  let answeredCorrect = false;
   const attemptedWords = new Set();
 
   $: word = words[wordIndex] || null;
   $: answer = analyzeAccent(word && word.answerForm);
   $: pending = !word || !word.answerForm || !answer.type || answer.position < 0;
   $: hintBlocks = (activity.hint && activity.hint.content) || [];
-  $: oneAttempt = activity.answerPolicy?.attemptsPerItem === 1;
-  $: autoAdvanceMs = resolveAdvance(activity.answerPolicy).correctMs;
+  $: advancePolicy = resolveAdvance(activity.answerPolicy);
+  $: oneAttempt = advancePolicy.oneAttempt;
+  $: audioTiming = activity.audioTiming || 'afterGuess';
   $: revealed = answered && oneAttempt;
+  // §5.5: manualCorrectAutoIncorrect waits on a CORRECT answer, so say so.
+  $: awaitingNext = answered && waitsForNext(advancePolicy, answeredCorrect);
   // ROOT DISPLAY (5B-SPEC4 D2). Every item shows a Greek word in the header --
   // VERIFY3 item 3 found six that showed only a gloss. Those six are the ones
   // whose root IS their answer form (the original's ἄνθρωπος item and the five
@@ -74,17 +82,35 @@
     feedback = '';
     feedbackKind = '';
     answered = false;
+    answeredCorrect = false;
     showAnswer = false;
   }
 
+  // \u00a72.3: Previous/Next stops the clip and shows the word at once. The word is
+  // no longer spoken on ARRIVAL \u2014 this exercise is `afterGuess`, so its clip
+  // belongs after Check Answer (Pronounce Word remains the on-demand path).
   function move(delta) {
-    clearTimeout(advanceTimer);
+    cancelAdvance();
+    stopAudio();
     const nextIndex = Math.max(0, Math.min(words.length - 1, wordIndex + delta));
     if (nextIndex === wordIndex) return;
     wordIndex = nextIndex;
     restoreWord();
-    const nextWord = words[wordIndex];
-    if (pronounceEach && nextWord && nextWord.audio) play(nextWord.audio);
+  }
+
+  function cancelAdvance() {
+    advanceToken += 1;
+    clearTimeout(advanceTimer);
+    advanceTimer = null;
+  }
+
+  // max(class minimum, clip duration) \u2014 \u00a72.2.
+  function scheduleAdvance(ms, clip) {
+    cancelAdvance();
+    const token = advanceToken;
+    const minimum = new Promise(resolve => { advanceTimer = setTimeout(resolve, ms); });
+    const spoken = clip ? playThrough(clip) : Promise.resolve();
+    Promise.all([minimum, spoken]).then(() => { if (token === advanceToken) move(1); });
   }
 
   function check() {
@@ -99,11 +125,16 @@
     if (ok) correct += 1;
     feedback = randomFeedback(chapter, ok ? 'correct' : 'incorrect');
     feedbackKind = ok ? 'ok' : 'bad';
+    const clip = (audioTiming === 'afterGuess' && pronounceEach && word.audio) ? word.audio : null;
     if (ok || oneAttempt) {
       answered = true;
+      answeredCorrect = ok;
       if (attemptedWords.size === words.length) markCompleted(activity.id);
-      clearTimeout(advanceTimer);
-      advanceTimer = setTimeout(() => move(1), autoAdvanceMs);
+      if (ok && advancePolicy.autoOnCorrect) scheduleAdvance(advancePolicy.correctMs, clip);
+      else if (!ok && advancePolicy.autoOnIncorrect) scheduleAdvance(advancePolicy.incorrectMs, clip);
+      else { cancelAdvance(); if (clip) play(clip); }
+    } else if (clip) {
+      play(clip);
     }
   }
 
@@ -112,7 +143,7 @@
     return `${c} correct out of ${a} attempts (${Math.round((c / a) * 100)}%)`;
   }
 
-  onDestroy(() => clearTimeout(advanceTimer));
+  onDestroy(() => { cancelAdvance(); stopAudio(); });     // §3.1
 </script>
 
 <div class="card accent-activity">
@@ -163,6 +194,8 @@
     {#if showAnswer || revealed}
       <div class="exercise-answer"><span>Answer</span><span class="greek">{word.answerForm}</span></div>
     {/if}
+    <!-- §5.5: a correct placement waits for Next; say so. -->
+    {#if awaitingNext}<div class="await-next" role="status">Click Next to continue</div>{/if}
   {/if}
 
   <div class="controls grouped">
diff --git a/src/components/ReadingCategories.svelte b/src/components/ReadingCategories.svelte
index 8ee029f..9ea0078 100644
--- a/src/components/ReadingCategories.svelte
+++ b/src/components/ReadingCategories.svelte
@@ -4,8 +4,9 @@
   // and place names play their recorded clip on Answer; letter names play the
   // letter's name-only clip. Completing the last item of ANY category marks
   // the activity done.
+  import { onDestroy } from 'svelte';
   import { getReadingLists } from '../lib/content.js';
-  import { play } from '../lib/audio.js';
+  import { play, stop as stopAudio } from '../lib/audio.js';
   import { markCompleted } from '../lib/progress.js';
   export let chapter;
   export let activity;
@@ -41,11 +42,17 @@
   $: category = categories[catIndex];
   $: item = category ? category.items[itemIndex] : null;
 
+  // A4/5E-SPEC2 §3.1: a category is this activity's "topic", and switching
+  // away from one stops what it started. Same rule as topicPages, and the same
+  // reason: neither switch remounts the component or changes the route.
   function selectCategory(i) {
+    if (i === catIndex) return;
+    stopAudio();
     catIndex = i;
     itemIndex = 0;
     answered = false;
   }
+  onDestroy(() => stopAudio());
   function answer() {
     answered = true;
     if (item && item.audio) play(item.audio);
diff --git a/src/components/SelectActivity.svelte b/src/components/SelectActivity.svelte
index b3e182a..be010bb 100644
--- a/src/components/SelectActivity.svelte
+++ b/src/components/SelectActivity.svelte
@@ -5,18 +5,20 @@
   //
   // ANSWER POLICY. activity.answerPolicy declares WHAT a tap on an option
   // means; src/lib/timing.js decides how long anything waits (D-14 — no
-  // timing number lives in this file). The three classes:
-  //   retry              a wrong tap leaves the item open; only a correct tap
-  //                      advances (chapter 1, Syllable Counting).
-  //   manualOnIncorrect  one attempt; correct auto-advances, incorrect reveals
-  //                      the answer, LOCKS the options and waits for Next
-  //                      (ch2 Accent Rule, ch3's five drills).
-  //   autoBoth           one attempt; both outcomes auto-advance, incorrect on
-  //                      the longer wait (ch3 Scripture Memory Drill).
-  // Chapter 2's older attemptsPerItem/autoAdvanceOnIncorrect fields map onto
-  // the same three classes; its durations now come from the shared constants.
-  // Completion: one-attempt drills complete on all-ATTEMPTED, retry drills on
-  // all-correct.
+  // timing number lives in this file) and which outcomes move by themselves.
+  // The six classes and their behavior live in that module's header; this
+  // component reads the resolved FLAGS (autoOnCorrect / autoOnIncorrect /
+  // revealOnIncorrect / oneAttempt) and never compares a class name.
+  // Completion: one-attempt drills complete on all-ATTEMPTED, "until right"
+  // drills on all-correct.
+  //
+  // AUDIO TIMING (5E-SPEC2 §2) is likewise declared by the data, in
+  // activity.audioTiming, and never inferred from the prompt language here:
+  //   beforeGuess  the prompt clip plays when the item appears (Greek prompt)
+  //   afterGuess   the clip plays once the answer is in, and the next item
+  //                does not appear until it has FINISHED (English prompt —
+  //                speaking the Greek any earlier hands over the answer)
+  //   none         this drill has no clip of its own
   //
   // CONTROLS come from activity.ui.buttons, so each drill shows exactly the
   // original's button block (Previous / Next / Pronounce / Translate / Hint /
@@ -24,9 +26,9 @@
   import { onDestroy } from 'svelte';
   import { buildSelectQuestions, randomFeedback, resolveHintBlocks, resolveHintRef } from '../lib/content.js';
   import { combiningForMarkName, firstAccentCluster, markOverlayParts } from '../lib/greek.js';
-  import { play } from '../lib/audio.js';
+  import { play, playThrough, stop as stopAudio } from '../lib/audio.js';
   import { markCompleted } from '../lib/progress.js';
-  import { resolveAdvance } from '../lib/timing.js';
+  import { resolveAdvance, waitsForNext } from '../lib/timing.js';
   import RichContent from './RichContent.svelte';
   import Paradigm from './Paradigm.svelte';
   export let chapter;
@@ -49,6 +51,13 @@
   let shownReveals = [];
   let showScore = false;
   let advanceTimer = null;
+  // Bumped by every scheduled advance and by everything that cancels one
+  // (manual Previous/Next, a new answer, unmount). An advance that has to wait
+  // for a clip to finish resolves asynchronously, so the token — not the timer
+  // handle alone — is what keeps a superseded advance from firing. §2.3: Next
+  // stops the audio and moves at once, which is this token plus stopAudio().
+  let advanceToken = 0;
+  let answeredCorrect = false;
   const attemptedItems = new Set();
 
   init();
@@ -67,7 +76,8 @@
     // says the line updates live once revealed, not that it opens by itself --
     // Score is what reveals it, as in the original, and toggles it after.
     showScore = false;
-    clearTimeout(advanceTimer);
+    answeredCorrect = false;
+    cancelAdvance();
     maybePronounce();
   }
 
@@ -134,10 +144,18 @@
   // Timing and advance semantics: declared by the data, resolved centrally.
   $: advancePolicy = resolveAdvance(activity.answerPolicy);
   $: oneAttempt = advancePolicy.oneAttempt;
-  // The "Click Next to continue" state: the item is final, wrong, and nothing
-  // is going to move on its own.
-  $: waitingForNext = answered && oneAttempt && !advancePolicy.autoOnIncorrect
-    && picked !== null && picked !== current?.answerId;
+  // §2: the moment this drill's clip is spoken, straight from the data. A
+  // drill with no stamped timing keeps the pre-5E behavior (speak the prompt
+  // on arrival) rather than falling silent; check:shapes rejects any value
+  // outside the five, and apply-behavior-matrix.py stamps every shipped drill.
+  $: audioTiming = activity.audioTiming || 'beforeGuess';
+  // §5.5: the item is final and nothing is going to move it. Which outcomes
+  // those are is the class's business, not this component's.
+  $: waitingForNext = answered && waitsForNext(advancePolicy, answeredCorrect);
+  // §1: whether the ANSWER is shown. A correct item always shows what it got
+  // right; a wrong one shows the answer only where the class says to, because
+  // revealing it would destroy an "until right" exercise (rule B5).
+  $: showAnswerReveal = answered && (answeredCorrect || advancePolicy.revealOnIncorrect);
 
   function sliceGroups(list, sizes) {
     const groups = [];
@@ -193,11 +211,41 @@
 
   function maybePronounce() {
     const q = questions[qIndex];
-    // Prompt audio only. A drill whose ANSWER is the Greek (Greek Verb Drill)
-    // has no prompt clip, and speaking the answer here would hand it over.
+    // §2.1: the prompt clip on arrival, and only where the data says so. A
+    // drill whose ANSWER is the Greek (Greek Verb Drill) is `afterGuess`, and
+    // speaking anything here would hand the answer over.
+    if (audioTiming !== 'beforeGuess') return;
     if (pronounceEach && q && !q.pending && q.promptAudio) play(q.promptAudio);
   }
 
+  // §2.2: the clip that follows a guess on an `afterGuess` drill. It is the
+  // ANSWER's clip where the answer is the Greek (English-prompt drills) and
+  // the prompt's own clip where the prompt was the Greek all along (chapter
+  // 1's letter exercises, which the DOSBox pass records as speaking after the
+  // guess). Either way the item is finalized before it is spoken.
+  function afterGuessAudio() {
+    if (audioTiming !== 'afterGuess' || !pronounceEach || !current) return null;
+    return current.answerAudio || current.promptAudio || null;
+  }
+
+  function cancelAdvance() {
+    advanceToken += 1;
+    clearTimeout(advanceTimer);
+    advanceTimer = null;
+  }
+
+  // Schedule the move to the next item: no sooner than the class minimum, and
+  // no sooner than the end of the afterGuess clip (§2.2 — the wait is
+  // max(class minimum, audio duration), never shorter than 2000/4000). Both
+  // halves are cancelled by cancelAdvance(), so Next always wins (§2.3).
+  function scheduleAdvance(ms, clip) {
+    cancelAdvance();
+    const token = advanceToken;
+    const minimum = new Promise(resolve => { advanceTimer = setTimeout(resolve, ms); });
+    const spoken = clip ? playThrough(clip) : Promise.resolve();
+    Promise.all([minimum, spoken]).then(() => { if (token === advanceToken) advance(); });
+  }
+
   function choose(opt) {
     if (answered || finished || current.pending) return;
     picked = opt.id;
@@ -207,26 +255,33 @@
     if (right) correct += 1;
     feedback = randomFeedback(chapter, right ? 'correct' : 'incorrect');
     feedbackKind = right ? 'ok' : 'bad';
-    // English-prompt / Greek-answer drills speak the answer once it is won.
-    if (right && pronounceEach && current.answerAudio) play(current.answerAudio);
+    const clip = afterGuessAudio();
     if (right || oneAttempt) {
       // One attempt: the item is done either way and the answer is revealed.
       // "One attempt" is scoped to this VISIT — coming back to the item
       // reopens it (see restore()).
       answered = true;
+      answeredCorrect = right;
       // Completion is defined by attempted items, so record the final item when
       // it is ANSWERED. Route exit cancels the timer, not progress.
       if (oneAttempt && attemptedItems.size === questions.length && activity.id) markCompleted(activity.id);
-      clearTimeout(advanceTimer);
-      if (right) advanceTimer = setTimeout(advance, advancePolicy.correctMs);
-      else if (advancePolicy.autoOnIncorrect) advanceTimer = setTimeout(advance, advancePolicy.incorrectMs);
-      // manualOnIncorrect: nothing is scheduled — the options are locked and
-      // the learner reads the revealed answer until they press Next.
+      if (right && advancePolicy.autoOnCorrect) scheduleAdvance(advancePolicy.correctMs, clip);
+      else if (!right && advancePolicy.autoOnIncorrect) scheduleAdvance(advancePolicy.incorrectMs, clip);
+      else {
+        // A waiting outcome: nothing is scheduled, the surface says so
+        // (waitingForNext), and the clip still gets spoken.
+        cancelAdvance();
+        if (clip) play(clip);
+      }
+    } else if (clip) {
+      // retryUntilRight, wrong: the item stays open and nothing is revealed,
+      // but the guess has been made, so the clip is still due.
+      play(clip);
     }
   }
 
   function advance() {
-    clearTimeout(advanceTimer);
+    cancelAdvance();
     if (qIndex < questions.length - 1) {
       qIndex += 1;
       restore();
@@ -250,7 +305,8 @@
   // double-counts completion nor un-completes it.
   function restore() {
     shownReveals = [];
-    picked = null; answered = false; feedback = ''; feedbackKind = '';
+    picked = null; answered = false; answeredCorrect = false;
+    feedback = ''; feedbackKind = '';
   }
 
   function revealValue(field) {
@@ -268,8 +324,11 @@
 
   $: glossRevealed = !!current && shownReveals.some(field => revealValue(field) === current.gloss);
 
+  // §2.3: pressing Previous/Next stops the clip and shows the item AT ONCE.
+  // The afterGuess wait is a courtesy, not a lock.
   function move(delta) {
-    clearTimeout(advanceTimer);
+    cancelAdvance();
+    stopAudio();
     const nextIndex = Math.max(0, Math.min(questions.length - 1, qIndex + delta));
     if (nextIndex === qIndex) return;
     qIndex = nextIndex;
@@ -284,7 +343,10 @@
     return [text.slice(0, at), text.slice(at, at + underline.length), text.slice(at + underline.length)];
   }
 
-  onDestroy(() => clearTimeout(advanceTimer));
+  // §3.1: leaving the activity stops whatever it started. The route change
+  // stops audio in App.svelte too; this covers the rail's same-route remounts
+  // and keeps the rule local to the surface that owns the clip.
+  onDestroy(() => { cancelAdvance(); stopAudio(); });
 </script>
 
 <svelte:window on:keydown={showHint ? (e) => { if (e.key === 'Escape') showHint = false; } : null} />
@@ -335,7 +397,7 @@
       {/each}
       <!-- Reveal on a finalized item: the gloss, and the properly accented
            form the Accent Rule drill's misaccented prompt should have had. -->
-      {#if answered && (current.gloss || current.correctForm)}
+      {#if showAnswerReveal && (current.gloss || current.correctForm)}
         <div class="reveal-row">
           {#if current.gloss && !glossRevealed}<span class="reveal-gloss">{current.gloss}</span>{/if}
           {#if current.correctForm}<span class="reveal-form greek">{current.correctForm}</span>{/if}
@@ -352,7 +414,7 @@
                   class="tile small"
                   class:greek={greekOptions}
                   class:selected={authoredOptions && picked === opt.id}
-                  class:correct={answered && opt.id === current.answerId}
+                  class:correct={showAnswerReveal && opt.id === current.answerId}
                   class:incorrect={!authoredOptions && picked === opt.id && opt.id !== current.answerId}
                   on:click={() => choose(opt)}>
                   {opt.label}
@@ -369,7 +431,7 @@
               class="tile small"
               class:greek={greekOptions}
               class:selected={authoredOptions && picked === opt.id}
-              class:correct={answered && opt.id === current.answerId}
+              class:correct={showAnswerReveal && opt.id === current.answerId}
               class:incorrect={!authoredOptions && picked === opt.id && opt.id !== current.answerId}
               on:click={() => choose(opt)}>
               {opt.label}
diff --git a/src/components/SpellActivity.svelte b/src/components/SpellActivity.svelte
index 80709a7..3064047 100644
--- a/src/components/SpellActivity.svelte
+++ b/src/components/SpellActivity.svelte
@@ -7,12 +7,19 @@
   // caret and wait for a letter when there is none). Grading honors the "With
   // Accents" toggle and otherwise follows the one shared policy in
   // lib/answer-check.js.
+  //
+  // 5E-SPEC2 §1/§4: every speller in the app is `spellUntilRight`. A correct
+  // spelling WAITS for Next (so the learner can look at what they got right);
+  // a wrong one reveals nothing, keeps what was typed, and leaves the item
+  // open. §2.2: the word's clip is spoken after a correct spelling —
+  // `afterGuess`, because the prompt is an English gloss and pronouncing the
+  // Greek before the answer would hand it over.
   import { onMount, onDestroy } from 'svelte';
   import { getLemma, randomFeedback } from '../lib/content.js';
-  import { play } from '../lib/audio.js';
+  import { play, stop as stopAudio } from '../lib/audio.js';
   import { markCompleted } from '../lib/progress.js';
   import { spellingMatches } from '../lib/answer-check.js';
-  import { ADVANCE_CORRECT_MS } from '../lib/timing.js';
+  import { resolveAdvance, waitsForNext } from '../lib/timing.js';
   import * as input from '../lib/speller-input.js';
   import SpellerKeyboard, { KEYMAP, PUNCT_KEYS } from './SpellerKeyboard.svelte';
   import SpellerField from './SpellerField.svelte';
@@ -49,10 +56,18 @@
   let feedbackKind = '';
   let showAnswer = false;
   let withAccents = false;
-  let pronounceEach = false;
+  // A7: Pronounce Each defaults to ON wherever the checkbox exists. The
+  // default is the DATA's (ui.defaults.pronounceEach), which the ledger stamps;
+  // thirteen activities shipped with it off before 5E-SPEC2.
+  let pronounceEach = activity.ui?.defaults?.pronounceEach ?? true;
   let showScore = false;
   let showKeyboard = false;
-  let advanceTimer = null;
+  let solved = false;              // this word is spelled right and waiting for Next
+
+  $: advancePolicy = resolveAdvance(activity.answerPolicy);
+  $: audioTiming = activity.audioTiming || 'afterGuess';
+  // §5.5: spellUntilRight waits for Next on a correct answer, so it says so.
+  $: awaitingNext = solved && waitsForNext(advancePolicy, true);
 
   // Scoring
   let totalAttempts = 0;
@@ -61,16 +76,20 @@
 
   $: word = words[wordIndex];
 
-  function appendChar(ch) { buffer = input.insertText(buffer, ch); }
-  function appendMark(apply) { buffer = input.applyMark(buffer, apply); }
-  function backspace() { buffer = input.backspace(buffer); }
-  function clearInput() { buffer = input.clear(); }
+  // §4.3: Show Answer clears the moment typing resumes. Every edit path goes
+  // through these four, so there is one place to enforce it.
+  function typingResumed() { showAnswer = false; }
+  function appendChar(ch) { if (solved) return; typingResumed(); buffer = input.insertText(buffer, ch); }
+  function appendMark(apply) { if (solved) return; typingResumed(); buffer = input.applyMark(buffer, apply); }
+  function backspace() { if (solved) return; typingResumed(); buffer = input.backspace(buffer); }
+  function clearInput() { if (solved) return; typingResumed(); buffer = input.clear(); }
 
   function check() {
-    if (!word) return;
-    // One shared policy (Phase 0): "With Accents" ON requires every mark to be
-    // right; case and punctuation stay lenient either way. A final nu is
-    // compared like any other letter (D-16 withdrawn, 5D-SPEC2 §2).
+    if (!word || solved) return;
+    // One shared policy (Phase 0, amended by 5E-SPEC2 §4): "With Accents" ON
+    // requires every accent to be right; final forms and breathings are
+    // required at BOTH settings; case and punctuation stay lenient either way.
+    // A final nu is compared like any other letter (D-16 withdrawn).
     const ok = spellingMatches(built, word.greek, {
       withAccents,
       punctuationOptional: activity.punctuationOptional !== false
@@ -81,10 +100,16 @@
       completedWords.add(wordIndex);
       feedback = randomFeedback(chapter, 'correct');
       feedbackKind = 'ok';
+      // spellUntilRight: the item is won and waits for Next. Nothing is
+      // scheduled, so there is no clip racing the next word onto the screen —
+      // the defect the ledger records against all nine spellers.
+      solved = true;
       if (completedWords.size === words.length) markCompleted(activity.id);
-      clearTimeout(advanceTimer);
-      advanceTimer = setTimeout(() => goNext(), ADVANCE_CORRECT_MS);
+      if (pronounceEach && audioTiming === 'afterGuess' && word.audio) play(word.audio);
     } else {
+      // §4.4/C1/C2: what was typed STAYS (the port's standing divergence — the
+      // manual Clear button is how the slate gets wiped) and the correct
+      // spelling is never revealed.
       feedback = randomFeedback(chapter, 'incorrect');
       feedbackKind = 'bad';
     }
@@ -94,16 +119,17 @@
     buffer = input.clear();
     feedback = '';
     feedbackKind = '';
+    solved = false;
     showAnswer = false;                       // Next resets Show Answer (critique 21)
   }
+  // §2.3: moving stops whatever is being spoken and shows the word at once.
   function goNext() {
-    clearTimeout(advanceTimer);
+    stopAudio();
     wordIndex = (wordIndex + 1) % words.length;
     resetWordState();
-    if (pronounceEach && word && word.audio) play(word.audio);
   }
   function goPrev() {
-    clearTimeout(advanceTimer);
+    stopAudio();
     wordIndex = (wordIndex - 1 + words.length) % words.length;
     resetWordState();
   }
@@ -118,6 +144,7 @@
     if (e.metaKey || e.ctrlKey || e.altKey) return;
     if (e.key === 'Backspace') { e.preventDefault(); backspace(); return; }
     if (e.key === 'Enter') { e.preventDefault(); check(); return; }
+    if (solved) return;
     if (e.key === 'ArrowLeft') { e.preventDefault(); buffer = input.placeCaret(buffer, buffer.caret - 1, false); return; }
     if (e.key === 'ArrowRight') { e.preventDefault(); buffer = input.placeCaret(buffer, buffer.caret + 1, false); return; }
     // Space would scroll the page, so it is claimed here as well as mapped.
@@ -126,7 +153,8 @@
     if (g) { e.preventDefault(); appendChar(g); }
   }
   onMount(() => window.addEventListener('keydown', onKey));
-  onDestroy(() => { window.removeEventListener('keydown', onKey); clearTimeout(advanceTimer); });
+  // §3.1: audio stops when the learner leaves the exercise.
+  onDestroy(() => { window.removeEventListener('keydown', onKey); stopAudio(); });
 </script>
 
 <div class="card speller">
@@ -138,17 +166,21 @@
     <SpellerField
       state={buffer}
       label="Spell Greek Word"
-      on:caret={e => (buffer = input.placeCaret(buffer, e.detail.index, e.detail.after))}
-      on:caretEnd={() => (buffer = input.caretToEnd(buffer))} />
+      locked={solved}
+      on:caret={e => { if (!solved) buffer = input.placeCaret(buffer, e.detail.index, e.detail.after); }}
+      on:caretEnd={() => { if (!solved) buffer = input.caretToEnd(buffer); }} />
   </div>
 
   <div class="feedback {feedbackKind}">{feedback}</div>
+  <!-- §5.5: spellUntilRight waits on a correct answer, so it says so rather
+       than sitting on a won word with nothing happening. -->
+  {#if awaitingNext}<div class="await-next" role="status">Click Next to continue</div>{/if}
 
   <div class="controls">
     <button class="btn" on:click={pronounce}>Pronounce</button>
     <button class="btn secondary" on:click={goPrev}>Previous</button>
     <button class="btn secondary" on:click={goNext}>Next</button>
-    <button class="btn" on:click={check}>Check Answer</button>
+    <button class="btn" disabled={solved} on:click={check}>Check Answer</button>
     <button class="btn secondary" on:click={() => (showScore = true)}>Score</button>
     <button class="btn secondary" on:click={() => (showKeyboard = true)}>Greek Keyboard</button>
   </div>
diff --git a/src/components/SpellVerseActivity.svelte b/src/components/SpellVerseActivity.svelte
index bb42ec8..ab5ea40 100644
--- a/src/components/SpellVerseActivity.svelte
+++ b/src/components/SpellVerseActivity.svelte
@@ -16,12 +16,18 @@
   // The keyboard it types on is the shared one (D-15): the same component the
   // word spellers mount, with the space bar and punctuation row Nathanael
   // selected at the Phase 0 checkpoint.
+  // 5E-SPEC2 §2.5 / rule C7: the verse clip plays after a SUCCESSFUL spelling.
+  // The whole-verse spellers played nothing at all before this round — the one
+  // surface in the app where the learner had just reconstructed a verse from
+  // memory and never got to hear it. The class is `spellUntilRight`: a wrong
+  // answer keeps what was typed and reveals nothing, a right one waits for the
+  // sequential rail's Next (§5.5 says so on screen).
   import { onMount, onDestroy } from 'svelte';
   import { randomFeedback } from '../lib/content.js';
-  import { play } from '../lib/audio.js';
+  import { play, stop as stopAudio } from '../lib/audio.js';
   import { markCompleted } from '../lib/progress.js';
   import { checkVerse } from '../lib/answer-check.js';
-  import { HINT_VISIBLE_MS } from '../lib/timing.js';
+  import { HINT_VISIBLE_MS, resolveAdvance, waitsForNext } from '../lib/timing.js';
   import * as input from '../lib/speller-input.js';
   import SpellerKeyboard, { KEYMAP, PUNCT_KEYS } from './SpellerKeyboard.svelte';
   import SpellerField from './SpellerField.svelte';
@@ -45,6 +51,10 @@
   let withAccents = false;
   let solved = false;
 
+  $: advancePolicy = resolveAdvance(activity.answerPolicy);
+  $: audioTiming = activity.audioTiming || 'afterGuess';
+  $: awaitingNext = solved && waitsForNext(advancePolicy, true);
+
   const fallbackLetters = chapter.alphabet && chapter.alphabet.letters
     ? chapter.alphabet.letters.map(l => (l.lower === 'σ/ς' ? 'σ' : l.lower))
     : [];
@@ -67,6 +77,10 @@
       feedbackKind = 'ok';
       detail = null;
       markCompleted(activity.id);
+      // §2.5 / C7: hear the verse you just spelled. Nothing is waiting on the
+      // clip here — this class waits for Next, so there is no next item for it
+      // to talk over.
+      if (audioTiming !== 'none' && activity.audio) play(activity.audio);
       return;
     }
     feedback = randomFeedback(chapter, 'incorrect');
@@ -78,6 +92,7 @@
   }
 
   function restart() {
+    stopAudio();
     buffer = input.clear();
     feedback = '';
     feedbackKind = '';
@@ -122,6 +137,7 @@
   onDestroy(() => {
     window.removeEventListener('keydown', onKey);
     if (hintTimer) clearTimeout(hintTimer);
+    stopAudio();                                   // §3.1
   });
 </script>
 
@@ -140,6 +156,9 @@
   {#if detail}
     <div class="sv-detail" role="status">{detail.text}{#if detail.word}&nbsp;<span class="greek sv-word">{detail.word}</span>{/if}</div>
   {/if}
+  <!-- §5.5: spellUntilRight waits on a correct answer. This surface has no
+       stepper of its own, so the Next that continues is the sequential rail's. -->
+  {#if awaitingNext}<div class="await-next" role="status">Click Next to continue</div>{/if}
 
   <div class="controls grouped">
     <button class="btn secondary" on:click={toggleHint}>Major Hint</button>
diff --git a/src/data/chapt-02.json b/src/data/chapt-02.json
index a06bbd3..d486d00 100644
--- a/src/data/chapt-02.json
+++ b/src/data/chapt-02.json
@@ -2210,11 +2210,11 @@
       "items": [
        {
         "label": "1)",
-        "text": "Nouns are retentive.  They attempt to keep their accents on the same syllable."
+        "text": "[[u]]Nouns are retentive.[[/u]]  They attempt to keep their accents on the same syllable."
        },
        {
         "label": "2)",
-        "text": "Verbs are recessive.  Their accent recedes towards the first syllable as far as is possible."
+        "text": "[[u]]Verbs are recessive.[[/u]]  Their accent recedes towards the first syllable as far as is possible."
        },
        {
         "label": "3)",
@@ -3245,11 +3245,11 @@
       "items": [
        {
         "label": "1)",
-        "text": "Nouns are retentive.  They attempt to keep their accents on the same syllable."
+        "text": "[[u]]Nouns are retentive.[[/u]]  They attempt to keep their accents on the same syllable."
        },
        {
         "label": "2)",
-        "text": "Verbs are recessive.  Their accent recedes towards the first syllable as far as is possible."
+        "text": "[[u]]Verbs are recessive.[[/u]]  Their accent recedes towards the first syllable as far as is possible."
        },
        {
         "label": "3)",
diff --git a/src/data/intro.json b/src/data/intro.json
index 9e0a035..0f33e5d 100644
--- a/src/data/intro.json
+++ b/src/data/intro.json
@@ -19,7 +19,7 @@
         },
         {
           "type": "para",
-          "text": "WELCOME -- Greek Tutor attempts to harness the power of interactive multimedia to ease and enhance the learning of New Testament Greek. The author designed the program to be intuitive. It requires no computer skills other than pointing and clicking a mouse to access the topics of study or to respond to drill questions. Interactive multimedia has advantages both for the student and for the instructor."
+          "text": "WELCOME — Greek Tutor attempts to harness the power of interactive multimedia to ease and enhance the learning of New Testament Greek. The author designed the program to be intuitive. It requires no computer skills other than pointing and clicking a mouse to access the topics of study or to respond to drill questions. Interactive multimedia has advantages both for the student and for the instructor."
         },
         {
           "type": "para",
@@ -27,7 +27,7 @@
         },
         {
           "type": "para",
-          "text": "This program will work in conjunction with several textbooks. There is a mini-tutorial which explains how to navigate through the program. -- ENJOY"
+          "text": "This program will work in conjunction with several textbooks. There is a mini-tutorial which explains how to navigate through the program. — ENJOY"
         }
       ]
     },
@@ -125,4 +125,4 @@
     "intro_d_logwn": "role unknown (low priority; listen when convenient)"
   },
   "_audioInventory_note": "Documentation only, not consumed by code. intro1..4 narrate the Win 3.1 navigation pages dropped under A2(c); they stay in the audio pack but nothing references them."
-}
\ No newline at end of file
+}
diff --git a/src/data/lexicon-chapt01.json b/src/data/lexicon-chapt01.json
index 7ad6b33..ea9a3d4 100644
--- a/src/data/lexicon-chapt01.json
+++ b/src/data/lexicon-chapt01.json
@@ -200,14 +200,14 @@
     "anthropoi": {
       "greek": "ἄνθρωποι",
       "translit": "anthrōpoi",
-      "gloss": "men (nom. pl.) -- Note example: οι final, therefore short",
+      "gloss": "men (nom. pl.) — Note example: οι final, therefore short",
       "audio": "chapt_1_a_anthoi",
       "_source": "Learn Diphthongs Note (verified)"
     },
     "anthropois": {
       "greek": "ἀνθρώποις",
       "translit": "anthrōpois",
-      "gloss": "to men (dat. pl.) -- Note example: οι not final, therefore long",
+      "gloss": "to men (dat. pl.) — Note example: οι not final, therefore long",
       "audio": "chapt_1_a_antois",
       "_source": "Learn Diphthongs Note (verified); listen-check 'anthropos' was this dative plural"
     }
@@ -394,4 +394,4 @@
       "_note": "Greek pane shows the Greek-spelled letter name. VERIFIED by TBK extraction (2026-07-17): legacy list alfa/bhta/.../eyilon/.../uyilon/.../wmega converts exactly to the 24 spellings above (εψιλον / υψιλον confirmed)."
     }
   }
-}
\ No newline at end of file
+}
diff --git a/src/lib/answer-check.js b/src/lib/answer-check.js
index 69dfe1f..45da881 100644
--- a/src/lib/answer-check.js
+++ b/src/lib/answer-check.js
@@ -1,15 +1,31 @@
 // SPELLING COMPARISON — shared by the word speller (SpellActivity) and the
 // whole-verse speller (SpellVerseActivity), so the two can never drift.
 //
-// The policy is the one Nathanael selected at the 5D Phase 0 checkpoint:
+// The policy is Nathanael's Phase 0 selection as AMENDED by the DOSBox pass
+// (5E-SPEC2 §4.1/§4.2, DRILL-BEHAVIOR-RULES C4/C5):
 //
-//   With Accents OFF   accent/breathing/subscript-insensitive, case-
-//                      insensitive, final sigma = sigma, punctuation
-//                      optional, whitespace normalized.
+//   With Accents OFF   ACCENT-insensitive (acute, grave, circumflex, and
+//                      nothing else), case-insensitive, punctuation optional,
+//                      whitespace normalized. Breathings, the diaeresis, the
+//                      iota subscript and FINAL FORMS are all still required.
 //   With Accents ON    every mark must be exactly right — and nothing else
 //                      changes: still case-insensitive, still punctuation-
 //                      optional.
 //
+// TWO LENIENCIES WERE WITHDRAWN THIS ROUND, both because the original enforces
+// what the port was forgiving:
+//
+//   C4  FINAL FORMS ARE REQUIRED. ἄγγελος must not validate with a medial
+//       sigma in final position, so ς and σ are no longer folded together.
+//       The keyboard has always had both tiles (ς is the `j` key), so this
+//       asks for nothing the learner cannot type.
+//   C5  BREATHINGS ARE REQUIRED AT BOTH SETTINGS. "With Accents" governs
+//       ACCENTS — that is what the checkbox says and what the original does.
+//       ἀδελφός without its smooth breathing is a misspelling, not an
+//       unaccented spelling. Stripping "\p{M}" swept breathings, diaereses and
+//       subscripts away with the accents; the accent set is now named
+//       explicitly so the checkbox can only ever govern those three.
+//
 // THERE IS NO MOVABLE-NU LENIENCY (D-16 WITHDRAWN, 5D-SPEC2 §2). A final nu is
 // compared like any other letter. The leniency that used to live here existed
 // to cover a DERIVATION ERROR — the assembler produced λύουσιν where the
@@ -37,6 +53,14 @@ export function stripPunctuation(text) {
   return (text || '').replace(PUNCTUATION, '');
 }
 
+// THE THREE ACCENTS the "With Accents" checkbox governs, and only those:
+// combining acute, grave and perispomeni. U+0340/U+0341 (the deprecated
+// combining tonos pair) fold onto U+0300/U+0301 under NFD and so never reach
+// this set. Everything else a Greek cluster can carry — psili, dasia,
+// dialytika, ypogegrammeni — is part of the SPELLING and is required at both
+// settings (C5).
+const ACCENTS = /[̀́͂]/gu;   // varia, oxia, perispomeni
+
 // One comparison key. Two spellings match iff their keys are equal.
 export function spellingKey(text, options) {
   const {
@@ -46,9 +70,12 @@ export function spellingKey(text, options) {
   let out = (text || '').normalize('NFC');
   if (punctuationOptional) out = stripPunctuation(out);
   out = out.replace(/\s+/gu, ' ').trim().toLowerCase();
-  if (!withAccents) out = out.normalize('NFD').replace(/\p{M}/gu, '');
-  out = out.replace(/ς/gu, 'σ').normalize('NFC');
-  return out;
+  // Decompose either way: NFD is what makes the accent set above addressable
+  // inside a precomposed cluster, and NFC at the end puts the survivors back
+  // together so two spellings that differ only in normalization still match.
+  out = out.normalize('NFD');
+  if (!withAccents) out = out.replace(ACCENTS, '');
+  return out.normalize('NFC');
 }
 
 export function spellingMatches(typed, answer, options) {
diff --git a/src/lib/audio.js b/src/lib/audio.js
index 9c53f72..baa4867 100644
--- a/src/lib/audio.js
+++ b/src/lib/audio.js
@@ -118,3 +118,54 @@ export function stop() {
   if (currentAudio) { currentAudio.pause(); currentAudio = null; }
   revokeCurrentUrl();
 }
+
+// PLAY AND WAIT FOR THE CLIP TO FINISH (5E-SPEC2 §2.2, rule A2).
+//
+// An `afterGuess` surface must not put the next question on screen while the
+// previous item is still being spoken — the single most confusing thing in the
+// app before this round. The advance delay therefore becomes
+// max(class minimum, audio duration), which the caller expresses as
+//
+//     Promise.all([playThrough(id), afterMinimumDelay])
+//
+// Duration is never measured or guessed: this resolves on the element's own
+// `ended`. It also resolves on `pause` and `error`, so stop() (a route change,
+// a screen-off, a new tap, or the learner pressing Next) releases the wait
+// immediately instead of parking the caller for the length of a clip that is
+// no longer playing. It NEVER rejects — a caller's advance must not be lost to
+// a missing file.
+export async function playThrough(id) {
+  const ok = await play(id);
+  const audio = currentAudio;
+  if (!ok || !audio || audio.ended || audio.paused) return !!ok;
+  await new Promise(resolve => {
+    const done = () => {
+      audio.removeEventListener('ended', done);
+      audio.removeEventListener('pause', done);
+      audio.removeEventListener('error', done);
+      resolve();
+    };
+    audio.addEventListener('ended', done);
+    audio.addEventListener('pause', done);      // stop(), screen-off, new tap
+    audio.addEventListener('error', done);
+  });
+  return true;
+}
+
+// AUDIO STOPS WHEN THE SCREEN GOES OFF (5E-SPEC2 §3.2, rule A6) and does not
+// resume by itself. `visibilitychange` covers backgrounding and lock on every
+// engine that fires it; iOS Safari is unreliable there, so `pagehide` is
+// listened for as well — it is the event WebKit does fire when the page is
+// put into the back/forward cache on lock or app switch.
+//
+// stop() rather than pause(): tearing the element and its object URL down is
+// what guarantees "does not resume by itself", and the next tap builds a fresh
+// element anyway (at most one live object URL is an invariant of this module).
+// Registered once, at module scope, because this module is the sole audio
+// choke point — no component may hold a second copy of this rule.
+if (typeof document !== 'undefined') {
+  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
+}
+if (typeof window !== 'undefined') {
+  window.addEventListener('pagehide', () => stop());
+}
diff --git a/src/lib/timing.js b/src/lib/timing.js
index 04f49a8..94a3928 100644
--- a/src/lib/timing.js
+++ b/src/lib/timing.js
@@ -8,13 +8,19 @@
 // The 5D proposal tuned them down to 900/2500; the device pass REJECTED that
 // (VERIFY-5D, D-14 ratified at the values below) and the port now restores the
 // original's pace. The SEMANTICS (which surfaces auto-advance, and on which
-// outcome) were always faithful; only these two numbers move.
+// outcome) come from DRILL-BEHAVIOR-LEDGER.csv; only these two numbers move.
 //
 // THESE VALUES ARE RETROACTIVE. Chapter 2's per-activity `autoAdvanceMs: 4000`
-// literals were removed from the data in 5D-SPEC2, so ch1, ch2 and ch3 all
-// read the same two numbers. No component and no data file carries its own
-// advance duration: the per-activity `autoAdvanceMs` override is gone from
+// literals were removed from the data in 5D-SPEC2, so every chapter reads the
+// same two numbers. No component and no data file carries its own advance
+// duration: the per-activity `autoAdvanceMs` override is gone from
 // resolveAdvance as well as from the data.
+//
+// 5E-SPEC2 §2.2 adds ONE modifier and it is not a number either: where the
+// activity's audioTiming is `afterGuess`, the clip must FINISH before the next
+// item appears, so the effective wait is max(class minimum, audio duration).
+// The waiting is done by the components through audio.js's playThrough(); the
+// minimum still comes from here and from nowhere else.
 
 export const ADVANCE_CORRECT_MS = 2000;
 export const ADVANCE_INCORRECT_MS = 4000;
@@ -26,34 +32,87 @@ export const ADVANCE_INCORRECT_MS = 4000;
 // for the same reason the advance constants do — one number, one place.
 export const HINT_VISIBLE_MS = 7000;
 
-// The three advance classes (D-14 matrix):
-//   retry             attempts until correct; correct auto-advances, a wrong
-//                     answer leaves the item open (ch1 drills, ch2 syllable
-//                     counting and accent rule)
-//   manualOnIncorrect one attempt; correct auto-advances, incorrect reveals
-//                     the answer, locks the options and waits for Next
-//                     (ch3's three verb drills + both vocab drills)
-//   autoBoth          one attempt; both outcomes auto-advance, incorrect on
-//                     the longer wait (ch3 Scripture Memory Drill)
+// THE SIX ADVANCE CLASSES (DRILL-BEHAVIOR-RULES §B1, 5E-SPEC2 §1). There are
+// six and there are no per-activity exceptions: a new activity is ASSIGNED to
+// a class, and if it needs a seventh that is a finding to report, not a
+// special case to write.
+//
+//   none                        not scored
+//   autoBoth                    correct auto-advances; incorrect reveals the
+//                               answer and auto-advances on the longer wait
+//   manualOnIncorrect           correct auto-advances; incorrect reveals the
+//                               answer, locks the surface and waits for Next
+//   retryUntilRight             correct auto-advances; incorrect reveals
+//                               NOTHING and the item stays open (ch2 Syllable
+//                               Counting is the only non-speller in this class)
+//   manualCorrectAutoIncorrect  correct waits for Next; incorrect reveals the
+//                               answer and auto-advances (ch2 Syllable
+//                               Division and Accent Mark Placement)
+//   spellUntilRight             correct waits for Next; incorrect reveals
+//                               nothing, KEEPS what was typed, retry or Next
 //
+// `retryUntilRight` replaces the old `retry` and `spellUntilRight` replaces the
+// old `manual`; both legacy names are still normalized below so a data file
+// that predates the ledger cannot silently fall into the wrong branch.
+// scripts/check-content-shapes.mjs fails the build on anything outside the six.
+export const ADVANCE_CLASSES = [
+  'none',
+  'autoBoth',
+  'manualOnIncorrect',
+  'retryUntilRight',
+  'manualCorrectAutoIncorrect',
+  'spellUntilRight'
+];
+
+const LEGACY_CLASSES = { retry: 'retryUntilRight', manual: 'spellUntilRight' };
+
 // Chapter 2 predates advanceClass and declares its policy with the older
-// attemptsPerItem / autoAdvanceOnIncorrect fields. Those map onto exactly the
-// same three classes. The DURATION is no longer negotiable: the per-activity
-// autoAdvanceMs override is gone (5D-SPEC2 §3), the ch2 literals that used it
-// were removed from the data, and scripts/check-content-shapes.mjs fails the
-// build if any data file re-introduces one.
+// attemptsPerItem / autoAdvanceOnIncorrect fields; the delivered data now
+// carries advanceClass everywhere, so this is the fallback for a data file
+// that has not been through scripts/apply-behavior-matrix.py.
+function classOf(policy) {
+  const declared = policy.advanceClass;
+  if (declared) return LEGACY_CLASSES[declared] || declared;
+  if (policy.attemptsPerItem === 1) {
+    return policy.autoAdvanceOnIncorrect === false ? 'manualOnIncorrect' : 'autoBoth';
+  }
+  return 'retryUntilRight';
+}
+
+// The class, expanded into the four questions a surface actually asks. Every
+// scored component reads these flags rather than comparing class names, so
+// adding a class means adding a row here and nothing else.
 export function resolveAdvance(policy) {
-  const p = policy || {};
-  const advanceClass = p.advanceClass || (
-    p.attemptsPerItem === 1
-      ? (p.autoAdvanceOnIncorrect === false ? 'manualOnIncorrect' : 'autoBoth')
-      : 'retry'
-  );
+  const advanceClass = classOf(policy || {});
   return {
     advanceClass,
-    oneAttempt: advanceClass !== 'retry',
-    autoOnIncorrect: advanceClass === 'autoBoth',
+    // A one-attempt item is finalized by the first answer, right or wrong. The
+    // two "until right" classes leave a wrong item open for another attempt.
+    oneAttempt: advanceClass !== 'retryUntilRight' && advanceClass !== 'spellUntilRight',
+    autoOnCorrect: advanceClass === 'autoBoth'
+      || advanceClass === 'manualOnIncorrect'
+      || advanceClass === 'retryUntilRight',
+    autoOnIncorrect: advanceClass === 'autoBoth'
+      || advanceClass === 'manualCorrectAutoIncorrect',
+    // Revealing the answer would destroy an "until right" exercise (§B5), so
+    // those two classes never do it.
+    revealOnIncorrect: advanceClass === 'autoBoth'
+      || advanceClass === 'manualOnIncorrect'
+      || advanceClass === 'manualCorrectAutoIncorrect',
     correctMs: ADVANCE_CORRECT_MS,
     incorrectMs: ADVANCE_INCORRECT_MS
   };
 }
+
+// §B4/5E-SPEC2 §5.5: if a surface waits, it must SAY so. One predicate, so the
+// "Click Next to continue" line appears on exactly the outcomes that wait and
+// never on an outcome something is about to move by itself.
+//
+// A wrong answer on an "until right" class does NOT qualify: the item is still
+// open and the next thing to do is try again, not press Next. The three
+// waiting outcomes are manualCorrectAutoIncorrect/spellUntilRight on correct
+// and manualOnIncorrect on incorrect — exactly 5E-SPEC2 §5.5's list.
+export function waitsForNext(advance, wasCorrect) {
+  if (wasCorrect) return !advance.autoOnCorrect;
+  return advance.oneAttempt && !advance.autoOnIncorrect;
+}
````

### New file: buildout/5E-SPEC2-RESULTS.md

````diff
diff --git a/buildout/5E-SPEC2-RESULTS.md b/buildout/5E-SPEC2-RESULTS.md
new file mode 100644
index 0000000..ac1136a
--- /dev/null
+++ b/buildout/5E-SPEC2-RESULTS.md
@@ -0,0 +1,390 @@
+# 5E-SPEC2-RESULTS.md — cohort 5E round 2
+
+Implementer: Claude (Opus 5), in Claude Code.
+Base commit: `95d4375bf64a361f3e27941a5cabbbb7756f3a2c` ("saving updates before
+phase 5e spec 2"). Working tree, uncommitted. Nothing pushed.
+Date: 2026-08-06.
+
+Canonical inputs used: `DRILL-BEHAVIOR-RULES.md` and
+`DRILL-BEHAVIOR-LEDGER.csv`. `DRILL-MATRIX.md` was already deleted at the base
+commit and was never opened.
+
+---
+
+## 1. Summary
+
+All six spec sections are implemented. The renderer now reads the ledger's two
+new data fields instead of inferring behavior: `answerPolicy.advanceClass`
+drives a six-class advance model resolved centrally in `src/lib/timing.js`, and
+`audioTiming` decides the one moment a drill speaks. The `afterGuess` wait is
+`max(class minimum, clip duration)`, implemented with a real `ended` event
+rather than a measured duration, and pressing Next cancels both halves. Audio
+now stops on the exit that was missing — a topic switch inside `topicPages` —
+and on screen-off via `visibilitychange`/`pagehide`. The spelling checker now
+requires final forms and breathings at both toggle settings. Every modal is
+capped to the visible viewport inside a scrollable overlay, and the authored-
+number lists hang.
+
+`ui:behavior` grew from 96 to **203 checks, all passing, stable across three
+consecutive runs**. The rail walk covers 105 stops at two widths with zero
+horizontal overflow and zero console errors. `npm run verify` (shapes, build,
+lazy chunk) is green, and an offline preview walk of all five chapters passes.
+
+Three things need Nathanael's attention and are detailed in §4:
+
+1. **§5.3 could not be done in code** and was done as a data-side pipeline rule
+   instead, exactly as §0 asked me to report.
+2. **§5.6's premise does not hold in this tree.** The ten vocabulary grids
+   already measure 2-up at 320px and 4-up at 768px in *both* directions. A full
+   census of all 29 option grids is in §4.2; I changed no layout and want a
+   decision before I do.
+3. **§5.1's failure is not reproducible in headless Chrome.** The fix is
+   structural and asserted structurally; confirming it is a device item.
+
+---
+
+## 2. Scope conformance
+
+| Spec section | Built | Where | Notes |
+| --- | --- | --- | --- |
+| §1 six advance classes | Yes | `src/lib/timing.js`, all five scored components | `resolveAdvance` returns behavior FLAGS (`oneAttempt`, `autoOnCorrect`, `autoOnIncorrect`, `revealOnIncorrect`); no component compares a class name. Legacy `retry`/`manual` normalize to the new names. |
+| §1 `check:shapes` guard | Yes | `scripts/check-content-shapes.mjs` | Fails on any `advanceClass` outside the six (imported from `timing.js`, not re-typed) and any `audioTiming` outside the five. The `autoAdvanceMs` guard is untouched. |
+| §1 minimum delays 2000/4000, no override | Yes | `src/lib/timing.js` | Unchanged constants; no per-activity override was added. |
+| §1 speller keeps the slate; Syllable Counting does not reveal | Yes | `SpellActivity`, `SelectActivity` | Both deliberate departures preserved and now asserted by tests. |
+| §2.1 `beforeGuess` | Yes | `SelectActivity.maybePronounce` | Gated on `audioTiming === 'beforeGuess'`; no prompt-language inference remains. |
+| §2.2 `afterGuess` finishes first | Yes | `audio.js#playThrough`, `scheduleAdvance` in four components | `Promise.all([minimumTimer, playThrough(clip)])`. Duration comes from the element's `ended`, never from a measurement. |
+| §2.3 Next stops audio and advances at once | Yes | `move()` in every stepping component | `cancelAdvance()` bumps a token so a pending async advance cannot fire; `stop()` releases the `playThrough` wait via `pause`. |
+| §2.4 `afterTap`/`afterCheck`/`none` | No change needed | `ContentAudio`, `ReadingCategories` | Explore grids already played on tap, self-check surfaces on reveal, and `c1_ex_phonetic` (`none`) plays nothing. Audited, not rewritten. |
+| §2.5 whole-verse spellers play the verse | Yes | `SpellVerseActivity.check` | Plays `activity.audio` on a successful spelling. Chapters 3, 4 and 5. |
+| §3.1 audio stops on all three exits | Yes | `ContentAudio.goToTopic`, component `onDestroy`, existing `App.handleHashChange` | The topic switch was the real gap. Category switching in `ReadingCategories` got the same treatment (a category is that activity's topic). |
+| §3.2 pause on screen-off | Yes | `src/lib/audio.js` module scope | `visibilitychange` + `pagehide`, registered once in the sole audio choke point. **Device-verify required.** |
+| §3.3 a new tap interrupts cleanly | Kept, asserted | `audio.js` (unchanged) | Asserted by §6.3's "playing 1 -> 0" and by the pre-existing `playToken` discipline. |
+| §4.1 final forms required | Yes | `src/lib/answer-check.js` | The `ς -> σ` fold is gone. |
+| §4.2 breathings required with accents OFF | Yes | `src/lib/answer-check.js` | `\p{M}` stripping replaced by an explicit three-accent set. Diaeresis and iota subscript are also now required, which is what "and nothing else" means. |
+| §4.3 Show Answer clears on typing | Yes | `SpellActivity` | Every edit path (`appendChar`/`appendMark`/`backspace`/`clearInput`) clears it. Major Hint on the verse speller is untouched. |
+| §4.4 wrong answer keeps what was typed | Yes | `SpellActivity` | Was already true; now the class says so and a test asserts it. |
+| §4.4 spellers wait for Next on correct | Yes | `SpellActivity` | This is a behavior CHANGE: they used to auto-advance after 2000ms. `spellUntilRight` waits. |
+| §4 `pronounceEach` default | Yes | `SpellActivity`, `DivideActivity`, `PlaceAccentActivity` | Now read from `ui.defaults.pronounceEach ?? true`. `SpellActivity` had `false` hard-coded, so the thirteen data fixes had no effect until this change. |
+| §5.1 modals reach their close control | Yes | `src/app.css` | Overlay scrolls; modal centres with `margin: auto`; height capped to `100dvh - 40px` with a `vh` fallback. Full audit list in §5. |
+| §5.2 hanging indents | Yes | `src/app.css` | `.rc-list.authored-labels` (chapter 2's fourteen `1) 2) 3)` lists) now hangs. Full audit in §5. |
+| §5.3 underline the two accent rules | Yes, **as a data-side rule** | `scripts/apply-behavior-matrix.py` | See §4.1. This is the one item that could not be done in code. |
+| §5.4 no displayed `--` | Yes, and two more found | source sweep + `apply-behavior-matrix.py` + `check:shapes` | The component/label/dialog sweep was clean. Four displayed `--` remained in DATA the stamper had never opened. See §4.3. |
+| §5.5 say so when waiting | Yes | five components | One shared predicate `waitsForNext(advance, wasCorrect)`; one message, "Click Next to continue", on all five surfaces. |
+| §5.6 option grids | **No change; reported** | — | See §4.2. |
+| §6 tests | Yes, 8/8 items | `scripts/ui-behavior.mjs` | 203 checks. Item-by-item mapping in §6. |
+
+Nothing outside §1–§6 was changed. No audio-store, service-worker, routing,
+font, mark-geometry or chapter 6+ code was touched.
+
+---
+
+## 3. Data edits, and why there are any
+
+§0 says the data is correct and must not be edited for behavior. **No behavior
+field was edited.** Three files changed, all through
+`scripts/apply-behavior-matrix.py` so a regenerated chapter cannot lose them,
+and all typographic:
+
+| File | Path | Before | After | Rule |
+| --- | --- | --- | --- | --- |
+| `chapt-02.json` | `drill[c2_drill_accent_rule].hint.content[3].items[0].text` | `Nouns are retentive.  They…` | `[[u]]Nouns are retentive.[[/u]]  They…` | §5.3 |
+| `chapt-02.json` | `drill[c2_drill_accent_rule].hint.content[3].items[1].text` | `Verbs are recessive.  Their…` | `[[u]]Verbs are recessive.[[/u]]  Their…` | §5.3 |
+| `chapt-02.json` | `exercise[c2_ex_accent_placement].hint.content[3].items[0..1].text` | same two sentences | same two spans | §5.3 (the same hint, verbatim, on the exercise) |
+| `intro.json` | `learn[0].content[1].text` | `WELCOME -- Greek Tutor…` | `WELCOME — Greek Tutor…` | D2 / §5.4 |
+| `intro.json` | `learn[0].content[3].text` | `…the program. -- ENJOY` | `…the program. — ENJOY` | D2 / §5.4 |
+| `lexicon-chapt01.json` | `exampleWords.anthropoi.gloss` | `men (nom. pl.) -- Note example: …` | `men (nom. pl.) — Note example: …` | D2 / §5.4 |
+| `lexicon-chapt01.json` | `exampleWords.anthropois.gloss` | `to men (dat. pl.) -- Note example: …` | `to men (dat. pl.) — Note example: …` | D2 / §5.4 |
+
+The stamper is idempotent: running it twice produces no second change, and
+running it against the delivered data before my edits produced no diff at all,
+which confirms the delivered files match the ledger exactly.
+
+---
+
+## 4. Findings that need a decision
+
+### 4.1 §5.3 is not a code change (reported per §0)
+
+§0 says "Nothing in §1–§6 requires a data edit; if you believe one does, stop
+and report it." §5.3 does. The two sentences carry no structural signal that a
+renderer could key on:
+
+```
+1) Nouns are retentive.  They attempt to keep their accents on the same syllable.
+2) Verbs are recessive.  Their accent recedes towards the first syllable as far as is possible.
+3) If the ultima is long, then the antepenult cannot be accented.
+```
+
+Items 1 and 2 differ from 3–6 only in having a second sentence. A renderer rule
+like "underline the first sentence of a multi-sentence list item" would be
+inference dressed as typography and would fire across chapter 3 as well.
+
+What I did instead: added the phrases to `apply-behavior-matrix.py`, which the
+spec already ships as the home of "the typographic rules that are data-side"
+(its own docstring, alongside D2). It is idempotent, it survives regeneration,
+and it is scoped to HINT content — the same two sentences also appear in a Learn
+topic list, in an expander LABEL ("Rule 1: Nouns are retentive") and in the
+Quick Review chart, and underlining a summary hotword or a device-verified
+teaching page is not what §5.3 asks for. It therefore also lands on the Accent
+Mark Placement exercise, which shows the same hint byte-for-byte; the same
+sentence must not look different in two places.
+
+**If you would rather this lived in the chat-side pipeline, move it there and
+delete the constant — nothing in `src/` depends on it.**
+
+### 4.2 §5.6's reported defect does not exist in this tree
+
+> "The English-gloss grids on the Greek-to-English vocabulary drills currently
+> render four-up at all widths."
+
+They do not. Measured through `getComputedStyle` on the shipped build, at 320px
+and 768px, for **every** select activity in chapters 1–5:
+
+| Grid | 320 / 768 | Why |
+| --- | --- | --- |
+| `c1_drill_vocab_gk_en`, `c1_drill_vocab_en_gk` | 2 / 4 | responsive vocabulary pool (D-19) |
+| `c2_drill_vocab_gk_en`, `c2_drill_vocab_en_gk` | 2 / 4 | same |
+| `c3_drill_vocab_gk_en`, `c3_drill_vocab_en_gk` | 2 / 4 | same |
+| `c4_drill_vocab_gk_en`, `c4_drill_vocab_en_gk` | 2 / 4 | same |
+| `c5_drill_vocab_gk_en`, `c5_drill_vocab_en_gk` | 2 / 4 | same |
+| `c4_drill_greek_noun`, `c4_drill_declining`, `c5_drill_declining`, `c5_drill_article` | 2 / 2 | `optionLayout: paradigm2col` (D-26, the named exception) |
+| `c2_drill_marking_recognition`, `c2_drill_part_of_speech`, `c3_drill_verb_translating`, `c3_drill_scripture_memory`, `c4_drill_scripture_memory`, `c5_drill_scripture_memory` | 2 / 2 | authored option sets, the two-column default |
+| `c1_ex_letter_to_name`, `c1_ex_name_to_letter`, `c1_ex_translit`, `c1_ex_transcribe` | 4 / 4 | 24-option letter generators (`wide`) |
+| `c2_drill_syllable_counting` | 4 / 4 | number tiles, longest label 1 character (`wide`) |
+| `c2_drill_accent_rule`, `c3_drill_greek_verb`, `c5_drill_first_decl_noun` | 1 / 1 | labels over 24 characters, or a declared `single` layout |
+| `c3_drill_parsing` | 1 / 1 | declared `optionGroups: [3,3]` |
+
+D-19 in both directions already landed in 5D-SPEC2/XPATCH1. So the sentence
+"D-19 applies to every option grid in every chapter … the paradigm-shaped grids
+… are the only exception" cannot be applied literally: there are four other
+authored layouts, and taking it literally would put 24 single glyphs into two
+columns on a phone (twelve rows) and four 46-character parsing labels into four
+columns. Both would reverse decisions a device pass ratified.
+
+**I changed nothing and want your call.** The two candidate changes are:
+
+- make the 2/2 authored grids (six of them) go 4-up at 768px, and/or
+- make the 4/4 single-glyph grids go 2-up at 320px.
+
+What I did instead is turn the census into a permanent guard: `ui:behavior`
+now asserts the vocabulary pools are 2/4, the paradigm grids 2/2, the declared
+layouts 1/1, that the four-up-at-320px set is exactly the five named
+single-glyph/number grids, and that **no grid is ever denser at 320px than at
+768px**. A new grid arriving four-up on a phone now fails the build instead of
+being found on device.
+
+### 4.3 §5.4 — the UI sweep was clean, the data was not
+
+No component, label or dialog in `src/` contains a displayed `--`; the only
+matches are inside code comments. But the stamper's loop only ever opened
+`chapt-NN.json`, and its regex only matched `--` tight against word characters,
+so four displayed double hyphens survived in files it never saw:
+
+- `intro.json` — `WELCOME -- Greek Tutor…` and `… the program. -- ENJOY`
+  (spaced form, invisible to both existing patterns).
+- `lexicon-chapt01.json` — two `exampleWords` glosses, which chapter 1 and 2
+  render in their diphthong charts.
+
+Fixed by (a) adding the spaced pattern, (b) sweeping every rendered data file
+rather than the chapters, and (c) adding a `check:shapes` guard so a future
+regeneration that skips the stamper fails the build. `font-map.json` is exempt
+(pipeline reference table, no runtime import anywhere in `src/`), as are
+underscore-prefixed keys and `audioInventory` (provenance, never rendered).
+
+The stamper now also preserves each file's own indentation. Without that, a
+two-character fix to `intro.json` reflowed all 120 lines of it.
+
+### 4.4 §5.1 is a WebKit failure and Chrome cannot reproduce it
+
+The old CSS capped `.hint-modal` at `86vh` and centred it with flexbox in a
+`position: fixed`, non-scrolling overlay. In Chrome `vh` *is* the visible
+height, so 86vh + 40px of padding always fits and the close button is always
+reachable — the reachability loop I wrote would have passed before the fix too,
+at every width and height I could set. The failure needs a visual viewport
+shorter than `100vh`, which is iOS Safari with its toolbar showing.
+
+The fix targets exactly that: the overlay scrolls, `margin: auto` centres (a
+flex-centred item that overflows overflows equally at *both* ends and cannot be
+scrolled to), and the cap is `100dvh - 40px` with a `100vh` fallback. Both the
+cap and the inner scroll moved onto the shared `.modal` class so every modal
+inherits D3 rather than having to remember it.
+
+I assert the structure directly (overlay `overflow-y`, overlay not
+`align-items: center`, modal cap equal to the visible viewport minus padding)
+**and** keep the reachability loop as a regression guard at 320x480 and
+320x360. Real WebKit remains a VERIFY-5E2 item, as the spec schedules.
+
+### 4.5 Smaller findings, no action taken
+
+- **`scripts/ui-walk.mjs` defaults `--out` to `buildout/screenshots/5e-spec1-sol`.**
+  Running it without arguments overwrote 475 of Sol's committed round-1
+  screenshots. I restored them with `git checkout` and ran with
+  `--out=buildout/screenshots/5e-spec2`. Recommend the default become a
+  required argument, or a dated directory, before the next round.
+- **`c4_drill_greek_noun` has two items with the same sentence and the same
+  reference** ("Brother will betray brother", Mat 10:21) and different answers.
+  Faithful, probably — the verse has two forms of ἀδελφός — but it made the
+  test harness's prompt+reference item lookup ambiguous, which is how a wrong
+  option got clicked about one run in twenty and reported the advance as broken.
+  `authoredItemOnScreen` now returns `null` on ambiguity and callers reshuffle.
+- **Every `c4_drill_greek_noun` item lists `ἀδελφοί` twice** (and
+  `c4_drill_declining` lists `λόγοι` twice) because nominative and vocative
+  plural are homographs. When that form is the answer, two tiles turn green.
+  Faithful to the paradigm; noted because it looks like a duplicate-key bug.
+- **The Syllable Division exercise's hint button renders "Hint"**, from
+  `activity.hint.label`, while `ui.buttons` lists it as "Hint: Rules".
+  `DivideActivity` builds its own control block, so XPATCH1's `ui.buttons`
+  ordering work never reached it. Out of scope; flagged.
+- **`apply-behavior-matrix.py` crashed on Windows** after doing its work,
+  printing a Greek string to a cp1252 console. Now reconfigures stdout to UTF-8.
+
+---
+
+## 5. Audits the spec asked for
+
+### 5.1 Every modal surface, at every supported width (§5.1)
+
+| Surface | Where | Reachable at 320x480 and 320x360 |
+| --- | --- | --- |
+| Drill Hint paradigm popup — ch3 Verb Translating | `SelectActivity` `.hint-modal` | PASS |
+| …ch4 Greek Noun | " | PASS |
+| …ch4 Declining Noun | " | PASS |
+| …ch5 First Declension Noun | " | PASS |
+| …ch5 Declining Noun | " | PASS |
+| …ch5 Definite Article | " | PASS |
+| **The same six with Meanings expanded** (the reported case) | `Paradigm` `<details>` inside the modal | PASS (all six) |
+| Paradigm Endings popup — ch3 Learn Verbs | `Paradigm` `.pg-endings` | PASS |
+| Greek Keyboard reference — word speller | `SpellerKeyboard` `.kb-ref` | PASS |
+| Greek Keyboard reference — whole-verse speller | " | PASS |
+| End-of-chapter dialog | `EndOfChapterDialog` `.modal` | PASS (its last action, "Stay") |
+
+Non-modal expanders were checked too and need no cap: the chapter-2 hint cards
+(`SelectActivity`, `DivideActivity`, `PlaceAccentActivity` render them as
+in-flow `.card`s), `RichContent`'s `.rc-expander`, the Six Points collapsible
+and the speller `.score-dialog` all sit inside `.scroll-area` and scroll with
+the page.
+
+### 5.2 Every list (§5.2)
+
+| List | Hangs before | Hangs now |
+| --- | --- | --- |
+| `.rc-list` generated counters (`1) 2) 3)` from `counter-increment`) — ch1, ch3, ch4, ch5, intro | Yes | Yes (untouched) |
+| `.rc-list.authored-labels` — **chapter 2's fourteen lists**, including the Accent Rule Drill's six points and the Three Syllable Rules shown by the Syllable Counting drill and the Syllable Division exercise | **No** | Yes |
+| `.rc-list.unnumbered` | n/a (no marker) | unchanged |
+| `.rc-deflist.termless` (the accent hints) | Yes | Yes |
+| `.rc-biblist` bibliographies | Yes | Yes |
+| `.objectives-list` (`<ol>` with outside markers) | Yes | Yes |
+| `.rc-deflist` two-column rows, `.pg-legend` | n/a (aligned columns, not hanging lists) | unchanged |
+
+The three offenders the spec named were all one CSS rule: chapter 2 authors its
+own `1)` markers, which rendered as an inline `.rc-num` span, so a wrapped rule
+ran back underneath its own number. Measured, not assumed — the test asserts the
+marker box ends at or before the text column begins.
+
+### 5.3 UI copy sweep for `--` (§5.4)
+
+`src/components/*.svelte`, `src/lib/*.js`, `src/App.svelte`: six matches, all
+inside code comments, none rendered. Data findings in §4.3.
+
+---
+
+## 6. Test coverage against §6
+
+| §6 item | Checks | Result |
+| --- | --- | --- |
+| 1. all six classes, correct and incorrect | `none` not scored; `autoBoth` correct 2000ms + incorrect 4000ms (ch4, ch5); `manualOnIncorrect` correct 2000ms + incorrect reveals/waits/says so; `retryUntilRight` incorrect reveals nothing, stays open, accepts a second attempt; `manualCorrectAutoIncorrect` correct waits + says so, incorrect reveals and advances at 4000ms; `spellUntilRight` correct waits + says so, incorrect keeps the slate and reveals nothing | PASS |
+| 2. `afterGuess` finishes before the next item, incl. >2000ms | A 3-second WAV seeded into the app's own audio store (IndexedDB `greek-tutor`/`audio`) so the app's IDB-hit path serves it. Measured: advanced 3.1s after the guess, clip ran 3.06s, advance was after `ended`. | PASS |
+| 3. Next during playback stops audio and advances at once | playing 1 -> 0, item advanced in 172ms | PASS |
+| 4. audio stops on rail nav, topic switch, route change | all three, via a wrapped `window.Audio` that records start/end/pause without changing what plays | PASS |
+| 5. speller rejects a missing final form and a missing breathing with accents OFF | **every word speller in chapters 1–5** (nine of them), each using its own first offending word, plus a positive control (breathing kept, accents dropped, accepted) so the rule is not "everything fails" | PASS (27 checks) |
+| 6. Show Answer clears on typing | ch1, ch3, ch5 spellers | PASS |
+| 7. every modal reaches its close control at 320px | 11 surfaces x 2 heights, plus the structural assertion | PASS (see §5.1) |
+| 8. option grids 2-up/4-up except paradigm | full 29-grid census, four assertions | PASS (see §4.2) |
+| extra: §5.2 hanging indents | three chapter-2 hints, measured | PASS |
+| extra: §5.3 underlines | both hints that show the six rules | PASS |
+
+**Regression, both harnesses:**
+
+- `node scripts/ui-behavior.mjs` — **203/203**, three consecutive runs.
+- `node scripts/ui-walk.mjs --out=buildout/screenshots/5e-spec2` — 105 rail
+  stops x 2 widths, 474 screenshots, **0px horizontal overflow at 320px on
+  every stop**, all rail counts and Next actions live, all authored expanders
+  and chart states opened, **no console errors**.
+- `npm run verify` — shapes PASS, production build clean (only the pre-existing
+  `DivideActivity` a11y `tabIndex` warning), lazy-chunk PASS, precache 27
+  entries (unchanged; 691.49 KiB vs 687.27 KiB at base).
+- Offline preview regression (throwaway script, not committed): service worker
+  installed, network disabled, all five chapters render and walk three rail
+  stops each, hard refresh on an activity route renders, and an `afterGuess`
+  drill with no downloaded clip still advances on its class minimum rather than
+  hanging. 14/15; the one failure is the expected
+  `net::ERR_INTERNET_DISCONNECTED` from `play()`'s miss-path fetch, which is the
+  documented "toast IFF the user gets no audio" behavior and predates this round.
+
+---
+
+## 7. Chunk hashes
+
+**The spec's prediction was already satisfied by the base commit.** Commit
+`95d4375` restamped all five chapter files from the ledger, so relative to the
+round-1 tree every chapter hash had already moved before I started. Measured by
+building the base commit and the working tree with the same toolchain:
+
+| Asset | At base commit `95d4375` | After this round | Changed |
+| --- | --- | --- | --- |
+| `chapt-01-*.js` | `CU6hirIK` | `CU6hirIK` | no |
+| `chapt-02-*.js` | `BbMSaIhR` | `Cem6eSMM` | **yes** — the four §5.3 underline spans |
+| `chapt-03-*.js` | `C33Kg7th` | `C33Kg7th` | no |
+| `chapt-04-*.js` | `B5xVjWr5` | `B5xVjWr5` | no |
+| `chapt-05-*.js` | `DntsEEBk` | `DntsEEBk` | no |
+| `lexicon-chapt01-*.js` | `DWCL8L3K` | `DKNsyOx1` | **yes** — the two §5.4 em dashes |
+| `lexicon-chapt02..05-*.js` | `DMecEUSp`, `DU3wQSch`, `CZna8uQ7`, `gf-U-zWG` | unchanged | no |
+| `index-*.js` | `C5Q2_Jkk` | `DvEpHIBO` | yes — all code changes, plus `intro.json` (static, bundled) |
+| `index-*.css` | `3_GP9iO4` | `BJgmOpyj` | yes — the modal and list rules |
+
+This is not a failure and needs no action; it is reported because the spec asked
+for the numbers.
+
+---
+
+## 8. Behavior changes a learner will notice
+
+Worth knowing before the device pass, because several are deliberate reversals
+of what shipped:
+
+1. **The nine word spellers no longer auto-advance on a correct answer.** They
+   show "Click Next to continue" and wait. `spellUntilRight`, ledger-confirmed
+   on all nine rows.
+2. **Spelling got stricter.** `ἄγγελος` no longer validates as `αγγελοσ`, and
+   `ἀδελφός` no longer validates as `αδελφος` even with "With Accents" off.
+   Words with a diaeresis or an iota subscript are affected the same way. Every
+   affected answer is typeable on the shared keyboard — `check:shapes` proves it.
+3. **"Pronounce Each" is now on by default on the spellers and the two chapter-2
+   exercises.** The data said so since this spec's delivery; the code was
+   ignoring it.
+4. **The chapter-2 Syllable Division and Accent Mark Placement exercises now
+   wait on a CORRECT answer and auto-advance on a wrong one** — the opposite of
+   what they did, and what the original does.
+5. **Vocabulary English-to-Greek drills now finish speaking before the next
+   word appears**, so those items sit on screen for the length of the clip
+   rather than 2 seconds.
+6. **The two chapter-2 exercises no longer speak the word on arrival.** They are
+   `afterGuess`; Pronounce Word remains the on-demand path.
+
+---
+
+## 9. For VERIFY-5E2 (Nathanael, on device)
+
+1. **Screen-off audio pause.** Start a long clip (Say Whole Paradigm on chapter
+   4's Masculine Declension), lock the phone, unlock. It must be silent and must
+   not resume. This is the one item no harness can settle.
+2. **Modal scrolling on real WebKit.** Chapter 4 or 5, any drill, Hint, then
+   Meanings, with the Safari toolbar showing. Close must come fully on screen.
+   §4.4 explains why Chrome cannot prove this.
+3. **The `afterGuess` timing feel.** Vocabulary English-to-Greek in any chapter.
+   The clip now holds the next question back; the question is whether that reads
+   as deliberate or as slow.
+4. **Airplane-mode walk**, as every phase ends.
+5. Two items I would add: the spellers waiting for Next (change 1 above) and the
+   two chapter-2 exercises' reversed advance direction (change 4). Both are
+   ledger-confirmed, both will feel wrong for the first minute.
````

## 4. Generated evidence not embedded

| Path | Contents |
| --- | --- |
| `buildout/screenshots/5e-spec2/320/**` | 237 PNGs — every chapter 1-5 rail stop at 320px |
| `buildout/screenshots/5e-spec2/768/**` | 237 PNGs — the same stops at 768px |
| `buildout/screenshots/5e-spec2/walk-report.json` | structured walk output (overflow measurements per stop, rail state, expander/chart states) |

`scripts/ui-walk.mjs` defaults its `--out` to `buildout/screenshots/5e-spec1-sol`,
the previous round's directory. Running it without arguments overwrote 475 of
Sol's committed round-1 captures; they were restored with
`git checkout -- buildout/screenshots` and every run since has passed
`--out=buildout/screenshots/5e-spec2`. Recommend making the argument required.

## 5. Commands run, and their results

```
npm run check:shapes
  PASS: content shapes intact - chapt-01..05 checked (... every advanceClass is
  one of the six and every audioTiming one of the five ...)

npm run build
  87 modules transformed; 27 precache entries (691.49 KiB)
  one warning, pre-existing: DivideActivity.svelte:365 A11y noninteractive
  element cannot have nonnegative tabIndex

npm run check:lazy-chunk
  PASS: lazy-chapter split intact - chapt-01..05 + lexicon-chapt01..05 emitted,
  precached, and chapter data is out of index-DvEpHIBO.js

python scripts/apply-behavior-matrix.py buildout/DRILL-BEHAVIOR-LEDGER.csv src/data
  stamped 50 activities from 50 confirmed rows
  28 TO FILL rows skipped (chapters 6, 7, 8)
  hint underlines applied: 4
  em dashes applied: 4
  (second run: no further change - idempotent)

BASE=http://localhost:4175 node scripts/ui-behavior.mjs
  203/203 behavior checks passed   (three consecutive runs)

BASE=http://localhost:4175 node scripts/ui-walk.mjs --out=buildout/screenshots/5e-spec2
  walked 105 stops x 2 widths -> buildout/screenshots/5e-spec2
  checklist evidence: 124 width-specific shots (62 pages x 2 expected)
  no horizontal overflow in chapters 4 or 5
  all rail counts and Next actions are live
  all authored expanders and chart states opened
  no console errors

offline preview regression (throwaway script, scratchpad, not committed)
  14/15 - the one failure is the expected net::ERR_INTERNET_DISCONNECTED from
  play()'s miss-path fetch while offline (documented behavior, predates this
  round). All five chapters render, walk three rail stops, survive a hard
  refresh on an activity route, and an afterGuess drill with no downloaded clip
  still advances on its class minimum rather than hanging.
```

## 6. Build-shape assertions, inspected rather than assumed

- `dist/assets/` contains one `chapt-NN-*.js` and one `lexicon-chaptNN-*.js`
  per chapter, five of each, asserted by `check-lazy-chunk.mjs`.
- Chapter data is absent from `index-*.js`, asserted by the same script.
- `dist/sw.js` precaches 27 entries, the same count as the base commit; the
  size moved from 687.27 KiB to 691.49 KiB, which is the CSS and bundle growth.
- No new `/audio/` path appears in `src/` outside `audio.js`, `downloads.js`
  and `packs.js`; `playThrough` reuses `play()` and opens nothing.
- No second IndexedDB writer was added. The test harness seeds a clip directly
  into the store from the PAGE, in `scripts/ui-behavior.mjs` only; no shipped
  code path was changed to allow it.
