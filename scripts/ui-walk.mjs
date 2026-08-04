// VISUAL VERIFICATION WALKER (5D-SPEC2 §0).
//
// Round 1 shipped four teaching pages with flattened formatting and passed its
// own tests, because "the string is in the JSON" is not verification. This
// script drives the REAL UI with playwright-core: it opens every stop on a
// chapter's sequential rail at 320px and 768px, screenshots it, and dumps the
// rendered text/emphasis structure of every teaching page so a diff against
// the DOSBox originals is mechanical rather than a squint.
//
//   node scripts/ui-walk.mjs [--chapters=chapt_1,...,chapt_5] [--out=DIR]
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
const OUT = args.out || 'buildout/screenshots/5e-spec1-sol';
const WIDTHS = [{ name: '320', width: 320, height: 900 }, { name: '768', width: 768, height: 1100 }];
const CHAPTERS = String(args.chapters || 'chapt_1,chapt_2,chapt_3,chapt_4,chapt_5').split(',');

const dataFor = id => JSON.parse(readFileSync(`src/data/chapt-0${id.split('_')[1]}.json`, 'utf8'));

mkdirSync(OUT, { recursive: true });

// playwright-core does not download a browser. Prefer its configured binary,
// then fall back to an installed Chrome/Edge channel. This keeps CI's pinned
// Chromium when it exists and makes the checked-in npm task work on the local
// Windows build seat without a machine-specific executable path.
async function launchBrowser() {
  const explicit = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
  if (explicit) return chromium.launch({ executablePath: explicit });
  try {
    return await chromium.launch();
  } catch (original) {
    for (const channel of ['chrome', 'msedge']) {
      try { return await chromium.launch({ channel }); } catch { /* try the next installed channel */ }
    }
    throw original;
  }
}

// The structural dump: what is on the page and how it is set apart. Text alone
// hid every round-1 defect, so emphasis, list markers, colour role and tap
// targets come out with it.
const EXTRACT = () => {
  const visible = el => !!el && el.getClientRects().length > 0
    && getComputedStyle(el).visibility !== 'hidden';
  const roleOf = el => {
    const cls = el.className || '';
    if (/rc-lead-plain|rc-strong/.test(cls)) return 'bold';
    if (/term-green/.test(cls)) return 'green';
    if (el.tagName === 'U' || /rc-lead(\b|-u)/.test(cls)) return 'underline';
    if (/greek-tap|greek-say/.test(cls)) return 'tappable';
    return null;
  };
  const card = [...document.querySelectorAll('.hint-modal')].find(visible)
    || document.querySelector('.card');
  if (!card) return { text: '', marked: [], taps: [] };
  const marked = [...card.querySelectorAll('u, .rc-lead, .rc-lead-u, .rc-lead-plain, .term-green')]
    .filter(visible)
    .map(el => ({ role: roleOf(el), text: el.textContent.trim() }));
  // Which words are tappable is a fidelity question (directive 9), so the dump
  // names them: prose taps, chart rows, paradigm cells and the lemma.
  const taps = [...card.querySelectorAll('button.greek-tap, button.greek-say, button.pg-cell:not([disabled]), button.pg-lemma, button.rv-greek, button.ilv-word:not([disabled])')]
    .filter(visible)
    .map(el => (el.querySelector('.greek') || el).textContent.trim()).filter(Boolean);
  const lists = [...card.querySelectorAll('ol')].filter(visible).map(ol => ({
    marker: getComputedStyle(ol).listStyleType,
    items: [...ol.children].map(li => li.textContent.replace(/\s+/g, ' ').trim())
  }));
  const paras = [...card.querySelectorAll('p.rc-para')].filter(visible).map(p => ({
    example: p.classList.contains('example-block'),
    strong: p.classList.contains('rc-strong'),
    indent: p.classList.contains('rc-indent'),
    text: p.innerText
  }));
  const root = document.documentElement;
  const structural = [...card.querySelectorAll('*')]
    .filter(el => {
      if (!el.clientWidth || el.scrollWidth <= el.clientWidth + 1) return false;
      const display = getComputedStyle(el).display;
      return /^(block|flex|grid|table|table-row-group|inline-flex|inline-grid)$/.test(display)
        && !el.matches('button, summary, .greek, .rc-greekword');
    })
    .map(el => ({
      cls: String(el.className).slice(0, 80),
      scroll: el.scrollWidth,
      client: el.clientWidth,
      overrun: Math.max(0, Math.ceil(el.scrollWidth - el.clientWidth))
    }));
  const docOverrun = Math.max(0, Math.ceil(root.scrollWidth - root.clientWidth));
  const cardOverrun = Math.max(0, Math.ceil(card.scrollWidth - card.clientWidth));
  const structuralOverrun = structural.reduce((n, item) => Math.max(n, item.overrun), 0);
  const rail = document.querySelector('.rail');
  return {
    heading: (card.querySelector('.topic-heading, .rc-heading') || {}).textContent || '',
    text: card.innerText,
    marked, taps, lists, paras,
    buttons: [...card.querySelectorAll('button:not([hidden])')]
      .filter(visible)
      .map(el => el.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean),
    expanders: [...card.querySelectorAll('details')].filter(visible).map(el => ({
      label: (el.querySelector('summary') || {}).textContent?.replace(/\s+/g, ' ').trim() || '',
      open: el.open
    })),
    rail: rail ? {
      count: (rail.querySelector('.rail-count') || {}).textContent?.trim() || '',
      previousDisabled: !!rail.querySelector('.rail-prev')?.disabled,
      nextDisabled: !!rail.querySelector('.rail-next')?.disabled
    } : null,
    // Silent horizontal clipping is the failure mode this app cannot see:
    // overflow-x is hidden app-wide, so a too-wide grid loses its right edge
    // with nothing to scroll and nothing to error. Report exact pixels, not a
    // boolean; inline Greek glyph metric noise is deliberately excluded from
    // the structural figure.
    overflow: structural,
    docOverrun,
    cardOverrun,
    structuralOverrun,
    overrunPx: Math.max(docOverrun, cardOverrun, structuralOverrun),
    docOverflow: docOverrun > 0
  };
};

const report = {
  base: BASE,
  widths: WIDTHS,
  chapters: {},
  checklistPages: [],
  overflow320: [],
  railErrors: [],
  interactionErrors: [],
  consoleErrors: []
};

const activityFor = (data, id) => Object.values(data)
  .filter(Array.isArray).flat().find(activity => activity && activity.id === id);
const slug = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'state';
const chartGroupsIn = (node, found = []) => {
  if (Array.isArray(node)) {
    node.forEach(value => chartGroupsIn(value, found));
  } else if (node && typeof node === 'object') {
    if (Array.isArray(node.charts) && node.charts.length) found.push(node);
    for (const value of Object.values(node)) chartGroupsIn(value, found);
  }
  return found;
};
const expectedChecklistPageCount = CHAPTERS.filter(id => /^chapt_[45]$/.test(id))
  .reduce((total, chapterId) => {
    const data = dataFor(chapterId);
    return total + (data.sequence || []).reduce((pages, activityId) => {
      const activity = activityFor(data, activityId);
      return pages + (activity?.mode === 'topicPages' ? activity.topics.length : 1);
    }, 0);
  }, 0);
report.expectedChecklistPages = expectedChecklistPageCount;

async function capture(page, dir, file, label) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(100);
  const path = join(dir, file);
  await page.screenshot({ path, fullPage: true });
  return { label, shot: path.replace(/\\/g, '/'), ...(await page.evaluate(EXTRACT)) };
}

// Open each visible details card separately, matching the original's one-popup
// screenshots. Then traverse every authored charts[] state. The first chart is
// already represented by the canonical page shot; later states get their own
// evidence file, and the chart is reset before rail walking continues.
async function captureInteractiveStates(page, source, prefix, record, context) {
  async function captureExpanders(statePrefix) {
    const details = page.locator('.card details.rc-expander, .card details.pg-meanings');
    const count = await details.count();
    for (let i = 0; i < count; i++) {
      const detail = details.nth(i);
      if (!await detail.isVisible()) continue;
      const summary = detail.locator('summary').first();
      if (!await summary.count()) {
        report.interactionErrors.push({ ...context, state: statePrefix, error: `expander ${i + 1} has no summary` });
        continue;
      }
      const wasOpen = await detail.evaluate(el => el.open);
      const name = (await summary.innerText()).replace(/\s+/g, ' ').trim();
      if (!wasOpen) await summary.click();
      await page.waitForTimeout(80);
      await record(`${statePrefix}--expander${i + 1}-${slug(name)}`, `expander: ${name}`);
      if (!wasOpen) {
        await summary.click();
        await page.waitForTimeout(50);
      }
    }
  }

  await captureExpanders(prefix);
  const groups = chartGroupsIn(source);
  for (const group of groups) {
    for (let index = 1; index < group.charts.length; index++) {
      const chart = group.charts[index];
      const buttonName = group.switch === 'named' ? chart.name : 'More';
      const button = page.locator('.card .paradigm').getByRole('button', { name: buttonName, exact: true }).first();
      if (!await button.count() || !await button.isVisible()) {
        report.interactionErrors.push({ ...context, state: prefix, error: `missing chart switch "${buttonName}"` });
        break;
      }
      await button.click();
      await page.waitForTimeout(80);
      const chartPrefix = `${prefix}--chart${index + 1}-${slug(chart.name || chart.lemma?.greek)}`;
      await record(chartPrefix, `chart ${index + 1}: ${chart.name || chart.lemma?.greek || ''}`);
      await captureExpanders(chartPrefix);
    }

    // Leave local chart state at chart 1. This also proves the reverse control
    // exists; ui:behavior makes the stronger content assertion.
    if (group.charts.length > 1) {
      if (group.switch === 'named') {
        const button = page.locator('.card .paradigm')
          .getByRole('button', { name: group.charts[0].name, exact: true }).first();
        if (await button.count() && await button.isVisible()) await button.click();
        else report.interactionErrors.push({ ...context, state: prefix, error: `missing named return switch "${group.charts[0].name}"` });
      } else {
        for (let index = group.charts.length - 1; index > 0; index--) {
          const button = page.locator('.card .paradigm').getByRole('button', { name: 'Back', exact: true }).first();
          if (await button.count() && await button.isVisible()) await button.click();
          else {
            report.interactionErrors.push({ ...context, state: prefix, error: 'missing Back chart switch' });
            break;
          }
        }
      }
      await page.waitForTimeout(50);
    }
  }
}

const browser = await launchBrowser();

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
    for (let stopIndex = 0; stopIndex < stops.length; stopIndex++) {
      const activityId = stops[stopIndex];
      const activity = activityFor(data, activityId);
      const evidence = { chapterId, activityId, width: size.name };
      await page.goto(`${BASE}/#/activity/${chapterId}/${activityId}`, { waitUntil: 'load' });
      await page.waitForSelector('.card, .pending-verification', { timeout: 15000 }).catch(() => {});
      const dir = join(OUT, size.name, chapterId);
      mkdirSync(dir, { recursive: true });

      const measured = [];
      const baseShot = await capture(page, dir, `${activityId}.png`, 'rail stop');
      measured.push(baseShot);
      baseShot.topics = [];
      baseShot.states = [];
      report.chapters[chapterId].stops[activityId] ||= {};
      report.chapters[chapterId].stops[activityId][size.name] = baseShot;

      const expectedRail = `${stopIndex + 1} of ${stops.length}`;
      if (!baseShot.rail || baseShot.rail.count !== expectedRail || baseShot.rail.nextDisabled) {
        report.railErrors.push({ ...evidence, expected: expectedRail, actual: baseShot.rail });
      }

      const recordExtra = async (name, label) => {
        const state = await capture(page, dir, `${name}.png`, label);
        measured.push(state);
        baseShot.states.push(state);
        return state;
      };

      // topicPages: every topic is a checklist page. Capture it at both widths,
      // then open all of that topic's expanders and switch all of its charts.
      const topicCounter = page.locator('.topic-count');
      if (await topicCounter.count()) {
        const label = await topicCounter.first().innerText();
        const total = Number((label.match(/of\s+(\d+)/) || [])[1] || 1);
        for (let i = 0; i < total; i++) {
          if (i > 0) {
            await page.getByRole('button', { name: 'Next Topic', exact: true }).click();
            await page.waitForTimeout(80);
          }
          const name = `${activityId}--topic${i + 1}`;
          const topicShot = await capture(page, dir, `${name}.png`, `topic ${i + 1}`);
          measured.push(topicShot);
          baseShot.topics.push(topicShot);
          baseShot.states.push(topicShot);
          if (/^chapt_[45]$/.test(chapterId)) {
            report.checklistPages.push({
              ...evidence,
              topic: i + 1,
              title: activity?.topics?.[i]?.title || activity?.title || activityId,
              shot: topicShot.shot,
              overrunPx: topicShot.overrunPx
            });
          }
          await captureInteractiveStates(page, activity?.topics?.[i] || {}, name, recordExtra, evidence);
        }
      } else {
        if (/^chapt_[45]$/.test(chapterId)) {
          report.checklistPages.push({
            ...evidence,
            title: activity?.title || activityId,
            shot: baseShot.shot,
            overrunPx: baseShot.overrunPx
          });
        }
        await captureInteractiveStates(page, activity || {}, activityId, recordExtra, evidence);

        // A topic-id hintRef exercises the 5E resolver through its real modal
        // host. Capture it at both widths and prove it can close cleanly.
        if (activity?.ui?.hintRef) {
          const hint = page.locator('.card').first().getByRole('button', { name: 'Hint', exact: true });
          if (!await hint.count() || !await hint.isVisible()) {
            report.interactionErrors.push({ ...evidence, state: activityId, error: 'missing Hint control' });
          } else {
            await hint.click();
            const modal = page.locator('.hint-modal');
            if (!await modal.count() || !await modal.isVisible() || !await modal.locator('.paradigm').count()) {
              report.interactionErrors.push({ ...evidence, state: activityId, error: `Hint did not open paradigm "${activity.ui.hintRef}"` });
            } else {
              await recordExtra(`${activityId}--hint`, `hint: ${activity.ui.hintRef}`);
              await modal.getByRole('button', { name: 'Close', exact: true }).click();
              await page.waitForTimeout(50);
              if (await modal.count()) report.interactionErrors.push({ ...evidence, state: activityId, error: 'Hint did not close' });
            }
          }
        }

        // The shared flashcard contract opens on an instructional state. The
        // rail walk also shows a lemma card, so capture the first rendered card
        // instead of treating the instruction alone as ten-lemma evidence.
        if (activity?.mode === 'flashcard') {
          const nextCard = page.locator('.card').first().getByRole('button', { name: 'Next', exact: true });
          if (await nextCard.count() && await nextCard.isVisible()) {
            await nextCard.click();
            await page.waitForTimeout(80);
            await recordExtra(`${activityId}--first-card`, 'first vocabulary card');
          } else {
            report.interactionErrors.push({ ...evidence, state: activityId, error: 'flashcard has no Next control' });
          }
        }
      }

      if (size.name === '320' && /^chapt_[45]$/.test(chapterId)) {
        const worst = measured.reduce((best, state) => state.overrunPx > best.overrunPx ? state : best, measured[0]);
        report.overflow320.push({
          chapterId,
          activityId,
          overrunPx: worst.overrunPx,
          state: worst.label,
          shot: worst.shot,
          docOverrun: worst.docOverrun,
          cardOverrun: worst.cardOverrun,
          structuralOverrun: worst.structuralOverrun
        });
      }
    }
  }
  await context.close();
}

await browser.close();
writeFileSync(join(OUT, 'walk-report.json'), JSON.stringify(report, null, 1));

const stops = Object.values(report.chapters).reduce((n, c) => n + Object.keys(c.stops).length, 0);
const clipped = report.overflow320.filter(item => item.overrunPx > 0);
console.log(`walked ${stops} stops x ${WIDTHS.length} widths -> ${OUT}`);
console.log(`checklist evidence: ${report.checklistPages.length} width-specific shots (${expectedChecklistPageCount} pages x ${WIDTHS.length} expected)`);
console.log('320px overflow by new-chapter rail stop:');
for (const item of report.overflow320) {
  console.log(` ${item.chapterId}/${item.activityId}: ${item.overrunPx}px${item.overrunPx ? ` (${item.state})` : ''}`);
}
console.log(clipped.length ? `HORIZONTAL OVERFLOW: ${clipped.length} new-chapter stops` : 'no horizontal overflow in chapters 4 or 5');
console.log(report.railErrors.length ? `RAIL ERRORS: ${report.railErrors.length}` : 'all rail counts and Next actions are live');
console.log(report.interactionErrors.length ? `INTERACTION ERRORS: ${report.interactionErrors.length}` : 'all authored expanders and chart states opened');
console.log(report.consoleErrors.length ? `CONSOLE ERRORS: ${report.consoleErrors.length}` : 'no console errors');
if (report.railErrors.length) console.log(JSON.stringify(report.railErrors.slice(0, 10), null, 1));
if (report.interactionErrors.length) console.log(JSON.stringify(report.interactionErrors.slice(0, 10), null, 1));
if (report.consoleErrors.length) console.log(JSON.stringify(report.consoleErrors.slice(0, 10), null, 1));
if (clipped.length || report.railErrors.length || report.interactionErrors.length || report.consoleErrors.length) process.exitCode = 1;
