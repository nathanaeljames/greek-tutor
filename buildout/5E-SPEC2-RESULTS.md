# 5E-SPEC2-RESULTS.md — cohort 5E round 2

Implementer: Claude (Opus 5), in Claude Code.
Base commit: `95d4375bf64a361f3e27941a5cabbbb7756f3a2c` ("saving updates before
phase 5e spec 2"). Working tree, uncommitted. Nothing pushed.
Date: 2026-08-06.

Canonical inputs used: `DRILL-BEHAVIOR-RULES.md` and
`DRILL-BEHAVIOR-LEDGER.csv`. `DRILL-MATRIX.md` was already deleted at the base
commit and was never opened.

---

## 1. Summary

All six spec sections are implemented. The renderer now reads the ledger's two
new data fields instead of inferring behavior: `answerPolicy.advanceClass`
drives a six-class advance model resolved centrally in `src/lib/timing.js`, and
`audioTiming` decides the one moment a drill speaks. The `afterGuess` wait is
`max(class minimum, clip duration)`, implemented with a real `ended` event
rather than a measured duration, and pressing Next cancels both halves. Audio
now stops on the exit that was missing — a topic switch inside `topicPages` —
and on screen-off via `visibilitychange`/`pagehide`. The spelling checker now
requires final forms and breathings at both toggle settings. Every modal is
capped to the visible viewport inside a scrollable overlay, and the authored-
number lists hang.

`ui:behavior` grew from 96 to **203 checks, all passing, stable across three
consecutive runs**. The rail walk covers 105 stops at two widths with zero
horizontal overflow and zero console errors. `npm run verify` (shapes, build,
lazy chunk) is green, and an offline preview walk of all five chapters passes.

Three things need Nathanael's attention and are detailed in §4:

1. **§5.3 could not be done in code** and was done as a data-side pipeline rule
   instead, exactly as §0 asked me to report.
2. **§5.6's premise does not hold in this tree.** The ten vocabulary grids
   already measure 2-up at 320px and 4-up at 768px in *both* directions. A full
   census of all 29 option grids is in §4.2; I changed no layout and want a
   decision before I do.
3. **§5.1's failure is not reproducible in headless Chrome.** The fix is
   structural and asserted structurally; confirming it is a device item.

---

## 2. Scope conformance

| Spec section | Built | Where | Notes |
| --- | --- | --- | --- |
| §1 six advance classes | Yes | `src/lib/timing.js`, all five scored components | `resolveAdvance` returns behavior FLAGS (`oneAttempt`, `autoOnCorrect`, `autoOnIncorrect`, `revealOnIncorrect`); no component compares a class name. Legacy `retry`/`manual` normalize to the new names. |
| §1 `check:shapes` guard | Yes | `scripts/check-content-shapes.mjs` | Fails on any `advanceClass` outside the six (imported from `timing.js`, not re-typed) and any `audioTiming` outside the five. The `autoAdvanceMs` guard is untouched. |
| §1 minimum delays 2000/4000, no override | Yes | `src/lib/timing.js` | Unchanged constants; no per-activity override was added. |
| §1 speller keeps the slate; Syllable Counting does not reveal | Yes | `SpellActivity`, `SelectActivity` | Both deliberate departures preserved and now asserted by tests. |
| §2.1 `beforeGuess` | Yes | `SelectActivity.maybePronounce` | Gated on `audioTiming === 'beforeGuess'`; no prompt-language inference remains. |
| §2.2 `afterGuess` finishes first | Yes | `audio.js#playThrough`, `scheduleAdvance` in four components | `Promise.all([minimumTimer, playThrough(clip)])`. Duration comes from the element's `ended`, never from a measurement. |
| §2.3 Next stops audio and advances at once | Yes | `move()` in every stepping component | `cancelAdvance()` bumps a token so a pending async advance cannot fire; `stop()` releases the `playThrough` wait via `pause`. |
| §2.4 `afterTap`/`afterCheck`/`none` | No change needed | `ContentAudio`, `ReadingCategories` | Explore grids already played on tap, self-check surfaces on reveal, and `c1_ex_phonetic` (`none`) plays nothing. Audited, not rewritten. |
| §2.5 whole-verse spellers play the verse | Yes | `SpellVerseActivity.check` | Plays `activity.audio` on a successful spelling. Chapters 3, 4 and 5. |
| §3.1 audio stops on all three exits | Yes | `ContentAudio.goToTopic`, component `onDestroy`, existing `App.handleHashChange` | The topic switch was the real gap. Category switching in `ReadingCategories` got the same treatment (a category is that activity's topic). |
| §3.2 pause on screen-off | Yes | `src/lib/audio.js` module scope | `visibilitychange` + `pagehide`, registered once in the sole audio choke point. **Device-verify required.** |
| §3.3 a new tap interrupts cleanly | Kept, asserted | `audio.js` (unchanged) | Asserted by §6.3's "playing 1 -> 0" and by the pre-existing `playToken` discipline. |
| §4.1 final forms required | Yes | `src/lib/answer-check.js` | The `ς -> σ` fold is gone. |
| §4.2 breathings required with accents OFF | Yes | `src/lib/answer-check.js` | `\p{M}` stripping replaced by an explicit three-accent set. Diaeresis and iota subscript are also now required, which is what "and nothing else" means. |
| §4.3 Show Answer clears on typing | Yes | `SpellActivity` | Every edit path (`appendChar`/`appendMark`/`backspace`/`clearInput`) clears it. Major Hint on the verse speller is untouched. |
| §4.4 wrong answer keeps what was typed | Yes | `SpellActivity` | Was already true; now the class says so and a test asserts it. |
| §4.4 spellers wait for Next on correct | Yes | `SpellActivity` | This is a behavior CHANGE: they used to auto-advance after 2000ms. `spellUntilRight` waits. |
| §4 `pronounceEach` default | Yes | `SpellActivity`, `DivideActivity`, `PlaceAccentActivity` | Now read from `ui.defaults.pronounceEach ?? true`. `SpellActivity` had `false` hard-coded, so the thirteen data fixes had no effect until this change. |
| §5.1 modals reach their close control | Yes | `src/app.css` | Overlay scrolls; modal centres with `margin: auto`; height capped to `100dvh - 40px` with a `vh` fallback. Full audit list in §5. |
| §5.2 hanging indents | Yes | `src/app.css` | `.rc-list.authored-labels` (chapter 2's fourteen `1) 2) 3)` lists) now hangs. Full audit in §5. |
| §5.3 underline the two accent rules | Yes, **as a data-side rule** | `scripts/apply-behavior-matrix.py` | See §4.1. This is the one item that could not be done in code. |
| §5.4 no displayed `--` | Yes, and two more found | source sweep + `apply-behavior-matrix.py` + `check:shapes` | The component/label/dialog sweep was clean. Four displayed `--` remained in DATA the stamper had never opened. See §4.3. |
| §5.5 say so when waiting | Yes | five components | One shared predicate `waitsForNext(advance, wasCorrect)`; one message, "Click Next to continue", on all five surfaces. |
| §5.6 option grids | **No change; reported** | — | See §4.2. |
| §6 tests | Yes, 8/8 items | `scripts/ui-behavior.mjs` | 203 checks. Item-by-item mapping in §6. |

Nothing outside §1–§6 was changed. No audio-store, service-worker, routing,
font, mark-geometry or chapter 6+ code was touched.

---

## 3. Data edits, and why there are any

§0 says the data is correct and must not be edited for behavior. **No behavior
field was edited.** Three files changed, all through
`scripts/apply-behavior-matrix.py` so a regenerated chapter cannot lose them,
and all typographic:

| File | Path | Before | After | Rule |
| --- | --- | --- | --- | --- |
| `chapt-02.json` | `drill[c2_drill_accent_rule].hint.content[3].items[0].text` | `Nouns are retentive.  They…` | `[[u]]Nouns are retentive.[[/u]]  They…` | §5.3 |
| `chapt-02.json` | `drill[c2_drill_accent_rule].hint.content[3].items[1].text` | `Verbs are recessive.  Their…` | `[[u]]Verbs are recessive.[[/u]]  Their…` | §5.3 |
| `chapt-02.json` | `exercise[c2_ex_accent_placement].hint.content[3].items[0..1].text` | same two sentences | same two spans | §5.3 (the same hint, verbatim, on the exercise) |
| `intro.json` | `learn[0].content[1].text` | `WELCOME -- Greek Tutor…` | `WELCOME — Greek Tutor…` | D2 / §5.4 |
| `intro.json` | `learn[0].content[3].text` | `…the program. -- ENJOY` | `…the program. — ENJOY` | D2 / §5.4 |
| `lexicon-chapt01.json` | `exampleWords.anthropoi.gloss` | `men (nom. pl.) -- Note example: …` | `men (nom. pl.) — Note example: …` | D2 / §5.4 |
| `lexicon-chapt01.json` | `exampleWords.anthropois.gloss` | `to men (dat. pl.) -- Note example: …` | `to men (dat. pl.) — Note example: …` | D2 / §5.4 |

The stamper is idempotent: running it twice produces no second change, and
running it against the delivered data before my edits produced no diff at all,
which confirms the delivered files match the ledger exactly.

---

## 4. Findings that need a decision

### 4.1 §5.3 is not a code change (reported per §0)

§0 says "Nothing in §1–§6 requires a data edit; if you believe one does, stop
and report it." §5.3 does. The two sentences carry no structural signal that a
renderer could key on:

```
1) Nouns are retentive.  They attempt to keep their accents on the same syllable.
2) Verbs are recessive.  Their accent recedes towards the first syllable as far as is possible.
3) If the ultima is long, then the antepenult cannot be accented.
```

Items 1 and 2 differ from 3–6 only in having a second sentence. A renderer rule
like "underline the first sentence of a multi-sentence list item" would be
inference dressed as typography and would fire across chapter 3 as well.

What I did instead: added the phrases to `apply-behavior-matrix.py`, which the
spec already ships as the home of "the typographic rules that are data-side"
(its own docstring, alongside D2). It is idempotent, it survives regeneration,
and it is scoped to HINT content — the same two sentences also appear in a Learn
topic list, in an expander LABEL ("Rule 1: Nouns are retentive") and in the
Quick Review chart, and underlining a summary hotword or a device-verified
teaching page is not what §5.3 asks for. It therefore also lands on the Accent
Mark Placement exercise, which shows the same hint byte-for-byte; the same
sentence must not look different in two places.

**If you would rather this lived in the chat-side pipeline, move it there and
delete the constant — nothing in `src/` depends on it.**

### 4.2 §5.6's reported defect does not exist in this tree

> "The English-gloss grids on the Greek-to-English vocabulary drills currently
> render four-up at all widths."

They do not. Measured through `getComputedStyle` on the shipped build, at 320px
and 768px, for **every** select activity in chapters 1–5:

| Grid | 320 / 768 | Why |
| --- | --- | --- |
| `c1_drill_vocab_gk_en`, `c1_drill_vocab_en_gk` | 2 / 4 | responsive vocabulary pool (D-19) |
| `c2_drill_vocab_gk_en`, `c2_drill_vocab_en_gk` | 2 / 4 | same |
| `c3_drill_vocab_gk_en`, `c3_drill_vocab_en_gk` | 2 / 4 | same |
| `c4_drill_vocab_gk_en`, `c4_drill_vocab_en_gk` | 2 / 4 | same |
| `c5_drill_vocab_gk_en`, `c5_drill_vocab_en_gk` | 2 / 4 | same |
| `c4_drill_greek_noun`, `c4_drill_declining`, `c5_drill_declining`, `c5_drill_article` | 2 / 2 | `optionLayout: paradigm2col` (D-26, the named exception) |
| `c2_drill_marking_recognition`, `c2_drill_part_of_speech`, `c3_drill_verb_translating`, `c3_drill_scripture_memory`, `c4_drill_scripture_memory`, `c5_drill_scripture_memory` | 2 / 2 | authored option sets, the two-column default |
| `c1_ex_letter_to_name`, `c1_ex_name_to_letter`, `c1_ex_translit`, `c1_ex_transcribe` | 4 / 4 | 24-option letter generators (`wide`) |
| `c2_drill_syllable_counting` | 4 / 4 | number tiles, longest label 1 character (`wide`) |
| `c2_drill_accent_rule`, `c3_drill_greek_verb`, `c5_drill_first_decl_noun` | 1 / 1 | labels over 24 characters, or a declared `single` layout |
| `c3_drill_parsing` | 1 / 1 | declared `optionGroups: [3,3]` |

D-19 in both directions already landed in 5D-SPEC2/XPATCH1. So the sentence
"D-19 applies to every option grid in every chapter … the paradigm-shaped grids
… are the only exception" cannot be applied literally: there are four other
authored layouts, and taking it literally would put 24 single glyphs into two
columns on a phone (twelve rows) and four 46-character parsing labels into four
columns. Both would reverse decisions a device pass ratified.

**I changed nothing and want your call.** The two candidate changes are:

- make the 2/2 authored grids (six of them) go 4-up at 768px, and/or
- make the 4/4 single-glyph grids go 2-up at 320px.

What I did instead is turn the census into a permanent guard: `ui:behavior`
now asserts the vocabulary pools are 2/4, the paradigm grids 2/2, the declared
layouts 1/1, that the four-up-at-320px set is exactly the five named
single-glyph/number grids, and that **no grid is ever denser at 320px than at
768px**. A new grid arriving four-up on a phone now fails the build instead of
being found on device.

### 4.3 §5.4 — the UI sweep was clean, the data was not

No component, label or dialog in `src/` contains a displayed `--`; the only
matches are inside code comments. But the stamper's loop only ever opened
`chapt-NN.json`, and its regex only matched `--` tight against word characters,
so four displayed double hyphens survived in files it never saw:

- `intro.json` — `WELCOME -- Greek Tutor…` and `… the program. -- ENJOY`
  (spaced form, invisible to both existing patterns).
- `lexicon-chapt01.json` — two `exampleWords` glosses, which chapter 1 and 2
  render in their diphthong charts.

Fixed by (a) adding the spaced pattern, (b) sweeping every rendered data file
rather than the chapters, and (c) adding a `check:shapes` guard so a future
regeneration that skips the stamper fails the build. `font-map.json` is exempt
(pipeline reference table, no runtime import anywhere in `src/`), as are
underscore-prefixed keys and `audioInventory` (provenance, never rendered).

The stamper now also preserves each file's own indentation. Without that, a
two-character fix to `intro.json` reflowed all 120 lines of it.

### 4.4 §5.1 is a WebKit failure and Chrome cannot reproduce it

The old CSS capped `.hint-modal` at `86vh` and centred it with flexbox in a
`position: fixed`, non-scrolling overlay. In Chrome `vh` *is* the visible
height, so 86vh + 40px of padding always fits and the close button is always
reachable — the reachability loop I wrote would have passed before the fix too,
at every width and height I could set. The failure needs a visual viewport
shorter than `100vh`, which is iOS Safari with its toolbar showing.

The fix targets exactly that: the overlay scrolls, `margin: auto` centres (a
flex-centred item that overflows overflows equally at *both* ends and cannot be
scrolled to), and the cap is `100dvh - 40px` with a `100vh` fallback. Both the
cap and the inner scroll moved onto the shared `.modal` class so every modal
inherits D3 rather than having to remember it.

I assert the structure directly (overlay `overflow-y`, overlay not
`align-items: center`, modal cap equal to the visible viewport minus padding)
**and** keep the reachability loop as a regression guard at 320x480 and
320x360. Real WebKit remains a VERIFY-5E2 item, as the spec schedules.

### 4.5 Smaller findings, no action taken

- **`scripts/ui-walk.mjs` defaults `--out` to `buildout/screenshots/5e-spec1-sol`.**
  Running it without arguments overwrote 475 of Sol's committed round-1
  screenshots. I restored them with `git checkout` and ran with
  `--out=buildout/screenshots/5e-spec2`. Recommend the default become a
  required argument, or a dated directory, before the next round.
- **`c4_drill_greek_noun` has two items with the same sentence and the same
  reference** ("Brother will betray brother", Mat 10:21) and different answers.
  Faithful, probably — the verse has two forms of ἀδελφός — but it made the
  test harness's prompt+reference item lookup ambiguous, which is how a wrong
  option got clicked about one run in twenty and reported the advance as broken.
  `authoredItemOnScreen` now returns `null` on ambiguity and callers reshuffle.
- **Every `c4_drill_greek_noun` item lists `ἀδελφοί` twice** (and
  `c4_drill_declining` lists `λόγοι` twice) because nominative and vocative
  plural are homographs. When that form is the answer, two tiles turn green.
  Faithful to the paradigm; noted because it looks like a duplicate-key bug.
- **The Syllable Division exercise's hint button renders "Hint"**, from
  `activity.hint.label`, while `ui.buttons` lists it as "Hint: Rules".
  `DivideActivity` builds its own control block, so XPATCH1's `ui.buttons`
  ordering work never reached it. Out of scope; flagged.
- **`apply-behavior-matrix.py` crashed on Windows** after doing its work,
  printing a Greek string to a cp1252 console. Now reconfigures stdout to UTF-8.

---

## 5. Audits the spec asked for

### 5.1 Every modal surface, at every supported width (§5.1)

| Surface | Where | Reachable at 320x480 and 320x360 |
| --- | --- | --- |
| Drill Hint paradigm popup — ch3 Verb Translating | `SelectActivity` `.hint-modal` | PASS |
| …ch4 Greek Noun | " | PASS |
| …ch4 Declining Noun | " | PASS |
| …ch5 First Declension Noun | " | PASS |
| …ch5 Declining Noun | " | PASS |
| …ch5 Definite Article | " | PASS |
| **The same six with Meanings expanded** (the reported case) | `Paradigm` `<details>` inside the modal | PASS (all six) |
| Paradigm Endings popup — ch3 Learn Verbs | `Paradigm` `.pg-endings` | PASS |
| Greek Keyboard reference — word speller | `SpellerKeyboard` `.kb-ref` | PASS |
| Greek Keyboard reference — whole-verse speller | " | PASS |
| End-of-chapter dialog | `EndOfChapterDialog` `.modal` | PASS (its last action, "Stay") |

Non-modal expanders were checked too and need no cap: the chapter-2 hint cards
(`SelectActivity`, `DivideActivity`, `PlaceAccentActivity` render them as
in-flow `.card`s), `RichContent`'s `.rc-expander`, the Six Points collapsible
and the speller `.score-dialog` all sit inside `.scroll-area` and scroll with
the page.

### 5.2 Every list (§5.2)

| List | Hangs before | Hangs now |
| --- | --- | --- |
| `.rc-list` generated counters (`1) 2) 3)` from `counter-increment`) — ch1, ch3, ch4, ch5, intro | Yes | Yes (untouched) |
| `.rc-list.authored-labels` — **chapter 2's fourteen lists**, including the Accent Rule Drill's six points and the Three Syllable Rules shown by the Syllable Counting drill and the Syllable Division exercise | **No** | Yes |
| `.rc-list.unnumbered` | n/a (no marker) | unchanged |
| `.rc-deflist.termless` (the accent hints) | Yes | Yes |
| `.rc-biblist` bibliographies | Yes | Yes |
| `.objectives-list` (`<ol>` with outside markers) | Yes | Yes |
| `.rc-deflist` two-column rows, `.pg-legend` | n/a (aligned columns, not hanging lists) | unchanged |

The three offenders the spec named were all one CSS rule: chapter 2 authors its
own `1)` markers, which rendered as an inline `.rc-num` span, so a wrapped rule
ran back underneath its own number. Measured, not assumed — the test asserts the
marker box ends at or before the text column begins.

### 5.3 UI copy sweep for `--` (§5.4)

`src/components/*.svelte`, `src/lib/*.js`, `src/App.svelte`: six matches, all
inside code comments, none rendered. Data findings in §4.3.

---

## 6. Test coverage against §6

| §6 item | Checks | Result |
| --- | --- | --- |
| 1. all six classes, correct and incorrect | `none` not scored; `autoBoth` correct 2000ms + incorrect 4000ms (ch4, ch5); `manualOnIncorrect` correct 2000ms + incorrect reveals/waits/says so; `retryUntilRight` incorrect reveals nothing, stays open, accepts a second attempt; `manualCorrectAutoIncorrect` correct waits + says so, incorrect reveals and advances at 4000ms; `spellUntilRight` correct waits + says so, incorrect keeps the slate and reveals nothing | PASS |
| 2. `afterGuess` finishes before the next item, incl. >2000ms | A 3-second WAV seeded into the app's own audio store (IndexedDB `greek-tutor`/`audio`) so the app's IDB-hit path serves it. Measured: advanced 3.1s after the guess, clip ran 3.06s, advance was after `ended`. | PASS |
| 3. Next during playback stops audio and advances at once | playing 1 -> 0, item advanced in 172ms | PASS |
| 4. audio stops on rail nav, topic switch, route change | all three, via a wrapped `window.Audio` that records start/end/pause without changing what plays | PASS |
| 5. speller rejects a missing final form and a missing breathing with accents OFF | **every word speller in chapters 1–5** (nine of them), each using its own first offending word, plus a positive control (breathing kept, accents dropped, accepted) so the rule is not "everything fails" | PASS (27 checks) |
| 6. Show Answer clears on typing | ch1, ch3, ch5 spellers | PASS |
| 7. every modal reaches its close control at 320px | 11 surfaces x 2 heights, plus the structural assertion | PASS (see §5.1) |
| 8. option grids 2-up/4-up except paradigm | full 29-grid census, four assertions | PASS (see §4.2) |
| extra: §5.2 hanging indents | three chapter-2 hints, measured | PASS |
| extra: §5.3 underlines | both hints that show the six rules | PASS |

**Regression, both harnesses:**

- `node scripts/ui-behavior.mjs` — **203/203**, three consecutive runs.
- `node scripts/ui-walk.mjs --out=buildout/screenshots/5e-spec2` — 105 rail
  stops x 2 widths, 474 screenshots, **0px horizontal overflow at 320px on
  every stop**, all rail counts and Next actions live, all authored expanders
  and chart states opened, **no console errors**.
- `npm run verify` — shapes PASS, production build clean (only the pre-existing
  `DivideActivity` a11y `tabIndex` warning), lazy-chunk PASS, precache 27
  entries (unchanged; 691.49 KiB vs 687.27 KiB at base).
- Offline preview regression (throwaway script, not committed): service worker
  installed, network disabled, all five chapters render and walk three rail
  stops each, hard refresh on an activity route renders, and an `afterGuess`
  drill with no downloaded clip still advances on its class minimum rather than
  hanging. 14/15; the one failure is the expected
  `net::ERR_INTERNET_DISCONNECTED` from `play()`'s miss-path fetch, which is the
  documented "toast IFF the user gets no audio" behavior and predates this round.

---

## 7. Chunk hashes

**The spec's prediction was already satisfied by the base commit.** Commit
`95d4375` restamped all five chapter files from the ledger, so relative to the
round-1 tree every chapter hash had already moved before I started. Measured by
building the base commit and the working tree with the same toolchain:

| Asset | At base commit `95d4375` | After this round | Changed |
| --- | --- | --- | --- |
| `chapt-01-*.js` | `CU6hirIK` | `CU6hirIK` | no |
| `chapt-02-*.js` | `BbMSaIhR` | `Cem6eSMM` | **yes** — the four §5.3 underline spans |
| `chapt-03-*.js` | `C33Kg7th` | `C33Kg7th` | no |
| `chapt-04-*.js` | `B5xVjWr5` | `B5xVjWr5` | no |
| `chapt-05-*.js` | `DntsEEBk` | `DntsEEBk` | no |
| `lexicon-chapt01-*.js` | `DWCL8L3K` | `DKNsyOx1` | **yes** — the two §5.4 em dashes |
| `lexicon-chapt02..05-*.js` | `DMecEUSp`, `DU3wQSch`, `CZna8uQ7`, `gf-U-zWG` | unchanged | no |
| `index-*.js` | `C5Q2_Jkk` | `DvEpHIBO` | yes — all code changes, plus `intro.json` (static, bundled) |
| `index-*.css` | `3_GP9iO4` | `BJgmOpyj` | yes — the modal and list rules |

This is not a failure and needs no action; it is reported because the spec asked
for the numbers.

---

## 8. Behavior changes a learner will notice

Worth knowing before the device pass, because several are deliberate reversals
of what shipped:

1. **The nine word spellers no longer auto-advance on a correct answer.** They
   show "Click Next to continue" and wait. `spellUntilRight`, ledger-confirmed
   on all nine rows.
2. **Spelling got stricter.** `ἄγγελος` no longer validates as `αγγελοσ`, and
   `ἀδελφός` no longer validates as `αδελφος` even with "With Accents" off.
   Words with a diaeresis or an iota subscript are affected the same way. Every
   affected answer is typeable on the shared keyboard — `check:shapes` proves it.
3. **"Pronounce Each" is now on by default on the spellers and the two chapter-2
   exercises.** The data said so since this spec's delivery; the code was
   ignoring it.
4. **The chapter-2 Syllable Division and Accent Mark Placement exercises now
   wait on a CORRECT answer and auto-advance on a wrong one** — the opposite of
   what they did, and what the original does.
5. **Vocabulary English-to-Greek drills now finish speaking before the next
   word appears**, so those items sit on screen for the length of the clip
   rather than 2 seconds.
6. **The two chapter-2 exercises no longer speak the word on arrival.** They are
   `afterGuess`; Pronounce Word remains the on-demand path.

---

## 9. For VERIFY-5E2 (Nathanael, on device)

1. **Screen-off audio pause.** Start a long clip (Say Whole Paradigm on chapter
   4's Masculine Declension), lock the phone, unlock. It must be silent and must
   not resume. This is the one item no harness can settle.
2. **Modal scrolling on real WebKit.** Chapter 4 or 5, any drill, Hint, then
   Meanings, with the Safari toolbar showing. Close must come fully on screen.
   §4.4 explains why Chrome cannot prove this.
3. **The `afterGuess` timing feel.** Vocabulary English-to-Greek in any chapter.
   The clip now holds the next question back; the question is whether that reads
   as deliberate or as slow.
4. **Airplane-mode walk**, as every phase ends.
5. Two items I would add: the spellers waiting for Next (change 1 above) and the
   two chapter-2 exercises' reversed advance direction (change 4). Both are
   ledger-confirmed, both will feel wrong for the first minute.
