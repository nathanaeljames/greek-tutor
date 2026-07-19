// DownloadManager — module singleton owning bulk audio-cache population.
// Downloads survive route changes (state lives here, not in components);
// components only subscribe/unsubscribe. NEVER auto-starts a download: every
// fetch is the result of an explicit user tap (rural data budget).
//
// Cache: the SAME 'greek-tutor-audio' Cache Storage bucket that audio.js's
// play-time warm and the SW runtime route use, so a downloaded file is
// range-sliceable offline by the player with no extra wiring.

import { writable, derived } from 'svelte/store';
import { loadManifest, getPacks, getPack } from './packs.js';
import { AUDIO_CACHE, MANIFEST_CACHE, PROTECTED_CACHES, BULK_FETCH_HEADER, isAudioCacheName } from './cache-config.js';

// Single shared audio bucket (see cache-config.js). DownloadManager, audio.js,
// and the SW route all key on this one name so usage can never double via a
// duplicate cache (A1/B3).
const CACHE_NAME = AUDIO_CACHE;
const BOOK_KEY = 'greek-tutor-downloads-v1';
const ALL = '__all__';               // aggregate pseudo-pack for "Download all"
const CONCURRENCY = 4;

// packId -> { state, done, total, error }
// state: 'none' | 'downloading' | 'partial' | 'done' | 'update'
const store = writable({});
const controllers = {};              // packId -> AbortController
let currentHash = null;
let initPromise = null;
let persistRequested = false;

// ---- audio-file counter: persisted so it renders INSTANTLY (no cache scan on
// mount) --------------------------------------------------------------------
// The "Audio files stored" figure must be trustworthy AND cheap. A full
// cache.keys() scan is O(files) and, on WebKit with the whole ~8.5k-file
// library cached, takes SECONDS on the main thread — that was the app-load
// hang. So we keep the last known count in localStorage and render that
// immediately; the exact ground-truth scan runs later, off the paint path
// (deferred reconcile / explicit retry), and corrects the stored value.
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

// Run heavy cache work AFTER the current frame so it never blocks first paint
// or interaction. requestIdleCallback where available (Chrome, iOS 16.4+),
// else a macrotask.
function idle(fn) {
  if (typeof requestIdleCallback === 'function') requestIdleCallback(() => fn(), { timeout: 2000 });
  else setTimeout(fn, 0);
}

// Cheap pathname of a cache-key URL ("https://host/audio/chapt_1/a.m4a" ->
// "/audio/chapt_1/a.m4a") without constructing a URL object per entry (that
// was ~8.5k allocations on the reconcile hot path). Audio URLs carry no query.
function pathOf(url) { const i = url.indexOf('/audio/'); return i >= 0 ? url.slice(i) : url; }

// Lightweight perf instrumentation so the device pass can see where load time
// goes (desktop cannot reproduce WebKit's large-cache scan cost). Last timing
// is surfaced in the debug card; every scan also logs to the console.
export const lastScan = writable(null);   // { label, ms, entries }
function recordScan(label, ms, entries) {
  const rec = { label, ms: Math.round(ms), entries };
  lastScan.set(rec);
  try { console.log(`[gt-perf] ${label}: ${rec.ms}ms${entries != null ? ` (${entries} entries)` : ''}`); } catch (_) {}
}
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

// ---- localStorage bookkeeping (mirrors progress.js versioned-key pattern) ----
function loadBook() {
  try {
    const raw = localStorage.getItem(BOOK_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && p.version === 1) return { version: 1, packs: p.packs || {} };
    }
  } catch (_) { /* corrupt/unavailable -> start clean */ }
  return { version: 1, packs: {} };
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
      reconcile(packs);   // fire-and-forget cache audit
    })().catch(() => { initPromise = null; });
  }
  return initPromise;
}

// Lazy reconciliation: one cache.keys() pass corrects stale bookkeeping claims
// (e.g. the user cleared Safari storage but our localStorage survived) AND
// refreshes the exact file count. DEFERRED to idle: this is the single
// full-cache scan on the startup path, and running it inline blocked app load
// for seconds once the whole library was cached (the device-pass hang). It
// never gates first paint now — the persisted count renders immediately and
// this corrects it a moment later.
let reconciled = false;
async function reconcile(packs) {
  if (reconciled || !('caches' in self)) return;
  reconciled = true;
  idle(async () => {
    const t0 = now();
    let n;
    try {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      n = new Set(keys.map(r => r.url)).size;
      setCount(n);                                    // exact ground truth, off the paint path
      const have = new Set(keys.map(r => pathOf(r.url)));
      const book = loadBook();
      for (const p of packs) {
        const claimed = book.packs[p.id];
        if (!claimed || !claimed.complete) continue;
        const present = p.srcs.filter(s => have.has(s)).length;
        if (present === p.count) continue;            // claim holds
        if (present === 0) {
          setBookPack(p.id, null);
          patch(p.id, { state: 'none', done: 0 });
        } else {
          patch(p.id, { state: 'partial', done: present });
        }
      }
    } catch (_) { /* best effort */ }
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
// re-read the cache file count exactly when a download/clear lands rather
// than on every per-file tick (P1).
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

// ---- P1: single-writer discipline against Vary-key duplication ----
// The Cache API keys entries by URL *plus* the response's Vary headers, so two
// writers (the SW CacheFirst /audio/ route caches its network response; we
// put() the same URL here) can accumulate one entry per Vary-distinct request
// instead of replacing each other — monotonic storage growth. Every match/
// delete in this module therefore ignores Vary, and every put is preceded by
// an ignoreVary delete: one entry per URL, guaranteed, regardless of what
// Vary header the host serves. The SW route matches with the same option
// (matchOptions in vite.config.js) so playback can never miss-and-refetch a
// "different-vary" copy.
const MATCH_ANY = { ignoreVary: true };
async function putSingle(cache, src, resp) {
  await cache.delete(src, MATCH_ANY);
  await cache.put(src, resp);
}

// Snapshot which URLs the cache already holds, as one keys() pass -> a JS Set
// with O(1) membership. The bulk download loops use this INSTEAD of a per-file
// cache.match(): on WebKit both cache.match and cache.delete scan the cache,
// so the old per-file "match, then delete-before-put" cost ~O(n) EACH and the
// whole Download-all was ~O(n²) — it crawled to a stall near the end once the
// cache was large (the device-pass "halt" that resumed minutes later). One
// upfront snapshot + a plain put() per file makes it O(n).
async function presentPaths(cache) {
  try { return new Set((await cache.keys()).map(r => pathOf(r.url))); }
  catch (_) { return new Set(); }
}

// Bulk fetches are marked so the SW's CacheFirst audio route ignores them
// (single-writer discipline, 4-STORAGE-PASS): without the marker the SW's
// async waitUntil cachePut races putSingle on every downloaded file, and on
// WebKit the loser of the race can land as a SECOND entry for the same URL
// (put honors Vary there — measured; see HANDOFF-4 §8).
const BULK_HEADERS = { [BULK_FETCH_HEADER]: '1' };

// Ground truth the app controls (P1): how many audio files the cache actually
// holds right now. Settings shows this beside the browser's storage estimate,
// which iOS is known to update lazily after deletions.
// Counts DISTINCT URLs, not raw cache entries (4-STORAGE-PASS §3c): on WebKit
// a URL can transiently hold more than one Vary-distinct entry, and "files
// stored" must mean files, not records. Raw entry count stays visible in the
// diagnostic so the two can be compared on device.
export async function audioFileCount() {
  const once = async () => {
    if (!('caches' in self)) return null;
    if (!(await caches.has(CACHE_NAME))) return 0;
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    return new Set(keys.map(r => r.url)).size;
  };
  const t0 = now();
  let n = null;
  try { n = await once(); }
  catch (_) {
    // WebKit's cache backend can fail transiently under write load (the F3
    // dash state). One short retry; then report null and let Settings render
    // an honest "unavailable" with a retry affordance instead of a bare dash.
    await new Promise(r => setTimeout(r, 400));
    try { n = await once(); } catch (_) { n = null; }
  }
  recordScan('audioFileCount', now() - t0, n);
  if (n != null) setCount(n);       // keep the persisted counter in sync
  return n;
}

// Refresh the exact count off the paint path, after a download settles. Cheap
// to schedule; the actual scan runs at idle. Callers that need instant, exact
// feedback (Clear -> 0) call setCount directly instead.
function scheduleCountRefresh() { idle(() => { audioFileCount(); }); }

// Diagnostic (P1, surfaced by ?debug OR the seven-tap toggle in Settings —
// 4-STORAGE-PASS §3a): entry count vs distinct URLs, per-cache counts, summed
// response bytes, Vary histogram, per-URL duplicate keys with their request
// headers and the response's Vary header, a sample entry's response headers
// (captures what the deployed host actually serves), estimate, UA, timestamp.
// Serialized as-is by the "Copy report" button (§3b), so every field must be
// JSON-safe. Per-entry reads are individually guarded: one unreadable record
// (WebKit under load) must not sink the whole report.
export async function audioCacheDiagnostic() {
  const out = {
    generatedAt: new Date().toISOString(),
    ua: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    cacheNames: [], perCacheCounts: {}, entryCount: 0, distinctUrls: 0,
    totalBytes: 0, readErrors: 0, varyHistogram: {}, sampleResponseHeaders: null,
    duplicates: [], duplicatesTotal: 0, estimate: null, persisted: null
  };
  // Cap the per-entry duplicate DETAIL that gets serialized: an affected iOS
  // install had ~3800 duplicated URLs, and dumping every one (with request
  // headers) made the report multiple MB — too big for the clipboard and
  // minutes to paste. duplicatesTotal keeps the true count; the sample proves
  // the mechanism (differing vs identical stored reqHeaders).
  const DUP_DETAIL_CAP = 40;
  try {
    out.cacheNames = await caches.keys();
    for (const n of out.cacheNames) {
      try { out.perCacheCounts[n] = (await (await caches.open(n)).keys()).length; }
      catch (e) { out.perCacheCounts[n] = 'error: ' + e; }
    }
    const cache = await caches.open(CACHE_NAME);
    const reqs = await cache.keys();
    out.entryCount = reqs.length;
    out.distinctUrls = new Set(reqs.map(r => r.url)).size;
    const byUrl = new Map();
    for (const req of reqs) {
      let info;
      try {
        const resp = await cache.match(req);
        const bytes = resp ? (await resp.clone().blob()).size : 0;
        out.totalBytes += bytes;
        const vary = resp ? resp.headers.get('vary') : null;
        out.varyHistogram[String(vary)] = (out.varyHistogram[String(vary)] || 0) + 1;
        if (!out.sampleResponseHeaders && resp) {
          out.sampleResponseHeaders = { url: req.url, headers: Object.fromEntries(resp.headers.entries()) };
        }
        info = { bytes, vary, reqHeaders: Object.fromEntries(req.headers.entries()) };
      } catch (e) {
        out.readErrors += 1;
        info = { error: String(e), reqHeaders: {} };
      }
      if (!byUrl.has(req.url)) byUrl.set(req.url, []);
      byUrl.get(req.url).push(info);
    }
    for (const [url, entries] of byUrl) {
      if (entries.length > 1) {
        out.duplicatesTotal += 1;
        if (out.duplicates.length < DUP_DETAIL_CAP) out.duplicates.push({ url, entries });
      }
    }
    if (navigator.storage && navigator.storage.estimate) out.estimate = await navigator.storage.estimate();
    if (navigator.storage && navigator.storage.persisted) out.persisted = await navigator.storage.persisted();
  } catch (e) { out.error = String(e); }
  return out;
}

// Debug-card recovery tool: collapse every duplicated URL back to a single
// entry (keep one response, ignoreVary-delete all copies, re-put). Run AFTER
// capturing a Copy report — the duplicates ARE the evidence (4-STORAGE-PASS
// §3 "must not mask evidence").
export async function dedupeAudioCache() {
  const out = { scanned: 0, duplicateUrls: 0, removed: 0 };
  try {
    if (!('caches' in self) || !(await caches.has(CACHE_NAME))) return out;
    const cache = await caches.open(CACHE_NAME);
    const reqs = await cache.keys();
    out.scanned = reqs.length;
    const counts = new Map();
    for (const r of reqs) counts.set(r.url, (counts.get(r.url) || 0) + 1);
    for (const [url, n] of counts) {
      if (n < 2) continue;
      out.duplicateUrls += 1;
      const keep = await cache.match(url, MATCH_ANY);
      await cache.delete(url, MATCH_ANY);
      if (keep) await cache.put(url, keep);
      out.removed += n - 1;
    }
  } catch (e) { out.error = String(e); }
  return out;
}

// Simple promise worker pool over a src list. onOne(src) resolves to
// 'done' (fetched/cached), 'skip' (already cached), or 'fail'. Throws on abort
// (AbortError) or offline (TypeError) to stop the whole run.
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

// Download (or resume) one pack. force=true (Update) re-fetches every file even
// if already cached. The app is the SOLE writer of the audio cache (the SW
// route excludes our x-gt-bulk-download requests), so a plain put() replaces
// its own prior entry by URL — no per-file delete is needed for the normal
// path; skipping it is what keeps the loop O(n) on WebKit.
export async function downloadPack(packId, { force = false } = {}) {
  // Called straight from click handlers — must never reject (B7). Manifest
  // fetch failure (e.g. flaky network the online flag missed) becomes an
  // error state on the pack, not an unhandled rejection.
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
  const cache = await caches.open(CACHE_NAME);
  // One keys() snapshot up front instead of a cache.match per file (O(n) vs
  // O(n²) on WebKit). force skips the snapshot: every file is re-fetched.
  const have = force ? new Set() : await presentPaths(cache);

  let done = 0;
  const failures = [];
  let offline = false;
  patch(packId, { state: 'downloading', done: 0, total: pack.count, error: null });

  const onOne = async (src) => {
    try {
      if (!force && have.has(src)) { done += 1; patch(packId, { done }); return; }
      const resp = await fetch(src, { signal: controller.signal, headers: BULK_HEADERS });
      // Sole-writer plain put(): replaces our own prior entry by URL, no
      // per-file delete (see downloadPack header + presentPaths).
      if (resp && resp.ok) { await cache.put(src, resp); done += 1; patch(packId, { done }); }
      else { failures.push(src); }
    } catch (e) {
      if (e.name === 'AbortError') throw e;
      if (e instanceof TypeError) { offline = true; controller.abort(); throw abortError(); }
      failures.push(src);   // other per-file error: record, keep going
    }
  };

  let aborted = false;
  try {
    await runPool(pack.srcs, onOne, controller.signal);
  } catch (e) {
    aborted = true;   // cancel or offline
  } finally {
    delete controllers[packId];
  }

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
  const cache = await caches.open(CACHE_NAME);
  // Single upfront snapshot -> O(n) whole-library download (see presentPaths).
  const have = await presentPaths(cache);

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
  // so far (cache hits + fresh puts), so it can never exceed the progress bar's
  // "done" number (4-STORAGE-PASS §8.5). In-memory only; the exact persisted
  // recount lands on completion.
  const bumpDone = () => { done += 1; audioCount.set(done); };

  const onOne = async (src) => {
    try {
      if (have.has(src)) { bumpDone(); bumpPack(src); patch(ALL, { done }); return; }
      const resp = await fetch(src, { signal: controller.signal, headers: BULK_HEADERS });
      if (resp && resp.ok) { await cache.put(src, resp); bumpDone(); bumpPack(src); patch(ALL, { done }); }
      else { failures.push(src); }
    } catch (e) {
      if (e.name === 'AbortError') throw e;
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
    delete controllers[ALL];
  }

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

// Delete every cached audio file and reset all bookkeeping + pack states.
// Belt-and-braces: deletes EVERY cache whose name matches the audio pattern
// (not just CACHE_NAME) so a stray duplicate can never keep usage inflated,
// then resets bookkeeping. Storage figure refresh: callers re-run
// storageInfo() after this resolves (Settings does).
export async function clearAllAudio() {
  cancelAll();
  for (const id of Object.keys(controllers)) cancel(id);
  try {
    if ('caches' in self) {
      const names = await caches.keys();
      // Explicit manifest guard: the manifest must stay reachable offline even
      // if its cache is ever renamed to something containing "audio" (R3).
      await Promise.all(names
        .filter(n => isAudioCacheName(n) && n !== MANIFEST_CACHE)
        .map(n => caches.delete(n)));
    }
  } catch (_) { /* ignore */ }
  saveBook({ version: 1, packs: {} });
  setCount(0);   // F4: counter drops to 0 immediately, exactly, from any state
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

// One-time startup cleanup for already-deployed installs (the iPhone from
// Phase 4d): if a legacy or workbox-default-named audio cache exists alongside
// the canonical bucket, delete it so its bytes stop inflating storage usage.
// PROTECTED_CACHES (the canonical audio bucket + the manifest cache) are
// asserted safe in code, not by naming convention (R3).
// Ordering invariant: this races SW activation, and that is acceptable ONLY
// because the SW's audio route uses the same canonical AUDIO_CACHE name
// (single-sourced from cache-config.js) — the SW can never be writing into a
// cache this migration deletes. If the SW cache name ever changes, revisit.
export async function migrateLegacyAudioCaches() {
  try {
    if (!('caches' in self)) return;
    const names = await caches.keys();
    const stale = names.filter(n => !PROTECTED_CACHES.includes(n) && isAudioCacheName(n));
    if (stale.length) await Promise.all(stale.map(n => caches.delete(n)));
  } catch (_) { /* best effort: fire-and-forget from main.js must never reject */ }
}
