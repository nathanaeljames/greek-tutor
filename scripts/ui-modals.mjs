// MODAL VISUAL PASS (5E-SPEC3-RESPONSE item 2).
//
// ui-walk.mjs photographs a rail stop as it arrives, and ui-behavior.mjs
// photographs an answered drill. Neither has ever photographed a MODAL, which
// is how a dialog whose close button sat 326px below the fold on an iPhone 14
// shipped twice. This walks every modal surface in chapters 1-5 at real device
// heights and captures each one TWICE: at the top of the overlay's scroll and
// at the end of it. The pair is the evidence for Nathanael's rule — "you should
// be able to scroll until you can see the top border and bottom border of the
// modal popup on any popup in the app" — because the first image has to show
// the top border and the second the bottom border and the close control.
//
//   node scripts/ui-modals.mjs [--out=DIR] [--force]
//
// It also reports, per surface and per viewport, whether anything under the
// overlay has its own scroll region. That number must be zero: a nested
// scroller inside a position:fixed overlay is the defect, not a mitigation.

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

const hint = (chapterId, activityId, meanings) => async () => {
  await go(`#/activity/${chapterId}/${activityId}`);
  await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
  await page.waitForTimeout(180);
  if (meanings) {
    const toggle = page.locator('.modal [data-paradigm-meanings] summary');
    if (await toggle.count()) { await toggle.first().click(); await page.waitForTimeout(200); }
  }
};

const SURFACES = [
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
  }]
];

const report = [];
let bad = 0;
for (const { name, width, height } of VIEWPORTS) {
  await page.setViewportSize({ width, height });
  for (const [label, open] of SURFACES) {
    try { await open(); } catch (e) { console.log(`SKIP  ${label} @ ${name}: ${e.message.split('\n')[0]}`); continue; }
    if (await page.locator('.modal-overlay').count() === 0) { console.log(`SKIP  ${label} @ ${name}: no modal opened`); continue; }

    const atTop = await page.evaluate(() => {
      const ov = document.querySelector('.modal-overlay');
      ov.scrollTop = 0;
      const m = ov.querySelector('.modal').getBoundingClientRect();
      return { top: Math.round(m.top), range: ov.scrollHeight - ov.clientHeight };
    });
    await page.screenshot({ path: `${OUT}/${name}--${label}--1-top.png` });

    const atEnd = await page.evaluate(() => {
      const ov = document.querySelector('.modal-overlay');
      ov.scrollTop = ov.scrollHeight;
      const modal = ov.querySelector('.modal');
      const m = modal.getBoundingClientRect();
      const action = [...modal.querySelectorAll('.modal-actions .btn')].pop();
      const a = action ? action.getBoundingClientRect() : null;
      const nested = [...ov.querySelectorAll('*')].filter(el => {
        const s = getComputedStyle(el);
        return /auto|scroll/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 1;
      }).map(el => el.className || el.tagName);
      return {
        bottom: Math.round(m.bottom),
        action: a ? { top: Math.round(a.top), bottom: Math.round(a.bottom) } : null,
        nested, vh: window.innerHeight
      };
    });
    await page.screenshot({ path: `${OUT}/${name}--${label}--2-bottom.png` });

    const topOk = atTop.top >= 0 && atTop.top < height;
    const bottomOk = atEnd.bottom > 0 && atEnd.bottom <= height;
    const actionOk = !atEnd.action || (atEnd.action.top >= 0 && atEnd.action.bottom <= height);
    const cleanOk = atEnd.nested.length === 0;
    const ok = topOk && bottomOk && actionOk && cleanOk;
    if (!ok) bad += 1;
    console.log(`${ok ? 'OK  ' : 'BAD '} ${name.padEnd(24)} ${label.padEnd(34)} top ${String(atTop.top).padStart(4)}  bottom ${String(atEnd.bottom).padStart(4)}/${height}  scroll ${String(atTop.range).padStart(4)}  nested ${atEnd.nested.length}`);
    report.push({ viewport: name, width, height, surface: label, topBorder: atTop.top, bottomBorder: atEnd.bottom, overlayScrollRange: atTop.range, lastAction: atEnd.action, nestedScrollers: atEnd.nested, ok });
  }
}

writeFileSync(`${OUT}/modal-report.json`, JSON.stringify(report, null, 1));
console.log(`\n${report.length - bad}/${report.length} modal states clean -> ${OUT}`);
await browser.close();
process.exit(bad ? 1 : 0);
