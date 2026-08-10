# DIVERGENCE-LOG.md — departures from the original (LIVING DOCUMENT)

Standing rule (established 2026-07-28, Nathanael): every deliberate
departure from the source material gets a numbered entry here at the
moment it is decided — what changed, why, who approved, where it
lives. Fidelity is the default (standing directive 1); this log is
the complete list of exceptions. Fidelity RESTORATIONS (bugs where
the port accidentally diverged and was pulled back) are not logged.
New chats: add entries; never renumber.

Format: D-n | scope | change | authority.

D-1 | ch1 | Review Letters Quick Chart: Pronounce column removed
     (four columns remain). | Nathanael, VERIFY-chapt01.
D-2 | app | Typo policy A1: scholar-name spellfixes (Moulton, Colin
     Brown, Rienecker, Hewitt->Hewett) + obvious English
     misspellings ('standarized'->'standardized'). Greek content and
     pedagogical wording stay verbatim. | Nathanael, I1/I3.
D-3 | app | A1 third extension: double hyphens -> em dashes,
     data-side, all future chapters. | Nathanael, 5B closeout.
D-4 | ch2 | Accent placement pool: five-item circumflex EXTENSION
     merged/interleaved into the original 20-item acute-only pool;
     'extended: true' provenance only. | Nathanael, VERIFY2/VERIFY3
     (kept).
D-5 | ch2 | Rule-chart ditto marks (idem./ibid. quote character)
     print the translation instead. | Nathanael, VERIFY3.
D-6 | ch2 | Marking Recognition "Drills Available: 35" is an
     original bug; the port ships the real 25. | 5B, both DOSBox
     passes.
D-7 | ch2 | Syllable Division rebuilt as draggable dividers on the
     word (original: numbered gap buttons). Data contract unchanged.
     | Nathanael, SPEC4.
D-8 | ch3 | VTD prompt 26: original TBK 'pistu<ei' corrected to
     pisteu<ei (missing epsilon; the parallel Parsing list has the
     correct form). _legacy preserved. | 5D assembly,
     correctness-first.
D-9 | ch3 | GVD option column 3 item 24: 'pisteuou<sin' (misplaced
     accent) corrected to pisteu<ousin. | 5D assembly.
D-10 | ch3 | Endings button plays chapt_3_c_ending — RESTORED. The
     original ships the clip but the button plays nothing (D15);
     treated as an original defect. | Nathanael query + Fable
     recommendation, 5D; confirm keep/drop in VERIFY-5D.
D-11 | ch3+ | spellVerse Major Hint always available (original hides
     the verse once typing begins). | Nathanael, 5D-RECON D8.
D-12 | ch3+ | "Repeat This Exercise" -> "Restart Exercise". |
     Nathanael, 5D-RECON D8.
D-13 | ch3+ | spellVerse wrong-word feedback names the WORD (the
     original prints a bare index: "The word you missed was: 2"). |
     5D spec, usability.
D-14 | app | TIMING: advance timing lives in two shared app-level
     constants (ADVANCE_CORRECT_MS=900, ADVANCE_INCORRECT_MS=2500)
     instead of the original's per-surface ~2s/~4s. Semantics
     (which surfaces auto-advance, and when) stay faithful per
     advanceClass; only the durations are tuned for device feel.
     Ratify or retune in VERIFY-5D; ch2's ~4s one-attempt surfaces
     migrate to the same constants at their next touch. | Nathanael
     J1 + 5B VERIFY3 item-1 withdrawal + 5D consistency request.
D-15 | ch3+ | Speller keyboard extended app-wide (space +
     punctuation per the 5D Phase 0 checkpoint; layout chosen by
     Nathanael). Original on-screen keyboard has no space key. |
     Nathanael, 5D-RECON D8.
D-16 | ch3 | **WITHDRAWN 2026-07-28 (VERIFY-5D A4).** Was: movable-nu
     leniency in the spelling checker. It should never have been
     entered. The leniency was invented to paper over a DERIVATION
     ERROR: the assembler produced λύουσιν for the speller when the
     original authors λύουσι, and rather than check, the first pass
     made the checker accept both. The original's own OpenScript
     answer-dispatch tables (two parallel sets, accented and
     unaccented) give item 3 'they loose' = lu<ousi, item 15 'they
     say' = le<gousi, item 24 'they believe' = pisteuousi — no final
     nu, one authored answer per item, no leniency anywhere. The data
     now carries the authored forms and the checker requires them
     exactly. Movable nu is a real feature of Greek and the chapter
     teaches it, but it is a per-word authored choice, not a checker
     rule. | Nathanael, VERIFY-5D A4.
D-17 | intro | "Getting Around" navigation copy is new-authored (the
     original's Win 3.1 navigation pages don't map to a PWA).
     | Nathanael, phase 4.
D-18 | app | Spelling checker is CASE-INSENSITIVE. The on-screen
     keyboard ships no capitals and no shift layer, so requiring case
     would make Ἰησοῦς, Ἐγώ, Χριστός and the ch2 Π-/Φ- words
     untypeable — ch1's Χριστός had been unwinnable with "With
     Accents" ON since it shipped. Accents required only when "With
     Accents" is ON; punctuation optional under both settings.
     | 5D build; ratified VERIFY-5D A6 pending the typing fixes.
D-19 | app | Greek option grids are TWO columns at phone width, FOUR
     at the iPad breakpoint and above (VERIFY-5D A7 amends the 5D
     build's two-up-everywhere). Ten polytonic words need ~33px more
     than 320px allows and were being clipped silently. Applies to
     every Greek-to-English and English-to-Greek vocabulary drill in
     every chapter. Single-glyph letter grids stay four-up at all
     widths. | Nathanael, VERIFY-5D A7.
D-20 | app | House style adopted app-wide: numbered lists print
     "1) 2) 3)" with a hanging indent, and source citations are flush
     LEFT. Both match the original's own style and now apply to ch1
     and ch2 as well. EXCEPTION: chapter OBJECTIVES lists keep
     "1. 2. 3." in every chapter. | Nathanael, VERIFY-5D A9.
D-21 | ch3 | Tense/Aspect example panel underlines "Present:",
     "Past:" and "Future:". The original does not underline them;
     added for consistency with the other example panels. | Nathanael,
     VERIFY-5D-RESPONSE2.
D-22 | app | GREEN DESCRIPTIVE TERMS: when a descriptive label shares
     a line with the example it describes ("Come here. — command",
     "Terry kicked himself. — reflexive"), the label renders in the
     app's dark green. The original renders it in the body face.
     Markup: [[g]]...[[/g]]. Standing rule for all future chapters.
     | Nathanael, VERIFY-5D-RESPONSE2.
D-23 | ch3 | Endings display: the original's Endings popup shows the
     six endings; the port additionally makes it reachable and
     audible per D-10. Confirmed KEEP at VERIFY-5D A3.
D-24 | app | GREEK-TAP SCOPE: a `greekTaps` key marks EVERY standalone
     occurrence of the word in an item's text, not just the first.
     Marking only the first left the same word blue-and-speaking in
     one place and black-and-silent in another, which reads as "that
     one is not tappable". Shipped at 5D round 2; RATIFIED here and
     assumed by all chapter-4/5 data. | 5D-SPEC2 build + Nathanael,
     5E issue.
D-25 | app | iPad BREAKPOINT for the four-up Greek option grids
     (D-19) is 768px — the iPad's portrait CSS width — not the app's
     existing 560/900 breakpoints. Shipped at 5D round 2 and ratified
     here. | 5D-SPEC2 build + Nathanael, 5E issue.
D-26 | ch4+ | PARADIGM-SHAPED OPTION GRIDS ARE EXEMPT FROM D-19 and
     stay TWO COLUMNS at every width: in the Greek Noun Drill and the
     Declining Noun Drills the two columns ARE singular and plural and
     the five rows ARE the five cases, so reflowing to four columns
     destroys the teaching. This is a fidelity carve-out from a
     port-side rule, logged because it is a deliberate exception, not
     because the original diverges. Flagged explicitly in the data;
     never inferred from option count. | Fable, 5E-SPEC1 §4.4.
D-27 | ch5 | The First Declension--Eta chart prints its first row
     label as `Nom.\Voc.` with a BACKSLASH while the Alpha chart on
     the same page uses `Nom./Voc.`. Shipped VERBATIM. Typo policy A1
     covers scholar names and obvious English misspellings; it does
     not cover the original's own chart-label inconsistencies, and
     normalizing one of the two would be a silent content edit.
     | Fable, 5E assembly, fidelity-first.
D-28 | app | EVERY CORRECT ANSWER AUTO-ADVANCES, overriding the
     original. Nathanael's second DOSBox pass records "no autoprogress
     on correct" for 13 of the 14 spelling exercises, and the port
     copied that observation into two advance classes —
     `spellUntilRight` and `manualCorrectAutoIncorrect` — whose only
     distinguishing feature was waiting for Next on a CORRECT answer.
     Both classes are WITHDRAWN and the six-class table is now four:
     every `spellUntilRight` is `retryUntilRight` and every
     `manualCorrectAutoIncorrect` is `autoBoth`. The wait is still
     max(2000ms, clip), so the afterGuess audio finishes first.
     This is a deliberate departure from observed behavior, not a
     fidelity claim: a learner who has just answered correctly should
     not have to ask for the next item. ONE case is a no-op rather
     than an exception (rule B1b): the three whole-verse spellers hold
     a single item, so there is nothing to advance to and they mark
     correct and stop rather than driving the sequential rail.
     | Nathanael, 2026-08-06; DRILL-BEHAVIOR-RULES B1a/B1b;
     5E-SPEC3 §1.
D-29 | app | THE SHARED KEYBOARD GAINS AN APOSTROPHE TILE (U+1FBD
     GREEK KORONIS), a 40th tile the original's keyboard does not
     have. Chapter 2 TEACHES elision by name: Learn Marks has an
     "Apostrophe" topic deriving διά + αὐτοῦ -> δι᾽ αὐτοῦ, the
     Marking Recognition Drill scores "Apostrophe" as an answer
     distinct from "Smooth Breathing" and "Coronis", and the Quick
     Review marks chart lists "Apostrophe: ( ᾽ ) elided letters".
     Chapter 4's Scripture Memory Spelling Exercise then requires the
     learner to type δι᾽ in John 14:6b, and no tile could produce it.
     The ORIGINAL has no apostrophe key either and works around its
     own gap: it represents the elision mark as a smooth breathing ON
     the iota, draws it that way in the Major Hint, accepts that form,
     and REJECTS a real apostrophe (DOSBox, Nathanael 2026-08-07).
     That is the original's workaround, not Greek — the elision mark
     is a spacing apostrophe and a breathing can only sit on a
     word-initial vowel or rho. So the port adds the key and the
     checker accepts BOTH forms plus the mark's absence (D-18), so a
     learner trained on the original's habit is never punished for it.
     A build guard now fails if any displayed punctuation in a
     spelling answer has no tile. | Nathanael, 2026-08-07;
     5E-SPEC3-PATCH item 5.
D-30 | ch3,4,5 | THE WHOLE-VERSE SPELLERS USE `Show Answer`, NOT
     `Major Hint`. D-11 gave this surface a Major Hint BUTTON that
     opened the verse and translation above the keyboard and withdrew
     them again after HINT_VISIBLE_MS (7s). Nathanael, 2026-08-07:
     replace it with the `Show Answer` CHECKBOX every other spelling
     exercise and drill already has, drawn BELOW the keyboard where
     every other answer appears, clearing as soon as typing resumes
     rather than on a timer. One reveal idiom app-wide instead of two,
     and nothing in the app now makes a learner race a clock.
     HINT_VISIBLE_MS is deleted with it. D-11's substance stands: the
     verse is still available at any time, which the original does not
     allow. | Nathanael, 2026-08-07; 5E-SPEC3-PATCH item 12.

D-31 | ch7 | **REVISED 2026-08-09 (5F-FEEDBACK.pdf item 15).** Was:
     the οὐ / οὐκ / οὐχ popups open from the Greek HEADWORD itself,
     where that headword stands on its own numbered line (longest
     headword first so οὐχ is never claimed by οὐ). Nathanael's live
     correction on the rail walk: "Ou, ouk, oux should be clickable to
     play their audio, the NUMBERS should be clickable to bring up the
     menus" — the word is an ordinary audio tap like every other
     displayed Greek word (directive 9), and the NUMBER marker in
     front of the line is what opens the popup. `c7_learn_eimi` still
     ships three popups (οὐ, οὐκ, οὐχ) with no `popupRef` and no
     underline run naming them, so the gap this entry was written to
     close is the same one; only the trigger element moved. The
     `numbered` block's item objects carry a `numberPopupRef` naming
     the popup id, RichContent renders that marker as a real button
     (`.rc-num-popup`) in place of the generated "N)" counter, and the
     Greek word inside the item gets an ordinary `greekTaps` entry
     pointing at the popup's own audio clip — two independent tap
     targets on one line, matching the corrected reading exactly.
     Chapters 6 and 8 are untouched (their popups are already declared
     by `popupRef` / underline and never used the word-based route).
     | Nathanael, 5F-FEEDBACK.pdf item 15, live rail-walk correction
     superseding 5F-SPEC1 §2.2's original reading.
D-32 | ch6,8 | THE CASE-SPLIT VOCABULARY DRILLS DO NOT FOLLOW D-19.
     D-19 puts a lexicon-derived vocabulary option pool two-up on a
     phone and four-up from 768px, in both directions. Chapters 6 and
     8 present their vocabulary CASE-SPLIT (sixteen entries over ten
     lemmas, fifteen over ten) and two of chapter 6's option captions
     differ from its gloss pool outright, so all four of those drills
     ship AUTHORED option grids instead of naming a lexicon pool.
     Nothing in the delivered data distinguishes an authored
     vocabulary grid from any other authored grid, and keying the
     layout to an activity id is what rule B1 forbids, so they render
     two-up at BOTH widths like every other authored grid. Asserted
     as such in the harness rather than dropped from the census. If
     the pipeline later marks these drills as vocabulary pools, the
     existing responsive class picks them up with no renderer change.
     | Implementer, 5F-SPEC1 §5.
D-33 | ch7 | THE εἰμί SPELLER'S PARENTHESISED ALTERNATE MAKES THE
     PARENTHESISED SEGMENT OPTIONAL. `answerAlt` is "ἐστί(ν)" against
     an `answer` of "ἐστίν". Punctuation is already optional under
     D-18, so the alternate folds onto the answer and the field would
     do nothing at all; the notation is the chapter's own way of
     saying the nu is moveable, so the renderer expands a
     parenthesised alternate into both readings and accepts ἐστί as
     well as ἐστίν. This is NOT a movable-nu rule — D-16 stays
     withdrawn — it is this field, on these two items: the four items
     beside them, whose answerAlt is their own answer, still reject a
     stray nu, and the harness asserts that. | Implementer, 5F-SPEC1
     §2.10.
D-34 | ch6 | **RESOLVED 2026-08-09 (5F-FEEDBACK2 item 1).** THE
     PREPOSITIONS CHART IS NOW A TRACE. The "no tool to extract
     coordinates" claim below was wrong: rendering ch6railwalk.pdf p6
     at 300 dpi (pymupdf), cropping the chart panel and reading
     every label/arrow endpoint off a drawn coordinate grid IS the
     pixel-coordinate trace the entry said was impossible. The
     component's geometry is that trace verbatim (viewBox = the
     original panel's own pixel space), and the acceptance test the
     feedback names — overlay the original crop on a screenshot of
     the rebuilt SVG at 50% opacity and match as a stencil — ran and
     passed (buildout/screenshots/5f-patch2/prep-overlay.png). Facts
     of the original the two reconstructions had invented away, now
     traced: μετά has NO arrow; εἰς's arrow lands INSIDE the circle;
     ἐκ's starts inside and exits; πρός's stops at the boundary;
     ἀπό's lies wholly outside; διά crosses corner-to-corner; κατά is
     a short diagonal parallel to διά plus a separate downward
     arrowhead; ἐπί/upon carries one thick underline with the gloss
     BESIDE the word (as do μετά and διά). Historical text of the
     superseded entry retained in git history. | Implementer,
     5F-FEEDBACK2 item 1.

D-35 | ch6,7 | DITTO MARKS AND '=' SIGNS REPLACED BY THE WORDS THEY
     STAND FOR. 5F-FEEDBACK2 items 2/8/9 (Nathanael, 2026-08-09): the
     original prints '= through me' on the Elision page and repeats a
     translation with a ditto mark (") under 'the good word' / 'the
     word is good' on the Attributive/Predicate Position pages. The
     port drops the '=' and DUPLICATES the translation in place of
     the ditto. Deliberate departures, requested in feedback — future
     passes must not "restore" the '=' or the ditto marks. |
     Nathanael, 5F-FEEDBACK2 items 2, 8, 9.

D-36 | ch7,8 | LEAD-IN TERMS THE ORIGINAL UNDERLINES ARE SET BOLD,
     NOT UNDERLINED. 5F-FEEDBACK2 items 5/19/20 (Nathanael,
     2026-08-09): the original underlines 'Attributive:', 'Predicate:',
     'Substantive:' (ch7 3 Uses of Adjectives), all six pronoun-type
     labels (ch8 Types of Pronouns) and 'Subjective', 'Possessive',
     'Objective' (ch8 Case). The port sets these labels bold with no
     underline (labelStyle: "plain") because underlining is reserved
     for [[u]]-authored emphasis and popup links; Nathanael ratified
     the departure and asked that it be recorded so future passes
     don't "correct" it back to underlines. | Nathanael, 5F-FEEDBACK2
     items 5, 19, 20.

D-37 | ch8 | THE PERSONAL PRONOUNS INTRODUCTION SHOWS ITS SECOND PAGE
     PERMANENTLY. The original's Introduction has a More button whose
     second page ("Since the nominative is indicated in the personal
     ending of the verb...") only appears intermittently — the
     original is broken (5F-FEEDBACK2 item 22: "there is evidently a
     'More' menu here that only shows up half the time"). Per the
     feedback ("please add the data or More button here (permanently,
     the original is broken)") the port appends both of that page's
     paragraphs to the Introduction topic with the standard blank-line
     gaps, rather than reproducing the broken pager. | Nathanael,
     5F-FEEDBACK2 item 22.

D-38 | ch7,ch8 | HINT POPUPS PAGE More/Back AT THE MODAL LEVEL, IN
     FIXED SLOTS. 5F-FEEDBACK2 items 12/13/27/28/29: (a) the
     More/Back pair everywhere sits in its own row — Back always the
     left slot, More always the right — so paging never moves a
     button (item 27's model, adopted app-wide); (b) the Adjective
     Translation Drill's Hint gained the original's FIRST page (the
     full adjective paradigm) ahead of the positions summary; (c) the
     Aὐτός Translation Drill's Hint gained the original's missing
     'Three Uses' page after the three gender charts; (d) the
     Adjective Case Drill's Hint labels the pair 'Plural'/'Singular'
     (drill hint only — the Learn topic showing the same charts keeps
     the original's own More/Back, ch7railwalk p2). | Nathanael,
     5F-FEEDBACK2 items 12, 13, 27, 28, 29.

## Auto-progress / advance rule matrix

MOVED. The full exercise-by-exercise, chapter-by-chapter matrix —
original behavior, port behavior, timings and departures — now lives
in **DRILL-MATRIX.md** (canonical living set). Ratified values as of
VERIFY-5D: ADVANCE_CORRECT_MS = 2000, ADVANCE_INCORRECT_MS = 4000,
HINT_VISIBLE_MS = 7000, applied retroactively to every chapter.
