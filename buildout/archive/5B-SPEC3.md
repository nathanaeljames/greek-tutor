# 5B-SPEC3.md — chapter 2 closeout round (fonts, mark geometry, final nits)

PROCESS: standard v2 execution. Produce 5B-SPEC3-RESULTS-<MODEL>.md and
5B-SPEC3-BUILD-<MODEL>.md (exact diff, full thought/tool log, wall
time). If Fable is running this in Claude Code, the suffix is -FABLE.
Base: the accepted SPEC2 tree + XPATCH1. Inputs: this spec, REPLACEMENT
chapt-02.json + lexicon-chapt02.json (commit as-is), and
5B-VERIFY2-RESULTS.pdf (visual reference; JSON wins).

Item numbers match the VERIFY2 results PDF.

## A. Data commit

A1. Replace src/data/chapt-02.json and src/data/lexicon-chapt02.json.
    Data now carries: em-dash normalization (item 8), the merged and
    interleaved 25-item accent-placement pool with the banner retired
    (item 7 — extension items sit at positions 4/9/14/19/23, each
    keeps its own audio, completion = all 25 attempted), the anthrope
    stand-in clip (item 4), and the Nouns subheading restructure
    (item 9). No other data edits.

## B. THE FONT FIX (item 1 — root cause, fix once, fixes everywhere)

Diagnosis: `.greek` leads with Times New Roman, whose iOS perispomeni
glyph is a TILDE form. Surfaces that render rounded circumflexes are
drawing from a different glyph path. Every "tilde" sighting (Learn
Syllables charts, division letters, marking prompts, accent-placement
answer lines, non-target circumflexes in the accent rule drill) is
this one font stack.

B1. BUNDLE ONE SELF-HOSTED GREEK WEBFONT and put it first in the
    `.greek` stack (and `.isolated-mark.greek`). Requirement: rounded
    (inverted-breve style) perispomeni, full polytonic coverage
    (U+0370-03FF, U+1F00-1FFF), open license, subset to those ranges
    (pyftsubset -> woff2; expect tens of KB). Noto Serif is the
    recommended source; GFS Didot acceptable. `font-display: block`
    (a Greek-glyph flash of Times would be worse than a beat of
    invisibility). The chunk lands in the app shell and is precached
    automatically — verify it appears in the built sw.js precache and
    LOCK the offline story: airplane-mode Greek must render in the
    bundled font.
B2. Route ALL Greek through it: .greek-say spans, greekRows cells and
    syllables chunks, division letters, drill prompts, answer/correct-
    form lines, speller tiles (unify — the tile path may already use a
    different source; one font ends the split), isolated-mark spans,
    and the red-overlay glyphs (C1). Acceptance is visual: φαρισαῖος
    shows a ROUNDED circumflex in every one of those surfaces.
B3. Remove/demote Times New Roman so no Greek path can fall through
    to it. Keep it only as a last-resort fallback after the bundled
    font and SBL Greek.

## C. MARK GEOMETRY RULES (items 5, 6 — formalized, per Nathanael)

The red-mark overlay currently mixes overlay glyphs with base-rendered
marks, producing collisions on clusters carrying multiple marks. Adopt
the FULL-OVERLAY rule: when any mark in a cluster must be colored,
strip ALL marks from the base vowel and overlay-render the ENTIRE mark
set as spacing glyphs (bundled font), target mark in --mark-red, the
rest in ink. Position per this table (standard polytonic typography —
this is the standing rule set for all future chapters, not a visual
nudge-until-pretty):

  M1. Single accent (acute/grave/circumflex): centered above the
      vowel; above the SECOND vowel of a diphthong.
  M2. Breathing + acute/grave: SIDE BY SIDE above the vowel,
      breathing LEFT, accent RIGHT (e.g. ἄ, ἂ, ὕ).
  M3. Breathing + circumflex: STACKED, breathing BELOW, circumflex
      ABOVE (e.g. ἆ in ἆποστολος, ἦ in ἦν).
  M4. Diaeresis + acute/grave: accent ABOVE the diaeresis, centered
      (ΐ as in Ἀχαΐα). Diaeresis + circumflex: circumflex above dots.
  M5. Uppercase vowels: the mark set sits to the UPPER LEFT of
      (before) the capital, not above it (Ἀ, Ἠ, Ἐ).
  M6. Iota subscript stays beneath the base letter and is never
      overlaid (it is part of the base rendering; ᾧ keeps its
      subscript when the circumflex is overlaid).

Implement as a deterministic offset table (em-relative x/y per rule
case), not per-word tweaks. Record the table's constants in RESULTS —
it graduates to the standing docs for chapters 3+. Apply to BOTH red
consumers (accent rule drill redFirstAccent + marking recognition
redMarkCluster). Acceptance anchors from the PDF: ἀκούω (M2 target
acute, breathing untouched), ἀνθρώπου/ἄνθρωπον/ἀδελφός (M2),
ἆποστολος (M3 stacked, circumflex red, breathing ink), Ἀχαΐα (M4+M5),
καὶ θεός ἦν (M3 on the untargeted ἦ renders rounded via B1),
τοὔνομα (M2 coronis+acute side by side).

## D. Remaining interaction items

D1 (item 2). SCORE LINE VISIBILITY: hidden by default on every scored
    surface; first Score press reveals the live-updating line; Score
    then toggles it. Apply chapter-wide (drills + exercises).
D2 (item 3). DIVISION EXERCISE ERGONOMICS: the gap BUTTONS scale with
    the word — roughly 2x current size, filling available width with
    the letters (fat-finger targets are the point; original's
    arrow-pointer look stays). iPhone and iPad widths.
D3 (item 4). Rule 1 chart: ἄνθρωπε now carries the stand-in clip
    (data) — renders tappable like its siblings.
D4 (item 9). NEW RichContent block "subheading": own-line,
    left-aligned, heading-green, no hanging indent on following
    content. Used by the Nouns topic (data). Register the block in
    the RichContent dispatch; unknown-block guard stays loud.
D5 (item 8). Em dashes arrive via data; component work: none. Sweep
    UI-authored strings (labels, feedback wrappers) for any "--" and
    normalize — grep the src tree, not just data.

## E. Out of scope

Chapter 1 data/behavior; chapters 3+; audio architecture, SW config
beyond the font landing in the standard precache; loader; progress
backend; no data content edits beyond A1.

## F. Acceptance checklist

- [ ] npm run verify; ch2 rail walk (20) + ch1 regression (26); 0
      console errors; 320px + ~768px sweeps.
- [ ] Font: φαρισαῖος rounded-circumflex in Learn Syllables chart,
      division letters, marking prompt, accent-placement answer line,
      accent rule drill (target AND non-target positions), speller.
- [ ] Offline: airplane-equivalent preview run renders Greek in the
      bundled font (no fallback flash); font file present in the
      built precache manifest; precache count recorded in RESULTS.
- [ ] Mark geometry: the seven acceptance anchors in section C render
      per rules M1-M6 with zero collisions; only the target mark red.
- [ ] Accent placement: 25 items, no banner, extension items
      indistinguishable, per-item audio correct at shuffled
      positions (spot-check items 4 and 23), completion at 25.
- [ ] Score lines hidden until first Score press, then live; all
      scored surfaces.
- [ ] Division gap buttons ~2x, no clipping with φαρισαῖος at 320px.
- [ ] ἄνθρωπε tappable and plays.
- [ ] Nouns topic: three green subheadings, numbered 1-5 case lists.
- [ ] grep: no "--" anywhere in src (data or components).
- [ ] git diff shows only A1 wholesale replacements under src/data.

## G. Deliverables

RESULTS + BUILD per the process note. RESULTS must include: the font
chosen + subset ranges + file size, the mark-geometry offset table
(for promotion to the standing docs), and a short VERIFY3 candidate
list — expected to be tiny: font check on real iOS, mark anchors on
device, division ergonomics feel. If VERIFY3 comes back clean,
chapter 2 CLOSES and 5C begins.
