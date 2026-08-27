// BEHAVIOR TESTS ON THE REAL UI (5D-SPEC2 §8).
//
// Everything a script can settle must be settled before a VERIFY document
// reaches Nathanael. Round 1's VERIFY asked him to hand-type the A4 and A6
// checking-policy tables; this file types them in a real browser and reports
// pass/fail, so his time goes to the judgement calls (does the timing feel
// right, does the layout read well, does the clip say the right word).
//
//   npm run preview            # in another shell
//   node scripts/ui-behavior.mjs [--shots=DIR]
//
// Everything here drives the SHIPPED UI — tiles, keys, buttons — never a
// component internal. If it passes here it passes because the app does it.
//
// --shots=DIR captures the ANSWERED state of every surface this file exercises
// on the correct and incorrect paths. ui-walk.mjs screenshots a rail stop as it
// ARRIVES, so no image in that corpus has ever shown a drill after an answer —
// which is exactly where every behavior change of cohort 5E lives. These are
// the states under test, photographed at the moment they are asserted.

import { chromium } from 'playwright-core';
import { readFileSync, mkdirSync } from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:4173';
const SHOTS = (process.argv.find(a => a.startsWith('--shots=')) || '').split('=')[1] || null;
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
let shotIndex = 0;
// Named by the assertion they belong to, numbered so the directory reads in
// the order the run made them.
const shot = async name => {
  if (!SHOTS) return;
  const file = `${String(++shotIndex).padStart(2, '0')}-${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`;
  await page.screenshot({ path: `${SHOTS}/${file}`, fullPage: true });
};

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok: !!ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};

const ch3 = JSON.parse(readFileSync('src/data/chapt-03.json', 'utf8'));
const ch4 = JSON.parse(readFileSync('src/data/chapt-04.json', 'utf8'));
const ch5 = JSON.parse(readFileSync('src/data/chapt-05.json', 'utf8'));
const ch1 = JSON.parse(readFileSync('src/data/chapt-01.json', 'utf8'));
const ch2 = JSON.parse(readFileSync('src/data/chapt-02.json', 'utf8'));
const ch6 = JSON.parse(readFileSync('src/data/chapt-06.json', 'utf8'));
const ch7 = JSON.parse(readFileSync('src/data/chapt-07.json', 'utf8'));
const ch8 = JSON.parse(readFileSync('src/data/chapt-08.json', 'utf8'));
const ch9 = JSON.parse(readFileSync('src/data/chapt-09.json', 'utf8'));
const ch10 = JSON.parse(readFileSync('src/data/chapt-10.json', 'utf8'));
const ch11 = JSON.parse(readFileSync('src/data/chapt-11.json', 'utf8'));
const ch12 = JSON.parse(readFileSync('src/data/chapt-12.json', 'utf8'));
const verse = (ch3.exercise.find(a => a.type === 'spellVerse').answerWords || []).join(' ');
// UNACCENTED, not unmarked (5E-SPEC2 §4.2). "With Accents" OFF forgives the
// acute, the grave and the circumflex and NOTHING else, so a fixture that
// stands in for "the learner typed it without accents" must keep every
// breathing, diaeresis and iota subscript. Stripping \p{M} here — which is
// what this helper used to do — is now itself a misspelling, and there is a
// test below that asserts exactly that.
const stripAccents = s => s.normalize('NFD').replace(/[̀́͂]/gu, '').normalize('NFC');
const stripAllMarks = s => s.normalize('NFD').replace(/\p{M}/gu, '').normalize('NFC');
// The elision marks the shared keyboard cannot type. answer-check.js treats
// all of them as punctuation, and punctuation is optional (D-18), so a verse
// typed without one is still a correct answer.
// Removes the elision mark ENTIRELY, in any spelling. Used only to build the
// negative case: since 2026-08-07 an omitted elision mark is a misspelling, so
// this produces input that must be REJECTED, never a verse expected to pass.
const stripElision = s => s.replace(/[᾽’ʼ‘']/gu, '');
const normalizeText = value => String(value ?? '').replace(/\s+/g, ' ').trim().normalize('NFC');

// playwright-core does not install a browser. Prefer its configured binary,
// then use an installed stable browser without hard-coding a machine path.
// The audio assertions play REAL clips, so the autoplay policy has to be out
// of the way: a beforeGuess prompt is spoken on arrival with no gesture behind
// it, and a blocked play() would look exactly like a broken one.
const LAUNCH = { args: ['--autoplay-policy=no-user-gesture-required'] };
async function launchBrowser() {
  const explicit = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
  if (explicit) return chromium.launch({ ...LAUNCH, executablePath: explicit });
  try {
    return await chromium.launch(LAUNCH);
  } catch (original) {
    for (const channel of ['chrome', 'msedge']) {
      try { return await chromium.launch({ ...LAUNCH, channel }); } catch { /* keep looking */ }
    }
    throw original;
  }
}

const browser = await launchBrowser();
const context = await browser.newContext({ viewport: { width: 390, height: 900 } });

// AUDIO OBSERVABILITY (5E-SPEC2 §6.2-§6.4). src/lib/audio.js is the app's sole
// audio choke point and it plays through `new Audio(objectURL)`, so wrapping
// the constructor records every clip the app starts, when it started, and when
// it ended or was cut off — WITHOUT changing what plays. Nothing here reaches
// into a component: the tests still only ever click what the learner clicks.
await context.addInitScript(() => {
  const Native = window.Audio;
  window.__clips = [];
  function Wrapped(src) {
    const el = new Native(src);
    const rec = { src, createdAt: Date.now(), startedAt: null, endedAt: null, stoppedAt: null };
    window.__clips.push(rec);
    const play = el.play.bind(el);
    el.play = () => { rec.startedAt = Date.now(); return play(); };
    el.addEventListener('ended', () => { rec.endedAt = Date.now(); });
    el.addEventListener('pause', () => { rec.stoppedAt = Date.now(); });
    return el;
  }
  Wrapped.prototype = Native.prototype;
  window.Audio = Wrapped;
});
const page = await context.newPage();
// Every /audio/ request the whole run makes, in order. audio.js plays blob:
// object URLs (the element src never names the file), but any clip's FIRST
// play fetches its m4a — so this log is how P3.1/P3.5 prove a tap resolved
// to the right FILE. Attached here, before the first navigation, so a clip
// cached early in the run is still on the record.
const audioRequests = [];
page.on('request', r => { const u = r.url(); if (u.includes('/audio/')) audioRequests.push(u); });

const clips = () => page.evaluate(() => window.__clips.map(c => ({ ...c })));
const lastClip = async () => (await clips()).slice(-1)[0] || null;
const clipsPlaying = () => page.evaluate(() =>
  window.__clips.filter(c => c.startedAt && !c.endedAt && !c.stoppedAt).length);

// A DELIBERATELY LONG CLIP. §6.2 asks for a case where the audio outlasts the
// 2000ms class minimum, and no shipped chapter-1-5 vocabulary clip does. The
// bytes are seeded straight into the audio store the app already reads
// (IndexedDB 'greek-tutor'/'audio', keyed by the same absolute path), so the
// app's own IDB-hit path serves them and no test code touches playback.
// A silent 16-bit mono WAV is used rather than a truncated m4a because it
// decodes on any engine and its duration is exactly what we asked for.
async function seedLongClip(paths, seconds) {
  return page.evaluate(async ({ paths, seconds }) => {
    const rate = 8000;
    const samples = Math.round(rate * seconds);
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    const ascii = (offset, text) => { for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i)); };
    ascii(0, 'RIFF'); view.setUint32(4, 36 + samples * 2, true); ascii(8, 'WAVE');
    ascii(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
    view.setUint16(22, 1, true); view.setUint32(24, rate, true);
    view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    ascii(36, 'data'); view.setUint32(40, samples * 2, true);
    const blob = new Blob([buffer], { type: 'audio/wav' });
    await new Promise((resolve, reject) => {
      const open = indexedDB.open('greek-tutor', 1);
      open.onupgradeneeded = () => {
        if (!open.result.objectStoreNames.contains('audio')) open.result.createObjectStore('audio');
      };
      open.onerror = () => reject(open.error);
      open.onsuccess = () => {
        const tx = open.result.transaction('audio', 'readwrite');
        for (const path of paths) tx.objectStore('audio').put(blob, path);
        tx.oncomplete = () => { open.result.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
    });
  }, { paths, seconds });
}
// id -> path, the naming contract from src/lib/audio.js (never re-derived).
const audioPath = id => {
  const m = String(id || '').match(/^(chapt_\d+|vocab\d*|john\d*|rev_par|rev_voc|intro)_(.+)$/);
  return m ? `/audio/${m[1]}/${m[2]}.m4a` : null;
};
// Force one named clip through the play-time miss path, then report both the
// Audio creation count and ONLY the requests caused by this tap. A cumulative
// request log plus a source-data pin can bless a wrong click handler if the
// expected file happened to play earlier; targeted eviction makes that
// impossible without opening another byte store or changing app code.
async function exactAudioTap(locator, id) {
  const path = audioPath(id);
  await page.evaluate(audioPathKey => new Promise((resolve, reject) => {
    const open = indexedDB.open('greek-tutor', 1);
    open.onupgradeneeded = () => {
      if (!open.result.objectStoreNames.contains('audio')) open.result.createObjectStore('audio');
    };
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const database = open.result;
      const tx = database.transaction('audio', 'readwrite');
      tx.objectStore('audio').delete(audioPathKey);
      tx.oncomplete = () => { database.close(); resolve(); };
      tx.onerror = () => { database.close(); reject(tx.error); };
    };
  }), path);
  await page.evaluate(() => { window.__clips.length = 0; });
  const mark = audioRequests.length;
  await locator.click();
  await page.waitForFunction(() => window.__clips.length >= 1, null, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(120);
  return {
    clipCount: (await clips()).length,
    fetched: audioRequests.slice(mark),
    path
  };
}

// The activity's OWN stepper, never the sequential rail's Previous/Next at the
// bottom of the screen (both are labelled "Next"; only the in-card pair moves
// between items).
const stepper = name => page.locator('.card').getByRole('button', { name, exact: true });

// A cache-busting query, because navigating to a URL that differs only in its
// FRAGMENT is a same-document navigation: the components keep their state and
// every "fresh" case in this file would inherit the previous one's item index.
// (That is not a hypothetical — it is how the first run of this file drifted
// three items deep and reported two false failures.)
let nav = 0;
const go = async hash => {
  await page.goto(`${BASE}/?run=${++nav}${hash}`, { waitUntil: 'load' });
  await page.waitForSelector('.card', { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(120);
};
const typed = () => page.locator('.spell-target').first().innerText();
// Type through the REAL keydown path the desktop layer exposes; the tile path
// is exercised separately below so both routes are covered.
const typeGreek = async text => { for (const ch of text) await page.keyboard.press(keyFor(ch)); };

// Reverse of SpellerKeyboard's KEYMAP, plus what the punctuation keys type.
const KEYMAP = {
  a: 'α', b: 'β', g: 'γ', d: 'δ', e: 'ε', z: 'ζ', h: 'η', q: 'θ', i: 'ι',
  k: 'κ', l: 'λ', m: 'μ', n: 'ν', c: 'ξ', o: 'ο', p: 'π', r: 'ρ', s: 'σ',
  t: 'τ', u: 'υ', f: 'φ', x: 'χ', y: 'ψ', w: 'ω', j: 'ς'
};
const REVERSE = Object.fromEntries(Object.entries(KEYMAP).map(([k, v]) => [v, k]));
function keyFor(ch) {
  if (ch === ' ') return 'Space';
  if (REVERSE[ch]) return REVERSE[ch];
  if (',.;'.includes(ch)) return ch;
  throw new Error(`no key types "${ch}" (U+${ch.codePointAt(0).toString(16)})`);
}
// Accented text, typed the way the learner has to type it: the bare LOWERCASE
// letter on the keyboard, then that cluster's marks on the mark tiles, and
// punctuation on the punctuation tiles.
// LOWERCASE IS A CHOICE HERE, not a limitation, since DISCLOSURE-SPEC3 W3 gave
// the shared keyboard a Shift key: Ἰησοῦς can be typed with its capital now.
// This helper keeps typing lower case because the checker folds case at both
// "With Accents" settings (W3.1 is explicit that the shift key is an input
// capability and not a scoring change), so lower case is what proves the
// FOLDING still holds. The capital path has its own checks at the foot of this
// file, where a capital is typed and round-tripped through the same checker.
async function typeAccented(text) {
  const clusters = [...new Intl.Segmenter('el', { granularity: 'grapheme' }).segment(text)].map(p => p.segment);
  for (const cluster of clusters) {
    const nfd = cluster.normalize('NFD');
    const base = nfd[0].toLowerCase();
    const marks = [...nfd.slice(1)].filter(c => /\p{M}/u.test(c)).join('');
    // An iota subscript is not a mark tile: the keyboard ships the three
    // SUBSCRIPT COMPOSITES and any accent goes on top of one of them, which is
    // how αὐτῷ gets typed.
    const subscript = marks.includes('ͅ');
    const rest = marks.replace('ͅ', '');
    if (subscript) await tapComposite((base + 'ͅ').normalize('NFC'));
    else if (REVERSE[base] || base === ' ') await page.keyboard.press(keyFor(base));
    else await tapPunctuation(base);
    if (rest) await tapMark(rest);
  }
}
const TILES = JSON.parse(readFileSync('src/data/speller-tiles.json', 'utf8'));
async function tapComposite(ch) {
  const tile = page.locator('.tk-marks .tk-key.greek', { hasText: ch });
  if (!await tile.count()) throw new Error(`no composite tile types "${ch}"`);
  await tile.first().click();
}
async function tapPunctuation(ch) {
  const tile = (TILES.punctuation || []).find(t => t.insert === ch);
  if (!tile) throw new Error(`no punctuation tile inserts "${ch}" (U+${ch.codePointAt(0).toString(16)})`);
  await page.locator(`.tk-key.punct[title="${tile.name}"]`).click();
}
async function tapMark(marks) {
  const tile = (TILES.diacritics || []).find(d => d.apply.normalize('NFC') === marks.normalize('NFC')
    || [...d.apply].sort().join('') === [...marks].sort().join(''));
  if (!tile) throw new Error(`no mark tile applies ${[...marks].map(c => c.codePointAt(0).toString(16)).join('+')}`);
  await page.locator(`.tk-key.mark[title="${tile.name}"]`).click();
}
// By LABEL, not by position: the word speller ships three checkboxes (Show
// Answer / With Accents / Pronounce Each Exercise) and the verse speller one.
const setAccents = async on => {
  const box = page.locator('.spell-checks label', { hasText: 'With Accents' }).locator('input');
  if (await box.isChecked() !== on) await box.setChecked(on);
};
const feedbackKind = async () => {
  const cls = await page.locator('.feedback').first().getAttribute('class');
  return /\bok\b/.test(cls) ? 'ok' : /\bbad\b/.test(cls) ? 'bad' : 'none';
};

// ---------------------------------------------------------------- §2 / A4
// Movable nu is GONE. The authored form is λύουσι and only λύουσι.
await go('#/activity/chapt_3/c3_ex_verb_speller');
const verbSpeller = ch3.exercise.find(a => a.id === 'c3_ex_verb_speller');
const itemIndexOf = greek => verbSpeller.items.findIndex(i => i.greek === greek);
const gotoItem = async index => {
  await page.locator('.card.speller').waitFor();
  for (let i = 0; i < index; i++) await stepper('Next').click();
  await page.waitForTimeout(60);
};

for (const [label, greek, input, accents, expect] of [
  ['A4/1 λύουσι, no accents, accents OFF', 'λύουσι', 'λυουσι', false, 'ok'],
  ['A4/2 λύουσι, accented, accents ON', 'λύουσι', 'λύουσι', true, 'ok'],
  ['A4/3 λυουσιν (movable nu) now REJECTED', 'λύουσι', 'λυουσιν', false, 'bad'],
  ['A4/4 πιστευομε for πιστεύομεν rejected', 'πιστεύομεν', 'πιστευομε', false, 'bad'],
  ['A4/5 πιστευομεν accepted', 'πιστεύομεν', 'πιστευομεν', false, 'ok']
]) {
  await go('#/activity/chapt_3/c3_ex_verb_speller');
  const idx = itemIndexOf(greek);
  await gotoItem(idx);
  await setAccents(accents);
  if (accents) await typeAccented(input); else await typeGreek(input);
  await stepper('Check Answer').click();
  await page.waitForTimeout(80);
  check(label, await feedbackKind() === expect, `"${await typed()}" for "${await page.locator(".flash-pane .value").first().innerText()}"`);
}

// ---------------------------------------------------------------- §4 typing
await go('#/activity/chapt_3/c3_ex_scripture_speller');

// A6 defect 2: a breathing typed at the start of a word must attach to the
// NEXT letter and must never eat the space before it.
await page.keyboard.press('o');
await tapMark('̔');                                   // rough breathing -> ὁ
await page.keyboard.press('Space');
await tapMark('̓');                                   // smooth breathing, no base yet
await page.keyboard.press('i');                            // ...lands on the iota
let text = await typed();
check('§4/2 breathing after a space attaches to the NEXT letter',
  text === 'ὁ ἰ', JSON.stringify(text));
check('§4/2 the space survives the breathing', text.includes(' '), JSON.stringify(text));

// A6 defect 1: tap inside the typed text to place the caret, then fix word one.
await stepper('Restart Exercise').click();
await typeGreek('λγει');                                   // the ε of λεγει is missing
// Tap the LEFT half of the second cluster: the caret lands between λ and γ.
await page.locator('.sp-cluster').nth(1).click({ position: { x: 1, y: 5 } });
await page.keyboard.press('e');
text = await typed();
check('§4/1 tap-to-position inserts mid-string', text === 'λεγει', JSON.stringify(text));

// Backspace deletes at the caret, not blindly at the end.
await page.keyboard.press('Backspace');
text = await typed();
check('§4/1 backspace acts at the caret', text === 'λγει', JSON.stringify(text));

// ---------------------------------------------------------------- A6 policy
const cases = [
  ['A6/1 verse with no accents, accents OFF', stripAccents(verse), false, 'ok'],
  ['A6/2 verse fully accented, accents ON', verse, true, 'ok'],
  ['A6/3 verse with no accents, accents ON', stripAccents(verse), true, 'bad'],
  ['A6/4 verse without its punctuation, accents ON', verse.replace(/[,·]/g, ''), true, 'ok'],
  ['A6/5 lowercase where the verse capitalizes, accents ON', verse.toLowerCase(), true, 'ok'],
  // 5E-SPEC2 §4.2: the breathings are part of the spelling at BOTH settings.
  ['5E §4.2 verse with breathings stripped, accents OFF', stripAllMarks(verse), false, 'bad']
];
for (const [label, input, accents, expect] of cases) {
  await go('#/activity/chapt_3/c3_ex_scripture_speller');
  await setAccents(accents);
  // Typed through the app: bare letters on the keyboard, marks on the tiles.
  await typeAccented(input.normalize('NFC'));
  await stepper('Check Answer').click();
  await page.waitForTimeout(100);
  check(label, await feedbackKind() === expect, `typed "${(await typed()).slice(0, 40)}…"`);
}

// ---------------------------------------------------------------- §3 revisit
// Answer item 1, step forward, step back: the item must come up FRESH (no
// selection, no feedback, options unlocked) while the score stands.
// The chapter-3 vocabulary drills used to be in this list. The ledger struck
// their Previous/Next pair (5E-SPEC2 §0: the original has none), so they have
// no revisit path any more — the same reason chapter 1's six select drills are
// asserted rather than walked below.
for (const [label, hash] of [
  ['ch2 Accent Rule', '#/activity/chapt_2/c2_drill_accent_rule'],
  ['ch2 Marking Recognition', '#/activity/chapt_2/c2_drill_marking_recognition'],
  ['ch3 Verb Translating', '#/activity/chapt_3/c3_drill_verb_translating'],
  ['ch3 Parsing', '#/activity/chapt_3/c3_drill_parsing'],
  ['ch4 Greek Noun', '#/activity/chapt_4/c4_drill_greek_noun'],
  ['ch5 First Declension Noun', '#/activity/chapt_5/c5_drill_first_decl_noun']
]) {
  await go(hash);
  await page.locator('.grid.options .tile, .option-group .tile').first().click();
  await page.waitForTimeout(120);
  const answeredMarks = await page.locator('.tile.selected, .tile.correct, .tile.incorrect').count();
  const scoreBefore = await page.locator('.card .scorebox').last().innerText();
  await stepper('Next').click();
  await page.waitForTimeout(120);
  await stepper('Previous').click();
  await page.waitForTimeout(120);
  const marksAfter = await page.locator('.tile.selected, .tile.correct, .tile.incorrect').count();
  const feedbackAfter = (await page.locator('.feedback').first().innerText()).trim();
  check(`§3 revisit resets the item — ${label}`,
    answeredMarks > 0 && marksAfter === 0 && feedbackAfter === '',
    `marked ${answeredMarks} -> ${marksAfter}, feedback ${JSON.stringify(feedbackAfter)}, was on ${JSON.stringify(scoreBefore.trim())}`);
  // The score is not rewound by a revisit: it counts attempts, not the state
  // of the grid (DRILL-MATRIX §6).
  await page.locator('.card').getByRole('button', { name: 'Score', exact: true }).click();
  const score = await page.locator('.live-score').innerText();
  check(`§3 revisit keeps the recorded score — ${label}`, /1 correct out of 1|0 correct out of 1/.test(score), score.trim());
}
// Chapter 1 has no revisit path to reset: none of its six select drills exposes
// a Previous/Next stepper, and all six are `retry` class (an item stays open
// until it is answered correctly). Asserted rather than assumed.
{
  const selects = [...(ch1.drill || []), ...(ch1.exercise || [])].filter(a => a.type === 'select');
  const withStepper = selects.filter(a => (a.ui?.buttons || []).includes('Next'));
  check('§3 ch1 has no scored select drill with a revisit path',
    selects.length > 0 && withStepper.length === 0, `${selects.length} select drills, ${withStepper.length} with a stepper`);
  // Its speller does step, and stepping back presents the word fresh.
  await go('#/activity/chapt_1/c1_ex_speller');
  await page.keyboard.press('a');
  await stepper('Next').click();
  await page.waitForTimeout(80);
  await stepper('Previous').click();
  await page.waitForTimeout(80);
  check('§3 revisit resets the item — ch1 Vocabulary Spelling', (await typed()) === '', JSON.stringify(await typed()));
}

// ---------------------------------------------------------------- 5E §4.2 chart switches
const activitiesOf = chapter => Object.values(chapter).filter(Array.isArray).flat();
const activityById = (chapter, id) => activitiesOf(chapter).find(activity => activity && activity.id === id);
const textHas = (text, value) => text.normalize('NFC').includes(value.normalize('NFC'));
const gotoTopic = async index => {
  for (let i = 0; i < index; i++) {
    await page.getByRole('button', { name: 'Next Topic', exact: true }).click();
    await page.waitForTimeout(50);
  }
};

// Authored select questions are shuffled, so UI assertions identify the
// visible item by its rendered prompt and citation before consulting fields
// such as answer, translate, or gender.
//
// AMBIGUITY IS null, NOT A GUESS. chapter 4's Greek Noun drill ships two items
// on the same sentence and the same reference ("Brother will betray brother",
// Mat 10:21) with different answers, so prompt+reference does not always
// identify one item. Returning the first match made a test click a wrong
// option roughly one run in twenty and then report the advance as broken. The
// caller reloads for a different shuffle instead (freshKnownItem below).
async function authoredItemOnScreen(activity) {
  const visiblePrompt = normalizeText(await page.locator('.card .prompt').first().innerText());
  const citation = page.locator('.card .prompt-citation');
  const visibleCitation = await citation.count() ? normalizeText(await citation.innerText()) : '';
  const promptField = activity.promptFrom && activity.promptFrom.show;
  const promptFor = item => normalizeText(promptField === 'sentence'
    ? item.sentence
    : (activity.promptIsGreek || promptField === 'greek')
      ? item.greek
      : (item.prompt != null ? item.prompt : (promptField ? item[promptField] : '')));
  const matches = activity.items.filter(item => promptFor(item) === visiblePrompt
    && (!visibleCitation || normalizeText(item.ref) === visibleCitation));
  return matches.length === 1 ? matches[0] : null;
}

// Reload until the shuffle puts an item on screen that prompt+reference
// identifies uniquely. Returns null if it never does, so the caller can fail
// the check with a reason instead of clicking something arbitrary.
async function freshKnownItem(hash, activity, tries = 10) {
  for (let attempt = 0; attempt < tries; attempt++) {
    await go(hash);
    const item = await authoredItemOnScreen(activity);
    if (item) return item;
  }
  return null;
}

async function checkMoreBack(label, hash, topicIndex, firstLemma, secondLemma) {
  await go(hash);
  await gotoTopic(topicIndex);
  const chart = page.locator('.card .paradigm').first();
  const initial = await chart.innerText();
  const more = chart.getByRole('button', { name: 'More', exact: true });
  check(`5E §4.2 ${label}: first chart offers More`,
    textHas(initial, firstLemma) && await more.count() === 1,
    JSON.stringify(initial.replace(/\s+/g, ' ').trim()));
  check(`5E §4.2 ${label}: sequential Next stays live on chart 1`,
    !await page.locator('.rail-next').isDisabled());

  await more.click();
  await page.waitForTimeout(60);
  const second = await chart.innerText();
  const back = chart.getByRole('button', { name: 'Back', exact: true });
  check(`5E §4.2 ${label}: More opens chart 2 and offers Back`,
    textHas(second, secondLemma) && await back.count() === 1,
    JSON.stringify(second.replace(/\s+/g, ' ').trim()));
  check(`5E §4.2 ${label}: sequential Next stays live on chart 2`,
    !await page.locator('.rail-next').isDisabled());

  await back.click();
  await page.waitForTimeout(60);
  check(`5E §4.2 ${label}: Back restores chart 1`, textHas(await chart.innerText(), firstLemma));
}

await checkMoreBack('ch4 Masculine Declension', '#/activity/chapt_4/c4_learn_nouns', 4, 'λόγος', 'ἄνθρωπος');
await checkMoreBack('ch5 First Declension--Alpha', '#/activity/chapt_5/c5_learn_nouns', 5, 'ὥρα', 'δόξα');

// The third charts[] surface uses the same mechanism but deliberately names
// the OTHER chart instead of saying More/Back.
await go('#/activity/chapt_5/c5_learn_article');
await gotoTopic(2);
{
  const chart = page.locator('.card .paradigm').first();
  const plural = chart.getByRole('button', { name: 'Plural', exact: true });
  check('5E §4.2 ch5 article: Singular chart offers Plural', await plural.count() === 1,
    (await chart.innerText()).replace(/\s+/g, ' ').trim());
  await plural.click();
  await page.waitForTimeout(60);
  const singular = chart.getByRole('button', { name: 'Singular', exact: true });
  check('5E §4.2 ch5 article: Plural chart offers Singular', await singular.count() === 1,
    (await chart.innerText()).replace(/\s+/g, ' ').trim());
  check('5E §4.2 ch5 article: sequential Next stays live through the named toggle',
    !await page.locator('.rail-next').isDisabled());
  await singular.click();
  await page.waitForTimeout(60);
  check('5E §4.2 ch5 article: Singular restores the first chart',
    await chart.getByRole('button', { name: 'Plural', exact: true }).count() === 1);
}

async function checkChartRouteReset(label, hash, topicIndex, switchName, restoredName) {
  await go(hash);
  await gotoTopic(topicIndex);
  const chart = page.locator('.card .paradigm').first();
  await chart.getByRole('button', { name: switchName, exact: true }).click();
  await page.waitForTimeout(50);
  await page.locator('.rail-next').click();
  await page.waitForTimeout(100);
  await page.locator('.rail-prev').click();
  await page.waitForTimeout(100);
  await gotoTopic(topicIndex);
  const restored = page.locator('.card .paradigm').first();
  check(`5E §4.2 ${label}: leave and return resets chart 1`,
    await restored.getByRole('button', { name: restoredName, exact: true }).count() === 1,
    (await restored.innerText()).replace(/\s+/g, ' ').trim());
}

await checkChartRouteReset('ch4 Masculine Declension', '#/activity/chapt_4/c4_learn_nouns', 4, 'More', 'More');
await checkChartRouteReset('ch5 First Declension--Alpha', '#/activity/chapt_5/c5_learn_nouns', 5, 'More', 'More');
await checkChartRouteReset('ch5 Definite Article', '#/activity/chapt_5/c5_learn_article', 2, 'Plural', 'Plural');

// ---------------------------------------------------------------- 5E §4.5 button-driven reveals
async function checkReveal(label, chapter, activityId, buttonName, field) {
  const activity = activityById(chapter, activityId);
  const currentItem = await freshKnownItem(`#/activity/${chapter === ch4 ? 'chapt_4' : 'chapt_5'}/${activityId}`, activity);
  const expected = currentItem ? normalizeText(currentItem[field]) : null;
  const output = page.locator(`.card [data-reveal="${field}"]`);
  check(`5E §4.5 ${label}: reveal starts hidden`, await output.count() === 0);
  await page.locator('.card').getByRole('button', { name: buttonName, exact: true }).click();
  await output.waitFor({ state: 'visible', timeout: 1000 }).catch(() => {});
  const rendered = await output.count() === 1;
  const actual = rendered ? (await output.innerText()).replace(/\s+/g, ' ').trim() : '';
  const citationBox = await page.locator('.card .prompt-citation').boundingBox();
  const outputBox = rendered ? await output.boundingBox() : null;
  check(`5E §4.5 ${label}: ${buttonName} prints the authored ${field} under the reference`,
    rendered && expected !== null && normalizeText(actual) === expected
      && !!citationBox && !!outputBox && outputBox.y >= citationBox.y + citationBox.height - 1,
    `${JSON.stringify(actual)} after ${JSON.stringify(currentItem?.ref || 'unmatched item')}`);
  await stepper('Next').click();
  await page.waitForTimeout(50);
  check(`5E §4.5 ${label}: reveal clears on item change`, await output.count() === 0);
}

await checkReveal('ch4 Declining Noun', ch4, 'c4_drill_declining', 'Translate', 'translate');
await checkReveal('ch5 Declining Noun', ch5, 'c5_drill_declining', 'Translate', 'translate');
await checkReveal('ch5 Definite Article', ch5, 'c5_drill_article', 'Gender', 'gender');

async function checkControlOrder(label, chapterId, activity) {
  await go(`#/activity/${chapterId}/${activity.id}`);
  const actual = (await page.locator('.card > .controls').first().getByRole('button').allInnerTexts())
    .map(normalizeText);
  const expected = activity.ui.buttons;
  check(`XPATCH1 §2 ${label}: controls follow ui.buttons`,
    JSON.stringify(actual) === JSON.stringify(expected),
    `${JSON.stringify(actual)} expected ${JSON.stringify(expected)}`);
}

await checkControlOrder('ch3 Verb Translating', 'chapt_3', activityById(ch3, 'c3_drill_verb_translating'));
await checkControlOrder('ch4 Declining Noun', 'chapt_4', activityById(ch4, 'c4_drill_declining'));
await checkControlOrder('ch5 Declining Noun', 'chapt_5', activityById(ch5, 'c5_drill_declining'));
await checkControlOrder('ch5 Definite Article', 'chapt_5', activityById(ch5, 'c5_drill_article'));

// ---------------------------------------------------------------- §3 timing
// The two constants, measured through the UI rather than read out of the
// module: the item must still be on screen at ~55% of its deadline and gone by
// ~140% of it. Which deadline applies is read from the OUTCOME the app itself
// reported, so nothing here encodes an answer key.
const CORRECT_MS = 2000, INCORRECT_MS = 4000;
const itemNumber = async () => (await page.locator('.card .scorebox').last().innerText()).trim();
async function measureAdvance(label, hash, wantCorrect) {
  await go(hash);
  const before = await itemNumber();
  const tiles = page.locator('.grid.options .tile, .option-group .tile');
  let kind = 'none', answeredAt = 0;
  const count = await tiles.count();
  for (let i = 0; i < count; i++) {
    await tiles.nth(i).click();
    answeredAt = Date.now();
    await page.waitForTimeout(60);
    kind = await feedbackKind();
    // A `retry` drill leaves a wrong item open, so the next tile is a fresh
    // guess on the SAME item — which is how this finds the correct one without
    // knowing it. A one-attempt drill locks, so the first tap is the answer.
    if (kind === 'ok' || !wantCorrect) break;
    if (await itemNumber() !== before) break;
  }
  const deadline = kind === 'ok' ? CORRECT_MS : INCORRECT_MS;
  await page.waitForTimeout(Math.max(0, deadline * 0.55 - (Date.now() - answeredAt)));
  const early = await itemNumber();
  await page.waitForTimeout(Math.max(0, deadline * 1.4 - (Date.now() - answeredAt)));
  const late = await itemNumber();
  check(`§3 ${label}: ${kind === 'ok' ? 'correct' : 'incorrect'} advances on ${deadline}ms`,
    early === before && late !== before,
    `item ${before} -> ${early} at ${Math.round(deadline * 0.55)}ms -> ${late} at ${Math.round(deadline * 1.4)}ms`);
}
// ch2 Syllable Counting is `retry`: guessing until it is right gives a
// deterministic CORRECT measurement, and it is a chapter-2 surface, which is
// where the 4000ms data literals used to live.
await measureAdvance('ch2 Syllable Counting', '#/activity/chapt_2/c2_drill_syllable_counting', true);
// Keep chapter 3's original `autoBoth` timing assertion as a regression; 5E's
// new autoBoth surfaces are measured deterministically below.
await measureAdvance('ch3 Scripture Memory Drill', '#/activity/chapt_3/c3_drill_scripture_memory', false);

// Cohort 5E's one-attempt drills cannot be probed by guessing repeatedly: a
// wrong first tap locks the grid. Select the authored first-item answer (or a
// known non-answer) from the delivered data, but still measure the transition
// solely through the rendered UI. Report the observed milliseconds.
async function measureAuthoredAdvance(label, chapter, chapterId, activityId, wantCorrect, expectedMs) {
  const activity = activityById(chapter, activityId);
  const currentItem = await freshKnownItem(`#/activity/${chapterId}/${activityId}`, activity);
  const before = await itemNumber();
  const tiles = page.locator('.grid.options .tile, .option-group .tile');
  const labels = (await tiles.allInnerTexts()).map(normalizeText);
  if (!currentItem) {
    check(`5E timing ${label}`, false,
      'could not match the rendered prompt/reference to authored data');
    return;
  }
  const answer = normalizeText(currentItem.answer);
  const index = wantCorrect ? labels.findIndex(text => text === answer) : labels.findIndex(text => text !== answer);
  if (index < 0) {
    check(`5E §8 timing ${label}`, false, `could not find a ${wantCorrect ? 'correct' : 'wrong'} rendered option for ${JSON.stringify(answer)}`);
    return;
  }

  const answeredAt = Date.now();
  await tiles.nth(index).click();
  await page.waitForTimeout(70);
  const kind = await feedbackKind();
  const earlyAt = Math.round(expectedMs * 0.55);
  await page.waitForTimeout(Math.max(0, earlyAt - (Date.now() - answeredAt)));
  const early = await itemNumber();
  let late = early;
  while (late === before && Date.now() - answeredAt < expectedMs * 1.5) {
    await page.waitForTimeout(40);
    late = await itemNumber();
  }
  const elapsed = Date.now() - answeredAt;
  const expectedKind = wantCorrect ? 'ok' : 'bad';
  check(`5E §8 timing ${label}: ${wantCorrect ? 'correct' : 'incorrect'} advances on ${expectedMs}ms`,
    kind === expectedKind && early === before && late !== before
      && elapsed >= expectedMs * 0.8 && elapsed <= expectedMs * 1.5,
    `item ${before} -> ${early} at ${earlyAt}ms -> ${late} at ${elapsed}ms; feedback ${kind}`);
}

await measureAuthoredAdvance('ch4 Greek Noun (manualOnIncorrect)', ch4, 'chapt_4', 'c4_drill_greek_noun', true, CORRECT_MS);
await measureAuthoredAdvance('ch4 Scripture Memory (autoBoth)', ch4, 'chapt_4', 'c4_drill_scripture_memory', false, INCORRECT_MS);
await measureAuthoredAdvance('ch5 First Declension Noun (manualOnIncorrect)', ch5, 'chapt_5', 'c5_drill_first_decl_noun', true, CORRECT_MS);
await measureAuthoredAdvance('ch5 Scripture Memory (autoBoth)', ch5, 'chapt_5', 'c5_drill_scripture_memory', false, INCORRECT_MS);

// ---------------------------------------------------------------- §5 grids
for (const [label, hash] of [
  ['ch1 Vocabulary: Greek to English', '#/activity/chapt_1/c1_drill_vocab_gk_en'],
  ['ch1 Vocabulary: English to Greek', '#/activity/chapt_1/c1_drill_vocab_en_gk'],
  ['ch2 Vocabulary: Greek to English', '#/activity/chapt_2/c2_drill_vocab_gk_en'],
  ['ch2 Vocabulary: English to Greek', '#/activity/chapt_2/c2_drill_vocab_en_gk'],
  ['ch3 Vocabulary: Greek to English', '#/activity/chapt_3/c3_drill_vocab_gk_en'],
  ['ch3 Vocabulary: English to Greek', '#/activity/chapt_3/c3_drill_vocab_en_gk'],
  ['ch4 Vocabulary: Greek to English', '#/activity/chapt_4/c4_drill_vocab_gk_en'],
  ['ch4 Vocabulary: English to Greek', '#/activity/chapt_4/c4_drill_vocab_en_gk'],
  ['ch5 Vocabulary: Greek to English', '#/activity/chapt_5/c5_drill_vocab_gk_en'],
  ['ch5 Vocabulary: English to Greek', '#/activity/chapt_5/c5_drill_vocab_en_gk']
]) {
  for (const [width, want] of [[320, 2], [768, 4]]) {
    await page.setViewportSize({ width, height: 900 });
    await go(hash);
    const cols = await page.locator('.grid.options').first()
      .evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    check(`§5 vocabulary option grid is ${want}-up at ${width}px — ${label}`, cols === want, `${cols} columns`);
  }
}

// D-26: these option grids ARE paradigms, so singular/plural stay paired in
// two columns even at the iPad breakpoint. This is intentionally the opposite
// of the vocabulary rule above.
for (const [label, hash] of [
  ['ch4 Greek Noun', '#/activity/chapt_4/c4_drill_greek_noun'],
  ['ch4 Declining Noun', '#/activity/chapt_4/c4_drill_declining'],
  ['ch5 Declining Noun', '#/activity/chapt_5/c5_drill_declining'],
  ['ch5 Definite Article', '#/activity/chapt_5/c5_drill_article']
]) {
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await go(hash);
    const cols = await page.locator('.grid.options').first()
      .evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    check(`5E D-26 paradigm option grid stays two-up at ${width}px — ${label}`,
      cols === 2, `${cols} columns`);
  }
}

for (const width of [320, 768]) {
  await page.setViewportSize({ width, height: 900 });
  await go('#/activity/chapt_5/c5_drill_first_decl_noun');
  const cols = await page.locator('.grid.options').first()
    .evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
  check(`5E ch5 First Declension Noun grid stays single-column at ${width}px`, cols === 1, `${cols} columns`);
}
await page.setViewportSize({ width: 390, height: 900 });

// Letter grids stay four-up at every width (single glyphs, no width problem).
for (const width of [320, 768]) {
  await page.setViewportSize({ width, height: 900 });
  await go('#/activity/chapt_1/c1_ex_letter_to_name');
  const cols = await page.locator('.grid.options').first()
    .evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
  check(`§5 ch1 letter grid stays four-up at ${width}px`, cols === 4, `${cols} columns`);
}

// ---------------------------------------------------------------- §5 divider
await page.setViewportSize({ width: 390, height: 900 });
await go('#/activity/chapt_3/c3_drill_parsing');
const divider = await page.locator('.option-group + .option-group').first()
  .evaluate(el => { const s = getComputedStyle(el); return { top: s.borderTopColor, left: s.borderLeftColor }; });
const GREEN = 'rgb(31, 95, 87)';
check('§5 Parsing Drill divider is dark green',
  divider.top === GREEN || divider.left === GREEN, JSON.stringify(divider));

// ---------------------------------------------------------------- §5 objectives
// Data files are zero-PADDED to two digits: chapter 10 is chapt-10.json, not
// chapt-010.json. The old `chapt-0${n}` concatenation was right for exactly
// the nine chapters that existed when it was written.
const chapterFile = id => `src/data/chapt-${String(id.split('_')[1]).padStart(2, '0')}.json`;
for (const chapterId of ['chapt_1', 'chapt_2', 'chapt_3', 'chapt_4', 'chapt_5']) {
  const data = JSON.parse(readFileSync(chapterFile(chapterId), 'utf8'));
  const objectives = (data.learn || []).find(a => a.mode === 'objectivesPage');
  if (!objectives) { check(`§5 ${chapterId} objectives use "1. 2. 3."`, false, 'no objectivesPage'); continue; }
  await go(`#/activity/${chapterId}/${objectives.id}`);
  const marker = await page.locator('.card ol').first().evaluate(el => getComputedStyle(el).listStyleType);
  check(`§5 ${chapterId} objectives use "1. 2. 3."`, marker === 'decimal', marker);
}

// ================================================================ 5E-SPEC2 §6
// Everything below is 5E-SPEC2's contract, amended by 5E-SPEC3 §1: the FOUR
// advance classes, the afterGuess audio wait, the audio lifecycle, the two
// withdrawn spelling leniencies, Show Answer, modal reachability and the
// option-grid census.
await page.setViewportSize({ width: 390, height: 900 });

// 5F: chapters 6, 7 and 8 join the swept set, so every census, every ledger
// assertion and every spelling rule below covers them without being restated.
// That is the point of writing them as sweeps rather than as lists.
// 5G: chapters 9 and 10 join it in turn, for the same reason.
const CHAPTERS = { chapt_1: ch1, chapt_2: ch2, chapt_3: ch3, chapt_4: ch4, chapt_5: ch5,
                   chapt_6: ch6, chapt_7: ch7, chapt_8: ch8, chapt_9: ch9, chapt_10: ch10,
                   chapt_11: ch11, chapt_12: ch12 };
const LEXICON = id => JSON.parse(readFileSync(`src/data/lexicon-chapt${String(id.split('_')[1]).padStart(2, '0')}.json`, 'utf8'));
const promptGloss = () => page.locator('.card.speller .flash-pane .value').first().innerText();
// WHICH ITEM the word speller is on. Not the prompt: chapter 7's adjective
// speller prints "good" on six consecutive items and tells them apart by their
// parse note, so a prompt comparison cannot see that word 1 became word 2.
const spellerIndex = async () => page.locator('.card.speller').first().getAttribute('data-word-index');
const exerciseCount = () => page.locator('.card .exercise-count').innerText();
const awaitNextShown = async () => await page.locator('.await-next').count() > 0;

// ---------------------------------------------------------------- §6.1 classes
// `none` — an explore grid is not scored at all: no feedback line, no policy.
await go('#/activity/chapt_1/c1_drill_letter_names');
await page.locator('.grid.letters .tile').first().click();
await page.waitForTimeout(150);
{
  const activity = activityById(ch1, 'c1_drill_letter_names');
  check('5E §6.1 none: explore grid is not scored',
    !activity.answerPolicy && await page.locator('.feedback').count() === 0
      && await page.locator('.await-next').count() === 0,
    `answerPolicy ${JSON.stringify(activity.answerPolicy)}`);
}

// `autoBoth` — BOTH outcomes move by themselves. The incorrect path is already
// measured above; this is the correct one, on a different chapter.
await measureAuthoredAdvance('ch4 Scripture Memory (autoBoth, correct)', ch4, 'chapt_4', 'c4_drill_scripture_memory', true, CORRECT_MS);

// `manualOnIncorrect` — a wrong answer reveals the answer, locks the grid and
// STAYS. The correct path is measured above; this asserts the standing still.
{
  const activity = activityById(ch4, 'c4_drill_greek_noun');
  const item = await freshKnownItem('#/activity/chapt_4/c4_drill_greek_noun', activity);
  const before = await itemNumber();
  const tiles = page.locator('.grid.options .tile');
  const labels = (await tiles.allInnerTexts()).map(normalizeText);
  const wrong = labels.findIndex(text => text !== normalizeText(item.answer));
  await tiles.nth(wrong).click();
  await page.waitForTimeout(200);
  // The paradigm grids legitimately repeat a form -- nominative and vocative
  // plural are homographs, so "ἀδελφοί" is two tiles -- and when THAT is the
  // answer both light up. Assert what is revealed, not how many tiles it took.
  const revealed = (await page.locator('.grid.options .tile.correct').allInnerTexts()).map(normalizeText);
  const said = await awaitNextShown();
  await shot('manualOnIncorrect INCORRECT (the app\'s only waiting outcome)');
  await page.waitForTimeout(INCORRECT_MS * 1.5);
  check('5E §6.1 manualOnIncorrect: incorrect reveals, waits, and says so',
    await feedbackKind() === 'bad' && revealed.length >= 1
      && revealed.every(text => text === normalizeText(item.answer))
      && said && await itemNumber() === before,
    `revealed ${JSON.stringify(revealed)} for answer ${JSON.stringify(item.answer)}, message ${said}, item ${before} -> ${await itemNumber()}`);
}

// `retryUntilRight` — a wrong answer reveals NOTHING, does not advance, and
// leaves the item open for another attempt.
{
  // The pool is shuffled and the items name their word by lexicon ref, so the
  // wrong option is resolved the same way the app resolves the prompt: match
  // the rendered Greek to a lemma, then pick any option that is not its answer.
  const activity = activityById(ch2, 'c2_drill_syllable_counting');
  const lexicon = LEXICON('chapt_2');
  const greekOf = item => {
    const bucket = lexicon[item.pool] || lexicon.lemmas || {};
    return normalizeText((bucket[item.ref] || {}).greek);
  };
  await go('#/activity/chapt_2/c2_drill_syllable_counting');
  const before = await itemNumber();
  const shown = normalizeText(await page.locator('.card .prompt').first().innerText());
  const item = activity.items.find(i => greekOf(i) === shown);
  const tiles = page.locator('.grid.options .tile');
  const labels = (await tiles.allInnerTexts()).map(normalizeText);
  const wrongAt = item ? labels.findIndex(text => text !== String(item.answer)) : -1;
  await tiles.nth(Math.max(wrongAt, 0)).click();
  await page.waitForTimeout(150);
  const kind = await feedbackKind();
  const revealed = await page.locator('.grid.options .tile.correct').count();
  const said = await awaitNextShown();
  await shot('retryUntilRight INCORRECT (open, nothing revealed)');
  await page.waitForTimeout(INCORRECT_MS * 1.4);
  check('5E §6.1 retryUntilRight: incorrect reveals nothing and stays open',
    wrongAt >= 0 && kind === 'bad' && revealed === 0 && !said && await itemNumber() === before,
    `wrong tile ${wrongAt} (${JSON.stringify(shown)}), feedback ${kind}, revealed ${revealed}, message ${said}, item ${before} -> ${await itemNumber()}`);
  // Still open: a second tap on the SAME item is accepted, not swallowed.
  await page.locator('.card').getByRole('button', { name: 'Score', exact: true }).click();
  const attemptsBefore = await page.locator('.live-score').innerText();
  await tiles.nth(labels.findIndex(text => text === String(item && item.answer))).click();
  await page.waitForTimeout(150);
  const attemptsAfter = await page.locator('.live-score').innerText();
  check('5E §6.1 retryUntilRight: the item stays open for another attempt',
    /out of 2 attempts/.test(attemptsAfter) && await feedbackKind() === 'ok',
    `${attemptsBefore.trim()} -> ${attemptsAfter.trim()}`);
}

// The two chapter-2 exercises, which 5E-SPEC2 shipped as
// `manualCorrectAutoIncorrect` (wait for Next on a CORRECT answer) and
// 5E-SPEC3 §1 restamps as `autoBoth`. Both outcomes now move by themselves.
const ACCENT_OF = { '́': 'Acute', '̀': 'Grave', '͂': 'Circumflex' };
function accentAnswer(form) {
  const clusters = [...new Intl.Segmenter('el', { granularity: 'grapheme' }).segment(form)].map(p => p.segment);
  for (let i = 0; i < clusters.length; i++) {
    for (const ch of clusters[i].normalize('NFD')) if (ACCENT_OF[ch]) return { index: i, type: ACCENT_OF[ch] };
  }
  return null;
}
{
  // The accent-placement pool is authored order, not shuffled, so item 1 is
  // deterministic and its answer is read out of the delivered data.
  const activity = activityById(ch2, 'c2_ex_accent_placement');
  const answer = accentAnswer(activity.items[0].answerForm);
  const other = (activity.accentTypes || []).find(t => t !== answer.type);

  await go('#/activity/chapt_2/c2_ex_accent_placement');
  const before = await exerciseCount();
  await page.locator('.accent-types .chip', { hasText: answer.type }).first().click();
  await page.locator('.accent-slot').nth(answer.index).click();
  const rightAt = Date.now();
  await stepper('Check Answer').click();
  await page.waitForTimeout(200);
  // Read the outcome BEFORE the advance clears it: this class moves on by
  // itself on BOTH paths now, so anything asserted afterwards reads an empty
  // banner and a different word.
  const rightKind = await feedbackKind();
  const said = await awaitNextShown();
  await shot('ch2 accent placement CORRECT');
  const earlyRight = await exerciseCount();
  let lateRight = earlyRight;
  while (lateRight === before && Date.now() - rightAt < CORRECT_MS * 2.2) {
    await page.waitForTimeout(50);
    lateRight = await exerciseCount();
  }
  const rightElapsed = Date.now() - rightAt;
  check('5E §6.1 autoBoth (ch2 Accent Placement): CORRECT auto-advances on 2000ms and never waits',
    rightKind === 'ok' && !said && earlyRight === before
      && lateRight !== before && rightElapsed >= CORRECT_MS * 0.8,
    `feedback ${rightKind}, wait message ${said}, item ${before.trim()} -> ${lateRight.trim()} at ${rightElapsed}ms`);

  await go('#/activity/chapt_2/c2_ex_accent_placement');
  const beforeWrong = await exerciseCount();
  await page.locator('.accent-types .chip', { hasText: other }).first().click();
  await page.locator('.accent-slot').nth(answer.index).click();
  const answeredAt = Date.now();
  await stepper('Check Answer').click();
  await page.waitForTimeout(200);
  const wrongKind = await feedbackKind();
  const revealedForm = await page.locator('.exercise-answer').count();
  await shot('ch2 accent placement INCORRECT');
  const early = await exerciseCount();
  let late = early;
  while (late === beforeWrong && Date.now() - answeredAt < INCORRECT_MS * 1.6) {
    await page.waitForTimeout(60);
    late = await exerciseCount();
  }
  const elapsed = Date.now() - answeredAt;
  check('5E §6.1 autoBoth (ch2 Accent Placement): INCORRECT reveals and auto-advances on 4000ms',
    wrongKind === 'bad' && revealedForm === 1 && early === beforeWrong
      && late !== beforeWrong && elapsed >= INCORRECT_MS * 0.8,
    `feedback ${wrongKind}, revealed ${revealedForm}, item ${beforeWrong.trim()} -> ${late.trim()} at ${elapsed}ms`);
}

// Syllable Division, the other restamped chapter-2 exercise. Its answer is the
// authored `division` gap list, placed by tapping the word at each gap centre.
{
  const activity = activityById(ch2, 'c2_ex_syllable_division');
  // The first item with at least one divider, so the "one syllable" bar is not
  // the whole answer and real gap taps are exercised.
  const index = (activity.items || []).findIndex(item => (item.division || []).length > 0);
  const item = activity.items[index];
  await go('#/activity/chapt_2/c2_ex_syllable_division');
  for (let i = 0; i < index; i++) await stepper('Next').click();
  await page.waitForTimeout(120);
  const before = await exerciseCount();
  // Tap between cluster g-1 and cluster g, using the LAID-OUT letter boxes, so
  // this places dividers the same way a finger does rather than by internal id.
  for (const gap of item.division) {
    const box = await page.locator('.divide-word .divide-letter').nth(gap - 1).boundingBox();
    const after = await page.locator('.divide-word .divide-letter').nth(gap).boundingBox();
    await page.mouse.click((box.x + box.width + after.x) / 2, box.y + box.height / 2);
    await page.waitForTimeout(60);
  }
  const answeredAt = Date.now();
  await stepper('Check Answer').click();
  await page.waitForTimeout(200);
  const kind = await feedbackKind();
  const said = await awaitNextShown();
  await shot('ch2 syllable division CORRECT');
  let late = before;
  while (late === before && Date.now() - answeredAt < CORRECT_MS * 2.5) {
    await page.waitForTimeout(50);
    late = await exerciseCount();
  }
  const elapsed = Date.now() - answeredAt;
  check('5E §6.1 autoBoth (ch2 Syllable Division): CORRECT auto-advances on 2000ms and never waits',
    kind === 'ok' && !said && late !== before && elapsed >= CORRECT_MS * 0.8,
    `feedback ${kind} on ${JSON.stringify(item.greek)}, wait message ${said}, item ${before.trim()} -> ${late.trim()} at ${elapsed}ms`);
}

// `retryUntilRight` on a SPELLER — 5E-SPEC2 shipped these as `spellUntilRight`,
// waiting for Next on a correct spelling. A correct spelling now moves to the
// next word by itself; a wrong one still keeps what was typed and reveals
// nothing (§5 / rule C0a).
{
  const activity = activityById(ch3, 'c3_ex_verb_speller');
  const word = activity.items[0].greek;
  await go('#/activity/chapt_3/c3_ex_verb_speller');
  const before = await promptGloss();
  await setAccents(false);
  await typeAccented(stripAccents(word));
  const answeredAt = Date.now();
  await stepper('Check Answer').click();
  await page.waitForTimeout(200);
  const kind = await feedbackKind();
  const said = await awaitNextShown();
  await shot('speller CORRECT (auto-advancing)');
  const early = await promptGloss();
  let late = early;
  while (late === before && Date.now() - answeredAt < CORRECT_MS * 3) {
    await page.waitForTimeout(50);
    late = await promptGloss();
  }
  const elapsed = Date.now() - answeredAt;
  check('5E §6.1 retryUntilRight (speller): a correct spelling AUTO-ADVANCES and never waits',
    kind === 'ok' && !said && early === before && late !== before
      && elapsed >= CORRECT_MS * 0.8,
    `feedback ${kind}, wait message ${said}, prompt ${JSON.stringify(before)} -> ${JSON.stringify(late)} at ${elapsed}ms`);

  await go('#/activity/chapt_3/c3_ex_verb_speller');
  await setAccents(false);
  await typeGreek('λυειζ');                                  // λύει with a stray ζ on the end
  const typedBefore = await typed();
  await stepper('Check Answer').click();
  await page.waitForTimeout(250);
  await shot('speller INCORRECT (slate kept, nothing revealed)');
  check('5E §6.1 retryUntilRight (speller): a wrong spelling keeps the slate and reveals nothing',
    await feedbackKind() === 'bad' && await typed() === typedBefore
      && await page.locator('.spell-answer').count() === 0
      && !await awaitNextShown(),
    `typed ${JSON.stringify(await typed())}, answer shown ${await page.locator('.spell-answer').count()}`);
}

// ------------------------------------------- §1 acceptance: one per chapter
// Rule B1a is the whole point of this round: EVERY correct answer auto-
// advances, in every class, in every chapter. One assertion per class per
// chapter, driven through the UI.
//
// The option-grid drills shuffle and most of them answer by lexicon ref, so
// rather than reading an answer key this LEARNS the answer from the app: a
// wrong tap on a one-attempt class reveals it (.tile.correct), and reloading
// until the same prompt comes back around gives a deterministic correct tap on
// the next pass. Nothing here encodes what the right answer is.
const OPTION_TILES = '.grid.options .tile, .option-group .tile';
const promptOnScreen = async () => normalizeText(await page.locator('.card .prompt').first().innerText());

// Learns INCREMENTALLY rather than fixing on one prompt and waiting for the
// shuffle to bring it back: a 25-item pool would need luck to do that inside a
// bounded number of reloads. Each pass either recognizes a prompt it has
// already solved (and hands it back unanswered, ready to measure) or spends
// one wrong tap learning that prompt's answer from the reveal.
//
// TWO AMBIGUITIES, both real in the delivered data, both settled by evidence
// rather than by an answer key:
//   * two OPTIONS with the same label (nominative and vocative plural are
//     homographs in every paradigm) light up more than one tile, so there is
//     no single answer to learn — that reveal is discarded;
//   * two ITEMS with the same prompt and different answers (ch4's Greek Noun
//     drill ships "Brother will betray brother" twice) make a learned answer
//     wrong on the second one. That shows up as `bad` feedback on the
//     measurement pass, so the prompt is struck off and the walk continues
//     rather than reporting a broken advance.
async function checkCorrectAutoAdvances(label, hash, tries = 45) {
  const NAME = `5E §1 ${label}: correct auto-advances on max(2000ms, clip) and never waits for Next`;
  const known = new Map();
  const ambiguous = new Set();
  let why = 'never reached a prompt whose answer could be learned';
  for (let i = 0; i < tries; i++) {
    await go(hash);
    const prompt = await promptOnScreen();
    const tiles = page.locator(OPTION_TILES);
    const labels = (await tiles.allInnerTexts()).map(normalizeText);

    if (known.has(prompt)) {
      const at = labels.indexOf(known.get(prompt));
      if (at < 0) { known.delete(prompt); continue; }
      const before = await itemNumber();
      const answeredAt = Date.now();
      await tiles.nth(at).click();
      await page.waitForTimeout(180);
      const kind = await feedbackKind();
      if (kind !== 'ok') {
        known.delete(prompt);
        ambiguous.add(prompt);
        why = `prompt ${JSON.stringify(prompt)} is shared by two items with different answers`;
        continue;
      }
      const said = await awaitNextShown();
      await shot(`B1a ${label} CORRECT`);
      const early = await itemNumber();
      let late = early;
      while (late === before && Date.now() - answeredAt < CORRECT_MS * 3) {
        await page.waitForTimeout(50);
        late = await itemNumber();
      }
      const elapsed = Date.now() - answeredAt;
      check(NAME,
        !said && early === before && late !== before && elapsed >= CORRECT_MS * 0.8,
        `wait message ${said}, item ${before} -> ${late} at ${elapsed}ms on ${JSON.stringify(prompt)}`);
      return;
    }

    if (ambiguous.has(prompt)) continue;
    await tiles.first().click();
    await page.waitForTimeout(180);
    if (await feedbackKind() === 'ok') { known.set(prompt, labels[0]); continue; }
    const revealed = (await page.locator('.grid.options .tile.correct, .option-group .tile.correct')
      .allInnerTexts()).map(normalizeText);
    if (revealed.length === 1) known.set(prompt, revealed[0]);
  }
  check(NAME, false, `gave up after ${tries} passes — ${why}`);
}

// `retryUntilRight` reveals NOTHING on a wrong answer, so there is nothing for
// learnCorrectOption to read — but it also leaves the item open, so the answer
// can simply be found by trying tiles on the item in front of us. The advance
// is measured from the tap that finally landed.
async function checkRetryCorrectAutoAdvances(label, hash) {
  await go(hash);
  const before = await itemNumber();
  const tiles = page.locator(OPTION_TILES);
  const count = await tiles.count();
  let answeredAt = 0, kind = 'none';
  for (let i = 0; i < count; i++) {
    answeredAt = Date.now();
    await tiles.nth(i).click();
    await page.waitForTimeout(160);
    kind = await feedbackKind();
    if (kind === 'ok') break;
    if (await itemNumber() !== before) break;      // it moved: not a retry class
  }
  const said = await awaitNextShown();
  await shot(`B1a ${label} CORRECT`);
  const early = await itemNumber();
  let late = early;
  while (late === before && Date.now() - answeredAt < CORRECT_MS * 3) {
    await page.waitForTimeout(50);
    late = await itemNumber();
  }
  const elapsed = Date.now() - answeredAt;
  check(`5E §1 ${label}: correct auto-advances on max(2000ms, clip) and never waits for Next`,
    kind === 'ok' && !said && early === before && late !== before && elapsed >= CORRECT_MS * 0.8,
    `feedback ${kind}, wait message ${said}, item ${before} -> ${late} at ${elapsed}ms`);
}

// Every chapter's option-grid classes. `autoBoth` and `manualOnIncorrect` both
// reveal on a wrong answer, which is what makes learnCorrectOption work.
for (const [label, hash] of [
  ['ch1 Vocabulary: English to Greek (autoBoth)', '#/activity/chapt_1/c1_drill_vocab_en_gk'],
  ['ch2 Vocabulary: Greek to English (autoBoth)', '#/activity/chapt_2/c2_drill_vocab_gk_en'],
  ['ch2 Marking Recognition (manualOnIncorrect)', '#/activity/chapt_2/c2_drill_marking_recognition'],
  ['ch3 Scripture Memory (autoBoth)', '#/activity/chapt_3/c3_drill_scripture_memory'],
  ['ch3 Verb Translating (manualOnIncorrect)', '#/activity/chapt_3/c3_drill_verb_translating'],
  ['ch4 Scripture Memory (autoBoth)', '#/activity/chapt_4/c4_drill_scripture_memory'],
  ['ch4 Greek Noun (manualOnIncorrect)', '#/activity/chapt_4/c4_drill_greek_noun'],
  ['ch5 Vocabulary: English to Greek (autoBoth)', '#/activity/chapt_5/c5_drill_vocab_en_gk'],
  ['ch5 Definite Article (manualOnIncorrect)', '#/activity/chapt_5/c5_drill_article']
]) await checkCorrectAutoAdvances(label, hash);
// The one non-speller `retryUntilRight` surface in chapters 1-5.
await checkRetryCorrectAutoAdvances('ch2 Syllable Counting (retryUntilRight)', '#/activity/chapt_2/c2_drill_syllable_counting');

// `retryUntilRight` on the WORD SPELLER, once per chapter. The item order is
// authored, not shuffled, so the first word's spelling comes straight from the
// delivered data and the measurement is deterministic.
for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
  const activity = activitiesOf(chapter).find(a => a && a.type === 'spell');
  if (!activity) continue;
  const answers = spellerAnswers(chapterId, activity);
  const word = answers[0];
  if (!word) { check(`5E §1 ${chapterId} ${activity.id}: correct auto-advances`, false, 'no first answer in the data'); continue; }
  await go(`#/activity/${chapterId}/${activity.id}`);
  const before = await spellerIndex();
  await setAccents(false);
  await typeAccented(stripAccents(word));
  const answeredAt = Date.now();
  await stepper('Check Answer').click();
  await page.waitForTimeout(180);
  const kind = await feedbackKind();
  const said = await awaitNextShown();
  await shot(`B1a ${chapterId} ${activity.id} CORRECT`);
  const early = await spellerIndex();
  let late = early;
  while (late === before && Date.now() - answeredAt < CORRECT_MS * 3) {
    await page.waitForTimeout(50);
    late = await spellerIndex();
  }
  const elapsed = Date.now() - answeredAt;
  check(`5E §1 ${chapterId} ${activity.id} (retryUntilRight): correct auto-advances on max(2000ms, clip)`,
    kind === 'ok' && !said && early === before && late !== before && elapsed >= CORRECT_MS * 0.8,
    `feedback ${kind} for ${JSON.stringify(word)}, wait message ${said}, word ${before} -> ${late} at ${elapsed}ms`);
}

// Rule B1b, the one place a correct answer does NOT move: a whole-verse
// speller holds ONE item, so it marks correct, plays the verse and stops. It
// must not auto-drive the sequential rail, and it must not claim to be waiting
// for a Next it does not own.
for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
  const activity = activitiesOf(chapter).find(a => a && a.type === 'spellVerse');
  if (!activity) continue;
  const hash = `#/activity/${chapterId}/${activity.id}`;
  await go(hash);
  await setAccents(false);
  // Chapter 4's verse carries an ELISION MARK (δι' ἐμοῦ). The keyboard has a
  // key for it (D-29) and the mark is REQUIRED, so the verse is typed verbatim
  // — no workaround left in this line at all.
  await typeAccented(stripAccents((activity.answerWords || []).join(' ')));
  await stepper('Check Answer').click();
  await page.waitForTimeout(200);
  const kind = await feedbackKind();
  const said = await awaitNextShown();
  await shot(`B1b ${chapterId} solved verse stands still`);
  await page.waitForTimeout(CORRECT_MS * 1.6);
  check(`5E §1/B1b ${chapterId} ${activity.id}: a solved verse stops, drives no rail, claims no wait`,
    kind === 'ok' && !said && page.url().includes(activity.id),
    `feedback ${kind}, wait message ${said}, url ${page.url().split('#')[1] || ''}`);
}

// §5 / rule C0a, on ALL twelve spellers rather than the one sampled above: a
// wrong answer never reveals the correct spelling. `Show Answer` stays the
// opt-in route and is asserted separately in §6.6.
//
// The three whole-verse spellers are checked with the SAME rule but a
// different assertion, because D-13 is a ratified divergence on top of it:
// they name the one word that was missed ("The word you missed was: λόγος")
// where the original prints a bare index. That is one word out of the verse,
// deliberately, and it is asserted as such rather than waved past — what must
// never appear is the verse itself.
for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
  for (const activity of activitiesOf(chapter).filter(a => a && (a.type === 'spell' || a.type === 'spellVerse'))) {
    const isVerse = activity.type === 'spellVerse';
    await go(`#/activity/${chapterId}/${activity.id}`);
    await setAccents(false);
    await typeGreek('ζζζ');                       // wrong in every exercise in the app
    const typedBefore = await typed();
    await stepper('Check Answer').click();
    await page.waitForTimeout(200);
    const revealed = await page.locator('.spell-answer, .exercise-answer').count();
    await shot(`no-reveal ${chapterId} ${activity.id}`);
    const base = await feedbackKind() === 'bad' && revealed === 0
      && await typed() === typedBefore && !await awaitNextShown();
    if (!isVerse) {
      check(`5E §5 ${chapterId} ${activity.id}: a wrong answer reveals nothing and keeps what was typed`,
        base, `revealed ${revealed}, typed ${JSON.stringify(typedBefore)} -> ${JSON.stringify(await typed())}`);
      continue;
    }
    // D-13: exactly ONE word is named, and it is a word of the verse.
    const named = (await page.locator('.sv-detail .sv-word').allInnerTexts()).map(normalizeText);
    const words = (activity.answerWords || []).map(normalizeText);
    check(`5E §5 ${chapterId} ${activity.id}: a wrong answer names one missed word (D-13) and reveals no more`,
      base && named.length <= 1 && named.every(w => words.includes(w)),
      `named ${JSON.stringify(named)} of ${words.length} verse words, other reveals ${revealed}`);
  }
}

// The four classes are a CLOSED set (§1). Neither withdrawn name may survive
// anywhere in the delivered data — timing.js still normalizes them at runtime,
// so nothing but an assertion would notice one.
{
  const withdrawn = ['spellUntilRight', 'manualCorrectAutoIncorrect'];
  const found = [];
  for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
    for (const activity of activitiesOf(chapter)) {
      const declared = activity && activity.answerPolicy && activity.answerPolicy.advanceClass;
      if (withdrawn.includes(declared)) found.push(`${chapterId} ${activity.id} ${declared}`);
    }
  }
  check('5E §1 neither withdrawn class name survives in chapters 1-5',
    found.length === 0, found.join(', '));
}

// ------------------------------------------------- §6.2/§6.3 afterGuess audio
// A clip LONGER than the 2000ms class minimum is seeded into the app's own
// audio store, so the advance has to be max(2000, clip) and not 2000.
const LONG_CLIP_S = 3;
{
  const activity = activityById(ch4, 'c4_drill_greek_noun');
  const paths = activity.items.map(item => audioPath(item.audio)).filter(Boolean);
  await go('#/activity/chapt_4/c4_drill_greek_noun');
  await seedLongClip(paths, LONG_CLIP_S);
  const item = await freshKnownItem('#/activity/chapt_4/c4_drill_greek_noun', activity);

  const before = await itemNumber();
  const tiles = page.locator('.grid.options .tile');
  const labels = (await tiles.allInnerTexts()).map(normalizeText);
  const rightAt = labels.findIndex(text => text === normalizeText(item.answer));
  const answeredAt = Date.now();
  await tiles.nth(rightAt).click();

  let now = before;
  while (now === before && Date.now() - answeredAt < LONG_CLIP_S * 1000 * 2.5) {
    await page.waitForTimeout(50);
    now = await itemNumber();
  }
  const advancedAt = Date.now();
  const clip = await lastClip();
  check('5E §6.2 afterGuess: the clip is played after the guess',
    !!clip && !!clip.startedAt && clip.src.startsWith('blob:'), JSON.stringify(clip));
  check('5E §6.2 afterGuess: the next item waits for a clip longer than 2000ms',
    now !== before && !!clip && !!clip.endedAt && advancedAt >= clip.endedAt
      && advancedAt - answeredAt >= LONG_CLIP_S * 1000 * 0.9,
    `advanced ${advancedAt - answeredAt}ms after the guess; clip ran ${clip && clip.endedAt ? clip.endedAt - clip.startedAt : 'n/a'}ms`);

  // The same wait on the SPELLER, which is where 5E-SPEC3 §1 put a scheduled
  // advance that had never existed before: a correct spelling must hold the
  // next word until the word it just spelled has finished being spoken.
  {
    const speller = activityById(ch4, 'c4_ex_noun_speller');
    const answers = spellerAnswers('chapt_4', speller);
    const spellerPaths = (speller.items || [])
      .map(entry => audioPath(entry.audio)).filter(Boolean);
    await go('#/activity/chapt_4/c4_ex_noun_speller');
    await seedLongClip(spellerPaths, LONG_CLIP_S);
    await go('#/activity/chapt_4/c4_ex_noun_speller');
    const beforeWord = await promptGloss();
    await setAccents(false);
    await typeAccented(stripAccents(answers[0]));
    const spelledAt = Date.now();
    await stepper('Check Answer').click();
    let nowWord = beforeWord;
    while (nowWord === beforeWord && Date.now() - spelledAt < LONG_CLIP_S * 1000 * 2.5) {
      await page.waitForTimeout(50);
      nowWord = await promptGloss();
    }
    const movedAt = Date.now();
    const spokenClip = await lastClip();
    check('5E §6.2 afterGuess (speller): the next word waits for a clip longer than 2000ms',
      nowWord !== beforeWord && !!spokenClip && !!spokenClip.endedAt
        && movedAt >= spokenClip.endedAt
        && movedAt - spelledAt >= LONG_CLIP_S * 1000 * 0.9,
      `advanced ${movedAt - spelledAt}ms after the spelling; clip ran ${spokenClip && spokenClip.endedAt ? spokenClip.endedAt - spokenClip.startedAt : 'n/a'}ms`);

    // §2.3 on the speller: Next during that wait stops the clip and moves now.
    await go('#/activity/chapt_4/c4_ex_noun_speller');
    await setAccents(false);
    await typeAccented(stripAccents(answers[0]));
    await stepper('Check Answer').click();
    await page.waitForTimeout(300);
    const playingNow = await clipsPlaying();
    const pressed = Date.now();
    await stepper('Next').click();
    await page.waitForTimeout(150);
    check('5E §6.3 Next during a speller\'s afterGuess clip stops it and advances at once',
      playingNow === 1 && await clipsPlaying() === 0
        && await promptGloss() !== beforeWord && Date.now() - pressed < 600,
      `playing ${playingNow} -> ${await clipsPlaying()} in ${Date.now() - pressed}ms`);
  }

  // §6.3 / §2.3: Next during playback stops the clip and moves AT ONCE.
  const item2 = await freshKnownItem('#/activity/chapt_4/c4_drill_greek_noun', activity);
  const beforeNext = await itemNumber();
  const tiles2 = page.locator('.grid.options .tile');
  const labels2 = (await tiles2.allInnerTexts()).map(normalizeText);
  await tiles2.nth(labels2.findIndex(text => text === normalizeText(item2.answer))).click();
  await page.waitForTimeout(250);
  const playingBefore = await clipsPlaying();
  const pressedAt = Date.now();
  await stepper('Next').click();
  await page.waitForTimeout(150);
  const movedAt = Date.now();
  check('5E §6.3 Next during afterGuess playback stops the audio and advances at once',
    playingBefore === 1 && await clipsPlaying() === 0 && await itemNumber() !== beforeNext
      && movedAt - pressedAt < 600,
    `playing ${playingBefore} -> ${await clipsPlaying()}, item ${beforeNext} -> ${await itemNumber()} in ${movedAt - pressedAt}ms`);
}

// ---------------------------------------------------------------- §6.4 exits
// The reported defect: Say Whole Paradigm on chapter 4's Masculine Declension
// kept reading over the next topic and the next page. All three exits.
async function startParadigmClip() {
  await gotoTopic(4);
  const say = page.locator('.card .pg-actions .btn', { hasText: 'Say Whole' }).first();
  await say.click();
  await page.waitForTimeout(250);
  return clipsPlaying();
}
{
  await go('#/activity/chapt_4/c4_learn_nouns');
  const chartClip = await page.evaluate(() => null);   // keep the page settled
  void chartClip;
  await seedLongClip([], LONG_CLIP_S);                 // ensure the store exists
  await go('#/activity/chapt_4/c4_learn_nouns');

  let playing = await startParadigmClip();
  await page.getByRole('button', { name: 'Next Topic', exact: true }).click();
  await page.waitForTimeout(200);
  check('5E §6.4 audio stops on a TOPIC SWITCH inside a topicPages activity',
    playing === 1 && await clipsPlaying() === 0, `playing ${playing} -> ${await clipsPlaying()}`);

  await go('#/activity/chapt_4/c4_learn_nouns');
  playing = await startParadigmClip();
  await page.locator('.rail-next').click();
  await page.waitForTimeout(250);
  check('5E §6.4 audio stops on RAIL navigation',
    playing === 1 && await clipsPlaying() === 0, `playing ${playing} -> ${await clipsPlaying()}`);

  await go('#/activity/chapt_4/c4_learn_nouns');
  playing = await startParadigmClip();
  await page.evaluate(() => { location.hash = '#/chapter/chapt_4'; });
  await page.waitForTimeout(250);
  check('5E §6.4 audio stops on a ROUTE CHANGE',
    playing === 1 && await clipsPlaying() === 0, `playing ${playing} -> ${await clipsPlaying()}`);
}

// ------------------------------------------------------------ §6.5 spellers
// The two withdrawn leniencies, on EVERY word speller in chapters 1-5, using
// each speller's own first offending word rather than a hand-picked pair.
const BREATHINGS = new Set(['̓', '̔']);
function spellerAnswers(chapterId, activity) {
  const lexicon = LEXICON(chapterId);
  const lookup = ref => {
    for (const bucket of ['lemmas', 'exampleWords', 'ch1_lemma_mirror']) {
      if (lexicon[bucket] && lexicon[bucket][ref]) return lexicon[bucket][ref].greek;
    }
    return null;
  };
  // 5F: a speller item may carry its Greek as `answer` (the phrase and parse
  // spellers) as well as `greek` or by lexicon ref. `ref` on those items is a
  // scripture citation, not a lexicon key, so the lookup is tried last.
  return (activity.items || []).map(item => item.greek || item.answer || (item.ref ? lookup(item.ref) : null));
}
for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
  for (const activity of activitiesOf(chapter).filter(a => a && a.type === 'spell')) {
    const answers = spellerAnswers(chapterId, activity);
    const finalIndex = answers.findIndex(w => w && w.normalize('NFC').endsWith('ς'));
    const breathIndex = answers.findIndex(w => w && [...w.normalize('NFD')].some(c => BREATHINGS.has(c)));

    if (finalIndex >= 0) {
      const word = answers[finalIndex];
      await go(`#/activity/${chapterId}/${activity.id}`);
      await gotoItem(finalIndex);
      await setAccents(false);
      // Everything right except the final form: a medial sigma in final place.
      await typeAccented(stripAccents(word).replace(/ς$/u, 'σ'));
      await stepper('Check Answer').click();
      await page.waitForTimeout(120);
      check(`5E §6.5 ${chapterId} ${activity.id}: a missing final form is rejected`,
        await feedbackKind() === 'bad', `"${await typed()}" for "${word}"`);
    }
    if (breathIndex >= 0) {
      const word = answers[breathIndex];
      await go(`#/activity/${chapterId}/${activity.id}`);
      await gotoItem(breathIndex);
      await setAccents(false);
      // Everything right except the breathing, with "With Accents" OFF.
      await typeAccented(stripAllMarks(word));
      await stepper('Check Answer').click();
      await page.waitForTimeout(120);
      check(`5E §6.5 ${chapterId} ${activity.id}: a missing breathing is rejected with accents OFF`,
        await feedbackKind() === 'bad', `"${await typed()}" for "${word}"`);
      // ...and the same word WITH its breathing and no accents is accepted, so
      // the rule above is not simply "everything fails".
      await go(`#/activity/${chapterId}/${activity.id}`);
      await gotoItem(breathIndex);
      await setAccents(false);
      await typeAccented(stripAccents(word));
      await stepper('Check Answer').click();
      await page.waitForTimeout(120);
      check(`5E §6.5 ${chapterId} ${activity.id}: breathing kept, accents dropped, accepted`,
        await feedbackKind() === 'ok', `"${await typed()}" for "${word}"`);
    }
  }
}

// ------------------------------------------------------- §6.6 Show Answer
for (const [chapterId, activityId] of [
  ['chapt_1', 'c1_ex_speller'], ['chapt_3', 'c3_ex_vocab_speller'], ['chapt_5', 'c5_ex_vocab_speller']
]) {
  await go(`#/activity/${chapterId}/${activityId}`);
  const box = page.locator('.spell-checks label', { hasText: 'Show Answer' }).locator('input');
  await box.setChecked(true);
  const shown = await page.locator('.spell-answer').count();
  await page.keyboard.press('a');
  await page.waitForTimeout(80);
  check(`5E §6.6 ${chapterId} Show Answer clears as soon as typing resumes`,
    shown === 1 && await page.locator('.spell-answer').count() === 0 && !await box.isChecked(),
    `shown ${shown} -> ${await page.locator('.spell-answer').count()}, checkbox ${await box.isChecked()}`);
}

// -------------------------------------------- §5.2/§5.3 lists and underlines
// D1: EVERY list hangs. The offenders were the lists whose numbers are
// authored into the data ("1) 2) 3)"), which printed their marker as an inline
// span, so a wrapped rule ran back underneath its own number. Measured, not
// asserted from CSS: the marker box has to sit entirely to the LEFT of the
// text column, which is what a hanging indent is.
for (const [label, chapterId, activityId, button] of [
  ['ch2 Accent Rule Drill hint (six accent rules)', 'chapt_2', 'c2_drill_accent_rule', 'Hint'],
  ['ch2 Syllable Counting hint (three syllable rules)', 'chapt_2', 'c2_drill_syllable_counting', 'Hint'],
  // The Division exercise's control renders from activity.hint.label ("Hint"),
  // not from the "Hint: Rules" entry in ui.buttons — noted in the results.
  ['ch2 Syllable Division hint (three syllable rules)', 'chapt_2', 'c2_ex_syllable_division', 'Hint']
]) {
  await page.setViewportSize({ width: 320, height: 900 });
  await go(`#/activity/${chapterId}/${activityId}`);
  await page.locator('.card').getByRole('button', { name: button, exact: true }).click();
  await page.waitForTimeout(120);
  const item = page.locator('.rc-list.authored-labels > li').first();
  const marker = item.locator('.rc-num').first();
  const present = await marker.count() > 0;
  let hangs = false;
  let boxes = null;
  if (present) {
    const itemBox = await item.boundingBox();
    const markerBox = await marker.boundingBox();
    boxes = { item: itemBox, marker: markerBox };
    // The marker ends at or before the text column starts, and it is inside
    // the card (a hanging indent that hangs off the screen is not one).
    hangs = !!itemBox && !!markerBox
      && markerBox.x + markerBox.width <= itemBox.x + 1
      && markerBox.x >= 0;
  }
  check(`5E §5.2 ${label}: the list hangs its authored numbers`, present && hangs,
    JSON.stringify(boxes));
}
await page.setViewportSize({ width: 390, height: 900 });

// §5.3 (kept by 5E-SPEC3 §3): the two rules that NAME what they teach are
// underlined. The stamper shipped with 5E-SPEC3 underlines the PHRASE and
// leaves the full stop outside it, and it applies the rule wherever the phrase
// is displayed — the Learn topic's rule list and the two expander labels as
// well as the hints — so this asserts all five surfaces rather than the two
// hints 5E-SPEC2 checked. The same sentence must not look different in two
// places, and there are five of them.
for (const [label, chapterId, activityId, open] of [
  ['ch2 Accent Rule Drill hint', 'chapt_2', 'c2_drill_accent_rule', 'Hint'],
  ['ch2 Accent Mark Placement hint', 'chapt_2', 'c2_ex_accent_placement', 'Hint'],
  ['ch2 Quick Review accent rules', 'chapt_2', null, null]
]) {
  if (activityId) {
    await go(`#/activity/${chapterId}/${activityId}`);
    await page.locator('.card').getByRole('button', { name: open, exact: true }).click();
  } else {
    await go(`#/activity/${chapterId}/c2_qr_accents`);
  }
  await page.waitForTimeout(150);
  const underlined = (await page.locator('.rc-list u').allInnerTexts()).map(normalizeText);
  check(`5E §5.3 ${label}: "Nouns are retentive" and "Verbs are recessive" are underlined`,
    underlined.includes('Nouns are retentive') && underlined.includes('Verbs are recessive'),
    JSON.stringify(underlined));
}
// The Learn topic that teaches the six rules, and the two expander labels
// under it — the surfaces 5E-SPEC2 deliberately left plain and 5E-SPEC3's
// stamper marks up. The label is the one that would fail LOUDLY if the
// renderer did not honour [[u]] there: it would print the tag characters.
{
  await go('#/activity/chapt_2/c2_learn_accents');
  await gotoTopic(3);
  const listUnderlines = (await page.locator('.rc-list u').allInnerTexts()).map(normalizeText);
  const summaries = (await page.locator('.rc-expander summary').allInnerTexts()).map(normalizeText);
  const summaryUnderlines = (await page.locator('.rc-expander summary u').allInnerTexts()).map(normalizeText);
  check('5E §5.3 ch2 Learn Accent Rules: the rule list underlines both named rules',
    listUnderlines.includes('Nouns are retentive') && listUnderlines.includes('Verbs are recessive'),
    JSON.stringify(listUnderlines));
  // REVISED 2026-08-14. This used to assert the opposite of what it asserts
  // now: that the two named rules were UNDERLINED in their expander labels
  // too. Nathanael chose the interspersed arrangement after a four-way
  // comparison on device, and its accordions all read the same — the app's
  // emphasis green, no underline, seven of seven — so the label underline the
  // stamper used to put there is gone from the data. The prose above them
  // still underlines both rule names (the assertion directly above), which is
  // the original's own emphasis and is what 5E §5.3 was really protecting.
  //
  // The "no markup" half is unchanged and is the half that fails loudly: a
  // renderer that stopped honouring the inline spans would print the literal
  // [[u]] characters at the learner.
  check('5E §5.3 ch2 Learn Accent Rules: the expander labels carry no underline and print no markup',
    summaryUnderlines.length === 0 && summaries.every(text => !text.includes('[[')),
    JSON.stringify({ summaries, summaryUnderlines }));
  // The whole page is one treatment: every accordion, the six rules and the
  // chart alike, in --accent-ink with no decoration.
  const summaryColors = await page.locator('.rc-expander > summary').evaluateAll(nodes =>
    nodes.map(n => `${getComputedStyle(n).color}/${getComputedStyle(n).textDecorationLine}`));
  check('ch2 Learn Accent Rules: all seven accordions are green with no underline',
    summaryColors.length === 7 && summaryColors.every(s => s === 'rgb(31, 95, 87)/none'),
    JSON.stringify(summaryColors));
}

// ------------------------------------------------- §6.7 modals AT REST
// FOURTH REWRITE. Each previous one asserted something true that was not the
// thing that mattered:
//   1. `scrollIntoViewIfNeeded()` — proved the button existed somewhere
//      scrollable, which was never in doubt.
//   2. borders REACHABLE by driving the overlay's scroll — passed, and
//      "I cannot pull and click at the same time".
//   3. borders on screen AT REST, measured against the VIEWPORT — passed, and
//      the title was still behind the top bar and Close behind the tab bar.
//
// The third one is the instructive failure: the app draws a fixed top bar and
// a fixed bottom tab bar, so "inside the viewport" was never the constraint.
// The constraint is the GAP BETWEEN THE BARS. Measured at 390x844 before this
// change: bars at 0-56 and 790-844, modal at 20-824 — inside the viewport by
// 20px at each end and underneath a bar at both.
//
// So every assertion below is against the bars' own rects, which are in the
// same client-coordinate space the fixed overlay uses. Nothing is scrolled:
// this is the state the dialog opens in, hands off the screen.
//   * the modal's top border is at or below the top bar's bottom edge,
//   * its bottom border is at or above the tab bar's top edge,
//   * Close is entirely inside that same gap,
//   * the overlay has no scroll range left (range means the box did not fit),
//   * and the modal is the only scroll container under it.
//
// Heights are real ones. iPhone 14 is 390x844 CSS; Safari showing its toolbars
// leaves about 390x734, and with the URL bar expanded about 390x664. 320x360
// stays as the cruel case.
const MODAL_VIEWPORTS = [
  { width: 390, height: 844, name: 'iPhone 14' },
  { width: 390, height: 734, name: 'iPhone 14, toolbars' },
  { width: 390, height: 664, name: 'iPhone 14, URL bar' },
  { width: 320, height: 360, name: 'short 320' }
];
async function checkCloseReachable(label, open) {
  for (const { width, height, name } of MODAL_VIEWPORTS) {
    await page.setViewportSize({ width, height });
    await open();
    const close = page.locator('.modal .modal-actions .btn', { hasText: 'Close' }).first();
    if (await close.count() !== 1) {
      check(`5E §6.7 ${label}: both borders and Close clear the app bars AT REST at ${width}x${height} (${name})`,
        false, 'no close button found');
      continue;
    }
    const seen = await page.evaluate(() => {
      const overlay = document.querySelector('.modal-overlay');
      const modal = overlay.querySelector('.modal');
      const closeBtn = [...modal.querySelectorAll('.modal-actions .btn')]
        .find(b => /close/i.test(b.textContent));
      const box = el => { const r = el.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom) }; };
      const bar = sel => { const el = document.querySelector(sel); return el ? box(el) : null; };
      // NOTHING IS SCROLLED. This is the state the dialog opened in.
      const scrollers = [...overlay.querySelectorAll('*')].filter(el => {
        const s = getComputedStyle(el);
        return /auto|scroll/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 1;
      }).map(el => el.className || el.tagName);
      return {
        vh: window.innerHeight,
        modal: box(modal),
        close: box(closeBtn),
        topBar: bar('.topbar'),
        tabBar: bar('.bottom-bar'),
        overlayRange: overlay.scrollHeight - overlay.clientHeight,
        scrollers
      };
    });
    // The usable gap: below the top bar, above the tab bar. A missing bar
    // falls back to the viewport edge.
    const ceiling = seen.topBar ? seen.topBar.bottom : 0;
    const floor = seen.tabBar ? seen.tabBar.top : seen.vh;
    const topVisible = seen.modal.top >= ceiling - 1;
    const bottomVisible = seen.modal.bottom <= floor + 1;
    const closeVisible = seen.close.top >= ceiling - 1 && seen.close.bottom <= floor + 1;
    // Exactly ONE region inside the dialog may scroll, and the overlay must
    // have no range left — range there means the box did not fit between the
    // bars. Since DISCLOSURE-SPEC1 W4.1 that region is `.modal-scroll` for a
    // prose dialog and `.pg-body` for a CHART one: DISCLOSURE-RULES §4.3 puts
    // the say-all and its navigation control outside the scroller, so a
    // Paradigm hosted in a modal owns the scroll itself and pins its own row
    // between the chart and .modal-actions. The rule this line protects is
    // unchanged (one scroller, the overlay is not it); only which element plays
    // the part depends on what the dialog is showing.
    const SCROLL_REGIONS = ['modal-scroll', 'pg-body'];
    const onlyModalScrolls = seen.scrollers.every(c =>
      SCROLL_REGIONS.some(region => String(c).split(' ').includes(region)));
    check(`5E §6.7 ${label}: both borders and Close clear the app bars AT REST at ${width}x${height} (${name})`,
      topVisible && bottomVisible && closeVisible && seen.overlayRange === 0 && onlyModalScrolls,
      `modal ${seen.modal.top}..${seen.modal.bottom} inside gap ${ceiling}..${floor}, close ${seen.close.top}..${seen.close.bottom}, overlay range ${seen.overlayRange}, scrollers ${JSON.stringify(seen.scrollers)}`);
  }
  await page.setViewportSize({ width: 390, height: 900 });
}

for (const [label, chapterId, activityId] of [
  ['ch3 Verb Translating Hint', 'chapt_3', 'c3_drill_verb_translating'],
  ['ch4 Greek Noun Hint', 'chapt_4', 'c4_drill_greek_noun'],
  ['ch4 Declining Noun Hint', 'chapt_4', 'c4_drill_declining'],
  ['ch5 First Declension Noun Hint', 'chapt_5', 'c5_drill_first_decl_noun'],
  ['ch5 Declining Noun Hint', 'chapt_5', 'c5_drill_declining'],
  ['ch5 Definite Article Hint', 'chapt_5', 'c5_drill_article']
]) {
  await checkCloseReachable(label, async () => {
    await go(`#/activity/${chapterId}/${activityId}`);
    await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
    await page.waitForTimeout(80);
  });
  // ...and the reported case: the SAME modal with Meanings expanded, which is
  // what made it tall enough to strand its own Close button.
  const meanings = page.locator('.modal [data-paradigm-meanings] summary');
  await checkCloseReachable(`${label} + Meanings`, async () => {
    await go(`#/activity/${chapterId}/${activityId}`);
    await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
    await page.waitForTimeout(80);
    if (await meanings.count()) { await meanings.first().click(); await page.waitForTimeout(120); }
  });
}

await checkCloseReachable('ch3 Learn Verbs Endings popup', async () => {
  await go('#/activity/chapt_3/c3_learn_verbs');
  await gotoTopic(2);
  await page.locator('.card .pg-endings-open').first().click();
  await page.waitForTimeout(100);
});
await checkCloseReachable('ch1 speller Greek Keyboard reference', async () => {
  await go('#/activity/chapt_1/c1_ex_speller');
  await page.locator('.card').getByRole('button', { name: 'Greek Keyboard', exact: true }).click();
  await page.waitForTimeout(100);
});
await checkCloseReachable('ch5 whole-verse speller Greek Keyboard reference', async () => {
  await go('#/activity/chapt_5/c5_ex_scripture_speller');
  await page.locator('.card').getByRole('button', { name: 'Greek Keyboard', exact: true }).click();
  await page.waitForTimeout(100);
});
// THE STRUCTURAL HALF OF D3 — the shape a future edit is most likely to undo
// by accident, and the shape that was WRONG in what shipped. There is exactly
// one scroll container for a modal and it is the overlay. The modal takes no
// height cap and no overflow of its own; if it ever does, the overlay's scroll
// range collapses to zero again and the borders stop being reachable, which is
// the defect this replaces.
{
  await page.setViewportSize({ width: 320, height: 360 });
  await go('#/activity/chapt_4/c4_drill_greek_noun');
  await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
  await page.waitForTimeout(120);
  const shape = await page.locator('.modal-overlay').evaluate(el => {
    const overlay = getComputedStyle(el);
    const modalEl = el.querySelector('.modal');
    const modal = getComputedStyle(modalEl);
    return {
      overlayOverflowY: overlay.overflowY,
      overlayScrollRange: el.scrollHeight - el.clientHeight,
      modalOverflowY: modal.overflowY,
      modalMaxHeight: modal.maxHeight,
      modalDisplay: modal.display,
      // '.modal-scroll' for a prose dialog, '.pg-body' for a chart one — see
      // the SCROLL_REGIONS note above; W4.1 hands the scroll to Paradigm so the
      // control row can sit outside it.
      scrollRegionOverflowY: getComputedStyle(
        modalEl.querySelector('.modal-scroll, .pg-body')).overflowY,
      actionsFlex: getComputedStyle(modalEl.querySelector('.modal-actions')).flexGrow,
      modalVh: getComputedStyle(document.documentElement).getPropertyValue('--modal-vh').trim(),
      chromeTop: getComputedStyle(document.documentElement).getPropertyValue('--chrome-top').trim(),
      chromeBottom: getComputedStyle(document.documentElement).getPropertyValue('--chrome-bottom').trim(),
      nested: [...el.querySelectorAll('*')].filter(node => {
        const s = getComputedStyle(node);
        return /auto|scroll/.test(s.overflowY) && node.scrollHeight > node.clientHeight + 1;
      }).map(node => node.className || node.tagName)
    };
  });
  check('5E §6.7 the modal is a capped flex column: content scrolls, actions are a fixed footer',
    /auto|scroll/.test(shape.overlayOverflowY) && shape.overlayScrollRange === 0
      && shape.modalMaxHeight !== 'none' && shape.modalDisplay === 'flex'
      && shape.modalOverflowY === 'hidden'
      && /auto|scroll/.test(shape.scrollRegionOverflowY) && shape.actionsFlex === '0'
      && parseFloat(shape.chromeTop) > 0 && parseFloat(shape.chromeBottom) > 0
      && shape.nested.every(c => ['modal-scroll', 'pg-body']
        .some(region => String(c).split(' ').includes(region))),
    JSON.stringify(shape));
  await page.setViewportSize({ width: 390, height: 900 });
}

// The end-of-chapter dialog has no "Close" button by name; its escape actions
// are the ones that must be on screen — AT REST, like every other dialog.
for (const { width, height, name } of MODAL_VIEWPORTS) {
  await page.setViewportSize({ width, height });
  const last = ch1.sequence[ch1.sequence.length - 1];
  await go(`#/activity/chapt_1/${last}`);
  await page.locator('.rail-next').click();
  await page.waitForTimeout(150);
  const seen = await page.evaluate(() => {
    const overlay = document.querySelector('.modal-overlay');
    const stay = [...overlay.querySelectorAll('.modal-actions .btn')].find(b => /stay/i.test(b.textContent));
    const r = stay.getBoundingClientRect();
    const bar = sel => { const el = document.querySelector(sel); return el ? el.getBoundingClientRect() : null; };
    const top = bar('.topbar'), tab = bar('.bottom-bar');
    return {
      top: Math.round(r.top), bottom: Math.round(r.bottom),
      ceiling: top ? Math.round(top.bottom) : 0,
      floor: tab ? Math.round(tab.top) : window.innerHeight
    };
  });
  check(`5E §6.7 end-of-chapter dialog: its last action clears the app bars AT REST at ${width}x${height} (${name})`,
    seen.top >= seen.ceiling - 1 && seen.bottom <= seen.floor + 1, JSON.stringify(seen));
}
await page.setViewportSize({ width: 390, height: 900 });

// =========================================== 5E-SPEC3-RESPONSE items 1, 3, 4
// Three device-reported defects, each with the assertion that would have
// caught it. All three had shipped through a round of testing because nothing
// looked at the state they lived in.

// ---- item 1: one heading, not two --------------------------------------
// Chapter 5's seventh Learn topic is titled "First Declension—Masc" and its
// chart is titled "First Declension—Masculine". RichContent has deduplicated
// those since 5E-SPEC1 — but by matching the literal `--Masc`, so the moment
// the D2 rule rewrote the double hyphen as an em dash the two titles stopped
// keying the same and the heading came back doubled. A dedup key must not
// depend on which dash the typographic pass last chose.
{
  await go('#/activity/chapt_5/c5_learn_nouns');
  await gotoTopic(6);
  // Every leaf element on the card whose whole text is a "First Declension"
  // heading — the topic's own `.topic-heading` and the chart's `.pg-title`,
  // which is the pair that was rendering stacked.
  const headings = await page.evaluate(() => [...document.querySelectorAll('.card *')]
    .filter(el => el.children.length === 0 && /^\s*First Declension/i.test(el.textContent))
    .map(el => `${el.className}: ${el.textContent.trim()}`));
  check('5E-R1 ch5 Learn Greek Nouns / First Declension—Masc prints ONE heading, not two',
    headings.length === 1, JSON.stringify(headings));
}
// ...and the data sweep that established "masc" is the only abbreviation the
// key has to know about. A second one would silently double a heading again.
{
  const ABBREVIATIONS = /\b(masc|fem|neut|sing|plur|pl|nom|gen|dat|acc|voc)\b/i;
  // The renderer's own fold and cover rules (src/lib/content.js headingKey /
  // headingCovers). Copied, not imported, because content.js reaches for
  // import.meta.glob and cannot load outside Vite -- if the two ever disagree
  // this check is what says so, by flagging a pair the app quietly handles.
  const headingKey = t => String(t || '').trim().toLowerCase()
    .replace(/\u2014|\u2013|--/g, '-').replace(/\s+/g, ' ').replace(/\bmasc\b/, 'masculine');
  const headingCovers = (outer, inner) => {
    const o = headingKey(outer).split(' ').filter(Boolean);
    const i = headingKey(inner).split(' ').filter(Boolean);
    if (o.length <= i.length) return false;
    let at = 0;
    for (const word of i) { at = o.indexOf(word, at) + 1; if (at === 0) return false; }
    return true;
  };
  const mismatches = [];
  const replaced = [];
  const covered = [];
  for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
    for (const activity of activitiesOf(chapter)) {
      for (const topic of (activity && activity.topics) || []) {
        for (const block of topic.content || []) {
          // The heading the SURFACE prints for this block is the first one: a
          // charts[] stack shows chart 1 at rest and renames itself only as
          // More/Back steps, so asserting chart 3's title against the resting
          // page would be asserting a state nobody is looking at.
          const titles = [block.title, ...((block.charts || []).map(c => c && c.title))].filter(Boolean);
          for (const title of titles.slice(0, 1)) {
            // Fold through the RENDERER's key, not raw text: the Masc/Masculine
            // pair is one heading spelled two ways, RichContent drops the
            // chart's copy, and the topic's own heading is what prints.
            if (!topic.title || headingKey(title) === headingKey(topic.title)) continue;
            // 5G: the chart title may say the topic's heading AND MORE of it
            // ("Present Middle Paradigm" -> "Present Middle Indicative
            // Paradigm"). 5H widens that to any DIFFERENT panel heading: the
            // chapter-11 paradigm topics are named for the original's radio
            // labels ('"That" Paradigm') while the panel is headed with the
            // lemma, and the original drops the radio column on those screens.
            // Either way the host drops its own heading so exactly one prints,
            // which the surface loop below asserts pair by pair.
            covered.push([chapterId, activity.id, topic.title, title]);
            if (!headingCovers(title, topic.title)) {
              replaced.push(`${chapterId} ${JSON.stringify(topic.title)} vs ${JSON.stringify(title)}`);
            }
          }
        }
      }
    }
  }
  // Every remaining mismatch must be an abbreviation of the same heading, and
  // the only one the renderer's key expands is "masc".
  const unhandled = mismatches.filter(m => !/masc/i.test(m) || !ABBREVIATIONS.test(m));
  check('5E-R1 no topic/chart title pair reaches the surface unresolved by the fold',
    unhandled.length === 0, mismatches.length ? mismatches.join('; ') : 'no mismatches at all');
  // The fold key exists for exactly one abbreviation pair, and a second one
  // appearing in the data would silently double a heading again.
  check('5E-R1 the heading fold still equalises the one abbreviation pair it was written for',
    headingKey('First Declension—Masc') === headingKey('First Declension—Masculine')
      && ABBREVIATIONS.test('First Declension—Masc'),
    'masc -> masculine');
  check(`5E-R1 every REPLACED heading pair is a chapter-11 radio-label/panel-heading pair`,
    replaced.every(pair => pair.startsWith('chapt_11')), replaced.join('; ') || 'none');

  // ...and on the SURFACE: a covered pair prints ONE heading, the fuller one,
  // which is the heading the original prints in its panel. Two stacked
  // headings that differ by a single word is exactly the 5E-R1 defect.
  for (const [chapterId, activityId, topicTitle, chartTitle] of covered) {
    const chapter = CHAPTERS[chapterId];
    const activity = activityById(chapter, activityId);
    const index = (activity.topics || []).findIndex(t => t.title === topicTitle);
    await go(`#/activity/${chapterId}/${activityId}`);
    await gotoTopic(index);
    const headings = await page.evaluate(() => [...document.querySelectorAll('.card .topic-heading, .card .pg-title')]
      .map(el => el.textContent.replace(/\s+/g, ' ').trim()));
    check(`5E-R1 ${chapterId} ${activityId} "${topicTitle}" prints ONE heading: the chart's fuller "${chartTitle}"`,
      headings.length === 1 && normalizeText(headings[0]) === normalizeText(chartTitle),
      JSON.stringify(headings));
  }
}

// ---- item 3: the beforeGuess clip speaks on ARRIVAL ----------------------
// "the initial word no longer reads upon initial activity load." It did not:
// init() runs in the component's instance body, before Svelte evaluates any
// `$:` declaration, so the reactive `audioTiming` was undefined at that moment
// and the arrival branch returned early. Item 2 onwards spoke normally, which
// is exactly why it survived — every existing audio assertion answered an item
// first. This one asserts the clip on the FIRST item of every beforeGuess
// drill in chapters 1-5, having touched nothing.
{
  const beforeGuess = [];
  for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
    for (const activity of activitiesOf(chapter)) {
      if (activity && activity.type === 'select' && activity.audioTiming === 'beforeGuess') {
        beforeGuess.push([chapterId, activity.id]);
      }
    }
  }
  check('5E-R3 chapters 1-5 ship beforeGuess drills to test', beforeGuess.length >= 10, `${beforeGuess.length} found`);
  for (const [chapterId, activityId] of beforeGuess) {
    await page.evaluate(() => { window.__clips.length = 0; });
    await go(`#/activity/${chapterId}/${activityId}`);
    // No click, no keystroke: this is arrival and nothing else.
    await page.waitForTimeout(900);
    const spoke = await clips();
    check(`5E-R3 ${chapterId} ${activityId}: the first item speaks on arrival, with no interaction`,
      spoke.length >= 1 && !!spoke[0].startedAt,
      spoke.length ? JSON.stringify(spoke[0]) : 'no clip was created at all');
  }
}

// ---- item 4: the elision apostrophe -------------------------------------
// `δι᾽ ἐμοῦ` (John 14:6b). The mark after the iota is not a breathing, it is
// the elision apostrophe — and as of D-29 the keyboard has a key for it.
// Chapter 2 teaches the mark by name and scores it in the Marking Recognition
// Drill as an answer distinct from "Smooth Breathing"; chapter 4 then asks the
// learner to type it. All three ways of entering it are accepted here: the
// apostrophe itself, the smooth breathing the ORIGINAL represents it with, and
// nothing at all (D-18). Typed through the real keyboard in every case.
{
  const activity = activityById(ch4, 'c4_ex_scripture_speller');
  const strip = s => s.normalize('NFD').replace(/[̀́͂]/gu, '').normalize('NFC');
  const words = (activity.answerWords || []).map(w => strip(w).replace(/\.$/, ''));
  const elided = words.findIndex(w => /δι/.test(w));
  check('5E-R4 ch4 John 14:6b carries the elided δι᾽ this is about', elided >= 0, JSON.stringify(words));

  // (0) THE APOSTROPHE HAS A KEY. Chapter 2 taught this mark and scored it in
  // a drill; until this round no tile could produce it.
  {
    const tile = (TILES.punctuation || []).find(t => t.name === 'apostrophe');
    check('5E-R4 the shared keyboard has an apostrophe tile that inserts U+0027',
      !!tile && tile.insert === "'", JSON.stringify(tile));
    await go('#/activity/chapt_4/c4_ex_scripture_speller');
    const onScreen = await page.locator('.tk-key.punct[title="apostrophe"]').count();
    await page.locator('.tk-key.punct[title="apostrophe"]').first().click();
    await page.waitForTimeout(150);
    check('5E-R4 tapping it puts the elision mark in the field as its own character',
      onScreen === 1 && (await typed()).normalize('NFC') === "'",
      `tile count ${onScreen}, field ${JSON.stringify(await typed())}`);
  }

  // (a) THE VERSE TYPED VERBATIM, elision mark and all, through the tiles.
  // Before D-29 this line could not be written: typeAccented threw
  // `no punctuation tile inserts "᾽"`, which is the defect stated as a stack
  // trace. It is the primary case now; the breathing form below is the fallback.
  await go('#/activity/chapt_4/c4_ex_scripture_speller');
  await setAccents(false);
  await typeAccented(words.join(' '));
  const verbatimTyped = await typed();
  await stepper('Check Answer').click();
  await page.waitForTimeout(250);
  const verbatim = await feedbackKind();
  await shot('R4 elision typed with the new apostrophe tile');
  check('5E-R4 the verse typed VERBATIM with the apostrophe tile is accepted',
    verbatim === 'ok' && verbatimTyped.includes("'"),
    `feedback ${verbatim} for ${JSON.stringify(verbatimTyped)}`);

  // (b) with the elision mark typed as a SMOOTH BREATHING, the way the
  // original wrote it. REJECTED as of 2026-08-07 (rule C9): a diacritic on a
  // vowel and a spacing character standing for a dropped letter are different
  // marks, and an earlier pass here accepted either for either. The app has an
  // apostrophe key, so there is nothing the learner cannot type.
  await go('#/activity/chapt_4/c4_ex_scripture_speller');
  await setAccents(false);
  await typeAccented(words.map(w => (/δι/.test(w) ? 'δἰ'.normalize('NFC') : w)).join(' '));
  await stepper('Check Answer').click();
  await page.waitForTimeout(250);
  const withBreathing = await feedbackKind();
  await shot('R4 elision typed as a smooth breathing (rejected)');
  check('5E-R4 a smooth breathing is REJECTED where the verse elides (C9, not interchangeable)',
    withBreathing === 'bad', `feedback ${withBreathing} for ${JSON.stringify(await typed())}`);

  // (c) with no mark at all. This used to pass under D-18; it must not. An
  // elision mark is not sentence punctuation, it stands for a dropped letter,
  // and omitting it is a misspelling (Nathanael, 2026-08-07).
  await go('#/activity/chapt_4/c4_ex_scripture_speller');
  await setAccents(false);
  await typeAccented(stripElision(words.join(' ')));
  await stepper('Check Answer').click();
  await page.waitForTimeout(250);
  check('5E-R4 δι with NO elision mark is now REJECTED (the mark carries meaning)',
    await feedbackKind() === 'bad', `feedback ${await feedbackKind()}`);

  // (c) and the leniency is SCOPED: a breathing is still required where Greek
  // actually puts one, so this cannot be "the checker stopped caring".
  await go('#/activity/chapt_4/c4_ex_scripture_speller');
  await setAccents(false);
  await typeAccented(stripElision(words.map(w => stripAllMarks(w)).join(' ')));
  await stepper('Check Answer').click();
  await page.waitForTimeout(250);
  check('5E-R4 a verse stripped of its real breathings is still REJECTED',
    await feedbackKind() === 'bad', `feedback ${await feedbackKind()}`);
}

// ---- item 6: hold and drag moves the caret ------------------------------
// "You should be able to hold and drag to move the cursor in the spelling
// exercise, similar to the syllable placement exercise - currently this just
// selects the text." It did: the field is not an <input>, so a press-and-drag
// on it started an iOS text SELECTION and raised the Copy / Look Up /
// Translate callout over the exercise, and none of that could do anything.
const caretIndex = () => page.evaluate(() => {
  const field = document.querySelector('.spell-target');
  let n = 0;
  for (const child of field.children) {
    if (child.classList.contains('caret')) return n;
    if (child.classList.contains('sp-cluster')) n += 1;
  }
  return n;
});
{
  await go('#/activity/chapt_3/c3_ex_verb_speller');
  await setAccents(false);
  await typeGreek('λυει');                                   // four clusters, caret at the end
  const atEnd = await caretIndex();

  // The suppressors, read off the shipped element rather than the stylesheet.
  const style = await page.locator('.spell-target').evaluate(el => {
    const s = getComputedStyle(el);
    return { touchAction: s.touchAction, userSelect: s.userSelect || s.webkitUserSelect, callout: s.webkitTouchCallout };
  });
  check('5E-R6 the speller field claims the gesture (no page scroll, no selection, no callout)',
    style.touchAction === 'none' && /none/.test(String(style.userSelect)),
    JSON.stringify(style));

  // Drag from the right-hand end of the text to its left-hand end.
  const box = await page.locator('.spell-target .sp-cluster').first().boundingBox();
  const last = await page.locator('.spell-target .sp-cluster').last().boundingBox();
  const y = box.y + box.height / 2;
  await page.mouse.move(last.x + last.width - 1, y);
  await page.mouse.down();
  await page.mouse.move(last.x, y, { steps: 3 });
  const midway = await caretIndex();
  await page.mouse.move(box.x + 1, y, { steps: 6 });
  const dragged = await caretIndex();
  await page.mouse.up();
  const afterRelease = await caretIndex();

  check('5E-R6 dragging across the field sweeps the caret and it STAYS where the drag ended',
    atEnd === 4 && dragged === 0 && afterRelease === 0 && midway < atEnd,
    `caret ${atEnd} -> ${midway} midway -> ${dragged} at the left edge -> ${afterRelease} after release`);

  // A drag must not leave a text selection behind it.
  check('5E-R6 no text selection is created by the drag',
    await page.evaluate(() => String(window.getSelection())) === '',
    JSON.stringify(await page.evaluate(() => String(window.getSelection()))));

  // A plain tap still positions the caret — the behavior the drag is built on
  // top of, and the whole of VERIFY-5D A6 defect 1.
  await page.locator('.spell-target .sp-cluster').nth(1).click({ position: { x: 1, y: 5 } });
  await page.waitForTimeout(80);
  check('5E-R6 a plain tap still places the caret where it was tapped',
    await caretIndex() === 1, `caret ${await caretIndex()}`);

  // ...and typing at the moved caret INSERTS there rather than appending.
  await typeGreek('χ');
  check('5E-R6 typing at a dragged caret inserts in place',
    (await typed()).normalize('NFC') === 'λχυει', JSON.stringify(await typed()));
}

// ---- item 8: the apostrophe key is visually distinct --------------------
// U+1FBD is the same comma-above shape as the smooth-breathing key one row
// above it, so the two tiles were indistinguishable on device. The key is now
// PRINTED with U+0027, the straight vertical apostrophe — no curl, and not the
// acute or the grave either — while still INSERTING U+1FBD.
{
  const tile = (TILES.punctuation || []).find(t => t.name === 'apostrophe');
  const smooth = (TILES.diacritics || []).find(d => d.name === 'smooth breathing');
  check('5E-R8 the apostrophe key is printed AND inserts the straight U+0027',
    tile.label === "'" && tile.insert === "'", JSON.stringify(tile));
  check('5E-R8 its label differs from the smooth breathing, the acute and the grave',
    ![smooth.label, '´', '`'].includes(tile.label),
    `apostrophe ${JSON.stringify(tile.label)} vs smooth ${JSON.stringify(smooth.label)}`);

  await go('#/activity/chapt_4/c4_ex_scripture_speller');
  const printed = await page.locator('.tk-key.punct[title="apostrophe"]').innerText();
  await page.locator('.tk-key.punct[title="apostrophe"]').click();
  await page.waitForTimeout(120);
  check('5E-R8 the key on screen shows the straight form and types it',
    printed.trim() === "'" && (await typed()).normalize('NFC') === "'",
    `printed ${JSON.stringify(printed.trim())}, typed ${JSON.stringify(await typed())}`);
}

// ---- item 11: the caret is visible WHILE dragging -----------------------
// "the cursor itself does not appear until I lift my finger." The caret blinks
// with `animation: blink 1s step-start infinite`, and step-start jumps to the
// 50% keyframe at the START of the cycle — so its first 500ms are at opacity
// 0. The caret <span> is re-created at a new position on every pointermove, so
// the animation restarted on every one and never reached its visible half
// until the finger stopped. Asserted as OPACITY DURING A HELD DRAG.
{
  await go('#/activity/chapt_3/c3_ex_verb_speller');
  await setAccents(false);
  await typeGreek('λυει');
  const first = await page.locator('.spell-target .sp-cluster').first().boundingBox();
  const last = await page.locator('.spell-target .sp-cluster').last().boundingBox();
  const y = first.y + first.height / 2;
  await page.mouse.move(last.x + last.width - 1, y);
  await page.mouse.down();
  await page.mouse.move(first.x + 1, y, { steps: 6 });
  // Still held. This is the state Nathanael sees nothing in.
  const held = await page.evaluate(() => {
    const field = document.querySelector('.spell-target');
    const caret = field.querySelector('.caret');
    if (!caret) return { present: false };
    const s = getComputedStyle(caret);
    return {
      present: true,
      dragging: field.classList.contains('dragging'),
      opacity: Number(s.opacity),
      animationName: s.animationName,
      width: Math.round(parseFloat(s.width))
    };
  });
  await page.mouse.up();
  const released = await page.locator('.spell-target').evaluate(el => el.classList.contains('dragging'));
  check('5E-R11 the caret is drawn and fully opaque WHILE the drag is held',
    held.present && held.dragging && held.opacity === 1 && held.animationName === 'none',
    JSON.stringify(held));
  check('5E-R11 the blink resumes once the drag is released',
    released === false
      && await page.locator('.spell-target .caret').evaluate(el => getComputedStyle(el).animationName) === 'blink',
    `dragging after release ${released}`);
}

// ---- item 12: the verse spellers use Show Answer, not Major Hint --------
// D-30. One reveal idiom app-wide: a checkbox beside "With Accents", drawing
// BELOW the keyboard, clearing when typing resumes. No button, no 7s timer.
for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
  const activity = activitiesOf(chapter).find(a => a && a.type === 'spellVerse');
  if (!activity) continue;
  const hash = `#/activity/${chapterId}/${activity.id}`;
  await go(hash);

  const majorHint = await page.locator('.card').getByRole('button', { name: 'Major Hint', exact: true }).count();
  const box = page.locator('.spell-checks label', { hasText: 'Show Answer' }).locator('input');
  check(`5E-R12 ${chapterId} ${activity.id}: Major Hint is gone and Show Answer is a checkbox`,
    majorHint === 0 && await box.count() === 1,
    `Major Hint buttons ${majorHint}, Show Answer checkboxes ${await box.count()}`);

  await box.setChecked(true);
  await page.waitForTimeout(120);
  const shown = await page.locator('.sv-answer').count();
  // BELOW the keyboard, where every other speller puts its answer.
  const order = await page.evaluate(() => {
    const answer = document.querySelector('.sv-answer');
    const keyboard = document.querySelector('.tile-keyboard');
    if (!answer || !keyboard) return null;
    return keyboard.compareDocumentPosition(answer) & Node.DOCUMENT_POSITION_FOLLOWING ? 'below' : 'above';
  });
  const verse = normalizeText(await page.locator('.sv-answer .sv-verse').innerText());
  check(`5E-R12 ${chapterId} ${activity.id}: the answer shows the verse BELOW the keyboard`,
    shown === 1 && order === 'below'
      && verse === normalizeText((activity.answerWords || []).join(' ')),
    `panels ${shown}, position ${order}, verse ${JSON.stringify(verse.slice(0, 40))}`);
  await shot(`R12 ${chapterId} show answer`);

  // NO TIMER: it is still up well past the 7000ms the old panel lived for.
  await page.waitForTimeout(7600);
  check(`5E-R12 ${chapterId} ${activity.id}: it does NOT hide itself on a timer`,
    await page.locator('.sv-answer').count() === 1 && await box.isChecked(),
    `panels ${await page.locator('.sv-answer').count()}, checked ${await box.isChecked()}`);

  // ...and it clears the moment typing resumes, like every other speller.
  await typeGreek('λ');
  await page.waitForTimeout(120);
  check(`5E-R12 ${chapterId} ${activity.id}: it clears as soon as typing resumes`,
    await page.locator('.sv-answer').count() === 0 && !await box.isChecked(),
    `panels ${await page.locator('.sv-answer').count()}, checked ${await box.isChecked()}`);
}

// ---- rule C9: the two marks are never interchangeable, either way -------
// Asserted at the module level as well as through the UI, because "either way"
// needs the CORONIS direction too and no exercise types κἀγώ.
{
  const alternates = [];
  for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
    const seen = JSON.stringify(chapter);
    for (const ch of ['᾽', '’', 'ʼ', '‘']) {
      if (seen.includes(ch)) alternates.push(`${chapterId} contains U+${ch.codePointAt(0).toString(16).toUpperCase()}`);
    }
  }
  check('5E-C9 no chapter spells an elision mark as anything but U+0027',
    alternates.length === 0, alternates.join('; '));
}

// ===================================================================
// 5F: chapters 6, 7 and 8
// ===================================================================
// Everything above already sweeps the three new chapters (they are in
// CHAPTERS). What follows is what only they have: the ledger read back off the
// shipped surfaces activity by activity, the two-stage case drill, answerAlt
// in both of its shapes, per-item option rendering, the elision apostrophe
// round-tripping through the checker, and the popup pages.

// 5G: the ledger read-back sweep covers chapters 9 and 10 too — rows 79-95 of
// DRILLBEHAVIORLEDGER.csv were CONFIRMED before either chapter was built, so
// this is the assertion that the shipped surfaces agree with the stamp.
// 5H: chapters 11 and 12 join the ledger read-back for the same reason —
// DRILLBEHAVIORLEDGER.csv rows 96-115 were CONFIRMED before either chapter was
// built, so this sweep is what proves the shipped surfaces agree with the
// stamp rather than with a component default.
const CH_5F = { chapt_6: ch6, chapt_7: ch7, chapt_8: ch8, chapt_9: ch9, chapt_10: ch10,
                chapt_11: ch11, chapt_12: ch12 };

// ---- the ledger, read off the SURFACE, activity by activity --------------
// `audioTiming`, the Pronounce-Each default and the Previous/Next pair are
// stamped into the data from DRILLBEHAVIORLEDGER.csv, and the components read
// them from there. This asserts the SHIPPED SURFACE agrees with the stamp on
// every scored activity of the three chapters — which is the check that would
// notice a component quietly defaulting instead of reading.
for (const [chapterId, chapter] of Object.entries(CH_5F)) {
  for (const activity of activitiesOf(chapter).filter(a => a && (a.type === 'select' || a.type === 'spell' || a.type === 'spellVerse'))) {
    await go(`#/activity/${chapterId}/${activity.id}`);
    const buttons = (activity.ui && activity.ui.buttons) || [];
    const wantsStepper = buttons.includes('Previous') || buttons.includes('Next');
    const inCard = name => page.locator('.card').getByRole('button', { name, exact: true });
    // The activity's OWN pair, never the rail's (both say "Next").
    const hasPrev = await inCard('Previous').count() > 0;
    const hasNext = await inCard('Next').count() > 0;
    check(`5F ledger ${chapterId} ${activity.id}: Previous/Next ${wantsStepper ? 'present' : 'absent'} per the ledger`,
      hasPrev === wantsStepper && hasNext === wantsStepper,
      `declared [${buttons.join(', ')}], on screen Previous ${hasPrev} Next ${hasNext}`);

    const wantPronounceEach = (activity.ui && activity.ui.defaults
      && activity.ui.defaults.pronounceEach) ?? true;
    const box = page.locator('label', { hasText: /Pronounce each/i }).locator('input');
    if (await box.count()) {
      check(`5F ledger ${chapterId} ${activity.id}: Pronounce Each defaults ${wantPronounceEach ? 'ON' : 'OFF'}`,
        await box.first().isChecked() === !!wantPronounceEach,
        `checked ${await box.first().isChecked()}`);
    }

    // §2 audio timing, on arrival. `beforeGuess` speaks the prompt with no
    // click behind it; every other timing is silent until the learner acts.
    await page.waitForTimeout(400);
    const spokeOnArrival = (await clips()).some(c => c.startedAt);
    const timing = activity.audioTiming || (activity.type === 'select' ? 'beforeGuess' : 'afterGuess');
    check(`5F ledger ${chapterId} ${activity.id}: audioTiming "${timing}" — ${timing === 'beforeGuess' ? 'speaks' : 'is silent'} on arrival`,
      spokeOnArrival === (timing === 'beforeGuess'),
      `clips started on arrival: ${spokeOnArrival}`);
  }
}

// ---- every scored option grid, both outcomes ----------------------------
// Rule B1a on the correct path and the item's own advanceClass on the wrong
// one, for EVERY select drill in the three chapters — not a sample.
//
// The answer is read from the DATA rather than learned from a reveal, which
// these chapters make possible: every item carries its own `answer`, and the
// prompt plus its note identify the item on screen even where the Greek alone
// repeats (chapter 6 drills διά twice, once per case, and tells them apart by
// the gloss printed under it). Where a prompt is genuinely shared by items
// with DIFFERENT answers the item is skipped and the drill is retried, so a
// data ambiguity can never be reported as a broken advance.
// Chapter 7 keeps the plain ten-lemma vocabulary shape, so its two vocabulary
// drills carry no items at all — the pool IS the lexicon. Reconstruct the same
// {prompt, answer} pairs the app builds from it, so those two drills are swept
// like every other rather than skipped.
function fiveFItems(chapterId, activity) {
  if (Array.isArray(activity.items) && activity.items.length) return activity.items;
  if (!activity.promptFrom) return [];
  const lexicon = LEXICON(chapterId);
  const bucket = lexicon[activity.promptFrom.lexicon] || lexicon.lemmas || {};
  const chapter = CHAPTERS[chapterId];
  const gloss = lemma => lemma.glossShort || lemma.gloss;
  return (chapter.vocab || []).map(ref => bucket[ref]).filter(Boolean).map(lemma =>
    activity.promptFrom.show === 'greek'
      ? { prompt: lemma.greek, answer: gloss(lemma) }
      : { prompt: gloss(lemma), answer: lemma.greek });
}
async function fiveFItemOnScreen(chapterId, activity) {
  const prompt = await promptOnScreen();
  const note = await page.locator('.prompt-note').count()
    ? normalizeText(await page.locator('.prompt-note').innerText()) : null;
  const rendered = item => normalizeText([item.greek ?? item.prompt, item.greek2].filter(Boolean).join(' '));
  const hits = fiveFItems(chapterId, activity).filter(item =>
    rendered(item) === prompt && (note == null || normalizeText(item.note) === note));
  if (!hits.length) return null;
  const answers = new Set(hits.map(item => normalizeText(item.answer)));
  return answers.size === 1 ? { prompt, note, answer: hits[0].answer, options: hits[0].options } : null;
}
async function fiveFFreshItem(hash, chapterId, activity, tries = 12) {
  for (let attempt = 0; attempt < tries; attempt++) {
    await go(hash);
    const item = await fiveFItemOnScreen(chapterId, activity);
    if (item) return item;
  }
  return null;
}
for (const [chapterId, chapter] of Object.entries(CH_5F)) {
  for (const activity of activitiesOf(chapter).filter(a => a && a.type === 'select' && a.mode !== 'twoStageGrid')) {
    const hash = `#/activity/${chapterId}/${activity.id}`;
    const advanceClass = (activity.answerPolicy || {}).advanceClass;
    const tiles = () => page.locator(OPTION_TILES);

    // ---- correct -> auto-advances (B1a), never waits for Next
    {
      const item = await fiveFFreshItem(hash, chapterId, activity);
      if (!item) { check(`5F ${chapterId} ${activity.id}: correct auto-advances`, false, 'no unambiguously identified item in 12 passes'); continue; }
      const labels = (await tiles().allInnerTexts()).map(normalizeText);
      const at = labels.indexOf(normalizeText(item.answer));
      const before = await itemNumber();
      const answeredAt = Date.now();
      await tiles().nth(at).click();
      await page.waitForTimeout(180);
      const kind = await feedbackKind();
      const said = await awaitNextShown();
      let late = await itemNumber();
      while (late === before && Date.now() - answeredAt < CORRECT_MS * 3.5) {
        await page.waitForTimeout(50);
        late = await itemNumber();
      }
      const elapsed = Date.now() - answeredAt;
      check(`5F ${chapterId} ${activity.id} (${advanceClass}): a CORRECT answer auto-advances on max(2000ms, clip) and never waits`,
        at >= 0 && kind === 'ok' && !said && late !== before && elapsed >= CORRECT_MS * 0.8,
        `${JSON.stringify(item.prompt)} -> ${JSON.stringify(item.answer)}, feedback ${kind}, wait message ${said}, item ${before} -> ${late} at ${elapsed}ms`);
    }

    // ---- incorrect -> exactly what the class says
    {
      const item = await fiveFFreshItem(hash, chapterId, activity);
      if (!item) { check(`5F ${chapterId} ${activity.id}: incorrect behaves per its class`, false, 'no unambiguously identified item in 12 passes'); continue; }
      const labels = (await tiles().allInnerTexts()).map(normalizeText);
      const wrongAt = labels.findIndex(text => text !== normalizeText(item.answer));
      const before = await itemNumber();
      const answeredAt = Date.now();
      await tiles().nth(wrongAt).click();
      await page.waitForTimeout(200);
      const kind = await feedbackKind();
      const said = await awaitNextShown();
      // The paradigm grids repeat a form legitimately (nominative and vocative
      // plural are homographs), so assert WHAT is revealed, not how many.
      const revealed = (await page.locator('.grid.options .tile.correct, .option-group .tile.correct').allInnerTexts()).map(normalizeText);
      if (advanceClass === 'manualOnIncorrect') {
        await page.waitForTimeout(INCORRECT_MS * 1.3);
        check(`5F ${chapterId} ${activity.id} (manualOnIncorrect): an INCORRECT answer reveals, waits and says so`,
          wrongAt >= 0 && kind === 'bad' && said && revealed.length >= 1
            && revealed.every(text => text === normalizeText(item.answer))
            && await itemNumber() === before,
          `revealed ${JSON.stringify(revealed)} for ${JSON.stringify(item.answer)}, waiting ${said}, item ${before} -> ${await itemNumber()}`);
      } else if (advanceClass === 'autoBoth') {
        let late = await itemNumber();
        while (late === before && Date.now() - answeredAt < INCORRECT_MS * 2) {
          await page.waitForTimeout(60);
          late = await itemNumber();
        }
        const elapsed = Date.now() - answeredAt;
        check(`5F ${chapterId} ${activity.id} (autoBoth): an INCORRECT answer reveals and auto-advances on 4000ms`,
          wrongAt >= 0 && kind === 'bad' && !said && revealed.length >= 1
            && late !== before && elapsed >= INCORRECT_MS * 0.8,
          `revealed ${JSON.stringify(revealed)}, wait message ${said}, item ${before} -> ${late} at ${elapsed}ms`);
      } else {
        await page.waitForTimeout(INCORRECT_MS * 1.3);
        check(`5F ${chapterId} ${activity.id} (${advanceClass}): an INCORRECT answer reveals nothing and stays open`,
          wrongAt >= 0 && kind === 'bad' && !said && revealed.length === 0 && await itemNumber() === before,
          `revealed ${revealed.length}, waiting ${said}, item ${before} -> ${await itemNumber()}`);
      }
    }
  }
}

// ---- §2.9 the two-stage case drill --------------------------------------
{
  const activity = activityById(ch8, 'c8_drill_case');
  const HASH = '#/activity/chapt_8/c8_drill_case';
  const stage = index => page.locator(`.grid.options[data-stage="${index}"]`);
  const stageTiles = index => stage(index).locator('.tile');
  // The item on screen, identified by its Greek prompt. Several forms repeat
  // across items (αὐτῶν is genitive plural in all three genders) but they
  // repeat with the SAME answer, so the prompt identifies the answer even
  // where it does not identify the item.
  const answersFor = async () => {
    const prompt = await promptOnScreen();
    const hits = activity.items.filter(i => normalizeText(i.greek) === prompt);
    return { prompt, pairs: hits.length ? [hits[0].answer, ...(hits[0].answerAlt || [])] : [] };
  };

  await go(HASH);
  check('5F §2.9 the instruction line asks for two clicks',
    normalizeText(await page.locator('.instructions').first().innerText()) === 'Click on the person then the case',
    JSON.stringify(await page.locator('.instructions').first().innerText()));
  check('5F §2.9 both stages are on screen, person first',
    await stage(0).count() === 1 && await stage(1).count() === 1
      && await stage(0).getAttribute('data-stage-label') === 'person'
      && await stage(1).getAttribute('data-stage-label') === 'caseNumber',
    `stages ${await page.locator('.grid.options[data-stage]').count()}`);
  // ch8railwalk p8: the case grid is drawn in exactly the same state before
  // and after the person click. An earlier pass greyed it out to make the
  // instruction line's order visible; the original does not, so neither do we.
  check('5F §2.9 BOTH grids are live from the start (ch8railwalk p8)',
    !await stageTiles(0).first().isDisabled() && !await stageTiles(1).first().isDisabled(),
    `person disabled ${await stageTiles(0).first().isDisabled()}, case disabled ${await stageTiles(1).first().isDisabled()}`);

  // NOTHING is judged on the person click, however many times it is changed.
  await page.locator('.card').getByRole('button', { name: 'Score', exact: true }).click();
  const scoreBefore = normalizeText(await page.locator('.live-score').innerText());
  await stageTiles(0).nth(0).click();
  await page.waitForTimeout(120);
  const afterFirst = { kind: await feedbackKind(), score: normalizeText(await page.locator('.live-score').innerText()) };
  await stageTiles(0).nth(1).click();
  await page.waitForTimeout(120);
  await stageTiles(0).nth(2).click();
  await page.waitForTimeout(120);
  const afterThird = { kind: await feedbackKind(), score: normalizeText(await page.locator('.live-score').innerText()) };
  await shot('5F two-stage: three person clicks, nothing judged');
  check('5F §2.9 a person click is NOT judged — the learner may change their mind freely (VERIFY-5F item 7)',
    afterFirst.kind === 'none' && afterThird.kind === 'none'
      && afterFirst.score === scoreBefore && afterThird.score === scoreBefore,
    `feedback after 1 click ${afterFirst.kind}, after 3 ${afterThird.kind}; score ${scoreBefore} -> ${afterThird.score}`);
  check('5F §2.9 only the LAST person clicked is selected',
    await stage(0).locator('.tile.selected').count() === 1
      && normalizeText(await stage(0).locator('.tile.selected').innerText()) === normalizeText(await stageTiles(0).nth(2).innerText()),
    `${await stage(0).locator('.tile.selected').count()} selected`);

  // The pair is what is judged, in EITHER order: filling the case first and
  // the person second commits on the person click, and is still one attempt.
  {
    await go(HASH);
    const { pairs } = await answersFor();
    const [person, caseNumber] = pairs[0] || [];
    await stage(1).locator('.tile', { hasText: caseNumber }).first().click();
    await page.waitForTimeout(120);
    const midKind = await feedbackKind();
    await stage(0).locator('.tile', { hasText: person }).first().click();
    await page.waitForTimeout(180);
    check('5F §2.9 the pair commits in either order — case first is not judged on its own',
      midKind === 'none' && await feedbackKind() === 'ok',
      `after the case alone ${midKind}, after the pair ${await feedbackKind()}`);
  }

  // BOTH RIGHT: the pair is scored once, correct, and auto-advances (B1a).
  {
    await go(HASH);
    const { prompt, pairs } = await answersFor();
    const [person, caseNumber] = pairs[0] || [];
    const before = await itemNumber();
    await stage(0).locator('.tile', { hasText: person }).first().click();
    const answeredAt = Date.now();
    await stage(1).locator('.tile', { hasText: caseNumber }).first().click();
    await page.waitForTimeout(180);
    const kind = await feedbackKind();
    const said = await awaitNextShown();
    await shot('5F two-stage: both right');
    let late = await itemNumber();
    while (late === before && Date.now() - answeredAt < CORRECT_MS * 3) {
      await page.waitForTimeout(50);
      late = await itemNumber();
    }
    check('5F §2.9 both stages right: scored correct and auto-advances (B1a)',
      kind === 'ok' && !said && late !== before,
      `${JSON.stringify(prompt)} -> ${JSON.stringify([person, caseNumber])}, feedback ${kind}, item ${before} -> ${late} at ${Date.now() - answeredAt}ms`);
  }

  // WRONG SECOND STAGE: one attempt, manualOnIncorrect — reveals, waits, stays.
  {
    await go(HASH);
    const { prompt, pairs } = await answersFor();
    const [person, caseNumber] = pairs[0] || [];
    const before = await itemNumber();
    await stage(0).locator('.tile', { hasText: person }).first().click();
    const labels = (await stageTiles(1).allInnerTexts()).map(normalizeText);
    const wrongAt = labels.findIndex(text => !pairs.some(pair => normalizeText(pair[1]) === text));
    await stageTiles(1).nth(wrongAt).click();
    await page.waitForTimeout(200);
    const kind = await feedbackKind();
    const said = await awaitNextShown();
    const revealed = (await stage(1).locator('.tile.correct').allInnerTexts()).map(normalizeText);
    await shot('5F two-stage: wrong case');
    await page.waitForTimeout(INCORRECT_MS * 1.4);
    check('5F §2.9 wrong SECOND stage: one attempt, reveals the case, waits for Next (manualOnIncorrect)',
      kind === 'bad' && said && revealed.includes(normalizeText(caseNumber)) && await itemNumber() === before,
      `${JSON.stringify(prompt)} wrong case ${JSON.stringify(labels[wrongAt])}, revealed ${JSON.stringify(revealed)}, waiting ${said}, item ${before} -> ${await itemNumber()}`);
    check('5F §2.9 a judged item locks BOTH grids',
      await stageTiles(0).first().isDisabled() && await stageTiles(1).first().isDisabled());
  }

  // WRONG FIRST STAGE, right second: the pair is wrong, and it is the PAIR
  // that was judged — the person click on its own never was.
  {
    await go(HASH);
    const { prompt, pairs } = await answersFor();
    const [person, caseNumber] = pairs[0] || [];
    const people = (await stageTiles(0).allInnerTexts()).map(normalizeText);
    const wrongPerson = people.find(text => text !== normalizeText(person));
    await stage(0).locator('.tile', { hasText: wrongPerson }).first().click();
    await page.waitForTimeout(120);
    const midKind = await feedbackKind();
    await stage(1).locator('.tile', { hasText: caseNumber }).first().click();
    await page.waitForTimeout(200);
    await shot('5F two-stage: wrong person, right case');
    check('5F §2.9 wrong FIRST stage is judged only once the pair is complete',
      midKind === 'none' && await feedbackKind() === 'bad'
      && (await stage(0).locator('.tile.correct').allInnerTexts()).map(normalizeText).includes(normalizeText(person)),
      `${JSON.stringify(prompt)}: feedback after the wrong person alone ${midKind}, after the pair ${await feedbackKind()}`);
  }

  // §2.10 αὐτά: the chart prints it in the neuter nominative plural AND the
  // neuter accusative plural, and the original grades BOTH right.
  {
    const item = activity.items.find(i => (i.answerAlt || []).length);
    const alt = item.answerAlt[0];
    let found = false;
    for (let i = 0; i < 40 && !found; i++) {
      await go(HASH);
      for (let step = 0; step < activity.items.length; step++) {
        if (await promptOnScreen() === normalizeText(item.greek)) { found = true; break; }
        await stepper('Next').click();
        await page.waitForTimeout(40);
      }
    }
    if (!found) {
      check('5F §2.10 αὐτά accepts the ACCUSATIVE plural reading too (VERIFY-5F item 8)', false, 'never reached the item');
    } else {
      await stage(0).locator('.tile', { hasText: alt[0] }).first().click();
      await stage(1).locator('.tile', { hasText: alt[1] }).first().click();
      await page.waitForTimeout(200);
      await shot('5F answerAlt: the second reading of αὐτά');
      check('5F §2.10 αὐτά accepts the ACCUSATIVE plural reading too, on the CORRECT path (VERIFY-5F item 8)',
        await feedbackKind() === 'ok' && !await awaitNextShown(),
        `answered ${JSON.stringify(alt)} against authored ${JSON.stringify(item.answer)}, feedback ${await feedbackKind()}`);
    }
  }
}

// ---- §2.10 answerAlt on the εἰμί speller --------------------------------
// The third singular and plural print a moveable nu in parentheses. `answer`
// is the bare form, `answerAlt` the printed one, and BOTH are accepted. This
// is not general movable-nu leniency (D-16 stays withdrawn): the item next
// door, whose answerAlt is its own answer, still rejects a stray nu.
{
  const activity = activityById(ch7, 'c7_ex_speller_eimi');
  const HASH = '#/activity/chapt_7/c7_ex_speller_eimi';
  const at = index => (async () => { await go(HASH); await gotoItem(index); await setAccents(false); })();
  const parenIndex = activity.items.findIndex(i => (i.answerAlt || '').includes('('));
  const paren = activity.items[parenIndex];
  const bare = stripAccents(paren.answer);                       // ἐστίν  -> εστιν
  const noNu = bare.replace(/ν$/, '');                           // εστι

  await at(parenIndex);
  await typeAccented(bare);
  await stepper('Check Answer').click();
  await page.waitForTimeout(150);
  check(`5F §2.10 εἰμί speller: the bare form ${JSON.stringify(paren.answer)} is accepted`,
    await feedbackKind() === 'ok', `typed ${JSON.stringify(await typed())}`);

  await at(parenIndex);
  await typeAccented(noNu);
  await stepper('Check Answer').click();
  await page.waitForTimeout(150);
  check(`5F §2.10 εἰμί speller: the printed form ${JSON.stringify(paren.answerAlt)} is accepted without its parentheses`,
    await feedbackKind() === 'ok', `typed ${JSON.stringify(await typed())}`);

  // The leniency is THIS FIELD, not a rule. An item whose answerAlt equals its
  // answer gets no movable nu.
  const plainIndex = activity.items.findIndex(i => i.answerAlt === i.answer && !/\(/.test(i.answerAlt) && !/ν$/.test(i.answer));
  const plain = activity.items[plainIndex];
  await at(plainIndex);
  await typeAccented(stripAccents(plain.answer) + 'ν');
  await stepper('Check Answer').click();
  await page.waitForTimeout(150);
  check(`5F §2.10 the leniency is the FIELD, not a rule: ${JSON.stringify(plain.answer)} + ν is still wrong (D-16 stays withdrawn)`,
    await feedbackKind() === 'bad', `typed ${JSON.stringify(await typed())}`);
}

// ---- §3 the elision apostrophe round-trips through the checker -----------
// U+0027 is REQUIRED and is not interchangeable with a smooth breathing (C9 /
// D-29). Chapter 6 item 12 is ἐπ' ἀληθείας; chapters 7 and 8 elide in their
// verses. The tile has to exist in all three chapters' spellers and the
// checker has to insist on it.
{
  for (const [chapterId, chapter] of Object.entries(CH_5F)) {
    const activity = activitiesOf(chapter).find(a => a && a.type === 'spell');
    await go(`#/activity/${chapterId}/${activity.id}`);
    await page.locator('.card').getByRole('button', { name: 'Greek Keyboard', exact: true }).click();
    await page.waitForTimeout(120);
    const key = page.locator('.tk-key.punct[title="apostrophe"]');
    check(`5F §3 ${chapterId}: the U+0027 apostrophe tile is reachable on this chapter's speller keyboard`,
      await key.count() === 1, `${await key.count()} apostrophe tiles`);
  }

  const activity = activityById(ch6, 'c6_ex_speller');
  const index = activity.items.findIndex(i => i.answer.includes("'"));
  const answer = activity.items[index].answer;                   // ἐπ' ἀληθείας
  const HASH = '#/activity/chapt_6/c6_ex_speller';
  for (const [label, input, expect] of [
    ['typed WITH the apostrophe', stripAccents(answer), 'ok'],
    ['typed with the apostrophe DROPPED', stripAccents(answer).replace(/'/g, ''), 'bad']
  ]) {
    await go(HASH);
    await gotoItem(index);
    await setAccents(false);
    await typeAccented(input);
    await stepper('Check Answer').click();
    await page.waitForTimeout(150);
    check(`5F §3 ch6 ${JSON.stringify(answer)} ${label}: ${expect}`,
      await feedbackKind() === expect, `typed ${JSON.stringify(await typed())}`);
  }
  // The other half of C9, and the reason the "type a breathing instead" case
  // cannot be driven through the UI at all: NO tile produces any of the curled
  // alternates. The learner reaching for the elision mark can only find the
  // one spelling the app uses, which is what makes the two marks impossible to
  // confuse on the way in rather than merely unequal on the way out.
  const ALTERNATES = ['᾽', '’', 'ʼ', '‘'];
  const producible = new Set([
    ...(TILES.punctuation || []).map(t => t.insert),
    ...(TILES.letters || []), ...(TILES.composites || [])
  ]);
  check('5F §3 / C9 no speller tile can produce an elision-mark alternate — only U+0027 is reachable',
    ALTERNATES.every(mark => !producible.has(mark)) && producible.has("'"),
    `reachable alternates: ${ALTERNATES.filter(m => producible.has(m)).map(m => `U+${m.codePointAt(0).toString(16).toUpperCase()}`).join(', ') || 'none'}`);
}

// ---- §2.6 per-item options ----------------------------------------------
// The three translation drills carry their three options ON THE ITEM, not as a
// shared pool. Without that the drill would silently build its grid from the
// chapter's lemma list — ten plausible options, none of them the item's.
for (const [chapterId, id] of [
  ['chapt_6', 'c6_drill_translation'],
  ['chapt_7', 'c7_drill_translation'],
  ['chapt_7', 'c7_drill_translation_eimi'],
  ['chapt_8', 'c8_drill_translation'],
  ['chapt_8', 'c8_drill_translation_autos']
]) {
  const activity = activityById(CH_5F[chapterId], id);
  await go(`#/activity/${chapterId}/${id}`);
  const shown = (await page.locator('.grid.options .tile').allInnerTexts()).map(normalizeText);
  const prompt = await promptOnScreen();
  // The prompt may be set over two lines, so match on the first line.
  const item = activity.items.find(i => prompt.startsWith(normalizeText(i.greek)));
  check(`5F §2.6 ${chapterId} ${id}: the grid shows THIS ITEM's three options`,
    !!item && shown.length === item.options.length
      && item.options.every(option => shown.includes(normalizeText(option))),
    `prompt ${JSON.stringify(prompt)}; on screen ${JSON.stringify(shown)}; authored ${JSON.stringify(item ? item.options : null)}`);
  check(`5F §2.6 ${chapterId} ${id}: they stack one to a row (stack1col)`,
    await page.locator('.grid.options').first()
      .evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length) === 1);
}

// ---- §2.7 two-line Greek prompts ----------------------------------------
// greek2 is a LINE BREAK in one prompt, not a second prompt: one tap target,
// one clip. Null on the items that are one line only.
for (const [chapterId, id] of [['chapt_7', 'c7_drill_translation'], ['chapt_8', 'c8_drill_translation']]) {
  const activity = activityById(CH_5F[chapterId], id);
  let seenTwoLine = false;
  for (let i = 0; i < 25 && !seenTwoLine; i++) {
    await go(`#/activity/${chapterId}/${id}`);
    for (let step = 0; step < activity.items.length; step++) {
      const lines = await page.locator('.prompt .prompt-line2').count();
      if (lines === 1) {
        const prompt = await promptOnScreen();
        const item = activity.items.find(x => x.greek2 && prompt.startsWith(normalizeText(x.greek)));
        check(`5F §2.7 ${chapterId} ${id}: a two-line prompt is ONE tap target with one clip`,
          !!item && await page.locator('.prompt.greek-say').count() === 1
            && normalizeText(await page.locator('.prompt').first().innerText())
               === normalizeText(`${item.greek} ${item.greek2}`),
          `on screen ${JSON.stringify(await page.locator('.prompt').first().innerText())}`);
        seenTwoLine = true;
        break;
      }
      await stepper('Next').click();
      await page.waitForTimeout(40);
    }
  }
  if (!seenTwoLine) check(`5F §2.7 ${chapterId} ${id}: a two-line prompt is ONE tap target with one clip`, false, 'never met a two-line item');
}

// ---- §2.5 the note beside a prompt is INK, never a tap ------------------
// The "(not ἐκ)" disambiguator holds Greek and is still not tappable: the
// logged exception to directive 9.
{
  const activity = activityById(ch6, 'c6_ex_speller');
  const index = activity.items.findIndex(i => (i.note || '').includes('ἐκ'));
  await go('#/activity/chapt_6/c6_ex_speller');
  await gotoItem(index);
  const note = page.locator('.spell-prompt-note');
  check('5F §2.5 the "(not ἐκ)" note prints beside the prompt',
    await note.count() === 1 && normalizeText(await note.innerText()) === normalizeText(activity.items[index].note),
    JSON.stringify(await note.innerText().catch(() => null)));
  check('5F §2.5 it is INK, not a tap target, even though it holds Greek',
    await note.locator('button').count() === 0
      && await note.evaluate(el => getComputedStyle(el).cursor) !== 'pointer');
  // ON THE PROMPT'S LINE (ch6railwalk p10 sets "from God (not ἐκ)" as one
  // line). Same baseline, to the right, and never inside the prompt's own
  // element.
  const promptBox = await page.locator('.card.speller .flash-pane .value').first().boundingBox();
  const noteBox = await note.boundingBox();
  check('5F §2.5 the speller note sits ON the prompt line, to its right (ch6railwalk p10)',
    noteBox.y < promptBox.y + promptBox.height && noteBox.x > promptBox.x,
    `prompt y ${Math.round(promptBox.y)}..${Math.round(promptBox.y + promptBox.height)}, note y ${Math.round(noteBox.y)}`);
}
// ...and on a select prompt (chapter 6's case drill prints the gloss, chapter
// 8's vocabulary drill the case tag).
for (const [chapterId, id] of [['chapt_6', 'c6_drill_case'], ['chapt_6', 'c6_drill_vocab_gk_en'], ['chapt_8', 'c8_drill_vocab_gk_en']]) {
  // Not every item carries a note — chapter 8 tags only παρά and ὑπό — and
  // these pools are shuffled with no stepper, so reload until one comes up.
  const note = page.locator('.prompt-note');
  for (let attempt = 0; attempt < 30; attempt++) {
    await go(`#/activity/${chapterId}/${id}`);
    if (await note.count()) break;
  }
  const prompt = page.locator('.prompt').first();
  check(`5F §2.5 ${chapterId} ${id}: the case tag is ink beside the prompt, never inside its tap target`,
    await note.count() === 1 && await note.locator('button').count() === 0
      && await prompt.locator('.prompt-note').count() === 0,
    JSON.stringify(await note.innerText().catch(() => null)));
  const promptBox = await prompt.boundingBox();
  const noteBox = await note.boundingBox();
  check(`5F §2.5 ${chapterId} ${id}: it sits ON the prompt's line (ch6railwalk p8/p10)`,
    noteBox.y < promptBox.y + promptBox.height && noteBox.x > promptBox.x,
    `prompt y ${Math.round(promptBox.y)}..${Math.round(promptBox.y + promptBox.height)}, note y ${Math.round(noteBox.y)}`);
}

// ---- the case tag goes with the GREEK on a vocabulary card --------------
// ch6railwalk p10: "Greek Word: ἀπό (with gen.)" over "Word Meaning: from".
// The tag is part of the headword, not part of the gloss.
{
  await go('#/activity/chapt_6/c6_learn_vocab');
  await page.locator('.card').getByRole('button', { name: 'Next', exact: true }).click();
  await page.waitForTimeout(120);
  const greek = normalizeText(await page.locator('.flash-pane .value.greek').first().innerText());
  const meaning = normalizeText(await page.locator('.flash-pane').nth(1).locator('.value').first().innerText());
  check('5F ch6 Learn Vocabulary: the case tag rides with the GREEK, not the gloss (ch6railwalk p10)',
    /\(with \w+\.\)$/.test(greek) && !/\(with/.test(meaning),
    `Greek Word ${JSON.stringify(greek)}, Word Meaning ${JSON.stringify(meaning)}`);
}

// ---- a paradigm that runs singular then plural legends both -------------
// ch7railwalk p14: the Review Adjectives Paradigm prints "Singular" beside its
// N. row and "Plural" beside its N.V. row.
{
  await go('#/activity/chapt_7/c7_qr_adjectives');
  const bands = (await page.locator('.pg-numberband').allInnerTexts()).map(normalizeText);
  check('5F ch7 Review Adjectives Paradigm legends its Singular and Plural blocks (ch7railwalk p14)',
    bands.length === 2 && bands[0] === 'Singular' && bands[1] === 'Plural',
    JSON.stringify(bands));
  // No earlier chart authors `number`, so none of them may grow a band.
  for (const [chapterId, id] of [['chapt_4', 'c4_qr_nouns'], ['chapt_7', 'c7_qr_eimi'], ['chapt_8', 'c8_qr_first']]) {
    await go(`#/activity/${chapterId}/${id}`);
    if (!await page.locator('.card').count()) continue;
    check(`5F ${chapterId} ${id}: no number band where the data authors no number`,
      await page.locator('.pg-numberband').count() === 0);
  }
}

// ---- §3 a null ref renders NOTHING, not an empty chip -------------------
{
  const activity = activityById(ch8, 'c8_ex_speller');
  const index = activity.items.findIndex(i => i.ref == null);
  await go('#/activity/chapt_8/c8_ex_speller');
  await gotoItem(index);
  check('5F §3 chapter 8\'s blank-reference speller item renders no citation at all',
    index >= 0 && await page.locator('.spell-prompt-ref').count() === 0,
    `item ${index} (${JSON.stringify(activity.items[index] && activity.items[index].prompt)}), refs on screen ${await page.locator('.spell-prompt-ref').count()}`);
  // The item either side of it DOES carry one, so the assertion above is not
  // passing because the surface never prints a reference.
  await go('#/activity/chapt_8/c8_ex_speller');
  await gotoItem(0);
  check('5F §3 ...while an item that HAS a reference still prints it',
    await page.locator('.spell-prompt-ref').count() === 1);
}

// ---- §2.1 the Prepositions Chart, on both of its surfaces ---------------
for (const [label, hash, topicIndex] of [
  ['the Learn topic', '#/activity/chapt_6/c6_learn_prepositions', 4],
  ['Review Prepositions Chart', '#/activity/chapt_6/c6_qr_prepositions', null]
]) {
  const block = ch6.learn.find(a => a.id === 'c6_learn_prepositions')
    .topics.find(t => t.id === 'prepositionsChart').content[0];
  await go(hash);
  if (topicIndex != null) await gotoTopic(topicIndex);
  const nodes = page.locator('.prep-svg .prep-node');
  check(`5F §2.1 ${label}: all ten prepositions are drawn, ἐν at the centre`,
    await nodes.count() === block.nodes.length && await page.locator('.prep-centre').count() === 1
      // textContent, not innerText: these are SVG <text> nodes.
      && normalizeText(await page.locator('.prep-centre .prep-greek').textContent()) === 'ἐν',
    `${await nodes.count()} nodes of ${block.nodes.length}`);
  // 5F-FEEDBACK2 item 1: the chart is a TRACE of ch6railwalk p6 now, and its
  // linework is fixed in the component rather than derived from the data's
  // arrow field (which the original contradicts — μετά has no arrow at all).
  // Nine strokes: πρός, εἰς, ἐκ, ἀπό, διά, κατά's diagonal, κατά's drop,
  // περί's hook, and the ἐπί/upon underline.
  check(`5F §2.1 ${label}: the traced linework is drawn in full (9 strokes)`,
    await page.locator('.prep-svg .prep-arrow').count() === 9,
    `${await page.locator('.prep-svg .prep-arrow').count()} strokes of 9`);
  // Directive 9, on a diagram: every Greek label plays its own clip.
  await page.evaluate(() => { window.__clips.length = 0; });
  await nodes.first().click();
  await page.waitForTimeout(200);
  check(`5F §2.1 ${label}: a Greek label plays its clip`,
    (await clips()).length === 1, `${(await clips()).length} clips`);
  check(`5F §2.1 ${label}: it fits the 380px viewport without panning`,
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
}

// ---- §2.2 the popup pages ----------------------------------------------
// Every popup a chapter ships has to be REACHABLE — an unreachable one is a
// missing page in the rail, and nothing else in the app would say so.
for (const [chapterId, activityId, opener] of [
  ['chapt_6', 'c6_learn_prepositions', '.rc-sense-link'],
  // 5F-FEEDBACK.pdf item 15 (Nathanael, 2026-08-09): the popup opens from the
  // NUMBER marker now, not the Greek headword -- D-31r supersedes D-31's
  // original reading. See RichContent.svelte's numbered branch / DIVERGENCE-LOG.
  ['chapt_7', 'c7_learn_eimi', '.rc-num-popup'],
  ['chapt_8', 'c8_learn_third_person', '.popup-link']
]) {
  const activity = activityById(CH_5F[chapterId], activityId);
  const reached = new Set();
  const topics = activity.topics.length;
  for (let topicIndex = 0; topicIndex < topics; topicIndex++) {
    await go(`#/activity/${chapterId}/${activityId}`);
    await gotoTopic(topicIndex);
    const links = page.locator(opener);
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      await go(`#/activity/${chapterId}/${activityId}`);
      await gotoTopic(topicIndex);
      await page.locator(opener).nth(i).click();
      await page.waitForTimeout(120);
      const id = await page.locator('.popup-sheet').getAttribute('data-popup-id').catch(() => null);
      if (id) reached.add(id);
    }
  }
  const declared = (activity.popups || []).map(p => p.id);
  check(`5F §2.2 ${chapterId} ${activityId}: every one of its ${declared.length} popups is reachable from the page`,
    declared.every(id => reached.has(id)),
    `reached ${[...reached].join(', ') || 'none'}; missing ${declared.filter(id => !reached.has(id)).join(', ') || 'none'}`);
}
// The sheet's own behaviour: Cancel closes it, every Greek phrase on it plays,
// and it stops what it started on the way out (rule A4).
{
  await go('#/activity/chapt_6/c6_learn_prepositions');
  await gotoTopic(1);
  await page.locator('.rc-sense-link').first().click();
  await page.waitForTimeout(120);
  const examples = page.locator('.popup-example-greek');
  await page.evaluate(() => { window.__clips.length = 0; });
  await page.locator('.popup-head').click();
  await page.waitForTimeout(150);
  const headClips = (await clips()).length;
  await examples.first().click();
  await page.waitForTimeout(150);
  check('5F §2.2 the popup headword and every example phrase are tappable',
    headClips === 1 && (await clips()).length === 2 && await examples.count() >= 1,
    `${await examples.count()} examples, ${(await clips()).length} clips`);
  await shot('5F popup at rest');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.waitForTimeout(150);
  check('5F §2.2 Cancel closes the sheet and stops its audio (A4)',
    await page.locator('.popup-sheet').count() === 0 && await clipsPlaying() === 0,
    `sheets ${await page.locator('.popup-sheet').count()}, still playing ${await clipsPlaying()}`);
}

// ---- §2.8 the pronoun paradigm stack (More / Back) ----------------------
// 5F-FEEDBACK.pdf item 8/9 root-cause fix: chapter 8's third-person pronoun
// retired the bespoke PronounParadigm component (and its .pronoun-paradigm /
// data-gender markup) in favour of the SAME standard `paradigm` shape every
// other chapter's charts use -- one cell-audio table renderer, not two to
// keep in sync. The chart's own `subtitle` field ("Masculine" / "Feminine" /
// "Neuter") is what Paradigm.svelte stamps onto data-chart-name, so this
// asserts against the generic .paradigm host instead of the deleted one.
// REWRITTEN FOR DISCLOSURE-SPEC2 (amended §4.6). The three gender charts used
// to be a More/Back sequence on this REVIEW page and most of this block drove
// that pager. The device review (item 4) revoked pagers on Review pages
// outright, with a rationale that is not about taste — students may want to
// PRINT the page, so all of it has to be visible. The chart contract itself
// (one standard `paradigm` shape, four case rows over two columns, each chart
// reporting its own data-chart-name, cells that play their own clip) is what
// this block was really protecting in 5F, and all of it still holds; it is now
// asserted across the three STACKED charts instead of through a pager.
{
  await go('#/activity/chapt_8/c8_qr_third');
  const charts = page.locator('.card .paradigm');
  const genders = await charts.evaluateAll(nodes => nodes.map(n => n.getAttribute('data-chart-name')));
  check('5F §2.8 / §4.6 all three third-person charts are on the page at once, each naming itself',
    genders.join(' ') === 'Masculine Feminine Neuter', genders.join(' -> ') || 'none');
  check('5F §4.6 and nothing pages between them',
    await page.locator('.card [data-paradigm-switch], .card .pg-nav').count() === 0);
  // Four case rows over two columns, on every one of the three charts.
  const shapes = await charts.evaluateAll(nodes => nodes.map(n =>
    `${n.querySelectorAll('.pg-row').length}x${n.querySelector('.pg-row').querySelectorAll('.pg-cell').length}`));
  check('5F §2.8 four case rows over a Singular and a Plural column, on each chart',
    shapes.join(' ') === '4x2 4x2 4x2', shapes.join(' '));
  // Directive 9: a cell whose form has a clip plays it.
  await page.evaluate(() => { window.__clips.length = 0; });
  await charts.first().locator('.pg-greek-tap:not([disabled])').first().click();
  await page.waitForTimeout(200);
  check('5F §2.8 a paradigm cell plays its own clip', (await clips()).length === 1);

  // Rule A4 on a CHART SWITCH. §6.4 covers a topic switch, rail navigation and
  // a route change; stepping between the charts of a paradigms[] stack is a
  // fourth way out of a surface that is playing, and it changes neither the
  // route nor the topic — the shape of the defect 5E-SPEC2 §3.1 reported.
  // Moved to the LEARN page, which is where a chart switch still exists:
  // §4.1/§4.2 paging is unchanged there and only Review lost its pager.
  await go('#/activity/chapt_8/c8_learn_third_person');
  await gotoTopic(1);
  await page.locator('.card .pg-actions .btn', { hasText: 'Say Whole' }).first().click();
  await page.waitForTimeout(250);
  const playingBefore = await clipsPlaying();
  await page.locator('[data-paradigm-switch="more"]').click();
  await page.waitForTimeout(200);
  check('5F §2.8 audio stops on a CHART SWITCH inside a paradigms[] stack (A4)',
    playingBefore === 1 && await clipsPlaying() === 0,
    `playing ${playingBefore} -> ${await clipsPlaying()}`);
}

// ---- every Quick Review chart offers its Say Whole action EXACTLY once ---
// A chart may carry the action itself or the activity may carry it beside the
// chart, and both routes drawing it printed "Say Whole List" twice on the εἰμί
// chart before this was asserted.
//
// TWO ways a multi-chart page is drawn, since 5G: a NAMED stack is a More/Back
// sequence with one chart on screen at a time, an UNNAMED one is both charts
// stacked on a single page. The check counts controls against whatever is
// actually on screen rather than assuming the pager exists.
//
// It also matches the CONTROL, not the label. It used to match a button named
// /^Say Whole/, which silently assumed every chapter calls the button the same
// thing; chapters 9 and 10 print the original's own "Say Paradigm" and the
// check read that as a missing control. The class is what the renderer
// guarantees; the wording is the original's business, chapter by chapter.
for (const [chapterId, chapter] of Object.entries(CH_5F)) {
  for (const activity of activitiesOf(chapter).filter(a => a && a.mode === 'paradigmChart')) {
    const charts = activity.paradigms || (activity.paradigm ? [activity.paradigm] : []);
    // AMENDED §4.6 (DISCLOSURE-SPEC2): a Review page stacks EVERY chart it
    // carries, named or not. The name/no-name distinction that used to decide
    // this is still real and still decides paging on Learn pages; it has no
    // authority on a Review page, which must be printable in one scroll. The
    // paged branch below is therefore reached only by a single-chart page now,
    // where its loop runs once and steps nothing.
    const stacked = charts.length > 1;
    const sayWholeCount = () => page.locator('.card .pg-say-whole').count();
    if (stacked) {
      await go(`#/activity/${chapterId}/${activity.id}`);
      const wants = charts.filter(chart => !!(chart.sayWhole || activity.sayWhole)).length;
      const count = await sayWholeCount();
      check(`5F ${chapterId} ${activity.id}: ${wants} Say-Whole action${wants === 1 ? '' : 's'} on the stacked page, one per chart that carries one`,
        count === wants, `${count} on screen`);
      continue;
    }
    for (const [index, chart] of charts.entries()) {
      await go(`#/activity/${chapterId}/${activity.id}`);
      for (let step = 0; step < index; step++) {
        await page.locator('[data-paradigm-switch="more"]').click();
        await page.waitForTimeout(80);
      }
      const wants = !!(chart.sayWhole || activity.sayWhole);
      const count = await sayWholeCount();
      check(`5F ${chapterId} ${activity.id} chart ${index + 1}: the Say Whole action is drawn ${wants ? 'exactly once' : 'not at all'}`,
        count === (wants ? 1 : 0), `${count} on screen`);
    }
  }
}

// ---- §2.4 underlining is DATA ------------------------------------------
// The [[u]] runs come from the TBK's own run tables. Assert the count on
// screen equals the count in the data, chapter by chapter: an underline the
// renderer invented, or dropped, shows up here as a mismatch.
for (const [chapterId, chapter] of Object.entries(CH_5F)) {
  const marked = [];
  (function scan(node) {
    if (Array.isArray(node)) return node.forEach(scan);
    if (node && typeof node === 'object') {
      for (const [key, value] of Object.entries(node)) if (!key.startsWith('_')) scan(value);
      return;
    }
    if (typeof node === 'string') for (const m of node.matchAll(/\[\[u\]\]([\s\S]*?)\[\[\/u\]\]/g)) marked.push(m[1]);
  })(chapter);
  // Walk the teaching activities the runs live in and count what renders.
  const seen = [];
  for (const activity of activitiesOf(chapter).filter(a => a && a.type === 'contentAudio')) {
    const topics = (activity.topics || []).length || 1;
    for (let topicIndex = 0; topicIndex < topics; topicIndex++) {
      await go(`#/activity/${chapterId}/${activity.id}`);
      if (activity.topics) await gotoTopic(topicIndex);
      // `.underline-link` is an authored [[u]] run that ALSO names a popup
      // (chapter 8's Three Uses labels), so it counts as a rendered underline.
      // The other popup links do not: chapter 6's are gloss links declared by
      // popupRef and chapter 7's are Greek headwords, neither of which the run
      // tables underline.
      for (const text of await page.locator('.card u, .card .underline-link').allInnerTexts()) seen.push(normalizeText(text));
    }
  }
  const missing = marked.map(normalizeText).filter(text => !seen.includes(text));
  check(`5F §2.4 ${chapterId}: every authored [[u]] run renders (underlined, or as the popup link it names)`,
    missing.length === 0,
    `${marked.length} authored, ${seen.length} on screen; missing ${JSON.stringify(missing.slice(0, 4))}`);
  check(`5F §2.4 ${chapterId}: the renderer invents no underline the data does not carry`,
    seen.every(text => marked.map(normalizeText).includes(text)),
    `unexpected ${JSON.stringify(seen.filter(t => !marked.map(normalizeText).includes(t)).slice(0, 4))}`);
}

// ---- §1/§2 the case-split vocabulary pool ------------------------------
// Chapter 6 presents SIXTEEN cards over ten lemmas and chapter 8 THIRTEEN over
// ten; neither is the ten-card lemma pool chapters 1-5 use. Counted through
// the flashcard's own stepper.
for (const [chapterId, activityId, expected] of [
  ['chapt_6', 'c6_learn_vocab', 16],
  ['chapt_7', 'c7_learn_vocab', 10],
  ['chapt_8', 'c8_learn_vocab', 13]
]) {
  await go(`#/activity/${chapterId}/${activityId}`);
  // ADJUSTED FOR DISCLOSURE-SPEC3 W2 (DRILL-BEHAVIOR-RULES B-last). The count
  // is unchanged and is still the thing under test; what changed is where the
  // walk starts. Learn Vocabulary used to open on a "Click Next to begin"
  // screen, so N presses of Next reached N cards; card 1 is on screen from
  // mount now, so the same N cards are N-1 presses away. Counting the ARRIVAL
  // as card 1 keeps this asserting the pool size rather than the press count,
  // which is what it was written for — and it would have gone on passing
  // silently at N-1 if the start had merely been decremented.
  let cards = 1;
  const next = page.locator('.card').getByRole('button', { name: 'Next', exact: true });
  while (!await next.isDisabled() && cards < 40) { await next.click(); cards += 1; }
  check(`5F §3 ${chapterId} Learn Vocabulary steps through ${expected} cards, not ten`,
    cards === expected, `${cards} cards`);
}

// ------------------------------------------------------ §6.8 option grids
// A CENSUS, not a list: every select activity in chapters 1-5, measured at both
// widths. The responsive pool must be 2-up at 320 and 4-up at 768 whatever
// language its labels are in; the paradigm-shaped grids stay 2-up at both
// (D-26); and the only other grids allowed to differ are the ones whose data
// DECLARES a layout (optionLayout single/paradigm2col, optionGroups) or whose
// options are single glyphs. Anything else stuck at four-up would be the D-19
// defect returning, and this is what would catch it.
{
  const declaredLayout = a => a.optionLayout
    || (Array.isArray(a.optionGroups) && a.optionGroups.length ? 'grouped' : null);
  const census = [];
  for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
    for (const activity of activitiesOf(chapter).filter(a => a && a.type === 'select')) {
      const cols = {};
      for (const width of [320, 768]) {
        await page.setViewportSize({ width, height: 900 });
        await go(`#/activity/${chapterId}/${activity.id}`);
        cols[width] = await page.locator('.grid.options').first()
          .evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
      }
      census.push({ chapterId, id: activity.id, layout: declaredLayout(activity), cols });
    }
  }
  await page.setViewportSize({ width: 390, height: 900 });

  // The LEXICON-DERIVED vocabulary pools, in BOTH directions, are the grids
  // D-19 is about: 2-up on a phone, 4-up once the iPad has room.
  //
  // 5F: chapters 6 and 8 present their vocabulary CASE-SPLIT (sixteen entries
  // over ten lemmas, fifteen over ten), and two of chapter 6's option captions
  // differ from its gloss pool outright, so those four drills ship AUTHORED
  // option grids rather than naming a lexicon pool. The renderer has no way to
  // tell an authored vocabulary grid from any other authored grid — nothing in
  // the data says so, and keying it to an activity id is exactly what rule B1
  // forbids — so they render 2-up at both widths, like every other authored
  // grid. That is a real, small divergence from D-19's intent and it is
  // asserted here as what it is rather than dropped from the census.
  // See 5F-SPEC1-RESULTS §5 and DIVERGENCE-LOG D-32.
  // 5G: chapters 9 and 10 ship their vocabulary drills as AUTHORED grids too
  // -- not because the vocabulary is case-split (it is not; ten lemmas, ten
  // options) but because the pipeline authored optionValues rather than naming
  // a lexicon pool. Same renderer consequence, same divergence, same fix
  // pending: the vocabulary-pool marker Stage 8.8 already owes chapters 6 and
  // 8 (D-32). Listed here as what it is rather than dropped from the census.
  // DISCLOSURE-SPEC1 W9 CLOSES THIS DIVERGENCE, and this assertion inverts with
  // it. "The renderer has no way to tell an authored vocabulary grid from any
  // other authored grid" was true only for as long as nothing in the data said
  // so; `poolKind: "vocabulary"` is the marker Stage 8.8 owed (D-32 and its
  // 5G-SPEC1 extension), and all eight of these drills now carry it. They join
  // D-19 like every other vocabulary pool, so they are asserted with the
  // vocabulary set below rather than against it. What still has to hold — and
  // is what would break if the predicate widened instead of being told — is
  // that no OTHER authored grid moved: the census check further down pins the
  // rest, and ui-disclosure.mjs D6.2 pins a named control.
  const AUTHORED_VOCAB = new Set([
    'c6_drill_vocab_gk_en', 'c6_drill_vocab_en_gk',
    'c8_drill_vocab_gk_en', 'c8_drill_vocab_en_gk',
    'c9_drill_vocab_gk_en', 'c9_drill_vocab_en_gk',
    'c10_drill_vocab_gk_en', 'c10_drill_vocab_en_gk'
  ]);
  const vocabulary = census.filter(row => /_vocab_(gk_en|en_gk)$/.test(row.id));
  for (const row of census.filter(row => AUTHORED_VOCAB.has(row.id))) {
    const activity = activitiesOf(CH_5F[row.chapterId] || {}).find(a => a && a.id === row.id);
    check(`DISCLOSURE W9 ${row.chapterId} ${row.id}: carries poolKind and joins D-19 (D-32 closed)`,
      activity && activity.poolKind === 'vocabulary' && row.cols[320] === 2 && row.cols[768] === 4,
      `poolKind ${activity && activity.poolKind}, ${row.cols[320]} / ${row.cols[768]} columns`);
  }
  const paradigm = census.filter(row => row.layout === 'paradigm2col');
  const declared = census.filter(row => row.layout === 'single');
  // 5G: a GROUPED layout is not automatically one option per line. Chapter 3's
  // six full parsings are 48 characters and stack; chapters 9 and 10 group
  // SHORT labels in pairs ("First Singular | First Plural"), which is how the
  // original draws them. The label length decides, so the census asks the
  // question the renderer asks rather than pinning one chapter's answer.
  const longestOption = a => (a.optionValues || []).reduce((n, v) => Math.max(n, String(v).length), 0);
  const grouped = census.filter(row => row.layout === 'grouped');

  for (const row of vocabulary) {
    check(`5E §6.8 ${row.chapterId} ${row.id}: option grid is 2-up at 320px and 4-up at 768px`,
      row.cols[320] === 2 && row.cols[768] === 4, `${row.cols[320]} / ${row.cols[768]} columns`);
  }
  for (const row of paradigm) {
    check(`5E §6.8 ${row.chapterId} ${row.id}: paradigm grid stays 2-up at both widths (D-26)`,
      row.cols[320] === 2 && row.cols[768] === 2, `${row.cols[320]} / ${row.cols[768]} columns`);
  }
  for (const row of declared) {
    check(`5E §6.8 ${row.chapterId} ${row.id}: declared "${row.layout}" layout is single-column at both widths`,
      row.cols[320] === 1 && row.cols[768] === 1, `${row.cols[320]} / ${row.cols[768]} columns`);
  }
  for (const row of grouped) {
    const longest = longestOption(activityById(CHAPTERS[row.chapterId], row.id));
    const want = longest > 24 ? 1 : 2;
    check(`5E §6.8 ${row.chapterId} ${row.id}: grouped layout is ${want}-up at both widths (longest option ${longest} chars)`,
      row.cols[320] === want && row.cols[768] === want, `${row.cols[320]} / ${row.cols[768]} columns`);
  }

  // THE PHONE-WIDTH GUARD, which is the half of D-19 that protects reading.
  // Four columns inside 320px is only ever legible for one-glyph tiles, digits
  // and the chapter-1 letter-name generators, which the device pass ratified at
  // four-up. That set is NAMED: a new grid arriving four-up on a phone fails
  // here instead of shipping and being found on device.
  const FOUR_UP_AT_320 = new Set([
    'c1_ex_letter_to_name', 'c1_ex_name_to_letter', 'c1_ex_translit', 'c1_ex_transcribe',
    'c2_drill_syllable_counting'
  ]);
  const wide = census.filter(row => row.cols[320] === 4).map(row => row.id);
  const unexpected = wide.filter(id => !FOUR_UP_AT_320.has(id));
  const missing = [...FOUR_UP_AT_320].filter(id => !wide.includes(id));
  check('5E §6.8 four-up at 320px is confined to the named single-glyph/number grids',
    unexpected.length === 0 && missing.length === 0,
    `four-up at 320: ${wide.join(', ') || 'none'}${unexpected.length ? `; UNEXPECTED ${unexpected.join(', ')}` : ''}${missing.length ? `; no longer four-up ${missing.join(', ')}` : ''}`);
  // Nothing may be wider on a phone than it is on an iPad, in any chapter.
  const shrinking = census.filter(row => row.cols[320] > row.cols[768]);
  check('5E §6.8 no option grid is denser at 320px than at 768px',
    shrinking.length === 0, shrinking.map(r => `${r.id}=${r.cols[320]}/${r.cols[768]}`).join(', ') || 'none');
  console.log(`      option-grid census (320/768): ${census.map(r => `${r.id}=${r.cols[320]}/${r.cols[768]}`).join('  ')}`);
}

// ==== 5F-PATCH3: regression pins for the defect classes of 5F-FEEDBACK2/3 ====
// (Nathanael, 2026-08-09/10.) Chapters 6-8 were "the worst regressions since
// the beginning of the project"; each block below pins one of the classes
// that got through so that its RECURRENCE is mechanical to catch. What
// remains beyond the harness's reach is stated in 5F-SPEC1-PATCH3.md rather
// than implied.

// ---- P3.1 word→clip mappings verified by EAR are pinned in the data -------
// A clip's CONTENT cannot be asserted mechanically. These exact pairs were
// verified by Nathanael listening (scripture drill, 5F-FEEDBACK2 item 17) or
// against the original's own TBK WordSelection wiring (predicate position,
// 5F-FEEDBACK3 item 2 — see 5F-SPEC1-PATCH3.md for the extraction method).
// If any re-keying, re-extraction or refactor moves one of them again, this
// fails with the word in hand instead of waiting for a listener.
{
  const pins = [];
  const drill = activityById(ch6, 'c6_drill_scripture_memory');
  for (const [greek, audio] of [['πρός', 'chapt_6_f_sm10'], ['τόν', 'chapt_6_f_sm11'], ['θεόν', 'chapt_6_f_sm12']]) {
    const item = drill.items.find(i => i.greek === greek);
    pins.push([`ch6 scripture drill ${greek}`, item && item.audio, audio]);
  }
  const pp = ch7.learn[2].topics.find(t => t.id === 'predicatePosition').content;
  pins.push(['ch7 predicate pair 1 (ἀγαθὸς ὁ λόγος)', pp[1].rows[0].audio, 'chapt_7_g_pp1a']);
  pins.push(['ch7 predicate pair 2 (ὁ λόγος ἀγαθός)', pp[1].rows[1].audio, 'chapt_7_g_pp2a']);
  pins.push(['ch7 predicate verse Lk 2:25 (whole verse, one clip)', `${pp[2].rows[0].audio}|${pp[2].rows[0].audio2 || ''}`, 'chapt_7_g_pp3|']);
  pins.push(['ch7 predicate verse Mat 23:28 (whole verse, one clip)', `${pp[3].rows[0].audio}|${pp[3].rows[0].audio2 || ''}`, 'chapt_7_g_pp4|']);
  const hintRows = activityById(ch7, 'c7_drill_translation').ui.hintPages[1].content[0].items[1].below[0].rows;
  pins.push(['ch7 translation hint predicate pair 1', hintRows[0].audio, 'chapt_7_g_pp1a']);
  pins.push(['ch7 translation hint predicate pair 2', hintRows[1].audio, 'chapt_7_g_pp2a']);
  for (const [label, actual, expected] of pins) {
    check(`P3.1 pinned clip mapping: ${label}`, actual === expected, `${actual} (want ${expected})`);
  }
  // ...and the tap actually reaches the pinned FILE end-to-end, via the
  // run-long audio request log (see its declaration at the top of the file).
  await go('#/activity/chapt_7/c7_learn_adjectives');
  await gotoTopic(4);
  const mark = audioRequests.length;
  await page.locator('.rc-greekword.greek-say').first().click();
  await page.waitForTimeout(300);
  const fetched = audioRequests.slice(mark).join(' ');
  check('P3.1 the predicate pair tap plays the pinned clip end-to-end',
    fetched.includes('g_pp1a.m4a'),
    `${fetched || 'no audio request after tap (already IDB-cached earlier in the run?)'}`);
}

// ---- P3.2 the More/Back pair: centred, BOTH always visible, on EVERY ------
// surface. 5F-FEEDBACK3 item 6 caught ContentAudio carrying a second,
// drifted copy of this layout; the PATCH3 addendum (Nathanael, 2026-08-10,
// after user testing) then settled the model itself: the pair is CENTRED,
// both buttons render on every page of a stack, and the invalid direction is
// greyed out (disabled) rather than removed — nothing ever jumps or
// disappears while paging. This measures all of that on every paging surface,
// whichever component drew it: both buttons present, Back disabled exactly on
// page 1, More disabled exactly on the last page, the pair's centre on the
// nav row's centre within 2px, and the buttons' positions IDENTICAL from
// page to page.
{
  // SCOPE NARROWED BY DISCLOSURE-SPEC1 W6 (R5/§4.2): the centred pair is now
  // the THREE-OR-MORE control only. Four surfaces left this list because they
  // disclose exactly two states and §4.1 gives those a single alternating
  // toggle instead — ch7's two Learn adjective paradigms and its Adjective Case
  // Drill hint (all two named charts, Singular/Plural), and its Adjective
  // Translation Drill hint (two pages). None of them lost coverage: the toggle
  // each one grew is asserted in scripts/ui-disclosure.mjs (D7 and D10),
  // including that the pair is ABSENT, which is what would catch a regression
  // back to this shape. What remains here is every surface that still pages
  // three or more ways, which is what this block was written to protect.
  const navSurfaces = [
    ['ch8 Learn Third Person Paradigm', '#/activity/chapt_8/c8_learn_third_person', { topic: 1 }],
    // 'ch8 Review Third Person (ContentAudio pager)' left this list with
    // DISCLOSURE-SPEC2: amended §4.6 removed the Review pager entirely, so
    // there is no .pg-nav on that page to measure. The ContentAudio copy of
    // this layout went with it — Paradigm.svelte is the only renderer of the
    // pair now, which is one fewer place for the markup to drift.
    ['ch8 Aὐτός Translation Drill Hint (modal pager)', '#/activity/chapt_8/c8_drill_translation_autos', { hint: true }]
  ];
  for (const [label, hash, opts] of navSurfaces) {
    await go(hash);
    if (opts.topic) await gotoTopic(opts.topic);
    if (opts.hint) {
      await page.getByRole('button', { name: 'Hint', exact: true }).click();
      await page.waitForTimeout(200);
    }
    let previousBackX = null;
    for (let pageIndex = 0; ; pageIndex++) {
      const nav = page.locator('.pg-nav').first();
      if (!await nav.count()) { check(`P3.2 ${label}: has a .pg-nav`, false, 'no .pg-nav found'); break; }
      const back = nav.locator('.pg-switch-back, [data-hint-page-nav="back"]');
      const more = nav.locator('.pg-switch-more, [data-hint-page-nav="more"]');
      check(`P3.2 ${label} p${pageIndex + 1}: both buttons visible`,
        await back.count() === 1 && await more.count() === 1 && await back.isVisible() && await more.isVisible(),
        `back ${await back.count()}, more ${await more.count()}`);
      const backDisabled = await back.isDisabled();
      const moreDisabled = await more.isDisabled();
      check(`P3.2 ${label} p${pageIndex + 1}: Back ${pageIndex === 0 ? 'greyed out on the first page' : 'live'}`,
        backDisabled === (pageIndex === 0), `disabled=${backDisabled}`);
      const navBox = await nav.boundingBox();
      const b = await back.boundingBox();
      const m = await more.boundingBox();
      const pairCentre = (b.x + (m.x + m.width)) / 2;
      const navCentre = navBox.x + navBox.width / 2;
      check(`P3.2 ${label} p${pageIndex + 1}: the pair is centred`,
        Math.abs(pairCentre - navCentre) <= 2,
        `pair centre ${Math.round(pairCentre)} vs nav centre ${Math.round(navCentre)}`);
      if (previousBackX != null) {
        check(`P3.2 ${label} p${pageIndex + 1}: buttons have not moved since the previous page`,
          Math.abs(b.x - previousBackX) <= 1, `back x ${Math.round(b.x)} was ${Math.round(previousBackX)}`);
      }
      previousBackX = b.x;
      if (moreDisabled) {
        // Every stack on this list has at least two pages, so More greyed out
        // on page 1 would mean the stack failed to page at all.
        check(`P3.2 ${label}: More greys out only once past the first page`, pageIndex > 0,
          `More already disabled on page ${pageIndex + 1}`);
        break;
      }
      await more.click();
      await page.waitForTimeout(150);
    }
  }
}

// ---- P3.3 a labeled stack shows its own green label on EVERY page ---------
// 5F-FEEDBACK3 item 1: the ch7 adjective stacks page Singular/Plural with no
// on-screen label saying which page is showing. Every chart that authors a
// subtitle must show it, and it must CHANGE when More steps.
{
  for (const [label, hash, topic, expected] of [
    ['ch7 Adjective Paradigm', '#/activity/chapt_7/c7_learn_adjectives', 1, ['Singular', 'Plural']],
    ['ch7 2nd Adjective Paradigm', '#/activity/chapt_7/c7_learn_adjectives', 2, ['Singular', 'Plural']],
    ['ch8 Third Person Paradigm', '#/activity/chapt_8/c8_learn_third_person', 1, ['Masculine', 'Feminine', 'Neuter']]
  ]) {
    await go(hash);
    await gotoTopic(topic);
    const seen = [];
    for (let i = 0; i < expected.length; i++) {
      seen.push(normalizeText(await page.locator('.pg-subtitle').first().innerText().catch(() => '')));
      // Step by whichever control this stack draws. Since DISCLOSURE-SPEC1 W6
      // that depends on the CHART COUNT, not the chapter: two charts advance
      // through the single §4.1 toggle (ch7's Singular/Plural), three or more
      // through More (ch8's genders). The label under test is the same either
      // way, which is why this check reads the control rather than naming it.
      if (i < expected.length - 1) {
        const step = page.locator('[data-paradigm-switch="more"], [data-paradigm-switch="named"]').first();
        await step.click();
        await page.waitForTimeout(120);
      }
    }
    check(`P3.3 ${label}: every page shows its own green label`,
      JSON.stringify(seen) === JSON.stringify(expected), seen.join(' -> ') || 'none');
  }
}

// ---- P3.4 οὐ/οὐκ/οὐχ is a C2 RULE LIST, and its words are audio taps ------
// REVERSED BY DISCLOSURE-RULES §7 / §6.3, ratified 2026-08-11. This used to
// assert D-31r2: that both the number marker AND the Greek word opened a
// popup. The sheet retires the number-marker mechanism outright — the page is
// a numbered closed set in which EVERY item is disclosed, which is C2, so each
// item carries its own "Examples" accordion and the Greek words go back to
// being ordinary audio taps like every other displayed Greek in the app
// (directive 9). The popup route is not merely unused here; it must be ABSENT,
// because a surviving popup link would be the old disclosure showing through
// the new one. That is what this now asserts, together with the accordions
// that replaced it.
{
  await go('#/activity/chapt_7/c7_learn_eimi');
  await gotoTopic(3);
  check('P3.4 no popup link survives on the ου-form page (D-31 amended, numberPopupRef retired)',
    await page.locator('.rc-word-popup').count() === 0
      && await page.locator('.rc-num-popup').count() === 0
      && await page.locator('.rc-list .popup-link').count() === 0);
  const examples = page.locator('.rc-list details.rc-expander');
  check('P3.4 each of the three rules carries its own "Examples" accordion, collapsed (C2)',
    await examples.count() === 3
      && (await examples.evaluateAll(nodes => nodes.every(n => !n.open))),
    `${await examples.count()} accordions`);
  await examples.first().locator('summary').click();
  await page.waitForTimeout(150);
  const mark = audioRequests.length;
  await page.locator('.rc-wordusage .rc-wu-head').first().click();
  await page.waitForTimeout(300);
  check('P3.4 the Greek word inside is an ordinary audio tap, not a link',
    await page.locator('.popup-sheet').count() === 0
      && audioRequests.slice(mark).join(' ').includes('g_ou.m4a'),
    audioRequests.slice(mark).join(' ') || 'no audio request (already cached this run?)');
}

// ---- P3.5 the emphatic triads and the intro examples are tappable ---------
// 5F-FEEDBACK3 items 4/5: every parenthesised emphatic form beside its
// description plays, on all four surfaces it appears on; λέγω / ἐγὼ λέγω in
// the ch8 Introduction play their word clips.
{
  // The word→clip mapping is pinned in the DATA (noteTaps), the tap-target
  // count and the played-one-clip behavior on the page, and the FILE against
  // the whole run's network log — any clip ever played was fetched exactly
  // once (first play), so "the file appears in the run's audio requests"
  // holds whether this tap or an earlier surface was the first to touch it.
  const FIRST_TAPS = { 'ἐμοῦ': 'chapt_8_h_1gse', 'ἐμοί': 'chapt_8_h_1dse', 'ἐμέ': 'chapt_8_h_1ase' };
  const SECOND_TAPS = { 'σοῦ': 'chapt_8_h_2gs', 'σοί': 'chapt_8_h_2ds', 'σέ': 'chapt_8_h_2as' };
  const pinNote = (label, actual, expected) => check(`P3.5 pinned noteTaps: ${label}`,
    JSON.stringify(actual) === JSON.stringify(expected), JSON.stringify(actual));
  pinNote('ch8 Learn First Person', ch8.learn[2].topics[1].content[0].noteTaps, FIRST_TAPS);
  pinNote('ch8 Learn Second Person', ch8.learn[2].topics[2].content[0].noteTaps, SECOND_TAPS);
  pinNote('ch8 Review 1st Person', activityById(ch8, 'c8_qr_first').paradigm.noteTaps, FIRST_TAPS);
  pinNote('ch8 Review 2nd Person', activityById(ch8, 'c8_qr_second').paradigm.noteTaps, SECOND_TAPS);
  for (const [label, hash, topic, expectedTaps, expectFile] of [
    ['ch8 Learn First Person note', '#/activity/chapt_8/c8_learn_pronouns', 1, 3, 'h_1gse.m4a'],
    ['ch8 Learn Second Person note', '#/activity/chapt_8/c8_learn_pronouns', 2, 3, 'h_2gs.m4a'],
    ['ch8 Review 1st Person note', '#/activity/chapt_8/c8_qr_first', null, 3, 'h_1gse.m4a'],
    ['ch8 Review 2nd Person note', '#/activity/chapt_8/c8_qr_second', null, 3, 'h_2gs.m4a']
  ]) {
    await go(hash);
    if (topic != null) await gotoTopic(topic);
    const taps = page.locator('.pg-note .greek-tap');
    await page.evaluate(() => { window.__clips.length = 0; });
    if (await taps.count()) { await taps.first().click(); await page.waitForTimeout(300); }
    const playedCount = (await clips()).length;
    const everFetched = audioRequests.join(' ');
    check(`P3.5 ${label}: three tappable emphatic forms, the tap plays one clip, ${expectFile} reached the wire this run`,
      await taps.count() === expectedTaps && playedCount === 1 && everFetched.includes(expectFile),
      `${await taps.count()} taps, ${playedCount} clips, file fetched: ${everFetched.includes(expectFile)}`);
  }
  // ch8 Introduction: λέγω / ἐγὼ λέγω are PLAIN INK — Nathanael's 2026-08-10
  // correction reversing his own item 4 ("legw and egw legw were never
  // clickable, and that is why you didn't find the audio to map"). This
  // matches the original (8_PRONS.TBK wires no WordSelection to that page)
  // and is pinned here so a future pass doesn't re-add invented taps; the
  // borrowed-clip mechanism this briefly used is gone (D-39).
  await go('#/activity/chapt_8/c8_learn_pronouns');
  check('P3.5 ch8 Introduction: λέγω / ἐγὼ λέγω are plain ink, not tap targets (D-39)',
    await page.locator('.rc-para .greek-tap').count() === 0
      && await page.locator('.rc-para .popup-link').count() === 0,
    `${await page.locator('.rc-para .greek-tap').count()} taps found`);
}


// ===================================================================
// 5G: chapters 9 and 10
// ===================================================================
// Everything above already sweeps them (they are in CHAPTERS and in the
// ledger read-back). What follows is what only they have: the parsing drill
// generalized to THREE stages, the single-topic page with no topic rail, the
// popup written as content blocks, the present/future chart in both of its
// printed forms, the form-dependent composite Hint, the compound-verb suffix,
// and the retired Repeat control's preserved retry-until-right path.

// ---- G1 the THREE-stage parsing drill (5G-SPEC1 §4.1) --------------------
{
  const activity = activityById(ch10, 'c10_drill_parsing');
  const HASH = '#/activity/chapt_10/c10_drill_parsing';
  const stage = index => page.locator(`[data-stage="${index}"]`);
  const stageTiles = index => stage(index).locator('.tile');
  // The tuple the item on screen wants. Four forms repeat in the pool
  // (λύσομαι is items 5 and 18) but they repeat with the SAME parse, so the
  // prompt identifies the answer even where it does not identify the item.
  // A prompt whose matches DISAGREE returns null rather than a guess.
  const answerFor = async () => {
    const prompt = await promptOnScreen();
    const hits = activity.items.filter(i => normalizeText(i.greek) === prompt);
    const unique = new Set(hits.map(i => i.answer.join('|')));
    return { prompt, answer: unique.size === 1 ? hits[0].answer : null };
  };
  const clickStage = async (index, label) => {
    await stage(index).locator('.tile', { hasText: label }).first().click();
    await page.waitForTimeout(120);
  };

  await go(HASH);
  check('5G G1 the instruction line asks for three clicks, tense first',
    normalizeText(await page.locator('.instructions').first().innerText())
      === 'Click first on the tense, voice and person last',
    JSON.stringify(await page.locator('.instructions').first().innerText()));
  check('5G G1 THREE stages are on screen, in authored order',
    await page.locator('[data-stage]').count() === 3
      && await stage(0).getAttribute('data-stage-label') === 'Tense'
      && await stage(1).getAttribute('data-stage-label') === 'Voice'
      && await stage(2).getAttribute('data-stage-label') === 'Person / Number',
    `${await page.locator('[data-stage]').count()} stages`);
  check('5G G1 all three stages are LIVE from the start (the commit rule holds the tuple, not a disabled control)',
    !await stageTiles(0).first().isDisabled() && !await stageTiles(1).first().isDisabled()
      && !await stageTiles(2).first().isDisabled());
  // §4.1: optionGroups [2, 2, 2] on the person/number stage reproduces the
  // original's three paired rows.
  check('5G G1 the person/number stage is drawn as three paired groups (optionGroups [2,2,2])',
    await stage(2).locator('.option-group').count() === 3
      && await stage(2).locator('.option-group').first().locator('.tile').count() === 2
      && await stage(2).evaluate(el => el.classList.contains('paired-groups')),
    `${await stage(2).locator('.option-group').count()} groups`);

  // NOTHING commits until the LAST empty stage is filled, however often the
  // earlier ones are changed — the c8_drill_case rule, unchanged by the third
  // stage (VERIFY-5F item 7 resolution).
  await page.locator('.card').getByRole('button', { name: 'Score', exact: true }).click();
  const scoreBefore = normalizeText(await page.locator('.live-score').innerText());
  await clickStage(0, 'Present');
  const afterOne = await feedbackKind();
  await clickStage(1, 'Middle');
  const afterTwo = await feedbackKind();
  await clickStage(0, 'Future');           // an earlier stage stays re-clickable
  const afterChange = await feedbackKind();
  await shot('5G three-stage: two stages filled, nothing judged');
  check('5G G1 filling two of three stages judges NOTHING, and stage 1 stays re-clickable',
    afterOne === 'none' && afterTwo === 'none' && afterChange === 'none'
      && normalizeText(await page.locator('.live-score').innerText()) === scoreBefore
      && normalizeText(await stage(0).locator('.tile.selected').innerText()) === 'Future',
    `feedback ${afterOne}/${afterTwo}/${afterChange}, score ${scoreBefore}`);

  // ALL THREE RIGHT: one attempt, correct, auto-advances (B1a).
  {
    await go(HASH);
    const { prompt, answer } = await answerFor();
    if (!answer) {
      check('5G G1 all three stages right: scored correct and auto-advances (B1a)', false, `ambiguous prompt ${prompt}`);
    } else {
      const before = await itemNumber();
      await clickStage(0, answer[0]);
      await clickStage(1, answer[1]);
      const answeredAt = Date.now();
      await stage(2).locator('.tile', { hasText: answer[2] }).first().click();
      await page.waitForTimeout(180);
      const kind = await feedbackKind();
      const said = await awaitNextShown();
      await shot('5G three-stage: all three right');
      let late = await itemNumber();
      while (late === before && Date.now() - answeredAt < CORRECT_MS * 3) {
        await page.waitForTimeout(50);
        late = await itemNumber();
      }
      check('5G G1 all three stages right: scored correct and auto-advances (B1a)',
        kind === 'ok' && !said && late !== before,
        `${JSON.stringify(prompt)} -> ${JSON.stringify(answer)}, feedback ${kind}, item ${before} -> ${late}`);
    }
  }

  // THE TUPLE COMMITS ON THE LAST EMPTY STAGE, IN ANY ORDER. Filling person
  // first and tense last commits on the TENSE click.
  {
    await go(HASH);
    const { prompt, answer } = await answerFor();
    if (!answer) {
      check('5G G1 the tuple commits on the last EMPTY stage, whatever order it is filled in', false, `ambiguous prompt ${prompt}`);
    } else {
      await clickStage(2, answer[2]);
      await clickStage(1, answer[1]);
      const midKind = await feedbackKind();
      await clickStage(0, answer[0]);
      await page.waitForTimeout(180);
      check('5G G1 the tuple commits on the last EMPTY stage, whatever order it is filled in',
        midKind === 'none' && await feedbackKind() === 'ok',
        `after two stages ${midKind}, after the third ${await feedbackKind()}`);
    }
  }

  // A WRONG TUPLE: one attempt, manualOnIncorrect — reveals, waits, stays.
  {
    await go(HASH);
    const { prompt, answer } = await answerFor();
    if (!answer) {
      check('5G G1 a wrong tuple reveals the answer, waits for Next and stays (manualOnIncorrect)', false, `ambiguous prompt ${prompt}`);
    } else {
      const before = await itemNumber();
      await clickStage(0, answer[0]);
      await clickStage(1, answer[1]);
      const wrongPerson = ['First Singular', 'Third Plural'].find(value => value !== answer[2]);
      await stage(2).locator('.tile', { hasText: wrongPerson }).first().click();
      await page.waitForTimeout(INCORRECT_MS * 1.3);
      await shot('5G three-stage: wrong person');
      const revealed = (await stage(2).locator('.tile.correct').allInnerTexts()).map(normalizeText);
      check('5G G1 a wrong tuple reveals the answer, waits for Next and stays (manualOnIncorrect)',
        await feedbackKind() === 'bad' && await awaitNextShown()
          && revealed.includes(normalizeText(answer[2]))
          && await itemNumber() === before,
        `revealed ${JSON.stringify(revealed)}, item ${before} -> ${await itemNumber()}`);
    }
  }

  // §3.3: the Translate control the original prints on this drill. It was
  // dead until buildTwoStageQuestions carried `translate` through — a button
  // present and permanently disabled, which reads as a broken control.
  {
    await go(HASH);
    const { prompt } = await answerFor();
    const expected = activity.items.find(i => normalizeText(i.greek) === prompt);
    const translate = page.locator('.card').getByRole('button', { name: 'Translate', exact: true });
    const enabled = await translate.count() === 1 && !await translate.isDisabled();
    if (enabled) { await translate.click(); await page.waitForTimeout(80); }
    check('5G G1 Translate reveals the item translation (the two-stage builder now carries it)',
      enabled && normalizeText(await page.locator('[data-reveal="translate"]').innerText())
        === normalizeText(expected && expected.translate),
      `enabled ${enabled}, expected ${JSON.stringify(expected && expected.translate)}`);
  }
}

// ---- G2 the ch9 parsing grid is drawn in paired groups ------------------
{
  await go('#/activity/chapt_9/c9_drill_parsing');
  const groups = page.locator('.option-groups .option-group');
  check('5G G2 ch9 parsing: six options in three paired rows, as the original draws them',
    await page.locator('.option-groups').first().evaluate(el => el.classList.contains('paired-groups'))
      && await groups.count() === 3 && await groups.first().locator('.tile').count() === 2,
    `${await groups.count()} groups`);
  // ch3's parsing labels are 48 characters and MUST stay one per line: the
  // paired layout is chosen by label length, so this is what proves the
  // device-verified chapter-3 drill did not move under it.
  await go('#/activity/chapt_3/c3_drill_parsing');
  check('5G G2 ch3 parsing keeps one long option per line (paired grouping is by label length)',
    !await page.locator('.option-groups').first().evaluate(el => el.classList.contains('paired-groups'))
      && await page.locator('.option-groups .option-group.single').count() === 2);
}

// ---- G3 the single-topic page shows no topic rail (5G-SPEC1 §4.2) --------
{
  await go('#/activity/chapt_10/c10_learn_english_concepts');
  const activity = activityById(ch10, 'c10_learn_english_concepts');
  check('5G G3 a one-topic page shows NO topic navigation, and still shows its content',
    activity.topics.length === 1 && await page.locator('.topic-controls').count() === 0
      && await page.locator('.topic-count').count() === 0
      && (await page.locator('.card .rich').innerText()).includes('We will go to college'),
    `${await page.locator('.topic-controls').count()} topic controls`);
  check('5G G3 the sequential rail is untouched by that (no dead-end Next, directive 7)',
    !await page.locator('.rail-next').isDisabled());
  // The multi-topic page next door still steps, so the rule is scoped to
  // topics.length === 1 and not to topicPages as a whole.
  await go('#/activity/chapt_10/c10_learn_future_verbs');
  check('5G G3 a seven-topic page still shows its topic stepper',
    await page.locator('.topic-controls').count() === 1
      && normalizeText(await page.locator('.topic-count').innerText()) === '1 of 7');
}

// ---- 5G-SPEC3 the future-construction formula tap boundaries -------------
{
  const futureVerbs = activityById(ch10, 'c10_learn_future_verbs');
  const formulaData = futureVerbs.topics[0].content.find(block => block.type === 'formula');
  await go('#/activity/chapt_10/c10_learn_future_verbs');
  const formula = page.locator('.rc-formula');
  const lines = formula.locator('.rc-formula-line');
  const unit = formula.locator('button.rc-formula-unit');
  const inline = lines.nth(2).locator('button.greek-tap');
  const plain = lines.first();
  const geometry = await formula.evaluate(root => {
    const whole = root.getBoundingClientRect();
    const button = root.querySelector('.rc-formula-unit').getBoundingClientRect();
    const lines = [...root.querySelectorAll('.rc-formula-line')];
    return {
      whole: whole.width,
      button: button.width,
      align: getComputedStyle(root).textAlign,
      lineAligns: lines.map(line => getComputedStyle(line).textAlign)
    };
  });
  check('5G-SPEC3 formula: three centered lines preserve the two exact tap boundaries',
    await lines.count() === 3
      && normalizeText(await plain.innerText()) === 'Stem + Sigma + Ending'
      && await plain.locator('button, [role="button"]').count() === 0
      && await unit.count() === 1
      && normalizeText(await unit.innerText()) === 'λύ + σ + ω'
      && Math.abs(geometry.whole - geometry.button) < 1
      && geometry.align === 'center' && geometry.lineAligns.every(align => align === 'center')
      && normalizeText(await lines.nth(2).innerText()) === '(λύσω — I will loose)'
      && await lines.nth(2).locator('button').count() === 1
      && normalizeText(await inline.innerText()) === 'λύσω',
    `${await lines.count()} lines; widths ${geometry.button.toFixed(1)}/${geometry.whole.toFixed(1)}`);
  check('5G-SPEC3 formula source pins both authored taps to chapt_10_j_luw1s',
    formulaData?.align === 'center'
      && formulaData?.lines?.[0]?.text === 'Stem + Sigma + Ending'
      && formulaData?.lines?.[1]?.tapUnit === true
      && formulaData?.lines?.[1]?.audio === 'chapt_10_j_luw1s'
      && formulaData?.lines?.[2]?.greekTap?.word === 'λύσω'
      && formulaData?.lines?.[2]?.greekTap?.audio === 'chapt_10_j_luw1s',
    JSON.stringify(formulaData?.lines));

  const unitTap = await exactAudioTap(unit, 'chapt_10_j_luw1s');
  check('5G-SPEC3 formula: tapping the whole λύ + σ + ω unit plays exactly one j_luw1s clip',
    unitTap.clipCount === 1 && unitTap.fetched.some(url => url.includes(unitTap.path)),
    `${unitTap.clipCount} clip(s); requests ${JSON.stringify(unitTap.fetched)}`);

  const inlineTap = await exactAudioTap(inline, 'chapt_10_j_luw1s');
  check('5G-SPEC3 formula: tapping only λύσω in the worked line plays exactly one j_luw1s clip',
    inlineTap.clipCount === 1 && inlineTap.fetched.some(url => url.includes(inlineTap.path)),
    `${inlineTap.clipCount} clip(s); requests ${JSON.stringify(inlineTap.fetched)}`);

  // Click immediately to the right of λύσω, on the authored dash/English run
  // rather than on empty line space. Text nodes have no target of their own,
  // so the event lands on the inert line container if the boundary is right.
  const outsideGreek = await lines.nth(2).evaluate(line => {
    const box = line.getBoundingClientRect();
    const greek = line.querySelector('button.greek-tap').getBoundingClientRect();
    return { x: Math.min(box.width - 2, greek.right - box.left + 10), y: box.height / 2 };
  });
  await page.evaluate(() => { window.__clips.length = 0; });
  await lines.nth(2).click({ position: outsideGreek });
  await page.waitForTimeout(250);
  check('5G-SPEC3 formula: tapping the parentheses/English outside λύσω plays no audio',
    (await clips()).length === 0, `${(await clips()).length} clip(s)`);

  await page.evaluate(() => { window.__clips.length = 0; });
  await plain.click();
  await page.waitForTimeout(250);
  check('5G-SPEC3 formula: tapping Stem + Sigma + Ending plays no audio',
    (await clips()).length === 0, `${(await clips()).length} clip(s)`);
}

// ---- G4 popups written as content blocks (5G-SPEC1 §4.3) -----------------
{
  // ch9: an ordinary word in running prose is the link, named outright by
  // [[link:punctiliar]] — the popup's title is nothing like the run text, so
  // the 5F slug route could not have found it.
  await go('#/activity/chapt_9/c9_learn_mp_verbs');
  const links = page.locator('.rc-para .popup-link');
  check('5G G4 ch9 Introduction carries its two named popup links',
    await links.count() === 2
      && normalizeText(await links.first().innerText()) === 'punctiliar',
    `${await links.count()} links`);
  await links.first().click();
  await page.waitForTimeout(150);
  check('5G G4 the link opens the popup, whose body is rendered from content blocks',
    await page.locator('.popup-sheet').getAttribute('data-popup-id') === 'punctiliar'
      && await page.locator('.popup-sheet .popup-content .rc-para').count() === 1
      && normalizeText(await page.locator('.popup-sheet .popup-content').innerText())
        === 'Zach is hit by the ball.',
    normalizeText(await page.locator('.popup-sheet').innerText()));
  await page.locator('.popup-sheet').getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.waitForTimeout(80);
  check('5G G4 Cancel closes it', await page.locator('.popup-sheet').count() === 0);

  // ch9's Deponent Verbs TOPIC TITLE is itself the link (titleLink).
  await gotoTopic(3);
  check('5G G4 the Deponent Verbs topic TITLE is the link to its popup',
    await page.locator('.topic-heading .popup-link').count() === 1
      && normalizeText(await page.locator('.topic-heading').innerText()) === 'Deponent Verbs');
  await page.locator('.topic-heading .popup-link').click();
  await page.waitForTimeout(150);
  check('5G G4 the title link opens the Deponent popup',
    await page.locator('.popup-sheet').getAttribute('data-popup-id') === 'deponent');
  await page.locator('.popup-sheet').getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.waitForTimeout(80);

  // ch10: the five stem-variation examples are now interspersed disclosure
  // rows. Each numbered variation owns exactly one collapsed "Examples"
  // expander; none may drift into a detached group at the end of the topic.
  await go('#/activity/chapt_10/c10_learn_future_verbs');
  await gotoTopic(3);
  const stemItems = page.locator('.rc-list > li');
  const placement = await stemItems.evaluateAll(items => items.map(item => {
    const expanders = item.querySelectorAll(':scope > .rc-item-below > .rich > details.rc-expander');
    return [...expanders].map(expander => ({
      label: expander.querySelector('summary')?.textContent?.replace(/\s+/g, ' ').trim(),
      open: expander.open
    }));
  }));
  // The LABEL half of this changed with DISCLOSURE-SPEC2: amended §3.5 inverts
  // the bare-"Examples" rule, so each of these five now carries the variation's
  // own qualifier ("Palatal Examples"). What the check is really for — one
  // accordion per numbered item, collapsed, none drifting into a detached group
  // at the end of the topic — is untouched, so the label test becomes the
  // qualified pattern rather than the exact string. The 27 relabelled titles
  // are asserted as a set in ui-disclosure.mjs D15.
  const STEM_QUALIFIERS = ['Palatal', 'Labial', 'Dental', 'Liquid', 'Sibilant'];
  check('5G-SPEC2 / §3.5 stem variations: five collapsed qualified-Examples accordions, one under each numbered variation',
    await stemItems.count() === 5
      && placement.length === 5
      && placement.every((entries, index) => entries.length === 1 && !entries[0].open
        && entries[0].label === `${STEM_QUALIFIERS[index]} Examples`)
      && await page.locator('.card details.rc-expander').count() === 5
      && await page.locator('.rc-list .popup-link').count() === 0,
    JSON.stringify(placement));
  await stemItems.first().locator('summary', { hasText: 'Examples' }).click();
  await page.waitForTimeout(150);
  const examples = stemItems.first().locator('details.rc-expander');
  check('5G-SPEC2 the first interspersed Examples accordion reveals its existing arrow-form chart',
    await examples.getAttribute('open') !== null
      && await examples.locator('.rc-pfrows.arrow-form').count() === 1
      && await examples.locator('.rc-pfrow').count() === 2
      && await examples.locator('.rc-pfgreek:not([disabled])').count() === 4,
    normalizeText(await examples.innerText()));
  await page.evaluate(() => { window.__clips.length = 0; });
  await examples.locator('.rc-pfgreek').first().click();
  await page.waitForTimeout(250);
  check('5G-SPEC2 a Greek cell in an interspersed example plays its own clip (directive 9)',
    (await clips()).length === 1, JSON.stringify(await clips()));
}

// ---- G5 presentFutureRows in the HEADED form (5G-SPEC1 §4.4) -------------
{
  await go('#/activity/chapt_10/c10_learn_future_verbs');
  await gotoTopic(5);
  const chart = page.locator('.rc-pfrows');
  check('5G G5 Deponent Futures is a two-column chart under underlined Present / Future headers',
    await chart.count() === 1
      && !await chart.evaluate(el => el.classList.contains('arrow-form'))
      && await chart.locator('.rc-pfhead span').count() === 2
      && normalizeText(await chart.locator('.rc-pfhead').innerText()) === 'Present Future'
      && await chart.locator('.rc-pfrow').count() === 3,
    normalizeText(await chart.innerText()));
  check('5G G5 deponent rows gloss the FUTURE side only; the Greek on both sides is tappable',
    await chart.locator('.rc-pfcell[data-side="future"] .rc-pfgloss').count() === 3
      && await chart.locator('.rc-pfcell[data-side="present"] .rc-pfgloss').count() === 0
      && await chart.locator('.rc-pfgreek:not([disabled])').count() === 6);
  // gotoTopic steps FORWARD from wherever the page already is; the next topic
  // is one click away, not six.
  await gotoTopic(1);
  check('5G G5 irregular rows gloss BOTH sides',
    await page.locator('.rc-pfcell[data-side="future"] .rc-pfgloss').count() === 2
      && await page.locator('.rc-pfcell[data-side="present"] .rc-pfgloss').count() === 2);
  // §3.2: the topic title's Greek word is the tap target, the English is not.
  await go('#/activity/chapt_10/c10_learn_future_verbs');
  await gotoTopic(4);
  check('5G G5 the Future of eimi topic title taps its Greek word only (titleAudio)',
    await page.locator('.topic-heading .greek-tap').count() === 1
      && normalizeText(await page.locator('.topic-heading .greek-tap').innerText()) === 'εἰμί');
}

// ---- G6 the compound-verb preposition suffix (5G-SPEC1 §2.3) -------------
{
  await go('#/activity/chapt_9/c9_learn_mp_verbs');
  await gotoTopic(5);
  const rows = page.locator('.rc-greekrows.compound-verbs .rc-greekrow');
  check('5G G6 four compound verbs, three of them carrying a tappable preposition',
    await rows.count() === 4
      && await page.locator('.rc-greeksuffix').count() === 3
      && normalizeText(await page.locator('.rc-greeksuffix').first().innerText()) === '(εἰς)');
  // The suffix has its OWN clip, distinct from the headword's. Same standard
  // as P3.5: the MAPPING is pinned in the data, the one-tap-one-clip behavior
  // is measured on the page, and the FILE is proved against the whole run's
  // audio request log. The element src is a blob: URL and never names the
  // file, so two plays can only be told apart by what they fetched.
  {
    const compound = activityById(ch9, 'c9_learn_mp_verbs')
      .topics.find(t => t.id === 'compoundVerbs')
      .content.find(b => b.type === 'greekRows');
    const eiserchomai = compound.rows[1];
    check('5G G6 pinned: the headword and its preposition carry DIFFERENT clips',
      eiserchomai.audio === 'chapt_9_i_voc5' && eiserchomai.suffix.audio === 'chapt_9_i_eis',
      JSON.stringify([eiserchomai.audio, eiserchomai.suffix.audio]));
    await page.evaluate(() => { window.__clips.length = 0; });
    await page.locator('.rc-greeksuffix').first().click();
    await page.waitForTimeout(300);
    const suffixClips = (await clips()).length;
    await page.evaluate(() => { window.__clips.length = 0; });
    await rows.nth(1).locator('.rc-greekword').click();
    await page.waitForTimeout(300);
    const wordClips = (await clips()).length;
    const everFetched = audioRequests.join(' ');
    check('5G G6 each tap plays exactly one clip, and the preposition\u2019s file reached the wire this run',
      suffixClips === 1 && wordClips === 1
        && everFetched.includes('i_eis.m4a') && everFetched.includes('i_voc5.m4a'),
      `${suffixClips} / ${wordClips} clips; i_eis fetched ${everFetched.includes('i_eis.m4a')}, i_voc5 fetched ${everFetched.includes('i_voc5.m4a')}`);
  }
}

// ---- G7 one-at-a-time + form-dependent Hints (5G-SPEC3 §§1-2) ----------
// Two-stage questions are shuffled at mount, so a form-dependent assertion
// must seek the authored form through the real Next control. Testing whatever
// happens to load first would make the eimi/luo route nondeterministic.
const seekSelectPrompt = async (hash, expectedPrompt, itemCount) => {
  await go(hash);
  const pronounceEach = page.locator('.exercise-checks input').first();
  if (await pronounceEach.count() && await pronounceEach.isChecked()) await pronounceEach.uncheck();
  for (let step = 0; step < itemCount; step++) {
    if (await promptOnScreen() === normalizeText(expectedPrompt)) return true;
    const next = stepper('Next');
    if (await next.isDisabled()) break;
    await next.click();
    await page.waitForTimeout(45);
  }
  return false;
};

const parsing10 = activityById(ch10, 'c10_drill_parsing');
// XPATCH3 item 1 derives these labels from the chart titles. A retitle that
// breaks the one-word contrast degrades to More/Back SILENTLY, so the expected
// words stay pinned here and in the eimi state assertions below. A failure
// means the data changed and the labels need a decision, not that the
// derivation itself should be bypassed.
for (const [chapterId, activityId, first, second, firstTarget, secondTarget, target, sayAudio] of [
  ['chapt_9', 'c9_drill_parsing', 'Present Middle Indicative Paradigm', 'Present Passive Indicative Paradigm', 'Passive', 'Middle', null,
    ['chapt_9_i_midpar', 'chapt_9_i_mpar']],
  ['chapt_9', 'c9_drill_translation', 'Present Middle Indicative Paradigm', 'Present Passive Indicative Paradigm', 'Passive', 'Middle', null, null],
  // Item 16 has no override and must retain the drill-level future pair.
  ['chapt_10', 'c10_drill_parsing', 'Future Active Indicative Paradigm', 'Future Middle Indicative Paradigm', 'Middle', 'Active', 'λύω',
    ['chapt_10_j_luwpar', 'chapt_10_j_lumpar']],
  ['chapt_10', 'c10_drill_translation', 'Future Active Indicative Paradigm', 'Future Middle Indicative Paradigm', 'Middle', 'Active', null, null]
]) {
  const hash = `#/activity/${chapterId}/${activityId}`;
  const sourceMatches = !target || (activityId === 'c10_drill_parsing'
    && normalizeText(parsing10.items[15]?.greek) === normalizeText(target)
    && !Object.prototype.hasOwnProperty.call(parsing10.items[15], 'hintRef'));
  const reached = target ? await seekSelectPrompt(hash, target, parsing10.items.length) : (await go(hash), true);
  if (!reached) {
    check(`5G-SPEC3 ${activityId}: Hint opens in state 1 with a target-labelled toggle`, false,
      `never reached ${JSON.stringify(target)}`);
    check(`5G-SPEC3 ${activityId}: toggle replaces the chart without autoplay`, false, 'target form not reached');
    if (sayAudio) check(`5G-XPATCH3 ${activityId}: toggling stops the outgoing paradigm clip`, false,
      'target form not reached');
    check(`5G-SPEC3 ${activityId}: toggling back restores state 1`, false, 'target form not reached');
    check(`5G-SPEC3 ${activityId}: the Hint closes`, false, 'target form not reached');
    continue;
  }
  await page.evaluate(() => { window.__clips.length = 0; });
  await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
  await page.waitForTimeout(150);
  const modal = page.locator('.hint-modal');
  const toggle = modal.locator('[data-hint-paradigm-toggle]');
  check(`5G-SPEC3 ${activityId}: Hint opens in state 1 with a target-labelled toggle`,
    sourceMatches && await modal.count() === 1 && await modal.locator('.paradigm').count() === 1
      && normalizeText(await modal.locator('.pg-title').innerText()) === first
      && normalizeText(await toggle.innerText()) === firstTarget
      && await modal.locator('[data-paradigm-switch]').count() === 1
      && (await clips()).length === 0,
    `${JSON.stringify((await modal.locator('.pg-title').allInnerTexts()).map(normalizeText))}; toggle ${JSON.stringify(await toggle.innerText())}`);

  if (sayAudio) {
    const say = modal.locator('[data-hint-paradigm-say]');
    const played = await exactAudioTap(say, sayAudio[0]);
    check(`5G-SPEC3 ${activityId}: state 1 Say Paradigm plays its exact authored clip`,
      await say.getAttribute('data-audio-id') === sayAudio[0]
        && await modal.locator('[data-hint-paradigm-say]').count() === 1
        && await modal.locator('.modal-scroll .pg-actions').count() === 0
        && played.clipCount === 1
        && played.fetched.some(url => url.includes(played.path)),
      `${await say.getAttribute('data-audio-id')}; ${played.clipCount} clip(s); requests ${JSON.stringify(played.fetched)}`);
    await page.waitForTimeout(400);
  }

  if (!sayAudio) await page.evaluate(() => { window.__clips.length = 0; });
  const clipsBeforeToggle = (await clips()).length;
  const playingBeforeToggle = await clipsPlaying();
  await toggle.click();
  await page.waitForTimeout(sayAudio ? 200 : 250);
  const clipsAfterToggle = (await clips()).length;
  const playingAfterToggle = await clipsPlaying();
  check(`5G-SPEC3 ${activityId}: toggle replaces the chart without autoplay`,
    await modal.locator('.paradigm').count() === 1
      && normalizeText(await modal.locator('.pg-title').innerText()) === second
      && normalizeText(await toggle.innerText()) === secondTarget
      && clipsAfterToggle === clipsBeforeToggle,
    `${normalizeText(await modal.locator('.pg-title').innerText())}; toggle ${JSON.stringify(await toggle.innerText())}; clips ${clipsBeforeToggle}->${clipsAfterToggle}; playing ${playingBeforeToggle}->${playingAfterToggle}`);
  if (sayAudio) {
    // Press Say Paradigm, let it get going, then toggle. The OLD clip must
    // stop: it belongs to the chart that just left the screen. Asserting
    // "no new clip started" is not this check — a clip that is still playing
    // satisfies that trivially, which is how this bug passes a green suite.
    check(`5G-XPATCH3 ${activityId}: toggling stops the outgoing paradigm clip`,
      playingBeforeToggle === 1 && playingAfterToggle === 0,
      `playing ${playingBeforeToggle} -> ${playingAfterToggle}`);
  }

  if (sayAudio) {
    const say = modal.locator('[data-hint-paradigm-say]');
    const played = await exactAudioTap(say, sayAudio[1]);
    check(`5G-SPEC3 ${activityId}: state 2 Say Paradigm plays its exact authored clip`,
      await say.getAttribute('data-audio-id') === sayAudio[1]
        && await modal.locator('[data-hint-paradigm-say]').count() === 1
        && await modal.locator('.modal-scroll .pg-actions').count() === 0
        && played.clipCount === 1
        && played.fetched.some(url => url.includes(played.path)),
      `${await say.getAttribute('data-audio-id')}; ${played.clipCount} clip(s); requests ${JSON.stringify(played.fetched)}`);

    await page.evaluate(() => { window.__clips.length = 0; });
    await modal.locator('.pg-gloss').first().click();
    await page.waitForTimeout(250);
    check(`5G-SPEC3 ${activityId}: a gloss in toggled state 2 plays no audio`,
      (await clips()).length === 0, `${(await clips()).length} clip(s)`);
  }

  await page.evaluate(() => { window.__clips.length = 0; });
  await toggle.click();
  await page.waitForTimeout(200);
  check(`5G-SPEC3 ${activityId}: toggling back restores state 1`,
    normalizeText(await modal.locator('.pg-title').innerText()) === first
      && normalizeText(await toggle.innerText()) === firstTarget
      && (await clips()).length === 0,
    `${normalizeText(await modal.locator('.pg-title').innerText())}; toggle ${JSON.stringify(await toggle.innerText())}`);
  await modal.getByRole('button', { name: 'Close', exact: true }).click();
  await page.waitForTimeout(80);
  check(`5G-SPEC3 ${activityId}: the Hint closes`, await page.locator('.hint-modal').count() === 0);
}

// Items 21 (present eimi) and 25 (future eimi) both override the drill-level
// future-luo pair. They open the same two inline eimi charts one at a time.
// The delivered pair has no sayWhole fields and the chapter-10 audio pack has
// no Present εἰμί whole-paradigm clip, so this harness explicitly rejects an
// invented Say action while proving each state's authored cell audio instead.
for (const [itemIndex, expectedGreek] of [[20, 'εἰμί'], [24, 'ἔσομαι']]) {
  const item = parsing10.items[itemIndex];
  const reached = await seekSelectPrompt('#/activity/chapt_10/c10_drill_parsing', expectedGreek, parsing10.items.length);
  const label = `5G-SPEC3 item ${itemIndex + 1}`;
  if (!reached) {
    check(`${label}: item-level hintRef opens Present eimi state 1`, false,
      `never reached ${JSON.stringify(expectedGreek)}`);
    check(`${label}: Future toggle replaces the eimi chart without autoplay`, false, 'target form not reached');
    check(`${label}: Present toggle restores the first eimi state`, false, 'target form not reached');
    check(`${label}: the form-dependent Hint closes`, false, 'target form not reached');
    continue;
  }
  await page.evaluate(() => { window.__clips.length = 0; });
  await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
  await page.waitForTimeout(150);
  const modal = page.locator('.hint-modal');
  const toggle = modal.locator('[data-hint-paradigm-toggle]');
  check(`${label}: item-level hintRef opens Present eimi state 1`,
    normalizeText(item?.greek) === normalizeText(expectedGreek)
      && item?.hintRef === 'eimiParadigms'
      && await modal.count() === 1
      && await modal.locator('.paradigm').count() === 1
      && normalizeText(await modal.locator('.pg-title').innerText()) === 'Present Active Indicative of εἰμί'
      && normalizeText(await toggle.innerText()) === 'Future'
      && await modal.locator('[data-hint-paradigm-say]').count() === 0
      && (await clips()).length === 0
      && await modal.locator('.modal-actions').getByRole('button', { name: 'Close', exact: true }).count() === 1,
    `${JSON.stringify((await modal.locator('.pg-title').allInnerTexts()).map(normalizeText))}; toggle ${JSON.stringify(await toggle.innerText())}`);

  if (itemIndex === 20) {
    const greekButtons = modal.locator('button.pg-greek-tap:not([disabled])');
    const firstPresentAudio = ch10.hintCharts?.eimiParadigms?.charts?.[0]?.rows?.[0]?.cells?.[0]?.audio;
    const played = await exactAudioTap(greekButtons.first(), firstPresentAudio);
    check('5G-SPEC3 eimi Present state: six Greek forms are tappable and the first uses its authored clip',
      await greekButtons.count() === 6 && played.clipCount === 1
        && firstPresentAudio === 'chapt_10_g_eimi1s'
        && played.fetched.some(url => url.includes(played.path)),
      `${await greekButtons.count()} Greek buttons, first audio ${JSON.stringify(firstPresentAudio)}, requests ${JSON.stringify(played.fetched)}`);
  }

  await page.evaluate(() => { window.__clips.length = 0; });
  await toggle.click();
  await page.waitForTimeout(250);
  check(`${label}: Future toggle replaces the eimi chart without autoplay`,
    await modal.locator('.paradigm').count() === 1
      && normalizeText(await modal.locator('.pg-title').innerText()) === 'Future Active Indicative of εἰμί'
      && normalizeText(await toggle.innerText()) === 'Present'
      && await modal.locator('button.pg-greek-tap:not([disabled])').count() === 6
      && await modal.locator('.pg-gloss').count() === 6
      && (await clips()).length === 0,
    `${normalizeText(await modal.locator('.pg-title').innerText())}; toggle ${JSON.stringify(await toggle.innerText())}; ${(await clips()).length} clip(s)`);

  if (itemIndex === 20) {
    const greekButtons = modal.locator('button.pg-greek-tap:not([disabled])');
    const glosses = modal.locator('.pg-gloss');
    const firstFutureAudio = ch10.hintCharts?.eimiParadigms?.charts?.[1]?.rows?.[0]?.cells?.[0]?.audio;
    const played = await exactAudioTap(greekButtons.first(), firstFutureAudio);
    check('5G-SPEC3 eimi Future state: the first Greek form plays its authored cell clip',
      played.clipCount === 1 && firstFutureAudio === 'chapt_10_j_eimi1s'
        && played.fetched.some(url => url.includes(played.path)),
      `${played.clipCount} clip(s), first audio ${JSON.stringify(firstFutureAudio)}, requests ${JSON.stringify(played.fetched)}`);
    const glossesPlain = await glosses.evaluateAll(nodes => nodes.every(node =>
      !node.closest('button, [role="button"]') && getComputedStyle(node).color !== 'rgb(22, 99, 199)'));
    await page.evaluate(() => { window.__clips.length = 0; });
    await glosses.first().click();
    await page.waitForTimeout(250);
    check('5G-SPEC3 eimi Future state: all six English glosses are inert ink and a tap plays no audio',
      await glosses.count() === 6 && glossesPlain && (await clips()).length === 0,
      `${await glosses.count()} glosses, plain ${glossesPlain}, ${(await clips()).length} clip(s)`);
  }

  await page.evaluate(() => { window.__clips.length = 0; });
  await toggle.click();
  await page.waitForTimeout(200);
  check(`${label}: Present toggle restores the first eimi state`,
    normalizeText(await modal.locator('.pg-title').innerText()) === 'Present Active Indicative of εἰμί'
      && normalizeText(await toggle.innerText()) === 'Future'
      && (await clips()).length === 0,
    `${normalizeText(await modal.locator('.pg-title').innerText())}; toggle ${JSON.stringify(await toggle.innerText())}`);
  await modal.getByRole('button', { name: 'Close', exact: true }).click();
  await page.waitForTimeout(80);
  check(`${label}: the form-dependent Hint closes`, await page.locator('.hint-modal').count() === 0);
}

// A Hint can remain open during the ordinary correct-answer advance delay.
// When the shuffled next form crosses λύω ↔ εἰμί, its item-level hintRef
// changes behind that modal. The new surface must start at state 1; carrying
// state 2 across unlike refs would disclose a chart the learner did not choose.
{
  await go('#/activity/chapt_10/c10_drill_parsing');
  const pronounceEach = page.locator('.exercise-checks input').first();
  if (await pronounceEach.count() && await pronounceEach.isChecked()) await pronounceEach.uncheck();
  const sequence = [];
  let currentPosition = 0;
  for (let position = 0; position < parsing10.items.length; position++) {
    currentPosition = position;
    const prompt = await promptOnScreen();
    const matches = parsing10.items.filter(item => normalizeText(item.greek) === prompt);
    const identities = new Set(matches.map(item => JSON.stringify({
      answer: item.answer,
      hintRef: item.hintRef ?? parsing10.ui?.hintRef
    })));
    const item = identities.size === 1 ? matches[0] : null;
    sequence.push(item ? { prompt, item, hintRef: item.hintRef ?? parsing10.ui?.hintRef } : null);
    const next = stepper('Next');
    if (await next.isDisabled()) break;
    await next.click();
    await page.waitForTimeout(45);
  }
  const boundary = sequence.findIndex((entry, index) => entry && sequence[index + 1]
    && entry.hintRef !== sequence[index + 1].hintRef);
  if (boundary < 0) {
    check('5G-SPEC3 an open Hint resets to state 1 when auto-advance changes hintRef', false,
      'no uniquely identified adjacent λύω/eimi forms in the shuffled sequence');
  } else {
    for (let position = currentPosition; position > boundary; position--) {
      await stepper('Previous').click();
      await page.waitForTimeout(45);
    }
    const from = sequence[boundary];
    const to = sequence[boundary + 1];
    for (let stageIndex = 0; stageIndex < from.item.answer.length; stageIndex++) {
      await page.locator(`[data-stage="${stageIndex}"]`)
        .getByRole('button', { name: from.item.answer[stageIndex], exact: true }).click();
    }
    await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
    const modal = page.locator('.hint-modal');
    const controls = modal.locator('[data-hint-paradigm-controls]');
    await controls.waitFor();
    await controls.locator('[data-hint-paradigm-toggle]').click();
    await page.waitForTimeout(100);
    const stateTwoBeforeAdvance = await controls.getAttribute('data-state-index');
    await page.evaluate(() => { window.__clips.length = 0; });
    await page.waitForFunction(previous => {
      const prompt = document.querySelector('.card .prompt');
      const shown = String(prompt?.textContent || '').replace(/\s+/g, ' ').trim().normalize('NFC');
      return shown !== previous;
    }, from.prompt, { timeout: 6000 });
    await page.locator(`.hint-modal [data-hint-paradigm-controls][data-hint-ref="${to.hintRef}"][data-state-index="0"]`).waitFor();
    const firstState = to.hintRef === 'eimiParadigms'
      ? { title: 'Present Active Indicative of εἰμί', target: 'Future' }
      : { title: 'Future Active Indicative Paradigm', target: 'Middle' };
    check('5G-SPEC3 an open Hint resets to state 1 when auto-advance changes hintRef',
      stateTwoBeforeAdvance === '1'
        && await controls.getAttribute('data-hint-ref') === to.hintRef
        && await controls.getAttribute('data-state-index') === '0'
        && normalizeText(await modal.locator('.pg-title').innerText()) === firstState.title
        && normalizeText(await controls.locator('[data-hint-paradigm-toggle]').innerText()) === firstState.target
        && (await clips()).length === 0,
      `${from.hintRef}/state ${stateTwoBeforeAdvance} -> ${await controls.getAttribute('data-hint-ref')}/state ${await controls.getAttribute('data-state-index')}`);
    await modal.getByRole('button', { name: 'Close', exact: true }).click();
    await page.waitForTimeout(80);
  }
}

// The same negative conduct contract must hold on an ordinary lesson chart,
// not only inside the new eimi Hint. Prewarm the authored first form so this
// remains deterministic even when the browser starts with an empty audio DB.
{
  await go('#/activity/chapt_9/c9_learn_mp_verbs');
  await gotoTopic(1);
  const middleChart = page.locator('.card .paradigm')
    .filter({ hasText: 'Present Middle Indicative Paradigm' }).first();
  const firstCell = middleChart.locator('.pg-cell').first();
  await firstCell.locator('button.pg-greek-tap:not([disabled])').click();
  await page.waitForFunction(() => window.__clips.length > 0, null, { timeout: 5000 });
  await page.evaluate(() => { window.__clips.length = 0; });
  const before = (await clips()).length;
  await firstCell.locator('.pg-gloss').click();
  await page.waitForTimeout(250);
  const after = (await clips()).length;
  check('5G-XPATCH2 chapter 9 Present Middle paradigm: tapping an English gloss plays no audio',
    after === before,
    `${after - before} clip(s) played on a gloss tap`);
}

// ---- G8 Quick Review remains stacked, with no drill-hint toggle ----------
for (const [chapterId, activityId] of [
  ['chapt_9', 'c9_qr_paradigms'], ['chapt_10', 'c10_qr_paradigms']
]) {
  await go(`#/activity/${chapterId}/${activityId}`);
  check(`5G-SPEC3 ${activityId}: both Quick Review charts stay stacked with no toggle`,
    await page.locator('.paradigm-stack .paradigm').count() === 2
      && await page.locator('.pg-nav, [data-paradigm-switch], [data-hint-paradigm-toggle]').count() === 0,
    `${await page.locator('.paradigm').count()} charts, ${await page.locator('.pg-nav').count()} pagers, ${await page.locator('[data-paradigm-switch]').count()} toggles`);
}
// REVERSED BY DISCLOSURE-SPEC2 (amended §4.6). This asserted the exact
// opposite: that chapter 8's NAMED three-chart stack stayed a More/Back
// sequence, the naming rule being what told a paged stack from a stacked pair.
// The device review (item 4) revoked pagers on Review pages with a rationale
// the naming rule cannot outrank — a Review page must be printable, so all of
// it has to be visible at once. The naming rule still decides paging on LEARN
// pages, and the line below is what proves this page converted rather than
// half-converted: three charts stacked, and no pager left anywhere on it.
await go('#/activity/chapt_8/c8_qr_third');
check('5G G8 / §4.6 ch8 third person is a STACK on its Review page, with no pager',
  await page.locator('.paradigm-stack').count() === 1
    && await page.locator('.paradigm-stack .paradigm').count() === 3
    && await page.locator('.pg-nav, [data-paradigm-switch]').count() === 0);

// ---- G9 Repeat is retired; retry-until-right remains (5G-SPEC2 §2/§5) ----
for (const [chapterId, activityId] of [
  ['chapt_9', 'c9_ex_scripture_speller'], ['chapt_10', 'c10_ex_scripture_speller']
]) {
  await go(`#/activity/${chapterId}/${activityId}`);
  check(`5G-SPEC2 ${activityId}: Repeat This Exercise is absent and Restart remains`,
    await page.locator('[data-repeat-exercise]').count() === 0
      && !(await page.locator('.spell-checks').innerText()).includes('Repeat This Exercise')
      && await page.locator('.card').getByRole('button', { name: 'Restart Exercise', exact: true }).count() === 1);

  // A deliberately wrong first word must stay in the field, reveal no answer,
  // and remain editable for another attempt.
  await setAccents(false);
  await typeGreek('α');
  const before = normalizeText(await typed());
  await stepper('Check Answer').click();
  await page.waitForTimeout(120);
  await typeGreek('β');
  const after = normalizeText(await typed());
  check(`5G-SPEC2 ${activityId}: a wrong Check Answer keeps the typed text and permits retry`,
    before === 'α' && after === 'αβ' && await feedbackKind() === 'bad'
      && await page.locator('.spell-answer').count() === 0,
    `field ${JSON.stringify(before)} -> ${JSON.stringify(after)}, feedback ${await feedbackKind()}`);
}



// ===================================================================
// 5G-XPATCH1: N-stage commit-order coverage retained
// ===================================================================

// ---- X2 the N-stage commit order --------------------------------------
// 5G-SPEC1 §4.1 says both "commits on the final stage's click" and "exactly as
// the two-stage c8_drill_case behaves" (device-verified either-order,
// VERIFY-5F item 7). XPATCH1 §2 asked whether N > 2 needs its own rule. It
// does not, and this is what says so: the commit guard in chooseStage()
// returns while any pick is null, so the only click that can reach `commit` is
// the one that filled the last empty stage — which is also the click after
// which every stage holds a value. The two readings name the same click. What
// is durable is the FILL ORDER, pinned here in both of the orders XPATCH1's
// acceptance criteria name.
{
  const activity = activityById(ch10, 'c10_drill_parsing');
  const HASH = '#/activity/chapt_10/c10_drill_parsing';
  const stage = index => page.locator(`[data-stage="${index}"]`);
  const clickStage = async (index, label) => {
    await stage(index).locator('.tile', { hasText: label }).first().click();
    await page.waitForTimeout(120);
  };
  const answerFor = async () => {
    const prompt = await promptOnScreen();
    const hits = activity.items.filter(i => normalizeText(i.greek) === prompt);
    const unique = new Set(hits.map(i => i.answer.join('|')));
    return unique.size === 1 ? hits[0].answer : null;
  };

  // FILL ORDER 3 -> 1 -> 2. Neither the stage-3 click nor the stage-1 click
  // may judge anything; the stage-2 click commits, because it filled the last
  // empty stage.
  {
    await go(HASH);
    const answer = await answerFor();
    if (!answer) {
      check('5G-X2 fill order 3->1->2 commits on the stage-2 click, and not before', false, 'ambiguous prompt');
    } else {
      await clickStage(2, answer[2]);
      const afterThird = await feedbackKind();
      await clickStage(0, answer[0]);
      const afterFirst = await feedbackKind();
      await clickStage(1, answer[1]);
      await page.waitForTimeout(180);
      check('5G-X2 fill order 3->1->2 commits on the stage-2 click, and not before',
        afterThird === 'none' && afterFirst === 'none' && await feedbackKind() === 'ok',
        `after stage 3 ${afterThird}, after stage 1 ${afterFirst}, after stage 2 ${await feedbackKind()}`);
    }
  }

  // FILL ORDER 2 -> 3 -> 1. The stage-1 click commits even though it is not
  // the last stage BY INDEX — the literal "final stage" reading that would
  // refuse this is the one XPATCH1's acceptance criteria rule out.
  {
    await go(HASH);
    const answer = await answerFor();
    if (!answer) {
      check('5G-X2 fill order 2->3->1 commits on the stage-1 click (last EMPTY, not last INDEX)', false, 'ambiguous prompt');
    } else {
      await clickStage(1, answer[1]);
      await clickStage(2, answer[2]);
      const beforeLast = await feedbackKind();
      await clickStage(0, answer[0]);
      await page.waitForTimeout(180);
      check('5G-X2 fill order 2->3->1 commits on the stage-1 click (last EMPTY, not last INDEX)',
        beforeLast === 'none' && await feedbackKind() === 'ok',
        `after two stages ${beforeLast}, after stage 1 ${await feedbackKind()}`);
    }
  }

  // And the two-stage drill keeps the device-verified either-order contract,
  // which is the half of §4.1 a device pass has pinned. §2.9 above already
  // asserts case-then-person; this is person-then-case on the same items, so
  // the pair of orders is covered on the two-stage drill as well.
  {
    const caseDrill = activityById(ch8, 'c8_drill_case');
    await go('#/activity/chapt_8/c8_drill_case');
    const prompt = await promptOnScreen();
    const hit = caseDrill.items.find(i => normalizeText(i.greek) === prompt);
    const pair = hit && hit.answer;
    if (!pair) {
      check('5G-X2 ch8 two-stage: person-then-case still commits on the second value (VERIFY-5F item 7)', false, 'no item match');
    } else {
      await page.locator('[data-stage="0"]').locator('.tile', { hasText: pair[0] }).first().click();
      await page.waitForTimeout(120);
      const midKind = await feedbackKind();
      await page.locator('[data-stage="1"]').locator('.tile', { hasText: pair[1] }).first().click();
      await page.waitForTimeout(180);
      check('5G-X2 ch8 two-stage: person-then-case still commits on the second value (VERIFY-5F item 7)',
        midKind === 'none' && await feedbackKind() !== 'none',
        `after the person ${midKind}, after the case ${await feedbackKind()}`);
    }
  }
}

// ---- G10 six future-eimi answer-key flips (5G-SPEC2 §4/§5) -------------
// These fixtures are deliberately independent of the JSON's answer field. A
// harness that reads "Active" from the same data it is meant to police would
// bless a future Active -> Middle regression instead of catching it. The spec
// names zero-based indices 22, 23, 24, 25, 26 and 28.
for (const [itemIndex, greek, personNumber] of [
  [22, 'ἔσῃ', 'Second Singular'],
  [23, 'ἔσεσθε', 'Second Plural'],
  [24, 'ἔσομαι', 'First Singular'],
  [25, 'ἔσται', 'Third Singular'],
  [26, 'ἐσόμεθα', 'First Plural'],
  [28, 'ἔσονται', 'Third Plural']
]) {
  const label = `5G-SPEC2 parsing index ${itemIndex} ${greek}`;
  const stage = index => page.locator(`[data-stage="${index}"]`);
  const choose = async (index, value) => {
    await stage(index).getByRole('button', { name: value, exact: true }).click();
    await page.waitForTimeout(70);
  };

  let reached = await seekSelectPrompt('#/activity/chapt_10/c10_drill_parsing', greek, parsing10.items.length);
  if (reached) {
    await choose(0, 'Future');
    await choose(1, 'Active');
    await choose(2, personNumber);
    await page.waitForTimeout(180);
  }
  check(`${label}: Future Active grades correct`,
    normalizeText(parsing10.items[itemIndex]?.greek) === normalizeText(greek)
      && reached && await feedbackKind() === 'ok'
      && normalizeText(await stage(1).locator('.tile.selected').innerText()) === 'Active',
    reached ? `feedback ${await feedbackKind()}` : 'target form not reached');

  reached = await seekSelectPrompt('#/activity/chapt_10/c10_drill_parsing', greek, parsing10.items.length);
  if (reached) {
    await choose(0, 'Future');
    await choose(1, 'Middle');
    await choose(2, personNumber);
    await page.waitForTimeout(180);
  }
  const revealedVoice = reached
    ? (await stage(1).locator('.tile.correct').allInnerTexts()).map(normalizeText)
    : [];
  check(`${label}: Future Middle grades incorrect and reveals Active`,
    reached && await feedbackKind() === 'bad'
      && normalizeText(await stage(1).locator('.tile.selected').innerText()) === 'Middle'
      && revealedVoice.includes('Active'),
    reached ? `feedback ${await feedbackKind()}, revealed ${JSON.stringify(revealedVoice)}` : 'target form not reached');
}


// =====================================================================
// DISCLOSURE-SPEC3 W2 — INITIAL LOAD (DRILL-BEHAVIOR-RULES B-last)
// ---------------------------------------------------------------------
// "Anything advanced with Previous/Next loads item 1 on mount as if Next had
// been pressed once, pronouncing it on load exactly when it would pronounce on
// advance; anything where the USER picks the item keeps its empty start."
//
// Driven off the DATA rather than a hand list, so the census is the whole app:
// every activity in all ten chapters is classified and then judged. The four
// contentAudio modes below are the app's entire empty-start class — every other
// stepping surface already opens on item 1 (SelectActivity's qIndex, the
// spellers' wordIndex, DivideActivity/PlaceAccentActivity's item index,
// topicPages' topicIndex, ReadingCategories' catIndex all start at 0) and this
// asserts that too, so "already loaded" is verified rather than assumed.
{
  const CHAPTERS = { chapt_1: ch1, chapt_2: ch2, chapt_3: ch3, chapt_4: ch4, chapt_5: ch5,
    chapt_6: ch6, chapt_7: ch7, chapt_8: ch8, chapt_9: ch9, chapt_10: ch10 };
  const AUTO_LOAD_MODES = new Set(['stepper', 'flashcard', 'selfCheckStepper', 'selfCheckSequence']);
  // What "item 1 is on screen" looks like, per mode. Each is the element that
  // carries the ITEM — not the card, not the controls, which are drawn either
  // way and would make a blank screen pass.
  const ITEM_SELECTOR = {
    stepper: '.card .prompt.greek',
    flashcard: '.card .flash-pane .value, .card .flash-pane .flash-hidden',
    selfCheckStepper: '.card .prompt.greek',
    selfCheckSequence: '.card .phonetic-band'
  };
  const autoLoad = [];
  const selectionDriven = [];
  const alreadyLoaded = [];
  let total = 0;
  for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
    for (const section of ['learn', 'drill', 'exercise', 'quickReview']) {
      for (const activity of chapter[section] || []) {
        if (!activity || !activity.id) continue;
        const row = { chapterId, id: activity.id, mode: activity.mode || '', type: activity.type };
        if (activity.type === 'contentAudio' && !activity.categories && AUTO_LOAD_MODES.has(activity.mode)) {
          autoLoad.push(row);
        } else if (activity.audioTiming === 'afterTap') {
          // The ledger's own name for "the user picks the item" — ch1's four
          // explore grids, of which Letter Names and Sounds is the named model.
          selectionDriven.push(row);
        } else {
          // Everything else: a stepping surface whose index already started at
          // 0, or a page with no item sequence at all. Both are "not empty on
          // arrival", which is the only property this rule cares about.
          alreadyLoaded.push(row);
        }
        total += 1;
      }
    }
  }
  // EXHAUSTIVE, not a sample: every activity in the app falls into exactly one
  // of the three buckets, and the three add up to the whole app. A floor like
  // ">= 100 already-loaded" would have been satisfied by a classifier that
  // quietly dropped activities it did not recognise.
  check('W2 the initial-load census classifies EVERY activity in the app, once each',
    total === 219 && autoLoad.length + selectionDriven.length + alreadyLoaded.length === total
      && autoLoad.length === 13 && selectionDriven.length === 4,
    `${total} activities: ${autoLoad.length} auto-load, ${selectionDriven.length} selection-driven, ${alreadyLoaded.length} already-loaded`);

  const blank = [];
  const begins = [];
  const wrongAudio = [];
  for (const row of autoLoad) {
    await go(`#/activity/${row.chapterId}/${row.id}`);
    await page.waitForTimeout(350);
    const onScreen = (await page.locator(ITEM_SELECTOR[row.mode]).first().innerText().catch(() => '')).trim();
    if (!onScreen) blank.push(`${row.chapterId}/${row.id} (${row.mode})`);
    // W2.3: no begin screen survives anywhere in this class.
    const text = await page.locator('.card').first().innerText();
    if (/click .*(next|to begin)/i.test(text)) begins.push(`${row.chapterId}/${row.id}`);
    // W2.2: "as if Next had been pressed once" — whatever ADVANCING pronounces,
    // mounting pronounces, and whatever advancing leaves silent stays silent.
    // Compared against the app's own advance rather than against a table, so a
    // future change to one moves both or fails here.
    const onMount = (await clips()).filter(c => c.startedAt).length;
    await page.evaluate(() => { window.__clips.length = 0; });
    const next = page.locator('.card').getByRole('button', { name: /^Next/, exact: false }).first();
    if (await next.count() && !await next.isDisabled()) {
      await next.click();
      await page.waitForTimeout(400);
      const onAdvance = (await clips()).filter(c => c.startedAt).length;
      if (onMount !== onAdvance) {
        wrongAudio.push(`${row.chapterId}/${row.id}: mount ${onMount}, advance ${onAdvance}`);
      }
    }
  }
  check(`W2.1 all ${autoLoad.length} sequence-stepped activities render item 1 ON MOUNT`,
    blank.length === 0, blank.join(', '));
  check('W2.3 no "Click Next to begin" screen survives in the auto-load class',
    begins.length === 0, begins.join(', '));
  check('W2.2 each pronounces on load exactly as it pronounces on advance',
    wrongAudio.length === 0, wrongAudio.join('; '));

  // THE EXEMPTION, on the named model. ch1's Letter Names and Sounds Drill must
  // still open empty and must still print its instruction line: the learner
  // picks the letter there, so there is no first item to load.
  for (const row of selectionDriven) {
    await go(`#/activity/${row.chapterId}/${row.id}`);
    await page.waitForTimeout(250);
    const fields = await page.locator('.card .fields').count();
    const instruction = (await page.locator('.instructions').first().innerText().catch(() => '')).trim();
    check(`W2.1 ${row.chapterId}/${row.id} (selection-driven) keeps its EMPTY start and its instruction line`,
      fields === 0 && instruction.length > 0, `${fields} field blocks, instruction "${instruction}"`);
    // ...and filling it is still a tap, not a Next.
    await page.locator('.card .grid.letters .tile').first().click();
    await page.waitForTimeout(250);
    check(`W2.1 ${row.chapterId}/${row.id} fills on the first TAP`,
      await page.locator('.card .fields').count() === 1);
  }

  // AND THE THIRD CLASS: the surfaces that never had an empty start. Sampled
  // across every component type rather than every activity, because they share
  // one index-starts-at-zero behaviour per component.
  for (const [label, hash, selector] of [
    ['select (ch3 Verb Translating)', '#/activity/chapt_3/c3_drill_verb_translating', '.card .prompt'],
    ['twoStageGrid (ch8 Pronoun Case)', '#/activity/chapt_8/c8_drill_case', '.card .prompt'],
    ['spell (ch1 Vocabulary)', '#/activity/chapt_1/c1_ex_speller', '.card .flash-pane .value'],
    // NOT `.spell-target`: the whole-verse speller's typing buffer is empty on
    // arrival and is meant to be — the learner types the verse. What "loaded"
    // means on that surface is that the verse it is asking for is named.
    ['spellVerse (ch3 Scripture)', '#/activity/chapt_3/c3_ex_scripture_speller', '.card .sv-ref'],
    ['divide (ch2 Syllable Division)', '#/activity/chapt_2/c2_ex_syllable_division', '.card .exercise-count'],
    ['placeAccent (ch2 Accent Placement)', '#/activity/chapt_2/c2_ex_accent_placement', '.card .exercise-count'],
    ['categories (ch1 Reading People)', '#/activity/chapt_1/c1_ex_reading_people_places', '.reading-count'],
    ['topicPages (ch7 εἰμί)', '#/activity/chapt_7/c7_learn_eimi', '.topic-count']
  ]) {
    await go(hash);
    await page.waitForTimeout(200);
    const first = (await page.locator(selector).first().innerText().catch(() => '')).trim();
    check(`W2.1 ${label} was already loading item 1 and still does`, first.length > 0, `"${first.slice(0, 30)}"`);
  }
  await shot('w2-initial-load');
}

// =====================================================================
// DISCLOSURE-SPEC3 W3 — THE KEYBOARD'S SHIFT KEY
// ---------------------------------------------------------------------
// One keyboard for every spell surface in the app (D-15), so this is checked on
// one speller and asserted to be PRESENT on all of them — a fork would show up
// as an absence rather than as a difference.
{
  const SPELLERS = [];
  for (const [chapterId, chapter] of Object.entries({ chapt_1: ch1, chapt_2: ch2, chapt_3: ch3,
    chapt_4: ch4, chapt_5: ch5, chapt_6: ch6, chapt_7: ch7, chapt_8: ch8, chapt_9: ch9, chapt_10: ch10 })) {
    for (const activity of chapter.exercise || []) {
      if (activity && (activity.type === 'spell' || activity.type === 'spellVerse')) {
        SPELLERS.push(`${chapterId}/${activity.id}`);
      }
    }
  }
  const missing = [];
  for (const speller of SPELLERS) {
    await go(`#/activity/${speller}`);
    if (await page.locator('[data-speller-shift]').count() !== 1) missing.push(speller);
  }
  check(`W3.2 the Shift key is on all ${SPELLERS.length} spell surfaces in the app (one shared keyboard)`,
    missing.length === 0, missing.join(', '));

  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 780 });
    await go('#/activity/chapt_1/c1_ex_speller');
    // W3.2/W3.5: bottom-left corner, ON THE SPACE BAR'S ROW, with its width
    // taken out of the space bar and nothing wrapping or overflowing.
    const row = await page.locator('.tk-bottom').evaluate(node => {
      const box = node.getBoundingClientRect();
      const keys = [...node.children].map(child => {
        const r = child.getBoundingClientRect();
        return { label: child.textContent.trim(), left: Math.round(r.left - box.left),
          top: Math.round(r.top - box.top), width: Math.round(r.width) };
      });
      return { width: Math.round(box.width), gap: parseFloat(getComputedStyle(node).columnGap), keys };
    });
    const [shift, space] = row.keys;
    check(`W3.2 at ${width}px Shift is the bottom row's LEFT-HAND corner key`,
      row.keys.length === 2 && /shift/i.test(shift.label) && shift.left === 0 && shift.top === 0,
      JSON.stringify(row.keys));
    check(`W3.2 at ${width}px the space bar is the row MINUS the shift key (its width is subtracted)`,
      /space/i.test(space.label) && space.top === 0
        && Math.abs(space.width - (row.width - shift.width - row.gap)) <= 1,
      `row ${row.width}, shift ${shift.width}, gap ${row.gap}, space ${space.width}`);
    check(`W3.5 at ${width}px the added key causes no horizontal overflow`,
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  }
  await page.setViewportSize({ width: 390, height: 780 });

  // W3.2: ONE-SHOT, with a visible armed state and capital faces while armed.
  await go('#/activity/chapt_1/c1_ex_speller');
  const shiftKey = page.locator('[data-speller-shift]');
  const alpha = page.locator('.tk-letters .tk-key[data-lower="α"]');
  const beta = page.locator('.tk-letters .tk-key[data-lower="β"]');
  check('W3.2 Shift starts disarmed', await shiftKey.getAttribute('aria-pressed') === 'false');
  const faceBefore = (await alpha.innerText()).trim();
  await shiftKey.click();
  const faceArmed = (await alpha.innerText()).trim();
  check('W3.2 arming Shift turns the letter faces into capitals',
    faceBefore === 'α' && faceArmed === 'Α' && await shiftKey.getAttribute('aria-pressed') === 'true',
    `${faceBefore} -> ${faceArmed}`);
  await alpha.click();
  await page.waitForTimeout(80);
  check('W3.2 the next letter tile types its CAPITAL and the state reverts by itself',
    await typed() === 'Α' && (await alpha.innerText()).trim() === 'α'
      && await shiftKey.getAttribute('aria-pressed') === 'false',
    `typed "${await typed()}"`);
  await beta.click();
  await page.waitForTimeout(80);
  check('W3.2 and the letter after it is lower case again (one-shot, not a lock)',
    await typed() === 'Αβ', `typed "${await typed()}"`);
  await shiftKey.click();
  await shiftKey.click();
  await page.locator('.tk-letters .tk-key[data-lower="γ"]').click();
  await page.waitForTimeout(80);
  check('W3.2 tapping Shift twice DISARMS it', await typed() === 'Αβγ', `typed "${await typed()}"`);
  // W3.3: ς has no distinct capital and shifts to Σ, like σ.
  await shiftKey.click();
  await page.locator('.tk-letters .tk-key[data-lower="ς"]').click();
  await shiftKey.click();
  await page.locator('.tk-letters .tk-key[data-lower="σ"]').click();
  await page.waitForTimeout(80);
  check('W3.3 ς and σ both shift to Σ', await typed() === 'ΑβγΣΣ', `typed "${await typed()}"`);
  // W3.4: physical-keyboard parity, through the same table.
  await page.locator('.card .controls .btn', { hasText: 'Clear' }).first().click().catch(() => {});
  await page.locator('.tk-edit .btn', { hasText: 'Clear' }).click();
  await page.keyboard.press('Shift+KeyA');
  await page.keyboard.press('KeyB');
  await page.keyboard.press('Shift+KeyJ');
  await page.waitForTimeout(80);
  check('W3.4 uppercase roman input maps through the same capital table (A -> Α, J -> Σ)',
    await typed() === 'ΑβΣ', `typed "${await typed()}"`);
  await shot('w3-shift-key');

  // W3.1 / §9.2: A CAPITAL ROUND-TRIPS THE CHECKER. The word is read off the
  // shipped data and typed with its FIRST LETTER CAPITALIZED; the checker folds
  // case, so it must grade CORRECT — which is the whole claim that the shift
  // key is an input capability and not a scoring change.
  //
  // Every chapter-1 vocabulary word carries marks (this is Greek), so the
  // capital is typed through the PHYSICAL-keyboard path — Shift+key, W3.4's
  // parity layer, which reads the same capital table the tiles do — and the
  // marks then go on the mark tiles exactly as typeAccented does them. That
  // also makes this the round trip for a CAPITAL WITH A BREATHING, which is the
  // harder case: Ἄ is a capital alpha carrying a psili and an oxia, and it has
  // to fold back onto ἄ for the answer to match.
  {
    const speller = ch1.exercise.find(a => a.id === 'c1_ex_speller');
    const lexicon = JSON.parse(readFileSync('src/data/lexicon-chapt01.json', 'utf8'));
    const pool = lexicon.vocabulary || lexicon.lemmas || {};
    let target = null;
    for (let index = 0; index < (speller.items || []).length && !target; index++) {
      const entry = pool[speller.items[index].ref];
      const greek = entry && entry.greek;
      if (!greek) continue;
      const clusters = [...new Intl.Segmenter('el', { granularity: 'grapheme' }).segment(greek)]
        .map(part => part.segment);
      // The first cluster has to be a letter this keyboard shifts, and the word
      // has to be typeable end to end (no iota subscript in position one, which
      // is a composite tile rather than a shiftable key).
      const first = clusters[0].normalize('NFD');
      if (!REVERSE[first[0].toLowerCase()]) continue;
      if (first.includes('\u0345')) continue;
      target = { index, greek, clusters };
    }
    check('W3.1 the capital round-trip found a chapter-1 word whose first letter shifts',
      !!target, target ? `item ${target.index + 1} "${target.greek}"` : 'none');
    if (target) {
      await go('#/activity/chapt_1/c1_ex_speller');
      for (let step = 0; step < target.index; step++) await stepper('Next').click();
      for (let index = 0; index < target.clusters.length; index++) {
        const nfd = target.clusters[index].normalize('NFD');
        const base = nfd[0].toLowerCase();
        const marks = [...nfd.slice(1)].filter(c => /\p{M}/u.test(c)).join('');
        if (index === 0) await page.keyboard.press(`Shift+Key${REVERSE[base].toUpperCase()}`);
        else if (marks.includes('\u0345')) await tapComposite((base + '\u0345').normalize('NFC'));
        else await page.keyboard.press(keyFor(base));
        const rest = marks.replace('\u0345', '');
        if (rest) await tapMark(rest);
      }
      await page.waitForTimeout(120);
      const built = await typed();
      await page.locator('.card .controls .btn', { hasText: 'Check Answer' }).click();
      await page.waitForTimeout(400);
      check(`W3.1 a capitalized spelling ("${built}") still grades CORRECT — case folding is unchanged`,
        built.normalize('NFC') === target.greek.normalize('NFC')
            .replace(/^./u, c => c.toUpperCase()).normalize('NFC')
          && await page.locator('.card .feedback.ok').count() === 1,
        `typed "${built}" for "${target.greek}"`);
    }
  }
}

// =====================================================================
// DISCLOSURE-SPEC3 W1 — THE CHAPTER-8 REFLEXIVE CLIPS, ON BOTH SURFACES
// ---------------------------------------------------------------------
// The two example clips were crossed at extraction (Verify item 5). The data
// swap is one edit, but the same topic is rendered twice — inline on the Learn
// page and, through `contentRef`, inside the Aὐτός Translation Drill's hint —
// so the fix is only real if BOTH surfaces speak the right verse.
//
// exactAudioTap is what makes this an assertion rather than a coincidence: the
// named clip is evicted from the audio store first, so the tap has to FETCH the
// file it claims, and the request log names it.
{
  const EXPECTED = [
    ['αὐτὸ τὸ πνεῦμα συμμαρτυρεῖ', 'chapt_8_h_ex3r2'],
    ['Ἰησοῦς αὐτὸς οὐκ ἐβάπτιζεν', 'chapt_8_h_ex3r1']
  ];
  const openReflexive = async () => {
    await page.locator('details.rc-expander summary', { hasText: 'Reflexive Intensifier' }).first().click();
    await page.waitForTimeout(150);
  };
  // Surface 1: the Learn page.
  await go('#/activity/chapt_8/c8_learn_third_person');
  await gotoTopic(2);
  await openReflexive();
  for (const [greek, id] of EXPECTED) {
    const tap = page.locator('.rc-wu-example-greek', { hasText: greek }).first();
    const result = await exactAudioTap(tap, id);
    check(`W1 ch8 LEARN page: "${greek.slice(0, 24)}…" plays ${id}`,
      result.clipCount === 1 && result.fetched.some(url => url.endsWith(result.path)),
      `fetched ${JSON.stringify(result.fetched.map(u => u.split('/audio/')[1]))}`);
  }
  // Surface 2: the same topic, reached through the drill hint's contentRef.
  await go('#/activity/chapt_8/c8_drill_translation_autos');
  await page.getByRole('button', { name: 'Hint', exact: true }).click();
  await page.waitForSelector('.modal', { timeout: 8000 });
  let reached = false;
  for (let page4 = 0; page4 < 5 && !reached; page4++) {
    if (await page.locator('.modal details.rc-expander summary', { hasText: 'Reflexive Intensifier' }).count()) {
      reached = true;
      break;
    }
    const more = page.locator('.modal [data-hint-page-nav="more"]');
    if (!await more.count() || await more.isDisabled()) break;
    await more.click();
    await page.waitForTimeout(180);
  }
  check('W1 the ch8 Aὐτός Translation hint reaches the Three Uses topic through its contentRef', reached);
  if (reached) {
    await page.locator('.modal details.rc-expander summary', { hasText: 'Reflexive Intensifier' }).first().click();
    await page.waitForTimeout(150);
    for (const [greek, id] of EXPECTED) {
      const tap = page.locator('.modal .rc-wu-example-greek', { hasText: greek }).first();
      const result = await exactAudioTap(tap, id);
      check(`W1 ch8 DRILL HINT: "${greek.slice(0, 24)}…" plays ${id}`,
        result.clipCount === 1 && result.fetched.some(url => url.endsWith(result.path)),
        `fetched ${JSON.stringify(result.fetched.map(u => u.split('/audio/')[1]))}`);
    }
  }
  await shot('w1-ch8-reflexive-clips');
}

// ===================================================================
// 5H-SPEC1 W9 / 7.3: chapters 11 and 12
// ===================================================================
// Everything above already sweeps both chapters (they are in CHAPTERS and in
// CH_5F). What follows is what only they have.
{
  const cardButton = name => page.locator('.card').getByRole('button', { name, exact: true });
  const seekPrompt = async (chapterId, activityId, prompt, limit) => {
    await go(`#/activity/${chapterId}/${activityId}`);
    for (let step = 0; step < limit; step += 1) {
      const shown = normalizeText(await page.locator('.card .prompt').first().innerText());
      if (shown === normalizeText(prompt)) return true;
      const next = cardButton('Next');
      if (!await next.count() || await next.isDisabled()) return false;
      await next.click();
      await page.waitForTimeout(40);
    }
    return false;
  };
  const modalTitle = async () => normalizeText(
    await page.locator('.modal .pg-title, .modal .modal-title').first().innerText());

  // ---- 7.3(a) the three-stage grid with an EIGHT-value final stage --------
  // Chapter 10 generalised twoStageGrid to N stages; chapter 11 is the first
  // data to use three, and its last stage is the original's 2x4 case block.
  await go('#/activity/chapt_11/c11_drill_this_that');
  const stageInfo = await page.evaluate(() => [...document.querySelectorAll('.card .stage-grid')]
    .map(s => ({ count: s.querySelectorAll('.tile').length,
      paradigm2col: !!s.querySelector('.paradigm2col') })));
  check('5H ch11 This and That Drill: three option stages of 2 / 3 / 8',
    stageInfo.length === 3 && stageInfo[0].count === 2 && stageInfo[1].count === 3
      && stageInfo[2].count === 8,
    JSON.stringify(stageInfo));

  // ---- 7.3(b) answerAlt on a THREE-stage item ---------------------------
  // The 5F check covered a two-stage tuple. Chapter 11's ambiguous forms are
  // three-stage: the original's key grades masculine AND neuter right for
  // toutou, so the alternate tuple has to commit as correct here too.
  const threeStage = ch11.drill.find(a => a.id === 'c11_drill_this_that');
  const altItem = threeStage.items.find(item => Array.isArray(item.answerAlt) && item.answerAlt.length);
  {
    const found = await seekPrompt('chapt_11', 'c11_drill_this_that', altItem.greek, threeStage.items.length);
    check(`5H ch11 answerAlt: reached the ambiguous form "${altItem.greek}"`, found);
    if (found) {
      const alt = altItem.answerAlt[0];
      for (let stage = 0; stage < alt.length; stage += 1) {
        await page.locator('.card .stage-grid').nth(stage)
          .getByRole('button', { name: alt[stage], exact: true }).click();
        await page.waitForTimeout(80);
      }
      const kind = await feedbackKind();
      check(`5H ch11 answerAlt: the alternate tuple [${alt.join(' / ')}] grades CORRECT`,
        kind === 'ok', `feedback ${kind}`);
    }
  }

  // ---- 7.3(c) per-item hintRef switching, both chapters ------------------
  // The assertion the spec asks for in as many words: the modal TITLE changes
  // between an houtos item and an ekeinos item, and between a luo item and an
  // eimi item.
  for (const [chapterId, activityId, limit, formA, formB] of [
    ['chapt_11', 'c11_drill_this_that', 30, 'οὗτος', 'ἐκεῖνος'],
    ['chapt_12', 'c12_drill_parsing', 23, 'ἔλυες', 'ἦμεν']
  ]) {
    const titles = [];
    for (const form of [formA, formB]) {
      const found = await seekPrompt(chapterId, activityId, form, limit);
      if (!found) { titles.push(null); continue; }
      await cardButton('Hint').click();
      await page.waitForSelector('.modal', { timeout: 8000 });
      await page.waitForTimeout(180);
      titles.push(await modalTitle());
      await page.locator('.modal').getByRole('button', { name: 'Close', exact: true }).click();
      await page.waitForTimeout(140);
    }
    check(`5H D-46 ${activityId}: the Hint chart differs between "${formA}" and "${formB}"`,
      !!titles[0] && !!titles[1] && titles[0] !== titles[1], JSON.stringify(titles));
  }

  // ---- 7.3(d) a named toggle keeps its say-all across states -------------
  // Both halves of a demonstrative paradigm share ONE recording, so the button
  // must still be present and still live after the toggle.
  await go('#/activity/chapt_11/c11_learn_demonstratives');
  await gotoTopic(1);
  const sayAcross = () => page.evaluate(() => {
    const say = [...document.querySelectorAll('.card button')]
      .find(b => b.innerText.trim() === 'Say Paradigm');
    const sub = document.querySelector('.card .pg-subtitle');
    return { present: !!say, disabled: say ? say.disabled : null, sub: sub && sub.innerText.trim() };
  });
  const sayBefore = await sayAcross();
  await page.locator('.card [data-paradigm-switch="named"]').first().click();
  await page.waitForTimeout(180);
  const sayAfter = await sayAcross();
  check('5H ch11 named toggle: Say Paradigm survives the Singular/Plural switch',
    sayBefore.present && sayAfter.present && !sayBefore.disabled && !sayAfter.disabled
      && sayBefore.sub !== sayAfter.sub,
    `${JSON.stringify(sayBefore)} -> ${JSON.stringify(sayAfter)}`);

  // ---- 7.3(e) the six-chart More/Back stack and its bounds ---------------
  await go('#/activity/chapt_11/c11_learn_relatives');
  await gotoTopic(3);
  const stack = [];
  for (let step = 0; step < 8; step += 1) {
    stack.push(await page.evaluate(() => {
      const btn = name => [...document.querySelectorAll('.card button')]
        .find(b => b.innerText.trim() === name);
      const back = btn('Back'), more = btn('More');
      const title = document.querySelector('.card .pg-title');
      const sub = document.querySelector('.card .pg-subtitle');
      return { title: title && title.innerText.trim(), sub: sub && sub.innerText.trim(),
        back: back ? back.disabled : null, more: more ? more.disabled : null };
    }));
    const more = page.locator('.card button', { hasText: /^More$/ }).first();
    if (!await more.count() || await more.isDisabled()) break;
    await more.click();
    await page.waitForTimeout(140);
  }
  check('5H ch11 reflexive stack: SIX charts, Back disabled at the first and More at the last',
    stack.length === 6 && stack[0].back === true && stack[0].more === false
      && stack[5].more === true && stack[5].back === false
      && new Set(stack.map(s => `${s.title} ${s.sub}`)).size === 6,
    JSON.stringify(stack));

  // ---- 7.3(f) Greek perItem options on the Augment Drill, and its gate ---
  // Rule B-last plus the answer-clip gate (5H-SPEC1 3.5): the drill mounts
  // item 1, mounts SILENT because it is afterGuess, the lemma is INK and
  // Pronounce is dead until the guess, and both go live afterwards.
  await go('#/activity/chapt_12/c12_drill_augment');
  await page.waitForTimeout(450);
  const augmentPanel = () => page.evaluate(() => {
    const card = document.querySelector('.card');
    const prompt = card.querySelector('.prompt');
    const pron = [...card.querySelectorAll('.btn')].find(b => b.innerText.trim() === 'Pronounce');
    return { tag: prompt.tagName, tappable: prompt.classList.contains('greek-say'),
      gloss: !!card.querySelector('.prompt-gloss'), cite: !!card.querySelector('.prompt-citation'),
      options: [...card.querySelectorAll('.options .tile')].map(t => t.innerText.trim()),
      greekOptions: [...card.querySelectorAll('.options .tile')].every(t => t.classList.contains('greek')),
      pronounceDisabled: pron ? pron.disabled : null };
  });
  const augmentBefore = await augmentPanel();
  const augmentClips = await clips();
  check('5H ch12 Augment Drill: three GREEK options and a three-line prompt panel',
    augmentBefore.options.length === 3 && augmentBefore.greekOptions
      && augmentBefore.gloss && augmentBefore.cite, JSON.stringify(augmentBefore));
  check('5H ch12 Augment Drill: mounts SILENT (afterGuess, B-last)',
    !augmentClips.some(c => c.startedAt), JSON.stringify(augmentClips));
  check('5H ch12 Augment Drill: before the guess the lemma is INK and Pronounce is disabled',
    augmentBefore.tag === 'DIV' && !augmentBefore.tappable
      && augmentBefore.pronounceDisabled === true, JSON.stringify(augmentBefore));
  await page.locator('.card .options .tile').first().click();
  await page.waitForTimeout(600);
  const augmentAfter = await augmentPanel();
  check('5H ch12 Augment Drill: after the guess the lemma taps and Pronounce is live',
    augmentAfter.tag === 'BUTTON' && augmentAfter.tappable
      && augmentAfter.pronounceDisabled === false, JSON.stringify(augmentAfter));

  // ---- 7.3(g) the cumulative 12-word Scripture Memory grid ---------------
  // New relative to chapter 10: the pool spans BOTH halves of Mat 6:33.
  await go('#/activity/chapt_11/c11_drill_scripture_memory');
  const smOptions = await page.evaluate(() =>
    [...document.querySelectorAll('.card .options .tile')].map(t => t.innerText.trim()));
  const smItems = ch11.drill.find(a => a.id === 'c11_drill_scripture_memory').items;
  check('5H ch11 Scripture Memory Drill: one static 12-option grid over both halves of Mat 6:33',
    smOptions.length === 12 && smItems.length === 12,
    `${smOptions.length} options / ${smItems.length} items`);
}

await browser.close();
const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} behavior checks passed`);
if (failed.length) { console.log(failed.map(f => ` FAIL ${f.name} — ${f.detail}`).join('\n')); process.exit(1); }
