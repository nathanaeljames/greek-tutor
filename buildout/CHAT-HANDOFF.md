# CHAT-HANDOFF.md — Greek Tutor PWA: conversation bootstrap

Purpose: this file lets a NEW chat in this Claude Project pick up the
work with zero re-explanation. Keep it in the project files; update it
at each phase boundary. All specs/handoffs/plans referenced below live
in the repo's buildout/ directory — the repo is the ARCHIVE (nothing is
ever deleted there); the project files carry only the living subset
(see "Project-file methodology" below).

## One-paragraph context

Porting Dr. Ted Hildebrandt's ParsonsTech Greek Tutor (Asymetrix
ToolBook, Win 3.1, runs in DOSBox) to an offline-first Svelte PWA for
one learner: Nathanael's sister-in-law, iPhone-only, unreliable rural
internet. Full license from the author. Secondary goal: portfolio
piece. Nathanael goes by "Fable" when addressing Claude (chat).

## Live state (2026-08-07)

**COHORT 5E IS CLOSED.** Chapters 1 through 5 are shipped, verified on
device, and behaviorally corrected. Full round history:

- **5E-SPEC1** (2026-08-03) — chapters 4 and 5 built, DUAL round: Sol
  and Opus in parallel, each in its own copy of the repo, no branches.
  Sol won; `5E-XPATCH1.md` ported three Opus pieces onto the Sol base
  (sentence-prompt resolution in code, reveal-button order from data,
  `MeaningsCard.svelte` extraction) plus an offline preview walk.
- **5E-SPEC2** (2026-08-06) — the big behavioral correction, following
  Nathanael's DOSBox pass over all 50 drills/exercises in chapters 1-5.
  Replaced `DRILL-MATRIX.md` (now DELETED) with two canonical
  documents: **`DRILL-BEHAVIOR-RULES.md`** (the ruleset) and
  **`DRILLBEHAVIORLEDGER.csv`** (the per-activity record — note the
  filename: Claude.ai's uploader strips hyphens, so this is now the
  PERMANENT canonical name, not a typo). `scripts/apply-behavior-matrix.py`
  ships to stamp the ledger onto data and MUST run after every
  `assemble_chNN.py`.
- **5E-SPEC3** (2026-08-06) — corrected an over-reach in SPEC2: six
  advance classes collapsed to FOUR, because SPEC2 had invented
  "wait for Next on a correct answer" for 14 activities that were never
  marked for that change. Rule **B1a**: every correct answer
  auto-advances, no exceptions, overriding the original where the
  original waited (D-28).
- **5E-SPEC3-PATCH** (2026-08-07, five addenda) — real device feedback,
  fourteen items. Two new standing rules now canonical for chapter 6+:
  **C8** (`Show Answer` is the ONE reveal control, app-wide — the three
  whole-verse spellers' `Major Hint` button/timer is GONE, `HINT_VISIBLE_MS`
  is DELETED, never reintroduce it; D-30) and **C9** (a combining
  breathing and the elision apostrophe are NOT interchangeable anywhere,
  including the checker; elision is U+0027 everywhere displayed; a
  dedicated speller tile now inserts it, D-29). Also fixed: a dedup key
  broken by the em-dash rule (duplicated `First Declension—Masc`
  heading), a Svelte reactivity bug that left the first item of every
  `beforeGuess` drill silent on arrival, and three rounds of modal
  sizing (the real fix uses `visualViewport` sized to the gap between
  the app's own bars, not a CSS viewport unit — no CSS unit describes
  an iPhone). Behavior suite: 203 → 322 checks.

**All 78 rows of `DRILLBEHAVIORLEDGER.csv` are CONFIRMED — chapters 1-8,
zero open rows.** Chapters 6-8 aren't built yet, but their BEHAVIOR is
already verified against DOSBox, ahead of the build. This inverts the
5E process on purpose: 5E's data was wrong 23/50 rows because behavior
was inferred from screenshots after the fact. 5F's data goes in
correct the first time because the ledger already has the answers.

One extraction-side finding from filling the ch6-8 ledger, now rule
**A1a**: multi-word Greek-phrase prompts (the "X Translation Drill"
family — Preposition, Adjective, "Eimi", Personal Pronoun, Autos) defer
their audio to `afterGuess` even though Greek is the prompt, because the
ORIGINAL cannot accept input while its own audio plays and a multi-word
clip makes that lockout long enough to matter. The port has no such
constraint but matches for uniformity. Rule **E4b** records the
methodology lesson that produced the one set of wrong ch6-8 predictions
Fable made before Nathanael's pass corrected them: a same-chapter
precedent is not enough when the chapter offers more than one candidate
shape (chapter 3 has two verb drills with opposite timing).

**REPO IS AHEAD OF PROJECT FILES** as of this writing on four files —
`DIVERGENCE-LOG.md`, `DRILL-BEHAVIOR-RULES.md`, `DRILLBEHAVIORLEDGER.csv`,
`chapt-04.json`, `chapt-05.json` — all correctly committed from the
SPEC3-PATCH round, just not yet re-uploaded to project files. See the
Immediate queue.

**Superseded state below, kept for context (5D closure onward):**

- Repo: github.com/nathanaeljames/greek-tutor (Netlify CD from main).
  Deploy: https://greektutorv1.netlify.app — installed as PWA on the
  target-class iPhone AND iPad.
- Phases 1-4.5 CLOSED and device-verified. Audio bytes live in
  IndexedDB (Blobs + object URLs); the SW precaches the app shell only
  and is entirely out of the audio path; cold start is instant
  (resp-start ~20ms) and independent of library size. Full record:
  repo buildout/HANDOFF-4.5.md. Chapter 1 data fully verified.
- **5A (B5 lazy chapter loading) SHIPPED + DEVICE-VERIFIED**
  (VERIFY-5A passed: cold start 20-44ms both devices, airplane-mode
  ch1 walk clean, offline chunk-precache proven on real WebKit).
  Chapters load as per-chapter JS chunks via import.meta.glob + a
  loaded-chapters registry; sync getters below one route-level await;
  toc/intro stay static. 5A residual lessons harvested below.
- **5B (chapter 2) CLOSED AND DEVICE-VERIFIED, 2026-07-27.** Four
  implementer rounds: SPEC (Sol/Codex + a merged Opus 4.8 patch set),
  SPEC2, SPEC3 and SPEC4 (all three Opus in Claude Code). Nathanael's
  visual pass on the SPEC4 tree was a FULL PASS on all of chapter 2, so
  the formal VERIFY4 document phase was skipped by his decision — there
  is no VERIFY4.md and none is owed. Chapter 2 data is complete: no
  _verify gaps, no pending placeholders on any route. Both rails green
  (ch2 20/20, ch1 regression 26/26) at 320px and 768px, online and
  airplane-equivalent, zero console errors. Precache 21 entries /
  479.92 KiB; chapter-1 chunk hash unchanged across the whole cohort.
  Records, in the repo: 5B-SPEC{,2,3,4}.md, 5B-SPEC{2,3}-RESULTS-OPUS.md,
  5B-SPEC4-RESULTS.md, the matching BUILD docs, 5B-XPATCH1.md,
  HANDOFF-5B-{SOL,OPUS}.md.
- **5C (recon chapters 3-8 + rich-text parser experiment) CLOSED,
  2026-07-28, chat-side only.** Record: buildout/5C-RECON-FINDINGS.md.
  Headlines: (1) chapters 3-8 share one fixed skeleton and their
  novelty concentrates in CHAPTER 3 (paradigm mode, parse/translate
  select variants, Scripture Memory family); (2) the RICH-TEXT PARSER
  EXPERIMENT SUCCEEDED — scripts/tbk_richtext.py recovers field text
  plus underline spans and Greek-vs-English font runs, validated
  against ch2 device-verified data and blind-tested on ch5/ch3; the
  old "~75% extraction ceiling" is retired; (3) drill pools (prompts,
  option columns, refs) are plain-string-reachable in chapters 3+;
  (4) font-map: `$` = rough+circumflex and `!` = rough+acute
  VERIFIED by word evidence (the `!` finding reverses ch2's exclusion;
  `!` also appears in Hebrew regions, so region exclusion still runs
  first); (5) Hebrew tell-tale model corrected — `Hebrew*` FIELD NAMES
  are shared-engine plumbing inside legitimate Greek drills, not
  contamination markers. Details: PIPELINE-INSIGHTS-v3 Stages 3/4/4b.
- **5D (chapter 3, solo) CLOSED 2026-08-03.** Two implementer rounds,
  both Opus in Claude Code. Round 1 built the chapter (rail 18/18,
  keyboard, timing constants, spellVerse) and VERIFY-5D returned with
  decisions plus a formatting punch list; the data was then
  regenerated against three ROOT-CAUSE pipeline fixes (length-prefixed
  field reads, rich-text underline wiring, objectives extracted not
  authored). Round 2 (5D-SPEC2) delivered the corrections plus two
  Playwright harnesses that drive the shipped UI — `npm run ui:walk`
  and `npm run ui:behavior` — which between them found five silent
  horizontal-clipping defects in chapters 1 and 2 that had already
  passed device passes. Nathanael's visual pass on the round-2 tree
  was a FULL PASS, so no VERIFY-5D2 document was raised (the 5B-SPEC4
  precedent) and none is owed. Records, in the repo: 5D-SPEC{,2}.md,
  5D-SPEC-RESULTS-OPUS.md, 5D-SPEC2-RESULTS.md, the matching BUILD
  docs, VERIFY-5D{,-TASK}.md.
  Round-2 things now standing infrastructure: `playwright-core` as a
  real devDependency; the shared speller input model
  (`lib/speller-input.js` + `SpellerField.svelte`) with caret
  placement and held pending marks; `check:shapes` failing the build
  on any re-introduced `autoAdvanceMs`.
- **5E (chapters 4 + 5, batched) OPEN — 5E-SPEC1.md issued
  2026-08-03.** Nathanael supplied full DOSBox rail walks of both
  chapters (ch4railwalk.pdf, ch5railwalk.pdf), which serve as the
  cohort's RECON-RESULTS, so no separate recon round ran. A fresh
  extraction pass over 4_NOUNS2.TBK and 5_NOUNS1.TBK confirmed the 5C
  prediction: chapter 5 is chapter 4 plus the definite-article family,
  every teaching field / drill pool / option column / reference column
  / paradigm chart is reachable, and the residual novelty is seven
  renderer items (5E-SPEC1 §4). Audio: ch4 = 91 files (`d_*` plus
  chapter 3's `c_sm*` shipped forward), ch5 = 135 (`e_*` plus `c_sm*`
  and `d_sm*`), exactly the cumulative-review duplication Stage 6
  documents.
- Vocabulary registered across 5B: topicPages mode; greekRows,
  expander and subheading RichContent blocks; divide + placeAccent
  activity types; static option sets in select; speller-tiles.json
  shared keyboard contract; a bundled derived Greek webfont; a
  font-derived mark-geometry table.
- Font map after 5C: '#' smooth+circumflex, '[' rough (second slot),
  ';' question mark, ':' raised-dot colon, 'v' nu provisional,
  '$' rough+circumflex, '!' rough+acute. '$' and '!' now carry the
  full three evidence sources — the ch5 rail walk shows the First
  Declension--Alpha chart rendered in DOSBox, where `w!ra` prints ὥρα
  and `w$rai` prints ὧραι. That question is CLOSED.
  Remaining unknowns: { } ~ | \ ` (junk-context only) and '='
  (OpenScript comparator) — likely none are font codes.

## Buildout process v2 (established 2026-07-26; applies to buildout phases)

Per-cohort loop with fixed document naming (# = round number):
1. Automated extraction (Fable) -> data files + <cohort>-RECON-TASKS.md
   listing what strings/scripts could not yield.
2. Nathanael's manual recon -> <cohort>-RECON-RESULTS.md (+ PDFs).
3. Fable: RECON-RESULTS + canonical project knowledge (CHAT-HANDOFF.md
   and PIPELINE-INSIGHTS-v3.md ARE the stored prior knowledge) ->
   complete SPEC#.md. Specs are COMPLETE: no partial specs pending
   data; build most of the chapter in one go.
4. BOTH implementer models (currently Sol/Codex and Opus-class/Claude
   Code) execute the same SPEC# in isolated repo copies. Each returns
   SPEC#-RESULTS-<MODEL>.md (the handoff; replaces HANDOFF-* naming)
   and SPEC#-BUILD-<MODEL>.md: exact git diff + full thought/tool log
   + wall-clock time. Specs must instruct producing both.
5. The grading chat (GRADER-PROMPT.md v2) audits claims against the
   BUILD diffs, grades, picks the winner, and when justified emits
   XPATCH#.md porting the loser's superior pieces onto the winner.
6. The WINNING model applies XPATCH# (if any), updates its
   SPEC#-RESULTS with an XPATCH section (no BUILD doc for this phase),
   and authors VERIFY#.md reviewing build+patch and listing device
   tests.
7. Nathanael's device pass -> VERIFY#-RESULTS (PDF/answers + edited
   checklists).
8. Fable: VERIFY#-RESULTS + SPEC#-RESULTS -> the next sequential
   SPEC#. Repeat 4-8 until the cohort closes.
Fable provides data files and CHAT-HANDOFF updates wherever
appropriate and checks project files against the repo every turn.

Data-file process rule (amended 2026-07-28): src/data/*.json is
authored by the chat pipeline from committed copies; implementers
commit delivered files as-is and do not edit content — EXCEPT where
visual verification against the DOSBox screenshots finds obviously
missing formatting or text, which they are now authorized to fix and
must report in RESULTS. DOSBox/device answers route to the chat
pipeline.

Recon-tasks rule (2026-07-28, from D1): RECON-TASKS documents
pre-compile the expected rail/menu order from extraction and ask for
YES/NO verification — never ask for the order open-ended.

RAIL-WALK RULE (2026-08-03, from 5E): a full DOSBox RAIL WALK — every
page of a chapter, in order, as a PDF of screenshots — SUBSTITUTES for
steps 1-2 of the loop. It answers sequence order, menu contents, screen
layout and button sets in one artifact, which is most of what recon
existed to collect. When a rail walk is supplied with the request,
skip RECON-TASKS/RECON-RESULTS and go straight to the spec. Nathanael
holds rail walks for chapters 4-8 and can supply the rest on request.
In a rail walk, a HAND CURSOR marks a clickable element; the marking is
deliberate but NOT exhaustive, so a hand is positive evidence and its
absence is not evidence of absence. Every rail walk is a standing
attachment to its cohort's coding rounds.

Divergence rule (2026-07-28): every deliberate departure from the
original is logged in DIVERGENCE-LOG.md (canonical living set) at
decision time, numbered D-n, never renumbered. Fidelity restorations
are not logged. The advance-timing rule matrix now lives in
DRILL-BEHAVIOR-RULES.md / DRILLBEHAVIORLEDGER.csv (DRILL-MATRIX.md
DELETED at 5E-SPEC2).

LEDGER-FIRST RULE (2026-08-07, from 5F): where DRILLBEHAVIORLEDGER.csv
already carries a CONFIRMED row for an activity that has not been built
yet, that row is authoritative for its behavior and is not
re-inferred at spec time. A rail walk is still required for page
content, prose, layout and audio inventory — the ledger covers
audioTiming, advanceClass, and Prev/Next only. This inverts 5E's
build-then-correct order specifically to avoid repeating it.

## Visual verification (MANDATORY, established 2026-07-28)

Standing requirement from Nathanael after 5D shipped four teaching
pages with flattened formatting that a screenshot comparison would
have caught immediately. This applies to EVERY implementer round.

1. Nathanael attaches the cohort's RECON-RESULTS (DOSBox screenshots)
   ALONGSIDE the spec for every coding round. The SPEC takes priority
   where the two disagree; the screenshots are the fidelity reference.
2. The implementer must LOAD EVERY PAGE IT BUILT IN A REAL BROWSER,
   screenshot it, and compare it against the corresponding DOSBox
   screenshot — not just assert that the data contains the text.
   Checking that a string is present in JSON is NOT visual
   verification; the 5D failures were all present-but-misrendered.
3. What to compare, explicitly: line breaks and indentation inside
   example panels; underlines and other emphasis; list markers and
   hanging indents; citation alignment; which words are tappable;
   chart column alignment; anything the original sets apart visually.
4. IF VISUAL VERIFICATION FINDS OBVIOUS MISSING FORMATTING, THE
   IMPLEMENTER IS AUTHORIZED TO EDIT src/data — this is a standing
   exception to the "implementers never edit data" rule, added
   2026-07-28. The edit must be listed in RESULTS with its
   before/after so the pipeline can absorb it; the pipeline fix still
   follows, because a hand edit is lost at the next regen.
5. Automation: the repo drives the real UI with playwright-core
   (installed from a scratchpad for three rounds now — it becomes a
   devDependency this round). Page loads, clicks, typing and
   screenshots are all scriptable, so the great majority of a VERIFY
   document should be machine-checked before it ever reaches
   Nathanael. Device-only items (real WebKit audio, airplane mode,
   physical feel of timings, whether a layout reads well) stay human.
   A VERIFY doc should ask Nathanael for JUDGEMENT, not for facts a
   script can establish.

## Project-file methodology (established 2026-07-23)

Three tiers. The repo buildout/ keeps EVERYTHING forever; project
files carry only what a new chat needs.

1. CANONICAL LIVING SET — always in project files, updated at
   boundaries: CHAT-HANDOFF.md (this file), PLAN.md, PHASE5-PLAN.md
   (during phase 5), PIPELINE-INSIGHTS-v3.md, DIVERGENCE-LOG.md,
   DRILL-MATRIX.md, PROJECT.md,
   ONBOARD-SOL.md, font-map.json, toc.json, intro.json,
   transcode_audio.py.
2. DATA SET — chapt-01.json + lexicon-chapt01.json stay as the schema
   reference, plus the CURRENT chapter's data files. Once a chapter is
   device-verified and its pipeline lessons harvested, its data files
   may rotate out (repo keeps them).
3. ROLLING ROUND DOCS — the current round's SPEC + any UNRESOLVED
   VERIFY doc + the PREVIOUS round's HANDOFF (= that round's
   SPEC#-RESULTS). When round N+1 starts, round N-1's spec/handoff
   leave the project files — but ONLY after their durable lessons are
   harvested into the canonical set. Never remove an unresolved VERIFY
   doc.
   BUILD docs never enter the project files. They exist for the
   grading chat and are 75-120 KB of diff; the repo archives them.
   Applied at 5E spec issue (2026-08-03): 5D-SPEC2.md, chapt-03.json
   and lexicon-chapt03.json rotate OUT (cohort 5D closed, lessons
   harvested here, in PHASE5-PLAN and in the divergence log);
   chapt-02.json and lexicon-chapt02.json also rotate out
   (device-verified, lessons harvested). chapt-01.json,
   lexicon-chapt01.json and intro.json STAY as the schema reference.
   Rolling set becomes: 5E-SPEC1.md + chapt-04.json +
   lexicon-chapt04.json + chapt-05.json + lexicon-chapt05.json.
   Standing note: every data file is fetchable from
   raw.githubusercontent.com, so a chat that needs a rotated-out file
   can pull it on demand. Project files are a WORKING SET, not an
   archive, and should stay small enough that the whole set is worth
   reading at the start of a session.

## Harvested 5A/5B/5C lessons (settled — do not re-derive)

- MODULE-MAP CACHE: browsers cache FAILED dynamic imports by URL;
  resetting the JS promise memo (the B7 lesson) is necessary but NOT
  sufficient for chunk-load retry. The user-facing Retry does a full
  location.reload() (fresh document = fresh module map; the shell is
  precached so the reload is cheap). Near-unreachable in practice
  since chunks are precached.
- getBuiltChapterIds / isChapterAvailable answer from glob KEYS
  without loading any chunk — packs.js, the TOC, and getNextChapter
  depend on this staying cheap.
- Lexicon refs live in three buckets (lemmas, exampleWords,
  ch1_lemma_mirror); getLemma searches all three with
  preferChapterId + pool context so a ref existing in two loaded
  chapters resolves to the ACTIVE chapter's copy. Chapter 2 re-audios
  mirror words to chapt_2_a_voc* for audio-pack self-containment
  (the original ISO itself duplicates those ten WAVs into CHAPT_2).
- Pipeline: emit lexicon-chaptNN.json (no dash) going forward; the
  glob tolerates both current spellings.
- divide items: division[] = 1-BASED GAP INDICES between grapheme
  clusters (Intl.Segmenter granularity) — data patches must match.
- divide hint: hint.contentRef resolves by camelCasing an in-chapter
  heading ("Three Syllable Rules" -> threeSyllableRules); supply
  hint.content inline when no in-chapter source exists.
- Completion semantics as built: contentAudio (incl. topicPages)
  completes on visit; scored activities (select, spell, divide,
  placeAccent) complete when EVERY item has been answered correctly
  at least once (retries allowed). Confirming this matches ch1
  SelectActivity and the intended design is an open diagnose item
  (device observation on the Gk->En drill suggested possible
  divergence).
- Bottom-nav (Learn/Drill/Exercise/Review) intermittent greyout: seen
  twice on device, never reproduced, believed addressed in commit
  fa8132f — WATCH ITEM in VERIFY-5B; if seen again, capture route +
  steps immediately.
- MEASURING TEXT IS A FOOTGUN (cost two rounds). `bind:clientWidth`
  reports once, during font-display:block, with the row still laid out
  in the FALLBACK face, and never re-reports the reflow when the
  bundled Greek font swaps in — every measured row was sized from
  metrics ~15% too narrow and the longest words CLIPPED silently
  (overflow-x is hidden app-wide, so nothing errors and nothing
  scrolls). A `visibility: hidden` probe is not reliably re-laid-out on
  font swap either. Anything that measures text uses the pattern in
  DivideActivity: an off-CANVAS probe (left:-9999px, not hidden),
  measured by hand in afterUpdate, plus a ResizeObserver, plus a
  document.fonts.ready epoch bump.
- Preview/headless artifacts that are NOT bugs: ERR_FILE_NOT_FOUND
  for deliberately revoked blob: URLs on fast route exits, and for
  /audio/* autoplay in previews shipping no audio; headless Chrome
  blocks untrusted-gesture autoplay.
- Chapter-2 round-2 findings (settled): isolated diacritics must be
  encoded as SPACING codepoints in data (combining marks after a
  space/paren render as garbage); biblist items are plain strings
  (object items rendered [object Object]); the b_ex2_11..20 clips ARE
  the inflected anthropos forms and double as the rule-chart row
  audio; greekRows rows support parts[] for multi-tap phrases and
  title for grouped charts; scored surfaces carry ui.liveScore +
  defaults.pronounceEach; accent rule drill: no auto-advance on
  incorrect (original behavior), 4s on correct; the original accent
  placement pool is acute-only -- a 5-item circumflex EXTENSION
  (authorized departure) ships pending VERIFY2 keep/drop.
- Completion semantics CONFIRMED on device (VERIFY-5B D2): retry-type
  drills complete on all-items-correct; one-attempt activities
  complete on all-attempted. Bottom-nav greyout: not reproduced across
  4+ full walks post-fa8132f -- closed unless it recurs.
- Chapter-2 round-3/4 findings (settled): the accent-placement
  circumflex EXTENSION was KEPT (25-item merged pool, no banner);
  b_ex2_21 is the vocative ἄνθρωπε, not a root recitation; the
  Syllable Counting Drill stays a RETRY drill and auto-advance timing
  was left alone (VERIFY3 item 1 withdrawn by Nathanael) — the 900ms
  component default in Select/Divide/PlaceAccent/Spell is what a
  device pass reads as "1 second", and one shared constant would move
  all four if it ever comes back.
- 5C extraction reality (REPLACES the old ~75% ceiling note): TBK
  plain strings reach names, instructions, scripts, AND chapters-3+
  drill pools (prompt/option/ref columns); scripts/tbk_richtext.py
  (Stage 4b of PIPELINE-INSIGHTS-v3) reaches rich-text records —
  paradigm charts, underline spans, Greek-vs-English font runs. The
  residual MANUAL share per chapter is sequence order, new-mode
  screen layout, run-time behavior (timing/scoring/shuffle) and
  spot-checks of rule-derived answers.
- Hebrew contamination (CORRECTED at 5C): TBKs embed Hebrew-tutor
  shared resources, but `Hebrew*` FIELD NAMES are shared drill-engine
  plumbing that appears inside legitimate GREEK drills (ch2's
  part-of-speech pool lives in a field named "HebrewWord"). Reliable
  tell-tales: (Hi)/(Ni) stem labels, Hebrew glosses with no Greek
  nearby, and the Attributive/Predicate/Substantive "Hints" popups
  (their agreement list includes "Definiteness" — a Hebrew category).
  Exclude regions around those; never key on Hebrew* names.

## Typography and mark-rendering canon (established 5B closeout)

- TYPO POLICY A1, third extension: typographic normalization is
  authorized alongside spellfixes — double hyphens become em dashes
  (data-side, applied by the pipeline to all future chapters).
- ONE GREEK FONT: a self-hosted subsetted polytonic webfont (rounded
  perispomeni; Noto Serif source unless SPEC3 RESULTS records
  otherwise) leads every Greek stack; Times New Roman demoted to last
  resort. Its file ships in the app-shell precache. NO Greek surface
  may use a different glyph source — the SPEC2 tilde saga came from a
  two-font split.
- MARK GEOMETRY IS GENERATED FROM THE FONT — never written by hand.
  (This SUPERSEDES SPEC3's six rules M1-M6 and the offset table in the
  SPEC3 RESULTS. Do not promote those anywhere; SPEC4 retired them
  because they were wrong by 1-2.3px per mark, in a direction that
  flips by letter, which is exactly what VERIFY3 kept seeing as
  "ever-so-slightly" off.)
  * A drill that draws ONE mark red cannot colour it in place — the
    browser shapes across the inline boundary and paints the mark with
    the base run's colour. So the cluster renders WITHOUT its marks and
    the whole mark set is overlaid (target red, rest ink).
  * WHERE they go comes from the font itself. scripts/make-mark-geometry.py
    reads each precomposed glyph's composite components and writes
    src/lib/mark-geometry.json: 221 clusters — all of Greek + Greek
    Extended bar macron/vrachy — so every accented word a future chapter
    can ship is already covered. Offsets differ per BASE LETTER, not
    just per combination (acute: +0.205em over α, +0.334em over ω,
    +0.058em over ι); no single rule can average that correctly.
  * The overlay marks are ZERO-ADVANCE INLINE BOXES IN NORMAL FLOW,
    placed before the base. Absolute positioning against a box edge is
    what made marks ride low: that edge's distance from the baseline is
    a function of line-height and of which metric the browser picks for
    the strut. Do not reintroduce it.
  * THE FONT AND THE TABLE ARE A MATCHED PAIR. Rebuild
    make-greek-font.py, regenerate make-mark-geometry.py in the same
    commit, or every manually placed mark drifts by a hair. Recorded in
    src/assets/fonts/NOTICE.md.
  * Diaeresis+accent follows the FONT (accent between the dots), not
    SPEC3's departure (accent above them). Blue — printed text — is the
    source of truth for every mark position, per Nathanael.
  * The M1-M6 rules survive in app.css ONLY as a fallback for a mark
    stack with no precomposed codepoint. Shipped data never reaches it
    (build-guarded, below) and it warns when it does.
- Accent placement pools: original 20 acute items + 5 circumflex
  extension items merged/interleaved (Nathanael-approved departure,
  KEPT after VERIFY3); 'extended: true' is provenance only, never
  rendered. An item whose root EQUALS its answerForm prints the root
  with its accents stripped and breathings kept, labelled "Greek Word
  (Unaccented)" — every item shows Greek, none shows its own answer.

## Standing directives (user-set) — every phase

1. Fidelity to the original: glosses, instruction text, audio
   semantics, visual arrangement — never ad-lib content. Behavioral
   claims about the original (e.g. auto-advance) require evidence or
   a VERIFY item.
2. Visual arrangement is pedagogy: preserve lists/indentation/spatial
   layouts; no walls of text. Core lesson text renders prominently
   ABOVE charts; green note banners are parenthetical asides only.
3. Sequential Previous/Next rail everywhere, following the chapter
   JSON "sequence" array.
4. Offline behavior never regresses; every phase ends with an
   airplane-mode check.
5. Audio stops on page exit.
6. No emoji in any deliverable.
7. NO DEAD-END NEXT: at the end of a chapter's rail, Next opens the
   end-of-chapter dialog. Activity-LOCAL steppers may grey out; the
   sequential rail stays live on every page.
8. COLOR SEMANTICS: blue (--link #1663c7) exclusively means tappable;
   everything else uses ink/dark-green.
9. GREEK-TAP RULE: all DISPLAYED Greek is tappable and plays its
   audio; English is not; option buttons never carry audio. A
   `greekTaps` key marks EVERY standalone occurrence in an item's
   text, not just the first (D-24).
   Exceptions: Phonetic Reading Exercise, speller tiles, Review
   Letters Quick Chart (frozen), and the Syllable Division word — a
   tap on it places a divider, so it cannot also play, and it renders
   in INK rather than the tappable blue. Pronounce / Pronounce Each
   carry its audio.
10. NO FULL CACHE/STORE SCAN ON THE APP-LOAD OR ROUTE-MOUNT PATH.
    Counts go through the persisted audioCount store / Settings-only
    reconcileAudioCache().

## Audio semantics cheat-sheet (most-relitigated facts)

- A_<letter> = name + sound (audioFull); A_<letter>N = name only
  (audioShort). audioFull's ONLY consumer is the Learn Letters
  stepper; everything else uses audioShort (twice-corrected fact).
- A_NAME_1..24 = PERSONAL names, A_PLAC_1..11 = place names (Reading
  exercise pools), NOT letter audio.
- A_VOC1..10 = ch1 vocab alphabetically (listen-verified);
  B_VOC1..10 = ch2 vocab (SCRIPT-verified via the TBK SayWord
  dispatch table, except echo=b_voc4 by elimination).
  chapt_2_a_voc1..10 are deliberate duplicates of the ch1 clips
  (pack self-containment — mirrors the ISO).
- A_INTRO1..4 unused by design.
- Chapters 3-8 (5C recon): per-chapter prefix c_..h_; N_voc1..10 +
  N_vocl (Say Whole List); N_sm* word-by-word Scripture Memory +
  whole-verse clip; paradigm cell audio per form; drill-item clip
  families (f_tpd1..40, g_atd/g_etd, h_d2_/h_d3_). Earlier chapters'
  sm clips duplicate FORWARD for cumulative review (follow the ISO;
  i_rm623b pre-ships in CHAPT_8). Full taxonomy:
  buildout/5C-RECON-FINDINGS.md §3.

## Immediate queue (as of 2026-08-07 — cohort 5E closed, 5F opening)

1. **Nathanael: re-upload four files to project files from the repo**
   (repo already has them; project files are stale) —
   `DIVERGENCE-LOG.md`, `DRILL-BEHAVIOR-RULES.md`,
   `DRILLBEHAVIORLEDGER.csv`, `chapt-04.json`, `chapt-05.json`. Also
   upload the refreshed `CHAT-HANDOFF.md`, `PHASE5-PLAN.md` and
   `ONBOARD-SOL.md` this turn produced.
2. **Duplicate file flag**: the project's file list shows TWO uploads
   named `ONBOARD-SOL.md` (300 lines and 275 lines). Only one is
   reachable from this side (299 lines, matches the repo). Delete
   whichever the Claude.ai file manager shows as the older/orphaned
   one — Fable cannot tell from here which upload is which.
3. **Cohort 5F opens: chapters 6, 7, 8 (Prepositions; Adjectives and
   the verb εἰμί; Pronouns), rail-walk-then-build, one chapter at a
   time.** Confirmed sane process (see below). Nathanael supplies
   `ch6railwalk.pdf`; Fable extracts `6_PREPS.TBK` from a re-uploaded
   `GreekTutor.iso` (chat-scoped, does not persist across sessions),
   assembles `chapt-06.json` + `lexicon-chapt06.json` via a new
   `scripts/assemble_ch6.py`, runs `apply-behavior-matrix.py` against
   the already-CONFIRMED chapter-6 ledger rows, and delivers both files
   plus updated `DIVERGENCE-LOG.md`/`5F-EXTRACTION-MAP.md` entries for
   review — repeat for ch7, ch8. **Only after all three chapters' data
   is assembled and reviewed does Fable draft `5F-SPEC1.md`** — one
   spec covering all three chapters, matching the 5E precedent of
   batching same-cohort chapters into one implementation round.
   The chapter-6/7/8 activity names and predicted behavior are ALREADY
   in `DRILLBEHAVIORLEDGER.csv` (28 CONFIRMED rows) — the rail walks are
   for page content, layout and prose, not for behavior discovery.
4. Registry debt carried from 5E: `attemptsPerItem` on `retryUntilRight`
   activities is confirmed dead weight (5E-SPEC3-RESULTS §6.1) — the
   class alone drives behavior. Safe removal order: make
   `answerPolicy` without `advanceClass` a `check:shapes` failure
   FIRST, then delete the field and the fallback branch in
   `timing.js::classOf` together. Not done; do it opportunistically
   during 5F if the file is already open, not as a dedicated round.
5. `scripts/ui-walk.mjs`'s `--out` default still points at a fixed
   directory rather than being round-scoped — flagged during 5E-SPEC2
   and never fixed; it overwrote 475 of Sol's screenshots once already.
   Low priority since chapters are no longer built in parallel, but
   worth a one-line fix before any future dual round.

## Known open questions

- C3 multi-day retention on device: quiet watch item.
- ch3 unreferenced audio c_pisou2 (heard as "pistuousi") has no
  surface in the chapter; leave unwired unless a later chapter
  claims it.
- ch4 unreferenced audio `d_adepar` RESOLVED (VERIFY-5E #17): confirmed
  no surface exists in the original either. Left unwired permanently.
  Compiling a per-chapter unused-audio list is now a standing ask
  (VERIFY-5E #16) — do this for chapters 6-8 too.
- Declining Noun Drill translation reveal RESOLVED (VERIFY-5E #3):
  button-only in the original as well, in both chapters. No change
  needed; the port already matches.
- ch4 Greek Noun Drill item 3 (Mat 5:24) RESOLVED (VERIFY-5E #18): BOTH
  `to` and `brother` are underlined in the original — intentional, a
  dative-case hint. The port currently underlines only `brother`
  (single-string `underline` field). **Still open as a SHAPE gap**: the
  data model needs a way to mark more than one underlined span per
  item before this can be fixed; not scheduled, flag if ch6-8 need it.
- English-gloss vocabulary grids RESOLVED (VERIFY-5E #20): D-19 (2-up
  phone / 4-up 768px) applies to ALL chapters past and future; already
  correctly implemented in chapters 1-5 per the SPEC2 audit. No action.
- "Learn Vocabulary Builder": D2 answered — the chapter rail as
  verified (D1) does not include it; nothing visibly book-jumps. NOT
  ported in 5D; revisit only if a later chapter surfaces it in-rail.
- Font-map stragglers { } ~ | \ ` = — likely not font codes; resolve
  passively as later chapters are extracted.
