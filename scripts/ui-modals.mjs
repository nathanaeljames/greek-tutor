// MODAL VISUAL PASS (5E-SPEC3-RESPONSE item 2).
//
// ui-walk.mjs photographs a rail stop as it arrives, and ui-behavior.mjs
// photographs an answered drill. Neither has ever photographed a MODAL, which
// is how a dialog whose close button sat 435px below the fold on an iPhone 14
// shipped twice. This walks every modal surface in chapters 1-5 at real device
// heights and captures each one AT REST — nothing scrolled, exactly the state
// the dialog opens in, which is the state Nathanael judges it in:
//
//   "Can't we make it so the top and bottom of the modal is visible at rest,
//    e.g. after your finger is removed from the screen?"
//
// So each image must show BOTH of the modal's borders and its close control
// with no scrolling at all. A second capture per surface scrolls the modal's
// CONTENT to its end, to prove the pinned action block stays put while the
// content moves under it.
//
//   node scripts/ui-modals.mjs [--out=DIR] [--force]
//
// It also reports whether the OVERLAY has any scroll range left. That must be
// zero: range there means the modal did not fit the screen.

import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync, readdirSync, readFileSync } from 'node:fs';

const args = Object.fromEntries(process.argv.slice(2)
  .filter(a => a.startsWith('--'))
  .map(a => { const i = a.indexOf('='); return i === -1 ? [a.slice(2), true] : [a.slice(2, i), a.slice(i + 1)]; }));

const stamp = new Date();
const pad = n => String(n).padStart(2, '0');
const RUN_ID = `${stamp.getFullYear()}${pad(stamp.getMonth() + 1)}${pad(stamp.getDate())}`
  + `-${pad(stamp.getHours())}${pad(stamp.getMinutes())}${pad(stamp.getSeconds())}`;
const BASE = args.base || `http://localhost:${args.port || 4173}`;
const OUT = args.out || `buildout/screenshots/modals-${RUN_ID}`;

// Same refusal as ui-walk.mjs (5E-SPEC3 §4): never overwrite evidence.
let existing = [];
try { existing = readdirSync(OUT); } catch { /* absent is fine */ }
if (existing.length && !args.force) {
  console.error(`REFUSING to write into ${OUT}: it already contains ${existing.length} entries. Pass --out=DIR or --force.`);
  process.exit(2);
}
mkdirSync(OUT, { recursive: true });

// REAL DEVICE HEIGHTS. iPhone 14 is 390x844 CSS px; Safari showing its toolbars
// leaves roughly 390x734, and with the URL bar expanded roughly 390x664. 320x360
// is the cruel case the app supports, and 768x1024 is the iPad breakpoint.
const VIEWPORTS = [
  { name: 'iphone14-844', width: 390, height: 844 },
  { name: 'iphone14-toolbars-734', width: 390, height: 734 },
  { name: 'iphone14-urlbar-664', width: 390, height: 664 },
  { name: 'short-320x360', width: 320, height: 360 },
  { name: 'ipad-768x1024', width: 768, height: 1024 }
];

async function launchBrowser() {
  const explicit = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
  if (explicit) return chromium.launch({ executablePath: explicit });
  try { return await chromium.launch(); } catch (original) {
    for (const channel of ['chrome', 'msedge']) {
      try { return await chromium.launch({ channel }); } catch { /* next */ }
    }
    throw original;
  }
}

const browser = await launchBrowser();
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();

// A cache-busting query, because navigating to a URL that differs only in its
// FRAGMENT is a same-document navigation: the SPA never re-routes, so an open
// modal stays open and the next "open the Hint" click TOGGLES IT SHUT. The
// first run of this file skipped four captures for exactly that reason.
let nav = 0;
const go = async hash => {
  await page.goto(`${BASE}/?modals=${++nav}${hash}`, { waitUntil: 'load' });
  await page.waitForSelector('.card', { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
};

const setHintDisclosureState = async stateIndex => {
  const controls = page.locator('.modal [data-hint-paradigm-controls]');
  await controls.waitFor({ state: 'visible' });
  const expected = String(stateIndex);
  const current = await controls.getAttribute('data-state-index');
  if (current !== expected) {
    await controls.locator('[data-hint-paradigm-toggle]').click();
    await page.locator(`.modal [data-hint-paradigm-controls][data-state-index="${expected}"]`).waitFor();
    await page.waitForTimeout(180);
  }
};

const hint = (chapterId, activityId, meanings, disclosureState = null) => async () => {
  await go(`#/activity/${chapterId}/${activityId}`);
  await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
  await page.waitForTimeout(180);
  if (meanings) {
    const toggle = page.locator('.modal [data-paradigm-meanings] summary');
    if (await toggle.count()) { await toggle.first().click(); await page.waitForTimeout(200); }
  }
  if (disclosureState !== null) await setHintDisclosureState(disclosureState);
};

// Form-dependent Hints cannot be covered by opening whichever shuffled item
// happens to mount first. Seek the named form through the activity's real Next
// control, then open the modal variant that form routes to.
const normalizeText = value => String(value ?? '').replace(/\s+/g, ' ').trim().normalize('NFC');
const hintAtPrompt = (chapterId, activityId, prompt, itemCount, disclosureState = null) => async () => {
  await go(`#/activity/${chapterId}/${activityId}`);
  const next = () => page.locator('.card').getByRole('button', { name: 'Next', exact: true });
  let found = false;
  for (let step = 0; step < itemCount; step++) {
    const shown = normalizeText(await page.locator('.card .prompt').first().innerText());
    if (shown === normalizeText(prompt)) { found = true; break; }
    if (await next().isDisabled()) break;
    await next().click();
    await page.waitForTimeout(45);
  }
  if (!found) throw new Error(`never reached Hint form ${JSON.stringify(prompt)}`);
  await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
  await page.waitForTimeout(180);
  if (disclosureState !== null) await setHintDisclosureState(disclosureState);
};

// 5I: a bundle of THREE OR MORE charts steps with the centred Back/More pair
// (DISCLOSURE-RULES 4.2) rather than alternating with a single toggle, so
// `setHintDisclosureState` -- which knows only the two-state toggle -- cannot
// reach state 3 of chapter 16's passive paradigms or state 4 of chapter 15's
// aorist-versus-imperfect stack. Each state is its own surface at every
// height; a chart nobody opens is a chart nobody measures.
const stepHintDisclosureTo = async stateIndex => {
  const controls = page.locator('.modal [data-hint-paradigm-controls]');
  await controls.waitFor({ state: 'visible' });
  for (let step = 0; step < stateIndex; step++) {
    const more = page.locator('.modal [data-hint-paradigm-nav="more"]');
    if (!await more.count() || await more.isDisabled()) throw new Error(`hint bundle has no state ${stateIndex + 1}`);
    await more.click();
    await page.waitForTimeout(160);
  }
  await page.locator(`.modal [data-hint-paradigm-controls][data-state-index="${stateIndex}"]`).waitFor();
  await page.waitForTimeout(120);
};

// A drill Hint whose bundle holds three or more charts.
const hintState = (chapterId, activityId, stateIndex) => async () => {
  await go(`#/activity/${chapterId}/${activityId}`);
  await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
  await page.waitForTimeout(180);
  await stepHintDisclosureTo(stateIndex);
};

// An IN-CHART C3 trigger on a topicPages surface: step to the topic, then press
// the named trigger. Chapter 13's Key Letter Box is the first chart in the app
// with six of them, and chapters 14 and 15 add four more between them.
const chartTrigger = (chapterId, activityId, topicIndex, ref) => async () => {
  await go(`#/activity/${chapterId}/${activityId}`);
  for (let i = 0; i < topicIndex; i++) {
    await page.getByRole('button', { name: 'Next Topic', exact: true }).click();
    await page.waitForTimeout(80);
  }
  await page.locator(`.card [data-chart-trigger="${ref}"]`).first().click();
  await page.waitForTimeout(180);
};

// The tile keyboard, which is a modal of its own on every speller.
const spellerKeyboard = (chapterId, activityId) => async () => {
  await go(`#/activity/${chapterId}/${activityId}`);
  await page.locator('.card').getByRole('button', { name: 'Greek Keyboard', exact: true }).click();
  await page.waitForTimeout(180);
};

// A PAGED hint is N surfaces, not one. 5H-SPEC3 2 put chapter 8's translation
// hint back to a four-page stack (VERIFY-5H-2 (s)), and a page nobody opens is
// a page nobody measures -- which is the whole reason this file exists. The
// modal's own Back/More pair is the navigation, so stepping it is how each
// page gets its turn at all five heights.
const hintPage = (chapterId, activityId, pageIndex) => async () => {
  await go(`#/activity/${chapterId}/${activityId}`);
  await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
  await page.waitForTimeout(180);
  for (let step = 0; step < pageIndex; step++) {
    const more = page.locator('.modal [data-hint-page-nav="more"]');
    if (!await more.count() || await more.isDisabled()) throw new Error(`hint has no page ${pageIndex + 1}`);
    await more.click();
    await page.waitForTimeout(160);
  }
};

const SURFACES = [
  // Chapter 2's four Hint surfaces, added 2026-08-13. Two of them are the ONLY
  // coverage of DivideActivity and PlaceAccentActivity, which -- with
  // SelectActivity -- shipped a bare `.card` instead of a modal shell in 5F:
  // one copy-pasted bug in three files (5F-SPEC1-PATCH1 item 15/16). That fix
  // was never rechecked here at any device height, because this list only ever
  // held SelectActivity Hints. A component whose modal nothing opens is a
  // component whose modal nothing checks.
  ['ch2-syllable-counting-hint', hint('chapt_2', 'c2_drill_syllable_counting', false)],
  ['ch2-accent-rule-hint', hint('chapt_2', 'c2_drill_accent_rule', false)],
  ['ch2-syllable-division-hint', hint('chapt_2', 'c2_ex_syllable_division', false)],
  ['ch2-accent-placement-hint', hint('chapt_2', 'c2_ex_accent_placement', false)],
  ['ch6-case-hint', hint('chapt_6', 'c6_drill_case', false)],
  ['ch6-translation-hint', hint('chapt_6', 'c6_drill_translation', false)],
  ['ch3-verb-translating-hint', hint('chapt_3', 'c3_drill_verb_translating', false)],
  ['ch4-greek-noun-hint', hint('chapt_4', 'c4_drill_greek_noun', false)],
  ['ch4-greek-noun-hint-meanings', hint('chapt_4', 'c4_drill_greek_noun', true)],
  ['ch4-declining-hint-meanings', hint('chapt_4', 'c4_drill_declining', true)],
  ['ch5-first-decl-hint-meanings', hint('chapt_5', 'c5_drill_first_decl_noun', true)],
  ['ch5-declining-hint-meanings', hint('chapt_5', 'c5_drill_declining', true)],
  ['ch5-article-hint-meanings', hint('chapt_5', 'c5_drill_article', true)],
  ['ch3-learn-verbs-endings', async () => {
    await go('#/activity/chapt_3/c3_learn_verbs');
    for (let i = 0; i < 2; i++) { await page.getByRole('button', { name: 'Next Topic', exact: true }).click(); await page.waitForTimeout(80); }
    await page.locator('.card .pg-endings-open').first().click();
    await page.waitForTimeout(180);
  }],
  // 5F: the full-page popups. Three shapes — a preposition with three sense
  // lines and three worked examples (the tallest thing in the cohort), a
  // three-sense preposition, and a use-of-αὐτός page with no headword. Each is
  // a modal with a Cancel control, so each has to show both borders and that
  // control at rest at every height, like every other modal in the app.
  ['ch6-popup-apo', async () => {
    await go('#/activity/chapt_6/c6_learn_prepositions');
    await page.getByRole('button', { name: 'Next Topic', exact: true }).click();
    await page.waitForTimeout(100);
    await page.locator('.rc-sense-link').first().click();
    await page.waitForTimeout(180);
  }],
  ['ch6-popup-epi-three-senses', async () => {
    await go('#/activity/chapt_6/c6_learn_prepositions');
    for (let i = 0; i < 3; i++) { await page.getByRole('button', { name: 'Next Topic', exact: true }).click(); await page.waitForTimeout(80); }
    await page.locator('.rc-sense-link').first().click();
    await page.waitForTimeout(180);
  }],
  // TWO MODAL STATES ARE GONE, and this census is where that shows up as a
  // deletion rather than a silent absence. DISCLOSURE-RULES §6.3/§7 and the
  // chapter-8 row of §8 reclassify BOTH pages as C2 rule lists — a numbered
  // closed set in which every item is disclosed — so their popups are retired
  // outright and the content is disclosed in place, in an "Examples" accordion
  // under each item:
  //   ch7-popup-ou                  οὐ/οὐκ/οὐχ; numberPopupRef retired, D-31
  //                                 amended (was 5F-FEEDBACK.pdf item 15's
  //                                 number-marker route).
  //   ch8-popup-autos-as-a-pronoun  the three uses of αὐτός; the three
  //                                 slug-linked popups retired with the
  //                                 conversion, and the [[u]] runs that used to
  //                                 reach them stay as plain emphasis.
  // Neither page lost its census coverage: both are asserted in
  // scripts/ui-disclosure.mjs (D5.4-D5.10) as accordions with a wordUsage body,
  // and P3.4 in ui-behavior.mjs asserts the popup route is ABSENT rather than
  // merely unused — a surviving popup link would be the old disclosure showing
  // through the new one.
  // 5G: each two-chart Hint now discloses one chart at a time. Capture both
  // states independently so neither replacement chart can evade the modal
  // sizing check. Chapter 10's parsing Hint has two payloads, so its luo and
  // eimi forms are sought explicitly instead of trusting shuffle. The third
  // tuple field requires the pinned disclosure-control row on these surfaces.
  // The remaining popups are the content[] shape: a one-line aside and a
  // six-row Greek list. Stem derivations are interspersed accordions now.
  ['ch9-hint-middle', hint('chapt_9', 'c9_drill_parsing', false, 0), true, true],
  ['ch9-hint-passive', hint('chapt_9', 'c9_drill_parsing', false, 1), true, true],
  ['ch10-hint-future-active', hintAtPrompt('chapt_10', 'c10_drill_parsing', 'λύω', 30, 0), true, true],
  ['ch10-hint-future-middle', hintAtPrompt('chapt_10', 'c10_drill_parsing', 'λύω', 30, 1), true, true],
  ['ch10-hint-eimi-present', hintAtPrompt('chapt_10', 'c10_drill_parsing', 'εἰμί', 30, 0), true, false],
  ['ch10-hint-eimi-future', hintAtPrompt('chapt_10', 'c10_drill_parsing', 'εἰμί', 30, 1), true, false],
  ['ch9-popup-punctiliar', async () => {
    await go('#/activity/chapt_9/c9_learn_mp_verbs');
    await page.locator('.rc-para .popup-link').first().click();
    await page.waitForTimeout(180);
  }],
  ['ch9-popup-frequent-verbs', async () => {
    await go('#/activity/chapt_9/c9_learn_mp_verbs');
    for (let i = 0; i < 3; i++) { await page.getByRole('button', { name: 'Next Topic', exact: true }).click(); await page.waitForTimeout(80); }
    await page.locator('.rc-para .popup-link').first().click();
    await page.waitForTimeout(180);
  }],
  ['ch10-verse-speller-greek-keyboard', async () => {
    await go('#/activity/chapt_10/c10_ex_scripture_speller');
    await page.locator('.card').getByRole('button', { name: 'Greek Keyboard', exact: true }).click();
    await page.waitForTimeout(180);
  }],
  ['ch6-speller-greek-keyboard', async () => {
    await go('#/activity/chapt_6/c6_ex_speller');
    await page.locator('.card').getByRole('button', { name: 'Greek Keyboard', exact: true }).click();
    await page.waitForTimeout(180);
  }],
  ['ch7-adjective-case-hint', hint('chapt_7', 'c7_drill_case', false)],
  // 5H-SPEC2 3.1 (LOOKBACK): chapter 8's Case Drill routes each form to its OWN
  // person's paradigm -- three modals off one drill, so all three are sought
  // by form. Its dispatch was confirmed in DOSBox and it is unchanged.
  ['ch8-case-hint-first-person', hintAtPrompt('chapt_8', 'c8_drill_case', 'ἡμεῖς', 31)],
  ['ch8-case-hint-second-person', hintAtPrompt('chapt_8', 'c8_drill_case', 'σοι', 31)],
  ['ch8-case-hint-third-person', hintAtPrompt('chapt_8', 'c8_drill_case', 'αὐτή', 31)],
  // 5H-SPEC3 2: TWO SURFACES BECAME FOUR, because the surface did. The
  // translation drill's hint was a per-item route to one of two payloads;
  // VERIFY-5H-2 (s) settled in DOSBox that the original opens the same
  // four-page stack on every item, so it is measured page by page and NOT
  // sought by form -- every item opens the same thing now, which is the
  // ruling. Page 4 is the Learn topic "Three Uses", the one hint in the app
  // whose body is a TEACHING PAGE reached by topic id: prose, two levels of
  // numbered list and three accordions, exactly the sort of body that fits at
  // 844px and overflows at 360, which is what this file is for.
  ['ch8-autos-translation-hint-p1-masculine', hintPage('chapt_8', 'c8_drill_translation_autos', 0)],
  ['ch8-autos-translation-hint-p2-feminine', hintPage('chapt_8', 'c8_drill_translation_autos', 1)],
  ['ch8-autos-translation-hint-p3-neuter', hintPage('chapt_8', 'c8_drill_translation_autos', 2)],
  ['ch8-autos-translation-hint-p4-three-uses', hintPage('chapt_8', 'c8_drill_translation_autos', 3)],
  // 5H: chapter 11's four hints are form-dependent (D-46), so the two that
  // route to two different charts are sought by FORM rather than trusted to
  // shuffle -- an οὗτος item and an ἐκεῖνος item open different modals, and
  // both have to fit at every height. Chapter 12's parsing hint does the same
  // across λύω and εἰμί. Each is a §4.5 lone centred toggle with no say-all,
  // so the hint-say column of the assertion is false throughout.
  ['ch11-this-that-hint-this', hintAtPrompt('chapt_11', 'c11_drill_this_that', 'οὗτος', 30, 0), true, false],
  ['ch11-this-that-hint-this-plural', hintAtPrompt('chapt_11', 'c11_drill_this_that', 'οὗτος', 30, 1), true, false],
  ['ch11-this-that-hint-that', hintAtPrompt('chapt_11', 'c11_drill_this_that', 'ἐκεῖνος', 30, 0), true, false],
  ['ch11-who-the-hint-article', hintAtPrompt('chapt_11', 'c11_drill_who_the', 'τῆς', 30, 0), true, false],
  ['ch11-who-the-hint-relative', hintAtPrompt('chapt_11', 'c11_drill_who_the', 'ὅς', 30, 0), true, false],
  ['ch11-translation-this-that-hint', hint('chapt_11', 'c11_drill_translation_this_that', false, 0), true, false],
  ['ch11-translation-relative-hint', hint('chapt_11', 'c11_drill_translation_relative', false, 0), true, false],
  ['ch11-demonstrative-examples-popup', async () => {
    await go('#/activity/chapt_11/c11_learn_demonstratives');
    await page.locator('.card details summary').first().click();
    await page.waitForTimeout(150);
    await page.locator('.card .popup-link').first().click();
    await page.waitForTimeout(180);
  }],
  ['ch11-verse-speller-greek-keyboard', async () => {
    await go('#/activity/chapt_11/c11_ex_scripture_speller');
    await page.locator('.card').getByRole('button', { name: 'Greek Keyboard', exact: true }).click();
    await page.waitForTimeout(180);
  }],
  ['ch12-parsing-hint-luo', hintAtPrompt('chapt_12', 'c12_drill_parsing', 'ἔλυες', 23, 0), true, false],
  ['ch12-parsing-hint-luo-mp', hintAtPrompt('chapt_12', 'c12_drill_parsing', 'ἔλυες', 23, 1), true, false],
  ['ch12-parsing-hint-eimi', hintAtPrompt('chapt_12', 'c12_drill_parsing', 'ἦμεν', 23, 0), true, false],
  ['ch12-parsing-hint-echo', hintAtPrompt('chapt_12', 'c12_drill_parsing', 'ἦμεν', 23, 1), true, false],
  ['ch12-translation-hint', hint('chapt_12', 'c12_drill_translation', false, 0), true, false],
  ['ch12-augment-hint', hint('chapt_12', 'c12_drill_augment', false)],
  ['ch12-verse-speller-greek-keyboard', async () => {
    await go('#/activity/chapt_12/c12_ex_scripture_speller');
    await page.locator('.card').getByRole('button', { name: 'Greek Keyboard', exact: true }).click();
    await page.waitForTimeout(180);
  }],
  ['ch1-speller-greek-keyboard', async () => {
    await go('#/activity/chapt_1/c1_ex_speller');
    await page.locator('.card').getByRole('button', { name: 'Greek Keyboard', exact: true }).click();
    await page.waitForTimeout(180);
  }],
  ['ch5-verse-speller-greek-keyboard', async () => {
    await go('#/activity/chapt_5/c5_ex_scripture_speller');
    await page.locator('.card').getByRole('button', { name: 'Greek Keyboard', exact: true }).click();
    await page.waitForTimeout(180);
  }],
  ['ch1-end-of-chapter', async () => {
    await go('#/activity/chapt_1/c1_learn_bibliography');
    await page.locator('.rail-next').click();
    await page.waitForTimeout(250);
  }],
  // The Settings confirm dialog (added 2026-08-13). Two lines and two buttons
  // -- the smallest modal in the app, and the one a shared-CSS change is most
  // likely to leave behind.
  // ---------------------------------------------------------------- 5I
  // Chapters 13-16. THE KEY LETTER BOX is the new shape: six in-chart triggers
  // on one chart, each opening its own popup, where no earlier chapter has more
  // than three on a page. All six are listed rather than sampled -- the point
  // of this file is that a modal nobody opens is a modal nobody checks.
  ['ch13-klb-popup-unvoiced', chartTrigger('chapt_13', 'c13_learn_concepts', 1, 'unvoiced')],
  ['ch13-klb-popup-voiced', chartTrigger('chapt_13', 'c13_learn_concepts', 1, 'voiced')],
  ['ch13-klb-popup-aspirate', chartTrigger('chapt_13', 'c13_learn_concepts', 1, 'aspirate')],
  ['ch13-klb-popup-labial', chartTrigger('chapt_13', 'c13_learn_concepts', 1, 'labial')],
  ['ch13-klb-popup-velar', chartTrigger('chapt_13', 'c13_learn_concepts', 1, 'velar')],
  ['ch13-klb-popup-dental', chartTrigger('chapt_13', 'c13_learn_concepts', 1, 'dental')],
  ['ch13-declining-hint', hint('chapt_13', 'c13_drill_declining', false)],
  // 5I-SPEC2 §4.1: the pas hint PAGES now -- Singular then Plural, the ch11
  // model -- where 5I shipped one stacked six-column chart. Two surfaces, and
  // each carries the D-58 Say Paradigm button beside its toggle, so both take
  // the say/toggle order assertion.
  ['ch13-pas-declining-hint-singular', hint('chapt_13', 'c13_drill_pas_declining', false, 0), true, true],
  ['ch13-pas-declining-hint-plural', hint('chapt_13', 'c13_drill_pas_declining', false, 1), true, true],
  ['ch13-translation-hint', hint('chapt_13', 'c13_drill_translation', false)],
  ['ch13-speller-greek-keyboard', spellerKeyboard('chapt_13', 'c13_ex_speller')],
  ['ch13-verse-speller-greek-keyboard', spellerKeyboard('chapt_13', 'c13_ex_scripture_speller')],
  // Chapter 14's stem list carries ONE in-chart trigger, and it is reachable
  // from two different hosts (the Learn topic and the Quick Review page), which
  // is two registers and therefore two surfaces.
  ['ch14-stem-popup-learn', chartTrigger('chapt_14', 'c14_learn_second_aorist', 5, 'blepwEidon')],
  ['ch14-stem-popup-review', async () => {
    await go('#/activity/chapt_14/c14_qr_forms');
    await page.locator('.card [data-chart-trigger="blepwEidon"]').first().click();
    await page.waitForTimeout(180);
  }],
  ['ch14-parsing-hint-active', hint('chapt_14', 'c14_drill_parsing', false, 0), true, false],
  ['ch14-parsing-hint-middle', hint('chapt_14', 'c14_drill_parsing', false, 1), true, false],
  ['ch14-forms-hint', hint('chapt_14', 'c14_drill_forms', false)],
  ['ch14-translation-hint-active', hint('chapt_14', 'c14_drill_translation', false, 0), true, false],
  ['ch14-translation-hint-middle', hint('chapt_14', 'c14_drill_translation', false, 1), true, false],
  ['ch14-speller-greek-keyboard', spellerKeyboard('chapt_14', 'c14_ex_speller_forms')],
  ['ch14-verse-speller-greek-keyboard', spellerKeyboard('chapt_14', 'c14_ex_scripture_speller')],
  // Chapter 15's four sound-description popups hang off the Ending
  // Transformations chart; the fourth is reached from the prose beneath it.
  ['ch15-popup-palatals', chartTrigger('chapt_15', 'c15_learn_first_aorist', 6, 'palatals')],
  ['ch15-popup-labials', chartTrigger('chapt_15', 'c15_learn_first_aorist', 6, 'labials')],
  ['ch15-popup-dentals', chartTrigger('chapt_15', 'c15_learn_first_aorist', 6, 'dentals')],
  ['ch15-popup-liquids', async () => {
    await go('#/activity/chapt_15/c15_learn_first_aorist');
    for (let i = 0; i < 6; i++) { await page.getByRole('button', { name: 'Next Topic', exact: true }).click(); await page.waitForTimeout(80); }
    await page.locator('.card .rc-para .popup-link').first().click();
    await page.waitForTimeout(180);
  }],
  ['ch15-parsing-hint-active', hint('chapt_15', 'c15_drill_parsing', false, 0), true, false],
  ['ch15-parsing-hint-middle', hint('chapt_15', 'c15_drill_parsing', false, 1), true, false],
  ['ch15-forms-hint', hint('chapt_15', 'c15_drill_forms', false)],
  // 5I-SPEC2 §5.5: NOT a four-chart bundle. 15_1AOR.TBK 0x116f1e routes items 1
  // and 11 to the IMPERFECT pair and every other item to the AORIST pair, so
  // the four charts are two two-chart hints and which one opens depends on the
  // verse on screen. Each pair is two states, and both pairs are reached
  // through the drill's own Next control at a named prompt -- state 4 no longer
  // exists to step to.
  // (Neither pair carries a say-all recording, so the toggle centres alone on
  // the pinned line per §4.5 and `expectHintSay` stays false.)
  ['ch15-translation-hint-aorist-active',
    hintAtPrompt('chapt_15', 'c15_drill_translation', 'καὶ ἀπέστειλεν αὐτὸν εἰς οἶκον αὐτοῦ', 29, 0), true, false],
  ['ch15-translation-hint-aorist-middle',
    hintAtPrompt('chapt_15', 'c15_drill_translation', 'καὶ ἀπέστειλεν αὐτὸν εἰς οἶκον αὐτοῦ', 29, 1), true, false],
  ['ch15-translation-hint-imperfect-active',
    hintAtPrompt('chapt_15', 'c15_drill_translation', 'καὶ ἐδίδασκεν αὐτοὺς ἐν παραβολαῖς πολλά καὶ ἔλεγεν αὐτοῖς', 29, 0), true, false],
  ['ch15-translation-hint-imperfect-mp',
    hintAtPrompt('chapt_15', 'c15_drill_translation', 'καὶ ἐδίδασκεν αὐτοὺς ἐν παραβολαῖς πολλά καὶ ἔλεγεν αὐτοῖς', 29, 1), true, false],
  ['ch15-speller-greek-keyboard', spellerKeyboard('chapt_15', 'c15_ex_speller_forms')],
  ['ch15-verse-speller-greek-keyboard', spellerKeyboard('chapt_15', 'c15_ex_scripture_speller')],
  // 5I-SPEC2 §5.2/§5.3/§4.5. The three-chart bundle is gone: 16_FAPAS.TBK
  // 0xb5e30 routes the Parsing Drill's six grapho forms to a SINGLE grapho
  // chart and everything else to the luo pair, and 0xc08a7 shows the
  // Translation Drill the luo pair unconditionally -- the grapho chart never
  // appears on that drill at all. And the Form Drill's stem table is ONE list
  // under a frozen header (§4.9), not two halves.
  ['ch16-parsing-hint-luw-first-aorist',
    hintAtPrompt('chapt_16', 'c16_drill_parsing', 'λυθήσονται', 18, 0), true, false],
  ['ch16-parsing-hint-luw-future',
    hintAtPrompt('chapt_16', 'c16_drill_parsing', 'λυθήσονται', 18, 1), true, false],
  ['ch16-parsing-hint-grapho',
    hintAtPrompt('chapt_16', 'c16_drill_parsing', 'ἐγράφημεν', 18)],
  ['ch16-translation-hint-luw-first-aorist', hint('chapt_16', 'c16_drill_translation', false, 0), true, false],
  ['ch16-translation-hint-luw-future', hint('chapt_16', 'c16_drill_translation', false, 1), true, false],
  ['ch16-forms-hint-stems-one-list', hint('chapt_16', 'c16_drill_forms', false)],
  ['ch16-speller-greek-keyboard', spellerKeyboard('chapt_16', 'c16_ex_speller_forms')],
  ['ch16-verse-speller-greek-keyboard', spellerKeyboard('chapt_16', 'c16_ex_scripture_speller')],
  ['settings-clear-audio-confirm', async () => {
    await go('#/settings');
    await page.getByRole('button', { name: 'Clear downloaded audio', exact: true }).click();
    await page.waitForTimeout(180);
  }]
];

const report = [];
let bad = 0;
for (const { name, width, height } of VIEWPORTS) {
  await page.setViewportSize({ width, height });
  for (const [label, open, expectHintControls = false, expectHintSay = false] of SURFACES) {
    try {
      await open();
    } catch (e) {
      const error = e.message.split('\n')[0];
      console.log(`BAD  ${label} @ ${name}: ${error}`);
      bad += 1;
      report.push({ viewport: name, width, height, surface: label, error, ok: false });
      continue;
    }
    if (await page.locator('.modal-overlay').count() === 0) {
      const error = 'no modal opened';
      console.log(`BAD  ${label} @ ${name}: ${error}`);
      bad += 1;
      report.push({ viewport: name, width, height, surface: label, error, ok: false });
      continue;
    }

    // AT REST. Nothing is scrolled before this measurement or this capture.
    const rest = await page.evaluate(() => {
      const ov = document.querySelector('.modal-overlay');
      const modal = ov.querySelector('.modal');
      const m = modal.getBoundingClientRect();
      const action = [...modal.querySelectorAll('.modal-actions .btn')].pop();
      const a = action ? action.getBoundingClientRect() : null;
      const hintControls = modal.querySelector('[data-hint-paradigm-controls]');
      const hc = hintControls ? hintControls.getBoundingClientRect() : null;
      const hintSay = modal.querySelector('[data-hint-paradigm-say]');
      const hs = hintSay ? hintSay.getBoundingClientRect() : null;
      // 5I: WHICH control a disclosed bundle draws depends on how many charts
      // it holds -- the DISCLOSURE-RULES 4.1 single toggle at two, the 4.2
      // Back/More pair at three or more. Chapter 15's four-chart hint and
      // chapter 16's three-chart one are the first 3+ bundles inside a modal,
      // and asserting only against the toggle would have reported them BAD for
      // drawing the control the sheet actually asks for. Measure whichever the
      // state draws; the assertion below is the same either way -- the control
      // does not move when the content under it does.
      const hintToggle = modal.querySelector('[data-hint-paradigm-toggle], [data-hint-paradigm-controls] .pg-nav');
      const ht = hintToggle ? hintToggle.getBoundingClientRect() : null;
      const bar = sel => { const el = document.querySelector(sel); return el ? el.getBoundingClientRect() : null; };
      const tb = bar('.topbar'), bb = bar('.bottom-bar');
      return {
        top: Math.round(m.top), bottom: Math.round(m.bottom),
        left: Math.round(m.left), right: Math.round(m.right),
        action: a ? { top: Math.round(a.top), bottom: Math.round(a.bottom) } : null,
        hintControls: hc ? {
          top: Math.round(hc.top), bottom: Math.round(hc.bottom),
          left: Math.round(hc.left), right: Math.round(hc.right)
        } : null,
        hintSay: hs ? {
          top: Math.round(hs.top), bottom: Math.round(hs.bottom),
          left: Math.round(hs.left), right: Math.round(hs.right)
        } : null,
        hintToggle: ht ? {
          top: Math.round(ht.top), bottom: Math.round(ht.bottom),
          left: Math.round(ht.left), right: Math.round(ht.right)
        } : null,
        ceiling: tb ? Math.round(tb.bottom) : 0,
        floor: bb ? Math.round(bb.top) : window.innerHeight,
        overlayRange: ov.scrollHeight - ov.clientHeight,
        contentRange: (() => { const sc = modal.querySelector('.modal-scroll'); return sc ? sc.scrollHeight - sc.clientHeight : 0; })(),
        vh: window.innerHeight
      };
    });
    await page.screenshot({ path: `${OUT}/${name}--${label}--1-at-rest.png` });

    // Then scroll the modal's CONTENT to its end, to show the action block
    // staying pinned while the content moves under it.
    const scrolled = await page.evaluate(() => {
      const ov = document.querySelector('.modal-overlay');
      const modal = ov.querySelector('.modal');
      const scroller = modal.querySelector('.modal-scroll');
      if (scroller) scroller.scrollTop = scroller.scrollHeight;
      const m = modal.getBoundingClientRect();
      const action = [...modal.querySelectorAll('.modal-actions .btn')].pop();
      const a = action ? action.getBoundingClientRect() : null;
      const hintControls = modal.querySelector('[data-hint-paradigm-controls]');
      const hc = hintControls ? hintControls.getBoundingClientRect() : null;
      // 5I: WHICH control a disclosed bundle draws depends on how many charts
      // it holds -- the DISCLOSURE-RULES 4.1 single toggle at two, the 4.2
      // Back/More pair at three or more. Chapter 15's four-chart hint and
      // chapter 16's three-chart one are the first 3+ bundles inside a modal,
      // and asserting only against the toggle would have reported them BAD for
      // drawing the control the sheet actually asks for. Measure whichever the
      // state draws; the assertion below is the same either way -- the control
      // does not move when the content under it does.
      const hintToggle = modal.querySelector('[data-hint-paradigm-toggle], [data-hint-paradigm-controls] .pg-nav');
      const ht = hintToggle ? hintToggle.getBoundingClientRect() : null;
      return {
        top: Math.round(m.top), bottom: Math.round(m.bottom),
        action: a ? { top: Math.round(a.top), bottom: Math.round(a.bottom) } : null,
        hintControls: hc ? {
          top: Math.round(hc.top), bottom: Math.round(hc.bottom),
          left: Math.round(hc.left), right: Math.round(hc.right)
        } : null,
        hintToggle: ht ? {
          top: Math.round(ht.top), bottom: Math.round(ht.bottom),
          left: Math.round(ht.left), right: Math.round(ht.right)
        } : null
      };
    });
    await page.screenshot({ path: `${OUT}/${name}--${label}--2-content-scrolled.png` });

    const topOk = rest.top >= rest.ceiling - 1;
    const bottomOk = rest.bottom <= rest.floor + 1;
    const actionOk = !rest.action || (rest.action.top >= rest.ceiling - 1 && rest.action.bottom <= rest.floor + 1);
    const fitsOk = rest.overlayRange === 0;
    // The pinned block must not have moved when the content did.
    const pinnedOk = !rest.action || !scrolled.action
      || Math.abs(rest.action.bottom - scrolled.action.bottom) <= 1;
    const hintControlsVisibleOk = !expectHintControls || (rest.hintControls
      && rest.hintControls.top >= rest.ceiling - 1
      && rest.hintControls.bottom <= rest.floor + 1);
    const hintControlsPinnedOk = !expectHintControls || (rest.hintControls && scrolled.hintControls
      && Math.abs(rest.hintControls.top - scrolled.hintControls.top) <= 1
      && Math.abs(rest.hintControls.bottom - scrolled.hintControls.bottom) <= 1
      && Math.abs(rest.hintControls.left - scrolled.hintControls.left) <= 1
      && Math.abs(rest.hintControls.right - scrolled.hintControls.right) <= 1);
    const hintControlsInsideOk = !expectHintControls || (rest.hintControls
      && rest.hintControls.top >= rest.top - 1 && rest.hintControls.bottom <= rest.bottom + 1
      && rest.hintControls.left >= rest.left - 1 && rest.hintControls.right <= rest.right + 1);
    const hintTogglePinnedOk = !expectHintControls || (rest.hintToggle && scrolled.hintToggle
      && Math.abs(rest.hintToggle.top - scrolled.hintToggle.top) <= 1
      && Math.abs(rest.hintToggle.left - scrolled.hintToggle.left) <= 1);
    const hintOrderOk = !expectHintSay || (rest.hintSay && rest.hintToggle
      && Math.abs(rest.hintSay.top - rest.hintToggle.top) <= 1
      && Math.abs(rest.hintSay.bottom - rest.hintToggle.bottom) <= 1
      && rest.hintToggle.left >= rest.hintSay.right - 1);
    const ok = topOk && bottomOk && actionOk && fitsOk && pinnedOk
      && hintControlsVisibleOk && hintControlsPinnedOk && hintControlsInsideOk
      && hintTogglePinnedOk && hintOrderOk;
    if (!ok) bad += 1;
    console.log(`${ok ? 'OK  ' : 'BAD '} ${name.padEnd(24)} ${label.padEnd(34)} modal ${String(rest.top).padStart(4)}..${String(rest.bottom).padStart(4)} in ${String(rest.ceiling).padStart(3)}..${String(rest.floor).padStart(4)}  overlay ${String(rest.overlayRange).padStart(4)}  content ${String(rest.contentRange).padStart(5)}  pinned ${pinnedOk}${expectHintControls ? `  hint-controls ${hintControlsPinnedOk}/${hintControlsInsideOk} toggle ${hintTogglePinnedOk}${expectHintSay ? ` right-of-say ${hintOrderOk}` : ''}` : ''}`);
    report.push({
      viewport: name, width, height, surface: label,
      expectHintControls, expectHintSay, atRest: rest, afterContentScroll: scrolled, ok
    });
  }
}

// ===========================================================================
// 5I-SPEC2 §3.2 — THE HALF-SCREEN MODAL GUARD.
//
// Nathanael's ask in as many words: "add a guard to ensure THIS DOES NOT REVERT
// AGAIN". The bug is a modal that opens at roughly half height after an iOS
// SCREENSHOT — with no modal open at the time, on a page that has no modal —
// and it is fixed by killing and reopening the app, which is nothing but a
// fresh measurement. On iOS a screenshot can background and foreground a
// standalone PWA; the app is handed a stale, shrunken viewport reading, latches
// it into `--modal-vh`, and every later modal is sized from it.
//
// THE SCRIPTABLE PROXY. Headless Chromium cannot be screenshotted by iOS, but
// every ingredient of the failure can be forged, and forging them is a stricter
// test than the device would be:
//   * `visualViewport.height` AND `window.innerHeight` are both overridden to
//     45% of the real height. Both, deliberately: the pre-existing W4.2 clamp
//     compares one against the other, and in a standalone PWA — the only way
//     this app is used — the keyboard shrinks both, so a stale reading agrees
//     with itself and that clamp sees nothing wrong. This is the exact hole the
//     5I regression came through.
//   * an ordinary `resize` is delivered FIRST, before any foreground event,
//     because iOS is free to do that and a fix whose reference had already
//     swallowed the bad number would be no fix at all;
//   * then the foreground events a screenshot really does deliver.
//
// THREE ASSERTIONS, in order:
//   G1 the proxy is REAL — with the fakes installed and a plain resize, the
//      published height does drop. If this stops failing, the proxy has stopped
//      reproducing anything and the two assertions under it are worthless.
//   G2 the RESUME CLAMP refuses it — after the foreground events, `--modal-vh`
//      is back at the true height even though the forged readings are still in
//      place, and the open modal is full height again.
//   G3 the SETTLE CHAIN finds the truth — with the fakes removed and NO further
//      event fired, the published height stays correct on its own. One rAF, the
//      pre-5I behaviour, fires long before the viewport settles; this is what
//      makes the app re-ask instead of latching whatever it saw first.
// Plus G4, a source assertion: the constants and the DO-NOT-TRIM comment block
// are still in src/lib/viewport.js, so a refactor cannot quietly remove the
// machinery while leaving a passing behavioural test that no longer tests it.
{
  const guard = [];
  const gcheck = (label, ok, detail = '') => {
    guard.push({ label, ok, detail });
    if (!ok) bad += 1;
    console.log(`${ok ? 'OK  ' : 'BAD '} §3.2 guard  ${label}${detail ? `  ${detail}` : ''}`);
  };

  // A TALL modal, deliberately: the symptom being guarded against is a modal
  // at half height, and only a dialog whose content exceeds the available
  // height has its box governed by `--modal-vh` at all. Chapter 16's Passive
  // Stems hint is fifteen rows and is the tallest in the app.
  await page.setViewportSize({ width: 390, height: 844 });
  await go('#/activity/chapt_16/c16_drill_forms');
  await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
  await page.waitForTimeout(250);

  const readState = () => page.evaluate(() => {
    const modal = document.querySelector('.modal-overlay .modal');
    return {
      modalVh: parseInt(document.documentElement.style.getPropertyValue('--modal-vh'), 10) || 0,
      modalHeight: modal ? Math.round(modal.getBoundingClientRect().height) : 0
    };
  });

  const baseline = await readState();
  gcheck('G0 the guard is pointed at a modal tall enough to be governed by --modal-vh',
    baseline.modalVh > 0 && baseline.modalHeight > baseline.modalVh * 0.6,
    `--modal-vh ${baseline.modalVh}px, modal ${baseline.modalHeight}px`);

  // Forge the stale reading and deliver it the way iOS would: as a resize, with
  // no foreground event anywhere near it.
  await page.evaluate(() => {
    window.__fakeHeight = Math.round(window.innerHeight * 0.45);
    Object.defineProperty(window, 'innerHeight', { configurable: true, get: () => window.__fakeHeight });
    if (window.visualViewport) {
      Object.defineProperty(window.visualViewport, 'height', { configurable: true, get: () => window.__fakeHeight });
    }
    if (window.visualViewport) window.visualViewport.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('resize'));
  });
  await page.waitForTimeout(300);
  const phantom = await readState();
  gcheck('G1 the forged stale viewport really does shrink the published height and the modal with it',
    phantom.modalVh > 0 && phantom.modalVh < baseline.modalVh * 0.75
      && phantom.modalHeight < baseline.modalHeight * 0.75,
    `--modal-vh ${baseline.modalVh} -> ${phantom.modalVh}px, modal ${baseline.modalHeight} -> ${phantom.modalHeight}px`);

  // Now the screenshot's own return path. The forged readings STAY in place:
  // what is being tested is that the app refuses them, not that it happens to
  // measure after they are gone.
  await page.evaluate(() => {
    window.dispatchEvent(new Event('focus'));
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('pageshow'));
  });
  await page.waitForTimeout(200);
  const resumed = await readState();
  gcheck('G2 the resume clamp refuses the phantom and the modal is full height again',
    resumed.modalVh >= baseline.modalVh - 2
      && resumed.modalHeight >= baseline.modalHeight - 2,
    `--modal-vh ${resumed.modalVh}px (baseline ${baseline.modalVh}px), modal ${resumed.modalHeight}px (baseline ${baseline.modalHeight}px)`);

  // THE SETTLE CHAIN, isolated. Mid-resume, and with NO event to announce it,
  // the viewport becomes a real, plausible, DIFFERENT height. Only a re-measure
  // can find that: the single rAF the pre-5I code scheduled fired long ago, and
  // the value on screen is the clamp's substitute rather than a reading. If the
  // published height follows the viewport to its new value, something looked
  // again.
  await page.evaluate(() => { window.__fakeHeight = 800; });
  await page.waitForTimeout(500);
  const settled = await readState();
  gcheck('G3 the settle chain re-measures after the resume, with no further event',
    settled.modalVh === 800,
    `--modal-vh ${settled.modalVh}px, expected 800px (modal ${settled.modalHeight}px)`);
  // Hand the page its real viewport back before anything else runs.
  await page.evaluate(() => {
    delete window.innerHeight;
    if (window.visualViewport) delete window.visualViewport.height;
    window.dispatchEvent(new Event('resize'));
  });
  await page.waitForTimeout(200);

  const source = readFileSync('src/lib/viewport.js', 'utf8');
  const marks = ['5I-SPEC2 §3.2', 'DO NOT TRIM THIS BLOCK', 'RESUME_WINDOW_MS',
    'RESUME_SETTLE_MS', 'SHRINK_CONFIRM_MS', 'lastGoodHeight'];
  const missing = marks.filter(mark => !source.includes(mark));
  gcheck('G4 the clamp and its DO-NOT-TRIM block are still in src/lib/viewport.js',
    missing.length === 0, missing.length ? `missing ${missing.join(', ')}` : '');

  report.push({ guard: '5I-SPEC2 §3.2 screenshot path', baseline, phantom, resumed, settled, checks: guard });
}

writeFileSync(`${OUT}/modal-report.json`, JSON.stringify(report, null, 1));
console.log(`\n${report.length - bad}/${report.length} modal states clean -> ${OUT}`);
await browser.close();
process.exit(bad ? 1 : 0);
