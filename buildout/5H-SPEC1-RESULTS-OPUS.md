# 5H-SPEC1-RESULTS-OPUS

Implementation handoff for 5H-SPEC1 (Revision 2), chapters 11
(Demonstrative and Relative Pronouns) and 12 (Imperfect Verbs).
Base: `87ab1f6` ("saving 5H SPEC1 before implementation"), working tree clean
at start apart from a pre-existing edit to `buildout/New Cohort Prompt.txt`
that is not mine and is untouched.

No git was run beyond read-only `git status` / `git diff` (rule 0.2). Nothing
is staged, committed or pushed.

Companion documents: `5H-SPEC1-BUILD-OPUS.md` (the complete cumulative diff,
the tool log and the wall clock) and `5H-VISUAL-CHECKLIST-OPUS.md` (the
page-by-page visual pass of section 7.2).

---

## 1. Headline

All four data files were present and were shipped **verbatim** — no content
edit was needed or made. Every one of the 51 new rail stops renders, walks and
works offline. The round's code changes are seven small renderer extensions
plus the harness work; there is **no new block type and no new mode**, exactly
as section 4 predicted.

What the visual pass found that a JSON check could not: **five fidelity
defects**, three of them in shared code that had been quietly losing content in
already-shipped chapters. They are section 3.

| Work item | State |
| --- | --- |
| W1 lazy-chunk + TOC | done — `toc.json` already carried both chapters; the glob picked the files up by name; the guard now names them |
| W2 Learn pages, both chapters | done — including the C6 accordion + C3 modal (ch11) and the C1 accordion + two C5 merges (ch12) |
| W3 Paradigm surfaces | done — named sg/pl toggles keep their say-all across states; the six-chart More/Back stack is bounded correctly |
| W4 seven drills | done — three-stage grid with an eight-value stage, per-item `hintRef`, `answerAlt` tuples, the Augment Drill panel and its answer-clip gate |
| W5 Hint modals | done — eight new D13 surfaces, sixteen new ui-modals surfaces |
| W6 seven spellers | done — no code change needed |
| W7 Vocabulary + cumulative SM drill | done — plus the `senses`-pool NT-frequency restoration |
| W8 Quick Review C9 stacks | done — no code change needed |
| W9 harness, checklist, airplane mode, docs | done |

---

## 2. What was built, module by module

### 2.1 Data (no edits)

`chapt-11.json`, `chapt-12.json`, `lexicon-chapt11.json`,
`lexicon-chapt12.json` are the delivered files, byte for byte. `npm run
check:shapes` passes over all twelve chapters, which includes the manifest
resolution of every clip id the new data names.

A key census over all twelve chapters found exactly **one enum value** the
renderer did not know (`greekRows` `layout: "contraction"`), **one new
activity key** (`select.promptGloss`) and **one inert key**
(`paradigm.headerUnderline`, §3.2 provenance). Everything else the two
chapters use was already registered. The `_`-prefixed provenance keys
(`_stage_note`, `_audio_note`, `_disclosure`, `_layout_note`, `_menu_note`,
`_verify`, …) ride existing contracts.

### 2.2 Renderer changes (seven, all small)

1. **`Paradigm.svelte` — a `charts[]` block prints its CHART's panel heading.**
   `title` was an outer prop only, so a stack whose heading lives on each chart
   printed no heading at all. Now the chart's title is used when the host has
   none, suppressed when it merely repeats the heading the host already printed
   (chapters 4, 5, 7 title their charts exactly as their topics are titled and
   are unchanged).
2. **`Paradigm.svelte` — `titleAudio` on a panel heading (D-40).** The heading
   splits into Greek runs and each run taps the host's declared clip.
3. **`Paradigm.svelte` — `noteTaps`.** A chart's `note` line reads a
   host-declared form → clip map when the chart has no `noteTaps` of its own.
   Deliberately NOT the chapter-wide tap map: that would have blued words in
   older chapters' notes that the original prints as plain notation
   (chapter 5's "Note ὁ and ἡ are enclitics").
4. **`RichContent.svelte` — `greekRows` `layout: "contraction"`.** One row per
   example, reading rule / augmented form / lemma + "ε augment", both Greek
   forms tapping. Plus its CSS: the derivation drops to its own line below
   560 px, which is also what removes the round's only 320 px overflow.
5. **`ContentAudio.svelte` — the topic-heading fold generalised.** Was "the
   chart says the topic's heading AND MORE of it"; now "the chart prints a
   panel heading of its own". It also passes `titleAudio` and `noteTaps` down.
6. **`SelectActivity.svelte` — the Augment Drill prompt panel and its
   answer-clip gate.** `promptGloss` prints the item's English under the Greek
   lemma and above the reference; the gate is section 3.6.
7. **`content.js` — two folds.** Topic-level `audioMap` is read alongside
   activity-level, and the `senses` pool carries each lemma's `ntFreq`
   (section 3.3).

### 2.3 Harness (section 7.3 and 7.1)

- `check-lazy-chunk.mjs`: chapters 11 and 12 named, with distinctive needles.
- `ui-behavior.mjs`: both chapters added to `CHAPTERS` (every existing sweep
  now covers them) and to `CH_5F` (the ledger read-back), plus a new **5H
  section** of twelve assertions: the 2/3/8 stage split; `answerAlt` on a
  three-stage tuple; the D-46 modal-title switch in both chapters; the named
  toggle keeping its say-all; the six-chart stack and its bounds; the Augment
  Drill's Greek options, three-line panel, silent mount, ink-lemma gate and
  post-guess release; the cumulative twelve-option SM grid.
- `ui-behavior.mjs` 5E-R1: the heading-pair sweep now folds through the
  renderer's own `headingKey` (it was comparing raw text, so the Masc/Masculine
  pair it exists for was landing in the wrong bucket), reads only the heading a
  `charts[]` block actually PRINTS at rest, and asserts one printed heading for
  every replaced pair in chapters 9-12.
- `ui-disclosure.mjs`: eight new D13 modal surfaces (four ch11 hints, two ch12
  hints, the ch12 inline Augment hint, the ch11 Demonstrative Examples popup)
  with a new `expanderlink` opener; the `poolKind` census raised from 8 to 12.
- `ui-disclosure3.mjs`: the census now spans twelve chapters — 270 activities,
  115 ledger rows, 15 changed / 251 already-loaded / 4 exempt.
- `ui-modals.mjs`: sixteen new surfaces, including both form-dependent routes
  of each D-46 drill (sought by FORM, not left to shuffle) and both new
  Greek-keyboard references.
- `ui-offline.mjs`: default chapter set is now 11 and 12.

---

## 3. Fidelity defects the visual pass found (with before/after)

Every one of these was invisible to `check:shapes` and to a JSON read; every
one is what section 7.2 exists to catch.

### 3.1 Chapter 11's paradigm panels had NO heading

The original heads each demonstrative paradigm with the lemma —
"ἐκεῖνος -- that/those" — and drops the radio column on those screens. The port
printed the RADIO LABEL ('"That" Paradigm') and the subtitle ("Singular") and
nothing else: the lemma heading the data ships on every chart never rendered,
because `RichContent` passed the BLOCK's title and these blocks carry theirs on
each chart.

- Before: `"That" Paradigm` / `Singular` / chart.
- After: `ἐκεῖνος — that/those` / `Singular` / chart — one heading, the
  original's own.

Six surfaces fixed (both demonstratives, the relative paradigm, the
six-chart reflexive stack, and the same headings in chapter 12's four
paradigm topics). Chapters 4, 5, 7 and 8 are byte-identical on screen: their
chart titles either repeat the topic title (dropped) or sit on the wrapper
(already printed).

### 3.2 Topic-level `audioMap` was never read; four Greek taps were dead

Chapters 11 and 12 declare `audioMap` on the TOPIC that prints the forms;
`chapterAudioMap()` only walked activity-level maps.

- Before: ch11 Reflexive/Reciprocal prose — 0 taps; ch12 ἔχω exception note —
  0 taps.
- After: αὐτός and ἀλλήλων tap (ch11); θέλω and ἤθελεν tap inside the note
  (ch12).

The rail walk marks hand cursors on all four (ch11railwalk p11-p12,
ch12railwalk p7), so these are directive-9 restorations, not additions.

### 3.3 The `senses` vocabulary pool dropped every NT frequency

`showNtFreq: true` reads `meta.ntFreq`, and the senses pool hands the surface a
CARD, which never carried the lemma's count. **This is not a chapter 11/12
bug**: chapters 9 and 10 shipped their Review Vocabulary Charts the same way
and have been printing bare glosses since 5G.

- Before (ch10 and ch11 alike): `ἀπέρχομαι  I go away`.
- After: `ἀπέρχομαι  I go away (117)`; a case-split lemma carries the count
  ONCE, on its first card, so ὑπέρ reads "for, about (150)" over
  "above, beyond" exactly as ch11railwalk p20 prints it.

Chapters 9 and 10 gain their frequencies back as a side effect. Flagged here
because it changes two already-device-verified pages; it is a fidelity
restoration (the original prints the numbers and the data always carried
them), so per the standing rule it is not a divergence entry.

### 3.4 Chapter 12's chart titles did not tap (D-40)

`titleAudio` was declared on the topic, but the topic heading is folded away
whenever the chart prints the fuller title — so the clip had no surface left.

- Before: "Imperfect Active Indicative of λύω" in ink, λύω silent (same for
  εἰμί, ἔχω and the `c12_qr_eimi` Quick Review page).
- After: the Greek run inside the panel heading taps its clip.

### 3.5 The Contraction Examples accordion lost its augmented forms

`layout: "contraction"` was unimplemented, so the rows fell through to the
generic `parts` branch, which reads `parts` and `gloss` and ignores `greek`.

- Before: `ἀκούω  + ε augment  ε + α = η` — the augmented form ἤκουον, which is
  the entire point of the example, was **not on screen at all**, and the row
  overran 320 px by 12 px.
- After: `ε + α = η   ἤκουον` over `ἀκούω + ε augment`, both Greek forms
  tapping, three columns from 560 px up, no overflow.

### 3.6 The Augment Drill leaked its answer through audio (proposed D-50 → **D-51**)

Ledger row 108 confirms the clip is the AUGMENTED ANSWER. With the ordinary
Greek-tap contract the displayed lemma would play ἐγίνωσκεν before the guess,
and Pronounce likewise.

- Built per spec §3.5: the lemma renders in INK and Pronounce is DISABLED until
  the item is answered; after the guess both go live and replay the clip. The
  drill mounts silent (afterGuess, B-last).
- The renderer states the condition **structurally** rather than by activity
  id: Greek prompt + Greek options + `afterGuess`. That triple matches this
  activity and no other across twelve chapters, and it covers the next drill
  built this way without an edit.

**Numbering collision.** The spec proposes logging this as D-50, but D-50 was
already spent on the 2026-08-25 process rules. It is logged as **D-51** in
`DIVERGENCE-LOG.md`; the entry names the collision so the pipeline can decide
whether to renumber (the log's standing rule says never renumber).

---

## 4. Deviations from the spec

| # | Spec says | Built | Why |
| --- | --- | --- | --- |
| 4.1 | §2.1 "both Greek words are taps" on the ch11 objectives | They render in ink | The DATA ships `objectives` as plain strings with no clips, and the objectivesPage renderer has no markup contract; chapter 7 objective 4's εἰμί has shipped the same way since 5F. Spec-vs-data, and the spec's own preamble says the data wins. Making them taps needs a pipeline change, not a renderer one. |
| 4.2 | §4 "the afterGuess prompt gate" as D-50 | Logged as D-51 | D-50 is taken (section 3.6). |
| 4.3 | §2.12 the verse speller's English hint line "under the keyboard" | Behind `Show Answer`, with the verse | That is C8/D-30 and the shape all six earlier verse spellers use; putting this one hint permanently on screen would be the only speller in the app that gives its answer away. The string is the data's `translation` and is unchanged. |
| 4.4 | §7.2 "the empty grid cell" on two drills | No empty cell is drawn | The data ships 11 and 7 options; the blank is an artifact of the original's fixed 12- and 8-cell grids. The port's option grid is responsive, and a dead cell would be a control that does nothing. Recorded rather than invented. |

Nothing else in the spec was narrowed, and nothing was added beyond it except
the shared-code restorations of sections 3.2-3.4, which the visual pass forced.

---

## 5. Notes, surprises and open flags

**5.1 Objectives Greek.** See 4.1. A VERIFY item is not needed: the fix is a
pipeline one (`objectives` would have to carry a tap contract) and it affects
chapter 7 identically.

**5.2 The Relative Pronouns Introduction ships flagged.** The data carries the
TBK's unshown text and a topic-level `_verify`, which the renderer draws as a
"Some topic details are pending verification" banner — the established
treatment. It disappears when VERIFY-5H (a) resolves.

**5.3 `_verify` markers that do NOT draw a banner.** Row-level (`greekRows`
row) and activity-level `_verify` are inert; only topic-level and block-level
render one. So the ch11 Demonstrative Examples grave-accent τοὺτου (VERIFY (m))
and ch12's μέν typo (VERIFY (g)) ship verbatim and silent, which is right.

**5.4 The formula taps.** Chapter 12's Form block ships the Greek line as ONE
tap unit playing `l_as1` (its own `_note` says the rail walk shows hands on ε,
λυ and ἔλυον). Built as the data declares it; VERIFY-5H (j) settles whether
three separate clips exist.

**5.5 Both new chapters were already walkable before any code change.** The
first walk of the delivered data reported 51 stops x 2 widths, zero console
errors, zero interaction errors — the data is unusually clean. Everything this
round fixed was a rendering gap, not a data gap.

**5.6 Chapter 12's interlinear verses flow rather than break at the original's
three fixed lines.** The `interlinearVerse` mode has flowed since chapter 1;
the original's line breaks are a 640x480 artifact. Left alone.

---

## 6. Acceptance results (section 7.1)

| Gate | Result |
| --- | --- |
| `npm run check:shapes` | **PASS** — twelve chapters |
| `npm run build` | **PASS** |
| `npm run check:lazy-chunk` | **PASS** — chapt-11 + lexicon-chapt11 and chapt-12 + lexicon-chapt12 emitted, precached, out of the main bundle |
| `npm run check:docs` | **43 failures, all pre-existing** — the CRLF guard defect documented in DISCLOSURE-SPEC1 RESULTS §7.1. Every failing file is an archive document untouched this round; `DIVERGENCE-LOG.md`, which I did edit, passes. |
| `ui-walk` chapt_11, chapt_12 | **PASS** — 51 stops x 2 widths, 132 checklist shots, **0 horizontal overflow**, all rail counts and Next actions live, all authored expanders and chart states opened, no console errors |
| `ui-offline` chapt_11, chapt_12 | **PASS** — 51 stops rendered offline, 0 missing, refresh OK, no console errors |
| `ui-disclosure` | **PASS** — 303/303 (was 302/303 before the `poolKind` census was raised to twelve) |
| `ui-disclosure3` | **PASS** — 84/84, census 270 / 115 / 15-251-4 |
| `ui-behavior` | **PASS** — see the BUILD document for the full log; the twelve new 5H assertions and the ledger read-back for both chapters are green |
| `ui-modals` | **PASS** — see the BUILD document |
| Airplane mode | **PASS** — `ui-offline` installs the service worker, goes offline and walks both chapters end to end; no manifest change |

---

## 7. Initial-load classification (section 7.4)

All twenty new activities are **sequence-stepped**; there is no `afterTap`
surface in either chapter. Each loads item 1 on mount and pronounces on mount
**iff** its timing is `beforeGuess` (pronounce-on-advance).

| Ledger | Activity | Mode | audioTiming | advanceClass | Load | Speaks on mount |
| --- | --- | --- | --- | --- | --- | --- |
| 96 | c11_drill_this_that | twoStageGrid (3 stages) | beforeGuess | manualOnIncorrect | item 1 | yes |
| 97 | c11_drill_who_the | twoStageGrid (3 stages) | beforeGuess | manualOnIncorrect | item 1 | yes |
| 98 | c11_drill_translation_this_that | fullOptionGrid | afterGuess | manualOnIncorrect | item 1 | no |
| 99 | c11_drill_translation_relative | fullOptionGrid | afterGuess | manualOnIncorrect | item 1 | no |
| 100 | c11_drill_vocab_gk_en | fullOptionGrid | beforeGuess | autoBoth | item 1 | yes |
| 101 | c11_drill_vocab_en_gk | fullOptionGrid | afterGuess | autoBoth | item 1 | no |
| 102 | c11_drill_scripture_memory | fullOptionGrid | beforeGuess | autoBoth | item 1 | yes |
| 103 | c11_ex_speller_this_that | spell | afterGuess | retryUntilRight | item 1 | no |
| 104 | c11_ex_speller_relative | spell | afterGuess | retryUntilRight | item 1 | no |
| 105 | c11_ex_vocab_speller | spell | afterGuess | retryUntilRight | item 1 | no |
| 106 | c11_ex_scripture_speller | spellVerse | afterGuess | retryUntilRight | the verse | no |
| 107 | c12_drill_parsing | twoStageGrid (2 stages) | beforeGuess | manualOnIncorrect | item 1 | yes |
| 108 | **c12_drill_augment** | fullOptionGrid | **afterGuess** | manualOnIncorrect | item 1 | **no — mounts SILENT** |
| 109 | c12_drill_translation | fullOptionGrid | afterGuess | manualOnIncorrect | item 1 | no |
| 110 | c12_drill_vocab_gk_en | fullOptionGrid | beforeGuess | autoBoth | item 1 | yes |
| 111 | c12_drill_vocab_en_gk | fullOptionGrid | afterGuess | autoBoth | item 1 | no |
| 112 | c12_drill_scripture_memory | fullOptionGrid | beforeGuess | autoBoth | item 1 | yes |
| 113 | c12_ex_speller | spell | afterGuess | retryUntilRight | item 1 | no |
| 114 | c12_ex_vocab_speller | spell | afterGuess | retryUntilRight | item 1 | no |
| 115 | c12_ex_scripture_speller | spellVerse | afterGuess | retryUntilRight | the verse | no |

Both chapters' **Learn Vocabulary** flashcard steppers also load card 1 and
pronounce it, which is why the B-last changed set moves from 13 to 15; the
other 49 new stops are content pages that were already "already-loaded".
`ui-disclosure3` asserts every row of this table on the real surface.

---

## 8. Data edits

**None.** The four delivered files are unmodified. The standing exception of
rule 0.3 was not needed: every difference the visual pass turned up was a
renderer gap, and each is fixed in code.

---

## 9. VERIFY-5H items this round did NOT settle

(a) the Relative Pronouns Introduction — shipped as the TBK text, flagged.
(d) whether the original's Pronounce leaks the augmented form — the port
    disables it either way; D-51 records which half survives.
(g) μέν's "one the one hand, indeed" — verbatim.
(h) speller prompt 24 "whom (masc. nom. pl.)" — verbatim.
(j) the three formula hand cursors — one tap unit as the data declares.
(k) the listen list — untouched; no clip id was changed.
(l) the classification vetoes and the ch12 Quick Review page title — built as
    classified in section 5 of the spec.
(m) τοὺτου with a grave, ἐκεῖνοί with no breathing — verbatim.
(n) the ten-item ch11 vocabulary speller against eleven entries — built as
    delivered.

Items (b), (c), (e), (f), (i) are settled: (b)/(c)/(i) by the spec's own
Revision 2, and (e)/(f) are now machine-pinned by the two new D-46 assertions
in `ui-behavior.mjs`, which show the modal title changing with the form in both
chapters. They can be dropped from the human VERIFY document.
