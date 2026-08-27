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
import { mkdirSync, writeFileSync, readdirSync } from 'node:fs';

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
      const hintToggle = modal.querySelector('[data-hint-paradigm-toggle]');
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
      const hintToggle = modal.querySelector('[data-hint-paradigm-toggle]');
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

writeFileSync(`${OUT}/modal-report.json`, JSON.stringify(report, null, 1));
console.log(`\n${report.length - bad}/${report.length} modal states clean -> ${OUT}`);
await browser.close();
process.exit(bad ? 1 : 0);
