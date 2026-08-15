# 5E-SPEC1-BUILD-SOL.md

## 0. THE DIFF — non-negotiable

Section 2 embeds the complete tracked diff from the named base, followed by
literal `git diff --no-index` new-file diffs for RESULTS and the visual
checklist. The audit container cannot contain its own diff without infinite
self-reference. The generated screenshot corpus is explicitly excluded in
§1 and inventoried in §6.

## 1. Run metadata

| | |
| --- | --- |
| Implementer | SOL |
| Model and tooling | Codex GPT-5.6 Sol; PowerShell, Node.js, Vite, Svelte, Playwright/Chrome; three parallel bounded audits |
| Base commit (starting state of your repo copy) | `6fde770c20f0ac627d123329199ead2f73eb2db9` |
| Head commit, or `working tree` if uncommitted | `working tree` (uncommitted) |
| Start / end (wall clock) | 2026-08-03 20:30:52–22:15 EDT |
| Total wall-clock time | Approximately 1 hour 44 minutes |
| Approximate cost | Not exposed by the runtime |
| Diff exclusions, if any | `buildout/5E-SPEC1-BUILD-SOL.md` (self-referential audit container); `buildout/screenshots/5e-spec1-sol/**/*.png` (474 binary captures); `buildout/screenshots/5e-spec1-sol/walk-report.json` (generated 1.28 MiB structured evidence). No source file, test file, data file, RESULTS file, or visual checklist is excluded. |

The initial status was clean. No commit was created, and nothing was pushed.

## 2. Complete git diff

The first fifteen file diffs below are the literal output of
`git diff --no-color --no-ext-diff 6fde770c20f0ac627d123329199ead2f73eb2db9`.
The final two new-file hunks are the literal `git diff --no-index` output for
the otherwise-untracked required text deliverables.

````diff
diff --git a/scripts/check-content-shapes.mjs b/scripts/check-content-shapes.mjs
index 769e5e4..e294428 100644
--- a/scripts/check-content-shapes.mjs
+++ b/scripts/check-content-shapes.mjs
@@ -43,6 +43,166 @@ function walk(node, path, visit) {
   for (const [key, value] of Object.entries(node)) walk(value, `${path}.${key}`, visit);
 }
 
+// Paradigms may be a single chart (chapter 3 and the simple chapter 4/5
+// charts) or a wrapper carrying charts[] (chapter 4/5 switches). Validate the
+// same table contract in both forms, including the Meanings table nested under
+// a noun chart. Keeping this normalization here prevents a charts[] wrapper
+// from being mistaken for a columnless chart while still checking every
+// concrete chart it contains.
+function validateParadigmTable(table, path, { allowExtras = true } = {}) {
+  if (!table || typeof table !== 'object' || Array.isArray(table)) {
+    problems.push(`${path}: paradigm table is not an object.`);
+    return;
+  }
+
+  const columns = Array.isArray(table.columns) ? table.columns : [];
+  if (!columns.length) problems.push(`${path}: paradigm has no columns.`);
+
+  const rows = Array.isArray(table.rows) ? table.rows : [];
+  if (!rows.length) problems.push(`${path}: paradigm has no rows.`);
+  rows.forEach((row, index) => {
+    if (!row || typeof row !== 'object' || Array.isArray(row)) {
+      problems.push(`${path}.rows[${index}]: paradigm row is not an object.`);
+      return;
+    }
+    if (!String(row.label ?? row.person ?? '').trim()) {
+      problems.push(`${path}.rows[${index}]: paradigm row has no label or person.`);
+    }
+    if (!Array.isArray(row.cells) || row.cells.length !== columns.length) {
+      problems.push(`${path}.rows[${index}]: paradigm row has ${(row.cells || []).length} cells, expected ${columns.length}.`);
+    }
+  });
+
+  if (table.columnAudio != null) {
+    if (!Array.isArray(table.columnAudio) || table.columnAudio.length !== columns.length) {
+      problems.push(`${path}.columnAudio: expected ${columns.length} entries, got ${Array.isArray(table.columnAudio) ? table.columnAudio.length : 'a non-array'}.`);
+    } else {
+      table.columnAudio.forEach((audio, index) => {
+        if (typeof audio !== 'string' || !audio.trim()) {
+          problems.push(`${path}.columnAudio[${index}]: expected a non-empty audio id.`);
+        }
+      });
+    }
+  }
+
+  if (table.columnGroups != null) {
+    if (!Array.isArray(table.columnGroups) || !table.columnGroups.length) {
+      problems.push(`${path}.columnGroups: expected a non-empty array.`);
+    } else {
+      let spanTotal = 0;
+      table.columnGroups.forEach((group, index) => {
+        if (!group || typeof group !== 'object' || Array.isArray(group)) {
+          problems.push(`${path}.columnGroups[${index}]: expected an object.`);
+          return;
+        }
+        if (typeof group.label !== 'string' || !group.label.trim()) {
+          problems.push(`${path}.columnGroups[${index}].label: expected a non-empty string.`);
+        }
+        if (!Number.isInteger(group.span) || group.span < 1) {
+          problems.push(`${path}.columnGroups[${index}].span: expected a positive integer.`);
+        } else {
+          spanTotal += group.span;
+        }
+      });
+      if (spanTotal !== columns.length) {
+        problems.push(`${path}.columnGroups: spans total ${spanTotal}, expected ${columns.length} columns.`);
+      }
+    }
+  }
+
+  if (table.sayWholeEach != null) {
+    if (!Array.isArray(table.sayWholeEach) || !table.sayWholeEach.length) {
+      problems.push(`${path}.sayWholeEach: expected a non-empty array.`);
+    } else {
+      table.sayWholeEach.forEach((action, index) => {
+        if (!action || typeof action !== 'object' || Array.isArray(action)
+            || typeof action.audio !== 'string' || !action.audio.trim()) {
+          problems.push(`${path}.sayWholeEach[${index}]: expected an action with a non-empty audio id.`);
+        }
+      });
+      if (!Array.isArray(table.columnGroups)) {
+        problems.push(`${path}.sayWholeEach: columnGroups are required to align the actions.`);
+      } else if (table.sayWholeEach.length !== table.columnGroups.length) {
+        problems.push(`${path}.sayWholeEach: has ${table.sayWholeEach.length} actions, expected ${table.columnGroups.length} to match columnGroups.`);
+      }
+    }
+  }
+
+  if (table.note != null && (typeof table.note !== 'string' || !table.note.trim())) {
+    problems.push(`${path}.note: expected a non-empty string.`);
+  }
+
+  if (allowExtras && table.endings) {
+    (table.endings.rows || []).forEach((row, index) => {
+      if (!Array.isArray(row) || row.length !== columns.length * 2) {
+        problems.push(`${path}.endings.rows[${index}]: expected ${columns.length * 2} entries (ending + gloss per column).`);
+      }
+    });
+  }
+}
+
+function validateMeanings(meanings, path) {
+  validateParadigmTable(meanings, path, { allowExtras: false });
+  if (!meanings || typeof meanings !== 'object' || Array.isArray(meanings)) return;
+  if (meanings.legend != null) {
+    if (!Array.isArray(meanings.legend) || !meanings.legend.length) {
+      problems.push(`${path}.legend: expected a non-empty array.`);
+    } else {
+      meanings.legend.forEach((entry, index) => {
+        if (!entry || typeof entry !== 'object' || Array.isArray(entry)
+            || typeof entry.label !== 'string' || !entry.label.trim()
+            || typeof entry.text !== 'string' || !entry.text.trim()) {
+          problems.push(`${path}.legend[${index}]: expected non-empty label and text strings.`);
+        }
+      });
+    }
+  }
+  if (meanings.closing != null && (typeof meanings.closing !== 'string' || !meanings.closing.trim())) {
+    problems.push(`${path}.closing: expected a non-empty string.`);
+  }
+}
+
+function validateParadigm(paradigm, path) {
+  if (!paradigm || typeof paradigm !== 'object' || Array.isArray(paradigm)) {
+    problems.push(`${path}: paradigm is not an object.`);
+    return;
+  }
+
+  if (paradigm.charts != null) {
+    if (!Array.isArray(paradigm.charts) || paradigm.charts.length < 2) {
+      problems.push(`${path}.charts: expected at least two charts.`);
+      return;
+    }
+    if (!['moreBack', 'named'].includes(paradigm.switch)) {
+      problems.push(`${path}.switch: expected "moreBack" or "named" for charts[].`);
+    }
+    const names = new Set();
+    paradigm.charts.forEach((chart, index) => {
+      const chartPath = `${path}.charts[${index}]`;
+      if (!chart || typeof chart !== 'object' || Array.isArray(chart)) {
+        problems.push(`${chartPath}: expected a chart object.`);
+        return;
+      }
+      if (typeof chart.name !== 'string' || !chart.name.trim()) {
+        problems.push(`${chartPath}.name: expected a non-empty chart name.`);
+      } else if (names.has(chart.name)) {
+        problems.push(`${chartPath}.name: duplicate chart name "${chart.name}".`);
+      } else {
+        names.add(chart.name);
+      }
+      validateParadigmTable(chart, chartPath);
+      if (chart.meanings != null) validateMeanings(chart.meanings, `${chartPath}.meanings`);
+    });
+    return;
+  }
+
+  if (paradigm.switch != null) {
+    problems.push(`${path}.switch: only valid with charts[].`);
+  }
+  validateParadigmTable(paradigm, path);
+  if (paradigm.meanings != null) validateMeanings(paradigm.meanings, `${path}.meanings`);
+}
+
 const files = readdirSync(DATA).filter(name => /^chapt-\d+\.json$/.test(name));
 if (!files.length) {
   console.error('FAIL: no chapter data files found under src/data.');
@@ -92,23 +252,11 @@ for (const file of files) {
       problems.push(`${path}: contentAudio mode "${block.mode}" has no ContentAudio branch.`);
     }
     // A paradigm chart's rows must line up with its declared columns, or cells
-    // land under the wrong number heading.
+    // land under the wrong number heading. Chapter 4/5 may wrap multiple full
+    // charts in charts[]; validate each chart and each nested Meanings table.
     if (block.type === 'paradigm' || (block.paradigm && block.mode === 'paradigmChart')) {
       const chart = block.type === 'paradigm' ? block : block.paradigm;
-      const columns = (chart.columns || []).length;
-      if (!columns) problems.push(`${path}: paradigm has no columns.`);
-      (chart.rows || []).forEach((row, index) => {
-        if (!Array.isArray(row.cells) || row.cells.length !== columns) {
-          problems.push(`${path}.rows[${index}]: paradigm row has ${(row.cells || []).length} cells, expected ${columns}.`);
-        }
-      });
-      if (chart.endings) {
-        (chart.endings.rows || []).forEach((row, index) => {
-          if (!Array.isArray(row) || row.length !== columns * 2) {
-            problems.push(`${path}.endings.rows[${index}]: expected ${columns * 2} entries (ending + gloss per column).`);
-          }
-        });
-      }
+      validateParadigm(chart, block.type === 'paradigm' ? path : `${path}.paradigm`);
     }
     // spellVerse grades word by word, so the answer must actually be words.
     if (block.type === 'spellVerse') {
diff --git a/scripts/check-lazy-chunk.mjs b/scripts/check-lazy-chunk.mjs
index e3e2da6..be3c318 100644
--- a/scripts/check-lazy-chunk.mjs
+++ b/scripts/check-lazy-chunk.mjs
@@ -21,7 +21,9 @@ const fail = msg => { console.error(`FAIL: ${msg}`); process.exit(1); };
 const expected = [
   { chapterPattern: /^chapt-01-.*\.js$/, lexiconPattern: /^lexicon-chapt01-.*\.js$/, needle: 'You will be able to:' },
   { chapterPattern: /^chapt-02-.*\.js$/, lexiconPattern: /^lexicon-chapt02-.*\.js$/, needle: 'Greek divides words into syllables in almost the same way as English.' },
-  { chapterPattern: /^chapt-03-.*\.js$/, lexiconPattern: /^lexicon-chapt03-.*\.js$/, needle: 'Verbs are words of action or state of being.' }
+  { chapterPattern: /^chapt-03-.*\.js$/, lexiconPattern: /^lexicon-chapt03-.*\.js$/, needle: 'Verbs are words of action or state of being.' },
+  { chapterPattern: /^chapt-04-.*\.js$/, lexiconPattern: /^lexicon-chapt04-.*\.js$/, needle: 'A noun is commonly defined as a word that stands for a person, place or thing.' },
+  { chapterPattern: /^chapt-05-.*\.js$/, lexiconPattern: /^lexicon-chapt05-.*\.js$/, needle: 'This page is largely a repetition of what was done in chapter 4 except for the section on the definite article.' }
 ];
 
 // 2. Chapter DATA must be ABSENT from the main bundle and PRESENT in its chunk.
diff --git a/scripts/ui-behavior.mjs b/scripts/ui-behavior.mjs
index 928001e..eef48fd 100644
--- a/scripts/ui-behavior.mjs
+++ b/scripts/ui-behavior.mjs
@@ -23,10 +23,28 @@ const check = (name, ok, detail = '') => {
 };
 
 const ch3 = JSON.parse(readFileSync('src/data/chapt-03.json', 'utf8'));
+const ch4 = JSON.parse(readFileSync('src/data/chapt-04.json', 'utf8'));
+const ch5 = JSON.parse(readFileSync('src/data/chapt-05.json', 'utf8'));
 const verse = (ch3.exercise.find(a => a.type === 'spellVerse').answerWords || []).join(' ');
 const strip = s => s.normalize('NFD').replace(/\p{M}/gu, '').normalize('NFC');
+const normalizeText = value => String(value ?? '').replace(/\s+/g, ' ').trim().normalize('NFC');
 
-const browser = await chromium.launch();
+// playwright-core does not install a browser. Prefer its configured binary,
+// then use an installed stable browser without hard-coding a machine path.
+async function launchBrowser() {
+  const explicit = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
+  if (explicit) return chromium.launch({ executablePath: explicit });
+  try {
+    return await chromium.launch();
+  } catch (original) {
+    for (const channel of ['chrome', 'msedge']) {
+      try { return await chromium.launch({ channel }); } catch { /* keep looking */ }
+    }
+    throw original;
+  }
+}
+
+const browser = await launchBrowser();
 const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
 const page = await context.newPage();
 
@@ -196,7 +214,9 @@ for (const [label, input, accents, expect] of cases) {
 for (const [label, hash] of [
   ['ch2 Accent Rule', '#/activity/chapt_2/c2_drill_accent_rule'],
   ['ch3 Verb Translating', '#/activity/chapt_3/c3_drill_verb_translating'],
-  ['ch3 Vocabulary: Greek to English', '#/activity/chapt_3/c3_drill_vocab_gk_en']
+  ['ch3 Vocabulary: Greek to English', '#/activity/chapt_3/c3_drill_vocab_gk_en'],
+  ['ch4 Greek Noun', '#/activity/chapt_4/c4_drill_greek_noun'],
+  ['ch5 First Declension Noun', '#/activity/chapt_5/c5_drill_first_decl_noun']
 ]) {
   await go(hash);
   await page.locator('.grid.options .tile, .option-group .tile').first().click();
@@ -237,6 +257,134 @@ for (const [label, hash] of [
   check('§3 revisit resets the item — ch1 Vocabulary Spelling', (await typed()) === '', JSON.stringify(await typed()));
 }
 
+// ---------------------------------------------------------------- 5E §4.2 chart switches
+const activitiesOf = chapter => Object.values(chapter).filter(Array.isArray).flat();
+const activityById = (chapter, id) => activitiesOf(chapter).find(activity => activity && activity.id === id);
+const textHas = (text, value) => text.normalize('NFC').includes(value.normalize('NFC'));
+const gotoTopic = async index => {
+  for (let i = 0; i < index; i++) {
+    await page.getByRole('button', { name: 'Next Topic', exact: true }).click();
+    await page.waitForTimeout(50);
+  }
+};
+
+// Authored select questions are shuffled, so UI assertions identify the
+// visible item by its rendered prompt and citation before consulting fields
+// such as answer, translate, or gender.
+async function authoredItemOnScreen(activity) {
+  const visiblePrompt = normalizeText(await page.locator('.card .prompt').first().innerText());
+  const citation = page.locator('.card .prompt-citation');
+  const visibleCitation = await citation.count() ? normalizeText(await citation.innerText()) : '';
+  const promptField = activity.promptFrom && activity.promptFrom.show;
+  const promptFor = item => normalizeText(promptField === 'sentence'
+    ? item.sentence
+    : (activity.promptIsGreek || promptField === 'greek')
+      ? item.greek
+      : (item.prompt != null ? item.prompt : (promptField ? item[promptField] : '')));
+  return activity.items.find(item => promptFor(item) === visiblePrompt
+    && (!visibleCitation || normalizeText(item.ref) === visibleCitation)) || null;
+}
+
+async function checkMoreBack(label, hash, topicIndex, firstLemma, secondLemma) {
+  await go(hash);
+  await gotoTopic(topicIndex);
+  const chart = page.locator('.card .paradigm').first();
+  const initial = await chart.innerText();
+  const more = chart.getByRole('button', { name: 'More', exact: true });
+  check(`5E §4.2 ${label}: first chart offers More`,
+    textHas(initial, firstLemma) && await more.count() === 1,
+    JSON.stringify(initial.replace(/\s+/g, ' ').trim()));
+  check(`5E §4.2 ${label}: sequential Next stays live on chart 1`,
+    !await page.locator('.rail-next').isDisabled());
+
+  await more.click();
+  await page.waitForTimeout(60);
+  const second = await chart.innerText();
+  const back = chart.getByRole('button', { name: 'Back', exact: true });
+  check(`5E §4.2 ${label}: More opens chart 2 and offers Back`,
+    textHas(second, secondLemma) && await back.count() === 1,
+    JSON.stringify(second.replace(/\s+/g, ' ').trim()));
+  check(`5E §4.2 ${label}: sequential Next stays live on chart 2`,
+    !await page.locator('.rail-next').isDisabled());
+
+  await back.click();
+  await page.waitForTimeout(60);
+  check(`5E §4.2 ${label}: Back restores chart 1`, textHas(await chart.innerText(), firstLemma));
+}
+
+await checkMoreBack('ch4 Masculine Declension', '#/activity/chapt_4/c4_learn_nouns', 4, 'λόγος', 'ἄνθρωπος');
+await checkMoreBack('ch5 First Declension--Alpha', '#/activity/chapt_5/c5_learn_nouns', 5, 'ὥρα', 'δόξα');
+
+// The third charts[] surface uses the same mechanism but deliberately names
+// the OTHER chart instead of saying More/Back.
+await go('#/activity/chapt_5/c5_learn_article');
+await gotoTopic(2);
+{
+  const chart = page.locator('.card .paradigm').first();
+  const plural = chart.getByRole('button', { name: 'Plural', exact: true });
+  check('5E §4.2 ch5 article: Singular chart offers Plural', await plural.count() === 1,
+    (await chart.innerText()).replace(/\s+/g, ' ').trim());
+  await plural.click();
+  await page.waitForTimeout(60);
+  const singular = chart.getByRole('button', { name: 'Singular', exact: true });
+  check('5E §4.2 ch5 article: Plural chart offers Singular', await singular.count() === 1,
+    (await chart.innerText()).replace(/\s+/g, ' ').trim());
+  check('5E §4.2 ch5 article: sequential Next stays live through the named toggle',
+    !await page.locator('.rail-next').isDisabled());
+  await singular.click();
+  await page.waitForTimeout(60);
+  check('5E §4.2 ch5 article: Singular restores the first chart',
+    await chart.getByRole('button', { name: 'Plural', exact: true }).count() === 1);
+}
+
+async function checkChartRouteReset(label, hash, topicIndex, switchName, restoredName) {
+  await go(hash);
+  await gotoTopic(topicIndex);
+  const chart = page.locator('.card .paradigm').first();
+  await chart.getByRole('button', { name: switchName, exact: true }).click();
+  await page.waitForTimeout(50);
+  await page.locator('.rail-next').click();
+  await page.waitForTimeout(100);
+  await page.locator('.rail-prev').click();
+  await page.waitForTimeout(100);
+  await gotoTopic(topicIndex);
+  const restored = page.locator('.card .paradigm').first();
+  check(`5E §4.2 ${label}: leave and return resets chart 1`,
+    await restored.getByRole('button', { name: restoredName, exact: true }).count() === 1,
+    (await restored.innerText()).replace(/\s+/g, ' ').trim());
+}
+
+await checkChartRouteReset('ch4 Masculine Declension', '#/activity/chapt_4/c4_learn_nouns', 4, 'More', 'More');
+await checkChartRouteReset('ch5 First Declension--Alpha', '#/activity/chapt_5/c5_learn_nouns', 5, 'More', 'More');
+await checkChartRouteReset('ch5 Definite Article', '#/activity/chapt_5/c5_learn_article', 2, 'Plural', 'Plural');
+
+// ---------------------------------------------------------------- 5E §4.5 button-driven reveals
+async function checkReveal(label, chapter, activityId, buttonName, field) {
+  const activity = activityById(chapter, activityId);
+  await go(`#/activity/${chapter === ch4 ? 'chapt_4' : 'chapt_5'}/${activityId}`);
+  const currentItem = await authoredItemOnScreen(activity);
+  const expected = currentItem ? normalizeText(currentItem[field]) : null;
+  const output = page.locator(`.card [data-reveal="${field}"]`);
+  check(`5E §4.5 ${label}: reveal starts hidden`, await output.count() === 0);
+  await page.locator('.card').getByRole('button', { name: buttonName, exact: true }).click();
+  await output.waitFor({ state: 'visible', timeout: 1000 }).catch(() => {});
+  const rendered = await output.count() === 1;
+  const actual = rendered ? (await output.innerText()).replace(/\s+/g, ' ').trim() : '';
+  const citationBox = await page.locator('.card .prompt-citation').boundingBox();
+  const outputBox = rendered ? await output.boundingBox() : null;
+  check(`5E §4.5 ${label}: ${buttonName} prints the authored ${field} under the reference`,
+    rendered && expected !== null && normalizeText(actual) === expected
+      && !!citationBox && !!outputBox && outputBox.y >= citationBox.y + citationBox.height - 1,
+    `${JSON.stringify(actual)} after ${JSON.stringify(currentItem?.ref || 'unmatched item')}`);
+  await stepper('Next').click();
+  await page.waitForTimeout(50);
+  check(`5E §4.5 ${label}: reveal clears on item change`, await output.count() === 0);
+}
+
+await checkReveal('ch4 Declining Noun', ch4, 'c4_drill_declining', 'Translate', 'translate');
+await checkReveal('ch5 Declining Noun', ch5, 'c5_drill_declining', 'Translate', 'translate');
+await checkReveal('ch5 Definite Article', ch5, 'c5_drill_article', 'Gender', 'gender');
+
 // ---------------------------------------------------------------- §3 timing
 // The two constants, measured through the UI rather than read out of the
 // module: the item must still be on screen at ~55% of its deadline and gone by
@@ -274,24 +422,106 @@ async function measureAdvance(label, hash, wantCorrect) {
 // deterministic CORRECT measurement, and it is a chapter-2 surface, which is
 // where the 4000ms data literals used to live.
 await measureAdvance('ch2 Syllable Counting', '#/activity/chapt_2/c2_drill_syllable_counting', true);
-// Scripture Memory is the app's only `autoBoth` surface — the only place
-// ADVANCE_INCORRECT_MS is ever used.
+// Keep chapter 3's original `autoBoth` timing assertion as a regression; 5E's
+// new autoBoth surfaces are measured deterministically below.
 await measureAdvance('ch3 Scripture Memory Drill', '#/activity/chapt_3/c3_drill_scripture_memory', false);
 
+// Cohort 5E's one-attempt drills cannot be probed by guessing repeatedly: a
+// wrong first tap locks the grid. Select the authored first-item answer (or a
+// known non-answer) from the delivered data, but still measure the transition
+// solely through the rendered UI. Report the observed milliseconds.
+async function measureAuthoredAdvance(label, chapter, chapterId, activityId, wantCorrect, expectedMs) {
+  const activity = activityById(chapter, activityId);
+  await go(`#/activity/${chapterId}/${activityId}`);
+  const before = await itemNumber();
+  const tiles = page.locator('.grid.options .tile, .option-group .tile');
+  const labels = (await tiles.allInnerTexts()).map(normalizeText);
+  const currentItem = await authoredItemOnScreen(activity);
+  if (!currentItem) {
+    check(`5E timing ${label}`, false,
+      'could not match the rendered prompt/reference to authored data');
+    return;
+  }
+  const answer = normalizeText(currentItem.answer);
+  const index = wantCorrect ? labels.findIndex(text => text === answer) : labels.findIndex(text => text !== answer);
+  if (index < 0) {
+    check(`5E §8 timing ${label}`, false, `could not find a ${wantCorrect ? 'correct' : 'wrong'} rendered option for ${JSON.stringify(answer)}`);
+    return;
+  }
+
+  const answeredAt = Date.now();
+  await tiles.nth(index).click();
+  await page.waitForTimeout(70);
+  const kind = await feedbackKind();
+  const earlyAt = Math.round(expectedMs * 0.55);
+  await page.waitForTimeout(Math.max(0, earlyAt - (Date.now() - answeredAt)));
+  const early = await itemNumber();
+  let late = early;
+  while (late === before && Date.now() - answeredAt < expectedMs * 1.5) {
+    await page.waitForTimeout(40);
+    late = await itemNumber();
+  }
+  const elapsed = Date.now() - answeredAt;
+  const expectedKind = wantCorrect ? 'ok' : 'bad';
+  check(`5E §8 timing ${label}: ${wantCorrect ? 'correct' : 'incorrect'} advances on ${expectedMs}ms`,
+    kind === expectedKind && early === before && late !== before
+      && elapsed >= expectedMs * 0.8 && elapsed <= expectedMs * 1.5,
+    `item ${before} -> ${early} at ${earlyAt}ms -> ${late} at ${elapsed}ms; feedback ${kind}`);
+}
+
+await measureAuthoredAdvance('ch4 Greek Noun (manualOnIncorrect)', ch4, 'chapt_4', 'c4_drill_greek_noun', true, CORRECT_MS);
+await measureAuthoredAdvance('ch4 Scripture Memory (autoBoth)', ch4, 'chapt_4', 'c4_drill_scripture_memory', false, INCORRECT_MS);
+await measureAuthoredAdvance('ch5 First Declension Noun (manualOnIncorrect)', ch5, 'chapt_5', 'c5_drill_first_decl_noun', true, CORRECT_MS);
+await measureAuthoredAdvance('ch5 Scripture Memory (autoBoth)', ch5, 'chapt_5', 'c5_drill_scripture_memory', false, INCORRECT_MS);
+
 // ---------------------------------------------------------------- §5 grids
 for (const [label, hash] of [
+  ['ch1 Vocabulary: Greek to English', '#/activity/chapt_1/c1_drill_vocab_gk_en'],
   ['ch1 Vocabulary: English to Greek', '#/activity/chapt_1/c1_drill_vocab_en_gk'],
+  ['ch2 Vocabulary: Greek to English', '#/activity/chapt_2/c2_drill_vocab_gk_en'],
   ['ch2 Vocabulary: English to Greek', '#/activity/chapt_2/c2_drill_vocab_en_gk'],
-  ['ch3 Vocabulary: English to Greek', '#/activity/chapt_3/c3_drill_vocab_en_gk']
+  ['ch3 Vocabulary: Greek to English', '#/activity/chapt_3/c3_drill_vocab_gk_en'],
+  ['ch3 Vocabulary: English to Greek', '#/activity/chapt_3/c3_drill_vocab_en_gk'],
+  ['ch4 Vocabulary: Greek to English', '#/activity/chapt_4/c4_drill_vocab_gk_en'],
+  ['ch4 Vocabulary: English to Greek', '#/activity/chapt_4/c4_drill_vocab_en_gk'],
+  ['ch5 Vocabulary: Greek to English', '#/activity/chapt_5/c5_drill_vocab_gk_en'],
+  ['ch5 Vocabulary: English to Greek', '#/activity/chapt_5/c5_drill_vocab_en_gk']
 ]) {
   for (const [width, want] of [[320, 2], [768, 4]]) {
     await page.setViewportSize({ width, height: 900 });
     await go(hash);
     const cols = await page.locator('.grid.options').first()
       .evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
-    check(`§5 Greek option grid is ${want}-up at ${width}px — ${label}`, cols === want, `${cols} columns`);
+    check(`§5 vocabulary option grid is ${want}-up at ${width}px — ${label}`, cols === want, `${cols} columns`);
+  }
+}
+
+// D-26: these option grids ARE paradigms, so singular/plural stay paired in
+// two columns even at the iPad breakpoint. This is intentionally the opposite
+// of the vocabulary rule above.
+for (const [label, hash] of [
+  ['ch4 Greek Noun', '#/activity/chapt_4/c4_drill_greek_noun'],
+  ['ch4 Declining Noun', '#/activity/chapt_4/c4_drill_declining'],
+  ['ch5 Declining Noun', '#/activity/chapt_5/c5_drill_declining'],
+  ['ch5 Definite Article', '#/activity/chapt_5/c5_drill_article']
+]) {
+  for (const width of [320, 768]) {
+    await page.setViewportSize({ width, height: 900 });
+    await go(hash);
+    const cols = await page.locator('.grid.options').first()
+      .evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
+    check(`5E D-26 paradigm option grid stays two-up at ${width}px — ${label}`,
+      cols === 2, `${cols} columns`);
   }
 }
+
+for (const width of [320, 768]) {
+  await page.setViewportSize({ width, height: 900 });
+  await go('#/activity/chapt_5/c5_drill_first_decl_noun');
+  const cols = await page.locator('.grid.options').first()
+    .evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
+  check(`5E ch5 First Declension Noun grid stays single-column at ${width}px`, cols === 1, `${cols} columns`);
+}
 await page.setViewportSize({ width: 390, height: 900 });
 
 // Letter grids stay four-up at every width (single glyphs, no width problem).
@@ -313,7 +543,7 @@ check('§5 Parsing Drill divider is dark green',
   divider.top === GREEN || divider.left === GREEN, JSON.stringify(divider));
 
 // ---------------------------------------------------------------- §5 objectives
-for (const chapterId of ['chapt_1', 'chapt_2', 'chapt_3']) {
+for (const chapterId of ['chapt_1', 'chapt_2', 'chapt_3', 'chapt_4', 'chapt_5']) {
   const data = JSON.parse(readFileSync(`src/data/chapt-0${chapterId.split('_')[1]}.json`, 'utf8'));
   const objectives = (data.learn || []).find(a => a.mode === 'objectivesPage');
   if (!objectives) { check(`§5 ${chapterId} objectives use "1. 2. 3."`, false, 'no objectivesPage'); continue; }
diff --git a/scripts/ui-walk.mjs b/scripts/ui-walk.mjs
index 87e846f..2508ec6 100644
--- a/scripts/ui-walk.mjs
+++ b/scripts/ui-walk.mjs
@@ -7,7 +7,7 @@
 // rendered text/emphasis structure of every teaching page so a diff against
 // the DOSBox originals is mechanical rather than a squint.
 //
-//   node scripts/ui-walk.mjs [--chapters=chapt_1,chapt_2,chapt_3] [--out=DIR]
+//   node scripts/ui-walk.mjs [--chapters=chapt_1,...,chapt_5] [--out=DIR]
 //
 // It expects a preview server on PORT (default 4173): `npm run preview`.
 // Everything a machine can settle must be settled here before a VERIFY
@@ -22,18 +22,37 @@ const args = Object.fromEntries(process.argv.slice(2)
   .map(a => { const i = a.indexOf('='); return i === -1 ? [a.slice(2), true] : [a.slice(2, i), a.slice(i + 1)]; }));
 
 const BASE = args.base || `http://localhost:${args.port || 4173}`;
-const OUT = args.out || 'buildout/screenshots/5d-spec2';
+const OUT = args.out || 'buildout/screenshots/5e-spec1-sol';
 const WIDTHS = [{ name: '320', width: 320, height: 900 }, { name: '768', width: 768, height: 1100 }];
-const CHAPTERS = String(args.chapters || 'chapt_1,chapt_2,chapt_3').split(',');
+const CHAPTERS = String(args.chapters || 'chapt_1,chapt_2,chapt_3,chapt_4,chapt_5').split(',');
 
 const dataFor = id => JSON.parse(readFileSync(`src/data/chapt-0${id.split('_')[1]}.json`, 'utf8'));
 
 mkdirSync(OUT, { recursive: true });
 
+// playwright-core does not download a browser. Prefer its configured binary,
+// then fall back to an installed Chrome/Edge channel. This keeps CI's pinned
+// Chromium when it exists and makes the checked-in npm task work on the local
+// Windows build seat without a machine-specific executable path.
+async function launchBrowser() {
+  const explicit = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
+  if (explicit) return chromium.launch({ executablePath: explicit });
+  try {
+    return await chromium.launch();
+  } catch (original) {
+    for (const channel of ['chrome', 'msedge']) {
+      try { return await chromium.launch({ channel }); } catch { /* try the next installed channel */ }
+    }
+    throw original;
+  }
+}
+
 // The structural dump: what is on the page and how it is set apart. Text alone
 // hid every round-1 defect, so emphasis, list markers, colour role and tap
 // targets come out with it.
 const EXTRACT = () => {
+  const visible = el => !!el && el.getClientRects().length > 0
+    && getComputedStyle(el).visibility !== 'hidden';
   const roleOf = el => {
     const cls = el.className || '';
     if (/rc-lead-plain|rc-strong/.test(cls)) return 'bold';
@@ -42,40 +61,187 @@ const EXTRACT = () => {
     if (/greek-tap|greek-say/.test(cls)) return 'tappable';
     return null;
   };
-  const card = document.querySelector('.card');
+  const card = [...document.querySelectorAll('.hint-modal')].find(visible)
+    || document.querySelector('.card');
   if (!card) return { text: '', marked: [], taps: [] };
   const marked = [...card.querySelectorAll('u, .rc-lead, .rc-lead-u, .rc-lead-plain, .term-green')]
+    .filter(visible)
     .map(el => ({ role: roleOf(el), text: el.textContent.trim() }));
   // Which words are tappable is a fidelity question (directive 9), so the dump
   // names them: prose taps, chart rows, paradigm cells and the lemma.
   const taps = [...card.querySelectorAll('button.greek-tap, button.greek-say, button.pg-cell:not([disabled]), button.pg-lemma, button.rv-greek, button.ilv-word:not([disabled])')]
+    .filter(visible)
     .map(el => (el.querySelector('.greek') || el).textContent.trim()).filter(Boolean);
-  const lists = [...card.querySelectorAll('ol')].map(ol => ({
+  const lists = [...card.querySelectorAll('ol')].filter(visible).map(ol => ({
     marker: getComputedStyle(ol).listStyleType,
     items: [...ol.children].map(li => li.textContent.replace(/\s+/g, ' ').trim())
   }));
-  const paras = [...card.querySelectorAll('p.rc-para')].map(p => ({
+  const paras = [...card.querySelectorAll('p.rc-para')].filter(visible).map(p => ({
     example: p.classList.contains('example-block'),
     strong: p.classList.contains('rc-strong'),
     indent: p.classList.contains('rc-indent'),
     text: p.innerText
   }));
+  const root = document.documentElement;
+  const structural = [...card.querySelectorAll('*')]
+    .filter(el => {
+      if (!el.clientWidth || el.scrollWidth <= el.clientWidth + 1) return false;
+      const display = getComputedStyle(el).display;
+      return /^(block|flex|grid|table|table-row-group|inline-flex|inline-grid)$/.test(display)
+        && !el.matches('button, summary, .greek, .rc-greekword');
+    })
+    .map(el => ({
+      cls: String(el.className).slice(0, 80),
+      scroll: el.scrollWidth,
+      client: el.clientWidth,
+      overrun: Math.max(0, Math.ceil(el.scrollWidth - el.clientWidth))
+    }));
+  const docOverrun = Math.max(0, Math.ceil(root.scrollWidth - root.clientWidth));
+  const cardOverrun = Math.max(0, Math.ceil(card.scrollWidth - card.clientWidth));
+  const structuralOverrun = structural.reduce((n, item) => Math.max(n, item.overrun), 0);
+  const rail = document.querySelector('.rail');
   return {
     heading: (card.querySelector('.topic-heading, .rc-heading') || {}).textContent || '',
     text: card.innerText,
     marked, taps, lists, paras,
+    buttons: [...card.querySelectorAll('button:not([hidden])')]
+      .filter(visible)
+      .map(el => el.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean),
+    expanders: [...card.querySelectorAll('details')].filter(visible).map(el => ({
+      label: (el.querySelector('summary') || {}).textContent?.replace(/\s+/g, ' ').trim() || '',
+      open: el.open
+    })),
+    rail: rail ? {
+      count: (rail.querySelector('.rail-count') || {}).textContent?.trim() || '',
+      previousDisabled: !!rail.querySelector('.rail-prev')?.disabled,
+      nextDisabled: !!rail.querySelector('.rail-next')?.disabled
+    } : null,
     // Silent horizontal clipping is the failure mode this app cannot see:
     // overflow-x is hidden app-wide, so a too-wide grid loses its right edge
-    // with nothing to scroll and nothing to error.
-    overflow: [...card.querySelectorAll('*')]
-      .filter(el => el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0)
-      .map(el => ({ cls: String(el.className).slice(0, 60), scroll: el.scrollWidth, client: el.clientWidth })),
-    docOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
+    // with nothing to scroll and nothing to error. Report exact pixels, not a
+    // boolean; inline Greek glyph metric noise is deliberately excluded from
+    // the structural figure.
+    overflow: structural,
+    docOverrun,
+    cardOverrun,
+    structuralOverrun,
+    overrunPx: Math.max(docOverrun, cardOverrun, structuralOverrun),
+    docOverflow: docOverrun > 0
   };
 };
 
-const report = { base: BASE, chapters: {}, consoleErrors: [] };
-const browser = await chromium.launch();
+const report = {
+  base: BASE,
+  widths: WIDTHS,
+  chapters: {},
+  checklistPages: [],
+  overflow320: [],
+  railErrors: [],
+  interactionErrors: [],
+  consoleErrors: []
+};
+
+const activityFor = (data, id) => Object.values(data)
+  .filter(Array.isArray).flat().find(activity => activity && activity.id === id);
+const slug = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
+  .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'state';
+const chartGroupsIn = (node, found = []) => {
+  if (Array.isArray(node)) {
+    node.forEach(value => chartGroupsIn(value, found));
+  } else if (node && typeof node === 'object') {
+    if (Array.isArray(node.charts) && node.charts.length) found.push(node);
+    for (const value of Object.values(node)) chartGroupsIn(value, found);
+  }
+  return found;
+};
+const expectedChecklistPageCount = CHAPTERS.filter(id => /^chapt_[45]$/.test(id))
+  .reduce((total, chapterId) => {
+    const data = dataFor(chapterId);
+    return total + (data.sequence || []).reduce((pages, activityId) => {
+      const activity = activityFor(data, activityId);
+      return pages + (activity?.mode === 'topicPages' ? activity.topics.length : 1);
+    }, 0);
+  }, 0);
+report.expectedChecklistPages = expectedChecklistPageCount;
+
+async function capture(page, dir, file, label) {
+  await page.evaluate(() => document.fonts.ready);
+  await page.waitForTimeout(100);
+  const path = join(dir, file);
+  await page.screenshot({ path, fullPage: true });
+  return { label, shot: path.replace(/\\/g, '/'), ...(await page.evaluate(EXTRACT)) };
+}
+
+// Open each visible details card separately, matching the original's one-popup
+// screenshots. Then traverse every authored charts[] state. The first chart is
+// already represented by the canonical page shot; later states get their own
+// evidence file, and the chart is reset before rail walking continues.
+async function captureInteractiveStates(page, source, prefix, record, context) {
+  async function captureExpanders(statePrefix) {
+    const details = page.locator('.card details.rc-expander, .card details.pg-meanings');
+    const count = await details.count();
+    for (let i = 0; i < count; i++) {
+      const detail = details.nth(i);
+      if (!await detail.isVisible()) continue;
+      const summary = detail.locator('summary').first();
+      if (!await summary.count()) {
+        report.interactionErrors.push({ ...context, state: statePrefix, error: `expander ${i + 1} has no summary` });
+        continue;
+      }
+      const wasOpen = await detail.evaluate(el => el.open);
+      const name = (await summary.innerText()).replace(/\s+/g, ' ').trim();
+      if (!wasOpen) await summary.click();
+      await page.waitForTimeout(80);
+      await record(`${statePrefix}--expander${i + 1}-${slug(name)}`, `expander: ${name}`);
+      if (!wasOpen) {
+        await summary.click();
+        await page.waitForTimeout(50);
+      }
+    }
+  }
+
+  await captureExpanders(prefix);
+  const groups = chartGroupsIn(source);
+  for (const group of groups) {
+    for (let index = 1; index < group.charts.length; index++) {
+      const chart = group.charts[index];
+      const buttonName = group.switch === 'named' ? chart.name : 'More';
+      const button = page.locator('.card .paradigm').getByRole('button', { name: buttonName, exact: true }).first();
+      if (!await button.count() || !await button.isVisible()) {
+        report.interactionErrors.push({ ...context, state: prefix, error: `missing chart switch "${buttonName}"` });
+        break;
+      }
+      await button.click();
+      await page.waitForTimeout(80);
+      const chartPrefix = `${prefix}--chart${index + 1}-${slug(chart.name || chart.lemma?.greek)}`;
+      await record(chartPrefix, `chart ${index + 1}: ${chart.name || chart.lemma?.greek || ''}`);
+      await captureExpanders(chartPrefix);
+    }
+
+    // Leave local chart state at chart 1. This also proves the reverse control
+    // exists; ui:behavior makes the stronger content assertion.
+    if (group.charts.length > 1) {
+      if (group.switch === 'named') {
+        const button = page.locator('.card .paradigm')
+          .getByRole('button', { name: group.charts[0].name, exact: true }).first();
+        if (await button.count() && await button.isVisible()) await button.click();
+        else report.interactionErrors.push({ ...context, state: prefix, error: `missing named return switch "${group.charts[0].name}"` });
+      } else {
+        for (let index = group.charts.length - 1; index > 0; index--) {
+          const button = page.locator('.card .paradigm').getByRole('button', { name: 'Back', exact: true }).first();
+          if (await button.count() && await button.isVisible()) await button.click();
+          else {
+            report.interactionErrors.push({ ...context, state: prefix, error: 'missing Back chart switch' });
+            break;
+          }
+        }
+      }
+      await page.waitForTimeout(50);
+    }
+  }
+}
+
+const browser = await launchBrowser();
 
 for (const size of WIDTHS) {
   const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 2 });
@@ -94,34 +260,120 @@ for (const size of WIDTHS) {
     const data = dataFor(chapterId);
     const stops = data.sequence || [];
     report.chapters[chapterId] ||= { stops: {} };
-    for (const activityId of stops) {
+    for (let stopIndex = 0; stopIndex < stops.length; stopIndex++) {
+      const activityId = stops[stopIndex];
+      const activity = activityFor(data, activityId);
+      const evidence = { chapterId, activityId, width: size.name };
       await page.goto(`${BASE}/#/activity/${chapterId}/${activityId}`, { waitUntil: 'load' });
       await page.waitForSelector('.card, .pending-verification', { timeout: 15000 }).catch(() => {});
-      await page.evaluate(() => document.fonts.ready);
-      await page.waitForTimeout(180);
       const dir = join(OUT, size.name, chapterId);
       mkdirSync(dir, { recursive: true });
-      await page.screenshot({ path: join(dir, `${activityId}.png`), fullPage: true });
-      const shot = await page.evaluate(EXTRACT);
+
+      const measured = [];
+      const baseShot = await capture(page, dir, `${activityId}.png`, 'rail stop');
+      measured.push(baseShot);
+      baseShot.topics = [];
+      baseShot.states = [];
       report.chapters[chapterId].stops[activityId] ||= {};
-      report.chapters[chapterId].stops[activityId][size.name] = shot;
+      report.chapters[chapterId].stops[activityId][size.name] = baseShot;
 
-      // topicPages: every topic is its own screen, and every one of them was a
-      // round-1 defect site. Step through the lot.
-      const topicCount = await page.locator('.topic-count').count();
-      if (topicCount) {
-        const label = await page.locator('.topic-count').first().innerText();
+      const expectedRail = `${stopIndex + 1} of ${stops.length}`;
+      if (!baseShot.rail || baseShot.rail.count !== expectedRail || baseShot.rail.nextDisabled) {
+        report.railErrors.push({ ...evidence, expected: expectedRail, actual: baseShot.rail });
+      }
+
+      const recordExtra = async (name, label) => {
+        const state = await capture(page, dir, `${name}.png`, label);
+        measured.push(state);
+        baseShot.states.push(state);
+        return state;
+      };
+
+      // topicPages: every topic is a checklist page. Capture it at both widths,
+      // then open all of that topic's expanders and switch all of its charts.
+      const topicCounter = page.locator('.topic-count');
+      if (await topicCounter.count()) {
+        const label = await topicCounter.first().innerText();
         const total = Number((label.match(/of\s+(\d+)/) || [])[1] || 1);
-        const topics = [];
         for (let i = 0; i < total; i++) {
           if (i > 0) {
-            await page.getByRole('button', { name: 'Next Topic' }).click();
-            await page.waitForTimeout(160);
+            await page.getByRole('button', { name: 'Next Topic', exact: true }).click();
+            await page.waitForTimeout(80);
+          }
+          const name = `${activityId}--topic${i + 1}`;
+          const topicShot = await capture(page, dir, `${name}.png`, `topic ${i + 1}`);
+          measured.push(topicShot);
+          baseShot.topics.push(topicShot);
+          baseShot.states.push(topicShot);
+          if (/^chapt_[45]$/.test(chapterId)) {
+            report.checklistPages.push({
+              ...evidence,
+              topic: i + 1,
+              title: activity?.topics?.[i]?.title || activity?.title || activityId,
+              shot: topicShot.shot,
+              overrunPx: topicShot.overrunPx
+            });
+          }
+          await captureInteractiveStates(page, activity?.topics?.[i] || {}, name, recordExtra, evidence);
+        }
+      } else {
+        if (/^chapt_[45]$/.test(chapterId)) {
+          report.checklistPages.push({
+            ...evidence,
+            title: activity?.title || activityId,
+            shot: baseShot.shot,
+            overrunPx: baseShot.overrunPx
+          });
+        }
+        await captureInteractiveStates(page, activity || {}, activityId, recordExtra, evidence);
+
+        // A topic-id hintRef exercises the 5E resolver through its real modal
+        // host. Capture it at both widths and prove it can close cleanly.
+        if (activity?.ui?.hintRef) {
+          const hint = page.locator('.card').first().getByRole('button', { name: 'Hint', exact: true });
+          if (!await hint.count() || !await hint.isVisible()) {
+            report.interactionErrors.push({ ...evidence, state: activityId, error: 'missing Hint control' });
+          } else {
+            await hint.click();
+            const modal = page.locator('.hint-modal');
+            if (!await modal.count() || !await modal.isVisible() || !await modal.locator('.paradigm').count()) {
+              report.interactionErrors.push({ ...evidence, state: activityId, error: `Hint did not open paradigm "${activity.ui.hintRef}"` });
+            } else {
+              await recordExtra(`${activityId}--hint`, `hint: ${activity.ui.hintRef}`);
+              await modal.getByRole('button', { name: 'Close', exact: true }).click();
+              await page.waitForTimeout(50);
+              if (await modal.count()) report.interactionErrors.push({ ...evidence, state: activityId, error: 'Hint did not close' });
+            }
+          }
+        }
+
+        // The shared flashcard contract opens on an instructional state. The
+        // rail walk also shows a lemma card, so capture the first rendered card
+        // instead of treating the instruction alone as ten-lemma evidence.
+        if (activity?.mode === 'flashcard') {
+          const nextCard = page.locator('.card').first().getByRole('button', { name: 'Next', exact: true });
+          if (await nextCard.count() && await nextCard.isVisible()) {
+            await nextCard.click();
+            await page.waitForTimeout(80);
+            await recordExtra(`${activityId}--first-card`, 'first vocabulary card');
+          } else {
+            report.interactionErrors.push({ ...evidence, state: activityId, error: 'flashcard has no Next control' });
           }
-          await page.screenshot({ path: join(dir, `${activityId}--topic${i + 1}.png`), fullPage: true });
-          topics.push(await page.evaluate(EXTRACT));
         }
-        report.chapters[chapterId].stops[activityId][size.name].topics = topics;
+      }
+
+      if (size.name === '320' && /^chapt_[45]$/.test(chapterId)) {
+        const worst = measured.reduce((best, state) => state.overrunPx > best.overrunPx ? state : best, measured[0]);
+        report.overflow320.push({
+          chapterId,
+          activityId,
+          overrunPx: worst.overrunPx,
+          state: worst.label,
+          shot: worst.shot,
+          docOverrun: worst.docOverrun,
+          cardOverrun: worst.cardOverrun,
+          structuralOverrun: worst.structuralOverrun
+        });
       }
     }
   }
@@ -132,16 +384,18 @@ await browser.close();
 writeFileSync(join(OUT, 'walk-report.json'), JSON.stringify(report, null, 1));
 
 const stops = Object.values(report.chapters).reduce((n, c) => n + Object.keys(c.stops).length, 0);
-const clipped = [];
-for (const [chapterId, c] of Object.entries(report.chapters)) {
-  for (const [activityId, byWidth] of Object.entries(c.stops)) {
-    for (const [width, shot] of Object.entries(byWidth)) {
-      const screens = [shot, ...(shot.topics || [])];
-      if (screens.some(s => s.docOverflow || (s.overflow || []).length)) clipped.push(`${chapterId}/${activityId} @${width}`);
-    }
-  }
-}
+const clipped = report.overflow320.filter(item => item.overrunPx > 0);
 console.log(`walked ${stops} stops x ${WIDTHS.length} widths -> ${OUT}`);
-console.log(clipped.length ? `HORIZONTAL OVERFLOW: ${clipped.join(', ')}` : 'no horizontal overflow anywhere');
+console.log(`checklist evidence: ${report.checklistPages.length} width-specific shots (${expectedChecklistPageCount} pages x ${WIDTHS.length} expected)`);
+console.log('320px overflow by new-chapter rail stop:');
+for (const item of report.overflow320) {
+  console.log(` ${item.chapterId}/${item.activityId}: ${item.overrunPx}px${item.overrunPx ? ` (${item.state})` : ''}`);
+}
+console.log(clipped.length ? `HORIZONTAL OVERFLOW: ${clipped.length} new-chapter stops` : 'no horizontal overflow in chapters 4 or 5');
+console.log(report.railErrors.length ? `RAIL ERRORS: ${report.railErrors.length}` : 'all rail counts and Next actions are live');
+console.log(report.interactionErrors.length ? `INTERACTION ERRORS: ${report.interactionErrors.length}` : 'all authored expanders and chart states opened');
 console.log(report.consoleErrors.length ? `CONSOLE ERRORS: ${report.consoleErrors.length}` : 'no console errors');
+if (report.railErrors.length) console.log(JSON.stringify(report.railErrors.slice(0, 10), null, 1));
+if (report.interactionErrors.length) console.log(JSON.stringify(report.interactionErrors.slice(0, 10), null, 1));
 if (report.consoleErrors.length) console.log(JSON.stringify(report.consoleErrors.slice(0, 10), null, 1));
+if (clipped.length || report.railErrors.length || report.interactionErrors.length || report.consoleErrors.length) process.exitCode = 1;
diff --git a/src/app.css b/src/app.css
index 3cf65bb..ed65843 100644
--- a/src/app.css
+++ b/src/app.css
@@ -102,17 +102,20 @@ button { font: inherit; cursor: pointer; }
 .grid.options { grid-template-columns: repeat(2, minmax(0, 1fr)); }
 .grid.options.wide { grid-template-columns: repeat(4, minmax(0, 1fr)); }
 .grid.options.single { grid-template-columns: minmax(0, 1fr); }
-/* D-19, amended by 5D-SPEC2 §5. A GREEK option pool is two-up at phone width
-   and four-up from the iPad breakpoint. Ten polytonic words in four columns
-   need ~33px more than a 320px screen has, and overflow-x is hidden app-wide,
-   so the longest words were being clipped in silence rather than wrapping —
+/* D-26: these two columns are Singular/Plural paradigm columns, not a
+   responsive option pool. Keep the explicit data-authored exception visible
+   in computed styles at every breakpoint. */
+.grid.options.paradigm2col { grid-template-columns: repeat(2, minmax(0, 1fr)); }
+/* D-19, amended by 5D-SPEC2 §5. A vocabulary option pool in either direction
+   is two-up at phone width and four-up from the iPad breakpoint. Ten Greek
+   forms or long English glosses in four columns become illegible at 320px,
    but an iPad has the room and four-up is the original's arrangement.
    768px is the iPad's portrait CSS width and the wide half of this round's
    320/768 screenshot pair; the app's other breakpoints (560px large phone,
    900px sidebar) are the wrong shape for this. Single-glyph letter grids are
    `wide` and stay four-up at every width. */
 @media (min-width: 768px) {
-  .grid.options.greek-pool { grid-template-columns: repeat(4, minmax(0, 1fr)); }
+  .grid.options.vocab-pool { grid-template-columns: repeat(4, minmax(0, 1fr)); }
 }
 .tile { background: var(--card); border: 2px solid transparent; border-radius: 10px;
   padding: 10px 4px; font-size: 1.35rem; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
@@ -354,6 +357,9 @@ button { font: inherit; cursor: pointer; }
 .rc-list:not(.authored-labels) > li::before { content: counter(rc-item) ")";
   position: absolute; left: -1.9em; width: 1.5em; text-align: right; font-weight: 600; }
 .rc-list.authored-labels { padding-left: 0.75em; }
+.rc-list.unnumbered { padding-left: 0; }
+.rc-list.unnumbered > li { counter-increment: none; }
+.rc-list.unnumbered > li::before { content: none; }
 .rc-lead { text-decoration: underline; font-weight: 600; }
 /* labelStyle "underline" / "plain" (5D-SPEC2 §6): the original's own list-item
    terms. Ink, never --link: blue is reserved for tappable, and these labels
@@ -485,6 +491,9 @@ button { font: inherit; cursor: pointer; }
 .rc-parttext { color: var(--ink); }
 .rc-greekrow { display: grid; grid-template-columns: repeat(var(--greek-cols), minmax(0, 1fr)); gap: 10px;
   align-items: baseline; border-bottom: 1px solid rgba(0,0,0,0.06); padding: 9px 6px; min-width: 0; }
+.rc-greekrows.gloss-only .rc-greekrow { grid-template-columns: minmax(4.5em, 35%) minmax(0, 1fr); }
+.rc-greekrows.english-pairs .rc-greekrow { text-align: center; }
+.rc-english-cell { min-width: 0; overflow-wrap: break-word; }
 .rc-greeklabel { font-weight: 600; overflow-wrap: anywhere; }
 /* Accent Possibilities chart: each row is legended in a trailing unheaded
    column ("Short Ultima" / "Long Ultima") -- English, so it opts out of the
@@ -573,6 +582,14 @@ button { font: inherit; cursor: pointer; }
    why the chart read "but, yet(638)". */
 .rv-freq { color: #8a8472; font-size: 0.9rem; margin-left: 0.35em; }
 .rv-footnote { font-size: 0.85rem; color: #5a5a52; line-height: 1.45; margin-top: 10px; }
+/* The chapter-4/5 original charts split ten lemmas into two five-row columns.
+   Keep the phone readable as one column, then restore that authored column-
+   major order when the 768px evidence width has room. */
+@media (min-width: 768px) {
+  .review-vocab.two-columns { display: grid; grid-auto-flow: column;
+    grid-template-rows: repeat(var(--rv-rows), auto); grid-template-columns: repeat(2, minmax(0, 1fr));
+    column-gap: 18px; }
+}
 
 /* ---- Review Letters Quick Chart (4-col matrix, A18: Pronounce col dropped) ---- */
 .letters-matrix { display: flex; flex-direction: column; }
@@ -637,6 +654,9 @@ button { font: inherit; cursor: pointer; }
 .tk-edit { display: flex; gap: 8px; justify-content: center; margin-top: 8px; }
 .spell-answer { text-align: center; margin-top: 12px; font-size: 1.3rem; }
 .spell-answer .label { font-size: 0.75rem; color: var(--teal-dark); font-weight: 700; text-transform: uppercase; margin-right: 8px; }
+.spell-prompt-ref { display: inline-block; margin-top: 8px; border: 1px solid #d8d0b8;
+  border-radius: 999px; padding: 3px 9px; color: var(--teal-dark); font-size: 0.78rem;
+  font-weight: 700; }
 .score-dialog { background: white; border-radius: 10px; padding: 14px 16px; margin-top: 14px;
   box-shadow: inset 0 0 0 1px rgba(0,0,0,0.06); }
 .score-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 0.95rem; border-bottom: 1px solid rgba(0,0,0,0.05); }
@@ -665,23 +685,67 @@ button { font: inherit; cursor: pointer; }
 .pg-lemma-greek { font-size: 1.7rem; color: var(--link); }
 .pg-lemma-gloss { color: var(--teal-dark); font-size: 0.95rem; }
 .pg-grid { display: flex; flex-direction: column; }
-.pg-head, .pg-row { display: grid; grid-template-columns: 1.6em repeat(var(--pg-cols, 2), minmax(0, 1fr));
-  gap: 6px; align-items: stretch; }
+.paradigm { --pg-label-col: 1.6em; --pg-gap: 6px; }
+.paradigm.pg-case-labels { --pg-label-col: 3.25em; }
+.paradigm.pg-long-case-labels { --pg-label-col: 4.65em; }
+.paradigm.pg-many-columns { --pg-label-col: 2.8em; --pg-gap: 2px; }
+.pg-head, .pg-row { display: grid; grid-template-columns: var(--pg-label-col) repeat(var(--pg-cols, 2), minmax(0, 1fr));
+  gap: var(--pg-gap); align-items: stretch; }
 .pg-head { padding: 6px 2px; border-bottom: 2px solid rgba(0,0,0,0.1); color: var(--teal-dark);
   font-size: 0.75rem; font-weight: 700; text-transform: uppercase; text-align: center; }
 .pg-head > span { min-width: 0; overflow-wrap: break-word; }
+.pg-group-head { border-bottom-width: 1px; padding-bottom: 3px; }
+.pg-column-group { color: var(--accent-ink); }
+.pg-column { display: flex; align-items: center; justify-content: center; min-width: 0;
+  overflow-wrap: break-word; line-height: 1.2; }
+.pg-column-audio { background: transparent; border: none; padding: 0 2px; color: var(--link);
+  font: inherit; font-weight: inherit; text-transform: inherit; text-align: center; }
 .pg-row { border-bottom: 1px solid rgba(0,0,0,0.06); }
 .pg-person { display: flex; align-items: center; justify-content: flex-start;
   color: var(--teal-dark); font-weight: 700; font-size: 0.9rem; }
+.pg-row-label { overflow-wrap: break-word; line-height: 1.2; }
 .pg-cell { display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 0;
   background: transparent; border: none; padding: 9px 2px; text-align: center; }
 .pg-cell:active { background: rgba(0,0,0,0.04); border-radius: 8px; }
 .pg-cell:disabled { cursor: default; }
 .pg-greek { font-size: 1.35rem; color: var(--link); overflow-wrap: anywhere; }
+.pg-long-forms { --pg-gap: 4px; }
+.pg-long-forms .pg-greek { font-size: 1.08rem; white-space: nowrap; overflow-wrap: normal; }
 .pg-cell:disabled .pg-greek { color: var(--ink); }
 .pg-gloss { font-size: 0.78rem; line-height: 1.3; color: var(--teal-dark); overflow-wrap: break-word; }
+.pg-many-columns .pg-head { font-size: 0.66rem; }
+.pg-many-columns .pg-person { font-size: 0.78rem; }
+.pg-many-columns .pg-cell { padding: 8px 0; }
+.pg-many-columns .pg-greek { font-size: 0.92rem; white-space: nowrap; overflow-wrap: normal; }
+@media (min-width: 560px) {
+  .pg-long-forms:not(.pg-many-columns) { --pg-gap: 6px; }
+  .pg-long-forms:not(.pg-many-columns) .pg-greek { font-size: 1.35rem; }
+  .pg-many-columns .pg-greek { font-size: 1.25rem; }
+}
+/* A chart's Meanings hotword stays immediately under the grid. Its expanded
+   body is the original's green teaching card, while the blue summary alone is
+   the tap target. */
+.pg-meanings { margin-top: 7px; }
+.pg-meanings-toggle { display: inline-block; color: var(--link); font-weight: 700;
+  text-decoration: underline; cursor: pointer; }
+.pg-meanings-toggle::marker { color: var(--link); }
+.pg-meanings-card { margin-top: 8px; padding: 10px; border-radius: 10px;
+  background: #dff6df; border: 1px solid #b8dfb9; }
+.pg-meanings-card .paradigm { margin: 0; }
+.pg-legend { display: flex; flex-direction: column; gap: 3px; margin-top: 10px;
+  font-size: 0.82rem; line-height: 1.35; }
+.pg-legend-row { display: grid; grid-template-columns: minmax(5.8em, 34%) minmax(0, 1fr);
+  gap: 8px; }
+.pg-legend-label { color: var(--accent-ink); font-weight: 700; }
+.pg-legend-text { min-width: 0; overflow-wrap: break-word; }
+.pg-closing { margin-top: 10px; font-size: 0.85rem; line-height: 1.4; }
+.pg-note { margin-top: 8px; color: var(--ink); font-size: 0.88rem; line-height: 1.4; }
 /* The original keeps Say Whole Paradigm / Endings INSIDE the chart frame. */
 .pg-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 12px; }
+.pg-actions.pg-actions-each { display: grid;
+  grid-template-columns: repeat(var(--pg-action-count), minmax(0, 1fr));
+  margin-left: var(--pg-label-col); }
+.pg-actions-each .btn { min-width: 0; padding-left: 6px; padding-right: 6px; }
 
 /* Endings popup: the same two number columns, ending over its English. The
    endings are bare morphemes with no clips, so they stay INK — the tappable
diff --git a/src/components/ContentAudio.svelte b/src/components/ContentAudio.svelte
index 1c1a31e..dd94456 100644
--- a/src/components/ContentAudio.svelte
+++ b/src/components/ContentAudio.svelte
@@ -7,7 +7,7 @@
   // modes are pedagogical layouts reconstructed from the original's yellow
   // panels; their per-mode data contracts are documented in HANDOFF-4 §5 (B1).
   import { slide } from 'svelte/transition';
-  import { resolveItems, shuffle } from '../lib/content.js';
+  import { getGreekTapMap, resolveItems, shuffle } from '../lib/content.js';
   import { play } from '../lib/audio.js';
   import { markCompleted } from '../lib/progress.js';
   import RichContent from './RichContent.svelte';
@@ -62,6 +62,9 @@
   let topicIndex = 0;
   $: topics = activity.topics || [];
   $: currentTopic = topics[topicIndex] || null;
+  $: activityGreekTaps = activity.greekTaps === true
+    ? getGreekTapMap(chapter.id)
+    : activity.greekTaps;
 
   // Learn Vocabulary flashcard visibility (A15). Segmented radio: Show Both /
   // Hide Greek / Hide English. A hidden pane blanks until tapped (per-card
@@ -155,7 +158,9 @@
       <RichContent
         blocks={currentTopic.content || []}
         suppressTitle={currentTopic.title}
-        greekTaps={currentTopic.greekTaps || activity.greekTaps} />
+        greekTaps={currentTopic.greekTaps === true
+          ? getGreekTapMap(chapter.id)
+          : (currentTopic.greekTaps || activityGreekTaps)} />
       {#if currentTopic._verify}<div class="pending-verification compact">Some topic details are pending verification.</div>{/if}
     {:else}
       <div class="pending-verification">Topic content pending verification.</div>
@@ -202,7 +207,7 @@
 {:else if mode === 'textPage'}
   {#if activity.content}
     <div class="card">
-      <RichContent blocks={activity.content} greekTaps={activity.greekTaps} />
+      <RichContent blocks={activity.content} greekTaps={activityGreekTaps} />
       {#if activity.playButton}
         <div class="controls">
           <button class="btn" on:click={() => play(activity.playButton.audio)}>▶ {activity.playButton.label}</button>
@@ -385,7 +390,8 @@
   <!-- Review Vocabulary Chart: Greek (tap = lemma audio, blue) + STATIC gloss
        (dark green) + ntFreq. A17/A6: only the Greek word is tappable. -->
   <div class="card">
-    <div class="review-vocab">
+    <div class="review-vocab" class:two-columns={activity.columns === 2}
+         style={`--rv-rows:${Math.ceil(items.length / (activity.columns || 1))}`}>
       {#each items as r}
         <div class="rv-row">
           <button class="rv-greek greek" on:click={() => r.audio && play(r.audio)}>{r.display}</button>
diff --git a/src/components/Marked.svelte b/src/components/Marked.svelte
index 6914124..a46dd35 100644
--- a/src/components/Marked.svelte
+++ b/src/components/Marked.svelte
@@ -1,7 +1,7 @@
 <script>
-  // Renders one authored string, honoring the inline [[u]]...[[/u]] underline
-  // and [[g]]...[[/g]] descriptive-term spans, plus the "( ´ )" isolated-mark
-  // groups (see lib/markup.js). Segments are plain text nodes -- never {@html}.
+  // Renders one authored string, honoring the inline [[u]]...[[/u]] underline,
+  // [[g]]...[[/g]] descriptive-term and [[i]]...[[/i]] title spans, plus the
+  // "( ´ )" isolated-mark groups. Segments are text nodes -- never {@html}.
   //
   // An isolated mark is a base-less diacritic: it needs the SPACING codepoint,
   // a font whose perispomeni is the rounded mark rather than a tilde, and the
@@ -22,4 +22,4 @@
   }
 </script>
 
-{#each splitUnderline(text) as seg}{#if seg.u}<u>{seg.t}</u>{:else if seg.g}<span class="term-green">{seg.t}</span>{:else}{#each splitMarkGroups(seg.t) as part}{#if part.group != null}<span class="mark-group">(&thinsp;<span class="isolated-mark" class:as-mark={kindOf(part.group) === 'mark'} class:greek={kindOf(part.group) === 'greek'}>{spacingMarks(part.group)}</span>&thinsp;)</span>{:else}{part.t}{/if}{/each}{/if}{/each}
+{#each splitUnderline(text) as seg}{#if seg.u}<u>{seg.t}</u>{:else if seg.g}<span class="term-green">{seg.t}</span>{:else if seg.i}<em>{seg.t}</em>{:else}{#each splitMarkGroups(seg.t) as part}{#if part.group != null}<span class="mark-group">(&thinsp;<span class="isolated-mark" class:as-mark={kindOf(part.group) === 'mark'} class:greek={kindOf(part.group) === 'greek'}>{spacingMarks(part.group)}</span>&thinsp;)</span>{:else}{part.t}{/if}{/each}{/if}{/each}
diff --git a/src/components/Paradigm.svelte b/src/components/Paradigm.svelte
index ffbe035..97e4365 100644
--- a/src/components/Paradigm.svelte
+++ b/src/components/Paradigm.svelte
@@ -1,87 +1,214 @@
 <script>
-  // PARADIGM CHART (5D). One renderer, three hosts: a `paradigm` RichContent
-  // block inside a Learn topic, the full-page `paradigmChart` contentAudio
-  // mode in Quick Review, and the Hint popup on the three chapter-3 verb
-  // drills. The original draws all three from the same chart, so the port does
-  // too — nothing here is keyed to an activity id.
+  // PARADIGM CHART (5D/5E). One renderer, three hosts: a `paradigm`
+  // RichContent block inside a Learn topic, the full-page `paradigmChart`
+  // contentAudio mode in Quick Review, and a drill's Hint popup. Nothing here
+  // is keyed to an activity id.
   //
-  // Layout follows the original: a numbered person column, one column per
-  // number (Singular / Plural), each cell a Greek form over its gloss, and the
-  // Say Whole Paradigm / Endings buttons INSIDE the chart frame.
+  // A 5E block may wrap several full charts in `charts`. The switch is local
+  // chart state, never rail navigation; replacing the block resets chart 1.
+  // A chart's `meanings` is itself paradigm-shaped and recursively uses this
+  // renderer inside its expander, so row/audio/gloss behavior cannot drift.
   //
-  // Greek-tap rule: every Greek cell and the lemma are tappable and play their
-  // own clip. The ENDINGS rows are bare morphemes with no clips of their own,
-  // so they render in ink rather than the tappable blue — the same exception
-  // the chapter's "Stem + Pronominal ending" line takes (logged in the data's
-  // _note).
+  // Greek-tap rule: every Greek cell and lemma is tappable when it carries an
+  // audio clip. Endings rows are bare morphemes with no clips of their own, so
+  // they render in ink rather than tappable blue.
   import { play } from '../lib/audio.js';
   export let paradigm;
   export let title = null;
 
+  let chartIndex = 0;
   let endingsOpen = false;
-  $: columns = paradigm.columns || [];
-  $: rows = paradigm.rows || [];
-  // Endings rows are flat [ending, gloss, ending, gloss] tuples — one pair per
+  let renderedParadigm = null;
+
+  // RichContent is reused while topicPages steps between topics. Reset on the
+  // block object, not only on an ActivityHost remount, so returning to a
+  // multi-chart topic always starts at chart 1.
+  $: if (paradigm !== renderedParadigm) {
+    renderedParadigm = paradigm;
+    chartIndex = 0;
+    endingsOpen = false;
+  }
+
+  $: charts = Array.isArray(paradigm?.charts) && paradigm.charts.length
+    ? paradigm.charts
+    : [paradigm || {}];
+  $: chart = charts[chartIndex] || charts[0] || {};
+  $: columns = chart.columns || [];
+  $: columnAudio = chart.columnAudio || [];
+  $: columnGroups = chart.columnGroups || [];
+  $: rows = chart.rows || [];
+  $: showGlosses = chart.showGlosses !== false;
+  $: hasCaseLabels = rows.some(row => row.label != null);
+  $: hasLongCaseLabels = rows.some(row => String(row.label || '').length > 5);
+  $: hasLongForms = hasCaseLabels && rows.some(row => (row.cells || [])
+    .some(cell => [...String(cell.greek || '')].length > 7));
+  // Endings rows are flat [ending, gloss, ending, gloss] tuples -- one pair per
   // number column, so the popup lines up with the chart above it.
-  $: endingRows = (paradigm.endings && paradigm.endings.rows) || [];
+  $: endingRows = (chart.endings && chart.endings.rows) || [];
+  $: sayWholeEach = chart.sayWholeEach || [];
+  $: switchKind = paradigm?.switch || null;
+  $: hasSwitch = charts.length > 1 && (switchKind === 'moreBack' || switchKind === 'named');
+  $: namedTarget = charts.length > 1 ? (chartIndex + 1) % charts.length : -1;
+  $: hasActions = !!chart.sayWhole || !!chart.endings || sayWholeEach.length > 0 || hasSwitch;
+
+  function switchChart(nextIndex) {
+    chartIndex = Math.max(0, Math.min(charts.length - 1, nextIndex));
+    endingsOpen = false;
+  }
 
   function openEndings() {
     endingsOpen = true;
     // D-10: the original ships c_ending but its button plays nothing. Treated
-    // as an original defect and restored — behind the tap, never on render.
-    if (paradigm.endings && paradigm.endings.audio) play(paradigm.endings.audio);
+    // as an original defect and restored -- behind the tap, never on render.
+    if (chart.endings && chart.endings.audio) play(chart.endings.audio);
   }
+
   function onKeydown(e) { if (e.key === 'Escape') endingsOpen = false; }
 </script>
 
 <svelte:window on:keydown={endingsOpen ? onKeydown : null} />
 
-<div class="paradigm">
-  {#if title}<div class="pg-title">{title}</div>{/if}
+<div
+  class="paradigm"
+  class:pg-case-labels={hasCaseLabels}
+  class:pg-long-case-labels={hasLongCaseLabels}
+  class:pg-long-forms={hasLongForms}
+  class:pg-many-columns={columns.length > 3}
+  data-chart-index={chartIndex}
+  data-chart-count={charts.length}
+  data-chart-name={chart.name || ''}>
+  {#key chart}
+    {#if title}<div class="pg-title">{title}</div>{/if}
 
-  {#if paradigm.lemma}
-    <button class="pg-lemma" on:click={() => paradigm.lemma.audio && play(paradigm.lemma.audio)}>
-      <span class="greek pg-lemma-greek">{paradigm.lemma.greek}</span>
-      {#if paradigm.lemma.gloss}<span class="pg-lemma-gloss">{paradigm.lemma.gloss}</span>{/if}
-    </button>
-  {/if}
+    {#if chart.lemma}
+      <button class="pg-lemma" on:click={() => chart.lemma.audio && play(chart.lemma.audio)}>
+        <span class="greek pg-lemma-greek">{chart.lemma.greek}</span>
+        <!-- showGlosses controls the inflected row cells. The original keeps
+             the lemma's identifying gloss in both Learn and Review charts. -->
+        {#if chart.lemma.gloss}<span class="pg-lemma-gloss">{chart.lemma.gloss}</span>{/if}
+      </button>
+    {/if}
+
+    <div class="pg-grid" style="--pg-cols:{columns.length}">
+      {#if columnGroups.length}
+        <div class="pg-head pg-group-head" style="--pg-cols:{columns.length}">
+          <span class="pg-person pg-head-spacer">&nbsp;</span>
+          {#each columnGroups as group, groupIndex}
+            <span
+              class="pg-column-group"
+              data-column-group={groupIndex}
+              style={`grid-column: span ${group.span || 1}`}>
+              {group.label}
+            </span>
+          {/each}
+        </div>
+      {/if}
+      {#if columns.length}
+        <div class="pg-head">
+          <span class="pg-person pg-head-spacer">&nbsp;</span>
+          {#each columns as column, columnIndex}
+            {#if columnAudio[columnIndex]}
+              <button
+                class="pg-column pg-column-audio"
+                data-column-index={columnIndex}
+                aria-label={`Play ${column}`}
+                on:click={() => play(columnAudio[columnIndex])}>
+                {column}
+              </button>
+            {:else}
+              <span class="pg-column" data-column-index={columnIndex}>{column}</span>
+            {/if}
+          {/each}
+        </div>
+      {/if}
+      {#each rows as row, rowIndex}
+        <div class="pg-row" data-row-index={rowIndex}>
+          <span class="pg-person pg-row-label">{row.label ?? row.person ?? ''}</span>
+          {#each row.cells || [] as cell, cellIndex}
+            <button
+              class="pg-cell"
+              data-cell-index={cellIndex}
+              disabled={!cell.audio}
+              on:click={() => cell.audio && play(cell.audio)}>
+              <span class="greek pg-greek">{cell.greek}</span>
+              {#if showGlosses && cell.gloss}<span class="pg-gloss">{cell.gloss}</span>{/if}
+            </button>
+          {/each}
+        </div>
+      {/each}
+    </div>
+
+    {#if chart.meanings}
+      <details class="pg-meanings" data-paradigm-meanings>
+        <summary class="pg-meanings-toggle">{chart.meanings.label || 'Meanings'}</summary>
+        <div class="pg-meanings-card">
+          <svelte:self paradigm={chart.meanings} title={chart.meanings.title || null} />
+        </div>
+      </details>
+    {/if}
 
-  <div class="pg-grid" style="--pg-cols:{columns.length}">
-    {#if columns.length}
-      <div class="pg-head">
-        <span class="pg-person">&nbsp;</span>
-        {#each columns as column}<span>{column}</span>{/each}
+    {#if chart.legend && chart.legend.length}
+      <div class="pg-legend">
+        {#each chart.legend as entry, legendIndex}
+          <div class="pg-legend-row" data-legend-index={legendIndex}>
+            <span class="pg-legend-label">{entry.label}</span>
+            <span class="pg-legend-text">{entry.text}</span>
+          </div>
+        {/each}
       </div>
     {/if}
-    {#each rows as row}
-      <div class="pg-row">
-        <span class="pg-person">{row.person}</span>
-        {#each row.cells as cell}
-          <button class="pg-cell" disabled={!cell.audio} on:click={() => cell.audio && play(cell.audio)}>
-            <span class="greek pg-greek">{cell.greek}</span>
-            {#if cell.gloss}<span class="pg-gloss">{cell.gloss}</span>{/if}
+    {#if chart.closing}<div class="pg-closing">{chart.closing}</div>{/if}
+    {#if chart.note}<div class="pg-note">{chart.note}</div>{/if}
+
+    {#if hasActions}
+      <div class="pg-actions" class:pg-actions-each={sayWholeEach.length > 0} style={`--pg-action-count:${sayWholeEach.length || 1}`}>
+        {#if chart.sayWhole}
+          <button class="btn secondary pg-say-whole" on:click={() => play(chart.sayWhole.audio)}>{chart.sayWhole.label || 'Say Whole Paradigm'}</button>
+        {/if}
+        {#each sayWholeEach as action, actionIndex}
+          <button
+            class="btn secondary pg-say-whole pg-say-whole-each"
+            data-action-index={actionIndex}
+            on:click={() => action.audio && play(action.audio)}>
+            {action.label || 'Say Whole Paradigm'}
           </button>
         {/each}
+        {#if chart.endings}
+          <button class="btn secondary pg-endings-open" on:click={openEndings}>{chart.endings.label || 'Endings'}</button>
+        {/if}
+        {#if hasSwitch && switchKind === 'moreBack'}
+          {#if chartIndex > 0}
+            <button
+              class="btn secondary pg-switch pg-switch-back"
+              data-paradigm-switch="back"
+              data-target-index={chartIndex - 1}
+              on:click={() => switchChart(chartIndex - 1)}>Back</button>
+          {/if}
+          {#if chartIndex < charts.length - 1}
+            <button
+              class="btn secondary pg-switch pg-switch-more"
+              data-paradigm-switch="more"
+              data-target-index={chartIndex + 1}
+              on:click={() => switchChart(chartIndex + 1)}>More</button>
+          {/if}
+        {:else if hasSwitch && switchKind === 'named'}
+          <button
+            class="btn secondary pg-switch pg-switch-named"
+            data-paradigm-switch="named"
+            data-target-index={namedTarget}
+            on:click={() => switchChart(namedTarget)}>
+            {charts[namedTarget]?.name || `Chart ${namedTarget + 1}`}
+          </button>
+        {/if}
       </div>
-    {/each}
-  </div>
-
-  {#if paradigm.sayWhole || paradigm.endings}
-    <div class="pg-actions">
-      {#if paradigm.sayWhole}
-        <button class="btn secondary" on:click={() => play(paradigm.sayWhole.audio)}>{paradigm.sayWhole.label || 'Say Whole Paradigm'}</button>
-      {/if}
-      {#if paradigm.endings}
-        <button class="btn secondary" on:click={openEndings}>{paradigm.endings.label || 'Endings'}</button>
-      {/if}
-    </div>
-  {/if}
+    {/if}
+  {/key}
 </div>
 
-{#if endingsOpen}
+{#if endingsOpen && chart.endings}
   <div class="modal-overlay" on:click|self={() => (endingsOpen = false)} role="presentation">
-    <div class="modal pg-endings" role="dialog" aria-modal="true" aria-label={paradigm.endings.label || 'Endings'}>
-      <h2 class="modal-title">{paradigm.endings.label || 'Endings'}</h2>
+    <div class="modal pg-endings" role="dialog" aria-modal="true" aria-label={chart.endings.label || 'Endings'}>
+      <h2 class="modal-title">{chart.endings.label || 'Endings'}</h2>
       <div class="pg-endgrid">
         {#if columns.length === 2}
           <div class="pg-endhead"><span>{columns[0]}</span><span>{columns[1]}</span></div>
diff --git a/src/components/RichContent.svelte b/src/components/RichContent.svelte
index 7aeceee..abad038 100644
--- a/src/components/RichContent.svelte
+++ b/src/components/RichContent.svelte
@@ -28,7 +28,11 @@
   // chart. Same principle as dedupeExpanders below: the data is not ours to
   // edit, so the renderer declines to say it twice.
   export let suppressTitle = null;
-  const sameTitle = t => !!t && !!suppressTitle && t.trim() === suppressTitle.trim();
+  // One delivered topic abbreviates Masculine to Masc while its chart spells
+  // the word out. They are the same heading in the original, not two stacked
+  // headings; normalize the authored abbreviation for deduplication only.
+  const titleKey = t => String(t || '').trim().replace(/--Masc$/i, '--Masculine');
+  const sameTitle = t => !!t && !!suppressTitle && titleKey(t) === titleKey(suppressTitle);
 
   // The 6 Accent Rules topic ships the "Chart: Accent Possibilities" expander
   // TWICE, byte-identical (feedback 5: it renders twice on both devices). Data
@@ -178,7 +182,7 @@
       {#if b.preamble}<p class="rc-preamble"><Marked text={b.preamble} /></p>{/if}
       {@const items = listItems(b)}
       {@const selfNum = (() => { const re = /^\(?\d+[.)]/; return items.length > 0 && items.every(it => it.label && re.test(it.label)); })()}
-      <ol class="rc-list" class:authored-labels={selfNum}>
+      <ol class="rc-list" class:authored-labels={selfNum} class:unnumbered={b.numbered === false}>
         {#each items as it}
           {@const itemTaps = it.greekTaps || greekTaps}
           <li>
@@ -251,7 +255,9 @@
       {@const rowLabels = syllableMatrix && hasRowLabels(b)}
       {@const matrixCols = syllableMatrix ? b.columns.length + (rowLabels ? 1 : 0) : 0}
       {@const gridVars = `--greek-cols:${syllableMatrix ? matrixCols : (b.columns || []).length};--greek-datacols:${(b.columns || []).length}`}
-      <div class="rc-greekrows" class:syllable-matrix={syllableMatrix} class:row-labels={rowLabels} class:titled={b.title}>
+      <div class="rc-greekrows" class:syllable-matrix={syllableMatrix} class:row-labels={rowLabels}
+           class:gloss-only={b.layout === 'glossOnly'} class:english-pairs={b.layout === 'englishPairs'}
+           class:titled={b.title}>
         <!-- B5: Review Marks groups its rows under a title ("Breathing:",
              "Punctuation:", "Apostrophe:  ( ᾽ )  elided letters"). The title
              owns its line in the heading green; the rows hang beneath it. -->
@@ -279,6 +285,14 @@
                 {#if rowLabels}<span class="rc-cell rc-rowlabel">{row.label || '\u00a0'}</span>{/if}
               </div>
             {/if}
+          {:else if b.layout === 'englishPairs' && row.parts}
+            <!-- English singular/plural examples share greekRows' ruled table
+                 shell, but their cells are plain strings and never Greek tap
+                 targets. The explicit layout flag keeps this distinct from
+                 the object-form equation rows below. -->
+            <div class="rc-greekrow rc-english-pair" style={`--greek-cols:${row.parts.length}`}>
+              {#each row.parts as part}<span class="rc-english-cell">{part}</span>{/each}
+            </div>
           {:else if row.parts}
             <!-- C6: an equation row (\u03b4\u03b9\u03ac + \u03b1\u1f50\u03c4\u03bf\u1fe6 becomes \u03b4\u03b9\u1fbd \u03b1\u1f50\u03c4\u03bf\u1fe6). Each Greek
                  part is its OWN tap target with its own clip; the connecting
diff --git a/src/components/SelectActivity.svelte b/src/components/SelectActivity.svelte
index f8cb05e..5ea8605 100644
--- a/src/components/SelectActivity.svelte
+++ b/src/components/SelectActivity.svelte
@@ -46,7 +46,7 @@
   let pronounceEach = true;
   let finished = false;
   let showHint = false;
-  let showGloss = false;
+  let shownReveals = [];
   let showScore = false;
   let advanceTimer = null;
   const attemptedItems = new Set();
@@ -60,7 +60,7 @@
     optionClass = built.optionClass || '';
     qIndex = 0; attempts = 0; correct = 0;
     feedback = ''; picked = null; answered = false; finished = false;
-    showGloss = false;
+    shownReveals = [];
     attemptedItems.clear();
     pronounceEach = activity.ui?.defaults?.pronounceEach ?? true;
     // D1: the score line starts HIDDEN on every scored surface. ui.liveScore
@@ -77,26 +77,23 @@
   // as the fallback.
   $: currentOptions = (current && current.options) || options;
   $: authoredOptions = !!activity.optionsPerItem || Array.isArray(activity.optionValues);
-  // Four-up unless the labels are GREEK WORDS. The English-to-Greek vocabulary
-  // drills put ten polytonic words in a four-column grid, which needs ~33px
-  // more than a 320px screen has; overflow-x is hidden app-wide, so the ends
-  // of the longest words were being cut off in silence rather than wrapping
-  // (measured on ch1, ch2 and ch3 — it predates this cohort and the same
-  // expression is in the shipped build). The 24-letter grids keep their four
-  // columns because their generator declares optionClass 'wide' explicitly:
-  // single glyphs, no width problem.
-  $: wideOptions = optionClass === 'wide' || (!authoredOptions && !greekOptions);
+  // Only explicitly wide grids stay four-up at phone width. Vocabulary pools
+  // in BOTH directions follow D-19 (two-up below 768px, four-up from 768px):
+  // long English glosses can split just as badly as long Greek forms. The
+  // 24-letter generators declare `wide`, so their single glyphs stay four-up.
+  $: wideOptions = optionClass === 'wide';
   // optionGroups ([3,3]) splits the option list into visually separated
   // stacks, as the original's Parsing drill does. Groups stack vertically at
   // phone width and sit side by side once there is room (the six full parsing
   // labels are 46 characters — two columns inside 320px would be unreadable).
   $: optionGroups = optionClass === 'grouped' ? sliceGroups(currentOptions, activity.optionGroups) : null;
   $: greekOptions = !!activity.optionsAreGreek || activity.options === 'greek' || activity.generator?.options === 'lower';
-  // The two-up Greek pool (D-19): the ch1/ch2/ch3 English-to-Greek vocabulary
-  // grids. Four-up from the iPad breakpoint, where the width exists — the CSS
-  // owns the breakpoint, this only says which grid it applies to. Excludes the
-  // single-column and grouped layouts, which are stacked for label length.
-  $: greekPool = greekOptions && !wideOptions && optionClass !== 'single';
+  // The responsive vocabulary pool (D-19), in either direction. A vocabulary
+  // select is the non-generator, non-authored branch in buildSelectQuestions.
+  // Explicit pedagogical layouts remain outside this responsive class.
+  $: vocabularyPool = !activity.generator && !authoredOptions && !wideOptions
+    && optionClass !== 'single'
+    && optionClass !== 'paradigm2col';
   // A LONG Greek prompt cannot have the 3rem type a single letter gets. At
   // 320px, πιστεύουσι sets 268px of glyph into 260px of card and the tail is
   // lost in silence (overflow-x is hidden app-wide). Declared here rather than
@@ -106,7 +103,15 @@
   $: uiButtons = activity.ui?.buttons || [];
   $: showPronounce = !authoredOptions || uiButtons.includes('Pronounce');
   $: showStepper = uiButtons.includes('Previous') || uiButtons.includes('Next');
-  $: showTranslate = uiButtons.includes('Translate');
+  // Generic button-driven prompt reveals. Older chapter-3 data predates the
+  // revealButtons contract, so its authored Translate control normalizes to
+  // the same shape; chapter 4+ declares the field explicitly (Translate or
+  // Gender), and later chapters can add another without a component branch.
+  $: revealButtons = (activity.revealButtons && activity.revealButtons.length)
+    ? activity.revealButtons
+    : (uiButtons.includes('Translate') ? [{ label: 'Translate', field: 'translate' }] : []);
+  $: hintBeforeReveal = revealButtons.length > 0 && uiButtons.includes('Hint')
+    && uiButtons.indexOf('Hint') < Math.min(...revealButtons.map(button => uiButtons.indexOf(button.label)));
   $: showPronounceEach = !authoredOptions || !!activity.ui?.checkboxes?.includes('Pronounce Each Drill');
   // A hint either carries its own blocks (chapter 2's inline charts, rendered
   // below the card) or NAMES a chart the chapter already draws — chapter 3's
@@ -118,7 +123,7 @@
   // Grouped button block (the original stacks them two-up) once there are more
   // than the chapter-1 pair.
   $: groupedControls = 1 + (showPronounce ? 1 : 0) + (showStepper ? 2 : 0)
-    + (showTranslate ? 1 : 0) + (showHintButton ? 1 : 0) > 3;
+    + revealButtons.length + (showHintButton ? 1 : 0) > 3;
   // Timing and advance semantics: declared by the data, resolved centrally.
   $: advancePolicy = resolveAdvance(activity.answerPolicy);
   $: oneAttempt = advancePolicy.oneAttempt;
@@ -223,10 +228,25 @@
   // one-attempt drills) is a set — answering an item twice neither
   // double-counts completion nor un-completes it.
   function restore() {
-    showGloss = false;
+    shownReveals = [];
     picked = null; answered = false; feedback = ''; feedbackKind = '';
   }
 
+  function revealValue(field) {
+    if (!current || !field) return null;
+    return (current.reveals && current.reveals[field])
+      || current[field]
+      || (field === 'translate' ? current.gloss : null);
+  }
+
+  function toggleReveal(field) {
+    shownReveals = shownReveals.includes(field)
+      ? shownReveals.filter(value => value !== field)
+      : [...shownReveals, field];
+  }
+
+  $: glossRevealed = !!current && shownReveals.some(field => revealValue(field) === current.gloss);
+
   function move(delta) {
     clearTimeout(advanceTimer);
     const nextIndex = Math.max(0, Math.min(questions.length - 1, qIndex + delta));
@@ -286,13 +306,17 @@
     {#if current.pending}
       <div class="pending-verification" role="status">This activity item is pending content verification.</div>
     {:else}
-      <!-- Translate: the original's gloss line under the word, on demand. -->
-      {#if showGloss && (current.translate || current.gloss)}<div class="gloss-line">{current.translate || current.gloss}</div>{/if}
+      <!-- Button-driven reveal output is ink, never tappable blue. -->
+      {#each revealButtons as reveal}
+        {#if shownReveals.includes(reveal.field) && revealValue(reveal.field)}
+          <div class="gloss-line" data-reveal={reveal.field}>{revealValue(reveal.field)}</div>
+        {/if}
+      {/each}
       <!-- Reveal on a finalized item: the gloss, and the properly accented
            form the Accent Rule drill's misaccented prompt should have had. -->
       {#if answered && (current.gloss || current.correctForm)}
         <div class="reveal-row">
-          {#if current.gloss && !showGloss}<span class="reveal-gloss">{current.gloss}</span>{/if}
+          {#if current.gloss && !glossRevealed}<span class="reveal-gloss">{current.gloss}</span>{/if}
           {#if current.correctForm}<span class="reveal-form greek">{current.correctForm}</span>{/if}
         </div>
       {/if}
@@ -317,7 +341,8 @@
           {/each}
         </div>
       {:else}
-        <div class="grid options" class:wide={wideOptions} class:single={optionClass === 'single'} class:greek-pool={greekPool}>
+        <div class="grid options" class:wide={wideOptions} class:single={optionClass === 'single'}
+             class:paradigm2col={optionClass === 'paradigm2col'} class:vocab-pool={vocabularyPool}>
           {#each currentOptions as opt}
             <button
               class="tile small"
@@ -357,10 +382,13 @@
         {@const say = current.promptAudio || current.answerAudio}
         <button class="btn" disabled={!say} on:click={() => say && play(say)}>Pronounce</button>
       {/if}
-      {#if showTranslate}
-        <button class="btn secondary" disabled={!(current.translate || current.gloss)} on:click={() => (showGloss = !showGloss)}>Translate</button>
+      {#if showHintButton && hintBeforeReveal}
+        <button class="btn secondary" on:click={() => (showHint = !showHint)}>Hint</button>
       {/if}
-      {#if showHintButton}
+      {#each revealButtons as reveal}
+        <button class="btn secondary" disabled={!revealValue(reveal.field)} on:click={() => toggleReveal(reveal.field)}>{reveal.label}</button>
+      {/each}
+      {#if showHintButton && !hintBeforeReveal}
         <button class="btn secondary" on:click={() => (showHint = !showHint)}>Hint</button>
       {/if}
       <button class="btn secondary" on:click={() => (showScore = !showScore)}>Score</button>
@@ -381,7 +409,7 @@
   <!-- The original's Hint POPUP: the chapter's paradigm chart over the drill. -->
   <div class="modal-overlay" on:click|self={() => (showHint = false)} role="presentation">
     <div class="modal hint-modal" role="dialog" aria-modal="true" aria-label="Hint">
-      <Paradigm paradigm={hintChart} title={hintChart.title} />
+      <Paradigm paradigm={hintChart} title={hintChart.title || hintChart.charts?.[0]?.title || null} />
       <div class="modal-actions">
         <!-- svelte-ignore a11y-autofocus -->
         <button class="btn" autofocus on:click={() => (showHint = false)}>Close</button>
diff --git a/src/components/SpellActivity.svelte b/src/components/SpellActivity.svelte
index d77ced5..80709a7 100644
--- a/src/components/SpellActivity.svelte
+++ b/src/components/SpellActivity.svelte
@@ -23,9 +23,11 @@
   // vocabulary spellers); {gloss, greek, audio} carries it inline (chapter 3's
   // verb speller, whose 27 inflected forms are not lexicon lemmas).
   const words = (activity.items || []).map(it => {
-    if (it.greek) return { ref: null, greek: it.greek, gloss: it.gloss || '', audio: it.audio || null };
+    if (it.greek) return {
+      ref: it.ref || null, greek: it.greek, gloss: it.gloss || '', audio: it.audio || null
+    };
     const l = getLemma(it.ref, chapter.id, it.pool) || {};
-    return { ref: it.ref, greek: l.greek || '', gloss: l.gloss || '', audio: l.audio || null };
+    return { ref: null, greek: l.greek || '', gloss: l.gloss || '', audio: l.audio || null };
   });
 
   // The tile keyboard is a shared component reading the shared
@@ -129,8 +131,10 @@
 
 <div class="card speller">
   <div class="spell-panes">
-    <div class="flash-pane"><div class="label">English Meaning</div>
-      <div class="value" style="font-size:1.2rem">{word ? word.gloss : ''}</div></div>
+    <div class="flash-pane"><div class="label">{activity.promptLabel || 'English Meaning'}</div>
+      <div class="value" style="font-size:1.2rem">{word ? word.gloss : ''}</div>
+      {#if word && word.ref}<div class="spell-prompt-ref">{word.ref}</div>{/if}
+    </div>
     <SpellerField
       state={buffer}
       label="Spell Greek Word"
diff --git a/src/data/chapt-04.json b/src/data/chapt-04.json
index 6b0348b..a327777 100644
--- a/src/data/chapt-04.json
+++ b/src/data/chapt-04.json
@@ -1095,7 +1095,7 @@
      "audio": "chapt_4_d_sm7"
     },
     {
-     "greek": "δι ",
+     "greek": "δι᾽",
      "gloss": "through",
      "audio": "chapt_4_d_sm8"
     },
@@ -1120,10 +1120,10 @@
     {
      "type": "biblist",
      "items": [
-      "Machen, J. Gresham.  New Testament Greek for Beginners (Toronto:  The Macmillan Company, 1923), pp. 23-28.",
-      "Mounce, William D.  Basics of Biblical Greek:  Grammar (Grand Rapids:  Zondervan, 1993), pp. 28-54.",
-      "Summers, Ray and Thomas Sawyer.  Essentials of New Testament Greek (Nashville:  Broadman & Holman, 1995), pp. 15-20.",
-      "Wenham, J. W.   The Elements of New Testament Greek (Cambridge:  Cambridge University Press, 1965), pp. 30-39."
+        "Machen, J. Gresham.  [[i]]New Testament Greek for Beginners[[/i]] (Toronto:  The Macmillan Company, 1923), pp. 23-28.",
+        "Mounce, William D.  [[i]]Basics of Biblical Greek:  Grammar[[/i]] (Grand Rapids:  Zondervan, 1993), pp. 28-54.",
+        "Summers, Ray and Thomas Sawyer.  [[i]]Essentials of New Testament Greek[[/i]] (Nashville:  Broadman & Holman, 1995), pp. 15-20.",
+        "Wenham, J. W.   [[i]]The Elements of New Testament Greek[[/i]] (Cambridge:  Cambridge University Press, 1965), pp. 30-39."
      ]
     }
    ]
@@ -1136,6 +1136,9 @@
    "mode": "fullOptionGrid",
    "title": "Greek Noun Drill",
    "instructions": "Click on the correct Greek Noun form to replace the underlined English word",
+   "promptFrom": {
+    "show": "sentence"
+   },
    "optionsAreGreek": true,
    "optionsPerItem": 10,
    "optionLayout": "paradigm2col",
@@ -1951,7 +1954,7 @@
      "audio": "chapt_4_d_sm6b"
     },
     {
-     "greek": "δι ",
+     "greek": "δι᾽",
      "answer": "through",
      "audio": "chapt_4_d_sm8"
     },
@@ -2120,7 +2123,7 @@
    "title": "Vocabulary Spelling Exercise",
    "instructions": "Click letters below or use your keyboard to spell it out.",
    "prompt": "gloss",
-   "promptLabel": "English Meaning",
+   "promptLabel": "English Word",
    "accentsOptional": true,
    "spellerTilesRef": "chapt_1",
    "items": [
@@ -2189,7 +2192,7 @@
     "πατέρα",
     "εἰ",
     "μὴ",
-    "δι ",
+    "δι᾽",
     "ἐμοῦ."
    ],
    "translation": "no one comes to the father but by me",
@@ -2226,7 +2229,9 @@
    "mode": "reviewVocab",
    "title": "Review Vocabulary Chart",
    "pool": "lemmas",
+   "columns": 2,
    "showNtFreq": true,
+   "footnote": "The number after the translation is the number of times the word occurs in the New Testament.",
    "playAll": {
     "audio": "chapt_4_d_vocl4",
     "label": "Say Whole List"
@@ -2459,7 +2464,7 @@
      "audio": "chapt_4_d_sm7"
     },
     {
-     "greek": "δι ",
+     "greek": "δι᾽",
      "gloss": "through",
      "audio": "chapt_4_d_sm8"
     },
diff --git a/src/data/chapt-05.json b/src/data/chapt-05.json
index 966f20b..340e845 100644
--- a/src/data/chapt-05.json
+++ b/src/data/chapt-05.json
@@ -1544,10 +1544,10 @@
     {
      "type": "biblist",
      "items": [
-      "Machen, J. Gresham.  New Testament Greek for Beginners (Toronto:  The Macmillan Company, 1923), pp. 39-43.",
-      "Mounce, William D.  Basics of Biblical Greek:  Grammar (Grand Rapids:  Zondervan, 1993), pp. 28-54.",
-      "Summers, Ray and Thomas Sawyer.  Essentials of New Testament Greek (Nashville:  Broadman & Holman, 1995), pp. 21-23.",
-      "Wenham, J. W.   The Elements of New Testament Greek (Cambridge:  Cambridge University Press, 1965), pp. 39-42."
+        "Machen, J. Gresham.  [[i]]New Testament Greek for Beginners[[/i]] (Toronto:  The Macmillan Company, 1923), pp. 39-43.",
+        "Mounce, William D.  [[i]]Basics of Biblical Greek:  Grammar[[/i]] (Grand Rapids:  Zondervan, 1993), pp. 28-54.",
+        "Summers, Ray and Thomas Sawyer.  [[i]]Essentials of New Testament Greek[[/i]] (Nashville:  Broadman & Holman, 1995), pp. 21-23.",
+        "Wenham, J. W.   [[i]]The Elements of New Testament Greek[[/i]] (Cambridge:  Cambridge University Press, 1965), pp. 39-42."
      ]
     }
    ]
@@ -1560,6 +1560,9 @@
    "mode": "fullOptionGrid",
    "title": "First Declension Noun Drill",
    "instructions": "Click on the correct Greek Noun form to replace the underlined English word",
+   "promptFrom": {
+    "show": "sentence"
+   },
    "optionsAreGreek": true,
    "optionsPerItem": 4,
    "optionLayout": "single",
@@ -2767,7 +2770,7 @@
    "title": "Vocabulary Spelling Exercise",
    "instructions": "Click letters below or use your keyboard to spell it out.",
    "prompt": "gloss",
-   "promptLabel": "English Meaning",
+   "promptLabel": "English Word",
    "accentsOptional": true,
    "spellerTilesRef": "chapt_1",
    "items": [
@@ -2873,7 +2876,9 @@
    "mode": "reviewVocab",
    "title": "Review Vocabulary Chart",
    "pool": "lemmas",
+   "columns": 2,
    "showNtFreq": true,
+   "footnote": "The number after the translation is the number of times the word occurs in the New Testament.",
    "playAll": {
     "audio": "chapt_5_e_vocl5",
     "label": "Say Whole List"
diff --git a/src/lib/content.js b/src/lib/content.js
index bea95b8..a2dd794 100644
--- a/src/lib/content.js
+++ b/src/lib/content.js
@@ -134,6 +134,24 @@ export function getLemma(ref, chapterId, pool) {
   return null;
 }
 
+// A teaching page may opt into every audio-backed Greek form in its chapter
+// with greekTaps:true. Build that map from the already-loaded chapter lexicon;
+// this is a synchronous in-memory lookup, never an app-load store scan. Longer
+// forms come first so a phrase (for example "ὁ λόγος") claims its full
+// standalone match before either word can claim only part of it.
+export function getGreekTapMap(chapterId) {
+  const lex = registry[chapterId] && registry[chapterId].lexicon;
+  if (!lex) return {};
+  const entries = [];
+  for (const bucket of LEMMA_BUCKETS) {
+    for (const lemma of Object.values(lex[bucket] || {})) {
+      if (lemma && lemma.greek && lemma.audio) entries.push([lemma.greek, lemma.audio]);
+    }
+  }
+  entries.sort((a, b) => b[0].length - a[0].length);
+  return Object.fromEntries(entries);
+}
+
 // Reading People, Places and Letters pools (personalNames/placeNames/letterNames)
 // from a chapter's lexicon. Pass the chapter id so multi-chapter loads resolve
 // the RIGHT lexicon (reading-list keys repeat across chapters); falls back to
@@ -224,6 +242,8 @@ export function getNextChapter(chapterId) {
 
 // Resolve an activity's items into a uniform [{display, secondary, audio, meta}]
 export function resolveItems(chapter, activity) {
+  const vocabDisplay = lemma => ((activity.mode === 'flashcard' || activity.mode === 'reviewVocab')
+    && lemma.lexicalForm) || lemma.greek;
   const src = activity.itemsFrom;
   if (src && src.startsWith('alphabet.letters')) {
     return chapter.alphabet.letters.map(l => ({
@@ -262,7 +282,7 @@ export function resolveItems(chapter, activity) {
       if (item.ref) {
         const lemma = getLemma(item.ref, chapter.id, item.pool);
         return lemma ? {
-          display: lemma.greek, secondary: stripMarkup(lemma.gloss), audio: lemma.audio,
+          display: vocabDisplay(lemma), secondary: stripMarkup(lemma.gloss), audio: lemma.audio,
           meta: { ...lemma, ref: item.ref }
         } : { display: item.ref, secondary: '(missing lemma)', audio: null, meta: {} };
       }
@@ -276,7 +296,7 @@ export function resolveItems(chapter, activity) {
   // untouched.
   if (activity.pool || (activity.promptFrom && activity.promptFrom.lexicon)) {
     return lemmaPool(chapter, activity).map(lemma => ({
-      display: lemma.greek, secondary: stripMarkup(lemma.gloss), audio: lemma.audio, meta: lemma
+      display: vocabDisplay(lemma), secondary: stripMarkup(lemma.gloss), audio: lemma.audio, meta: lemma
     }));
   }
   return [];
@@ -370,6 +390,12 @@ export function buildSelectQuestions(chapter, activity) {
           : (item.prompt != null ? item.prompt : (promptField ? item[promptField] : undefined));
       const needsUnderline = promptField === 'sentence' && !item.underline;
       const itemOptions = item.optionValues || item.options;
+      const reveals = {};
+      for (const button of activity.revealButtons || []) {
+        if (button && button.field && item[button.field] != null) {
+          reveals[button.field] = stripMarkup(item[button.field]);
+        }
+      }
       return {
         prompt: stripMarkup(prompt) || '',
         promptAudio: promptIsGreek ? (item.promptAudio || item.audio || (lemma && lemma.audio) || null) : null,
@@ -393,6 +419,7 @@ export function buildSelectQuestions(chapter, activity) {
         // from `gloss`, which chapter 2's one-attempt drills reveal on their
         // own once an item is answered — a translation is shown on request.
         translate: stripMarkup(item.translate) || null,
+        reveals,
         correctForm: item.correctForm || null,
         redMarkCluster: item.redMarkCluster || null,
         pending: !prompt || item.answer == null || needsUnderline
@@ -434,6 +461,8 @@ export function buildSelectQuestions(chapter, activity) {
 //   ''       the two-column default: ch2's mark and part-of-speech grids,
 //            ch3's 2x3 verb translations and 2x5 Scripture Memory grid.
 function optionClassFor(activity, activityOptions, questions) {
+  if (activity.optionLayout === 'single') return 'single';
+  if (activity.optionLayout === 'paradigm2col') return 'paradigm2col';
   if (Array.isArray(activity.optionGroups) && activity.optionGroups.length) return 'grouped';
   if (activity.optionsPerItem && activity.optionsAreGreek) return 'single';
   const all = activityOptions.length
@@ -452,11 +481,30 @@ function optionClassFor(activity, activityOptions, questions) {
 export function resolveHintRef(chapter, ref) {
   if (!chapter || !ref) return null;
   let found = null;
+  const nestedParadigm = node => {
+    let chart = null;
+    const scan = value => {
+      if (chart || !value) return;
+      if (Array.isArray(value)) { value.forEach(scan); return; }
+      if (typeof value !== 'object') return;
+      if (value.type === 'paradigm') { chart = value; return; }
+      for (const child of Object.values(value)) scan(child);
+    };
+    scan(node);
+    return chart;
+  };
   const walk = node => {
     if (found || !node) return;
     if (Array.isArray(node)) { node.forEach(walk); return; }
     if (typeof node !== 'object') return;
     if (node.type === ref) { found = node; return; }
+    // Chapter 4+ drills point at the authored TOPIC which owns their paradigm,
+    // not at a globally unique block type. Resolve the topic generically and
+    // return its nested paradigm; no activity id enters the renderer contract.
+    if (node.id === ref) {
+      found = nestedParadigm(node);
+      if (found) return;
+    }
     for (const key of Object.keys(node)) walk(node[key]);
   };
   for (const section of SECTIONS) walk(chapter[section]);
diff --git a/src/lib/markup.js b/src/lib/markup.js
index c447b01..e724fa8 100644
--- a/src/lib/markup.js
+++ b/src/lib/markup.js
@@ -7,7 +7,7 @@
 // spans; every other surface strips the markers so a marker can never reach
 // the screen as literal text.
 //
-// TWO INLINE SPANS, one syntax:
+// THREE INLINE SPANS, one syntax:
 //   [[u]]…[[/u]]  underline — the original's own emphasis
 //   [[g]]…[[/g]]  dark green — a DESCRIPTIVE TERM sharing a line with the
 //                 example it describes ("Come here. — command", "Terry kicked
@@ -16,27 +16,28 @@
 //                 apart; green is the port's way of doing that, and the colour
 //                 is the ink/dark-green already used for asides — NEVER blue,
 //                 which means tappable and only tappable (directive 8).
-// The two never nest in shipped data, and the splitter is written so a nested
+//   [[i]]…[[/i]]  italic — bibliographic titles emphasized by the original.
+// The spans never nest in shipped data, and the splitter is written so a nested
 // pair would still emit both runs' text rather than swallowing one.
 
-const INLINE = /\[\[([ug])\]\]([\s\S]*?)\[\[\/\1\]\]/g;
-const ANY_MARKER = /\[\[\/?[ug]\]\]/g;
+const INLINE = /\[\[([ugi])\]\]([\s\S]*?)\[\[\/\1\]\]/g;
+const ANY_MARKER = /\[\[\/?[ugi]\]\]/g;
 
-// [{ t, u, g }] segments in source order; u/g mark an underlined/green run.
+// [{ t, u, g, i }] segments in source order; flags mark authored inline runs.
 export function splitUnderline(text) {
   const src = text == null ? '' : String(text);
-  if (!src.includes('[[')) return [{ t: src, u: false, g: false }];
+  if (!src.includes('[[')) return [{ t: src, u: false, g: false, i: false }];
   const parts = [];
   let at = 0;
   INLINE.lastIndex = 0;
   for (let m = INLINE.exec(src); m; m = INLINE.exec(src)) {
-    if (m.index > at) parts.push({ t: src.slice(at, m.index), u: false, g: false });
-    if (m[2]) parts.push({ t: m[2], u: m[1] === 'u', g: m[1] === 'g' });
+    if (m.index > at) parts.push({ t: src.slice(at, m.index), u: false, g: false, i: false });
+    if (m[2]) parts.push({ t: m[2], u: m[1] === 'u', g: m[1] === 'g', i: m[1] === 'i' });
     at = m.index + m[0].length;
   }
-  if (at < src.length) parts.push({ t: src.slice(at), u: false, g: false });
+  if (at < src.length) parts.push({ t: src.slice(at), u: false, g: false, i: false });
   // An unbalanced marker leaves stray text; strip it rather than print it.
-  return parts.map(p => (p.u || p.g ? p : { ...p, t: p.t.replace(ANY_MARKER, '') }));
+  return parts.map(p => (p.u || p.g || p.i ? p : { ...p, t: p.t.replace(ANY_MARKER, '') }));
 }
 
 // ---- Isolated marks in parentheses (5B-SPEC2 B1) ----
diff --git a/buildout/5E-SPEC1-RESULTS-SOL.md b/buildout/5E-SPEC1-RESULTS-SOL.md
new file mode 100644
index 0000000..67a3a2b
--- /dev/null
+++ b/buildout/5E-SPEC1-RESULTS-SOL.md
@@ -0,0 +1,218 @@
+# 5E-SPEC1-RESULTS-SOL.md
+
+## 1. Summary
+
+Implemented the Chapter 4 and Chapter 5 renderer support, data-fidelity
+repairs, responsive drill layouts, and acceptance harness required by
+5E-SPEC1. The machine walk covered all 105 Chapter 1–5 rail stops at both
+widths, produced evidence for every one of the 62 enumerated Chapter 4/5
+pages, found zero horizontal overflow, and the final behavior suite passed
+96/96 checks. Production build, shape, lazy-chunk, offline-route, and
+Chapter 1–3 hash regression checks are green. The important unresolved
+finding is that both supplied PDFs and both delivered chapter files contain
+only 8 and 9 Scripture Memory choices respectively, while the formal spec
+requires 10; I reported the two rows as DIFFERS rather than inventing
+unauthored distractors.
+
+## 2. Scope conformance
+
+| Spec section | Built | Notes |
+| --- | --- | --- |
+| §4.1 paradigm row `label` | Yes | `Paradigm` renders `row.label ?? row.person`, retaining Chapter 3's person rows. |
+| §4.2 `charts[]` + `switch` | Yes | More/Back and named Singular/Plural variants work, retain a live sequential rail, and reset on activity remount. |
+| §4.3 Meanings expander | Yes | Legend, rows, and closing text render through the shared recursive Meanings panel. |
+| §4.4 D-26 two-column exemption | Yes | Explicit `paradigm2col` stays two-up at both widths; D-19 vocabulary pools are 2-up/4-up. |
+| §4.5 `revealButtons` | Yes | Authored Translate/Gender text appears under the reference and clears on item change. Auto-reveal was deliberately not guessed. |
+| §4.6 `spell` promptLabel + ref | Yes | Prompt caption and per-item reference chip render without changing keyboard/checking behavior. |
+| §4.7 chart `note` | Yes | Article and δόξα notes render as chart ink, not banners. |
+| §4.8 smaller data keys (7) | Yes | `lexicalForm`, `showGlosses`, `optionLayout`, `numbered`, `greekRows.layout`, Meanings `legend`/`closing`, and spellVerse audio are supported. The last already existed and needed no new branch. |
+| §5 drill matrix classes | Yes, with one delivered-data conflict | `manualOnIncorrect`, `autoBoth`, and `manual` behavior is asserted. The two Scripture option pools remain 8/9 rather than the formally required 10 because no extra authored choices exist. |
+| §8 tests and evidence | Yes for implementer-owned checks | All machine checks and PDF comparisons are recorded. The real-device airplane-mode walk remains explicitly assigned to Nathanael by §8.7. |
+
+The only support beyond the literal seven renderer bullets was narrowly
+required by §0 visual fidelity or standing contracts: bibliography title
+italics via a small `[[i]]` markup token; resolving topic-ID Hint references;
+mapping `greekTaps: true` from the already-loaded chapter lexicon; suppressing
+a duplicate topic/chart heading; and making `promptFrom.show: "sentence"`
+explicit on the two full-option noun drills that otherwise presented a blank
+prompt. I also corrected the shared D-19 vocabulary-grid rule in both
+directions for Chapters 1–5 because the acceptance contract explicitly
+requires the regression assertion. No audio-store, cache ownership, route,
+font, mark-geometry, or Chapter 6+ code was changed.
+
+## 3. Data edits made under §0
+
+| File | Path in JSON | Before | After | Why |
+| --- | --- | --- | --- | --- |
+| `src/data/chapt-04.json` | `learn[c4_learn_scripture].words[7].greek` | `"δι "` | `"δι᾽"` | Remove extraction-space corruption and restore the elision mark shown in the PDF. |
+| `src/data/chapt-04.json` | `drill[c4_drill_scripture_memory].items[6].greek` | `"δι "` | `"δι᾽"` | Same authored word on the drill surface. |
+| `src/data/chapt-04.json` | `exercise[c4_ex_scripture_speller].answerWords[7]` | `"δι "` | `"δι᾽"` | Keep the whole-verse answer identical to the displayed verse. |
+| `src/data/chapt-04.json` | `quickReview[c4_qr_scripture_b].words[7].greek` | `"δι "` | `"δι᾽"` | Same authored word on Quick Review. |
+| `src/data/chapt-04.json` | `learn[c4_learn_bibliography].content[0].items[0..3]` | Four plain-text book titles | Each title wrapped in `[[i]]…[[/i]]` | The rail walk italicizes the title portion while retaining hanging indents. |
+| `src/data/chapt-04.json` | `drill[c4_drill_greek_noun].promptFrom` | absent | `{ "show": "sentence" }` | The full-option drill's authored sentence must be visible rather than leaving a blank prompt panel. |
+| `src/data/chapt-04.json` | `exercise[c4_ex_vocab_speller].promptLabel` | `"English Meaning"` | `"English Word"` | §4.6's literal caption wins over the PDF wording. |
+| `src/data/chapt-04.json` | `quickReview[c4_qr_vocab].columns` | absent | `2` | Restore the two-column desktop chart from the source frame. |
+| `src/data/chapt-04.json` | `quickReview[c4_qr_vocab].footnote` | absent | `"The number after the translation is the number of times the word occurs in the New Testament."` | Restore the exact NT-frequency explanation shown in the PDF. |
+| `src/data/chapt-05.json` | `learn[c5_learn_bibliography].content[0].items[0..3]` | Four plain-text book titles | Each title wrapped in `[[i]]…[[/i]]` | Restore title emphasis while preserving hanging indents. |
+| `src/data/chapt-05.json` | `drill[c5_drill_first_decl_noun].promptFrom` | absent | `{ "show": "sentence" }` | The authored sentence must be visible on the single-column full-option drill. |
+| `src/data/chapt-05.json` | `exercise[c5_ex_vocab_speller].promptLabel` | `"English Meaning"` | `"English Word"` | Apply §4.6's shared vocabulary-speller caption. |
+| `src/data/chapt-05.json` | `quickReview[c5_qr_vocab].columns` | absent | `2` | Restore the two-column desktop chart from the source frame. |
+| `src/data/chapt-05.json` | `quickReview[c5_qr_vocab].footnote` | absent | `"The number after the translation is the number of times the word occurs in the New Testament."` | Restore the exact NT-frequency explanation shown in the PDF. |
+
+For completeness, the four title strings changed in each bibliography are
+Machen's *New Testament Greek for Beginners*, Mounce's *Basics of Biblical
+Greek: Grammar*, Summers and Sawyer's *Essentials of New Testament Greek*,
+and Wenham's *The Elements of New Testament Greek*. No other generated data
+was edited.
+
+## 4. Visual verification
+
+The complete evidence and per-width filenames are in
+`5E-VISUAL-CHECKLIST-SOL.md`. All **62 of 62** pages were walked and compared:
+**48 MATCH, 12 MATCH-TO-SPEC, 2 DIFFERS, 0 BLOCKED**. MATCH-TO-SPEC is kept
+separate so intentional responsive or standing-contract departures are not
+silently presented as DOS-exact matches.
+
+The two DIFFERS rows share one source/spec conflict:
+
+- Chapter 4 row 20: the PDF and delivered data provide 8 Scripture Memory
+  option tiles, while §2.5 and DRILL-MATRIX require 10. This is an authored
+  data/spec conflict, not a renderer defect; no distractors were fabricated.
+- Chapter 5 row 25: the PDF and delivered data provide 9 option tiles, while
+  §3.4 and DRILL-MATRIX require 10. This is the same authored data/spec
+  conflict.
+
+Every stop and every opened state in the two new chapters measured **0px**
+horizontal overflow at 320px, so there is no unique worst page; all 41 rail
+stops tie at zero. The evidence corpus contains 474 PNGs plus the structured
+walk report, including every topic, expander, alternate chart, Hint modal,
+and first flashcard state.
+
+## 5. Harness changes
+
+`ui:walk` now defaults to Chapters 1–5, steps every topic, opens each authored
+expander and alternate chart, exercises every topic-ID Hint modal, advances
+flashcards to a real first card, records structural/emphasis/tap evidence,
+and takes both base and state screenshots. It measures document, card, and
+structural overflow at 320px, validates rail cardinality/live Next actions,
+and records interaction and console errors in `walk-report.json`.
+
+`ui:behavior` retains the Chapter 1–3 A4/A6 spelling, caret, reset, timing,
+letter-grid, divider, and objective checks, then adds More/Back and named
+toggle transitions, live sequential Next assertions, route-remount resets,
+Translate/Gender placement and clearing, new-chapter advance timing, and
+D-19/D-26 grid checks. The D-19 assertion deliberately covers both vocabulary
+directions in all five chapters. Browser launch fallback is shared by both
+harnesses so the scripts use pinned Playwright Chromium when available and
+installed Chrome/Edge otherwise.
+
+`check-content-shapes` now validates all five chapter files and the newly
+used content/paradigm shapes. `check-lazy-chunk` now requires separate Chapter
+4/5 data and lexicon chunks in addition to the unchanged Chapter 1–3
+assertions.
+
+## 6. Test results
+
+| Check | Result |
+| --- | --- |
+| `ui:walk` chapters 1-5 | PASS: 105 stops × 2 widths; 124 width-specific checklist shots for 62 pages; 41 Chapter 4/5 overflow records all 0px; 0 rail, interaction, or console errors. |
+| `ui:behavior` chapters 1-5 | PASS: 96/96 real-UI checks. Ch4 timing 2061ms/4077ms and ch5 timing 2048ms/4061ms for correct/incorrect examples. |
+| `check:shapes` | PASS: Chapters 1–5; content modes, paradigm rows/columns, spellVerse words, audio-mode branches, mark geometry, and shared keyboard typeability. |
+| `check:lazy-chunk` | PASS: all five chapter/lexicon pairs emitted and precached; chapter data absent from the main bundle. |
+| chapt-01/02/03 chunk hashes unchanged | PASS: `8ZoFoXk9`, `CFgjCaAb`, `CPP2o90H`; lexicons `DWCL8L3K`, `DMecEUSp`, `DU3wQSch`. |
+| precache entry count / size delta | Final 27 entries / 678.64 KiB. Against closed 5D2: +4 entries / +117.04 KiB. Against this run's initial current-data build (27 / 660.89 KiB): +0 / +17.75 KiB. |
+| production build | PASS: 86 modules; only the pre-existing `DivideActivity.svelte` noninteractive-tabIndex warning. |
+| browser offline smoke | PASS: service worker controlled; uncached fetch rejected; Chapter 4 and Chapter 5 activity routes loaded offline; Chapter 5 reloaded offline. |
+| `git diff --check` | PASS; only Git's informational LF-to-CRLF working-copy warnings. |
+
+No implementer-owned machine test was skipped. The §8.7 physical-device
+airplane-mode walk was not run because the spec explicitly assigns it to
+Nathanael; the browser offline smoke above is supplementary, not a claim to
+have completed that device check.
+
+## 7. Surprises
+
+The formal ten-choice Scripture rule conflicts with both rail walks and both
+delivered data files. Adding one or two arbitrary translations would have
+made the numeric test green while reducing source fidelity, so the delivered
+pools were left intact and surfaced plainly.
+
+Several delivered shapes were more capable than the pre-5E renderer:
+`greekTaps: true` had no chapter-lexicon resolution path, all three `hintRef`
+values were topic IDs while the old resolver only found top-level blocks,
+and paradigm data already used `columnAudio`, `columnGroups`, and
+`sayWholeEach`. Those are now consumed without a cache/store scan or another
+audio-byte owner. Conversely, §4.8's spellVerse `audio` item was unnecessary:
+the shared spellVerse/audio path already supported it, so no duplicate branch
+was added.
+
+Visual comparison found data details that shape checks could not: plain
+bibliography titles needed selective italics, the vocabulary Quick Reviews
+were missing the frequency sentence and desktop column intent, and the two
+full-option noun drills had no explicit sentence prompt selector. It also
+confirmed the original's label inconsistency: γραφή uses `Nom.\Voc.`, ὥρα
+uses `Nom./Voc.`, and the delivered/PDF δόξα chart omits the final period as
+`Nom./Voc`, despite nearby prose implying both Alpha charts use the same
+punctuation.
+
+The flashcard rail frames begin on a lemma, while the ratified shared app
+contract begins on an instructional state. The walker now captures the first
+real card as additional evidence and records those rows as MATCH-TO-SPEC
+rather than changing the shared behavior.
+
+## 8. What you did NOT verify
+
+I did not listen to audio bytes. The preview proves control wiring and leaves
+the frozen audio ownership architecture untouched, but phonetic correctness,
+real WebKit playback, cumulative-pack availability, interruption, and
+audio-stop-on-exit still need a device/listening pass. I did not perform the
+physical-device airplane-mode walk assigned by §8.7; only a controlled Chrome
+offline smoke was executed.
+
+The PDF comparison is a rendered side-by-side visual audit, not a pixel-diff
+claim: randomized drills can show a different item while their arrangement
+and controls are compared. Every authored item is shape-validated, but every
+random item was not individually screenshotted. Readability/discoverability
+questions (More/Back, seven-topic rails, and duplicated English Concepts)
+remain human judgements. The original's automatic reveal timing could not be
+settled from still images and was intentionally left button-driven as §4.5
+directs.
+
+## 9. Open items for VERIFY-5E
+
+Do not create VERIFY-5E until grading selects the winning implementation.
+The judgement list for that later pass is:
+
+1. Decide whether the delivered 8/9-choice Scripture pools should remain
+   source-faithful or receive specifically authored distractors to satisfy
+   the formal 10-choice rule.
+2. Does More/Back clearly communicate a second chart while the sequential
+   rail remains live?
+3. Does the article Singular/Plural toggle read correctly when its label names
+   the chart not currently shown?
+4. Should the Declining Noun translation reveal automatically after an
+   answer in the original, or remain explicitly button-driven?
+5. Do the seven-topic Learn pages read comfortably at phone width?
+6. Is Chapter 5's near-duplicate English Concepts sequence acceptable on a
+   device, given the original's “proceed with haste” line?
+7. Perform the real WebKit/audio pass: paradigm cells, Say Whole List clips,
+   cumulative Scripture clips, interruption, and audio stop on exit.
+8. Perform the physical-device airplane-mode walk of both chapters.
+9. Chapter 4 Greek Noun Drill item 3 (Mat 5:24): the shipped underline is
+   `brother`; the run table said `to`. Confirm against DOSBox.
+10. Listen-check Chapter 4 `d_sm6` / `d_sm6b` / `d_sm7` for the εἰ / μὴ /
+    “εἰ μὴ” assignment.
+11. Listen-check Chapter 5 `e_graphn`, which is doubled across γραφή and
+    γραφῇ; `e_grapax` and `e_aleia` remain unreferenced.
+12. Chapter 5 `e_artmas` / `e_artfem` / `e_artneu` / `e_artpar` have no
+    surface in the rail walk or this build; decide whether that is intentional.
+13. Chapter 4 `d_adepar` still has no surface.
+
+## 10. Cost and time
+
+| | |
+| --- | --- |
+| Wall-clock | Approximately 1 hour 45 minutes, 2026-08-03 20:30–22:15 EDT |
+| Model / tooling | Codex GPT-5.6 Sol; PowerShell, Node.js, Vite, Svelte, Playwright/Chrome; three parallel read-only implementation/PDF audits after bounded initial edits |
+| Approximate cost | Not exposed by the runtime |
+| Turns / sessions | One continuous implementation session |
diff --git a/buildout/5E-VISUAL-CHECKLIST-SOL.md b/buildout/5E-VISUAL-CHECKLIST-SOL.md
new file mode 100644
index 0000000..999072e
--- /dev/null
+++ b/buildout/5E-VISUAL-CHECKLIST-SOL.md
@@ -0,0 +1,102 @@
+# 5E-VISUAL-CHECKLIST-SOL.md — page-by-page comparison, chapters 4 and 5
+
+Method: each row was rendered in Chrome at 320px and 768px by
+`scripts/ui-walk.mjs`, then compared side by side with the corresponding
+frame in `ch4railwalk.pdf` or `ch5railwalk.pdf`. Paths below are relative to
+`buildout/screenshots/5e-spec1-sol/`. Extra expander, second-chart, hint, and
+first-card captures live beside the named base captures. `MATCH-TO-SPEC`
+records an intentional standing-contract or responsive difference where the
+controlling spec wins over the DOS presentation.
+
+## Chapter 4 — Second Declension Nouns (27 pages)
+
+| # | Page | What to look at | 320 | 768 | Shot | Notes |
+| --- | --- | --- | --- | --- | --- | --- |
+| 1 | Learn Chapter Objectives | 5 objectives | MATCH | MATCH | `320/chapt_4/c4_learn_objectives.png`<br>`768/chapt_4/c4_learn_objectives.png` | Five decimal-numbered objectives. |
+| 2 | Learn English Concepts / Introduction | prose | MATCH | MATCH | `320/chapt_4/c4_learn_english_concepts--topic1.png`<br>`768/chapt_4/c4_learn_english_concepts--topic1.png` | Prose and emphasis agree. |
+| 3 | Learn English Concepts / Gender | prose | MATCH | MATCH | `320/chapt_4/c4_learn_english_concepts--topic2.png`<br>`768/chapt_4/c4_learn_english_concepts--topic2.png` | Examples, glosses, and Greek tap targets agree. |
+| 4 | Learn English Concepts / Number | prose | MATCH | MATCH | `320/chapt_4/c4_learn_english_concepts--topic3.png`<br>`768/chapt_4/c4_learn_english_concepts--topic3.png` | Singular/plural arrangement agrees. |
+| 5 | Learn English Concepts / Case | 3 popups | MATCH | MATCH | `320/chapt_4/c4_learn_english_concepts--topic4.png`<br>`768/chapt_4/c4_learn_english_concepts--topic4.png` | All three `--expander*` states were also captured and compared. |
+| 6 | Learn Greek Nouns: Second Declension / Introduction | 2 popups | MATCH | MATCH | `320/chapt_4/c4_learn_nouns--topic1.png`<br>`768/chapt_4/c4_learn_nouns--topic1.png` | Both `--expander*` states agree. |
+| 7 | Learn Greek Nouns: Second Declension / Gender | prose | MATCH | MATCH | `320/chapt_4/c4_learn_nouns--topic2.png`<br>`768/chapt_4/c4_learn_nouns--topic2.png` | Text and Greek examples agree. |
+| 8 | Learn Greek Nouns: Second Declension / Number and Agreement | prose | MATCH | MATCH | `320/chapt_4/c4_learn_nouns--topic3.png`<br>`768/chapt_4/c4_learn_nouns--topic3.png` | Text and arrangement agree. |
+| 9 | Learn Greek Nouns: Second Declension / Inflectional Forms | 5 popups | MATCH | MATCH | `320/chapt_4/c4_learn_nouns--topic4.png`<br>`768/chapt_4/c4_learn_nouns--topic4.png` | All five `--expander*` states agree and remain readable at 320px. |
+| 10 | Learn Greek Nouns: Second Declension / Masculine Declension | 2 charts + switch | MATCH | MATCH | `320/chapt_4/c4_learn_nouns--topic5.png`<br>`768/chapt_4/c4_learn_nouns--topic5.png` | λόγος/ἄνθρωπος lemma glosses, More/Back, Meanings, and the `--chart2-state*` captures agree. |
+| 11 | Learn Greek Nouns: Second Declension / Neuter Declension | chart + Meanings | MATCH | MATCH | `320/chapt_4/c4_learn_nouns--topic6.png`<br>`768/chapt_4/c4_learn_nouns--topic6.png` | Four-row ἱερόν chart, identifying gloss, and Meanings agree. |
+| 12 | Learn Greek Nouns: Second Declension / Word Order | prose | MATCH | MATCH | `320/chapt_4/c4_learn_nouns--topic7.png`<br>`768/chapt_4/c4_learn_nouns--topic7.png` | Prose agrees. |
+| 13 | Learn Vocabulary | 10 lemmas | MATCH-TO-SPEC | MATCH-TO-SPEC | `320/chapt_4/c4_learn_vocab--first-card.png`<br>`768/chapt_4/c4_learn_vocab--first-card.png` | Shared flashcard contract begins with instructions; the explicit first-card captures prove the citation form and gloss. |
+| 14 | Learn Scripture Memory | 9 words | MATCH | MATCH | `320/chapt_4/c4_learn_scripture.png`<br>`768/chapt_4/c4_learn_scripture.png` | John 14:6b interlinear and controls agree. |
+| 15 | Learn Bibliography | 4 entries | MATCH | MATCH | `320/chapt_4/c4_learn_bibliography.png`<br>`768/chapt_4/c4_learn_bibliography.png` | Four entries, hanging indents, and italic titles agree. |
+| 16 | Greek Noun Drill | 22 items | MATCH | MATCH | `320/chapt_4/c4_drill_greek_noun.png`<br>`768/chapt_4/c4_drill_greek_noun.png` | Sentence/ref, 5×2 paradigm grid, controls, score, and Hint state agree; shuffled item may differ. |
+| 17 | Declining Noun Drill | 28 items | MATCH | MATCH | `320/chapt_4/c4_drill_declining.png`<br>`768/chapt_4/c4_drill_declining.png` | 5×2 case/number choices, Translate control, score, and Hint agree; shuffled item may differ. |
+| 18 | Vocabulary: Greek to English Drill | pool from lexicon | MATCH-TO-SPEC | MATCH-TO-SPEC | `320/chapt_4/c4_drill_vocab_gk_en.png`<br>`768/chapt_4/c4_drill_vocab_gk_en.png` | D-19: two-up below 768px and four-up at 768px; words do not split. |
+| 19 | Vocabulary: English to Greek Drill | pool from lexicon | MATCH-TO-SPEC | MATCH-TO-SPEC | `320/chapt_4/c4_drill_vocab_en_gk.png`<br>`768/chapt_4/c4_drill_vocab_en_gk.png` | D-19 responsive arrangement applies in both vocabulary directions. |
+| 20 | Scripture Memory Drill | 8 items | DIFFERS | DIFFERS | `320/chapt_4/c4_drill_scripture_memory.png`<br>`768/chapt_4/c4_drill_scripture_memory.png` | Delivered data and PDF show 8 option tiles, while 5E-SPEC1 §2.5 and DRILL-MATRIX require 10. No unauthored distractors were invented. |
+| 21 | Second Declension Noun Spelling Exercise | 20 items | MATCH | MATCH | `320/chapt_4/c4_ex_noun_speller.png`<br>`768/chapt_4/c4_ex_noun_speller.png` | English Word prompt, Greek input, keyboard, and controls agree. |
+| 22 | Vocabulary Spelling Exercise | 10 items | MATCH-TO-SPEC | MATCH-TO-SPEC | `320/chapt_4/c4_ex_vocab_speller.png`<br>`768/chapt_4/c4_ex_vocab_speller.png` | §4.6 requires “English Word”; the PDF says “English Meaning.” |
+| 23 | Scripture Memory Spelling Exercise | whole verse | MATCH-TO-SPEC | MATCH-TO-SPEC | `320/chapt_4/c4_ex_scripture_speller.png`<br>`768/chapt_4/c4_ex_scripture_speller.png` | Whole-verse field follows the registered spellVerse contract; Major Hint remains button-driven under D-11. |
+| 24 | Review Vocabulary Chart | 10 lemmas + NT freq | MATCH-TO-SPEC | MATCH | `320/chapt_4/c4_qr_vocab.png`<br>`768/chapt_4/c4_qr_vocab.png` | Exact NT-frequency footnote restored; one readable phone column reflows to the PDF's two 5-row columns at 768px. |
+| 25 | Review Nouns: Second Declension | chart, glosses inline | MATCH | MATCH | `320/chapt_4/c4_qr_nouns.png`<br>`768/chapt_4/c4_qr_nouns.png` | Singular/plural chart, inline glosses, and Say Whole Paradigm agree. |
+| 26 | Review Scripture Memory: Jn 14:6a | 14 words | MATCH | MATCH | `320/chapt_4/c4_qr_scripture_a.png`<br>`768/chapt_4/c4_qr_scripture_a.png` | Cumulative John 14:6a review agrees. |
+| 27 | Review Scripture Memory: Jn 14:6b | 9 words | MATCH | MATCH | `320/chapt_4/c4_qr_scripture_b.png`<br>`768/chapt_4/c4_qr_scripture_b.png` | John 14:6b review agrees. |
+
+## Chapter 5 — First Declension Nouns (35 pages)
+
+| # | Page | What to look at | 320 | 768 | Shot | Notes |
+| --- | --- | --- | --- | --- | --- | --- |
+| 1 | Learn Chapter Objectives | 5 objectives | MATCH | MATCH | `320/chapt_5/c5_learn_objectives.png`<br>`768/chapt_5/c5_learn_objectives.png` | Five decimal-numbered objectives. |
+| 2 | Learn English Concepts / Introduction | prose | MATCH | MATCH | `320/chapt_5/c5_learn_english_concepts--topic1.png`<br>`768/chapt_5/c5_learn_english_concepts--topic1.png` | Prose and “proceed with haste” paragraph agree. |
+| 3 | Learn English Concepts / Gender | prose | MATCH | MATCH | `320/chapt_5/c5_learn_english_concepts--topic2.png`<br>`768/chapt_5/c5_learn_english_concepts--topic2.png` | Prose and examples agree. |
+| 4 | Learn English Concepts / Number | prose | MATCH | MATCH | `320/chapt_5/c5_learn_english_concepts--topic3.png`<br>`768/chapt_5/c5_learn_english_concepts--topic3.png` | Singular/plural arrangement agrees. |
+| 5 | Learn English Concepts / Case | 3 popups | MATCH | MATCH | `320/chapt_5/c5_learn_english_concepts--topic4.png`<br>`768/chapt_5/c5_learn_english_concepts--topic4.png` | All three `--expander*` states agree. |
+| 6 | Learn English Concepts / Definite Article | prose | MATCH | MATCH | `320/chapt_5/c5_learn_english_concepts--topic5.png`<br>`768/chapt_5/c5_learn_english_concepts--topic5.png` | Prose agrees. |
+| 7 | Learn Greek Nouns: 1st Declension / Introduction | 2 popups | MATCH | MATCH | `320/chapt_5/c5_learn_nouns--topic1.png`<br>`768/chapt_5/c5_learn_nouns--topic1.png` | Both `--expander*` states agree. |
+| 8 | Learn Greek Nouns: 1st Declension / Gender | prose | MATCH | MATCH | `320/chapt_5/c5_learn_nouns--topic2.png`<br>`768/chapt_5/c5_learn_nouns--topic2.png` | Text and Greek examples agree. |
+| 9 | Learn Greek Nouns: 1st Declension / Number and Agreement | prose | MATCH | MATCH | `320/chapt_5/c5_learn_nouns--topic3.png`<br>`768/chapt_5/c5_learn_nouns--topic3.png` | Text and examples agree. |
+| 10 | Learn Greek Nouns: 1st Declension / Inflectional Forms | 5 popups | MATCH | MATCH | `320/chapt_5/c5_learn_nouns--topic4.png`<br>`768/chapt_5/c5_learn_nouns--topic4.png` | All five `--expander*` states agree and remain readable. |
+| 11 | Learn Greek Nouns: 1st Declension / First Declension--Eta | chart + Meanings | MATCH | MATCH | `320/chapt_5/c5_learn_nouns--topic5.png`<br>`768/chapt_5/c5_learn_nouns--topic5.png` | `Nom.\Voc.`, lemma gloss, four-row chart, and Meanings agree. |
+| 12 | Learn Greek Nouns: 1st Declension / First Declension--Alpha | 2 charts + switch | MATCH | MATCH | `320/chapt_5/c5_learn_nouns--topic6.png`<br>`768/chapt_5/c5_learn_nouns--topic6.png` | Both charts, More/Back, lemma glosses, δόξα note, and `--chart2-state*` captures agree. |
+| 13 | Learn Greek Nouns: 1st Declension / First Declension--Masc | chart + Meanings | MATCH | MATCH | `320/chapt_5/c5_learn_nouns--topic7.png`<br>`768/chapt_5/c5_learn_nouns--topic7.png` | One heading, lemma gloss, five rows, and Meanings agree. |
+| 14 | Learn Definite Article / Introduction | prose | MATCH | MATCH | `320/chapt_5/c5_learn_article--topic1.png`<br>`768/chapt_5/c5_learn_article--topic1.png` | Prose agrees. |
+| 15 | Learn Definite Article / Examples | prose | MATCH | MATCH | `320/chapt_5/c5_learn_article--topic2.png`<br>`768/chapt_5/c5_learn_article--topic2.png` | Four Greek rows, parsing labels, and references agree. |
+| 16 | Learn Definite Article / Definite Article Paradigm | 2 charts + switch | MATCH | MATCH | `320/chapt_5/c5_learn_article--topic3.png`<br>`768/chapt_5/c5_learn_article--topic3.png` | Singular/plural charts, notes, and the target-naming toggle agree; plural state captured as `--chart2-plural`. |
+| 17 | Learn Vocabulary | 10 lemmas | MATCH-TO-SPEC | MATCH-TO-SPEC | `320/chapt_5/c5_learn_vocab--first-card.png`<br>`768/chapt_5/c5_learn_vocab--first-card.png` | Shared flashcard contract begins with instructions; first-card captures prove lexical form and gloss. |
+| 18 | Learn Scripture Memory | 9 words | MATCH | MATCH | `320/chapt_5/c5_learn_scripture.png`<br>`768/chapt_5/c5_learn_scripture.png` | Romans 3:23 interlinear and controls agree. |
+| 19 | Learn Bibliography | 4 entries | MATCH | MATCH | `320/chapt_5/c5_learn_bibliography.png`<br>`768/chapt_5/c5_learn_bibliography.png` | Four entries, hanging indents, and italic titles agree. |
+| 20 | First Declension Noun Drill | 20 items | MATCH | MATCH | `320/chapt_5/c5_drill_first_decl_noun.png`<br>`768/chapt_5/c5_drill_first_decl_noun.png` | Four-option single-column layout, sentence/ref, controls, score, and Hint agree. |
+| 21 | Declining Noun Drill | 25 items | MATCH | MATCH | `320/chapt_5/c5_drill_declining.png`<br>`768/chapt_5/c5_drill_declining.png` | 5×2 choices and Translate control agree. |
+| 22 | Definite Article Drill | 24 items | MATCH | MATCH | `320/chapt_5/c5_drill_article.png`<br>`768/chapt_5/c5_drill_article.png` | 4×2 layout and Gender control agree. |
+| 23 | Vocabulary: Greek to English Drill | pool from lexicon | MATCH-TO-SPEC | MATCH-TO-SPEC | `320/chapt_5/c5_drill_vocab_gk_en.png`<br>`768/chapt_5/c5_drill_vocab_gk_en.png` | D-19: two-up below 768px and four-up at 768px; words do not split. |
+| 24 | Vocabulary: English to Greek Drill | pool from lexicon | MATCH-TO-SPEC | MATCH-TO-SPEC | `320/chapt_5/c5_drill_vocab_en_gk.png`<br>`768/chapt_5/c5_drill_vocab_en_gk.png` | D-19 responsive arrangement applies in both directions. |
+| 25 | Scripture Memory Drill | 9 items | DIFFERS | DIFFERS | `320/chapt_5/c5_drill_scripture_memory.png`<br>`768/chapt_5/c5_drill_scripture_memory.png` | Delivered data and PDF show 9 option tiles, while 5E-SPEC1 §3.4 and DRILL-MATRIX require 10. No unauthored distractor was invented. |
+| 26 | First Declension Noun Spelling Exercise | 24 items | MATCH | MATCH | `320/chapt_5/c5_ex_noun_speller.png`<br>`768/chapt_5/c5_ex_noun_speller.png` | Prompt, field, keyboard, and controls agree. |
+| 27 | Definite Article Spelling Exercise | 22 items | MATCH | MATCH | `320/chapt_5/c5_ex_article_speller.png`<br>`768/chapt_5/c5_ex_article_speller.png` | Parsing-label prompt and inline reference chip agree. |
+| 28 | Vocabulary Spelling Exercise | 10 items | MATCH-TO-SPEC | MATCH-TO-SPEC | `320/chapt_5/c5_ex_vocab_speller.png`<br>`768/chapt_5/c5_ex_vocab_speller.png` | §4.6 requires the shared “English Word” prompt label. |
+| 29 | Scripture Memory Spelling Exercise | whole verse | MATCH-TO-SPEC | MATCH-TO-SPEC | `320/chapt_5/c5_ex_scripture_speller.png`<br>`768/chapt_5/c5_ex_scripture_speller.png` | Whole-verse field follows the registered spellVerse contract and D-11/D-12/D-13. |
+| 30 | Review Vocabulary Chart | 10 lemmas + NT freq | MATCH-TO-SPEC | MATCH | `320/chapt_5/c5_qr_vocab.png`<br>`768/chapt_5/c5_qr_vocab.png` | Exact NT-frequency footnote restored; one readable phone column reflows to the PDF's two 5-row columns at 768px. |
+| 31 | Review Nouns: First Declension | chart, glosses inline | MATCH | MATCH | `320/chapt_5/c5_qr_nouns.png`<br>`768/chapt_5/c5_qr_nouns.png` | Five-row singular/plural chart and inline glosses agree. |
+| 32 | Review Definite Article | chart, glosses inline | MATCH | MATCH | `320/chapt_5/c5_qr_article.png`<br>`768/chapt_5/c5_qr_article.png` | The PDF and §3.5 use one six-column Greek paradigm with paired audio controls; the checklist's “glosses inline” shorthand is not present in the source frame. |
+| 33 | Review Scripture Memory: Jn 14:6a | 14 words | MATCH | MATCH | `320/chapt_5/c5_qr_scripture_146a.png`<br>`768/chapt_5/c5_qr_scripture_146a.png` | Cumulative John 14:6a review agrees. |
+| 34 | Review Scripture Memory: Jn 14:6b | 9 words | MATCH | MATCH | `320/chapt_5/c5_qr_scripture_146b.png`<br>`768/chapt_5/c5_qr_scripture_146b.png` | Cumulative John 14:6b review agrees. |
+| 35 | Review Scripture Memory: Rom 3:23 | 9 words | MATCH | MATCH | `320/chapt_5/c5_qr_scripture_rom.png`<br>`768/chapt_5/c5_qr_scripture_rom.png` | Romans 3:23 review agrees. |
+
+## Cross-cutting rows
+
+| # | Check | Verdict | Evidence |
+| --- | --- | --- | --- |
+| X1 | Horizontal overflow measured on EVERY stop at 320px, both chapters. Report the worst number. | PASS | `walk-report.json`: 41 new-chapter stops and all captured states measured; worst overrun 0px. |
+| X2 | More/Back switch works on all three surfaces (ch4 Masculine, ch5 Alpha, ch5 Article) and the sequential rail stays live behind it | PASS | `ui:behavior`: chart 1/2 transitions and live sequential Next asserted on all three surfaces. |
+| X3 | Singular/Plural toggle names the chart you are NOT on | PASS | `ui:behavior`: Singular offers Plural, Plural offers Singular, and restoration asserted. |
+| X4 | Translate reveal (both Declining drills) and Gender reveal (ch5 Article drill) print under the reference and clear on item change | PASS | `ui:behavior`: all three begin hidden, reveal authored text after the ref, and clear on Next. |
+| X5 | Revisit-resets-item on one drill per chapter | PASS | `ui:behavior`: ch4 Greek Noun and ch5 First Declension Noun reset marks/feedback while retaining score. |
+| X6 | Advance timing measured through the UI: 2000ms correct / 4000ms incorrect, one manualOnIncorrect and one autoBoth surface per chapter | PASS | Ch4: 2061ms / 4077ms. Ch5: 2048ms / 4061ms. Intermediate non-advance checks also passed. |
+| X7 | Chapters 1, 2, 3 still green on ui:walk and ui:behavior | PASS | Walk covered all 105 stops; behavior retained A4/A6, caret, reset, timing, D-19, D-26, letter-grid, divider, and objective assertions. |
+| X8 | chapt-01 / chapt-02 / chapt-03 chunk hashes UNCHANGED | PASS | `8ZoFoXk9`, `CFgjCaAb`, `CPP2o90H`; lexicon hashes `DWCL8L3K`, `DMecEUSp`, `DU3wQSch`, all identical to baseline. |
+| X9 | check:shapes and check:lazy-chunk green; precache entry count and size delta reported | PASS | Both pass. Final 27 entries / 678.64 KiB: +4 / +117.04 KiB from 5D2, and +0 / +17.75 KiB from this implementation's first baseline build. |
+| X10 | Paradigm-shaped option grids stay TWO columns at 768px (D-26), while vocabulary grids go four-up (D-19) | PASS | `ui:behavior` asserts 8 paradigm width cases and all 20 chapter/direction vocabulary width cases. |
+| X11 | Every data edit made under §0 is listed in RESULTS with before/after | PASS | See `5E-SPEC1-RESULTS-SOL.md` §3. |
+
+Page summary: **48 MATCH, 12 MATCH-TO-SPEC, 2 DIFFERS, 0 BLOCKED**
+across all 62 enumerated pages. At 320px the width-specific total is
+48 MATCH / 12 MATCH-TO-SPEC / 2 DIFFERS; at 768px it is
+50 MATCH / 10 MATCH-TO-SPEC / 2 DIFFERS.
````

Final untracked inventory, with the three exclusions above visible rather
than silent:

```text
?? buildout/5E-SPEC1-BUILD-SOL.md
?? buildout/5E-SPEC1-RESULTS-SOL.md
?? buildout/5E-VISUAL-CHECKLIST-SOL.md
?? buildout/screenshots/5e-spec1-sol/
```

## 3. Files touched

| File | Added / Modified / Deleted | Lines +/- | Why |
| --- | --- | --- | --- |
| `scripts/check-content-shapes.mjs` | Modified | +163 / -15 | Validate Chapter 4/5 content, paradigms, audio modes, markup shapes, and keyboard-typeable answers. |
| `scripts/check-lazy-chunk.mjs` | Modified | +3 / -1 | Require Chapter 4/5 chapter and lexicon chunks while retaining Chapter 1–3 checks. |
| `scripts/ui-behavior.mjs` | Modified | +237 / -7 | Add 5E chart, reveal, reset, timing, and D-19/D-26 real-UI assertions. |
| `scripts/ui-walk.mjs` | Modified | +294 / -40 | Walk five chapters/two widths, capture every topic/state, measure overflow, and emit structured evidence. |
| `src/app.css` | Modified | +71 / -7 | Responsive paradigms, Greek-row layouts, speller refs, bibliography/review layout, and exact option-grid rules. |
| `src/components/ContentAudio.svelte` | Modified | +10 / -4 | Resolve chapter Greek taps and render responsive two-column review vocabulary. |
| `src/components/Marked.svelte` | Modified | +4 / -4 | Render the narrow inline-emphasis token used by bibliography titles. |
| `src/components/Paradigm.svelte` | Modified | +182 / -55 | Case labels, multiple charts, switches, Meanings, notes, grouped audio, gloss policy, and remount-safe local state. |
| `src/components/RichContent.svelte` | Modified | +17 / -3 | Unnumbered lists, Greek-row layouts, and duplicate topic/chart heading suppression. |
| `src/components/SelectActivity.svelte` | Modified | +55 / -27 | Generic authored reveals, topic Hint resolution output, explicit option layouts, and D-19 vocabulary grids. |
| `src/components/SpellActivity.svelte` | Modified | +8 / -4 | Optional prompt captions and per-item reference chips. |
| `src/data/chapt-04.json` | Modified | +14 / -9 | §0 fidelity repairs: elision, title italics, sentence prompt, label, and review columns/footnote. |
| `src/data/chapt-05.json` | Modified | +10 / -5 | §0 fidelity repairs: title italics, sentence prompt, label, and review columns/footnote. |
| `src/lib/content.js` | Modified | +50 / -2 | Loaded-lexicon Greek-tap map, lexical forms, generic reveals/layout, and recursive topic Hint lookup. |
| `src/lib/markup.js` | Modified | +11 / -10 | Preserve/strip the inline italics marker on the correct output surfaces. |
| `buildout/5E-SPEC1-RESULTS-SOL.md` | Added | +218 / -0 | Required result narrative, data ledger, evidence, and open judgement items. |
| `buildout/5E-VISUAL-CHECKLIST-SOL.md` | Added | +102 / -0 | Required 62-row, two-width PDF comparison plus cross-cutting evidence. |
| `buildout/5E-SPEC1-BUILD-SOL.md` | Added | generated | Required audit record and complete embedded diff; excluded from its own diff only. |
| `buildout/screenshots/5e-spec1-sol/320/` | Added | 237 PNGs | 320px base and interactive-state evidence for all five chapters. |
| `buildout/screenshots/5e-spec1-sol/768/` | Added | 237 PNGs | 768px base and interactive-state evidence for all five chapters. |
| `buildout/screenshots/5e-spec1-sol/walk-report.json` | Added | generated, 1 file | Structured 105-stop report, 124 checklist captures, overflow values, and error arrays. |

## 4. Work log

| # | Step | Tool / command | Outcome |
| --- | --- | --- | --- |
| 1 | Read the repository memory, active spec, extraction map, drill matrix, and all 5E handoff templates in full. | `Get-Content buildout/ONBOARD-SOL.md`, `5E-SPEC1.md`, linked files | Established scope, precedence, frozen architecture, and required evidence before editing. |
| 2 | Confirmed the starting tree and base. | `git status --short`; `git rev-parse HEAD` | Clean tree at `6fde770c…`; no user changes to preserve. |
| 3 | Built the unmodified delivered Chapter 4/5 tree and recorded chunks/precache. | `npm.cmd run build` | PASS; 27 entries / 660.89 KiB. Chapter 1–3 hashes recorded. PowerShell blocked bare `npm`, so all later npm calls use `npm.cmd`. |
| 4 | Split bounded renderer, data, PDF/harness audits while reviewing the same scope locally. | parallel subagents plus read-only source/PDF inspection | Located unsupported chart/reveal/layout keys, PDF mapping, data anomalies, and test gaps without widening scope. |
| 5 | Added the shared paradigm, content, select, spell, and markup support. | `apply_patch` | Implemented §4.1–§4.8 contracts surgically; retained activity remount and existing audio ownership. |
| 6 | Made only PDF/spec-authorized Chapter 4/5 data repairs. | `apply_patch` | Restored elision, bibliography emphasis, prompt captions/sentences, and vocabulary-review formatting. Did not invent Scripture distractors. |
| 7 | Extended shape, lazy, behavior, and walk harnesses. | `apply_patch` | Added Chapters 4/5 and preserved named Chapter 1–3 assertions. |
| 8 | Ran initial walk/behavior probes. | `node scripts/ui-walk.mjs`; `node scripts/ui-behavior.mjs` | Exposed stale/missing lemma glosses, duplicate Masc heading, narrow word splitting, bibliography emphasis, Quick Review columns/footnotes, and Hint topic resolution. |
| 9 | Corrected those rendered-fidelity defects and strengthened capture states. | `apply_patch` | Added first-card, chart-2, Meanings, expander, and Hint evidence; phone overflow returned to zero. |
| 10 | Rebuilt and ran the full acceptance harness. | `npm.cmd run build`; `npm.cmd run ui:walk`; `npm.cmd run ui:behavior` | Walk PASS (105×2); behavior PASS (96/96); 474 PNGs and report regenerated from current source. |
| 11 | Corrected one command-name dead end. | `npm.cmd run check:content-shapes` then `npm.cmd run check:shapes` | First command failed because that package script does not exist; correct script passed. |
| 12 | Ran final shape, production, lazy, hash, and whitespace checks. | commands in §5 | All passed; only the pre-existing DivideActivity a11y warning and informational line-ending warnings remain. |
| 13 | Exercised the final production PWA offline in a real browser. | Playwright `context.setOffline(true)` | SW controlled, uncached network rejected, both new chapter activity routes loaded, and Chapter 5 reloaded offline. A first probe mistakenly waited for `.card` on a chapter hub; rerunning against activity routes passed. |
| 14 | Compared every enumerated page to both supplied rail-walk PDFs and reconciled independent audits. | screenshot/PDF side-by-side inspection | 48 MATCH, 12 MATCH-TO-SPEC, 2 DIFFERS, 0 BLOCKED. The two differences are the single 8/9-vs-10 authored-option conflict. |
| 15 | Wrote the required checklist, RESULTS, and this BUILD record. | `apply_patch`; final `git diff --check` | Complete evidence and data ledger present; no VERIFY-5E, commit, or push created. |

## 5. Commands run and their output

### `ui:walk` chapters 1–5

Command:

```powershell
node scripts/ui-walk.mjs --port=4174 --chapters=chapt_1,chapt_2,chapt_3,chapt_4,chapt_5 --out=buildout/screenshots/5e-spec1-sol
```

Output below trims only the 41 repetitive per-stop `0px` lines between the
shown head and tail; the full values are in `walk-report.json`.

```text
walked 105 stops x 2 widths -> buildout/screenshots/5e-spec1-sol
checklist evidence: 124 width-specific shots (62 pages x 2 expected)
320px overflow by new-chapter rail stop:
 chapt_4/c4_learn_objectives: 0px
 chapt_4/c4_learn_english_concepts: 0px
 [... 37 further new-chapter stop lines, each exactly 0px ...]
 chapt_5/c5_qr_scripture_rom: 0px
 chapt_5/c5_learn_bibliography: 0px
no horizontal overflow in chapters 4 or 5
all rail counts and Next actions are live
all authored expanders and chart states opened
no console errors
```

### `ui:behavior` chapters 1–5

Command:

```powershell
$env:BASE='http://127.0.0.1:4174'
npm.cmd run ui:behavior
```

Output trims routine PASS lines but retains the original head, every new
behavior family, regression tail, and total.

```text
> greek-tutor@0.1.0 ui:behavior
> node scripts/ui-behavior.mjs

PASS  A4/1 λύουσι, no accents, accents OFF  — "λυουσι" for "they loose"
PASS  A4/2 λύουσι, accented, accents ON  — "λύουσι" for "they loose"
[... existing A4/A6, caret, and Chapter 1–3 reset assertions omitted ...]
PASS  5E §4.2 ch4 Masculine Declension: More opens chart 2 and offers Back
PASS  5E §4.2 ch5 First Declension--Alpha: More opens chart 2 and offers Back
PASS  5E §4.2 ch5 article: Plural chart offers Singular
PASS  5E §4.2 ch4 Masculine Declension: leave and return resets chart 1
PASS  5E §4.2 ch5 First Declension--Alpha: leave and return resets chart 1
PASS  5E §4.2 ch5 Definite Article: leave and return resets chart 1
PASS  5E §4.5 ch4 Declining Noun: Translate prints the authored translate under the reference  — "brother" after "Lk 6:42"
PASS  5E §4.5 ch5 Declining Noun: Translate prints the authored translate under the reference  — "hours" after "Not in NT"
PASS  5E §4.5 ch5 Definite Article: Gender prints the authored gender under the reference  — "Feminine" after "Mat 1:21"
PASS  5E §8 timing ch4 Greek Noun (manualOnIncorrect): correct advances on 2000ms  — item 1 of 22 -> 1 of 22 at 1100ms -> 2 of 22 at 2061ms; feedback ok
PASS  5E §8 timing ch4 Scripture Memory (autoBoth): incorrect advances on 4000ms  — item 1 of 8 -> 1 of 8 at 2200ms -> 2 of 8 at 4077ms; feedback bad
PASS  5E §8 timing ch5 First Declension Noun (manualOnIncorrect): correct advances on 2000ms  — item 1 of 20 -> 1 of 20 at 1100ms -> 2 of 20 at 2048ms; feedback ok
PASS  5E §8 timing ch5 Scripture Memory (autoBoth): incorrect advances on 4000ms  — item 1 of 9 -> 1 of 9 at 2200ms -> 2 of 9 at 4061ms; feedback bad
[... all 20 D-19 vocabulary width cases and all D-26 cases passed ...]
PASS  §5 ch1 letter grid stays four-up at 768px  — 4 columns
PASS  §5 Parsing Drill divider is dark green  — {"top":"rgb(31, 95, 87)","left":"rgb(34, 37, 42)"}
PASS  §5 chapt_5 objectives use "1. 2. 3."  — decimal

96/96 behavior checks passed
```

### `check:shapes`

```text
> greek-tutor@0.1.0 check:shapes
> node scripts/check-content-shapes.mjs

PASS: content shapes intact — chapt-01.json, chapt-02.json, chapt-03.json, chapt-04.json, chapt-05.json checked (biblist entries are strings; numbered items render something; greekRows rows carry content; paradigm rows match their columns; spellVerse answers are single words; every contentAudio mode has a branch; every reddened cluster has a font-derived geometry row; every spelling answer is typeable on the shared keyboard).
```

### Production build

```text
> greek-tutor@0.1.0 build
> vite build

vite v5.4.21 building for production...
transforming...
✓ 86 modules transformed.
rendering chunks...
computing gzip size...
dist/assets/index-3_GP9iO4.css                         37.28 kB │ gzip:  8.08 kB
dist/assets/lexicon-chapt04-CZna8uQ7.js                4.90 kB │ gzip:  1.57 kB
dist/assets/lexicon-chapt05-gf-U-zWG.js                7.85 kB │ gzip:  2.54 kB
dist/assets/chapt-01-8ZoFoXk9.js                      35.39 kB │ gzip: 11.80 kB
dist/assets/chapt-04-nQU9AzTH.js                      36.20 kB │ gzip:  9.02 kB
dist/assets/chapt-03-CPP2o90H.js                      38.51 kB │ gzip:  8.34 kB
dist/assets/chapt-05-DKTyHDCh.js                      46.40 kB │ gzip: 10.36 kB
dist/assets/chapt-02-CFgjCaAb.js                      56.46 kB │ gzip: 15.75 kB
dist/assets/index-DuJv6vQh.js                        300.93 kB │ gzip: 87.40 kB
✓ built in 5.91s

PWA v0.20.5
mode      generateSW
precache  27 entries (678.64 KiB)
files generated
  dist/sw.js
  dist/workbox-efbd304a.js
9:52:51 PM [vite-plugin-svelte] F:/greekapp/sol-space/src/components/DivideActivity.svelte:325:6 A11y: noninteractive element cannot have nonnegative tabIndex value
```

The omitted build lines are only unchanged font/manifest and remaining
asset-size rows; no warning or failure was omitted.

### `check:lazy-chunk`

```text
> greek-tutor@0.1.0 check:lazy-chunk
> node scripts/check-lazy-chunk.mjs

PASS: lazy-chapter split intact — chapt-01-8ZoFoXk9.js + lexicon-chapt01-DWCL8L3K.js; chapt-02-CFgjCaAb.js + lexicon-chapt02-DMecEUSp.js; chapt-03-CPP2o90H.js + lexicon-chapt03-DU3wQSch.js; chapt-04-nQU9AzTH.js + lexicon-chapt04-CZna8uQ7.js; chapt-05-DKTyHDCh.js + lexicon-chapt05-gf-U-zWG.js emitted, precached, and chapter data is out of index-DuJv6vQh.js.
```

### Chapter 1–3 chunk-hash comparison

```text
expected: chapt-01-8ZoFoXk9.js, chapt-02-CFgjCaAb.js, chapt-03-CPP2o90H.js, lexicon-chapt01-DWCL8L3K.js, lexicon-chapt02-DMecEUSp.js, lexicon-chapt03-DU3wQSch.js
actual:   chapt-01-8ZoFoXk9.js, chapt-02-CFgjCaAb.js, chapt-03-CPP2o90H.js, lexicon-chapt01-DWCL8L3K.js, lexicon-chapt02-DMecEUSp.js, lexicon-chapt03-DU3wQSch.js
PASS: chapter 1-3 hashes unchanged
```

### Browser offline supplement

```text
{"controlled":true,"offlineBefore":true,"uncachedRejected":true,"ch4":true,"ch5":true,"ch5Refresh":true}
```

### Whitespace check

```text
git diff --check
[exit 0; no whitespace errors]
```

Git also printed only its Windows working-copy notice that LF would be
converted to CRLF the next time it touches each modified text file.

## 6. Screenshots produced

Directory: `buildout/screenshots/5e-spec1-sol/`

The table lists the 62 required base/page-state pairs. The same directories
also contain 350 additional interaction/state captures, bringing the total
to 474 PNGs.

| Page | 320px file | 768px file |
| --- | --- | --- |
| Ch4 1. Learn Chapter Objectives | `320/chapt_4/c4_learn_objectives.png` | `768/chapt_4/c4_learn_objectives.png` |
| Ch4 2. Learn English Concepts / Introduction | `320/chapt_4/c4_learn_english_concepts--topic1.png` | `768/chapt_4/c4_learn_english_concepts--topic1.png` |
| Ch4 3. Learn English Concepts / Gender | `320/chapt_4/c4_learn_english_concepts--topic2.png` | `768/chapt_4/c4_learn_english_concepts--topic2.png` |
| Ch4 4. Learn English Concepts / Number | `320/chapt_4/c4_learn_english_concepts--topic3.png` | `768/chapt_4/c4_learn_english_concepts--topic3.png` |
| Ch4 5. Learn English Concepts / Case | `320/chapt_4/c4_learn_english_concepts--topic4.png` | `768/chapt_4/c4_learn_english_concepts--topic4.png` |
| Ch4 6. Learn Greek Nouns: Second Declension / Introduction | `320/chapt_4/c4_learn_nouns--topic1.png` | `768/chapt_4/c4_learn_nouns--topic1.png` |
| Ch4 7. Learn Greek Nouns: Second Declension / Gender | `320/chapt_4/c4_learn_nouns--topic2.png` | `768/chapt_4/c4_learn_nouns--topic2.png` |
| Ch4 8. Learn Greek Nouns: Second Declension / Number and Agreement | `320/chapt_4/c4_learn_nouns--topic3.png` | `768/chapt_4/c4_learn_nouns--topic3.png` |
| Ch4 9. Learn Greek Nouns: Second Declension / Inflectional Forms | `320/chapt_4/c4_learn_nouns--topic4.png` | `768/chapt_4/c4_learn_nouns--topic4.png` |
| Ch4 10. Learn Greek Nouns: Second Declension / Masculine Declension | `320/chapt_4/c4_learn_nouns--topic5.png` | `768/chapt_4/c4_learn_nouns--topic5.png` |
| Ch4 11. Learn Greek Nouns: Second Declension / Neuter Declension | `320/chapt_4/c4_learn_nouns--topic6.png` | `768/chapt_4/c4_learn_nouns--topic6.png` |
| Ch4 12. Learn Greek Nouns: Second Declension / Word Order | `320/chapt_4/c4_learn_nouns--topic7.png` | `768/chapt_4/c4_learn_nouns--topic7.png` |
| Ch4 13. Learn Vocabulary | `320/chapt_4/c4_learn_vocab--first-card.png` | `768/chapt_4/c4_learn_vocab--first-card.png` |
| Ch4 14. Learn Scripture Memory | `320/chapt_4/c4_learn_scripture.png` | `768/chapt_4/c4_learn_scripture.png` |
| Ch4 15. Learn Bibliography | `320/chapt_4/c4_learn_bibliography.png` | `768/chapt_4/c4_learn_bibliography.png` |
| Ch4 16. Greek Noun Drill | `320/chapt_4/c4_drill_greek_noun.png` | `768/chapt_4/c4_drill_greek_noun.png` |
| Ch4 17. Declining Noun Drill | `320/chapt_4/c4_drill_declining.png` | `768/chapt_4/c4_drill_declining.png` |
| Ch4 18. Vocabulary: Greek to English Drill | `320/chapt_4/c4_drill_vocab_gk_en.png` | `768/chapt_4/c4_drill_vocab_gk_en.png` |
| Ch4 19. Vocabulary: English to Greek Drill | `320/chapt_4/c4_drill_vocab_en_gk.png` | `768/chapt_4/c4_drill_vocab_en_gk.png` |
| Ch4 20. Scripture Memory Drill | `320/chapt_4/c4_drill_scripture_memory.png` | `768/chapt_4/c4_drill_scripture_memory.png` |
| Ch4 21. Second Declension Noun Spelling Exercise | `320/chapt_4/c4_ex_noun_speller.png` | `768/chapt_4/c4_ex_noun_speller.png` |
| Ch4 22. Vocabulary Spelling Exercise | `320/chapt_4/c4_ex_vocab_speller.png` | `768/chapt_4/c4_ex_vocab_speller.png` |
| Ch4 23. Scripture Memory Spelling Exercise | `320/chapt_4/c4_ex_scripture_speller.png` | `768/chapt_4/c4_ex_scripture_speller.png` |
| Ch4 24. Review Vocabulary Chart | `320/chapt_4/c4_qr_vocab.png` | `768/chapt_4/c4_qr_vocab.png` |
| Ch4 25. Review Nouns: Second Declension | `320/chapt_4/c4_qr_nouns.png` | `768/chapt_4/c4_qr_nouns.png` |
| Ch4 26. Review Scripture Memory: Jn 14:6a | `320/chapt_4/c4_qr_scripture_a.png` | `768/chapt_4/c4_qr_scripture_a.png` |
| Ch4 27. Review Scripture Memory: Jn 14:6b | `320/chapt_4/c4_qr_scripture_b.png` | `768/chapt_4/c4_qr_scripture_b.png` |
| Ch5 1. Learn Chapter Objectives | `320/chapt_5/c5_learn_objectives.png` | `768/chapt_5/c5_learn_objectives.png` |
| Ch5 2. Learn English Concepts / Introduction | `320/chapt_5/c5_learn_english_concepts--topic1.png` | `768/chapt_5/c5_learn_english_concepts--topic1.png` |
| Ch5 3. Learn English Concepts / Gender | `320/chapt_5/c5_learn_english_concepts--topic2.png` | `768/chapt_5/c5_learn_english_concepts--topic2.png` |
| Ch5 4. Learn English Concepts / Number | `320/chapt_5/c5_learn_english_concepts--topic3.png` | `768/chapt_5/c5_learn_english_concepts--topic3.png` |
| Ch5 5. Learn English Concepts / Case | `320/chapt_5/c5_learn_english_concepts--topic4.png` | `768/chapt_5/c5_learn_english_concepts--topic4.png` |
| Ch5 6. Learn English Concepts / Definite Article | `320/chapt_5/c5_learn_english_concepts--topic5.png` | `768/chapt_5/c5_learn_english_concepts--topic5.png` |
| Ch5 7. Learn Greek Nouns: 1st Declension / Introduction | `320/chapt_5/c5_learn_nouns--topic1.png` | `768/chapt_5/c5_learn_nouns--topic1.png` |
| Ch5 8. Learn Greek Nouns: 1st Declension / Gender | `320/chapt_5/c5_learn_nouns--topic2.png` | `768/chapt_5/c5_learn_nouns--topic2.png` |
| Ch5 9. Learn Greek Nouns: 1st Declension / Number and Agreement | `320/chapt_5/c5_learn_nouns--topic3.png` | `768/chapt_5/c5_learn_nouns--topic3.png` |
| Ch5 10. Learn Greek Nouns: 1st Declension / Inflectional Forms | `320/chapt_5/c5_learn_nouns--topic4.png` | `768/chapt_5/c5_learn_nouns--topic4.png` |
| Ch5 11. Learn Greek Nouns: 1st Declension / First Declension--Eta | `320/chapt_5/c5_learn_nouns--topic5.png` | `768/chapt_5/c5_learn_nouns--topic5.png` |
| Ch5 12. Learn Greek Nouns: 1st Declension / First Declension--Alpha | `320/chapt_5/c5_learn_nouns--topic6.png` | `768/chapt_5/c5_learn_nouns--topic6.png` |
| Ch5 13. Learn Greek Nouns: 1st Declension / First Declension--Masc | `320/chapt_5/c5_learn_nouns--topic7.png` | `768/chapt_5/c5_learn_nouns--topic7.png` |
| Ch5 14. Learn Definite Article / Introduction | `320/chapt_5/c5_learn_article--topic1.png` | `768/chapt_5/c5_learn_article--topic1.png` |
| Ch5 15. Learn Definite Article / Examples | `320/chapt_5/c5_learn_article--topic2.png` | `768/chapt_5/c5_learn_article--topic2.png` |
| Ch5 16. Learn Definite Article / Definite Article Paradigm | `320/chapt_5/c5_learn_article--topic3.png` | `768/chapt_5/c5_learn_article--topic3.png` |
| Ch5 17. Learn Vocabulary | `320/chapt_5/c5_learn_vocab--first-card.png` | `768/chapt_5/c5_learn_vocab--first-card.png` |
| Ch5 18. Learn Scripture Memory | `320/chapt_5/c5_learn_scripture.png` | `768/chapt_5/c5_learn_scripture.png` |
| Ch5 19. Learn Bibliography | `320/chapt_5/c5_learn_bibliography.png` | `768/chapt_5/c5_learn_bibliography.png` |
| Ch5 20. First Declension Noun Drill | `320/chapt_5/c5_drill_first_decl_noun.png` | `768/chapt_5/c5_drill_first_decl_noun.png` |
| Ch5 21. Declining Noun Drill | `320/chapt_5/c5_drill_declining.png` | `768/chapt_5/c5_drill_declining.png` |
| Ch5 22. Definite Article Drill | `320/chapt_5/c5_drill_article.png` | `768/chapt_5/c5_drill_article.png` |
| Ch5 23. Vocabulary: Greek to English Drill | `320/chapt_5/c5_drill_vocab_gk_en.png` | `768/chapt_5/c5_drill_vocab_gk_en.png` |
| Ch5 24. Vocabulary: English to Greek Drill | `320/chapt_5/c5_drill_vocab_en_gk.png` | `768/chapt_5/c5_drill_vocab_en_gk.png` |
| Ch5 25. Scripture Memory Drill | `320/chapt_5/c5_drill_scripture_memory.png` | `768/chapt_5/c5_drill_scripture_memory.png` |
| Ch5 26. First Declension Noun Spelling Exercise | `320/chapt_5/c5_ex_noun_speller.png` | `768/chapt_5/c5_ex_noun_speller.png` |
| Ch5 27. Definite Article Spelling Exercise | `320/chapt_5/c5_ex_article_speller.png` | `768/chapt_5/c5_ex_article_speller.png` |
| Ch5 28. Vocabulary Spelling Exercise | `320/chapt_5/c5_ex_vocab_speller.png` | `768/chapt_5/c5_ex_vocab_speller.png` |
| Ch5 29. Scripture Memory Spelling Exercise | `320/chapt_5/c5_ex_scripture_speller.png` | `768/chapt_5/c5_ex_scripture_speller.png` |
| Ch5 30. Review Vocabulary Chart | `320/chapt_5/c5_qr_vocab.png` | `768/chapt_5/c5_qr_vocab.png` |
| Ch5 31. Review Nouns: First Declension | `320/chapt_5/c5_qr_nouns.png` | `768/chapt_5/c5_qr_nouns.png` |
| Ch5 32. Review Definite Article | `320/chapt_5/c5_qr_article.png` | `768/chapt_5/c5_qr_article.png` |
| Ch5 33. Review Scripture Memory: Jn 14:6a | `320/chapt_5/c5_qr_scripture_146a.png` | `768/chapt_5/c5_qr_scripture_146a.png` |
| Ch5 34. Review Scripture Memory: Jn 14:6b | `320/chapt_5/c5_qr_scripture_146b.png` | `768/chapt_5/c5_qr_scripture_146b.png` |
| Ch5 35. Review Scripture Memory: Rom 3:23 | `320/chapt_5/c5_qr_scripture_rom.png` | `768/chapt_5/c5_qr_scripture_rom.png` |

## 7. Decisions taken inside the diff

| Choice | Alternatives considered | Decision and reason |
| --- | --- | --- |
| Missing Scripture choices | Invent one/two distractors; duplicate choices; keep authored pools | Kept the 8/9 authored values and reported DIFFERS. The onboarding says to surface suspicious data rather than guess, and neither PDFs nor delivered data author a tenth choice. |
| Chart state ownership | Put chart index in a store/route; keep component-local | Kept it local to `Paradigm`. `ActivityHost` remount resets it and no store/cache scan is introduced. |
| `showGlosses` meaning | Hide every gloss including lemma identity; hide only cell glosses | The flag controls cell glosses. The identifying lemma gloss remains, matching the PDFs and keeping the chart intelligible. |
| Vocabulary responsiveness | Preserve DOS two-column list at 320; use one phone column | Quick Review uses one readable column below 768 and the original two 5-row columns at 768. Drill pools follow D-19 exactly. |
| D-19 scope | Fix only Greek-to-English; apply both vocabulary directions | Applied both directions across Chapters 1–5 because 5D-SPEC2 and 5E regression language define vocabulary pools generically. Letter and paradigm grids retain their explicit exceptions. |
| `greekTaps: true` | Global cache/store scan; map the current chapter lexicon | Built a map only from the already-loaded chapter lexicon, preserving lazy/offline architecture and the Greek-tap contract. |
| Hint references | Copy charts into drills; recursively resolve the authored topic ID | Resolve within already-loaded content so the modal uses the single authored chart and no data duplication is introduced. |
| Bibliography emphasis | Hard-code title parsing heuristics; author explicit narrow markup | Added `[[i]]` markers only around known titles. This is deterministic and does not guess at punctuation in arbitrary bibliography strings. |
| Reveal timing | Auto-show after answer; explicit authored buttons | Kept button-driven behavior because §4.5 explicitly leaves the original's auto-reveal as a VERIFY judgement. |
| Duplicate Masc heading | Always show topic and nested chart titles; suppress exact-equivalent nested title | Suppressed only normalized equivalent headings (`Masc`/`Masculine`) so unrelated nested titles remain. |

## 8. Self-audit against the spec

| Spec §8 item | Satisfied by | Yes / No |
| --- | --- | --- |
| 1. Machine rail walk, ch4 + ch5, 320 and 768 | §5 walk output; §6 62-pair manifest; 474 PNGs and report | Yes |
| 2. Side-by-side comparison vs the rail-walk PDFs | RESULTS §4 and every row of `5E-VISUAL-CHECKLIST-SOL.md` | Yes |
| 3. Horizontal-overflow measurement with numbers | §5 walk output; checklist X1; report has 41 exact 0px records | Yes |
| 4. Behavior assertions (switch, toggle, reveals, reset, timing) | §5 behavior output and checklist X2–X6 | Yes |
| 5. Regression: ch1-3 green, chunk hashes unchanged | §5 walk/behavior and literal hash comparison; checklist X7/X8 | Yes |
| 6. check:shapes, check:lazy-chunk, precache numbers | §5 full outputs; RESULTS §6; checklist X9 | Yes |
| 7. Airplane-mode walk (device — Nathanael, not you) | Browser offline smoke is supplementary; real device remains assigned to Nathanael | n/a |

