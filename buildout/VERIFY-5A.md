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
    RESPONSE:

## B. Cold start (the metric that must NOT regress)

B1. Force-quit the app on the iPhone. Cold-launch. Record resp-start
    and js-start from the debug card. Expectation: same order as the
    post-4.5 numbers (resp-start ~tens of ms), NOT seconds.
    RESPONSE (numbers):

B2. Repeat B1 once more (second cold launch) to dodge any first-launch
    update work. Numbers:
    RESPONSE:

## C. Airplane-mode walk (standing directive 4)

C1. Airplane mode ON. Cold-launch the app. Walk the FULL chapter 1
    sequential rail start to finish. Expectation: every page renders,
    no blank screens, no error toasts, 0 dead ends.
    RESPONSE:

C2. Still offline: tap several Greek items across different activity
    types (stepper letter, flashcard word, chart glyph). Audio plays
    from the on-device library.
    RESPONSE:

C3. Still offline: while ON an activity page, pull-to-refresh (or
    kill and relaunch directly into that route via the app switcher).
    The activity route must reload correctly offline — this is the
    chunk-precache proof on real WebKit.
    RESPONSE:

## D. Failure-path spot check (online)

D1. Airplane mode OFF. Navigate TOC -> chapter 1 hub -> an activity ->
    back -> Settings -> back. No loading flash on any hop (loads
    should be imperceptible), no console-visible errors if you have
    the debug surface open.
    RESPONSE:

## E. Anything else

E1. Note ANY behavior that feels different from the pre-5A build,
    however minor. "Feels identical" is the desired answer.
    RESPONSE:

## Outcome

- [ ] ALL PASS -> proceed to 5B (chapter 2 wiring).
- [ ] Any failure -> report here; 5A gets a diagnose-first follow-up
      spec before any content work starts.
