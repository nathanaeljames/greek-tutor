# 5F-SPEC1-RESULTS.md — chapters 6, 7 and 8

Implementer round, cohort 5F. One round, one implementer. Written
against `5F-SPEC1.md` section by section. Nothing is pushed; the
working tree is committed locally.

---

## 0. Summary

All 70 activities across chapters 6, 7 and 8 are reachable, correct
and rail-ordered. `npm run verify` passes (shapes, build, lazy-chunk
split for all eight chapters). The Playwright behaviour harness passes
575/575, up from 388 at the start of the round; 184 of those
assertions are new 5F ones and a further 24 are old sweeps that now
cover the three new chapters. A 70-stop smoke walk at 380px passes
73/73 with no placeholder, no console error and no horizontal
overflow. The modal pass is 85/85 clean across five device heights,
including the four new popup surfaces.

Six of the delivered data files' contracts were not what the spec
describes, and four of those are, in my reading, defects on the
pipeline side. Per ground rule 2 I have not touched a byte of the data
and have not "fixed" any of them. They are listed in §8 with what the
port does instead. **§8.1 and §8.2 are the two I would want looked at
before this cohort is called done.**

Three new divergences are logged: **D-31** (how chapter 7's popups are
opened), **D-32** (the case-split vocabulary grids and D-19) and
**D-33** (what a parenthesised `answerAlt` means).

---

## 1. What was built

The three data files and their lexicons were already in the tree and
committed; I changed none of them. They are picked up by the existing
`import.meta.glob` registry in `src/lib/content.js` with no per-chapter
wiring, exactly as chapters 4 and 5 are — the glob derives the id from
the filename, so the three chapters and their three lexicons were
already lazily chunked the moment the files landed.

`scripts/check-lazy-chunk.mjs` only proved that for chapters 1-5, so it
now asserts all eight: eight chapter chunks, eight lexicon chunks, all
precached, and no chapter data in the index bundle.

Counts on screen match the spec's table exactly, asserted per chapter
by the smoke walk (`sequence` lists every activity exactly once and
every id resolves): ch6 6/5/3/6 over a 20-stop rail, ch7 7/7/4/7 over
25, ch8 7/6/3/9 over 25.

Audio: every `chapt_6_*` / `chapt_7_*` / `chapt_8_*` id referenced by
the three chapters and their lexicons resolves in
`public/audio/audio-manifest.json` — 141, 143 and 169 distinct ids,
zero missing. I did not attempt to de-duplicate the forward-shipped
`c_sm*` / `d_sm*` / `e_sm*` / `f_sm*` copies; the data references the
local keys and they resolve.

---

## 2. New renderer work

### 2.1 `prepositionsChart` — done, as a diagram

New component `src/components/PrepositionsChart.svelte`. Inline SVG on
a 320x320 user-space grid scaled to the phone viewport, ἐν in a circle
at the centre and the nine others on the named slots, with the arrow
each node's `arrow` field declares: `in` and `out` point at and away
from the circle, `over` arcs above it, `across` runs through it, `down`
drives into it from below, and `curveIn` is περί's encircling sweep.
Nothing is keyed to an activity id or to a Greek word — the slot names
and the arrow names are the data's.

It is deliberately **not** a pixel copy of the original line art, per
the spec. Screenshot:
`buildout/screenshots/5f-detail/ch6-learn-prepositions-5-prepositionsChart.png`.

Every Greek label is a tap target that plays its own clip (directive
9); the gloss under it is ink. The centre word behaves the same way.
Both surfaces — the Learn topic and `c6_qr_prepositions` — render from
the one component, so they cannot disagree; the harness asserts ten
nodes, ἐν at the centre, the right number of arrows, a clip on tap and
no horizontal overflow at 380px, **on both**.

One thing I changed after looking at it: the Learn topic prints
"Prepositions Chart" as its topic heading and the block also carries
that title, so it printed twice. The block now takes the same
`suppressTitle` dedup `Paradigm` already uses.

A slot the layout does not know still renders, in a spare row below the
diagram, rather than vanishing. Nothing in the delivered data uses it.

### 2.2 `popupRef` and full-page popups — done, with one gap

New: `src/lib/popups.js` (the register, carried by Svelte **context**
rather than a module store, so two activities can never see each
other's popups) and `src/components/PopupSheet.svelte` (the sheet). The
sheet is rendered by `ContentAudio` over the whole activity, with a
Cancel control, and closing it stops whatever it started (rule A4).
Every Greek phrase on it — the headword and every worked example — is a
tap target with its own clip.

Three ways a link is declared, all of them data:

| route | chapter | how |
| --- | --- | --- |
| `popupRef` on a `greekRows` row | 6 | the **gloss** is the link, the case tag is ink |
| an `[[u]]` run whose slug is a popup id | 8 | "As a pronoun" opens `asAPronoun` |
| the popup's own `greek` headword | 7 | see below and **D-31** |

The chapter-8 route falls out of the data cleanly: the three popup ids
are exactly the camelCase slugs of the three underlined labels on the
Three Uses page, using the same slug convention `resolveHintBlocks`
already uses for headings. An underlined run that matches no popup
stays a plain underline, which is what keeps `he [[u]]himself[[/u]]
will get the car` on that same page from becoming a dead link — visible
in `5f-detail/ch8-learn-third-person-3-threeUses.png`.

**The gap: chapter 7 ships three popups and no anchors at all.**
`c7_learn_eimi` carries `popups[]` for οὐ, οὐκ and οὐχ, but its
"οὐ, οὐκ and οὐχ" page is eleven flat `para` blocks with no `popupRef`
anywhere in the chapter (`grep popupRef chapt-07.json` → 0) and no
`[[u]]` run on that page. Leaving it alone would have left three
authored pages unreachable, which the spec counts as rail stops, so the
renderer opens a popup from standalone occurrences of its own `greek`
headword in the page's prose, longest headword first so οὐχ is never
claimed by οὐ. Logged as **D-31**. If the pipeline later ships anchors,
an explicit `popupRef` or underline already wins and the rule costs
nothing.

The harness walks every topic of all three teaching activities and
asserts **every declared popup is reachable** — 11 for chapter 6, 3 for
chapter 7, 3 for chapter 8 — plus Cancel closing the sheet, the audio
stopping with it, and the headword and examples playing.

The four popup shapes are in the modal pass at all five device heights
(`buildout/screenshots/5f-modals/`), including the cruel 320x360, where
they still show both borders and Cancel at rest.

### 2.3 `greekRows` extensions — done

- **`senses[]`** — a new `prepositionSenses` row: headword (tappable),
  then one line per sense, gloss as the link and `caseTag` as plain
  ink. ἐπί's three senses stack under the one headword.
- **`parts[]` + `partAudio[]`** — chapters 4 and 5 ship `parts` as
  objects; chapter 6 ships plain strings with a parallel `partAudio`
  whose nulls are the inert connectors. Both shapes normalize in one
  helper, so `διά` `+` `βλέπω` renders with the two Greek parts
  separately tappable and the `+` inert.
- **`bracket: true`** — the row is parenthesised, as the Elision page
  sets its derivations: `( διά + ἐμοῦ )`.
- **`ref`** on a row — a citation line under the row (it takes the full
  row width rather than a grid column, so the two-column gloss layouts
  keep their rhythm).
- **`greek2` on a `verseExamples` row** — chapter 8's Examples page:
  up to two lines of Greek as ONE tap target with one clip, gloss and
  citation beneath. All three verses are tappable, including `h_exx2`
  (Jn 1:42), which VERIFY-5F item 9 asked for.

### 2.4 Underlining is DATA — confirmed, and asserted

I derived no underline from a screenshot and handed none back. The
`[[u]]` and `[[i]]` machinery in `src/lib/markup.js` and
`Marked.svelte` already existed from chapter 2 and the delivered data
carries the runs (4 in ch6, 22 in ch7, 24 in ch8), so this needed no
renderer work beyond the popup link in §2.2.

What it did need was proof, so the harness now walks every teaching
activity and topic of the three chapters and asserts **both**
directions: every authored `[[u]]` run renders (as an underline, or as
the popup link it names), and the renderer invents no underline the
data does not carry.

### 2.5 `note` on prompts — done

Carried through the question builder and drawn beside the prompt in
plain ink at a smaller size, on both surfaces: `.prompt-note` under a
select prompt, `.spell-prompt-note` under a speller prompt. It is never
a tap target — asserted specifically on chapter 6's `(not ἐκ)` items,
which contain Greek and are the logged exception to directive 9.

### 2.6 `options: "perItem"` — done

This one was load-bearing. `buildSelectQuestions` decided an activity
had authored options from `optionsPerItem` or an activity-level
`optionValues`; `options: "perItem"` matched neither, so all five
per-item drills (c6 40 items, c7 15 and 14, c8 20 and 21) were falling
through to the **lexicon vocabulary branch** and would have built a
ten-option Greek grid out of the chapter's lemma list — plausible,
silent and completely wrong. There is now one shared
`authoredOptionSource()` predicate that both the builder and the
surface ask, and `stack1col` maps to the existing one-column layout.

The harness asserts, per drill, that the grid on screen holds **that
item's** three authored options and nothing else, and that they stack
one to a row.

### 2.7 `greek2` — done

A two-line prompt is a line break in one prompt, not a second prompt:
one tap target, one clip, `greek2` null on the one-line items. The
harness steps until it meets a two-line item and asserts exactly that.

### 2.8 `paradigmChart` and `pronounParadigm` — mostly done; two gaps

**Chapter 7's adjective paradigm** (`c7_qr_adjectives`) — three gender
columns by nine rows, every cell its own clip, plus `sayWhole`. Worked
on the existing `Paradigm` component with no change.

**Chapter 7's εἰμί chart** (`c7_qr_eimi`) — two columns by three rows
with a gloss under each cell. This needed one **build-check** change,
not a renderer change: its rows carry no `label`, because the original
prints no case column there, and `check:shapes` required a label on
every paradigm row. The rule now fires only when a chart's *other* rows
have labels, so "some rows are labelled and some are not" still fails
while "no row is labelled" is allowed.

**Chapter 8's pronoun paradigms** — new component
`src/components/PronounParadigm.svelte`, because these rows are not
`{greek, gloss}` cells: the pipeline ships each row as one line of set
text (`"ἐγώ I ἡμεῖς we"`). The renderer splits at the start of the last
Greek run — the plural form — because no gloss on any of these twelve
rows contains Greek, then takes the leading Greek run of each half as
the form and the rest as its gloss. Cells are tappable via the
chapter's own `audioMap` (see below). `c8_qr_third` carries
`paradigms[]`, so `paradigmChart` now supports a More/Back stack:
Masculine → More → Feminine → More → Neuter, Back stepping down,
asserted end to end.

**Gap 1 — chapter 7's adjective topics have no charts.** The spec says
those topics use the `More` pattern for Singular/Plural. They cannot:
all seven topics of `c7_learn_adjectives` are flat `para` blocks with
no `paradigm` block anywhere, and the chapter's own
`_paradigm_note` says the charts "are emitted as quickReview paradigms
and referenced from here" — but there is no reference field in the
topic, and only ἀγαθός reaches Quick Review, not δίκαιος. Chapter 8's
paradigm topics are flat `para` blocks for the same reason. I did not
invent charts. See §8.3.

**Gap 2 — five of six `hintRef`s dangle.** All nine Hint-carrying
drills in the three chapters name a chart:
`prepositionsCaseChart`, `adjectiveParadigm`, `adjectivePositions`,
`eimiParadigm`, `firstPersonParadigm`, `thirdPersonParadigm`. Only
`adjectiveParadigm` resolves, and only because I added a generic
title-slug fallback to `resolveHintRef` (the same slug convention it
already uses for headings) which finds `c7_qr_adjectives`' chart. The
other five name either nothing at all or a topic with no chart in it,
because of Gap 1. The renderer degrades the way it always has — no Hint
button rather than an empty popup — so eight drills that declare a Hint
in `ui.buttons` show none. See §8.3.

**`audioMap`.** Chapters 8's two teaching activities carry an
`audioMap` of inflected form → clip for the 36 pronoun forms, which are
not lexicon lemmas. Nothing read it. `getGreekTapMap` now folds every
activity-level `audioMap` in a chapter into the chapter-wide tap map,
so the Learn pages and the Quick Review charts tap the same clips from
one source rather than each owning a copy. This is what makes the
pronoun chart cells and the Enclitics page live.

### 2.9 `twoStageGrid` — done, per VERIFY-5F item 7

`mode: "twoStageGrid"` builds through a new
`buildTwoStageQuestions()` and renders one grid per `optionStages`
entry inside the existing `SelectActivity`. The behaviour is exactly
what Nathanael confirmed:

- **nothing is judged until both stages are chosen.** A person click
  only records. The learner may click a person, change their mind and
  click a different one as often as they like: no attempt is counted,
  no feedback appears, the score does not move.
- **the case click commits.** The pair is then scored under
  `manualOnIncorrect`, one attempt, from the ledger — reveal, wait,
  say so — and both grids lock.
- **stage 2 opens only once stage 1 has a pick**, which is what the
  instruction line ("Click on the person then the case") describes and
  what keeps the case click the committing one however many times the
  person is changed first. The case grid is visibly inert until then
  rather than hidden.

The person stage renders as a single column. The data declares
`paradigm2col` for stage 2 and no layout for stage 1; left to the
density heuristic "Second Person" came out two-up and the person stage
read as part of the 2x4 case grid under it, so a stage with no declared
layout is drawn as a plain column — which is the word both the spec and
the original use for it.

Five harness assertions cover it: the instruction line, both stages
present in order, the case grid inert, three person clicks judged
nothing, both-right auto-advancing (B1a), a wrong second stage
revealing and waiting, both grids locking, and a wrong FIRST stage
being judged only once the pair is complete.

### 2.10 `answerAlt` — done, both shapes

**Chapter 8's αὐτά.** The item carries `answerAlt` as a list of extra
acceptable `[person, caseNumber]` pairs. Accepted set is `answer` +
`answerAlt`, and the feedback is the **correct-answer path** — the
harness drives the accusative-plural reading specifically and asserts
`ok` feedback with no waiting message. Both cells light up on a reveal,
because both of them are right.

**Chapter 7's εἰμί speller — this one needed a decision.** As shipped,
`answer` is `ἐστίν` and `answerAlt` is `ἐστί(ν)`. Punctuation is
already optional under D-18, so `ἐστί(ν)` folds onto `ἐστίν` and the
field does **nothing at all**: the two keys are identical and the
learner typing ἐστί is still rejected. My first pass shipped it that
way and the harness caught it. Since the parenthesis notation is the
chapter's own way of saying the nu is moveable, a parenthesised
alternate now expands into both readings, so ἐστί and ἐστίν are both
accepted. Logged as **D-33**.

This is not general movable-nu leniency — D-16 stays withdrawn. It is
this field, on these two items, and the harness proves the boundary:
the item beside them, whose `answerAlt` equals its `answer`, still
rejects `εἰμί` + ν.

---

## 3. Things that would have bitten me

- **Elision.** `ἐπ' ἀληθείας` round-trips: typed with the apostrophe it
  passes, typed without it, it fails. The U+0027 tile is asserted
  reachable on all three chapters' speller keyboards (they share one
  keyboard, so this is true by construction, but it is now proved
  rather than assumed). The other half of C9 is asserted too and is
  stronger than the spec asks: **no tile can produce any of the curled
  alternates**, so the wrong mark is not merely unequal on the way out,
  it is unreachable on the way in. That is also why the "type a
  breathing instead" case is not in the harness — it cannot be driven
  through the UI at all.
  A real gap this opened: `check:shapes`' keyboard-coverage check read
  `item.greek` and `item.ref`, and every chapter 6-8 speller item
  carries its Greek as `answer`, so **all nine spellers were invisible
  to it**. Fixed; that is now the check that proves the apostrophe has
  a key.
- **`Show Answer` is the only reveal control.** Nothing added a Major
  Hint; the existing assertion sweep now covers chapters 6-8's verse
  spellers and passes on all three.
- **Every correct answer auto-advances.** Asserted per drill on all 18
  scored select activities of the three chapters, plus the three word
  spellers, at max(2000ms, clip) with no waiting message; the wrong
  path is asserted per drill against its own `advanceClass`.
- **ἐπί without its breathing** prints verbatim on the Three Case panel
  and the ἐπί popup. I did not touch it. See
  `5f-detail/ch6-popup-epi.png` — the headword is `επί` and the
  examples are `ἐπὶ γῆς`, exactly as the field has it.
- **Vocabulary counts.** ch6 steps through **16** cards, ch7 **10**, ch8
  **13**, asserted through the flashcard's own stepper. See §4 for how
  16 and 13 are derived, because that was not obvious.
- **`ref: null`** on chapter 8's "they (fem nom 3 pl)" renders nothing.
  Asserted, together with an assertion that the item at index 0 *does*
  print its citation, so the first assertion cannot pass by the surface
  never printing one.
- **`h_ex2` is not wired.** The Examples page dispatches `h_ex1`,
  `h_exx2` and `h_ex3`; I added nothing.

---

## 4. The case-split vocabulary pool

`pool: "senses"` was a new pool name that nothing read. Expanding it
naively — one card per sense — gives 16 for chapter 6 (right) and
**15** for chapter 8 (wrong; the spec says 13). The two chapters split
their lemmas for two different reasons and the lexicon records both in
one field:

- a sense with a **`caseTag`** is a case split and is its own card
  (ch6's διά/κατά/μετά/περί twice and ἐπί three times; ch8's παρά three
  ways and ὑπό two);
- senses with **no `caseTag`** are the lemma's paired FORMS and share
  one card (ch8's ἐγώ/ἡμεῖς and σύ/ὑμεῖς, whose `lexicalForm` is
  already `"ἐγώ / ἡμεῖς"`).

So the rule is "one card per caseTag, plus one for the untagged
remainder", which gives 16 and 13 from the delivered lexicons with no
count hard-coded anywhere. A split card shows the bare Greek form with
the case tag in the gloss, never `lexicalForm` — chapter 8's παρά has
`"παρά (with gen.)"` as its lexical form, which would be wrong on two
of its three cards.

The vocabulary DRILLS were unaffected: both chapters author their
fifteen/sixteen drill entries as explicit items.

---

## 5. Automated harness

`npm run ui:behavior` — **575/575**, from 388 at the start of the
round. New scripts `npm run ui:smoke5f` (the 70-stop rail walk) and
`npm run ui:shots5f` (the sub-page screenshots the rail walk cannot
reach); `npm run ui:modals` registered as a script and extended with
the four popup surfaces plus chapter 6's keyboard and chapter 7's Hint.

Chapters 6, 7 and 8 were added to the harness's `CHAPTERS` map, so
every existing sweep — the spelling no-reveal rule, the B1b solved-verse
rule, `Show Answer`, the C9 elision census, the option-grid census —
covers them without being restated. That is the point of those being
sweeps.

What is new and specific:

- **the ledger, read off the surface, per scored activity** (27
  activities): Previous/Next present or absent per `ui.buttons`,
  Pronounce-Each defaulting per `ui.defaults`, and `audioTiming`
  speaking or staying silent on arrival.
- **correct and incorrect per drill**, all 18 scored select activities,
  against each drill's own `advanceClass`. The answer is read from the
  data rather than learned from a reveal, which these chapters make
  possible; where a prompt is genuinely shared by two items with
  different answers the item is skipped and the drill retried, so a
  data ambiguity can never be reported as a broken advance.
- the two-stage case drill (8 assertions, above);
- `answerAlt` in both shapes, including the negative case;
- per-item option rendering on all five `perItem` drills;
- the elision apostrophe round-trip and tile reachability;
- the prepositions chart on both surfaces;
- popup reachability, per activity, over every declared popup;
- the pronoun paradigm stack and its More/Back;
- underlining in both directions;
- the vocabulary card counts;
- Say Whole drawn exactly once per chart — added after the εἰμί chart
  printed it twice (the chart carries the action and the activity
  carries one too; both were drawing it).

Two harness changes were needed for reasons that are worth recording:

1. The word speller's "which item am I on" was measured by comparing
   the prompt text. Chapter 7's adjective speller prints **"good" on six
   consecutive items** and distinguishes them by their parse note, so
   that measure could not see an advance. `SpellActivity` now exposes
   `data-word-index` and the harness reads it.
2. The option-grid census's D-19 assertion is stated truthfully rather
   than weakened: chapters 6's and 8's four case-split vocabulary
   drills are asserted as **authored** grids that stay 2-up at both
   widths, with the reason, instead of being dropped from the census.
   See §8.4 and **D-32**.

---

## 6. Visual walkthrough

Walked all 70 activities at 380px and photographed every one:
`buildout/screenshots/5f-walk/` (70 images, rail order, named
`ch6-01-…` through `ch8-25-…`). Sub-pages the rail walk cannot reach —
every topic of chapter 6's eight-topic Learn Prepositions rail, the
popups, the paradigm stack, the two-stage drill mid-answer — are in
`buildout/screenshots/5f-detail/` (21 images). Modals at five device
heights in `buildout/screenshots/5f-modals/` (85 images).

Machine-checked on every one of the 70 stops: a card rendered, no
placeholder text reached the screen, no console error, and **no
horizontal overflow** (A3).

**I could not do the comparison the spec asks for.** `ch6railwalk.pdf`,
`ch7railwalk.pdf` and `ch8railwalk.pdf` are not in this repo — there
are no PDFs anywhere in it and `buildout/screenshots/` holds only
previous rounds' captures. So I have walked every page and judged it
against the spec, the extraction map and the data, but I have **not**
compared any page against a DOSBox screenshot. Everything in §8 below
was found by reading the data against the spec, not by looking at the
original. If the rail walks can be dropped into the repo I will do the
comparison pass properly.

Things I changed as a result of looking at the pages, all listed above
in their sections: the doubled chart title (§2.1), the sense links
rendering with default button chrome, the doubled Say Whole (§5), the
person stage's column (§2.9), and one more not yet mentioned — the
speller's answer-field caption was hard-coded to "Spell Greek Word"
while chapters 6-8 declare "Spell Greek Phrase" in `ui.fields`. It now
comes from the data; chapters 1-5 all declare "Spell Greek Word", so
nothing there moves.

---

## 7. Definition of done

| item | state |
| --- | --- |
| All 70 activities reachable, correct, rail-ordered | yes — 73/73 smoke checks, sequence asserted complete per chapter |
| All three chapters lazy and offline; audio from IDB, no store scan on load/mount | yes — `check:lazy-chunk` now proves all eight; no new store reader, no new IDB writer |
| `npm run check:shapes` passes | yes |
| Full Playwright harness passes, including the new cases | yes — 575/575 |
| Visual walkthrough complete for all three rails | walked and photographed; **not compared against the rail walks** — see §6 |
| Both documents produced, BUILD containing the diff | yes |

---

## 8. Where the delivered data did not match the spec

Ground rule 2 says to say so and stop rather than fix. I have not
edited a byte of `chapt-06.json`, `chapt-07.json`, `chapt-08.json` or
their lexicons; `git status` shows them untouched.

### 8.1 Chapter 8's Quick Review pronoun charts carry untransliterated Latin

Six rows across `c8_qr_first` and `c8_qr_second` print the enclitic
forms as **Latin letters**:

| activity | row | shipped |
| --- | --- | --- |
| `c8_qr_first` | G. | `mou of me\my ἡμῶν of us\our` |
| `c8_qr_first` | D. | `moi to me\for me ἡμῖν to us\for us` |
| `c8_qr_first` | A. | `me me ἡμᾶς us` |
| `c8_qr_second` | G. | `sou of you\your ὑμῶν your` |
| `c8_qr_second` | D. | `soi to you\for you ὑμῖν to you\for you` |
| `c8_qr_second` | A. | `se you ὑμᾶς us` |

The **Learn** pages for the same paradigms carry proper μου, μοι, με,
σοι — so this is a conversion miss confined to the two Quick Review
charts, not a source problem. This is exactly the accentless-Greek case
`5F-EXTRACTION-MAP.md` §1.2 says `underline.py` was written to solve.

Effect on screen: those six singular cells print their Latin verbatim
as ink and are not tappable, while the plural cells beside them are
correct Greek and do play. Visible in
`5f-walk/ch8-17-c8_qr_first.png`. Four of the six forms (μου, μοι, με)
have clips in the chapter's own `audioMap` and would light up the
moment the data carries Greek — no renderer change needed.

`check:shapes` now fails a `pronounParadigm` row that contains **no**
Greek at all. It does not fail these, because each of them has Greek in
its plural half; making it stricter would fail the build on delivered
data I have been told not to fix.

### 8.2 The chapter-8 Examples page loses an elision mark

`c8_learn_pronouns` → Examples, third verse (Jn 16:7) ships as
`"ἀλλ ἐ̓γὼ τὴν ἀλήθειαν"`. Two things: the elision on ἀλλ' is a
**space** rather than U+0027, and the ε of ἐγώ carries a *trailing*
combining smooth breathing (U+0395 U+0313 in that order) rather than
being ἐ. The spec's §3 lists `ἀλλ'` among the elisions chapters 7 and 8
carry, so I believe the apostrophe is missing rather than absent from
the original. Rendered as delivered in
`5f-detail/ch8-learn-pronouns-4-examples.png`. It is displayed text
only — nothing scores against it — so it costs correctness nowhere, but
it teaches the wrong spelling on a page about pronouns.

### 8.3 The teaching paradigms and every Hint chart are missing

Covered in §2.8. Concretely: `c7_learn_adjectives` (7 topics),
`c8_learn_pronouns` (6) and `c8_learn_third_person` (3) are entirely
`para` blocks — the paradigms the extraction map lists offsets for
(`0x015ce6`, `0x01a4aa`, `0x01375a`, `0x124088`, …) are printed as
running text lines rather than as `paradigm` / `pronounParadigm`
blocks. The Quick Review charts, which the pipeline **did** emit as
structured charts, are the only real charts in chapters 7 and 8's
teaching material.

Downstream, five of the six `hintRef`s dangle and eight drills that
declare a Hint show none:

| chapter | hintRef | resolves |
| --- | --- | --- |
| 6 | `prepositionsCaseChart` | no — no such id or title in the chapter |
| 7 | `adjectiveParadigm` | **yes**, via the new title-slug fallback |
| 7 | `adjectivePositions` | no |
| 7 | `eimiParadigm` | no |
| 8 | `firstPersonParadigm` | no — the topic exists but holds no chart |
| 8 | `thirdPersonParadigm` | no — same |

The extraction map lists offsets for all of them (`0x0d5372`,
`0x057410`, `0x0a6cdc`, `0x0ad2cc`, `0x07fad8`, `0x080a62`,
`0x0a79c8`), so the pipeline found them; they were not emitted.

I did not bridge these by hand. Every candidate bridge I could find
would have meant keying the renderer to an activity id, which rule B1
forbids and which `Paradigm.svelte`'s own header rules out. The one
generic bridge that exists — matching the ref slug against a chart's
title — is in, and recovers one of the six.

### 8.4 The vocabulary drills and D-19

Covered in §5 and **D-32**. Chapters 6 and 8 ship their vocabulary
drills as authored option grids because the pool is case-split, so
nothing in the data marks them as vocabulary pools and they render
two-up at both widths rather than going four-up on an iPad the way
chapters 1-5 and 7 do. A learner meeting "Vocabulary: Greek to English
Drill" in chapter 5 and again in chapter 6 sees two different layouts.
If the pipeline marks those four drills as vocabulary pools — a
`pool` or `promptFrom.lexicon` field — the existing responsive class
picks them up with no renderer change.

### 8.5 Two smaller things, noted but not acted on

- `c6_ex_speller`'s `ui.buttons` lists `Score` between `Previous` and
  `Next`, which is the authored order and is what renders. It looks odd
  beside the other spellers but it is the data's.
- `chapt_8` ships 179 clips in the manifest against the 181 the
  extraction map counts. Every id the chapter references resolves, so
  the two missing ones are among the unwired set (`i_rm623b` and the
  four in VERIFY-5F item 9). Not a defect, recorded so the counts are
  not later mistaken for a mismatch.

---

## 9. Where I was unsure

- **Chapter 7's popup anchors (D-31).** I am confident the popups
  should be reachable and reasonably confident the Greek words are the
  original's blue links, because that is what chapter 6 does with its
  glosses and what the pages have to offer. I am not confident that
  *every* occurrence should be a link rather than only the three in the
  numbered list — the first paragraph's οὐ becomes one too. A rail walk
  would settle it in seconds.
- **The pronoun row split.** Splitting at the last Greek run is exact
  on all twelve delivered rows, and I could not construct a
  counter-example from this data. It would break on a row whose plural
  gloss contained Greek. If chapter 9's pronouns are shipped the same
  way, this is the thing to re-check rather than assume.
- **The prepositions diagram's arrow geometry.** The spatial
  arrangement follows the slot names and the arrow kinds, and it reads
  correctly to me — into, out of, over, through — but "matches the
  original's spatial arrangement" is a claim I cannot make without the
  rail walk. περί's `curveIn` in particular is my reading of an
  encircling sweep.
- **`answerAlt` expansion (D-33).** I am confident the field must do
  something and that "the nu is optional" is what `ἐστί(ν)` means. I am
  less sure whether the original also accepts ἐστί, or only prints it
  that way. If it does not, deleting the expansion is a three-line
  revert and the harness assertion inverts.

---

## 10. Files

**New:** `src/components/PrepositionsChart.svelte`,
`src/components/PopupSheet.svelte`,
`src/components/PronounParadigm.svelte`, `src/lib/popups.js`,
`scripts/ui-smoke-5f.mjs`, `scripts/ui-shots-5f.mjs`.

**Changed:** `src/lib/content.js`, `src/components/RichContent.svelte`,
`src/components/ContentAudio.svelte`,
`src/components/SelectActivity.svelte`,
`src/components/SpellActivity.svelte`, `src/components/Marked.svelte`,
`src/app.css`, `scripts/check-content-shapes.mjs`,
`scripts/check-lazy-chunk.mjs`, `scripts/ui-behavior.mjs`,
`scripts/ui-modals.mjs`, `package.json`,
`buildout/DIVERGENCE-LOG.md`, `buildout/CHAT-HANDOFF.md`,
`buildout/PHASE5-PLAN.md`.

**Untouched, as required:** `src/data/chapt-0{6,7,8}.json` and
`src/data/lexicon-chapt0{6,7,8}.json`.

The full diff is in `5F-SPEC1-BUILD.md`.
