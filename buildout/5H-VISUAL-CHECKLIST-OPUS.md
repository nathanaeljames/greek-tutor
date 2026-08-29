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

---

# 5H-VISUAL-CHECKLIST-2 (5H-SPEC2, section 6.2)

Every page whose DATA or RENDERER changed in 5H-SPEC2, at 320 px and 768 px,
compared against its rail-walk panel. Appended to this file rather than opened
as a new one, per spec 6.2.

METHOD. `npm run preview`, then
`node scripts/ui-walk.mjs --chapters=chapt_7,chapt_8,chapt_11,chapt_12 --out=buildout/screenshots/5h2-walk-opus`
and `node scripts/ui-modals.mjs --out=buildout/screenshots/5h2-modals-opus`.
The rail-walk panels were rendered from the PDFs with pymupdf at 200 dpi and
cropped to the quadrant named in each row — `ch7railwalk.pdf` (16 pages),
`ch8railwalk.pdf` (15), `ch11railwalk.pdf` (24), `ch12railwalk.pdf` (21).
Modal states come from the modal corpus, which photographs every surface at
five device heights; the row names the height it was read at.

320 px OVERFLOW: **zero stops overflow** in any of the four chapters
(`ui-walk.mjs`: "no horizontal overflow in chapt_7, chapt_8, chapt_11,
chapt_12"). The walk also reports zero interaction errors, all rail counts and
Next actions live, and all authored expanders and chart states opened.

Status: PASS / PASS+note / FAIL. Every row is PASS at the state delivered.

| # | Page or state | Rail walk | What was compared | Status |
| --- | --- | --- | --- | --- |
| 2.1 | `chapt_11/c11_learn_objectives` | ch11 p1 top-right | Seven objectives, objective 1 wrapping onto an indented second line, **ἐκεῖνος** and **οὗτος** now BLUE taps with "(that)" and "(this)" left in ink beside them; word order and punctuation unchanged | PASS (the two words were ink before this round; VERIFY-5H (o)) |
| 2.2 | `chapt_7/c7_learn_objectives` | ch7 p1 top-right | Seven objectives; **εἰμί** on objective 5 is a tap, objective 4 is a plain string again after Revision 1a's off-by-one fix | PASS |
| 2.3 | ...every other objectives page, chapters 1-12 | — | No page gained a tap and none lost a line | PASS (machine census, `ui-behavior` 5H-SPEC2 2.5) |
| 2.4 | `chapt_11` Demonstrative Examples modal, Jn 13:35 | ch11 p3 bottom-right | **One flowing Greek line** — ἐμοὶ and μαθηταί are no longer split across a hard break; the line wraps where the column ends, as the original's does | PASS (RESPONSE 1) |
| 2.5 | ...the same modal, Jn 8:23 | ch11 p3 bottom-right | **τούτου** with an ACUTE on the penult, matching the drill pool and the rest of the chapter | PASS (D-53) |
| 2.6 | `chapt_11/c11_drill_translation_this_that` item 13 | ch11 p8 | **ἐκεῖνοί** with its smooth breathing restored; the second acute is unchanged (the enclitic accent thrown back by εἰσιν) | PASS (D-53) |
| 2.7 | `chapt_11/c11_learn_relatives` topic 2, Neut.-A cell | ch11 p12 top-left | The ὅς chart's plural neuter accusative **ἅ**; the cell is unchanged on screen and its clip is now `k_osnns` | PASS (D-56; the change is audible, not visible) |
| 2.8 | `chapt_11/c11_learn_relatives` topic 1 (Introduction) | ch11 p11 top-right | The TBK's own "Relative Pronouns" text and its (cont.) rule, **with no pending-verification banner** — the data key is `_verify_note` now | PASS (D-52; the 5H row 11.15 note is discharged) |
| 2.9 | `chapt_11/c11_ex_speller_relative` prompt 24 | ch11 p17 top-right | Reads **"who (masc. nom. pl.)"**; the answer οἵ and the tile keyboard are unchanged | PASS (D-54) |
| 2.10 | `chapt_11/c11_qr_this_that` | ch11 p20 bottom-left, bottom-right | Four stacked halves, **TWO Say Paradigm buttons**, each after its Plural half; the αὐ/ου note on both halves of the οὗτος pair | PASS (VERIFY-5H (p); the original prints one button per paradigm on one screen, which is what two matches) |
| 2.11 | `chapt_11/c11_qr_relative` | ch11 p21 top-left | Two stacked halves, **ONE Say Paradigm button** after the Plural half, the "Note how similar…" line on both halves | PASS |
| 2.12 | `chapt_11/c11_qr_reflexive` | ch11 p21 top-right, p22 | Six stacked halves, **THREE Say Paradigm buttons**, one after each person's Plural half; the no-nominative note on all six | PASS |
| 2.13 | `chapt_11/c11_learn_vocab`, the οὗτος card | ch11 p17 bottom-left | Card prints **οὗτος, αὕτη, τοῦτο** and now plays `k_voc7`, the three-form recitation, rather than `k_voc7a` | PASS (RESPONSE 6; audible, not visible) |
| 2.14 | `chapt_11/c11_qr_vocab`, the οὗτος row | ch11 p20 top-right | Same row text and the same "(1388)" frequency; the row's tap is now `k_voc7` | PASS (RESPONSE 6) |
| 2.15 | `chapt_12/c12_qr_vocab`, the μέν row | ch12 p17 bottom-left | Gloss reads **"on the one hand, indeed (179)"**; the drills' and flashcard's short gloss "indeed" is untouched | PASS (D-55) |
| 2.16 | `chapt_12/c12_drill_augment` Hint | ch12 p6 (Augments cont.), read at 390x844 | Four numbered rules on one screen; **ἐκβάλλω, ἐξεβάλλον, ἀποκτείνω, ἀπέκτεινον in points 3 and 4 are blue taps**; the contraction table in point 2 and the augment vowel in point 1 stay INK | PASS (RESPONSE 5; the two kinds of Greek on one screen are flagged for Nathanael in VERIFY-5H-2 (u)) |
| 2.17 | `chapt_8/c8_drill_case` Hint, three routes | ch8 p8 bottom-left | A first-person form opens the First Person paradigm, a second-person form the Second, an αὐτ- form the Third — three different modal titles off one drill. The original's panel (the third-person route) carries **Cancel only**, which the port matches | PASS (spec 3.1; whether the original routes all three is VERIFY-5H-2 (s)) |
| 2.18 | `chapt_8/c8_drill_translation_autos` Hint, paradigm route | ch8 p7 bottom-right | The Third Person Paradigm, Masculine / Feminine / Neuter on the §4.2 Back-More pair | PASS+note (**the original's panel carries More \| Cancel and the port carries Close** — see RESULTS §5.1 and VERIFY-5H-2 (s)) |
| 2.19 | ...its Three Uses route | ch8 p8 top-left | The teaching page as a Hint: title, the "αὐτός can be used in three ways" line, three numbered points with hanging indents and their underlined lead terms, and the three Examples accordions the C2 conversion put there | PASS+note (**the original's panel carries Back \| Cancel**; same item) |
| 2.20 | ...both routes at 320x360 | — | Both fit with the overlay unscrolled and Close pinned; the Three Uses body scrolls inside the modal, the shell does not | PASS (`ui-modals.mjs`, 47 surfaces x 5 heights, zero BAD) |
| 2.21 | `chapt_12/c12_drill_parsing` Hint on an εἰμί form | ch12 p8 top-right | The "Imperfect of εἰμί" chart with its toggle now reading **More** / **Back** rather than **ἔχω** / **εἰμί** | PASS+note (**the original's panel shows BOTH charts stacked on one screen with a single Cancel** — RESULTS §5.3, VERIFY-5H-2 (w)) |
| 2.22 | ...on a λύω form | ch12 p8 | The Active chart with its toggle still reading **Middle/Passive** — an English contrast, untouched by the 3.3 rule | PASS |
| 2.23 | `chapt_10/c10_drill_parsing` Hint on an εἰμί form | ch10 p (5G corpus) | Toggle still reads **Future** / **Present** | PASS (regression row for 3.3) |
| 2.24 | `chapt_11` four drill hints | ch11 p5, p6, p14 | Toggles still read **Singular** / **Plural** | PASS (regression row for 3.3) |
| 2.25 | `chapt_3/c3_drill_greek_verb`, `chapt_4/c4_drill_greek_noun`, `chapt_5/c5_drill_first_decl_noun` | ch3 p, ch4 p, ch5 p (5D/5E corpora) | English prompt in ink (unchanged — these prompts were never taps), Greek options unchanged, **Pronounce greyed until the item is answered and live afterwards** | PASS (D-51 amend; the ink-prompt half of the gate is vacuous here because the prompt is English) |

## Modal states added this round

| # | Modal state | Route | Status |
| --- | --- | --- | --- |
| S2.1 | ch8 Case Drill hint, First Person | `chapt_8/c8_drill_case` → seek ἡμεῖς → Hint | PASS |
| S2.2 | ch8 Case Drill hint, Second Person | ...seek σοι → Hint | PASS |
| S2.3 | ch8 Case Drill hint, Third Person | ...seek αὐτή → Hint | PASS |
| S2.4 | ch8 Aὐτός Translation hint, paradigm route | `chapt_8/c8_drill_translation_autos` → seek κατὰ τὸ αὐτὸ πνεῦμα → Hint | PASS |
| S2.5 | ch8 Aὐτός Translation hint, Three Uses route | ...seek ἡ ὥρα αὐτοῦ → Hint | PASS |

All five are sought by FORM rather than trusted to the shuffle: this drill's
Hint payload now depends on which item is on screen, so opening "the Hint"
would photograph whichever the draw gave (`ui-modals.mjs`, `ui-disclosure.mjs`
and `ui-behavior.mjs` all seek).

`ui-disclosure.mjs` D13 covers the same two translation routes at 390x520
under forced scroll: the paradigm route keeps the §4.2 pinned pair, the Three
Uses route pins nothing, and each seeks its own form first.

# 5H-VISUAL-CHECKLIST-3 (5H-SPEC3, section 7)

Every page whose DATA or RENDERER changed in 5H-SPEC3, at 320 px and 768 px,
compared against its rail-walk panel. Appended to this file rather than opened
as a new one, per the 5H-SPEC2 precedent.

METHOD. `npm run preview`, then
`node scripts/ui-walk.mjs --chapters=chapt_7,chapt_8,chapt_11` and
`node scripts/ui-modals.mjs`, plus one hand walk of the ch8 hint's four pages
and one hand capture of chapter 1's objectives (ch1 is not in this round's
walked set and is the plain-string branch of the item-1 regression). The
rail-walk panels were rendered from the PDFs with pymupdf at 200 dpi and
cropped to the quadrant named in each row — `ch1railwalk.pdf` (18 pages),
`ch7railwalk.pdf` (16), `ch8railwalk.pdf` (15), `ch11railwalk.pdf` (24).

CORPUS. `buildout/screenshots/5h3-walk-opus/{320,768}/<chapter>/<stop>.png`
(293 files) and `buildout/screenshots/5h3-modals-opus/` (541 files, five device
heights, at rest and content-scrolled), plus
`buildout/screenshots/5h3-hint-pages/autos-hint-p1..p4.png` and
`buildout/screenshots/5h3-ch1-objectives-{320,768}.png`. Both harness runs were
made with their output on C: because the volume was out of space at the time
(RESULTS section 7); the images were copied here once it was not.

320 px OVERFLOW: **zero stops overflow** in any of the three chapters
(`ui-walk.mjs`: "no horizontal overflow in chapt_7, chapt_8, chapt_11"). The
walk also reports zero interaction errors, all rail counts and Next actions
live, and all authored expanders and chart states opened.

Status: PASS / PASS+note / FAIL. Every row is PASS at the state delivered.

| # | Page or state | Rail walk | What was compared | Status |
| --- | --- | --- | --- | --- |
| 3.1 | `chapt_1/c1_learn_objectives` (the plain-string branch) | ch1 p1 top-right | Eight objectives, house "1. 2. 3." markers, wrapped continuations indented under their text, and **NO blank line between objectives** — the original's list is single-spaced throughout | PASS (measured: seven inter-item gaps, all 0 px; list height 347 px = the sum of the eight item heights) |
| 3.2 | `chapt_7/c7_learn_objectives` (the audioMap branch) | ch7 p1 top-right | Seven objectives at the same single spacing; **εἰμί** on objective 5 still a blue tap and still plays `g_eimi1s` | PASS |
| 3.3 | `chapt_11/c11_learn_objectives` (the audioMap branch) | ch11 p1 top-right | Seven objectives at the same single spacing; **ἐκεῖνος** and **οὗτος** still blue taps with "(that)" and "(this)" in ink beside them | PASS (measured: six gaps, all 0 px; list height 404 px = the sum of the seven item heights) |
| 3.4 | ...every other objectives page, chapters 1-12 | — | No page gained a tap, lost a line, or kept the gap | PASS (machine census, `ui-behavior` 5H-SPEC2 2.5 unchanged + 5H-SPEC3 1) |
| 3.5 | `chapt_8/c8_drill_translation_autos` Hint page 1 | ch8 p7 bottom-right | Third Person Paradigm, **Masculine**: N/G/D/A rows, Singular and Plural columns, the English glosses under each cell, Say Whole Paradigm; **Back greyed, More live**, Close last | PASS+note (the heading reads "Third Person Paradigm: Masculine" where the original's panel reads "Third Person Paradigm" with Masculine as a section label — VERIFY-5H-3 (y)) |
| 3.6 | ...page 2 | ch8 p7 bottom-right (lower half of the same panel) / ch8 p13 top-left | **Feminine**: the αὐτή set, same column and row structure | PASS+note (same heading question) |
| 3.7 | ...page 3 | ch8 p13 top-right | **Neuter**: the αὐτό set. The original's HINT does not show this chart at all; its Review page does, and it is here because your (s) answer said to keep it once the drill turned out to use neuter forms (items 1 and 9) | PASS+note (a deliberate departure — DIVERGENCE-LOG D-57) |
| 3.8 | ...page 4 | ch8 p8 top-left | **Three Uses**: title, the "αὐτός can be used in three ways" line, three numbered points with hanging indents and their underlined lead terms, the three Examples accordions; **Back live, More greyed**, Close last | PASS |
| 3.9 | ...all four pages at 320x360 and 768x1024 | — | Each fits with the overlay unscrolled and Close pinned; the body scrolls inside the modal, the shell does not; exactly one divider, and the strip above it equals the strip below at forced scroll | PASS (`ui-modals` 270/270 states, `ui-disclosure` D13 four states) |
| 3.10 | `chapt_7/c7_qr_vocab`, the οὐ row | ch7 p14 top-left | Row text **οὐ, οὐκ, οὐχ** and gloss "no, not (1606)" unchanged; the three forms are now separate blue taps and **the commas between them are ink**. Nothing on screen distinguishes οὐκ from οὐχ, which is correct: they are two tap targets sharing one recording (`g_voc8b`) after Nathanael's 2026-08-28 correction, and the row must not hint at that | PASS |
| 3.11 | `chapt_8/c8_qr_vocab`, the ἐγώ and σύ rows | ch8 p12 top-left | Row texts **ἐγώ / ἡμεῖς** "I / we (2666)" and **σύ / ὑμεῖς** "you / you (pl) (2905)" unchanged; two blue taps each and **the slash between them is ink** (sampled at 768 px: forms rgb(22,99,199), separator rgb(34,37,42)) | PASS |
| 3.12 | `chapt_11/c11_qr_vocab`, the οὗτος row | ch11 p20 top-right | Row text **οὗτος, αὕτη, τοῦτο** and "(1388)" unchanged; three blue taps, commas ink | PASS |
| 3.13 | ...the four rows' BOX METRICS at 320 px | — | The multi-tap cell occupies the identical box as the single button it replaces, row for row: 112x66, 112x66, 112x33, 112x99. Nothing re-wrapped and no row grew | PASS (A/B measured in one page load) |
| 3.14 | `chapt_11/c11_qr_vocab`, the ὅς row | ch11 p20 top-right | **Unchanged**: ὅς, ἥ, ὅ is ONE tap over the whole row and plays `k_voc5`, per (r) | PASS |
| 3.15 | `chapt_7`, `chapt_8`, `chapt_11` Learn Vocabulary cards | ch7 p?, ch8 p11 bottom-right, ch11 p17 bottom-left | **Unchanged on screen**: each card is one tap over the whole printed form. The clip behind ch7's is now `g_voc8a` (audible, not visible) | PASS |
| 3.16 | `chapt_8/c8_drill_case` Hint, three routes | ch8 p8 bottom-left | **Unchanged**: a first-person form opens the First Person paradigm, a second-person form the Second, an αὐτ- form the Third, each with Cancel only | PASS (regression row for the (s) ruling's other half) |

## Modal states added this round

| # | Modal state | Route | Status |
| --- | --- | --- | --- |
| S3.1 | ch8 translation hint page 1, Masculine | `chapt_8/c8_drill_translation_autos` -> Hint | PASS |
| S3.2 | ...page 2, Feminine | ...-> More | PASS |
| S3.3 | ...page 3, Neuter | ...-> More -> More | PASS |
| S3.4 | ...page 4, Three Uses | ...-> More -> More -> More | PASS |

These four REPLACE the two form-sought states 5H-SPEC2 added
(`ch8-autos-translation-hint-paradigm` and `-three-uses`). Nothing is sought by
form on this drill any more, because nothing depends on the form any more:
that is the whole of the (s) ruling. `ui-modals.mjs` now holds 54 surfaces
(52 before), which is 270 modal states at five device heights, all clean.

`ui-disclosure.mjs` D13 covers the same four pages at 390x520 under forced
scroll, as ONE entry with three navigation steps rather than the two
form-sought entries it had; 303 disclosure checks pass.
