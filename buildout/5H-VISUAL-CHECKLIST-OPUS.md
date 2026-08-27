# 5H-VISUAL-CHECKLIST-OPUS

Resumable page-by-page visual checklist for 5H-SPEC1 (section 7.2). Every rail
stop of chapters 11 and 12, at 320 px and 768 px, loaded in a real browser and
compared against the corresponding rail-walk screenshot.

METHOD. `npm run preview`, then
`node scripts/ui-walk.mjs --chapters=chapt_11,chapt_12 --out=buildout/screenshots/5h-walk-opus`.
The corpus is `buildout/screenshots/5h-walk-opus/{320,768}/<chapter>/<stop>.png`
plus one file per authored expander state and per chart state; the walker's own
structural dump (`walk-report.json`) carries the rendered text, the underline
runs, the tap inventory and the 320 px overflow measurement for every stop, so
"which words are tappable" is read off the SURFACE rather than off the JSON.
Three states that the rail walker cannot reach on its own were photographed by
hand and are named in their rows.

RAIL-WALK REFERENCE. `ch11railwalk.pdf` (24 pages) and `ch12railwalk.pdf`
(21 pages); the "rail walk" column gives the PDF page the row was compared
against.

Status: PASS / PASS+note / FAIL. Every row below is PASS at the state
delivered. Rows whose comparison turned up a real difference say what was
changed to close it.

320 px OVERFLOW: **zero stops overflow** in either chapter at the delivered
state (walker measurement, `overflow320` in `walk-report.json`). One stop did
before this round's work — `chapt_12/c12_learn_imperfect` topic 5, 12 px, the
Contraction Examples rows — and row 12.9 records the fix.

---

## Chapter 11 — Demonstrative and Relative Pronouns (27 rail stops)

| # | Rail stop | Rail walk | What was compared | Status |
| --- | --- | --- | --- | --- |
| 11.1 | `c11_learn_objectives` | p1 | Seven objectives, house "1. 2. 3." markers, objective 1's ἐκεῖνος/οὗτος inside the wrapped line | PASS+note (the two Greek words render in INK; the data ships the objectives as plain strings with no clips, exactly as chapter 7 objective 4 does — see RESULTS §5.1) |
| 11.2 | `c11_learn_english_concepts` topics 1-4 | p2 | FOUR topics; underline extents on Demonstratives / adjectives / pronouns / this / This (topic 2), who / which (topic 3), Reflexive / himself / Reciprocal / one another (topic 4); topic 4's two example sentences as hanging-indent lines inside ONE block | PASS |
| 11.3 | `c11_learn_demonstratives` topic 1 (Introduction) | p3 top-left | Two-line Greek list, both entries tappable (ἐκεῖνος; the compound οὗτος/αὕτη/τοῦτο as ONE tap), prose beneath | PASS |
| 11.4 | ...its "Demonstratives" accordion (C6) | p3 bottom-left | Boxed, collapsed by default, green title, left caret; body is the two paragraphs; "Greek Examples" is the only green-underlined element in it | PASS |
| 11.5 | ...the "Demonstrative Examples" modal (C3) | p3 bottom-right | Four verses, each Greek line one tap, gloss and reference beneath, Cancel last | PASS (hand shot: `buildout/screenshots/5h-probe-demoexamples.png`) |
| 11.6 | `c11_learn_demonstratives` topic 2 ("That") | p4 top-left | Panel heading **ἐκεῖνος — that/those**, subtitle Singular, three Greek columns, rows N G D A, Say Paradigm + Plural toggle | PASS (the panel heading was MISSING before this round — RESULTS §3.1) |
| 11.7 | ...its Plural state | p4 | Same six-column content as the original's lower half; Say Paradigm still present and still the same clip after the toggle | PASS |
| 11.8 | `c11_learn_demonstratives` topic 3 ("This") | p4 top-right | Panel heading **οὗτος — this/these**, the αὐ/ου note beneath the chart on BOTH halves, note Greek NOT tappable | PASS |
| 11.9 | `c11_drill_this_that` | p5 top-right | Greek prompt; THREE stages 2 / 3 / 8; the eight case cells in the original's two columns (Nom Sg \| Nom Pl …); Prev/Next, Pronounce, Hint, Score, Pronounce Each ON | PASS |
| 11.10 | ...its Hint on an οὗτος item | p5 bottom-right | C4 modal holding the "This" chart, a centred lone Singular/Plural toggle, NO say-all, Close last | PASS |
| 11.11 | ...its Hint on an ἐκεῖνος item | p6 top-right | The "That" chart instead — the modal title changes with the form (D-46) | PASS (pinned by ui-behavior `5H D-46 c11_drill_this_that`) |
| 11.12 | `c11_drill_translation_this_that` | p6-p10 | Multi-word Greek prompt, reference under it, three stacked English options, per-item hint | PASS |
| 11.13 | ...item 18, the drill's own end | p10 bottom-right | The activity-local Next greys; the sequential rail Next stays live (directive 7) | PASS (pinned by ui-walk "all rail counts and Next actions are live") |
| 11.14 | `c11_ex_speller_this_that` | p11 top-left | "English" label over the parse-tagged prompt, "Spell Greek" answer box, Greek keyboard, Show Answer / With Accents / Pronounce Each | PASS |
| 11.15 | `c11_learn_relatives` topic 1 (Introduction) | p11 top-right | The TBK's own "Relative Pronouns" text with its (cont.) rule, flagged | PASS+note (the pending-verification banner renders under it while VERIFY-5H (a) is open — RESULTS §5.2) |
| 11.16 | `c11_learn_relatives` topic 2 (Relatives Paradigm) | p12 top-left | Panel heading **ὅς — who/which**, six columns split sg/pl, the "Note how similar…" line, Say Paradigm | PASS |
| 11.17 | `c11_learn_relatives` topic 3 (Reflexive/Reciprocal) | p11-p12 | Prose; αὐτός and ἀλλήλων tap and nothing else does | PASS (the two taps were DEAD before this round — RESULTS §3.2) |
| 11.18 | `c11_learn_relatives` topic 4 (Reflexive Paradigm) | p13 | SIX charts on one More/Back stack, First → Second → Third Person, each split Singular/Plural, each with the no-nominative note and the person's own Say Paradigm; Back left / More right, both always visible, disabled at the ends | PASS |
| 11.19 | `c11_drill_who_the` | p14 top-left | Three-stage grid, Who/which vs The, gender, the 8-cell case block | PASS |
| 11.20 | ...its Hint on an article item | p14 top-right | The Definite Article "the" chart, centred sg/pl toggle | PASS (the original's underlined Singular/Plural headers are inert provenance, §3.2) |
| 11.21 | ...its Hint on a relative item | p14 bottom-right | The ὅς chart WITH its note | PASS |
| 11.22 | `c11_drill_translation_relative` | p14-p17 | Nine items, references, three English options, single ὅς hint | PASS |
| 11.23 | `c11_ex_speller_relative` | p17 top-right | 26 mixed relative/reflexive parse-tag prompts | PASS |
| 11.24 | `c11_learn_vocab` | p17 bottom-left | Flashcard stepper, "Greek Word" / "Word Meaning", card 1 on mount, Show Both / Hide Greek / Hide English | PASS |
| 11.25 | `c11_drill_vocab_gk_en` | p17 bottom-right, p18 top-left | Greek prompt, ELEVEN English options in the responsive vocabulary grid | PASS+note (the original's twelfth cell is BLANK; the data ships eleven options and the port draws no dead cell — RESULTS §5.3) |
| 11.26 | `c11_drill_vocab_en_gk` | p18 top-right | English prompt, eleven Greek options including both ὑπέρ senses | PASS |
| 11.27 | `c11_ex_vocab_speller` | p18 bottom-right | "English Meaning" / "Spell Greek Word"; ten items | PASS |
| 11.28 | `c11_learn_scripture` | p19 top-left | Mat 6:33b interlinear, five words, each Greek word its own tap, Say Whole Verse | PASS |
| 11.29 | `c11_drill_scripture_memory` | p19 top-right | TWELVE prompts spanning both halves of Mat 6:33 against one static twelve-cell English grid | PASS |
| 11.30 | `c11_ex_scripture_speller` | p19 bottom-right | Whole-verse speller, reference, keyboard, no Repeat control | PASS+note (the original's English hint prints under the keyboard; the port puts it behind `Show Answer` with the verse, the C8/D-30 shape every other verse speller uses — RESULTS §5.4) |
| 11.31 | `c11_qr_vocab` | p20 top-right | Eleven rows in two columns, NT frequency after each translation, ὑπέρ split with (150) on the genitive row only, the footnote, Say Whole List | PASS (the frequencies were MISSING before this round — RESULTS §3.3) |
| 11.32 | `c11_qr_this_that` | p20 bottom | C9: FOUR half-charts stacked (ἐκεῖνος sg, ἐκεῖνος pl, οὗτος sg + note, οὗτος pl), one say-all per chart, no toggle, no pager | PASS |
| 11.33 | `c11_qr_relative` | p21 top-left | Two stacked halves plus the note | PASS |
| 11.34 | `c11_qr_reflexive` | p21 | C9: SIX half-charts stacked | PASS |
| 11.35 | `c11_qr_scripture_*` (five verses) | p22, p23 top-left | Jn 1:1, Rom 6:23a, Rom 6:23b, Mat 6:33a, Mat 6:33b interlinear, each with Say Whole Verse; no Rom 3:23 | PASS |
| 11.36 | `c11_learn_bibliography` | p23 top-right | Four plain-string biblist items with hanging indents | PASS |

---

## Chapter 12 — Imperfect Verbs (24 rail stops)

| # | Rail stop | Rail walk | What was compared | Status |
| --- | --- | --- | --- | --- |
| 12.1 | `c12_learn_objectives` | p1 top-right | Six objectives; 1 and 2 wrap onto indented continuation lines | PASS |
| 12.2 | `c12_learn_english_concepts` topics 1-2 | p1 bottom | TWO topics; underlines on drove / was driving and aorist / imperfect | PASS |
| 12.3 | `c12_learn_imperfect` topic 1 (Introduction) | p2 top-left | Three paragraphs, no taps | PASS |
| 12.4 | `c12_learn_imperfect` topic 2 (Form) | p2 top-right, p3 | Prose, then the centred formula block over two lines, then "ε + λυ + ο + ν = ἔλυον" over "Aug Stem CV Ending"; the Form (cont.) connecting-vowel lines MERGED in (C5) with a gap before them | PASS+note (the Greek formula line is ONE tap unit playing ἔλυον; the rail walk hands sit on ε, λυ and ἔλυον and VERIFY-5H (j) settles whether they are three clips — RESULTS §5.5) |
| 12.5 | `c12_learn_imperfect` topic 3 (Imperfect Active) | p4 top-left | Panel heading "Imperfect Active Indicative of λύω" with **λύω tappable**, two columns with English glosses in the cells, rows 1 2 3, ἔλυε(ν) with its movable nu, Say Paradigm | PASS (the title tap was DEAD before this round — RESULTS §3.4) |
| 12.6 | `c12_learn_imperfect` topic 4 (Middle/Passive) | p4 bottom-left | Same shape plus the passive-voice note beneath the chart | PASS |
| 12.7 | `c12_learn_imperfect` topic 5 (Augments) | p4 bottom-right, p5, p6 top-left | ONE numbered list 1-4 (the Augments (cont.) rules merged, C5); rule 2's eight contraction equations as three lines inside item 2; the compound-verb forms tappable | PASS |
| 12.8 | ...its "Contraction Examples" accordion (C1) | p5 bottom | Five rows, each reading rule / augmented form / lemma + "ε augment"; BOTH Greek forms tap | PASS (the augmented forms were MISSING and the row order wrong before this round — RESULTS §3.5) |
| 12.9 | ...the same accordion at 320 px | p5 bottom | No horizontal overflow | PASS (was 12 px of overrun on `.rc-parts`; the row now drops the derivation to its own line below 560 px) |
| 12.10 | `c12_learn_imperfect` topic 6 (εἰμί) | p6 top-right | Panel heading "εἰμί Imperfect Indicative" with **εἰμί tappable**, ἤμην … ἦσαν, Say Paradigm | PASS |
| 12.11 | `c12_learn_imperfect` topic 7 (ἔχω) | p6 bottom-right, p7 | Panel heading with **ἔχω tappable**; the exception note beneath, with **θέλω and ἤθελεν tappable inside it** | PASS (both note taps were DEAD before this round — RESULTS §3.2) |
| 12.12 | `c12_drill_parsing` | p8 top-left | TWO stages — Active \| Middle/Passive, then the six person/number cells in three paired rows; Translate button present | PASS |
| 12.13 | ...its Hint on a λύω form | p10 top-left | The λύω Active chart with an "Middle/Passive" toggle | PASS |
| 12.14 | ...its Hint on an εἰμί/ἔχω form | p8 top-right | "Imperfect of εἰμί" with an "ἔχω" toggle — the hint's OWN titles, lowercase glosses, no exception note | PASS (pinned by ui-behavior `5H D-46 c12_drill_parsing`) |
| 12.15 | `c12_drill_augment` — before the guess | p8 bottom-right | Prompt panel of THREE lines (present lemma, gloss, reference); three Greek options in one column; lemma in INK and Pronounce DISABLED; the drill mounts silent | PASS (new behavior this round, proposed D-50 — RESULTS §3.6; hand shot `5h-probe-augment-before.png`) |
| 12.16 | ...after the guess | p8 bottom-right | The correct option marked, the lemma now tappable, Pronounce live, both replaying the clip | PASS (hand shot `5h-probe-augment-after.png`) |
| 12.17 | ...its Hint | p9 | The full "The augment is added in 4 ways:" page, transcribed from the hint's own field, one flowing modal with no toggle | PASS |
| 12.18 | `c12_drill_translation` | p9 bottom-right, p10-p15 | Twenty items, references, three English options, single λύω hint; item 20's two-line Greek | PASS |
| 12.19 | `c12_ex_speller` | p15 top-right | 23 English prompts; ἔλυε/ἔλυεν and εἶχε/εἶχεν both accepted | PASS |
| 12.20 | `c12_learn_vocab` | p15 bottom-left | Flashcard stepper, card 1 (ἀποθνῄσκω / I die) on mount | PASS |
| 12.21 | `c12_drill_vocab_gk_en` / `c12_drill_vocab_en_gk` | p15 bottom-right, p16 top-left | Ten options each way | PASS |
| 12.22 | `c12_ex_vocab_speller` | p16 top-right | Ten items | PASS |
| 12.23 | `c12_learn_scripture` | p16 bottom-left | Mat 6:9 interlinear, ten words, each its own tap, Say Whole Verse | PASS+note (the original breaks the ten words into three fixed lines; the port's interlinear flows and wraps, the shape every chapter's Learn Scripture Memory has used since chapter 1) |
| 12.24 | `c12_drill_scripture_memory` | p16 bottom-right | SEVEN prompts (the articles are not drilled) against a seven-cell English grid | PASS+note (the original's eighth cell is BLANK; the data ships seven options — same call as row 11.25) |
| 12.25 | `c12_ex_scripture_speller` | p17 top | Whole-verse speller for Mat 6:9; the ano teleia after οὐρανοῖς and σου optional | PASS |
| 12.26 | `c12_qr_vocab` | p17 bottom-left | Ten rows, NT frequencies, footnote, Say Whole List; μέν's "one the one hand, indeed" verbatim | PASS (frequencies restored, as row 11.31; the typo is VERIFY-5H (g)) |
| 12.27 | `c12_qr_paradigms` | p17 bottom-right, p18 | C9: Active above Middle/Passive, one say-all each, the note beneath the second; page titled with the menu's plural | PASS |
| 12.28 | `c12_qr_eimi` | p18 bottom | One chart, its title's **εἰμί tappable**; ἔχω is NOT reviewed | PASS |
| 12.29 | `c12_qr_scripture_*` (six verses) | p19, p20 top | Jn 1:1, Rom 6:23a, Rom 6:23b, Mat 6:33a, Mat 6:33b, Mat 6:9 | PASS |
| 12.30 | `c12_learn_bibliography` | p20 bottom-left | Four items | PASS |

---

## Standing row — the forced-scroll divider check (DISCLOSURE-RULES §4.3)

> Resize until the modal's content is forced to scroll, scroll to the end, and
> confirm the padding above and below the divider is equal, with exactly one
> divider in the dialog.

Machine equivalent: `ui-disclosure.mjs` **D13**, extended this round with the
eight new modal surfaces below and run at 390x520.

| # | Modal state | Route | Status |
| --- | --- | --- | --- |
| S.1 | ch11 This and That hint, both states | `chapt_11/c11_drill_this_that` → Hint | PASS |
| S.2 | ch11 Who and The hint, both states | `chapt_11/c11_drill_who_the` → Hint | PASS |
| S.3 | ch11 This and That Translation hint, both states | `chapt_11/c11_drill_translation_this_that` → Hint | PASS |
| S.4 | ch11 Relative Translation hint, both states | `chapt_11/c11_drill_translation_relative` → Hint | PASS |
| S.5 | ch11 Demonstrative Examples popup | `chapt_11/c11_learn_demonstratives` → accordion → Greek Examples | PASS |
| S.6 | ch12 Parsing hint, both states | `chapt_12/c12_drill_parsing` → Hint | PASS |
| S.7 | ch12 Translation hint, both states | `chapt_12/c12_drill_translation` → Hint | PASS |
| S.8 | ch12 Augment Drill hint (no navigation at all) | `chapt_12/c12_drill_augment` → Hint | PASS |

Modal sizing at five device heights (390x844, 390x734, 390x664, 320x360,
768x1024) is covered by `ui-modals.mjs`, extended this round with sixteen new
surfaces including both form-dependent hint routes of each D-46 drill and both
new Greek-keyboard references.
