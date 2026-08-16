# 5G-SPEC2 Results

Date: 2026-08-16

Status: implemented and verified. No commit or push was made by this implementation round.

## Outcome

The chapter 9/10 closure work is complete:

- the retired Scripture Memory Repeat control and its replay-then-clear state are removed;
- a wrong whole-verse answer still leaves the slate intact and editable, while `Restart Exercise` remains;
- parsing questions retain an item-level `hintRef` through shuffle and use it ahead of the drill default;
- `hintCharts` resolves both referenced `paradigmRefs` and inline `charts` to the existing stacked-modal renderer;
- chapter 10 εἰμί forms open one Present/Future modal with two stacked charts, no pager, no autoplay path, and one pinned Close control;
- paradigm Greek is the audio button while its English gloss is an inert sibling;
- the six corrected future-εἰμί forms are independently pinned as Future Active in the browser harness;
- the five Stem Variations render as interspersed, initially collapsed `Examples` accordions; and
- the shape, behavior, modal, rail-walk, production-build, lazy-chunk, and offline guards are updated and green.

## Delivered data and checkpoint

The requested data checkpoint already existed before implementation began:

```text
021a03df2ab0862f296cbb58614aacdd0e2e7b3f
saving all data files prior to phase 5g spec 2
M src/data/chapt-09.json
M src/data/chapt-10.json
```

That is Nathanael's commit, immediately above the stated `ecc5365` lineage. The user explicitly requested no commit, so I treated `021a03d` as the required first/data-only checkpoint and left every implementation change uncommitted.

The two delivered files were not edited during this round. Their SHA-256 values are:

| File | SHA-256 |
| --- | --- |
| `src/data/chapt-09.json` | `BC806C190154B0736043A99A5DBCE988C5065DBBDE7078C7C7BCEB4BBB2EF2AB` |
| `src/data/chapt-10.json` | `92A5C49C980DDD9E0867F1041F93D2498D93D536D2352B384F15AACE011F86F5` |

Post-replacement checks:

- all 24 JSON files under `src/data` parse;
- the PowerShell equivalent of `grep -c repeatCheckbox src/data/*.json` found 0 matches;
- `eimiParadigms` occurs 11 times in `chapt-10.json` (10 item references plus the registry entry);
- chapter 9 objective 6 reads `memorize Rom 6:23b in Greek.`;
- chapter 9 contains the corrected `I come, go` gloss;
- both Scripture Memory spellers contain only `Show Answer` and `With Accents` in `ui.checkboxes`;
- chapter 10 parsing has 30 items, with exactly 10 `eimiParadigms` overrides;
- `futureParadigms` contains two `paradigmRefs`, while `eimiParadigms` contains two inline `charts`;
- zero-based indices 22, 23, 24, 25, 26, and 28 are respectively `ἔσῃ`, `ἔσεσθε`, `ἔσομαι`, `ἔσται`, `ἐσόμεθα`, and `ἔσονται`, all authored Future Active with the specified person/number; and
- every one of the five Stem Variation items has exactly one `below` expander labelled `Examples`.

`git diff --name-only -- src/data public/audio/audio-manifest.json` is empty. No chapter data, lexicon, or audio manifest changed.

## Implementation by module

### Repeat retirement

`src/components/SpellVerseActivity.svelte` no longer imports `playThrough`, renders `[data-repeat-exercise]`, or maintains `repeatExercise`, `repeatToken`, `repeatCheckbox`, or destroyed/replay-clear state. A correct answer still marks the activity complete and plays its verse once. The wrong-answer branch is unchanged. `Restart Exercise` still stops audio and clears the slate, and unmount still stops audio.

`src/lib/audio.js` retains `playThrough` because four advancing activity components still use completion timing, but its obsolete comment naming the retired Repeat pass as the boolean-result consumer was removed.

### Form-dependent hints

`src/lib/content.js` now preserves `item.hintRef` in both two-stage and authored select question builders. `resolveHintRef` checks `hintCharts` first, accepts exactly the existing referenced shape or the new inline shape, and normalizes either to the same `paradigms` stack.

`src/components/SelectActivity.svelte` resolves `current.hintRef ?? activity.ui.hintRef`. The existing composite modal therefore renders the two inline εἰμί charts in one stack with their authored titles, no More/Back controls, and the existing single Close footer.

### Greek-tap contract and narrow layout

While implementing section 3.4, I found code/spec drift: both `Paradigm.svelte` and its shared `MeaningsCard.svelte` made the entire Greek-plus-English cell a button. Clicking the English gloss therefore played the Greek clip, contrary to Directive 9 and this spec's explicit English-not-tappable requirement.

The surgical correction makes `.pg-cell` an inert layout container, puts only the Greek in `button.pg-greek-tap`, and leaves `.pg-gloss` as a sibling. The CSS retains the old padding and disabled-ink treatment. This is an interaction-boundary correction, not the out-of-scope Meanings disclosure restyle.

The first 320px rail pass then exposed two width effects from the corrected structure and data nesting: slash-separated gloss text contributed intrinsic width, and the arrow examples lost width to both the numbered-list indent and accordion padding. Explicit gloss wrapping plus a `max-width: 359px` rule scoped to arrow charts inside `.rc-item-below` removed the overflow. The rerun measured 0px at every chapter 9/10 stop and retained the wide layouts unchanged.

## Harness changes

| Harness | Change |
| --- | --- |
| `check-content-shapes.mjs` | Permanently rejects any owned `repeatCheckbox` or `Repeat This Exercise` checkbox; validates exactly one non-empty hint-chart shape; validates inline paradigm blocks; walks every item/UI `hintRef`. |
| `ui-behavior.mjs` | Replaces popup-era Stem checks; targets λύω and both εἰμί forms independent of shuffle; asserts 12 Greek buttons and 12 inert glosses; asserts Repeat absence plus retained retry semantics on both spellers; hard-codes Active-correct/Middle-wrong checks for all six corrected forms. |
| `ui-modals.mjs` | Replaces the removed palatal popup with an explicit εἰμί hint surface, explicitly seeks both chapter 10 hint variants, and treats an opener failure or absent modal as `BAD` rather than silently skipping it. |
| `ui-walk.mjs` | Inventories `pg-greek-tap`, recognizes activity- or item-level hint routes, and labels captured hints from the rendered chart titles. Its generic disclosure walk opens all five Stem accordions. |

Suite totals:

- behavior: 857 at the actual starting HEAD to 871, all passing. The older 856 figure in the XPATCH handoff predates a later checked-in accordion assertion;
- modal matrix: 150 to 150. One obsolete popup surface was removed and one explicit εἰμί surface was added, preserving 30 surfaces across five viewports; and
- chapter 9/10 rail scope: 44 stops at two widths, with 114 expected width-specific page states.
- full shared-renderer regression scope: 219 stops at two widths, with 612 expected width-specific page states.

## Verification evidence

| Command/check | Final result |
| --- | --- |
| `npm.cmd run check:shapes` | PASS: all 10 chapter files and the expanded Repeat/hint-reference invariants |
| `npm.cmd run build` (through `npm.cmd run verify`) | PASS: 101 modules transformed; PWA precache 37 entries |
| `npm.cmd run check:lazy-chunk` | PASS: 10 chapter chunks plus 10 lexicon chunks emitted and precached; chapter data absent from the main chunk |
| `npm.cmd run ui:behavior` with `BASE=http://127.0.0.1:4173` | PASS: 871/871 behavior checks |
| `npm.cmd run ui:modals -- --base=http://127.0.0.1:4173 ...` | PASS: 150/150 modal states at 390x844, 390x734, 390x664, 320x360, and 768x1024; pinned Close; zero overlay overflow |
| `npm.cmd run ui:walk -- --base=http://127.0.0.1:4173 --chapters=chapt_9,chapt_10 ...` | PASS: 44 stops x 2 widths; 114/114 expected page states; 0px horizontal overflow; live rail Next; all authored expanders/chart states opened; no console errors |
| `npm.cmd run ui:walk -- --base=http://127.0.0.1:4173 --chapters=chapt_1,...,chapt_10 ...` | PASS: 219 stops x 2 widths; 612/612 expected page states; 0px horizontal overflow in all ten chapters; live rail Next; all authored expanders/chart states opened; no console errors |
| `npm.cmd run ui:offline` with `BASE=http://127.0.0.1:4173` | PASS: 44 stops rendered, 0 missing, activity-route refresh OK, no console errors |
| `node --check` on changed `.mjs` files | PASS |
| `git diff --check` | PASS; Git reports only the repository's LF-to-CRLF working-copy notices |

The production build still emits the pre-existing Svelte accessibility warning at `DivideActivity.svelte:370` (`tabIndex` on a noninteractive element). This round did not touch that component, and the warning is not introduced by 5G-SPEC2.

## Fixed-PDF comparison

I used the supplied `F:\greekapp\ch9railwalkFIXED.pdf` (13 pages, SHA-256 `10D8B9899A807A24A6BF9F8232BD73B8AA253C459BB2A2BD68875E109C4B4656`) and `F:\greekapp\ch10railwalkFIXED.pdf` (14 pages, SHA-256 `871B1558486A3FCE8F5C17B4BFA725F7DC498A2897CC2B319CAE8AC00353F4B8`) as the visual references.

- The chapter 9 fixed walk confirms the corrected `I come, go` wording.
- The chapter 10 walk shows the five Stem Variations and their arrow-form examples; the corrected delivered data intentionally relocates those examples from old popup links into one disclosure under each numbered rule.
- The chapter 10 parsing reference shows the Future Active/Future Middle pair; the form-dependent εἰμί exception now uses the same stacked visual treatment.
- Neither fixed walkthrough supports retaining the rejected whole-verse Repeat control.

## Deviations and surprises

1. The spec says the delivered JSON must be the first commit, while the user says not to commit. Nathanael had already created the exact data-only checkpoint `021a03d`, so no additional commit was needed or made.
2. The shared paradigm DOM wrapped English glosses inside the Greek audio button. This was unratified drift against section 3.4, so both shared row renderers received the same small structural correction.
3. `scripts/assemble_ch10.py` is stale and out of this spec's authorized data scope: lines around 501-509 still author `repeatCheckbox`/`Repeat This Exercise`, the Stem builder remains popup-era, and its hint registry contains only `futureParadigms`. Rerunning it would regress the delivered JSON. I did not edit it; the new shape guard will fail such regenerated output. There is no checked-in `assemble_ch9.py`.
4. The delivered `chapt-09.json` retains an older `_objectives_note` saying the Rom 6:23b fix was pending, alongside the corrected objective and a later `_objective_note` recording the fix. This metadata contradiction has no rendered effect and was left verbatim under the data rule.
5. Two preview processes were present locally: `localhost:4173` initially resolved to a stale bundle while `127.0.0.1:4173` served the fresh build. All recorded final browser evidence was explicitly pinned to `127.0.0.1`.

## Acceptance checklist

- [x] Delivered data exists verbatim in the pre-work, data-only first checkpoint (`021a03d`); no implementation commit was made.
- [x] Section 1 parse/count/content assertions pass and are recorded above.
- [x] Repeat is fully removed; retry-until-right and Restart are verified.
- [x] Item-level hint routing and both `hintCharts` shapes are implemented; the εἰμί stack follows section 3.
- [x] Stem Variations show five interspersed, collapsed `Examples` disclosures.
- [x] All six answer flips independently grade Active correct and Middle incorrect.
- [x] Build, shape, lazy-chunk, behavior, modal, rail, and 44-stop offline checks are green.
- [x] No data, lexicon, audio manifest, cache architecture, route-mount scan, or audio-byte writer changed.
- [x] Results and cumulative BUILD handoffs are delivered; nothing was committed or pushed.
