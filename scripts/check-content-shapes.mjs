// Build-time assertion for the content SHAPES the renderers depend on
// (5B-SPEC2 B6). The chapter-2 bibliography once shipped object-form entries
// and rendered "[object Object]" five times over on device: valid JSON, valid
// block type, silently garbled output. A shape that can only fail visually
// gets a loud check here instead. Run from `npm run verify`.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ADVANCE_CLASSES as TIMING_CLASSES, WITHDRAWN_CLASSES as TIMING_WITHDRAWN } from '../src/lib/timing.js';

const DATA = 'src/data';
const problems = [];

// Every block type RichContent.svelte dispatches on. A data file that ships a
// type not in this list renders as a loud placeholder at runtime; here it fails
// the build, which is where a new pipeline block type should be noticed
// (5B-SPEC3 D4). Add the type here in the same change that adds its branch.
const BLOCK_TYPES = new Set([
  'heading', 'subheading', 'para', 'numbered', 'defList',
  'biblist', 'refs', 'note', 'greekRows', 'expander', 'paradigm',
  // 5F: chapter 6's preposition DIAGRAM.
  'prepositionsChart'
  // 'pronounParadigm' (chapter 8's free-text pronoun-row shape) was RETIRED
  // in the 5F-FEEDBACK.pdf patch round: every pronoun paradigm now ships as a
  // standard `paradigm` block with real cells and real per-cell audio, which
  // is what fixed the untransliterated-Latin defect (§8.1) at the root —
  // there is no longer a text-splitting step to fail. Deliberately absent
  // from this set, not merely unused: a stray 'pronounParadigm' block in a
  // future data drop should fail the BUILD, not silently degrade.
]);
// "type" is also the ACTIVITY discriminator, so the activity types are listed
// here as the known non-block use of the key. Anything else carrying a "type"
// is a content block and must have a renderer.
const ACTIVITY_TYPES = new Set(['contentAudio', 'select', 'spell', 'divide', 'placeAccent', 'spellVerse']);
// contentAudio dispatches on `mode`; a mode with no branch in
// ContentAudio.svelte falls through to the generic chart and renders a grid of
// nothing, which is exactly the kind of failure that only shows up on device.
// The four advance classes come from the RENDERER's own list (src/lib/timing.js
// has no imports, so this script stays dependency-free by importing it). A
// second hand-written copy here is exactly how the data and the renderer would
// drift apart while both looked right. The ledger stamper keeps a third copy
// only because it is Python and cannot read this one.
const ADVANCE_CLASSES = new Set(TIMING_CLASSES);
// 5E-SPEC3 §1: the two classes that existed only to wait for Next on a CORRECT
// answer are withdrawn. timing.js still normalizes them at runtime so a stale
// cached data file behaves correctly, which is exactly why the BUILD has to
// refuse them — otherwise a withdrawn name could sit in shipped data forever,
// silently working, and nobody would learn it was wrong.
const WITHDRAWN = new Map(Object.entries(TIMING_WITHDRAWN));
// The five audio timings (rules A1/A8). The renderer branches on these by name
// rather than exporting a list, so this is the one place they are enumerated.
const AUDIO_TIMINGS = new Set(['beforeGuess', 'afterGuess', 'afterTap', 'afterCheck', 'none']);
const CONTENT_MODES = new Set([
  'chart', 'exploreGrid', 'stepper', 'textPage', 'objectivesPage', 'flashcard',
  'selfCheckStepper', 'selfCheckSequence', 'equationChart', 'vowelStair',
  'diphthongRows', 'reviewVocab', 'reviewLetters', 'topicPages',
  'paradigmChart', 'interlinearVerse'
]);

// walk every nested block array a chapter can carry (content, topics[].content,
// expander.content, hint.content, ...) without hard-coding the nesting.
function walk(node, path, visit) {
  if (Array.isArray(node)) {
    node.forEach((child, index) => walk(child, `${path}[${index}]`, visit));
    return;
  }
  if (!node || typeof node !== 'object') return;
  visit(node, path);
  for (const [key, value] of Object.entries(node)) walk(value, `${path}.${key}`, visit);
}

// Paradigms may be a single chart (chapter 3 and the simple chapter 4/5
// charts) or a wrapper carrying charts[] (chapter 4/5 switches). Validate the
// same table contract in both forms, including the Meanings table nested under
// a noun chart. Keeping this normalization here prevents a charts[] wrapper
// from being mistaken for a columnless chart while still checking every
// concrete chart it contains.
function validateParadigmTable(table, path, { allowExtras = true } = {}) {
  if (!table || typeof table !== 'object' || Array.isArray(table)) {
    problems.push(`${path}: paradigm table is not an object.`);
    return;
  }

  const columns = Array.isArray(table.columns) ? table.columns : [];
  if (!columns.length) problems.push(`${path}: paradigm has no columns.`);

  const rows = Array.isArray(table.rows) ? table.rows : [];
  if (!rows.length) problems.push(`${path}: paradigm has no rows.`);
  const labelled = rows.some(row => row && String(row.label ?? row.person ?? '').trim());
  rows.forEach((row, index) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      problems.push(`${path}.rows[${index}]: paradigm row is not an object.`);
      return;
    }
    // A row label is REQUIRED only where the chart has them. Chapter 7's εἰμί
    // paradigm has none — its three rows are first, second and third person
    // and the original prints no case column at all — so "some rows are
    // labelled and some are not" is the real defect, not "no row is labelled".
    if (labelled && !String(row.label ?? row.person ?? '').trim()) {
      problems.push(`${path}.rows[${index}]: paradigm row has no label or person while its siblings do.`);
    }
    if (!Array.isArray(row.cells) || row.cells.length !== columns.length) {
      problems.push(`${path}.rows[${index}]: paradigm row has ${(row.cells || []).length} cells, expected ${columns.length}.`);
    }
  });

  if (table.columnAudio != null) {
    if (!Array.isArray(table.columnAudio) || table.columnAudio.length !== columns.length) {
      problems.push(`${path}.columnAudio: expected ${columns.length} entries, got ${Array.isArray(table.columnAudio) ? table.columnAudio.length : 'a non-array'}.`);
    } else {
      table.columnAudio.forEach((audio, index) => {
        if (typeof audio !== 'string' || !audio.trim()) {
          problems.push(`${path}.columnAudio[${index}]: expected a non-empty audio id.`);
        }
      });
    }
  }

  if (table.columnGroups != null) {
    if (!Array.isArray(table.columnGroups) || !table.columnGroups.length) {
      problems.push(`${path}.columnGroups: expected a non-empty array.`);
    } else {
      let spanTotal = 0;
      table.columnGroups.forEach((group, index) => {
        if (!group || typeof group !== 'object' || Array.isArray(group)) {
          problems.push(`${path}.columnGroups[${index}]: expected an object.`);
          return;
        }
        if (typeof group.label !== 'string' || !group.label.trim()) {
          problems.push(`${path}.columnGroups[${index}].label: expected a non-empty string.`);
        }
        if (!Number.isInteger(group.span) || group.span < 1) {
          problems.push(`${path}.columnGroups[${index}].span: expected a positive integer.`);
        } else {
          spanTotal += group.span;
        }
      });
      if (spanTotal !== columns.length) {
        problems.push(`${path}.columnGroups: spans total ${spanTotal}, expected ${columns.length} columns.`);
      }
    }
  }

  if (table.sayWholeEach != null) {
    if (!Array.isArray(table.sayWholeEach) || !table.sayWholeEach.length) {
      problems.push(`${path}.sayWholeEach: expected a non-empty array.`);
    } else {
      table.sayWholeEach.forEach((action, index) => {
        if (!action || typeof action !== 'object' || Array.isArray(action)
            || typeof action.audio !== 'string' || !action.audio.trim()) {
          problems.push(`${path}.sayWholeEach[${index}]: expected an action with a non-empty audio id.`);
        }
      });
      if (!Array.isArray(table.columnGroups)) {
        problems.push(`${path}.sayWholeEach: columnGroups are required to align the actions.`);
      } else if (table.sayWholeEach.length !== table.columnGroups.length) {
        problems.push(`${path}.sayWholeEach: has ${table.sayWholeEach.length} actions, expected ${table.columnGroups.length} to match columnGroups.`);
      }
    }
  }

  if (table.note != null && (typeof table.note !== 'string' || !table.note.trim())) {
    problems.push(`${path}.note: expected a non-empty string.`);
  }

  if (allowExtras && table.endings) {
    (table.endings.rows || []).forEach((row, index) => {
      if (!Array.isArray(row) || row.length !== columns.length * 2) {
        problems.push(`${path}.endings.rows[${index}]: expected ${columns.length * 2} entries (ending + gloss per column).`);
      }
    });
  }
}

function validateMeanings(meanings, path) {
  validateParadigmTable(meanings, path, { allowExtras: false });
  if (!meanings || typeof meanings !== 'object' || Array.isArray(meanings)) return;
  if (meanings.legend != null) {
    if (!Array.isArray(meanings.legend) || !meanings.legend.length) {
      problems.push(`${path}.legend: expected a non-empty array.`);
    } else {
      meanings.legend.forEach((entry, index) => {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)
            || typeof entry.label !== 'string' || !entry.label.trim()
            || typeof entry.text !== 'string' || !entry.text.trim()) {
          problems.push(`${path}.legend[${index}]: expected non-empty label and text strings.`);
        }
      });
    }
  }
  if (meanings.closing != null && (typeof meanings.closing !== 'string' || !meanings.closing.trim())) {
    problems.push(`${path}.closing: expected a non-empty string.`);
  }
}

function validateParadigm(paradigm, path) {
  if (!paradigm || typeof paradigm !== 'object' || Array.isArray(paradigm)) {
    problems.push(`${path}: paradigm is not an object.`);
    return;
  }

  if (paradigm.charts != null) {
    if (!Array.isArray(paradigm.charts) || paradigm.charts.length < 2) {
      problems.push(`${path}.charts: expected at least two charts.`);
      return;
    }
    if (!['moreBack', 'named'].includes(paradigm.switch)) {
      problems.push(`${path}.switch: expected "moreBack" or "named" for charts[].`);
    }
    const names = new Set();
    paradigm.charts.forEach((chart, index) => {
      const chartPath = `${path}.charts[${index}]`;
      if (!chart || typeof chart !== 'object' || Array.isArray(chart)) {
        problems.push(`${chartPath}: expected a chart object.`);
        return;
      }
      if (typeof chart.name !== 'string' || !chart.name.trim()) {
        problems.push(`${chartPath}.name: expected a non-empty chart name.`);
      } else if (names.has(chart.name)) {
        problems.push(`${chartPath}.name: duplicate chart name "${chart.name}".`);
      } else {
        names.add(chart.name);
      }
      validateParadigmTable(chart, chartPath);
      if (chart.meanings != null) validateMeanings(chart.meanings, `${chartPath}.meanings`);
    });
    return;
  }

  if (paradigm.switch != null) {
    problems.push(`${path}.switch: only valid with charts[].`);
  }
  validateParadigmTable(paradigm, path);
  if (paradigm.meanings != null) validateMeanings(paradigm.meanings, `${path}.meanings`);
}

const files = readdirSync(DATA).filter(name => /^chapt-\d+\.json$/.test(name));
if (!files.length) {
  console.error('FAIL: no chapter data files found under src/data.');
  process.exit(1);
}

for (const file of files) {
  const data = JSON.parse(readFileSync(join(DATA, file), 'utf8'));
  walk(data, file, (block, path) => {
    if (typeof block.type === 'string' && !ACTIVITY_TYPES.has(block.type) && !BLOCK_TYPES.has(block.type)) {
      problems.push(`${path}: content block type "${block.type}" has no RichContent branch.`);
    }
    if (block.type === 'biblist') {
      if (!Array.isArray(block.items) || !block.items.length) {
        problems.push(`${path}: biblist has no items array.`);
        return;
      }
      block.items.forEach((entry, index) => {
        if (typeof entry !== 'string') {
          problems.push(`${path}.items[${index}]: biblist entry is ${entry === null ? 'null' : typeof entry}, expected a string.`);
        }
      });
    }
    // A numbered item renders as an <li>: either a bare string, or an object
    // carrying a label and/or text. Anything else prints the number over an
    // EMPTY line — which is exactly how chapter 3's Voice/Mood/Person/
    // Translation lists shipped in 5D (string items against a renderer that
    // only read it.text). Silent, unerrored, and invisible to a rail walk that
    // only asks "did a card render", so it gets a build-time check.
    if (block.type === 'numbered') {
      if (!Array.isArray(block.items) || !block.items.length) {
        problems.push(`${path}: numbered has no items array.`);
        return;
      }
      block.items.forEach((entry, index) => {
        const empty = typeof entry === 'string'
          ? !entry.trim()
          : !entry || typeof entry !== 'object' || (!String(entry.label || '').trim() && !String(entry.text || '').trim());
        if (empty) {
          problems.push(`${path}.items[${index}]: numbered item renders nothing (no string, label or text).`);
        }
      });
    }
    // 5F-FEEDBACK.pdf items 5/6/7/13 (Nathanael, 2026-08-09): a teaching point
    // hand-numbered into a PLAIN para's own text ("1) Attributive adjectives
    // have...") renders as ordinary prose -- the marker never enters the
    // hanging-indent system a real `numbered` block gives for free, so a
    // multi-line item wraps flush left instead of under its own text. This
    // shipped once (chapter 7's Adjective Translation Drill hint) and passed
    // visual verification because the FIRST line of a short item looks
    // identical either way; only a wrapped line exposes it. Catch it at the
    // source instead of relying on a screenshot to catch the wrap.
    if (block.type === 'para' && typeof block.text === 'string' && /^\s*\(?\d{1,2}[.)]\s/.test(block.text)) {
      problems.push(`${path}: para text starts with a hand-authored number ("${block.text.slice(0, 24)}...") — use a numbered block instead so wrapped lines hang under their own text.`);
    }
    // Every contentAudio mode must have a branch in ContentAudio.svelte; an
    // unknown one silently falls through to the generic chart layout.
    if (block.type === 'contentAudio' && block.mode && !CONTENT_MODES.has(block.mode)) {
      problems.push(`${path}: contentAudio mode "${block.mode}" has no ContentAudio branch.`);
    }
    // A paradigm chart's rows must line up with its declared columns, or cells
    // land under the wrong number heading. Chapter 4/5 may wrap multiple full
    // charts in charts[]; validate each chart and each nested Meanings table.
    if (block.type === 'paradigm' || (block.paradigm && block.mode === 'paradigmChart')) {
      const own = block.type === 'paradigm';
      validateParadigm(own ? block : block.paradigm, own ? path : `${path}.paradigm`);
    }
    // 5F: a paradigmChart may ship SEVERAL charts as paradigms[] (chapter 8's
    // third person, reached by More/Back). Validate each.
    if (block.mode === 'paradigmChart' && Array.isArray(block.paradigms)) {
      if (!block.paradigms.length) problems.push(`${path}.paradigms: expected at least one chart.`);
      block.paradigms.forEach((chart, index) => validateParadigm(chart, `${path}.paradigms[${index}]`));
      // 5F-FEEDBACK.pdf item 8/9 aftermath: a paradigms[] stack of more than
      // one page is a More/Back sequence, and Paradigm.svelte stamps each
      // page's own `name` onto data-chart-name for the harness (and anyone
      // else) to read which chart is on screen. c8_qr_third shipped its three
      // pages with `subtitle` set ("Masculine"/"Feminine"/"Neuter") but no
      // `name`, so the attribute rendered empty and the behavior harness could
      // not tell which chart it was looking at -- caught by ui-behavior.mjs
      // §2.8, not by this build-time check, because nothing here had asked.
      if (block.paradigms.length > 1) {
        block.paradigms.forEach((chart, index) => {
          if (!chart || typeof chart.name !== 'string' || !chart.name.trim()) {
            problems.push(`${path}.paradigms[${index}].name: expected a non-empty chart name (a paradigms[] stack of more than one page is a More/Back sequence).`);
          }
        });
      }
    }
    // spellVerse grades word by word, so the answer must actually be words.
    if (block.type === 'spellVerse') {
      if (!Array.isArray(block.answerWords) || !block.answerWords.length) {
        problems.push(`${path}: spellVerse has no answerWords array.`);
      } else {
        block.answerWords.forEach((word, index) => {
          if (typeof word !== 'string' || !word.trim()) {
            problems.push(`${path}.answerWords[${index}]: not a non-empty string.`);
          } else if (/\s/.test(word)) {
            problems.push(`${path}.answerWords[${index}]: "${word}" contains whitespace — one word per entry.`);
          }
        });
      }
    }
    // TIMING IS NOT A DATA FIELD (5D-SPEC2 §3, D-14 at 2000/4000). Advance
    // durations live in src/lib/timing.js and nowhere else, so ch1, ch2 and
    // ch3 always read the same two numbers. A regenerated data file that
    // re-introduces autoAdvanceMs would silently do nothing at runtime --
    // resolveAdvance stopped reading it -- which is the kind of change that
    // only shows up as "the feel drifted" three rounds later.
    if (Object.prototype.hasOwnProperty.call(block, 'autoAdvanceMs')) {
      problems.push(`${path}.autoAdvanceMs: advance durations live in src/lib/timing.js, not in the data (D-14).`);
    }
    // BEHAVIOR IS A CLOSED VOCABULARY (5E-SPEC3 §1, DRILL-BEHAVIOR-RULES B1).
    // There are four advance classes and five audio timings, and a value
    // outside them fails SILENTLY at runtime: resolveAdvance falls through to
    // its legacy branch and the surface behaves however that branch happens to
    // say. The renderer cannot report it because it never sees a
    // wrong-but-plausible string as wrong, so the build does.
    if (Object.prototype.hasOwnProperty.call(block, 'answerPolicy')
        && block.answerPolicy && typeof block.answerPolicy === 'object') {
      const advanceClass = block.answerPolicy.advanceClass;
      if (advanceClass != null && WITHDRAWN.has(advanceClass)) {
        problems.push(`${path}.answerPolicy.advanceClass: "${advanceClass}" was WITHDRAWN in 5E-SPEC3 §1 — it existed only to wait for Next on a correct answer, which rule B1a forbids. Restamp this activity as "${WITHDRAWN.get(advanceClass)}".`);
      } else if (advanceClass != null && !ADVANCE_CLASSES.has(advanceClass)) {
        problems.push(`${path}.answerPolicy.advanceClass: "${advanceClass}" is not one of ${[...ADVANCE_CLASSES].join(', ')}.`);
      }
    }
    if (block.audioTiming != null && !AUDIO_TIMINGS.has(block.audioTiming)) {
      problems.push(`${path}.audioTiming: "${block.audioTiming}" is not one of ${[...AUDIO_TIMINGS].join(', ')}.`);
    }
    // greekRows rows carry a word, a positional-chart cell list, or an
    // alternating parts[] equation -- never nothing at all.
    if (block.type === 'greekRows') {
      (block.rows || []).forEach((row, index) => {
        const hasContent = row.greek || Array.isArray(row.syllables) || Array.isArray(row.parts);
        if (!hasContent) problems.push(`${path}.rows[${index}]: greekRows row has no greek, syllables or parts.`);
      });
    }
  });
}

// ---- NO DISPLAYED DOUBLE HYPHEN (D2, 5E-SPEC2 §5.4) ----
// `--` is an em dash everywhere the learner can see it. The rule is applied by
// scripts/apply-behavior-matrix.py, which must run after every assemble; this
// is what notices when it did not. Provenance fields are exempt for the same
// reason the stamper skips them: `_legacy` holds the TBK's own bytes, and the
// `_comment`/`_note`/`_verify`/audioInventory notes are never rendered.
// Every data file is swept, not only the chapters — the last two offenders
// were in intro.json, which the chapter loop had never opened.
const PROVENANCE = new Set(['audioInventory']);
// font-map.json is the extraction pipeline's own reference table — no runtime
// import anywhere in src/ — so its prose is documentation, not copy.
const NON_RENDERED = new Set(['font-map.json']);
function walkStrings(node, path, visit, exempt = false) {
  if (Array.isArray(node)) {
    node.forEach((child, index) => walkStrings(child, `${path}[${index}]`, visit, exempt));
    return;
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      walkStrings(value, `${path}.${key}`, visit, exempt || key.startsWith('_') || PROVENANCE.has(key));
    }
    return;
  }
  if (typeof node === 'string' && !exempt) visit(node, path);
}
for (const file of readdirSync(DATA).filter(name => name.endsWith('.json') && !NON_RENDERED.has(name))) {
  const data = JSON.parse(readFileSync(join(DATA, file), 'utf8'));
  walkStrings(data, file, (text, path) => {
    if (text.includes('--')) {
      problems.push(`${path}: displayed copy contains "--" (D2 — run scripts/apply-behavior-matrix.py): ${JSON.stringify(text.slice(0, 60))}`);
    }
  });
}

// ---- RED-MARK GEOMETRY COVERAGE (5B-SPEC4 B2) ----
// Every cluster a drill reddens must have a row in the generated font table.
// A cluster that misses it still renders, via the legacy rule table, and looks
// ALMOST right -- which is the exact failure VERIFY3 spent a round finding.
// Almost-right is not something a device pass should have to catch twice, so
// it fails the build instead.
const GEOMETRY = JSON.parse(readFileSync('src/lib/mark-geometry.json', 'utf8')).clusters;
const ACCENTS = new Set(['́', '̀', '͂']);
const MARKS = new Set([...ACCENTS, '̓', '̔', '̈']);
const segment = text => [...new Intl.Segmenter('el', { granularity: 'grapheme' }).segment(text)].map(p => p.segment);

for (const file of files) {
  const data = JSON.parse(readFileSync(join(DATA, file), 'utf8'));
  walk(data, file, (activity, path) => {
    if (activity.type !== 'select') return;
    for (const [index, item] of (activity.items || []).entries()) {
      if (!item.greek) continue;
      const clusters = segment(item.greek);
      let target = null;
      if (item.redMarkCluster) target = item.redMarkCluster;
      else if (activity.redFirstAccent) {
        target = clusters.findIndex(c => [...c.normalize('NFD')].some(ch => ACCENTS.has(ch))) + 1 || null;
      }
      if (!target) continue;
      const cluster = clusters[target - 1];
      if (cluster == null) {
        problems.push(`${path}.items[${index}]: redMarkCluster ${target} is past the end of "${item.greek}".`);
        continue;
      }
      // Apostrophe, raised-dot colon and question mark ARE the mark: there is
      // no base letter to lift them off, so those clusters redden whole and
      // need no geometry row.
      if (!/\p{L}/u.test(cluster)) continue;
      const marks = [...cluster.normalize('NFD')].filter(ch => MARKS.has(ch));
      if (!marks.length) {
        problems.push(`${path}.items[${index}]: redMarkCluster ${target} of "${item.greek}" is "${cluster}", which carries no mark — nothing would render red.`);
        continue;
      }
      if (!GEOMETRY[cluster.normalize('NFC')]) {
        problems.push(`${path}.items[${index}]: "${cluster}" of "${item.greek}" has no mark-geometry row; it would fall back to the approximate rule table.`);
      }
    }
  });
}

// ---- KEYBOARD COVERAGE (5D Phase 0) ----
// Every answer on a typing surface must be reachable on the SHARED speller
// keyboard. This is the check that was missing: chapter 1 shipped Χριστός and
// chapter 2 shipped Π-/Φ- words whose capitals no tile can produce, so "With
// Accents" ON was unwinnable on those items from the day they landed, and
// nothing said so. Folded exactly as the checker folds (case always,
// punctuation when the surface allows it), so a pass here means the item can
// actually be answered under both toggle settings.
const TILES = JSON.parse(readFileSync(join(DATA, 'speller-tiles.json'), 'utf8'));
const PRODUCIBLE = new Set([...(TILES.letters || []), ...(TILES.composites || [])]);
for (const base of [...PRODUCIBLE]) {
  for (const mark of (TILES.diacritics || [])) PRODUCIBLE.add((base + mark.apply).normalize('NFC'));
}
for (const p of TILES.punctuation || []) PRODUCIBLE.add(p.insert);
if (TILES.space) PRODUCIBLE.add(TILES.space.insert);
// The same class answer-check.js may drop. Kept as a non-global regex so
// `.test()` has no lastIndex to carry between calls.
const PUNCTUATION = /[.,;:!?"()\[\]··;“”«»—–-]/u;

for (const file of files) {
  const data = JSON.parse(readFileSync(join(DATA, file), 'utf8'));
  const lexName = `lexicon-${file.replace('chapt-0', 'chapt0').replace('chapt-', 'chapt')}`;
  let lexicon = null;
  try { lexicon = JSON.parse(readFileSync(join(DATA, lexName), 'utf8')); } catch { /* optional */ }
  const lemmaGreek = ref => {
    for (const bucket of ['lemmas', 'exampleWords', 'ch1_lemma_mirror']) {
      if (lexicon && lexicon[bucket] && lexicon[bucket][ref]) return lexicon[bucket][ref].greek;
    }
    return null;
  };
  walk(data, file, (activity, path) => {
    if (activity.type !== 'spell' && activity.type !== 'spellVerse') return;
    const answers = [...(activity.answerWords || [])];
    // answerAlt spellings are ALSO accepted, so they must be enterable — but
    // they are not what the surface asks the learner to type, so they are
    // exempt from the displayed-punctuation rule below. Chapter 7's εἰμί
    // speller prints ἐστί(ν) to show that the nu is moveable; the parentheses
    // are typography, not a mark the chapter teaches and the learner reaches
    // for, and the bare ἐστίν the item actually answers with is fully typeable.
    const alternates = [];
    for (const item of activity.items || []) {
      // 5F: a speller item may carry its Greek as `answer` (the phrase and
      // parse spellers) as well as `greek` (chapter 3's verb speller) or by
      // lexicon ref (the vocabulary spellers), and may carry a SECOND
      // acceptable spelling in answerAlt. Every form the checker will accept
      // has to be typeable, which is what makes this the check that proves the
      // elision apostrophe on ἐπ' ἀληθείας has a key (C9 / D-29). Without this
      // branch the whole of chapters 6-8's spellers were invisible here.
      const greek = item.greek || item.answer || (item.ref ? lemmaGreek(item.ref) : null);
      if (greek) answers.push(greek);
      const alt = item.answerAlt;
      for (const value of Array.isArray(alt) ? alt : (alt ? [alt] : [])) {
        if (typeof value === 'string') alternates.push(value);
      }
    }
    const punctuationOptional = activity.punctuationOptional !== false;
    for (const answer of [...answers, ...alternates]) {
      // The checker lowercases under both toggle settings (no shift layer),
      // and drops punctuation unless the surface requires it.
      let folded = answer.toLowerCase();
      // NOT the elision mark: answer-check no longer treats it as droppable,
      // so a verse that elides has to be typeable WITH it.
      if (punctuationOptional) folded = folded.replace(new RegExp(PUNCTUATION.source, 'gu'), '');
      for (const { segment } of segment_(folded)) {
        const cluster = segment.normalize('NFC');
        if (!PRODUCIBLE.has(cluster)) {
          problems.push(`${path}: "${answer}" needs "${cluster}" (U+${[...cluster].map(c => c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).join('+')}), which no speller tile can produce.`);
        }
      }
      if (alternates.includes(answer)) continue;   // see `alternates` above
      // AND THE PUNCTUATION ITSELF MUST BE TYPEABLE (5E-SPEC3-PATCH, D-29).
      // The loop above deletes punctuation before checking, which is right for
      // "can this answer be entered at all" — D-18 makes it optional — but it
      // meant `δι᾽` counted as typeable while no tile on the keyboard could
      // produce the mark. Chapter 2 teaches that mark by name and scores it in
      // a drill; a learner who has been taught it and then reaches for it must
      // find a key. Reported separately so the two failures never blur.
      for (const { segment } of segment_(answer.toLowerCase())) {
        const cluster = segment.normalize('NFC');
        if (PUNCTUATION.test(cluster) && !PRODUCIBLE.has(cluster)) {
          problems.push(`${path}: "${answer}" displays punctuation "${cluster}" (U+${[...cluster].map(c => c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).join('+')}) that no speller tile can produce. It is optional under D-18, but a learner who tries to type it has no key.`);
        }
      }
    }
  });
}
// ONE SPELLING FOR THE ELISION MARK, EVERYWHERE (Nathanael, 2026-08-07).
// It is U+0027 in the verses, in the chapter-2 teaching pages that introduce
// it, and in the drills that score it. The alternates all render as some kind
// of curled comma and were what made the mark indistinguishable from a smooth
// breathing in the first place, so they are refused rather than normalized on
// the way in -- the pipeline rule in apply-behavior-matrix.py converts them
// and this is what proves the conversion ran.
//
// Provenance is exempt: underscore-prefixed keys record where a string came
// from, and font-map.json is the extraction pipeline's own reference table
// with no runtime import anywhere in src/.
const ELISION_ALTERNATES = /[᾽’ʼ‘]/u;
for (const file of readdirSync(DATA)) {
  if (!file.endsWith('.json') || file === 'font-map.json') continue;
  const data = JSON.parse(readFileSync(join(DATA, file), 'utf8'));
  (function scan(node, path) {
    if (Array.isArray(node)) return node.forEach((child, i) => scan(child, `${path}[${i}]`));
    if (node && typeof node === 'object') {
      for (const [key, value] of Object.entries(node)) {
        if (!key.startsWith('_')) scan(value, `${path}.${key}`);
      }
      return;
    }
    if (typeof node === 'string' && ELISION_ALTERNATES.test(node)) {
      const found = [...node].filter(ch => ELISION_ALTERNATES.test(ch))
        .map(ch => `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`);
      problems.push(`${file}${path}: ${JSON.stringify(node.slice(0, 60))} spells an elision mark as ${[...new Set(found)].join(', ')}. Every displayed elision mark is U+0027; a smooth breathing and an apostrophe are different marks and are never interchangeable.`);
    }
  })(data, '');
}

function segment_(text) { return new Intl.Segmenter('el', { granularity: 'grapheme' }).segment(text); }

if (problems.length) {
  for (const problem of problems) console.error(`FAIL: ${problem}`);
  process.exit(1);
}

console.log(`PASS: content shapes intact — ${files.join(', ')} checked (biblist entries are strings; numbered items render something; greekRows rows carry content; paradigm rows match their columns; spellVerse answers are single words; every contentAudio mode has a branch; every advanceClass is one of the four and every audioTiming one of the five; every reddened cluster has a font-derived geometry row; every spelling answer is typeable on the shared keyboard; every displayed elision mark is U+0027; no numbered point is hand-numbered inside a plain para).`);
