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
