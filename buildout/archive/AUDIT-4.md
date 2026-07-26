# AUDIT-4.md — Phase 4 audit: Part A regression check + Part B review (Claude Code work order)

Prerequisites: read HANDOFF-4.md in full (Opus's Part 0 + Part A session,
2026-07-18), especially §5's Part B entry notes, plus HANDOFF-4C §3-4 and
HANDOFF-4A §3 (Svelte 4 gotchas). Commit the Part 0 + A working tree as
its own unit BEFORE starting, so audit changes diff cleanly against it.

Scope: this is the deferred Part B of 4-CLOSEOUT-SPEC.md, widened with a
targeted regression pass over the Part A implementation itself (it was
written by a different model and self-verified; trust but verify).
Priorities: BREAKING or soon-to-break issues first, architecture second,
style never. Fix and test what is load-bearing; list-only the nits. Do
not restyle, rename, or reorganize working code that is not implicated.
Output: HANDOFF-4.md §5 replaced with real findings (see Output section).

## Part 1 — Regression audit of the Part A session

Each item names the risk, how to check it, and the required outcome.

### R1. Breakpoint unification (A2: 768 -> 900)
Risk: a half-migrated breakpoint leaves a 768-899px dead band where the
CSS says one layout and App.svelte's matchMedia says the other (sidebar
styles bleeding into a bottom-bar layout or vice versa).
Check: grep the whole repo for `768`; confirm exactly one breakpoint
source of truth; drive vite preview at 800px and 899px widths and
confirm a COMPLETE mobile layout (bottom bar visible and functional,
no sidebar, no sidebar CSS artifacts), then 900px+ shows the full wide
layout.
Behavior change to surface, not silently accept: iPad PORTRAIT
(~768-834px) previously got the sidebar layout and now gets the phone
layout. Flag this prominently in the handoff for Fable's device pass —
if portrait iPad looks worse, the fix is a breakpoint value, not code.

### R2. cache-config.js dual import (A1)
Risk: `src/lib/cache-config.js` is imported by both app code AND
vite.config.js (build-time Node context). If it ever gains a browser-
only or vite-specific import it breaks the build; if the generated SW
drifts from the constant the whole A1 fix silently evaporates.
Check: file must stay dependency-free plain ESM (add a comment saying
so); `npm run build` and `npm run dev` both work; inspect generated
`sw.js` for exactly `greek-tutor-audio` + `greek-tutor-manifest`; grep
src/ for any remaining literal audio-cache-name strings outside
cache-config.js (there must be none).

### R3. isAudioCacheName breadth + migration safety (A1)
Risk: the predicate matches ANY cache name containing "audio". Today
that is safe; the moment anything legitimately caches under a name
containing "audio" (a future feature, a workbox default), the migration
deletes it on every startup.
Check: read the predicate + `migrateLegacyAudioCaches()`. Required
outcome: the migration must never delete the canonical AUDIO_CACHE or
MANIFEST_CACHE (assert this in code, not by convention), must be
try/caught (fire-and-forget cannot reject unhandled), and the predicate
should either be tightened to an explicit known-legacy list OR keep the
substring match with a guard list of protected names exported from
cache-config.js. Also confirm ordering: the migration racing SW
activation is acceptable ONLY because the SW route uses the canonical
name — leave a comment stating that invariant.

### R4. {#key activityId} blast radius (A8/9/16)
The remount fix is correct but global: EVERY activity now destroys and
remounts on every rail step. Verify the consequences:
  a) Pronounce Letters reshuffles on every entry (desired per data
     `order:"shuffled"`), and the shuffle does NOT also fire on
     incidental reactive re-runs within a page.
  b) Audio started on page N stops on navigation to N+1 (the App-level
     stop still covers it; the remount must not create a second path
     that races it).
  c) Rail walking has no visible jank on the heavy pages (Learn
     Letters with Six Points, History, Bibliography) — walk the full
     26-item rail in preview and watch for layout flash.
  d) A15 vocab visibility mode resets when leaving and re-entering the
     activity (remount side effect). The spec required persistence
     across CARDS within a session, not across visits — confirm this
     reading in the handoff so it is a recorded decision, not an
     accident.
  e) Grep for any remaining component state that assumed instance
     reuse across routes (the 4C shuffle block keyed on activity.id
     was one; it is now redundant-but-harmless or removable).

### R5. greekTaps splitter robustness (A6)
Risk: substring matching against item text. In chapter 1 the only key
is "ζ", standalone. In later chapters a single-letter key could match
INSIDE a Greek word in the same paragraph and turn half a word blue.
Check: the splitter must (a) render matched substrings as text nodes
inside a button/span — confirm no {@html} anywhere in the path (XSS +
markup-breakage risk), and (b) either match on standalone occurrences
(neighbors are not Greek letters) or the data contract must say keys
match first occurrence verbatim. Implement the standalone-boundary
check if it is small; otherwise document the contract in a comment AND
in the handoff so the chat-side pipeline enforces it for chapters 2+.

### R6. overflow-x: hidden can now mask real bugs (A3)
Risk: A3 fixed the iPad pan by hiding horizontal overflow on `.app`,
`.app-main`, `.scroll-area`, `.sidebar`. That also HIDES any future
content that genuinely overflows (a wide table just gets clipped
silently instead of scrolling the page sideways).
Check at 320px in preview: Review Letters 4-column chart (A18 claims it
fits), the speller tile grid, the alphabet exploreGrids, and the
diphthong rows — nothing clipped, nothing truncated. Add a handoff note
that clipped-content bugs will now present as "missing content" rather
than sideways scroll, so phase 5 chart work must test at 320px.

### R7. Icon wiring (A5)
The padded maskable variant `icon-maskable-512.png` is delivered
alongside this spec (pixel lamp at ~57% of frame on the app green —
survives the ~80% Android safe zone; replaces Opus's full-bleed copy
which would crop). Drop it over `public/icons/icon-maskable-512.png`,
verify the manifest still points at it with purpose "maskable", rebuild,
and confirm it lands in the precache. Everything else about A5 stands
(pixel art everywhere, iOS uses apple-touch-icon).

### R8. EndOfChapterDialog additions (A7)
Check the new "Chapter map" action against the 4a modal pattern (focus
handling, Escape/Stay behavior, no build a11y warnings), and exercise
the INTRO pseudo-chapter's end-of-rail: its 3-item Learn rail must end
in the same dialog with sensible actions (Chapter map -> intro hub;
next-chapter action should offer Chapter 1 if that path exists, else
the coming-soon variant must not claim a wrong number).

## Part 2 — Architectural review (the original Part B, entry notes folded in)

### B1. ContentAudio dispatch (PRIORITY — known defect, now larger)
Confirmed in HANDOFF-4 §5: ContentAudio branches on chapter-1 activity
IDS (`c1_learn_translit`, `c1_qr_vocab`, `c1_learn_diphthongs`, ...),
and Part A grew it further (lead text, vocab modes, review
restructures). Phase 5 reuses every one of these layouts across 27
chapters; id-keyed dispatch breaks all of them.
Required: convert to mode/shape-keyed dispatch. Ground rules:
  - Prefer signals already in the data (existing `mode` values, field
    presence like `columns`/`itemsFrom`/`lead`/`showNtFreq`).
  - Where a bespoke layout has no distinguishing signal, ADD an
    explicit mode value to chapt-01.json (e.g. mode "equationChart",
    "vowelStair", "diphthongRows", "reviewVocab", "reviewLetters",
    "iotaRows") — data edits are permitted HERE ONLY, and every added/
    changed field must be enumerated in the handoff so the chat-side
    pipeline adopts the same vocabulary for chapters 2+ (division of
    labor: the pipeline is chat's).
  - If ContentAudio exceeds ~400 lines of branch arms after this,
    extract per-mode subcomponents — mechanical extraction, no logic
    changes, component-scoped styles for anything extracted (B6).
  - Acceptance: zero `c1_`-prefixed string comparisons anywhere in
    src/components/; full rail walk renders identically to before
    (screenshot-compare the five bespoke pages before/after).

### B2. Component lifecycle assumptions
Beyond the {#key} host fix: grep for state initialized from props at
construction (`let x = props-derived` outside reactive statements) in
every component a route change can reach. The remount now saves most of
them — the audit is for anything OUTSIDE the keyed block (TopBar,
BottomBar, UnitMap, Settings, DownloadControl) that derives state from
route-dependent props. Fix what is reachable; note the rest.

### B3. Cache topology
Post-R2/R3, assert the invariant in the handoff: one audio cache, one
manifest cache, names single-sourced, no literals. Nothing further
unless R2/R3 found drift.

### B4. progress.js module state + progressTick
The workaround threads `progressTick` through App and UnitMap so module
state becomes visible to Svelte. Attempt the conversion to a
svelte/store (writable inside progress.js, same exported function
signatures, components auto-subscribe) ONLY if it is mechanical and
removes the tick threading cleanly; the interface must not change
(phase 6 swaps the backend to IndexedDB behind it). If it ripples into
more than progress.js + App + UnitMap + ActivityHost, stop and document
the migration plan instead.

### B5. Bundle shape for 28 chapters
`content.js` statically imports chapter JSON. Before phase 5 multiplies
that by 27: verify a move to lazy dynamic imports (import.meta.glob on
src/data/chapt-*.json) keeps offline intact — the generated chunks must
land in the SW precache (vite-plugin-pwa precaches emitted assets by
default; PROVE it by building and checking the precache manifest for
the chapter chunk). Implement if contained (content.js resolution going
async is the ripple to watch — getSequence/getChapter callers);
otherwise write the migration plan into the handoff with the call sites
that must become async.

### B6. app.css
Flag-only: dead selectors (draft-tag removal left any?), specificity
hacks the Part A fixes leaned on, and the standing convention going
forward (component-scoped styles for new/extracted components). No
mass refactor.

### B7. Catch-all
Anything else load-bearing: routing edge cases (direct-load/refresh on
every route incl. #/settings), a11y regressions since the 4b clean
build, data-contract drift between content.js helpers and the JSON
(helpers assuming fields the pipeline does not guarantee), unhandled
promise rejections in downloads.js/packs.js paths. Fix major, list
minor.

## Verification after changes

  [ ] npm run build clean; module count noted; no warnings.
  [ ] Full 26-item rail walk forward AND backward at 390px and 1024px:
      content matches banner everywhere; bespoke pages render
      identically to the pre-audit screenshots (B1).
  [ ] R1 band check (800/899/900px); R6 320px clip check.
  [ ] Airplane-mode regression: app shell + a cached audio file play
      offline after one online load (standing directive 4).
  [ ] Settings, hub download control, and Clear still function after
      any downloads.js/cache-config changes (R2/R3).
  [ ] If B5 implemented: offline still works with lazily-loaded
      chapter chunks (precache inspected).

## Output

Replace HANDOFF-4.md §5 with the real Part B section (keep §0-4 and §6
intact, append a "§5 Part B — audit findings (Fable)" of the same
format): per-item findings with FIXED / DEFERRED / NOT AN ISSUE status,
the R1 iPad-portrait flag, the R4d decision note, every data field
added under B1 (for the chat-side pipeline), the B5 outcome, and the
nits list. Update §3's files-touched with the audit's changes. Suggest
committing the audit as its own unit ("Phase 4 Part B audit").

## Out of scope

Chapter 2+ content, font-map unknowns, IndexedDB backend, polytonic
webfont, visual redesign, per-file manifest hashes, adding Playwright
(still just a standing suggestion — note it once more if the CDP
driver was painful).
