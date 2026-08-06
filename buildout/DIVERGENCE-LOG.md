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

## Auto-progress / advance rule matrix

MOVED. The full exercise-by-exercise, chapter-by-chapter matrix —
original behavior, port behavior, timings and departures — now lives
in **DRILL-MATRIX.md** (canonical living set). Ratified values as of
VERIFY-5D: ADVANCE_CORRECT_MS = 2000, ADVANCE_INCORRECT_MS = 4000,
HINT_VISIBLE_MS = 7000, applied retroactively to every chapter.
