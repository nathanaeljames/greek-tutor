# Greek Tutor PWA — Implementation Plan v3

Post-phase-4 revision (2026-07-19). Supersedes PLAN.md v2. PROJECT.md
remains the decisions log for source-material facts, naming contracts,
and the data model; CHAT-HANDOFF.md carries live state and the ten
standing directives; PIPELINE-INSIGHTS-v2.md (project knowledge) is the
extraction-pipeline reference. This document is the phase roadmap.

## Status snapshot

DONE — Phase 1 (analysis, data model, transcode pipeline): 8,521 WAVs
transcoded to m4a (32k mono, loudnorm); audio-manifest generated; naming
contract stable.

DONE — Phase 2 (Chapter 1 pilot content): chapt-01.json,
lexicon-chapt01.json, toc.json, intro.json, font-map.json fully verified
(DOSBox walks, listen-checks, critique PDF, TBK extraction cross-checks).
VERIFY-chapt01 fully resolved; Chapter 1 data is the template for
chapters 2-28.

DONE — Phase 3 (walking skeleton + device validation): Svelte/Vite/PWA
live on Netlify, installed on the target-class iPhone and iPad; offline
app shell + offline audio device-verified.

DONE — Phase 4 (Chapter 1 complete-and-correct + navigation + offline
packs), comprising: 4a navigation rework (bottom section bar + accordion
Unit Map hub); 4b Chapter 1 completion (RichContent, speller, reading,
phonetic, all audio semantics); 4c offline audio pack DownloadManager
(per-chapter + Download All, persist(), manifest-hash versioning);
closeout Part A (18 PHASE4-REVIEW fixes); Part B architectural audit
(mode-keyed ContentAudio dispatch, progress store, cache topology);
9-item punch list (greek-tap rule, storage counter, zoom fix); and the
storage pass with its three device-reported regression rounds (WebKit
Vary duplicate growth -> single-writer fix; O(n^2) bulk loop + missing
fetch timeouts -> snapshot + timeout/backoff; cold-start hang root-caused
to WebKit Cache Storage bring-up scaling with entry count — a platform
floor, not app code). Full record: buildout/HANDOFF-4.md sections 1-9.5.
Code state: commit ba5d0d4.

CURRENT — Phase 4.5 (below).

## Phase plan

### Phase 4.5 — Audio storage migration to IndexedDB  [CURRENT]
Decision (2026-07-19): audio bytes move from Cache Storage to IndexedDB
Blobs; Cache Storage returns to app-shell-only. Rationale: device
measurement proved the cold-start hang (~4s) occurs entirely before app
JS runs, in WebKit's per-ORIGIN Cache Storage bring-up, and scales with
the ~8.5k-entry audio library — unfixable in app code, and every phase 5
chapter makes it worse. Playback moves to Blob object URLs, which
dissolves the Range-request question entirely (Range is an HTTP concept;
object URLs seek locally with no fetch). The SW leaves the audio path;
single-writer becomes structural. One-time chunked, resumable migration
drains existing installs' legacy cache. Work order: buildout/4.5-SPEC.md
-> HANDOFF-4.5.md. Gate: cold-start metric with the full library well
under 1s after migration; airplane-mode pass; exact stable file counts.

### Phase 5 — Content scale-out (chapters 2-28 + VOCAB/JOHN/REV books)
  - Per-chapter protocol per PIPELINE-INSIGHTS-v2.md §VIII: extract TBK
    -> dump strings -> inventory audio -> convert via font-map (flagging
    unknown codes) -> assemble JSON against the Chapter 1 schema with
    the MANDATORY mode vocabulary -> validate programmatically ->
    VERIFY-chapt-XX.md -> iterate (1-2 passes expected per chapter).
  - Chapter 2 (Syllables & Accents) first: forcing function for the
    remaining unknown font codes (! # $ { } ~ | \ ` = : ; — the Greek
    Keyboard photo suggests !/#/$ are breathing+accent combos).
  - B5 lazy chapter loading lands at the START of phase 5 (JS chunks
    via import.meta.glob + async loadChapter at the route level;
    chunks are precached; mind the tree-shake trap). Independent of
    4.5's audio-byte storage.
  - New components as encountered: match, parse, translate variants;
    parse-schemes.json lands here. New activity types wire the shared
    greek-say tap pattern (standing directive 9), carry explicit modes,
    and test every chart at 320px (overflow clips).
  - Pipeline contracts (promptIsGreek/promptAudio, greekTaps standalone
    rule, lead, ui.arrowCue, order:"shuffled") per CHAT-HANDOFF.
  - Vertical-slice discipline continues: each chapter fully verified
    before the next begins; offline check per chapter batch.

### Phase 6 — Polish
  - Progress backend swap: localStorage -> IndexedDB behind the
    unchanged progress.js interface (per-activity scores, attempts,
    resume points; powers richer hub indicators). Reuses the idb
    infrastructure introduced in phase 4.5.
  - Polytonic Greek webfont (e.g. SBL Greek / GFS family) replacing
    system serif.
  - Install instructions page for the end user.
  - Carried nits: modal Escape/initial-focus pattern; playwright-core
    devDependency for repeatable device-emulated tests.

### Phase 7 — Handover
  - Final deploy, sister-in-law onboarding, author courtesy copy to
    Dr. Hildebrandt.

## Extraction backlog (chat-side)
  - Unknown font codes: resolve at chapter 2 via word evidence; update
    font-map.json verified tier.
  - Per-chapter sequence arrays: derive per chapter (pedagogy first,
    DOSBox Sequential-Next walk as verification — TBK storage order is
    NOT the answer).
  - Transliteration option matrices and any chapter-specific pools:
    extract verbatim per chapter as encountered.
  - Long-form prose (per-chapter notes; Bibliography variants if they
    differ by chapter): expect screenshot-assisted capture where TBK
    rich-text records resist extraction.

## Corrected facts this plan supersedes from v2
  - Audio semantics: audioFull's ONLY consumer is the Learn Letters
    stepper. The v2 claim that the Letter Names and Sounds Drill and
    the Capitals Drill use audioFull was WRONG (both device-verified as
    audioShort, name only). The cheat-sheet in CHAT-HANDOFF.md is
    canonical.
  - Navigation: decided and shipped (Proposal A chrome + Proposal B
    hub; Map tab later removed; four-tab bar; 900px breakpoint).
  - The Introduction pseudo-chapter is built; its navigation copy is
    the approved rewritten "Getting Around" text, not the original's
    Win 3.1 pages (a_intro1..4 unused by design).

## Division of labor (unchanged)
Claude (chat): pipeline/extraction, data files, plans, specs, review,
verification checklists, assets. Claude Code (local repo): implements
the current *-SPEC.md, writes HANDOFF-*.md back. Nathanael: DOSBox
verification, device testing, decisions; deploys automatic via Netlify.

## Standing directives
The ten standing directives (fidelity; arrangement-as-pedagogy;
sequential rail; offline never regresses; audio stops on exit; no
emoji; no dead-end Next; blue = tappable; greek-tap rule; no full
cache/store scan on the load path) live in CHAT-HANDOFF.md and apply
to every phase in this plan.
