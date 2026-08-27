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
// The amended §3.1 accordion box: 1px #ddd6c2, filled one step lighter than the
// #fdf9e7 card it sits on.
const BOX_BORDER = '1px/solid/rgb(221, 214, 194)';
const BOX_FILL = 'rgb(255, 253, 243)';

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
  const unboxed = [];
  const indented = [];
  const padding = new Set();
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
          const box = getComputedStyle(node);
          const body = node.querySelector('.rc-expander-body');
          return {
            label: (summary ? summary.textContent : '').trim(),
            open: node.open,
            color: style ? style.color : '',
            decoration: style ? style.textDecorationLine : '',
            hasU: !!(summary && summary.querySelector('u')),
            // AMENDED §3.1: the box, and the absence of a second indent inside it.
            border: `${box.borderTopWidth}/${box.borderTopStyle}/${box.borderTopColor}`,
            background: box.backgroundColor,
            summaryPad: style ? `${style.paddingTop}/${style.paddingLeft}` : '',
            bodyIndent: body
              ? Math.round(parseFloat(getComputedStyle(body).paddingLeft)
                - parseFloat(style ? style.paddingLeft : '0'))
              : 0
          };
        }));
        for (const entry of found) {
          seen += 1;
          const where = `${chapterId}/${activity.id} "${entry.label}"`;
          if (entry.open) openOnMount.push(where);
          if (entry.color !== GREEN) wrongColour.push(`${where} ${entry.color}`);
          if (entry.decoration !== 'none' || entry.hasU) underlined.push(where);
          if (entry.label.includes('[[')) markupLeak.push(where);
          if (entry.border !== BOX_BORDER || entry.background !== BOX_FILL) {
            unboxed.push(`${where} ${entry.border} on ${entry.background}`);
          }
          if (entry.bodyIndent > 1) indented.push(`${where} +${entry.bodyIndent}px`);
          padding.add(entry.summaryPad);
        }
      }
    }
  }
  check(`D2.1 R2 all ${seen} accordions mount COLLAPSED (§3.1)`, openOnMount.length === 0, openOnMount.join(', '));
  check(`D2.2 R2 all ${seen} accordion summaries are green #1f5f57`, wrongColour.length === 0, wrongColour.join(', '));
  check(`D2.3 R2 no accordion summary is underlined`, underlined.length === 0, underlined.join(', '));
  check(`D2.4 R2 no accordion label prints inline markup`, markupLeak.length === 0, markupLeak.join(', '));
  check(`D2.5 R2 the sweep actually found accordions to judge`, seen >= 20, `${seen} seen`);
  // NEW IN DISCLOSURE-SPEC2 (amended §3.1). SPEC1 shipped these borderless; the
  // device review (item 1) rejected that and named the approved variation: a
  // box, one step lighter than the card, with the title in green.
  check(`D2.6 §3.1 all ${seen} accordions are a BOX: 1px #ddd6c2 on #fffdf3`,
    unboxed.length === 0, unboxed.slice(0, 6).join(', '));
  // Item 1(d)/(e): the body was hanging past the caret, which put a second
  // indent inside a box that already insets its text. The box determines
  // placement now, so the body starts level with the summary.
  check(`D2.7 §3.1 no accordion body is indented past its summary`,
    indented.length === 0, indented.slice(0, 6).join(', '));
  // Item 1(b) flagged ch1 Six Points' padding as inflated relative to the rest.
  // Every accordion in the app resolving to ONE padding value is what makes
  // that impossible to reintroduce, whatever the host.
  check(`D2.8 §3.1 every accordion has the SAME minimal summary padding`,
    padding.size === 1, [...padding].join(' | '));
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
    // 5H: chapters 11 and 12 declare `poolKind` on both of their vocabulary
    // drills each, so the census is twelve.
    pool.length === 12 && failures.length === 0, failures.join(', ') || `${pool.length} drills`);
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
// D8. §4.3 AS AMENDED 2026-08-17 — PINNING IS MODALS ONLY
// ---------------------------------------------------------------------------
// REWRITTEN FOR DISCLOSURE-SPEC2. D8.1 used to assert the opposite of what it
// asserts now: that on a taller-than-viewport LEARN page the control row stayed
// on screen at both ends of the scroll. The device review revoked main-content
// pinning outright ("my comment about pinning the nav items applies ONLY to nav
// items in modals"), so the check is inverted rather than deleted — a row that
// sticks again is a regression, and nothing else would catch it.
{
  // Same short viewport the old assertion used, for the same reason: the rule
  // only says anything where the chart is taller than the screen.
  await page.setViewportSize({ width: 390, height: 480 });
  await go('#/activity/chapt_8/c8_learn_third_person');
  await gotoTopic(1);
  // The app scrolls .scroll-area, not the document (.app is a fixed-height flex
  // column between the two bars).
  const scrollTo = where => page.locator('.scroll-area').evaluate((node, to) => {
    node.scrollTop = to === 'end' ? node.scrollHeight : 0;
  }, where);
  const tallEnough = await page.locator('.scroll-area')
    .evaluate(node => node.scrollHeight > node.clientHeight + 40);
  await scrollTo('top');
  await page.waitForTimeout(120);
  const navTopAtStart = await page.locator('.paradigm .pg-nav').first()
    .evaluate(node => node.getBoundingClientRect().top);
  await scrollTo('end');
  await page.waitForTimeout(150);
  const navTopAtEnd = await page.locator('.paradigm .pg-nav').first()
    .evaluate(node => node.getBoundingClientRect().top);
  const scrolled = await page.locator('.scroll-area').evaluate(node => node.scrollTop);
  check('D8.1 §4.3 ch8 Third Person LEARN page: the control row SCROLLS with its chart (main-content pinning revoked)',
    tallEnough && scrolled > 40 && Math.abs((navTopAtStart - navTopAtEnd) - scrolled) <= 2,
    `moved ${Math.round(navTopAtStart - navTopAtEnd)}px against ${Math.round(scrolled)}px of scroll`);
  check('D8.1b §4.3 nothing anywhere in main content computes to position: sticky',
    await page.locator('.scroll-area .pg-controls, .scroll-area .pg-nav, .scroll-area .pg-actions')
      .evaluateAll(nodes => nodes.every(n => getComputedStyle(n).position !== 'sticky')));
  await shot('ch8-third-person-learn-unpinned');
  await page.setViewportSize({ width: 390, height: 780 });

  // In a MODAL the row is a flex footer OUTSIDE the scroller — the same shape
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
  check('D8.2 §4.3 ch3 drill Hint: the pinned line does not move when the chart scrolls, and Close is below it',
    before && after && Math.abs(before.y - after.y) <= 1 && closeBox.y >= after.y + after.height - 1,
    `y ${before && Math.round(before.y)} -> ${after && Math.round(after.y)}`);
  check('D8.3 §4.3 the pinned line is OUTSIDE the scroller (nothing in .pg-body)',
    await page.locator('.modal .pg-body .pg-controls').count() === 0);
  await shot('ch3-hint-pinned-line');
}

// ===========================================================================
// D13. §4.3 — THE MODAL FOOTER COMPOSITION, EVERY MODAL, EVERY STATE
// ---------------------------------------------------------------------------
// New in DISCLOSURE-SPEC2. The device review found FIVE different compositions
// across the chapters (item 2, panes a-e), so this walks every modal the app
// can open and measures the one composition against all of them at once:
//
//   at most ONE pinned line of navigation, and only in a modal;
//   a say button is pinned only when a nav control shares its line;
//   exactly ONE divider, between the scrolling content and the pinned block;
//   NO divider between the nav line and Close;
//   THE STRIP ABOVE THE DIVIDER EQUALS THE STRIP BELOW IT.
//
// REWRITTEN FOR DISCLOSURE-SPEC3 (W7), in three ways, each of which is a thing
// the SPEC2 version could not have caught:
//
//  1. THE PADDING IS MEASURED, NOT READ OFF A DECLARATION. SPEC2 read
//     `paddingBottom` from the scroller and `paddingTop` from the footer and
//     asked only that both were >= 6. Both were, in every modal, on the build
//     the 2026-08-18 review then rejected — because the strips the EYE sees are
//     not those declarations. Above the line the eye sees the scroller's
//     padding PLUS whatever bottom margin the last block let escape (20px on
//     ch2); below it, the footer's padding PLUS the control row's own
//     margin-top (23px on ch8). This measures from the last painted content
//     edge down to the line, and from the line down to the first control, which
//     is what a person with a ruler would do.
//  2. THE TWO STRIPS MUST BE EQUAL, within 1px, not merely both present.
//     "Padding above AND below, with no extra or double padding on either
//     side" is Nathanael's wording and it is a symmetry claim; >= 6 is not.
//  3. AT FORCED SCROLL, and through EVERY STATE a modal can reach. The
//     amendment's own instruction is to resize until the content must scroll
//     before looking, because a short body hides the strip above by never
//     reaching it — so the walk runs at 390x520 and steps each modal's own
//     navigation, measuring the replaced states too.
//
// A "divider" is read as a computed border or box-shadow, because the two are
// interchangeable to the eye and a fix that swapped one for the other would
// otherwise pass. Since the 2026-08-25 re-land there is exactly one thing in
// the app that draws one — the first pinned block's TOP border — and a second
// appearing anywhere, including the scroller's own bottom border coming back,
// is the regression this is here to catch.
//
//  4. MID-SCROLL, NOT JUST AT THE END (added 2026-08-25, after this walk
//     passed a build Nathanael's screenshots showed broken). The W7 rewrite
//     scrolled every modal to the END of its content before measuring,
//     reasoning that the strip above the line "is only visible once the
//     content has run out". That reasoning was the bug's camouflage: the strip
//     was the scroller's own padding-bottom, and overflow clips at the PADDING
//     BOX, so scrolling content painted straight through that padding to the
//     line — Say Whole Paradigm chopped mid-glyph — at every position EXCEPT
//     the end, which is the one position this walk measured. The strip above
//     is now measured at mid-scroll, from the scroller's clip edge (the band
//     content cannot paint), and again at the end of the scroll from the last
//     painted content edge, and the two must agree within 1px.
{
  // `expect` is the pinned-line shape; `steps` is how many times the modal's
  // own navigation is pressed, so each replaced state is measured in turn.
  const MODALS = [
    ['ch3 Parsing Drill hint (2-state: say + Endings)', '#/activity/chapt_3/c3_drill_parsing', 'hint', 'toggle', 1],
    ['ch3 Verb Translating hint (2-state, review pane f)', '#/activity/chapt_3/c3_drill_verb_translating', 'hint', 'toggle', 1],
    ['ch4 Greek Noun hint (2-chart: say + More)', '#/activity/chapt_4/c4_drill_greek_noun', 'hint', 'toggle', 1],
    ['ch5 Declining Noun hint (single chart, NO nav)', '#/activity/chapt_5/c5_drill_declining', 'hint', 'none', 0],
    ['ch5 Article Drill hint (2-chart named)', '#/activity/chapt_5/c5_drill_article', 'hint', 'toggle', 1],
    ['ch5 First Declension Noun hint (single chart)', '#/activity/chapt_5/c5_drill_first_decl_noun', 'hint', 'none', 0],
    ['ch7 Adjective Case Drill hint (2-chart named)', '#/activity/chapt_7/c7_drill_case', 'hint', 'toggle', 1],
    // The review's GOOD pane and BAD pane, side by side in one walk. They are
    // the two compositions that drifted apart, so they are named here rather
    // than left to the generic sweep.
    ['ch7 Adjective Translation hint (review A2 GOOD pane)', '#/activity/chapt_7/c7_drill_translation', 'hint', 'pair', 1],
    ['ch8 Personal Pronoun Case hint (review A2 BAD pane)', '#/activity/chapt_8/c8_drill_case', 'hint', 'pair', 2],
    ['ch8 Autos Translation hint (4 pages)', '#/activity/chapt_8/c8_drill_translation_autos', 'hint', 'pair', 3],
    ['ch9 Parsing hint (composite, 2 states)', '#/activity/chapt_9/c9_drill_parsing', 'hint', 'toggle', 1],
    // §4.5's lone centred toggle: the one state in the app with no say button.
    ['ch10 Parsing hint (εἰμί, no say button)', '#/activity/chapt_10/c10_drill_parsing', 'hint', 'toggle', 1],
    // 5H. Chapter 11's four drill hints are all the §4.5 lone centred toggle
    // (a two-state sg/pl pair with NO say-all -- the original's hint has
    // Cancel only), and chapter 12's parsing and translation hints are the
    // same shape with Active/Middle-Passive and εἰμί/ἔχω labels. The Augment
    // Drill's hint is inline prose with no navigation at all.
    ['ch11 This and That hint (sg/pl toggle, no say)', '#/activity/chapt_11/c11_drill_this_that', 'hint', 'toggle', 1],
    ['ch11 Who and The hint (article/ὅς, sg/pl toggle)', '#/activity/chapt_11/c11_drill_who_the', 'hint', 'toggle', 1],
    ['ch11 This and That Translation hint (sg/pl toggle)', '#/activity/chapt_11/c11_drill_translation_this_that', 'hint', 'toggle', 1],
    ['ch11 Relative Translation hint (ὅς, sg/pl toggle)', '#/activity/chapt_11/c11_drill_translation_relative', 'hint', 'toggle', 1],
    ['ch12 Parsing hint (composite, 2 states)', '#/activity/chapt_12/c12_drill_parsing', 'hint', 'toggle', 1],
    ['ch12 Translation hint (λύω, 2 states)', '#/activity/chapt_12/c12_drill_translation', 'hint', 'toggle', 1],
    ['ch12 Augment Drill hint (inline prose, no nav)', '#/activity/chapt_12/c12_drill_augment', 'hint', 'none', 0],
    ['ch11 Demonstrative Examples popup (no nav)', '#/activity/chapt_11/c11_learn_demonstratives', 'expanderlink', 'none', 0],
    ['ch2 Syllable Division hint (prose, no nav)', '#/activity/chapt_2/c2_ex_syllable_division', 'hint', 'none', 0],
    ['ch3 Learn Verbs Endings modal (no nav)', '#/activity/chapt_3/c3_learn_verbs', 'endings', 'none', 0],
    ['ch6 preposition popup (no nav)', '#/activity/chapt_6/c6_learn_prepositions', 'popup', 'none', 0],
    // THE THREE MODALS THAT ARE NOT A HINT. The A2 response says the divider
    // "lands on EVERY modal — drill hints, popups, the end-of-chapter dialog,
    // the keyboard reference", so the walk covers those too. The last two are
    // short enough that their content does not scroll at 520px, which is fine:
    // the SYMMETRY claim holds either way, and `mustScroll` says which states
    // are also carrying the forced-scroll half of the check.
    ['the Greek keyboard reference', '#/activity/chapt_1/c1_ex_speller', 'keyboard', 'none', 0],
    // Its escape is called "Stay", not "Close" — a dialog that offers three
    // places to GO needs its dismissal to say what staying means. §4.3's rule is
    // that the escape is LAST, not that it is spelled a particular way, so the
    // expected label is named here rather than the app-wide pattern loosened.
    ['the end-of-chapter dialog', '#/activity/chapt_1/c1_learn_bibliography', 'endofchapter', 'none', 0, false, /stay/i],
    ['the Settings confirm dialog', '#/settings', 'settings', 'none', 0, false]
  ];
  const readFooter = escape => page.locator('.modal').last().evaluate((modal, pattern) => {
    const drawsLine = (el, side) => {
      if (!el) return false;
      const s = getComputedStyle(el);
      return parseFloat(s[`border${side}Width`]) > 0 || (s.boxShadow && s.boxShadow !== 'none');
    };
    const actions = modal.querySelector('.modal-actions');
    const scroller = modal.querySelector('.modal-scroll, .pg-body');
    // Every element between the scroller and Close that holds a control.
    const pinnedLines = [...modal.querySelectorAll(
      ':scope > .paradigm > .pg-controls, :scope > .pg-controls, .modal-actions > .pg-nav, .modal-actions > [data-hint-paradigm-controls], .modal-actions > [data-hint-page-controls]')];
    const close = [...modal.querySelectorAll('.modal-actions .btn')].pop();
    // WHAT DRAWS A LINE BELOW THE CONTENT. The first pinned block's top border
    // is the one sanctioned divider; the scroller drawing its own bottom
    // border is the 2026-08-25 regression coming back (its "strip above" is
    // paintable padding), and anything else drawing a top border or shadow is
    // a second line.
    const outside = [...modal.querySelectorAll('*')]
      .filter(el => scroller && el !== scroller && !scroller.contains(el));
    const owners = [];
    if (scroller && drawsLine(scroller, 'Bottom')) owners.push(scroller);
    owners.push(...outside.filter(el => drawsLine(el, 'Top')));
    const owner = owners[0] || null;
    const ownerStyle = owner ? getComputedStyle(owner) : null;
    const line = owner == null ? null
      : owner === scroller
        ? owner.getBoundingClientRect().bottom - parseFloat(ownerStyle.borderBottomWidth)
        : owner.getBoundingClientRect().top;
    const border = owner == null ? 0
      : parseFloat(owner === scroller ? ownerStyle.borderBottomWidth : ownerStyle.borderTopWidth);
    // MID-SCROLL FIRST (comment 4 above): the strip above the line is the band
    // between the scroller's CLIP EDGE and the line, because the clip edge is
    // where content stops painting at every scroll position — a strip carried
    // inside the scroller's own padding box does not exist mid-scroll and must
    // read as 0 here, which is exactly the defect the end-only walk blessed.
    let aboveMid = null;
    let clip = null;
    if (scroller && line != null) {
      scroller.scrollTop = Math.round((scroller.scrollHeight - scroller.clientHeight) / 2);
      const r = scroller.getBoundingClientRect();
      const s = getComputedStyle(scroller);
      clip = r.bottom - parseFloat(s.borderBottomWidth);
      aboveMid = line - clip;
    }
    // ...then the END of the scroll, where the eye reads the gap from the last
    // painted content edge instead of the clip edge. A trailing margin under
    // the last block, or a reintroduced scroller padding, opens daylight
    // between this number and the mid-scroll one.
    let aboveEnd = null;
    if (scroller && line != null) {
      scroller.scrollTop = scroller.scrollHeight;
      let lastContent = null;
      for (const el of scroller.querySelectorAll('*')) {
        const r = el.getBoundingClientRect();
        if (r.height === 0 || r.bottom > clip + 0.5) continue;
        if (lastContent === null || r.bottom > lastContent) lastContent = r.bottom;
      }
      if (lastContent !== null) aboveEnd = line - lastContent;
    }
    // The first control drawn under the line.
    const firstBelow = outside
      .filter(el => (el.tagName === 'BUTTON' || el.classList.contains('pg-nav'))
        && el.getBoundingClientRect().top >= line - 1)
      .map(el => el.getBoundingClientRect().top)
      .sort((a, b) => a - b)[0];
    return {
      pinnedLines: pinnedLines.length,
      // A say button counts as pinned only if it is inside a pinned line.
      pinnedSays: pinnedLines.reduce((n, l) =>
        n + l.querySelectorAll('.pg-say-whole, [data-hint-paradigm-say]').length, 0),
      pinnedNavs: pinnedLines.reduce((n, l) =>
        n + l.querySelectorAll('.pg-switch, .hint-paradigm-toggle, [data-hint-page-nav]').length, 0),
      dividers: owners.length,
      dividerOwner: owners.length ? (owners[0] === scroller ? 'scroller' : owners[0].className) : null,
      // The nav line and Close must not be separated by one.
      dividerBetweenNavAndClose: pinnedLines.length > 0
        && pinnedLines.some(l => l.parentElement !== actions) && drawsLine(actions, 'Top'),
      scrolls: scroller ? scroller.scrollHeight > scroller.clientHeight + 2 : false,
      above: aboveMid == null ? null : Math.round(aboveMid),
      aboveEnd: aboveEnd == null ? null : Math.round(aboveEnd),
      below: firstBelow == null ? null : Math.round(firstBelow - line - border),
      closeIsLast: !!close && new RegExp(pattern, 'i').test(close.textContent)
    };
  }, escape.source);
  // FORCED SCROLL, for the whole walk (amended §4.3). 520px is short enough to
  // make every one of these modals scroll and tall enough to stay outside the
  // max-height:420px compaction, which is a different composition question.
  await page.setViewportSize({ width: 390, height: 520 });
  let scrolledStates = 0;
  for (const [label, hash, how, expect, steps, mustScroll = true, escape = /close|cancel/i] of MODALS) {
    await go(hash);
    if (how === 'hint') {
      await page.getByRole('button', { name: 'Hint', exact: true }).click();
    } else if (how === 'endings') {
      await gotoTopic(2);
      await page.locator('.pg-endings-open').first().click();
    } else if (how === 'keyboard') {
      await page.locator('.card').getByRole('button', { name: 'Greek Keyboard', exact: true }).click();
    } else if (how === 'endofchapter') {
      await page.locator('.rail-next').click();
    } else if (how === 'settings') {
      await page.getByRole('button', { name: 'Clear downloaded audio', exact: true }).click();
    } else if (how === 'expanderlink') {
      // 5H: the C3 link lives INSIDE the C6 accordion it belongs to, so the
      // accordion opens first and the green link under it opens the modal.
      await page.locator('.card details summary').first().click();
      await page.waitForTimeout(150);
      await page.locator('.card .popup-link').first().click();
    } else {
      await gotoTopic(1);
      await page.locator('.rc-sense-link').first().click();
    }
    await page.waitForSelector('.modal', { timeout: 8000 });
    await page.waitForTimeout(200);
    for (let step = 0; step <= steps; step++) {
      const where = step === 0 ? label : `${label} [state ${step + 1}]`;
      if (step) {
        // Whatever this modal's own navigation is: the two-state toggle, the
        // Back/More pair, or the paged hint's More.
        // Every shape of "show me the next state" this app has: the composite
        // hint's toggle, a paged hint's More, the §4.2 pair's More, the §4.1
        // named toggle, and the in-place Endings toggle.
        const nav = page.locator([
          '.modal [data-hint-paradigm-toggle]',
          '.modal [data-hint-page-nav="more"]',
          '.modal [data-paradigm-switch="more"]',
          '.modal [data-paradigm-switch="named"]',
          '.modal [data-paradigm-switch="endings"]'
        ].join(', ')).first();
        await nav.click();
        await page.waitForTimeout(180);
      }
      const f = await readFooter(escape);
      if (step === 0) {
        check(`D13 ${where}: at most ONE pinned line, and it is ${expect === 'none' ? 'absent' : 'present'}`,
          f.pinnedLines <= 1 && (expect === 'none' ? f.pinnedLines === 0 : f.pinnedLines === 1),
          JSON.stringify(f));
        check(`D13 ${where}: a say button is pinned only beside a nav control`,
          expect === 'toggle' ? f.pinnedNavs >= 1 : f.pinnedSays === 0,
          `${f.pinnedSays} pinned says, ${f.pinnedNavs} pinned navs`);
        check(`D13 ${where}: Close is the last control in the footer`, f.closeIsLast);
      }
      check(`D13 ${where}: exactly ONE divider, and none between the nav line and Close`,
        f.dividers === 1 && !f.dividerBetweenNavAndClose,
        `${f.dividers} dividers (${f.dividerOwner}), between-nav-and-close ${f.dividerBetweenNavAndClose}`);
      // W7.2(b)/(c): the content must actually be scrolling, and the two light
      // strips must be the same size. This is the check the review asked for in
      // as many words, and the one this file did not have. `above` is measured
      // MID-SCROLL, at the clip edge (comment 4): a strip that only exists at
      // the end of the scroll reads 0 here and fails.
      if (f.scrolls) scrolledStates += 1;
      check(`D13 ${where}: the strip above the divider equals the strip below it${mustScroll ? ', AT FORCED SCROLL' : ''}`,
        (!mustScroll || f.scrolls) && f.above != null && f.below != null
          && Math.abs(f.above - f.below) <= 1 && f.above >= 6,
        `scrolls ${f.scrolls}, above ${f.above}px (mid-scroll), below ${f.below}px`);
      // 2026-08-25: and the strip must be the SAME strip at every scroll
      // position — the band the eye saw collapse was equal-at-the-end and
      // absent everywhere else.
      check(`D13 ${where}: the strip above the line is the same mid-scroll as at the end of the scroll`,
        f.above != null && f.aboveEnd != null && Math.abs(f.above - f.aboveEnd) <= 1,
        `mid-scroll ${f.above}px, at end ${f.aboveEnd}px`);
    }
  }
  // ...and the walk really did judge the scrolled state, rather than passing on
  // a shelf of modals that all happened to fit. This is the number the amended
  // §4.3 checklist item is about.
  check('D13 the divider walk measured the forced-scroll state on most of its modals',
    scrolledStates >= 20, `${scrolledStates} states scrolled`);
  await page.setViewportSize({ width: 390, height: 780 });
}

// ===========================================================================
// D14. §4.6 as AMENDED — NO PAGER ON ANY REVIEW PAGE, APP-WIDE
// ---------------------------------------------------------------------------
// The rationale the amendment adds is that a Review page must be PRINTABLE, so
// this is a total sweep rather than a spot check: every quickReview activity in
// all ten chapters, asserting the absence of pagination and the presence of one
// say-all per chart that carries one.
{
  const offenders = [];
  const sayCounts = [];
  for (const [chapterId, chapter] of chapters) {
    for (const activity of chapter.quickReview || []) {
      if (!activity || !activity.id) continue;
      await go(`#/activity/${chapterId}/${activity.id}`);
      const pagers = await page.locator('.card .pg-switch, .card .pg-nav').count();
      if (pagers) offenders.push(`${chapterId}/${activity.id} (${pagers})`);
      const charts = activity.paradigms || (activity.paradigm ? [activity.paradigm] : []);
      if (charts.length > 1) {
        const wants = charts.filter(c => c.sayWhole || activity.sayWhole).length;
        const got = await page.locator('.card .pg-say-whole').count();
        const grids = await page.locator('.card .paradigm .pg-grid').count();
        sayCounts.push(`${activity.id} ${grids} charts/${got} says (want ${charts.length}/${wants})`);
        if (got !== wants || grids !== charts.length) {
          offenders.push(`${chapterId}/${activity.id} stacked ${grids}/${charts.length}, says ${got}/${wants}`);
        }
      }
    }
  }
  check('D14.1 §4.6 zero pagers on every Review page in chapters 1-10',
    offenders.length === 0, offenders.join('; '));
  check('D14.2 §4.6 every multi-chart Review page stacks all its charts, one say-all each',
    sayCounts.length >= 4, sayCounts.join('; '));
  await go('#/activity/chapt_8/c8_qr_third');
  await shot('ch8-qr-third-stacked');
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
// D15. §3.5 as AMENDED — QUALIFIED "Examples" TITLES
// ---------------------------------------------------------------------------
// New in DISCLOSURE-SPEC2. The amendment INVERTS the bare-"Examples" rule: a
// C2 accordion takes "<Qualifier> Examples" wherever a one-or-two-word
// qualifier exists, the chapter-3 pattern, even when the qualifier repeats the
// term visible in the rule above it. The 27 relabelled accordions are read off
// the shipped data and then matched against the screen, so the check cannot
// pass by agreeing with itself.
{
  const expected = [];
  for (const [chapterId, chapter] of chapters) {
    for (const activity of activitiesOf(chapter)) {
      if (!activity || !activity.id) continue;
      (function scan(node) {
        if (Array.isArray(node)) return node.forEach(scan);
        if (!node || typeof node !== 'object') return;
        if (node.type === 'expander' && /Examples$/.test(node.label || '')) {
          expected.push({ chapterId, id: activity.id, label: node.label });
        }
        for (const value of Object.values(node)) scan(value);
      })(activity);
    }
  }
  const bare = expected.filter(e => e.label === 'Examples');
  check('D15.1 §3.5 no bare "Examples" label survives in the shipped data',
    bare.length === 0, bare.map(b => `${b.chapterId}/${b.id}`).join(', '));
  // ...and every qualified label actually reaches the screen as plain text.
  const byActivity = new Map();
  for (const e of expected) {
    const key = `${e.chapterId}/${e.id}`;
    byActivity.set(key, [...(byActivity.get(key) || []), e.label]);
  }
  const missing = [];
  for (const [key, labels] of byActivity) {
    const [chapterId, id] = key.split('/');
    await go(`#/activity/${chapterId}/${id}`);
    const chapter = chapters.get(chapterId);
    const activity = activitiesOf(chapter).find(a => a && a.id === id);
    const topics = (activity.topics || []).length || 1;
    const seen = new Set();
    for (let topic = 0; topic < topics; topic++) {
      if (topic) await gotoTopic(1);
      for (const text of await page.locator('details.rc-expander summary').allInnerTexts()) {
        seen.add(text.replace(/\s+/g, ' ').trim());
      }
    }
    for (const label of labels) if (!seen.has(label)) missing.push(`${key} "${label}"`);
  }
  check(`D15.2 §3.5 all ${expected.length} qualified "Examples" labels render as authored`,
    missing.length === 0, missing.join(', '));
  // §3.5's Greek clause: a Greek word inside an accordion TITLE is a control
  // label like an option button, NOT an audio tap. It must not be blue and must
  // not carry a handler — the whole point of stating it was that ch7's three
  // titles now contain Greek.
  await go('#/activity/chapt_7/c7_learn_eimi');
  await gotoTopic(3);
  const greekTitles = await page.locator('details.rc-expander summary').evaluateAll(nodes =>
    nodes.map(n => ({
      text: n.textContent.trim(),
      color: getComputedStyle(n).color,
      taps: n.querySelectorAll('button, .greek-tap').length
    })));
  check('D15.3 §3.5 the ch7 Greek-qualified titles are control labels: green, no tap target inside',
    greekTitles.length === 3
      && greekTitles.every(t => t.color === GREEN && t.taps === 0)
      && greekTitles.map(t => t.text).join('|') === 'οὐ Examples|οὐκ Examples|οὐχ Examples',
    JSON.stringify(greekTitles));
  await shot('ch7-greek-qualified-labels');
}

// ===========================================================================
// D16. §3.2 as AMENDED — GREEN UNDERLINE IS EXCLUSIVE TO TAPPABLE ELEMENTS
// ---------------------------------------------------------------------------
// New in DISCLOSURE-SPEC3 (W5.2). The amendment is app-wide and admits no
// ratified exception, so this is a total sweep rather than a spot check on the
// chapter-8 Number chart that produced it: every activity in all ten chapters,
// every topic, with every accordion OPENED so bodies are judged too, looking
// for anything that computes green AND underlined and is not genuinely
// tappable.
//
// "Tappable" is read from the DOM, not from a class list: a link, a button, a
// summary, or something carrying role="button" — an ancestor chain walk, so a
// green underlined <span> inside a button counts as tappable and a green
// underlined <u> inside a gloss does not.
//
// This is the check that makes the three-selector rule in app.css safe. That
// rule fixes the three hosts the audit found; this is what stops a fourth from
// arriving quietly, and it names the offender in its own failure text.
{
  const SWEEP = () => {
    const GREEN = 'rgb(31, 95, 87)';
    const tappable = el => {
      for (let n = el; n && n.tagName !== 'BODY'; n = n.parentElement) {
        if (n.tagName === 'A' || n.tagName === 'BUTTON' || n.tagName === 'SUMMARY') return true;
        if (n.getAttribute && n.getAttribute('role') === 'button') return true;
      }
      return false;
    };
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      if (!el.textContent || !el.textContent.trim()) continue;
      // Judge the element that OWNS the text, not every ancestor above it.
      if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
      const style = getComputedStyle(el);
      if (style.color !== GREEN) continue;
      if (!/underline/.test(style.textDecorationLine)) continue;
      if (tappable(el)) continue;
      out.push(`${el.tagName}.${el.className || '(no class)'} "${el.textContent.trim().slice(0, 28)}"`);
    }
    return out;
  };
  const offenders = [];
  let scanned = 0;
  for (const [chapterId, chapter] of chapters) {
    for (const activity of activitiesOf(chapter)) {
      if (!activity || !activity.id) continue;
      await go(`#/activity/${chapterId}/${activity.id}`);
      const topics = (activity.topics || []).length || 1;
      for (let topic = 0; topic < topics; topic++) {
        if (topic) await gotoTopic(1);
        // A closed accordion hides its body from getComputedStyle entirely, so
        // an offender inside one would be invisible to this sweep.
        await page.locator('details.rc-expander summary').evaluateAll(nodes => nodes.forEach(n => n.click()));
        await page.waitForTimeout(40);
        scanned += 1;
        for (const hit of await page.evaluate(SWEEP)) {
          offenders.push(`${chapterId}/${activity.id} topic ${topic + 1}: ${hit}`);
        }
      }
    }
  }
  check(`D16.1 §3.2 nothing non-tappable renders green AND underlined, across ${scanned} screens`,
    offenders.length === 0, offenders.slice(0, 8).join(' | '));
  // ...and the sweep found enough screens to mean anything.
  check('D16.2 §3.2 the exclusivity sweep actually walked the app', scanned >= 200, `${scanned} screens`);
  // The found case, named: the ch8 Number chart's headers render PLAIN. Asserted
  // separately from the sweep because "no green underline" would also be
  // satisfied by the headers disappearing.
  await go('#/activity/chapt_8/c8_learn_english_concepts');
  await gotoTopic(3);
  const headers = await page.locator('.rc-greekrows .rc-greekhead span').evaluateAll(nodes =>
    nodes.filter(n => n.textContent.trim()).map(n => ({
      text: n.textContent.trim(), decoration: getComputedStyle(n).textDecorationLine })));
  check('D16.3 W5.1 the ch8 Number chart still prints its four headers, none of them underlined',
    headers.length === 4
      && headers.map(h => h.text).join(' ') === 'Singular Plural Singular Plural'
      && headers.every(h => h.decoration === 'none'),
    JSON.stringify(headers));
  await shot('ch8-number-headers-plain');
}

// ===========================================================================
// D17. §3.2 as AMENDED — TITLE LINKS ARE IN-TEXT LINKS
// ---------------------------------------------------------------------------
// New in DISCLOSURE-SPEC3 (W6). `.topic-title-link` restated `color: var(--link)`
// on top of the .popup-link it already carried, so chapter 9's Deponent Verbs
// heading opened its popup in BLUE three lines above a green one that opened
// another (review item 7). No rule ever ratified that: §3.3 gives blue to
// in-chart triggers and to Greek audio taps, and to nothing else.
//
// Driven off the DATA, so a `titleLink` added to any chapter is covered without
// an edit here.
{
  const titleLinks = [];
  for (const [chapterId, chapter] of chapters) {
    for (const activity of activitiesOf(chapter)) {
      for (const topic of (activity && activity.topics) || []) {
        if (topic && topic.titleLink) titleLinks.push([chapterId, activity.id, topic.title]);
      }
    }
  }
  check('D17.1 W6 the titleLink sweep found the authored title links', titleLinks.length >= 1,
    titleLinks.map(t => `${t[0]}/${t[1]}`).join(', '));
  for (const [chapterId, activityId, title] of titleLinks) {
    await go(`#/activity/${chapterId}/${activityId}`);
    const activity = activitiesOf(chapters.get(chapterId)).find(a => a && a.id === activityId);
    const topics = (activity.topics || []).length;
    let found = null;
    for (let topic = 0; topic < topics; topic++) {
      if (topic) await gotoTopic(1);
      if (await page.locator('.topic-title-link').count()) {
        found = await page.locator('.topic-title-link').evaluate(node => {
          const style = getComputedStyle(node);
          return { text: node.textContent.trim(), color: style.color,
            decoration: style.textDecorationLine, cursor: style.cursor, tag: node.tagName };
        });
        break;
      }
    }
    check(`D17.2 W6 ${chapterId} "${title}" title link is GREEN, underlined and tappable`,
      !!found && found.color === GREEN && /underline/.test(found.decoration)
        && found.tag === 'BUTTON' && found.cursor === 'pointer',
      JSON.stringify(found));
    // And it still does its job.
    await page.locator('.topic-title-link').click();
    await page.waitForTimeout(250);
    check(`D17.3 W6 ${chapterId} "${title}" title link still opens its popup`,
      await page.locator('.popup-sheet, .modal-overlay').count() > 0);
    // The IN-TEXT links on the same screen are the comparison the review made.
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    const inText = await page.locator('.rich .popup-link').evaluateAll(nodes => nodes.map(n => {
      const style = getComputedStyle(n);
      return { text: n.textContent.trim().slice(0, 20), color: style.color, decoration: style.textDecorationLine };
    }));
    check(`D17.4 W6 ${chapterId} the title link and the in-text links on that screen now match`,
      inText.length > 0 && inText.every(l => l.color === GREEN && /underline/.test(l.decoration)),
      JSON.stringify(inText));
    await shot(`${chapterId}-title-link-green`);
  }
  // The counter-case, in the same breath: §3.3's in-chart triggers stay blue,
  // so "everything is green now" cannot pass this file.
  await go('#/activity/chapt_6/c6_learn_prepositions');
  await gotoTopic(1);
  check('D17.5 §3.3 in-chart triggers are still BLUE (the conversion did not overreach)',
    await page.locator('.rc-sense-link').first().evaluate(n => getComputedStyle(n).color) === BLUE);
}

// ===========================================================================
// D18. §4.7 THE HAND CURSOR — ch7's three negative forms all tap
// ---------------------------------------------------------------------------
// New in DISCLOSURE-SPEC3 (W1, chapt-07.json). The original shows a hand cursor
// over οὐ, οὐκ AND οὐχ in the three rule lines; the port had a tap on οὐ only,
// because οὐ is a lexicon lemma and the other two are inflected forms in no
// source the tap map reads. The delivered `audioMap` wires them.
//
// The check is deliberately about the RULE LINES, not the accordions: the clips
// always played from the accordion headwords, so an assertion that found the
// audio anywhere on the page would have passed before the fix too.
{
  await go('#/activity/chapt_7/c7_learn_eimi');
  await gotoTopic(3);
  const ruleTaps = await page.locator('.rc-list > li').evaluateAll(nodes => nodes.map(node => {
    // Only the rule line itself — not the accordion hanging under it.
    const accordion = node.querySelector('details.rc-expander');
    const taps = [...node.querySelectorAll('.greek-tap')]
      .filter(tap => !accordion || !accordion.contains(tap));
    return taps.map(tap => ({ text: tap.textContent.trim(), cursor: getComputedStyle(tap).cursor }));
  }));
  check('D18.1 §4.7 all three ch7 rule lines carry a tap: οὐ, οὐκ and οὐχ',
    ruleTaps.length === 3 && ruleTaps.every(line => line.length === 1)
      && ruleTaps.map(line => line[0].text).join(' ') === 'οὐ οὐκ οὐχ',
    JSON.stringify(ruleTaps));
  check('D18.2 §4.7 and each shows the hand cursor that marks clickable content',
    ruleTaps.every(line => line.every(tap => tap.cursor === 'pointer')));
  // Directive 9's other half: they PLAY, and each plays its own clip.
  const played = [];
  for (let index = 0; index < 3; index++) {
    await resetClips();
    await page.locator('.rc-list > li').nth(index).locator('.greek-tap').first().click();
    await page.waitForTimeout(400);
    played.push(await page.evaluate(() => window.__clips.map(c => c.src).join('')));
  }
  check('D18.3 §4.7 each of the three plays a clip, and no two play the same one',
    played.every(Boolean) && new Set(played).size === 3, played.length + ' clips');
  await shot('ch7-three-negative-taps');
}

// ===========================================================================
// D19. W4 — THE MODAL HEIGHT CANNOT GO STALE
// ---------------------------------------------------------------------------
// The half-screen modal bug (Verify item 3). `--modal-vh` was published once at
// startup and re-measured only on resize/orientationchange; a height snapshotted
// while the SOFTWARE KEYBOARD was up survives a backgrounding on an iOS PWA,
// because those drop resize on resume, and every modal opened afterwards is
// sized to a keyboard that is no longer there. Kill-and-restart re-measures,
// which is exactly the reported cure.
//
// WHAT THIS CAN AND CANNOT SETTLE (W4.4). It cannot prove the bug fixed: the
// trigger is a real iOS resume and this is Chromium. What it CAN do, and does,
// is prove the two defences work on their own terms — the clamp rejects a
// phantom height, honours a real one, and a modal opening after a SILENT height
// change is sized correctly anyway. The fix stays a device-soak item in VERIFY.
//
// `visualViewport` is replaced with a controllable stand-in installed before the
// app boots, so lib/viewport.js captures it exactly as it would the real one.
// Nothing in src/ knows this is happening.
{
  const clampPage = await context.newPage();
  await clampPage.addInitScript(() => {
    const listeners = new Set();
    const fake = {
      height: window.innerHeight, width: window.innerWidth, offsetTop: 0, offsetLeft: 0, scale: 1,
      addEventListener: (type, fn) => { if (type === 'resize') listeners.add(fn); },
      removeEventListener: (type, fn) => listeners.delete(fn)
    };
    Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => fake });
    window.__vv = {
      // The keyboard coming up, announced: a resize event, as every engine that
      // works sends one.
      set(height) { fake.height = height; for (const fn of listeners) fn(); },
      // The iOS resume: the height CHANGES and no event is delivered.
      setSilently(height) { fake.height = height; }
    };
  });
  await clampPage.goto(`${BASE}/?clamp=1#/activity/chapt_3/c3_drill_verb_translating`, { waitUntil: 'load' });
  await clampPage.waitForSelector('.card', { timeout: 15000 });
  await clampPage.waitForTimeout(200);
  const modalVh = async () => clampPage.evaluate(() =>
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--modal-vh')));
  const inner = await clampPage.evaluate(() => window.innerHeight);
  const PHANTOM = Math.round(inner * 0.49);          // a keyboard's worth, well under the 0.6 floor
  const REAL_SHORT = Math.round(inner * 0.85);       // toolbars: legitimately short, above the floor

  // 1. THE KEYBOARD IS REALLY UP: an editable is focused, so the short height
  //    is honoured. The clamp must not fight a genuine keyboard.
  await clampPage.evaluate(([height]) => {
    const input = document.createElement('input');
    input.id = '__clamp_probe';
    document.body.appendChild(input);
    input.focus();
    window.__vv.set(height);
  }, [PHANTOM]);
  await clampPage.waitForTimeout(150);
  check('D19.1 W4.2 a short height WITH an editable focused is honoured (a real keyboard is not clamped)',
    Math.round(await modalVh()) === PHANTOM, `${await modalVh()} vs ${PHANTOM}`);

  // 2. THE PHANTOM: the same height, nothing focused. This is the state the
  //    app wakes up in after a resume, and it is what sized the half-screen
  //    modal. innerHeight is published instead.
  await clampPage.evaluate(() => {
    document.getElementById('__clamp_probe').blur();
    document.getElementById('__clamp_probe').remove();
    window.__vv.set(window.innerHeight * 0.49);
  });
  await clampPage.waitForTimeout(150);
  check('D19.2 W4.2 the clamp REJECTS a phantom height (short, with nothing focused)',
    Math.round(await modalVh()) === inner, `${await modalVh()} vs innerHeight ${inner}`);

  // 3. AND ONLY A PHANTOM. A legitimately short viewport — browser toolbars,
  //    which is the whole reason this file exists — is published untouched.
  await clampPage.evaluate(height => window.__vv.set(height), REAL_SHORT);
  await clampPage.waitForTimeout(150);
  check('D19.3 W4.2 a legitimately short viewport (toolbars) is NOT clamped',
    Math.round(await modalVh()) === REAL_SHORT, `${await modalVh()} vs ${REAL_SHORT}`);

  // 4. THE DROPPED-RESIZE CASE, with the clamp deliberately out of reach: the
  //    height GROWS silently, which no clamp can catch because a too-SMALL
  //    published value is the only thing a clamp can see. Only the measurement
  //    taken when the modal opens catches this one, and it is the reason W4.1
  //    asks for one.
  const stale = Math.round(await modalVh());
  await clampPage.evaluate(() => window.__vv.setSilently(window.innerHeight));
  await clampPage.waitForTimeout(150);
  check('D19.4 W4.1 a silent height change leaves the published value stale (the bug\'s own shape)',
    Math.round(await modalVh()) === stale, `${await modalVh()}`);
  await clampPage.getByRole('button', { name: 'Hint', exact: true }).click();
  await clampPage.waitForSelector('.modal', { timeout: 8000 });
  await clampPage.waitForTimeout(150);
  const overlay = await clampPage.locator('.modal-overlay').evaluate(node =>
    Math.round(node.getBoundingClientRect().height));
  check('D19.5 W4.1 OPENING A MODAL re-measures, and the dialog is sized to the real viewport',
    Math.round(await modalVh()) === inner && overlay === inner,
    `--modal-vh ${await modalVh()}, overlay ${overlay}px, innerHeight ${inner}, was ${stale}`);
  await clampPage.close();
}

// ===========================================================================
// D20. §4.7 HINT-MODAL SOURCE FIDELITY — the ch5 First Declension hint
// ---------------------------------------------------------------------------
// New in the DISCLOSURE-SPEC3 W8 addendum, once ch5railwalk.pdf arrived.
//
// "A drill hint is transcribed from its OWN original screen, never assumed
// identical to the Learn chart it resembles — the original hint may print rows
// the Learn chart merges." Chapter 5 is the found case, and it is the case
// worth pinning permanently: the two charts LOOK like the same chart, which is
// exactly why the port collapsed them in the first place, and a future round
// tidying "duplicate" data could collapse them again.
//
// So this asserts BOTH halves at once. Either alone would be satisfiable by the
// wrong answer: five rows everywhere, or four rows everywhere.
{
  // ch5railwalk.pdf p10 (First Declension Noun Drill -> Hint) and p11
  // (Declining Noun Drill -> Hint) print this table, and print nothing else —
  // no title, no lemma line, no Meanings control, no Say button, only Cancel.
  const HINT_ROWS = [
    ['Nom.', 'γραφή', 'a writing', 'γραφαί', 'writings (subject of sentence)'],
    ['Gen.', 'γραφῆς', 'of a writing', 'γραφῶν', 'of writings (possessive)'],
    ['Dat.', 'γραφῇ', 'to a writing', 'γραφαῖς', 'to writings (indirect obj)'],
    ['Acc.', 'γραφήν', 'a writing', 'γραφάς', 'writings (direct obj)'],
    ['Voc.', 'γραφή', 'writing', 'γραφαί', 'writings (direct address)']
  ];
  const readHint = () => page.locator('.modal').last().evaluate(modal => ({
    title: modal.querySelector('.pg-title') ? modal.querySelector('.pg-title').textContent.trim() : null,
    lemma: !!modal.querySelector('.pg-lemma'),
    meanings: !!modal.querySelector('[data-paradigm-meanings]'),
    say: !!modal.querySelector('.pg-say-whole'),
    columns: [...modal.querySelectorAll('.pg-head .pg-column')].map(n => n.textContent.trim()),
    taps: modal.querySelectorAll('.pg-greek-tap:not([disabled])').length,
    rows: [...modal.querySelectorAll('.pg-row')].map(row => [
      row.querySelector('.pg-row-label').textContent.trim(),
      ...[...row.querySelectorAll('.pg-cell')].flatMap(cell => [
        cell.querySelector('.pg-greek').textContent.trim(),
        cell.querySelector('.pg-gloss') ? cell.querySelector('.pg-gloss').textContent.trim() : null
      ])
    ])
  }));
  for (const [label, activityId] of [
    ['First Declension Noun Drill', 'c5_drill_first_decl_noun'],
    ['Declining Noun Drill', 'c5_drill_declining']
  ]) {
    await go(`#/activity/chapt_5/${activityId}`);
    await openHint();
    const hint = await readHint();
    check(`D20.1 §4.7 ch5 ${label} Hint prints FIVE rows, Nom. and Voc. SEPARATE, as its own screen does`,
      JSON.stringify(hint.rows) === JSON.stringify(HINT_ROWS), JSON.stringify(hint.rows));
    check(`D20.2 §4.7 ch5 ${label} Hint is that screen and not the Learn chart: no title, no lemma, no Meanings, no Say`,
      hint.title === null && !hint.lemma && !hint.meanings && !hint.say
        && hint.columns.join('|') === 'Singular|Plural',
      JSON.stringify({ title: hint.title, lemma: hint.lemma, meanings: hint.meanings,
        say: hint.say, columns: hint.columns }));
    // Directive 9 on the rows the port did not have before: the Vocative forms
    // are new cells and they are live taps like every other form on screen.
    check(`D20.3 ch5 ${label} Hint: all ten cells are live taps`, hint.taps === 10, `${hint.taps} live`);
    await resetClips();
    await page.locator('.modal .pg-greek-tap').nth(8).click();
    await page.waitForTimeout(400);
    check(`D20.4 ch5 ${label} Hint: the VOCATIVE cell plays its clip`, await started() === 1);
  }
  await shot('ch5-first-declension-hint-uncollapsed');

  // THE OTHER HALF. The Learn page's chart merges Nom. and Voc. because ITS
  // screen does (ch5railwalk.pdf p7), and this round must not have "fixed" it.
  await go('#/activity/chapt_5/c5_learn_nouns');
  await gotoTopic(4);
  const learn = await page.locator('.card').evaluate(card => {
    // Scoped outside the Meanings block: that is a SECOND chart inside the same
    // card, with five rows and a title of its own, and counting it as the
    // chart's is the very conflation §4.7 is about.
    const meanings = card.querySelector('[data-paradigm-meanings]');
    const own = selector => [...card.querySelectorAll(selector)]
      .filter(node => !meanings || !meanings.contains(node));
    return {
      // The heading may be the TOPIC's rather than the chart's: the two say the
      // same thing here, so 5E-R1 prints one of them. Either element counts.
      title: (own('.topic-heading, .rc-heading, .pg-title')[0] || {}).textContent.trim(),
      lemma: own('.pg-lemma').length > 0,
      meanings: !!meanings,
      say: own('.pg-say-whole').length > 0,
      rows: own('.pg-grid .pg-row').map(row => row.querySelector('.pg-row-label').textContent.trim()),
      meaningsRows: meanings ? meanings.querySelectorAll('.pg-row').length : 0,
      meaningsLegend: meanings ? meanings.querySelectorAll('.pg-legend, .pg-legend-row').length : 0
    };
  });
  check('D20.5 §4.7 the ch5 LEARN chart is UNCHANGED: four rows, Nom.\\Voc. still merged',
    learn.rows.join(' ') === 'Nom.\\Voc. Gen. Dat. Acc.', learn.rows.join(' '));
  check('D20.6 §4.7 ...and it keeps the furniture the hint does not have: title, lemma, Meanings, Say Whole List',
    learn.title === 'First Declension—Eta' && learn.lemma && learn.meanings && learn.say,
    JSON.stringify(learn));
  check('D20.7 §4.7 the Learn page\'s Meanings popup still prints five rows AND its legend',
    learn.meaningsRows === 5 && learn.meaningsLegend >= 5,
    `${learn.meaningsRows} rows, ${learn.meaningsLegend} legend lines`);
  await shot('ch5-learn-chart-still-merged');
}

// ===========================================================================
await browser.close();
const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} disclosure checks passed.`);
if (failed.length) {
  for (const f of failed) console.log(`  FAIL ${f.name}${f.detail ? ` — ${f.detail}` : ''}`);
  process.exit(1);
}
