# VERIFY-5F-3.md — final residual items, cohort 5F

Purpose: close out cohort 5F. Everything in `VERIFY-5F.md` and
`VERIFY-5F-2.md` that you answered is settled and is not repeated here.
This document carries only what remained blank, triaged by risk, plus
one decision carried forward to 5G.

Standing rule still applies: nothing an automated click-through can
settle appears below. The harness cannot reach any of these, because
in the answer-key cases the harness reads the same `answer` field the
data asserts — the check is circular by construction, and only DOSBox
breaks the circle.

Context: chapters 6-8 passed your visual walkthroughs and rail-walk
comparison. Nothing below is a suspected rendering defect. These are an
invented grading rule, a set of derived answer keys, one interaction
semantic that has since propagated into chapter 10, and one small audio
wiring question.

---

## Tier 1 — recommended before 5F is called closed (2 items)

### 1. Does the original accept bare ἐστί? (D-33)

Carried from `VERIFY-5F-2` item 2, still open. This is the only place
in the shipped app where a grading rule stands on an assumption rather
than an observation.

The ch7 εἰμί Spelling Exercise data gives `answer` ἐστίν and
`answerAlt` ἐστί(ν). Parentheses are already optional under D-18, so
the alternate would do nothing at all; the implementer read the
notation as the chapter's way of saying the nu is moveable and made the
renderer accept **ἐστί as well as ἐστίν**. That reading may well be
right, but it is inference, and movable-nu leniency has already been
invented once and withdrawn on this project (D-16, revoked).

**Test:** ch7 Spelling Exercise, the ἐστίν item. Type `ἐστί` without
the nu and check the answer.

- [X5G-XPATCH1.md] The original ACCEPTS ἐστί — D-33 stands, evidence line added
- [ ] The original REJECTS ἐστί — D-33 comes out, renderer reverts

Notes:

---

### 2. Thirteen ch7 Adjective Translation Drill answers

Carried from `VERIFY-5F.md` item 5, which you did not answer and which
was never entered in the handoff's residual list — so it is either
settled in `5F-FEEDBACK.pdf` (which I do not have) or it fell through.
**First question: was this already answered? If yes, say so and skip
the rest of this item.**

The chapter stores no answer key. All fifteen answers were derived from
adjective position and agreement. Two are confirmed by the rail walk's
answered screens (#1 "and for any good deed", #3 "for good works"); the
other thirteen are not.

Assessment on re-reading the option sets: risk is lower than the
original VERIFY framing suggested. Every distractor differs by
vocabulary (good / holy / righteous), by number, or by attributive
versus predicate position — all mechanically determinable from what
chapter 7 itself teaches. A full thirteen-item pass is available if you
want it, but four items carry the real discrimination:

| # | Prompt | Ref | Built as | Confirmed? |
| --- | --- | --- | --- | --- |
| 4 | οὐκ εἰσὶν φόβος τῷ / ἀγαθῷ ἔργῳ | Rom 13:3 | they are not fearful to good work | |
| 10 | μετὰ τῶν ἀγγέλων / τῶν ἁγίων | Mk 8:38 | with the holy angels | |
| 12 | ὁ ... νόμος ἅγιος | Rom 7:12 | the law is holy | |
| 14 | τῆς ἡμέρας τῆς / μεγάλης τοῦ θεοῦ | Rev 16:14 | of the great day of God | |

Why these four: #4 turns on ἔργῳ being dative SINGULAR ("work", not
"deeds"); #10 on plural ἀγγέλων; #12 on predicate position ("the law is
holy") against the attributive distractor ("the holy law"); #14 on
singular ἡμέρας. If all four are right, the derivation method is sound
and I would accept the remaining nine on that basis.

- [ ] Already answered in 5F-FEEDBACK — no action
- [X] All four confirmed
- [ ] Corrections needed (list below)

Notes: I did provide Ch7AdjectiveTranslationDrill.pdf at some point, please review conversations, it may have been provided directly to the implementor, but it should all be accounted for.

---

## Tier 2 — small, opportunistic (2 items)

### 3. Case tapped BEFORE person in the ch8 Personal Pronoun Case Drill

Carried from `VERIFY-5F-2` item 3. This item grew in importance since
it was written: chapter 10's Future Indicative Parsing Drill is a
THREE-stage version of the same component (Tense / Voice /
Person-Number), and its `_stage_note` cites this item as the semantics
it inherits. Whatever the original does here now propagates to a
thirty-item drill in a chapter that has not been built yet.

You settled person-then-case in `VERIFY-5F` item 7: both must be
selected before it counts as an answer, and the learner may change the
person before choosing the case. Built and shipped. What is unsettled
is the REVERSE order — tapping a case first. The port currently commits
on whichever tap completes the pair, so a case-first learner gets no
chance to change the person.

- [X] Leave as is (commit on whichever tap completes the pair)
- [ ] Gate the case grid until a person is chosen
- [ ] The original does something else (describe below)

Notes:

---

### 4. Do `h_voc3` and `h_voc9` say BOTH paired words?

Carried from `VERIFY-5F-2` item 4. The lexicon uses `h_voc3a`/`h_voc3b`
for ἐγώ/ἡμεῖς and `h_voc9a`/`h_voc9b` for σύ/ὑμεῖς. The unsuffixed
clips are unwired. If they say both words, they belong on the paired
flashcard card, which today plays only the first half — a small but
audible gap on a page the learner will visit repeatedly.

- [X] `h_voc3` says both ἐγώ and ἡμεῖς
- [X] `h_voc9` says both σύ and ὑμεῖς
- [ ] Neither does — leave unwired permanently

Notes:

---

## Tier 3 — proposed closures, no work required

My recommendation is to mark all of the following CLOSED rather than
carry them into 5G. One line from you closes the set; strike anything
you want kept open.

- `VERIFY-5F-2` items 5-8 (airplane-mode walk, prepositions SVG on
  WebKit, phone-width layouts, ἐπί popup with the Safari toolbar) —
  superseded by your own device passes and rail-walk comparisons.
- `VERIFY-5F-2` items 9-10 (diagram taste, iPad two-up vocabulary
  grids). D-32 stays logged; the pipeline pool-marker fix is already
  queued as Stage 8.8 for whenever chapt-06/08.json are next open.
- `VERIFY-5F` item 11 (unused-audio confirmation across all three
  chapters) — each was checked against the TBK dispatch tables rather
  than assumed; bookkeeping only.
- `h_1nse`, `h_kai`, `h_kagw` — recorded as surfaceless. `h_gs1` and
  `h_exx2` were placed from your screenshots and are wired.

- [] Close all of the above
- [X] Keep open (list which)
Close everything except VERIFY-5F-2 - I do not understand why chs 6 and 8 reverted to 2 up? Either provide a good reason or standardize this across the app for all vocab drills use 4 up on ipad 2 up on iphone.

---

## Resolved by process, no action — `VERIFY-5F` item 6

Your pushback was right and the fix is now structural, not a promise.
Underlining is pipeline work, never handed to the implementer.
`underline.py` recovers `[[u]]` spans from the TBK's own run tables,
and as of the 5G assembly pass both `assemble_ch9.py` and
`assemble_ch10.py` pull teaching prose through `Tbk.marked()` with STOP
assertions — an underline that fails to extract now HALTS assembly
instead of silently shipping flat text. No hand-placed markers remain
in chapters 9-10. Recorded here so the question is not re-asked in a
later cohort.

---

## Carried forward to 5G — one decision

This is not a 5F item; it is the same exposure as Tier 1 item 2, one
cohort later, and it needs your approval before the implementation
round starts.

`5G-SPEC1.md` §6 has no answer-key spot-check item. Chapter 10's
Translation Drill has THIRTY-ONE derived answers with only item 1
confirmed by the rail walk; chapter 9's has fourteen. The chapter 10
Parsing Drill is better protected — all thirty items pass a clip-family
cross-assert against the TBK's own dispatch table — but the translation
answers rest on grammatical derivation alone, exactly as ch7's did.

Proposed VERIFY-5G item (j): a five-item DOSBox spot-check of the ch10
Translation Drill, suggested items 14, 28 and 29 (the three where
subject/object reversal or an imperative form was the discriminator)
plus two of your choosing, and two items from ch9.

- [ ] Approve — reissue `5G-SPEC1.md` with item (j) added
- [ ] Decline — ship as is

Notes: 5G-SPEC1.md and its crosspatch are already implemented at this point. I am attaching full walktrough's of chapter 9 and 10 translation drills. Please verify, either on this side or the implementation side if necessary, that everything is in working order or make and log the necessary revisions. Do manual translation drill walkthroughs need to become standard proceedure moving forward or do we now have the apperatus to handle it?
