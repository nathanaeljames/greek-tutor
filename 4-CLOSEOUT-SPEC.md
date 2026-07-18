# 4-CLOSEOUT-SPEC.md — Phase 4 closeout (Claude Code work order)

Prerequisites: HANDOFF-4B.md, HANDOFF-4C.md, PLAN.md. Commit any pending
work first. This spec has two parts: (A) fixes for every item in Fable's
PHASE4-REVIEW (18 items, numbered identically here), and (B) a scoped
architectural code review of the whole app as it stands, since most of
the build-out to date was implemented by another model and phase 5 will
scale the codebase across 27 more chapters. Fix what the review finds if
it is load-bearing; list-only the nits. Output: HANDOFF-4.md in the
usual format, closing out phase 4 entirely.

## 0. Drop-ins (delivered alongside this spec)

  src/data/chapt-01.json   Six Points per-letter audio wiring (item 6),
                           greekTaps inline-tap map on the Zeta point,
                           'lead' fields on Diphthongs/Iota Subscripts
                           (items 12-13), capitals drill play:audioShort
                           (item 10), Review Letters columns without
                           Pronounce (item 18).
  src/data/intro.json      Getting Around copy approved; _userDecision
                           removed. DELETE the draft-tag rendering path
                           in ContentAudio if nothing else uses it.
  public/icons/*           App icon set (item 5): icon.svg (source),
                           icon-512.png, icon-192.png, icon-maskable-512
                           .png, apple-touch-icon.png, plus
                           lamp-pixel-512.png (alternative art — see
                           item 5 before wiring).

## Part A — PHASE4-REVIEW fixes

### A1. Storage Used never decreases after Clear (likely duplicate caches)
Symptoms: usage rises on download, does not fall on Clear, and rises
AGAIN on re-download (unbounded growth) — that last part means bytes are
being written somewhere Clear does not touch. Prime suspect: TWO audio
caches — the manual 'greek-tutor-audio' cache the DownloadManager writes
to, and a separately named workbox runtime cache created by the SW audio
route (workbox default-names runtime caches unless cacheName is set).
Diagnose first: `await caches.keys()` in the console after a download +
clear cycle.
Required outcome:
  - Exactly ONE audio cache name, shared by DownloadManager, audio.js
    play-time caching, and the SW runtime route (set workbox cacheName
    explicitly).
  - clearAllAudio() deletes every audio-holding cache (belt-and-braces:
    delete any cache whose name matches the audio pattern, then reset
    bookkeeping) and re-runs storage.estimate() so the Settings figure
    refreshes in place.
  - Migration: on startup, if a legacy/duplicate audio cache name
    exists, delete it (one-time cleanup for the already-deployed
    iPhone).
Acceptance: in desktop Chrome, usage drops after Clear; download →
clear → download returns usage to the first-download level, not double.
On iOS, Safari may report reclamation lazily — document observed
behavior in the handoff, but the duplicate-write bug must be gone.

### A2. Larger screens still waste space (PHASE3-REVIEW item 3, carried)
Implement real responsive use of width, not just a centered mobile
column. At a breakpoint around 900px:
  - TOC: chapter list becomes a two-column grid of chapter cards.
  - Chapter hub: Unit Map as a fixed left sidebar with the activity
    area beside it (the current wide layout attempts this — finish it,
    see A3).
  - Activity pages: raise the content max-width (~760-840px) and let
    charts/grids (alphabet tables, review charts, speller) breathe at
    the wider size. Single column below the breakpoint, unchanged
    phone behavior.
Keep it to CSS + minor layout markup; no component rewrites for this.

### A3. iPad sidebar pans independently side-to-side
The hub sidebar must scroll vertically with/beside the page but never
pan horizontally or drag as a detached layer. Fix with a proper layout:
sidebar position sticky (or fixed within a grid column), overflow-y:
auto, overflow-x: hidden, and eliminate whatever horizontal overflow on
the page body allows the sideways pan (audit for any child wider than
the viewport at iPad sizes).

### A4. Double-tap zoom breaks rapid tapping (speller especially)
Apply `touch-action: manipulation` globally (html/body) and on all
interactive elements. This removes double-tap-to-zoom (and the 350ms
tap delay) while PRESERVING pinch-zoom for accessibility — do not use
user-scalable=no. Verify on the speller: rapid same-tile taps and rapid
Backspace must not zoom.

### A5. App icon
Assets provided (see §0). Default plan: wire the VECTOR set — manifest
icons 192 + 512 (purpose any) + icon-maskable-512 (purpose maskable),
apple-touch-icon.png link tag, favicon from icon.svg. lamp-pixel-512.png
is a retro pixel-faithful alternative derived from the original LAMP.ICO
— include it in the repo; Fable picks the final art at device review and
swapping is a one-line manifest change. Note: iOS caches the icon per
install; the handoff must remind that re-adding the PWA to the Home
Screen may be needed to see the new icon.

### A6. Color semantics: blue = tappable, and restore letter tap audio
Two parts, one rule. Rule (standing directive): blue text is reserved
exclusively for tappable things; any non-tappable text currently blue
becomes the dark green text color.
  - Data (delivered): Six Points now wires audio for every standalone
    Greek letter — Letter Confusion rows (tap plays the letter name),
    Linguistic Pronunciation rows (each letter is individually
    tappable: value is now {letters:[{greek,audio}]}), and the Zeta
    point carries greekTaps ({"ζ": id}) for the inline ζ.
  - RichContent: render defList values of the letters-list shape as a
    row of inline tappable Greek chips; support an item-level greekTaps
    map by splitting the item's text on exact substring matches and
    rendering those substrings as tappable spans (first occurrence is
    sufficient). Greek NOT wired stays plain dark green (e.g. the π
    inside the Pronunciation-variations paragraph — Fable's red
    highlight — must NOT become tappable).
  - Sweep the app: exercise option buttons, chart glyphs, etc. — colors
    must follow the rule everywhere (tappable Greek blue, static Greek
    and all static text dark green/ink).

### A7 + A14. Navigation rules: no dead-end Next, ever (standing rule)
New standing directive: a greyed-out SEQUENTIAL Next must never exist.
On every activity page the sequential Previous/Next rail is present and
live; when sequential Next has no successor (end of chapter), tapping it
opens a dialog — mirror the original's pattern ("This is the last
page...") offering Stay / Chapter Map / Table of Contents. Audit every
activity type for compliance (Fable saw the dialog in some places but
not at Learn Letters).
A14 (Learn Letters restructure, applies the same rule locally): mirror
the Phonetic Reading pattern — activity-local [Previous | Next Letter]
row for the 24-letter stepper (greyed local Next at omega is fine),
Say Alphabet with it, then the Six Points accordion, then the ALWAYS-
PRESENT sequential Previous/Next rail below. The learner must be able
to leave Learn Letters without stepping all 24 letters.

### A8 + A9 + A16. Stale content across adjacent same-type activities
One root cause, three sightings: Letter-to-Name/Name-to-Letter (A8),
Transliterate/Transcribe (A9), Greek-to-English/English-to-Greek drills
(A16). The banner (route/title) updates but the component instance is
REUSED by Svelte because consecutive routes render the same component
type, so per-activity state (question list, counters) never
reinitializes. Fix at the host level, not per component: wrap the
activity component in `{#key activityId}` in ActivityHost (and anywhere
else a route-driven component is chosen by type) so navigation always
destroys/remounts. Then audit for any other state derived from props at
init time (the review in Part B should specifically look for this
pattern). Acceptance: walk the ENTIRE 26-item rail forward, then the
entire rail backward, verifying on every page that the content matches
the banner; spot-check score/counter resets between the paired
exercises.

### A10. Capitals drill audio
Data now says play:"audioShort" — ensure the grid honors it (tap speaks
"alpha", not name + sound). Cheat-sheet correction recorded in
CHAT-HANDOFF.

### A11. (No action — confirmed pass: audio stops on page exit.)

### A12 + A13. Lead text above the chart
Diphthongs and Iota Subscripts data now carry a `lead` field (the
definition sentence formerly in `note`). Render `lead` as prominent body
text ABOVE the chart/rows (normal ink color, slightly larger than
instructions — core lesson text, not a banner). Green note banners
remain only for genuinely parenthetical content (the remaining
Diphthongs `content` note block stays where it is, below).

### A15. Learn Vocabulary visibility modes
Add a three-state segmented control (radio behavior): Show Both /
Hide Greek / Hide English. Hiding blanks the corresponding pane until
revealed (tap the hidden pane or switch mode reveals it — pick the
simpler; flashcard self-testing is the point). Default Show Both.
Persisting the mode across cards within the session is required;
across sessions is not.

### A17. Review Vocabulary Chart tap targets
Only the Greek words are tappable (blue); English glosses are static
dark-green text (also satisfies A6's rule).

### A18. Review Letters Quick Chart
Data drops the Pronounce column; respace the remaining four columns
equally and bump the font size back up if the narrow-screen shrink is
no longer needed.

## Part B — Architectural code review (scoped)

Purpose: most of the app was built by a different model; before phase 5
multiplies content by 27 chapters, find the things that will bite THEN.
Major issues only — fix and test them under this spec; nits get listed
in HANDOFF-4.md, not fixed. Do not restyle, rename, or reorganize
working code that isn't implicated (Fable's standing preference).

Review focus, in priority order:

  B1. ContentAudio dispatch. If bespoke layouts are keyed to chapter-1
      ACTIVITY IDS anywhere (rather than mode/data shape), that is a
      scaling defect — phase 5 reuses these layouts across 27 chapters.
      Convert id-keyed dispatch to mode-keyed dispatch driven by the
      data. If ContentAudio has grown past ~400 lines of branch arms,
      extract per-mode subcomponents (mechanical extraction only).
  B2. Component lifecycle assumptions. Beyond the A8 {#key} fix, grep
      for state initialized from props outside reactive statements —
      the whole class of "component reused across routes" bugs. Fix
      instances that route changes can reach.
  B3. Cache topology. After A1, assert in the review that exactly one
      audio cache exists and that DownloadManager, audio.js, and the SW
      route cannot drift apart again (single exported constant for the
      cache name).
  B4. progress.js module state + the progressTick re-render workaround.
      If converting progress to a Svelte store removes the workaround
      cleanly (small, mechanical), do it — the pattern has already
      caused delayed-indicator behavior and will multiply across
      phase 5 content. If the conversion ripples wide, list it for a
      dedicated pass instead.
  B5. Bundle shape for 28 chapters. Chapter JSON import strategy: if
      per-chapter data is statically imported, initial bundle grows
      with every chapter. Verify content.js can move to lazy dynamic
      imports (vite glob) without breaking offline (precache manifest
      must include the chunks). Implement if it is a contained change;
      otherwise document the migration plan for phase 5.
  B6. app.css. Phase-suffixed append blocks are approaching a monolith.
      Do NOT mass-refactor; flag dead selectors and any specificity
      hacks the phase-A fixes touch, and note a phase-5 convention
      (component-scoped styles for new components).
  B7. Anything else load-bearing the review surfaces (routing, a11y
      regressions, data-contract drift between content.js helpers and
      the JSON). Fix if major, list if minor.

## Acceptance checklist

  [ ] A1: single audio cache proven (caches.keys()); Chrome usage drops
      on Clear; download-clear-download does not double usage; legacy
      cache migration runs once.
  [ ] A2/A3: iPad + desktop widths use two columns (TOC grid, hub
      sidebar); sidebar cannot pan horizontally; phone layout
      unchanged at 320-430px.
  [ ] A4: no double-tap zoom anywhere; pinch zoom still works; rapid
      speller input clean on device.
  [ ] A5: icon set wired (manifest + apple-touch + favicon); pixel
      alternative in repo.
  [ ] A6: blue only where tappable, app-wide; all 23 wired Six Points
      letters play their names; the red-highlighted π stays plain.
  [ ] A7/A14: full-rail audit — sequential rail live on every page;
      end-of-chapter dialog fires from the last rail item; Learn
      Letters restructured with local stepper + always-present rail.
  [ ] A8/A9/A16: full 26-item rail walk forward AND backward, content
      matches banner on every page; paired exercises reset state.
  [ ] A10/A12/A13/A15/A17/A18 each verified per section.
  [ ] Part B findings: fixes tested; nits listed in HANDOFF-4.md.
  [ ] npm run build clean; airplane-mode regression pass (app shell +
      downloaded pack playback) — standing directive 4.
  [ ] HANDOFF-4.md written (same format as HANDOFF-4B/4C), including:
      per-item fix notes, review findings (fixed vs deferred), iOS
      icon-cache caveat, and updated entry points for phase 5.

## Out of scope

  Chapter 2+ content, font-map unknowns, IndexedDB progress backend,
  polytonic webfont, per-file manifest hashes, any visual redesign
  beyond the items above.
