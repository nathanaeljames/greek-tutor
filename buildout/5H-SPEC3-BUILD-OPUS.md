# 5H-SPEC3-BUILD-OPUS

The build record for 5H-SPEC3 Revision 2, per ONBOARD-SOL's permanent rule of
2026-08-25: (a) the COMPLETE exact cumulative `git diff`, not a summary and not
excerpts; (b) the work log; (c) the wall clock.

Base commit: `8f285be` ("updating project files before 5h spec 3").
Handoff: `5H-SPEC3-RESULTS-OPUS.md`. VERIFY document: `VERIFY-5H-3.md`.

---

## (c) Wall clock

| | |
| --- | --- |
| Start | 2026-08-28 15:25 UTC |
| End | 2026-08-28 17:20 UTC |
| **Elapsed** | **1 h 55 m** |

There is no prior blocked attempt to add to this total: the data was already in
the tree at the base commit and the STOP check passed on the first read
(RESULTS section 2). Any later addendum adds its time to the figure above, per
the standing rule.

As in 5H-SPEC2, most of that clock is browser-harness runtime rather than
authoring. `ui-behavior.mjs` takes about 45 minutes per pass on this machine
and was run twice end to end — the first full pass over the new assertions
(1124/1125, the one failure being the advance-timing race in RESULTS section 5)
and a confirmation pass over the final tree (1125/1125) — plus one `ui-modals`
pass over 54 surfaces at 5 heights, one `ui-walk` over three chapters at two
widths, one `ui-offline`, one `ui-disclosure`, one `ui-disclosure3`, four
`npm run build` cycles and three short measurement scripts written for this
round and deleted afterwards.

---

## (b) The work log

**Read first.** `buildout/5H-SPEC3.md`, `AGENTS.md`, `buildout/ONBOARD-SOL.md`
in full, `buildout/5H-SPEC2-RESULTS-OPUS.md`, the response PDF's items as
quoted in the spec, and the pipeline's own doc updates in `8f285be`
(DISCLOSURE-RULES §4.1, DRILL-BEHAVIOR-RULES A1c, NIT-LOG N-2 -> RESOLVED,
ledger row 107).

**The STOP gate.** Every claim of spec sections 2 and 4 checked against the
delivered files before any code: the four hint pages and their order, the 21
items with no `hintRef`, the Case Drill's 31 items with three refs, the neuter
conditional (items 1 and 9 carry αὐτὸ and αὐτὰ), `parts` present on exactly
four lemmas across three lexicons, absent on `hos`, every part's form inside
its own printed `lexicalForm`, every part's clip in the manifest. RESULTS
section 2 is that table.

**Item 1, reproduced before it was fixed.** A measurement script drove the
three objectives pages at 320 px and read the line-box metrics and the `<ol>`'s
own child nodes. 24.8 px of gap under every objective in all three chapters —
one line-height — and a `TEXT(" ")` node between every pair of `<li>`. That
ruled out the spec's suspected cause (a block element in one branch) and
identified the real one (`white-space: pre-wrap` on the card, plus the newline
5H-SPEC2's reflow left in the markup). Fixed in CSS, re-measured: every gap 0
px and the list height equal to the sum of the item heights, per-item heights
unchanged. Held afterwards against `ch1railwalk` p1 top-right, which is
single-spaced.

**Section 2, in two steps.** `chartIndex` first: built, rebuilt, walked the
hint and found ten pages rather than four — the flatten was still expanding
each entry to three charts because the build predated the edit. Rebuilt and
walked again: four pages in the authored order. Then the second step, which the
spec did not ask for: the walk showed "Third Person Paradigm: Masculine" over a
green "Masculine". Applied the existing heading-deduplication relation from
`content.js`, verified chapter 7's hint pages are untouched by it (their title
does not say what their subtitles say), and raised the wording as
`VERIFY-5H-3` (y) after comparing against `ch8railwalk` p13, where the
original's own paged third-person stack keeps a constant title and a changing
gender label.

**Section 4, then measured for layout.** `vocabParts` in `content.js` with the
display guard; the reviewVocab row split by `splitTaps`; the CSS that takes the
blue off the cell and puts it on the forms. Then an A/B in one page load:
replace each multi-tap cell with the single button it used to be and compare
boxes. Identical on all four rows at 320 px, so nothing re-wrapped.

**The new shape check, negative-tested.** One part's form changed to a word not
in its own lexicalForm and another's clip to an id that does not exist; both
reported by name; data restored from a copy; `git diff` on `src/data/` empty.

**Harness.** The new block, then the removals the rulings require, then the
three repairs — W1 (its item-level `hintRef` no longer exists), P3.2 (renamed
for the third time, once per shape) and, found by running rather than by
reading, the advance-timing race, which was measured on the real surface before
it was touched (RESULTS section 5).

**Environment.** `ui-modals` died with `ENOSPC` on its first attempt: the
volume holding the repo reported 0 bytes free. Every screenshot-writing harness
was re-run with its output on C: and `dist/` was deleted to make room for these
three documents; the volume reported ~60 GB free again by the time they were
written, so `dist` is rebuilt and the corpora are copied back under
`buildout/screenshots`. Separately, `check:docs` would not run at all
(`ENOBUFS` out of `spawnSync`) until one missing `maxBuffer` was restored —
diagnosed by measuring the `git ls-files buildout` output at 1,085,518 bytes
against execSync's 1 MB default, and fixed with the same option its three
sibling calls already carry. RESULTS section 7.

---

## (a) The complete cumulative diff


The diff below is the tree at the moment this document was written, with the
three round documents split out: the tracked files first, then the two new
ones in full. `5H-SPEC3-BUILD-OPUS.md` itself is the only file of the round
not reproduced inside it, for the obvious reason. The screenshot corpora
under `buildout/screenshots/5h3-*` are binary and are named in
`5H-VISUAL-CHECKLIST-3` rather than diffed here.

### Tracked files

```diff
diff --git a/buildout/5H-VISUAL-CHECKLIST-OPUS.md b/buildout/5H-VISUAL-CHECKLIST-OPUS.md
index a404d57..b9d3bb9 100644
--- a/buildout/5H-VISUAL-CHECKLIST-OPUS.md
+++ b/buildout/5H-VISUAL-CHECKLIST-OPUS.md
@@ -204,3 +204,71 @@ and `ui-behavior.mjs` all seek).
 `ui-disclosure.mjs` D13 covers the same two translation routes at 390x520
 under forced scroll: the paradigm route keeps the §4.2 pinned pair, the Three
 Uses route pins nothing, and each seeks its own form first.
+
+# 5H-VISUAL-CHECKLIST-3 (5H-SPEC3, section 7)
+
+Every page whose DATA or RENDERER changed in 5H-SPEC3, at 320 px and 768 px,
+compared against its rail-walk panel. Appended to this file rather than opened
+as a new one, per the 5H-SPEC2 precedent.
+
+METHOD. `npm run preview`, then
+`node scripts/ui-walk.mjs --chapters=chapt_7,chapt_8,chapt_11` and
+`node scripts/ui-modals.mjs`, plus one hand walk of the ch8 hint's four pages
+and one hand capture of chapter 1's objectives (ch1 is not in this round's
+walked set and is the plain-string branch of the item-1 regression). The
+rail-walk panels were rendered from the PDFs with pymupdf at 200 dpi and
+cropped to the quadrant named in each row — `ch1railwalk.pdf` (18 pages),
+`ch7railwalk.pdf` (16), `ch8railwalk.pdf` (15), `ch11railwalk.pdf` (24).
+
+CORPUS. `buildout/screenshots/5h3-walk-opus/{320,768}/<chapter>/<stop>.png`
+(293 files) and `buildout/screenshots/5h3-modals-opus/` (541 files, five device
+heights, at rest and content-scrolled), plus
+`buildout/screenshots/5h3-hint-pages/autos-hint-p1..p4.png` and
+`buildout/screenshots/5h3-ch1-objectives-{320,768}.png`. Both harness runs were
+made with their output on C: because the volume was out of space at the time
+(RESULTS section 7); the images were copied here once it was not.
+
+320 px OVERFLOW: **zero stops overflow** in any of the three chapters
+(`ui-walk.mjs`: "no horizontal overflow in chapt_7, chapt_8, chapt_11"). The
+walk also reports zero interaction errors, all rail counts and Next actions
+live, and all authored expanders and chart states opened.
+
+Status: PASS / PASS+note / FAIL. Every row is PASS at the state delivered.
+
+| # | Page or state | Rail walk | What was compared | Status |
+| --- | --- | --- | --- | --- |
+| 3.1 | `chapt_1/c1_learn_objectives` (the plain-string branch) | ch1 p1 top-right | Eight objectives, house "1. 2. 3." markers, wrapped continuations indented under their text, and **NO blank line between objectives** — the original's list is single-spaced throughout | PASS (measured: seven inter-item gaps, all 0 px; list height 347 px = the sum of the eight item heights) |
+| 3.2 | `chapt_7/c7_learn_objectives` (the audioMap branch) | ch7 p1 top-right | Seven objectives at the same single spacing; **εἰμί** on objective 5 still a blue tap and still plays `g_eimi1s` | PASS |
+| 3.3 | `chapt_11/c11_learn_objectives` (the audioMap branch) | ch11 p1 top-right | Seven objectives at the same single spacing; **ἐκεῖνος** and **οὗτος** still blue taps with "(that)" and "(this)" in ink beside them | PASS (measured: six gaps, all 0 px; list height 404 px = the sum of the seven item heights) |
+| 3.4 | ...every other objectives page, chapters 1-12 | — | No page gained a tap, lost a line, or kept the gap | PASS (machine census, `ui-behavior` 5H-SPEC2 2.5 unchanged + 5H-SPEC3 1) |
+| 3.5 | `chapt_8/c8_drill_translation_autos` Hint page 1 | ch8 p7 bottom-right | Third Person Paradigm, **Masculine**: N/G/D/A rows, Singular and Plural columns, the English glosses under each cell, Say Whole Paradigm; **Back greyed, More live**, Close last | PASS+note (the heading reads "Third Person Paradigm: Masculine" where the original's panel reads "Third Person Paradigm" with Masculine as a section label — VERIFY-5H-3 (y)) |
+| 3.6 | ...page 2 | ch8 p7 bottom-right (lower half of the same panel) / ch8 p13 top-left | **Feminine**: the αὐτή set, same column and row structure | PASS+note (same heading question) |
+| 3.7 | ...page 3 | ch8 p13 top-right | **Neuter**: the αὐτό set. The original's HINT does not show this chart at all; its Review page does, and it is here because your (s) answer said to keep it once the drill turned out to use neuter forms (items 1 and 9) | PASS+note (a deliberate departure — DIVERGENCE-LOG D-57) |
+| 3.8 | ...page 4 | ch8 p8 top-left | **Three Uses**: title, the "αὐτός can be used in three ways" line, three numbered points with hanging indents and their underlined lead terms, the three Examples accordions; **Back live, More greyed**, Close last | PASS |
+| 3.9 | ...all four pages at 320x360 and 768x1024 | — | Each fits with the overlay unscrolled and Close pinned; the body scrolls inside the modal, the shell does not; exactly one divider, and the strip above it equals the strip below at forced scroll | PASS (`ui-modals` 270/270 states, `ui-disclosure` D13 four states) |
+| 3.10 | `chapt_7/c7_qr_vocab`, the οὐ row | ch7 p14 top-left | Row text **οὐ, οὐκ, οὐχ** and gloss "no, not (1606)" unchanged; the three forms are now separate blue taps and **the commas between them are ink** | PASS |
+| 3.11 | `chapt_8/c8_qr_vocab`, the ἐγώ and σύ rows | ch8 p12 top-left | Row texts **ἐγώ / ἡμεῖς** "I / we (2666)" and **σύ / ὑμεῖς** "you / you (pl) (2905)" unchanged; two blue taps each and **the slash between them is ink** (sampled at 768 px: forms rgb(22,99,199), separator rgb(34,37,42)) | PASS |
+| 3.12 | `chapt_11/c11_qr_vocab`, the οὗτος row | ch11 p20 top-right | Row text **οὗτος, αὕτη, τοῦτο** and "(1388)" unchanged; three blue taps, commas ink | PASS |
+| 3.13 | ...the four rows' BOX METRICS at 320 px | — | The multi-tap cell occupies the identical box as the single button it replaces, row for row: 112x66, 112x66, 112x33, 112x99. Nothing re-wrapped and no row grew | PASS (A/B measured in one page load) |
+| 3.14 | `chapt_11/c11_qr_vocab`, the ὅς row | ch11 p20 top-right | **Unchanged**: ὅς, ἥ, ὅ is ONE tap over the whole row and plays `k_voc5`, per (r) | PASS |
+| 3.15 | `chapt_7`, `chapt_8`, `chapt_11` Learn Vocabulary cards | ch7 p?, ch8 p11 bottom-right, ch11 p17 bottom-left | **Unchanged on screen**: each card is one tap over the whole printed form. The clip behind ch7's is now `g_voc8a` (audible, not visible) | PASS |
+| 3.16 | `chapt_8/c8_drill_case` Hint, three routes | ch8 p8 bottom-left | **Unchanged**: a first-person form opens the First Person paradigm, a second-person form the Second, an αὐτ- form the Third, each with Cancel only | PASS (regression row for the (s) ruling's other half) |
+
+## Modal states added this round
+
+| # | Modal state | Route | Status |
+| --- | --- | --- | --- |
+| S3.1 | ch8 translation hint page 1, Masculine | `chapt_8/c8_drill_translation_autos` -> Hint | PASS |
+| S3.2 | ...page 2, Feminine | ...-> More | PASS |
+| S3.3 | ...page 3, Neuter | ...-> More -> More | PASS |
+| S3.4 | ...page 4, Three Uses | ...-> More -> More -> More | PASS |
+
+These four REPLACE the two form-sought states 5H-SPEC2 added
+(`ch8-autos-translation-hint-paradigm` and `-three-uses`). Nothing is sought by
+form on this drill any more, because nothing depends on the form any more:
+that is the whole of the (s) ruling. `ui-modals.mjs` now holds 54 surfaces
+(52 before), which is 270 modal states at five device heights, all clean.
+
+`ui-disclosure.mjs` D13 covers the same four pages at 390x520 under forced
+scroll, as ONE entry with three navigation steps rather than the two
+form-sought entries it had; 303 disclosure checks pass.
diff --git a/buildout/DIVERGENCE-LOG.md b/buildout/DIVERGENCE-LOG.md
index 9174a13..9c8d1d4 100644
--- a/buildout/DIVERGENCE-LOG.md
+++ b/buildout/DIVERGENCE-LOG.md
@@ -576,6 +576,25 @@ D-56 | ch11 | K_OSNAP records οὕς, not the neuter ἅ its name implies;
      answer is οὕς mirrors the original and keeps K_OSNAP. | Nathanael
      listen, VERIFY-5H (q) + RESPONSE 2.
 
+D-57 | ch8 | AΥΤΟΣ TRANSLATION DRILL HINT: FOUR PAGES WHERE THE
+     ORIGINAL SHOWS TWO. The original opens the SAME Hint on every item
+     of this drill -- one paged stack whose first page carries the
+     Third Person Masculine AND Feminine charts together and whose
+     second is the "Three Uses" teaching page (ch8railwalk p7
+     bottom-right, p8 top-left). The port splits that first page into
+     one chart per page and ADDS the Neuter chart, giving Masculine ->
+     Feminine -> Neuter -> Three Uses on the §4.2 Back/More pair with
+     Close throughout. Both halves are Nathanael's instruction in the
+     same answer; the neuter page is kept because the drill's own items
+     use neuter forms (item 1 κατὰ τὸ αὐτὸ πνεῦμα, item 9 κἀγὼ γινώσκω
+     αὐτὰ), which was the condition he attached to it. The WordCounter
+     dispatch at 8_PRONS.TBK 0x7bf39 does not choose the opening page in
+     practice and no longer governs anything here; the Personal Pronoun
+     Case Drill's per-item routing is confirmed and unchanged.
+     Appended by the implementer per this log's standing rule; renumber
+     if the pipeline has already spent D-57. | Nathanael, VERIFY-5H-2
+     (s) response, 2026-08-27.
+
 ## Auto-progress / advance rule matrix
 
 MOVED. The full exercise-by-exercise, chapter-by-chapter matrix —
diff --git a/scripts/check-content-shapes.mjs b/scripts/check-content-shapes.mjs
index 416888a..61287c2 100644
--- a/scripts/check-content-shapes.mjs
+++ b/scripts/check-content-shapes.mjs
@@ -979,9 +979,49 @@ function segment_(text) { return new Intl.Segmenter('el', { granularity: 'graphe
   }
 }
 
+// ---- A LEXICON `parts` LIST IS A PROMISE THE ROW CAN KEEP (5H-SPEC3 4.2) ----
+// ONBOARD section 7: when a new defect class is found, add the check that
+// would have caught it. `parts[]` is how a lemma says "each of my printed
+// forms has its own clip", and the Review Vocabulary Chart renders it by
+// splitting the printed `lexicalForm` on those exact strings. A form that is
+// not IN that lexicalForm therefore renders as nothing at all -- the row draws
+// one fewer tap and no error is raised anywhere, which is the same silent-gap
+// class as the dangling hintRef 5H-SPEC2 found. Both halves are checked here:
+// the form must be in the text the row prints, and its clip must exist.
+{
+  const manifest = JSON.parse(readFileSync('public/audio/audio-manifest.json', 'utf-8'));
+  for (const file of readdirSync(DATA).filter(name => /^lexicon-.*\.json$/.test(name))) {
+    const lexicon = JSON.parse(readFileSync(join(DATA, file), 'utf-8'));
+    for (const [bucket, lemmas] of Object.entries(lexicon)) {
+      if (!lemmas || typeof lemmas !== 'object') continue;
+      for (const [ref, lemma] of Object.entries(lemmas)) {
+        if (!lemma || typeof lemma !== 'object' || !('parts' in lemma)) continue;
+        const path = `${file} ${bucket}.${ref}`;
+        if (!Array.isArray(lemma.parts) || !lemma.parts.length) {
+          problems.push(`${path}: "parts" must be a non-empty array of { greek, audio }.`);
+          continue;
+        }
+        const printed = String(lemma.lexicalForm || lemma.greek || '');
+        for (const [index, part] of lemma.parts.entries()) {
+          if (!part || typeof part !== 'object' || !part.greek || !part.audio) {
+            problems.push(`${path}.parts[${index}]: every part needs both a "greek" form and an "audio" id.`);
+            continue;
+          }
+          if (!printed.includes(part.greek)) {
+            problems.push(`${path}.parts[${index}]: "${part.greek}" does not appear in the printed form "${printed}" — the Review chart splits that text, so this part would render as no tap at all.`);
+          }
+          if (!(part.audio in manifest)) {
+            problems.push(`${path}.parts[${index}]: audio id "${part.audio}" is not in audio-manifest.json — the tap would toast "Audio not found" at runtime.`);
+          }
+        }
+      }
+    }
+  }
+}
+
 if (problems.length) {
   for (const problem of problems) console.error(`FAIL: ${problem}`);
   process.exit(1);
 }
 
-console.log(`PASS: content shapes intact — ${files.join(', ')} checked (biblist entries are strings; numbered items render something; greekRows rows carry content; paradigm rows match their columns; formula lines have exclusive whole-line/inline tap contracts; spellVerse answers are single words; retired Repeat controls are absent; every contentAudio mode has a branch; every advanceClass is one of the four and every audioTiming one of the five; every reddened cluster has a font-derived geometry row; every spelling answer is typeable on the shared keyboard; every displayed elision mark is U+0027; no numbered point is hand-numbered inside a plain para; no paragraph is split line-by-line across consecutive paras; every presentFutureRows row has both sides; every termList item has a term and a definition; every wordUsage carries a heading and its examples; every poolKind is "vocabulary"; every hintChart has paradigmRefs or inline charts; every hintRef, paradigmRef, [[link:id]], termList link and topic titleLink resolves; every audio id the data names exists in the audio manifest).`);
+console.log(`PASS: content shapes intact — ${files.join(', ')} checked (biblist entries are strings; numbered items render something; greekRows rows carry content; paradigm rows match their columns; formula lines have exclusive whole-line/inline tap contracts; spellVerse answers are single words; retired Repeat controls are absent; every contentAudio mode has a branch; every advanceClass is one of the four and every audioTiming one of the five; every reddened cluster has a font-derived geometry row; every spelling answer is typeable on the shared keyboard; every displayed elision mark is U+0027; no numbered point is hand-numbered inside a plain para; no paragraph is split line-by-line across consecutive paras; every presentFutureRows row has both sides; every termList item has a term and a definition; every wordUsage carries a heading and its examples; every poolKind is "vocabulary"; every hintChart has paradigmRefs or inline charts; every hintRef, paradigmRef, [[link:id]], termList link and topic titleLink resolves; every audio id the data names exists in the audio manifest; every lexicon parts form is in its own printed lexicalForm and has a clip).`);
diff --git a/scripts/check-doc-integrity.mjs b/scripts/check-doc-integrity.mjs
index e99be54..d3618a6 100644
--- a/scripts/check-doc-integrity.mjs
+++ b/scripts/check-doc-integrity.mjs
@@ -49,7 +49,13 @@ const readWork = (rel) => {
   } catch { return null; }   // not in the index = deleted in this commit
 };
 
-let tracked = execSync('git ls-files buildout', { cwd: ROOT }).toString()
+// `maxBuffer` for the same reason the three calls around it carry it, and this
+// one was simply missed: `buildout` holds every round's screenshot corpus, and
+// the file list crossed execSync's 1 MB default at some point before this
+// round -- 12,442 paths, 1,085,518 bytes -- after which this script died with
+// ENOBUFS out of spawnSync before it read a single document. 1 << 26 is the
+// value the rest of the file already uses.
+let tracked = execSync('git ls-files buildout', { cwd: ROOT, maxBuffer: 1 << 26 }).toString()
   .split('\n').filter(f => /\.(md|csv)$/.test(f));
 
 if (STAGED) {
diff --git a/scripts/ui-behavior.mjs b/scripts/ui-behavior.mjs
index f832b11..109f866 100644
--- a/scripts/ui-behavior.mjs
+++ b/scripts/ui-behavior.mjs
@@ -2268,11 +2268,26 @@ async function fiveFItemOnScreen(chapterId, activity) {
 // The window now stays open while a clip is still playing, with a hard backstop
 // so a stuck surface still fails rather than hanging.
 const ADVANCE_BACKSTOP_MS = 30000;
-async function stillAdvancing(answeredAt, floorMs) {
+// ...AND THE TAIL AFTER THE CLIP, found 2026-08-28 in the 5H-SPEC3 pass. The
+// window above closed the ceiling half of the flake and left the other half:
+// the app schedules the advance ON the clip's own `ended` event, so for a few
+// dozen milliseconds after the last clip stops the surface is behaving exactly
+// as the rule says and simply has not moved yet -- and this loop, polling
+// every 50ms, could exit in precisely that gap and report "did not advance".
+// Measured on `c12_drill_translation`, whose sentence clips are the longest in
+// the app: advance lands 43-92ms after the clip ends (7194ms after a 7102ms
+// clip, 5735 after 5659, 5007 after 4904). Only clips longer than the floor
+// can reach the gap at all, which is why exactly one chapter-12 item failed a
+// pass that was otherwise green. 750ms is an order of magnitude more than the
+// observed tail and still an order of magnitude less than the backstop, so a
+// genuinely stuck surface still fails.
+const ADVANCE_TAIL_MS = 750;
+async function stillAdvancing(answeredAt, floorMs, state) {
   const waited = Date.now() - answeredAt;
   if (waited >= ADVANCE_BACKSTOP_MS) return false;
   if (waited < floorMs) return true;
-  return await clipsPlaying() > 0;
+  if (await clipsPlaying() > 0) { state.lastPlaying = Date.now(); return true; }
+  return Date.now() - state.lastPlaying < ADVANCE_TAIL_MS;
 }
 
 async function fiveFFreshItem(hash, chapterId, activity, tries = 12) {
@@ -2302,7 +2317,8 @@ for (const [chapterId, chapter] of Object.entries(CH_5F)) {
       const kind = await feedbackKind();
       const said = await awaitNextShown();
       let late = await itemNumber();
-      while (late === before && await stillAdvancing(answeredAt, CORRECT_MS * 3.5)) {
+      const advanceState = { lastPlaying: answeredAt };
+      while (late === before && await stillAdvancing(answeredAt, CORRECT_MS * 3.5, advanceState)) {
         await page.waitForTimeout(50);
         late = await itemNumber();
       }
@@ -2336,7 +2352,8 @@ for (const [chapterId, chapter] of Object.entries(CH_5F)) {
           `revealed ${JSON.stringify(revealed)} for ${JSON.stringify(item.answer)}, waiting ${said}, item ${before} -> ${await itemNumber()}`);
       } else if (advanceClass === 'autoBoth') {
         let late = await itemNumber();
-        while (late === before && await stillAdvancing(answeredAt, INCORRECT_MS * 2)) {
+        const advanceState = { lastPlaying: answeredAt };
+        while (late === before && await stillAdvancing(answeredAt, INCORRECT_MS * 2, advanceState)) {
           await page.waitForTimeout(60);
           late = await itemNumber();
         }
@@ -3204,27 +3221,18 @@ for (const [chapterId, activityId, expected] of [
     // there is no .pg-nav on that page to measure. The ContentAudio copy of
     // this layout went with it — Paradigm.svelte is the only renderer of the
     // pair now, which is one fewer place for the markup to drift.
-    // 5H-SPEC2 3.1 RENAMED, because the label had stopped describing what the
-    // loop measures. It said "modal pager" and meant the hint's own
-    // `ui.hintPages` More/Back. That key is gone: the original dispatches one
-    // page per item. The `.pg-nav` this still finds inside the modal is the
-    // PARADIGM's own three-chart pager (Masculine / Feminine / Neuter), which
-    // is a real surface worth measuring and is what the numbers below have
-    // actually described since the data changed -- but a check whose name
-    // outlives its subject is how a green harness proves nothing (ONBOARD §7).
-    // 5H-SPEC2 3.1 RENAMED AND PINNED TO AN ITEM. The label said "modal pager"
-    // and meant the hint's own `ui.hintPages` More/Back; that key is gone,
-    // because the original dispatches one page per item. The `.pg-nav` this
-    // still finds inside the modal is the PARADIGM's own three-chart pager
-    // (Masculine / Feminine / Neuter) -- a real surface worth measuring, and
-    // what these numbers have described since the data changed. A check whose
-    // name outlives its subject is how a green harness proves nothing
-    // (ONBOARD §7). `seek` is the other half: the drill's items are shuffled
-    // and only SOME of them route to the paradigm now, so without it this
-    // passes or fails on the draw.
-    ['ch8 Aὐτός Translation Drill Hint (the paradigm chart pager inside the modal)',
-      '#/activity/chapt_8/c8_drill_translation_autos',
-      { hint: true, seek: 'κατὰ τὸ αὐτὸ πνεῦμα', seekLimit: 21 }]
+    // RENAMED TWICE, ONCE PER SHAPE, and this is the third shape. It began as
+    // "modal pager" measuring the hint's own `ui.hintPages` More/Back; 5H-SPEC2
+    // removed that key on a dispatch reading, and the `.pg-nav` the loop then
+    // found was the PARADIGM's own three-chart pager under a name that no
+    // longer described it (ONBOARD §7: a check whose name outlives its subject
+    // is how a green harness proves nothing). VERIFY-5H-2 (s) settled it in
+    // DOSBox and 5H-SPEC3 2 put the hint's own pager back, four pages deep, so
+    // the `.pg-nav` here is the MODAL's again. No `seek`: every item opens the
+    // same hint now, which is the whole of the (s) ruling, so this passes or
+    // fails on the shape rather than on the draw.
+    ['ch8 Aὐτός Translation Drill Hint (the hint modal four-page pager)',
+      '#/activity/chapt_8/c8_drill_translation_autos', { hint: true }]
   ];
   for (const [label, hash, opts] of navSurfaces) {
     await go(hash);
@@ -4642,36 +4650,32 @@ for (const [itemIndex, greek, personNumber] of [
   }
   // Surface 2: the same topic, reached through the drill hint.
   //
-  // 5H-SPEC2 3.1 UPDATES THE ROUTE THIS CHECK WALKS, not what it asserts. The
-  // hint used to be a two-page stack (`ui.hintPages`: the Third Person
-  // Paradigm, then Three Uses reached with More), so this loop pressed More
-  // until the topic appeared. The original dispatches ONE page per item
-  // instead, so the topic is now reached by standing on an item that routes to
-  // it -- per-item `hintRef: "threeUses"` -- and there is no More to press.
-  // What is under test is unchanged and is the reason the check exists: the
-  // two crossed clips must be right on BOTH surfaces that render this topic.
+  // THE ROUTE THIS CHECK WALKS HAS NOW CHANGED TWICE; what it asserts has not.
+  // Three Uses was the second page of a two-page `ui.hintPages` stack, so the
+  // loop pressed More once; 5H-SPEC2 read a per-item dispatch out of the TBK
+  // and the topic became an item-level `hintRef` with no More at all; VERIFY-
+  // 5H-2 (s) then settled it in DOSBox -- every item opens the same hint, and
+  // Three Uses is its LAST page. So the route is a walk to the end of the
+  // pager again, from whichever item the shuffle drew, and it is written as
+  // "press More until it greys out" rather than "press it three times" so the
+  // page COUNT lives in the 5H-SPEC3 block that owns it. What is under test is
+  // unchanged and is why the check exists: the two crossed clips must be right
+  // on BOTH surfaces that render this topic.
   {
-    const threeUsesItem = ch8.drill.find(a => a.id === 'c8_drill_translation_autos')
-      .items.find(item => item.hintRef === 'threeUses' && !item.greek2);
     await go('#/activity/chapt_8/c8_drill_translation_autos');
-    let onItem = false;
-    for (let step = 0; step < 21; step += 1) {
-      const shown = normalizeText(await page.locator('.card .prompt').first().innerText());
-      if (shown === normalizeText(threeUsesItem.greek)) { onItem = true; break; }
-      const next = page.locator('.card').getByRole('button', { name: 'Next', exact: true });
-      if (!await next.count() || await next.isDisabled()) break;
-      await next.click();
-      await page.waitForTimeout(40);
-    }
-    check(`W1 reached a Three Uses item ("${threeUsesItem.greek}") in the ch8 Aὐτός Translation Drill`, onItem);
-    if (onItem) {
-      await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
-      await page.waitForSelector('.modal', { timeout: 8000 });
-      await page.waitForTimeout(200);
+    await page.waitForTimeout(200);
+    await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
+    await page.waitForSelector('.modal', { timeout: 8000 });
+    await page.waitForTimeout(200);
+    for (let step = 0; step < 8; step += 1) {
+      const more = page.locator('.modal [data-hint-page-nav="more"]');
+      if (!await more.count() || await more.isDisabled()) break;
+      await more.click();
+      await page.waitForTimeout(150);
     }
   }
   const reached = await page.locator('.modal details.rc-expander summary', { hasText: 'Reflexive Intensifier' }).count() > 0;
-  check('W1 the ch8 Aὐτός Translation hint reaches the Three Uses topic through its per-item hintRef', reached);
+  check('W1 the ch8 Aὐτός Translation hint reaches the Three Uses topic on its last page', reached);
   if (reached) {
     await page.locator('.modal details.rc-expander summary', { hasText: 'Reflexive Intensifier' }).first().click();
     await page.waitForTimeout(150);
@@ -4977,12 +4981,16 @@ for (const [itemIndex, greek, personNumber] of [
     await closeModal();
   }
 
-  // ---- 3.1 CHAPTER 8's TWO FORM-DEPENDENT HINTS (LOOKBACK) --------------
-  // The D-46 mechanism, applied to two drills the port shipped with a single
-  // hint (the Case Drill) and with a two-page stack that showed every item
-  // both answers (the Autos Translation Drill). The original dispatches ONE
-  // page per form: the Case Drill's three routes are three different persons,
-  // and the translation drill's two are a chart and a teaching PAGE.
+  // ---- 3.1 CHAPTER 8's FORM-DEPENDENT CASE DRILL HINT (LOOKBACK) --------
+  // The D-46 mechanism. This block asserted it on BOTH of chapter 8's drills;
+  // the Aὐτός Translation Drill's half is GONE, removed by 5H-SPEC3 2 rather
+  // than left to pass on stale data. Nathanael's DOSBox answer to VERIFY-5H-2
+  // (s) is that the original opens the SAME hint on every item of that drill,
+  // so a check that a paradigm item and a Three Uses item reach different
+  // surfaces was pinning exactly the behaviour the round removed. The Case
+  // Drill's routing was confirmed in the same pass -- each person opens its
+  // own chart, Cancel only -- so what is left here is what still holds. The
+  // translation drill's four-page hint is asserted in the 5H-SPEC3 block.
   {
     const hintHeading = () => page.evaluate(() => {
       const modal = document.querySelector('.modal');
@@ -5011,17 +5019,6 @@ for (const [itemIndex, greek, personNumber] of [
       caseHeadings.every(Boolean) && new Set(caseHeadings).size === 3,
       JSON.stringify(caseRoutes));
 
-    const autosParadigm = await openHint('chapt_8', 'c8_drill_translation_autos', 'κατὰ τὸ αὐτὸ πνεῦμα', 21);
-    const autosPage = await openHint('chapt_8', 'c8_drill_translation_autos', 'ἡ ὥρα αὐτοῦ', 21);
-    check('5H-SPEC2 3.1 ch8 Autos Translation Drill: a paradigm item opens the CHART',
-      !!autosParadigm && autosParadigm.chart && !autosParadigm.pageRef,
-      JSON.stringify(autosParadigm));
-    check('5H-SPEC2 3.1 ch8 Autos Translation Drill: a Three Uses item opens the TEACHING PAGE',
-      !!autosPage && autosPage.pageRef === 'threeUses' && autosPage.heading === 'Three Uses',
-      JSON.stringify(autosPage));
-    check('5H-SPEC2 3.1 ch8 Autos Translation Drill: the two routes are different surfaces',
-      !!autosParadigm && !!autosPage && autosParadigm.heading !== autosPage.heading,
-      `${JSON.stringify(autosParadigm)} vs ${JSON.stringify(autosPage)}`);
   }
 
   // ---- 4.2 THE AUDIO-LEAK GATE, AS A CENSUS -----------------------------
@@ -5148,17 +5145,15 @@ for (const [itemIndex, greek, personNumber] of [
   }
 
   // ---- 2.7 A CARD THAT PRINTS THREE FORMS SPEAKS THREE FORMS ------------
-  // VERIFY-5H-RESPONSE 6. The Learn Vocabulary flashcard and the Review
-  // Vocabulary Chart print the whole lexicalForm, so the clip is the lemma's
-  // own recitation; k_voc7a speaks the first form alone and belongs to the
-  // drills, which reach it through their own authored items.
+  // VERIFY-5H-RESPONSE 6, narrowed to the FLASHCARD by VERIFY-5H-2 (v). The
+  // review-chart half of this block is gone: Nathanael's answer is that the
+  // original's two surfaces deliberately differ -- the flashcard plays the
+  // lemma clip that recites every printed form, and the CHART taps each form
+  // on its own -- so the assertion that the chart row plays the whole-set clip
+  // was pinning the wrong half of a rule that had only ever been read off one
+  // surface. The chart's per-form taps are asserted in the 5H-SPEC3 block; the
+  // flashcard rule is unchanged and stays here, where it was settled.
   {
-    await go('#/activity/chapt_11/c11_qr_vocab');
-    const row = page.locator('.review-vocab .rv-greek', { hasText: 'αὕτη' }).first();
-    const rowPlayed = await exactAudioTap(row, 'chapt_11_k_voc7');
-    check('5H-SPEC2 2.7 ch11 Review chart: the three-form row plays k_voc7',
-      rowPlayed.clipCount === 1 && rowPlayed.fetched.join(' ').includes(rowPlayed.path),
-      `${rowPlayed.clipCount} clip(s), fetched ${JSON.stringify(rowPlayed.fetched)}`);
     // The flashcard is the same card in stepper form; step to it by its
     // printed lexicalForm rather than by index.
     await go('#/activity/chapt_11/c11_learn_vocab');
@@ -5181,20 +5176,10 @@ for (const [itemIndex, greek, personNumber] of [
     }
     // THE RULE IS NOT CHAPTER 11's ALONE, and chapter 8 is where it shows.
     // Its ἐγώ / ἡμεῖς card is the same shape -- one card, two printed forms, a
-    // lemma clip and per-form sense clips -- and its two surfaces DISAGREED:
-    // c8_qr_vocab draws from the `lemmas` pool and has always played h_voc3,
-    // while c8_learn_vocab draws from `senses` and played h_voc3a, one of the
-    // two words on the card. Both now play h_voc3. Asserted as a pair,
-    // because the pair is the argument: the fix aligns the flashcard with the
-    // Review chart's own shipped, device-verified behaviour rather than
-    // inventing a third. VERIFY-5H-2 (v) asks Nathanael to confirm by ear
-    // that h_voc3 recites both forms.
-    await go('#/activity/chapt_8/c8_qr_vocab');
-    const egoRow = page.locator('.review-vocab .rv-greek', { hasText: 'ἡμεῖς' }).first();
-    const egoPlayed = await exactAudioTap(egoRow, 'chapt_8_h_voc3');
-    check('5H-SPEC2 2.7 ch8 Review chart: the two-form first-person row plays h_voc3 (unchanged)',
-      egoPlayed.clipCount === 1 && egoPlayed.fetched.join(' ').includes(egoPlayed.path),
-      `${egoPlayed.clipCount} clip(s), fetched ${JSON.stringify(egoPlayed.fetched)}`);
+    // lemma clip and per-form sense clips -- and its flashcard used to play
+    // h_voc3a, one of the two words on it, because that surface reads `senses`
+    // while the chart reads `lemmas`. It plays the both-form clip now, which
+    // (v) confirms is what the original's flashcard does.
     await go('#/activity/chapt_8/c8_learn_vocab');
     let reachedEgo = false;
     for (let step = 0; step < 16; step += 1) {
@@ -5209,13 +5194,300 @@ for (const [itemIndex, greek, personNumber] of [
     if (reachedEgo) {
       const egoCard = await exactAudioTap(
         page.locator('.card .flash-pane .value.greek-say').first(), 'chapt_8_h_voc3');
-      check('5H-SPEC2 2.7 ch8 flashcard: now agrees with its Review chart and plays h_voc3',
+      check('5H-SPEC2 2.7 ch8 flashcard: the two-form card plays the both-form clip h_voc3',
         egoCard.clipCount === 1 && egoCard.fetched.join(' ').includes(egoCard.path),
         `${egoCard.clipCount} clip(s), fetched ${JSON.stringify(egoCard.fetched)}`);
     }
   }
 }
 
+// ===================================================================
+// 5H-SPEC3: the VERIFY-5H-2 closure round (chapters 1, 7, 8, 11)
+// ===================================================================
+// Three rulings and one regression. Each check states the rule and then names
+// the whole set it covers, so the census rather than the sample is what turns
+// green.
+{
+  const cardButton = name => page.locator('.card').getByRole('button', { name, exact: true });
+
+  // ---- 1 THE OBJECTIVES PAGE HAS NO SPACE BETWEEN ITS OBJECTIVES --------
+  // VERIFY-5H2-RESPONSE item 1. The card is `white-space: pre-wrap`, so the
+  // whitespace BETWEEN list items is content: when 5H-SPEC2 2.5 broke the
+  // one-line objectives markup across several lines to make room for the
+  // audioMap branch, the newline it left between every `</li>` and the next
+  // `<li>` collapsed to a space and that space drew a whole line box -- one
+  // line-height of gap under every objective, in EVERY chapter, the string
+  // branch included. So the assertion is pinned to line-box metrics, on one
+  // chapter of each branch, and it is the same assertion for both: the gap
+  // between consecutive items is ZERO, and the list's height is exactly the
+  // sum of its items' heights, which is the structural way of saying there is
+  // no box between them at all. The two branches cannot diverge again without
+  // one of these two chapters failing.
+  {
+    const SPACING = [
+      ['chapt_1', 'c1_learn_objectives', 'plain strings'],
+      ['chapt_11', 'c11_learn_objectives', '{ text, audioMap }']
+    ];
+    for (const [chapterId, activityId, branch] of SPACING) {
+      await go(`#/activity/${chapterId}/${activityId}`);
+      await page.waitForSelector('.objectives-list li');
+      await page.waitForTimeout(150);
+      const metrics = await page.evaluate(() => {
+        const list = document.querySelector('.objectives-list');
+        const boxes = [...list.querySelectorAll('li')].map(li => li.getBoundingClientRect());
+        return {
+          items: boxes.length,
+          gaps: boxes.slice(1).map((box, index) => Math.round((box.top - boxes[index].bottom) * 100) / 100),
+          listHeight: Math.round(list.getBoundingClientRect().height),
+          itemsHeight: Math.round(boxes.reduce((total, box) => total + box.height, 0))
+        };
+      });
+      check(`5H-SPEC3 1 ${chapterId} objectives (${branch}): no vertical gap between objectives`,
+        metrics.items > 1 && metrics.gaps.every(gap => gap === 0)
+          && metrics.listHeight === metrics.itemsHeight,
+        JSON.stringify(metrics));
+    }
+    // ...and the taps 5H-SPEC2 2.5 added are still taps, which is the half of
+    // item 1 that says "keep the terms clickable". The 2.5 census above proves
+    // they play; this proves the spacing fix did not cost them their buttons.
+    await go('#/activity/chapt_11/c11_learn_objectives');
+    const stillTaps = await page.locator('.objectives-list .greek-tap').count();
+    check('5H-SPEC3 1 ch11 objectives: the two Greek words are still taps after the spacing fix',
+      stillTaps === 2, `${stillTaps} tap(s)`);
+    await go('#/activity/chapt_7/c7_learn_objectives');
+    const ch7Taps = await page.locator('.objectives-list .greek-tap').count();
+    check('5H-SPEC3 1 ch7 objectives: the Greek word is still a tap after the spacing fix',
+      ch7Taps === 1, `${ch7Taps} tap(s)`);
+  }
+
+  // ---- 2 THE ch8 TRANSLATION HINT IS ONE FOUR-PAGE STACK, ON EVERY ITEM -
+  // VERIFY-5H-2 (s), answered in DOSBox: the original shows the SAME hint on
+  // every item of this drill, so the WordCounter dispatch at 0x7bf39 does not
+  // choose the opening page in practice. Four pages -- the Third Person
+  // Paradigm's Masculine, Feminine and Neuter charts, then the Three Uses
+  // teaching page -- reached with the §4.2 Back/More pair, Close throughout.
+  // Read from TWO items on purpose: item 1 was a paradigm item and item 5 a
+  // Three Uses item under the routing this replaces, so if any per-item
+  // dispatch survived anywhere they would differ here.
+  {
+    const walkHint = async prompt => {
+      await go('#/activity/chapt_8/c8_drill_translation_autos');
+      let onItem = false;
+      for (let step = 0; step < 21; step += 1) {
+        const shown = normalizeText(await page.locator('.card .prompt').first().innerText());
+        if (shown === normalizeText(prompt)) { onItem = true; break; }
+        const next = cardButton('Next');
+        if (!await next.count() || await next.isDisabled()) break;
+        await next.click();
+        await page.waitForTimeout(40);
+      }
+      if (!onItem) return null;
+      await cardButton('Hint').click();
+      await page.waitForSelector('.modal', { timeout: 8000 });
+      await page.waitForTimeout(200);
+      const pages = [];
+      for (let index = 0; index < 8; index += 1) {
+        pages.push(await page.evaluate(() => {
+          const modal = document.querySelector('.modal');
+          const heading = modal.querySelector('.pg-title, .rc-heading');
+          const back = modal.querySelector('[data-hint-page-nav="back"]');
+          const more = modal.querySelector('[data-hint-page-nav="more"]');
+          return {
+            heading: heading ? heading.innerText.trim() : null,
+            chart: !!modal.querySelector('.pg-row, .pg-cell'),
+            back: back ? (back.disabled ? 'off' : 'on') : null,
+            more: more ? (more.disabled ? 'off' : 'on') : null,
+            closes: [...modal.querySelectorAll('.modal-actions button')]
+              .map(button => button.innerText.trim()).filter(label => label === 'Close').length
+          };
+        }));
+        const more = page.locator('.modal [data-hint-page-nav="more"]');
+        if (!await more.count() || await more.isDisabled()) break;
+        await more.click();
+        await page.waitForTimeout(160);
+      }
+      await page.locator('.modal').getByRole('button', { name: 'Close', exact: true }).click();
+      await page.waitForTimeout(140);
+      return pages;
+    };
+    const ORDER = ['Third Person Paradigm: Masculine', 'Third Person Paradigm: Feminine',
+      'Third Person Paradigm: Neuter', 'Three Uses'];
+    const fromItem1 = await walkHint('κατὰ τὸ αὐτὸ πνεῦμα');
+    const fromItem5 = await walkHint('ἡ ὥρα αὐτοῦ');
+    for (const [label, pages] of [['item 1 (a former paradigm item)', fromItem1],
+      ['item 5 (a former Three Uses item)', fromItem5]]) {
+      check(`5H-SPEC3 2 ch8 translation hint from ${label}: four pages, Masc then Fem then Neut then Three Uses`,
+        !!pages && pages.length === ORDER.length
+          && pages.every((state, index) => state.heading === ORDER[index]),
+        JSON.stringify(pages && pages.map(state => state.heading)));
+      check(`5H-SPEC3 2 ch8 translation hint from ${label}: three charts then a teaching page`,
+        !!pages && pages.length === 4 && pages.slice(0, 3).every(state => state.chart)
+          && pages[3].chart === false,
+        JSON.stringify(pages && pages.map(state => state.chart)));
+      // §4.2's bounds: both buttons on every page, the invalid direction greyed
+      // rather than gone, and Close on all four.
+      check(`5H-SPEC3 2 ch8 translation hint from ${label}: Back greyed on page 1, More on page 4, Close throughout`,
+        !!pages && pages.length === 4
+          && pages.every(state => state.back && state.more && state.closes === 1)
+          && pages[0].back === 'off' && pages[0].more === 'on'
+          && pages[3].more === 'off' && pages[3].back === 'on'
+          && pages.slice(1, 3).every(state => state.back === 'on' && state.more === 'on'),
+        JSON.stringify(pages && pages.map(state => `${state.back}/${state.more}/${state.closes}`)));
+    }
+    // The same hint on every item is the whole of the (s) ruling, so the two
+    // walks are compared with each other as well as with the expected order.
+    check('5H-SPEC3 2 ch8 translation hint: the two items open the IDENTICAL hint',
+      !!fromItem1 && !!fromItem5
+        && JSON.stringify(fromItem1) === JSON.stringify(fromItem5),
+      `${JSON.stringify(fromItem1 && fromItem1.map(s => s.heading))} vs ${JSON.stringify(fromItem5 && fromItem5.map(s => s.heading))}`);
+    // ...and no item carries a hint reference of its own any more, which is
+    // the data half of the same ruling, stated over all 21 items rather than
+    // the two the walks stood on.
+    const autos = activityById(ch8, 'c8_drill_translation_autos');
+    check('5H-SPEC3 2 ch8 translation drill: not one of the 21 items carries a per-item hintRef',
+      autos.items.length === 21 && autos.items.every(item => !item.hintRef),
+      `${autos.items.filter(item => item.hintRef).length} of ${autos.items.length} still routed`);
+    // The Case Drill is the control: its dispatch WAS confirmed, so its
+    // per-item routing must be untouched by all of this. The 5H-SPEC2 3.1
+    // check above walks its three persons on screen; this states the data
+    // relation that check depends on.
+    const caseDrill = activityById(ch8, 'c8_drill_case');
+    check('5H-SPEC3 2 ch8 Case Drill: every item still routes to its own person chart',
+      caseDrill.items.every(item => item.hintRef)
+        && new Set(caseDrill.items.map(item => item.hintRef)).size === 3
+        && !caseDrill.ui.hintPages,
+      JSON.stringify([...new Set(caseDrill.items.map(item => item.hintRef))]));
+  }
+
+  // ---- 4.2 / 4.3 A CHART ROW TAPS EACH PRINTED FORM --------------------
+  // VERIFY-5H-2 (v), Nathanael's ruling from the original: the two vocabulary
+  // surfaces DIFFER on purpose. The Learn flashcard plays the lemma clip that
+  // recites every printed form; the Review Vocabulary Chart taps each form
+  // independently. The lexicon says which forms have their own clip (`parts`)
+  // and every tap below is evict-and-refetch, so a row that happens to be
+  // right for the wrong reason -- a clip already in the store from an earlier
+  // tap in this run -- cannot pass.
+  {
+    const ROWS = [
+      ['chapt_7', 'c7_qr_vocab', 'οὐ, οὐκ, οὐχ',
+        [['οὐ', 'chapt_7_g_voc8'], ['οὐκ', 'chapt_7_g_voc8a'], ['οὐχ', 'chapt_7_g_voc8b']]],
+      ['chapt_8', 'c8_qr_vocab', 'ἐγώ / ἡμεῖς',
+        [['ἐγώ', 'chapt_8_h_voc3a'], ['ἡμεῖς', 'chapt_8_h_voc3b']]],
+      ['chapt_8', 'c8_qr_vocab', 'σύ / ὑμεῖς',
+        [['σύ', 'chapt_8_h_voc9a'], ['ὑμεῖς', 'chapt_8_h_voc9b']]],
+      ['chapt_11', 'c11_qr_vocab', 'οὗτος, αὕτη, τοῦτο',
+        [['οὗτος', 'chapt_11_k_voc7a'], ['αὕτη', 'chapt_11_k_voc7b'], ['τοῦτο', 'chapt_11_k_voc7c']]]
+    ];
+    for (const [chapterId, activityId, printed, forms] of ROWS) {
+      await go(`#/activity/${chapterId}/${activityId}`);
+      await page.waitForSelector('.review-vocab .rv-row');
+      const cell = page.locator('.review-vocab .rv-greek.rv-forms', { hasText: forms[0][0] }).first();
+      const shape = await cell.evaluate(node => ({
+        text: node.innerText.replace(/\s+/g, ' ').trim(),
+        taps: [...node.querySelectorAll('.rv-form')].map(button => button.innerText.trim()),
+        // Directive 8: the punctuation between the forms is NOT a tap, so it
+        // must not be painted like one. The cell gives its blue back.
+        cellColour: getComputedStyle(node).color,
+        tapColours: [...new Set([...node.querySelectorAll('.rv-form')]
+          .map(button => getComputedStyle(button).color))]
+      }));
+      check(`5H-SPEC3 4.2 ${chapterId} chart row "${printed}": ${forms.length} taps, and only the forms are blue`,
+        shape.text === printed
+          && JSON.stringify(shape.taps) === JSON.stringify(forms.map(form => form[0]))
+          && shape.cellColour !== 'rgb(22, 99, 199)'
+          && JSON.stringify(shape.tapColours) === JSON.stringify(['rgb(22, 99, 199)']),
+        JSON.stringify(shape));
+      for (const [form, id] of forms) {
+        const tap = cell.locator('.rv-form', { hasText: form }).first();
+        const played = await exactAudioTap(tap, id);
+        check(`5H-SPEC3 4.2 ${chapterId} chart row "${printed}": ${form} plays ${id}`,
+          played.clipCount === 1 && played.fetched.join(' ').includes(played.path),
+          `${played.clipCount} clip(s), fetched ${JSON.stringify(played.fetched)}`);
+      }
+    }
+
+    // THE OTHER HALF OF THE TWO-SURFACE RULE. The flashcard ignores `parts`
+    // and plays the lemma's own clip. Chapter 7's is the 4.3 positive that
+    // came with Nathanael's listens -- g_voc8a is the clip that recites all
+    // three, so it is BOTH the second tap on the chart and the whole card
+    // here, which is exactly what the lexicon says and would look like a bug
+    // without this line. Chapters 8 and 11 keep their own flashcard checks in
+    // the 5H-SPEC2 2.7 block above; this is the negative they imply, stated
+    // where a reader of the (v) ruling will look for it.
+    const flashcard = async (chapterId, activityId, contains, limit) => {
+      await go(`#/activity/${chapterId}/${activityId}`);
+      for (let step = 0; step < limit; step += 1) {
+        const shown = normalizeText(await page.locator('.card .flash-pane .value').first().innerText());
+        if (shown.includes(contains)) return true;
+        const next = cardButton('Next');
+        if (!await next.count() || await next.isDisabled()) return false;
+        await next.click();
+        await page.waitForTimeout(60);
+      }
+      return false;
+    };
+    const reachedOu = await flashcard('chapt_7', 'c7_learn_vocab', 'οὐχ', 16);
+    check('5H-SPEC3 4.3 ch7 flashcard: reached the three-form card', reachedOu);
+    if (reachedOu) {
+      const splitTargets = await page.locator('.card .flash-pane .value .rv-form').count();
+      check('5H-SPEC3 4.3 ch7 flashcard: the card is ONE tap, not three -- parts is a chart rule',
+        splitTargets === 0, `${splitTargets} per-form buttons on the card`);
+      const played = await exactAudioTap(
+        page.locator('.card .flash-pane .value.greek-say').first(), 'chapt_7_g_voc8a');
+      check('5H-SPEC3 4.3 ch7 flashcard: the card plays g_voc8a, the clip that recites all three',
+        played.clipCount === 1 && played.fetched.join(' ').includes(played.path),
+        `${played.clipCount} clip(s), fetched ${JSON.stringify(played.fetched)}`);
+    }
+
+    // ...and NOTHING ELSE in twelve chapters gained per-form taps. The list of
+    // rows that carry them is computed from the lexicons, not typed here, so a
+    // thirteenth chapter that ships a `parts` row is covered by this census
+    // without an edit -- and a row that quietly grows one shows up as a
+    // difference between what the data declares and what the charts draw.
+    const declared = [];
+    for (const chapterId of Object.keys(CHAPTERS)) {
+      const lexicon = LEXICON(chapterId);
+      for (const [bucket, lemmas] of Object.entries(lexicon)) {
+        if (!lemmas || typeof lemmas !== 'object') continue;
+        for (const [ref, lemma] of Object.entries(lemmas)) {
+          if (lemma && Array.isArray(lemma.parts) && lemma.parts.length) {
+            declared.push(`${chapterId}.${bucket}.${ref}(${lemma.parts.length})`);
+          }
+        }
+      }
+    }
+    const DECLARED = ['chapt_7.lemmas.ou(3)', 'chapt_8.lemmas.ego(2)', 'chapt_8.lemmas.su(2)',
+      'chapt_11.lemmas.houtos(3)'];
+    check('5H-SPEC3 4.2 census: exactly four lemmas in twelve chapters declare per-form clips',
+      JSON.stringify(declared.sort()) === JSON.stringify(DECLARED.sort()), JSON.stringify(declared));
+    // 4.1: the relative pronoun lost its `parts` this round, because K_VOC5
+    // says only the first form and is meant to. The census above is what
+    // proves it; this names it so the row cannot come back without a ruling.
+    const hos = LEXICON('chapt_11').lemmas.hos;
+    check('5H-SPEC3 4.1 ch11 relative pronoun: no per-form clips, on either surface',
+      !hos.parts && hos.audio === 'chapt_11_k_voc5', JSON.stringify(hos.audio));
+    const drawn = [];
+    for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
+      const chart = activitiesOf(chapter).find(activity => activity && activity.mode === 'reviewVocab');
+      if (!chart) continue;
+      await go(`#/activity/${chapterId}/${chart.id}`);
+      await page.waitForSelector('.review-vocab .rv-row');
+      const rows = await page.evaluate(() => [...document.querySelectorAll('.review-vocab .rv-greek.rv-forms')]
+        .map(cell => cell.querySelectorAll('.rv-form').length));
+      for (const count of rows) drawn.push(`${chapterId}(${count})`);
+    }
+    check('5H-SPEC3 4.2 census: and exactly those four rows draw them, chart by chart',
+      JSON.stringify(drawn.sort()) === JSON.stringify(['chapt_11(3)', 'chapt_7(3)', 'chapt_8(2)', 'chapt_8(2)'].sort()),
+      JSON.stringify(drawn));
+    // (k2), closed: nothing plays the two homeless chapter-12 clips. They ship
+    // in the pack because the ISO ships them; no surface in the port names
+    // them, and this is the assertion that keeps it that way (the D-39 class).
+    const homeless = JSON.stringify(ch12).match(/chapt_12_l_(a1s|ap9)/g) || [];
+    check('5H-SPEC3 4.4 (k2): chapter 12 names neither of the two unwired clips anywhere in its data',
+      homeless.length === 0, JSON.stringify(homeless));
+  }
+}
+
 await browser.close();
 const failed = results.filter(r => !r.ok);
 console.log(`\n${results.length - failed.length}/${results.length} behavior checks passed`);
diff --git a/scripts/ui-disclosure.mjs b/scripts/ui-disclosure.mjs
index d5f20c3..bc5d623 100644
--- a/scripts/ui-disclosure.mjs
+++ b/scripts/ui-disclosure.mjs
@@ -597,21 +597,17 @@ const shot = async name => {
     // than left to the generic sweep.
     ['ch7 Adjective Translation hint (review A2 GOOD pane)', '#/activity/chapt_7/c7_drill_translation', 'hint', 'pair', 1],
     ['ch8 Personal Pronoun Case hint (review A2 BAD pane)', '#/activity/chapt_8/c8_drill_case', 'hint', 'pair', 2],
-    // 5H-SPEC2 3.1: ONE ENTRY BECAME TWO, because the surface did. This drill
-    // used to open a four-page stack for every item (`ui.hintPages`); the
-    // original dispatches ONE page per item, so which composition you get now
-    // depends on which item you are standing on -- and the items are
-    // shuffled, so a walk that just opens the Hint measures whichever it drew.
-    // The eighth tuple field seeks a named prompt first. Two compositions, one
-    // per route: the third-person paradigm is a three-chart stack and keeps
-    // the §4.2 pinned pair; the Three Uses teaching page has no navigation of
-    // its own and must pin nothing, exactly like the Augment Drill's prose.
-    ['ch8 Autos Translation hint (paradigm route, 3 charts)',
-      '#/activity/chapt_8/c8_drill_translation_autos', 'hint', 'pair', 2, true, /close|cancel/i,
-      'κατὰ τὸ αὐτὸ πνεῦμα'],
-    ['ch8 Autos Translation hint (Three Uses route, no nav)',
-      '#/activity/chapt_8/c8_drill_translation_autos', 'hint', 'none', 0, true, /close|cancel/i,
-      'ἡ ὥρα αὐτοῦ'],
+    // ONE ENTRY BECAME TWO AND IS NOW ONE AGAIN, because the surface went the
+    // same way. 5H-SPEC2 read a per-item dispatch out of the TBK and split
+    // this into a paradigm route and a Three Uses route, each sought by form;
+    // VERIFY-5H-2 (s) settled it in DOSBox -- the original opens the SAME hint
+    // on every item -- and 5H-SPEC3 2 restored the four-page stack. So there
+    // is one composition again, no form to seek, and the §4.2 pinned pair is
+    // walked across all four pages: three charts and then the Three Uses
+    // teaching page, which draws no navigation of its own and rides the
+    // modal's.
+    ['ch8 Autos Translation hint (four-page stack)',
+      '#/activity/chapt_8/c8_drill_translation_autos', 'hint', 'pair', 3, true, /close|cancel/i],
     ['ch9 Parsing hint (composite, 2 states)', '#/activity/chapt_9/c9_drill_parsing', 'hint', 'toggle', 1],
     // §4.5's lone centred toggle: the one state in the app with no say button.
     ['ch10 Parsing hint (εἰμί, no say button)', '#/activity/chapt_10/c10_drill_parsing', 'hint', 'toggle', 1],
diff --git a/scripts/ui-modals.mjs b/scripts/ui-modals.mjs
index 4cc0103..1086895 100644
--- a/scripts/ui-modals.mjs
+++ b/scripts/ui-modals.mjs
@@ -125,6 +125,23 @@ const hintAtPrompt = (chapterId, activityId, prompt, itemCount, disclosureState
   if (disclosureState !== null) await setHintDisclosureState(disclosureState);
 };
 
+// A PAGED hint is N surfaces, not one. 5H-SPEC3 2 put chapter 8's translation
+// hint back to a four-page stack (VERIFY-5H-2 (s)), and a page nobody opens is
+// a page nobody measures -- which is the whole reason this file exists. The
+// modal's own Back/More pair is the navigation, so stepping it is how each
+// page gets its turn at all five heights.
+const hintPage = (chapterId, activityId, pageIndex) => async () => {
+  await go(`#/activity/${chapterId}/${activityId}`);
+  await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
+  await page.waitForTimeout(180);
+  for (let step = 0; step < pageIndex; step++) {
+    const more = page.locator('.modal [data-hint-page-nav="more"]');
+    if (!await more.count() || await more.isDisabled()) throw new Error(`hint has no page ${pageIndex + 1}`);
+    await more.click();
+    await page.waitForTimeout(160);
+  }
+};
+
 const SURFACES = [
   // Chapter 2's four Hint surfaces, added 2026-08-13. Two of them are the ONLY
   // coverage of DivideActivity and PlaceAccentActivity, which -- with
@@ -223,22 +240,25 @@ const SURFACES = [
     await page.waitForTimeout(180);
   }],
   ['ch7-adjective-case-hint', hint('chapt_7', 'c7_drill_case', false)],
-  // 5H-SPEC2 3.1 (LOOKBACK): chapter 8's two form-dependent Hints, which the
-  // port never had. The Case Drill routes each form to its OWN person's
-  // paradigm -- three modals off one drill, so all three are sought by form --
-  // and the Aὐτός Translation Drill alternates between the third-person
-  // paradigm and the Learn topic "Three Uses", which is the first hint in the
-  // app whose body is a TEACHING PAGE reached by topic id. That page is prose
-  // with two levels of numbered list and three accordions; it is exactly the
-  // sort of body that fits at 844px and overflows at 360, which is what this
-  // file is for.
+  // 5H-SPEC2 3.1 (LOOKBACK): chapter 8's Case Drill routes each form to its OWN
+  // person's paradigm -- three modals off one drill, so all three are sought
+  // by form. Its dispatch was confirmed in DOSBox and it is unchanged.
   ['ch8-case-hint-first-person', hintAtPrompt('chapt_8', 'c8_drill_case', 'ἡμεῖς', 31)],
   ['ch8-case-hint-second-person', hintAtPrompt('chapt_8', 'c8_drill_case', 'σοι', 31)],
   ['ch8-case-hint-third-person', hintAtPrompt('chapt_8', 'c8_drill_case', 'αὐτή', 31)],
-  ['ch8-autos-translation-hint-paradigm',
-    hintAtPrompt('chapt_8', 'c8_drill_translation_autos', 'κατὰ τὸ αὐτὸ πνεῦμα', 21)],
-  ['ch8-autos-translation-hint-three-uses',
-    hintAtPrompt('chapt_8', 'c8_drill_translation_autos', 'ἡ ὥρα αὐτοῦ', 21)],
+  // 5H-SPEC3 2: TWO SURFACES BECAME FOUR, because the surface did. The
+  // translation drill's hint was a per-item route to one of two payloads;
+  // VERIFY-5H-2 (s) settled in DOSBox that the original opens the same
+  // four-page stack on every item, so it is measured page by page and NOT
+  // sought by form -- every item opens the same thing now, which is the
+  // ruling. Page 4 is the Learn topic "Three Uses", the one hint in the app
+  // whose body is a TEACHING PAGE reached by topic id: prose, two levels of
+  // numbered list and three accordions, exactly the sort of body that fits at
+  // 844px and overflows at 360, which is what this file is for.
+  ['ch8-autos-translation-hint-p1-masculine', hintPage('chapt_8', 'c8_drill_translation_autos', 0)],
+  ['ch8-autos-translation-hint-p2-feminine', hintPage('chapt_8', 'c8_drill_translation_autos', 1)],
+  ['ch8-autos-translation-hint-p3-neuter', hintPage('chapt_8', 'c8_drill_translation_autos', 2)],
+  ['ch8-autos-translation-hint-p4-three-uses', hintPage('chapt_8', 'c8_drill_translation_autos', 3)],
   // 5H: chapter 11's four hints are form-dependent (D-46), so the two that
   // route to two different charts are sought by FORM rather than trusted to
   // shuffle -- an οὗτος item and an ἐκεῖνος item open different modals, and
diff --git a/src/app.css b/src/app.css
index ca2441f..bd10917 100644
--- a/src/app.css
+++ b/src/app.css
@@ -249,6 +249,19 @@ button { font: inherit; cursor: pointer; }
 /* D-20 exception: chapter objectives keep "1. 2. 3." in every chapter, while
    teaching lists print "1) 2) 3)" (.rc-list). */
 .objectives-list { list-style-type: decimal; }
+/* 5H-SPEC3 1 (VERIFY-5H2-RESPONSE item 1): THE CARD IS `white-space: pre-wrap`,
+   so whitespace BETWEEN the list items is content. The objectives markup was
+   one unbroken line until 5H-SPEC2 2.5 gave an objective an audioMap and the
+   template grew the `{@const}` lines it needed; the newline-plus-indent that
+   reflow left between every `</li>` and the next `<li>` collapses to a single
+   space, and a space under pre-wrap draws a whole line box inside the `ol` --
+   24.8px, one line-height, between every objective in EVERY chapter, which is
+   what the response's BAD screenshot shows. The spacing is restored here
+   rather than by re-joining the markup: `normal` on the list drops the
+   whitespace-only boxes whatever shape the template takes, and each item keeps
+   pre-wrap so an objective's own text still renders exactly as authored. */
+.objectives-list { white-space: normal; }
+.objectives-list > li { white-space: pre-wrap; }
 .flash-pane { background: white; border-radius: 10px; padding: 14px; margin-bottom: 10px; min-height: 74px; }
 .flash-pane .label { font-size: 0.75rem; color: var(--teal-dark); font-weight: 700; text-transform: uppercase; }
 .flash-pane .value { font-size: 2rem; }
@@ -1386,7 +1399,7 @@ button { font: inherit; cursor: pointer; }
 html, body { touch-action: manipulation; }
 button, a, input, select, textarea, label,
 .tile, .tk-key, .chip, .act-row, .menu-item, .eq-cell, .diph-tile, .diph-ex,
-.rv-greek, .lm-row, .rc-defrow, .rc-example, .greek-chip, .greek-tap,
+.rv-greek, .rv-form, .lm-row, .rc-defrow, .rc-example, .greek-chip, .greek-tap,
 .seg, .flash-hidden, .icon-btn, .bb-item, .section-head,
 .rc-expander summary, .pg-meanings-toggle, .accent-slot,
 .pg-greek-tap, .pg-lemma, .ilv-word,
@@ -1438,6 +1451,16 @@ button, a, input, select, textarea, label,
 .rv-greek { text-align: left; background: transparent; border: none; padding: 0; }
 .rv-greek:active { opacity: 0.6; }
 .rv-gloss { color: var(--teal-dark); }
+/* 5H-SPEC3 4.2 (VERIFY-5H-2 (v)): a row whose lemma prints several forms taps
+   each form on its own. The CELL is no longer the button, so it gives its blue
+   back -- the commas and slashes between the forms are not tappable and must
+   not read as though they were (directive 8) -- and each form inside it is the
+   tap target instead, at the cell's own size rather than .greek-tap's inline
+   1.15em. */
+.rv-greek.rv-forms { color: var(--ink); }
+.rv-form { font: inherit; font-family: var(--greek-font); color: var(--link);
+  background: transparent; border: none; padding: 0; text-align: left; }
+.rv-form:active { opacity: 0.6; }
 
 /* ---- P4-P9: the Greek-tap rule — any DISPLAYED Greek (prompts, flashcard
    words, reading panes) is tappable and pronounces itself, blue per A6.
diff --git a/src/components/ContentAudio.svelte b/src/components/ContentAudio.svelte
index fe74233..c9bacb2 100644
--- a/src/components/ContentAudio.svelte
+++ b/src/components/ContentAudio.svelte
@@ -168,6 +168,13 @@
     if (a) play(a);
   }
 
+  // 5H-SPEC3 4.2: the lexicon's `parts[]` in the { form: clip } shape splitTaps
+  // already takes, so a multi-form Review row splits exactly the way an
+  // audioMap splits a sentence -- the forms become buttons and everything
+  // between them stays text. resolveItems has already checked that every form
+  // is in the printed lexicalForm.
+  const partTaps = parts => Object.fromEntries(parts.map(part => [part.greek, part.audio]));
+
   function next() { idx = Math.min(idx + 1, items.length - 1); revealed = false; revealG = false; revealE = false; onStep(); maybeComplete(); }
   function prev() { idx = Math.max(idx - 1, 0); revealed = false; revealG = false; revealE = false; onStep(); }
   function onStep(speak = play) {
@@ -601,12 +608,25 @@
 {:else if mode === 'reviewVocab'}
   <!-- Review Vocabulary Chart: Greek (tap = lemma audio, blue) + STATIC gloss
        (dark green) + ntFreq. A17/A6: only the Greek word is tappable. -->
+  <!-- 5H-SPEC3 4.2 (VERIFY-5H-2 (v), Nathanael's ruling from the original):
+       ONE ROW MAY BE SEVERAL TAPS. Where a lemma prints more than one form --
+       ἐγώ / ἡμεῖς, σύ / ὑμεῖς, οὗτος, αὕτη, τοῦτο, οὐ, οὐκ, οὐχ -- the
+       original's chart speaks the form you touched, not the whole set, so
+       each printed form is its own tap here and the punctuation between them
+       is inert ink (directive 8: blue is tappable and nothing else). The
+       lexicon says which forms have their own clip (`parts`); a row without
+       it is the single button it has always been, and the Learn flashcard
+       ignores `parts` entirely and keeps playing the lemma's all-forms clip. -->
   <div class="card">
     <div class="review-vocab" class:two-columns={activity.columns === 2}
          style={`--rv-rows:${Math.ceil(items.length / (activity.columns || 1))}`}>
       {#each items as r}
         <div class="rv-row">
-          <button class="rv-greek greek" on:click={() => r.audio && play(r.audio)}>{r.display}</button>
+          {#if r.parts}
+            <span class="rv-greek rv-forms greek" data-rv-parts={r.parts.length}>{#each splitTaps(r.display, partTaps(r.parts)) as seg}{#if seg.audio}<button class="rv-form greek" data-audio-id={seg.audio} on:click={() => play(seg.audio)}>{seg.t}</button>{:else}{seg.t}{/if}{/each}</span>
+          {:else}
+            <button class="rv-greek greek" on:click={() => r.audio && play(r.audio)}>{r.display}</button>
+          {/if}
           <span class="rv-gloss">{r.secondary}{#if activity.showNtFreq && r.meta && r.meta.ntFreq} <span class="rv-freq">({r.meta.ntFreq})</span>{/if}</span>
         </div>
       {/each}
diff --git a/src/components/SelectActivity.svelte b/src/components/SelectActivity.svelte
index a0e4d5b..2bcf4d8 100644
--- a/src/components/SelectActivity.svelte
+++ b/src/components/SelectActivity.svelte
@@ -34,7 +34,7 @@
   // policy machinery as a one-stage item, so no timing or advance rule below
   // has a special case for it.
   import { onDestroy } from 'svelte';
-  import { authoredOptionSource, buildSelectQuestions, buildTwoStageQuestions, paradigmToggleLabels, randomFeedback, resolveContentById, resolveHintBlocks, resolveHintPage, resolveHintRef } from '../lib/content.js';
+  import { authoredOptionSource, buildSelectQuestions, buildTwoStageQuestions, headingCovers, headingKey, paradigmToggleLabels, randomFeedback, resolveContentById, resolveHintBlocks, resolveHintPage, resolveHintRef } from '../lib/content.js';
   import { combiningForMarkName, firstAccentCluster, markOverlayParts } from '../lib/greek.js';
   import { play, playThrough, stop as stopAudio } from '../lib/audio.js';
   import { markCompleted } from '../lib/progress.js';
@@ -263,9 +263,10 @@
   // 5F-FEEDBACK2 items 13/28 (Nathanael, 2026-08-09): a MULTI-PAGE hint, the
   // original's More/Back-paged popup. ui.hintPages lists pages by reference —
   // { hintRef } (a chart; a stack of N charts flattens to N pages, one chart
-  // per page, so the MODAL owns all the paging), { contentRef } (a Learn
-  // topic's whole content array, by topic id) or inline { content } — plus an
-  // optional title. Nav uses item 27's fixed-slot model: Back always left,
+  // per page, so the MODAL owns all the paging, and `chartIndex` picks ONE
+  // chart of that stack for this page), { contentRef } (a Learn topic's whole
+  // content array, by topic id) or inline { content } — plus an optional
+  // title. Nav uses item 27's fixed-slot model: Back always left,
   // More always right, neither ever moves between pages.
   $: hintPages = buildHintPages(chapter, activity.ui?.hintPages);
   let hintPageIndex = 0;
@@ -283,8 +284,36 @@
         const charts = Array.isArray(target.paradigms) && target.paradigms.length
           ? target.paradigms
           : (Array.isArray(target.charts) && target.charts.length ? target.charts : [target]);
-        for (const chart of charts) {
-          pages.push({ chart: { ...target, charts: [chart] }, title: def.title || target.title || null });
+        // 5H-SPEC3 2 (VERIFY-5H-2 (s), DOSBox): A PAGE MAY NAME ONE CHART OF A
+        // STACK. Chapter 8's Aὐτός Translation Drill opens the same four-page
+        // Hint on every item -- the Third Person Paradigm's Masculine,
+        // Feminine and Neuter charts, then the Three Uses teaching page -- and
+        // all three charts live under ONE ref (`thirdPersonParadigm`). Without
+        // `chartIndex` the flatten below would turn each of the data's three
+        // entries into three pages and the hint would be ten pages long,
+        // three of them repeated. With it, a page names its own chart and the
+        // data's title is the one on screen, so the page ORDER is the data's
+        // rather than the stack's.
+        const selected = Number.isInteger(def.chartIndex) ? [charts[def.chartIndex]] : charts;
+        for (const chart of selected) {
+          if (!chart) continue;
+          const title = def.title || target.title || null;
+          // The SAME heading said at two lengths, which is what the
+          // deduplication rule in content.js is for. A page that names one
+          // chart of a stack titles itself "Third Person Paradigm: Masculine"
+          // while the chart under it carries "Masculine" as its own green
+          // section label, and printing both puts the word on screen twice.
+          // The page title is the fuller one and it is the one the data
+          // authored for this page, so it stands and the label it repeats is
+          // dropped. A page whose title does NOT say what the subtitle says
+          // (chapter 7's "Adjective Paradigm" over Singular / Plural) keeps
+          // both, unchanged.
+          const covered = chart.subtitle
+            && (headingKey(title) === headingKey(chart.subtitle) || headingCovers(title, chart.subtitle));
+          pages.push({
+            chart: { ...target, charts: [covered ? { ...chart, subtitle: null } : chart] },
+            title
+          });
         }
       } else if (def.contentRef) {
         const blocks = resolveContentById(chapterData, def.contentRef);
diff --git a/src/lib/content.js b/src/lib/content.js
index ddaf166..8d8468f 100644
--- a/src/lib/content.js
+++ b/src/lib/content.js
@@ -276,7 +276,30 @@ export function getNextChapter(chapterId) {
   return { id: next.id, number: next.number, title: next.title, available: isChapterAvailable(next.id) };
 }
 
-// Resolve an activity's items into a uniform [{display, secondary, audio, meta}]
+// THE FORMS OF A ONE-CARD-MANY-FORMS LEMMA (5H-SPEC3 4.2, VERIFY-5H-2 (v)).
+//
+// Nathanael's ruling, read off the original: its two vocabulary surfaces do
+// NOT play the same thing. The Learn flashcard plays the lemma clip that
+// recites every printed form; the Review Vocabulary Chart taps EACH printed
+// form independently -- ἐγώ speaks its own clip and ἡμεῖς speaks its own. The
+// lexicon records the second half as `parts[]` ({greek, audio} per form), and
+// only the reviewVocab surface reads it: every other consumer of these rows,
+// the flashcard included, keeps playing `audio` and is unchanged.
+//
+// A row carries its parts only when the DISPLAY it is about to print actually
+// says every one of those forms. That is the case-split guard: chapter 8's
+// παρά and ὑπό senses print one form plus a case tag and have no business
+// carrying the lemma's whole set. check-content-shapes enforces the same
+// relation at build time, so a `parts` entry that does not appear in its own
+// lexicalForm cannot ship as a silently missing tap.
+function vocabParts(lemma, display) {
+  const parts = lemma && Array.isArray(lemma.parts) ? lemma.parts.filter(part => part && part.greek && part.audio) : [];
+  if (!parts.length) return null;
+  const text = String(display || '');
+  return parts.every(part => text.includes(part.greek)) ? parts : null;
+}
+
+// Resolve an activity's items into a uniform [{display, secondary, audio, parts, meta}]
 export function resolveItems(chapter, activity) {
   const vocabDisplay = lemma => ((activity.mode === 'flashcard' || activity.mode === 'reviewVocab')
     && lemma.lexicalForm) || lemma.greek;
@@ -319,6 +342,7 @@ export function resolveItems(chapter, activity) {
         const lemma = getLemma(item.ref, chapter.id, item.pool);
         return lemma ? {
           display: vocabDisplay(lemma), secondary: stripMarkup(lemma.gloss), audio: lemma.audio,
+          parts: vocabParts(lemma, vocabDisplay(lemma)),
           meta: { ...lemma, ref: item.ref }
         } : { display: item.ref, secondary: '(missing lemma)', audio: null, meta: {} };
       }
@@ -330,7 +354,8 @@ export function resolveItems(chapter, activity) {
   // sensePool() for why it is not simply "one card per sense".
   if (activity.pool === 'senses') {
     return sensePool(chapter).map(card => ({
-      display: card.display, secondary: stripMarkup(card.gloss), audio: card.audio, meta: card
+      display: card.display, secondary: stripMarkup(card.gloss), audio: card.audio,
+      parts: vocabParts(card.lemma, card.display), meta: card
     }));
   }
   // 5D convention: instead of spelling out ten {ref} items, an activity names
@@ -339,7 +364,8 @@ export function resolveItems(chapter, activity) {
   // untouched.
   if (activity.pool || (activity.promptFrom && activity.promptFrom.lexicon)) {
     return lemmaPool(chapter, activity).map(lemma => ({
-      display: vocabDisplay(lemma), secondary: stripMarkup(lemma.gloss), audio: lemma.audio, meta: lemma
+      display: vocabDisplay(lemma), secondary: stripMarkup(lemma.gloss), audio: lemma.audio,
+      parts: vocabParts(lemma, vocabDisplay(lemma)), meta: lemma
     }));
   }
   return [];

```

### New files added this round

```diff
diff --git a/buildout/VERIFY-5H-3.md b/buildout/VERIFY-5H-3.md
new file mode 100644
index 0000000..67759b5
--- /dev/null
+++ b/buildout/VERIFY-5H-3.md
@@ -0,0 +1,118 @@
+# VERIFY-5H-3.md — the items only Nathanael can settle
+
+Chapters 1, 7, 8 and 11 after 5H-SPEC3 (Opus): the VERIFY-5H-2 closure
+round. Authored by the implementer in the same round, per standing rule 0.2.
+
+**This document is the previous-response checklist plus ONE item, and it says
+so on purpose.** Rule 0.2's checklist is section 1: every ask from
+VERIFY-5H2-RESPONSE, one or two lines each, for you to LOOK at rather than
+assume. Section 2 is (y), the only question this round raised that no machine
+and no rail walk can settle. There is nothing else: every other item of the
+round is either mechanical and pinned, or answered by you already and applied.
+
+Per standing rule 0.5 there is **no airplane-mode section**. The scripted
+offline walk ran (chapter 8, every rail stop, refresh on an activity route,
+no console errors) and everything after it is assumed offline; report anything
+that does not play.
+
+---
+
+## 1. Previous-response checklist
+
+Section 5 of 5H-SPEC3, verbatim. Tick what you can see; anything you cannot
+see, say so and it goes to the front of the next round.
+
+- [ ] Objectives spacing back to pre-5H-SPEC2 on every chapter; ch7/ch11
+      words still tap (item 1).
+- [ ] ch8 Autos drill: Hint identical on every item; four pages
+      Masc -> Fem -> Neut -> Three Uses via More/Back (s).
+- [ ] ch8 Case Drill unchanged: per-person chart, Cancel only (s).
+- [ ] ch12 εἰμί/ἔχω hint labelled More/Back (t).
+- [ ] ch12 εἰμί/ἔχω hint still a one-chart-at-a-time toggle (w).
+- [ ] ὅς card and chart row: k_voc5 only, no per-form taps (r).
+- [ ] ch8 chart rows ἐγώ/ἡμεῖς and σύ/ὑμεῖς: each form taps its own
+      clip; flashcards play the both-form clips (v).
+- [ ] ch11 chart row οὗτος αὕτη τοῦτο: three independent taps; flashcard
+      plays k_voc7 (v).
+- [ ] Nothing anywhere plays l_a1s / l_ap9 (k2, closed).
+- [ ] ch7 chart row οὐ, οὐκ, οὐχ: three independent taps (g_voc8 /
+      g_voc8a / g_voc8b); flashcard plays g_voc8a (all three) (4.3).
+
+Where to find each on the device, in one line apiece:
+
+| Row | Route |
+| --- | --- |
+| Objectives spacing | Learn > Chapter Objectives, any chapter (ch1 is the plain-string case, ch11 the tapping one) |
+| ch8 Autos hint | ch8 Drill > Aὐτός Translation Drill > Hint, on any two different items |
+| ch8 Case Drill hint | ch8 Drill > Personal Pronoun Case Drill > Hint, on a ἡμεῖς, a σοι and an αὐτ- item |
+| ch12 toggle label and shape | ch12 Drill > Imperfect Indicative Parsing Drill > Hint on an ἦμεν item |
+| ὅς | ch11 Learn > Vocabulary (the ὅς, ἥ, ὅ card) and Review > Vocabulary Chart (the ὅς, ἥ, ὅ row) |
+| ch8 rows | ch8 Review > Vocabulary Chart, the ἐγώ / ἡμεῖς and σύ / ὑμεῖς rows; then ch8 Learn > Vocabulary |
+| ch11 row | ch11 Review > Vocabulary Chart, the οὗτος, αὕτη, τοῦτο row; then ch11 Learn > Vocabulary |
+| ch7 row | ch7 Review > Vocabulary Chart, the οὐ, οὐκ, οὐχ row; then ch7 Learn > Vocabulary |
+
+---
+
+## 2. The one new item
+
+### (y) The four hint pages have longer headings than the original's panel *(judgement — implementer-raised, from the visual pass)*
+
+- [ ] Your (s) answer is what shipped: the Aὐτός Translation Drill opens the
+      same Hint on every item, four pages, Masculine -> Feminine -> Neuter ->
+      Three Uses, on the §4.2 Back/More pair with Close throughout. The neuter
+      page stays, because items 1 (κατὰ τὸ αὐτὸ πνεῦμα) and 9
+      (κἀγὼ γινώσκω αὐτὰ) are neuter forms — that is the conditional in your
+      answer, resolved.
+
+      **What the visual pass turned up.** The original's panel
+      (`ch8railwalk` p7 bottom-right, and the screenshot in your own response)
+      prints ONE heading, **"Third Person Paradigm"**, with **Masculine** and
+      **Feminine** as section labels down the page. The port's pages print the
+      heading the data authored for each page — **"Third Person Paradigm:
+      Masculine"**, then ": Feminine", then ": Neuter" — and the gender is
+      therefore said once, in the title, rather than twice (the renderer drops
+      the chart's own green gender label when the page title already says it,
+      which is the existing heading-deduplication rule doing its job).
+
+      So the wording on screen is the pipeline's, and it is a heading the
+      original does not print. The alternative reads exactly like the ch8
+      **Learn > Third Person Paradigm** page you already have: "Third Person
+      Paradigm" in the title, **Masculine** in green under it, changing to
+      Feminine and Neuter as More steps.
+
+      **The original does it the second way when it pages this same stack.**
+      `ch8railwalk` **p13** is Review Personal Pronouns: 3rd Person, and it
+      pages Feminine -> Neuter on Back/More under a heading that stays
+      "Third Person Pronouns" throughout, with the gender as the line beneath
+      it. That is the only place the original itself pages these three charts,
+      and it is the shape option two produces. I did not simply do it, because
+      the page titles are the pipeline's words and quietly discarding delivered
+      data is worse than a heading you can rule on in one line.
+
+      Cost either way is small and neither is a renderer change: the second
+      option is three page titles in `chapt-08.json` becoming "Third Person
+      Paradigm", after which the green gender label comes back on its own.
+
+      → **Keep "Third Person Paradigm: Masculine" / match the Learn page and
+      p13 ("Third Person Paradigm" + green Masculine):** ______________
+
+      Notes:
+
+---
+
+## 3. Appendix — settled this round, not asked
+
+| Item | How it was settled |
+| --- | --- |
+| Objectives spacing on all twelve chapters | Reproduced first: the card is `white-space: pre-wrap`, and the newline 5H-SPEC2 left between the list items drew a full line box under every objective. `ui-behavior.mjs` 5H-SPEC3 1 pins the line-box metrics on one plain-string chapter and one audioMap chapter |
+| The ch8 hint is the same on every item | `ui-behavior.mjs` 5H-SPEC3 2: the hint is walked from a former paradigm item AND a former Three Uses item and the two walks must be byte-identical, plus page order, chart-then-page shape, and the §4.2 bounds |
+| The ch8 Case Drill did not move | Same block: its three per-person routes are asserted on screen (5H-SPEC2 3.1) and its data relation is restated |
+| Per-form taps, and only where declared | `ui-behavior.mjs` 5H-SPEC3 4.2: every form of all four rows is an evict-and-refetch tap, the separators are asserted NOT blue, and a twelve-chapter census matches what the lexicons declare against what the charts draw |
+| The flashcards are the other half of the rule | The ch7 positive is in the same block (`g_voc8a`, the all-three clip, and NOT split into three taps); ch8's and ch11's stay in the 5H-SPEC2 2.7 block where they were settled |
+| ὅς has no per-form clips on either surface | Same block, asserted by name so the row cannot come back without a ruling |
+| (k2) | Same block: chapter 12's data names neither clip anywhere |
+| A `parts` list that could not render is now a build failure | `check-content-shapes.mjs`: every part's form must appear in its own printed lexicalForm and its clip must be in the manifest; negative-tested against both halves |
+| Three stale harness assertions | `ui-behavior.mjs` W1 (walks the pager to its last page again), P3.2 (renamed for the third time, to the shape it now measures), and the two 5H-SPEC2 assertions the (s) and (v) rulings retired |
+| Modal sizing for the four hint pages | `ui-modals.mjs`, two surfaces became four; 54 surfaces at five device heights, 270/270 clean |
+| No page whose data changed overflows at 320 px | `ui-walk.mjs` over chapters 7, 8 and 11 |
+| Offline behaviour did not regress | `ui-offline.mjs` over chapter 8 |
diff --git a/buildout/5H-SPEC3-RESULTS-OPUS.md b/buildout/5H-SPEC3-RESULTS-OPUS.md
new file mode 100644
index 0000000..7989778
--- /dev/null
+++ b/buildout/5H-SPEC3-RESULTS-OPUS.md
@@ -0,0 +1,430 @@
+# 5H-SPEC3-RESULTS-OPUS
+
+Implementation handoff for 5H-SPEC3 Revision 2 — the VERIFY-5H-2 closure
+round. Base: `8f285be` ("updating project files before 5h spec 3"), working
+tree clean at start.
+
+No git was run beyond read-only `git status` / `git diff` / `git show`. Nothing
+is staged, committed or pushed.
+
+Companion documents: `5H-SPEC3-BUILD-OPUS.md` (the complete cumulative diff,
+the tool log and the wall clock), `VERIFY-5H-3.md` (authored this round per
+standing rule 0.2, and it is the previous-response checklist plus one item)
+and the `5H-VISUAL-CHECKLIST-3` section appended to
+`5H-VISUAL-CHECKLIST-OPUS.md`.
+
+---
+
+## 1. Headline
+
+**All four delivered files carry exactly what sections 2 and 4 say they
+carry**, so nothing STOPPED and no data file was edited. Every renderer item
+shipped and every harness item shipped: three small renderer changes, one new
+shape check, and the harness work the three rulings imply.
+
+Four things are worth your attention before the detail.
+
+**First, the spec's diagnosis of the objectives regression was wrong, and the
+right one matters.** Section 1 guesses "the `{text, audioMap}` branch wraps
+items in a block element the string branch never had". It does not — and that
+theory cannot explain the report, which says the gap appeared on ALL chapters
+including the ten that ship plain strings. The card is `white-space: pre-wrap`,
+so the whitespace BETWEEN the list items is content: 5H-SPEC2 broke the
+one-line objectives markup across several lines to make room for the audioMap
+branch, and the newline it left between every `</li>` and the next `<li>`
+collapses to a single space that draws a whole line box. Measured before
+touching anything: 24.8 px of gap under every objective in chapters 1, 7 and
+11 — exactly one line-height. Section 3.1 has the fix and why it is CSS rather
+than a re-joined template.
+
+**Second, the round found a real race in the advance-timing harness**, not
+mine and not in anything this spec touched, and it cost a red gate on the
+first full pass. Section 5 is that story; the short version is that the app
+schedules an auto-advance ON the clip's `ended` event and the harness stopped
+waiting the instant the clip ended, so a long enough clip could lose the race
+by 50 ms. Measured, fixed, and the fix is in the diff.
+
+**Third, one renderer decision was NOT in the spec and I made it anyway.**
+The four hint pages are titled by the data ("Third Person Paradigm:
+Masculine") and each chart also carries its own green gender label, so
+"Masculine" would have printed twice on one screen. The existing
+heading-deduplication rule covers exactly this relation and I applied it. That
+leaves a heading the original does not print, which is `VERIFY-5H-3` (y).
+Section 3.2.
+
+**Fourth, two pipeline debts are OPEN despite section 8's "ALL CLEARED".**
+`assemble_ch7.py` and `assemble_ch8.py` do not know about this round's
+`parts` rulings, so regenerating either chapter would silently drop them.
+Section 6.
+
+| Spec item | State |
+| --- | --- |
+| 1 objectives spacing | done — CSS, plus the line-box assertion on both branches; the spec's suspected cause was not the cause (section 3.1) |
+| 2 (s) four-page ch8 hint | done — `chartIndex` support, plus the heading dedup the data made necessary (3.2); the neuter page stays and items 1 and 9 are why |
+| 3 (t) / (w) ratified | no implementer work, as the spec says; both confirmed still in place by assertion |
+| 4.1 (r) ὅς | data only; asserted by name so it cannot come back silently |
+| 4.2 (v) per-form chart taps | done — `parts` renders as independent taps on the Review chart only (3.3) |
+| 4.3 ch7 οὐ/οὐκ/οὐχ | done — same renderer, three taps plus the flashcard positive |
+| 4.4 (k2) | closed; asserted that chapter 12's data names neither clip |
+| 5 previous-response checklist | carried verbatim into `VERIFY-5H-3.md` section 1 |
+| 6 VERIFY-5H-3 | done — the checklist plus (y), and it says that is all |
+| 7 acceptance | section 4; one gate could not run in this environment (section 7) |
+
+---
+
+## 2. The STOP gate: what the delivered data actually carries
+
+Checked before any code was written. Every claim holds.
+
+| Claim | Verified |
+| --- | --- |
+| 2 `chapt-08.json` carries `ui.hintPages` of FOUR pages: Masculine `chartIndex: 0`, Feminine 1, Neuter 2, then `contentRef: "threeUses"` | yes, in that order, with the three titles the spec names |
+| 2 ...and NO per-item `hintRef` on the Aὐτός Translation Drill | yes — 0 of 21 items carry one |
+| 2 ...and the Case Drill is untouched | yes — 31 of 31 items still route, to exactly three refs, and it has no `hintPages` |
+| 2 the neuter conditional resolves KEEP | yes — item 1 is κατὰ τὸ αὐτὸ πνεῦμα (αὐτὸ, neuter singular) and item 9 is κἀγὼ γινώσκω αὐτὰ (αὐτὰ, neuter plural), so the drill does use the neuter forms |
+| 4.1 `parts` REMOVED from the hos lemma, `audio` still `k_voc5` | yes |
+| 4.2 `parts` added to ch8 ἐγώ/ἡμεῖς (h_voc3a/b) and σύ/ὑμεῖς (h_voc9a/b) | yes |
+| 4.2 ch11 οὗτος αὕτη τοῦτο already carries k_voc7a/b/c | yes |
+| 4.3 `lexicon-chapt07.json` carries `parts` (g_voc8 / g_voc8a / g_voc8b) and `audio: g_voc8a`, `audioAlt` retired | yes, all four |
+| 4.2 the ONLY multi-form rows with per-form clips in twelve chapters are those four | yes — computed over every lexicon, not read off the spec |
+| every part's form appears in its own printed `lexicalForm` | yes, all ten parts across the four lemmas |
+| every part's clip is in `audio-manifest.json` | yes, all ten |
+
+`npm run check:shapes` passes over all twelve chapters, now including the new
+`parts` rule (section 3.4).
+
+---
+
+## 3. What was built, module by module
+
+### 3.1 `src/app.css` — the objectives spacing (spec 1)
+
+**Reproduced first, per the standing lesson that a screenshot at rest is not a
+diagnosis.** At 320 px, before any change: chapter 1 (plain strings) 8 items,
+seven inter-item gaps of **24.8 px** each, list height 595 px against 397 px of
+item heights; chapter 7 six gaps of 24.8 px; chapter 11 six gaps of 24.8 px.
+24.8 px is exactly the computed `line-height` of the item. The DOM shows why —
+between every pair of `<li>` there is a text node holding a single space:
+
+```
+["LI","TEXT(\" \")","LI","TEXT(\" \")", ...]
+```
+
+`.textpage` is `white-space: pre-wrap` (it has been since chapter 1, and the
+objectives card carries it), so that space is not collapsible whitespace, it is
+content, and an anonymous inline box holding it draws a line box inside the
+`<ol>`. Before 5H-SPEC2 the objectives markup was a single unbroken line with
+no text nodes between the items at all; adding the `{@const}` lines the
+audioMap branch needs broke it across several lines, and Svelte collapsed the
+resulting newline-plus-indent to one space. **That is why the report says ALL
+chapters**: the whitespace is in the markup, not in either branch.
+
+The fix is two CSS lines rather than a re-joined template:
+
+```css
+.objectives-list { white-space: normal; }
+.objectives-list > li { white-space: pre-wrap; }
+```
+
+`normal` on the list drops whitespace-only boxes whatever shape the template
+takes, and each item keeps `pre-wrap` so an objective's own text still renders
+exactly as authored. Re-joining the markup would have worked today and broken
+again the next time somebody adds a line to that block, which is precisely how
+this regression happened. No objective in twelve chapters carries a newline or
+a double space, so nothing else in the cell can notice the change (checked).
+
+After: every gap 0 px, and the list's height equals the sum of its items'
+heights in all three chapters — 347 = 347 on ch1, 450 = 450 on ch7, 404 = 404
+on ch11 — with the per-item heights byte-identical to before. That equality is
+the structural statement of "no box between the items", and it is what the new
+assertion pins.
+
+Held against the original: `ch1railwalk` p1 top-right prints its eight
+objectives single-spaced with wrapped continuations indented, which is what the
+port now does and what your GOOD screenshot shows.
+
+### 3.2 `src/components/SelectActivity.svelte` — the four-page hint (spec 2)
+
+**`buildHintPages` takes `chartIndex`.** A `{ hintRef }` page flattens a
+multi-chart target to one page per chart; with `chartIndex` the page names ONE
+chart of that stack instead. Without it the delivered data's three entries
+would each have flattened to three pages and the hint would have been ten pages
+long with the three charts repeated three times — which is what the first
+build did, and which is in the tool log.
+
+**One decision the spec did not make.** The data titles the pages "Third
+Person Paradigm: Masculine" / ": Feminine" / ": Neuter", and each chart in
+that stack carries `subtitle: "Masculine"` etc. of its own — the green label
+that changes as More steps on the ch8 Learn page. Rendered as delivered, page
+1 printed "Third Person Paradigm: Masculine" over a green "Masculine". That is
+the same heading said at two lengths, which is exactly the relation
+`headingKey`/`headingCovers` in `content.js` exist to resolve, so the page
+title stands and the label it repeats is dropped. Chapter 7's hint pages,
+whose title ("Adjective Paradigm") does not say what their subtitles say
+(Singular / Plural), are untouched — verified.
+
+I did not shorten the titles instead, because the wording is the pipeline's to
+choose and discarding delivered data silently is worse than a heading the
+original does not print. But it IS a heading the original does not print:
+`ch8railwalk` p13 shows the original's own paged third-person stack titled
+"Third Person Pronouns" with **Feminine** and **Neuter** as the labels
+underneath, which is the shape the port's Learn page already has. That is
+`VERIFY-5H-3` (y), and answering it against the default is three page titles in
+the data with no renderer change at all.
+
+Result, walked from two different items: four pages in the authored order,
+three charts then a teaching page, Back greyed on page 1, More greyed on page
+4, Close on all four, and the two walks byte-identical.
+
+### 3.3 `src/lib/content.js` + `src/components/ContentAudio.svelte` — per-form chart taps (spec 4.2/4.3)
+
+**`content.js`: `vocabParts(lemma, display)`, new, plus one field on three
+resolved-row shapes.** A row carries its lemma's `parts` only when the display
+it is about to print actually contains every one of those forms. That guard is
+what keeps chapter 8's case-split cards out of it: `sensePool` gives παρά and
+ὑπό a card per case whose display is one form plus a case tag, and those cards
+have no business carrying the lemma's whole set. The three resolved-row sites
+(explicit `{ref}` items, the senses pool, the lemma pool) all go through the
+one helper, so the two chapters that reach the chart by different pools behave
+the same way.
+
+**`ContentAudio.svelte`: the reviewVocab row.** When a row has `parts`, the
+grid cell is a `<span>` holding one `<button class="rv-form">` per printed form
+with the punctuation between them left as inert text, split by the same
+`splitTaps` an `audioMap` uses. Without `parts` the row is the single button it
+has always been. The flashcard reads none of this and still plays `audio`,
+which is the other half of your (v) ruling.
+
+**`app.css`.** The cell gives its blue back (`.rv-greek.rv-forms` is ink) and
+each form takes it, because a comma that reads as tappable is a directive-8
+violation. `.rv-form` inherits the cell's font size rather than `.greek-tap`'s
+inline 1.15em, so the row's type does not change size.
+
+**The layout is unchanged, and that was measured rather than eyeballed.** At
+320 px each multi-tap cell occupies the identical box as the single button it
+replaces: 112x66 for οὐ/οὐκ/οὐχ, 112x66 and 112x33 for the two chapter-8 rows,
+112x99 for οὗτος/αὕτη/τοῦτο. Sampled at 768 px, the forms are rgb(22,99,199)
+and the separators rgb(34,37,42).
+
+### 3.4 `scripts/check-content-shapes.mjs` — the check that would have caught it
+
+ONBOARD §7. `parts` is a promise that the row can keep, and it can fail
+silently in two ways: a form that is not in the printed `lexicalForm` renders
+as no tap at all (the split simply does not match), and a clip that is not in
+the manifest toasts on device. Neither would raise anything today — the
+lexicons are not walked by the existing manifest check, which only reads
+`chapt-*.json`. Both are now build failures.
+
+Negative-tested against both halves at once (one part's form changed to a word
+not in its own lexicalForm, another's clip changed to an id that does not
+exist); both were reported by name and the data was restored from a copy
+immediately. `git diff` and `git status` on `src/data/` are both empty.
+
+### 3.5 Harness
+
+- **`ui-behavior.mjs`**, a new 5H-SPEC3 block of **31 assertions**, plus three
+  repairs (section 5) and two removals the rulings require:
+  - **1**: line-box metrics on one plain-string chapter and one audioMap
+    chapter, plus the taps surviving on both tapping chapters.
+  - **2**: the hint walked from item 1 and from item 5 — a former paradigm
+    item and a former Three Uses item — asserting page order, the
+    charts-then-page shape, the §4.2 bounds, Close on every page, and that
+    the two walks are byte-identical; plus the data relation over all 21
+    items and the Case Drill control.
+  - **4.1/4.2/4.3**: every form of all four rows as an evict-and-refetch tap
+    (ten taps), the separators asserted NOT blue, the ch7 flashcard positive
+    and its not-split negative, ὅς named, (k2) named, and a twelve-chapter
+    census that compares what the LEXICONS declare with what the CHARTS draw.
+  - **Removed**: the two 5H-SPEC2 3.1 assertions that a paradigm item and a
+    Three Uses item reach different surfaces, and the two 2.7 assertions that
+    a chart ROW plays the whole-set clip. Both pinned behaviour your answers
+    reversed; leaving them would have been a harness proving the opposite of
+    the round.
+- **`ui-modals.mjs`**: the two form-sought translation surfaces became four
+  page-stepped ones, via a new `hintPage(chapter, activity, index)` helper —
+  54 surfaces, 270 states at five device heights.
+- **`ui-disclosure.mjs`**: D13's two entries became one with three navigation
+  steps, for the same reason.
+- **`check-doc-integrity.mjs`**: one `maxBuffer`, which is what made the gate
+  runnable again (section 7).
+
+---
+
+## 4. Acceptance
+
+| Gate | Result |
+| --- | --- |
+| `npm run check:shapes` | PASS, twelve chapters, with the new `parts` rule |
+| `npm run build` | PASS, clean; 41 precache entries |
+| `npm run check:lazy-chunk` | PASS — twelve chapter chunks + twelve lexicon chunks emitted, precached, out of the index bundle |
+| `node scripts/ui-behavior.mjs` | **1125/1125** (was 1094 before this round; +31) |
+| `node scripts/ui-modals.mjs` | PASS — 54 surfaces x 5 device heights, 270/270 clean |
+| `node scripts/ui-disclosure.mjs` | **303/303** |
+| `node scripts/ui-disclosure3.mjs` | **84/84** |
+| `node scripts/ui-walk.mjs --chapters=chapt_7,chapt_8,chapt_11` | PASS — zero 320 px overflow, zero interaction errors, all rail counts and Next actions live, all expanders and chart states opened, no console errors |
+| `node scripts/ui-offline.mjs --chapters=chapt_8` | PASS — 25 stops rendered, 0 missing, refresh OK, no console errors |
+| `npm run check:docs` | **44 failures, the unchanged pre-existing baseline** — but it could not run at all until a one-line repair; section 7 |
+
+The disclosure count moves from 308 to 303 because D13's two ch8 entries became
+one: the two entries carried a "reached the form this composition belongs to"
+check each, and the single entry seeks no form.
+
+---
+
+## 5. The advance-timing race, which is worth the space
+
+The first full `ui-behavior` pass returned **1124/1125**, and the one failure
+was in the 5F block, on a drill this round does not touch:
+
+```
+FAIL 5F chapt_12 c12_drill_translation (manualOnIncorrect): a CORRECT answer
+auto-advances on max(2000ms, clip) and never waits — item 1 of 20 -> 1 of 20
+at 8579ms
+```
+
+Rather than re-run until it went green, I measured the surface directly, four
+items in a row:
+
+| prompt | clip length | clip ended at | advanced at |
+| --- | --- | --- | --- |
+| αὐτὸς γὰρ ἐγίνωσκεν… | 7102 ms | 7151 ms | **7194 ms** |
+| ἔβλεπον εἰς ἀλλήλους… | 5659 ms | 5689 ms | **5735 ms** |
+| Ἦν δὲ ἄνθρωπος… | 4904 ms | 4953 ms | **5007 ms** |
+
+The app is right: it schedules the advance on the clip's own `ended` event and
+lands 43-92 ms later. The HARNESS is what was wrong. `stillAdvancing` keeps
+the window open while a clip is playing and closes it the moment none is —
+which is a state the surface passes through, correctly, on its way to
+advancing. Only a clip longer than the 7000 ms floor can reach that gap at
+all, which is why exactly one chapter-12 sentence item failed a pass that was
+otherwise green, and why it looks like a flake rather than the deterministic
+race it is.
+
+The comment above `stillAdvancing` says this function was itself written to
+kill a flake of the same family ("`l_td11` is exactly 7000ms against a 7000ms
+ceiling"). That fix closed the ceiling half; this closes the tail half. The
+window now stays open for 750 ms after the last clip stops — an order of
+magnitude more than the observed tail, and an order of magnitude less than the
+30-second backstop, so a genuinely stuck surface still fails. Confirmation
+pass: **1125/1125**.
+
+Two smaller repairs, both ONBOARD §7 ("grep the harness for the OLD shape"):
+
+- **`ui-behavior` W1** stood on an item whose `hintRef` routed to Three Uses.
+  No item carries a `hintRef` now, so it would have thrown on `undefined`. It
+  walks the pager to its last page again — which is what it did before
+  5H-SPEC2, by a different route — and is written as "press More until it
+  greys out" so the page COUNT lives in the block that owns it.
+- **`ui-behavior` P3.2**'s ch8 label is renamed for the third time, once per
+  shape. It measured the hint's own pager, then the paradigm's, and now the
+  hint's again; the `seek` it needed while the hint was form-dependent is gone,
+  because every item opens the same hint.
+
+---
+
+## 6. Two pipeline debts that section 8 says are cleared
+
+Spec section 8 says "ALL CLEARED with Revision 2" and lists `assemble_ch11.py`
+and `assemble_ch12.py`. Chapters 7 and 8 also changed this round, and their
+assemblers do not know it:
+
+- **`scripts/assemble_ch7.py` line 1081** still writes
+  `lemmas['ou']['audioAlt'] = [g_voc8a, g_voc8b]` and leaves `audio` at
+  `g_voc8`. Regenerating chapter 7 would drop the `parts` list, retire the
+  three taps, and put the flashcard back on the wrong clip — a straight
+  reversal of 4.3.
+- **`scripts/assemble_ch8.py`** has no `parts` for `ego` or `su` and no
+  `post_patches_lexicon` at all, so the same is true of 4.2's two rows.
+
+Neither would be caught by `check:shapes`, because an absent `parts` list is a
+legal shape. It WOULD be caught by the twelve-chapter census in
+`ui-behavior` 5H-SPEC3 4.2, which compares the lexicons' declarations against
+the charts — that census exists partly for this — but the guard is a red gate
+after the fact, not a pipeline that carries the ruling forward.
+
+I have not edited either script: they are pipeline files and the rulings they
+need are the pipeline's to write.
+
+---
+
+## 7. The environment, and one gate that had stopped running
+
+**`npm run check:docs` was dead before this round started, and the reason is
+worth two lines.** It crashed with `ENOBUFS` out of `spawnSync` before reading
+a single document. `check-doc-integrity.mjs` calls
+`execSync('git ls-files buildout')`, and `buildout` now holds 12,442 tracked
+files — 12,306 of them screenshots from previous rounds' corpora — whose paths
+come to **1,085,518 bytes**, just past `execSync`'s 1 MB default `maxBuffer`.
+The three sibling calls in the same file already pass `maxBuffer: 1 << 26`;
+this one was missed. Adding it there restores the gate, and the spec asks me to
+note the count, which I could not do while it would not run:
+
+**44 document-integrity failures — the same baseline the spec names**, and
+none of them are mine (they are the same VERIFY/checklist files the previous
+two rounds reported). That is one line of a script outside the round's stated
+scope, and it is in the deviations list.
+
+The crossing happened before `8f285be`: `git ls-files` lists TRACKED files
+only, and everything this round adds is new and untracked, so it cannot have
+pushed the list over. Worth flagging to the pipeline anyway — the corpus is
+growing about a thousand files a round, and the next thing that shells out to
+a file list will hit the same wall.
+
+**Separately, the volume holding the repo (F:) ran out of space mid-round.**
+`ui-modals` died with `ENOSPC` on its first attempt and the drive reported
+**0 bytes free** on two independent checks, so every screenshot-writing
+harness was re-run with its output on C: and `dist/` was deleted to make room
+for these documents. By the time the documents were written the volume
+reported ~60 GB free again — whatever was consuming it was transient and none
+of it was this round's — so `dist/` is rebuilt (clean, 41 precache entries)
+and the corpora are copied back into `buildout/screenshots` where the
+convention puts them:
+
+- `5h3-walk-opus/` (293 files, both widths, three chapters)
+- `5h3-modals-opus/` (541 files, 54 surfaces at five heights, at rest and
+  content-scrolled)
+- `5h3-hint-pages/autos-hint-p1..p4.png` and `5h3-ch1-objectives-{320,768}.png`
+
+Flagged rather than passed over because it cost a harness run and because a
+volume that hits zero while a build is running can corrupt whatever it is
+writing. Nothing here shows any sign of that — every gate above was re-run to
+completion afterwards — but it is worth knowing the machine did it once.
+
+---
+
+## 8. Deviations from the spec
+
+1. **Section 1's stated cause is not the cause** (section 3.1). The fix is CSS
+   on the list rather than a change to either branch, and it is deliberately
+   immune to how the template is later formatted.
+2. **The hint page titles absorb the chart's own gender label** (section 3.2).
+   Not asked for; the alternative was printing "Masculine" twice on one screen.
+   `VERIFY-5H-3` (y) puts the wording back in your hands.
+3. **One harness repair outside the round's scope** (section 5): the
+   advance-timing race. A gate that fails on a real race is not a gate, and the
+   evidence is in section 5 rather than in a re-run until green.
+4. **DIVERGENCE-LOG D-57 was appended by the implementer**, following the
+   5H-SPEC2 precedent and the log's own standing rule that a deliberate
+   departure is entered when it is decided. The port shows four hint pages
+   where the original shows two, on your instruction; if the pipeline has
+   already spent D-57, renumber it.
+5. **One line added to `check-doc-integrity.mjs`** (section 7), so that the
+   count the spec asks me to note could actually be read. It is the same
+   `maxBuffer` its three sibling calls already carry.
+
+---
+
+## 9. Surprises
+
+- The objectives gap was in the WHITESPACE, and it had been shipping on all
+  twelve chapters since 5H-SPEC2 — including the ten with no audioMap
+  anywhere near them.
+- `stillAdvancing`'s remaining race had been reachable since the day it was
+  written, and only by the four or five longest clips in the app.
+- `check:docs` had stopped running some rounds ago, silently, for a reason
+  that has nothing to do with documents: the screenshot corpus pushed a file
+  list past a 1 MB buffer.
+- Chapter 7's `parts` mapping is genuinely odd on its face and correct: `οὐκ`
+  taps `g_voc8a`, which is also the clip that recites all three and therefore
+  also what the flashcard plays. That is your listen and your mapping; the
+  harness comment says so, so nobody "fixes" it later.

```
