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
const stripElision = s => s.replace(/[᾽’ʼ‘]/gu, '');
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
// punctuation on the punctuation tiles. Lowercase is not a shortcut — the
// shared keyboard ships no capitals and no shift layer (D-18), which is
// exactly why the checker folds case; Ἰησοῦς is untypeable any other way.
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
for (const chapterId of ['chapt_1', 'chapt_2', 'chapt_3', 'chapt_4', 'chapt_5']) {
  const data = JSON.parse(readFileSync(`src/data/chapt-0${chapterId.split('_')[1]}.json`, 'utf8'));
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

const CHAPTERS = { chapt_1: ch1, chapt_2: ch2, chapt_3: ch3, chapt_4: ch4, chapt_5: ch5 };
const LEXICON = id => JSON.parse(readFileSync(`src/data/lexicon-chapt0${id.split('_')[1]}.json`, 'utf8'));
const promptGloss = () => page.locator('.card.speller .flash-pane .value').first().innerText();
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
  const before = await promptGloss();
  await setAccents(false);
  await typeAccented(stripAccents(word));
  const answeredAt = Date.now();
  await stepper('Check Answer').click();
  await page.waitForTimeout(180);
  const kind = await feedbackKind();
  const said = await awaitNextShown();
  await shot(`B1a ${chapterId} ${activity.id} CORRECT`);
  const early = await promptGloss();
  let late = early;
  while (late === before && Date.now() - answeredAt < CORRECT_MS * 3) {
    await page.waitForTimeout(50);
    late = await promptGloss();
  }
  const elapsed = Date.now() - answeredAt;
  check(`5E §1 ${chapterId} ${activity.id} (retryUntilRight): correct auto-advances on max(2000ms, clip)`,
    kind === 'ok' && !said && early === before && late !== before && elapsed >= CORRECT_MS * 0.8,
    `feedback ${kind} for ${JSON.stringify(word)}, wait message ${said}, prompt ${JSON.stringify(before)} -> ${JSON.stringify(late)} at ${elapsed}ms`);
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
  // Chapter 4's verse carries an ELISION MARK (δι᾽ ἐμοῦ, U+1FBD), and the
  // shared keyboard has no tile for one — its punctuation row is comma, raised
  // dot, period, question mark. Typing the verse without it is what a learner
  // on this keyboard can actually do, and D-18 (punctuation optional) is what
  // makes that a correct answer. So this types the typeable form, and the
  // exercise accepting it IS the assertion.
  await typeAccented(stripElision(stripAccents((activity.answerWords || []).join(' '))));
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
  return (activity.items || []).map(item => item.greek || (item.ref ? lookup(item.ref) : null));
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
  check('5E §5.3 ch2 Learn Accent Rules: the expander labels underline the rule name and print no markup',
    summaryUnderlines.includes('Nouns are retentive') && summaryUnderlines.includes('Verbs are recessive')
      && summaries.every(text => !text.includes('[[')),
    JSON.stringify(summaries));
}

// ------------------------------------------------- §6.7 modals reach Close
// REWRITTEN after 5E-SPEC3-RESPONSE item 2, because the previous version of
// this loop PASSED on a modal Nathanael could not close on an iPhone 14.
//
// It called `close.scrollIntoViewIfNeeded()` and then measured. That helper
// drives whatever scroll container the element happens to sit in, including
// the modal's own inner one — so it proved the button existed somewhere
// scrollable, which was never in doubt, and said nothing about whether a
// finger could get there. The modal capped itself to the viewport, the overlay
// therefore had nothing left to scroll, and every pixel of travel lived in a
// nested scroll region inside a position:fixed overlay. Playwright reached it;
// a thumb on iOS did not.
//
// What is asserted now is his own sentence: "You should be able to scroll
// until you can see the top border and bottom border of the modal popup on any
// popup in the app." So, driving ONLY the overlay's scrollTop — the one
// container a user can actually grab:
//   * the modal's TOP border is on screen at the top of the scroll range,
//   * its BOTTOM border is on screen at the end of it,
//   * Close is fully inside the viewport there,
//   * and the modal has NO inner scroll of its own to hide travel in.
//
// Heights are real ones. iPhone 14 is 390x844 CSS; Safari showing its toolbars
// leaves about 390x734, and with the URL bar expanded about 390x664. 320x360
// stays as the cruel case. Nothing here needs a WebKit-only visual viewport
// any more: the failure is now reproducible in Chrome at any of them.
const MODAL_VIEWPORTS = [
  { width: 390, height: 844, name: 'iPhone 14' },
  { width: 390, height: 664, name: 'iPhone 14, toolbars' },
  { width: 320, height: 360, name: 'short 320' }
];
async function checkCloseReachable(label, open) {
  for (const { width, height, name } of MODAL_VIEWPORTS) {
    await page.setViewportSize({ width, height });
    await open();
    const close = page.locator('.modal .modal-actions .btn', { hasText: 'Close' }).first();
    if (await close.count() !== 1) {
      check(`5E §6.7 ${label}: both modal borders and Close are reachable at ${width}x${height} (${name})`,
        false, 'no close button found');
      continue;
    }
    const seen = await page.evaluate(() => {
      const overlay = document.querySelector('.modal-overlay');
      const modal = overlay.querySelector('.modal');
      const closeBtn = [...modal.querySelectorAll('.modal-actions .btn')]
        .find(b => /close/i.test(b.textContent));
      const box = el => { const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; };
      overlay.scrollTop = 0;
      const atTop = box(modal);
      overlay.scrollTop = overlay.scrollHeight;
      const atEnd = { modal: box(modal), close: box(closeBtn) };
      // NOTHING under the overlay may scroll except the overlay. A nested
      // scroll region anywhere inside is the defect, whether it is on .modal
      // itself or on a grid three levels down (.kb-ref .kb-grid was).
      const nested = [...overlay.querySelectorAll('*')].filter(el => {
        const s = getComputedStyle(el);
        return /auto|scroll/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 1;
      }).map(el => el.className || el.tagName);
      return {
        vh: window.innerHeight,
        topBorder: Math.round(atTop.top),
        bottomBorder: Math.round(atEnd.modal.bottom),
        close: { top: Math.round(atEnd.close.top), bottom: Math.round(atEnd.close.bottom) },
        nested
      };
    });
    const topReachable = seen.topBorder >= 0 && seen.topBorder < seen.vh;
    const bottomReachable = seen.bottomBorder > 0 && seen.bottomBorder <= seen.vh;
    const closeReachable = seen.close.top >= 0 && seen.close.bottom <= seen.vh;
    check(`5E §6.7 ${label}: both modal borders and Close are reachable at ${width}x${height} (${name})`,
      topReachable && bottomReachable && closeReachable && seen.nested.length === 0,
      `top border ${seen.topBorder}, bottom border ${seen.bottomBorder}, close ${seen.close.top}..${seen.close.bottom}, viewport ${seen.vh}, nested scrollers ${JSON.stringify(seen.nested)}`);
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
      nested: [...el.querySelectorAll('*')].filter(node => {
        const s = getComputedStyle(node);
        return /auto|scroll/.test(s.overflowY) && node.scrollHeight > node.clientHeight + 1;
      }).map(node => node.className || node.tagName)
    };
  });
  check('5E §6.7 the overlay is the ONLY scroll container: the modal has no cap and nothing under it scrolls',
    /auto|scroll/.test(shape.overlayOverflowY) && shape.overlayScrollRange > 0
      && shape.modalMaxHeight === 'none' && !/auto|scroll/.test(shape.modalOverflowY)
      && shape.nested.length === 0,
    JSON.stringify(shape));
  await page.setViewportSize({ width: 390, height: 900 });
}

// The end-of-chapter dialog has no "Close" button by name; its escape actions
// are the ones that must be reachable. Driven through the OVERLAY's scroll for
// the same reason as above.
for (const { width, height, name } of MODAL_VIEWPORTS) {
  await page.setViewportSize({ width, height });
  const last = ch1.sequence[ch1.sequence.length - 1];
  await go(`#/activity/chapt_1/${last}`);
  await page.locator('.rail-next').click();
  await page.waitForTimeout(150);
  const seen = await page.evaluate(() => {
    const overlay = document.querySelector('.modal-overlay');
    const stay = [...overlay.querySelectorAll('.modal-actions .btn')].find(b => /stay/i.test(b.textContent));
    overlay.scrollTop = overlay.scrollHeight;
    const r = stay.getBoundingClientRect();
    return { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: window.innerHeight };
  });
  check(`5E §6.7 end-of-chapter dialog: its last action is reachable at ${width}x${height} (${name})`,
    seen.top >= 0 && seen.bottom <= seen.vh, JSON.stringify(seen));
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
  const mismatches = [];
  for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
    for (const activity of activitiesOf(chapter)) {
      for (const topic of (activity && activity.topics) || []) {
        for (const block of topic.content || []) {
          const titles = [block.title, ...((block.charts || []).map(c => c.title))].filter(Boolean);
          for (const title of titles) {
            if (topic.title && normalizeText(title) !== normalizeText(topic.title)) {
              mismatches.push(`${chapterId} ${JSON.stringify(topic.title)} vs ${JSON.stringify(title)}`);
            }
          }
        }
      }
    }
  }
  // Every mismatch must be an abbreviation of the same heading, and the only
  // one the renderer's key expands is "masc".
  const unhandled = mismatches.filter(m => !/masc/i.test(m) || !ABBREVIATIONS.test(m));
  check('5E-R1 the only topic/chart title mismatch in chapters 1-5 is the one the dedup key handles',
    unhandled.length === 0, mismatches.length ? mismatches.join('; ') : 'no mismatches at all');
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
    check('5E-R4 the shared keyboard has an apostrophe tile that inserts U+1FBD',
      !!tile && tile.insert === '᾽', JSON.stringify(tile));
    await go('#/activity/chapt_4/c4_ex_scripture_speller');
    const onScreen = await page.locator('.tk-key.punct[title="apostrophe"]').count();
    await page.locator('.tk-key.punct[title="apostrophe"]').first().click();
    await page.waitForTimeout(150);
    check('5E-R4 tapping it puts the elision mark in the field as its own character',
      onScreen === 1 && (await typed()).normalize('NFC') === '᾽',
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
    verbatim === 'ok' && verbatimTyped.includes('᾽'),
    `feedback ${verbatim} for ${JSON.stringify(verbatimTyped)}`);

  // (b) with the elision mark typed as a smooth breathing — the way the
  // ORIGINAL represents it, and the way Nathanael typed it. Still accepted, so
  // nobody is punished for the habit the original taught them.
  await go('#/activity/chapt_4/c4_ex_scripture_speller');
  await setAccents(false);
  await typeAccented(words.map(w => (/δι/.test(w) ? 'δἰ'.normalize('NFC') : w)).join(' '));
  await stepper('Check Answer').click();
  await page.waitForTimeout(250);
  const withBreathing = await feedbackKind();
  await shot('R4 elision typed as a smooth breathing');
  check("5E-R4 δι + smooth breathing is still accepted for δι᾽ (the original's own form)",
    withBreathing === 'ok', `feedback ${withBreathing} for ${JSON.stringify(await typed())}`);

  // (c) with no mark at all — punctuation is optional (D-18).
  await go('#/activity/chapt_4/c4_ex_scripture_speller');
  await setAccents(false);
  await typeAccented(stripElision(words.join(' ')));
  await stepper('Check Answer').click();
  await page.waitForTimeout(250);
  check('5E-R4 δι with no elision mark is also accepted (D-18)',
    await feedbackKind() === 'ok', `feedback ${await feedbackKind()}`);

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

  // The lexicon-derived vocabulary pools, in BOTH directions, are the grids
  // D-19 is about: 2-up on a phone, 4-up once the iPad has room.
  const vocabulary = census.filter(row => /_vocab_(gk_en|en_gk)$/.test(row.id));
  const paradigm = census.filter(row => row.layout === 'paradigm2col');
  const declared = census.filter(row => row.layout === 'single' || row.layout === 'grouped');

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

await browser.close();
const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} behavior checks passed`);
if (failed.length) { console.log(failed.map(f => ` FAIL ${f.name} — ${f.detail}`).join('\n')); process.exit(1); }
