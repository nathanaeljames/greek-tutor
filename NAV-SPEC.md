# NAV-SPEC.md — Phase 4a Navigation Rework (Claude Code work order)

Decision (user-approved 2026-07-16): Proposal A's persistent bottom
section bar, with Proposal B's accordion Unit Map as the chapter hub and
as the bar's Map destination. This spec is implementable standalone;
PLAN.md holds context and PROJECT.md holds source-material decisions.

Codebase orientation: Svelte 4 + Vite + vite-plugin-pwa. Hash routing in
src/App.svelte; content resolution in src/lib/content.js; audio in
src/lib/audio.js; components in src/components/. Data: src/data/toc.json,
src/data/chapt-01.json, src/data/lexicon-chapt01.json.

## 1. Routes (hash-based, unchanged scheme, one addition)

  #/                                  Global TOC (chapter list)
  #/chapter/:chapterId                Chapter hub (accordion Unit Map)
  #/chapter/:chapterId/:section       Hub with ONE section expanded
                                      (:section in learn|drill|exercise|quickReview)
  #/activity/:chapterId/:activityId   Activity page

Back/forward browser gestures must work (hash history is free; do not
intercept). Refresh on any route must render that route.

## 2. Screen chrome

### 2.1 Top bar (all screens)
  - Left: back button. Context: activity -> its chapter hub; hub -> TOC;
    TOC -> none (hide button).
  - Center/flex: title. TOC: "Greek Tutor". Hub: "{n}. {title}".
    Activity: activity title, single line, ellipsize.
  - Right: TOC shortcut icon (list icon) on hub and activity screens;
    navigates to #/. (Search/Index icon is a later phase; leave a slot.)

### 2.2 Bottom section bar (chapter context only)
  - Visible on: chapter hub and activity screens. Hidden on: TOC screen
    and on wide viewports (see 5).
  - Five items, equal width: Learn, Drill, Exercise, Review, Map.
    Icons (current set from Tabler or equivalent inline SVG): book,
    repeat, pencil, eye, sitemap. Label under icon, 10-11px.
  - Tap Learn/Drill/Exercise/Review -> #/chapter/:id/:section (hub with
    that section expanded, others collapsed, section scrolled into view).
  - Tap Map -> #/chapter/:id (hub, expansion state: the section
    containing the current/last activity expanded; others collapsed).
  - Active state: while on an activity, the item for its section is
    highlighted (teal); on hub via :section route, that section's item
    highlighted; on plain hub, Map highlighted.
  - Respect iOS safe-area: padding-bottom: env(safe-area-inset-bottom).
  - Bar is position: sticky at viewport bottom within the app scroll
    container (not position: fixed inside any transformed ancestor).

### 2.3 Sequential rail (activity screens only)
  - Sits directly above the bottom bar (mobile) / at content bottom
    (wide). Layout: [Previous] "n of N" [Next].
  - Previous disabled at n=1. Next at n=N opens the end-of-chapter
    dialog (see 4).
  - Buttons min 44px touch targets. Next is the primary (filled) button.

## 3. Sequence model (data-driven)

  - chapt JSON gains top-level "sequence": ordered array of activity ids
    representing the ORIGINAL program's Sequential Next order
    (interleaves learn -> related drills -> related exercises; recovered
    from TBK page order by the content pipeline).
  - Runtime rule: use chapter.sequence when present. Fallback when
    absent: concatenation learn[] + drill[] + exercise[] + quickReview[]
    (current behavior order). Implement fallback now so navigation ships
    before the extraction lands; chapt-01.json will be updated with the
    real sequence by the pipeline (chat-side) — no code change needed
    when it arrives.
  - content.js additions:
      getSequence(chapterId) -> [activityId]
      getSequencePosition(chapterId, activityId) -> { index, total,
        prevId|null, nextId|null }
  - Activities not present in sequence (defensive): rail hides position
    indicator and offers Previous->hub only. Log console.warn.

## 4. End-of-chapter dialog

  - Trigger: Next on the last sequence item.
  - Modal (simple in-app overlay, not window.confirm), mirroring the
    original's last-page dialog language, adapted:
      Title: "End of chapter"
      Body: "This is the last page of {chapter title}."
      Buttons: [Next chapter] (if a next chapter exists AND is available
      in the build) -> first sequence item of next chapter;
      [Table of contents] -> #/ ; [Stay] closes dialog.
  - If next chapter exists in toc but content not yet built: show
    "Table of contents" and "Stay" only, with a one-line note
    "Chapter {n+1} is coming soon."

## 5. Responsive layout (>=768px)

  - Two-column CSS grid: left sidebar 260-300px = persistent Unit Map
    (same accordion component, all sections expanded by default,
    independent scroll); right = content pane (max-width ~680px,
    centered in remaining space).
  - Bottom section bar hidden (sidebar supersedes it). Sequential rail
    remains at content bottom. Top bar spans full width.
  - Current activity highlighted in the sidebar (teal row); clicking any
    sidebar row navigates. Sidebar shows the same progress affordances
    as the hub.
  - Single breakpoint at 768px; no intermediate layouts. Test 320px,
    390px, 768px, 1024px+.

## 6. Chapter hub (accordion Unit Map) — component spec

  - Header block: chapter number + title, progress line "{done} of
    {total} complete", thin progress bar (teal on parchment-dark track).
  - Four section cards in fixed order Learn, Drill, Exercise, Quick
    Review. Card header row: chevron (right=collapsed, down=expanded),
    section name, right-aligned "{done} of {count}".
  - Expanded card lists activity rows: red bullet (keep the original's
    red-dot motif), activity title, right slot = completion state.
  - Row states: completed (check, green), current/up-next (label
    "up next", teal), untouched (default ink), in-progress optional
    later. Tap row -> activity route.
  - Expansion state per 2.2; preserve expansion in module-level memory
    (not persisted) so hub<->activity round trips feel stable.

## 7. Progress interface (stub now, IndexedDB in phase 6)

  - New module src/lib/progress.js exposing:
      getActivityState(activityId) -> 'done' | 'current' | 'none'
      markVisited(activityId), markCompleted(activityId)
      getSectionProgress(chapterId, section) -> { done, count }
      getChapterProgress(chapterId) -> { done, total }
  - Phase 4a implementation: in-memory Map + localStorage persistence
    behind this interface (single JSON key, versioned). Phase 6 swaps
    the backend to IndexedDB WITHOUT changing the interface.
  - markVisited on activity mount; markCompleted rules arrive with 4b
    scoring (do not invent completion semantics beyond: contentAudio
    pages count completed on visit; scored activities on finish).

## 8. Route-change side effects

  - audio.stop() on every route change (implements critique #2; wire in
    App.svelte hashchange handler).
  - Scroll content container to top on route change (except hub
    :section route, which scrolls the target section into view).
  - Document title: "Greek Tutor — {screen title}".

## 9. Out of scope for 4a (do not build here)

  - Any critique-4b content/behavior fixes (audio role reassignment,
    note formatting, new components) except audio.stop() above.
  - Search/Index. Real IndexedDB. Introduction section content (route
    scheme must tolerate a future "intro" pseudo-chapter id).

## 10. Acceptance checklist

  [ ] All four routes render on direct load and refresh.
  [ ] Bottom bar: correct visibility, active states, safe-area padding;
      all five destinations correct.
  [ ] Section tap expands exactly that section, scrolled into view.
  [ ] Sequential rail walks the full chapter in sequence order (fallback
      order until sequence data lands) with correct n of N.
  [ ] End-of-chapter dialog per section 4 (Chapter 2 absent -> "coming
      soon" variant).
  [ ] 768px+ shows sidebar, hides bottom bar; sidebar navigation works;
      current row highlighted.
  [ ] Audio stops on every navigation.
  [ ] Progress affordances render from progress.js; visiting a Learn
      page marks it done; survives app reload (localStorage).
  [ ] Offline: full navigation works in airplane mode after one online
      load (no regression — standing directive #4).
  [ ] npm run build clean; deployed preview tested on iPhone Safari.
