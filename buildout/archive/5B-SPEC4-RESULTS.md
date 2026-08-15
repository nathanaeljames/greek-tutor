# 5B-SPEC4-RESULTS.md — chapter 2 round 4

Implementer: Fable (Claude Opus 5) in Claude Code, acting as pipeline AND
implementer this round (there was no separate data delivery). Base: the
accepted SPEC3 tree. Nothing committed, nothing pushed. Spec: `5B-SPEC4.md`.

Every spec item landed except item 1, which Nathanael withdrew during spec
authoring. Two decisions were put to him before any code was written (section
7); the rest is recorded here as built.

The round's centre is item 5. The short version: **the marks were positioned by
six hand-written rules and are now positioned by the font.** Nineteen of the 45
red-mark items now render pixel-identical to the printed word, and the rest
differ only by sub-pixel text repositioning, proven by a control (section 3).

## 1. A. Data edits

`git diff` under `src/data/` is 29 lines in `chapt-02.json` and 4 in
`lexicon-chapt02.json`. Nothing else in the data tree moved.

| Edit | What |
| --- | --- |
| A1a | Rule 1 chart, `ἄνθρωπε`: `chapt_2_a_voc3` (the SPEC3 stand-in) -> **`chapt_2_b_ex2_21`**. Mirrored onto `lexicon-chapt02.json exampleWords.anthrope`, which still said the row had no dedicated audio. Both `_note`s now record the identification rather than the stand-in. |
| A1b | Nine glosses: the eight `"` ditto marks in the Rule 1/3/4 charts and Rule 3's `Base noun form` all read **`man`**. The `"` was an idem./ibid. mark under a chart column in the original and became a literal quote when the chart was flattened into rows. |
| A3 | `c2_ex_syllable_division`: `instructions` rewritten for the rebuilt interaction, `ui.buttons` gains `Clear Answer`. The 20 items and their `division[]` arrays are untouched. |
| A4 | Marking Recognition `φαρισαῖος`: `redMarkCluster` 6 -> **7**. Cluster 6 is a bare α; the circumflex is on 7 (φ α ρ ι σ α ῖ ο ς). Under XPATCH1's "absent signal beats false signal" rule the item shipped with nothing red at all — it asked "which mark is red?" with no red on the page. Carried from SPEC3 RESULTS §8.1. |
| — | One provenance sentence appended to the file's `_comment`, as every previous patch has done. |

## 2. B. Mark geometry — the font is the table now

### Why six rules could not work

SPEC3's offsets were read off the font, but only from a handful of sample
glyphs, and then applied as six CSS classes to everything. The font does not
work that way. It carries a separate offset pair for each precomposed
character, and they differ by base letter as much as by combination:

| Mark | rows | x range (em) | y range (em) |
| --- | --- | --- | --- |
| acute | 75 | −0.231 … +0.379 | 0 … +0.082 |
| grave | 58 | −0.233 … +0.367 | 0 … +0.083 |
| smooth breathing | 73 | −0.331 … +0.315 | −0.006 … +0.226 |
| rough breathing | 78 | −0.402 … +0.285 | −0.006 … +0.226 |
| circumflex | 41 | −0.440 … +0.181 | −0.224 … +0.008 |
| diaeresis | 19 | −0.233 … +0.033 | −0.178 … 0 |

A single acute alone wants +0.205em over α, +0.334em over ω, +0.058em over ι.
SPEC3 centred it on the base instead, which is wrong by a different amount, in
a different direction, for every letter — and that IS the VERIFY3 complaint,
arithmetically:

| cluster | word | SPEC3 centred x | font x | error | at 40px prompt |
| --- | --- | --- | --- | --- | --- |
| ὸ | πρὸς | +0.175 | +0.138 | +0.037em | **+1.50px right** |
| ὶ | καὶ | +0.030 | −0.028 | +0.058em | **+2.32px right** |
| ῆ | ῥῆμα | +0.089 | +0.053 | +0.036em | +1.44px right |
| ώ | ἐχώ | +0.286 | +0.334 | −0.048em | −1.92px left |
| ό | θεός | +0.175 | +0.224 | −0.049em | −1.94px left |
| ί | κύριος | +0.030 | +0.058 | −0.028em | −1.12px left |

"the acute or grave is ever-so-slightly to the right of the i in kai when it
should be directly above it" is line two of that table.

### B1. The generator

`scripts/make-mark-geometry.py` reads the bundled font and emits
`src/lib/mark-geometry.json` — **221 clusters, 24,099 bytes**, 12 macron/vrachy
combinations deliberately skipped. Method: flatten each precomposed glyph's
composite components recursively, locate the base component inside it, and
record every other component's offset relative to the base's origin, in em,
alongside the spacing codepoint that draws that same component alone. These are
the type designer's own numbers, so the overlay reproduces the printed
character by construction rather than by adjustment.

Three things the naive version would have got wrong:

1. **The base is not always at the origin.** `Ἐ` is `E` at +119 units with the
   psili at −40 — the composite shifts the letter right to make room for a mark
   in front of it. 65 clusters do this. The table records `bx` (the base's own
   offset) and `aw` (precomposed advance minus base advance) so the overlay
   occupies the width the printed character would, and every mark offset is
   relative to where the base actually lands.
2. **Some outlines draw two marks at once.** `U+0385` sets its tonos BETWEEN
   the dialytika dots — which is exactly the placement VERIFY3 expected for
   `Ἀχαΐα` — and it cannot be rebuilt from the standalone glyphs: its dots sit
   93 units further apart than `U+00A8`'s and its accent is drawn 28 units
   narrower than `U+0384`'s. But its three ink pieces are horizontally
   disjoint, so the overlay prints the fused glyph three times at one offset
   and clips each copy to one vertical band (dot | accent | dot), each band
   coloured on its own. **What is painted is the printed glyph itself, in two
   colours.** 6 clusters use this.
3. **Component glyphs are unencoded.** The perispomeni component is
   `glyph00200` with no codepoint; it is resolved through `U+1FC0`, which is a
   one-component composite of it at (0,0). The script resolves every component
   this way and **exits 1, naming codepoints, if any cannot be** — proved by
   mutation: dropping `0x1FC0` from the component map produces
   `41 unresolved rows — refusing to emit a table with holes` and exit 1.

Regeneration is deterministic: two clean runs produce the same file
(`md5 11e71209d2d05a6d5e2941fe00019c7c`). `src/assets/fonts/NOTICE.md` now
carries the second build step and says plainly why skipping it drifts every
manually placed mark in the app.

### B2/B3. Rendering

`markOverlayParts()` looks the cluster's NFC form up in the table and returns
per-mark `{glyph, x, y, clip, red}` plus the base string and `bx`/`aw`. The
layout/slot classes no longer decide position; the CSS carries **no magic
numbers at all**, only mechanism.

The other half of the fix is the anchoring. Marks are now **zero-advance inline
boxes in normal flow, placed before the base**, so the browser seats them on the
same baseline at the same pen position the base glyph starts from and the
table's offsets are the only thing that moves them. SPEC3 positioned them
absolutely against the cluster's bottom edge, whose distance from the baseline
depends on `line-height` and on which metric the browser picks for the strut —
that is the "manually placed accents ride ever so slightly low" in VERIFY3, and
no offset table could have fixed it while that anchor stood.

SPEC3's rule table survives as a **fallback** for a mark stack with no
precomposed codepoint (`.rm-cluster.legacy`). It is not silent: `greek.js`
records every cluster that lands there in `markGeometryFallbacks` and warns
once per cluster, and the build guard below proves the shipped data never
reaches it.

### B4. Build guard

`scripts/check-content-shapes.mjs` now walks every `select` activity, resolves
each item's reddened cluster (explicit `redMarkCluster` or the drill's
`redFirstAccent`), and fails the build if the cluster is past the end of the
word, carries no mark, or has no row in the geometry table. Punctuation items
(apostrophe, colon, question) are exempt — those clusters ARE the mark and
redden whole.

Proved by mutation: putting `φαρισαῖος` back to `redMarkCluster: 6` yields

    FAIL: chapt-02.json.drill[2].items[14]: redMarkCluster 6 of "φαρισαῖος"
          is "α", which carries no mark — nothing would render red.

i.e. this guard would have caught the SPEC3 data bug at build time instead of
at the second device pass.

## 3. Mark geometry — the measurement

Acceptance is a pixel comparison, per the spec. For all 45 items of both
red-mark drills: screenshot the app's overlay rendering of the prompt, then
insert a twin button with the same classes and box holding the plain
precomposed string, screenshot that, and diff (`--mark-red` set to the ink
colour first, so hue cannot dominate). deviceScaleFactor 2, 430px viewport,
prompt at 40px.

| Result | Items |
| --- | --- |
| **pixel-identical (0 differing pixels)** | **19** |
| ≤ 0.15% differing pixels | 22 |
| 0.4 – 0.9% | 4 (`τοὔνομα`, `λέγω`, `προφήτης`, `ἀνθρώπων`) |
| any item where the difference is a displaced mark | **0** |

The four larger residuals are **not** mark placement. The diff image for
`τοὔνομα` is a thin outline around *every letter of the word*, including the
ones with no marks at all — the signature of a sub-pixel shift of the whole
string, which is what splitting a text run into separate inline boxes costs.
The control proves it: diffing the overlay against a precomposed twin whose
letters are ALSO split into per-cluster inline boxes collapses the residual.

| word | vs plain precomposed | vs split precomposed |
| --- | --- | --- |
| τοὔνομα | 1119 px | **358 px** |
| λέγω | 678 px | **69 px** |
| ῥῆμα | 165 px | **3 px** |

Cluster advance is exact everywhere: the overlay button and the precomposed
button measured the same width to within 0.005px on all 45 items.

Anchors called out in the PDF, all confirmed visually as well:

- **`πρὸς τὸν θεόν`** — the red grave on `πρὸς` now sits at the same height as
  the printed blue grave on `τὸν`. This was the PDF's own side-by-side.
- **`ῥῆμα`** — red circumflex at the printed height, ink rough breathing at
  the printed height (0 differing pixels vs the split control minus 3).
- **`ἆποστολος`** — 0 differing pixels. Red circumflex stacked over ink
  breathing.
- **`Ἀχαΐα` / `Ἠσαΐας`** — the two dots redden and the acute stays ink,
  **between the dots**, which is where the font puts it and where the PDF
  expected it. SPEC3's M4 rule (accent stacked ABOVE the dots) is retired: it
  was a deliberate departure from the font, and VERIFY3's "blue is the source
  of truth" overrules it.
- **`φαρισαῖος`** — reddens its circumflex (was nothing, per A4).
- **`καὶ θεός ἦν`**, **`δι᾽ αὐτοῦ`**, **`παρ᾽ αὐτῷ`**, **`λόγος·`**,
  **`ἀμήν;`**, **`ἐγώ`** — 0 differing pixels.

Answering the PDF's question directly: **there are 221 precomposed
accent/breathing/diaeresis combinations in this font** (Unicode's Greek and
Greek Extended blocks enumerate them; 12 more are macron/vrachy, which this
course does not teach). Yes, the placement varies by attached letter — that is
the whole finding. And no, mapping them is not a burden: the table is
*generated*, so chapters 3+ cost nothing, and any combination outside the 221
is caught by the build guard rather than shipped looking almost right.

## 4. C. The division exercise, rebuilt

The boxes, the arrows and the numbers are gone. The word is the control.

- **One type size for the pool (C1).** Every word is probed off-screen at a
  reference size; the widest sets the size and all 20 share it. Measured across
  the pool: **one distinct `--divide-size` value** — 55.9px at 390px, 44.1px at
  320px, 84px (the cap) at 768px. Stepping never resizes the type. This
  reverses SPEC3 D2 back to SPEC2's pool-static choice, which is what the PDF
  asks for.
- **Tap / drag / grab (C2).** A tap drops a divider in the nearest lane between
  two letters and starts dragging it; a tap where a divider already is grabs
  that one rather than adding a second; dragging snaps lane to lane. Asserted
  through the real UI: tap creates one, second tap on the same lane still one,
  drag moves it and it lands snapped on the target lane. An occupied lane is
  not a drop target — two dividers in one place would silently become one.
- **Feedback (C3).** Dividers snap discretely and are blue. `navigator.vibrate`
  fires a short bump per lane crossed, wrapped so it is a no-op where the API
  is absent (iOS Safari has none).
- **Clear Answer (C4).** New button. Wipes the dividers, the revealed answer
  line, and the stored result, so a word already answered can be tried again on
  a revisit — the one place `attemptsPerItem: 1` gives way, because the PDF
  asks for it by name. Attempts already counted stay counted. Asserted: wipes
  dividers, wipes the answer line, re-enables placing, and does the same on a
  revisited finished word.
- **Check Answer (C5).** Keeps the hyphenated answer line and marks the
  dividers in place. Asserted on `ἄγγελος` (answer `[2,4]`) with a divider in
  lane 3 only: `["correct","wrong","correct"]` — green on both correct lanes
  including the two the learner missed, red on the wrong one.
- **Instructions (C6)** rewritten in data. The one-syllable bar stays and still
  answers `καί` correctly; it is what distinguishes "one syllable" from "not
  answered yet" now that zero dividers is a meaningful answer.
- **Fit (C7).** 20/20 rows fit the rail at 320px, 390px and 768px; no row
  exceeds its rail; no horizontal overflow anywhere in either chapter.
- **Pointer handling (C8).** Pointer events with capture, `touch-action: none`
  on the word so a drag never scrolls the page, released on pointerup,
  pointercancel, navigation and unmount. Keyboard equivalent added (arrows move
  a focus lane, space toggles) because the word is now a control.

Score-line visibility (SPEC3 D1) still holds on the rebuilt component: hidden,
revealed on the first Score press, hidden on the second.

## 5. D. The remaining items

- **D1 (charts).** No RichContent change needed. With the ditto marks replaced
  the Rule 1/3/4 charts read as two-column charts again, and the two columns
  survive 320px (`grid-template-columns: 105px 105px`). Every row is tappable
  and blue, `ἄνθρωπε` included; clicking it requests `b_ex2_21.m4a`, confirmed
  by intercepting the network request rather than by reading the data back.
- **D2 (accent placement header).** **0 of 25 items now show no Greek** (was
  6). Nineteen inflected items are unchanged — root + gloss, label "Root Greek
  Word". The six whose root IS their answer form print the root with its accent
  stripped and its breathings kept, under the label "Greek Word (Unaccented)",
  because calling an unaccented string a root would not be true:
  `πρωτος (first, earlier)`, `ἐκεινος (that)`, `ἀνθρωπος (man)`, `ῥημα (word)`,
  `Φαρισαιος (Pharisee)`, `αὐτου (of him)`.

## 6. Verification

| Check | Result |
| --- | --- |
| `npm run verify` (shapes + build + lazy-chunk guard) | clean |
| chapter-1 chunk hash | **unchanged** (`chapt-01-8ZoFoXk9.js`) — chapter 1 re-downloads nothing |
| precache | 21 entries, 479.92 KiB (was 21 / 459.15) |
| main bundle | 249.85 kB (was 230.85) — the geometry table is 24 kB raw, ~4 kB over the wire |
| ch2 rail walk @320 / @768 | 20/20 + end dialog, both |
| ch1 regression walk @320 / @768 | 26/26 + end dialog, both |
| Console/page errors across all four walks | **0** |
| Horizontal overflow at 320 / 768 | none |
| Pending-verification placeholders | none |
| Unknown-block placeholders | none |
| Red-mark geometry, 45 items | 19 pixel-identical, 0 displaced marks |
| `mark-geometry.json` regenerates byte-identically | yes (md5 match over two clean runs) |
| Generator fails loudly on an unresolved component | proved by mutation, exit 1 with codepoints |
| Geometry build guard fails on a bad `redMarkCluster` | proved by mutation, exit 1 with the item path |

### Offline

Production preview, service worker installed and in control, then
`Network.emulateNetworkConditions({offline: true})`:

- SW `activated`, `navigator.serviceWorker.controller` present.
- Hard refresh directly onto an ACTIVITY route (`c2_drill_accent_rule`) renders
  under SW control: prompt present, red overlay present,
  `GreekTutor Serif: loaded`.
- **The face is the bundled one, proven by metrics not by name**: the same
  string measures 1280.7px in the `.greek` stack and 1107.1px forced to Times,
  offline.
- Chapter 2 rail offline: **20/20 + end dialog**. Chapter 1: **26/26 + end
  dialog**.
- Failed requests: **12, all `/audio/*`**; non-audio failures **none**. The 12
  console errors are those same 12 fetches. Pre-existing frozen-architecture
  behaviour (audio lives in IndexedDB after an explicit download; nothing had
  been downloaded in this profile), as SPEC3 §6 and XPATCH1 also recorded.

## 7. Judgement calls

1. **Item 1 was withdrawn, not skipped silently.** The PDF asked for 4s
   auto-advance on the Syllable Counting Drill for correct AND incorrect
   answers. That drill is `attemptsPerItem: "retry"`, so advancing on a wrong
   answer retires the retry loop and changes what completion means. Put to
   Nathanael with both readings; his answer was "leave this as is, ignore and
   skip point 1". Nothing was touched. The 900ms component default that
   produced the observed "1 sec" is documented in SPEC4 §0 for whenever it
   comes back — it is one shared constant.
2. **The root display was Nathanael's choice of three**, not mine: show it
   always (faithful, but six items answer themselves), show it unaccented when
   identical (chosen), or re-root the circumflex items (would have meant
   inventing content). Recorded because "print an unaccented word under a label
   that calls it a word, not a root" is a small departure from the original,
   which printed the accented root and did not mind that item 13 gave itself
   away.
3. **M4 now follows the font, reversing SPEC3's deliberate departure.** SPEC3
   set the accent above the diaeresis dots on the grounds that "this chapter
   teaches" it that way. The font sets it between them, VERIFY3 says blue is
   the source of truth, and between-the-dots is also what the PDF says it
   expected. Worth a look on device: it is the one anchor where the new
   behaviour differs from SPEC3's by design rather than by precision.
4. **The division word is no longer an audio tap.** It cannot be — a tap on it
   places a divider. It therefore renders in ink rather than the tappable blue,
   and Pronounce / Pronounce Each are the audio path. This is a new standing
   exception to directive 9, alongside Phonetic Reading, the speller tiles and
   the Review Letters chart, and it should be written into the directive rather
   than left as a component comment.
5. **Clear Answer re-opens a finalized item**, which `attemptsPerItem: 1`
   otherwise forbids and which SPEC2 deliberately prevented. The PDF asks for
   it explicitly. Attempts already spent are not rewound, so the score line
   cannot be farmed by clearing and re-checking.
6. **The 4 items with sub-pixel residual were left alone.** Eliminating them
   would mean not splitting the text run, which is the entire mechanism that
   makes one mark colourable. They are invisible at any size and the control
   test identifies them as run-splitting, not placement.
7. `package-lock.json` shows a two-line change from `npm install`: `idb` moved
   out of `dev`, matching `package.json`, where it has always been a real
   dependency. The lock was stale; left corrected.

## 8. Findings for the chat side

1. **`markGeometryFallbacks` is unexercised in the app.** The build guard
   proves the shipped data never reaches the legacy path, so the legacy CSS is
   structurally preserved but not rendered anywhere in chapters 1-2. The first
   chapter that ships an NFD-only mark stack will be its first real test.
2. **The geometry table is generated from the REGULAR weight only.** Every
   surface that renders a red overlay sets Greek at weight 400, so this is
   correct today. A future bold red-mark surface would need a second table —
   the composite offsets are not identical across the two instances.
3. **Residual `--` in rendered data fields, outside chapter 2** (unchanged from
   SPEC3 RESULTS §8.2, still pipeline-owned): `chapt-01.json.learn[7]
   .content[1].text`, `intro.json.learn[0].content[1].text` and `[3].text`,
   `lexicon-chapt01.json.exampleWords.anthropoi.gloss` and `.anthropois.gloss`.
4. **`playwright-core` as a devDependency** remains a carried nit; this round
   again drove the real UI from a scratchpad install rather than the repo.

## 9. VERIFY4 candidates

- **V4-1 Marks on device.** Walk both red-mark drills and look at
  `πρὸς τὸν θεόν`, `ῥῆμα`, `ἆποστολος`, `Ἀχαΐα`, `Ἠσαΐας`, `Μωϋσῆς`,
  `τοὔνομα`, `φαρισαῖος`. Every mark should now sit exactly where the same mark
  sits in printed text — compare the red one against a blue one in the same
  word wherever both exist. The offsets are font-derived, so a systematic error
  would show as the same shift everywhere rather than per-word noise. One photo
  per word that looks off.
- **V4-2 `Ἀχαΐα` specifically** (judgement call 3): the acute now sits between
  the diaeresis dots, where the font draws it, instead of above them. Is that
  what you wanted?
- **V4-3 The division exercise, on the real device.** This is a new
  interaction, and touch is the only place it can really be judged: does a tap
  land where you expect, does the drag feel like it snaps, is the haptic bump
  right (Android; iOS will be silent), do the dividers read clearly against the
  letters at both phone and iPad sizes? And does Clear Answer do what you
  wanted on a word you have already answered?
- **V4-4 Division type size.** One size across the pool means short words like
  `ἐγώ` now sit large and centred with space either side, and `φαρισαῖος` is
  the one that fills the rail. Confirm that reads better than the per-word
  sizing did.
- **V4-5 Accent placement header.** 25 items, all with Greek. On the six
  unaccented ones (`πρωτος`, `ἐκεινος`, `ἀνθρωπος`, `ῥημα`, `Φαρισαιος`,
  `αὐτου`) is the label "Greek Word (Unaccented)" clear, or does it want
  different wording?
- **V4-6 Rule 1/3/4 charts.** `man` on every ditto row, and `ἄνθρωπε` taps and
  plays its own clip (b_ex2_21) — worth a listen to confirm the recording is
  the vocative and not something else.
- **V4-7 Airplane mode.** Standard offline pass on both chapters.
