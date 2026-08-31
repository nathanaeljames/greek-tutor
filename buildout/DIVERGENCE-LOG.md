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

D-31 | ch7 | **AMENDED AGAIN 2026-08-15 (DISCLOSURE-RULES §6.3,
     D-31r3): THE NUMBER-MARKER POPUP MECHANISM IS RETIRED
     APP-WIDE. The three items are C2 rules, each with an
     interspersed "Examples" accordion holding the former popup
     body; the Greek words remain ordinary audio taps.
     `numberPopupRef` no longer exists in any data file.**
     Previous revision: **RE-REVISED 2026-08-10 (5F-FEEDBACK3 item 3, D-31r2).**
     Nathanael reversed the item-15 reading below: "I want the number
     AND the word to be the same link and to bring up the menus. If
     they want to hear the word they can click the menu title." Both
     the `.rc-num-popup` marker and the Greek word (now
     `.rc-word-popup`, a popup link, no longer an audio tap) open the
     popup; the word's clip is heard from the popup's own title. This
     is the third reading of this trigger — original (word only), r1
     (number opens / word speaks), r2 (both open) — so future passes
     should treat r2 as final unless Nathanael says otherwise. The
     r1 text below is retained for the mechanism's history. |
     Nathanael, 5F-FEEDBACK3 item 3.
     **[r1, superseded]** Was, as of 2026-08-09 (5F-FEEDBACK.pdf item 15):
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
     **EXTENDED 2026-08-11 (5G-SPEC1): chapters 9 and 10's four
     vocabulary drills join this entry.** Their vocabulary is NOT
     case-split — ten lemmas, ten options — but the pipeline authored
     `optionValues` rather than naming a lexicon pool, which reaches
     the renderer as the same undistinguished authored grid and lands
     two-up at both widths for the same reason. The fix is the same
     one: the vocabulary-pool marker Stage 8.8 already owes chapters
     6 and 8 should cover 9 and 10 as well, and the responsive class
     picks all eight up with no renderer change.
     | Implementer, 5F-SPEC1 §5; extended 5G-SPEC1.
D-33 | ch7 | **CONFIRMED 2026-08-15 (VERIFY-5F-3 item 1): DOSBox
     shows the original ACCEPTS bare ἐστί. D-33 STANDS and is no
     longer an inference.** THE εἰμί SPELLER'S PARENTHESISED ALTERNATE MAKES THE
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

D-38 | ch7,ch8 | **AMENDED 2026-08-15 (DISCLOSURE-RULES §4.3): the
     control row — say-all plus its navigation (the §4.1 single
     toggle, or the §4.2 Back/More pair) — is PINNED and never
     scrolls off: fixed to the modal footer, sticky at the panel
     bottom in main. Two-chart hints become the §4.1 single
     toggle rather than a Back/More pair.** 
     HINT POPUPS PAGE More/Back AT THE MODAL LEVEL, IN
     FIXED SLOTS. 5F-FEEDBACK2 items 12/13/27/28/29: (a) the
     More/Back pair everywhere sits in its own row — Back always the
     left slot, More always the right — so paging never moves a
     button (item 27's model, adopted app-wide); (b) the Adjective
     Translation Drill's Hint gained the original's FIRST page (the
     full adjective paradigm) ahead of the positions summary; (c) the
     Aὐτός Translation Drill's Hint gained the original's missing
     'Three Uses' page after the three gender charts; (d) [REVERSED
     2026-08-10, 5F-FEEDBACK3 item 1: the Adjective Case Drill's Hint
     buttons are plain More/Back again — the charts are TITLED with a
     green Singular/Plural subtitle instead, matching the ch8
     third-person stacks. The `hintSwitchLabels` override is gone
     from the data; the mechanism remains in Paradigm.svelte unused.]
     Also as of 5F-FEEDBACK3 item 6: the Review pager in
     ContentAudio.svelte uses the same `.pg-nav` row as everything
     else, and ui-behavior P3.2 measures the geometry on every paging
     surface. **[FINAL LAYOUT, 2026-08-10 addendum after user
     testing: the pair is CENTRED, and BOTH buttons render on every
     page with the invalid direction greyed out (disabled) — never
     removed, so nothing jumps or disappears. This supersedes the
     fixed-slot left/right model above; the layout has now been
     wrapped-inline → left/right slots → centred always-visible pair,
     so treat this reading as settled.]** | Nathanael, 5F-FEEDBACK2
     items 12, 13, 27, 28, 29; 5F-FEEDBACK3 items 1, 6; addendum
     2026-08-10.

D-39 | ch8 | **REVERSED for λέγω / ἐγὼ λέγω (2026-08-10, Nathanael's
     correction after device testing): the Introduction's examples
     are PLAIN INK, exactly as the original has them.** Item 4 of
     5F-FEEDBACK3 had asked for taps; Nathanael then confirmed "legw
     and egw legw were never clickable, and that is why you didn't
     find the audio to map." The TBK evidence had already said so
     (8_PRONS.TBK wires NO WordSelection handler to either phrase on
     that page, page record at 0x179c9, and no "ἐγὼ λέγω" phrase
     recording exists anywhere on the ISO) — the borrowed-clip taps
     built to satisfy item 4 (chapter-1 λέγω copied into the
     chapter-8 pack as h_legw.m4a, plus H_1NSE for ἐγὼ) are REMOVED:
     the greekTaps, the copied file, and its audio-manifest entry,
     which restores the manifest byte-identical to its pre-PATCH3
     state (see the PATCH3 appendix: the manifest's hash versions
     EVERY pack, so the added entry had flipped every downloaded pack
     to "Update audio" on device). ui-behavior P3.5 now pins the
     plain-ink reading. LESSON, paired with the TBK rule in
     ONBOARD-SOL §7: when the original wires no handler and ships no
     clip, that IS the original's answer — say so before building a
     workaround from borrowed audio.
     STILL IN FORCE from the original entry (item 5): the
     second-person emphatic triad σοῦ/σοί/σέ has no dedicated
     recordings (no H_2GSE/H_2DSE/H_2ASE on the ISO); the enclitic
     clips H_2GS/H_2DS/H_2AS speak for both forms — same phonemes,
     accent is prosodic only. | Nathanael correction + implementer,
     5F-FEEDBACK3 items 4, 5; ISO verified 2026-08-10.

D-40 | ch9,ch10 | A TOPIC HEADING ITS OWN CHART SAYS IN FULL IS
     PRINTED ONCE, BY THE CHART. The original puts the topic label in
     a radio RAIL down the left and the panel's own heading inside the
     yellow box, so "Present Middle Paradigm" and "Present Middle
     Indicative Paradigm" never appear together in one column. This
     port draws no radio rail — the topic label is the page heading —
     so the pair stacked, and two headings differing by one word is
     the 5E-R1 defect verbatim. Where a chart's title says the topic's
     heading AND MORE OF IT (word-subsequence, `headingCovers` in
     lib/content.js), the HOST drops its heading and the chart's
     fuller title stands, because the fuller one is what the original
     prints in its panel. The reverse case — the chart's title is an
     ABBREVIATION of the topic's (chapter 5's Masc/Masculine pair) —
     keeps its existing 5E behaviour untouched: there the chart's
     title is dropped and the topic's stands. Asserted both in the
     data sweep and on the surface (ui-behavior 5E-R1).
     | Implementer, 5G-SPEC1; ch9railwalk p3, ch10railwalk p2.

D-41 | ch10 | THE THREE-STAGE PARSING DRILL IS STACKED, NOT COLUMNED.
     The original draws tense, voice and person/number as three
     side-by-side COLUMNS of tiles (ch10railwalk p6). Four columns of
     tiles whose longest label is "Second Singular" cannot be read at
     320px, so the port keeps the original's reading ORDER — tense,
     then voice, then person — and stacks the three stages down the
     card, marking them off with the same dark-green separator the
     grouped option stacks already use. Within the third stage the
     original's `optionGroups: [2, 2, 2]` pairing is preserved
     exactly: three rows of two, reading across. Two-stage drills
     (chapter 8's person + case grid) are two different shapes already
     and keep their unmarked layout. | Implementer, 5G-SPEC1 §4.1.

D-42 | ch9,ch10 | **RETIRED 2026-08-15 (VERIFY-5G item d). DOSBox
     shows the original gives exactly ONE "Check Answer"; the
     Major Hint and Pronounce buttons are then replaced by a
     "Repeat This Exercise" button that CLEARS THE ENTIRE SCREEN
     and starts over. Nathanael DELIBERATELY REJECTS that
     behaviour: a wrong guess must never clear the slate, the
     learner retries until right, and Restart Exercise (D-12)
     already provides a voluntary reset. THE CHECKBOX IS REMOVED
     FROM CHAPTERS 9 AND 10 ENTIRELY AND MUST NEVER BE RE-ADDED
     IN ANY CHAPTER.** The superseded modelling follows, kept
     for the record:
     PENDING VERIFY-5G (d). The checkbox is the original's, on the
     Scripture Memory Spelling Exercise of both chapters, and it
     ships default OFF. What it DOES here is 5G-SPEC1 §4.5's
     extrapolation, not an observed behaviour: a successful Check
     Answer plays the whole verse (rule C7, as always), and then —
     only when the box is checked — clears the slate for another
     pass. Completion is recorded on the FIRST success and the repeat
     pass does not touch it. Nothing beyond replay-and-clear is
     invented, and the harness asserts only the control's PRESENCE
     and its default, deliberately not the behaviour, until item (d)
     of VERIFY-5G says what the original does. If the DOSBox answer
     differs, this entry is what to correct. | 5G-SPEC1 §4.5;
     implementer, pending Nathanael.

D-43 | ch9 | Objective 6 read "memorize Jn 6:23b in Greek" in the
     original — its own slip; the chapter teaches Rom 6:23b on the
     Learn Scripture Memory page, in the speller's instruction line
     and in the Quick Review. FIXED to Rom 6:23b. | Nathanael,
     VERIFY-5G (e).

D-44 | ch9 | The Compound Verbs page glossed ἔρχομαι "I go in,
     enter" — εἰσέρχομαι's gloss copied one row up, contradicting
     the chapter's own vocabulary and its Frequently Used Deponent
     Verbs popup. FIXED to "I come, go". | Nathanael, VERIFY-5G (f).

D-45 | ch10 | PARSING DRILL ANSWER KEY CORRECTED. The walkthrough
     (ch10parsingdrill.pdf) shows the original REVEALS the correct
     trio in blue on every wrong answer, yielding a full 30/30 key.
     Against it, the six future-εἰμί items (ἔσομαι, ἔσῃ, ἔσται,
     ἐσόμεθα, ἔσεσθε, ἔσονται) grade Future ACTIVE, not the
     morphological Middle the pipeline derived — consistent with the
     original's own chart title "Future Active Indicative of εἰμί"
     and its deponent-translated-active note. All twenty λύω items
     and the four present-εἰμί items verify unchanged. Data and
     assemble_ch10.py both corrected so regeneration reproduces the
     key. | Pipeline, 2026-08-15.

D-46 | ch10 | FORM-DEPENDENT HINT, copied from the original. In the
     Parsing Drill the Hint payload depends on the item: εἰμί forms
     open the stacked Present + Future εἰμί charts (field 0xec4b2,
     titles verbatim), λύω forms open Future Active + Future Middle.
     Implemented as a per-item hintRef overriding the drill-level
     ui.hintRef. Standing recon rule: check for form-dependent hints
     in every future chapter. | Nathanael, VERIFY-5G (h).

D-47 | app | DISCLOSURE FRAMEWORK ADOPTED (DISCLOSURE-RULES.md,
     canonical 2026-08-11, final 2026-08-15). Categories C1-C9 govern
     every disclosure decision app-wide; the examples in the source
     rules are not exhaustive and the categories extrapolate to every
     screen. Consequences logged here so they are not re-litigated:
     nested modals are ABOLISHED (an in-modal control replaces that
     modal's content in place, replaced audio states get their own
     Say button, nothing autoplays on state change); every accordion
     is COLLAPSED BY DEFAULT without exception; accordion labels are
     green with a caret and NEVER underlined, except "Meanings",
     which is the sole underlined label; the three chapter-1 Notes
     are a named INLINE exception (§3.8) that does not generalise.
     21 screen-level data revisions applied in the Step 0 pass;
     renderer items R1-R7 assigned to DISCLOSURE-SPEC1. | Nathanael,
     DISCLOSURE-RULES.md.

D-48f1 | ch9 | DRILL HINTS SHOW ONE PARADIGM AT A TIME WITH A
     MIDDLE/PASSIVE TOGGLE. The original draws only the Middle chart;
     the port previously stacked Middle and Passive in one scrolling
     modal. A two-state control is closer to the original than the
     stack was. | Nathanael, 5G-FEEDBACK-1 item 1.

D-48f2 | ch10 | THE INTRODUCTION FORMULA IS TAPPABLE. The derivation
     line `λύ + σ + ω` is one tap unit playing `chapt_10_j_luw1s`,
     and λύσω in the gloss line taps to the same clip. The original's
     formula is silent. | Nathanael, 5G-FEEDBACK-1 item 2.

D-48f3 | ch10 | DRILL HINTS SHOW ONE PARADIGM AT A TIME WITH AN
     ACTIVE/MIDDLE TOGGLE. The port previously stacked Future Active
     and Future Middle in one scrolling modal. For the same reasoning
     as D-48f1, a two-state control is closer to the original than the
     stack was. | Nathanael, 5G-FEEDBACK-1 item 3.

D-48f3e | ch10 | THE εἰμί HINT GETS THE SAME TWO-STATE TREATMENT,
     DERIVED from DISCLOSURE-RULES §4.1 rather than requested in the
     feedback. This extension remains inside its objection window and
     is flagged for reversal; reversing it is a two-line change. |
     Implementer, 5G-SPEC3 §2.

D-49 | app | DISCLOSURE SPIKE CLOSED (SPEC1/2/3 + XPATCH + padding
     patch; accepted head cc89c9f). The rule canon is DISCLOSURE-
     RULES.md as amended 2026-08-17 and 2026-08-18 and DRILL-BEHAVIOR-
     RULES.md B-last; this entry is the pointer, not the restatement.
     Supersessions to note: the SPEC1 borderless accordion and main-
     content sticky are REVOKED by the amendments; D-38's footer
     placement is superseded by the §4.3 one-divider composition (the
     Back-left/More-right slot rule survives); D-10's Endings autoplay
     is replaced by an explicit say button; number-marker popups
     (D-31) stayed retired. New standing behaviors: initial-load
     (B-last, census 13/202/4 pinned by ui-disclosure3), one-shot
     keyboard Shift, viewport re-measure + clamp (device soak
     pending), green-underline exclusivity with headerUnderline
     inert, §4.7 hint-modal source fidelity + hand-cursor rule. |
     Nathanael, Disclosure_Spike_Review.pdf +
     Disclosure_Verify_Response.pdf.

D-50 | process | THREE PERMANENT PROCESS RULES (2026-08-25):
     (1) wall-clock time mandatory every round, addenda add to the
     main total; (2) the BUILD document IS the complete exact git
     diff; (3) every rich-text document (PDF, spreadsheet, Word) is
     inspected for strikethrough AND color coding before its content
     is treated as ratified. Grader auto-penalties enforce (1) and
     (2). Recorded here because repeated requests were repeatedly
     missed by both implementers. | Nathanael, 5H prep message.

D-51 | ch12 | AUGMENT DRILL: THE ANSWER-CLIP PROMPT GATE. The drill's
     clips (l_ad1-19, ledger row 108 CONFIRMED afterGuess) record the
     AUGMENTED ANSWER, not the present-tense lemma on screen, so the
     ordinary Greek-tap contract and the Pronounce button would both
     hand the answer over before the guess. The port renders the
     prompt lemma in INK (the Syllable Division exception treatment of
     directive 9) and DISABLES Pronounce until the item is answered;
     after the guess both go live and replay the clip. Derived
     structurally in SelectActivity: prompt Greek + Greek options +
     afterGuess timing, which matches this activity and no other in
     twelve chapters. 5H-SPEC1 3.5 proposed this as "D-50"; that
     number was already spent on the 2026-08-25 process rules, so it
     is filed here. VERIFY-5H (d) decides whether the original leaks
     the answer through Pronounce, i.e. whether the disabled-Pronounce
     half is a deliberate improvement or a mirror. | 5H-SPEC1 3.5,
     implementer.

D-51 (amend) | app | The Augment Drill gate generalised to the section
     4.1 triple; applies to ch3/ch4/ch5's English-prompt form drills;
     English-to-Greek vocabulary drills and spellers excluded by
     ruling. | Nathanael, VERIFY-5H (d), 2026-08-26.

D-52 | ch11 | RELATIVE PRONOUNS INTRODUCTION RESTORED. The original's
     Introduction radio shows the Reflexive/Reciprocal box (rail walk
     p11-12, DOSBox-confirmed); the port shows the TBK's own unshown
     "Relative Pronouns" + "(cont.)" fields (0x4136e, 0x420fc). Six
     clips (k_agree1-4, k_under1-2) remain unwired. | Nathanael,
     VERIFY-5H (a), 2026-08-26.

D-53 | ch11 | Two typographic slips of the original corrected: τοὺτου ->
     τούτου (Demonstrative Examples, Jn 8:23); εκεῖνοί -> ἐκεῖνοί (This
     and That Translation item 13). | Nathanael, VERIFY-5H (m).

D-54 | ch11 | Relative and Reflexive Spelling prompt 24 "whom (masc.
     nom. pl.)" -> "who (masc. nom. pl.)"; answer οἵ unchanged. |
     VERIFY-5H (h).

D-55 | ch12 | Review Vocabulary Chart μέν gloss "one the one hand,
     indeed" -> "on the one hand, indeed". | VERIFY-5H (g).

D-56 | ch11 | K_OSNAP records οὕς, not the neuter ἅ its name implies;
     every ἅ cell now plays K_OSNNS (same form); the speller item whose
     answer is οὕς mirrors the original and keeps K_OSNAP. | Nathanael
     listen, VERIFY-5H (q) + RESPONSE 2.

D-57 | ch8 | AΥΤΟΣ TRANSLATION DRILL HINT: FOUR PAGES WHERE THE
     ORIGINAL SHOWS TWO. The original opens the SAME Hint on every item
     of this drill -- one paged stack whose first page carries the
     Third Person Masculine AND Feminine charts together and whose
     second is the "Three Uses" teaching page (ch8railwalk p7
     bottom-right, p8 top-left). The port splits that first page into
     one chart per page and ADDS the Neuter chart, giving Masculine ->
     Feminine -> Neuter -> Three Uses on the §4.2 Back/More pair with
     Close throughout. Both halves are Nathanael's instruction in the
     same answer; the neuter page is kept because the drill's own items
     use neuter forms (item 1 κατὰ τὸ αὐτὸ πνεῦμα, item 9 κἀγὼ γινώσκω
     αὐτὰ), which was the condition he attached to it. The WordCounter
     dispatch at 8_PRONS.TBK 0x7bf39 does not choose the opening page in
     practice and no longer governs anything here; the Personal Pronoun
     Case Drill's per-item routing is confirmed and unchanged.
     Appended by the implementer per this log's standing rule; renumber
     if the pipeline has already spent D-57. | Nathanael, VERIFY-5H-2
     (s) response, 2026-08-27.

D-58 | ch13 | πᾶς DECLINING DRILL HINT GAINS A SAY PARADIGM BUTTON the
     original's hint screen does not carry. The Learn page records
     say-all audio for the same chart; the hint modal now carries the
     button too. Ruled VERIFY-5I-RESPONSE item 1, 2026-08-30, and
     GENERALIZED by DISCLOSURE-RULES §4.8: wherever a paradigm has a
     say-all recording, its hint-modal copy carries the Say Paradigm
     button even where the original's hint lacks it.

D-59 | ch14 | THE NOTE MARKER BESIDE εἶδον. The original makes εἶδον
     one click that plays the clip and then opens its note after a
     delay. The port cannot make one press both speak and navigate, so
     the form keeps its audio tap and a small circled marker beside it
     opens the note. Accepted VERIFY-5I-RESPONSE I-2/item 8,
     2026-08-30, and made the STANDARD for every future
     audio-tap-plus-note word (DISCLOSURE-RULES §3.12). Instances:
     ch14 Aorist Stems list (Learn topic 6) and Review Second Aorist
     Indicative Forms, βλέπω row.

D-60 | ch14, ch15 | PARADIGM GLOSSES CAPITALIZED APP-WIDE regardless of
     the original's case. The original prints "we took / you took" in
     lower case on ch14's Review and hint copies of the λαμβάνω
     paradigm and ch15's Review copy of the λύω paradigm while
     capitalizing the same glosses on the Learn copies. Ruled
     VERIFY-5I-RESPONSE I-5, 2026-08-30: capitalize everywhere.
     (The lower-case first-person "i" was already corrected as E13.)

D-61 | ch16 | ENDING TRANSFORMATIONS AND CONSONANT SHIFTS MERGED into
     one five-row chart under the single "Ending Transformations"
     topic; the original's "Consonant Shifts" screen header is
     DROPPED. Both screens show ending-transformation examples and the
     second is a continuation of the first. Ruled VERIFY-5I-RESPONSE
     item 7, 2026-08-30.

## Auto-progress / advance rule matrix

MOVED. The full exercise-by-exercise, chapter-by-chapter matrix —
original behavior, port behavior, timings and departures — now lives
in **DRILL-BEHAVIOR-RULES.md** + **DRILLBEHAVIORLEDGER.csv**
(canonical living set; DRILL-MATRIX.md deleted). Ratified values as of
VERIFY-5D: ADVANCE_CORRECT_MS = 2000, ADVANCE_INCORRECT_MS = 4000,
HINT_VISIBLE_MS = 7000, applied retroactively to every chapter.
