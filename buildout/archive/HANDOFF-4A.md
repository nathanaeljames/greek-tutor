# HANDOFF-4A.md — Phase 4a Navigation Rework: session handoff

Session date: 2026-07-16/17. Implements NAV-SPEC.md (Proposal A chrome +
Proposal B accordion hub, user-approved 2026-07-16). Written as the handoff
brief for the Phase 4b session (Chapter 1 complete-and-correct per PLAN.md).

## 1. What was built

### New modules (src/lib/)
- **progress.js** — the Phase 4a progress interface, exactly as specified in
  NAV-SPEC §7: `getActivityState(id)` -> 'done'|'current'|'none',
  `markVisited(id)`, `markCompleted(id)`, `getSectionProgress(chapterId,
  section)` -> {done, count}, `getChapterProgress(chapterId)` -> {done,
  total}, plus `getCurrentActivity(chapterId)` (the "up next" pointer: last
  opened not-done activity, else first not-done in sequence). Backend:
  in-memory state + localStorage under versioned key
  `greek-tutor-progress-v1` ({version, visited, completed, current}).
  Phase 6 swaps this backend to IndexedDB WITHOUT changing the interface.
- **nav.js** — module-level (deliberately NOT persisted) accordion expansion
  memory per chapter: `getExpanded/setExpanded/toggleExpanded/isExpanded/
  hasAnyExpanded`. Keeps hub<->activity round trips stable; resets on reload.
- **content.js additions** — `SECTIONS` const (['learn','drill','exercise',
  'quickReview']); `getSequence(chapterId)` (uses chapter JSON top-level
  "sequence" array when present, else falls back to section concatenation —
  the pipeline's real sequence for chapt-01.json drops in with NO code
  change); `getSequencePosition(chapterId, activityId)` -> {index, total,
  prevId, nextId} (index -1 = not in sequence, rail degrades);
  `getNextChapter(chapterId)` -> {id, number, title, available};
  `sectionOfActivity`, `findChapterIdOfActivity`.

### New components (src/components/)
- **UnitMap.svelte** — the accordion Unit Map. Two variants via prop:
  `variant="hub"` (mobile chapter hub, sections toggle) and
  `variant="sidebar"` (>=768px persistent left sidebar, all sections always
  expanded, header taps inert). Chapter header block with progress line +
  teal progress bar; four section cards (chevron, name, "{done} of {count}");
  red-bullet activity rows with right-slot state (green check = done, teal
  "up next" = current, default = untouched). Props: `expandedSections`,
  `focusSection` (scrolls that card into view on the :section route),
  `highlightActivityId` (teal row for the open activity, sidebar),
  `progressTick` (bump to force progress re-read). Emits `toggle`.
- **TopBar.svelte** — back (contextual), ellipsized title, TOC list icon
  (hub/activity only), plus an empty placeholder slot reserved for the
  later-phase Search/Index icon.
- **BottomBar.svelte** — five equal tabs Learn/Drill/Exercise/Review/Map with
  inline Tabler-style SVGs (book/repeat/pencil/eye/sitemap), 10.5px labels,
  safe-area padding. Section taps -> `#/chapter/:id/:section`; Map computes
  the current activity's section, seeds nav.js expansion, -> `#/chapter/:id`.
  If the target hash equals the current hash it dispatches a synthetic
  `hashchange` so re-taps still re-apply expansion (see §3 gotcha 2).
- **SequentialRail.svelte** — [Previous] "n of N" [Next], 44px targets, Next
  primary. Previous disabled at n=1; Next on last item emits `end` (App opens
  the dialog). Not-in-sequence fallback: hides count, Previous -> hub,
  console.warn.
- **EndOfChapterDialog.svelte** — in-app modal per NAV-SPEC §4, including the
  "Chapter {n+1} is coming soon" variant when the next chapter is in the TOC
  but not built (currently always that variant, since only chapt_1 loads).

### Rewired
- **App.svelte** — owns ALL chrome and routing now. Flex shell: fixed TopBar
  / scrolling middle (`.scroll-area` is the app scroll container) / fixed
  BottomBar. Routes per NAV-SPEC §1 including the new
  `#/chapter/:id/:section`. On every hashchange: `audio.stop()`, scroll to
  top (EXCEPT the hub :section route — UnitMap scrolls the target section
  into view instead), document.title = "Greek Tutor — {screen title}",
  expansion recompute, progressTick++. Wide (>=768px via matchMedia, single
  breakpoint): sidebar UnitMap shown, bottom bar hidden, hub route renders a
  lightweight header pane instead of the accordion.
- **ActivityHost.svelte** — chrome stripped (content only). On activity
  mount/change: `markVisited`; contentAudio activities (that render real
  content, i.e. not `categories` stubs) also `markCompleted` on visit, per
  spec. Dispatches `progress` so the shell refreshes indicators.
- **SelectActivity.svelte** — calls `markCompleted(activity.id)` on finish
  (all questions answered). This is the ONLY completion rule added for scored
  activities; real scoring semantics arrive in 4b.
- **ChapterNav.svelte** — chrome stripped, TOC content only.
- **ChapterHome.svelte** — DELETED (replaced by UnitMap).
- **app.css** — new shell/topbar/bottom-bar/rail/accordion/sidebar/modal
  styles appended; old `.screen`/`.backbtn` styles replaced.
- **index.html** — added `<link rel="icon">` (silences the /favicon.ico 404).

## 2. Verification status (against NAV-SPEC §10 acceptance checklist)

Verified by scripted tap-through (playwright-core driving system Chrome,
390x844 touch emulation) plus headless DOM checks at 1024px:

- [x] All four routes render on direct load (incl. #/chapter/:id/:section).
- [x] Bottom bar visibility (hidden on TOC and >=768px), active states
      (activity -> its section; :section route -> that tab; plain hub ->
      Map), all five destinations, safe-area padding in CSS.
- [x] Section tap expands exactly that section; scroll-into-view wired.
- [x] Rail walks the full fallback sequence (26 items for chapt_1 =
      10 learn + 6 drill + 8 exercise + 2 quickReview) with correct n of N;
      Next advances; Previous disabled at 1.
- [x] End-of-chapter dialog: opens on last-item Next, shows "Chapter 2 is
      coming soon" variant, Stay closes, Table of contents navigates.
- [x] 768px+: sidebar shown, bottom bar hidden, current row highlighted.
- [x] Progress: visiting pages marks done; green check renders on hub.
- [x] npm run build clean (45 modules).
- [ ] NOT verified — needs the user/device: iPhone Safari on the deployed
      preview, offline/airplane-mode pass (no new network deps were added,
      so no regression is expected), localStorage survival across real app
      relaunches, audible confirmation that audio halts on navigation.

## 3. Bugs found and fixed this session (Svelte 4 gotchas — READ before 4b)

1. **Svelte 4 template reactivity**: expressions only re-render when a
   variable NAMED IN THE EXPRESSION changes. `{#if isOpen(section)}` never
   updated when `expandedSections` changed — this made every tap on the
   mobile hub appear dead (the "iPhone completely broken" report; iPad was
   fine because the sidebar never toggles). Rule for 4b components: never
   hide reactive reads inside helper functions called from the template —
   inline the expression (`{@const open = isSidebar ||
   expandedSections.includes(section)}`) or pass the reactive values as
   arguments (`rowState(act.id, currentId, progressTick)`).
2. **Same-hash navigation is a no-op**: setting location.hash to its current
   value fires no hashchange. BottomBar.go() dispatches a synthetic
   `new Event('hashchange')` in that case. Reuse this pattern for any future
   control that may target the already-active route.
3. **MediaQueryList.addEventListener needs Safari 14+** — App.svelte falls
   back to addListener/removeListener. Keep the fallback.
4. The `progressTick` counter in App.svelte is the mechanism that makes
   progress.js reads reactive (module state is invisible to Svelte).
   Anything in 4b that changes progress outside a route change must bump it
   (ActivityHost's `dispatch('progress')` is the existing path).

## 4. State of the data layer (unchanged this session — 4b will change it)

- No JSON files were modified. chapt-01.json still has NO top-level
  "sequence" array — the rail runs on the fallback order. When the pipeline
  (chat-side) delivers it, it drops in with no code change.
- Known data gaps flagged in chapt-01.json `_verify` fields: Six Points 3-6,
  History/Bibliography full text, remaining soundHints (theta..omega rows
  exist but Quick Chart hints unverified), phonetic-reading Greek display
  text, proverb list completeness, personal/place names, diacritic tile
  inventory. These are the PLAN.md "Extraction backlog" (chat-side, not
  Claude Code work).

## 5. Entry points for Phase 4b (per PLAN.md)

Where each 4b workstream plugs into what now exists:

- **Audio role reassignment (critiques 2,5,7,8,...)**: the play-mode
  plumbing is content.js `pickAudio()` (modes: audioShort/audioName/
  audioFull) + the `play` field on activities. NOTE: several activities
  specify `"play": "audioShort"` but the letter objects define `audioName`
  (the A_*N name-only clips) — `pickAudio('audioShort')` currently returns
  `letter.audioShort` which is UNDEFINED on every letter, so chart taps fall
  back silently. This is exactly critique territory: fix the field mapping
  as part of 4b audio semantics (either rename data fields or map
  'audioShort' -> letter.audioName).
- **audio.stop() on route change**: DONE here (the one 4b item NAV-SPEC
  pulled forward). audio.js is otherwise untouched.
- **Rich note/text rendering**: ContentAudio.svelte still renders `note` /
  `noteButton` / `textPartial` as plain strings. 4b's structured rich
  content replaces those render paths; the activity `instructions` line is
  rendered by ActivityHost.
- **New components (spell, reading categories, phonetic)**: ActivityHost is
  the dispatch point — it currently stubs `activity.categories` and unknown
  `activity.type` with "arrives in a later phase" cards. Add branches there.
  New scored components must call `markCompleted(activity.id)` on finish and
  can rely on markVisited already having run.
- **Completion semantics**: current rules (contentAudio = done on visit;
  select = done on finish) live in ActivityHost.record() and
  SelectActivity.advance(). 4b scoring should refine these WITHOUT changing
  the progress.js interface.
- **glossShort per lemma**: lexicon-chapt01.json already carries glossShort;
  buildSelectQuestions() currently uses `gloss` for both drills — switch the
  EN->GK drill to glossShort per critique 15.
- **Introduction section**: route scheme already tolerates a pseudo-chapter
  id (routes are string ids resolved through content.js `chapters` map);
  add the intro content object + TOC entry when INTRO extraction lands.

## 6. Housekeeping

- Working tree is uncommitted: new files (lib/progress.js, lib/nav.js, five
  components, this file, NAV-SPEC.md, PLAN.md) + modified (App.svelte,
  content.js, ActivityHost, ChapterNav, SelectActivity, app.css, index.html)
  + deleted (ChapterHome.svelte). Suggest committing as the Phase 4a unit
  before starting 4b.
- Deploy note: the iPhone home-screen PWA uses autoUpdate; after the Netlify
  deploy, close and reopen the installed app (possibly twice) so the new
  service worker takes over before device testing.
- Test tooling: a scripted tap-through lives in the session scratchpad
  (ephemeral, not in the repo). If 4b wants repeatable UI tests, add
  playwright-core as a devDependency and commit a test script — it drives
  the system Chrome install with iPhone viewport/touch emulation and needs
  no browser download.
