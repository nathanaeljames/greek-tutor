// OFFLINE REGRESSION (ONBOARD-SOL §7, standing directive 4: offline behavior
// never regresses). Install the service worker, cut the network, walk the
// chapters' rails and refresh on an activity route.
//
// Every round has owed this check and every round has done it by hand, which
// is why it is a script now: `npm run ui:offline [-- --chapters=chapt_9,...]`,
// against a preview server. Audio is not shipped to the preview, so audio
// requests and their toasts are expected and ignored; what is proved here is
// that the shell, the chapter CHUNKS and the lexicon chunks are all precached
// and that nothing on the route path needs the network.
import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';

const args = Object.fromEntries(process.argv.slice(2)
  .filter(a => a.startsWith('--'))
  .map(a => { const i = a.indexOf('='); return i === -1 ? [a.slice(2), true] : [a.slice(2, i), a.slice(i + 1)]; }));
const CHAPTERS = String(args.chapters || 'chapt_11,chapt_12').split(',');
const BASE = process.env.BASE || `http://localhost:${args.port || 4173}`;
async function launch() {
  try { return await chromium.launch(); } catch {
    for (const channel of ['chrome', 'msedge']) {
      try { return await chromium.launch({ channel }); } catch { /* next */ }
    }
    throw new Error('no browser');
  }
}
const dataFor = id => JSON.parse(readFileSync(`src/data/chapt-${String(id.split('_')[1]).padStart(2, '0')}.json`, 'utf8'));

const browser = await launch();
const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on('console', m => {
  if (m.type() !== 'error') return;
  const t = m.text();
  if (/\/audio\/|blob:|ERR_FILE_NOT_FOUND|Failed to load resource/.test(t)) return;
  errors.push(t);
});
page.on('pageerror', e => errors.push(String(e)));

await page.goto(`${BASE}/`, { waitUntil: 'load' });
await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 30000 });
// Give the precache a moment to settle before the network is cut.
await page.waitForTimeout(1500);
await context.setOffline(true);
console.log('service worker installed; network offline');

let stops = 0;
let missing = 0;
for (const chapterId of CHAPTERS) {
  for (const activityId of dataFor(chapterId).sequence) {
    await page.goto(`${BASE}/#/activity/${chapterId}/${activityId}`, { waitUntil: 'load' });
    const ok = await page.waitForSelector('.card', { timeout: 15000 }).then(() => true).catch(() => false);
    if (!ok) { console.log(`OFFLINE MISS ${chapterId}/${activityId}`); missing += 1; continue; }
    stops += 1;
  }
}
// A REFRESH on an activity route, offline: the hardest case, because nothing
// is warm and the chunk has to come from the precache.
await page.reload({ waitUntil: 'load' });
const refreshed = await page.waitForSelector('.card', { timeout: 15000 }).then(() => true).catch(() => false);
await context.setOffline(false);
await browser.close();

console.log(`offline: ${stops} stops rendered, ${missing} missing, refresh ${refreshed ? 'OK' : 'FAILED'}`);
console.log(errors.length ? `CONSOLE ERRORS: ${errors.length}\n${errors.slice(0, 5).join('\n')}` : 'no console errors');
if (missing || !refreshed || errors.length) process.exitCode = 1;
