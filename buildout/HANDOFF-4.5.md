# HANDOFF-4.5.md — Phase 4.5: audio storage moved to IndexedDB

Implements buildout/4.5-SPEC.md. Base commit ba5d0d4. Audio bytes now live
in IndexedDB as Blobs and play through Blob object URLs; Cache Storage holds
ONLY the app shell (~15 precache files) + the manifest cache. Cold start no
longer scales with audio-library size — the service worker is entirely out of
the audio path (no `/audio/` runtime route, no `rangeRequests`, no Range
anywhere).

## What changed, per module

**src/lib/audio-store.js (NEW) — the single IndexedDB access point.**
Nothing else in the codebase opens the DB. DB `greek-tutor`, object store
`audio`, keys = the same absolute paths used everywhere
(`/audio/chapt_1/a_alpha.m4a`), values = Blobs stored as-is (no ArrayBuffer
copy). API (all promise-based, lazy DB open on first call): `getBlob(path)`,
`has(path)`, `putMany(entries)` (batched ~100/txn), `deleteMany(paths)`,
`clearAll()`, `count()`, `keys(prefix?)`. Uses the `idb` wrapper (see
Dependency below). One footgun to remember: idb's shorthands
(`count`/`getKey`/…) return Promises — the batched-put transaction must stay a
tight synchronous burst of `store.put()` before `await tx.done`, and every
call site must `await` the result (a missing await on `count()` silently
compares a Promise, caught in verification — see below).

**vite.config.js — SW reduced to shell + manifest.** Removed the CacheFirst
`/audio/` runtime route and the `rangeRequests: true` plugin usage entirely.
The manifest NetworkFirst route is unchanged (still the ONLY runtime route).
Precache is shell-only (confirmed: 15 entries, no `.m4a`). Dropped the
`AUDIO_CACHE` import here (no longer referenced in the build).

**src/lib/cache-config.js — trimmed.** Removed `BULK_FETCH_HEADER`
(`x-gt-bulk-download`) and `PROTECTED_CACHES` — both existed only for the
now-deleted SW-exclusion / legacy-sweep logic. `AUDIO_CACHE` stays but is now
documented as the LEGACY pre-4.5 bucket name (the migration and clear paths
find and delete it; nothing writes it). `MANIFEST_CACHE` and
`isAudioCacheName` stay.

**src/lib/audio.js — playback via object URLs.** `play(id)` resolves the path,
then: (1) IDB hit → `createObjectURL(blob)`, play; (2) IDB miss + online →
one hard-timeout `fetch`, `putMany([entry])`, then play (preserves the pre-4.5
"first play while online caches for offline" parity exactly); (3) IDB miss +
offline/failed → toast. At most one live object URL is kept: it is revoked on
`ended`, on `stop()`, and before creating the next one (no leaks). A `playToken`
bumped by every `play()`/`stop()` makes stale async resolutions (a rapid second
tap, or a route-change stop during the IDB read/network await) bail silently —
this preserves the toast contract (toast IFF the user gets no audio; AbortError
and superseded-element cases stay silent). The `warmCache` helper and all
`caches` usage are gone from this module.

**src/lib/downloads.js — writes to IDB, migration added.**
- `bulkFetch()` keeps the load-bearing 25s timeout + 2 retries + 429/503
  backoff; dropped the `x-gt-bulk-download` header (single-writer is now
  structural — nothing but this module writes audio bytes anywhere).
- Downloads buffer fetched Blobs and flush to `audioStore.putMany` in
  100-entry transactions (a small buffered writer keeps at most ~one batch of
  Blobs in JS memory across an 8.5k-file "Download all"). Resume reads one
  `audioStore.keys(prefix)` snapshot instead of a Cache Storage `keys()` scan;
  skip-if-present semantics unchanged.
- `downloadPack(force:true)` (Update) now `deleteMany(pack.srcs)` first, then a
  normal download — no stale byte can survive an Update.
- `clearAllAudio()` = `audioStore.clearAll()` + bookkeeping reset + belt-and-
  braces delete of every legacy audio-named Cache Storage bucket (the pre-4.5
  `greek-tutor-audio` and any workbox-default duplicate), leaving the manifest
  cache untouched. Counter drops to 0 immediately and exactly.
- `audioFileCount()` and `reconcileAudioCache()` are now backed by
  `audioStore.count()` / `keys()` — effectively instant. Directive 10 still
  stands: NOTHING on the load/mount path enumerates the store; the persisted
  `audioCount` localStorage counter renders instantly and reconciliation stays
  Settings-only.
- `audioCacheDiagnostic()` rewritten to report IDB stats (store count,
  migration done flag, sample keys) plus the state of the legacy Cache Storage
  bucket during the migration window; KEEPS the cold-start metric
  (`startupReport()`) — that is the phase-4.5 acceptance instrument. The old
  Vary/duplicate diagnostic and `dedupeAudioCache()` are gone (IndexedDB has no
  Vary axis, so same-path duplicates cannot arise).
- `migrateAudioToIDB()` (NEW) — the one-time migration; see below.

**src/main.js — deferred migration.** The idle-scheduled startup hook now calls
`migrateAudioToIDB()` (replacing the old `migrateLegacyAudioCaches()`), still
off the first-paint path via `requestIdleCallback`/timeout.

**src/components/Settings.svelte — UI.** Storage card shows a one-line
migration status while it runs ("Optimizing audio storage… n of m", from the
new `migrationStatus` store). Diagnostic card renamed "Storage diagnostic",
now shows IDB count / migration-done / legacy-cache-entries / sample keys and
keeps the cold-start line; the Copy report + textarea fallback are unchanged.
Removed the dedupe button and all Vary/duplicate rows.

**package.json** — declared `idb ^7.1.1` under `dependencies` (it was already
present in `node_modules` but undeclared).

## Migration design (as built)

Runs deferred after first paint (idle-scheduled from main.js), NEVER on the
load/mount path. `migrateAudioToIDB()` is memoized (one run per page load) and
its promise-returning body:

1. No `caches` / already-done flag / no legacy `greek-tutor-audio` cache →
   mark done and return (idempotent; never scans again once done).
2. Read the legacy cache's request keys; collapse to unique-by-URL (many Vary
   entries → one path). Load the set of keys already in IDB (resume skips them
   for the read).
3. Chunk the unique URLs by 100: read each response → Blob → collect → one
   `putMany` per chunk; then delete that chunk's cache entries (all Vary copies
   of each URL, `ignoreVary`); update `migrationStatus`; `yield` (setTimeout 0)
   between chunks.
4. On completion: `caches.delete('greek-tutor-audio')`, set the `migrationDone`
   flag in the downloads bookkeeping, clear `migrationStatus`, refresh
   `audioCount` off the paint path.

Idempotent + resumable: keys already in IDB are skipped, and an interrupted run
picks up the remaining cache entries next launch (the flag is only set after
the legacy cache is fully drained and deleted). Vary duplicates dedupe naturally
(same IDB key overwrites), so the migrated count is the DISTINCT path count —
which is what finally makes the iOS file count exact and stable.

## §1 grep assertion (SW fully out of the audio path)

`play()` in audio.js is the sole audio choke point. Grepping `src` for `/audio/`
as an actual URL/path (not a comment): it appears only in **audio.js**
(`audioPath` builds the path; the miss-path `fetch`), **downloads.js**
(`pathOf` for the legacy-cache migration; the `keys('/audio/<pack>/')` prefix),
and **packs.js** (`normSrc` normalizing manifest srcs). No Svelte component,
and nothing else, builds an `/audio/` URL, opens the audio DB, constructs
`new Audio('/audio/…')`, or calls `caches.match`/`fetch` on `/audio/`. Verified
by grep over `src/components` + `src/App.svelte` (zero `new Audio` / `caches.match`
/ `fetch(` hits on the audio path).

## Chrome verification (automated)

Two drivers (playwright-core against Chrome, iPhone UA), in the session
scratchpad. `verify.js` imports the REAL reworked modules into the dev-server
page and calls their exported functions directly (faithful — tests the code,
not the UI); `smoke.js` drives the built preview UI. **All checks pass.**

Build: `npm run build` clean; generated `sw.js` has NO `/audio/` runtime route
(only the manifest NetworkFirst), no `rangeRequests`, no `CacheFirst`, no `.m4a`
in precache; precache = 15 shell entries.

`verify.js` (28 checks, ALL PASS):
- audio-store round trip: putMany/getBlob(Blob, same size)/has (true/false)/
  keys+prefix/deleteMany/clearAll all correct.
- Cycle exactness: download chapt_1 → **120**; all 120 keyed under
  `/audio/chapt_1/`; clear → **0**; re-download → **120** (exact, stable).
- Cancel mid-run (fetch throttled so cancel lands): partial=100 stored; resume
  → 120, refetching only the 20 missing files (skip-if-present holds — 0 stored
  files re-fetched).
- Play-time parity + toast contract: online miss returns true and stores the
  file for offline, no toast; offline HIT plays from IDB with no fetch and no
  toast; offline never-fetched MISS returns false and toasts (and ONLY then).
- Real Blob object-URL playback (no stub) resolves with no toast.
- Update flow: `force` re-fetches all 120 and count stays exactly 120; and a
  wrong stored `manifestHash` derives pack state `update` on init.
- Migration: seed the legacy `greek-tutor-audio` cache the old way (full 120-file
  chapt_1 pack via `cache.put`, >1 chunk, + a deliberate duplicate put), reload
  so the deployed deferred-migration path runs → IDB holds the **distinct** 120,
  legacy cache **deleted**, done flag set, migrated value is a real Blob;
  re-run is a no-op.
- No console/page errors.

`smoke.js` (built preview UI, ALL PASS): app boots, SW registers, Settings
renders (Storage heading, files-stored row, Download-all, chapt_1 pack control),
`?debug` diagnostic card shows the IDB / migration-done rows and the cold-start
line.

Note: Chrome's `cache.put` REPLACES by URL, so it cannot reproduce WebKit's
Vary-append (the round-1 duplicate mechanism). The migration's dedupe is instead
structural — the same IDB key overwrites regardless — which the test asserts via
the distinct-count landing exact. The WebKit-specific behavior is a device-only
observation.

One bug was caught and fixed during verification: `audio-store.has()` originally
did `(await db()).count(STORE, path) > 0` — the inner `count()` returns a Promise,
so the comparison was always false (and the first draft's `getKey(...) !==
undefined` was always true for the same reason). Now double-awaited. `has()` is
not on any app hot path, but the fix stands.

## Device checklist for Fable (brief)

1. **Cold-start metric, before/after** (the acceptance test): open Settings →
   seven-tap "Storage" → read the "Cold start (ms since nav)" line. With the
   full library still in the legacy cache on the FIRST launch of the upgrade
   build, expect resp-start ~4s (see caveat). After the background migration
   completes and the legacy cache is deleted, relaunch cold: expect resp-start
   well under 1s, and it must NOT grow as more audio is stored.
2. **Airplane-mode walk** with the chapt_1 pack downloaded: audio everywhere,
   including a page you never opened online.
3. **File count exact and STABLE across visits** — IDB count is authoritative;
   the residual F1–F3 count weirdness should be gone for good.
4. **Download All** exercises the timeout/backoff path end to end (unchanged
   logic).
5. Watch the one-line "Optimizing audio storage… n of m" in Settings during the
   first post-upgrade session; confirm it disappears and the legacy audio cache
   is gone from the diagnostic's "Caches" line afterward.

## First-launch-after-upgrade caveat (do not misread as a regression)

The FIRST cold start on the upgrade build still pays the old large-Cache-Storage
bring-up ONCE — that cost happens before any JS runs, so nothing we ship can
remove it — and the migration then pays the legacy-cache read cost once, in the
background. After the migration deletes `greek-tutor-audio`, cold start is
permanently fast and size-independent. Judge the metric on the SECOND cold
launch after the upgrade, once migration has completed.

## Out of scope (unchanged from spec §7)

Progress backend → IndexedDB (phase 6; will reuse this `idb` dependency and the
audio-store patterns, touches progress.js only). B5 lazy chapter-chunk loading
(phase 5; JS chunks, unrelated). Chapters 2+ content.
