# 5B-SPEC.md — Chapter 2 wiring (phase 5, pass B)

Input: HANDOFF-5A.md (the lazy-loader conversion MUST be landed and
VERIFY-5A device-passed before this spec starts) + chapt-02.json +
lexicon-chapt02.json (chat-delivered; commit them under src/data/).
Output expected back: HANDOFF-5B.md.

PRECONDITION GATE: if VERIFY-5A has any open failure, stop and say so.

DATA CAVEAT: chapt-02.json ships with `_verify` fields (answers to
several drills, the 21 syllable-division words, some popup content).
Build the components NOW against the schema; render `_verify`-flagged
gaps with a visible "pending verification" placeholder state rather
than crashing or hiding the activity. The data patch lands after
VERIFY-chapt02 returns; component code should not need to change.

## 1. Scope

Wire chapter 2 into the app: register the chunk, extend the mode/type
vocabulary with the FOUR new pieces below, reuse everything else.
Standing directives all apply (fidelity, layout-as-pedagogy, rail
everywhere, no dead-end Next, color semantics, GREEK-TAP rule, no
emoji, no cache scans on load paths).

## 2. New vocabulary (proposed by the pipeline — do not rename)

### 2a. mode: "topicPages" (contentAudio)
Multi-topic learn page: activities carry `topics[]`, each
`{id, title, content[]}`. Render as an in-activity topic stepper
(Previous/Next Topic controls + topic title), following the Learn
Letters stepper precedent — NOT one long scroll (walls of text violate
directive 2; the original pages these topics). The activity-local
stepper may grey out at its ends; the sequential rail below stays
live. Used by: c2_learn_syllables, c2_learn_accents, c2_learn_marks,
c2_learn_grammar_review.

### 2b. RichContent block: "greekRows"
`{type:"greekRows", columns?, rows[]}`; rows carry any of
`{label, greek, syllables[], gloss, note, audio, _legacy}`.
- `greek` renders as a tap target (`.greek-say`, blue) playing `audio`
  when present; Greek without audio renders in ink (non-tap).
- `syllables[]` (when present) renders the word spaced into its
  syllable chunks — this spacing IS the pedagogy (accent charts,
  Syllable Names). Keep the chunks visually separated but clearly one
  word. Test at 320px: the longest row is a five-syllable chart line;
  it must not clip.
- `label` renders as a leading ink-colored cell (e.g. "1) Period ( . )").

### 2c. RichContent block: "expander"
`{type:"expander", label, content[]}` — a tap-to-open accordion,
mirroring the Six Points accordion pattern. Used for the original's
popup buttons (rule examples, proclitic/enclitic lists, grammar
sub-pages). Closed by default. Nested RichContent inside (including
greekRows). No nested expanders in the data; don't support them.

### 2d. Two new activity TYPES (not contentAudio modes)

**type: "divide"** (c2_ex_syllable_division). Renders the item's
`greek` with tappable gap markers BETWEEN letters (numbered positions,
per the original's "Click on the number(s) where the word is divided").
Multi-select gaps -> Check Answer -> compare against `division`
(array of gap indices). Buttons/checkboxes per the `ui` block; "Show
Answer" reveals the divided form; a Hint control shows the Three
Syllable Rules (content included in the activity's `hint`). Scoring
follows the ch1 select-exercise pattern (attempted/correct/percentage
+ scorePrompt string). Items currently have `greek: null` (pending
E1 verification) — render the pending state.

**type: "placeAccent"** (c2_ex_accent_placement). Two-step answer per
the original: pick accent type (Acute/Grave/Circumflex buttons), then
tap the position (letter/syllable slot), then Check Answer against
`answerForm`. Display form: the word WITHOUT its accent (breathing
retained) — generate the display form by stripping U+0301/U+0300/
U+0342 from `answerForm` (do NOT strip breathings/diaeresis), pending
E3 confirmation. Wrong/right feedback uses the chapter feedback pools.

## 3. Reuse map (no new code)

- objectivesPage, textPage, flashcard, reviewVocab, fullOptionGrid,
  spell: as chapter 1.
- fullOptionGrid gains STATIC option sets: the four new drills carry
  `optionValues[]` (numbers / rule names / mark names / parts of
  speech) instead of lexicon-derived options. Prompt side: Greek word
  (tap target with promptAudio per the GREEK-TAP rule) for syllable/
  accent/marking drills; plain English sentence for Part of Speech
  (no Greek, no tap). If the current component assumes lexicon
  options, extend it minimally — do not fork a second grid component.
- reviewVocab: c2_qr_vocab adds `playAll` (whole-list recitation
  button, b_vocl2) — small extension, render as ch1's chart plus a
  Play control.
- Speller: identical component; items point at ch2 lemmas;
  `spellerTilesRef: "chapt_1"` means reuse the ch1 tile inventory.

## 4. Registration

- toc.json: add chapter 2 entry (number 2, "Syllables & Accents").
- Loader: the 5A glob picks up chapt-02.json + lexicon-chapt02.json
  automatically; verify getBuiltChapterIds now returns both chapters
  and the Settings pack list shows the chapt_2 pack.
- Audio: ids are already in the manifest (the full transcode shipped
  in phase 4). NOTE: ch2 references chapt_2_a_voc1..10 — duplicate
  copies of ch1's vocab audio that the ISO ships inside CHAPT_2; this
  is deliberate (pack self-containment). No manifest changes.

## 5. Out of scope

- Chapters 3+; REV_VOC/REV_PAR/JOHN/VOCAB surfaces.
- Any audio-storage or SW change (4.5 architecture frozen).
- Resolving `_verify` data gaps by guessing — placeholders only.
- Refactors beyond the minimal fullOptionGrid extension.

## 6. Acceptance checklist

- [ ] npm run build: chapt-02 + lexicon chunk emitted and precached;
      chapter 1 chunk unchanged.
- [ ] Full 20-item chapter 2 rail walk (sequence array order), 0
      console errors; end-of-chapter dialog (no dead-end Next).
- [ ] Chapter 1 full rail walk REGRESSION (26 items) — untouched
      components must behave identically.
- [ ] Every c2 chart/greekRows renders un-clipped at 320px (check the
      5-syllable chart rows and the Review Marks chart specifically).
- [ ] Greek-tap sweep: every displayed Greek with audio plays on tap
      (blue); Greek without audio renders ink and inert; option
      buttons never play audio.
- [ ] divide + placeAccent: pending-state render for unverified
      items; Check Answer flow works on at least the placeAccent
      items (data complete for all 20); scoring + feedback pools fire.
- [ ] Hard-offline walk of chapter 2 with the chapt_2 audio pack
      downloaded (airplane-mode check is Nathanael's device pass, but
      run the preview-offline equivalent).
- [ ] Settings: pack list shows chapt_2; download + counter behave.

## 7. Handoff requirements

HANDOFF-5B.md: component inventory added/extended, any schema
friction encountered (especially where the data's shape fought the
component — that feeds the pipeline for chapters 3+), acceptance
results, and screenshots of the four topicPages activities for the
VERIFY-chapt02 cross-check.
