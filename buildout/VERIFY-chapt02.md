# VERIFY-chapt02.md — Chapter 2 (Syllables & Accents) verification

Companion to chapt-02.json + lexicon-chapt02.json (2026-07-20 build).
String extraction reached ~75% of the chapter; everything below is what
needs DOSBox screenshots, walkthrough answers, or listening checks.
Items are ordered so one DOSBox session can sweep them in page order.
Every item's id matches a `_verify` field in the data files.

Legend: [S] = screenshot wanted, [W] = walkthrough/answer list,
[L] = listen check, [C] = confirm yes/no.

## B. Sequence (the big one)

B1. [W] Full Sequential-Next walk of chapter 2 in DOSBox, listing page
    order. My derived sequence (pedagogy-based, NOT verified):
    Objectives -> Learn Syllables -> Syllable Counting Drill ->
    Syllable Division Exercise -> Learn 3 Accents -> Accent Rule Drill
    -> Accent Placement Exercise -> Learn Other Marks -> Marking
    Recognition Drill -> Learn Grammar Review -> Part of Speech Drill
    -> Learn Vocabulary -> Vocab GkEn Drill -> Vocab EnGk Drill ->
    Speller -> QR Syllables -> QR Accents -> QR Marks -> QR Vocab ->
    Bibliography (final, per the ch1-verified pattern).
    RESPONSE: Objectives -> Learn Syllables -> Syllable Counting Drill ->
    Syllable Division Exercise -> Learn 3 Accents -> Accent Rule Drill
    -> Learn Other Marks -> Marking
    Recognition Drill -> Accent Placement Exercise -> Learn Grammar Review -> Part of Speech Drill
    -> Learn Vocabulary -> Vocab GkEn Drill -> Vocab EnGk Drill -> Speller -> QR Vocab -> QR Syllables -> QR Accents -> QR Marks -> 
    Bibliography

## C. Learn pages — topic structure

C1. [C] Learn Syllables topic order: Introduction / Three Syllable
    Rules / Syllable Names?
    RESPONSE: see attached PDF

C2. [S] The three example popups on Three Syllable Rules (OneVowel /
    TwoConsonants / TwoVowels buttons) — words + divisions are in
    rich text and could not be extracted.
    RESPONSE: see attached PDF

C3. [C] Learn 3 Accents topic order: Introduction / 3 Accents /
    Potential Placement / 6 Accent Rules / Words with No Accents, with
    the Accent Chart reached from the rules page and Brief Background
    as a More popup?
    RESPONSE: see attached PDF

C4. [S] Rule 4 chart: besides the two anthropou/anthropoi rows, the
    region references audio ex2_15 — is there a third example row?
    RESPONSE: see attached PDF

C5. [C] Learn Other Marks topic order: Breathing / Punctuation /
    Apostrophe / Crasis / Diaeresis?
    RESPONSE: see attached PDF

C6. [S] SmoothBreathing and RoughBreathing popups: do they show
    huper (ὑπέρ) and rema (ῥῆμα) as extra examples, and where?
    RESPONSE: see attached PDF

C7. [C] Apostrophe page: does παρ᾽ αὐτῷ appear as a second example
    (b_paraut audio is present)?
    RESPONSE: see attached PDF

C8. [S] Diaeresis rows: displayed forms of Isaiah (Ἠσαΐας?) and
    Achaia (Ἀχαΐα?) — the TBK stores neither with diaeresis codes.
    RESPONSE: see attached PDF

C9. [C] Grammar Review topic order: Parts of Speech / Sentence Parts /
    Identifying Verbs / Nouns? And do the Tense/Aspect popups belong
    to Sentence Parts, Identifying Verbs, or both?
    RESPONSE: see attached PDF

C10. [S] Grammar Review "Predicate" popup: Simple vs Complete
    Predicate rows print identical text in extraction ("Joy walked
    home.") — presumably different underlining. Screenshot.
    RESPONSE: see attached PDF

C11. [S] Learn Vocabulary page: instruction line / any note under the
    flashcard (ch1 had the "ignore accents" note; ch2 presumably not).
    RESPONSE: see attached PDF

## D. Drills

D1. [W] Syllable Counting Drill: confirm the pool is the 20 vocab
    words (ch1's 10 + ch2's 10), and spot-check my derived counts —
    especially: kai = 1 (does it use the "Click Here If There Is Only
    One Syllable" button?), pharisaios = 4, akouo = 3, kurios = 3.
    RESPONSE: angelos, amen, anthropos, ego, theos, kai, kardia, lego, prophetes, christos, adelphos, akouo, doxa, echo, kosmos, kurios, logos, petros, huios, pharisaias. The final number attempted is greater than the drills available because I clicked back and answered two questions twice, but this should not be the case. See attached PDF for layout and syllable counts.

D2. [W] Accent Rule Drill: the 20-item pool is extracted (deliberate
    mis-accents included). Need the accepted RULE NUMBER per item, and
    the Hint button's text. Walk all 20 and note answers.
    RESPONSE: see attached PDF

D3. [W] Marking Recognition Drill: instruction line, full item list,
    option button labels, and answers. (I could only pin three items:
    ἐγώ·, τοὔνομα, ἀμήν; — the pool boundary with D2's is ambiguous
    in the binary.)
    RESPONSE: see attached PDF. I'm not sure why this drill says 'Drills Available: 35' - I worked through the whole exercise twice and I only got the same 25 in the same order both times. This may be a typo?

D4. [W] Part of Speech Drill: for every item, the sentence + which
    word is underlined + the accepted part of speech. Sentence pool is
    extracted; repetition counts suggest reused sentences with
    different underlines ("The good book was written in Greek." x6).
    Also confirm the option button set.
    RESPONSE: see attached PDF

## E. Exercises

E1. [W] Syllable Division Exercise: all 21 words (b_ex2_1..21) with
    their correct divisions — rich-text only, fully unextracted. A
    typed list or screenshots, either works.
    RESPONSE: see attached PDF. Seems like I got a false negative in the original on 'Christos', and answering that kai was one syllable was correct but displayed in red to show button was pressed which was confusing. For these exercises let's use blue to show the button has been pressed in the "guessing" stage and green to show the correct placements after you click "Check Answer". Please ensure your scoring algorithm is correct even if it departs from the original algorithm.

E2. [C] Which exercise owns the 20-reference Scripture list (Acts
    22:16, Rom 6:3, Mk 1:8, Mk 1:8, Jn 3:22, Jn 3:26, Acts 2:38,
    Jn 1:25, Mk 10:39, Matt 3:6, Jn 1:6, Jn 1:9, Jn 1:4, Jn 3:19,
    Jn 1:51, Jn 4:28, Jn 2:25, Jn 5:41, Jn 6:10, Jn 4:29) — Accent
    Placement (20 refs = 20 vocab words) or Syllable Division? And
    the pairing order.
    RESPONSE: see attached PDF. Again, let's use blue for guess presses and green for confirmed presses.

E3. [C] Accent Placement Exercise: how is each word displayed before
    answering — accents stripped but breathing retained?
    RESPONSE: see attached PDF

E4. [C] Speller: tile inventory identical to chapter 1's 39 tiles?
    RESPONSE: see attached PDF

## F. Quick Review charts

F1. [S] Review Syllable Rules chart: identical to the learn page or
    with added examples?
    RESPONSE: see attached PDF

F2. [S] Review Accent Rules chart: the Potential Placement summary —
    I captured only "Acute--last 3 syllables"; the grave/circumflex
    summary lines are missing.
    RESPONSE: see attached PDF

F3. [C] Review Marks chart: my nine extracted rows match? And its
    Moses row references audio Mosesx (not Moses) — correct?
    RESPONSE: see attached PDF

F4. [C] Review Vocabulary Chart: two-column layout like ch1, with the
    Play control playing the whole-list recitation (b_vocl2)?
    RESPONSE: see attached PDF

## G. Audio pairings (listening)

G1. [L] b_voc4 = ἔχω? (Only pairing not named in the TBK's script
    table — inferred by alphabetical elimination.)
    RESPONSE: correct

G2. [L] b_ac1..5 = ἦλθεν / ἐκεῖνος / πρῶτος / πρὸς τὸν θεόν /
    καὶ θεὸς ἦν, in that order?
    RESPONSE: correct

G3. [L] b_vb1..6 = λύω / λύεις / λύει / λύομεν / λύετε / λύουσι,
    in that order?
    RESPONSE: correct

G4. [L] b_egoei vs b_egoeim (identical size on the ISO): which does
    the Enclitic page use? b_mosesx: what does it say vs b_moses?
    b_xauto: what word is it (crasis example)? b_touvon = τοὔνομα?
    RESPONSE: b_egoei vs b_egoeim the audio appears to be identical, use either. b_mosesx vs b_moses are the same word but b_mosesx accent is on the 3rd/final syllable (b_mosesx is used in Marking Recognition Drill) vs b_moses accent is on 2nd/penultimate syllable (b_moses is used on the Diaeresis page of Learn Other Marks). b_xauto = "di' autou" (used on the Apostrophe page of Learn Other Marks). b_touvon = τοὔνομα. Also, see attached PDF

## H. Font map

H1. [C] '#' renders as smooth breathing + circumflex (witness ἦλθεν
    on the Rule 5 chart).
    RESPONSE: not really sure what you are asking here but I included a screenshot of that page, hopefully it answers the question

H2. [C] '[' renders as rough breathing (the Breathing Marks page
    prints it in its own teaching text).
    RESPONSE: not really sure what you are asking here but I included a screenshot of that page, hopefully it answers the question

H3. [S] Greek colon: does the original render ':' as a raised dot
    (ano teleia) or an English-style colon on the Punctuation page?
    (Data currently uses U+00B7 raised dot.)
    RESPONSE: I included a screenshot of that page, hopefully it answers the question

H4. [C] 'v' = nu? Single witness τοὔνομα (tou]voma). If the DOSBox
    screen shows a nu there, confirmed.
    RESPONSE: I included a screenshot of the first page I found this word on, hopefully it answers the question

## I. Policy confirmations

I1. [C] Bibliography prints "Hewitt, James A." but body citations say
    "(Hewett...)". The scholar is James A. Hewett. Data corrects the
    bibliography spelling per typo policy A1 (scholar names only).
    Approve?
    RESPONSE: Approve

I2. [C] Feedback pools: 11 extracted "correct" strings against 10
    numbered fields — confirm the live set (one string may belong to
    an exercise-completion pool instead).
    RESPONSE: I have no idea what you are asking here - please name the specific exercise and/or page you want me to check in dosbox or where this information lives for verification

I3. [C] "standarized" (sic) on the Background of Accents page is
    preserved verbatim per policy. Approve?
    RESPONSE: You can do basic spellchecking - I'm not sure what the original context was for the verbatim rule but please correct this obvious mispelling

## Outcome

Return answered items in any batch order — B1, D2, D4, and E1 are the
blockers for a shippable build; everything else can patch in pass 2.
