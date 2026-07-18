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
import { AUDIO_CACHE, isAudioCacheName } from './cache-config.js';

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
// (e.g. the user cleared Safari storage but our localStorage survived).
let reconciled = false;
async function reconcile(packs) {
  if (reconciled || !('caches' in self)) return;
  reconciled = true;
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    const have = new Set(keys.map(r => new URL(r.url).pathname));
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
  } catch (_) { /* best effort */ }
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
// if cached, by deleting each entry first so the SW CacheFirst route misses and
// goes to the network.
export async function downloadPack(packId, { force = false } = {}) {
  await ensureInit();
  await requestPersistOnce();
  const pack = await getPack(packId);
  if (!pack) return;

  const controller = new AbortController();
  controllers[packId] = controller;
  const cache = await caches.open(CACHE_NAME);

  let done = 0;
  const failures = [];
  let offline = false;
  patch(packId, { state: 'downloading', done: 0, total: pack.count, error: null });

  const onOne = async (src) => {
    try {
      if (!force) {
        const hit = await cache.match(src);
        if (hit) { done += 1; patch(packId, { done }); return; }
      } else {
        await cache.delete(src);
      }
      const resp = await fetch(src, { signal: controller.signal });
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
}

// Whole-manifest download with one aggregate progress bar (the 88 MB device
// test). Marks each pack complete as its files land so hub badges catch up.
export async function downloadAll() {
  await ensureInit();
  await requestPersistOnce();
  const packs = await getPacks();
  const allSrcs = [];
  const packOfSrc = new Map();
  for (const p of packs) for (const s of p.srcs) { allSrcs.push(s); packOfSrc.set(s, p.id); }

  const controller = new AbortController();
  controllers[ALL] = controller;
  const cache = await caches.open(CACHE_NAME);

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

  const onOne = async (src) => {
    try {
      const hit = await cache.match(src);
      if (hit) { done += 1; bumpPack(src); patch(ALL, { done }); return; }
      const resp = await fetch(src, { signal: controller.signal });
      if (resp && resp.ok) { await cache.put(src, resp); done += 1; bumpPack(src); patch(ALL, { done }); }
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
      await Promise.all(names.filter(isAudioCacheName).map(n => caches.delete(n)));
    }
  } catch (_) { /* ignore */ }
  saveBook({ version: 1, packs: {} });
  const packs = await getPacks();
  const reset = {};
  for (const p of packs) reset[p.id] = { state: 'none', done: 0, total: p.count, error: null };
  reset[ALL] = { state: 'none', done: 0, total: 0, error: null };
  store.set(reset);
}

// One-time startup cleanup for already-deployed installs (the iPhone from
// Phase 4d): if a legacy or workbox-default-named audio cache exists alongside
// the canonical bucket, delete it so its bytes stop inflating storage usage.
// Never touches CACHE_NAME (the live bucket) or the manifest cache.
export async function migrateLegacyAudioCaches() {
  try {
    if (!('caches' in self)) return;
    const names = await caches.keys();
    const stale = names.filter(n => n !== CACHE_NAME && isAudioCacheName(n));
    if (stale.length) await Promise.all(stale.map(n => caches.delete(n)));
  } catch (_) { /* best effort */ }
}
