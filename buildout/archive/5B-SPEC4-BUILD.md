# 5B-SPEC4-BUILD.md — build log

Implementer: Fable (Claude Opus 5) in Claude Code, one session, single worktree
on `main`. Wall clock: about 1h25m from opening `CHAT-HANDOFF.md` to the last
code change, and about 1h45m to both deliverables — roughly 50 minutes on
reading plus the font investigation that had to happen BEFORE the spec could be
written, 25 on implementation, and the rest on verification runs (each headless
run is a fresh browser and a 45-item drill sweep, so the geometry comparison
alone is a couple of minutes per pass).

This round is unusual in the process: there was no chat-side data delivery, so
I acted as pipeline AND implementer, and there is no competing implementer to
grade against. Deliverable pair is therefore this file plus
`5B-SPEC4-RESULTS.md`, and `5B-SPEC4.md` is mine too. The exact diff below is
`git diff` in the working tree at the end of the session (nothing committed,
nothing pushed, per the standing rule).

## 1. Reading order

`buildout/CHAT-HANDOFF.md` first (explicitly asked for), then `5B-SPEC3.md` and
`5B-SPEC3-RESULTS-OPUS.md` to see what the accepted base carries and what the
last round already knew it had got wrong. Then the code the PDF points at:
`src/lib/greek.js`, `src/app.css`, `SelectActivity`, `DivideActivity`,
`PlaceAccentActivity`, `ActivityHost`, `scripts/check-content-shapes.mjs`,
`scripts/make-greek-font.py`, and the chapter-2 data for the four activities
named in the PDF.

The PDF led this round rather than a spec, since the spec did not exist yet.
Three places where reading it closely changed the shape of the work:

- **Item 4's strikethrough.** The whole boxes-and-arrows thread is struck out
  and replaced. Reading only the surviving paragraph would have produced a
  tweak; reading the strikethrough tells you the previous two rounds of
  ergonomics work on that exercise is being retired deliberately, and that
  SPEC3's per-word sizing (which itself reversed SPEC2) has to go back.
- **Item 5's method sentence** — "produce the word with the accent using the
  actual text, and then move the manually positioned accents to perfectly
  overlap that" — is not a description of a symptom, it is a specification of
  the algorithm. Everything in section 4 below follows from taking it
  literally.
- **Item 5's closing question** ("would that even be feasible to create rules
  for every combo or how many permutations are we looking at?") is answerable
  with a number, and the answer decides the design. I went and got the number
  before writing the spec.

## 2. Two questions asked before any code

Both were genuine forks where the two readings produce materially different
work, so they went to Nathanael up front rather than being guessed at and
flagged afterwards.

1. **Item 3, the accent-placement root.** The six items whose `root` equals
   their `answerForm` show no Greek precisely because printing the root prints
   the accented answer above the unaccented slots. Three options offered with
   mockups: show it always (faithful to the original, which had the same
   problem on item 13), show it unaccented when identical, or re-root the five
   circumflex items (which would have meant inventing content). Answer: **show
   it unaccented when identical**.
2. **Item 1, the Syllable Counting Drill.** It is `attemptsPerItem: "retry"`,
   so making a wrong answer auto-advance retires the retry loop and changes
   what completion means. Answer: **"leave this as is, ignore and skip point
   1."** Nothing was touched; SPEC4 §0 records the withdrawal and the one
   constant that would implement it if it comes back.

## 3. Implementation order

Investigation (font/geometry, ~35 min) -> spec -> data edits (A) -> mark
geometry (B) -> division rebuild (C) -> the D items -> guards -> verification.

The investigation had to come first because the spec's central claim — that
six rules cannot express what the font does — is either true or it is not, and
writing a spec around it without checking would have been guessing.

## 4. Section B: the geometry rebuild (the long part)

### 4.1 Establishing that six rules are wrong

SPEC3's table has six CSS rows. First move was to dump the precomposed
composites out of the shipped woff2 with fontTools and see how much variation
there actually is:

    alphatonos (ά)  = alpha + tonos@(205,0)
    uni1F04    (ἄ)  = alpha + uni1FBF@(119,0) + tonos@(250,0)
    uni1FC6    (ῆ)  = eta   + glyph00200@(53,0)
    uni1F86    (ᾆ)  = alpha + uni1FBF@(186,6) + glyph00200@(52,224) + uni037A@(137,0)
    uni0390    (ΐ)  = iota  + dieresistonos@(-204,0)
    uni1F08    (Ἀ)  = A     + uni1FBF@(52,-70)
    uni1F0C    (Ἄ)  = A     + uni1FBF@(-116,-82) + tonos@(15,-82)
    uni1F18    (Ἐ)  = E@(119,0) + uni1FBF@(-40,-70)

The acute alone runs from −0.231em to +0.379em across 75 rows. That settles it:
one constant per layout class is an average of positions that are never the
same twice, and averaging is exactly what produces "always ALMOST right".

I then quantified SPEC3's specific error for the words the PDF complains about,
by computing what its centring rule resolves to (`baseAdvance/2 −
markAdvance/2`) against the font's number. The `καὶ` iota comes out +0.058em =
**+2.32px right** at prompt size. That is the PDF's "ever-so-slightly to the
right of the i in kai", to two decimal places, and it is in RESULTS §2.

### 4.2 The anchoring, decided before measuring anything

The vertical half of the complaint ("ride ever so slightly low and touch the
letters beneath them") could not be fixed by any offset table while the overlay
stayed absolutely positioned against the cluster's bottom edge: the distance
from that edge to the baseline is a function of `line-height` and of which font
metric the browser picks for the strut, neither of which is under our control
and neither of which is the same in every browser.

So the marks became **zero-advance inline boxes in normal flow, placed before
the base**. The browser then seats them on the same baseline at the same pen
position the base glyph starts from — the same thing it does for a real
combining mark — and the table's offsets are the only thing that moves them.
No `bottom`, no `left: 50%`, no half-width centring correction. This is why the
CSS in the diff has no numbers left in it.

### 4.3 Three things the naive generator got wrong

**(a) The base is not always at the origin.** My first pass assumed the base
component sat at (0,0) and subtracted it. 65 clusters failed, all capitals:
`Ἐ` is `E` at +119 with the psili at −40, because the composite shifts the
letter right to make room for a mark in front of it. Fixed by locating the base
component inside the composite and expressing every mark offset relative to
where it actually lands, plus emitting `bx`/`aw` so the overlay occupies the
printed advance rather than only the correct relative geometry.

**(b) The fused dialytika glyphs.** `U+0385` (dots + tonos) is a single
outline, and the Marking Recognition drill needs to redden the dots of `ΐ`
while its accent stays ink. First attempt rebuilt it from the standalone
`dieresis` and `tonos` glyphs by ink-box alignment. The reassembly assertion I
had written to check that idea caught it immediately:

    fused glyph dieresistonos: reassembled ink (142,606,436,810)
                                        != (142,606,527,809)

Dumping the contours explained why:

    dieresistonos: dot(142..244) accent(290..408) dot(425..527)
    dieresis:      dot(142..244)                  dot(332..434)
    tonos:         accent(40..186)   [146 wide, vs 118 in the fused glyph]

The font sets the tonos **between** the dots — which is exactly where the PDF
says it expects it — with the dots pushed 93 units further apart and the accent
redrawn 28 units narrower. It cannot be reassembled from anything else in the
font. But its three ink pieces are horizontally disjoint, so the answer is to
print the fused glyph three times at one offset and clip each copy to one
vertical band. What gets painted is the printed glyph itself, in two colours.
The clip is a `polygon()` in em with generous vertical bounds, so only the x
coordinates matter and no line-box metric enters into it.

**(c) Unencoded component glyphs.** The perispomeni component is `glyph00200`
with no codepoint of its own; `glyph00196`/`glyph00197` turned out to be macron
and vrachy. The first two are resolved through an encoded glyph that draws
exactly them and nothing else (`U+1FC0` is a one-component composite of
`glyph00200`); the quantity marks are not marks this course teaches and are
skipped by NFD before they can become "unresolved" noise. The script exits 1,
naming codepoints, on anything left over — I would rather it refuse than emit a
table with holes, because a hole degrades to the old approximate path and looks
almost right.

### 4.4 Proving it, rather than looking at it

The acceptance test drives the REAL app: navigate to each drill, set
`--mark-red` to the ink colour so hue cannot dominate the comparison, screenshot
the prompt, then insert a twin button with the same classes and box holding the
plain precomposed string, screenshot that, and `pixelmatch` the two.

19 of 45 items came back at literally zero differing pixels. Four came back
between 0.4% and 0.9%, which looked like failures until I looked at the diff
image: a thin outline around *every letter of the word*, including letters with
no marks on them. That is a sub-pixel shift of the whole string, which is what
splitting a text run into separate inline boxes costs, not a displaced mark.

The control that proves it: diff the overlay against a precomposed twin whose
letters are ALSO split into per-cluster inline boxes.

    τοὔνομα  1119 px -> 358 px
    λέγω      678 px ->  69 px
    ῥῆμα      165 px ->   3 px

Without that control I would have spent the rest of the session chasing an
offset error that does not exist. It is in RESULTS §3 for the same reason.

### 4.5 The build guard

The PDF's item 5 anchors include `φαρισαῖος`, which SPEC3 RESULTS had already
flagged as pointing at cluster 6 — a bare alpha — so it rendered with nothing
red at all. Fixing the data is one character; making sure it cannot come back
is the useful part. `check-content-shapes.mjs` now resolves every drill item's
reddened cluster and fails on a cluster past the end of the word, a cluster
with no mark, or a cluster with no geometry row. Punctuation items are exempt
because those clusters ARE the mark.

First run failed on the six apostrophe/colon/question items, which is how the
exemption got written. Proved by mutation afterwards: putting `redMarkCluster`
back to 6 fails the build naming the item path.

## 5. Section C: the division rebuild

Straightforward once the interaction was pinned down from the PDF paragraph.
The decisions worth recording:

- **Pool-static sizing** measures every word off-screen at a reference size and
  lets the widest set the size for all 20. The probes are parked off-canvas
  rather than `visibility: hidden`, because SPEC3 established that an invisible
  probe is not reliably re-laid-out when the bundled font swaps in — and for
  the same reason nothing here uses `bind:clientWidth`.
- **`touch-action: none` on the word is load-bearing.** Without it a drag along
  the word scrolls the page instead of moving the divider. The app-wide
  `touch-action: manipulation` umbrella had `.divide-letter` in its explicit
  list; that entry (and the now-dead `.divide-gap`) came out.
- **An occupied lane is not a drop target.** Dragging a divider onto another
  one would silently merge them and the learner would not know which they lost,
  so the move is refused and the divider stays where it was.
- **The word stops being an audio tap.** It cannot be both a drag surface and a
  play button, so it renders in ink and Pronounce carries the audio. That is a
  new standing exception to directive 9 and is called out in RESULTS §7.
- **Keyboard.** The word is now a control with no other affordance, so it takes
  focus and arrows/space work. Not in the spec; adding an interactive element
  with no keyboard path would have been a regression.
- Letters are `pointer-events: none` so every pointer event lands on the word
  container and the hit test is one element, not nine.

## 6. Sections A and D

The data edits are surgical string replacements against the file read with
`newline=''`, so the CRLF line endings and the `indent=1` formatting survive
untouched and the diff is only the lines that changed. Verified by reading the
diff back and re-parsing the JSON. `b_ex2_21` was checked against the audio
manifest before wiring it, and confirmed after by intercepting the network
request the tap actually makes rather than by reading the data back.

D2 turned out to be four lines: `analyzeAccent()` already strips exactly the
accents and keeps exactly the breathings, so the unaccented root is
`analyzeAccent(root).display`.

D1 needed no code at all — with the ditto marks gone the `greekRows` block
reads as a two-column chart again, and it survives 320px
(`grid-template-columns: 105px 105px`). Checked rather than assumed.

## 7. Harness

Playwright + Chromium, installed in the session scratchpad rather than the repo
(`playwright-core` as a devDependency remains a carried nit). Scripts:

- `lib.mjs` — launch/navigate/font-wait, error collection.
- `markgeom.mjs` — the 45-item overlay-vs-precomposed pixel comparison.
- `probe.mjs` — the split-run control from §4.4.
- `anchors.mjs` — per-word screenshots of the PDF's anchors, red enabled.
- `divide.mjs` / `divide2.mjs` / `behave.mjs` / `behave2.mjs` — division
  sizing across the pool, the tap/grab/drag/clear/check assertions, the
  accent-placement header sweep, score-line visibility.
- `charts.mjs` / `chart320.mjs` / `audio.mjs` — rule charts at two widths and
  the `b_ex2_21` request interception.
- `walk.mjs` — full sequential-rail walks, both chapters, 320 and 768, with
  overflow, pending-placeholder and unknown-block checks.
- `offline.mjs` — SW install, CDP offline, hard refresh on an activity route,
  both rails, plus the metric comparison that proves the BUNDLED face is in use
  rather than trusting the family name.

Harness gotchas from this session, worth recording:

1. **Waiting for the Greek font hangs on pages that have no Greek.** A page
   with no Greek never requests the face, so it stays `unloaded` forever. The
   fix is to force it (`document.fonts.load('40px "GreekTutor Serif"', 'ἄ')`)
   before waiting — which is also the right thing to do, since every
   measurement here must be against the shipped font and never the fallback.
   This cost two failed runs that looked like a hung server.
2. **The route is `#/activity/<chapter>/<activity>`**, not
   `#/chapter/<c>/activity/<a>`. The wrong form falls through to the chapter
   hub, which renders fine and produces plausible-looking output — the run does
   not fail, it silently measures the wrong page. Caught by dumping
   `document.body.innerText`.
3. **Playwright strict mode is a feature here.** `button.prompt.red-mark`
   matched the comparison twin as well as the real prompt, and `Next` matched
   both the activity stepper and the sequential rail. Both would have been
   silent wrong-element bugs in a looser driver.
4. **The drill pools shuffle per session**, so item indices are not stable
   between runs — the same word was item 15 in one pass and item 19 in the
   next. Report by word, never by index.
5. **Python on Windows resolves `/tmp/...` to `C:\tmp\`**, so a scratchpad
   round-trip through a shell heredoc needs Windows-form paths passed as
   argv, not interpolated POSIX ones.

## 8. Judgement calls

Recorded in RESULTS §7 rather than duplicated here: the withdrawn item 1, the
root display (Nathanael's choice of three), M4 now following the font instead
of SPEC3's deliberate departure, the division word no longer being an audio
tap, Clear Answer re-opening a finalized item, leaving the four sub-pixel
residuals alone, and the `package-lock.json` correction.

## 9. The exact diff for this round

State of the working tree at the end of the session. Nothing is committed and
nothing is pushed, so this is `git diff` plus the untracked additions.

### 9.1 Inventory

```
 M package-lock.json
 M scripts/check-content-shapes.mjs
 M src/app.css
 M src/assets/fonts/NOTICE.md
 M src/components/DivideActivity.svelte
 M src/components/PlaceAccentActivity.svelte
 M src/components/SelectActivity.svelte
 M src/data/chapt-02.json
 M src/data/lexicon-chapt02.json
 M src/lib/greek.js
?? buildout/5B-SPEC4.md
?? buildout/5B-SPEC4-BUILD.md
?? buildout/5B-SPEC4-RESULTS.md
?? scripts/make-mark-geometry.py
?? src/lib/mark-geometry.json
```

The three `buildout/` markdown files are this round's deliverables and are not
reproduced below. Everything else is, in full.

`package-lock.json`'s two lines are `npm install` moving `idb` out of `dev` to
match `package.json`, where it has always been a real dependency; the lock was
stale. Not part of the round's work, left corrected.

### 9.2 Code, styles and build guards

````diff
diff --git a/package-lock.json b/package-lock.json
index cd64ef1..64f37e2 100644
--- a/package-lock.json
+++ b/package-lock.json
@@ -7,6 +7,9 @@
     "": {
       "name": "greek-tutor",
       "version": "0.1.0",
+      "dependencies": {
+        "idb": "^7.1.1"
+      },
       "devDependencies": {
         "@sveltejs/vite-plugin-svelte": "^3.1.2",
         "svelte": "^4.2.19",
@@ -3844,7 +3847,6 @@
       "version": "7.1.1",
       "resolved": "https://registry.npmjs.org/idb/-/idb-7.1.1.tgz",
       "integrity": "sha512-gchesWBzyvGHRO9W8tzUWFDycow5gwjvFKfyV9FF32Y7F50yZMp7mP+T2mJIWFx49zicqyC4uefHM17o6xKIVQ==",
-      "dev": true,
       "license": "ISC"
     },
     "node_modules/internal-slot": {
diff --git a/scripts/check-content-shapes.mjs b/scripts/check-content-shapes.mjs
index ffe11e4..d9b96da 100644
--- a/scripts/check-content-shapes.mjs
+++ b/scripts/check-content-shapes.mjs
@@ -68,9 +68,54 @@ for (const file of files) {
   });
 }
 
+// ---- RED-MARK GEOMETRY COVERAGE (5B-SPEC4 B2) ----
+// Every cluster a drill reddens must have a row in the generated font table.
+// A cluster that misses it still renders, via the legacy rule table, and looks
+// ALMOST right -- which is the exact failure VERIFY3 spent a round finding.
+// Almost-right is not something a device pass should have to catch twice, so
+// it fails the build instead.
+const GEOMETRY = JSON.parse(readFileSync('src/lib/mark-geometry.json', 'utf8')).clusters;
+const ACCENTS = new Set(['́', '̀', '͂']);
+const MARKS = new Set([...ACCENTS, '̓', '̔', '̈']);
+const segment = text => [...new Intl.Segmenter('el', { granularity: 'grapheme' }).segment(text)].map(p => p.segment);
+
+for (const file of files) {
+  const data = JSON.parse(readFileSync(join(DATA, file), 'utf8'));
+  walk(data, file, (activity, path) => {
+    if (activity.type !== 'select') return;
+    for (const [index, item] of (activity.items || []).entries()) {
+      if (!item.greek) continue;
+      const clusters = segment(item.greek);
+      let target = null;
+      if (item.redMarkCluster) target = item.redMarkCluster;
+      else if (activity.redFirstAccent) {
+        target = clusters.findIndex(c => [...c.normalize('NFD')].some(ch => ACCENTS.has(ch))) + 1 || null;
+      }
+      if (!target) continue;
+      const cluster = clusters[target - 1];
+      if (cluster == null) {
+        problems.push(`${path}.items[${index}]: redMarkCluster ${target} is past the end of "${item.greek}".`);
+        continue;
+      }
+      // Apostrophe, raised-dot colon and question mark ARE the mark: there is
+      // no base letter to lift them off, so those clusters redden whole and
+      // need no geometry row.
+      if (!/\p{L}/u.test(cluster)) continue;
+      const marks = [...cluster.normalize('NFD')].filter(ch => MARKS.has(ch));
+      if (!marks.length) {
+        problems.push(`${path}.items[${index}]: redMarkCluster ${target} of "${item.greek}" is "${cluster}", which carries no mark — nothing would render red.`);
+        continue;
+      }
+      if (!GEOMETRY[cluster.normalize('NFC')]) {
+        problems.push(`${path}.items[${index}]: "${cluster}" of "${item.greek}" has no mark-geometry row; it would fall back to the approximate rule table.`);
+      }
+    }
+  });
+}
+
 if (problems.length) {
   for (const problem of problems) console.error(`FAIL: ${problem}`);
   process.exit(1);
 }
 
-console.log(`PASS: content shapes intact — ${files.join(', ')} checked (biblist entries are strings; greekRows rows carry content).`);
+console.log(`PASS: content shapes intact — ${files.join(', ')} checked (biblist entries are strings; greekRows rows carry content; every reddened cluster has a font-derived geometry row).`);
diff --git a/src/app.css b/src/app.css
index 5ed00b6..ce80b80 100644
--- a/src/app.css
+++ b/src/app.css
@@ -118,63 +118,68 @@ button { font: inherit; cursor: pointer; }
    the two baselines puts it where the combining mark would have been. */
 .prompt.red-mark { font-size: 2.5rem; }
 .mark-red { color: var(--mark-red); }
-.rm-cluster { position: relative; display: inline-block; }
 .rm-base { color: inherit; }
-/* ---- MARK GEOMETRY TABLE (5B-SPEC3 C, rules M1-M6) ----
-   The overlay carries the cluster's WHOLE mark set (greek.js markOverlayParts),
-   so these offsets are the only thing deciding where marks sit -- there is no
-   second, base-drawn mark left on the vowel to collide with. This is the
-   standing rule set for chapters 3+: a new combination gets a row here, never a
-   per-word nudge.
-
-     --mx  horizontal offset from the base's centre  (+ right)
-     --my  vertical offset from the spacing glyph's natural seat (+ down)
-
-   Every constant below is READ OFF THE BUNDLED FONT rather than eyeballed: the
-   precomposed polytonic glyphs are composites (base + spacing-mark components),
-   so the type designer's own component offsets ARE the table. Divide by the
-   1000-unit em: e.g. in this font a-smooth-circumflex places the circumflex
-   224 units above its natural seat, hence the -0.224em lift in M3, and a
-   capital lowers its mark 70-82 units, hence M5's +0.075em.
-
-   M1  a single accent sits centred on the vowel, at the glyph's natural
-   height (the Greek composites all use a zero y-offset over lowercase). On a
-   diphthong the mark belongs to the SECOND vowel's cluster already, so
-   "above the second vowel" needs no rule of its own. */
-.rm-marks { position: absolute; left: 0; right: 0; bottom: 0; height: 0;
-  pointer-events: none; }
-.rm-mark { position: absolute; left: 50%; bottom: 0; display: block;
-  line-height: 1.15; white-space: pre; color: inherit;
-  --mx: 0em; --my: 0em;
-  transform: translate(calc(-50% + var(--mx)), var(--my)); }
+/* ---- MARK GEOMETRY (5B-SPEC4 B) ----
+   SPEC3 positioned these overlays from six hand-written rules and VERIFY3
+   found what six rules cost: marks riding a hair low, an acute a hair right of
+   the iota in kai, an accent off-centre in a diaeresis -- always ALMOST right,
+   while the printed text was always exactly right. The font is the reason: it
+   holds a distinct offset pair for each of ~220 precomposed characters (acute
+   over alpha +0.205em, over omega +0.334em, over iota -0.028em), and no
+   averaging of those is correct anywhere.
+
+   So position now comes from the font, per character, via
+   src/lib/mark-geometry.json (generated by scripts/make-mark-geometry.py).
+   The rules below are MECHANISM ONLY -- they carry no magic numbers.
+
+     --mx / --my   the character's own offsets, em, from the BASE glyph's
+                   origin (+x right, +y down); supplied inline per mark
+     --bx / --aw   set only where the composite shifts its base (capitals do:
+                   Ἐ draws its E at +0.119em with the psili in front of it), so
+                   the cluster occupies the width the printed character would
+
+   THE ANCHORING IS THE OTHER HALF OF THE FIX. The marks are zero-advance
+   inline boxes in NORMAL FLOW, placed before the base, so the browser seats
+   them on the same baseline at the same pen position the base starts from and
+   the offsets above are all that moves them. The old overlay was absolutely
+   positioned against the cluster's bottom edge, whose distance from the
+   baseline depends on line-height and on which font metric the browser picks
+   for the strut -- that is the "rides ever so slightly low" in VERIFY3. */
+.rm-cluster { display: inline-block; white-space: pre;
+  margin-left: var(--bx, 0em); margin-right: calc(var(--aw, 0em) - var(--bx, 0em)); }
+.rm-marks { display: inline-block; width: 0; }
+.rm-mark { display: inline-block; width: 0; white-space: pre; color: inherit;
+  --mx: 0em; --my: 0em; transform: translate(var(--mx), var(--my)); }
 .rm-mark.red { color: var(--mark-red); }
-/* M2  breathing + acute/grave: SIDE BY SIDE, breathing left (ἄ, ἂ, ὕ). The
-   font straddles the vowel's centre asymmetrically -- the breathing sits
-   further out than the accent -- because the two glyphs are different widths. */
-.rm-marks.pair .rm-mark.left  { --mx: -0.11em; }
-.rm-marks.pair .rm-mark.right { --mx: 0.05em; }
-/* M3  breathing + circumflex: STACKED, breathing below, circumflex above
-   (ἆ in ἆποστολος, ἦ in ἦν). Both stay centred; only the lift changes. */
-.rm-marks.stack .rm-mark.lower { --my: 0em; }
-.rm-marks.stack .rm-mark.upper { --my: -0.224em; }
-/* M4  diaeresis + accent: the accent goes ABOVE the dots, centred (ΐ in
-   Ἀχαΐα). The dots are shorter than a breathing, so the lift is smaller than
-   M3's; the font's own dieresistonos would set the accent beside the dots
-   instead, which is not what this chapter teaches. */
-.rm-marks.diaeresis .rm-mark.lower { --my: 0em; }
-.rm-marks.diaeresis .rm-mark.upper { --my: -0.16em; }
-/* M5  capitals carry the mark set at the UPPER LEFT of (before) the letter,
-   not above it (Ἀ, Ἠ, Ἐ) -- so these anchor on the base's LEFT EDGE, not its
-   centre, and drop 0.075em to sit at cap height. A pair keeps M2's 0.16em
-   spread, just moved out in front of the letter. */
-.rm-marks.capital .rm-mark { left: 0; --mx: 0.06em; --my: 0.075em;
+/* U+0385 draws its tonos BETWEEN the dialytika dots in one outline, with the
+   dots further apart than U+00A8's and the accent narrower than U+0384's, so
+   it cannot be rebuilt from the standalone glyphs. Its three ink pieces are
+   horizontally disjoint, so the overlay prints the fused glyph three times and
+   clips each copy to one vertical band (inline clip-path, from the generated
+   table). What gets painted is the printed glyph itself, in two colours. */
+
+/* LEGACY FALLBACK: a mark stack with no precomposed codepoint has no composite
+   to read, so it keeps SPEC3's approximate rule table. greek.js records every
+   cluster that lands here in markGeometryFallbacks, and
+   scripts/check-content-shapes.mjs fails the build if shipped data reaches it. */
+.rm-cluster.legacy { position: relative; margin: 0; }
+.legacy .rm-marks { position: absolute; left: 0; right: 0; bottom: 0; height: 0;
+  width: auto; pointer-events: none; }
+.legacy .rm-mark { position: absolute; left: 50%; bottom: 0; display: block;
+  width: auto; line-height: 1.15;
+  transform: translate(calc(-50% + var(--mx)), var(--my)); }
+.legacy .rm-marks.pair .rm-mark.left  { --mx: -0.11em; }
+.legacy .rm-marks.pair .rm-mark.right { --mx: 0.05em; }
+.legacy .rm-marks.stack .rm-mark.lower { --my: 0em; }
+.legacy .rm-marks.stack .rm-mark.upper { --my: -0.224em; }
+.legacy .rm-marks.diaeresis .rm-mark.lower { --my: 0em; }
+.legacy .rm-marks.diaeresis .rm-mark.upper { --my: -0.16em; }
+.legacy .rm-marks.capital .rm-mark { left: 0; --mx: 0.06em; --my: 0.075em;
   transform: translate(calc(-100% + var(--mx)), var(--my)); }
-.rm-marks.capital.pair .rm-mark.left  { --mx: -0.10em; }
-.rm-marks.capital.pair .rm-mark.right { --mx: 0.06em; }
-.rm-marks.capital.stack .rm-mark.upper,
-.rm-marks.capital.diaeresis .rm-mark.upper { --my: -0.149em; }
-/* M6  iota subscript is never overlaid: it stays in the base string, so ᾧ
-   keeps its subscript while the circumflex is lifted. Nothing to declare. */
+.legacy .rm-marks.capital.pair .rm-mark.left  { --mx: -0.10em; }
+.legacy .rm-marks.capital.pair .rm-mark.right { --mx: 0.06em; }
+.legacy .rm-marks.capital.stack .rm-mark.upper,
+.legacy .rm-marks.capital.diaeresis .rm-mark.upper { --my: -0.149em; }
 /* Revealed after a one-attempt item is finalized: the gloss and, for the
    Accent Rule drill, the properly accented form. */
 .reveal-row { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: center;
@@ -561,40 +566,33 @@ button { font: inherit; cursor: pointer; }
   padding: 10px; border-radius: 8px; background: white; }
 .exercise-answer > span:first-child { color: var(--teal-dark); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
 .exercise-answer .greek { font-size: 1.45rem; }
-/* C2: numbered buttons ABOVE the letters, each with an arrow pointing down
-   into its gap, exactly as the original. The rail is measured (see the probe
-   in DivideActivity) and each word is fitted to it, so every word fills the
-   width and its gap buttons grow with it (D2). */
-/* Off-screen, NOT visibility:hidden: an invisible probe was not being
-   re-laid-out when the bundled Greek font swapped in, so its measured width
-   stayed at the fallback face's metrics. Parked far off-canvas instead, where
-   it lays out and reflows like any painted text. */
-.divide-probe { position: absolute; white-space: nowrap; pointer-events: none;
-  left: -9999px; top: 0; }
+/* ---- SYLLABLE DIVISION (5B-SPEC4 C) ----
+   No boxes, no arrows, no numbers: the word IS the control. A tap drops a
+   divider in the nearest lane between two letters and drags it.
+   Off-screen probes, NOT visibility:hidden: an invisible probe is not reliably
+   re-laid-out when the bundled Greek font swaps in, so its measured width
+   stays at the fallback face's metrics. Parked far off-canvas instead, where
+   they lay out and reflow like any painted text. Every word is probed, because
+   the longest one sets the type size for the whole pool. */
+.divide-probes { position: absolute; white-space: nowrap; pointer-events: none;
+  left: -9999px; top: 0; display: flex; }
 .divide-rail { width: 100%; min-width: 0; }
-.divide-word { display: flex; align-items: flex-end; justify-content: center; width: 100%; min-width: 0;
-  padding: 14px 0 10px; white-space: nowrap; }
-.divide-letter { flex: 0 0 auto; min-width: 0; border: none; background: transparent; padding: 0;
-  font-size: var(--divide-size); line-height: 1.1; color: var(--ink); }
-.divide-letter.greek-say { display: inline-block; color: var(--link); text-align: center; }
-/* D2: the numbered button IS the tap target, and it takes the whole gap
-   column, label sized off the column width -- so a wider column means a
-   genuinely bigger button, not a bigger gap around the same small chip.
-   No meaningful min-width here: DivideActivity fits the row to the rail and
-   owns the gap width. A CSS floor re-widened the gaps after that fit and
-   pushed the longest words past the rail, where overflow-x:hidden ate them. */
-.divide-gap { flex: 0 0 var(--gap-size); width: var(--gap-size); min-width: 11px;
-  display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 3px;
-  border: none; background: transparent; color: #9a927c; padding: 0; }
-.divide-gap .gap-num { display: block; width: 100%; border: 1.5px solid #cfc6aa; border-radius: 8px;
-  background: #fffdf3; color: var(--ink); font-weight: 700;
-  font-size: calc(var(--gap-size) * 0.46); line-height: 1.8; }
-.divide-gap .gap-arrow { display: block; height: calc(var(--divide-size) * 0.9); width: 100%; }
-.divide-gap.selected { color: var(--link); }
-.divide-gap.selected .gap-num { border-color: var(--link); background: #e8f0fb; color: var(--link); }
-.divide-gap.correct { color: var(--ok); }
-.divide-gap.correct .gap-num { border-color: var(--ok); background: #e6f2e6; color: var(--ok); }
-.divide-gap.locked { opacity: 0.35; }
+/* touch-action: none is load-bearing -- without it a drag along the word
+   scrolls the page instead of moving the divider. */
+.divide-word { position: relative; display: flex; align-items: flex-end; justify-content: center;
+  width: 100%; min-width: 0; padding: 16px 0 12px; white-space: nowrap;
+  gap: var(--letter-gap); touch-action: none; cursor: pointer; outline: none; }
+.divide-word:focus-visible { outline: 2px solid var(--link); outline-offset: 4px; border-radius: 8px; }
+/* INK, not the tappable blue: a tap here places a divider, it does not play
+   audio (Pronounce does). Blue in this row means "divider". */
+.divide-letter { flex: 0 0 auto; min-width: 0; font-size: var(--divide-size);
+  line-height: 1.1; color: var(--ink); pointer-events: none; }
+.divide-cursor { position: absolute; top: 4px; bottom: 5px; width: 3px; margin-left: -1.5px;
+  border-radius: 2px; background: var(--link); pointer-events: none; }
+.divide-cursor.dragging { width: 5px; margin-left: -2.5px; }
+.divide-cursor.correct { background: var(--ok); }
+.divide-cursor.wrong { background: var(--mark-red); }
+.divide-word.answered { cursor: default; }
 /* 2c: the original's full-width "only one syllable" bar under the word. */
 .one-syllable-bar { display: block; width: 100%; margin: 4px 0 2px; padding: 11px 10px;
   border: 2px solid #d8d0b8; border-radius: 10px; background: white; color: var(--ink);
@@ -671,7 +669,7 @@ button, a, input, select, textarea, label,
 .tile, .tk-key, .chip, .act-row, .menu-item, .eq-cell, .diph-tile, .diph-ex,
 .rv-greek, .lm-row, .rc-defrow, .rc-example, .greek-chip, .greek-tap,
 .seg, .flash-hidden, .icon-btn, .bb-item, .section-head, .collapse-head,
-.rc-expander summary, .divide-letter, .divide-gap, .accent-slot,
+.rc-expander summary, .accent-slot,
 .one-syllable-bar {
   touch-action: manipulation;
 }
diff --git a/src/assets/fonts/NOTICE.md b/src/assets/fonts/NOTICE.md
index 969ea40..66ac0f0 100644
--- a/src/assets/fonts/NOTICE.md
+++ b/src/assets/fonts/NOTICE.md
@@ -28,5 +28,22 @@ Rebuild with:
 
     pip install fonttools brotli
     python3 scripts/make-greek-font.py NotoSerif[wdth,wght].ttf
+    python3 scripts/make-mark-geometry.py
 
 The source file is Google Fonts' `ofl/notoserif/NotoSerif[wdth,wght].ttf`.
+
+## The second step is not optional
+
+`src/lib/mark-geometry.json` is DERIVED FROM THIS FONT FILE. The red-mark
+drills draw one diacritic in a different colour, which cannot be done in place
+(the browser shapes across the inline boundary and paints the mark with the
+base run's colour), so the cluster is rendered without its marks and the marks
+are drawn over it. Where they go comes from this font's own composite glyph
+offsets — the acute sits at +0.205em over alpha, +0.334em over omega, −0.028em
+over iota — read out by `scripts/make-mark-geometry.py` (5B-SPEC4 B; SPEC3's
+six-rule approximation is what VERIFY3 caught riding low and off-centre).
+
+Change the font without regenerating the table and every manually placed mark
+in chapters 2+ drifts, quietly and only by a hair. Regenerate in the same
+commit. `npm run check:shapes` fails the build if a reddened cluster has no
+row in the table, but it cannot tell a stale row from a fresh one.
diff --git a/src/components/DivideActivity.svelte b/src/components/DivideActivity.svelte
index 336cd50..dc4c191 100644
--- a/src/components/DivideActivity.svelte
+++ b/src/components/DivideActivity.svelte
@@ -1,17 +1,33 @@
 <script>
-  // Syllable Division Exercise: tap the numbered gaps between letters where
-  // the word breaks into syllables, then Check Answer.
+  // Syllable Division Exercise.
   //
-  // LAYOUT (5B-SPEC2 C2) follows the original: a numbered BUTTON above each
-  // gap with an arrow pointing down into the space between the two letters.
-  // Sizing is per-word and measured (5B-SPEC3 D2): each word is fitted to the
-  // rail so its letters and its gap buttons are as large as that word allows.
+  // REBUILT IN 5B-SPEC4 C. Through SPEC3 this was the original's numbered
+  // buttons-and-arrows above each gap; VERIFY3 struck that whole thread out and
+  // replaced it: "Fuck it, I'm completely re-imagining this exercise." The word
+  // is now the only control. Tap it to drop a DIVIDER at the nearest place
+  // between two letters and drag it; tap somewhere else to drop another; tap
+  // where one already is to move that one instead. Clear Answer wipes them.
+  //
+  // Three things follow from that and are easy to undo by accident:
+  //   * ONE TYPE SIZE for the whole pool (C1). The longest word sets it and
+  //     every other word matches, so stepping through the pool never resizes
+  //     the type. SPEC2 did this, SPEC3 reversed it to per-word, VERIFY3
+  //     reverses it back and is the last word.
+  //   * THE WORD IS NOT AN AUDIO TAP any more. It cannot be: a tap on it places
+  //     a divider. It therefore renders in INK, not the tappable blue, and
+  //     Pronounce / Pronounce Each are the audio path. This is a standing
+  //     exception to directive 9, alongside Phonetic Reading and the speller.
+  //   * CLEAR ANSWER RE-OPENS A FINISHED ITEM, which attemptsPerItem: 1
+  //     otherwise forbids. VERIFY3 asks for it by name ("upon revisiting a
+  //     previously answered word, all cursors and answer texts should
+  //     disappear and let the user try that word again"). Score history
+  //     already spent is not rewound.
   //
   // ANSWER POLICY (5B patch 2a): answerPolicy.attemptsPerItem === 1 means
   // Check Answer finalizes the item right or wrong, reveals the hyphen-joined
   // divided form, and auto-advances after autoAdvanceMs. The timer is cancelled
-  // on manual Previous/Next and on unmount. Completion = all items ATTEMPTED.
-  import { afterUpdate, onDestroy, onMount } from 'svelte';
+  // on manual Previous/Next, on Clear Answer and on unmount.
+  import { afterUpdate, onDestroy, onMount, tick } from 'svelte';
   import { play } from '../lib/audio.js';
   import { randomFeedback, resolveHintBlocks } from '../lib/content.js';
   import { dividedForm, splitGraphemes } from '../lib/greek.js';
@@ -23,7 +39,7 @@
 
   const items = activity.items || [];
   let itemIndex = 0;
-  let selected = new Set();
+  let dividers = new Set();      // 1-based gap indices, same contract as division[]
   let oneSyllable = false;
   let attempts = 0;
   let correct = 0;
@@ -32,114 +48,180 @@
   let answered = false;
   let showAnswer = false;
   let showHint = false;
-  // D1: hidden until the first Score press; ui.liveScore governs whether the
-  // revealed line keeps updating, not whether it starts open.
+  // D1 (SPEC3): hidden until the first Score press; ui.liveScore governs whether
+  // the revealed line keeps updating, not whether it starts open.
   let showScore = false;
   let pronounceEach = activity.ui?.defaults?.pronounceEach ?? false;
   let advanceTimer = null;
   const attemptedItems = new Set();
   const results = new Map();
 
-  // Fat-finger sizing (C2, reworked by 5B-SPEC3 D2). The row is measured, not
-  // guessed: a hidden probe renders the word at a reference size, so the
-  // glyphs' real advance widths -- not a character count -- decide how large
-  // the letters can be, and `railWidth` re-measures at every breakpoint.
-  //
-  // D2 changes two things. The gap column is 0.68 of the letter size (was
-  // 0.34), so a gap BUTTON is about twice as wide; and the measurement now
-  // follows the CURRENT word rather than the pool's longest, per the spec's
-  // "the gap buttons scale with the word ... filling available width". C2 sized
-  // the whole pool by its longest word so stepping never resized the row; that
-  // bought visual stability at the cost of leaving a three-letter word using a
-  // third of the screen, which is exactly what VERIFY2 item 3 objected to.
-  // Tap targets win: ἐγώ now fills the rail, and φαρισαῖος -- 9 clusters and 8
-  // gaps in 330px -- is the arithmetic floor, not a sizing choice.
+  // ---- SIZING (C1): one size, set by the longest word in the pool ----
+  // Measured, not guessed: a hidden probe renders every word at a reference
+  // size so real glyph advances -- not a character count -- decide how large
+  // the type can be. bind:clientWidth is NOT used: it reports once, while
+  // font-display:block still has the row in the fallback face, and never
+  // reports the reflow when the bundled Greek font swaps in (SPEC3 finding 3).
   const PROBE_PX = 100;
-  const GAP_RATIO = 0.68;          // gap column as a share of the letter size
-  const MAX_LETTER_PX = 76;        // stop growing on tablet widths
-  const MIN_GAP_PX = 22;           // preferred floor for a gap button
-  const MIN_LETTER_PX = 20;        // below this the word stops being readable
+  const LETTER_GAP_EM = 0.12;   // lane for the divider, in em of the letter size
+  const MAX_LETTER_PX = 84;
+  const MIN_LETTER_PX = 20;
   let railWidth = 0;
-  let probeEl;
-  let probeWidth = 0;
+  let probeEls = [];
+  let probeWidths = [];
   let fontEpoch = 0;
-  // The probe is measured by hand, NOT with bind:clientWidth. That binding
-  // reported the width once, while font-display:block still had the row laid
-  // out in the fallback face, and never reported the reflow when the bundled
-  // Greek font swapped in -- so every row was sized from metrics ~15% too
-  // narrow and the longest words silently clipped (overflow-x is hidden
-  // app-wide, so nothing errors and nothing scrolls). Two mechanisms cover it:
-  // afterUpdate for the render-ordering case (a fresh item's letters reach the
-  // DOM before its probe has been remeasured), and the ResizeObserver in
-  // onMount for the font swap. The guard stops the re-render loop after one
-  // pass.
-  afterUpdate(() => {
-    if (!probeEl) return;
-    const width = probeEl.getBoundingClientRect().width;
-    if (Math.abs(width - probeWidth) > 0.5) probeWidth = width;
-  });
-  $: letterCount = letters.length;
-  // fontEpoch is a dependency, not an input: bumping it when document.fonts
-  // settles forces one more render, and afterUpdate above then re-measures the
-  // probe against the face that actually shipped.
-  $: sizing = fitRow(railWidth, probeWidth, letterCount, fontEpoch);
-  $: letterSize = sizing.letter;
-  $: gapSize = sizing.gap;
+
+  $: itemLetters = items.map(item => splitGraphemes(item && item.greek));
+  $: letters = itemLetters[itemIndex] || [];
+  $: letterSize = fitPool(railWidth, probeWidths, itemLetters, fontEpoch);
+  $: letterGap = letterSize * LETTER_GAP_EM;
 
   // The row must always FIT: overflow-x is hidden app-wide, so a row that is
-  // too wide is not scrollable, it is deleted. So the gap floor is a
-  // preference, not a guarantee -- a nine-cluster word at 320px cannot have
-  // both 22px targets and readable letters, and the letters win at that point.
-  function fitRow(rail, probe, count) {   // fontEpoch is a trigger only
-    const gaps = Math.max(count - 1, 0);
-    if (!(rail > 0 && probe > 0 && count > 0)) return { letter: 24, gap: MIN_GAP_PX };
-    const ratio = probe / PROBE_PX;
+  // too wide is not scrollable, it is deleted.
+  function fitPool(rail, widths, clusters) {   // fontEpoch is a trigger only
+    if (!(rail > 0) || !widths.length) return 28;
+    let worst = 0;
+    for (let i = 0; i < clusters.length; i++) {
+      const width = widths[i] || 0;
+      if (!width) continue;
+      worst = Math.max(worst, width / PROBE_PX + Math.max(clusters[i].length - 1, 0) * LETTER_GAP_EM);
+    }
+    if (!worst) return 28;
     // Budget slightly under the rail: per-glyph rounding accumulates across a
     // long word, and being 2px over means 2px CLIPPED, not 2px scrolled.
-    rail = rail * 0.98;
-    let letter = Math.min(MAX_LETTER_PX, rail / (ratio + GAP_RATIO * gaps));
-    let gap = letter * GAP_RATIO;
-    if (gap < MIN_GAP_PX && gaps > 0) {
-      // Buy the floor back out of the letters, but only while they stay legible.
-      const shrunk = (rail - MIN_GAP_PX * gaps) / ratio;
-      if (shrunk >= MIN_LETTER_PX) { letter = shrunk; gap = MIN_GAP_PX; }
+    return Math.max(MIN_LETTER_PX, Math.min(MAX_LETTER_PX, (rail * 0.97) / worst));
+  }
+
+  // ---- DIVIDER GEOMETRY ----
+  // gapCentres[g] is the x of the lane between letter g and letter g+1,
+  // relative to the word element. Read from the laid-out letters rather than
+  // computed, so letter-spacing, kerning and the font swap are all accounted
+  // for by the browser.
+  let wordEl;
+  let letterEls = [];
+  let gapCentres = [];
+  let dragging = null;          // gap index being dragged, or null
+  let dragPointer = null;
+
+  function measureGaps() {
+    if (!wordEl) return;
+    const origin = wordEl.getBoundingClientRect().left;
+    const next = [];
+    for (let i = 1; i < letters.length; i++) {
+      const before = letterEls[i - 1];
+      const after = letterEls[i];
+      if (!before || !after) return;
+      next[i] = (before.getBoundingClientRect().right + after.getBoundingClientRect().left) / 2 - origin;
+    }
+    if (next.length !== gapCentres.length || next.some((x, i) => Math.abs(x - gapCentres[i]) > 0.5)) {
+      gapCentres = next;
+    }
+  }
+  afterUpdate(() => {
+    for (let i = 0; i < probeEls.length; i++) {
+      if (!probeEls[i]) continue;
+      const width = probeEls[i].getBoundingClientRect().width;
+      if (Math.abs(width - (probeWidths[i] || 0)) > 0.5) probeWidths[i] = width;
+    }
+    probeWidths = probeWidths;
+    measureGaps();
+  });
+
+  function nearestGap(clientX) {
+    if (!wordEl || gapCentres.length < 2) return null;
+    const x = clientX - wordEl.getBoundingClientRect().left;
+    let best = null;
+    let bestDistance = Infinity;
+    for (let i = 1; i < gapCentres.length; i++) {
+      const distance = Math.abs(x - gapCentres[i]);
+      if (distance < bestDistance) { bestDistance = distance; best = i; }
+    }
+    return best;
+  }
+
+  // A little bump per letter crossed. Android honours it; iOS Safari has no
+  // Vibration API at all, so this must be a no-op there rather than a throw.
+  function bump() {
+    try { navigator.vibrate && navigator.vibrate(8); } catch { /* no haptics */ }
+  }
+
+  function onPointerDown(event) {
+    if (answered || pending) return;
+    const gap = nearestGap(event.clientX);
+    if (gap == null) return;
+    event.preventDefault();
+    oneSyllable = false;
+    feedback = '';
+    // Landing on an existing divider grabs it; anywhere else creates one.
+    if (!dividers.has(gap)) {
+      dividers = new Set(dividers).add(gap);
+      bump();
     }
-    return { letter: Math.max(MIN_LETTER_PX, letter), gap: Math.max(11, gap) };
+    dragging = gap;
+    dragPointer = event.pointerId;
+    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* not captureable */ }
+  }
+
+  function onPointerMove(event) {
+    if (dragging == null || event.pointerId !== dragPointer) return;
+    const gap = nearestGap(event.clientX);
+    // An occupied lane is not a drop target: two dividers in one place would
+    // silently become one and the learner would not know which they lost.
+    if (gap == null || gap === dragging || dividers.has(gap)) return;
+    const next = new Set(dividers);
+    next.delete(dragging);
+    next.add(gap);
+    dividers = next;
+    dragging = gap;
+    bump();
+  }
+
+  function endDrag(event) {
+    if (event && dragPointer != null && event.pointerId !== dragPointer) return;
+    dragging = null;
+    dragPointer = null;
+  }
+
+  // ---- KEYBOARD (the word is a control, so it needs one) ----
+  let focusGap = 1;
+  function onKeyDown(event) {
+    if (answered || pending || letters.length < 2) return;
+    const last = letters.length - 1;
+    if (event.key === 'ArrowRight') { focusGap = Math.min(last, focusGap + 1); }
+    else if (event.key === 'ArrowLeft') { focusGap = Math.max(1, focusGap - 1); }
+    else if (event.key === ' ' || event.key === 'Enter') {
+      const next = new Set(dividers);
+      if (next.has(focusGap)) next.delete(focusGap); else next.add(focusGap);
+      dividers = next;
+      oneSyllable = false;
+      feedback = '';
+    } else return;
+    event.preventDefault();
   }
 
   $: item = items[itemIndex] || null;
-  $: letters = splitGraphemes(item && item.greek);
   $: pending = !item || !item.greek || !Array.isArray(item.division);
   $: hintBlocks = resolveHintBlocks(chapter, activity.hint);
   $: oneAttempt = activity.answerPolicy?.attemptsPerItem === 1;
   $: autoAdvanceMs = activity.answerPolicy?.autoAdvanceMs ?? 900;
   $: revealed = answered && oneAttempt;
+  $: answerGaps = new Set((!pending && item.division) || []);
   // Live score (C3): reactive, so the line follows every answer instead of
   // freezing at whatever it said when the box was opened.
   $: scoreLine = scoreText(attempts, correct);
 
-  function toggleGap(gap) {
-    if (answered) return;
-    oneSyllable = false;
-    const next = new Set(selected);
-    if (next.has(gap)) next.delete(gap);
-    else next.add(gap);
-    selected = next;
-    feedback = '';
-  }
-
-  // 2c: the one-syllable bar clears and locks the gap selections; the answer
-  // it submits is the empty division (kai is the pool's only one-syllable word).
+  // The one-syllable bar clears and locks the divider lane; the answer it
+  // submits is the empty division (kai is the pool's only one-syllable word).
   function toggleOneSyllable() {
     if (answered) return;
     oneSyllable = !oneSyllable;
-    if (oneSyllable) selected = new Set();
+    if (oneSyllable) dividers = new Set();
     feedback = '';
   }
 
   function sameGaps(answer) {
-    if (selected.size !== answer.length) return false;
-    return answer.every(gap => selected.has(gap));
+    if (dividers.size !== answer.length) return false;
+    return answer.every(gap => dividers.has(gap));
   }
 
   function check() {
@@ -152,9 +234,10 @@
     feedbackKind = right ? 'ok' : 'bad';
     if (right || oneAttempt) {
       answered = true;
+      endDrag();
       if (attemptedItems.size === items.length) markCompleted(activity.id);
       results.set(itemIndex, {
-        selected: [...selected],
+        dividers: [...dividers],
         oneSyllable,
         feedback,
         feedbackKind,
@@ -165,20 +248,31 @@
     }
   }
 
-  // Under attemptsPerItem: 1 a finalized item stays finalized on revisit --
-  // reopening it would let a wrong answer be retried and re-count attempts.
-  // showAnswer stays user-controlled; the reveal is derived from `revealed`.
+  // C4. Wipes the dividers AND the finalized result, so a word already answered
+  // can be tried again on a revisit -- the one place attemptsPerItem: 1 gives
+  // way. Attempts already counted stay counted.
+  function clearAnswer() {
+    clearTimeout(advanceTimer);
+    endDrag();
+    results.delete(itemIndex);
+    dividers = new Set();
+    oneSyllable = false;
+    feedback = '';
+    feedbackKind = '';
+    answered = false;
+  }
+
   function restoreItem() {
     const result = results.get(itemIndex);
     if (result) {
-      selected = new Set(result.selected);
+      dividers = new Set(result.dividers);
       oneSyllable = result.oneSyllable;
       feedback = result.feedback;
       feedbackKind = result.feedbackKind;
       answered = true;
       return;
     }
-    selected = new Set();
+    dividers = new Set();
     oneSyllable = false;
     feedback = '';
     feedbackKind = '';
@@ -188,9 +282,12 @@
 
   function move(delta) {
     clearTimeout(advanceTimer);
+    endDrag();
     const nextIndex = Math.max(0, Math.min(items.length - 1, itemIndex + delta));
     if (nextIndex === itemIndex) return;
     itemIndex = nextIndex;
+    focusGap = 1;
+    gapCentres = [];
     restoreItem();
     const nextItem = items[itemIndex];
     if (pronounceEach && nextItem && nextItem.audio) play(nextItem.audio);
@@ -201,59 +298,69 @@
     return `${c} correct out of ${a} attempts (${Math.round((c / a) * 100)}%)`;
   }
 
-  // Answer submitted, so Check Answer is live even with nothing selected once
-  // the one-syllable bar is the answer.
-  $: canCheck = !pending && !answered && (oneSyllable || selected.size > 0);
+  // Answer submitted, so Check Answer is live even with nothing placed once the
+  // one-syllable bar is the answer.
+  $: canCheck = !pending && !answered && (oneSyllable || dividers.size > 0);
+  $: canClear = !pending && (answered || oneSyllable || dividers.size > 0);
 
-  let probeObserver = null;
-  onMount(() => {
+  let observer = null;
+  onMount(async () => {
     if (typeof document !== 'undefined' && document.fonts) {
-      document.fonts.ready.then(() => { fontEpoch += 1; });
+      // The bundled face changes every advance in the row; re-measure once it
+      // has actually arrived rather than trusting the fallback's metrics.
+      document.fonts.ready.then(async () => { fontEpoch += 1; await tick(); measureGaps(); });
     }
-    if (typeof ResizeObserver === 'undefined' || !probeEl) return;
-    probeObserver = new ResizeObserver(() => {
-      probeWidth = probeEl.getBoundingClientRect().width;
-    });
-    probeObserver.observe(probeEl);
+    if (typeof ResizeObserver === 'undefined') return;
+    observer = new ResizeObserver(() => measureGaps());
+    if (wordEl) observer.observe(wordEl);
   });
 
   onDestroy(() => {
     clearTimeout(advanceTimer);
-    if (probeObserver) probeObserver.disconnect();
+    if (observer) observer.disconnect();
   });
 </script>
 
 <div class="card divide-activity">
-  <!-- Off-screen probe: the CURRENT word at a known size. Its measured width is
-       what the live row is scaled from, so the row re-fits on every item. -->
-  <span class="divide-probe greek" style="font-size:{PROBE_PX}px" aria-hidden="true" bind:this={probeEl}>{item ? item.greek : ''}</span>
+  <!-- Off-screen probe: EVERY word at a known size. The widest sets the type
+       size for the whole pool, so stepping never resizes the row (C1). -->
+  <div class="divide-probes" aria-hidden="true">
+    {#each items as probe, index}
+      <span class="greek" style="font-size:{PROBE_PX}px" bind:this={probeEls[index]}>{probe.greek || ''}</span>
+    {/each}
+  </div>
   {#if pending}
     <div class="pending-verification" role="status">Syllable-division word {itemIndex + 1} is pending content verification.</div>
   {:else}
     <div class="divide-rail" bind:clientWidth={railWidth}>
-      <div class="divide-word"
-        style={`--divide-size:${letterSize}px; --gap-size:${gapSize}px`}
-        aria-label="Choose syllable division gaps">
+      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
+      <div class="divide-word greek"
+        class:answered={revealed}
+        bind:this={wordEl}
+        style={`--divide-size:${letterSize}px; --letter-gap:${letterGap}px`}
+        role="application"
+        tabindex={pending ? -1 : 0}
+        aria-label={`Place syllable dividers in ${item.greek}. Arrow keys move, space places.`}
+        on:pointerdown={onPointerDown}
+        on:pointermove={onPointerMove}
+        on:pointerup={endDrag}
+        on:pointercancel={endDrag}
+        on:keydown={onKeyDown}>
         {#each letters as letter, index}
-          {#if item.audio}
-            <button class="divide-letter greek greek-say" aria-label="Pronounce word" on:click={() => play(item.audio)}>{letter}</button>
-          {:else}
-            <span class="divide-letter greek">{letter}</span>
-          {/if}
-          {#if index < letters.length - 1}
-            <button class="divide-gap"
-              class:selected={selected.has(index + 1)}
-              class:correct={revealed && item.division.includes(index + 1)}
-              class:locked={oneSyllable}
-              aria-pressed={selected.has(index + 1)}
-              aria-label={`Divide after letter ${index + 1}`}
-              on:click={() => toggleGap(index + 1)}>
-              <span class="gap-num">{index + 1}</span>
-              <svg class="gap-arrow" viewBox="0 0 12 24" width="12" height="24" aria-hidden="true">
-                <path d="M6 1 V16" stroke="currentColor" stroke-width="2" fill="none" />
-                <path d="M1.5 15 L6 22 L10.5 15 Z" fill="currentColor" />
-              </svg>
-            </button>
+          <span class="divide-letter" bind:this={letterEls[index]}>{letter}</span>
+        {/each}
+        <!-- Dividers ride above the letters in their own layer so a letter's
+             ink never sits on top of one. Correct positions show green after
+             Check Answer, including ones the learner missed; a divider in the
+             wrong lane shows red (C5). -->
+        {#each gapCentres as centre, gap}
+          {#if gap > 0 && (dividers.has(gap) || (revealed && answerGaps.has(gap)))}
+            <span class="divide-cursor"
+              class:correct={revealed && answerGaps.has(gap)}
+              class:wrong={revealed && !answerGaps.has(gap)}
+              class:dragging={dragging === gap}
+              style={`left:${centre}px`}
+              aria-hidden="true"></span>
           {/if}
         {/each}
       </div>
@@ -275,6 +382,7 @@
 
   <div class="controls grouped">
     <button class="btn" disabled={!canCheck} on:click={check}>Check Answer</button>
+    <button class="btn secondary" disabled={!canClear} on:click={clearAnswer}>Clear Answer</button>
     <button class="btn" disabled={!item?.audio} on:click={() => item?.audio && play(item.audio)}>Pronounce</button>
     <button class="btn secondary" disabled={itemIndex <= 0} on:click={() => move(-1)}>Previous</button>
     <button class="btn secondary" disabled={itemIndex >= items.length - 1} on:click={() => move(1)}>Next</button>
diff --git a/src/components/PlaceAccentActivity.svelte b/src/components/PlaceAccentActivity.svelte
index ed02c59..b8a6b90 100644
--- a/src/components/PlaceAccentActivity.svelte
+++ b/src/components/PlaceAccentActivity.svelte
@@ -50,9 +50,16 @@
   $: oneAttempt = activity.answerPolicy?.attemptsPerItem === 1;
   $: autoAdvanceMs = activity.answerPolicy?.autoAdvanceMs ?? 900;
   $: revealed = answered && oneAttempt;
-  // A root identical to the answer form would print the answer above the slots.
-  $: showRootWord = !!(word && word.root)
-    && (!word.answerForm || word.root.normalize('NFC') !== word.answerForm.normalize('NFC'));
+  // ROOT DISPLAY (5B-SPEC4 D2). Every item shows a Greek word in the header --
+  // VERIFY3 item 3 found six that showed only a gloss. Those six are the ones
+  // whose root IS their answer form (the original's ἄνθρωπος item and the five
+  // merged circumflex items), where printing the root prints the accented
+  // answer directly above the unaccented slots. Nathanael's call of three
+  // options: print it with its ACCENT stripped and its breathings kept, so
+  // there is Greek on every item and none of them answers itself.
+  $: rootIdentical = !!(word && word.root && word.answerForm)
+    && word.root.normalize('NFC') === word.answerForm.normalize('NFC');
+  $: rootWord = !word || !word.root ? '' : (rootIdentical ? analyzeAccent(word.root).display : word.root);
   // Live score (C3): reactive so it tracks every answer instead of freezing.
   $: scoreLine = scoreText(attempts, correct);
 
@@ -123,21 +130,19 @@
 </script>
 
 <div class="card accent-activity">
-  <!-- The header exists to show the ROOT an inflected form derives from
-       (Βαπτίζω -> βάπτισαι). On the merged circumflex items the root IS the
-       answer form, so printing it accented would show the learner both the
-       accent type and its position before they choose. Those items show the
-       gloss alone -- which is also what keeps them indistinguishable from the
-       original twenty now that the banner is gone. -->
-  {#if word && (showRootWord || word.rootGloss)}
+  <!-- The header shows the ROOT an inflected form derives from (Βαπτίζω ->
+       βάπτισαι), plus its gloss. Where the root IS the answer form it is
+       printed unaccented (see rootWord above), and the label says so rather
+       than calling an unaccented string a root. -->
+  {#if word && (rootWord || word.rootGloss)}
     <div class="accent-root">
-      <div class="label">{showRootWord ? (activity.ui?.header || 'Root Greek Word') : 'Word Meaning'}</div>
+      <div class="label">{rootIdentical ? 'Greek Word (Unaccented)' : (activity.ui?.header || 'Root Greek Word')}</div>
       <div class="accent-root-line">
         <!-- Inert: word.audio (b_ex2_N) belongs to the inflected answerForm,
              not the root, so tapping the root would play the wrong clip. The
              inflected clip stays reachable via Pronounce Each Exercise. -->
-        {#if showRootWord}<span class="accent-root-word greek">{word.root}</span>{/if}
-        {#if word.rootGloss}<span class="accent-root-gloss">{showRootWord ? `(${word.rootGloss})` : word.rootGloss}</span>{/if}
+        {#if rootWord}<span class="accent-root-word greek">{rootWord}</span>{/if}
+        {#if word.rootGloss}<span class="accent-root-gloss">{rootWord ? `(${word.rootGloss})` : word.rootGloss}</span>{/if}
       </div>
     </div>
   {/if}
diff --git a/src/components/SelectActivity.svelte b/src/components/SelectActivity.svelte
index f72c879..9e5d626 100644
--- a/src/components/SelectActivity.svelte
+++ b/src/components/SelectActivity.svelte
@@ -206,7 +206,13 @@
       <!-- The rendered cluster is base-minus-marks plus positioned mark glyphs,
            which reads as an unaccented word to a screen reader; the label
            restores the real prompt. -->
-      <button class="prompt greek greek-say red-mark" aria-label={current.prompt} disabled={!current.promptAudio} on:click={() => current.promptAudio && play(current.promptAudio)}>{#each redParts as part}{#if part.marks}<span class="rm-cluster"><span class="rm-base">{part.base}</span><span class="rm-marks {part.layout}" class:capital={part.capital} aria-hidden="true">{#each part.marks as mark}<span class="rm-mark {mark.slot}" class:red={mark.red}>{mark.glyph}</span>{/each}</span></span>{:else if part.red}<span class="mark-red">{part.text}</span>{:else}{part.text}{/if}{/each}</button>
+      <!-- The mark spans carry ZERO advance and sit in normal flow BEFORE the
+           base, so the browser puts them on the same baseline at the same pen
+           position the base glyph starts from -- the font's own offsets then
+           place them exactly. Absolute positioning against the cluster box was
+           what made marks ride low: its origin depends on line-height and on
+           which metric the browser picks for the strut. -->
+      <button class="prompt greek greek-say red-mark" aria-label={current.prompt} disabled={!current.promptAudio} on:click={() => current.promptAudio && play(current.promptAudio)}>{#each redParts as part}{#if part.marks}<span class="rm-cluster" class:legacy={part.layout} style={part.bx || part.aw ? `--bx:${part.bx || 0}em; --aw:${part.aw || 0}em` : null}><span class="rm-marks {part.layout || ''}" class:capital={part.capital} aria-hidden="true">{#each part.marks as mark}<span class="rm-mark {mark.slot || ''}" class:red={mark.red} style={mark.x != null ? `--mx:${mark.x}em; --my:${mark.y}em${mark.clip ? `; clip-path:polygon(${mark.clip[0]}em -3em, ${mark.clip[1]}em -3em, ${mark.clip[1]}em 3em, ${mark.clip[0]}em 3em)` : ''}` : null}>{mark.glyph}</span>{/each}</span><span class="rm-base">{part.base}</span></span>{:else if part.red}<span class="mark-red">{part.text}</span>{:else}{part.text}{/if}{/each}</button>
     {:else if promptIsGreek && current.promptAudio}
       <button class="prompt greek greek-say" on:click={() => play(current.promptAudio)}>{current.prompt}</button>
     {:else if current.underline && sentenceParts(current.prompt, current.underline)}
diff --git a/src/lib/greek.js b/src/lib/greek.js
index 76bbf9c..3b0308e 100644
--- a/src/lib/greek.js
+++ b/src/lib/greek.js
@@ -1,6 +1,8 @@
 // Unicode helpers shared by the chapter-2 syllable and accent activities.
 // Work in NFD only while inspecting marks, then return NFC for display.
 
+import MARK_GEOMETRY from './mark-geometry.json';
+
 const ACCENT_MARKS = {
   '\u0301': 'Acute',
   '\u0300': 'Grave',
@@ -142,7 +144,7 @@ export function firstAccentCluster(text) {
   return { index: -1, mark: null };
 }
 
-// ---- MARK GEOMETRY (5B-SPEC3 C, rules M1-M6) ----
+// ---- MARK GEOMETRY (5B-SPEC4 B, replacing SPEC3's rules M1-M6) ----
 //
 // Marking Recognition / Accent Rule ask about ONE mark and draw it red.
 // Colouring the mark INLINE does not work: browsers keep shaping across an
@@ -150,31 +152,43 @@ export function firstAccentCluster(text) {
 // with the BASE run's colour (verified by screenshot in the 5B patch -- the
 // DOM colour was right, the pixels were not). 5B-SPEC2 C5 settled the fix:
 // render the base without the mark and OVERLAY the mark as a free-standing
-// spacing glyph. 5B-SPEC3 C closes the hole that left: mixing an overlaid mark
-// with marks still drawn by the base put two glyphs in one place on every
-// multi-mark cluster (breathing + acute collided on anthropou/adelphos/akouo;
-// circumflex sat on the breathing in apostolos).
+// glyph. SPEC3 added the FULL-OVERLAY rule -- if any mark in a cluster is
+// coloured, ALL of that cluster's marks come off the base, so nothing is ever
+// drawn twice in one place.
+//
+// What SPEC3 got wrong was WHERE. It positioned the overlay from six
+// hand-written CSS rules (single / breathing+accent / breathing+circumflex /
+// diaeresis+accent / capital / iota subscript). The font does not use six
+// rules: it carries a distinct offset pair for each of ~220 precomposed
+// characters, and they differ by base letter as much as by combination -- the
+// acute over alpha sits at +0.205em, over omega at +0.334em, over iota at
+// -0.028em. Six constants averaged across that, which is why VERIFY3 saw marks
+// riding low, sitting right of the iota in kai, and off-centre in a diaeresis
+// while the PRINTED text was always right.
 //
-// FULL-OVERLAY RULE: if any mark in a cluster must be coloured, ALL of that
-// cluster's marks come off the base and the whole set is overlaid -- target in
-// --mark-red, the rest in ink. Nothing is then drawn twice, and the positions
-// come from one table (M1-M6, keyed by `layout` + `slot` below and realised as
-// em offsets in app.css) rather than per-word nudging.
+// So the offsets now come from the font itself: scripts/make-mark-geometry.py
+// reads each precomposed glyph's composite components and writes
+// mark-geometry.json. Rendering the base glyph at the origin and each mark
+// glyph at its recorded offset reproduces the printed character by
+// construction -- which is exactly VERIFY3's instruction, "produce the word
+// with the accent using the actual text, and then move the manually positioned
+// accents to perfectly overlap that".
 //
 // Returns render segments in source order:
 //   { text }                     plain ink run
-//   { base, marks, layout }      the target cluster: base stripped of its marks
-//                                (iota subscript stays -- M6), plus the mark set
-//                                as { glyph, kind, slot, red } in source order
+//   { base, marks, bx, aw }      the target cluster: base stripped of its marks
+//                                (iota subscript stays -- it is part of the base
+//                                glyph), plus the mark set as
+//                                { glyph, x, y, clip, red }, offsets in em from
+//                                the base glyph's origin
 //   { text, red: true }          the whole cluster reddens because it IS the
 //                                mark (apostrophe, colon, question) -- there is
 //                                no base to separate it from
 //
 // A target cluster carrying NO mark at all is an authoring error, not a shape
-// the overlay cannot handle (chapt-02's φαρισαῖος points at cluster 6, a bare
-// alpha, while its circumflex sits on 7). Reddening it would tell the learner
-// the answer is "Circumflex" while the red sits on an unmarked letter, so the
-// cluster renders plain: absent signal beats false signal (XPATCH1).
+// the overlay cannot handle. Reddening it would tell the learner the answer is
+// "Circumflex" while the red sits on an unmarked letter, so the cluster renders
+// plain: absent signal beats false signal (XPATCH1).
 const MARK_KIND = {
   '̓': 'breathing',   // smooth breathing / coronis (U+0343 decomposes here)
   '̔': 'breathing',   // rough breathing
@@ -183,24 +197,24 @@ const MARK_KIND = {
   '͂': 'circumflex',
   '̈': 'diaeresis'
 };
-// Iota subscript is part of the BASE rendering and is never lifted (M6).
+// Iota subscript is part of the BASE rendering and is never lifted.
 const IOTA_SUBSCRIPT = 'ͅ';
 
-// The one place the M1-M5 arrangement is decided. `layout` picks the geometry
-// class; `slot` picks each mark's position within it.
-//   M1 single      -> layout 'single', slot 'only'   (centred; on a diphthong
-//                     the mark already belongs to the SECOND vowel's cluster,
-//                     so "above the second vowel" needs no special case)
-//   M2 breath+acute/grave -> 'pair',  slots 'left' (breathing) / 'right'
-//   M3 breath+circumflex  -> 'stack', slots 'lower' (breathing) / 'upper'
-//   M4 diaeresis+accent   -> 'diaeresis', slots 'lower' (dots) / 'upper'
-//   M5 capital base       -> the same layout, flagged `capital`: the set moves
-//                            to the upper LEFT of the letter instead of above it
+const GEOMETRY = MARK_GEOMETRY.clusters;
+
+// Clusters that had to fall back to the legacy rule table, by NFC form. The
+// build guard (scripts/check-content-shapes.mjs) proves the shipped data never
+// reaches this, but a fallback in the field must be findable rather than a
+// silently slightly-wrong mark.
+export const markGeometryFallbacks = new Set();
+
+// LEGACY fallback only: a combination with no precomposed codepoint (an
+// NFD-only stack) has no font composite to read, so it is arranged by the old
+// M1-M5 classes. Positions are approximate by construction -- that is the
+// point of preferring the table.
 function arrangeMarks(kinds) {
   const has = kind => kinds.includes(kind);
   if (kinds.length < 2) return { layout: 'single', slots: kinds.map(() => 'only') };
-  // M4 is its own case, not a variant of M3: the dots are shorter than a
-  // breathing, so the accent above them needs a different lift.
   const layout = has('diaeresis') ? 'diaeresis'
     : (has('breathing') && has('accent')) ? 'pair'
     : 'stack';
@@ -213,6 +227,18 @@ function arrangeMarks(kinds) {
   };
 }
 
+function legacyCluster(marks, kinds, target) {
+  const { layout, slots } = arrangeMarks(kinds);
+  let reddened = false;
+  return {
+    layout,
+    marks: marks.map((mark, position) => {
+      const red = !reddened && mark === target && (reddened = true);
+      return { glyph: overlayForm(mark), slot: slots[position], red };
+    })
+  };
+}
+
 export function markOverlayParts(text, redIndex, preferredMark) {
   const clusters = splitGraphemes(text);
   const parts = [];
@@ -234,19 +260,32 @@ export function markOverlayParts(text, redIndex, preferredMark) {
       pushText(cluster, !/\p{L}/u.test(cluster));
       return;
     }
+    const nfc = cluster.normalize('NFC');
+    const entry = GEOMETRY[nfc];
+    if (entry) {
+      // Every row whose mark IS the asked-about one reddens. Normally that is
+      // one glyph; for the fused dialytika-tonos outline it is the two clipped
+      // bands that draw the dots, which are one mark drawn in two pieces.
+      parts.push({
+        base: entry.base,
+        bx: entry.bx || 0,
+        aw: entry.aw || 0,
+        marks: entry.marks.map(mark => ({
+          glyph: mark.g, x: mark.x, y: mark.y, clip: mark.clip || null, red: mark.m === target
+        }))
+      });
+      return;
+    }
+    if (!markGeometryFallbacks.has(nfc)) {
+      markGeometryFallbacks.add(nfc);
+      console.warn(`mark-geometry: no font row for "${nfc}" — falling back to the approximate rule table.`);
+    }
     const base = chars.filter(char => !MARK_KIND[char]).join('').normalize('NFC');
     const kinds = marks.map(mark => MARK_KIND[mark]);
-    const { layout, slots } = arrangeMarks(kinds);
-    let reddened = false;
     parts.push({
       base,
-      layout,
       capital: /\p{Lu}/u.test(base.replace(IOTA_SUBSCRIPT, '')),
-      marks: marks.map((mark, position) => {
-        // Exactly one mark is the question, even if the cluster repeats a kind.
-        const red = !reddened && mark === target && (reddened = true);
-        return { glyph: overlayForm(mark), kind: kinds[position], slot: slots[position], red };
-      })
+      ...legacyCluster(marks, kinds, target)
     });
   });
   return parts;
````

### 9.3 New files

`src/lib/mark-geometry.json` is generated, not authored: `python scripts/make-mark-geometry.py` reproduces it byte-for-byte from the bundled font. It is included in full anyway, because it is the round.

````diff
diff --git a/scripts/make-mark-geometry.py b/scripts/make-mark-geometry.py
new file mode 100644
index 0000000..f209e06
--- /dev/null
+++ b/scripts/make-mark-geometry.py
@@ -0,0 +1,294 @@
+#!/usr/bin/env python3
+"""Generate src/lib/mark-geometry.json from the bundled Greek font (5B-SPEC4 B1).
+
+WHY THIS SCRIPT EXISTS. Two chapter-2 drills ask "which mark is red?", which
+means one mark of a cluster has to be coloured. A mark cannot be coloured in
+place: the browser shapes across an inline boundary that differs only in colour
+and paints the mark with the base run's colour. So the cluster is rendered
+WITHOUT its marks and the marks are drawn over it as free-standing spacing
+glyphs -- "manually placed", in the VERIFY3 wording.
+
+Through SPEC3 those overlays were positioned by a hand-written rule table: six
+CSS rows (M1-M6) covering single accent / breathing+accent / breathing+
+circumflex / diaeresis+accent / capitals / iota subscript. VERIFY3's finding is
+that printed text is always right and manual placement is always ALMOST right --
+low by a hair, off-centre in a diaeresis, a touch right of the iota in kai.
+
+The reason is that the font does not use six rules. A precomposed polytonic
+glyph is a COMPOSITE: base component plus one or two mark components, each at an
+offset the type designer chose for that exact pair. There are 239 such
+characters in this font and their offsets genuinely differ by base letter and by
+combination -- alpha takes its tonos at x=205, iota's dialytika-tonos sits at
+x=-204, a capital lowers its breathing by 70-82 units and may shift the base
+right to make room. Six constants cannot express 239 positions.
+
+So this script reads the offsets straight out of the font. Each row of the
+output is the type designer's own answer for that character, which makes the
+overlay reproduce the printed form by construction rather than by adjustment.
+Nathanael's VERIFY3 instruction, literally: "produce the word with the accent
+using the actual text, and then move the manually positioned accents to
+perfectly overlap that."
+
+    pip install fonttools brotli
+    python3 scripts/make-mark-geometry.py
+
+Re-run whenever scripts/make-greek-font.py re-derives the font; the offsets are
+properties of that file, not of Unicode.
+"""
+
+import json
+import sys
+import unicodedata
+from collections import Counter
+from pathlib import Path
+
+from fontTools.pens.recordingPen import RecordingPen
+from fontTools.ttLib import TTFont
+
+FONT = Path("src/assets/fonts/greektutor-serif-regular.woff2")
+OUT = Path("src/lib/mark-geometry.json")
+
+# The marks this course teaches, and the SPACING codepoint that draws each one
+# on its own. These are the glyphs the overlay prints, so a reddened accent is
+# the same drawing as the one it replaced (Greek text sets its acute from
+# U+0384, not the Latin-1 U+00B4: a visibly different width and slope).
+RENDER = {
+    "̓": "᾿",   # smooth breathing / coronis -> GREEK PSILI
+    "̔": "῾",   # rough breathing            -> GREEK DASIA
+    "́": "΄",   # acute                      -> GREEK TONOS
+    "̀": "`",   # grave                      -> GREEK VARIA
+    "͂": "῀",   # circumflex                 -> GREEK PERISPOMENI
+    "̈": "¨",   # diaeresis                  -> DIAERESIS
+}
+# Component glyphs are identified by whatever codepoint reaches them; several
+# codepoints reach the same drawing (U+1FBD koronis and U+1FBF psili share one
+# glyph). Map every such codepoint onto the combining mark it represents.
+COMPONENT_MARK = {
+    0x1FBD: ["̓"], 0x1FBF: ["̓"],
+    0x1FFE: ["̔"],
+    0x0384: ["́"], 0x00B4: ["́"], 0x1FFD: ["́"],
+    0x1FEF: ["̀"], 0x0060: ["̀"],
+    0x1FC0: ["͂"], 0x02DC: ["͂"],
+    0x00A8: ["̈"],
+    # Fused outlines: one glyph drawing two marks. Split by ink (see below).
+    0x0385: ["̈", "́"], 0x1FEE: ["̈", "́"],
+    0x1FED: ["̈", "̀"],
+}
+IOTA_SUBSCRIPT = "ͅ"
+# Quantity marks (macron, vrachy). Not taught here, and their component glyphs
+# are unencoded in the subset, so they would only show up as unresolved rows.
+SKIP_MARKS = {"̄", "̆"}
+
+
+def flatten(glyf, name, dx=0, dy=0, out=None, depth=0):
+    """Composite glyph -> [(leaf glyph name, x offset, y offset)] in font units."""
+    out = [] if out is None else out
+    glyph = glyf[name]
+    if glyph.isComposite() and depth < 6:
+        for component in glyph.components:
+            flatten(glyf, component.glyphName, dx + component.x, dy + component.y, out, depth + 1)
+    else:
+        out.append((name, dx, dy))
+    return out
+
+
+def ink_boxes(glyph_set, name):
+    """Per-contour ink boxes, largest-height first. The fused dialytika glyphs
+    are single outlines, so the only way to say where their dots end and their
+    accent begins is to read the contours: two short round ones and one tall
+    slanted one."""
+    pen = RecordingPen()
+    glyph_set[name].draw(pen)
+    boxes, points = [], []
+    for op, args in pen.value:
+        if op == "moveTo":
+            points = [args[0]]
+        elif op in ("lineTo", "qCurveTo", "curveTo"):
+            points.extend(point for point in args if point)
+        elif op == "closePath" and points:
+            xs = [p[0] for p in points]
+            ys = [p[1] for p in points]
+            boxes.append((min(xs), min(ys), max(xs), max(ys)))
+            points = []
+    return boxes
+
+
+def union(boxes):
+    return (min(b[0] for b in boxes), min(b[1] for b in boxes),
+            max(b[2] for b in boxes), max(b[3] for b in boxes))
+
+
+def fused_bands(glyph_set, fused_glyph, marks, upem):
+    """A fused mark glyph draws two marks in one outline: U+0385 sets its tonos
+    BETWEEN the dialytika dots (which is exactly the placement VERIFY3 asks for),
+    and U+1FED does the same with a varia. It cannot be rebuilt out of the
+    standalone glyphs -- its dots sit further apart than U+00A8's and its accent
+    is drawn narrower than U+0384's -- so the drill would have nothing to redden
+    one half of.
+
+    The way out is that its three ink pieces are horizontally DISJOINT
+    (dot | accent | dot). So the overlay prints the fused glyph three times at
+    the same offset and clips each copy to one vertical band; each band is then
+    coloured on its own. What gets painted is the printed glyph itself, in two
+    colours, which is as exact as this can be. Bands are cut midway between
+    neighbouring ink pieces and returned as em offsets from the glyph's origin.
+    """
+    boxes = ink_boxes(glyph_set, fused_glyph)
+    if len(boxes) != 3:
+        raise SystemExit(f"fused glyph {fused_glyph}: expected 3 contours, got {len(boxes)}")
+    boxes.sort(key=lambda box: box[0])
+    tall = max(range(3), key=lambda i: boxes[i][3] - boxes[i][1])
+    if tall != 1:
+        raise SystemExit(f"fused glyph {fused_glyph}: accent is piece {tall}, expected the middle one")
+    cuts = [(boxes[i][2] + boxes[i + 1][0]) / 2 for i in (0, 1)]
+    # marks[0] is the diaeresis, marks[1] the accent (COMPONENT_MARK order).
+    edges = [-upem, cuts[0], cuts[1], 2 * upem]
+    order = [marks[0], marks[1], marks[0]]
+    return [(mark, round(edges[i] / upem, 4), round(edges[i + 1] / upem, 4))
+            for i, mark in enumerate(order)]
+
+
+def main():
+    if not FONT.exists():
+        sys.exit(f"{FONT} not found — run scripts/make-greek-font.py first.")
+    font = TTFont(FONT)
+    upem = font["head"].unitsPerEm
+    cmap = font.getBestCmap()
+    glyf = font["glyf"]
+    hmtx = font["hmtx"]
+    glyph_set = font.getGlyphSet()
+
+    # A component glyph carries no codepoint of its own; resolve it through any
+    # encoded glyph that draws exactly it and nothing else (the perispomeni
+    # component is `glyph00200`, reached by U+1FC0 as a one-component composite).
+    alias = {}
+    for cp, name in sorted(cmap.items()):
+        parts = flatten(glyf, name)
+        if len(parts) == 1 and parts[0][1] == 0 and parts[0][2] == 0:
+            alias.setdefault(parts[0][0], cp)
+
+    clusters = {}
+    unresolved, skipped = Counter(), Counter()
+    em = lambda units: round(units / upem, 4)
+
+    for cp in list(range(0x0370, 0x0400)) + list(range(0x1F00, 0x2000)):
+        char = chr(cp)
+        if unicodedata.category(char)[0] != "L":
+            continue
+        nfd = unicodedata.normalize("NFD", char)
+        marks = [c for c in nfd[1:] if c != IOTA_SUBSCRIPT]
+        if not marks:
+            continue
+        if any(m in SKIP_MARKS for m in marks):
+            skipped[nfd[1:]] += 1
+            continue
+        if cp not in cmap:
+            unresolved[f"U+{cp:04X} not in cmap"] += 1
+            continue
+
+        # The base is the letter plus its iota subscript: M6 keeps the subscript
+        # in the base string, so it must be in the base GLYPH too or its
+        # component would be mistaken for an overlay mark.
+        base_str = unicodedata.normalize("NFC", nfd[0] + (IOTA_SUBSCRIPT if IOTA_SUBSCRIPT in nfd else ""))
+        if len(base_str) != 1 or ord(base_str) not in cmap:
+            unresolved[f"U+{cp:04X} base {base_str!r} unmapped"] += 1
+            continue
+
+        parts = flatten(glyf, cmap[cp])
+        base_parts = flatten(glyf, cmap[ord(base_str)])
+        # Locate the base INSIDE the composite. It is not always at the origin:
+        # capitals shift the letter right to make room for a mark in front of it
+        # (U+1F18 is E at +119 with the psili at -40), and every offset we emit
+        # has to be relative to where the base actually lands.
+        anchor = None
+        for name, dx, dy in parts:
+            if name != base_parts[0][0]:
+                continue
+            bx, by = dx - base_parts[0][1], dy - base_parts[0][2]
+            if all((n, x + bx, y + by) in parts for n, x, y in base_parts):
+                anchor = (bx, by)
+                break
+        if anchor is None:
+            unresolved[f"U+{cp:04X} base glyph not found in composite"] += 1
+            continue
+        bx, by = anchor
+        rest = list(parts)
+        for name, x, y in base_parts:
+            rest.remove((name, x + bx, y + by))
+
+        rows, failed = [], False
+        for name, dx, dy in rest:
+            cp_alias = alias.get(name)
+            component_marks = COMPONENT_MARK.get(cp_alias) if cp_alias is not None else None
+            if not component_marks:
+                unresolved[f"U+{cp:04X} component {name} (alias {cp_alias and hex(cp_alias)})"] += 1
+                failed = True
+                break
+            # Relative to the base's origin, in em. y flips: font units go up,
+            # CSS translate goes down.
+            offset = {"x": em(dx - bx), "y": em(-(dy - by))}
+            if len(component_marks) == 1:
+                rows.append({"m": component_marks[0], "g": RENDER[component_marks[0]], **offset})
+            else:
+                fused_char = chr(cp_alias)
+                for mark, left, right in fused_bands(glyph_set, name, component_marks, upem):
+                    rows.append({"m": mark, "g": fused_char, **offset, "clip": [left, right]})
+        if failed:
+            continue
+        # A fused glyph contributes more ROWS than marks (three clipped bands
+        # for two marks), so compare the mark SET, not the row count.
+        if sorted(set(row["m"] for row in rows)) != sorted(set(marks)):
+            unresolved[f"U+{cp:04X} produced marks {set(r['m'] for r in rows)}, NFD has {set(marks)}"] += 1
+            continue
+        # Order the emitted rows by NFD order so the runtime can match a
+        # requested mark without caring which order the font stacked them in.
+        # Stable, so a fused glyph's bands keep their left-to-right order.
+        rows.sort(key=lambda row: marks.index(row["m"]) if row["m"] in marks else 99)
+
+        entry = {"base": base_str, "marks": rows}
+        # bx/aw are zero for every lowercase cluster and most capitals; emit
+        # them only where the composite actually shifts its base.
+        if em(bx):
+            entry["bx"] = em(bx)
+        advance = em(hmtx[cmap[cp]][0] - hmtx[cmap[ord(base_str)]][0])
+        if advance:
+            entry["aw"] = advance
+        clusters[char] = entry
+
+    if unresolved:
+        for key, count in unresolved.most_common():
+            print(f"UNRESOLVED: {key} (x{count})", file=sys.stderr)
+        sys.exit(f"{sum(unresolved.values())} unresolved rows — refusing to emit a table with holes.")
+
+    header = {
+        "_generated_by": "scripts/make-mark-geometry.py — do not hand-edit",
+        "_source_font": FONT.name,
+        "_note": (
+            "Per-character mark offsets read out of the bundled font's composite glyphs. "
+            "x/y are em offsets of the mark glyph's origin from the BASE glyph's origin "
+            "(+x right, +y down, CSS sense). bx (default 0) is the base component's own x "
+            "offset inside the composite and aw (default 0) the precomposed advance minus "
+            "the base advance, so an overlay cluster occupies the width the printed "
+            "character would. clip is a vertical band in em, used only where one outline "
+            "draws two marks. Regenerate whenever the font is rebuilt."
+        ),
+        "upem": upem,
+    }
+    # One cluster per line: the file is a review artefact as much as a data file,
+    # and a 221-entry pretty-print is unreadable while a single line is undiffable.
+    def pair(key, value, indent):
+        return f"{indent}{json.dumps(key, ensure_ascii=False)}: " + json.dumps(
+            value, ensure_ascii=False, separators=(",", ":"))
+
+    body = [pair(key, value, " ") for key, value in header.items()]
+    body.append(' "clusters": {\n'
+                + ",\n".join(pair(key, value, "  ") for key, value in clusters.items())
+                + "\n }")
+    OUT.parent.mkdir(parents=True, exist_ok=True)
+    OUT.write_text("{\n" + ",\n".join(body) + "\n}\n", encoding="utf-8")
+    print(f"{OUT}: {len(clusters)} precomposed clusters, {OUT.stat().st_size} bytes"
+          f" (skipped {sum(skipped.values())} macron/vrachy)")
+
+
+if __name__ == "__main__":
+    main()
````

````diff
diff --git a/src/lib/mark-geometry.json b/src/lib/mark-geometry.json
new file mode 100644
index 0000000..f9bea47
--- /dev/null
+++ b/src/lib/mark-geometry.json
@@ -0,0 +1,229 @@
+{
+ "_generated_by": "scripts/make-mark-geometry.py — do not hand-edit",
+ "_source_font": "greektutor-serif-regular.woff2",
+ "_note": "Per-character mark offsets read out of the bundled font's composite glyphs. x/y are em offsets of the mark glyph's origin from the BASE glyph's origin (+x right, +y down, CSS sense). bx (default 0) is the base component's own x offset inside the composite and aw (default 0) the precomposed advance minus the base advance, so an overlay cluster occupies the width the printed character would. clip is a vertical band in em, used only where one outline draws two marks. Regenerate whenever the font is rebuilt.",
+ "upem": 1000,
+ "clusters": {
+  "Ά": {"base":"Α","marks":[{"m":"́","g":"΄","x":0.016,"y":0.082}]},
+  "Έ": {"base":"Ε","marks":[{"m":"́","g":"΄","x":-0.195,"y":0.082}],"bx":0.145,"aw":0.145},
+  "Ή": {"base":"Η","marks":[{"m":"́","g":"΄","x":-0.195,"y":0.082}],"bx":0.145,"aw":0.145},
+  "Ί": {"base":"Ι","marks":[{"m":"́","g":"΄","x":-0.195,"y":0.082}],"bx":0.145,"aw":0.145},
+  "Ό": {"base":"Ο","marks":[{"m":"́","g":"΄","x":-0.129,"y":0.082}]},
+  "Ύ": {"base":"Υ","marks":[{"m":"́","g":"΄","x":-0.23,"y":0.082}],"bx":0.18,"aw":0.18},
+  "Ώ": {"base":"Ω","marks":[{"m":"́","g":"΄","x":-0.143,"y":0.082}]},
+  "ΐ": {"base":"ι","marks":[{"m":"̈","g":"΅","x":-0.194,"y":0.0,"clip":[-1.0,0.267]},{"m":"̈","g":"΅","x":-0.194,"y":0.0,"clip":[0.4165,2.0]},{"m":"́","g":"΅","x":-0.194,"y":0.0,"clip":[0.267,0.4165]}]},
+  "Ϊ": {"base":"Ι","marks":[{"m":"̈","g":"¨","x":-0.107,"y":-0.165}]},
+  "Ϋ": {"base":"Υ","marks":[{"m":"̈","g":"¨","x":0.033,"y":-0.165}]},
+  "ά": {"base":"α","marks":[{"m":"́","g":"΄","x":0.205,"y":0.0}]},
+  "έ": {"base":"ε","marks":[{"m":"́","g":"΄","x":0.208,"y":0.0}]},
+  "ή": {"base":"η","marks":[{"m":"́","g":"΄","x":0.206,"y":0.0}]},
+  "ί": {"base":"ι","marks":[{"m":"́","g":"΄","x":0.058,"y":0.0}]},
+  "ΰ": {"base":"υ","marks":[{"m":"̈","g":"΅","x":-0.067,"y":0.0,"clip":[-1.0,0.267]},{"m":"̈","g":"΅","x":-0.067,"y":0.0,"clip":[0.4165,2.0]},{"m":"́","g":"΅","x":-0.067,"y":0.0,"clip":[0.267,0.4165]}]},
+  "ϊ": {"base":"ι","marks":[{"m":"̈","g":"¨","x":-0.165,"y":0.0}]},
+  "ϋ": {"base":"υ","marks":[{"m":"̈","g":"¨","x":-0.038,"y":0.0}]},
+  "ό": {"base":"ο","marks":[{"m":"́","g":"΄","x":0.224,"y":0.0}]},
+  "ύ": {"base":"υ","marks":[{"m":"́","g":"΄","x":0.185,"y":0.0}]},
+  "ώ": {"base":"ω","marks":[{"m":"́","g":"΄","x":0.334,"y":0.0}]},
+  "ϓ": {"base":"ϒ","marks":[{"m":"́","g":"΄","x":-0.23,"y":0.082}],"bx":0.18,"aw":0.18},
+  "ϔ": {"base":"ϒ","marks":[{"m":"̈","g":"¨","x":0.028,"y":-0.178}]},
+  "ἀ": {"base":"α","marks":[{"m":"̓","g":"᾿","x":0.185,"y":0.0}]},
+  "ἁ": {"base":"α","marks":[{"m":"̔","g":"῾","x":0.15,"y":0.0}]},
+  "ἂ": {"base":"α","marks":[{"m":"̓","g":"᾿","x":0.103,"y":0.0},{"m":"̀","g":"`","x":0.238,"y":0.0}]},
+  "ἃ": {"base":"α","marks":[{"m":"̔","g":"῾","x":0.069,"y":0.0},{"m":"̀","g":"`","x":0.23,"y":0.0}]},
+  "ἄ": {"base":"α","marks":[{"m":"̓","g":"᾿","x":0.119,"y":0.0},{"m":"́","g":"΄","x":0.25,"y":0.0}]},
+  "ἅ": {"base":"α","marks":[{"m":"̔","g":"῾","x":0.069,"y":0.0},{"m":"́","g":"΄","x":0.24,"y":0.0}]},
+  "ἆ": {"base":"α","marks":[{"m":"̓","g":"᾿","x":0.186,"y":-0.006},{"m":"͂","g":"῀","x":0.052,"y":-0.224}]},
+  "ἇ": {"base":"α","marks":[{"m":"̔","g":"῾","x":0.156,"y":-0.006},{"m":"͂","g":"῀","x":0.052,"y":-0.224}]},
+  "Ἀ": {"base":"Α","marks":[{"m":"̓","g":"᾿","x":0.052,"y":0.07}]},
+  "Ἁ": {"base":"Α","marks":[{"m":"̔","g":"῾","x":0.034,"y":0.07}]},
+  "Ἂ": {"base":"Α","marks":[{"m":"̓","g":"᾿","x":-0.12,"y":0.083},{"m":"̀","g":"`","x":0.015,"y":0.083}]},
+  "Ἃ": {"base":"Α","marks":[{"m":"̔","g":"῾","x":-0.146,"y":0.082},{"m":"̀","g":"`","x":0.015,"y":0.082}]},
+  "Ἄ": {"base":"Α","marks":[{"m":"̓","g":"᾿","x":-0.116,"y":0.082},{"m":"́","g":"΄","x":0.015,"y":0.082}]},
+  "Ἅ": {"base":"Α","marks":[{"m":"̔","g":"῾","x":-0.156,"y":0.082},{"m":"́","g":"΄","x":0.015,"y":0.082}]},
+  "Ἆ": {"base":"Α","marks":[{"m":"̓","g":"᾿","x":-0.06,"y":0.226},{"m":"͂","g":"῀","x":-0.194,"y":0.008}]},
+  "Ἇ": {"base":"Α","marks":[{"m":"̔","g":"῾","x":-0.09,"y":0.226},{"m":"͂","g":"῀","x":-0.194,"y":0.008}]},
+  "ἐ": {"base":"ε","marks":[{"m":"̓","g":"᾿","x":0.188,"y":0.0}]},
+  "ἑ": {"base":"ε","marks":[{"m":"̔","g":"῾","x":0.153,"y":0.0}]},
+  "ἒ": {"base":"ε","marks":[{"m":"̓","g":"᾿","x":0.106,"y":0.0},{"m":"̀","g":"`","x":0.241,"y":0.0}]},
+  "ἓ": {"base":"ε","marks":[{"m":"̔","g":"῾","x":0.072,"y":0.0},{"m":"̀","g":"`","x":0.233,"y":0.0}]},
+  "ἔ": {"base":"ε","marks":[{"m":"̓","g":"᾿","x":0.122,"y":0.0},{"m":"́","g":"΄","x":0.253,"y":0.0}]},
+  "ἕ": {"base":"ε","marks":[{"m":"̔","g":"῾","x":0.072,"y":0.0},{"m":"́","g":"΄","x":0.243,"y":0.0}]},
+  "Ἐ": {"base":"Ε","marks":[{"m":"̓","g":"᾿","x":-0.159,"y":0.07}],"bx":0.119,"aw":0.119},
+  "Ἑ": {"base":"Ε","marks":[{"m":"̔","g":"῾","x":-0.177,"y":0.07}],"bx":0.111,"aw":0.111},
+  "Ἒ": {"base":"Ε","marks":[{"m":"̓","g":"᾿","x":-0.331,"y":0.083},{"m":"̀","g":"`","x":-0.196,"y":0.083}],"bx":0.291,"aw":0.291},
+  "Ἓ": {"base":"Ε","marks":[{"m":"̔","g":"῾","x":-0.357,"y":0.082},{"m":"̀","g":"`","x":-0.196,"y":0.082}],"bx":0.291,"aw":0.291},
+  "Ἔ": {"base":"Ε","marks":[{"m":"̓","g":"᾿","x":-0.327,"y":0.082},{"m":"́","g":"΄","x":-0.196,"y":0.082}],"bx":0.287,"aw":0.287},
+  "Ἕ": {"base":"Ε","marks":[{"m":"̔","g":"῾","x":-0.367,"y":0.082},{"m":"́","g":"΄","x":-0.196,"y":0.082}],"bx":0.301,"aw":0.301},
+  "ἠ": {"base":"η","marks":[{"m":"̓","g":"᾿","x":0.186,"y":0.0}]},
+  "ἡ": {"base":"η","marks":[{"m":"̔","g":"῾","x":0.151,"y":0.0}]},
+  "ἢ": {"base":"η","marks":[{"m":"̓","g":"᾿","x":0.104,"y":0.0},{"m":"̀","g":"`","x":0.239,"y":0.0}]},
+  "ἣ": {"base":"η","marks":[{"m":"̔","g":"῾","x":0.07,"y":0.0},{"m":"̀","g":"`","x":0.231,"y":0.0}]},
+  "ἤ": {"base":"η","marks":[{"m":"̓","g":"᾿","x":0.12,"y":0.0},{"m":"́","g":"΄","x":0.251,"y":0.0}]},
+  "ἥ": {"base":"η","marks":[{"m":"̔","g":"῾","x":0.07,"y":0.0},{"m":"́","g":"΄","x":0.241,"y":0.0}]},
+  "ἦ": {"base":"η","marks":[{"m":"̓","g":"᾿","x":0.187,"y":-0.006},{"m":"͂","g":"῀","x":0.053,"y":-0.224}]},
+  "ἧ": {"base":"η","marks":[{"m":"̔","g":"῾","x":0.157,"y":-0.006},{"m":"͂","g":"῀","x":0.053,"y":-0.224}]},
+  "Ἠ": {"base":"Η","marks":[{"m":"̓","g":"᾿","x":-0.159,"y":0.07}],"bx":0.119,"aw":0.119},
+  "Ἡ": {"base":"Η","marks":[{"m":"̔","g":"῾","x":-0.177,"y":0.07}],"bx":0.111,"aw":0.111},
+  "Ἢ": {"base":"Η","marks":[{"m":"̓","g":"᾿","x":-0.331,"y":0.083},{"m":"̀","g":"`","x":-0.196,"y":0.083}],"bx":0.291,"aw":0.291},
+  "Ἣ": {"base":"Η","marks":[{"m":"̔","g":"῾","x":-0.357,"y":0.082},{"m":"̀","g":"`","x":-0.196,"y":0.082}],"bx":0.291,"aw":0.291},
+  "Ἤ": {"base":"Η","marks":[{"m":"̓","g":"᾿","x":-0.327,"y":0.082},{"m":"́","g":"΄","x":-0.196,"y":0.082}],"bx":0.287,"aw":0.287},
+  "Ἥ": {"base":"Η","marks":[{"m":"̔","g":"῾","x":-0.367,"y":0.082},{"m":"́","g":"΄","x":-0.196,"y":0.082}],"bx":0.301,"aw":0.301},
+  "Ἦ": {"base":"Η","marks":[{"m":"̓","g":"᾿","x":-0.271,"y":0.226},{"m":"͂","g":"῀","x":-0.405,"y":0.008}],"bx":0.355,"aw":0.355},
+  "Ἧ": {"base":"Η","marks":[{"m":"̔","g":"῾","x":-0.301,"y":0.226},{"m":"͂","g":"῀","x":-0.405,"y":0.008}],"bx":0.355,"aw":0.355},
+  "ἰ": {"base":"ι","marks":[{"m":"̓","g":"᾿","x":0.038,"y":0.0}]},
+  "ἱ": {"base":"ι","marks":[{"m":"̔","g":"῾","x":0.003,"y":0.0}]},
+  "ἲ": {"base":"ι","marks":[{"m":"̓","g":"᾿","x":-0.044,"y":0.0},{"m":"̀","g":"`","x":0.091,"y":0.0}]},
+  "ἳ": {"base":"ι","marks":[{"m":"̔","g":"῾","x":-0.078,"y":0.0},{"m":"̀","g":"`","x":0.083,"y":0.0}]},
+  "ἴ": {"base":"ι","marks":[{"m":"̓","g":"᾿","x":-0.028,"y":0.0},{"m":"́","g":"΄","x":0.103,"y":0.0}]},
+  "ἵ": {"base":"ι","marks":[{"m":"̔","g":"῾","x":-0.078,"y":0.0},{"m":"́","g":"΄","x":0.093,"y":0.0}]},
+  "ἶ": {"base":"ι","marks":[{"m":"̓","g":"᾿","x":0.039,"y":-0.006},{"m":"͂","g":"῀","x":-0.095,"y":-0.224}]},
+  "ἷ": {"base":"ι","marks":[{"m":"̔","g":"῾","x":0.009,"y":-0.006},{"m":"͂","g":"῀","x":-0.095,"y":-0.224}]},
+  "Ἰ": {"base":"Ι","marks":[{"m":"̓","g":"᾿","x":-0.159,"y":0.07}],"bx":0.119,"aw":0.119},
+  "Ἱ": {"base":"Ι","marks":[{"m":"̔","g":"῾","x":-0.177,"y":0.07}],"bx":0.111,"aw":0.111},
+  "Ἲ": {"base":"Ι","marks":[{"m":"̓","g":"᾿","x":-0.331,"y":0.083},{"m":"̀","g":"`","x":-0.196,"y":0.083}],"bx":0.291,"aw":0.291},
+  "Ἳ": {"base":"Ι","marks":[{"m":"̔","g":"῾","x":-0.357,"y":0.082},{"m":"̀","g":"`","x":-0.196,"y":0.082}],"bx":0.291,"aw":0.291},
+  "Ἴ": {"base":"Ι","marks":[{"m":"̓","g":"᾿","x":-0.327,"y":0.082},{"m":"́","g":"΄","x":-0.196,"y":0.082}],"bx":0.287,"aw":0.287},
+  "Ἵ": {"base":"Ι","marks":[{"m":"̔","g":"῾","x":-0.367,"y":0.082},{"m":"́","g":"΄","x":-0.196,"y":0.082}],"bx":0.301,"aw":0.301},
+  "Ἶ": {"base":"Ι","marks":[{"m":"̓","g":"᾿","x":-0.271,"y":0.226},{"m":"͂","g":"῀","x":-0.405,"y":0.008}],"bx":0.355,"aw":0.355},
+  "Ἷ": {"base":"Ι","marks":[{"m":"̔","g":"῾","x":-0.301,"y":0.226},{"m":"͂","g":"῀","x":-0.405,"y":0.008}],"bx":0.355,"aw":0.355},
+  "ὀ": {"base":"ο","marks":[{"m":"̓","g":"᾿","x":0.204,"y":0.0}]},
+  "ὁ": {"base":"ο","marks":[{"m":"̔","g":"῾","x":0.169,"y":0.0}]},
+  "ὂ": {"base":"ο","marks":[{"m":"̓","g":"᾿","x":0.122,"y":0.0},{"m":"̀","g":"`","x":0.257,"y":0.0}]},
+  "ὃ": {"base":"ο","marks":[{"m":"̔","g":"῾","x":0.088,"y":0.0},{"m":"̀","g":"`","x":0.249,"y":0.0}]},
+  "ὄ": {"base":"ο","marks":[{"m":"̓","g":"᾿","x":0.138,"y":0.0},{"m":"́","g":"΄","x":0.269,"y":0.0}]},
+  "ὅ": {"base":"ο","marks":[{"m":"̔","g":"῾","x":0.088,"y":0.0},{"m":"́","g":"΄","x":0.259,"y":0.0}]},
+  "Ὀ": {"base":"Ο","marks":[{"m":"̓","g":"᾿","x":-0.093,"y":0.07}],"bx":0.053,"aw":0.053},
+  "Ὁ": {"base":"Ο","marks":[{"m":"̔","g":"῾","x":-0.111,"y":0.07}],"bx":0.045,"aw":0.045},
+  "Ὂ": {"base":"Ο","marks":[{"m":"̓","g":"᾿","x":-0.265,"y":0.083},{"m":"̀","g":"`","x":-0.13,"y":0.083}],"bx":0.225,"aw":0.225},
+  "Ὃ": {"base":"Ο","marks":[{"m":"̔","g":"῾","x":-0.291,"y":0.082},{"m":"̀","g":"`","x":-0.13,"y":0.082}],"bx":0.225,"aw":0.225},
+  "Ὄ": {"base":"Ο","marks":[{"m":"̓","g":"᾿","x":-0.261,"y":0.082},{"m":"́","g":"΄","x":-0.13,"y":0.082}],"bx":0.221,"aw":0.221},
+  "Ὅ": {"base":"Ο","marks":[{"m":"̔","g":"῾","x":-0.301,"y":0.082},{"m":"́","g":"΄","x":-0.13,"y":0.082}],"bx":0.235,"aw":0.235},
+  "ὐ": {"base":"υ","marks":[{"m":"̓","g":"᾿","x":0.165,"y":0.0}]},
+  "ὑ": {"base":"υ","marks":[{"m":"̔","g":"῾","x":0.13,"y":0.0}]},
+  "ὒ": {"base":"υ","marks":[{"m":"̓","g":"᾿","x":0.083,"y":0.0},{"m":"̀","g":"`","x":0.218,"y":0.0}]},
+  "ὓ": {"base":"υ","marks":[{"m":"̔","g":"῾","x":0.049,"y":0.0},{"m":"̀","g":"`","x":0.21,"y":0.0}]},
+  "ὔ": {"base":"υ","marks":[{"m":"̓","g":"᾿","x":0.099,"y":0.0},{"m":"́","g":"΄","x":0.23,"y":0.0}]},
+  "ὕ": {"base":"υ","marks":[{"m":"̔","g":"῾","x":0.049,"y":0.0},{"m":"́","g":"΄","x":0.22,"y":0.0}]},
+  "ὖ": {"base":"υ","marks":[{"m":"̓","g":"᾿","x":0.166,"y":-0.006},{"m":"͂","g":"῀","x":0.032,"y":-0.224}]},
+  "ὗ": {"base":"υ","marks":[{"m":"̔","g":"῾","x":0.136,"y":-0.006},{"m":"͂","g":"῀","x":0.032,"y":-0.224}]},
+  "Ὑ": {"base":"Υ","marks":[{"m":"̔","g":"῾","x":-0.212,"y":0.07}],"bx":0.146,"aw":0.146},
+  "Ὓ": {"base":"Υ","marks":[{"m":"̔","g":"῾","x":-0.392,"y":0.082},{"m":"̀","g":"`","x":-0.231,"y":0.082}],"bx":0.326,"aw":0.326},
+  "Ὕ": {"base":"Υ","marks":[{"m":"̔","g":"῾","x":-0.402,"y":0.082},{"m":"́","g":"΄","x":-0.231,"y":0.082}],"bx":0.336,"aw":0.336},
+  "Ὗ": {"base":"Υ","marks":[{"m":"̔","g":"῾","x":-0.336,"y":0.226},{"m":"͂","g":"῀","x":-0.44,"y":0.008}],"bx":0.39,"aw":0.39},
+  "ὠ": {"base":"ω","marks":[{"m":"̓","g":"᾿","x":0.314,"y":0.0}]},
+  "ὡ": {"base":"ω","marks":[{"m":"̔","g":"῾","x":0.279,"y":0.0}]},
+  "ὢ": {"base":"ω","marks":[{"m":"̓","g":"᾿","x":0.232,"y":0.0},{"m":"̀","g":"`","x":0.367,"y":0.0}]},
+  "ὣ": {"base":"ω","marks":[{"m":"̔","g":"῾","x":0.198,"y":0.0},{"m":"̀","g":"`","x":0.359,"y":0.0}]},
+  "ὤ": {"base":"ω","marks":[{"m":"̓","g":"᾿","x":0.248,"y":0.0},{"m":"́","g":"΄","x":0.379,"y":0.0}]},
+  "ὥ": {"base":"ω","marks":[{"m":"̔","g":"῾","x":0.198,"y":0.0},{"m":"́","g":"΄","x":0.369,"y":0.0}]},
+  "ὦ": {"base":"ω","marks":[{"m":"̓","g":"᾿","x":0.315,"y":-0.006},{"m":"͂","g":"῀","x":0.181,"y":-0.224}]},
+  "ὧ": {"base":"ω","marks":[{"m":"̔","g":"῾","x":0.285,"y":-0.006},{"m":"͂","g":"῀","x":0.181,"y":-0.224}]},
+  "Ὠ": {"base":"Ω","marks":[{"m":"̓","g":"᾿","x":-0.107,"y":0.07}],"bx":0.067,"aw":0.067},
+  "Ὡ": {"base":"Ω","marks":[{"m":"̔","g":"῾","x":-0.125,"y":0.07}],"bx":0.059,"aw":0.059},
+  "Ὢ": {"base":"Ω","marks":[{"m":"̓","g":"᾿","x":-0.279,"y":0.083},{"m":"̀","g":"`","x":-0.144,"y":0.083}],"bx":0.239,"aw":0.239},
+  "Ὣ": {"base":"Ω","marks":[{"m":"̔","g":"῾","x":-0.305,"y":0.082},{"m":"̀","g":"`","x":-0.144,"y":0.082}],"bx":0.239,"aw":0.239},
+  "Ὤ": {"base":"Ω","marks":[{"m":"̓","g":"᾿","x":-0.275,"y":0.082},{"m":"́","g":"΄","x":-0.144,"y":0.082}],"bx":0.235,"aw":0.235},
+  "Ὥ": {"base":"Ω","marks":[{"m":"̔","g":"῾","x":-0.315,"y":0.082},{"m":"́","g":"΄","x":-0.144,"y":0.082}],"bx":0.249,"aw":0.249},
+  "Ὦ": {"base":"Ω","marks":[{"m":"̓","g":"᾿","x":-0.219,"y":0.226},{"m":"͂","g":"῀","x":-0.353,"y":0.008}],"bx":0.303,"aw":0.303},
+  "Ὧ": {"base":"Ω","marks":[{"m":"̔","g":"῾","x":-0.249,"y":0.226},{"m":"͂","g":"῀","x":-0.353,"y":0.008}],"bx":0.303,"aw":0.303},
+  "ὰ": {"base":"α","marks":[{"m":"̀","g":"`","x":0.119,"y":0.0}]},
+  "ά": {"base":"α","marks":[{"m":"́","g":"΄","x":0.195,"y":0.0}]},
+  "ὲ": {"base":"ε","marks":[{"m":"̀","g":"`","x":0.122,"y":0.0}]},
+  "έ": {"base":"ε","marks":[{"m":"́","g":"΄","x":0.198,"y":0.0}]},
+  "ὴ": {"base":"η","marks":[{"m":"̀","g":"`","x":0.12,"y":0.0}]},
+  "ή": {"base":"η","marks":[{"m":"́","g":"΄","x":0.196,"y":0.0}]},
+  "ὶ": {"base":"ι","marks":[{"m":"̀","g":"`","x":-0.028,"y":0.0}]},
+  "ί": {"base":"ι","marks":[{"m":"́","g":"΄","x":0.048,"y":0.0}]},
+  "ὸ": {"base":"ο","marks":[{"m":"̀","g":"`","x":0.138,"y":0.0}]},
+  "ό": {"base":"ο","marks":[{"m":"́","g":"΄","x":0.214,"y":0.0}]},
+  "ὺ": {"base":"υ","marks":[{"m":"̀","g":"`","x":0.099,"y":0.0}]},
+  "ύ": {"base":"υ","marks":[{"m":"́","g":"΄","x":0.175,"y":0.0}]},
+  "ὼ": {"base":"ω","marks":[{"m":"̀","g":"`","x":0.248,"y":0.0}]},
+  "ώ": {"base":"ω","marks":[{"m":"́","g":"΄","x":0.324,"y":0.0}]},
+  "ᾀ": {"base":"ᾳ","marks":[{"m":"̓","g":"᾿","x":0.185,"y":0.0}]},
+  "ᾁ": {"base":"ᾳ","marks":[{"m":"̔","g":"῾","x":0.15,"y":0.0}]},
+  "ᾂ": {"base":"ᾳ","marks":[{"m":"̓","g":"᾿","x":0.103,"y":0.0},{"m":"̀","g":"`","x":0.238,"y":0.0}]},
+  "ᾃ": {"base":"ᾳ","marks":[{"m":"̔","g":"῾","x":0.069,"y":0.0},{"m":"̀","g":"`","x":0.23,"y":0.0}]},
+  "ᾄ": {"base":"ᾳ","marks":[{"m":"̓","g":"᾿","x":0.119,"y":0.0},{"m":"́","g":"΄","x":0.25,"y":0.0}]},
+  "ᾅ": {"base":"ᾳ","marks":[{"m":"̔","g":"῾","x":0.069,"y":0.0},{"m":"́","g":"΄","x":0.24,"y":0.0}]},
+  "ᾆ": {"base":"ᾳ","marks":[{"m":"̓","g":"᾿","x":0.186,"y":-0.006},{"m":"͂","g":"῀","x":0.052,"y":-0.224}]},
+  "ᾇ": {"base":"ᾳ","marks":[{"m":"̔","g":"῾","x":0.156,"y":-0.006},{"m":"͂","g":"῀","x":0.052,"y":-0.224}]},
+  "ᾈ": {"base":"ᾼ","marks":[{"m":"̓","g":"᾿","x":0.052,"y":0.07}]},
+  "ᾉ": {"base":"ᾼ","marks":[{"m":"̔","g":"῾","x":0.034,"y":0.07}]},
+  "ᾊ": {"base":"ᾼ","marks":[{"m":"̓","g":"᾿","x":-0.12,"y":0.083},{"m":"̀","g":"`","x":0.015,"y":0.083}]},
+  "ᾋ": {"base":"ᾼ","marks":[{"m":"̔","g":"῾","x":-0.146,"y":0.082},{"m":"̀","g":"`","x":0.015,"y":0.082}]},
+  "ᾌ": {"base":"ᾼ","marks":[{"m":"̓","g":"᾿","x":-0.116,"y":0.082},{"m":"́","g":"΄","x":0.015,"y":0.082}]},
+  "ᾍ": {"base":"ᾼ","marks":[{"m":"̔","g":"῾","x":-0.156,"y":0.082},{"m":"́","g":"΄","x":0.015,"y":0.082}]},
+  "ᾎ": {"base":"ᾼ","marks":[{"m":"̓","g":"᾿","x":-0.06,"y":0.226},{"m":"͂","g":"῀","x":-0.194,"y":0.008}]},
+  "ᾏ": {"base":"ᾼ","marks":[{"m":"̔","g":"῾","x":-0.09,"y":0.226},{"m":"͂","g":"῀","x":-0.194,"y":0.008}]},
+  "ᾐ": {"base":"ῃ","marks":[{"m":"̓","g":"᾿","x":0.186,"y":0.0}]},
+  "ᾑ": {"base":"ῃ","marks":[{"m":"̔","g":"῾","x":0.151,"y":0.0}]},
+  "ᾒ": {"base":"ῃ","marks":[{"m":"̓","g":"᾿","x":0.104,"y":0.0},{"m":"̀","g":"`","x":0.239,"y":0.0}]},
+  "ᾓ": {"base":"ῃ","marks":[{"m":"̔","g":"῾","x":0.07,"y":0.0},{"m":"̀","g":"`","x":0.231,"y":0.0}]},
+  "ᾔ": {"base":"ῃ","marks":[{"m":"̓","g":"᾿","x":0.12,"y":0.0},{"m":"́","g":"΄","x":0.251,"y":0.0}]},
+  "ᾕ": {"base":"ῃ","marks":[{"m":"̔","g":"῾","x":0.07,"y":0.0},{"m":"́","g":"΄","x":0.241,"y":0.0}]},
+  "ᾖ": {"base":"ῃ","marks":[{"m":"̓","g":"᾿","x":0.187,"y":-0.006},{"m":"͂","g":"῀","x":0.053,"y":-0.224}]},
+  "ᾗ": {"base":"ῃ","marks":[{"m":"̔","g":"῾","x":0.157,"y":-0.006},{"m":"͂","g":"῀","x":0.053,"y":-0.224}]},
+  "ᾘ": {"base":"ῌ","marks":[{"m":"̓","g":"᾿","x":-0.159,"y":0.07}],"bx":0.119,"aw":0.119},
+  "ᾙ": {"base":"ῌ","marks":[{"m":"̔","g":"῾","x":-0.177,"y":0.07}],"bx":0.111,"aw":0.111},
+  "ᾚ": {"base":"ῌ","marks":[{"m":"̓","g":"᾿","x":-0.331,"y":0.083},{"m":"̀","g":"`","x":-0.196,"y":0.083}],"bx":0.291,"aw":0.291},
+  "ᾛ": {"base":"ῌ","marks":[{"m":"̔","g":"῾","x":-0.357,"y":0.082},{"m":"̀","g":"`","x":-0.196,"y":0.082}],"bx":0.291,"aw":0.291},
+  "ᾜ": {"base":"ῌ","marks":[{"m":"̓","g":"᾿","x":-0.327,"y":0.082},{"m":"́","g":"΄","x":-0.196,"y":0.082}],"bx":0.287,"aw":0.287},
+  "ᾝ": {"base":"ῌ","marks":[{"m":"̔","g":"῾","x":-0.367,"y":0.082},{"m":"́","g":"΄","x":-0.196,"y":0.082}],"bx":0.301,"aw":0.301},
+  "ᾞ": {"base":"ῌ","marks":[{"m":"̓","g":"᾿","x":-0.271,"y":0.226},{"m":"͂","g":"῀","x":-0.405,"y":0.008}],"bx":0.355,"aw":0.355},
+  "ᾟ": {"base":"ῌ","marks":[{"m":"̔","g":"῾","x":-0.301,"y":0.226},{"m":"͂","g":"῀","x":-0.405,"y":0.008}],"bx":0.355,"aw":0.355},
+  "ᾠ": {"base":"ῳ","marks":[{"m":"̓","g":"᾿","x":0.314,"y":0.0}]},
+  "ᾡ": {"base":"ῳ","marks":[{"m":"̔","g":"῾","x":0.279,"y":0.0}]},
+  "ᾢ": {"base":"ῳ","marks":[{"m":"̓","g":"᾿","x":0.232,"y":0.0},{"m":"̀","g":"`","x":0.367,"y":0.0}]},
+  "ᾣ": {"base":"ῳ","marks":[{"m":"̔","g":"῾","x":0.198,"y":0.0},{"m":"̀","g":"`","x":0.359,"y":0.0}]},
+  "ᾤ": {"base":"ῳ","marks":[{"m":"̓","g":"᾿","x":0.248,"y":0.0},{"m":"́","g":"΄","x":0.379,"y":0.0}]},
+  "ᾥ": {"base":"ῳ","marks":[{"m":"̔","g":"῾","x":0.198,"y":0.0},{"m":"́","g":"΄","x":0.369,"y":0.0}]},
+  "ᾦ": {"base":"ῳ","marks":[{"m":"̓","g":"᾿","x":0.315,"y":-0.006},{"m":"͂","g":"῀","x":0.181,"y":-0.224}]},
+  "ᾧ": {"base":"ῳ","marks":[{"m":"̔","g":"῾","x":0.285,"y":-0.006},{"m":"͂","g":"῀","x":0.181,"y":-0.224}]},
+  "ᾨ": {"base":"ῼ","marks":[{"m":"̓","g":"᾿","x":-0.107,"y":0.07}],"bx":0.067,"aw":0.067},
+  "ᾩ": {"base":"ῼ","marks":[{"m":"̔","g":"῾","x":-0.125,"y":0.07}],"bx":0.059,"aw":0.059},
+  "ᾪ": {"base":"ῼ","marks":[{"m":"̓","g":"᾿","x":-0.279,"y":0.083},{"m":"̀","g":"`","x":-0.144,"y":0.083}],"bx":0.239,"aw":0.239},
+  "ᾫ": {"base":"ῼ","marks":[{"m":"̔","g":"῾","x":-0.305,"y":0.082},{"m":"̀","g":"`","x":-0.144,"y":0.082}],"bx":0.239,"aw":0.239},
+  "ᾬ": {"base":"ῼ","marks":[{"m":"̓","g":"᾿","x":-0.275,"y":0.082},{"m":"́","g":"΄","x":-0.144,"y":0.082}],"bx":0.235,"aw":0.235},
+  "ᾭ": {"base":"ῼ","marks":[{"m":"̔","g":"῾","x":-0.315,"y":0.082},{"m":"́","g":"΄","x":-0.144,"y":0.082}],"bx":0.249,"aw":0.249},
+  "ᾮ": {"base":"ῼ","marks":[{"m":"̓","g":"᾿","x":-0.219,"y":0.226},{"m":"͂","g":"῀","x":-0.353,"y":0.008}],"bx":0.303,"aw":0.303},
+  "ᾯ": {"base":"ῼ","marks":[{"m":"̔","g":"῾","x":-0.249,"y":0.226},{"m":"͂","g":"῀","x":-0.353,"y":0.008}],"bx":0.303,"aw":0.303},
+  "ᾲ": {"base":"ᾳ","marks":[{"m":"̀","g":"`","x":0.119,"y":0.0}]},
+  "ᾴ": {"base":"ᾳ","marks":[{"m":"́","g":"΄","x":0.195,"y":0.0}]},
+  "ᾶ": {"base":"α","marks":[{"m":"͂","g":"῀","x":0.052,"y":0.0}]},
+  "ᾷ": {"base":"ᾳ","marks":[{"m":"͂","g":"῀","x":0.052,"y":0.0}]},
+  "Ὰ": {"base":"Α","marks":[{"m":"̀","g":"`","x":0.015,"y":0.083}]},
+  "Ά": {"base":"Α","marks":[{"m":"́","g":"΄","x":0.016,"y":0.082}]},
+  "ῂ": {"base":"ῃ","marks":[{"m":"̀","g":"`","x":0.12,"y":0.0}]},
+  "ῄ": {"base":"ῃ","marks":[{"m":"́","g":"΄","x":0.196,"y":0.0}]},
+  "ῆ": {"base":"η","marks":[{"m":"͂","g":"῀","x":0.053,"y":0.0}]},
+  "ῇ": {"base":"ῃ","marks":[{"m":"͂","g":"῀","x":0.053,"y":0.0}]},
+  "Ὲ": {"base":"Ε","marks":[{"m":"̀","g":"`","x":-0.196,"y":0.083}],"bx":0.146,"aw":0.146},
+  "Έ": {"base":"Ε","marks":[{"m":"́","g":"΄","x":-0.195,"y":0.082}],"bx":0.145,"aw":0.145},
+  "Ὴ": {"base":"Η","marks":[{"m":"̀","g":"`","x":-0.196,"y":0.083}],"bx":0.146,"aw":0.146},
+  "Ή": {"base":"Η","marks":[{"m":"́","g":"΄","x":-0.195,"y":0.082}],"bx":0.145,"aw":0.145},
+  "ῒ": {"base":"ι","marks":[{"m":"̈","g":"῭","x":-0.233,"y":0.0,"clip":[-1.0,0.2525]},{"m":"̈","g":"῭","x":-0.233,"y":0.0,"clip":[0.402,2.0]},{"m":"̀","g":"῭","x":-0.233,"y":0.0,"clip":[0.2525,0.402]}]},
+  "ΐ": {"base":"ι","marks":[{"m":"̈","g":"΅","x":-0.204,"y":0.0,"clip":[-1.0,0.267]},{"m":"̈","g":"΅","x":-0.204,"y":0.0,"clip":[0.4165,2.0]},{"m":"́","g":"΅","x":-0.204,"y":0.0,"clip":[0.267,0.4165]}]},
+  "ῖ": {"base":"ι","marks":[{"m":"͂","g":"῀","x":-0.095,"y":0.0}]},
+  "ῗ": {"base":"ι","marks":[{"m":"̈","g":"¨","x":-0.165,"y":0.0},{"m":"͂","g":"῀","x":-0.095,"y":-0.164}]},
+  "Ὶ": {"base":"Ι","marks":[{"m":"̀","g":"`","x":-0.196,"y":0.083}]},
+  "Ί": {"base":"Ι","marks":[{"m":"́","g":"΄","x":-0.195,"y":0.082}]},
+  "ῢ": {"base":"υ","marks":[{"m":"̈","g":"῭","x":-0.106,"y":0.0,"clip":[-1.0,0.2525]},{"m":"̈","g":"῭","x":-0.106,"y":0.0,"clip":[0.402,2.0]},{"m":"̀","g":"῭","x":-0.106,"y":0.0,"clip":[0.2525,0.402]}]},
+  "ΰ": {"base":"υ","marks":[{"m":"̈","g":"΅","x":-0.077,"y":0.0,"clip":[-1.0,0.267]},{"m":"̈","g":"΅","x":-0.077,"y":0.0,"clip":[0.4165,2.0]},{"m":"́","g":"΅","x":-0.077,"y":0.0,"clip":[0.267,0.4165]}]},
+  "ῤ": {"base":"ρ","marks":[{"m":"̓","g":"᾿","x":0.207,"y":0.0}]},
+  "ῥ": {"base":"ρ","marks":[{"m":"̔","g":"῾","x":0.172,"y":0.0}]},
+  "ῦ": {"base":"υ","marks":[{"m":"͂","g":"῀","x":0.032,"y":0.0}]},
+  "ῧ": {"base":"υ","marks":[{"m":"̈","g":"¨","x":-0.038,"y":0.0},{"m":"͂","g":"῀","x":0.032,"y":-0.164}]},
+  "Ὺ": {"base":"Υ","marks":[{"m":"̀","g":"`","x":-0.231,"y":0.083}]},
+  "Ύ": {"base":"Υ","marks":[{"m":"́","g":"΄","x":-0.23,"y":0.082}]},
+  "Ῥ": {"base":"Ρ","marks":[{"m":"̔","g":"῾","x":-0.177,"y":0.07}]},
+  "ῲ": {"base":"ῳ","marks":[{"m":"̀","g":"`","x":0.248,"y":0.0}]},
+  "ῴ": {"base":"ῳ","marks":[{"m":"́","g":"΄","x":0.324,"y":0.0}]},
+  "ῶ": {"base":"ω","marks":[{"m":"͂","g":"῀","x":0.181,"y":0.0}]},
+  "ῷ": {"base":"ῳ","marks":[{"m":"͂","g":"῀","x":0.181,"y":0.0}]},
+  "Ὸ": {"base":"Ο","marks":[{"m":"̀","g":"`","x":-0.13,"y":0.083}]},
+  "Ό": {"base":"Ο","marks":[{"m":"́","g":"΄","x":-0.129,"y":0.082}]},
+  "Ὼ": {"base":"Ω","marks":[{"m":"̀","g":"`","x":-0.144,"y":0.083}]},
+  "Ώ": {"base":"Ω","marks":[{"m":"́","g":"΄","x":-0.143,"y":0.082}]}
+ }
+}
````

### 9.4 Data (sections A1, A3, A4)

Authored in this session rather than delivered by the chat side, since this
round had no separate data patch. Surgical string replacements against the file
read with `newline=''`, so CRLF endings and `indent=1` formatting are untouched
and the diff is only the lines that changed.

````diff
diff --git a/src/data/chapt-02.json b/src/data/chapt-02.json
index 0e9afc6..634609a 100644
--- a/src/data/chapt-02.json
+++ b/src/data/chapt-02.json
@@ -1,5 +1,5 @@
 {
- "_comment": "Chapter 2 (Syllables & Accents), reconstructed from 2_ACCENT.TBK + CHAPT_2 audio inventory, PATCHED 2026-07-24 against the completed VERIFY-chapt02 DOSBox pass (sequence, all drill/exercise pools and answers, popup contents, and chart corrections). answerPolicy: the original finalizes one attempt per item on Check Answer, reveals the correct form, and auto-advances after ~4s (J1, Nathanael-approved timing); scored activities therefore complete when all items have been ATTEMPTED. UI colors per Nathanael (E1/E2): blue = selected guess, green = confirmed correct after Check Answer, red reserved for incorrect feedback. PATCHED AGAIN 2026-07-26 (5B-SPEC2 data): isolated marks now use SPACING codepoints (U+1FBF/1FFE/1FC0/00B4/0060/00A8) so they render correctly outside words; bibliography items are plain strings; rule-chart inflected rows wired to their b_ex2 clips; syllable-counting one-syllable bar removed (V2); accent rule drill: no auto-advance on incorrect + per-item audio + red first accent; multi-part tappable rows (parts[]) on Apostrophe/Coronis; Grammar Review verbs/nouns restructured per feedback 12/13; Review Marks grouped per feedback 15; liveScore + pronounceEach defaults across scored surfaces; accent placement gains a clearly-labeled circumflex EXTENSION pool (feedback 11, keep/drop decided in VERIFY2). PATCH3 2026-07-26 (5B-SPEC3 data): double-hyphens normalized to em dashes chapter-wide (typo policy A1 extension); accent-placement extension merged+shuffled into a 25-item pool, banner retired; anthrope wired to the base-form stand-in clip; Nouns topic restructured with subheading blocks (new RichContent type).",
+ "_comment": "Chapter 2 (Syllables & Accents), reconstructed from 2_ACCENT.TBK + CHAPT_2 audio inventory, PATCHED 2026-07-24 against the completed VERIFY-chapt02 DOSBox pass (sequence, all drill/exercise pools and answers, popup contents, and chart corrections). answerPolicy: the original finalizes one attempt per item on Check Answer, reveals the correct form, and auto-advances after ~4s (J1, Nathanael-approved timing); scored activities therefore complete when all items have been ATTEMPTED. UI colors per Nathanael (E1/E2): blue = selected guess, green = confirmed correct after Check Answer, red reserved for incorrect feedback. PATCHED AGAIN 2026-07-26 (5B-SPEC2 data): isolated marks now use SPACING codepoints (U+1FBF/1FFE/1FC0/00B4/0060/00A8) so they render correctly outside words; bibliography items are plain strings; rule-chart inflected rows wired to their b_ex2 clips; syllable-counting one-syllable bar removed (V2); accent rule drill: no auto-advance on incorrect + per-item audio + red first accent; multi-part tappable rows (parts[]) on Apostrophe/Coronis; Grammar Review verbs/nouns restructured per feedback 12/13; Review Marks grouped per feedback 15; liveScore + pronounceEach defaults across scored surfaces; accent placement gains a clearly-labeled circumflex EXTENSION pool (feedback 11, keep/drop decided in VERIFY2). PATCH3 2026-07-26 (5B-SPEC3 data): double-hyphens normalized to em dashes chapter-wide (typo policy A1 extension); accent-placement extension merged+shuffled into a 25-item pool, banner retired; anthrope wired to the base-form stand-in clip; Nouns topic restructured with subheading blocks (new RichContent type). PATCH4 2026-07-27 (5B-SPEC4 data, VERIFY3): the Rule 1/3/4 chart ditto marks (idem./ibid. in the original, flattened into a literal quote when the chart became rows) print the translation 'man' instead, including Rule 3's 'Base noun form'; anthrope wired to b_ex2_21, identified as the vocative clip; the marking-recognition pharisaios item points at cluster 7 (the circumflex) instead of cluster 6 (a bare alpha, which rendered nothing red); syllable-division instructions and buttons rewritten for the drag-a-divider rebuild.",
  "id": "chapt_2",
  "number": 2,
  "title": "Syllables & Accents",
@@ -649,28 +649,28 @@
           },
           {
            "greek": "ἀνθρώπου",
-           "gloss": "\"  (penult acute—long ultima causes change)",
+           "gloss": "man (penult acute—long ultima causes change)",
            "_legacy": "a]nqrw<pou",
            "audio": "chapt_2_b_ex2_15"
           },
           {
            "greek": "ἀνθρώπῳ",
-           "gloss": "\"  (penult acute—long ultima causes change)",
+           "gloss": "man (penult acute—long ultima causes change)",
            "_legacy": "a]nqrw<p&",
            "audio": "chapt_2_b_ex2_17"
           },
           {
            "greek": "ἄνθρωπον",
-           "gloss": "\"  (antepenult acute—short ultima, no change)",
+           "gloss": "man (antepenult acute—short ultima, no change)",
            "_legacy": "a@nqrwpon",
            "audio": "chapt_2_b_ex2_12"
           },
           {
            "greek": "ἄνθρωπε",
-           "gloss": "\"  (antepenult acute—short ultima, no change)",
+           "gloss": "man (antepenult acute—short ultima, no change)",
            "_legacy": "a@nqrwpe",
-           "_note": "STAND-IN AUDIO: the ISO has no vocative clip; plays the base-form recording (a_voc3) per Nathanael's directive that every chart word be tappable (VERIFY2 item 4). Flag if a dedicated clip surfaces in a later chapter.",
-           "audio": "chapt_2_a_voc3"
+           "_note": "b_ex2_21 IDENTIFIED (VERIFY3 item 2): the 21st accent-placement clip, unreferenced by the 20 exercise items, is the vocative. Replaces the a_voc3 stand-in wired in SPEC3.",
+           "audio": "chapt_2_b_ex2_21"
           }
          ]
         }
@@ -732,19 +732,19 @@
          "rows": [
           {
            "greek": "ἄνθρωπος",
-           "gloss": "Base noun form (antepenult accented, acute)",
+           "gloss": "man (antepenult accented, acute)",
            "audio": "chapt_2_a_voc3",
            "_legacy": "a@nqrwpoj"
           },
           {
            "greek": "ἀνθρώπου",
-           "gloss": "\"  (penult acute—cannot accent antepenult)",
+           "gloss": "man (penult acute—cannot accent antepenult)",
            "_legacy": "a]nqrw<pou",
            "audio": "chapt_2_b_ex2_15"
           },
           {
            "greek": "ἀνθρώπῳ",
-           "gloss": "\"  (penult acute—cannot accent antepenult)",
+           "gloss": "man (penult acute—cannot accent antepenult)",
            "_legacy": "a]nqrw<p&",
            "audio": "chapt_2_b_ex2_17"
           }
@@ -761,12 +761,12 @@
          "rows": [
           {
            "greek": "ἀνθρώπου",
-           "gloss": "\"  (penult acute—long ultima causes change)",
+           "gloss": "man (penult acute—long ultima causes change)",
            "audio": "chapt_2_b_ex2_15"
           },
           {
            "greek": "ἀνθρώπῳ",
-           "gloss": "\"  (penult acute—long ultima causes change)",
+           "gloss": "man (penult acute—long ultima causes change)",
            "audio": "chapt_2_b_ex2_17"
           },
           {
@@ -2366,7 +2366,7 @@
      "gloss": "Pharisee",
      "answer": "Circumflex",
      "audio": "chapt_2_b_voc10",
-     "redMarkCluster": 6
+     "redMarkCluster": 7
     },
     {
      "greek": "θεὸς",
@@ -2727,7 +2727,7 @@
    "id": "c2_ex_syllable_division",
    "type": "divide",
    "title": "Syllable Division Exercise",
-   "instructions": "Click on the number(s) where the word is divided into syllables.  Then click Check Answer.",
+   "instructions": "Tap the word where a syllable ends to place a divider, then drag it to fine-tune.  Tap again elsewhere to add another.  Then click \"Check Answer,\" or \"Clear Answer\" to start the word over.",
    "items": [
     {
      "n": 1,
@@ -2921,6 +2921,7 @@
    "ui": {
     "buttons": [
      "Check Answer",
+     "Clear Answer",
      "Previous",
      "Next",
      "Pronounce Word",
diff --git a/src/data/lexicon-chapt02.json b/src/data/lexicon-chapt02.json
index cc706ea..6e4eca0 100644
--- a/src/data/lexicon-chapt02.json
+++ b/src/data/lexicon-chapt02.json
@@ -137,9 +137,9 @@
   "anthrope": {
    "greek": "ἄνθρωπε",
    "gloss": "O man",
-   "audio": null,
+   "audio": "chapt_2_b_ex2_21",
    "_legacy": "a@nqrwpe",
-   "_note": "Chart row without dedicated audio in the original; renders ink/inert."
+   "_note": "b_ex2_21 identified as the vocative clip (VERIFY3 item 2); the row was inert through SPEC2 and carried an a_voc3 stand-in in SPEC3."
   },
   "anthropon_gen": {
    "greek": "ἀνθρώπων",
````
