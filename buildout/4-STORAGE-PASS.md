# 4-STORAGE-PASS.md — Final phase 4 pass: storage-counter anomalies + spurious audio toast (Claude Code work order)

Prerequisites: HANDOFF-4.md §7 (the P1 session — its Chrome measurements
are part of the evidence below). Commit any pending work first.

Framing, per Fable: this is a bounded FINAL investigation pass before
phase 5. Two anomalies were observed on the physical iOS device pass.
Everything in the app WORKS — audio always plays, offline is solid —
so the question is whether these are symptoms of a real underlying
defect or cosmetic reporting noise. IMPORTANT PROCESS CONSTRAINT: all
diagnosis and deduction is YOURS, made against the actual code and
reproduced evidence. This spec deliberately contains observations and
requirements only — no suspects, no theories. Do not pattern-match to
the previous session's conclusions; re-derive from the code. Where the
evidence is reproducible, reproduce before fixing; where it is
iOS-only, instrument so Fable can capture it. Document the reasoning
chain in the handoff.

## 1. Observed facts (verbatim from the device pass, 2026-07-19)

Environment: installed PWA on iPhone (and iPad), deployed Netlify
build, after the punch-list deploy. Manifest = 8521 files, chapt_1
pack = 120 files, intro pack = 6 files, full audio ~88 MB projected
(32 kbps mono m4a). Prior desktop-Chrome measurements (HANDOFF-4 §7):
120 entries / ~1.10 MB after a chapt_1 download, exactly, stable
across cycles, zero duplicate URLs at every stage.

F1. "Audio files stored" after downloading ONLY the chapt_1 pack (120
    files): observed 187, 192, 184, 186, 197 across separate attempts
    — different each time, never 120 (or 126 with intro).
F2. "Audio files stored" during Download All: at the moment the
    aggregate bar read "42% · 3619 of 8521", the counter read 5261.
F3. After Download All completed: counter read 11719; minutes later,
    with no user action, 12344; later still it rendered as "-" (dash).
    Screenshots exist for 11719, 12344, and the dash state; in all
    three, "Used (reported by the browser)" held steady at 136.5 MB.
F4. Clear downloaded audio: counter drops to 0 IMMEDIATELY, every
    time, from any state. Pack badges reset correctly.
F5. "Used (reported by the browser)": 2.2 MB after a Clear; 136.5 MB
    after Download All (projection was ~88 MB). Across PWA
    kill/relaunch cycles after a Clear it wandered both DOWN (~2 MB)
    and UP (~4 MB) between readings.
F6. Toast: "Audio not found: /audio/chapt_1/a_voc3.m4a -- add the
    audio pack to public/audio/" appears intermittently when tapping
    the Greek word on the Learn Vocabulary flashcard — AND THE AUDIO
    PLAYS ANYWAY, every time. Observed repeatedly for files that had
    already played multiple times before. Frequency feels random; not
    correlated with tap speed. So far observed ONLY on this exercise
    (the P5 greek-say tap), across 4-5 full walks of the app.
F7. Offline behavior is perfect: airplane-mode walk of chapter 1 with
    the pack downloaded plays audio on every page including
    never-before-opened ones.
F8. Persistent storage: granted. Quota reported 38.40 GB.

## 2. Investigation requirements

- Read the actual implementations end to end before forming any
  hypothesis: the counter's full path (what is counted, from where,
  when it refreshes, what can run concurrently with it, what renders
  the dash), the toast's full path in audio.js (what condition emits
  "Audio not found", what the playback path does after that condition,
  how the two can both happen for one tap), and every writer/reader of
  the audio cache including the service worker routes as built into
  the deployed sw.js.
- Reproduce what is reproducible with the SW ACTIVE (the deployed
  configuration, not raw vite dev): drive download cycles and
  greek-say taps under the built app. If desktop refuses to reproduce
  an iOS observation, say so explicitly and instrument instead of
  guessing (see §3). Note that the prior session's clean 120/1.10 MB
  Chrome numbers are themselves evidence — whatever explains F1-F3
  must also explain why Chrome was exact.
- Every conclusion in the handoff must cite the code line(s) or the
  reproduced measurement that supports it. "Consistent with" is not a
  conclusion; distinguish what you PROVED from what you INFER.
- Fixes follow diagnosis, not the reverse. If a fix is applied without
  an on-device confirmation path, state what Fable must observe to
  confirm or refute it.

## 3. Deliverable regardless of root-cause outcome

These ship even if the investigation dead-ends, and none of them may
mask evidence needed for the investigation itself:

3a. Debug access inside the installed PWA. The `?debug` flag is
    unreachable there (no URL bar), and opening the URL in Safari
    inspects a DIFFERENT storage partition than the installed app —
    the diagnostic card as shipped cannot examine the environment
    where the anomalies live. Add an in-app activation: seven taps on
    the "Storage" heading in Settings toggles the diagnostic card
    (persist the toggle in sessionStorage; keep `?debug` working too).
3b. A "Copy report" button on the diagnostic card that serializes the
    full diagnostic (cache names, entry count, per-cache counts,
    duplicate-URL analysis, summed bytes, estimate, UA, timestamp) to
    the clipboard as JSON, so Fable can paste results back into chat
    for the next round instead of screenshotting.
3c. The counter must become trustworthy or honest, whichever the
    diagnosis supports: after this pass, on iOS, it either matches
    reality exactly and stably, or it is redefined/relabeled so that
    what it shows is true (and the dash state is replaced with
    something meaningful — a dash with no explanation is neither).
    The Clear->0 behavior (F4) must be preserved.
3d. The toast must never fire when playback succeeds. Whatever the
    F6 mechanism is, the user-visible contract after this pass is:
    toast if and only if the user gets no audio.

## 4. Exit criteria (Fable's "good enough" bar)

PASS: root cause(s) for F1-F3 and F6 identified with evidence, fixed,
verified in the built app, and a short on-device confirmation list
written for Fable (what to tap, what numbers to expect).
ACCEPTABLE FALLBACK: root cause not established within this pass —
then §3c/§3d make the symptoms honest/silent, the handoff documents
exactly what was ruled OUT with evidence (so phase 5 does not re-tread
it), states the residual risk assessment for a 28-chapter buildout in
one paragraph, and phase 5 proceeds. Do not silently downgrade from
PASS to FALLBACK without stating why.

## 5. Verification

  [ ] npm run build clean; full-rail regression walk; hard-offline
      pass (standing directive 4).
  [ ] Reproductions/instrumentation results recorded with numbers.
  [ ] §3a-3d in place and demonstrated in the built app.
  [ ] Chrome cycle from HANDOFF-4 §7 re-run and still exact (no
      regression from any change made here).
  [ ] HANDOFF-4.md gains §8: evidence chain, PROVED vs INFERRED,
      fixes + how Fable confirms on device, ruled-out list, residual
      risk paragraph.

## Out of scope

Phase 5 content, any UI beyond Settings/diagnostic/toast behavior,
IndexedDB, webfont. The multi-day retention observation (VERIFY-4-
DEVICE C3) stays with Fable and is unaffected by this pass.
