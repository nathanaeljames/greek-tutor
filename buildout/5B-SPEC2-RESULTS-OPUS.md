# 5B-SPEC2-RESULTS-OPUS.md — chapter 2 device-feedback corrections (round 2)

Implementer: Claude Opus 5, in Claude Code, against the accepted 5B-patch tree
(HEAD `14dfc3e`). Inputs: `5B-SPEC2.md`, the already-committed replacement
`src/data/chapt-02.json`, `HANDOFF-5B-OPUS.md`, and `5B-feedback.pdf` (read page
by page; the JSON won every disagreement). No commit was created and nothing was
pushed. **Zero data-content edits** — `git status` shows nothing under
`src/data`.

## 1. Data commit (A1)

A1 was already satisfied when this pass began: the replacement `chapt-02.json`
landed in the user-authored commit `14dfc3e` ("saving before hopefully final 5b
round"), 529 lines changed. It was taken as authoritative and left byte
identical. Its updated `_comment` was read first, as instructed.

## 2. Changes per module

### `src/lib/greek.js` (+125)

- `SPACING_FOR_COMBINING`, `ISOLATED_MARKS`, `spacingForm()`, `spacingMarks()` —
  the combining/spacing bridge for base-less marks.
- `splitMarkRun()` — splits a base-less string into mark / non-mark runs so a
  chart cell reading `´ or ῀` can enlarge only its glyphs.
- `combiningForMarkName()` — maps a Marking Recognition option label to the
  combining codepoint it names, so the red overlay can pick ONE mark out of a
  multi-mark cluster.
- `firstAccentCluster()` — index + combining char of the first accent in NFD
  order (the Accent Rule drill's `redFirstAccent` contract).
- `markOverlayParts()` — replaces `markClusters()`. Returns render segments:
  plain runs, `{ base, overlay }` for the target cluster, and `{ text, red }`
  for the whole-cluster fallback.
- `markClusters()` was REMOVED (its only caller was `SelectActivity`).

### `src/lib/markup.js` (+31)

- `splitMarkGroups()` — splits an authored string on `"( x )"` groups. The
  pattern requires whitespace INSIDE both parens, so ordinary parentheticals
  (`(e.g. book)`, `(Present tense)`, `(Jn 1:15)`) can never match. Verified
  against every parenthesised string in both chapter files.

### `src/lib/content.js` (+18)

- `resolveHintBlocks(chapter, hint)` — lifted out of `DivideActivity` so the
  Syllable Counting drill's `hint.contentRef` resolves through the same path
  (C1). Behaviour unchanged for the divide exercise.

### `src/components/Marked.svelte`

- Now composes underline spans AND mark groups, so B1 lands at every authored
  string site at once (heading, para, numbered text/note, defList term and
  value, biblist entry, refs, note, expander label, greekRows label, greekRows
  title). Still plain text nodes — never `{@html}`.

### `src/components/RichContent.svelte` (+82)

- **Expander dedupe (B3)**: a repeat of an expander LABEL already seen in the
  same block array is dropped. The Accent Possibilities chart now renders once.
- **greekRows `title` (B5)**: rendered on its own line in the heading green with
  the rows hanging beneath it, label left / Greek right.
- **greekRows `parts[]` (C6)**: alternating `{greek, audio}` / `{text}` rows.
  Each Greek part is its own tap target with its own clip; text parts are inert
  ink.
- **Matrix cells (B2, B3)**: each chunk is a real `.rc-cell` with a column rule;
  cells route their content through `splitMarkRun` so mark glyphs enlarge.
- **Term-less defLists (C7)**: the accent hints ship entries with an empty
  `term`; those lists now render as hanging-indent lines instead of a
  two-column table with an empty first column.
- **biblist guard (B6)**: a non-string entry renders a visible shape error
  instead of `[object Object]`.

### `src/components/SelectActivity.svelte` (+131 / −45)

- **`ui.buttons` control block (C1, C4, and feedback 10/14)**: Previous / Next /
  Pronounce / Translate / Hint / Score, each shown only when the activity's
  `ui.buttons` lists it, laid out two-up (three-up ≥560px) like the original's
  button block. Chapter 1's two-button drills are untouched — none of them list
  Previous/Next/Translate.
- **Previous/Next stepper** with a `results` map: under `attemptsPerItem: 1` a
  finalized item stays finalized on revisit and cannot re-count attempts.
- **Translate** toggles a gloss line under the word.
- **Hint** resolves `hint.contentRef` as well as inline `hint.content`.
- **Pronounce Each** defaults from `ui.defaults.pronounceEach` and is no longer
  disabled when the current item lacks audio (feedback 6: "cannot be
  unselected").
- **Live score (C3)**: `scoreLine` is a REACTIVE statement. The old code called
  `scoreText()` from the template with no reactive dependency, which is exactly
  why the dialog showed "the score from 5 answers back". `ui.liveScore` opens
  the line by default; the Score button still toggles it.
- **`autoAdvanceOnIncorrect: false` (C4)**: a wrong answer is still final and
  still reveals, but no timer is scheduled — the learner clicks Next.
- **Red mark**: `redMarkCluster` and `redFirstAccent` both resolve through
  `markOverlayParts` (see §3).

### `src/components/DivideActivity.svelte` (+68 / −45)

- **New layout (C2)**: a numbered button ABOVE each gap with an SVG arrow
  pointing down between the two letters. Pressed = blue button and blue arrow;
  confirmed-correct = green. Red stays on the feedback banner only.
- **Measured, breakpoint-static sizing (C2)**: an off-screen probe renders the
  pool's LONGEST word (`φαρισαῖος`) at 100px; the live row is scaled from that
  measured width, so the longest word exactly fills the rail and every other
  word renders at the same size. Letters cap at 76px so tablet widths stop
  growing. Re-measures per breakpoint, never per word.
- Live score (reactive), `ui.defaults.pronounceEach` honoured, hint resolver
  moved to `content.js`, controls in the grouped block.

### `src/components/PlaceAccentActivity.svelte` (+30 / −14)

- **Extended practice (C7)**: `extendedItems` append after item 20 behind a
  labelled divider ("Extended practice — not in the original"). Same
  interaction, same score line; **completion requires only the original 20**
  (`baseWords.every(...)`).
- Live score (reactive), `ui.defaults.pronounceEach` honoured, "Pronounce Word"
  named as in the original and playing the current item's clip (V3), controls in
  the grouped block, count reads "21 of 25 (20 in the original)".

### `src/app.css` (+164 / −22)

New: `--accent-ink` (non-tappable emphasis green) and `--mark-red` (#e00000).
`.mark-group` / `.isolated-mark`, the `.rm-cluster` / `.rm-mark` overlay, the
matrix table rules, `.rc-greektitle`, `.rc-parts`, `.rc-deflist.termless`,
`.controls.grouped`, `.live-score`, `.extended-divider`, `.gloss-line`, and the
rebuilt divide rail. Explicit `color` on `.rc-defrow` and `.rc-example` (§4).

### `scripts/check-content-shapes.mjs` (new) + `package.json`

`npm run verify` now runs `check:shapes` first. It walks every nested block
array in every `chapt-*.json` and fails the build on a non-string biblist entry
or a greekRows row with no `greek` / `syllables` / `parts`. Verified by
mutating a COPY of the chapter into the old object-form bibliography:

```
FAIL: chapt-02.json.learn[6].content[1].items[1]: biblist entry is object, expected a string.
exit=1
```

## 3. The red mark, settled (C5, V1)

The overlay technique works. The cluster renders as its base with the mark
REMOVED, and the mark is laid over it as a free-standing spacing glyph in
`--mark-red`. There is no inline boundary, so there is nothing for the browser
to shape across — the failure the 5B patch documented does not arise.

Two details that were measured rather than guessed:

1. **Font.** The overlay uses the speller-keyboard font path (system sans), not
   the body Greek serif. A probe of nine fonts (`fontprobe.png`) shows
   `'Times New Roman'`, Palatino, Menlo and Lucida all draw U+1FC0 as a **tilde**;
   system, Georgia, Helvetica and Gentium draw the **rounded perispomeni**.
2. **Vertical offset.** A spacing mark is drawn for the tallest base it may sit
   on, so over a lowercase vowel it lands high. Rendering the overlay against
   the precomposed glyph at six offsets (`overlay.png`) put the match at
   `translateY(0.08em)`, which is what shipped.

Coverage, computed over the real pools:

- **Accent Rule (`redFirstAccent`): 20 / 20 mark-only overlay.**
- **Marking Recognition: 18 / 25 mark-only overlay.** The other seven:
  - Six are correct BY DESIGN — the target cluster IS the mark, so there is
    nothing to separate and it reddens whole: `δι᾽ αὐτοῦ`, `παρ᾽ αὐτῷ`
    (Apostrophe), `λόγος·`, `ἐγώ·` (Colon), `λόγος;`, `ἀμήν;` (Question).
  - One is a **data off-by-one, not a rendering fallback** — see §5.1.
    (XPATCH1 §10.2 changed this case: that cluster now renders PLAIN rather
    than reddening a bare alpha. The tally is now 18 overlay / 6 whole-cluster /
    1 plain.)

Multi-mark clusters resolve correctly because the item's own answer label picks
the mark: `Ἠσαΐας` / `Ἀχαΐα` (ΐ = diaeresis + acute) redden only the diaeresis
and keep the acute in ink; `τοὔνομα` (ὔ = coronis + acute) reddens only the
coronis.

## 4. The blue sweep (B4), and how it was actually tested

The root cause was not our CSS. `.rc-defrow` is a `<button>` (so a row WITH
audio can be tapped), and **WebKit paints unstyled button text in its own system
blue** — which is why every Grammar Review term, "Potential Placement:" and
"Simple subject:" read blue on the iPhone while Chrome showed them black. A
Chrome computed-style sweep would never have caught it.

The fix is explicit colour: `.rc-defrow` → ink, `.rc-term` → `--accent-ink`
green, `.rc-example` → ink.

To make the sweep meaningful, the harness injects
`button { color: #007aff; }` as the FIRST author stylesheet before checking.
UA-level styles lose to any author rule, so anything still blue under that sheet
has no author colour of its own — precisely the set that reads blue on device.
Under that probe:

- Chapter-2 rail walk at 320px and 768px: **no non-tappable blue on any of the
  20 items.**
- Deep sweep (every topic of all four `topicPages`, every expander forced open,
  drill hints opened, all 20 activity routes = 33 surface states): **no
  non-tappable blue, no clipped element, no horizontal overflow.**
- Chapter-1 rail walk at 320px under the same probe: clean.

Option TILES still take the UA blue on iOS (they have no author colour). They
are tap targets, so this satisfies directive 8 as written ("blue is exclusively
tappable"); making them explicitly blue or explicitly ink would change chapter 1
too, so it was left alone and is flagged below.

## 5. Deviations, surprises, and data findings

### 5.1 One genuine data bug (VERIFY2)

`c2_drill_marking_recognition` item `φαρισαῖος` carries `redMarkCluster: 6`, but
cluster 6 is a bare `α`; the circumflex is on cluster **7** (`ῖ`). The item's
answer is "Circumflex". Every other item's index checks out exactly. Not
corrected locally per the data-ownership rule. **Superseded in part by XPATCH1
§10.2**: the renderer no longer reddens a mark-less cluster, so the item now
shows no red at all instead of reddening a bare alpha. The data fix is still
owed.

### 5.2 The Syllable Names chart was a CSS cascade bug, not a detection bug

B2 assumed the positional-matrix DETECTION was rejecting rows with an empty
leading chunk. It is not: `isSyllableMatrix` already accepted them (verified in
node against the shipped data). The real cause is that a tappable matrix row is
a `<button class="rc-syllable-row greek greek-say">`, and `.greek-say` — same
specificity, later in `app.css` — was winning `display`, `text-align` and
`padding`. The row collapsed from `grid` to `block` and the chunks ran together
as one plain-looking word. Fixed by raising the specificity
(`.rc-greekrows .rc-syllable-row.greek-say`). Worth knowing on the spec side:
the empty-chunk case never needed a data-shape change.

### 5.3 The Accent Possibilities chart cannot be four columns at 320px

Three long headers plus a legend column inside 256px leaves ~64px each, which
breaks both "Possibilities" and "Short Ultima" mid-word. Shipped compromise: on
phone widths the row LEGEND captions its row (full width, above it) and the
three data columns take the space; at ≥560px the original's four-column form
with the legend on the right returns. Both are in the screenshots. No data was
dropped or reworded at either width.

### 5.4 Two chart cells still carry COMBINING marks in the data

`learn[2].topics[3]` Accent Possibilities, "Long Ultima" → Ultima cell is
`"́ or ῀ or ̀"` — spacing circumflex but COMBINING acute and
grave. Base-less combining marks are near-invisible. The renderer normalises
combining → spacing at display time (`spacingMarks`), which is a rendering
correction, not a data edit; the file is untouched. Worth fixing in the pipeline
so the data matches its own `_comment`.

### 5.5 The in-word circumflex is still a tilde — spec-scoped out, evidence attached

Feedback 4 asks to "fix all instances of circumflex in this chapter". B1 scopes
the remedy to the isolated-mark spans ("route these isolated-mark spans through
the tile font"), and that is what shipped. But the cause of the in-WORD tilde is
the same font fact: `.greek` is `'Times New Roman', 'SBL Greek', Georgia, serif`,
and Times draws the combining perispomeni as a tilde. `fontprobe2.png` shows
`αὐτοῦ φαρισαῖος πρῶτος ἦλθεν ῥῆμα ἐκεῖνος` in seven fonts: Times and Palatino
give tildes; **Georgia, system, Baskerville, Didot and Hoefler give the rounded
arch.** Georgia is already the third fallback in the stack and ships on iOS.

The one-line change is reordering that stack:

```css
.greek { font-family: Georgia, 'SBL Greek', 'Times New Roman', serif; }
```

It was NOT made, because it changes the Greek face on every page of the app,
including device-verified chapter 1, and D puts chapter 1 out of scope. This is
Nathanael's call and belongs in VERIFY2.

### 5.6 Smaller notes

- The counting drill's Translate needs `gloss`; every item resolves one through
  its lexicon ref, so the button is live on all 20.
- `.rc-deflist.termless` values were dropped out of the Greek serif — every
  term-less list in either chapter is English (checked). The TWO-column grammar
  defLists still render English in the Greek serif (the chapter-1-era
  `.rc-term greek` / `.rc-val greek` assumption the previous handoff flagged);
  colour is fixed, font deliberately left alone as out of scope.
- The Pronounce-each checkbox moved out of the `.controls` row into its own
  `.exercise-checks` row. On chapter 1 at 320px it already wrapped to its own
  line, so this is visually equivalent there.
- `markClusters()` is gone; nothing else imported it.

## 6. Acceptance checklist

- [x] **`npm run verify` passes; chapt-01 chunk hash unchanged.** Build clean,
      no warnings. `chapt-01-8ZoFoXk9.js` UNCHANGED across every build in this
      pass. `chapt-02-BcvbUMpi.js` + `lexicon-chapt02-Dca-1p1v.js` re-emitted,
      precached, absent from `index-CnU9EByY.js`. Precache count 19, unchanged.
      `check:shapes` PASS.
- [x] **Full ch2 rail walk (20 items) + ch1 regression walk, 0 console errors, at
      320px AND a tablet width.** ch2 20/20 + end-of-chapter dialog at both 320px
      and 768px; ch1 26/26 + end dialog at 320px. Zero pending placeholders,
      `scrollWidth` == viewport on every item, zero console errors or page
      exceptions. Repeated against the PRODUCTION preview build (service worker
      in control): ch2 20/20, ch1 26/26, clean.
- [x] **Bibliography renders five entries.** Five hanging-indent entries, no
      `[object Object]`; build guard added.
- [x] **Isolated marks: smooth breathing visibly distinct from acute; circumflex
      rounded; enlarged; no paren wrap at 320px.** See
      `isolated-marks-3-accents.png` and `review-marks.png`. `( ; )` no longer
      strands its closing paren (feedback 8).
- [x] **Syllable Names chart: three aligned columns, words tappable.** One tap
      target spanning the row, blue, plays the row audio; kosmos' empty
      antepenult holds its column open.
- [x] **Accent Possibilities chart: rendered once, legible at 320px.** Dedupe
      asserted in the harness (1 expander with that label after clicking all of
      them); see §5.3 for the narrow-width layout.
- [x] **Counting drill: no one-syllable bar; kai=1 accepted; Translate toggles
      gloss; live score updates.** Asserted: bar absent; `καί` found in the pool
      and answered with tile "1" → "1 correct out of 1 attempts (100%)", feedback
      `ok`; Translate shows and hides the gloss line; Hint opens the Three
      Syllable Rules via `contentRef`.
- [x] **Division exercise: arrows between letters; blue pressed / green
      confirmed; longest word fills width at 320px with no clipping;
      pronounce-each defaults ON.** Pressed `.gap-num` computes
      `rgb(22, 99, 199)`, confirmed `rgb(46, 125, 50)`. `φαρισαῖος` measures
      260px in a 260px rail, `scrollWidth` 320.
- [x] **Accent rule drill: word audio taps; first accent red; wrong answer waits
      for Next; correct auto-advances ~4s.** Prompt is an enabled `greek-say`
      button; `.rm-mark` computes `rgb(224, 0, 0)` while `.rm-base` does not;
      after a wrong answer the item index was unchanged 5.2s later and the
      correct form was revealed, and Next moved on; a correct answer advanced in
      **4026 ms**.
- [x] **Marking recognition: mark-only red in bright --mark-red (or documented
      per-cluster fallback list); buttons restored.** 18/25 mark-only, the
      remaining seven itemised in §3. Previous / Next / Translate present.
- [x] **Accent placement: hint layout; extended divider + 5 items; completion at
      20.** Hint header green on its own line with hanging-indent entries;
      divider appears at item 21; count reads "21 of 25 (20 in the original)";
      `markCompleted` fires on the original twenty only.
- [x] **Blue sweep: computed-style check finds no non-tappable blue text anywhere
      in chapter 2.** Under the WebKit-blue probe described in §4, across 33
      surface states.
- [x] **Zero data-content edits.** `git status` lists no path under `src/data`.

## 7. VERIFY2 candidates (device pass)

1. **The red overlay on device fonts.** Chrome/macOS was the only renderer here.
   The offset (`0.08em`) and the horizontal centring were tuned against
   macOS system-font metrics; iOS may want a different nudge.
2. **The circumflex glyph on iOS** — both the isolated marks (now system font,
   should be the arch) and the in-word case (§5.5, still Times, still a tilde).
   Decide whether to reorder the `.greek` stack to Georgia.
3. **Extended items keep/drop** — five circumflex-bearing items after item 20.
4. **`φαρισαῖος` redMarkCluster off-by-one** (§5.1) — data fix for the pipeline.
5. **The Accent Possibilities chart at phone width** (§5.3) — is the captioned
   legend acceptable, or would shorter authored headers ("Antepenult" /
   "Penult" / "Ultima") let the four-column form survive at 320px?
6. **Option tiles read UA-blue on iOS** (§4) — intentional, or should the drill
   tiles carry an explicit colour (which changes chapter 1 too)?
7. **English grammar defLists in the Greek serif** (§5.6) — cosmetic, chapter-2
   only, one line if wanted.
8. **V2-1 — overlay offset on iOS.** The red mark overlay uses ONE measured
   offset (`translateY(0.08em)`, horizontally centred) tuned on macOS Chrome.
   The parallel Sol run used five per-mark-family offsets instead (breathings
   and coronis pulled left to 31%, circumflex reduced to 0.76em). If the marks
   look off-centre on the iPhone, the per-family approach is the fallback to
   try — capture a photo of a breathing item (`ῥῆμα`, `υἱός`) and a circumflex
   item (`αὐτοῦ`) so the direction of the error is legible.
9. **V2-2 — `φαρισαῖος` renders with no red at all** after XPATCH1 (§10.2).
   Confirm that reads acceptably as a temporary state, or prioritise the data
   fix.

## 8. Screenshots

All 320px CSS-width captures at device scale 2, `buildout/screenshots/5B-spec2/`:

[syllable names chart](screenshots/5B-spec2/syllable-names-chart.png),
[isolated marks (3 Accents)](screenshots/5B-spec2/isolated-marks-3-accents.png),
[accent possibilities chart](screenshots/5B-spec2/accent-possibilities-chart.png),
[review marks](screenshots/5B-spec2/review-marks.png),
[bibliography](screenshots/5B-spec2/bibliography.png),
[apostrophe multi-part row](screenshots/5B-spec2/apostrophe-parts.png),
[counting drill](screenshots/5B-spec2/counting-drill.png),
[divide, longest word + pressed gap](screenshots/5B-spec2/divide-longest-word.png),
[marking recognition red mark](screenshots/5B-spec2/marking-red-mark.png),
[accent rule red first accent](screenshots/5B-spec2/accent-rule-red-first.png),
[accent placement extended practice](screenshots/5B-spec2/accent-placement-extended.png),
[grammar review terms in green](screenshots/5B-spec2/grammar-review-verbs.png).

## 9. Out-of-scope confirmation

No chapter 1 behaviour or data, no chapters 3+, no audio architecture, service
worker, loader, or progress backend was changed. No cache/store scan was added
to app load or route mount. The `{#key activityId}` remount boundary in
`ActivityHost` is intact. No emoji anywhere.

## 10. XPATCH1 (cross-patch from the parallel Sol run)

Executed against the accepted Opus 5B-SPEC2 tree per `5B-XPATCH1.md`. Two code
items, two verification gaps. `markOverlayParts()`'s overlay technique,
`check-content-shapes.mjs`, the injected-stylesheet blue probe, the measured
divide sizing and the expander dedupe all stand as shipped; nothing else in the
base changed. No data edits, no commit, nothing pushed.

1. **Non-audio defList rows are now static elements.** Rows without audio render
   as `<div class="rc-defrow static">` rather than an inert `<button>`, removing
   the WebKit unstyled-button blue vector at its source and fixing the semantics
   (no phantom controls in the tab order or the accessibility tree). The
   explicit colour rules from the base are retained, plus
   `.rc-defrow.static { color: var(--ink); cursor: default; }`. Both defList
   render sites were changed (the `numbered` item's nested list and the
   top-level block), and the audio branch now keys off `row[2]` directly.

   Asserted in the browser: Identifying Verbs renders its terms
   (`Tense:`, `Aspect:`, `Voice:`, `Mood:`, plus `Person:`/`Number:` and the
   expander sub-lists); **every `.rc-defrow` in the topic is a `DIV`**
   (`["DIV.rc-defrow static","DIV.rc-defrow static no-term"]`);
   `.rc-defrow.static button` is empty; and there are **0 focusable elements
   inside `.rich`**, so tab order no longer stops on the term rows. Chapter 1's
   Six Points is unaffected — of its 10 rows, 5 are still audio-bearing
   `<button>`s and 5 are letters-rows. Under the injected
   `button { color: #007aff }` probe the deep sweep (33 surface states) still
   reports no non-tappable blue, no clipping, no overflow.

2. **A mark-less target cluster is no longer reddened.** `markOverlayParts()`
   now emits a plain run when the authored `redMarkCluster` points at a cluster
   with no combining mark; the whole-cluster red fires only when the cluster has
   no base letter, i.e. when the cluster IS the mark.

   Over the real Marking Recognition pool: **18 overlay, 6 whole-cluster, 1
   plain, 0 red on a mark-less cluster.** `φαρισαῖος` renders with zero red
   spans in the prompt (asserted in the DOM and captured in
   `xpatch-marking-pharisaios.png`). The six punctuation items still redden
   whole: `δι᾽ αὐτοῦ` / `παρ᾽ αὐτῷ` (`᾽`), `λόγος·` / `ἐγώ·` (`·`), `λόγος;` /
   `ἀμήν;` (`;`). The multi-mark clusters are untouched: `Ἠσαΐας` and `Ἀχαΐα`
   render base `ί` + red `¨`, `τοὔνομα` renders base `ύ` + red `᾿`. Accent Rule
   `redFirstAccent` stays 20/20 overlay.

3. **Offline preview regression run** (directive 4 — genuinely missing from the
   original pass; the earlier "production preview" walk was service-worker
   controlled but ONLINE, which is a different claim, and this document should
   not have implied otherwise).

   Built preview on `:4173`, service worker confirmed in control
   (`navigator.serviceWorker.controller.scriptURL === http://localhost:4173/sw.js`),
   both chapter hubs visited to warm their chunks, then the network cut with
   `Network.emulateNetworkConditions({ offline: true })` — `navigator.onLine`
   confirmed `false` before any assertion.

   - **Offline hard refresh on an activity route: PASS.** `#/activity/chapt_2/
     c2_learn_syllables` reloaded and rendered under SW control, 0 pending.
   - **Offline chapter-2 rail: PASS.** 20/20 plus the end-of-chapter dialog,
     0 pending placeholders, `scrollWidth` 320 on every item.
   - **Offline chapter-1 rail: PASS.** 26/26 plus its end dialog, same.
   - **Console accounting: 0 unexpected JS exceptions, 0 `console.error` calls.**
     11 network `loadingFailed` events, all of them
     `net::ERR_INTERNET_DISCONNECTED` on `/audio/*.m4a`
     (`b_voc6`, `b_voc5`, `b_diauto`, `b_voc4`, `b_voc2`, `a_upsiln`, `a_psin`,
     `a_omegan`, `a_xin`, `a_voc5`, `a_voc2`). These are the pronounce-each
     surfaces hitting `play()`'s IDB-miss path: no audio pack was downloaded in
     this run, so every attempt misses IDB, issues the single hard-timeout fetch
     `audio.js` is designed to issue, catches the failure and falls through to
     the toast. Pre-existing frozen-architecture behaviour, same count and same
     character the Sol run reported. No audio code was touched.

4. **Chapter-1 regression at 768px** (spec E asked for both widths; the base ran
   chapter 1 at 320px only, and this round changed shared components).
   **PASS — 26/26 plus the end dialog**, `scrollWidth` 768 on every item, 0
   pending placeholders, zero console errors, and no non-tappable blue under the
   injected-stylesheet probe.

**Post-patch build:** `npm run verify` PASS — shapes check clean, build clean,
`chapt-01-8ZoFoXk9.js` hash **unchanged**, `chapt-02-BcvbUMpi.js` and
`lexicon-chapt02-Dca-1p1v.js` re-emitted, precached and absent from the main
bundle, precache count 19.

Screenshots added:
[φαρισαῖος with no red](screenshots/5B-spec2/xpatch-marking-pharisaios.png),
[grammar review static rows](screenshots/5B-spec2/xpatch-grammar-static-rows.png).

5. **Extended accent-placement items no longer print their own answer.**
   Follow-up found while confirming the five circumflex items are usable for
   testing: on every extended item `root === answerForm`, so the "Root Greek
   Word" header rendered the fully accented word (`πρῶτος`, circumflex visible)
   directly above the unaccented slots the learner must place the accent on --
   the header gave away both the accent type and its position. The original
   twenty never do this (`Βαπτίζω` -> `βάπτισαι`, different words).
   `PlaceAccentActivity` now suppresses the root word when it is identical to
   the answer form and shows the gloss alone under a "Word Meaning" label. No
   data change.

   Verified: all five extended items solve correctly (Circumflex + the expected
   slot -> 5 correct out of 5 attempts, 100%), each header reads "Word Meaning"
   with zero `.accent-root-word` spans, and each reveals its answer form after
   checking. Item 1 of the original pool is unchanged: "Root Greek Word",
   `Βαπτίζω`, `(to baptize)`, slots `βαπτισαι`. Audio for all five is in the
   manifest and on disk (`b_ac3`, `b_ac2`, `b_rema`, `b_voc10`, `b_autou`).
   Chapter-2 rail re-walked 20/20 + end dialog, zero console errors, no
   non-tappable blue; `npm run verify` PASS with `chapt-01-8ZoFoXk9.js` still
   unchanged. Screenshot:
   [extended item without the root leak](screenshots/5B-spec2/xpatch-extended-no-root-leak.png).

Ported from Sol; the base's overlay technique, build guard, blue probe, divide
sizing and expander dedupe are unchanged. Sol's per-mark-family overlay offsets
were deliberately NOT ported (out of scope per XPATCH1 §5; they go to VERIFY2 as
V2-1), the `.greek` font stack was not reordered, and `src/data` was not touched.
