# ONBOARD-SOL.md — implementer onboarding for the Greek Tutor PWA

You (Sol, in Codex) are taking over the implementation seat previously
held by Claude Code. This document is everything the previous
implementer knew that is NOT in the individual specs: project law,
architecture invariants, conventions, and footguns. Read it fully
before touching the repo. The specs you execute are 5A-SPEC.md (FIRST
— it is a hard precondition) and 5B-SPEC.md (only after 5A passes its
device gate, VERIFY-5A.md).

## 1. What this is

A port of Dr. Ted Hildebrandt's ParsonsTech Greek Tutor (a 1990s
Asymetrix ToolBook / Windows 3.1 courseware) to an offline-first
Svelte PWA. Primary user: one learner on an iPhone with unreliable
rural internet — offline correctness on real WebKit outranks
everything else. Secondary purpose: portfolio piece, so code quality
is visible product. Full license from the original author. Live at
greektutorv1.netlify.app, deployed automatically from GitHub pushes.

Chapter 1 plus an Introduction pseudo-chapter are shipped and
device-verified. Phase 5 (chapters 2-28) is beginning: 5A converts
chapter loading to lazy chunks; 5B wires chapter 2.

## 2. Roles and workflow protocol

- Fable (Claude, web chat): planning, TBK extraction pipeline, data
  files (chapt-XX.json, lexicons, font-map), specs, and REVIEW of
  your handoffs.
- You (Sol, Codex): implement the current *-SPEC.md against the local
  repo; iterate with npm run dev / npm run build; return a
  HANDOFF-<spec-id>.md.
- Nathanael: DOSBox verification of content, iPhone device testing
  (the VERIFY-*.md documents), all deployment and product decisions.

Protocol rules that are load-bearing:
- One spec at a time, scoped exactly. Anything a spec marks out of
  scope is out of scope even if you see an improvement. Off-task
  recommendations go in the handoff's notes, not in the diff.
- Every spec ends with an acceptance checklist. Run it BEFORE writing
  the handoff; record results in the handoff.
- HANDOFF-*.md contents: what changed per module, deviations from the
  spec with reasons, acceptance results, surprises. Never silently
  absorb a surprise — flag it even if you worked around it.
- Diagnose-first for repeat failures: if something the spec assumes
  turns out different in the code, inspect and report before
  reshaping. The chat side treats the actual codebase as the
  authority for diagnosis — your job includes correcting the spec's
  model of the code in your handoff.
- No mass refactoring of working code, ever. Match the existing code
  style and formatting closely. Patch surgically.
- Data files (src/data/*.json) come FROM the chat pipeline. You wire
  them; you do not edit their content except where a spec explicitly
  says so. If a data file looks wrong, flag it — do not fix it
  locally (the pipeline regenerates from committed copies, and a
  local edit will be silently reverted by the next regeneration).
- No emoji anywhere: code, comments, UI copy, commit messages,
  handoffs.

## 3. The ten standing directives (user-set law, every phase)

1. FIDELITY to the original: glosses, instruction text, audio
   semantics, visual arrangement — never ad-lib content.
2. VISUAL ARRANGEMENT IS PEDAGOGY: preserve lists/indentation/spatial
   layouts; no walls of text (keep the affective filter low). Core
   lesson text renders prominently ABOVE charts; green note banners
   are for parenthetical asides only.
3. SEQUENTIAL Previous/Next RAIL everywhere, following the chapter
   JSON "sequence" array (the original's interleaved order).
4. OFFLINE BEHAVIOR NEVER REGRESSES; every phase ends with an
   airplane-mode check (Nathanael's device pass; you run the preview
   equivalent).
5. AUDIO STOPS ON PAGE EXIT.
6. NO EMOJI in any deliverable.
7. NO DEAD-END NEXT: a greyed-out sequential Next must never exist.
   At the end of a chapter's rail, Next opens the end-of-chapter
   dialog (Stay / Chapter map / Table of contents / Next chapter when
   available). Activity-LOCAL steppers (e.g. Next Letter) may grey
   out at their ends, but the sequential rail below stays live on
   every page.
8. COLOR SEMANTICS: blue (--link #1663c7) text exclusively means
   tappable. Everything non-tappable uses the dark green/ink colors.
9. GREEK-TAP RULE: all DISPLAYED Greek (prompts, flashcard words,
   reading panes, chart glyphs) is tappable (.greek-say, blue) and
   plays its audio; English translations/transliterations are not.
   Covers displayed/prompt Greek, NOT answer-option buttons (option
   audio would leak answers). Standing exceptions: Phonetic Reading
   Exercise, speller keyboard tiles, Review Letters Quick Chart
   (frozen). Contract: select generators declare promptIsGreek and
   carry promptAudio — both required or the prompt silently renders
   untappable.
10. NO FULL CACHE/STORE SCAN ON THE APP-LOAD OR ROUTE-MOUNT PATH.
    Anything needing exact audio counts goes through the persisted
    audioCount store / reconcileAudioCache() (Settings-only). Cold
    app-load must never pay an O(library-size) cost of any kind.

## 4. Architecture invariants (post-4.5, FROZEN — do not touch in 5A/5B)

- Stack: Svelte 4, Vite 5, vite-plugin-pwa, Workbox. No backend;
  Python exists only in the build-time content pipeline (chat-side).
- AUDIO BYTES LIVE IN INDEXEDDB (phase 4.5), played via Blob object
  URLs. src/lib/audio-store.js is the SINGLE IndexedDB access point
  (DB greek-tutor, store audio, keys = absolute paths like
  /audio/chapt_1/a_alpha.m4a, values = Blobs). Nothing else opens
  the DB.
- The service worker precaches the APP SHELL ONLY (15 entries pre-5A)
  plus one NetworkFirst runtime route for the audio manifest. There
  is NO /audio/ runtime route, no rangeRequests, no CacheFirst.
  Grepping src for /audio/ as a path must only ever hit audio.js,
  downloads.js, and packs.js.
- downloads.js is the sole writer of audio bytes (bulk fetch with
  25s timeout + 2 retries + 429/503 backoff; 100-entry putMany
  transactions; force-update deletes before refetch). clearAllAudio
  also belt-and-braces deletes legacy Cache Storage buckets.
- Playback (audio.js play(id)): IDB hit -> object URL; miss+online ->
  one hard-timeout fetch, store, play; miss+offline -> toast. Toast
  IFF the user gets no audio. A playToken bails stale async
  resolutions silently. At most one live object URL (revoked on
  ended/stop/next).
- Audio naming contract: ISO path GKTUTOR/CHAPT_2/B_VOC1.WAV ->
  file audio/chapt_2/b_voc1.m4a -> id "chapt_2_b_voc1". Path-based
  because basenames repeat across chapters. audio-manifest.json maps
  id -> {src, orig}; manifest-hash versioning drives per-pack Update
  state.
- Learner progress: IndexedDB planned for phase 6; currently
  progress.js — do not touch its backend.
- Chapter data: currently static imports (chapter 1); 5A converts to
  per-chapter lazy chunks (import.meta.glob) with sync getters over a
  loaded-chapters registry and one async loadChapter(id) awaited at
  the route level. toc.json and intro.json stay static.

## 5. Audio semantics cheat sheet (most-relitigated facts)

- A_<letter> = name + sound (audioFull); A_<letter>N = name only
  (audioShort). audioFull's ONLY consumer is the Learn Letters
  stepper. Every chart/drill/exercise/Pronounce/Check Answer uses
  audioShort. This was corrected TWICE (Capitals drill, Letter Names
  and Sounds drill) — do not re-litigate.
- A_NAME_1..24 are PERSONAL names, A_PLAC_1..11 place names (Reading
  exercise pools) — NOT letter audio.
- Chapter 2 deliberately ships duplicate copies of chapter 1's ten
  vocab clips as chapt_2_a_voc1..10 (pack self-containment; mirrors
  the original ISO). Not a bug.
- A_INTRO1..4 are unused by design (legacy Win 3.1 navigation).

## 6. Data schema conventions

- Activities are a discriminated union on "type" (contentAudio,
  select, spell, plus 5B's new divide and placeAccent), with
  presentation variants keyed by "mode" (objectivesPage, textPage,
  stepper, flashcard, equationChart, vowelStair, diphthongRows,
  exploreGrid, fullOptionGrid, selfCheckStepper, selfCheckSequence,
  reviewVocab, reviewLetters; 5B adds topicPages). Components are
  mode-keyed; new modes are proposed by the pipeline in specs, never
  invented implementer-side.
- RichContent typed blocks: heading, para, numbered (items carry
  label/text/example/defList/note), defList, biblist, refs, note; 5B
  adds greekRows and expander. RichContent renders greekTaps maps as
  inline tappable spans (first standalone occurrence per key) and
  {letters:[...]} defList values as tappable chips.
- glossShort (drills) vs gloss (review charts): both required on
  lemmas.
- The "sequence" array is the pedagogical rail order — never derived
  from TBK storage order.
- _verify fields in data mark content pending Nathanael's DOSBox
  verification. Render flagged gaps as a visible pending state;
  never crash, never guess values. Data patches arrive as fresh
  committed files, not hand edits.
- ActivityHost wraps the active component in {#key activityId} so
  adjacent same-type activities remount with fresh state. Preserve
  this when touching the host or App.

## 7. Testing and verification conventions

The previous implementer's bar, which your handoffs are reviewed
against:

- npm run build must be clean; assert build-shape claims (precache
  entry counts, chunk presence, no stray content in the main bundle)
  by inspecting dist and the generated sw.js, not by assumption.
- Automated browser verification with playwright-core driving
  headless Chrome with an iPhone UA: a verify script that imports the
  REAL modules into the dev-server page and calls exported functions
  directly, plus a smoke script that drives the built preview UI.
  Zero console/page errors is part of every pass.
- Full sequential-rail walks (chapter 1: 26 items; chapter 2: 20)
  after any change touching navigation, content loading, or shared
  components — plus a chapter 1 REGRESSION walk whenever chapter 2
  work touches shared code.
- Direct-load AND refresh on every route shape (toc, settings, hub,
  hub+section, activity, intro variants).
- Offline regression in preview: SW installed, go offline, full walk
  plus a refresh on an activity route.
- Every new or changed chart/table is checked at 320px width;
  overflow CLIPS in this app (overflow-x hidden), so a clipped chart
  is silent data loss.
- Computed-style spot checks for the color rule (tappable = rgb
  22,99,199).

## 8. Known footguns (each cost a debugging round once)

- TREE-SHAKE TRAP: an import.meta.glob map not reachable from
  executed code is silently tree-shaken — NO chunk is emitted and
  nothing errors. 5A's acceptance includes a build assertion for the
  chunk's existence; keep it.
- idb wrapper shorthands (count/getKey/...) return Promises; a
  missing await once made has() compare a Promise and always return
  false. Double-await, and keep batched-put transactions a tight
  synchronous burst of store.put() before await tx.done.
- Memoized async loaders must RESET their memo on failure or a
  rejected promise is cached forever (the getPacks bug). 5A's
  loadChapter must follow this.
- iOS keys double-tap zoom off the element under the finger and
  touch-action does not inherit — the universal
  `*, *::before, *::after { touch-action: manipulation; }` rule in
  app.css is load-bearing; do not remove or scope it down.
- storage.estimate() on iOS under-reports IndexedDB massively; the
  app trusts its own file count. Do not "fix" the Settings copy that
  explains this.
- WebKit Cache Storage historically appended Vary-variant duplicates
  under a second writer — the sole-writer discipline in downloads.js
  is structural now; never add a second audio-byte writer.
- iOS caches the home-screen icon per install; icon changes need a
  remove/re-add. Not your problem, but do not chase it as a bug.
- Chrome's cache.put replaces by URL and cannot reproduce the WebKit
  Vary behavior — some WebKit behaviors are device-only observations;
  say so in handoffs rather than claiming Chrome proved them.

## 9. Current task queue (July 2026)

1. 5A-SPEC.md — B5 lazy chapter loading. Lands ALONE. Its acceptance
   checklist is the contract; HANDOFF-5A.md back. Then STOP: Nathanael
   runs VERIFY-5A.md on device.
2. 5B-SPEC.md — chapter 2 wiring (chapt-02.json +
   lexicon-chapt02.json, four new vocabulary pieces, reuse map).
   Gated on VERIFY-5A passing. HANDOFF-5B.md back, including
   screenshots of the four topicPages activities.
3. Chapter 2 data patch will arrive after VERIFY-chapt02 returns from
   DOSBox — schema-stable; your components should not need changes.

Known cosmetic open items you may see in the wild and should NOT
chase inside 5A/5B: a storage-counter estimate anomaly (browser
reporting artifact, documented) and an occasional spurious toast when
audio plays (bounded, tracked).

## 10. When in doubt

Prefer asking (via a note to Nathanael in your handoff or directly)
over guessing. The project's history shows its expensive bugs came
from plausible assumptions — audio semantics, cache writers, promise
memos — not from hard problems. The specs are written to be
sufficient; where they are not, that gap is itself a finding worth
reporting.
