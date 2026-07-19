// audio-store.js — the SINGLE IndexedDB access point for audio bytes.
// Nothing else in the codebase may open this database (phase 4.5 decision:
// audio bytes moved out of Cache Storage so the origin's Cache Storage stays
// tiny — shell precache + one manifest entry — and cold start no longer scales
// with library size; see buildout/4.5-SPEC.md §0).
//
// Design:
//   - DB 'greek-tutor', object store 'audio'.
//   - Keys are the SAME absolute paths the player and manifest plumbing already
//     use ('/audio/chapt_1/a_alpha.m4a'), so migration and every id->path path
//     stay symmetric — no key translation anywhere.
//   - Values are Blobs stored as-is (never ArrayBuffer): no copy into JS heap,
//     and iOS IDB Blob support is solid on the target OS. Playback reads a Blob
//     and hands it to URL.createObjectURL — seeking is native/local, so Range
//     requests and the SW leave the audio path entirely.
//
// Uses `idb` (Jake Archibald's ~1.2 KB promise wrapper over raw IndexedDB) to
// avoid raw IDB's transaction/event footguns — auto-committing transactions and
// silent error propagation, exactly the class of bug that bites hand-rolled
// batched multi-put code. Phase 6's progress backend reuses this dependency.

import { openDB } from 'idb';

const DB_NAME = 'greek-tutor';
const STORE = 'audio';
// idb auto-commits a readwrite transaction when the microtask queue drains, so
// each txn must stay a tight synchronous burst of puts. ~100 keeps every
// transaction small and bounded regardless of how big a download batch is.
const TXN_BATCH = 100;

let dbPromise = null;
function db() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(database) {
        if (!database.objectStoreNames.contains(STORE)) database.createObjectStore(STORE);
      }
    }).catch((err) => { dbPromise = null; throw err; });   // allow a later retry
  }
  return dbPromise;
}

// One audio Blob by path, or undefined if absent.
export async function getBlob(path) {
  return (await db()).get(STORE, path);
}

// True iff a path is stored, without pulling the Blob across. count(query)
// returns 0 or 1 for a single out-of-line key — reliable where getKey's
// undefined-vs-key return is easy to misread.
export async function has(path) {
  const n = await (await db()).count(STORE, path);
  return n > 0;
}

// Persist many { path, blob } entries in batched readwrite transactions
// (~TXN_BATCH per txn). Each chunk is one synchronous burst of store.put()
// calls followed by an awaited tx.done, so nothing races idb's auto-commit.
export async function putMany(entries) {
  if (!entries || !entries.length) return;
  const database = await db();
  for (let i = 0; i < entries.length; i += TXN_BATCH) {
    const chunk = entries.slice(i, i + TXN_BATCH);
    const tx = database.transaction(STORE, 'readwrite');
    for (const e of chunk) tx.store.put(e.blob, e.path);
    await tx.done;
  }
}

// Delete many keys in batched transactions (the Update/force path and any
// targeted cleanup).
export async function deleteMany(paths) {
  if (!paths || !paths.length) return;
  const database = await db();
  for (let i = 0; i < paths.length; i += TXN_BATCH) {
    const chunk = paths.slice(i, i + TXN_BATCH);
    const tx = database.transaction(STORE, 'readwrite');
    for (const p of chunk) tx.store.delete(p);
    await tx.done;
  }
}

// Empty the whole store (Clear downloaded audio).
export async function clearAll() {
  await (await db()).clear(STORE);
}

// Exact count of stored files. Cheap (IDB maintains it) — but still never call
// this on the load/mount path (standing directive 10): the persisted counter
// renders instantly, this only reconciles it (Settings-only).
export async function count() {
  return (await db()).count(STORE);
}

// All stored keys (absolute paths), optionally filtered by a path prefix. Keys
// are already distinct, so keys().length is the exact distinct-file count.
export async function keys(prefix) {
  const all = await (await db()).getAllKeys(STORE);
  if (!prefix) return all;
  return all.filter((k) => typeof k === 'string' && k.startsWith(prefix));
}
