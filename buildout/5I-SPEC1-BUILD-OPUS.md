# 5I-SPEC1-BUILD-OPUS.md — cohort 5I, the round's complete diff and log

Model: Opus 5 (1M context), Claude Code. Spec: `buildout/5I-SPEC1.md`.
Base commit: `175cfae`. Nothing committed, staged or pushed.

Contents, in the order §2.1 of the spec asks for:

1. the per-turn wall-clock table with the cumulative active total;
2. the complete, exact `git diff` of every file touched, in one block;
3. the full thought and tool log for the round.

---

## 1. WALL-CLOCK

| Turn | Started (local) | Stopped (local) | Active |
| ---- | --------------- | --------------- | ------ |
| 1    | 17:38           | 21:05           | 3h27m  |
| CUMULATIVE ACTIVE TIME | | | **3h27m** |

One turn, recorded as it closed. Any later addendum or patch adds its time to
this total rather than starting a new count.

Untracked additions the diff below cannot show (`git status --short`):

```
?? buildout/5I-SPEC1-BUILD-OPUS.md          this file
?? buildout/5I-SPEC1-RESULTS-OPUS.md        the handoff
?? buildout/VERIFY-5I.md                    the device pass
?? buildout/screenshots/5i-walk/            129 pages x 2 widths + walk-report.json
?? buildout/screenshots/5i-walk-regression/ chapters 1-12 regression, report only
?? buildout/screenshots/5i-modals/          480 modal captures at 5 device heights
```

`5i-walk-regression` keeps its `walk-report.json` and not its 372 PNGs: the
evidence there is the machine-checked assertion set (zero overflow, zero
console errors, every rail action live), and 123 MB of unchanged chapter-1-12
captures is not worth the repo. This cohort's own 258 captures are kept in
full.

---

## 2. THE COMPLETE GIT DIFF

```diff
diff --git a/scripts/check-lazy-chunk.mjs b/scripts/check-lazy-chunk.mjs
index 155b49e..afada11 100644
--- a/scripts/check-lazy-chunk.mjs
+++ b/scripts/check-lazy-chunk.mjs
@@ -30,7 +30,15 @@ const expected = [
   { chapterPattern: /^chapt-09-.*\.js$/, lexiconPattern: /^lexicon-chapt09-.*\.js$/, needle: 'There are two voices in English.' },
   { chapterPattern: /^chapt-10-.*\.js$/, lexiconPattern: /^lexicon-chapt10-.*\.js$/, needle: 'In English we have several tenses.' },
   { chapterPattern: /^chapt-11-.*\.js$/, lexiconPattern: /^lexicon-chapt11-.*\.js$/, needle: 'We will explore three types of pronouns in this chapter.' },
-  { chapterPattern: /^chapt-12-.*\.js$/, lexiconPattern: /^lexicon-chapt12-.*\.js$/, needle: 'In English we have only one official past tense' }
+  { chapterPattern: /^chapt-12-.*\.js$/, lexiconPattern: /^lexicon-chapt12-.*\.js$/, needle: 'In English we have only one official past tense' },
+  // 5I. The needles are strings unique to ONE chapter file: chapters 14 and 15
+  // open with the same English-concepts paragraph, so neither may be keyed on
+  // it -- a needle that matches two chapters cannot prove which chunk it
+  // landed in, which is the whole assertion.
+  { chapterPattern: /^chapt-13-.*\.js$/, lexiconPattern: /^lexicon-chapt13-.*\.js$/, needle: 'So far we have learned second declension nouns' },
+  { chapterPattern: /^chapt-14-.*\.js$/, lexiconPattern: /^lexicon-chapt14-.*\.js$/, needle: 'The second aorist is presented first because of its similarity to the imperfect.' },
+  { chapterPattern: /^chapt-15-.*\.js$/, lexiconPattern: /^lexicon-chapt15-.*\.js$/, needle: 'First aorists use the present stem to which an augment is prefixed' },
+  { chapterPattern: /^chapt-16-.*\.js$/, lexiconPattern: /^lexicon-chapt16-.*\.js$/, needle: 'Greek aorist and future passive forms are translated like' }
 ];
 
 // 2. Chapter DATA must be ABSENT from the main bundle and PRESENT in its chunk.
diff --git a/scripts/ui-behavior.mjs b/scripts/ui-behavior.mjs
index ed708cd..a9ac16c 100644
--- a/scripts/ui-behavior.mjs
+++ b/scripts/ui-behavior.mjs
@@ -51,6 +51,10 @@ const ch9 = JSON.parse(readFileSync('src/data/chapt-09.json', 'utf8'));
 const ch10 = JSON.parse(readFileSync('src/data/chapt-10.json', 'utf8'));
 const ch11 = JSON.parse(readFileSync('src/data/chapt-11.json', 'utf8'));
 const ch12 = JSON.parse(readFileSync('src/data/chapt-12.json', 'utf8'));
+const ch13 = JSON.parse(readFileSync('src/data/chapt-13.json', 'utf8'));
+const ch14 = JSON.parse(readFileSync('src/data/chapt-14.json', 'utf8'));
+const ch15 = JSON.parse(readFileSync('src/data/chapt-15.json', 'utf8'));
+const ch16 = JSON.parse(readFileSync('src/data/chapt-16.json', 'utf8'));
 const verse = (ch3.exercise.find(a => a.type === 'spellVerse').answerWords || []).join(' ');
 // UNACCENTED, not unmarked (5E-SPEC2 §4.2). "With Accents" OFF forgives the
 // acute, the grave and the circumflex and NOTHING else, so a fixture that
@@ -762,9 +766,13 @@ await page.setViewportSize({ width: 390, height: 900 });
 // assertion and every spelling rule below covers them without being restated.
 // That is the point of writing them as sweeps rather than as lists.
 // 5G: chapters 9 and 10 join it in turn, for the same reason.
+// 5I: chapters 13-16 join it in turn -- which is how the A1c audio-leak gate,
+// the advance-class census, the spelling rules and the option-grid census all
+// reach the new Forms Drills without a single one of them being restated.
 const CHAPTERS = { chapt_1: ch1, chapt_2: ch2, chapt_3: ch3, chapt_4: ch4, chapt_5: ch5,
                    chapt_6: ch6, chapt_7: ch7, chapt_8: ch8, chapt_9: ch9, chapt_10: ch10,
-                   chapt_11: ch11, chapt_12: ch12 };
+                   chapt_11: ch11, chapt_12: ch12, chapt_13: ch13, chapt_14: ch14,
+                   chapt_15: ch15, chapt_16: ch16 };
 const LEXICON = id => JSON.parse(readFileSync(`src/data/lexicon-chapt${String(id.split('_')[1]).padStart(2, '0')}.json`, 'utf8'));
 const promptGloss = () => page.locator('.card.speller .flash-pane .value').first().innerText();
 // WHICH ITEM the word speller is on. Not the prompt: chapter 7's adjective
@@ -1837,8 +1845,17 @@ await page.setViewportSize({ width: 390, height: 900 });
     headingKey('First Declension—Masc') === headingKey('First Declension—Masculine')
       && ABBREVIATIONS.test('First Declension—Masc'),
     'masc -> masculine');
-  check(`5E-R1 every REPLACED heading pair is a chapter-11 radio-label/panel-heading pair`,
-    replaced.every(pair => pair.startsWith('chapt_11')), replaced.join('; ') || 'none');
+  // 5I: chapter 13's πᾶς topic is the same shape -- the topic is named for the
+  // original's radio label ("πᾶς Adjective") while the panel is headed with the
+  // chart's own title ("πᾶς (all) Forms"), and the original drops the radio
+  // column on that screen. The allowlist is what keeps a genuinely doubled
+  // heading from slipping through as "just another replacement", so it names
+  // the chapters that legitimately do this rather than being dropped; the
+  // SURFACE assertion below is what proves each one prints exactly one heading.
+  const REPLACED_HEADING_CHAPTERS = ['chapt_11', 'chapt_13'];
+  check(`5E-R1 every REPLACED heading pair is a radio-label/panel-heading pair (chapters 11 and 13)`,
+    replaced.every(pair => REPLACED_HEADING_CHAPTERS.some(id => pair.startsWith(id))),
+    replaced.join('; ') || 'none');
 
   // ...and on the SURFACE: a covered pair prints ONE heading, the fuller one,
   // which is the heading the original prints in its panel. Two stacked
@@ -5025,9 +5042,10 @@ for (const [itemIndex, greek, personNumber] of [
   // VERIFY-5H (d): the original leaks -- its Pronounce speaks the augmented
   // answer before the guess -- and the gate is adopted anyway, forward and
   // backward. The rule is afterGuess + Greek options + NOT autoBoth, and the
-  // point of a census is that the FOUR is derived from the data here rather
-  // than typed here: if a thirteenth chapter ships a fifth, this check grows
-  // with it, and if the renderer's condition drifts from 4.1 the two part.
+  // point of a census is that the COUNT is derived from the data here rather
+  // than typed here: when a later cohort ships another the check grows with it,
+  // and if the renderer's condition drifts from 4.1 the two part. Cohort 5I is
+  // that later cohort -- four became seven.
   {
     const greekOptions = activity => activity.optionsAreGreek === true
       || activity.options === 'greek'
@@ -5043,9 +5061,19 @@ for (const [itemIndex, greek, personNumber] of [
         (triple ? gated : ungated).push([chapterId, activity.id, advanceClass]);
       }
     }
+    // 5I-SPEC1 4.10: the three new Forms Drills of chapters 14, 15 and 16 join
+    // them, and they join STRUCTURALLY -- no per-activity flag was added, and
+    // none was needed. Each shows a present-tense lemma and asks which of three
+    // Greek forms is its aorist or passive, and each item's clip is that ANSWER
+    // (A1b, confirmed at source in all three TBKs), so the same triple that
+    // selected the first four selects these. The census is the proof: it is
+    // derived from the data below and only the expected SET is typed here, so
+    // a fourth chapter shipping the shape appears as a failure rather than as
+    // silence.
     const GATED_IDS = ['c12_drill_augment', 'c3_drill_greek_verb',
-      'c4_drill_greek_noun', 'c5_drill_first_decl_noun'].sort();
-    check('5H-SPEC2 4.2 census: the 4.1 triple selects exactly FOUR activities in twelve chapters',
+      'c4_drill_greek_noun', 'c5_drill_first_decl_noun',
+      'c14_drill_forms', 'c15_drill_forms', 'c16_drill_forms'].sort();
+    check('5H-SPEC2 4.2 / 5I 4.10 census: the 4.1 triple selects exactly SEVEN activities in sixteen chapters',
       gated.length === GATED_IDS.length
         && gated.map(row => row[1]).sort().join(' ') === GATED_IDS.join(' '),
       JSON.stringify(gated));
diff --git a/scripts/ui-disclosure.mjs b/scripts/ui-disclosure.mjs
index bc5d623..97fd8cb 100644
--- a/scripts/ui-disclosure.mjs
+++ b/scripts/ui-disclosure.mjs
@@ -416,8 +416,12 @@ const shot = async name => {
   }
   check(`D6.1 W9 all ${pool.length} poolKind drills are two-up at 390px and four-up at 820px`,
     // 5H: chapters 11 and 12 declare `poolKind` on both of their vocabulary
-    // drills each, so the census is twelve.
-    pool.length === 12 && failures.length === 0, failures.join(', ') || `${pool.length} drills`);
+    // drills each, so the census was twelve.
+    // 5I: chapters 13-16 declare it on both of theirs, so it is TWENTY. The
+    // census number is asserted rather than derived on purpose -- it is what
+    // catches a chapter that quietly stops declaring the key -- so it moves
+    // with each cohort that adds one.
+    pool.length === 20 && failures.length === 0, failures.join(', ') || `${pool.length} drills`);
   const controlNarrow = await columnsAt(page, '#/activity/chapt_2/c2_drill_part_of_speech');
   const controlBroad = await columnsAt(widePage, '#/activity/chapt_2/c2_drill_part_of_speech');
   check('D6.2 W9 a non-vocabulary AUTHORED grid stays two-up at both widths',
diff --git a/scripts/ui-disclosure3.mjs b/scripts/ui-disclosure3.mjs
index 96edea6..1c1b5d6 100644
--- a/scripts/ui-disclosure3.mjs
+++ b/scripts/ui-disclosure3.mjs
@@ -29,7 +29,9 @@ const normalize = value => String(value ?? '').replace(/\s+/g, ' ').trim().norma
 
 const chapters = new Map();
 const lexicons = new Map();
-for (let number = 1; number <= 12; number += 1) {
+// 5I: chapters 13-16 join the swept set, which is what makes W2.1/W2.3's census
+// numbers cover them rather than silently stop at the cohort before.
+for (let number = 1; number <= 16; number += 1) {
   const nn = String(number).padStart(2, '0');
   chapters.set(`chapt_${number}`, JSON.parse(readFileSync(`src/data/chapt-${nn}.json`, 'utf8')));
   lexicons.set(`chapt_${number}`, JSON.parse(readFileSync(`src/data/lexicon-chapt${nn}.json`, 'utf8')));
@@ -94,7 +96,7 @@ const EXPECTED_CHANGED = [
   'c1_ex_phonetic',
   'c1_ex_pronounce',
   'c1_learn_letters',
-  ...Array.from({ length: 12 }, (_, index) => `c${index + 1}_learn_vocab`)
+  ...Array.from({ length: 16 }, (_, index) => `c${index + 1}_learn_vocab`)
 ].sort();
 const EXPECTED_EXEMPTED = [
   'c1_drill_capitals',
@@ -114,22 +116,24 @@ const behaviorEntries = stored.filter(entry => entry.section === 'drill' || entr
 const missingLedger = behaviorEntries.filter(entry => !ledgerRows.has(entry.activity.id)).map(entry => entry.activity.id);
 const orphanLedger = [...ledgerRows.keys()].filter(id => !byId.has(id));
 
-check('W2.1 all twelve chapter stores and rails contain exactly 270 activities',
-  stored.length === 270 && sequenced.length === 270,
+check('W2.1 all sixteen chapter stores and rails contain exactly 368 activities',
+  stored.length === 368 && sequenced.length === 368,
   `${stored.length} stored / ${sequenced.length} sequenced`);
 check('W2.2 every activity appears exactly once in its chapter sequence',
   duplicateStored.length === 0 && duplicateSequence.length === 0
     && missingFromSequence.length === 0 && unknownInSequence.length === 0,
   `duplicate store [${duplicateStored}], duplicate rail [${duplicateSequence}], missing [${missingFromSequence}], unknown [${unknownInSequence}]`);
-check('W2.3 every drill/exercise maps to one of the 115 exact ledger rows',
-  ledgerRows.size === 115 && behaviorEntries.length === 115
+check('W2.3 every drill/exercise maps to one of the 154 exact ledger rows',
+  ledgerRows.size === 154 && behaviorEntries.length === 154
     && missingLedger.length === 0 && orphanLedger.length === 0,
   `${ledgerRows.size} rows / ${behaviorEntries.length} activities; missing [${missingLedger}], orphan [${orphanLedger}]`);
 // 5H: chapters 11 and 12 added 51 activities, all sequence-stepped and all
 // already-loaded except their two Learn Vocabulary flashcard steppers, which
 // join the B-last changed set for the same reason every other chapter's did.
-check('W2.4 exhaustive classification is 15 changed / 251 already-loaded / 4 exempted',
-  changed.length === 15 && alreadyLoaded.length === 251 && exempted.length === 4,
+// 5I: chapters 13-16 add 98, of which four -- one Learn Vocabulary stepper
+// each -- join that same changed set, for that same reason.
+check('W2.4 exhaustive classification is 19 changed / 345 already-loaded / 4 exempted',
+  changed.length === 19 && alreadyLoaded.length === 345 && exempted.length === 4,
   `${changed.length} / ${alreadyLoaded.length} / ${exempted.length}`);
 check('W2.5 changed classification is the exact B-last sequence-mode set',
   JSON.stringify(changedIds) === JSON.stringify(EXPECTED_CHANGED), changedIds.join(', '));
diff --git a/scripts/ui-modals.mjs b/scripts/ui-modals.mjs
index 1086895..6eb133f 100644
--- a/scripts/ui-modals.mjs
+++ b/scripts/ui-modals.mjs
@@ -125,6 +125,53 @@ const hintAtPrompt = (chapterId, activityId, prompt, itemCount, disclosureState
   if (disclosureState !== null) await setHintDisclosureState(disclosureState);
 };
 
+// 5I: a bundle of THREE OR MORE charts steps with the centred Back/More pair
+// (DISCLOSURE-RULES 4.2) rather than alternating with a single toggle, so
+// `setHintDisclosureState` -- which knows only the two-state toggle -- cannot
+// reach state 3 of chapter 16's passive paradigms or state 4 of chapter 15's
+// aorist-versus-imperfect stack. Each state is its own surface at every
+// height; a chart nobody opens is a chart nobody measures.
+const stepHintDisclosureTo = async stateIndex => {
+  const controls = page.locator('.modal [data-hint-paradigm-controls]');
+  await controls.waitFor({ state: 'visible' });
+  for (let step = 0; step < stateIndex; step++) {
+    const more = page.locator('.modal [data-hint-paradigm-nav="more"]');
+    if (!await more.count() || await more.isDisabled()) throw new Error(`hint bundle has no state ${stateIndex + 1}`);
+    await more.click();
+    await page.waitForTimeout(160);
+  }
+  await page.locator(`.modal [data-hint-paradigm-controls][data-state-index="${stateIndex}"]`).waitFor();
+  await page.waitForTimeout(120);
+};
+
+// A drill Hint whose bundle holds three or more charts.
+const hintState = (chapterId, activityId, stateIndex) => async () => {
+  await go(`#/activity/${chapterId}/${activityId}`);
+  await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
+  await page.waitForTimeout(180);
+  await stepHintDisclosureTo(stateIndex);
+};
+
+// An IN-CHART C3 trigger on a topicPages surface: step to the topic, then press
+// the named trigger. Chapter 13's Key Letter Box is the first chart in the app
+// with six of them, and chapters 14 and 15 add four more between them.
+const chartTrigger = (chapterId, activityId, topicIndex, ref) => async () => {
+  await go(`#/activity/${chapterId}/${activityId}`);
+  for (let i = 0; i < topicIndex; i++) {
+    await page.getByRole('button', { name: 'Next Topic', exact: true }).click();
+    await page.waitForTimeout(80);
+  }
+  await page.locator(`.card [data-chart-trigger="${ref}"]`).first().click();
+  await page.waitForTimeout(180);
+};
+
+// The tile keyboard, which is a modal of its own on every speller.
+const spellerKeyboard = (chapterId, activityId) => async () => {
+  await go(`#/activity/${chapterId}/${activityId}`);
+  await page.locator('.card').getByRole('button', { name: 'Greek Keyboard', exact: true }).click();
+  await page.waitForTimeout(180);
+};
+
 // A PAGED hint is N surfaces, not one. 5H-SPEC3 2 put chapter 8's translation
 // hint back to a four-page stack (VERIFY-5H-2 (s)), and a page nobody opens is
 // a page nobody measures -- which is the whole reason this file exists. The
@@ -313,6 +360,72 @@ const SURFACES = [
   // The Settings confirm dialog (added 2026-08-13). Two lines and two buttons
   // -- the smallest modal in the app, and the one a shared-CSS change is most
   // likely to leave behind.
+  // ---------------------------------------------------------------- 5I
+  // Chapters 13-16. THE KEY LETTER BOX is the new shape: six in-chart triggers
+  // on one chart, each opening its own popup, where no earlier chapter has more
+  // than three on a page. All six are listed rather than sampled -- the point
+  // of this file is that a modal nobody opens is a modal nobody checks.
+  ['ch13-klb-popup-unvoiced', chartTrigger('chapt_13', 'c13_learn_concepts', 1, 'unvoiced')],
+  ['ch13-klb-popup-voiced', chartTrigger('chapt_13', 'c13_learn_concepts', 1, 'voiced')],
+  ['ch13-klb-popup-aspirate', chartTrigger('chapt_13', 'c13_learn_concepts', 1, 'aspirate')],
+  ['ch13-klb-popup-labial', chartTrigger('chapt_13', 'c13_learn_concepts', 1, 'labial')],
+  ['ch13-klb-popup-velar', chartTrigger('chapt_13', 'c13_learn_concepts', 1, 'velar')],
+  ['ch13-klb-popup-dental', chartTrigger('chapt_13', 'c13_learn_concepts', 1, 'dental')],
+  ['ch13-declining-hint', hint('chapt_13', 'c13_drill_declining', false)],
+  ['ch13-pas-declining-hint', hint('chapt_13', 'c13_drill_pas_declining', false)],
+  ['ch13-translation-hint', hint('chapt_13', 'c13_drill_translation', false)],
+  ['ch13-speller-greek-keyboard', spellerKeyboard('chapt_13', 'c13_ex_speller')],
+  ['ch13-verse-speller-greek-keyboard', spellerKeyboard('chapt_13', 'c13_ex_scripture_speller')],
+  // Chapter 14's stem list carries ONE in-chart trigger, and it is reachable
+  // from two different hosts (the Learn topic and the Quick Review page), which
+  // is two registers and therefore two surfaces.
+  ['ch14-stem-popup-learn', chartTrigger('chapt_14', 'c14_learn_second_aorist', 5, 'blepwEidon')],
+  ['ch14-stem-popup-review', async () => {
+    await go('#/activity/chapt_14/c14_qr_forms');
+    await page.locator('.card [data-chart-trigger="blepwEidon"]').first().click();
+    await page.waitForTimeout(180);
+  }],
+  ['ch14-parsing-hint-active', hint('chapt_14', 'c14_drill_parsing', false, 0), true, false],
+  ['ch14-parsing-hint-middle', hint('chapt_14', 'c14_drill_parsing', false, 1), true, false],
+  ['ch14-forms-hint', hint('chapt_14', 'c14_drill_forms', false)],
+  ['ch14-translation-hint-active', hint('chapt_14', 'c14_drill_translation', false, 0), true, false],
+  ['ch14-translation-hint-middle', hint('chapt_14', 'c14_drill_translation', false, 1), true, false],
+  ['ch14-speller-greek-keyboard', spellerKeyboard('chapt_14', 'c14_ex_speller_forms')],
+  ['ch14-verse-speller-greek-keyboard', spellerKeyboard('chapt_14', 'c14_ex_scripture_speller')],
+  // Chapter 15's four sound-description popups hang off the Ending
+  // Transformations chart; the fourth is reached from the prose beneath it.
+  ['ch15-popup-palatals', chartTrigger('chapt_15', 'c15_learn_first_aorist', 6, 'palatals')],
+  ['ch15-popup-labials', chartTrigger('chapt_15', 'c15_learn_first_aorist', 6, 'labials')],
+  ['ch15-popup-dentals', chartTrigger('chapt_15', 'c15_learn_first_aorist', 6, 'dentals')],
+  ['ch15-popup-liquids', async () => {
+    await go('#/activity/chapt_15/c15_learn_first_aorist');
+    for (let i = 0; i < 6; i++) { await page.getByRole('button', { name: 'Next Topic', exact: true }).click(); await page.waitForTimeout(80); }
+    await page.locator('.card .rc-para .popup-link').first().click();
+    await page.waitForTimeout(180);
+  }],
+  ['ch15-parsing-hint-active', hint('chapt_15', 'c15_drill_parsing', false, 0), true, false],
+  ['ch15-parsing-hint-middle', hint('chapt_15', 'c15_drill_parsing', false, 1), true, false],
+  ['ch15-forms-hint', hint('chapt_15', 'c15_drill_forms', false)],
+  // FOUR charts, the deepest bundle in the app: aorist active, aorist middle,
+  // then the two imperfects the drill is contrasting them against.
+  ['ch15-translation-hint-s1-aorist-active', hintState('chapt_15', 'c15_drill_translation', 0), true, false],
+  ['ch15-translation-hint-s2-aorist-middle', hintState('chapt_15', 'c15_drill_translation', 1), true, false],
+  ['ch15-translation-hint-s3-imperfect-active', hintState('chapt_15', 'c15_drill_translation', 2), true, false],
+  ['ch15-translation-hint-s4-imperfect-mp', hintState('chapt_15', 'c15_drill_translation', 3), true, false],
+  ['ch15-speller-greek-keyboard', spellerKeyboard('chapt_15', 'c15_ex_speller_forms')],
+  ['ch15-verse-speller-greek-keyboard', spellerKeyboard('chapt_15', 'c15_ex_scripture_speller')],
+  // Chapter 16: a three-chart bundle on both the parsing and translation
+  // drills, and a two-half stem table on the forms drill -- the widest chart
+  // this cohort puts inside a dialog.
+  ['ch16-parsing-hint-s1-first-aorist', hintState('chapt_16', 'c16_drill_parsing', 0), true, false],
+  ['ch16-parsing-hint-s2-future', hintState('chapt_16', 'c16_drill_parsing', 1), true, false],
+  ['ch16-parsing-hint-s3-second-aorist', hintState('chapt_16', 'c16_drill_parsing', 2), true, false],
+  ['ch16-translation-hint-s1-first-aorist', hintState('chapt_16', 'c16_drill_translation', 0), true, false],
+  ['ch16-translation-hint-s3-second-aorist', hintState('chapt_16', 'c16_drill_translation', 2), true, false],
+  ['ch16-forms-hint-half1', hint('chapt_16', 'c16_drill_forms', false, 0), true, false],
+  ['ch16-forms-hint-half2', hint('chapt_16', 'c16_drill_forms', false, 1), true, false],
+  ['ch16-speller-greek-keyboard', spellerKeyboard('chapt_16', 'c16_ex_speller_forms')],
+  ['ch16-verse-speller-greek-keyboard', spellerKeyboard('chapt_16', 'c16_ex_scripture_speller')],
   ['settings-clear-audio-confirm', async () => {
     await go('#/settings');
     await page.getByRole('button', { name: 'Clear downloaded audio', exact: true }).click();
@@ -353,7 +466,15 @@ for (const { name, width, height } of VIEWPORTS) {
       const hc = hintControls ? hintControls.getBoundingClientRect() : null;
       const hintSay = modal.querySelector('[data-hint-paradigm-say]');
       const hs = hintSay ? hintSay.getBoundingClientRect() : null;
-      const hintToggle = modal.querySelector('[data-hint-paradigm-toggle]');
+      // 5I: WHICH control a disclosed bundle draws depends on how many charts
+      // it holds -- the DISCLOSURE-RULES 4.1 single toggle at two, the 4.2
+      // Back/More pair at three or more. Chapter 15's four-chart hint and
+      // chapter 16's three-chart one are the first 3+ bundles inside a modal,
+      // and asserting only against the toggle would have reported them BAD for
+      // drawing the control the sheet actually asks for. Measure whichever the
+      // state draws; the assertion below is the same either way -- the control
+      // does not move when the content under it does.
+      const hintToggle = modal.querySelector('[data-hint-paradigm-toggle], [data-hint-paradigm-controls] .pg-nav');
       const ht = hintToggle ? hintToggle.getBoundingClientRect() : null;
       const bar = sel => { const el = document.querySelector(sel); return el ? el.getBoundingClientRect() : null; };
       const tb = bar('.topbar'), bb = bar('.bottom-bar');
@@ -394,7 +515,15 @@ for (const { name, width, height } of VIEWPORTS) {
       const a = action ? action.getBoundingClientRect() : null;
       const hintControls = modal.querySelector('[data-hint-paradigm-controls]');
       const hc = hintControls ? hintControls.getBoundingClientRect() : null;
-      const hintToggle = modal.querySelector('[data-hint-paradigm-toggle]');
+      // 5I: WHICH control a disclosed bundle draws depends on how many charts
+      // it holds -- the DISCLOSURE-RULES 4.1 single toggle at two, the 4.2
+      // Back/More pair at three or more. Chapter 15's four-chart hint and
+      // chapter 16's three-chart one are the first 3+ bundles inside a modal,
+      // and asserting only against the toggle would have reported them BAD for
+      // drawing the control the sheet actually asks for. Measure whichever the
+      // state draws; the assertion below is the same either way -- the control
+      // does not move when the content under it does.
+      const hintToggle = modal.querySelector('[data-hint-paradigm-toggle], [data-hint-paradigm-controls] .pg-nav');
       const ht = hintToggle ? hintToggle.getBoundingClientRect() : null;
       return {
         top: Math.round(m.top), bottom: Math.round(m.bottom),
diff --git a/scripts/ui-walk.mjs b/scripts/ui-walk.mjs
index 8a89536..46c3432 100644
--- a/scripts/ui-walk.mjs
+++ b/scripts/ui-walk.mjs
@@ -38,7 +38,11 @@ const RUN_ID = `${stamp.getFullYear()}${pad(stamp.getMonth() + 1)}${pad(stamp.ge
 const BASE = args.base || `http://localhost:${args.port || 4173}`;
 const OUT = args.out || `buildout/screenshots/walk-${RUN_ID}`;
 const WIDTHS = [{ name: '320', width: 320, height: 900 }, { name: '768', width: 768, height: 1100 }];
-const CHAPTERS = String(args.chapters || 'chapt_1,chapt_2,chapt_3,chapt_4,chapt_5').split(',');
+// 5I-SPEC1 8: the four chapters this cohort builds join the default set, so
+// `npm run ui:walk` with no arguments covers them. --chapters= still narrows
+// or widens it for a regression sweep over the shipped ones.
+const CHAPTERS = String(args.chapters
+  || 'chapt_1,chapt_2,chapt_3,chapt_4,chapt_5,chapt_13,chapt_14,chapt_15,chapt_16').split(',');
 // WHICH chapters get checklist evidence and a 320px overflow line. This used
 // to be a literal /^chapt_[45]$/ -- the cohort that first needed it -- so
 // cohort 5F walked chapters 6-8 and reported overflow for neither. A cohort
diff --git a/src/app.css b/src/app.css
index bd10917..6490af3 100644
--- a/src/app.css
+++ b/src/app.css
@@ -262,6 +262,12 @@ button { font: inherit; cursor: pointer; }
    pre-wrap so an objective's own text still renders exactly as authored. */
 .objectives-list { white-space: normal; }
 .objectives-list > li { white-space: pre-wrap; }
+/* 5I-SPEC1 4.2: the closing paragraph beneath the list (chapter 13 only).
+   Ordinary body style, no marker, no indent -- it is prose about the chapter,
+   not a seventh objective. The card is `pre-wrap`, so the newline between the
+   list and this block already draws the blank line the original prints above
+   "Congratulations!"; the paragraph adds no margin of its own on top of it. */
+.objectives-postamble { margin: 0; }
 .flash-pane { background: white; border-radius: 10px; padding: 14px; margin-bottom: 10px; min-height: 74px; }
 .flash-pane .label { font-size: 0.75rem; color: var(--teal-dark); font-weight: 700; text-transform: uppercase; }
 .flash-pane .value { font-size: 2rem; }
@@ -754,6 +760,114 @@ button { font: inherit; cursor: pointer; }
     grid-template-columns: minmax(4.5em, auto) minmax(0, 0.8fr) minmax(0, 1.2fr); }
   .rc-greekrows.contraction .rc-parts { grid-column: auto; }
 }
+
+/* ---- 5I-SPEC1 4.6: the five new greekRows layouts (chapters 13-16) ----
+   Each is a shape the original draws that no earlier chapter needed. They
+   share the greekRows shell -- the same stacked rows, the same ruled
+   separators -- and differ only in what a row is made of. */
+
+/* KEY LETTER BOX (ch13). A 3x3 consonant grid with a clickable label on every
+   edge: three column headers and three row labels, six in-chart C3 triggers.
+   The cells are boxed because the original boxes them, and the boxing is what
+   makes the three voiced classes read as columns rather than as a list. */
+.rc-greekrows.key-letter-box { margin: 6px 0 10px; }
+.rc-klb-head, .rc-greekrows.key-letter-box .rc-klb-row {
+  display: grid; grid-template-columns: minmax(3.1em, 0.95fr) repeat(3, minmax(0, 1fr));
+  gap: 0 5px; align-items: center; }
+/* 0.76rem is what keeps "Unvoiced" -- the longest of the six labels -- on one
+   line inside a third of a 320px card. Above that it breaks mid-word. */
+.rc-klb-head { padding: 4px 2px 6px; text-align: center; font-size: 0.76rem; font-weight: 700; }
+.rc-greekrows.key-letter-box .rc-klb-row { border-bottom: none; padding: 0 2px; }
+.rc-greekrows.key-letter-box .rc-klb-row + .rc-klb-row { margin-top: 4px; }
+.rc-klb-label { color: var(--teal-dark); font-weight: 700; font-size: 0.8rem;
+  overflow-wrap: break-word; line-height: 1.2; }
+.rc-greekrows.key-letter-box .rc-klb-row > .rc-chart-trigger { font-size: 0.8rem; }
+/* The Key Letter Box's own labels are left-aligned beside their row and
+   centred over their column, exactly as the original sets them. */
+.rc-greekrows.key-letter-box .rc-klb-row > .rc-chart-trigger,
+.rc-greekrows.key-letter-box .rc-klb-row > .rc-klb-label { text-align: left; font-weight: 700; }
+.rc-klb-cell { display: flex; align-items: center; justify-content: center;
+  border: 1px solid rgba(0,0,0,0.35); border-radius: 4px; padding: 5px 2px;
+  font-size: 1.4rem; color: var(--ink); line-height: 1.15; min-width: 0; }
+
+/* IN-CHART C3 TRIGGER (DISCLOSURE-RULES 3.3). Blue because it is tappable
+   (directive 8) and NOT underlined: the original prints these labels blue and
+   unmarked, and a green underline here would collide with the blue Greek-tap
+   convention the same chart is full of. `.popup-link` supplies the button
+   reset; this overrides only the colour and the underline. */
+/* `button.` rather than the bare class: `.popup-link` supplies the colour and
+   the underline further down this file, and at equal specificity it would win
+   on source order. */
+button.rc-chart-trigger { color: var(--link); text-decoration: none; font-weight: 700; }
+button.rc-chart-trigger:active { opacity: 0.6; }
+
+/* RULE LINES. `transformation` (ch13) carries a label; `shiftSummary` (ch16)
+   does not. Both hold their internal spacing, because the columns inside the
+   line are how the original aligns one rule over the next. */
+.rc-greekrows.transformation .rc-rule-row,
+.rc-greekrows.shift-summary .rc-rule-row {
+  display: grid; grid-template-columns: minmax(4.6em, auto) minmax(0, 1fr);
+  gap: 4px 10px; border-bottom: none; padding: 4px 6px; align-items: baseline; }
+.rc-greekrows.shift-summary .rc-rule-row.no-label,
+.rc-greekrows.transformation .rc-rule-row.no-label { grid-template-columns: minmax(0, 1fr); }
+.rc-rule-label { color: var(--teal-dark); font-weight: 700; white-space: nowrap; }
+.rc-rule-text { color: var(--ink); font-size: 1.15rem; white-space: pre-wrap;
+  overflow-wrap: break-word; min-width: 0; }
+.rc-greekrows.shift-summary { margin: 4px 0 10px; }
+.rc-greekrows.shift-summary .rc-rule-text { font-size: 1.2rem; }
+
+/* STEM LIST (ch14, ch15). `lemma  --  aorist  (gloss)`. The lemma column is
+   sized off the longest lemma the two chapters ship (ἀποθνῄσκω,
+   ἀποστέλλω); at 320px the gloss drops to its own line under the pair rather
+   than squeezing the aorist, because the pair is the teaching and the gloss is
+   the annotation. */
+.rc-greekrows.stem-list .rc-stem-row {
+  display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
+  gap: 2px 8px; padding: 6px 4px; align-items: baseline; }
+.rc-stem-lemma { min-width: 0; font-size: 1.2rem; color: var(--ink);
+  text-align: left; overflow-wrap: break-word; }
+.rc-stem-lemma.greek-say { background: transparent; border: none; padding: 0;
+  width: auto; color: var(--link); }
+.rc-stem-forms { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 6px; min-width: 0; }
+.rc-greekrows.stem-list .rc-part { font-size: 1.2rem; }
+.rc-stem-gloss { grid-column: 1 / -1; color: var(--teal-dark); font-size: 0.9rem; }
+/* The in-chart note marker beside an aorist that carries one. It cannot be the
+   form itself: that form is already an audio tap, and one press cannot both
+   speak and open a page. */
+/* `button.` for the same reason as .rc-chart-trigger: .popup-link resets the
+   border further down this file and would win on source order. */
+button.rc-stem-note { font-size: 0.8rem; line-height: 1; width: 1.35em; height: 1.35em;
+  display: inline-flex; align-items: center; justify-content: center; padding: 0;
+  border: 1px solid var(--link); border-radius: 50%; align-self: center; flex: none; }
+@media (min-width: 560px) {
+  .rc-greekrows.stem-list .rc-stem-row {
+    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 0.7fr); }
+  .rc-stem-gloss { grid-column: auto; }
+}
+
+/* ENDING TRANSFORMATIONS (ch15, ch16): a rule line, then its worked example
+   indented beneath. The indent is the original's, and it is what says the
+   example belongs to the rule above rather than standing beside it. */
+.rc-greekrows.ending-transformation { margin: 6px 0 10px; }
+.rc-etf-row { padding: 6px 4px; border-bottom: 1px solid rgba(0,0,0,0.06); }
+.rc-etf-row:last-child { border-bottom: none; }
+.rc-etf-rule { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 8px; }
+.rc-etf-label { color: var(--link); font-weight: 700; white-space: nowrap; }
+span.rc-etf-label { color: var(--teal-dark); }
+.rc-etf-text { color: var(--ink); font-size: 1.05rem; white-space: pre-wrap;
+  overflow-wrap: break-word; min-width: 0; }
+.rc-etf-example { margin: 4px 0 0 1.6em; font-size: 1.15rem; color: var(--ink);
+  overflow-wrap: break-word; }
+.rc-etf-example .greek-tap { font-size: inherit; }
+
+/* PRINCIPAL PARTS (ch16): six labelled rows, one Greek form each. */
+.rc-greekrows.principal-parts .rc-pp-row {
+  display: grid; grid-template-columns: minmax(6.4em, auto) minmax(0, 1fr);
+  gap: 4px 10px; padding: 5px 4px; border-bottom: none; align-items: baseline; }
+.rc-pp-label { color: var(--teal-dark); font-weight: 700; font-size: 0.9rem; }
+.rc-pp-forms { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 6px; min-width: 0; }
+.rc-greekrows.principal-parts .rc-part { font-size: 1.2rem; }
+
 .rc-greekrows.english-pairs .rc-greekrow { text-align: center; }
 .rc-english-cell { min-width: 0; overflow-wrap: break-word; }
 .rc-greeklabel { font-weight: 600; overflow-wrap: anywhere; }
@@ -882,6 +996,10 @@ button { font: inherit; cursor: pointer; }
    why the chart read "but, yet(638)". */
 .rv-freq { color: #8a8472; font-size: 0.9rem; margin-left: 0.35em; }
 .rv-footnote { font-size: 0.85rem; color: #5a5a52; line-height: 1.45; margin-top: 10px; }
+/* 5I-SPEC1 4.3: the per-half say-all sits directly under the rows it speaks,
+   so it needs less air above it than the chart-wide row at the foot of the
+   card and none of that row's top border. */
+.controls.rv-group-controls { margin-top: 8px; margin-bottom: 4px; }
 /* The chapter-4/5 original charts split ten lemmas into two five-row columns.
    Keep the phone readable as one column, then restore that authored column-
    major order when the 768px evidence width has room. */
@@ -1027,13 +1145,49 @@ button { font: inherit; cursor: pointer; }
 .paradigm.pg-case-labels { --pg-label-col: 3.25em; }
 .paradigm.pg-long-case-labels { --pg-label-col: 4.65em; }
 .paradigm.pg-many-columns { --pg-label-col: 2.8em; --pg-gap: 2px; }
+/* 5I-SPEC1 4.7: a wide chart with no row labels reclaims the empty gutter --
+   chapter 16's Passive Stems needs every pixel for three columns of long
+   passive forms, and the column it was leaving blank held nothing. */
+/* The empty label span STAYS in the markup and simply sits in a zero-width
+   track: `display: none` on it would take it out of grid flow and shift every
+   cell in the row one column left, dropping the last one off the edge. */
+.paradigm.pg-no-row-labels { --pg-label-col: 0px; --pg-gap: 3px; }
+/* And its own type ramp. Chapter 16's longest passive form, γνωσθήσομαι, is
+   eleven glyphs; at the 320px floor a third of the card is about 85px, so it
+   sets at 0.86rem and grows back to the ordinary chart size as soon as there
+   is room. Below the floor the shared `pg-long-forms` nowrap would CLIP it --
+   silently, since overflow-x is hidden app-wide. */
+.paradigm.pg-no-row-labels.pg-long-forms .pg-greek { font-size: 0.82rem; }
+.paradigm.pg-no-row-labels .pg-cell-text { font-size: 0.82rem; }
+.paradigm.pg-no-row-labels .pg-head { font-size: 0.66rem; }
+@media (min-width: 400px) {
+  .paradigm.pg-no-row-labels.pg-long-forms .pg-greek,
+  .paradigm.pg-no-row-labels .pg-cell-text { font-size: 1rem; }
+}
+@media (min-width: 560px) {
+  .paradigm.pg-no-row-labels.pg-long-forms .pg-greek,
+  .paradigm.pg-no-row-labels .pg-cell-text { font-size: 1.2rem; }
+}
 .pg-head, .pg-row { display: grid; grid-template-columns: var(--pg-label-col) repeat(var(--pg-cols, 2), minmax(0, 1fr));
   gap: var(--pg-gap); align-items: stretch; }
 .pg-head { padding: 6px 2px; border-bottom: 2px solid rgba(0,0,0,0.1); color: var(--teal-dark);
   font-size: 0.75rem; font-weight: 700; text-transform: uppercase; text-align: center; }
 .pg-head > span { min-width: 0; overflow-wrap: break-word; }
-.pg-group-head { border-bottom-width: 1px; padding-bottom: 3px; }
-.pg-column-group { color: var(--accent-ink); }
+/* 5I-SPEC1 4.1 -- COLUMN GROUPS STACK. A chart that declares `columnGroups`
+   draws one block per group down the page instead of one grid across it: at
+   320px the six-across original overprinted its own headers and lost columns
+   off the right edge, and overflow is CLIPPED app-wide, so nothing scrolled
+   and nothing errored. DISCLOSURE-RULES 4.6 forbids paging the Review copy and
+   in the same breath describes the answer -- a C9 page stacks its paradigms
+   vertically, Singular above Plural. Each block heads itself with its group
+   label and repeats the case-label column, so no row loses its name. */
+.pg-grid.pg-grouped { gap: 14px; }
+.pg-group-label { text-align: center; font-size: 0.85rem; font-weight: 700;
+  text-transform: uppercase; letter-spacing: 0.03em; color: var(--accent-ink);
+  padding-bottom: 2px; }
+/* The last block's final row keeps the rule under it that the ungrouped chart
+   draws; the blocks are separated by the grid gap above, not by a border. */
+.pg-group + .pg-group { padding-top: 2px; }
 .pg-column { display: flex; align-items: center; justify-content: center; min-width: 0;
   overflow-wrap: break-word; line-height: 1.2; }
 .pg-column-audio { background: transparent; border: none; padding: 0 2px; color: var(--link);
@@ -1056,6 +1210,14 @@ button { font: inherit; cursor: pointer; }
 .pg-long-forms { --pg-gap: 4px; }
 .pg-long-forms .pg-greek { font-size: 1.08rem; white-space: nowrap; overflow-wrap: normal; }
 .pg-greek-tap:disabled .pg-greek { color: var(--ink); }
+/* 5I-SPEC1 4.7: an inert `text` cell (chapter 16's "no future passive" em
+   dash). Same box and the same vertical rhythm as the tap it stands in for,
+   so the rows do not stagger where a dash sits beside a form -- but ink, no
+   Greek face, and nothing to press. */
+.pg-cell-text { display: flex; align-items: center; justify-content: center; width: 100%;
+  padding: 9px 0; color: var(--ink); font-size: 1.35rem; line-height: 1; }
+.pg-long-forms .pg-cell-text { font-size: 1.08rem; }
+.pg-many-columns .pg-cell-text { padding: 8px 0; font-size: 0.92rem; }
 .pg-gloss { min-width: 0; max-width: 100%; font-size: 0.78rem; line-height: 1.3;
   color: var(--teal-dark); overflow-wrap: anywhere; }
 .pg-many-columns .pg-head { font-size: 0.66rem; }
@@ -1790,6 +1952,18 @@ button.rc-term-name { font-weight: 700; }
      columns at the supported 320px floor. */
   .paradigm.pg-three-columns.pg-long-forms .pg-head { font-size: 0.7rem; }
   .paradigm.pg-three-columns.pg-long-forms .pg-greek { font-size: 1.04rem; }
+  /* ...except the label-less wide chart, which has its own ramp above and is
+     already at the size its eleven-glyph forms need. In a MODAL it has less
+     room again: the dialog is inset from the card the page draws. */
+  .paradigm.pg-no-row-labels.pg-long-forms .pg-greek { font-size: 0.82rem; }
+  .modal .paradigm.pg-no-row-labels.pg-long-forms .pg-greek { font-size: 0.76rem; }
+  /* 5I-SPEC1: the two Verb Forms hint charts of chapters 14 and 15 put an
+     English gloss in the row-label gutter and a ten-glyph Greek form in each of
+     two columns -- ἀποθνῄσκω against "I came, went". Nothing else in sixteen
+     chapters is 2-column with BOTH a long label and long forms, so this is the
+     pair, and at the 320px floor they clipped by 7-8px. */
+  .paradigm.pg-long-case-labels.pg-long-forms { --pg-label-col: 4.1em; }
+  .paradigm.pg-long-case-labels.pg-long-forms .pg-greek { font-size: 0.95rem; }
   .rc-item-below .rc-expander-body { padding-left: 8px; padding-right: 8px; }
   .rc-item-below .rc-pfrows.arrow-form { column-gap: 4px; }
   .rc-item-below .rc-pfrows.arrow-form .rc-pfgreek { font-size: 1.05rem; }
diff --git a/src/components/ActivityHost.svelte b/src/components/ActivityHost.svelte
index 5edda39..054e8ca 100644
--- a/src/components/ActivityHost.svelte
+++ b/src/components/ActivityHost.svelte
@@ -39,7 +39,13 @@
 </script>
 
 {#if chapter && activity}
-  {#if activity.instructions && !activity.instructions.startsWith('_verify')}
+  <!-- 5I-SPEC1 §4.4: an activity whose instruction line CHANGES PER ITEM draws
+       it itself, in this same slot and with this same class, because only the
+       activity knows which item is on screen. The activity-level string stays
+       in the data as the fallback for any surface that has not loaded an item
+       yet -- it is simply not drawn from here, or the line would appear
+       twice. -->
+  {#if activity.instructions && !activity.instructionsPerItem && !activity.instructions.startsWith('_verify')}
     <div class="instructions">{stripMarkup(activity.instructions)}</div>
   {/if}
   <!-- Consecutive routes often render the SAME component type; Svelte would
diff --git a/src/components/ContentAudio.svelte b/src/components/ContentAudio.svelte
index c9bacb2..fe57726 100644
--- a/src/components/ContentAudio.svelte
+++ b/src/components/ContentAudio.svelte
@@ -260,6 +260,38 @@
     return m.name || item.secondary || '';
   }
 
+  // 5I-SPEC1 4.3 / NIT-LOG N-6: A REVIEW CHART WITH MORE THAN ONE SAY-ALL.
+  // Chapter 13's Review Vocabulary Chart is the first. The original pages it
+  // five-and-five behind More/Back with a SEPARATE recording per half
+  // (m_vocla, m_voclb); DISCLOSURE-RULES 4.6 forbids a pager on a Review page
+  // (students print them), so the port shows all ten rows in one scroll and
+  // keeps both recordings -- five rows, a Say List button, five more rows, a
+  // second Say List button. Ruled by Nathanael 2026-08-29.
+  //
+  // `playAllGroups` and the single `playAll` are MUTUALLY EXCLUSIVE; every
+  // other chart in the app keeps `playAll` and renders exactly as before.
+  // `afterRow` is 1-BASED and counts DOWN THE PRINTED LIST, which is why the
+  // grouped chart also drops the desktop two-column flow: at 768px the
+  // column-major grid puts row 5 at the foot of the left column, and a button
+  // "after row 5" would land in the middle of the chart rather than under the
+  // half it speaks. The original's own ch13 page is a single column of five
+  // (ch13railwalk p16/p17), so one column is the faithful shape here as well.
+  $: playAllGroups = Array.isArray(activity.playAllGroups) && activity.playAllGroups.length
+    ? activity.playAllGroups
+    : null;
+  $: reviewVocabGroups = playAllGroups
+    ? playAllGroups.map((group, index) => {
+        const from = index === 0 ? 0 : (playAllGroups[index - 1].afterRow || 0);
+        return { rows: items.slice(from, group.afterRow ?? items.length), group };
+      // A trailing group is only drawn when it has rows; a chart whose last
+      // afterRow stops short of the list would otherwise lose the remainder.
+      }).concat(
+        (playAllGroups[playAllGroups.length - 1].afterRow ?? items.length) < items.length
+          ? [{ rows: items.slice(playAllGroups[playAllGroups.length - 1].afterRow), group: null }]
+          : []
+      ).filter(entry => entry.rows.length)
+    : [];
+
   // --- vowelStair groups (items resolved from alphabet.vowels carry group) ---
   $: vowelGroups = mode === 'vowelStair'
     ? [
@@ -300,6 +332,17 @@
       {@const taps = typeof o === 'string' ? null : o.audioMap}
       <li>{#if taps}{#each splitTaps(text, taps) as part}{#if part.audio}<button class="greek-tap greek" on:click={() => play(part.audio)}>{part.t}</button>{:else}{part.t}{/if}{/each}{:else}{text}{/if}</li>
     {/each}</ol>
+    <!-- 5I-SPEC1 4.2: A CLOSING PARAGRAPH BELOW THE LIST. Chapter 13's
+         objectives page ends "Congratulations! After mastering this chapter,
+         you will know all the noun forms in the New Testament." (TBK field
+         0x3020c) -- one paragraph under the numbered list, in ordinary body
+         style. It is NOT an objective: folding it into the <ol> would number
+         it seven and tell the learner it is something to be able to DO. Only
+         chapter 13 carries the key in sixteen chapters, so nothing else on
+         this surface changes. -->
+    {#if chapter.objectivesPostamble}
+      <p class="objectives-postamble">{chapter.objectivesPostamble}</p>
+    {/if}
   </div>
 
 {:else if mode === 'topicPages'}
@@ -618,24 +661,41 @@
        it is the single button it has always been, and the Learn flashcard
        ignores `parts` entirely and keeps playing the lemma's all-forms clip. -->
   <div class="card">
-    <div class="review-vocab" class:two-columns={activity.columns === 2}
-         style={`--rv-rows:${Math.ceil(items.length / (activity.columns || 1))}`}>
-      {#each items as r}
-        <div class="rv-row">
-          {#if r.parts}
-            <span class="rv-greek rv-forms greek" data-rv-parts={r.parts.length}>{#each splitTaps(r.display, partTaps(r.parts)) as seg}{#if seg.audio}<button class="rv-form greek" data-audio-id={seg.audio} on:click={() => play(seg.audio)}>{seg.t}</button>{:else}{seg.t}{/if}{/each}</span>
-          {:else}
-            <button class="rv-greek greek" on:click={() => r.audio && play(r.audio)}>{r.display}</button>
-          {/if}
-          <span class="rv-gloss">{r.secondary}{#if activity.showNtFreq && r.meta && r.meta.ntFreq} <span class="rv-freq">({r.meta.ntFreq})</span>{/if}</span>
+    <!-- 5I-SPEC1 4.3: ONE block per say-all. Without `playAllGroups` this is
+         the single block every chart has always drawn, with the same class,
+         the same --rv-rows and the same two-column desktop flow. -->
+    {#each (playAllGroups ? reviewVocabGroups : [{ rows: items, group: null }]) as block, blockIndex}
+      <div class="review-vocab" class:two-columns={activity.columns === 2 && !playAllGroups}
+           data-rv-block={blockIndex}
+           style={`--rv-rows:${Math.ceil(block.rows.length / (playAllGroups ? 1 : (activity.columns || 1)))}`}>
+        {#each block.rows as r}
+          <div class="rv-row">
+            {#if r.parts}
+              <span class="rv-greek rv-forms greek" data-rv-parts={r.parts.length}>{#each splitTaps(r.display, partTaps(r.parts)) as seg}{#if seg.audio}<button class="rv-form greek" data-audio-id={seg.audio} on:click={() => play(seg.audio)}>{seg.t}</button>{:else}{seg.t}{/if}{/each}</span>
+            {:else}
+              <button class="rv-greek greek" on:click={() => r.audio && play(r.audio)}>{r.display}</button>
+            {/if}
+            <span class="rv-gloss">{r.secondary}{#if activity.showNtFreq && r.meta && r.meta.ntFreq} <span class="rv-freq">({r.meta.ntFreq})</span>{/if}</span>
+          </div>
+        {/each}
+      </div>
+      {#if block.group}
+        <!-- The recording for THIS half, under the rows it speaks. Audio
+             buttons are not pagination (4.6), so nothing here is a pager and
+             every row above stays on screen. -->
+        <div class="controls rv-group-controls" data-rv-group={blockIndex}>
+          <button class="btn secondary" data-audio-id={block.group.audio}
+                  on:click={() => play(block.group.audio)}>{block.group.label || 'Say Whole List'}</button>
         </div>
-      {/each}
-    </div>
+      {/if}
+    {/each}
     <!-- The original prints the ntFreq legend under the chart, not as a note
          banner: it explains the numbers already on screen. -->
     {#if activity.footnote}<div class="rv-footnote">{activity.footnote}</div>{/if}
     <div class="controls">
-      {#if activity.playAll || activity.sayWholeListAudio}
+      <!-- `playAll` (single) and `playAllGroups` are mutually exclusive; a
+           grouped chart has already drawn its buttons above, one per half. -->
+      {#if !playAllGroups && (activity.playAll || activity.sayWholeListAudio)}
         <button class="btn secondary" on:click={() => play(activity.playAll?.audio || activity.sayWholeListAudio)}>{activity.playAll?.label || 'Say Whole List'}</button>
       {/if}
     </div>
diff --git a/src/components/Paradigm.svelte b/src/components/Paradigm.svelte
index a607223..3a68a5e 100644
--- a/src/components/Paradigm.svelte
+++ b/src/components/Paradigm.svelte
@@ -108,18 +108,79 @@
   $: columns = chart.columns || [];
   $: columnAudio = chart.columnAudio || [];
   $: columnGroups = chart.columnGroups || [];
+  // 5I-SPEC1 4.1 -- THE SIX-COLUMN CHART. Chapter 13's pas adjective is the
+  // widest chart in the app: Masculine / Feminine / Neuter twice over, under a
+  // spanning Singular / Plural header row. At 320px it does not fit and this
+  // app CLIPS rather than scrolls, so the shipped six-across render lost its
+  // right-hand columns and overprinted its headers with nothing to scroll and
+  // nothing to error (measured: the grid overran by 10px and individual cells
+  // by up to 10px, with headers reading "MASCULFEMININEUTER").
+  //
+  // A PAGER IS FORBIDDEN on the Quick Review copy (DISCLOSURE-RULES 4.6:
+  // students print Review pages, so everything must be in one flowing scroll)
+  // and inventing one is explicitly ruled out by the spec. What the same rule
+  // asks for instead is already written down: a C9 page "stacks paradigms
+  // vertically (Singular above Plural)". So a chart that declares
+  // `columnGroups` draws ONE BLOCK PER GROUP, stacked, each headed by its
+  // group label and carrying its own copy of the case-label column. Nothing is
+  // hidden, nothing pages, and the widest thing on screen becomes a
+  // three-column chart, the density chapter 5's article chart and chapter 16's
+  // passive stems already sit at comfortably.
+  //
+  // Every cell keeps its own clip and its own tap; the say-all still speaks the
+  // whole paradigm once, beneath both halves (NIT-LOG N-1: a stacked Quick
+  // Review chart gets ONE button, after the last half). Chapter 13's pas chart
+  // is the only chart in sixteen chapters that declares `columnGroups`, so no
+  // other chart's rendering moves.
+  $: groupedColumns = columnGroups.length > 1
+    ? columnGroups.reduce((acc, group) => {
+        const from = acc.at;
+        const span = group.span || 1;
+        acc.at = from + span;
+        acc.blocks.push({
+          label: group.label,
+          from,
+          columns: columns.slice(from, from + span),
+          columnAudio: columnAudio.slice(from, from + span)
+        });
+        return acc;
+      }, { at: 0, blocks: [] }).blocks
+    : [];
   $: rows = chart.rows || [];
   $: showGlosses = chart.showGlosses !== false;
   $: hasCaseLabels = rows.some(row => row.label != null);
   $: hasLongCaseLabels = rows.some(row => String(row.label || '').length > 5);
+  // 5I-SPEC1 4.7 -- A CHART WITH NO ROW LABELS AT ALL. Chapter 16's Passive
+  // Stems table is a list of verbs across three tense columns; every row's
+  // label is null, so the label gutter is a blank column stealing width from
+  // three columns of long forms, and none of the density rules fired because
+  // every one of them keys off having case labels. At 320px that put
+  // ἀποστέλλω, ἐγερθήσομαι and γνωσθήσομαι through the "break anywhere" rule
+  // and each printed across two lines mid-word.
+  //
+  // Scoped to THREE OR MORE columns so the one other label-less chart in
+  // sixteen chapters -- chapter 7's two-column εἰμί paradigm, device-verified
+  // as it stands -- is untouched.
+  $: hasRowLabels = rows.some(row => {
+    const label = row.label != null ? row.label : row.person;
+    return label != null && String(label) !== '';
+  });
+  $: labelFreeWideChart = !hasRowLabels && effectiveColumnCount >= 3;
   // How long a form has to be before the cells need shrinking depends on how
   // many columns share the width. Two columns tolerate a nine-letter form;
   // THREE do not — chapter 7's adjective paradigm sets ἀγαθῶν, ἀγαθοῖς and
   // ἀγαθούς three abreast and broke each of them across two lines at 380px
   // (rail-walk comparison against ch7railwalk p14). Chapter 5's three-column
   // article chart holds forms of three and four letters and is untouched.
-  $: formLimit = columns.length >= 3 ? 5 : 7;
-  $: hasLongForms = hasCaseLabels && rows.some(row => (row.cells || [])
+  // 4.1: how many columns are on screen AT ONCE, which is what the density
+  // tiers are about. A grouped chart draws one group at a time down the page,
+  // so a six-column paradigm is three columns wide and takes the three-column
+  // type sizes rather than the crushed six-column ones.
+  $: effectiveColumnCount = groupedColumns.length
+    ? Math.max(...groupedColumns.map(group => group.columns.length))
+    : columns.length;
+  $: formLimit = effectiveColumnCount >= 3 ? 5 : 7;
+  $: hasLongForms = (hasCaseLabels || labelFreeWideChart) && rows.some(row => (row.cells || [])
     .some(cell => [...String(cell.greek || '')].length > formLimit));
   // Endings rows are flat [ending, gloss, ending, gloss] tuples -- one pair per
   // number column, so the popup lines up with the chart above it.
@@ -242,8 +303,9 @@
   class:pg-case-labels={hasCaseLabels}
   class:pg-long-case-labels={hasLongCaseLabels}
   class:pg-long-forms={hasLongForms}
-  class:pg-three-columns={columns.length === 3}
-  class:pg-many-columns={columns.length > 3}
+  class:pg-no-row-labels={labelFreeWideChart}
+  class:pg-three-columns={effectiveColumnCount === 3}
+  class:pg-many-columns={effectiveColumnCount > 3}
   class:pg-modal-host={modalHost}
   class:pg-pins-nav={pinNav}
   data-chart-index={chartIndex}
@@ -308,21 +370,61 @@
            the paradigm back. -->
       <EndingsGrid rows={endingRows} {columns} />
     {:else}
-    <div class="pg-grid" style="--pg-cols:{columns.length}">
-      {#if columnGroups.length}
-        <div class="pg-head pg-group-head" style="--pg-cols:{columns.length}">
-          <span class="pg-person pg-head-spacer">&nbsp;</span>
-          {#each columnGroups as group, groupIndex}
-            <span
-              class="pg-column-group"
-              data-column-group={groupIndex}
-              style={`grid-column: span ${group.span || 1}`}>
-              {group.label}
-            </span>
+    <div class="pg-grid" class:pg-grouped={groupedColumns.length}
+         style="--pg-cols:{groupedColumns.length ? groupedColumns[0].columns.length : columns.length}">
+      {#each groupedColumns as group, groupIndex}
+        <!-- 4.1: one block per column group, stacked. The group label is the
+             block's heading rather than a spanning cell above six columns.
+             The row markup below is the ungrouped branch's, sliced to this
+             group's columns; the two are a PAIR and a change to a cell in one
+             belongs in the other. Svelte 4 has no snippet to share them with,
+             and factoring a component out for one chart in sixteen chapters
+             would cost more than it saves. -->
+        <div class="pg-group" data-column-group={groupIndex}
+             style="--pg-cols:{group.columns.length}">
+          <div class="pg-group-label">{group.label}</div>
+          <div class="pg-head">
+            <span class="pg-person pg-head-spacer">&nbsp;</span>
+            {#each group.columns as column, columnIndex}
+              {#if group.columnAudio[columnIndex]}
+                <button
+                  class="pg-column pg-column-audio"
+                  data-column-index={group.from + columnIndex}
+                  aria-label={`Play ${column}`}
+                  on:click={() => play(group.columnAudio[columnIndex])}>
+                  {column}
+                </button>
+              {:else}
+                <span class="pg-column" data-column-index={group.from + columnIndex}>{column}</span>
+              {/if}
+            {/each}
+          </div>
+          {#each rows as row, rowIndex}
+            <div class="pg-row" data-row-index={rowIndex}>
+              <span class="pg-person pg-row-label">{row.label ?? row.person ?? ''}</span>
+              {#each (row.cells || []).slice(group.from, group.from + group.columns.length) as cell, cellIndex}
+                <div
+                  class="pg-cell"
+                  class:pg-cell-gloss={showGlosses && !!cell.gloss}
+                  data-cell-index={group.from + cellIndex}>
+                  {#if cell.greek == null && cell.text != null}
+                    <span class="pg-cell-text" data-cell-text>{cell.text}</span>
+                  {:else}
+                    <button
+                      class="pg-greek-tap"
+                      disabled={!cell.audio}
+                      on:click={() => cell.audio && play(cell.audio)}>
+                      <span class="greek pg-greek">{cell.greek}</span>
+                    </button>
+                  {/if}
+                  {#if showGlosses && cell.gloss}<span class="pg-gloss">{cell.gloss}</span>{/if}
+                </div>
+              {/each}
+            </div>
           {/each}
         </div>
-      {/if}
-      {#if columns.length}
+      {/each}
+      {#if !groupedColumns.length && columns.length}
         <div class="pg-head">
           <span class="pg-person pg-head-spacer">&nbsp;</span>
           {#each columns as column, columnIndex}
@@ -340,7 +442,7 @@
           {/each}
         </div>
       {/if}
-      {#each rows as row, rowIndex}
+      {#each groupedColumns.length ? [] : rows as row, rowIndex}
         <!-- 5F: a chart whose rows run singular THEN plural down one column
              legends each block with its number, exactly where the number
              changes — chapter 7's Review Adjectives Paradigm prints
@@ -357,12 +459,26 @@
               class="pg-cell"
               class:pg-cell-gloss={showGlosses && !!cell.gloss}
               data-cell-index={cellIndex}>
-              <button
-                class="pg-greek-tap"
-                disabled={!cell.audio}
-                on:click={() => cell.audio && play(cell.audio)}>
-                <span class="greek pg-greek">{cell.greek}</span>
-              </button>
+              {#if cell.greek == null && cell.text != null}
+                <!-- 5I-SPEC1 4.7: A CELL THAT IS NOT A FORM. Chapter 16's
+                     Passive Stems chart prints an em dash where a verb has no
+                     future passive -- eight of its fifteen rows -- and the data
+                     ships that dash as a `text` cell rather than a `greek` one
+                     precisely so it cannot be mistaken for a word. It is
+                     notation: no clip, no tap, no Greek face, ink not blue
+                     (directive 8), and no button for a screen reader to offer.
+                     `greek` and `text` are alternatives on a cell; every chart
+                     in sixteen chapters that ships only `greek` cells is
+                     untouched. -->
+                <span class="pg-cell-text" data-cell-text>{cell.text}</span>
+              {:else}
+                <button
+                  class="pg-greek-tap"
+                  disabled={!cell.audio}
+                  on:click={() => cell.audio && play(cell.audio)}>
+                  <span class="greek pg-greek">{cell.greek}</span>
+                </button>
+              {/if}
               {#if showGlosses && cell.gloss}<span class="pg-gloss">{cell.gloss}</span>{/if}
             </div>
           {/each}
diff --git a/src/components/RichContent.svelte b/src/components/RichContent.svelte
index bc7dadc..4d803fb 100644
--- a/src/components/RichContent.svelte
+++ b/src/components/RichContent.svelte
@@ -418,6 +418,12 @@
            class:gloss-only={b.layout === 'glossOnly'} class:english-pairs={b.layout === 'englishPairs'}
            class:compound-verbs={b.layout === 'compoundVerbs'}
            class:contraction={b.layout === 'contraction'}
+           class:key-letter-box={b.layout === 'keyLetterBox'}
+           class:transformation={b.layout === 'transformation'}
+           class:stem-list={b.layout === 'stemList'}
+           class:ending-transformation={b.layout === 'endingTransformation'}
+           class:shift-summary={b.layout === 'shiftSummary'}
+           class:principal-parts={b.layout === 'principalParts'}
            class:titled={b.title} class:centered={b.centered} class:rc-gap-before={b.gapBefore}
            class:paired-gutter={b.pairedGutter}>
         <!-- `headerUnderline` USED TO BIND `head-underline` HERE, and does not
@@ -434,7 +440,32 @@
              "Punctuation:", "Apostrophe:  ( ᾽ )  elided letters"). The title
              owns its line in the heading green; the rows hang beneath it. -->
         {#if b.title}<div class="rc-greektitle"><Marked text={b.title} /></div>{/if}
-        {#if b.columns}
+        {#if b.layout === 'keyLetterBox'}
+          <!-- 5I-SPEC1 4.6: the Key Letter Box's COLUMN HEADERS are C3 in-chart
+               triggers, not labels: Unvoiced / Voiced / Aspirate each open
+               their own popup, as do the three row labels beside the grid --
+               six triggers in one chart, a shape no earlier chapter has.
+               DISCLOSURE-RULES 3.3: an in-chart trigger keeps its existing
+               appearance and takes NO green underline, which would collide
+               with the blue Greek-tap convention. The original prints these
+               six blue and unmarked, so that is what they are here: blue
+               because they are tappable (directive 8), and nothing else.
+               `columns` on this layout is a list of OBJECTS ({label,
+               popupRef}), which is why the shared string header below cannot
+               draw it. -->
+          <div class="rc-klb-head">
+            <span class="rc-klb-corner">&nbsp;</span>
+            {#each b.columns as column}
+              {@const columnPopup = linkedPopup(column.popupRef)}
+              {#if columnPopup}
+                <button class="popup-link rc-chart-trigger" data-chart-trigger={column.popupRef}
+                        on:click={() => openPopup(columnPopup)}>{column.label}</button>
+              {:else}
+                <span class="rc-klb-label">{column.label}</span>
+              {/if}
+            {/each}
+          </div>
+        {:else if b.columns}
           <div class="rc-greekhead" style={gridVars}>
             {#each b.columns as column}<span>{column}</span>{/each}
             {#if rowLabels}<span class="rc-headspacer">&nbsp;</span>{/if}
@@ -521,6 +552,142 @@
               </span>
             </div>
 
+          {:else if b.layout === 'keyLetterBox'}
+            <!-- The nine consonant cells are NOTATION. No clip exists for any
+                 of them, the rail walk shows no hand cursor over one, and the
+                 chart teaches what the LETTERS look like across three voiced
+                 classes rather than how each sounds alone -- the same
+                 treatment chapter 12's augment rule lines get. So they render
+                 in the Greek face, in ink, with nothing to press; only the six
+                 labels around the grid are live. -->
+            {@const rowPopup = linkedPopup(row.popupRef)}
+            <div class="rc-greekrow rc-klb-row">
+              {#if rowPopup}
+                <button class="popup-link rc-chart-trigger" data-chart-trigger={row.popupRef}
+                        on:click={() => openPopup(rowPopup)}>{row.label}</button>
+              {:else}
+                <span class="rc-klb-label">{row.label}</span>
+              {/if}
+              {#each equationParts(row) as part}
+                <span class="rc-klb-cell greek">{part.greek != null ? part.greek : part.text}</span>
+              {/each}
+            </div>
+
+          {:else if b.layout === 'transformation' || b.layout === 'shiftSummary'}
+            <!-- 5I-SPEC1 4.6. `transformation` is chapter 13's three labelled
+                 rule lines ("Labials:" then the pi/beta/phi rule);
+                 `shiftSummary` is chapter 16's four label-less ones. Both are
+                 RULE NOTATION printed in the Greek face: a rule is not a word,
+                 no clip is wired to one, and the alignment of the columns
+                 INSIDE the line is the teaching -- which is why the text stays
+                 one preformatted run rather than being tokenised into taps.
+                 The label gutter is what keeps a set of rules stacked over
+                 each other. -->
+            <div class="rc-greekrow rc-rule-row" class:no-label={row.label == null}>
+              {#if row.label != null}<span class="rc-rule-label">{row.label}</span>{/if}
+              {#each equationParts(row) as part}
+                <span class="rc-rule-text greek">{part.greek != null ? part.greek : part.text}</span>
+              {/each}
+            </div>
+
+          {:else if b.layout === 'stemList'}
+            <!-- 5I-SPEC1 4.6 (chapters 14 and 15, the Aorist Stems of Verbs
+                 lists): lemma, dash, aorist, gloss. BOTH Greek forms are
+                 displayed Greek with a clip of their own, so both tap and
+                 neither speaks for the other (directive 9). The dash between
+                 them is the original's own connector and is inert. A row may
+                 additionally carry a popupRef: chapter 14 prints its aorist of
+                 blepo blue with a hand cursor over it (ch14railwalk p7/p8)
+                 because it opens a note on which verb that form really belongs
+                 to. The aorist cell is therefore BOTH an audio tap and an
+                 in-chart trigger, and the two cannot share one press -- the
+                 note gets its own marker beside the form rather than stealing
+                 the form's clip. -->
+            {@const stemPopup = linkedPopup(row.popupRef)}
+            <div class="rc-greekrow rc-stem-row">
+              {#if row.audio}
+                <button class="rc-stem-lemma greek greek-say" on:click={() => playAudio(row.audio)}>{row.greek}</button>
+              {:else}
+                <span class="rc-stem-lemma greek">{row.greek}</span>
+              {/if}
+              <span class="rc-stem-forms">
+                {#each equationParts(row) as part}
+                  {#if part.greek}
+                    {#if part.audio}
+                      <button class="rc-part greek greek-say" on:click={() => playAudio(part.audio)}>{part.greek}</button>
+                    {:else}
+                      <span class="rc-part greek">{part.greek}</span>
+                    {/if}
+                  {:else}
+                    <span class="rc-parttext">{part.text}</span>
+                  {/if}
+                {/each}
+                {#if stemPopup}
+                  <button class="popup-link rc-chart-trigger rc-stem-note" data-chart-trigger={row.popupRef}
+                          aria-label="About this form" on:click={() => openPopup(stemPopup)}>?</button>
+                {/if}
+              </span>
+              {#if row.gloss != null && row.gloss !== ''}<span class="rc-stem-gloss">{row.gloss}</span>{/if}
+            </div>
+
+          {:else if b.layout === 'endingTransformation'}
+            <!-- 5I-SPEC1 4.6 (chapters 15 and 16): a labelled rule line with a
+                 WORKED EXAMPLE indented beneath it. The label is an in-chart C3
+                 trigger where the chapter wires one (chapter 15's Palatals /
+                 Labials / Dentals open sound descriptions; chapter 16's do
+                 not), and chapter 16's third line carries no label at all. The
+                 rule itself is notation and stays ink. `noteAudioMap` maps the
+                 forms inside the example to clips, so both sides of the
+                 derivation tap and the connectors between them do not -- the
+                 same form-to-clip map chart notes already use. -->
+            {@const rulePopup = linkedPopup(row.popupRef)}
+            <div class="rc-etf-row">
+              <div class="rc-etf-rule" class:no-label={row.label == null}>
+                {#if row.label != null}
+                  {#if rulePopup}
+                    <button class="popup-link rc-chart-trigger rc-etf-label" data-chart-trigger={row.popupRef}
+                            on:click={() => openPopup(rulePopup)}>{row.label}</button>
+                  {:else}
+                    <span class="rc-etf-label">{row.label}</span>
+                  {/if}
+                {/if}
+                {#each equationParts(row) as part}
+                  <span class="rc-etf-text greek">{part.greek != null ? part.greek : part.text}</span>
+                {/each}
+              </div>
+              {#if row.note}
+                <div class="rc-etf-example greek">{#each splitTaps(row.note, row.noteAudioMap || null) as seg}{#if seg.audio}<button class="greek-tap greek" on:click={() => playAudio(seg.audio)}>{seg.t}</button>{:else}{seg.t}{/if}{/each}</div>
+              {/if}
+            </div>
+
+          {:else if b.layout === 'principalParts'}
+            <!-- 5I-SPEC1 4.6 (chapter 16's Comparison with Greek): the six
+                 principal parts of ballo. The original sets them as a
+                 three-across grid with each label over its form; the data
+                 emits SIX LABELLED ROWS, which is the shape the spec asks for
+                 and the one that leaves room for a label as long as
+                 "Perf mid/pass" at phone width. Every form keeps its own clip
+                 and its own tap. The labels are underlined in the original and
+                 render WITHOUT the underline: green underline is exclusive to
+                 tappable elements app-wide (DISCLOSURE-RULES 3.2), and a
+                 column label is not one. -->
+            <div class="rc-greekrow rc-pp-row">
+              <span class="rc-pp-label">{row.label}</span>
+              <span class="rc-pp-forms">
+                {#each equationParts(row) as part}
+                  {#if part.greek}
+                    {#if part.audio}
+                      <button class="rc-part greek greek-say" on:click={() => playAudio(part.audio)}>{part.greek}</button>
+                    {:else}
+                      <span class="rc-part greek">{part.greek}</span>
+                    {/if}
+                  {:else}
+                    <span class="rc-parttext">{part.text}</span>
+                  {/if}
+                {/each}
+              </span>
+            </div>
+
           {:else if row.parts}
             <!-- C6: an equation row (\u03b4\u03b9\u03ac + \u03b1\u1f50\u03c4\u03bf\u1fe6 becomes \u03b4\u03b9\u1fbd \u03b1\u1f50\u03c4\u03bf\u1fe6). Each Greek
                  part is its OWN tap target with its own clip; the connecting
diff --git a/src/components/SelectActivity.svelte b/src/components/SelectActivity.svelte
index 2bcf4d8..80b9cd6 100644
--- a/src/components/SelectActivity.svelte
+++ b/src/components/SelectActivity.svelte
@@ -35,6 +35,7 @@
   // has a special case for it.
   import { onDestroy } from 'svelte';
   import { authoredOptionSource, buildSelectQuestions, buildTwoStageQuestions, headingCovers, headingKey, paradigmToggleLabels, randomFeedback, resolveContentById, resolveHintBlocks, resolveHintPage, resolveHintRef } from '../lib/content.js';
+  import { stripMarkup } from '../lib/markup.js';
   import { combiningForMarkName, firstAccentCluster, markOverlayParts } from '../lib/greek.js';
   import { play, playThrough, stop as stopAudio } from '../lib/audio.js';
   import { markCompleted } from '../lib/progress.js';
@@ -641,6 +642,19 @@
 
 <svelte:window on:keydown={showHint ? (e) => { if (e.key === 'Escape') showHint = false; } : null} />
 
+<!-- 5I-SPEC1 §4.4: THE INSTRUCTION LINE, WHEN IT BELONGS TO THE ITEM. Chapter
+     16's Passive Verbs Form Drill shows the same prompt panel for a verb's
+     aorist question and its future one, and the original switches the line
+     above the options between "Click on the correct matching aorist form" and
+     "...future form" per item. ActivityHost stops drawing the static line for
+     an `instructionsPerItem` activity and this takes over the same slot,
+     immediately above the card, with the same class -- so the line does not
+     move, it only changes. The activity-level string is the fallback for an
+     item that carries none. -->
+{#if activity.instructionsPerItem && (current?.instructions || activity.instructions)}
+  <div class="instructions" data-instructions-per-item>{current?.instructions || stripMarkup(activity.instructions)}</div>
+{/if}
+
 <div class="card">
   {#if finished}
     <div class="scorebox" style="font-size:1.2rem; padding: 20px 0">
diff --git a/src/components/SpellActivity.svelte b/src/components/SpellActivity.svelte
index e17275c..ac05f18 100644
--- a/src/components/SpellActivity.svelte
+++ b/src/components/SpellActivity.svelte
@@ -63,6 +63,14 @@
         alts: altSpellings(it),
         gloss: it.prompt != null ? it.prompt : (it.gloss || ''),
         note: it.note || null,
+        // 5I-SPEC1 §4.5: the ANSWER FIELD'S OWN CAPTION, per item. Chapter
+        // 16's Forms Spelling Exercise asks a verb's passive aorist on one
+        // item and its passive future on the next from an identical prompt
+        // panel, and the original switches the box's label between "Passive
+        // Aorist Form" and "Passive Future Form" (DOSBox-confirmed
+        // 2026-08-29). Where an item carries none, ui.fields[1] stands as it
+        // always has.
+        answerLabel: it.answerLabel || null,
         audio: it.audio || (lemma && lemma.audio) || null
       };
     }
@@ -76,6 +84,7 @@
       // case tag beside it as a note.
       gloss: it.prompt != null ? it.prompt : (l.gloss || ''),
       note: it.note || null,
+      answerLabel: it.answerLabel || null,
       audio: l.audio || null
     };
   });
@@ -282,7 +291,15 @@
            "from (gen.)" (p12), "good (acc. pl. masc.)" (ch7railwalk p6),
            "I (nom sg)" (ch8railwalk p9). Never tappable; nothing on this pane
            is. -->
-      <div class="value" style="font-size:1.2rem">{word ? word.gloss : ''}{#if word && word.note}<span class="spell-prompt-note">{word.note}</span>{/if}</div>
+      <!-- 5I-SPEC1: the prompt pane may hold GREEK. The three Forms spellers of
+           chapters 14-16 print the PRESENT LEMMA in the prompt box and ask for
+           its aorist or passive form, so `promptIsGreek` puts the bundled
+           Greek face on it -- no Greek surface in this app may fall through to
+           a different glyph source (typography canon, 5B closeout). It stays
+           INK and untappable: the item's clip is the ANSWER (A1b, afterGuess),
+           there is no present-tense clip wired for these prompts, and blue
+           means tappable and nothing else (directive 8). -->
+      <div class="value" class:greek={!!activity.promptIsGreek} style="font-size:1.2rem">{word ? word.gloss : ''}{#if word && word.note}<span class="spell-prompt-note">{word.note}</span>{/if}</div>
       <!-- §3: a null ref renders NOTHING, not an empty chip. -->
       {#if word && word.ref}<div class="spell-prompt-ref">{word.ref}</div>{/if}
     </div>
@@ -291,7 +308,7 @@
          words. ui.fields is [prompt caption, answer caption]. -->
     <SpellerField
       state={buffer}
-      label={(activity.ui?.fields && activity.ui.fields[1]) || 'Spell Greek Word'}
+      label={(word && word.answerLabel) || (activity.ui?.fields && activity.ui.fields[1]) || 'Spell Greek Word'}
       locked={solved}
       on:caret={e => { if (!solved) buffer = input.placeCaret(buffer, e.detail.index, e.detail.after); }}
       on:caretEnd={() => { if (!solved) buffer = input.caretToEnd(buffer); }} />
diff --git a/src/data/chapt-13.json b/src/data/chapt-13.json
index 3862fd5..fce28b0 100644
--- a/src/data/chapt-13.json
+++ b/src/data/chapt-13.json
@@ -1408,8 +1408,7 @@
      ],
      "answer": "and the grace of God was upon him",
      "audio": "chapt_13_m_td1",
-     "hintRef": "tauDeltaParadigm",
-     "greek2": "καὶ κυρίου Ἰησοῦ Χριστοῦ"
+     "hintRef": "tauDeltaParadigm"
     },
     {
      "greek": "χάρις ὑμῖν καὶ εἰρήνη ἀπὸ θεοῦ πατρὸς ἡμῶν",
@@ -1421,7 +1420,8 @@
      ],
      "answer": "grace to you and peace from God our Father and the Lord Jesus Christ",
      "audio": "chapt_13_m_td2",
-     "hintRef": "tauDeltaParadigm"
+     "hintRef": "tauDeltaParadigm",
+     "greek2": "καὶ κυρίου Ἰησοῦ Χριστοῦ"
     },
     {
      "greek": "χάριτι δὲ θεοῦ εἰμι ὅ εἰμι",
@@ -1433,8 +1433,7 @@
      ],
      "answer": "but by the grace of God I am what I am",
      "audio": "chapt_13_m_td3",
-     "hintRef": "tauDeltaParadigm",
-     "greek2": "πνεύματος ὑμῶν"
+     "hintRef": "tauDeltaParadigm"
     },
     {
      "greek": "ἡ χάρις τοῦ κυρίου Ἰησοῦ Χριστοῦ μετὰ τοῦ",
@@ -1447,7 +1446,7 @@
      "answer": "the grace of the Lord Jesus Christ be with your spirit",
      "audio": "chapt_13_m_td4",
      "hintRef": "tauDeltaParadigm",
-     "greek2": "πάντων ὑμῶν"
+     "greek2": "πνεύματος ὑμῶν"
     },
     {
      "greek": "ἡ χάρις τοῦ κυρίου ἡμῶν Ἰησοῦ Χριστοῦ μετὰ",
@@ -1459,7 +1458,8 @@
      ],
      "answer": "the grace of our Lord Jesus Christ be with all of you",
      "audio": "chapt_13_m_td5",
-     "hintRef": "tauDeltaParadigm"
+     "hintRef": "tauDeltaParadigm",
+     "greek2": "πάντων ὑμῶν"
     },
     {
      "greek": "Ὁ δὲ θεὸς πάσης χάριτος",
@@ -1543,8 +1543,7 @@
      ],
      "answer": "for a spirit does not have flesh and bones",
      "audio": "chapt_13_m_td12",
-     "hintRef": "kappaParadigm",
-     "greek2": "οὐδένα"
+     "hintRef": "kappaParadigm"
     },
     {
      "greek": "ὑμεῖς κατὰ τὴν σάρκα κρίνετε, ἐγὼ οὐ κρίνω",
@@ -1556,7 +1555,8 @@
      ],
      "answer": "you judge according to the flesh, I judge no one",
      "audio": "chapt_13_m_td13",
-     "hintRef": "kappaParadigm"
+     "hintRef": "kappaParadigm",
+     "greek2": "οὐδένα"
     },
     {
      "greek": "καὶ καλέσεις τὸ ὄνομα αὐτοῦ Ἰησοῦν",
@@ -1580,8 +1580,7 @@
      ],
      "answer": "What is your name?",
      "audio": "chapt_13_m_td15",
-     "hintRef": "matParadigm",
-     "greek2": "ταῦτα:"
+     "hintRef": "matParadigm"
     },
     {
      "greek": "Τῶν δὲ δώδεκα ἀποστόλων τὰ ὀνόματά ἐστιν",
@@ -1593,7 +1592,8 @@
      ],
      "answer": "the names of the 12 apostles are these",
      "audio": "chapt_13_m_td16",
-     "hintRef": "matParadigm"
+     "hintRef": "matParadigm",
+     "greek2": "ταῦτα:"
     },
     {
      "greek": "νυνὶ δὲ μένει πίστις, ἐλπίς, ἀγάπη",
diff --git a/src/data/chapt-14.json b/src/data/chapt-14.json
index 9d15d73..5584ffe 100644
--- a/src/data/chapt-14.json
+++ b/src/data/chapt-14.json
@@ -66,7 +66,7 @@
       },
       {
        "type": "para",
-       "text": "The first aorist is formed from the present stem with an augment and a suffixed sa.",
+       "text": "The first aorist is formed from the present stem with an augment and a suffixed σα.",
        "gapBefore": true
       },
       {
@@ -1111,8 +1111,7 @@
      ],
      "answer": "Mary, for you have found favor with God",
      "audio": "chapt_14_n_td1",
-     "hintRef": "secondAoristParadigms",
-     "greek2": "πιστεύεις;"
+     "hintRef": "secondAoristParadigms"
     },
     {
      "greek": "καὶ ἔβαλεν εἰς τὴν γῆν",
@@ -1136,7 +1135,8 @@
      ],
      "answer": "Because I said to you that I saw you under the fig tree, you believe?",
      "audio": "chapt_14_n_td3",
-     "hintRef": "secondAoristParadigms"
+     "hintRef": "secondAoristParadigms",
+     "greek2": "πιστεύεις;"
     },
     {
      "greek": "ἐγενόμην ἐν πνεύματι ἐν τῇ κυριακῇ ἡμέρᾳ",
@@ -1160,8 +1160,7 @@
      ],
      "answer": "he was in the world, and the world was made by him",
      "audio": "chapt_14_n_td5",
-     "hintRef": "secondAoristParadigms",
-     "greek2": "καρδίαν μου"
+     "hintRef": "secondAoristParadigms"
     },
     {
      "greek": "εἶπαν οὖν οἱ μαθηταὶ αὐτῷ, Κύριε ...",
@@ -1173,8 +1172,7 @@
      ],
      "answer": "Therefore the disciples said to him, \"Lord...",
      "audio": "chapt_14_n_td6",
-     "hintRef": "secondAoristParadigms",
-     "greek2": "καὶ Ἀνδρέαν τὸν ἀδελφὸν αὐτοῦ"
+     "hintRef": "secondAoristParadigms"
     },
     {
      "greek": "Εὗρον Δαυὶδ τὸν τοῦ Ἰεσσαί, ἄνδρα κατὰ τὴν",
@@ -1187,7 +1185,7 @@
      "answer": "I found David son of Jesse a man after my heart",
      "audio": "chapt_14_n_td7",
      "hintRef": "secondAoristParadigms",
-     "greek2": "σε ἔγνων"
+     "greek2": "καρδίαν μου"
     },
     {
      "greek": "εἶδεν δύο ἀδελφούς, Σίμωνα τὸν λεγόμενον Πέτρον",
@@ -1200,7 +1198,7 @@
      "answer": "He saw two brothers, Simon called Peter, and Andrew his brother",
      "audio": "chapt_14_n_td8",
      "hintRef": "secondAoristParadigms",
-     "greek2": "τοῦτον ἦλθον"
+     "greek2": "καὶ Ἀνδρέαν τὸν ἀδελφὸν αὐτοῦ"
     },
     {
      "greek": "πάτερ δίκαιε, καὶ ὁ κόσμος σε οὐκ ἔγνω, ἐγὼ δέ",
@@ -1212,7 +1210,8 @@
      ],
      "answer": "Righteous father, although the world does not know you, I know you",
      "audio": "chapt_14_n_td9",
-     "hintRef": "secondAoristParadigms"
+     "hintRef": "secondAoristParadigms",
+     "greek2": "σε ἔγνων"
     },
     {
      "greek": "καὶ εἶπεν ὁ Ἰησοῦς, Εἰς κρίμα ἐγὼ εἰς τὸν κόσμον",
@@ -1224,7 +1223,8 @@
      ],
      "answer": "And Jesus said, \"For judgment I came into this world\"",
      "audio": "chapt_14_n_td10",
-     "hintRef": "secondAoristParadigms"
+     "hintRef": "secondAoristParadigms",
+     "greek2": "τοῦτον ἦλθον"
     },
     {
      "greek": "ὅτε οὖν εἶδεν ὁ ὄχλος ὅτι Ἰησοῦς οὐκ ἔστιν ἐκεῖ",
@@ -1248,8 +1248,7 @@
      ],
      "answer": "they did not find the body of the Lord Jesus",
      "audio": "chapt_14_n_td12",
-     "hintRef": "secondAoristParadigms",
-     "greek2": "οὐρανὸν οἱ ἄγγελοι"
+     "hintRef": "secondAoristParadigms"
     },
     {
      "greek": "καὶ ἐξῆλθον οἱ μαθηταὶ καὶ ἦλθον εἰς τὴν πόλιν",
@@ -1273,7 +1272,8 @@
      ],
      "answer": "And it happened as the angels went from them into heaven",
      "audio": "chapt_14_n_td14",
-     "hintRef": "secondAoristParadigms"
+     "hintRef": "secondAoristParadigms",
+     "greek2": "οὐρανὸν οἱ ἄγγελοι"
     },
     {
      "greek": "ἀλλὰ διὰ τοῦτο ἦλθον εἰς τὴν ὥραν ταύτην",
@@ -1321,8 +1321,7 @@
      ],
      "answer": "and in that hour there was a great earthquake",
      "audio": "chapt_14_n_td18",
-     "hintRef": "secondAoristParadigms",
-     "greek2": "Ῥαββί ..."
+     "hintRef": "secondAoristParadigms"
     },
     {
      "greek": "Οὐκ ἐγώ σε εἶδον ἐν τῷ κήπῳ μετ' αὐτοῦ;",
@@ -1334,8 +1333,7 @@
      ],
      "answer": "I saw you in the garden with him didn't I?",
      "audio": "chapt_14_n_td19",
-     "hintRef": "secondAoristParadigms",
-     "greek2": "εἶ ὁ Χριστὸς"
+     "hintRef": "secondAoristParadigms"
     },
     {
      "greek": "καὶ ἦλθον πρὸς τὸν Ἰωάννην καὶ εἶπαν αὐτῷ,",
@@ -1348,7 +1346,7 @@
      "answer": "and they came to John and said to him, \"Rabbi ...\"",
      "audio": "chapt_14_n_td20",
      "hintRef": "secondAoristParadigms",
-     "greek2": "μετὰ Ἰησοῦ"
+     "greek2": "Ῥαββί ..."
     },
     {
      "greek": "καὶ εἶπαν αὐτῷ, Τί οὖν Βαπτίζεις εἰ σὺ οὐκ",
@@ -1360,7 +1358,8 @@
      ],
      "answer": "they said to him, \"Why then are you baptizing if you are not the Christ\"",
      "audio": "chapt_14_n_td21",
-     "hintRef": "secondAoristParadigms"
+     "hintRef": "secondAoristParadigms",
+     "greek2": "εἶ ὁ Χριστὸς"
     },
     {
      "greek": "εἶδεν αὐτὸν ἄλλη καὶ λέγει τοῖς ἐκεῖ, Οὗτος ἦν",
@@ -1372,7 +1371,8 @@
      ],
      "answer": "another saw him and said to the ones there \"This one was with Jesus\"",
      "audio": "chapt_14_n_td22",
-     "hintRef": "secondAoristParadigms"
+     "hintRef": "secondAoristParadigms",
+     "greek2": "μετὰ Ἰησοῦ"
     },
     {
      "greek": "καὶ εἶπαν αὐτῷ, Ὁ πατὴρ ἡμῶν Ἀβραάμ ἐστιν",
@@ -1384,8 +1384,7 @@
      ],
      "answer": "and they said to him, \"Abraham is our father\"",
      "audio": "chapt_14_n_td23",
-     "hintRef": "secondAoristParadigms",
-     "greek2": "ἐν τῷ ἱερῷ"
+     "hintRef": "secondAoristParadigms"
     },
     {
      "greek": "εἶδον τὴν δόξαν αὐτοῦ",
@@ -1397,8 +1396,7 @@
      ],
      "answer": "they saw his glory",
      "audio": "chapt_14_n_td24",
-     "hintRef": "secondAoristParadigms",
-     "greek2": "αὐτοῦ εἰς τὴν Ἰουδαίαν γῆν"
+     "hintRef": "secondAoristParadigms"
     },
     {
      "greek": "καὶ ἐγένετο μετὰ ἡμέρας τρεῖς εὗρον αὐτὸν",
@@ -1411,7 +1409,7 @@
      "answer": "And it happened after three days they found him in the temple",
      "audio": "chapt_14_n_td25",
      "hintRef": "secondAoristParadigms",
-     "greek2": "ἀνθρώποις"
+     "greek2": "ἐν τῷ ἱερῷ"
     },
     {
      "greek": "Μετὰ ταῦτα ἦλθεν ὁ Ἰησοῦς καὶ οἱ μαθηταὶ",
@@ -1423,7 +1421,8 @@
      ],
      "answer": "After these things Jesus and his disciples came to the land of Judea",
      "audio": "chapt_14_n_td26",
-     "hintRef": "secondAoristParadigms"
+     "hintRef": "secondAoristParadigms",
+     "greek2": "αὐτοῦ εἰς τὴν Ἰουδαίαν γῆν"
     },
     {
      "greek": "καὶ ἀπῆλθεν εἰς τὴν πόλιν καὶ λέγει τοῖς",
@@ -1435,7 +1434,8 @@
      ],
      "answer": "and she went into the city and said to the men",
      "audio": "chapt_14_n_td27",
-     "hintRef": "secondAoristParadigms"
+     "hintRef": "secondAoristParadigms",
+     "greek2": "ἀνθρώποις"
     },
     {
      "greek": "εἶπον οὖν πρὸς αὐτὸν οἱ ἀδελφοὶ αὐτοῦ",
@@ -2107,7 +2107,7 @@
        "cells": [
         {
          "greek": "ἔλαβον",
-         "gloss": "i took",
+         "gloss": "I took",
          "audio": "chapt_14_n_lab1s"
         },
         {
@@ -2774,7 +2774,7 @@
        "cells": [
         {
          "greek": "ἔλαβον",
-         "gloss": "i took",
+         "gloss": "I took",
          "audio": "chapt_14_n_lab1s"
         },
         {
diff --git a/src/data/chapt-15.json b/src/data/chapt-15.json
index 8762385..66b3f70 100644
--- a/src/data/chapt-15.json
+++ b/src/data/chapt-15.json
@@ -66,7 +66,7 @@
       },
       {
        "type": "para",
-       "text": "The first aorist is formed off the present stem with an augment and a suffixed sa.",
+       "text": "The first aorist is formed off the present stem with an augment and a suffixed σα.",
        "gapBefore": true
       },
       {
@@ -109,7 +109,7 @@
       },
       {
        "type": "para",
-       "text": "First aorists use the present stem to which an augment is prefixed and an sa is affixed along with the pronominal endings of the first, second and third persons.",
+       "text": "First aorists use the present stem to which an augment is prefixed and an σα is affixed along with the pronominal endings of the first, second and third persons.",
        "gapBefore": true
       }
      ]
@@ -569,7 +569,7 @@
      "content": [
       {
        "type": "para",
-       "text": "The sigma ending is added in basically the same way as the sigma was added for future tense verbs. Palatals (k, g, x) + s become c διδάσκω + sa = ἐδίδαξα Labials (p, b, f) + s become y βλέπω + sa = ἔβλεψα Dentals (t, d, q) + s drops the dental πείθω + sa = ἔπεισα"
+       "text": "The sigma ending is added in basically the same way as the sigma was added for future tense verbs."
       },
       {
        "type": "greekRows",
@@ -623,12 +623,60 @@
       },
       {
        "type": "para",
-       "text": "With liquids (l and r) and nasals (m and n) ofen the sigma is dropped and the preceding vowel in the stem is changed.",
+       "text": "With [[link:liquids]]liquids[[/link]] (λ and ρ) and nasals (μ and ν) ofen the sigma is dropped and the preceding vowel in the stem is changed.",
        "gapBefore": true
       },
+      {
+       "type": "greekRows",
+       "gapBefore": true,
+       "rows": [
+        {
+         "parts": [
+          {
+           "greek": "μένω",
+           "audio": "chapt_15_o_menp"
+          },
+          {
+           "text": "+"
+          },
+          {
+           "text": "σα"
+          },
+          {
+           "text": "="
+          },
+          {
+           "greek": "ἔμεινα",
+           "audio": "chapt_15_o_mena"
+          }
+         ]
+        },
+        {
+         "parts": [
+          {
+           "greek": "ἀποστέλλω",
+           "audio": "chapt_15_o_apop"
+          },
+          {
+           "text": "+"
+          },
+          {
+           "text": "σα"
+          },
+          {
+           "text": "="
+          },
+          {
+           "greek": "ἀπέστειλα",
+           "audio": "chapt_15_o_apoa"
+          }
+         ]
+        }
+       ]
+      },
       {
        "type": "para",
-       "text": "μένω + sa = ἔμεινα ἀποστέλλω + sa = ἀπέστειλα These transformations are not always predictable. Thus it is necessary to learn the aorist for each verb.",
+       "text": "These transformations are not always predictable.  Thus it is necessary to learn the aorist for each verb.",
        "gapBefore": true
       }
      ],
@@ -2131,7 +2179,7 @@
        "cells": [
         {
          "greek": "ἔλυσα",
-         "gloss": "i loosed",
+         "gloss": "I loosed",
          "audio": "chapt_15_o_luwa1s"
         },
         {
diff --git a/src/data/chapt-16.json b/src/data/chapt-16.json
index 7724832..1105d66 100644
--- a/src/data/chapt-16.json
+++ b/src/data/chapt-16.json
@@ -59,7 +59,7 @@
      "content": [
       {
        "type": "para",
-       "text": "Rather than using a helping verb, Greek uses a different stem to indicate the passive indicative for aorist and future tenses. In the lexicon this stem will be the sixth (last) principal part. [[u]]Present Future Aorist[[/u]] βάλλω, βαλῶ, ἔβαλον, [[u]]Perfect Perf mid/pass Aorist pass[[/u]] βέβληκα, βέβλημαι, ἐβλήθην"
+       "text": "Rather than using a helping verb, Greek uses a different stem to indicate the passive indicative for aorist and future tenses. In the lexicon this stem will be the sixth (last) principal part."
       },
       {
        "type": "greekRows",
@@ -143,7 +143,7 @@
       },
       {
        "type": "para",
-       "text": "They are built from the sixth principal part of the verb. They are easily recognized because of the characteristic q just before the ending. Like other past tense verb forms aorist passives take the augment.",
+       "text": "They are built from the sixth principal part of the verb. They are easily recognized because of the characteristic θ just before the ending. Like other past tense verb forms aorist passives take the augment.",
        "gapBefore": true
       }
      ]
@@ -154,7 +154,7 @@
      "content": [
       {
        "type": "para",
-       "text": "The aorist passives are formed by adding qh before the ending:"
+       "text": "The aorist passives are formed by adding θη before the ending:"
       },
       {
        "type": "formula",
@@ -173,7 +173,7 @@
       },
       {
        "type": "para",
-       "text": "The future passives add qhs before the ending and drop the augment. lu + qhs + n = λυθήσομαι Stem Pass Ending (I will be loosed)",
+       "text": "The future passives add θησ before the ending and drop the augment.",
        "gapBefore": true
       },
       {
@@ -200,7 +200,7 @@
      "content": [
       {
        "type": "para",
-       "text": "When a stem ends in a consonant the following changes take place when the qh is added. Palatals: k and g become x diwk + qh = ἐδιώχθην Labials: p and b become f λείπ + qh = ἐλείφθην f causes the q to drop out graf + qh = ἐγράφην"
+       "text": "When a stem ends in a consonant the following changes take place when the θη is added."
       },
       {
        "type": "greekRows",
@@ -1478,8 +1478,7 @@
      ],
      "answer": "Are you the prophet? and he answered, \"No\"",
      "audio": "chapt_16_p_td1",
-     "hintRef": "passiveParadigms",
-     "greek2": "με, Ἐγώ εἰμι Ἰησοῦς"
+     "hintRef": "passiveParadigms"
     },
     {
      "greek": "Ἀπεκρίθησαν καὶ εἶπαν αὐτῷ, Ὁ πατὴρ ἡμῶν",
@@ -1503,7 +1502,8 @@
      ],
      "answer": "And I answered, \"Who are you Lord?\" and he said to me, \"I am Jesus\"",
      "audio": "chapt_16_p_td3",
-     "hintRef": "passiveParadigms"
+     "hintRef": "passiveParadigms",
+     "greek2": "με, Ἐγώ εἰμι Ἰησοῦς"
     },
     {
      "greek": "Καὶ ὅτε εἶδεν ὁ δράκων ὅτι ἐβλήθη εἰς τὴν γῆν",
@@ -1527,8 +1527,7 @@
      ],
      "answer": "and his angels were cast down with him",
      "audio": "chapt_16_p_td5",
-     "hintRef": "passiveParadigms",
-     "greek2": "ναὸν τοῦτον καὶ ... ἐγερῶ αὐτόν"
+     "hintRef": "passiveParadigms"
     },
     {
      "greek": "καὶ εἴ τις οὐχ εὑρέθη ἐν τῇ βίβλῳ τῆς ζωῆς",
@@ -1540,8 +1539,7 @@
      ],
      "answer": "and if anyone was not found in the book of life",
      "audio": "chapt_16_p_td6",
-     "hintRef": "passiveParadigms",
-     "greek2": "λέγω σοι"
+     "hintRef": "passiveParadigms"
     },
     {
      "greek": "ἀπεκρίθη Ἰησοῦς καὶ εἶπεν αὐτοῖς, Λύσατε τὸν",
@@ -1554,7 +1552,7 @@
      "answer": "Jesus answered and said to them, \"Destroy this temple and I will raise it\"",
      "audio": "chapt_16_p_td7",
      "hintRef": "passiveParadigms",
-     "greek2": "ἀπολωλότα οἴκου Ἰσραήλ"
+     "greek2": "ναὸν τοῦτον καὶ ... ἐγερῶ αὐτόν"
     },
     {
      "greek": "ἀπεκρίθη Ἰησοῦς καὶ εἶπεν αὐτῷ , Ἀμὴν ἀμὴν",
@@ -1567,7 +1565,7 @@
      "answer": "Jesus answered and said to him, \"Truly, truly, I say to you\"",
      "audio": "chapt_16_p_td8",
      "hintRef": "passiveParadigms",
-     "greek2": "ἠγέρθη ἀπὸ τῶν νεκρῶν"
+     "greek2": "λέγω σοι"
     },
     {
      "greek": "εἶπεν, Οὐκ ἀπεστάλην εἰ μὴ εἰς τὰ πρόβατα τὰ",
@@ -1579,7 +1577,8 @@
      ],
      "answer": "he said, \"I was not sent except to the lost sheep of the house of Israel\"",
      "audio": "chapt_16_p_td9",
-     "hintRef": "passiveParadigms"
+     "hintRef": "passiveParadigms",
+     "greek2": "ἀπολωλότα οἴκου Ἰσραήλ"
     },
     {
      "greek": "Οὗτός ἐστιν Ἰωάννης ὁ βαπτιστής: αὐτὸς",
@@ -1592,7 +1591,7 @@
      "answer": "This is John the Baptist; he was raised from the dead",
      "audio": "chapt_16_p_td10",
      "hintRef": "passiveParadigms",
-     "greek2": "ἐγερθήσεται"
+     "greek2": "ἠγέρθη ἀπὸ τῶν νεκρῶν"
     },
     {
      "greek": "ἀπεκρίθη ἡ γυνὴ καὶ εἶπεν αὐτῷ, Οὐκ ἔχω ἄνδρα",
@@ -1604,8 +1603,7 @@
      ],
      "answer": "the woman answered and said to him, \"I do not have a husband\"",
      "audio": "chapt_16_p_td11",
-     "hintRef": "passiveParadigms",
-     "greek2": "ἐπὶ βασιλείαν"
+     "hintRef": "passiveParadigms"
     },
     {
      "greek": "καὶ ἀποκτενοῦσιν αὐτόν, καὶ τῇ τρίτῃ ἡμέρᾳ",
@@ -1618,7 +1616,7 @@
      "answer": "and they will kill him, and he will be raised on the third day",
      "audio": "chapt_16_p_td12",
      "hintRef": "passiveParadigms",
-     "greek2": "πλανήσουσιν πολλούς"
+     "greek2": "ἐγερθήσεται"
     },
     {
      "greek": "ἐγερθήσεται γὰρ ἔθνος ἐπὶ ἔθνος καὶ βασιλεία",
@@ -1630,7 +1628,8 @@
      ],
      "answer": "for nation will rise against nation and kingdom against kingdom",
      "audio": "chapt_16_p_td13",
-     "hintRef": "passiveParadigms"
+     "hintRef": "passiveParadigms",
+     "greek2": "ἐπὶ βασιλείαν"
     },
     {
      "greek": "καὶ πολλοὶ ψευδοπροφῆται ἐγερθήσονται καὶ",
@@ -1643,7 +1642,7 @@
      "answer": "and many false prophets will arise and deceive many",
      "audio": "chapt_16_p_td14",
      "hintRef": "passiveParadigms",
-     "greek2": "Γαλιλαίαν"
+     "greek2": "πλανήσουσιν πολλούς"
     },
     {
      "greek": "οὐδὲ τόπος εὑρέθη αὐτῶν ἔτι ἐν τῷ οὐρανῷ",
@@ -1668,7 +1667,7 @@
      "answer": "But the eleven disciples went into Galilee",
      "audio": "chapt_16_p_td16",
      "hintRef": "passiveParadigms",
-     "greek2": "τὸ ἔργον τοῦ θεοῦ"
+     "greek2": "Γαλιλαίαν"
     },
     {
      "greek": "καὶ οὐκ ἠδυνήθησαν αὐτὸν θεραπεῦσαι",
@@ -1680,8 +1679,7 @@
      ],
      "answer": "and they were not able to heal him",
      "audio": "chapt_16_p_td17",
-     "hintRef": "passiveParadigms",
-     "greek2": "δι' ἀπιστίαν"
+     "hintRef": "passiveParadigms"
     },
     {
      "greek": "ἀπεκρίθη ὁ Ἰησοῦς καὶ εἶπεν αὐτοῖς, Τοῦτό ἐστιν",
@@ -1694,7 +1692,7 @@
      "answer": "Jesus answered and said to them, \"This is the work of God\"",
      "audio": "chapt_16_p_td18",
      "hintRef": "passiveParadigms",
-     "greek2": "Χριστοῦ"
+     "greek2": "τὸ ἔργον τοῦ θεοῦ"
     },
     {
      "greek": "καὶ βλέπομεν ὅτι οὐκ ἠδυνήθησαν εἰσελθεῖν",
@@ -1706,7 +1704,8 @@
      ],
      "answer": "and we see that they were not able to enter because of unbelief",
      "audio": "chapt_16_p_td19",
-     "hintRef": "passiveParadigms"
+     "hintRef": "passiveParadigms",
+     "greek2": "δι' ἀπιστίαν"
     },
     {
      "greek": "οὔτε ἐδιδάχθην ἀλλὰ δι' ἀποκαλύψεως Ἰησοῦ",
@@ -1719,7 +1718,7 @@
      "answer": "nor was I taught but through a revelation of Jesus Christ",
      "audio": "chapt_16_p_td20",
      "hintRef": "passiveParadigms",
-     "greek2": "χάριτος τοῦ θεοῦ"
+     "greek2": "Χριστοῦ"
     },
     {
      "greek": "ὅς ἐγενήθη σοφία ἡμῖν ἀπὸ θεοῦ",
@@ -1743,7 +1742,8 @@
      ],
      "answer": "of which I became a minister according to the gift of God's grace",
      "audio": "chapt_16_p_td22",
-     "hintRef": "passiveParadigms"
+     "hintRef": "passiveParadigms",
+     "greek2": "χάριτος τοῦ θεοῦ"
     },
     {
      "greek": "ἐγενήθητε ἐγγὺς ἐν τῷ αἵματι τοῦ Χριστοῦ",
@@ -1779,8 +1779,7 @@
      ],
      "answer": "and they were judged, each according to their works",
      "audio": "chapt_16_p_td25",
-     "hintRef": "passiveParadigms",
-     "greek2": "σωθήσεται"
+     "hintRef": "passiveParadigms"
     },
     {
      "greek": "καὶ ἐσώθη ἡ γυνὴ ἀπὸ τῆς ὥρας ἐκείνης",
@@ -1792,8 +1791,7 @@
      ],
      "answer": "and the woman was made well from that hour",
      "audio": "chapt_16_p_td26",
-     "hintRef": "passiveParadigms",
-     "greek2": "τοῦ θεοῦ"
+     "hintRef": "passiveParadigms"
     },
     {
      "greek": "Πᾶς γὰρ ὅς ἄν ἐπικαλέσηται τὸ ὄνομα κυρίου",
@@ -1805,7 +1803,8 @@
      ],
      "answer": "for anyone who calls on the name of the Lord will be saved",
      "audio": "chapt_16_p_td27",
-     "hintRef": "passiveParadigms"
+     "hintRef": "passiveParadigms",
+     "greek2": "σωθήσεται"
     },
     {
      "greek": "ἀπεκρίθη αὐτῳ Ναθαναήλ, Ῥαββί, σύ εἶ ὁ υἱὸς",
@@ -1817,7 +1816,8 @@
      ],
      "answer": "Nathanael answered him, \"Rabbi, you are the son of God\"",
      "audio": "chapt_16_p_td28",
-     "hintRef": "passiveParadigms"
+     "hintRef": "passiveParadigms",
+     "greek2": "τοῦ θεοῦ"
     }
    ],
    "scored": true,
diff --git a/src/lib/content.js b/src/lib/content.js
index 8d8468f..d9a9d12 100644
--- a/src/lib/content.js
+++ b/src/lib/content.js
@@ -659,6 +659,16 @@ export function buildSelectQuestions(chapter, activity) {
         // from `gloss`, which chapter 2's one-attempt drills reveal on their
         // own once an item is answered — a translation is shown on request.
         translate: stripMarkup(item.translate) || null,
+        // 5I-SPEC1 §4.4: the item's OWN instruction line. Chapter 16's Form
+        // Drill asks twenty-two questions about fifteen verbs, and six of them
+        // appear twice with an IDENTICAL prompt panel ("βάλλω / I cast,
+        // throw") — once for the aorist passive, once for the future. The
+        // instruction line above the options is the only thing that tells them
+        // apart, and the original swaps it per item (DOSBox-confirmed
+        // 2026-08-29). Carried through the shuffle with the item it belongs
+        // to; a drill without the field is unchanged and shows the
+        // activity-level line.
+        instructions: stripMarkup(item.instructions) || null,
         hintRef: item.hintRef,
         reveals,
         correctForm: item.correctForm || null,
```

---

## 3. THOUGHT AND TOOL LOG

### 3.1 Orientation

Read the spec, then `AGENTS.md`, `buildout/ONBOARD-SOL.md`,
`buildout/CHAT-HANDOFF.md` and `buildout/DISCLOSURE-RULES.md` in full before
touching anything, because §4 of the spec cites DISCLOSURE §3.3, §4.1, §4.2,
§4.3, §4.5 and §4.6 by number and getting those wrong is how 5G lost a round.

First surprise, and a good one: `git log` showed `175cfae` already carried the
eight delivered data files. So §0's "commit them AS-IS" was done; my job was
§4's renderer work, §3's visual pass, §8's gates and the three documents.

Baseline before any change: `check:shapes` PASS across all sixteen chapters,
`build` clean, `check:lazy-chunk` PASS (but asserting only chapters 1-12).
`check:lazy-chunk` printing PASS while saying nothing about the four new
chapters was the first thing I wrote down to fix.

### 3.2 Survey before code

Rather than start at §4.1 and work down, I inventoried what the data actually
declares against what the renderer already knows, because the spec's own §4
opens with "nothing else in the renderer should need to move; if you find
otherwise, report it" — and I wanted to know the size of "otherwise" before
committing to an order.

Grepped every new key across the four files and against `src/`:

```
columnGroups        3 uses   Paradigm.svelte already reads it
objectivesPostamble 1        nothing
playAllGroups       1        nothing
instructionsPerItem 1        nothing
answerLabel        22        nothing
keyLetterBox        2        nothing   (+ transformation, stemList,
endingTransformation 3                  shiftSummary, principalParts)
noteAudioMap        3        nothing
popupRef           11        RichContent.svelte reads it
revealButtons       5        SelectActivity.svelte reads it
```

So: seven genuinely new things, three to confirm. That inventory is what let me
batch the work instead of discovering §4.7 halfway through §4.6.

I also read `buildSelectQuestions`, `buildTwoStageQuestions`, `resolveHintRef`
and the A1c gate (`answerClipPrompt`) before writing anything, and found that
§4.10 and §4.11 needed no code at all — the gate is already stated
structurally, and `translate` already survives the two-stage builder. Both were
then PROVEN in the browser rather than asserted.

### 3.3 The order I worked in

§4.2 (objectivesPostamble) first, as the smallest thing that exercises the
whole loop: edit, build, preview, screenshot, compare against ch13railwalk p1.
That gave me a working capture harness before anything hard.

Then §4.3, §4.4, §4.5, §4.7 (the small, well-specified ones), then §4.6's five
layouts, then §4.1 — deliberately last, because I suspected the six-column
chart would not fit and I wanted every other surface settled before spending
time on it.

### 3.4 What the visual pass actually caught

This is the part worth recording, because none of it was visible in the data.

**§4.1, the πᾶς chart.** Measured at 320px before touching it: the grid
overran by 10px, individual cells by up to 10px, and the header row printed
`MASCULFEMININEUTER` with the forms overprinting each other. Overflow is
clipped app-wide, so nothing errored and nothing scrolled. The spec forbids a
pager on the Quick Review copy and tells me to report what I did rather than
invent one — and DISCLOSURE §4.6, in the same breath as forbidding the pager,
describes the answer: a C9 page "stacks paradigms vertically (Singular above
Plural)". So the chart stacks by column group. Reported as a departure and
raised as VERIFY item I-1, because it IS a departure — the original prints one
six-across chart.

Two follow-ons fell out of that: `pg-three-columns`/`pg-many-columns` were
keyed off `columns.length`, which for a grouped chart is 6 when only 3 are on
screen, so the type came out crushed; they now key off `effectiveColumnCount`.

**§4.7, the Passive Stems chart.** The `text` cell was the easy half. The hard
half only showed at 320px: every row's label is `null`, so the label gutter was
a blank column, and `hasLongForms` is gated on `hasCaseLabels` — which is false
for this chart — so no density rule fired and ἀποστέλλω, ἐγερθήσομαι and
γνωσθήσομαι each broke mid-word across two lines. Fixed with a label-free tier
scoped to three-plus columns, so chapter 7's two-column εἰμί paradigm (the only
other label-less chart in sixteen chapters, and device-verified) does not move.

One trap cost a measurement round: hiding the empty label span with
`display: none` takes it out of GRID FLOW, so every cell shifts one track left
and the last one falls off the edge. Probe output at the time:

```
{"parent":"pg-row","w":4,"sw":54,"txt":"ἀποστέλλω",
 "cols":"0px 200.656px 200.672px 200.672px"}
```

— the first cell sitting in the 0px track. The span stays; the track is 0px.

**§4.5, a thing the spec did not mention.** The three Forms spellers set
`promptIsGreek: true` — a key no earlier speller in the app sets — and
`SpellActivity` had no path for it, so the present lemma rendered in the body
face. The typography canon is explicit that no Greek surface may use a
different glyph source. Added the class; left it ink and untappable, because
the item's clip is the ANSWER and no present-tense clip is wired.

**Three CSS specificity fights**, all the same shape and all caught by
measuring computed style rather than by looking: `.popup-link` and
`.pg-long-forms .pg-greek` sit LATER in `app.css` than the block I inserted, so
at equal specificity they won. The in-chart trigger came out green-underlined
instead of blue-plain; the label-free type ramp did nothing at all. Fixed by
raising specificity (`button.rc-chart-trigger`, `.paradigm.pg-no-row-labels…`)
rather than by moving blocks around a 2000-line file.

### 3.5 The data defects

The visual pass turned up eleven strings with unconverted ToolBook Greek-font
runs and four paragraphs that had swallowed their own chart. Rather than fix
what I happened to see, I wrote two scanners:

- roman tokens adjacent to `+`/`=`, or standing alone next to Greek, filtered
  against ordinary English usage;
- a `para` whose text contains a string that a sibling STRUCTURED block in the
  same `content[]` also holds.

Both are in §3.6 below. They found everything I had spotted by eye plus three I
had not (`suffixed sa` twice, `an sa is affixed`), and one — `characteristic q`
— that neither caught at first, because it sits in a paragraph with no Greek
and no operator anywhere near it. That one came out of reading the rendered
ch16 Introduction against ch16railwalk p2. Both scanners come back empty across
all four chapters after the edits.

**Then the big one.** Reading the ch16 Translation Drill's rendered prompt
against its rail-walk panel:

```
port:  οὔτε ἐδιδάχθην ἀλλὰ δι' ἀποκαλύψεως Ἰησοῦ
       χάριτος τοῦ θεοῦ                     Gal 1:12
walk:  οὔτε ἐδιδάχθην ἀλλὰ δι' ἀποκαλύψεως Ἰησοῦ
       Χριστοῦ                              Gal 1:12
```

`χάριτος τοῦ θεοῦ` is from Eph 3:7, two items later. Dumped every `greek2` in
all four chapters beside its item's `ref` and first line, and the pattern was
immediate: the values are the right set in the right order, each sitting a
fixed number of items before its owner — chapter 13 by one, chapters 14 and 16
by two, chapter 15 correct. Verified every one of the 32 rows twice (rail walk,
and "the owning item's first line ends mid-clause and this completes it"), then
moved them with an assertion that no two land on one item and that any target
already holding a line is one giving its own away. Counts come out exact in
every chapter afterwards: as many lines as there are items needing one.

Before touching the JSON I checked that `json.dumps(indent=1,
ensure_ascii=False)` round-trips the delivered files byte-for-byte (it does,
minus a trailing newline they do not have), so the structural move could be
made without reformatting 90 KB of unrelated data. Every other edit is a raw
string replacement on the file text.

### 3.6 The scanners

Duplicate detection (the four swallowed panels):

```python
# for each content[] array: collect every displayed string in the NON-para
# blocks, then flag any para whose text contains one of them verbatim.
```

Garble detection (the eleven runs):

```python
PAT   = r'(?:[A-Za-z]{1,6}\s*[+=]|[+=]\s*[A-Za-z]{1,6})(?![A-Za-z]*[a-z]{4})'
PAREN = r'\(\s*[a-z]\s*(?:,|and)\s*[a-z]\s*[,)]'
TOKENS = r'(?<![A-Za-z])(qh[a-z]?|sa|lu|diwk|graf|luw)(?![A-Za-z])'
SINGLE = r'(?<![A-Za-z0-9Ͱ-Ͽἀ-῿"\'])([bcdfghjklmnpqrstuvwxyz])'
         r'(?![A-Za-z0-9Ͱ-Ͽἀ-῿"\'.])'
```

The last of those is what found `characteristic q`. Run over chapters 1-12 it
flags only legitimate English ("the 'p' in Peter", "Machen, p. 9"), which is
why the pipeline should run it with a human reading the output rather than as a
gate.

### 3.7 Harness work

Five harness scripts changed, all in the same round as the code they test, per
ONBOARD §7.

The one worth recording is `ui-modals`. I added 42 surfaces and the run came
back 435/480 with 45 BAD — all of them `toggle null` on chapter 15's four-chart
hint and chapter 16's three-chart one. The harness measured
`[data-hint-paradigm-toggle]`, the two-state single control, and asserted it was
present whenever hint controls were expected. Those two bundles are the first
3+ bundles ever to appear inside a modal, and they correctly draw the §4.2
Back/More pair instead — so the harness was reporting BAD for drawing the
control the sheet requires. Widened the selector to measure whichever control
the state draws and kept the pinning assertion identical. 480/480.

`ui-behavior` and `ui-disclosure` both carried census numbers that had rotted:
`poolKind` drills 12→20, ledger rows 115→154, activities 270→368,
classification 15/251/4 → 19/345/4. Each of those is asserted rather than
derived on purpose — it is what catches a chapter that quietly stops declaring
a key — so each moved rather than being turned into a `.length`.

One more `ui-behavior` failure was a genuine allowlist that had to widen:
`5E-R1 every REPLACED heading pair is a chapter-11 radio-label/panel-heading
pair` flagged `chapt_13 "πᾶς Adjective" vs "πᾶς (all) Forms"`. That is the same
shape chapter 11 has — the topic named for the original's radio label, the
panel headed with the chart's own title — and the SURFACE assertion beneath it
(exactly one heading prints, the fuller one) passed for chapter 13 on its own.
Widened the allowlist to name both chapters rather than dropping it, because
the allowlist is what stops a genuinely doubled heading passing as "just
another replacement".

`check-lazy-chunk` needed needles unique to ONE chapter file. Chapters 14 and
15 open with the same English-concepts paragraph, so the obvious first-para
needle matches two files and proves nothing about which chunk it landed in; the
ch14 needle is its Aorist Comments line instead.

### 3.8 Verification, in the order it happened

- `ui-walk` chapters 13-16, first run: 3 stops with horizontal overflow at
  320px, all three hint modals. Fixed the two Verb Forms charts (the only
  2-column charts in sixteen chapters with BOTH a long row label and long
  forms) and the modal-hosted Passive Stems chart. Second run: zero.
- `ui-walk` chapters 1-12 regression after all shared-component changes: 270
  stops, zero overflow, zero console errors.
- Interactive walks written for the things a static capture cannot show: all 22
  items of `c16_drill_forms` reading its instruction line; four items of
  `c16_ex_speller_forms` reading its answer-field label; before/after a guess on
  all three Forms Drills for the A1c gate; the Translate button on all four
  two-stage drills; every state of every new hint bundle with its nav's
  disabled flags.
- `ui-offline` on chapter 16: SW installed, offline, 25 stops rendered, 0
  missing, refresh OK.

Full results in `5I-SPEC1-RESULTS-OPUS.md` §6.

### 3.9 Item-by-item evidence for §4.4

`c16_drill_forms`, all 22 items stepped in the browser at 320px. Columns:
prompt, gloss, instruction line, prompt tappable, Pronounce disabled.

```
βάλλω      I cast, throw    ...future form   false  true
λέγω       I say            ...aorist form   false  true
σῴζω       I save           ...aorist form   false  true
δύναμαι    I can, am able   ...future form   false  true
πιστεύω    I believe        ...aorist form   false  true
ἐγείρω     I rise           ...future form   false  true
θέλω       I will, wish     ...aorist form   false  true
εὑρίσκω    I find           ...aorist form   false  true
δύναμαι    I can, am able   ...aorist form   false  true
σῴζω       I save           ...future form   false  true
ἐγείρω     I rise           ...aorist form   false  true
βάλλω      I cast, throw    ...aorist form   false  true
διδάσκω    I teach          ...aorist form   false  true
λαμβάνω    I take           ...aorist form   false  true
πορεύομαι  I go             ...aorist form   false  true
γινώσκω    I know           ...aorist form   false  true
γράφω      I write          ...aorist form   false  true
γινώσκω    I know           ...future form   false  true
ἀποστέλλω  I send           ...aorist form   false  true
κρίνω      I judge          ...aorist form   false  true
γίνομαι    I become         ...aorist form   false  true
εὑρίσκω    I find           ...future form   false  true
```

Six verbs appear twice with an identical prompt panel and a different
instruction line, which is the whole of §4.4. The last two columns are §4.10's
A1c gate holding on every item.

### 3.10 What I deliberately did not do

- Did not run git beyond `diff` and `status`.
- Did not touch `public/audio/audio-manifest.json`, or anything that would have
  forced it to change.
- Did not run `apply-behavior-matrix.py`; did not re-derive a single
  `audioTiming` or `advanceClass`.
- Did not edit `DIVERGENCE-LOG.md`, `NIT-LOG.md`, `DRILL-BEHAVIOR-RULES.md`,
  `DISCLOSURE-RULES.md`, `DRILLBEHAVIORLEDGER.csv` or any assembler. Those are
  the pipeline's; the departures in this round are reported for the pipeline to
  log rather than logged by me.
- Did not "fix" anything in §7 of the spec: `ofen`, `other (155 )`, the nu
  ending on `λυ + θησ + ν = λυθήσομαι`, and the two "every" translations on the
  πᾶς drill's items 15 and 16 all ship exactly as delivered. The two CORRECTED
  items (χαρίτων, πάσαις) were already correct in the data as delivered and
  were verified as such rather than re-applied.
- Did not reshape the ch14/15 Verb Forms hint charts, the stacked Aorist Stems
  pages, or the `principalParts` row shape. Each is a pipeline arrangement
  decision recorded in the data's own `_disclosure` notes; all three are
  reported in RESULTS §4 instead.
