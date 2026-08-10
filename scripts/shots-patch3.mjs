// Targeted evidence captures for 5F-SPEC1-PATCH3 (items 1-6).
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:4173';
const SHOTS = 'buildout/screenshots/5f-patch3';
mkdirSync(SHOTS, { recursive: true });

async function launchBrowser() {
  try { return await chromium.launch(); } catch (e) {
    for (const channel of ['chrome', 'msedge']) {
      try { return await chromium.launch({ channel }); } catch {}
    }
    throw e;
  }
}
const browser = await launchBrowser();
const page = await (await browser.newContext({ viewport: { width: 380, height: 900 } })).newPage();
let nav = 0;
const go = async hash => {
  await page.goto(`${BASE}/?run=${++nav}${hash}`, { waitUntil: 'load' });
  await page.waitForSelector('.card', { timeout: 15000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
};
const shot = async name => {
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
  console.log('shot', name);
};
const nextTopic = async n => {
  for (let i = 0; i < n; i++) {
    await page.getByRole('button', { name: 'Next Topic', exact: true }).click();
    await page.waitForTimeout(120);
  }
};

// Item 1: labeled adjective stacks (learn + hint) with More/Back restored.
await go('#/activity/chapt_7/c7_learn_adjectives'); await nextTopic(1); await shot('i1-adj-paradigm-singular');
await page.locator('[data-paradigm-switch="more"]').click(); await page.waitForTimeout(150);
await shot('i1-adj-paradigm-plural');
await go('#/activity/chapt_7/c7_learn_adjectives'); await nextTopic(2); await shot('i1-2nd-adj-paradigm-singular');
await go('#/activity/chapt_7/c7_drill_case');
await page.getByRole('button', { name: 'Hint', exact: true }).click(); await page.waitForTimeout(200);
await shot('i1-case-hint-singular-titled');
await page.locator('[data-paradigm-switch="more"]').click(); await page.waitForTimeout(150);
await shot('i1-case-hint-plural-titled');

// Item 2: predicate page + hint page 2 (mappings are data; shots show taps).
await go('#/activity/chapt_7/c7_drill_translation');
await page.getByRole('button', { name: 'Hint', exact: true }).click(); await page.waitForTimeout(200);
await page.locator('[data-hint-page-nav="more"]').click(); await page.waitForTimeout(150);
await shot('i2-transl-hint-p2');

// Item 3: word + number both popup links.
await go('#/activity/chapt_7/c7_learn_eimi'); await nextTopic(3); await shot('i3-ou-ouk-ouch-links');
await page.locator('.rc-word-popup').first().click(); await page.waitForTimeout(200);
await shot('i3-word-opens-popup');

// Item 4: intro taps.
await go('#/activity/chapt_8/c8_learn_pronouns'); await shot('i4-intro-legw-taps');

// Item 5: emphatic triads on all four surfaces.
await go('#/activity/chapt_8/c8_learn_pronouns'); await nextTopic(1); await shot('i5-learn-first-note');
await go('#/activity/chapt_8/c8_learn_pronouns'); await nextTopic(2); await shot('i5-learn-second-note');
await go('#/activity/chapt_8/c8_qr_first'); await shot('i5-qr-first-note');
await go('#/activity/chapt_8/c8_qr_second'); await shot('i5-qr-second-note');

// Item 6: Review third person nav justified.
await go('#/activity/chapt_8/c8_qr_third'); await shot('i6-qr-third-p1');
await page.locator('[data-paradigm-switch="more"]').click(); await page.waitForTimeout(150);
await shot('i6-qr-third-p2-justified');

await browser.close();
console.log('done');
