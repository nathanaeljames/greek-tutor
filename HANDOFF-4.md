# HANDOFF-4.md — Phase 4 closeout: session handoff

Session date: 2026-07-18. Implements 4-CLOSEOUT-SPEC.md **Part 0 + Part A**
(the 18 PHASE4-REVIEW fixes) on top of Phase 4c (HANDOFF-4C.md). Written by
Opus. **Part B (architectural code review) was intentionally NOT started** —
per the work order, Part B code review, edits, testing, and the Part-B section
of this handoff are Fable's, later. This document is complete for Part 0 + A
and stubs Part B with entry notes so Fable can pick it up cold.

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

## 4. Svelte 4 gotchas honored (carried from 4A–4C)
- `{#key activityId}` is the sanctioned remount lever for "component reused
  across routes" — Part B (B2) should grep for the same class of prop-at-init
  state and confirm nothing route-reachable is left unkeyed.
- Blue is a semantic token (`--link`) — reserved for tappable things. New Part-5
  components must follow the rule (tappable Greek blue; static Greek/text ink or
  dark green), ideally in component-scoped styles (B6).

## 5. Part B — NOT STARTED (Fable)
Deferred entirely per the work order. Entry notes so it can start cold:
- **B1 ContentAudio dispatch** is the priority: it currently branches on
  chapter-1 **activity IDs** (`id === 'c1_learn_translit'`, `'c1_qr_vocab'`,
  `'c1_learn_diphthongs'`, etc.) rather than on mode/data shape — a real
  scaling defect for the 27 chapters in Phase 5. Convert id-keyed dispatch to
  mode/shape-keyed; if it grows past ~400 lines, extract per-mode
  subcomponents (mechanical). Left untouched this session on purpose.
- **B2 lifecycle:** the `{#key}` fix (A8) covers the host; grep for other
  state initialized from props outside reactive statements (e.g.
  SelectActivity's `init()` at construction, SpellActivity's `words` at
  construction — both now saved by the remount, but confirm nothing else).
- **B3 cache topology:** now single-sourced via `cache-config.js`; assert in
  the review that nothing reintroduces a literal cache-name string.
- **B4 progress.js module state + progressTick** re-render workaround (App +
  UnitMap thread `progressTick` through helpers). Convert to a Svelte store if
  it's small/mechanical; else document the migration.
- **B5 bundle shape:** chapter JSON is statically imported in `content.js`
  (`import chapt1 from '../data/chapt-01.json'`). Verify a move to lazy
  `import.meta.glob` dynamic imports without breaking offline (precache must
  include the chunks); implement if contained, else document the plan.
- **B6 app.css** is a growing phase-suffixed monolith (now with a "Phase 4
  closeout" block). Do not mass-refactor; flag dead selectors + specificity
  hacks; adopt component-scoped styles for new Phase-5 components.
- **B7:** anything else load-bearing (routing, a11y, data-contract drift
  between `content.js` helpers and the JSON).

## 6. Housekeeping
- No new runtime dependencies. Test tooling used a throwaway Node CDP driver
  (`--experimental-websocket`) against system Chrome; adding `playwright-core`
  as a devDependency (standing 4A/4C suggestion) would make the §2 device items
  repeatable in CI.
- `sips` (macOS built-in) generated the icon sizes — note for anyone
  regenerating on Linux (use ImageMagick `convert`/`magick` instead).
