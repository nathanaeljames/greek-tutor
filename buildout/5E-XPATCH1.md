# 5E-XPATCH1.md — port Opus pieces onto the Sol base

Base accepted: the **Sol** 5E-SPEC1 working tree.
Target: Codex, same repo copy that produced `5E-SPEC1-RESULTS-SOL.md`.
Deliverables: no BUILD document. Append an XPATCH section to
`5E-SPEC1-RESULTS-SOL.md` (§11, shape in §5 below), then author
`VERIFY-5E.md` per §6.

Three code items and one verification gap. Everything else in the Sol
base stands as shipped — in particular its topic-id `resolveHintRef`,
`getGreekTapMap`, `vocabDisplay`/`lexicalForm`, the `[[i]]` markup, the
fourteen §0 data edits, and both harnesses are correct and are NOT
touched by this patch.

A note on what is deliberately absent: the grading pass initially
flagged `hintRef` topic-id resolution as an Opus-only fix. That was a
grader error — the Sol base already resolves it generically in
`resolveHintRef` via `nestedParadigm`, and the two implementations are
functionally equivalent. Nothing to port.

## 1. Sentence prompt: move the fix from data into code

**Why.** The Sol base makes chapter 4's Greek Noun Drill and chapter 5's
First Declension Noun Drill render their prompts by ADDING
`promptFrom: {show: "sentence"}` to `chapt-04.json` and `chapt-05.json`.
That works, and it is correctly reported under §0. But it is a hand edit
to generated data: the next run of `assemble_ch4.py` / `assemble_ch5.py`
drops it, both drills silently return to `pending: true` for every item,
and the drill renders as "pending content verification" with no error.
The parallel Opus run put the same fix in `buildSelectQuestions`, where
regeneration cannot reach it.

Take both. The code fallback is the durable fix; the data keys can stay
(they are now redundant, and harmless — an explicit `promptFrom` still
wins).

**Change.** In `src/lib/content.js`, inside `buildSelectQuestions`, where
`promptField` is derived from `activity.promptFrom`, add a fallback for
an activity that declares no prompt side at all:

```js
  // Chapters 4 and 5 carry the prompt inline on the item with no
  // promptFrom. Without this fallback every item resolves to
  // pending:true and the whole drill renders as a pending placeholder —
  // silently, which is how it would survive a "did the card render"
  // check. An explicit promptFrom still wins; this only fires when the
  // activity declares none and the items carry `sentence`.
  const impliedSentence = !activity.promptFrom
    && Array.isArray(activity.items)
    && activity.items.some(it => it && it.sentence != null);
```

and fold `impliedSentence` into the existing `promptField` resolution so
it yields `'sentence'` when true and nothing else is declared. Leave the
`promptFor` normalizer as it is — it already reads `item.sentence` when
`promptField === 'sentence'`.

**Do not remove** the two `promptFrom` data keys. They are reported in
RESULTS §3 and removing them would make that report wrong.

**Acceptance.** Temporarily delete the `promptFrom` key from
`c4_drill_greek_noun` in a scratch copy, load the drill, confirm the
sentence prompt still renders and no item reports `pending`. Restore the
key. `npm run check:shapes` green either way.

## 2. Reveal-button order from `ui.buttons`

**Why.** Chapters 4 and 5 list Hint before Translate/Gender in
`ui.buttons`; chapter 3 lists Translate before Hint. Both rail walks
show the chapter-4/5 order. The Sol base renders a fixed template order,
so one of the three chapters is wrong on screen whichever order is
hard-coded. Reading the order from the data makes all three right at
once and costs three lines.

**Change.** In `src/components/SelectActivity.svelte`, where the control
row renders Hint and the `revealButtons`, order the rendered controls by
their position in `activity.ui.buttons` when that array is present,
falling back to the current template order when it is absent.

```js
  // The button ORDER is authored: ch3 lists Translate before Hint, ch4
  // and ch5 list Hint first, and both rail walks agree with their own
  // chapter's data. Order from the data rather than from the template so
  // no chapter is wrong on screen.
  $: buttonOrder = Array.isArray(activity.ui?.buttons) ? activity.ui.buttons : null;
```

Match on the button's label. A control whose label is not in
`ui.buttons` keeps its current relative position after the ordered ones.

**Acceptance.** ch3 Verb Translating renders Translate then Hint; ch4
Greek Noun Drill and ch5 First Declension Noun Drill render Hint then
their reveal; ch5 Definite Article Drill renders Hint then Gender. Assert
in `ui:behavior` by reading the rendered control row's text order.

## 3. Meanings card: extract the component

**Why.** The Sol base renders the Meanings table inline inside
`Paradigm.svelte`. It works and it validates (`validateMeanings` in
`check-content-shapes.mjs` is good, and stays). But the same table has
two hosts — the expander under a chart, and the drill Hint popup — and
the parallel Opus run extracted it to a 55-line `MeaningsCard.svelte`
consumed by both. That is the right shape for a surface with two
callers, and chapters 6+ add more paradigm charts with the same table.

This is the one item in this patch that is structural rather than
behavioural. It should produce **no visual change whatsoever**.

**Change.** Extract the Meanings markup and styles from
`Paradigm.svelte` into `src/components/MeaningsCard.svelte` taking
`{meanings, title}` as props, and import it at both call sites. Keep
every existing class name and every existing CSS rule so the rendered
output is byte-identical; this is a move, not a redesign. `legend` and
`closing` render exactly as they do now.

**Acceptance.** Screenshot the ch4 Neuter Declension Meanings expander
and the ch5 First Declension--Eta Meanings expander before and after at
320px and 768px; the images must be identical. `ui:walk` output for both
chapters unchanged. `check:shapes` green.

## 4. Offline preview walk — run it, do not change code

**Why.** The Sol base ran an offline smoke test (SW controlled, uncached
fetch rejected, ch4 and ch5 activity routes loaded, ch5 reloaded). That
is more than the parallel run did, and it is not nothing — but it is a
route check, not a rail walk. Directive 4 asks for the preview
equivalent of the airplane-mode pass every phase, and two whole chapters
went in this round.

**Run.** Built preview, service worker installed and in control, browser
forced offline:

1. Hard-refresh on a chapter-4 activity route; confirm it renders under
   SW control.
2. Full chapter-4 rail walk, 27 stops plus the end-of-chapter dialog.
3. Full chapter-5 rail walk, 35 stops plus its end dialog.
4. Spot-check one chapter-1, one chapter-2 and one chapter-3 activity.
5. Separate expected missing-audio resource errors from any unexpected
   exception, and report both counts.

**Acceptance.** Both new rails complete offline, both end dialogs
reachable, zero unexpected exceptions. If anything fails, STOP and
report rather than touching the audio or service-worker layers — that
architecture is frozen.

## 5. RESULTS update

Append to `5E-SPEC1-RESULTS-SOL.md`:

```markdown
## 11. XPATCH1 (cross-patch from the parallel Opus run)

1. **Sentence prompt resolved in code.** `buildSelectQuestions` now
   infers `promptField = "sentence"` when an activity declares no
   `promptFrom` and its items carry `sentence`. The two `promptFrom`
   data keys added under §0 remain and still win when present; the
   fallback means a regenerated chapter-4/5 file cannot silently return
   both noun drills to a pending placeholder.
2. **Reveal-button order read from `ui.buttons`.** ch3 renders Translate
   before Hint and ch4/ch5 render Hint first, each following its own
   authored order, which is what both rail walks show.
3. **`MeaningsCard.svelte` extracted.** The Translation of Inflectional
   Forms table moved out of `Paradigm.svelte` into its own component
   with two hosts (the chart expander and the drill Hint). Pure move —
   before/after screenshots identical at both widths.
4. **Offline preview rail walk** run for chapters 4 and 5 (previous pass
   was a route smoke test): [results].

Unchanged from the base and explicitly not touched: topic-id
`resolveHintRef`, `getGreekTapMap`, `lexicalForm` display, `[[i]]`
markup, the fourteen §0 data edits, `check-content-shapes` validators,
and both harnesses.
```

Record the real acceptance numbers inline, and re-report the
chapter-1/2/3 chunk hashes to confirm they are still unchanged.

## 6. Then author VERIFY-5E.md

After the four items above land, write `buildout/VERIFY-5E.md`.

**The rule for this document, and it is the point of it:** nothing that
an automated click-through can settle belongs in it. Both harnesses now
cover rendering, layout, overflow, tap-target colour, button sets, chart
switching, reveal placement and clearing, revisit-reset, and advance
timing across all five chapters. Anything in that set is a fact, the
harness owns it, and putting it in front of Nathanael wastes the one
resource this project cannot script. Round 1 of 5D asked him to confirm
40+ such items; do not repeat it.

What VERIFY-5E asks for is **taste, device reality, and audio** — three
things no harness can reach.

Include exactly these:

**Judgement calls (spec §10 items 1-5, restated for the device):**

1. Does the More/Back switch read as "there is a second chart here", or
   as a dead end? Three surfaces: ch4 Masculine Declension, ch5 First
   Declension--Alpha, ch5 Definite Article Paradigm.
2. Does the Singular/Plural toggle on the definite article read
   correctly, given the button names the chart you are NOT on?
3. Does the Declining Noun Drill reveal its translation automatically on
   answer in the original, or only on the button? Both chapters. This is
   the one behaviour deliberately not guessed — it needs DOSBox, not the
   phone.
4. Do the seven-topic Learn pages read well at phone width, or does the
   radio rail crowd the panel?
5. Is chapter 5's near-duplicate English Concepts page tedious enough on
   device to warrant a divergence, or does the original's own "proceed
   with haste" line handle it?

**Audio — the whole listening pass, since no harness plays a clip:**

6. Paradigm cells and Say Whole Paradigm across all four ch4 charts and
   all four ch5 charts.
7. `Say Whole List` on both Review Vocabulary charts (`d_vocl4`,
   `e_vocl5`).
8. The forward-shipped cumulative Scripture clips: ch4's `c_sm*` copies
   for John 14:6a, ch5's `c_sm*` and `d_sm*` copies.
9. **ch4 `d_sm6` / `d_sm6b` / `d_sm7`** — listen-check the εἰ / μὴ /
   "εἰ μὴ" assignment. Carried from the data as delivered.
10. **ch5 `e_graphn`** — referenced twice, on both γραφή and γραφῇ.
    Listen and say which one it belongs to.
11. Audio stops on route exit, and a second tap interrupts cleanly.

**Device reality:**

12. Airplane-mode walk of both chapters, after downloading each
    chapter's audio pack through the app.
13. Real WebKit rendering of the two widest surfaces the app has: ch4's
    ten-option paradigm grid and ch5's six-column Quick Review article
    chart. The harness measures 0.6px of headroom on the latter at
    320px; iOS text metrics are not Chromium's.

**Decisions the build could not make:**

14. **Scripture Memory option pools.** ch4 ships 8 choices and ch5 ships
    9, where DRILL-MATRIX says 10. Both the rail walk and the delivered
    data agree on 8/9, so neither implementer invented distractors.
    Keep source-faithful, or author the missing distractors?
15. **Definite-article column headers.** The data ships one clip per
    gender-and-number column (`e_artms`/`e_artfs`/`e_artns`/`e_artmp`/
    `e_artfp`/`e_artnp`). Surfacing them makes the English headers
    tappable and therefore blue — the only blue English in the app. Are
    they tap targets in the original, or should the headers be ink and
    the nine clips go unreferenced?
16. **ch5 `e_artmas` / `e_artfem` / `e_artneu` / `e_artpar`** have no
    surface in the rail walk and neither implementer found one.
    Intentional?
17. **ch4 `d_adepar`** — the ἀδελφός whole-paradigm clip, still with no
    chart on any Learn page. ἀδελφός appears only as the Declining Noun
    Drill's third family. Intentional?
18. **ch4 Greek Noun Drill item 3 (Mat 5:24).** The shipped underline is
    `brother`; the run table said `to`. Confirm against DOSBox.
19. **δόξα's merged row label** — `Nom./Voc` (data and rail walk) or
    `Nom./Voc.` (spec §3.2)? One character, shipped as the data has it.
20. **The English gloss option grids** on both Vocabulary: Greek to
    English drills render four-up; the original is two-up. Pre-existing
    since chapter 1 and device-verified that way in chapters 1-3, so it
    is out of this round's scope — but it is a real divergence and wants
    a decision for a later cohort.

Do NOT include: page-by-page rendering confirmation, overflow checks,
which words are blue, button presence, chart column alignment, timing
measurement, or revisit-reset. All of those are in `walk-report.json`
and `behavior-report.txt` and are settled.

Format each item as a checkbox with space for a verdict and notes.
