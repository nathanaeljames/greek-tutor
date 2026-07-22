# VERIFY-5A.md — device verification for B5 lazy chapter loading

Purpose: gate between 5A (loader conversion) and 5B (chapter 2
content). Do NOT hand 5B to Claude Code until every item here passes.
Because 5A changes ONLY the JS loading path, any new symptom on this
pass is attributable to the loader — that attribution is the entire
reason 5A shipped alone.

Fill in each response slot; screenshots where noted. Return this file
(or a photo/PDF of it) to chat.

## A. Deploy sanity

A1. Netlify deploy of the 5A commit succeeded and the PWA picked up
    the update (Settings shows the new build; if you use the debug
    card's build stamp, note it here).
    RESPONSE: looks like everything succeeded here, screenshots and reports included for iphone and ipad

## B. Cold start (the metric that must NOT regress)

B1. Force-quit the app on the iPhone. Cold-launch. Record resp-start
    and js-start from the debug card. Expectation: same order as the
    post-4.5 numbers (resp-start ~tens of ms), NOT seconds.
    RESPONSE (numbers): iphone Cold start (ms since nav): worker 1 * resp-start 26 * resp-end 30 * js-start 40 * app 43 * DCL 47 * sw true
    ipad Cold start (ms since nav): worker 0 * resp-start 15 * resp-end 376 * js-start 393 * app 397 * DCL 403 * sw true

B2. Repeat B1 once more (second cold launch) to dodge any first-launch
    update work. Numbers:
    RESPONSE: iphone Cold start (ms since nav): worker 2 * resp-start 20 * resp-end 23 * js-start 42 * app 44 * DCL 48 * sw true
    ipad Cold start (ms since nav): worker 0 * resp-start 22 * resp-end 388 * js-start 405 * app 410 * DCL 415 * sw true

## C. Airplane-mode walk (standing directive 4)

C1. Airplane mode ON. Cold-launch the app. Walk the FULL chapter 1
    sequential rail start to finish. Expectation: every page renders,
    no blank screens, no error toasts, 0 dead ends.
    RESPONSE: exactly as expected

C2. Still offline: tap several Greek items across different activity
    types (stepper letter, flashcard word, chart glyph). Audio plays
    from the on-device library.
    RESPONSE: exactly as expected

C3. Still offline: while ON an activity page, pull-to-refresh (or
    kill and relaunch directly into that route via the app switcher).
    The activity route must reload correctly offline — this is the
    chunk-precache proof on real WebKit.
    RESPONSE: pull to refresh doesn't do anything, switching to another app and back resumes on the same page, closing the app entirely and reopening goes to the TOC, but this is expected isn't it? Pretty sure it did this before this step.

## D. Failure-path spot check (online)

D1. Airplane mode OFF. Navigate TOC -> chapter 1 hub -> an activity ->
    back -> Settings -> back. No loading flash on any hop (loads
    should be imperceptible), no console-visible errors if you have
    the debug surface open.
    RESPONSE: no flash on any hop, loads are imperceptable

## E. Anything else

E1. Note ANY behavior that feels different from the pre-5A build,
    however minor. "Feels identical" is the desired answer.
    RESPONSE: feels identical, however, there are a copule of issues which may predate this revision. 1. On a previous pass I noticed that the bottom nav bar (leanr drill exercise review) became greyed out and unresponsive. After navigating to the TOC and back, everything worked as expected and I could not duplicate it so I dismissed it at a fluke. It just happened again as I was doing the full app walk through on iphone, I'm not sure the point it became unresponsive, but after returning to TOC and attempting a second full walktrhough I was not able to reproduce. Maybe we can do a quick check to see if any issue might be causing this in code or maybe it is something with cached data (I had already exited and reentered the app several times when this happened). 2. the checks for tracking activity completion - remind me the logic governing them so I can verify? Just visitng the activity marks them as complete for learning menu and quick review, but for drills and exercises it seems I need to vanigate through every item in the exercise to get the check? That's fine if correct. However, it seemed that with the Greek to English drill it did not mark it as complete even after navigating through all object but marked it as complete only after I got a perfect score? Is that the logic or a fluke?

## Outcome

- [ ] ALL PASS -> proceed to 5B (chapter 2 wiring).
- [ ] Any failure -> report here; 5A gets a diagnose-first follow-up
      spec before any content work starts.
