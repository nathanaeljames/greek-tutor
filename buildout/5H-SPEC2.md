# 5H-SPEC2 -- Cohort 5H closure + LOOKBACK pass (chapters 3-12) -- Revision 1a

Produced by Fable (chat pipeline) 2026-08-26 from VERIFY-5H-RESPONSE.pdf,
5H-SPEC1-RESULTS-OPUS.md and 5H-VISUAL-CHECKLIST-OPUS.md (all three in
hand), plus TBK re-reads of chapters 7, 8, 11 and 12. Base: the repo
head carrying the 5H-SPEC1 round (Opus, no XPATCH). This round closes
cohort 5H AND executes the look-back pass that VERIFY-5H-TASK section
3 scoped as "LOOKBACK-SPEC1"; the two are one spec by Nathanael's
direction. Dual run (Sol and Opus): small, behavior-focused, the class
where the parallel run earns its cost.

## 0. Standing round rules (unchanged, plus three new)

0.1 Directives 1-10, no git (read-only `git diff` only), data files
    copied verbatim with the section 0.3 reporting exception, no
    emoji, wall clock in BUILD with addenda adding to the total, the
    complete cumulative diff in BUILD, STOP on any missing named file.
0.2 **NEW deliverable set, standing from this spec on:** every spec
    produces THREE documents -- `<SPEC>-BUILD-<MODEL>.md`,
    `<SPEC>-RESULTS-<MODEL>.md`, and `VERIFY-<SPEC>.md`. The VERIFY
    document is authored by the implementer in the same round, on the
    VERIFY-5H.md pattern (DOSBox / Listen / Judgement kinds, port
    behavior stated, proposed default, cost of the other answer,
    settled-appendix). It carries forward every item of the PREVIOUS
    spec's VERIFY document that the VERIFY-RESULTS supplied for this
    round did not mark resolved or not-resolved, plus the new items.
    For this round the previous document is VERIFY-5H.md and its
    results are VERIFY-5H-RESPONSE.pdf: every item there is answered
    except that (k) leaves two clips homeless (section 6), so
    VERIFY-5H-2.md carries (k)'s residue and the new items only.
0.3 **NEW cursor rule (Nathanael, VERIFY-5H (j)):** in a rail walk an
    ARROW cursor over a word means NOT clickable; a HAND cursor means
    clickable. Both are evidence. This supersedes 5H-SPEC1 0.5's
    "absence is not evidence of absence" for screens where the walker
    hovered deliberately.
0.4 **NEW pipeline rule (recorded here, binding on the pipeline, not
    the implementer):** when a rail-walk screen departs from what the
    extraction expects -- text the TBK holds that the screen never
    shows, a screen that duplicates another, a clip whose name does not
    match what it records -- the pipeline reports it to Nathanael in
    the SAME turn, as the headline, before any spec or data work
    proceeds; and when a handed-over document is not the one named,
    the pipeline STOPS the whole turn and asks, doing nothing else.

## 1. Deliverables

- `5H-SPEC2-BUILD-<MODEL>.md`, `5H-SPEC2-RESULTS-<MODEL>.md`,
  `VERIFY-5H-2.md` (section 0.2).
- Data in hand (pipeline-patched 2026-08-26, all pass `check:shapes`):
  `chapt-07.json`, `chapt-08.json`, `chapt-11.json`, `chapt-12.json`,
  `lexicon-chapt11.json`, `lexicon-chapt12.json`. FULL replacements.
  What each carries is itemised in sections 2-4; if a file does not
  carry what its section says, STOP and report (spec bug or file
  mismatch), do not edit.
- New living documents to place in `buildout/`: `NIT-LOG.md`
  (section 5). DIVERGENCE-LOG entries D-52..D-56 (section 7) are
  written by the pipeline and delivered with this spec's next revision
  if Nathanael prefers, or appended by the implementer verbatim from
  section 7 -- Nathanael decides in the kickoff; default: implementer
  appends verbatim.

## 2. Cohort 5H closure items (from VERIFY-5H-RESPONSE)

Each row: the decision, what the data already does, what the renderer
must do.

2.1 **(a) RESTORE** the Relative Pronouns Introduction. Data: the TBK
    text stays, the topic's `_verify_note` now cites D-52. Renderer:
    nothing. Harness: the 5H visual checklist row for ch11 Learn
    Relative Pronouns > Introduction is re-stated as PASS-by-ruling.
2.2 **Demonstrative Examples modal, Jn 13:35 (RESPONSE 1):** the line
    break between ἐμοὶ and μαθηταί is gone; the row's `greek` is one
    string, no `greek2`. Renderer: nothing; re-screenshot.
2.3 **ὅς paradigm Neut.-A cell (RESPONSE 2 and (q)):** the original's
    K_OSNAP RECORDS οὕς, not ἅ (Nathanael's listen), so every ἅ cell
    that dispatched it played the wrong word. Data: the Neut.-A cell
    on the Learn chart, its Quick Review copy and the
    `relativeParadigm` hint now play `k_osnns` (the Neut.-N cell's
    clip, the same form ἅ); the Who and The Drill item that carried
    k_osnap likewise. The Relative and Reflexive speller item 14
    (answer οὕς) MIRRORS the original and keeps `k_osnap`, which
    speaks οὕς. Renderer: nothing.
2.4 **(g) μέν gloss fixed** to "on the one hand, indeed" in
    lexicon-chapt12.json (D-55). **(h) prompt 24** now "who (masc. nom.
    pl.)" (D-54). **(m) both slips fixed:** τούτου (acute) in the
    Examples modal, ἐκεῖνοί with its breathing in translation item 13
    (D-53). Renderer: nothing.
2.5 **(o) Objectives taps (RESPONSE 4) -- RENDERER + DATA CONTRACT.**
    An `objectives[]` entry may now be either a string (unchanged) or
    an object `{text, audioMap}` where `audioMap` maps a Greek word in
    `text` to a clip id. The objectivesPage renderer renders `text`
    and wraps each `audioMap` key as a standard Greek tap (blue, plays
    the clip; directive 9). Data already carries: ch11 objective 1
    (ἐκεῖνος -> k_ekemns, οὗτος -> k_outmns, from the Objectives page's
    own WordSelection table) and ch7 objective 5 (εἰμί -> g_eimi1s,
    same source; Revision 1a corrects a pipeline off-by-one that had
    put the map on objective 4). Harness: assert both ch11 words and the ch7 word
    play, and that every other objective string in twelve chapters
    renders unchanged. Scan result for the record: those are the ONLY
    objectives with Greek in chapters 1-12.
2.6 **Augment Drill hint taps (RESPONSE 5):** the hint's `content`
    now carries `hint.audioMap` for ἐκβάλλω, ἐξεβάλλον, ἀποκτείνω,
    ἀπέκτεινον (l_ex11-14). Renderer: the inline-hint path applies an
    `audioMap` the same way topic-level `audioMap` is applied (the
    RESULTS 3.2 restoration); Greek elsewhere in that hint (rule
    lines) stays inert. Harness: four positive taps, one negative
    (the ε in rule 1 plays nothing).
2.7 **Learn Vocabulary / Review chart, οὗτος αὕτη τοῦτο (RESPONSE
    6):** lexicon `audio` is now `k_voc7` (the three-form recitation)
    for the flashcard and the Review chart row; the drills keep
    `k_voc7a` via `senses`; the three `parts` keep k_voc7a/b/c.
    Renderer: confirm the flashcard and the review row read the
    lemma's `audio`, not `senses[0].audio`; if the review row reads
    `parts`, it must ALSO offer the whole-row clip (RESPONSE 6 says the
    row should say all three). Report which path the renderer took.
2.8 **ὅς, ἥ, ὅ (RESPONSE 7):** lexicon `parts` now wire the three forms
    to their paradigm-cell clips (k_osmns, k_osfns, k_osnns); the lemma
    `audio` stays k_voc5. VERIFY-5H-2 asks whether K_VOC5 recites all
    three (then it replaces the parts on the flashcard) or only ὅς.
2.9 **(p) Quick Review say-all consolidation (data done):** on ch11's
    three Review paradigm pages the Singular half of every split pair
    has NO `sayWhole`; the Plural half carries the one button. Six
    buttons where there were twelve. Renderer: nothing, but the
    ui-behavior 5H "named toggle keeps its say-all" family must NOT be
    extended to Quick Review; add the inverse assertion (one button per
    recording on c11_qr_this_that, c11_qr_relative, c11_qr_reflexive).
    Learn toggles and modals are unchanged (N-1).
2.10 **(d) Audio-leak gate, adopted forward and backward (section 4).**
2.11 **(e), (f), (j), (l), (n): confirmed as built; no work.** (j)
    additionally ratifies 0.3.

## 3. LOOKBACK items (chapters 3-10, and one decision for 12)

3.1 **Chapter 8 form-dependent hints (data done, renderer nothing).**
    TBK scan of all 28 chapters for the WordCounter-shows-a-Hint
    signature: chapters 1-7 and 9 none; 10 the known D-46; 11-12 the
    five in 5H; **chapter 8 two the port never carried.** Both are now
    in chapt-08.json as per-item `hintRef` (D-46 mechanism, already in
    the renderer):
    - `c8_drill_case` (31 items): first-person forms open
      `firstPersonParadigm`, second-person `secondPersonParadigm`, αὐτ-
      forms `thirdPersonParadigm` (dispatch at 0x10d820; fields
      0xc5d4a / 0xc6cd4 / 0xc4676). Before: one hint for all.
    - `c8_drill_translation_autos` (21 items): items 1-3, 6, 8, 10-14,
      17, 20 open `thirdPersonParadigm`; items 4, 5, 7, 9, 15, 16, 18,
      19 open `threeUses` -- the Learn topic "Three Uses" reused as a
      hint page by topic id (the content.js topic-id hint path); item 21
      has no dispatch entry in the original's 20-entry table and takes
      the drill default. CORRECTION (Revision 1a, 2026-08-26): the
      port did NOT lack a Hint here; it stacked BOTH payloads as a
      two-page `ui.hintPages` (paradigm, then Three Uses). That key is
      now REMOVED from the data because it takes renderer precedence
      over per-item `hintRef`; the per-item routing is the original's.
      Renderer: per-item `hintRef: "threeUses"` must resolve the Learn
      TOPIC id as a hint page (the same blocks the old `contentRef:
      "threeUses"` produced); if `resolveHintRef` does not fall through
      to the topic-id path today, add that fall-through (one branch)
      rather than re-introducing `hintPages`. Harness: modal-title switch assertions on both
      drills, the ch10/ch11 pattern; visual check both hint surfaces at
      320 px (the Three Uses page is prose, C7 flowing).
3.2 **Objectives contract** -- section 2.5 covers chapters 7 and 11;
    nothing else in 1-12 qualifies.
3.3 **Greek-only toggle labels (RESPONSE 3, decision pending).** The
    rule Nathanael remembers is DISCLOSURE-RULES §4.1: a one-word
    contrast labels the toggle only when it is meaningful without the
    noun; a LEXICAL contrast toggles More/Back, and the activity where
    that was decided is **ch4 Learn Nouns > Masculine Declension**, the
    λόγος/ἄνθρωπος pair (More/Back), followed by ch5 ὥρα/δόξα. The
    matrix of every two-form pair on consecutive screens, chapters
    1-12, from the shipped data:

    | Chapter / surface | Screen 1 | Screen 2 | Label today |
    | --- | --- | --- | --- |
    | ch4 Learn Nouns > Masculine Declension | λόγος | ἄνθρωπος | More / Back |
    | ch5 Learn Nouns > First Declension (Alpha) | ὥρα | δόξα | More / Back |
    | ch10 Parsing Drill hint (εἰμί items) | Present ... of εἰμί | Future ... of εἰμί | Present / Future |
    | ch12 Parsing Drill hint (εἰμί/ἔχω items) | Imperfect of εἰμί | Imperfect of ἔχω | **εἰμί / ἔχω** |
    | ch12 Parsing + Translation hints (λύω items) | Imperfect Active of λύω | Imperfect Middle/Passive of λύω | Active / Middle/Passive |
    | ch11 hints (4) and Learn toggles (3) | ... Singular | ... Plural | Singular / Plural |

    The ch12 εἰμί/ἔχω hint is the ONLY Greek-labelled pair in twelve
    chapters and is the only one that breaks §4.1 as written. Default
    for this round unless Nathanael rules otherwise at kickoff: the
    renderer's `paradigmToggleLabels` falls back to More/Back whenever
    the one differing word is Greek, which converts that pair and
    touches nothing else (assert the other five rows unchanged).
    NIT-LOG N-2 records the decision either way.
3.4 **Say-all duplication across chapters 1-10:** none found (N-1);
    no work.

## 4. Audio-leak gate, generalised (RESPONSE (d))

4.1 The 5H-SPEC1 gate (ink prompt, Pronounce disabled until answered,
    both live after) becomes a STANDING RULE. Structural condition:
    `audioTiming: afterGuess` AND Greek options (`optionsAreGreek`) AND
    `advanceClass` is NOT `autoBoth`. Excluded by ruling: every
    English-to-Greek vocabulary drill (autoBoth: a disabled Pronounce
    plus auto-advance is a dead button) and every speller (pronouncing
    the target is the exercise's design).
4.2 Under that condition the gate applies, across twelve chapters, to
    exactly FOUR activities: ch12 Augment Drill (already), ch3 Greek
    Verb Drill (`c3_drill_greek_verb`), ch4 Greek Noun Drill
    (`c4_drill_greek_noun`), ch5 First Declension Noun Drill
    (`c5_drill_first_decl_noun`) -- English prompt, Greek answer,
    Prev/Next, ledger rows 25, 33, 41. Their prompts are English, so
    the "ink lemma" half is vacuous; only the Pronounce gate applies.
    Renderer: replace the "Greek prompt" leg of the existing condition
    with the 4.1 triple. Harness: gate fires on the four, and on no
    other activity in the 270-activity census (extend the 5H Augment
    assertions into a census assertion). DRILL-BEHAVIOR-RULES gets
    A1c stating 4.1 (pipeline writes it; cite "A1c, pending" in
    RESULTS).

## 5. NIT-LOG.md (new living document)

Place `NIT-LOG.md` in `buildout/`. Standing rule: every new instance
of an open nit is appended to its entry in the round that ships it,
by whoever ships it (pipeline for data-borne instances, implementer
for renderer-borne). N-1 is the say-all split record Nathanael wants
complete before he decides on clip splitting.

## 6. Harness, acceptance, VERIFY-5H-2

6.1 Gates: `check:shapes`, `build`, `check:lazy`, ui-behavior
    (additions: objectives taps x2 chapters, Augment hint taps 4+1,
    ch8 hint switching x2 drills, gate census x4, Quick Review one
    button x3 pages, εἰμί/ἔχω label rule), ui-modals (ch8 Three Uses
    hint and both ch8 paradigm routes; ch11 relativeParadigm hint
    re-run for the k_osnns cell), ui-walk over ch7, ch8, ch11, ch12,
    ui-offline (both 5H chapters plus ch8), ui-disclosure3 census
    unchanged at 270.
6.2 Visual walkthrough: every page whose data changed (ch7 objectives,
    ch8 both drills' hints, all ch11 pages named in section 2, ch12
    Augment hint and Review Vocabulary Chart) at 320 and 768 px against
    the rail walks; checklist rows appended to a `5H-VISUAL-CHECKLIST-2`
    section of the existing checklist file.
6.3 `VERIFY-5H-2.md` items (implementer authors; pipeline-supplied
    ones listed): (k)-residue: `l_a1s` ("just checking it out?",
    English) and `l_ap9` are homeless -- confirm no screen in the
    original plays either (DOSBox, two listens); (r) does K_VOC5 recite
    ὅς, ἥ, ὅ or only ὅς (listen; decides section 2.8); (s) ch8 Autos
    Translation Drill: click Hint on items 1 and 4 in DOSBox -- confirm
    the paradigm and the Three Uses page respectively (DOSBox); (t) the
    ch12 εἰμί/ἔχω label decision if not taken at kickoff (judgement);
    (u) anything the implementer's visual pass departs from. Plus the
    airplane-mode device half for ch8 and ch11.

## 7. Divergence entries (verbatim text for DIVERGENCE-LOG.md)

D-52 | ch11 | RELATIVE PRONOUNS INTRODUCTION RESTORED. The original's
Introduction radio shows the Reflexive/Reciprocal box (rail walk p11-12,
DOSBox-confirmed); the port shows the TBK's own unshown "Relative
Pronouns" + "(cont.)" fields (0x4136e, 0x420fc). Six clips (k_agree1-4,
k_under1-2) remain unwired. | Nathanael, VERIFY-5H (a), 2026-08-26.

D-53 | ch11 | Two typographic slips of the original corrected: τοὺτου ->
τούτου (Demonstrative Examples, Jn 8:23); εκεῖνοί -> ἐκεῖνοί (This and
That Translation item 13). | Nathanael, VERIFY-5H (m).

D-54 | ch11 | Relative and Reflexive Spelling prompt 24 "whom (masc. nom.
pl.)" -> "who (masc. nom. pl.)"; answer οἵ unchanged. | VERIFY-5H (h).

D-55 | ch12 | Review Vocabulary Chart μέν gloss "one the one hand,
indeed" -> "on the one hand, indeed". | VERIFY-5H (g).

D-56 | ch11 | K_OSNAP records οὕς, not the neuter ἅ its name implies;
every ἅ cell now plays K_OSNNS (same form); the speller item whose
answer is οὕς mirrors the original and keeps K_OSNAP. | Nathanael
listen, VERIFY-5H (q) + RESPONSE 2.

D-51 (amend) | app | The Augment Drill gate generalised to the section
4.1 triple; applies to ch3/ch4/ch5's English-prompt form drills;
English-to-Greek vocabulary drills and spellers excluded by ruling. |
Nathanael, VERIFY-5H (d), 2026-08-26.

## 8. Pipeline debts carried (not implementer work)

- `assemble_ch11.py` / `assemble_ch12.py` `post_patches()` must
  re-apply D-52..D-56 and the say-all consolidation so a regeneration
  cannot regress them (Stage 8.7); the pipeline delivers that with the
  DRILL-BEHAVIOR-RULES A1c amendment and the DIVERGENCE-LOG text.
- DRILL-BEHAVIOR-RULES A1c (section 4.1) and the cursor rule (0.3) into
  TITLE-SWEEP-RULES / CHAT-HANDOFF.
- 5H-SPEC1 section 0.5 amended by 0.3 above.

## 9. Revision 1a (2026-08-26) -- two delivered-data mismatches, both pipeline errors

The Codex implementer STOPPED correctly on the first delivery (section 1
says STOP, not edit). Both files are re-delivered as full replacements;
nothing else changed. Wall clock: the implementer's 4m 3s on the blocked
attempt counts toward the round total per the standing rule.

- `chapt-07.json`: the εἰμί `audioMap` sat on objective 4; the word is
  in objective 5. Fixed (objective 4 is a plain string again).
- `chapt-08.json`: `c8_drill_translation_autos` kept its old two-page
  `ui.hintPages`, which outranks per-item `hintRef`. Removed; the
  removed value is preserved in the activity as `_hint_pages_removed`
  for provenance. See section 3.1's correction for the renderer note.
