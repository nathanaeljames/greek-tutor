// DISCLOSURE-SPEC3 checklist evidence.
//
// One screen per row of DISCLOSURE-VISUAL-CHECKLIST3-OPUS.md, photographed in a
// real browser against `npm run preview`. Separate from ui-disclosure.mjs's own
// --shots pass, which photographs what the ASSERTIONS look at; this
// photographs what NATHANAEL is being asked to look at, which is not the same
// list — the W7 rows in particular are taken at a viewport short enough to
// force the modal content to scroll, because the amended §4.3 checklist item
// says the divider is only judged in that state.
//
//   npm run preview            # in another shell
//   node scripts/shots-disclosure3.mjs [--out=DIR]

import { chromium } from 'playwright-core';
import { mkdirSync, readdirSync } from 'node:fs';

const args = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--'))
  .map(a => { const i = a.indexOf('='); return i === -1 ? [a.slice(2), true] : [a.slice(2, i), a.slice(i + 1)]; }));
const BASE = args.base || 'http://localhost:4173';
const OUT = args.out || 'buildout/screenshots/disclosure3-opus';
let existing = [];
try { existing = readdirSync(OUT); } catch { /* absent is fine */ }
if (existing.length && !args.force) {
  console.error(`REFUSING to write into ${OUT}: ${existing.length} entries already. Pass --out=DIR or --force.`);
  process.exit(2);
}
mkdirSync(OUT, { recursive: true });

async function launchBrowser() {
  const LAUNCH = { args: ['--autoplay-policy=no-user-gesture-required'] };
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
const context = await browser.newContext({ viewport: { width: 390, height: 780 } });
const page = await context.newPage();
let nav = 0;
const go = async hash => {
  await page.goto(`${BASE}/?shots=${++nav}${hash}`, { waitUntil: 'load' });
  await page.waitForSelector('.card', { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(220);
};
const topic = async n => {
  for (let i = 0; i < n; i++) {
    await page.getByRole('button', { name: 'Next Topic', exact: true }).click();
    await page.waitForTimeout(90);
  }
};
let index = 0;
const shot = async name => {
  const file = `${String(++index).padStart(2, '0')}-${name}.png`;
  await page.screenshot({ path: `${OUT}/${file}`, fullPage: true });
  console.log(file);
};
const openHint = async () => {
  await page.getByRole('button', { name: 'Hint', exact: true }).click();
  await page.waitForSelector('.modal', { timeout: 8000 });
  await page.waitForTimeout(250);
};
// The amended §4.3 checklist state: content forced to scroll, then scrolled to
// its end, so the strip above the divider is the one the eye actually reads.
const forceScroll = async () => {
  await page.setViewportSize({ width: 390, height: 520 });
  await page.waitForTimeout(200);
  await page.evaluate(() => {
    const scroller = document.querySelector('.modal .modal-scroll, .modal .pg-body');
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  });
  await page.waitForTimeout(200);
};
const restore = async () => { await page.setViewportSize({ width: 390, height: 780 }); await page.waitForTimeout(150); };

// ---- W2: initial load ------------------------------------------------------
for (const [name, hash] of [
  ['w2-ch1-learn-letters-loaded', '#/activity/chapt_1/c1_learn_letters'],
  ['w2-ch1-pronounce-letters-loaded', '#/activity/chapt_1/c1_ex_pronounce'],
  ['w2-ch1-phonetic-reading-loaded', '#/activity/chapt_1/c1_ex_phonetic'],
  ['w2-ch1-learn-vocab-loaded', '#/activity/chapt_1/c1_learn_vocab'],
  ['w2-ch5-learn-vocab-loaded', '#/activity/chapt_5/c5_learn_vocab'],
  ['w2-ch10-learn-vocab-loaded', '#/activity/chapt_10/c10_learn_vocab'],
  ['w2-ch1-letter-names-drill-EXEMPT-empty-start', '#/activity/chapt_1/c1_drill_letter_names']
]) { await go(hash); await shot(name); }

// ---- W3: the shift key -----------------------------------------------------
await go('#/activity/chapt_1/c1_ex_speller');
await shot('w3-keyboard-390-disarmed');
await page.locator('[data-speller-shift]').click();
await page.waitForTimeout(120);
await shot('w3-keyboard-390-ARMED-capital-faces');
await page.locator('.tk-letters .tk-key[data-lower="α"]').click();
await page.waitForTimeout(120);
await shot('w3-keyboard-390-after-one-shot-typed-capital');
await page.setViewportSize({ width: 320, height: 780 });
await go('#/activity/chapt_3/c3_ex_scripture_speller');
// The app scrolls .scroll-area, not the document, so a fullPage capture is the
// viewport: scroll the keyboard into it before photographing the bottom row.
await page.evaluate(() => { const a = document.querySelector('.scroll-area'); if (a) a.scrollTop = a.scrollHeight; });
await page.waitForTimeout(200);
await shot('w3-keyboard-320-verse-speller');
await restore();

// ---- W4: the half-screen bug ----------------------------------------------
{
  const clamp = await context.newPage();
  await clamp.addInitScript(() => {
    const listeners = new Set();
    const fake = { height: window.innerHeight, width: window.innerWidth, offsetTop: 0, offsetLeft: 0, scale: 1,
      addEventListener: (t, fn) => { if (t === 'resize') listeners.add(fn); },
      removeEventListener: (t, fn) => listeners.delete(fn) };
    Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => fake });
    window.__vv = { set(h) { fake.height = h; for (const fn of listeners) fn(); },
      setSilently(h) { fake.height = h; } };
  });
  await clamp.setViewportSize({ width: 390, height: 780 });
  await clamp.goto(`${BASE}/?shots=clamp#/activity/chapt_3/c3_drill_verb_translating`, { waitUntil: 'load' });
  await clamp.waitForSelector('.card', { timeout: 15000 });
  // The reported sequence: keyboard up, backgrounded, resumed with the resize
  // dropped. The published height is a phantom until something re-measures.
  await clamp.evaluate(() => window.__vv.setSilently(window.innerHeight * 0.49));
  await clamp.waitForTimeout(150);
  await clamp.getByRole('button', { name: 'Hint', exact: true }).click();
  await clamp.waitForSelector('.modal', { timeout: 8000 });
  await clamp.waitForTimeout(250);
  await clamp.screenshot({ path: `${OUT}/${String(++index).padStart(2, '0')}-w4-modal-after-phantom-height-full-size.png` });
  console.log('w4-modal-after-phantom-height-full-size.png');
  await clamp.close();
}

// ---- W5: green underline exclusivity ---------------------------------------
await go('#/activity/chapt_8/c8_learn_english_concepts');
await topic(3);
await shot('w5-ch8-number-headers-no-underline');
await go('#/activity/chapt_10/c10_learn_future_verbs');
await topic(5);
await shot('w5-ch10-present-future-headers-no-underline');
await go('#/activity/chapt_6/c6_learn_english_concepts');
await shot('w5-ch6-defrow-terms-no-underline');
await go('#/activity/chapt_7/c7_learn_adjectives');
await topic(3);
await shot('w5-ch7-example-gloss-no-underline');
await go('#/activity/chapt_2/c2_learn_grammar_review');
await shot('w5-ch2-ink-prose-underline-UNTOUCHED');

// ---- W6: title links -------------------------------------------------------
await go('#/activity/chapt_9/c9_learn_mp_verbs');
for (let i = 0; i < 6; i++) {
  const heading = await page.locator('.topic-heading').innerText().catch(() => '');
  if (/Deponent/i.test(heading)) break;
  await topic(1);
}
await shot('w6-ch9-deponent-title-link-green');
await go('#/activity/chapt_10/c10_learn_future_verbs');
for (let i = 0; i < 7; i++) {
  const heading = await page.locator('.topic-heading').innerText().catch(() => '');
  if (/εἰμί/.test(heading)) break;
  await topic(1);
}
await shot('w6-ch10-eimi-title-audio-tap-STILL-BLUE');

// ---- W7: the one divider, at forced scroll ---------------------------------
for (const [name, hash, steps] of [
  ['w7-ch7-adjective-translation-hint-GOOD-pane', '#/activity/chapt_7/c7_drill_translation', 0],
  ['w7-ch8-personal-pronoun-case-hint-WAS-BAD-pane', '#/activity/chapt_8/c8_drill_case', 0],
  ['w7-ch3-verb-translating-hint-two-screen', '#/activity/chapt_3/c3_drill_verb_translating', 0],
  ['w7-ch3-verb-translating-hint-endings-state', '#/activity/chapt_3/c3_drill_verb_translating', 1],
  ['w7-ch5-declining-hint-no-nav', '#/activity/chapt_5/c5_drill_declining', 0],
  ['w7-ch8-autos-hint-page4', '#/activity/chapt_8/c8_drill_translation_autos', 3],
  ['w7-ch2-syllable-division-hint-prose', '#/activity/chapt_2/c2_ex_syllable_division', 0],
  ['w7-ch10-parsing-hint-lone-centred-toggle', '#/activity/chapt_10/c10_drill_parsing', 0]
]) {
  await go(hash);
  await openHint();
  for (let step = 0; step < steps; step++) {
    await page.locator([
      '.modal [data-hint-paradigm-toggle]', '.modal [data-hint-page-nav="more"]',
      '.modal [data-paradigm-switch="more"]', '.modal [data-paradigm-switch="named"]',
      '.modal [data-paradigm-switch="endings"]'
    ].join(', ')).first().click();
    await page.waitForTimeout(200);
  }
  await forceScroll();
  await shot(name);
  await restore();
}

// ---- W1: the delivered data ------------------------------------------------
await go('#/activity/chapt_7/c7_learn_eimi');
await topic(3);
await shot('w1-ch7-three-negative-forms-all-tappable');
await go('#/activity/chapt_8/c8_learn_third_person');
await topic(2);
await page.locator('details.rc-expander summary', { hasText: 'Reflexive Intensifier' }).first().click();
await page.waitForTimeout(200);
await shot('w1-ch8-learn-reflexive-examples');
await go('#/activity/chapt_8/c8_drill_translation_autos');
await openHint();
for (let step = 0; step < 4; step++) {
  if (await page.locator('.modal details.rc-expander summary', { hasText: 'Reflexive Intensifier' }).count()) break;
  await page.locator('.modal [data-hint-page-nav="more"]').click();
  await page.waitForTimeout(200);
}
await page.locator('.modal details.rc-expander summary', { hasText: 'Reflexive Intensifier' }).first().click();
await page.waitForTimeout(200);
await shot('w1-ch8-drill-hint-reflexive-examples');

await browser.close();
console.log(`\n${index} screens -> ${OUT}`);
