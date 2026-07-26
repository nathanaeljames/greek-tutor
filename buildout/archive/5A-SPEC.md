# 5A-SPEC.md — B5 lazy chapter loading (phase 5, pass A)

Input handoff: HANDOFF-4.5.md (current shipped state) + HANDOFF-4.md
section on the B5 audit experiment (proven, reverted). Output expected
back: HANDOFF-5A.md. This spec lands ALONE, before any chapter 2
content, so that any regression is attributable to the loader change
and nothing else. Chapter 2 wiring arrives in 5B only after 5A passes
its verification gate (VERIFY-5A.md).

## 1. Objective

Convert chapter content from static imports compiled into the main
bundle to per-chapter lazy chunks, so cold-start JS cost stays constant
as chapters 2-28 land. This implements the migration plan already
recorded in HANDOFF-4.md B5, with the same shape: sync getters over a
loaded-chapters registry, one async load awaited at the route level.

## 2. Evidence base (do not re-derive)

- The audit experiment PROVED: an import.meta.glob dynamic import of
  chapt-01.json emits assets/chapt-01-<hash>.js as its own chunk and
  vite-plugin-pwa precaches it (precache 15 -> 16, chunk present in
  precacheAndRoute in built sw.js). Offline stays intact with zero
  config changes.
- TRAP (discovered then): the glob map must be reachable from executed
  code. An unused export is tree-shaken and NO chunk is emitted,
  silently. The first experiment produced nothing this way.
- Known call sites above/beside the getters (from the audit):
  App.svelte (getChapter/getActivity in reactive statements), UnitMap,
  BottomBar, SequentialRail (getSequencePosition), EndOfChapterDialog
  (getSequence/getNextChapter), ActivityHost, progress.js
  (getChapter/getSequence), packs.js (getBuiltChapterIds).
- DIAGNOSE FIRST: before writing code, read the current content.js and
  confirm the actual getter inventory and call sites against the list
  above; the list is from the 2026-07-18 audit and the storage-pass
  rounds touched neighboring files since. Note any drift in
  HANDOFF-5A.md.

## 3. Design contract

STATIC (stay in the main bundle):
- toc.json — TOC availability and chapter titles must never require a
  chunk load.
- intro.json — small, special-cased, one-off; not worth the ripple.

LAZY (per-chapter chunks):
- src/data/chapt-*.json and their per-chapter lexicon files
  (lexicon-chapt01.json today; lexicon-chapt-XX.json pattern for 2+).
  A chapter and its lexicon load together in one loadChapter(id) —
  flashcard/reviewVocab lookups must never race a separately-loading
  lexicon.

REGISTRY + GETTERS:
- A module-level loaded-chapters registry (id -> {chapter, lexicon}).
- Every existing getter keeps its CURRENT synchronous signature and
  reads from the registry. Callers below the route gate do not change.
- getBuiltChapterIds() must answer WITHOUT loading any chunk: derive
  the id list from the glob's key paths (available synchronously).
  packs.js and the TOC depend on this being cheap.
- A getter hit on an unloaded chapter is a programming error under the
  route gate; make it loud (console.error with the id), not a silent
  undefined.

loadChapter(id):
- async; dynamic-imports the chapter + lexicon modules into the
  registry; idempotent; memoizes its in-flight promise per id.
- On failure, RESET the memo so a retry can succeed — same lesson as
  the getPacks() rejected-promise-memoized-forever bug fixed in B7.
  Failure surface: a visible error state on the route (see gate), not
  an unhandled rejection.

ROUTE GATE:
- App awaits the current route's loadChapter(id) once, before
  rendering the hub/activity subtree for that chapter. Everything
  below stays sync. Intro/TOC/Settings routes gate on nothing.
- Loading state: minimal and unobtrusive (chunks are local and
  precached; the await should resolve in single-digit ms). No spinner
  flash on the happy path — only show a loading indicator if the
  promise is genuinely slow (e.g. mount it after ~150ms).
- Failure state: a plain message with a retry action. NO DEAD-END
  (standing directive 7): the sequential rail / navigation must still
  offer a way out (TOC).

TREE-SHAKE GUARD:
- The glob map must be referenced from executed code (the registry
  module's top level is fine). Add a build-time assertion to the
  acceptance run: the built dist must contain a chapt-01 chunk file,
  and the check fails the pass if it does not.

## 4. Out of scope — do not touch

- Audio path: audio-store.js, downloads.js, the service worker, any
  cache. 4.5's architecture is frozen; the sole-writer and
  no-scan-on-load rules stand (standing directive 10).
- Chapter 2 content, new modes, data files. That is 5B.
- progress.js backend (phase 6). Only its content.js *reads* may adapt
  if the diagnose-first pass shows they sit above the route gate.
- No refactoring of working code beyond the minimum ripple the
  registry conversion requires.

## 5. Acceptance checklist (run before writing HANDOFF-5A.md)

Build shape:
- [ ] npm run build emits assets/chapt-01-<hash>.js as its own chunk.
- [ ] chapt-01 content is ABSENT from the main bundle (grep dist
      assets for a distinctive chapter-1 string, e.g. a Greek word or
      "objectivesPreamble" content, and confirm it appears only in the
      chapter chunk).
- [ ] Built sw.js precacheAndRoute includes the chapter chunk; total
      precache entry count recorded in the handoff.

Behavior (vite preview + the usual headless-Chrome CDP driver):
- [ ] Full 26-item chapter 1 sequential rail walk, 0 console errors.
- [ ] Direct-load AND refresh on every route shape: toc, settings,
      hub, hub+section, activity, intro variants.
- [ ] Hard-offline regression: SW installed, go offline, repeat the
      full rail walk + a refresh on an activity route.
- [ ] Progress/resume: visited/completed indicators and resume points
      behave identically pre/post conversion.
- [ ] Settings pack list still renders (getBuiltChapterIds path).
- [ ] Simulated chunk-load failure (block the chunk URL in the driver)
      shows the failure state with a working TOC escape, and a retry
      succeeds after unblocking (memo reset proven).

## 6. Handoff requirements

HANDOFF-5A.md must record: any drift found in the diagnose-first pass,
the final getter/call-site inventory, precache entry counts before and
after, and the acceptance run results. Flag anything that surprised
you; do not silently absorb it.
