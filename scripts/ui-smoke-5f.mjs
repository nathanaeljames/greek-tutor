// SMOKE WALK, cohort 5F. Visits every activity of chapters 6, 7 and 8 in RAIL
// ORDER at the 380px phone viewport and reports, per stop: whether a card
// rendered, whether any placeholder ("pending verification" / "Unsupported
// content block" / "renderer needs updating") reached the screen, and whether
// the page logged an error.
//
// This is the cheap net under the behavioural harness: it does not assert what
// a surface DOES, it asserts that no surface is silently broken or blank. Run
// it before ui-behavior.mjs so a data/renderer mismatch is found once rather
// than as forty confusing behavioural failures.
//
//   npm run preview
//   node scripts/ui-smoke-5f.mjs [--shots=DIR]
import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync } from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:4173';
const SHOTS = (process.argv.find(a => a.startsWith('--shots=')) || '').split('=')[1] || null;
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const CHAPTERS = {
  chapt_6: JSON.parse(readFileSync('src/data/chapt-06.json', 'utf8')),
  chapt_7: JSON.parse(readFileSync('src/data/chapt-07.json', 'utf8')),
  chapt_8: JSON.parse(readFileSync('src/data/chapt-08.json', 'utf8'))
};
const SECTIONS = ['learn', 'drill', 'exercise', 'quickReview'];
const activityById = (chapter, id) => {
  for (const section of SECTIONS) {
    const hit = (chapter[section] || []).find(a => a.id === id);
    if (hit) return { ...hit, section };
  }
  return null;
};

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok: !!ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};

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
// 380px is the viewport the spec's walkthrough is specified at.
const context = await browser.newContext({ viewport: { width: 380, height: 900 } });
const page = await context.newPage();
let pageErrors = [];
page.on('pageerror', e => pageErrors.push(String(e.message || e)));
page.on('console', m => { if (m.type() === 'error') pageErrors.push(m.text()); });

let nav = 0;
const go = async hash => {
  pageErrors = [];
  await page.goto(`${BASE}/?run=${++nav}${hash}`, { waitUntil: 'load' });
  await page.waitForSelector('.card', { timeout: 15000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(120);
};

const PLACEHOLDER = /pending (content )?verification|renderer needs updating|Unsupported content block|extraction pending|arrives in a later phase|missing lemma/i;

let stops = 0;
for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
  const sequence = chapter.sequence || [];
  check(`${chapterId}: sequence lists every activity exactly once`,
    sequence.length === SECTIONS.reduce((n, s) => n + (chapter[s] || []).length, 0)
      && new Set(sequence).size === sequence.length
      && sequence.every(id => !!activityById(chapter, id)),
    `${sequence.length} in sequence, ${SECTIONS.reduce((n, s) => n + (chapter[s] || []).length, 0)} activities`);

  for (const [index, activityId] of sequence.entries()) {
    const activity = activityById(chapter, activityId);
    await go(`#/activity/${chapterId}/${activityId}`);
    stops += 1;
    const cards = await page.locator('.card').count();
    const body = await page.locator('.app-main, body').first().innerText();
    const placeholder = PLACEHOLDER.test(body) ? (body.match(PLACEHOLDER) || [''])[0] : null;
    // Nothing may pan sideways at 380px (A3).
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (SHOTS) {
      await page.screenshot({
        path: `${SHOTS}/${chapterId.replace('chapt_', 'ch')}-${String(index + 1).padStart(2, '0')}-${activityId}.png`,
        fullPage: true
      });
    }
    check(`${chapterId} ${index + 1}/${sequence.length} ${activityId} (${activity.section}/${activity.mode || activity.type}) renders`,
      cards > 0 && !placeholder && !pageErrors.length && overflow <= 0,
      [cards ? '' : 'no card', placeholder ? `placeholder "${placeholder}"` : '',
       pageErrors.length ? `errors: ${pageErrors.slice(0, 2).join(' | ')}` : '',
       overflow > 0 ? `${overflow}px of horizontal overflow` : ''].filter(Boolean).join('; '));
  }
}

await browser.close();
const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} smoke checks passed over ${stops} rail stops`);
if (failed.length) { console.log(failed.map(f => ` FAIL ${f.name} — ${f.detail}`).join('\n')); process.exit(1); }
