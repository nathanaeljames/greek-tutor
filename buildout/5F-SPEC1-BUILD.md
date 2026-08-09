# 5F-SPEC1-BUILD.md — the round's diff

Cohort 5F, one round, one implementer. Chapters 6, 7 and 8.
Prose lives in `5F-SPEC1-RESULTS.md`; this document is the evidence
the assessment pipeline audits.

Nothing was pushed. The round is committed locally on `main`, in two
commits: the build, and then the page-by-page rail-walk comparison the
three walk PDFs made possible once they were supplied.

**No data file was edited.** `src/data/chapt-06.json`,
`chapt-07.json`, `chapt-08.json` and their three lexicons do not
appear in the diff below, which is the check ground rule 2 asks for.

## Scope of this diff

`git diff` for the WHOLE round — every text file it touched, against
the commit the round started from (`b3775a9`). Binary additions — the
PNG screenshots under `buildout/screenshots/5f-walk` (70 rail stops at
380px), `5f-detail` (24 sub-pages) and `5f-modals` (85 modal states
over five device heights), plus the `walk-*` and `modals-*` corpora the
existing harnesses wrote — are committed but not inlined here; they are
listed at the end.

## Summary

 buildout/5F-SPEC1-RESULTS.md            | 850 ++++++++++++++++++++++++++++++++
 buildout/CHAT-HANDOFF.md                |  93 +++-
 buildout/DIVERGENCE-LOG.md              |  53 ++
 buildout/PHASE5-PLAN.md                 |  54 +-
 package.json                            |   5 +-
 scripts/check-content-shapes.mjs        |  82 ++-
 scripts/check-lazy-chunk.mjs            |   5 +-
 scripts/ui-behavior.mjs                 | 811 +++++++++++++++++++++++++++++-
 scripts/ui-modals.mjs                   |  36 ++
 scripts/ui-shots-5f.mjs                 | 113 +++++
 scripts/ui-smoke-5f.mjs                 | 108 ++++
 src/app.css                             | 104 ++++
 src/components/ContentAudio.svelte      |  80 ++-
 src/components/Marked.svelte            |  13 +-
 src/components/Paradigm.svelte          |  50 +-
 src/components/PopupSheet.svelte        |  68 +++
 src/components/PrepositionsChart.svelte | 127 +++++
 src/components/PronounParadigm.svelte   |  89 ++++
 src/components/RichContent.svelte       | 131 ++++-
 src/components/SelectActivity.svelte    | 122 ++++-
 src/components/SpellActivity.svelte     | 110 ++++-
 src/lib/content.js                      | 221 ++++++++-
 src/lib/popups.js                       |  61 +++
 23 files changed, 3302 insertions(+), 84 deletions(-)

## Checks at the end of the round

```
npm run check:shapes     PASS   (8 chapters)
npm run build            PASS
npm run check:lazy-chunk PASS   (8 chapter chunks + 8 lexicon chunks)
npm run ui:smoke5f       73/73  over 70 rail stops at 380px
npm run ui:behavior      586/586 behavior checks
npm run ui:walk          PASS   (no console errors, no overflow)
npm run ui:modals        85/85  modal states clean
```

## The diff

```diff
diff --git a/buildout/5F-SPEC1-RESULTS.md b/buildout/5F-SPEC1-RESULTS.md
new file mode 100644
index 0000000..0e68267
--- /dev/null
+++ b/buildout/5F-SPEC1-RESULTS.md
@@ -0,0 +1,850 @@
+# 5F-SPEC1-RESULTS.md — chapters 6, 7 and 8
+
+Implementer round, cohort 5F. One round, one implementer. Written
+against `5F-SPEC1.md` section by section. Nothing is pushed; the
+working tree is committed locally.
+
+---
+
+## 0. Summary
+
+All 70 activities across chapters 6, 7 and 8 are reachable, correct
+and rail-ordered. `npm run verify` passes (shapes, build, lazy-chunk
+split for all eight chapters). The Playwright behaviour harness passes
+586/586, up from 388 at the start of the round; 195 of those
+assertions are new 5F ones and a further 24 are old sweeps that now
+cover the three new chapters. A 70-stop smoke walk at 380px passes
+73/73 with no placeholder, no console error and no horizontal
+overflow. The modal pass is 85/85 clean across five device heights,
+including the four new popup surfaces.
+
+**The page-by-page comparison against the three rail walks is done**
+(§6). It changed eight things, four of which I would not have found
+any other way — the case tag was on the wrong side of the vocabulary
+card, the adjective paradigm was printing `undefined` for its lemma,
+its three-column cells were breaking mid-word at 380px, and its
+Singular / Plural bands were missing entirely. Two more were my own
+inventions that the original does not do: a greyed-out case grid and a
+popup-link rule that claimed too many words. All eight are listed in
+§6.1 with the sheet each came from.
+
+Six of the delivered data files' contracts were not what the spec
+describes, and four of those are, in my reading, defects on the
+pipeline side. Per ground rule 2 I have not touched a byte of the data
+and have not "fixed" any of them. They are listed in §8 with what the
+port does instead, and the rail walks now **confirm** every one of
+them rather than leaving them as my reading. **§8.1 and §8.2 are the
+two I would want looked at before this cohort is called done.**
+
+Three new divergences are logged: **D-31** (how chapter 7's popups are
+opened), **D-32** (the case-split vocabulary grids and D-19) and
+**D-33** (what a parenthesised `answerAlt` means).
+
+---
+
+## 1. What was built
+
+The three data files and their lexicons were already in the tree and
+committed; I changed none of them. They are picked up by the existing
+`import.meta.glob` registry in `src/lib/content.js` with no per-chapter
+wiring, exactly as chapters 4 and 5 are — the glob derives the id from
+the filename, so the three chapters and their three lexicons were
+already lazily chunked the moment the files landed.
+
+`scripts/check-lazy-chunk.mjs` only proved that for chapters 1-5, so it
+now asserts all eight: eight chapter chunks, eight lexicon chunks, all
+precached, and no chapter data in the index bundle.
+
+Counts on screen match the spec's table exactly, asserted per chapter
+by the smoke walk (`sequence` lists every activity exactly once and
+every id resolves): ch6 6/5/3/6 over a 20-stop rail, ch7 7/7/4/7 over
+25, ch8 7/6/3/9 over 25.
+
+Audio: every `chapt_6_*` / `chapt_7_*` / `chapt_8_*` id referenced by
+the three chapters and their lexicons resolves in
+`public/audio/audio-manifest.json` — 141, 143 and 169 distinct ids,
+zero missing. I did not attempt to de-duplicate the forward-shipped
+`c_sm*` / `d_sm*` / `e_sm*` / `f_sm*` copies; the data references the
+local keys and they resolve.
+
+---
+
+## 2. New renderer work
+
+### 2.1 `prepositionsChart` — done, as a diagram
+
+New component `src/components/PrepositionsChart.svelte`. Inline SVG on
+a 320x320 user-space grid scaled to the phone viewport, ἐν in a circle
+at the centre and the nine others on the named slots, with the arrow
+each node's `arrow` field declares: `in` and `out` point at and away
+from the circle, `over` arcs above it, `across` runs through it, `down`
+drives into it from below, and `curveIn` is περί's encircling sweep.
+Nothing is keyed to an activity id or to a Greek word — the slot names
+and the arrow names are the data's.
+
+It is deliberately **not** a pixel copy of the original line art, per
+the spec. Screenshot:
+`buildout/screenshots/5f-detail/ch6-learn-prepositions-5-prepositionsChart.png`.
+
+Every Greek label is a tap target that plays its own clip (directive
+9); the gloss under it is ink. The centre word behaves the same way.
+Both surfaces — the Learn topic and `c6_qr_prepositions` — render from
+the one component, so they cannot disagree; the harness asserts ten
+nodes, ἐν at the centre, the right number of arrows, a clip on tap and
+no horizontal overflow at 380px, **on both**.
+
+One thing I changed after looking at it: the Learn topic prints
+"Prepositions Chart" as its topic heading and the block also carries
+that title, so it printed twice. The block now takes the same
+`suppressTitle` dedup `Paradigm` already uses.
+
+A slot the layout does not know still renders, in a spare row below the
+diagram, rather than vanishing. Nothing in the delivered data uses it.
+
+### 2.2 `popupRef` and full-page popups — done, with one gap
+
+New: `src/lib/popups.js` (the register, carried by Svelte **context**
+rather than a module store, so two activities can never see each
+other's popups) and `src/components/PopupSheet.svelte` (the sheet). The
+sheet is rendered by `ContentAudio` over the whole activity, with a
+Cancel control, and closing it stops whatever it started (rule A4).
+Every Greek phrase on it — the headword and every worked example — is a
+tap target with its own clip.
+
+Three ways a link is declared, all of them data:
+
+| route | chapter | how |
+| --- | --- | --- |
+| `popupRef` on a `greekRows` row | 6 | the **gloss** is the link, the case tag is ink |
+| an `[[u]]` run whose slug is a popup id | 8 | "As a pronoun" opens `asAPronoun` |
+| the popup's own `greek` headword, on a numbered line | 7 | see below and **D-31** |
+
+The chapter-8 route falls out of the data cleanly: the three popup ids
+are exactly the camelCase slugs of the three underlined labels on the
+Three Uses page, using the same slug convention `resolveHintBlocks`
+already uses for headings. An underlined run that matches no popup
+stays a plain underline, which is what keeps `he [[u]]himself[[/u]]
+will get the car` on that same page from becoming a dead link — visible
+in `5f-detail/ch8-learn-third-person-3-threeUses.png`.
+
+**The gap: chapter 7 ships three popups and no anchors at all.**
+`c7_learn_eimi` carries `popups[]` for οὐ, οὐκ and οὐχ, but its
+"οὐ, οὐκ and οὐχ" page is eleven flat `para` blocks with no `popupRef`
+anywhere in the chapter (`grep popupRef chapt-07.json` → 0) and no
+`[[u]]` run on that page. Leaving it alone would have left three
+authored pages unreachable, which the spec counts as rail stops, so the
+renderer opens a popup from its own `greek` headword where that
+headword stands on a NUMBERED line — longest headword first, so οὐχ is
+never claimed by οὐ. Logged as **D-31**. If the pipeline later ships
+anchors, an explicit `popupRef` or underline already wins and the rule
+costs nothing.
+
+The numbered-line restriction came out of the rail walk (§6.1 item 7):
+ch7railwalk p7 makes `1) οὐ before a consonant;` the hot line and
+leaves the οὐ in the opening sentence as ordinary ink. My first pass
+claimed every occurrence, which also turned chapter 6's
+"ἐν, εἰς and ἐκ are proclitics" into three links the original does not
+have (ch6railwalk p6). Off the hot lines those words are ordinary
+audio taps, so directive 9 is untouched.
+
+The harness walks every topic of all three teaching activities and
+asserts **every declared popup is reachable** — 11 for chapter 6, 3 for
+chapter 7, 3 for chapter 8 — plus Cancel closing the sheet, the audio
+stopping with it, and the headword and examples playing.
+
+The four popup shapes are in the modal pass at all five device heights
+(`buildout/screenshots/5f-modals/`), including the cruel 320x360, where
+they still show both borders and Cancel at rest.
+
+### 2.3 `greekRows` extensions — done
+
+- **`senses[]`** — a new `prepositionSenses` row: headword (tappable),
+  then one line per sense, gloss as the link and `caseTag` as plain
+  ink. ἐπί's three senses stack under the one headword.
+- **`parts[]` + `partAudio[]`** — chapters 4 and 5 ship `parts` as
+  objects; chapter 6 ships plain strings with a parallel `partAudio`
+  whose nulls are the inert connectors. Both shapes normalize in one
+  helper, so `διά` `+` `βλέπω` renders with the two Greek parts
+  separately tappable and the `+` inert.
+- **`bracket: true`** — the row is parenthesised, as the Elision page
+  sets its derivations: `( διά + ἐμοῦ )`.
+- **`ref`** on a row — a citation line under the row (it takes the full
+  row width rather than a grid column, so the two-column gloss layouts
+  keep their rhythm).
+- **`greek2` on a `verseExamples` row** — chapter 8's Examples page:
+  up to two lines of Greek as ONE tap target with one clip, gloss and
+  citation beneath. All three verses are tappable, including `h_exx2`
+  (Jn 1:42), which VERIFY-5F item 9 asked for.
+
+### 2.4 Underlining is DATA — confirmed, and asserted
+
+I derived no underline from a screenshot and handed none back. The
+`[[u]]` and `[[i]]` machinery in `src/lib/markup.js` and
+`Marked.svelte` already existed from chapter 2 and the delivered data
+carries the runs (4 in ch6, 22 in ch7, 24 in ch8), so this needed no
+renderer work beyond the popup link in §2.2.
+
+What it did need was proof, so the harness now walks every teaching
+activity and topic of the three chapters and asserts **both**
+directions: every authored `[[u]]` run renders (as an underline, or as
+the popup link it names), and the renderer invents no underline the
+data does not carry.
+
+### 2.5 `note` on prompts — done
+
+Carried through the question builder and drawn **on the prompt's own
+line**, to its right, in plain ink at a smaller size, on both surfaces:
+`πρός (to)`, `ἐπί (with dat.)`, `from God (not ἐκ)`,
+`good (acc. pl. masc.)`, `I (nom sg)`. My first pass put it on its own
+line below the prompt; every rail-walk sheet that carries a note sets
+it inline, so it is inline now (§6.1 item 2).
+
+It is never a tap target. Structurally it is a SIBLING of the prompt's
+button rather than a child, so the Greek inside it cannot acquire the
+prompt's clip either — asserted on chapter 6's `(not ἐκ)` items, which
+contain Greek and are the logged exception to directive 9, plus a
+geometric assertion that it really is on the same line and to the
+right.
+
+### 2.6 `options: "perItem"` — done
+
+This one was load-bearing. `buildSelectQuestions` decided an activity
+had authored options from `optionsPerItem` or an activity-level
+`optionValues`; `options: "perItem"` matched neither, so all five
+per-item drills (c6 40 items, c7 15 and 14, c8 20 and 21) were falling
+through to the **lexicon vocabulary branch** and would have built a
+ten-option Greek grid out of the chapter's lemma list — plausible,
+silent and completely wrong. There is now one shared
+`authoredOptionSource()` predicate that both the builder and the
+surface ask, and `stack1col` maps to the existing one-column layout.
+
+The harness asserts, per drill, that the grid on screen holds **that
+item's** three authored options and nothing else, and that they stack
+one to a row.
+
+### 2.7 `greek2` — done
+
+A two-line prompt is a line break in one prompt, not a second prompt:
+one tap target, one clip, `greek2` null on the one-line items. The
+harness steps until it meets a two-line item and asserts exactly that.
+
+### 2.8 `paradigmChart` and `pronounParadigm` — mostly done; two gaps
+
+**Chapter 7's adjective paradigm** (`c7_qr_adjectives`) — three gender
+columns by nine rows, every cell its own clip, plus `sayWhole`. This
+needed three fixes the rail-walk comparison found and nothing else
+would have (§6.1 items 4-6): its lemma ships as a bare STRING with the
+gloss beside it, so the existing renderer printed "undefined" under the
+chart title; its three-column cells broke mid-word at 380px; and its
+`"number"` field, which legends the Singular and Plural blocks in the
+original, was authored on every row and rendered nowhere.
+
+**Chapter 7's εἰμί chart** (`c7_qr_eimi`) — two columns by three rows
+with a gloss under each cell. This needed one **build-check** change,
+not a renderer change: its rows carry no `label`, because the original
+prints no case column there, and `check:shapes` required a label on
+every paradigm row. The rule now fires only when a chart's *other* rows
+have labels, so "some rows are labelled and some are not" still fails
+while "no row is labelled" is allowed.
+
+**Chapter 8's pronoun paradigms** — new component
+`src/components/PronounParadigm.svelte`, because these rows are not
+`{greek, gloss}` cells: the pipeline ships each row as one line of set
+text (`"ἐγώ I ἡμεῖς we"`). The renderer splits at the start of the last
+Greek run — the plural form — because no gloss on any of these twelve
+rows contains Greek, then takes the leading Greek run of each half as
+the form and the rest as its gloss. Cells are tappable via the
+chapter's own `audioMap` (see below). `c8_qr_third` carries
+`paradigms[]`, so `paradigmChart` now supports a More/Back stack:
+Masculine → More → Feminine → More → Neuter, Back stepping down,
+asserted end to end.
+
+**Gap 1 — chapter 7's adjective topics have no charts.** The spec says
+those topics use the `More` pattern for Singular/Plural. They cannot:
+all seven topics of `c7_learn_adjectives` are flat `para` blocks with
+no `paradigm` block anywhere, and the chapter's own
+`_paradigm_note` says the charts "are emitted as quickReview paradigms
+and referenced from here" — but there is no reference field in the
+topic, and only ἀγαθός reaches Quick Review, not δίκαιος. Chapter 8's
+paradigm topics are flat `para` blocks for the same reason. I did not
+invent charts. See §8.3.
+
+**Gap 2 — five of six `hintRef`s dangle.** All nine Hint-carrying
+drills in the three chapters name a chart:
+`prepositionsCaseChart`, `adjectiveParadigm`, `adjectivePositions`,
+`eimiParadigm`, `firstPersonParadigm`, `thirdPersonParadigm`. Only
+`adjectiveParadigm` resolves, and only because I added a generic
+title-slug fallback to `resolveHintRef` (the same slug convention it
+already uses for headings) which finds `c7_qr_adjectives`' chart. The
+other five name either nothing at all or a topic with no chart in it,
+because of Gap 1. The renderer degrades the way it always has — no Hint
+button rather than an empty popup — so eight drills that declare a Hint
+in `ui.buttons` show none. See §8.3.
+
+**`audioMap`.** Chapters 8's two teaching activities carry an
+`audioMap` of inflected form → clip for the 36 pronoun forms, which are
+not lexicon lemmas. Nothing read it. `getGreekTapMap` now folds every
+activity-level `audioMap` in a chapter into the chapter-wide tap map,
+so the Learn pages and the Quick Review charts tap the same clips from
+one source rather than each owning a copy. This is what makes the
+pronoun chart cells and the Enclitics page live.
+
+### 2.9 `twoStageGrid` — done, per VERIFY-5F item 7
+
+`mode: "twoStageGrid"` builds through a new
+`buildTwoStageQuestions()` and renders one grid per `optionStages`
+entry inside the existing `SelectActivity`. The behaviour is exactly
+what Nathanael confirmed:
+
+- **nothing is judged until both stages are chosen.** A person click
+  only records. The learner may click a person, change their mind and
+  click a different one as often as they like: no attempt is counted,
+  no feedback appears, the score does not move.
+- **the case click commits.** The pair is then scored under
+  `manualOnIncorrect`, one attempt, from the ledger — reveal, wait,
+  say so — and both grids lock.
+- **both grids are live from the start.** An earlier pass greyed the
+  case grid out until a person was chosen, to make the instruction
+  line's order visible. ch8railwalk p8 draws it identically before and
+  after the person click, so that invention is gone: what holds the
+  pair together is the commit rule, not a disabled control. The pair
+  therefore commits in EITHER order — filling the case first and the
+  person second commits on the person click — which is the literal
+  reading of "nothing is judged until BOTH are chosen", and is
+  asserted as such.
+
+The person stage renders as a single column. The data declares
+`paradigm2col` for stage 2 and no layout for stage 1; left to the
+density heuristic "Second Person" came out two-up and the person stage
+read as part of the 2x4 case grid under it, so a stage with no declared
+layout is drawn as a plain column — which is the word both the spec and
+the original use for it.
+
+Nine harness assertions cover it: the instruction line, both stages
+present in order, both grids live from the start, three person clicks
+judged nothing, only the last person selected, the pair committing in
+either order, both-right auto-advancing (B1a), a wrong second stage
+revealing and waiting, both grids locking, and a wrong FIRST stage
+being judged only once the pair is complete.
+
+### 2.10 `answerAlt` — done, both shapes
+
+**Chapter 8's αὐτά.** The item carries `answerAlt` as a list of extra
+acceptable `[person, caseNumber]` pairs. Accepted set is `answer` +
+`answerAlt`, and the feedback is the **correct-answer path** — the
+harness drives the accusative-plural reading specifically and asserts
+`ok` feedback with no waiting message. Both cells light up on a reveal,
+because both of them are right.
+
+**Chapter 7's εἰμί speller — this one needed a decision.** As shipped,
+`answer` is `ἐστίν` and `answerAlt` is `ἐστί(ν)`. Punctuation is
+already optional under D-18, so `ἐστί(ν)` folds onto `ἐστίν` and the
+field does **nothing at all**: the two keys are identical and the
+learner typing ἐστί is still rejected. My first pass shipped it that
+way and the harness caught it. Since the parenthesis notation is the
+chapter's own way of saying the nu is moveable, a parenthesised
+alternate now expands into both readings, so ἐστί and ἐστίν are both
+accepted. Logged as **D-33**.
+
+This is not general movable-nu leniency — D-16 stays withdrawn. It is
+this field, on these two items, and the harness proves the boundary:
+the item beside them, whose `answerAlt` equals its `answer`, still
+rejects `εἰμί` + ν.
+
+---
+
+## 3. Things that would have bitten me
+
+- **Elision.** `ἐπ' ἀληθείας` round-trips: typed with the apostrophe it
+  passes, typed without it, it fails. The U+0027 tile is asserted
+  reachable on all three chapters' speller keyboards (they share one
+  keyboard, so this is true by construction, but it is now proved
+  rather than assumed). The other half of C9 is asserted too and is
+  stronger than the spec asks: **no tile can produce any of the curled
+  alternates**, so the wrong mark is not merely unequal on the way out,
+  it is unreachable on the way in. That is also why the "type a
+  breathing instead" case is not in the harness — it cannot be driven
+  through the UI at all.
+  A real gap this opened: `check:shapes`' keyboard-coverage check read
+  `item.greek` and `item.ref`, and every chapter 6-8 speller item
+  carries its Greek as `answer`, so **all nine spellers were invisible
+  to it**. Fixed; that is now the check that proves the apostrophe has
+  a key.
+- **`Show Answer` is the only reveal control.** Nothing added a Major
+  Hint; the existing assertion sweep now covers chapters 6-8's verse
+  spellers and passes on all three.
+- **Every correct answer auto-advances.** Asserted per drill on all 18
+  scored select activities of the three chapters, plus the three word
+  spellers, at max(2000ms, clip) with no waiting message; the wrong
+  path is asserted per drill against its own `advanceClass`.
+- **ἐπί without its breathing** prints verbatim on the Three Case panel
+  and the ἐπί popup. I did not touch it. See
+  `5f-detail/ch6-popup-epi.png` — the headword is `επί` and the
+  examples are `ἐπὶ γῆς`, exactly as the field has it.
+- **Vocabulary counts.** ch6 steps through **16** cards, ch7 **10**, ch8
+  **13**, asserted through the flashcard's own stepper. See §4 for how
+  16 and 13 are derived, because that was not obvious.
+- **`ref: null`** on chapter 8's "they (fem nom 3 pl)" renders nothing.
+  Asserted, together with an assertion that the item at index 0 *does*
+  print its citation, so the first assertion cannot pass by the surface
+  never printing one.
+- **`h_ex2` is not wired.** The Examples page dispatches `h_ex1`,
+  `h_exx2` and `h_ex3`; I added nothing.
+
+---
+
+## 4. The case-split vocabulary pool
+
+`pool: "senses"` was a new pool name that nothing read. Expanding it
+naively — one card per sense — gives 16 for chapter 6 (right) and
+**15** for chapter 8 (wrong; the spec says 13). The two chapters split
+their lemmas for two different reasons and the lexicon records both in
+one field:
+
+- a sense with a **`caseTag`** is a case split and is its own card
+  (ch6's διά/κατά/μετά/περί twice and ἐπί three times; ch8's παρά three
+  ways and ὑπό two);
+- senses with **no `caseTag`** are the lemma's paired FORMS and share
+  one card (ch8's ἐγώ/ἡμεῖς and σύ/ὑμεῖς, whose `lexicalForm` is
+  already `"ἐγώ / ἡμεῖς"`).
+
+So the rule is "one card per caseTag, plus one for the untagged
+remainder", which gives 16 and 13 from the delivered lexicons with no
+count hard-coded anywhere.
+
+A split card shows the Greek form **with its case tag** and the bare
+gloss beside it — `ἀπό (with gen.)` over `from`, which is what
+ch6railwalk p10 prints (§6.1 item 1). It is never `lexicalForm`:
+chapter 8's παρά has `"παρά (with gen.)"` as its lexical form, which
+would be wrong on two of its three cards.
+
+The vocabulary DRILLS were unaffected: both chapters author their
+fifteen/sixteen drill entries as explicit items.
+
+---
+
+## 5. Automated harness
+
+`npm run ui:behavior` — **586/586**, from 388 at the start of the
+round. New scripts `npm run ui:smoke5f` (the 70-stop rail walk) and
+`npm run ui:shots5f` (the sub-page screenshots the rail walk cannot
+reach); `npm run ui:modals` registered as a script and extended with
+the four popup surfaces plus chapter 6's keyboard and chapter 7's Hint.
+
+Chapters 6, 7 and 8 were added to the harness's `CHAPTERS` map, so
+every existing sweep — the spelling no-reveal rule, the B1b solved-verse
+rule, `Show Answer`, the C9 elision census, the option-grid census —
+covers them without being restated. That is the point of those being
+sweeps.
+
+What is new and specific:
+
+- **the ledger, read off the surface, per scored activity** (27
+  activities): Previous/Next present or absent per `ui.buttons`,
+  Pronounce-Each defaulting per `ui.defaults`, and `audioTiming`
+  speaking or staying silent on arrival.
+- **correct and incorrect per drill**, all 18 scored select activities,
+  against each drill's own `advanceClass`. The answer is read from the
+  data rather than learned from a reveal, which these chapters make
+  possible; where a prompt is genuinely shared by two items with
+  different answers the item is skipped and the drill retried, so a
+  data ambiguity can never be reported as a broken advance.
+- the two-stage case drill (8 assertions, above);
+- `answerAlt` in both shapes, including the negative case;
+- per-item option rendering on all five `perItem` drills;
+- the elision apostrophe round-trip and tile reachability;
+- the prepositions chart on both surfaces;
+- popup reachability, per activity, over every declared popup;
+- the pronoun paradigm stack and its More/Back;
+- underlining in both directions;
+- the vocabulary card counts;
+- Say Whole drawn exactly once per chart — added after the εἰμί chart
+  printed it twice (the chart carries the action and the activity
+  carries one too; both were drawing it).
+
+Two harness changes were needed for reasons that are worth recording:
+
+1. The word speller's "which item am I on" was measured by comparing
+   the prompt text. Chapter 7's adjective speller prints **"good" on six
+   consecutive items** and distinguishes them by their parse note, so
+   that measure could not see an advance. `SpellActivity` now exposes
+   `data-word-index` and the harness reads it.
+2. The option-grid census's D-19 assertion is stated truthfully rather
+   than weakened: chapters 6's and 8's four case-split vocabulary
+   drills are asserted as **authored** grids that stay 2-up at both
+   widths, with the reason, instead of being dropped from the census.
+   See §8.4 and **D-32**.
+
+The rail-walk pass added eleven more, all of them about what is on the
+screen rather than what it does: the note's geometry on both surfaces
+and on three drills, the case tag riding with the Greek, the Singular
+and Plural bands present on chapter 7's chart and absent from every
+chart that authors no `number`, both stage grids live from the start,
+and the pair committing in either order.
+
+---
+
+## 6. Visual walkthrough — page by page against the rail walks
+
+Walked all 70 activities at 380px and photographed every one:
+`buildout/screenshots/5f-walk/` (70 images, rail order, named
+`ch6-01-…` through `ch8-25-…`). Sub-pages the rail walk cannot reach —
+every topic of chapter 6's eight-topic Learn Prepositions rail, the
+popups, the paradigm stack, the two-stage drill mid-answer, the
+vocabulary cards — are in `buildout/screenshots/5f-detail/` (24
+images). Modals at five device heights in
+`buildout/screenshots/5f-modals/` (85 states).
+
+Machine-checked on every one of the 70 stops: a card rendered, no
+placeholder text reached the screen, no console error, and **no
+horizontal overflow** (A3).
+
+Then compared page by page against `ch6railwalk.pdf` (16 sheets),
+`ch7railwalk.pdf` (16) and `ch8railwalk.pdf` (15). Everything not
+listed below matched: titles, instruction lines, prompts, option text
+and order, button sets, checkbox sets, feedback strings, menu contents
+and counts, and which elements carry the hand cursor.
+
+### 6.1 What the comparison changed (eight fixes)
+
+**1. The case tag belongs with the GREEK, not the gloss.**
+ch6railwalk p10 sets the Learn Vocabulary card as
+`Greek Word: ἀπό (with gen.)` over `Word Meaning: from`, and the
+Greek-to-English drill prompts `ἐπί (with dat.)`; ch8railwalk p10
+prompts `παρά (with dat.)`. The port had been putting the tag in the
+gloss (`ἀπό` over `from (with gen.)`). Chapter 8's own lexicalForm for
+παρά — `"παρά (with gen.)"` — is the same convention written out, which
+is the corroboration. Fixed in `sensePool()`; the bare headword is
+still available as `greek` for any surface that wants it.
+
+**2. `note` prints on the prompt's line, not below it.** Every
+screenshot that carries one sets it inline and smaller: `πρός (to)`
+(ch6 p8), `from God (not ἐκ)` (ch6 p10), `from (gen.)` (ch6 p12),
+`good (acc. pl. masc.)` (ch7 p6), `I (nom sg)` (ch8 p9). The port had
+it on its own line under the prompt. Fixed on both surfaces. The note
+is a SIBLING of the prompt's button, never inside it, so it still
+cannot speak — §2.5's rule is intact and now has a geometric assertion
+behind it (same line, to the right) as well as a structural one.
+
+**3. The two-stage case grid is live from the start.** ch8railwalk p8
+draws the case grid identically before and after the person click —
+same yellow on black, not greyed. I had disabled it until a person was
+chosen, to make the instruction line's order visible; that was my
+invention, so it is gone. What holds the pair together is the commit
+rule, not a disabled control, and the harness now asserts the pair
+commits in EITHER order and is still one attempt.
+
+**4. The adjective paradigm printed `undefined` for its lemma.**
+`c7_qr_adjectives` ships `"lemma": "ἀγαθός"` as a bare STRING with
+`"gloss": "good"` beside it, where chapters 4 and 5 ship an object;
+`Paradigm.svelte` read `lemma.greek` off a string and rendered
+"undefined" in link blue under the chart title. Caught only by holding
+the page next to ch7railwalk p14. Both shapes now normalize, and
+chapter 7's is set as the equation the original prints —
+`ἀγαθός = good`. Chapters 4 and 5 keep the object form and their
+device-verified lemma line is untouched. A lemma with no clip of its
+own now renders in ink rather than link blue (directive 8).
+
+**5. Three-column paradigm cells wrapped mid-word at 380px.**
+`ἀγαθῶν`, `ἀγαθοῖς` and `ἀγαθούς` each broke across two lines, three
+abreast. The shrink rule only fired above seven letters, which suits
+two columns and not three. The threshold is now column-aware — five
+letters from three columns up — and chapter 5's three-column article
+chart, whose forms are three and four letters, does not move.
+
+**6. The Singular / Plural bands were missing.** ch7railwalk p14
+legends the combined chart "Singular" beside its N. row and "Plural"
+beside its N.V. row. The data authors `"number": "s"` / `"p"` on every
+row and nothing rendered it. Now drawn wherever the number changes.
+Only chapter 7 authors `number`, and the harness asserts no earlier
+chart grows a band.
+
+**7. The popup headword rule was over-claiming.** D-31's rule made
+EVERY standalone occurrence of a popup's Greek headword a link. The
+walk shows the original hangs the link on the numbered line only:
+ch7railwalk p7 makes `1) οὐ before a consonant;` hot and leaves the οὐ
+in the opening sentence as ink, and ch6railwalk p6's Proclitics page
+does not link `ἐν, εἰς and ἐκ are proclitics` at all — which the old
+rule had turned into three links. Restricted to numbered lines. Those
+words are still ordinary audio taps off the hot lines, so directive 9
+is unaffected. D-31 is amended accordingly.
+
+**8. The speller's answer-field caption was hard-coded** to "Spell
+Greek Word" while chapters 6-8 declare "Spell Greek Phrase" in
+`ui.fields` (ch6 p10, ch7 p6, ch8 p9). It now comes from the data;
+chapters 1-5 all declare "Spell Greek Word", so nothing there moves.
+
+### 6.2 Confirmed correct against the walk
+
+- **The Prepositions Chart** (ch6 p6, p14). The slot arrangement and
+  every arrow direction match: περί sweeping in from the top left, ἐπί
+  arcing over, μετά in from the top right, πρός and εἰς in from the
+  left, ἀπό and ἐκ out to the right, διά running across through the
+  circle, κατά down into it, ἐν circled at the centre. Both surfaces
+  render from the one component.
+- **The Elision page** (ch6 p6), line for line, including
+  `δι' ἐμοῦ = through me (Jn 14:6)` over the bracketed `(διά + ἐμοῦ)`,
+  and `μεθ' ἡμέρας after days (Mat 17:1)` over `(μετά + ἡμέρας)`.
+- **The Compounds page** (ch6 p7): the hand cursor sits on διά, βλέπω
+  and διαβλέπω across the four captures — three tap targets, which is
+  exactly what the data wires (`f_voc2`, `f_comp1`, `f_comp2`) and
+  corroborates that `f_comp3` has no surface.
+- **ἐπί prints without its breathing** on the Three Case panel and the
+  ἐπί popup (ch6 p5) while its examples carry `ἐπὶ` — VERIFY-5F item 1,
+  shipped verbatim.
+- **The three uses of αὐτός** (ch8 p6): "As a pronoun" and "Reflexive
+  Intensifier" are blue underlined links; "himself" on the same page is
+  underlined and BLACK. That is precisely the port's rule — an
+  underlined run that matches no popup id stays a plain underline — and
+  it now has the original behind it rather than my reading of it.
+- **The Personal Pronoun Case Drill's shape** (ch8 p8-p9): a person
+  column of three stacked, a case grid two across by four down, and the
+  instruction line "Click on the person then the case".
+- **Every popup**, all seventeen: three worked examples for each of
+  chapter 6's eleven prepositions, two each for οὐ / οὐκ / οὐχ, and
+  three, two and two for the uses of αὐτός, each with Cancel.
+- **Menu contents and counts**: ch6 Drill 5 / Exercise 3 / Quick Review
+  6; ch7 7 / 4 / 7; ch8 6 / 3 / 9, in the authored order.
+- **Underlining** on every English-concepts and Greek page, in both
+  directions — nothing authored missing, nothing invented.
+- The Scripture Memory Spelling Exercises show `Show Answer`, not the
+  `Major Hint` button the rail walks carry (ch6 p13, ch7 p13, ch8 p11).
+  The spec explicitly overrides the walk here (C8 / D-30).
+
+### 6.3 Differences left standing, and why
+
+- **Layout is portrait, the original is landscape.** Every drill in the
+  original sets the prompt on the left and the option grid on the
+  right; the port stacks them. Established since chapter 1.
+- **Topic navigation.** The original lists a page's topics as radio
+  buttons down the left and swaps the yellow panel; the port uses the
+  Previous Topic / Next Topic stepper it has used since chapter 2.
+- **Learn Vocabulary controls.** The original has Previous / Next /
+  Hide Greek / Hide English / Show Both / Pronounce / Start Over; the
+  port uses its segmented Show Both / Hide Greek / Hide English control
+  plus Previous / Next / Pronounce, and has no Start Over. Established
+  in 5B.
+- **Popup headword layout.** The original sets the headword and its
+  first sense on one line (`ἀπό  from, because of, by, of (with the
+  genitive)`); the port stacks them, which is what fits 380px.
+- **The εἰμί chart's glosses** sit under each cell rather than beside
+  it, for the same reason (ch7 p14).
+- **Feedback colouring.** The original reddens the tile clicked wrong
+  and blues the one clicked right; the port keeps the selected/correct
+  palette established across chapters 1-5.
+- **Three pages the original splits with More/Back, the delivered data
+  merges into one topic**: chapter 8's Types of Pronouns (ch8 p1-p2),
+  Enclitics (p3-p4) and Three Uses (p6-p7). The port renders each as
+  one scrolling page. That is a data shape, not a renderer choice, and
+  it reads better on a phone than a two-page split would.
+
+## 7. Definition of done
+
+| item | state |
+| --- | --- |
+| All 70 activities reachable, correct, rail-ordered | yes — 73/73 smoke checks, sequence asserted complete per chapter |
+| All three chapters lazy and offline; audio from IDB, no store scan on load/mount | yes — `check:lazy-chunk` now proves all eight; no new store reader, no new IDB writer |
+| `npm run check:shapes` passes | yes |
+| Full Playwright harness passes, including the new cases | yes — 575/575 |
+| Visual walkthrough complete for all three rails | yes — 70 stops photographed at 380px AND compared page by page against all three rail walks; eight fixes came out of it (§6.1) |
+| Both documents produced, BUILD containing the diff | yes |
+
+---
+
+## 8. Where the delivered data did not match the spec
+
+Ground rule 2 says to say so and stop rather than fix. I have not
+edited a byte of `chapt-06.json`, `chapt-07.json`, `chapt-08.json` or
+their lexicons; `git status` shows them untouched.
+
+### 8.1 Chapter 8's Quick Review pronoun charts carry untransliterated Latin
+(confirmed by ch8railwalk p12)
+
+Six rows across `c8_qr_first` and `c8_qr_second` print the enclitic
+forms as **Latin letters**:
+
+| activity | row | shipped |
+| --- | --- | --- |
+| `c8_qr_first` | G. | `mou of me\my ἡμῶν of us\our` |
+| `c8_qr_first` | D. | `moi to me\for me ἡμῖν to us\for us` |
+| `c8_qr_first` | A. | `me me ἡμᾶς us` |
+| `c8_qr_second` | G. | `sou of you\your ὑμῶν your` |
+| `c8_qr_second` | D. | `soi to you\for you ὑμῖν to you\for you` |
+| `c8_qr_second` | A. | `se you ὑμᾶς us` |
+
+The **Learn** pages for the same paradigms carry proper μου, μοι, με,
+σοι, and **ch8railwalk p12 prints all six in Greek** on the Review
+pages too — so this is a conversion miss confined to the two Quick
+Review charts, not a source problem.
+
+The same sheet shows both charts carrying a trailing note the data also
+drops ("Emphatic first person pronouns are formed by adding an initial
+epsilon…", "The emphatic form is made by adding an accent to the
+singulars (σοῦ, σοί, σέ)"). `pronounParadigm` renders a `note` when one
+is authored; neither chart authors one. This is exactly the accentless-Greek case
+`5F-EXTRACTION-MAP.md` §1.2 says `underline.py` was written to solve.
+
+Effect on screen: those six singular cells print their Latin verbatim
+as ink and are not tappable, while the plural cells beside them are
+correct Greek and do play. Visible in
+`5f-walk/ch8-17-c8_qr_first.png`. Four of the six forms (μου, μοι, με)
+have clips in the chapter's own `audioMap` and would light up the
+moment the data carries Greek — no renderer change needed.
+
+`check:shapes` now fails a `pronounParadigm` row that contains **no**
+Greek at all. It does not fail these, because each of them has Greek in
+its plural half; making it stricter would fail the build on delivered
+data I have been told not to fix.
+
+### 8.2 The chapter-8 Examples page loses an elision mark, and its underlines
+
+`c8_learn_pronouns` → Examples, third verse (Jn 16:7) ships as
+`"ἀλλ ἐ̓γὼ τὴν ἀλήθειαν"`. Two things: the elision on ἀλλ' is a
+**space** rather than U+0027, and the ε of ἐγώ carries a *trailing*
+combining smooth breathing (U+0395 U+0313 in that order) rather than
+being ἐ. The spec's §3 lists `ἀλλ'` among the elisions chapters 7 and 8
+carry, so I believe the apostrophe is missing rather than absent from
+the original. **ch8railwalk p3 confirms it**: the original prints
+`ἀλλ᾽ ἐγὼ τὴν ἀλήθειαν λέγω ὑμῖν`. Rendered as delivered in
+`5f-detail/ch8-learn-pronouns-4-examples.png`. It is displayed text
+only — nothing scores against it — so it costs correctness nowhere, but
+it teaches the wrong spelling on a page about pronouns.
+
+The same sheet shows the **pronouns underlined** in all three verses —
+`Ἐγώ`, `Σὺ`, `ἐγὼ` and `ὑμῖν` — which is what spec §3 means by "three
+tappable verses with underlined pronouns". The delivered rows carry no
+`[[u]]` run at all, so the port prints them unemphasised. The verses
+are tappable and play, including `h_exx2`; only the emphasis is
+missing.
+
+### 8.3 The teaching paradigms and every Hint chart are missing
+
+**The rail walks confirm this outright.** ch7railwalk p2 shows the
+Adjective Paradigm topic as a real chart with `Say Whole List` and a
+`More` to the Plural chart; p3 shows the same for the 2nd Adjective
+Paradigm (δίκαιος), which reaches the port nowhere at all; p7 shows the
+Present Indicative of εἰμί as a chart with its two "Things to Note"
+lines. ch8railwalk p3 shows the First and Second Person Paradigms as
+charts with `Say Whole Paradigm` and a trailing note on the emphatic
+forms, and p5-p6 the three Third Person Paradigm charts with
+`Say Whole Paradigm` / `More` / `Back`. Every one of those is flat
+`para` text in the delivered data.
+
+The Hint charts likewise exist and are photographed: ch6railwalk p8-p9
+(the two-column preposition/case chart both chapter 6 drills point at),
+ch7railwalk p5 (the full ἀγαθός chart) and p6 (`Attributive & Predicate
+Positions`, and the ἀγαθός chart again with a `More` to δίκαιος),
+ch7railwalk p9-p10 (the `"εἰμί" Paradigm` popup), ch8railwalk p5 (First
+Person Paradigm) and p7 (Third Person Paradigm, Masculine and Feminine
+with `More`).
+
+Concretely: `c7_learn_adjectives` (7 topics),
+`c8_learn_pronouns` (6) and `c8_learn_third_person` (3) are entirely
+`para` blocks — the paradigms the extraction map lists offsets for
+(`0x015ce6`, `0x01a4aa`, `0x01375a`, `0x124088`, …) are printed as
+running text lines rather than as `paradigm` / `pronounParadigm`
+blocks. The Quick Review charts, which the pipeline **did** emit as
+structured charts, are the only real charts in chapters 7 and 8's
+teaching material.
+
+Downstream, five of the six `hintRef`s dangle and eight drills that
+declare a Hint show none:
+
+| chapter | hintRef | resolves |
+| --- | --- | --- |
+| 6 | `prepositionsCaseChart` | no — no such id or title in the chapter |
+| 7 | `adjectiveParadigm` | **yes**, via the new title-slug fallback |
+| 7 | `adjectivePositions` | no |
+| 7 | `eimiParadigm` | no |
+| 8 | `firstPersonParadigm` | no — the topic exists but holds no chart |
+| 8 | `thirdPersonParadigm` | no — same |
+
+The extraction map lists offsets for all of them (`0x0d5372`,
+`0x057410`, `0x0a6cdc`, `0x0ad2cc`, `0x07fad8`, `0x080a62`,
+`0x0a79c8`), so the pipeline found them; they were not emitted.
+
+I did not bridge these by hand. Every candidate bridge I could find
+would have meant keying the renderer to an activity id, which rule B1
+forbids and which `Paradigm.svelte`'s own header rules out. The one
+generic bridge that exists — matching the ref slug against a chart's
+title — is in, and recovers one of the six.
+
+### 8.4 The vocabulary drills and D-19
+
+Covered in §5 and **D-32**. Chapters 6 and 8 ship their vocabulary
+drills as authored option grids because the pool is case-split, so
+nothing in the data marks them as vocabulary pools and they render
+two-up at both widths rather than going four-up on an iPad the way
+chapters 1-5 and 7 do. A learner meeting "Vocabulary: Greek to English
+Drill" in chapter 5 and again in chapter 6 sees two different layouts.
+If the pipeline marks those four drills as vocabulary pools — a
+`pool` or `promptFrom.lexicon` field — the existing responsive class
+picks them up with no renderer change.
+
+### 8.5 Two smaller things, noted but not acted on
+
+- `c6_ex_speller`'s `ui.buttons` lists `Score` between `Previous` and
+  `Next`, which is the authored order and is what renders. It looks odd
+  beside the other spellers but it is the data's.
+- `chapt_8` ships 179 clips in the manifest against the 181 the
+  extraction map counts. Every id the chapter references resolves, so
+  the two missing ones are among the unwired set (`i_rm623b` and the
+  four in VERIFY-5F item 9). Not a defect, recorded so the counts are
+  not later mistaken for a mismatch.
+
+---
+
+## 9. Where I was unsure
+
+- **Chapter 7's popup anchors (D-31).** The rail walk settled the
+  scope: the link is on the numbered line and nowhere else, which is
+  now what the port does. What it did not settle at this resolution is
+  whether the hot text is the Greek word or the `1)` `2)` `3)` marker
+  in front of it — the two are adjacent on one line and the colouring
+  is too small to call. Chapter 8's Three Uses page sets the number in
+  black and the label in blue, which is why I read the Greek as the
+  link here. If it is the marker, the fix is one selector.
+- **The pronoun row split.** Splitting at the last Greek run is exact
+  on all twelve delivered rows, and I could not construct a
+  counter-example from this data. It would break on a row whose plural
+  gloss contained Greek. If chapter 9's pronouns are shipped the same
+  way, this is the thing to re-check rather than assume.
+- **The prepositions diagram.** Settled: ch6railwalk p6 and p14 confirm
+  every slot and every arrow direction, including περί's curved sweep
+  in from the top left and διά's long line straight through the circle.
+  What differs is proportion, not arrangement — the original's circle
+  is wider than tall and its labels sit closer in. That is the "no
+  pixel copy" latitude the spec grants.
+- **`answerAlt` expansion (D-33).** I am confident the field must do
+  something and that "the nu is optional" is what `ἐστί(ν)` means. I am
+  less sure whether the original also accepts ἐστί, or only prints it
+  that way. If it does not, deleting the expansion is a three-line
+  revert and the harness assertion inverts.
+
+---
+
+## 10. Files
+
+**New:** `src/components/PrepositionsChart.svelte`,
+`src/components/PopupSheet.svelte`,
+`src/components/PronounParadigm.svelte`, `src/lib/popups.js`,
+`scripts/ui-smoke-5f.mjs`, `scripts/ui-shots-5f.mjs`.
+
+**Changed:** `src/lib/content.js`, `src/components/RichContent.svelte`,
+`src/components/ContentAudio.svelte`,
+`src/components/SelectActivity.svelte`,
+`src/components/SpellActivity.svelte`, `src/components/Marked.svelte`,
+`src/app.css`, `scripts/check-content-shapes.mjs`,
+`scripts/check-lazy-chunk.mjs`, `scripts/ui-behavior.mjs`,
+`scripts/ui-modals.mjs`, `package.json`,
+`buildout/DIVERGENCE-LOG.md`, `buildout/CHAT-HANDOFF.md`,
+`buildout/PHASE5-PLAN.md`.
+
+Changed in the rail-walk pass, on top of the above:
+`src/components/Paradigm.svelte` (the string-form lemma, the
+column-aware cell shrink, the Singular/Plural band).
+
+**Untouched, as required:** `src/data/chapt-0{6,7,8}.json` and
+`src/data/lexicon-chapt0{6,7,8}.json`.
+
+The full diff is in `5F-SPEC1-BUILD.md`.
diff --git a/buildout/CHAT-HANDOFF.md b/buildout/CHAT-HANDOFF.md
index 926edbb..4ee9b42 100644
--- a/buildout/CHAT-HANDOFF.md
+++ b/buildout/CHAT-HANDOFF.md
@@ -15,7 +15,79 @@ one learner: Nathanael's sister-in-law, iPhone-only, unreliable rural
 internet. Full license from the author. Secondary goal: portfolio
 piece. Nathanael goes by "Fable" when addressing Claude (chat).
 
-## Live state (2026-08-07)
+## Live state (2026-08-08)
+
+**COHORT 5F IS BUILT, NOT CLOSED.** Chapters 6, 7 and 8 — all 70
+activities — are implemented, rail-ordered, lazily chunked and offline.
+One round, one implementer, `5F-SPEC1.md`. Records:
+`5F-SPEC1-RESULTS.md` (prose, section by section) and
+`5F-SPEC1-BUILD.md` (the full diff). `npm run verify` passes; the
+behaviour harness is **586/586** (388 before the round), a new 70-stop
+smoke walk at 380px is 73/73 and the modal pass is 85/85 over five
+device heights. Screenshot corpora: `buildout/screenshots/5f-walk`
+(70 rail stops), `5f-detail` (21 sub-pages the rail walk cannot
+reach — topics, popups, the paradigm stack, the two-stage drill
+mid-answer), `5f-modals` (85).
+
+New this cohort, all registered in PHASE5-PLAN's mode/type registry:
+`prepositionsChart` (chapter 6's ten prepositions as an SVG DIAGRAM
+rather than a table, on two surfaces), full-page `popups[]`,
+`pronounParadigm` + a `paradigms[]` More/Back stack, `twoStageGrid`,
+`answerAlt` in two shapes, `options: "perItem"`, `greek2`, `note`,
+`pool: "senses"`, `audioMap`. Three new divergences: **D-31** (chapter
+7's popups are opened from their Greek headwords, because the data
+ships no anchors), **D-32** (the case-split vocabulary grids do not
+follow D-19) and **D-33** (a parenthesised `answerAlt` makes the
+parenthesised segment optional).
+
+**The two-stage drill is built exactly as Nathanael specified**
+(VERIFY-5F item 7): nothing is judged until BOTH stages are chosen, the
+person may be changed as often as the learner likes, and only the case
+click commits the pair.
+
+**WHAT 5F STILL NEEDS, all pipeline-side.** No data file was edited
+(ground rule 2); these are itemised with offsets in
+`5F-SPEC1-RESULTS.md` §8 and are the gate on closing the cohort:
+
+1. **Chapter 8's two Quick Review pronoun charts carry six rows of
+   untransliterated Latin** (`mou`, `moi`, `me`, `sou`, `soi`, `se`)
+   where the Learn pages carry proper μου, μοι, με, σου, σοι, σε. Those
+   cells print their Latin as ink and are not tappable; the clips
+   already exist in the chapter's `audioMap` and would light up the
+   moment the data carries Greek.
+2. **The teaching paradigms for chapters 7 and 8 were not emitted** —
+   `c7_learn_adjectives`, `c8_learn_pronouns` and
+   `c8_learn_third_person` are entirely flat `para` blocks. Downstream,
+   **5 of the cohort's 6 `hintRef`s dangle** and 8 drills that declare
+   a Hint in `ui.buttons` show none. The extraction map lists offsets
+   for every one of those charts, so they were found and not shipped.
+3. **Chapter 7's three popups (οὐ/οὐκ/οὐχ) ship with no anchors** — no
+   `popupRef` anywhere in `chapt-07.json`, no `[[u]]` run on the page.
+   D-31 is the workaround; anchors would retire it.
+4. **`c8_learn_pronouns` → Examples, Jn 16:7** loses the elision on
+   `ἀλλ'` (a space, not U+0027) and carries a trailing combining
+   breathing on the ε of ἐγώ.
+
+**THE RAIL-WALK COMPARISON IS DONE.** `ch6railwalk.pdf` (16 sheets),
+`ch7railwalk.pdf` (16) and `ch8railwalk.pdf` (15) were supplied after
+the first pass and every page of all three rails was then held against
+them. Eight fixes came out of it, listed with their source sheet in
+`5F-SPEC1-RESULTS.md` §6.1 — four defects nothing else would have
+caught (the case tag on the wrong side of the vocabulary card, the
+adjective paradigm printing `undefined` for its lemma, its
+three-column cells breaking mid-word at 380px, its Singular/Plural
+bands missing), two inventions of mine the original does not do (a
+greyed-out case grid, a popup-link rule that claimed too many words),
+and two smaller ones. §6.2 lists what the walk confirmed correct and
+§6.3 the differences left standing with their reasons.
+
+**PROCESS NOTE, worth keeping.** The first pass ran to completion
+WITHOUT the rail walks because they were not attached and I did not
+ask. Everything the harness can settle was right; everything only a
+screenshot can settle was not, and four of those eight defects were
+invisible to a 73/73 smoke walk and a 575-assertion harness because
+they render perfectly plausibly. Standing rule from this round: **do
+not start a spec until every file it names is in hand.**
 
 **COHORT 5E IS CLOSED.** Chapters 1 through 5 are shipped, verified on
 device, and behaviorally corrected. Full round history:
@@ -56,8 +128,12 @@ device, and behaviorally corrected. Full round history:
   an iPhone). Behavior suite: 203 → 322 checks.
 
 **All 78 rows of `DRILLBEHAVIORLEDGER.csv` are CONFIRMED — chapters 1-8,
-zero open rows.** Chapters 6-8 aren't built yet, but their BEHAVIOR is
-already verified against DOSBox, ahead of the build. This inverts the
+zero open rows.** The ledger-first process worked: chapters 6-8 were
+built against already-confirmed behavior and the harness now reads the
+ledger back off the shipped surfaces activity by activity — Previous/
+Next presence, the Pronounce-Each default and `audioTiming` on arrival,
+per scored activity, plus correct-and-incorrect per drill against each
+drill's own `advanceClass`. Nothing needed restamping. This inverts the
 5E process on purpose: 5E's data was wrong 23/50 rows because behavior
 was inferred from screenshots after the fact. 5F's data goes in
 correct the first time because the ledger already has the answers.
@@ -74,11 +150,12 @@ Fable made before Nathanael's pass corrected them: a same-chapter
 precedent is not enough when the chapter offers more than one candidate
 shape (chapter 3 has two verb drills with opposite timing).
 
-**REPO IS AHEAD OF PROJECT FILES** as of this writing on four files —
-`DIVERGENCE-LOG.md`, `DRILL-BEHAVIOR-RULES.md`, `DRILLBEHAVIORLEDGER.csv`,
-`chapt-04.json`, `chapt-05.json` — all correctly committed from the
-SPEC3-PATCH round, just not yet re-uploaded to project files. See the
-Immediate queue.
+**REPO IS AHEAD OF PROJECT FILES** on `DIVERGENCE-LOG.md` (now through
+D-33), `PHASE5-PLAN.md`, `DRILL-BEHAVIOR-RULES.md`,
+`DRILLBEHAVIORLEDGER.csv`, `chapt-04.json`, `chapt-05.json`, plus this
+file and the two 5F round documents. All committed locally from the
+SPEC3-PATCH and 5F-SPEC1 rounds, just not yet re-uploaded to project
+files. See the Immediate queue.
 
 **Superseded state below, kept for context (5D closure onward):**
 
diff --git a/buildout/DIVERGENCE-LOG.md b/buildout/DIVERGENCE-LOG.md
index babc965..a863d3c 100644
--- a/buildout/DIVERGENCE-LOG.md
+++ b/buildout/DIVERGENCE-LOG.md
@@ -186,6 +186,59 @@ D-30 | ch3,4,5 | THE WHOLE-VERSE SPELLERS USE `Show Answer`, NOT
      verse is still available at any time, which the original does not
      allow. | Nathanael, 2026-08-07; 5E-SPEC3-PATCH item 12.
 
+D-31 | ch7 | THE οὐ / οὐκ / οὐχ POPUPS ARE OPENED FROM THE GREEK
+     WORD ON THEIR OWN NUMBERED LINE. Chapter 6 declares each popup
+     link explicitly (`popupRef` on a greekRows row, the gloss being
+     the link) and chapter 8 declares its three by underlining the
+     label whose slug is the popup id. Chapter 7 declares NEITHER:
+     `c7_learn_eimi` ships three popups (οὐ, οὐκ, οὐχ) and its
+     "οὐ, οὐκ and οὐχ" page ships eleven flat paragraphs with no
+     popupRef and no underline run anywhere on it. Rather than leave
+     three authored pages unreachable — an unreachable popup is a
+     missing page in the rail — the renderer opens a popup from its
+     own `greek` headword where that headword stands on a NUMBERED
+     line, longest headword first so οὐχ is never claimed by οὐ.
+     The numbered-line restriction is the rail walk's: ch7railwalk p7
+     makes "1) οὐ before a consonant;" the hot line and leaves the οὐ
+     in the opening sentence as ordinary ink, and the same rule keeps
+     chapter 6's Proclitics page from turning "ἐν, εἰς and ἐκ are
+     proclitics" into three links the original does not have
+     (ch6railwalk p6). Everywhere else the Greek stays an ordinary
+     audio tap, so directive 9 is untouched off the three hot lines;
+     on them the word opens the page and the popup's own headword
+     plays the clip. If the pipeline later ships anchors for chapter
+     7 the rule costs nothing: an explicit popupRef or underline
+     already wins, and a chapter that ships no `greek` on its popups
+     never enters this path. | Implementer, 5F-SPEC1 §2.2; data gap
+     reported in 5F-SPEC1-RESULTS §2.2.
+D-32 | ch6,8 | THE CASE-SPLIT VOCABULARY DRILLS DO NOT FOLLOW D-19.
+     D-19 puts a lexicon-derived vocabulary option pool two-up on a
+     phone and four-up from 768px, in both directions. Chapters 6 and
+     8 present their vocabulary CASE-SPLIT (sixteen entries over ten
+     lemmas, fifteen over ten) and two of chapter 6's option captions
+     differ from its gloss pool outright, so all four of those drills
+     ship AUTHORED option grids instead of naming a lexicon pool.
+     Nothing in the delivered data distinguishes an authored
+     vocabulary grid from any other authored grid, and keying the
+     layout to an activity id is what rule B1 forbids, so they render
+     two-up at BOTH widths like every other authored grid. Asserted
+     as such in the harness rather than dropped from the census. If
+     the pipeline later marks these drills as vocabulary pools, the
+     existing responsive class picks them up with no renderer change.
+     | Implementer, 5F-SPEC1 §5.
+D-33 | ch7 | THE εἰμί SPELLER'S PARENTHESISED ALTERNATE MAKES THE
+     PARENTHESISED SEGMENT OPTIONAL. `answerAlt` is "ἐστί(ν)" against
+     an `answer` of "ἐστίν". Punctuation is already optional under
+     D-18, so the alternate folds onto the answer and the field would
+     do nothing at all; the notation is the chapter's own way of
+     saying the nu is moveable, so the renderer expands a
+     parenthesised alternate into both readings and accepts ἐστί as
+     well as ἐστίν. This is NOT a movable-nu rule — D-16 stays
+     withdrawn — it is this field, on these two items: the four items
+     beside them, whose answerAlt is their own answer, still reject a
+     stray nu, and the harness asserts that. | Implementer, 5F-SPEC1
+     §2.10.
+
 ## Auto-progress / advance rule matrix
 
 MOVED. The full exercise-by-exercise, chapter-by-chapter matrix —
diff --git a/buildout/PHASE5-PLAN.md b/buildout/PHASE5-PLAN.md
index cc31614..7f00e03 100644
--- a/buildout/PHASE5-PLAN.md
+++ b/buildout/PHASE5-PLAN.md
@@ -1,7 +1,8 @@
 # PHASE5-PLAN.md — vertical buildout roadmap (LIVING DOCUMENT)
 
-Status date: 2026-08-07 (5E closed, 5F open). Roadmap only; per-cohort
-detail lives in the numbered specs. Updated at every cohort boundary.
+Status date: 2026-08-08 (5E closed, 5F BUILT — implementation complete,
+awaiting VERIFY-5F closure). Roadmap only; per-cohort detail lives in
+the numbered specs. Updated at every cohort boundary.
 
 ## Principles (unchanged)
 
@@ -100,6 +101,34 @@ COHORT 5F — Chapters 6 + 7 + 8 (Prepositions, Adjectives and the verb
   no Case Drill, only Translation — confirmed by exhaustive TBK title
   search, not assumed; do not add one.
 
+  **BUILT 2026-08-08 (5F-SPEC1, one round, one implementer).** All 70
+  activities ship: ch6 20 rail stops, ch7 25, ch8 25, all lazily
+  chunked and offline. `npm run verify` passes; the behaviour harness
+  is 586/586 (388 before the round), the new 70-stop smoke walk is
+  73/73 and the modal pass 85/85. Records: `5F-SPEC1.md`,
+  `5F-SPEC1-RESULTS.md`, `5F-SPEC1-BUILD.md`, `5F-EXTRACTION-MAP.md`,
+  `VERIFY-5F.md`.
+  Renderer novelty delivered: `prepositionsChart` (an SVG DIAGRAM, on
+  two surfaces), full-page `popups[]` with three declaration routes,
+  `pronounParadigm` plus a `paradigms[]` More/Back stack,
+  `twoStageGrid` (the cohort's one new interaction — nothing judged
+  until BOTH stages are chosen, VERIFY-5F item 7), `answerAlt` in two
+  shapes, `options: "perItem"`, `greek2`, `note`, and the case-split
+  `pool: "senses"` vocabulary. New divergences D-31, D-32, D-33.
+  NOT closed: the delivered data is missing the teaching paradigms for
+  chapters 7 and 8 and every Hint chart in the cohort (5 of 6 hintRefs
+  dangle, 8 drills show no Hint button), chapter 7's popups ship with
+  no anchors, and chapter 8's two Quick Review pronoun charts carry
+  six rows of untransliterated Latin. All are pipeline-side and are
+  itemised in `5F-SPEC1-RESULTS.md` §8; no data file was edited, and
+  the rail walks CONFIRM every one of them.
+  The page-by-page rail-walk comparison is DONE (§6) and produced eight
+  further fixes — half of them defects no harness could see, half of
+  them my own inventions the original does not make. PROCESS LESSON,
+  now standing: do not start a spec until every file it names is in
+  hand; this round ran once without the rail walks and had to be redone
+  against them.
+
 COHORT 5G+ (INFERENCE, pending each cohort's extraction pass) —
   chapters 9-28 grouped by grammatical family, expecting the first
   chapter of each family to carry the novelty and the rest to reuse:
@@ -147,8 +176,25 @@ paradigm block; `meanings` on a chart; `note` on a chart;
 on `spell`; an explicit layout flag marking paradigm-shaped option
 grids (D-26).
 
-Expected later: whatever 5F needs for the ch8 two-step drill and the
-phrase speller. match/audioPlayer from the original seven-type plan
+Added in 5F (shipped): content blocks `prepositionsChart` (an SVG
+diagram — nodes carry `greek`/`gloss`/`slot`/`arrow`) and
+`pronounParadigm` (four case rows over Singular/Plural, each row ONE
+line of set text rather than cells); `paradigms[]` on a `paradigmChart`
+activity (a More/Back stack) and a `sayWhole` beside the chart;
+activity-level `popups[]` reached three ways (`popupRef` on a greekRows
+row, an `[[u]]` run whose slug is a popup id, or the popup's own
+`greek` headword — D-31); `senses[]`, `partAudio[]`, `bracket`, `ref`
+and `greek2` on greekRows rows; `note` on select and speller items
+(ink, never a tap); `options: "static" | "perItem"` and
+`optionLayout: "stack1col"`; `mode: "twoStageGrid"` with
+`optionStages[]` and a two-element `answer`; `answerAlt` on a speller
+item (a second acceptable spelling, parentheses meaning optional —
+D-33) and on a two-stage item (a list of extra acceptable pairs);
+`pool: "senses"` (one card per caseTag plus one for the untagged
+remainder); `audioMap` on an activity (inflected form -> clip, folded
+chapter-wide).
+
+Expected later: match/audioPlayer from the original seven-type plan
 have NOT yet been witnessed in chapters 3-8; parse/translate resolve
 to select variants.
 
diff --git a/package.json b/package.json
index bc453ce..5aa7f69 100644
--- a/package.json
+++ b/package.json
@@ -12,7 +12,10 @@
     "check:shapes": "node scripts/check-content-shapes.mjs",
     "verify": "npm run check:shapes && npm run build && npm run check:lazy-chunk",
     "ui:walk": "node scripts/ui-walk.mjs",
-    "ui:behavior": "node scripts/ui-behavior.mjs"
+    "ui:behavior": "node scripts/ui-behavior.mjs",
+    "ui:modals": "node scripts/ui-modals.mjs",
+    "ui:smoke5f": "node scripts/ui-smoke-5f.mjs",
+    "ui:shots5f": "node scripts/ui-shots-5f.mjs"
   },
   "dependencies": {
     "idb": "^7.1.1"
diff --git a/scripts/check-content-shapes.mjs b/scripts/check-content-shapes.mjs
index 2186f96..85d730c 100644
--- a/scripts/check-content-shapes.mjs
+++ b/scripts/check-content-shapes.mjs
@@ -16,7 +16,10 @@ const problems = [];
 // (5B-SPEC3 D4). Add the type here in the same change that adds its branch.
 const BLOCK_TYPES = new Set([
   'heading', 'subheading', 'para', 'numbered', 'defList',
-  'biblist', 'refs', 'note', 'greekRows', 'expander', 'paradigm'
+  'biblist', 'refs', 'note', 'greekRows', 'expander', 'paradigm',
+  // 5F: chapter 6's preposition DIAGRAM and chapter 8's pronoun chart, whose
+  // rows are set as one line of text rather than as {greek, gloss} cells.
+  'prepositionsChart', 'pronounParadigm'
 ]);
 // "type" is also the ACTIVITY discriminator, so the activity types are listed
 // here as the known non-block use of the key. Anything else carrying a "type"
@@ -76,13 +79,18 @@ function validateParadigmTable(table, path, { allowExtras = true } = {}) {
 
   const rows = Array.isArray(table.rows) ? table.rows : [];
   if (!rows.length) problems.push(`${path}: paradigm has no rows.`);
+  const labelled = rows.some(row => row && String(row.label ?? row.person ?? '').trim());
   rows.forEach((row, index) => {
     if (!row || typeof row !== 'object' || Array.isArray(row)) {
       problems.push(`${path}.rows[${index}]: paradigm row is not an object.`);
       return;
     }
-    if (!String(row.label ?? row.person ?? '').trim()) {
-      problems.push(`${path}.rows[${index}]: paradigm row has no label or person.`);
+    // A row label is REQUIRED only where the chart has them. Chapter 7's εἰμί
+    // paradigm has none — its three rows are first, second and third person
+    // and the original prints no case column at all — so "some rows are
+    // labelled and some are not" is the real defect, not "no row is labelled".
+    if (labelled && !String(row.label ?? row.person ?? '').trim()) {
+      problems.push(`${path}.rows[${index}]: paradigm row has no label or person while its siblings do.`);
     }
     if (!Array.isArray(row.cells) || row.cells.length !== columns.length) {
       problems.push(`${path}.rows[${index}]: paradigm row has ${(row.cells || []).length} cells, expected ${columns.length}.`);
@@ -178,12 +186,44 @@ function validateMeanings(meanings, path) {
   }
 }
 
+// 5F: chapter 8's pronoun chart. Its rows carry ONE LINE of set text
+// ("ἐγώ I ἡμεῖς we"), not a cells[] array, so it has its own contract:
+// PronounParadigm.svelte splits the line at the start of the last Greek run.
+// The check that matters is that the line HAS that run — a row with no Greek
+// at all cannot be split into a Singular and a Plural cell and would print as
+// one undifferentiated string, which is exactly the shape of the delivered
+// defect this file exists to make loud.
+const GREEK_RUN = /[Ͱ-Ͽἀ-῿]/u;
+function validatePronounParadigm(chart, path) {
+  const columns = Array.isArray(chart.columns) ? chart.columns : [];
+  if (columns.length !== 2) {
+    problems.push(`${path}.columns: pronounParadigm expects a Singular and a Plural column, got ${columns.length}.`);
+  }
+  const rows = Array.isArray(chart.rows) ? chart.rows : [];
+  if (!rows.length) problems.push(`${path}: pronounParadigm has no rows.`);
+  rows.forEach((row, index) => {
+    const text = row && typeof row.text === 'string' ? row.text.trim() : '';
+    if (!text) {
+      problems.push(`${path}.rows[${index}]: pronounParadigm row has no text line.`);
+      return;
+    }
+    if (!GREEK_RUN.test(text)) {
+      problems.push(`${path}.rows[${index}]: pronounParadigm row "${text}" contains no Greek — it cannot be split into Singular and Plural cells.`);
+    }
+    if (!String(row.label ?? '').trim()) {
+      problems.push(`${path}.rows[${index}]: pronounParadigm row has no case label.`);
+    }
+  });
+}
+
 function validateParadigm(paradigm, path) {
   if (!paradigm || typeof paradigm !== 'object' || Array.isArray(paradigm)) {
     problems.push(`${path}: paradigm is not an object.`);
     return;
   }
 
+  if (paradigm.type === 'pronounParadigm') { validatePronounParadigm(paradigm, path); return; }
+
   if (paradigm.charts != null) {
     if (!Array.isArray(paradigm.charts) || paradigm.charts.length < 2) {
       problems.push(`${path}.charts: expected at least two charts.`);
@@ -270,9 +310,16 @@ for (const file of files) {
     // A paradigm chart's rows must line up with its declared columns, or cells
     // land under the wrong number heading. Chapter 4/5 may wrap multiple full
     // charts in charts[]; validate each chart and each nested Meanings table.
-    if (block.type === 'paradigm' || (block.paradigm && block.mode === 'paradigmChart')) {
-      const chart = block.type === 'paradigm' ? block : block.paradigm;
-      validateParadigm(chart, block.type === 'paradigm' ? path : `${path}.paradigm`);
+    if (block.type === 'paradigm' || block.type === 'pronounParadigm'
+        || (block.paradigm && block.mode === 'paradigmChart')) {
+      const own = block.type === 'paradigm' || block.type === 'pronounParadigm';
+      validateParadigm(own ? block : block.paradigm, own ? path : `${path}.paradigm`);
+    }
+    // 5F: a paradigmChart may ship SEVERAL charts as paradigms[] (chapter 8's
+    // third person, reached by More/Back). Validate each.
+    if (block.mode === 'paradigmChart' && Array.isArray(block.paradigms)) {
+      if (!block.paradigms.length) problems.push(`${path}.paradigms: expected at least one chart.`);
+      block.paradigms.forEach((chart, index) => validateParadigm(chart, `${path}.paradigms[${index}]`));
     }
     // spellVerse grades word by word, so the answer must actually be words.
     if (block.type === 'spellVerse') {
@@ -438,12 +485,30 @@ for (const file of files) {
   walk(data, file, (activity, path) => {
     if (activity.type !== 'spell' && activity.type !== 'spellVerse') return;
     const answers = [...(activity.answerWords || [])];
+    // answerAlt spellings are ALSO accepted, so they must be enterable — but
+    // they are not what the surface asks the learner to type, so they are
+    // exempt from the displayed-punctuation rule below. Chapter 7's εἰμί
+    // speller prints ἐστί(ν) to show that the nu is moveable; the parentheses
+    // are typography, not a mark the chapter teaches and the learner reaches
+    // for, and the bare ἐστίν the item actually answers with is fully typeable.
+    const alternates = [];
     for (const item of activity.items || []) {
-      const greek = item.greek || (item.ref ? lemmaGreek(item.ref) : null);
+      // 5F: a speller item may carry its Greek as `answer` (the phrase and
+      // parse spellers) as well as `greek` (chapter 3's verb speller) or by
+      // lexicon ref (the vocabulary spellers), and may carry a SECOND
+      // acceptable spelling in answerAlt. Every form the checker will accept
+      // has to be typeable, which is what makes this the check that proves the
+      // elision apostrophe on ἐπ' ἀληθείας has a key (C9 / D-29). Without this
+      // branch the whole of chapters 6-8's spellers were invisible here.
+      const greek = item.greek || item.answer || (item.ref ? lemmaGreek(item.ref) : null);
       if (greek) answers.push(greek);
+      const alt = item.answerAlt;
+      for (const value of Array.isArray(alt) ? alt : (alt ? [alt] : [])) {
+        if (typeof value === 'string') alternates.push(value);
+      }
     }
     const punctuationOptional = activity.punctuationOptional !== false;
-    for (const answer of answers) {
+    for (const answer of [...answers, ...alternates]) {
       // The checker lowercases under both toggle settings (no shift layer),
       // and drops punctuation unless the surface requires it.
       let folded = answer.toLowerCase();
@@ -456,6 +521,7 @@ for (const file of files) {
           problems.push(`${path}: "${answer}" needs "${cluster}" (U+${[...cluster].map(c => c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')).join('+')}), which no speller tile can produce.`);
         }
       }
+      if (alternates.includes(answer)) continue;   // see `alternates` above
       // AND THE PUNCTUATION ITSELF MUST BE TYPEABLE (5E-SPEC3-PATCH, D-29).
       // The loop above deletes punctuation before checking, which is right for
       // "can this answer be entered at all" — D-18 makes it optional — but it
diff --git a/scripts/check-lazy-chunk.mjs b/scripts/check-lazy-chunk.mjs
index be3c318..dc4ebe2 100644
--- a/scripts/check-lazy-chunk.mjs
+++ b/scripts/check-lazy-chunk.mjs
@@ -23,7 +23,10 @@ const expected = [
   { chapterPattern: /^chapt-02-.*\.js$/, lexiconPattern: /^lexicon-chapt02-.*\.js$/, needle: 'Greek divides words into syllables in almost the same way as English.' },
   { chapterPattern: /^chapt-03-.*\.js$/, lexiconPattern: /^lexicon-chapt03-.*\.js$/, needle: 'Verbs are words of action or state of being.' },
   { chapterPattern: /^chapt-04-.*\.js$/, lexiconPattern: /^lexicon-chapt04-.*\.js$/, needle: 'A noun is commonly defined as a word that stands for a person, place or thing.' },
-  { chapterPattern: /^chapt-05-.*\.js$/, lexiconPattern: /^lexicon-chapt05-.*\.js$/, needle: 'This page is largely a repetition of what was done in chapter 4 except for the section on the definite article.' }
+  { chapterPattern: /^chapt-05-.*\.js$/, lexiconPattern: /^lexicon-chapt05-.*\.js$/, needle: 'This page is largely a repetition of what was done in chapter 4 except for the section on the definite article.' },
+  { chapterPattern: /^chapt-06-.*\.js$/, lexiconPattern: /^lexicon-chapt06-.*\.js$/, needle: 'Prepositions are usually small words that link or relate two words together.' },
+  { chapterPattern: /^chapt-07-.*\.js$/, lexiconPattern: /^lexicon-chapt07-.*\.js$/, needle: 'An adjective is a word used to modify' },
+  { chapterPattern: /^chapt-08-.*\.js$/, lexiconPattern: /^lexicon-chapt08-.*\.js$/, needle: 'A pronoun is a word that stands in place' }
 ];
 
 // 2. Chapter DATA must be ABSENT from the main bundle and PRESENT in its chunk.
diff --git a/scripts/ui-behavior.mjs b/scripts/ui-behavior.mjs
index 5aaf2cf..9ed546d 100644
--- a/scripts/ui-behavior.mjs
+++ b/scripts/ui-behavior.mjs
@@ -44,6 +44,9 @@ const ch4 = JSON.parse(readFileSync('src/data/chapt-04.json', 'utf8'));
 const ch5 = JSON.parse(readFileSync('src/data/chapt-05.json', 'utf8'));
 const ch1 = JSON.parse(readFileSync('src/data/chapt-01.json', 'utf8'));
 const ch2 = JSON.parse(readFileSync('src/data/chapt-02.json', 'utf8'));
+const ch6 = JSON.parse(readFileSync('src/data/chapt-06.json', 'utf8'));
+const ch7 = JSON.parse(readFileSync('src/data/chapt-07.json', 'utf8'));
+const ch8 = JSON.parse(readFileSync('src/data/chapt-08.json', 'utf8'));
 const verse = (ch3.exercise.find(a => a.type === 'spellVerse').answerWords || []).join(' ');
 // UNACCENTED, not unmarked (5E-SPEC2 §4.2). "With Accents" OFF forgives the
 // acute, the grave and the circumflex and NOTHING else, so a fixture that
@@ -703,9 +706,17 @@ for (const chapterId of ['chapt_1', 'chapt_2', 'chapt_3', 'chapt_4', 'chapt_5'])
 // option-grid census.
 await page.setViewportSize({ width: 390, height: 900 });
 
-const CHAPTERS = { chapt_1: ch1, chapt_2: ch2, chapt_3: ch3, chapt_4: ch4, chapt_5: ch5 };
+// 5F: chapters 6, 7 and 8 join the swept set, so every census, every ledger
+// assertion and every spelling rule below covers them without being restated.
+// That is the point of writing them as sweeps rather than as lists.
+const CHAPTERS = { chapt_1: ch1, chapt_2: ch2, chapt_3: ch3, chapt_4: ch4, chapt_5: ch5,
+                   chapt_6: ch6, chapt_7: ch7, chapt_8: ch8 };
 const LEXICON = id => JSON.parse(readFileSync(`src/data/lexicon-chapt0${id.split('_')[1]}.json`, 'utf8'));
 const promptGloss = () => page.locator('.card.speller .flash-pane .value').first().innerText();
+// WHICH ITEM the word speller is on. Not the prompt: chapter 7's adjective
+// speller prints "good" on six consecutive items and tells them apart by their
+// parse note, so a prompt comparison cannot see that word 1 became word 2.
+const spellerIndex = async () => page.locator('.card.speller').first().getAttribute('data-word-index');
 const exerciseCount = () => page.locator('.card .exercise-count').innerText();
 const awaitNextShown = async () => await page.locator('.await-next').count() > 0;
 
@@ -1075,7 +1086,7 @@ for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
   const word = answers[0];
   if (!word) { check(`5E §1 ${chapterId} ${activity.id}: correct auto-advances`, false, 'no first answer in the data'); continue; }
   await go(`#/activity/${chapterId}/${activity.id}`);
-  const before = await promptGloss();
+  const before = await spellerIndex();
   await setAccents(false);
   await typeAccented(stripAccents(word));
   const answeredAt = Date.now();
@@ -1084,16 +1095,16 @@ for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
   const kind = await feedbackKind();
   const said = await awaitNextShown();
   await shot(`B1a ${chapterId} ${activity.id} CORRECT`);
-  const early = await promptGloss();
+  const early = await spellerIndex();
   let late = early;
   while (late === before && Date.now() - answeredAt < CORRECT_MS * 3) {
     await page.waitForTimeout(50);
-    late = await promptGloss();
+    late = await spellerIndex();
   }
   const elapsed = Date.now() - answeredAt;
   check(`5E §1 ${chapterId} ${activity.id} (retryUntilRight): correct auto-advances on max(2000ms, clip)`,
     kind === 'ok' && !said && early === before && late !== before && elapsed >= CORRECT_MS * 0.8,
-    `feedback ${kind} for ${JSON.stringify(word)}, wait message ${said}, prompt ${JSON.stringify(before)} -> ${JSON.stringify(late)} at ${elapsed}ms`);
+    `feedback ${kind} for ${JSON.stringify(word)}, wait message ${said}, word ${before} -> ${late} at ${elapsed}ms`);
 }
 
 // Rule B1b, the one place a correct answer does NOT move: a whole-verse
@@ -1319,7 +1330,10 @@ function spellerAnswers(chapterId, activity) {
     }
     return null;
   };
-  return (activity.items || []).map(item => item.greek || (item.ref ? lookup(item.ref) : null));
+  // 5F: a speller item may carry its Greek as `answer` (the phrase and parse
+  // spellers) as well as `greek` or by lexicon ref. `ref` on those items is a
+  // scripture citation, not a lexicon key, so the lookup is tried last.
+  return (activity.items || []).map(item => item.greek || item.answer || (item.ref ? lookup(item.ref) : null));
 }
 for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
   for (const activity of activitiesOf(chapter).filter(a => a && a.type === 'spell')) {
@@ -2004,6 +2018,768 @@ for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
     alternates.length === 0, alternates.join('; '));
 }
 
+// ===================================================================
+// 5F: chapters 6, 7 and 8
+// ===================================================================
+// Everything above already sweeps the three new chapters (they are in
+// CHAPTERS). What follows is what only they have: the ledger read back off the
+// shipped surfaces activity by activity, the two-stage case drill, answerAlt
+// in both of its shapes, per-item option rendering, the elision apostrophe
+// round-tripping through the checker, and the popup pages.
+
+const CH_5F = { chapt_6: ch6, chapt_7: ch7, chapt_8: ch8 };
+
+// ---- the ledger, read off the SURFACE, activity by activity --------------
+// `audioTiming`, the Pronounce-Each default and the Previous/Next pair are
+// stamped into the data from DRILLBEHAVIORLEDGER.csv, and the components read
+// them from there. This asserts the SHIPPED SURFACE agrees with the stamp on
+// every scored activity of the three chapters — which is the check that would
+// notice a component quietly defaulting instead of reading.
+for (const [chapterId, chapter] of Object.entries(CH_5F)) {
+  for (const activity of activitiesOf(chapter).filter(a => a && (a.type === 'select' || a.type === 'spell' || a.type === 'spellVerse'))) {
+    await go(`#/activity/${chapterId}/${activity.id}`);
+    const buttons = (activity.ui && activity.ui.buttons) || [];
+    const wantsStepper = buttons.includes('Previous') || buttons.includes('Next');
+    const inCard = name => page.locator('.card').getByRole('button', { name, exact: true });
+    // The activity's OWN pair, never the rail's (both say "Next").
+    const hasPrev = await inCard('Previous').count() > 0;
+    const hasNext = await inCard('Next').count() > 0;
+    check(`5F ledger ${chapterId} ${activity.id}: Previous/Next ${wantsStepper ? 'present' : 'absent'} per the ledger`,
+      hasPrev === wantsStepper && hasNext === wantsStepper,
+      `declared [${buttons.join(', ')}], on screen Previous ${hasPrev} Next ${hasNext}`);
+
+    const wantPronounceEach = (activity.ui && activity.ui.defaults
+      && activity.ui.defaults.pronounceEach) ?? true;
+    const box = page.locator('label', { hasText: /Pronounce each/i }).locator('input');
+    if (await box.count()) {
+      check(`5F ledger ${chapterId} ${activity.id}: Pronounce Each defaults ${wantPronounceEach ? 'ON' : 'OFF'}`,
+        await box.first().isChecked() === !!wantPronounceEach,
+        `checked ${await box.first().isChecked()}`);
+    }
+
+    // §2 audio timing, on arrival. `beforeGuess` speaks the prompt with no
+    // click behind it; every other timing is silent until the learner acts.
+    await page.waitForTimeout(400);
+    const spokeOnArrival = (await clips()).some(c => c.startedAt);
+    const timing = activity.audioTiming || (activity.type === 'select' ? 'beforeGuess' : 'afterGuess');
+    check(`5F ledger ${chapterId} ${activity.id}: audioTiming "${timing}" — ${timing === 'beforeGuess' ? 'speaks' : 'is silent'} on arrival`,
+      spokeOnArrival === (timing === 'beforeGuess'),
+      `clips started on arrival: ${spokeOnArrival}`);
+  }
+}
+
+// ---- every scored option grid, both outcomes ----------------------------
+// Rule B1a on the correct path and the item's own advanceClass on the wrong
+// one, for EVERY select drill in the three chapters — not a sample.
+//
+// The answer is read from the DATA rather than learned from a reveal, which
+// these chapters make possible: every item carries its own `answer`, and the
+// prompt plus its note identify the item on screen even where the Greek alone
+// repeats (chapter 6 drills διά twice, once per case, and tells them apart by
+// the gloss printed under it). Where a prompt is genuinely shared by items
+// with DIFFERENT answers the item is skipped and the drill is retried, so a
+// data ambiguity can never be reported as a broken advance.
+// Chapter 7 keeps the plain ten-lemma vocabulary shape, so its two vocabulary
+// drills carry no items at all — the pool IS the lexicon. Reconstruct the same
+// {prompt, answer} pairs the app builds from it, so those two drills are swept
+// like every other rather than skipped.
+function fiveFItems(chapterId, activity) {
+  if (Array.isArray(activity.items) && activity.items.length) return activity.items;
+  if (!activity.promptFrom) return [];
+  const lexicon = LEXICON(chapterId);
+  const bucket = lexicon[activity.promptFrom.lexicon] || lexicon.lemmas || {};
+  const chapter = CHAPTERS[chapterId];
+  const gloss = lemma => lemma.glossShort || lemma.gloss;
+  return (chapter.vocab || []).map(ref => bucket[ref]).filter(Boolean).map(lemma =>
+    activity.promptFrom.show === 'greek'
+      ? { prompt: lemma.greek, answer: gloss(lemma) }
+      : { prompt: gloss(lemma), answer: lemma.greek });
+}
+async function fiveFItemOnScreen(chapterId, activity) {
+  const prompt = await promptOnScreen();
+  const note = await page.locator('.prompt-note').count()
+    ? normalizeText(await page.locator('.prompt-note').innerText()) : null;
+  const rendered = item => normalizeText([item.greek ?? item.prompt, item.greek2].filter(Boolean).join(' '));
+  const hits = fiveFItems(chapterId, activity).filter(item =>
+    rendered(item) === prompt && (note == null || normalizeText(item.note) === note));
+  if (!hits.length) return null;
+  const answers = new Set(hits.map(item => normalizeText(item.answer)));
+  return answers.size === 1 ? { prompt, note, answer: hits[0].answer, options: hits[0].options } : null;
+}
+async function fiveFFreshItem(hash, chapterId, activity, tries = 12) {
+  for (let attempt = 0; attempt < tries; attempt++) {
+    await go(hash);
+    const item = await fiveFItemOnScreen(chapterId, activity);
+    if (item) return item;
+  }
+  return null;
+}
+for (const [chapterId, chapter] of Object.entries(CH_5F)) {
+  for (const activity of activitiesOf(chapter).filter(a => a && a.type === 'select' && a.mode !== 'twoStageGrid')) {
+    const hash = `#/activity/${chapterId}/${activity.id}`;
+    const advanceClass = (activity.answerPolicy || {}).advanceClass;
+    const tiles = () => page.locator(OPTION_TILES);
+
+    // ---- correct -> auto-advances (B1a), never waits for Next
+    {
+      const item = await fiveFFreshItem(hash, chapterId, activity);
+      if (!item) { check(`5F ${chapterId} ${activity.id}: correct auto-advances`, false, 'no unambiguously identified item in 12 passes'); continue; }
+      const labels = (await tiles().allInnerTexts()).map(normalizeText);
+      const at = labels.indexOf(normalizeText(item.answer));
+      const before = await itemNumber();
+      const answeredAt = Date.now();
+      await tiles().nth(at).click();
+      await page.waitForTimeout(180);
+      const kind = await feedbackKind();
+      const said = await awaitNextShown();
+      let late = await itemNumber();
+      while (late === before && Date.now() - answeredAt < CORRECT_MS * 3.5) {
+        await page.waitForTimeout(50);
+        late = await itemNumber();
+      }
+      const elapsed = Date.now() - answeredAt;
+      check(`5F ${chapterId} ${activity.id} (${advanceClass}): a CORRECT answer auto-advances on max(2000ms, clip) and never waits`,
+        at >= 0 && kind === 'ok' && !said && late !== before && elapsed >= CORRECT_MS * 0.8,
+        `${JSON.stringify(item.prompt)} -> ${JSON.stringify(item.answer)}, feedback ${kind}, wait message ${said}, item ${before} -> ${late} at ${elapsed}ms`);
+    }
+
+    // ---- incorrect -> exactly what the class says
+    {
+      const item = await fiveFFreshItem(hash, chapterId, activity);
+      if (!item) { check(`5F ${chapterId} ${activity.id}: incorrect behaves per its class`, false, 'no unambiguously identified item in 12 passes'); continue; }
+      const labels = (await tiles().allInnerTexts()).map(normalizeText);
+      const wrongAt = labels.findIndex(text => text !== normalizeText(item.answer));
+      const before = await itemNumber();
+      const answeredAt = Date.now();
+      await tiles().nth(wrongAt).click();
+      await page.waitForTimeout(200);
+      const kind = await feedbackKind();
+      const said = await awaitNextShown();
+      // The paradigm grids repeat a form legitimately (nominative and vocative
+      // plural are homographs), so assert WHAT is revealed, not how many.
+      const revealed = (await page.locator('.grid.options .tile.correct, .option-group .tile.correct').allInnerTexts()).map(normalizeText);
+      if (advanceClass === 'manualOnIncorrect') {
+        await page.waitForTimeout(INCORRECT_MS * 1.3);
+        check(`5F ${chapterId} ${activity.id} (manualOnIncorrect): an INCORRECT answer reveals, waits and says so`,
+          wrongAt >= 0 && kind === 'bad' && said && revealed.length >= 1
+            && revealed.every(text => text === normalizeText(item.answer))
+            && await itemNumber() === before,
+          `revealed ${JSON.stringify(revealed)} for ${JSON.stringify(item.answer)}, waiting ${said}, item ${before} -> ${await itemNumber()}`);
+      } else if (advanceClass === 'autoBoth') {
+        let late = await itemNumber();
+        while (late === before && Date.now() - answeredAt < INCORRECT_MS * 2) {
+          await page.waitForTimeout(60);
+          late = await itemNumber();
+        }
+        const elapsed = Date.now() - answeredAt;
+        check(`5F ${chapterId} ${activity.id} (autoBoth): an INCORRECT answer reveals and auto-advances on 4000ms`,
+          wrongAt >= 0 && kind === 'bad' && !said && revealed.length >= 1
+            && late !== before && elapsed >= INCORRECT_MS * 0.8,
+          `revealed ${JSON.stringify(revealed)}, wait message ${said}, item ${before} -> ${late} at ${elapsed}ms`);
+      } else {
+        await page.waitForTimeout(INCORRECT_MS * 1.3);
+        check(`5F ${chapterId} ${activity.id} (${advanceClass}): an INCORRECT answer reveals nothing and stays open`,
+          wrongAt >= 0 && kind === 'bad' && !said && revealed.length === 0 && await itemNumber() === before,
+          `revealed ${revealed.length}, waiting ${said}, item ${before} -> ${await itemNumber()}`);
+      }
+    }
+  }
+}
+
+// ---- §2.9 the two-stage case drill --------------------------------------
+{
+  const activity = activityById(ch8, 'c8_drill_case');
+  const HASH = '#/activity/chapt_8/c8_drill_case';
+  const stage = index => page.locator(`.grid.options[data-stage="${index}"]`);
+  const stageTiles = index => stage(index).locator('.tile');
+  // The item on screen, identified by its Greek prompt. Several forms repeat
+  // across items (αὐτῶν is genitive plural in all three genders) but they
+  // repeat with the SAME answer, so the prompt identifies the answer even
+  // where it does not identify the item.
+  const answersFor = async () => {
+    const prompt = await promptOnScreen();
+    const hits = activity.items.filter(i => normalizeText(i.greek) === prompt);
+    return { prompt, pairs: hits.length ? [hits[0].answer, ...(hits[0].answerAlt || [])] : [] };
+  };
+
+  await go(HASH);
+  check('5F §2.9 the instruction line asks for two clicks',
+    normalizeText(await page.locator('.instructions').first().innerText()) === 'Click on the person then the case',
+    JSON.stringify(await page.locator('.instructions').first().innerText()));
+  check('5F §2.9 both stages are on screen, person first',
+    await stage(0).count() === 1 && await stage(1).count() === 1
+      && await stage(0).getAttribute('data-stage-label') === 'person'
+      && await stage(1).getAttribute('data-stage-label') === 'caseNumber',
+    `stages ${await page.locator('.grid.options[data-stage]').count()}`);
+  // ch8railwalk p8: the case grid is drawn in exactly the same state before
+  // and after the person click. An earlier pass greyed it out to make the
+  // instruction line's order visible; the original does not, so neither do we.
+  check('5F §2.9 BOTH grids are live from the start (ch8railwalk p8)',
+    !await stageTiles(0).first().isDisabled() && !await stageTiles(1).first().isDisabled(),
+    `person disabled ${await stageTiles(0).first().isDisabled()}, case disabled ${await stageTiles(1).first().isDisabled()}`);
+
+  // NOTHING is judged on the person click, however many times it is changed.
+  await page.locator('.card').getByRole('button', { name: 'Score', exact: true }).click();
+  const scoreBefore = normalizeText(await page.locator('.live-score').innerText());
+  await stageTiles(0).nth(0).click();
+  await page.waitForTimeout(120);
+  const afterFirst = { kind: await feedbackKind(), score: normalizeText(await page.locator('.live-score').innerText()) };
+  await stageTiles(0).nth(1).click();
+  await page.waitForTimeout(120);
+  await stageTiles(0).nth(2).click();
+  await page.waitForTimeout(120);
+  const afterThird = { kind: await feedbackKind(), score: normalizeText(await page.locator('.live-score').innerText()) };
+  await shot('5F two-stage: three person clicks, nothing judged');
+  check('5F §2.9 a person click is NOT judged — the learner may change their mind freely (VERIFY-5F item 7)',
+    afterFirst.kind === 'none' && afterThird.kind === 'none'
+      && afterFirst.score === scoreBefore && afterThird.score === scoreBefore,
+    `feedback after 1 click ${afterFirst.kind}, after 3 ${afterThird.kind}; score ${scoreBefore} -> ${afterThird.score}`);
+  check('5F §2.9 only the LAST person clicked is selected',
+    await stage(0).locator('.tile.selected').count() === 1
+      && normalizeText(await stage(0).locator('.tile.selected').innerText()) === normalizeText(await stageTiles(0).nth(2).innerText()),
+    `${await stage(0).locator('.tile.selected').count()} selected`);
+
+  // The pair is what is judged, in EITHER order: filling the case first and
+  // the person second commits on the person click, and is still one attempt.
+  {
+    await go(HASH);
+    const { pairs } = await answersFor();
+    const [person, caseNumber] = pairs[0] || [];
+    await stage(1).locator('.tile', { hasText: caseNumber }).first().click();
+    await page.waitForTimeout(120);
+    const midKind = await feedbackKind();
+    await stage(0).locator('.tile', { hasText: person }).first().click();
+    await page.waitForTimeout(180);
+    check('5F §2.9 the pair commits in either order — case first is not judged on its own',
+      midKind === 'none' && await feedbackKind() === 'ok',
+      `after the case alone ${midKind}, after the pair ${await feedbackKind()}`);
+  }
+
+  // BOTH RIGHT: the pair is scored once, correct, and auto-advances (B1a).
+  {
+    await go(HASH);
+    const { prompt, pairs } = await answersFor();
+    const [person, caseNumber] = pairs[0] || [];
+    const before = await itemNumber();
+    await stage(0).locator('.tile', { hasText: person }).first().click();
+    const answeredAt = Date.now();
+    await stage(1).locator('.tile', { hasText: caseNumber }).first().click();
+    await page.waitForTimeout(180);
+    const kind = await feedbackKind();
+    const said = await awaitNextShown();
+    await shot('5F two-stage: both right');
+    let late = await itemNumber();
+    while (late === before && Date.now() - answeredAt < CORRECT_MS * 3) {
+      await page.waitForTimeout(50);
+      late = await itemNumber();
+    }
+    check('5F §2.9 both stages right: scored correct and auto-advances (B1a)',
+      kind === 'ok' && !said && late !== before,
+      `${JSON.stringify(prompt)} -> ${JSON.stringify([person, caseNumber])}, feedback ${kind}, item ${before} -> ${late} at ${Date.now() - answeredAt}ms`);
+  }
+
+  // WRONG SECOND STAGE: one attempt, manualOnIncorrect — reveals, waits, stays.
+  {
+    await go(HASH);
+    const { prompt, pairs } = await answersFor();
+    const [person, caseNumber] = pairs[0] || [];
+    const before = await itemNumber();
+    await stage(0).locator('.tile', { hasText: person }).first().click();
+    const labels = (await stageTiles(1).allInnerTexts()).map(normalizeText);
+    const wrongAt = labels.findIndex(text => !pairs.some(pair => normalizeText(pair[1]) === text));
+    await stageTiles(1).nth(wrongAt).click();
+    await page.waitForTimeout(200);
+    const kind = await feedbackKind();
+    const said = await awaitNextShown();
+    const revealed = (await stage(1).locator('.tile.correct').allInnerTexts()).map(normalizeText);
+    await shot('5F two-stage: wrong case');
+    await page.waitForTimeout(INCORRECT_MS * 1.4);
+    check('5F §2.9 wrong SECOND stage: one attempt, reveals the case, waits for Next (manualOnIncorrect)',
+      kind === 'bad' && said && revealed.includes(normalizeText(caseNumber)) && await itemNumber() === before,
+      `${JSON.stringify(prompt)} wrong case ${JSON.stringify(labels[wrongAt])}, revealed ${JSON.stringify(revealed)}, waiting ${said}, item ${before} -> ${await itemNumber()}`);
+    check('5F §2.9 a judged item locks BOTH grids',
+      await stageTiles(0).first().isDisabled() && await stageTiles(1).first().isDisabled());
+  }
+
+  // WRONG FIRST STAGE, right second: the pair is wrong, and it is the PAIR
+  // that was judged — the person click on its own never was.
+  {
+    await go(HASH);
+    const { prompt, pairs } = await answersFor();
+    const [person, caseNumber] = pairs[0] || [];
+    const people = (await stageTiles(0).allInnerTexts()).map(normalizeText);
+    const wrongPerson = people.find(text => text !== normalizeText(person));
+    await stage(0).locator('.tile', { hasText: wrongPerson }).first().click();
+    await page.waitForTimeout(120);
+    const midKind = await feedbackKind();
+    await stage(1).locator('.tile', { hasText: caseNumber }).first().click();
+    await page.waitForTimeout(200);
+    await shot('5F two-stage: wrong person, right case');
+    check('5F §2.9 wrong FIRST stage is judged only once the pair is complete',
+      midKind === 'none' && await feedbackKind() === 'bad'
+      && (await stage(0).locator('.tile.correct').allInnerTexts()).map(normalizeText).includes(normalizeText(person)),
+      `${JSON.stringify(prompt)}: feedback after the wrong person alone ${midKind}, after the pair ${await feedbackKind()}`);
+  }
+
+  // §2.10 αὐτά: the chart prints it in the neuter nominative plural AND the
+  // neuter accusative plural, and the original grades BOTH right.
+  {
+    const item = activity.items.find(i => (i.answerAlt || []).length);
+    const alt = item.answerAlt[0];
+    let found = false;
+    for (let i = 0; i < 40 && !found; i++) {
+      await go(HASH);
+      for (let step = 0; step < activity.items.length; step++) {
+        if (await promptOnScreen() === normalizeText(item.greek)) { found = true; break; }
+        await stepper('Next').click();
+        await page.waitForTimeout(40);
+      }
+    }
+    if (!found) {
+      check('5F §2.10 αὐτά accepts the ACCUSATIVE plural reading too (VERIFY-5F item 8)', false, 'never reached the item');
+    } else {
+      await stage(0).locator('.tile', { hasText: alt[0] }).first().click();
+      await stage(1).locator('.tile', { hasText: alt[1] }).first().click();
+      await page.waitForTimeout(200);
+      await shot('5F answerAlt: the second reading of αὐτά');
+      check('5F §2.10 αὐτά accepts the ACCUSATIVE plural reading too, on the CORRECT path (VERIFY-5F item 8)',
+        await feedbackKind() === 'ok' && !await awaitNextShown(),
+        `answered ${JSON.stringify(alt)} against authored ${JSON.stringify(item.answer)}, feedback ${await feedbackKind()}`);
+    }
+  }
+}
+
+// ---- §2.10 answerAlt on the εἰμί speller --------------------------------
+// The third singular and plural print a moveable nu in parentheses. `answer`
+// is the bare form, `answerAlt` the printed one, and BOTH are accepted. This
+// is not general movable-nu leniency (D-16 stays withdrawn): the item next
+// door, whose answerAlt is its own answer, still rejects a stray nu.
+{
+  const activity = activityById(ch7, 'c7_ex_speller_eimi');
+  const HASH = '#/activity/chapt_7/c7_ex_speller_eimi';
+  const at = index => (async () => { await go(HASH); await gotoItem(index); await setAccents(false); })();
+  const parenIndex = activity.items.findIndex(i => (i.answerAlt || '').includes('('));
+  const paren = activity.items[parenIndex];
+  const bare = stripAccents(paren.answer);                       // ἐστίν  -> εστιν
+  const noNu = bare.replace(/ν$/, '');                           // εστι
+
+  await at(parenIndex);
+  await typeAccented(bare);
+  await stepper('Check Answer').click();
+  await page.waitForTimeout(150);
+  check(`5F §2.10 εἰμί speller: the bare form ${JSON.stringify(paren.answer)} is accepted`,
+    await feedbackKind() === 'ok', `typed ${JSON.stringify(await typed())}`);
+
+  await at(parenIndex);
+  await typeAccented(noNu);
+  await stepper('Check Answer').click();
+  await page.waitForTimeout(150);
+  check(`5F §2.10 εἰμί speller: the printed form ${JSON.stringify(paren.answerAlt)} is accepted without its parentheses`,
+    await feedbackKind() === 'ok', `typed ${JSON.stringify(await typed())}`);
+
+  // The leniency is THIS FIELD, not a rule. An item whose answerAlt equals its
+  // answer gets no movable nu.
+  const plainIndex = activity.items.findIndex(i => i.answerAlt === i.answer && !/\(/.test(i.answerAlt) && !/ν$/.test(i.answer));
+  const plain = activity.items[plainIndex];
+  await at(plainIndex);
+  await typeAccented(stripAccents(plain.answer) + 'ν');
+  await stepper('Check Answer').click();
+  await page.waitForTimeout(150);
+  check(`5F §2.10 the leniency is the FIELD, not a rule: ${JSON.stringify(plain.answer)} + ν is still wrong (D-16 stays withdrawn)`,
+    await feedbackKind() === 'bad', `typed ${JSON.stringify(await typed())}`);
+}
+
+// ---- §3 the elision apostrophe round-trips through the checker -----------
+// U+0027 is REQUIRED and is not interchangeable with a smooth breathing (C9 /
+// D-29). Chapter 6 item 12 is ἐπ' ἀληθείας; chapters 7 and 8 elide in their
+// verses. The tile has to exist in all three chapters' spellers and the
+// checker has to insist on it.
+{
+  for (const [chapterId, chapter] of Object.entries(CH_5F)) {
+    const activity = activitiesOf(chapter).find(a => a && a.type === 'spell');
+    await go(`#/activity/${chapterId}/${activity.id}`);
+    await page.locator('.card').getByRole('button', { name: 'Greek Keyboard', exact: true }).click();
+    await page.waitForTimeout(120);
+    const key = page.locator('.tk-key.punct[title="apostrophe"]');
+    check(`5F §3 ${chapterId}: the U+0027 apostrophe tile is reachable on this chapter's speller keyboard`,
+      await key.count() === 1, `${await key.count()} apostrophe tiles`);
+  }
+
+  const activity = activityById(ch6, 'c6_ex_speller');
+  const index = activity.items.findIndex(i => i.answer.includes("'"));
+  const answer = activity.items[index].answer;                   // ἐπ' ἀληθείας
+  const HASH = '#/activity/chapt_6/c6_ex_speller';
+  for (const [label, input, expect] of [
+    ['typed WITH the apostrophe', stripAccents(answer), 'ok'],
+    ['typed with the apostrophe DROPPED', stripAccents(answer).replace(/'/g, ''), 'bad']
+  ]) {
+    await go(HASH);
+    await gotoItem(index);
+    await setAccents(false);
+    await typeAccented(input);
+    await stepper('Check Answer').click();
+    await page.waitForTimeout(150);
+    check(`5F §3 ch6 ${JSON.stringify(answer)} ${label}: ${expect}`,
+      await feedbackKind() === expect, `typed ${JSON.stringify(await typed())}`);
+  }
+  // The other half of C9, and the reason the "type a breathing instead" case
+  // cannot be driven through the UI at all: NO tile produces any of the curled
+  // alternates. The learner reaching for the elision mark can only find the
+  // one spelling the app uses, which is what makes the two marks impossible to
+  // confuse on the way in rather than merely unequal on the way out.
+  const ALTERNATES = ['᾽', '’', 'ʼ', '‘'];
+  const producible = new Set([
+    ...(TILES.punctuation || []).map(t => t.insert),
+    ...(TILES.letters || []), ...(TILES.composites || [])
+  ]);
+  check('5F §3 / C9 no speller tile can produce an elision-mark alternate — only U+0027 is reachable',
+    ALTERNATES.every(mark => !producible.has(mark)) && producible.has("'"),
+    `reachable alternates: ${ALTERNATES.filter(m => producible.has(m)).map(m => `U+${m.codePointAt(0).toString(16).toUpperCase()}`).join(', ') || 'none'}`);
+}
+
+// ---- §2.6 per-item options ----------------------------------------------
+// The three translation drills carry their three options ON THE ITEM, not as a
+// shared pool. Without that the drill would silently build its grid from the
+// chapter's lemma list — ten plausible options, none of them the item's.
+for (const [chapterId, id] of [
+  ['chapt_6', 'c6_drill_translation'],
+  ['chapt_7', 'c7_drill_translation'],
+  ['chapt_7', 'c7_drill_translation_eimi'],
+  ['chapt_8', 'c8_drill_translation'],
+  ['chapt_8', 'c8_drill_translation_autos']
+]) {
+  const activity = activityById(CH_5F[chapterId], id);
+  await go(`#/activity/${chapterId}/${id}`);
+  const shown = (await page.locator('.grid.options .tile').allInnerTexts()).map(normalizeText);
+  const prompt = await promptOnScreen();
+  // The prompt may be set over two lines, so match on the first line.
+  const item = activity.items.find(i => prompt.startsWith(normalizeText(i.greek)));
+  check(`5F §2.6 ${chapterId} ${id}: the grid shows THIS ITEM's three options`,
+    !!item && shown.length === item.options.length
+      && item.options.every(option => shown.includes(normalizeText(option))),
+    `prompt ${JSON.stringify(prompt)}; on screen ${JSON.stringify(shown)}; authored ${JSON.stringify(item ? item.options : null)}`);
+  check(`5F §2.6 ${chapterId} ${id}: they stack one to a row (stack1col)`,
+    await page.locator('.grid.options').first()
+      .evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length) === 1);
+}
+
+// ---- §2.7 two-line Greek prompts ----------------------------------------
+// greek2 is a LINE BREAK in one prompt, not a second prompt: one tap target,
+// one clip. Null on the items that are one line only.
+for (const [chapterId, id] of [['chapt_7', 'c7_drill_translation'], ['chapt_8', 'c8_drill_translation']]) {
+  const activity = activityById(CH_5F[chapterId], id);
+  let seenTwoLine = false;
+  for (let i = 0; i < 25 && !seenTwoLine; i++) {
+    await go(`#/activity/${chapterId}/${id}`);
+    for (let step = 0; step < activity.items.length; step++) {
+      const lines = await page.locator('.prompt .prompt-line2').count();
+      if (lines === 1) {
+        const prompt = await promptOnScreen();
+        const item = activity.items.find(x => x.greek2 && prompt.startsWith(normalizeText(x.greek)));
+        check(`5F §2.7 ${chapterId} ${id}: a two-line prompt is ONE tap target with one clip`,
+          !!item && await page.locator('.prompt.greek-say').count() === 1
+            && normalizeText(await page.locator('.prompt').first().innerText())
+               === normalizeText(`${item.greek} ${item.greek2}`),
+          `on screen ${JSON.stringify(await page.locator('.prompt').first().innerText())}`);
+        seenTwoLine = true;
+        break;
+      }
+      await stepper('Next').click();
+      await page.waitForTimeout(40);
+    }
+  }
+  if (!seenTwoLine) check(`5F §2.7 ${chapterId} ${id}: a two-line prompt is ONE tap target with one clip`, false, 'never met a two-line item');
+}
+
+// ---- §2.5 the note beside a prompt is INK, never a tap ------------------
+// The "(not ἐκ)" disambiguator holds Greek and is still not tappable: the
+// logged exception to directive 9.
+{
+  const activity = activityById(ch6, 'c6_ex_speller');
+  const index = activity.items.findIndex(i => (i.note || '').includes('ἐκ'));
+  await go('#/activity/chapt_6/c6_ex_speller');
+  await gotoItem(index);
+  const note = page.locator('.spell-prompt-note');
+  check('5F §2.5 the "(not ἐκ)" note prints beside the prompt',
+    await note.count() === 1 && normalizeText(await note.innerText()) === normalizeText(activity.items[index].note),
+    JSON.stringify(await note.innerText().catch(() => null)));
+  check('5F §2.5 it is INK, not a tap target, even though it holds Greek',
+    await note.locator('button').count() === 0
+      && await note.evaluate(el => getComputedStyle(el).cursor) !== 'pointer');
+  // ON THE PROMPT'S LINE (ch6railwalk p10 sets "from God (not ἐκ)" as one
+  // line). Same baseline, to the right, and never inside the prompt's own
+  // element.
+  const promptBox = await page.locator('.card.speller .flash-pane .value').first().boundingBox();
+  const noteBox = await note.boundingBox();
+  check('5F §2.5 the speller note sits ON the prompt line, to its right (ch6railwalk p10)',
+    noteBox.y < promptBox.y + promptBox.height && noteBox.x > promptBox.x,
+    `prompt y ${Math.round(promptBox.y)}..${Math.round(promptBox.y + promptBox.height)}, note y ${Math.round(noteBox.y)}`);
+}
+// ...and on a select prompt (chapter 6's case drill prints the gloss, chapter
+// 8's vocabulary drill the case tag).
+for (const [chapterId, id] of [['chapt_6', 'c6_drill_case'], ['chapt_6', 'c6_drill_vocab_gk_en'], ['chapt_8', 'c8_drill_vocab_gk_en']]) {
+  // Not every item carries a note — chapter 8 tags only παρά and ὑπό — and
+  // these pools are shuffled with no stepper, so reload until one comes up.
+  const note = page.locator('.prompt-note');
+  for (let attempt = 0; attempt < 30; attempt++) {
+    await go(`#/activity/${chapterId}/${id}`);
+    if (await note.count()) break;
+  }
+  const prompt = page.locator('.prompt').first();
+  check(`5F §2.5 ${chapterId} ${id}: the case tag is ink beside the prompt, never inside its tap target`,
+    await note.count() === 1 && await note.locator('button').count() === 0
+      && await prompt.locator('.prompt-note').count() === 0,
+    JSON.stringify(await note.innerText().catch(() => null)));
+  const promptBox = await prompt.boundingBox();
+  const noteBox = await note.boundingBox();
+  check(`5F §2.5 ${chapterId} ${id}: it sits ON the prompt's line (ch6railwalk p8/p10)`,
+    noteBox.y < promptBox.y + promptBox.height && noteBox.x > promptBox.x,
+    `prompt y ${Math.round(promptBox.y)}..${Math.round(promptBox.y + promptBox.height)}, note y ${Math.round(noteBox.y)}`);
+}
+
+// ---- the case tag goes with the GREEK on a vocabulary card --------------
+// ch6railwalk p10: "Greek Word: ἀπό (with gen.)" over "Word Meaning: from".
+// The tag is part of the headword, not part of the gloss.
+{
+  await go('#/activity/chapt_6/c6_learn_vocab');
+  await page.locator('.card').getByRole('button', { name: 'Next', exact: true }).click();
+  await page.waitForTimeout(120);
+  const greek = normalizeText(await page.locator('.flash-pane .value.greek').first().innerText());
+  const meaning = normalizeText(await page.locator('.flash-pane').nth(1).locator('.value').first().innerText());
+  check('5F ch6 Learn Vocabulary: the case tag rides with the GREEK, not the gloss (ch6railwalk p10)',
+    /\(with \w+\.\)$/.test(greek) && !/\(with/.test(meaning),
+    `Greek Word ${JSON.stringify(greek)}, Word Meaning ${JSON.stringify(meaning)}`);
+}
+
+// ---- a paradigm that runs singular then plural legends both -------------
+// ch7railwalk p14: the Review Adjectives Paradigm prints "Singular" beside its
+// N. row and "Plural" beside its N.V. row.
+{
+  await go('#/activity/chapt_7/c7_qr_adjectives');
+  const bands = (await page.locator('.pg-numberband').allInnerTexts()).map(normalizeText);
+  check('5F ch7 Review Adjectives Paradigm legends its Singular and Plural blocks (ch7railwalk p14)',
+    bands.length === 2 && bands[0] === 'Singular' && bands[1] === 'Plural',
+    JSON.stringify(bands));
+  // No earlier chart authors `number`, so none of them may grow a band.
+  for (const [chapterId, id] of [['chapt_4', 'c4_qr_nouns'], ['chapt_7', 'c7_qr_eimi'], ['chapt_8', 'c8_qr_first']]) {
+    await go(`#/activity/${chapterId}/${id}`);
+    if (!await page.locator('.card').count()) continue;
+    check(`5F ${chapterId} ${id}: no number band where the data authors no number`,
+      await page.locator('.pg-numberband').count() === 0);
+  }
+}
+
+// ---- §3 a null ref renders NOTHING, not an empty chip -------------------
+{
+  const activity = activityById(ch8, 'c8_ex_speller');
+  const index = activity.items.findIndex(i => i.ref == null);
+  await go('#/activity/chapt_8/c8_ex_speller');
+  await gotoItem(index);
+  check('5F §3 chapter 8\'s blank-reference speller item renders no citation at all',
+    index >= 0 && await page.locator('.spell-prompt-ref').count() === 0,
+    `item ${index} (${JSON.stringify(activity.items[index] && activity.items[index].prompt)}), refs on screen ${await page.locator('.spell-prompt-ref').count()}`);
+  // The item either side of it DOES carry one, so the assertion above is not
+  // passing because the surface never prints a reference.
+  await go('#/activity/chapt_8/c8_ex_speller');
+  await gotoItem(0);
+  check('5F §3 ...while an item that HAS a reference still prints it',
+    await page.locator('.spell-prompt-ref').count() === 1);
+}
+
+// ---- §2.1 the Prepositions Chart, on both of its surfaces ---------------
+for (const [label, hash, topicIndex] of [
+  ['the Learn topic', '#/activity/chapt_6/c6_learn_prepositions', 4],
+  ['Review Prepositions Chart', '#/activity/chapt_6/c6_qr_prepositions', null]
+]) {
+  const block = ch6.learn.find(a => a.id === 'c6_learn_prepositions')
+    .topics.find(t => t.id === 'prepositionsChart').content[0];
+  await go(hash);
+  if (topicIndex != null) await gotoTopic(topicIndex);
+  const nodes = page.locator('.prep-svg .prep-node');
+  check(`5F §2.1 ${label}: all ten prepositions are drawn, ἐν at the centre`,
+    await nodes.count() === block.nodes.length && await page.locator('.prep-centre').count() === 1
+      // textContent, not innerText: these are SVG <text> nodes.
+      && normalizeText(await page.locator('.prep-centre .prep-greek').textContent()) === 'ἐν',
+    `${await nodes.count()} nodes of ${block.nodes.length}`);
+  check(`5F §2.1 ${label}: every arrow the data declares is drawn`,
+    await page.locator('.prep-svg .prep-arrow').count() === block.nodes.filter(n => n.arrow).length,
+    `${await page.locator('.prep-svg .prep-arrow').count()} arrows of ${block.nodes.filter(n => n.arrow).length}`);
+  // Directive 9, on a diagram: every Greek label plays its own clip.
+  await page.evaluate(() => { window.__clips.length = 0; });
+  await nodes.first().click();
+  await page.waitForTimeout(200);
+  check(`5F §2.1 ${label}: a Greek label plays its clip`,
+    (await clips()).length === 1, `${(await clips()).length} clips`);
+  check(`5F §2.1 ${label}: it fits the 380px viewport without panning`,
+    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
+}
+
+// ---- §2.2 the popup pages ----------------------------------------------
+// Every popup a chapter ships has to be REACHABLE — an unreachable one is a
+// missing page in the rail, and nothing else in the app would say so.
+for (const [chapterId, activityId, opener] of [
+  ['chapt_6', 'c6_learn_prepositions', '.rc-sense-link'],
+  ['chapt_7', 'c7_learn_eimi', '.popup-link'],
+  ['chapt_8', 'c8_learn_third_person', '.popup-link']
+]) {
+  const activity = activityById(CH_5F[chapterId], activityId);
+  const reached = new Set();
+  const topics = activity.topics.length;
+  for (let topicIndex = 0; topicIndex < topics; topicIndex++) {
+    await go(`#/activity/${chapterId}/${activityId}`);
+    await gotoTopic(topicIndex);
+    const links = page.locator(opener);
+    const count = await links.count();
+    for (let i = 0; i < count; i++) {
+      await go(`#/activity/${chapterId}/${activityId}`);
+      await gotoTopic(topicIndex);
+      await page.locator(opener).nth(i).click();
+      await page.waitForTimeout(120);
+      const id = await page.locator('.popup-sheet').getAttribute('data-popup-id').catch(() => null);
+      if (id) reached.add(id);
+    }
+  }
+  const declared = (activity.popups || []).map(p => p.id);
+  check(`5F §2.2 ${chapterId} ${activityId}: every one of its ${declared.length} popups is reachable from the page`,
+    declared.every(id => reached.has(id)),
+    `reached ${[...reached].join(', ') || 'none'}; missing ${declared.filter(id => !reached.has(id)).join(', ') || 'none'}`);
+}
+// The sheet's own behaviour: Cancel closes it, every Greek phrase on it plays,
+// and it stops what it started on the way out (rule A4).
+{
+  await go('#/activity/chapt_6/c6_learn_prepositions');
+  await gotoTopic(1);
+  await page.locator('.rc-sense-link').first().click();
+  await page.waitForTimeout(120);
+  const examples = page.locator('.popup-example-greek');
+  await page.evaluate(() => { window.__clips.length = 0; });
+  await page.locator('.popup-head').click();
+  await page.waitForTimeout(150);
+  const headClips = (await clips()).length;
+  await examples.first().click();
+  await page.waitForTimeout(150);
+  check('5F §2.2 the popup headword and every example phrase are tappable',
+    headClips === 1 && (await clips()).length === 2 && await examples.count() >= 1,
+    `${await examples.count()} examples, ${(await clips()).length} clips`);
+  await shot('5F popup at rest');
+  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
+  await page.waitForTimeout(150);
+  check('5F §2.2 Cancel closes the sheet and stops its audio (A4)',
+    await page.locator('.popup-sheet').count() === 0 && await clipsPlaying() === 0,
+    `sheets ${await page.locator('.popup-sheet').count()}, still playing ${await clipsPlaying()}`);
+}
+
+// ---- §2.8 the pronoun paradigm stack (More / Back) ----------------------
+{
+  await go('#/activity/chapt_8/c8_qr_third');
+  const chart = page.locator('.pronoun-paradigm');
+  const genders = [];
+  genders.push(await chart.getAttribute('data-gender'));
+  check('5F §2.8 the third-person chart opens on Masculine and offers More, not Back',
+    genders[0] === 'Masculine' && await page.locator('[data-paradigm-switch="more"]').count() === 1
+      && await page.locator('[data-paradigm-switch="back"]').count() === 0);
+  await page.locator('[data-paradigm-switch="more"]').click();
+  await page.waitForTimeout(100);
+  genders.push(await chart.getAttribute('data-gender'));
+  check('5F §2.8 More steps to Feminine, and Back appears',
+    genders[1] === 'Feminine' && await page.locator('[data-paradigm-switch="back"]').count() === 1);
+  await page.locator('[data-paradigm-switch="more"]').click();
+  await page.waitForTimeout(100);
+  genders.push(await chart.getAttribute('data-gender'));
+  check('5F §2.8 More again steps to Neuter, where More runs out',
+    genders[2] === 'Neuter' && await page.locator('[data-paradigm-switch="more"]').count() === 0
+      && await page.locator('[data-paradigm-switch="back"]').count() === 1,
+    genders.join(' -> '));
+  await page.locator('[data-paradigm-switch="back"]').click();
+  await page.waitForTimeout(100);
+  check('5F §2.8 Back steps down again', await chart.getAttribute('data-gender') === 'Feminine');
+  // Four case rows over two columns, on every one of the three charts.
+  check('5F §2.8 four case rows over a Singular and a Plural column',
+    await chart.locator('.pg-row').count() === 4 && await chart.locator('.pg-row').first().locator('.pg-cell').count() === 2,
+    `${await chart.locator('.pg-row').count()} rows`);
+  // Directive 9: a cell whose form has a clip plays it.
+  await page.evaluate(() => { window.__clips.length = 0; });
+  await chart.locator('.pg-cell').first().click();
+  await page.waitForTimeout(200);
+  check('5F §2.8 a paradigm cell plays its own clip', (await clips()).length === 1);
+}
+
+// ---- every Quick Review chart offers its Say Whole action EXACTLY once ---
+// A chart may carry the action itself or the activity may carry it beside the
+// chart, and both routes drawing it printed "Say Whole List" twice on the εἰμί
+// chart before this was asserted.
+for (const [chapterId, chapter] of Object.entries(CH_5F)) {
+  for (const activity of activitiesOf(chapter).filter(a => a && a.mode === 'paradigmChart')) {
+    const charts = activity.paradigms || (activity.paradigm ? [activity.paradigm] : []);
+    for (const [index, chart] of charts.entries()) {
+      await go(`#/activity/${chapterId}/${activity.id}`);
+      for (let step = 0; step < index; step++) {
+        await page.locator('[data-paradigm-switch="more"]').click();
+        await page.waitForTimeout(80);
+      }
+      const wants = !!(chart.sayWhole || activity.sayWhole);
+      const count = await page.locator('.card').getByRole('button', { name: /^Say Whole/ }).count();
+      check(`5F ${chapterId} ${activity.id} chart ${index + 1}: the Say Whole action is drawn ${wants ? 'exactly once' : 'not at all'}`,
+        count === (wants ? 1 : 0), `${count} on screen`);
+    }
+  }
+}
+
+// ---- §2.4 underlining is DATA ------------------------------------------
+// The [[u]] runs come from the TBK's own run tables. Assert the count on
+// screen equals the count in the data, chapter by chapter: an underline the
+// renderer invented, or dropped, shows up here as a mismatch.
+for (const [chapterId, chapter] of Object.entries(CH_5F)) {
+  const marked = [];
+  (function scan(node) {
+    if (Array.isArray(node)) return node.forEach(scan);
+    if (node && typeof node === 'object') {
+      for (const [key, value] of Object.entries(node)) if (!key.startsWith('_')) scan(value);
+      return;
+    }
+    if (typeof node === 'string') for (const m of node.matchAll(/\[\[u\]\]([\s\S]*?)\[\[\/u\]\]/g)) marked.push(m[1]);
+  })(chapter);
+  // Walk the teaching activities the runs live in and count what renders.
+  const seen = [];
+  for (const activity of activitiesOf(chapter).filter(a => a && a.type === 'contentAudio')) {
+    const topics = (activity.topics || []).length || 1;
+    for (let topicIndex = 0; topicIndex < topics; topicIndex++) {
+      await go(`#/activity/${chapterId}/${activity.id}`);
+      if (activity.topics) await gotoTopic(topicIndex);
+      // `.underline-link` is an authored [[u]] run that ALSO names a popup
+      // (chapter 8's Three Uses labels), so it counts as a rendered underline.
+      // The other popup links do not: chapter 6's are gloss links declared by
+      // popupRef and chapter 7's are Greek headwords, neither of which the run
+      // tables underline.
+      for (const text of await page.locator('.card u, .card .underline-link').allInnerTexts()) seen.push(normalizeText(text));
+    }
+  }
+  const missing = marked.map(normalizeText).filter(text => !seen.includes(text));
+  check(`5F §2.4 ${chapterId}: every authored [[u]] run renders (underlined, or as the popup link it names)`,
+    missing.length === 0,
+    `${marked.length} authored, ${seen.length} on screen; missing ${JSON.stringify(missing.slice(0, 4))}`);
+  check(`5F §2.4 ${chapterId}: the renderer invents no underline the data does not carry`,
+    seen.every(text => marked.map(normalizeText).includes(text)),
+    `unexpected ${JSON.stringify(seen.filter(t => !marked.map(normalizeText).includes(t)).slice(0, 4))}`);
+}
+
+// ---- §1/§2 the case-split vocabulary pool ------------------------------
+// Chapter 6 presents SIXTEEN cards over ten lemmas and chapter 8 THIRTEEN over
+// ten; neither is the ten-card lemma pool chapters 1-5 use. Counted through
+// the flashcard's own stepper.
+for (const [chapterId, activityId, expected] of [
+  ['chapt_6', 'c6_learn_vocab', 16],
+  ['chapt_7', 'c7_learn_vocab', 10],
+  ['chapt_8', 'c8_learn_vocab', 13]
+]) {
+  await go(`#/activity/${chapterId}/${activityId}`);
+  let cards = 0;
+  const next = page.locator('.card').getByRole('button', { name: 'Next', exact: true });
+  while (!await next.isDisabled() && cards < 40) { await next.click(); cards += 1; }
+  check(`5F §3 ${chapterId} Learn Vocabulary steps through ${expected} cards, not ten`,
+    cards === expected, `${cards} cards`);
+}
+
 // ------------------------------------------------------ §6.8 option grids
 // A CENSUS, not a list: every select activity in chapters 1-5, measured at both
 // widths. The responsive pool must be 2-up at 320 and 4-up at 768 whatever
@@ -2030,9 +2806,28 @@ for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
   }
   await page.setViewportSize({ width: 390, height: 900 });
 
-  // The lexicon-derived vocabulary pools, in BOTH directions, are the grids
+  // The LEXICON-DERIVED vocabulary pools, in BOTH directions, are the grids
   // D-19 is about: 2-up on a phone, 4-up once the iPad has room.
-  const vocabulary = census.filter(row => /_vocab_(gk_en|en_gk)$/.test(row.id));
+  //
+  // 5F: chapters 6 and 8 present their vocabulary CASE-SPLIT (sixteen entries
+  // over ten lemmas, fifteen over ten), and two of chapter 6's option captions
+  // differ from its gloss pool outright, so those four drills ship AUTHORED
+  // option grids rather than naming a lexicon pool. The renderer has no way to
+  // tell an authored vocabulary grid from any other authored grid — nothing in
+  // the data says so, and keying it to an activity id is exactly what rule B1
+  // forbids — so they render 2-up at both widths, like every other authored
+  // grid. That is a real, small divergence from D-19's intent and it is
+  // asserted here as what it is rather than dropped from the census.
+  // See 5F-SPEC1-RESULTS §5 and DIVERGENCE-LOG D-32.
+  const AUTHORED_VOCAB = new Set([
+    'c6_drill_vocab_gk_en', 'c6_drill_vocab_en_gk',
+    'c8_drill_vocab_gk_en', 'c8_drill_vocab_en_gk'
+  ]);
+  const vocabulary = census.filter(row => /_vocab_(gk_en|en_gk)$/.test(row.id) && !AUTHORED_VOCAB.has(row.id));
+  for (const row of census.filter(row => AUTHORED_VOCAB.has(row.id))) {
+    check(`5F §5 ${row.chapterId} ${row.id}: case-split vocabulary is an AUTHORED grid and stays 2-up at both widths`,
+      row.cols[320] === 2 && row.cols[768] === 2, `${row.cols[320]} / ${row.cols[768]} columns`);
+  }
   const paradigm = census.filter(row => row.layout === 'paradigm2col');
   const declared = census.filter(row => row.layout === 'single' || row.layout === 'grouped');
 
diff --git a/scripts/ui-modals.mjs b/scripts/ui-modals.mjs
index 307685d..bf473ca 100644
--- a/scripts/ui-modals.mjs
+++ b/scripts/ui-modals.mjs
@@ -105,6 +105,42 @@ const SURFACES = [
     await page.locator('.card .pg-endings-open').first().click();
     await page.waitForTimeout(180);
   }],
+  // 5F: the full-page popups. Three shapes — a preposition with three sense
+  // lines and three worked examples (the tallest thing in the cohort), a
+  // three-sense preposition, and a use-of-αὐτός page with no headword. Each is
+  // a modal with a Cancel control, so each has to show both borders and that
+  // control at rest at every height, like every other modal in the app.
+  ['ch6-popup-apo', async () => {
+    await go('#/activity/chapt_6/c6_learn_prepositions');
+    await page.getByRole('button', { name: 'Next Topic', exact: true }).click();
+    await page.waitForTimeout(100);
+    await page.locator('.rc-sense-link').first().click();
+    await page.waitForTimeout(180);
+  }],
+  ['ch6-popup-epi-three-senses', async () => {
+    await go('#/activity/chapt_6/c6_learn_prepositions');
+    for (let i = 0; i < 3; i++) { await page.getByRole('button', { name: 'Next Topic', exact: true }).click(); await page.waitForTimeout(80); }
+    await page.locator('.rc-sense-link').first().click();
+    await page.waitForTimeout(180);
+  }],
+  ['ch7-popup-ou', async () => {
+    await go('#/activity/chapt_7/c7_learn_eimi');
+    for (let i = 0; i < 3; i++) { await page.getByRole('button', { name: 'Next Topic', exact: true }).click(); await page.waitForTimeout(80); }
+    await page.locator('.popup-link').first().click();
+    await page.waitForTimeout(180);
+  }],
+  ['ch8-popup-autos-as-a-pronoun', async () => {
+    await go('#/activity/chapt_8/c8_learn_third_person');
+    for (let i = 0; i < 2; i++) { await page.getByRole('button', { name: 'Next Topic', exact: true }).click(); await page.waitForTimeout(80); }
+    await page.locator('.popup-link').first().click();
+    await page.waitForTimeout(180);
+  }],
+  ['ch6-speller-greek-keyboard', async () => {
+    await go('#/activity/chapt_6/c6_ex_speller');
+    await page.locator('.card').getByRole('button', { name: 'Greek Keyboard', exact: true }).click();
+    await page.waitForTimeout(180);
+  }],
+  ['ch7-adjective-case-hint', hint('chapt_7', 'c7_drill_case', false)],
   ['ch1-speller-greek-keyboard', async () => {
     await go('#/activity/chapt_1/c1_ex_speller');
     await page.locator('.card').getByRole('button', { name: 'Greek Keyboard', exact: true }).click();
diff --git a/scripts/ui-shots-5f.mjs b/scripts/ui-shots-5f.mjs
new file mode 100644
index 0000000..a9404f0
--- /dev/null
+++ b/scripts/ui-shots-5f.mjs
@@ -0,0 +1,113 @@
+// TARGETED SCREENSHOTS, cohort 5F. The rail walk photographs each activity as
+// it ARRIVES, which never shows a topic past the first, a popup, a second
+// paradigm page or an answered drill. This file drives to the surfaces the
+// spec's new-renderer section is about and photographs those.
+//
+//   npm run preview
+//   node scripts/ui-shots-5f.mjs --shots=DIR
+import { chromium } from 'playwright-core';
+import { mkdirSync } from 'node:fs';
+
+const BASE = process.env.BASE || 'http://localhost:4173';
+const SHOTS = (process.argv.find(a => a.startsWith('--shots=')) || '').split('=')[1] || 'buildout/screenshots/5f-detail';
+mkdirSync(SHOTS, { recursive: true });
+
+const LAUNCH = { args: ['--autoplay-policy=no-user-gesture-required'] };
+async function launchBrowser() {
+  const explicit = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
+  if (explicit) return chromium.launch({ ...LAUNCH, executablePath: explicit });
+  try { return await chromium.launch(LAUNCH); } catch (original) {
+    for (const channel of ['chrome', 'msedge']) {
+      try { return await chromium.launch({ ...LAUNCH, channel }); } catch { /* keep looking */ }
+    }
+    throw original;
+  }
+}
+const browser = await launchBrowser();
+const context = await browser.newContext({ viewport: { width: 380, height: 900 } });
+const page = await context.newPage();
+let nav = 0;
+const go = async hash => {
+  await page.goto(`${BASE}/?run=${++nav}${hash}`, { waitUntil: 'load' });
+  await page.waitForSelector('.card', { timeout: 15000 }).catch(() => {});
+  await page.evaluate(() => document.fonts.ready);
+  await page.waitForTimeout(150);
+};
+const shot = async name => {
+  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
+  console.log(`shot ${name}`);
+};
+const nextTopic = async n => {
+  for (let i = 0; i < n; i++) {
+    await page.getByRole('button', { name: 'Next Topic', exact: true }).click();
+    await page.waitForTimeout(120);
+  }
+};
+
+// ---- chapter 6: the topic rail of Learn Greek Prepositions -----------------
+const CH6_TOPICS = ['introduction', 'oneCase', 'twoCase', 'threeCase', 'prepositionsChart',
+                    'elision', 'proclitics', 'compounds'];
+for (const [index, name] of CH6_TOPICS.entries()) {
+  await go('#/activity/chapt_6/c6_learn_prepositions');
+  await nextTopic(index);
+  await shot(`ch6-learn-prepositions-${index + 1}-${name}`);
+}
+// The Review copy of the same chart.
+await go('#/activity/chapt_6/c6_qr_prepositions');
+await shot('ch6-qr-prepositions-chart');
+
+// A preposition popup, opened from the One Case panel's gloss link.
+await go('#/activity/chapt_6/c6_learn_prepositions');
+await nextTopic(1);
+await page.locator('.rc-sense-link').first().click();
+await page.waitForTimeout(150);
+await shot('ch6-popup-apo');
+
+// The Three Case panel's three sense lines, and the ἐπί popup.
+await go('#/activity/chapt_6/c6_learn_prepositions');
+await nextTopic(3);
+await page.locator('.rc-sense-link').first().click();
+await page.waitForTimeout(150);
+await shot('ch6-popup-epi');
+
+// ---- chapter 7: the οὐ / οὐκ / οὐχ popups ---------------------------------
+await go('#/activity/chapt_7/c7_learn_eimi');
+await nextTopic(3);
+await shot('ch7-learn-eimi-4-ouOukOuch');
+await page.locator('.popup-link').first().click();
+await page.waitForTimeout(150);
+await shot('ch7-popup-ou');
+
+// ---- chapter 8: the three uses of αὐτός -----------------------------------
+await go('#/activity/chapt_8/c8_learn_third_person');
+await nextTopic(2);
+await shot('ch8-learn-third-person-3-threeUses');
+await page.locator('.popup-link').first().click();
+await page.waitForTimeout(150);
+await shot('ch8-popup-as-a-pronoun');
+
+// The Examples page's three tappable verses.
+await go('#/activity/chapt_8/c8_learn_pronouns');
+await nextTopic(3);
+await shot('ch8-learn-pronouns-4-examples');
+
+// The third-person paradigm stack: Masculine, More to Feminine, More to Neuter.
+await go('#/activity/chapt_8/c8_qr_third');
+await shot('ch8-qr-third-1-masculine');
+await page.locator('[data-paradigm-switch="more"]').click();
+await page.waitForTimeout(120);
+await shot('ch8-qr-third-2-feminine');
+await page.locator('[data-paradigm-switch="more"]').click();
+await page.waitForTimeout(120);
+await shot('ch8-qr-third-3-neuter');
+
+// The two-stage case drill: person chosen, then the pair committed.
+await go('#/activity/chapt_8/c8_drill_case');
+await page.locator('[data-stage="0"] .tile').first().click();
+await page.waitForTimeout(120);
+await shot('ch8-case-drill-person-chosen');
+await page.locator('[data-stage="1"] .tile').first().click();
+await page.waitForTimeout(200);
+await shot('ch8-case-drill-committed');
+
+await browser.close();
diff --git a/scripts/ui-smoke-5f.mjs b/scripts/ui-smoke-5f.mjs
new file mode 100644
index 0000000..95f01b4
--- /dev/null
+++ b/scripts/ui-smoke-5f.mjs
@@ -0,0 +1,108 @@
+// SMOKE WALK, cohort 5F. Visits every activity of chapters 6, 7 and 8 in RAIL
+// ORDER at the 380px phone viewport and reports, per stop: whether a card
+// rendered, whether any placeholder ("pending verification" / "Unsupported
+// content block" / "renderer needs updating") reached the screen, and whether
+// the page logged an error.
+//
+// This is the cheap net under the behavioural harness: it does not assert what
+// a surface DOES, it asserts that no surface is silently broken or blank. Run
+// it before ui-behavior.mjs so a data/renderer mismatch is found once rather
+// than as forty confusing behavioural failures.
+//
+//   npm run preview
+//   node scripts/ui-smoke-5f.mjs [--shots=DIR]
+import { chromium } from 'playwright-core';
+import { readFileSync, mkdirSync } from 'node:fs';
+
+const BASE = process.env.BASE || 'http://localhost:4173';
+const SHOTS = (process.argv.find(a => a.startsWith('--shots=')) || '').split('=')[1] || null;
+if (SHOTS) mkdirSync(SHOTS, { recursive: true });
+
+const CHAPTERS = {
+  chapt_6: JSON.parse(readFileSync('src/data/chapt-06.json', 'utf8')),
+  chapt_7: JSON.parse(readFileSync('src/data/chapt-07.json', 'utf8')),
+  chapt_8: JSON.parse(readFileSync('src/data/chapt-08.json', 'utf8'))
+};
+const SECTIONS = ['learn', 'drill', 'exercise', 'quickReview'];
+const activityById = (chapter, id) => {
+  for (const section of SECTIONS) {
+    const hit = (chapter[section] || []).find(a => a.id === id);
+    if (hit) return { ...hit, section };
+  }
+  return null;
+};
+
+const results = [];
+const check = (name, ok, detail = '') => {
+  results.push({ name, ok: !!ok, detail });
+  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
+};
+
+const LAUNCH = { args: ['--autoplay-policy=no-user-gesture-required'] };
+async function launchBrowser() {
+  const explicit = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
+  if (explicit) return chromium.launch({ ...LAUNCH, executablePath: explicit });
+  try { return await chromium.launch(LAUNCH); } catch (original) {
+    for (const channel of ['chrome', 'msedge']) {
+      try { return await chromium.launch({ ...LAUNCH, channel }); } catch { /* keep looking */ }
+    }
+    throw original;
+  }
+}
+
+const browser = await launchBrowser();
+// 380px is the viewport the spec's walkthrough is specified at.
+const context = await browser.newContext({ viewport: { width: 380, height: 900 } });
+const page = await context.newPage();
+let pageErrors = [];
+page.on('pageerror', e => pageErrors.push(String(e.message || e)));
+page.on('console', m => { if (m.type() === 'error') pageErrors.push(m.text()); });
+
+let nav = 0;
+const go = async hash => {
+  pageErrors = [];
+  await page.goto(`${BASE}/?run=${++nav}${hash}`, { waitUntil: 'load' });
+  await page.waitForSelector('.card', { timeout: 15000 }).catch(() => {});
+  await page.evaluate(() => document.fonts.ready);
+  await page.waitForTimeout(120);
+};
+
+const PLACEHOLDER = /pending (content )?verification|renderer needs updating|Unsupported content block|extraction pending|arrives in a later phase|missing lemma/i;
+
+let stops = 0;
+for (const [chapterId, chapter] of Object.entries(CHAPTERS)) {
+  const sequence = chapter.sequence || [];
+  check(`${chapterId}: sequence lists every activity exactly once`,
+    sequence.length === SECTIONS.reduce((n, s) => n + (chapter[s] || []).length, 0)
+      && new Set(sequence).size === sequence.length
+      && sequence.every(id => !!activityById(chapter, id)),
+    `${sequence.length} in sequence, ${SECTIONS.reduce((n, s) => n + (chapter[s] || []).length, 0)} activities`);
+
+  for (const [index, activityId] of sequence.entries()) {
+    const activity = activityById(chapter, activityId);
+    await go(`#/activity/${chapterId}/${activityId}`);
+    stops += 1;
+    const cards = await page.locator('.card').count();
+    const body = await page.locator('.app-main, body').first().innerText();
+    const placeholder = PLACEHOLDER.test(body) ? (body.match(PLACEHOLDER) || [''])[0] : null;
+    // Nothing may pan sideways at 380px (A3).
+    const overflow = await page.evaluate(() =>
+      document.documentElement.scrollWidth - document.documentElement.clientWidth);
+    if (SHOTS) {
+      await page.screenshot({
+        path: `${SHOTS}/${chapterId.replace('chapt_', 'ch')}-${String(index + 1).padStart(2, '0')}-${activityId}.png`,
+        fullPage: true
+      });
+    }
+    check(`${chapterId} ${index + 1}/${sequence.length} ${activityId} (${activity.section}/${activity.mode || activity.type}) renders`,
+      cards > 0 && !placeholder && !pageErrors.length && overflow <= 0,
+      [cards ? '' : 'no card', placeholder ? `placeholder "${placeholder}"` : '',
+       pageErrors.length ? `errors: ${pageErrors.slice(0, 2).join(' | ')}` : '',
+       overflow > 0 ? `${overflow}px of horizontal overflow` : ''].filter(Boolean).join('; '));
+  }
+}
+
+await browser.close();
+const failed = results.filter(r => !r.ok);
+console.log(`\n${results.length - failed.length}/${results.length} smoke checks passed over ${stops} rail stops`);
+if (failed.length) { console.log(failed.map(f => ` FAIL ${f.name} — ${f.detail}`).join('\n')); process.exit(1); }
diff --git a/src/app.css b/src/app.css
index 1a3c99e..0abf0ec 100644
--- a/src/app.css
+++ b/src/app.css
@@ -810,6 +810,10 @@ button { font: inherit; cursor: pointer; }
   gap: 4px 12px; width: 100%; background: transparent; border: none; padding: 2px 0 10px; }
 .pg-lemma-greek { font-size: 1.7rem; color: var(--link); }
 .pg-lemma-gloss { color: var(--teal-dark); font-size: 0.95rem; }
+/* Chapter 7 sets its headword as an equation, "ἀγαθός = good". */
+.pg-lemma-eq { color: var(--teal-dark); font-size: 0.95rem; }
+/* Directive 8: a lemma with no clip of its own is ink, not link blue. */
+.pg-lemma.silent .pg-lemma-greek { color: var(--ink); }
 .pg-grid { display: flex; flex-direction: column; }
 .paradigm { --pg-label-col: 1.6em; --pg-gap: 6px; }
 .paradigm.pg-case-labels { --pg-label-col: 3.25em; }
@@ -1154,3 +1158,103 @@ button, a, input, select, textarea, label,
 .app, .app-main { overflow-x: hidden; }
 .scroll-area { overflow-x: hidden; }
 .sidebar { overflow-x: hidden; min-width: 0; }
+
+/* ================= 5F: chapters 6, 7 and 8 ================= */
+
+/* ---- §2.1 the Prepositions Chart: a DIAGRAM, not a table ----
+   Sized to the phone viewport, so the whole arrangement is legible at 380px
+   without panning (A3). The arrangement is pedagogy: arrows point into, out of,
+   over and through the circle that ἐν sits in. */
+.prep-chart { margin: 6px 0 2px; }
+.prep-svg { display: block; width: 100%; max-width: 340px; height: auto; margin: 0 auto; }
+.prep-circle { fill: none; stroke: var(--teal-dark); stroke-width: 2; }
+.prep-arrow { fill: none; stroke: var(--ink); stroke-width: 1.6; }
+.prep-svg #prep-arrow path, .prep-svg marker path { fill: var(--ink); stroke: none; }
+/* Greek-tap rule (directive 9): every label plays its own clip, so every label
+   is blue. The gloss under it is ink. */
+.prep-node { cursor: pointer; }
+.prep-node:active { opacity: 0.6; }
+.prep-greek { font-size: 17px; fill: var(--link); }
+.prep-gloss { font-size: 10.5px; fill: var(--teal-dark); }
+.prep-centre .prep-greek { font-size: 19px; }
+.prep-extra { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 8px; }
+.prep-extra-node { background: transparent; border: none; color: var(--link);
+  display: flex; flex-direction: column; align-items: center; gap: 2px; }
+
+/* ---- §2.2 full-page popups ----
+   The link is blue because it is tappable (directive 8) and underlined because
+   the original underlines it; the popup itself is the original's green page. */
+.popup-link { background: transparent; border: none; padding: 0; font: inherit;
+  color: var(--link); text-decoration: underline; cursor: pointer; text-align: left; }
+.popup-link:active { opacity: 0.6; }
+.popup-sheet { background: #f2f7ef; }
+.popup-head { font-size: 2.1rem; text-align: center; width: 100%; }
+.popup-title { margin: 4px 0 8px; font-size: 1.15rem; text-align: center; color: var(--teal-dark); }
+.popup-gloss, .popup-condition { text-align: center; color: var(--ink); margin: 2px 0; }
+.popup-condition { font-size: 0.92rem; color: var(--teal-dark); }
+.popup-senses { margin: 8px 0 4px; }
+.popup-sense { text-align: center; color: var(--ink); margin: 2px 0; }
+.popup-examples { margin-top: 10px; display: flex; flex-direction: column; gap: 12px; }
+.popup-example { border-top: 1px solid rgba(0,0,0,0.08); padding-top: 10px; }
+.popup-example-greek { display: block; width: 100%; background: transparent; border: none;
+  padding: 0; text-align: center; font-size: 1.3rem; color: var(--link); cursor: pointer;
+  overflow-wrap: anywhere; }
+.popup-example-greek:disabled { color: var(--ink); }
+.popup-example-greek:active { opacity: 0.6; }
+.popup-example-gloss { text-align: center; color: var(--teal-dark); font-size: 0.95rem; margin-top: 3px; }
+.popup-example-ref { text-align: center; color: var(--ink); font-size: 0.8rem; opacity: 0.75; margin-top: 2px; }
+
+/* ---- §2.3 greekRows extensions ---- */
+/* Sense rows: the headword, then one line per sense — gloss (the link) plus
+   its case tag in plain ink. */
+.rc-greekrows .rc-sense-row { grid-template-columns: minmax(4.5em, 34%) minmax(0, 1fr); }
+.rc-senses { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
+.rc-sense { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px; }
+.rc-sense-gloss { color: var(--teal-dark); }
+.rc-casetag { color: var(--ink); font-size: 0.85rem; opacity: 0.8; }
+/* A parenthesised derivation row (the Elision page). */
+.rc-bracket-mark { color: var(--ink); font-size: 1.2rem; }
+/* A row's scripture citation drops to its own line under the row rather than
+   claiming a grid column, so the two-column gloss layouts keep their rhythm. */
+.rc-greekref { grid-column: 1 / -1; color: var(--ink); font-size: 0.78rem; opacity: 0.75; }
+/* A worked verse example set over up to two lines: one tap target, one clip. */
+.rc-verse-greek { display: block; width: 100%; background: transparent; border: none;
+  padding: 0; text-align: left; color: var(--link); font-size: 1.2rem; cursor: pointer; }
+.rc-verse-greek:disabled { color: var(--ink); }
+.rc-verse-line { display: block; overflow-wrap: anywhere; }
+
+/* ---- §2.5 the note beside a prompt ----
+   ON THE PROMPT'S LINE, plain ink, smaller, and NEVER blue: it is not tappable
+   even when it holds Greek (the logged exception to directive 9). The original
+   sets "pros (to)", "epi (with dat.)", "good (acc. pl. masc.)" and
+   "I (nom sg)" as one line, so the port does too; the note is a SIBLING of the
+   prompt's button, never inside it, so it can never speak. */
+.prompt-row { display: flex; flex-wrap: wrap; align-items: baseline;
+  justify-content: center; gap: 8px; }
+.prompt-row .prompt { width: auto; padding-right: 0; }
+.prompt-row.with-note .prompt { padding-left: 0; }
+.prompt-note { color: var(--ink); font-size: 0.85rem; opacity: 0.85; }
+.prompt-note.standalone { display: block; text-align: center; margin: -8px 0 2px; }
+.spell-prompt-note { color: var(--ink); font-size: 0.8rem; opacity: 0.85;
+  margin-left: 0.4em; white-space: nowrap; }
+
+/* ---- §2.7 two-line Greek prompts ---- */
+.prompt.two-line { font-size: 1.7rem; line-height: 1.3; padding: 12px 10px; }
+.prompt-line2 { display: block; }
+
+/* ---- §2.8 the pronoun paradigm ---- */
+.pronoun-paradigm .pp-gender { text-align: center; color: var(--accent-ink);
+  font-weight: 700; margin-bottom: 4px; }
+.pronoun-paradigm .pg-cell { align-items: flex-start; text-align: left; }
+
+/* ---- §2.9 the two-stage case drill ----
+   One grid per stage, BOTH live from the start: the original draws the case
+   grid identically before and after the person click (ch8railwalk p8). What
+   holds the pair together is the commit rule, not a disabled control. */
+.stage-grid { margin-bottom: 10px; }
+.stage-grid .tile:disabled { cursor: default; }
+
+/* ---- the Singular / Plural band inside a paradigm that runs both down one
+   column (chapter 7's Review Adjectives Paradigm) ---- */
+.pg-numberband { grid-column: 1 / -1; text-align: right; padding: 6px 6px 2px;
+  color: var(--accent-ink); font-weight: 700; font-size: 0.85rem; }
diff --git a/src/components/ContentAudio.svelte b/src/components/ContentAudio.svelte
index a2b7e19..919f3e5 100644
--- a/src/components/ContentAudio.svelte
+++ b/src/components/ContentAudio.svelte
@@ -8,15 +8,30 @@
   // panels; their per-mode data contracts are documented in HANDOFF-4 §5 (B1).
   import { onDestroy } from 'svelte';
   import { slide } from 'svelte/transition';
-  import { getGreekTapMap, resolveItems, shuffle } from '../lib/content.js';
+  import { chapterAudioMap, getGreekTapMap, resolveItems, shuffle } from '../lib/content.js';
   import { play, stop as stopAudio } from '../lib/audio.js';
   import { markCompleted } from '../lib/progress.js';
+  import { providePopups } from '../lib/popups.js';
   import RichContent from './RichContent.svelte';
   import ArrowCue from './ArrowCue.svelte';
   import Paradigm from './Paradigm.svelte';
+  import PronounParadigm from './PronounParadigm.svelte';
+  import PopupSheet from './PopupSheet.svelte';
   export let chapter;
   export let activity;
 
+  // FULL-PAGE POPUPS (5F §2.2). The register goes down by context so a link
+  // nested anywhere in the topic content can open one; the SHEET is rendered
+  // here, over the whole activity, because that is what the original does.
+  // Opening one stops whatever the page underneath was saying (rule A4).
+  let openPopupPage = null;
+  providePopups(activity.popups, popup => { stopAudio(); openPopupPage = popup; });
+
+  // Form -> clip for the chapter's non-lemma inflected forms (chapter 8's
+  // pronoun charts). Chapter-wide, so a Quick Review chart taps the same clips
+  // the Learn page does.
+  $: formAudio = chapterAudioMap(chapter);
+
   // Items resolve from the data; activities flagged order:"shuffled"
   // (Pronounce Letters Exercise) get a fresh Fisher-Yates shuffle each visit.
   // applyOrder is a plain helper fed reactive values as arguments so it never
@@ -67,6 +82,20 @@
     ? getGreekTapMap(chapter.id)
     : activity.greekTaps;
 
+  // paradigmChart: one chart, or a More/Back stack of them (5F §2.8). Same
+  // exit rule as a topic switch — stepping between charts stops whatever the
+  // last one started (rule A4).
+  let paradigmIndex = 0;
+  $: paradigmPages = Array.isArray(activity.paradigms) && activity.paradigms.length
+    ? activity.paradigms
+    : (activity.paradigm ? [activity.paradigm] : []);
+  function goToParadigm(index) {
+    const next = Math.max(0, Math.min(paradigmPages.length - 1, index));
+    if (next === paradigmIndex) return;
+    stopAudio();
+    paradigmIndex = next;
+  }
+
   // Learn Vocabulary flashcard visibility (A15). Segmented radio: Show Both /
   // Hide Greek / Hide English. A hidden pane blanks until tapped (per-card
   // reveal) or the mode changes. Persists across cards within the session
@@ -176,6 +205,7 @@
       <RichContent
         blocks={currentTopic.content || []}
         suppressTitle={currentTopic.title}
+        audioMap={formAudio}
         greekTaps={currentTopic.greekTaps === true
           ? getGreekTapMap(chapter.id)
           : (currentTopic.greekTaps || activityGreekTaps)} />
@@ -194,9 +224,44 @@
 {:else if mode === 'paradigmChart'}
   <!-- Quick Review's full-page paradigm: the same chart the Learn topic and
        the drill Hint render, with the chart title above it. The Endings button
-       simply isn't there when the data omits the endings block. -->
+       simply isn't there when the data omits the endings block.
+       5F: an activity may ship SEVERAL charts as `paradigms[]` (chapter 8's
+       third person: Masculine, then More to Feminine, then More to Neuter,
+       with Back stepping down) and may carry its Say Whole action beside the
+       chart rather than inside it. -->
   <div class="card">
-    <Paradigm paradigm={activity.paradigm || {}} title={activity.chartTitle} />
+    {#if paradigmPages.length}
+      {@const page = paradigmPages[paradigmIndex] || paradigmPages[0]}
+      {#if page.type === 'pronounParadigm'}
+        <PronounParadigm paradigm={page} audioMap={formAudio}
+                         title={activity.chartTitle || page.title} />
+      {:else}
+        <Paradigm paradigm={page} title={activity.chartTitle || null} />
+      {/if}
+      <!-- Paradigm draws its OWN sayWhole; PronounParadigm does not. Adding
+           one here unconditionally printed "Say Whole List" twice on the εἰμί
+           chart, whose action lives inside the chart. -->
+      {@const sayWhole = page.type === 'pronounParadigm'
+        ? (page.sayWhole || activity.sayWhole)
+        : (page.sayWhole ? null : activity.sayWhole)}
+      {#if sayWhole || paradigmPages.length > 1}
+        <div class="controls pg-actions">
+          {#if sayWhole}
+            <button class="btn secondary pg-say-whole" on:click={() => play(sayWhole.audio)}>{sayWhole.label || 'Say Whole Paradigm'}</button>
+          {/if}
+          {#if paradigmIndex > 0}
+            <button class="btn secondary pg-switch pg-switch-back" data-paradigm-switch="back"
+                    on:click={() => goToParadigm(paradigmIndex - 1)}>Back</button>
+          {/if}
+          {#if paradigmIndex < paradigmPages.length - 1}
+            <button class="btn secondary pg-switch pg-switch-more" data-paradigm-switch="more"
+                    on:click={() => goToParadigm(paradigmIndex + 1)}>More</button>
+          {/if}
+        </div>
+      {/if}
+    {:else}
+      <div class="pending-verification">Chart content pending verification.</div>
+    {/if}
   </div>
 
 {:else if mode === 'interlinearVerse'}
@@ -225,7 +290,7 @@
 {:else if mode === 'textPage'}
   {#if activity.content}
     <div class="card">
-      <RichContent blocks={activity.content} greekTaps={activityGreekTaps} />
+      <RichContent blocks={activity.content} greekTaps={activityGreekTaps} audioMap={formAudio} />
       {#if activity.playButton}
         <div class="controls">
           <button class="btn" on:click={() => play(activity.playButton.audio)}>▶ {activity.playButton.label}</button>
@@ -483,3 +548,10 @@
     {#if activity.content}<div class="rc-below"><RichContent blocks={activity.content} /></div>{/if}
   </div>
 {/if}
+
+{#if openPopupPage}
+  <!-- The original's full-screen green reference page, over whatever teaching
+       surface opened it. Cancel comes back; nothing about the page underneath
+       moves while it is open. -->
+  <PopupSheet popup={openPopupPage} on:close={() => (openPopupPage = null)} />
+{/if}
diff --git a/src/components/Marked.svelte b/src/components/Marked.svelte
index a46dd35..d611401 100644
--- a/src/components/Marked.svelte
+++ b/src/components/Marked.svelte
@@ -8,10 +8,21 @@
   // original's deliberate enlargement (5B-SPEC2 B1). The mark span carries the
   // speller keyboard's font path -- those tiles are the one surface confirmed
   // on device to render the circumflex correctly.
+  //
+  // 5F §2.2: an underlined run whose slug names one of the host activity's
+  // popups IS the link that opens it — chapter 8's Three Uses page underlines
+  // "As a pronoun", "Reflexive Intensifier" and 'Adjective meaning "same"',
+  // whose popup ids are exactly those slugs. A run that matches nothing stays
+  // an ordinary underline, which is what keeps the "he himself will get the
+  // car" emphasis on the same page from turning into a dead link.
   import { splitUnderline, splitMarkGroups } from '../lib/markup.js';
   import { ISOLATED_MARKS, spacingMarks } from '../lib/greek.js';
+  import { usePopups, popupFor } from '../lib/popups.js';
   export let text = '';
 
+  const popups = usePopups();
+  const linked = run => (popups ? popupFor(popups, run) : null);
+
   const GREEK_LETTER = /[Ͱ-Ͽἀ-῿]/;
   // A group's inner text is a MARK (enlarge, keyboard font), a Greek letter
   // (Greek font, mild bump) or ordinary punctuation (grouped, left as is).
@@ -22,4 +33,4 @@
   }
 </script>
 
-{#each splitUnderline(text) as seg}{#if seg.u}<u>{seg.t}</u>{:else if seg.g}<span class="term-green">{seg.t}</span>{:else if seg.i}<em>{seg.t}</em>{:else}{#each splitMarkGroups(seg.t) as part}{#if part.group != null}<span class="mark-group">(&thinsp;<span class="isolated-mark" class:as-mark={kindOf(part.group) === 'mark'} class:greek={kindOf(part.group) === 'greek'}>{spacingMarks(part.group)}</span>&thinsp;)</span>{:else}{part.t}{/if}{/each}{/if}{/each}
+{#each splitUnderline(text) as seg}{#if seg.u}{@const popup = linked(seg.t)}{#if popup}<button class="popup-link underline-link" on:click={() => popups.open(popup)}>{seg.t}</button>{:else}<u>{seg.t}</u>{/if}{:else if seg.g}<span class="term-green">{seg.t}</span>{:else if seg.i}<em>{seg.t}</em>{:else}{#each splitMarkGroups(seg.t) as part}{#if part.group != null}<span class="mark-group">(&thinsp;<span class="isolated-mark" class:as-mark={kindOf(part.group) === 'mark'} class:greek={kindOf(part.group) === 'greek'}>{spacingMarks(part.group)}</span>&thinsp;)</span>{:else}{part.t}{/if}{/each}{/if}{/each}
diff --git a/src/components/Paradigm.svelte b/src/components/Paradigm.svelte
index 0022ab2..3635b69 100644
--- a/src/components/Paradigm.svelte
+++ b/src/components/Paradigm.svelte
@@ -35,6 +35,15 @@
     ? paradigm.charts
     : [paradigm || {}];
   $: chart = charts[chartIndex] || charts[0] || {};
+  // TWO LEMMA SHAPES. Chapters 4 and 5 ship an object ({greek, gloss, audio});
+  // chapter 7 ships the headword as a bare STRING with the gloss beside it on
+  // the chart ("lemma": "ἀγαθός", "gloss": "good"), which printed the lemma
+  // line as "undefined" until the rail-walk comparison caught it. Normalized
+  // here so the template has one shape, and the data stays as delivered.
+  $: lemmaIsEquation = typeof chart.lemma === 'string';
+  $: lemma = lemmaIsEquation
+    ? { greek: chart.lemma, gloss: chart.gloss || null, audio: null }
+    : chart.lemma;
   $: columns = chart.columns || [];
   $: columnAudio = chart.columnAudio || [];
   $: columnGroups = chart.columnGroups || [];
@@ -42,8 +51,15 @@
   $: showGlosses = chart.showGlosses !== false;
   $: hasCaseLabels = rows.some(row => row.label != null);
   $: hasLongCaseLabels = rows.some(row => String(row.label || '').length > 5);
+  // How long a form has to be before the cells need shrinking depends on how
+  // many columns share the width. Two columns tolerate a nine-letter form;
+  // THREE do not — chapter 7's adjective paradigm sets ἀγαθῶν, ἀγαθοῖς and
+  // ἀγαθούς three abreast and broke each of them across two lines at 380px
+  // (rail-walk comparison against ch7railwalk p14). Chapter 5's three-column
+  // article chart holds forms of three and four letters and is untouched.
+  $: formLimit = columns.length >= 3 ? 5 : 7;
   $: hasLongForms = hasCaseLabels && rows.some(row => (row.cells || [])
-    .some(cell => [...String(cell.greek || '')].length > 7));
+    .some(cell => [...String(cell.greek || '')].length > formLimit));
   // Endings rows are flat [ending, gloss, ending, gloss] tuples -- one pair per
   // number column, so the popup lines up with the chart above it.
   $: endingRows = (chart.endings && chart.endings.rows) || [];
@@ -66,6 +82,11 @@
   }
 
   function onKeydown(e) { if (e.key === 'Escape') endingsOpen = false; }
+
+  // The authored number code spelled the way the original prints it. Anything
+  // else is printed as authored rather than guessed at.
+  const NUMBER_LABELS = { s: 'Singular', p: 'Plural' };
+  const numberLabel = value => NUMBER_LABELS[value] || value;
 </script>
 
 <svelte:window on:keydown={endingsOpen ? onKeydown : null} />
@@ -82,12 +103,20 @@
   {#key chart}
     {#if title}<div class="pg-title">{title}</div>{/if}
 
-    {#if chart.lemma}
-      <button class="pg-lemma" on:click={() => chart.lemma.audio && play(chart.lemma.audio)}>
-        <span class="greek pg-lemma-greek">{chart.lemma.greek}</span>
+    {#if lemma}
+      <!-- Blue means tappable and only tappable (directive 8): a lemma with no
+           clip of its own renders in ink, not in link blue. -->
+      <button class="pg-lemma" class:silent={!lemma.audio}
+              disabled={!lemma.audio}
+              on:click={() => lemma.audio && play(lemma.audio)}>
+        <span class="greek pg-lemma-greek">{lemma.greek}</span>
         <!-- showGlosses controls the inflected row cells. The original keeps
-             the lemma's identifying gloss in both Learn and Review charts. -->
-        {#if chart.lemma.gloss}<span class="pg-lemma-gloss">{chart.lemma.gloss}</span>{/if}
+             the lemma's identifying gloss in both Learn and Review charts, and
+             sets it as "ἀγαθός = good". -->
+        <!-- The "=" is chapter 7's own typography and rides on chapter 7's own
+             data shape. Chapters 4 and 5 ship the object form and their lemma
+             line is device-verified as it stands; nothing there moves. -->
+        {#if lemma.gloss}{#if lemmaIsEquation}<span class="pg-lemma-eq">=</span>{/if}<span class="pg-lemma-gloss">{lemma.gloss}</span>{/if}
       </button>
     {/if}
 
@@ -124,6 +153,15 @@
         </div>
       {/if}
       {#each rows as row, rowIndex}
+        <!-- 5F: a chart whose rows run singular THEN plural down one column
+             legends each block with its number, exactly where the number
+             changes — chapter 7's Review Adjectives Paradigm prints
+             "Singular" beside its N. row and "Plural" beside its N.V. row
+             (ch7railwalk p14). Only chapter 7 authors `number`, so no earlier
+             chart moves. -->
+        {#if row.number != null && row.number !== rows[rowIndex - 1]?.number}
+          <div class="pg-numberband" data-number={row.number}>{numberLabel(row.number)}</div>
+        {/if}
         <div class="pg-row" data-row-index={rowIndex}>
           <span class="pg-person pg-row-label">{row.label ?? row.person ?? ''}</span>
           {#each row.cells || [] as cell, cellIndex}
diff --git a/src/components/PopupSheet.svelte b/src/components/PopupSheet.svelte
new file mode 100644
index 0000000..570e28c
--- /dev/null
+++ b/src/components/PopupSheet.svelte
@@ -0,0 +1,68 @@
+<script>
+  // One popup page (5F §2.2), rendered as the original's full-screen green
+  // sheet with a Cancel control. Three chapters share it:
+  //
+  //   chapter 6  a preposition: headword, its sense lines, three worked
+  //              examples with references.
+  //   chapter 7  οὐ / οὐκ / οὐχ: headword, gloss, the condition it applies
+  //              under, two examples.
+  //   chapter 8  the three uses of αὐτός: a title and three, two and two
+  //              examples (no Greek headword of its own).
+  //
+  // Greek-tap rule (directive 9): the headword and EVERY example phrase play
+  // their own clip. Glosses and references are ink.
+  import { play, stop as stopAudio } from '../lib/audio.js';
+  import Marked from './Marked.svelte';
+  import { createEventDispatcher, onDestroy } from 'svelte';
+  export let popup;
+
+  const dispatch = createEventDispatcher();
+  // A4: leaving the sheet stops whatever it started. Closing is an exit like
+  // any other, so it goes through one place.
+  function close() { stopAudio(); dispatch('close'); }
+  function onKeydown(e) { if (e.key === 'Escape') { e.preventDefault(); close(); } }
+  onDestroy(() => stopAudio());
+</script>
+
+<svelte:window on:keydown={onKeydown} />
+
+<div class="modal-overlay popup-overlay" on:click|self={close} role="presentation">
+  <div class="modal popup-sheet" role="dialog" aria-modal="true"
+       aria-label={popup.title || popup.greek || 'Reference'}
+       data-popup-id={popup.id}>
+    <div class="modal-scroll">
+      {#if popup.greek}
+        <button class="popup-head greek greek-say" on:click={() => popup.audio && play(popup.audio)}>{popup.greek}</button>
+      {/if}
+      {#if popup.title}<h2 class="popup-title">{popup.title}</h2>{/if}
+      {#if popup.gloss}<div class="popup-gloss"><Marked text={popup.gloss} /></div>{/if}
+      {#if popup.condition}<div class="popup-condition"><Marked text={popup.condition} /></div>{/if}
+
+      {#if popup.senses && popup.senses.length}
+        <div class="popup-senses">
+          {#each popup.senses as sense}
+            <div class="popup-sense"><Marked text={typeof sense === 'string' ? sense : (sense.gloss || '')} /></div>
+          {/each}
+        </div>
+      {/if}
+
+      {#if popup.examples && popup.examples.length}
+        <div class="popup-examples">
+          {#each popup.examples as example, index}
+            <div class="popup-example" data-example-index={index}>
+              <button class="popup-example-greek greek greek-say"
+                      disabled={!example.audio}
+                      on:click={() => example.audio && play(example.audio)}>{example.greek}</button>
+              {#if example.gloss}<div class="popup-example-gloss"><Marked text={example.gloss} /></div>{/if}
+              {#if example.ref}<div class="popup-example-ref">{example.ref}</div>{/if}
+            </div>
+          {/each}
+        </div>
+      {/if}
+    </div>
+    <div class="modal-actions">
+      <!-- svelte-ignore a11y-autofocus -->
+      <button class="btn" autofocus on:click={close}>Cancel</button>
+    </div>
+  </div>
+</div>
diff --git a/src/components/PrepositionsChart.svelte b/src/components/PrepositionsChart.svelte
new file mode 100644
index 0000000..ed5c2f7
--- /dev/null
+++ b/src/components/PrepositionsChart.svelte
@@ -0,0 +1,127 @@
+<script>
+  // THE PREPOSITIONS CHART (5F §2.1). Chapter 6 draws its ten prepositions as
+  // a DIAGRAM, not a table: ἐν sits in a circle at the centre and the other
+  // nine stand around it, each with an arrow showing the direction of motion
+  // its case implies. The arrangement IS the pedagogy (standing directive 2) —
+  // "out of" points away from the circle, "into" points at it, "through" runs
+  // across it — so the geometry is reconstructed rather than flattened.
+  //
+  // It is NOT a pixel copy of the original's 1990s line art. The goal is a
+  // clean, legible diagram inside a 380px phone viewport; the spec says so
+  // explicitly. The same block renders as a Learn topic and as the Review
+  // Prepositions Chart, from one component, so the two can never disagree.
+  //
+  // Greek-tap rule (directive 9): every Greek label plays its own clip. The
+  // gloss under it is ink.
+  //
+  // LAYOUT. Nine slots on a 320x320 user-space grid plus the centre. The slot
+  // names are the data's (topLeft, top, topRight, left, right, lowerLeft,
+  // lowerRight, bottomLeft, bottomRight); an unknown slot still renders, in a
+  // spare row below the diagram, rather than vanishing.
+  import { play } from '../lib/audio.js';
+  export let block;
+  // The heading the HOST already printed (topicPages prints the topic title,
+  // which for this block is also "Prepositions Chart"). Same rule as
+  // Paradigm's: the data is not ours to edit, so the renderer declines to say
+  // it twice.
+  export let title = null;
+
+  const SIZE = 320;
+  const CX = SIZE / 2;
+  const CY = 150;
+  const R = 40;                                  // the ἐν circle
+
+  // x/y is the label ANCHOR; the arrow runs between `from` and `to`.
+  const SLOTS = {
+    topLeft:     { x: 46,  y: 28,  anchor: 'start'  },
+    top:         { x: 160, y: 20,  anchor: 'middle' },
+    topRight:    { x: 274, y: 28,  anchor: 'end'    },
+    left:        { x: 20,  y: 118, anchor: 'start'  },
+    right:       { x: 300, y: 118, anchor: 'end'    },
+    lowerLeft:   { x: 20,  y: 196, anchor: 'start'  },
+    lowerRight:  { x: 300, y: 196, anchor: 'end'    },
+    bottomLeft:  { x: 46,  y: 286, anchor: 'start'  },
+    bottomRight: { x: 274, y: 286, anchor: 'end'    },
+    centre:      { x: CX,  y: CY,  anchor: 'middle' }
+  };
+
+  // Arrow paths, per slot and arrow kind. "in" points at the circle, "out"
+  // away from it, "over" arcs above it, "across" runs through it, "down"
+  // drives into it from below, "curveIn" is περί's encircling sweep.
+  const ARROWS = {
+    topLeft:     { curveIn: 'M 92 46 A 78 78 0 0 1 150 108', in: 'M 92 46 L 138 96', out: 'M 138 96 L 92 46' },
+    top:         { over: 'M 118 62 A 62 62 0 0 1 202 62', in: 'M 160 44 L 160 104', out: 'M 160 104 L 160 44' },
+    topRight:    { in: 'M 228 46 L 182 96', out: 'M 182 96 L 228 46' },
+    left:        { in: 'M 74 132 L 116 145', out: 'M 116 145 L 74 132' },
+    right:       { in: 'M 246 132 L 204 145', out: 'M 204 145 L 246 132' },
+    lowerLeft:   { in: 'M 74 190 L 116 162', out: 'M 116 162 L 74 190' },
+    lowerRight:  { in: 'M 246 190 L 204 162', out: 'M 204 162 L 246 190' },
+    bottomLeft:  { across: 'M 74 268 L 250 118', in: 'M 92 262 L 138 200', out: 'M 138 200 L 92 262' },
+    bottomRight: { down: 'M 250 268 L 176 190', in: 'M 228 262 L 182 200', out: 'M 182 200 L 228 262' }
+  };
+
+  $: nodes = block.nodes || [];
+  $: centre = nodes.find(n => n.slot === 'centre') || null;
+  $: placed = nodes.filter(n => n.slot !== 'centre' && SLOTS[n.slot]);
+  // A slot the layout does not know still has to reach the learner.
+  $: unplaced = nodes.filter(n => n.slot !== 'centre' && !SLOTS[n.slot]);
+
+  const slotOf = node => SLOTS[node.slot];
+  const arrowOf = node => (ARROWS[node.slot] || {})[node.arrow] || null;
+  // The gloss sits one line under the Greek, on the label's own anchor.
+  const glossY = node => slotOf(node).y + 17;
+</script>
+
+<div class="prep-chart">
+  {#if title}<div class="rc-heading">{title}</div>{/if}
+  <svg
+    class="prep-svg"
+    viewBox="0 0 {SIZE} {SIZE}"
+    role="group"
+    aria-label={block.title || 'Prepositions chart'}>
+    <defs>
+      <marker id="prep-arrow" viewBox="0 0 10 10" refX="9" refY="5"
+              markerWidth="6" markerHeight="6" orient="auto-start-reverse">
+        <path d="M 0 0 L 10 5 L 0 10 z" />
+      </marker>
+    </defs>
+
+    {#each placed as node}
+      {@const d = arrowOf(node)}
+      {#if d}<path class="prep-arrow" d={d} marker-end="url(#prep-arrow)" />{/if}
+    {/each}
+
+    <circle class="prep-circle" cx={CX} cy={CY} r={R} />
+
+    {#if centre}
+      <!-- Greek-tap rule: the centre word pronounces itself like every other. -->
+      <g class="prep-node prep-centre" role="button" tabindex="0"
+         on:click={() => centre.audio && play(centre.audio)}
+         on:keydown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); centre.audio && play(centre.audio); } }}>
+        <text class="prep-greek greek" x={CX} y={CY - 2} text-anchor="middle">{centre.greek}</text>
+        <text class="prep-gloss" x={CX} y={CY + 16} text-anchor="middle">{centre.gloss}</text>
+      </g>
+    {/if}
+
+    {#each placed as node}
+      {@const slot = slotOf(node)}
+      <g class="prep-node" role="button" tabindex="0"
+         data-slot={node.slot}
+         on:click={() => node.audio && play(node.audio)}
+         on:keydown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); node.audio && play(node.audio); } }}>
+        <text class="prep-greek greek" x={slot.x} y={slot.y} text-anchor={slot.anchor}>{node.greek}</text>
+        <text class="prep-gloss" x={slot.x} y={glossY(node)} text-anchor={slot.anchor}>{node.gloss}</text>
+      </g>
+    {/each}
+  </svg>
+
+  {#if unplaced.length}
+    <div class="prep-extra">
+      {#each unplaced as node}
+        <button class="prep-extra-node" on:click={() => node.audio && play(node.audio)}>
+          <span class="greek">{node.greek}</span><span class="prep-gloss">{node.gloss}</span>
+        </button>
+      {/each}
+    </div>
+  {/if}
+</div>
diff --git a/src/components/PronounParadigm.svelte b/src/components/PronounParadigm.svelte
new file mode 100644
index 0000000..e94cafe
--- /dev/null
+++ b/src/components/PronounParadigm.svelte
@@ -0,0 +1,89 @@
+<script>
+  // PRONOUN PARADIGM (5F §2.8, chapter 8). Four case rows (N./G./D./A.) over a
+  // Singular and a Plural column. It is its own block type because the
+  // pipeline ships each ROW as one line of set text — "ἐγώ I ἡμεῖς we" —
+  // rather than as the {greek, gloss} cells Paradigm.svelte reads, so the two
+  // charts cannot share a data contract even though they share a look.
+  //
+  // SPLITTING THE LINE. The original is column-set: each row is
+  // <singular form> <its gloss> <plural form> <its gloss>. The reliable
+  // boundary is the START OF THE LAST GREEK RUN — the plural form — because a
+  // gloss never contains Greek on any of these twelve rows. Within a cell the
+  // leading Greek run is the form and the remainder is its gloss.
+  //
+  // A KNOWN DATA DEFECT rides on this (reported in 5F-SPEC1-RESULTS §2.8): six
+  // rows of the two Quick Review charts still hold the TBK's untransliterated
+  // Latin for the enclitic forms (mou, moi, me, sou, soi, se) where the Learn
+  // pages carry proper μου, μοι, με, σου, σοι, σε. Those cells therefore have
+  // no Greek run, the split still puts them in the singular column, and they
+  // print exactly as delivered — visibly wrong rather than silently patched,
+  // because the data is not this renderer's to fix.
+  //
+  // Greek-tap rule (directive 9): a cell whose form has a clip in the
+  // chapter's audio map is tappable and plays it.
+  import { play } from '../lib/audio.js';
+  export let paradigm;
+  export let audioMap = {};
+  export let title = null;
+
+  const GREEK_RUN = /[Ͱ-Ͽἀ-῿][Ͱ-Ͽἀ-῿'ʼ]*/gu;
+
+  $: columns = paradigm.columns || ['Singular', 'Plural'];
+  $: rows = (paradigm.rows || []).map(row => ({ label: row.label ?? row.person ?? '', cells: splitRow(row.text) }));
+
+  // [singularCell, pluralCell]; a row that cannot be split renders whole in the
+  // first column rather than being dropped.
+  function splitRow(text) {
+    const line = String(text || '').trim();
+    if (!line) return [cell(''), cell('')];
+    const runs = [...line.matchAll(GREEK_RUN)];
+    if (runs.length < 2) {
+      // Only one Greek run: it opens the PLURAL half (the singular half is the
+      // Latin-carrying defect above) unless the line starts with it.
+      const at = runs.length === 1 ? runs[0].index : -1;
+      if (at > 0) return [cell(line.slice(0, at)), cell(line.slice(at))];
+      return [cell(line), cell('')];
+    }
+    const at = runs[runs.length - 1].index;
+    return [cell(line.slice(0, at)), cell(line.slice(at))];
+  }
+
+  // { greek, gloss }: the leading Greek run is the form, the rest is its gloss.
+  function cell(text) {
+    const trimmed = String(text || '').trim();
+    if (!trimmed) return { greek: '', gloss: '' };
+    GREEK_RUN.lastIndex = 0;
+    const first = GREEK_RUN.exec(trimmed);
+    if (!first || first.index !== 0) return { greek: '', gloss: trimmed };
+    return { greek: first[0], gloss: trimmed.slice(first[0].length).trim() };
+  }
+
+  const clipFor = greek => (greek && audioMap[greek]) || null;
+</script>
+
+<div class="paradigm pronoun-paradigm" data-gender={paradigm.gender || ''}>
+  {#if title}<div class="pg-title">{title}</div>{/if}
+  {#if paradigm.gender}<div class="pp-gender">{paradigm.gender}</div>{/if}
+  <div class="pg-grid" style="--pg-cols:{columns.length}">
+    <div class="pg-head">
+      <span class="pg-person pg-head-spacer">&nbsp;</span>
+      {#each columns as column, columnIndex}
+        <span class="pg-column" data-column-index={columnIndex}>{column}</span>
+      {/each}
+    </div>
+    {#each rows as row, rowIndex}
+      <div class="pg-row" data-row-index={rowIndex}>
+        <span class="pg-person pg-row-label">{row.label}</span>
+        {#each row.cells as c, cellIndex}
+          {@const clip = clipFor(c.greek)}
+          <button class="pg-cell" data-cell-index={cellIndex} disabled={!clip}
+                  on:click={() => clip && play(clip)}>
+            {#if c.greek}<span class="greek pg-greek">{c.greek}</span>{/if}
+            {#if c.gloss}<span class="pg-gloss">{c.gloss}</span>{/if}
+          </button>
+        {/each}
+      </div>
+    {/each}
+  </div>
+  {#if paradigm.note}<div class="pg-note">{paradigm.note}</div>{/if}
+</div>
diff --git a/src/components/RichContent.svelte b/src/components/RichContent.svelte
index c980269..b2b3891 100644
--- a/src/components/RichContent.svelte
+++ b/src/components/RichContent.svelte
@@ -12,10 +12,21 @@
   // the row's clip when present.
   import { play } from '../lib/audio.js';
   import { splitMarkRun } from '../lib/greek.js';
+  import { usePopups, popupFor } from '../lib/popups.js';
   import Marked from './Marked.svelte';
   import Paradigm from './Paradigm.svelte';
+  import PrepositionsChart from './PrepositionsChart.svelte';
+  import PronounParadigm from './PronounParadigm.svelte';
 
   export let blocks = [];
+  // Chapter-wide form -> clip map, for the block types whose cells are not
+  // lexicon lemmas (chapter 8's pronoun charts). Inherited by nested content.
+  export let audioMap = {};
+
+  // The activity's popup register, if its host provided one (5F §2.2).
+  const popups = usePopups();
+  const linkedPopup = ref => popupFor(popups, ref);
+  const openPopup = popup => { if (popups && popup) popups.open(popup); };
   // greekTaps declared once for a whole topic/page, inherited by every block
   // under it. Chapter 3's Learn Verbs page wires λύουσιν, λύουσι and λύω this
   // way: the words sit in running prose across three different topics, and
@@ -136,12 +147,12 @@
   }
 
   function splitTaps(text, taps) {
-    let parts = [{ t: text || '' }];
+    let parts = splitPopupHeadwords(text || '');
     if (!taps) return parts;
     for (const [sub, audio] of Object.entries(taps)) {
       const next = [];
       for (const p of parts) {
-        if (p.audio) { next.push(p); continue; }     // already claimed by another key
+        if (p.audio || p.popup) { next.push(p); continue; }   // already claimed
         // EVERY standalone occurrence, not just the first: two identical Greek
         // words on one page must behave the same way. The Parsing Format topic
         // prints λύω twice, and marking only the first left one blue-and-
@@ -159,6 +170,52 @@
     }
     return parts;
   }
+
+  // A popup whose entry carries a GREEK headword is opened from the NUMBERED
+  // LINE that introduces it. This is what makes chapter 7's οὐ / οὐκ / οὐχ
+  // page reach its three popups: unlike chapter 6, that page ships no popupRef
+  // and no underlined anchor of its own, so there is nothing else to hang the
+  // link on. Longest headword first, so οὐχ is never split by οὐ.
+  //
+  // ONLY the numbered lines, because that is where the original puts the link:
+  // ch7railwalk p7 sets "1) οὐ before a consonant;" as the hot line and leaves
+  // the οὐ in the opening sentence ("οὐ is placed before the word it
+  // negates") as ordinary ink. The same restriction keeps chapter 6's
+  // Proclitics page from turning "ἐν, εἰς and ἐκ are proclitics" into three
+  // links the original does not have. Everywhere else the Greek stays an
+  // ordinary greekTaps audio tap. See DIVERGENCE-LOG D-31.
+  const NUMBERED_LINE = /^\s*\(?\d+[.)]/;
+  function splitPopupHeadwords(text) {
+    if (!popups || !popups.byGreek.length || !NUMBERED_LINE.test(text)) return [{ t: text }];
+    let parts = [{ t: text }];
+    for (const [greek, popup] of popups.byGreek) {
+      const next = [];
+      for (const p of parts) {
+        if (p.popup) { next.push(p); continue; }
+        let rest = p.t;
+        for (let i = standaloneIndexOf(rest, greek); i !== -1; i = standaloneIndexOf(rest, greek)) {
+          if (i > 0) next.push({ t: rest.slice(0, i) });
+          next.push({ t: greek, popup });
+          rest = rest.slice(i + greek.length);
+        }
+        if (rest) next.push({ t: rest });
+      }
+      parts = next;
+    }
+    return parts;
+  }
+
+  // A greekRows row may carry parts[] in TWO shapes. Chapters 4/5 ship objects
+  // ({greek, audio} / {text}); chapter 6 ships plain strings with a parallel
+  // partAudio[] whose null entries are the inert connectors (the "+"). Both
+  // normalize here so the template has one shape to draw.
+  function equationParts(row) {
+    return (row.parts || []).map((part, index) => {
+      if (part && typeof part === 'object') return part;
+      const audio = (row.partAudio || [])[index] || null;
+      return audio ? { greek: String(part), audio } : { text: String(part) };
+    });
+  }
 </script>
 
 <div class="rich">
@@ -180,10 +237,10 @@
            named Greek words in the line tappable; anything not named stays
            plain ink, which is how the λύ and ω MORPHEMES on that same line stay
            untappable — they are fragments with no clip of their own. -->
-      {@const taps = b.greekTaps || greekTaps}
+      {@const taps = (b.greekTaps || greekTaps) || (popups && popups.byGreek.length ? {} : null)}
       <p class="rc-para" class:example-block={isExampleBlock(b)}
          class:rc-strong={b.emphasis === 'strong'} class:rc-indent={b.indent}
-      >{#if taps}{#each splitTaps(b.text, taps) as seg}{#if seg.audio}<button class="greek-tap greek" on:click={() => playAudio(seg.audio)}>{seg.t}</button>{:else}<Marked text={seg.t} />{/if}{/each}{:else}<Marked text={b.text} />{/if}</p>
+      >{#if taps}{#each splitTaps(b.text, taps) as seg}{#if seg.popup}<button class="greek-tap popup-link greek" on:click={() => openPopup(seg.popup)}>{seg.t}</button>{:else if seg.audio}<button class="greek-tap greek" on:click={() => playAudio(seg.audio)}>{seg.t}</button>{:else}<Marked text={seg.t} />{/if}{/each}{:else}<Marked text={b.text} />{/if}</p>
       {#if b.example}
         <button class="rc-example" class:tappable={b.example.audio} on:click={() => playAudio(b.example.audio)}>
           <span class="greek">{b.example.greek}</span>
@@ -199,7 +256,7 @@
         {#each items as it}
           {@const itemTaps = it.greekTaps || greekTaps}
           <li>
-            {#if it.label}{#if selfNum}<span class="rc-num">{it.label}</span>{it.text ? ' ' : ''}{:else if b.labelStyle === 'underline'}<u class="rc-lead-u">{it.label}</u>{joiner(it.text)}{:else if b.labelStyle === 'plain'}<span class="rc-lead-plain">{it.label}</span>{joiner(it.text)}{:else}<span class="rc-lead">{it.label}</span>{it.text ? ' — ' : ''}{/if}{/if}{#if itemTaps}{#each splitTaps(it.text, itemTaps) as seg}{#if seg.audio}<button class="greek-tap greek" on:click={() => playAudio(seg.audio)}>{seg.t}</button>{:else}<Marked text={seg.t} />{/if}{/each}{:else}<Marked text={it.text || ''} />{/if}
+            {#if it.label}{#if selfNum}<span class="rc-num">{it.label}</span>{it.text ? ' ' : ''}{:else if b.labelStyle === 'underline'}<u class="rc-lead-u">{it.label}</u>{joiner(it.text)}{:else if b.labelStyle === 'plain'}<span class="rc-lead-plain">{it.label}</span>{joiner(it.text)}{:else}<span class="rc-lead">{it.label}</span>{it.text ? ' — ' : ''}{/if}{/if}{#if itemTaps}{#each splitTaps(it.text, itemTaps) as seg}{#if seg.popup}<button class="greek-tap popup-link greek" on:click={() => openPopup(seg.popup)}>{seg.t}</button>{:else if seg.audio}<button class="greek-tap greek" on:click={() => playAudio(seg.audio)}>{seg.t}</button>{:else}<Marked text={seg.t} />{/if}{/each}{:else}<Marked text={it.text || ''} />{/if}
             {#if it.example}
               <button class="rc-example" class:tappable={it.example.audio} on:click={() => playAudio(it.example.audio)}>
                 <span class="greek">{it.example.greek}</span>
@@ -306,13 +363,42 @@
             <div class="rc-greekrow rc-english-pair" style={`--greek-cols:${row.parts.length}`}>
               {#each row.parts as part}<span class="rc-english-cell">{part}</span>{/each}
             </div>
+          {:else if row.senses}
+            <!-- 5F \u00a72.3: a preposition and its sense lines. Each sense is a
+                 GLOSS (the link that opens the green page) and a case tag,
+                 which is plain ink. The headword plays its own clip. A row
+                 whose popupRef names nothing still prints its senses; the
+                 gloss simply stays ink rather than becoming a dead link. -->
+            {@const popup = linkedPopup(row.popupRef)}
+            <div class="rc-greekrow rc-sense-row" style="--greek-cols:2">
+              {#if row.audio}
+                <button class="rc-greekword greek greek-say" on:click={() => playAudio(row.audio)}>{row.greek}</button>
+              {:else}
+                <span class="rc-greekword greek">{row.greek}</span>
+              {/if}
+              <span class="rc-senses">
+                {#each row.senses as sense}
+                  <span class="rc-sense">
+                    {#if popup}
+                      <button class="popup-link rc-sense-link" on:click={() => openPopup(popup)}><Marked text={sense.gloss} /></button>
+                    {:else}
+                      <span class="rc-sense-gloss"><Marked text={sense.gloss} /></span>
+                    {/if}
+                    {#if sense.caseTag}<span class="rc-casetag">{sense.caseTag}</span>{/if}
+                  </span>
+                {/each}
+              </span>
+            </div>
           {:else if row.parts}
             <!-- C6: an equation row (\u03b4\u03b9\u03ac + \u03b1\u1f50\u03c4\u03bf\u1fe6 becomes \u03b4\u03b9\u1fbd \u03b1\u1f50\u03c4\u03bf\u1fe6). Each Greek
                  part is its OWN tap target with its own clip; the connecting
-                 words are inert ink. -->
-            <div class="rc-greekrow parts-row" style="--greek-cols:1">
+                 words are inert ink.
+                 5F \u00a72.3: `bracket` parenthesises the whole row \u2014 the Elision
+                 page sets its derivations that way. -->
+            <div class="rc-greekrow parts-row" class:rc-bracket={row.bracket} style="--greek-cols:1">
               <span class="rc-parts">
-                {#each row.parts as part}
+                {#if row.bracket}<span class="rc-bracket-mark">(</span>{/if}
+                {#each equationParts(row) as part}
                   {#if part.greek}
                     {#if part.audio}
                       <button class="rc-part greek greek-say" on:click={() => playAudio(part.audio)}>{part.greek}</button>
@@ -324,7 +410,22 @@
                   {/if}
                 {/each}
                 {#if row.gloss != null && row.gloss !== ''}<span class="rc-greekgloss"><Marked text={row.gloss} /></span>{/if}
+                {#if row.bracket}<span class="rc-bracket-mark">)</span>{/if}
               </span>
+              {#if row.ref}<span class="rc-greekref">{row.ref}</span>{/if}
+            </div>
+          {:else if row.greek2 !== undefined && (b.layout === 'verseExamples' || row.greek2)}
+            <!-- 5F: a worked verse example set over up to two lines, with its
+                 gloss and citation under it. One tap target: the two lines are
+                 one phrase and one clip (chapter 8's Examples page). -->
+            <div class="rc-greekrow rc-verse-example" style="--greek-cols:1">
+              <button class="rc-verse-greek greek greek-say" disabled={!row.audio}
+                      on:click={() => playAudio(row.audio)}>
+                <span class="rc-verse-line">{row.greek}</span>
+                {#if row.greek2}<span class="rc-verse-line">{row.greek2}</span>{/if}
+              </button>
+              {#if row.gloss}<span class="rc-greekgloss"><Marked text={row.gloss} /></span>{/if}
+              {#if row.ref}<span class="rc-greekref">{row.ref}</span>{/if}
             </div>
           {:else}
             {@const cellCount = (row.label ? 1 : 0) + (row.greek ? 1 : 0) + (row.gloss != null && row.gloss !== '' ? 1 : 0)}
@@ -346,6 +447,7 @@
                 {/if}
               {/if}
               {#if row.gloss != null && row.gloss !== ''}<span class="rc-greekgloss"><Marked text={row.gloss} /></span>{/if}
+              {#if row.ref}<span class="rc-greekref">{row.ref}</span>{/if}
             </div>
           {/if}
         {/each}
@@ -358,12 +460,23 @@
            Hint popup on three chapter-3 drills — one renderer, three hosts. -->
       <Paradigm paradigm={b} title={sameTitle(b.title) ? null : b.title} />
 
+    {:else if b.type === 'pronounParadigm'}
+      <!-- 5F §2.8: chapter 8's four-case Singular/Plural pronoun chart. Its
+           own component because its rows are set as one line of text, not as
+           {greek, gloss} cells. -->
+      <PronounParadigm paradigm={b} {audioMap} title={sameTitle(b.title) ? null : b.title} />
+
+    {:else if b.type === 'prepositionsChart'}
+      <!-- 5F §2.1: chapter 6's ten prepositions as a DIAGRAM. The same block
+           renders here (a Learn topic) and as the Review Prepositions Chart. -->
+      <PrepositionsChart block={b} title={sameTitle(b.title) ? null : b.title} />
+
     {:else if b.type === 'expander'}
       <details class="rc-expander">
         <summary><Marked text={b.label} /></summary>
         <div class="rc-expander-body">
           {#if b.content && b.content.length}
-            <svelte:self blocks={b.content} greekTaps={b.greekTaps || greekTaps} />
+            <svelte:self blocks={b.content} greekTaps={b.greekTaps || greekTaps} {audioMap} />
           {:else}
             <div class="pending-verification compact">Content pending verification.</div>
           {/if}
diff --git a/src/components/SelectActivity.svelte b/src/components/SelectActivity.svelte
index 41f7240..714986f 100644
--- a/src/components/SelectActivity.svelte
+++ b/src/components/SelectActivity.svelte
@@ -24,17 +24,31 @@
   // CONTROLS come from activity.ui.buttons, so each drill shows exactly the
   // original's button block (Previous / Next / Pronounce / Translate / Hint /
   // Score); chapter 1's two-button drills are unaffected.
+  //
+  // TWO-STAGE ITEMS (5F §2.9). Chapter 8's Personal Pronoun Case Drill asks
+  // for a PAIR — the person column, then the case-and-number grid — and
+  // NOTHING is judged until both are chosen: the learner may change their mind
+  // on the person as often as they like and only the last stage commits
+  // (Nathanael, VERIFY-5F item 7). That is the whole of the new interaction;
+  // once the pair is in, it is scored, timed and advanced by exactly the same
+  // policy machinery as a one-stage item, so no timing or advance rule below
+  // has a special case for it.
   import { onDestroy } from 'svelte';
-  import { buildSelectQuestions, randomFeedback, resolveHintBlocks, resolveHintRef } from '../lib/content.js';
+  import { authoredOptionSource, buildSelectQuestions, buildTwoStageQuestions, chapterAudioMap, randomFeedback, resolveHintBlocks, resolveHintRef } from '../lib/content.js';
   import { combiningForMarkName, firstAccentCluster, markOverlayParts } from '../lib/greek.js';
   import { play, playThrough, stop as stopAudio } from '../lib/audio.js';
   import { markCompleted } from '../lib/progress.js';
   import { resolveAdvance, waitsForNext } from '../lib/timing.js';
   import RichContent from './RichContent.svelte';
   import Paradigm from './Paradigm.svelte';
+  import PronounParadigm from './PronounParadigm.svelte';
   export let chapter;
   export let activity;
 
+  // Form -> clip for chart cells that are not lexicon lemmas (chapter 8's
+  // pronoun charts), for the Hint popup.
+  $: formAudio = chapterAudioMap(chapter);
+
   let options = [];
   let questions = [];
   let promptIsGreek = false;   // generator-declared (P6-P9): Greek prompts are tappable
@@ -61,10 +75,22 @@
   let answeredCorrect = false;
   const attemptedItems = new Set();
 
+  // Two-stage state. `stages` is empty on every one-stage drill, which is what
+  // every `twoStage` guard below reads.
+  let stages = [];
+  let stagePicks = [];        // stage index -> chosen option id (or null)
+  let pairKey = list => (list || []).join(' ');
+  $: twoStage = stages.length > 1;
+
   init();
   function init() {
-    const built = buildSelectQuestions(chapter, activity);
-    options = built.options;
+    const built = activity.mode === 'twoStageGrid'
+      ? buildTwoStageQuestions(chapter, activity)
+      : buildSelectQuestions(chapter, activity);
+    stages = built.stages || [];
+    pairKey = built.pairKey || pairKey;
+    stagePicks = stages.map(() => null);
+    options = built.options || [];
     questions = built.questions;
     promptIsGreek = !!built.promptIsGreek;
     optionClass = built.optionClass || '';
@@ -83,11 +109,31 @@
   }
 
   $: current = questions[qIndex];
+  // EVERY STAGE IS LIVE FROM THE START. An earlier pass greyed the case grid
+  // out until a person was chosen, to make the instruction line's order
+  // ("Click on the person then the case") visible. The rail walk says no:
+  // ch8railwalk p8 shows the case grid in exactly the same state before and
+  // after the person click. What holds the pair together is the COMMIT rule,
+  // not a disabled control — nothing is judged until both stages are filled,
+  // whichever order they are filled in (VERIFY-5F item 7).
+  // Every value acceptable at a stage, over answer + answerAlt. BOTH neuter
+  // plural cells of αὐτά light up, because the original grades both right
+  // (VERIFY-5F item 8) — showing only the first would call one of them a miss.
+  function stageCorrectIds(index, question) {
+    const ids = new Set();
+    for (const pair of (question && question.pairs) || []) {
+      if (pair[index] != null) ids.add(String(pair[index]));
+    }
+    return ids;
+  }
   // An item may carry its OWN option set (5D: the six verb-family
   // translations, the three Greek forms) — item-level first, activity-level
   // as the fallback.
   $: currentOptions = (current && current.options) || options;
-  $: authoredOptions = !!activity.optionsPerItem || Array.isArray(activity.optionValues);
+  // Same question the builder asked (5F: `options: "perItem"` counts too, so
+  // the three translation drills get the authored-grid styling — selection
+  // plus a revealed answer — rather than the vocabulary pool's red miss).
+  $: authoredOptions = authoredOptionSource(activity);
   // Only explicitly wide grids stay four-up at phone width. Vocabulary pools
   // in BOTH directions follow D-19 (two-up below 768px, four-up from 768px):
   // long English glosses can split just as badly as long Greek forms. The
@@ -256,12 +302,26 @@
     Promise.all([minimum, spoken]).then(() => { if (token === advanceToken) advance(); });
   }
 
+  // §2.9: a stage click. Any stage but the last only RECORDS — no attempt is
+  // counted, no feedback appears, nothing advances — so changing the person is
+  // free. Filling the last stage completes the pair and commits it, which is
+  // where the ordinary scoring path below takes over.
+  function chooseStage(index, opt) {
+    if (answered || finished || current.pending) return;
+    stagePicks = stagePicks.map((pick, at) => (at === index ? opt.id : pick));
+    if (stagePicks.some(pick => pick == null)) return;   // pair incomplete: record only
+    commit(current.accepted.has(pairKey(stagePicks)));
+  }
+
   function choose(opt) {
     if (answered || finished || current.pending) return;
     picked = opt.id;
+    commit(opt.id === current.answerId);
+  }
+
+  function commit(right) {
     attempts += 1;
     attemptedItems.add(qIndex);
-    const right = opt.id === current.answerId;
     if (right) correct += 1;
     feedback = randomFeedback(chapter, right ? 'correct' : 'incorrect');
     feedbackKind = right ? 'ok' : 'bad';
@@ -318,6 +378,7 @@
   function restore() {
     shownReveals = [];
     picked = null; answered = false; answeredCorrect = false;
+    stagePicks = stages.map(() => null);
     feedback = ''; feedbackKind = '';
   }
 
@@ -388,14 +449,31 @@
     {:else if promptIsGreek && current.promptAudio}
       <!-- The red-mark branch above deliberately does NOT take this class: its
            mark offsets are em-relative and correct, and nothing about mark
-           geometry moves in this round. -->
-      <button class="prompt greek greek-say" class:long={longPrompt} on:click={() => play(current.promptAudio)}>{current.prompt}</button>
+           geometry moves in this round.
+           5F §2.7: a two-line Greek prompt is ONE phrase and one clip, so the
+           second line lives inside the same tap target. -->
+      <!-- The note sits on the prompt's line but OUTSIDE its button, so it is
+           not part of the tap target and can never speak. -->
+      <div class="prompt-row" class:with-note={current.note}>
+        <button class="prompt greek greek-say" class:long={longPrompt} class:two-line={current.prompt2}
+                on:click={() => play(current.promptAudio)}>{current.prompt}{#if current.prompt2}<span class="prompt-line2">{current.prompt2}</span>{/if}</button>
+        {#if current.note}<span class="prompt-note">{current.note}</span>{/if}
+      </div>
     {:else if current.underline && sentenceParts(current.prompt, current.underline)}
       {@const parts = sentenceParts(current.prompt, current.underline)}
       <div class="prompt select-sentence">{parts[0]}<u>{parts[1]}</u>{parts[2]}</div>
     {:else}
       <div class="prompt" class:greek={promptIsGreek}>{current.prompt}</div>
     {/if}
+    <!-- 5F §2.5: the case tag / parse tag / disambiguator sits BESIDE the
+         prompt, on the same line, in plain ink at a smaller size — "πρός (to)",
+         "ἐπί (with dat.)" (ch6railwalk p8/p10), "παρά (with dat.)"
+         (ch8railwalk p10). It is never tappable even when it holds Greek: the
+         "(not ἐκ)" pair is the logged exception to directive 9, and it stays
+         inert inside the prompt's tap target below. -->
+    {#if current.note && !(promptIsGreek && current.promptAudio)}
+      <div class="prompt-note standalone">{current.note}</div>
+    {/if}
     <!-- The scripture citation the original prints beside the drill word. -->
     {#if current.citation}<div class="prompt-citation">{current.citation}</div>{/if}
     {#if current.pending}
@@ -416,7 +494,29 @@
         </div>
       {/if}
       <div class="feedback {feedbackKind}">{feedback}</div>
-      {#if optionGroups}
+      {#if twoStage}
+        <!-- §2.9: one grid per stage, in authored order, BOTH live from the
+             start (ch8railwalk p8). Nothing here is judged until the last
+             empty stage is filled; see chooseStage(). -->
+        {#each stages as stage, stageIndex}
+          {@const correctIds = showAnswerReveal ? stageCorrectIds(stageIndex, current) : null}
+          <div class="grid options stage-grid"
+               class:paradigm2col={stage.optionClass === 'paradigm2col'}
+               class:single={stage.optionClass === 'single'}
+               data-stage={stageIndex} data-stage-label={stage.label}>
+            {#each stage.options as opt}
+              <button
+                class="tile small"
+                class:selected={stagePicks[stageIndex] === opt.id}
+                class:correct={correctIds && correctIds.has(opt.id)}
+                disabled={answered}
+                on:click={() => chooseStage(stageIndex, opt)}>
+                {opt.label}
+              </button>
+            {/each}
+          </div>
+        {/each}
+      {:else if optionGroups}
         <!-- Parsing drill: two separated stacks, as the original draws them. -->
         <div class="option-groups">
           {#each optionGroups as group}
@@ -504,7 +604,11 @@
   <div class="modal-overlay" on:click|self={() => (showHint = false)} role="presentation">
     <div class="modal hint-modal" role="dialog" aria-modal="true" aria-label="Hint">
       <div class="modal-scroll">
-      <Paradigm paradigm={hintChart} title={hintChart.title || hintChart.charts?.[0]?.title || null} />
+      {#if hintChart.type === 'pronounParadigm'}
+        <PronounParadigm paradigm={hintChart} audioMap={formAudio} title={hintChart.title || null} />
+      {:else}
+        <Paradigm paradigm={hintChart} title={hintChart.title || hintChart.charts?.[0]?.title || null} />
+      {/if}
       </div>
       <div class="modal-actions">
         <!-- svelte-ignore a11y-autofocus -->
diff --git a/src/components/SpellActivity.svelte b/src/components/SpellActivity.svelte
index 973a561..81785d1 100644
--- a/src/components/SpellActivity.svelte
+++ b/src/components/SpellActivity.svelte
@@ -32,17 +32,79 @@
   export let chapter;
   export let activity;
 
-  // Two item shapes. {ref} looks the word up in the chapter's lexicon (the
-  // vocabulary spellers); {gloss, greek, audio} carries it inline (chapter 3's
-  // verb speller, whose 27 inflected forms are not lexicon lemmas).
+  // THREE item shapes, all reduced to one record here.
+  //
+  //   {ref}                    looks the word up in the chapter's lexicon (the
+  //                            vocabulary spellers). `ref` is a LEXICON KEY.
+  //   {gloss, greek, audio}    carries it inline (chapter 3's verb speller,
+  //                            whose 27 inflected forms are not lemmas).
+  //   {prompt, answer, ref}    5F. The prompt is an English phrase or a parse
+  //                            label, the ANSWER is the Greek, and `ref` is a
+  //                            scripture citation printed beside the prompt —
+  //                            the same field name carrying a different thing,
+  //                            which is why a ref that resolves to no lemma is
+  //                            treated as a citation rather than a lookup.
+  //
+  // §3: `ref` may legitimately be NULL (chapter 8's "they (fem nom 3 pl)" — the
+  // original shows a blank there), and a blank must render as nothing, not as
+  // an empty chip.
+  //
+  // §2.10: `answerAlt` is a SECOND ACCEPTABLE SPELLING, not a hint. Chapter 7's
+  // εἰμί speller prints the moveable nu in parentheses — ἐστί(ν) — and accepts
+  // both that and the bare ἐστίν. This is not general movable-nu leniency
+  // (D-16 stays withdrawn); it is this field, on these six items.
   const words = (activity.items || []).map(it => {
-    if (it.greek) return {
-      ref: it.ref || null, greek: it.greek, gloss: it.gloss || '', audio: it.audio || null
-    };
+    const inline = it.greek || it.answer;
+    if (inline) {
+      const lemma = it.ref ? getLemma(it.ref, chapter.id, it.pool) : null;
+      return {
+        ref: lemma ? null : (it.ref || null),
+        greek: inline,
+        alts: altSpellings(it),
+        gloss: it.prompt != null ? it.prompt : (it.gloss || ''),
+        note: it.note || null,
+        audio: it.audio || (lemma && lemma.audio) || null
+      };
+    }
     const l = getLemma(it.ref, chapter.id, it.pool) || {};
-    return { ref: null, greek: l.greek || '', gloss: l.gloss || '', audio: l.audio || null };
+    return {
+      ref: null,
+      greek: l.greek || '',
+      alts: altSpellings(it),
+      // A 5F vocabulary speller authors its own prompt ("from") rather than
+      // taking the lemma's full gloss ("from (with gen.)"), and carries the
+      // case tag beside it as a note.
+      gloss: it.prompt != null ? it.prompt : (l.gloss || ''),
+      note: it.note || null,
+      audio: l.audio || null
+    };
   });
 
+  // answerAlt is one string or a list of them; the printed form is often the
+  // same as the answer, in which case it adds nothing and costs nothing.
+  //
+  // A PARENTHESISED SEGMENT IS OPTIONAL, which is the whole reason the field
+  // exists here. ἐστί(ν) is the chapter's own notation for "the nu may or may
+  // not be there", so it is expanded into ἐστί(ν) — which the shared checker
+  // already folds to ἐστίν, punctuation being optional — AND ἐστί. Without the
+  // expansion the alternate collapses onto the answer and the field does
+  // nothing at all, which is how it first shipped.
+  //
+  // This is NOT general movable-nu leniency (D-16 stays withdrawn). It fires
+  // only on an authored parenthesised alternate, so the item next door — whose
+  // answerAlt is its own answer — still rejects a stray nu.
+  function altSpellings(item) {
+    const alt = item.answerAlt;
+    if (!alt) return [];
+    const out = [];
+    for (const value of Array.isArray(alt) ? alt : [alt]) {
+      if (typeof value !== 'string' || !value.trim()) continue;
+      out.push(value);
+      if (value.includes('(')) out.push(value.replace(/\([^()]*\)/g, ''));
+    }
+    return out;
+  }
+
   // The tile keyboard is a shared component reading the shared
   // speller-tiles.json contract. Chapter 1's inline copy is handed over only
   // as a last-resort fallback — see SpellerKeyboard for why it must not win.
@@ -110,10 +172,12 @@
     // requires every accent to be right; final forms and breathings are
     // required at BOTH settings; case and punctuation stay lenient either way.
     // A final nu is compared like any other letter (D-16 withdrawn).
-    const ok = spellingMatches(built, word.greek, {
-      withAccents,
-      punctuationOptional: activity.punctuationOptional !== false
-    });
+    const options = { withAccents, punctuationOptional: activity.punctuationOptional !== false };
+    // §2.10: any of the authored spellings is right. The parenthesised form is
+    // compared like any other answer — the parentheses are punctuation, which
+    // the shared policy already treats as optional, so ἐστίν, ἐστί(ν) and
+    // ἐστι(ν) all land on the same key without a movable-nu rule anywhere.
+    const ok = [word.greek, ...word.alts].some(answer => spellingMatches(built, answer, options));
     totalAttempts += 1;
     if (ok) {
       totalCorrect += 1;
@@ -204,15 +268,28 @@
   onDestroy(() => { window.removeEventListener('keydown', onKey); cancelAdvance(); stopAudio(); });
 </script>
 
-<div class="card speller">
+<!-- data-word-index is the item the surface is ON. Chapter 7's adjective
+     speller prints the SAME English prompt ("good") on six consecutive items
+     and distinguishes them by their parse note, so "has the prompt changed"
+     is not a sound way to observe an advance — the harness reads this. -->
+<div class="card speller" data-word-index={wordIndex} data-word-count={words.length}>
   <div class="spell-panes">
     <div class="flash-pane"><div class="label">{activity.promptLabel || 'English Meaning'}</div>
-      <div class="value" style="font-size:1.2rem">{word ? word.gloss : ''}</div>
+      <!-- §2.5: the case or parse tag sits BESIDE the prompt on the same line,
+           plain ink and smaller — "from God (not ἐκ)" (ch6railwalk p10),
+           "from (gen.)" (p12), "good (acc. pl. masc.)" (ch7railwalk p6),
+           "I (nom sg)" (ch8railwalk p9). Never tappable; nothing on this pane
+           is. -->
+      <div class="value" style="font-size:1.2rem">{word ? word.gloss : ''}{#if word && word.note}<span class="spell-prompt-note">{word.note}</span>{/if}</div>
+      <!-- §3: a null ref renders NOTHING, not an empty chip. -->
       {#if word && word.ref}<div class="spell-prompt-ref">{word.ref}</div>{/if}
     </div>
+    <!-- The answer field's caption is the original's, from the data: chapters
+         6-8 spell PHRASES ("Spell Greek Phrase") where chapters 1-5 spell
+         words. ui.fields is [prompt caption, answer caption]. -->
     <SpellerField
       state={buffer}
-      label="Spell Greek Word"
+      label={(activity.ui?.fields && activity.ui.fields[1]) || 'Spell Greek Word'}
       locked={solved}
       on:caret={e => { if (!solved) buffer = input.placeCaret(buffer, e.detail.index, e.detail.after); }}
       on:caretEnd={() => { if (!solved) buffer = input.caretToEnd(buffer); }} />
@@ -252,7 +329,10 @@
     on:clear={clearInput} />
 
   {#if showAnswer}
-    <div class="spell-answer"><span class="label">Answer</span> <span class="greek">{word ? word.greek : ''}</span></div>
+    <!-- §2.10: Show Answer prints the form the chapter PRINTS. Where the two
+         differ that is the parenthesised one (ἐστί(ν)); the bare spelling is
+         accepted just the same. -->
+    <div class="spell-answer"><span class="label">Answer</span> <span class="greek">{word ? (word.alts[0] || word.greek) : ''}</span></div>
   {/if}
 
   {#if showScore}
diff --git a/src/lib/content.js b/src/lib/content.js
index fb474d4..e2621ba 100644
--- a/src/lib/content.js
+++ b/src/lib/content.js
@@ -139,19 +139,46 @@ export function getLemma(ref, chapterId, pool) {
 // this is a synchronous in-memory lookup, never an app-load store scan. Longer
 // forms come first so a phrase (for example "ὁ λόγος") claims its full
 // standalone match before either word can claim only part of it.
+//
+// 5F: a chapter may also declare INFLECTED forms that are not lemmas. Chapter
+// 8's pronoun paradigms are set as running prose lines (μου, μοι, με …) with no
+// lexicon entry of their own, so the activities that print them carry an
+// `audioMap` of form -> clip. Those maps are folded in here so the Quick Review
+// charts get the same taps as the Learn pages without either surface owning a
+// private copy — the map is chapter data, not activity data, in everything but
+// where the pipeline chose to write it.
 export function getGreekTapMap(chapterId) {
-  const lex = registry[chapterId] && registry[chapterId].lexicon;
-  if (!lex) return {};
+  const entry = registry[chapterId];
+  if (!entry) return {};
   const entries = [];
-  for (const bucket of LEMMA_BUCKETS) {
-    for (const lemma of Object.values(lex[bucket] || {})) {
-      if (lemma && lemma.greek && lemma.audio) entries.push([lemma.greek, lemma.audio]);
+  const lex = entry.lexicon;
+  if (lex) {
+    for (const bucket of LEMMA_BUCKETS) {
+      for (const lemma of Object.values(lex[bucket] || {})) {
+        if (lemma && lemma.greek && lemma.audio) entries.push([lemma.greek, lemma.audio]);
+      }
     }
   }
+  for (const [form, audio] of Object.entries(chapterAudioMap(entry.chapter))) entries.push([form, audio]);
   entries.sort((a, b) => b[0].length - a[0].length);
   return Object.fromEntries(entries);
 }
 
+// Every activity-level `audioMap` in a chapter, merged. First declaration wins,
+// so a form declared once cannot mean two clips on two pages.
+export function chapterAudioMap(chapter) {
+  const map = {};
+  if (!chapter) return map;
+  for (const section of SECTIONS) {
+    for (const activity of chapter[section] || []) {
+      for (const [form, audio] of Object.entries(activity.audioMap || {})) {
+        if (form && audio && !map[form]) map[form] = audio;
+      }
+    }
+  }
+  return map;
+}
+
 // Reading People, Places and Letters pools (personalNames/placeNames/letterNames)
 // from a chapter's lexicon. Pass the chapter id so multi-chapter loads resolve
 // the RIGHT lexicon (reading-list keys repeat across chapters); falls back to
@@ -290,6 +317,13 @@ export function resolveItems(chapter, activity) {
                audio: item.audio || null, meta: item };
     });
   }
+  // 5F convention: pool "senses" is the CASE-SPLIT vocabulary surface. See
+  // sensePool() for why it is not simply "one card per sense".
+  if (activity.pool === 'senses') {
+    return sensePool(chapter).map(card => ({
+      display: card.display, secondary: stripMarkup(card.gloss), audio: card.audio, meta: card
+    }));
+  }
   // 5D convention: instead of spelling out ten {ref} items, an activity names
   // a lexicon BUCKET (pool: "lemmas") and the chapter's own vocab list
   // supplies the refs. Same resolved shape, so flashcard and reviewVocab are
@@ -317,6 +351,62 @@ function lemmaPool(chapter, activity) {
   return (chapter.vocab || []).map(ref => ({ ref, ...(getLemma(ref, chapter.id, bucket) || {}) }));
 }
 
+// THE CASE-SPLIT VOCABULARY POOL (5F). Chapters 6 and 8 present more cards
+// than they have lemmas, and they do it in two different ways which the
+// lexicon records in one field, `senses[]`:
+//
+//   caseTag SET      the lemma is split BY CASE and each sense is its own card
+//                    (chapter 6's διά/κατά/μετά/περί twice and ἐπί three times;
+//                    chapter 8's παρά three ways and ὑπό two).
+//   caseTag NULL     the senses are the lemma's own paired FORMS, printed on
+//                    ONE card (chapter 8's ἐγώ/ἡμεῖς and σύ/ὑμεῖς, whose
+//                    lexicalForm is already "ἐγώ / ἡμεῖς").
+//
+// So the rule is "one card per caseTag, plus one card for the untagged
+// remainder", not "one card per sense" — which is what makes chapter 6 sixteen
+// cards over ten lemmas and chapter 8 thirteen over ten while both drills
+// legitimately list fifteen entries from their own authored items.
+function sensePool(chapter) {
+  const cards = [];
+  for (const ref of chapter.vocab || []) {
+    const lemma = getLemma(ref, chapter.id, 'lemmas');
+    if (!lemma) continue;
+    const senses = Array.isArray(lemma.senses) && lemma.senses.length ? lemma.senses : [null];
+    let untaggedTaken = false;
+    for (const sense of senses) {
+      if (!sense || !sense.caseTag) {
+        if (untaggedTaken) continue;          // the paired forms share one card
+        untaggedTaken = true;
+        cards.push({
+          ref, lemma, sense,
+          display: lemma.lexicalForm || lemma.greek,
+          greek: lemma.greek,
+          gloss: lemma.gloss || lemma.glossShort || '',
+          audio: (sense && sense.audio) || lemma.audio || null
+        });
+        continue;
+      }
+      cards.push({
+        ref, lemma, sense,
+        // THE CASE TAG GOES WITH THE GREEK, not with the gloss. The rail walk
+        // settles it: chapter 6's Learn Vocabulary card reads
+        // "Greek Word: ἀπό (with gen.)" over "Word Meaning: from", and the
+        // Greek-to-English drill prints "ἐπί (with dat.)" as its prompt
+        // (ch6railwalk p10). Chapter 8's lexicalForm for παρά is already
+        // "παρά (with gen.)", which is the same convention written out.
+        // The bare form is kept in `greek` so a surface that wants the
+        // headword alone still has it.
+        display: [sense.greek || lemma.greek, sense.caseTag].filter(Boolean).join(' '),
+        greek: sense.greek || lemma.greek,
+        caseTag: sense.caseTag || null,
+        gloss: sense.gloss || sense.glossShort || '',
+        audio: sense.audio || lemma.audio || null
+      });
+    }
+  }
+  return cards;
+}
+
 function pickDisplay(letter, mode) {
   switch (mode) {
     case 'upper': return letter.upper;
@@ -342,6 +432,52 @@ function pickAudioField(mode) {
   }
 }
 
+// TWO-STAGE SELECT (5F §2.9, chapter 8's Personal Pronoun Case Drill). The
+// item asks for a PAIR — the person column, then the case-and-number grid —
+// and the answer is a two-element list in the same order as `optionStages`.
+//
+// Nothing here decides when an attempt is judged; that is the surface's job
+// and rule B1a's (VERIFY-5F item 7: the learner may change their mind on the
+// person as often as they like and only the LAST stage commits). This builder
+// only says what the stages are, what is acceptable, and what the item plays.
+//
+// `answerAlt` is a list of ADDITIONAL acceptable pairs, not a near miss:
+// αὐτά prints in both the neuter nominative plural and the neuter accusative
+// plural and the original grades both right (VERIFY-5F item 8), so the
+// accepted set is answer + answerAlt and the feedback is the correct path.
+export function buildTwoStageQuestions(chapter, activity) {
+  const stages = (activity.optionStages || []).map(stage => ({
+    label: stage.label || '',
+    // A stage that declares no layout is a plain COLUMN of its values — which
+    // is what the original draws and what the instruction line calls it ("click
+    // on the person then the case"). Left to the density heuristic, "Second
+    // Person" would come out two-up and the person stage would read as part of
+    // the 2x4 case grid under it rather than as the click before it.
+    optionClass: stage.layout ? optionClassForLayout(stage.layout, activity, [], []) : 'single',
+    options: (stage.values || []).map(value => ({ id: String(value), label: String(value) }))
+  }));
+  const pairKey = list => (list || []).map(value => String(value)).join(' ');
+  const questions = shuffle((activity.items || []).map(item => {
+    const answer = Array.isArray(item.answer) ? item.answer.map(String) : null;
+    // Every acceptable pair, the authored one first. `accepted` is the same
+    // set keyed for a single lookup on the commit.
+    const pairs = [];
+    if (answer) pairs.push(answer);
+    for (const alt of item.answerAlt || []) if (Array.isArray(alt)) pairs.push(alt.map(String));
+    return {
+      prompt: stripMarkup(item.greek) || '',
+      note: stripMarkup(item.note) || null,
+      promptAudio: item.audio || null,
+      citation: item.ref || null,
+      answer,
+      pairs,
+      accepted: new Set(pairs.map(pairKey)),
+      pending: !item.greek || !answer || answer.length !== stages.length
+    };
+  }));
+  return { stages, questions, promptIsGreek: activity.promptIsGreek !== false, pairKey };
+}
+
 // Build question list for a select activity (generator- or items-based).
 export function buildSelectQuestions(chapter, activity) {
   if (activity.generator) {
@@ -372,7 +508,13 @@ export function buildSelectQuestions(chapter, activity) {
   // optionValues/options win; the activity-level set is the fallback, so a
   // drill may mix the two. Missing prompt/answer fields remain in the sequence
   // as visible pending-verification questions instead of becoming bad answers.
-  if (activity.optionsPerItem || Array.isArray(activity.optionValues)) {
+  // 5F: `options` is the pipeline's own name for where the option set comes
+  // from — "static" (the activity's optionValues) or "perItem" (each item's
+  // own options[]). Both land in this branch; treating "perItem" as anything
+  // else drops the drill into the lexicon-vocabulary path below, which for the
+  // three translation drills would silently build ten Greek options out of the
+  // chapter's lemma list instead of the three the item ships.
+  if (authoredOptionSource(activity)) {
     // Chapters 4 and 5 carry the prompt inline on the item with no
     // promptFrom. Without this fallback every item resolves to
     // pending:true and the whole drill renders as a pending placeholder --
@@ -408,6 +550,15 @@ export function buildSelectQuestions(chapter, activity) {
       }
       return {
         prompt: stripMarkup(prompt) || '',
+        // 5F §2.7: a translation-drill prompt may be set over TWO lines, with
+        // the second null on the items that are one line only. It is a line
+        // break in the authored prompt, not a second prompt — one clip, one
+        // tap target — so it travels beside `prompt` and the surface joins them.
+        prompt2: stripMarkup(item.greek2) || null,
+        // 5F §2.5: the case tag / parse tag / disambiguator printed beside the
+        // prompt in plain ink. Never a tap target even when it holds Greek —
+        // the `(not ἐκ)` case is the logged exception to directive 9.
+        note: stripMarkup(item.note) || null,
         promptAudio: promptIsGreek ? (item.promptAudio || item.audio || (lemma && lemma.audio) || null) : null,
         // The answer's OWN clip, for surfaces where Pronounce speaks the
         // answer rather than the prompt (Greek Verb Drill: English prompt,
@@ -461,6 +612,18 @@ export function buildSelectQuestions(chapter, activity) {
   return { options, questions, optionClass: '', promptIsGreek: promptSide === 'greek' };
 }
 
+// True when the option set is AUTHORED rather than derived from a lexicon
+// pool: an activity-level optionValues grid, per-item options, or the
+// pipeline's own `options` declaration ("static" / "perItem"). Exported so the
+// surface can ask the same question the builder did instead of re-deriving it.
+export function authoredOptionSource(activity) {
+  return !!activity.optionsPerItem
+    || Array.isArray(activity.optionValues)
+    || activity.options === 'perItem'
+    || activity.options === 'static'
+    || (Array.isArray(activity.items) && activity.items.some(item => item && Array.isArray(item.options)));
+}
+
 // Option-grid density, from the data — never from the activity id.
 //   grouped  the drill declares optionGroups ([3,3]); the component lays the
 //            groups out as separate stacks (ch3 Parsing).
@@ -471,8 +634,16 @@ export function buildSelectQuestions(chapter, activity) {
 //   ''       the two-column default: ch2's mark and part-of-speech grids,
 //            ch3's 2x3 verb translations and 2x5 Scripture Memory grid.
 function optionClassFor(activity, activityOptions, questions) {
-  if (activity.optionLayout === 'single') return 'single';
-  if (activity.optionLayout === 'paradigm2col') return 'paradigm2col';
+  return optionClassForLayout(activity.optionLayout, activity, activityOptions, questions);
+}
+
+// 5F: `stack1col` is the pipeline's name for the one-column stack the port
+// already calls `single` — the three translation drills' full-sentence options.
+// Named here rather than aliased in the data so the data keeps the pipeline's
+// own vocabulary and the renderer keeps its own.
+function optionClassForLayout(layout, activity, activityOptions, questions) {
+  if (layout === 'single' || layout === 'stack1col') return 'single';
+  if (layout === 'paradigm2col') return 'paradigm2col';
   if (Array.isArray(activity.optionGroups) && activity.optionGroups.length) return 'grouped';
   if (activity.optionsPerItem && activity.optionsAreGreek) return 'single';
   const all = activityOptions.length
@@ -497,12 +668,31 @@ export function resolveHintRef(chapter, ref) {
       if (chart || !value) return;
       if (Array.isArray(value)) { value.forEach(scan); return; }
       if (typeof value !== 'object') return;
-      if (value.type === 'paradigm') { chart = value; return; }
+      if (value.type === 'paradigm' || value.type === 'pronounParadigm') { chart = value; return; }
       for (const child of Object.values(value)) scan(child);
     };
     scan(node);
     return chart;
   };
+  // 5F: a hintRef may name the chart by its TITLE rather than by a block type
+  // or a topic id — chapter 7's Adjective Case Drill points at
+  // "adjectiveParadigm", which is the slug of the Review page's own
+  // "Adjective Paradigm". Same slug convention resolveHintBlocks already uses
+  // for headings, and it is tried only after the exact-id search below fails,
+  // so no chapter that already resolves can change.
+  const byTitle = () => {
+    for (const section of SECTIONS) {
+      for (const candidate of chapter[section] || []) {
+        const charts = candidate.paradigm ? [candidate.paradigm] : (candidate.paradigms || []);
+        for (const chart of charts) {
+          for (const title of [candidate.chartTitle, chart && chart.title]) {
+            if (title && slugOf(title) === ref) return chart;
+          }
+        }
+      }
+    }
+    return null;
+  };
   const walk = node => {
     if (found || !node) return;
     if (Array.isArray(node)) { node.forEach(walk); return; }
@@ -518,7 +708,18 @@ export function resolveHintRef(chapter, ref) {
     for (const key of Object.keys(node)) walk(node[key]);
   };
   for (const section of SECTIONS) walk(chapter[section]);
-  return found;
+  return found || byTitle();
+}
+
+// The camelCase slug the data uses to name a page from elsewhere: hint refs,
+// and the popup ids chapter 8's Three Uses page links to from its own
+// underlined labels. Trailing punctuation is dropped so a label that ends in a
+// quote ('Adjective meaning "same"') keys the same as its id.
+export function slugOf(text) {
+  return String(text || '')
+    .replace(/[^A-Za-z0-9]+$/, '')
+    .replace(/[^A-Za-z0-9]+(.)/g, (_, c) => c.toUpperCase())
+    .replace(/^[A-Z]/, c => c.toLowerCase());
 }
 
 // An activity's Hint either carries its own blocks or REFERS to a chart that
diff --git a/src/lib/popups.js b/src/lib/popups.js
new file mode 100644
index 0000000..c516a2e
--- /dev/null
+++ b/src/lib/popups.js
@@ -0,0 +1,61 @@
+// FULL-PAGE POPUPS (5F §2.2). Chapters 6, 7 and 8 each carry a set of green
+// pages behind their teaching pages: a headword, its sense lines and two or
+// three worked examples with references. In the original each is a full-screen
+// modal reached by tapping a blue link on the page underneath, with a Cancel
+// control to come back.
+//
+// The popups live in an ACTIVITY-level `popups[]` array while the links that
+// open them are nested arbitrarily deep inside the topic content, so the
+// register travels by Svelte CONTEXT rather than as a prop drilled through
+// RichContent's recursion. Context, not a module store: two activities must
+// never see each other's popups, and ActivityHost's {#key activityId} remount
+// is what guarantees that with context and would not with a global.
+//
+// THREE WAYS A LINK IS DECLARED, all of them data:
+//
+//   popupRef      an explicit id on a greekRows row (chapter 6's One/Two/Three
+//                 Case panels — the GLOSS is the link, the case tag is ink).
+//   underline     an [[u]]…[[/u]] run whose slug matches a popup id (chapter
+//                 8's Three Uses page: "As a pronoun" -> asAPronoun). An
+//                 underlined run that matches nothing stays a plain underline,
+//                 which is what keeps "he [[u]]himself[[/u]] will get the car"
+//                 from becoming a link.
+//   greek         a popup carrying a `greek` headword links every standalone
+//                 occurrence of that word in the page's prose (chapter 7's
+//                 οὐ / οὐκ / οὐχ, whose page ships no anchors of its own).
+//                 See DIVERGENCE-LOG D-31.
+import { getContext, setContext } from 'svelte';
+import { slugOf } from './content.js';
+
+const KEY = Symbol('popups');
+
+// Register an activity's popups and hand back the opener the host binds to.
+// `open` is a callback the host supplies (it owns the visible sheet).
+export function providePopups(popups, open) {
+  const byId = {};
+  for (const popup of popups || []) if (popup && popup.id) byId[popup.id] = popup;
+  const register = { byId, open, byGreek: greekIndex(popups) };
+  setContext(KEY, register);
+  return register;
+}
+
+export function usePopups() {
+  return getContext(KEY) || null;
+}
+
+// Longest headword first, so οὐχ claims its own match before οὐ could.
+function greekIndex(popups) {
+  return (popups || [])
+    .filter(popup => popup && popup.greek)
+    .sort((a, b) => b.greek.length - a.greek.length)
+    .map(popup => [popup.greek, popup]);
+}
+
+// The popup an id names, or null. Ids are matched exactly first, then by slug,
+// so a link may name the popup either way.
+export function popupFor(register, ref) {
+  if (!register || !ref) return null;
+  if (register.byId[ref]) return register.byId[ref];
+  const slug = slugOf(ref);
+  return register.byId[slug] || null;
+}
```

## Screenshot corpora (binary, committed, not inlined)

- `buildout/screenshots/5f-walk/` — 70 files
- `buildout/screenshots/5f-detail/` — 24 files
- `buildout/screenshots/5f-modals/` — 171 files

 1801 files changed, 128955 insertions(+)
