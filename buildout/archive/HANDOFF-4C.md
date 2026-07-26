# HANDOFF-4C.md — Phase 4c Offline Audio Pack Download Manager: session handoff

Session date: 2026-07-17. Implements 4C-SPEC.md (offline audio pack download
manager + the 4b verification carry-overs) on top of Phase 4b (HANDOFF-4B.md).
Written as the brief for Phase 4d (device testing) and Phase 5 (content
scale-out).

## 0. Data drop-in status (4C-SPEC §0)

The three updated data files (chapt-01.json, lexicon-chapt01.json, intro.json)
were ALREADY present in the working tree as delivered (committed in the 4b unit
`b7d3139` "edits after verification of phase 4b items"). Verified in place:
`spellerTiles` (39-tile inventory), iotaSubscripts rows carry
`exampleGloss`/`exampleAudio`, `c1_ex_pronounce` has `order:"shuffled"`,
`c1_learn_vocab` `instructions` is `""`. **No data edits were needed this
session** — 4c is code-only.

## 1. What was built

### New library modules (src/lib/)
- **packs.js** — the pack model. `loadManifest()` fetches
  `/audio/audio-manifest.json` at runtime (8521 entries, never bundled),
  memoizes `{ hash, entries }`; `hash` = SHA-256 hex (`crypto.subtle`) of the
  raw manifest text. Entries normalize `src` to a leading-slash absolute path
  (`audio/…` → `/audio/…`) so cache keys line up with what audio.js plays and
  the SW route caches. `packIdOf(src)` = first path segment after `audio/`.
  `getPacks()` groups → `[{ id, label, count, srcs[] }]`, sorted in TOC order;
  `getPack(id)`, `getBuiltPacks()` (built content only, from
  `content.getBuiltChapterIds()`), `packLabel(id)` (from toc.json: chapter
  number+title / "Introduction" / special titles; raw id fallback).
  Manifest has **33 packs**: intro(6), chapt_1(120)…chapt_28, vocab(110),
  john(2122), rev_par(1164), rev_voc(438). Full manifest ≈ 8521 files.
- **downloads.js** — the DownloadManager module singleton. `svelte/store`
  writable map `packId → { state, done, total, error }`, state ∈
  `none|downloading|partial|done|update`. Public API: `packState(packId)`
  (derived store; triggers one-time session init on first subscribe),
  `allState()` (aggregate "Download all" pseudo-pack `__all__`),
  `downloadPack(id, {force})`, `downloadAll()`, `cancel(id)`, `cancelAll()`,
  `clearAllAudio()`, `storageInfo()`.
  - Cache: opens the EXISTING `greek-tutor-audio` cache. Per src: skip if
    `cache.match` hits (natural resume), else `fetch` + `cache.put` on ok.
    Concurrency 4 (promise worker pool). `AbortController` per pack for cancel.
    Progress = files completed / total.
  - Failures collected → finish `partial` with a retry hint (re-running resumes
    for free). A `fetch` `TypeError` (offline) aborts the run with
    "Connection lost — progress saved."; cached files are never lost.
  - Bookkeeping: versioned localStorage key `greek-tutor-downloads-v1` →
    `packs: { id: { complete, manifestHash } }` (mirrors progress.js). Instant
    badges from bookkeeping before the manifest loads counts in. **Lazy
    reconciliation**: first `packState` subscription per session runs one
    background `cache.keys()` pass to correct stale claims (0 present → back to
    `none`; some present → `partial`).
  - `navigator.storage.persist()` requested once, on the FIRST user-initiated
    download (never on load); boolean recorded via `persisted()`; never blocks.
  - **Never auto-starts** — every fetch is an explicit tap.
- **Versioning (§5)**: a completed pack stores `manifestHash`. On a later
  session where `loadManifest().hash` differs, its state becomes `update`.
  Update = `downloadPack(id, {force:true})`: deletes each file from the cache
  first (so the SW CacheFirst route misses and re-fetches from network), then
  fetches. Coarse but safe; per-file diffing waits for a manifest pipeline
  change (out of scope).

### New components (src/components/)
- **DownloadControl.svelte** — the compact hub control (4C-SPEC §4.1). Renders
  the five states (none `[Download audio · n files]` / downloading `[bar + nn%
  + Cancel]` / partial `[Resume] + "k of n saved"` / done `✓ Audio available
  offline` / update `[Update audio]`). Disables start/resume when
  `navigator.onLine` is false with the "Connect to the internet to download"
  hint (listens to online/offline events).
- **Settings.svelte** — the `#/settings` Storage & Downloads screen (§4.2):
  Storage (usage/quota from `navigator.storage.estimate()`, human MB/GB;
  persistent-storage status line), Download all (one aggregate bar + "Keep the
  app open until the download finishes."), Downloaded packs (built packs, each
  a `DownloadControl` row with file counts), Clear downloaded audio (reuses the
  4a modal pattern → `clearAllAudio()`). Plain utility screen, no bottom bar.

### Amended files
- **audio.js (§3)** — the play-time cache-into-`greek-tutor-audio` warm is KEPT
  (the no-pack offline fallback; first online play still caches the full file
  for offline range-slicing). NOTE: there was **no on-load bulk `warmCache()`**
  in the tree to remove (an earlier phase had already reduced warming to
  per-play); the comment now states the download manager owns bulk population.
  No API change.
- **content.js** — added `getBuiltChapterIds()` (drives which packs surface on
  hubs; `['intro','chapt_1']` today).
- **ContentAudio.svelte** —
  - §0.1 Learn Iota Subscripts (`c1_learn_iota_subscripts`): now renders the
    diphthong-style rows (subscript vowel / sound / example / gloss); tile tap
    plays `row.audio` (aii/eii/oii), EXAMPLE tap plays `row.exampleAudio`
    (skotia/arxei/autoi). All three examples tappable.
  - §0.3 shuffle: activities flagged `order:"shuffled"` (Pronounce Letters) get
    a fresh Fisher-Yates shuffle (via `content.shuffle`) keyed on `activity.id`
    — reshuffles on entry/rail-next, stable within a page, and resets `idx`.
    Non-shuffled activities keep the original `resolveItems` order.
- **SpellActivity.svelte (§0.2)** — the tile keyboard is now data-driven from
  `activity.spellerTiles` (25 letters incl. final ς + 11 diacritic marks + 3
  composites = **39 tiles**, rough+grave present). Each diacritic tile appends
  its `apply` combining sequence then NFC-normalizes (same mechanics as 4b, now
  data-driven). The old hardcoded arrays remain only as a defensive fallback.
  With Accents / grading behavior untouched.
- **App.svelte** — `#/settings` route; `Settings` render; `DownloadControl` in
  the wide hub pane; passes `showSettings` to TopBar; screen title
  "Storage & Downloads".
- **TopBar.svelte** — gear icon in the reserved right slot on the TOC screen
  only → `#/settings` (NAV-SPEC 2.1 slot). Hub/activity screens keep the TOC
  icon; no change there.
- **UnitMap.svelte** — `DownloadControl` under the hub progress line (hub
  variant only, not the sidebar).
- **vite.config.js (§6)** — added a **NetworkFirst** runtime route for
  `/audio/audio-manifest.json` (cache `greek-tutor-manifest`), registered
  BEFORE the CacheFirst `/audio/` route so it wins that one path. This keeps the
  manifest reachable offline (Settings/badges) while still picking up changes
  online so packs can flag `update`. Precache stays app-shell only; audio is
  NOT precached.
- **app.css** — a "Phase 4c" block: `.btn.small`, the hub `.dl-*` control
  styles, and the Settings screen (`.settings-*`, `.pack-row`).

## 2. Verification status (against 4C-SPEC §8)

Verified this session — production build (`npm run build`, **57 modules, clean,
no warnings**) driven in headless Chrome against the real 848 KB manifest over
`vite preview`:

- [x] Build clean; manifest (200, 848849 B) and a sample audio file
      (`/audio/chapt_1/a_alpha.m4a`, 200) reachable over preview.
- [x] SW: generated `sw.js` registers the manifest **NetworkFirst** route
      before the audio **CacheFirst** route; manifest is **not** in the
      precache array (precache 9 entries / 195 KiB, app-shell only).
- [x] §0.1 Iota Subscripts: 3 rows, 3 tappable examples, glosses render
      (darkness/beginning/him).
- [x] §0.2 Speller: exactly **39** `.tk-key` tiles; the rough+grave tile is
      present (`title="rough + grave"`).
- [x] §0.3 Pronounce Letters renders as the selfCheckStepper (Check Answer /
      Next Letter).
- [x] §0.4 Learn Vocabulary: the blank `instructions` renders nothing (the only
      `.instructions` node on the page is the flashcard's own "Click Next to
      begin.").
- [x] Gear icon on the TOC screen only (absent on the chapter hub); `#/settings`
      renders all four sections; the whole download path executes in-browser —
      built-pack rows resolve labels ("Introduction", "1. Alphabet") and
      async file counts (intro **6**, chapt_1 **120**), proving
      loadManifest → SHA-256 → getPacks → packState all run.
- [x] Hub download control shows "Download audio · 120 files" (chapt_1) and
      mounts on the intro hub too.

**NOT verified this session — needs a real device / interactive browser
(Playwright not installed; headless dump-dom can't click-drive the cache/SW).
These feed Phase 4d:**
- [ ] Actual pack download: progress advances, Cancel stops, re-tap resumes
      with cached files skipped (the fetch+cache.put loop, worker pool, abort).
- [ ] Airplane mode after downloading chapt_1: full chapter 1 walk with audio
      everywhere, incl. a never-before-played file.
- [ ] Settings: `estimate()` + persist status on device; "Download all" runs
      the whole manifest (the ~88 MB storage test); Clear empties the cache and
      flips every hub badge back to Download.
- [ ] `update` flip: edit one byte of the deployed
      `audio/audio-manifest.json` → packs show `Update audio` → Update
      re-fetches (delete-then-fetch bypasses the SW CacheFirst copy).
- [ ] Bookkeeping across a real app reload + lazy reconciliation after clearing
      Safari site data.

## 3. Svelte 4 gotchas honored (carried from 4A/4B §3)
- Template expressions read reactive vars directly; `packState`/`allState`
  return `$`-auto-subscribed stores; helpers take reactive values as args.
- The shuffled-items block keys on `activity.id` (not a bare `onMount`) so it
  survives ContentAudio being reused across rail navigation without reshuffling
  on incidental reactive re-runs.
- Download state is module-level in downloads.js (invisible to Svelte's
  reactivity) — components observe it only through the derived stores, so
  in-progress downloads survive route changes and re-mounts.

## 4. Key decisions / notes for the next session
- **Cache-key normalization**: everything (audio.js play, SW route, download
  manager, reconcile) keys on the absolute `/audio/…` pathname. If audio ever
  moves off-root or gains query params, revisit `packs.normSrc` and the SW
  `urlPattern`.
- **Force-update relies on delete-then-fetch** because `fetch()` from the page
  is intercepted by the SW CacheFirst route and would otherwise return the
  stale cached copy. Deleting the entry first makes CacheFirst miss → network.
- **Download all** updates the aggregate bar plus flips each pack's badge to
  `done` as its last file lands; on iOS keep the app foregrounded (backgrounded
  PWAs get suspended — the warning line says so).
- **Manifest cache** is a separate bucket (`greek-tutor-manifest`); `Clear
  downloaded audio` only deletes `greek-tutor-audio`, so the manifest stays
  available offline after a clear.

## 5. Device-test notes (Phase 4d — user actions)
- After the Netlify deploy, close & reopen the installed PWA (possibly twice)
  so the autoUpdate SW takes over before testing.
- Record on the iPhone: `estimate()` before/after "Download all"; the
  `persist()` result; whether the ~88 MB cache survives several days of normal
  phone use (the last storage unknown before Phase 5 scale-out).

## 6. Housekeeping
- New files: src/lib/packs.js, src/lib/downloads.js,
  src/components/DownloadControl.svelte, src/components/Settings.svelte,
  this file. Modified: App.svelte, app.css, ContentAudio, SpellActivity,
  TopBar, UnitMap, lib/audio.js, lib/content.js, vite.config.js. Suggest
  committing as the Phase 4c unit.
- No new runtime dependencies added. Phase 4a's standing suggestion to add
  `playwright-core` as a devDependency still stands — it would make the §2
  "not verified" items (download/offline/reconciliation) repeatable in CI.
