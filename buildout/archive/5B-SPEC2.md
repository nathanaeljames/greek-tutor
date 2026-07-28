# 5B-SPEC2.md — chapter 2 device-feedback corrections (round 2)

PROCESS NOTE (first spec under buildout process v2): BOTH implementer
models execute this spec in isolated repo copies. Each produces TWO
documents: 5B-SPEC2-RESULTS.md (the handoff: changes per module,
deviations with reasons, acceptance results, surprises) and
5B-SPEC2-BUILD.md containing (a) the EXACT git diff of this execution,
(b) the full thought-process/tool-usage log, (c) total wall-clock time.
If you can identify your model, suffix the filenames (-SOL / -OPUS);
otherwise leave unsuffixed. Base: the accepted 5B-patch tree (Opus base
+ merge ports). Inputs: this spec, the REPLACEMENT chapt-02.json
(commit as-is, no content edits), HANDOFF-5B-OPUS.md, and the
5B-feedback.pdf screenshots (visual reference; the JSON wins any
disagreement).

Item numbers below match Nathanael's feedback PDF; V-numbers match
5B-PATCH-MERGE-SPEC's VERIFY items. The delivered data file already
carries the data half of items 2,4,5,6,7,9,10,11,12,13,15,16 and V2/V3
— read its updated `_comment` first.

## A. Data commit

A1. Replace src/data/chapt-02.json with the delivered file. No other
    data changes. (lexicon/font-map unchanged this round.)

## B. Rendering corrections

B1 (items 4, 7, 8). ISOLATED MARK GLYPHS. The data now uses SPACING
    codepoints for marks shown outside words (U+1FBF smooth, U+1FFE
    rough, U+1FC0 circumflex, U+00B4 acute, U+0060 grave, U+00A8
    diaeresis, U+1FBD apostrophe). Render these in the GREEK display
    font at increased size (~1.3em) wherever they appear in parens —
    the original deliberately enlarges them. Verify the circumflex
    renders as the rounded perispomeni, not a tilde: the speller
    keyboard already renders it correctly, so reuse whatever
    font/glyph path the tiles use; if the body Greek font maps U+1FC0
    to a tilde form, route these isolated-mark spans through the tile
    font. Wrap "( x )" groups in a no-wrap span (fixes the Question
    Mark paren wrapping, item 8). Apply everywhere: 3 Accents,
    Breathing Marks, Coronis, Diaeresis, Review Marks, Accent
    Possibilities chart cells.

B2 (item 1). SYLLABLE NAMES POSITIONAL CHART: the three-column
    positional layout is not engaging (words render as plain links).
    Fix the positional-matrix detection so rows with an EMPTY leading
    chunk ("" for kosmos' antepenult) still qualify, render each chunk
    under its column header with clear column separation, and keep the
    whole word tappable (one tap target spanning its chunks, blue,
    plays the row audio).

B3 (item 5). ACCENT POSSIBILITIES CHART: renders TWICE on both
    devices — deduplicate (render once). Make it readable: real table
    cells, enlarged mark glyphs per B1, generous spacing; an inline
    SVG is acceptable if table styling cannot get there.

B4 (item 11). BLUE-MEANS-TAPPABLE SWEEP: defList terms and other
    non-tappable emphasis currently render blue (Grammar Review terms,
    hint headers, "Potential Placement:"). Change non-tappable
    emphasis to the agreed green (--accent-ink or the heading green);
    then sweep chapter 2 for ANY remaining blue text that is not a tap
    target and fix it. Blue is exclusively tappable (directive 8).

B5 (item 15). REVIEW MARKS: the data now groups rows under `title`
    fields. Render each greekRows `title` on its own line in the
    heading green, rows beneath with hanging indent (label left, Greek
    right, as the original's two-column rhythm).

B6 (item 16). BIBLIOGRAPHY: biblist items are now plain strings —
    confirm the page renders (the [object Object] regression came from
    object-form items). Add a render guard/test so a non-string
    biblist item fails loudly at build/verify time rather than
    rendering garbage.

## C. Interaction corrections

C1 (items 2, V2). SYLLABLE COUNTING DRILL: one-syllable bar REMOVED
    (data); kai answers via "1". Render the ui.buttons row (Previous /
    Next / Pronounce / Translate / Hint / Score) in the original's
    grouped arrangement. Translate toggles the gloss line under the
    word (original behavior). Hint opens the Three Syllable Rules
    (contentRef). Pronounce plays the item audio; "Pronounce Each
    Drill" checkbox defaults ON and is toggleable.

C2 (item 3). SYLLABLE DIVISION LAYOUT: restore the original's
    interaction shape at mobile scale — numbered buttons ABOVE the
    letters with a visible arrow/pointer between each letter pair;
    pressed state blue (button and arrow), confirmed-correct state
    green after Check Answer (red only on the feedback banner).
    SIZE: assume fat fingers. Scale the word and gap buttons to fill
    the available width based on the LONGEST word in the pool
    (breakpoint-static sizing, not per-word), with margins comparable
    to the buttons. Applies on iPhone AND iPad widths.

C3 (items 3, 10, 11, 14). LIVE SCORE: replace the modal score dialog
    behavior on the five scored chapter 2 surfaces with an inline
    score line that updates on every answer (the data sets
    ui.liveScore). Keep the Score button as a toggle for the line if
    trivial; the stale-dialog behavior must go.

C4 (item 6). ACCENT RULE DRILL: render ui.buttons (Previous / Next /
    Pronounce / Translate / Hint / Score); prompt word is tappable and
    plays its wired audio; Pronounce button works; Pronounce Each
    defaults ON and toggles; Translate toggles the gloss; Hint opens
    the inline hint content. FIRST ACCENT RED: with
    `redFirstAccent: true`, color the word's FIRST accent mark
    (U+0301/0300/0342 in NFD order) red using the same technique as
    C5. POLICY: `autoAdvanceOnIncorrect: false` — on a wrong answer
    reveal the correct form and WAIT for Next; on correct, 4s
    auto-advance stands.

C5 (item 10, V1). RED MARK TECHNIQUE — settle it definitively: color
    ONLY the mark, not the base letter. Approach: render the target
    cluster as base (ink) with the mark(s) removed, and overlay the
    mark as an absolutely-positioned SPACING glyph (B1 set) in red at
    the mark's position — this sidesteps the shaping problem Opus
    documented with inline combining-mark spans. Use a bright red
    close to the original (introduce --mark-red, approximately
    #e00000; also use it for C4). If the overlay technique fails on
    some cluster shapes, document exactly which and fall back to
    whole-cluster red for those only, reporting the split in RESULTS.
    Restore Previous / Next / Pronounce / Translate buttons here too.

C6 (item 9). MULTI-PART ROWS: greekRows rows may now carry `parts[]`
    (alternating {greek, audio} and {text}). Each Greek part is its
    own tap target with its own clip; text parts are inert ink.
    Used on Apostrophe (διά / αὐτοῦ / δι᾽ αὐτοῦ) and Coronis
    (καί / ἐγώ / κἀγώ).

C7 (item 11). ACCENT PLACEMENT: hint content restructured in data
    (own-line entries, em dashes) — render with hanging indent, green
    non-tappable header per B4. EXTENDED ITEMS: after item 20, render
    `extendedItems` beneath a clearly-labeled divider ("Extended
    practice — not in the original"); identical interaction; their
    results roll into the same score line but completion requires
    only the original 20.
    (V3 resolved: "Pronounce Word" plays the current item's clip —
    the same clip Pronounce Each plays. No separate root audio.)

C8 (items 12, 13). GRAMMAR REVIEW: data restructured (Identifying
    Verbs: six-term main defList + Tense/Aspect/Voice/Mood expanders
    in order; Nouns: case children numbered 1-5 across the two
    lists). Component work: none expected beyond B4 colors — confirm
    the restructure renders and flag any friction.

## D. Out of scope

- Chapter 1 behavior and data; chapters 3+.
- Audio architecture, SW, loader, progress backend.
- Any edit to data file CONTENT beyond committing A1.
- The debug card build-stamp question (answered separately; no work).

## E. Acceptance checklist

- [ ] npm run verify passes; chapt-01 chunk hash unchanged.
- [ ] Full ch2 rail walk (20 items) + ch1 regression walk, 0 console
      errors, at 320px AND a tablet width (~768px).
- [ ] Bibliography renders five entries.
- [ ] Isolated marks: smooth breathing visibly distinct from acute;
      circumflex rounded; enlarged; no paren wrap at 320px.
- [ ] Syllable Names chart: three aligned columns, words tappable.
- [ ] Accent Possibilities chart: rendered once, legible at 320px.
- [ ] Counting drill: no one-syllable bar; kai=1 accepted; Translate
      toggles gloss; live score updates.
- [ ] Division exercise: arrows between letters; blue pressed / green
      confirmed; longest word (φαρισαῖος) fills width at 320px with
      no clipping; pronounce-each defaults ON.
- [ ] Accent rule drill: word audio taps; first accent red; wrong
      answer waits for Next; correct auto-advances ~4s.
- [ ] Marking recognition: mark-only red in bright --mark-red (or
      documented per-cluster fallback list); buttons restored.
- [ ] Accent placement: hint layout; extended divider + 5 items;
      completion at 20.
- [ ] Blue sweep: computed-style check finds no non-tappable blue
      text anywhere in chapter 2.
- [ ] Zero data-content edits (git diff shows src/data/chapt-02.json
      replaced wholesale, nothing else under src/data).

## F. Deliverables

5B-SPEC2-RESULTS.md and 5B-SPEC2-BUILD.md per the process note. In
RESULTS, include a short "VERIFY2 candidates" list: anything you could
not prove in the harness (the red-overlay technique on device fonts,
the circumflex glyph on iOS, extended-items keep/drop) for Nathanael's
next device pass.
