# VERIFY-5B.md — device verification for the deployed 5B build

Scope: the CODE shipped in 5B (Sol base + merge patches), already
deployed. This is separate from VERIFY-chapt02.md, which verifies the
chapter 2 DATA against DOSBox — run both in any order. Expect several
chapter 2 activities to show "pending verification" placeholders;
that is correct behavior until the data patch lands, not a failure.

Legend: [C] = confirm, [W] = walkthrough, [S] = screenshot if odd.

## A. Update + regression

A1. [C] PWA picked up the 5B deploy (build stamp/precache count in
    the debug card; expected precache 19).
    RESPONSE: deploy successful, but I don't seem to have a build stamp or precache count in the debug card - are you referring to generatedAt?

A2. [W] Chapter 1 spot regression on iPhone: hub -> three activities
    of different types (stepper, a select drill, the speller) -> all
    behave as before 5B. Cold-start numbers still tens of ms.
    RESPONSE: confirmed full walkthrough and cold start numbers

## B. Chapter 2 walk (online)

B1. [W] Full 20-item chapter 2 rail walk. Every page renders a real
    surface or an explicit pending placeholder; no blanks, no error
    cards, no dead-end Next; end-of-chapter dialog fires at the end.
    RESPONSE: bibliography is empty, otherwise this is a pass

B2. [C] The four topic pages (Syllables, 3 Accents, Other Marks,
    Grammar Review): topic stepper works, expanders open/close,
    charts fit the screen with no horizontal clipping (check the
    Syllable Names three-column chart and Review Marks chart).
    RESPONSE: yes, functions, see nits in main doc

B3. [C] Greek taps: blue Greek plays audio; ink Greek is inert;
    option buttons never play audio.
    RESPONSE: as far as I can tell

B4. [W] Accent Placement exercise (data-complete): pick a wrong
    accent -> incorrect feedback; correct accent + position -> correct
    feedback, then auto-advance after ~1s; manual Next/Previous still
    work and cancel the auto-advance.
    RESPONSE: yes, with the correct 4s auto advance it was never 1s

B5. [C] Syllable Counting drill: 20 Greek prompts with audio, answers
    accepted, score works. (kai should route through the one-syllable
    special button if present.)
    RESPONSE: yes, see nits in main doc

B6. [C] Speller: chapter 2 words, 39 tiles, With Accents toggle, and
    it did NOT fetch/require chapter 1 content (no visible loading of
    another chapter).
    RESPONSE: yes, as far as I can tell

## C. Offline (standing directive 4)

C1. [W] Download the chapt_2 audio pack in Settings (expect 75
    files). Airplane mode ON, cold launch, full chapter 2 rail walk:
    every page renders offline; Greek taps play from the on-device
    library; kill + relaunch directly into a chapter 2 activity via
    the app switcher -> renders offline.
    RESPONSE: confirmed

C2. [C] Chapter 1 offline behavior unchanged (quick spot check).
    RESPONSE: confirmed

## D. Watch items carried from VERIFY-5A

D1. [C] Bottom nav bar (Learn/Drill/Exercise/Review) greyout: Sol's
    handoff reports a fix in commit fa8132f. During BOTH full walks
    above, did the bottom bar ever grey out or stop responding?
    RESPONSE: at no point did it stop responding that I saw, did at least 4 full walk throughs and various other testing

D2. [C] Completion checks behave per the documented semantics:
    learn/quick-review pages check on visit; scored drills/exercises
    check only after every item is answered correctly (your Gk->En
    perfect-score observation is the intended logic). Spot-check one
    ch2 drill (Syllable Counting) checks after a perfect run and NOT
    after an imperfect one.
    RESPONSE: confirmed

## Outcome

- [] ALL PASS -> 5B code is device-accepted; remaining chapter 2
      work is data-only (VERIFY-chapt02 -> chat data patch).
- [X] Any failure -> report; diagnose-first follow-up spec for Sol.
