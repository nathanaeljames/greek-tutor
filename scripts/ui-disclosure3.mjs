// DISCLOSURE-SPEC3 W2: initial-load behavior on the shipped UI.
//
// This is deliberately a census, not a sample. It first partitions every
// activity in every chapter into changed / already-loaded / exempted, then
// directly exercises every activity whose visible mount contract changed or
// is intentionally exempt. The per-activity ledger remains the authority for
// drill/exercise timing; Learn steppers are classified by their renderer.
//
//   npm run preview
//   node scripts/ui-disclosure3.mjs [--list]

// --list prints the complete 219-row classification after the assertions.

import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:4173';
const LIST = process.argv.includes('--list');
const SECTION_NAMES = ['learn', 'drill', 'exercise', 'quickReview'];
const SEQUENCE_MODES = new Set(['stepper', 'flashcard', 'selfCheckStepper', 'selfCheckSequence']);

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok: !!ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  - ${detail}` : ''}`);
};
const normalize = value => String(value ?? '').replace(/\s+/g, ' ').trim().normalize('NFC');

const chapters = new Map();
const lexicons = new Map();
for (let number = 1; number <= 10; number += 1) {
  const nn = String(number).padStart(2, '0');
  chapters.set(`chapt_${number}`, JSON.parse(readFileSync(`src/data/chapt-${nn}.json`, 'utf8')));
  lexicons.set(`chapt_${number}`, JSON.parse(readFileSync(`src/data/lexicon-chapt${nn}.json`, 'utf8')));
}

// The first three ledger columns contain no quoted commas, so this extracts
// the authoritative row number/activity id without pretending to parse the
// free-form Notes column as a second CSV implementation.
const ledgerRows = new Map();
for (const line of readFileSync('buildout/DRILLBEHAVIORLEDGER.csv', 'utf8').split(/\r?\n/).slice(1)) {
  const match = line.match(/^(\d+),(\d+),([^,]+),/);
  if (match) ledgerRows.set(match[3], Number(match[1]));
}

const stored = [];
const sequenced = [];
const byId = new Map();
for (const [chapterId, chapter] of chapters) {
  const chapterActivities = [];
  for (const section of SECTION_NAMES) {
    for (const activity of chapter[section] || []) {
      const entry = { chapterId, chapter, section, activity };
      chapterActivities.push(entry);
      stored.push(entry);
      byId.set(activity.id, entry);
    }
  }
  const local = new Map(chapterActivities.map(entry => [entry.activity.id, entry]));
  for (const id of chapter.sequence || []) {
    const entry = local.get(id);
    if (entry) sequenced.push(entry);
  }
}

function classify(entry) {
  const { activity } = entry;
  const ledgerRow = ledgerRows.get(activity.id) || null;
  if (!activity.categories && activity.type === 'contentAudio' && SEQUENCE_MODES.has(activity.mode)) {
    return {
      status: 'changed',
      basis: ledgerRow ? `ledger #${ledgerRow}` : `Learn ${activity.mode} stepper`,
      ledgerRow
    };
  }
  if (activity.audioTiming === 'afterTap') {
    return { status: 'exempted', basis: `ledger #${ledgerRow} afterTap`, ledgerRow };
  }
  return {
    status: 'already-loaded',
    basis: ledgerRow ? `ledger #${ledgerRow}` : `${activity.mode || activity.type} content`,
    ledgerRow
  };
}

const classification = sequenced.map(entry => ({ ...entry, ...classify(entry) }));
const changed = classification.filter(entry => entry.status === 'changed');
const exempted = classification.filter(entry => entry.status === 'exempted');
const alreadyLoaded = classification.filter(entry => entry.status === 'already-loaded');
const changedIds = changed.map(entry => entry.activity.id).sort();
const exemptedIds = exempted.map(entry => entry.activity.id).sort();
const EXPECTED_CHANGED = [
  'c1_ex_phonetic',
  'c1_ex_pronounce',
  'c1_learn_letters',
  ...Array.from({ length: 10 }, (_, index) => `c${index + 1}_learn_vocab`)
].sort();
const EXPECTED_EXEMPTED = [
  'c1_drill_capitals',
  'c1_drill_diphthong',
  'c1_drill_letter_names',
  'c1_drill_translit'
].sort();

const storedIds = stored.map(entry => entry.activity.id);
const sequenceIds = sequenced.map(entry => entry.activity.id);
const duplicateStored = storedIds.filter((id, index) => storedIds.indexOf(id) !== index);
const duplicateSequence = sequenceIds.filter((id, index) => sequenceIds.indexOf(id) !== index);
const missingFromSequence = storedIds.filter(id => !sequenceIds.includes(id));
const unknownInSequence = [...chapters.values()].flatMap(chapter => chapter.sequence || [])
  .filter(id => !byId.has(id));
const behaviorEntries = stored.filter(entry => entry.section === 'drill' || entry.section === 'exercise');
const missingLedger = behaviorEntries.filter(entry => !ledgerRows.has(entry.activity.id)).map(entry => entry.activity.id);
const orphanLedger = [...ledgerRows.keys()].filter(id => !byId.has(id));

check('W2.1 all ten chapter stores and rails contain exactly 219 activities',
  stored.length === 219 && sequenced.length === 219,
  `${stored.length} stored / ${sequenced.length} sequenced`);
check('W2.2 every activity appears exactly once in its chapter sequence',
  duplicateStored.length === 0 && duplicateSequence.length === 0
    && missingFromSequence.length === 0 && unknownInSequence.length === 0,
  `duplicate store [${duplicateStored}], duplicate rail [${duplicateSequence}], missing [${missingFromSequence}], unknown [${unknownInSequence}]`);
check('W2.3 every drill/exercise maps to one of the 95 exact ledger rows',
  ledgerRows.size === 95 && behaviorEntries.length === 95
    && missingLedger.length === 0 && orphanLedger.length === 0,
  `${ledgerRows.size} rows / ${behaviorEntries.length} activities; missing [${missingLedger}], orphan [${orphanLedger}]`);
check('W2.4 exhaustive classification is 13 changed / 202 already-loaded / 4 exempted',
  changed.length === 13 && alreadyLoaded.length === 202 && exempted.length === 4,
  `${changed.length} / ${alreadyLoaded.length} / ${exempted.length}`);
check('W2.5 changed classification is the exact B-last sequence-mode set',
  JSON.stringify(changedIds) === JSON.stringify(EXPECTED_CHANGED), changedIds.join(', '));
check('W2.6 exempt classification is exactly ledger rows 1-4 afterTap',
  JSON.stringify(exemptedIds) === JSON.stringify(EXPECTED_EXEMPTED)
    && exempted.map(entry => entry.ledgerRow).sort((a, b) => a - b).join(',') === '1,2,3,4',
  exempted.map(entry => `${entry.activity.id}#${entry.ledgerRow}`).join(', '));

if (LIST) {
  for (const entry of classification) {
    console.log(`CENSUS  ${entry.chapterId}\t${entry.activity.id}\t${entry.status}\t${entry.basis}`);
  }
}

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

const audioPath = id => {
  const match = String(id || '').match(/^(chapt_\d+|vocab\d*|john\d*|rev_par|rev_voc|intro)_(.+)$/);
  return match ? `/audio/${match[1]}/${match[2]}.m4a` : null;
};

function firstVocab(entry) {
  const { chapterId, chapter, activity } = entry;
  const lexicon = lexicons.get(chapterId);
  const firstItem = Array.isArray(activity.items) ? activity.items[0] : null;
  const ref = firstItem?.ref || chapter.vocab?.[0];
  const lemma = lexicon?.lemmas?.[ref] || null;
  const sense = activity.pool === 'senses' && Array.isArray(lemma?.senses)
    ? lemma.senses[0]
    : null;
  return {
    display: sense?.caseTag
      ? [sense.greek || lemma?.greek, sense.caseTag].filter(Boolean).join(' ')
      : (lemma?.lexicalForm || lemma?.greek || ''),
    audio: sense?.audio || lemma?.audio || null
  };
}

function firstExpected(entry) {
  const { chapter, activity } = entry;
  if (activity.id === 'c1_learn_letters') {
    return { display: chapter.alphabet.letters[0].lower, audio: chapter.alphabet.letters[0].audioFull };
  }
  if (activity.mode === 'flashcard') return firstVocab(entry);
  if (activity.mode === 'selfCheckSequence') {
    return { display: activity.items?.[0]?.display || '', audio: null };
  }
  return { display: '', audio: null };
}

const browser = await launchBrowser();
const CONTEXT_OPTIONS = {
  viewport: { width: 390, height: 900 },
  // A production preview registers the generated worker. The harness reloads
  // the same origin for every direct-load case, so an older controlling worker
  // can otherwise answer a later navigation with stale application assets.
  // Offline behavior has its own harness; this one must inspect the build at
  // BASE and nothing cached in front of it.
  serviceWorkers: 'block'
};
const context = await browser.newContext(CONTEXT_OPTIONS);
await context.addInitScript(() => {
  const Native = window.Audio;
  window.__w2Audio = [];
  function Wrapped(src) {
    const element = new Native(src);
    const record = { src, attemptedAt: null, rejected: null };
    window.__w2Audio.push(record);
    const nativePlay = element.play.bind(element);
    element.play = () => {
      record.attemptedAt = Date.now();
      return nativePlay().catch(error => {
        record.rejected = error && error.name;
        throw error;
      });
    };
    return element;
  }
  Wrapped.prototype = Native.prototype;
  window.Audio = Wrapped;
});

const page = await context.newPage();
const audioRequests = [];
page.on('request', request => {
  const url = request.url();
  if (/\/audio\/.*\.m4a(?:\?|$)/.test(url)) audioRequests.push(new URL(url).pathname);
});
let nav = 0;
const go = async (hash, activityTitle, readySelector) => {
  const requestMark = audioRequests.length;
  await page.goto(`${BASE}/?w2=${++nav}${hash}`, { waitUntil: 'load' });
  // The top bar says "Activity" while a lazy chapter is unresolved, and a
  // generic .card can belong to a loading/error shell or stale route. Require
  // the requested hash, its exact authored title, and that activity's own
  // visible item surface before measuring anything.
  await page.waitForFunction(({ expectedHash, expectedTitle }) => {
    const clean = value => String(value || '').replace(/\s+/g, ' ').trim().normalize('NFC');
    const title = document.querySelector('.topbar-title');
    return location.hash === expectedHash
      && title && clean(title.textContent) === clean(expectedTitle);
  }, { expectedHash: hash, expectedTitle: activityTitle }, { timeout: 15000 });
  await page.locator(readySelector).first().waitFor({ state: 'visible', timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(160);
  return requestMark;
};
const mountAudio = () => page.evaluate(() => (window.__w2Audio || []).map(record => ({ ...record })));
const hasBeginPrompt = () => page.locator('body').evaluate(body => /click[^.\n]{0,40}next[^.\n]{0,40}begin/i.test(body.innerText));
const activityCard = () => page.locator('.content > .card:visible').first();
const cardButton = name => activityCard().getByRole('button', { name, exact: true });

async function assertChangedMount(entry) {
  const { chapterId, chapter, activity } = entry;
  const label = `${chapterId}/${activity.id}`;
  const expected = firstExpected(entry);
  const readySelector = activity.id === 'c1_learn_letters'
    ? '.content > .card:visible .prompt.greek:visible'
    : activity.mode === 'flashcard'
      ? '.content > .card:visible .flash-pane:visible'
      : activity.mode === 'selfCheckStepper'
        ? '.content > .card:visible .prompt.greek:visible'
        : '.content > .card:visible .phonetic-band:visible';
  const requestMark = await go(
    `#/activity/${chapterId}/${activity.id}`,
    activity.title,
    readySelector
  );
  const previous = cardButton('Previous');
  const previousIsDisabled = await previous.count() === 1 && await previous.isDisabled();
  const noBegin = !await hasBeginPrompt();
  let stateOk = false;
  let stateDetail = '';

  if (activity.id === 'c1_learn_letters') {
    const prompt = normalize(await activityCard().locator('.prompt.greek:visible').first().innerText().catch(() => ''));
    const fields = await activityCard().locator('.fields:visible .field:visible').count();
    stateOk = prompt === normalize(expected.display) && fields === 3;
    stateDetail = `prompt ${JSON.stringify(prompt)}, fields ${fields}`;
  } else if (activity.mode === 'flashcard') {
    const panes = activityCard().locator('.flash-pane:visible');
    const greek = normalize(await panes.nth(0).locator('.value.greek').innerText().catch(() => ''));
    const english = normalize(await panes.nth(1).locator('.value').innerText().catch(() => ''));
    stateOk = await panes.count() === 2 && greek === normalize(expected.display) && !!english;
    stateDetail = `Greek ${JSON.stringify(greek)}, expected ${JSON.stringify(normalize(expected.display))}, English ${JSON.stringify(english)}`;
  } else if (activity.mode === 'selfCheckStepper') {
    const prompt = normalize(await activityCard().locator('.prompt.greek:visible').first().innerText().catch(() => ''));
    const letters = new Set(chapter.alphabet.letters.map(letter => normalize(letter.lower)));
    const revealedFields = await activityCard().locator('.fields:visible').count();
    stateOk = letters.has(prompt) && revealedFields === 0;
    stateDetail = `shuffled prompt ${JSON.stringify(prompt)}, revealed fields ${revealedFields}`;
  } else if (activity.mode === 'selfCheckSequence') {
    const prompt = normalize(await activityCard().locator('.phonetic-band:visible').first().innerText().catch(() => ''));
    const revealedFields = await activityCard().locator('.field:visible').count();
    stateOk = prompt === normalize(expected.display) && revealedFields === 0;
    stateDetail = `prompt ${JSON.stringify(prompt)}, revealed fields ${revealedFields}`;
  }

  check(`W2 UI ${label}: item 1 renders on direct load`, stateOk, stateDetail);
  check(`W2 UI ${label}: Previous is disabled at item 1`, previousIsDisabled,
    `${await previous.count()} Previous controls`);
  check(`W2 UI ${label}: no begin prompt renders`, noBegin);

  if (expected.audio) {
    await page.waitForFunction(() => (window.__w2Audio || []).some(record => record.attemptedAt), null,
      { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(80);
    const records = await mountAudio();
    const requested = [...new Set(audioRequests.slice(requestMark))];
    const expectedPath = audioPath(expected.audio);
    check(`W2 audio ${label}: mount attempts the exact first-item clip`,
      records.filter(record => record.attemptedAt).length === 1
        && requested.length === 1 && requested[0] === expectedPath,
      `expected ${expectedPath}; requested [${requested}]; attempts ${records.filter(record => record.attemptedAt).length}`);
  } else {
    await page.waitForTimeout(650);
    const records = await mountAudio();
    const requested = audioRequests.slice(requestMark);
    check(`W2 audio ${label}: ${activity.audioTiming || 'none'} mount stays silent`,
      records.filter(record => record.attemptedAt).length === 0 && requested.length === 0,
      `requests [${requested}], attempts ${records.filter(record => record.attemptedAt).length}`);
  }
}

for (const entry of changed) {
  try {
    await assertChangedMount(entry);
  } catch (error) {
    check(`W2 UI ${entry.chapterId}/${entry.activity.id}: direct-load assertion completed`, false,
      error && error.stack ? error.stack.split('\n')[0] : String(error));
  }
}

async function assertExemptMount(entry) {
  const { chapterId, activity } = entry;
  const label = `${chapterId}/${activity.id}`;
  const requestMark = await go(
    `#/activity/${chapterId}/${activity.id}`,
    activity.title,
    '.content > .card:visible .tile:visible'
  );
  await page.waitForTimeout(500);
  const instruction = normalize(await page.locator('.content > .instructions:visible').first().innerText().catch(() => ''));
  const tiles = activityCard().locator('.tile:visible');
  const fieldsBefore = await activityCard().locator('.fields:visible').count();
  const attemptsBefore = (await mountAudio()).filter(record => record.attemptedAt).length;
  const requestsBefore = audioRequests.slice(requestMark);
  check(`W2 exempt ${label}: authored selection instruction remains`,
    instruction === normalize(activity.instructions) && await tiles.count() > 0,
    `instruction ${JSON.stringify(instruction)}, tiles ${await tiles.count()}`);
  check(`W2 exempt ${label}: empty detail and silence remain until selection`,
    fieldsBefore === 0 && attemptsBefore === 0 && requestsBefore.length === 0 && !await hasBeginPrompt(),
    `fields ${fieldsBefore}, requests [${requestsBefore}], attempts ${attemptsBefore}`);
  await tiles.first().click();
  await activityCard().locator('.fields:visible').waitFor({ state: 'visible', timeout: 8000 });
  check(`W2 exempt ${label}: first user selection populates the detail`,
    await activityCard().locator('.fields:visible').count() === 1
      && normalize(await page.locator('.content > .instructions:visible').first().innerText()) === normalize(activity.instructions));
}

for (const entry of exempted) {
  try {
    await assertExemptMount(entry);
  } catch (error) {
    check(`W2 exempt ${entry.chapterId}/${entry.activity.id}: direct-load assertion completed`, false,
      error && error.stack ? error.stack.split('\n')[0] : String(error));
  }
}

// BLOCKED AUTOPLAY (W2). This tree HOLDS a NotAllowedError-blocked
// mount clip and releases it on the first user gesture — the
// parallel implementation suppressed and stopped. Assert THIS
// contract: one blocked attempt at mount, no toast, no console
// error, item 1 visible; then one gesture, and the held clip (and
// only the held clip) plays.
//
// A second isolated context forces the exact iOS policy rejection regardless
// of Chromium's launch policy, and then forces the UNLOCK the same way iOS
// does: window.Audio refuses every un-gestured play and accepts every play
// once a real trusted gesture has reached the window. That is the platform
// rule audio.js's armGesture is written against, so a shim that refused
// forever would be testing a browser nobody ships.
const blockedContext = await browser.newContext(CONTEXT_OPTIONS);
await blockedContext.addInitScript(() => {
  window.__w2Blocked = { attempts: [], gestured: false };
  // Registered at document-start, so these run BEFORE audio.js's armed handler
  // on the same window in the same capture phase: by the time the held clip is
  // released, the shim has already seen the unlock. Same ordering a real
  // browser gives it.
  for (const type of ['pointerdown', 'touchend', 'keydown']) {
    window.addEventListener(type, () => { window.__w2Blocked.gestured = true; }, true);
  }
  // createObjectURL is where play() turns a clip's bytes into a source, so once
  // an id has become an opaque blob: URL the blob's byte length is the only
  // handle left on WHICH clip an attempt is for. Recorded here so the released
  // clip can be proven against the first item's file on disk.
  const nativeCreateObjectURL = URL.createObjectURL.bind(URL);
  const blobBytes = new Map();
  URL.createObjectURL = blob => {
    const url = nativeCreateObjectURL(blob);
    blobBytes.set(url, blob ? blob.size : null);
    return url;
  };
  // A real Audio(src) begins loading immediately. Revoking that blob after the
  // injected rejection makes Chromium log ERR_FILE_NOT_FOUND, which tests the
  // shim rather than the app. This EventTarget has exactly the media surface
  // audio.js uses and performs no independent resource load.
  function Wrapped(src) {
    const element = new EventTarget();
    element.src = src;
    element.paused = true;
    element.ended = false;
    element.play = () => {
      const record = {
        src,
        bytes: blobBytes.has(src) ? blobBytes.get(src) : null,
        gestured: window.__w2Blocked.gestured,
        rejected: null
      };
      window.__w2Blocked.attempts.push(record);
      if (!record.gestured) {
        record.rejected = 'NotAllowedError';
        return Promise.reject(new DOMException('Autoplay is blocked for this test', 'NotAllowedError'));
      }
      element.paused = false;
      return Promise.resolve();
    };
    element.pause = () => {
      element.paused = true;
      element.dispatchEvent(new Event('pause'));
    };
    return element;
  }
  Wrapped.prototype = EventTarget.prototype;
  window.Audio = Wrapped;
});
const blockedPage = await blockedContext.newPage();
const blockedErrors = [];
blockedPage.on('pageerror', error => blockedErrors.push(`pageerror: ${error.message}`));
blockedPage.on('console', message => {
  if (message.type() === 'error') blockedErrors.push(`console: ${message.text()}`);
});
const blockedAudioRequests = [];
blockedPage.on('request', request => {
  const url = request.url();
  if (/\/audio\/.*\.m4a(?:\?|$)/.test(url)) blockedAudioRequests.push(new URL(url).pathname);
});
const blockedEntry = byId.get('c1_learn_letters');
const blockedFirstLetter = chapters.get('chapt_1').alphabet.letters[0];
const blockedClipPath = audioPath(blockedFirstLetter.audioFull);
// Read off the shipped file, not a literal: this is the size the released bytes
// must have to BE the first item's clip.
const blockedClipBytes = readFileSync(`public${blockedClipPath}`).length;
const blockedHash = '#/activity/chapt_1/c1_learn_letters';
await blockedPage.goto(`${BASE}/?w2-blocked=1${blockedHash}`, { waitUntil: 'load' });
await blockedPage.waitForFunction(({ expectedHash, expectedTitle }) => {
  const clean = value => String(value || '').replace(/\s+/g, ' ').trim().normalize('NFC');
  const title = document.querySelector('.topbar-title');
  return location.hash === expectedHash
    && title && clean(title.textContent) === clean(expectedTitle);
}, {
  expectedHash: blockedHash,
  expectedTitle: blockedEntry.activity.title
}, { timeout: 15000 });
const blockedCard = blockedPage.locator('.content > .card:visible').first();
await blockedCard.locator('.prompt.greek:visible').waitFor({ state: 'visible', timeout: 15000 });
await blockedPage.waitForFunction(() => window.__w2Blocked.attempts.length >= 1, null, { timeout: 8000 }).catch(() => {});
// Long enough that a clip released by anything other than a gesture — a timer,
// a retry, a second mount — would have surfaced as a second attempt.
await blockedPage.waitForTimeout(650);
const blockedPrompt = normalize(await blockedCard.locator('.prompt.greek:visible').first().innerText());
const expectedLetter = normalize(blockedFirstLetter.lower);
const blockedPrevious = blockedCard.getByRole('button', { name: 'Previous', exact: true });
const mountAttempts = await blockedPage.evaluate(() => window.__w2Blocked.attempts.map(a => ({ ...a })));
const blockedBegin = await blockedPage.locator('body').evaluate(body => /click[^.\n]{0,40}next[^.\n]{0,40}begin/i.test(body.innerText));
check('W2 iOS block: item 1 remains visible with Previous disabled',
  blockedPrompt === expectedLetter && await blockedPrevious.isDisabled() && !blockedBegin,
  `prompt ${JSON.stringify(blockedPrompt)}, attempts ${mountAttempts.length}`);
check('W2 iOS block: NotAllowedError is attempted once, caught, and never toasted',
  mountAttempts.length === 1 && mountAttempts[0].rejected === 'NotAllowedError'
    && await blockedPage.locator('.toast').count() === 0,
  `${mountAttempts.length} attempts (${mountAttempts.map(a => a.rejected || 'played').join(', ')}), ${await blockedPage.locator('.toast').count()} toasts`);
check('W2 iOS block: no console or page error escapes', blockedErrors.length === 0, blockedErrors.join(' | '));

// THE HOLD, RELEASED. One trusted keydown — a bare Shift, which no handler
// mounted on this route reads — is the whole gesture. It must release the clip
// the mount could not play, once, and release nothing else.
const errorsBeforeGesture = blockedErrors.length;
const requestsBeforeGesture = blockedAudioRequests.length;
await blockedPage.keyboard.press('Shift');
await blockedPage.waitForFunction(() => window.__w2Blocked.attempts.length >= 2, null, { timeout: 8000 }).catch(() => {});
// And long enough after that for a double release to land if there were one.
await blockedPage.waitForTimeout(650);
const releasedAttempts = await blockedPage.evaluate(() => window.__w2Blocked.attempts.map(a => ({ ...a })));
const released = releasedAttempts[1];
check('W2 iOS block: the first gesture releases the held clip, exactly once',
  releasedAttempts.length === 2 && !!released && released.gestured === true && released.rejected === null,
  `${releasedAttempts.length} attempts total (${releasedAttempts.map(a => `${a.gestured ? 'gestured' : 'un-gestured'}:${a.rejected || 'played'}`).join(', ')})`);
check('W2 iOS block: the released clip is the held first-item clip and nothing else',
  !!released && released.bytes === blockedClipBytes && mountAttempts[0].bytes === blockedClipBytes
    && blockedAudioRequests.slice(requestsBeforeGesture).every(path => path === blockedClipPath),
  `${blockedClipPath} is ${blockedClipBytes} bytes; mount played ${mountAttempts[0] && mountAttempts[0].bytes}, gesture played ${released && released.bytes}; requests after gesture [${blockedAudioRequests.slice(requestsBeforeGesture)}]`);
check('W2 iOS block: the release is as silent as the block — no toast, no console or page error',
  blockedErrors.length === errorsBeforeGesture && await blockedPage.locator('.toast').count() === 0,
  `${blockedErrors.slice(errorsBeforeGesture).join(' | ')}; ${await blockedPage.locator('.toast').count()} toasts`);

await blockedContext.close();
await context.close();
await browser.close();

const failed = results.filter(result => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} DISCLOSURE-SPEC3 W2 checks passed.`);
if (failed.length) {
  console.error(`Failures: ${failed.map(result => result.name).join('; ')}`);
  process.exitCode = 1;
}
