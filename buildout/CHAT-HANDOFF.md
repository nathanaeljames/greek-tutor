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

## Live state (2026-07-23)

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
- **5B (chapter 2 wiring) SHIPPED** — implemented by GPT Sol (Codex)
  with five surgical patches merged from a parallel Opus 4.8 run
  (buildout/5B-MERGE-SPEC.md). New vocabulary registered: topicPages
  mode; greekRows + expander RichContent blocks; divide + placeAccent
  activity types; static option sets in select; speller-tiles.json
  shared keyboard contract. Both rails green (ch2 20/20, ch1
  regression 26/26), precache 19, chapter-1 chunk hash unchanged.
  Record: buildout/HANDOFF-5B-SOL.md.
- **Chapter 2 data is PARTIALLY PENDING**: chapt-02.json ships with
  _verify gaps (the 21 syllable-division words, answers for the accent
  rule / marking recognition / part-of-speech drills, several popup
  contents). Components render pending states and will consume the
  data patch without code changes. VERIFY-chapt02.md + its ADDENDUM
  are the collection instrument; Nathanael's DOSBox pass feeds Fable's
  data patch. The 5B device pass (VERIFY-5B.md) runs after the patch
  lands as one combined pass (an early partial run is fine — pending
  placeholders are expected, not failures).
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
   VERIFY doc + the PREVIOUS round's HANDOFF. When round N+1 starts,
   round N-1's spec/handoff leave the project files — but ONLY after
   their durable lessons are harvested into the canonical set. Never
   remove an unresolved VERIFY doc. Example: entering 5C, keep
   5C-SPEC + HANDOFF-5B-SOL + VERIFY-chapt02 (if still open); remove
   5A/5B specs and HANDOFF-5A (harvested here).

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
   Letters Quick Chart (frozen).
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

## Immediate queue (as of 2026-07-26)

1. Implementer round: 5B-SPEC2.md (device-feedback corrections, first
   round under process v2) against the replacement chapt-02.json.
   Both models; RESULTS + BUILD docs back; grading chat runs
   GRADER-PROMPT v2; XPATCH if justified; winner authors VERIFY2.
2. Nathanael: VERIFY2 device pass (key items: rounded circumflex on
   iOS, mark-only red technique, extended accent-placement items
   keep/drop, bibliography, division-exercise ergonomics).
3. Chapter 2 closes when VERIFY2 returns clean; then 5C: recon pass
   chapters 3-8 + the bounded rich-text parser experiment; produce
   5D-RECON-TASKS per process v2; PHASE5-PLAN cohort batching.
4. Carried nits: Escape/initial-focus on modals; playwright-core as
   devDependency; debug-card precache-count line (optional).

## Known open questions

- Chapter-2 pending data (see queue) — the only 5B blocker.
- Completion semantics confirmation (harvested-lessons item above).
- C3 multi-day retention on device: quiet watch item.
- Font-map stragglers ($ { } ~ | \ ` =) resolve at chapters 3+.
