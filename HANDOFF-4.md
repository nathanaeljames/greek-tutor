# HANDOFF-4.md — Phase 4 closeout: session handoff

Session date: 2026-07-18. Implements 4-CLOSEOUT-SPEC.md **Part 0 + Part A**
(the 18 PHASE4-REVIEW fixes) on top of Phase 4c (HANDOFF-4C.md). Written by
Opus. **Part B (architectural code review) was intentionally NOT started** —
per the work order, Part B code review, edits, testing, and the Part-B section
of this handoff are Fable's, later. This document is complete for Part 0 + A
and stubs Part B with entry notes so Fable can pick it up cold.
**Update 2026-07-18: Part B is now DONE — §5 was replaced with the real audit
findings (Fable, per AUDIT-4.md) and §3 lists the audit's file changes.**

> Icon note (deviation from spec §0/A5): the vector icon set (icon.svg,
> icon-maskable, apple-touch, etc.) was **not** delivered with this spec, and
> the user directed us to ship **lamp-pixel-512.png** as the app icon and to
> ignore the "rejected" alternative. A5 was implemented accordingly (see A5).

## 0. Data drop-in status (spec §0)

The two updated data files were already present in the working tree as delivered
(uncommitted). Verified in place and consumed by the new code this session:

- **chapt-01.json** — Six Points per-letter audio: Letter Confusion defList
  rows carry a 3rd audio element; the Zeta point carries
  `greekTaps {"ζ":"chapt_1_a_zetan"}`; Linguistic Pronunciation rows use the
  `{letters:[{greek,audio}]}` shape (23 wired letters total). `lead` fields on
  Diphthongs + Iota Subscripts. Capitals drill `play:"audioShort"`. Review
  Letters `columns` without "Pronounce".
- **intro.json** — Getting Around copy approved; `_userDecision` removed
  (replaced by an `_approved` marker). The draft-tag rendering path in
  ContentAudio was **deleted** (nothing else used it; the `.draft-tag` CSS was
  removed too).

No data edits were needed this session — the drop-ins were consumed as-is.

## 1. Part A — fix notes (per item)

**A1 — Storage never decreases after Clear (duplicate caches).** Root cause is
now structurally impossible:
- New `src/lib/cache-config.js` exports the single source of truth
  (`AUDIO_CACHE = 'greek-tutor-audio'`, `MANIFEST_CACHE`, `isAudioCacheName`).
  It is imported by **both** `downloads.js` and `vite.config.js` (the generated
  SW), so the DownloadManager, the SW CacheFirst `/audio/` route, and the SW
  manifest route can never drift onto different names. `audio.js`'s play-time
  warm relies on the SW route (it never opens a named cache directly), so it
  inherits the same bucket.
- `clearAllAudio()` is now belt-and-braces: `caches.keys()` → delete **every**
  cache matching `isAudioCacheName` (any name containing "audio", so a stray
  workbox/legacy duplicate goes too), never the manifest cache. Settings
  re-runs `storageInfo()` after clear (unchanged) so the figure refreshes.
- New `migrateLegacyAudioCaches()` runs once on startup from `main.js`
  (fire-and-forget): deletes any audio-matching cache that is **not** the
  canonical `AUDIO_CACHE` — the one-time cleanup for the already-deployed
  iPhone.
- Verified (desktop Chrome, headless CDP against `vite preview`): the SW's
  generated `sw.js` references exactly `greek-tutor-audio` + `greek-tutor-
  manifest`. Seeded three caches (canonical audio + a legacy duplicate audio +
  manifest); the migration predicate deleted the duplicate and kept the live
  one + manifest; the clear predicate deleted BOTH audio caches and kept the
  manifest. `isAudioCacheName` unit-tested (matches audio/legacy/workbox-audio;
  excludes manifest + precache).
- **iOS caveat (unchanged from 4C):** Safari may report reclamation lazily; the
  duplicate-write bug is gone but the on-device "usage drops after Clear"
  timing is a Phase-4d observation. The full download→clear→download usage
  cycle needs a real network + interactive session (below).

**A2 — Larger screens waste space.** Breakpoint unified to **900px** (App.svelte
`matchMedia` + CSS). At ≥900px: `.content` max-width rises to 840px; the TOC
chapter list becomes a two-column card grid (`.chapter-grid`, wired in
ChapterNav). The wide hub already renders the Unit Map as a left sidebar with
the activity/hub pane beside it (App shell) — left as designed; only the
overflow fix below was needed. Phone (320–430px) layout unchanged.

**A3 — iPad sidebar pans side-to-side.** Added `overflow-x: hidden` to `.app`,
`.app-main`, `.scroll-area`, and `.sidebar` (+ `min-width: 0` on the sidebar).
The sidebar is a fixed-width flex column that scrolls only vertically; nothing
can pan horizontally now.

**A4 — Double-tap zoom breaks rapid tapping.** `touch-action: manipulation` on
`html, body` and on every interactive selector (buttons, tiles, chips, keys,
rows, seg controls, icon buttons…). This removes double-tap-zoom + the tap
delay while **preserving pinch-zoom** (no `user-scalable=no`). Verified computed
`touch-action: manipulation` on `html` and `.btn`.

**A5 — App icon.** Wired the **pixel-faithful LAMP art**. Generated from
`lamp-pixel-512.png` (via `sips`): `public/icons/icon-512.png` (copy of the
512 source), `icon-192.png` (192), `apple-touch-icon.png` (180),
`icon-maskable-512.png` (512). `lamp-pixel-512.png` also kept in `public/icons/`
and repo root. Manifest icons: 192 (any) + 512 (any) + maskable-512 (maskable).
`index.html` apple-touch-icon → the 180 file; favicon → icon-192. Build
confirms all in the precache + manifest points at the pixel art.
- **Maskable caveat:** the pixel art currently fills the frame, so as a
  *maskable* icon its edges may be cropped by the ~40% safe zone on Android
  adaptive icons. Fine for iOS (uses apple-touch, not maskable). If Fable wants
  a true maskable, add padding to a dedicated maskable PNG; swap is one line.
- **iOS icon-cache caveat:** iOS caches the Home-Screen icon per install. After
  deploy, **remove and re-add the PWA to the Home Screen** to see the new icon
  (may take two tries after the SW updates).

**A6 — blue = tappable + restore letter tap audio.** New `--link: #1663c7`
(blue), applied **only** to tappable Greek/text: chart tiles, equation cells,
diphthong tiles, tappable examples, Six Points chips + inline taps, tappable
defrow terms, Review-Vocab Greek, Review-Letters Greek. Static Greek/text stays
ink / dark green.
- RichContent now renders the `{letters:[…]}` defList value as a row of
  individually-tappable Greek **chips** (`.greek-chip`), and splits an item's
  `text` on `greekTaps` substrings into tappable inline spans (`.greek-tap`,
  first occurrence per key). Applied to both nested (`it.defList`) and top-level
  (`b.rows`) defLists.
- Verified: expanding Six Points renders **17 chips + 1 inline ζ tap + 5 Letter
  Confusion rows = 23 wired letters**, all blue; the red-highlighted π inside
  the "Pronunciation variations" paragraph is **not** a tap target (stays plain
  — it has no `greekTaps` entry).

**A7 + A14 — no dead-end sequential Next.** The always-present sequential rail
(App shell, every activity page) already renders a live Next that opens the
end-of-chapter dialog when there is no successor (SequentialRail dispatches
`end`). This session added the missing **"Chapter map"** action to
EndOfChapterDialog so it now offers **Chapter map / Table of contents / Stay**
(plus "Next chapter" when the next chapter is available). Verified the dialog
fires from the last rail item (Learn Bibliography) with exactly those actions.
- **A14 (Learn Letters):** the required structure was already in place and is
  confirmed — activity-local `[Previous | Next Letter | Say Alphabet]` stepper
  (local Next greyed at omega is allowed), then the **Six Points** accordion,
  then the always-present sequential rail below. A learner can leave Learn
  Letters at any letter via the rail. No restructure was needed; verified the
  accordion + rail render on that page.

**A8 + A9 + A16 — stale content across adjacent same-type activities.** Fixed at
the host: ActivityHost now wraps the chosen activity component in
`{#key activityId}`, so navigation between consecutive same-type routes
destroys/remounts the component and per-activity state reinitializes.
- Verified the paired select drills: advanced Letter-to-Name to "2 of 24", then
  navigated to Name-to-Letter → **"1 of 24"** (fresh), and back to Letter-to-
  Name → **"1 of 24"** again (proves no stale instance reuse in either
  direction). This is the same root cause behind A9 (Transliterate/Transcribe)
  and A16 (vocab Gk↔En drills) — all `select`/`contentAudio` types now remount.

**A10 — Capitals drill audio.** Data-driven (`play:"audioShort"`); the
exploreGrid `clickTile` resolves `item.audio` = the short name-only clip.
Verified tapping the first Capitals-drill tile (Α) plays
`/audio/chapt_1/a_alphan.m4a` (the name-only clip), not `a_alpha` (name+sound).

**A12 + A13 — lead text above the chart.** ContentAudio renders `activity.lead`
as prominent body text (`.lead-text`, ink, ~1.06rem, above the card) on Learn
Diphthongs and Learn Iota Subscripts. Verified the lead renders **before** the
chart card on both; the parenthetical content (the "Note" heading + οι
final/non-final examples) still renders below; no green note banner sits above.

**A15 — Learn Vocabulary visibility modes.** Added a three-state segmented
control (radio): **Show Both / Hide Greek / Hide English** (default Show Both).
A hidden pane blanks to a "Tap to reveal" button; tapping reveals it for that
card; switching mode also reveals. Mode **persists across cards within the
session** (component state; resets only on leaving the activity via the
`{#key}` remount). Verified: Hide Greek blanks only the Greek pane (English
stays), tap reveals, and after Next the mode is still Hide Greek with the Greek
pane hidden again.

**A17 — Review Vocabulary tap targets.** The row is no longer one big button:
only the Greek word is a `<button>` (blue, plays the lemma); the gloss is a
static `<span>` in dark green. Verified `.rv-greek` is a BUTTON
(rgb 22,99,199 = --link) and `.rv-gloss` is a SPAN (rgb 31,95,87 = --teal-dark).

**A18 — Review Letters Quick Chart.** Pronounce column dropped; header + rows are
now four equal-ish columns (`1.5fr 1fr 1fr 1fr`); font bumped back up (no more
narrow-screen shrink — it fits four columns to 320px). Each row is still
tappable to hear the letter name; the 🔊 glyph is gone. Verified 4 headers, 0
🔊 glyphs on the page, 4-column grid.

**A11 — no action (confirmed pass in the review).**

## 2. Verification status

Production build clean: `npm run build` → **58 modules, no warnings**; PWA
precache **15 entries / 211.91 KiB** (app shell + the five icon files; audio is
NOT precached). Manifest + `sw.js` inspected (cache names, icon entries).

Driven in **headless Chrome via CDP** against `vite preview` (Node
`--experimental-websocket` driver; Playwright still not installed). All Part A
items above were exercised interactively (navigation, accordion expand, taps,
mode switches, cache-storage seeding) with **zero console errors**. See §1 for
per-item evidence.

**NOT verified this session — needs a real device / real network (Phase 4d,
Fable):**
- A1 end-to-end **usage** cycle: actual pack download raises usage, Clear drops
  it, download→clear→download returns to the first-download level (not double).
  The predicate/topology is proven; the byte-accounting needs real downloads.
- A1 on iOS: observe whether Safari reclaims lazily; confirm the one-time
  legacy-cache migration ran on the already-deployed iPhone.
- A2/A3 on a physical iPad: two-column widths + the sidebar cannot pan
  horizontally; phone unchanged at 320–430px.
- A4 on a physical touchscreen: rapid same-tile / Backspace taps in the speller
  don't zoom; pinch-zoom still works.
- A5 on-device: the pixel icon appears after remove/re-add to Home Screen.
- Airplane-mode regression (standing directive 4): app shell + a downloaded
  pack play offline.

## 3. Files touched this session
New:
- `src/lib/cache-config.js` — shared cache-name constants (A1/B3).
- `public/icons/apple-touch-icon.png`, `icon-maskable-512.png`,
  `lamp-pixel-512.png`; regenerated `icon-192.png`, `icon-512.png` (A5).
- `HANDOFF-4.md` (this file).

Modified:
- `src/lib/downloads.js` — import shared cache name; belt-and-braces
  `clearAllAudio`; new `migrateLegacyAudioCaches` (A1).
- `src/main.js` — run the migration once on startup (A1).
- `vite.config.js` — import shared cache names; wire the pixel icon set (A1/A5).
- `index.html` — apple-touch-icon → the 180 file (A5).
- `src/components/ContentAudio.svelte` — remove draft-tag path (§0); lead text
  (A12/13); vocab visibility modes (A15); Review-Vocab restructure (A17);
  Review-Letters 4-col (A18).
- `src/components/RichContent.svelte` — letters-list chips + greekTaps inline
  taps (A6).
- `src/components/ActivityHost.svelte` — `{#key activityId}` remount (A8/9/16).
- `src/components/EndOfChapterDialog.svelte` — "Chapter map" action (A7).
- `src/components/ChapterNav.svelte` — `.chapter-grid` wrapper (A2).
- `src/App.svelte` — wide breakpoint 768 → 900 (A2).
- `src/app.css` — `--link`; touch-action (A4); blue-tappable rules,
  chips/taps, lead-text, segmented control + hidden pane (A6/A12/A15/A17);
  Review-Letters 4-col; wide layout + overflow-x fixes (A2/A3); removed
  `.draft-tag`.

Suggest committing Part 0 + A as one unit before Fable starts Part B.
(Done: commit caa7a23 "wrapping phase 4 edits".)

**Part B audit changes (2026-07-18, Fable — see §5 for the findings):**
- `src/lib/cache-config.js` — `PROTECTED_CACHES` guard list + breadth-warning
  comment (R3).
- `src/lib/downloads.js` — migration/clear guarded by PROTECTED_CACHES /
  explicit manifest exclusion; downloadPack/downloadAll/clearAllAudio never
  reject (R3/B7).
- `src/lib/packs.js` — getPacks no longer memoizes a rejection (B7).
- `src/lib/audio.js` — warmCache catch (B7).
- `src/lib/content.js` — getNextChapter treats intro as preceding ch. 1 (R8).
- `src/lib/progress.js` — `progressRev` store replaces tick threading (B4).
- `src/components/ContentAudio.svelte` — mode-keyed dispatch, zero id
  branches (B1).
- `src/components/RichContent.svelte` — standalone-boundary greekTaps (R5).
- `src/components/ActivityHost.svelte` — progress event removed (B4).
- `src/components/UnitMap.svelte`, `src/App.svelte` — subscribe to
  progressRev; progressTick prop gone (B4).
- `src/components/EndOfChapterDialog.svelte` — Escape close + initial focus;
  action order (R8).
- `src/components/Settings.svelte` — manifest-unavailable note (B7).
- `src/app.css` — 768 comment fixed (R1); Review-Letters header wrap at
  ≤360 px (R6).
- `src/data/chapt-01.json` — mode vocabulary + ui.arrowCue (B1; the one
  permitted data edit — full field list in §5).
- `public/icons/icon-maskable-512.png` — delivered padded variant (R7).

## 4. Svelte 4 gotchas honored (carried from 4A–4C)
- `{#key activityId}` is the sanctioned remount lever for "component reused
  across routes" — Part B (B2) should grep for the same class of prop-at-init
  state and confirm nothing route-reachable is left unkeyed.
- Blue is a semantic token (`--link`) — reserved for tappable things. New Part-5
  components must follow the rule (tappable Greek blue; static Greek/text ink or
  dark green), ideally in component-scoped styles (B6).

## 5. Part B — audit findings (Fable)

Session date: 2026-07-18, per AUDIT-4.md (Part A regression pass + the
deferred Part B review). All verification below ran against `npm run build`
+ `vite preview` driven by a headless-Chrome CDP driver (Node
`--experimental-websocket`, same approach as §2): **463 automated UI checks
+ 24 SW/offline checks, 0 console errors**. Suggest committing this audit as
its own unit ("Phase 4 Part B audit").

### ⚠ Flag for the device pass (Phase 4d): iPad portrait
The 768→900 breakpoint unification (A2) means **iPad portrait (~768–834 px),
which previously got the sidebar layout, now gets the phone layout** (bottom
bar, accordion hub). This is a *behavior change to evaluate on the device*,
not a bug: if portrait iPad looks worse, the fix is the breakpoint **value**
only — one `@media (min-width: 900px)` block in app.css + one
`matchMedia('(min-width: 900px)')` string in App.svelte. Nothing else keys
on the number.

### Part 1 — regression audit of Part A

- **R1 breakpoint — FIXED (comment only) / VERIFIED.** Repo grep for `768`
  found a single stale CSS comment (fixed); the only breakpoint sources are
  the two 900px strings above. Driven at 800 px and 899 px: complete phone
  layout (bottom bar present + functional, no sidebar, no horizontal
  scroll); at 900 px and 1024 px: sidebar layout, no bottom bar. No dead
  band. iPad-portrait flag above.
- **R2 cache-config dual import — NOT AN ISSUE / VERIFIED.** File is plain
  dependency-free ESM with the keep-it-that-way comment; `npm run build` and
  `npm run dev` both work; generated `sw.js` references exactly
  `greek-tutor-audio` + `greek-tutor-manifest`; no literal cache-name
  strings in code anywhere in src/ (comments only).
- **R3 predicate breadth + migration safety — FIXED.** cache-config.js now
  exports **`PROTECTED_CACHES`** (canonical audio + manifest);
  `migrateLegacyAudioCaches` filters on it (protection asserted in code, not
  by naming accident), and `clearAllAudio` explicitly excludes
  `MANIFEST_CACHE`. Kept the substring predicate + guard list (the spec's
  option b) with a breadth-warning comment; the SW-activation ordering
  invariant is documented at the migration site. Verified live: a seeded
  legacy `workbox-runtime-audio-legacy` cache is deleted on startup while
  canonical + manifest (and the warmed audio entry) survive; Settings →
  Clear deletes the audio cache, keeps the manifest, and a later play-warm
  recreates exactly one audio cache.
- **R4 `{#key activityId}` blast radius — VERIFIED, one decision recorded.**
  (a) Pronounce Letters reshuffles on every entry (index reset to the
  begin-prompt, new order) and does NOT reshuffle on in-page re-runs (order
  stable across Next clicks) — the 4C `orderedForId` guard was kept; with
  the remount it is belt-and-braces against in-page reactive re-runs.
  (b) No second audio-stop path was created; the App-level `stopAudio()` on
  hashchange remains the single stopper (ContentAudio only plays on user
  action). (c) Full 26-item rail walked forward AND backward at 390 px and
  1024 px, banner/count/content checked on every step, no errors and no
  visible layout flash in per-step screenshots; genuine scroll-jank feel
  needs device eyes (4d). (d) **Decision recorded:** A15 vocab visibility
  mode persists across CARDS within a visit and resets when leaving/
  re-entering the activity (remount side effect) — this matches the spec's
  "persistence across cards within a session" reading and was verified both
  ways. (e) Nothing else assumes instance reuse: all remaining
  prop-at-construction state (SelectActivity `init()`, SpellActivity
  `words`, ReadingCategories `categories`) sits inside the keyed block.
- **R5 greekTaps splitter — FIXED.** The splitter now matches only
  **standalone** occurrences: a key matches where its neighbors are not
  Greek letters (Greek + Greek Extended ranges), so a single-letter key can
  never blue half a word; first standalone occurrence per key. No `{@html}`
  anywhere in the path — matches render as text nodes inside a `<button>`.
  **Pipeline contract (chapters 2+):** a `greekTaps` key marks the first
  standalone occurrence of that exact string in the item's `text`.
- **R6 overflow-x masking — REAL BUG FOUND + FIXED.** Exactly the predicted
  failure: at 320 px the Review Letters "Transliteration" header ran past
  the card edge and was silently clipped by the A3 `overflow-x: hidden`
  rules (A18's "fits to 320px" held for the rows, not the header). Fixed by
  letting header labels shrink + wrap at ≤360 px. All other 320 px surfaces
  verified clean: speller tile grid, alphabet exploreGrids, diphthong/iota
  rows, equation chart, review-vocab rows. **Phase 5 note: clipped content
  now presents as "missing content", not sideways scroll — test every new
  chart at 320 px.**
- **R7 maskable icon — FIXED.** The delivered padded
  `icon-maskable-512.png` (lamp at ~57% on app green) replaced the
  full-bleed copy in `public/icons/`; manifest still points at it with
  `purpose: "maskable"`; it lands in the precache and the dist copy is
  byte-identical to the delivered file. iOS icon-cache caveat from A5 still
  applies after deploy.
- **R8 EndOfChapterDialog — FIXED.** Escape now closes (≡ Stay) and focus
  moves to the first action on open; no build a11y warnings. The INTRO
  pseudo-chapter's 3-item rail was a dead end ("intro" isn't in
  `toc.chapters`, so no next) — `getNextChapter` now treats intro as
  preceding chapter 1, so the intro's end dialog offers **Next chapter →
  Chapter 1's first activity** (verified), Chapter map → intro hub
  (verified), and never claims a wrong coming-soon number. Chapter 1's own
  dialog correctly says "Chapter 2 is coming soon."

### Part 2 — architectural review

- **B1 ContentAudio dispatch — FIXED (the priority item).** Dispatch is now
  entirely **mode-keyed**; acceptance met: `grep -r "c1_" src/` finds
  nothing outside data, and all nine contentAudio pages (the bespoke five
  plus objectives/drill/qr pages) render **DOM-identical** before/after
  (whitespace-insensitive diff of the serialized `.content` subtree at
  390 px; only an empty text node moved). ContentAudio is 386 lines — under
  the ~400-line extraction threshold, so no subcomponents were split out.
  **Data vocabulary added to chapt-01.json (chat-side pipeline must adopt
  for chapters 2+):**
  - `mode: "objectivesPage"` (was textPage) — renders the chapter record's
    `objectivesPreamble` + `objectives` list. (c1_learn_objectives)
  - `mode: "equationChart"` (was chart) — "lower = X" tappable cells from
    the itemsFrom letters; **X comes from the existing `display` field**
    (`"lower=upper"` → capital, else transliteration); tap plays the item
    audio per the `play` field. (c1_learn_translit, c1_learn_capitals)
  - `mode: "vowelStair"` (was chart) — requires `itemsFrom:
    "alphabet.vowels"`; rows carry `group` short/longOrShort/long.
    (c1_learn_vowels)
  - `mode: "diphthongRows"` (was chart) — ONE mode for the shared
    diphthong/iota layout (the two branches were identical); rows come from
    the `itemsFrom` source and need `greek, sound, example, exampleGloss,
    audio, exampleAudio`. (c1_learn_diphthongs AND c1_learn_iota_subscripts
    — the spec's suggested separate "iotaRows" value was collapsed into
    this on purpose: one layout, one mode.)
  - `mode: "reviewVocab"` (was chart) — lemma-ref items; **`showNtFreq` is
    now actually honored** (the (n×) frequency renders only when true; it
    was previously unconditional). (c1_qr_vocab)
  - `mode: "reviewLetters"` (was chart) — the 4-column matrix; **the
    existing `columns` list now supplies the header labels** (cell fields
    stay fixed: name / lower / upper / translit); `play` drives row audio.
    (c1_qr_letters)
  - `ui.arrowCue: true` added to c1_drill_letter_names, c1_drill_translit,
    c1_drill_capitals — replaces the id-list for the arrow cue above
    exploreGrids.
  - `lead` is now **mode-independent**: any contentAudio activity may carry
    it and it renders above the content card (was hardwired to the two row
    pages).
- **B2 lifecycle — NOT AN ISSUE.** Audited every route-reachable component
  outside the keyed block (TopBar, BottomBar, UnitMap, Settings,
  DownloadControl, SequentialRail, App): all derive from props reactively
  (`$:`); no construction-time props capture remains outside `{#key}`.
- **B3 cache topology — invariant asserted.** One audio cache + one
  manifest cache; names single-sourced from cache-config.js; deletion-safety
  guarded by `PROTECTED_CACHES` in code; no literal name strings. Nothing
  further — R2/R3 found no drift.
- **B4 progressTick — FIXED (store conversion was mechanical).** progress.js
  now exports a `progressRev` writable (bumped inside
  markVisited/markCompleted); App, UnitMap and the hub read via
  `($progressRev, getX(...))` and the `progressTick` prop threading +
  ActivityHost's `progress` event are gone. **The getter interface is
  unchanged and synchronous** — Phase 6 still swaps the backend to IndexedDB
  behind it. Touched exactly progress.js + App + UnitMap + ActivityHost.
- **B5 bundle shape — DEFERRED, claim PROVEN.** Experiment (reverted):
  converting chapt-01 to a lazy `import.meta.glob` dynamic import emits
  `assets/chapt-01-<hash>.js` as its own chunk and **vite-plugin-pwa
  precaches it** (precache went 15 → 16 entries, chunk present in
  `precacheAndRoute` in the built sw.js) — offline stays intact, no config
  changes needed. NOT implemented now because the ripple is real: the sync
  getters would go async, and the call sites that must be awaited are
  App.svelte (getChapter/getActivity in reactive statements), UnitMap,
  BottomBar, SequentialRail (getSequencePosition), EndOfChapterDialog
  (getSequence/getNextChapter), ActivityHost, progress.js
  (getChapter/getSequence), packs.js (getBuiltChapterIds). **Migration plan
  for phase 5:** keep the getters sync against a loaded-chapters registry;
  add `async loadChapter(id)` that dynamic-imports into the registry; make
  the App gate activity/hub rendering on the current route's chapter-load
  promise (one await at the route level, everything below stays sync); TOC
  availability comes from static toc.json. **Trap discovered:** the glob map
  must be reachable from executed code — an unused `loadChapters` export is
  tree-shaken and NO chunk is emitted (the first experiment silently
  produced nothing).
- **B6 app.css — flags only.** Automated cross-check of every `.class`
  selector against src: **no dead selectors** (`.draft-tag` fully gone). One
  smell, not fixed: `.rv-greek`/`.lm-*` styling is split between the A6
  blue-token block and the A17/A18 blocks — works, but Phase-5 extractions
  should carry their styles component-scoped (standing convention, restated).
- **B7 catch-all — several real fixes.**
  - **`getPacks()` memoized a rejected promise forever**: first run offline
    → the pack list (Settings, hub badges) stayed broken until a full
    reload even after coming back online. Now resets on failure like
    `loadManifest` does.
  - `downloadPack` / `downloadAll` / `clearAllAudio` could reject unhandled
    (manifest fetch failing while `navigator.onLine` is optimistically
    true; they're called bare from click handlers). All three now never
    reject: failures become a visible per-pack/aggregate error state
    ("Could not load the audio list — check your connection and retry.").
  - Settings' pack list no longer shows an eternal "Loading…" when the
    manifest is unreachable — explicit "Audio list unavailable" note.
  - `warmCache`'s `caches.match` chain got a catch (was the one bare
    promise in audio.js).
  - Routing: direct-load/refresh verified on every route shape (toc,
    settings, hub, hub+section, activity, intro variants).
  - Airplane-mode regression (standing directive 4) verified **hard** —
    preview server killed, not just DevTools offline emulation (which SW
    fetches bypass — see nits): app shell renders, a previously-played
    audio file serves from cache, an unplayed one correctly fails.

### Nits (list-only, no action taken)
- SpellActivity's keyboard-reference modal and Settings' clear-confirm
  modal don't have the Escape/initial-focus treatment EndOfChapterDialog
  now has; copy the pattern when touched next.
- CDP `Network.emulateNetworkConditions` does NOT affect service-worker
  fetches — offline tests must kill the server (or use real airplane
  mode). Cost this session ~one confusing failure; noted for the next
  driver. Playwright-core as a devDependency remains the standing
  suggestion (third session hand-rolling a CDP driver).
- `audio.js` `play()` doesn't abort an in-flight warm fetch when
  interrupted; harmless (the fetch just completes into cache).
- The intro dialog would say "Chapter 1 is coming soon" if chapter 1 were
  ever marked unavailable — correct degradation, noted for completeness.

### Verification (AUDIT-4 checklist)
- [x] `npm run build` clean: **58 modules, no warnings**; precache 15
      entries / 210.25 KiB; `npm run dev` boots (R2 dual import).
- [x] Full 26-item rail walk forward AND backward at 390 px and 1024 px:
      banner/position/content checked on all 104 steps; bespoke pages
      DOM-identical to pre-audit capture (B1); 0 console errors.
- [x] R1 band checks at 800/899/900/1024 px; R6 clip checks at 320 px.
- [x] Airplane-mode regression (hard offline): shell + cached audio OK.
- [x] Settings, hub download control, Clear exercised after the
      downloads.js/cache-config changes; migration + clear predicates
      verified live in the browser (R3).
- [x] B5 not implemented — precache proof captured, experiment reverted,
      final build re-verified after revert.

## 6. Housekeeping
- No new runtime dependencies. Test tooling used a throwaway Node CDP driver
  (`--experimental-websocket`) against system Chrome; adding `playwright-core`
  as a devDependency (standing 4A/4C suggestion) would make the §2 device items
  repeatable in CI.
- `sips` (macOS built-in) generated the icon sizes — note for anyone
  regenerating on Linux (use ImageMagick `convert`/`magick` instead).

## 7. Punch list (2026-07-18)

Session date: 2026-07-18, per 4-PUNCHLIST.md, applied on top of the Part B
audit unit (ordering note honored; tree committed first). Verification ran
against `npm run build` + `vite preview` with the usual headless-Chrome CDP
driver: **30/30 functional checks, full 26-item rail walk, hard-offline
regression, 0 console errors** (offline run shows exactly the one expected
failed fetch for an un-cached file).

### §0 data drop-in — RECONCILED, not applied verbatim (pipeline warning)

The delivered chapt-01.json was generated from a **pre-audit** copy: besides
the intended P3 field it reverted the entire B1 mode vocabulary
(objectivesPage/equationChart/vowelStair/diphthongRows/reviewVocab/
reviewLetters → textPage/chart) and dropped the three `ui.arrowCue` fields —
that file would have broken the mode-keyed dispatch. Applied ONLY the
intended change (c1_drill_letter_names `play: "audioShort"` + the
`_play_note`) on top of the audit version. **Chat-side pipeline: regenerate
your working copy from the committed file before the next drop-in.** Also
corrected the now-stale alphabet `_comment` (it claimed the drills still use
audioFull).

### P1 — diagnosis findings (the REPEAT storage-growth item)

Ran the full download → report → clear → report → re-download → report cycle
on desktop Chrome (chapt_1 pack, 120 files, real fetches against preview).

- **Suspect 1 (Vary-key duplication) is DEAD on Chrome.** Measured directly:
  two `cache.put()`s of the same URL whose requests differ in a header named
  by the response's `Vary` produce **one** entry — Chrome's put replaces
  regardless of Vary. Full-cycle inspection confirms: 120 entries after
  every download, **zero duplicate URLs at every stage**. (Note the
  precondition IS real: even vite preview serves audio with `Vary: Origin`,
  and Cache-API *matching* does honor Vary — so the miss-and-refetch waste
  path existed even though put-duplication does not. WebKit's put behavior
  was not testable here; the fix below covers it either way.)
- **Suspect 2 (lazy reclamation reporting) is CONFIRMED — on desktop Chrome,
  not just iOS.** With the cache provably empty (0 entries, 0 bytes),
  `storage.estimate()` did NOT drop after Clear (2.30 MB → 2.30 MB) and rose
  monotonically across cycles (0.8 → 2.3 → 3.8 MB) — exactly the device
  symptom. After killing and restarting the browser process with the same
  profile it reconciled only partially (3.9 → 2.7 MB): compaction is real
  but gradual. **The estimate figure is untrustworthy for "did Clear work"
  on any engine; the acceptance criterion "estimate drops after Clear" is
  not achievable and was replaced by the file-count ground truth.**
- Expected iOS behavior (for Fable's device pass): "N audio files stored"
  drops to 0 instantly on Clear and returns to the pack count on
  re-download; the "reported by the browser" line may sit unchanged for a
  long time and may only fall after the PWA is fully killed and relaunched
  (possibly days later, when WebKit compacts). Record what you observe here:
  ________________________________________.

P1 fixes applied (all belt-and-braces, cheap, and WebKit-proof):
- `downloads.js`: single-writer discipline — every `match`/`delete` uses
  `{ ignoreVary: true }` (`MATCH_ANY`), and every write goes through
  `putSingle()` = ignoreVary delete + put (one entry per URL guaranteed).
  The Update/force path deletes with ignoreVary before refetching.
- SW routes (vite.config.js): `matchOptions: { ignoreVary: true }` on the
  CacheFirst audio route AND the NetworkFirst manifest route (offline
  fallback must hit the stored manifest regardless of host Vary).
- `audio.js` warmCache match ignores Vary (kills the miss-and-refetch waste).
- Settings: new "Audio files stored" row — counted from the cache itself via
  `audioFileCount()`, refreshed on every pack-state transition (new
  `packStatesFingerprint` derived store covers per-pack rows and Download
  all, without per-file churn); the estimate row is now labeled "(reported
  by the browser)" with an iOS-may-lag note.
- Diagnostic: `audioCacheDiagnostic()` (entry count, summed bytes via
  `clone().blob()`, duplicate-URL dump with request headers + response Vary,
  cache names, estimate) surfaces as a "Cache diagnostic (debug)" card in
  Settings **only when the page URL carries `?debug`** (e.g.
  `/?debug#/settings`; the flag is read from `location.search`, which
  survives hash navigation). Verified hidden without the flag. Kept, not
  removed — Fable needs it for the device pass.
- Acceptance met (Chrome): entries/bytes 0 after Clear, identical level
  after re-download (120 entries, ~1.10 MB), file-count row tracks
  instantly, no duplicates ever, console clean.

### P2 — double-tap zoom (REPEAT): universal touch-action

`*, *::before, *::after { touch-action: manipulation; }` added in app.css
(A4's html/body + interactive-selector rules kept beneath it as documented
intent). Rationale recorded in the CSS comment: touch-action does not
inherit, and iOS keys the double-tap gesture off the element under the
finger — the universal rule closes the plain-element gap (headings, panes,
bands). Pinch-zoom and panning are untouched; nothing in the app uses
double-tap. Verified computed `touch-action: manipulation` on plain
non-interactive elements; build clean. **Device sign-off is Fable's (the one
remaining device item); if some older WebKit still zooms, the punch list's
JS touchend fallback is pre-authorized — not implemented this session.**

### P3 — Letter Names and Sounds Drill speaks the name only

Data change verified in the browser: tapping the Α tile requests
`/audio/chapt_1/a_alphan.m4a` (audioShort, name only). **Cheat-sheet fact
(updated): `audioFull`'s ONLY consumer is the Learn Letters stepper**
(`c1_learn_letters`, `play: "audioFull"` — the one remaining
`"play": "audioFull"` in the data; alphabet `_comment` now says the same).

### P4–P9 — the Greek-tap rule (NEW STANDING DIRECTIVE)

**Standing rule (chapters 2+ inherit):** any DISPLAYED Greek — prompts,
flashcard words, reading panes, chart glyphs — is tappable and plays its
audio, styled blue per the A6 color rule. English translations and
transliterations are not tappable. The rule covers displayed/prompt Greek,
NOT answer-option buttons (tapping an option is answering; audio there would
leak answers). Explicit exceptions: the Phonetic Reading Exercise (phonetic
English, no audio exists — untappable), speller keyboard tiles (input, not
pronunciation), and the Review Letters Quick Chart (row-tap behavior frozen
as-is).

Implementation: one shared `.greek-say` style (app.css) — a chrome-less
button, blue, layout-preserving (`.prompt.greek-say` keeps the select-prompt
metrics). Wired per item:
- **P4** ReadingCategories: the Greek pane is now a `.greek-say` button
  playing the current item's clip (readingLists audio for names/places, the
  letter's audioShort for letter names). Answer behavior unchanged
  (verified reveal + clip).
- **P5** Learn Vocabulary flashcard: (a) Next no longer autoplays the lemma
  while mode is Hide Greek (guard on `vocabMode` in `onStep`); autoplay
  resumes in the other modes; tapping "Tap to reveal" on the Greek pane
  reveals AND plays (the learner asking). (b) The visible Greek word is a
  `.greek-say` button that pronounces again. Verified all six behaviors.
- **P6/P8/P9** — implemented ONCE in SelectActivity: `buildSelectQuestions`
  now returns a **`promptIsGreek` flag declared by the generator** (letter
  pools: prompt field `lower`/`upper`; vocab pools: `prompt === 'greek'`) —
  no glyph heuristics. When the flag is set and the question carries
  `promptAudio`, the prompt renders as a `.greek-say` button that plays the
  clip and nothing else (verified: question counter unchanged, no answer, no
  reshuffle). Covers Vocab Gk→En (lemma audio), Letter-to-Name and
  Transliterate (audioShort). En→Gk, Name-to-Letter and Transcribe prompts
  verified still-static DIVs; option buttons verified silent in both drills.
- **P7** (deviation from the punch list's note: Pronounce Letters is a
  ContentAudio `selfCheckStepper`, NOT a SelectActivity — so this one is its
  own two-line change, same pattern): the displayed letter is a `.greek-say`
  button playing `item.audio || meta.audioShort` — verified byte-identical
  clip to Check Answer's, and the tap does not reveal the fields.

**Pipeline contract addition (chapters 2+):** select generators/pools must
carry prompt audio for Greek prompts (letter pools already do via
audioShort; vocab pools via the lemma's `audio`). If a future vocab
generator omits it, the prompt silently renders untappable — the flag +
audio are both required for the tap to appear.

### Verification (punch-list checklist)

- [x] P1 Chrome cycle: entries/bytes 0 after Clear, single level after
      re-download; duplicate-key inspection documented (none, put replaces);
      Settings file-count ground truth live; diagnostic gated behind ?debug.
- [x] P2 universal touch-action in place, computed style verified; build
      clean; device sign-off noted as Fable's.
- [x] P3 name-only clip verified; audioFull consumer list = Learn Letters
      stepper only (asserted in data comment + here).
- [x] P4–P9: every tap target plays the right clip and is `--link` blue
      (computed rgb(22,99,199) checked); answer options silent; Phonetic
      Reading, speller tiles, Review Letters chart untouched (verified);
      taps never advance/answer/reshuffle.
- [x] Full 26-item rail walk after all changes: banner "N of 26" + content
      present on every step ({#key} remount intact), 0 console errors.
- [x] `npm run build` clean (58 modules, no warnings; precache 15 entries);
      hard-offline pass (server killed): shell renders, warmed audio plays,
      unwarmed correctly fails.

### Housekeeping
- The CDP driver scripts lived in the session scratchpad (not committed);
  playwright-core as a devDependency remains the standing suggestion
  (fourth session hand-rolling a driver).
