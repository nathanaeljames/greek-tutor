# 5H-SPEC3 -- VERIFY-5H-2 closure round (chapters 3, 7, 8, 11, 12) -- Revision 2

Fable (chat pipeline), 2026-08-27, from VERIFY-5H2-RESPONSE.pdf and
5H-SPEC2-RESULTS-OPUS.md (both read; the PDF was inspected for
strikethrough and color -- none struck; orange text is Nathanael's
answers). Base: the repo head carrying 5H-SPEC2 (Opus). Small
behavior-focused round: dual run.

## 0. Rules

0.1 All standing rules of 5H-SPEC2 section 0, including the three
    deliverables (BUILD, RESULTS, VERIFY-5H-3.md).
0.2 **NEW STANDING RULE (Nathanael, 2026-08-27), applies to
    VERIFY-5H-3.md and every VERIFY document after it:** the document
    opens with a section titled "Previous-response checklist" -- every
    ask from the PREVIOUS VERIFY-RESPONSE round, one or two lines each,
    as checkboxes for Nathanael to VISUALLY confirm fixed rather than
    assume. For this round that is section 5 below, carried verbatim.
0.3 Data in hand (pipeline-patched, `check:shapes` PASS):
    `chapt-08.json`, `lexicon-chapt07.json`, `lexicon-chapt08.json`,
    `lexicon-chapt11.json`. FULL replacements. STOP on mismatch,
    report, no edits.
0.4 **NEW STANDING RULE (Nathanael, 2026-08-27):** any question that
    would otherwise land in a VERIFY document but BLOCKS spec content
    (a ruling the spec then has to revise around) is asked BEFORE the
    spec is drafted, in the pipeline turn that finds it. VERIFY is for
    questions whose answer does not reshape the round.
0.5 **NEW STANDING RULE (Nathanael, 2026-08-27):** VERIFY documents
    carry NO airplane-mode items. The scripted offline walk during
    implementation testing is sufficient; all subsequent testing is
    assumed offline and Nathanael reports anything that does not play.
    (Revision 2 removes this round's airplane section accordingly.)

## 1. Feedback item 1 -- objectives spacing regression (renderer)

The 5H-SPEC2 objectives contract added vertical spacing between
objectives on EVERY chapter's Learn Chapter Objectives page. Restore
the pre-5H-SPEC2 spacing exactly (the GOOD screenshot in the response
PDF) while keeping the ch7 and ch11 taps. Likely cause: the
`{text, audioMap}` branch wraps items in a block element the string
branch never had. Harness: a spacing assertion pinned to the rendered
line-box metrics on one string chapter and one audioMap chapter, so the
two branches cannot diverge again. Visual: re-screenshot ch1, ch7,
ch11 objectives at 320 px.

## 2. (s) ruling -- chapter 8 Autos Translation Drill hint (data done)

The original shows the SAME hint on every item: a paged stack, and the
per-item dispatch does not govern the opening page in practice. Data
now carries `ui.hintPages` of FOUR Back/More pages -- Third Person
Paradigm Masculine (`chartIndex: 0`), Feminine (1), Neuter (2), then
Three Uses (`contentRef`) -- and NO per-item `hintRef` on this drill.
Nathanael's conditional ("drop the neuter page if nothing uses it")
resolves KEEP: items 1 (αὐτὸ) and 9 (αὐτὰ) are neuter forms; say so in
RESULTS. Renderer: the hintPages pager must accept `{hintRef,
chartIndex}` entries (one chart of a multi-chart paradigm per page);
Back/More pair per §4.2, Cancel throughout. The Case Drill is UNTOUCHED
(per-item routing confirmed against DOSBox: each person opens its own
chart, Cancel only). Harness: the 5H-SPEC2 3.1 modal-title-switch
assertion on the autos drill is REMOVED (it now pins the wrong
behavior) and replaced by: same four-page hint from item 1 and item 4;
page order; bounds; the Case Drill assertions stand.

## 3. (t) and (w) rulings -- ratified, minimal work

(t) More/Back stays for the ch12 εἰμί/ἔχω hint and for EVERY future
Greek-only-contrast pair; the §4.1 fallback the implementer built is
now the ratified rule. Pipeline writes the DISCLOSURE-RULES §4.1
sentence (pipeline debt); implementer work: none. NIT-LOG N-2 moves to
RESOLVED with this ruling. (w) The two-state toggle stays -- the D-48f1
conversion of stacked hints is the app-wide standard, confirmed; no
divergence entry needed, close the item.

## 4. (r), (v), (k2) rulings -- vocabulary card audio (data done)

4.1 **(r)** ὅς: K_VOC5 says only ὅς and is meant to; the RESPONSE-7
    ask was struck through in the source PDF (a strikethrough the
    pipeline missed; the standing PDF-inspection rule exists for
    exactly this and the miss is owned in RESULTS' provenance line).
    `parts` REMOVED from the hos lemma; both surfaces play k_voc5.
    Renderer: nothing.
4.2 **(v)** Two-surface rule, ratified from the original: the Learn
    flashcard plays the lemma clip that recites ALL printed forms; the
    Review Vocabulary Chart taps EACH printed form independently.
    Data: `parts` added to ch8 ἐγώ/ἡμεῖς (h_voc3a/b) and σύ/ὑμεῖς
    (h_voc9a/b); ch11 οὗτος αὕτη τοῦτο already carries k_voc7a/b/c.
    Renderer: the reviewVocab row renders `parts` as independent Greek
    taps when present (the first multi-tap card row in the app);
    flashcard ignores `parts` and plays `audio`. Rows without `parts`
    are unchanged. Scan result for the record: the ONLY other
    multi-form row with per-form clips in chapters 1-12 is ch7's οὐ,
    οὐκ, οὐχ (g_voc8 + g_voc8a/b, already in the lexicon as
    `audioAlt`); VERIFY-5H-3 asks whether the original's ch7 chart
    taps them independently before the pipeline converts that row.
    Harness: per-form taps on the two ch8 rows and the ch11 row
    (evict-and-refetch), flashcard negative (plays the combined clip),
    twelve-chapter census that no other row gained parts.
4.3 **ch7 οὐ, οὐκ, οὐχ -- CLOSED pre-round (0.4 applied):** each form
    taps its own clip on the Review chart -- οὐ -> g_voc8, οὐκ ->
    g_voc8a, οὐχ -> g_voc8b (Nathanael's mapping and listens:
    g_voc8 recites οὐ, g_voc8a recites all three, g_voc8b recites
    οὐχ). Under the (v) two-surface rule the flashcard plays the
    all-three clip, g_voc8a. `lexicon-chapt07.json` delivered with
    `parts` and `audio: g_voc8a` (audioAlt retired). This lands on the
    same `parts` renderer as 4.2; harness adds the three ch7 taps and
    the flashcard positive. The former VERIFY item (x) is dead.
4.4 **(k2)** closed: nothing plays l_a1s or l_ap9; shipped-unwired by
    the original's design (D-39 class). Ledger/log: pipeline appends
    the closure note; implementer: none.

## 5. Previous-response checklist (goes verbatim into VERIFY-5H-3.md, per 0.2)

- [ ] Objectives spacing back to pre-5H-SPEC2 on every chapter; ch7/ch11
      words still tap (item 1).
- [ ] ch8 Autos drill: Hint identical on every item; four pages
      Masc -> Fem -> Neut -> Three Uses via More/Back (s).
- [ ] ch8 Case Drill unchanged: per-person chart, Cancel only (s).
- [ ] ch12 εἰμί/ἔχω hint labelled More/Back (t).
- [ ] ch12 εἰμί/ἔχω hint still a one-chart-at-a-time toggle (w).
- [ ] ὅς card and chart row: k_voc5 only, no per-form taps (r).
- [ ] ch8 chart rows ἐγώ/ἡμεῖς and σύ/ὑμεῖς: each form taps its own
      clip; flashcards play the both-form clips (v).
- [ ] ch11 chart row οὗτος αὕτη τοῦτο: three independent taps; flashcard
      plays k_voc7 (v).
- [ ] Nothing anywhere plays l_a1s / l_ap9 (k2, closed).
- [ ] ch7 chart row οὐ, οὐκ, οὐχ: three independent taps (g_voc8 /
      g_voc8a / g_voc8b); flashcard plays g_voc8a (all three) (4.3).

## 6. VERIFY-5H-3.md (implementer authors)

Section "Previous-response checklist" = section 5 verbatim. New items:
only (y), anything the visual pass departs from -- if the round
produces no other human-only question, the document is the checklist
plus (y) and says so. No airplane items (rule 0.5).

## 7. Acceptance

`check:shapes`, `build`, `check:lazy`; ui-behavior additions of
sections 1, 2, 4.2; ui-modals re-census (the autos hint is now four
pages at five heights); ui-walk ch7/ch8/ch11; ui-offline ch8; the
`check:docs` 44 pre-existing failures remain out of scope (unchanged
baseline, note the count). Visual checklist appended as
`5H-VISUAL-CHECKLIST-3` rows.

## 8. Pipeline debts -- ALL CLEARED with Revision 2 (2026-08-27)

Delivered alongside this spec, each a full-file replacement built on
the committed origin/main copy (`5d0a2d9`): DISCLOSURE-RULES.md (§4.1
Greek-fallback sentence), DRILL-BEHAVIOR-RULES.md (A1c),
NIT-LOG.md (N-2 -> RESOLVED, preserving the implementer's N-1
application note), DRILLBEHAVIORLEDGER.csv (row 107 carries the (k2)
closure), assemble_ch11.py / assemble_ch12.py (`post_patches` +
`post_patches_lexicon` re-apply D-52..D-56, the say-all consolidation,
the objectives contract, the hos/houtos audio rulings and the Augment
hint taps; VERIFIED by regenerating both chapters through the guards
and diffing byte-identical against the delivered data). RESULTS cites
nothing as pending.
