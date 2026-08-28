// scripts/check-doc-integrity.mjs — guard against silent living-document loss.
//
// WHY THIS EXISTS. At commit 021a03d a "full refresh" of CHAT-HANDOFF.md
// replaced a 696-line living document with 70 lines, silently destroying
// eleven standing sections (recovered later from git history). Living
// documents are delivered as full-file replacements, which makes wholesale
// loss invisible in the moment of saving. This check makes it loud.
//
// WHAT IT CHECKS, for every tracked *.md and *.csv under buildout/,
// comparing the WORKING TREE against HEAD:
//   1. No "## " section heading present at HEAD may disappear. Renames
//      count as disappearances — a rename must be acknowledged.
//   2. No document may shrink below 70% of its HEAD line count.
//   3. DRILLBEHAVIORLEDGER.csv must keep exactly its HEAD row count.
//
// ACKNOWLEDGED CHANGES. Deliberate section removals or large trims are
// legitimate occasionally. To pass one through, run with the environment
// variable DOC_INTEGRITY_ACK set to a comma-separated list of filenames:
//   DOC_INTEGRITY_ACK=CHAT-HANDOFF.md node scripts/check-doc-integrity.mjs
// The acknowledgment is per-invocation and never persisted, so the next
// run guards again. There is no flag to disable the whole check.
//
// WIRING. Add to package.json:
//   "check:docs": "node scripts/check-doc-integrity.mjs",
// and prepend it to the existing "verify" chain so every build runs it.
// Run it manually before EVERY commit that touches buildout/.

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = execSync('git rev-parse --show-toplevel').toString().trim();
const ACK = new Set((process.env.DOC_INTEGRITY_ACK || '')
  .split(',').map(s => s.trim()).filter(Boolean));

// --staged compares the INDEX (what this commit will actually record) against
// HEAD. Without it, the working tree is compared instead. The pre-commit hook
// always passes --staged: a file can be fine on disk and truncated in the
// index, and the index is what gets written into history.
const STAGED = process.argv.includes('--staged');
const readWork = (rel) => {
  if (!STAGED) {
    const p = join(ROOT, rel);
    return existsSync(p) ? readFileSync(p, 'utf8') : null;
  }
  try {
    return execSync(`git show :"${rel}"`, { cwd: ROOT, maxBuffer: 1 << 26 })
      .toString();
  } catch { return null; }   // not in the index = deleted in this commit
};

// `maxBuffer` for the same reason the three calls around it carry it, and this
// one was simply missed: `buildout` holds every round's screenshot corpus, and
// the file list crossed execSync's 1 MB default at some point before this
// round -- 12,442 paths, 1,085,518 bytes -- after which this script died with
// ENOBUFS out of spawnSync before it read a single document. 1 << 26 is the
// value the rest of the file already uses.
let tracked = execSync('git ls-files buildout', { cwd: ROOT, maxBuffer: 1 << 26 }).toString()
  .split('\n').filter(f => /\.(md|csv)$/.test(f));

if (STAGED) {
  // Only the docs this commit touches; untouched files cannot lose anything.
  const changed = new Set(execSync('git diff --cached --name-only', { cwd: ROOT })
    .toString().split('\n').filter(Boolean));
  tracked = tracked.filter(f => changed.has(f));
  if (!tracked.length) {
    console.log('doc-integrity: no buildout documents in this commit.');
    process.exit(0);
  }
}

let failures = 0;
const fail = (msg) => { failures += 1; console.error('FAIL  ' + msg); };
const note = (msg) => console.log('ok    ' + msg);

for (const rel of tracked) {
  const name = rel.split('/').pop();
  let head;
  try {
    head = execSync(`git show HEAD:"${rel}"`, { cwd: ROOT, maxBuffer: 1 << 26 })
      .toString();
  } catch { continue; } // new file at HEAD~0: nothing to guard against
  const work = readWork(rel);
  if (work === null) {
    if (!ACK.has(name)) {
      fail(`${name}: deleted ${STAGED ? 'in this commit' : 'from the working tree'} (ack required)`);
    }
    continue;
  }

  const headLines = head.split('\n').length;
  const workLines = work.split('\n').length;

  if (rel.endsWith('.csv')) {
    const rows = (s) => s.split('\n').filter(l => l.trim()).length;
    if (rows(work) !== rows(head) && !ACK.has(name)) {
      fail(`${name}: row count ${rows(head)} -> ${rows(work)} (ack required)`);
    } else note(`${name}: ${rows(work)} rows`);
    continue;
  }

  const heads = (s) => s.split('\n').filter(l => l.startsWith('## '))
    .map(l => l.replace(/\s*\(.*$/, '').trim()); // ignore parenthetical dates
  const lost = heads(head).filter(h => !heads(work).includes(h));
  if (lost.length && !ACK.has(name)) {
    fail(`${name}: section(s) lost vs HEAD: ${lost.join(' | ')}`);
  }
  if (workLines < headLines * 0.7 && !ACK.has(name)) {
    fail(`${name}: shrank ${headLines} -> ${workLines} lines (>30%, ack required)`);
  }
  if (!lost.length && workLines >= headLines * 0.7) {
    note(`${name}: ${workLines} lines, ${heads(work).length} sections`);
  }
}

if (failures) {
  console.error(`\n${failures} document-integrity failure(s).`);
  console.error('If every flagged change is DELIBERATE, re-run with');
  console.error('DOC_INTEGRITY_ACK=<file,file> — otherwise restore from git.');
  process.exit(1);
}
console.log(`\nAll living documents intact against HEAD${STAGED ? ' (staged)' : ''}.`);
