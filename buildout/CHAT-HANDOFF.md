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

## Live state (2026-08-25 — DISCLOSURE SPIKE CLOSED, 5H NEXT)

The disclosure spike is CLOSED and merged: DISCLOSURE-SPEC1 (Opus win,
no XPATCH), DISCLOSURE-SPEC2 (Opus solo), DISCLOSURE-SPEC3 (Opus win;
Sol XPATCH ported the ui-disclosure3 census harness and the ui-walk
location-proven console waiver), plus a same-day modal-padding patch
(RESULTS §12). Accepted head: `cc89c9f`. Tally: Sol 4, Opus 10, Ties 0
(Opus total includes solo rounds). All ten chapters' data is committed
and disclosure-conformant; nothing is staged.

What the spike settled (canon lives in DISCLOSURE-RULES.md, amended
2026-08-17 and 2026-08-18, and DRILL-BEHAVIOR-RULES.md B-last):

- Accordions are BOXED (green title, left caret, #fffdf3 on #fdf9e7,
  minimal padding, no inner indent); Meanings is the sole exception.
- "<Qualifier> Examples" titles everywhere; bare "Examples" only when
  no short qualifier exists. Greek allowed in titles as inert control
  labels.
- Pinning is MODALS ONLY; one footer composition (one divider, padding
  above and below MEASURED as painted strips, nav line never divided
  from Close); say buttons never pinned alone; 3+ modals pin only the
  Back/More pair. The D13 harness measures strips, not declarations —
  declared padding passed on a build the eye rejected.
- Review (C9) pages NEVER page, regardless of chart names (printable).
- Green underline is EXCLUSIVE to tappable elements; headerUnderline
  is inert provenance; title links (titleLink) are green.
- Sequence-stepped activities load item 1 on mount (pronounce per
  advance behavior); selection-driven keep their empty start
  (DRILL-BEHAVIOR-RULES B-last). Census pinned by ui-disclosure3:
  13 changed / 202 already-loaded / 4 exempt over 219 activities.
- Hints transcribe their OWN original screens (§4.7); rows never merge
  unless the original merges; the railwalk HAND CURSOR is binding for
  tappability. The ch5 hint chart was rebuilt from ch5railwalk.pdf.
- Speller keyboard has a one-shot Shift (bottom-left, width from the
  spacebar); capitals map through one table, tiles and physical alike.
- The half-screen modal bug: root-caused to a stale --modal-vh
  (missed resize on iOS resume with keyboard height snapshotted);
  fixed with pageshow/visibilitychange/focusout/modal-open re-measure
  plus a plausibility clamp. DEVICE SOAK STILL PENDING — the fix is
  proven at the trigger level, not yet over days of real use.

Gates at close: shapes/build/lazy-chunk green; ui-disclosure 206/206;
ui-disclosure3 73/73; ui-behavior 902/902; ui-modals 155/155; ui-walk
105 stops x 2 widths clean; offline 44 stops. Standing debt:
check:docs fails on ~45 docs from a CRLF-vs-LF guard defect (pre-
existing, cause documented in DISCLOSURE-SPEC1 RESULTS §7.1).

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
   and SPEC#-BUILD-<MODEL>.md: the COMPLETE exact git diff + full
   thought/tool log + wall-clock time. Specs must instruct producing
   both. PERMANENT (2026-08-25): wall-clock and the full diff are
   MANDATORY every round; addenda and patches add their time to the
   main total; the grader auto-penalizes either omission.
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


### Added 2026-08-16 (learned the hard way — do not re-derive)

- **THE REPO IS THE ONLY BASE.** For any update/add/drop of a living
  document, read the LIVE repo version FIRST. The repo is public:
  `git clone https://github.com/nathanaeljames/greek-tutor.git` or
  raw-fetch `buildout/<file>`. Project-file mirrors are NOT a base and
  are routinely stale. If the live version cannot be read, STOP and
  ask; never build a replacement from a project-file copy.
- **STOP on ANY referenced-but-absent artifact.** If a message cites a
  PDF, screenshot or document not in hand, halt and request it before
  producing anything. A feedback PDF referenced in VERIFY-5G but never
  uploaded cost an entire implementation round (5G-SPEC2 shipped
  without any of its items).
- **NEVER wholesale-rewrite a living document.** Edit in place and
  preserve every standing section. A "full refresh" of THIS FILE
  destroyed 11 sections at commit 021a03d; they were recovered from
  git history at 631aa7e. Full-file replacement is the DELIVERY
  FORMAT, not a licence to re-author content.
- **Implementers NEVER run git.** No commit, no push, no staging: all
  version control is Nathanael's. Specs request read-only `git diff`.
- **Check PDFs for STRIKETHROUGH before treating text as ratified.**
  Text extraction drops it silently; test rule/line geometry against
  glyph midlines (pdfplumber). Struck passages are VOID.
- **RICH DOCUMENTS ARE INSPECTED, NOT JUST EXTRACTED (PERMANENT,
  2026-08-25, supersedes the PDF-only form above).** Every provided
  document in a rich-text format — PDF, Excel/spreadsheet, Word —
  is checked for STRIKETHROUGH and for COLOR CODING (cell fills and
  font colors, especially in spreadsheets) before its content is
  treated as ratified. Nathanael uses both liberally and their loss
  in plain-text extraction has caused repeated failures. Struck
  content is VOID; color semantics are surfaced and asked about if
  their meaning is not already established.
- **WALL-CLOCK TIME IS MANDATORY IN EVERY ROUND (PERMANENT,
  2026-08-25).** Every spec instructs it, every RESULTS/BUILD reports
  it, and every follow-up patch or addendum ADDS its time to the main
  implementation's total. Both implementers have omitted it in the
  MAJORITY of rounds despite repeated requests — the grader now
  applies an automatic penalty when it is missing (GRADER-PROMPT).
  There are no rounds without wall-clock values.
- **THE BUILD DOCUMENT IS THE FULL GIT DIFF (PERMANENT, 2026-08-25).**
  A BUILD doc without the complete, exact `git diff` of the round's
  cumulative work has failed its one purpose. Summaries, excerpts, or
  "see the tree" do not satisfy it. The grader applies an automatic
  penalty when the full diff is absent.

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

## Immediate queue (2026-08-25)

1. **Cohort 5H opens: chapters 11-12 (Demonstratives; Imperfect).**
   Launch in a FRESH CHAT with the project files and the ISO (the ISO
   does not persist across conversations and extraction needs it).
   Recon first, per the standard: rail-walk PDFs for both chapters,
   answered-screen capture for every TRANSLATION-type drill, watch for
   form-dependent hints (D-46), resize check on the provisional 11-28
   grouping (title sweep surfaced extra activities in 11 and 13).
   Ledger rows for the new chapters' drills before any spec.
2. Extraction pipeline: assemble_ch11/ch12 assemblers with Stage 8.7
   provenance banners and post_patches() guards; new-chapter data
   passes are DISCLOSURE-CONFORMANT FROM BIRTH (boxed-accordion
   labels with qualifiers, no bare "Examples", C2 interspersing,
   hints from their own screens, hand-cursor tap wiring, C9 stacked
   review pages, initial-load classification per B-last).
3. VERIFY-DISCLOSURE3 residue rides along: the half-screen fix device
   soak, Shift-key feel, ch8 swapped clips by ear, ch7 rule-line taps,
   title-link green — confirm during normal 5H device use, no
   dedicated round needed unless something fails.

## Known open questions

- **Half-screen modal fix awaits its device soak** (VERIFY-DISCLOSURE3
  item 1): trigger-level proof exists; days-of-use confirmation does
  not. If it recurs, the clamp threshold and trigger set in
  src/lib/viewport.js are the knobs.
- **check:docs CRLF guard defect** (~45 false failures, documented
  DISCLOSURE-SPEC1 RESULTS §7.1): fix the guard's normalizer or the
  blob/working-tree comparison in a future round; it is noise today.
- The eimi two-state hint extension (D-48f3e) objection window
  remains open; reversing it is a two-line change.
- Cohort 5H+ grouping remains provisional pending each cohort opening.
- Standing pipeline debt: the phi-arisaios redMarkCluster off-by-one.
