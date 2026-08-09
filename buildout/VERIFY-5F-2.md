# VERIFY-5F-2.md — chapters 6, 7 and 8

Ten items. Everything else about this cohort is settled by the
harnesses (587 behaviour assertions, 70 rail stops at 380px, 85 modal
states), by the page-by-page rail-walk comparison, or by your answers
in `VERIFY-5F.md`.

Data defects found this round are not below — they are pipeline work,
listed in `5F-SPEC1-RESULTS.md` §8, and there is nothing to look at on
the device.

---

## Decisions I could not make (3)

**1. ch7 "οὐ, οὐκ and οὐχ" — what is the link? ANSWERED (5F-FEEDBACK.pdf
item 15).** "Ou, ouk, oux should be clickable to play their audio, the
NUMBERS should be clickable to bring up the menus." Built: the number
marker opens the popup, the Greek word is an ordinary audio tap.
DIVERGENCE-LOG D-31 revised accordingly. No longer open.

**2. ch7 εἰμί Spelling Exercise — does the original accept `ἐστί`?**
The data gives `answer` `ἐστίν` and `answerAlt` `ἐστί(ν)`. As
delivered the field did nothing — parentheses are already optional, so
both folded to the same spelling. I read the parenthesis as "the nu is
moveable" and made the port accept **ἐστί as well as ἐστίν**. That is
me inventing a grading rule. If the original only PRINTS it that way
and rejects the bare form, it comes out.

Answer: accepts ἐστί / rejects it

**3. ch8 Personal Pronoun Case Drill — case tapped before person?**
You settled person-then-case (VERIFY-5F item 7) and that is built.
What you did not settle is the reverse order. The port commits on
whichever tap completes the pair — so tapping a case FIRST means the
person tap commits it and you get no chance to change the person. The
alternative is to refuse case input until a person is chosen. The rail
walk shows both grids drawn live, which is why I did not gate it.

Answer: leave as is / gate the case grid

---

## Listen (1)

**4. Three chapter-8 clips whose surface is unknown.**
Everything else in the three chapters' audio is script-verified against
the TBK dispatch tables. These three are not, and the answer changes
wiring:

- `h_voc3` and `h_voc9` — the lexicon uses `h_voc3a`/`h_voc3b` for
  ἐγώ/ἡμεῖς and `h_voc9a`/`h_voc9b` for σύ/ὑμεῖς. **Do the unsuffixed
  clips say BOTH words?** If so they belong on the paired flashcard
  card, which currently plays only the first half.
- `h_1nse` — unidentified. Reads as "first person nominative singular
  emphatic", which the grammar does not have.

Answer:

---

## Device (4)

**5. Airplane-mode walk.** Download the ch6/7/8 packs in the app,
airplane mode on, walk all three rails (20 / 25 / 25 stops). Content,
bundled Greek font, audio from IndexedDB, end-of-chapter dialog.

PASS / FAIL:

**6. The prepositions SVG on real WebKit (ch6).** Its Greek labels are
SVG `<text>` — the one place in the app where the bundled font could
fail to apply when HTML succeeds. Do ἐν, περί, ἐπί render in the Greek
face with breathings and accents intact?

PASS / FAIL:

**7. The two new layouts at phone width, no clipping.** ch8's pronoun
paradigm (Singular and Plural side by side, four rows) and ch8's
two-stage case drill (person column plus a 2x4 case grid). Shortest
phone you have.

PASS / FAIL:

**8. ch6 ἐπί popup with the Safari toolbar showing.** Longest sheet in
the cohort. Clean at five CSS viewport sizes in the modal pass, but a
dialog has shipped twice with its close button below the fold. Is
Cancel reachable at rest?

PASS / FAIL:

---

## Taste (2)

**9. Does the prepositions diagram work as a diagram? UPDATED
(5F-FEEDBACK.pdf item 1).** "Copy the chart exactly... every
intersection... exact angle... positioning." Rebuilt on polar geometry
around a shared ellipse (wider than tall, as asked) so every arrow
meets the boundary at its own label's angle — see 5F-SPEC1-PATCH1.md
and DIVERGENCE-LOG D-34. Still a reconstruction from the rail-walk
image, not a pixel trace (no coordinate-extraction tool available in
this environment) — this question is still open in that narrower
sense: does the rebuilt geometry read as a closer match at a glance?

PASS / FAIL:

**10. ch6 and ch8 vocabulary drills stay two-up on iPad** where ch5 and
ch7 go four-up (D-32 — the case split forces an authored grid, and
nothing in the data marks it as vocabulary). Compare ch5 and ch6
Vocabulary: Greek to English side by side on the iPad. Live with it,
or have the pipeline mark those four drills?

PASS / FAIL:
