// TARGETED SCREENSHOTS, cohort 5F. The rail walk photographs each activity as
// it ARRIVES, which never shows a topic past the first, a popup, a second
// paradigm page or an answered drill. This file drives to the surfaces the
// spec's new-renderer section is about and photographs those.
//
//   npm run preview
//   node scripts/ui-shots-5f.mjs --shots=DIR
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:4173';
const SHOTS = (process.argv.find(a => a.startsWith('--shots=')) || '').split('=')[1] || 'buildout/screenshots/5f-detail';
mkdirSync(SHOTS, { recursive: true });

const LAUNCH = { args: ['--autoplay-policy=no-user-gesture-required'] };
async function launchBrowser() {
  const explicit = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
  if (explicit) return chromium.launch({ ...LAUNCH, executablePath: explicit });
  try { return await chromium.launch(LAUNCH); } catch (original) {
    for (const channel of ['chrome', 'msedge']) {
      try { return await chromium.launch({ ...LAUNCH, channel }); } catch { /* keep looking */ }
    }
    throw original;
  }
}
const browser = await launchBrowser();
const context = await browser.newContext({ viewport: { width: 380, height: 900 } });
const page = await context.newPage();
let nav = 0;
const go = async hash => {
  await page.goto(`${BASE}/?run=${++nav}${hash}`, { waitUntil: 'load' });
  await page.waitForSelector('.card', { timeout: 15000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
};
const shot = async name => {
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
  console.log(`shot ${name}`);
};
const nextTopic = async n => {
  for (let i = 0; i < n; i++) {
    await page.getByRole('button', { name: 'Next Topic', exact: true }).click();
    await page.waitForTimeout(120);
  }
};

// ---- chapter 6: the topic rail of Learn Greek Prepositions -----------------
const CH6_TOPICS = ['introduction', 'oneCase', 'twoCase', 'threeCase', 'prepositionsChart',
                    'elision', 'proclitics', 'compounds'];
for (const [index, name] of CH6_TOPICS.entries()) {
  await go('#/activity/chapt_6/c6_learn_prepositions');
  await nextTopic(index);
  await shot(`ch6-learn-prepositions-${index + 1}-${name}`);
}
// The Review copy of the same chart.
await go('#/activity/chapt_6/c6_qr_prepositions');
await shot('ch6-qr-prepositions-chart');

// A preposition popup, opened from the One Case panel's gloss link.
await go('#/activity/chapt_6/c6_learn_prepositions');
await nextTopic(1);
await page.locator('.rc-sense-link').first().click();
await page.waitForTimeout(150);
await shot('ch6-popup-apo');

// The Three Case panel's three sense lines, and the ἐπί popup.
await go('#/activity/chapt_6/c6_learn_prepositions');
await nextTopic(3);
await page.locator('.rc-sense-link').first().click();
await page.waitForTimeout(150);
await shot('ch6-popup-epi');

// ---- chapter 7: the οὐ / οὐκ / οὐχ popups ---------------------------------
await go('#/activity/chapt_7/c7_learn_eimi');
await nextTopic(3);
await shot('ch7-learn-eimi-4-ouOukOuch');
await page.locator('.popup-link').first().click();
await page.waitForTimeout(150);
await shot('ch7-popup-ou');

// ---- chapter 8: the three uses of αὐτός -----------------------------------
await go('#/activity/chapt_8/c8_learn_third_person');
await nextTopic(2);
await shot('ch8-learn-third-person-3-threeUses');
await page.locator('.popup-link').first().click();
await page.waitForTimeout(150);
await shot('ch8-popup-as-a-pronoun');

// The Examples page's three tappable verses.
await go('#/activity/chapt_8/c8_learn_pronouns');
await nextTopic(3);
await shot('ch8-learn-pronouns-4-examples');

// The third-person paradigm stack: Masculine, More to Feminine, More to Neuter.
await go('#/activity/chapt_8/c8_qr_third');
await shot('ch8-qr-third-1-masculine');
await page.locator('[data-paradigm-switch="more"]').click();
await page.waitForTimeout(120);
await shot('ch8-qr-third-2-feminine');
await page.locator('[data-paradigm-switch="more"]').click();
await page.waitForTimeout(120);
await shot('ch8-qr-third-3-neuter');

// The two-stage case drill: person chosen, then the pair committed.
await go('#/activity/chapt_8/c8_drill_case');
await page.locator('[data-stage="0"] .tile').first().click();
await page.waitForTimeout(120);
await shot('ch8-case-drill-person-chosen');
await page.locator('[data-stage="1"] .tile').first().click();
await page.waitForTimeout(200);
await shot('ch8-case-drill-committed');

await browser.close();
