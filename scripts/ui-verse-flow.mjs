// VERSE FLOW: every translation-drill item, measured (5I-SPEC2 sections 3.1,
// 6.2 and 7).
//
// DISCLOSURE-RULES section 4.10 says a Bible verse is CONTINUOUS text
// everywhere and breaks only where the container breaks it. That is a claim
// about 257 drill items in twelve drills, not about the two or three anyone
// would think to open, and the two things it can go wrong in -- a forced break,
// and a prompt now long enough to overrun the card -- are both invisible
// without measurement: overflow-x is hidden app-wide, so a clipped verse
// neither scrolls nor errors.
//
// So this walks EVERY item of EVERY translation drill at the 320px floor and at
// 768px and records, per render: the continuation span's computed display, the
// prompt's computed font size, the card's, page's and prompt's horizontal
// overflow, and whether the split costs a line.
//
// THE PROBE is the part worth keeping. "Does the continuation share a line with
// the head" is the WRONG question -- a verse long enough to wrap may
// legitimately wrap at the join, and 54 of 514 renders do. The right question is
// whether the split costs a line AT ALL, so the same string is laid out twice in
// the same box, once as it renders and once as a single text node, and the
// heights are compared.
//
// This is how the dead 5F type ramp was found: 514 renders reported exactly ONE
// computed prompt size, because `.prompt.two-line` had always been outranked by
// `.prompt.greek.long` on specificity (5I-SPEC2-RESULTS-OPUS section 9.3).
//
//   npm run preview            # in another shell
//   node scripts/ui-verse-flow.mjs
//
// Not wired into `npm run verify`: it is a measurement pass, run when a verse
// surface or a prompt style changes. ui-behavior.mjs carries the standing
// per-commit assertion on chapters 7 and 8.

import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:4173';
const OUT = process.env.OUT || 'buildout/screenshots/verse-flow.json';

const DRILLS = [
  ['chapt_7', 'c7_drill_translation'],
  ['chapt_7', 'c7_drill_translation_eimi'],
  ['chapt_8', 'c8_drill_translation'],
  ['chapt_8', 'c8_drill_translation_autos'],
  ['chapt_9', 'c9_drill_translation'],
  ['chapt_10', 'c10_drill_translation'],
  ['chapt_11', 'c11_drill_translation_this_that'],
  ['chapt_12', 'c12_drill_translation'],
  ['chapt_13', 'c13_drill_translation'],
  ['chapt_14', 'c14_drill_translation'],
  ['chapt_15', 'c15_drill_translation'],
  ['chapt_16', 'c16_drill_translation']
];

const data = id => JSON.parse(readFileSync(
  `src/data/chapt-${String(id.split('_')[1]).padStart(2, '0')}.json`, 'utf8'));
const activityOf = (chapter, id) => ['learn', 'drill', 'exercise', 'quickReview']
  .flatMap(k => chapter[k] || []).find(a => a && a.id === id);

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
const context = await browser.newContext({ viewport: { width: 320, height: 900 } });
const page = await context.newPage();
let nav = 0;
const go = async hash => {
  await page.goto(`${BASE}/?flow=${++nav}${hash}`, { waitUntil: 'load' });
  await page.waitForSelector('.card', { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(90);
};

const report = [];
let bad = 0;
for (const { name, width, height } of [
  { name: '320', width: 320, height: 900 },
  { name: '768', width: 768, height: 1100 }
]) {
  await page.setViewportSize({ width, height });
  for (const [chapterId, activityId] of DRILLS) {
    const activity = activityOf(data(chapterId), activityId);
    await go(`#/activity/${chapterId}/${activityId}`);
    let withCont = 0;
    for (let step = 0; step < activity.items.length; step++) {
      const row = await page.evaluate(() => {
        const prompt = document.querySelector('.card .prompt');
        if (!prompt) return null;
        const cont = prompt.querySelector('.prompt-cont');
        const card = document.querySelector('.card');
        const out = {
          text: prompt.textContent.replace(/\s+/g, ' ').trim(),
          fontSize: getComputedStyle(prompt).fontSize,
          hasCont: !!cont,
          contDisplay: cont ? getComputedStyle(cont).display : null,
          noForcedBreak: null,
          taps: document.querySelectorAll('.card .prompt.greek-say').length,
          cardOverflow: Math.ceil(card.scrollWidth - card.clientWidth),
          pageOverflow: Math.ceil(document.documentElement.scrollWidth - document.documentElement.clientWidth),
          promptOverflow: Math.ceil(prompt.scrollWidth - prompt.clientWidth)
        };
        if (cont) {
          // THE PROBE. "Does the continuation share a line with the head" is
          // the wrong question: a verse long enough to wrap may legitimately
          // wrap AT the join. The right question is whether the split costs a
          // line at all -- so the same string is laid out once as it really is
          // and once as a single text node, in a clone of the same box, and the
          // two heights are compared. Equal means nothing forced a break.
          const probe = prompt.cloneNode(true);
          probe.textContent = prompt.textContent;
          probe.style.visibility = 'hidden';
          prompt.parentNode.appendChild(probe);
          out.realHeight = Math.round(prompt.getBoundingClientRect().height);
          out.probeHeight = Math.round(probe.getBoundingClientRect().height);
          probe.remove();
          out.noForcedBreak = out.realHeight === out.probeHeight;
        }
        return out;
      });
      if (row) {
        if (row.hasCont) withCont += 1;
        const ok = row.cardOverflow <= 0 && row.pageOverflow <= 0 && row.promptOverflow <= 0
          && (!row.hasCont || (row.contDisplay === 'inline' && row.noForcedBreak === true));
        if (!ok) { bad += 1; console.log(`BAD ${name} ${activityId} ${JSON.stringify(row)}`); }
        report.push({ viewport: name, chapterId, activityId, step, ...row, ok });
      }
      const next = page.locator('.card').getByRole('button', { name: 'Next', exact: true });
      if (!await next.count() || await next.isDisabled()) break;
      await next.click();
      await page.waitForTimeout(25);
    }
    console.log(`${name} ${activityId}: ${activity.items.length} items, ${withCont} with a continuation`);
  }
}
writeFileSync(OUT, JSON.stringify(report, null, 1));
const sizes = [...new Set(report.filter(r => r.viewport === '320').map(r => r.fontSize))];
console.log(`\n${report.length - bad}/${report.length} item renders clean; prompt sizes at 320px: ${sizes.join(', ')}`);
await browser.close();
process.exit(bad ? 1 : 0);
