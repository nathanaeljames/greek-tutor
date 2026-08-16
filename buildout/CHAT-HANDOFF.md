# CHAT-HANDOFF.md — pipeline continuity (refreshed 2026-08-15)

Read with: PROJECT.md, PHASE5-PLAN.md, PIPELINE-INSIGHTS-v3.md,
DISCLOSURE-RULES.md (canonical, FINAL, zero open items),
DIVERGENCE-LOG.md, DRILL-BEHAVIOR-RULES.md + DRILLBEHAVIORLEDGER.csv,
GRADER-PROMPT.md.

## Where the project stands

- **Cohort 5G (ch9-10) is CLOSED on the data side.** All twelve
  VERIFY-5G items answered; both translation drills walkthrough-
  verified; the ch10 Parsing Drill verified 30/30 by pixel-extracting
  the walkthrough PDF (the original REVEALS the correct trio in blue
  on every wrong answer — a full answer key). That extraction found
  and fixed a real defect: the six future-εἰμί items grade Future
  ACTIVE in the original, not Middle (D-46).
- **VERIFY-5F-3 is fully answered.** D-33 stands (accepts ἐστί,
  evidence in the log); ch7 adjective answers confirmed; commit-on-
  completing-tap stands and propagates to ch10's three-stage drill;
  h_voc3/h_voc9 wired to the paired flashcards; Tier 3 closed.
- **Step 0 pipeline data pass is DELIVERED**: all ten chapter JSONs +
  lexicon-chapt08.json revised in one pass (see DISCLOSURE-PATCH.md
  for the complete edit log, sequencing, and provenance flags).
- **DISCLOSURE-RULES.md is canonical and final**: C1-C9 categories,
  first-match procedure, precedence lines, 21 screen-level data
  revisions (now executed), R1-R7 renderer items (pending).

## Next actions, in order

1. **Write 5G-SPEC2.md** (small round, well under one 4-hour window):
   commit chapt-09/10.json; renderer removes the Repeat control;
   implement per-item hintRef + the eimiParadigms hint popup
   (two stacked charts, Close only, no cycling); harness updates for
   the six flipped answers and the form-dependent hint. 5G is fully
   closed when this round grades.
2. **Write DISCLOSURE-SPEC1.md** (big round, budget a full window,
   checkpoint discipline: incremental commits in R-order, cumulative
   BUILD diff, resumable visual checklist): implement R1-R7, commit
   chapt-01..08.json + lexicon-chapt08.json, honor poolKind (D-32
   4-up), swap the ch1 Six Points button for the expander, verify the
   ch5 QR say controls. Grades against DISCLOSURE-RULES.md by section
   number. Screenshots are NOT required in specs; the in-app model
   screens are named in the rules doc.
3. Cross-patch if the rounds diverge (precedent: 5B-MERGE-SPEC,
   5E-XPATCH1).

## Standing decisions made this session

- "Repeat This Exercise" is DELIBERATELY REJECTED (D-42 retired).
  Never re-add, any chapter. Restart Exercise covers resets.
- Answered-screen walkthrough capture of every TRANSLATION-type drill
  becomes part of the recon rail-walk standard for future chapters
  (parsing drills are machine-verified; translation answers are not).
- Form-dependent Hints exist in the original (ch10). Watch for them
  at recon in every future chapter (D-47).
- PDF decisions: check for STRIKETHROUGH geometry before treating
  text as ratified (pdfplumber line-vs-glyph-midline test); struck
  passages are void. Add to PIPELINE-INSIGHTS at next revision.
- Future-εἰμί grades ACTIVE (D-46) — assemble_ch10.py synced.

## Watch-fors carried forward

- The DIVERGENCE-LOG project copy was STALE (pre-5G, ended D-39).
  The delivered replacement flags D-40/D-41/D-43 for merge from the
  current repo copy. Upload the merged version.
- φαρισαῖος redMarkCluster off-by-one: still open pipeline defect.
- Cohort 5H+ grouping is provisional; resize check at cohort opening.
- Audio manifest FROZEN. Data regenerates only from committed repo
  copies. Grading audits BUILD diffs. Directive 4 both halves.
- Competitive tally: Sol 2, Opus 7, Ties 0.
