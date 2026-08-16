# 5G-XPATCH3.md — port Opus pieces onto the Sol base

Base accepted: the **Sol** 5G-SPEC3 working tree.
Target: Codex, same repo copy that produced `5G-SPEC3-RESULTS-SOL.md`.
Deliverables: the complete `git diff` of this patch appended to (or
beside) a new section in `5G-SPEC3-RESULTS-SOL.md`. No BUILD narrative.
**Nothing committed, staged, or pushed** — ground rule 1 of 5G-SPEC3
still stands.

Four items: two ported from the parallel run, one divergence-log
backfill, and one assertion neither run has. The Sol base's behavioral
work stands unchanged — in particular `stopAudio()` on toggle, the
hintRef scoping gate, the audio-cache eviction in the harness, the
ten-chapter rail walk, and the formula validation are all correct and
are NOT touched.

**Before you start:** the εἰμί extension is inside its objection window
(5G-SPEC3 §2, RESULTS deviation 1). Items 1 and 4 below both touch that
surface. If Nathanael has reversed the extension, say so and skip the
εἰμί half of each — do not implement labels and assertions for a
surface that is being removed.

## Why this base

Both trees implement all three feedback items correctly. The Sol tree
additionally stops the outgoing paradigm clip when the chart is
replaced; the parallel tree leaves it playing over the new chart, which
is the 5E-SPEC2 §3.1 failure shape (a content swap that does not
remount) and the thing §2.2 of that spec called the most confusing
behavior in the app. The Sol tree also ran the full ten-chapter rail
walk after a shared-renderer round. Those are the expensive halves to
port; the two items below are cheap.

## 1. Port: derive the toggle labels from the chart titles

**Why.** The Sol base hardcodes the button words in the component:

```js
const HINT_DISCLOSURE_TARGETS = {
  middlePassiveParadigms: ['Passive', 'Middle'],
  futureParadigms: ['Middle', 'Active'],
  eimiParadigms: ['Future', 'Present']
};
```

That works and it is resilient to a retitle, but it puts English content
words in a component and creates a second place for "Passive" to live —
a second place for it to disagree with the chart it names. The parallel
run derived the label from the titles the data already carries, which is
the better shape and the one DISCLOSURE-RULES §4.1 describes ("if a
one-word contrast exists that is meaningful without the noun, the button
toggles between those words... otherwise More/Back").

**Change.** Add to `src/lib/content.js`, verbatim from the parallel run:

```js
// THE TOGGLE LABELS OF A TWO-STATE HINT (5G-SPEC3, DISCLOSURE-RULES 4.1).
// If a one-word contrast exists that is meaningful without the noun, the
// toggle reads that word; otherwise it falls back to More/Back. The three
// shipped pairs each differ in EXACTLY ONE word of their titles, and that
// word IS the contrast the rule asks for:
//   Present [Middle] Indicative Paradigm  / Present [Passive] Indicative Paradigm
//   Future [Active] Indicative Paradigm   / Future [Middle] Indicative Paradigm
//   [Present] Active Indicative of eimi   / [Future] Active Indicative of eimi
// So the label is DERIVED from the titles the data already carries rather
// than authored beside them: a second place to write "Passive" is a second
// place for it to disagree with the chart it names. Titles that do not
// differ in exactly one word get More/Back, the rule's own fallback.
// The returned array is indexed BY STATE: entry i is the contrast word of
// title i. Callers index it by the TARGET state, so the button names where
// it goes, not where it is.
export function paradigmToggleLabels(titles) {
  const words = (titles || []).map(title => String(title || '').trim().split(/\s+/));
  const fallback = (titles || []).map((_, index) => (index === 0 ? 'Back' : 'More'));
  if (words.length !== 2 || words[0].length !== words[1].length || !words[0].length) return fallback;
  const differing = words[0].map((word, index) => word !== words[1][index]).reduce(
    (found, differs, index) => (differs ? [...found, index] : found), []);
  if (differing.length !== 1) return fallback;
  const at = differing[0];
  return [words[0][at], words[1][at]];
}
```

In `SelectActivity.svelte`, delete `HINT_DISCLOSURE_TARGETS` and replace
the label reactive. **Mind the indexing — the two runs use opposite
conventions and getting this wrong inverts every label without failing
anything.** The Sol table is indexed by the CURRENT state (its entries
already name the other chart); the derived array is indexed by state, so
it must be read at the TARGET:

```js
  $: hintToggleLabels = paradigmToggleLabels(
    (hintChart?.paradigms || []).map(chart => chart.title));
  $: hintParadigmTarget = hintDisclosure
    ? hintToggleLabels[1 - hintParadigmIndex]
    : null;
```

Keep `hintDisclosure` and its `HINT_DISCLOSURE_REFS` gate exactly as it
is — the derivation decides what the button READS; the hintRef gate
still decides WHETHER a surface toggles at all, which is what keeps §5's
"do not generalize" boundary. Rename the surviving constant if it now
reads oddly as a bare list of refs.

**Acceptance.** All three surfaces read the same words they read today:
Middle state shows "Passive", Passive shows "Middle", Future Active
shows "Middle", Future Middle shows "Active", Present εἰμί shows
"Future", Future εἰμί shows "Present". Item 4's guard pins this.

## 2. Port: `actionsPinned` instead of nulling `sayWhole`

**Why.** The Sol base suppresses the chart's internal control row by
handing `Paradigm` a doctored copy of the data:

```js
$: hintParadigmBody = hintParadigm ? { ...hintParadigm, sayWhole: null } : null;
```

It renders correctly today, but it changes the data to get a
presentational effect, and it couples the two: the moment `Paradigm`
reads `sayWhole` for anything besides drawing that button — an
aria-label, a conditional class, a count — the null propagates somewhere
it was never meant to go. The parallel run states the contract instead:
the host owns that row, so tell the component.

**Change.** In `src/components/Paradigm.svelte`, add an optional prop
defaulting to the current behavior:

```js
  // The control row (Say Paradigm, and the switch where a chart has one)
  // normally lives inside the chart body. A host that pins its own row —
  // the two-state Hint modal, whose footer holds Say + toggle + Close
  // outside the scroller (DISCLOSURE-RULES 4.3) — passes true and draws
  // the row itself. Every other host passes nothing and is unaffected.
  export let actionsPinned = false;
```

and gate the existing control-row block on `{#if !actionsPinned}`. The
exact guard site depends on the current markup: it is the block that
renders `sayWhole` and the `pg-switch` control, not the chart grid.

In `SelectActivity.svelte`, delete `hintParadigmBody` and pass the real
object:

```svelte
  <Paradigm paradigm={hintParadigm} title={hintParadigm.title || null} actionsPinned={true} />
```

**Acceptance.** No visual change anywhere. Specifically: the two-state
Hint still draws exactly one Say Paradigm button (the pinned one, in the
footer) and no second one inside the scroller; and the ch3/4/5
Paradigm-Endings hint modals, every Learn topic chart, and both Quick
Review pages are pixel-identical to before. This is the item that
touches a component ten chapters render through, so the ten-chapter
`ui:walk` is not optional here — run it and report the state count.

## 3. Backfill: the four divergence entries

**Why.** The spec asked for the divergence references in RESULTS and the
Sol base has them there. But standing practice is that every deliberate
departure is recorded in `DIVERGENCE-LOG.md` at decision time, and this
round produced four. The parallel run wrote them; the Sol tree's log is
missing them.

**Change.** Add to `buildout/DIVERGENCE-LOG.md`, in the file's existing
entry format:

- **D-48f1** — ch9 drill Hints show one paradigm at a time with a
  Middle/Passive toggle. The original draws only the Middle chart; the
  port previously stacked Middle and Passive in one scrolling modal.
  Nathanael's ruling (5G-FEEDBACK-1 item 1); a two-state control is
  closer to the original than the stack was.
- **D-48f2** — ch10 Introduction formula is tappable: the derivation
  line `λύ + σ + ω` is one tap unit playing `chapt_10_j_luw1s`, and
  λύσω in the gloss line taps to the same clip. The original's formula
  is silent (5G-FEEDBACK-1 item 2).
- **D-48f3** — ch10 drill Hints show one paradigm at a time with an
  Active/Middle toggle, same reasoning as D-48f1 (5G-FEEDBACK-1 item 3).
- **D-48f3e** — the εἰμί hint gets the same two-state treatment, DERIVED
  from DISCLOSURE-RULES §4.1 rather than requested in the feedback.
  Flagged for reversal; note the objection window and that reversing it
  is a two-line change.

Match the log's existing heading and field conventions; do not restyle
the file.

## 4. New: pin the two things that can silently degrade

Neither run has these, and each covers a failure that passes every
assertion currently in the suite.

**4a. A playing clip STOPS on toggle.** The Sol base implements this;
its assertion should pin the conduct rather than the code. The parallel
run's check — press toggle, assert zero NEW clips — is satisfied while
the previous clip plays on, which is exactly how that bug survived a
green suite. In `ui-behavior.mjs`, on the ch9 and ch10 surfaces (the two
with authored say-all clips):

```js
  // Press Say Paradigm, let it get going, then toggle. The OLD clip must
  // stop: it belongs to the chart that just left the screen. Asserting
  // "no new clip started" is not this check — a clip that is still
  // playing satisfies that trivially, which is how this bug passes a
  // green suite.
  await hintSay().click();
  await page.waitForTimeout(400);
  const playingBefore = await audioIsPlaying(page);
  await hintToggle().click();
  await page.waitForTimeout(200);
  check(`5G-XPATCH3 ${surface.id}: toggling stops the outgoing paradigm clip`,
    playingBefore && !(await audioIsPlaying(page)),
    `playing before toggle: ${playingBefore}, after: ${await audioIsPlaying(page)}`);
```

using this harness's existing playing-state accessor (the audio element's
`paused`/`currentTime`, not the request log — the question is whether
sound is still coming out, not whether a file was fetched).

**Prove it bites.** Temporarily remove `stopAudio()` from
`toggleHintParadigm()`, confirm the new check FAILS, restore it, and
paste the failure output into the RESULTS amendment. An assertion nobody
has watched fail is an assertion nobody has tested.

**4b. The derived labels are the expected words.** Item 1 trades
resilience for freedom-from-drift: if the pipeline ever retitles a chart
so the pair no longer differs in exactly one word, the toggle silently
falls back to "More/Back" and the one-word contrast the feedback asked
for is gone, with nothing failing. Pin it:

```js
  // Item 1 derives these from the chart titles. A retitle that breaks the
  // one-word contrast degrades to More/Back SILENTLY, so the expected
  // words are pinned here: this check failing means the data changed and
  // the labels need a decision, not that the derivation is broken.
```

Assert the six expected label readings named in item 1's acceptance,
one per state per surface. Where the harness already reads the toggle's
text for the state assertions, this may fold into those rather than
adding six new checks — either is fine, so long as a fallback to
"More/Back" fails loudly.

## 5. Not ported, and why

- The parallel run's `hintStateIndex` reset (`$: if (hintChart) hintStateIndex = 0;`).
  The Sol base already resets state on open, on toggle-back, and when an
  item-level hintRef changes behind an open modal, and tests the last
  case with a deterministic shuffle traversal. Same outcome, better
  covered.
- Its 908-vs-898 check count. Different accounting of the same work;
  neither is a coverage measure.
- Its `ui:walk` scope (chapters 9-10). The Sol base's ten-chapter walk
  is the one that stays, and item 2 makes it mandatory this round.

## 6. RESULTS amendment shape

Append to `5G-SPEC3-RESULTS-SOL.md`:

```markdown
## XPATCH3 (cross-patch from the parallel run)

1. **Toggle labels derived from chart titles** — `paradigmToggleLabels()`
   in content.js replaces the hardcoded label table; the hintRef gate
   still scopes WHICH surfaces toggle. Labels index by target state.
2. **`actionsPinned` replaces the nulled-sayWhole spread** — Paradigm
   takes an optional prop and the Hint modal passes true; the data
   object reaches the component intact. No visual change: [ten-chapter
   walk result].
3. **Four D-48 divergence entries** backfilled into DIVERGENCE-LOG.md.
4. **Two new assertions** — a playing clip stops on toggle (proven to
   bite by removing stopAudio(): [failure output]), and the six derived
   labels are pinned so a retitle cannot silently degrade them to
   More/Back.

Suite: 898 -> [new total], all passing.
```

Re-run `npm run check:shapes`, `npm run build`, `npm run ui:behavior`,
`npm run ui:modals`, `npm run ui:walk --chapters=chapt_1,...,chapt_10`,
and `npm run ui:offline`; report the counts. Nothing committed, staged,
or pushed.
