# PHASE5-PLAN.md — vertical buildout roadmap (LIVING DOCUMENT)

Status date: 2026-07-20. This is a roadmap, not a monolith: it is
updated at every cohort boundary and never pretends to know chapters
it has not seen. Detailed per-cohort work lives in the numbered specs
(5A-SPEC.md, 5B-SPEC.md, ...); this file only tracks the shape.

## Principles

1. Cohorts are sized by NOVELTY, not by a fixed chapter count. A
   chapter that introduces a new activity mode gets a small cohort
   (1-2 chapters) with its own VERIFY gate. Runs of pure-reuse
   chapters batch 3-5 per spec.
2. Every cohort ends with a VERIFY-*.md returned by Nathanael before
   the next cohort's spec is drafted (human-in-the-loop gate).
3. Every cohort ends with an airplane-mode check (standing directive
   4) and 320px chart checks for any new chart.
4. The pipeline protocol is PIPELINE-INSIGHTS-v2.md section VIII,
   with the mode vocabulary of section III mandatory. New modes are
   REGISTERED here as they are created.
5. Process rule: any data file that changes repo-side gets its
   committed copy uploaded to project knowledge immediately; chat
   regenerates only from committed copies.

## Cohort ledger

COHORT 5A — B5 lazy chapter loading (loader only, no content).
  Spec: 5A-SPEC.md. Gate: VERIFY-5A.md. Status: SPEC ISSUED.

COHORT 5B — Chapter 2 (Syllables & Accents). Solo, because it is the
  forcing function for the 11 unknown font-map codes and the first
  full run of the scale-out protocol.
  Chat deliverables: chapt-02.json, lexicon-chapt02.json, updated
  font-map.json (verified tier), VERIFY-chapt02.md, 5B-SPEC.md.
  Gate: VERIFY-chapt02.md. Status: EXTRACTION IN PROGRESS.

COHORT 5C — RECON PASS (chat-side only, no build). String-dump +
  audio-inventory chapters 3-8 (extend further if the session
  affords) to map where new modes actually appear. Output: updated
  cohort ledger below with evidence-based batches. Status: PENDING 5B.

COHORT 5D+ — chapters 3-28, batched per the recon findings.
  Expected (inference, to be replaced by 5C evidence): early grammar
  chapters (3-6) each carry one-time paradigm/parsing mode design;
  later chapters increasingly pure reuse.

END-OF-PHASE — cross-chapter surfaces: REV_VOC, REV_PAR, JOHN
  readings, VOCAB index. Deliberately last: they depend on many
  chapters existing.

## Mode vocabulary registry (grows here; components are mode-keyed)

As of chapter 1 (final): objectivesPage, textPage, stepper, flashcard,
equationChart, vowelStair, diphthongRows, exploreGrid, fullOptionGrid,
selfCheckStepper, selfCheckSequence, reviewVocab, reviewLetters.

New modes added in phase 5: (none yet — chapter 2 candidates will be
proposed in 5B-SPEC.md, never invented silently.)

## Font-map unknowns tracker

Unknown at phase start: ! # $ { } ~ | \ ` = : ;
Greek Keyboard photo suggests ! # $ are breathing+accent combos.
Resolution vehicle: chapter 2 word evidence. Resolved codes move to
font-map.json's verified tier and are logged here with the witness
word(s).
