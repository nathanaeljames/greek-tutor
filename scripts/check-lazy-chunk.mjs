// Build-time assertion for the 5A lazy-chapter split (spec 5A §3 tree-shake
// guard). The audit's TRAP: an unreferenced import.meta.glob is tree-shaken and
// NO per-chapter chunk is emitted — silently. This check FAILS the build if the
// chapt-01 chunk is missing or if chapter-1 DATA leaked back into the main
// bundle. Run after `npm run build`; wired into `npm run verify`.
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

// 1. The chapter chunk file must exist as its own asset.
const chapterChunk = files.find(f => /^chapt-01-.*\.js$/.test(f));
if (!chapterChunk) fail('no chapt-01-<hash>.js chunk in dist/assets — the glob was tree-shaken.');

const lexiconChunk = files.find(f => /^lexicon-chapt01-.*\.js$/.test(f));
if (!lexiconChunk) fail('no lexicon-chapt01-<hash>.js chunk in dist/assets.');

// 2. Chapter-1 DATA must be ABSENT from the main bundle and PRESENT in the chunk.
//    A distinctive data value (not a property name a component might reference).
const NEEDLE = 'You will be able to:';
const mainBundle = files.find(f => /^index-.*\.js$/.test(f));
if (!mainBundle) fail('no index-<hash>.js main bundle in dist/assets.');

const mainSrc = readFileSync(join(ASSETS, mainBundle), 'utf8');
if (mainSrc.includes(NEEDLE)) fail(`chapter-1 data ("${NEEDLE}") leaked into the main bundle ${mainBundle}.`);

const chunkSrc = readFileSync(join(ASSETS, chapterChunk), 'utf8');
if (!chunkSrc.includes(NEEDLE)) fail(`chapter-1 data ("${NEEDLE}") not found in the chunk ${chapterChunk}.`);

// 3. The service worker must precache the chapter chunk (offline proof).
let swSrc = '';
try { swSrc = readFileSync('dist/sw.js', 'utf8'); } catch { fail('dist/sw.js not found.'); }
if (!swSrc.includes(chapterChunk)) fail(`sw.js does not precache the chapter chunk ${chapterChunk}.`);
if (!swSrc.includes(lexiconChunk)) fail(`sw.js does not precache the lexicon chunk ${lexiconChunk}.`);

console.log(`PASS: lazy-chapter split intact — ${chapterChunk} + ${lexiconChunk} emitted, precached, and chapter data is out of ${mainBundle}.`);
