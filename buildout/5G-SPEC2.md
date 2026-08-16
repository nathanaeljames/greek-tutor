# 5G-SPEC2.md — cohort 5G closure round (chapters 9-10)

Scope: consume the corrected chapt-09/10 data, remove the Repeat
control, implement the form-dependent Hint, update the harness. Small
round; budget well under one session window. Graded per
GRADER-PROMPT.md; the BUILD diff is audited directly.

Base: the current main repo state (commit ecc5365 lineage). Delivered
inputs: `chapt-09.json`, `chapt-10.json` — FULL replacements, placed
in your working copy by Nathanael before you start.

## 0. Ground rules (standing directives, unchanged)

1. The data layer is inviolable. Commit the two delivered JSONs
   **as-is, verbatim, as your FIRST commit**, before any code change.
   You never edit their content. If anything in them looks wrong,
   STOP and report; do not fix.
2. Directive 4: offline verification, both halves of the preview
   side — `npm run build` clean and `npm run ui:offline` green
   (44 stops, refresh on an activity route, no console errors).
3. Directive 9: all displayed Greek is tappable and plays audio;
   English is not. The new hint charts follow this.
4. Directive 10: nothing added to the load or route-mount path scans
   a cache or store.
5. No emoji anywhere. No push to any remote. Deliver
   `5G-SPEC2-RESULTS.md` plus the cumulative BUILD diff.

## 1. Data consumption

Replace `src/data/chapt-09.json` and `src/data/chapt-10.json` with the
delivered files. What changed (for your sanity checks only — you
verify presence, you do not edit):

- ch9: objective 6 now reads Rom 6:23b (D-43); the Compound Verbs
  ἔρχομαι gloss is "I come, go" (D-44); the SM speller has NO
  `repeatCheckbox` key and NO "Repeat This Exercise" entry in
  `ui.checkboxes`; `_audioVerify` and `_answer_note` provenance
  updated.
- ch10: six parsing answers flipped to Future **Active** (items with
  prompts ἔσῃ, ἔσεσθε, ἔσομαι, ἔσται, ἐσόμεθα, ἔσονται — indices
  22, 23, 24, 25, 26, 28) per the walkthrough-extracted 30/30 key
  (D-45); the ten εἰμί items (indices 20-29) carry per-item
  `hintRef: "eimiParadigms"`; `hintCharts.eimiParadigms` added; the
  SM speller's Repeat control keys removed; the Stem Variations topic
  now carries five interspersed "Examples" expanders in `below`
  (its former popups and in-text links are gone).

Post-replacement asserts (run, record in RESULTS):
`grep -c repeatCheckbox src/data/*.json` returns 0 matches;
`grep -c eimiParadigms src/data/chapt-10.json` is nonzero; both files
parse.

## 2. Remove the Repeat control (D-42 RETIRED)

Delete from the SM speller component: the "Repeat This Exercise"
checkbox rendering and the replay-then-clear-slate logic behind it.
Chapters 9 and 10 were its only users (verified: no other chapter's
data carries `repeatCheckbox`). Keep everything else exactly as is —
in particular retry-until-right on a wrong Check Answer, and the
Restart Exercise button (D-12).

Context you should know, from DIVERGENCE-LOG D-42: the original gives
one Check Answer and then clears the whole screen. Nathanael
DELIBERATELY REJECTED that behavior. Do not re-add this control in any
chapter, ever, regardless of what any future original-behavior
observation shows.

Also delete the harness assertions from rounds 9-10 that assert the
checkbox's presence and default-OFF state.

## 3. Form-dependent Hint (D-46)

The Parsing Drill's Hint payload now depends on the item:

1. Resolution rule: an item-level `hintRef` OVERRIDES the drill-level
   `ui.hintRef`. Items without their own key keep using the drill's.
2. The hint resolver must support BOTH hintCharts shapes:
   - `paradigmRefs` (existing — ids resolved against the chapter's
     charts), used by `futureParadigms`;
   - `charts` (new — inline paradigm objects, same block shape as
     topic paradigms), used by `eimiParadigms`.
3. Rendering `eimiParadigms`: ONE modal, the two charts stacked
   (Present above Future), titles verbatim from data, single Close
   button fixed to the modal footer. No cycling, no paging, no
   autoplay. Match the existing ch9 stacked-hint modal's styling
   exactly.
4. Chart cells are Greek-tappable per directive 9, playing the audio
   keys given in data (`chapt_10_g_eimi*` for the present chart,
   `chapt_10_j_eimi*` for the future). Glosses are plain English text,
   not tappable. All six g_eimi clips ship in the chapter-10 pack
   already; no manifest change.

Behavioral spot checks: item 16 (λύω) Hint shows Future Active +
Future Middle as before; item 25 (ἔσομαι) Hint shows the two εἰμί
charts; item 21 (εἰμί) likewise.

## 4. Answer-key flips

No renderer change. The six flipped answers arrive in data. Update
every harness assertion that expected Middle on those six items to
expect Active. The four present-εἰμί items (εἰμί, ἐστέ, εἰσί, εἶ)
remain Present Active — no change.

## 5. Harness additions

- Assert the Repeat checkbox is ABSENT on both SM spellers, and that
  a wrong Check Answer leaves the typed text in place (retry
  semantics unchanged).
- Assert item-level hint routing: an εἰμί item's Hint modal contains
  both strings "Present Active Indicative of" and "Future Active
  Indicative of"; a λύω item's contains "Future Middle".
- Assert the six flipped items grade Active correct and Middle
  incorrect.
- Visual: the ch10 Stem Variations page shows five collapsed
  "Examples" accordions, one under each numbered variation, none
  grouped at the end. These render on the existing below-expander
  component; no new code expected — if they do not render, STOP and
  report rather than patching data.

Adjust suite counts as needed; report old/new totals in RESULTS.

## 6. Out of scope — do not touch

Chapters 1-8 data files, `lexicon-chapt08.json`, the R1-R7 disclosure
renderer items (green links, accordion restyle, pinned control rows
beyond this spec's Close button, single-toggle paradigm control,
Meanings styling, termList), and `poolKind` handling. All of that is
DISCLOSURE-SPEC1's round. If you see those keys in data you were not
given, you were given the wrong files — STOP.

## 7. Acceptance checklist

- [ ] Two data files committed verbatim as the first commit
- [ ] Section 1 asserts pass and are recorded
- [ ] Repeat control fully removed; retry-until-right verified
- [ ] Per-item hintRef routing implemented; both hintCharts shapes
      supported; eimiParadigms renders per section 3
- [ ] Harness updated per sections 2, 4, 5; suite green
- [ ] `npm run build` clean; `npm run ui:offline` green (44 stops)
- [ ] 5G-SPEC2-RESULTS.md + cumulative BUILD diff delivered; no push
