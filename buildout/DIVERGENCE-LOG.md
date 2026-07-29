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
     RESOLVED 2026-07-28 at the Phase 0 checkpoint — LAYOUT A: one
     added bottom row, four punctuation keys (comma, raised dot,
     period, Greek question mark) plus a space bar that takes the rest
     of the row and drops to a full-width row of its own where there
     is not room. Letter and mark rows untouched. Inventory is now
     25 letters + 11 marks + 3 composites + 4 punctuation + space
     (44 tiles). Ships in speller-tiles.json, the SHARED contract; the
     component reads it in preference to any inline
     activity.spellerTiles copy, so chapter 1's byte-identical inline
     duplicate can no longer fork the keyboard.
D-18 | app | SPELLING CHECK POLICY (5D Phase 0, Nathanael). "With
     Accents" OFF: accent/breathing/subscript-insensitive, case-
     insensitive, final sigma = sigma, punctuation optional, movable
     nu optional, whitespace normalized. ON: every mark exact —
     and nothing else changes (still case-insensitive, still
     punctuation-optional per the data flag, still movable-nu
     lenient). CASE IS NEVER REQUIRED under either setting: the
     shared keyboard has no capitals and the decision was to keep it
     that way rather than add a shift layer. This also RETROACTIVELY
     fixes chapters 1-2, where Χριστός / Π- / Φ- items had been
     unwinnable with "With Accents" ON since their cohorts shipped.
     | Nathanael, 5D Phase 0.
D-19 | app | English-to-Greek vocabulary drills drop from a four-
     column to a two-column option grid. Ten polytonic Greek words
     four-up need ~33px more than a 320px screen has, and overflow-x
     is hidden app-wide, so the longest words were being clipped in
     silence (measured on ch1, ch2 AND ch3; the expression is
     identical in the shipped build, so it predates this cohort). The
     24-letter grids keep four columns — single glyphs, no width
     problem. | 5D, measured; confirm in VERIFY-5D.
D-16 | ch3 | Movable-nu leniency: verb spelling checker accepts
     3rd-plural forms with or without final nu (original acceptance
     behavior unverified). | 5D assembly, _verify pending.
D-17 | intro | "Getting Around" navigation copy is new-authored (the
     original's Win 3.1 navigation pages don't map to a PWA).
     | Nathanael, phase 4.

## Auto-progress / advance rule matrix (ratified classes, D-14)

| advanceClass | attempts | on correct | on incorrect | surfaces |
| --- | --- | --- | --- | --- |
| retry | until correct | ADVANCE_CORRECT_MS auto | none (retry) | ch1 letter/vocab drills, ch2 syllable counting, ch2 accent rule |
| manualOnIncorrect | 1 | ADVANCE_CORRECT_MS auto | feedback + manual Next, options lock | ch3 verb/translating/parsing + vocab drills; expected ch4-8 case/translation drills |
| autoBoth | 1 | ADVANCE_CORRECT_MS auto | ADVANCE_INCORRECT_MS auto | ch3+ Scripture Memory Drill; ch2 one-attempt reveal surfaces (migrate at next touch) |
| manual | n/a | manual | manual | all spell/spellVerse/divide/placeAccent (Check Answer flows) |

Implemented 5D in src/lib/timing.js: the two constants plus
resolveAdvance(answerPolicy), which maps BOTH the advanceClass field
(ch3+) and chapter 2's older attemptsPerItem/autoAdvanceMs/
autoAdvanceOnIncorrect triple onto the same three classes. An explicit
autoAdvanceMs still wins, so chapter 2's shipped ~4s feel is unchanged
until it is retuned. No component file contains a timing number.

Original observed timings for the record: ch2 one-attempt reveal ~4s
(J1); ch3 drills ~2s correct, manual incorrect; ch3 SM drill ~2s/~4s.
Completion semantics (unchanged): retry completes on all-correct;
one-attempt completes on all-attempted.
