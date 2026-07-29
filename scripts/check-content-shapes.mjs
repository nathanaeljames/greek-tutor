// Build-time assertion for the content SHAPES the renderers depend on
// (5B-SPEC2 B6). The chapter-2 bibliography once shipped object-form entries
// and rendered "[object Object]" five times over on device: valid JSON, valid
// block type, silently garbled output. A shape that can only fail visually
// gets a loud check here instead. Run from `npm run verify`.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DATA = 'src/data';
const problems = [];

// Every block type RichContent.svelte dispatches on. A data file that ships a
// type not in this list renders as a loud placeholder at runtime; here it fails
// the build, which is where a new pipeline block type should be noticed
// (5B-SPEC3 D4). Add the type here in the same change that adds its branch.
const BLOCK_TYPES = new Set([
  'heading', 'subheading', 'para', 'numbered', 'defList',
  'biblist', 'refs', 'note', 'greekRows', 'expander', 'paradigm'
]);
// "type" is also the ACTIVITY discriminator, so the activity types are listed
// here as the known non-block use of the key. Anything else carrying a "type"
// is a content block and must have a renderer.
const ACTIVITY_TYPES = new Set(['contentAudio', 'select', 'spell', 'divide', 'placeAccent', 'spellVerse']);
// contentAudio dispatches on `mode`; a mode with no branch in
// ContentAudio.svelte falls through to the generic chart and renders a grid of
// nothing, which is exactly the kind of failure that only shows up on device.
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
    // Every contentAudio mode must have a branch in ContentAudio.svelte; an
    // unknown one silently falls through to the generic chart layout.
    if (block.type === 'contentAudio' && block.mode && !CONTENT_MODES.has(block.mode)) {
      problems.push(`${path}: contentAudio mode "${block.mode}" has no ContentAudio branch.`);
    }
    // A paradigm chart's rows must line up with its declared columns, or cells
    // land under the wrong number heading.
    if (block.type === 'paradigm' || (block.paradigm && block.mode === 'paradigmChart')) {
      const chart = block.type === 'paradigm' ? block : block.paradigm;
      const columns = (chart.columns || []).length;
      if (!columns) problems.push(`${path}: paradigm has no columns.`);
      (chart.rows || []).forEach((row, index) => {
        if (!Array.isArray(row.cells) || row.cells.length !== columns) {
          problems.push(`${path}.rows[${index}]: paradigm row has ${(row.cells || []).length} cells, expected ${columns}.`);
        }
      });
      if (chart.endings) {
        (chart.endings.rows || []).forEach((row, index) => {
          if (!Array.isArray(row) || row.length !== columns * 2) {
            problems.push(`${path}.endings.rows[${index}]: expected ${columns * 2} entries (ending + gloss per column).`);
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
    for (const item of activity.items || []) {
      const greek = item.greek || (item.ref ? lemmaGreek(item.ref) : null);
      if (greek) answers.push(greek);
    }
    const punctuationOptional = activity.punctuationOptional !== false;
    for (const answer of answers) {
      // The checker lowercases under both toggle settings (no shift layer),
      // and drops punctuation unless the surface requires it.
      let folded = answer.toLowerCase();
      if (punctuationOptional) folded = folded.replace(/[.,;:!?'"()\[\]··;᾽’ʼ‘“”«»—–-]/gu, '');
      for (const { segment } of segment_(folded)) {
        const cluster = segment.normalize('NFC');
        if (!PRODUCIBLE.has(cluster)) {
          problems.push(`${path}: "${answer}" needs "${cluster}" (U+${[...cluster].map(c => c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).join('+')}), which no speller tile can produce.`);
        }
      }
    }
  });
}
function segment_(text) { return new Intl.Segmenter('el', { granularity: 'grapheme' }).segment(text); }

if (problems.length) {
  for (const problem of problems) console.error(`FAIL: ${problem}`);
  process.exit(1);
}

console.log(`PASS: content shapes intact — ${files.join(', ')} checked (biblist entries are strings; greekRows rows carry content; paradigm rows match their columns; spellVerse answers are single words; every contentAudio mode has a branch; every reddened cluster has a font-derived geometry row; every spelling answer is typeable on the shared keyboard).`);
