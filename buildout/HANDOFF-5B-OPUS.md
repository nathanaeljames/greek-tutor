# HANDOFF-5B.md — Chapter 2 wiring (phase 5, pass B)

Input: `5B-SPEC.md`, the already-landed chapter-2 data files, and the phase-5A
lazy loader. No chapter data JSON was edited. No commit was created and nothing
was pushed.

## 1. Precondition gate

`VERIFY-5A.md` contains completed device responses but its final `ALL PASS`
checkbox is still unchecked. The one repeatable concern recorded there, the
occasionally disabled bottom bar, was diagnosed and fixed in the latest
user-authored commit (`fa8132f`, described as "wrapping stage 5a"). The current
explicit instruction to implement 5B was therefore treated as the human gate
approval. This inference is recorded here rather than silently converting the
unchecked verification document into a pass.

## 2. What changed

### Content registration and lookup

- `src/lib/content.js`
  - The existing globs automatically register `chapt-02.json` and
    `lexicon-chapt02.json`; `getBuiltChapterIds()` now returns `intro`,
    `chapt_1`, and `chapt_2`.
  - `loadChapter()` resolves explicit `spellerTilesRef` dependencies inside the
    route gate. A direct chapter-2 speller route therefore has chapter 1's
    verified 39-tile inventory available synchronously below the gate.
  - `getLemma()` accepts optional chapter and pool context. This prevents a
    loaded chapter-1 lexicon from stealing chapter-2 mirror refs and preserves
    the deliberate `chapt_2_a_voc*` pack-local audio ids.
  - `buildSelectQuestions()` supports authored `optionValues[]`, Greek or
    English prompt sources, static answers, contextual prompt audio, and
    visible pending questions when required prompt/answer fields are null.

`toc.json` already contained the chapter-2 entry, and both chapter-2 JSON files
were already committed before this implementation. They were not modified.

### Components added

- `src/components/DivideActivity.svelte`
  - Implements numbered multi-select gaps between Unicode grapheme clusters,
    Check Answer, Show Answer, score, Previous/Next, Pronounce Each, and Hint.
  - The current 21 null word/division records render explicit pending states.
  - The data supplies `hint.contentRef` rather than inline content. The
    component resolves that reference against an authored RichContent heading,
    so the Three Syllable Rules render without duplicating or inventing copy.
- `src/components/PlaceAccentActivity.svelte`
  - Implements accent-type selection followed by a numbered letter-position
    selection, Check Answer, Show Answer, score, Previous/Next, Pronounce Each,
    feedback pools, and completion tracking.
  - Correct answers lock against duplicate scoring until the learner moves to
    another word.
- `src/lib/greek.js`
  - Splits Greek by grapheme cluster and analyzes accents in NFD.
  - Removes only U+0301, U+0300, and U+0342 from the displayed place-accent
    form, preserving breathings and diaeresis, then returns NFC for display.
- `src/components/ActivityHost.svelte`
  - Dispatches the two new activity types while preserving the existing
    `{#key activityId}` remount boundary.

### Components extended

- `src/components/ContentAudio.svelte`
  - Adds the mode-keyed `topicPages` local stepper with topic title,
    Previous/Next Topic controls, count, and RichContent per topic.
  - Adds `reviewVocab.playAll` while retaining chapter 1's
    `sayWholeListAudio` contract.
- `src/components/RichContent.svelte`
  - Adds `greekRows` with optional headings, syllable-chunk spacing, labels,
    glosses, audio-aware Greek taps, inert ink-colored Greek, responsive rows,
    and visible verification notices.
  - Adds closed-by-default recursive `expander` blocks.
  - Accepts both chapter 1's tuple-form `defList.rows` and chapter 2's
    object-form `defList.items`.
  - Suppresses browser list markers when the data already provides numbered
    labels, avoiding duplicated numbering.
  - Removes the old speaker emoji from RichContent examples. Tappability
    remains communicated by the required blue Greek styling.
- `src/components/SelectActivity.svelte`
  - Renders long static option sets in a two-column grid and short sets in the
    existing four-column grid; chapter-1 layouts remain four-column.
  - Renders English prompts without the Greek font, future underlined sentence
    targets, contextual controls, and explicit pending states.
- `src/components/SpellActivity.svelte`
  - Resolves chapter-context lemmas and `spellerTilesRef` without adding a
    second tile inventory.
- `src/app.css`
  - Adds responsive topic, Greek-row, pending, divide, and place-accent styles.
  - At 320 px, long row content wraps instead of clipping; tappable Greek and
    accent/gap answer controls use `--link` blue.
- `scripts/check-lazy-chunk.mjs`
  - Extends the tree-shake/build guard to require both chapter-2 chunks, keep
    chapter-2 lesson data out of the main bundle, and require both new chunks
    in the service-worker precache.

### Project memory

- Root `AGENTS.md` records `ONBOARD-SOL.md` as the authoritative persistent
  onboarding source and preserves its load-bearing directives for future work.

## 3. Schema friction and data gaps

These are pipeline findings, not local data corrections:

1. The spec describes the divide hint content as included in `activity.hint`,
   but the delivered shape is `{ contentRef: "threeSyllableRules" }`. The
   generic heading-reference resolution above bridges the actual shape.
2. Chapter 2 uses object-form `defList.items`; the prior renderer only knew
   tuple-form `defList.rows`.
3. `spellerTilesRef: "chapt_1"` crosses a lazy-chunk boundary. Direct loading
   chapter 2 requires the loader to resolve that explicit data dependency.
4. Chapter-2 mirror lemmas reuse chapter-1 refs. Context-free lookup could play
   chapter-1 audio after both lexicons had loaded, violating pack
   self-containment; lookups are now chapter/pool scoped at affected call sites.
5. Three static drills remain non-scorable by design because their answer data
   is null: Accent Rule, Marking Recognition, and Part of Speech. Their known
   prompts render where available, followed by a visible pending-verification
   state. Syllable Counting has complete prompt/answer data and is functional.
6. All 21 Divide items still have null `greek` and `division`; the complete
   component renders each item as pending and will consume the later data patch
   without component changes.
7. Several populated charts carry `_verify` because placement/audio pairings
   need DOSBox confirmation. Existing rows remain visible, with a concise
   pending notice; content is never guessed or hidden.

## 4. Acceptance results

### Build shape

PASS — `npm run verify`.

- Vite transformed 69 modules and completed without warnings or errors.
- Emitted and precached:
  - `chapt-01-8ZoFoXk9.js` — 35.39 kB
  - `lexicon-chapt01-DWCL8L3K.js` — 6.75 kB
  - `chapt-02-Bj1cYXtT.js` — 42.75 kB
  - `lexicon-chapt02-DbQ9TYN-.js` — 9.22 kB
- Chapter 1's chunk hash remained `8ZoFoXk9` throughout the 5B builds.
- Both chapter needles are absent from `index-Bc2p5aOd.js` and present only in
  their chapter chunks.
- `sw.js` precaches both chapter and both lexicon chunks.
- Precache count is 19, the phase-5A count of 17 plus the two chapter-2 chunks.

### Browser behavior at 320 px

PASS — headless Chrome with an iPhone user agent against the real Vite modules.

- Direct-load checks passed for TOC, Settings, chapter-2 hub, hub section, and
  activity routes.
- Chapter 2 full rail walk: 20 of 20 items in authored sequence order, then the
  end-of-chapter dialog; no dead-end Next.
- Chapter 1 regression rail walk: 26 of 26 items, then its end dialog.
- Zero console exceptions and zero page errors.
- Every topic of all four `topicPages` activities was visited with all
  expanders opened. Cards, `greekRows`, syllable matrices, the longest wrapped
  rows, and all nine Review Marks rows stayed inside the 320 px viewport.
- Computed-style sweep: tappable Greek is `rgb(22, 99, 199)`; Greek rows with
  no audio remain ink-colored and inert.
- Syllable Counting resolved 20 contextual Greek prompts, all with chapter-2
  audio and answers; correct-answer feedback and advancement passed.
- Accent Rule's 20 missing answers render as pending rather than accepting a
  null answer.
- Divide pending state and the Three Syllable Rules Hint passed.
- Place Accent passed the full first-item flow: accent-stripped display,
  Acute selection, correct position, Check Answer, chapter-2 feedback, score,
  and duplicate-answer lock.
- Unicode unit checks passed for acute, grave, and circumflex removal while
  retaining smooth/rough breathings and diaeresis.
- Direct chapter-2 speller load rendered all 39 chapter-1 tiles.
- Review Vocabulary rendered the authored `Play` control.

### Hard-offline preview equivalent

PASS — final built preview, service worker installed, chapter-2 pack downloaded,
then the preview server was killed and independently confirmed unreachable.

- Chapter-2 pack: 75 files in IndexedDB.
- Settings state: `Audio available offline`; persisted audio counter: 75.
- Offline activity reload rendered under service-worker control.
- An explicit trusted tap on a blue Greek prompt played from IndexedDB without
  a toast.
- Offline direct activity refresh passed.
- Offline chapter-2 rail walk reached all 20 items and the end dialog with zero
  console/page errors.

## 5. Screenshots

All screenshots are final 320 by 844 CSS-pixel captures at device scale 2:

- [Learn Syllables](screenshots/5B/topic-syllables.png)
- [Learn Accents](screenshots/5B/topic-accents.png)
- [Learn Other Marks](screenshots/5B/topic-marks.png)
- [Learn Grammar Review](screenshots/5B/topic-grammar-review.png)

## 6. Surprises and verification notes

- A rapid automated rail walk starts auto-pronunciation and immediately leaves
  the route. The standing route-exit behavior correctly calls `stop()` and
  revokes the Blob URL; headless Chrome then logs a resource-level
  `ERR_FILE_NOT_FOUND` for that intentionally revoked `blob:` URL. These were
  not console exceptions or page errors. The hard-offline trusted-tap check,
  which does not immediately navigate away, played without a toast. No audio
  architecture code was changed.
- Headless Chrome blocks the select drill's direct-load autoplay because there
  is no trusted user gesture. The offline audio assertion therefore disabled
  Pronounce Each, waited for the policy toast to clear, and used a trusted CDP
  pointer tap. This is a browser-harness limitation, not an offline cache miss;
  the requested clip and all 75 pack keys were present in IndexedDB.
- No iOS/WebKit claim is made from the Chrome pass. The final airplane-mode
  device result remains Nathanael's verification step.

## 7. Out-of-scope confirmation

No chapters 3+, special-book surfaces, data contents, audio manifest, audio
store/download ownership, service-worker runtime routes, or progress backend
were changed. No cache/store scan was added to app load or route mount.

## 8. Post-merge patches (5B-MERGE-SPEC)

Five targeted improvements ported from a parallel Opus 4.8 implementation:

1. **Static speller tiles** -- `spellerTilesRef` now resolves via a static
   `src/data/speller-tiles.json` file and `getSpellerTiles()`, replacing the
   cross-chunk `loadChapter` dependency resolution. No runtime coupling
   between chapter lazy chunks.
2. **Precise self-numbering** -- The `authored-labels` heuristic now uses a
   `/^\(?\d+[.)]/` regex so only numeric markers suppress `<ol>` auto-
   numbering. Chapter-1's named labels ("Final Sigma") are unaffected.
3. **String-reconstruction answer check** -- PlaceAccent's `check()` now
   reconstructs the full accented string and NFC-compares to `answerForm`
   instead of comparing type + position separately.
4. **LEMMA_BUCKETS abstraction** -- `getLemma` delegates to a shared
   `lemmaFromLexicon()` helper with a `LEMMA_BUCKETS` array, making future
   bucket additions a one-line change.
5. **Auto-advance on correct** -- PlaceAccent and Divide auto-advance to the
   next item ~900ms after a correct answer, matching the original's behavior.

No existing generated chapter or lexicon data files, build guard, emoji
cleanup, touch-action extensions, or `AGENTS.md` were changed by these patches.
Patch 1 adds only the specified static keyboard-contract JSON copied exactly
from chapter 1.

### Post-merge acceptance

- `npm run verify`: PASS. Production build hash `index-CUudhiYd.js`; lazy
  chunks `chapt-01-8ZoFoXk9.js` and `chapt-02-Bj1cYXtT.js` remain separate,
  emitted, precached, and absent from the main bundle.
- Fresh-profile direct load of `#/activity/chapt_2/c2_ex_speller`: PASS. It
  rendered 39 tiles, requested `chapt-02.json`, `lexicon-chapt02.json`, and the
  static tile contract, with zero chapter-1 content or lexicon requests.
- Numbering DOM checks: PASS. Chapter 1's "Final Sigma" and "Nasal Gamma"
  retain `rc-lead` plus decimal `<ol>` markers; chapter 2's authored `1)` / `2)`
  / `3)` labels use `rc-num` with browser markers suppressed.
- PlaceAccent reconstruction: PASS. The intentional wrong type was rejected,
  the first word's correct Acute placement was accepted, and auto-advance
  fired in 913ms.
- Divide auto-advance: PASS against a focused three-item component fixture;
  auto-advance fired in 913ms. Immediate manual Next canceled the pending
  timer in both PlaceAccent and Divide, with no extra item skipped.
- Full 320px browser rails: PASS. Chapter 2 reached 20 of 20 and its end dialog;
  Chapter 1 reached 26 of 26 and its end dialog. Zero console exceptions or
  page errors.

## 9. Chapter 2 data patch (5B-PATCH-SPEC)

Input: the three delivered replacement data files plus `5B-PATCH-SPEC.md`.
No data file content was edited. No commit was created and nothing was pushed.

### 9.1 Files committed

The three replacement files were already committed to the worktree ahead of
this pass, in the same user-authored commit that added the spec (`3186ac8`,
"adding phase 5b patch spec"):

- `src/data/chapt-02.json` (1794 lines changed)
- `src/data/lexicon-chapt02.json` (70 lines changed)
- `src/data/font-map.json` (18 lines changed)

They were taken as authoritative and left byte-identical. `font-map.json` is
documentation only -- nothing under `src/` imports it (the sole reference is a
comment in `SpellActivity.svelte` pointing at `_keyboard_layout_note`), so it
needed no wiring. Only two `_verify`-family keys survive in the chapter, both
`_verify_resolved` notes; the app renders zero pending placeholders anywhere in
chapter 2.

### 9.2 Component diffs

New files:

- `src/lib/markup.js` -- `splitUnderline()` / `stripMarkup()` for the inline
  `[[u]]...[[/u]]` spans (2g).
- `src/components/Marked.svelte` -- renders one authored string with its
  underline spans as plain text nodes (never `{@html}`).

Changed files:

- `src/lib/greek.js`
  - `dividedForm()` now hyphen-joins (2h), replacing the raised dot.
  - Added `markClusters(text, redIndex)` for the Marking Recognition red mark
    (2e). Removed nothing else.
- `src/lib/content.js`
  - `buildSelectQuestions()` static-option branch now carries `gloss`,
    `correctForm` and `redMarkCluster` through to the component, and strips
    markup defensively from prompts and underlines.
  - Option-grid density is now driven by the longest label: `wide` (4-up) for
    number tiles, default 2-up for short names, and a new `single` (1-up) class
    for the Accent Rule's full-sentence options. Chapter 1's grids are
    unaffected (they take the generator/lemma branches).
  - `resolveItems()` strips markup from resolved glosses.
- `src/components/SelectActivity.svelte`
  - One-attempt answer flow (2a): `answerPolicy.attemptsPerItem === 1` makes an
    option tap finalize the item right or wrong, reveal the answer, and
    auto-advance after `autoAdvanceMs`; `"retry"` / absent keeps the existing
    loop. The timer is cleared on `onDestroy` and on re-init. Completion still
    fires when the last item is passed, which under one-attempt equals "all
    items attempted".
  - Selection colors (2b): static-option drills get `.tile.selected` (blue) for
    the learner's guess and `.tile.correct` (green) for the revealed answer;
    `.tile.incorrect` (red) is now only reachable by chapter 1's retry drills.
  - Red mark (2e), underline (2f), inline Hint (2j), and the one-syllable bar
    (2c, answering "1" in the counting drill).
  - Reveal row: on a finalized item the item's `gloss` and, where present,
    `correctForm` are shown. See deviations below.
- `src/components/DivideActivity.svelte`
  - One-attempt flow and the 4000ms policy timer (2a), cancelled on manual
    Previous/Next and on unmount; completion tracks ATTEMPTED items.
  - One-syllable bar (2c): full-width under the word, clears and locks the gap
    selections, submits `division: []`.
  - Blue selection / green confirmation on the gaps and the bar (2b).
  - The divided form is revealed automatically on a finalized item, hyphen
    joined (2h).
- `src/components/PlaceAccentActivity.svelte`
  - Root header (2d): `ui.header` label, `root` as a tappable greek-say word,
    `rootGloss` beside it. The position row already derived the unaccented form
    from `answerForm` via `analyzeAccent()`; the `getLemma()` lookup was dropped
    because the replacement items carry `audio` directly and no longer have
    `ref`. `ref` renders in the checkbox row.
  - One-attempt flow with the policy timer, `answerForm` revealed on finalize,
    blue/green on both the accent-type chips and the position slots, and the
    inline Hint (2a, 2b, 2j).
- `src/components/RichContent.svelte`
  - Inline underline (2g) at every authored-string site: heading, para,
    preamble, numbered item text and note, defList term/value, biblist entry,
    refs, note, expander label, greekRows label and gloss.
  - `greekRows` matrices may now carry a per-row `label`; see 9.4.
- `src/components/ContentAudio.svelte` -- `reviewVocab` renders `footnote` under
  the chart (2i). `playAll.label` was already honored and now reads "Say Whole
  List" from the data.
- `src/components/ActivityHost.svelte` -- strips markup from instructions.
- `src/app.css` -- selection/confirmation colors, `.one-syllable-bar`,
  `.accent-root*`, `.exercise-ref`, `.mark-red`, `.reveal-row`,
  `.grid.options.single`, `.rc-rowlabel`, greekRows header wrapping, and two
  additions to the universal `touch-action` selector list.

### 9.3 Acceptance results

- **`npm run verify`: PASS.** Build clean, no warnings. `chapt-01-8ZoFoXk9.js`
  hash UNCHANGED across every build in this pass. `chapt-02-CELEYLYt.js` and
  `lexicon-chapt02-Dca-1p1v.js` re-emitted, precached, and absent from the main
  bundle. Precache count 19, unchanged.
- **Full chapter-2 rail walk in the NEW sequence order: PASS.** 20 of 20 in the
  authored order (Syllable Counting 3, Syllable Division 4, Accent Rule 6,
  Marking Recognition 8, Accent Placement 9, Part of Speech 11, QR Vocab 16
  leading the quick reviews), then the end-of-chapter dialog. Zero pending
  placeholders on any item, zero console/page errors, `scrollWidth` 320 on
  every item.
- **Chapter-1 regression walk: PASS.** 26 of 26 plus its end dialog, zero
  errors, no horizontal overflow.
- **Syllable Division: PASS.** kai answered through the one-syllable bar (bar
  blue on select, all gaps locked, green on confirm, score 1/1). A wrong answer
  on item 1 revealed `ἄγ-γε-λος` and auto-advanced in 3834-3977ms across runs;
  an immediate manual Next cancelled the pending timer with no skipped item
  (3 of 20 stayed 3 of 20 through the full timer window).
- **Accent Placement: PASS.** Item 1 shows `Βαπτίζω (to baptize)` under "Root
  Greek Word", the unaccented `βαπτισαι` in the numbered row with its breathing
  retained, `Acts 22:16` by the checkboxes, and exactly two accent buttons
  (Acute, Circumflex -- no Grave). Acute + position 2 scored correct and the
  chip and slot turned green. A wrong answer on item 2 finalized the item,
  revealed `ἐβαπτίσθημεν`, greened the correct slot, and disabled Check Answer.
- **Accent Rule / Marking Recognition / Part of Speech: PASS.** All three run
  the one-attempt flow (wrong pick finalizes, reveals, auto-advances at ~3.99s).
  Option grids carry the verified labels (7 rules, 10 marks, 8 parts of speech).
  The red mark renders on the marking items and the prompt stays a blue
  greek-say tap. The underline renders on the POS sentences. The Accent Rule
  reveal shows the gloss and `correctForm`.
- **Syllable Counting keeps retry: PASS.** A wrong answer leaves the item open
  and does not auto-advance.
- **Blue-guess / green-confirm on all five answer surfaces: PASS** by computed
  style (`rgb(22, 99, 199)` selected, `rgb(46, 125, 50)` confirmed): divide
  gaps, the one-syllable bar, accent-type chips, accent position slots, and
  static-drill option tiles. No red tile is reachable in the chapter-2 drills;
  red appears only on the incorrect feedback banner.
- **320px sweep on the new charts: PASS.** Accent Possibilities (both copies,
  see 9.4), the three syllable example charts, the Syllable Names matrix, the
  Review Marks rows, and the grammar-review expanders all render fully with no
  clipped row and `scrollWidth` 320.
- **Audio spot-checks: PASS** on a fresh profile, asserted both by the network
  request and by the resulting IndexedDB key: `chapt_2_a_voc10` from the
  2-Consonants chart row, `chapt_2_b_xauto` on the Apostrophe page,
  `chapt_2_b_mosesx` on the Μωϋσῆς marking item.
- **Offline preview regression: PASS.** Service worker in control, network
  emulated offline via CDP, then: direct refresh on an activity route rendered,
  chapter-2 rail reached 20 of 20 plus the end dialog with zero pending states,
  chapter-1 rail reached 26 of 26, zero console exceptions. (Offline was
  emulated at the CDP layer rather than by killing the preview server; the
  earlier 5B pass used a killed server, and no iOS/WebKit claim is made from
  either.)

Screenshots (320 x 844 CSS px, device scale 2):
[accent placement](screenshots/5B-patch/accent-placement.png),
[divide reveal](screenshots/5B-patch/divide-reveal.png),
[accent rule reveal](screenshots/5B-patch/accent-rule-reveal.png),
[marking red mark](screenshots/5B-patch/marking-red-mark.png),
[Accent Possibilities chart](screenshots/5B-patch/accent-possibilities-chart.png),
[grammar underline](screenshots/5B-patch/grammar-underline.png).

### 9.4 Deviations, surprises, and pipeline feedback for 5C

1. **Red mark: the sanctioned fallback was needed (2e).** Per-mark coloring was
   implemented first and is WRONG on screen even though the DOM is right.
   Splitting a cluster into `<span>υ</span><span style="color:red">◌̈</span>`
   leaves the browser shaping across the inline boundary (the boxes differ only
   in color), so the mark glyph is painted with the BASE run's color: the
   computed style of the mark span read `rgb(192, 57, 43)` while the rendered
   dots were blue. Verified by screenshot, not by assumption. The shipped
   behavior is the spec's stated fallback -- **the whole target grapheme cluster
   renders red** (e.g. the `ϋ` of Μωϋσῆς, the `ὸ` of ἀδελφὸς). This also handles
   the items whose "mark" is a standalone cluster (`;`, `·`, `᾽`) uniformly.
2. **Accent Possibilities chart is duplicated in the data.** `learn[2]
   .topics[3].content[8]` and `[9]` are two byte-identical
   `expander` blocks both labelled "Chart: Accent Possibilities", so the chart
   renders twice, back to back, in the 6 Accent Rules topic. Not corrected
   locally per the data-ownership rule -- flagged for the pipeline.
3. **The Accent Possibilities chart needed a component change the spec did not
   enumerate.** Its rows are `{ label, syllables[], greek: "" }`, and the
   existing `greekRows` matrix test rejected any row with a `label`, so the
   chart fell into the word+gloss branch and dropped every cell -- it rendered
   as two bare legends with no content. `isSyllableMatrix` now allows row
   labels and renders the label in a trailing unheaded column, matching the
   original's layout. Worth knowing on the pipeline side: a `greekRows` block
   with `label` + `syllables` is a *matrix with a row legend*, not a word row.
4. **greekRows headers could overlap rather than clip.** "Antepenult
   Possibilities" x3 in a 4-column grid overflowed its cell and printed on top
   of the neighbor. Overflow assertions never caught it (the container's
   `scrollWidth` was fine; the child spans overflowed). Fixed with
   `overflow-wrap: break-word` plus a smaller matrix-header font. At 320px
   "POSSIBILITIES" still cannot fit a 64px column on one line, so it wraps
   mid-word; everything is legible and nothing is clipped, but a shorter
   authored header ("Antepenult" / "Penult" / "Ultima", with the word
   "Possibilities" in the chart title) would render better on a phone.
5. **Gloss reveal is an addition beyond the enumerated list.** 2a names
   `correctForm` / `answerForm` / divided form / option highlight as what gets
   revealed. The static-drill items also carry an unused `gloss`, and the
   original reveals it on the answered item (VERIFY D2/D3). It is now shown in
   the same reveal row. Flagging it because it was not in the enumeration; it
   uses authored data only and adds no copy.
6. **Nine of the twenty Accent Rule items AFFIRM their rule**, so
   `correctForm === greek` and the reveal repeats the prompt verbatim. That
   matches the original (VERIFY D2 shows πρῶτος / first / πρῶτος), so it was
   left alone; noting it because it reads like a bug in a screenshot.
7. **Accent Rule prompts have no audio.** All 20 items lack an `audio` field, so
   the prompt renders ink-colored and untappable and the drill's Pronounce
   button is disabled -- correct under the Greek-tap contract (no audio, no blue),
   but the drill's own `ui.buttons` lists "Pronounce" and the original clearly
   speaks these words. If the `b_*` clips for these forms exist, wiring them
   would restore that button.
8. **The drills' "Translate" and "Previous/Next" buttons are gone from the
   data.** The originals (VERIFY D2/D3) show Previous, Next, Pronounce,
   Translate, Hint, Score on the static drills; the delivered `ui.buttons` lists
   only Pronounce/Hint/Score (and Part of Speech has no `ui` at all). No
   per-item stepper was added to `SelectActivity` -- with 4s auto-advance it is
   not needed for the flow, but it means these drills cannot be stepped
   backwards. Worth a decision before 5C.
9. **The 21st Accent Placement clip (`b_ex2_21`) is unreferenced**, as the
   data's own note says. Nothing was wired to it.
10. **English grammar defLists render in the Greek serif font** (`.rc-term
    greek` / `.rc-val greek`, a chapter-1-era assumption) and their two-column
    grid is cramped at 320px for long terms like "Compound subject:". Legible
    and not clipped, so it was left alone as out of scope; a follow-up could
    make `defList` font/columns depend on whether the row is Greek.

### 9.5 Out-of-scope confirmation

No chapter 1 behavior, audio architecture, service-worker route, loader,
progress backend, or data file content was changed. No cache/store scan was
added to app load or route mount. The `{#key activityId}` remount boundary in
`ActivityHost` is intact.
