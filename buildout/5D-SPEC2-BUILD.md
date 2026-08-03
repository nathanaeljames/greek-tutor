# 5D-SPEC2-BUILD.md — exact diff and build log, cohort 5D round 2

Implementer: Opus 5 in Claude Code. Base commit: `0fb973a` ("saving
edits before phase 5d-spec2"). Branch: `main`, nothing pushed.

Companion: **5D-SPEC2-RESULTS.md** (the handoff — what changed and why).
This document is the evidence: the whole diff, the tool log, and the
machine-check output.

Note on `buildout/archive/ONBOARD-SOL.md` -> `buildout/ONBOARD-SOL.md`:
that move appeared in the working tree during this round and is NOT the
implementer's; it is queue item 4 ("ONBOARD-SOL.md still owed to
buildout/"). It is left exactly as found, contents byte-identical.

## 1. Wall clock

Single continuous session, 2026-08-03. Roughly:

| Phase | Time |
| --- | --- |
| Reading the handoff, spec, DRILL-MATRIX, divergence log and the round-1 tree | ~15 min |
| SS2 movable nu, SS3 timing + revisit-reset | ~20 min |
| SS4 shared speller input model + tap-to-position field | ~35 min |
| SS5 layout, SS6 renderer ([[g]], labelStyle, para emphasis, greekTaps) | ~35 min |
| Playwright harness (ui-walk.mjs, ui-behavior.mjs) and the failures it found | ~55 min |
| Documents | ~25 min |

## 2. Machine-check output

### npm run verify

    
    > greek-tutor@0.1.0 verify
    > npm run check:shapes && npm run build && npm run check:lazy-chunk
    
    
    > greek-tutor@0.1.0 check:shapes
    > node scripts/check-content-shapes.mjs
    
    PASS: content shapes intact — chapt-01.json, chapt-02.json, chapt-03.json checked (biblist entries are strings; numbered items render something; greekRows rows carry content; paradigm rows match their columns; spellVerse answers are single words; every contentAudio mode has a branch; every reddened cluster has a font-derived geometry row; every spelling answer is typeable on the shared keyboard).
    
    > greek-tutor@0.1.0 build
    > vite build
    
    vite v5.4.21 building for production...
    transforming...
    12:53:50 AM [vite-plugin-svelte] F:/greekapp/opus-space/src/components/DivideActivity.svelte:325:6 A11y: noninteractive element cannot have nonnegative tabIndex value
    323:     <div class="divide-rail" bind:clientWidth={railWidth}>
    324:       <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    325:       <div class="divide-word greek"
               ^
    326:         class:answered={revealed}
    327:         bind:this={wordEl}
    ✓ 82 modules transformed.
    rendering chunks...
    computing gzip size...
    dist/registerSW.js                                     0.13 kB
    dist/manifest.webmanifest                              0.55 kB
    dist/index.html                                        0.86 kB │ gzip:  0.43 kB
    dist/assets/greektutor-serif-regular-9abzY2AB.woff2   39.70 kB
    dist/assets/greektutor-serif-bold-ByRt3e5M.woff2      41.45 kB
    dist/assets/index-x9ZL1aok.css                        34.35 kB │ gzip:  7.51 kB
    dist/assets/lexicon-chapt03-DU3wQSch.js                1.94 kB │ gzip:  0.92 kB
    dist/assets/lexicon-chapt01-DWCL8L3K.js                6.75 kB │ gzip:  2.94 kB
    dist/assets/lexicon-chapt02-DMecEUSp.js                8.90 kB │ gzip:  3.51 kB
    dist/assets/chapt-01-8ZoFoXk9.js                      35.39 kB │ gzip: 11.80 kB
    dist/assets/chapt-03-CPP2o90H.js                      38.51 kB │ gzip:  8.34 kB
    dist/assets/chapt-02-CFgjCaAb.js                      56.46 kB │ gzip: 15.75 kB
    dist/assets/index-DBojRjHs.js                        285.75 kB │ gzip: 82.86 kB
    ✓ built in 5.78s
    
    PWA v0.20.5
    mode      generateSW
    precache  23 entries (561.60 KiB)
    files generated
      dist/sw.js
      dist/workbox-efbd304a.js
    
    > greek-tutor@0.1.0 check:lazy-chunk
    > node scripts/check-lazy-chunk.mjs
    
    PASS: lazy-chapter split intact — chapt-01-8ZoFoXk9.js + lexicon-chapt01-DWCL8L3K.js; chapt-02-CFgjCaAb.js + lexicon-chapt02-DMecEUSp.js; chapt-03-CPP2o90H.js + lexicon-chapt03-DU3wQSch.js emitted, precached, and chapter data is out of index-DBojRjHs.js.

### node scripts/ui-behavior.mjs (36 checks)

    PASS  A4/1 λύουσι, no accents, accents OFF  — "λυουσι" for "they loose"
    PASS  A4/2 λύουσι, accented, accents ON  — "λύουσι" for "they loose"
    PASS  A4/3 λυουσιν (movable nu) now REJECTED  — "λυουσιν" for "they loose"
    PASS  A4/4 πιστευομε for πιστεύομεν rejected  — "πιστευομε" for "we believe"
    PASS  A4/5 πιστευομεν accepted  — "πιστευομεν" for "we believe"
    PASS  §4/2 breathing after a space attaches to the NEXT letter  — "ὁ ἰ"
    PASS  §4/2 the space survives the breathing  — "ὁ ἰ"
    PASS  §4/1 tap-to-position inserts mid-string  — "λεγει"
    PASS  §4/1 backspace acts at the caret  — "λγει"
    PASS  A6/1 verse with no accents, accents OFF  — typed "λεγει αυτω ο ιησους, εγω ειμι η οδος και…"
    PASS  A6/2 verse fully accented, accents ON  — typed "λέγει αὐτῷ ὁ ἰησοῦς, ἐγώ εἰμι ἡ ὁδὸς καὶ…"
    PASS  A6/3 verse with no accents, accents ON  — typed "λεγει αυτω ο ιησους, εγω ειμι η οδος και…"
    PASS  A6/4 verse without its punctuation, accents ON  — typed "λέγει αὐτῷ ὁ ἰησοῦς ἐγώ εἰμι ἡ ὁδὸς καὶ …"
    PASS  A6/5 lowercase where the verse capitalizes, accents ON  — typed "λέγει αὐτῷ ὁ ἰησοῦς, ἐγώ εἰμι ἡ ὁδὸς καὶ…"
    PASS  §3 revisit resets the item — ch2 Accent Rule  — marked 1 -> 0, feedback "", was on "1 of 20"
    PASS  §3 revisit keeps the recorded score — ch2 Accent Rule  — 1 correct out of 1 attempts (100%)
    PASS  §3 revisit resets the item — ch3 Verb Translating  — marked 2 -> 0, feedback "", was on "1 of 28"
    PASS  §3 revisit keeps the recorded score — ch3 Verb Translating  — 0 correct out of 1 attempts (0%)
    PASS  §3 revisit resets the item — ch3 Vocabulary: Greek to English  — marked 2 -> 0, feedback "", was on "1 of 10"
    PASS  §3 revisit keeps the recorded score — ch3 Vocabulary: Greek to English  — 0 correct out of 1 attempts (0%)
    PASS  §3 ch1 has no scored select drill with a revisit path  — 6 select drills, 0 with a stepper
    PASS  §3 revisit resets the item — ch1 Vocabulary Spelling  — ""
    PASS  §3 ch2 Syllable Counting: correct advances on 2000ms  — item 1 of 20 -> 1 of 20 at 1100ms -> 2 of 20 at 2800ms
    PASS  §3 ch3 Scripture Memory Drill: incorrect advances on 4000ms  — item 1 of 10 -> 1 of 10 at 2200ms -> 2 of 10 at 5600ms
    PASS  §5 Greek option grid is 2-up at 320px — ch1 Vocabulary: English to Greek  — 2 columns
    PASS  §5 Greek option grid is 4-up at 768px — ch1 Vocabulary: English to Greek  — 4 columns
    PASS  §5 Greek option grid is 2-up at 320px — ch2 Vocabulary: English to Greek  — 2 columns
    PASS  §5 Greek option grid is 4-up at 768px — ch2 Vocabulary: English to Greek  — 4 columns
    PASS  §5 Greek option grid is 2-up at 320px — ch3 Vocabulary: English to Greek  — 2 columns
    PASS  §5 Greek option grid is 4-up at 768px — ch3 Vocabulary: English to Greek  — 4 columns
    PASS  §5 ch1 letter grid stays four-up at 320px  — 4 columns
    PASS  §5 ch1 letter grid stays four-up at 768px  — 4 columns
    PASS  §5 Parsing Drill divider is dark green  — {"top":"rgb(31, 95, 87)","left":"rgb(34, 37, 42)"}
    PASS  §5 chapt_1 objectives use "1. 2. 3."  — decimal
    PASS  §5 chapt_2 objectives use "1. 2. 3."  — decimal
    PASS  §5 chapt_3 objectives use "1. 2. 3."  — decimal
    
    36/36 behavior checks passed

### node scripts/ui-walk.mjs

    walked 64 stops x 2 widths -> buildout/screenshots/5d-spec2
    HORIZONTAL OVERFLOW: chapt_2/c2_learn_marks @320
    no console errors

### timing sweep — grep for stray durations

    $ grep -rn "setTimeout" src/components/*.svelte
    src/components/DivideActivity.svelte:241:      advanceTimer = setTimeout(() => move(1), autoAdvanceMs);
    src/components/PlaceAccentActivity.svelte:106:      advanceTimer = setTimeout(() => move(1), autoAdvanceMs);
    src/components/SelectActivity.svelte:195:      if (right) advanceTimer = setTimeout(advance, advancePolicy.correctMs);
    src/components/SelectActivity.svelte:196:      else if (advancePolicy.autoOnIncorrect) advanceTimer = setTimeout(advance, advancePolicy.incorrectMs);
    src/components/Settings.svelte:42:    tapTimer = setTimeout(() => (tapCount = 0), 1600);
    src/components/SpellActivity.svelte:84:      advanceTimer = setTimeout(() => goNext(), ADVANCE_CORRECT_MS);
    src/components/SpellVerseActivity.svelte:100:    hintTimer = setTimeout(() => { showHint = false; hintTimer = null; }, HINT_VISIBLE_MS);

    $ grep -rn "autoAdvanceMs\|advanceMs\|delayMs" src/data/

## 3. The diff

### New files

```
src/lib/speller-input.js  (117 lines)
src/components/SpellerField.svelte  (51 lines)
scripts/ui-walk.mjs  (147 lines)
scripts/ui-behavior.mjs  (328 lines)
```

### git diff --stat (package-lock.json omitted for length)

```
 buildout/archive/ONBOARD-SOL.md           | 253 ------------------------------
 package.json                              |   5 +-
 scripts/check-content-shapes.mjs          |   9 ++
 src/app.css                               | 117 +++++++++++---
 src/components/ContentAudio.svelte        |  18 ++-
 src/components/DivideActivity.svelte      |  39 ++---
 src/components/Marked.svelte              |   8 +-
 src/components/PlaceAccentActivity.svelte |  23 +--
 src/components/RichContent.svelte         |  60 +++++--
 src/components/SelectActivity.svelte      |  47 ++++--
 src/components/SpellActivity.svelte       |  54 ++++---
 src/components/SpellVerseActivity.svelte  |  50 +++---
 src/data/chapt-02.json                    |  16 +-
 src/data/chapt-03.json                    |  24 +--
 src/lib/answer-check.js                   |  27 ++--
 src/lib/markup.js                         |  34 ++--
 src/lib/timing.js                         |  32 ++--
 17 files changed, 356 insertions(+), 460 deletions(-)
```

### Full diff of tracked files

```diff
diff --git a/package.json b/package.json
index 5036851..bc453ce 100644
--- a/package.json
+++ b/package.json
@@ -10,13 +10,16 @@
     "preview": "vite preview",
     "check:lazy-chunk": "node scripts/check-lazy-chunk.mjs",
     "check:shapes": "node scripts/check-content-shapes.mjs",
-    "verify": "npm run check:shapes && npm run build && npm run check:lazy-chunk"
+    "verify": "npm run check:shapes && npm run build && npm run check:lazy-chunk",
+    "ui:walk": "node scripts/ui-walk.mjs",
+    "ui:behavior": "node scripts/ui-behavior.mjs"
   },
   "dependencies": {
     "idb": "^7.1.1"
   },
   "devDependencies": {
     "@sveltejs/vite-plugin-svelte": "^3.1.2",
+    "playwright-core": "^1.62.1",
     "svelte": "^4.2.19",
     "vite": "^5.4.11",
     "vite-plugin-pwa": "^0.20.5"
diff --git a/scripts/check-content-shapes.mjs b/scripts/check-content-shapes.mjs
index 422d29f..769e5e4 100644
--- a/scripts/check-content-shapes.mjs
+++ b/scripts/check-content-shapes.mjs
@@ -124,6 +124,15 @@ for (const file of files) {
         });
       }
     }
+    // TIMING IS NOT A DATA FIELD (5D-SPEC2 §3, D-14 at 2000/4000). Advance
+    // durations live in src/lib/timing.js and nowhere else, so ch1, ch2 and
+    // ch3 always read the same two numbers. A regenerated data file that
+    // re-introduces autoAdvanceMs would silently do nothing at runtime --
+    // resolveAdvance stopped reading it -- which is the kind of change that
+    // only shows up as "the feel drifted" three rounds later.
+    if (Object.prototype.hasOwnProperty.call(block, 'autoAdvanceMs')) {
+      problems.push(`${path}.autoAdvanceMs: advance durations live in src/lib/timing.js, not in the data (D-14).`);
+    }
     // greekRows rows carry a word, a positional-chart cell list, or an
     // alternating parts[] equation -- never nothing at all.
     if (block.type === 'greekRows') {
diff --git a/src/app.css b/src/app.css
index d3dd60e..3cf65bb 100644
--- a/src/app.css
+++ b/src/app.css
@@ -92,11 +92,31 @@ button { font: inherit; cursor: pointer; }
   color: var(--teal-dark); margin: 18px 0 8px; font-weight: 700; }
 .grid { display: grid; gap: 8px; }
 .grid.letters { grid-template-columns: repeat(6, 1fr); }
-.grid.options { grid-template-columns: repeat(2, 1fr); }
-.grid.options.wide { grid-template-columns: repeat(4, 1fr); }
-.grid.options.single { grid-template-columns: 1fr; }
+/* minmax(0, 1fr), never a bare 1fr: a bare `1fr` track has a min-content floor,
+   so a long option label ("Transliteration", "I know, learn") silently pushes
+   the whole grid past the card instead of wrapping inside its tile. With
+   overflow-x hidden app-wide that loses the right-hand column with nothing to
+   scroll and nothing to error -- the same silent clipping that produced D-19.
+   Found by the 5D-SPEC2 walk on ch1's Letter-to-Name and ch2's Greek-to-English
+   grids at 320px (281px and 263px of content in 260px of card). */
+.grid.options { grid-template-columns: repeat(2, minmax(0, 1fr)); }
+.grid.options.wide { grid-template-columns: repeat(4, minmax(0, 1fr)); }
+.grid.options.single { grid-template-columns: minmax(0, 1fr); }
+/* D-19, amended by 5D-SPEC2 §5. A GREEK option pool is two-up at phone width
+   and four-up from the iPad breakpoint. Ten polytonic words in four columns
+   need ~33px more than a 320px screen has, and overflow-x is hidden app-wide,
+   so the longest words were being clipped in silence rather than wrapping —
+   but an iPad has the room and four-up is the original's arrangement.
+   768px is the iPad's portrait CSS width and the wide half of this round's
+   320/768 screenshot pair; the app's other breakpoints (560px large phone,
+   900px sidebar) are the wrong shape for this. Single-glyph letter grids are
+   `wide` and stay four-up at every width. */
+@media (min-width: 768px) {
+  .grid.options.greek-pool { grid-template-columns: repeat(4, minmax(0, 1fr)); }
+}
 .tile { background: var(--card); border: 2px solid transparent; border-radius: 10px;
-  padding: 10px 4px; font-size: 1.35rem; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
+  padding: 10px 4px; font-size: 1.35rem; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
+  min-width: 0; overflow-wrap: break-word; }
 .tile.small { font-size: 0.95rem; padding: 10px 6px; }
 .tile:active { border-color: var(--teal); }
 .tile.correct { border-color: var(--ok); background: #e6f2e6; }
@@ -107,6 +127,10 @@ button { font: inherit; cursor: pointer; }
 .tile.selected { border-color: var(--link); background: #e8f0fb; }
 .tile.selected.correct { border-color: var(--ok); background: #e6f2e6; }
 .prompt { font-size: 3rem; text-align: center; padding: 18px; }
+/* A multi-letter Greek prompt (SelectActivity longPrompt). 3rem is the size a
+   single LETTER wants; a ten-cluster verb at 3rem overruns a 320px card and
+   loses its tail silently. */
+.prompt.greek.long { font-size: 2.2rem; overflow-wrap: break-word; }
 .prompt.select-sentence { font-size: 1.25rem; line-height: 1.5; }
 /* Marking Recognition / Accent Rule ask about ONE mark, drawn red inside the
    word. The word itself stays a blue greek-say tap (directive 9).
@@ -219,6 +243,9 @@ button { font: inherit; cursor: pointer; }
   padding: 10px 16px; font-size: 0.9rem; opacity: 0.95; z-index: 50; max-width: 90vw; text-align: center; }
 .scorebox { text-align: center; font-weight: 700; color: var(--teal-dark); }
 .textpage { line-height: 1.55; font-size: 1rem; white-space: pre-wrap; }
+/* D-20 exception: chapter objectives keep "1. 2. 3." in every chapter, while
+   teaching lists print "1) 2) 3)" (.rc-list). */
+.objectives-list { list-style-type: decimal; }
 .flash-pane { background: white; border-radius: 10px; padding: 14px; margin-bottom: 10px; min-height: 74px; }
 .flash-pane .label { font-size: 0.75rem; color: var(--teal-dark); font-weight: 700; text-transform: uppercase; }
 .flash-pane .value { font-size: 2rem; }
@@ -328,7 +355,19 @@ button { font: inherit; cursor: pointer; }
   position: absolute; left: -1.9em; width: 1.5em; text-align: right; font-weight: 600; }
 .rc-list.authored-labels { padding-left: 0.75em; }
 .rc-lead { text-decoration: underline; font-weight: 600; }
+/* labelStyle "underline" / "plain" (5D-SPEC2 §6): the original's own list-item
+   terms. Ink, never --link: blue is reserved for tappable, and these labels
+   deliberately are not (their popups are the expander cards below the list). */
+.rc-lead-u { font-weight: 600; color: var(--ink); }
+.rc-lead-plain { font-weight: 700; color: var(--ink); text-decoration: none; }
 .rc-num { font-weight: 600; margin-right: 0.15em; }
+/* A para carrying the original's own body typography (5D-SPEC2 §6). "Stem +
+   Pronominal ending — λύ + ω" is bold and indented under its lead sentence. */
+.rc-para.rc-strong { font-weight: 700; }
+.rc-para.rc-indent { padding-left: 1.75em; }
+/* [[g]]…[[/g]] — a descriptive term sharing a line with its example
+   ("Come here. — command"). Dark green, the ink used for asides; never blue. */
+.term-green { color: var(--accent-ink); }
 .rc-example { display: inline-flex; flex-wrap: wrap; align-items: baseline; gap: 8px;
   background: #fffdf3; border: 1px solid #e7dfbf; border-radius: 8px; padding: 6px 12px;
   margin: 8px 0 2px; font-size: 1rem; text-align: left; color: var(--ink); }
@@ -339,7 +378,12 @@ button { font: inherit; cursor: pointer; }
   padding: 8px 10px; font-size: 0.9375rem; margin-top: 8px; }
 .rc-deflist { display: flex; flex-direction: column; gap: 4px; margin: 8px 0 10px; }
 .rc-deflist.nested { margin-top: 8px; }
-.rc-defrow { display: grid; grid-template-columns: minmax(6em, auto) 1fr auto; gap: 10px;
+/* Two changes from the 5D-SPEC2 walk, which measured this row overflowing its
+   card by 17px at 320px inside chapter 2's Pronouns/Sentence Parts expanders:
+   the term track is CAPPED at 45% (an `auto` max let "Interrogative Pronouns:"
+   take the row and leave 4px for its definition), and the value track is
+   minmax(0, 1fr) (a bare 1fr floors at min-content and pushes the row wide). */
+.rc-defrow { display: grid; grid-template-columns: minmax(6em, 45%) minmax(0, 1fr) auto; gap: 10px;
   align-items: baseline; text-align: left; background: transparent; border: none;
   padding: 5px 6px; border-radius: 8px; font-size: 1rem;
   /* B4: a definition row is a <button> so a row WITH audio can be tapped, but
@@ -354,8 +398,8 @@ button { font: inherit; cursor: pointer; }
    the tab order and the accessibility tree; the colour rule above stays as
    belt and braces. */
 .rc-defrow.static { color: var(--ink); cursor: default; }
-.rc-term { font-weight: 600; color: var(--accent-ink); }
-.rc-val { color: var(--ink); }
+.rc-term { font-weight: 600; color: var(--accent-ink); min-width: 0; overflow-wrap: break-word; }
+.rc-val { color: var(--ink); min-width: 0; overflow-wrap: break-word; }
 /* C7: term-less entries (the accent hints' "Acute—last 3 syllables") are one
    hanging-indent line each, not a two-column table with an empty first column. */
 .rc-deflist.termless .rc-defrow { display: block; padding-left: 1.4em; text-indent: -1.4em; }
@@ -483,6 +527,9 @@ button { font: inherit; cursor: pointer; }
 .eq-eq { color: #9a9482; font-size: 1.1rem; }
 .eq-b { font-size: 1.5rem; }
 @media (max-width: 360px) { .equation-grid { grid-template-columns: repeat(3, 1fr); } }
+/* 320px has ~112px of Greek column in the Quick Review chart; the longest
+   lemmas need ~123px at 1.5rem. One step down fits them all without wrapping. */
+@media (max-width: 360px) { .rv-greek { font-size: 1.35rem; } }
 
 /* ---- Vowel stair ---- */
 .vowel-stair { display: flex; flex-direction: column; gap: 12px; }
@@ -507,13 +554,24 @@ button { font: inherit; cursor: pointer; }
 
 /* ---- Review Vocabulary Chart ---- */
 .review-vocab { display: flex; flex-direction: column; }
-.rv-row { display: grid; grid-template-columns: 42% 1fr; gap: 12px; align-items: baseline;
+/* The Greek column is a PERCENTAGE so every row's chart columns line up (each
+   row is its own grid; an `auto` track would size per row and the chart would
+   stagger). It has to be wide enough for the longest lemma the app ships,
+   because a Greek word that overruns its track does not clip here -- it
+   overprints the gloss beside it. Caught by the 5D-SPEC2 walk on all three
+   Quick Review charts at 320px ("ἀπόστολος" over "apostle,", "πιστεύω" over
+   "I believe"). min-width:0 + break-word is the belt-and-braces: a longer
+   lemma in a later chapter wraps instead of overprinting. */
+.rv-row { display: grid; grid-template-columns: 46% 1fr; gap: 12px; align-items: baseline;
   text-align: left; background: transparent; border: none; padding: 10px 8px;
   border-bottom: 1px solid rgba(0,0,0,0.06); }
 .rv-row:active { background: rgba(0,0,0,0.04); }
-.rv-greek { font-size: 1.5rem; }
-.rv-gloss { font-size: 1rem; }
-.rv-freq { color: #8a8472; font-size: 0.9rem; }
+.rv-greek { font-size: 1.5rem; min-width: 0; overflow-wrap: break-word; }
+.rv-gloss { font-size: 1rem; min-width: 0; }
+/* The gap between gloss and frequency is a margin, not a text space: the
+   template's leading space is inside an {#if} and Svelte trims it, which is
+   why the chart read "but, yet(638)". */
+.rv-freq { color: #8a8472; font-size: 0.9rem; margin-left: 0.35em; }
 .rv-footnote { font-size: 0.85rem; color: #5a5a52; line-height: 1.45; margin-top: 10px; }
 
 /* ---- Review Letters Quick Chart (4-col matrix, A18: Pronounce col dropped) ---- */
@@ -546,8 +604,24 @@ button { font: inherit; cursor: pointer; }
 
 /* ---- Speller ---- */
 .spell-panes { display: flex; flex-direction: column; gap: 10px; }
-.spell-target { min-height: 2.4rem; font-size: 2rem; display: flex; align-items: center; }
-.caret { display: inline-block; width: 2px; background: var(--teal); animation: blink 1s step-start infinite; margin-left: 1px; }
+/* The typed buffer (SpellerField). Laid out as normal inline flow rather than
+   a flex row: each grapheme cluster is its own tappable span now (tap-to-
+   position, VERIFY-5D A6), and flex items do not wrap mid-"word" — a ten
+   cluster form at 2rem would have run off a 320px screen with overflow-x
+   hidden app-wide, which is the silent clipping failure this codebase has
+   already paid for twice. pre-wrap keeps a typed trailing space visible. */
+.spell-target { min-height: 2.4rem; font-size: 2rem; display: block; line-height: 1.3;
+  white-space: pre-wrap; overflow-wrap: anywhere; cursor: text; }
+.sp-cluster { cursor: text; }
+/* A diacritic waiting for a letter to sit on (speller-input pendingMark),
+   drawn in its spacing form so it is visibly QUEUED rather than lost. */
+.sp-pending { color: var(--teal-dark); opacity: 0.75; }
+/* An EMPTY 2px bar with its own height. It used to contain a literal "|", which
+   overflowed the 2px box and painted a second, ink-coloured pipe beside the
+   teal one -- and it made the caret impossible to place between two clusters,
+   because the glyph took the space the caret now occupies. */
+.caret { display: inline-block; width: 2px; height: 1.05em; vertical-align: -0.15em;
+  background: var(--teal); animation: blink 1s step-start infinite; }
 @keyframes blink { 50% { opacity: 0; } }
 .spell-checks { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin: 10px 0; font-size: 0.9375rem; }
 .spell-checks label { display: inline-flex; align-items: center; gap: 6px; }
@@ -654,12 +728,16 @@ button { font: inherit; cursor: pointer; }
    cannot share 320px in two columns, so the groups stack vertically on the
    phone (still visibly two blocks, divided) and sit side by side once there is
    room, which is the original's arrangement. */
+/* The rule between the singular and plural groups is DARK GREEN and 2px
+   (5D-SPEC2 §5): at the neutral grey it shipped with, it read as one more card
+   border in a stack of six bordered option tiles instead of as the divider
+   between the two halves of the parsing grid. */
 .option-groups { display: grid; grid-template-columns: 1fr; gap: 10px; }
 .option-group { gap: 8px; }
-.option-group + .option-group { border-top: 1px solid rgba(0,0,0,0.12); padding-top: 10px; }
+.option-group + .option-group { border-top: 2px solid var(--teal-dark); padding-top: 10px; }
 @media (min-width: 560px) {
   .option-groups { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
-  .option-group + .option-group { border-top: none; border-left: 1px solid rgba(0,0,0,0.12);
+  .option-group + .option-group { border-top: none; border-left: 2px solid var(--teal-dark);
     padding-top: 0; padding-left: 12px; }
 }
 
@@ -680,9 +758,12 @@ button { font: inherit; cursor: pointer; }
 /* ---- WHOLE-VERSE SPELLER ---- */
 .sv-ref { text-align: right; color: var(--teal-dark); font-size: 0.85rem; font-weight: 700;
   margin-bottom: 8px; }
-/* Free-typed multi-word Greek: wraps, and grows instead of scrolling sideways. */
-.spellverse .sv-target { font-size: 1.35rem; line-height: 1.5; min-height: 4.5rem;
-  display: block; white-space: pre-wrap; overflow-wrap: anywhere; }
+/* Free-typed multi-word Greek: wraps, and grows instead of scrolling sideways.
+   overflow-wrap is `break-word`, not `anywhere`: a tapped caret position is
+   read off the cluster's own box, so keeping whole words together makes the
+   fourteen-word verse land where the learner aimed. */
+.spellverse .sv-target { font-size: 1.35rem; line-height: 1.6; min-height: 4.5rem;
+  overflow-wrap: break-word; }
 .sv-detail { text-align: center; color: var(--teal-dark); font-size: 0.95rem; margin: -4px 0 8px; }
 .sv-word { font-size: 1.2rem; }
 .sv-hint { background: #fffdf3; border: 1px solid #e7dfbf; border-radius: 10px;
diff --git a/src/components/ContentAudio.svelte b/src/components/ContentAudio.svelte
index abf4f59..1c1a31e 100644
--- a/src/components/ContentAudio.svelte
+++ b/src/components/ContentAudio.svelte
@@ -134,16 +134,28 @@
 {#if mode === 'objectivesPage'}
   <!-- The chapter's objectives list (preamble + numbered objectives from the
        chapter record itself, not the activity). -->
+  <!-- D-20 EXCEPTION: objectives print "1. 2. 3.", not the "1) 2) 3)" house
+       style the teaching lists use. The class pins the marker so a later
+       global list rule cannot quietly convert this page too. The objective
+       strings themselves are extracted verbatim from the TBK -- round 1
+       authored chapter 3's four lines from scratch, which is what
+       VERIFY-5D-RESPONSE2 item 1 is about; they are never paraphrased. -->
   <div class="card textpage">
     <strong>{chapter.objectivesPreamble}</strong>
-    <ol>{#each chapter.objectives as o}<li>{o}</li>{/each}</ol>
+    <ol class="objectives-list">{#each chapter.objectives as o}<li>{o}</li>{/each}</ol>
   </div>
 
 {:else if mode === 'topicPages'}
   <div class="card topic-page">
     {#if currentTopic}
       <div class="topic-heading">{currentTopic.title}</div>
-      <RichContent blocks={currentTopic.content || []} suppressTitle={currentTopic.title} />
+      <!-- greekTaps is declared once for the whole activity (chapter 3's Learn
+           Verbs wires λύουσιν / λύουσι / λύω, which appear in prose across
+           three different topics) and a topic may still override it. -->
+      <RichContent
+        blocks={currentTopic.content || []}
+        suppressTitle={currentTopic.title}
+        greekTaps={currentTopic.greekTaps || activity.greekTaps} />
       {#if currentTopic._verify}<div class="pending-verification compact">Some topic details are pending verification.</div>{/if}
     {:else}
       <div class="pending-verification">Topic content pending verification.</div>
@@ -190,7 +202,7 @@
 {:else if mode === 'textPage'}
   {#if activity.content}
     <div class="card">
-      <RichContent blocks={activity.content} />
+      <RichContent blocks={activity.content} greekTaps={activity.greekTaps} />
       {#if activity.playButton}
         <div class="controls">
           <button class="btn" on:click={() => play(activity.playButton.audio)}>▶ {activity.playButton.label}</button>
diff --git a/src/components/DivideActivity.svelte b/src/components/DivideActivity.svelte
index 06b0146..ccaa28b 100644
--- a/src/components/DivideActivity.svelte
+++ b/src/components/DivideActivity.svelte
@@ -17,11 +17,12 @@
   //     a divider. It therefore renders in INK, not the tappable blue, and
   //     Pronounce / Pronounce Each are the audio path. This is a standing
   //     exception to directive 9, alongside Phonetic Reading and the speller.
-  //   * CLEAR ANSWER RE-OPENS A FINISHED ITEM, which attemptsPerItem: 1
-  //     otherwise forbids. VERIFY3 asks for it by name ("upon revisiting a
-  //     previously answered word, all cursors and answer texts should
-  //     disappear and let the user try that word again"). Score history
-  //     already spent is not rewound.
+  //   * A REVISIT RE-OPENS A FINISHED ITEM, which attemptsPerItem: 1 otherwise
+  //     forbids. VERIFY3 asked for it by name ("upon revisiting a previously
+  //     answered word, all cursors and answer texts should disappear and let
+  //     the user try that word again"); 5D-SPEC2 §3 makes it the app-wide rule.
+  //     Clear Answer does the same thing without leaving the item. Score
+  //     history already spent is not rewound.
   //
   // ANSWER POLICY (5B patch 2a): answerPolicy.attemptsPerItem === 1 means
   // Check Answer finalizes the item right or wrong, reveals the hyphen-joined
@@ -55,7 +56,6 @@
   let pronounceEach = activity.ui?.defaults?.pronounceEach ?? false;
   let advanceTimer = null;
   const attemptedItems = new Set();
-  const results = new Map();
 
   // ---- SIZING (C1): one size, set by the longest word in the pool ----
   // Measured, not guessed: a hidden probe renders every word at a reference
@@ -237,25 +237,16 @@
       answered = true;
       endDrag();
       if (attemptedItems.size === items.length) markCompleted(activity.id);
-      results.set(itemIndex, {
-        dividers: [...dividers],
-        oneSyllable,
-        feedback,
-        feedbackKind,
-        correct: right
-      });
       clearTimeout(advanceTimer);
       advanceTimer = setTimeout(() => move(1), autoAdvanceMs);
     }
   }
 
-  // C4. Wipes the dividers AND the finalized result, so a word already answered
-  // can be tried again on a revisit -- the one place attemptsPerItem: 1 gives
-  // way. Attempts already counted stay counted.
+  // C4. Wipes the dividers and re-opens the item without leaving it. Attempts
+  // already counted stay counted.
   function clearAnswer() {
     clearTimeout(advanceTimer);
     endDrag();
-    results.delete(itemIndex);
     dividers = new Set();
     oneSyllable = false;
     feedback = '';
@@ -263,16 +254,12 @@
     answered = false;
   }
 
+  // REVISITING AN ITEM RESETS IT (5D-SPEC2 §3, VERIFY-5D A5). Arriving at a
+  // word -- forwards or backwards, answered before or not -- presents it
+  // fresh. This is what Clear Answer used to be the manual workaround for
+  // (VERIFY3 asked for exactly this behavior on revisit); the button stays
+  // because it also re-opens an item without leaving it. Scores stand.
   function restoreItem() {
-    const result = results.get(itemIndex);
-    if (result) {
-      dividers = new Set(result.dividers);
-      oneSyllable = result.oneSyllable;
-      feedback = result.feedback;
-      feedbackKind = result.feedbackKind;
-      answered = true;
-      return;
-    }
     dividers = new Set();
     oneSyllable = false;
     feedback = '';
diff --git a/src/components/Marked.svelte b/src/components/Marked.svelte
index a0fa223..6914124 100644
--- a/src/components/Marked.svelte
+++ b/src/components/Marked.svelte
@@ -1,7 +1,7 @@
 <script>
-  // Renders one authored string, honoring inline [[u]]...[[/u]] underline
-  // spans and the "( ´ )" isolated-mark groups (see lib/markup.js). Segments
-  // are plain text nodes -- never {@html}.
+  // Renders one authored string, honoring the inline [[u]]...[[/u]] underline
+  // and [[g]]...[[/g]] descriptive-term spans, plus the "( ´ )" isolated-mark
+  // groups (see lib/markup.js). Segments are plain text nodes -- never {@html}.
   //
   // An isolated mark is a base-less diacritic: it needs the SPACING codepoint,
   // a font whose perispomeni is the rounded mark rather than a tilde, and the
@@ -22,4 +22,4 @@
   }
 </script>
 
-{#each splitUnderline(text) as seg}{#if seg.u}<u>{seg.t}</u>{:else}{#each splitMarkGroups(seg.t) as part}{#if part.group != null}<span class="mark-group">(&thinsp;<span class="isolated-mark" class:as-mark={kindOf(part.group) === 'mark'} class:greek={kindOf(part.group) === 'greek'}>{spacingMarks(part.group)}</span>&thinsp;)</span>{:else}{part.t}{/if}{/each}{/if}{/each}
+{#each splitUnderline(text) as seg}{#if seg.u}<u>{seg.t}</u>{:else if seg.g}<span class="term-green">{seg.t}</span>{:else}{#each splitMarkGroups(seg.t) as part}{#if part.group != null}<span class="mark-group">(&thinsp;<span class="isolated-mark" class:as-mark={kindOf(part.group) === 'mark'} class:greek={kindOf(part.group) === 'greek'}>{spacingMarks(part.group)}</span>&thinsp;)</span>{:else}{part.t}{/if}{/each}{/if}{/each}
diff --git a/src/components/PlaceAccentActivity.svelte b/src/components/PlaceAccentActivity.svelte
index 623c434..752cd2f 100644
--- a/src/components/PlaceAccentActivity.svelte
+++ b/src/components/PlaceAccentActivity.svelte
@@ -42,7 +42,6 @@
   let pronounceEach = activity.ui?.defaults?.pronounceEach ?? false;
   let advanceTimer = null;
   const attemptedWords = new Set();
-  const results = new Map();
 
   $: word = words[wordIndex] || null;
   $: answer = analyzeAccent(word && word.answerForm);
@@ -64,19 +63,12 @@
   // Live score (C3): reactive so it tracks every answer instead of freezing.
   $: scoreLine = scoreText(attempts, correct);
 
-  // Under attemptsPerItem: 1 a finalized word stays finalized on revisit --
-  // reopening it would let a wrong answer be retried and re-count attempts.
+  // REVISITING A WORD RESETS IT (5D-SPEC2 §3, VERIFY-5D A5). Arriving at a
+  // word presents it fresh — mark type and position cleared, feedback cleared,
+  // the slots unlocked — even if it was answered on an earlier pass, which is
+  // the original's behavior. Attempts already scored stand.
   // showAnswer stays user-controlled; the reveal is derived from `revealed`.
   function restoreWord() {
-    const result = results.get(wordIndex);
-    if (result) {
-      accentType = result.accentType;
-      accentPosition = result.accentPosition;
-      feedback = result.feedback;
-      feedbackKind = result.feedbackKind;
-      answered = true;
-      return;
-    }
     accentType = null;
     accentPosition = null;
     feedback = '';
@@ -110,13 +102,6 @@
     if (ok || oneAttempt) {
       answered = true;
       if (attemptedWords.size === words.length) markCompleted(activity.id);
-      results.set(wordIndex, {
-        accentType,
-        accentPosition,
-        feedback,
-        feedbackKind,
-        correct: ok
-      });
       clearTimeout(advanceTimer);
       advanceTimer = setTimeout(() => move(1), autoAdvanceMs);
     }
diff --git a/src/components/RichContent.svelte b/src/components/RichContent.svelte
index cb0794b..7aeceee 100644
--- a/src/components/RichContent.svelte
+++ b/src/components/RichContent.svelte
@@ -16,6 +16,12 @@
   import Paradigm from './Paradigm.svelte';
 
   export let blocks = [];
+  // greekTaps declared once for a whole topic/page, inherited by every block
+  // under it. Chapter 3's Learn Verbs page wires λύουσιν, λύουσι and λύω this
+  // way: the words sit in running prose across three different topics, and
+  // repeating the table on each block would be three chances to disagree.
+  // A block's own greekTaps still wins.
+  export let greekTaps = null;
   // The heading the HOST already printed above these blocks (topicPages prints
   // the topic title). A chart whose own title repeats it prints one heading,
   // not two — the chapter-3 Paradigm topic is titled "Paradigm" and so is its
@@ -55,6 +61,21 @@
   // Same lesson as biblist in chapter 2: normalize the shape at the renderer,
   // because the data is not ours to edit.
   const listItems = block => (block.items || []).map(it => (typeof it === 'string' ? { text: it } : (it || {})));
+  // LABEL STYLES on a numbered list (5D-SPEC2 §6). The original's chapter-3
+  // teaching lists lead each item with a term set apart from the sentence that
+  // follows — underlined (its blue hotwords: "Active voice", "Indicative mood",
+  // "First person") or merely bold ("Undefined action"). Those hotwords opened
+  // popups; the popups are the expander cards under the list, so the labels
+  // here are NOT tappable — blue means tappable and only tappable (directive 8),
+  // which is why an underline rather than a colour carries the emphasis.
+  //   'underline'  <u>label</u>, the original's hotword terms
+  //   'plain'      bold label, no underline
+  //   (absent)     the chapters-1/2/intro form: underlined lead + " — "
+  // The JOINER is the item text's own opening punctuation, not a renderer
+  // guess: "—simply states that…" joins tight, ":  subject does…" joins tight,
+  // "is the person(s)…" takes one space. A label style never invents a colon
+  // the data does not have.
+  const joiner = text => (!text || /^[\s—–:;,.!?-]/.test(text) ? '' : ' ');
   // AN EXAMPLE BLOCK is a para carrying its own line breaks. In the original
   // these are always the indented, line-per-example panels sitting under a lead
   // sentence — "Zachary drove the car. / Elliott is a good kid.", the
@@ -80,8 +101,8 @@
   // standalone occurrence per key) and render those substrings as tappable
   // spans. Greek NOT listed here stays plain (e.g. the red-highlighted π stays
   // untappable). Data contract (chat-side pipeline, chapters 2+): a greekTaps
-  // key marks the first occurrence of that exact string whose neighbors are
-  // not Greek letters — a single-letter key like "ζ" can never turn part of a
+  // key marks EVERY occurrence of that exact string whose neighbors are not
+  // Greek letters — a single-letter key like "ζ" can never turn part of a
   // longer Greek word in the same paragraph into a tap target. Matches render
   // as plain text nodes inside a <button> (never {@html}).
   const GREEK_LETTER = /[Ͱ-Ͽἀ-῿]/; // Greek + Greek Extended
@@ -103,12 +124,19 @@
     for (const [sub, audio] of Object.entries(taps)) {
       const next = [];
       for (const p of parts) {
-        const i = p.audio ? -1 : standaloneIndexOf(p.t, sub);   // only split plain segments
-        if (i === -1) { next.push(p); continue; }
-        if (i > 0) next.push({ t: p.t.slice(0, i) });
-        next.push({ t: sub, audio });
-        const rest = p.t.slice(i + sub.length);
-        if (rest) next.push({ t: rest });            // rest not re-scanned -> first occurrence only
+        if (p.audio) { next.push(p); continue; }     // already claimed by another key
+        // EVERY standalone occurrence, not just the first: two identical Greek
+        // words on one page must behave the same way. The Parsing Format topic
+        // prints λύω twice, and marking only the first left one blue-and-
+        // speaking and the other black-and-silent — which reads as "that one
+        // is not tappable" (directive 8) when it is the same word.
+        let rest = p.t;
+        for (let i = standaloneIndexOf(rest, sub); i !== -1; i = standaloneIndexOf(rest, sub)) {
+          if (i > 0) next.push({ t: rest.slice(0, i) });
+          next.push({ t: sub, audio });
+          rest = rest.slice(i + sub.length);
+        }
+        if (rest) next.push({ t: rest });
       }
       parts = next;
     }
@@ -129,7 +157,16 @@
       <div class="rc-subheading"><Marked text={b.text} /></div>
 
     {:else if b.type === 'para'}
-      <p class="rc-para" class:example-block={isExampleBlock(b)}><Marked text={b.text} /></p>
+      <!-- emphasis:"strong" / indent:true carry the original's own typography
+           on a body line ("Stem + Pronominal ending — λύ + ω" is bold and
+           indented under the sentence that introduces it). greekTaps makes the
+           named Greek words in the line tappable; anything not named stays
+           plain ink, which is how the λύ and ω MORPHEMES on that same line stay
+           untappable — they are fragments with no clip of their own. -->
+      {@const taps = b.greekTaps || greekTaps}
+      <p class="rc-para" class:example-block={isExampleBlock(b)}
+         class:rc-strong={b.emphasis === 'strong'} class:rc-indent={b.indent}
+      >{#if taps}{#each splitTaps(b.text, taps) as seg}{#if seg.audio}<button class="greek-tap greek" on:click={() => playAudio(seg.audio)}>{seg.t}</button>{:else}<Marked text={seg.t} />{/if}{/each}{:else}<Marked text={b.text} />{/if}</p>
       {#if b.example}
         <button class="rc-example" class:tappable={b.example.audio} on:click={() => playAudio(b.example.audio)}>
           <span class="greek">{b.example.greek}</span>
@@ -143,8 +180,9 @@
       {@const selfNum = (() => { const re = /^\(?\d+[.)]/; return items.length > 0 && items.every(it => it.label && re.test(it.label)); })()}
       <ol class="rc-list" class:authored-labels={selfNum}>
         {#each items as it}
+          {@const itemTaps = it.greekTaps || greekTaps}
           <li>
-            {#if it.label}{#if selfNum}<span class="rc-num">{it.label}</span>{it.text ? ' ' : ''}{:else}<span class="rc-lead">{it.label}</span>{it.text ? ' — ' : ''}{/if}{/if}{#if it.greekTaps}{#each splitTaps(it.text, it.greekTaps) as seg}{#if seg.audio}<button class="greek-tap greek" on:click={() => playAudio(seg.audio)}>{seg.t}</button>{:else}{seg.t}{/if}{/each}{:else}<Marked text={it.text || ''} />{/if}
+            {#if it.label}{#if selfNum}<span class="rc-num">{it.label}</span>{it.text ? ' ' : ''}{:else if b.labelStyle === 'underline'}<u class="rc-lead-u">{it.label}</u>{joiner(it.text)}{:else if b.labelStyle === 'plain'}<span class="rc-lead-plain">{it.label}</span>{joiner(it.text)}{:else}<span class="rc-lead">{it.label}</span>{it.text ? ' — ' : ''}{/if}{/if}{#if itemTaps}{#each splitTaps(it.text, itemTaps) as seg}{#if seg.audio}<button class="greek-tap greek" on:click={() => playAudio(seg.audio)}>{seg.t}</button>{:else}<Marked text={seg.t} />{/if}{/each}{:else}<Marked text={it.text || ''} />{/if}
             {#if it.example}
               <button class="rc-example" class:tappable={it.example.audio} on:click={() => playAudio(it.example.audio)}>
                 <span class="greek">{it.example.greek}</span>
@@ -298,7 +336,7 @@
         <summary><Marked text={b.label} /></summary>
         <div class="rc-expander-body">
           {#if b.content && b.content.length}
-            <svelte:self blocks={b.content} />
+            <svelte:self blocks={b.content} greekTaps={b.greekTaps || greekTaps} />
           {:else}
             <div class="pending-verification compact">Content pending verification.</div>
           {/if}
diff --git a/src/components/SelectActivity.svelte b/src/components/SelectActivity.svelte
index 70091bc..f8cb05e 100644
--- a/src/components/SelectActivity.svelte
+++ b/src/components/SelectActivity.svelte
@@ -13,8 +13,8 @@
   //                      (ch2 Accent Rule, ch3's five drills).
   //   autoBoth           one attempt; both outcomes auto-advance, incorrect on
   //                      the longer wait (ch3 Scripture Memory Drill).
-  // Chapter 2's older attemptsPerItem/autoAdvanceMs/autoAdvanceOnIncorrect
-  // fields map onto the same three classes, so its shipped feel is unchanged.
+  // Chapter 2's older attemptsPerItem/autoAdvanceOnIncorrect fields map onto
+  // the same three classes; its durations now come from the shared constants.
   // Completion: one-attempt drills complete on all-ATTEMPTED, retry drills on
   // all-correct.
   //
@@ -50,7 +50,6 @@
   let showScore = false;
   let advanceTimer = null;
   const attemptedItems = new Set();
-  const results = new Map();
 
   init();
   function init() {
@@ -63,7 +62,6 @@
     feedback = ''; picked = null; answered = false; finished = false;
     showGloss = false;
     attemptedItems.clear();
-    results.clear();
     pronounceEach = activity.ui?.defaults?.pronounceEach ?? true;
     // D1: the score line starts HIDDEN on every scored surface. ui.liveScore
     // says the line updates live once revealed, not that it opens by itself --
@@ -94,6 +92,17 @@
   // labels are 46 characters — two columns inside 320px would be unreadable).
   $: optionGroups = optionClass === 'grouped' ? sliceGroups(currentOptions, activity.optionGroups) : null;
   $: greekOptions = !!activity.optionsAreGreek || activity.options === 'greek' || activity.generator?.options === 'lower';
+  // The two-up Greek pool (D-19): the ch1/ch2/ch3 English-to-Greek vocabulary
+  // grids. Four-up from the iPad breakpoint, where the width exists — the CSS
+  // owns the breakpoint, this only says which grid it applies to. Excludes the
+  // single-column and grouped layouts, which are stacked for label length.
+  $: greekPool = greekOptions && !wideOptions && optionClass !== 'single';
+  // A LONG Greek prompt cannot have the 3rem type a single letter gets. At
+  // 320px, πιστεύουσι sets 268px of glyph into 260px of card and the tail is
+  // lost in silence (overflow-x is hidden app-wide). Declared here rather than
+  // guessed in CSS, which cannot see how long a string is; chapter 1's letter
+  // prompts and chapter 2's short words are below the threshold and unchanged.
+  $: longPrompt = promptIsGreek && [...String(current?.prompt || '')].length > 7;
   $: uiButtons = activity.ui?.buttons || [];
   $: showPronounce = !authoredOptions || uiButtons.includes('Pronounce');
   $: showStepper = uiButtons.includes('Previous') || uiButtons.includes('Next');
@@ -176,8 +185,9 @@
     if (right && pronounceEach && current.answerAudio) play(current.answerAudio);
     if (right || oneAttempt) {
       // One attempt: the item is done either way and the answer is revealed.
+      // "One attempt" is scoped to this VISIT — coming back to the item
+      // reopens it (see restore()).
       answered = true;
-      results.set(qIndex, { picked, feedback, feedbackKind });
       // Completion is defined by attempted items, so record the final item when
       // it is ANSWERED. Route exit cancels the timer, not progress.
       if (oneAttempt && attemptedItems.size === questions.length && activity.id) markCompleted(activity.id);
@@ -202,18 +212,18 @@
     }
   }
 
-  // Under attemptsPerItem: 1 a finalized item stays finalized on revisit --
-  // reopening it would let a wrong answer be retried and re-count attempts.
+  // REVISITING AN ITEM RESETS IT (5D-SPEC2 §3, VERIFY-5D A5). This is the
+  // original's behavior and it reverses what the port shipped: a one-attempt
+  // item used to stay finalized, so stepping back showed the previous
+  // selection, its correct/incorrect styling and the locked grid. Now every
+  // arrival at an item presents it fresh and the student may answer again.
+  //
+  // The SCORE is not rewound. attempts/correct count attempts, not the current
+  // state of the grid, and `attemptedItems` (which drives completion for
+  // one-attempt drills) is a set — answering an item twice neither
+  // double-counts completion nor un-completes it.
   function restore() {
-    const result = results.get(qIndex);
     showGloss = false;
-    if (result && oneAttempt) {
-      picked = result.picked;
-      feedback = result.feedback;
-      feedbackKind = result.feedbackKind;
-      answered = true;
-      return;
-    }
     picked = null; answered = false; feedback = ''; feedbackKind = '';
   }
 
@@ -261,7 +271,10 @@
            which metric the browser picks for the strut. -->
       <button class="prompt greek greek-say red-mark" aria-label={current.prompt} disabled={!current.promptAudio} on:click={() => current.promptAudio && play(current.promptAudio)}>{#each redParts as part}{#if part.marks}<span class="rm-cluster" class:legacy={part.layout} style={part.bx || part.aw ? `--bx:${part.bx || 0}em; --aw:${part.aw || 0}em` : null}><span class="rm-marks {part.layout || ''}" class:capital={part.capital} aria-hidden="true">{#each part.marks as mark}<span class="rm-mark {mark.slot || ''}" class:red={mark.red} style={mark.x != null ? `--mx:${mark.x}em; --my:${mark.y}em${mark.clip ? `; clip-path:polygon(${mark.clip[0]}em -3em, ${mark.clip[1]}em -3em, ${mark.clip[1]}em 3em, ${mark.clip[0]}em 3em)` : ''}` : null}>{mark.glyph}</span>{/each}</span><span class="rm-base">{part.base}</span></span>{:else if part.red}<span class="mark-red">{part.text}</span>{:else}{part.text}{/if}{/each}</button>
     {:else if promptIsGreek && current.promptAudio}
-      <button class="prompt greek greek-say" on:click={() => play(current.promptAudio)}>{current.prompt}</button>
+      <!-- The red-mark branch above deliberately does NOT take this class: its
+           mark offsets are em-relative and correct, and nothing about mark
+           geometry moves in this round. -->
+      <button class="prompt greek greek-say" class:long={longPrompt} on:click={() => play(current.promptAudio)}>{current.prompt}</button>
     {:else if current.underline && sentenceParts(current.prompt, current.underline)}
       {@const parts = sentenceParts(current.prompt, current.underline)}
       <div class="prompt select-sentence">{parts[0]}<u>{parts[1]}</u>{parts[2]}</div>
@@ -304,7 +317,7 @@
           {/each}
         </div>
       {:else}
-        <div class="grid options" class:wide={wideOptions} class:single={optionClass === 'single'}>
+        <div class="grid options" class:wide={wideOptions} class:single={optionClass === 'single'} class:greek-pool={greekPool}>
           {#each currentOptions as opt}
             <button
               class="tile small"
diff --git a/src/components/SpellActivity.svelte b/src/components/SpellActivity.svelte
index 2c8d734..d77ced5 100644
--- a/src/components/SpellActivity.svelte
+++ b/src/components/SpellActivity.svelte
@@ -2,16 +2,20 @@
   // Word Spelling Exercise (Vocabulary, and from chapter 3 the Present Active
   // Verb speller). English meaning is shown; the student spells the Greek word
   // using the shared tile keyboard or a physical keyboard (legacy roman->Greek
-  // layout). Diacritic tiles combine onto the previous character and
-  // NFC-normalize. Grading honors the "With Accents" toggle and otherwise
-  // follows the one shared policy in lib/answer-check.js.
+  // layout). Typing goes through the shared buffer in lib/speller-input.js
+  // (tap-to-position caret, diacritics that combine onto the cluster before the
+  // caret and wait for a letter when there is none). Grading honors the "With
+  // Accents" toggle and otherwise follows the one shared policy in
+  // lib/answer-check.js.
   import { onMount, onDestroy } from 'svelte';
   import { getLemma, randomFeedback } from '../lib/content.js';
   import { play } from '../lib/audio.js';
   import { markCompleted } from '../lib/progress.js';
   import { spellingMatches } from '../lib/answer-check.js';
   import { ADVANCE_CORRECT_MS } from '../lib/timing.js';
+  import * as input from '../lib/speller-input.js';
   import SpellerKeyboard, { KEYMAP, PUNCT_KEYS } from './SpellerKeyboard.svelte';
+  import SpellerField from './SpellerField.svelte';
   export let chapter;
   export let activity;
 
@@ -32,7 +36,13 @@
     : [];
 
   let wordIndex = 0;
-  let built = '';
+  // One typing model for every spell surface (lib/speller-input.js): the same
+  // grapheme-cluster buffer, caret and held-diacritic rules the whole-verse
+  // speller uses. The keyboard has been shared since D-15; letting the two
+  // surfaces keep private copies of "what a keystroke does" is the same fork
+  // by another route, and it is where the VERIFY-5D A6 defects lived.
+  let buffer = input.clear();
+  $: built = buffer.text;
   let feedback = '';
   let feedbackKind = '';
   let showAnswer = false;
@@ -49,30 +59,19 @@
 
   $: word = words[wordIndex];
 
-  function appendChar(ch) { built += ch; }
-  function appendMark(apply) {
-    if (!built) return;                       // nothing to combine onto
-    built = (built + apply).normalize('NFC');
-  }
-  function backspace() {
-    if (!built) return;
-    // Drop a whole grapheme: strip trailing combining marks then the base.
-    const nfd = built.normalize('NFD');
-    let end = nfd.length;
-    while (end > 0 && /\p{M}/u.test(nfd[end - 1])) end -= 1;
-    if (end > 0) end -= 1;
-    built = nfd.slice(0, end).normalize('NFC');
-  }
-  function clearInput() { built = ''; }
+  function appendChar(ch) { buffer = input.insertText(buffer, ch); }
+  function appendMark(apply) { buffer = input.applyMark(buffer, apply); }
+  function backspace() { buffer = input.backspace(buffer); }
+  function clearInput() { buffer = input.clear(); }
 
   function check() {
     if (!word) return;
     // One shared policy (Phase 0): "With Accents" ON requires every mark to be
-    // right; case, punctuation and the movable nu stay lenient either way.
+    // right; case and punctuation stay lenient either way. A final nu is
+    // compared like any other letter (D-16 withdrawn, 5D-SPEC2 §2).
     const ok = spellingMatches(built, word.greek, {
       withAccents,
-      punctuationOptional: activity.punctuationOptional !== false,
-      movableNu: activity.movableNu !== false
+      punctuationOptional: activity.punctuationOptional !== false
     });
     totalAttempts += 1;
     if (ok) {
@@ -90,7 +89,7 @@
   }
 
   function resetWordState() {
-    built = '';
+    buffer = input.clear();
     feedback = '';
     feedbackKind = '';
     showAnswer = false;                       // Next resets Show Answer (critique 21)
@@ -117,6 +116,8 @@
     if (e.metaKey || e.ctrlKey || e.altKey) return;
     if (e.key === 'Backspace') { e.preventDefault(); backspace(); return; }
     if (e.key === 'Enter') { e.preventDefault(); check(); return; }
+    if (e.key === 'ArrowLeft') { e.preventDefault(); buffer = input.placeCaret(buffer, buffer.caret - 1, false); return; }
+    if (e.key === 'ArrowRight') { e.preventDefault(); buffer = input.placeCaret(buffer, buffer.caret + 1, false); return; }
     // Space would scroll the page, so it is claimed here as well as mapped.
     if (PUNCT_KEYS[e.key]) { e.preventDefault(); appendChar(PUNCT_KEYS[e.key]); return; }
     const g = KEYMAP[e.key.toLowerCase()];
@@ -130,8 +131,11 @@
   <div class="spell-panes">
     <div class="flash-pane"><div class="label">English Meaning</div>
       <div class="value" style="font-size:1.2rem">{word ? word.gloss : ''}</div></div>
-    <div class="flash-pane"><div class="label">Spell Greek Word</div>
-      <div class="value greek spell-target">{built}<span class="caret">|</span></div></div>
+    <SpellerField
+      state={buffer}
+      label="Spell Greek Word"
+      on:caret={e => (buffer = input.placeCaret(buffer, e.detail.index, e.detail.after))}
+      on:caretEnd={() => (buffer = input.caretToEnd(buffer))} />
   </div>
 
   <div class="feedback {feedbackKind}">{feedback}</div>
diff --git a/src/components/SpellVerseActivity.svelte b/src/components/SpellVerseActivity.svelte
index 92b2f8b..bb42ec8 100644
--- a/src/components/SpellVerseActivity.svelte
+++ b/src/components/SpellVerseActivity.svelte
@@ -22,14 +22,21 @@
   import { markCompleted } from '../lib/progress.js';
   import { checkVerse } from '../lib/answer-check.js';
   import { HINT_VISIBLE_MS } from '../lib/timing.js';
+  import * as input from '../lib/speller-input.js';
   import SpellerKeyboard, { KEYMAP, PUNCT_KEYS } from './SpellerKeyboard.svelte';
+  import SpellerField from './SpellerField.svelte';
   export let chapter;
   export let activity;
 
   $: answerWords = activity.answerWords || [];
   $: verseText = answerWords.join(' ');
 
-  let built = '';
+  // The typing buffer is the shared model (lib/speller-input.js): a string, a
+  // grapheme-cluster caret, and any diacritic still waiting for a letter. The
+  // two VERIFY-5D A6 typing defects both lived in the hand-rolled version this
+  // replaces — see that file for what each of them was.
+  let buffer = input.clear();
+  $: built = buffer.text;
   let feedback = '';
   let feedbackKind = '';
   let detail = null;          // { text, word? } — the word renders in the Greek face
@@ -42,27 +49,17 @@
     ? chapter.alphabet.letters.map(l => (l.lower === 'σ/ς' ? 'σ' : l.lower))
     : [];
 
-  function appendChar(ch) { if (!solved) built += ch; }
-  function appendMark(apply) {
-    if (solved || !built) return;                 // nothing to combine onto
-    built = (built + apply).normalize('NFC');
-  }
-  function backspace() {
-    if (solved || !built) return;
-    // Drop a whole grapheme: strip trailing combining marks then the base.
-    const nfd = built.normalize('NFD');
-    let end = nfd.length;
-    while (end > 0 && /\p{M}/u.test(nfd[end - 1])) end -= 1;
-    if (end > 0) end -= 1;
-    built = nfd.slice(0, end).normalize('NFC');
-  }
-  function clearInput() { if (!solved) built = ''; }
+  function appendChar(ch) { if (!solved) buffer = input.insertText(buffer, ch); }
+  function appendMark(apply) { if (!solved) buffer = input.applyMark(buffer, apply); }
+  function backspace() { if (!solved) buffer = input.backspace(buffer); }
+  function clearInput() { if (!solved) buffer = input.clear(); }
+  function moveCaret(index, after) { if (!solved) buffer = input.placeCaret(buffer, index, after); }
+  function caretToEnd() { if (!solved) buffer = input.caretToEnd(buffer); }
 
   function check() {
     const result = checkVerse(built, answerWords, {
       withAccents,
-      punctuationOptional: activity.punctuationOptional !== false,
-      movableNu: activity.movableNu !== false
+      punctuationOptional: activity.punctuationOptional !== false
     });
     if (result.ok) {
       solved = true;
@@ -81,7 +78,7 @@
   }
 
   function restart() {
-    built = '';
+    buffer = input.clear();
     feedback = '';
     feedbackKind = '';
     detail = null;
@@ -113,6 +110,10 @@
     if (showHint) hideHint();
     if (e.key === 'Backspace') { e.preventDefault(); backspace(); return; }
     if (e.key === 'Enter') { e.preventDefault(); check(); return; }
+    // Tap-to-position is the contract (A6 defect 1); the arrow keys are the
+    // desktop convenience layer, same as KEYMAP.
+    if (e.key === 'ArrowLeft') { e.preventDefault(); if (!solved) buffer = input.placeCaret(buffer, buffer.caret - 1, false); return; }
+    if (e.key === 'ArrowRight') { e.preventDefault(); if (!solved) buffer = input.placeCaret(buffer, buffer.caret + 1, false); return; }
     if (PUNCT_KEYS[e.key]) { e.preventDefault(); appendChar(PUNCT_KEYS[e.key]); return; }
     const g = KEYMAP[e.key.toLowerCase()];
     if (g) { e.preventDefault(); appendChar(g); }
@@ -127,10 +128,13 @@
 <div class="card speller spellverse">
   {#if activity.reference}<div class="sv-ref">{activity.reference}</div>{/if}
 
-  <div class="flash-pane">
-    <div class="label">{activity.ui?.fields?.[0] || 'Spell Greek'}</div>
-    <div class="value greek sv-target">{built}{#if !solved}<span class="caret">|</span>{/if}</div>
-  </div>
+  <SpellerField
+    state={buffer}
+    label={activity.ui?.fields?.[0] || 'Spell Greek'}
+    fieldClass="sv-target"
+    locked={solved}
+    on:caret={e => moveCaret(e.detail.index, e.detail.after)}
+    on:caretEnd={caretToEnd} />
 
   <div class="feedback {feedbackKind}">{feedback}</div>
   {#if detail}
diff --git a/src/data/chapt-02.json b/src/data/chapt-02.json
index 634609a..b01c6b6 100644
--- a/src/data/chapt-02.json
+++ b/src/data/chapt-02.json
@@ -1963,8 +1963,7 @@
    },
    "scored": true,
    "answerPolicy": {
-    "attemptsPerItem": "retry",
-    "autoAdvanceMs": null
+    "attemptsPerItem": "retry"
    },
    "_verify_resolved": "Pool + counts DOSBox-confirmed 2026-07-24 (all 20 derived counts matched; kai uses the one-syllable bar). Original's score dialog can overcount on revisits (22/20 witnessed) — our scoring counts each item once.",
    "hint": {
@@ -2174,7 +2173,6 @@
    "answerPolicy": {
     "attemptsPerItem": 1,
     "revealCorrectForm": true,
-    "autoAdvanceMs": 4000,
     "autoAdvanceOnIncorrect": false
    },
    "hint": {
@@ -2458,8 +2456,7 @@
    },
    "scored": true,
    "answerPolicy": {
-    "attemptsPerItem": 1,
-    "autoAdvanceMs": 4000
+    "attemptsPerItem": 1
    },
    "_answers_note": "25-item pool, order, options, and instruction DOSBox-verified. Answers read from the red-rendered mark in the screenshots (redMarkCluster = 1-based grapheme cluster carrying the red mark; item 18's mark assignment is the one judgment call). Original's score dialog says 'Drills Available: 35' — an original bug (both passes yielded the same 25 items); we use 25."
   },
@@ -2632,8 +2629,7 @@
    ],
    "scored": true,
    "answerPolicy": {
-    "attemptsPerItem": 1,
-    "autoAdvanceMs": 4000
+    "attemptsPerItem": 1
    },
    "_answers_note": "29 items, option labels, underlines, and instruction DOSBox-verified (VERIFY D4 screenshots). Answers anchored by green-confirmed device results (Greek/Noun, amazing/Adjective, multimedia/Adjective, do/Verb, over/Preposition, good/Adjective) and standard grammar for the rest.",
    "ui": {
@@ -2946,8 +2942,7 @@
    "oneSyllableButton": "Click Here If There Is Only One Syllable",
    "answerPolicy": {
     "attemptsPerItem": 1,
-    "revealDividedForm": true,
-    "autoAdvanceMs": 4000
+    "revealDividedForm": true
    },
    "_answers_note": "Pool DOSBox-verified: the 20 vocabulary words (ch1+ch2), NOT the b_ex2 files (those belong to Accent Placement). Divisions sourced from the original's own syllable charts (One Vowel/2 Consonants/2 Vowels popups + Syllable Names), which cover all 20 words: kurios divides kur-i-os per the chart's explicit note, Petros = Pet-ros and Christos = Chris-tos per the 2-Consonants chart (Nathanael's 'false negative' on Christos matches the original's own Chris-tos division). division[] = 1-based gap indices between grapheme clusters (gap i sits between cluster i and i+1). Scoring is correctness-first per Nathanael (VERIFY E1)."
   },
@@ -3189,8 +3184,7 @@
    "scored": true,
    "answerPolicy": {
     "attemptsPerItem": 1,
-    "revealAnswerForm": true,
-    "autoAdvanceMs": 4000
+    "revealAnswerForm": true
    },
    "hint": {
     "content": [
diff --git a/src/data/chapt-03.json b/src/data/chapt-03.json
index 1ab00df..a1f9b23 100644
--- a/src/data/chapt-03.json
+++ b/src/data/chapt-03.json
@@ -94,15 +94,15 @@
        "items": [
         {
          "label": "Active voice",
-         "text": "subject does the action of the verb."
+         "text": ":  subject does the action of the verb."
         },
         {
          "label": "Passive voice",
-         "text": "subject receives the action of the verb."
+         "text": ":  subject receives the action of the verb."
         },
         {
          "label": "Middle voice",
-         "text": "where the subject acts on him/herself (reflexive) or members of a group interact among themselves (reciprocal).  In Greek, self-interest may be reflected in the middle voice."
+         "text": ":  where the subject acts on him/herself (reflexive) or members of a group interact among themselves (reciprocal).  In Greek, self-interest may be reflected in the middle voice."
         }
        ],
        "labelStyle": "underline"
@@ -207,7 +207,7 @@
        "content": [
         {
          "type": "para",
-         "text": "I studied Greek.\nWe studied Greek."
+         "text": "[[u]]I[[/u]] studied Greek.\n[[u]]We[[/u]] studied Greek."
         }
        ]
       },
@@ -217,7 +217,7 @@
        "content": [
         {
          "type": "para",
-         "text": "You studied Greek.\nYou both studied Greek."
+         "text": "[[u]]You[[/u]] studied Greek.\n[[u]]You[[/u]] both studied Greek."
         }
        ]
       },
@@ -227,7 +227,7 @@
        "content": [
         {
          "type": "para",
-         "text": "She studied Greek.\nThey studied Greek."
+         "text": "[[u]]She[[/u]] studied Greek.\n[[u]]They[[/u]] studied Greek."
         }
        ]
       }
@@ -301,13 +301,14 @@
        "items": [
         {
          "label": "Undefined action",
-         "text": "I loose, I run"
+         "text": ":  I loose, I run"
         },
         {
          "label": "Continuous action",
-         "text": "I am loosing, I am running"
+         "text": ":  I am loosing, I am running"
         }
-       ]
+       ],
+       "labelStyle": "plain"
       },
       {
        "type": "para",
@@ -434,7 +435,8 @@
       },
       {
        "type": "para",
-       "text": "λύουσιν instead of λύουσι"
+       "text": "λύουσιν instead of λύουσι",
+       "indent": true
       },
       {
        "type": "refs",
@@ -2283,4 +2285,4 @@
   "c3_learn_bibliography"
  ],
  "_sequence_note": "DOSBox-verified rail order, 5D-RECON-RESULTS D1 (Nathanael, 2026-07-28)."
-}
\ No newline at end of file
+}
diff --git a/src/lib/answer-check.js b/src/lib/answer-check.js
index 469b631..69dfe1f 100644
--- a/src/lib/answer-check.js
+++ b/src/lib/answer-check.js
@@ -5,10 +5,20 @@
 //
 //   With Accents OFF   accent/breathing/subscript-insensitive, case-
 //                      insensitive, final sigma = sigma, punctuation
-//                      optional, movable nu optional, whitespace normalized.
+//                      optional, whitespace normalized.
 //   With Accents ON    every mark must be exactly right — and nothing else
 //                      changes: still case-insensitive, still punctuation-
-//                      optional, still movable-nu lenient.
+//                      optional.
+//
+// THERE IS NO MOVABLE-NU LENIENCY (D-16 WITHDRAWN, 5D-SPEC2 §2). A final nu is
+// compared like any other letter. The leniency that used to live here existed
+// to cover a DERIVATION ERROR — the assembler produced λύουσιν where the
+// original authors λύουσι — not a linguistic subtlety. The original's own
+// OpenScript answer tables author one form per item (item 3 `lu<ousi`, item 15
+// `le<gousi`, item 24 `pisteuousi`), the delivered data now carries them, and
+// the assembler fails if a derived form disagrees with a recovered one.
+// Movable nu is real Greek and the chapter teaches it, but it is a per-word
+// authored choice, never a checker rule. Do not re-introduce it.
 //
 // CASE IS NEVER REQUIRED, under either toggle, because the shared keyboard
 // has no capitals and the Phase 0 decision was to keep it that way rather
@@ -27,28 +37,17 @@ export function stripPunctuation(text) {
   return (text || '').replace(PUNCTUATION, '');
 }
 
-// MOVABLE NU (divergence log D-16). Scoped deliberately to -σι(ν): that is the
-// 3rd-plural case D-16 authorizes and the only one the chapter-3 data flags.
-// The chapter text also mentions words ending in ε, but a blanket -ε(ν) fold
-// would swallow the real 1st-plural ending: λύομεν would collapse to λύομε and
-// the drill would accept a genuinely wrong form.
-function foldMovableNu(word) {
-  return word.replace(/σιν$/u, 'σι');
-}
-
 // One comparison key. Two spellings match iff their keys are equal.
 export function spellingKey(text, options) {
   const {
     withAccents = false,
-    punctuationOptional = true,
-    movableNu = true
+    punctuationOptional = true
   } = options || {};
   let out = (text || '').normalize('NFC');
   if (punctuationOptional) out = stripPunctuation(out);
   out = out.replace(/\s+/gu, ' ').trim().toLowerCase();
   if (!withAccents) out = out.normalize('NFD').replace(/\p{M}/gu, '');
   out = out.replace(/ς/gu, 'σ').normalize('NFC');
-  if (movableNu) out = out.split(' ').map(foldMovableNu).join(' ');
   return out;
 }
 
diff --git a/src/lib/markup.js b/src/lib/markup.js
index 8cb3b0e..c447b01 100644
--- a/src/lib/markup.js
+++ b/src/lib/markup.js
@@ -6,25 +6,37 @@
 // than splitting every example into fragments. Only RichContent renders the
 // spans; every other surface strips the markers so a marker can never reach
 // the screen as literal text.
+//
+// TWO INLINE SPANS, one syntax:
+//   [[u]]…[[/u]]  underline — the original's own emphasis
+//   [[g]]…[[/g]]  dark green — a DESCRIPTIVE TERM sharing a line with the
+//                 example it describes ("Come here. — command", "Terry kicked
+//                 himself. — reflexive"). The original sets the example and its
+//                 label in one line and relies on the reader to tell them
+//                 apart; green is the port's way of doing that, and the colour
+//                 is the ink/dark-green already used for asides — NEVER blue,
+//                 which means tappable and only tappable (directive 8).
+// The two never nest in shipped data, and the splitter is written so a nested
+// pair would still emit both runs' text rather than swallowing one.
 
-const UNDERLINE = /\[\[u\]\]([\s\S]*?)\[\[\/u\]\]/g;
-const ANY_MARKER = /\[\[\/?u\]\]/g;
+const INLINE = /\[\[([ug])\]\]([\s\S]*?)\[\[\/\1\]\]/g;
+const ANY_MARKER = /\[\[\/?[ug]\]\]/g;
 
-// [{ t, u }] segments in source order; u marks an underlined run.
+// [{ t, u, g }] segments in source order; u/g mark an underlined/green run.
 export function splitUnderline(text) {
   const src = text == null ? '' : String(text);
-  if (!src.includes('[[')) return [{ t: src, u: false }];
+  if (!src.includes('[[')) return [{ t: src, u: false, g: false }];
   const parts = [];
   let at = 0;
-  UNDERLINE.lastIndex = 0;
-  for (let m = UNDERLINE.exec(src); m; m = UNDERLINE.exec(src)) {
-    if (m.index > at) parts.push({ t: src.slice(at, m.index), u: false });
-    if (m[1]) parts.push({ t: m[1], u: true });
+  INLINE.lastIndex = 0;
+  for (let m = INLINE.exec(src); m; m = INLINE.exec(src)) {
+    if (m.index > at) parts.push({ t: src.slice(at, m.index), u: false, g: false });
+    if (m[2]) parts.push({ t: m[2], u: m[1] === 'u', g: m[1] === 'g' });
     at = m.index + m[0].length;
   }
-  if (at < src.length) parts.push({ t: src.slice(at), u: false });
+  if (at < src.length) parts.push({ t: src.slice(at), u: false, g: false });
   // An unbalanced marker leaves stray text; strip it rather than print it.
-  return parts.map(p => (p.u ? p : { ...p, t: p.t.replace(ANY_MARKER, '') }));
+  return parts.map(p => (p.u || p.g ? p : { ...p, t: p.t.replace(ANY_MARKER, '') }));
 }
 
 // ---- Isolated marks in parentheses (5B-SPEC2 B1) ----
@@ -58,7 +70,7 @@ export function splitMarkGroups(text) {
   return parts.length ? parts : [{ t: src }];
 }
 
-// Defensive: the same string on a surface with no underline support.
+// Defensive: the same string on a surface with no inline-span support.
 export function stripMarkup(text) {
   if (text == null) return text;
   const src = String(text);
diff --git a/src/lib/timing.js b/src/lib/timing.js
index 891a039..04f49a8 100644
--- a/src/lib/timing.js
+++ b/src/lib/timing.js
@@ -5,11 +5,19 @@
 // constants here, once, for the whole app.
 //
 // The original's per-surface waits were ~2s on correct and ~4s on incorrect.
-// Both read slow on device (5B), so the port ships the numbers below; the
-// SEMANTICS (which surfaces auto-advance, and on which outcome) stay faithful.
+// The 5D proposal tuned them down to 900/2500; the device pass REJECTED that
+// (VERIFY-5D, D-14 ratified at the values below) and the port now restores the
+// original's pace. The SEMANTICS (which surfaces auto-advance, and on which
+// outcome) were always faithful; only these two numbers move.
+//
+// THESE VALUES ARE RETROACTIVE. Chapter 2's per-activity `autoAdvanceMs: 4000`
+// literals were removed from the data in 5D-SPEC2, so ch1, ch2 and ch3 all
+// read the same two numbers. No component and no data file carries its own
+// advance duration: the per-activity `autoAdvanceMs` override is gone from
+// resolveAdvance as well as from the data.
 
-export const ADVANCE_CORRECT_MS = 900;
-export const ADVANCE_INCORRECT_MS = 2500;
+export const ADVANCE_CORRECT_MS = 2000;
+export const ADVANCE_INCORRECT_MS = 4000;
 
 // How long a Major Hint stays on screen before clearing itself (5D device
 // pass, Nathanael). The hint is a GLANCE, not a crib sheet: it is available at
@@ -29,10 +37,11 @@ export const HINT_VISIBLE_MS = 7000;
 //                     the longer wait (ch3 Scripture Memory Drill)
 //
 // Chapter 2 predates advanceClass and declares its policy with the older
-// attemptsPerItem / autoAdvanceMs / autoAdvanceOnIncorrect fields. Those map
-// onto exactly the same three classes and an explicit autoAdvanceMs still
-// wins, so ch2's shipped ~4s feel is unchanged until it is retuned at its next
-// touch (D-14).
+// attemptsPerItem / autoAdvanceOnIncorrect fields. Those map onto exactly the
+// same three classes. The DURATION is no longer negotiable: the per-activity
+// autoAdvanceMs override is gone (5D-SPEC2 §3), the ch2 literals that used it
+// were removed from the data, and scripts/check-content-shapes.mjs fails the
+// build if any data file re-introduces one.
 export function resolveAdvance(policy) {
   const p = policy || {};
   const advanceClass = p.advanceClass || (
@@ -40,14 +49,11 @@ export function resolveAdvance(policy) {
       ? (p.autoAdvanceOnIncorrect === false ? 'manualOnIncorrect' : 'autoBoth')
       : 'retry'
   );
-  // `?? ` and not `||`: chapter 2 writes autoAdvanceMs: null to mean "the
-  // default", which is what the components did with it before this module.
-  const correctMs = p.autoAdvanceMs ?? ADVANCE_CORRECT_MS;
   return {
     advanceClass,
     oneAttempt: advanceClass !== 'retry',
     autoOnIncorrect: advanceClass === 'autoBoth',
-    correctMs,
-    incorrectMs: p.autoAdvanceMs ?? ADVANCE_INCORRECT_MS
+    correctMs: ADVANCE_CORRECT_MS,
+    incorrectMs: ADVANCE_INCORRECT_MS
   };
 }
```

### New file: src/lib/speller-input.js

```js
// SPELLER INPUT MODEL — the typing buffer every spell surface shares
// (SpellActivity and SpellVerseActivity). Both spellers used to keep their own
// copy of "append a character / combine a mark / drop a grapheme", which is
// exactly the per-surface fork the shared keyboard (D-15) exists to prevent.
// Two of the three VERIFY-5D A6 defects were in that duplicated code.
//
// The buffer is a string PLUS a caret, both measured in GRAPHEME CLUSTERS, not
// UTF-16 units — "ἁ" is one thing to delete, one thing to step over and one
// thing to tap on. Every function here is pure: it takes a state and returns a
// new one, so the components stay declarative and this file is testable on its
// own.
//
//   { text, caret, pendingMark }
//     text         the NFC string being graded
//     caret        cluster index in [0, clusters.length]; insertion point
//     pendingMark  combining marks typed with no letter to sit on yet
//
// PENDING MARKS are the fix for the second A6 defect. A breathing typed at the
// start of a word (`ὁ` space `᾿` `Ι`) used to be appended to whatever character
// happened to precede it — the SPACE — so the mark rendered on the space, the
// word boundary was visually eaten, and the iota that followed came out bare.
// A mark with no letter before it is now HELD and applied to the next letter
// entered. Whitespace and punctuation never take a mark and never consume one:
// the queue survives them, so "space then breathing then iota" and "breathing
// then space then iota" both produce the same ἰ.

import { splitGraphemes } from './greek.js';

export const EMPTY = { text: '', caret: 0, pendingMark: '' };

// A cluster that can carry a diacritic. Marks belong on letters; a space, a
// comma or a raised dot is never a base.
const isBase = cluster => !!cluster && /\p{L}/u.test(cluster);

export function clustersOf(state) {
  return splitGraphemes(state.text);
}

function rebuild(clusters, caret, pendingMark) {
  return {
    text: clusters.join('').normalize('NFC'),
    caret: Math.max(0, Math.min(caret, clusters.length)),
    pendingMark: pendingMark || ''
  };
}

// Insert plain text (a letter tile, a composite, punctuation, a space) at the
// caret. A held mark is consumed here — but only by a real base letter.
export function insertText(state, text) {
  if (!text) return state;
  const clusters = clustersOf(state);
  let incoming = splitGraphemes(text);
  let pending = state.pendingMark;
  if (pending && incoming.length && isBase(incoming[0])) {
    incoming = [...incoming];
    incoming[0] = (incoming[0] + pending).normalize('NFC');
    pending = '';
  }
  clusters.splice(state.caret, 0, ...incoming);
  return rebuild(clusters, state.caret + incoming.length, pending);
}

// Apply a diacritic (or a breathing+accent pair — `apply` may be two combining
// codepoints) to the cluster BEFORE the caret. With no base there, hold it.
export function applyMark(state, mark) {
  if (!mark) return state;
  const clusters = clustersOf(state);
  const at = state.caret - 1;
  const target = at >= 0 ? clusters[at] : null;
  if (!isBase(target)) {
    // No letter to sit on: queue it for the next letter rather than letting it
    // land on a space (the A6 defect) or vanish silently.
    return { ...state, pendingMark: state.pendingMark + mark };
  }
  clusters[at] = (target + mark).normalize('NFC');
  return rebuild(clusters, state.caret, state.pendingMark);
}

// Backspace. A held mark is dropped first — it is the most recent thing typed
// and it is not in `text` yet, so deleting a whole cluster instead would look
// like the key did two things at once.
export function backspace(state) {
  if (state.pendingMark) {
    const marks = [...state.pendingMark];
    marks.pop();
    return { ...state, pendingMark: marks.join('') };
  }
  if (state.caret <= 0) return state;
  const clusters = clustersOf(state);
  clusters.splice(state.caret - 1, 1);
  return rebuild(clusters, state.caret - 1, '');
}

export function clear() {
  return { ...EMPTY };
}

// Tap-to-position (the first A6 defect: entry was append-only, so a mistake in
// word one cost the whole verse). `index` is the cluster tapped and `after`
// says which half of it was hit.
export function placeCaret(state, index, after) {
  const clusters = clustersOf(state);
  const caret = Math.max(0, Math.min(index + (after ? 1 : 0), clusters.length));
  // Moving the caret abandons a held mark: it was queued for a letter in the
  // place the learner has just left.
  return { ...state, caret, pendingMark: '' };
}

export function caretToEnd(state) {
  return { ...state, caret: clustersOf(state).length, pendingMark: '' };
}

// Seed a buffer from a string (restart, or a fresh word in the stepper).
export function fromText(text) {
  const value = (text || '').normalize('NFC');
  return { text: value, caret: splitGraphemes(value).length, pendingMark: '' };
}
```

### New file: src/components/SpellerField.svelte

```svelte
<script>
  // THE TYPED-TEXT FIELD both spellers show. Not an <input>: on the iPhone this
  // app is built for, a real text field (or contenteditable) summons the
  // system keyboard over the tile keyboard, which is the one thing the shared
  // speller must never do. So the buffer is rendered as tappable grapheme
  // clusters and the caret is drawn.
  //
  // Tapping a cluster puts the caret on the side of it that was tapped;
  // tapping the empty space to the right puts it at the end. That is the whole
  // of VERIFY-5D A6 defect 1 — entry was append-only, so a mistake in word one
  // of a fourteen-word verse cost the whole verse. Arrow keys are not required
  // (the target device has no keyboard) but the hardware Left/Right keys are
  // wired anyway because they cost one line each.
  import { createEventDispatcher } from 'svelte';
  import { clustersOf } from '../lib/speller-input.js';
  import { spacingMarks } from '../lib/greek.js';

  export let state;
  export let label = 'Spell Greek';
  export let locked = false;         // solved: no caret, no repositioning
  export let fieldClass = '';        // per-surface size/wrap tuning (sv-target)

  const dispatch = createEventDispatcher();
  $: clusters = clustersOf(state);

  // Which half of the cluster was tapped decides which side the caret lands.
  function tapCluster(event, index) {
    if (locked) return;
    const box = event.currentTarget.getBoundingClientRect();
    const after = event.clientX - box.left > box.width / 2;
    dispatch('caret', { index, after });
  }
  function tapEnd() {
    if (locked) return;
    dispatch('caretEnd');
  }
</script>

<div class="flash-pane">
  <div class="label">{label}</div>
  <!-- The trailing click zone is what makes "tap past the end" work; the
       clusters stop the event so a tap ON one is not also a tap past it.
       NO WHITESPACE inside this element: it renders with white-space: pre-wrap
       so a typed space is visible, which means the template's own indentation
       would be visible too — as a phantom leading newline and a trailing
       space in the field. The `sp-pending` span is a HELD mark, shown in its
       spacing form so a breathing tapped before its letter reads as waiting
       rather than lost. -->
  <div class="value greek spell-target {fieldClass}" role="presentation" on:click={tapEnd}
  >{#each clusters as cluster, i}{#if !locked && i === state.caret}<span class="caret" />{/if}<span class="sp-cluster" role="presentation" on:click|stopPropagation={e => tapCluster(e, i)}>{cluster}</span>{/each}{#if !locked && state.caret >= clusters.length}<span class="caret" />{/if}{#if state.pendingMark}<span class="sp-pending">{spacingMarks(state.pendingMark)}</span>{/if}</div>
</div>
```

### New file: scripts/ui-walk.mjs

```js
// VISUAL VERIFICATION WALKER (5D-SPEC2 §0).
//
// Round 1 shipped four teaching pages with flattened formatting and passed its
// own tests, because "the string is in the JSON" is not verification. This
// script drives the REAL UI with playwright-core: it opens every stop on a
// chapter's sequential rail at 320px and 768px, screenshots it, and dumps the
// rendered text/emphasis structure of every teaching page so a diff against
// the DOSBox originals is mechanical rather than a squint.
//
//   node scripts/ui-walk.mjs [--chapters=chapt_1,chapt_2,chapt_3] [--out=DIR]
//
// It expects a preview server on PORT (default 4173): `npm run preview`.
// Everything a machine can settle must be settled here before a VERIFY
// document reaches Nathanael; his time is for judgement calls.

import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2)
  .filter(a => a.startsWith('--'))
  .map(a => { const i = a.indexOf('='); return i === -1 ? [a.slice(2), true] : [a.slice(2, i), a.slice(i + 1)]; }));

const BASE = args.base || `http://localhost:${args.port || 4173}`;
const OUT = args.out || 'buildout/screenshots/5d-spec2';
const WIDTHS = [{ name: '320', width: 320, height: 900 }, { name: '768', width: 768, height: 1100 }];
const CHAPTERS = String(args.chapters || 'chapt_1,chapt_2,chapt_3').split(',');

const dataFor = id => JSON.parse(readFileSync(`src/data/chapt-0${id.split('_')[1]}.json`, 'utf8'));

mkdirSync(OUT, { recursive: true });

// The structural dump: what is on the page and how it is set apart. Text alone
// hid every round-1 defect, so emphasis, list markers, colour role and tap
// targets come out with it.
const EXTRACT = () => {
  const roleOf = el => {
    const cls = el.className || '';
    if (/rc-lead-plain|rc-strong/.test(cls)) return 'bold';
    if (/term-green/.test(cls)) return 'green';
    if (el.tagName === 'U' || /rc-lead(\b|-u)/.test(cls)) return 'underline';
    if (/greek-tap|greek-say/.test(cls)) return 'tappable';
    return null;
  };
  const card = document.querySelector('.card');
  if (!card) return { text: '', marked: [], taps: [] };
  const marked = [...card.querySelectorAll('u, .rc-lead, .rc-lead-u, .rc-lead-plain, .term-green')]
    .map(el => ({ role: roleOf(el), text: el.textContent.trim() }));
  // Which words are tappable is a fidelity question (directive 9), so the dump
  // names them: prose taps, chart rows, paradigm cells and the lemma.
  const taps = [...card.querySelectorAll('button.greek-tap, button.greek-say, button.pg-cell:not([disabled]), button.pg-lemma, button.rv-greek, button.ilv-word:not([disabled])')]
    .map(el => (el.querySelector('.greek') || el).textContent.trim()).filter(Boolean);
  const lists = [...card.querySelectorAll('ol')].map(ol => ({
    marker: getComputedStyle(ol).listStyleType,
    items: [...ol.children].map(li => li.textContent.replace(/\s+/g, ' ').trim())
  }));
  const paras = [...card.querySelectorAll('p.rc-para')].map(p => ({
    example: p.classList.contains('example-block'),
    strong: p.classList.contains('rc-strong'),
    indent: p.classList.contains('rc-indent'),
    text: p.innerText
  }));
  return {
    heading: (card.querySelector('.topic-heading, .rc-heading') || {}).textContent || '',
    text: card.innerText,
    marked, taps, lists, paras,
    // Silent horizontal clipping is the failure mode this app cannot see:
    // overflow-x is hidden app-wide, so a too-wide grid loses its right edge
    // with nothing to scroll and nothing to error.
    overflow: [...card.querySelectorAll('*')]
      .filter(el => el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0)
      .map(el => ({ cls: String(el.className).slice(0, 60), scroll: el.scrollWidth, client: el.clientWidth })),
    docOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  };
};

const report = { base: BASE, chapters: {}, consoleErrors: [] };
const browser = await chromium.launch();

for (const size of WIDTHS) {
  const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  page.on('console', m => {
    if (m.type() !== 'error') return;
    const t = m.text();
    // Known preview artifacts, not bugs (CHAT-HANDOFF): revoked blob: URLs on
    // fast route exits and /audio/* with no audio shipped to the preview.
    if (/ERR_FILE_NOT_FOUND|blob:|\/audio\//.test(t)) return;
    report.consoleErrors.push({ width: size.name, url: page.url(), text: t });
  });
  page.on('pageerror', e => report.consoleErrors.push({ width: size.name, url: page.url(), text: String(e) }));

  for (const chapterId of CHAPTERS) {
    const data = dataFor(chapterId);
    const stops = data.sequence || [];
    report.chapters[chapterId] ||= { stops: {} };
    for (const activityId of stops) {
      await page.goto(`${BASE}/#/activity/${chapterId}/${activityId}`, { waitUntil: 'load' });
      await page.waitForSelector('.card, .pending-verification', { timeout: 15000 }).catch(() => {});
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(180);
      const dir = join(OUT, size.name, chapterId);
      mkdirSync(dir, { recursive: true });
      await page.screenshot({ path: join(dir, `${activityId}.png`), fullPage: true });
      const shot = await page.evaluate(EXTRACT);
      report.chapters[chapterId].stops[activityId] ||= {};
      report.chapters[chapterId].stops[activityId][size.name] = shot;

      // topicPages: every topic is its own screen, and every one of them was a
      // round-1 defect site. Step through the lot.
      const topicCount = await page.locator('.topic-count').count();
      if (topicCount) {
        const label = await page.locator('.topic-count').first().innerText();
        const total = Number((label.match(/of\s+(\d+)/) || [])[1] || 1);
        const topics = [];
        for (let i = 0; i < total; i++) {
          if (i > 0) {
            await page.getByRole('button', { name: 'Next Topic' }).click();
            await page.waitForTimeout(160);
          }
          await page.screenshot({ path: join(dir, `${activityId}--topic${i + 1}.png`), fullPage: true });
          topics.push(await page.evaluate(EXTRACT));
        }
        report.chapters[chapterId].stops[activityId][size.name].topics = topics;
      }
    }
  }
  await context.close();
}

await browser.close();
writeFileSync(join(OUT, 'walk-report.json'), JSON.stringify(report, null, 1));

const stops = Object.values(report.chapters).reduce((n, c) => n + Object.keys(c.stops).length, 0);
const clipped = [];
for (const [chapterId, c] of Object.entries(report.chapters)) {
  for (const [activityId, byWidth] of Object.entries(c.stops)) {
    for (const [width, shot] of Object.entries(byWidth)) {
      const screens = [shot, ...(shot.topics || [])];
      if (screens.some(s => s.docOverflow || (s.overflow || []).length)) clipped.push(`${chapterId}/${activityId} @${width}`);
    }
  }
}
console.log(`walked ${stops} stops x ${WIDTHS.length} widths -> ${OUT}`);
console.log(clipped.length ? `HORIZONTAL OVERFLOW: ${clipped.join(', ')}` : 'no horizontal overflow anywhere');
console.log(report.consoleErrors.length ? `CONSOLE ERRORS: ${report.consoleErrors.length}` : 'no console errors');
if (report.consoleErrors.length) console.log(JSON.stringify(report.consoleErrors.slice(0, 10), null, 1));
```

### New file: scripts/ui-behavior.mjs

```js
// BEHAVIOR TESTS ON THE REAL UI (5D-SPEC2 §8).
//
// Everything a script can settle must be settled before a VERIFY document
// reaches Nathanael. Round 1's VERIFY asked him to hand-type the A4 and A6
// checking-policy tables; this file types them in a real browser and reports
// pass/fail, so his time goes to the judgement calls (does the timing feel
// right, does the layout read well, does the clip say the right word).
//
//   npm run preview            # in another shell
//   node scripts/ui-behavior.mjs
//
// Everything here drives the SHIPPED UI — tiles, keys, buttons — never a
// component internal. If it passes here it passes because the app does it.

import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:4173';
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok: !!ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};

const ch3 = JSON.parse(readFileSync('src/data/chapt-03.json', 'utf8'));
const verse = (ch3.exercise.find(a => a.type === 'spellVerse').answerWords || []).join(' ');
const strip = s => s.normalize('NFD').replace(/\p{M}/gu, '').normalize('NFC');

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 900 } });
const page = await context.newPage();

// The activity's OWN stepper, never the sequential rail's Previous/Next at the
// bottom of the screen (both are labelled "Next"; only the in-card pair moves
// between items).
const stepper = name => page.locator('.card').getByRole('button', { name, exact: true });

// A cache-busting query, because navigating to a URL that differs only in its
// FRAGMENT is a same-document navigation: the components keep their state and
// every "fresh" case in this file would inherit the previous one's item index.
// (That is not a hypothetical — it is how the first run of this file drifted
// three items deep and reported two false failures.)
let nav = 0;
const go = async hash => {
  await page.goto(`${BASE}/?run=${++nav}${hash}`, { waitUntil: 'load' });
  await page.waitForSelector('.card', { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(120);
};
const typed = () => page.locator('.spell-target').first().innerText();
// Type through the REAL keydown path the desktop layer exposes; the tile path
// is exercised separately below so both routes are covered.
const typeGreek = async text => { for (const ch of text) await page.keyboard.press(keyFor(ch)); };

// Reverse of SpellerKeyboard's KEYMAP, plus what the punctuation keys type.
const KEYMAP = {
  a: 'α', b: 'β', g: 'γ', d: 'δ', e: 'ε', z: 'ζ', h: 'η', q: 'θ', i: 'ι',
  k: 'κ', l: 'λ', m: 'μ', n: 'ν', c: 'ξ', o: 'ο', p: 'π', r: 'ρ', s: 'σ',
  t: 'τ', u: 'υ', f: 'φ', x: 'χ', y: 'ψ', w: 'ω', j: 'ς'
};
const REVERSE = Object.fromEntries(Object.entries(KEYMAP).map(([k, v]) => [v, k]));
function keyFor(ch) {
  if (ch === ' ') return 'Space';
  if (REVERSE[ch]) return REVERSE[ch];
  if (',.;'.includes(ch)) return ch;
  throw new Error(`no key types "${ch}" (U+${ch.codePointAt(0).toString(16)})`);
}
// Accented text, typed the way the learner has to type it: the bare LOWERCASE
// letter on the keyboard, then that cluster's marks on the mark tiles, and
// punctuation on the punctuation tiles. Lowercase is not a shortcut — the
// shared keyboard ships no capitals and no shift layer (D-18), which is
// exactly why the checker folds case; Ἰησοῦς is untypeable any other way.
async function typeAccented(text) {
  const clusters = [...new Intl.Segmenter('el', { granularity: 'grapheme' }).segment(text)].map(p => p.segment);
  for (const cluster of clusters) {
    const nfd = cluster.normalize('NFD');
    const base = nfd[0].toLowerCase();
    const marks = [...nfd.slice(1)].filter(c => /\p{M}/u.test(c)).join('');
    // An iota subscript is not a mark tile: the keyboard ships the three
    // SUBSCRIPT COMPOSITES and any accent goes on top of one of them, which is
    // how αὐτῷ gets typed.
    const subscript = marks.includes('ͅ');
    const rest = marks.replace('ͅ', '');
    if (subscript) await tapComposite((base + 'ͅ').normalize('NFC'));
    else if (REVERSE[base] || base === ' ') await page.keyboard.press(keyFor(base));
    else await tapPunctuation(base);
    if (rest) await tapMark(rest);
  }
}
const TILES = JSON.parse(readFileSync('src/data/speller-tiles.json', 'utf8'));
async function tapComposite(ch) {
  const tile = page.locator('.tk-marks .tk-key.greek', { hasText: ch });
  if (!await tile.count()) throw new Error(`no composite tile types "${ch}"`);
  await tile.first().click();
}
async function tapPunctuation(ch) {
  const tile = (TILES.punctuation || []).find(t => t.insert === ch);
  if (!tile) throw new Error(`no punctuation tile inserts "${ch}" (U+${ch.codePointAt(0).toString(16)})`);
  await page.locator(`.tk-key.punct[title="${tile.name}"]`).click();
}
async function tapMark(marks) {
  const tile = (TILES.diacritics || []).find(d => d.apply.normalize('NFC') === marks.normalize('NFC')
    || [...d.apply].sort().join('') === [...marks].sort().join(''));
  if (!tile) throw new Error(`no mark tile applies ${[...marks].map(c => c.codePointAt(0).toString(16)).join('+')}`);
  await page.locator(`.tk-key.mark[title="${tile.name}"]`).click();
}
// By LABEL, not by position: the word speller ships three checkboxes (Show
// Answer / With Accents / Pronounce Each Exercise) and the verse speller one.
const setAccents = async on => {
  const box = page.locator('.spell-checks label', { hasText: 'With Accents' }).locator('input');
  if (await box.isChecked() !== on) await box.setChecked(on);
};
const feedbackKind = async () => {
  const cls = await page.locator('.feedback').first().getAttribute('class');
  return /\bok\b/.test(cls) ? 'ok' : /\bbad\b/.test(cls) ? 'bad' : 'none';
};

// ---------------------------------------------------------------- §2 / A4
// Movable nu is GONE. The authored form is λύουσι and only λύουσι.
await go('#/activity/chapt_3/c3_ex_verb_speller');
const verbSpeller = ch3.exercise.find(a => a.id === 'c3_ex_verb_speller');
const itemIndexOf = greek => verbSpeller.items.findIndex(i => i.greek === greek);
const gotoItem = async index => {
  await page.locator('.card.speller').waitFor();
  for (let i = 0; i < index; i++) await stepper('Next').click();
  await page.waitForTimeout(60);
};

for (const [label, greek, input, accents, expect] of [
  ['A4/1 λύουσι, no accents, accents OFF', 'λύουσι', 'λυουσι', false, 'ok'],
  ['A4/2 λύουσι, accented, accents ON', 'λύουσι', 'λύουσι', true, 'ok'],
  ['A4/3 λυουσιν (movable nu) now REJECTED', 'λύουσι', 'λυουσιν', false, 'bad'],
  ['A4/4 πιστευομε for πιστεύομεν rejected', 'πιστεύομεν', 'πιστευομε', false, 'bad'],
  ['A4/5 πιστευομεν accepted', 'πιστεύομεν', 'πιστευομεν', false, 'ok']
]) {
  await go('#/activity/chapt_3/c3_ex_verb_speller');
  const idx = itemIndexOf(greek);
  await gotoItem(idx);
  await setAccents(accents);
  if (accents) await typeAccented(input); else await typeGreek(input);
  await stepper('Check Answer').click();
  await page.waitForTimeout(80);
  check(label, await feedbackKind() === expect, `"${await typed()}" for "${await page.locator(".flash-pane .value").first().innerText()}"`);
}

// ---------------------------------------------------------------- §4 typing
await go('#/activity/chapt_3/c3_ex_scripture_speller');

// A6 defect 2: a breathing typed at the start of a word must attach to the
// NEXT letter and must never eat the space before it.
await page.keyboard.press('o');
await tapMark('̔');                                   // rough breathing -> ὁ
await page.keyboard.press('Space');
await tapMark('̓');                                   // smooth breathing, no base yet
await page.keyboard.press('i');                            // ...lands on the iota
let text = await typed();
check('§4/2 breathing after a space attaches to the NEXT letter',
  text === 'ὁ ἰ', JSON.stringify(text));
check('§4/2 the space survives the breathing', text.includes(' '), JSON.stringify(text));

// A6 defect 1: tap inside the typed text to place the caret, then fix word one.
await stepper('Restart Exercise').click();
await typeGreek('λγει');                                   // the ε of λεγει is missing
// Tap the LEFT half of the second cluster: the caret lands between λ and γ.
await page.locator('.sp-cluster').nth(1).click({ position: { x: 1, y: 5 } });
await page.keyboard.press('e');
text = await typed();
check('§4/1 tap-to-position inserts mid-string', text === 'λεγει', JSON.stringify(text));

// Backspace deletes at the caret, not blindly at the end.
await page.keyboard.press('Backspace');
text = await typed();
check('§4/1 backspace acts at the caret', text === 'λγει', JSON.stringify(text));

// ---------------------------------------------------------------- A6 policy
const cases = [
  ['A6/1 verse with no accents, accents OFF', strip(verse), false, 'ok'],
  ['A6/2 verse fully accented, accents ON', verse, true, 'ok'],
  ['A6/3 verse with no accents, accents ON', strip(verse), true, 'bad'],
  ['A6/4 verse without its punctuation, accents ON', verse.replace(/[,·]/g, ''), true, 'ok'],
  ['A6/5 lowercase where the verse capitalizes, accents ON', verse.toLowerCase(), true, 'ok']
];
for (const [label, input, accents, expect] of cases) {
  await go('#/activity/chapt_3/c3_ex_scripture_speller');
  await setAccents(accents);
  // Typed through the app: bare letters on the keyboard, marks on the tiles.
  await typeAccented(input.normalize('NFC'));
  await stepper('Check Answer').click();
  await page.waitForTimeout(100);
  check(label, await feedbackKind() === expect, `typed "${(await typed()).slice(0, 40)}…"`);
}

// ---------------------------------------------------------------- §3 revisit
// Answer item 1, step forward, step back: the item must come up FRESH (no
// selection, no feedback, options unlocked) while the score stands.
for (const [label, hash] of [
  ['ch2 Accent Rule', '#/activity/chapt_2/c2_drill_accent_rule'],
  ['ch3 Verb Translating', '#/activity/chapt_3/c3_drill_verb_translating'],
  ['ch3 Vocabulary: Greek to English', '#/activity/chapt_3/c3_drill_vocab_gk_en']
]) {
  await go(hash);
  await page.locator('.grid.options .tile, .option-group .tile').first().click();
  await page.waitForTimeout(120);
  const answeredMarks = await page.locator('.tile.selected, .tile.correct, .tile.incorrect').count();
  const scoreBefore = await page.locator('.card .scorebox').last().innerText();
  await stepper('Next').click();
  await page.waitForTimeout(120);
  await stepper('Previous').click();
  await page.waitForTimeout(120);
  const marksAfter = await page.locator('.tile.selected, .tile.correct, .tile.incorrect').count();
  const feedbackAfter = (await page.locator('.feedback').first().innerText()).trim();
  check(`§3 revisit resets the item — ${label}`,
    answeredMarks > 0 && marksAfter === 0 && feedbackAfter === '',
    `marked ${answeredMarks} -> ${marksAfter}, feedback ${JSON.stringify(feedbackAfter)}, was on ${JSON.stringify(scoreBefore.trim())}`);
  // The score is not rewound by a revisit: it counts attempts, not the state
  // of the grid (DRILL-MATRIX §6).
  await page.locator('.card').getByRole('button', { name: 'Score', exact: true }).click();
  const score = await page.locator('.live-score').innerText();
  check(`§3 revisit keeps the recorded score — ${label}`, /1 correct out of 1|0 correct out of 1/.test(score), score.trim());
}
// Chapter 1 has no revisit path to reset: none of its six select drills exposes
// a Previous/Next stepper, and all six are `retry` class (an item stays open
// until it is answered correctly). Asserted rather than assumed.
{
  const ch1 = JSON.parse(readFileSync('src/data/chapt-01.json', 'utf8'));
  const selects = [...(ch1.drill || []), ...(ch1.exercise || [])].filter(a => a.type === 'select');
  const withStepper = selects.filter(a => (a.ui?.buttons || []).includes('Next'));
  check('§3 ch1 has no scored select drill with a revisit path',
    selects.length > 0 && withStepper.length === 0, `${selects.length} select drills, ${withStepper.length} with a stepper`);
  // Its speller does step, and stepping back presents the word fresh.
  await go('#/activity/chapt_1/c1_ex_speller');
  await page.keyboard.press('a');
  await stepper('Next').click();
  await page.waitForTimeout(80);
  await stepper('Previous').click();
  await page.waitForTimeout(80);
  check('§3 revisit resets the item — ch1 Vocabulary Spelling', (await typed()) === '', JSON.stringify(await typed()));
}

// ---------------------------------------------------------------- §3 timing
// The two constants, measured through the UI rather than read out of the
// module: the item must still be on screen at ~55% of its deadline and gone by
// ~140% of it. Which deadline applies is read from the OUTCOME the app itself
// reported, so nothing here encodes an answer key.
const CORRECT_MS = 2000, INCORRECT_MS = 4000;
const itemNumber = async () => (await page.locator('.card .scorebox').last().innerText()).trim();
async function measureAdvance(label, hash, wantCorrect) {
  await go(hash);
  const before = await itemNumber();
  const tiles = page.locator('.grid.options .tile, .option-group .tile');
  let kind = 'none', answeredAt = 0;
  const count = await tiles.count();
  for (let i = 0; i < count; i++) {
    await tiles.nth(i).click();
    answeredAt = Date.now();
    await page.waitForTimeout(60);
    kind = await feedbackKind();
    // A `retry` drill leaves a wrong item open, so the next tile is a fresh
    // guess on the SAME item — which is how this finds the correct one without
    // knowing it. A one-attempt drill locks, so the first tap is the answer.
    if (kind === 'ok' || !wantCorrect) break;
    if (await itemNumber() !== before) break;
  }
  const deadline = kind === 'ok' ? CORRECT_MS : INCORRECT_MS;
  await page.waitForTimeout(Math.max(0, deadline * 0.55 - (Date.now() - answeredAt)));
  const early = await itemNumber();
  await page.waitForTimeout(Math.max(0, deadline * 1.4 - (Date.now() - answeredAt)));
  const late = await itemNumber();
  check(`§3 ${label}: ${kind === 'ok' ? 'correct' : 'incorrect'} advances on ${deadline}ms`,
    early === before && late !== before,
    `item ${before} -> ${early} at ${Math.round(deadline * 0.55)}ms -> ${late} at ${Math.round(deadline * 1.4)}ms`);
}
// ch2 Syllable Counting is `retry`: guessing until it is right gives a
// deterministic CORRECT measurement, and it is a chapter-2 surface, which is
// where the 4000ms data literals used to live.
await measureAdvance('ch2 Syllable Counting', '#/activity/chapt_2/c2_drill_syllable_counting', true);
// Scripture Memory is the app's only `autoBoth` surface — the only place
// ADVANCE_INCORRECT_MS is ever used.
await measureAdvance('ch3 Scripture Memory Drill', '#/activity/chapt_3/c3_drill_scripture_memory', false);

// ---------------------------------------------------------------- §5 grids
for (const [label, hash] of [
  ['ch1 Vocabulary: English to Greek', '#/activity/chapt_1/c1_drill_vocab_en_gk'],
  ['ch2 Vocabulary: English to Greek', '#/activity/chapt_2/c2_drill_vocab_en_gk'],
  ['ch3 Vocabulary: English to Greek', '#/activity/chapt_3/c3_drill_vocab_en_gk']
]) {
  for (const [width, want] of [[320, 2], [768, 4]]) {
    await page.setViewportSize({ width, height: 900 });
    await go(hash);
    const cols = await page.locator('.grid.options').first()
      .evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    check(`§5 Greek option grid is ${want}-up at ${width}px — ${label}`, cols === want, `${cols} columns`);
  }
}
await page.setViewportSize({ width: 390, height: 900 });

// Letter grids stay four-up at every width (single glyphs, no width problem).
for (const width of [320, 768]) {
  await page.setViewportSize({ width, height: 900 });
  await go('#/activity/chapt_1/c1_ex_letter_to_name');
  const cols = await page.locator('.grid.options').first()
    .evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
  check(`§5 ch1 letter grid stays four-up at ${width}px`, cols === 4, `${cols} columns`);
}

// ---------------------------------------------------------------- §5 divider
await page.setViewportSize({ width: 390, height: 900 });
await go('#/activity/chapt_3/c3_drill_parsing');
const divider = await page.locator('.option-group + .option-group').first()
  .evaluate(el => { const s = getComputedStyle(el); return { top: s.borderTopColor, left: s.borderLeftColor }; });
const GREEN = 'rgb(31, 95, 87)';
check('§5 Parsing Drill divider is dark green',
  divider.top === GREEN || divider.left === GREEN, JSON.stringify(divider));

// ---------------------------------------------------------------- §5 objectives
for (const chapterId of ['chapt_1', 'chapt_2', 'chapt_3']) {
  const data = JSON.parse(readFileSync(`src/data/chapt-0${chapterId.split('_')[1]}.json`, 'utf8'));
  const objectives = (data.learn || []).find(a => a.mode === 'objectivesPage');
  if (!objectives) { check(`§5 ${chapterId} objectives use "1. 2. 3."`, false, 'no objectivesPage'); continue; }
  await go(`#/activity/${chapterId}/${objectives.id}`);
  const marker = await page.locator('.card ol').first().evaluate(el => getComputedStyle(el).listStyleType);
  check(`§5 ${chapterId} objectives use "1. 2. 3."`, marker === 'decimal', marker);
}

await browser.close();
const failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} behavior checks passed`);
if (failed.length) { console.log(failed.map(f => ` FAIL ${f.name} — ${f.detail}`).join('\n')); process.exit(1); }
```
