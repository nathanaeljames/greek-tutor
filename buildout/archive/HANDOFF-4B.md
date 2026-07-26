# HANDOFF-4B.md — Phase 4b Chapter 1 Complete-and-Correct: session handoff

Session date: 2026-07-17. Implements 4B-SPEC.md (Chapter 1 complete-and-correct)
on top of the Phase 4a navigation rework (HANDOFF-4A.md). Written as the handoff
brief for the Phase 4c session (audio pack download manager, per PLAN.md).

## 1. What was built

### New components (src/components/)
- **RichContent.svelte** — renders the structured `content` block arrays now in
  the data (the original's yellow teaching panels). Block types: `heading`
  (centered, weight 500), `para` (+ optional trailing `example`), `numbered`
  (optional `preamble`; items carry underlined `label` lead-ins, `text`,
  `example`, nested `defList`, `note`), `defList` (aligned term/value/optional-
  audio rows; row tap plays the clip), `biblist` (hanging-indent entries, leading
  `*` kept verbatim, optional `starNote` above), `refs` (small right-aligned
  citation), `note` (green box). `example` objects `{greek, caption?, audio?}`
  render Greek in the serif font and play on tap. **textPartial was removed
  entirely** (no ellipses remain anywhere — verified 0 in the running app).
- **SpellActivity.svelte** — the Vocabulary Spelling Exercise (`type: "spell"`).
  English meaning (full `gloss`) + built Greek string with blinking caret; tile
  keyboard (24 lowercase + final sigma ς, 10 diacritic tiles, 3 composite iota-
  subscript vowels ᾳ ῃ ῳ). Diacritic tiles append **combining** codepoints to the
  previous char then NFC-normalize (α + U+0313 + U+0301 → ἄ — all 10 tiles
  verified to compose to single precomposed glyphs). Physical keyboard maps the
  legacy roman→Greek layout (`KEYMAP`: q=θ w=ω y=ψ c=ξ j=ς, v unused, etc.);
  Enter=Check, Backspace deletes a whole grapheme. Grading honors **With Accents**
  (ON = exact NFC; OFF = NFD-strip-marks + lowercase + ς→σ). Buttons Pronounce/
  Previous/Next/Check Answer/Score/Greek Keyboard; **Next resets Show Answer**
  (critique 21); correct answer auto-advances after 900ms. Score dialog fields:
  Number Correct / Total Attempted / Percentage / Exercises Completed "n out of
  10". `markCompleted` when all 10 words have been correct once.
- **ReadingCategories.svelte** — Reading People, Places and Letters. Three chip
  buttons (Personal 24 / Place 11 / Letter 24). Greek pane always shown; English
  revealed on **Answer**, which also plays audio (personal/place = readingLists
  audio arrays; letter names = `alphabet.letters[n].audioShort`). Answer resets on
  Next/Previous/category switch. `markCompleted` on Answering the last item of ANY
  category.
- **ArrowCue.svelte** — decorative left-to-right SVG cue above the three letter-
  grid drills.

### Rewritten / amended components
- **ContentAudio.svelte** — now dispatches bespoke layouts by activity id/mode:
  - `textPage`: objectives (special) / `content` via RichContent / intro Welcome
    **Play button** (`activity.playButton`) / **"Draft copy — pending approval"**
    tag when `activity._userDecision` is present (intro_navigation).
  - `stepper` (Learn Letters): three fields (name / sounds-like / transliteration),
    Say Alphabet, and a **collapsed-by-default "Six Points"** panel (chevron,
    `svelte/transition` slide) rendering `sixPointsContent` via RichContent.
  - `flashcard` (Learn Vocabulary): auto-plays lemma audio on **Next** and on
    **Pronounce** (critique 11).
  - `selfCheckStepper` (Pronounce Letters): Check Answer reveals name + sounds-like
    **and plays audioShort** (critique 17); completes on last item.
  - `selfCheckSequence` (Phonetic Reading): Greek phrase on a full-width highlight
    **band**; Answer reveals `item.answer`; citation persists; completes on last.
  - Equation chart (Learn Letter Transliterations / Capital Letters): 4-col `α = a`
    / `α = Α` grid, tap plays audioShort, INFO box removed, `content` note below.
  - Vowel stair (Learn Vowels): short / long-or-short / long stepped groups; tiles
    play the letter's audioShort; note below.
  - Diphthong rows (Learn Diphthongs): 7 rows diphthong / sound / example / gloss;
    tile tap plays `d.audio`, example tap plays `d.exampleAudio`; note below.
  - Review Vocabulary Chart: Greek (tap = lemma audio) + full gloss + `(ntFreq)`,
    Say Whole List, green note.
  - Review Letters Quick Chart: compact 5-col matrix (Name/Letter/Capital/Translit/
    Pronounce), row tap plays audioShort, type shrinks to ~11px < 400px.
  - Generic chart/exploreGrid: arrow cue on the three letter drills; `fieldValue()`
    resolves the tapped tile's field (Transliteration/Sound/Letter); click audio
    falls back to `meta.audioShort` when a drill has no explicit `play` (fixes the
    Transliteration Drill playing name-only).
- **ActivityHost.svelte** — routes `spell` → SpellActivity, `categories` →
  ReadingCategories (was a stub), `select` → SelectActivity, else ContentAudio.
  **Completion refined**: plain contentAudio pages still complete on visit, but
  `selfCheckStepper`/`selfCheckSequence` are excluded (they self-complete on the
  final item), and category reading self-completes.
- **BottomBar.svelte** — **Map tab removed** (user decision 2026-07-17); now four
  equal tabs Learn/Drill/Exercise/Review. Sitemap icon deleted, goMap/nav.js
  imports gone. Sections with **no activities are disabled** (Introduction shows
  only Learn enabled). Kept the synthetic-hashchange re-tap pattern.
- **App.svelte** — active-state logic drops the `'map'` fallback (plain hub route =
  no active tab). Title/hub rendering guards a missing chapter `number` so the
  numberless Introduction pseudo-chapter renders as just "Introduction".
- **ChapterNav.svelte** — renders an **Introduction** row above the Chapters list
  (from `toc.intro`).
- **UnitMap.svelte** — only renders sections that have activities (so the intro's
  empty drill/exercise/quickReview cards don't appear); numberless-chapter title
  guard.
- **content.js** — registers `intro` in the `chapters` map; `getReadingLists()`
  added; `pickAudioField()` helper; **`buildSelectQuestions` audio/gloss fixes**
  (letter generators use audioShort not audioFull; vocab drills use `glossShort`
  for both prompt and options); vowels `resolveItems` now attaches the matching
  letter's audioShort + group tag.
- **app.css** — a "Phase 4b" block appended with styles for RichContent, the Six
  Points collapsible, the draft tag, equation chart, vowel stair, diphthong rows,
  review vocab/letters, arrow cue, phonetic band, the full speller, reading chips,
  and the disabled bottom-tab state.

## 2. Verification status (against 4B-SPEC §8 acceptance checklist)

Verified this session (production build via `npm run preview`, DOM dumps + direct
Unicode/logic tests + mobile screenshots via headless Chrome):

- [x] `npm run build` clean (52 modules, was 45; no warnings after the modal a11y
      fix).
- [x] Rail order interleaves per `chapt-01.json` sequence (26 items, all ids
      resolvable).
- [x] Four-tab bottom bar; Map gone; sitemap icon gone; intro shows 3 disabled
      tabs + only the Learn section card.
- [x] Six Points collapsible present and **collapsed by default** on Learn Letters;
      all six points render with lists/examples/defLists.
- [x] History and Bibliography render fully formatted; **0 ellipses** in the app
      (45 bibliography entries render).
- [x] Diphthongs page shows 7 example rows; RichContent note (with the ἄνθρωποι/
      ἀνθρώποις defList) below.
- [x] Speller: 38 tiles (25 letters incl. final sigma + 10 diacritics + 3
      composites); all 10 diacritic tiles compose to correct precomposed glyphs;
      With-Accents-off grading matches plain input for all 10 words.
- [x] Reading exercise: three categories (24/11/24) render; Answer reveal wired.
- [x] Phonetic Reading: 11 Greek phrases on the highlight band; Answer reveals.
- [x] Introduction appears above Chapter 1 and renders (Welcome Play button; the
      Navigation page shows the draft-copy tag).
- [x] Data invariants: every letter has `audioShort`; every lemma has `glossShort`
      + `ntFreq`; every diphthong has audio/exampleAudio/translit.

**NOT verified — needs the user / a real device or Playwright:**
- Audible confirmation of every §3 audio target (headless has no audio pack; audio
  IDs and play() wiring were verified statically, not by ear). Spot-check with
  DevTools Network per §8: `A_*N` on chart taps, `A_<letter>` on stepper/drills.
- **Device-accurate visual layout / responsive fit.** Headless `--window-size` does
  NOT emulate a mobile layout viewport (no device-metrics override without
  Playwright/CDP), so the screenshots taken this session render at a desktop-width
  layout and clip on the right — this is a tooling artifact (the untouched 4a TOC
  hero clips identically), **not** a real overflow: no CSS added this session uses a
  fixed width > viewport (grids use `fr`/`1fr`, the one fixed 64px column pairs with
  `1fr`). Still, confirm on iPhone Safari and at 320px per §5. The 4a handoff had
  the same caveat and recommends adding `playwright-core` as a devDependency for
  repeatable device-emulated UI tests.
- Offline/airplane-mode regression (no new network deps added), localStorage
  survival across real app relaunches, deployed iPhone preview.

## 3. Svelte 4 gotchas honored (carried from HANDOFF-4A §3)
- Template reactivity: new components inline their reactive reads or pass reactive
  values as arguments (no hidden reactive reads inside template-called helpers).
- Same-hash navigation no-op: BottomBar still dispatches a synthetic `hashchange`.
- Progress reads are module state (invisible to Svelte): mid-activity
  `markCompleted` calls (spell/reading/selfCheck) surface on the **next** route
  change (App's `progressTick` bump), matching the existing SelectActivity pattern
  — the hub/rail indicators update when you navigate away, not instantly in place.

## 4. State of the data layer
- `intro.json` registered; `toc.json` new shape consumed (top-level `intro`).
- `chapt-01.json` / `lexicon-chapt01.json` drop-in consumed as delivered — no code
  edits were needed to the data beyond registration. `pickAudio('audioShort')` now
  resolves (the silent-chart bug from HANDOFF-4A §5 is fixed by the data, no
  pickAudio change).
- Open data decisions still flagged in the JSON `_verify` / `_userDecision` fields
  (Moulton/Mouton typo, intro_navigation copy, Nazareth final letter, A_VOC↔lemma
  pairing, tile inventory) are **user/extraction decisions**, not code work.

## 5. Entry points for Phase 4c (audio pack download manager)
- `audio.js` is still the single audio choke point: `play(id)` → `audioPath(id)`
  (`chapt_1_a_alpha` → `/audio/chapt_1/a_alpha.m4a`) + `warmCache()` (fetches the
  full 200 so the SW can range-slice offline). 4c's download manager plugs in here
  / around the SW precache; no component calls audio files directly.
- Every activity now emits real completion signals, so a "downloaded chapters"
  manager can rely on `progress.js` for what's been used. `progress.js` interface
  is unchanged (Phase 6 still swaps its backend to IndexedDB).
- Speller/Reading are the only components with `onMount`/`onDestroy` listeners
  (keydown) — nothing audio-pack-specific to unwind there.

## 6. Housekeeping
- Working tree (uncommitted): modified App.svelte, app.css, ActivityHost,
  BottomBar, ChapterNav, ContentAudio, UnitMap, content.js + the three drop-in
  data files (chapt-01/lexicon/toc) + intro.json; new ArrowCue, ReadingCategories,
  RichContent, SpellActivity, this file, 4B-SPEC.md, HANDOFF-4A.md. Suggest
  committing as the Phase 4b unit.
- Deploy note (unchanged): the iPhone PWA uses autoUpdate — after the Netlify
  deploy, close and reopen the installed app (possibly twice) so the new service
  worker takes over before device testing.
- A11y: the Greek Keyboard reference modal closes via its Close button only (no
  overlay-click-to-close) to keep the build warning-free.
