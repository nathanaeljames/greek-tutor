# DISCLOSURE-SPEC2-BUILD-OPUS

Cumulative build record for DISCLOSURE-SPEC2 (§0). Checkpointed after each work
item; this is its final state.

- Implementer: Opus (claude-opus-5)
- Base: repo head `4f5f14d` (spec + the five data files), on `fae598e`
  (DISCLOSURE-SPEC1 merged, no XPATCH)
- Date: 2026-08-17
- Version control: NONE run. Read-only `git diff` / `git show` only. No commit,
  no stage, no push.

## 0. New files (untracked; listed verbatim)

| Path | Lines | What it is |
| --- | --- | --- |
| `src/components/ParadigmActions.svelte` | 86 | The say-all / toggle row, extracted because amended §4.3 gives it two placements (pinned beside a toggle, or in flow) and two copies of that markup would drift. W3. |
| `buildout/DISCLOSURE-SPEC2-RESULTS-OPUS.md` | - | Deliverable. |
| `buildout/DISCLOSURE-SPEC2-BUILD-OPUS.md` | - | This file. |
| `buildout/DISCLOSURE-VISUAL-CHECKLIST2-OPUS.md` | - | Deliverable. |
| `buildout/screenshots/disclosure2-opus/` | 55 PNGs | The harness's own screenshot pass. |
| `buildout/screenshots/disclosure2-panes/` | 21 PNGs | One screen per PDF pane, for the checklist's pane-by-pane rows. |

Also written by harness runs and not part of the deliverable:
`buildout/screenshots/walk-20260817-143625/` and
`buildout/screenshots/modals-20260817-143426/`.

## 1. Work-item checkpoint log

ROUND TOTAL: 1h07m (13:53 to 15:00 EDT, 2026-08-17). Segment times are
approximate, reconstructed from file mtimes and checkpoint boundaries, and are
elapsed wall clock rather than additive effort: the long harness runs executed
in the background while later work continued.

| # | Item | Segment | Build state at checkpoint |
| --- | --- | --- | --- |
| W1 | Data verification (structural JSON diff vs `fae598e`) | 13:53-14:00 | 27 label changes, nothing else |
| W2 | Accordion box style (amended §3.1) | 14:00-14:10 | build green |
| W3 | Modal footer discipline; main-content pinning revoked | 14:10-14:26 | build green |
| W4 | Quick Review never pages (amended §4.6) | 14:26-14:32 | build green |
| W5 | Data consumption check (visual) | 14:32-14:38 | all four areas confirmed on screen |
| -- | Harness: 5 reversed assertions rewritten, 64 checks added | 14:38-15:00 | full suite green |
| -- | Deliverables | 15:00- | -- |

## 2. Verification at final state

| Gate | Result |
| --- | --- |
| `npm run check:shapes` | PASS (0 failures) |
| `npm run build` | green |
| `npm run check:lazy-chunk` | PASS |
| `node scripts/ui-disclosure.mjs` | 117/117 |
| `node scripts/ui-behavior.mjs` | 861/861 |
| `node scripts/ui-modals.mjs` | 155/155 modal states clean |
| `node scripts/ui-smoke-5f.mjs` | 73/73 over 70 rail stops |
| `node scripts/ui-walk.mjs` | 105 stops x 2 widths, no overflow, no console errors |
| `node scripts/ui-offline.mjs` | 44 stops offline, 0 missing, refresh OK |
| `npm run check:docs` | FAILS — pre-existing, see RESULTS §0 |

## 3. Cumulative diff — renderer and harness

The five data files are NOT in this diff: they arrived committed at `4f5f14d`
and this round made no data edit at all. Their content is shown in §4 as the
`fae598e..HEAD` delta, for the record.

```
 scripts/ui-behavior.mjs              | 108 +++++++------
 scripts/ui-disclosure.mjs            | 292 +++++++++++++++++++++++++++++++----
 src/app.css                          | 141 ++++++++++-------
 src/components/ContentAudio.svelte   |  73 ++++-----
 src/components/Paradigm.svelte       | 142 +++++++++--------
 src/components/SelectActivity.svelte |  28 ++--
 6 files changed, 537 insertions(+), 247 deletions(-)
```

```diff
diff --git a/scripts/ui-behavior.mjs b/scripts/ui-behavior.mjs
index edf22fb..64acd38 100644
--- a/scripts/ui-behavior.mjs
+++ b/scripts/ui-behavior.mjs
@@ -2804,48 +2804,42 @@ for (const [chapterId, activityId, opener] of [
 // keep in sync. The chart's own `subtitle` field ("Masculine" / "Feminine" /
 // "Neuter") is what Paradigm.svelte stamps onto data-chart-name, so this
 // asserts against the generic .paradigm host instead of the deleted one.
+// REWRITTEN FOR DISCLOSURE-SPEC2 (amended §4.6). The three gender charts used
+// to be a More/Back sequence on this REVIEW page and most of this block drove
+// that pager. The device review (item 4) revoked pagers on Review pages
+// outright, with a rationale that is not about taste — students may want to
+// PRINT the page, so all of it has to be visible. The chart contract itself
+// (one standard `paradigm` shape, four case rows over two columns, each chart
+// reporting its own data-chart-name, cells that play their own clip) is what
+// this block was really protecting in 5F, and all of it still holds; it is now
+// asserted across the three STACKED charts instead of through a pager.
 {
   await go('#/activity/chapt_8/c8_qr_third');
-  const chart = page.locator('.paradigm');
-  const genders = [];
-  const switchDisabled = dir => page.locator(`[data-paradigm-switch="${dir}"]`).isDisabled();
-  // 5F-PATCH3 addendum: BOTH buttons render on every page — the invalid
-  // direction is greyed out (disabled), never removed.
-  genders.push(await chart.getAttribute('data-chart-name'));
-  check('5F §2.8 the third-person chart opens on Masculine: More live, Back greyed out (both visible)',
-    genders[0] === 'Masculine' && await page.locator('[data-paradigm-switch="more"]').count() === 1
-      && await page.locator('[data-paradigm-switch="back"]').count() === 1
-      && await switchDisabled('back') && !await switchDisabled('more'));
-  await page.locator('[data-paradigm-switch="more"]').click();
-  await page.waitForTimeout(100);
-  genders.push(await chart.getAttribute('data-chart-name'));
-  check('5F §2.8 More steps to Feminine, and Back comes live',
-    genders[1] === 'Feminine' && !await switchDisabled('back'));
-  await page.locator('[data-paradigm-switch="more"]').click();
-  await page.waitForTimeout(100);
-  genders.push(await chart.getAttribute('data-chart-name'));
-  check('5F §2.8 More again steps to Neuter, where More greys out but stays visible',
-    genders[2] === 'Neuter' && await switchDisabled('more') && !await switchDisabled('back'),
-    genders.join(' -> '));
-  await page.locator('[data-paradigm-switch="back"]').click();
-  await page.waitForTimeout(100);
-  check('5F §2.8 Back steps down again', await chart.getAttribute('data-chart-name') === 'Feminine');
+  const charts = page.locator('.card .paradigm');
+  const genders = await charts.evaluateAll(nodes => nodes.map(n => n.getAttribute('data-chart-name')));
+  check('5F §2.8 / §4.6 all three third-person charts are on the page at once, each naming itself',
+    genders.join(' ') === 'Masculine Feminine Neuter', genders.join(' -> ') || 'none');
+  check('5F §4.6 and nothing pages between them',
+    await page.locator('.card [data-paradigm-switch], .card .pg-nav').count() === 0);
   // Four case rows over two columns, on every one of the three charts.
-  check('5F §2.8 four case rows over a Singular and a Plural column',
-    await chart.locator('.pg-row').count() === 4 && await chart.locator('.pg-row').first().locator('.pg-cell').count() === 2,
-    `${await chart.locator('.pg-row').count()} rows`);
+  const shapes = await charts.evaluateAll(nodes => nodes.map(n =>
+    `${n.querySelectorAll('.pg-row').length}x${n.querySelector('.pg-row').querySelectorAll('.pg-cell').length}`));
+  check('5F §2.8 four case rows over a Singular and a Plural column, on each chart',
+    shapes.join(' ') === '4x2 4x2 4x2', shapes.join(' '));
   // Directive 9: a cell whose form has a clip plays it.
   await page.evaluate(() => { window.__clips.length = 0; });
-  await chart.locator('.pg-greek-tap:not([disabled])').first().click();
+  await charts.first().locator('.pg-greek-tap:not([disabled])').first().click();
   await page.waitForTimeout(200);
   check('5F §2.8 a paradigm cell plays its own clip', (await clips()).length === 1);
 
-  // Rule A4, on the cohort's NEW exit. §6.4 covers a topic switch, rail
-  // navigation and a route change; stepping between the charts of a
-  // paradigms[] stack is a fourth way out of a surface that is playing, and
-  // it changes neither the route nor the topic — which is exactly the shape
-  // of the defect 5E-SPEC2 §3.1 reported.
-  await go('#/activity/chapt_8/c8_qr_third');
+  // Rule A4 on a CHART SWITCH. §6.4 covers a topic switch, rail navigation and
+  // a route change; stepping between the charts of a paradigms[] stack is a
+  // fourth way out of a surface that is playing, and it changes neither the
+  // route nor the topic — the shape of the defect 5E-SPEC2 §3.1 reported.
+  // Moved to the LEARN page, which is where a chart switch still exists:
+  // §4.1/§4.2 paging is unchanged there and only Review lost its pager.
+  await go('#/activity/chapt_8/c8_learn_third_person');
+  await gotoTopic(1);
   await page.locator('.card .pg-actions .btn', { hasText: 'Say Whole' }).first().click();
   await page.waitForTimeout(250);
   const playingBefore = await clipsPlaying();
@@ -2874,7 +2868,13 @@ for (const [chapterId, activityId, opener] of [
 for (const [chapterId, chapter] of Object.entries(CH_5F)) {
   for (const activity of activitiesOf(chapter).filter(a => a && a.mode === 'paradigmChart')) {
     const charts = activity.paradigms || (activity.paradigm ? [activity.paradigm] : []);
-    const stacked = charts.length > 1 && charts.every(chart => !chart.name);
+    // AMENDED §4.6 (DISCLOSURE-SPEC2): a Review page stacks EVERY chart it
+    // carries, named or not. The name/no-name distinction that used to decide
+    // this is still real and still decides paging on Learn pages; it has no
+    // authority on a Review page, which must be printable in one scroll. The
+    // paged branch below is therefore reached only by a single-chart page now,
+    // where its loop runs once and steps nothing.
+    const stacked = charts.length > 1;
     const sayWholeCount = () => page.locator('.card .pg-say-whole').count();
     if (stacked) {
       await go(`#/activity/${chapterId}/${activity.id}`);
@@ -3141,7 +3141,11 @@ for (const [chapterId, activityId, expected] of [
   // three or more ways, which is what this block was written to protect.
   const navSurfaces = [
     ['ch8 Learn Third Person Paradigm', '#/activity/chapt_8/c8_learn_third_person', { topic: 1 }],
-    ['ch8 Review Third Person (ContentAudio pager)', '#/activity/chapt_8/c8_qr_third', {}],
+    // 'ch8 Review Third Person (ContentAudio pager)' left this list with
+    // DISCLOSURE-SPEC2: amended §4.6 removed the Review pager entirely, so
+    // there is no .pg-nav on that page to measure. The ContentAudio copy of
+    // this layout went with it — Paradigm.svelte is the only renderer of the
+    // pair now, which is one fewer place for the markup to drift.
     ['ch8 Aὐτός Translation Drill Hint (modal pager)', '#/activity/chapt_8/c8_drill_translation_autos', { hint: true }]
   ];
   for (const [label, hash, opts] of navSurfaces) {
@@ -3618,10 +3622,19 @@ for (const [chapterId, activityId, expected] of [
       open: expander.open
     }));
   }));
-  check('5G-SPEC2 stem variations: five collapsed Examples accordions, one under each numbered variation',
+  // The LABEL half of this changed with DISCLOSURE-SPEC2: amended §3.5 inverts
+  // the bare-"Examples" rule, so each of these five now carries the variation's
+  // own qualifier ("Palatal Examples"). What the check is really for — one
+  // accordion per numbered item, collapsed, none drifting into a detached group
+  // at the end of the topic — is untouched, so the label test becomes the
+  // qualified pattern rather than the exact string. The 27 relabelled titles
+  // are asserted as a set in ui-disclosure.mjs D15.
+  const STEM_QUALIFIERS = ['Palatal', 'Labial', 'Dental', 'Liquid', 'Sibilant'];
+  check('5G-SPEC2 / §3.5 stem variations: five collapsed qualified-Examples accordions, one under each numbered variation',
     await stemItems.count() === 5
       && placement.length === 5
-      && placement.every(entries => entries.length === 1 && entries[0].label === 'Examples' && !entries[0].open)
+      && placement.every((entries, index) => entries.length === 1 && !entries[0].open
+        && entries[0].label === `${STEM_QUALIFIERS[index]} Examples`)
       && await page.locator('.card details.rc-expander').count() === 5
       && await page.locator('.rc-list .popup-link').count() === 0,
     JSON.stringify(placement));
@@ -4028,14 +4041,19 @@ for (const [chapterId, activityId] of [
       && await page.locator('.pg-nav, [data-paradigm-switch], [data-hint-paradigm-toggle]').count() === 0,
     `${await page.locator('.paradigm').count()} charts, ${await page.locator('.pg-nav').count()} pagers, ${await page.locator('[data-paradigm-switch]').count()} toggles`);
 }
-// Chapter 8's three-chart stack is NAMED and stays a More/Back sequence: the
-// naming rule is what tells the two apart, so this is what proves the
-// device-verified pager did not become a stack.
+// REVERSED BY DISCLOSURE-SPEC2 (amended §4.6). This asserted the exact
+// opposite: that chapter 8's NAMED three-chart stack stayed a More/Back
+// sequence, the naming rule being what told a paged stack from a stacked pair.
+// The device review (item 4) revoked pagers on Review pages with a rationale
+// the naming rule cannot outrank — a Review page must be printable, so all of
+// it has to be visible at once. The naming rule still decides paging on LEARN
+// pages, and the line below is what proves this page converted rather than
+// half-converted: three charts stacked, and no pager left anywhere on it.
 await go('#/activity/chapt_8/c8_qr_third');
-check('5G G8 ch8 third person stays a More/Back sequence (its charts are named)',
-  await page.locator('.paradigm-stack').count() === 0
-    && await page.locator('.paradigm').count() === 1
-    && await page.locator('[data-paradigm-switch="more"]').count() === 1);
+check('5G G8 / §4.6 ch8 third person is a STACK on its Review page, with no pager',
+  await page.locator('.paradigm-stack').count() === 1
+    && await page.locator('.paradigm-stack .paradigm').count() === 3
+    && await page.locator('.pg-nav, [data-paradigm-switch]').count() === 0);
 
 // ---- G9 Repeat is retired; retry-until-right remains (5G-SPEC2 §2/§5) ----
 for (const [chapterId, activityId] of [
diff --git a/scripts/ui-disclosure.mjs b/scripts/ui-disclosure.mjs
index 3491a9c..7cb3d17 100644
--- a/scripts/ui-disclosure.mjs
+++ b/scripts/ui-disclosure.mjs
@@ -33,6 +33,10 @@ const check = (name, ok, detail = '') => {
 
 const GREEN = 'rgb(31, 95, 87)';     // --teal-dark / --accent-ink #1f5f57
 const BLUE = 'rgb(22, 99, 199)';     // --link #1663c7
+// The amended §3.1 accordion box: 1px #ddd6c2, filled one step lighter than the
+// #fdf9e7 card it sits on.
+const BOX_BORDER = '1px/solid/rgb(221, 214, 194)';
+const BOX_FILL = 'rgb(255, 253, 243)';
 
 const DATA = 'src/data';
 const chapterFiles = readdirSync(DATA).filter(name => /^chapt-\d+\.json$/.test(name)).sort();
@@ -144,6 +148,9 @@ const shot = async name => {
   const wrongColour = [];
   const underlined = [];
   const markupLeak = [];
+  const unboxed = [];
+  const indented = [];
+  const padding = new Set();
   let seen = 0;
   for (const [chapterId, chapter] of chapters) {
     for (const activity of activitiesOf(chapter)) {
@@ -155,12 +162,22 @@ const shot = async name => {
         const found = await page.locator('details.rc-expander').evaluateAll(nodes => nodes.map(node => {
           const summary = node.querySelector('summary');
           const style = summary ? getComputedStyle(summary) : null;
+          const box = getComputedStyle(node);
+          const body = node.querySelector('.rc-expander-body');
           return {
             label: (summary ? summary.textContent : '').trim(),
             open: node.open,
             color: style ? style.color : '',
             decoration: style ? style.textDecorationLine : '',
-            hasU: !!(summary && summary.querySelector('u'))
+            hasU: !!(summary && summary.querySelector('u')),
+            // AMENDED §3.1: the box, and the absence of a second indent inside it.
+            border: `${box.borderTopWidth}/${box.borderTopStyle}/${box.borderTopColor}`,
+            background: box.backgroundColor,
+            summaryPad: style ? `${style.paddingTop}/${style.paddingLeft}` : '',
+            bodyIndent: body
+              ? Math.round(parseFloat(getComputedStyle(body).paddingLeft)
+                - parseFloat(style ? style.paddingLeft : '0'))
+              : 0
           };
         }));
         for (const entry of found) {
@@ -170,6 +187,11 @@ const shot = async name => {
           if (entry.color !== GREEN) wrongColour.push(`${where} ${entry.color}`);
           if (entry.decoration !== 'none' || entry.hasU) underlined.push(where);
           if (entry.label.includes('[[')) markupLeak.push(where);
+          if (entry.border !== BOX_BORDER || entry.background !== BOX_FILL) {
+            unboxed.push(`${where} ${entry.border} on ${entry.background}`);
+          }
+          if (entry.bodyIndent > 1) indented.push(`${where} +${entry.bodyIndent}px`);
+          padding.add(entry.summaryPad);
         }
       }
     }
@@ -179,6 +201,21 @@ const shot = async name => {
   check(`D2.3 R2 no accordion summary is underlined`, underlined.length === 0, underlined.join(', '));
   check(`D2.4 R2 no accordion label prints inline markup`, markupLeak.length === 0, markupLeak.join(', '));
   check(`D2.5 R2 the sweep actually found accordions to judge`, seen >= 20, `${seen} seen`);
+  // NEW IN DISCLOSURE-SPEC2 (amended §3.1). SPEC1 shipped these borderless; the
+  // device review (item 1) rejected that and named the approved variation: a
+  // box, one step lighter than the card, with the title in green.
+  check(`D2.6 §3.1 all ${seen} accordions are a BOX: 1px #ddd6c2 on #fffdf3`,
+    unboxed.length === 0, unboxed.slice(0, 6).join(', '));
+  // Item 1(d)/(e): the body was hanging past the caret, which put a second
+  // indent inside a box that already insets its text. The box determines
+  // placement now, so the body starts level with the summary.
+  check(`D2.7 §3.1 no accordion body is indented past its summary`,
+    indented.length === 0, indented.slice(0, 6).join(', '));
+  // Item 1(b) flagged ch1 Six Points' padding as inflated relative to the rest.
+  // Every accordion in the app resolving to ONE padding value is what makes
+  // that impossible to reintroduce, whatever the host.
+  check(`D2.8 §3.1 every accordion has the SAME minimal summary padding`,
+    padding.size === 1, [...padding].join(' | '));
 }
 
 // ===========================================================================
@@ -430,44 +467,46 @@ const shot = async name => {
 }
 
 // ===========================================================================
-// D8. R3/§4.3 — the control row never scrolls out of view
+// D8. §4.3 AS AMENDED 2026-08-17 — PINNING IS MODALS ONLY
 // ---------------------------------------------------------------------------
-// Measured, not asserted from a class name: the row's box has to be inside the
-// viewport with the surface scrolled to its very bottom AND at its very top.
-// "Sticky" that only holds at one end is the bug this rule was written from.
+// REWRITTEN FOR DISCLOSURE-SPEC2. D8.1 used to assert the opposite of what it
+// asserts now: that on a taller-than-viewport LEARN page the control row stayed
+// on screen at both ends of the scroll. The device review revoked main-content
+// pinning outright ("my comment about pinning the nav items applies ONLY to nav
+// items in modals"), so the check is inverted rather than deleted — a row that
+// sticks again is a regression, and nothing else would catch it.
 {
-  // A SHORT viewport, deliberately: the rule only says anything where the chart
-  // is taller than the screen, and at 390x780 chapter 8's chart fits. 390x480
-  // is an iPhone SE in landscape, which is a real device state and is the
-  // shortest portrait-ish box the app supports.
+  // Same short viewport the old assertion used, for the same reason: the rule
+  // only says anything where the chart is taller than the screen.
   await page.setViewportSize({ width: 390, height: 480 });
   await go('#/activity/chapt_8/c8_learn_third_person');
   await gotoTopic(1);
-  const rowVisible = async () => page.locator('.paradigm .pg-controls').first().evaluate(node => {
-    const box = node.getBoundingClientRect();
-    const port = document.querySelector('.scroll-area').getBoundingClientRect();
-    return box.top >= port.top - 1 && box.bottom <= port.bottom + 1;
-  });
   // The app scrolls .scroll-area, not the document (.app is a fixed-height flex
-  // column between the two bars), so that is the box the row has to hold inside
-  // and that is what gets scrolled here.
+  // column between the two bars).
   const scrollTo = where => page.locator('.scroll-area').evaluate((node, to) => {
     node.scrollTop = to === 'end' ? node.scrollHeight : 0;
   }, where);
-  await scrollTo('top');
-  await page.waitForTimeout(120);
-  const atTop = await rowVisible();
   const tallEnough = await page.locator('.scroll-area')
     .evaluate(node => node.scrollHeight > node.clientHeight + 40);
+  await scrollTo('top');
+  await page.waitForTimeout(120);
+  const navTopAtStart = await page.locator('.paradigm .pg-nav').first()
+    .evaluate(node => node.getBoundingClientRect().top);
   await scrollTo('end');
   await page.waitForTimeout(150);
-  const atBottom = await rowVisible();
-  check('D8.1 §4.3 ch8 Third Person: the control row is on screen at BOTH ends of a taller-than-viewport page',
-    tallEnough && atTop && atBottom, `tall ${tallEnough}, top ${atTop}, bottom ${atBottom}`);
-  await shot('ch8-third-person-pinned-row');
+  const navTopAtEnd = await page.locator('.paradigm .pg-nav').first()
+    .evaluate(node => node.getBoundingClientRect().top);
+  const scrolled = await page.locator('.scroll-area').evaluate(node => node.scrollTop);
+  check('D8.1 §4.3 ch8 Third Person LEARN page: the control row SCROLLS with its chart (main-content pinning revoked)',
+    tallEnough && scrolled > 40 && Math.abs((navTopAtStart - navTopAtEnd) - scrolled) <= 2,
+    `moved ${Math.round(navTopAtStart - navTopAtEnd)}px against ${Math.round(scrolled)}px of scroll`);
+  check('D8.1b §4.3 nothing anywhere in main content computes to position: sticky',
+    await page.locator('.scroll-area .pg-controls, .scroll-area .pg-nav, .scroll-area .pg-actions')
+      .evaluateAll(nodes => nodes.every(n => getComputedStyle(n).position !== 'sticky')));
+  await shot('ch8-third-person-learn-unpinned');
   await page.setViewportSize({ width: 390, height: 780 });
 
-  // In a modal the row is a flex footer OUTSIDE the scroller — the same shape
+  // In a MODAL the row is a flex footer OUTSIDE the scroller — the same shape
   // .modal-actions uses, and for the same reason (a sticky footer hangs wrong
   // at rest). Proven by scrolling the modal body to its end and finding the row
   // unmoved, with the dialog's own Close still beneath it.
@@ -478,12 +517,140 @@ const shot = async name => {
   await page.waitForTimeout(150);
   const after = await page.locator('.modal .pg-controls').boundingBox();
   const closeBox = await page.locator('.modal .modal-actions .btn').last().boundingBox();
-  check('D8.2 §4.3 ch3 drill Hint: the control row does not move when the chart scrolls, and Close is below it',
+  check('D8.2 §4.3 ch3 drill Hint: the pinned line does not move when the chart scrolls, and Close is below it',
     before && after && Math.abs(before.y - after.y) <= 1 && closeBox.y >= after.y + after.height - 1,
     `y ${before && Math.round(before.y)} -> ${after && Math.round(after.y)}`);
-  check('D8.3 §4.3 the pinned row is OUTSIDE the scroller (nothing in .pg-body)',
+  check('D8.3 §4.3 the pinned line is OUTSIDE the scroller (nothing in .pg-body)',
     await page.locator('.modal .pg-body .pg-controls').count() === 0);
-  await shot('ch3-hint-pinned-controls');
+  await shot('ch3-hint-pinned-line');
+}
+
+// ===========================================================================
+// D13. §4.3 — THE MODAL FOOTER COMPOSITION, EVERY MODAL IN THE APP
+// ---------------------------------------------------------------------------
+// New in DISCLOSURE-SPEC2. The device review found FIVE different compositions
+// across the chapters (item 2, panes a-e), so this walks every modal the app
+// can open and measures the one composition against all of them at once:
+//
+//   at most ONE pinned line of navigation, and only in a modal;
+//   a say button is pinned only when a nav control shares its line;
+//   exactly ONE divider, between the scrolling content and the pinned block;
+//   NO divider between the nav line and Close;
+//   neither the content nor the buttons butt against the divider.
+//
+// A "divider" is read as a computed border-top or box-shadow, because the two
+// are interchangeable to the eye and a fix that swapped one for the other would
+// otherwise pass.
+{
+  const MODALS = [
+    ['ch3 Parsing Drill hint (2-state: say + Endings)', '#/activity/chapt_3/c3_drill_parsing', 'hint', 'toggle'],
+    ['ch4 Greek Noun hint (2-chart: say + More)', '#/activity/chapt_4/c4_drill_greek_noun', 'hint', 'toggle'],
+    ['ch5 Declining Noun hint (single chart, NO nav)', '#/activity/chapt_5/c5_drill_declining', 'hint', 'none'],
+    ['ch5 Article Drill hint (2-chart named)', '#/activity/chapt_5/c5_drill_article', 'hint', 'toggle'],
+    ['ch7 Adjective Case Drill hint (2-chart named)', '#/activity/chapt_7/c7_drill_case', 'hint', 'toggle'],
+    ['ch8 Personal Pronoun Case hint (3 charts)', '#/activity/chapt_8/c8_drill_case', 'hint', 'pair'],
+    ['ch8 Autos Translation hint (4 pages)', '#/activity/chapt_8/c8_drill_translation_autos', 'hint', 'pair'],
+    ['ch9 Parsing hint (composite, 2 states)', '#/activity/chapt_9/c9_drill_parsing', 'hint', 'toggle'],
+    ['ch2 Syllable Division hint (prose, no nav)', '#/activity/chapt_2/c2_ex_syllable_division', 'hint', 'none'],
+    ['ch3 Learn Verbs Endings modal (no nav)', '#/activity/chapt_3/c3_learn_verbs', 'endings', 'none'],
+    ['ch6 preposition popup (no nav)', '#/activity/chapt_6/c6_learn_prepositions', 'popup', 'none']
+  ];
+  const readFooter = () => page.locator('.modal').last().evaluate(modal => {
+    const divider = el => {
+      if (!el) return false;
+      const s = getComputedStyle(el);
+      return parseFloat(s.borderTopWidth) > 0 || (s.boxShadow && s.boxShadow !== 'none');
+    };
+    const actions = modal.querySelector('.modal-actions');
+    // Every element between the scroller and Close that holds a control.
+    const pinnedLines = [...modal.querySelectorAll(
+      ':scope > .paradigm > .pg-controls, :scope > .pg-controls, .modal-actions > .pg-nav, .modal-actions > [data-hint-paradigm-controls], .modal-actions > [data-hint-page-controls]')];
+    const scroller = modal.querySelector('.modal-scroll, .pg-body');
+    const close = [...modal.querySelectorAll('.modal-actions .btn')].pop();
+    return {
+      pinnedLines: pinnedLines.length,
+      // A say button counts as pinned only if it is inside a pinned line.
+      pinnedSays: pinnedLines.reduce((n, line) =>
+        n + line.querySelectorAll('.pg-say-whole, [data-hint-paradigm-say]').length, 0),
+      pinnedNavs: pinnedLines.reduce((n, line) =>
+        n + line.querySelectorAll('.pg-switch, .hint-paradigm-toggle, [data-hint-page-nav]').length, 0),
+      dividers: [...modal.querySelectorAll('.pg-controls, .modal-actions')].filter(divider).length,
+      // The nav line and Close must not be separated by one.
+      dividerBetweenNavAndClose: pinnedLines.length > 0
+        && pinnedLines.some(line => line.parentElement !== actions) && divider(actions),
+      // Nothing touches the divider: measured as real vertical space between
+      // the scroller's content edge and the first pinned/footer box.
+      gapAboveDivider: scroller ? Math.round(parseFloat(getComputedStyle(scroller).paddingBottom)
+        || parseFloat(getComputedStyle(scroller.parentElement).paddingBottom) || 0) : 0,
+      gapBelowDivider: Math.round(parseFloat(getComputedStyle(
+        pinnedLines.find(l => l.parentElement !== actions) || actions).paddingTop) || 0),
+      closeIsLast: !!close && /close|cancel/i.test(close.textContent)
+    };
+  });
+  for (const [label, hash, how, expect] of MODALS) {
+    await go(hash);
+    if (how === 'hint') {
+      await page.getByRole('button', { name: 'Hint', exact: true }).click();
+    } else if (how === 'endings') {
+      await gotoTopic(2);
+      await page.locator('.pg-endings-open').first().click();
+    } else {
+      await gotoTopic(1);
+      await page.locator('.rc-sense-link').first().click();
+    }
+    await page.waitForSelector('.modal', { timeout: 8000 });
+    await page.waitForTimeout(200);
+    const f = await readFooter();
+    check(`D13 ${label}: at most ONE pinned line, and it is ${expect === 'none' ? 'absent' : 'present'}`,
+      f.pinnedLines <= 1 && (expect === 'none' ? f.pinnedLines === 0 : f.pinnedLines === 1),
+      JSON.stringify(f));
+    check(`D13 ${label}: a say button is pinned only beside a nav control`,
+      expect === 'toggle' ? f.pinnedNavs >= 1 : f.pinnedSays === 0,
+      `${f.pinnedSays} pinned says, ${f.pinnedNavs} pinned navs`);
+    check(`D13 ${label}: exactly ONE divider, and none between the nav line and Close`,
+      f.dividers === 1 && !f.dividerBetweenNavAndClose,
+      `${f.dividers} dividers, between-nav-and-close ${f.dividerBetweenNavAndClose}`);
+    check(`D13 ${label}: padding above and below the divider (nothing butts against it)`,
+      f.gapAboveDivider >= 6 && f.gapBelowDivider >= 6,
+      `above ${f.gapAboveDivider}px, below ${f.gapBelowDivider}px`);
+    check(`D13 ${label}: Close is the last control in the footer`, f.closeIsLast);
+  }
+}
+
+// ===========================================================================
+// D14. §4.6 as AMENDED — NO PAGER ON ANY REVIEW PAGE, APP-WIDE
+// ---------------------------------------------------------------------------
+// The rationale the amendment adds is that a Review page must be PRINTABLE, so
+// this is a total sweep rather than a spot check: every quickReview activity in
+// all ten chapters, asserting the absence of pagination and the presence of one
+// say-all per chart that carries one.
+{
+  const offenders = [];
+  const sayCounts = [];
+  for (const [chapterId, chapter] of chapters) {
+    for (const activity of chapter.quickReview || []) {
+      if (!activity || !activity.id) continue;
+      await go(`#/activity/${chapterId}/${activity.id}`);
+      const pagers = await page.locator('.card .pg-switch, .card .pg-nav').count();
+      if (pagers) offenders.push(`${chapterId}/${activity.id} (${pagers})`);
+      const charts = activity.paradigms || (activity.paradigm ? [activity.paradigm] : []);
+      if (charts.length > 1) {
+        const wants = charts.filter(c => c.sayWhole || activity.sayWhole).length;
+        const got = await page.locator('.card .pg-say-whole').count();
+        const grids = await page.locator('.card .paradigm .pg-grid').count();
+        sayCounts.push(`${activity.id} ${grids} charts/${got} says (want ${charts.length}/${wants})`);
+        if (got !== wants || grids !== charts.length) {
+          offenders.push(`${chapterId}/${activity.id} stacked ${grids}/${charts.length}, says ${got}/${wants}`);
+        }
+      }
+    }
+  }
+  check('D14.1 §4.6 zero pagers on every Review page in chapters 1-10',
+    offenders.length === 0, offenders.join('; '));
+  check('D14.2 §4.6 every multi-chart Review page stacks all its charts, one say-all each',
+    sayCounts.length >= 4, sayCounts.join('; '));
+  await go('#/activity/chapt_8/c8_qr_third');
+  await shot('ch8-qr-third-stacked');
 }
 
 // ===========================================================================
@@ -717,6 +884,77 @@ if (SHOTS) {
   await shot('ch9-vocab-pool-390px-two-up');
 }
 
+// ===========================================================================
+// D15. §3.5 as AMENDED — QUALIFIED "Examples" TITLES
+// ---------------------------------------------------------------------------
+// New in DISCLOSURE-SPEC2. The amendment INVERTS the bare-"Examples" rule: a
+// C2 accordion takes "<Qualifier> Examples" wherever a one-or-two-word
+// qualifier exists, the chapter-3 pattern, even when the qualifier repeats the
+// term visible in the rule above it. The 27 relabelled accordions are read off
+// the shipped data and then matched against the screen, so the check cannot
+// pass by agreeing with itself.
+{
+  const expected = [];
+  for (const [chapterId, chapter] of chapters) {
+    for (const activity of activitiesOf(chapter)) {
+      if (!activity || !activity.id) continue;
+      (function scan(node) {
+        if (Array.isArray(node)) return node.forEach(scan);
+        if (!node || typeof node !== 'object') return;
+        if (node.type === 'expander' && /Examples$/.test(node.label || '')) {
+          expected.push({ chapterId, id: activity.id, label: node.label });
+        }
+        for (const value of Object.values(node)) scan(value);
+      })(activity);
+    }
+  }
+  const bare = expected.filter(e => e.label === 'Examples');
+  check('D15.1 §3.5 no bare "Examples" label survives in the shipped data',
+    bare.length === 0, bare.map(b => `${b.chapterId}/${b.id}`).join(', '));
+  // ...and every qualified label actually reaches the screen as plain text.
+  const byActivity = new Map();
+  for (const e of expected) {
+    const key = `${e.chapterId}/${e.id}`;
+    byActivity.set(key, [...(byActivity.get(key) || []), e.label]);
+  }
+  const missing = [];
+  for (const [key, labels] of byActivity) {
+    const [chapterId, id] = key.split('/');
+    await go(`#/activity/${chapterId}/${id}`);
+    const chapter = chapters.get(chapterId);
+    const activity = activitiesOf(chapter).find(a => a && a.id === id);
+    const topics = (activity.topics || []).length || 1;
+    const seen = new Set();
+    for (let topic = 0; topic < topics; topic++) {
+      if (topic) await gotoTopic(1);
+      for (const text of await page.locator('details.rc-expander summary').allInnerTexts()) {
+        seen.add(text.replace(/\s+/g, ' ').trim());
+      }
+    }
+    for (const label of labels) if (!seen.has(label)) missing.push(`${key} "${label}"`);
+  }
+  check(`D15.2 §3.5 all ${expected.length} qualified "Examples" labels render as authored`,
+    missing.length === 0, missing.join(', '));
+  // §3.5's Greek clause: a Greek word inside an accordion TITLE is a control
+  // label like an option button, NOT an audio tap. It must not be blue and must
+  // not carry a handler — the whole point of stating it was that ch7's three
+  // titles now contain Greek.
+  await go('#/activity/chapt_7/c7_learn_eimi');
+  await gotoTopic(3);
+  const greekTitles = await page.locator('details.rc-expander summary').evaluateAll(nodes =>
+    nodes.map(n => ({
+      text: n.textContent.trim(),
+      color: getComputedStyle(n).color,
+      taps: n.querySelectorAll('button, .greek-tap').length
+    })));
+  check('D15.3 §3.5 the ch7 Greek-qualified titles are control labels: green, no tap target inside',
+    greekTitles.length === 3
+      && greekTitles.every(t => t.color === GREEN && t.taps === 0)
+      && greekTitles.map(t => t.text).join('|') === 'οὐ Examples|οὐκ Examples|οὐχ Examples',
+    JSON.stringify(greekTitles));
+  await shot('ch7-greek-qualified-labels');
+}
+
 // ===========================================================================
 await browser.close();
 const failed = results.filter(r => !r.ok);
diff --git a/src/app.css b/src/app.css
index 2091254..672c644 100644
--- a/src/app.css
+++ b/src/app.css
@@ -386,12 +386,20 @@ button { font: inherit; cursor: pointer; }
 .modal-note { margin: 0; font-size: 0.9rem; color: var(--teal-dark); font-weight: 600; }
 /* The pinned footer. flex: 0 0 auto keeps it out of the scroll entirely, so
    the escape from a dialog is on screen from the moment it opens and stays
-   there while the content moves behind it. The soft top edge separates it
-   from content scrolling underneath. */
+   there while the content moves behind it.
+   THE ONE DIVIDER (amended §4.3, DISCLOSURE-SPEC2 W3.2). It is a thin 1px line
+   rather than the soft box-shadow gradient it used to be: the amended rule
+   asks for a divider with a strip of light padding above AND below it, and a
+   12px shadow fading into the content is neither crisply one nor clearly
+   padded. margin-top is the padding above the line, padding-top the padding
+   below it, so neither the scrolling content nor the buttons ever touch it
+   (review item 2, panes a and c). Every modal in the app shares this footer,
+   which is the point: the review found five different compositions across the
+   chapters, and there is one here. */
 .modal-actions { flex: 0 0 auto;
   display: flex; flex-direction: column; gap: 8px;
-  margin-top: 16px; padding-top: 12px; background: var(--card);
-  box-shadow: 0 -10px 12px -12px rgba(0, 0, 0, 0.35); }
+  margin-top: 12px; padding-top: 10px; background: var(--card);
+  border-top: 1px solid rgba(0, 0, 0, 0.10); }
 .modal-actions .btn { width: 100%; min-height: 44px; }
 /* 5G-SPEC3: a two-state Hint keeps Say Paradigm and its target-labelled
    disclosure control together in the pinned footer. The toggle is always the
@@ -661,26 +669,32 @@ button { font: inherit; cursor: pointer; }
 .rc-greekword.greek-say { width: auto; color: var(--link); }
 .rc-greekgloss { color: var(--teal-dark); overflow-wrap: anywhere; }
 .rc-syllables { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 12px; }
-/* R2 / DISCLOSURE-RULES §3.1 — THE ONE ACCORDION LOOK, every category, every
-   chapter, no exceptions: green (#1f5f57) summary text, caret to the LEFT in
-   the same green, NEVER underlined, and always collapsed by default. The ch2
-   "6 Accent Rules" screen is the in-app model.
-   What went: the card frame (border, radius, cream fill) and the ink summary.
-   The frame was a per-expander box, and a C2 rule list draws one accordion
-   under EVERY numbered item — six boxed cards stacked down a page read as six
-   separate things rather than as six disclosures of one list. Without the
-   frame the summary is a line of the page that opens, which is what the rule
-   describes.
-   The former summaryStyle:"green" special case is GONE as a distinction: it is
-   now simply what every summary does. The key is still harmless in data (see
-   RichContent's expander branch, which no longer reads it).
+/* DISCLOSURE-RULES §3.1 as AMENDED 2026-08-17 — THE ONE ACCORDION LOOK, every
+   category, every chapter, no exceptions but Meanings: a BOX (1px #ddd6c2,
+   rounded, filled one visible step lighter than the card it sits on) with the
+   title in green (#1f5f57), the caret to its left in the same green, NEVER
+   underlined, ALWAYS collapsed by default.
+   THIS SUPERSEDES THE BORDERLESS RENDER DISCLOSURE-SPEC1 SHIPPED. SPEC1 read
+   §3.1 as green-text-and-caret and dropped the frame, reasoning that six boxed
+   cards down a C2 rule list would read as six separate things. The device pass
+   (Disclosure_Spike_Review.pdf item 1) rejected that outright: the approved
+   variation from the 2026-08-14 accordion experiments is the BOXED one, and
+   what the amendment adds to it is only the green title. Pane (f) of that item
+   is the target and the boxes in the "6 Accent Rules" panes are it on a real
+   rule list — so the box is what distinguishes a disclosure from the prose
+   around it, and the green title is what marks it as tappable.
+   PADDING IS MINIMAL and deliberately smaller than the pre-SPEC1 11px/13px,
+   which the same review called out as inflated (item 1(b)).
    NOT underlined is load-bearing, not a leftover: R1 gives in-text links the
    same green WITH an underline, and the underline is the whole difference
-   between "opens a modal" and "opens in place". The single exception is
-   Meanings (§3.9, .pg-meanings-toggle below), which is a chart affordance
-   rather than page content. */
-.rc-expander { margin: 8px 0; }
-.rc-expander summary { padding: 4px 0; color: var(--teal-dark); font-weight: 600;
+   between "opens a modal" and "opens in place". The single exception to all of
+   this is Meanings (rule 9, .pg-meanings-toggle below), a chart affordance
+   rather than page content, which this round does not touch.
+   The former summaryStyle:"green" special case remains gone as a distinction:
+   it is simply what every summary does. */
+.rc-expander { margin: 8px 0; border: 1px solid #ddd6c2; border-radius: 10px;
+  background: #fffdf3; }
+.rc-expander summary { padding: 7px 10px; color: var(--teal-dark); font-weight: 600;
   cursor: pointer; text-decoration: none; }
 /* Two marker pseudo-elements, because two engines. ::marker is the standard one
    (Chrome, Firefox, Safari 16+); ::-webkit-details-marker is what older iOS
@@ -688,10 +702,14 @@ button { font: inherit; cursor: pointer; }
    caret ink on half the devices this app is used on. */
 .rc-expander summary::marker { color: var(--teal-dark); }
 .rc-expander summary::-webkit-details-marker { color: var(--teal-dark); }
-/* The body hangs under the summary TEXT, past the caret, so a disclosure reads
-   as belonging to the line that opened it. 1.15em is the disclosure triangle
-   plus its gap at the summary's own font size. */
-.rc-expander-body { padding: 2px 0 10px 1.15em; }
+/* NO SECOND INDENT INSIDE THE BOX (amended §3.1). The body used to hang at
+   1.15em, past the caret, so a disclosure read as belonging to the line that
+   opened it. With a box around it that reasoning no longer holds and the
+   result is a double indent — the box insets the text once and the padding
+   inset it again, which is what item 1(d)/(e) flagged as displaying badly.
+   The BOX determines text placement now: the body starts at the box's own
+   padding edge, aligned under the summary's own left inset. */
+.rc-expander-body { padding: 0 10px 8px; }
 
 .pending-verification { border: 1px dashed #a66a18; border-radius: 8px; background: #fff6df;
   color: #70460d; padding: 12px; text-align: center; font-weight: 600; }
@@ -982,34 +1000,32 @@ button { font: inherit; cursor: pointer; }
 .pg-legend-text { min-width: 0; overflow-wrap: break-word; }
 .pg-closing { margin-top: 10px; font-size: 0.85rem; line-height: 1.4; }
 .pg-note { margin-top: 8px; color: var(--ink); font-size: 0.88rem; line-height: 1.4; }
-/* ---- R3 / DISCLOSURE-RULES §4.3: THE CONTROL ROW IS PINNED ----
-   The say-all button plus its navigation control (the §4.1 toggle or the §4.2
-   Back/More pair) is a NAVIGATION SURFACE. It must be on screen from the moment
-   a chart is disclosed and must never scroll out of view while the learner is
-   reading a chart taller than the viewport (chapter 8's Third Person Paradigm
-   is the tall case).
-   TWO HOSTS, TWO MECHANISMS, one rule:
-     modal  .pg-modal-host makes the chart a flex COLUMN inside the dialog, so
-            .pg-body is the scroller and .pg-controls sits outside it entirely
-            — the same shape .modal / .modal-scroll / .modal-actions already
-            uses, and for the same reason (a sticky footer inside a scroller
-            hangs wrong at rest; a flex footer has no such state).
-     main   position: sticky, which holds the row at the bottom of the app's
-            scroller while the chart it belongs to is on screen and releases it
-            once the chart is past. The offset is ZERO, not --chrome-bottom:
-            .scroll-area is a flex sibling of the tab bar inside .app, so its
-            own bottom edge already sits above the bar and subtracting the
-            bar's height again would float the row a tab bar clear of the
-            content. (--chrome-bottom is for .modal-overlay, which is
-            position: fixed against the visual viewport and therefore does have
-            to subtract it. Two different containing blocks, two different
-            answers — worth saying because taking the modal's number here is
-            the obvious wrong move.)
-   Only a row that actually carries navigation is pinned (.pg-pinned-controls,
-   set by the component): a Quick Review page's per-chart say-all is an audio
-   button, not pagination (§4.6), and pinning two stacked charts' say-alls would
-   put two competing bars over each other. */
-.pg-controls { background: var(--card); }
+/* ---- DISCLOSURE-RULES §4.3 as AMENDED 2026-08-17: PINNING IS MODALS ONLY ----
+   MAIN-CONTENT PINNING IS REVOKED. DISCLOSURE-SPEC1 pinned Learn-page control
+   rows with `position: sticky`, reading §4.3's "sticky at the panel bottom in
+   main content" literally. The device review revoked it outright — "my comment
+   about pinning the nav items applies ONLY to nav items in modals" — and named
+   the visible cost: a dark divider drawn across the ch4 Masculine Declension
+   page between Meanings and the say-all row (review item 2(a)). The sticky rule
+   and its divider are DELETED rather than narrowed, so there is no
+   main-content pinning left to configure. A Learn page's control row scrolls
+   with its chart like the rest of the chart.
+   IN A MODAL the composition is fixed, top to bottom (review pane f):
+     the scrolling content
+     a thin strip of light padding      <- .pg-body's own padding-bottom
+     ONE divider                        <- .pg-controls' border-top
+     a thin strip of light padding      <- .pg-controls' padding-top
+     AT MOST ONE pinned line of navigation
+     Close
+   Neither the content nor the buttons ever butt against the divider (panes a
+   and c are the butting to avoid), and NO divider ever separates the nav line
+   from Close (panes b and e are that mistake) — which is why .modal-actions
+   drops its own divider whenever a pinned line precedes it, immediately below.
+   .pg-modal-host makes the chart a flex COLUMN inside the dialog, so .pg-body
+   is the scroller and .pg-controls sits outside it entirely — the same shape
+   .modal / .modal-scroll / .modal-actions already uses, and for the same reason
+   (a sticky footer inside a scroller hangs wrong at rest; a flex footer has no
+   such state). */
 .paradigm.pg-modal-host { display: flex; flex-direction: column; min-height: 0;
   flex: 1 1 auto; }
 /* {#key chart} wraps the body and the controls in a keyed block, which renders
@@ -1017,11 +1033,18 @@ button { font: inherit; cursor: pointer; }
    two children directly and no extra wrapper rule is needed. */
 .pg-modal-host .pg-body { flex: 1 1 auto; min-height: 0; overflow-y: auto;
   -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }
-.pg-modal-host .pg-controls { flex: 0 0 auto; padding-top: 4px;
-  box-shadow: 0 -10px 12px -12px rgba(0, 0, 0, 0.35); }
-.paradigm.pg-pinned-controls:not(.pg-modal-host) .pg-controls {
-  position: sticky; bottom: 0; z-index: 2;
-  padding-bottom: 6px; box-shadow: 0 -10px 12px -12px rgba(0, 0, 0, 0.35); }
+/* The padding ABOVE the divider has to come from the scroller, not from the
+   footer: it is the gap the content stops short at when scrolled to the end. */
+.pg-modal-host .pg-body { padding-bottom: 10px; }
+.pg-modal-host .pg-controls { flex: 0 0 auto; background: var(--card);
+  border-top: 1px solid rgba(0, 0, 0, 0.10); padding-top: 10px; }
+/* NO SECOND DIVIDER, and no gap that reads like one. When the paradigm pins a
+   nav line, .modal-actions follows it directly and its own top divider would be
+   the second of two — the exact composition panes (b) and (e) were marked wrong
+   for. The 8px is .modal-actions' own flex gap, so Close sits the same distance
+   below the nav line as it would below any sibling button. */
+.paradigm.pg-pins-nav + .modal-actions { margin-top: 8px; padding-top: 0;
+  border-top: none; box-shadow: none; }
 /* The original keeps Say Whole Paradigm / Endings INSIDE the chart frame. */
 .pg-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 12px; }
 .pg-actions.pg-actions-each { display: grid;
diff --git a/src/components/ContentAudio.svelte b/src/components/ContentAudio.svelte
index 201ea93..4c8c4fd 100644
--- a/src/components/ContentAudio.svelte
+++ b/src/components/ContentAudio.svelte
@@ -100,28 +100,27 @@
     ? getGreekTapMap(chapter.id)
     : activity.greekTaps;
 
-  // paradigmChart: one chart, or a More/Back stack of them (5F §2.8). Same
-  // exit rule as a topic switch — stepping between charts stops whatever the
-  // last one started (rule A4).
-  let paradigmIndex = 0;
+  // paradigmChart: a Quick Review page's chart, or several of them. This mode
+  // is used by quickReview activities and nothing else, so it IS the C9 host.
   $: paradigmPages = Array.isArray(activity.paradigms) && activity.paradigms.length
     ? activity.paradigms
     : (activity.paradigm ? [activity.paradigm] : []);
-  // 5G-SPEC1 §2.8/§3.7: two charts on ONE page, not a More/Back sequence.
-  // Chapters 9 and 10 print their Middle+Passive and Future Active+Middle
-  // paradigms stacked in a single panel (ch10railwalk p7 shows both charts
-  // under one Cancel), where chapter 8's third-person stack is genuinely
-  // paged. The data says which: a paged stack NAMES each chart, because the
-  // name is what the More/Back control and data-chart-name report; a stacked
-  // pair has no names to report because nothing is being switched between.
-  // check-content-shapes enforces all-or-none so the two can never blur.
-  $: stackedParadigms = paradigmPages.length > 1 && paradigmPages.every(chart => !chart || !chart.name);
-  function goToParadigm(index) {
-    const next = Math.max(0, Math.min(paradigmPages.length - 1, index));
-    if (next === paradigmIndex) return;
-    stopAudio();
-    paradigmIndex = next;
-  }
+  // §4.6 as AMENDED 2026-08-17: A REVIEW PAGE NEVER PAGES. Every chart it
+  // carries is stacked into one flowing scroll, regardless of whether the
+  // charts are named.
+  //
+  // What this replaces: 5G-SPEC1 §2.8/§3.7 read the DATA for the answer — a
+  // paged stack NAMES each chart (the name is what More/Back and
+  // data-chart-name report) and a stacked pair does not — so chapters 9 and 10
+  // stacked while chapter 8's named third-person stack paged. The device review
+  // (item 4) rejected the paged half outright and gave the rule its rationale:
+  // students may want to PRINT a Review page, so all of its content has to be
+  // visible at once. The name/no-name distinction is still real and still
+  // decides paging on LEARN pages; it simply has no authority here. Each named
+  // chart keeps printing its own authored title and subtitle, which is how a
+  // reader tells the stacked charts apart now that nothing switches between
+  // them.
+  $: stackedParadigms = paradigmPages.length > 1;
 
   // Learn Vocabulary flashcard visibility (A15). Segmented radio: Show Both /
   // Hide Greek / Hide English. A hidden pane blanks until tapped (per-card
@@ -276,7 +275,7 @@
         {/each}
       </div>
     {:else if paradigmPages.length}
-      {@const page = paradigmPages[paradigmIndex] || paradigmPages[0]}
+      {@const page = paradigmPages[0]}
       <!-- 5F-FEEDBACK.pdf §8.1 root-cause fix: every pronoun paradigm now
            ships in the SAME cell-audio shape every other chapter's paradigm
            does (chapt-08.json no longer carries a `pronounParadigm` block
@@ -295,22 +294,10 @@
           <button class="btn secondary pg-say-whole" on:click={() => play(externalSayWhole.audio)}>{externalSayWhole.label || 'Say Whole Paradigm'}</button>
         </div>
       {/if}
-      {#if paradigmPages.length > 1}
-        <!-- The one shared More/Back layout (.pg-nav): both buttons on every
-             page, centred pair, invalid direction greyed out — identical to
-             Paradigm.svelte's, per the 5F-PATCH3 addendum. This block exists
-             only because the Review pager's index lives here (goToParadigm
-             stops audio on the way); the MARKUP must never drift from
-             Paradigm's — ui-behavior P3.2 measures both. -->
-        <div class="pg-nav">
-          <button class="btn secondary pg-switch pg-switch-back" data-paradigm-switch="back"
-                  disabled={paradigmIndex <= 0}
-                  on:click={() => goToParadigm(paradigmIndex - 1)}>Back</button>
-          <button class="btn secondary pg-switch pg-switch-more" data-paradigm-switch="more"
-                  disabled={paradigmIndex >= paradigmPages.length - 1}
-                  on:click={() => goToParadigm(paradigmIndex + 1)}>More</button>
-        </div>
-      {/if}
+      <!-- THE REVIEW PAGER IS GONE (amended §4.6, DISCLOSURE-SPEC2 W4). This
+           branch draws a single chart now: with more than one, the stacked
+           branch above runs instead, so there is nothing left to page between
+           and no second copy of .pg-nav in the app to drift from Paradigm's. -->
     {:else}
       <div class="pending-verification">Chart content pending verification.</div>
     {/if}
@@ -385,11 +372,17 @@
        the activity's ordinary `content[]`, so the stepper now renders content
        through RichContent after its controls exactly as textPage mode does,
        and Six Points is an accordion like every other accordion in the app.
-       Zero visual change is intended beyond the universal R2 restyle. -->
+       DISCLOSURE-SPEC2 W2.4: and NO card around it. SPEC1 wrapped this render
+       in one, which was invisible while the accordion was borderless — the
+       card WAS the box you saw. Now that §3.1 puts a box on the accordion
+       itself, a card here would be a box inside a box, and its 16px padding
+       around a single one-line summary is exactly the inflated spacing the
+       device review flagged (item 1(b)). Unwrapped, Six Points is one
+       accordion box under the stepper card, with the same minimal padding
+       every other accordion in the app has. The page's own .content gutter
+       keeps it inset from the screen edge. -->
   {#if activity.content}
-    <div class="card">
-      <RichContent blocks={activity.content} greekTaps={activityGreekTaps} />
-    </div>
+    <RichContent blocks={activity.content} greekTaps={activityGreekTaps} />
   {/if}
 
 {:else if mode === 'flashcard'}
diff --git a/src/components/Paradigm.svelte b/src/components/Paradigm.svelte
index c098fe6..f5d62b1 100644
--- a/src/components/Paradigm.svelte
+++ b/src/components/Paradigm.svelte
@@ -17,6 +17,7 @@
   import { splitTaps } from '../lib/greek.js';
   import EndingsGrid from './EndingsGrid.svelte';
   import MeaningsCard from './MeaningsCard.svelte';
+  import ParadigmActions from './ParadigmActions.svelte';
   export let paradigm;
   export let title = null;
   // The control row (Say Paradigm, and the switch where a chart has one)
@@ -140,12 +141,33 @@
   // jump. The say/endings row above it no longer counts the switch.
   $: hasActions = !!chart.sayWhole || !!chart.endings || sayWholeEach.length > 0
     || twoChartToggle;
-  // §4.3: the say-all plus its navigation control is a NAVIGATION SURFACE and
-  // must never scroll out of view. A row with no navigation in it is not one —
-  // a Quick Review page's per-chart say-all is an audio button, and §4.6 keeps
-  // those exactly where the charts are, which is also what stops two stacked
-  // charts from pinning two competing bars over each other.
-  $: pinnedControls = hasSwitch || endingsInline;
+  // §4.3 AS AMENDED 2026-08-17. Pinning happens in MODALS ONLY, at most one
+  // line, and only when that line carries navigation.
+  //
+  // What this replaces: DISCLOSURE-SPEC1 read §4.3's "sticky at the panel
+  // bottom in main content" literally and pinned Learn-page control rows too.
+  // The device review revoked it in as many words ("my comment about pinning
+  // the nav items applies ONLY to nav items in modals"), so `pinnedControls`
+  // and its sticky rule are gone rather than narrowed — there is no
+  // main-content pinning left to configure.
+  //
+  // `pinNav`     is there a pinned line at all? Only in a modal, and only with
+  //              a navigation control to put on it. A say button is NEVER
+  //              pinned alone (review item 2(c)).
+  // `pinActions` does the say-all row share that line? Only in the two-screen
+  //              composition, where the toggle sits beside it (pane f). At
+  //              three-plus the pinned line is the Back/More pair and the say
+  //              button stays in the scrolling content with its chart, which
+  //              is what keeps this to ONE pinned line.
+  $: navControl = twoChartToggle || endingsInline ? 'toggle' : (hasMoreBackNav ? 'pair' : null);
+  $: pinNav = modalHost && !actionsPinned && !!navControl;
+  $: pinActions = pinNav && navControl === 'toggle' && hasActions;
+  // The row's whole resolved presentation, handed to ParadigmActions as one
+  // object so the two placements cannot be given different halves of it.
+  $: actionState = {
+    showingEndings, endingsInline, endingsState, endingsSayLabel, endingsToggleLabel,
+    sayWholeEach, twoChartToggle, toggleLabel, switchKind, namedTarget
+  };
   $: moreLabel = (switchLabels && switchLabels[chartIndex + 1])
     || (charts[chartIndex + 1] && charts[chartIndex + 1].switchLabel) || 'More';
   $: backLabel = (switchLabels && switchLabels[chartIndex - 1])
@@ -192,7 +214,7 @@
   class:pg-three-columns={columns.length === 3}
   class:pg-many-columns={columns.length > 3}
   class:pg-modal-host={modalHost}
-  class:pg-pinned-controls={pinnedControls && !actionsPinned}
+  class:pg-pins-nav={pinNav}
   data-chart-index={chartIndex}
   data-chart-count={charts.length}
   data-chart-name={chart.name || ''}
@@ -334,74 +356,60 @@
       <div class="pg-note">{#each splitTaps(chart.note, chart.noteTaps) as seg}{#if seg.audio}<button class="greek-tap greek" on:click={() => play(seg.audio)}>{seg.t}</button>{:else}{seg.t}{/if}{/each}</div>
     {/if}
 
+    <!-- THE SAY-ALL ROW, IN FLOW. It scrolls with its chart everywhere except
+         a two-screen modal, which is the only composition that pins it
+         (amended §4.3: a say button is never pinned unless a navigation
+         control shares its line). That covers main content, a three-plus modal
+         and a modal with no navigation at all. -->
+    {#if !actionsPinned && hasActions && !pinActions}
+      <ParadigmActions {chart} state={actionState}
+                       on:toggleEndings={toggleEndings}
+                       on:openEndings={openEndings}
+                       on:switchChart={event => switchChart(event.detail)} />
+    {/if}
+    <!-- The §4.2 pair, in flow, when this is not a modal. -->
+    {#if hasMoreBackNav && !pinNav}
+      <div class="pg-nav">
+        <button
+          class="btn secondary pg-switch pg-switch-back"
+          data-paradigm-switch="back"
+          data-target-index={chartIndex - 1}
+          disabled={chartIndex <= 0}
+          on:click={() => switchChart(chartIndex - 1)}>{backLabel}</button>
+        <button
+          class="btn secondary pg-switch pg-switch-more"
+          data-paradigm-switch="more"
+          data-target-index={chartIndex + 1}
+          disabled={chartIndex >= charts.length - 1}
+          on:click={() => switchChart(chartIndex + 1)}>{moreLabel}</button>
+      </div>
+    {/if}
     </div><!-- /.pg-body -->
 
-    <!-- W4/§4.3: the say-all and its navigation control are ONE row block, so
-         a stack that has both (chapter 8's Third Person: Say Whole Paradigm
-         over a Back/More pair) pins as one surface instead of two competing
-         sticky bars. -->
-    {#if !actionsPinned && (hasActions || hasMoreBackNav)}
+    <!-- THE ONE PINNED LINE (amended §4.3). Exactly one line, only in a modal,
+         and only when it carries navigation:
+           two-screen   the say-all and the single toggle, together
+           three-plus   the Back/More pair alone; the say button stayed above,
+                        in the scrolling content, with its chart
+         A modal with no navigation renders nothing here at all, so Close is
+         the only thing below the divider. Every wrong composition the device
+         review found (item 2, panes a-e) is a violation of one of those two
+         sentences. -->
+    {#if pinNav}
       <div class="pg-controls">
-        {#if hasActions}
-          <div class="pg-actions" class:pg-actions-each={sayWholeEach.length > 0} style={`--pg-action-count:${sayWholeEach.length || 1}`}>
-            {#if showingEndings}
-              <!-- §4.4: the replaced state's own say button, in the SAME slot
-                   and class as Say Whole Paradigm. This is where D-10's clip
-                   now lives; nothing plays on the state change itself. -->
-              <button class="btn secondary pg-say-whole pg-say-endings"
-                      data-audio-id={chart.endings.audio || ''}
-                      disabled={!chart.endings.audio}
-                      on:click={() => chart.endings.audio && play(chart.endings.audio)}>{endingsSayLabel}</button>
-            {:else if chart.sayWhole}
-              <button class="btn secondary pg-say-whole" on:click={() => play(chart.sayWhole.audio)}>{chart.sayWhole.label || 'Say Whole Paradigm'}</button>
-            {/if}
-            {#each sayWholeEach as action, actionIndex}
-              <button
-                class="btn secondary pg-say-whole pg-say-whole-each"
-                data-action-index={actionIndex}
-                on:click={() => action.audio && play(action.audio)}>
-                {action.label || 'Say Whole Paradigm'}
-              </button>
-            {/each}
-            {#if chart.endings}
-              {#if endingsInline}
-                <!-- R4: in a modal host the Endings control is an IN-PLACE
-                     two-state toggle, not a button that opens a second modal
-                     on top of the first (§4.4, broken item 3). -->
-                <button class="btn secondary pg-switch pg-endings-toggle"
-                        data-paradigm-switch="endings"
-                        data-target-state={endingsState ? 'paradigm' : 'endings'}
-                        on:click={toggleEndings}>{endingsToggleLabel}</button>
-              {:else}
-                <!-- W5.4: from MAIN content the Endings button still opens its
-                     own single-level modal. One level is not stacking, and the
-                     chapter-3 Learn page is device-verified that way. -->
-                <button class="btn secondary pg-endings-open" on:click={openEndings}>{chart.endings.label || 'Endings'}</button>
-              {/if}
-            {/if}
-            {#if twoChartToggle}
-              <!-- R5/§4.1: ONE toggle on the say-all line, naming the chart it
-                   goes to. `named` reads Singular/Plural; `moreBack`
-                   alternates More/Back for a contrast with no one-word name. -->
-              <button
-                class="btn secondary pg-switch pg-switch-named"
-                data-paradigm-switch="named"
-                data-switch-kind={switchKind}
-                data-target-index={namedTarget}
-                on:click={() => switchChart(namedTarget)}>
-                {toggleLabel}
-              </button>
-            {/if}
-          </div>
+        {#if pinActions}
+          <ParadigmActions {chart} state={actionState}
+                           on:toggleEndings={toggleEndings}
+                           on:openEndings={openEndings}
+                           on:switchChart={event => switchChart(event.detail)} />
         {/if}
         {#if hasMoreBackNav}
           <!-- 5F-PATCH3 addendum (Nathanael, 2026-08-10, after user testing):
                BOTH buttons render on EVERY page of the stack, as a centred pair —
                the invalid direction is greyed out (disabled), never removed, so
-               nothing ever jumps or disappears while paging. This supersedes the
-               item-27 left/right fixed-slot model. Since DISCLOSURE-SPEC1 W6 it
-               is reached only at THREE OR MORE charts (§4.2); a two-chart stack
-               takes the single toggle above. -->
+               nothing ever jumps or disappears while paging. Since
+               DISCLOSURE-SPEC1 W6 it is reached only at THREE OR MORE charts
+               (§4.2); a two-chart stack takes the single toggle instead. -->
           <div class="pg-nav">
             <button
               class="btn secondary pg-switch pg-switch-back"
diff --git a/src/components/SelectActivity.svelte b/src/components/SelectActivity.svelte
index 72dd2cb..105155b 100644
--- a/src/components/SelectActivity.svelte
+++ b/src/components/SelectActivity.svelte
@@ -821,16 +821,19 @@
            can resolve now ships in the one standard cell-audio shape, so
            there is no second renderer to keep in sync. -->
       {#if hintDisclosure}
-        <!-- D-48f1: one chart at a time. Only the body scrolls; the state Say
-             action and its disclosure control live with Close in the pinned
-             footer below, which is why this Paradigm draws no row of its own
-             (actionsPinned). A composite bundle is the one hint shape whose
-             state the HOST owns — it picks which of the bundle's paradigms is
-             on screen — so the host also owns the control row. -->
+        <!-- D-48f1: one chart at a time. A composite bundle is the one hint
+             shape whose state the HOST owns — it picks which of the bundle's
+             paradigms is on screen — so the host also owns the pinned line.
+             DISCLOSURE-SPEC2 W3.4: only at TWO states. `actionsPinned` hands
+             the say button to the footer, and at three or more the amended
+             §4.3 explicitly leaves it in the scrolling content with its chart,
+             so the pinned line is the Back/More pair alone. Passing
+             `hintPairToggle` here is what makes that switch. -->
         <div class="modal-scroll">
           <div class="paradigm-stack">
             {#if hintChart.title}<div class="rc-heading">{hintChart.title}</div>{/if}
-            <Paradigm paradigm={hintParadigm} title={hintParadigm.title || null} actionsPinned={true} />
+            <Paradigm paradigm={hintParadigm} title={hintParadigm.title || null}
+                      actionsPinned={hintPairToggle} />
           </div>
         </div>
       {:else}
@@ -844,10 +847,17 @@
       {/if}
       <div class="modal-actions">
         {#if hintDisclosure}
-          <div class="hint-paradigm-controls" class:no-say={!hintParadigm.sayWhole?.audio}
+          <!-- W3.4: at three or more states the say button is NOT here — it is
+               above, in the scrolling content, drawn by the Paradigm itself.
+               `no-say` therefore covers both reasons the say slot can be empty:
+               a chart with no whole-paradigm clip (εἰμί), and a three-plus
+               bundle whose say button is deliberately unpinned. Either way the
+               remaining control centres on its own line (§4.5). -->
+          <div class="hint-paradigm-controls"
+               class:no-say={!hintPairToggle || !hintParadigm.sayWhole?.audio}
                data-hint-paradigm-controls data-hint-ref={activeHintRef}
                data-state-index={hintParadigmIndex}>
-            {#if hintParadigm.sayWhole?.audio}
+            {#if hintPairToggle && hintParadigm.sayWhole?.audio}
               <button class="btn secondary" data-hint-paradigm-say
                       data-audio-id={hintParadigm.sayWhole.audio}
                       on:click={() => play(hintParadigm.sayWhole.audio)}>
```

## 4. Data delta (pipeline, not implementer)

`fae598e..HEAD` over `src/data`: the 27 accordion labels, and nothing else.
Verified structurally (a JSON walk comparing values by path, not a text diff)
before any renderer work began — see RESULTS §1.

```diff
diff --git a/src/data/chapt-04.json b/src/data/chapt-04.json
index 86aad8a..c061035 100644
--- a/src/data/chapt-04.json
+++ b/src/data/chapt-04.json
@@ -161,7 +161,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "Subjective Case Examples",
            "content": [
             {
              "type": "para",
@@ -185,7 +185,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "Objective Case Examples",
            "content": [
             {
              "type": "para",
@@ -209,7 +209,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "Possessive Case Examples",
            "content": [
             {
              "type": "para",
@@ -315,7 +315,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "Nominative Form Examples",
            "content": [
             {
              "type": "para",
@@ -335,7 +335,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "Genitive Form Examples",
            "content": [
             {
              "type": "para",
@@ -359,7 +359,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "Dative Form Examples",
            "content": [
             {
              "type": "para",
@@ -383,7 +383,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "Accusative Form Examples",
            "content": [
             {
              "type": "para",
@@ -403,7 +403,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "Vocative Form Examples",
            "content": [
             {
              "type": "para",
diff --git a/src/data/chapt-05.json b/src/data/chapt-05.json
index 6f297a9..d957580 100644
--- a/src/data/chapt-05.json
+++ b/src/data/chapt-05.json
@@ -164,7 +164,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "Subjective Case Examples",
            "content": [
             {
              "type": "para",
@@ -188,7 +188,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "Objective Case Examples",
            "content": [
             {
              "type": "para",
@@ -212,7 +212,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "Possessive Case Examples",
            "content": [
             {
              "type": "para",
@@ -340,7 +340,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "Nominative Form Examples",
            "content": [
             {
              "type": "para",
@@ -360,7 +360,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "Genitive Form Examples",
            "content": [
             {
              "type": "para",
@@ -384,7 +384,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "Dative Form Examples",
            "content": [
             {
              "type": "para",
@@ -404,7 +404,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "Accusative Form Examples",
            "content": [
             {
              "type": "para",
@@ -424,7 +424,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "Vocative Form Examples",
            "content": [
             {
              "type": "para",
diff --git a/src/data/chapt-07.json b/src/data/chapt-07.json
index 6a58f50..e742892 100644
--- a/src/data/chapt-07.json
+++ b/src/data/chapt-07.json
@@ -885,7 +885,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "οὐ Examples",
            "content": [
             {
              "greek": "οὐ",
@@ -917,7 +917,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "οὐκ Examples",
            "content": [
             {
              "greek": "οὐκ",
@@ -949,7 +949,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "οὐχ Examples",
            "content": [
             {
              "greek": "οὐχ",
diff --git a/src/data/chapt-08.json b/src/data/chapt-08.json
index 7c6e305..7ce1b3b 100644
--- a/src/data/chapt-08.json
+++ b/src/data/chapt-08.json
@@ -846,7 +846,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "Pronoun Examples",
            "content": [
             {
              "type": "wordUsage",
@@ -881,7 +881,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "Reflexive Intensifier Examples",
            "content": [
             {
              "type": "wordUsage",
@@ -910,7 +910,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "\"Same\" Examples",
            "content": [
             {
              "type": "wordUsage",
diff --git a/src/data/chapt-10.json b/src/data/chapt-10.json
index 50ce12c..a79a53e 100644
--- a/src/data/chapt-10.json
+++ b/src/data/chapt-10.json
@@ -270,7 +270,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "Palatal Examples",
            "content": [
             {
              "type": "presentFutureRows",
@@ -308,7 +308,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "Labial Examples",
            "content": [
             {
              "type": "presentFutureRows",
@@ -346,7 +346,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "Dental Examples",
            "content": [
             {
              "type": "presentFutureRows",
@@ -373,7 +373,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "Liquid Examples",
            "content": [
             {
              "type": "presentFutureRows",
@@ -411,7 +411,7 @@
          "below": [
           {
            "type": "expander",
-           "label": "Examples",
+           "label": "Sibilant Examples",
            "content": [
             {
              "type": "presentFutureRows",
```
