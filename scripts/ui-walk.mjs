// VISUAL VERIFICATION WALKER (5D-SPEC2 §0).
//
// Round 1 shipped four teaching pages with flattened formatting and passed its
// own tests, because "the string is in the JSON" is not verification. This
// script drives the REAL UI with playwright-core: it opens every stop on a
// chapter's sequential rail at 320px and 768px, screenshots it, and dumps the
// rendered text/emphasis structure of every teaching page so a diff against
// the DOSBox originals is mechanical rather than a squint.
//
//   node scripts/ui-walk.mjs [--chapters=chapt_1,chapt_2,chapt_3] [--out=DIR]
//
// It expects a preview server on PORT (default 4173): `npm run preview`.
// Everything a machine can settle must be settled here before a VERIFY
// document reaches Nathanael; his time is for judgement calls.

import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2)
  .filter(a => a.startsWith('--'))
  .map(a => { const i = a.indexOf('='); return i === -1 ? [a.slice(2), true] : [a.slice(2, i), a.slice(i + 1)]; }));

const BASE = args.base || `http://localhost:${args.port || 4173}`;
const OUT = args.out || 'buildout/screenshots/5d-spec2';
const WIDTHS = [{ name: '320', width: 320, height: 900 }, { name: '768', width: 768, height: 1100 }];
const CHAPTERS = String(args.chapters || 'chapt_1,chapt_2,chapt_3').split(',');

const dataFor = id => JSON.parse(readFileSync(`src/data/chapt-0${id.split('_')[1]}.json`, 'utf8'));

mkdirSync(OUT, { recursive: true });

// The structural dump: what is on the page and how it is set apart. Text alone
// hid every round-1 defect, so emphasis, list markers, colour role and tap
// targets come out with it.
const EXTRACT = () => {
  const roleOf = el => {
    const cls = el.className || '';
    if (/rc-lead-plain|rc-strong/.test(cls)) return 'bold';
    if (/term-green/.test(cls)) return 'green';
    if (el.tagName === 'U' || /rc-lead(\b|-u)/.test(cls)) return 'underline';
    if (/greek-tap|greek-say/.test(cls)) return 'tappable';
    return null;
  };
  const card = document.querySelector('.card');
  if (!card) return { text: '', marked: [], taps: [] };
  const marked = [...card.querySelectorAll('u, .rc-lead, .rc-lead-u, .rc-lead-plain, .term-green')]
    .map(el => ({ role: roleOf(el), text: el.textContent.trim() }));
  // Which words are tappable is a fidelity question (directive 9), so the dump
  // names them: prose taps, chart rows, paradigm cells and the lemma.
  const taps = [...card.querySelectorAll('button.greek-tap, button.greek-say, button.pg-cell:not([disabled]), button.pg-lemma, button.rv-greek, button.ilv-word:not([disabled])')]
    .map(el => (el.querySelector('.greek') || el).textContent.trim()).filter(Boolean);
  const lists = [...card.querySelectorAll('ol')].map(ol => ({
    marker: getComputedStyle(ol).listStyleType,
    items: [...ol.children].map(li => li.textContent.replace(/\s+/g, ' ').trim())
  }));
  const paras = [...card.querySelectorAll('p.rc-para')].map(p => ({
    example: p.classList.contains('example-block'),
    strong: p.classList.contains('rc-strong'),
    indent: p.classList.contains('rc-indent'),
    text: p.innerText
  }));
  return {
    heading: (card.querySelector('.topic-heading, .rc-heading') || {}).textContent || '',
    text: card.innerText,
    marked, taps, lists, paras,
    // Silent horizontal clipping is the failure mode this app cannot see:
    // overflow-x is hidden app-wide, so a too-wide grid loses its right edge
    // with nothing to scroll and nothing to error.
    overflow: [...card.querySelectorAll('*')]
      .filter(el => el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0)
      .map(el => ({ cls: String(el.className).slice(0, 60), scroll: el.scrollWidth, client: el.clientWidth })),
    docOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  };
};

const report = { base: BASE, chapters: {}, consoleErrors: [] };
const browser = await chromium.launch();

for (const size of WIDTHS) {
  const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  page.on('console', m => {
    if (m.type() !== 'error') return;
    const t = m.text();
    // Known preview artifacts, not bugs (CHAT-HANDOFF): revoked blob: URLs on
    // fast route exits and /audio/* with no audio shipped to the preview.
    if (/ERR_FILE_NOT_FOUND|blob:|\/audio\//.test(t)) return;
    report.consoleErrors.push({ width: size.name, url: page.url(), text: t });
  });
  page.on('pageerror', e => report.consoleErrors.push({ width: size.name, url: page.url(), text: String(e) }));

  for (const chapterId of CHAPTERS) {
    const data = dataFor(chapterId);
    const stops = data.sequence || [];
    report.chapters[chapterId] ||= { stops: {} };
    for (const activityId of stops) {
      await page.goto(`${BASE}/#/activity/${chapterId}/${activityId}`, { waitUntil: 'load' });
      await page.waitForSelector('.card, .pending-verification', { timeout: 15000 }).catch(() => {});
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(180);
      const dir = join(OUT, size.name, chapterId);
      mkdirSync(dir, { recursive: true });
      await page.screenshot({ path: join(dir, `${activityId}.png`), fullPage: true });
      const shot = await page.evaluate(EXTRACT);
      report.chapters[chapterId].stops[activityId] ||= {};
      report.chapters[chapterId].stops[activityId][size.name] = shot;

      // topicPages: every topic is its own screen, and every one of them was a
      // round-1 defect site. Step through the lot.
      const topicCount = await page.locator('.topic-count').count();
      if (topicCount) {
        const label = await page.locator('.topic-count').first().innerText();
        const total = Number((label.match(/of\s+(\d+)/) || [])[1] || 1);
        const topics = [];
        for (let i = 0; i < total; i++) {
          if (i > 0) {
            await page.getByRole('button', { name: 'Next Topic' }).click();
            await page.waitForTimeout(160);
          }
          await page.screenshot({ path: join(dir, `${activityId}--topic${i + 1}.png`), fullPage: true });
          topics.push(await page.evaluate(EXTRACT));
        }
        report.chapters[chapterId].stops[activityId][size.name].topics = topics;
      }
    }
  }
  await context.close();
}

await browser.close();
writeFileSync(join(OUT, 'walk-report.json'), JSON.stringify(report, null, 1));

const stops = Object.values(report.chapters).reduce((n, c) => n + Object.keys(c.stops).length, 0);
const clipped = [];
for (const [chapterId, c] of Object.entries(report.chapters)) {
  for (const [activityId, byWidth] of Object.entries(c.stops)) {
    for (const [width, shot] of Object.entries(byWidth)) {
      const screens = [shot, ...(shot.topics || [])];
      if (screens.some(s => s.docOverflow || (s.overflow || []).length)) clipped.push(`${chapterId}/${activityId} @${width}`);
    }
  }
}
console.log(`walked ${stops} stops x ${WIDTHS.length} widths -> ${OUT}`);
console.log(clipped.length ? `HORIZONTAL OVERFLOW: ${clipped.join(', ')}` : 'no horizontal overflow anywhere');
console.log(report.consoleErrors.length ? `CONSOLE ERRORS: ${report.consoleErrors.length}` : 'no console errors');
if (report.consoleErrors.length) console.log(JSON.stringify(report.consoleErrors.slice(0, 10), null, 1));
