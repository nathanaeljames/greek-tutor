# 4B-SPEC.md — Phase 4b: Chapter 1 Complete-and-Correct (Claude Code work order)

Prerequisites: read HANDOFF-4A.md (especially §3 Svelte 4 gotchas and §5
entry points) and PLAN.md phase 4b. Commit the 4a working tree as its own
commit before starting. This spec + the five updated data files below are
the complete 4b inputs.

## 0. Data drop-in (do this first)

Replace/add in src/data/ (delivered alongside this spec):
  chapt-01.json        sequence array (rail now follows the interleaved
                       pedagogical order); letters carry canonical
                       audioFull + audioShort (audioName/soundHint drift
                       removed -- this fixes HANDOFF §5's silent-chart
                       bug with NO code change to pickAudio); structured
                       "content"/"sixPointsContent" blocks; diphthong
                       transliterations; Phonetic Reading's 11 items
                       with Greek display text.
  lexicon-chapt01.json readingLists complete (24 personal, 11 places,
                       letter names); ntFrequency duplicate removed --
                       ntFreq is canonical; glossShort retained.
  toc.json             new shape: top-level "intro" pseudo-chapter +
                       chapters + special. Update ChapterNav to render
                       Introduction above Chapter 1.
  intro.json           new pseudo-chapter (learn-only). Register in
                       content.js chapters map; hub renders with only
                       its populated section; bottom bar tabs for empty
                       sections disabled.
Sanity: npm run dev, walk the rail -- order should now interleave
(objectives -> letters -> letter drill -> pronounce -> ...).

## 1. Navigation amendment (user decision 2026-07-17)

REMOVE the Map tab. Bottom bar becomes FOUR equal tabs
(Learn/Drill/Exercise/Review). Rationale: Map's destination (plain hub)
is reachable via back and barely differs from section taps. Keep
UnitMap hub itself unchanged; keep BottomBar's synthetic-hashchange
re-tap pattern. Update active-state logic (no Map fallback state: on
plain hub route, no tab is active). Delete the sitemap icon.

## 2. RichContent renderer (new component)

New src/components/RichContent.svelte rendering the "content" block
arrays now present in the data. Block types:
  heading            centered, larger, weight 500 (original's "Note" /
                     "Six Points" headers)
  para               body prose; optional trailing "example" object
  numbered           ordered list; optional "preamble" line; items:
                     { label (underlined lead-in, e.g. "Final Sigma") ,
                       text, example?, note?, defList?, textPartial? }
  defList            aligned two/three-column rows: term, value,
                     optional audio id (row tap plays it)
  biblist            hanging-indent bibliography entries; leading "*"
                     renders as-is (original's recommendation marker);
                     optional starNote rendered once, small, above
  refs               small right-aligned citation line
  note               parenthetical green info box (existing style)
  example object     { greek, caption?, audio? } -- greek rendered in
                     the Greek font style, tappable when audio present
Typography directive (user, standing): visual arrangement is pedagogy.
Indentation, spacing, and list structure must read like the original's
yellow panels, not a wall of text. Greek inline text uses the .greek
class. No text below 14px in content blocks.
Placement rules: content renders ABOVE interactive elements (it is the
teaching material), except blocks explicitly marked as the green "note"
type which stay below. Collapsible variant: activities with
"sixPointsContent" render a collapsed-by-default expandable panel
titled "Six Points" on the Learn Letters page (tap to expand, smooth
height, chevron affordance).
Replace the old plain-string render paths for note/noteButton/
textPartial in ContentAudio.svelte with RichContent; remove textPartial
handling entirely (no ellipses remain in the data).

## 3. Audio semantics (critique batch; data is already correct)

  - pickAudio('audioShort') now resolves (data fix). Verify chart taps
    speak the letter NAME ONLY on: Learn Letter Transliterations, Learn
    Capital Letters, Review Letters Quick Chart, Transliteration Drill.
  - Scored letter exercises (Letter-to-Name, Name-to-Letter,
    Transliterate the Letter, Transcribe to Greek, Pronounce Letters):
    prompt/Pronounce/Check Answer play audioShort (name only). Wire
    SelectActivity's promptAudio from the generator pool using
    audioShort, NOT audioFull (content.js buildSelectQuestions currently
    hardcodes l.audioFull -- change to honor a generator.promptAudio
    field; set data expectation: default audioShort for letter pools).
  - Learn Letters stepper + Letter Names and Sounds Drill + Capital
    Letters Drill keep audioFull (name & sound).
  - Learn Diphthongs: tile tap plays d.audio; example word tap plays
    exampleAudio (examples restored on the page per critique 9; render
    the 7 rows as the original: diphthong / sound hint / example /
    gloss).
  - Diphthong Drill: Transliteration field shows d.translit on tap
    (new data field), audio = d.audio.
  - Learn Vocabulary flashcard: auto-play lemma audio on Next AND on
    Pronounce (critique 11).
  - Vocabulary EN->GK drill options/prompt use glossShort; GK->EN drill
    options use glossShort too (original grid shows "and, even",
    "truly, verily", "Christ"); Review Vocabulary Chart uses full gloss
    + ntFreq (critique 15/22).
  - Pronounce Letters Exercise: Check Answer reveals the two fields
    (name / sounds-like) AND plays audioShort (critique 17).

## 4. Component work

### 4.1 spell -- Vocabulary Spelling Exercise (replace stub)
  Layout: English Meaning pane (glossShort? NO -- original shows full
  gloss "truly, ve..." use gloss), Spell Greek Word pane (built string,
  Greek font, caret at end), tile keyboard, controls.
  Tiles: 24 lowercase letters + final sigma; diacritic tiles: acute,
  grave, circumflex, rough, smooth, smooth+acute, rough+acute,
  smooth+circumflex, rough+circumflex, smooth+grave(?); composite ᾳ ῃ ῳ.
  (Tile inventory beyond the verified marks is best-effort from the
  original photo; render whatever the data lists -- add
  "spellerTiles" to chapt-01.json if refinement needed. Diacritic tile
  tap applies the mark to the PREVIOUS character (combining, then NFC
  normalize); if none applicable, ignore.)
  Physical keyboard: map per font-map.json _keyboard_layout_note
  (q=θ, w=ω, y=ψ, c=ξ, j=ς, v unused; shifted digits/punct = marks per
  diacritics tables). Implement as a KEYMAP constant derived from
  font-map; unknown keys ignored.
  Buttons: Pronounce (plays lemma audio), Previous/Next (word nav; Next
  RESETS Show Answer checkbox -- critique 21), Score (dialog below),
  Check Answer, Greek Keyboard (opens a reference dialog rendering the
  keymap as a keyboard graphic -- simple CSS grid, no image).
  Checkboxes: Show Answer (reveals answer under the keyboard in Greek,
  as original's bottom-right answer field); With Accents (when OFF,
  compare NFD-stripped-of-marks lowercase; when ON, exact NFC match);
  Pronounce Each Exercise (auto-play lemma audio on Next).
  Scoring: attempts/correct per word; Check Answer grades current
  input, feedback strings from chapter.feedback, correct -> auto-
  advance after ~900ms (match SelectActivity's rhythm). Score dialog
  fields (match original): Number Correct, Total Attempted, Percentage,
  Exercises Completed "n out of 10". markCompleted when all 10 done.

### 4.2 Reading People, Places and Letters (replace categories stub)
  Three category buttons (Personal Names / Place Names / Letter Names)
  right-side or below per mobile layout; panes: "Greek {category}"
  (large Greek), "English {category}" (revealed by Answer). Buttons:
  Previous/Next/Answer. Audio: personalNames/placeNames use
  readingLists audio arrays (play on item show if Pronounce-each
  pattern? original plays on Answer -- default: play on Answer);
  letterNames category displays readingLists.letterNames.greek and
  plays alphabet.letters[n].audioShort. Answer resets on Next.
  markCompleted on reaching last item of ANY category (keep simple).

### 4.3 Phonetic Reading (upgrade selfCheckSequence rendering)
  Display item.display (the Greek-lettered phrase) large on a full-
  width highlight band (modern take on the original's yellow strip);
  Answer Key field reveals item.answer; citation line persists at
  bottom. Last-item Next -> existing end-of-sequence behavior.

## 5. Chart/layout fixes (critiques 5, 6, 8, 13, 22)
  - Restore the left-to-right arrow cue above letter grids on the three
    Drill grid pages (small svg arrow, decorative).
  - Learn Letter Transliterations / Learn Capital Letters: render as
    the original's equation chart (α = a rows, 4-column responsive
    grid), remove the INFO box entirely, tap row plays audioShort;
    tighten padding, raise glyph size.
  - Learn Vowels: reproduce the stair layout (short / long-or-short /
    long groups with arrows/labels), content note below via
    RichContent. Vowel tiles tap -> letter audioShort (pending _verify;
    implement, easy to disable).
  - Review Vocabulary Chart: two-column list rows: Greek (tappable,
    plays lemma audio) + gloss + (ntFreq); Say Whole List button; note
    in green box.
  - Review Letters Quick Chart: 5-column matrix (Letter Name, Letter,
    Capital, Transliteration, Pronounce) as a compact table; on narrow
    screens keep all 5 columns with reduced type (11-12px) -- test at
    320px; row tap plays audioShort.
  - Sequential rail count style unchanged.

## 6. Introduction section
  Register intro.json; TOC renders "Introduction" row above chapters.
  Bottom bar within intro: only Learn enabled (others disabled state).
  intro_navigation page contains a PLACEHOLDER -- surface it visibly
  (subdued "draft copy" tag) so the user remembers to approve final
  wording (open decision recorded in the JSON's _userDecision).
  Welcome page renders a Play button wired to intro_a_welcom.

## 7. Completion semantics (refine, same interface)
  spell: completed when all 10 words attempted-correct once.
  selfCheck sequences (phonetic, reading, pronounce): completed on
  reaching the final item. contentAudio pages: on visit (unchanged).
  select: on finishing all questions (unchanged).

## 8. Acceptance checklist
  [ ] Rail order interleaves per chapt-01.json sequence.
  [ ] Four-tab bottom bar; Map gone; active states correct.
  [ ] Every chart/exercise audio behavior per §3 (spot-check with
      DevTools network: A_*N files fetched on chart taps, A_<letter>
      on stepper/drills).
  [ ] Six Points collapsible on Learn Letters; all 6 points render
      with lists/examples formatted.
  [ ] History and Bibliography render fully formatted (no ellipses
      anywhere in the app).
  [ ] Diphthongs page shows 7 rows with examples; all 10 audio targets
      (7 diphthongs + tiles' examples) play.
  [ ] Speller: tile + keyboard entry both produce Unicode Greek; With
      Accents toggles grading; Show Answer resets on Next; score
      dialog matches original fields.
  [ ] Reading exercise: three categories, 24/11/24 items, Answer
      reveal + audio.
  [ ] Phonetic Reading shows Greek phrases (11) and reveals answers.
  [ ] Introduction appears above Chapter 1 and renders.
  [ ] npm run build clean; offline regression pass (airplane mode
      after one online load); deployed preview on iPhone.
  [ ] Write HANDOFF-4B.md in the same format as HANDOFF-4A.md.

## Out of scope for 4b
  Audio pack download manager (phase 4c, next spec). IndexedDB.
  Webfont. Chapters 2+. Search/Index.
