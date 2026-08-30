# DEBT 3 — untracking the screenshot corpora

`buildout` currently holds **13,286 tracked files, 13,147 of them
screenshots**, whose paths alone total **1.14 MB** — past `execSync`'s
1 MB default `maxBuffer`. That is what took `check:docs` out with
`ENOBUFS` before it read a single document.

The `maxBuffer` fixes are in (`check-doc-integrity.mjs` now passes
`1 << 26` on **all five** of its `execSync` calls — two were still
unguarded, `git rev-parse` and the staged-diff call, which would have
failed the same way on a commit touching a corpus). But buffer bumps
treat the symptom. At roughly 1,000 screenshots per round the next tool
that shells out to a tracked-file list hits the same wall.

The screenshots are **regenerable from the harness scripts**. The
reports are not. Track the reports; stop tracking the images.

## Add to `.gitignore`

```gitignore
# Visual-verification screenshot corpora (DEBT 3).
# Regenerable from the ui-* harness scripts; the REPORTS are tracked, the
# images are not. Tracking ~1000 PNGs per round pushed the tracked-file
# list past execSync's 1 MB default and took check:docs out entirely.
buildout/screenshots/
buildout/**/screenshots/
buildout/**/*.png
!buildout/**/*-report.png
```

## Untracking what is already committed

Removes them from the index and from future checkouts while leaving them
on disk and in history:

```bash
git rm -r --cached buildout/screenshots
git rm --cached $(git ls-files 'buildout/**/*.png')
```

Then confirm the list has collapsed:

```bash
git ls-files buildout | wc -l
git ls-files buildout | awk '{n+=length($0)+1} END {print n" bytes"}'
```

Expect roughly 139 files and a few kilobytes of paths, comfortably clear
of every `execSync` in the tree.

## Before running the above

History is not rewritten, so the repository does not shrink on disk and
the blobs stay reachable. If size is the goal too, that is a separate
`filter-repo` job and a force-push, which is not something to do without
deciding it deliberately.

Closed cohorts' corpora that are worth keeping should be archived outside
the repo first — the round-20 and round-21 sets are the visual record
those rounds were graded against.

## Related, not a debt

The round-20 run hit `ENOSPC` mid-round: the repo volume reported zero
bytes free and recovered on its own. Worth watching, because a volume
that hits zero during a build can corrupt what it is writing — and a
build that dies mid-run leaves a stale `dist` behind a green gate. Untracking
~13,000 files does not reclaim disk on its own, for the reason above.
