# VERIFY-5F-TASK.md -- produce VERIFY-5F.md (no code, no commits, no pushes)

You are the round-11 winner (Opus 5). Your sole task is to author
`buildout/VERIFY-5F.md` for Nathanael's device pass. Do NOT commit,
push, or change any code. Write the file and stop.

## What VERIFY-5F.md must contain

A checklist Nathanael works through on the real iPhone (and iPad where
noted), with clear PASS/FAIL checkboxes and space for notes. Organize
by category. Every item below MUST appear.

**The standing rule:** nothing that an automated click-through can
settle belongs in this document. The harnesses cover rendering, layout,
overflow, tap-target colour, button sets, chart switching, reveal
placement and clearing, revisit-reset, advance timing, popup
reachability, and modal scrolling across all eight chapters. Anything
in that set is a fact, the harness owns it, and putting it in front
of Nathanael wastes the one resource this project cannot script.

What VERIFY-5F asks for is taste, device reality, audio, and
decisions — things no harness can reach.

## Items blocked on pipeline data fixes

Flag these clearly at the top of the document with a note that they
CANNOT be verified yet. Do not ask Nathanael to check a Hint button
that isn't there. These items move to VERIFY-5F2 once the pipeline
fix lands.

- §8.3: Seven teaching topics in ch7/ch8 shipped as flat `para` text
  instead of structured charts. Five of six `hintRef`s dangle. Eight
  drills have no Hint button. Blocked on pipeline re-extraction.
- §8.1: Ch8 pronoun paradigm singular rows missing Greek. Blocked on
  pipeline fix.
- §8.2: Ch8 Examples page missing elision mark on ἀλλ' and missing
  `[[u]]` underlines on pronouns. Blocked on pipeline fix.

## Required items — verifiable now

### Judgement calls

1. **Prepositions diagram (ch6).** Does the SVG diagram communicate
   the spatial relationships clearly? Are the arrow directions correct
   (ἐν at centre, εἰς pointing in, ἐκ pointing out, ὑπέρ arcing over,
   διά going through, ὑπό coming up from below, περί sweeping around)?
   Compare against ch6railwalk p6 and p14. Does the proportion feel
   right, or is the original's wider/shorter circle needed?

2. **Popup sheets (ch6, ch7, ch8).** Open each popup surface. Does the
   sheet read well at phone width? Does Cancel close it? Does audio
   stop when it closes? Specifically:
   - Ch6: tap a gloss on the preposition senses chart (e.g. ἐν's
     "in, within"). Does the popup open with the headword, worked
     examples, and scripture references?
   - Ch7: tap the numbered οὐ / οὐκ / οὐχ lines. Does each open its
     popup? (These use the D-31 headword-on-numbered-line rule.)
   - Ch8: tap the underlined "As a pronoun" / "As an adjective" /
     "As an intensive" labels. Does each open its popup?

3. **D-31: Chapter 7 popup scope.** The word οὐ appears both on the
   numbered line (hot, opens popup) and in the opening sentence
   (ordinary ink, plays audio only). Is that distinction clear, or
   does the opening-sentence οὐ look like a dead link?

4. **Pronoun paradigm layout (ch8).** The singular and plural halves
   render side by side on wider screens and stacked on narrow. At
   phone width, does the split read clearly? Are the case labels
   legible? Does the `note` line about emphatic forms render?

5. **Two-stage grid (ch8 Person drill).** First pick a person
   (3 options), then pick a case (5 options). Does the two-step
   interaction feel natural? Is it clear you're answering in two
   parts?

6. **D-32: Case-split vocabulary grids (ch6, ch8).** These render
   two-up at all widths instead of going four-up on iPad (because the
   pipeline doesn't mark them as vocabulary pools). Does the two-up
   layout look acceptable on iPad, or is it noticeably different from
   ch5/ch7's four-up vocabulary grids?

7. **D-33: `answerAlt` and movable nu.** Ch7 εἰμί drill: type `ἐστί`
   for the answer `ἐστίν`. Does it accept? (It should, per the
   parenthesised `ἐστί(ν)` convention.) Ch8: type `αὐτά` — does it
   accept as an alternative? Should it?

8. **Seven-topic Learn pages (ch7 Adjectives, ch8 Pronouns).** Do
   these read well at phone width, or does the radio rail crowd the
   content panel? (Same question as 5E, now with more topics.)

### Audio — the whole listening pass

9. **Chapter 6 audio spot-check.** Paradigm cells on the preposition
   senses chart, Say Whole List on Review Vocabulary (`f_vocl6`), and
   the scripture memory clips. Specifically: `f_sm6` / `f_sm6b` — do
   εἰ and μὴ map correctly? `f_epi1` / `f_epi2` / `f_epi3` — do the
   three ἐπί senses have distinct clips?
   Unreferenced clips to listen-check: does `f_adepar` belong to a
   surface the build did not find?

10. **Chapter 7 audio spot-check.** Adjective paradigm cells across
    both charts (ἀγαθός and δίκαιος if present), εἰμί paradigm cells,
    Say Whole Paradigm clips. `g_vocl7` on Review Vocabulary.

11. **Chapter 8 audio spot-check.** Pronoun paradigm cells (first,
    second, third person). Say Whole Paradigm clips. `h_vocl8` on
    Review Vocabulary. The cumulative scripture clips (all three
    verses' local copies).
    Unreferenced clips: `i_rm623b` and the four clips from RESULTS
    §8.5 — are any of them audible elsewhere, or are they truly
    orphaned?

12. **Audio stops on route exit.** Start Say Whole Paradigm on any
    chapter 6/7/8 chart, navigate away. It must stop. Also test a
    topic switch inside a topicPages activity (the bug from 5E-SPEC2
    §3.1).

### Device reality

13. **Airplane-mode walk.** Download each chapter's audio pack through
    the app. Enable airplane mode. Walk all three new chapters
    (ch6 20 stops, ch7 25 stops, ch8 25 stops). Content renders,
    Greek in the bundled font. End-of-chapter dialogs reachable.

14. **Real WebKit surfaces.** The prepositions SVG diagram at phone
    width — does the text render in the Greek font? The pronoun
    paradigm at phone width — does the singular/plural split fit?
    The ch8 two-stage grid — do both stages fit without clipping?

15. **Popup sheet scrolling on iOS.** Open ch6's longest popup (ἐπί
    with three senses and multiple examples). With the Safari toolbar
    showing, does the Cancel button remain reachable? Does the sheet
    scroll if the content exceeds the viewport?

### Decisions

16. **Scripture Memory option pools.** Ch6 ships 8 choices, ch7 ships
    10, ch8 ships 10. Ch6's 8 is the same pattern as ch4 (which also
    ships 8). Keep source-faithful, or author the missing distractors
    for ch6? (Carry forward whatever was decided for ch4 in VERIFY-5E.)

17. **Ch7 `adjectivePositions` and `eimiParadigm` Hint charts.** Both
    hintRefs dangle because the data has no chart with those titles.
    The rail walk shows both charts exist in the original. This is
    blocked on the pipeline, but the question for now: should the
    drills show Hint with just the paradigm chart (which does resolve),
    or wait for the full data?

18. **Declining Noun translation auto-reveal.** Carried from VERIFY-5E
    item 3 if not yet resolved. In the original, does the translation
    appear automatically after an answer, or only on the Translate
    button? Now applies to ch6/ch7/ch8's Declining drills too.

## Format

Each item gets a checkbox, a PASS/FAIL, and a notes field. Return
this document as VERIFY-5F-RESULTS (PDF or markdown with your
responses filled in).

## Do NOT include

Page-by-page rendering confirmation, overflow checks, which words are
blue, button presence, chart column alignment, timing measurement,
revisit-reset, popup reachability counts, or modal close-button
reachability. All of those are in the harness reports and are settled.
