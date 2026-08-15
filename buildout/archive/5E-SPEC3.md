# 5E-SPEC3.md — cohort 5E round 3: correct the 5E-SPEC2 over-reach

Date: 2026-08-06, revised the same day against
`drill_behavior_unify_2.xlsx` — Nathanael's second DOSBox pass, which
corrected the `Behavior on correct?` column he had not checked closely
the first time. **That workbook is now the authoritative source for all
50 activities and confirmed the corrected ledger exactly: re-deriving
the ledger from it produced ZERO behavioral changes in all five chapter
files.** The class collapse below is therefore verified, not merely
argued.

Base: the tree that produced `5E-SPEC2-RESULTS.md`.
Single implementer, in place. Small round.

5E-SPEC2 §1 specified behavior on the CORRECT-answer path that Nathanael
never asked for and that no observation supports. The implementation is
faithful to that spec; the spec was wrong. This round corrects the spec,
the two canonical documents, the data, and the code.

Deliverables: `5E-SPEC3-RESULTS.md` and `5E-SPEC3-BUILD.md`, the BUILD
document carrying the complete `git diff` inline.

Reissued with this spec, already corrected — **commit as delivered**:

- `buildout/DRILL-BEHAVIOR-RULES.md` (four classes, new §B1a, §B1b, §C0, §E4a)
- `buildout/DRILL-BEHAVIOR-LEDGER.csv` (43 scored rows now auto-advance on correct)
- `scripts/apply-behavior-matrix.py` (four-class validator)
- `src/data/chapt-01.json` … `chapt-05.json` (restamped)

## 1. Four classes, not six

`spellUntilRight` and `manualCorrectAutoIncorrect` are DELETED. They
existed only to express "wait for Next on a correct answer," which is
not a thing this app does.

| Class | On correct | On incorrect |
| --- | --- | --- |
| `autoBoth` | auto-advance | reveal the answer, auto-advance |
| `manualOnIncorrect` | auto-advance | reveal the answer, wait for Next |
| `retryUntilRight` | auto-advance | do NOT reveal, item stays open for another attempt |
| absent | not scored | not scored |

Migration: every `spellUntilRight` becomes `retryUntilRight`; every
`manualCorrectAutoIncorrect` becomes `autoBoth`. The restamped data
already reads this way; `timing.js` resolves the flags, so this should
be a small change there plus the `check:shapes` valid-set.

**EVERY correct answer auto-advances after `ADVANCE_CORRECT_MS`**,
still `max(2000, clip)` under §2 of 5E-SPEC2 so `afterGuess` audio
finishes first. No class, activity or chapter may opt out.

**Exception that is not an exception:** the three whole-verse spellers
(`c3_ex_scripture_speller`, `c4_ex_scripture_speller`,
`c5_ex_scripture_speller`) hold one item each. They carry
`retryUntilRight` like the rest, and auto-advance is a no-op where
there is no next item — mark correct, stop, leave the sequential rail
to the student. Do not auto-drive the rail.

**Acceptance.** All 43 scored activities auto-advance on a correct
answer, measured through the UI, at `max(2000, clip)`. Assert one per
class per chapter. `check:shapes` fails on any of the two deleted class
names.

## 2. Withdrawn: 5E-SPEC2 §5.6

**Do not change any option-grid layout.** 5E-SPEC2 §5.6 asserted that
the English-gloss vocabulary grids render four-up at all widths. They do
not — D-19 landed in 5D-SPEC2/XPATCH1 and all ten measure 2-up at 320px
and 4-up at 768px. The §5.6 premise came from misreading a VERIFY answer
in which Nathanael asked to be TOLD whether past chapters complied; I
turned a question into a directive.

The 5E-SPEC2 implementer was right to change nothing and to file the
29-grid census instead. **Keep the census and keep the permanent guard**
that fails if a new grid arrives four-up at 320px — that guard is the
correct residue of this item.

## 3. Keep: 5E-SPEC2 §5.3 as a data-side rule

Putting the "Nouns are retentive" / "Verbs are recessive" underlines in
`apply-behavior-matrix.py` beside D2 is right, not a compromise. The two
sentences carry no structural signal a renderer could key on, and
data-side typography is where that belongs. Leave it.

## 4. Fix the harness default that overwrote a parallel run

`scripts/ui-walk.mjs` defaults `--out` to the round-1 screenshot
directory and overwrote 475 captures from the parallel run before anyone
noticed. Change the default to a path that includes the current round or
a timestamp, and make the script REFUSE to write into a non-empty
directory unless `--force` is passed. A tool that silently destroys
evidence is worse than a tool that stops.

## 5. Spellers must NOT reveal the correct spelling

This resolves the open question from the first draft of this spec, and
it is stated openly rather than buried in a table, because it is the one
change here derived from the ORIGINAL column rather than from a cell
marked for change.

**All twelve spelling exercises take `retryUntilRight`: a wrong answer
reveals nothing, keeps what the student typed, and the item stays open
for another attempt or a manual Next.**

Nine spellers currently reveal the answer. That cell was never marked
for change, so under the letter of the review it would stand. It should
not, for three reasons: Nathanael corrected the ORIGINAL column in blue
for ALL TWELVE spellers to read "don't give correct answer", so it is a
verified observation rather than an unexamined value; two spellers
(`c1_ex_speller`, `c2_ex_speller`) already behave that way, so the tree
is internally inconsistent; and revealing the spelling ends the
exercise, which is why the class exists at all. DRILL-BEHAVIOR-RULES
§E1 puts DOSBox observation above the port.

The standing divergence still holds: the port does NOT clear the slate
on a wrong answer, where the original does. That is what the Clear
button is for.

**If this reading is wrong, say so before building it** — it is the
only item in this spec not traceable to a cell Nathanael marked.

## 6. Report, do not act

**6.1 Is `attemptsPerItem: "retry"` doing anything?** The stamp sets it
on all fourteen `retryUntilRight` activities. Say whether it is read
anywhere, or whether the class alone drives behavior and the field is
dead weight to be removed at the next stamp.

**6.2 `c1_ex_pronounce` button set.** The ledger records Previous/Next
as present; the data has `Next Letter` and no Previous. Nothing was
flagged, so change nothing — just state what renders.

## 7. The accent-rule underlines are now in the pipeline

`apply-behavior-matrix.py` as shipped with this spec applies the
5E-SPEC2 §5.3 underlines to "Nouns are retentive" and "Verbs are
recessive" — ten strings across chapter 2 — beside the D2 em-dash rule.
The 5E-SPEC2 implementer reached the same conclusion independently and
put them in their copy of the script; the chat-side copy did not have
them, and now does.

**Take the version shipped with this spec.** If your copy diverges,
diff before overwriting so the underline rule is not lost.

## 8. Out of scope

Everything else in the 5E-SPEC2 tree stands as shipped: the six→four
class collapse is the only behavioral change in this round. Do not
revisit audio timing, the lifecycle fixes, the speller validation
changes, the modal work, the hanging indents, or the harness coverage.
