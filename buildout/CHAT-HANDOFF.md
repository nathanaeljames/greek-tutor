# CHAT-HANDOFF.md — Greek Tutor PWA: conversation bootstrap

Purpose: this file lets a NEW chat in this Claude Project pick up the
work with zero re-explanation. Keep it in the project files; update it
at each phase boundary. Companion doc: PROJECT.md (decisions log, lives
in project knowledge, not the repo). All other specs/handoffs/plans
referenced below live alongside this file in buildout/ (2026-07-19
reorg — they used to sit at repo root; this file is the one that stays
"live" across phases, everything else is a dated record).

## One-paragraph context

Porting Dr. Ted Hildebrandt's ParsonsTech Greek Tutor (Asymetrix
ToolBook, Win 3.1, runs in DOSBox) to an offline-first Svelte PWA for
one learner: Nathanael's sister-in-law, iPhone-only, unreliable rural
internet. Full license from the author. Secondary goal: portfolio
piece. Nathanael goes by "Fable" when addressing Claude.

## Live state (2026-07-19)

- Repo: github.com/nathanaeljames/greek-tutor (Netlify CD from main)
- Deploy: https://greektutorv1.netlify.app -- installed as PWA on the
  target-class iPhone AND iPad; offline app shell, offline audio
  replay, and the per-chapter + whole-manifest DownloadManager are
  DEVICE-VERIFIED, including a full 8521-file Download All.
- **Phase 4 is FULLY CLOSED**, including the storage-pass work that sat
  after the original "code-complete" milestone. Sequence: 4a/4b/4c ->
  closeout Part A (Opus) -> Part B architectural audit (Fable) -> 9-item
  punch list -> 4-STORAGE-PASS.md (single-writer cache fix, honest
  counter, toast contract) -> **two more device-reported regressions
  surfaced AFTER that pass shipped and were root-caused and fixed in
  this session** (see below). HANDOFF-4.md sections 1-9 is the full
  record.
- **Phase 4.5 (IndexedDB audio-storage migration) is BUILT and
  Chrome-verified** (Claude Code, 4.5-SPEC.md -> HANDOFF-4.5.md). Audio
  bytes now live in IndexedDB as Blobs (src/lib/audio-store.js) and play
  through Blob object URLs; the service worker is entirely out of the
  audio path (no /audio/ route, no rangeRequests, no Range). Cache
  Storage is shell + manifest only, so cold start no longer scales with
  library size. A one-time deferred migration drains the legacy
  `greek-tutor-audio` cache into IDB and deletes it. **Not yet
  device-verified by Fable** — see the device checklist and the
  first-launch caveat in HANDOFF-4.5.md. Code state before this work was
  commit **ba5d0d4** ("adding cold start measure").
- All 8,521 WAVs transcoded to m4a in the repo under public/audio/.
  Chapter 1 (120 files) + Introduction (6 files) are the only BUILT
  content; the rest of the manifest is transcoded audio for content
  that doesn't exist yet (chapters 2-28), which is exactly what
  produced the storage-pass symptoms once a user downloaded all of it.
- VERIFY-chapt01 fully resolved; Chapter 1 data is considered verified.
- App icon: DECIDED -- the retro pixel lamp is the app icon.

## Post-"code-complete" regressions this session (2026-07-19) — READ THIS FIRST

Three rounds of device-reported bugs came in AFTER 4-STORAGE-PASS.md
was believed done, each fixed same-session, each documented with
evidence in HANDOFF-4.md sections 8-9. A brand-new chat should NOT
re-derive these — they are settled:

1. **Round 1 (section 8, in the original storage-pass work order).**
   Root cause: WebKit's `cache.put()` honors Vary where Chrome's
   replaces, so the SW's async CacheFirst route and the app's own
   bulk-download writer raced onto the same URL and WebKit kept both --
   monotonic duplicate growth (F1-F3), plus a toast/audio-race bug
   (F6). Fixed: bulk downloads are marked (`x-gt-bulk-download` header)
   and the SW route excludes marked requests, so the app is the sole
   cache writer; toast logic now fires iff the user truly gets no
   audio.
2. **Round 2 (section 9, reported after section 8 deployed).** Two NEW
   regressions introduced BY the section-8 fix, both scaling with
   library size (invisible at 120 files, severe at 8521): (a) a 3-5s
   hang before ANYTHING painted, once the whole library was cached;
   (b) Download All halting for minutes with cancel/resume unable to
   unstick it. Root causes: (a) `reconcile()` and `audioFileCount()`
   did full `cache.keys()` scans that got triggered from
   `ensureInit()`, which every chapter hub mount calls; (b) the
   bulk-download loop did a `cache.match` + `delete` + `put` PER FILE,
   which is O(n) each on WebKit -> O(n^2) for the whole run, and iOS
   `fetch()` has no timeout so one wedged connection froze the entire
   run forever (cancel can't unstick a held socket). Fixed: the
   audio-file counter is now a `localStorage`-persisted store
   (`audioCount` in downloads.js) that renders INSTANTLY, corrected
   later by a deferred idle scan; the reconcile scan was moved OUT of
   `ensureInit` entirely and now runs ONLY when the Settings/Storage
   screen mounts (`reconcileAudioCache`, idle-deferred, once per
   session); both download loops take one upfront `cache.keys()`
   snapshot instead of per-file match+delete (O(n) not O(n^2)); every
   bulk fetch (`bulkFetch()` in downloads.js) now has a 25s hard
   timeout + 2 retries + 429/503 backoff so a stuck connection can no
   longer freeze the run.
3. **Round 3 (section 9.5, reported after round 2 deployed) — the
   app-load hang was NOT fully fixed by round 2, and its true cause is
   a PLATFORM LIMIT, not app code.** Device measurement (cold-start
   Navigation Timing, exposed in the debug card) proved it
   conclusively: `resp-start` was ~4000ms and `js-start` came right
   after at ~4016ms -- i.e. the delay is 100% BEFORE our JS runs, while
   the service worker's fetch handler is resolving. This is WebKit's
   Cache Storage backing store (one database per ORIGIN, not per named
   cache) being slow to come online on the first fetch after cold
   launch once it holds ~8521 audio entries (~90MB+) -- confirmed by
   the symptom color (white/black = the OS default before ANY of the
   app's CSS painted, not our cream background) and by the timing
   matching `reconcile`'s scan cost almost exactly (both pay the same
   bring-up). **No further app-code change can remove this while audio
   bytes live in Cache Storage.** See the IndexedDB decision below.

## DECIDED + BUILT: audio bytes moved to IndexedDB (phase 4.5)

RESOLVED (Fable decided 2026-07-19; built + Chrome-verified same day —
4.5-SPEC.md -> HANDOFF-4.5.md). The migration below was done as its own
pass before phase 5. The Range "known unknown" was DISSOLVED, not
reimplemented: playback moved to Blob object URLs, so `<audio>` seeks
natively against local bytes and Range/the SW leave the audio path
entirely. The section below is kept as the rationale record.

- **What:** stop storing downloaded audio in Cache Storage
  (`greek-tutor-audio`). Store the audio bytes as Blobs in IndexedDB
  instead; Cache Storage goes back to holding only the ~15 shell files
  (fast to bring up regardless of audio library size, forever).
  Playback reads the Blob from IndexedDB (object URL, or a SW fetch
  handler backed by IDB) instead of `caches.match`.
- **Why now, not later:** the hang is a floor imposed by the audio
  library's SIZE in Cache Storage, and every phase-5 chapter added
  makes it worse, never better -- it will not be a nice problem to
  discover for the first time at chapter 20 with 8x today's diagnostic
  surface. The abstraction boundary is clean right now
  (`src/lib/audio.js` + `src/lib/downloads.js` are the ONLY things that
  touch the audio cache; the data schema/pipeline is unaffected --
  audio ids, not storage mechanism). That boundary erodes as more
  chapters/activities/QA surface accumulate on the current assumptions.
- **Known unknown / the real work:** Range-request serving for
  seek/scrub currently rides on the SW's `rangeRequests: true` plugin
  against Cache Storage; IndexedDB blobs need that reimplemented (slice
  the stored Blob per the `Range` header, either in a SW fetch handler
  or by avoiding `<audio src>` range-seeking needs entirely -- worth
  scoping before starting). This is a real architecture change, not a
  patch -- budget it as its own pass.
- **If deferred instead:** phase 5 can proceed on the current
  architecture; the cold-start hang will scale with however much audio
  a user has downloaded, and is a known, documented, un-fixable-in-JS
  limitation until this migration happens. Nothing about proceeding
  with phase 5 content work blocks doing this migration later, but the
  retrofit gets more expensive with every chapter added on top.
- **Chat's recommendation:** do it now, scoped as its own pass, before
  phase 5 content buildout starts. Not yet started -- no code exists
  for this migration.

## Canonical file locations

- App code + docs: the GitHub repo. buildout/ holds every spec, phase
  handoff, plan, punch list, and verification record (PLAN.md,
  NAV-SPEC.md, *-SPEC.md, HANDOFF-*.md, AUDIT-4.md, 4-PUNCHLIST.md,
  4-STORAGE-PASS.md, VERIFY-4-DEVICE.md). The repo is the source of
  truth for code AND -- as of the Part B audit, which added mode
  fields repo-side -- for the DATA FILES too. PROCESS RULE
  (2026-07-18, after a near-miss where a chat-generated chapt-01.json
  was built from a stale mirror and would have reverted the audit's
  mode vocabulary): after ANY repo-side data edit, upload the
  committed file to project knowledge immediately; chat must
  regenerate data only from the committed copy, and can self-verify
  against https://raw.githubusercontent.com/nathanaeljames/greek-tutor/main/
  (the repo is public and fetchable from chat).
- Content data (src/data/): chapt-01.json, lexicon-chapt01.json,
  toc.json (top-level intro + chapters + special), intro.json.
  Mirrors of the data files + font-map.json live in project knowledge
  for chat-side work -- when chat updates a data file, Fable must
  IMMEDIATELY replace the copy in project knowledge.
- Chat-side pipeline inputs: parsonstech.rar (~286 MB DOSBox bundle)
  or GreekTutor.iso (~290 MB) must be RE-UPLOADED to any conversation
  needing extraction (chapters 2+). The bare ISO is easier: pip
  install pycdlib; iso.get_file_from_iso (paths WITHOUT the ';1'
  suffix, e.g. /GKTUTOR/CHAPT_1/1_ALPHAB.TBK); strings + font-map.json
  converts legacy Greek to Unicode.

## Pipeline contracts for chapters 2+ (from HANDOFF-4.md sections 5+7)

- contentAudio mode vocabulary (dispatch is mode-keyed, never by id):
  objectivesPage, equationChart (uses `display` to pick capital vs
  translit), vowelStair (rows carry `group`), diphthongRows (ONE mode
  for diphthong AND iota-subscript layouts; rows need greek/sound/
  example/exampleGloss/audio/exampleAudio), reviewVocab (honors
  `showNtFreq`), reviewLetters (`columns` supplies header labels),
  plus the existing textPage/stepper/flashcard/selfCheckStepper/
  selfCheckSequence/exploreGrid/fullOptionGrid.
- `ui.arrowCue: true` marks exploreGrid drills that show the arrow cue.
- `lead` is mode-independent: any contentAudio activity may carry it;
  renders prominently above the content card.
- `greekTaps` keys mark the FIRST STANDALONE occurrence of that exact
  string (neighbors not Greek letters) in the item's text.
- Select generators/pools MUST declare `promptIsGreek` and carry
  `promptAudio` for Greek prompts (letter pools: audioShort; vocab
  pools: lemma audio). Missing audio = silently untappable prompt.
- The GREEK-TAP RULE (standing directive 9 below) extends this: any
  DISPLAYED Greek anywhere is a tap target using the shared
  `.greek-say` style -- new activity types must wire it, not invent a
  new pattern.
- Phase 5 lazy-loading plan (B5, proven but deferred): sync getters
  over a loaded-chapters registry + `async loadChapter(id)` awaited
  once at the route level; import.meta.glob chunks ARE precached by
  vite-plugin-pwa; beware the tree-shake trap (the glob map must be
  reachable from executed code or no chunk is emitted). This is
  SEPARATE from the IndexedDB-audio decision above -- one is about JS
  chunk loading, the other about audio byte storage.
- Every new chart must be tested at 320px: overflow now CLIPS
  (overflow-x hidden) instead of scrolling sideways.
- Any code touching the audio cache MUST go through
  src/lib/downloads.js's sole-writer discipline (plain `cache.put`,
  `x-gt-bulk-download` marker header on bulk fetches) -- a second
  writer reintroduces the round-1 WebKit duplicate-growth bug. And: no
  new code may run a full `cache.keys()` scan on the app-load or
  route-mount path -- route it through the persisted `audioCount` store
  and the Settings-only `reconcileAudioCache()` (round-2/3 lesson).

## Division of labor (standing)

- Claude (chat): TBK extraction pipeline, data files, specs, plans,
  review of Claude Code handoffs, verification checklists, art/assets.
- Claude Code (local repo): implements the current *-SPEC.md, iterates
  against npm run dev / npm run build, writes HANDOFF-*.md back.
- Nathanael: DOSBox verification, device testing, deploys (automatic
  via push), decisions. Feedback arrives as PHASE*-REVIEW pdfs or
  direct device-pass reports (as happened for all three storage-pass
  rounds above).

## Standing directives (user-set)

1. Fidelity to the original: glosses, instruction text, audio
   semantics, visual arrangement -- never ad-lib content.
2. Visual arrangement is pedagogy: preserve lists/indentation/spatial
   layouts; no walls of text (keep the affective filter low). Core
   lesson text renders prominently ABOVE charts; green note banners
   are for parenthetical asides only.
3. Sequential Previous/Next rail everywhere, following the original's
   interleaved order (chapter JSON "sequence" array).
4. Offline behavior never regresses; every phase ends with an
   airplane-mode check.
5. Audio stops on page exit.
6. No emoji in any deliverable.
7. NO DEAD-END NEXT (2026-07-18): a greyed-out sequential Next must
   never exist. At the end of a chapter's rail, Next opens a dialog
   (Stay / Chapter Map / Table of Contents). Activity-LOCAL steppers
   (e.g. Next Letter) may grey out at their last item, but the
   sequential rail must always be present and live on every page.
8. COLOR SEMANTICS (2026-07-18): blue text exclusively means tappable.
   Everything non-tappable uses the dark green/ink text colors. Any
   standalone Greek letter or word is tappable for audio (as in the
   original) unless it is buried inside English prose; inline
   exceptions are wired via greekTaps maps in the data.
9. GREEK-TAP RULE (2026-07-18): all DISPLAYED Greek (prompts,
   flashcard words, reading panes, chart glyphs) is tappable and
   plays its audio; English translations/transliterations are not.
   Covers displayed/prompt Greek, NOT answer-option buttons (option
   audio would leak answers). Exceptions: Phonetic Reading Exercise
   (phonetic English, no audio), spelling-keyboard tiles, and the
   Review Letters Quick Chart (frozen as-is).
10. NO FULL CACHE SCAN ON THE APP-LOAD OR ROUTE-MOUNT PATH
    (2026-07-19, added after rounds 2-3 above): any code that needs the
    exact audio-file count or a cache audit must go through the
    persisted `audioCount` store / `reconcileAudioCache()` in
    downloads.js, which only runs from the Settings screen. This is
    now load-bearing precedent for the IndexedDB decision too --
    whatever storage layer wins, cold app-load must never pay an
    O(library size) cost.

## Audio semantics cheat-sheet (most-relitigated facts)

- A_<letter> = name + sound (audioFull); A_<letter>N = name only
  (audioShort). Charts/drills/exercises/Pronounce/Check Answer all use
  audioShort. audioFull's ONLY consumer is the Learn Letters stepper.
- CORRECTIONS (2026-07-18, device-verified): both the CAPITALS drill
  and the LETTER NAMES AND SOUNDS drill use audioShort (name only) --
  the earlier audioFull claims for these were wrong.
- Review Letters Quick Chart taps use audioShort; its Pronounce column
  was removed (PHASE4-REVIEW item 18).
- A_NAME_1..24 = PERSONAL names, A_PLAC_1..11 = place names -- Reading
  exercise pools, NOT letter audio.
- A_VOC1..10 = vocab lemmas alphabetically (pairing listen-verified);
  A_VOCL1 = whole list; A_ALPHAB = 27s alphabet recitation.
- A_INTRO1..4 = legacy Win 3.1 navigation narrations, unused by design.

## Immediate queue (as of 2026-07-19)

1. **Device-verify phase 4.5 on Fable's iPhone + iPad** -- run the
   HANDOFF-4.5.md device checklist (cold-start metric before vs. after
   migration; airplane-mode walk; count now exact/stable; Download All
   backoff path). Mind the first-launch-after-upgrade caveat: the FIRST
   cold start still pays the old Cache-Storage bring-up once and the
   migration pays the legacy read once in the background; judge the
   metric on the SECOND cold launch. Then deploy.
2. Chat (new conversation): phase 5 vertical-buildout spec. Start with
   chapter 2 extraction (forcing
   function for the remaining unknown font codes ! # $ { } ~ | \ ` = :
   ; -- the Greek Keyboard photo suggests !/#/$ are breathing+accent
   combos). Pipeline adoption of the mode vocabulary + contracts above.
   B5 lazy-loading implementation (JS chunks -- independent of 4.5's
   audio-byte question). RE-UPLOAD the ISO to that chat.
3. Carried nits (fix when touched): Escape/initial-focus pattern for
   the speller-keyboard and clear-confirm modals; playwright-core as a
   devDependency (five sessions of hand-rolled CDP drivers now,
   including the CDP-driven verification of every storage-pass round).

## Known open questions

- Phase 4.5 IndexedDB migration: DECIDED + BUILT + Chrome-verified;
  remaining item is Fable's device verification (queue item 1).
- Font-map unknown codes resolve at chapter 2.
- C3 multi-day retention: Download All completed on iPhone AND iPad
  (persistent storage granted on both, quota tens of GB); no report yet
  of files disappearing over days. Still an open watch item, unrelated
  to the three regressions above.
- Range-request serving over IndexedDB blobs: DISSOLVED by 4.5 —
  playback uses Blob object URLs, so there is no Range/SW in the audio
  path at all.
