# ONBOARD-SOL.md — implementer onboarding for the Greek Tutor PWA

You (Sol, in Codex) are taking over the implementation seat previously
held by Claude Code. This document is everything the previous
implementer knew that is NOT in the individual specs: project law,
architecture invariants, conventions, and footguns. Read it fully
before touching the repo. You execute the current cohort's *-SPEC#.md
under buildout process v2: for every spec you produce TWO documents —
SPEC#-RESULTS-<MODEL>.md (the handoff) and SPEC#-BUILD-<MODEL>.md
containing (a) the exact git diff, (b) your full thought/tool log,
(c) wall-clock time. PERMANENT RULE (2026-08-25): (b) means the
COMPLETE exact `git diff` of your cumulative work — not a summary,
not excerpts — and (c) is MANDATORY in every round with any later
patch or addendum ADDING its time to your main total. Both have been
omitted in the majority of rounds by both implementers; the grader
now applies an automatic penalty for either omission. Treat these
two as acceptance gates equal to a green build. You run in an isolated repo copy; a parallel
model runs the same spec; a grading chat audits both BUILD diffs and
may hand the winner an XPATCH#.md to apply (the patch phase updates
your SPEC#-RESULTS, no BUILD doc).

## 1. What this is

A port of Dr. Ted Hildebrandt's ParsonsTech Greek Tutor (a 1990s
Asymetrix ToolBook / Windows 3.1 courseware) to an offline-first
Svelte PWA. Primary user: one learner on an iPhone with unreliable
rural internet — offline correctness on real WebKit outranks
everything else. Secondary purpose: portfolio piece, so code quality
is visible product. Full license from the original author. Live at
greektutorv1.netlify.app, deployed automatically from GitHub pushes.

Current project state lives in §9 of this document and, always more
current, in CHAT-HANDOFF.md.

## 2. Roles and workflow protocol

- Fable (Claude, web chat): planning, TBK extraction pipeline, data
  files (chapt-XX.json, lexicons, font-map), specs, and REVIEW of
  your handoffs.
- You (Sol, Codex): implement the current *-SPEC.md against the local
  repo; iterate with npm run dev / npm run build; return the
  SPEC#-RESULTS and SPEC#-BUILD pair described in the header.
- Nathanael: DOSBox verification of content, iPhone device testing
  (the VERIFY-*.md documents), all deployment and product decisions.

Protocol rules that are load-bearing:
- One spec at a time, scoped exactly. Anything a spec marks out of
  scope is out of scope even if you see an improvement. Off-task
  recommendations go in the handoff's notes, not in the diff.
- Every spec ends with an acceptance checklist. Run it BEFORE writing
  RESULTS; record outcomes there.
- SPEC#-RESULTS contents: what changed per module, deviations from the
  spec with reasons, acceptance results, surprises. Never silently
  absorb a surprise — flag it even if you worked around it.
- Diagnose-first for repeat failures: if something the spec assumes
  turns out different in the code, inspect and report before
  reshaping. The chat side treats the actual codebase as the
  authority for diagnosis — your job includes correcting the spec's
  model of the code in your handoff.
- No mass refactoring of working code, ever. Match the existing code
  style and formatting closely. Patch surgically.
- Data files: see §2b. That section is the ONE statement of the rule.
- No emoji anywhere: code, comments, UI copy, commit messages,
  handoffs.

## 2b. Data files: the ONE rule (supersedes any other statement anywhere)

`src/data/*.json` is authored by the chat pipeline. Commit delivered
files as-is. You may edit them in exactly TWO cases:

1. **Visual verification** (CHAT-HANDOFF, amended 2026-07-28): the
   rendered page, held against the DOSBox rail walk, shows obviously
   missing or corrupted formatting or text — dropped words, converter
   garbage, broken markup, an id that cannot resolve by CASE alone.
   Fix it, and report every edit in RESULTS with before/after so the
   pipeline can absorb it (a hand edit is lost at the next regen
   unless the pipeline knows about it).
2. **A spec section explicitly authorizes a named edit.**

Everything else — behavior fields, answers, sequence, audio WIRING
choices, anything requiring DOSBox or a listen to settle — routes to
the chat pipeline: STOP on that item, note it in RESULTS, continue
elsewhere.

**Priority when documents disagree:** this section and CHAT-HANDOFF
outrank any restatement in a SPEC. A spec that appears to forbid what
rule 1 allows is quoting an obsolete rule — follow rule 1 and FLAG the
spec's wording in RESULTS. A broken build shipped in obedience to a
stale sentence is still a broken build; round 5G-SPEC1 proved it (one
implementer obeyed a stale never-edit paragraph in the spec, left 31
case-mismatched audio ids in place, and shipped a tree that failed
`npm run verify` — while the paragraph it obeyed had been superseded
ten rounds earlier).

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

## 4b. Typography and interaction contracts (post chapter 2 — binding)

- MARK GEOMETRY IS GENERATED, NEVER HAND-WRITTEN. The bundled Greek
  face and src/lib/mark-geometry.json are a matched pair produced by
  scripts/make-greek-font.py and scripts/make-mark-geometry.py; rebuild
  one and you regenerate the other in the same commit. Hand-tuning an
  offset is working against the design — if a mark renders wrong, the
  generator or its inputs are the bug. The old M1-M6 hand rules are
  SUPERSEDED and survive only as a build-guarded fallback.
- `npm run check:shapes` is a designed gate, not an obstacle: it fails
  on unknown block types, bad redMarkCluster indices (past the word,
  on a markless cluster, or missing a geometry row), and object-form
  biblist items. Never route around it; a failure means the DATA or a
  missing renderer is the problem to report.
- The syllable-division exercise is dividers placed on the word (not
  numbered gap buttons); the word renders in INK because tapping it
  places a divider — this is a standing exception to the Greek-tap
  rule (directive 9), alongside the speller tiles, Phonetic Reading,
  and the Review Letters Quick Chart.

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
- **A screenshot at rest is not a verification pass (5F-FEEDBACK
  regression, 2026-08-09; full account in 5F-SPEC1-PATCH1.md).**
  Chapter 7 shipped with collapsed text formatting, missing paradigm
  charts, a broken popup mechanism and a non-modal "Hint" surface, and
  it had been through BOTH a rail walk and a screenshot pass first.
  Every one of those defects was invisible in a single static capture
  and only showed up on interaction: a wrapped line (the hanging
  indent bug only shows on a multi-line item), a second chart reached
  via More (the duplicate Say Whole and missing subtitle bugs), a
  popup actually opened (the modal-shell and garbled-content bugs), a
  drill's Hint button actually clicked (the bare-`.card` non-modal
  bug). **A pass counts as verification only if it interacts with
  everything a learner can interact with** — every More/Back step,
  every popup, every Hint, every wrapped line at 320px — not only the
  state a page loads in. `scripts/ui-walk.mjs` and `scripts/
  ui-behavior.mjs` exist specifically to make this mechanical rather
  than a squint; run BOTH, do not sample a subset of activities by eye
  and call it a rail walk.
- **A new modal surface goes into `scripts/ui-modals.mjs`'s SURFACES
  list in the same change that adds it.** Audited 2026-08-13: the list
  held only SelectActivity Hints, so the Hints in `DivideActivity` and
  `PlaceAccentActivity` (chapter 2's Syllable Division and Accent
  Placement exercises), chapter 6's two prose Hints and the Settings
  confirm dialog had never been opened at any device height — and two
  of those components are where the bare-`.card`-instead-of-modal bug
  lived in 5F. All seven are in the list now and pass at all five
  heights, but until today nothing would have caught them regressing.
  A modal
  nothing opens is a modal nothing checks.
- **When a component's DOM shape changes, grep the harness for the
  OLD shape before calling the change done.** Retiring
  `PronounParadigm.svelte` this round left `ui-behavior.mjs`,
  `ui-modals.mjs` and `ui-shots-5f.mjs` all still asserting against
  its deleted `.pronoun-paradigm` / `data-gender` markup and a
  superseded `.popup-link` selector — three separate scripts, found
  only by grepping for the dead class names after the fact. A harness
  that still passes after testing markup that no longer exists is
  worse than no harness: it reports green while proving nothing. Grep
  every `scripts/ui-*.mjs` for a class, attribute or id before deleting
  or renaming it in a component.
- **A build-time shape check only catches what someone thought to
  assert.** `check-content-shapes.mjs` had no rule against a
  hand-numbered "1) ..." string inside a plain `para` block — a real
  shape, renders something, passes every existing check — and it
  silently defeated the numbered-list hanging-indent CSS the SAME
  round shipped elsewhere. When a new defect class is found and fixed,
  add the check that would have caught it, not just the fix.
- **"Renders and interacts" is still not the bar — FIDELITY TO THE
  ORIGINAL is (5F-FEEDBACK2, 2026-08-09; full account in
  5F-SPEC1-PATCH2.md).** A second feedback round landed 29 items on
  pages that all rendered, all interacted, and all diverged from the
  original: line spacing faked double by line-per-para authoring,
  missing blank lines between blocks, collapsed columns (the ch8
  Number chart shipped as ten prose lines), uncentered example
  blocks, a diagram that traced nothing. Verification of a ported
  page means holding it NEXT TO the original panel: render the rail
  walk PDF (pymupdf is installed for exactly this), crop the panel,
  and compare arrangement — paragraph gaps, indents, columns,
  centering — line by line. For diagrams the bar is a stencil: 50%
  overlay of the original crop on a screenshot of the rebuild
  (buildout/screenshots/5f-patch2/prep-overlay.png is the reference
  example). "It looks reasonable" has now failed twice; only "it
  matches" passes.
- **Word→clip wiring comes from the TBK's own handlers, never from
  filename sequence (5F-FEEDBACK2 item 17, 5F-FEEDBACK3 item 2).** Twice
  now, audio was keyed by assuming clip filenames run in display order,
  and twice the original disagreed (de-duplicated scripture words;
  predicate-position clips where g_pp1/g_pp2 are wired to NOTHING). The
  ground truth is on the ISO: pycdlib extracts any chapter's .TBK, and
  its WordSelection/alias records state which word plays which WAV —
  that is how PATCH3 settled the predicate clips without listening.
  Build-time, every audio id in chapter data must exist in
  audio-manifest.json (check-content-shapes.mjs enforces this); mappings
  that have been verified by ear or by TBK are PINNED in ui-behavior
  §P3.1 — add every newly-verified mapping to that pin list in the same
  change. Paired lesson (D-39): when the original wires no handler and
  ships no clip, that IS the original's answer — say so before building
  a workaround from borrowed audio.
- **The original's LINE BREAKS are not paragraph breaks.** The
  extraction pipeline had emitted one `para` block per panel LINE
  across chapters 6-8 — each line then carried a paragraph margin,
  which read as double spacing and destroyed the app-wide uniform
  line-spacing rule. A paragraph is ONE flowing para block; a blank
  line in the original is `gapBefore: true` on the next block; hard
  line breaks inside an example block are `\n` inside ONE block.
  `check-content-shapes.mjs` now fails a para that ends mid-sentence
  when the next para continues it lowercase.

## 8. Known footguns (each cost a debugging round once)

- ANY edit to public/audio/audio-manifest.json invalidates EVERY
  downloaded audio pack on EVERY device. Pack versioning is one
  SHA-256 of the raw manifest text (packs.js — "coarse
  pack-versioning" is literal): adding a single entry flipped all
  eight packs to "Update audio" on Nathanael's phone mid-testing
  (5F-PATCH3 appendix, 2026-08-10). The audio corpus is complete and
  frozen; treat the manifest as frozen with it. If an entry ever
  truly must change, say so in the handoff — the on-device effect is
  a full re-verify prompt for everything, not just the changed pack.

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

## 9. Current state (updated 2026-08-11 — cohort 5F CLOSED, 5G in flight)

Chapters 1 through 5 are shipped, device-verified, and behaviorally
correct. Cohort 5E ran four rounds — 5E-SPEC1 (dual build), 5E-SPEC2
(behavior correction), 5E-SPEC3 (corrected an over-reach in SPEC2),
5E-SPEC3-PATCH (device feedback, five addenda) — and is now closed.

**Read these two before any drill or exercise work. They are canonical
and they REPLACE DRILL-MATRIX.md, which is DELETED:**

- **DRILL-BEHAVIOR-RULES.md** — the ruleset, now at rule C9 / E4b.
  Load-bearing ones: audio timing follows PROMPT LANGUAGE (A1), except
  a multi-word Greek phrase defers to `afterGuess` regardless (A1a, for
  parity with the original's own input-lockout workaround); there are
  FOUR advance classes and every correct answer auto-advances with no
  exception (B1a); a wrong spelling never reveals the answer (C0a);
  **`Show Answer` is the ONE reveal control app-wide — there is no
  `Major Hint`, on any surface, ever again (C8)**; a combining breathing
  and the elision apostrophe are NOT interchangeable anywhere (C9).
- **DRILLBEHAVIORLEDGER.csv** — the per-activity record. **All 78 rows,
  chapters 1-8, are CONFIRMED** — chapters 6-8 ahead of being built.
  Read a chapter's rows before writing or reviewing its spec; do not
  re-derive behavior that is already in the ledger.

`apply-behavior-matrix.py` MUST run after every `assemble_chNN.py`. It
stamps `audioTiming`, `answerPolicy.advanceClass`, the Pronounce-Each
default, Previous/Next presence, the em-dash typography rule and the
chapter-2 accent-rule underlines onto the data, and fails loudly if an
activity has no CONFIRMED ledger row.

**`HINT_VISIBLE_MS` is DELETED (C8/D-30). Do not reintroduce it under
any name.** Nothing in this app makes a learner race a clock.

The hard lesson of cohort 5E, and the reason these documents exist:
behaviour was inferred from screenshots and feedback strings at 5E-SPEC1
time, and 23 of 50 rows were wrong. **Never infer behaviour from a
feedback string, a button's presence, an activity's name, or how the
same-named activity behaves in another chapter (E4a/E4b).** Chapter 3
has two verb drills with opposite audio timing under the same-sounding
name; that ambiguity produced the one set of wrong 5F predictions
before Nathanael's DOSBox pass corrected them.

Cohort 5F (chapters 6-8: Prepositions; Adjectives and εἰμί; Pronouns)
inverts the 5E order deliberately: behavior is ledger-first. The 28
chapter 6-8 rows are already CONFIRMED before any of the three chapters
is built, so rail walks this round are for page content and layout, not
behavior discovery.

Expect new chapters to reuse the existing vocabulary — topicPages,
greekRows, expander, subheading, divide, placeAccent, optionValues,
redMarkCluster, paradigm, interlinearVerse, spellVerse, `charts[]` with
`switch`, `meanings`, `revealButtons` — before inventing anything. One
flagged exception already known for 5F: chapter 8's Personal Pronoun
Case Drill uses a two-step person-then-case selection, not the single
grouped option grid every other Case Drill uses — a genuinely new
layout, not covered by any existing mode.

**5F-SPEC1's first build regressed on device (2026-08-09,
5F-FEEDBACK.pdf) — 17 items, chapter 7 worst.** Root causes, fixes and
new harness rules are recorded in full in **5F-SPEC1-PATCH1.md**; read
it before touching chapters 6-8 again. In short: a bespoke
`PronounParadigm.svelte` (chapter 8's own paradigm renderer, parallel
to the app-wide `Paradigm.svelte`) is now DELETED — every chart in the
app renders through the one component — and several teaching topics
that were flattened into plain paragraphs in the first pass are
rebuilt as `paradigm`, `numbered` and `greekRows` blocks. The three
`ui-*.mjs` harness scripts were themselves out of date against the
fix (see the new §7 rule above) and are now current.

**5F CLOSED 2026-08-10** after three patch rounds against 52 device
feedback items; chapters 1-8 are shipped and device-verified. **5G
(chapters 9-10) is in flight**: both chapters built, the round's
XPATCH applied, VERIFY-5G pending Nathanael's device pass. The 5G
round also produced §2b of this document — the unified data-file rule
with its priority order — after the two implementers split on a stale
never-edit sentence in the spec and one shipped a failing build by
obeying it. When a spec and §2b disagree, §2b wins; flag the spec.

## 10. When in doubt

Prefer asking (via a note to Nathanael in your handoff or directly)
over guessing. The project's history shows its expensive bugs came
from plausible assumptions — audio semantics, cache writers, promise
memos — not from hard problems. The specs are written to be
sufficient; where they are not, that gap is itself a finding worth
reporting.
