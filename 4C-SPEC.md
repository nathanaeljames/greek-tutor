# 4C-SPEC.md — Phase 4c: Offline Audio Pack Download Manager (Claude Code work order)

Prerequisites: read HANDOFF-4B.md (especially §5 entry points and §3
Svelte 4 gotchas, carried from HANDOFF-4A) and PLAN.md phase 4c. Commit
the 4b working tree as its own commit before starting. This spec + the
three updated data files below are the complete 4c inputs.

Rationale (PLAN.md): offline-first is requirement #1; runtime caching is
proven on device; quota-scale behavior (~88 MB in Cache Storage on iOS)
is the last storage unknown and must be settled before phase 5 content
scale-out. Rural connectivity also means downloads must be explicit,
resumable, and never automatic.

## 0. Data drop-in + 4b verification carry-overs (do this first)

Replace in src/data/ (delivered alongside this spec):

  chapt-01.json        VERIFIED sequence order (B1 DOSBox walk): Learn
                       Iota Subscripts now precedes Diphthong Drill, and
                       Learn Bibliography is the FINAL page after both
                       Quick Review charts. Bibliography scholar names
                       corrected per A1 (Moulton / Colin Brown /
                       Rienecker; everything else stays verbatim, incl.
                       "Its not that bad"). iotaSubscripts rows gain
                       exampleGloss + exampleAudio. c1_ex_pronounce
                       gains order:"shuffled". c1_ex_speller gains
                       "spellerTiles" (authoritative tile inventory).
                       Resolved _verify flags scrubbed.
  lexicon-chapt01.json auto_dat audio wired (chapt_1_a_autoi, D2);
                       auto_unclear entry removed; Nazareth theta and
                       letter-name spellings verified; scrubbed.
  intro.json           Navigation page now carries drafted app copy per
                       A2 decision (c). The _userDecision key REMAINS
                       (so the existing "draft copy" tag still renders)
                       until Fable approves the wording. audioInventory
                       is now a role-annotated object (documentation
                       only — confirm nothing in code consumes it as an
                       array before dropping in).

Carry-over code items from the verification pass (small; do these
before the download manager so 4d device testing covers them):

  0.1 Learn Iota Subscripts page: render like the Learn Diphthongs rows
      (subscript vowel / sound / example / gloss). Tile tap plays
      row.audio (aii/eii/oii); EXAMPLE WORD tap plays row.exampleAudio
      (skotia / arxei / autoi). Verified behavior (D2): all three
      examples are tappable in the original.
  0.2 SpellActivity: render the tile keyboard from
      chapt-01.json spellerTiles instead of any hardcoded list.
      Inventory is 25 letters + 11 diacritic marks + 3 composites =
      39 tiles (adds the rough+grave combo; C1 photo finalized this).
      Each diacritic's "apply" field is the combining sequence to
      append to the previous character before NFC normalization —
      identical mechanics to 4b, just data-driven. Keep the existing
      With Accents / grading behavior untouched.
  0.3 Pronounce Letters Exercise: honor order:"shuffled" — present the
      24 letters in random order without repeats, reshuffled per visit
      (Fisher-Yates on mount). Verified original behavior (DOSBox
      observation + TBK draw-pool logic). Other activities are NOT
      affected; only shuffle where the data says so.
  0.4 Learn Vocabulary flashcard: instructions is now an empty string
      (placeholder text removed) — verify blank renders as nothing.
  0.5 Sanity: walk the rail; order ends ... speller, review vocab
      chart, review letters chart, bibliography.

## 1. Pack model (src/lib/packs.js)

  - Fetch /audio/audio-manifest.json at runtime (single source of
    truth; ~8.5k entries — do NOT bundle/import it into the JS build).
    Cache the parsed result in module memory for the session.
  - Pack id = first path segment of entry.src after "audio/"
    ("audio/chapt_1/a_alpha.m4a" -> "chapt_1"). Expose:
      loadManifest() -> { hash, entries }          (memoized)
      getPacks() -> [{ id, label, count, srcs[] }]
      getPack(packId) -> same shape | null
  - Pack labels from toc.json (chapter number + title; "Introduction"
    for intro; special books by their toc titles). Packs with no
    matching toc entry keep their raw id (defensive).
  - Only packs for BUILT content surface on chapter hubs (intro,
    chapt_1 for now — derive from the content.js chapters map, do not
    hardcode), but "Download all" in Settings covers every manifest
    entry (this is the 88 MB device test).

## 2. DownloadManager (src/lib/downloads.js, module singleton)

  - State via svelte/store: one writable store map packId ->
    { state, done, total, error } with state in
    'none' | 'downloading' | 'partial' | 'done' | 'update'.
    Module-level (downloads survive route changes; components only
    subscribe/unsubscribe).
  - API:
      packState(packId) -> readable store
      downloadPack(packId), downloadAll(), cancel(packId)
      clearAllAudio()  (cache delete + bookkeeping reset)
      storageInfo() -> { usage, quota, persisted }
  - Mechanics: open the EXISTING 'greek-tutor-audio' cache (same cache
    audio.js and the SW runtime route use). For each src: skip if
    cache.match(src) hits (natural resume), else fetch(src) and
    cache.put on ok responses. Concurrency 4 (simple promise worker
    pool over the src list). AbortController per pack for cancel.
    Progress = files completed / total (byte-accurate progress arrives
    only if the manifest later gains sizes — out of scope).
  - Failures: collect per-file failures, finish with state 'partial'
    and a Retry affordance (re-running downloadPack resumes for free).
    A fetch TypeError (offline) aborts the run with a "connection lost
    — progress saved" message; already-cached files are never lost.
  - Bookkeeping: one versioned localStorage key (mirror the progress.js
    pattern) recording per-pack { complete: bool, manifestHash } so hub
    badges render instantly without a cache scan. Reconcile lazily: on
    first packState subscription per session, one background
    cache.keys() pass corrects stale claims (e.g. user cleared Safari
    storage).
  - navigator.storage.persist(): request once, on the FIRST user-
    initiated download action (not on load). Record the boolean; never
    block or fail on rejection (iOS may auto-grant for installed PWAs
    or decline silently).
  - NEVER auto-start downloads (rural data budget; explicit taps only).

## 3. warmCache retirement (audio.js)

  - Remove the on-load warmCache() full-fetch of chapter 1 — the
    download manager owns bulk cache population now.
  - KEEP the play-time fetch-into-cache behavior (first play of a file
    while online must still cache the full file so the SW can range-
    slice it offline later — this is the no-pack fallback and offline
    audio must not regress for users who never tap Download).
  - audio.js remains the playback choke point; no other API changes.

## 4. UI

### 4.1 Chapter hub download control
  - On the hub header block (under the progress line), one compact
    control for the chapter's pack:
      none        [Download audio · n files]   (secondary button)
      downloading [progress bar + nn% + Cancel]
      partial     [Resume download]  + one-line "k of n saved"
      done        check + "Audio available offline"
      update      [Update audio]
  - Intro hub gets the same control (its pack is tiny).
  - Disable the start/resume buttons when navigator.onLine is false,
    with "Connect to the internet to download" hint text.

### 4.2 Settings / Storage screen
  - New route #/settings. Entry point: gear icon in the top bar's
    right slot on the TOC screen (NAV-SPEC 2.1 reserved this slot; on
    hub/activity screens the slot keeps the TOC icon — no change).
  - Contents, top to bottom:
      Storage: usage / quota from navigator.storage.estimate(),
      human-readable MB/GB; persistent-storage status line
      ("granted" / "not granted — iOS may reclaim storage if space
      runs low").
      Download all audio: whole-manifest download with one aggregate
      progress bar; warning line "Keep the app open until the download
      finishes." (iOS suspends backgrounded PWAs.)
      Downloaded packs: rows for built packs (state + file counts).
      Clear downloaded audio: confirmation dialog (reuse the 4a modal
      pattern), then clearAllAudio().
  - Keep it plain; this is a utility screen, not part of the lesson
    chrome (no bottom section bar here).

## 5. Versioning

  - manifestHash = SHA-256 hex (crypto.subtle.digest) of the raw
    manifest text, computed in loadManifest().
  - A completed pack stores the hash it was downloaded under. On a
    later session where hashes differ, its state becomes 'update'.
    Update = downloadPack with skip-if-cached DISABLED (force re-fetch
    of that pack's files). Coarse but safe at this scale; per-file
    diffing waits for a manifest with per-file hashes (pipeline change,
    out of scope).

## 6. Service worker / offline interaction

  - SW precache stays app-shell only (PROJECT.md decision) — do not
    add audio to the precache manifest.
  - The existing rangeRequests runtime handling is untouched.
  - audio-manifest.json must be reachable offline for Settings/hub
    badges: network-first with cache fallback (either a workbox
    runtime route or a manual fetch-then-cache in loadManifest —
    pick whichever is simpler in the current SW setup and note the
    choice in the handoff).
  - Acceptance meaning of "offline": after downloading the chapt_1
    pack, EVERY chapter 1 audio behavior works in airplane mode,
    including the first-ever play of a file that was never played
    while online.

## 7. Device-test notes (feeds phase 4d — user actions, document in handoff)

  - After deploy: close and reopen the installed PWA (possibly twice)
    so the autoUpdate SW takes over before testing.
  - Record on the iPhone: estimate before/after the full Download all;
    persist() result; whether the 88 MB pack survives several days of
    normal phone use (the last storage unknown).

## 8. Acceptance checklist

  [ ] Carry-overs: iota-subscript rows render with tappable examples
      (3 example audios play); speller renders 39 tiles from
      spellerTiles (rough+grave present) and grading still passes the
      4b checks; Pronounce Letters order is shuffled each visit; rail
      ends ... speller, review vocab, review letters, bibliography.
  [ ] Download chapter 1 pack: progress advances, Cancel stops it,
      re-tapping resumes with already-cached files skipped.
  [ ] Airplane mode after pack download: full chapter 1 walk with
      audio everywhere, including never-before-played files.
  [ ] Settings: estimate + persist status render; Download all runs
      the whole manifest; Clear audio empties the cache and resets all
      pack states (verify hub badge flips back to Download).
  [ ] Manifest change flags packs 'update' (simulate: edit one byte of
      public/audio/audio-manifest.json locally) and Update re-fetches.
  [ ] No download starts without a tap; warmCache on-load fetch is
      gone; first-play caching still works when no pack is downloaded.
  [ ] Hub badges correct after a real app reload (localStorage
      bookkeeping) and after clearing site data (lazy reconciliation).
  [ ] npm run build clean; offline app-shell regression pass (airplane
      mode after one online load — standing directive #4).
  [ ] Write HANDOFF-4C.md in the same format as HANDOFF-4B.md.

## Out of scope for 4c

  IndexedDB progress backend (phase 6). Polytonic webfont (phase 6).
  Chapters 2+ content. Per-file hash diffing / byte-accurate progress
  (needs a manifest pipeline change). Background Sync / periodic sync.
  Search/Index. Any change to drill/exercise scoring.
