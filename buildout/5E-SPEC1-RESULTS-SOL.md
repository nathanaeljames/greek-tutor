# 5E-SPEC1-RESULTS-SOL.md

## 1. Summary

Implemented the Chapter 4 and Chapter 5 renderer support, data-fidelity
repairs, responsive drill layouts, and acceptance harness required by
5E-SPEC1. The machine walk covered all 105 Chapter 1–5 rail stops at both
widths, produced evidence for every one of the 62 enumerated Chapter 4/5
pages, found zero horizontal overflow, and the final behavior suite passed
96/96 checks. Production build, shape, lazy-chunk, offline-route, and
Chapter 1–3 hash regression checks are green. The important unresolved
finding is that both supplied PDFs and both delivered chapter files contain
only 8 and 9 Scripture Memory choices respectively, while the formal spec
requires 10; I reported the two rows as DIFFERS rather than inventing
unauthored distractors.

## 2. Scope conformance

| Spec section | Built | Notes |
| --- | --- | --- |
| §4.1 paradigm row `label` | Yes | `Paradigm` renders `row.label ?? row.person`, retaining Chapter 3's person rows. |
| §4.2 `charts[]` + `switch` | Yes | More/Back and named Singular/Plural variants work, retain a live sequential rail, and reset on activity remount. |
| §4.3 Meanings expander | Yes | Legend, rows, and closing text render through the shared recursive Meanings panel. |
| §4.4 D-26 two-column exemption | Yes | Explicit `paradigm2col` stays two-up at both widths; D-19 vocabulary pools are 2-up/4-up. |
| §4.5 `revealButtons` | Yes | Authored Translate/Gender text appears under the reference and clears on item change. Auto-reveal was deliberately not guessed. |
| §4.6 `spell` promptLabel + ref | Yes | Prompt caption and per-item reference chip render without changing keyboard/checking behavior. |
| §4.7 chart `note` | Yes | Article and δόξα notes render as chart ink, not banners. |
| §4.8 smaller data keys (7) | Yes | `lexicalForm`, `showGlosses`, `optionLayout`, `numbered`, `greekRows.layout`, Meanings `legend`/`closing`, and spellVerse audio are supported. The last already existed and needed no new branch. |
| §5 drill matrix classes | Yes, with one delivered-data conflict | `manualOnIncorrect`, `autoBoth`, and `manual` behavior is asserted. The two Scripture option pools remain 8/9 rather than the formally required 10 because no extra authored choices exist. |
| §8 tests and evidence | Yes for implementer-owned checks | All machine checks and PDF comparisons are recorded. The real-device airplane-mode walk remains explicitly assigned to Nathanael by §8.7. |

The only support beyond the literal seven renderer bullets was narrowly
required by §0 visual fidelity or standing contracts: bibliography title
italics via a small `[[i]]` markup token; resolving topic-ID Hint references;
mapping `greekTaps: true` from the already-loaded chapter lexicon; suppressing
a duplicate topic/chart heading; and making `promptFrom.show: "sentence"`
explicit on the two full-option noun drills that otherwise presented a blank
prompt. I also corrected the shared D-19 vocabulary-grid rule in both
directions for Chapters 1–5 because the acceptance contract explicitly
requires the regression assertion. No audio-store, cache ownership, route,
font, mark-geometry, or Chapter 6+ code was changed.

## 3. Data edits made under §0

| File | Path in JSON | Before | After | Why |
| --- | --- | --- | --- | --- |
| `src/data/chapt-04.json` | `learn[c4_learn_scripture].words[7].greek` | `"δι "` | `"δι᾽"` | Remove extraction-space corruption and restore the elision mark shown in the PDF. |
| `src/data/chapt-04.json` | `drill[c4_drill_scripture_memory].items[6].greek` | `"δι "` | `"δι᾽"` | Same authored word on the drill surface. |
| `src/data/chapt-04.json` | `exercise[c4_ex_scripture_speller].answerWords[7]` | `"δι "` | `"δι᾽"` | Keep the whole-verse answer identical to the displayed verse. |
| `src/data/chapt-04.json` | `quickReview[c4_qr_scripture_b].words[7].greek` | `"δι "` | `"δι᾽"` | Same authored word on Quick Review. |
| `src/data/chapt-04.json` | `learn[c4_learn_bibliography].content[0].items[0..3]` | Four plain-text book titles | Each title wrapped in `[[i]]…[[/i]]` | The rail walk italicizes the title portion while retaining hanging indents. |
| `src/data/chapt-04.json` | `drill[c4_drill_greek_noun].promptFrom` | absent | `{ "show": "sentence" }` | The full-option drill's authored sentence must be visible rather than leaving a blank prompt panel. |
| `src/data/chapt-04.json` | `exercise[c4_ex_vocab_speller].promptLabel` | `"English Meaning"` | `"English Word"` | §4.6's literal caption wins over the PDF wording. |
| `src/data/chapt-04.json` | `quickReview[c4_qr_vocab].columns` | absent | `2` | Restore the two-column desktop chart from the source frame. |
| `src/data/chapt-04.json` | `quickReview[c4_qr_vocab].footnote` | absent | `"The number after the translation is the number of times the word occurs in the New Testament."` | Restore the exact NT-frequency explanation shown in the PDF. |
| `src/data/chapt-05.json` | `learn[c5_learn_bibliography].content[0].items[0..3]` | Four plain-text book titles | Each title wrapped in `[[i]]…[[/i]]` | Restore title emphasis while preserving hanging indents. |
| `src/data/chapt-05.json` | `drill[c5_drill_first_decl_noun].promptFrom` | absent | `{ "show": "sentence" }` | The authored sentence must be visible on the single-column full-option drill. |
| `src/data/chapt-05.json` | `exercise[c5_ex_vocab_speller].promptLabel` | `"English Meaning"` | `"English Word"` | Apply §4.6's shared vocabulary-speller caption. |
| `src/data/chapt-05.json` | `quickReview[c5_qr_vocab].columns` | absent | `2` | Restore the two-column desktop chart from the source frame. |
| `src/data/chapt-05.json` | `quickReview[c5_qr_vocab].footnote` | absent | `"The number after the translation is the number of times the word occurs in the New Testament."` | Restore the exact NT-frequency explanation shown in the PDF. |

For completeness, the four title strings changed in each bibliography are
Machen's *New Testament Greek for Beginners*, Mounce's *Basics of Biblical
Greek: Grammar*, Summers and Sawyer's *Essentials of New Testament Greek*,
and Wenham's *The Elements of New Testament Greek*. No other generated data
was edited.

## 4. Visual verification

The complete evidence and per-width filenames are in
`5E-VISUAL-CHECKLIST-SOL.md`. All **62 of 62** pages were walked and compared:
**48 MATCH, 12 MATCH-TO-SPEC, 2 DIFFERS, 0 BLOCKED**. MATCH-TO-SPEC is kept
separate so intentional responsive or standing-contract departures are not
silently presented as DOS-exact matches.

The two DIFFERS rows share one source/spec conflict:

- Chapter 4 row 20: the PDF and delivered data provide 8 Scripture Memory
  option tiles, while §2.5 and DRILL-MATRIX require 10. This is an authored
  data/spec conflict, not a renderer defect; no distractors were fabricated.
- Chapter 5 row 25: the PDF and delivered data provide 9 option tiles, while
  §3.4 and DRILL-MATRIX require 10. This is the same authored data/spec
  conflict.

Every stop and every opened state in the two new chapters measured **0px**
horizontal overflow at 320px, so there is no unique worst page; all 41 rail
stops tie at zero. The evidence corpus contains 474 PNGs plus the structured
walk report, including every topic, expander, alternate chart, Hint modal,
and first flashcard state.

## 5. Harness changes

`ui:walk` now defaults to Chapters 1–5, steps every topic, opens each authored
expander and alternate chart, exercises every topic-ID Hint modal, advances
flashcards to a real first card, records structural/emphasis/tap evidence,
and takes both base and state screenshots. It measures document, card, and
structural overflow at 320px, validates rail cardinality/live Next actions,
and records interaction and console errors in `walk-report.json`.

`ui:behavior` retains the Chapter 1–3 A4/A6 spelling, caret, reset, timing,
letter-grid, divider, and objective checks, then adds More/Back and named
toggle transitions, live sequential Next assertions, route-remount resets,
Translate/Gender placement and clearing, new-chapter advance timing, and
D-19/D-26 grid checks. The D-19 assertion deliberately covers both vocabulary
directions in all five chapters. Browser launch fallback is shared by both
harnesses so the scripts use pinned Playwright Chromium when available and
installed Chrome/Edge otherwise.

`check-content-shapes` now validates all five chapter files and the newly
used content/paradigm shapes. `check-lazy-chunk` now requires separate Chapter
4/5 data and lexicon chunks in addition to the unchanged Chapter 1–3
assertions.

## 6. Test results

| Check | Result |
| --- | --- |
| `ui:walk` chapters 1-5 | PASS: 105 stops × 2 widths; 124 width-specific checklist shots for 62 pages; 41 Chapter 4/5 overflow records all 0px; 0 rail, interaction, or console errors. |
| `ui:behavior` chapters 1-5 | PASS: 96/96 real-UI checks. Ch4 timing 2061ms/4077ms and ch5 timing 2048ms/4061ms for correct/incorrect examples. |
| `check:shapes` | PASS: Chapters 1–5; content modes, paradigm rows/columns, spellVerse words, audio-mode branches, mark geometry, and shared keyboard typeability. |
| `check:lazy-chunk` | PASS: all five chapter/lexicon pairs emitted and precached; chapter data absent from the main bundle. |
| chapt-01/02/03 chunk hashes unchanged | PASS: `8ZoFoXk9`, `CFgjCaAb`, `CPP2o90H`; lexicons `DWCL8L3K`, `DMecEUSp`, `DU3wQSch`. |
| precache entry count / size delta | Final 27 entries / 678.64 KiB. Against closed 5D2: +4 entries / +117.04 KiB. Against this run's initial current-data build (27 / 660.89 KiB): +0 / +17.75 KiB. |
| production build | PASS: 86 modules; only the pre-existing `DivideActivity.svelte` noninteractive-tabIndex warning. |
| browser offline smoke | PASS: service worker controlled; uncached fetch rejected; Chapter 4 and Chapter 5 activity routes loaded offline; Chapter 5 reloaded offline. |
| `git diff --check` | PASS; only Git's informational LF-to-CRLF working-copy warnings. |

No implementer-owned machine test was skipped. The §8.7 physical-device
airplane-mode walk was not run because the spec explicitly assigns it to
Nathanael; the browser offline smoke above is supplementary, not a claim to
have completed that device check.

## 7. Surprises

The formal ten-choice Scripture rule conflicts with both rail walks and both
delivered data files. Adding one or two arbitrary translations would have
made the numeric test green while reducing source fidelity, so the delivered
pools were left intact and surfaced plainly.

Several delivered shapes were more capable than the pre-5E renderer:
`greekTaps: true` had no chapter-lexicon resolution path, all three `hintRef`
values were topic IDs while the old resolver only found top-level blocks,
and paradigm data already used `columnAudio`, `columnGroups`, and
`sayWholeEach`. Those are now consumed without a cache/store scan or another
audio-byte owner. Conversely, §4.8's spellVerse `audio` item was unnecessary:
the shared spellVerse/audio path already supported it, so no duplicate branch
was added.

Visual comparison found data details that shape checks could not: plain
bibliography titles needed selective italics, the vocabulary Quick Reviews
were missing the frequency sentence and desktop column intent, and the two
full-option noun drills had no explicit sentence prompt selector. It also
confirmed the original's label inconsistency: γραφή uses `Nom.\Voc.`, ὥρα
uses `Nom./Voc.`, and the delivered/PDF δόξα chart omits the final period as
`Nom./Voc`, despite nearby prose implying both Alpha charts use the same
punctuation.

The flashcard rail frames begin on a lemma, while the ratified shared app
contract begins on an instructional state. The walker now captures the first
real card as additional evidence and records those rows as MATCH-TO-SPEC
rather than changing the shared behavior.

## 8. What you did NOT verify

I did not listen to audio bytes. The preview proves control wiring and leaves
the frozen audio ownership architecture untouched, but phonetic correctness,
real WebKit playback, cumulative-pack availability, interruption, and
audio-stop-on-exit still need a device/listening pass. I did not perform the
physical-device airplane-mode walk assigned by §8.7; only a controlled Chrome
offline smoke was executed.

The PDF comparison is a rendered side-by-side visual audit, not a pixel-diff
claim: randomized drills can show a different item while their arrangement
and controls are compared. Every authored item is shape-validated, but every
random item was not individually screenshotted. Readability/discoverability
questions (More/Back, seven-topic rails, and duplicated English Concepts)
remain human judgements. The original's automatic reveal timing could not be
settled from still images and was intentionally left button-driven as §4.5
directs.

## 9. Open items for VERIFY-5E

Do not create VERIFY-5E until grading selects the winning implementation.
The judgement list for that later pass is:

1. Decide whether the delivered 8/9-choice Scripture pools should remain
   source-faithful or receive specifically authored distractors to satisfy
   the formal 10-choice rule.
2. Does More/Back clearly communicate a second chart while the sequential
   rail remains live?
3. Does the article Singular/Plural toggle read correctly when its label names
   the chart not currently shown?
4. Should the Declining Noun translation reveal automatically after an
   answer in the original, or remain explicitly button-driven?
5. Do the seven-topic Learn pages read comfortably at phone width?
6. Is Chapter 5's near-duplicate English Concepts sequence acceptable on a
   device, given the original's “proceed with haste” line?
7. Perform the real WebKit/audio pass: paradigm cells, Say Whole List clips,
   cumulative Scripture clips, interruption, and audio stop on exit.
8. Perform the physical-device airplane-mode walk of both chapters.
9. Chapter 4 Greek Noun Drill item 3 (Mat 5:24): the shipped underline is
   `brother`; the run table said `to`. Confirm against DOSBox.
10. Listen-check Chapter 4 `d_sm6` / `d_sm6b` / `d_sm7` for the εἰ / μὴ /
    “εἰ μὴ” assignment.
11. Listen-check Chapter 5 `e_graphn`, which is doubled across γραφή and
    γραφῇ; `e_grapax` and `e_aleia` remain unreferenced.
12. Chapter 5 `e_artmas` / `e_artfem` / `e_artneu` / `e_artpar` have no
    surface in the rail walk or this build; decide whether that is intentional.
13. Chapter 4 `d_adepar` still has no surface.

## 10. Cost and time

| | |
| --- | --- |
| Wall-clock | Approximately 1 hour 45 minutes, 2026-08-03 20:30–22:15 EDT |
| Model / tooling | Codex GPT-5.6 Sol; PowerShell, Node.js, Vite, Svelte, Playwright/Chrome; three parallel read-only implementation/PDF audits after bounded initial edits |
| Approximate cost | Not exposed by the runtime |
| Turns / sessions | One continuous implementation session |
