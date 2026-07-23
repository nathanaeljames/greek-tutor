# Greek Tutor project guidance

Before making changes in this repository, read
`/Users/nathanaelwarren/Desktop/ElyseApp/ONBOARD-SOL.md` in full. It is the
authoritative implementer onboarding and persistent project memory for this
workspace. Follow it together with the active `buildout/*-SPEC.md`.

The load-bearing rules include:

- Work one spec at a time and stay exactly within its scope. Diagnose and
  report code/spec drift before reshaping an implementation.
- Preserve fidelity, pedagogical visual arrangement, the sequential rail,
  offline behavior, audio-stop-on-exit behavior, color semantics, and the
  Greek-tap contract.
- Never create a dead-end sequential Next action.
- Never add an app-load or route-mount full cache/store scan.
- Keep audio bytes and their ownership within the frozen phase-4.5
  architecture. Do not add another IndexedDB or audio-byte writer.
- Do not edit generated `src/data/*.json` content unless the active spec
  explicitly requires it. Surface suspicious data instead of guessing.
- Preserve `{#key activityId}` remount behavior in `ActivityHost`.
- Do not mass-refactor working code. Match local style and patch surgically.
- Run the active spec's acceptance checklist before writing its handoff, and
  record deviations, surprises, and verification evidence in that handoff.
- Do not use emoji in code, comments, UI copy, commits, or handoffs.
- Do not push to a remote. Do not commit unless Nathanael explicitly asks.

