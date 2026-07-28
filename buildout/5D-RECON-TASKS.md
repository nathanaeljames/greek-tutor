# 5D-RECON-TASKS.md — Chapter 3 (Present Active Verbs), manual recon

Cohort 5D, buildout process v2 step 2. Chat-side extraction is DONE:
strings, rich-text records (via scripts/tbk_richtext.py), audio
inventory, and drill pools are all in hand. Per v3 §VIII, scored-drill
ANSWERS are derived by rule (verb parsing is deterministic from the
paradigm chart) — this document routes only what extraction cannot
know: sequence, screen behavior, layout of NEW modes, and spot-checks.

Conventions: one DOSBox pass through chapter 3, PDF/screenshots +
short answers. Items are numbered D1..; mark N/A where a question
turns out moot on screen.

## A. Sequence and structure

D1. Record the exact Learn-menu, Drill-menu, Exercise-menu and Quick
    Review-menu item ORDER as displayed (not TBK storage order), and
    the sequential-rail order across the whole chapter (which page
    does Next reach from each menu's last item?).
    RESPONSE: see attached PDF. Rail order is Learn Chapter Objectives, Learn English Concepts, Learn Verbs: Present Active Indicative, Verb Translating Drill, Greek Verb Drill, Parsing Drill, Present Active Verb Spelling Exercise, Learn Vocabulary, Vocabulary: Greek to English Drill, Vocabulary: English to Greek Drill, Vocabulary Spelling Exercise, Learn Scripture Memory, Scripture Memory Drill, Scripture Memory Spelling Exercise, Review Vocabulary Chart, Review Present Active Indicative Paradigm,Review Scripture Memory, Learn Bibliography (N.B. for future rounds: past rounds have attempted to compile rail order and simply asked me to verify, let's try to do that in future rounds too)
D2. "Learn Vocabulary Builder": screenshot the page. Does it teach
    content locally, or is it a launcher into the separate Vocabulary
    Builder book (vocab1.tbk)? If launcher: note exactly what the
    screen shows before launching. (Port decision pending — the VOCAB
    book itself is end-of-phase.)
    RESPONSE: see attached PDF - is this what you're asking for? Nothing seems to "jump to another book" visually, whatever that means. This vocab exercises seems to work like every other we have encountered so far.
D3. "Learn English Concepts": screenshot all of its pages/topics (it
    looks like a topicPages structure; confirm topic titles and
    order).
    RESPONSE: see attached PDF for walkthrough

## B. New-mode layout confirmations (screenshot each)

D4. Learn Verbs: Present Active — the paradigm teaching page(s).
    Confirm: five verbs each get their own paradigm display? In what
    order (luw, akouw, blepw, legw, pisteuw per audio; confirm)?
    Where does "Say Whole Paradigm" sit, and is each cell tappable
    individually?
    RESPONSE: see attached PDF for walkthrough - yes, each word is tappable individually to play its audio
D5. Review Present Active Indicative Paradigm (Quick Review chart):
    layout vs the Learn page — same grid? Which audio does a cell tap
    play there? Each cells plays C_[transliteration], e.g. C_LUW, C_LUOMEN, C_LUEIS, C_LUETE, C_LUEI,C_LUOUSI
    RESPONSE: see attached PDF
D6. Scripture Memory (Learn): screenshot. Word-by-word layout? Does
    tapping a word play c_sm<n>? What does "Say Whole Verse" play
    (expect c_sm14_6)?
    RESPONSE: see attached PDF - each individual word is clickable to play its own audio.  Yes, exactly each word plays c_sm<n> in order of appearance for each 14 words, and 'say whole verse plays' c_sm14_6.
D7. Scripture Memory Drill: mechanics. What is the prompt (audio?
    English? blank?), what does the student click/do per word, what
    do "Next Word", the score fields and the completion dialog look
    like? 2-3 screenshots through one full run.
    RESPONSE: see attached PDF - autoprogress after 4 seconds for incorrect, autoprogress after 2 seconds for correct.

D8. Scripture Memory Spelling Exercise: confirm free-typing of the
    whole verse + "Check Answer" behavior — is the answer checked
    with or without accents/breathings? What happens on a wrong
    answer (TryAgain flow)? Does "Show Answer Before Typing" surface
    as a visible toggle?
    RESPONSE: see attached PDF - current mechanics are completely impractical - one chance to spell the entire verse - I have accents disabled but for some reason I couldn't even get past word 2. Clicking 'check answer' currently says 'Not quite!' then 'The word you missed was X'. You cannot see the major hint again, only click 'Repeat this exercise' which erases the slate and resets the whole activity. Let's keep the 'Major Hint' button available at all times even though the student could 'cheat' because it's not practical to remember the whole thing. 'Repeat this exercise' should now read 'Restart exercise' as that is more clear. I am just noticing now that the onscreen keyboard is not exhaustive as I needed to use my physical keyboard to type a space. On ios/ipad this is obviously not an option. I am not sure if any activities in chapter 1-2 required typing more than a single word but we definitely want to modify the keyboard throughout the app in the next spec to add a spacebar, and are there any other keys I am missing that will be needed to answer any questions in chapters 1-3 or potentially in the future? Please list them if so. E.g. I can use tap instead of arrow keys, but I MUST have a space key, so the former don't need to be added but the latter or others like it must be added (e.g. possibly comma, period, greek question/semicolon, anything actually required to answer any exercise in this app). Perhaps the next spec can ask the model to pause buildout and ask a user question, maybe presenting the results of its research, keyboard modification suggestions, and a few wireframes or mockups I can choose from before proceeding?

## C. Drill wiring (pools are extracted; confirm the wiring)

D9. Greek Verb Drill: confirm the prompt is an ENGLISH person-gloss
    (e.g. "we loose") and the options are GREEK verb forms — how many
    option buttons per item (extraction shows six parallel option
    columns; confirm six on screen), and are options fixed per item
    or shuffled?
    RESPONSE: see attached PDF - N.B. autoprogress after 2 sec for correct, no autoprogress for wrong
D10. Verb Translating Drill: confirm prompt = GREEK form (with
    audio?), options = ENGLISH translations, three per item.
    RESPONSE: see attached PDF - yes, with audio, N.B. autoprogress after 2 sec for correct, no autoprogress for wrong
D11. Parsing Drill: confirm prompt = GREEK form and the option set —
    are the choices full parsings ("3rd person plural") as buttons,
    and how many? Screenshot one item.
    RESPONSE: see attached PDF - N.B. autoprogress after 2 sec for correct, no autoprogress for wrong
D12. All three drills: does the item order shuffle per visit, and is
    there auto-advance on correct (timing feel: ~1s / ~4s / none)?
    RESPONSE: see above - it does not seem that they are shuffled between visits, but they could be
D13. Spot-check FIVE rule-derived answers, chosen across drills
    (list will ride in the margin of the PDF): e.g. lu<ousin ->
    "they loose"; a]kou<ete -> 2nd plural; ble<peij -> "you see
    (sg)". Confirm on screen.
    RESPONSE: see attached PDF

## D. Audio spot-checks

D14. c_vocl3 — confirm it is the Say Whole List clip for the vocab
     chart.
     RESPONSE: confirmed
D15. c_ending — what plays it? (Name suggests an endings recitation
     on the paradigm page; find its trigger.)
     RESPONSE: On the Learn Verbs: Present Active Indicative - Paradigm page (see attached PDF), there are two buttons 'Say whole paradigm' which plays audio and 'Endings' which show the endings from this audio clip, but no audio plays when that button is clicked only the screen showing the endings shows. Not sure if that fell through the cracks in the original or if we should restore it but I don't see any other triggers after a full chapter walkthrough.
D16. c_paipar / c_pistei vs c_pistew — confirm which surfaces use
     these (paradigm cells for pisteuw expected; note any mismatch).
     RESPONSE: c_paipar is identical to the audio played for the 'Say Whole Paradigm' button on Learn Verbs: Present Active Indicative - Paradigm page (see attached PDF); c_pistew is the audio used in Verb Translating Drill for pisteuw or 'I believe' (Mk 9:24); c_pistei is the audio used in Verb Translating Drill for pisteuete or 'you believe (pl)'  (Mat 9:28) 

## E. Known contamination — no action, awareness only

The Attributive/Predicate/Substantive "Hints" popups near the drill
pages are shared-engine Hebrew-tutor resources (their agreement list
includes "Definiteness"). They are EXCLUDED from the port. If any of
them is actually reachable from chapter 3's UI in DOSBox, note where
— otherwise ignore.

## F. Out of scope for this pass

- Chapters 4-8 (their recon rides with cohorts 5E/5F).
- The VOCAB/REV_* /JOHN books.
- Any answer collection for drills: answers are rule-derived;
  only the D13 spot-checks are wanted.
