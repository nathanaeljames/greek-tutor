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

## Live state (2026-07-27)

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
- Vocabulary registered across the cohort: topicPages mode; greekRows,
  expander and subheading RichContent blocks; divide + placeAccent
  activity types; static option sets in select; speller-tiles.json
  shared keyboard contract; a bundled derived Greek webfont; a
  font-derived mark-geometry table.
- Font map after chapter 2: '#' = smooth+circumflex and '[' = rough
  breathing VERIFIED; ';' ':' identified as Greek question mark /
  raised-dot colon (stored NFC-canonical: ';' and U+00B7); 'v'
  provisionally nu; '!' excluded as Hebrew-region contamination.
  Remaining unknowns: $ { } ~ | \ ` = (several likely not font codes).

## Buildout process v2 (established 2026-07-26; applies to buildout phases)

Per-cohort loop with fixed document naming (# = round number):
1. Automated extraction (Fable) -> data files + <cohort>-RECON-TASKS.md
   listing what strings/scripts could not yield.
2. Nathanael's manual recon -> <cohort>-RECON-RESULTS.md (+ PDFs).
3. Fable: RECON-RESULTS + canonical project knowledge (CHAT-HANDOFF.md
   and PIPELINE-INSIGHTS-v2.md ARE the stored prior knowledge) ->
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

Data-file process rule (unchanged, load-bearing): src/data/*.json is
authored ONLY by the chat pipeline from committed copies; implementers
commit delivered files as-is and never edit content; DOSBox/device
answers route to Fable.

## Project-file methodology (established 2026-07-23)

Three tiers. The repo buildout/ keeps EVERYTHING forever; project
files carry only what a new chat needs.

1. CANONICAL LIVING SET — always in project files, updated at
   boundaries: CHAT-HANDOFF.md (this file), PLAN.md, PHASE5-PLAN.md
   (during phase 5), PIPELINE-INSIGHTS-v2.md, PROJECT.md,
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
   Applied entering 5C (2026-07-27): keep 5B-SPEC4-RESULTS.md as the
   previous round's handoff; drop 5B-SPEC{,2,3}*.md, 5B-XPATCH1.md,
   HANDOFF-5B-{SOL,OPUS}.md, VERIFY-5B.md and VERIFY-chapt02{,-ADDENDUM}.md
   — all harvested here, chapter 2 closed, nothing unresolved.

## Harvested 5A/5B lessons (settled — do not re-derive)

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

## Pipeline contracts for chapters 3+ (cumulative)

- contentAudio mode vocabulary (dispatch mode-keyed, never by id):
  objectivesPage, textPage, stepper, flashcard, equationChart,
  vowelStair, diphthongRows, exploreGrid, fullOptionGrid,
  selfCheckStepper, selfCheckSequence, reviewVocab (honors showNtFreq
  and playAll:{audio,label}), reviewLetters, topicPages (topics[] of
  {id,title,content[]}, in-activity topic stepper).
- Activity types: contentAudio, select, spell, divide, placeAccent
  (match/translate/parse/audioPlayer still unbuilt from the original
  seven-type plan; expect them in later chapters).
- RichContent blocks: heading, para, numbered, defList (BOTH forms:
  ch1 tuple rows for tappable Greek; {term,def} objects for English
  prose — prefer object form for prose), biblist, refs, note,
  greekRows ({columns?, rows[{label, greek, syllables[], gloss, note,
  audio}]}; positional layout auto-selected when columns exist +
  counts match + no gloss — add an explicit layout:"positional" flag
  for ch3+ to remove the inference), expander ({label, content[]},
  closed by default, no nesting).
- numbered items: supply explicit numeric markers OR rely on the <ol>
  — never both (self-numbering triggers only on /^\(?\d+[.)]/).
- select static option sets: optionValues[]; answer matches by VALUE;
  null answer renders a pending state with Skip. Sentence prompts
  carry {sentence, underline} where underline is the exact word.
- Greek-tap contract: generators declare promptIsGreek + promptAudio;
  greekTaps keys mark first STANDALONE occurrences; all displayed
  Greek uses the shared .greek-say pattern.
- RED-MARK ITEMS (select drills): redMarkCluster is the 1-BASED
  grapheme-cluster index and MUST point at a cluster that carries the
  mark the item asks about. A cluster that IS the mark (apostrophe,
  raised-dot colon, question mark) reddens whole and needs no index
  arithmetic. `npm run check:shapes` FAILS the build on an index past
  the end of the word, on a cluster with no mark, and on any cluster
  missing from mark-geometry.json — chapter 2 shipped a φαρισαῖος item
  pointing at a bare alpha for two rounds, which rendered with nothing
  red at all.
- divide items: no numbered gap buttons any more (SPEC4 rebuilt the
  exercise as draggable dividers on the word). The DATA contract is
  unchanged — division[] is still 1-based gap indices — and the word is
  no longer an audio tap, so pools need per-item audio only for
  Pronounce.
- speller: spellerTilesRef resolves via static
  src/data/speller-tiles.json (39-tile keyboard contract);
  single-source it at the next chapt-01 regen (drop the inline copy).
- Every new chart is tested at 320px (overflow CLIPS, not scrolls).
- Sequence arrays are pedagogy-derived, DOSBox-verified per chapter;
  TBK storage order is never the answer.
- Extraction reality: TBK plain strings + OpenScript fragments are
  extractable; RICH-TEXT records (exercise word lists, underline
  formatting, some popups) are NOT — expect roughly 75% extraction
  with the remainder collected via a per-chapter VERIFY doc + DOSBox
  screenshots. Format limit, not a session/chunking limit. (A bounded
  binary rich-text-parser experiment is queued for 5C; success would
  shrink the manual share for all 26 remaining chapters.)
- Hebrew contamination: TBKs embed Hebrew-tutor shared resources
  (Hebrew glosses, (Hi)/(Ni) stem labels, HebrewWord field names) —
  detect and exclude these regions.

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
   audio; English is not; option buttons never carry audio.
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

## Immediate queue (as of 2026-07-27 — chapter 2 CLOSED)

1. **5C opens.** Recon chapters 3-8 + the bounded binary rich-text
   parser experiment -> 5C-RECON-TASKS.md; PHASE5-PLAN cohort
   batching. The parser is the leverage item: success shrinks the
   manual DOSBox share for all 26 remaining chapters.
2. Chapter 3+ data authoring runs the per-cohort loop unchanged
   (process v2 above). Nothing about chapter 2 blocks it.
3. Data debt to clear at the next chapt-01/intro regen: residual "--"
   in chapt-01.json.learn[7].content[1].text, intro.json.learn[0]
   .content[1].text and .content[3].text, and lexicon-chapt01.json
   exampleWords.anthropoi.gloss / .anthropois.gloss. Chapter 2 is
   clean; these predate the em-dash policy.
4. Carried nits: Escape/initial-focus on modals; playwright-core as a
   devDependency (three rounds now have driven the real UI from a
   scratchpad install).
5. Quiet watch item for the next implementer round, not a blocker: the
   mark-geometry table is generated from the REGULAR weight only.
   Correct today — every red-overlay surface sets Greek at 400. A bold
   red-mark surface would need a second table.

## Known open questions

- Completion semantics confirmation (harvested-lessons item above).
- C3 multi-day retention on device: quiet watch item.
- Font-map stragglers ($ { } ~ | \ ` =) resolve at chapters 3+.
