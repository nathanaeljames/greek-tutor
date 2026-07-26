# HANDOFF-5A.md — B5 lazy chapter loading (phase 5, pass A)

Input: 5A-SPEC.md, HANDOFF-4.5.md, HANDOFF-4 §B5. Lands ALONE before any
chapter-2 content so any regression is attributable to the loader change.
Gate: VERIFY-5A.md (device pass, human-in-the-loop) before 5B.

## 1. What shipped

Chapter content moved from static imports compiled into the main bundle to
per-chapter lazy chunks. `toc.json` and `intro.json` stay STATIC. A
module-level loaded-chapters registry (`id -> {chapter, lexicon}`) backs every
existing getter; the getters keep their synchronous signatures. `loadChapter(id)`
is awaited ONCE at the App route gate; everything below the gate stays sync.

Files touched:
- `src/lib/content.js` — registry + glob loaders + `loadChapter`/`isChapterLoaded`;
  `getChapter`/`isChapterAvailable`/`getBuiltChapterIds`/`getLemma`/`getReadingLists`
  rewired to the registry/glob.
- `src/App.svelte` — route gate (`gateRoute`), loading/error UI, `loaded`-gated
  reactive reads, `retryLoad`.
- `src/components/EndOfChapterDialog.svelte` — `toNextChapter` awaits the next
  chapter's chunk before reading its sequence.
- `src/components/ReadingCategories.svelte` — passes `chapter.id` to
  `getReadingLists`.
- `scripts/check-lazy-chunk.mjs` + `package.json` — build-time tree-shake guard
  (`npm run verify` = build + assertion).

## 2. Diagnose-first pass — drift from the 5A-SPEC audit list

The spec's call-site list was from the 2026-07-18 audit; the storage-pass rounds
had touched neighboring files. Actual state confirmed by grepping every
`content.js` importer:

- **`isChapterAvailable` was availability-by-loaded** (`id in chapters`). Under
  lazy loading that would report a built-but-unloaded chapter as UNAVAILABLE,
  breaking the TOC (ChapterNav) and `getNextChapter`. Fixed: availability now
  answers from the glob key set (built files) + intro, WITHOUT a load. Same for
  `getBuiltChapterIds` (glob keys, cheap — packs.js/Settings depend on it).
- **App.svelte also calls `sectionOfActivity`** (not just getChapter/getActivity)
  — in `computeExpansion` and the `activeSection` reactive. Both are above the
  gate and now guarded by `loaded`/`isChapterLoaded`.
- **`getReadingLists` / ReadingCategories** were NOT in the audit list. Reading
  lists live in the per-chapter lexicon, so `getReadingLists` now takes an
  optional `chapterId` and ReadingCategories passes `chapter.id` (reading-list
  keys repeat across chapters, so a no-arg merge would resolve the wrong
  chapter once 2+ are loaded).
- **`EndOfChapterDialog.toNextChapter`** reads `getSequence(next.id)` for a
  chapter that is NOT loaded yet. The intro→chapter-1 "Next chapter" button hits
  this. It now `await loadChapter(next.id)` first (idempotent; the gate awaits
  the same memoized promise). In 5A no real chapter is ever "next+available"
  except intro→ch1, but this path is now correct for 5B.

Everything else matched the audit: UnitMap, BottomBar, SequentialRail,
ActivityHost, progress.js, packs.js sit where the spec said.

## 3. Final getter / call-site inventory

Registry-backed getters (all sync, unchanged signatures except getReadingLists'
new optional arg): `getToc`, `getBuiltChapterIds`, `getChapter`,
`isChapterAvailable`, `getLemma`, `getReadingLists(chapterId?)`, `getActivity`,
`findChapterIdOfActivity`, `sectionOfActivity`, `getSequence`,
`getSequencePosition`, `getNextChapter`, `resolveItems`, `buildSelectQuestions`,
`shuffle`, `randomFeedback`, `SECTIONS`. New async/sync helpers: `loadChapter(id)`,
`isChapterLoaded(id)`.

Call sites (importer → symbols): App.svelte (getChapter, getActivity,
sectionOfActivity, SECTIONS, **loadChapter, isChapterLoaded, isChapterAvailable**);
UnitMap (getChapter, SECTIONS); ReadingCategories (getReadingLists);
ContentAudio (resolveItems, shuffle); ChapterNav (getToc, isChapterAvailable);
SpellActivity (getLemma, randomFeedback); EndOfChapterDialog (getChapter,
getNextChapter, getSequence, **loadChapter**); BottomBar (getChapter);
SelectActivity (buildSelectQuestions, randomFeedback); SequentialRail
(getSequencePosition); ActivityHost (getChapter, getActivity); progress.js
(getChapter, SECTIONS, getSequence); packs.js (getToc, getBuiltChapterIds).

Route gate contract: only App awaits `loadChapter`; the sync getters below the
gate are guarded by a `loaded` reactive (`= isChapterLoaded(route.chapterId)`,
re-evaluated via a `contentRev` bump on load — same store-bridge pattern as
progress.js's `progressRev`). A getter hit on a built-but-unloaded chapter is a
loud `console.error`, per spec.

## 4. Build shape (acceptance A)

- `npm run build` emits `assets/chapt-01-<hash>.js` (35.4 KB / 11.8 KB gz) and
  `assets/lexicon-chapt01-<hash>.js` (6.75 KB / 2.94 KB gz) as their own chunks.
- Chapter-1 DATA is ABSENT from the main bundle: the distinctive value
  `"You will be able to:"` and the `1_ALPHAB` source comment appear ONLY in the
  chunk, 0× in `index-*.js`. (Note: the *property name* `objectivesPreamble`
  appears once in the main bundle — that is ContentAudio's template reference to
  the field, `t[0].objectivesPreamble`, NOT chapter data. The build assertion
  keys on a data VALUE to avoid this false positive.)
- Built `sw.js` `precacheAndRoute` includes both chunks.
- **Precache entry count: 15 → 17.** Baseline (pre-5A, static imports) = 15
  shell entries; 5A adds exactly the 2 new chunks. No other precache change.
- Tree-shake guard: `npm run check:lazy-chunk` (wired into `npm run verify`)
  fails the build if the chapt-01 chunk is missing, if chapter data leaks into
  the main bundle, or if the SW does not precache the chunks. Currently PASS.

## 5. Behavior acceptance (vite preview + headless-Chrome CDP driver)

Online driver — 21/21:
- Settings pack list renders (getBuiltChapterIds path). ✓
- Direct-load AND refresh on every route shape: toc, settings, hub, hub+section,
  intro-hub, activity — all render, 0 console errors. ✓
- Full 26-item chapter-1 sequential rail walk, 0 console errors, reaches the
  end-of-chapter dialog. ✓
- Progress/resume: after the walk the hub reports completed count and the
  up-next affordance behaves as before. (Walking Next completes 16/26 — the
  scored select/spell activities complete on FINISH, not on visit; identical to
  pre-5A semantics.) ✓
- Simulated chunk-load failure (CDP `Network.setBlockedURLs` on the chunk +
  SW/cache cleared to force the network path): failure card shows with a working
  TOC escape (no dead end), and Retry recovers after unblock. ✓

Hard-offline driver — 8/8 (SW installed + controlling, then the preview server
is KILLED — CDP offline emulation does not gate SW fetches, repo gotcha):
- Server confirmed down (a cache-busted origin fetch rejects). ✓
- Offline cold reload renders the shell; offline chapter hub renders (chunk from
  precache). ✓
- OFFLINE full 26-item rail walk, 0 console errors. ✓
- OFFLINE refresh directly on an activity route renders (the chunk-precache
  proof on the real cache path), 0 console errors. ✓

## 6. Surprises — flag, do not absorb (spec §6)

**Browser module-map caches FAILED dynamic imports.** The B7 lesson (reset the
JS promise memo so a retry can succeed) is NECESSARY BUT NOT SUFFICIENT here.
Probed directly in Chrome: after a blocked `import(url)` rejects, a second
`import(url)` for the SAME url returns the cached rejection even once the network
is unblocked; only a fresh URL (cache-bust query) re-fetches. We cannot portably
obtain the hashed JS-chunk URL to bust it, and WebKit (the real device target)
does not even expose the URL in the import error, so URL-parsing is out.

Resolution: `loadChapter` still resets its own memo on failure (correct
layer-hygiene, spec-required, and it fixes the navigate-away-and-back path). The
user-facing **Retry** action does a full `location.reload()` — a fresh document
gets a fresh module map, the app shell is precached so the reload is cheap, and
the recovered/online chunk then loads cleanly. Verified: direct in-place retry
does NOT recover (module-map cache); reload-based retry DOES. **Device watch
item for VERIFY-5A:** confirm the same reload-retry behavior on iOS WebKit — the
failure path is belt-and-suspenders (the chunk is normally precached, so the
failure state should be near-unreachable in practice).

Minor notes:
- `getLemma(ref)` searches all LOADED lexicons (kept ref-only signature per
  spec). If lemma refs are ever reused across chapters this could resolve the
  wrong chapter's lemma once 2+ are loaded — a 5B watch item (chapter-1 refs are
  fine; only one lexicon loads at a time on the happy path).
- Filename↔id mapping is derived from the number in the filename
  (`chapt-01.json` → `chapt_1`; lexicon glob tolerates both `lexicon-chapt01`
  and the `lexicon-chapt-02` 2+ pattern). No per-chapter wiring needed as files
  land — but the lexicon naming inconsistency (ch1 has no dash, 2+ has one) is
  real; keep the glob's `-?` tolerance or normalize the names in 5B.

## 7. Out of scope — untouched (confirmed)

Audio path (audio-store.js, downloads.js, SW, caches — 4.5 frozen), chapter-2
content/modes/data, progress.js backend. The SW's only behavioral change is the
2 extra precache entries, an automatic consequence of the chunk split.
