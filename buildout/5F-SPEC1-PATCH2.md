# 5F-SPEC1-PATCH2.md — the formatting round: why text kept collapsing, and what changed

Nothing committed, nothing pushed. This addresses `5F-FEEDBACK2.pdf` (29
numbered items, Nathanael, 2026-08-09) against the chapters 6/7/8 build,
plus its standing complaint:

> "We are STILL losing formatting and collapsing basic text! ... Many of
> these pages should not have passed visual verification, so let's adjust
> as we need to."

As with PATCH1, the systemic answer comes first, because most of the 29
items are two defects wearing different clothes.

---

## The two root causes

### 1. The extraction pipeline turned the original's LINE breaks into paragraph blocks

Every "double line spacing" complaint (items 4, 14, 16, 18, 21, 22, 24,
26), every "missing space between paragraphs" complaint (items 7, 10, 11,
15, 24, 26), and the destroyed Number chart (item 21) trace to one
authoring error: chapters 6-8's teaching prose was extracted **one `para`
block per line of the original panel**. Chapter 7's Definition topic was
literally six consecutive paras reading "An adjective is a word used to
modify" / "a noun or pronoun. The adjective often" / ... Each line carried
the app's 10px paragraph margin, which:

- faked double line spacing on every affected page (the app's line
  spacing was never actually wrong — the "lines" were paragraphs);
- erased the original's real paragraph gaps (every gap was 10px, so a
  blank line in the original looked identical to a line break); and
- at the pathological end, collapsed the ch8 Number chart into ten lines
  of prose ("I we he they" as a paragraph).

A programmatic scan (consecutive paras where the earlier one ends
mid-sentence) found **17 affected runs across chapters 6-8** — every one
of the feedback's spacing items and three the feedback didn't name (ch6
Proclitics and both halves of ch8 Enclitics). All are now authored as the
original actually reads:

- a paragraph is ONE flowing `para` block;
- a blank line in the original is `gapBefore: true` on the following
  block (one new CSS rule, ~one line-height of air);
- hard line breaks inside a worked example live as `\n` inside ONE block
  (the existing example-block mechanism), with `flush: true` where the
  original does not indent the example (ch8 Definition).

**The guard that would have caught it** now exists:
`check-content-shapes.mjs` fails the build when a para ends without
terminal punctuation and the next para continues it in lowercase — the
signature of a line-split paragraph. It passes chapters 1-5 untouched and
would have failed chapters 6-8's first build in seventeen places.

### 2. Verification kept accepting "renders sensibly" where the bar is "matches the original"

The Prepositions Chart failed twice because both attempts *reconstructed*
(first by hand-placed points, then by polar geometry) instead of tracing.
D-34 even logged "this environment has no tool that extracts exact
coordinates from a scanned page" — which turned out to be false: `pip
install pymupdf`, render ch6railwalk p6 at 300 dpi, crop the panel, draw
a coordinate grid on it, and read the numbers off. The claim was never
tested. The same failure of method let the position pages ship left-flush
where the original centres, and let ditto marks and ':'-columns collapse
into prose. ONBOARD-SOL §7 now states the bar explicitly: **hold the
ported page next to the original panel; for diagrams, overlay them.**

---

## What changed, by file

| File | What |
| --- | --- |
| `src/components/PrepositionsChart.svelte` | Rebuilt as a TRACE of ch6railwalk p6 (item 1): every coordinate measured off a 300-dpi grid-overlaid crop; the `arrow` data field is ignored (the original contradicts it — μετά has no arrow). Both Learn and Review surfaces (same component). |
| `src/components/RichContent.svelte` | `gapBefore` / `flush` / `align:"center"` on para; `itemGap` + per-item `exampleLines` on numbered lists (items 5/6); `centered`, `headerUnderline`, `pairedGutter` on greekRows; parts-rows with a gloss keep the two-column grid (items 2/3); verseExamples rows no longer need `greek2` to take the verse layout, and a two-line verse may carry `audio2` for a second per-line clip (item 9). Local splitTaps moved to `lib/greek.js`. |
| `src/components/Paradigm.svelte` | Item 27's fixed-slot nav: More/Back in their own `.pg-nav` row — Back always left, More always right, neither ever moves; Say Whole sits alone on its line above. `switchLabels` host override + per-chart `switchLabel` (item 12). `noteTaps` makes Greek in a chart note tappable (item 25). |
| `src/components/SelectActivity.svelte` | Multi-page Hint modal (`ui.hintPages`): pages by `hintRef` (an N-chart stack flattens to N pages), `contentRef` (a Learn topic's content by id) or inline `content`; nav row uses the same fixed-slot model. `hintSwitchLabels` passthrough. |
| `src/lib/content.js` | `resolveHintRef` also resolves a Review activity's bare `paradigm` object by id; new `resolveContentById` for hint pages that reuse a Learn topic. |
| `src/lib/greek.js` | `splitTaps` / `standaloneIndexOf` moved here (shared by RichContent + Paradigm — two copies would be two places for the tap contract to disagree). |
| `src/app.css` | Traced stroke/type sizes for the prep chart; the `gapBefore`/`flush`/`center`/example-lines/`item-gap`/`centered`/`head-underline`/`paired-gutter`/`.pg-nav` rules; gloss-only parts-row full-width rule narrowed to `:not(.has-gloss)`. |
| `src/data/chapt-06.json` | Elision '=' dropped (D-35); Proclitics paragraphs merged with original gaps; scripture drill audio remap (item 17); μετά arrow nulled. |
| `src/data/chapt-07.json` | Every learn topic restructured (items 4-11, 14-16); Adjective Case Drill hint labels (item 12); Adjective Translation Drill two-page hint (item 13). |
| `src/data/chapt-08.json` | Definition/Number/Introduction/Enclitics/Examples/Third-person-intro restructured (items 18, 21-26); the broken-in-the-original More page appended to the Introduction (D-37); first-person note taps (item 25); Aὐτός drill hint gains the Three Uses page (item 28). |
| `scripts/check-content-shapes.mjs` | The line-split-paragraph guard (above). |
| `scripts/ui-behavior.mjs` | §2.1 asserts the traced 9-stroke linework (the old assertion counted data `arrow` fields the original contradicts). |
| `buildout/DIVERGENCE-LOG.md` | D-34 resolved (the chart is now a trace); D-35 (ditto marks/'=' replaced by words); D-36 (bold-not-underlined lead-ins, items 5/19/20); D-37 (Personal Pronouns intro shows its second page permanently); D-38 (hint paging + fixed-slot nav model). |
| `buildout/ONBOARD-SOL.md` | §7: the match-the-original bar (side-by-side / stencil overlay), and the line-breaks-are-not-paragraphs rule. |

---

## Item-by-item

**1 — Prepositions Chart.** Traced, not reconstructed. ch6railwalk p6
rendered at 300 dpi, panel cropped (715×584), a 50px coordinate grid
drawn over it, and every label baseline, arrow endpoint, the circle and
the underline read off numerically into the SVG (viewBox IS the crop's
pixel space, so stroke widths and font sizes are the original's own
measurements). Facts the reconstructions had invented away, now correct:
μετά has **no arrow**; εἰς's arrow penetrates INSIDE the circle ("into");
ἐκ's starts inside and exits ("out of"); πρός's stops at the boundary
("to"); ἀπό's lies wholly outside pointing away ("from"); διά crosses
corner-to-corner; κατά is a short diagonal parallel to διά plus a
separate downward arrowhead; ἐπί/upon carries one thick underline with
its gloss BESIDE it (as μετά and διά also set theirs). **The acceptance
test the feedback demanded ran and passed**: original crop composited at
50% over a screenshot of the rebuilt SVG —
`buildout/screenshots/5f-patch2/prep-overlay.png` — reads as a stencil.
Labels stay tappable (each plays its clip; the feedback allowed a plain
picture, and keeping the taps costs the geometry nothing). The Review
chart is the same component and changed with it.

**2, 3 — Elision / Compounds columns.** The '=' before "through me" is
gone (D-35). A parts row that carries a translation ("διά + βλέπω |
through + I see") now keeps the table's two-column grid, so its gloss
sits in the same column as "I see clearly" directly beneath it; only the
gloss-less bracket derivations span the full row. This *narrows* PATCH1's
fix (which made every parts row full-width and pushed the gloss inline)
to just the rows that needed it.

**4 — ch7 Definition.** One flowing paragraph; the example block is
flush left with a blank line before it and its middle "Answers:" line
indented — the original's own indentation scheme (ch7railwalk p1).

**5, 6 — 3 Uses / Examples.** Worked examples moved onto their OWN lines
(`exampleLines`), indented deeper than the item text, wrapped lines
hanging under the example. The Examples page separates its three items
with blank lines (`itemGap`) as the original does; 3 Uses runs
contiguously as ITS original does. The not-underlined lead-ins are now
recorded as deliberate: D-36.

**7 — ch7 Greek Adjectives Introduction.** Three paragraphs with the
original's blank lines; the 2-1-2 declension lines sit indented on their
own lines under their lead sentence (ch7railwalk p2).

**8, 9, 10, 11 — the four position pages.** The centred banner line, the
Greek/English pairs as an aligned two-column grid with the translation
DUPLICATED in place of the ditto (D-35), and each scripture example as a
centred Greek line with its translation and reference beneath — blank
lines between every segment. Item 9's two-line verses (καὶ ὁ ἄνθρωπος
οὗτος / δίκαιος) keep a separate tap per line because the original
recorded a separate clip per line (`audio2`) — no clip is orphaned.

**12 — Plural/Singular hint buttons.** The Adjective Case Drill's Hint
pages label the pair "Plural"/"Singular" (`hintSwitchLabels`, drill-hint
scoped). The Learn topic drawing the same charts keeps More/Back, because
that is what the ORIGINAL's learn page uses (ch7railwalk p2).

**13 — two-page Adjective Translation hint.** Page 1 is the full
adjective paradigm (the Review chart: lemma line, Singular and Plural
bands); page 2 is the existing Attributive & Predicate Positions summary,
now under its original title. More on page 1, Back on page 2, fixed
slots.

**14, 15, 16 — εἰμί pages.** Introduction: two paragraphs, blank line
between. Examples: two centred verse pairs with a blank line between.
οὐ/οὐκ/οὐχ: the five split lines are one contiguous block in the original
and are now one flowing paragraph.

**17 — ch6 Scripture Memory Drill audio.** Root cause found: the drill
de-duplicates Jn 1:1's twelve words to nine items, but the clips were
numbered sequentially sm1-sm9 — so after the repeated ὁ/λόγος/ἦν dropped
out, πρός inherited ὁ's clip (sm7), τόν inherited λόγος's (sm8) and θεόν
inherited ἦν's (sm9): exactly the three swaps reported. Re-keyed to
sm10/sm11/sm12 — the words' own clips, the same ids the Review page (which
the feedback confirms is correct) already uses. All three files exist in
`public/audio/chapt_6/`.

**18 — ch8 Definition.** One paragraph; the Zach/Elliott example pair
follows a blank line, flush left as the original sets it.

**19, 20 — recorded, not "corrected".** D-36 covers Types of Pronouns'
six labels and Case's Subjective/Possessive/Objective alongside item 5's
adjective labels.

**21 — the Number chart.** Rebuilt as a real chart: underlined
Singular/Plural headers, the first-person table beside the third-person
table with a narrow gutter between the pairs, the bottom her/them row
only in the right table — after one flowing intro paragraph and a blank
line.

**22 — Personal Pronouns Introduction.** Merged to the original's three
paragraphs with blank lines — plus the second page the original's broken
More button hides ("Since the nominative is indicated..." and the
emphatic-forms paragraph), appended permanently per the feedback's
instruction. Logged as D-37 so a future pass doesn't take the extra
content for an invention.

**23 — Examples centred.** `centered` on the verse-examples block.

**24 — Enclitics.** Both line-split runs merged; blank lines before
"Enclitics are sometimes accented:", the double-accent paragraph, the
worked examples and the "Finally..." line — the original's own rhythm
across its two More/Back pages.

**25 — tappable emphatic forms.** ἐμοῦ, ἐμοί, ἐμέ in the First Person
Paradigm's note each play their own clip (`noteTaps`; ids
`chapt_8_h_1gse/1dse/1ase`, the same clips the case drill uses for those
forms). Works in the Learn topic and the drill Hint — same block, same
renderer.

**26 — Third Person introduction.** Two paragraphs, blank line between.

**27 — the fixed-slot nav model.** Paradigm's More/Back moved out of the
action row into a two-slot grid row: Say Whole alone on its line, Back
always the left slot, More always the right, the empty slot still
occupying its cell — so paging a stack never moves a button. Applies
everywhere Paradigm renders (learn topics, Review pages, drill hints)
and to the new modal-level hint pager.

**28 — the missing Three Uses hint page.** The Aὐτός Translation Drill's
Hint is now four pages: Masculine, Feminine, Neuter (one chart per page,
paged by the modal), then the Three Uses teaching page — resolved from
the Learn topic by id (`contentRef`), so the hint can never drift from
the page it reuses.

**29 — Personal Pronoun Case Drill.** Its hint keeps the in-Paradigm
More/Back stack, which now uses the same fixed-slot row as everything
else — the Review 3rd Person layout the feedback pointed to, everywhere.

**30 — "[nothing yet]"** in the feedback as received.

---

## Standing rules adopted from this feedback (recorded for future passes)

- **Translation lists default to a grid/column layout** (items 2/3):
  Greek in one column, English in the other, glosses aligned down the
  page; if a pair won't fit two columns, English goes beneath the Greek —
  and a repeated translation is duplicated, never ditto'd (D-35).
- **Line spacing is uniform app-wide** (item 4). Paragraph gaps are
  authored (`gapBefore`), never faked with paragraph-per-line authoring —
  and the build now fails on the fake.
- **More/Back move as little as possible** (item 27): fixed slots, Back
  left, More right, on every paged surface.

## Verification

| | |
| --- | --- |
| `npm run verify` (shapes + build + lazy-chunk) | PASS, including the new line-split guard across all 8 chapters |
| Prepositions Chart overlay | `prep-overlay.png`: original at 50% over the rebuilt SVG — stencil match on circle, all nine strokes, all ten labels |
| `ui-behavior.mjs` | full suite re-run after the changes (see run log note below) |
| `ui-modals.mjs` | re-run (hint modals paged and unpaged) |
| `ui-walk.mjs --chapters=chapt_6,chapt_7,chapt_8` | full rewalk |
| Page-by-page screenshots | `buildout/screenshots/5f-patch2/` — every restructured page, every hint page, every paradigm page, captured AFTER the final build and each compared against its original panel |

Two defects were caught by this round's own screenshot-against-original
pass before any harness ran, which is the method working: the first
verse-example build fell through to the two-column layout (single-line
rows lacked the `greek2` key the branch condition required), and the
Compounds gloss still wrapped under its equation (the PATCH1 full-width
parts-row rule needed narrowing, not deleting). Both fixed, rebuilt,
re-shot.
