# 5B-PATCH-SPEC.md — chapter 2 data patch + answer-flow alignment

Input: HANDOFF-5B-SOL.md (accepted base + merge) and three REPLACEMENT
data files delivered by the chat pipeline: chapt-02.json,
lexicon-chapt02.json, font-map.json. Output: append §9 to
HANDOFF-5B-SOL.md with acceptance results.

The data files are AUTHORITATIVE and complete — every `_verify` gap is
resolved from the completed DOSBox verification pass. Commit them
as-is; do not edit their content. A PDF of original-app screenshots
accompanies this spec as VISUAL REFERENCE ONLY (layout, color
behavior); where the PDF and the JSON disagree, the JSON wins — it
encodes deliberate corrections Nathanael authorized (correctness-first
scoring, spellfixes, timing).

## 1. What the data patch changes (context for wiring)

- SEQUENCE reordered (DOSBox-verified): Accent Placement now FOLLOWS
  Marking Recognition; QR Vocab leads the quick reviews.
- All four static drills now carry COMPLETE items + answers:
  syllable counting (20), accent rule (20, with `correctForm` per
  item), marking recognition (25, with `redMarkCluster`), part of
  speech (29, with `underline`).
- Syllable Division: 20 items = the vocabulary words, each with
  `greek`, `division[]` (1-based gap indices between grapheme
  clusters, matching the existing component convention), `audio`,
  and kai flagged `oneSyllable`.
- Accent Placement: COMPLETE ITEM REPLACEMENT — two root words
  (Βαπτίζω x10, ἄνθρωπος x10), each item = {root, rootGloss,
  answerForm, ref, audio}. `accentTypes` is now ["Acute",
  "Circumflex"] (the original offers NO grave button).
- Learn pages: popup contents filled (syllable example charts,
  breathing popups, diaeresis rows), Background moved to the Accents
  intro topic, Tense/Aspect moved to Identifying Verbs, an Accent
  Possibilities chart added, feedback pools replaced with the
  observed live sets.

## 2. Component changes required (small, enumerated)

2a. ONE-ATTEMPT ANSWER FLOW. Activities now carry `answerPolicy`:
    `{attemptsPerItem: 1, autoAdvanceMs: 4000, reveal*: true}` (the
    four static drills + both new exercises) or
    `{attemptsPerItem: "retry", autoAdvanceMs: null}` (syllable
    counting keeps retry; ch1 vocab drills untouched). Where
    attemptsPerItem is 1: Check Answer (or the option tap, for the
    tap-to-answer drills) finalizes the item right or wrong, the
    correct form/answer is revealed (`correctForm` / `answerForm` /
    divided form / correct option highlight), and the activity
    auto-advances after `autoAdvanceMs` (cancel the timer on manual
    Previous/Next and on unmount — the existing merge-patch-5 timer
    pattern, retimed from 900ms to the policy value; this timing is
    DOSBox-verified ~4s and Nathanael-approved, superseding the 900ms
    fidelity guess). COMPLETION for one-attempt activities = all
    items ATTEMPTED (not all-correct); score stays correct/attempted.
2b. SELECTION COLORS (Nathanael directive, VERIFY E1/E2): a selected
    guess renders BLUE; after Check Answer, correct placements/options
    render GREEN; red appears only on the incorrect-feedback banner.
    Applies to divide gaps, placeAccent type+position, the one-
    syllable bar, and static-drill options. Blue here is a selection
    state on controls, not a Greek-tap affordance — keep `.greek-say`
    semantics untouched on displayed Greek.
3c. ONE-SYLLABLE BAR (divide + syllable counting): render the
    `oneSyllableButton` label as a full-width bar under the word (per
    the original layout); selecting it clears/locks gap selections and
    answers `division: []` / count 1.
2d. PLACE-ACCENT HEADER: items now show `root` + `rootGloss` in the
    "Root Greek Word" header and the UNACCENTED inflected form
    (derived by stripping U+0301/0300/0342 from `answerForm`, existing
    helper) in the position row; render `ref` near the checkbox row
    (original shows e.g. "Acts 22:16" bottom-right). Accent buttons
    from `accentTypes` only.
2e. MARKING RECOGNITION RED MARK: render the prompt with the mark at
    `redMarkCluster` (1-based grapheme cluster) colored red — that IS
    the question. Implementation: split clusters with the existing
    splitter; within the target cluster, color the combining mark(s)
    red (NFD-split the cluster; base stays ink). If per-mark coloring
    proves infeasible in a span, coloring the whole target cluster red
    is an acceptable fallback — note which in the handoff.
2f. PART OF SPEECH UNDERLINE: `underline` is the exact word/phrase;
    underline its first occurrence in the sentence (the existing
    highlight hook).
2g. RICHCONTENT INLINE UNDERLINE: text/def strings may contain
    `[[u]]...[[/u]]` spans — render as underline (English grammar
    examples: the underlining IS the pedagogy). Strip the markers
    everywhere else they might leak (defensive).
2h. DIVIDED-FORM RENDER: hyphen-join ("ἄγ-γε-λος"), replacing the
    raised-dot join (that glyph doubles as the Greek colon taught in
    this chapter).
2i. QR VOCAB: render `footnote` under the chart; `playAll.label` is
    now "Say Whole List".
2j. HINTS: accent rule drill + accent placement now carry inline
    `hint.content` (no contentRef); divide's hint keeps contentRef.

## 3. Out of scope

- Chapter 1 anything (including its completion semantics — the
  GkEn-drill completion question is a separate diagnose item, NOT
  this patch).
- Audio architecture, SW, loader, progress backend.
- No data edits beyond committing the delivered files.

## 4. Acceptance checklist

- [ ] npm run verify passes; chapt-01 chunk hash unchanged; chapt-02
      chunks re-emitted + precached.
- [ ] Full ch2 rail walk in the NEW sequence order (20 items), zero
      pending placeholders anywhere, 0 console errors.
- [ ] Ch1 regression walk (26 items) unchanged.
- [ ] Syllable Division: kai via one-syllable bar; a wrong answer on
      item 1 reveals ἄγ-γε-λος and auto-advances ~4s; manual Next
      cancels the timer; score dialog matches attempted/correct.
- [ ] Accent Placement: item 1 (βάπτισαι, Acts 22:16 shown) — Acute +
      position 2 scores correct; Circumflex option present, Grave
      absent; unaccented display retains breathings.
- [ ] Accent Rule / Marking Recognition / Part of Speech: complete
      one-attempt flows; red mark renders on marking items; underline
      renders on POS sentences; option grids show the verified labels.
- [ ] Blue-guess/green-confirm colors on all five answer surfaces;
      320px sweep on the new charts (Accent Possibilities, syllable
      example charts).
- [ ] Every new audio-bearing row plays (spot-check: a_voc10 on the
      2-Consonants chart, b_xauto on the Apostrophe page, b_mosesx on
      marking item 3).

## 5. Handoff

Append §9 "Chapter 2 data patch" to HANDOFF-5B-SOL.md: files
committed, component diffs, acceptance results, and any point where
the data's shape fought a component (pipeline feedback for 5C).
