# Greek Tutor PWA — Implementation Plan v2

Post-device-validation revision (2026-07-16). Supersedes the phase plan in
PROJECT.md; PROJECT.md remains the decisions log for source-material facts,
naming contracts, and the data model. This document is written to serve as
the Claude Code handoff brief: drop it in the repo root as PLAN.md.

## Status snapshot

DONE — Phase 1 (analysis, data model, transcode pipeline): 8,521 WAVs
transcoded locally to m4a (32k mono, loudnorm); audio-manifest generated;
naming contract stable.

DONE ~90% — Phase 2 (Chapter 1 pilot content): chapt-01.json,
lexicon-chapt01.json, toc.json, font-map.json drafted and largely verified
against DOSBox (two screenshot batches + listen-checks + user critique PDF).
Remaining: deep-extraction items listed under "Extraction backlog".

DONE — Phase 3 (walking skeleton + device validation): Svelte/Vite/PWA
skeleton live on Netlify (GitHub CD), installed to iPhone home screen.
VALIDATED ON DEVICE: offline app shell, offline replay of cached audio
(rangeRequests + cache-warming fix), audio on tap. This closes the
project's #1 risk.

CURRENT — Phase 4 (below), gated on the navigation decision.

## Revised phase plan

Principle (per user direction): perfect Chapter 1 completely — every
component, every text, every behavior — before any horizontal scale-out.
Chapter 1 is the template; chapters 2-28 instantiate it.

### Phase 4a — Navigation rework  [BLOCKED ON USER DECISION]
Proposals delivered as mockups (chat, 2026-07-16):
  A) Persistent bottom section bar (Learn/Drill/Exercise/Review/Map) +
     sequential Prev/Next rail on every activity page.
  B) Map-first hub: chapter home = accordion Unit Map with progress;
     activity pages carry rail + Map button only.
  Recommended: A's chrome with B's hub as the Map destination.
Shared requirements regardless of choice:
  - Sequential Prev/Next on every page, following the ORIGINAL's
    interleaved order (learn segment -> its drills -> its exercises).
    Sequence is data: add "sequence" array per chapter JSON.
  - End-of-chapter Next rolls to next chapter with confirmation dialog
    (mirrors original's last-page dialog).
  - Global TOC reachable from top bar; Exit not needed (OS handles).
  - >=768px: chapter map becomes persistent left sidebar, content right
    (CSS grid breakpoint). Two-column responsive per critique #3.
  - Keep red-bullet menu aesthetic for chapter menus.

### Phase 4b — Chapter 1 complete-and-correct (the critique backlog)
Audio semantics (critiques 2, 5, 7, 8, 11, 13, 14, 17, 18, 22):
  - Stop audio on navigation away from page (audio.stop() on route change).
  - Letter charts/exercises play audioShort (name only, A_*N files) on:
    Learn Letter Transliterations, Learn Capital Letters, Transliteration
    Drill rows, Letter-to-Name, Name-to-Letter, Transliterate the Letter,
    Transcribe to Greek, Pronounce buttons, Check Answer, Review Letters
    Quick Chart rows. audioFull (name+sound) ONLY on: Learn Letters
    stepper, Letter Names and Sounds Drill, Capital Letters Drill.
  - Learn Diphthongs: clicking diphthong plays diphthong sound; clicking
    example word plays example audio (restore examples per critique 9).
  - Fix silent final three diphthong tiles (ou, ui, eu) in Learn
    Diphthongs (Diphthong Drill wiring is correct — reuse it).
  - Learn Vocabulary flashcard: auto-play pronunciation on Next (and
    Pronounce button), per critique 11.
Layout/typography/pedagogy (critiques 3, 4, 6, 7, 8, 12, 22):
  - PRINCIPLE (user, critique 7): visual arrangement is pedagogy; walls
    of text raise the affective filter. Preserve the original's visual
    structure: numbered/indented lists, headers, definition blocks,
    spatial layouts (vowel length stairs), left-to-right arrow cue on
    letter grids.
  - Notes: green info box for parenthetical notes at bottom (fine);
    main teaching text (definitions, note-button content) rendered ABOVE
    content with real formatting, not in a banner, not collapsed.
    Exception: very large notes (Six Points) collapsed-by-default,
    expandable (critique 4).
  - Six Points restored on Learn Letters with formatting (all 6 points
    now captured; extract verbatim).
  - Add English Transliteration field to Learn Letters stepper
    (critique 4 screenshot shows it in original).
  - Data model change: activity "note" becomes structured rich content
    (see Rich text below), add glossShort per lemma (drills show "Christ",
    chart shows "Christ, Messiah" — critique 15: NEVER ad-lib glosses;
    follow the original per-screen).
  - Review Vocabulary Chart: Greek+English side-by-side rows, Greek
    clickable for audio, NT counts shown (critique 22).
  - Review Letters Quick Chart: 5-column matrix that works on mobile;
    row click plays audioShort (name only).
  - Transliteration Drill / Transliterate the Letter: transliteration is
    the roman-representation matrix (a, b, g, ... e-macron, th, ph, ch,
    ps, o-macron), NOT English spelling; rebuild option matrix from the
    original (critiques 13, 18).
  - Vocabulary Speller: "Show Answer" checkbox resets on Next
    (critique 21).
Component completion (critiques 20, 21 — no more deferral):
  - spell component (Vocabulary Spelling Exercise): tile keyboard incl.
    diacritic tiles + composite vowels, With Accents toggle, Check
    Answer, Score dialog (Number Correct / Total Attempted / Percentage /
    Exercises Completed — per original screenshot), Greek Keyboard help
    dialog, physical keyboard entry mapped to Unicode.
  - Reading People, Places and Letters: three-category self-check with
    per-category Greek/English panes and audio.
  - Phonetic Reading: display extracted Greek phonetic text (see
    Extraction backlog), reveal answer, Prev/Next.
  - audioPlayer sequencing where needed (Say Alphabet exists; whole-list
    playback on vocab chart exists).
New content:
  - Introduction section (INTRO books): welcome page + navigation
    tutorial pages + associated audio; add to TOC above Chapter 1
    (critique 1). Keep Previous/Next/Exit/TOC button vocabulary where
    appropriate (adapted: Exit -> TOC).

### Phase 4c — Offline audio pack download  [PROMOTED from old phase 5]
Rationale: offline-first is requirement #1; runtime caching is proven;
quota-scale behavior (88 MB in Cache Storage on iOS) is the last storage
unknown and must be settled before content scale-out.
  - DownloadManager: fetch manifest subset per chapter into the existing
    'greek-tutor-audio' cache with progress UI; "Download chapter" on
    chapter hub; "Download all" in settings.
  - navigator.storage.persist() request + storage estimate display.
  - Content-versioning story for changed audio (manifest hash).
  - Device test: full 88 MB pack on the iPhone; verify persistence over
    several days.

### Phase 4d — iPhone re-validation checkpoint
Navigation + all Chapter 1 components + full audio pack, tested on device
by user. Gate to phase 5.

### Phase 5 — Content scale-out (chapters 2-28 + VOCAB/JOHN/REV books)
  - Upgrade TBK extractor first (see Extraction backlog: rich text,
    completeness). Pipeline drafts chapter JSONs; user verifies against
    DOSBox chapter-by-chapter (screenshot only what extraction cannot
    reach).
  - Chapter 2 (Accents) doubles as the forcing function for the remaining
    unknown font codes (breathing+accent combos).
  - New components as encountered: match, parse, translate variants.
    parse-schemes.json lands here.
### Phase 6 — Polish
  - IndexedDB progress (per-activity scores, completion, resume point);
    progress powers the map/hub indicators.
  - Polytonic Greek webfont (e.g. SBL Greek / GFS family) replacing
    system serif.
  - Install instructions page for the end user; app icon refinement.
### Phase 7 — Handover
  - Final deploy, sister-in-law onboarding, author courtesy copy to
    Dr. Hildebrandt.

## Extraction backlog (Claude-side pipeline work, no user action)
  - Rich-text extraction from TBK: recover text runs WITH newlines/tabs/
    styling so app text preserves original formatting (user critique 12);
    eliminate all textPartial ellipses (History, Bibliography, Six Points,
    notes) — full texts also now captured in user screenshots as
    cross-check.
  - Proverb list is INCOMPLETE (screenshots show "Familiarity breeds
    contempt", "Keep the faith" beyond the extracted 12): re-extract
    answers AND the Greek phonetic display text for each.
  - Remaining 14 personal names + Greek place-name spellings.
  - INTRO book extraction (text + audio inventory + page order).
  - Per-chapter "sequence" arrays (original Sequential Next order) —
    recover from TBK page order.
  - transliteration option matrix verbatim (incl. e-macron/o-macron).

## Division of labor
Claude (chat): pipeline/extraction, data files, plans, specs, review.
Claude Code (local repo): implementation of 4a-4c per this document,
iterating against npm run dev; commit granularity per backlog item.
User: navigation decision (gate for 4a), DOSBox spot-verification,
device testing at 4d, content verification loop in phase 5, deploys are
automatic via Netlify CD.

## Standing directives (user-set, apply everywhere)
  1. Fidelity to the original: vocabulary glosses, instruction text,
     audio semantics, and visual arrangement follow the original program
     exactly unless explicitly amended. Do not ad-lib content.
  2. Pedagogy over minimalism: preserve visual structure (lists,
     indentation, spatial layouts); avoid walls of text; keep the
     affective filter low.
  3. Keep Previous/Next sequential rail ubiquitous; navigation follows
     the chosen proposal.
  4. Offline behavior is never allowed to regress; every phase ends with
     an offline check.
  5. Audio stops on page exit.
