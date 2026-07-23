// Build-time assertion for the 5A lazy-chapter split (spec 5A §3 tree-shake
// guard). The audit's TRAP: an unreferenced import.meta.glob is tree-shaken and
// NO per-chapter chunk is emitted — silently. This check FAILS the build if a
// built chapter/lexicon chunk is missing or if chapter DATA leaked back into
// the main bundle. Run after `npm run build`; wired into `npm run verify`.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ASSETS = 'dist/assets';
let files;
try {
  files = readdirSync(ASSETS);
} catch {
  console.error(`FAIL: ${ASSETS} not found — run \`npm run build\` first.`);
  process.exit(1);
}

const fail = msg => { console.error(`FAIL: ${msg}`); process.exit(1); };

// 1. Every built chapter and lexicon must exist as its own asset.
const expected = [
  { chapterPattern: /^chapt-01-.*\.js$/, lexiconPattern: /^lexicon-chapt01-.*\.js$/, needle: 'You will be able to:' },
  { chapterPattern: /^chapt-02-.*\.js$/, lexiconPattern: /^lexicon-chapt02-.*\.js$/, needle: 'Greek divides words into syllables in almost the same way as English.' }
];

// 2. Chapter DATA must be ABSENT from the main bundle and PRESENT in its chunk.
//    Use distinctive data values, not property names components may reference.
const mainBundle = files.find(f => /^index-.*\.js$/.test(f));
if (!mainBundle) fail('no index-<hash>.js main bundle in dist/assets.');

const mainSrc = readFileSync(join(ASSETS, mainBundle), 'utf8');
let swSrc = '';
try { swSrc = readFileSync('dist/sw.js', 'utf8'); } catch { fail('dist/sw.js not found.'); }

const emitted = [];
for (const item of expected) {
  const chapterChunk = files.find(file => item.chapterPattern.test(file));
  if (!chapterChunk) fail(`no chunk matching ${item.chapterPattern} in dist/assets — the glob may have been tree-shaken.`);
  const lexiconChunk = files.find(file => item.lexiconPattern.test(file));
  if (!lexiconChunk) fail(`no chunk matching ${item.lexiconPattern} in dist/assets.`);
  if (mainSrc.includes(item.needle)) fail(`chapter data ("${item.needle}") leaked into the main bundle ${mainBundle}.`);
  const chunkSrc = readFileSync(join(ASSETS, chapterChunk), 'utf8');
  if (!chunkSrc.includes(item.needle)) fail(`chapter data ("${item.needle}") not found in ${chapterChunk}.`);
  if (!swSrc.includes(chapterChunk)) fail(`sw.js does not precache the chapter chunk ${chapterChunk}.`);
  if (!swSrc.includes(lexiconChunk)) fail(`sw.js does not precache the lexicon chunk ${lexiconChunk}.`);
  emitted.push(`${chapterChunk} + ${lexiconChunk}`);
}

console.log(`PASS: lazy-chapter split intact — ${emitted.join('; ')} emitted, precached, and chapter data is out of ${mainBundle}.`);
