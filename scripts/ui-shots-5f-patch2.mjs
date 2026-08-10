import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:4173';
const SHOTS = 'buildout/screenshots/5f-patch2';
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

// ch6
await go('#/activity/chapt_6/c6_learn_prepositions'); await nextTopic(4); await shot('ch6-prep-chart');
await go('#/activity/chapt_6/c6_qr_prepositions'); await shot('ch6-qr-prep-chart');
await go('#/activity/chapt_6/c6_learn_prepositions'); await nextTopic(5); await shot('ch6-elision');
await go('#/activity/chapt_6/c6_learn_prepositions'); await nextTopic(6); await shot('ch6-proclitics');
await go('#/activity/chapt_6/c6_learn_prepositions'); await nextTopic(7); await shot('ch6-compounds');

// ch7 English Concepts
await go('#/activity/chapt_7/c7_learn_english_concepts'); await shot('ch7-ec-definition');
await go('#/activity/chapt_7/c7_learn_english_concepts'); await nextTopic(1); await shot('ch7-ec-threeuses');
await go('#/activity/chapt_7/c7_learn_english_concepts'); await nextTopic(2); await shot('ch7-ec-examples');
// ch7 Greek Adjectives
await go('#/activity/chapt_7/c7_learn_adjectives'); await shot('ch7-adj-intro');
await go('#/activity/chapt_7/c7_learn_adjectives'); await nextTopic(1); await shot('ch7-adj-paradigm');
await go('#/activity/chapt_7/c7_learn_adjectives'); await nextTopic(3); await shot('ch7-attributive');
await go('#/activity/chapt_7/c7_learn_adjectives'); await nextTopic(4); await shot('ch7-predicate');
await go('#/activity/chapt_7/c7_learn_adjectives'); await nextTopic(5); await shot('ch7-substantive');
await go('#/activity/chapt_7/c7_learn_adjectives'); await nextTopic(6); await shot('ch7-pred-or-attr');
// ch7 eimi
await go('#/activity/chapt_7/c7_learn_eimi'); await shot('ch7-eimi-intro');
await go('#/activity/chapt_7/c7_learn_eimi'); await nextTopic(2); await shot('ch7-eimi-examples');
await go('#/activity/chapt_7/c7_learn_eimi'); await nextTopic(3); await shot('ch7-ou-ouk-ouch');
// ch7 drill hints
await go('#/activity/chapt_7/c7_drill_case');
await page.getByRole('button', { name: 'Hint', exact: true }).click(); await page.waitForTimeout(200);
await shot('ch7-case-hint-singular');
await page.locator('[data-paradigm-switch="more"]').click(); await page.waitForTimeout(150);
await shot('ch7-case-hint-plural');
await go('#/activity/chapt_7/c7_drill_translation');
await page.getByRole('button', { name: 'Hint', exact: true }).click(); await page.waitForTimeout(200);
await shot('ch7-transl-hint-p1');
await page.locator('[data-hint-page-nav="more"]').click(); await page.waitForTimeout(150);
await shot('ch7-transl-hint-p2');

// ch8
await go('#/activity/chapt_8/c8_learn_english_concepts'); await shot('ch8-ec-definition');
await go('#/activity/chapt_8/c8_learn_english_concepts'); await nextTopic(3); await shot('ch8-ec-number');
await go('#/activity/chapt_8/c8_learn_pronouns'); await shot('ch8-pron-intro');
await go('#/activity/chapt_8/c8_learn_pronouns'); await nextTopic(1); await shot('ch8-first-person');
await go('#/activity/chapt_8/c8_learn_pronouns'); await nextTopic(3); await shot('ch8-pron-examples');
await go('#/activity/chapt_8/c8_learn_pronouns'); await nextTopic(4); await shot('ch8-enclitics');
await go('#/activity/chapt_8/c8_learn_third_person'); await shot('ch8-third-intro');
await go('#/activity/chapt_8/c8_learn_third_person'); await nextTopic(1); await shot('ch8-third-paradigm-p1');
await page.locator('[data-paradigm-switch="more"]').click(); await page.waitForTimeout(150);
await shot('ch8-third-paradigm-p2');
await page.locator('[data-paradigm-switch="more"]').click(); await page.waitForTimeout(150);
await shot('ch8-third-paradigm-p3');
// autos hint pages
await go('#/activity/chapt_8/c8_drill_translation_autos');
await page.getByRole('button', { name: 'Hint', exact: true }).click(); await page.waitForTimeout(200);
await shot('ch8-autos-hint-p1');
await page.locator('[data-hint-page-nav="more"]').click(); await page.waitForTimeout(150);
await shot('ch8-autos-hint-p2');
await page.locator('[data-hint-page-nav="more"]').click(); await page.waitForTimeout(150);
await shot('ch8-autos-hint-p3');
await page.locator('[data-hint-page-nav="more"]').click(); await page.waitForTimeout(150);
await shot('ch8-autos-hint-p4-threeuses');
// first person hint (note taps)
await go('#/activity/chapt_8/c8_drill_translation');
await page.getByRole('button', { name: 'Hint', exact: true }).click(); await page.waitForTimeout(200);
await shot('ch8-firstperson-hint-notetaps');

await browser.close();
console.log('done');
