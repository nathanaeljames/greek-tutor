# 5E-RESULTS-TEMPLATE.md

Copy to `5E-SPEC1-RESULTS-{ME}.md` where `{ME}` is `SOL` or `OPUS`.
Keep the section numbers and headings exactly as they are — the two
submissions are read side by side, and a section that has moved reads
as a section that is missing.

Write for a reader who has the spec and the rail walks open and has not
seen your run. No emoji. Prose over bullets where the point is a
judgement; tables where the point is a list.

---

## 1. Summary

Three to six sentences. What you built, whether it is complete, and the
single most important thing the reader should know before reading on.
If something is not done, say so here, not in section 9.

## 2. Scope conformance

| Spec section | Built | Notes |
| --- | --- | --- |
| §4.1 paradigm row `label` | | |
| §4.2 `charts[]` + `switch` | | |
| §4.3 Meanings expander | | |
| §4.4 D-26 two-column exemption | | |
| §4.5 `revealButtons` | | |
| §4.6 `spell` promptLabel + ref | | |
| §4.7 chart `note` | | |
| §4.8 smaller data keys (7) | | |
| §5 drill matrix classes | | |
| §8 tests and evidence | | |

Then, in prose: anything you built that the spec did NOT ask for, and
why. Be complete here. Unreported out-of-scope work found in the diff
costs more than reported out-of-scope work.

## 3. Data edits made under §0

The spec authorizes you to edit `src/data/*.json` when visual
verification finds missing formatting or text. Every such edit goes
here with before and after, or it is lost at the next regeneration.

| File | Path in JSON | Before | After | Why |
| --- | --- | --- | --- | --- |

If you made none, write "None." — do not omit the section.

## 4. Visual verification

Point at `5E-VISUAL-CHECKLIST-{ME}.md` and summarize:

- Pages walked, of 62.
- MATCH / DIFFERS / BLOCKED counts.
- Every DIFFERS row, restated here in one line each, with your call on
  whether it is a port defect, a data defect, or the original being
  odd.
- Worst horizontal overflow at 320px, with the page and the number.

## 5. Harness changes

What you added to `ui:walk` and `ui:behavior`, and how you kept the
chapter-1/2/3 assertions meaning what they meant before. If you changed
a shared helper, say which and why.

## 6. Test results

| Check | Result |
| --- | --- |
| `ui:walk` chapters 1-5 | |
| `ui:behavior` chapters 1-5 | |
| `check:shapes` | |
| `check:lazy-chunk` | |
| chapt-01/02/03 chunk hashes unchanged | |
| precache entry count / size delta | |

Any test you did not run: name it and say why.

## 7. Surprises

Things that were not as the spec led you to expect. This section is
read closely — it is where the reader learns whether you were paying
attention. Includes: data that looked wrong but was not, a rail-walk
screenshot that contradicted the spec, an existing component that
already did something the spec asked you to add, a §4 item that turned
out to be unnecessary.

If a §4 item was unnecessary, say so plainly. Building something the
codebase already had is a finding, not a failure, but not noticing is.

## 8. What you did NOT verify

Be specific and be generous with yourself here. This project's history
says an honest gap costs far less than a claimed pass that turns out to
be a guess. Anything settled by inspection rather than execution
belongs here.

## 9. Open items for VERIFY-5E

Judgement calls for Nathanael, not facts a script could settle. The
spec's §10 already names seven; add or subtract with reasons. Do NOT
write VERIFY-5E itself — the winning implementer writes it after
grading.

Carried in from the data as delivered:

- ch4 Greek Noun Drill item 3 (Mat 5:24): the shipped underline is
  `brother`; the run table said `to`. Confirm against DOSBox.
- ch4 `d_sm6` / `d_sm6b` / `d_sm7`: listen-check the εἰ / μὴ / "εἰ μὴ"
  assignment.
- ch5 `e_graphn` doubled across γραφή and γραφῇ; `e_grapax` and
  `e_aleia` unreferenced. Listen-check.
- ch5 `e_artmas` / `e_artfem` / `e_artneu` / `e_artpar` have no surface
  in the rail walk. Say whether your build found one.
- ch4 `d_adepar` still has no surface.

## 10. Cost and time

| | |
| --- | --- |
| Wall-clock | |
| Model / tooling | |
| Approximate cost | |
| Turns / sessions | |
