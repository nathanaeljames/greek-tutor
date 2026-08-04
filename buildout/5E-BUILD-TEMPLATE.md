# 5E-BUILD-TEMPLATE.md

Copy to `5E-SPEC1-BUILD-{ME}.md` where `{ME}` is `SOL` or `OPUS`.

BUILD is the audit record. RESULTS is what you say you did; BUILD is
what you actually did. The grading chat assesses the diff and the log,
not the prose — a claim in RESULTS that the diff does not support is
worse than no claim.

---

## 0. THE DIFF — non-negotiable

**Section 2 of this document MUST contain the complete `git diff` for
the whole round, embedded inline in a fenced code block.**

Not a summary. Not a file list. Not a link. Not `git diff --stat`. Not
"the diff is large, see the repo." The literal output of:

```
git diff <base-commit>
```

where `<base-commit>` is the commit your copy of the repo started from,
named explicitly in section 1. If you have not committed — and you
should not have, unless Nathanael asked — a plain `git diff` plus
`git status` for any new untracked files is exactly right; include the
contents of new files too, since `git diff` alone will not show them.

A BUILD document without a complete embedded diff **cannot be graded,
and the round does not count for the implementer who omitted it.** This
has cost points in three separate rounds. If the diff is very large,
embed it anyway and note the size; if a generated artifact genuinely
should not be inlined (a binary, a lockfile), exclude it with an
explicit pathspec and SAY WHICH in section 1, so the exclusion is
visible rather than silent.

---

## 1. Run metadata

| | |
| --- | --- |
| Implementer | SOL / OPUS |
| Model and tooling | |
| Base commit (starting state of your repo copy) | |
| Head commit, or `working tree` if uncommitted | |
| Start / end (wall clock) | |
| Total wall-clock time | |
| Approximate cost | |
| Diff exclusions, if any | |

## 2. Complete git diff

````
[paste the full `git diff <base>..HEAD` here]
````

## 3. Files touched

| File | Added / Modified / Deleted | Lines +/- | Why |
| --- | --- | --- | --- |

Every file in the diff appears here. If a file is in the diff and not
in this table, that is the first thing a grader will notice.

## 4. Work log

Chronological. One line per meaningful step: what you were doing, what
you ran, what came back. Enough that a reader can reconstruct the run
without the transcript — including the dead ends. A log with no dead
ends in a round this size reads as a log that was written afterwards.

| # | Step | Tool / command | Outcome |
| --- | --- | --- | --- |

## 5. Commands run and their output

Verbatim, for at least: `ui:walk`, `ui:behavior`, `check:shapes`,
`check:lazy-chunk`, the chunk-hash comparison, and the build. Trim long
passing output to head and tail, and say that you trimmed it. Do not
trim failures.

## 6. Screenshots produced

Directory: `buildout/screenshots/5e-spec1-{me}/`

| Page | 320px file | 768px file |
| --- | --- | --- |

## 7. Decisions taken inside the diff

Anywhere the spec left room and you chose. Name the choice, the
alternatives, and why. This is where a grader distinguishes a judgement
from an accident.

## 8. Self-audit against the spec

Walk §8 of 5E-SPEC1 item by item and state, for each, the evidence in
this document that satisfies it — by section number. If an item is not
satisfied, say so here rather than leaving the grader to find it.

| Spec §8 item | Satisfied by | Yes / No |
| --- | --- | --- |
| 1. Machine rail walk, ch4 + ch5, 320 and 768 | | |
| 2. Side-by-side comparison vs the rail-walk PDFs | | |
| 3. Horizontal-overflow measurement with numbers | | |
| 4. Behavior assertions (switch, toggle, reveals, reset, timing) | | |
| 5. Regression: ch1-3 green, chunk hashes unchanged | | |
| 6. check:shapes, check:lazy-chunk, precache numbers | | |
| 7. Airplane-mode walk (device — Nathanael, not you) | n/a | n/a |
