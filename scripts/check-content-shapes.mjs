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
  'biblist', 'refs', 'note', 'greekRows', 'expander'
]);
// "type" is also the ACTIVITY discriminator, so the activity types are listed
// here as the known non-block use of the key. Anything else carrying a "type"
// is a content block and must have a renderer.
const ACTIVITY_TYPES = new Set(['contentAudio', 'select', 'spell', 'divide', 'placeAccent']);

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

if (problems.length) {
  for (const problem of problems) console.error(`FAIL: ${problem}`);
  process.exit(1);
}

console.log(`PASS: content shapes intact — ${files.join(', ')} checked (biblist entries are strings; greekRows rows carry content; every reddened cluster has a font-derived geometry row).`);
