// DISCLOSURE conformance on the real UI (DISCLOSURE-SPEC1 W10).
//
// One file per round of app-wide rules, driving the SHIPPED surfaces — the
// same discipline as ui-behavior.mjs: everything here clicks what a learner
// clicks and reads what a browser computes. A rule that is only asserted
// against JSON has not been verified at all; DISCLOSURE-RULES is a sheet about
// what things LOOK like and where they SIT, so every check below either reads a
// computed style or measures a box.
//
//   npm run preview            # in another shell
//   node scripts/ui-disclosure.mjs [--shots=DIR]
//
// The seven app-wide items it covers, by DISCLOSURE-RULES section:
//   R1 §3.2/§3.3  in-text links green underlined; IN-CHART triggers are not
//   R2 §3.1       every accordion green, left caret, no underline, COLLAPSED
//   R3 §4.3/§4.5  the control row never scrolls away; centred with no say-all
//   R4 §4.4       no modal stacks; no autoplay on a state change
//   R5 §4.1/§4.2  two charts = one toggle, three or more = the pair
//   R6 §3.9       Meanings: green, underlined, caret, collapsed
//   R7            termList renders; and with it wordUsage and poolKind
import { chromium } from 'playwright-core';
import { readFileSync, readdirSync, mkdirSync } from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:4173';
const SHOTS = (process.argv.find(a => a.startsWith('--shots=')) || '').split('=')[1] || null;
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok: !!ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};

const GREEN = 'rgb(31, 95, 87)';     // --teal-dark / --accent-ink #1f5f57
const BLUE = 'rgb(22, 99, 199)';     // --link #1663c7

const DATA = 'src/data';
const chapterFiles = readdirSync(DATA).filter(name => /^chapt-\d+\.json$/.test(name)).sort();
const chapters = new Map(chapterFiles.map(file => {
  const number = Number(file.match(/\d+/)[0]);
  return [`chapt_${number}`, JSON.parse(readFileSync(`${DATA}/${file}`, 'utf8'))];
}));
const activitiesOf = chapter => ['learn', 'drill', 'exercise', 'quickReview']
  .flatMap(section => chapter[section] || []);

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
const context = await browser.newContext({ viewport: { width: 390, height: 780 } });
// Same audio observability contract ui-behavior.mjs uses: src/lib/audio.js is
// the app's only audio choke point, so wrapping the constructor records every
// clip the app STARTS without changing what plays. §4.4's "nothing autoplays on
// a state change" is a claim about starts, and this is what can see one.
await context.addInitScript(() => {
  const Native = window.Audio;
  window.__clips = [];
  function Wrapped(src) {
    const el = new Native(src);
    const rec = { src, startedAt: null };
    window.__clips.push(rec);
    const play = el.play.bind(el);
    el.play = () => { rec.startedAt = Date.now(); return play(); };
    return el;
  }
  Wrapped.prototype = Native.prototype;
  window.Audio = Wrapped;
});
const page = await context.newPage();
const started = () => page.evaluate(() => window.__clips.filter(c => c.startedAt).length);
const resetClips = () => page.evaluate(() => { window.__clips.length = 0; });

let nav = 0;
const go = async hash => {
  await page.goto(`${BASE}/?run=${++nav}${hash}`, { waitUntil: 'load' });
  await page.waitForSelector('.card', { timeout: 15000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(120);
};
const gotoTopic = async index => {
  for (let i = 0; i < index; i++) {
    await page.getByRole('button', { name: 'Next Topic', exact: true }).click();
    await page.waitForTimeout(60);
  }
};
const openHint = async () => {
  await page.getByRole('button', { name: 'Hint', exact: true }).click();
  await page.waitForSelector('.modal.hint-modal', { timeout: 5000 });
  await page.waitForTimeout(150);
};
let shotIndex = 0;
const shot = async name => {
  if (!SHOTS) return;
  const file = `${String(++shotIndex).padStart(2, '0')}-${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`;
  await page.screenshot({ path: `${SHOTS}/${file}`, fullPage: true });
};

// ===========================================================================
// D1. NO UNSUPPORTED CONTENT BLOCK, ANY ACTIVITY, ANY CHAPTER
// ---------------------------------------------------------------------------
// The build guard (scripts/check-content-shapes.mjs) refuses a block type with
// no RichContent branch, but it cannot see a branch that renders NOTHING, and
// the placeholder card is what the app prints when a type falls through. This
// is the round's cheapest total-coverage check and it is what proves the two
// new types (termList, wordUsage) actually landed rather than merely passing a
// build. Topic rails are walked, because a block can sit on topic 4 of 6.
{
  const offenders = [];
  for (const [chapterId, chapter] of chapters) {
    for (const activity of activitiesOf(chapter)) {
      if (!activity || !activity.id) continue;
      await go(`#/activity/${chapterId}/${activity.id}`);
      const topics = (activity.topics || []).length || 1;
      for (let topic = 0; topic < topics; topic++) {
        if (topic) await gotoTopic(1);
        const bad = await page.locator('.pending-verification', { hasText: 'Unsupported content block' }).count();
        if (bad) offenders.push(`${chapterId}/${activity.id} topic ${topic + 1}`);
      }
    }
  }
  check('D1 no "Unsupported content block" card anywhere in chapters 1-10',
    offenders.length === 0, offenders.join(', '));
}

// ===========================================================================
// D2. R2 — EVERY ACCORDION IS GREEN, UNDERLINE-FREE AND COLLAPSED
// ---------------------------------------------------------------------------
// §3.1 admits no exceptions, so the check admits none either: every
// details.rc-expander the app can mount, on every topic of every activity.
// "Collapsed" is read off the element's own `open` property rather than off a
// height, because a zero-height open accordion would pass a height test and
// still be the wrong thing.
{
  const openOnMount = [];
  const wrongColour = [];
  const underlined = [];
  const markupLeak = [];
  let seen = 0;
  for (const [chapterId, chapter] of chapters) {
    for (const activity of activitiesOf(chapter)) {
      if (!activity || !activity.id) continue;
      await go(`#/activity/${chapterId}/${activity.id}`);
      const topics = (activity.topics || []).length || 1;
      for (let topic = 0; topic < topics; topic++) {
        if (topic) await gotoTopic(1);
        const found = await page.locator('details.rc-expander').evaluateAll(nodes => nodes.map(node => {
          const summary = node.querySelector('summary');
          const style = summary ? getComputedStyle(summary) : null;
          return {
            label: (summary ? summary.textContent : '').trim(),
            open: node.open,
            color: style ? style.color : '',
            decoration: style ? style.textDecorationLine : '',
            hasU: !!(summary && summary.querySelector('u'))
          };
        }));
        for (const entry of found) {
          seen += 1;
          const where = `${chapterId}/${activity.id} "${entry.label}"`;
          if (entry.open) openOnMount.push(where);
          if (entry.color !== GREEN) wrongColour.push(`${where} ${entry.color}`);
          if (entry.decoration !== 'none' || entry.hasU) underlined.push(where);
          if (entry.label.includes('[[')) markupLeak.push(where);
        }
      }
    }
  }
  check(`D2.1 R2 all ${seen} accordions mount COLLAPSED (§3.1)`, openOnMount.length === 0, openOnMount.join(', '));
  check(`D2.2 R2 all ${seen} accordion summaries are green #1f5f57`, wrongColour.length === 0, wrongColour.join(', '));
  check(`D2.3 R2 no accordion summary is underlined`, underlined.length === 0, underlined.join(', '));
  check(`D2.4 R2 no accordion label prints inline markup`, markupLeak.length === 0, markupLeak.join(', '));
  check(`D2.5 R2 the sweep actually found accordions to judge`, seen >= 20, `${seen} seen`);
}

// ===========================================================================
// D3. R2 — chapter 1's Six Points is one of them now
// ---------------------------------------------------------------------------
// The bespoke card had its own chevron and its own open flag. It is a standard
// expander under the letter stepper, collapsed, and the stepper's controls are
// still above it.
{
  await go('#/activity/chapt_1/c1_learn_letters');
  const six = page.locator('details.rc-expander', { hasText: 'Six Points' }).first();
  const isOpen = await six.evaluate(node => node.open).catch(() => null);
  check('D3 ch1 Six Points is a standard expander and mounts collapsed',
    await six.count() === 1 && isOpen === false
      && await page.locator('.card.collapsible').count() === 0,
    `count ${await six.count()}, open ${isOpen}`);
  await shot('ch1-six-points-collapsed');
}

// ===========================================================================
// D4. R1/§3.2 — in-text links are GREEN and underlined
//     §3.3      — in-CHART triggers keep their blue
// ---------------------------------------------------------------------------
// The two halves belong in one check because the failure they guard against is
// a single edit: restyling .popup-link without splitting the in-chart class
// would turn chapter 6's case-chart glosses green too, which §3.3 refuses
// precisely because it would collide with the blue Greek-tap convention beside
// them.
{
  await go('#/activity/chapt_2/c2_learn_grammar_review');
  const styles = await page.locator('.popup-link').evaluateAll(nodes => nodes.map(n => {
    const s = getComputedStyle(n);
    return `${s.color}/${s.textDecorationLine}`;
  }));
  check('D4.1 R1 ch2 Grammar Review links are green and underlined',
    styles.length > 0 && styles.every(s => s === `${GREEN}/underline`),
    JSON.stringify(styles));
  await shot('ch2-grammar-links-green');

  // The ch4/ch5 Introductions author their links NESTED inside an emphasis run
  // ([[u]][[link:declensions]]…[[/link]][[/u]]). A splitter that treats the
  // inner pair as text prints the markers at the learner, which is what shipped
  // until the recursion in src/lib/markup.js — and the unbreakable run also
  // pushed the paragraph past the card at 320px. Both halves are asserted:
  // the link is a real control, and no marker survives anywhere on the page.
  for (const [label, hash] of [
    ['ch4', '#/activity/chapt_4/c4_learn_nouns'],
    ['ch5', '#/activity/chapt_5/c5_learn_nouns']
  ]) {
    await go(hash);
    const links = await page.locator('.rc-para .popup-link').evaluateAll(nodes => nodes.map(n => ({
      text: n.textContent.trim(),
      color: getComputedStyle(n).color,
      decoration: getComputedStyle(n).textDecorationLine,
      display: getComputedStyle(n).display
    })));
    const cardText = await page.locator('.card').first().innerText();
    check(`D4.3 R1 ${label} Learn Nouns Introduction: two green underlined links, no literal markup`,
      links.length === 2 && links.every(l => l.color === GREEN && l.decoration === 'underline')
        && !cardText.includes('[['),
      JSON.stringify(links));
    await shot(`${label}-introduction-links-nested-markup`);
    // ...and the paragraph holding them stays inside the card at the 320px
    // floor. A link is an atomic inline box (a button blockifies), so an
    // over-long run overruns rather than wraps — which is exactly what the
    // printed markup caused here. Measured, because that is how it was found.
    await page.setViewportSize({ width: 320, height: 800 });
    await go(hash);
    const overrun = await page.locator('.card').first().evaluate(card =>
      Math.max(0, ...[...card.querySelectorAll('.rich, .rc-para')]
        .map(el => Math.ceil(el.scrollWidth - el.clientWidth))));
    check(`D4.4 R1 ${label} Introduction: the linked paragraph stays inside the card at 320px`,
      overrun <= 0, `${overrun}px overrun`);
    await page.setViewportSize({ width: 390, height: 780 });
  }

  await go('#/activity/chapt_6/c6_learn_prepositions');
  await gotoTopic(1);
  const chartTriggers = await page.locator('.rc-sense-link').evaluateAll(nodes => nodes.map(n => {
    const s = getComputedStyle(n);
    return `${s.color}/${s.textDecorationLine}`;
  }));
  check('D4.2 §3.3 ch6 in-chart gloss triggers are NOT green (they keep blue)',
    chartTriggers.length > 0 && chartTriggers.every(s => s === `${BLUE}/underline`),
    JSON.stringify(chartTriggers.slice(0, 4)));
  await shot('ch6-chart-triggers-stay-blue');
}

// ===========================================================================
// D5. R7 — termList, and W8's wordUsage
// ---------------------------------------------------------------------------
{
  await go('#/activity/chapt_2/c2_learn_grammar_review');
  await gotoTopic(2);
  const terms = await page.locator('.rc-termlist .rc-term-name').evaluateAll(nodes => nodes.map(n => ({
    text: n.textContent.trim(),
    color: getComputedStyle(n).color,
    decoration: getComputedStyle(n).textDecorationLine,
    tappable: n.tagName === 'BUTTON'
  })));
  check('D5.1 R7 ch2 Identifying Verbs renders a termList of six terms, all green',
    terms.length === 6 && terms.every(t => t.color === GREEN),
    JSON.stringify(terms.map(t => `${t.text}:${t.color}`)));
  check('D5.2 R7 a LINKED term is underlined and tappable; an unlinked one is neither',
    terms.filter(t => t.tappable).every(t => t.decoration === 'underline')
      && terms.filter(t => !t.tappable).every(t => t.decoration === 'none')
      && terms.some(t => t.tappable) && terms.some(t => !t.tappable),
    JSON.stringify(terms.map(t => `${t.text} ${t.tappable ? 'link' : 'plain'}/${t.decoration}`)));
  // Each term's definition sets FULL WIDTH under it — the whole point of
  // replacing the two-column defList (broken item 2), and the one thing a
  // class-name check cannot see.
  const widths = await page.locator('.rc-termlist .rc-termitem').evaluateAll(nodes => nodes.map(node => {
    const name = node.querySelector('.rc-term-name').getBoundingClientRect();
    const def = node.querySelector('.rc-term-def').getBoundingClientRect();
    return { sameColumn: Math.abs(def.left - node.getBoundingClientRect().left) <= 1, below: def.top >= name.bottom - 1 };
  }));
  check('D5.3 R7 every definition starts at the block\'s own left edge, beneath its term',
    widths.length === 6 && widths.every(w => w.sameColumn && w.below), JSON.stringify(widths));
  await shot('ch2-identifying-verbs-termlist');

  await go('#/activity/chapt_7/c7_learn_eimi');
  await gotoTopic(3);
  const accordions = page.locator('details.rc-expander', { hasText: 'Examples' });
  check('D5.4 W8 ch7 ou/ouk/ouch is three "Examples" accordions',
    await accordions.count() === 3, `${await accordions.count()} found`);
  await accordions.first().locator('summary').click();
  await page.waitForTimeout(120);
  const usage = page.locator('.rc-wordusage').first();
  check('D5.5 W8 the accordion body is a wordUsage block: headword, gloss, condition, examples',
    await usage.count() === 1
      && await usage.locator('.rc-wu-head').count() === 1
      && await usage.locator('.rc-wu-condition').count() === 1
      && await usage.locator('.rc-wu-example').count() === 2,
    `${await usage.locator('.rc-wu-example').count()} examples`);
  const headColour = await usage.locator('.rc-wu-head').evaluate(n => getComputedStyle(n).color);
  check('D5.6 W8 the Greek headword is a blue audio tap (directive 9)', headColour === BLUE, headColour);
  await shot('ch7-ou-ouk-ouch-examples-open');

  // W8's SECOND source shape (ch8 correction, 2026-08-16): Three Uses of
  // αὐτός. Its popups carried no Greek headword, so the block heads with a
  // title instead — and the [[u]] runs in the item text above stay plain
  // authored emphasis now that those three popups are retired, which is the
  // half a class-name check would miss.
  await go('#/activity/chapt_8/c8_learn_third_person');
  await gotoTopic(2);
  const uses = page.locator('details.rc-expander', { hasText: 'Examples' });
  check('D5.7 W8 ch8 Three Uses is three "Examples" accordions',
    await uses.count() === 3, `${await uses.count()} found`);
  const underlinedRuns = await page.locator('.rc-list u').count();
  check('D5.8 W8 ch8 the [[u]] runs are plain emphasis, not links (the popups are retired)',
    underlinedRuns >= 3 && await page.locator('.rc-list .popup-link').count() === 0,
    `${underlinedRuns} underlined runs`);
  for (let i = 0; i < 3; i += 1) { await uses.nth(i).locator('summary').click(); await page.waitForTimeout(80); }
  const ch8usage = page.locator('.rc-wordusage');
  const ch8shape = await ch8usage.evaluateAll(nodes => nodes.map(node => ({
    title: (node.querySelector('.rc-wu-title') || {}).textContent || null,
    heads: node.querySelectorAll('.rc-wu-head').length,
    examples: node.querySelectorAll('.rc-wu-example').length,
    taps: node.querySelectorAll('.rc-wu-example-greek:not([disabled])').length
  })));
  check('D5.9 W8 each ch8 block heads with a TITLE (no Greek headword) over its examples',
    ch8shape.length === 3 && ch8shape.every(b => b.title && b.heads === 0)
      && ch8shape.map(b => b.examples).join(',') === '3,2,2',
    JSON.stringify(ch8shape));
  check('D5.10 W8 all seven ch8 example taps are live',
    ch8shape.reduce((n, b) => n + b.taps, 0) === 7,
    `${ch8shape.reduce((n, b) => n + b.taps, 0)} live taps`);
  await shot('ch8-three-uses-examples-open');
}

// ===========================================================================
// D6. W9 — poolKind joins the responsive D-19 grid, and NOTHING else moves
// ---------------------------------------------------------------------------
// Asserted at BOTH widths, because the class only does anything at 768px and a
// check at one width could not tell the responsive class from a hard four-up.
// The control is an authored grid with no poolKind: chapter 2's parts-of-speech
// drill must stay two-up at both widths, or the predicate has widened.
{
  const wide = await browser.newContext({ viewport: { width: 820, height: 900 } });
  const widePage = await wide.newPage();
  const columnsAt = async (target, hash) => {
    await target.goto(`${BASE}/?run=${++nav}${hash}`, { waitUntil: 'load' });
    await target.waitForSelector('.grid.options', { timeout: 15000 });
    return target.locator('.grid.options').first().evaluate(n =>
      getComputedStyle(n).gridTemplateColumns.split(' ').length);
  };
  const pool = [];
  for (const [chapterId, chapter] of chapters) {
    for (const activity of activitiesOf(chapter)) {
      if (activity && activity.poolKind === 'vocabulary') pool.push([chapterId, activity.id]);
    }
  }
  const failures = [];
  for (const [chapterId, id] of pool) {
    const narrow = await columnsAt(page, `#/activity/${chapterId}/${id}`);
    const broad = await columnsAt(widePage, `#/activity/${chapterId}/${id}`);
    if (narrow !== 2 || broad !== 4) failures.push(`${chapterId}/${id} ${narrow}/${broad}`);
  }
  check(`D6.1 W9 all ${pool.length} poolKind drills are two-up at 390px and four-up at 820px`,
    pool.length === 8 && failures.length === 0, failures.join(', ') || `${pool.length} drills`);
  const controlNarrow = await columnsAt(page, '#/activity/chapt_2/c2_drill_part_of_speech');
  const controlBroad = await columnsAt(widePage, '#/activity/chapt_2/c2_drill_part_of_speech');
  check('D6.2 W9 a non-vocabulary AUTHORED grid stays two-up at both widths',
    controlNarrow === 2 && controlBroad === 2, `${controlNarrow}/${controlBroad}`);
  await wide.close();
}

// ===========================================================================
// D7. R5/§4.1-§4.2 — the chart count decides the control
// ---------------------------------------------------------------------------
// Read from the DATA rather than from a list of routes: every paradigm the app
// draws with a switch is exercised, so a chapter that later ships a two-chart
// stack is covered the day it lands. Exactly one switch button at two charts;
// exactly the Back/More pair at three or more.
{
  const surfaces = [
    ['ch4 Masculine Declension (moreBack, 2)', '#/activity/chapt_4/c4_learn_nouns', 4, 2, ['More', 'Back']],
    ['ch5 First Declension-Alpha (moreBack, 2)', '#/activity/chapt_5/c5_learn_nouns', 5, 2, ['More', 'Back']],
    ['ch5 Definite Article Paradigm (named, 2)', '#/activity/chapt_5/c5_learn_article', 2, 2, ['Plural', 'Singular']],
    ['ch7 Adjective Paradigm (named, 2)', '#/activity/chapt_7/c7_learn_adjectives', 1, 2, ['Plural', 'Singular']],
    ['ch7 2nd Adjective Paradigm (named, 2)', '#/activity/chapt_7/c7_learn_adjectives', 2, 2, ['Plural', 'Singular']],
    ['ch8 Third Person Paradigm (3)', '#/activity/chapt_8/c8_learn_third_person', 1, 3, null]
  ];
  for (const [label, hash, topic, charts, labels] of surfaces) {
    await go(hash);
    await gotoTopic(topic);
    const paradigm = page.locator('.paradigm[data-chart-count]').first();
    const count = Number(await paradigm.getAttribute('data-chart-count'));
    const toggles = paradigm.locator('.pg-switch-named');
    const pair = paradigm.locator('.pg-switch-back, .pg-switch-more');
    if (charts === 2) {
      const first = await toggles.first().innerText().catch(() => '');
      check(`D7 ${label}: exactly ONE switch button, no pair (§4.1)`,
        count === 2 && await toggles.count() === 1 && await pair.count() === 0,
        `charts ${count}, toggles ${await toggles.count()}, pair ${await pair.count()}`);
      // The button names where it GOES, and alternates when it gets there.
      await toggles.first().click();
      await page.waitForTimeout(150);
      const second = await paradigm.locator('.pg-switch-named').first().innerText().catch(() => '');
      check(`D7 ${label}: the toggle alternates its label (${labels.join(' -> ')})`,
        first.trim() === labels[0] && second.trim() === labels[1], `${first.trim()} -> ${second.trim()}`);
    } else {
      check(`D7 ${label}: the centred Back/More pair, both visible (§4.2)`,
        count >= 3 && await toggles.count() === 0 && await pair.count() === 2,
        `charts ${count}, toggles ${await toggles.count()}, pair ${await pair.count()}`);
    }
    await shot(`switch-${label}`);
  }
}

// ===========================================================================
// D8. R3/§4.3 — the control row never scrolls out of view
// ---------------------------------------------------------------------------
// Measured, not asserted from a class name: the row's box has to be inside the
// viewport with the surface scrolled to its very bottom AND at its very top.
// "Sticky" that only holds at one end is the bug this rule was written from.
{
  // A SHORT viewport, deliberately: the rule only says anything where the chart
  // is taller than the screen, and at 390x780 chapter 8's chart fits. 390x480
  // is an iPhone SE in landscape, which is a real device state and is the
  // shortest portrait-ish box the app supports.
  await page.setViewportSize({ width: 390, height: 480 });
  await go('#/activity/chapt_8/c8_learn_third_person');
  await gotoTopic(1);
  const rowVisible = async () => page.locator('.paradigm .pg-controls').first().evaluate(node => {
    const box = node.getBoundingClientRect();
    const port = document.querySelector('.scroll-area').getBoundingClientRect();
    return box.top >= port.top - 1 && box.bottom <= port.bottom + 1;
  });
  // The app scrolls .scroll-area, not the document (.app is a fixed-height flex
  // column between the two bars), so that is the box the row has to hold inside
  // and that is what gets scrolled here.
  const scrollTo = where => page.locator('.scroll-area').evaluate((node, to) => {
    node.scrollTop = to === 'end' ? node.scrollHeight : 0;
  }, where);
  await scrollTo('top');
  await page.waitForTimeout(120);
  const atTop = await rowVisible();
  const tallEnough = await page.locator('.scroll-area')
    .evaluate(node => node.scrollHeight > node.clientHeight + 40);
  await scrollTo('end');
  await page.waitForTimeout(150);
  const atBottom = await rowVisible();
  check('D8.1 §4.3 ch8 Third Person: the control row is on screen at BOTH ends of a taller-than-viewport page',
    tallEnough && atTop && atBottom, `tall ${tallEnough}, top ${atTop}, bottom ${atBottom}`);
  await shot('ch8-third-person-pinned-row');
  await page.setViewportSize({ width: 390, height: 780 });

  // In a modal the row is a flex footer OUTSIDE the scroller — the same shape
  // .modal-actions uses, and for the same reason (a sticky footer hangs wrong
  // at rest). Proven by scrolling the modal body to its end and finding the row
  // unmoved, with the dialog's own Close still beneath it.
  await go('#/activity/chapt_3/c3_drill_parsing');
  await openHint();
  const before = await page.locator('.modal .pg-controls').boundingBox();
  await page.locator('.modal .pg-body').evaluate(node => node.scrollTo(0, node.scrollHeight));
  await page.waitForTimeout(150);
  const after = await page.locator('.modal .pg-controls').boundingBox();
  const closeBox = await page.locator('.modal .modal-actions .btn').last().boundingBox();
  check('D8.2 §4.3 ch3 drill Hint: the control row does not move when the chart scrolls, and Close is below it',
    before && after && Math.abs(before.y - after.y) <= 1 && closeBox.y >= after.y + after.height - 1,
    `y ${before && Math.round(before.y)} -> ${after && Math.round(after.y)}`);
  check('D8.3 §4.3 the pinned row is OUTSIDE the scroller (nothing in .pg-body)',
    await page.locator('.modal .pg-body .pg-controls').count() === 0);
  await shot('ch3-hint-pinned-controls');
}

// ===========================================================================
// D9. R4/§4.4 — no modal stacking, and no autoplay on a state change
// ---------------------------------------------------------------------------
// Chapter 3's λύω chart is the only chart in the app carrying an `endings`
// table, and it is both a Learn topic and the hint of all three chapter-3
// drills — the same chart in main content and in a modal, which is what makes
// it the whole test of §4.4.
{
  await go('#/activity/chapt_3/c3_drill_parsing');
  await openHint();
  await resetClips();
  const overlaysBefore = await page.locator('.modal-overlay').count();
  await page.locator('.modal .pg-endings-toggle').click();
  await page.waitForTimeout(350);
  const overlaysAfter = await page.locator('.modal-overlay').count();
  check('D9.1 §4.4 Endings inside a Hint replaces the chart IN PLACE — no second overlay',
    overlaysBefore === 1 && overlaysAfter === 1 && await page.locator('.modal .pg-endgrid').count() === 1,
    `overlays ${overlaysBefore} -> ${overlaysAfter}`);
  check('D9.2 §4.4 NOTHING autoplays when the Endings state opens',
    await started() === 0, `${await started()} clips started`);
  const sayEndings = page.locator('.modal .pg-say-endings');
  check('D9.3 §4.4 the replaced state carries its own say button in the say-all slot',
    await sayEndings.count() === 1, await sayEndings.innerText().catch(() => 'absent'));
  await sayEndings.click();
  await page.waitForTimeout(400);
  check('D9.4 §4.4 D-10\'s clip still plays — from the explicit tap', await started() === 1,
    `${await started()} clips started`);
  await shot('ch3-hint-endings-state');
  // And back: the toggle is two-state, not one-way.
  await page.locator('.modal .pg-endings-toggle').click();
  await page.waitForTimeout(150);
  check('D9.5 §4.4 the toggle returns to the paradigm',
    await page.locator('.modal .pg-grid').count() === 1
      && await page.locator('.modal .pg-endgrid').count() === 0);

  // MAIN content keeps its single-level modal (W5.4) — one level is not
  // stacking — but it loses the autoplay and gains the say button too.
  await go('#/activity/chapt_3/c3_learn_verbs');
  await gotoTopic(2);
  await resetClips();
  await page.locator('.pg-endings-open').first().click();
  await page.waitForTimeout(350);
  check('D9.6 §4.4 the ch3 Learn Endings modal no longer autoplays on open',
    await started() === 0 && await page.locator('.modal.pg-endings').count() === 1,
    `${await started()} clips started`);
  check('D9.7 W5.4 that modal has its own say button in a fixed footer beside Close',
    await page.locator('.modal.pg-endings .modal-actions .pg-say-endings').count() === 1
      && await page.locator('.modal.pg-endings .modal-scroll .pg-say-endings').count() === 0);
  await shot('ch3-learn-endings-modal');
}

// ===========================================================================
// D10. R5/§4.1 inside a hint, and §4.5's centred no-say control
// ---------------------------------------------------------------------------
{
  // ch7 Adjective Case Drill: the hintRef resolves to charts now NAMED
  // Singular/Plural, so the toggle appears beside Say Whole List and switches
  // in place (W6.5).
  await go('#/activity/chapt_7/c7_drill_case');
  await openHint();
  const modal = page.locator('.modal.hint-modal');
  const label = await modal.locator('.pg-switch-named').first().innerText().catch(() => '');
  check('D10.1 W6.5 ch7 Adjective Case Drill hint: ONE named toggle beside the say-all',
    await modal.locator('.pg-switch-named').count() === 1
      && await modal.locator('.pg-switch-back, .pg-switch-more').count() === 0
      && await modal.locator('.pg-controls .pg-say-whole').count() === 1,
    `label "${label.trim()}"`);
  await modal.locator('.pg-switch-named').click();
  await page.waitForTimeout(150);
  check('D10.2 W6.5 it switches the chart IN PLACE (one overlay, one chart on screen)',
    await page.locator('.modal-overlay').count() === 1
      && await modal.locator('.paradigm').first().getAttribute('data-chart-index') === '1');
  await shot('ch7-case-drill-hint-toggle');

  // ch7 Adjective Translation Drill: two hint PAGES, so one alternating
  // More/Back button rather than a pair (W6.4).
  await go('#/activity/chapt_7/c7_drill_translation');
  await openHint();
  const pageToggle = page.locator('.modal [data-hint-page-controls] .hint-paradigm-toggle');
  check('D10.3 W6.4 ch7 Translation Drill hint: two pages render ONE alternating button',
    await pageToggle.count() === 1
      && await page.locator('.modal .pg-nav.hint-page-nav').count() === 0
      && (await pageToggle.innerText()).trim() === 'More');
  await pageToggle.click();
  await page.waitForTimeout(150);
  check('D10.4 W6.4 and it reads Back on page 2',
    (await page.locator('.modal [data-hint-page-controls] .hint-paradigm-toggle').innerText()).trim() === 'Back');
  await shot('ch7-translation-drill-hint-pages');

  // §4.5, the finding this rule was written from: the εἰμί hint's charts carry
  // no whole-paradigm clip, so its lone toggle must be CENTRED rather than
  // sitting in the empty say-all row's right-hand slot.
  // The εἰμί state is reached from chapter 10's parsing drill, whose ITEMS
  // carry their own hintRef — some resolve to the future paradigms (which do
  // have a say-all) and some to εἰμί (which does not). The questions are
  // shuffled, so the surface is found by stepping rather than by index.
  await go('#/activity/chapt_10/c10_drill_parsing');
  let noSayFound = null;
  for (let item = 0; item < 12; item += 1) {
    await openHint();
    const controls = page.locator('.modal [data-hint-paradigm-controls]');
    if (await controls.count()
        && await controls.evaluate(node => node.classList.contains('no-say'))) {
      noSayFound = await controls.evaluate(node => {
        const toggle = node.querySelector('.hint-paradigm-toggle');
        if (!toggle) return null;
        const row = node.getBoundingClientRect();
        const box = toggle.getBoundingClientRect();
        return {
          centred: Math.abs((box.left + box.right) / 2 - (row.left + row.right) / 2) <= 2,
          hardRight: Math.abs(box.right - row.right) <= 2,
          says: node.querySelectorAll('[data-hint-paradigm-say]').length
        };
      });
      break;
    }
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await page.waitForTimeout(80);
    // The DRILL's own Next, not the sequential rail's (both are named Next).
    await page.locator('.card .controls .btn', { hasText: /^Next$/ }).first().click();
    await page.waitForTimeout(120);
  }
  check('D10.5 §4.5 the εἰμί hint state has NO say-all and its lone toggle is CENTRED, not hard right',
    !!noSayFound && noSayFound.says === 0 && noSayFound.centred && !noSayFound.hardRight,
    JSON.stringify(noSayFound));
  await shot('ch10-parsing-hint-controls-centred');
}

// ===========================================================================
// D11. C9 §4.6 — ch5 Review Definite Article: two charts, two say-alls, no nav
// ---------------------------------------------------------------------------
// A Quick Review page shows everything at once. The restacked chart is the one
// place in the round where a PAGER would have been the wrong answer, so the
// absence of pagination is asserted as directly as its presence is elsewhere.
{
  await go('#/activity/chapt_5/c5_qr_article');
  const charts = await page.locator('.card .paradigm .pg-grid').count();
  const sayAlls = await page.locator('.card .pg-say-whole').count();
  const nav = await page.locator('.card .pg-switch').count();
  check('D11 §4.6 ch5 Review Definite Article: two stacked charts, one say-all each, zero toggles',
    charts === 2 && sayAlls === 2 && nav === 0, `charts ${charts}, say ${sayAlls}, switches ${nav}`);
  await shot('ch5-qr-definite-article-restacked');
}

// ===========================================================================
// D12. R6/§3.9 — Meanings: green, UNDERLINED, caret, collapsed, no frame
// ---------------------------------------------------------------------------
// The sole accordion label that carries an underline, which is why it is worth
// asserting the underline as loudly as D2.3 asserts its absence everywhere
// else. The caret is read as a real marker box (list-item display), because
// that is what the old inline-block rule suppressed.
{
  await go('#/activity/chapt_4/c4_learn_nouns');
  await gotoTopic(4);
  const meanings = page.locator('details.pg-meanings').first();
  const style = await meanings.locator('summary').evaluate(node => {
    const s = getComputedStyle(node);
    return { color: s.color, decoration: s.textDecorationLine, display: s.display };
  });
  check('D12 R6 Meanings is green, underlined, drawn as a list-item (its caret) and collapsed',
    style.color === GREEN && style.decoration === 'underline' && style.display === 'list-item'
      && await meanings.evaluate(node => node.open) === false,
    JSON.stringify(style));
  await shot('ch4-meanings-affordance');
}

// ===========================================================================
// D13. THE VISUAL CHECKLIST'S OWN SCREENS
// ---------------------------------------------------------------------------
// DISCLOSURE-SPEC1 §5.3 wants a resumable row per screen in §4, and §0.7 says
// asserting a string exists in JSON is not visual verification. These are the
// rows the assertions above do not already photograph, driven to and captured
// so the checklist is a record of screens that were LOOKED AT — and so it can
// be regenerated after any change rather than re-walked by hand.
if (SHOTS) {
  const rows = [
    ['ch1-capitals-note-inline', '#/activity/chapt_1/c1_learn_capitals', 0],
    ['ch1-vowels-note-inline', '#/activity/chapt_1/c1_learn_vowels', 0],
    ['ch1-diphthongs-note-inline', '#/activity/chapt_1/c1_learn_diphthongs', 0],
    ['ch2-three-syllable-rules', '#/activity/chapt_2/c2_learn_syllables', 1],
    ['ch2-6-accent-rules-MODEL', '#/activity/chapt_2/c2_learn_accents', 3],
    ['ch2-potential-placement', '#/activity/chapt_2/c2_learn_accents', 2],
    ['ch2-words-with-no-accents', '#/activity/chapt_2/c2_learn_accents', 4],
    ['ch2-breathing-marks', '#/activity/chapt_2/c2_learn_marks', 0],
    ['ch2-sentence-parts-links', '#/activity/chapt_2/c2_learn_grammar_review', 1],
    ['ch3-voice-interspersed', '#/activity/chapt_3/c3_learn_english_concepts', 2],
    ['ch3-person-interspersed', '#/activity/chapt_3/c3_learn_english_concepts', 4],
    ['ch4-case-examples', '#/activity/chapt_4/c4_learn_english_concepts', 3],
    ['ch4-introduction-links', '#/activity/chapt_4/c4_learn_nouns', 0],
    ['ch4-inflectional-forms', '#/activity/chapt_4/c4_learn_nouns', 3],
    ['ch5-case-examples', '#/activity/chapt_5/c5_learn_english_concepts', 3],
    ['ch5-introduction-links', '#/activity/chapt_5/c5_learn_nouns', 0],
    ['ch5-inflectional-forms', '#/activity/chapt_5/c5_learn_nouns', 3],
    ['ch5-definite-article-MODEL', '#/activity/chapt_5/c5_learn_article', 2],
    ['ch6-prepositions-chart', '#/activity/chapt_6/c6_learn_prepositions', 4],
    ['ch8-third-person-MODEL', '#/activity/chapt_8/c8_learn_third_person', 1],
    ['ch8-qr-third-person-C9-MODEL', '#/activity/chapt_8/c8_qr_third', 0],
    ['ch9-mp-verbs-introduction-links', '#/activity/chapt_9/c9_learn_mp_verbs', 0],
    ['ch9-deponent-verbs-link', '#/activity/chapt_9/c9_learn_mp_verbs', 3],
    ['ch10-five-stem-variations', '#/activity/chapt_10/c10_learn_future_verbs', 3]
  ];
  for (const [name, hash, topic] of rows) {
    await go(hash);
    if (topic) await gotoTopic(topic);
    await shot(name);
  }
  // The two drill hints whose footers this round rewrote but which no
  // assertion above photographs.
  for (const [name, hash] of [
    ['ch4-greek-noun-hint', '#/activity/chapt_4/c4_drill_greek_noun'],
    ['ch5-article-drill-hint', '#/activity/chapt_5/c5_drill_article'],
    ['ch9-parsing-hint-middle-passive', '#/activity/chapt_9/c9_drill_parsing'],
    ['ch8-autos-translation-hint', '#/activity/chapt_8/c8_drill_translation_autos']
  ]) {
    await go(hash);
    await openHint();
    await shot(name);
  }
  // And a vocabulary pool at BOTH widths, which is the one row a single
  // screenshot cannot show.
  const wide = await browser.newContext({ viewport: { width: 820, height: 900 } });
  const widePage = await wide.newPage();
  await widePage.goto(`${BASE}/?run=${++nav}#/activity/chapt_9/c9_drill_vocab_gk_en`, { waitUntil: 'load' });
  await widePage.waitForSelector('.grid.options');
  await widePage.waitForTimeout(200);
  await widePage.screenshot({ path: `${SHOTS}/${String(++shotIndex).padStart(2, '0')}-ch9-vocab-pool-820px-four-up.png`, fullPage: true });
  await wide.close();
  await go('#/activity/chapt_9/c9_drill_vocab_gk_en');
  await shot('ch9-vocab-pool-390px-two-up');
}

// ===========================================================================
await browser.close();
const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} disclosure checks passed.`);
if (failed.length) {
  for (const f of failed) console.log(`  FAIL ${f.name}${f.detail ? ` — ${f.detail}` : ''}`);
  process.exit(1);
}
