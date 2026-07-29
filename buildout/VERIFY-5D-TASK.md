# VERIFY-5D-TASK.md -- produce VERIFY-5D.md (no code, no commits, no pushes)

You are the round-6 winner (Opus 5). Your sole task is to author
`buildout/VERIFY-5D.md` for Nathanael's device pass. Do NOT commit,
push, or change any code. Write the file and stop.

## What VERIFY-5D.md must contain

A checklist Nathanael works through on the real iPhone (and iPad where
noted), with clear PASS/FAIL checkboxes and space for notes. Organize
by category. Every item below MUST appear.

### Required items (from the spec, CHAT-HANDOFF, and grading)

1. **pist* audio listen-check (D-16 conflict).** Five clips:
   `c_piseis`, `c_pistei`, `c_pisete`, `c_pistew`, `c_pisteuou`.
   For each: play it on device via a drill tap, write down what word
   you hear, and compare against the item's authored Greek prompt.
   The concern: D-16 heard `c_pistei` on the `pisteuete` item,
   conflicting with the filename. Record what you hear.

2. **Objectives page wording (`_objectives_verify`).** Open
   c3_learn_objectives on device. Read the objectives text. Does it
   look right, or does anything read as placeholder/draft? Note any
   wording that seems off.

3. **D-10: Endings button plays c_ending.** Open the Learn Verbs
   paradigm topic. Tap the Endings button. Confirm it plays audio
   AND opens the endings display. Keep or drop decision: should this
   button play audio on tap, or only open the display silently?

4. **D-16: Movable-nu leniency.** Open the Verb Speller exercise.
   Type `λυουσι` (without final nu) for the answer `λύουσιν`.
   With Accents OFF: does it accept? (It should.)
   With Accents ON: type `λύουσι` -- does it accept? (It should.)
   Then type `αμην` for `ἀμήν` with Accents OFF -- does it accept?
   (It should -- no nu involved.) Keep or drop: is this leniency
   correct for a Greek learner, or should movable nu be strict?

5. **D-14: Timing constants.** Work through several drill items
   across different drills. After a correct answer, does ~900ms feel
   right before auto-advance? After a wrong answer on a
   `manualOnIncorrect` drill, does the "Click Next" state feel right
   (no auto-advance)? On the Scripture Memory drill (`autoBoth`),
   does ~2500ms after a wrong answer feel right? Ratify or propose
   new values.

6. **D-18: Checking policy on device.** Open the Scripture Memory
   Speller. Type the verse WITHOUT accents/breathings, With Accents
   OFF. Does it accept? Now toggle With Accents ON and type the
   verse with full accents. Does it accept? Does the raised dot
   matter under ON? Does case matter under either setting? Does the
   policy feel right for a learner?

7. **D-19: Two-column English-to-Greek vocabulary grids.** This
   change affects ch1, ch2, AND ch3 -- the English-to-Greek vocab
   drills now show Greek options in two columns instead of four
   (the four-column layout clipped long polytonic words at 320px).
   Open all three chapters' en-gk vocab drills on iPhone. Do the
   two-column grids look right? Is the text readable and unclipped?

### Standard device checks

8. **Chapter 3 full rail walk.** All 18 stops in sequence order.
   Every stop renders content (no blank cards, no error screens).
   Every sequential Next is enabled. Final Next opens the
   end-of-chapter dialog. Note any visual issues.

9. **Chapter 1 and 2 regression.** Quick walk of both chapters
   (26 + 20 stops). No new visual issues compared to prior VERIFY
   passes. The shared keyboard appears on ch1 and ch2 spellers
   with the new punctuation row and space bar.

10. **Paradigm chart at 320px.** Open Learn Verbs, paradigm topic.
    Six Greek cells visible with glosses. All six cells are blue and
    play their own clip on tap. Say Whole Paradigm button plays
    `c_paipar`. No horizontal clipping. Also check Quick Review
    Paradigm (no Endings button there).

11. **Interlinear verse at 320px.** Open Learn Scripture. 14 words
    wrap as whole units (Greek never parts from its gloss). The
    gloss-less article renders and plays. Say Whole Verse plays.
    Reference is right-aligned.

12. **Parsing option groups.** Open the Parsing drill. Six options
    in two visually separated groups of three. Labels are readable
    at phone width.

13. **Scripture Memory drill grid.** 10 options in a 2x5 layout.
    `autoBoth` behavior: correct auto-advances after ~900ms, wrong
    auto-advances after ~2500ms.

14. **Shared keyboard.** Open any speller (ch1, ch2, or ch3 word
    speller). Confirm: 25 letter tiles, the mark/composite rows,
    the new punctuation row (comma, period, raised dot, semicolon),
    and a space bar. All fit at 320px without clipping. Open the
    Scripture Memory Speller -- same keyboard, space bar usable for
    multi-word entry.

15. **Airplane mode.** Enable airplane mode. Refresh on a chapter 3
    activity route. Content renders. Walk the full ch3 rail offline
    (18 stops + end dialog). Then spot-check one ch1 and one ch2
    activity offline. Greek renders in the bundled font (rounded
    circumflex, not a tilde).

16. **SpellVerse exercise.** Open the Scripture Memory Speller.
    Type the verse. Check Answer gives word-by-word feedback naming
    the first wrong/missing word by its Greek text. Major Hint shows
    the verse + translation. Restart Exercise clears and resets.
    Completion on a correct verse.

17. **Verb Speller inline items.** Open the Verb Speller. Items
    show a gloss prompt, and Show Answer reveals the Greek form as
    a blue tappable button that plays the word's audio.

### Data observations (not bugs -- just confirm or note)

18. **"he/she believess believes"** -- exercise item 27 gloss. Is
    this visible to the learner, and does it need a data fix?

19. **"they believe pt"** -- a translate string. Same question.

## Format

Each item gets a checkbox, a PASS/FAIL, and a notes field. Return
this document as VERIFY-5D-RESULTS (PDF or markdown with your
responses filled in).
