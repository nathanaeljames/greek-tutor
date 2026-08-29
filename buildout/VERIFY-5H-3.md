# VERIFY-5H-3.md — the items only Nathanael can settle

Chapters 1, 7, 8 and 11 after 5H-SPEC3 (Opus): the VERIFY-5H-2 closure
round. Authored by the implementer in the same round, per standing rule 0.2.

**This document is the previous-response checklist plus ONE item, and it says
so on purpose.** Rule 0.2's checklist is section 1: every ask from
VERIFY-5H2-RESPONSE, one or two lines each, for you to LOOK at rather than
assume. Section 2 is (y), the only question this round raised that no machine
and no rail walk can settle. There is nothing else: every other item of the
round is either mechanical and pinned, or answered by you already and applied.

Per standing rule 0.5 there is **no airplane-mode section**. The scripted
offline walk ran (chapter 8, every rail stop, refresh on an activity route,
no console errors) and everything after it is assumed offline; report anything
that does not play.

---

## 1. Previous-response checklist

Section 5 of 5H-SPEC3, verbatim. Tick what you can see; anything you cannot
see, say so and it goes to the front of the next round.

- [x] Objectives spacing back to pre-5H-SPEC2 on every chapter; ch7/ch11
      words still tap (item 1).
- [x] ch8 Autos drill: Hint identical on every item; four pages
      Masc -> Fem -> Neut -> Three Uses via More/Back (s).
- [x] ch8 Case Drill unchanged: per-person chart, Cancel only (s).
- [x] ch12 εἰμί/ἔχω hint labelled More/Back (t).
- [x] ch12 εἰμί/ἔχω hint still a one-chart-at-a-time toggle (w).
- [x] ὅς card and chart row: k_voc5 only, no per-form taps (r).
- [x] ch8 chart rows ἐγώ/ἡμεῖς and σύ/ὑμεῖς: each form taps its own
      clip; flashcards play the both-form clips (v).
- [x] ch11 chart row οὗτος αὕτη τοῦτο: three independent taps; flashcard
      plays k_voc7 (v).
- [x] Nothing anywhere plays l_a1s / l_ap9 (k2, closed).
- [ ] ch7 chart row οὐ, οὐκ, οὐχ: three independent taps (g_voc8 /
      g_voc8a / g_voc8b); flashcard plays g_voc8a (all three) (4.3).

**One correction to that last line, which is yours (2026-08-28).** The row is
carried verbatim above because rule 0.2 says verbatim, but the mapping in it is
the spec's reading rather than yours. Shipped: **οὐ -> g_voc8, οὐκ -> g_voc8b,
οὐχ -> g_voc8b** — three taps, two of them the same recording. The flashcard
still plays g_voc8a, the clip that recites all three, so g_voc8a is now on the
CARD only and nowhere in the chart. Tick the row against that.

Where to find each on the device, in one line apiece:

| Row | Route |
| --- | --- |
| Objectives spacing | Learn > Chapter Objectives, any chapter (ch1 is the plain-string case, ch11 the tapping one) |
| ch8 Autos hint | ch8 Drill > Aὐτός Translation Drill > Hint, on any two different items |
| ch8 Case Drill hint | ch8 Drill > Personal Pronoun Case Drill > Hint, on a ἡμεῖς, a σοι and an αὐτ- item |
| ch12 toggle label and shape | ch12 Drill > Imperfect Indicative Parsing Drill > Hint on an ἦμεν item |
| ὅς | ch11 Learn > Vocabulary (the ὅς, ἥ, ὅ card) and Review > Vocabulary Chart (the ὅς, ἥ, ὅ row) |
| ch8 rows | ch8 Review > Vocabulary Chart, the ἐγώ / ἡμεῖς and σύ / ὑμεῖς rows; then ch8 Learn > Vocabulary |
| ch11 row | ch11 Review > Vocabulary Chart, the οὗτος, αὕτη, τοῦτο row; then ch11 Learn > Vocabulary |
| ch7 row | ch7 Review > Vocabulary Chart, the οὐ, οὐκ, οὐχ row; then ch7 Learn > Vocabulary |

---

## 2. The one new item

### (y) The four hint pages have longer headings than the original's panel *(judgement — implementer-raised, from the visual pass)*

- [ ] Your (s) answer is what shipped: the Aὐτός Translation Drill opens the
      same Hint on every item, four pages, Masculine -> Feminine -> Neuter ->
      Three Uses, on the §4.2 Back/More pair with Close throughout. The neuter
      page stays, because items 1 (κατὰ τὸ αὐτὸ πνεῦμα) and 9
      (κἀγὼ γινώσκω αὐτὰ) are neuter forms — that is the conditional in your
      answer, resolved.

      **What the visual pass turned up.** The original's panel
      (`ch8railwalk` p7 bottom-right, and the screenshot in your own response)
      prints ONE heading, **"Third Person Paradigm"**, with **Masculine** and
      **Feminine** as section labels down the page. The port's pages print the
      heading the data authored for each page — **"Third Person Paradigm:
      Masculine"**, then ": Feminine", then ": Neuter" — and the gender is
      therefore said once, in the title, rather than twice (the renderer drops
      the chart's own green gender label when the page title already says it,
      which is the existing heading-deduplication rule doing its job).

      So the wording on screen is the pipeline's, and it is a heading the
      original does not print. The alternative reads exactly like the ch8
      **Learn > Third Person Paradigm** page you already have: "Third Person
      Paradigm" in the title, **Masculine** in green under it, changing to
      Feminine and Neuter as More steps.

      **The original does it the second way when it pages this same stack.**
      `ch8railwalk` **p13** is Review Personal Pronouns: 3rd Person, and it
      pages Feminine -> Neuter on Back/More under a heading that stays
      "Third Person Pronouns" throughout, with the gender as the line beneath
      it. That is the only place the original itself pages these three charts,
      and it is the shape option two produces. I did not simply do it, because
      the page titles are the pipeline's words and quietly discarding delivered
      data is worse than a heading you can rule on in one line.

      Cost either way is small and neither is a renderer change: the second
      option is three page titles in `chapt-08.json` becoming "Third Person
      Paradigm", after which the green gender label comes back on its own.

      → **Keep "Third Person Paradigm: Masculine" / match the Learn page and
      p13 ("Third Person Paradigm" + green Masculine):** ______________

      Notes: Keep as is

---

## 3. Appendix — settled this round, not asked

| Item | How it was settled |
| --- | --- |
| Objectives spacing on all twelve chapters | Reproduced first: the card is `white-space: pre-wrap`, and the newline 5H-SPEC2 left between the list items drew a full line box under every objective. `ui-behavior.mjs` 5H-SPEC3 1 pins the line-box metrics on one plain-string chapter and one audioMap chapter |
| The ch8 hint is the same on every item | `ui-behavior.mjs` 5H-SPEC3 2: the hint is walked from a former paradigm item AND a former Three Uses item and the two walks must be byte-identical, plus page order, chart-then-page shape, and the §4.2 bounds |
| The ch8 Case Drill did not move | Same block: its three per-person routes are asserted on screen (5H-SPEC2 3.1) and its data relation is restated |
| Per-form taps, and only where declared | `ui-behavior.mjs` 5H-SPEC3 4.2: every form of all four rows is an evict-and-refetch tap, the separators are asserted NOT blue, and a twelve-chapter census matches what the lexicons declare against what the charts draw |
| The flashcards are the other half of the rule | The ch7 positive is in the same block (`g_voc8a`, the all-three clip, and NOT split into three taps); ch8's and ch11's stay in the 5H-SPEC2 2.7 block where they were settled |
| The ch7 clip mapping you corrected | `lexicon-chapt07.json` hand-edited (RESULTS 3.6) and the harness repinned per FORM, so the two forms that share `g_voc8b` are each asserted on their own rather than as one row |
| ὅς has no per-form clips on either surface | Same block, asserted by name so the row cannot come back without a ruling |
| (k2) | Same block: chapter 12's data names neither clip anywhere |
| A `parts` list that could not render is now a build failure | `check-content-shapes.mjs`: every part's form must appear in its own printed lexicalForm and its clip must be in the manifest; negative-tested against both halves |
| Three stale harness assertions | `ui-behavior.mjs` W1 (walks the pager to its last page again), P3.2 (renamed for the third time, to the shape it now measures), and the two 5H-SPEC2 assertions the (s) and (v) rulings retired |
| Modal sizing for the four hint pages | `ui-modals.mjs`, two surfaces became four; 54 surfaces at five device heights, 270/270 clean |
| No page whose data changed overflows at 320 px | `ui-walk.mjs` over chapters 7, 8 and 11 |
| Offline behaviour did not regress | `ui-offline.mjs` over chapter 8 |
