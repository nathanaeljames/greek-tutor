// BEHAVIOR TESTS ON THE REAL UI (5D-SPEC2 §8).
//
// Everything a script can settle must be settled before a VERIFY document
// reaches Nathanael. Round 1's VERIFY asked him to hand-type the A4 and A6
// checking-policy tables; this file types them in a real browser and reports
// pass/fail, so his time goes to the judgement calls (does the timing feel
// right, does the layout read well, does the clip say the right word).
//
//   npm run preview            # in another shell
//   node scripts/ui-behavior.mjs
//
// Everything here drives the SHIPPED UI — tiles, keys, buttons — never a
// component internal. If it passes here it passes because the app does it.

import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:4173';
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok: !!ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};

const ch3 = JSON.parse(readFileSync('src/data/chapt-03.json', 'utf8'));
const ch4 = JSON.parse(readFileSync('src/data/chapt-04.json', 'utf8'));
const ch5 = JSON.parse(readFileSync('src/data/chapt-05.json', 'utf8'));
const verse = (ch3.exercise.find(a => a.type === 'spellVerse').answerWords || []).join(' ');
const strip = s => s.normalize('NFD').replace(/\p{M}/gu, '').normalize('NFC');
const normalizeText = value => String(value ?? '').replace(/\s+/g, ' ').trim().normalize('NFC');

// playwright-core does not install a browser. Prefer its configured binary,
// then use an installed stable browser without hard-coding a machine path.
async function launchBrowser() {
  const explicit = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
  if (explicit) return chromium.launch({ executablePath: explicit });
  try {
    return await chromium.launch();
  } catch (original) {
    for (const channel of ['chrome', 'msedge']) {
      try { return await chromium.launch({ channel }); } catch { /* keep looking */ }
    }
    throw original;
  }
}

const browser = await launchBrowser();
const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
const page = await context.newPage();

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
  ['A6/1 verse with no accents, accents OFF', strip(verse), false, 'ok'],
  ['A6/2 verse fully accented, accents ON', verse, true, 'ok'],
  ['A6/3 verse with no accents, accents ON', strip(verse), true, 'bad'],
  ['A6/4 verse without its punctuation, accents ON', verse.replace(/[,·]/g, ''), true, 'ok'],
  ['A6/5 lowercase where the verse capitalizes, accents ON', verse.toLowerCase(), true, 'ok']
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
for (const [label, hash] of [
  ['ch2 Accent Rule', '#/activity/chapt_2/c2_drill_accent_rule'],
  ['ch3 Verb Translating', '#/activity/chapt_3/c3_drill_verb_translating'],
  ['ch3 Vocabulary: Greek to English', '#/activity/chapt_3/c3_drill_vocab_gk_en'],
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
  const ch1 = JSON.parse(readFileSync('src/data/chapt-01.json', 'utf8'));
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
  return activity.items.find(item => promptFor(item) === visiblePrompt
    && (!visibleCitation || normalizeText(item.ref) === visibleCitation)) || null;
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
  await go(`#/activity/${chapter === ch4 ? 'chapt_4' : 'chapt_5'}/${activityId}`);
  const currentItem = await authoredItemOnScreen(activity);
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
  await go(`#/activity/${chapterId}/${activityId}`);
  const before = await itemNumber();
  const tiles = page.locator('.grid.options .tile, .option-group .tile');
  const labels = (await tiles.allInnerTexts()).map(normalizeText);
  const currentItem = await authoredItemOnScreen(activity);
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

await browser.close();
const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} behavior checks passed`);
if (failed.length) { console.log(failed.map(f => ` FAIL ${f.name} — ${f.detail}`).join('\n')); process.exit(1); }
