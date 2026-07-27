# 5B-SPEC4.md — chapter 2 round 4 (division exercise rebuild, exact mark geometry, chart nits)

PROCESS: this round is run by Fable in Claude Code as BOTH pipeline and
implementer — there is no separate data delivery, so section A authors
the data edits itself and records them exactly. Deliverables:
5B-SPEC4-RESULTS.md (this round's handoff). No BUILD doc: there is no
competing implementer to grade against. Nothing is pushed; commits only
if code organization demands one.

Base: the accepted SPEC3 tree (bundled GreekTutor Serif, full-overlay
mark rendering, per-word division sizing, score-line visibility).
Input: 5B-VERIFY3-RESULTS.pdf. Item numbers below match that PDF.

## 0. Item 1 — WITHDRAWN

PDF item 1 asked for 4s auto-advance on the Syllable Counting Drill for
both correct and incorrect answers, and a chapter-wide sweep for any
auto-advance under 4s. Raised during spec authoring that the drill is
`attemptsPerItem: "retry"` and that advancing on a wrong answer retires
the retry loop; Nathanael's answer: **"leave this as is, ignore and skip
point 1."** No timing changes this round. The facts, for whenever it
comes back: the four chapter-2 one-attempt drills and both exercises
carry `autoAdvanceMs: 4000` in data; the Syllable Counting Drill carries
`null`; chapter 1 carries no `answerPolicy` at all. All three of those
fall through to a **900ms** component default in `SelectActivity`,
`DivideActivity`, `PlaceAccentActivity` and `SpellActivity` — that 900
is the "1 sec" the PDF saw, and one shared constant would move all of
them.

## A. Data edits (authored here, recorded exactly)

A1 (item 2). `c2_learn_accents` -> topic `rules6`:
    - Rule 1 chart, `ἄνθρωπε`: audio `chapt_2_a_voc3` (the stand-in
      base-form clip) -> **`chapt_2_b_ex2_21`**. The 21st b_ex2 file was
      recorded in SPEC2 as unreferenced and "likely the root recitation";
      the VERIFY3 pass identifies it as the vocative. Drop the
      `_note` about the stand-in and record the identification instead.
      Mirror the audio onto `lexicon-chapt02.json exampleWords.anthrope`,
      which still says the row has no dedicated audio.
    - Rules 1, 3 and 4 charts: the original's `"` is an idem./ibid.
      ditto mark under a chart column, and flattening the chart into
      rows turned it into a literal `"` opening each gloss. Replace
      every such `"` with the translation **`man`**, and replace Rule
      3's first-row `Base noun form` with `man` as well. Parenthetical
      grammar notes are untouched. Nine glosses change.

A2 (item 3). `c2_ex_accent_placement`: the six items whose `root`
    equals their `answerForm` (item 13 `ἄνθρωπος`, plus the five merged
    circumflex items `πρῶτος`, `ἐκεῖνος`, `ῥῆμα`, `Φαρισαῖος`, `αὐτοῦ`)
    render no Greek at all today. Data carries the roots already; the
    fix is in the component (D2). No data edit — but the `ui.header`
    and the component's `Word Meaning` fallback are covered there.

A3 (item 4). `c2_ex_syllable_division`: `instructions` rewritten for
    the new interaction (D3), and `ui.buttons` gains `Clear Answer`.
    The 20 items and their `division[]` arrays are untouched.

A4 (bug carried from SPEC3 RESULTS §8.1). `c2_drill_marking_recognition`,
    the `φαρισαῖος` item: `redMarkCluster: 6` points at a bare α; the
    circumflex is on cluster **7** (φ α ρ ι σ α ῖ ο ς). XPATCH1's
    "absent signal beats false signal" rule renders that item with
    nothing red, so the drill asks "which mark is red?" with no red on
    the page. In scope because it is one of item 5's own anchors.

No other data edits. `git diff` under `src/data/` must show only A1,
A3 and A4.

## B. THE MARK GEOMETRY REBUILD (item 5 — the round's centre)

Diagnosis, and it is Nathanael's own: **the manually placed marks are
positioned by a hand-written rule table (M1-M6, six CSS rows), while the
printed text is positioned by the font.** The font does not use six
rules. It carries a distinct pair of offsets for every one of the ~239
precomposed polytonic characters, and those offsets vary by base letter
and by mark combination — which is exactly the "rides slightly low",
"slightly right of the iota", "not centred in the diaeresis" family of
errors in the PDF. Six constants cannot express 239 positions.

The PDF's instruction is the fix: *"produce the word with the accent
using the actual text, and then move the manually positioned accents to
perfectly overlap that."* Blue is the source of truth. Implement it
literally, and answer the PDF's own question (how many permutations, is
it feasible) with a number rather than an estimate.

B1. GENERATE THE TABLE FROM THE FONT. New
    `scripts/make-mark-geometry.py` reads the bundled
    `greektutor-serif-regular.woff2` and emits a committed
    `src/lib/mark-geometry.json`. For every precomposed Greek codepoint
    whose NFD is base + accent/breathing/diaeresis marks: flatten the
    glyph's composite components recursively, subtract the base
    component, and record each mark component's (dx, dy) **in em,
    relative to the base component's origin**, together with the
    spacing codepoint that draws that same component in isolation.
    Also record the base component's own x-offset and the precomposed
    advance, so a cluster whose composite shifts its base (the capitals
    do: `Ἐ` = E at +119 with the psili at -40) reproduces the printed
    advance rather than only the relative geometry.
    - Fused mark glyphs (U+0385 dialytika-tonos, U+1FED dialytika-varia)
      are single outlines and must be split into their two renderable
      spacing glyphs by ink geometry, so the Marking Recognition drill
      can redden the dots of `ΐ` while its accent stays ink. Record how
      the split is derived and assert the reassembled ink box matches.
    - Macron and breve (vrachy) combinations are not marks this course
      teaches; skip them rather than emit unresolved rows.
    - The script must FAIL loudly, naming codepoints, on any component
      it cannot resolve to a renderable glyph. Silent gaps are how the
      current table got away with being wrong.
    - Regenerating is part of the font's build story: note it in
      `src/assets/fonts/NOTICE.md`.

B2. RENDER FROM THE TABLE, NOT FROM RULES. `markOverlayParts()` looks
    the cluster's NFC form up in the table and returns per-mark
    `{glyph, mark, x, y, red}` plus the cluster's base string and
    advance metrics. The M1-M6 layout/slot classes stop deciding
    position. Keep the old rule table alive as a FALLBACK for a cluster
    with no table entry (an NFD-only combination), and make that
    fallback observable rather than silent.

B3. ANCHOR THE OVERLAY TO THE TEXT BASELINE, NOT TO A BOX EDGE. The
    present overlay is absolutely positioned against the cluster's
    bottom edge, so its vertical origin depends on line-height and on
    which font metric the browser picks for the strut — the mechanism
    behind "rides ever so slightly low". Marks must ride the same
    baseline the base glyph does, by construction: zero-advance inline
    boxes in normal flow, offset only by the table's em values. No
    `bottom`, no `left: 50%`, no half-width centring correction.

B4. Both red consumers (Accent Rule `redFirstAccent`, Marking
    Recognition `redMarkCluster`) go through the one path. The full-
    overlay rule from SPEC3 stands: when any mark in a cluster is
    coloured, ALL of that cluster's marks come off the base and are
    drawn from the table — target in `--mark-red`, the rest in ink.

Acceptance is a PIXEL COMPARISON, not an opinion: for each anchor,
render the precomposed cluster and the overlay cluster in the same face
at the same size and diff the mark ink boxes. Anchors, all from the PDF:
`πρὸς τὸν θεόν` (grave, cluster 3 — the PDF's own side-by-side against
the printed grave in `τὸν`), `ἆποστολος` and `ῥῆμα` (breathing +
circumflex, and the breathing alone), `Ἀχαΐα` and `Ἠσαΐας` (diaeresis
under an accent), `καὶ θεός ἦν`, `ἀκούω`, `ἀδελφὸς`, `τοὔνομα`,
`Μωϋσῆς`, `κἀγώ`, `παρ᾽ αὐτῷ`, `φαρισαῖος` (after A4). RESULTS records
the residual offset per anchor in em; anything above ~0.005em is a bug,
not a rounding artefact.

RESULTS must also answer the PDF's question directly: how many
combinations exist, whether the placement varies by attached letter (it
does), and what maintaining this costs for chapters 3+ (it costs
nothing — the table is generated).

## C. THE DIVISION EXERCISE REBUILD (item 4)

The PDF strikes out its own boxes-and-arrows feedback and replaces it:
"Fuck it, I'm completely re-imagining this exercise." Build the new one;
the boxes, the arrows and the numbers all go.

C1. ONE FONT SIZE FOR THE POOL. Scale the LONGEST word (`φαρισαῖος`) to
    the available width and set every other word in the exercise to that
    same size. No per-word resizing — stepping through the pool must not
    change the type size. This reverses SPEC3 D2 (which reversed SPEC2
    C2); the PDF is explicit and it is the last word.

C2. THE WORD IS THE CONTROL SURFACE. On load the learner sees only the
    word. Tapping anywhere on it places a divider (a cursor) at the
    nearest inter-letter position and begins dragging it. Tapping
    somewhere the nearest position is already occupied grabs THAT
    divider instead of creating a second one there. Any number of
    dividers, created the same way. Dragging snaps between letters.

C3. FEEDBACK WHILE DRAGGING. Visual: the divider snaps, discretely,
    from gap to gap — never a free-floating line. Secondary: a haptic
    bump per letter crossed (`navigator.vibrate`; Android only in
    practice, must degrade silently on iOS and be safe when the API is
    absent). Dividers are blue — they are the learner's answer, and
    blue is this app's tappable colour (directive 8).

C4. CLEAR ANSWER. A new button. It wipes every divider from the current
    word, clears the revealed answer line, and resets the attempt — on
    a fresh word and on a previously answered one alike, so revisiting a
    finished word and pressing Clear Answer lets the learner try it
    again. This is a deliberate departure from `attemptsPerItem: 1`'s
    "a finalized item stays finalized"; the PDF asks for it by name.
    Score history already spent is NOT rewound.

C5. CHECK ANSWER. Keeps the hyphenated answer line, and additionally
    marks up the dividers in place: every CORRECT division position
    shows a green divider (including positions the learner missed), and
    every divider the learner placed in a wrong position turns red.

C6. Instructions rewritten to describe this interaction (data, A3).
    The "Click Here If There Is Only One Syllable" bar stays — it is the
    original's, and it is what distinguishes "this word is one syllable"
    from "I have not answered yet" now that zero dividers is a
    meaningful answer.

C7. Sizing must still FIT: `overflow-x` is hidden app-wide, so a row
    that is too wide is deleted, not scrolled. Test at 320px and ~768px.
    Dividers need visible room between adjacent glyphs; whatever
    letter-spacing that costs is part of the fit budget.

C8. Pointer handling is pointer-events based (mouse, touch, pen), must
    not scroll the page while dragging, and must release cleanly on
    pointercancel and on unmount.

## D. Remaining interaction items

D1 (item 2, render side). The Rule 1/3/4 charts are `greekRows` blocks
    with no `columns`, so they render as label/gloss rows. With the
    ditto marks replaced by `man` (A1) the chart reads as a chart again.
    Confirm no RichContent change is needed; if the two-column reading
    is lost at 320px, fix it there rather than in data.

D2 (item 3). `PlaceAccentActivity` always shows a Greek word in the
    header. When `root` differs from `answerForm` (the 19 inflected
    items) nothing changes. When they are identical, print the root
    with its ACCENTS stripped and its breathings kept — Nathanael's
    choice from three options; it puts Greek on every item without
    printing the answer above the slots. The header label stays "Root
    Greek Word" in the first case; the identical case needs a label
    that is true of what it shows. Gloss placement unchanged.

## E. Out of scope

Chapter 1 data and behaviour; chapters 3+; audio architecture; SW
config; loader; progress backend; auto-advance timing (section 0); any
data edit beyond A1/A3/A4.

## F. Acceptance checklist

- [ ] `npm run verify`; ch2 rail walk (20) + ch1 regression (26); 0
      console errors; 320px and ~768px sweeps.
- [ ] `ἄνθρωπε` in the Rule 1 chart plays `b_ex2_21`.
- [ ] Rules 1/3/4 charts read `man` on every ditto row; no `"` and no
      `Base noun form` anywhere in the chapter data.
- [ ] Accent placement: a Greek word in the header on all 25 items;
      on the six identical-root items it is unaccented and the slots do
      not match it character-for-character in accent.
- [ ] Mark geometry: every anchor in section B overlays its printed
      form within 0.005em, measured, both axes. Only the target mark is
      red. `φαρισαῖος` reddens its circumflex.
- [ ] `mark-geometry.json` regenerates byte-identically from a clean
      run of the script; the script fails loudly on an unresolved
      component (prove it by mutation).
- [ ] Division exercise: one type size across all 20 words; tap creates,
      tap-on-divider grabs, drag snaps, Clear Answer resets a finished
      word, Check Answer shows green correct + red wrong dividers.
- [ ] Division exercise fits the rail at 320px on `φαρισαῖος` and at
      768px on `ἐγώ`.
- [ ] Offline: production preview under SW control, airplane-equivalent,
      both rails; precache count recorded.
- [ ] `git diff` under `src/data/` shows only A1, A3, A4.

## G. Deliverables

`5B-SPEC4-RESULTS.md`, mirroring SPEC3-RESULTS: what landed per section,
the measured geometry table (and its generator), verification tables,
judgement calls, findings for the chat side, and a VERIFY4 candidate
list. Chapter 2 closes on a clean VERIFY4.
