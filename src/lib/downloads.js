// DownloadManager — module singleton owning bulk audio population.
// Downloads survive route changes (state lives here, not in components);
// components only subscribe/unsubscribe. NEVER auto-starts a download: every
// fetch is the result of an explicit user tap (rural data budget).
//
// Phase 4.5: audio bytes live in IndexedDB (audio-store.js), NOT Cache Storage.
// A downloaded file is a Blob keyed by its absolute path; playback (audio.js)
// reads the Blob and plays a URL.createObjectURL — no SW, no Range, no cache.
// This module is the sole WRITER of audio bytes (structurally single-writer:
// nothing else opens the audio DB), so the round-1 Vary-duplication saga and
// the x-gt-bulk-download marker are gone.

import { writable, derived } from 'svelte/store';
import { loadManifest, getPacks, getPack } from './packs.js';
import { AUDIO_CACHE, MANIFEST_CACHE, isAudioCacheName } from './cache-config.js';
import * as audioStore from './audio-store.js';

const BOOK_KEY = 'greek-tutor-downloads-v1';
const ALL = '__all__';               // aggregate pseudo-pack for "Download all"
const CONCURRENCY = 4;
// Persist fetched blobs in transactions of this size (matches audio-store's own
// txn batching): the download loops buffer blobs and flush at this threshold so
// memory stays bounded even across an 8.5k-file "Download all".
const PERSIST_BATCH = 100;

// packId -> { state, done, total, error }
// state: 'none' | 'downloading' | 'partial' | 'done' | 'update'
const store = writable({});
const controllers = {};              // packId -> AbortController
let currentHash = null;
let initPromise = null;
let persistRequested = false;

// ---- audio-file counter: persisted so it renders INSTANTLY (no store scan on
// mount) --------------------------------------------------------------------
// The "Audio files stored" figure must be trustworthy AND cheap. IDB count() is
// cheap, but standing directive 10 still stands: NOTHING on the load or route-
// mount path enumerates the store. We keep the last known count in localStorage
// and render that immediately; the exact ground-truth count runs later, off the
// paint path (deferred reconcile / explicit retry), and corrects it.
const COUNT_KEY = 'greek-tutor-audio-count';
function readStoredCount() {
  try { const v = localStorage.getItem(COUNT_KEY); return v == null ? null : (parseInt(v, 10) || 0); }
  catch (_) { return null; }
}
// null = unknown (never measured on this device). Components render "counting…"
// for null and the exact number otherwise.
export const audioCount = writable(readStoredCount());
function setCount(n) {
  audioCount.set(n);
  try { if (n == null) localStorage.removeItem(COUNT_KEY); else localStorage.setItem(COUNT_KEY, String(n)); }
  catch (_) { /* quota/unavailable: store still holds it for this session */ }
}

// Run heavy work AFTER the current frame so it never blocks first paint or
// interaction. requestIdleCallback where available (Chrome, iOS 16.4+), else a
// macrotask.
function idle(fn) {
  if (typeof requestIdleCallback === 'function') requestIdleCallback(() => fn(), { timeout: 2000 });
  else setTimeout(fn, 0);
}

// Cheap pathname of a cache-key URL ("https://host/audio/chapt_1/a.m4a" ->
// "/audio/chapt_1/a.m4a"). Only the legacy-cache migration needs this now (the
// Cache Storage keys are absolute URLs; IDB keys are already these paths).
function pathOf(url) { const i = url.indexOf('/audio/'); return i >= 0 ? url.slice(i) : url; }

// Lightweight perf instrumentation so the device pass can see where time goes.
// Last timing is surfaced in the debug card; every scan also logs to console.
export const lastScan = writable(null);   // { label, ms, entries }
function recordScan(label, ms, entries) {
  const rec = { label, ms: Math.round(ms), entries };
  lastScan.set(rec);
  try { console.log(`[gt-perf] ${label}: ${rec.ms}ms${entries != null ? ` (${entries} entries)` : ''}`); } catch (_) {}
}
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

// Cold-start timing breakdown for the debug card (device pass). All values are
// ms since navigation start (same clock as our performance.mark()s). This is
// the ACCEPTANCE INSTRUMENT for phase 4.5: after migration deletes the legacy
// audio cache, responseStart (the SW producing the shell) must be small and
// must NOT scale with library size, because Cache Storage is tiny again.
//   workerStart..responseStart = time the SW spent producing the shell response
//   responseEnd                = shell bytes delivered
//   jsStart / appCreated       = our code executing
export function startupReport() {
  const out = {
    fetchStart: null, workerStart: null, responseStart: null, responseEnd: null,
    domContentLoaded: null, jsStart: null, appCreated: null, swControlled: null
  };
  try {
    const nav = (performance.getEntriesByType('navigation') || [])[0];
    if (nav) {
      out.fetchStart = Math.round(nav.fetchStart);
      out.workerStart = Math.round(nav.workerStart);        // 0 when no SW handled it
      out.responseStart = Math.round(nav.responseStart);
      out.responseEnd = Math.round(nav.responseEnd);
      out.domContentLoaded = Math.round(nav.domContentLoadedEventEnd);
    }
    const js = performance.getEntriesByName('gt-js-start')[0];
    const ac = performance.getEntriesByName('gt-app-created')[0];
    if (js) out.jsStart = Math.round(js.startTime);
    if (ac) out.appCreated = Math.round(ac.startTime);
    out.swControlled = !!(typeof navigator !== 'undefined' && navigator.serviceWorker && navigator.serviceWorker.controller);
  } catch (_) { /* leave nulls */ }
  return out;
}

// ---- localStorage bookkeeping (mirrors progress.js versioned-key pattern) ----
// Shape: { version: 1, packs: { <id>: { complete, manifestHash } }, migrationDone }
function loadBook() {
  try {
    const raw = localStorage.getItem(BOOK_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && p.version === 1) return { version: 1, packs: p.packs || {}, migrationDone: !!p.migrationDone };
    }
  } catch (_) { /* corrupt/unavailable -> start clean */ }
  return { version: 1, packs: {}, migrationDone: false };
}
function saveBook(book) {
  try { localStorage.setItem(BOOK_KEY, JSON.stringify(book)); } catch (_) { /* ignore quota */ }
}
function setBookPack(packId, entry) {
  const book = loadBook();
  if (entry) book.packs[packId] = entry;
  else delete book.packs[packId];
  saveBook(book);
}

function defaultFor(packId) {
  // Instant badge from bookkeeping before the manifest has loaded counts in.
  const b = loadBook().packs[packId];
  return { state: b && b.complete ? 'done' : 'none', done: 0, total: 0, error: null };
}
function patch(packId, changes) {
  store.update(m => ({ ...m, [packId]: { ...(m[packId] || defaultFor(packId)), ...changes } }));
}

// ---- one-time session init: seed states from bookkeeping + manifest ----
function ensureInit() {
  if (!initPromise) {
    initPromise = (async () => {
      const [{ hash }, packs] = await Promise.all([loadManifest(), getPacks()]);
      currentHash = hash;
      const book = loadBook();
      const seed = {};
      for (const p of packs) {
        const b = book.packs[p.id];
        let state = 'none', done = 0;
        if (b && b.complete) {
          done = p.count;
          state = b.manifestHash === hash ? 'done' : 'update';
        }
        seed[p.id] = { state, done, total: p.count, error: null };
      }
      store.set(seed);
      // NB: no store enumeration here. App load (and every chapter hub, which
      // mounts DownloadControl -> ensureInit) must never enumerate the audio
      // store (directive 10). Pack badges come from localStorage bookkeeping
      // (instant); the exact count comes from the persisted audioCount store.
      // The one reconciling pass runs only when the Storage menu opens
      // (reconcileAudioCache).
    })().catch(() => { initPromise = null; });
  }
  return initPromise;
}

// Reconciling audit: ONE audioStore.keys() pass that (a) refreshes the exact
// file count and (b) corrects stale bookkeeping (e.g. the user cleared Safari
// storage outside the app but our localStorage survived, so a pack badge still
// claims "downloaded"). Deliberately NOT on the app-load path — only the
// Storage menu calls this, on mount, deferred to idle. `needsReconcile` skips
// it on repeat visits when nothing changed; a download/clear sets it true.
let needsReconcile = true;
export function reconcileAudioCache() {
  if (!needsReconcile) return;
  needsReconcile = false;
  idle(async () => {
    const t0 = now();
    let n = null;
    try {
      const packs = await getPacks();
      const keys = await audioStore.keys();
      const have = new Set(keys);                       // keys are absolute paths
      n = have.size;
      setCount(n);                                      // exact ground truth
      const book = loadBook();
      for (const p of packs) {
        const claimed = book.packs[p.id];
        if (!claimed || !claimed.complete) continue;
        const present = p.srcs.filter(s => have.has(s)).length;
        if (present === p.count) continue;              // claim holds
        if (present === 0) {
          setBookPack(p.id, null);
          patch(p.id, { state: 'none', done: 0 });
        } else {
          patch(p.id, { state: 'partial', done: present });
        }
      }
    } catch (_) { needsReconcile = true; /* let a later open retry */ }
    recordScan('reconcile', now() - t0, n);
  });
}

// ---- persistent storage: request once, on first user-initiated download ----
async function requestPersistOnce() {
  if (persistRequested) return;
  persistRequested = true;
  try {
    if (navigator.storage && navigator.storage.persist) await navigator.storage.persist();
  } catch (_) { /* never block or fail on rejection */ }
}

// ---- public: per-pack readable store (triggers init on first subscribe) ----
export function packState(packId) {
  ensureInit();
  return derived(store, m => m[packId] || defaultFor(packId));
}

// Aggregate "Download all" progress store.
export function allState() {
  return derived(store, m => m[ALL] || { state: 'none', done: 0, total: 0, error: null });
}

// Fingerprint of every pack's state (not progress counts), so Settings can
// re-read the browser storage estimate exactly when a download/clear lands
// rather than on every per-file tick.
export const packStatesFingerprint = derived(store, m =>
  Object.entries(m).map(([id, v]) => `${id}:${v.state}`).sort().join('|'));

export async function storageInfo() {
  const info = { usage: null, quota: null, persisted: false };
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const est = await navigator.storage.estimate();
      info.usage = est.usage; info.quota = est.quota;
    }
    if (navigator.storage && navigator.storage.persisted) info.persisted = await navigator.storage.persisted();
  } catch (_) { /* leave nulls */ }
  return info;
}

// Per-file fetch with a HARD timeout + a couple of retries + 429/503 backoff.
// LOAD-BEARING (round-2 device fix): on iOS a fetch() has no built-in timeout,
// so a single wedged connection leaves `await fetch` pending FOREVER and a few
// stuck files freeze the whole CONCURRENCY-wide run with no way to kick it. A
// timeout guarantees every fetch settles; retries absorb transient stalls; the
// 429/503 backoff is the graceful path if the host throttles the ~8.5k burst.
// Error contract for callers:
//   - user cancel  -> AbortError (stop the whole run)
//   - offline      -> TypeError  (stop the whole run)
//   - timed out after retries / other -> TimeoutError-ish (per-file failure ->
//     'partial' -> Resume retries it)
const FETCH_TIMEOUT_MS = 25000;   // generous: audio files avg ~10 KB, <1 s when healthy
const FETCH_RETRIES = 2;          // total attempts = FETCH_RETRIES + 1
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function bulkFetch(src, masterSignal) {
  for (let attempt = 0; ; attempt++) {
    if (masterSignal.aborted) throw abortError();
    const ctl = new AbortController();
    const onAbort = () => ctl.abort();
    masterSignal.addEventListener('abort', onAbort, { once: true });
    const timer = setTimeout(() => ctl.abort(), FETCH_TIMEOUT_MS);
    let resp;
    try {
      resp = await fetch(src, { signal: ctl.signal });
    } catch (e) {
      if (masterSignal.aborted) throw abortError();       // real user cancel -> fatal
      if (e instanceof TypeError) throw e;                // offline -> fatal
      if (attempt >= FETCH_RETRIES) {                     // timeout/other, retries spent
        const te = new Error('fetch timed out'); te.name = 'TimeoutError'; throw te;
      }
      await sleep(400 * (attempt + 1));                   // brief backoff, then retry
      continue;
    } finally {
      clearTimeout(timer);
      masterSignal.removeEventListener('abort', onAbort);
    }
    // CDN rate-limit / temporary unavailability: back off (honoring Retry-After
    // when present) and retry instead of failing the file.
    if ((resp.status === 429 || resp.status === 503) && attempt < FETCH_RETRIES) {
      const ra = parseInt(resp.headers.get('retry-after'), 10);
      await sleep(Number.isFinite(ra) ? Math.min(ra * 1000, 10000) : 800 * (attempt + 1));
      continue;
    }
    return resp;
  }
}

// Ground truth the app controls: how many audio files are stored right now.
// Now backed by audioStore.count() (cheap; IDB maintains the count) — the old
// O(files) Cache Storage scan is gone.
export async function audioFileCount() {
  const t0 = now();
  let n = null;
  try { n = await audioStore.count(); }
  catch (_) {
    await sleep(400);
    try { n = await audioStore.count(); } catch (_) { n = null; }
  }
  recordScan('audioFileCount', now() - t0, n);
  if (n != null) setCount(n);       // keep the persisted counter in sync
  return n;
}

// Refresh the exact count off the paint path, after a download settles.
function scheduleCountRefresh() { idle(() => { audioFileCount(); }); }

// Diagnostic (surfaced by ?debug OR the seven-tap toggle in Settings). Now
// reports IDB stats (store count, migration done flag, sample keys) plus the
// state of the legacy Cache Storage bucket during the migration window, and
// keeps the estimate. Serialized as-is by "Copy report", so every field is
// JSON-safe.
export async function audioCacheDiagnostic() {
  const out = {
    generatedAt: new Date().toISOString(),
    ua: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    idbCount: null, migrationDone: false, sampleKeys: [],
    cacheNames: [], legacyAudioCacheEntries: null,
    estimate: null, persisted: null
  };
  try {
    out.migrationDone = loadBook().migrationDone;
    try {
      const keys = await audioStore.keys();
      out.idbCount = keys.length;
      out.sampleKeys = keys.slice(0, 10);
    } catch (e) { out.idbError = String(e); }
    if ('caches' in self) {
      out.cacheNames = await caches.keys();
      if (await caches.has(AUDIO_CACHE)) {
        out.legacyAudioCacheEntries = (await (await caches.open(AUDIO_CACHE)).keys()).length;
      }
    }
    if (navigator.storage && navigator.storage.estimate) out.estimate = await navigator.storage.estimate();
    if (navigator.storage && navigator.storage.persisted) out.persisted = await navigator.storage.persisted();
  } catch (e) { out.error = String(e); }
  return out;
}

// Simple promise worker pool over a src list. onOne(src) does the per-file work.
// Throws on abort (AbortError) or offline (TypeError) to stop the whole run.
async function runPool(srcs, onOne, signal) {
  const queue = [...srcs];
  async function worker() {
    while (queue.length) {
      if (signal.aborted) throw abortError();
      const src = queue.shift();
      await onOne(src);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
}
function abortError() { const e = new Error('aborted'); e.name = 'AbortError'; return e; }

// A buffered writer: download workers push { path, blob } and it flushes to IDB
// in PERSIST_BATCH-sized putMany transactions, keeping at most ~one batch of
// blobs in JS memory at a time (critical for the 8.5k-file "Download all").
function makeBufferedWriter() {
  const buffer = [];
  async function flush(all = false) {
    // splice atomically (single-threaded) so concurrent workers can't double-
    // persist the same slice.
    while (buffer.length >= PERSIST_BATCH || (all && buffer.length)) {
      const chunk = buffer.splice(0, PERSIST_BATCH);
      await audioStore.putMany(chunk);
    }
  }
  return {
    add(path, blob) { buffer.push({ path, blob }); },
    maybeFlush() { return buffer.length >= PERSIST_BATCH ? flush(false) : Promise.resolve(); },
    drain() { return flush(true); }
  };
}

// Download (or resume) one pack. force=true (Update) re-fetches every file even
// if already stored (the force path also deletes the pack's keys up front so a
// stale byte can never survive an Update). Resume skips files already in IDB.
export async function downloadPack(packId, { force = false } = {}) {
  // Called straight from click handlers — must never reject (B7).
  let pack;
  try {
    await ensureInit();
    await requestPersistOnce();
    pack = await getPack(packId);
  } catch (_) {
    patch(packId, { error: 'Could not load the audio list — check your connection and retry.' });
    return;
  }
  if (!pack) return;

  const controller = new AbortController();
  controllers[packId] = controller;

  // Update path: drop the pack's stored bytes first, then a normal download
  // repopulates them. Resume path: one keys() read -> skip-if-present set.
  let have;
  if (force) {
    try { await audioStore.deleteMany(pack.srcs); } catch (_) { /* best effort */ }
    have = new Set();
  } else {
    try { have = new Set(await audioStore.keys(`/audio/${packId}/`)); } catch (_) { have = new Set(); }
  }

  const writer = makeBufferedWriter();
  let done = 0;
  const failures = [];
  let offline = false;
  patch(packId, { state: 'downloading', done: 0, total: pack.count, error: null });

  const onOne = async (src) => {
    try {
      if (!force && have.has(src)) { done += 1; patch(packId, { done }); return; }
      const resp = await bulkFetch(src, controller.signal);
      if (resp && resp.ok) {
        const blob = await resp.blob();
        writer.add(src, blob);
        done += 1; patch(packId, { done });
        await writer.maybeFlush();
      } else { failures.push(src); }
    } catch (e) {
      if (e.name === 'AbortError') throw e;   // real user cancel only (bulkFetch converts timeouts)
      if (e instanceof TypeError) { offline = true; controller.abort(); throw abortError(); }
      failures.push(src);   // timeout/other per-file error: record, keep going
    }
  };

  let aborted = false;
  try {
    await runPool(pack.srcs, onOne, controller.signal);
  } catch (e) {
    aborted = true;   // cancel or offline
  } finally {
    try { await writer.drain(); } catch (_) { /* unpersisted files resume-refetch */ }
    delete controllers[packId];
  }

  needsReconcile = true;
  if (offline) {
    patch(packId, { state: done > 0 ? 'partial' : 'none', done, error: 'Connection lost — progress saved.' });
  } else if (aborted) {
    patch(packId, { state: done > 0 ? 'partial' : 'none', done, error: null });
  } else if (failures.length) {
    patch(packId, { state: 'partial', done, error: `${failures.length} file${failures.length > 1 ? 's' : ''} failed — retry to resume.` });
  } else {
    setBookPack(packId, { complete: true, manifestHash: currentHash });
    patch(packId, { state: 'done', done: pack.count, error: null });
  }
  scheduleCountRefresh();   // exact recount off the paint path once files landed
}

// Whole-manifest download with one aggregate progress bar (the 88 MB device
// test). Marks each pack complete as its files land so hub badges catch up.
export async function downloadAll() {
  // Same no-reject contract as downloadPack (B7).
  let packs;
  try {
    await ensureInit();
    await requestPersistOnce();
    packs = await getPacks();
  } catch (_) {
    patch(ALL, { error: 'Could not load the audio list — check your connection and retry.' });
    return;
  }
  const allSrcs = [];
  const packOfSrc = new Map();
  for (const p of packs) for (const s of p.srcs) { allSrcs.push(s); packOfSrc.set(s, p.id); }

  const controller = new AbortController();
  controllers[ALL] = controller;
  // Single upfront keys() read -> O(1) skip-if-present per file (no per-file
  // existence check).
  let have;
  try { have = new Set(await audioStore.keys()); } catch (_) { have = new Set(); }

  const writer = makeBufferedWriter();
  let done = 0;
  const donePerPack = {};
  const failures = [];
  let offline = false;
  patch(ALL, { state: 'downloading', done: 0, total: allSrcs.length, error: null });

  const bumpPack = (src) => {
    const pid = packOfSrc.get(src);
    donePerPack[pid] = (donePerPack[pid] || 0) + 1;
    const p = packs.find(x => x.id === pid);
    if (p && donePerPack[pid] === p.count) {
      setBookPack(pid, { complete: true, manifestHash: currentHash });
      patch(pid, { state: 'done', done: p.count, error: null });
    }
  };

  // Live counter during the run: done is the number of files confirmed present
  // so far (already-stored + fresh fetches), so it can never exceed the progress
  // bar's "done". In-memory only; the exact persisted recount lands on completion.
  const bumpDone = () => { done += 1; audioCount.set(done); };

  const onOne = async (src) => {
    try {
      if (have.has(src)) { bumpDone(); bumpPack(src); patch(ALL, { done }); return; }
      const resp = await bulkFetch(src, controller.signal);
      if (resp && resp.ok) {
        const blob = await resp.blob();
        writer.add(src, blob);
        bumpDone(); bumpPack(src); patch(ALL, { done });
        await writer.maybeFlush();
      } else { failures.push(src); }
    } catch (e) {
      if (e.name === 'AbortError') throw e;   // real user cancel only (bulkFetch converts timeouts)
      if (e instanceof TypeError) { offline = true; controller.abort(); throw abortError(); }
      failures.push(src);
    }
  };

  let aborted = false;
  try {
    await runPool(allSrcs, onOne, controller.signal);
  } catch (e) {
    aborted = true;
  } finally {
    try { await writer.drain(); } catch (_) { /* unpersisted files resume-refetch */ }
    delete controllers[ALL];
  }

  needsReconcile = true;
  if (offline) patch(ALL, { state: 'partial', done, error: 'Connection lost — progress saved.' });
  else if (aborted) patch(ALL, { state: done > 0 ? 'partial' : 'none', done, error: null });
  else if (failures.length) patch(ALL, { state: 'partial', done, error: `${failures.length} files failed — retry to resume.` });
  else patch(ALL, { state: 'done', done: allSrcs.length, error: null });
  scheduleCountRefresh();   // exact persisted recount off the paint path
}

export function cancel(packId) {
  const c = controllers[packId];
  if (c) c.abort();
}
export function cancelAll() { cancel(ALL); }

// Delete every stored audio file and reset all bookkeeping + pack states.
// Belt-and-braces: also delete every legacy audio-named Cache Storage bucket
// (the pre-4.5 'greek-tutor-audio' and any workbox-default duplicate) so no
// stray bytes can keep the browser's usage figure inflated.
export async function clearAllAudio() {
  cancelAll();
  for (const id of Object.keys(controllers)) cancel(id);
  try { await audioStore.clearAll(); } catch (_) { /* ignore */ }
  try {
    if ('caches' in self) {
      const names = await caches.keys();
      // Explicit manifest guard: the manifest must stay reachable offline even
      // if its cache is ever renamed to something containing "audio".
      await Promise.all(names
        .filter(n => isAudioCacheName(n) && n !== MANIFEST_CACHE)
        .map(n => caches.delete(n)));
    }
  } catch (_) { /* ignore */ }
  saveBook({ version: 1, packs: {}, migrationDone: loadBook().migrationDone });
  setCount(0);   // counter drops to 0 immediately, exactly, from any state
  needsReconcile = true;
  try {
    const packs = await getPacks();
    const reset = {};
    for (const p of packs) reset[p.id] = { state: 'none', done: 0, total: p.count, error: null };
    reset[ALL] = { state: 'none', done: 0, total: 0, error: null };
    store.set(reset);
  } catch (_) {
    store.set({});   // manifest unreachable: defaultFor() supplies 'none' states
  }
}

// ---- one-time migration of pre-4.5 installs: Cache Storage -> IndexedDB ----
// Fable's iPhone/iPad hold the full ~8.5k-entry library (plus round-1-era Vary
// duplicates) in the legacy 'greek-tutor-audio' cache. This drains it into IDB
// so Cache Storage becomes tiny and cold start stops scaling with library size.
//
// Discipline: runs DEFERRED after first paint (idle-scheduled from main.js) —
// NEVER on the load/mount path. Chunked (~100 unique URLs: read response ->
// blob -> putMany -> delete those cache entries), yielding between chunks.
// Idempotent + resumable: keys already in IDB are skipped, an interrupted run
// picks up the remaining cache entries next launch. Vary duplicates dedupe
// naturally (same IDB key overwrites), so the migrated count is the DISTINCT
// path count.
//
// KNOWN + ACCEPTED: the FIRST cold start on the upgrade build still pays the old
// large-Cache-Storage bring-up once (it happens before JS; nothing we can do),
// and this scan pays the legacy read cost once in the background. After the
// legacy cache is deleted, cold start is permanently fast. Do not misread the
// first post-deploy launch as a regression.

// Live migration status for Settings ("Optimizing audio storage… n of m").
// null when idle/complete/not-needed.
export const migrationStatus = writable(null);   // { done, total } | null

let migrationPromise = null;
export function migrateAudioToIDB() {
  if (!migrationPromise) migrationPromise = runMigration().catch(() => {});
  return migrationPromise;
}

async function runMigration() {
  if (!('caches' in self)) { markMigrationDone(); return; }
  const book = loadBook();
  if (book.migrationDone) return;

  // No legacy cache -> nothing to migrate; mark done so we never scan again.
  if (!(await caches.has(AUDIO_CACHE))) { markMigrationDone(); return; }
  const cache = await caches.open(AUDIO_CACHE);
  const reqs = await cache.keys();
  if (!reqs.length) { await caches.delete(AUDIO_CACHE); markMigrationDone(); return; }

  // Unique by URL (collapses Vary duplicates: many cache entries, one path).
  const byUrl = new Map();
  for (const req of reqs) if (!byUrl.has(req.url)) byUrl.set(req.url, req);
  const urls = [...byUrl.keys()];

  // Skip paths already in IDB (resume / idempotency) for the READ, but still
  // drain their cache entries below.
  let already;
  try { already = new Set(await audioStore.keys()); } catch (_) { already = new Set(); }

  const total = urls.length;
  let done = 0;
  migrationStatus.set({ done, total });

  const CHUNK = 100;
  for (let i = 0; i < urls.length; i += CHUNK) {
    const slice = urls.slice(i, i + CHUNK);
    const entries = [];
    for (const url of slice) {
      const path = pathOf(url);
      if (already.has(path)) continue;                 // already migrated: skip read
      try {
        const resp = await cache.match(byUrl.get(url), { ignoreVary: true });
        if (resp) { entries.push({ path, blob: await resp.blob() }); already.add(path); }
      } catch (_) { /* one unreadable entry must not sink the run */ }
    }
    try { await audioStore.putMany(entries); } catch (_) { /* retried next launch */ }
    // Drain this slice's cache entries (all Vary copies of each URL).
    for (const url of slice) { try { await cache.delete(url, { ignoreVary: true }); } catch (_) {} }
    done += slice.length;
    migrationStatus.set({ done: Math.min(done, total), total });
    await new Promise(r => setTimeout(r, 0));          // yield between chunks
  }

  await caches.delete(AUDIO_CACHE);
  markMigrationDone();
  migrationStatus.set(null);
  // Refresh the exact count off the paint path now that bytes live in IDB.
  scheduleCountRefresh();
  needsReconcile = true;
}

function markMigrationDone() {
  const book = loadBook();
  book.migrationDone = true;
  saveBook(book);
  migrationStatus.set(null);
}
