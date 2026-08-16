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
  'heading', 'subheading', 'para', 'formula', 'numbered', 'defList',
  'biblist', 'refs', 'note', 'greekRows', 'expander', 'paradigm',
  // 5F: chapter 6's preposition DIAGRAM.
  'prepositionsChart',
  // 5G: chapter 10's present-beside-future chart (teaching topics and the
  // five stem-variation popups share the one shape).
  'presentFutureRows'
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
    checkParaRuns(node, path);
    node.forEach((child, index) => walk(child, `${path}[${index}]`, visit));
    return;
  }
  if (!node || typeof node !== 'object') return;
  visit(node, path);
  for (const [key, value] of Object.entries(node)) walk(value, `${path}.${key}`, visit);
}

// 5F-FEEDBACK2 (Nathanael, 2026-08-09): the "double line spacing" class of
// defect. The extraction pipeline had copied the ORIGINAL PANELS' hard line
// breaks as one `para` block per line — each line then carried a paragraph
// margin, which faked double spacing, collapsed the ch8 Number chart into
// prose, and made every affected page's rhythm differ from its neighbours.
// A para that ends mid-sentence (no terminal punctuation) directly followed
// by another para is that authoring error's signature; a REAL paragraph ends
// in punctuation. Example blocks (multi-line text) keep their authored line
// breaks inside ONE block and are exempt on both sides.
const PARA_TERMINAL = /[.!?:;,"”’)\]]\s*$/;
// The continuation signature needs BOTH halves: the first para ends without
// terminal punctuation AND the next one opens lowercase (or with a fill-in
// blank), the way the middle of a sentence does. Requiring both keeps a
// deliberate standalone display line (chapter 3's "Tense, voice, mood, ..."
// format line, which simply has no full stop) from being mistaken for a
// split — that line's successor starts with a capital.
const CONTINUATION_START = /^[\sαβγδεζηθικλμνξοπρστυφχψω_a-z]/u;
function checkParaRuns(list, path) {
  for (let i = 0; i + 1 < list.length; i++) {
    const a = list[i];
    const b = list[i + 1];
    if (!a || !b || a.type !== 'para' || b.type !== 'para') continue;
    if (typeof a.text !== 'string' || a.text.includes('\n')) continue;
    if (typeof b.text !== 'string') continue;
    const plain = text => text.replace(/\[\[\/?[a-z]+\]\]/g, '');
    if (!PARA_TERMINAL.test(plain(a.text).trim()) && CONTINUATION_START.test(plain(b.text))) {
      problems.push(`${path}[${i}]: para ends mid-sentence ("...${a.text.trim().slice(-30)}") and the next para continues it — the original's LINE breaks must not become separate para blocks; merge into one flowing paragraph (line spacing is uniform app-wide, 5F-FEEDBACK2).`);
    }
  }
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
    // 5G-SPEC3: the three-line future formula has two distinct tap contracts.
    // A tapUnit owns its WHOLE line and one clip; a greekTap owns only one
    // standalone Greek word inside an otherwise inert line. Reject ambiguous
    // or incomplete shapes before they can silently widen a tap target.
    if (block.type === 'formula') {
      if (block.align !== 'center') {
        problems.push(`${path}.align: formula must be centered.`);
      }
      if (!Array.isArray(block.lines) || !block.lines.length) {
        problems.push(`${path}: formula has no lines array.`);
      } else {
        block.lines.forEach((line, index) => {
          const linePath = `${path}.lines[${index}]`;
          if (!line || typeof line !== 'object' || typeof line.text !== 'string' || !line.text.trim()) {
            problems.push(`${linePath}: expected an object with non-empty text.`);
            return;
          }
          const hasTapUnit = Object.prototype.hasOwnProperty.call(line, 'tapUnit');
          const hasGreekTap = Object.prototype.hasOwnProperty.call(line, 'greekTap');
          if (hasTapUnit && line.tapUnit !== true) {
            problems.push(`${linePath}.tapUnit: when present, expected true.`);
          }
          if (hasTapUnit && hasGreekTap) {
            problems.push(`${linePath}: tapUnit and greekTap are mutually exclusive.`);
          }
          if (hasTapUnit) {
            if (typeof line.audio !== 'string' || !line.audio.trim()) {
              problems.push(`${linePath}.audio: tapUnit requires a non-empty audio id.`);
            }
          } else if (Object.prototype.hasOwnProperty.call(line, 'audio')) {
            problems.push(`${linePath}.audio: top-level audio is only valid on a tapUnit line.`);
          }
          if (hasGreekTap) {
            const tap = line.greekTap;
            if (!tap || typeof tap !== 'object'
                || typeof tap.word !== 'string' || !tap.word.trim()
                || typeof tap.audio !== 'string' || !tap.audio.trim()) {
              problems.push(`${linePath}.greekTap: expected non-empty word and audio strings.`);
            } else {
              let standalone = false;
              for (let at = line.text.indexOf(tap.word); at !== -1; at = line.text.indexOf(tap.word, at + 1)) {
                const before = at > 0 ? line.text[at - 1] : '';
                const after = line.text[at + tap.word.length] || '';
                if (!/[Ͱ-Ͽἀ-῿]/u.test(before) && !/[Ͱ-Ͽἀ-῿]/u.test(after)) {
                  standalone = true;
                  break;
                }
              }
              if (!standalone) {
                problems.push(`${linePath}.greekTap.word: "${tap.word}" is not a standalone Greek substring of the line.`);
              }
            }
          }
        });
      }
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
      // 5G: a paradigms[] stack of more than one chart is drawn one of TWO
      // ways, and the names are what say which. NAMED throughout: a More/Back
      // sequence, one chart on screen at a time, each page reporting its own
      // data-chart-name (chapter 8's Masculine/Feminine/Neuter). UNNAMED
      // throughout: both charts stacked on ONE page under one title, which is
      // how chapters 9 and 10 print their Middle+Passive and Future
      // Active+Middle pairs (ch10railwalk p7). A MIXED stack is the real
      // defect — the renderer has to choose, and either choice is wrong for
      // half the data — so it is what fails here.
      if (block.paradigms.length > 1) {
        const named = block.paradigms.filter(chart => chart && typeof chart.name === 'string' && chart.name.trim()).length;
        if (named !== 0 && named !== block.paradigms.length) {
          problems.push(`${path}.paradigms: ${named} of ${block.paradigms.length} charts are named. Name every chart (a More/Back sequence, whose pages report data-chart-name) or none of them (a stacked pair drawn on one page) — never some.`);
        }
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
    // D-42 is retired: Scripture Memory spellers always keep a wrong attempt
    // available for retry and never offer the old Repeat This Exercise mode.
    // Reject either half of the former data contract if a future assembly
    // accidentally stamps it back onto any activity.
    if (Object.prototype.hasOwnProperty.call(block, 'repeatCheckbox')) {
      problems.push(`${path}.repeatCheckbox: Repeat This Exercise was retired by D-42.`);
    }
    if (Array.isArray(block.ui?.checkboxes) && block.ui.checkboxes.includes('Repeat This Exercise')) {
      problems.push(`${path}.ui.checkboxes: Repeat This Exercise was retired by D-42.`);
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
    // 5G: presentFutureRows is a two-sided chart. A row missing either side
    // renders as an empty tap target with nothing in it -- visible only as a
    // gap, which is the failure class this whole file exists for.
    if (block.type === 'presentFutureRows') {
      if (!Array.isArray(block.rows) || !block.rows.length) {
        problems.push(`${path}: presentFutureRows has no rows array.`);
        return;
      }
      block.rows.forEach((row, index) => {
        for (const side of ['present', 'future']) {
          const cell = row && row[side];
          if (!cell || typeof cell !== 'object' || typeof cell.greek !== 'string' || !cell.greek.trim()) {
            problems.push(`${path}.rows[${index}].${side}: expected an object with a non-empty greek form.`);
          }
        }
      });
      if (block.headers != null && (!Array.isArray(block.headers) || block.headers.length !== 2)) {
        problems.push(`${path}.headers: expected exactly two headers (Present, Future) or none at all — the headed form is the two-column chart, the unheaded one the "==>" derivation.`);
      }
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

// ---- EVERY REFERENCE RESOLVES (PIPELINE-INSIGHTS Stage 8.4) ----
// Five of chapter 6-8's six hintRefs dangled once, and a dangling reference
// fails SILENTLY in both directions: a hintRef that resolves to nothing simply
// removes the Hint button, and a [[link:id]] that names no popup renders as
// plain text. Both look like a deliberate absence on screen. 5G adds the
// chapter-level `hintCharts` register (referenced `paradigmRefs` or inline
// `charts`) and explicit link markup, so the whole class is checked here
// rather than one kind at a time.
//
// The resolver accepts an id, a block type, or the camelCase slug of a chart
// title (src/lib/content.js resolveHintRef). That slug rule is copied rather
// than imported because content.js reaches for import.meta.glob and cannot be
// loaded outside Vite; if the two ever disagree, this check is the one that
// says so by failing on a ref the app resolves fine.
const slugOf = text => String(text || '')
  .replace(/[^A-Za-z0-9]+$/, '')
  .replace(/[^A-Za-z0-9]+(.)/g, (_, c) => c.toUpperCase())
  .replace(/^[A-Z]/, c => c.toLowerCase());
const SECTION_KEYS = ['learn', 'drill', 'exercise', 'quickReview'];

for (const file of files) {
  const data = JSON.parse(readFileSync(join(DATA, file), 'utf8'));
  // Everything a hintRef may legally name.
  const chartRefs = new Set(Object.keys(data.hintCharts || {}));
  const collect = node => {
    if (Array.isArray(node)) { node.forEach(collect); return; }
    if (!node || typeof node !== 'object') return;
    if (typeof node.id === 'string') chartRefs.add(node.id);
    if (typeof node.type === 'string') chartRefs.add(node.type);
    if (typeof node.title === 'string') chartRefs.add(slugOf(node.title));
    if (typeof node.chartTitle === 'string') chartRefs.add(slugOf(node.chartTitle));
    for (const value of Object.values(node)) collect(value);
  };
  for (const key of SECTION_KEYS) collect(data[key]);

  for (const [name, composite] of Object.entries(data.hintCharts || {})) {
    const refs = composite && composite.paradigmRefs;
    const charts = composite && composite.charts;
    const hasRefs = Array.isArray(refs) && refs.length > 0;
    const hasCharts = Array.isArray(charts) && charts.length > 0;
    if (!hasRefs && !hasCharts) {
      problems.push(`${file}.hintCharts.${name}: expected a non-empty paradigmRefs or charts array.`);
      continue;
    }
    if (hasRefs && hasCharts) {
      problems.push(`${file}.hintCharts.${name}: use paradigmRefs or inline charts, not both.`);
    }
    if (hasRefs) {
      refs.forEach((ref, index) => {
        if (!chartRefs.has(ref)) {
          problems.push(`${file}.hintCharts.${name}.paradigmRefs[${index}]: "${ref}" names no chart, topic or block in this chapter — the Hint would open empty.`);
        }
      });
    }
    if (hasCharts) {
      charts.forEach((chart, index) => {
        if (!chart || typeof chart !== 'object' || Array.isArray(chart) || chart.type !== 'paradigm') {
          problems.push(`${file}.hintCharts.${name}.charts[${index}]: expected an inline paradigm block.`);
        }
      });
    }
  }

  walk(data, file, (node, path) => {
    // Walking every object reaches ui, item and hint-page records alike, so
    // one own-property check covers both drill defaults and item overrides.
    const ref = node.hintRef;
    if (typeof ref === 'string' && !chartRefs.has(ref)) {
      problems.push(`${path}.hintRef: "${ref}" resolves to nothing — the Hint control would silently not render.`);
    }
  });

  // A [[link:id]] must name one of its OWN activity's popups: the register is
  // per-activity (providePopups + Svelte context), so a link in one activity
  // can never reach another's popup even when the id exists elsewhere.
  const LINK = /\[\[link:([^\]]+)\]\]/g;
  for (const key of SECTION_KEYS) {
    for (const activity of data[key] || []) {
      const popupIds = new Set();
      for (const popup of activity.popups || []) {
        if (popup && popup.id) { popupIds.add(popup.id); popupIds.add(slugOf(popup.id)); }
      }
      (function scanLinks(node, path) {
        if (Array.isArray(node)) return node.forEach((child, i) => scanLinks(child, `${path}[${i}]`));
        if (node && typeof node === 'object') {
          for (const [k, v] of Object.entries(node)) if (!k.startsWith('_')) scanLinks(v, `${path}.${k}`);
          return;
        }
        if (typeof node !== 'string') return;
        LINK.lastIndex = 0;
        for (let m = LINK.exec(node); m; m = LINK.exec(node)) {
          if (!popupIds.has(m[1]) && !popupIds.has(slugOf(m[1]))) {
            problems.push(`${file}.${key}[${activity.id}]${path}: [[link:${m[1]}]] names no popup on this activity — the run would render as plain text with nothing behind it.`);
          }
        }
      })(activity, '');
      // A topic title that IS a link resolves the same way.
      for (const [index, topic] of (activity.topics || []).entries()) {
        if (topic && topic.titleLink && !popupIds.has(topic.titleLink) && !popupIds.has(slugOf(topic.titleLink))) {
          problems.push(`${file}.${key}[${activity.id}].topics[${index}].titleLink: "${topic.titleLink}" names no popup on this activity.`);
        }
      }
    }
  }
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

// ---- every audio id the data names must exist in the audio manifest ----
// 5F-FEEDBACK2 item 17 / 5F-FEEDBACK3 item 2 (Nathanael, 2026-08): two rounds
// of wrong word→clip keying. A clip's CONTENT cannot be asserted at build
// time (that takes ears, or the original's TBK wiring), but a clip's
// EXISTENCE can: any string anywhere in a chapter file that is shaped like an
// audio id (the DIR_PATTERN contract in src/lib/audio.js) must be a key in
// public/audio/audio-manifest.json. This catches dangling ids, typos and
// ids invented during a re-keying — the failure mode where a tap silently
// toasts "Audio not found" on device and nothing in the build ever said so.
{
  const manifest = JSON.parse(readFileSync('public/audio/audio-manifest.json', 'utf-8'));
  const AUDIO_ID = /^(chapt_\d+|vocab\d*|john\d*|rev_par|rev_voc|intro)_.+$/;
  for (const file of files) {
    const data = JSON.parse(readFileSync(join(DATA, file), 'utf-8'));
    (function walkIds(node, path) {
      if (Array.isArray(node)) { node.forEach((v, i) => walkIds(v, `${path}[${i}]`)); return; }
      if (node && typeof node === 'object') {
        for (const [key, value] of Object.entries(node)) walkIds(value, `${path}.${key}`);
        return;
      }
      if (typeof node === 'string' && AUDIO_ID.test(node) && !(node in manifest)) {
        // 5G: name the CASE fix when that is what it is. Audio ids are derived
        // from the ISO path and are lowercase throughout (audio.js naming
        // contract); chapter 10's translation drill shipped 31 ids spelled
        // with the TBK dispatch key's own mixed case (j_TvD1), every one of
        // which would have toasted on device. "Not in the manifest" was true
        // but sent the reader looking for a missing clip that is right there.
        const lower = node.toLowerCase();
        problems.push(lower !== node && lower in manifest
          ? `${file}${path}: audio id "${node}" is not in audio-manifest.json, but "${lower}" is — audio ids are lowercase everywhere (the ISO path contract in src/lib/audio.js). Fix the case.`
          : `${file}${path}: audio id "${node}" is not in audio-manifest.json — the tap would toast "Audio not found" at runtime.`);
      }
    })(data, '');
  }
}

if (problems.length) {
  for (const problem of problems) console.error(`FAIL: ${problem}`);
  process.exit(1);
}

console.log(`PASS: content shapes intact — ${files.join(', ')} checked (biblist entries are strings; numbered items render something; greekRows rows carry content; paradigm rows match their columns; formula lines have exclusive whole-line/inline tap contracts; spellVerse answers are single words; retired Repeat controls are absent; every contentAudio mode has a branch; every advanceClass is one of the four and every audioTiming one of the five; every reddened cluster has a font-derived geometry row; every spelling answer is typeable on the shared keyboard; every displayed elision mark is U+0027; no numbered point is hand-numbered inside a plain para; no paragraph is split line-by-line across consecutive paras; every presentFutureRows row has both sides; every hintChart has paradigmRefs or inline charts; every hintRef, paradigmRef, [[link:id]] and topic titleLink resolves; every audio id the data names exists in the audio manifest).`);
