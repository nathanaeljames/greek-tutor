# Addendum to DRILL-BEHAVIOR-RULES.md — searching a TBK for activities

Added 2026-08-09 after two chapter-9/10 activities were reported ABSENT
that were present in the file all along. The behavior extrapolation was
100% correct; the INVENTORY it was built on was not. These rules govern
the search, not the prediction.

## F. Searching a TBK

**F1. Never anchor a title search at the end of a printable run.**
ToolBook does not zero a field buffer on rewrite, so a title routinely
carries a stale tail with no separator: `Drilllllll`, `Exerciseeeee`,
`Vocabulary: Greek to English Drilllllll`. A `$`-anchored regex cannot
match any of them. This is the same stale-tail behaviour already
documented for pools in PIPELINE-INSIGHTS Stage 3; it applies to
TITLES too, and that transfer was the miss.

**F2. An ABSENCE is only evidence when the search is known sound.**
Before reporting that a chapter lacks an activity, the search must be
validated: run it against a chapter whose inventory is already
CONFIRMED and check it returns every known activity. A sweep that
cannot find the eight known chapter-6 drills has not proved anything
about chapter 9. Report absences at the confidence of the SEARCH, not
of the reading.

**F2a. Corollary: cite the validation, not a precedent.** "Exhaustive
title search found none" and "confirmed by exhaustive TBK title search,
not assumed" (the chapter-5 no-Case-Drill finding) are the same words
attached to different evidence. Name the validation that was actually
run.

**F3. Cross-check the count against the chapter's own menus.** Every
chapter ships a Drill Menu, an Exercise Menu and a Quick Review Menu
whose buttons ARE the activity list. A title sweep that disagrees with
the menu button count is wrong, and the menu wins. Cheap, independent,
and it would have caught both misses immediately.

**F4. Expect the standard nine.** Every chapter from 9 to 28 carries at
least: a Parsing drill, a Translation drill, the two Vocabulary drills,
Scripture Memory Drill, a chapter speller, Vocabulary Spelling
Exercise, and Scripture Memory Spelling Exercise. A sweep returning
fewer than eight titles for a chapter in that range is missing
something. Treat a short result as a tooling failure until proven
otherwise. (Chapters 27 and 28 are the known exceptions and must be
confirmed individually.)

**F5. Two chapter-specific spellers are possible.** Chapter 10 has both
a Future Indicative Spelling Exercise and a Future Indicative Roots
Spelling Exercise; chapters 14, 15, 16, 18 and 21 show the same
forms/second-speller pattern in the corrected sweep. Do not assume one
chapter speller.

## G. Extrapolating behavior (extends E)

**G1. Ground every audioTiming in a prompt pool that was READ.** Not in
the activity's name, and not in a same-named activity elsewhere (E4).
Record the offset in the ledger Notes so the prediction is auditable.
This is what made the chapter-9/10 pass 100%: seven pools read, seven
timings right, including the two that A1a alone would have got wrong
and the Roots speller, which a name-based guess had wrong.

**G2. Mark predicted rows EXTRAPOLATED, never PENDING.** PENDING means
"nobody has looked"; EXTRAPOLATED means "predicted, needs confirming".
Conflating them hides which rows carry risk.

**G3. `Prev/Next` is the weakest column.** It is inferred from the
advance class via B3 and cannot be grounded in a pool. It was right in
all 17 chapter-9/10 rows, but it is the column to check first when a
prediction fails.
