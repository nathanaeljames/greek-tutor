# VERIFY-4-DEVICE.md — Phase 4 device pass (the only gate to phase 5)

Everything below is on-device verification of work that is already
code-complete and machine-verified (HANDOFF-4.md sections 5 + 7). Before
starting: deploy, then CLOSE AND REOPEN the installed PWA (possibly
twice) so the autoUpdate service worker takes over. For item A4, REMOVE
and RE-ADD the PWA to the Home Screen (iOS caches the icon per install).

Answer inline; screenshots where noted. Items are ordered by importance.

## A. Blocking sign-offs

A1. Double-tap zoom (P2 — the repeat offender, universal fix applied).
    On iPhone AND iPad, in the installed PWA:
    - Rapid same-tile taps in the speller: no zoom?          [X]
    - Rapid Backspace in the speller: no zoom?               [X]
    - Double-tap on empty areas (headings, panes, padding):
      no zoom anywhere?                                      [X]
    - Pinch-zoom still works?                                [X]
    If ANY zoom remains, note exactly where — a pre-authorized JS
    fallback exists and needs only the trigger location.
    Notes: There are a very few places double tap zooms slightly but none of them are affecting the functionality - keyboard is fixed and that was the primary issue
    _______________________________________________

A2. Storage ground truth (P1). In Settings:
    - Download the Chapter 1 pack: "Audio files stored" rises to the
      pack count?                                            [ ]
    - Clear downloaded audio: "Audio files stored" drops to 0
      IMMEDIATELY?                                           [X]
    - Re-download: returns to the same count (120), not more? [ ]
    This row is the real indicator now. The "(reported by the browser)"
    estimate line is EXPECTED to lag or sit frozen — that is the
    browser, not the app (reproduced on desktop Chrome with a provably
    empty cache).
    Notes: Audio files stored updates immediately but does NOT match the pack count. Deleting immediately takes downloaded files count back to zero. Downloading again may show a completely different number of stored audio files - maybe the count +/- 15-50 audio files (when downloading the 120 files, shows 187 one time, 192, 184, 186, 197 another time - seems random). Everything in the app appears to be working fine and I have not yet encountered an audio that did not play after navigating the entire app 4-5 times now, but I can't explain this behavior. If it helps, I have noticed, only on the Learn Vocabulary exercise so far, that when the Greek word is clicked especially multiple times in a row I will get the "toast" "Audio not found" error but the audio consistently plays anyway. The audio never fails but sometimes clkicking through this exercise I will intermittently get the "audio not found" dialogue even if that audio has played multiple times in the past". This does not appear to be related to the speed of the clicking and seems completely random.
    _______________________________________________

A3. Offline regression (standing directive 4). With the Chapter 1 pack
    downloaded, enable Airplane Mode and walk chapter 1:
    - App shell + navigation fully work offline?             [X]
    - Audio plays everywhere, INCLUDING a page you have never
      opened before this session (never-played file)?        [X]
    Notes: _______________________________________________

A4. App icon (after remove/re-add to Home Screen):
    - The retro pixel lamp appears as the icon?              [X]
    Screenshot appreciated.

## B. Decision needed: iPad portrait layout

The 900px breakpoint means iPad PORTRAIT (~768-834px) now gets the
phone layout (bottom bar + accordion hub) instead of the sidebar it had
before. This was flagged as a behavior change to evaluate, not a bug.
    - Does portrait iPad look/feel right as the phone layout? [X]
    - If not, say so — the fix is changing ONE number (the 900px
      breakpoint value in two places); nothing else keys on it.
    - Landscape iPad / desktop: two-column layout present, sidebar
      scrolls vertically only, no side-to-side panning?       [X]
    Notes: I confirmed the breakpoint in chrome dev tools and everything looks good, but I only have an ipad Air 11-inch M4 available for testing, which is evidently above the 900px breakpoint so I still see the sidebar, but that is fine for me let's keep the breakpoint as is.
    _______________________________________________

## C. Observations to record (not pass/fail)

C1. iOS estimate lag: after Clear in A2, note whether the browser-
    reported figure ever drops — immediately, after killing and
    relaunching the PWA, or days later. Record in HANDOFF-4 §7's blank.
    Observed: I closed the app and tested at some intervals, and actually I got slightly different results for "used" after each app closed, some lower (2MB) and some higher (4MB) - I don't have days to test and as everything appears to be working in the app itself it's not as high of a priority as the verticle build.
    _____________________________________________

C2. One-time cache migration on the long-installed iPhone: open
    /?debug#/settings and expand the Cache diagnostic card. Cache names
    listed should be exactly greek-tutor-audio and greek-tutor-manifest
    (plus workbox precache). Any extra audio-named cache means the
    migration did not run.
    Observed caches: I have no idea how to access '/?debug#/settings' - does this take a certain developer tool?
    ______________________________________

C3. The last storage unknown (carried from 4c/4d): run Download All
    (~88 MB) on the iPhone. Record: estimate/quota before and after,
    the persist status line, and — over the following days of normal
    phone use — whether "Audio files stored" stays at the full count.
    Before: 0 After: 11719 then 12344 then just '-' Persist: __________
    Day 3+: will report back in three days if I remember.
    _______________________________________________

## D. Audible spot-checks (each is a few seconds)

D1. Letter Names and Sounds Drill: tap a letter — name ONLY
    ("alpha"), not "alpha sounds like the a in father"?      [X]
D2. Reading People, Places and Letters: tap the Greek pane itself —
    it pronounces the current item?                          [X]
D3. Learn Vocabulary in Hide Greek mode: Next does NOT autoplay the
    word; revealing it plays it; tapping the visible Greek word
    replays it?                                              [X]
D4. Vocab Greek-to-English Drill: tap the Greek prompt — audio plays,
    nothing advances or answers?                             [X]
D5. Pronounce Letters / Letter-to-Name / Transliterate: tap the
    displayed Greek letter — name plays, nothing advances?   [X]
D6. Negative checks: English prompts (Name-to-Letter, Transcribe,
    En-to-Gk) are NOT tappable; answer options are silent; Phonetic
    Reading and speller tiles unchanged; Review Letters chart behaves
    exactly as before?                                       [X]

## E. Feel

E1. Walk the full 26-item rail on the iPhone: any scroll jank or
    layout flash between pages (the remount cost)?           [X]
E2. Speller rapid typing feels instant (no tap delay)?       [X]
    Notes: _______________________________________________

When A and B are answered (C3's multi-day tail can trail), phase 4 is
closed and phase 5 (vertical buildout) planning starts.
