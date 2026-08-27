# 5H-SPEC1-BUILD-OPUS

The complete cumulative diff of the 5H-SPEC1 round, the tool log, and the wall
clock. Companion to `5H-SPEC1-RESULTS-OPUS.md` (the handoff) and
`5H-VISUAL-CHECKLIST-OPUS.md` (the section 7.2 visual pass).

Base commit: `87ab1f6` "saving 5H SPEC1 before implementation".
No git was run beyond read-only `git status` / `git diff --stat` / `git diff`
(rule 0.2). Nothing is staged, committed or pushed.

---

## (c) WALL-CLOCK TIME  [MANDATORY]

| | |
| --- | --- |
| **Start** | **2026-08-25 23:01:18 EDT** (2026-08-26T03:01:18Z) |
| **End** | **2026-08-26 00:39:22 EDT** (2026-08-26T04:39:22Z) |
| **Total** | **1 h 38 min 04 s** |

Single continuous session, one implementer, no addenda. Any later patch or
XPATCH phase ADDS its time to this total.

Roughly half the elapsed time is the four Playwright harnesses: `ui-behavior`
alone runs 1058 assertions and takes about 25 minutes on this seat, and it was
run twice — once before and once after the 5E-R1 heading check was corrected.

---

## (a) THE COMPLETE CUMULATIVE DIFF  [MANDATORY]

Produced with `git diff -- src scripts buildout/DIVERGENCE-LOG.md`. This is the
exact, complete diff of the round — not a summary and not excerpts.

`buildout/New Cohort Prompt.txt` also shows as modified in `git status`; that
edit **pre-dates this round** (it was already dirty in the working tree at the
base commit) and is deliberately excluded from the diff below. It is not mine
and I did not touch it.

### Diffstat

```
 buildout/DIVERGENCE-LOG.md           |  17 +++
 scripts/check-lazy-chunk.mjs         |   4 +-
 scripts/ui-behavior.mjs              | 218 +++++++++++++++++++++++++++++++++--
 scripts/ui-disclosure.mjs            |  23 +++-
 scripts/ui-disclosure3.mjs           |  22 ++--
 scripts/ui-modals.mjs                |  36 ++++++
 scripts/ui-offline.mjs               |   2 +-
 src/app.css                          |  26 +++++
 src/components/ContentAudio.svelte   |  22 +++-
 src/components/Paradigm.svelte       |  43 ++++++-
 src/components/RichContent.svelte    |  40 ++++++-
 src/components/SelectActivity.svelte |  41 ++++++-
 src/lib/content.js                   |  30 ++++-
 13 files changed, 485 insertions(+), 39 deletions(-)
```

### Full diff

```diff
diff --git a/buildout/DIVERGENCE-LOG.md b/buildout/DIVERGENCE-LOG.md
index ea322d7..00d4b4c 100644
--- a/buildout/DIVERGENCE-LOG.md
+++ b/buildout/DIVERGENCE-LOG.md
@@ -531,6 +531,23 @@ D-50 | process | THREE PERMANENT PROCESS RULES (2026-08-25):
      (2). Recorded here because repeated requests were repeatedly
      missed by both implementers. | Nathanael, 5H prep message.
 
+D-51 | ch12 | AUGMENT DRILL: THE ANSWER-CLIP PROMPT GATE. The drill's
+     clips (l_ad1-19, ledger row 108 CONFIRMED afterGuess) record the
+     AUGMENTED ANSWER, not the present-tense lemma on screen, so the
+     ordinary Greek-tap contract and the Pronounce button would both
+     hand the answer over before the guess. The port renders the
+     prompt lemma in INK (the Syllable Division exception treatment of
+     directive 9) and DISABLES Pronounce until the item is answered;
+     after the guess both go live and replay the clip. Derived
+     structurally in SelectActivity: prompt Greek + Greek options +
+     afterGuess timing, which matches this activity and no other in
+     twelve chapters. 5H-SPEC1 3.5 proposed this as "D-50"; that
+     number was already spent on the 2026-08-25 process rules, so it
+     is filed here. VERIFY-5H (d) decides whether the original leaks
+     the answer through Pronounce, i.e. whether the disabled-Pronounce
+     half is a deliberate improvement or a mirror. | 5H-SPEC1 3.5,
+     implementer.
+
 ## Auto-progress / advance rule matrix
 
 MOVED. The full exercise-by-exercise, chapter-by-chapter matrix —
diff --git a/scripts/check-lazy-chunk.mjs b/scripts/check-lazy-chunk.mjs
index 0cd4d48..155b49e 100644
--- a/scripts/check-lazy-chunk.mjs
+++ b/scripts/check-lazy-chunk.mjs
@@ -28,7 +28,9 @@ const expected = [
   { chapterPattern: /^chapt-07-.*\.js$/, lexiconPattern: /^lexicon-chapt07-.*\.js$/, needle: 'An adjective is a word used to modify' },
   { chapterPattern: /^chapt-08-.*\.js$/, lexiconPattern: /^lexicon-chapt08-.*\.js$/, needle: 'A pronoun is a word that stands in place' },
   { chapterPattern: /^chapt-09-.*\.js$/, lexiconPattern: /^lexicon-chapt09-.*\.js$/, needle: 'There are two voices in English.' },
-  { chapterPattern: /^chapt-10-.*\.js$/, lexiconPattern: /^lexicon-chapt10-.*\.js$/, needle: 'In English we have several tenses.' }
+  { chapterPattern: /^chapt-10-.*\.js$/, lexiconPattern: /^lexicon-chapt10-.*\.js$/, needle: 'In English we have several tenses.' },
+  { chapterPattern: /^chapt-11-.*\.js$/, lexiconPattern: /^lexicon-chapt11-.*\.js$/, needle: 'We will explore three types of pronouns in this chapter.' },
+  { chapterPattern: /^chapt-12-.*\.js$/, lexiconPattern: /^lexicon-chapt12-.*\.js$/, needle: 'In English we have only one official past tense' }
 ];
 
 // 2. Chapter DATA must be ABSENT from the main bundle and PRESENT in its chunk.
diff --git a/scripts/ui-behavior.mjs b/scripts/ui-behavior.mjs
index ffe56bb..559acb5 100644
--- a/scripts/ui-behavior.mjs
+++ b/scripts/ui-behavior.mjs
@@ -49,6 +49,8 @@ const ch7 = JSON.parse(readFileSync('src/data/chapt-07.json', 'utf8'));
 const ch8 = JSON.parse(readFileSync('src/data/chapt-08.json', 'utf8'));
 const ch9 = JSON.parse(readFileSync('src/data/chapt-09.json', 'utf8'));
 const ch10 = JSON.parse(readFileSync('src/data/chapt-10.json', 'utf8'));
+const ch11 = JSON.parse(readFileSync('src/data/chapt-11.json', 'utf8'));
+const ch12 = JSON.parse(readFileSync('src/data/chapt-12.json', 'utf8'));
 const verse = (ch3.exercise.find(a => a.type === 'spellVerse').answerWords || []).join(' ');
 // UNACCENTED, not unmarked (5E-SPEC2 §4.2). "With Accents" OFF forgives the
 // acute, the grave and the circumflex and NOTHING else, so a fixture that
@@ -761,7 +763,8 @@ await page.setViewportSize({ width: 390, height: 900 });
 // That is the point of writing them as sweeps rather than as lists.
 // 5G: chapters 9 and 10 join it in turn, for the same reason.
 const CHAPTERS = { chapt_1: ch1, chapt_2: ch2, chapt_3: ch3, chapt_4: ch4, chapt_5: ch5,
-                   chapt_6: ch6, chapt_7: ch7, chapt_8: ch8, chapt_9: ch9, chapt_10: ch10 };
+                   chapt_6: ch6, chapt_7: ch7, chapt_8: ch8, chapt_9: ch9, chapt_10: ch10,
+                   chapt_11: ch11, chapt_12: ch12 };
 const LEXICON = id => JSON.parse(readFileSync(`src/data/lexicon-chapt${String(id.split('_')[1]).padStart(2, '0')}.json`, 'utf8'));
 const promptGloss = () => page.locator('.card.speller .flash-pane .value').first().innerText();
 // WHICH ITEM the word speller is on. Not the prompt: chapter 7's adjective
@@ -1790,23 +1793,34 @@ await page.setViewportSize({ width: 390, height: 900 });
     return true;
   };
   const mismatches = [];
+  const replaced = [];
   const covered = [];
   for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
     for (const activity of activitiesOf(chapter)) {
       for (const topic of (activity && activity.topics) || []) {
         for (const block of topic.content || []) {
-          const titles = [block.title, ...((block.charts || []).map(c => c.title))].filter(Boolean);
-          for (const title of titles) {
-            if (!topic.title || normalizeText(title) === normalizeText(topic.title)) continue;
+          // The heading the SURFACE prints for this block is the first one: a
+          // charts[] stack shows chart 1 at rest and renames itself only as
+          // More/Back steps, so asserting chart 3's title against the resting
+          // page would be asserting a state nobody is looking at.
+          const titles = [block.title, ...((block.charts || []).map(c => c && c.title))].filter(Boolean);
+          for (const title of titles.slice(0, 1)) {
+            // Fold through the RENDERER's key, not raw text: the Masc/Masculine
+            // pair is one heading spelled two ways, RichContent drops the
+            // chart's copy, and the topic's own heading is what prints.
+            if (!topic.title || headingKey(title) === headingKey(topic.title)) continue;
             // 5G: the chart title may say the topic's heading AND MORE of it
             // ("Present Middle Paradigm" -> "Present Middle Indicative
-            // Paradigm"). That is the same heading at two lengths, like the
-            // Masc/Masculine pair, and the host drops its own so one prints.
-            if (headingCovers(title, topic.title)) {
-              covered.push([chapterId, activity.id, topic.title, title]);
-              continue;
+            // Paradigm"). 5H widens that to any DIFFERENT panel heading: the
+            // chapter-11 paradigm topics are named for the original's radio
+            // labels ('"That" Paradigm') while the panel is headed with the
+            // lemma, and the original drops the radio column on those screens.
+            // Either way the host drops its own heading so exactly one prints,
+            // which the surface loop below asserts pair by pair.
+            covered.push([chapterId, activity.id, topic.title, title]);
+            if (!headingCovers(title, topic.title)) {
+              replaced.push(`${chapterId} ${JSON.stringify(topic.title)} vs ${JSON.stringify(title)}`);
             }
-            mismatches.push(`${chapterId} ${JSON.stringify(topic.title)} vs ${JSON.stringify(title)}`);
           }
         }
       }
@@ -1815,8 +1829,16 @@ await page.setViewportSize({ width: 390, height: 900 });
   // Every remaining mismatch must be an abbreviation of the same heading, and
   // the only one the renderer's key expands is "masc".
   const unhandled = mismatches.filter(m => !/masc/i.test(m) || !ABBREVIATIONS.test(m));
-  check('5E-R1 the only topic/chart title mismatch in chapters 1-5 is the one the dedup key handles',
+  check('5E-R1 no topic/chart title pair reaches the surface unresolved by the fold',
     unhandled.length === 0, mismatches.length ? mismatches.join('; ') : 'no mismatches at all');
+  // The fold key exists for exactly one abbreviation pair, and a second one
+  // appearing in the data would silently double a heading again.
+  check('5E-R1 the heading fold still equalises the one abbreviation pair it was written for',
+    headingKey('First Declension—Masc') === headingKey('First Declension—Masculine')
+      && ABBREVIATIONS.test('First Declension—Masc'),
+    'masc -> masculine');
+  check(`5E-R1 every REPLACED heading pair is a chapter-11 radio-label/panel-heading pair`,
+    replaced.every(pair => pair.startsWith('chapt_11')), replaced.join('; ') || 'none');
 
   // ...and on the SURFACE: a covered pair prints ONE heading, the fuller one,
   // which is the heading the original prints in its panel. Two stacked
@@ -2151,7 +2173,12 @@ for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
 // 5G: the ledger read-back sweep covers chapters 9 and 10 too — rows 79-95 of
 // DRILLBEHAVIORLEDGER.csv were CONFIRMED before either chapter was built, so
 // this is the assertion that the shipped surfaces agree with the stamp.
-const CH_5F = { chapt_6: ch6, chapt_7: ch7, chapt_8: ch8, chapt_9: ch9, chapt_10: ch10 };
+// 5H: chapters 11 and 12 join the ledger read-back for the same reason —
+// DRILLBEHAVIORLEDGER.csv rows 96-115 were CONFIRMED before either chapter was
+// built, so this sweep is what proves the shipped surfaces agree with the
+// stamp rather than with a component default.
+const CH_5F = { chapt_6: ch6, chapt_7: ch7, chapt_8: ch8, chapt_9: ch9, chapt_10: ch10,
+                chapt_11: ch11, chapt_12: ch12 };
 
 // ---- the ledger, read off the SURFACE, activity by activity --------------
 // `audioTiming`, the Pronounce-Each default and the Previous/Next pair are
@@ -4593,6 +4620,173 @@ for (const [itemIndex, greek, personNumber] of [
   await shot('w1-ch8-reflexive-clips');
 }
 
+// ===================================================================
+// 5H-SPEC1 W9 / 7.3: chapters 11 and 12
+// ===================================================================
+// Everything above already sweeps both chapters (they are in CHAPTERS and in
+// CH_5F). What follows is what only they have.
+{
+  const cardButton = name => page.locator('.card').getByRole('button', { name, exact: true });
+  const seekPrompt = async (chapterId, activityId, prompt, limit) => {
+    await go(`#/activity/${chapterId}/${activityId}`);
+    for (let step = 0; step < limit; step += 1) {
+      const shown = normalizeText(await page.locator('.card .prompt').first().innerText());
+      if (shown === normalizeText(prompt)) return true;
+      const next = cardButton('Next');
+      if (!await next.count() || await next.isDisabled()) return false;
+      await next.click();
+      await page.waitForTimeout(40);
+    }
+    return false;
+  };
+  const modalTitle = async () => normalizeText(
+    await page.locator('.modal .pg-title, .modal .modal-title').first().innerText());
+
+  // ---- 7.3(a) the three-stage grid with an EIGHT-value final stage --------
+  // Chapter 10 generalised twoStageGrid to N stages; chapter 11 is the first
+  // data to use three, and its last stage is the original's 2x4 case block.
+  await go('#/activity/chapt_11/c11_drill_this_that');
+  const stageInfo = await page.evaluate(() => [...document.querySelectorAll('.card .stage-grid')]
+    .map(s => ({ count: s.querySelectorAll('.tile').length,
+      paradigm2col: !!s.querySelector('.paradigm2col') })));
+  check('5H ch11 This and That Drill: three option stages of 2 / 3 / 8',
+    stageInfo.length === 3 && stageInfo[0].count === 2 && stageInfo[1].count === 3
+      && stageInfo[2].count === 8,
+    JSON.stringify(stageInfo));
+
+  // ---- 7.3(b) answerAlt on a THREE-stage item ---------------------------
+  // The 5F check covered a two-stage tuple. Chapter 11's ambiguous forms are
+  // three-stage: the original's key grades masculine AND neuter right for
+  // toutou, so the alternate tuple has to commit as correct here too.
+  const threeStage = ch11.drill.find(a => a.id === 'c11_drill_this_that');
+  const altItem = threeStage.items.find(item => Array.isArray(item.answerAlt) && item.answerAlt.length);
+  {
+    const found = await seekPrompt('chapt_11', 'c11_drill_this_that', altItem.greek, threeStage.items.length);
+    check(`5H ch11 answerAlt: reached the ambiguous form "${altItem.greek}"`, found);
+    if (found) {
+      const alt = altItem.answerAlt[0];
+      for (let stage = 0; stage < alt.length; stage += 1) {
+        await page.locator('.card .stage-grid').nth(stage)
+          .getByRole('button', { name: alt[stage], exact: true }).click();
+        await page.waitForTimeout(80);
+      }
+      const kind = await feedbackKind();
+      check(`5H ch11 answerAlt: the alternate tuple [${alt.join(' / ')}] grades CORRECT`,
+        kind === 'ok', `feedback ${kind}`);
+    }
+  }
+
+  // ---- 7.3(c) per-item hintRef switching, both chapters ------------------
+  // The assertion the spec asks for in as many words: the modal TITLE changes
+  // between an houtos item and an ekeinos item, and between a luo item and an
+  // eimi item.
+  for (const [chapterId, activityId, limit, formA, formB] of [
+    ['chapt_11', 'c11_drill_this_that', 30, 'οὗτος', 'ἐκεῖνος'],
+    ['chapt_12', 'c12_drill_parsing', 23, 'ἔλυες', 'ἦμεν']
+  ]) {
+    const titles = [];
+    for (const form of [formA, formB]) {
+      const found = await seekPrompt(chapterId, activityId, form, limit);
+      if (!found) { titles.push(null); continue; }
+      await cardButton('Hint').click();
+      await page.waitForSelector('.modal', { timeout: 8000 });
+      await page.waitForTimeout(180);
+      titles.push(await modalTitle());
+      await page.locator('.modal').getByRole('button', { name: 'Close', exact: true }).click();
+      await page.waitForTimeout(140);
+    }
+    check(`5H D-46 ${activityId}: the Hint chart differs between "${formA}" and "${formB}"`,
+      !!titles[0] && !!titles[1] && titles[0] !== titles[1], JSON.stringify(titles));
+  }
+
+  // ---- 7.3(d) a named toggle keeps its say-all across states -------------
+  // Both halves of a demonstrative paradigm share ONE recording, so the button
+  // must still be present and still live after the toggle.
+  await go('#/activity/chapt_11/c11_learn_demonstratives');
+  await gotoTopic(1);
+  const sayAcross = () => page.evaluate(() => {
+    const say = [...document.querySelectorAll('.card button')]
+      .find(b => b.innerText.trim() === 'Say Paradigm');
+    const sub = document.querySelector('.card .pg-subtitle');
+    return { present: !!say, disabled: say ? say.disabled : null, sub: sub && sub.innerText.trim() };
+  });
+  const sayBefore = await sayAcross();
+  await page.locator('.card [data-paradigm-switch="named"]').first().click();
+  await page.waitForTimeout(180);
+  const sayAfter = await sayAcross();
+  check('5H ch11 named toggle: Say Paradigm survives the Singular/Plural switch',
+    sayBefore.present && sayAfter.present && !sayBefore.disabled && !sayAfter.disabled
+      && sayBefore.sub !== sayAfter.sub,
+    `${JSON.stringify(sayBefore)} -> ${JSON.stringify(sayAfter)}`);
+
+  // ---- 7.3(e) the six-chart More/Back stack and its bounds ---------------
+  await go('#/activity/chapt_11/c11_learn_relatives');
+  await gotoTopic(3);
+  const stack = [];
+  for (let step = 0; step < 8; step += 1) {
+    stack.push(await page.evaluate(() => {
+      const btn = name => [...document.querySelectorAll('.card button')]
+        .find(b => b.innerText.trim() === name);
+      const back = btn('Back'), more = btn('More');
+      const title = document.querySelector('.card .pg-title');
+      const sub = document.querySelector('.card .pg-subtitle');
+      return { title: title && title.innerText.trim(), sub: sub && sub.innerText.trim(),
+        back: back ? back.disabled : null, more: more ? more.disabled : null };
+    }));
+    const more = page.locator('.card button', { hasText: /^More$/ }).first();
+    if (!await more.count() || await more.isDisabled()) break;
+    await more.click();
+    await page.waitForTimeout(140);
+  }
+  check('5H ch11 reflexive stack: SIX charts, Back disabled at the first and More at the last',
+    stack.length === 6 && stack[0].back === true && stack[0].more === false
+      && stack[5].more === true && stack[5].back === false
+      && new Set(stack.map(s => `${s.title} ${s.sub}`)).size === 6,
+    JSON.stringify(stack));
+
+  // ---- 7.3(f) Greek perItem options on the Augment Drill, and its gate ---
+  // Rule B-last plus the answer-clip gate (5H-SPEC1 3.5): the drill mounts
+  // item 1, mounts SILENT because it is afterGuess, the lemma is INK and
+  // Pronounce is dead until the guess, and both go live afterwards.
+  await go('#/activity/chapt_12/c12_drill_augment');
+  await page.waitForTimeout(450);
+  const augmentPanel = () => page.evaluate(() => {
+    const card = document.querySelector('.card');
+    const prompt = card.querySelector('.prompt');
+    const pron = [...card.querySelectorAll('.btn')].find(b => b.innerText.trim() === 'Pronounce');
+    return { tag: prompt.tagName, tappable: prompt.classList.contains('greek-say'),
+      gloss: !!card.querySelector('.prompt-gloss'), cite: !!card.querySelector('.prompt-citation'),
+      options: [...card.querySelectorAll('.options .tile')].map(t => t.innerText.trim()),
+      greekOptions: [...card.querySelectorAll('.options .tile')].every(t => t.classList.contains('greek')),
+      pronounceDisabled: pron ? pron.disabled : null };
+  });
+  const augmentBefore = await augmentPanel();
+  const augmentClips = await clips();
+  check('5H ch12 Augment Drill: three GREEK options and a three-line prompt panel',
+    augmentBefore.options.length === 3 && augmentBefore.greekOptions
+      && augmentBefore.gloss && augmentBefore.cite, JSON.stringify(augmentBefore));
+  check('5H ch12 Augment Drill: mounts SILENT (afterGuess, B-last)',
+    !augmentClips.some(c => c.startedAt), JSON.stringify(augmentClips));
+  check('5H ch12 Augment Drill: before the guess the lemma is INK and Pronounce is disabled',
+    augmentBefore.tag === 'DIV' && !augmentBefore.tappable
+      && augmentBefore.pronounceDisabled === true, JSON.stringify(augmentBefore));
+  await page.locator('.card .options .tile').first().click();
+  await page.waitForTimeout(600);
+  const augmentAfter = await augmentPanel();
+  check('5H ch12 Augment Drill: after the guess the lemma taps and Pronounce is live',
+    augmentAfter.tag === 'BUTTON' && augmentAfter.tappable
+      && augmentAfter.pronounceDisabled === false, JSON.stringify(augmentAfter));
+
+  // ---- 7.3(g) the cumulative 12-word Scripture Memory grid ---------------
+  // New relative to chapter 10: the pool spans BOTH halves of Mat 6:33.
+  await go('#/activity/chapt_11/c11_drill_scripture_memory');
+  const smOptions = await page.evaluate(() =>
+    [...document.querySelectorAll('.card .options .tile')].map(t => t.innerText.trim()));
+  const smItems = ch11.drill.find(a => a.id === 'c11_drill_scripture_memory').items;
+  check('5H ch11 Scripture Memory Drill: one static 12-option grid over both halves of Mat 6:33',
+    smOptions.length === 12 && smItems.length === 12,
+    `${smOptions.length} options / ${smItems.length} items`);
+}
 
 await browser.close();
 const failed = results.filter(r => !r.ok);
diff --git a/scripts/ui-disclosure.mjs b/scripts/ui-disclosure.mjs
index cf67cdf..ab5c901 100644
--- a/scripts/ui-disclosure.mjs
+++ b/scripts/ui-disclosure.mjs
@@ -415,7 +415,9 @@ const shot = async name => {
     if (narrow !== 2 || broad !== 4) failures.push(`${chapterId}/${id} ${narrow}/${broad}`);
   }
   check(`D6.1 W9 all ${pool.length} poolKind drills are two-up at 390px and four-up at 820px`,
-    pool.length === 8 && failures.length === 0, failures.join(', ') || `${pool.length} drills`);
+    // 5H: chapters 11 and 12 declare `poolKind` on both of their vocabulary
+    // drills each, so the census is twelve.
+    pool.length === 12 && failures.length === 0, failures.join(', ') || `${pool.length} drills`);
   const controlNarrow = await columnsAt(page, '#/activity/chapt_2/c2_drill_part_of_speech');
   const controlBroad = await columnsAt(widePage, '#/activity/chapt_2/c2_drill_part_of_speech');
   check('D6.2 W9 a non-vocabulary AUTHORED grid stays two-up at both widths',
@@ -599,6 +601,19 @@ const shot = async name => {
     ['ch9 Parsing hint (composite, 2 states)', '#/activity/chapt_9/c9_drill_parsing', 'hint', 'toggle', 1],
     // §4.5's lone centred toggle: the one state in the app with no say button.
     ['ch10 Parsing hint (εἰμί, no say button)', '#/activity/chapt_10/c10_drill_parsing', 'hint', 'toggle', 1],
+    // 5H. Chapter 11's four drill hints are all the §4.5 lone centred toggle
+    // (a two-state sg/pl pair with NO say-all -- the original's hint has
+    // Cancel only), and chapter 12's parsing and translation hints are the
+    // same shape with Active/Middle-Passive and εἰμί/ἔχω labels. The Augment
+    // Drill's hint is inline prose with no navigation at all.
+    ['ch11 This and That hint (sg/pl toggle, no say)', '#/activity/chapt_11/c11_drill_this_that', 'hint', 'toggle', 1],
+    ['ch11 Who and The hint (article/ὅς, sg/pl toggle)', '#/activity/chapt_11/c11_drill_who_the', 'hint', 'toggle', 1],
+    ['ch11 This and That Translation hint (sg/pl toggle)', '#/activity/chapt_11/c11_drill_translation_this_that', 'hint', 'toggle', 1],
+    ['ch11 Relative Translation hint (ὅς, sg/pl toggle)', '#/activity/chapt_11/c11_drill_translation_relative', 'hint', 'toggle', 1],
+    ['ch12 Parsing hint (composite, 2 states)', '#/activity/chapt_12/c12_drill_parsing', 'hint', 'toggle', 1],
+    ['ch12 Translation hint (λύω, 2 states)', '#/activity/chapt_12/c12_drill_translation', 'hint', 'toggle', 1],
+    ['ch12 Augment Drill hint (inline prose, no nav)', '#/activity/chapt_12/c12_drill_augment', 'hint', 'none', 0],
+    ['ch11 Demonstrative Examples popup (no nav)', '#/activity/chapt_11/c11_learn_demonstratives', 'expanderlink', 'none', 0],
     ['ch2 Syllable Division hint (prose, no nav)', '#/activity/chapt_2/c2_ex_syllable_division', 'hint', 'none', 0],
     ['ch3 Learn Verbs Endings modal (no nav)', '#/activity/chapt_3/c3_learn_verbs', 'endings', 'none', 0],
     ['ch6 preposition popup (no nav)', '#/activity/chapt_6/c6_learn_prepositions', 'popup', 'none', 0],
@@ -718,6 +733,12 @@ const shot = async name => {
       await page.locator('.rail-next').click();
     } else if (how === 'settings') {
       await page.getByRole('button', { name: 'Clear downloaded audio', exact: true }).click();
+    } else if (how === 'expanderlink') {
+      // 5H: the C3 link lives INSIDE the C6 accordion it belongs to, so the
+      // accordion opens first and the green link under it opens the modal.
+      await page.locator('.card details summary').first().click();
+      await page.waitForTimeout(150);
+      await page.locator('.card .popup-link').first().click();
     } else {
       await gotoTopic(1);
       await page.locator('.rc-sense-link').first().click();
diff --git a/scripts/ui-disclosure3.mjs b/scripts/ui-disclosure3.mjs
index 20d3fbf..96edea6 100644
--- a/scripts/ui-disclosure3.mjs
+++ b/scripts/ui-disclosure3.mjs
@@ -9,7 +9,8 @@
 //   npm run preview
 //   node scripts/ui-disclosure3.mjs [--list]
 
-// --list prints the complete 219-row classification after the assertions.
+// --list prints the complete 270-row classification after the assertions
+// (219 through chapter 10; chapters 11 and 12 added 51 more at 5H).
 
 import { chromium } from 'playwright-core';
 import { readFileSync } from 'node:fs';
@@ -28,7 +29,7 @@ const normalize = value => String(value ?? '').replace(/\s+/g, ' ').trim().norma
 
 const chapters = new Map();
 const lexicons = new Map();
-for (let number = 1; number <= 10; number += 1) {
+for (let number = 1; number <= 12; number += 1) {
   const nn = String(number).padStart(2, '0');
   chapters.set(`chapt_${number}`, JSON.parse(readFileSync(`src/data/chapt-${nn}.json`, 'utf8')));
   lexicons.set(`chapt_${number}`, JSON.parse(readFileSync(`src/data/lexicon-chapt${nn}.json`, 'utf8')));
@@ -93,7 +94,7 @@ const EXPECTED_CHANGED = [
   'c1_ex_phonetic',
   'c1_ex_pronounce',
   'c1_learn_letters',
-  ...Array.from({ length: 10 }, (_, index) => `c${index + 1}_learn_vocab`)
+  ...Array.from({ length: 12 }, (_, index) => `c${index + 1}_learn_vocab`)
 ].sort();
 const EXPECTED_EXEMPTED = [
   'c1_drill_capitals',
@@ -113,19 +114,22 @@ const behaviorEntries = stored.filter(entry => entry.section === 'drill' || entr
 const missingLedger = behaviorEntries.filter(entry => !ledgerRows.has(entry.activity.id)).map(entry => entry.activity.id);
 const orphanLedger = [...ledgerRows.keys()].filter(id => !byId.has(id));
 
-check('W2.1 all ten chapter stores and rails contain exactly 219 activities',
-  stored.length === 219 && sequenced.length === 219,
+check('W2.1 all twelve chapter stores and rails contain exactly 270 activities',
+  stored.length === 270 && sequenced.length === 270,
   `${stored.length} stored / ${sequenced.length} sequenced`);
 check('W2.2 every activity appears exactly once in its chapter sequence',
   duplicateStored.length === 0 && duplicateSequence.length === 0
     && missingFromSequence.length === 0 && unknownInSequence.length === 0,
   `duplicate store [${duplicateStored}], duplicate rail [${duplicateSequence}], missing [${missingFromSequence}], unknown [${unknownInSequence}]`);
-check('W2.3 every drill/exercise maps to one of the 95 exact ledger rows',
-  ledgerRows.size === 95 && behaviorEntries.length === 95
+check('W2.3 every drill/exercise maps to one of the 115 exact ledger rows',
+  ledgerRows.size === 115 && behaviorEntries.length === 115
     && missingLedger.length === 0 && orphanLedger.length === 0,
   `${ledgerRows.size} rows / ${behaviorEntries.length} activities; missing [${missingLedger}], orphan [${orphanLedger}]`);
-check('W2.4 exhaustive classification is 13 changed / 202 already-loaded / 4 exempted',
-  changed.length === 13 && alreadyLoaded.length === 202 && exempted.length === 4,
+// 5H: chapters 11 and 12 added 51 activities, all sequence-stepped and all
+// already-loaded except their two Learn Vocabulary flashcard steppers, which
+// join the B-last changed set for the same reason every other chapter's did.
+check('W2.4 exhaustive classification is 15 changed / 251 already-loaded / 4 exempted',
+  changed.length === 15 && alreadyLoaded.length === 251 && exempted.length === 4,
   `${changed.length} / ${alreadyLoaded.length} / ${exempted.length}`);
 check('W2.5 changed classification is the exact B-last sequence-mode set',
   JSON.stringify(changedIds) === JSON.stringify(EXPECTED_CHANGED), changedIds.join(', '));
diff --git a/scripts/ui-modals.mjs b/scripts/ui-modals.mjs
index 8f770bf..1be6f0d 100644
--- a/scripts/ui-modals.mjs
+++ b/scripts/ui-modals.mjs
@@ -223,6 +223,42 @@ const SURFACES = [
     await page.waitForTimeout(180);
   }],
   ['ch7-adjective-case-hint', hint('chapt_7', 'c7_drill_case', false)],
+  // 5H: chapter 11's four hints are form-dependent (D-46), so the two that
+  // route to two different charts are sought by FORM rather than trusted to
+  // shuffle -- an οὗτος item and an ἐκεῖνος item open different modals, and
+  // both have to fit at every height. Chapter 12's parsing hint does the same
+  // across λύω and εἰμί. Each is a §4.5 lone centred toggle with no say-all,
+  // so the hint-say column of the assertion is false throughout.
+  ['ch11-this-that-hint-this', hintAtPrompt('chapt_11', 'c11_drill_this_that', 'οὗτος', 30, 0), true, false],
+  ['ch11-this-that-hint-this-plural', hintAtPrompt('chapt_11', 'c11_drill_this_that', 'οὗτος', 30, 1), true, false],
+  ['ch11-this-that-hint-that', hintAtPrompt('chapt_11', 'c11_drill_this_that', 'ἐκεῖνος', 30, 0), true, false],
+  ['ch11-who-the-hint-article', hintAtPrompt('chapt_11', 'c11_drill_who_the', 'τῆς', 30, 0), true, false],
+  ['ch11-who-the-hint-relative', hintAtPrompt('chapt_11', 'c11_drill_who_the', 'ὅς', 30, 0), true, false],
+  ['ch11-translation-this-that-hint', hint('chapt_11', 'c11_drill_translation_this_that', false, 0), true, false],
+  ['ch11-translation-relative-hint', hint('chapt_11', 'c11_drill_translation_relative', false, 0), true, false],
+  ['ch11-demonstrative-examples-popup', async () => {
+    await go('#/activity/chapt_11/c11_learn_demonstratives');
+    await page.locator('.card details summary').first().click();
+    await page.waitForTimeout(150);
+    await page.locator('.card .popup-link').first().click();
+    await page.waitForTimeout(180);
+  }],
+  ['ch11-verse-speller-greek-keyboard', async () => {
+    await go('#/activity/chapt_11/c11_ex_scripture_speller');
+    await page.locator('.card').getByRole('button', { name: 'Greek Keyboard', exact: true }).click();
+    await page.waitForTimeout(180);
+  }],
+  ['ch12-parsing-hint-luo', hintAtPrompt('chapt_12', 'c12_drill_parsing', 'ἔλυες', 23, 0), true, false],
+  ['ch12-parsing-hint-luo-mp', hintAtPrompt('chapt_12', 'c12_drill_parsing', 'ἔλυες', 23, 1), true, false],
+  ['ch12-parsing-hint-eimi', hintAtPrompt('chapt_12', 'c12_drill_parsing', 'ἦμεν', 23, 0), true, false],
+  ['ch12-parsing-hint-echo', hintAtPrompt('chapt_12', 'c12_drill_parsing', 'ἦμεν', 23, 1), true, false],
+  ['ch12-translation-hint', hint('chapt_12', 'c12_drill_translation', false, 0), true, false],
+  ['ch12-augment-hint', hint('chapt_12', 'c12_drill_augment', false)],
+  ['ch12-verse-speller-greek-keyboard', async () => {
+    await go('#/activity/chapt_12/c12_ex_scripture_speller');
+    await page.locator('.card').getByRole('button', { name: 'Greek Keyboard', exact: true }).click();
+    await page.waitForTimeout(180);
+  }],
   ['ch1-speller-greek-keyboard', async () => {
     await go('#/activity/chapt_1/c1_ex_speller');
     await page.locator('.card').getByRole('button', { name: 'Greek Keyboard', exact: true }).click();
diff --git a/scripts/ui-offline.mjs b/scripts/ui-offline.mjs
index 18f7166..141860d 100644
--- a/scripts/ui-offline.mjs
+++ b/scripts/ui-offline.mjs
@@ -14,7 +14,7 @@ import { readFileSync } from 'node:fs';
 const args = Object.fromEntries(process.argv.slice(2)
   .filter(a => a.startsWith('--'))
   .map(a => { const i = a.indexOf('='); return i === -1 ? [a.slice(2), true] : [a.slice(2, i), a.slice(i + 1)]; }));
-const CHAPTERS = String(args.chapters || 'chapt_9,chapt_10').split(',');
+const CHAPTERS = String(args.chapters || 'chapt_11,chapt_12').split(',');
 const BASE = process.env.BASE || `http://localhost:${args.port || 4173}`;
 async function launch() {
   try { return await chromium.launch(); } catch {
diff --git a/src/app.css b/src/app.css
index 99eb09e..ca2441f 100644
--- a/src/app.css
+++ b/src/app.css
@@ -724,6 +724,23 @@ button { font: inherit; cursor: pointer; }
    translation keeps the table's two columns so its gloss aligns with the
    gloss column of the rows around it. */
 .rc-greekrows.gloss-only .rc-greekrow.parts-row:not(.has-gloss) { grid-template-columns: minmax(0, 1fr); }
+/* 5H: the ch12 contraction examples. Rule and augmented form pair up on the
+   first line and the derivation ("ἀκούω + ε augment") takes the row beneath
+   at phone widths -- οἰκοδομέω at the equation size overruns 320px beside
+   anything. From 560px up the original's three columns fit on one line. */
+.rc-greekrows.contraction .rc-greekrow { grid-template-columns: minmax(4.5em, auto) minmax(0, 1fr);
+  gap: 4px 10px; }
+.rc-greekrows.contraction .rc-contraction-rule { color: var(--teal-dark); font-size: 0.95rem;
+  white-space: nowrap; }
+.rc-greekrows.contraction .rc-contraction-form { min-width: 0; font-size: 1.3rem; text-align: left; }
+.rc-greekrows.contraction .rc-contraction-form.greek-say { width: auto; color: var(--link); }
+.rc-greekrows.contraction .rc-parts { grid-column: 1 / -1; }
+.rc-greekrows.contraction .rc-part { font-size: 1.15rem; }
+@media (min-width: 560px) {
+  .rc-greekrows.contraction .rc-greekrow {
+    grid-template-columns: minmax(4.5em, auto) minmax(0, 0.8fr) minmax(0, 1.2fr); }
+  .rc-greekrows.contraction .rc-parts { grid-column: auto; }
+}
 .rc-greekrows.english-pairs .rc-greekrow { text-align: center; }
 .rc-english-cell { min-width: 0; overflow-wrap: break-word; }
 .rc-greeklabel { font-weight: 600; overflow-wrap: anywhere; }
@@ -1174,6 +1191,15 @@ button { font: inherit; cursor: pointer; }
 
 /* ---- Drill additions ---- */
 /* The scripture citation the original prints with the drill word. */
+/* 5H: the Augment Drill's prompt panel prints the lemma's English gloss on
+   its own line under the Greek, above the reference (5H-SPEC1 3.5). English,
+   ink, never a tap target. */
+.prompt-gloss { text-align: center; color: var(--ink); font-size: 1rem; margin: -10px 0 4px; }
+/* The citation's own -10px top margin exists to tuck it under a prompt that
+   has 18px of padding beneath it. With a gloss line between them there is no
+   such padding to reclaim, so the pull is cancelled and the three lines stack
+   as the original's panel does. */
+.prompt-gloss + .prompt-citation { margin-top: 0; }
 .prompt-citation { text-align: center; color: var(--teal-dark); font-size: 0.82rem;
   font-weight: 700; margin: -10px 0 6px; }
 /* advanceClass manualOnIncorrect: the item is final and nothing is moving. */
diff --git a/src/components/ContentAudio.svelte b/src/components/ContentAudio.svelte
index 8f7232e..4848f65 100644
--- a/src/components/ContentAudio.svelte
+++ b/src/components/ContentAudio.svelte
@@ -7,7 +7,7 @@
   // modes are pedagogical layouts reconstructed from the original's yellow
   // panels; their per-mode data contracts are documented in HANDOFF-4 §5 (B1).
   import { onDestroy } from 'svelte';
-  import { getGreekTapMap, headingCovers, resolveItems, shuffle } from '../lib/content.js';
+  import { getGreekTapMap, headingKey, resolveItems, shuffle } from '../lib/content.js';
   import { splitGreekRuns } from '../lib/greek.js';
   import { play, playOnLoad, stop as stopAudio } from '../lib/audio.js';
   import { markCompleted } from '../lib/progress.js';
@@ -94,8 +94,21 @@
   // the chart's title stands and this heading steps aside. The reverse case
   // (the chart title is an abbreviation of the topic's, chapter 5) is handled
   // the other way round inside RichContent and is untouched.
+  // 5H generalises the rule from "the chart says the topic's heading and MORE"
+  // to "the chart prints a panel heading of its own". Chapter 11's paradigm
+  // topics are named for the original's RADIO LABELS ('"That" Paradigm') while
+  // the yellow panel is headed with the lemma (ἐκεῖνος — that/those) — and the
+  // original drops the radio column entirely on those screens, so the panel
+  // heading is the only heading there. A chart titled exactly as its topic is
+  // (chapters 4, 5, 7, 8) is NOT a second heading: RichContent drops the
+  // chart's copy and this one stays, which is why the comparison folds through
+  // the same headingKey the renderer uses.
   $: topicTitleCovered = !!currentTopic && (currentTopic.content || [])
-    .some(block => block && headingCovers(block.title, currentTopic.title));
+    .some(block => block && printsOwnHeading(block, currentTopic.title));
+  function printsOwnHeading(block, topicTitle) {
+    const titles = [block.title, ...((block.charts || []).map(chart => chart && chart.title))];
+    return titles.some(title => title && headingKey(title) !== headingKey(topicTitle));
+  }
   $: activityGreekTaps = activity.greekTaps === true
     ? getGreekTapMap(chapter.id)
     : activity.greekTaps;
@@ -288,6 +301,8 @@
       <RichContent
         blocks={currentTopic.content || []}
         suppressTitle={currentTopic.title}
+        titleAudio={topicTitleCovered ? currentTopic.titleAudio || null : null}
+        noteTaps={currentTopic.audioMap || null}
         greekTaps={currentTopic.greekTaps === true
           ? getGreekTapMap(chapter.id)
           : (currentTopic.greekTaps || activityGreekTaps)} />
@@ -329,7 +344,8 @@
            anywhere), so this reads title off the PAGE the same way every
            other paradigmChart activity does -- no per-shape branch left to
            drift out of sync with the data. -->
-      <Paradigm paradigm={page} title={activity.chartTitle || page.title || null} />
+      <Paradigm paradigm={page} title={activity.chartTitle || page.title || null}
+                titleAudio={activity.titleAudio || null} />
       <!-- Paradigm.svelte already draws chart.sayWhole INSIDE the card when
            the chart carries one (every chart here does). This block adds
            only the More/Back stepper beside it -- an EXTERNAL sayWhole is
diff --git a/src/components/Paradigm.svelte b/src/components/Paradigm.svelte
index a6c6b29..a607223 100644
--- a/src/components/Paradigm.svelte
+++ b/src/components/Paradigm.svelte
@@ -14,12 +14,31 @@
   // audio clip. Endings rows are bare morphemes with no clips of their own, so
   // they render in ink rather than tappable blue.
   import { play, stop as stopAudio } from '../lib/audio.js';
-  import { splitTaps } from '../lib/greek.js';
+  import { headingKey } from '../lib/content.js';
+  import { splitGreekRuns, splitTaps } from '../lib/greek.js';
   import EndingsGrid from './EndingsGrid.svelte';
   import MeaningsCard from './MeaningsCard.svelte';
   import ParadigmActions from './ParadigmActions.svelte';
   export let paradigm;
   export let title = null;
+  // The heading the HOST already printed above this chart, so a chart title
+  // that repeats it prints once (the same contract RichContent applies to a
+  // block title). Only the `charts[]` fallback below consults it: a title the
+  // host passed in explicitly has already been folded.
+  export let suppressTitle = null;
+  // D-40: the panel heading is itself a Greek tap where the original wires one
+  // ("Imperfect Active Indicative of λύω" plays λύω). The HOST supplies the
+  // clip -- chapter 12 declares it on the topic (or on the Quick Review
+  // activity) and the chart title is what ends up printing that heading, so
+  // the tap follows the heading rather than the block it was declared on.
+  export let titleAudio = null;
+  // A form -> clip map the HOST declared FOR THIS PAGE'S OWN TEXT (chapter
+  // 12's topic-level `audioMap`, which names θέλω and ἤθελεν because the ἔχω
+  // note is where they are displayed). A chart's own `noteTaps` still wins.
+  // Deliberately not the chapter-wide tap map: that would silently blue words
+  // in older chapters' notes that the original prints as plain notation
+  // (chapter 5's "Note ὁ and ἡ are enclitics").
+  export let noteTaps = null;
   // The control row (Say Paradigm, and the switch where a chart has one)
   // normally lives inside the chart body. A host that pins its own row —
   // the composite two-state Hint modal, whose footer holds Say + toggle +
@@ -65,6 +84,18 @@
     ? paradigm.charts
     : [paradigm || {}];
   $: chart = charts[chartIndex] || charts[0] || {};
+  // 5H W3: a `charts[]` block carries its heading on each CHART, not on the
+  // wrapper — chapter 11 pages "ἐκεῖνος — that/those" over a topic whose radio
+  // label is '"That" Paradigm', and the reflexive stack renames itself First /
+  // Second / Third Person as More/Back steps. A host that has its own title
+  // still wins (chapter 8's "Third Person Paradigm" sits on the wrapper), and a
+  // chart title that only repeats the heading the host already printed is
+  // dropped rather than stacked under it — chapters 4/5/7 title their charts
+  // exactly as their topics are titled and must keep printing ONE heading.
+  $: chartHeading = title
+    || (charts.length > 1 && chart.title
+      && !(suppressTitle && headingKey(chart.title) === headingKey(suppressTitle))
+      ? chart.title : null);
   // TWO LEMMA SHAPES. Chapters 4 and 5 ship an object ({greek, gloss, audio});
   // chapter 7 ships the headword as a bare STRING with the gloss beside it on
   // the chart ("lemma": "ἀγαθός", "gloss": "good"), which printed the lemma
@@ -240,8 +271,12 @@
          the same. -->
     {#if showingEndings}
       <div class="pg-title">{chart.endings.label || 'Endings'}</div>
-    {:else if title}
-      <div class="pg-title">{title}</div>
+    {:else if chartHeading}
+      <div class="pg-title">
+        {#if titleAudio}
+          {#each splitGreekRuns(chartHeading) as run}{#if run.greek}<button class="greek-tap greek" on:click={() => play(titleAudio)}>{run.t}</button>{:else}{run.t}{/if}{/each}
+        {:else}{chartHeading}{/if}
+      </div>
     {/if}
     <!-- 5F-FEEDBACK.pdf item 8/9: a per-chart secondary heading, changing as
          chartIndex changes -- unlike `title` (an outer, static prop), this
@@ -361,7 +396,7 @@
            chart.noteTaps is tappable inside the note, same contract as
            RichContent's greekTaps — chapter 8's emphatic forms ἐμοῦ, ἐμοί,
            ἐμέ each play their own clip. Unlisted text stays ink. -->
-      <div class="pg-note">{#each splitTaps(chart.note, chart.noteTaps) as seg}{#if seg.audio}<button class="greek-tap greek" on:click={() => play(seg.audio)}>{seg.t}</button>{:else}{seg.t}{/if}{/each}</div>
+      <div class="pg-note">{#each splitTaps(chart.note, chart.noteTaps || noteTaps) as seg}{#if seg.audio}<button class="greek-tap greek" on:click={() => play(seg.audio)}>{seg.t}</button>{:else}{seg.t}{/if}{/each}</div>
     {/if}
 
     <!-- THE SAY-ALL ROW, IN FLOW. It scrolls with its chart everywhere except
diff --git a/src/components/RichContent.svelte b/src/components/RichContent.svelte
index 9c9755a..bc7dadc 100644
--- a/src/components/RichContent.svelte
+++ b/src/components/RichContent.svelte
@@ -39,6 +39,12 @@
   // chart. Same principle as dedupeExpanders below: the data is not ours to
   // edit, so the renderer declines to say it twice.
   export let suppressTitle = null;
+  // The clip for the heading a chart block prints, when the HOST has stepped
+  // aside and that title is the page's only heading (D-40, chapter 12).
+  export let titleAudio = null;
+  // Clips for Greek printed in a chart's `note` line, where the host declared
+  // them for this page's own text (chapter 12's topic `audioMap`).
+  export let noteTaps = null;
   // One delivered topic abbreviates Masculine to Masc while its chart spells
   // the word out ("First Declension—Masc" over "First Declension—Masculine",
   // chapter 5). They are the same heading in the original, not two stacked
@@ -411,6 +417,7 @@
       <div class="rc-greekrows" class:syllable-matrix={syllableMatrix} class:row-labels={rowLabels}
            class:gloss-only={b.layout === 'glossOnly'} class:english-pairs={b.layout === 'englishPairs'}
            class:compound-verbs={b.layout === 'compoundVerbs'}
+           class:contraction={b.layout === 'contraction'}
            class:titled={b.title} class:centered={b.centered} class:rc-gap-before={b.gapBefore}
            class:paired-gutter={b.pairedGutter}>
         <!-- `headerUnderline` USED TO BIND `head-underline` HERE, and does not
@@ -484,6 +491,36 @@
                 {/each}
               </span>
             </div>
+          {:else if b.layout === 'contraction'}
+            <!-- 5H §4 (ch12 Augments > Contraction Examples): the original
+                 prints each example as one line reading rule, augmented form,
+                 then the lemma the augment was added to -- "ε + α = η
+                 ἤκουον   ἀκούω + ε augment". BOTH Greek forms carry their own
+                 clip and tap; the rule is notation and stays ink. The
+                 derivation is one unit, so at phone widths it drops to its own
+                 line under the pair rather than splitting mid-equation. -->
+            <div class="rc-greekrow rc-contraction-row" style="--greek-cols:2">
+              <span class="rc-contraction-rule">{row.gloss}</span>
+              {#if row.audio}
+                <button class="rc-contraction-form greek greek-say" on:click={() => playAudio(row.audio)}>{row.greek}</button>
+              {:else}
+                <span class="rc-contraction-form greek">{row.greek}</span>
+              {/if}
+              <span class="rc-parts">
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
@@ -626,7 +663,8 @@
       <!-- A conjugation/declension chart. Its own component because the same
            grid is ALSO a full-page contentAudio mode (paradigmChart) and the
            Hint popup on three chapter-3 drills — one renderer, three hosts. -->
-      <Paradigm paradigm={b} title={sameTitle(b.title) ? null : b.title} />
+      <Paradigm paradigm={b} title={sameTitle(b.title) ? null : b.title} {suppressTitle} {titleAudio}
+                noteTaps={b.noteTaps || noteTaps} />
 
     {:else if b.type === 'prepositionsChart'}
       <!-- 5F §2.1: chapter 6's ten prepositions as a DIAGRAM. The same block
diff --git a/src/components/SelectActivity.svelte b/src/components/SelectActivity.svelte
index 105155b..b2af2e0 100644
--- a/src/components/SelectActivity.svelte
+++ b/src/components/SelectActivity.svelte
@@ -311,6 +311,25 @@
   // on arrival) rather than falling silent; check:shapes rejects any value
   // outside the five, and apply-behavior-matrix.py stamps every shipped drill.
   $: audioTiming = activity.audioTiming || 'beforeGuess';
+  // 5H-SPEC1 3.5 / proposed D-50 -- THE ANSWER-CLIP PROMPT GATE. Chapter 12's
+  // Augment Drill shows a present-tense lemma and asks which of three GREEK
+  // forms is its correctly augmented imperfect; the item's clip (ledger row
+  // 108, CONFIRMED) records the AUGMENTED ANSWER, not the lemma on screen, so
+  // the prompt tap and Pronounce would hand the answer over before the guess.
+  //
+  // Stated structurally rather than by activity id: when the prompt is Greek
+  // AND the options are Greek AND the clip is afterGuess, that clip cannot be
+  // the prompt's own -- the answer is one of the displayed forms and the
+  // recording is of it. Until the item is answered the lemma renders in INK
+  // (the Syllable Division exception treatment, directive 9) and Pronounce is
+  // disabled; afterwards both go live and replay the clip. The triple matches
+  // exactly one activity across all twelve chapters today and covers the next
+  // drill built this way without an edit here. English-prompt Greek-option
+  // drills (every Vocabulary: English to Greek) are untouched -- their prompt
+  // is not Greek.
+  $: answerClipPrompt = promptIsGreek && greekOptions && audioTiming === 'afterGuess';
+  // Whether the prompt tap and Pronounce may speak the clip right now.
+  $: promptClipLive = !answerClipPrompt || answered;
   // §5.5: the item is final and nothing is going to move it. Which outcomes
   // those are is the class's business, not this component's.
   $: waitingForNext = answered && waitsForNext(advancePolicy, answeredCorrect);
@@ -526,7 +545,11 @@
       : [...shownReveals, field];
   }
 
-  $: glossRevealed = !!current && shownReveals.some(field => revealValue(field) === current.gloss);
+  // ...or, on a `promptGloss` drill, already standing in the prompt panel from
+  // the moment the item mounted. Either way the answer reveal does not print
+  // the same English a second time.
+  $: glossRevealed = !!current && (!!activity.promptGloss
+    || shownReveals.some(field => revealValue(field) === current.gloss));
 
   // §2.3: pressing Previous/Next stops the clip and shows the item AT ONCE.
   // The afterGuess wait is a courtesy, not a lock.
@@ -577,7 +600,7 @@
            what made marks ride low: its origin depends on line-height and on
            which metric the browser picks for the strut. -->
       <button class="prompt greek greek-say red-mark" aria-label={current.prompt} disabled={!current.promptAudio} on:click={() => current.promptAudio && play(current.promptAudio)}>{#each redParts as part}{#if part.marks}<span class="rm-cluster" class:legacy={part.layout} style={part.bx || part.aw ? `--bx:${part.bx || 0}em; --aw:${part.aw || 0}em` : null}><span class="rm-marks {part.layout || ''}" class:capital={part.capital} aria-hidden="true">{#each part.marks as mark}<span class="rm-mark {mark.slot || ''}" class:red={mark.red} style={mark.x != null ? `--mx:${mark.x}em; --my:${mark.y}em${mark.clip ? `; clip-path:polygon(${mark.clip[0]}em -3em, ${mark.clip[1]}em -3em, ${mark.clip[1]}em 3em, ${mark.clip[0]}em 3em)` : ''}` : null}>{mark.glyph}</span>{/each}</span><span class="rm-base">{part.base}</span></span>{:else if part.red}<span class="mark-red">{part.text}</span>{:else}{part.text}{/if}{/each}</button>
-    {:else if promptIsGreek && current.promptAudio}
+    {:else if promptIsGreek && current.promptAudio && promptClipLive}
       <!-- The red-mark branch above deliberately does NOT take this class: its
            mark offsets are em-relative and correct, and nothing about mark
            geometry moves in this round.
@@ -594,7 +617,10 @@
       {@const parts = sentenceParts(current.prompt, current.underline)}
       <div class="prompt select-sentence">{parts[0]}<u>{parts[1]}</u>{parts[2]}</div>
     {:else}
-      <div class="prompt" class:greek={promptIsGreek}>{current.prompt}</div>
+      <!-- INK, not link blue: either the prompt carries no clip at all, or the
+           answer-clip gate above is holding its clip until the guess. `long`
+           rides along so the type does not jump size when the gate opens. -->
+      <div class="prompt" class:greek={promptIsGreek} class:long={promptIsGreek && longPrompt}>{current.prompt}</div>
     {/if}
     <!-- 5F §2.5: the case tag / parse tag / disambiguator sits BESIDE the
          prompt, on the same line, in plain ink at a smaller size — "πρός (to)",
@@ -605,6 +631,13 @@
     {#if current.note && !(promptIsGreek && current.promptAudio)}
       <div class="prompt-note standalone">{current.note}</div>
     {/if}
+    <!-- 5H-SPEC1 3.5: the Augment Drill's prompt panel is THREE lines -- the
+         present lemma, its English gloss beneath it, and the reference in the
+         corner. `promptGloss` says the item's gloss belongs to the PROMPT
+         PANEL rather than to a Translate reveal (this drill has no Translate
+         control), so it prints under the lemma from the moment the item
+         mounts. It is English and never a tap target. -->
+    {#if activity.promptGloss && current.gloss}<div class="prompt-gloss">{current.gloss}</div>{/if}
     <!-- The scripture citation the original prints beside the drill word. -->
     {#if current.citation}<div class="prompt-citation">{current.citation}</div>{/if}
     {#if current.pending}
@@ -733,7 +766,7 @@
         <!-- Speaks the prompt where the prompt is the Greek; on the Greek Verb
              Drill (English prompt) it speaks the answer form, which is what
              the original's Pronounce does there. -->
-        {@const say = current.promptAudio || current.answerAudio}
+        {@const say = promptClipLive ? (current.promptAudio || current.answerAudio) : null}
         <button class="btn" disabled={!say} on:click={() => say && play(say)}>Pronounce</button>
       {/if}
       {#each orderedRevealControls as control}
diff --git a/src/lib/content.js b/src/lib/content.js
index 8dd24c1..73937f0 100644
--- a/src/lib/content.js
+++ b/src/lib/content.js
@@ -166,14 +166,23 @@ export function getGreekTapMap(chapterId) {
 
 // Every activity-level `audioMap` in a chapter, merged. First declaration wins,
 // so a form declared once cannot mean two clips on two pages.
+// 5H: chapters 11 and 12 declare the same map one level DOWN, on the topic
+// that prints the forms (the reflexive prose's αὐτός/ἀλλήλων, chapter 12's
+// compound-verb and θέλω lines), because only one topic of a seven-topic page
+// needs them. Both levels are read here, activity first, so a form still means
+// one clip chapter-wide and neither placement is a special case downstream.
 export function chapterAudioMap(chapter) {
   const map = {};
   if (!chapter) return map;
+  const absorb = source => {
+    for (const [form, audio] of Object.entries(source || {})) {
+      if (form && audio && !map[form]) map[form] = audio;
+    }
+  };
   for (const section of SECTIONS) {
     for (const activity of chapter[section] || []) {
-      for (const [form, audio] of Object.entries(activity.audioMap || {})) {
-        if (form && audio && !map[form]) map[form] = audio;
-      }
+      absorb(activity.audioMap);
+      for (const topic of activity.topics || []) absorb(topic.audioMap);
     }
   }
   return map;
@@ -373,6 +382,19 @@ function sensePool(chapter) {
     if (!lemma) continue;
     const senses = Array.isArray(lemma.senses) && lemma.senses.length ? lemma.senses : [null];
     let untaggedTaken = false;
+    // 5H: the Review Vocabulary Chart prints each word's NT frequency after
+    // its translation, and `showNtFreq` says so — but the number lives on the
+    // LEMMA and this pool hands the surface a CARD, so every senses-pool
+    // review chart (chapters 9, 10, 11 and 12) has been printing glosses with
+    // no numbers at all. A case-split lemma carries the count ONCE, on its
+    // first card: the original sets "ὑπέρ  for, about (gen.)(150)" over
+    // "above, beyond (acc.)" with no second number (ch11railwalk p20).
+    let freqTaken = false;
+    const freqFor = () => {
+      if (freqTaken || lemma.ntFreq == null) return null;
+      freqTaken = true;
+      return lemma.ntFreq;
+    };
     for (const sense of senses) {
       if (!sense || !sense.caseTag) {
         if (untaggedTaken) continue;          // the paired forms share one card
@@ -382,6 +404,7 @@ function sensePool(chapter) {
           display: lemma.lexicalForm || lemma.greek,
           greek: lemma.greek,
           gloss: lemma.gloss || lemma.glossShort || '',
+          ntFreq: freqFor(),
           audio: (sense && sense.audio) || lemma.audio || null
         });
         continue;
@@ -400,6 +423,7 @@ function sensePool(chapter) {
         greek: sense.greek || lemma.greek,
         caseTag: sense.caseTag || null,
         gloss: sense.gloss || sense.glossShort || '',
+        ntFreq: freqFor(),
         audio: sense.audio || lemma.audio || null
       });
     }
```

---

## Untracked files created by this round

Documents:

```
buildout/5H-SPEC1-RESULTS-OPUS.md
buildout/5H-SPEC1-BUILD-OPUS.md
buildout/5H-VISUAL-CHECKLIST-OPUS.md
```

Evidence (screenshot corpora, in the repo's usual `buildout/screenshots/`
convention):

```
buildout/screenshots/5h-walk-opus/                 178 PNG + walk-report.json
  320/chapt_11/*.png  (52)   320/chapt_12/*.png  (37)
  768/chapt_11/*.png  (52)   768/chapt_12/*.png  (37)
buildout/screenshots/5h-modals-opus/               470 PNG + modal-report.json
buildout/screenshots/5h-probe-augment-before.png   the Augment Drill before the guess
buildout/screenshots/5h-probe-augment-after.png    ...and after it
buildout/screenshots/5h-probe-demoexamples.png     the Demonstrative Examples modal
```

Working files created and then removed: `.5h-tmp/` (a CRLF-aware patch helper,
the document assembler and the harness logs) and `scripts/_probe-5h.mjs` (a
throwaway Playwright probe). Neither is part of the deliverable.

---

## (b) THOUGHT AND TOOL LOG

Chronological, with the reasoning that produced each decision.

### 1. Read the spec and the authorities

Read `5H-SPEC1.md` in full, then `AGENTS.md`, `CHAT-HANDOFF.md` (all 480 lines,
including the ten standing directives and the "added 2026-08-16" hard-won
rules), and the parts of `DIVERGENCE-LOG.md`, `DRILL-BEHAVIOR-RULES.md` and
`TITLE-SWEEP-RULES.md` the spec cites.

Checked the STOP conditions of section 0.4 first: all four data files are
present in `src/data`, both assemblers are in `scripts/`, and both rail walks
were attached. Nothing to stop on.

### 2. Establish the baseline before touching anything

`npm run check:shapes` — PASS over twelve chapters, so the delivered data was
already conformant. `npm run build`, then `npm run check:lazy-chunk` — PASS,
but the guard only NAMED ten chapters, which is W1's real content.

Started `npm run preview` (it landed on port 4176; three stale preview servers
from earlier sessions were holding 4173-4175, and all four serve the same
`dist/` off disk, so the port choice is cosmetic).

Ran `ui-walk` over both new chapters cold, before any code change. Result:
51 stops x 2 widths, no console errors, no interaction errors, one 320 px
overflow (`chapt_12/c12_learn_imperfect` topic 5, 12 px). That is an unusually
clean start, and it set the shape of the round: the work was going to be
rendering gaps, not data problems.

Then a mechanical census, because "which shapes does this data use that the
renderer does not know" is answerable exactly rather than by reading:

- every `type` value in the new files, diffed against chapters 1-10 -> **none new**;
- every KEY name in context, diffed the same way -> only `_`-prefixed
  provenance, plus `paradigm.headerUnderline` (inert by section 3.2) and
  `select.promptGloss`;
- every enum VALUE for `layout` / `switch` / `optionLayout` / `mode` /
  `options` / `pool` / `audioTiming` -> exactly one new: `greekRows`
  `layout: "contraction"`.

So the spec's "expected renderer novelty: NONE that requires a new mode or
block type" held, and the round had three known code targets before a line was
written.

### 3. W1 — the lazy-chunk guard

Added chapters 11 and 12 to `expected[]` in `check-lazy-chunk.mjs` with
distinctive needles taken from each chapter's English Concepts introduction (a
data string components never reference, which is what the guard needs).
Re-ran: PASS, both chunks emitted, precached, and out of the main bundle.

### 4. W2/W3 — the visual pass, and the first three defects

Worked page by page against the rail walks, reading BOTH the screenshots and
the walker's structural dump (`walk-report.json` carries rendered text,
underline runs, the tap inventory and per-element overflow, so "which words are
tappable" is a fact off the surface rather than an eyeball).

**Defect 1 — the paradigm panels had no heading.** The ch11 "That" Paradigm
screen rendered `"That" Paradigm` / `Singular` / chart, where the original
prints `ἐκεῖνος -- that/those`. Traced it: `RichContent` passes `b.title` to
`Paradigm`, and a `charts[]` block carries its title on each CHART. Checked
every prior chapter before touching it — chapters 4, 5 and 7 title their charts
exactly as their topics are titled, so a naive fallback would have doubled
their headings. Implemented the fallback WITH the existing `headingKey` fold
and a new `suppressTitle` prop, then re-walked chapters 4, 5, 7 and 8 to prove
they were unchanged on screen.

**Defect 2 — four dead Greek taps.** The reflexive prose showed `taps: []`
where the rail walk marks hand cursors on αὐτός and ἀλλήλων. The data declares
them in a TOPIC-level `audioMap`; `chapterAudioMap()` only walked
activity-level. Extended it to read both.

The same fix did not reach chapter 12's ἔχω exception note, because a chart's
`note` uses `chart.noteTaps` and nothing else. First attempt passed the whole
chapter tap map down — then checked what that would do to older chapters and
found it would blue ὁ / ἡ / οἱ / αἱ inside chapter 5's "Note ὁ and ἡ are
enclitics", which the original prints as notation. Backed that out and scoped
the prop to the host's own topic `audioMap` instead, which no chapter before 11
declares, so the blast radius is exactly the two new chapters.

**Defect 3 — D-40 chart-title taps.** `titleAudio` sits on the topic, but the
topic heading is folded away when the chart prints the fuller title, so the
clip had no surface. Passed `titleAudio` through to the panel heading and split
it into Greek runs there; also wired the `c12_qr_eimi` Quick Review page's
activity-level `titleAudio` the same way.

Confirmed the six-chart reflexive More/Back stack by driving it: six distinct
title/subtitle pairs, Back disabled at chart 1, More disabled at chart 6, Say
Paradigm live on every half.

### 5. W2 continued — the contraction layout

**Defect 4.** The Contraction Examples accordion printed
`ἀκούω / + ε augment / ε + α = η` — the augmented form ἤκουον was not on screen
at all, because the rows fell through to the generic `parts` branch, which
reads `parts` and `gloss` and ignores `greek`. Implemented `layout:
"contraction"` as its own branch reading rule / augmented form / derivation,
with both Greek forms tapping, and gave it a grid that drops the derivation to
its own line below 560 px. That also removed the round's only 320 px overflow
(the overrun was on `.rc-parts`, per the walker's own element-level report).

### 6. W4 — the drills

The three-stage grid, `answerAlt` tuples and per-item `hintRef` all turned out
to be already general in `buildTwoStageQuestions` and `SelectActivity` — the
5F/5G work generalised to N stages, and chapter 11 is simply the first data to
use three. Verified rather than assumed, by driving the grid and by reading the
commit rule.

**Defect 5 — the Augment Drill.** Two gaps: `promptGloss` was unimplemented
(the panel showed the lemma and the reference but not the gloss), and the
prompt was a live blue tap with Pronounce enabled, which with an `afterGuess`
clip that records the AUGMENTED ANSWER hands the answer over before the guess.

The interesting decision was how the renderer should KNOW. An activity-id
special case was available and cheap; DISCLOSURE-RULES section 5's habit is to
state rules structurally, so I looked for a structural predicate and tested it
as a census: Greek prompt + Greek options + `afterGuess` matches
`c12_drill_augment` and nothing else across all twelve chapters, while the
tempting looser predicate (Greek options + `afterGuess`) would have caught
every `Vocabulary: English to Greek` drill. Shipped the structural form.

Then found a duplicate: the answer reveal prints `current.gloss` too, so the
gloss appeared twice after a guess. Folded `promptGloss` into `glossRevealed`.
And a layout collision: `.prompt-citation` carries a -10px top margin to tuck
under the prompt's padding, which with a gloss line between them overlapped the
two. Cancelled the pull with an adjacent-sibling rule.

### 7. W7 — the vocabulary chart, and a defect older than this round

The ch11 Review Vocabulary Chart printed glosses with no NT frequencies,
although the data carries `ntFreq` on every lemma and `showNtFreq: true` on the
activity. Checked chapter 10 before assuming it was a chapter-11 problem: it
prints none either. Root cause is `sensePool()` — `showNtFreq` reads
`meta.ntFreq` and the pool hands the surface a CARD, which never carried the
count. Chapters 9, 10, 11 and 12 are all affected.

Fixed it in the pool and made a case-split lemma carry the count ONCE, on its
first card, because ch11railwalk p20 prints "ὑπέρ for, about (gen.)(150)" over
"above, beyond (acc.)" with no second number. Chapters 9 and 10 get their
frequencies back as a side effect; flagged in RESULTS section 3.3 because it
changes two already-device-verified pages, and recorded as a fidelity
RESTORATION rather than a divergence per the log's standing rule.

### 8. W9 — the harness

- `ui-behavior.mjs`: both chapters into `CHAPTERS` and `CH_5F`, then a new 5H
  section of twelve assertions covering every section 7.3 item.
- `ui-disclosure.mjs`: eight new D13 modal surfaces and a new `expanderlink`
  opener for the C3 link that lives inside the C6 accordion.
- `ui-disclosure3.mjs`: the census re-derived for twelve chapters.
- `ui-modals.mjs`: sixteen new surfaces; the form-dependent ones are sought by
  FORM through the drill's own Next, not left to shuffle.
- `ui-offline.mjs`: default chapters are now 11 and 12.

Three hard-coded census numbers had to move with the data — `poolKind` 8 -> 12
in D6.1, and 219 / 95 / 13-202-4 -> 270 / 115 / 15-251-4 in ui-disclosure3.
Each was checked against the run's own reported figure before being written
down, and the D6.1 failure was a COUNT failure with zero failing drills, not a
behavior failure.

### 9. The 5E-R1 heading check

The first full `ui-behavior` run failed six assertions in one place: 5E-R1, the
sweep that asserts every topic/chart title pair is resolved. Chapter 11
introduces a relationship the check had never seen — the topic is named for the
original's RADIO LABEL and the chart for its PANEL HEADING — and the app was
printing both.

Went back to the rail walk rather than to the check: ch11railwalk p4 shows the
paradigm screens with NO radio column, so the panel heading is the only heading
there. Generalised `ContentAudio`'s fold from "the chart says the topic's
heading and MORE of it" to "the chart prints a panel heading of its own", which
is what the original does, and re-walked chapters 5, 8, 9 and 10 to prove
nothing else moved.

Then fixed two real bugs in the CHECK itself, which its own failure output
exposed: it compared raw text where the renderer folds through `headingKey`
(so the Masc/Masculine pair it was written for landed in the wrong bucket), and
it asserted every chart's title against the resting page, where a `charts[]`
stack shows only chart 1. Corrected both and re-ran the whole file.

### 10. Gates, evidence and documents

Final gate run, all green (RESULTS section 6). Regenerated the committed walk
corpus after the last source change so the checklist's evidence matches the
delivered build. Wrote the three deliverables, logged **D-51** (the spec's
proposed "D-50" number was already spent on the 2026-08-25 process rules; the
entry names the collision rather than renumbering anything), and removed the
scratch files.

---

## Gate output

```
$ npm run check:shapes
PASS: content shapes intact - chapt-01 .. chapt-12 checked

$ npm run build
built in ~8s; PWA precache 43 entries

$ npm run check:lazy-chunk
PASS: lazy-chapter split intact - ... chapt-11-<hash>.js + lexicon-chapt11-<hash>.js;
      chapt-12-<hash>.js + lexicon-chapt12-<hash>.js emitted, precached, and chapter
      data is out of index-<hash>.js

$ npm run check:docs
43 document-integrity failure(s)   <- ALL PRE-EXISTING (the CRLF guard defect,
                                      DISCLOSURE-SPEC1 RESULTS 7.1). Every failing
                                      file is an archive document untouched this
                                      round; DIVERGENCE-LOG.md, which I did edit,
                                      passes.

$ node scripts/ui-walk.mjs --chapters=chapt_11,chapt_12 --out=buildout/screenshots/5h-walk-opus
walked 51 stops x 2 widths
checklist evidence: 132 width-specific shots (66 pages x 2 expected)
no horizontal overflow in chapt_11, chapt_12
all rail counts and Next actions are live
all authored expanders and chart states opened
no console errors
no waived console messages

$ node scripts/ui-offline.mjs
service worker installed; network offline
offline: 51 stops rendered, 0 missing, refresh OK
no console errors

$ node scripts/ui-disclosure.mjs
303/303 disclosure checks passed        (66 of them D13 states on the new ch11/ch12 modals)

$ node scripts/ui-disclosure3.mjs
84/84 DISCLOSURE-SPEC3 W2 checks passed (census 270 / 115 / 15-251-4)

$ node scripts/ui-behavior.mjs
1058/1058 behavior checks passed

$ node scripts/ui-modals.mjs --out=buildout/screenshots/5h-modals-opus
235/235 modal states clean
```

The twelve new 5H assertions, verbatim from the `ui-behavior` log:

```
PASS  5H ch11 This and That Drill: three option stages of 2 / 3 / 8
PASS  5H ch11 answerAlt: reached the ambiguous form "τούτου"
PASS  5H ch11 answerAlt: the alternate tuple [This / Neuter / Genitive Singular] grades CORRECT
PASS  5H D-46 c11_drill_this_that: the Hint chart differs between "οὗτος" and "ἐκεῖνος"
        ["οὗτος — this/these, Singular", "ἐκεῖνος — that/those, Singular"]
PASS  5H D-46 c12_drill_parsing: the Hint chart differs between "ἔλυες" and "ἦμεν"
        ["Imperfect Active Indicative of λύω", "Imperfect of εἰμί"]
PASS  5H ch11 named toggle: Say Paradigm survives the Singular/Plural switch
PASS  5H ch11 reflexive stack: SIX charts, Back disabled at the first and More at the last
PASS  5H ch12 Augment Drill: three GREEK options and a three-line prompt panel
PASS  5H ch12 Augment Drill: mounts SILENT (afterGuess, B-last)
PASS  5H ch12 Augment Drill: before the guess the lemma is INK and Pronounce is disabled
PASS  5H ch12 Augment Drill: after the guess the lemma taps and Pronounce is live
PASS  5H ch11 Scripture Memory Drill: one static 12-option grid over both halves of Mat 6:33
```
