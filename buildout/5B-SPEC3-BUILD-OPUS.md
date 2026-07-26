# 5B-SPEC3-BUILD-FABLE.md — build log

Implementer: Fable (Claude Opus 5) in Claude Code, one session, single worktree
on `main`. Wall clock: about 2h35m from opening the spec to the final
verification pass — roughly 45 minutes on the font hunt in section B, 50 on the
division-sizing bug in D2, and 40 on verification runs (headless CDP round
trips in this environment are about a second each, so a 46-item offline walk
takes minutes).

Deliverable pair: this file plus `5B-SPEC3-RESULTS-FABLE.md`. The exact diff is
`git diff` in the working tree at the end of the session (nothing committed,
nothing pushed, per the standing rule).

## 1. Reading order

`buildout/5B-SPEC3.md` first, then `AGENTS.md` -> `buildout/archive/ONBOARD-SOL.md`
(the authoritative onboarding), then `CHAT-HANDOFF.md`, then `5B-XPATCH1.md` to
see what the accepted base already carried. Then the code the spec names:
`src/lib/greek.js`, `src/app.css`, `SelectActivity`, `DivideActivity`,
`PlaceAccentActivity`, `RichContent`, `Marked`, plus the A1 data diff that was
already sitting unstaged in the tree.

The PDF was read alongside, but the spec led. Two places where the screenshots
changed what I did:

- Item 3's screenshot shows φαρισαῖος filling the row while the numbered
  buttons stay tiny. That is what sent me to measure the row rather than to
  bump a font-size, and it is how the silent-clipping bug surfaced.
- Item 5's ἆποστολος (breathing + circumflex overprinted) is the case that
  makes the FULL-OVERLAY rule necessary rather than nice: the collision is
  between an overlaid mark and a base-drawn mark, so no offset table alone
  could have fixed it.

## 2. Implementation order

Font (B) -> mark geometry (C) -> the D items -> guards -> verification. B first
because C's offsets are read off the bundled font's own glyph metrics, so the
font had to be final before a single offset was written.

## 3. Section B: the font hunt (the long part)

The spec's recommendation was Noto Serif. I subset it (67 KB variable,
wght 400-700), rendered φαρισαῖος / αὐτοῦ / ῥῆμα / the isolated ῀ against Times
and the system stack at 80px, and the perispomeni came out as a TILDE — the
exact defect the spec was written to remove.

So I probed everything plausible, in this order, always as a rendered image
compared against `-apple-system` (which draws the rounded arch):

| Font | polytonic | perispomeni |
| --- | --- | --- |
| Noto Serif, Noto Sans, Noto Serif Display | yes | tilde |
| Gentium Plus, Gentium Book Plus | yes | tilde |
| Cardo, EB Garamond, Alegreya, Literata | yes | tilde |
| GFS Didot, GFS Neohellenic | yes | tilde |
| Libertinus Serif, FreeSerif, FreeSans | yes | tilde |
| DejaVu Serif, DejaVu Sans | yes | tilde |
| Old Standard TT, PT Serif, Vollkorn | **no** (Latin-only builds) | arch, but by Chrome per-glyph FALLBACK |

The last row is the trap worth recording: those three *looked* right in the
probe and are not usable at all. Their Google Fonts builds have 0/256 Greek
Extended coverage, so Chrome silently fell back to the system font for every
polytonic glyph. I only caught it by dumping cmap coverage with fontTools
instead of trusting the render.

Conclusion: the tilde IS the dominant convention in open Greek types; the arch
is Apple's (and the original ParsonsTech font's). No font satisfies the spec as
written, so the font is DERIVED — see RESULTS 2. `scripts/make-greek-font.py`
is committed so the artifact is reproducible rather than a mystery binary.

## 4. Section C: reading the table off the font

First attempt used the old measured constant (`translateY(0.08em)`, tuned on
the system stack) and the marks landed visibly low. Rather than nudge, I dumped
the precomposed composites with fontTools:

    uni1F06 (ἆ) = alpha + uni1FBF@(186,6) + tilde@(52,224)
    uni1F04 (ἄ) = alpha + uni1FBF@(119,0) + tonos@(250,0)
    uni1F08 (Ἀ) = A + uni1FBF@(52,-70)
    uni1F28 (Ἠ) = H@(119,0) + uni1FBF@(-40,-70)

Those component offsets ARE the geometry table: the designer already solved
this problem. Converting ink centres to em offsets from the base's centre gave
every constant in `app.css`, and `--my: 0` for the M1 baseline (the 0.08em nudge
was an artifact of the old font, not of the technique).

One glyph-identity find along the way: Greek composites set their acute from
`tonos` (U+0384), not from the Latin-1 `acute` (U+00B4) the chart cells carry —
different width and slope. The overlay now uses U+0384/U+1FEF so a reddened
accent is the same drawing as the one it replaces (`overlayForm` in greek.js).

Verification was a comparison grid: every real drill item rendered three ways —
precomposed, overlay superimposed on a grey precomposed ghost, overlay alone —
using the REAL `markOverlayParts` and the REAL `app.css`. 45 rows, then a 150px
zoom for each of M1-M6.

## 5. Section D: the division bug

D2 looked like a two-constant change. The measurement said otherwise: the
applied letter size did not match `rail / (probe/100 + ratio*gaps)` for any
item, and the mismatch did not converge over 3 seconds.

Cause: `bind:clientWidth` on the off-screen probe reports once, during
`font-display: block`, while the row is still laid out in the FALLBACK face. It
never re-reports the reflow when the bundled Greek font swaps in. Every row was
therefore sized from metrics about 15% too narrow, and 8 of 20 words at 320px
overflowed their rail — where `overflow-x: hidden` deletes them silently rather
than scrolling. This predates SPEC3 (the same binding shipped in SPEC2); the new
font only changed how far off the metrics were.

Fixed with an explicit `afterUpdate` measure plus a `ResizeObserver`, and a
`fitRow()` that treats the 22px gap floor as a preference the rail can veto.
A `min-width: 22px` in the CSS then re-widened the gaps after the fit and
re-created the overflow on the longest word; that floor is gone too.

## 6. Harness

`chrome-remote-interface` driving headless Chrome with an iPhone UA (no
playwright in the tree). Scripts in the session scratchpad:

- `lib.mjs` — attach/navigate/evaluate/screenshot. Navigation always goes via
  `about:blank` first (a hash-only navigation is same-document and
  `Page.loadEventFired` never resolves).
- `calib.mjs` / `zoom.mjs` — the mark-geometry comparison grids.
- `walk.mjs` — full rail walk with the injected `button { color: #007aff }`
  WebKit-blue probe, overflow check, unknown-block check, and a score-line
  check (the line must be absent before Score is pressed).
- `fitcheck.mjs` — per-item division geometry: probe width, rail width, summed
  row width, letter px, gap px, and whether the row fits.
- `offline2.mjs` — SW install, `Network.emulateNetworkConditions` offline,
  refresh on an activity route, both rails, plus a metric comparison that
  proves the BUNDLED face is in use offline rather than trusting the family
  name. `failurls.mjs` maps requestId to URL so the offline load failures can
  be named instead of assumed.
- `make-greek-font.py` — moved into `scripts/` since it is a build input.

Two harness gotchas cost time and are worth recording:

1. **A stale service worker serves the previous build.** After a rebuild the
   preview looked unchanged and the sizing numbers were frozen; the SW was
   serving the precached older bundle. Every measurement run now starts by
   unregistering SWs and deleting caches (`fresh.mjs`) — except the offline run,
   which needs them.
2. The rail walk must start from `sequence[0]` by route, not by clicking the
   first `.act-row`: at 768px the hub shows a different first row and the walk
   silently covered 18 of 20 items.
3. Node buffers stdout when it is piped, so `node script.mjs | tail` hides
   progress until exit — which made a slow offline run look like a hang, and I
   killed a healthy run because of it. Step logs go to stderr, unpiped.
4. Unregistering a service worker from a page that stays open can leave a
   registration with no active worker, after which `navigator.serviceWorker.ready`
   never resolves. Recovery is a fresh `--user-data-dir`, not a reload.

## 7. Judgement calls

Recorded in RESULTS 7 rather than duplicated here: the derived font, the
per-word division sizing (which reverses a SPEC2 decision because the spec asks
for it), the em-dash sweep scope, and the chapter-1 data findings that are the
pipeline's to fix, not mine.

## 8. The exact diff for this round

State of the working tree at the end of the session. Nothing is committed and
nothing is pushed, so this is `git diff` plus the untracked additions.

### 8.1 Inventory

```
 M buildout/CHAT-HANDOFF.md
 M scripts/check-content-shapes.mjs
 M src/app.css
 M src/components/DivideActivity.svelte
 M src/components/PlaceAccentActivity.svelte
 M src/components/RichContent.svelte
 M src/components/SelectActivity.svelte
 M src/data/chapt-02.json
 M src/data/lexicon-chapt02.json
 M src/lib/audio.js
 M src/lib/content.js
 M src/lib/greek.js
 M vite.config.js
?? buildout/5B-SPEC3-BUILD-OPUS.md
?? buildout/5B-SPEC3-RESULTS-OPUS.md
?? buildout/5B-SPEC3.md
?? scripts/make-greek-font.py
?? src/assets/
```

`src/assets/fonts/greektutor-serif-{regular,bold}.woff2` are binary (39,700 and
41,452 bytes) and `src/assets/fonts/OFL.txt` is the upstream SIL Open Font
License 1.1 verbatim; none of the three is reproduced below.

### 8.2 Code, styles, config and build guards

````diff
diff --git a/buildout/CHAT-HANDOFF.md b/buildout/CHAT-HANDOFF.md
index 49511b4..b163cb5 100644
--- a/buildout/CHAT-HANDOFF.md
+++ b/buildout/CHAT-HANDOFF.md
@@ -210,6 +210,29 @@ files carry only what a new chat needs.
   (Hebrew glosses, (Hi)/(Ni) stem labels, HebrewWord field names) —
   detect and exclude these regions.
 
+## Typography and mark-rendering canon (established 5B closeout)
+
+- TYPO POLICY A1, third extension: typographic normalization is
+  authorized alongside spellfixes — double hyphens become em dashes
+  (data-side, applied by the pipeline to all future chapters).
+- ONE GREEK FONT: a self-hosted subsetted polytonic webfont (rounded
+  perispomeni; Noto Serif source unless SPEC3 RESULTS records
+  otherwise) leads every Greek stack; Times New Roman demoted to last
+  resort. Its file ships in the app-shell precache. NO Greek surface
+  may use a different glyph source — the SPEC2 tilde saga came from a
+  two-font split.
+- MARK GEOMETRY RULES M1-M6 (formalized in 5B-SPEC3 §C, offset table
+  in the SPEC3 RESULTS): single accent centered (second vowel of
+  diphthongs); breathing+acute/grave side by side, breathing left;
+  breathing+circumflex stacked, circumflex above; diaeresis takes the
+  accent above it; capitals carry marks upper-left; iota subscript
+  never overlaid. Red-mark rendering strips ALL marks and overlays
+  the full set (target red, rest ink). These are standing rules for
+  every future chapter — never nudge-until-pretty.
+- Accent placement pools: original 20 acute items + 5 circumflex
+  extension items merged/interleaved (Nathanael-approved departure);
+  'extended: true' is provenance only, never rendered.
+
 ## Standing directives (user-set) — every phase
 
 1. Fidelity to the original: glosses, instruction text, audio
@@ -252,20 +275,20 @@ files carry only what a new chat needs.
   (pack self-containment — mirrors the ISO).
 - A_INTRO1..4 unused by design.
 
-## Immediate queue (as of 2026-07-26)
+## Immediate queue (as of 2026-07-26, evening)
 
-1. Implementer round: 5B-SPEC2.md (device-feedback corrections, first
-   round under process v2) against the replacement chapt-02.json.
-   Both models; RESULTS + BUILD docs back; grading chat runs
-   GRADER-PROMPT v2; XPATCH if justified; winner authors VERIFY2.
-2. Nathanael: VERIFY2 device pass (key items: rounded circumflex on
-   iOS, mark-only red technique, extended accent-placement items
-   keep/drop, bibliography, division-exercise ergonomics).
-3. Chapter 2 closes when VERIFY2 returns clean; then 5C: recon pass
-   chapters 3-8 + the bounded rich-text parser experiment; produce
-   5D-RECON-TASKS per process v2; PHASE5-PLAN cohort batching.
+1. Implementer round 5B-SPEC3.md (closeout: bundled Greek font, mark
+   geometry M1-M6, score-line visibility, division ergonomics)
+   against the patch3 data files. RESULTS + BUILD docs back (suffix
+   -FABLE if Fable runs it in Claude Code); grading per
+   GRADER-PROMPT v2; XPATCH if justified.
+2. Nathanael: VERIFY3 device pass (expected tiny: font on iOS, mark
+   anchors, division feel). Clean VERIFY3 = CHAPTER 2 CLOSED.
+3. Then 5C: recon chapters 3-8 + the rich-text parser experiment ->
+   5D-RECON-TASKS.md; PHASE5-PLAN cohort batching; promote the SPEC3
+   mark-geometry offset table into this file.
 4. Carried nits: Escape/initial-focus on modals; playwright-core as
-   devDependency; debug-card precache-count line (optional).
+   devDependency.
 
 ## Known open questions
 
diff --git a/scripts/check-content-shapes.mjs b/scripts/check-content-shapes.mjs
index 25f9981..ffe11e4 100644
--- a/scripts/check-content-shapes.mjs
+++ b/scripts/check-content-shapes.mjs
@@ -9,6 +9,19 @@ import { join } from 'node:path';
 const DATA = 'src/data';
 const problems = [];
 
+// Every block type RichContent.svelte dispatches on. A data file that ships a
+// type not in this list renders as a loud placeholder at runtime; here it fails
+// the build, which is where a new pipeline block type should be noticed
+// (5B-SPEC3 D4). Add the type here in the same change that adds its branch.
+const BLOCK_TYPES = new Set([
+  'heading', 'subheading', 'para', 'numbered', 'defList',
+  'biblist', 'refs', 'note', 'greekRows', 'expander'
+]);
+// "type" is also the ACTIVITY discriminator, so the activity types are listed
+// here as the known non-block use of the key. Anything else carrying a "type"
+// is a content block and must have a renderer.
+const ACTIVITY_TYPES = new Set(['contentAudio', 'select', 'spell', 'divide', 'placeAccent']);
+
 // walk every nested block array a chapter can carry (content, topics[].content,
 // expander.content, hint.content, ...) without hard-coding the nesting.
 function walk(node, path, visit) {
@@ -30,6 +43,9 @@ if (!files.length) {
 for (const file of files) {
   const data = JSON.parse(readFileSync(join(DATA, file), 'utf8'));
   walk(data, file, (block, path) => {
+    if (typeof block.type === 'string' && !ACTIVITY_TYPES.has(block.type) && !BLOCK_TYPES.has(block.type)) {
+      problems.push(`${path}: content block type "${block.type}" has no RichContent branch.`);
+    }
     if (block.type === 'biblist') {
       if (!Array.isArray(block.items) || !block.items.length) {
         problems.push(`${path}: biblist has no items array.`);
diff --git a/src/app.css b/src/app.css
index 15608e9..5ed00b6 100644
--- a/src/app.css
+++ b/src/app.css
@@ -1,5 +1,36 @@
 /* Design: clean modern take on the original's teal-and-parchment palette */
+
+/* ---- THE GREEK FACE (5B-SPEC3 B1) ----
+   One bundled, self-hosted, subsetted polytonic font for EVERY Greek surface.
+   The chapter-2 "tilde" saga was a two-font split: Times New Roman (and every
+   other Greek serif tested -- Gentium, Cardo, EB Garamond, GFS Didot, Noto
+   Serif, Libertinus, FreeSerif, DejaVu) draws the perispomeni as a TILDE, while
+   the system stack draws the rounded arch the original uses. GreekTutor Serif
+   is Noto Serif with its perispomeni redrawn as an inverted breve
+   (src/assets/fonts/NOTICE.md, scripts/make-greek-font.py), so no surface can
+   disagree with another again.
+   font-display: block -- a flash of Times Greek would be worse than a beat of
+   invisibility, and the file is precached, so the beat only exists on the very
+   first load. */
+@font-face {
+  font-family: 'GreekTutor Serif';
+  src: url('./assets/fonts/greektutor-serif-regular.woff2') format('woff2');
+  font-weight: 400;
+  font-style: normal;
+  font-display: block;
+}
+@font-face {
+  font-family: 'GreekTutor Serif';
+  src: url('./assets/fonts/greektutor-serif-bold.woff2') format('woff2');
+  font-weight: 700;
+  font-style: normal;
+  font-display: block;
+}
+
 :root {
+  /* The single Greek stack. Nothing may hand-roll its own: Times New Roman is
+     demoted to last resort so no Greek path can fall through to its tilde. */
+  --greek-font: 'GreekTutor Serif', 'SBL Greek', 'Times New Roman', Georgia, serif;
   --teal: #2a7d72;
   --teal-dark: #1f5f57;
   --parchment: #f5f2e8;
@@ -20,18 +51,18 @@
 * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
 html, body { margin: 0; padding: 0; background: var(--parchment); color: var(--ink);
   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
-.greek { font-family: 'Times New Roman', 'SBL Greek', Georgia, serif; }
+.greek { font-family: var(--greek-font); }
 button { font: inherit; cursor: pointer; }
 /* ---- Isolated marks shown outside a word (5B-SPEC2 B1) ----
    "Acute ( ´ )" must never break across lines, and the mark itself is drawn
    large: the original deliberately enlarges these glyphs and at body size a
-   breathing is indistinguishable from an acute. The mark keeps the speller
-   keyboard's font stack (.tk-key.mark) -- the one surface confirmed on device
-   to draw U+1FC0 as the rounded perispomeni rather than a tilde. */
+   breathing is indistinguishable from an acute. B2: these used to run on the
+   system stack because it was the one face drawing a rounded perispomeni. The
+   bundled font draws it too, so they join every other Greek surface. */
 .mark-group { white-space: nowrap; }
-.isolated-mark.as-mark { display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
+.isolated-mark.as-mark { display: inline-block; font-family: var(--greek-font);
   font-size: 1.45em; line-height: 1; padding: 0 0.06em; vertical-align: -0.08em; }
-.isolated-mark.greek { font-family: 'Times New Roman', 'SBL Greek', Georgia, serif; font-size: 1.15em; }
+.isolated-mark.greek { font-family: var(--greek-font); font-size: 1.15em; }
 /* ---- App shell: fixed top bar, scrolling middle, fixed bottom bar ---- */
 .app { display: flex; flex-direction: column; height: 100vh; height: 100dvh; overflow: hidden; }
 .app-main { flex: 1; min-height: 0; display: flex; }
@@ -89,14 +120,61 @@ button { font: inherit; cursor: pointer; }
 .mark-red { color: var(--mark-red); }
 .rm-cluster { position: relative; display: inline-block; }
 .rm-base { color: inherit; }
-/* Same font path as the isolated marks (the body Greek serif draws U+1FC0 as a
-   TILDE), and nudged down: a spacing mark is drawn for the tallest base it may
-   sit on, so over a lowercase vowel it lands ~0.08em high. Measured against
-   the precomposed glyphs, not guessed. */
-.rm-mark { position: absolute; left: 0; right: 0; bottom: 0; text-align: center;
-  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
-  line-height: 1.15; transform: translateY(0.08em);
-  color: var(--mark-red); pointer-events: none; }
+/* ---- MARK GEOMETRY TABLE (5B-SPEC3 C, rules M1-M6) ----
+   The overlay carries the cluster's WHOLE mark set (greek.js markOverlayParts),
+   so these offsets are the only thing deciding where marks sit -- there is no
+   second, base-drawn mark left on the vowel to collide with. This is the
+   standing rule set for chapters 3+: a new combination gets a row here, never a
+   per-word nudge.
+
+     --mx  horizontal offset from the base's centre  (+ right)
+     --my  vertical offset from the spacing glyph's natural seat (+ down)
+
+   Every constant below is READ OFF THE BUNDLED FONT rather than eyeballed: the
+   precomposed polytonic glyphs are composites (base + spacing-mark components),
+   so the type designer's own component offsets ARE the table. Divide by the
+   1000-unit em: e.g. in this font a-smooth-circumflex places the circumflex
+   224 units above its natural seat, hence the -0.224em lift in M3, and a
+   capital lowers its mark 70-82 units, hence M5's +0.075em.
+
+   M1  a single accent sits centred on the vowel, at the glyph's natural
+   height (the Greek composites all use a zero y-offset over lowercase). On a
+   diphthong the mark belongs to the SECOND vowel's cluster already, so
+   "above the second vowel" needs no rule of its own. */
+.rm-marks { position: absolute; left: 0; right: 0; bottom: 0; height: 0;
+  pointer-events: none; }
+.rm-mark { position: absolute; left: 50%; bottom: 0; display: block;
+  line-height: 1.15; white-space: pre; color: inherit;
+  --mx: 0em; --my: 0em;
+  transform: translate(calc(-50% + var(--mx)), var(--my)); }
+.rm-mark.red { color: var(--mark-red); }
+/* M2  breathing + acute/grave: SIDE BY SIDE, breathing left (ἄ, ἂ, ὕ). The
+   font straddles the vowel's centre asymmetrically -- the breathing sits
+   further out than the accent -- because the two glyphs are different widths. */
+.rm-marks.pair .rm-mark.left  { --mx: -0.11em; }
+.rm-marks.pair .rm-mark.right { --mx: 0.05em; }
+/* M3  breathing + circumflex: STACKED, breathing below, circumflex above
+   (ἆ in ἆποστολος, ἦ in ἦν). Both stay centred; only the lift changes. */
+.rm-marks.stack .rm-mark.lower { --my: 0em; }
+.rm-marks.stack .rm-mark.upper { --my: -0.224em; }
+/* M4  diaeresis + accent: the accent goes ABOVE the dots, centred (ΐ in
+   Ἀχαΐα). The dots are shorter than a breathing, so the lift is smaller than
+   M3's; the font's own dieresistonos would set the accent beside the dots
+   instead, which is not what this chapter teaches. */
+.rm-marks.diaeresis .rm-mark.lower { --my: 0em; }
+.rm-marks.diaeresis .rm-mark.upper { --my: -0.16em; }
+/* M5  capitals carry the mark set at the UPPER LEFT of (before) the letter,
+   not above it (Ἀ, Ἠ, Ἐ) -- so these anchor on the base's LEFT EDGE, not its
+   centre, and drop 0.075em to sit at cap height. A pair keeps M2's 0.16em
+   spread, just moved out in front of the letter. */
+.rm-marks.capital .rm-mark { left: 0; --mx: 0.06em; --my: 0.075em;
+  transform: translate(calc(-100% + var(--mx)), var(--my)); }
+.rm-marks.capital.pair .rm-mark.left  { --mx: -0.10em; }
+.rm-marks.capital.pair .rm-mark.right { --mx: 0.06em; }
+.rm-marks.capital.stack .rm-mark.upper,
+.rm-marks.capital.diaeresis .rm-mark.upper { --my: -0.149em; }
+/* M6  iota subscript is never overlaid: it stays in the base string, so ᾧ
+   keeps its subscript while the circumflex is lifted. Nothing to declare. */
 /* Revealed after a one-attempt item is finalized: the gloss and, for the
    Accent Rule drill, the properly accented form. */
 .reveal-row { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: center;
@@ -115,13 +193,9 @@ button { font: inherit; cursor: pointer; }
 @media (min-width: 560px) {
   .controls.grouped { grid-template-columns: repeat(3, minmax(0, 1fr)); max-width: 520px; }
 }
-/* Live score: always-on under the scored surfaces, updating on every answer. */
+/* Score line: hidden until the first Score press (D1), live from then on. */
 .live-score { margin-top: 10px; padding: 8px 10px; border-radius: 8px; background: #fffdf3;
   font-size: 0.95rem; }
-/* Beyond the original's twenty items; labelled so it never reads as fidelity. */
-.extended-divider { margin: 0 0 12px; padding: 8px 10px; border-radius: 8px;
-  background: #fff8d6; border-left: 4px solid var(--teal); color: var(--accent-ink);
-  font-size: 0.85rem; font-weight: 700; text-align: center; }
 /* Translate: the gloss line under the prompt word. */
 .gloss-line { text-align: center; color: var(--accent-ink); font-size: 1.05rem; margin: -6px 0 6px; }
 .btn { background: var(--teal); color: white; border: none; border-radius: 10px;
@@ -224,6 +298,11 @@ button { font: inherit; cursor: pointer; }
 .rc-below { margin-top: 14px; }
 .rc-heading { text-align: center; font-size: 1.2rem; font-weight: 500; margin: 14px 0 10px; color: var(--teal-dark); }
 .rc-heading:first-child { margin-top: 0; }
+/* D4: a subheading owns its line, left-aligned in the heading green, with the
+   content that follows sitting flush beneath it (no hanging indent). */
+.rc-subheading { text-align: left; font-size: 1.02rem; font-weight: 700;
+  color: var(--accent-ink); margin: 14px 0 2px; }
+.rc-subheading:first-child { margin-top: 0; }
 .rc-para { margin: 0 0 10px; }
 .rc-preamble { margin: 0 0 6px; }
 .rc-list { margin: 0 0 10px; padding-left: 1.5em; }
@@ -456,7 +535,9 @@ button { font: inherit; cursor: pointer; }
 .tk-key { background: white; border: 1px solid #ddd6c2; border-radius: 8px; padding: 10px 0;
   font-size: 1.3rem; min-height: 44px; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
 .tk-key:active { background: #eef4f2; border-color: var(--teal); }
-.tk-key.mark { font-size: 1.4rem; color: var(--teal-dark); }
+/* B2: the diacritic tiles are Greek marks, so they take the Greek face too --
+   they were the last surface still drawing marks from a different source. */
+.tk-key.mark { font-family: var(--greek-font); font-size: 1.4rem; color: var(--teal-dark); }
 .tk-edit { display: flex; gap: 8px; justify-content: center; margin-top: 8px; }
 .spell-answer { text-align: center; margin-top: 12px; font-size: 1.3rem; }
 .spell-answer .label { font-size: 0.75rem; color: var(--teal-dark); font-weight: 700; text-transform: uppercase; margin-right: 8px; }
@@ -482,9 +563,13 @@ button { font: inherit; cursor: pointer; }
 .exercise-answer .greek { font-size: 1.45rem; }
 /* C2: numbered buttons ABOVE the letters, each with an arrow pointing down
    into its gap, exactly as the original. The rail is measured (see the probe
-   in DivideActivity) so the pool's longest word fills the width and every word
-   renders at that one size. */
-.divide-probe { position: absolute; visibility: hidden; white-space: nowrap; pointer-events: none;
+   in DivideActivity) and each word is fitted to it, so every word fills the
+   width and its gap buttons grow with it (D2). */
+/* Off-screen, NOT visibility:hidden: an invisible probe was not being
+   re-laid-out when the bundled Greek font swapped in, so its measured width
+   stayed at the fallback face's metrics. Parked far off-canvas instead, where
+   it lays out and reflows like any painted text. */
+.divide-probe { position: absolute; white-space: nowrap; pointer-events: none;
   left: -9999px; top: 0; }
 .divide-rail { width: 100%; min-width: 0; }
 .divide-word { display: flex; align-items: flex-end; justify-content: center; width: 100%; min-width: 0;
@@ -492,11 +577,18 @@ button { font: inherit; cursor: pointer; }
 .divide-letter { flex: 0 0 auto; min-width: 0; border: none; background: transparent; padding: 0;
   font-size: var(--divide-size); line-height: 1.1; color: var(--ink); }
 .divide-letter.greek-say { display: inline-block; color: var(--link); text-align: center; }
+/* D2: the numbered button IS the tap target, and it takes the whole gap
+   column, label sized off the column width -- so a wider column means a
+   genuinely bigger button, not a bigger gap around the same small chip.
+   No meaningful min-width here: DivideActivity fits the row to the rail and
+   owns the gap width. A CSS floor re-widened the gaps after that fit and
+   pushed the longest words past the rail, where overflow-x:hidden ate them. */
 .divide-gap { flex: 0 0 var(--gap-size); width: var(--gap-size); min-width: 11px;
-  display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 2px;
+  display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 3px;
   border: none; background: transparent; color: #9a927c; padding: 0; }
-.divide-gap .gap-num { display: block; width: 100%; border: 1.5px solid #cfc6aa; border-radius: 6px;
-  background: #fffdf3; color: var(--ink); font-size: 0.68rem; font-weight: 700; line-height: 1.7; }
+.divide-gap .gap-num { display: block; width: 100%; border: 1.5px solid #cfc6aa; border-radius: 8px;
+  background: #fffdf3; color: var(--ink); font-weight: 700;
+  font-size: calc(var(--gap-size) * 0.46); line-height: 1.8; }
 .divide-gap .gap-arrow { display: block; height: calc(var(--divide-size) * 0.9); width: 100%; }
 .divide-gap.selected { color: var(--link); }
 .divide-gap.selected .gap-num { border-color: var(--link); background: #e8f0fb; color: var(--link); }
@@ -599,7 +691,7 @@ button, a, input, select, textarea, label,
 
 /* Inline tappable Greek inside prose (Six Points greekTaps). */
 .greek-tap { background: transparent; border: none; padding: 0; font: inherit;
-  font-family: 'Times New Roman', 'SBL Greek', Georgia, serif; font-size: 1.15em;
+  font-family: var(--greek-font); font-size: 1.15em;
   color: var(--link); cursor: pointer; }
 
 /* Six Points letters-list rows: a category label + a row of tappable chips. */
diff --git a/src/components/DivideActivity.svelte b/src/components/DivideActivity.svelte
index 6b42552..336cd50 100644
--- a/src/components/DivideActivity.svelte
+++ b/src/components/DivideActivity.svelte
@@ -4,15 +4,14 @@
   //
   // LAYOUT (5B-SPEC2 C2) follows the original: a numbered BUTTON above each
   // gap with an arrow pointing down into the space between the two letters.
-  // Sizing is breakpoint-static, not per-word -- the whole pool is measured
-  // once by its LONGEST word so the letters are as large as that word allows
-  // and every other word renders at the same size.
+  // Sizing is per-word and measured (5B-SPEC3 D2): each word is fitted to the
+  // rail so its letters and its gap buttons are as large as that word allows.
   //
   // ANSWER POLICY (5B patch 2a): answerPolicy.attemptsPerItem === 1 means
   // Check Answer finalizes the item right or wrong, reveals the hyphen-joined
   // divided form, and auto-advances after autoAdvanceMs. The timer is cancelled
   // on manual Previous/Next and on unmount. Completion = all items ATTEMPTED.
-  import { onDestroy } from 'svelte';
+  import { afterUpdate, onDestroy, onMount } from 'svelte';
   import { play } from '../lib/audio.js';
   import { randomFeedback, resolveHintBlocks } from '../lib/content.js';
   import { dividedForm, splitGraphemes } from '../lib/greek.js';
@@ -33,31 +32,80 @@
   let answered = false;
   let showAnswer = false;
   let showHint = false;
-  let showScore = !!activity.ui?.liveScore;
+  // D1: hidden until the first Score press; ui.liveScore governs whether the
+  // revealed line keeps updating, not whether it starts open.
+  let showScore = false;
   let pronounceEach = activity.ui?.defaults?.pronounceEach ?? false;
   let advanceTimer = null;
   const attemptedItems = new Set();
   const results = new Map();
 
-  // Fat-finger sizing (C2). The row is measured, not guessed: a hidden probe
-  // renders the pool's longest word at a reference size, so the glyphs' real
-  // advance widths -- not a character count -- decide how large the letters can
-  // be. `railWidth` re-measures at every breakpoint; the WORD does not change
-  // the size, so stepping through the pool never resizes anything.
+  // Fat-finger sizing (C2, reworked by 5B-SPEC3 D2). The row is measured, not
+  // guessed: a hidden probe renders the word at a reference size, so the
+  // glyphs' real advance widths -- not a character count -- decide how large
+  // the letters can be, and `railWidth` re-measures at every breakpoint.
+  //
+  // D2 changes two things. The gap column is 0.68 of the letter size (was
+  // 0.34), so a gap BUTTON is about twice as wide; and the measurement now
+  // follows the CURRENT word rather than the pool's longest, per the spec's
+  // "the gap buttons scale with the word ... filling available width". C2 sized
+  // the whole pool by its longest word so stepping never resized the row; that
+  // bought visual stability at the cost of leaving a three-letter word using a
+  // third of the screen, which is exactly what VERIFY2 item 3 objected to.
+  // Tap targets win: ἐγώ now fills the rail, and φαρισαῖος -- 9 clusters and 8
+  // gaps in 330px -- is the arithmetic floor, not a sizing choice.
   const PROBE_PX = 100;
-  const GAP_RATIO = 0.34;          // gap column as a share of the letter size
+  const GAP_RATIO = 0.68;          // gap column as a share of the letter size
   const MAX_LETTER_PX = 76;        // stop growing on tablet widths
-  const longest = items.reduce((best, item) => {
-    const count = splitGraphemes(item.greek).length;
-    return count > best.count ? { count, greek: item.greek } : best;
-  }, { count: 0, greek: '' });
+  const MIN_GAP_PX = 22;           // preferred floor for a gap button
+  const MIN_LETTER_PX = 20;        // below this the word stops being readable
   let railWidth = 0;
+  let probeEl;
   let probeWidth = 0;
-  $: letterSize = (railWidth > 0 && probeWidth > 0 && longest.count > 0)
-    ? Math.max(16, Math.min(MAX_LETTER_PX,
-        railWidth / (probeWidth / PROBE_PX + GAP_RATIO * Math.max(longest.count - 1, 0))))
-    : 24;
-  $: gapSize = Math.max(11, letterSize * GAP_RATIO);
+  let fontEpoch = 0;
+  // The probe is measured by hand, NOT with bind:clientWidth. That binding
+  // reported the width once, while font-display:block still had the row laid
+  // out in the fallback face, and never reported the reflow when the bundled
+  // Greek font swapped in -- so every row was sized from metrics ~15% too
+  // narrow and the longest words silently clipped (overflow-x is hidden
+  // app-wide, so nothing errors and nothing scrolls). Two mechanisms cover it:
+  // afterUpdate for the render-ordering case (a fresh item's letters reach the
+  // DOM before its probe has been remeasured), and the ResizeObserver in
+  // onMount for the font swap. The guard stops the re-render loop after one
+  // pass.
+  afterUpdate(() => {
+    if (!probeEl) return;
+    const width = probeEl.getBoundingClientRect().width;
+    if (Math.abs(width - probeWidth) > 0.5) probeWidth = width;
+  });
+  $: letterCount = letters.length;
+  // fontEpoch is a dependency, not an input: bumping it when document.fonts
+  // settles forces one more render, and afterUpdate above then re-measures the
+  // probe against the face that actually shipped.
+  $: sizing = fitRow(railWidth, probeWidth, letterCount, fontEpoch);
+  $: letterSize = sizing.letter;
+  $: gapSize = sizing.gap;
+
+  // The row must always FIT: overflow-x is hidden app-wide, so a row that is
+  // too wide is not scrollable, it is deleted. So the gap floor is a
+  // preference, not a guarantee -- a nine-cluster word at 320px cannot have
+  // both 22px targets and readable letters, and the letters win at that point.
+  function fitRow(rail, probe, count) {   // fontEpoch is a trigger only
+    const gaps = Math.max(count - 1, 0);
+    if (!(rail > 0 && probe > 0 && count > 0)) return { letter: 24, gap: MIN_GAP_PX };
+    const ratio = probe / PROBE_PX;
+    // Budget slightly under the rail: per-glyph rounding accumulates across a
+    // long word, and being 2px over means 2px CLIPPED, not 2px scrolled.
+    rail = rail * 0.98;
+    let letter = Math.min(MAX_LETTER_PX, rail / (ratio + GAP_RATIO * gaps));
+    let gap = letter * GAP_RATIO;
+    if (gap < MIN_GAP_PX && gaps > 0) {
+      // Buy the floor back out of the letters, but only while they stay legible.
+      const shrunk = (rail - MIN_GAP_PX * gaps) / ratio;
+      if (shrunk >= MIN_LETTER_PX) { letter = shrunk; gap = MIN_GAP_PX; }
+    }
+    return { letter: Math.max(MIN_LETTER_PX, letter), gap: Math.max(11, gap) };
+  }
 
   $: item = items[itemIndex] || null;
   $: letters = splitGraphemes(item && item.greek);
@@ -157,13 +205,28 @@
   // the one-syllable bar is the answer.
   $: canCheck = !pending && !answered && (oneSyllable || selected.size > 0);
 
-  onDestroy(() => clearTimeout(advanceTimer));
+  let probeObserver = null;
+  onMount(() => {
+    if (typeof document !== 'undefined' && document.fonts) {
+      document.fonts.ready.then(() => { fontEpoch += 1; });
+    }
+    if (typeof ResizeObserver === 'undefined' || !probeEl) return;
+    probeObserver = new ResizeObserver(() => {
+      probeWidth = probeEl.getBoundingClientRect().width;
+    });
+    probeObserver.observe(probeEl);
+  });
+
+  onDestroy(() => {
+    clearTimeout(advanceTimer);
+    if (probeObserver) probeObserver.disconnect();
+  });
 </script>
 
 <div class="card divide-activity">
-  <!-- Off-screen probe: the pool's longest word at a known size. Its measured
-       width is what the live row is scaled from. -->
-  <span class="divide-probe greek" style="font-size:{PROBE_PX}px" bind:clientWidth={probeWidth}>{longest.greek}</span>
+  <!-- Off-screen probe: the CURRENT word at a known size. Its measured width is
+       what the live row is scaled from, so the row re-fits on every item. -->
+  <span class="divide-probe greek" style="font-size:{PROBE_PX}px" aria-hidden="true" bind:this={probeEl}>{item ? item.greek : ''}</span>
   {#if pending}
     <div class="pending-verification" role="status">Syllable-division word {itemIndex + 1} is pending content verification.</div>
   {:else}
diff --git a/src/components/PlaceAccentActivity.svelte b/src/components/PlaceAccentActivity.svelte
index 44c5eea..ed02c59 100644
--- a/src/components/PlaceAccentActivity.svelte
+++ b/src/components/PlaceAccentActivity.svelte
@@ -19,12 +19,12 @@
   export let chapter;
   export let activity;
 
-  // EXTENDED PRACTICE (5B-SPEC2 C7): the original's 20-item pool is acute-only,
-  // so the data appends circumflex-bearing chapter words as clearly-labelled
-  // extra items. They share the scoring line but NOT the completion bar --
-  // finishing the chapter still means finishing the original twenty.
-  const baseWords = activity.items || [];
-  const words = [...baseWords, ...(activity.extendedItems || [])];
+  // POOL (5B-SPEC3 A1/item 7): the five circumflex extension items are now
+  // MERGED and interleaved into the authored pool at fixed positions, with no
+  // banner -- a labelled block at the end made every extension item deducibly
+  // a circumflex. The items carry `extended: true` for provenance only; it is
+  // never rendered and never affects scoring, and completion is all 25.
+  const words = activity.items || [];
   let wordIndex = 0;
   let accentType = null;
   let accentPosition = null;
@@ -35,7 +35,9 @@
   let answered = false;
   let showAnswer = false;
   let showHint = false;
-  let showScore = !!activity.ui?.liveScore;
+  // D1: hidden until the first Score press; ui.liveScore governs whether the
+  // revealed line keeps updating, not whether it starts open.
+  let showScore = false;
   let pronounceEach = activity.ui?.defaults?.pronounceEach ?? false;
   let advanceTimer = null;
   const attemptedWords = new Set();
@@ -48,7 +50,6 @@
   $: oneAttempt = activity.answerPolicy?.attemptsPerItem === 1;
   $: autoAdvanceMs = activity.answerPolicy?.autoAdvanceMs ?? 900;
   $: revealed = answered && oneAttempt;
-  $: isExtended = wordIndex >= baseWords.length;
   // A root identical to the answer form would print the answer above the slots.
   $: showRootWord = !!(word && word.root)
     && (!word.answerForm || word.root.normalize('NFC') !== word.answerForm.normalize('NFC'));
@@ -100,8 +101,7 @@
     feedbackKind = ok ? 'ok' : 'bad';
     if (ok || oneAttempt) {
       answered = true;
-      // Completion counts the ORIGINAL pool only; the extension is optional.
-      if (baseWords.every((_, index) => attemptedWords.has(index))) markCompleted(activity.id);
+      if (attemptedWords.size === words.length) markCompleted(activity.id);
       results.set(wordIndex, {
         accentType,
         accentPosition,
@@ -123,13 +123,12 @@
 </script>
 
 <div class="card accent-activity">
-  {#if isExtended}
-    <div class="extended-divider">Extended practice — not in the original</div>
-  {/if}
   <!-- The header exists to show the ROOT an inflected form derives from
-       (Βαπτίζω -> βάπτισαι). On the extended items the root IS the answer form,
-       so printing it accented would show the learner both the accent type and
-       its position before they choose. Those items show the gloss alone. -->
+       (Βαπτίζω -> βάπτισαι). On the merged circumflex items the root IS the
+       answer form, so printing it accented would show the learner both the
+       accent type and its position before they choose. Those items show the
+       gloss alone -- which is also what keeps them indistinguishable from the
+       original twenty now that the banner is gone. -->
   {#if word && (showRootWord || word.rootGloss)}
     <div class="accent-root">
       <div class="label">{showRootWord ? (activity.ui?.header || 'Root Greek Word') : 'Word Meaning'}</div>
@@ -193,9 +192,7 @@
     {#if word?.ref}<span class="exercise-ref">{word.ref}</span>{/if}
   </div>
   {#if showScore}<div class="scorebox live-score">{scoreLine}</div>{/if}
-  <div class="scorebox exercise-count">
-    {wordIndex + 1} of {words.length}{#if activity.extendedItems?.length}&nbsp;({baseWords.length} in the original){/if}
-  </div>
+  <div class="scorebox exercise-count">{wordIndex + 1} of {words.length}</div>
 </div>
 
 {#if showHint && hintBlocks.length}
diff --git a/src/components/RichContent.svelte b/src/components/RichContent.svelte
index cbe11d7..8c64fdf 100644
--- a/src/components/RichContent.svelte
+++ b/src/components/RichContent.svelte
@@ -4,8 +4,9 @@
   // is pedagogy: headings, hanging-indent bibliographies, aligned definition
   // rows and underlined list lead-ins are all load-bearing, not decoration.
   //
-  // Block types: heading | para | numbered | defList | biblist | refs | note |
-  // greekRows | expander.
+  // Block types: heading | subheading | para | numbered | defList | biblist |
+  // refs | note | greekRows | expander. An unknown type renders LOUD (see the
+  // dispatch's final else) rather than vanishing.
   // Trailing { greek, caption?, audio? } "example" objects render in the Greek
   // font and play their clip on tap. defList rows [term, value, audio?] play
   // the row's clip when present.
@@ -95,6 +96,13 @@
     {#if b.type === 'heading'}
       <div class="rc-heading"><Marked text={b.text} /></div>
 
+    {:else if b.type === 'subheading'}
+      <!-- D4: a run-in label promoted to its own line (Grammar Review Nouns:
+           "Gender:" / "Number:" / "Case:"). Left-aligned heading green, and the
+           prose under it is an ordinary para -- no hanging indent, which is
+           what made the two-column defList wrong for this content. -->
+      <div class="rc-subheading"><Marked text={b.text} /></div>
+
     {:else if b.type === 'para'}
       <p class="rc-para"><Marked text={b.text} /></p>
       {#if b.example}
@@ -286,6 +294,14 @@
 
     {:else if b.type === 'note'}
       <div class="note"><Marked text={b.text} /></div>
+
+    {:else}
+      <!-- Unknown block type. Silence here would DELETE authored teaching
+           content with nothing to notice (the biblist lesson: a shape failure
+           that only fails visually needs a loud failure). The build-time twin
+           is scripts/check-content-shapes.mjs, which fails the build on any
+           type this dispatch does not handle. -->
+      <div class="pending-verification compact" role="status">Unsupported content block "{b.type}" — renderer needs updating.</div>
     {/if}
   {/each}
 </div>
diff --git a/src/components/SelectActivity.svelte b/src/components/SelectActivity.svelte
index 0eb0eb9..f72c879 100644
--- a/src/components/SelectActivity.svelte
+++ b/src/components/SelectActivity.svelte
@@ -61,7 +61,10 @@
     attemptedItems.clear();
     results.clear();
     pronounceEach = activity.ui?.defaults?.pronounceEach ?? true;
-    showScore = !!activity.ui?.liveScore;
+    // D1: the score line starts HIDDEN on every scored surface. ui.liveScore
+    // says the line updates live once revealed, not that it opens by itself --
+    // Score is what reveals it, as in the original, and toggles it after.
+    showScore = false;
     clearTimeout(advanceTimer);
     maybePronounce();
   }
@@ -200,7 +203,10 @@
     {#if redParts}
       <!-- Still displayed Greek, so still a greek-say tap (directive 9); the
            asked-about mark simply overrides the blue with red. -->
-      <button class="prompt greek greek-say red-mark" disabled={!current.promptAudio} on:click={() => current.promptAudio && play(current.promptAudio)}>{#each redParts as part}{#if part.overlay}<span class="rm-cluster"><span class="rm-base">{part.base}</span><span class="rm-mark">{part.overlay}</span></span>{:else if part.red}<span class="mark-red">{part.text}</span>{:else}{part.text}{/if}{/each}</button>
+      <!-- The rendered cluster is base-minus-marks plus positioned mark glyphs,
+           which reads as an unaccented word to a screen reader; the label
+           restores the real prompt. -->
+      <button class="prompt greek greek-say red-mark" aria-label={current.prompt} disabled={!current.promptAudio} on:click={() => current.promptAudio && play(current.promptAudio)}>{#each redParts as part}{#if part.marks}<span class="rm-cluster"><span class="rm-base">{part.base}</span><span class="rm-marks {part.layout}" class:capital={part.capital} aria-hidden="true">{#each part.marks as mark}<span class="rm-mark {mark.slot}" class:red={mark.red}>{mark.glyph}</span>{/each}</span></span>{:else if part.red}<span class="mark-red">{part.text}</span>{:else}{part.text}{/if}{/each}</button>
     {:else if promptIsGreek && current.promptAudio}
       <button class="prompt greek greek-say" on:click={() => play(current.promptAudio)}>{current.prompt}</button>
     {:else if current.underline && sentenceParts(current.prompt, current.underline)}
diff --git a/src/lib/audio.js b/src/lib/audio.js
index 5357238..9c53f72 100644
--- a/src/lib/audio.js
+++ b/src/lib/audio.js
@@ -79,7 +79,7 @@ export async function play(id) {
   //    LAW — toast iff no audio).
   if (!blob) {
     if (toastCallback) {
-      toastCallback(`Audio not found: ${src} -- add the audio pack to public/audio/`);
+      toastCallback(`Audio not found: ${src} — add the audio pack to public/audio/`);
     }
     return false;
   }
diff --git a/src/lib/content.js b/src/lib/content.js
index 3097b61..b0ad50e 100644
--- a/src/lib/content.js
+++ b/src/lib/content.js
@@ -266,7 +266,7 @@ export function resolveItems(chapter, activity) {
           meta: { ...lemma, ref: item.ref }
         } : { display: item.ref, secondary: '(missing lemma)', audio: null, meta: {} };
       }
-      return { display: item.display || '(Greek text -- extraction pending)', secondary: stripMarkup(item.answer) || '',
+      return { display: item.display || '(Greek text — extraction pending)', secondary: stripMarkup(item.answer) || '',
                audio: item.audio || null, meta: item };
     });
   }
diff --git a/src/lib/greek.js b/src/lib/greek.js
index 5168f7f..76bbf9c 100644
--- a/src/lib/greek.js
+++ b/src/lib/greek.js
@@ -94,6 +94,19 @@ export function combiningForMarkName(name) { return MARK_BY_NAME[name] || null;
 
 export function spacingForm(mark) { return SPACING_FOR_COMBINING[mark] || mark; }
 
+// The overlay (below) replaces a mark the BASE would otherwise have drawn, so
+// it must use the very glyph the precomposed form uses. Greek text sets its
+// acute and grave from U+0384/U+1FEF -- narrower and steeper than the Latin-1
+// U+00B4/U+0060 the chart cells carry -- and a swap here is visible at prompt
+// size. The other four are the same drawing either way.
+const OVERLAY_FOR_COMBINING = {
+  ...SPACING_FOR_COMBINING,
+  '́': '΄',   // acute  -> Greek tonos, not U+00B4
+  '̀': '`'    // grave  -> Greek varia, not U+0060
+};
+
+export function overlayForm(mark) { return OVERLAY_FOR_COMBINING[mark] || spacingForm(mark); }
+
 // Replace any combining mark in an isolated (base-less) string with its
 // spacing twin. The Accent Possibilities chart's "Long Ultima" ultima cell
 // still ships combining acute/grave; rendering them as-is is unreadable.
@@ -129,18 +142,30 @@ export function firstAccentCluster(text) {
   return { index: -1, mark: null };
 }
 
+// ---- MARK GEOMETRY (5B-SPEC3 C, rules M1-M6) ----
+//
 // Marking Recognition / Accent Rule ask about ONE mark and draw it red.
 // Colouring the mark INLINE does not work: browsers keep shaping across an
 // inline boundary that differs only in colour, so the mark glyph is painted
 // with the BASE run's colour (verified by screenshot in the 5B patch -- the
-// DOM colour was right, the pixels were not). 5B-SPEC2 C5 settles it: render
-// the target cluster's BASE with the mark removed and OVERLAY the mark as a
-// free-standing spacing glyph, absolutely positioned over the base. No inline
-// boundary, so nothing to shape across.
+// DOM colour was right, the pixels were not). 5B-SPEC2 C5 settled the fix:
+// render the base without the mark and OVERLAY the mark as a free-standing
+// spacing glyph. 5B-SPEC3 C closes the hole that left: mixing an overlaid mark
+// with marks still drawn by the base put two glyphs in one place on every
+// multi-mark cluster (breathing + acute collided on anthropou/adelphos/akouo;
+// circumflex sat on the breathing in apostolos).
+//
+// FULL-OVERLAY RULE: if any mark in a cluster must be coloured, ALL of that
+// cluster's marks come off the base and the whole set is overlaid -- target in
+// --mark-red, the rest in ink. Nothing is then drawn twice, and the positions
+// come from one table (M1-M6, keyed by `layout` + `slot` below and realised as
+// em offsets in app.css) rather than per-word nudging.
 //
 // Returns render segments in source order:
 //   { text }                     plain ink run
-//   { base, overlay }            the target cluster, split for the overlay
+//   { base, marks, layout }      the target cluster: base stripped of its marks
+//                                (iota subscript stays -- M6), plus the mark set
+//                                as { glyph, kind, slot, red } in source order
 //   { text, red: true }          the whole cluster reddens because it IS the
 //                                mark (apostrophe, colon, question) -- there is
 //                                no base to separate it from
@@ -150,6 +175,44 @@ export function firstAccentCluster(text) {
 // alpha, while its circumflex sits on 7). Reddening it would tell the learner
 // the answer is "Circumflex" while the red sits on an unmarked letter, so the
 // cluster renders plain: absent signal beats false signal (XPATCH1).
+const MARK_KIND = {
+  '̓': 'breathing',   // smooth breathing / coronis (U+0343 decomposes here)
+  '̔': 'breathing',   // rough breathing
+  '́': 'accent',
+  '̀': 'accent',
+  '͂': 'circumflex',
+  '̈': 'diaeresis'
+};
+// Iota subscript is part of the BASE rendering and is never lifted (M6).
+const IOTA_SUBSCRIPT = 'ͅ';
+
+// The one place the M1-M5 arrangement is decided. `layout` picks the geometry
+// class; `slot` picks each mark's position within it.
+//   M1 single      -> layout 'single', slot 'only'   (centred; on a diphthong
+//                     the mark already belongs to the SECOND vowel's cluster,
+//                     so "above the second vowel" needs no special case)
+//   M2 breath+acute/grave -> 'pair',  slots 'left' (breathing) / 'right'
+//   M3 breath+circumflex  -> 'stack', slots 'lower' (breathing) / 'upper'
+//   M4 diaeresis+accent   -> 'diaeresis', slots 'lower' (dots) / 'upper'
+//   M5 capital base       -> the same layout, flagged `capital`: the set moves
+//                            to the upper LEFT of the letter instead of above it
+function arrangeMarks(kinds) {
+  const has = kind => kinds.includes(kind);
+  if (kinds.length < 2) return { layout: 'single', slots: kinds.map(() => 'only') };
+  // M4 is its own case, not a variant of M3: the dots are shorter than a
+  // breathing, so the accent above them needs a different lift.
+  const layout = has('diaeresis') ? 'diaeresis'
+    : (has('breathing') && has('accent')) ? 'pair'
+    : 'stack';
+  return {
+    layout,
+    slots: kinds.map(kind => {
+      if (layout === 'pair') return kind === 'breathing' ? 'left' : 'right';
+      return kind === 'breathing' || kind === 'diaeresis' ? 'lower' : 'upper';
+    })
+  };
+}
+
 export function markOverlayParts(text, redIndex, preferredMark) {
   const clusters = splitGraphemes(text);
   const parts = [];
@@ -161,7 +224,7 @@ export function markOverlayParts(text, redIndex, preferredMark) {
   clusters.forEach((cluster, index) => {
     if (index + 1 !== redIndex) { pushText(cluster, false); return; }
     const chars = Array.from(cluster.normalize('NFD'));
-    const marks = chars.filter(char => SPACING_FOR_COMBINING[char]);
+    const marks = chars.filter(char => MARK_KIND[char]);
     const target = (preferredMark && marks.includes(preferredMark)) ? preferredMark : marks[0];
     if (!target) {
       // No combining mark to lift off. Either the cluster IS the mark
@@ -171,12 +234,20 @@ export function markOverlayParts(text, redIndex, preferredMark) {
       pushText(cluster, !/\p{L}/u.test(cluster));
       return;
     }
-    let dropped = false;
-    const base = chars.filter(char => {
-      if (!dropped && char === target) { dropped = true; return false; }
-      return true;
-    }).join('').normalize('NFC');
-    parts.push({ base, overlay: spacingForm(target) });
+    const base = chars.filter(char => !MARK_KIND[char]).join('').normalize('NFC');
+    const kinds = marks.map(mark => MARK_KIND[mark]);
+    const { layout, slots } = arrangeMarks(kinds);
+    let reddened = false;
+    parts.push({
+      base,
+      layout,
+      capital: /\p{Lu}/u.test(base.replace(IOTA_SUBSCRIPT, '')),
+      marks: marks.map((mark, position) => {
+        // Exactly one mark is the question, even if the cluster repeats a kind.
+        const red = !reddened && mark === target && (reddened = true);
+        return { glyph: overlayForm(mark), kind: kinds[position], slot: slots[position], red };
+      })
+    });
   });
   return parts;
 }
diff --git a/vite.config.js b/vite.config.js
index 539526c..50b3ed8 100644
--- a/vite.config.js
+++ b/vite.config.js
@@ -21,7 +21,7 @@ export default defineConfig({
       manifest: {
         name: 'Greek Tutor',
         short_name: 'GreekTutor',
-        description: 'Learn Koine Greek -- offline-first port of the ParsonsTech Greek Tutor',
+        description: 'Learn Koine Greek — offline-first port of the ParsonsTech Greek Tutor',
         theme_color: '#2a7d72',
         background_color: '#f5f2e8',
         display: 'standalone',
````

### 8.3 New files

````diff
diff --git a/scripts/make-greek-font.py b/scripts/make-greek-font.py
new file mode 100644
index 0000000..c52472d
--- /dev/null
+++ b/scripts/make-greek-font.py
@@ -0,0 +1,134 @@
+#!/usr/bin/env python3
+"""Build the bundled Greek webfont (5B-SPEC3 B1).
+
+WHY THIS SCRIPT EXISTS. The spec asks for a self-hosted polytonic webfont whose
+perispomeni is the ROUNDED (inverted-breve) mark rather than a tilde. No open
+polytonic font draws it that way: Noto Serif/Sans, Gentium Plus, Gentium Book
+Plus, Cardo, EB Garamond, GFS Didot, GFS Neohellenic, Literata, Libertinus
+Serif, FreeSerif/FreeSans and DejaVu Serif/Sans were each rendered and every one
+draws U+1FC0 as a tilde -- that IS the dominant Greek typographic convention.
+The rounded form the original ParsonsTech font uses is what Apple's system face
+draws, and it cannot be bundled.
+
+So the font is DERIVED, not merely subset. In Noto Serif every perispomeni-
+bearing glyph is a composite over one shared `tilde` component, and the font
+already contains a drawn arch: `uni0311`, the combining inverted breve. This
+script redraws `tilde` as that arch, stretched to the tilde's exact bounding box
+so every composite's existing offset still lands, which reaches all 119
+composites at once without touching a single offset.
+
+Output: src/assets/fonts/greektutor-serif-{regular,bold}.woff2, subset to the
+ranges the app actually renders. Requires fontTools + brotli:
+    pip install fonttools brotli
+    python3 scripts/make-greek-font.py path/to/NotoSerif[wdth,wght].ttf
+The upstream source is Google's Noto Serif (OFL 1.1, no reserved font name);
+its licence ships beside the output as OFL.txt, with the derivation recorded in
+NOTICE.md.
+"""
+
+import sys
+from pathlib import Path
+
+from fontTools.misc.transform import Transform
+from fontTools.pens.transformPen import TransformPen
+from fontTools.pens.ttGlyphPen import TTGlyphPen
+from fontTools.subset import Subsetter, Options
+from fontTools.ttLib import TTFont
+from fontTools.varLib import instancer
+
+# The app renders Greek, Latin labels inside .greek spans, the spacing marks the
+# isolated-mark and red-overlay paths use (U+00B4 U+0060 U+00A8 U+1FBD/1FBF/
+# 1FC0/1FFE), the Greek colon (U+00B7) and question mark (U+003B), and em/en
+# dashes. Combining marks are kept so an NFD string can never fall through.
+UNICODES = (
+    "U+0020-007E,U+00A0-00FF,U+0300-036F,U+0370-03FF,U+1F00-1FFF,"
+    "U+2010-2015,U+2018-201D,U+2026,U+2032-2033"
+)
+FAMILY = "GreekTutor Serif"
+OUT_DIR = Path("src/assets/fonts")
+
+def parse_unicodes(spec):
+    """"U+0020-007E,U+00B4" -> the codepoints it names."""
+    out = []
+    for part in spec.split(","):
+        part = part.strip().replace("U+", "")
+        if "-" in part:
+            lo, hi = part.split("-")
+            out.extend(range(int(lo, 16), int(hi, 16) + 1))
+        else:
+            out.append(int(part, 16))
+    return out
+
+
+def build_arch(font):
+    """Redraw the `tilde` glyph as the font's own inverted breve, stretched to
+    the tilde's exact bounding box so every composite's component offset still
+    lands where it did. Every perispomeni in the font is a composite over this
+    one glyph, so the arch reaches all 90 of them at once.
+
+    Scope note: the same glyph backs Latin a-tilde / n-tilde / o-tilde and
+    U+02DC, which therefore also become arches IN THIS FONT. Nothing in the app
+    renders those inside a .greek span, and the body face is untouched."""
+    glyf = font["glyf"]
+    tilde, breve = glyf["tilde"], glyf["uni0311"]
+    tilde.recalcBounds(glyf)
+    breve.recalcBounds(glyf)
+    scale = (tilde.xMax - tilde.xMin) / (breve.xMax - breve.xMin)
+    shift = tilde.xMin - breve.xMin * scale
+    pen = TTGlyphPen(font.getGlyphSet())
+    font.getGlyphSet()["uni0311"].draw(TransformPen(pen, Transform(scale, 0, 0, 1, shift, 0)))
+    glyf["tilde"] = pen.glyph()
+    glyf["tilde"].recalcBounds(glyf)
+    return scale, sum(
+        1 for name in glyf.keys()
+        if glyf[name].isComposite()
+        and any(component.glyphName == "tilde" for component in glyf[name].components)
+    )
+
+
+def rename(font, style):
+    """Rename the family: this is a modified font and must not claim to be Noto."""
+    full = f"{FAMILY} {style}"
+    postscript = full.replace(" ", "")
+    for record in font["name"].names:
+        text = str(record)
+        if record.nameID in (1, 16):
+            record.string = FAMILY
+        elif record.nameID in (3, 4, 18):
+            record.string = full if record.nameID != 3 else f"{full}; derived from Noto Serif"
+        elif record.nameID == 6:
+            record.string = postscript
+        elif record.nameID == 10:
+            record.string = "Derived from Noto Serif (OFL 1.1): the perispomeni is redrawn as a rounded inverted breve."
+        elif "Noto Serif" in text and record.nameID not in (0, 13, 14):
+            record.string = text.replace("Noto Serif", FAMILY)
+
+
+def build(source, weight, style, out_name):
+    font = instancer.instantiateVariableFont(TTFont(source), {"wdth": 100, "wght": weight})
+    scale, reached = build_arch(font)
+    rename(font, style)
+    options = Options()
+    options.layout_features = ["*"]
+    options.name_IDs = ["*"]
+    options.notdef_outline = True
+    subsetter = Subsetter(options=options)
+    subsetter.populate(unicodes=parse_unicodes(UNICODES))
+    subsetter.subset(font)
+    font.flavor = "woff2"
+    out = OUT_DIR / out_name
+    out.parent.mkdir(parents=True, exist_ok=True)
+    font.save(out)
+    print(f"{out}: {out.stat().st_size} bytes; arch x-scale {scale:.4f}; {reached} composites draw the arch")
+
+
+def main():
+    if len(sys.argv) != 2:
+        sys.exit(__doc__)
+    source = sys.argv[1]
+    build(source, 400, "Regular", "greektutor-serif-regular.woff2")
+    build(source, 700, "Bold", "greektutor-serif-bold.woff2")
+
+
+if __name__ == "__main__":
+    main()
diff --git a/src/assets/fonts/NOTICE.md b/src/assets/fonts/NOTICE.md
new file mode 100644
index 0000000..969ea40
--- /dev/null
+++ b/src/assets/fonts/NOTICE.md
@@ -0,0 +1,32 @@
+# GreekTutor Serif — provenance
+
+`greektutor-serif-regular.woff2` and `greektutor-serif-bold.woff2` are a
+MODIFIED, subsetted build of Google's **Noto Serif** (Copyright 2022 The Noto
+Project Authors, SIL Open Font License 1.1 — full text in `OFL.txt`; the
+upstream copyright line carries no Reserved Font Name).
+
+Two changes from upstream:
+
+1. **The perispomeni is redrawn as a rounded arch.** Noto Serif — like Gentium
+   Plus, Gentium Book Plus, Cardo, EB Garamond, GFS Didot, GFS Neohellenic,
+   Literata, Libertinus Serif, FreeSerif, FreeSans, DejaVu Serif and DejaVu Sans,
+   all of which were rendered and compared — draws U+1FC0 as a TILDE. That is the
+   dominant Greek typographic convention, but it is not what the original
+   ParsonsTech courseware draws and not what this project wants (5B-VERIFY2 item
+   1). Every perispomeni-bearing glyph in Noto Serif is a composite over one
+   shared `tilde` component, so `scripts/make-greek-font.py` redraws that one
+   glyph as the font's own `uni0311` (combining inverted breve) stretched to the
+   tilde's exact bounding box. 119 composites pick up the arch with no offset
+   changes. Side effect, deliberate and harmless here: Latin a-tilde / n-tilde /
+   o-tilde and U+02DC also draw as arches in THIS font. Nothing renders them
+   inside a `.greek` span, and the body face is untouched.
+2. **Subset** to the ranges the app renders: U+0020-007E, U+00A0-00FF,
+   U+0300-036F, U+0370-03FF, U+1F00-1FFF, U+2010-2015, U+2018-201D, U+2026,
+   U+2032-2033. Variable axes are instanced (wdth 100; wght 400 and 700).
+
+Rebuild with:
+
+    pip install fonttools brotli
+    python3 scripts/make-greek-font.py NotoSerif[wdth,wght].ttf
+
+The source file is Google Fonts' `ofl/notoserif/NotoSerif[wdth,wght].ttf`.
````

### 8.4 Data (section A1 — the delivered files, committed as-is)

Included for completeness; no implementer edits are in here.

````diff
diff --git a/src/data/chapt-02.json b/src/data/chapt-02.json
index cbe015f..0e9afc6 100644
--- a/src/data/chapt-02.json
+++ b/src/data/chapt-02.json
@@ -1,5 +1,5 @@
 {
- "_comment": "Chapter 2 (Syllables & Accents), reconstructed from 2_ACCENT.TBK + CHAPT_2 audio inventory, PATCHED 2026-07-24 against the completed VERIFY-chapt02 DOSBox pass (sequence, all drill/exercise pools and answers, popup contents, and chart corrections). answerPolicy: the original finalizes one attempt per item on Check Answer, reveals the correct form, and auto-advances after ~4s (J1, Nathanael-approved timing); scored activities therefore complete when all items have been ATTEMPTED. UI colors per Nathanael (E1/E2): blue = selected guess, green = confirmed correct after Check Answer, red reserved for incorrect feedback. PATCHED AGAIN 2026-07-26 (5B-SPEC2 data): isolated marks now use SPACING codepoints (U+1FBF/1FFE/1FC0/00B4/0060/00A8) so they render correctly outside words; bibliography items are plain strings; rule-chart inflected rows wired to their b_ex2 clips; syllable-counting one-syllable bar removed (V2); accent rule drill: no auto-advance on incorrect + per-item audio + red first accent; multi-part tappable rows (parts[]) on Apostrophe/Coronis; Grammar Review verbs/nouns restructured per feedback 12/13; Review Marks grouped per feedback 15; liveScore + pronounceEach defaults across scored surfaces; accent placement gains a clearly-labeled circumflex EXTENSION pool (feedback 11, keep/drop decided in VERIFY2).",
+ "_comment": "Chapter 2 (Syllables & Accents), reconstructed from 2_ACCENT.TBK + CHAPT_2 audio inventory, PATCHED 2026-07-24 against the completed VERIFY-chapt02 DOSBox pass (sequence, all drill/exercise pools and answers, popup contents, and chart corrections). answerPolicy: the original finalizes one attempt per item on Check Answer, reveals the correct form, and auto-advances after ~4s (J1, Nathanael-approved timing); scored activities therefore complete when all items have been ATTEMPTED. UI colors per Nathanael (E1/E2): blue = selected guess, green = confirmed correct after Check Answer, red reserved for incorrect feedback. PATCHED AGAIN 2026-07-26 (5B-SPEC2 data): isolated marks now use SPACING codepoints (U+1FBF/1FFE/1FC0/00B4/0060/00A8) so they render correctly outside words; bibliography items are plain strings; rule-chart inflected rows wired to their b_ex2 clips; syllable-counting one-syllable bar removed (V2); accent rule drill: no auto-advance on incorrect + per-item audio + red first accent; multi-part tappable rows (parts[]) on Apostrophe/Coronis; Grammar Review verbs/nouns restructured per feedback 12/13; Review Marks grouped per feedback 15; liveScore + pronounceEach defaults across scored surfaces; accent placement gains a clearly-labeled circumflex EXTENSION pool (feedback 11, keep/drop decided in VERIFY2). PATCH3 2026-07-26 (5B-SPEC3 data): double-hyphens normalized to em dashes chapter-wide (typo policy A1 extension); accent-placement extension merged+shuffled into a 25-item pool, banner retired; anthrope wired to the base-form stand-in clip; Nouns topic restructured with subheading blocks (new RichContent type).",
  "id": "chapt_2",
  "number": 2,
  "title": "Syllables & Accents",
@@ -649,27 +649,28 @@
           },
           {
            "greek": "ἀνθρώπου",
-           "gloss": "\"  (penult acute--long ultima causes change)",
+           "gloss": "\"  (penult acute—long ultima causes change)",
            "_legacy": "a]nqrw<pou",
            "audio": "chapt_2_b_ex2_15"
           },
           {
            "greek": "ἀνθρώπῳ",
-           "gloss": "\"  (penult acute--long ultima causes change)",
+           "gloss": "\"  (penult acute—long ultima causes change)",
            "_legacy": "a]nqrw<p&",
            "audio": "chapt_2_b_ex2_17"
           },
           {
            "greek": "ἄνθρωπον",
-           "gloss": "\"  (antepenult acute--short ultima, no change)",
+           "gloss": "\"  (antepenult acute—short ultima, no change)",
            "_legacy": "a@nqrwpon",
            "audio": "chapt_2_b_ex2_12"
           },
           {
            "greek": "ἄνθρωπε",
-           "gloss": "\"  (antepenult acute--short ultima, no change)",
+           "gloss": "\"  (antepenult acute—short ultima, no change)",
            "_legacy": "a@nqrwpe",
-           "_note": "No dedicated clip on the ISO (vocative absent from the b_ex2 pool); renders ink/inert."
+           "_note": "STAND-IN AUDIO: the ISO has no vocative clip; plays the base-form recording (a_voc3) per Nathanael's directive that every chart word be tappable (VERIFY2 item 4). Flag if a dedicated clip surfaces in a later chapter.",
+           "audio": "chapt_2_a_voc3"
           }
          ]
         }
@@ -702,19 +703,19 @@
           },
           {
            "greek": "λύομεν",
-           "gloss": "we loose (antepenult acute--recessive)",
+           "gloss": "we loose (antepenult acute—recessive)",
            "audio": "chapt_2_b_vb4",
            "_legacy": "lu<omen"
           },
           {
            "greek": "λύετε",
-           "gloss": "you (pl) loose (antepenult acute--recessive)",
+           "gloss": "you (pl) loose (antepenult acute—recessive)",
            "audio": "chapt_2_b_vb5",
            "_legacy": "lu<ete"
           },
           {
            "greek": "λύουσι",
-           "gloss": "they loose (antepenult acute--recessive)",
+           "gloss": "they loose (antepenult acute—recessive)",
            "audio": "chapt_2_b_vb6",
            "_legacy": "lu<ousi"
           }
@@ -737,13 +738,13 @@
           },
           {
            "greek": "ἀνθρώπου",
-           "gloss": "\"  (penult acute--cannot accent antepenult)",
+           "gloss": "\"  (penult acute—cannot accent antepenult)",
            "_legacy": "a]nqrw<pou",
            "audio": "chapt_2_b_ex2_15"
           },
           {
            "greek": "ἀνθρώπῳ",
-           "gloss": "\"  (penult acute--cannot accent antepenult)",
+           "gloss": "\"  (penult acute—cannot accent antepenult)",
            "_legacy": "a]nqrw<p&",
            "audio": "chapt_2_b_ex2_17"
           }
@@ -760,12 +761,12 @@
          "rows": [
           {
            "greek": "ἀνθρώπου",
-           "gloss": "\"  (penult acute--long ultima causes change)",
+           "gloss": "\"  (penult acute—long ultima causes change)",
            "audio": "chapt_2_b_ex2_15"
           },
           {
            "greek": "ἀνθρώπῳ",
-           "gloss": "\"  (penult acute--long ultima causes change)",
+           "gloss": "\"  (penult acute—long ultima causes change)",
            "audio": "chapt_2_b_ex2_17"
           },
           {
@@ -796,19 +797,19 @@
          "rows": [
           {
            "greek": "ἦλθεν",
-           "gloss": "he went (short ultima--long penult) (Jn 1:7)",
+           "gloss": "he went (short ultima—long penult) (Jn 1:7)",
            "audio": "chapt_2_b_ac1",
            "_legacy": "h#lqen"
           },
           {
            "greek": "ἐκεῖνος",
-           "gloss": "that (short ultima--long penult) (Jn 1:8)",
+           "gloss": "that (short ultima—long penult) (Jn 1:8)",
            "audio": "chapt_2_b_ac2",
            "_legacy": "e]kei?noj"
           },
           {
            "greek": "πρῶτος",
-           "gloss": "first, earlier (short ultima--long penult) (Jn 1:15)",
+           "gloss": "first, earlier (short ultima—long penult) (Jn 1:15)",
            "audio": "chapt_2_b_ac3",
            "_legacy": "prw?toj"
           }
@@ -1372,11 +1373,11 @@
        "items": [
         {
          "label": "1)",
-         "text": "subject--about which something is said, and"
+         "text": "subject—about which something is said, and"
         },
         {
          "label": "2)",
-         "text": "predicate--that which is said about the subject."
+         "text": "predicate—that which is said about the subject."
         }
        ]
       },
@@ -1688,21 +1689,28 @@
        "text": "Nouns in Greek have gender, number and case."
       },
       {
-       "type": "defList",
-       "items": [
-        {
-         "term": "Gender:",
-         "def": "The Greek masculine, feminine, and neuter genders are often indicated by the endings attached to the noun.  Abstract nouns and objects that are neither male nor female in English are often marked as either masculine or feminine in Greek."
-        },
-        {
-         "term": "Number:",
-         "def": "as an \"s\" often marks an English word as being plural, likewise, Greek endings mark whether a noun is singular or plural (e.g. book, books)."
-        }
-       ]
+       "type": "subheading",
+       "text": "Gender:"
       },
       {
        "type": "para",
-       "text": "Case:  In English we have three cases which are seen in how we use our pronouns."
+       "text": "The Greek masculine, feminine, and neuter genders are often indicated by the endings attached to the noun.  Abstract nouns and objects that are neither male nor female in English are often marked as either masculine or feminine in Greek."
+      },
+      {
+       "type": "subheading",
+       "text": "Number:"
+      },
+      {
+       "type": "para",
+       "text": "as an \"s\" often marks an English word as being plural, likewise, Greek endings mark whether a noun is singular or plural (e.g. book, books)."
+      },
+      {
+       "type": "subheading",
+       "text": "Case:"
+      },
+      {
+       "type": "para",
+       "text": "In English we have three cases which are seen in how we use our pronouns."
       },
       {
        "type": "numbered",
@@ -1958,7 +1966,7 @@
     "attemptsPerItem": "retry",
     "autoAdvanceMs": null
    },
-   "_verify_resolved": "Pool + counts DOSBox-confirmed 2026-07-24 (all 20 derived counts matched; kai uses the one-syllable bar). Original's score dialog can overcount on revisits (22/20 witnessed) -- our scoring counts each item once.",
+   "_verify_resolved": "Pool + counts DOSBox-confirmed 2026-07-24 (all 20 derived counts matched; kai uses the one-syllable bar). Original's score dialog can overcount on revisits (22/20 witnessed) — our scoring counts each item once.",
    "hint": {
     "contentRef": "threeSyllableRules"
    },
@@ -2229,7 +2237,7 @@
    },
    "_answers_note": "Option labels + item pool DOSBox-verified. Per-item answers are RULE-DERIVED from the chapter's own grammar (the collection pass's low score made screenshot-derived answers unreliable); two anchors confirmed green on device (apostolos, kardia -> Potential Placement). Nathanael authorized correctness-first scoring (VERIFY E1).",
    "redFirstAccent": true,
-   "_policy_note": "Per device feedback item 6: no auto-advance on an incorrect answer (learner studies the revealed correct form and clicks Next); 4s auto-advance on correct stands. Audio per item wired (b_ex2 clips carry the inflected anthropos forms -- the same clips the original's rule charts play)."
+   "_policy_note": "Per device feedback item 6: no auto-advance on an incorrect answer (learner studies the revealed correct form and clicks Next); 4s auto-advance on correct stands. Audio per item wired (b_ex2 clips carry the inflected anthropos forms — the same clips the original's rule charts play)."
   },
   {
    "id": "c2_drill_marking_recognition",
@@ -2453,7 +2461,7 @@
     "attemptsPerItem": 1,
     "autoAdvanceMs": 4000
    },
-   "_answers_note": "25-item pool, order, options, and instruction DOSBox-verified. Answers read from the red-rendered mark in the screenshots (redMarkCluster = 1-based grapheme cluster carrying the red mark; item 18's mark assignment is the one judgment call). Original's score dialog says 'Drills Available: 35' -- an original bug (both passes yielded the same 25 items); we use 25."
+   "_answers_note": "25-item pool, order, options, and instruction DOSBox-verified. Answers read from the red-rendered mark in the screenshots (redMarkCluster = 1-based grapheme cluster carrying the red mark; item 18's mark assignment is the one judgment call). Original's score dialog says 'Drills Available: 35' — an original bug (both passes yielded the same 25 items); we use 25."
   },
   {
    "id": "c2_drill_part_of_speech",
@@ -2978,6 +2986,15 @@
     },
     {
      "n": 4,
+     "root": "πρῶτος",
+     "rootGloss": "first, earlier",
+     "answerForm": "πρῶτος",
+     "ref": "Jn 1:15",
+     "audio": "chapt_2_b_ac3",
+     "extended": true
+    },
+    {
+     "n": 5,
      "root": "Βαπτίζω",
      "rootGloss": "to baptize",
      "answerForm": "ἐβάπτισα",
@@ -2985,7 +3002,7 @@
      "audio": "chapt_2_b_ex2_4"
     },
     {
-     "n": 5,
+     "n": 6,
      "root": "Βαπτίζω",
      "rootGloss": "to baptize",
      "answerForm": "ἐβάπτιζεν",
@@ -2993,7 +3010,7 @@
      "audio": "chapt_2_b_ex2_5"
     },
     {
-     "n": 6,
+     "n": 7,
      "root": "Βαπτίζω",
      "rootGloss": "to baptize",
      "answerForm": "βαπτίζει",
@@ -3001,7 +3018,7 @@
      "audio": "chapt_2_b_ex2_6"
     },
     {
-     "n": 7,
+     "n": 8,
      "root": "Βαπτίζω",
      "rootGloss": "to baptize",
      "answerForm": "βαπτισθήτω",
@@ -3009,7 +3026,16 @@
      "audio": "chapt_2_b_ex2_7"
     },
     {
-     "n": 8,
+     "n": 9,
+     "root": "ἐκεῖνος",
+     "rootGloss": "that",
+     "answerForm": "ἐκεῖνος",
+     "ref": "Jn 1:8",
+     "audio": "chapt_2_b_ac2",
+     "extended": true
+    },
+    {
+     "n": 10,
      "root": "Βαπτίζω",
      "rootGloss": "to baptize",
      "answerForm": "βαπτίζεις",
@@ -3017,7 +3043,7 @@
      "audio": "chapt_2_b_ex2_8"
     },
     {
-     "n": 9,
+     "n": 11,
      "root": "Βαπτίζω",
      "rootGloss": "to baptize",
      "answerForm": "βαπτίζομαι",
@@ -3025,7 +3051,7 @@
      "audio": "chapt_2_b_ex2_9"
     },
     {
-     "n": 10,
+     "n": 12,
      "root": "Βαπτίζω",
      "rootGloss": "to baptize",
      "answerForm": "ἐβαπτίζοντο",
@@ -3033,7 +3059,7 @@
      "audio": "chapt_2_b_ex2_10"
     },
     {
-     "n": 11,
+     "n": 13,
      "root": "ἄνθρωπος",
      "rootGloss": "man",
      "answerForm": "ἄνθρωπος",
@@ -3041,7 +3067,16 @@
      "audio": "chapt_2_b_ex2_11"
     },
     {
-     "n": 12,
+     "n": 14,
+     "root": "ῥῆμα",
+     "rootGloss": "word",
+     "answerForm": "ῥῆμα",
+     "ref": "",
+     "audio": "chapt_2_b_rema",
+     "extended": true
+    },
+    {
+     "n": 15,
      "root": "ἄνθρωπος",
      "rootGloss": "man",
      "answerForm": "ἄνθρωπον",
@@ -3049,7 +3084,7 @@
      "audio": "chapt_2_b_ex2_12"
     },
     {
-     "n": 13,
+     "n": 16,
      "root": "ἄνθρωπος",
      "rootGloss": "man",
      "answerForm": "ἀνθρώπων",
@@ -3057,7 +3092,7 @@
      "audio": "chapt_2_b_ex2_13"
     },
     {
-     "n": 14,
+     "n": 17,
      "root": "ἄνθρωπος",
      "rootGloss": "man",
      "answerForm": "ἄνθρωποι",
@@ -3065,7 +3100,7 @@
      "audio": "chapt_2_b_ex2_14"
     },
     {
-     "n": 15,
+     "n": 18,
      "root": "ἄνθρωπος",
      "rootGloss": "man",
      "answerForm": "ἀνθρώπου",
@@ -3073,7 +3108,16 @@
      "audio": "chapt_2_b_ex2_15"
     },
     {
-     "n": 16,
+     "n": 19,
+     "root": "Φαρισαῖος",
+     "rootGloss": "Pharisee",
+     "answerForm": "Φαρισαῖος",
+     "ref": "",
+     "audio": "chapt_2_b_voc10",
+     "extended": true
+    },
+    {
+     "n": 20,
      "root": "ἄνθρωπος",
      "rootGloss": "man",
      "answerForm": "ἀνθρώποις",
@@ -3081,7 +3125,7 @@
      "audio": "chapt_2_b_ex2_16"
     },
     {
-     "n": 17,
+     "n": 21,
      "root": "ἄνθρωπος",
      "rootGloss": "man",
      "answerForm": "ἀνθρώπῳ",
@@ -3089,7 +3133,7 @@
      "audio": "chapt_2_b_ex2_17"
     },
     {
-     "n": 18,
+     "n": 22,
      "root": "ἄνθρωπος",
      "rootGloss": "man",
      "answerForm": "ἀνθρώπων",
@@ -3097,7 +3141,16 @@
      "audio": "chapt_2_b_ex2_18"
     },
     {
-     "n": 19,
+     "n": 23,
+     "root": "αὐτοῦ",
+     "rootGloss": "of him",
+     "answerForm": "αὐτοῦ",
+     "ref": "",
+     "audio": "chapt_2_b_autou",
+     "extended": true
+    },
+    {
+     "n": 24,
      "root": "ἄνθρωπος",
      "rootGloss": "man",
      "answerForm": "ἀνθρώπους",
@@ -3105,7 +3158,7 @@
      "audio": "chapt_2_b_ex2_19"
     },
     {
-     "n": 20,
+     "n": 25,
      "root": "ἄνθρωπος",
      "rootGloss": "man",
      "answerForm": "ἄνθρωπον",
@@ -3196,50 +3249,8 @@
      }
     ]
    },
-   "_answers_note": "COMPLETE REPLACEMENT per VERIFY E2/E3: the pool is NOT the vocabulary list. Two root words (Baptizo x10, anthropos x10); each item shows the root + gloss in the header and an UNACCENTED inflected form (breathing retained) with its Scripture reference; the learner picks Acute or Circumflex (the only two accent buttons in the original) and a letter position. answerForm is the accented form displayed after checking. b_ex2_1..21 audio = these forms in order (the 21st file is unreferenced by the 20 items -- likely the root recitation; wired nowhere pending a listen check). Grave is NOT offered as an option in the original.",
-   "extendedItems": [
-    {
-     "n": 21,
-     "root": "πρῶτος",
-     "rootGloss": "first, earlier",
-     "answerForm": "πρῶτος",
-     "ref": "Jn 1:15",
-     "audio": "chapt_2_b_ac3"
-    },
-    {
-     "n": 22,
-     "root": "ἐκεῖνος",
-     "rootGloss": "that",
-     "answerForm": "ἐκεῖνος",
-     "ref": "Jn 1:8",
-     "audio": "chapt_2_b_ac2"
-    },
-    {
-     "n": 23,
-     "root": "ῥῆμα",
-     "rootGloss": "word",
-     "answerForm": "ῥῆμα",
-     "ref": "",
-     "audio": "chapt_2_b_rema"
-    },
-    {
-     "n": 24,
-     "root": "Φαρισαῖος",
-     "rootGloss": "Pharisee",
-     "answerForm": "Φαρισαῖος",
-     "ref": "",
-     "audio": "chapt_2_b_voc10"
-    },
-    {
-     "n": 25,
-     "root": "αὐτοῦ",
-     "rootGloss": "of him",
-     "answerForm": "αὐτοῦ",
-     "ref": "",
-     "audio": "chapt_2_b_autou"
-    }
-   ],
-   "_extended_note": "EXTENSION, NOT IN THE ORIGINAL (Nathanael-authorized inquiry, feedback item 11): the original's 20-item pool is acute-only, so five circumflex-bearing chapter words are appended as clearly-labeled extended practice. Grave is impractical standalone (rule 6 requires a following word). Render after item 20 under an 'Extended practice' divider; confirm keep/drop in VERIFY2."
+   "_answers_note": "COMPLETE REPLACEMENT per VERIFY E2/E3: the pool is NOT the vocabulary list. Two root words (Baptizo x10, anthropos x10); each item shows the root + gloss in the header and an UNACCENTED inflected form (breathing retained) with its Scripture reference; the learner picks Acute or Circumflex (the only two accent buttons in the original) and a letter position. answerForm is the accented form displayed after checking. b_ex2_1..21 audio = these forms in order (the 21st file is unreferenced by the 20 items — likely the root recitation; wired nowhere pending a listen check). Grave is NOT offered as an option in the original.",
+   "_pool_note": "25-item pool: the original's 20 acute items plus 5 circumflex extension items MERGED AND INTERLEAVED at fixed positions (VERIFY2 item 7: extension approved, banner removed, shuffled so the circumflex items are not deducible). Each item keeps its own audio regardless of position. Completion = all 25 attempted. 'extended: true' retained for provenance only — never rendered."
   },
   {
    "id": "c2_ex_speller",
diff --git a/src/data/lexicon-chapt02.json b/src/data/lexicon-chapt02.json
index 4309d34..cc706ea 100644
--- a/src/data/lexicon-chapt02.json
+++ b/src/data/lexicon-chapt02.json
@@ -1,5 +1,5 @@
 {
- "_comment": "Chapter 2 (Syllables & Accents) lexicon. Lemma glosses + NT frequencies extracted verbatim from 2_ACCENT.TBK review-vocabulary chart. Audio pairing for b_voc1..10 is SCRIPT-VERIFIED (SayWord dispatch table in the TBK maps word ids to wav files directly), except echo=b_voc4 which is by alphabetical elimination -- listen-verify. exampleWords include chapter-1 lemmas reused by chapter-2 drills/exercises (duplicated here deliberately so chapter chunks stay self-contained under B5 lazy loading). Their audio uses chapt_2_a_voc* -- the ORIGINAL ISO duplicates chapter 1's ten vocab WAVs inside CHAPT_2, so the chapter-2 audio pack is self-contained; the transcode pipeline's path-based ids preserve that duplication. PATCHED 2026-07-24 against the completed VERIFY-chapt02 pass (G1-G4 listen checks, gloss corrections from DOSBox charts, v=nu confirmed).",
+ "_comment": "Chapter 2 (Syllables & Accents) lexicon. Lemma glosses + NT frequencies extracted verbatim from 2_ACCENT.TBK review-vocabulary chart. Audio pairing for b_voc1..10 is SCRIPT-VERIFIED (SayWord dispatch table in the TBK maps word ids to wav files directly), except echo=b_voc4 which is by alphabetical elimination — listen-verify. exampleWords include chapter-1 lemmas reused by chapter-2 drills/exercises (duplicated here deliberately so chapter chunks stay self-contained under B5 lazy loading). Their audio uses chapt_2_a_voc* — the ORIGINAL ISO duplicates chapter 1's ten vocab WAVs inside CHAPT_2, so the chapter-2 audio pack is self-contained; the transcode pipeline's path-based ids preserve that duplication. PATCHED 2026-07-24 against the completed VERIFY-chapt02 pass (G1-G4 listen checks, gloss corrections from DOSBox charts, v=nu confirmed).",
  "lemmas": {
   "adelphos": {
    "greek": "ἀδελφός",
@@ -91,7 +91,7 @@
    "_legacy": "ui[o<j",
    "glossShort": "son",
    "ntFreq": 377,
-   "_gloss_note": "review chart shows 'son (377)'; the marks page glosses the same word 'son, descendant' -- fuller gloss kept, glossShort matches chart"
+   "_gloss_note": "review chart shows 'son (377)'; the marks page glosses the same word 'son, descendant' — fuller gloss kept, glossShort matches chart"
   },
   "pharisaios": {
    "greek": "Φαρισαῖος",
@@ -106,7 +106,7 @@
  },
  "_ntFreq_note": "Frequencies verbatim from the TBK review chart: brother 343, I hear/obey 428, glory/fame 166, I have/hold 708, world 186, lord 717, word 330, Peter 156, son 377, Pharisee 98.",
  "exampleWords": {
-  "_comment": "Teaching-page words (accent chart, marks pages, proclitic/enclitic lists). Audio pairing from the SayWord script table where named; otherwise inferred from filename -- flagged.",
+  "_comment": "Teaching-page words (accent chart, marks pages, proclitic/enclitic lists). Audio pairing from the SayWord script table where named; otherwise inferred from filename — flagged.",
   "anthropos": {
    "greek": "ἄνθρωπος",
    "gloss": "man (base noun form)",
````
