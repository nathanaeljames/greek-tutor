# 5B-SPEC2-BUILD-OPUS.md — execution record

Implementer: Claude Opus 5 (Claude Code). Base: `14dfc3e`. Companion document:
`5B-SPEC2-RESULTS-OPUS.md`.

## (c) Wall-clock time

**Approximately 1 hour 5 minutes**, 2026-07-26 ~01:57 to 03:02 local, single
continuous session. Rough split: ~25 min reading (spec, ONBOARD-SOL,
HANDOFF-5B-OPUS, the shipped components, the chapter-2 data, and all 23 pages of
`5B-feedback.pdf`), ~20 min implementation, ~20 min browser verification and
visual iteration on the two charts and the mark overlay.

## (b) Thought process and tool usage log

### 1. Orientation

- Read `buildout/5B-SPEC2.md`, then `AGENTS.md` -> `buildout/ONBOARD-SOL.md` in
  full (project law: one spec at a time, no data edits, no emoji, no dead-end
  Next, blue = tappable, 320px overflow CLIPS).
- Read `HANDOFF-5B-OPUS.md` for what the previous pass had already settled --
  in particular its finding that inline combining-mark colouring fails, which
  5B-SPEC2 C5 overrides with the overlay technique.
- `git log` / `git status`: the tree was clean and the replacement
  `chapt-02.json` was ALREADY committed in `14dfc3e`, so item A1 needed no
  action. Confirmed by reading its `_comment`, as the spec instructs.
- Dumped the chapter-2 structure with python/node one-liners: activity list,
  sequence, every drill and exercise record, the four `topicPages` trees, the
  Review Marks `title` groups, the `parts[]` rows, the bibliography, and the
  codepoints actually used for every isolated mark (spacing vs combining, old
  file vs new).

### 2. Reading the feedback PDF

`Read` cannot rasterise PDFs without poppler, and the machine has no
`pdftotext`. Compiled a 25-line Swift utility against Quartz
(`pdf2png.swift`) to render all 23 pages to PNG, then read every page. This was
worth the five minutes: several items only make sense visually.

Things that changed my plan because of the screenshots:

- Page 1 showed the Syllable Names chart rendering as a plain link, which the
  code said should be impossible -- that sent me looking for the cascade bug
  (RESULTS 5.2) instead of the data-detection fix the spec assumed.
- Page 15 showed "Potential Placement:" and "Simple subject:" in blue on iOS
  while the same build is black in Chrome -- that identified WebKit's unstyled
  `<button>` colour as the real cause of item 11, and shaped how the blue sweep
  had to be tested (RESULTS 4).
- Page 4 showed the original's numbered buttons ABOVE the letters with arrows
  pointing into each gap, which is what C2 was rebuilt to.

### 3. Implementation order

lib primitives (`greek.js`, `markup.js`, `content.js`) -> `Marked.svelte` (so
B1 lands everywhere at once) -> `RichContent.svelte` -> `app.css` ->
`SelectActivity` -> `DivideActivity` -> `PlaceAccentActivity` -> the build
guard. `npm run verify` after the first block to keep the build honest.

### 4. Browser harness

No playwright in the tree, but `chrome-remote-interface` is a dependency and
Chrome is installed. Launching headless Chrome took three attempts: the first
two backgrounded instances died on a stale `SingletonLock` in the profile dir;
a fresh `--user-data-dir` worked. Attached with a `type === 'page'` target
filter (the default target was the extension background page).

Four scripts, all in the session scratchpad:

- `shot.mjs` — navigate + optional DOM steps + full-page screenshot +
  scrollWidth, iPhone UA, deviceScaleFactor 2.
- `walk.mjs` — full sequential-rail walk with per-item pending count,
  scrollWidth, and the blue sweep; asserts the end-of-chapter dialog and no
  dead-end Next.
- `deep.mjs` — every activity route, every topic of every `topicPages`, every
  expander forced open, plus a clipping check.
- `behave.mjs` — the interaction acceptance items.

Two harness gotchas worth recording for the next implementer:

1. `Page.navigate` to a URL that differs only in its hash is a SAME-DOCUMENT
   navigation, so `Page.loadEventFired()` never resolves and the script hangs
   (it did, for three minutes, before I diagnosed it). Every navigation now goes
   via `about:blank` first.
2. Clicking N times inside ONE `Runtime.evaluate` expression and reading the DOM
   at the end reads the PRE-update DOM: Svelte flushes in a microtask after the
   handler returns. Two early "failures" (the kai lookup, the pressed-gap
   colour) were this, not the app. Rewrote those probes as async IIFEs that
   await between clicks.

### 5. Visual iteration (the part that took the longest)

- **Isolated marks.** Built `fontprobe.html`: nine font stacks x nine mark
  codepoints. Result was decisive — Times/Palatino/Menlo/Lucida draw U+1FC0 as a
  tilde; system/Georgia/Helvetica/Gentium draw the rounded perispomeni. That
  settled B1's "route these through the tile font" clause (the speller tiles are
  in the system stack) AND produced the in-word finding in RESULTS 5.5.
- **Red overlay.** Built `overlay.html`: nine base+mark pairs, the precomposed
  glyph next to my overlay, at six vertical offsets. First pass used the Greek
  serif for the overlay and the circumflex came out a tilde; second pass used
  the system stack and the arch appeared. Read the offset off the grid: 0.08em.
- **Accent Possibilities chart.** Three iterations at 320px. Four columns with
  nowrap cells overflowed the card; four columns with wrapping cells broke
  "Possibilities" and "Ultima" mid-word; the shipped answer captions the row
  legend at phone width and restores the original four-column form at >=560px.

### 6. Verification actually run

- `npm run verify` (shapes + build + lazy-chunk guard) — clean, chapt-01 hash
  unchanged, precache 19.
- Build guard proved by mutating a COPY of the chapter into the old object-form
  bibliography: fails with the exact block path, exit 1.
- `markOverlayParts` computed over the real pools in node: 20/20 accent-rule,
  18/25 marking (the seven itemised in RESULTS 3, one of which is a data bug).
- Rail walks: ch2 @320 and @768, ch1 @320, all under the WebKit-blue probe;
  then both chapters again against the production preview build.
- Deep sweep: 33 surface states, no blue / clipping / overflow / errors.
- `behave.mjs`: 23 behavioural assertions (the two false failures above were
  re-run correctly in `kai.mjs`).

### 7. Judgement calls I want on the record

- **Did not** reorder the `.greek` font stack (RESULTS 5.5) even though feedback
  4 says "fix all instances of circumflex". B1 explicitly anticipated the body
  font mapping U+1FC0 to a tilde and prescribed a remedy scoped to the
  isolated-mark spans; reordering the stack changes the Greek face on every page
  of the app including verified chapter 1, which D puts out of scope. Evidence
  and the one-line change are in RESULTS for Nathanael to decide.
- **Did not** touch the `φαρισαῖος` `redMarkCluster` off-by-one — data ownership.
- **Did** normalise base-less combining marks to their spacing twins at render
  time (RESULTS 5.4). That is a rendering correction for two chart cells whose
  data still carries combining marks; the file is untouched.
- **Did** drop the Greek serif from term-less defList values only, after checking
  that every term-less list in both chapters is English.

## (a) Exact git diff of this execution

`git status` at the end of the pass:

```
 M package.json
 M src/app.css
 M src/components/DivideActivity.svelte
 M src/components/Marked.svelte
 M src/components/PlaceAccentActivity.svelte
 M src/components/RichContent.svelte
 M src/components/SelectActivity.svelte
 M src/lib/content.js
 M src/lib/greek.js
 M src/lib/markup.js
?? buildout/screenshots/5B-spec2/
?? scripts/check-content-shapes.mjs
```

```
 package.json                              |   3 +-
 src/app.css                               | 164 ++++++++++++++++++++++++++----
 src/components/DivideActivity.svelte      | 113 ++++++++++++--------
 src/components/Marked.svelte              |  23 ++++-
 src/components/PlaceAccentActivity.svelte |  44 +++++---
 src/components/RichContent.svelte         |  82 ++++++++++++---
 src/components/SelectActivity.svelte      | 131 ++++++++++++++++++------
 src/lib/content.js                        |  18 ++++
 src/lib/greek.js                          | 125 +++++++++++++++++++++--
 src/lib/markup.js                         |  31 ++++++
 10 files changed, 601 insertions(+), 133 deletions(-)
```

Nothing under `src/data` appears in either list.

```diff
diff --git a/package.json b/package.json
index 9600e56..5036851 100644
--- a/package.json
+++ b/package.json
@@ -9,7 +9,8 @@
     "build": "vite build",
     "preview": "vite preview",
     "check:lazy-chunk": "node scripts/check-lazy-chunk.mjs",
-    "verify": "npm run build && npm run check:lazy-chunk"
+    "check:shapes": "node scripts/check-content-shapes.mjs",
+    "verify": "npm run check:shapes && npm run build && npm run check:lazy-chunk"
   },
   "dependencies": {
     "idb": "^7.1.1"
diff --git a/src/app.css b/src/app.css
index c05a116..ef87994 100644
--- a/src/app.css
+++ b/src/app.css
@@ -9,6 +9,12 @@
   --ok: #2e7d32;
   --bad: #b3402e;
   --link: #1663c7;      /* blue = tappable (A6); reserved for tappable Greek/text */
+  /* Non-tappable EMPHASIS (definition terms, chart legends, group titles).
+     Blue means tappable and nothing else (directive 8), so emphasis that is
+     not a tap target reads in the heading green instead (5B-SPEC2 B4). */
+  --accent-ink: #1f5f57;
+  /* The mark being asked about, drawn as bright as the original's (C5). */
+  --mark-red: #e00000;
   --radius: 14px;
 }
 * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
@@ -16,6 +22,16 @@ html, body { margin: 0; padding: 0; background: var(--parchment); color: var(--i
   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
 .greek { font-family: 'Times New Roman', 'SBL Greek', Georgia, serif; }
 button { font: inherit; cursor: pointer; }
+/* ---- Isolated marks shown outside a word (5B-SPEC2 B1) ----
+   "Acute ( ´ )" must never break across lines, and the mark itself is drawn
+   large: the original deliberately enlarges these glyphs and at body size a
+   breathing is indistinguishable from an acute. The mark keeps the speller
+   keyboard's font stack (.tk-key.mark) -- the one surface confirmed on device
+   to draw U+1FC0 as the rounded perispomeni rather than a tilde. */
+.mark-group { white-space: nowrap; }
+.isolated-mark.as-mark { display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
+  font-size: 1.45em; line-height: 1; padding: 0 0.06em; vertical-align: -0.08em; }
+.isolated-mark.greek { font-family: 'Times New Roman', 'SBL Greek', Georgia, serif; font-size: 1.15em; }
 /* ---- App shell: fixed top bar, scrolling middle, fixed bottom bar ---- */
 .app { display: flex; flex-direction: column; height: 100vh; height: 100dvh; overflow: hidden; }
 .app-main { flex: 1; min-height: 0; display: flex; }
@@ -61,11 +77,26 @@ button { font: inherit; cursor: pointer; }
 .tile.selected.correct { border-color: var(--ok); background: #e6f2e6; }
 .prompt { font-size: 3rem; text-align: center; padding: 18px; }
 .prompt.select-sentence { font-size: 1.25rem; line-height: 1.5; }
-/* 2e: Marking Recognition asks about ONE mark, drawn red inside the word.
-   The word itself stays a blue greek-say tap (directive 9); the marked
-   grapheme cluster's own color rule beats the inherited link blue. */
+/* Marking Recognition / Accent Rule ask about ONE mark, drawn red inside the
+   word. The word itself stays a blue greek-say tap (directive 9).
+   C5: colouring an inline combining-mark span does not work -- the browser
+   shapes across the boundary and paints the mark with the BASE run's colour.
+   The cluster is therefore rendered WITHOUT its mark and the mark is laid over
+   it as a free-standing spacing glyph, which shapes independently. The spacing
+   glyph is designed to sit at accent height on its own baseline, so aligning
+   the two baselines puts it where the combining mark would have been. */
 .prompt.red-mark { font-size: 2.5rem; }
-.mark-red { color: var(--accent); }
+.mark-red { color: var(--mark-red); }
+.rm-cluster { position: relative; display: inline-block; }
+.rm-base { color: inherit; }
+/* Same font path as the isolated marks (the body Greek serif draws U+1FC0 as a
+   TILDE), and nudged down: a spacing mark is drawn for the tallest base it may
+   sit on, so over a lowercase vowel it lands ~0.08em high. Measured against
+   the precomposed glyphs, not guessed. */
+.rm-mark { position: absolute; left: 0; right: 0; bottom: 0; text-align: center;
+  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
+  line-height: 1.15; transform: translateY(0.08em);
+  color: var(--mark-red); pointer-events: none; }
 /* Revealed after a one-attempt item is finalized: the gloss and, for the
    Accent Rule drill, the properly accented form. */
 .reveal-row { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: center;
@@ -76,6 +107,23 @@ button { font: inherit; cursor: pointer; }
 .feedback.ok { color: var(--ok); }
 .feedback.bad { color: var(--bad); }
 .controls { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 12px; }
+/* The original stacks a drill's six controls in a compact two-up block rather
+   than a wrapping row (5B-SPEC2 C1). */
+.controls.grouped { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
+  max-width: 340px; margin-left: auto; margin-right: auto; }
+.controls.grouped .btn { padding: 10px 8px; }
+@media (min-width: 560px) {
+  .controls.grouped { grid-template-columns: repeat(3, minmax(0, 1fr)); max-width: 520px; }
+}
+/* Live score: always-on under the scored surfaces, updating on every answer. */
+.live-score { margin-top: 10px; padding: 8px 10px; border-radius: 8px; background: #fffdf3;
+  font-size: 0.95rem; }
+/* Beyond the original's twenty items; labelled so it never reads as fidelity. */
+.extended-divider { margin: 0 0 12px; padding: 8px 10px; border-radius: 8px;
+  background: #fff8d6; border-left: 4px solid var(--teal); color: var(--accent-ink);
+  font-size: 0.85rem; font-weight: 700; text-align: center; }
+/* Translate: the gloss line under the prompt word. */
+.gloss-line { text-align: center; color: var(--accent-ink); font-size: 1.05rem; margin: -6px 0 6px; }
 .btn { background: var(--teal); color: white; border: none; border-radius: 10px;
   padding: 10px 16px; font-weight: 600; }
 .btn.secondary { background: #d9d4c3; color: var(--ink); }
@@ -185,7 +233,7 @@ button { font: inherit; cursor: pointer; }
 .rc-num { font-weight: 600; margin-right: 0.15em; }
 .rc-example { display: inline-flex; flex-wrap: wrap; align-items: baseline; gap: 8px;
   background: #fffdf3; border: 1px solid #e7dfbf; border-radius: 8px; padding: 6px 12px;
-  margin: 8px 0 2px; font-size: 1rem; text-align: left; }
+  margin: 8px 0 2px; font-size: 1rem; text-align: left; color: var(--ink); }
 .rc-example .greek { font-size: 1.3rem; }
 .rc-example.tappable { cursor: pointer; }
 .rc-caption { color: #6b6b63; font-style: italic; }
@@ -195,11 +243,24 @@ button { font: inherit; cursor: pointer; }
 .rc-deflist.nested { margin-top: 8px; }
 .rc-defrow { display: grid; grid-template-columns: minmax(6em, auto) 1fr auto; gap: 10px;
   align-items: baseline; text-align: left; background: transparent; border: none;
-  padding: 5px 6px; border-radius: 8px; font-size: 1rem; }
+  padding: 5px 6px; border-radius: 8px; font-size: 1rem;
+  /* B4: a definition row is a <button> so a row WITH audio can be tapped, but
+     WebKit paints unstyled button text in its own system blue -- which read as
+     "tappable" on every grammar-review term. Colour is explicit here so the UA
+     default can never claim the blue. */
+  color: var(--ink); }
 .rc-defrow.tappable { cursor: pointer; }
 .rc-defrow.tappable:active { background: rgba(0,0,0,0.04); }
-.rc-term { font-weight: 600; }
+.rc-term { font-weight: 600; color: var(--accent-ink); }
 .rc-val { color: var(--ink); }
+/* C7: term-less entries (the accent hints' "Acute—last 3 syllables") are one
+   hanging-indent line each, not a two-column table with an empty first column. */
+.rc-deflist.termless .rc-defrow { display: block; padding-left: 1.4em; text-indent: -1.4em; }
+.rc-deflist.termless .rc-term { display: none; }
+/* Every term-less list in the chapter is English prose (the accent hints and
+   the grammar-review examples); the Greek serif is a chapter-1-era default
+   that does not belong on them. */
+.rc-deflist.termless .rc-val { font-family: inherit; }
 .rc-starnote { font-size: 0.875rem; color: #6b6b63; margin-bottom: 8px; }
 .rc-biblist { display: flex; flex-direction: column; gap: 8px; }
 .rc-bibentry { padding-left: 1.4em; text-indent: -1.4em; font-size: 0.9375rem; line-height: 1.5; }
@@ -216,10 +277,62 @@ button { font: inherit; cursor: pointer; }
    overflow checks never catch. break-word keeps whole words together where a
    column can hold them and only splits a word that cannot fit at all. */
 .rc-greekhead > span { min-width: 0; overflow-wrap: break-word; line-height: 1.25; }
-.syllable-matrix .rc-greekhead { font-size: 0.68rem; letter-spacing: -0.01em; }
+/* B3: the possibilities chart's headers are three long words in three narrow
+   columns. Dropping the uppercasing buys ~25% width, which is the difference
+   between wrapping at the space and breaking mid-word. */
+.syllable-matrix .rc-greekhead { font-size: 0.66rem; letter-spacing: 0; text-transform: none; }
 .rc-syllable-row { border: none; border-bottom: 1px solid rgba(0,0,0,0.06); background: transparent;
   padding: 10px 6px; font-size: 1.35rem; text-align: center; }
-.rc-syllable-row.greek-say { color: var(--link); }
+/* B2: a tappable matrix row is a BUTTON, and .greek-say (later in the file,
+   same specificity) was winning the display/text-align cascade -- the row
+   collapsed to a block and the chunks ran together as one plain-looking word
+   instead of sitting under their column headers. Two classes beat one. */
+.rc-greekrows .rc-syllable-row.greek-say { display: grid; padding: 10px 6px; text-align: center; color: var(--link); }
+/* Clear column separation: each chunk is a real cell with its own rule, as in
+   the original's ruled chart. */
+.syllable-matrix .rc-cell { padding: 2px 4px; }
+.syllable-matrix .rc-cell + .rc-cell { border-left: 1px solid rgba(0,0,0,0.12); }
+.syllable-matrix .rc-greekhead > span + span { border-left: 1px solid rgba(0,0,0,0.12); }
+/* B3: the Accent Possibilities chart is nothing but mark glyphs, so its cells
+   get room to breathe and the marks their enlarged treatment. A cell reads
+   "´ or ῀" and must stay on ONE line to be legible as a set of alternatives. */
+.syllable-matrix .rc-syllable-row { padding: 16px 4px; font-size: 1.05rem; }
+/* Cell tokens ("´", "or", "῀") stay whole and wrap as units rather than
+   breaking a mark away from the alternative it belongs to. */
+.syllable-matrix .rc-cell { display: flex; flex-wrap: wrap; align-items: center;
+  justify-content: center; gap: 0 6px; }
+.syllable-matrix .rc-cell .isolated-mark.as-mark { font-size: 1.6em; }
+.syllable-matrix .rc-cell.rc-rowlabel { display: block; white-space: normal; }
+/* The Accent Possibilities chart is three data columns plus a row legend.
+   Four columns inside 256px leaves ~64px each, which breaks both the headers
+   and the legend mid-word. On phone widths the legend therefore CAPTIONS its
+   row (full width, above it) and the three data columns get the space; the
+   original's four-column form returns as soon as there is room for it. */
+.rc-greekrows.row-labels .rc-greekhead,
+.rc-greekrows.row-labels .rc-syllable-row {
+  grid-template-columns: repeat(var(--greek-datacols), minmax(0, 1fr));
+}
+.rc-greekrows.row-labels .rc-headspacer { display: none; }
+.rc-greekrows.row-labels .rc-cell.rc-rowlabel { grid-column: 1 / -1; order: -1;
+  border-left: none; margin-bottom: 8px; }
+@media (min-width: 560px) {
+  .rc-greekrows.row-labels .rc-greekhead,
+  .rc-greekrows.row-labels .rc-syllable-row {
+    grid-template-columns: repeat(var(--greek-datacols), minmax(0, 1fr)) minmax(0, 0.7fr);
+  }
+  .rc-greekrows.row-labels .rc-headspacer { display: block; }
+  .rc-greekrows.row-labels .rc-cell.rc-rowlabel { grid-column: auto; order: 0;
+    border-left: 1px solid rgba(0,0,0,0.12); margin-bottom: 0; }
+}
+/* B5: Review Marks groups rows under a title line; the rows hang beneath it. */
+.rc-greektitle { color: var(--accent-ink); font-weight: 700; margin: 12px 0 2px; }
+.rc-greekrows.titled { margin: 0 0 6px; }
+.rc-greekrows.titled .rc-greekrow { padding-left: 1.1em; grid-template-columns: 1.6fr 1fr; }
+/* C6: an equation row -- each Greek part its own tap target, connectors inert. */
+.rc-parts { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 4px; }
+.rc-part { font-size: 1.35rem; }
+.rc-part.greek-say { display: inline; width: auto; color: var(--link); }
+.rc-parttext { color: var(--ink); }
 .rc-greekrow { display: grid; grid-template-columns: repeat(var(--greek-cols), minmax(0, 1fr)); gap: 10px;
   align-items: baseline; border-bottom: 1px solid rgba(0,0,0,0.06); padding: 9px 6px; min-width: 0; }
 .rc-greeklabel { font-weight: 600; overflow-wrap: anywhere; }
@@ -227,7 +340,8 @@ button { font: inherit; cursor: pointer; }
    column ("Short Ultima" / "Long Ultima") -- English, so it opts out of the
    row's Greek font. */
 .rc-rowlabel { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
-  font-size: 0.8rem; font-weight: 700; color: var(--teal-dark); overflow-wrap: anywhere; }
+  font-size: 0.75rem; font-weight: 700; color: var(--accent-ink); overflow-wrap: break-word;
+  white-space: normal; line-height: 1.25; }
 .rc-greekword { min-width: 0; font-size: 1.3rem; }
 .rc-greekword.greek-say { width: auto; color: var(--link); }
 .rc-greekgloss { color: var(--teal-dark); overflow-wrap: anywhere; }
@@ -361,16 +475,28 @@ button { font: inherit; cursor: pointer; }
   padding: 10px; border-radius: 8px; background: white; }
 .exercise-answer > span:first-child { color: var(--teal-dark); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
 .exercise-answer .greek { font-size: 1.45rem; }
-.divide-word { display: flex; align-items: center; justify-content: center; width: 100%; min-width: 0;
-  padding: 20px 0; white-space: nowrap; }
-.divide-letter { flex: 0 1 auto; min-width: 0; border: none; background: transparent; padding: 0;
-  font-size: var(--divide-size); line-height: 1.4; }
+/* C2: numbered buttons ABOVE the letters, each with an arrow pointing down
+   into its gap, exactly as the original. The rail is measured (see the probe
+   in DivideActivity) so the pool's longest word fills the width and every word
+   renders at that one size. */
+.divide-probe { position: absolute; visibility: hidden; white-space: nowrap; pointer-events: none;
+  left: -9999px; top: 0; }
+.divide-rail { width: 100%; min-width: 0; }
+.divide-word { display: flex; align-items: flex-end; justify-content: center; width: 100%; min-width: 0;
+  padding: 14px 0 10px; white-space: nowrap; }
+.divide-letter { flex: 0 0 auto; min-width: 0; border: none; background: transparent; padding: 0;
+  font-size: var(--divide-size); line-height: 1.1; color: var(--ink); }
 .divide-letter.greek-say { display: inline-block; color: var(--link); text-align: center; }
-.divide-gap { flex: 0 1 calc(var(--divide-size) * 0.55); width: calc(var(--divide-size) * 0.55); min-width: 8px;
-  align-self: stretch; border: none; border-bottom: 2px solid #b9af91; background: transparent; color: var(--link);
-  padding: 0; font-size: 0.65rem; font-weight: 700; }
-.divide-gap.selected { border-color: var(--link); background: #e8f0fb; }
-.divide-gap.correct { border-color: var(--ok); background: #e6f2e6; color: var(--ok); }
+.divide-gap { flex: 0 0 var(--gap-size); width: var(--gap-size); min-width: 11px;
+  display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 2px;
+  border: none; background: transparent; color: #9a927c; padding: 0; }
+.divide-gap .gap-num { display: block; width: 100%; border: 1.5px solid #cfc6aa; border-radius: 6px;
+  background: #fffdf3; color: var(--ink); font-size: 0.68rem; font-weight: 700; line-height: 1.7; }
+.divide-gap .gap-arrow { display: block; height: calc(var(--divide-size) * 0.9); width: 100%; }
+.divide-gap.selected { color: var(--link); }
+.divide-gap.selected .gap-num { border-color: var(--link); background: #e8f0fb; color: var(--link); }
+.divide-gap.correct { color: var(--ok); }
+.divide-gap.correct .gap-num { border-color: var(--ok); background: #e6f2e6; color: var(--ok); }
 .divide-gap.locked { opacity: 0.35; }
 /* 2c: the original's full-width "only one syllable" bar under the word. */
 .one-syllable-bar { display: block; width: 100%; margin: 4px 0 2px; padding: 11px 10px;
diff --git a/src/components/DivideActivity.svelte b/src/components/DivideActivity.svelte
index 5d118f8..6b42552 100644
--- a/src/components/DivideActivity.svelte
+++ b/src/components/DivideActivity.svelte
@@ -2,13 +2,19 @@
   // Syllable Division Exercise: tap the numbered gaps between letters where
   // the word breaks into syllables, then Check Answer.
   //
+  // LAYOUT (5B-SPEC2 C2) follows the original: a numbered BUTTON above each
+  // gap with an arrow pointing down into the space between the two letters.
+  // Sizing is breakpoint-static, not per-word -- the whole pool is measured
+  // once by its LONGEST word so the letters are as large as that word allows
+  // and every other word renders at the same size.
+  //
   // ANSWER POLICY (5B patch 2a): answerPolicy.attemptsPerItem === 1 means
   // Check Answer finalizes the item right or wrong, reveals the hyphen-joined
   // divided form, and auto-advances after autoAdvanceMs. The timer is cancelled
   // on manual Previous/Next and on unmount. Completion = all items ATTEMPTED.
   import { onDestroy } from 'svelte';
   import { play } from '../lib/audio.js';
-  import { randomFeedback } from '../lib/content.js';
+  import { randomFeedback, resolveHintBlocks } from '../lib/content.js';
   import { dividedForm, splitGraphemes } from '../lib/greek.js';
   import { markCompleted } from '../lib/progress.js';
   import RichContent from './RichContent.svelte';
@@ -27,12 +33,32 @@
   let answered = false;
   let showAnswer = false;
   let showHint = false;
-  let showScore = false;
-  let pronounceEach = false;
+  let showScore = !!activity.ui?.liveScore;
+  let pronounceEach = activity.ui?.defaults?.pronounceEach ?? false;
   let advanceTimer = null;
   const attemptedItems = new Set();
   const results = new Map();
 
+  // Fat-finger sizing (C2). The row is measured, not guessed: a hidden probe
+  // renders the pool's longest word at a reference size, so the glyphs' real
+  // advance widths -- not a character count -- decide how large the letters can
+  // be. `railWidth` re-measures at every breakpoint; the WORD does not change
+  // the size, so stepping through the pool never resizes anything.
+  const PROBE_PX = 100;
+  const GAP_RATIO = 0.34;          // gap column as a share of the letter size
+  const MAX_LETTER_PX = 76;        // stop growing on tablet widths
+  const longest = items.reduce((best, item) => {
+    const count = splitGraphemes(item.greek).length;
+    return count > best.count ? { count, greek: item.greek } : best;
+  }, { count: 0, greek: '' });
+  let railWidth = 0;
+  let probeWidth = 0;
+  $: letterSize = (railWidth > 0 && probeWidth > 0 && longest.count > 0)
+    ? Math.max(16, Math.min(MAX_LETTER_PX,
+        railWidth / (probeWidth / PROBE_PX + GAP_RATIO * Math.max(longest.count - 1, 0))))
+    : 24;
+  $: gapSize = Math.max(11, letterSize * GAP_RATIO);
+
   $: item = items[itemIndex] || null;
   $: letters = splitGraphemes(item && item.greek);
   $: pending = !item || !item.greek || !Array.isArray(item.division);
@@ -40,20 +66,9 @@
   $: oneAttempt = activity.answerPolicy?.attemptsPerItem === 1;
   $: autoAdvanceMs = activity.answerPolicy?.autoAdvanceMs ?? 900;
   $: revealed = answered && oneAttempt;
-
-  function resolveHintBlocks(ch, hint) {
-    if (!hint) return [];
-    if (Array.isArray(hint.content)) return hint.content;
-    if (!hint.contentRef) return [];
-    const toRef = text => (text || '').replace(/[^A-Za-z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^[A-Z]/, c => c.toLowerCase());
-    for (const section of ['learn', 'drill', 'exercise', 'quickReview']) {
-      for (const candidate of ch[section] || []) {
-        const blocks = candidate.content || [];
-        if (blocks.some(block => block.type === 'heading' && toRef(block.text) === hint.contentRef)) return blocks;
-      }
-    }
-    return [];
-  }
+  // Live score (C3): reactive, so the line follows every answer instead of
+  // freezing at whatever it said when the box was opened.
+  $: scoreLine = scoreText(attempts, correct);
 
   function toggleGap(gap) {
     if (answered) return;
@@ -133,9 +148,9 @@
     if (pronounceEach && nextItem && nextItem.audio) play(nextItem.audio);
   }
 
-  function scoreText() {
-    if (!attempts) return chapter.feedback?.scorePrompt || 'Give it a try first';
-    return `${correct} correct out of ${attempts} attempts (${Math.round((correct / attempts) * 100)}%)`;
+  function scoreText(a, c) {
+    if (!a) return chapter.feedback?.scorePrompt || 'Give it a try first';
+    return `${c} correct out of ${a} attempts (${Math.round((c / a) * 100)}%)`;
   }
 
   // Answer submitted, so Check Answer is live even with nothing selected once
@@ -146,27 +161,39 @@
 </script>
 
 <div class="card divide-activity">
+  <!-- Off-screen probe: the pool's longest word at a known size. Its measured
+       width is what the live row is scaled from. -->
+  <span class="divide-probe greek" style="font-size:{PROBE_PX}px" bind:clientWidth={probeWidth}>{longest.greek}</span>
   {#if pending}
     <div class="pending-verification" role="status">Syllable-division word {itemIndex + 1} is pending content verification.</div>
   {:else}
-    <div class="divide-word" style={`--divide-size:${Math.max(13, Math.min(32, 240 / Math.max(letters.length + (letters.length - 1) * 0.55, 1)))}px`} aria-label="Choose syllable division gaps">
-      {#each letters as letter, index}
-        {#if item.audio}
-          <button class="divide-letter greek greek-say" aria-label="Pronounce word" on:click={() => play(item.audio)}>{letter}</button>
-        {:else}
-          <span class="divide-letter greek">{letter}</span>
-        {/if}
-        {#if index < letters.length - 1}
-          <button class="divide-gap"
-            class:selected={selected.has(index + 1)}
-            class:correct={revealed && item.division.includes(index + 1)}
-            class:locked={oneSyllable}
-            aria-pressed={selected.has(index + 1)}
-            on:click={() => toggleGap(index + 1)}>
-            <span>{index + 1}</span>
-          </button>
-        {/if}
-      {/each}
+    <div class="divide-rail" bind:clientWidth={railWidth}>
+      <div class="divide-word"
+        style={`--divide-size:${letterSize}px; --gap-size:${gapSize}px`}
+        aria-label="Choose syllable division gaps">
+        {#each letters as letter, index}
+          {#if item.audio}
+            <button class="divide-letter greek greek-say" aria-label="Pronounce word" on:click={() => play(item.audio)}>{letter}</button>
+          {:else}
+            <span class="divide-letter greek">{letter}</span>
+          {/if}
+          {#if index < letters.length - 1}
+            <button class="divide-gap"
+              class:selected={selected.has(index + 1)}
+              class:correct={revealed && item.division.includes(index + 1)}
+              class:locked={oneSyllable}
+              aria-pressed={selected.has(index + 1)}
+              aria-label={`Divide after letter ${index + 1}`}
+              on:click={() => toggleGap(index + 1)}>
+              <span class="gap-num">{index + 1}</span>
+              <svg class="gap-arrow" viewBox="0 0 12 24" width="12" height="24" aria-hidden="true">
+                <path d="M6 1 V16" stroke="currentColor" stroke-width="2" fill="none" />
+                <path d="M1.5 15 L6 22 L10.5 15 Z" fill="currentColor" />
+              </svg>
+            </button>
+          {/if}
+        {/each}
+      </div>
     </div>
     {#if activity.oneSyllableButton}
       <button class="one-syllable-bar"
@@ -183,20 +210,20 @@
     {/if}
   {/if}
 
-  <div class="controls">
+  <div class="controls grouped">
+    <button class="btn" disabled={!canCheck} on:click={check}>Check Answer</button>
     <button class="btn" disabled={!item?.audio} on:click={() => item?.audio && play(item.audio)}>Pronounce</button>
     <button class="btn secondary" disabled={itemIndex <= 0} on:click={() => move(-1)}>Previous</button>
-    <button class="btn secondary" on:click={() => (showScore = !showScore)}>Score</button>
     <button class="btn secondary" disabled={itemIndex >= items.length - 1} on:click={() => move(1)}>Next</button>
-    <button class="btn" disabled={!canCheck} on:click={check}>Check Answer</button>
     <button class="btn secondary" on:click={() => (showHint = !showHint)}>{activity.hint?.label || 'Hint'}</button>
+    <button class="btn secondary" on:click={() => (showScore = !showScore)}>Score</button>
   </div>
   <div class="exercise-checks">
     <label><input type="checkbox" bind:checked={showAnswer} disabled={pending} /> Show Answer</label>
-    <label><input type="checkbox" bind:checked={pronounceEach} disabled={!item?.audio} /> Pronounce Each Exercise</label>
+    <label><input type="checkbox" bind:checked={pronounceEach} /> Pronounce Each Exercise</label>
   </div>
+  {#if showScore}<div class="scorebox live-score">{scoreLine}</div>{/if}
   <div class="scorebox exercise-count">{itemIndex + 1} of {items.length}</div>
-  {#if showScore}<div class="scorebox">{scoreText()}</div>{/if}
 </div>
 
 {#if showHint}
diff --git a/src/components/Marked.svelte b/src/components/Marked.svelte
index 4971d8f..a0fa223 100644
--- a/src/components/Marked.svelte
+++ b/src/components/Marked.svelte
@@ -1,8 +1,25 @@
 <script>
   // Renders one authored string, honoring inline [[u]]...[[/u]] underline
-  // spans (see lib/markup.js). Segments are plain text nodes -- never {@html}.
-  import { splitUnderline } from '../lib/markup.js';
+  // spans and the "( ´ )" isolated-mark groups (see lib/markup.js). Segments
+  // are plain text nodes -- never {@html}.
+  //
+  // An isolated mark is a base-less diacritic: it needs the SPACING codepoint,
+  // a font whose perispomeni is the rounded mark rather than a tilde, and the
+  // original's deliberate enlargement (5B-SPEC2 B1). The mark span carries the
+  // speller keyboard's font path -- those tiles are the one surface confirmed
+  // on device to render the circumflex correctly.
+  import { splitUnderline, splitMarkGroups } from '../lib/markup.js';
+  import { ISOLATED_MARKS, spacingMarks } from '../lib/greek.js';
   export let text = '';
+
+  const GREEK_LETTER = /[Ͱ-Ͽἀ-῿]/;
+  // A group's inner text is a MARK (enlarge, keyboard font), a Greek letter
+  // (Greek font, mild bump) or ordinary punctuation (grouped, left as is).
+  function kindOf(inner) {
+    const glyphs = spacingMarks(inner);
+    if ([...glyphs].every(char => ISOLATED_MARKS.has(char))) return 'mark';
+    return GREEK_LETTER.test(glyphs) ? 'greek' : 'plain';
+  }
 </script>
 
-{#each splitUnderline(text) as seg}{#if seg.u}<u>{seg.t}</u>{:else}{seg.t}{/if}{/each}
+{#each splitUnderline(text) as seg}{#if seg.u}<u>{seg.t}</u>{:else}{#each splitMarkGroups(seg.t) as part}{#if part.group != null}<span class="mark-group">(&thinsp;<span class="isolated-mark" class:as-mark={kindOf(part.group) === 'mark'} class:greek={kindOf(part.group) === 'greek'}>{spacingMarks(part.group)}</span>&thinsp;)</span>{:else}{part.t}{/if}{/each}{/if}{/each}
diff --git a/src/components/PlaceAccentActivity.svelte b/src/components/PlaceAccentActivity.svelte
index 4d1220f..6a3c656 100644
--- a/src/components/PlaceAccentActivity.svelte
+++ b/src/components/PlaceAccentActivity.svelte
@@ -19,7 +19,12 @@
   export let chapter;
   export let activity;
 
-  const words = activity.items || [];
+  // EXTENDED PRACTICE (5B-SPEC2 C7): the original's 20-item pool is acute-only,
+  // so the data appends circumflex-bearing chapter words as clearly-labelled
+  // extra items. They share the scoring line but NOT the completion bar --
+  // finishing the chapter still means finishing the original twenty.
+  const baseWords = activity.items || [];
+  const words = [...baseWords, ...(activity.extendedItems || [])];
   let wordIndex = 0;
   let accentType = null;
   let accentPosition = null;
@@ -30,8 +35,8 @@
   let answered = false;
   let showAnswer = false;
   let showHint = false;
-  let showScore = false;
-  let pronounceEach = false;
+  let showScore = !!activity.ui?.liveScore;
+  let pronounceEach = activity.ui?.defaults?.pronounceEach ?? false;
   let advanceTimer = null;
   const attemptedWords = new Set();
   const results = new Map();
@@ -43,6 +48,9 @@
   $: oneAttempt = activity.answerPolicy?.attemptsPerItem === 1;
   $: autoAdvanceMs = activity.answerPolicy?.autoAdvanceMs ?? 900;
   $: revealed = answered && oneAttempt;
+  $: isExtended = wordIndex >= baseWords.length;
+  // Live score (C3): reactive so it tracks every answer instead of freezing.
+  $: scoreLine = scoreText(attempts, correct);
 
   // Under attemptsPerItem: 1 a finalized word stays finalized on revisit --
   // reopening it would let a wrong answer be retried and re-count attempts.
@@ -89,7 +97,8 @@
     feedbackKind = ok ? 'ok' : 'bad';
     if (ok || oneAttempt) {
       answered = true;
-      if (attemptedWords.size === words.length) markCompleted(activity.id);
+      // Completion counts the ORIGINAL pool only; the extension is optional.
+      if (baseWords.every((_, index) => attemptedWords.has(index))) markCompleted(activity.id);
       results.set(wordIndex, {
         accentType,
         accentPosition,
@@ -102,15 +111,18 @@
     }
   }
 
-  function scoreText() {
-    if (!attempts) return chapter.feedback?.scorePrompt || 'Give it a try first';
-    return `${correct} correct out of ${attempts} attempts (${Math.round((correct / attempts) * 100)}%)`;
+  function scoreText(a, c) {
+    if (!a) return chapter.feedback?.scorePrompt || 'Give it a try first';
+    return `${c} correct out of ${a} attempts (${Math.round((c / a) * 100)}%)`;
   }
 
   onDestroy(() => clearTimeout(advanceTimer));
 </script>
 
 <div class="card accent-activity">
+  {#if isExtended}
+    <div class="extended-divider">Extended practice — not in the original</div>
+  {/if}
   {#if word && (word.root || word.rootGloss)}
     <div class="accent-root">
       <div class="label">{activity.ui?.header || 'Root Greek Word'}</div>
@@ -156,23 +168,27 @@
     {/if}
   {/if}
 
-  <div class="controls">
-    <button class="btn" disabled={!word?.audio} on:click={() => word?.audio && play(word.audio)}>Pronounce</button>
+  <div class="controls grouped">
+    <button class="btn" disabled={pending || answered || accentType == null || accentPosition == null} on:click={check}>Check Answer</button>
+    <!-- V3 resolved: "Pronounce Word" speaks the CURRENT item's clip -- the
+         same clip Pronounce Each plays. There is no separate root recording. -->
+    <button class="btn" disabled={!word?.audio} on:click={() => word?.audio && play(word.audio)}>Pronounce Word</button>
     <button class="btn secondary" disabled={wordIndex <= 0} on:click={() => move(-1)}>Previous</button>
-    <button class="btn secondary" on:click={() => (showScore = !showScore)}>Score</button>
     <button class="btn secondary" disabled={wordIndex >= words.length - 1} on:click={() => move(1)}>Next</button>
-    <button class="btn" disabled={pending || answered || accentType == null || accentPosition == null} on:click={check}>Check Answer</button>
     {#if hintBlocks.length}
       <button class="btn secondary" on:click={() => (showHint = !showHint)}>{activity.hint?.label || 'Hint'}</button>
     {/if}
+    <button class="btn secondary" on:click={() => (showScore = !showScore)}>Score</button>
   </div>
   <div class="exercise-checks">
     <label><input type="checkbox" bind:checked={showAnswer} disabled={pending} /> Show Answer</label>
-    <label><input type="checkbox" bind:checked={pronounceEach} disabled={!word?.audio} /> Pronounce Each Exercise</label>
+    <label><input type="checkbox" bind:checked={pronounceEach} /> Pronounce Each Exercise</label>
     {#if word?.ref}<span class="exercise-ref">{word.ref}</span>{/if}
   </div>
-  <div class="scorebox exercise-count">{wordIndex + 1} of {words.length}</div>
-  {#if showScore}<div class="scorebox">{scoreText()}</div>{/if}
+  {#if showScore}<div class="scorebox live-score">{scoreLine}</div>{/if}
+  <div class="scorebox exercise-count">
+    {wordIndex + 1} of {words.length}{#if activity.extendedItems?.length}&nbsp;({baseWords.length} in the original){/if}
+  </div>
 </div>
 
 {#if showHint && hintBlocks.length}
diff --git a/src/components/RichContent.svelte b/src/components/RichContent.svelte
index 971a1fc..eba38f4 100644
--- a/src/components/RichContent.svelte
+++ b/src/components/RichContent.svelte
@@ -10,10 +10,27 @@
   // font and play their clip on tap. defList rows [term, value, audio?] play
   // the row's clip when present.
   import { play } from '../lib/audio.js';
+  import { splitMarkRun } from '../lib/greek.js';
   import Marked from './Marked.svelte';
 
   export let blocks = [];
 
+  // The 6 Accent Rules topic ships the "Chart: Accent Possibilities" expander
+  // TWICE, byte-identical (feedback 5: it renders twice on both devices). Data
+  // content is not ours to edit, so the renderer drops a repeat of an expander
+  // label already seen in the same block array.
+  $: shown = dedupeExpanders(blocks);
+  function dedupeExpanders(list) {
+    const seen = new Set();
+    return (list || []).filter(block => {
+      if (block.type !== 'expander') return true;
+      const key = block.label || '';
+      if (seen.has(key)) return false;
+      seen.add(key);
+      return true;
+    });
+  }
+
   function playAudio(id) { if (id) play(id); }
 
   // A defList value may be a plain string OR a letters-list object
@@ -21,6 +38,10 @@
   // chips (A6, Six Points "Linguistic Pronunciation Descriptions").
   const isLettersList = v => v && typeof v === 'object' && Array.isArray(v.letters);
   const defRows = block => block.rows || (block.items || []).map(item => [item.term, item.def, item.audio]);
+  // The accent hints ship term-less entries ("Acute—last 3 syllables" on its
+  // own line, 5B-SPEC2 C7). With no term there is no two-column rhythm to
+  // keep, so those lists render as hanging-indent lines instead.
+  const isTermless = block => defRows(block).every(row => !row[0]);
   // A matrix row fills the declared columns with cells instead of the usual
   // greek-word + gloss pair. Rows may also carry a row LABEL: the Accent
   // Possibilities chart legends its two rows "Short Ultima" / "Long Ultima"
@@ -70,7 +91,7 @@
 </script>
 
 <div class="rich">
-  {#each blocks as b}
+  {#each shown as b}
     {#if b.type === 'heading'}
       <div class="rc-heading"><Marked text={b.text} /></div>
 
@@ -123,7 +144,7 @@
       </ol>
 
     {:else if b.type === 'defList'}
-      <div class="rc-deflist">
+      <div class="rc-deflist" class:termless={isTermless(b)}>
         {#each defRows(b) as row}
           {#if isLettersList(row[1])}
             <div class="rc-defrow letters-row">
@@ -147,26 +168,55 @@
       {@const syllableMatrix = isSyllableMatrix(b)}
       {@const rowLabels = syllableMatrix && hasRowLabels(b)}
       {@const matrixCols = syllableMatrix ? b.columns.length + (rowLabels ? 1 : 0) : 0}
-      <div class="rc-greekrows" class:syllable-matrix={syllableMatrix}>
+      {@const gridVars = `--greek-cols:${syllableMatrix ? matrixCols : (b.columns || []).length};--greek-datacols:${(b.columns || []).length}`}
+      <div class="rc-greekrows" class:syllable-matrix={syllableMatrix} class:row-labels={rowLabels} class:titled={b.title}>
+        <!-- B5: Review Marks groups its rows under a title ("Breathing:",
+             "Punctuation:", "Apostrophe:  ( ᾽ )  elided letters"). The title
+             owns its line in the heading green; the rows hang beneath it. -->
+        {#if b.title}<div class="rc-greektitle"><Marked text={b.title} /></div>{/if}
         {#if b.columns}
-          <div class="rc-greekhead" style={`--greek-cols:${syllableMatrix ? matrixCols : b.columns.length}`}>
+          <div class="rc-greekhead" style={gridVars}>
             {#each b.columns as column}<span>{column}</span>{/each}
-            {#if rowLabels}<span>&nbsp;</span>{/if}
+            {#if rowLabels}<span class="rc-headspacer">&nbsp;</span>{/if}
           </div>
         {/if}
         {#each b.rows as row}
           {#if syllableMatrix}
+            <!-- One tap target spanning the whole row: the chunks sit under
+                 their own column headers but the WORD is what is tapped
+                 (5B-SPEC2 B2). A chunk may legitimately be empty -- kosmos has
+                 no antepenult -- so empty cells hold their column open. -->
             {#if row.audio}
-              <button class="rc-syllable-row greek greek-say" style={`--greek-cols:${matrixCols}`} on:click={() => playAudio(row.audio)}>
-                {#each row.syllables as syllable}<span>{syllable || '\u00a0'}</span>{/each}
-                {#if rowLabels}<span class="rc-rowlabel">{row.label || '\u00a0'}</span>{/if}
+              <button class="rc-syllable-row greek greek-say" style={gridVars} on:click={() => playAudio(row.audio)}>
+                {#each row.syllables as syllable}<span class="rc-cell">{#each splitMarkRun(syllable) as run}{#if run.mark}<span class="isolated-mark as-mark">{run.t}</span>{:else}{run.t}{/if}{/each}{#if !syllable}&nbsp;{/if}</span>{/each}
+                {#if rowLabels}<span class="rc-cell rc-rowlabel">{row.label || '\u00a0'}</span>{/if}
               </button>
             {:else}
-              <div class="rc-syllable-row greek" style={`--greek-cols:${matrixCols}`}>
-                {#each row.syllables as syllable}<span>{syllable || '\u00a0'}</span>{/each}
-                {#if rowLabels}<span class="rc-rowlabel">{row.label || '\u00a0'}</span>{/if}
+              <div class="rc-syllable-row greek" style={gridVars}>
+                {#each row.syllables as syllable}<span class="rc-cell">{#each splitMarkRun(syllable) as run}{#if run.mark}<span class="isolated-mark as-mark">{run.t}</span>{:else}{run.t}{/if}{/each}{#if !syllable}&nbsp;{/if}</span>{/each}
+                {#if rowLabels}<span class="rc-cell rc-rowlabel">{row.label || '\u00a0'}</span>{/if}
               </div>
             {/if}
+          {:else if row.parts}
+            <!-- C6: an equation row (\u03b4\u03b9\u03ac + \u03b1\u1f50\u03c4\u03bf\u1fe6 becomes \u03b4\u03b9\u1fbd \u03b1\u1f50\u03c4\u03bf\u1fe6). Each Greek
+                 part is its OWN tap target with its own clip; the connecting
+                 words are inert ink. -->
+            <div class="rc-greekrow parts-row" style="--greek-cols:1">
+              <span class="rc-parts">
+                {#each row.parts as part}
+                  {#if part.greek}
+                    {#if part.audio}
+                      <button class="rc-part greek greek-say" on:click={() => playAudio(part.audio)}>{part.greek}</button>
+                    {:else}
+                      <span class="rc-part greek">{part.greek}</span>
+                    {/if}
+                  {:else}
+                    <span class="rc-parttext">{part.text}</span>
+                  {/if}
+                {/each}
+                {#if row.gloss != null && row.gloss !== ''}<span class="rc-greekgloss"><Marked text={row.gloss} /></span>{/if}
+              </span>
+            </div>
           {:else}
             {@const cellCount = (row.label ? 1 : 0) + (row.greek ? 1 : 0) + (row.gloss != null && row.gloss !== '' ? 1 : 0)}
             <div class="rc-greekrow" style={`--greek-cols:${Math.max(cellCount, 1)}`}>
@@ -208,8 +258,16 @@
     {:else if b.type === 'biblist'}
       {#if b.starNote}<div class="rc-starnote">{b.starNote}</div>{/if}
       <div class="rc-biblist">
+        <!-- B6: a biblist entry is a plain string. An object-form entry once
+             shipped and rendered as "[object Object]" five times over; the
+             guard makes the shape failure visible instead of garbled. The
+             build-time equivalent is scripts/check-content-shapes.mjs. -->
         {#each b.items as entry}
-          <div class="rc-bibentry"><Marked text={entry} /></div>
+          {#if typeof entry === 'string'}
+            <div class="rc-bibentry"><Marked text={entry} /></div>
+          {:else}
+            <div class="pending-verification compact">Bibliography entry is not a string — data shape error.</div>
+          {/if}
         {/each}
       </div>
 
diff --git a/src/components/SelectActivity.svelte b/src/components/SelectActivity.svelte
index dd71f12..0eb0eb9 100644
--- a/src/components/SelectActivity.svelte
+++ b/src/components/SelectActivity.svelte
@@ -12,9 +12,16 @@
   //   { attemptsPerItem: "retry" } / absent — the original retry loop: a wrong
   //     tap leaves the item open, only a correct tap advances (chapter 1 and
   //     the Syllable Counting drill).
+  //   { autoAdvanceOnIncorrect: false } — a WRONG answer is still final, but
+  //     nothing moves: the learner studies the revealed form for as long as
+  //     they like and clicks Next (5B-SPEC2 C4, Accent Rule drill).
+  //
+  // CONTROLS come from activity.ui.buttons, so each drill shows exactly the
+  // original's button block (Previous / Next / Pronounce / Translate / Hint /
+  // Score); chapter 1's two-button drills are unaffected.
   import { onDestroy } from 'svelte';
-  import { buildSelectQuestions, randomFeedback } from '../lib/content.js';
-  import { markClusters } from '../lib/greek.js';
+  import { buildSelectQuestions, randomFeedback, resolveHintBlocks } from '../lib/content.js';
+  import { combiningForMarkName, firstAccentCluster, markOverlayParts } from '../lib/greek.js';
   import { play } from '../lib/audio.js';
   import { markCompleted } from '../lib/progress.js';
   import RichContent from './RichContent.svelte';
@@ -35,7 +42,11 @@
   let pronounceEach = true;
   let finished = false;
   let showHint = false;
+  let showGloss = false;
+  let showScore = false;
   let advanceTimer = null;
+  const attemptedItems = new Set();
+  const results = new Map();
 
   init();
   function init() {
@@ -46,6 +57,11 @@
     optionClass = built.optionClass || '';
     qIndex = 0; attempts = 0; correct = 0;
     feedback = ''; picked = null; answered = false; finished = false;
+    showGloss = false;
+    attemptedItems.clear();
+    results.clear();
+    pronounceEach = activity.ui?.defaults?.pronounceEach ?? true;
+    showScore = !!activity.ui?.liveScore;
     clearTimeout(advanceTimer);
     maybePronounce();
   }
@@ -53,25 +69,51 @@
   $: current = questions[qIndex];
   $: staticOptions = Array.isArray(activity.optionValues);
   $: wideOptions = !staticOptions || optionClass === 'wide';
-  $: showPronounce = !staticOptions || !!activity.ui?.buttons?.includes('Pronounce');
+  $: uiButtons = activity.ui?.buttons || [];
+  $: showPronounce = !staticOptions || uiButtons.includes('Pronounce');
+  $: showStepper = uiButtons.includes('Previous') || uiButtons.includes('Next');
+  $: showTranslate = uiButtons.includes('Translate');
   $: showPronounceEach = !staticOptions || !!activity.ui?.checkboxes?.includes('Pronounce Each Drill');
-  $: hintBlocks = (activity.hint && activity.hint.content) || [];
+  $: hintBlocks = resolveHintBlocks(chapter, activity.hint);
   $: showHintButton = hintBlocks.length > 0;
+  // Grouped button block (the original stacks them two-up) once there are more
+  // than the chapter-1 pair.
+  $: groupedControls = 1 + (showPronounce ? 1 : 0) + (showStepper ? 2 : 0)
+    + (showTranslate ? 1 : 0) + (showHintButton ? 1 : 0) > 3;
   // One-attempt drills finalize on the option tap; retry drills keep the loop.
   $: oneAttempt = activity.answerPolicy?.attemptsPerItem === 1;
   $: autoAdvanceMs = activity.answerPolicy?.autoAdvanceMs ?? null;
+  $: waitOnIncorrect = activity.answerPolicy?.autoAdvanceOnIncorrect === false;
   // 2c: the original's full-width "only one syllable" bar under the word. In
   // this drill it answers "1" -- the same value as the first number tile.
   $: oneSyllableOption = activity.oneSyllableButton
     ? options.find(option => option.id === '1') || null
     : null;
 
-  // 2e: the mark being asked about is rendered RED -- that IS the question.
-  // redMarkCluster is a 1-based grapheme cluster; see markClusters() for why
-  // the whole cluster reddens rather than just its diacritic.
-  $: redParts = current && current.redMarkCluster
-    ? markClusters(current.prompt, current.redMarkCluster)
-    : null;
+  // The mark being asked about is drawn RED -- that IS the question. The
+  // Marking Recognition drill names the cluster (redMarkCluster); the Accent
+  // Rule drill reddens the word's FIRST accent. Both resolve to the same
+  // overlay parts, which colour ONLY the mark (5B-SPEC2 C5).
+  $: redParts = current ? redPartsFor(current) : null;
+  function redPartsFor(question) {
+    if (question.redMarkCluster) {
+      return markOverlayParts(question.prompt, question.redMarkCluster, combiningForMarkName(question.answerId));
+    }
+    if (activity.redFirstAccent) {
+      const first = firstAccentCluster(question.prompt);
+      if (first.index > 0) return markOverlayParts(question.prompt, first.index, first.mark);
+    }
+    return null;
+  }
+
+  // Live score (5B-SPEC2 C3): a reactive statement, so the line re-renders on
+  // every answer. The old score box called scoreText() from the template with
+  // no reactive dependency and went stale the moment it was opened.
+  $: scoreLine = scoreText(attempts, correct);
+  function scoreText(a, c) {
+    if (a === 0) return chapter.feedback?.scorePrompt || 'Give it a try first';
+    return `${c} correct out of ${a} attempts (${Math.round((c / a) * 100)}%)`;
+  }
 
   function maybePronounce() {
     const q = questions[qIndex];
@@ -82,6 +124,7 @@
     if (answered || finished || current.pending) return;
     picked = opt.id;
     attempts += 1;
+    attemptedItems.add(qIndex);
     const right = opt.id === current.answerId;
     if (right) correct += 1;
     feedback = randomFeedback(chapter, right ? 'correct' : 'incorrect');
@@ -89,11 +132,12 @@
     if (right || oneAttempt) {
       // One attempt: the item is done either way and the answer is revealed.
       answered = true;
+      results.set(qIndex, { picked, feedback, feedbackKind });
       // Completion is defined by attempted items, so record the final item when
       // it is ANSWERED. Route exit cancels the timer, not progress.
-      if (oneAttempt && qIndex === questions.length - 1 && activity.id) markCompleted(activity.id);
+      if (oneAttempt && attemptedItems.size === questions.length && activity.id) markCompleted(activity.id);
       clearTimeout(advanceTimer);
-      advanceTimer = setTimeout(advance, autoAdvanceMs ?? 900);
+      if (right || !waitOnIncorrect) advanceTimer = setTimeout(advance, autoAdvanceMs ?? 900);
     }
   }
 
@@ -101,7 +145,7 @@
     clearTimeout(advanceTimer);
     if (qIndex < questions.length - 1) {
       qIndex += 1;
-      picked = null; answered = false; feedback = ''; feedbackKind = '';
+      restore();
       maybePronounce();
     } else {
       finished = true;
@@ -110,17 +154,36 @@
     }
   }
 
-  function scoreText() {
-    if (attempts === 0) return chapter.feedback?.scorePrompt || 'Give it a try first';
-    return `${correct} correct out of ${attempts} attempts (${Math.round((correct / attempts) * 100)}%)`;
+  // Under attemptsPerItem: 1 a finalized item stays finalized on revisit --
+  // reopening it would let a wrong answer be retried and re-count attempts.
+  function restore() {
+    const result = results.get(qIndex);
+    showGloss = false;
+    if (result && oneAttempt) {
+      picked = result.picked;
+      feedback = result.feedback;
+      feedbackKind = result.feedbackKind;
+      answered = true;
+      return;
+    }
+    picked = null; answered = false; feedback = ''; feedbackKind = '';
   }
+
+  function move(delta) {
+    clearTimeout(advanceTimer);
+    const nextIndex = Math.max(0, Math.min(questions.length - 1, qIndex + delta));
+    if (nextIndex === qIndex) return;
+    qIndex = nextIndex;
+    restore();
+    maybePronounce();
+  }
+
   function sentenceParts(text, underline) {
     if (!underline) return null;
     const at = text.indexOf(underline);
     if (at === -1) return null;
     return [text.slice(0, at), text.slice(at, at + underline.length), text.slice(at + underline.length)];
   }
-  let showScore = false;
 
   onDestroy(() => clearTimeout(advanceTimer));
 </script>
@@ -128,17 +191,16 @@
 <div class="card">
   {#if finished}
     <div class="scorebox" style="font-size:1.2rem; padding: 20px 0">
-      Finished! {scoreText()}
+      Finished! {scoreLine}
     </div>
     <div class="controls"><button class="btn" on:click={init}>Start Over</button></div>
   {:else if current}
     <!-- Greek-tap rule (P6/P8/P9): a Greek PROMPT with audio pronounces itself
-         on tap (blue). The tap never answers, advances, or re-shuffles.
-         English prompts stay static; options are answers, never audio taps. -->
+         on tap (blue). The tap never answers, advances, or re-shuffles. -->
     {#if redParts}
       <!-- Still displayed Greek, so still a greek-say tap (directive 9); the
            asked-about mark simply overrides the blue with red. -->
-      <button class="prompt greek greek-say red-mark" disabled={!current.promptAudio} on:click={() => current.promptAudio && play(current.promptAudio)}>{#each redParts as part}<span class:mark-red={part.red}>{part.text}</span>{/each}</button>
+      <button class="prompt greek greek-say red-mark" disabled={!current.promptAudio} on:click={() => current.promptAudio && play(current.promptAudio)}>{#each redParts as part}{#if part.overlay}<span class="rm-cluster"><span class="rm-base">{part.base}</span><span class="rm-mark">{part.overlay}</span></span>{:else if part.red}<span class="mark-red">{part.text}</span>{:else}{part.text}{/if}{/each}</button>
     {:else if promptIsGreek && current.promptAudio}
       <button class="prompt greek greek-say" on:click={() => play(current.promptAudio)}>{current.prompt}</button>
     {:else if current.underline && sentenceParts(current.prompt, current.underline)}
@@ -150,11 +212,13 @@
     {#if current.pending}
       <div class="pending-verification" role="status">This activity item is pending content verification.</div>
     {:else}
+      <!-- Translate: the original's gloss line under the word, on demand. -->
+      {#if showGloss && current.gloss}<div class="gloss-line">{current.gloss}</div>{/if}
       <!-- Reveal on a finalized item: the gloss, and the properly accented
            form the Accent Rule drill's misaccented prompt should have had. -->
       {#if answered && (current.gloss || current.correctForm)}
         <div class="reveal-row">
-          {#if current.gloss}<span class="reveal-gloss">{current.gloss}</span>{/if}
+          {#if current.gloss && !showGloss}<span class="reveal-gloss">{current.gloss}</span>{/if}
           {#if current.correctForm}<span class="reveal-form greek">{current.correctForm}</span>{/if}
         </div>
       {/if}
@@ -182,21 +246,28 @@
         </button>
       {/if}
     {/if}
-    <div class="controls">
-      <button class="btn secondary" on:click={() => (showScore = !showScore)}>Score</button>
+    <div class="controls" class:grouped={groupedControls}>
+      {#if showStepper}
+        <button class="btn secondary" disabled={qIndex <= 0} on:click={() => move(-1)}>Previous</button>
+        <button class="btn secondary" disabled={qIndex >= questions.length - 1} on:click={() => move(1)}>Next</button>
+      {/if}
       {#if showPronounce}
         <button class="btn" disabled={!current.promptAudio} on:click={() => current.promptAudio && play(current.promptAudio)}>Pronounce</button>
       {/if}
+      {#if showTranslate}
+        <button class="btn secondary" disabled={!current.gloss} on:click={() => (showGloss = !showGloss)}>Translate</button>
+      {/if}
       {#if showHintButton}
         <button class="btn secondary" on:click={() => (showHint = !showHint)}>Hint</button>
       {/if}
-      {#if showPronounceEach}
-        <label style="display:flex; align-items:center; gap:6px; font-size:0.9rem">
-          <input type="checkbox" bind:checked={pronounceEach} disabled={!current.promptAudio} /> Pronounce each
-        </label>
-      {/if}
+      <button class="btn secondary" on:click={() => (showScore = !showScore)}>Score</button>
     </div>
-    {#if showScore}<div class="scorebox">{scoreText()}</div>{/if}
+    {#if showPronounceEach}
+      <div class="exercise-checks">
+        <label><input type="checkbox" bind:checked={pronounceEach} /> Pronounce each</label>
+      </div>
+    {/if}
+    {#if showScore}<div class="scorebox live-score">{scoreLine}</div>{/if}
     <div class="scorebox" style="font-weight:400; font-size:0.85rem; margin-top:8px">
       {qIndex + 1} of {questions.length}
     </div>
diff --git a/src/lib/content.js b/src/lib/content.js
index d08334e..3097b61 100644
--- a/src/lib/content.js
+++ b/src/lib/content.js
@@ -379,6 +379,24 @@ export function buildSelectQuestions(chapter, activity) {
   return { options, questions, optionClass: '', promptIsGreek: promptSide === 'greek' };
 }
 
+// An activity's Hint either carries its own blocks or REFERS to a chart that
+// already exists elsewhere in the chapter (the Syllable Counting drill and the
+// Division exercise both open the Three Syllable Rules). Resolving the
+// reference keeps the hint from duplicating -- or inventing -- authored copy.
+export function resolveHintBlocks(chapter, hint) {
+  if (!hint) return [];
+  if (Array.isArray(hint.content)) return hint.content;
+  if (!hint.contentRef) return [];
+  const toRef = text => (text || '').replace(/[^A-Za-z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^[A-Z]/, c => c.toLowerCase());
+  for (const section of SECTIONS) {
+    for (const candidate of chapter[section] || []) {
+      const blocks = candidate.content || [];
+      if (blocks.some(block => block.type === 'heading' && toRef(block.text) === hint.contentRef)) return blocks;
+    }
+  }
+  return [];
+}
+
 export function shuffle(arr) {
   const a = [...arr];
   for (let i = a.length - 1; i > 0; i--) {
diff --git a/src/lib/greek.js b/src/lib/greek.js
index 62fb1dc..45df44f 100644
--- a/src/lib/greek.js
+++ b/src/lib/greek.js
@@ -52,15 +52,118 @@ export function dividedForm(greek, division) {
   ).join('');
 }
 
-// Marking Recognition asks about ONE mark and draws it red. Splitting the
-// cluster into base + combining mark and coloring only the mark does not
-// work: browsers keep shaping across an inline boundary that differs only in
-// color, so the mark glyph is painted with the BASE run's color and the red
-// never shows (verified in Chrome; the DOM color was correct, the glyph was
-// not). Marking the whole target cluster is the spec's sanctioned fallback.
-export function markClusters(text, redIndex) {
-  return splitGraphemes(text).map((cluster, index) => ({
-    text: cluster,
-    red: index + 1 === redIndex
-  }));
+// ---- Isolated / red marks (5B-SPEC2 B1, C4, C5) ----
+//
+// A diacritic shown OUTSIDE a word needs the SPACING codepoint, not the
+// combining one: a lone combining mark has no base to sit on and renders as a
+// hairline (or a dotted circle). The chapter-2 data now authors the spacing
+// forms; this map is the render-time bridge for the two cells that still carry
+// combining marks and for turning a word's own combining mark into the
+// free-standing glyph the red overlay paints.
+export const SPACING_FOR_COMBINING = {
+  '́': '´',   // acute
+  '̀': '`',   // grave
+  '͂': '῀',   // circumflex (perispomeni, NOT a tilde)
+  '̓': '᾿',   // smooth breathing / coronis
+  '̔': '῾',   // rough breathing
+  '̈': '¨'    // diaeresis
+};
+
+// Every codepoint that renders as a free-standing mark glyph, spacing or
+// combining. Used to decide what gets the enlarged isolated-mark treatment.
+export const ISOLATED_MARKS = new Set([
+  '᾿', '῾', '῀', '´', '`', '¨', '᾽',
+  ...Object.keys(SPACING_FOR_COMBINING)
+]);
+
+// The mark a Marking Recognition option label names, so the red overlay can
+// pick ONE mark out of a multi-mark cluster (ΐ is diaeresis + acute; ὔ is
+// coronis + acute). Punctuation answers have no combining form: those clusters
+// ARE the mark and redden whole.
+const MARK_BY_NAME = {
+  'Acute': '́',
+  'Grave': '̀',
+  'Circumflex': '͂',
+  'Smooth Breathing': '̓',
+  'Rough Breathing': '̔',
+  'Coronis': '̓',
+  'Diaeresis': '̈'
+};
+
+export function combiningForMarkName(name) { return MARK_BY_NAME[name] || null; }
+
+export function spacingForm(mark) { return SPACING_FOR_COMBINING[mark] || mark; }
+
+// Replace any combining mark in an isolated (base-less) string with its
+// spacing twin. The Accent Possibilities chart's "Long Ultima" ultima cell
+// still ships combining acute/grave; rendering them as-is is unreadable.
+export function spacingMarks(text) {
+  if (!text) return text || '';
+  let out = '';
+  for (const char of text) out += SPACING_FOR_COMBINING[char] || char;
+  return out;
+}
+
+// Split a base-less string into mark / non-mark runs so a chart cell like
+// "´ or ῀" can enlarge its glyphs and leave the "or" at body size.
+export function splitMarkRun(text) {
+  const parts = [];
+  for (const char of spacingMarks(text || '')) {
+    const mark = ISOLATED_MARKS.has(char);
+    const last = parts[parts.length - 1];
+    if (last && last.mark === mark) last.t += char;
+    else parts.push({ t: char, mark });
+  }
+  return parts;
+}
+
+// Index (1-based) and combining char of a word's FIRST accent in NFD order --
+// the Accent Rule drill's redFirstAccent contract.
+export function firstAccentCluster(text) {
+  const clusters = splitGraphemes(text);
+  for (let i = 0; i < clusters.length; i++) {
+    for (const char of clusters[i].normalize('NFD')) {
+      if (ACCENT_MARKS[char]) return { index: i + 1, mark: char };
+    }
+  }
+  return { index: -1, mark: null };
+}
+
+// Marking Recognition / Accent Rule ask about ONE mark and draw it red.
+// Colouring the mark INLINE does not work: browsers keep shaping across an
+// inline boundary that differs only in colour, so the mark glyph is painted
+// with the BASE run's colour (verified by screenshot in the 5B patch -- the
+// DOM colour was right, the pixels were not). 5B-SPEC2 C5 settles it: render
+// the target cluster's BASE with the mark removed and OVERLAY the mark as a
+// free-standing spacing glyph, absolutely positioned over the base. No inline
+// boundary, so nothing to shape across.
+//
+// Returns render segments in source order:
+//   { text }                     plain ink run
+//   { base, overlay }            the target cluster, split for the overlay
+//   { text, red: true }          fallback: the whole cluster reddens because
+//                                it IS the mark (apostrophe, colon, question)
+//                                or carries no combining mark at all
+export function markOverlayParts(text, redIndex, preferredMark) {
+  const clusters = splitGraphemes(text);
+  const parts = [];
+  const pushText = (t, red) => {
+    const last = parts[parts.length - 1];
+    if (!red && last && last.text != null && !last.red) last.text += t;
+    else parts.push(red ? { text: t, red: true } : { text: t });
+  };
+  clusters.forEach((cluster, index) => {
+    if (index + 1 !== redIndex) { pushText(cluster, false); return; }
+    const chars = Array.from(cluster.normalize('NFD'));
+    const marks = chars.filter(char => SPACING_FOR_COMBINING[char]);
+    const target = (preferredMark && marks.includes(preferredMark)) ? preferredMark : marks[0];
+    if (!target) { pushText(cluster, true); return; }   // standalone mark or bare letter
+    let dropped = false;
+    const base = chars.filter(char => {
+      if (!dropped && char === target) { dropped = true; return false; }
+      return true;
+    }).join('').normalize('NFC');
+    parts.push({ base, overlay: spacingForm(target) });
+  });
+  return parts;
 }
diff --git a/src/lib/markup.js b/src/lib/markup.js
index c7f3866..8cb3b0e 100644
--- a/src/lib/markup.js
+++ b/src/lib/markup.js
@@ -27,6 +27,37 @@ export function splitUnderline(text) {
   return parts.map(p => (p.u ? p : { ...p, t: p.t.replace(ANY_MARKER, '') }));
 }
 
+// ---- Isolated marks in parentheses (5B-SPEC2 B1) ----
+//
+// The chapter's teaching prose names each mark by showing it alone in
+// parentheses: "Acute ( ´ )", "Question Mark ( ; )", "Coronis:  ( ᾿ )  words
+// joined". Two things go wrong if that is left as plain text: the mark glyph
+// is body-text sized (the original deliberately enlarges it) and the group can
+// break across lines, stranding the closing paren on its own (feedback 8).
+// Every "( x )" group therefore renders as one no-wrap unit, with the mark
+// itself enlarged.
+//
+// The pattern deliberately requires whitespace INSIDE both parens, so ordinary
+// prose parentheticals -- "(e.g. book)", "(Present tense)", "(Jn 1:15)" --
+// never match.
+const MARK_GROUP = /\(\s+([^\s()]{1,3})\s+\)/g;
+
+// [{ t }] plain runs and { group: inner } no-wrap "( inner )" groups.
+export function splitMarkGroups(text) {
+  const src = text == null ? '' : String(text);
+  if (!src.includes('(')) return [{ t: src }];
+  const parts = [];
+  let at = 0;
+  MARK_GROUP.lastIndex = 0;
+  for (let m = MARK_GROUP.exec(src); m; m = MARK_GROUP.exec(src)) {
+    if (m.index > at) parts.push({ t: src.slice(at, m.index) });
+    parts.push({ group: m[1] });
+    at = m.index + m[0].length;
+  }
+  if (at < src.length) parts.push({ t: src.slice(at) });
+  return parts.length ? parts : [{ t: src }];
+}
+
 // Defensive: the same string on a surface with no underline support.
 export function stripMarkup(text) {
   if (text == null) return text;
```

### New file: `scripts/check-content-shapes.mjs`

```js
// Build-time assertion for the content SHAPES the renderers depend on
// (5B-SPEC2 B6). The chapter-2 bibliography once shipped object-form entries
// and rendered "[object Object]" five times over on device: valid JSON, valid
// block type, silently garbled output. A shape that can only fail visually
// gets a loud check here instead. Run from `npm run verify`.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DATA = 'src/data';
const problems = [];

// walk every nested block array a chapter can carry (content, topics[].content,
// expander.content, hint.content, ...) without hard-coding the nesting.
function walk(node, path, visit) {
  if (Array.isArray(node)) {
    node.forEach((child, index) => walk(child, `${path}[${index}]`, visit));
    return;
  }
  if (!node || typeof node !== 'object') return;
  visit(node, path);
  for (const [key, value] of Object.entries(node)) walk(value, `${path}.${key}`, visit);
}

const files = readdirSync(DATA).filter(name => /^chapt-\d+\.json$/.test(name));
if (!files.length) {
  console.error('FAIL: no chapter data files found under src/data.');
  process.exit(1);
}

for (const file of files) {
  const data = JSON.parse(readFileSync(join(DATA, file), 'utf8'));
  walk(data, file, (block, path) => {
    if (block.type === 'biblist') {
      if (!Array.isArray(block.items) || !block.items.length) {
        problems.push(`${path}: biblist has no items array.`);
        return;
      }
      block.items.forEach((entry, index) => {
        if (typeof entry !== 'string') {
          problems.push(`${path}.items[${index}]: biblist entry is ${entry === null ? 'null' : typeof entry}, expected a string.`);
        }
      });
    }
    // greekRows rows carry a word, a positional-chart cell list, or an
    // alternating parts[] equation -- never nothing at all.
    if (block.type === 'greekRows') {
      (block.rows || []).forEach((row, index) => {
        const hasContent = row.greek || Array.isArray(row.syllables) || Array.isArray(row.parts);
        if (!hasContent) problems.push(`${path}.rows[${index}]: greekRows row has no greek, syllables or parts.`);
      });
    }
  });
}

if (problems.length) {
  for (const problem of problems) console.error(`FAIL: ${problem}`);
  process.exit(1);
}

console.log(`PASS: content shapes intact — ${files.join(', ')} checked (biblist entries are strings; greekRows rows carry content).`);

```
