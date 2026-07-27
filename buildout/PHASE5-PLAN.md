# PHASE5-PLAN.md — vertical buildout roadmap (LIVING DOCUMENT)

Status date: 2026-07-23. Roadmap only; per-cohort detail lives in the
numbered specs. Updated at every cohort boundary.

## Principles (unchanged)

1. Cohorts sized by NOVELTY: new-mode chapters get small cohorts (1-2)
   with their own VERIFY gate; pure-reuse runs batch 3-5 per spec.
2. Every cohort ends with a VERIFY-*.md returned by Nathanael before
   the next cohort's spec is drafted.
3. Every cohort ends with an airplane-mode check + 320px chart checks.
4. Pipeline protocol: PIPELINE-INSIGHTS-v2.md §VIII + the mode
   vocabulary contracts in CHAT-HANDOFF.md. New modes are REGISTERED
   here, never invented silently.
5. Data files regenerate only from committed copies; DOSBox answers
   route to Fable, never directly to the implementer.

## Cohort ledger

COHORT 5A — B5 lazy chapter loading. Spec: 5A-SPEC.md. Gate: VERIFY-5A.
  Status: SHIPPED + DEVICE-VERIFIED (2026-07-23).

COHORT 5B — Chapter 2 (Syllables & Accents), solo (font-map forcing
  function + first scale-out run). Specs: 5B-SPEC.md (+ 5B-MERGE-SPEC
  porting Opus-run patches onto the Sol base), then 5B-SPEC2/3/4.
  Gates: VERIFY-chapt02 (data), VERIFY-5B, VERIFY2, VERIFY3 (device).
  Status: CLOSED AND DEVICE-VERIFIED (2026-07-27). Four implementer
  rounds; the VERIFY4 document phase was skipped because Nathanael's
  visual pass on the SPEC4 tree was a full pass. Data complete, no
  pending placeholders. Handoff: 5B-SPEC4-RESULTS.md.
  Cost note for batching: chapter 2 took four rounds, but three of
  them were TYPOGRAPHY, not content — one Greek face for the whole app
  and a font-derived mark-geometry table, both now standing
  infrastructure. Chapters 3+ inherit them and should not repeat that.

COHORT 5C — RECON PASS (chat-side, no build): string-dump + audio
  inventory chapters 3-8+; PLUS a bounded binary rich-text parser
  experiment (success would shrink the manual VERIFY share for all
  remaining chapters). Output: evidence-based cohort batches below.
  Status: OPEN (5B closed 2026-07-27).

COHORT 5D+ — chapters 3-28 per recon findings. Expectation (inference,
  to be replaced by 5C evidence): chapters 3-6 each carry one-time
  paradigm/parsing mode design (match/translate/parse/audioPlayer
  types from the original plan likely activate here); later chapters
  increasingly pure reuse.

END-OF-PHASE — cross-chapter surfaces (REV_VOC, REV_PAR, JOHN, VOCAB
  index), deliberately last.

## Mode/type vocabulary registry

Chapter 1 (final): objectivesPage, textPage, stepper, flashcard,
equationChart, vowelStair, diphthongRows, exploreGrid, fullOptionGrid,
selfCheckStepper, selfCheckSequence, reviewVocab, reviewLetters.

Added in 5B: mode topicPages; RichContent blocks greekRows, expander
and subheading (+ defList object form, numbered self-labeling,
reviewVocab playAll); activity types divide + placeAccent; select
static option sets, and on select drills the red-mark contract
(redMarkCluster / redFirstAccent); speller-tiles.json shared keyboard
contract.

Also standing infrastructure from 5B, inherited by every chapter and
NOT to be re-derived: the bundled derived Greek face (GreekTutor Serif,
scripts/make-greek-font.py) and the font-derived mark-geometry table
(scripts/make-mark-geometry.py -> src/lib/mark-geometry.json, 221
clusters). They are a matched pair — rebuild one, regenerate the other.

Registry debt for 5C+: explicit layout flag on greekRows; single-source
speller tiles at next chapt-01 regen; lexicon-chaptNN naming (no dash).

## Font-map unknowns tracker

Resolved by chapter 2 word evidence: '#' smooth+circumflex (ἦλθεν,
ἦν); '[' rough breathing (υἱός, ὑπέρ, ῥῆμα + teaching text); ';'
Greek question mark; ':' raised-dot colon (NFC: ';' and U+00B7);
'v' = nu PROVISIONAL (single witness τοὔνομα, VERIFY H4); '!'
EXCLUDED (Hebrew-region contamination).
Still unknown: $ { } ~ | \ ` =  ('{ } | ~' seen only in font-metric
junk, '\' only in DOS paths, '=' only in OpenScript — likely not font
codes; '$' likely a breathing+accent combo awaiting a later witness).
