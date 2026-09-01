# 5I-SPEC2-BUILD-OPUS.md — the round, in full

Model: Opus 5 (1M context), Claude Code. Spec: `buildout/5I-SPEC2.md`.
Base: `ff5239b`, clean tree. Nothing committed, staged or pushed.

This document carries the three things the grader needs: the **complete
exact `git diff`** (§4), the **full thought/tool log** (§3), and the
**per-turn wall-clock table with its cumulative total** (§1). The
handoff is `5I-SPEC2-RESULTS-OPUS.md`; the device document is
`VERIFY-5I-2.md`.

---

## 1. WALL-CLOCK

| Turn | Started (local) | Stopped (local) | Active |
| ---- | --------------- | --------------- | ------ |
| 1 | 21:41 | 23:40 | 1h59m |
| CUMULATIVE ACTIVE TIME | | | **1h59m** |

One continuous working turn. Times recorded from the machine clock as
the turn ran, not reconstructed: the start is the first tool call
(`date -u`, 2026-09-01 01:41:44Z = 21:41 local on 2026-08-31) and the
stop is the last. Downtime: none — the turn ran without a break, though
a large share of the wall clock is the six Playwright harnesses, which
run for tens of minutes each; they were run in parallel wherever they
did not contend for the machine and serially where they did, and every
one of them was re-run from scratch after the last shared-component
change rather than assumed to still hold.

---

## 2. THE SHAPE OF THE ROUND

Read order, as §0 of the spec asks: `5I-SPEC2.md`; `DISCLOSURE-RULES.md`
at the commit carrying it (§3.3 reaffirmed, §3.11, §3.12, §4.6's surface
matrix, §4.7's cursor amendment, §4.8, §4.9, §4.10 — every one of them
load-bearing); `VERIFY-5I.md` and `VERIFY-5I-ADDENDUM.md`;
`CHAT-HANDOFF.md`; `AGENTS.md`.

Work order:

1. §3.1 continuous verses — the smallest change and the one every later
   measurement depends on.
2. §3.2 the half-screen modal, including the diagnosis of why the
   existing clamp could not see it.
3. §3.3 the green-underline component work, §3.4 the frozen header,
   §3.6 the derivation size.
4. §4-§5 the data edits, as three idempotent Python scripts that assert
   the shipped shape before writing and print a before/after report —
   which is what §4's RESULTS table is generated from rather than
   transcribed into.
5. §4.7's renderer half (a hint may resolve to a content block) and the
   matching widening of `check:shapes`.
6. §6 the two sweeps, run as censuses over the data rather than as
   spot checks.
7. §7 the gates and the harness work that keeps §3-§5 from drifting.
8. §8 the visual pass.
9. The three deliverables.

---

## 3. THE LOG

### 3.1 Orientation

`git log`, `git status` — clean tree at `ff5239b`. (The session's opening
snapshot showed a dirty tree from an earlier session; the live check
showed clean, and the live check is what was used.)

Read, in the spec's order: `buildout/5I-SPEC2.md`;
`buildout/DISCLOSURE-RULES.md` in full (§1-§8) — §3.3 as reaffirmed,
§3.11, §3.12, §4.1-§4.3, §4.6's surface matrix, §4.7's cursor
amendment, §4.8, §4.9, §4.10; `CHAT-HANDOFF.md` (live state, buildout
process v2, the visual-verification requirement and its same-cohort
absorption rule, the harvested lessons); `AGENTS.md`.

Then the code, before touching any of it:

- `grep` for the two forced verse breaks the spec names — found both,
  and confirmed they are the only two by walking every renderer that
  can print a verse (`SelectActivity` prompts and reveals, `RichContent`
  `verseExamples`, `ContentAudio` `interlinearVerse`,
  `SpellVerseActivity`, the popup sheet) and by scanning all sixteen
  data files for a literal `\n` inside a Greek-bearing string.
- `src/lib/viewport.js` in full, including the W4 commentary, which is
  what made the diagnosis in §3.2 possible: the file states its own
  premise ("innerHeight — which the software keyboard does NOT shrink on
  iOS") and that premise is what is false in a standalone PWA.
- `Paradigm.svelte`, `SelectActivity.svelte`'s hint machinery,
  `RichContent.svelte`'s `greekRows` branches, `content.js`'s
  `resolveHintRef` and `paradigmToggleLabels`.
- The ch11 `switch: 'named'` data and `hintCharts` shapes, which are the
  model §4.1 points at.
- A census script over all sixteen chapters for every `popupRef`,
  `[[link:` and `titleLink` — the §6.1 population, computed rather than
  assumed, BEFORE deciding what to convert.

### 3.2 §3.1, continuous verses

`SelectActivity`: the continuation span becomes `.prompt-cont`, inline,
carrying a single leading space inside the same button. `longPrompt`
starts measuring the joined string. A second ramp step, `veryLongPrompt`,
replaces the old `two-line` class — keyed to length, with the threshold
chosen by measuring the data (1,065 select prompts across sixteen
chapters; 130 with a continuation, 22-77 clusters; 935 without, 1-47) so
that every ONE-LINE prompt keeps exactly the size it has and the set
that steps down is precisely the joined verses.

`RichContent`: the two `.rc-verse-line` spans join the same way.
`app.css`: both `display: block` rules go.

### 3.3 §3.2, the half-screen modal

Diagnosis first: why could the existing clamp not see this? Reading the
file's own W4.2 rationale gave the answer — it compares the visual
viewport against `window.innerHeight` on the premise that the keyboard
does not shrink `innerHeight`, which is a Safari-tab-UI fact and not a
standalone-PWA one. A stale reading therefore shrinks both numbers
together and the ratio test passes.

Four changes, written as one commented block that names the round:
`focus` and `resume` join the triggers; a resume opens a 600 ms window
in which the app's own last published height may overrule a
measurement; a resume schedules four measurements across 400 ms instead
of one rAF; and a materially smaller reading is published but not
believed for 750 ms, so the reference cannot be poisoned by a phantom
that arrives as a plain `resize` a few milliseconds before the
foreground event.

### 3.4 §3.3, §3.4, §3.6

`.rc-prose-trigger` added and two call sites moved onto it (the
`endingTransformation` label, the `.rc-stem-note` marker); the ch13 Key
Letter Box and ch6 case-chart glosses deliberately left on
`.rc-chart-trigger`. `Paradigm` gains `frozenHead` and `.pg-frozen-head`
sticks `.pg-head` to the top of the modal's scroller. `derivation` gains
a layout class and a size.

### 3.5 §4-§5, the data

Three Python scripts, one per chapter group, each of which asserts the
shipped shape before writing (`assert line.get('tapUnit') is True`,
`assert titles == [...]`, `assert drill['items'][0]['ref'] == 'Mar 4:2'`,
and for ch16 an equality both ways between the six `graphoPassive` items
and the six γράφω forms in the pool). Each prints a before/after report,
and §4 of RESULTS is that report rather than a transcription of it.

Formatting was verified before the first write: every unedited data file
round-trips exactly through
`json.dumps(..., ensure_ascii=False, indent=1)` with no trailing
newline, which is byte-identical to what `assemble_chNN.py` writes.

The first ch14 run crashed on `print` (cp1252 console) AFTER writing the
file; it was reverted with `git checkout` and re-run under
`PYTHONIOENCODING=utf-8` so the report and the file came from the same
execution.

### 3.6 §4.7's renderer half

`check:shapes` failed on the two reshaped hints — correctly, since it
required a `paradigm`. The gate is widened rather than bypassed: a chart
entry must be a paradigm or a block whose `type` is in the file's own
`BLOCK_TYPES` set.

### 3.7 NOT IN THE SPEC: the topic audioMap gap

Found by the new §4.2 assertion rather than by reading (see §3.9), and
written up in full in RESULTS §3.7: a topic's own form-to-clip map never
reached its own prose, and chapter 13's Introduction is the only page in
sixteen chapters where that is visible. Fixed as a MERGE in
`ContentAudio`, and the other four audioMap topics were re-driven
afterwards to prove nothing that tapped stopped tapping.

### 3.8 §7, the harness work

`ui-behavior`: the §2.7 block rewritten for the join, plus a new
5I-SPEC2 section asserting the πᾶς surface matrix on all three surfaces,
the three Introduction taps, the tap boundaries, the §4.4 merge and
topic count, the §4.5 collapse in three hosts, the §4.9 frozen header
under a real scroll, ἐγενόμην, both reshaped Forms hints, the D-60
gloss census over sixteen chapters, and the §5 routing with a census
behind each sample.

`ui-disclosure`: a new D21 block for the §6.1 sweep — the three prose
labels green underlined and bold, the Key Letter Box still blue, the
marker green in both its hosts, and the whole `popupRef` census
recomputed from the data.

`ui-modals`: the surface list rewritten for the new hint shapes, and the
§3.2 guard.

FOUR harness assertions were WRONG when first written. Every one was
fixed by measuring what the right property actually is, never by
loosening the check, because a green test that asserts the wrong thing
is worse than a red one. The full list is in RESULTS §7.2; in order of
discovery: the §6.1 census counted 17 triggers where the drawn
population is 22; the §3.1 flow check demanded that the continuation
share a line box with the head, which 54 of 514 renders legitimately do
not; the §4.9 header check demanded that a sticky header never move,
which is not what sticky means; and the D-60 gloss census swept every
`gloss` key in the data and caught eight chapter-2 VOCABULARY glosses,
where lower case is the dictionary convention and correct.

### 3.9 What the new assertions caught in the app itself

Two of the new checks failed on their first run against real defects,
which is the point of writing them:

- **§4.2 reported `[]` where it expected three taps.** The data edit was
  correct and the page still rendered three inert words. Traced to
  `ContentAudio` handing a topic's `audioMap` to `RichContent` as
  `noteTaps`, which paragraphs do not read — and to the fact that eight
  of the nine topics in the app carrying an `audioMap` sit on an
  activity with `greekTaps: true`, which folds the same pairs in by
  another route. Chapter 13 is the ninth. Fixed by MERGING the topic map
  over the resolved map (RESULTS §3.7), then re-driving the other four
  audioMap topics to prove nothing they tapped stopped tapping.
- **§4.8's census reported eight lower-case glosses in chapter 2.**
  Investigated rather than suppressed: they are vocabulary glosses, not
  paradigm cells, and D-60 is about paradigm cells. The census was
  scoped; the eight are correct as they stand.

### 3.10 §8, the visual pass, and what it found

A dedicated shots script photographs the pages §8 names at 320px and
390px, and a second script (now `scripts/ui-verse-flow.mjs`) walks EVERY item of
all twelve translation drills at 320px and 768px measuring computed
size, the probe height, and card/page/prompt overflow.

That second script is what found §9.3: 514 renders, exactly ONE computed
prompt size. The 5F `two-line` rule had never applied, because
`.prompt.greek.long` outranks `.prompt.two-line` on specificity. Fixed
by writing the new rule at equal specificity and later in the file;
re-measured: two sizes, 51 renders at the smaller step, all of them
items with a continuation, and still zero overflow anywhere.

The §3.2 guard also failed on its first run — G1 reported that the
forged viewport did not shrink the published height. Debugged rather
than adjusted: three throwaway probe scripts established that the forge
DOES take (`inner=380 vv=380`), that the app republishes on a real
resize, that a synthetic `resize` does reach the listener, and that the
publish lands ~250 ms later rather than within the 120 ms the guard
allowed. The guard was then rewritten to be decisive rather than merely
passing: it points at the app's TALLEST modal (ch16's fifteen-row stem
list, whose box really is governed by `--modal-vh`), waits long enough,
and its third assertion isolates the settle chain by changing the
viewport to a plausible NEW height mid-resume with no event to announce
it. Measured on the fixed code: 844/710 baseline → 380/300 phantom →
844/710 resumed → 800 settled.

### 3.11 Gate tallies

Full detail, including what each harness gained and the four assertions
that were wrong when first written, and the ui-walk hint prober that had
to learn the new block route, is in `5I-SPEC2-RESULTS-OPUS.md`
§7-§8. The numbers:

| Gate | Result |
| --- | --- |
| `check:shapes` | PASS, sixteen chapters |
| `build` | PASS, 49 precache entries |
| `check:lazy-chunk` | PASS, 16 + 16 chunks |
| `check:docs` | 43 failures — the standing baseline, reproduced on a clean tree first |
| `ui:behavior` | 1257/1257, including 29 new 5I-SPEC2 assertions |
| `ui:modals` | 481/481 clean, five device heights, plus G0-G4 |
| `ui:disclosure` | 309/309 |
| `ui:disclosure3` | 100/100, activity census unmoved at 368 |
| `ui:walk` | 368 stops x 2 widths, ALL SIXTEEN chapters, zero overflow. Exited 1 on four interaction errors, all of them its Hint prober not knowing §4.7's content-block payload; prober taught, ch14/ch15 re-walked clean (exit 0) |
| `ui:offline` | 51 stops, 0 missing, refresh OK |
| `ui:verseflow` (new) | 514/514 item renders clean |

The §3.2 guard, which is the round's headline assertion, reported:

```
OK   §3.2 guard  G0 the guard is pointed at a modal tall enough to be governed by --modal-vh  --modal-vh 844px, modal 710px
OK   §3.2 guard  G1 the forged stale viewport really does shrink the published height and the modal with it  --modal-vh 844 -> 380px, modal 710 -> 300px
OK   §3.2 guard  G2 the resume clamp refuses the phantom and the modal is full height again  --modal-vh 844px (baseline 844px), modal 710px (baseline 710px)
OK   §3.2 guard  G3 the settle chain re-measures after the resume, with no further event  --modal-vh 800px, expected 800px (modal 710px)
OK   §3.2 guard  G4 the clamp and its DO-NOT-TRIM block are still in src/lib/viewport.js
```

G1 is the half-screen modal itself, reproduced on demand: a 710px dialog
becomes a 300px one. G2 is it going away while the forged readings are
still installed.

---

## 4. THE COMPLETE DIFF

`git status --short`. Nothing is staged, committed or pushed; the
untracked paths are this round's own deliverables plus the one new
source file, which is reproduced in full after the diff:

```
 M package.json
 M scripts/check-content-shapes.mjs
 M scripts/ui-behavior.mjs
 M scripts/ui-disclosure.mjs
 M scripts/ui-modals.mjs
 M scripts/ui-walk.mjs
 M src/app.css
 M src/components/ContentAudio.svelte
 M src/components/Paradigm.svelte
 M src/components/RichContent.svelte
 M src/components/SelectActivity.svelte
 M src/data/chapt-13.json
 M src/data/chapt-14.json
 M src/data/chapt-15.json
 M src/data/chapt-16.json
 M src/lib/viewport.js
?? buildout/5I-SPEC2-BUILD-OPUS.md
?? buildout/5I-SPEC2-RESULTS-OPUS.md
?? buildout/VERIFY-5I-2.md
?? scripts/ui-verse-flow.mjs
```

`git diff`, complete and unedited:

```diff
diff --git a/package.json b/package.json
index c6df18d..caf19db 100644
--- a/package.json
+++ b/package.json
@@ -18,6 +18,7 @@
     "ui:disclosure": "node scripts/ui-disclosure.mjs",
     "ui:disclosure3": "node scripts/ui-disclosure3.mjs",
     "ui:offline": "node scripts/ui-offline.mjs",
+    "ui:verseflow": "node scripts/ui-verse-flow.mjs",
     "ui:smoke5f": "node scripts/ui-smoke-5f.mjs",
     "ui:shots5f": "node scripts/ui-shots-5f.mjs",
     "prepare": "git config core.hooksPath .githooks || echo hooks-path-skip"
diff --git a/scripts/check-content-shapes.mjs b/scripts/check-content-shapes.mjs
index 61287c2..ba76536 100644
--- a/scripts/check-content-shapes.mjs
+++ b/scripts/check-content-shapes.mjs
@@ -677,9 +677,20 @@ for (const file of files) {
       });
     }
     if (hasCharts) {
+      // 5I-SPEC2 §4.7: A CHART ENTRY MAY BE A CONTENT BLOCK. Chapters 14 and
+      // 15's "Verb Forms" hints are the Learn page's own `stemList` — the shape
+      // that prints the gloss LAST, which the two-column paradigm they shipped
+      // as could not do (its label column put the gloss first). The hint route
+      // renders any non-paradigm entry through RichContent, so what this gate
+      // has to hold is "the entry is a block with a type the renderer knows",
+      // not "the entry is a paradigm".
       charts.forEach((chart, index) => {
-        if (!chart || typeof chart !== 'object' || Array.isArray(chart) || chart.type !== 'paradigm') {
-          problems.push(`${file}.hintCharts.${name}.charts[${index}]: expected an inline paradigm block.`);
+        const isBlock = chart && typeof chart === 'object' && !Array.isArray(chart)
+          && typeof chart.type === 'string' && chart.type.length > 0;
+        if (!isBlock) {
+          problems.push(`${file}.hintCharts.${name}.charts[${index}]: expected an inline paradigm block or a content block.`);
+        } else if (chart.type !== 'paradigm' && !BLOCK_TYPES.has(chart.type)) {
+          problems.push(`${file}.hintCharts.${name}.charts[${index}]: type "${chart.type}" is neither a paradigm nor a content block the renderer draws.`);
         }
       });
     }
diff --git a/scripts/ui-behavior.mjs b/scripts/ui-behavior.mjs
index a9ac16c..a39970f 100644
--- a/scripts/ui-behavior.mjs
+++ b/scripts/ui-behavior.mjs
@@ -2666,24 +2666,58 @@ for (const [chapterId, id] of [
       .evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length) === 1);
 }
 
-// ---- §2.7 two-line Greek prompts ----------------------------------------
-// greek2 is a LINE BREAK in one prompt, not a second prompt: one tap target,
-// one clip. Null on the items that are one line only.
+// ---- §2.7 CONTINUED PROMPTS, NOW ONE FLOWING LINE ------------------------
+// 5I-SPEC2 §3.1 / DISCLOSURE-RULES §4.10: a Bible verse is continuous text
+// everywhere and breaks only where the container breaks it. `greek2` is still
+// the positional pool's second entry in the DATA — extraction provenance the
+// assemblers reproduce — but the render joins it to `greek` with one space
+// inside the same button. What is asserted has therefore gained a clause: one
+// tap target, one clip, the whole verse on screen, AND NO FORCED BREAK — the
+// continuation must sit on the same line box as the text before it whenever the
+// card is wide enough to hold both, which is what `display: block` made
+// impossible. Measured as a line-box top, because that is the only thing that
+// distinguishes "wrapped because it is long" from "broken because it was told
+// to". All twelve translation drills carry continuations; ch7 and ch8 are
+// sampled here and the app-wide list is in RESULTS §6.2.
 for (const [chapterId, id] of [['chapt_7', 'c7_drill_translation'], ['chapt_8', 'c8_drill_translation']]) {
   const activity = activityById(CH_5F[chapterId], id);
   let seenTwoLine = false;
   for (let i = 0; i < 25 && !seenTwoLine; i++) {
     await go(`#/activity/${chapterId}/${id}`);
     for (let step = 0; step < activity.items.length; step++) {
-      const lines = await page.locator('.prompt .prompt-line2').count();
+      const lines = await page.locator('.prompt .prompt-cont').count();
       if (lines === 1) {
         const prompt = await promptOnScreen();
         const item = activity.items.find(x => x.greek2 && prompt.startsWith(normalizeText(x.greek)));
-        check(`5F §2.7 ${chapterId} ${id}: a two-line prompt is ONE tap target with one clip`,
+        check(`5F §2.7 ${chapterId} ${id}: a continued prompt is ONE tap target with one clip`,
           !!item && await page.locator('.prompt.greek-say').count() === 1
             && normalizeText(await page.locator('.prompt').first().innerText())
                === normalizeText(`${item.greek} ${item.greek2}`),
           `on screen ${JSON.stringify(await page.locator('.prompt').first().innerText())}`);
+        // §3.1: the continuation is INLINE. Its first line box must start level
+        // with some line box of the text before it — never on a line of its own
+        // that a wider card could have avoided.
+        // MEASURED AGAINST A PROBE, because "does the continuation share a
+        // line with the head" is the wrong question: a verse long enough to
+        // wrap may legitimately wrap AT the join, and 54 of 514 items in the
+        // app do. The right question is whether the split COSTS A LINE. So the
+        // same string is laid out twice in the same box — once as it really is,
+        // once as a single text node — and the heights are compared. Equal
+        // means nothing forced a break, at any width, for any string.
+        const flow = await page.locator('.prompt').first().evaluate(el => {
+          const cont = el.querySelector('.prompt-cont');
+          const probe = el.cloneNode(true);
+          probe.textContent = el.textContent;
+          probe.style.visibility = 'hidden';
+          el.parentNode.appendChild(probe);
+          const real = Math.round(el.getBoundingClientRect().height);
+          const flat = Math.round(probe.getBoundingClientRect().height);
+          probe.remove();
+          return { display: getComputedStyle(cont).display, real, flat };
+        });
+        check(`5I-SPEC2 §3.1 ${chapterId} ${id}: the continuation flows on, it is not a forced line`,
+          flow.display === 'inline' && flow.real === flow.flat,
+          JSON.stringify(flow));
         seenTwoLine = true;
         break;
       }
@@ -2691,7 +2725,7 @@ for (const [chapterId, id] of [['chapt_7', 'c7_drill_translation'], ['chapt_8',
       await page.waitForTimeout(40);
     }
   }
-  if (!seenTwoLine) check(`5F §2.7 ${chapterId} ${id}: a two-line prompt is ONE tap target with one clip`, false, 'never met a two-line item');
+  if (!seenTwoLine) check(`5F §2.7 ${chapterId} ${id}: a continued prompt is ONE tap target with one clip`, false, 'never met a continued item');
 }
 
 // ---- §2.5 the note beside a prompt is INK, never a tap ------------------
@@ -5523,6 +5557,429 @@ for (const [itemIndex, greek, personNumber] of [
   }
 }
 
+// ===================================================================
+// 5I-SPEC2: the cohort-5I feedback round (chapters 13, 14, 15, 16)
+// ===================================================================
+// Twelve regressions from patterns that had held by convention rather than by
+// written rule. The rules exist now (DISCLOSURE-RULES §3.11, §3.12, §4.6's
+// surface matrix, §4.8, §4.9, §4.10), so each check below states the RULE and
+// asserts the whole set it governs, not the one screen that was reported.
+{
+  const cardButton = name => page.locator('.card').getByRole('button', { name, exact: true });
+
+  // ---- §4.1 THE πᾶς CHART PAGES ON LEARN AND IN THE HINT ----------------
+  // §4.6's surface matrix, made explicit after VERIFY-5I-RESPONSE I-1: the
+  // SAME paradigm renders by SURFACE. A Learn page splits it behind a toggle, a
+  // hint modal pages it, and a Review page stacks it with no pager at all. A
+  // chart wider than the phone does not become a stacked pair anywhere except
+  // Review. All three copies of the πᾶς chart are asserted together, because
+  // the failure being guarded against is exactly one of them drifting.
+  await go('#/activity/chapt_13/c13_learn_third_declension');
+  await gotoTopic(5);
+  {
+    const learn = await page.evaluate(() => {
+      const chart = document.querySelector('.card .paradigm');
+      return {
+        columns: [...chart.querySelectorAll('.pg-head .pg-column')].map(c => c.textContent.trim()),
+        subtitle: (chart.querySelector('.pg-subtitle') || {}).textContent?.trim() || null,
+        chartName: chart.getAttribute('data-chart-name'),
+        chartCount: Number(chart.getAttribute('data-chart-count')),
+        grouped: !!chart.querySelector('.pg-grouped'),
+        say: [...chart.querySelectorAll('.pg-actions .pg-say-whole')].map(b => b.textContent.trim()).length,
+        toggle: [...chart.querySelectorAll('.pg-actions .pg-switch-named')].map(b => b.textContent.trim())
+      };
+    });
+    check('5I-SPEC2 §4.1 ch13 Learn πᾶς: two three-column charts behind a named toggle, not one six-column stack',
+      learn.chartCount === 2 && learn.chartName === 'Singular' && learn.subtitle === 'Singular'
+        && learn.columns.length === 3 && !learn.grouped
+        && learn.say === 1 && learn.toggle.includes('Plural'),
+      JSON.stringify(learn));
+    await shot('5i2-ch13-learn-pas-singular');
+    await page.locator('.card .pg-actions .pg-switch-named').first().click();
+    await page.waitForTimeout(150);
+    const plural = await page.evaluate(() => {
+      const chart = document.querySelector('.card .paradigm');
+      return {
+        chartName: chart.getAttribute('data-chart-name'),
+        first: chart.querySelector('.pg-row .pg-greek').textContent.trim(),
+        say: [...chart.querySelectorAll('.pg-actions .pg-say-whole')].map(b => b.textContent.trim()).length,
+        toggle: [...chart.querySelectorAll('.pg-actions .pg-switch-named')].map(b => b.textContent.trim())
+      };
+    });
+    check('5I-SPEC2 §4.1 / NIT-LOG N-1 ch13 Learn πᾶς: the Plural half is πάντες and carries its OWN Say Paradigm',
+      plural.chartName === 'Plural' && plural.first === 'πάντες'
+        && plural.say === 1 && plural.toggle.includes('Singular'),
+      JSON.stringify(plural));
+    await shot('5i2-ch13-learn-pas-plural');
+  }
+  // The REVIEW copy is the control: it must still stack, with no pager.
+  await go('#/activity/chapt_13/c13_qr_pas');
+  {
+    const review = await page.evaluate(() => {
+      const chart = document.querySelector('.card .paradigm');
+      return {
+        grouped: !!chart.querySelector('.pg-grouped'),
+        groups: [...chart.querySelectorAll('.pg-group-label')].map(l => l.textContent.trim()),
+        pagers: chart.querySelectorAll('.pg-nav, [data-paradigm-switch]').length,
+        say: [...chart.querySelectorAll('.pg-actions .pg-say-whole')].length
+      };
+    });
+    check('5I-SPEC2 §4.1 / §4.6 ch13 Review πᾶς is UNCHANGED: stacked Singular over Plural, no pager',
+      review.grouped && JSON.stringify(review.groups) === JSON.stringify(['Singular', 'Plural'])
+        && review.pagers === 0 && review.say === 1,
+      JSON.stringify(review));
+  }
+  // ...and the HINT pages, with the D-58 say-all the original's screen lacks.
+  await go('#/activity/chapt_13/c13_drill_pas_declining');
+  await cardButton('Hint').click();
+  await page.waitForTimeout(200);
+  {
+    const hint = await page.evaluate(() => {
+      const modal = document.querySelector('.modal');
+      const controls = modal.querySelector('[data-hint-paradigm-controls]');
+      return {
+        columns: [...modal.querySelectorAll('.pg-head .pg-column')].map(c => c.textContent.trim()),
+        title: modal.querySelector('.pg-title').textContent.trim(),
+        say: modal.querySelector('[data-hint-paradigm-say]')?.getAttribute('data-audio-id') || null,
+        toggle: modal.querySelector('[data-hint-paradigm-toggle]')?.textContent.trim() || null,
+        stateIndex: controls?.getAttribute('data-state-index')
+      };
+    });
+    check('5I-SPEC2 §4.1 / §4.8 (D-58) ch13 πᾶς hint: paged Singular first, three columns, Say Paradigm present',
+      hint.columns.length === 3 && hint.title.includes('Singular')
+        && hint.say === 'chapt_13_m_paspar' && hint.toggle === 'Plural' && hint.stateIndex === '0',
+      JSON.stringify(hint));
+    await page.locator('.modal [data-hint-paradigm-toggle]').click();
+    await page.waitForTimeout(180);
+    const second = await page.evaluate(() => {
+      const modal = document.querySelector('.modal');
+      return {
+        title: modal.querySelector('.pg-title').textContent.trim(),
+        first: modal.querySelector('.pg-row .pg-greek').textContent.trim(),
+        say: modal.querySelector('[data-hint-paradigm-say]')?.getAttribute('data-audio-id') || null,
+        toggle: modal.querySelector('[data-hint-paradigm-toggle]')?.textContent.trim() || null
+      };
+    });
+    check('5I-SPEC2 §4.1 ch13 πᾶς hint: the toggle reaches the Plural half, which keeps the say-all',
+      second.title.includes('Plural') && second.first === 'πάντες'
+        && second.say === 'chapt_13_m_paspar' && second.toggle === 'Singular',
+      JSON.stringify(second));
+  }
+
+  // ---- §4.2 πᾶς, πᾶσα, πᾶν TAP INDEPENDENTLY ---------------------------
+  // TBK-confirmed: three WordSelection buttons over one citation, not one.
+  await go('#/activity/chapt_13/c13_learn_third_declension');
+  await gotoTopic(0);
+  {
+    const taps = await page.evaluate(() => [...document.querySelectorAll('.card .rc-para .greek-tap')]
+      .map(b => b.textContent.trim()));
+    check('5I-SPEC2 §4.2 ch13 Introduction: πᾶς, πᾶσα and πᾶν are three separate taps',
+      JSON.stringify(taps) === JSON.stringify(['πᾶς', 'πᾶσα', 'πᾶν']), JSON.stringify(taps));
+    const commasAreInk = await page.evaluate(() => {
+      const para = document.querySelector('.card .rc-para');
+      return /πᾶς\s*,\s*πᾶσα\s*,\s*πᾶν/.test(para.textContent.normalize('NFC'));
+    });
+    check('5I-SPEC2 §4.2 ch13 Introduction: the commas between them stay ink inside the citation',
+      commasAreInk);
+  }
+
+  // ---- §4.3 TAP BOUNDARIES: only the RESULT form speaks -----------------
+  // The 5G-SPEC3 canon. Three worked-example lines and five rule examples: in
+  // every one of them the morphemes that build the form are ink.
+  for (const [chapterId, activityId, topicIndex, expected] of [
+    ['chapt_14', 'c14_learn_second_aorist', 1, ['ἔλαβον']],
+    ['chapt_16', 'c16_learn_passives', 1, ['ἐλύθην', 'λυθήσομαι']]
+  ]) {
+    await go(`#/activity/${chapterId}/${activityId}`);
+    await gotoTopic(topicIndex);
+    const taps = await page.evaluate(() => [...document.querySelectorAll('.card .rc-formula .greek-tap')]
+      .map(b => b.textContent.trim()));
+    check(`5I-SPEC2 §4.3 ${chapterId} Form: only the resulting form taps, not the whole equation`,
+      JSON.stringify(taps) === JSON.stringify(expected), JSON.stringify(taps));
+  }
+  await go('#/activity/chapt_16/c16_learn_passives');
+  await gotoTopic(2);
+  {
+    const notes = await page.evaluate(() => [...document.querySelectorAll('.card .rc-etf-example')]
+      .map(row => ({
+        text: row.textContent.replace(/\s+/g, ' ').trim(),
+        taps: [...row.querySelectorAll('.greek-tap')].map(b => b.textContent.trim())
+      })));
+    check('5I-SPEC2 §4.3 ch16 Ending Transformations: the five result forms tap and the morphemes do not',
+      notes.length === 5
+        && JSON.stringify(notes.map(n => n.taps)) === JSON.stringify(
+          [['ἐδιώχθην'], ['ἐλείφθην'], ['ἐγράφην'], ['ἐπείσθην'], ['ἐδοξάσθην']]),
+      JSON.stringify(notes));
+
+    // ---- §4.4 ONE chart, no Consonant Shifts header (D-61) -------------
+    const merged = await page.evaluate(() => ({
+      rules: [...document.querySelectorAll('.card .rc-etf-row')].length,
+      labels: [...document.querySelectorAll('.card .rc-etf-label')].map(l => l.textContent.trim()),
+      summaryRows: document.querySelectorAll('.card .rc-greekrows.shift-summary .rc-rule-row').length,
+      heading: document.querySelector('.card .topic-heading, .card .rc-heading')?.textContent.trim() || null,
+      topicCount: document.querySelector('.topic-count')?.textContent.trim() || null
+    }));
+    check('5I-SPEC2 §4.4 (D-61) ch16: Ending Transformations is ONE five-row chart with the shift summary under it',
+      merged.rules === 5 && merged.summaryRows === 4
+        && JSON.stringify(merged.labels) === JSON.stringify(['Palatals:', 'Labials:', 'Dentals:', 'Sibilants:']),
+      JSON.stringify(merged));
+    check('5I-SPEC2 §4.4 ch16: the Consonant Shifts topic is gone and the rail counts 8 topics',
+      ch16.learn[2].topics.length === 8
+        && !ch16.learn[2].topics.some(t => t.id === 'consonantShifts')
+        && /of 8$/.test(merged.topicCount || ''),
+      `${merged.topicCount} / ${ch16.learn[2].topics.map(t => t.id).join(',')}`);
+    await shot('5i2-ch16-merged-ending-transformations');
+  }
+
+  // ---- §4.5 PASSIVE STEMS IS ONE LIST, in all three of its hosts -------
+  {
+    const stemsTopic = ch16.learn[2].topics.findIndex(t => t.id === 'passiveStems');
+    await go('#/activity/chapt_16/c16_learn_passives');
+    await gotoTopic(stemsTopic);
+    const learn = await page.evaluate(() => ({
+      charts: document.querySelectorAll('.card .paradigm').length,
+      heads: document.querySelectorAll('.card .pg-head').length,
+      rows: document.querySelectorAll('.card .pg-row').length
+    }));
+    check('5I-SPEC2 §4.5 ch16 Learn Passive Stems: one chart, one header row, fifteen verbs',
+      learn.charts === 1 && learn.heads === 1 && learn.rows === 15, JSON.stringify(learn));
+    await go('#/activity/chapt_16/c16_qr_forms');
+    const review = await page.evaluate(() => ({
+      charts: document.querySelectorAll('.card .paradigm').length,
+      heads: document.querySelectorAll('.card .pg-head').length,
+      rows: document.querySelectorAll('.card .pg-row').length,
+      pagers: document.querySelectorAll('.card .pg-nav, .card [data-paradigm-switch]').length
+    }));
+    check('5I-SPEC2 §4.5 ch16 Review Passive Indicative Forms: one list, one header, no pager',
+      review.charts === 1 && review.heads === 1 && review.rows === 15 && review.pagers === 0,
+      JSON.stringify(review));
+    // ...and in the modal, where §4.9's frozen header row applies.
+    await go('#/activity/chapt_16/c16_drill_forms');
+    await cardButton('Hint').click();
+    await page.waitForTimeout(200);
+    const hint = await page.evaluate(() => {
+      const modal = document.querySelector('.modal');
+      const head = modal.querySelector('.pg-head');
+      const scroller = modal.querySelector('.pg-body');
+      const scrollerTop = Math.round(scroller.getBoundingClientRect().top);
+      const before = Math.round(head.getBoundingClientRect().top);
+      scroller.scrollTop = scroller.scrollHeight;
+      const after = Math.round(head.getBoundingClientRect().top);
+      // The last row, to prove the LIST really moved while the header did not.
+      const rowsAll = [...modal.querySelectorAll('.pg-row')];
+      const lastRowTop = Math.round(rowsAll[rowsAll.length - 1].getBoundingClientRect().top);
+      return {
+        heads: modal.querySelectorAll('.pg-head').length,
+        rows: rowsAll.length,
+        pagers: modal.querySelectorAll('[data-hint-paradigm-nav], [data-paradigm-switch], .pg-nav').length,
+        sticky: getComputedStyle(head).position,
+        range: scroller.scrollHeight - scroller.clientHeight,
+        scrollerTop,
+        before,
+        after,
+        lastRowTop,
+        columns: [...head.querySelectorAll('.pg-column')].map(c => c.textContent.trim())
+      };
+    });
+    check('5I-SPEC2 §3.4 / §4.9 ch16 Passive Stems hint: one scrolling list, never two pages',
+      hint.heads === 1 && hint.rows === 15 && hint.pagers === 0
+        && JSON.stringify(hint.columns) === JSON.stringify(['Present Active', 'Aorist Passive', 'Future Passive']),
+      JSON.stringify(hint));
+    // WHAT "STAYS PUT" MEANS for a sticky element: it travels with the content
+    // until it reaches the top of the scroll area and then stops there. It
+    // starts BELOW that top (the chart's title is above it), so asserting that
+    // it never moves would be asserting the wrong thing. Asserted instead: it
+    // is sticky, the list really did scroll, the header ends flush with the top
+    // of the scroller, and the last row has climbed above where the header
+    // began — that is the list moving UNDER a header that has stopped.
+    check('5I-SPEC2 §3.4 / §4.9 ch16 Passive Stems hint: the header row stays put while the rows scroll under it',
+      hint.sticky === 'sticky' && hint.range > 0
+        && Math.abs(hint.after - hint.scrollerTop) <= 1
+        && hint.after < hint.before
+        && hint.lastRowTop > hint.after,
+      `range ${hint.range}px, header ${hint.before} -> ${hint.after}, scroller top ${hint.scrollerTop}, last row ${hint.lastRowTop}`);
+    await shot('5i2-ch16-passive-stems-hint-frozen-header');
+  }
+
+  // ---- §4.6 ἐγενόμην TAPS ---------------------------------------------
+  // The railwalk's hand cursor over it was the evidence 5I missed; §4.7 as
+  // amended makes the cursor readable in both directions from now on.
+  {
+    const deponent = ch16.learn[2].topics.findIndex(t => t.id === 'deponent');
+    await go('#/activity/chapt_16/c16_learn_passives');
+    await gotoTopic(deponent);
+    const taps = await page.evaluate(() => [...document.querySelectorAll('.card .rc-para .greek-tap')]
+      .map(b => b.textContent.trim()));
+    check('5I-SPEC2 §4.6 ch16 Deponent: every Greek word on the page taps, ἐγενόμην included',
+      taps.includes('ἐγενόμην') && taps.includes('ἀπεκρίθην') && taps.includes('ἐγενήθην'),
+      JSON.stringify(taps));
+  }
+
+  // ---- §4.7 THE FORMS HINTS READ GLOSS LAST (I-3) ----------------------
+  // The hint is the Learn page's own stem list now, so "gloss last" is not a
+  // second rendering to keep in step -- it is the same one.
+  for (const [chapterId, activityId, learnTopic, first] of [
+    ['chapt_14', 'c14_drill_forms', 5, ['ἀπέρχομαι', 'ἀπῆλθον', '(I departed)']],
+    ['chapt_15', 'c15_drill_forms', 5, ['ἀκούω', 'ἤκουσα', '(I heard)']]
+  ]) {
+    await go(`#/activity/${chapterId}/${activityId}`);
+    await cardButton('Hint').click();
+    await page.waitForTimeout(200);
+    const row = await page.evaluate(() => {
+      const first = document.querySelector('.modal .rc-greekrows.stem-list .rc-stem-row');
+      return {
+        lemma: first.querySelector('.rc-stem-lemma').textContent.trim(),
+        forms: [...first.querySelectorAll('.rc-stem-forms .rc-part')].map(p => p.textContent.trim()),
+        gloss: first.querySelector('.rc-stem-gloss').textContent.trim(),
+        taps: [...first.querySelectorAll('.greek-say')].map(b => b.textContent.trim()),
+        order: [...first.children].map(el => el.className.split(' ')[0])
+      };
+    });
+    check(`5I-SPEC2 §4.7 ${chapterId} Forms hint: reads "present — aorist (gloss)", gloss LAST, both forms tapping`,
+      row.lemma === first[0] && row.forms.includes(first[1]) && row.gloss === first[2]
+        && row.taps.length === 2
+        && row.order.indexOf('rc-stem-gloss') === row.order.length - 1,
+      JSON.stringify(row));
+    await shot(`5i2-${chapterId}-forms-hint-gloss-last`);
+  }
+
+  // ---- §4.8 CAPITALIZED PARADIGM GLOSSES (D-60) ------------------------
+  // Asserted over the WHOLE app, not the three charts that were reported: a
+  // lower-case paradigm gloss anywhere is now a failure.
+  {
+    // SCOPED TWICE, and both scopings are judgements worth stating.
+    //
+    // FIRST, to paradigm CELLS. A `gloss` key also appears on vocabulary rows,
+    // lexicon entries and a chart's Meanings affordance, where lower case is
+    // the dictionary convention and correct ("truly, verily", "a word / of a
+    // word / to a word"). Sweeping those in would assert a rule nobody made.
+    //
+    // SECOND, to the CHAPTERS THIS ROUND AUTHORIZED. 5I-SPEC2 §4.8 authorizes
+    // ch14's and ch15's copies of two verb paradigms; whether D-60 reaches
+    // further is a ruling, not an implementer's call. It does NOT reach further
+    // today: 110 paradigm cell glosses in chapters 5, 7, 8, 9, 10 and 12 are
+    // lower case, and every one of them is a NOUN-DECLENSION case meaning of
+    // the same register as the Meanings affordance ("a writing", "of writings
+    // (possessive)"), not the verb-person gloss D-60 is about ("We took"). They
+    // are reported to the pipeline in RESULTS §9.6 rather than edited here.
+    const lower = [];
+    const walk = (node, chapterId, inParadigm) => {
+      if (!node || typeof node !== 'object') return;
+      if (Array.isArray(node)) { node.forEach(item => walk(item, chapterId, inParadigm)); return; }
+      const here = inParadigm || node.type === 'paradigm' || node.type === 'pronounParadigm';
+      if (here && Array.isArray(node.cells)) {
+        for (const cell of node.cells) {
+          if (cell && typeof cell.gloss === 'string' && /^[a-z]/.test(cell.gloss)) {
+            lower.push(`${chapterId}: ${JSON.stringify(cell.gloss)}`);
+          }
+        }
+      }
+      for (const [key, value] of Object.entries(node)) {
+        if (key === 'meanings') continue;   // a chart AFFORDANCE, not its cells
+        walk(value, chapterId, here);
+      }
+    };
+    for (const chapterId of ['chapt_13', 'chapt_14', 'chapt_15', 'chapt_16']) {
+      walk(CHAPTERS[chapterId], chapterId, false);
+    }
+    check('5I-SPEC2 §4.8 (D-60) census: no paradigm cell gloss in chapters 13-16 starts lower case',
+      lower.length === 0, JSON.stringify(lower.slice(0, 8)));
+  }
+
+  // ---- §5 PER-ITEM HINT ROUTING, read from the TBKs --------------------
+  // D-46 class. The renderer already supported per-item `hintRef`; 5I emitted
+  // the key and pointed every item at one composite. Each mapping class is
+  // asserted by walking the drill's OWN Next control to a named form and
+  // opening the modal it routes to -- the drill shuffles, so nothing here may
+  // assume an order.
+  {
+    const hintTitlesAtPrompt = async (chapterId, activityId, prompt, itemCount) => {
+      await go(`#/activity/${chapterId}/${activityId}`);
+      let found = false;
+      for (let step = 0; step < itemCount; step++) {
+        const shown = normalizeText(await page.locator('.card .prompt').first().innerText());
+        if (shown === normalizeText(prompt)) { found = true; break; }
+        if (await stepper('Next').isDisabled()) break;
+        await stepper('Next').click();
+        await page.waitForTimeout(40);
+      }
+      if (!found) return { error: `never reached ${prompt}` };
+      await cardButton('Hint').click();
+      await page.waitForTimeout(200);
+      const titles = [];
+      for (let guard = 0; guard < 6; guard++) {
+        titles.push(normalizeText(await page.locator('.modal .pg-title').first().innerText()));
+        const toggle = page.locator('.modal [data-hint-paradigm-toggle], .modal [data-hint-paradigm-nav="more"]');
+        if (!await toggle.count() || await toggle.first().isDisabled()) break;
+        const target = await toggle.first().getAttribute('data-target-index');
+        if (target === '0') break;   // a two-state toggle has come back round
+        await toggle.first().click();
+        await page.waitForTimeout(160);
+      }
+      return { titles };
+    };
+
+    // ch16 Parsing Drill (16_FAPAS.TBK 0xb5e30): the six γράφω forms open the
+    // single γράφω chart; everything else opens the λύω pair.
+    const luwParse = await hintTitlesAtPrompt('chapt_16', 'c16_drill_parsing', 'λυθήσονται', 18);
+    check('5I-SPEC2 §5.2 ch16 Parsing Drill: a λύω form opens the λύω PAIR',
+      !luwParse.error && luwParse.titles.length === 2
+        && luwParse.titles[0].includes('First Aorist Passive') && luwParse.titles[1].includes('Future Passive'),
+      JSON.stringify(luwParse));
+    const graphoParse = await hintTitlesAtPrompt('chapt_16', 'c16_drill_parsing', 'ἐγράφημεν', 18);
+    check('5I-SPEC2 §5.2 ch16 Parsing Drill: a γράφω form opens the SINGLE γράφω chart, with no paging',
+      !graphoParse.error && graphoParse.titles.length === 1
+        && graphoParse.titles[0].includes('Second Aorist Passive Indicative of γράφω'),
+      JSON.stringify(graphoParse));
+
+    // ch16 Translation Drill (0xc08a7): unconditional, and the γράφω chart is
+    // not part of this drill's hint at all.
+    await go('#/activity/chapt_16/c16_drill_translation');
+    await cardButton('Hint').click();
+    await page.waitForTimeout(200);
+    const transTitles = await page.evaluate(() => {
+      const modal = document.querySelector('.modal');
+      return {
+        title: modal.querySelector('.pg-title').textContent.trim(),
+        toggle: modal.querySelector('[data-hint-paradigm-toggle]')?.textContent.trim() || null,
+        nav: modal.querySelectorAll('[data-hint-paradigm-nav]').length
+      };
+    });
+    check('5I-SPEC2 §5.3 ch16 Translation Drill: the hint is the λύω pair, a two-state toggle, no third chart',
+      transTitles.title.includes('First Aorist Passive') && transTitles.nav === 0
+        && transTitles.toggle !== null,
+      JSON.stringify(transTitles));
+    check('5I-SPEC2 §5.3 ch16 Translation Drill: no item anywhere in it routes to the γράφω chart',
+      ch16.drill.find(d => d.id === 'c16_drill_translation').items
+        .every(item => item.hintRef === 'luwPassivePair'));
+
+    // ch15 Translation Drill (15_1AOR.TBK 0x116f1e): items 1 and 11 only.
+    const imperfect = await hintTitlesAtPrompt('chapt_15', 'c15_drill_translation',
+      'καὶ ἐδίδασκεν αὐτοὺς ἐν παραβολαῖς πολλά καὶ ἔλεγεν αὐτοῖς', 29);
+    check('5I-SPEC2 §5.5 ch15 Translation Drill: Mar 4:2 opens the IMPERFECT pair',
+      !imperfect.error && imperfect.titles.length === 2
+        && imperfect.titles.every(t => t.includes('Imperfect')),
+      JSON.stringify(imperfect));
+    const aorist = await hintTitlesAtPrompt('chapt_15', 'c15_drill_translation',
+      'καὶ ἀπέστειλεν αὐτὸν εἰς οἶκον αὐτοῦ', 29);
+    check('5I-SPEC2 §5.5 ch15 Translation Drill: Mar 8:26 opens the AORIST pair',
+      !aorist.error && aorist.titles.length === 2
+        && aorist.titles.every(t => t.includes('Aorist') && !t.includes('Imperfect')),
+      JSON.stringify(aorist));
+    // ...and the census behind the two samples.
+    const ch15Trans = ch15.drill.find(d => d.id === 'c15_drill_translation');
+    const imperfectItems = ch15Trans.items
+      .map((item, index) => (item.hintRef === 'imperfectPair' ? index + 1 : null)).filter(Boolean);
+    check('5I-SPEC2 §5.5 ch15 census: exactly items 1 and 11 take the imperfect pair',
+      JSON.stringify(imperfectItems) === JSON.stringify([1, 11]), JSON.stringify(imperfectItems));
+    const ch16Parse = ch16.drill.find(d => d.id === 'c16_drill_parsing');
+    const graphoItems = ch16Parse.items
+      .map((item, index) => (item.hintRef === 'graphoPassive' ? index + 1 : null)).filter(Boolean);
+    check('5I-SPEC2 §5.2 ch16 census: exactly items 5, 6, 9, 12, 17 and 18 take the γράφω chart',
+      JSON.stringify(graphoItems) === JSON.stringify([5, 6, 9, 12, 17, 18]), JSON.stringify(graphoItems));
+  }
+}
+
 await browser.close();
 const failed = results.filter(r => !r.ok);
 console.log(`\n${results.length - failed.length}/${results.length} behavior checks passed`);
diff --git a/scripts/ui-disclosure.mjs b/scripts/ui-disclosure.mjs
index 97fd8cb..1376842 100644
--- a/scripts/ui-disclosure.mjs
+++ b/scripts/ui-disclosure.mjs
@@ -1555,6 +1555,107 @@ if (SHOTS) {
   await shot('ch5-learn-chart-still-merged');
 }
 
+// ===========================================================================
+// D21. §3.11 / §3.12 — THE APP-WIDE MODAL-TRIGGER SWEEP (5I-SPEC2 §6.1)
+// ---------------------------------------------------------------------------
+// Nathanael's ruling on VERIFY-5I-RESPONSE item 9 split what 5I had lumped
+// together. §3.3 STANDS and overrides §3.2 for the cells and labels of an
+// ACTUAL chart — the ch6 case-chart glosses, the ch13 Key Letter Box — and
+// those keep their blue. But a PROSE RULE LIST is text: hot words at the head
+// of rule lines in running teaching prose are C3 in-text links and take §3.2's
+// green underline (§3.11), and so does the circled note marker beside an
+// audio-tap word (§3.12).
+//
+// Every modal trigger in sixteen chapters comes from one of four data shapes,
+// and the census below is the whole population rather than a sample:
+//   `[[link:id]]` markup and termList links   — already green (D4, D5)
+//   `titleLink`                                — already green (D19)
+//   `popupRef` on a CHART row/column           — blue, exempt (§3.3)
+//   `popupRef` on a PROSE-layout row           — converts here (§3.11)
+// The last two are the ones this round moved, so both are asserted, together,
+// in one block: the failure to guard against is a restyle that takes them both.
+{
+  const styleOf = selector => page.locator(selector).evaluateAll(nodes => nodes.map(n => ({
+    text: n.textContent.trim(),
+    tag: n.tagName,
+    color: getComputedStyle(n).color,
+    decoration: getComputedStyle(n).textDecorationLine,
+    border: getComputedStyle(n).borderTopColor
+  })));
+
+  // §3.11 CONVERTS: chapter 15's Palatals / Labials / Dentals, the ratifying
+  // instance. The block is `endingTransformation`, which lays out the page's
+  // prose, not a chart.
+  await go('#/activity/chapt_15/c15_learn_first_aorist');
+  await gotoTopic(6);
+  const proseTriggers = await styleOf('.card button.rc-etf-label');
+  check('D21.1 §3.11 ch15 Ending Transformations: the three prose rule labels are GREEN and underlined',
+    proseTriggers.length === 3
+      && proseTriggers.every(t => t.color === GREEN && t.decoration === 'underline'),
+    JSON.stringify(proseTriggers));
+  check('D21.2 §3.11 ...and they keep their bold, which §3.2 never asked them to give up',
+    await page.locator('.card button.rc-etf-label').first()
+      .evaluate(n => Number(getComputedStyle(n).fontWeight) >= 700));
+  await shot('ch15-prose-rule-labels-green');
+
+  // §3.3 EXEMPT, and this is the half that must NOT move: the Key Letter Box.
+  // Nathanael named it in his ruling, so it is asserted by name.
+  await go('#/activity/chapt_13/c13_learn_concepts');
+  await gotoTopic(1);
+  const klb = await styleOf('.card .rc-greekrows.key-letter-box button.rc-chart-trigger');
+  check('D21.3 §3.3 ch13 Key Letter Box: all six in-chart triggers stay BLUE and unmarked',
+    klb.length === 6 && klb.every(t => t.color === BLUE && t.decoration === 'none'),
+    JSON.stringify(klb.map(t => `${t.text} ${t.color}/${t.decoration}`)));
+  await shot('ch13-key-letter-box-stays-blue');
+
+  // §3.12: the circled note marker. Its glyph and its ring both read as the
+  // trigger green now; the underline is the one part of §3.2 it does not take
+  // (a rule under a "?" inside a 1.35em circle reads as a drawing fault), and
+  // that judgement is recorded in RESULTS §6.1 rather than made silently.
+  for (const [label, hash, topic] of [
+    ['Learn', '#/activity/chapt_14/c14_learn_second_aorist', 5],
+    ['Review', '#/activity/chapt_14/c14_qr_forms', 0]
+  ]) {
+    await go(hash);
+    if (topic) await gotoTopic(topic);
+    const marker = await styleOf('.card button.rc-stem-note');
+    check(`D21.4 §3.12 ch14 ${label} note marker: green glyph in a green ring, never the Greek-tap blue`,
+      marker.length === 1 && marker[0].color === GREEN && marker[0].border === GREEN,
+      JSON.stringify(marker));
+  }
+
+  // THE CENSUS. Every `popupRef` in sixteen chapters, classified, so a
+  // seventeenth trigger cannot ship without landing in one of the two buckets
+  // on purpose. Computed from the data, not typed here.
+  {
+    const chart = [];
+    const prose = [];
+    for (const [chapterId, chapter] of chapters) {
+      const walk = (node, layout) => {
+        if (!node || typeof node !== 'object') return;
+        if (Array.isArray(node)) { node.forEach(item => walk(item, layout)); return; }
+        const here = node.layout || layout;
+        if (node.popupRef) {
+          const entry = `${chapterId}:${here}:${node.popupRef}`;
+          (here === 'endingTransformation' || here === 'stemList' ? prose : chart).push(entry);
+        }
+        for (const value of Object.values(node)) walk(value, here);
+      };
+      walk(chapter, null);
+    }
+    // 22 OCCURRENCES, 17 chart and 5 prose. The five prose ones are ch15's
+    // three rule labels plus the ch14 note marker, which is ONE popupRef
+    // reached from two hosts (the Learn stem list and the Review copy of it) —
+    // so the population is counted where it is DRAWN, which is where a style
+    // rule can reach it.
+    check('D21.5 §6.1 census: 22 popupRef triggers app-wide, 17 in charts (exempt) and 5 in prose (converted)',
+      chart.length === 17 && prose.length === 5
+        && chart.every(e => /prepositionSenses|keyLetterBox/.test(e))
+        && prose.every(e => /endingTransformation|stemList/.test(e)),
+      `chart(${chart.length}) ${JSON.stringify(chart)} prose(${prose.length}) ${JSON.stringify(prose)}`);
+  }
+}
+
 // ===========================================================================
 await browser.close();
 const failed = results.filter(r => !r.ok);
diff --git a/scripts/ui-modals.mjs b/scripts/ui-modals.mjs
index 6eb133f..52d53ef 100644
--- a/scripts/ui-modals.mjs
+++ b/scripts/ui-modals.mjs
@@ -21,7 +21,7 @@
 // zero: range there means the modal did not fit the screen.
 
 import { chromium } from 'playwright-core';
-import { mkdirSync, writeFileSync, readdirSync } from 'node:fs';
+import { mkdirSync, writeFileSync, readdirSync, readFileSync } from 'node:fs';
 
 const args = Object.fromEntries(process.argv.slice(2)
   .filter(a => a.startsWith('--'))
@@ -372,7 +372,12 @@ const SURFACES = [
   ['ch13-klb-popup-velar', chartTrigger('chapt_13', 'c13_learn_concepts', 1, 'velar')],
   ['ch13-klb-popup-dental', chartTrigger('chapt_13', 'c13_learn_concepts', 1, 'dental')],
   ['ch13-declining-hint', hint('chapt_13', 'c13_drill_declining', false)],
-  ['ch13-pas-declining-hint', hint('chapt_13', 'c13_drill_pas_declining', false)],
+  // 5I-SPEC2 §4.1: the pas hint PAGES now -- Singular then Plural, the ch11
+  // model -- where 5I shipped one stacked six-column chart. Two surfaces, and
+  // each carries the D-58 Say Paradigm button beside its toggle, so both take
+  // the say/toggle order assertion.
+  ['ch13-pas-declining-hint-singular', hint('chapt_13', 'c13_drill_pas_declining', false, 0), true, true],
+  ['ch13-pas-declining-hint-plural', hint('chapt_13', 'c13_drill_pas_declining', false, 1), true, true],
   ['ch13-translation-hint', hint('chapt_13', 'c13_drill_translation', false)],
   ['ch13-speller-greek-keyboard', spellerKeyboard('chapt_13', 'c13_ex_speller')],
   ['ch13-verse-speller-greek-keyboard', spellerKeyboard('chapt_13', 'c13_ex_scripture_speller')],
@@ -406,24 +411,39 @@ const SURFACES = [
   ['ch15-parsing-hint-active', hint('chapt_15', 'c15_drill_parsing', false, 0), true, false],
   ['ch15-parsing-hint-middle', hint('chapt_15', 'c15_drill_parsing', false, 1), true, false],
   ['ch15-forms-hint', hint('chapt_15', 'c15_drill_forms', false)],
-  // FOUR charts, the deepest bundle in the app: aorist active, aorist middle,
-  // then the two imperfects the drill is contrasting them against.
-  ['ch15-translation-hint-s1-aorist-active', hintState('chapt_15', 'c15_drill_translation', 0), true, false],
-  ['ch15-translation-hint-s2-aorist-middle', hintState('chapt_15', 'c15_drill_translation', 1), true, false],
-  ['ch15-translation-hint-s3-imperfect-active', hintState('chapt_15', 'c15_drill_translation', 2), true, false],
-  ['ch15-translation-hint-s4-imperfect-mp', hintState('chapt_15', 'c15_drill_translation', 3), true, false],
+  // 5I-SPEC2 §5.5: NOT a four-chart bundle. 15_1AOR.TBK 0x116f1e routes items 1
+  // and 11 to the IMPERFECT pair and every other item to the AORIST pair, so
+  // the four charts are two two-chart hints and which one opens depends on the
+  // verse on screen. Each pair is two states, and both pairs are reached
+  // through the drill's own Next control at a named prompt -- state 4 no longer
+  // exists to step to.
+  // (Neither pair carries a say-all recording, so the toggle centres alone on
+  // the pinned line per §4.5 and `expectHintSay` stays false.)
+  ['ch15-translation-hint-aorist-active',
+    hintAtPrompt('chapt_15', 'c15_drill_translation', 'καὶ ἀπέστειλεν αὐτὸν εἰς οἶκον αὐτοῦ', 29, 0), true, false],
+  ['ch15-translation-hint-aorist-middle',
+    hintAtPrompt('chapt_15', 'c15_drill_translation', 'καὶ ἀπέστειλεν αὐτὸν εἰς οἶκον αὐτοῦ', 29, 1), true, false],
+  ['ch15-translation-hint-imperfect-active',
+    hintAtPrompt('chapt_15', 'c15_drill_translation', 'καὶ ἐδίδασκεν αὐτοὺς ἐν παραβολαῖς πολλά καὶ ἔλεγεν αὐτοῖς', 29, 0), true, false],
+  ['ch15-translation-hint-imperfect-mp',
+    hintAtPrompt('chapt_15', 'c15_drill_translation', 'καὶ ἐδίδασκεν αὐτοὺς ἐν παραβολαῖς πολλά καὶ ἔλεγεν αὐτοῖς', 29, 1), true, false],
   ['ch15-speller-greek-keyboard', spellerKeyboard('chapt_15', 'c15_ex_speller_forms')],
   ['ch15-verse-speller-greek-keyboard', spellerKeyboard('chapt_15', 'c15_ex_scripture_speller')],
-  // Chapter 16: a three-chart bundle on both the parsing and translation
-  // drills, and a two-half stem table on the forms drill -- the widest chart
-  // this cohort puts inside a dialog.
-  ['ch16-parsing-hint-s1-first-aorist', hintState('chapt_16', 'c16_drill_parsing', 0), true, false],
-  ['ch16-parsing-hint-s2-future', hintState('chapt_16', 'c16_drill_parsing', 1), true, false],
-  ['ch16-parsing-hint-s3-second-aorist', hintState('chapt_16', 'c16_drill_parsing', 2), true, false],
-  ['ch16-translation-hint-s1-first-aorist', hintState('chapt_16', 'c16_drill_translation', 0), true, false],
-  ['ch16-translation-hint-s3-second-aorist', hintState('chapt_16', 'c16_drill_translation', 2), true, false],
-  ['ch16-forms-hint-half1', hint('chapt_16', 'c16_drill_forms', false, 0), true, false],
-  ['ch16-forms-hint-half2', hint('chapt_16', 'c16_drill_forms', false, 1), true, false],
+  // 5I-SPEC2 §5.2/§5.3/§4.5. The three-chart bundle is gone: 16_FAPAS.TBK
+  // 0xb5e30 routes the Parsing Drill's six grapho forms to a SINGLE grapho
+  // chart and everything else to the luo pair, and 0xc08a7 shows the
+  // Translation Drill the luo pair unconditionally -- the grapho chart never
+  // appears on that drill at all. And the Form Drill's stem table is ONE list
+  // under a frozen header (§4.9), not two halves.
+  ['ch16-parsing-hint-luw-first-aorist',
+    hintAtPrompt('chapt_16', 'c16_drill_parsing', 'λυθήσονται', 18, 0), true, false],
+  ['ch16-parsing-hint-luw-future',
+    hintAtPrompt('chapt_16', 'c16_drill_parsing', 'λυθήσονται', 18, 1), true, false],
+  ['ch16-parsing-hint-grapho',
+    hintAtPrompt('chapt_16', 'c16_drill_parsing', 'ἐγράφημεν', 18)],
+  ['ch16-translation-hint-luw-first-aorist', hint('chapt_16', 'c16_drill_translation', false, 0), true, false],
+  ['ch16-translation-hint-luw-future', hint('chapt_16', 'c16_drill_translation', false, 1), true, false],
+  ['ch16-forms-hint-stems-one-list', hint('chapt_16', 'c16_drill_forms', false)],
   ['ch16-speller-greek-keyboard', spellerKeyboard('chapt_16', 'c16_ex_speller_forms')],
   ['ch16-verse-speller-greek-keyboard', spellerKeyboard('chapt_16', 'c16_ex_scripture_speller')],
   ['settings-clear-audio-confirm', async () => {
@@ -577,6 +597,138 @@ for (const { name, width, height } of VIEWPORTS) {
   }
 }
 
+// ===========================================================================
+// 5I-SPEC2 §3.2 — THE HALF-SCREEN MODAL GUARD.
+//
+// Nathanael's ask in as many words: "add a guard to ensure THIS DOES NOT REVERT
+// AGAIN". The bug is a modal that opens at roughly half height after an iOS
+// SCREENSHOT — with no modal open at the time, on a page that has no modal —
+// and it is fixed by killing and reopening the app, which is nothing but a
+// fresh measurement. On iOS a screenshot can background and foreground a
+// standalone PWA; the app is handed a stale, shrunken viewport reading, latches
+// it into `--modal-vh`, and every later modal is sized from it.
+//
+// THE SCRIPTABLE PROXY. Headless Chromium cannot be screenshotted by iOS, but
+// every ingredient of the failure can be forged, and forging them is a stricter
+// test than the device would be:
+//   * `visualViewport.height` AND `window.innerHeight` are both overridden to
+//     45% of the real height. Both, deliberately: the pre-existing W4.2 clamp
+//     compares one against the other, and in a standalone PWA — the only way
+//     this app is used — the keyboard shrinks both, so a stale reading agrees
+//     with itself and that clamp sees nothing wrong. This is the exact hole the
+//     5I regression came through.
+//   * an ordinary `resize` is delivered FIRST, before any foreground event,
+//     because iOS is free to do that and a fix whose reference had already
+//     swallowed the bad number would be no fix at all;
+//   * then the foreground events a screenshot really does deliver.
+//
+// THREE ASSERTIONS, in order:
+//   G1 the proxy is REAL — with the fakes installed and a plain resize, the
+//      published height does drop. If this stops failing, the proxy has stopped
+//      reproducing anything and the two assertions under it are worthless.
+//   G2 the RESUME CLAMP refuses it — after the foreground events, `--modal-vh`
+//      is back at the true height even though the forged readings are still in
+//      place, and the open modal is full height again.
+//   G3 the SETTLE CHAIN finds the truth — with the fakes removed and NO further
+//      event fired, the published height stays correct on its own. One rAF, the
+//      pre-5I behaviour, fires long before the viewport settles; this is what
+//      makes the app re-ask instead of latching whatever it saw first.
+// Plus G4, a source assertion: the constants and the DO-NOT-TRIM comment block
+// are still in src/lib/viewport.js, so a refactor cannot quietly remove the
+// machinery while leaving a passing behavioural test that no longer tests it.
+{
+  const guard = [];
+  const gcheck = (label, ok, detail = '') => {
+    guard.push({ label, ok, detail });
+    if (!ok) bad += 1;
+    console.log(`${ok ? 'OK  ' : 'BAD '} §3.2 guard  ${label}${detail ? `  ${detail}` : ''}`);
+  };
+
+  // A TALL modal, deliberately: the symptom being guarded against is a modal
+  // at half height, and only a dialog whose content exceeds the available
+  // height has its box governed by `--modal-vh` at all. Chapter 16's Passive
+  // Stems hint is fifteen rows and is the tallest in the app.
+  await page.setViewportSize({ width: 390, height: 844 });
+  await go('#/activity/chapt_16/c16_drill_forms');
+  await page.locator('.card').getByRole('button', { name: 'Hint', exact: true }).click();
+  await page.waitForTimeout(250);
+
+  const readState = () => page.evaluate(() => {
+    const modal = document.querySelector('.modal-overlay .modal');
+    return {
+      modalVh: parseInt(document.documentElement.style.getPropertyValue('--modal-vh'), 10) || 0,
+      modalHeight: modal ? Math.round(modal.getBoundingClientRect().height) : 0
+    };
+  });
+
+  const baseline = await readState();
+  gcheck('G0 the guard is pointed at a modal tall enough to be governed by --modal-vh',
+    baseline.modalVh > 0 && baseline.modalHeight > baseline.modalVh * 0.6,
+    `--modal-vh ${baseline.modalVh}px, modal ${baseline.modalHeight}px`);
+
+  // Forge the stale reading and deliver it the way iOS would: as a resize, with
+  // no foreground event anywhere near it.
+  await page.evaluate(() => {
+    window.__fakeHeight = Math.round(window.innerHeight * 0.45);
+    Object.defineProperty(window, 'innerHeight', { configurable: true, get: () => window.__fakeHeight });
+    if (window.visualViewport) {
+      Object.defineProperty(window.visualViewport, 'height', { configurable: true, get: () => window.__fakeHeight });
+    }
+    if (window.visualViewport) window.visualViewport.dispatchEvent(new Event('resize'));
+    window.dispatchEvent(new Event('resize'));
+  });
+  await page.waitForTimeout(300);
+  const phantom = await readState();
+  gcheck('G1 the forged stale viewport really does shrink the published height and the modal with it',
+    phantom.modalVh > 0 && phantom.modalVh < baseline.modalVh * 0.75
+      && phantom.modalHeight < baseline.modalHeight * 0.75,
+    `--modal-vh ${baseline.modalVh} -> ${phantom.modalVh}px, modal ${baseline.modalHeight} -> ${phantom.modalHeight}px`);
+
+  // Now the screenshot's own return path. The forged readings STAY in place:
+  // what is being tested is that the app refuses them, not that it happens to
+  // measure after they are gone.
+  await page.evaluate(() => {
+    window.dispatchEvent(new Event('focus'));
+    document.dispatchEvent(new Event('visibilitychange'));
+    window.dispatchEvent(new Event('pageshow'));
+  });
+  await page.waitForTimeout(200);
+  const resumed = await readState();
+  gcheck('G2 the resume clamp refuses the phantom and the modal is full height again',
+    resumed.modalVh >= baseline.modalVh - 2
+      && resumed.modalHeight >= baseline.modalHeight - 2,
+    `--modal-vh ${resumed.modalVh}px (baseline ${baseline.modalVh}px), modal ${resumed.modalHeight}px (baseline ${baseline.modalHeight}px)`);
+
+  // THE SETTLE CHAIN, isolated. Mid-resume, and with NO event to announce it,
+  // the viewport becomes a real, plausible, DIFFERENT height. Only a re-measure
+  // can find that: the single rAF the pre-5I code scheduled fired long ago, and
+  // the value on screen is the clamp's substitute rather than a reading. If the
+  // published height follows the viewport to its new value, something looked
+  // again.
+  await page.evaluate(() => { window.__fakeHeight = 800; });
+  await page.waitForTimeout(500);
+  const settled = await readState();
+  gcheck('G3 the settle chain re-measures after the resume, with no further event',
+    settled.modalVh === 800,
+    `--modal-vh ${settled.modalVh}px, expected 800px (modal ${settled.modalHeight}px)`);
+  // Hand the page its real viewport back before anything else runs.
+  await page.evaluate(() => {
+    delete window.innerHeight;
+    if (window.visualViewport) delete window.visualViewport.height;
+    window.dispatchEvent(new Event('resize'));
+  });
+  await page.waitForTimeout(200);
+
+  const source = readFileSync('src/lib/viewport.js', 'utf8');
+  const marks = ['5I-SPEC2 §3.2', 'DO NOT TRIM THIS BLOCK', 'RESUME_WINDOW_MS',
+    'RESUME_SETTLE_MS', 'SHRINK_CONFIRM_MS', 'lastGoodHeight'];
+  const missing = marks.filter(mark => !source.includes(mark));
+  gcheck('G4 the clamp and its DO-NOT-TRIM block are still in src/lib/viewport.js',
+    missing.length === 0, missing.length ? `missing ${missing.join(', ')}` : '');
+
+  report.push({ guard: '5I-SPEC2 §3.2 screenshot path', baseline, phantom, resumed, settled, checks: guard });
+}
+
 writeFileSync(`${OUT}/modal-report.json`, JSON.stringify(report, null, 1));
 console.log(`\n${report.length - bad}/${report.length} modal states clean -> ${OUT}`);
 await browser.close();
diff --git a/scripts/ui-walk.mjs b/scripts/ui-walk.mjs
index 46c3432..1c66edd 100644
--- a/scripts/ui-walk.mjs
+++ b/scripts/ui-walk.mjs
@@ -454,11 +454,27 @@ for (const size of WIDTHS) {
             // route is captured as itself, by the ref it resolved, and the
             // chart assertions below stay chart-only.
             const pageRef = await modal.count() ? await modal.getAttribute('data-hint-page-ref') : null;
+            // 5I-SPEC2 §4.7: A HINT PAYLOAD MAY ALSO BE A CONTENT BLOCK.
+            // Chapters 14 and 15's "Verb Forms" hints are the Learn page's own
+            // `stemList` now, because that is the shape that prints the gloss
+            // LAST (the two-column paradigm they used to be put it first). The
+            // modal has no `.paradigm` in it at all, which read to this walk as
+            // a broken Hint; it is captured as itself instead, the same way the
+            // 5H page route is.
+            const blockRows = await modal.count()
+              ? await modal.locator('.rc-greekrows .rc-stem-row').count()
+              : 0;
             if (pageRef) {
               await recordExtra(`${activityId}--hint`, `hint page: ${pageRef}`);
               await modal.getByRole('button', { name: /close|cancel/i }).first().click();
               await page.waitForTimeout(120);
               if (await modal.count()) report.interactionErrors.push({ ...evidence, state: activityId, error: 'Hint page did not close' });
+            } else if (!await modal.locator('.paradigm').count() && blockRows > 0) {
+              const title = (await modal.locator('.rc-greektitle').first().innerText().catch(() => '')).trim();
+              await recordExtra(`${activityId}--hint`, `hint block: ${title || activity.ui?.hintRef || 'stem list'} (${blockRows} rows)`);
+              await modal.getByRole('button', { name: /close|cancel/i }).first().click();
+              await page.waitForTimeout(120);
+              if (await modal.count()) report.interactionErrors.push({ ...evidence, state: activityId, error: 'Hint block did not close' });
             } else if (!await modal.count() || !await modal.isVisible() || !await modal.locator('.paradigm').count()) {
               report.interactionErrors.push({ ...evidence, state: activityId, error: 'Hint did not open a paradigm or a page' });
             } else {
diff --git a/src/app.css b/src/app.css
index 6490af3..e708682 100644
--- a/src/app.css
+++ b/src/app.css
@@ -755,6 +755,14 @@ button { font: inherit; cursor: pointer; }
 .rc-greekrows.contraction .rc-contraction-form.greek-say { width: auto; color: var(--link); }
 .rc-greekrows.contraction .rc-parts { grid-column: 1 / -1; }
 .rc-greekrows.contraction .rc-part { font-size: 1.15rem; }
+/* 5I-SPEC2 §3.6 (VERIFY-5I-RESPONSE I-6): chapter 15's two liquid/nasal
+   derivations. They are the SAME KIND OF THING as the three worked examples in
+   the rule chart above them — stem + formative = aorist — and they were the one
+   block on that page sitting a step larger, at the generic `.rc-part` size,
+   because `derivation` had no class of its own to size by. Brought down to the
+   worked examples' 1.15rem, which is also what stops the second one
+   (ἀποστέλλω + σα = ἀπέστειλα, the longest) wrapping at the 320px floor. */
+.rc-greekrows.derivation .rc-part { font-size: 1.15rem; }
 @media (min-width: 560px) {
   .rc-greekrows.contraction .rc-greekrow {
     grid-template-columns: minmax(4.5em, auto) minmax(0, 0.8fr) minmax(0, 1.2fr); }
@@ -836,9 +844,16 @@ button.rc-chart-trigger:active { opacity: 0.6; }
    speak and open a page. */
 /* `button.` for the same reason as .rc-chart-trigger: .popup-link resets the
    border further down this file and would win on source order. */
+/* 5I-SPEC2 §3.3 / DISCLOSURE-RULES §3.12: the marker is a MODAL TRIGGER and
+   takes §3.2's styling, which it already did for its glyph — green and
+   underlined, inherited from `.popup-link`. Its circle was the one part still
+   drawn in `--link`, the Greek-tap blue, beside a form that really is a Greek
+   tap; the ring now matches the glyph so the marker reads as one control of
+   one kind. Reported as a judged §6.1 conversion: the marker itself was
+   accepted on device (I-2) and only its ring changes. */
 button.rc-stem-note { font-size: 0.8rem; line-height: 1; width: 1.35em; height: 1.35em;
   display: inline-flex; align-items: center; justify-content: center; padding: 0;
-  border: 1px solid var(--link); border-radius: 50%; align-self: center; flex: none; }
+  border: 1px solid var(--teal-dark); border-radius: 50%; align-self: center; flex: none; }
 @media (min-width: 560px) {
   .rc-greekrows.stem-list .rc-stem-row {
     grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 0.7fr); }
@@ -854,6 +869,26 @@ button.rc-stem-note { font-size: 0.8rem; line-height: 1; width: 1.35em; height:
 .rc-etf-rule { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 8px; }
 .rc-etf-label { color: var(--link); font-weight: 700; white-space: nowrap; }
 span.rc-etf-label { color: var(--teal-dark); }
+/* 5I-SPEC2 §3.3 / DISCLOSURE-RULES §3.11: A PROSE-LAYOUT TRIGGER IS AN IN-TEXT
+   LINK. `.rc-prose-trigger` marks a modal trigger that sits in running
+   teaching text rather than in a chart, and its whole job is to NOT be
+   `.rc-chart-trigger`: it keeps `.popup-link`'s green underline instead of
+   overriding it to blue. Only the weight is restated, because `.popup-link`
+   resets the button to `font: inherit` and would drop the bold the label
+   carries. ch15's Palatals / Labials / Dentals are the ratifying instance;
+   the ch13 Key Letter Box beside them is a real chart and keeps `.rc-chart-
+   trigger` and its blue. */
+button.rc-prose-trigger { color: var(--teal-dark); text-decoration: underline;
+  font-weight: 700; }
+/* THE ONE PART OF §3.2 THE NOTE MARKER DOES NOT TAKE, and a judgement call
+   reported in RESULTS §6.1 rather than made silently: the underline. §3.2
+   underlines an in-text LINK so a run of words reads as tappable; the marker is
+   a single glyph whose ring already says so, and a rule drawn under a "?"
+   inside a 1.35em circle reads as a drawing fault rather than as a link. The
+   COLOUR — which is what §3.2 is actually distinguishing the trigger by — is
+   green, ring and glyph alike. Stated here so it outranks the rule above it
+   rather than depending on where in the file the geometry happens to sit. */
+button.rc-prose-trigger.rc-stem-note { text-decoration: none; }
 .rc-etf-text { color: var(--ink); font-size: 1.05rem; white-space: pre-wrap;
   overflow-wrap: break-word; min-width: 0; }
 .rc-etf-example { margin: 4px 0 0 1.6em; font-size: 1.15rem; color: var(--ink);
@@ -1309,6 +1344,18 @@ span.rc-etf-label { color: var(--teal-dark); }
    the gap below the line 22-23px against 10px above it. That is precisely the
    doubling the review reported on ch8, and zeroing it here is what makes the
    strip below the line equal the strip above it rather than merely near it. */
+/* DISCLOSURE-RULES §4.9 / 5I-SPEC2 §3.4 — THE FROZEN HEADER ROW.
+   A modal holding one long list scrolls the rows under a header row that stays
+   put, so the learner never loses which column is which halfway down fifteen
+   verbs. `.pg-body` is the scroller in a modal host, so `top: 0` sticks the
+   header to the top of the scroll area and to nothing else; the opaque
+   background is required, not decoration, because rows scroll THROUGH the
+   space a sticky element occupies. The header keeps the 2px rule it already
+   draws, which is what makes the boundary read while the list moves under it.
+   The pinned FOOTER composition (§4.3) is untouched: this is inside the
+   scroller, the footer is outside it, and neither knows about the other. */
+.pg-modal-host.pg-frozen-head .pg-head {
+  position: sticky; top: 0; z-index: 2; background: var(--card); }
 .pg-modal-host .pg-controls { flex: 0 0 auto; background: var(--card); }
 .pg-modal-host .pg-controls > .pg-actions,
 .pg-modal-host .pg-controls > .pg-nav { margin-top: 0; }
@@ -1856,7 +1903,10 @@ button.rc-term-name { font-weight: 700; }
 .rc-verse-greek { display: block; width: 100%; background: transparent; border: none;
   padding: 0; text-align: left; color: var(--link); font-size: 1.2rem; cursor: pointer; }
 .rc-verse-greek:disabled { color: var(--ink); }
-.rc-verse-line { display: block; overflow-wrap: anywhere; }
+/* 5I-SPEC2 §3.1: `display: block` here was the second of the app's two forced
+   verse breaks. A worked verse example is continuous text and wraps to the
+   card; the span stays so the run keeps its own wrapping behaviour. */
+.rc-verse-line { display: inline; overflow-wrap: anywhere; }
 
 /* ---- §2.5 the note beside a prompt ----
    ON THE PROMPT'S LINE, plain ink, smaller, and NEVER blue: it is not tappable
@@ -1873,9 +1923,26 @@ button.rc-term-name { font-weight: 700; }
 .spell-prompt-note { color: var(--ink); font-size: 0.8rem; opacity: 0.85;
   margin-left: 0.4em; white-space: nowrap; }
 
-/* ---- §2.7 two-line Greek prompts ---- */
-.prompt.two-line { font-size: 1.7rem; line-height: 1.3; padding: 12px 10px; }
-.prompt-line2 { display: block; }
+/* ---- §2.7 two-line Greek prompts, RETIRED AS LINES ----
+   5I-SPEC2 §3.1 / DISCLOSURE-RULES §4.10 (VERIFY-5I-RESPONSE G2/G3): a Bible
+   verse is CONTINUOUS text everywhere and breaks only where the container
+   breaks it. `.prompt-line2 { display: block }` was the one forced break in a
+   drill prompt and it is gone; the continuation is now an ordinary inline span
+   carrying a single leading space, so the verse wraps to the card and to
+   nothing else. What survives is the TYPE RAMP: a joined verse is the longest
+   string this panel ever holds, so it steps down one size the way the two-line
+   render did — but keyed to length rather than to the presence of `greek2`,
+   because the two no longer mean the same thing. */
+/* `.prompt.greek.very-long`, not `.prompt.very-long`: THE 5F RULE NEVER TOOK
+   EFFECT. `.prompt.two-line` was (0,2,0) against `.prompt.greek.long`'s
+   (0,3,0) up at the top of this file, so every two-line prompt in the app has
+   been rendering at 2.2rem since 5F and the second step of the ramp was dead
+   text. Found by measuring every item of all twelve translation drills this
+   round (RESULTS §8): one computed size, 35.2px, on all 514 renders. Written at
+   equal specificity and later in the file, so it wins on source order and the
+   step is real. */
+.prompt.greek.very-long { font-size: 1.7rem; line-height: 1.3; padding: 12px 10px; }
+.prompt-cont { display: inline; }
 
 /* ---- §2.8 the pronoun paradigm ---- */
 .pronoun-paradigm .pp-gender { text-align: center; color: var(--accent-ink);
diff --git a/src/components/ContentAudio.svelte b/src/components/ContentAudio.svelte
index fe57726..318c3b0 100644
--- a/src/components/ContentAudio.svelte
+++ b/src/components/ContentAudio.svelte
@@ -113,6 +113,34 @@
     ? getGreekTapMap(chapter.id)
     : activity.greekTaps;
 
+  // 5I-SPEC2 §4.2 (VERIFY-5I-RESPONSE item 3): A TOPIC'S OWN `audioMap` REACHES
+  // ITS OWN PROSE. It did not, and chapter 13's Introduction is the page that
+  // showed it: πᾶς, πᾶσα and πᾶν were mapped to clips and NONE of the three was
+  // tappable, which is exactly what Nathanael reported.
+  //
+  // Why it looked like it worked everywhere else: `getGreekTapMap` folds every
+  // audioMap in a chapter — activity level AND topic level — into the
+  // chapter-wide map, so on any activity that declares `greekTaps: true` a
+  // topic's map arrives by that route. Eight of the nine topics in the app that
+  // carry an `audioMap` sit on such an activity. Chapter 13's Learn Third
+  // Declension Nouns is the ninth: no `greekTaps`, so `activityGreekTaps` is
+  // undefined, so the map reached `noteTaps` (chart notes) and nothing else.
+  // A topic that names a form-to-clip map is naming it for the page it is on;
+  // whether the ACTIVITY happens to opt into the chapter's lexicon map is a
+  // different decision and cannot be what makes it work.
+  //
+  // MERGED, not substituted, and merged LAST: nothing that taps today stops
+  // tapping, and where both maps name a form the topic's clip wins — which is
+  // what "the topic that prints the forms declares them" has to mean. For the
+  // eight topics already covered, `chapterAudioMap` had folded in the same
+  // pairs, so the merge changes nothing at all on those pages.
+  $: topicBaseTaps = currentTopic && currentTopic.greekTaps === true
+    ? getGreekTapMap(chapter.id)
+    : ((currentTopic && currentTopic.greekTaps) || activityGreekTaps);
+  $: topicPageTaps = currentTopic && currentTopic.audioMap
+    ? { ...(topicBaseTaps || {}), ...currentTopic.audioMap }
+    : topicBaseTaps;
+
   // paradigmChart: a Quick Review page's chart, or several of them. This mode
   // is used by quickReview activities and nothing else, so it IS the C9 host.
   $: paradigmPages = Array.isArray(activity.paradigms) && activity.paradigms.length
@@ -367,9 +395,7 @@
         suppressTitle={currentTopic.title}
         titleAudio={topicTitleCovered ? currentTopic.titleAudio || null : null}
         noteTaps={currentTopic.audioMap || null}
-        greekTaps={currentTopic.greekTaps === true
-          ? getGreekTapMap(chapter.id)
-          : (currentTopic.greekTaps || activityGreekTaps)} />
+        greekTaps={topicPageTaps} />
       {#if currentTopic._verify}<div class="pending-verification compact">Some topic details are pending verification.</div>{/if}
     {:else}
       <div class="pending-verification">Topic content pending verification.</div>
diff --git a/src/components/Paradigm.svelte b/src/components/Paradigm.svelte
index 3a68a5e..128528e 100644
--- a/src/components/Paradigm.svelte
+++ b/src/components/Paradigm.svelte
@@ -251,6 +251,18 @@
   //              three-plus the pinned line is the Back/More pair and the say
   //              button stays in the scrolling content with its chart, which
   //              is what keeps this to ONE pinned line.
+  // §4.9 (RATIFIED 2026-08-31, VERIFY-5I-RESPONSE item 11; 5I-SPEC2 §3.4):
+  // A LONG SINGLE LIST IN A MODAL SCROLLS UNDER A FROZEN HEADER ROW. When a
+  // modal holds ONE list — not a multi-chart bundle — it is never split into
+  // pages; it is one scrolling list whose column header ("Present Active /
+  // Aorist Passive / Future Passive") stays put at the top of the modal's
+  // scroll area while the rows move beneath it. So the condition is exactly
+  // "one chart, drawn as one grid, in a modal": a bundle still pages per §4.2
+  // and a grouped chart draws a header per group rather than one for the list.
+  // A list too short to scroll never shows the difference, which is why this
+  // needs no height threshold and gets no guess about one.
+  $: frozenHead = modalHost && charts.length === 1
+    && !groupedColumns.length && columns.length > 0;
   $: navControl = twoChartToggle || endingsInline ? 'toggle' : (hasMoreBackNav ? 'pair' : null);
   $: pinNav = modalHost && !actionsPinned && !!navControl;
   $: pinActions = pinNav && navControl === 'toggle' && hasActions;
@@ -307,6 +319,7 @@
   class:pg-three-columns={effectiveColumnCount === 3}
   class:pg-many-columns={effectiveColumnCount > 3}
   class:pg-modal-host={modalHost}
+  class:pg-frozen-head={frozenHead}
   class:pg-pins-nav={pinNav}
   data-chart-index={chartIndex}
   data-chart-count={charts.length}
diff --git a/src/components/RichContent.svelte b/src/components/RichContent.svelte
index 4d803fb..6e02520 100644
--- a/src/components/RichContent.svelte
+++ b/src/components/RichContent.svelte
@@ -418,6 +418,7 @@
            class:gloss-only={b.layout === 'glossOnly'} class:english-pairs={b.layout === 'englishPairs'}
            class:compound-verbs={b.layout === 'compoundVerbs'}
            class:contraction={b.layout === 'contraction'}
+           class:derivation={b.layout === 'derivation'}
            class:key-letter-box={b.layout === 'keyLetterBox'}
            class:transformation={b.layout === 'transformation'}
            class:stem-list={b.layout === 'stemList'}
@@ -623,7 +624,14 @@
                   {/if}
                 {/each}
                 {#if stemPopup}
-                  <button class="popup-link rc-chart-trigger rc-stem-note" data-chart-trigger={row.popupRef}
+                  <!-- 5I-SPEC2 §3.3 / DISCLOSURE-RULES §3.12: the note marker
+                       is a MODAL TRIGGER, not an in-chart one. It shipped
+                       carrying `.rc-chart-trigger`, which is the §3.3 exemption
+                       and made it blue and un-underlined beside a form that is
+                       itself a blue Greek tap — the one collision §3.3 exists
+                       to avoid. It is `.rc-prose-trigger` now, so its glyph and
+                       its ring are both the trigger green. -->
+                  <button class="popup-link rc-prose-trigger rc-stem-note" data-chart-trigger={row.popupRef}
                           aria-label="About this form" on:click={() => openPopup(stemPopup)}>?</button>
                 {/if}
               </span>
@@ -645,7 +653,20 @@
               <div class="rc-etf-rule" class:no-label={row.label == null}>
                 {#if row.label != null}
                   {#if rulePopup}
-                    <button class="popup-link rc-chart-trigger rc-etf-label" data-chart-trigger={row.popupRef}
+                    <!-- 5I-SPEC2 §3.3 / DISCLOSURE-RULES §3.11 (Nathanael's
+                         ruling on VERIFY-5I-RESPONSE item 9): A PROSE RULE LIST
+                         IS TEXT, NOT A CHART. This block lays out a page's
+                         running teaching prose — a rule line with a worked
+                         example under it — so its hot label is a C3 IN-TEXT
+                         link and takes §3.2's green underline, not the in-chart
+                         blue. It shipped as `.rc-chart-trigger` in 5I, which is
+                         the class §3.3 exempts, and that was the error the rule
+                         now names: §3.3 governs the cells and labels of an
+                         ACTUAL chart (paradigm, grid, table) — the ch13 Key
+                         Letter Box and the ch6 case-chart glosses — and this is
+                         neither. Bold is kept: the original sets these labels
+                         bold and nothing in §3.2 asks for the weight. -->
+                    <button class="popup-link rc-etf-label rc-prose-trigger" data-chart-trigger={row.popupRef}
                             on:click={() => openPopup(rulePopup)}>{row.label}</button>
                   {:else}
                     <span class="rc-etf-label">{row.label}</span>
@@ -734,8 +755,13 @@
             <div class="rc-greekrow rc-verse-example" style="--greek-cols:1">
               <button class="rc-verse-greek greek greek-say" disabled={!row.audio}
                       on:click={() => playAudio(row.audio)}>
-                <span class="rc-verse-line">{row.greek}</span>
-                {#if row.greek2}<span class="rc-verse-line">{row.greek2}</span>{/if}
+                <!-- 5I-SPEC2 §3.1 / DISCLOSURE-RULES §4.10: ONE FLOWING LINE.
+                     The original's second line is its panel's width, not the
+                     verse's punctuation, so the two join with a single space
+                     and wrap where the card wraps them. `greek2` stays in the
+                     data as extraction provenance (positional pool line 2);
+                     only the render joins. -->
+                <span class="rc-verse-line">{row.greek}</span>{#if row.greek2}<span class="rc-verse-line">{` ${row.greek2}`}</span>{/if}
               </button>
               {#if row.gloss}<span class="rc-greekgloss"><Marked text={row.gloss} /></span>{/if}
               {#if row.ref}<span class="rc-greekref">{row.ref}</span>{/if}
diff --git a/src/components/SelectActivity.svelte b/src/components/SelectActivity.svelte
index 80b9cd6..a692dbf 100644
--- a/src/components/SelectActivity.svelte
+++ b/src/components/SelectActivity.svelte
@@ -177,7 +177,20 @@
   // lost in silence (overflow-x is hidden app-wide). Declared here rather than
   // guessed in CSS, which cannot see how long a string is; chapter 1's letter
   // prompts and chapter 2's short words are below the threshold and unchanged.
-  $: longPrompt = promptIsGreek && [...String(current?.prompt || '')].length > 7;
+  // 5I-SPEC2 §3.1: the WHOLE prompt, continuation included. `prompt2` is no
+  // longer a second line but the tail of the same flowing verse, so it is part
+  // of what the type ramp has to fit.
+  $: promptFullText = [current?.prompt, current?.prompt2].filter(Boolean).join(' ');
+  $: longPrompt = promptIsGreek && [...String(promptFullText)].length > 7;
+  // The second step of the ramp. `two-line` used to mark a prompt that had a
+  // continuation and sized it down for the extra line; a joined verse needs the
+  // same step down for the same reason (it is the longest thing the panel ever
+  // holds), but it needs it because of its LENGTH rather than because a key is
+  // present. 47 clusters is the longest prompt in the app that has NO
+  // continuation and therefore already shipped at 2.2rem and was accepted;
+  // above it are the joined verses alone, which is exactly the set that wants
+  // the smaller step.
+  $: veryLongPrompt = promptIsGreek && [...String(promptFullText)].length > 47;
   $: uiButtons = activity.ui?.buttons || [];
   $: showPronounce = !authoredOptions || uiButtons.includes('Pronounce');
   $: showStepper = uiButtons.includes('Previous') || uiButtons.includes('Next');
@@ -247,7 +260,20 @@
     hintParadigmRef = activeHintRef;
     hintParadigmIndex = 0;
   }
-  $: hintBundle = Array.isArray(hintChart?.paradigms) ? hintChart.paradigms : [];
+  // 5I-SPEC2 §4.7 (VERIFY-5I I-3): A HINT MAY RESOLVE TO A CONTENT BLOCK, not
+  // only to a paradigm. Chapters 14 and 15 modelled their "Verb Forms" hints as
+  // two-column paradigms, which put the English gloss in the row-LABEL slot and
+  // therefore printed it FIRST; the original prints it last, and the Learn page
+  // of each chapter already draws the same list correctly as a `stemList`
+  // greekRows block. Rather than teach Paradigm a trailing-gloss column that
+  // exists to imitate a block the app already has, the hint now names that
+  // block: `hintCharts.<ref>.charts[0]` may be any RichContent block, and a
+  // resolved ref that is not a chart is rendered by RichContent in the same
+  // modal shell. The contract touched is `hintCharts`, which gains "a chart
+  // entry may be a content block"; nothing about the paradigm route changes.
+  $: hintChartIsBlock = !!hintChart && !!hintChart.type
+    && hintChart.type !== 'paradigm' && hintChart.type !== 'pronounParadigm';
+  $: hintBundle = !hintChartIsBlock && Array.isArray(hintChart?.paradigms) ? hintChart.paradigms : [];
   $: hintDisclosure = hintBundle.length >= 2;
   // §4.1 at exactly two, §4.2 at three or more — the same split Paradigm makes
   // for a charts[] stack, stated once per host because the two hosts own their
@@ -682,12 +708,24 @@
            mark offsets are em-relative and correct, and nothing about mark
            geometry moves in this round.
            5F §2.7: a two-line Greek prompt is ONE phrase and one clip, so the
-           second line lives inside the same tap target. -->
+           second line lives inside the same tap target.
+           5I-SPEC2 §3.1 / DISCLOSURE-RULES §4.10: AND IT IS NOT A LINE ANY
+           MORE. A verse is continuous text everywhere; the original's two-line
+           prompt is a storage artifact of its own fixed-width panel, never a
+           break the port reproduces. `prompt2` joins `prompt` with ONE SPACE
+           inside the same button and wraps only where the card's width wraps
+           it. The span survives so the surface can still say which items carry
+           a continuation (`greek2` stays in the data as extraction
+           provenance); it is inline and contributes nothing but that space. -->
+      <!-- The type ramp reads the JOINED string, not the first line alone: a
+           two-line verse became one long line in this round and sizing it off
+           `prompt` would leave the longest prompts in the app at the size a
+           short one wants. -->
       <!-- The note sits on the prompt's line but OUTSIDE its button, so it is
            not part of the tap target and can never speak. -->
       <div class="prompt-row" class:with-note={current.note}>
-        <button class="prompt greek greek-say" class:long={longPrompt} class:two-line={current.prompt2}
-                on:click={() => play(current.promptAudio)}>{current.prompt}{#if current.prompt2}<span class="prompt-line2">{current.prompt2}</span>{/if}</button>
+        <button class="prompt greek greek-say" class:long={longPrompt} class:very-long={veryLongPrompt}
+                on:click={() => play(current.promptAudio)}>{current.prompt}{#if current.prompt2}<span class="prompt-cont">{` ${current.prompt2}`}</span>{/if}</button>
         {#if current.note}<span class="prompt-note">{current.note}</span>{/if}
       </div>
     {:else if current.underline && sentenceParts(current.prompt, current.underline)}
@@ -934,7 +972,17 @@
       <!-- 5F-FEEDBACK.pdf §8.1 root-cause fix: every paradigm the Hint route
            can resolve now ships in the one standard cell-audio shape, so
            there is no second renderer to keep in sync. -->
-      {#if hintDisclosure}
+      {#if hintChartIsBlock}
+        <!-- 5I-SPEC2 §4.7: the resolved hint is a CONTENT BLOCK — chapters 14
+             and 15's Verb Forms lists, which are the Learn page's own
+             `stemList` and therefore already read "present — aorist (gloss)"
+             with the gloss last and both Greek forms tapping. Same modal shell
+             and the same scroller as every other Hint route; there is no
+             navigation, so nothing is pinned above Close (§4.3). -->
+        <div class="modal-scroll">
+          <RichContent blocks={[hintChart]} />
+        </div>
+      {:else if hintDisclosure}
         <!-- D-48f1: one chart at a time. A composite bundle is the one hint
              shape whose state the HOST owns — it picks which of the bundle's
              paradigms is on screen — so the host also owns the pinned line.
diff --git a/src/data/chapt-13.json b/src/data/chapt-13.json
index 1cd90ba..c23449b 100644
--- a/src/data/chapt-13.json
+++ b/src/data/chapt-13.json
@@ -273,9 +273,11 @@
       }
      ],
      "audioMap": {
-      "πᾶς, πᾶσα, πᾶν": "chapt_13_m_voc5"
+      "πᾶς": "chapt_13_m_pasmns",
+      "πᾶσα": "chapt_13_m_pasfns",
+      "πᾶν": "chapt_13_m_pasnns"
      },
-     "_audio_note": "CHAPT_13 ships NO m_pas lemma clip (unlike m_sar, m_xar, m_pis and m_ono). The three-form citation plays m_voc5, whose lexical form in the vocabulary pool IS \"pas, pasa, pan\"; the topic title plays m_pasmns, the chart's own masculine-nominative-singular cell, which is the single word the title prints. Both wanted on the listen list.",
+     "_audio_note": "TBK-CONFIRMED (5I-SPEC2 4.2): the original page carries THREE WordSelection buttons over this citation, not one -- 13_3DECL.TBK 0x21c0b, 0x21ce9, 0x21de4 -- dispatching m_pasmns, m_pasfns and m_pasnns. Each of pas, pasa and pan therefore taps its own word; the commas and spaces between them stay ink. m_voc5, which the phrase used to play as a unit, speaks pas ALONE (VERIFY-5I item B1, listened 2026-08-30) and is now unwired here. The topic title still plays m_pasmns, the chart's own masculine-nominative-singular cell, which is the single word the title prints.",
      "_underline_note": "genitive form is underlined on both screens (rail walk p5); [[u]] comes from the run table, not a fallback table."
     },
     {
@@ -602,148 +604,184 @@
       {
        "type": "paradigm",
        "id": "learnPasParadigm",
-       "title": "πᾶς  (all) Forms",
-       "columns": [
-        "Masculine",
-        "Feminine",
-        "Neuter",
-        "Masculine",
-        "Feminine",
-        "Neuter"
-       ],
-       "columnGroups": [
-        {
-         "label": "Singular",
-         "span": 3
-        },
-        {
-         "label": "Plural",
-         "span": 3
-        }
-       ],
-       "rows": [
-        {
-         "label": "Nom.",
-         "cells": [
-          {
-           "greek": "πᾶς",
-           "audio": "chapt_13_m_pasmns"
-          },
-          {
-           "greek": "πᾶσα",
-           "audio": "chapt_13_m_pasfns"
-          },
-          {
-           "greek": "πᾶν",
-           "audio": "chapt_13_m_pasnns"
-          },
-          {
-           "greek": "πάντες",
-           "audio": "chapt_13_m_pasmnp"
-          },
-          {
-           "greek": "πᾶσαι",
-           "audio": "chapt_13_m_pasfnp"
-          },
-          {
-           "greek": "πάντα",
-           "audio": "chapt_13_m_pasnnp"
-          }
-         ]
-        },
-        {
-         "label": "Gen.",
-         "cells": [
-          {
-           "greek": "παντός",
-           "audio": "chapt_13_m_pasmgs"
-          },
-          {
-           "greek": "πάσης",
-           "audio": "chapt_13_m_pasfgs"
-          },
-          {
-           "greek": "παντός",
-           "audio": "chapt_13_m_pasngs"
-          },
-          {
-           "greek": "πάντων",
-           "audio": "chapt_13_m_pasmgp"
-          },
-          {
-           "greek": "πασῶν",
-           "audio": "chapt_13_m_pasfgp"
-          },
-          {
-           "greek": "πάντων",
-           "audio": "chapt_13_m_pasngp"
-          }
-         ]
-        },
-        {
-         "label": "Dat.",
-         "cells": [
-          {
-           "greek": "παντί",
-           "audio": "chapt_13_m_pasmds"
-          },
-          {
-           "greek": "πάσῃ",
-           "audio": "chapt_13_m_pasfds"
+       "switch": "named",
+       "charts": [
+        {
+         "type": "paradigm",
+         "id": "learnPasSingular",
+         "name": "Singular",
+         "title": "πᾶς  (all) Forms",
+         "subtitle": "Singular",
+         "columns": [
+          "Masculine",
+          "Feminine",
+          "Neuter"
+         ],
+         "showGlosses": false,
+         "rows": [
+          {
+           "label": "Nom.",
+           "cells": [
+            {
+             "greek": "πᾶς",
+             "audio": "chapt_13_m_pasmns"
+            },
+            {
+             "greek": "πᾶσα",
+             "audio": "chapt_13_m_pasfns"
+            },
+            {
+             "greek": "πᾶν",
+             "audio": "chapt_13_m_pasnns"
+            }
+           ]
           },
           {
-           "greek": "παντί",
-           "audio": "chapt_13_m_pasnds"
+           "label": "Gen.",
+           "cells": [
+            {
+             "greek": "παντός",
+             "audio": "chapt_13_m_pasmgs"
+            },
+            {
+             "greek": "πάσης",
+             "audio": "chapt_13_m_pasfgs"
+            },
+            {
+             "greek": "παντός",
+             "audio": "chapt_13_m_pasngs"
+            }
+           ]
           },
           {
-           "greek": "πᾶσι(ν)",
-           "audio": "chapt_13_m_pasmdp"
+           "label": "Dat.",
+           "cells": [
+            {
+             "greek": "παντί",
+             "audio": "chapt_13_m_pasmds"
+            },
+            {
+             "greek": "πάσῃ",
+             "audio": "chapt_13_m_pasfds"
+            },
+            {
+             "greek": "παντί",
+             "audio": "chapt_13_m_pasnds"
+            }
+           ]
           },
           {
-           "greek": "πάσαις",
-           "audio": "chapt_13_m_pasfdp"
-          },
-          {
-           "greek": "πᾶσι(ν)",
-           "audio": "chapt_13_m_pasndp"
+           "label": "Acc.",
+           "cells": [
+            {
+             "greek": "πάντα",
+             "audio": "chapt_13_m_pasmas"
+            },
+            {
+             "greek": "πᾶσαν",
+             "audio": "chapt_13_m_pasfas"
+            },
+            {
+             "greek": "πᾶν",
+             "audio": "chapt_13_m_pasnas"
+            }
+           ]
           }
-         ]
-        },
-        {
-         "label": "Acc.",
-         "cells": [
-          {
-           "greek": "πάντα",
-           "audio": "chapt_13_m_pasmas"
-          },
-          {
-           "greek": "πᾶσαν",
-           "audio": "chapt_13_m_pasfas"
-          },
-          {
-           "greek": "πᾶν",
-           "audio": "chapt_13_m_pasnas"
+         ],
+         "sayWhole": {
+          "label": "Say Paradigm",
+          "audio": "chapt_13_m_paspar"
+         }
+        },
+        {
+         "type": "paradigm",
+         "id": "learnPasPlural",
+         "name": "Plural",
+         "title": "πᾶς  (all) Forms",
+         "subtitle": "Plural",
+         "columns": [
+          "Masculine",
+          "Feminine",
+          "Neuter"
+         ],
+         "showGlosses": false,
+         "rows": [
+          {
+           "label": "Nom.",
+           "cells": [
+            {
+             "greek": "πάντες",
+             "audio": "chapt_13_m_pasmnp"
+            },
+            {
+             "greek": "πᾶσαι",
+             "audio": "chapt_13_m_pasfnp"
+            },
+            {
+             "greek": "πάντα",
+             "audio": "chapt_13_m_pasnnp"
+            }
+           ]
           },
           {
-           "greek": "πάντας",
-           "audio": "chapt_13_m_pasmap"
+           "label": "Gen.",
+           "cells": [
+            {
+             "greek": "πάντων",
+             "audio": "chapt_13_m_pasmgp"
+            },
+            {
+             "greek": "πασῶν",
+             "audio": "chapt_13_m_pasfgp"
+            },
+            {
+             "greek": "πάντων",
+             "audio": "chapt_13_m_pasngp"
+            }
+           ]
           },
           {
-           "greek": "πάσας",
-           "audio": "chapt_13_m_pasfap"
+           "label": "Dat.",
+           "cells": [
+            {
+             "greek": "πᾶσι(ν)",
+             "audio": "chapt_13_m_pasmdp"
+            },
+            {
+             "greek": "πάσαις",
+             "audio": "chapt_13_m_pasfdp"
+            },
+            {
+             "greek": "πᾶσι(ν)",
+             "audio": "chapt_13_m_pasndp"
+            }
+           ]
           },
           {
-           "greek": "πάντα",
-           "audio": "chapt_13_m_pasnap"
+           "label": "Acc.",
+           "cells": [
+            {
+             "greek": "πάντας",
+             "audio": "chapt_13_m_pasmap"
+            },
+            {
+             "greek": "πάσας",
+             "audio": "chapt_13_m_pasfap"
+            },
+            {
+             "greek": "πάντα",
+             "audio": "chapt_13_m_pasnap"
+            }
+           ]
           }
-         ]
+         ],
+         "sayWhole": {
+          "label": "Say Paradigm",
+          "audio": "chapt_13_m_paspar"
+         }
         }
        ],
-       "showGlosses": false,
-       "sayWhole": {
-        "label": "Say Paradigm",
-        "audio": "chapt_13_m_paspar"
-       }
+       "_split_note": "5I-SPEC2 4.1 / DISCLOSURE-RULES 4.6 surface matrix: the original prints ONE six-column chart, which does not fit a phone. On a LEARN page that becomes a Singular chart and a Plural chart behind the 4.1 named toggle -- the chapter-11 shape -- never the stacked pair, which 4.6 prescribes for REVIEW pages only. The Review copy (qrPas) keeps its columnGroups stacking and is untouched. NIT-LOG N-1: the one m_paspar recording rides BOTH halves."
       }
      ]
     }
@@ -3106,7 +3144,7 @@
   "c13_qr_scripture_mat610a",
   "c13_learn_bibliography"
  ],
- "_audioVerify": "CHAPT_13 ships 159 WAVs, all 159 present in the audio manifest. UNREFERENCED (D-39 class): m_vocl (declared as an alias at 0x10294, played by nothing -- the Review chart plays the halves vocl13a/vocl13b instead), m_ad5 (an orphan of chapter 12's l_ad family), msargs (missing underscore, duplicate of m_sargs), m_onoss. Listens wanted: m_vocla / m_voclb (confirm they are the first and second five rows), m_pas (confirm it recites pas, pasa, pan and not pas alone), m_sm4 vs m_sm8 (both are sou).",
+ "_audioVerify": "CHAPT_13 ships 159 WAVs, all 159 present in the audio manifest. UNREFERENCED (D-39 class): m_vocl (declared as an alias at 0x10294, played by nothing -- the Review chart plays the halves vocl13a/vocl13b instead), m_ad5 (an orphan of chapter 12's l_ad family), msargs (missing underscore, duplicate of m_sargs), m_onoss. m_voc5 JOINS that list at 5I-SPEC2 4.2: the Introduction's three-form citation now taps as three words (m_pasmns / m_pasfns / m_pasnns) per the TBK's own dispatch, and nothing plays m_voc5 any more. Listens wanted: m_vocla / m_voclb (confirm they are the first and second five rows). SETTLED: there is no m_pas clip in this pack -- the earlier note asked for a listen on a name that does not exist; the clip it meant was m_voc5, and VERIFY-5I B1 confirmed on 2026-08-30 that m_voc5 speaks pas ALONE, not the three-form citation. m_sm4 vs m_sm8 (both sou) listened the same round: no audible difference, and duplicate recordings of one word are ordinary in this source -- left as shipped.",
  "_menu_note": "Drill Menu and page titles agree in this chapter; no title sweep divergence.",
  "_sequence_note": "Rail order from ch13railwalk.pdf, cross-checked against the Drill / Exercise / Quick Review menus on its last page.",
  "hintCharts": {
@@ -3411,26 +3449,16 @@
    "charts": [
     {
      "type": "paradigm",
-     "id": "hintPas",
-     "title": "πᾶς  Forms",
+     "id": "hintPasSingular",
+     "name": "Singular",
+     "title": "πᾶς  Forms, Singular",
+     "subtitle": "Singular",
      "columns": [
-      "Masculine",
-      "Feminine",
-      "Neuter",
       "Masculine",
       "Feminine",
       "Neuter"
      ],
-     "columnGroups": [
-      {
-       "label": "Singular",
-       "span": 3
-      },
-      {
-       "label": "Plural",
-       "span": 3
-      }
-     ],
+     "showGlosses": false,
      "rows": [
       {
        "label": "Nom.",
@@ -3446,18 +3474,6 @@
         {
          "greek": "πᾶν",
          "audio": "chapt_13_m_pasnns"
-        },
-        {
-         "greek": "πάντες",
-         "audio": "chapt_13_m_pasmnp"
-        },
-        {
-         "greek": "πᾶσαι",
-         "audio": "chapt_13_m_pasfnp"
-        },
-        {
-         "greek": "πάντα",
-         "audio": "chapt_13_m_pasnnp"
         }
        ]
       },
@@ -3475,18 +3491,6 @@
         {
          "greek": "παντός",
          "audio": "chapt_13_m_pasngs"
-        },
-        {
-         "greek": "πάντων",
-         "audio": "chapt_13_m_pasmgp"
-        },
-        {
-         "greek": "πασῶν",
-         "audio": "chapt_13_m_pasfgp"
-        },
-        {
-         "greek": "πάντων",
-         "audio": "chapt_13_m_pasngp"
         }
        ]
       },
@@ -3504,18 +3508,6 @@
         {
          "greek": "παντί",
          "audio": "chapt_13_m_pasnds"
-        },
-        {
-         "greek": "πᾶσι(ν)",
-         "audio": "chapt_13_m_pasmdp"
-        },
-        {
-         "greek": "πάσαις",
-         "audio": "chapt_13_m_pasfdp"
-        },
-        {
-         "greek": "πᾶσι(ν)",
-         "audio": "chapt_13_m_pasndp"
         }
        ]
       },
@@ -3533,7 +3525,82 @@
         {
          "greek": "πᾶν",
          "audio": "chapt_13_m_pasnas"
+        }
+       ]
+      }
+     ],
+     "sayWhole": {
+      "label": "Say Paradigm",
+      "audio": "chapt_13_m_paspar"
+     }
+    },
+    {
+     "type": "paradigm",
+     "id": "hintPasPlural",
+     "name": "Plural",
+     "title": "πᾶς  Forms, Plural",
+     "subtitle": "Plural",
+     "columns": [
+      "Masculine",
+      "Feminine",
+      "Neuter"
+     ],
+     "showGlosses": false,
+     "rows": [
+      {
+       "label": "Nom.",
+       "cells": [
+        {
+         "greek": "πάντες",
+         "audio": "chapt_13_m_pasmnp"
+        },
+        {
+         "greek": "πᾶσαι",
+         "audio": "chapt_13_m_pasfnp"
         },
+        {
+         "greek": "πάντα",
+         "audio": "chapt_13_m_pasnnp"
+        }
+       ]
+      },
+      {
+       "label": "Gen.",
+       "cells": [
+        {
+         "greek": "πάντων",
+         "audio": "chapt_13_m_pasmgp"
+        },
+        {
+         "greek": "πασῶν",
+         "audio": "chapt_13_m_pasfgp"
+        },
+        {
+         "greek": "πάντων",
+         "audio": "chapt_13_m_pasngp"
+        }
+       ]
+      },
+      {
+       "label": "Dat.",
+       "cells": [
+        {
+         "greek": "πᾶσι(ν)",
+         "audio": "chapt_13_m_pasmdp"
+        },
+        {
+         "greek": "πάσαις",
+         "audio": "chapt_13_m_pasfdp"
+        },
+        {
+         "greek": "πᾶσι(ν)",
+         "audio": "chapt_13_m_pasndp"
+        }
+       ]
+      },
+      {
+       "label": "Acc.",
+       "cells": [
         {
          "greek": "πάντας",
          "audio": "chapt_13_m_pasmap"
@@ -3549,11 +3616,14 @@
        ]
       }
      ],
-     "showGlosses": false,
+     "sayWhole": {
+      "label": "Say Paradigm",
+      "audio": "chapt_13_m_paspar"
+     },
      "_verify_note": "This screen (0x11875e) misprints pa?saij where the Learn and Review charts print pa<saij. Shipped CORRECTED on the D-55 precedent; VERIFY."
     }
    ],
-   "_note": "The pas drill's own hint field at 0x11875e; its title is \"pas Forms\", NOT the Learn page's \"pas (all) Forms\"."
+   "_note": "The pas drill's own hint field at 0x11875e; its title is \"pas Forms\", NOT the Learn page's \"pas (all) Forms\". 5I-SPEC2 4.1: SPLIT Singular/Plural and paged in the modal per DISCLOSURE-RULES 4.3, matching chapter 11's paged hints. D-58: the Say Paradigm button (m_paspar) is ADDED on each half per 4.8 -- the original's hint screen has no say button, and a paradigm with a say-all recording anywhere in the chapter carries it in the hint too."
   }
  }
 }
\ No newline at end of file
diff --git a/src/data/chapt-14.json b/src/data/chapt-14.json
index 38908c3..b1ffaa6 100644
--- a/src/data/chapt-14.json
+++ b/src/data/chapt-14.json
@@ -135,14 +135,16 @@
         },
         {
          "text": "ε + λαβ + ο + ν = ἔλαβον",
-         "audio": "chapt_14_n_lab1s",
-         "tapUnit": true
+         "greekTap": {
+          "word": "ἔλαβον",
+          "audio": "chapt_14_n_lab1s"
+         }
         },
         {
          "text": "Aug   Stem   CV   Ending"
         }
        ],
-       "_note": "D-48f2 shape: the Greek line is one tap unit playing elabon (n_lab1s); the English lines are inert."
+       "_note": "D-48f2 shape with the 5G-SPEC3 tap boundary applied: the Greek line prints a RESULT, so only elabon taps (n_lab1s) and the morphemes building it stay ink; the English lines are inert. 5G-SPEC3 tap-boundary canon (5I-SPEC2 4.3): in a worked example only the RESULTING Greek form is the tap. tapUnit is for a pure morpheme equation with no printed result; this line prints one, so elabon alone speaks and the morphemes that build it stay ink."
       },
       {
        "type": "para",
@@ -2112,7 +2114,7 @@
         },
         {
          "greek": "ἐλάβομεν",
-         "gloss": "we took",
+         "gloss": "We took",
          "audio": "chapt_14_n_lab1p"
         }
        ]
@@ -2122,12 +2124,12 @@
        "cells": [
         {
          "greek": "ἔλαβες",
-         "gloss": "you took",
+         "gloss": "You took",
          "audio": "chapt_14_n_lab2s"
         },
         {
          "greek": "ἐλάβετε",
-         "gloss": "you took",
+         "gloss": "You took",
          "audio": "chapt_14_n_lab2p"
         }
        ]
@@ -2137,12 +2139,12 @@
        "cells": [
         {
          "greek": "ἔλαβε(ν)",
-         "gloss": "he/she/it took",
+         "gloss": "He/she/it took",
          "audio": "chapt_14_n_lab3s"
         },
         {
          "greek": "ἔλαβον",
-         "gloss": "they took",
+         "gloss": "They took",
          "audio": "chapt_14_n_lab3p"
         }
        ]
@@ -2152,7 +2154,8 @@
       "label": "Say Paradigm",
       "audio": "chapt_14_n_labpar"
      },
-     "name": "Second Aorist Active"
+     "name": "Second Aorist Active",
+     "_note": "D-60 (5I-SPEC2 4.8, VERIFY-5I I-5): these glosses printed lower case while the Learn copy of the same paradigm capitalises them. The original appears to be inconsistent here; Nathanael ruled on 2026-08-30 that paradigm glosses capitalise regardless of the original, and the divergence is recorded rather than reproduced."
     },
     {
      "type": "paradigm",
@@ -2779,7 +2782,7 @@
         },
         {
          "greek": "ἐλάβομεν",
-         "gloss": "we took",
+         "gloss": "We took",
          "audio": "chapt_14_n_lab1p"
         }
        ]
@@ -2789,12 +2792,12 @@
        "cells": [
         {
          "greek": "ἔλαβες",
-         "gloss": "you took",
+         "gloss": "You took",
          "audio": "chapt_14_n_lab2s"
         },
         {
          "greek": "ἐλάβετε",
-         "gloss": "you took",
+         "gloss": "You took",
          "audio": "chapt_14_n_lab2p"
         }
        ]
@@ -2804,17 +2807,18 @@
        "cells": [
         {
          "greek": "ἔλαβε(ν)",
-         "gloss": "he/she/it took",
+         "gloss": "He/she/it took",
          "audio": "chapt_14_n_lab3s"
         },
         {
          "greek": "ἔλαβον",
-         "gloss": "they took",
+         "gloss": "They took",
          "audio": "chapt_14_n_lab3p"
         }
        ]
       }
-     ]
+     ],
+     "_note": "D-60 (5I-SPEC2 4.8, VERIFY-5I I-5): these glosses printed lower case while the Learn copy of the same paradigm capitalises them. The original appears to be inconsistent here; Nathanael ruled on 2026-08-30 that paradigm glosses capitalise regardless of the original, and the divergence is recorded rather than reproduced."
     },
     {
      "type": "paradigm",
@@ -2878,20 +2882,17 @@
   "secondAoristForms": {
    "charts": [
     {
-     "type": "paradigm",
-     "id": "hintSecondAoristForms",
+     "type": "greekRows",
+     "layout": "stemList",
      "title": "Second Aorist Verb Forms",
-     "columns": [
-      "Present",
-      "Second Aorist"
-     ],
      "rows": [
       {
-       "label": "I departed",
-       "cells": [
+       "greek": "ἀπέρχομαι",
+       "audio": "chapt_14_n_apep",
+       "gloss": "(I departed)",
+       "parts": [
         {
-         "greek": "ἀπέρχομαι",
-         "audio": "chapt_14_n_apep"
+         "text": "—"
         },
         {
          "greek": "ἀπῆλθον",
@@ -2900,11 +2901,12 @@
        ]
       },
       {
-       "label": "I died",
-       "cells": [
+       "greek": "ἀποθνῄσκω",
+       "audio": "chapt_14_n_apop",
+       "gloss": "(I died)",
+       "parts": [
         {
-         "greek": "ἀποθνῄσκω",
-         "audio": "chapt_14_n_apop"
+         "text": "—"
         },
         {
          "greek": "ἀπέθανον",
@@ -2913,11 +2915,12 @@
        ]
       },
       {
-       "label": "I threw",
-       "cells": [
+       "greek": "βάλλω",
+       "audio": "chapt_14_n_balp",
+       "gloss": "(I threw)",
+       "parts": [
         {
-         "greek": "βάλλω",
-         "audio": "chapt_14_n_balp"
+         "text": "—"
         },
         {
          "greek": "ἔβαλον",
@@ -2926,11 +2929,12 @@
        ]
       },
       {
-       "label": "I saw",
-       "cells": [
+       "greek": "βλέπω",
+       "audio": "chapt_14_n_blep",
+       "gloss": "(I saw)",
+       "parts": [
         {
-         "greek": "βλέπω",
-         "audio": "chapt_14_n_blep"
+         "text": "—"
         },
         {
          "greek": "εἶδον",
@@ -2939,11 +2943,12 @@
        ]
       },
       {
-       "label": "I became",
-       "cells": [
+       "greek": "γίνομαι",
+       "audio": "chapt_14_n_ginp",
+       "gloss": "(I became)",
+       "parts": [
         {
-         "greek": "γίνομαι",
-         "audio": "chapt_14_n_ginp"
+         "text": "—"
         },
         {
          "greek": "ἐγενόμην",
@@ -2952,11 +2957,12 @@
        ]
       },
       {
-       "label": "I knew",
-       "cells": [
+       "greek": "γινώσκω",
+       "audio": "chapt_14_n_ginwp",
+       "gloss": "(I knew)",
+       "parts": [
         {
-         "greek": "γινώσκω",
-         "audio": "chapt_14_n_ginwp"
+         "text": "—"
         },
         {
          "greek": "ἔγνων",
@@ -2965,11 +2971,12 @@
        ]
       },
       {
-       "label": "I entered",
-       "cells": [
+       "greek": "εἰσέρχομαι",
+       "audio": "chapt_14_n_eisp",
+       "gloss": "(I entered)",
+       "parts": [
         {
-         "greek": "εἰσέρχομαι",
-         "audio": "chapt_14_n_eisp"
+         "text": "—"
         },
         {
          "greek": "εἰσῆλθον",
@@ -2978,11 +2985,12 @@
        ]
       },
       {
-       "label": "I went out",
-       "cells": [
+       "greek": "ἐξέρχομαι",
+       "audio": "chapt_14_n_ecep",
+       "gloss": "(I went out)",
+       "parts": [
         {
-         "greek": "ἐξέρχομαι",
-         "audio": "chapt_14_n_ecep"
+         "text": "—"
         },
         {
          "greek": "ἐξῆλθον",
@@ -2991,11 +2999,12 @@
        ]
       },
       {
-       "label": "I came, went",
-       "cells": [
+       "greek": "ἔρχομαι",
+       "audio": "chapt_14_n_erxp",
+       "gloss": "(I came, went)",
+       "parts": [
         {
-         "greek": "ἔρχομαι",
-         "audio": "chapt_14_n_erxp"
+         "text": "—"
         },
         {
          "greek": "ἦλθον",
@@ -3004,11 +3013,12 @@
        ]
       },
       {
-       "label": "I found",
-       "cells": [
+       "greek": "εὑρίσκω",
+       "audio": "chapt_14_n_eurp",
+       "gloss": "(I found)",
+       "parts": [
         {
-         "greek": "εὑρίσκω",
-         "audio": "chapt_14_n_eurp"
+         "text": "—"
         },
         {
          "greek": "εὗρον",
@@ -3017,11 +3027,12 @@
        ]
       },
       {
-       "label": "I had",
-       "cells": [
+       "greek": "ἔχω",
+       "audio": "chapt_14_n_exwp",
+       "gloss": "(I had)",
+       "parts": [
         {
-         "greek": "ἔχω",
-         "audio": "chapt_14_n_exwp"
+         "text": "—"
         },
         {
          "greek": "ἔσχον",
@@ -3030,11 +3041,12 @@
        ]
       },
       {
-       "label": "I took",
-       "cells": [
+       "greek": "λαμβάνω",
+       "audio": "chapt_14_n_lamp",
+       "gloss": "(I took)",
+       "parts": [
         {
-         "greek": "λαμβάνω",
-         "audio": "chapt_14_n_lamp"
+         "text": "—"
         },
         {
          "greek": "ἔλαβον",
@@ -3043,11 +3055,12 @@
        ]
       },
       {
-       "label": "I said",
-       "cells": [
+       "greek": "λέγω",
+       "audio": "chapt_14_n_legp",
+       "gloss": "(I said)",
+       "parts": [
         {
-         "greek": "λέγω",
-         "audio": "chapt_14_n_legp"
+         "text": "—"
         },
         {
          "greek": "εἶπον",
@@ -3058,7 +3071,7 @@
      ]
     }
    ],
-   "_note": "The Forms Drill hint (0xaf024) prints the whole verb list as a two-column present/aorist table; emitted as a paradigm so both columns tap."
+   "_note": "5I-SPEC2 4.7 (VERIFY-5I I-3): this hint shipped as a two-column paradigm with the English gloss as the ROW LABEL, so the gloss printed FIRST. The original prints \"aperchomai -- aphlqon (I departed)\", gloss last, and this chapter's own Learn topic 6 already does. Reshaped to that same stemList block -- present, dash, aorist, gloss -- with both Greek forms tapping their own clips. Chapter 15's firstAoristForms is reshaped identically in the same round. The Forms Drill hint (0xaf024) prints the whole verb list as a two-column present/aorist table; emitted as a paradigm so both columns tap."
   }
  }
 }
\ No newline at end of file
diff --git a/src/data/chapt-15.json b/src/data/chapt-15.json
index c36fc28..0a88b3b 100644
--- a/src/data/chapt-15.json
+++ b/src/data/chapt-15.json
@@ -1177,7 +1177,7 @@
      ],
      "answer": "and he was teaching them many things in parables and was saying to them",
      "audio": "chapt_15_o_td1",
-     "hintRef": "aoristVsImperfect",
+     "hintRef": "imperfectPair",
      "greek2": "ἔλεγεν αὐτοῖς"
     },
     {
@@ -1190,7 +1190,7 @@
      ],
      "answer": "and he sent him to his home",
      "audio": "chapt_15_o_td2",
-     "hintRef": "aoristVsImperfect"
+     "hintRef": "aoristPair"
     },
     {
      "greek": "Ὡς οὖν ἔγνω ὁ Ἰησοῦς ὅτι ἤκουσαν οἱ φαρισαῖοι",
@@ -1202,7 +1202,7 @@
      ],
      "answer": "Therefore when Jesus knew that the Pharisees heard",
      "audio": "chapt_15_o_td3",
-     "hintRef": "aoristVsImperfect"
+     "hintRef": "aoristPair"
     },
     {
      "greek": "καὶ ἤκουσα φωνὴν ἐκ τοῦ οὐρανοῦ ὡς φωνὴν",
@@ -1214,7 +1214,7 @@
      ],
      "answer": "and I heard a voice from heaven like the sound of many waters",
      "audio": "chapt_15_o_td4",
-     "hintRef": "aoristVsImperfect",
+     "hintRef": "aoristPair",
      "greek2": "ὑδάτων πολλῶν"
     },
     {
@@ -1227,7 +1227,7 @@
      ],
      "answer": "And Mary remained with her about three months",
      "audio": "chapt_15_o_td5",
-     "hintRef": "aoristVsImperfect"
+     "hintRef": "aoristPair"
     },
     {
      "greek": "καὶ πᾶς ὁ ὄχλος ἤρχετο πρὸς αὐτόν, καὶ",
@@ -1239,7 +1239,7 @@
      ],
      "answer": "and all the crowd came to him and he taught them",
      "audio": "chapt_15_o_td6",
-     "hintRef": "aoristVsImperfect",
+     "hintRef": "aoristPair",
      "greek2": "ἐδίδασκεν αὐτούς"
     },
     {
@@ -1252,7 +1252,7 @@
      ],
      "answer": "Yet he had one, a beloved son, he sent him last to them",
      "audio": "chapt_15_o_td7",
-     "hintRef": "aoristVsImperfect",
+     "hintRef": "aoristPair",
      "greek2": "ἔσχατον πρὸς αὐτοὺς"
     },
     {
@@ -1265,7 +1265,7 @@
      ],
      "answer": "and they heard a loud voice from heaven",
      "audio": "chapt_15_o_td8",
-     "hintRef": "aoristVsImperfect"
+     "hintRef": "aoristPair"
     },
     {
      "greek": "Ἠκούσατε ... Ὀφθαλμὸν ἀντὶ ὀφθαλμοῦ καὶ",
@@ -1277,7 +1277,7 @@
      ],
      "answer": "You (pl) heard \"Eye for eye and tooth for tooth\"",
      "audio": "chapt_15_o_td9",
-     "hintRef": "aoristVsImperfect",
+     "hintRef": "aoristPair",
      "greek2": "ὀδόντα ἀντὶ ὀδόντος"
     },
     {
@@ -1290,7 +1290,7 @@
      ],
      "answer": "but according to his mercy he saved us",
      "audio": "chapt_15_o_td10",
-     "hintRef": "aoristVsImperfect"
+     "hintRef": "aoristPair"
     },
     {
      "greek": "καὶ αὐτὸς ἐδίδασκεν ἐν ταῖς συναγωγαῖς αὐτῶν",
@@ -1302,7 +1302,7 @@
      ],
      "answer": "And he was teaching in their synagogues",
      "audio": "chapt_15_o_td11",
-     "hintRef": "aoristVsImperfect"
+     "hintRef": "imperfectPair"
     },
     {
      "greek": "οὐ γὰρ ἀπέστειλεν ὁ θεὸς τὸν υἱὸν εἰς τὸν",
@@ -1314,7 +1314,7 @@
      ],
      "answer": "For God did not send the son into the world to judge the world",
      "audio": "chapt_15_o_td12",
-     "hintRef": "aoristVsImperfect",
+     "hintRef": "aoristPair",
      "greek2": "κόσμον ἵνα κρίνῃ τὸν κόσμον"
     },
     {
@@ -1327,7 +1327,7 @@
      ],
      "answer": "You heard that I said to you, \"I go away and I will come to you\"",
      "audio": "chapt_15_o_td13",
-     "hintRef": "aoristVsImperfect",
+     "hintRef": "aoristPair",
      "greek2": "πρὸς ὑμᾶς"
     },
     {
@@ -1340,7 +1340,7 @@
      ],
      "answer": "Lord, I heard from many about this man",
      "audio": "chapt_15_o_td14",
-     "hintRef": "aoristVsImperfect",
+     "hintRef": "aoristPair",
      "greek2": "τούτου"
     },
     {
@@ -1353,7 +1353,7 @@
      ],
      "answer": "and they stayed with him that day",
      "audio": "chapt_15_o_td15",
-     "hintRef": "aoristVsImperfect"
+     "hintRef": "aoristPair"
     },
     {
      "greek": "ἐγὼ πάντοτε ἐδίδαξα ἐν συναγωγῇ καὶ ἐν τῷ",
@@ -1365,7 +1365,7 @@
      ],
      "answer": "I always taught in synagogues and in the temple",
      "audio": "chapt_15_o_td16",
-     "hintRef": "aoristVsImperfect",
+     "hintRef": "aoristPair",
      "greek2": "ἱερῷ"
     },
     {
@@ -1378,7 +1378,7 @@
      ],
      "answer": "He sent his son, a propitiation for our sins",
      "audio": "chapt_15_o_td17",
-     "hintRef": "aoristVsImperfect",
+     "hintRef": "aoristPair",
      "greek2": "ἁμαρτιῶν ἡμῶν"
     },
     {
@@ -1391,7 +1391,7 @@
      ],
      "answer": "Children, it is the last hour, and just as you heard that anti-Christ comes",
      "audio": "chapt_15_o_td18",
-     "hintRef": "aoristVsImperfect",
+     "hintRef": "aoristPair",
      "greek2": "ὅτι ἀντίχριστος ἔρχεται"
     },
     {
@@ -1404,7 +1404,7 @@
      ],
      "answer": "for all things that I have heard from my father",
      "audio": "chapt_15_o_td19",
-     "hintRef": "aoristVsImperfect"
+     "hintRef": "aoristPair"
     },
     {
      "greek": "ὅν ὁ θεὸς ἤγειρεν ἐκ νεκρῶν, οὗ ἡμεῖς μάρτυρές",
@@ -1416,7 +1416,7 @@
      ],
      "answer": "whom God raised from the dead, of which we are witnesses",
      "audio": "chapt_15_o_td20",
-     "hintRef": "aoristVsImperfect",
+     "hintRef": "aoristPair",
      "greek2": "ἐσμεν."
     },
     {
@@ -1429,7 +1429,7 @@
      ],
      "answer": "Therefore the sisters sent to him",
      "audio": "chapt_15_o_td21",
-     "hintRef": "aoristVsImperfect"
+     "hintRef": "aoristPair"
     },
     {
      "greek": "Ἡμεῖς ἠκούσαμεν ἐκ τοῦ νόμου ὅτι ὁ Χριστὸς",
@@ -1441,7 +1441,7 @@
      ],
      "answer": "We heard from the law that the Christ remains forever",
      "audio": "chapt_15_o_td22",
-     "hintRef": "aoristVsImperfect",
+     "hintRef": "aoristPair",
      "greek2": "μένει εἰς τὸν αἰῶνα"
     },
     {
@@ -1454,7 +1454,7 @@
      ],
      "answer": "And I looked, and heard a voice of many angels around the throne",
      "audio": "chapt_15_o_td23",
-     "hintRef": "aoristVsImperfect",
+     "hintRef": "aoristPair",
      "greek2": "κύκλῳ τοῦ θρόνου"
     },
     {
@@ -1467,7 +1467,7 @@
      ],
      "answer": "I wrote to you in the letter",
      "audio": "chapt_15_o_td24",
-     "hintRef": "aoristVsImperfect"
+     "hintRef": "aoristPair"
     },
     {
      "greek": "ὅτι παρὰ σοῦ ἐξῆλθον, καὶ ἐπίστευσαν ὅτι",
@@ -1479,7 +1479,7 @@
      ],
      "answer": "that I came forth from you and they believed that you sent me",
      "audio": "chapt_15_o_td25",
-     "hintRef": "aoristVsImperfect",
+     "hintRef": "aoristPair",
      "greek2": "σύ με ἀπέστειλας"
     },
     {
@@ -1492,7 +1492,7 @@
      ],
      "answer": "As you sent me into the world, I also sent them into the world",
      "audio": "chapt_15_o_td26",
-     "hintRef": "aoristVsImperfect",
+     "hintRef": "aoristPair",
      "greek2": "ἀπέστειλα αὐτοὺς εἰς τὸν κόσμον"
     },
     {
@@ -1505,7 +1505,7 @@
      ],
      "answer": "then Jesus sent the two disciples",
      "audio": "chapt_15_o_td27",
-     "hintRef": "aoristVsImperfect"
+     "hintRef": "aoristPair"
     },
     {
      "greek": "ἴδε νῦν ἠκούσατε τὴν βλασφημίαν",
@@ -1517,7 +1517,7 @@
      ],
      "answer": "behold now you heard the blasphemy",
      "audio": "chapt_15_o_td28",
-     "hintRef": "aoristVsImperfect"
+     "hintRef": "aoristPair"
     },
     {
      "greek": "Πρὸς τὴν σκληροκαρδίαν ὑμῶν ἔγραψεν ὑμῖν",
@@ -1529,7 +1529,7 @@
      ],
      "answer": "Because of your hard heart he wrote this command to you",
      "audio": "chapt_15_o_td29",
-     "hintRef": "aoristVsImperfect",
+     "hintRef": "aoristPair",
      "greek2": "τὴν ἐντολὴν ταύτην"
     }
    ],
@@ -1549,14 +1549,15 @@
      "pronounceEach": true
     },
     "liveScore": true,
-    "hintRef": "aoristVsImperfect"
+    "hintRef": "aoristPair"
    },
    "_answer_note": "TWENTY-NINE items (0x70f65). The A/B/C key script yields all 29 and agrees with the BLUE option on ch15railwalk.pdf p14-p22. Second Greek lines from the positional pool at 0x116a34, which carries a LEADING blank so entry i+1 is item i.",
    "audioTiming": "afterGuess",
    "answerPolicy": {
     "advanceClass": "manualOnIncorrect",
     "attemptsPerItem": 1
-   }
+   },
+   "_hint_note": "5I-SPEC2 5.5, read from 15_1AOR.TBK 0x116f1e (D-46 class): the Hint button runs \"when it = 1 or it = 11 -> Hint2, else Hint1\". Hint1 is the aorist pair, Hint2 the imperfect pair -- the aorist-versus-imperfect contrast the drill is teaching, shown one side at a time against the verse on screen rather than as a four-page stack. Items 1 (Mar 4:2) and 11 (Luk 4:15) take the imperfect pair; the other 27 take the aorist pair. The drill-level ui.hintRef is the aorist pair, which is the else branch."
   },
   {
    "id": "c15_drill_vocab_gk_en",
@@ -2186,7 +2187,7 @@
         },
         {
          "greek": "ἐλύσαμεν",
-         "gloss": "we loosed",
+         "gloss": "We loosed",
          "audio": "chapt_15_o_luwa1p"
         }
        ]
@@ -2196,12 +2197,12 @@
        "cells": [
         {
          "greek": "ἔλυσας",
-         "gloss": "you loosed",
+         "gloss": "You loosed",
          "audio": "chapt_15_o_luwa2s"
         },
         {
          "greek": "ἐλύσατε",
-         "gloss": "you loosed",
+         "gloss": "You loosed",
          "audio": "chapt_15_o_luwa2p"
         }
        ]
@@ -2211,12 +2212,12 @@
        "cells": [
         {
          "greek": "ἔλυσε(ν)",
-         "gloss": "he/she/it loosed",
+         "gloss": "He/she/it loosed",
          "audio": "chapt_15_o_luwa3s"
         },
         {
          "greek": "ἔλυσαν",
-         "gloss": "they loosed",
+         "gloss": "They loosed",
          "audio": "chapt_15_o_luwa3p"
         }
        ]
@@ -2226,7 +2227,8 @@
       "label": "Say Paradigm",
       "audio": "chapt_15_o_luapar"
      },
-     "name": "First Aorist Active"
+     "name": "First Aorist Active",
+     "_note": "D-60 (5I-SPEC2 4.8, VERIFY-5I I-5): these glosses printed lower case while the Learn copy of the same paradigm capitalises them. The original appears to be inconsistent here; Nathanael ruled on 2026-08-30 that paradigm glosses capitalise regardless of the original, and the divergence is recorded rather than reproduced."
     },
     {
      "type": "paradigm",
@@ -2953,20 +2955,17 @@
   "firstAoristForms": {
    "charts": [
     {
-     "type": "paradigm",
-     "id": "hintFirstAoristForms",
+     "type": "greekRows",
+     "layout": "stemList",
      "title": "First Aorist Verb Forms",
-     "columns": [
-      "Present",
-      "First Aorist"
-     ],
      "rows": [
       {
-       "label": "I heard",
-       "cells": [
+       "greek": "ἀκούω",
+       "audio": "chapt_15_o_akop",
+       "gloss": "(I heard)",
+       "parts": [
         {
-         "greek": "ἀκούω",
-         "audio": "chapt_15_o_akop"
+         "text": "—"
         },
         {
          "greek": "ἤκουσα",
@@ -2975,11 +2974,12 @@
        ]
       },
       {
-       "label": "I sent",
-       "cells": [
+       "greek": "ἀποστέλλω",
+       "audio": "chapt_15_o_apop",
+       "gloss": "(I sent)",
+       "parts": [
         {
-         "greek": "ἀποστέλλω",
-         "audio": "chapt_15_o_apop"
+         "text": "—"
         },
         {
          "greek": "ἀπέστειλα",
@@ -2988,11 +2988,12 @@
        ]
       },
       {
-       "label": "I saw",
-       "cells": [
+       "greek": "βλέπω",
+       "audio": "chapt_15_o_blep",
+       "gloss": "(I saw)",
+       "parts": [
         {
-         "greek": "βλέπω",
-         "audio": "chapt_15_o_blep"
+         "text": "—"
         },
         {
          "greek": "ἔβλεψα",
@@ -3001,11 +3002,12 @@
        ]
       },
       {
-       "label": "I wrote",
-       "cells": [
+       "greek": "γράφω",
+       "audio": "chapt_15_o_grap",
+       "gloss": "(I wrote)",
+       "parts": [
         {
-         "greek": "γράφω",
-         "audio": "chapt_15_o_grap"
+         "text": "—"
         },
         {
          "greek": "ἔγραψα",
@@ -3014,11 +3016,12 @@
        ]
       },
       {
-       "label": "I taught",
-       "cells": [
+       "greek": "διδάσκω",
+       "audio": "chapt_15_o_didp",
+       "gloss": "(I taught)",
+       "parts": [
         {
-         "greek": "διδάσκω",
-         "audio": "chapt_15_o_didp"
+         "text": "—"
         },
         {
          "greek": "ἐδίδαξα",
@@ -3027,11 +3030,12 @@
        ]
       },
       {
-       "label": "I rose",
-       "cells": [
+       "greek": "ἐγείρω",
+       "audio": "chapt_15_o_egep",
+       "gloss": "(I rose)",
+       "parts": [
         {
-         "greek": "ἐγείρω",
-         "audio": "chapt_15_o_egep"
+         "text": "—"
         },
         {
          "greek": "ἤγειρα",
@@ -3040,11 +3044,12 @@
        ]
       },
       {
-       "label": "I judged",
-       "cells": [
+       "greek": "κρίνω",
+       "audio": "chapt_15_o_krip",
+       "gloss": "(I judged)",
+       "parts": [
         {
-         "greek": "κρίνω",
-         "audio": "chapt_15_o_krip"
+         "text": "—"
         },
         {
          "greek": "ἔκρινα",
@@ -3053,11 +3058,12 @@
        ]
       },
       {
-       "label": "I loosed",
-       "cells": [
+       "greek": "λύω",
+       "audio": "chapt_15_o_luwp",
+       "gloss": "(I loosed)",
+       "parts": [
         {
-         "greek": "λύω",
-         "audio": "chapt_15_o_luwp"
+         "text": "—"
         },
         {
          "greek": "ἔλυσα",
@@ -3066,11 +3072,12 @@
        ]
       },
       {
-       "label": "I remained",
-       "cells": [
+       "greek": "μένω",
+       "audio": "chapt_15_o_menp",
+       "gloss": "(I remained)",
+       "parts": [
         {
-         "greek": "μένω",
-         "audio": "chapt_15_o_menp"
+         "text": "—"
         },
         {
          "greek": "ἔμεινα",
@@ -3079,11 +3086,12 @@
        ]
       },
       {
-       "label": "I saved",
-       "cells": [
+       "greek": "σῴζω",
+       "audio": "chapt_15_o_swzp",
+       "gloss": "(I saved)",
+       "parts": [
         {
-         "greek": "σῴζω",
-         "audio": "chapt_15_o_swzp"
+         "text": "—"
         },
         {
          "greek": "ἔσωσα",
@@ -3094,7 +3102,7 @@
      ]
     }
    ],
-   "_note": "The Forms Drill hint (0xaf4ac) prints the whole verb list as a two-column present/aorist table."
+   "_note": "5I-SPEC2 4.7 (VERIFY-5I I-3): this hint shipped as a two-column paradigm with the English gloss as the ROW LABEL, so the gloss printed FIRST. The original prints the pair with the gloss LAST, and this chapter's own Learn topic 6 already does. Reshaped to that same stemList block -- present, dash, aorist, gloss -- with both Greek forms tapping their own clips. Chapter 14's secondAoristForms is reshaped identically in the same round. The Forms Drill hint (0xaf4ac) prints the whole verb list as a two-column present/aorist table."
   },
   "aoristVsImperfect": {
    "charts": [
@@ -3324,7 +3332,241 @@
     }
    ],
    "switch": "moreBack",
-   "_note": "DISCLOSURE 4.7, transcribed from the Translation Drill's OWN hint screens rather than assumed to be the Parsing Drill's: fields 0x11703e (Aorist Active + Aorist Middle) and 0x118df2 (Imperfect Active + Imperfect Middle/Passive). FOUR charts, so 4.2 Back/More as a centred pair -- the point of the hint is the AORIST-versus-IMPERFECT contrast while translating, which the Parsing Drill's hint does not show. The imperfect clips are chapter 12's, duplicated into this pack by the ISO."
+   "_note": "DISCLOSURE 4.7, transcribed from the Translation Drill's OWN hint screens rather than assumed to be the Parsing Drill's: fields 0x11703e (Aorist Active + Aorist Middle) and 0x118df2 (Imperfect Active + Imperfect Middle/Passive). FOUR charts, so 4.2 Back/More as a centred pair -- the point of the hint is the AORIST-versus-IMPERFECT contrast while translating, which the Parsing Drill's hint does not show. The imperfect clips are chapter 12's, duplicated into this pack by the ISO. RETIRED AS A TARGET at 5I-SPEC2 5.4: nothing references aoristVsImperfect once the per-item tables land. The four-chart bundle was the 5I reading of a hint that the TBK shows is CONDITIONAL, never a four-page stack; it is kept here as extraction provenance only."
+  },
+  "aoristPair": {
+   "charts": [
+    {
+     "type": "paradigm",
+     "id": "hintTdAoristActive",
+     "title": "Aorist Active of λύω",
+     "columns": [
+      "Singular",
+      "Plural"
+     ],
+     "rows": [
+      {
+       "label": "1",
+       "cells": [
+        {
+         "greek": "ἔλυσα",
+         "gloss": "I loosed",
+         "audio": "chapt_15_o_luwa1s"
+        },
+        {
+         "greek": "ἐλύσαμεν",
+         "gloss": "We loosed",
+         "audio": "chapt_15_o_luwa1p"
+        }
+       ]
+      },
+      {
+       "label": "2",
+       "cells": [
+        {
+         "greek": "ἔλυσας",
+         "gloss": "You loosed",
+         "audio": "chapt_15_o_luwa2s"
+        },
+        {
+         "greek": "ἐλύσατε",
+         "gloss": "You loosed",
+         "audio": "chapt_15_o_luwa2p"
+        }
+       ]
+      },
+      {
+       "label": "3",
+       "cells": [
+        {
+         "greek": "ἔλυσε(ν)",
+         "gloss": "He/she/it loosed",
+         "audio": "chapt_15_o_luwa3s"
+        },
+        {
+         "greek": "ἔλυσαν",
+         "gloss": "They loosed",
+         "audio": "chapt_15_o_luwa3p"
+        }
+       ]
+      }
+     ]
+    },
+    {
+     "type": "paradigm",
+     "id": "hintTdAoristMiddle",
+     "title": "Aorist Middle of λύω",
+     "columns": [
+      "Singular",
+      "Plural"
+     ],
+     "rows": [
+      {
+       "label": "1",
+       "cells": [
+        {
+         "greek": "ἐλυσάμην",
+         "gloss": "I loosed\n(for myself)",
+         "audio": "chapt_15_o_luwm1s"
+        },
+        {
+         "greek": "ἐλυσάμεθα",
+         "gloss": "We loosed\n(for ourselves)",
+         "audio": "chapt_15_o_luwm1p"
+        }
+       ]
+      },
+      {
+       "label": "2",
+       "cells": [
+        {
+         "greek": "ἐλύσω",
+         "gloss": "You loosed\n(for yourself)",
+         "audio": "chapt_15_o_luwm2s"
+        },
+        {
+         "greek": "ἐλύσασθε",
+         "gloss": "You loosed\n(for yourselves)",
+         "audio": "chapt_15_o_luwm2p"
+        }
+       ]
+      },
+      {
+       "label": "3",
+       "cells": [
+        {
+         "greek": "ἐλύσατο",
+         "gloss": "He/she/it loosed\n(for himself/herself/itself)",
+         "audio": "chapt_15_o_luwm3s"
+        },
+        {
+         "greek": "ἐλύσαντο",
+         "gloss": "They loosed\n(for themselves)",
+         "audio": "chapt_15_o_luwm3p"
+        }
+       ]
+      }
+     ]
+    }
+   ],
+   "_note": "5I-SPEC2 5.4/5.5, read from 15_1AOR.TBK 0x116f1e: the Translation Drill's Hint handler is conditional -- \"when it = 1 or it = 11 show Hint2, else show Hint1\". This is Hint1, the AORIST pair, and 27 of the 29 items open it."
+  },
+  "imperfectPair": {
+   "charts": [
+    {
+     "type": "paradigm",
+     "id": "hintTdImperfectActive",
+     "title": "Imperfect Active Indicative of λύω",
+     "columns": [
+      "Singular",
+      "Plural"
+     ],
+     "rows": [
+      {
+       "label": "1",
+       "cells": [
+        {
+         "greek": "ἔλυον",
+         "gloss": "I was loosing",
+         "audio": "chapt_15_l_as1"
+        },
+        {
+         "greek": "ἐλύομεν",
+         "gloss": "We were loosing",
+         "audio": "chapt_15_l_ap1"
+        }
+       ]
+      },
+      {
+       "label": "2",
+       "cells": [
+        {
+         "greek": "ἔλυες",
+         "gloss": "You were loosing",
+         "audio": "chapt_15_l_as2"
+        },
+        {
+         "greek": "ἐλύετε",
+         "gloss": "You were loosing",
+         "audio": "chapt_15_l_ap2"
+        }
+       ]
+      },
+      {
+       "label": "3",
+       "cells": [
+        {
+         "greek": "ἔλυε(ν)",
+         "gloss": "He/she/it was loosing",
+         "audio": "chapt_15_l_as3"
+        },
+        {
+         "greek": "ἔλυον",
+         "gloss": "They were loosing",
+         "audio": "chapt_15_l_ap3"
+        }
+       ]
+      }
+     ]
+    },
+    {
+     "type": "paradigm",
+     "id": "hintTdImperfectMiddlePassive",
+     "title": "Imperfect Middle/Passive Indicative of λύω",
+     "columns": [
+      "Singular",
+      "Plural"
+     ],
+     "rows": [
+      {
+       "label": "1",
+       "cells": [
+        {
+         "greek": "ἐλυόμην",
+         "gloss": "I was being loosed",
+         "audio": "chapt_15_l_ms1"
+        },
+        {
+         "greek": "ἐλυόμεθα",
+         "gloss": "We were being loosed",
+         "audio": "chapt_15_l_mp1"
+        }
+       ]
+      },
+      {
+       "label": "2",
+       "cells": [
+        {
+         "greek": "ἐλύου",
+         "gloss": "You were being loosed",
+         "audio": "chapt_15_l_ms2"
+        },
+        {
+         "greek": "ἐλύεσθε",
+         "gloss": "You were being loosed",
+         "audio": "chapt_15_l_mp2"
+        }
+       ]
+      },
+      {
+       "label": "3",
+       "cells": [
+        {
+         "greek": "ἐλύετο",
+         "gloss": "He/she/it was being loosed",
+         "audio": "chapt_15_l_ms3"
+        },
+        {
+         "greek": "ἐλύοντο",
+         "gloss": "They were being loosed",
+         "audio": "chapt_15_l_mp3"
+        }
+       ]
+      }
+     ]
+    }
+   ],
+   "_note": "5I-SPEC2 5.4/5.5, read from 15_1AOR.TBK 0x116f1e: Hint2, the IMPERFECT pair, shown on items 1 (Mar 4:2) and 11 (Luk 4:15) and on no others. Note for the record: item 6 (Mar 2:13) is an all-imperfect verse and item 7 (Mar 12:6) is mixed, yet the original shows the AORIST charts for both. Transcribed, not \"fixed\"."
   }
  }
 }
\ No newline at end of file
diff --git a/src/data/chapt-16.json b/src/data/chapt-16.json
index 986e4fc..bb63860 100644
--- a/src/data/chapt-16.json
+++ b/src/data/chapt-16.json
@@ -163,13 +163,16 @@
        "lines": [
         {
          "text": "ἐ + λυ + θη + ν = ἐλύθην",
-         "audio": "chapt_16_p_luw1s",
-         "tapUnit": true
+         "greekTap": {
+          "word": "ἐλύθην",
+          "audio": "chapt_16_p_luw1s"
+         }
         },
         {
          "text": "Aug   Stem   Pass   Ending   (I was loosed)"
         }
-       ]
+       ],
+       "_note": "5G-SPEC3 tap-boundary canon (5I-SPEC2 4.3): in a worked example only the RESULTING Greek form is the tap; tapUnit is for a pure morpheme equation with no printed result. The morphemes building the form stay ink."
       },
       {
        "type": "para",
@@ -183,14 +186,17 @@
        "lines": [
         {
          "text": "λυ + θησ + ν = λυθήσομαι",
-         "audio": "chapt_16_p_luwf1s",
-         "tapUnit": true
+         "greekTap": {
+          "word": "λυθήσομαι",
+          "audio": "chapt_16_p_luwf1s"
+         }
         },
         {
          "text": "Stem   Pass   Ending   (I will be loosed)"
         }
        ],
-       "_verify_note": "The original prints \"lu + qhs + n = luqh<somai\" -- the ending shown is nu although the form ends -omai. Carried VERBATIM; an original slip, not a conversion error. VERIFY."
+       "_verify_note": "The original prints \"lu + qhs + n = luqh<somai\" -- the ending shown is nu although the form ends -omai. Carried VERBATIM; an original slip, not a conversion error. VERIFY.",
+       "_note": "5G-SPEC3 tap-boundary canon (5I-SPEC2 4.3): in a worked example only the RESULTING Greek form is the tap; tapUnit is for a pure morpheme equation with no printed result. The morphemes building the form stay ink."
       }
      ]
     },
@@ -214,7 +220,10 @@
            "text": "κ and γ  become  χ"
           }
          ],
-         "note": "διωκ + θη = ἐδιώχθην"
+         "note": "διωκ + θη = ἐδιώχθην",
+         "noteAudioMap": {
+          "ἐδιώχθην": "chapt_16_p_diwa"
+         }
         },
         {
          "label": "Labials:",
@@ -223,7 +232,10 @@
            "text": "π and β  become  φ"
           }
          ],
-         "note": "λείπ + θη = ἐλείφθην"
+         "note": "λείπ + θη = ἐλείφθην",
+         "noteAudioMap": {
+          "ἐλείφθην": "chapt_16_p_leia"
+         }
         },
         {
          "label": null,
@@ -232,25 +244,11 @@
            "text": "φ causes the θ to drop out"
           }
          ],
-         "note": "γραφ + θη = ἐγράφην"
-        }
-       ]
-      }
-     ],
-     "audioMap": {
-      "ἐδιώχθην": "chapt_16_p_diwa",
-      "ἐλείφθην": "chapt_16_p_leia",
-      "ἐγράφην": "chapt_16_p_graa"
-     }
-    },
-    {
-     "id": "consonantShifts",
-     "title": "Consonant Shifts",
-     "content": [
-      {
-       "type": "greekRows",
-       "layout": "endingTransformation",
-       "rows": [
+         "note": "γραφ + θη = ἐγράφην",
+         "noteAudioMap": {
+          "ἐγράφην": "chapt_16_p_graa"
+         }
+        },
         {
          "label": "Dentals:",
          "parts": [
@@ -258,7 +256,10 @@
            "text": "τ, δ, and θ  become  σ"
           }
          ],
-         "note": "πειθ + θη = ἐπείσθην"
+         "note": "πειθ + θη = ἐπείσθην",
+         "noteAudioMap": {
+          "ἐπείσθην": "chapt_16_p_peia"
+         }
         },
         {
          "label": "Sibilants:",
@@ -267,9 +268,13 @@
            "text": "ζ, ξ, and ψ  become  σ"
           }
          ],
-         "note": "δοξαζ + θη = ἐδοξάσθην"
+         "note": "δοξαζ + θη = ἐδοξάσθην",
+         "noteAudioMap": {
+          "ἐδοξάσθην": "chapt_16_p_doca"
+         }
         }
-       ]
+       ],
+       "_tap_note": "5I-SPEC2 4.3 / 5G-SPEC3 tap boundary: the worked example under each rule prints a RESULT, so the result form alone taps and the construction morphemes (\"diwk + qh =\") stay ink. noteAudioMap is the shape chapter 15's copy of this block already uses; no contract is added. For the record, the ORIGINAL page has buttons on eleifqhn and egrafhn only and the Consonant Shifts screen has none; all five tap in the port under the standing all-Greek-taps rule because all five clips exist. egrafhn plays p_graa, the page's own dispatch, not the gamma-rho-alpha-phi-omega paradigm cell."
       },
       {
        "type": "greekRows",
@@ -312,10 +317,13 @@
       }
      ],
      "audioMap": {
+      "ἐδιώχθην": "chapt_16_p_diwa",
+      "ἐλείφθην": "chapt_16_p_leia",
+      "ἐγράφην": "chapt_16_p_graa",
       "ἐπείσθην": "chapt_16_p_peia",
       "ἐδοξάσθην": "chapt_16_p_doca"
      },
-     "_disclosure": "C6: \"Consonant Shifts\" carries its OWN header in the original, so it is a distinct topic rather than a continuation of Ending Transformations (2.7 header test)."
+     "_disclosure": "D-61 (5I-SPEC2 4.4, VERIFY-5I-RESPONSE item 7): \"Consonant Shifts\" was a topic of its own under the 2.7 header test, because the original's second screen carries that header. Nathanael ruled on 2026-08-30 that the header does not belong there at all -- both screens show ending transformations and the second is a continuation of the first -- so the two are ONE topic with ONE five-row chart (Palatals, Labials, the phi row, Dentals, Sibilants) and the shiftSummary block beneath it. The header is dropped, which is the divergence D-61 records."
     },
     {
      "id": "firstAoristPassive",
@@ -529,9 +537,10 @@
      ],
      "audioMap": {
       "ἀπεκρίθην": "chapt_16_p_apea",
+      "ἐγενόμην": "chapt_16_p_ginm",
       "ἐγενήθην": "chapt_16_p_gina"
      },
-     "_audio_note": "egenomen is the ch14 second aorist middle and has no clip in this pack; only the two forms the chapter itself records are tapped."
+     "_audio_note": "TBK-CONFIRMED (5I-SPEC2 4.6): this page dispatches apea, apea, ginm, gina at 16_FAPAS.TBK 0x21828-0x21ab6, and ch16railwalk shows the hand cursor over egenomhn. The earlier note here was wrong: p_ginm ships in CHAPT_16 and is the aorist middle this page prints. egenomhn was the only Greek word on the page that did not tap; it does now. (The second apea dispatch is the repeat of apekriqhn later in the paragraph, which splitTaps already covers -- every standalone occurrence of a mapped form taps.)"
     },
     {
      "id": "passiveStems",
@@ -539,7 +548,7 @@
      "content": [
       {
        "type": "paradigm",
-       "id": "learnPassiveStems1",
+       "id": "learnPassiveStems",
        "title": "Passive Stems",
        "columns": [
         "Present Active",
@@ -661,20 +670,7 @@
            "audio": "chapt_16_p_egef"
           }
          ]
-        }
-       ],
-       "_note": "Eight of the fifteen verbs have NO future passive in the original and print \"--\"; emitted as an em dash (D2) with no tap."
-      },
-      {
-       "type": "paradigm",
-       "id": "learnPassiveStems2",
-       "title": "Passive Stems",
-       "columns": [
-        "Present Active",
-        "Aorist Passive",
-        "Future Passive"
-       ],
-       "rows": [
+        },
         {
          "label": null,
          "cells": [
@@ -807,10 +803,10 @@
          ]
         }
        ],
-       "_note": "Eight of the fifteen verbs have NO future passive in the original and print \"--\"; emitted as an em dash (D2) with no tap."
+       "_note": "Eight of the fifteen verbs have NO future passive in the original and print \"--\"; emitted as an em dash (D2) with no tap. 5I-SPEC2 4.5 (VERIFY-5I-RESPONSE item 11): the original's seven-and-eight split is a page break in a fixed-size window, not two charts -- there is no split audio and no second heading worth printing -- so the fifteen rows are ONE list under ONE header row here."
       }
      ],
-     "_disclosure": "C5 (NIT-LOG N-6 standing method): the original pages the stem table seven-and-eight behind More/Back; STACKED here in the original's own split. Neither half carries a say-all recording, so no button is drawn."
+     "_disclosure": "C5 (5I-SPEC2 4.5): the original pages the stem table seven-and-eight behind More/Back. That is its window's page break, not a structure -- both halves carry the same \"Passive Stems\" heading and the same three columns, and neither half has a say-all recording -- so the port prints ONE fifteen-row list under ONE header. This supersedes the 5I reading, which reproduced the split as two stacked charts."
     }
    ],
    "greekTaps": true
@@ -932,7 +928,7 @@
       "Third Plural"
      ],
      "audio": "chapt_16_p_luwf3p",
-     "hintRef": "passiveParadigms"
+     "hintRef": "luwPassivePair"
     },
     {
      "greek": "ἐλύθην",
@@ -942,7 +938,7 @@
       "First Singular"
      ],
      "audio": "chapt_16_p_luw1s",
-     "hintRef": "passiveParadigms"
+     "hintRef": "luwPassivePair"
     },
     {
      "greek": "ἐλύθητε",
@@ -952,7 +948,7 @@
       "Second Plural"
      ],
      "audio": "chapt_16_p_luw2p",
-     "hintRef": "passiveParadigms"
+     "hintRef": "luwPassivePair"
     },
     {
      "greek": "λυθήσῃ",
@@ -962,7 +958,7 @@
       "Second Singular"
      ],
      "audio": "chapt_16_p_luwf2s",
-     "hintRef": "passiveParadigms"
+     "hintRef": "luwPassivePair"
     },
     {
      "greek": "ἐγράφημεν",
@@ -972,7 +968,7 @@
       "First Plural"
      ],
      "audio": "chapt_16_p_gra1p",
-     "hintRef": "passiveParadigms"
+     "hintRef": "graphoPassive"
     },
     {
      "greek": "ἐγράφης",
@@ -982,7 +978,7 @@
       "Second Singular"
      ],
      "audio": "chapt_16_p_gra2s",
-     "hintRef": "passiveParadigms"
+     "hintRef": "graphoPassive"
     },
     {
      "greek": "λυθήσομαι",
@@ -992,7 +988,7 @@
       "First Singular"
      ],
      "audio": "chapt_16_p_luwf1s",
-     "hintRef": "passiveParadigms"
+     "hintRef": "luwPassivePair"
     },
     {
      "greek": "ἐλύθησαν",
@@ -1002,7 +998,7 @@
       "Third Plural"
      ],
      "audio": "chapt_16_p_luw3p",
-     "hintRef": "passiveParadigms"
+     "hintRef": "luwPassivePair"
     },
     {
      "greek": "ἐγράφη",
@@ -1012,7 +1008,7 @@
       "Third Singular"
      ],
      "audio": "chapt_16_p_gra3s",
-     "hintRef": "passiveParadigms"
+     "hintRef": "graphoPassive"
     },
     {
      "greek": "ἐλύθης",
@@ -1022,7 +1018,7 @@
       "Second Singular"
      ],
      "audio": "chapt_16_p_luw2s",
-     "hintRef": "passiveParadigms"
+     "hintRef": "luwPassivePair"
     },
     {
      "greek": "λυθησόμεθα",
@@ -1032,7 +1028,7 @@
       "First Plural"
      ],
      "audio": "chapt_16_p_luwf1p",
-     "hintRef": "passiveParadigms"
+     "hintRef": "luwPassivePair"
     },
     {
      "greek": "ἐγράφητε",
@@ -1042,7 +1038,7 @@
       "Second Plural"
      ],
      "audio": "chapt_16_p_gra2p",
-     "hintRef": "passiveParadigms"
+     "hintRef": "graphoPassive"
     },
     {
      "greek": "ἐλύθημεν",
@@ -1052,7 +1048,7 @@
       "First Plural"
      ],
      "audio": "chapt_16_p_luw1p",
-     "hintRef": "passiveParadigms"
+     "hintRef": "luwPassivePair"
     },
     {
      "greek": "ἐλύθη",
@@ -1062,7 +1058,7 @@
       "Third Singular"
      ],
      "audio": "chapt_16_p_luw3s",
-     "hintRef": "passiveParadigms"
+     "hintRef": "luwPassivePair"
     },
     {
      "greek": "λυθήσεσθε",
@@ -1072,7 +1068,7 @@
       "Second Plural"
      ],
      "audio": "chapt_16_p_luwf2p",
-     "hintRef": "passiveParadigms"
+     "hintRef": "luwPassivePair"
     },
     {
      "greek": "λυθήσεται",
@@ -1082,7 +1078,7 @@
       "Third Singular"
      ],
      "audio": "chapt_16_p_luwf3s",
-     "hintRef": "passiveParadigms"
+     "hintRef": "luwPassivePair"
     },
     {
      "greek": "ἐγράφην",
@@ -1092,7 +1088,7 @@
       "First Singular"
      ],
      "audio": "chapt_16_p_gra1s",
-     "hintRef": "passiveParadigms"
+     "hintRef": "graphoPassive"
     },
     {
      "greek": "ἐγράφησαν",
@@ -1102,7 +1098,7 @@
       "Third Plural"
      ],
      "audio": "chapt_16_p_gra3p",
-     "hintRef": "passiveParadigms"
+     "hintRef": "graphoPassive"
     }
    ],
    "scored": true,
@@ -1122,14 +1118,15 @@
      "pronounceEach": true
     },
     "liveScore": true,
-    "hintRef": "passiveParadigms"
+    "hintRef": "luwPassivePair"
    },
    "_stage_note": "Eighteen items (0xfa356). Stage one is TENSE (Aorist | Future), NOT voice -- the only parsing drill in the project with that axis, because the whole chapter is one voice. Every item has exactly ONE accepted cell and the assembler fails if a key names two. Each dispatched clip is asserted to be the prompt form's own paradigm cell.",
    "audioTiming": "beforeGuess",
    "answerPolicy": {
     "advanceClass": "manualOnIncorrect",
     "attemptsPerItem": 1
-   }
+   },
+   "_hint_note": "5I-SPEC2 5.2, read from 16_FAPAS.TBK 0xb5e30 (D-46 class): the Hint button runs \"when it = 5 or 6 or 9 -> Hint2; when it = 12 or 17 or 18 -> Hint2; else Hint1\". Hint1 is the luw pair (first aorist passive + future passive), Hint2 the single grapho chart (second aorist passive). The six Hint2 items are exactly the six grapho forms in the pool, which is the read agreeing with the linguistics rather than being derived from it."
   },
   {
    "id": "c16_drill_forms",
@@ -1478,7 +1475,7 @@
      ],
      "answer": "Are you the prophet? and he answered, \"No\"",
      "audio": "chapt_16_p_td1",
-     "hintRef": "passiveParadigms"
+     "hintRef": "luwPassivePair"
     },
     {
      "greek": "Ἀπεκρίθησαν καὶ εἶπαν αὐτῷ, Ὁ πατὴρ ἡμῶν",
@@ -1490,7 +1487,7 @@
      ],
      "answer": "they answered and said to him, \"Our father is Abraham\"",
      "audio": "chapt_16_p_td2",
-     "hintRef": "passiveParadigms",
+     "hintRef": "luwPassivePair",
      "greek2": "Ἀβραάμ ἐστιν"
     },
     {
@@ -1503,7 +1500,7 @@
      ],
      "answer": "And I answered, \"Who are you Lord?\" and he said to me, \"I am Jesus\"",
      "audio": "chapt_16_p_td3",
-     "hintRef": "passiveParadigms",
+     "hintRef": "luwPassivePair",
      "greek2": "με, Ἐγώ εἰμι Ἰησοῦς"
     },
     {
@@ -1516,7 +1513,7 @@
      ],
      "answer": "and when the dragon saw that he was cast to the earth",
      "audio": "chapt_16_p_td4",
-     "hintRef": "passiveParadigms"
+     "hintRef": "luwPassivePair"
     },
     {
      "greek": "καὶ οἱ ἄγγελοι αὐτοῦ μετ' αὐτοῦ ἐβλήθησαν",
@@ -1528,7 +1525,7 @@
      ],
      "answer": "and his angels were cast down with him",
      "audio": "chapt_16_p_td5",
-     "hintRef": "passiveParadigms"
+     "hintRef": "luwPassivePair"
     },
     {
      "greek": "καὶ εἴ τις οὐχ εὑρέθη ἐν τῇ βίβλῳ τῆς ζωῆς",
@@ -1540,7 +1537,7 @@
      ],
      "answer": "and if anyone was not found in the book of life",
      "audio": "chapt_16_p_td6",
-     "hintRef": "passiveParadigms"
+     "hintRef": "luwPassivePair"
     },
     {
      "greek": "ἀπεκρίθη Ἰησοῦς καὶ εἶπεν αὐτοῖς, Λύσατε τὸν",
@@ -1552,7 +1549,7 @@
      ],
      "answer": "Jesus answered and said to them, \"Destroy this temple and I will raise it\"",
      "audio": "chapt_16_p_td7",
-     "hintRef": "passiveParadigms",
+     "hintRef": "luwPassivePair",
      "greek2": "ναὸν τοῦτον καὶ ... ἐγερῶ αὐτόν"
     },
     {
@@ -1565,7 +1562,7 @@
      ],
      "answer": "Jesus answered and said to him, \"Truly, truly, I say to you\"",
      "audio": "chapt_16_p_td8",
-     "hintRef": "passiveParadigms",
+     "hintRef": "luwPassivePair",
      "greek2": "λέγω σοι"
     },
     {
@@ -1578,7 +1575,7 @@
      ],
      "answer": "he said, \"I was not sent except to the lost sheep of the house of Israel\"",
      "audio": "chapt_16_p_td9",
-     "hintRef": "passiveParadigms",
+     "hintRef": "luwPassivePair",
      "greek2": "ἀπολωλότα οἴκου Ἰσραήλ"
     },
     {
@@ -1591,7 +1588,7 @@
      ],
      "answer": "This is John the Baptist; he was raised from the dead",
      "audio": "chapt_16_p_td10",
-     "hintRef": "passiveParadigms",
+     "hintRef": "luwPassivePair",
      "greek2": "ἠγέρθη ἀπὸ τῶν νεκρῶν"
     },
     {
@@ -1604,7 +1601,7 @@
      ],
      "answer": "the woman answered and said to him, \"I do not have a husband\"",
      "audio": "chapt_16_p_td11",
-     "hintRef": "passiveParadigms"
+     "hintRef": "luwPassivePair"
     },
     {
      "greek": "καὶ ἀποκτενοῦσιν αὐτόν, καὶ τῇ τρίτῃ ἡμέρᾳ",
@@ -1616,7 +1613,7 @@
      ],
      "answer": "and they will kill him, and he will be raised on the third day",
      "audio": "chapt_16_p_td12",
-     "hintRef": "passiveParadigms",
+     "hintRef": "luwPassivePair",
      "greek2": "ἐγερθήσεται"
     },
     {
@@ -1629,7 +1626,7 @@
      ],
      "answer": "for nation will rise against nation and kingdom against kingdom",
      "audio": "chapt_16_p_td13",
-     "hintRef": "passiveParadigms",
+     "hintRef": "luwPassivePair",
      "greek2": "ἐπὶ βασιλείαν"
     },
     {
@@ -1642,7 +1639,7 @@
      ],
      "answer": "and many false prophets will arise and deceive many",
      "audio": "chapt_16_p_td14",
-     "hintRef": "passiveParadigms",
+     "hintRef": "luwPassivePair",
      "greek2": "πλανήσουσιν πολλούς"
     },
     {
@@ -1655,7 +1652,7 @@
      ],
      "answer": "nor was a place found for them any longer in heaven",
      "audio": "chapt_16_p_td15",
-     "hintRef": "passiveParadigms"
+     "hintRef": "luwPassivePair"
     },
     {
      "greek": "Οἱ δὲ ἕνδεκα μαθηταὶ ἐπορεύθησαν εἰς τὴν",
@@ -1667,7 +1664,7 @@
      ],
      "answer": "But the eleven disciples went into Galilee",
      "audio": "chapt_16_p_td16",
-     "hintRef": "passiveParadigms",
+     "hintRef": "luwPassivePair",
      "greek2": "Γαλιλαίαν"
     },
     {
@@ -1680,7 +1677,7 @@
      ],
      "answer": "and they were not able to heal him",
      "audio": "chapt_16_p_td17",
-     "hintRef": "passiveParadigms"
+     "hintRef": "luwPassivePair"
     },
     {
      "greek": "ἀπεκρίθη ὁ Ἰησοῦς καὶ εἶπεν αὐτοῖς, Τοῦτό ἐστιν",
@@ -1692,7 +1689,7 @@
      ],
      "answer": "Jesus answered and said to them, \"This is the work of God\"",
      "audio": "chapt_16_p_td18",
-     "hintRef": "passiveParadigms",
+     "hintRef": "luwPassivePair",
      "greek2": "τὸ ἔργον τοῦ θεοῦ"
     },
     {
@@ -1705,7 +1702,7 @@
      ],
      "answer": "and we see that they were not able to enter because of unbelief",
      "audio": "chapt_16_p_td19",
-     "hintRef": "passiveParadigms",
+     "hintRef": "luwPassivePair",
      "greek2": "δι' ἀπιστίαν"
     },
     {
@@ -1718,7 +1715,7 @@
      ],
      "answer": "nor was I taught but through a revelation of Jesus Christ",
      "audio": "chapt_16_p_td20",
-     "hintRef": "passiveParadigms",
+     "hintRef": "luwPassivePair",
      "greek2": "Χριστοῦ"
     },
     {
@@ -1731,7 +1728,7 @@
      ],
      "answer": "who became wisdom from God to us",
      "audio": "chapt_16_p_td21",
-     "hintRef": "passiveParadigms"
+     "hintRef": "luwPassivePair"
     },
     {
      "greek": "οὗ ἐγενήθην διάκονος κατὰ τὴν δωρεὰν τῆς",
@@ -1743,7 +1740,7 @@
      ],
      "answer": "of which I became a minister according to the gift of God's grace",
      "audio": "chapt_16_p_td22",
-     "hintRef": "passiveParadigms",
+     "hintRef": "luwPassivePair",
      "greek2": "χάριτος τοῦ θεοῦ"
     },
     {
@@ -1756,7 +1753,7 @@
      ],
      "answer": "you (pl.) have come near by the blood of Christ",
      "audio": "chapt_16_p_td23",
-     "hintRef": "passiveParadigms"
+     "hintRef": "luwPassivePair"
     },
     {
      "greek": "Ἠκούσατε ὅτι ἐρρέθη, Ὀφθαλμὸν ἀντὶ ὀφθαλμοῦ",
@@ -1768,7 +1765,7 @@
      ],
      "answer": "You (pl.) have heard that it was said, \"Eye for an eye\"",
      "audio": "chapt_16_p_td24",
-     "hintRef": "passiveParadigms"
+     "hintRef": "luwPassivePair"
     },
     {
      "greek": "καὶ ἐκρίθησαν ἕκαστος κατὰ τὰ ἔργα αὐτῶν",
@@ -1780,7 +1777,7 @@
      ],
      "answer": "and they were judged, each according to their works",
      "audio": "chapt_16_p_td25",
-     "hintRef": "passiveParadigms"
+     "hintRef": "luwPassivePair"
     },
     {
      "greek": "καὶ ἐσώθη ἡ γυνὴ ἀπὸ τῆς ὥρας ἐκείνης",
@@ -1792,7 +1789,7 @@
      ],
      "answer": "and the woman was made well from that hour",
      "audio": "chapt_16_p_td26",
-     "hintRef": "passiveParadigms"
+     "hintRef": "luwPassivePair"
     },
     {
      "greek": "Πᾶς γὰρ ὅς ἄν ἐπικαλέσηται τὸ ὄνομα κυρίου",
@@ -1804,7 +1801,7 @@
      ],
      "answer": "for anyone who calls on the name of the Lord will be saved",
      "audio": "chapt_16_p_td27",
-     "hintRef": "passiveParadigms",
+     "hintRef": "luwPassivePair",
      "greek2": "σωθήσεται"
     },
     {
@@ -1817,7 +1814,7 @@
      ],
      "answer": "Nathanael answered him, \"Rabbi, you are the son of God\"",
      "audio": "chapt_16_p_td28",
-     "hintRef": "passiveParadigms",
+     "hintRef": "luwPassivePair",
      "greek2": "τοῦ θεοῦ"
     }
    ],
@@ -1837,14 +1834,15 @@
      "pronounceEach": true
     },
     "liveScore": true,
-    "hintRef": "passiveParadigms"
+    "hintRef": "luwPassivePair"
    },
    "_answer_note": "Twenty-eight items (0x7bf9b); the A/B/C key script yields all 28 and agrees with the BLUE option on ch16railwalk.pdf p10-p17. The refs pool's last entry carries a stale tail (\"Jn 1:49  Cor 6:2\") cut at the screen's own value.",
    "audioTiming": "afterGuess",
    "answerPolicy": {
     "advanceClass": "manualOnIncorrect",
     "attemptsPerItem": 1
-   }
+   },
+   "_hint_note": "5I-SPEC2 5.3, read from 16_FAPAS.TBK 0xc08a7: this drill's Hint handler is UNCONDITIONAL -- a bare \"show Hint1\" -- and Hint1 (0xc1044-0xc11d1) holds the luw First Aorist Passive and Future Passive charts ONLY. The grapho chart does not belong on this drill at all. (VERIFY-5I-RESPONSE item 12 assumed this drill varied the way the Parsing Drill does; the TBK says it does not, and the spec wins.)"
   },
   {
    "id": "c16_drill_vocab_gk_en",
@@ -2784,7 +2782,7 @@
    "paradigms": [
     {
      "type": "paradigm",
-     "id": "qrStems1",
+     "id": "qrStems",
      "title": "Passive Stems",
      "columns": [
       "Present Active",
@@ -2906,20 +2904,7 @@
          "audio": "chapt_16_p_egef"
         }
        ]
-      }
-     ],
-     "_note": "Eight of the fifteen verbs have NO future passive in the original and print \"--\"; emitted as an em dash (D2) with no tap."
-    },
-    {
-     "type": "paradigm",
-     "id": "qrStems2",
-     "title": "Passive Stems",
-     "columns": [
-      "Present Active",
-      "Aorist Passive",
-      "Future Passive"
-     ],
-     "rows": [
+      },
       {
        "label": null,
        "cells": [
@@ -3052,10 +3037,10 @@
        ]
       }
      ],
-     "_note": "Eight of the fifteen verbs have NO future passive in the original and print \"--\"; emitted as an em dash (D2) with no tap."
+     "_note": "Eight of the fifteen verbs have NO future passive in the original and print \"--\"; emitted as an em dash (D2) with no tap. 5I-SPEC2 4.5 (VERIFY-5I-RESPONSE item 11): the original's seven-and-eight split is a page break in a fixed-size window, not two charts -- there is no split audio and no second heading worth printing -- so the fifteen rows are ONE list under ONE header row here."
     }
    ],
-   "_disclosure": "C9 + NIT-LOG N-6 standing method: the original pages the stem table seven-and-eight behind More/Back. STACKED here in the original's own split, no pager. Neither half carries a say-all recording, so no button is drawn."
+   "_disclosure": "C9 (5I-SPEC2 4.5): everything on one flowing scroll, no pager. The original's seven-and-eight page break is its window's, not the table's, so the fifteen rows are ONE list under ONE header. Neither half carries a say-all recording, so no button is drawn."
   },
   {
    "id": "c16_qr_scripture_mat69",
@@ -3520,13 +3505,13 @@
     }
    ],
    "switch": "moreBack",
-   "_note": "THREE charts -> DISCLOSURE 4.2: Back and More as a pair on their own centred line, both always visible, Back disabled on the first page and More on the last. Field 0xb9382 holds the first aorist AND the future on one hint screen; 0xbaa3e holds the second aorist on its own. Neither carries a say-all, so the pair is centred (4.5)."
+   "_note": "THREE charts -> DISCLOSURE 4.2: Back and More as a pair on their own centred line, both always visible, Back disabled on the first page and More on the last. Field 0xb9382 holds the first aorist AND the future on one hint screen; 0xbaa3e holds the second aorist on its own. Neither carries a say-all, so the pair is centred (4.5). RETIRED AS A TARGET at 5I-SPEC2 5.1: nothing references passiveParadigms once the per-item tables land. The three-chart bundle was the 5I reading of two hints that the TBK shows are a CONDITIONAL pair and a single chart; kept here as extraction provenance only."
   },
   "passiveStemsHint": {
    "charts": [
     {
      "type": "paradigm",
-     "id": "hintStems1",
+     "id": "hintStems",
      "title": "Passive Stems",
      "columns": [
       "Present Active",
@@ -3648,20 +3633,7 @@
          "audio": "chapt_16_p_egef"
         }
        ]
-      }
-     ],
-     "_note": "Eight of the fifteen verbs have NO future passive in the original and print \"--\"; emitted as an em dash (D2) with no tap."
-    },
-    {
-     "type": "paradigm",
-     "id": "hintStems2",
-     "title": "Passive Stems",
-     "columns": [
-      "Present Active",
-      "Aorist Passive",
-      "Future Passive"
-     ],
-     "rows": [
+      },
       {
        "label": null,
        "cells": [
@@ -3794,11 +3766,188 @@
        ]
       }
      ],
-     "_note": "Eight of the fifteen verbs have NO future passive in the original and print \"--\"; emitted as an em dash (D2) with no tap."
+     "_note": "Eight of the fifteen verbs have NO future passive in the original and print \"--\"; emitted as an em dash (D2) with no tap. 5I-SPEC2 4.5 (VERIFY-5I-RESPONSE item 11): the original's seven-and-eight split is a page break in a fixed-size window, not two charts -- there is no split audio and no second heading worth printing -- so the fifteen rows are ONE list under ONE header row here."
     }
    ],
-   "switch": "moreBack",
-   "_note": "The Form Drill hint prints the Passive Stems table in the original's own two halves."
+   "_note": "5I-SPEC2 4.5 / DISCLOSURE-RULES 4.9: the Form Drill hint is ONE long list, never two pages. A modal holding one list that is merely tall scrolls under a FROZEN header row (Present Active / Aorist Passive / Future Passive) rather than paging; multi-CHART bundles still page per 4.2. This is the first instance of that rule. The original prints the table in its own two halves at 0xaf4ac-class offsets; that is its window's page break."
+  },
+  "luwPassivePair": {
+   "charts": [
+    {
+     "type": "paradigm",
+     "id": "hintFirstAoristPassive",
+     "title": "First Aorist Passive Indicative of λύω",
+     "columns": [
+      "Singular",
+      "Plural"
+     ],
+     "rows": [
+      {
+       "label": "1",
+       "cells": [
+        {
+         "greek": "ἐλύθην",
+         "gloss": "I was loosed",
+         "audio": "chapt_16_p_luw1s"
+        },
+        {
+         "greek": "ἐλύθημεν",
+         "gloss": "We were loosed",
+         "audio": "chapt_16_p_luw1p"
+        }
+       ]
+      },
+      {
+       "label": "2",
+       "cells": [
+        {
+         "greek": "ἐλύθης",
+         "gloss": "You were loosed",
+         "audio": "chapt_16_p_luw2s"
+        },
+        {
+         "greek": "ἐλύθητε",
+         "gloss": "You were loosed",
+         "audio": "chapt_16_p_luw2p"
+        }
+       ]
+      },
+      {
+       "label": "3",
+       "cells": [
+        {
+         "greek": "ἐλύθη",
+         "gloss": "He/she/it was loosed",
+         "audio": "chapt_16_p_luw3s"
+        },
+        {
+         "greek": "ἐλύθησαν",
+         "gloss": "They were loosed",
+         "audio": "chapt_16_p_luw3p"
+        }
+       ]
+      }
+     ]
+    },
+    {
+     "type": "paradigm",
+     "id": "hintFuturePassive",
+     "title": "Future Passive Indicative of λύω",
+     "columns": [
+      "Singular",
+      "Plural"
+     ],
+     "rows": [
+      {
+       "label": "1",
+       "cells": [
+        {
+         "greek": "λυθήσομαι",
+         "gloss": "I will be loosed",
+         "audio": "chapt_16_p_luwf1s"
+        },
+        {
+         "greek": "λυθησόμεθα",
+         "gloss": "We will be loosed",
+         "audio": "chapt_16_p_luwf1p"
+        }
+       ]
+      },
+      {
+       "label": "2",
+       "cells": [
+        {
+         "greek": "λυθήσῃ",
+         "gloss": "You will be loosed",
+         "audio": "chapt_16_p_luwf2s"
+        },
+        {
+         "greek": "λυθήσεσθε",
+         "gloss": "You will be loosed",
+         "audio": "chapt_16_p_luwf2p"
+        }
+       ]
+      },
+      {
+       "label": "3",
+       "cells": [
+        {
+         "greek": "λυθήσεται",
+         "gloss": "He/she/it will be loosed",
+         "audio": "chapt_16_p_luwf3s"
+        },
+        {
+         "greek": "λυθήσονται",
+         "gloss": "They will be loosed",
+         "audio": "chapt_16_p_luwf3p"
+        }
+       ]
+      }
+     ]
+    }
+   ],
+   "_note": "5I-SPEC2 5.1/5.2/5.3, read from 16_FAPAS.TBK: Hint1 of the Parsing Drill (0xb5e30) and the ONLY hint of the Translation Drill (0xc08a7, whose Hint1 at 0xc1044-0xc11d1 holds exactly these two charts). Two charts, so DISCLOSURE-RULES 4.1: one alternating toggle, labelled More/Back because \"First Aorist Passive Indicative of luw\" and \"Future Passive Indicative of luw\" have no one-word contrast between them."
+  },
+  "graphoPassive": {
+   "charts": [
+    {
+     "type": "paradigm",
+     "id": "hintSecondAoristPassive",
+     "title": "Second Aorist Passive Indicative of γράφω",
+     "columns": [
+      "Singular",
+      "Plural"
+     ],
+     "rows": [
+      {
+       "label": "1",
+       "cells": [
+        {
+         "greek": "ἐγράφην",
+         "gloss": "I was written",
+         "audio": "chapt_16_p_gra1s"
+        },
+        {
+         "greek": "ἐγράφημεν",
+         "gloss": "We were written",
+         "audio": "chapt_16_p_gra1p"
+        }
+       ]
+      },
+      {
+       "label": "2",
+       "cells": [
+        {
+         "greek": "ἐγράφης",
+         "gloss": "You were written",
+         "audio": "chapt_16_p_gra2s"
+        },
+        {
+         "greek": "ἐγράφητε",
+         "gloss": "You were written",
+         "audio": "chapt_16_p_gra2p"
+        }
+       ]
+      },
+      {
+       "label": "3",
+       "cells": [
+        {
+         "greek": "ἐγράφη",
+         "gloss": "He/she/it was written",
+         "audio": "chapt_16_p_gra3s"
+        },
+        {
+         "greek": "ἐγράφησαν",
+         "gloss": "They were written",
+         "audio": "chapt_16_p_gra3p"
+        }
+       ]
+      }
+     ]
+    }
+   ],
+   "_note": "5I-SPEC2 5.1/5.2, read from 16_FAPAS.TBK 0xb5e30: Hint2 of the Parsing Drill -- \"when it = 5 or 6 or 9 -> Hint2; when it = 12 or 17 or 18 -> Hint2; else Hint1\". One chart, so the modal shows it with no paging at all."
   }
  }
 }
\ No newline at end of file
diff --git a/src/lib/viewport.js b/src/lib/viewport.js
index 6ee2324..2c5243f 100644
--- a/src/lib/viewport.js
+++ b/src/lib/viewport.js
@@ -78,10 +78,78 @@
 // circumstantial fit; the bug is intermittent and device-bound, so what is
 // verified here is that the triggers fire and that the clamp rejects a phantom
 // height. It stays a VERIFY device-soak item.
+
+// ===========================================================================
+// 5I-SPEC2 §3.2 — THE SCREENSHOT PATH. DO NOT TRIM THIS BLOCK.
+//
+// The half-screen modal came back in cohort 5I. It is NOT a code revert: this
+// file is byte-identical to 6a4369c and the round's app.css changes are
+// typography only. What came back is a TRIGGER the clamp above never covered,
+// and Nathanael's report names it exactly: the modal regresses AFTER TAKING A
+// SCREENSHOT — with no modal open, on a page that has no modal at all. On iOS a
+// screenshot can background and foreground a standalone PWA, which is the
+// resume path this file already exists to survive.
+//
+// WHY THE W4.2 CLAMP LET IT THROUGH. That clamp compares the visual viewport
+// against `window.innerHeight` and calls the reading a phantom when it is much
+// smaller. Its premise — stated in the comment above — is that the software
+// keyboard does not shrink `innerHeight` on iOS. That holds in Safari's tab UI
+// and does NOT hold in a standalone home-screen PWA, which is the only way this
+// app is used: there the layout viewport is resized with the keyboard, so a
+// stale reading shrinks BOTH numbers together, their ratio stays near 1, and
+// the clamp sees nothing wrong with half a screen.
+//
+// SO THE CLAMP NEEDS A REFERENCE THAT IS NOT ALSO STALE, and the only honest
+// one is the app's OWN RECENT HISTORY: the last height this module published
+// while nothing was focused and the reading looked sane. A resume cannot change
+// how tall the screen is, so a height that collapses ACROSS a resume, with
+// nothing focused to explain it, is a stale reading and not a viewport.
+//
+// AND IT IS SCOPED TO THE RESUME. The history reference only arbitrates inside
+// a short window after a foreground/resume event. Outside that window an
+// ordinary resize is allowed to shrink the viewport by any amount it likes,
+// because a person dragging a window edge or rotating a phone is not this bug
+// and must not be second-guessed. That scoping is what keeps the harness's own
+// viewport switches, and a desktop window drag, out of the clamp's way.
+//
+// AND IT SETTLES RATHER THAN SNAPSHOTS. A resume does not deliver the right
+// numbers in the frame it fires; one rAF was enough for `pageshow` and is not
+// enough here. Every resume schedules a short chain of re-measurements, so the
+// last word belongs to a viewport that has stopped moving.
+//
+// GUARD (Nathanael's explicit ask, VERIFY-5I-RESPONSE item 4: "add a guard to
+// ensure THIS DOES NOT REVERT AGAIN"): scripts/ui-modals.mjs drives this path
+// under the heading "5I-SPEC2 §3.2" — it opens a modal, forges a shrunken
+// visual viewport, fires the resume events, and asserts `--modal-vh` and the
+// modal's own box survive. Any refactor that removes the resume window, the
+// history reference or the settle chain fails that assertion.
+// ===========================================================================
 const MIN_PLAUSIBLE_RATIO = 0.6;
 
+// How long after a foreground/resume event the history reference is allowed to
+// arbitrate, and when inside it the viewport is re-measured. iOS settles a
+// resumed PWA's viewport within a couple of frames; 600ms is generous cover
+// with no cost, since each step is one measurement.
+const RESUME_WINDOW_MS = 600;
+const RESUME_SETTLE_MS = [0, 60, 180, 400];
+// How long a MATERIALLY SMALLER height must keep being reported before it is
+// adopted as the reference. Without this the reference poisons itself: iOS is
+// free to deliver the phantom as an ordinary `resize` a few milliseconds BEFORE
+// the foreground event, and a reference that took that reading would then have
+// nothing left to compare the resume against. Sits just past RESUME_WINDOW_MS,
+// so a shrink that is real is confirmed by a measurement taken AFTER the resume
+// clamp has stopped arbitrating -- which is what makes a genuinely smaller
+// screen correct itself in under a second instead of never.
+const SHRINK_CONFIRM_MS = 750;
+
 let stop = null;
 
+// One clock for the resume window. `performance.now` is monotonic, so a device
+// clock change cannot make the window look open forever.
+const now = () => (typeof performance !== 'undefined' && performance.now
+  ? performance.now()
+  : Date.now());
+
 // A keyboard implies a focused editable. This is what lets the clamp tell "the
 // keyboard really is up" from "this reading is left over from when it was".
 function editableFocused() {
@@ -96,19 +164,77 @@ export function trackVisualViewport() {
   const vv = window.visualViewport || null;
   const root = document.documentElement;
 
+  // §3.2: the last height published while nothing was focused and the reading
+  // passed the clamp — the app's own record of how tall this screen really is.
+  // Reset on a genuine geometry change (rotation, a window whose WIDTH moved),
+  // where history is about a different rectangle and must not vote.
+  let lastGoodHeight = 0;
+  let lastGoodWidth = 0;
+  // Timestamp of the most recent foreground/resume event. Only inside
+  // RESUME_WINDOW_MS of it may `lastGoodHeight` overrule a measurement.
+  let resumedAt = 0;
+  const settleTimers = [];
+  // A materially smaller height, seen but not yet believed. See
+  // SHRINK_CONFIRM_MS: the reference must not take a reading that could be the
+  // phantom arriving as an ordinary resize a few milliseconds early.
+  let pendingShrink = 0;
+  let pendingSince = 0;
+  let shrinkTimer = 0;
+
   const apply = () => {
     const measured = vv ? vv.height : window.innerHeight;
     const innerHeight = window.innerHeight || 0;
+    const width = (vv ? vv.width : window.innerWidth) || window.innerWidth || 0;
+    // A different rectangle: rotation, or a desktop window dragged narrower.
+    // History about the old one is worthless and would only misfire.
+    if (width && lastGoodWidth && width !== lastGoodWidth) lastGoodHeight = 0;
     // W4.2, THE SANITY CLAMP. An implausibly small reading with nothing focused
     // is a phantom keyboard, and innerHeight — which the software keyboard does
-    // NOT shrink on iOS — is the better answer until a real measurement lands.
+    // not shrink in Safari's tab UI — is the better answer until a real
+    // measurement lands.
     let height = measured;
+    let rejected = false;
     if (innerHeight > 0 && measured > 0
         && measured < innerHeight * MIN_PLAUSIBLE_RATIO && !editableFocused()) {
       height = innerHeight;
-      schedule();
+      rejected = true;
     }
+    // §3.2, THE RESUME CLAMP. In a standalone PWA `innerHeight` shrinks with
+    // the keyboard too, so the test above can be handed two stale numbers whose
+    // ratio looks fine. Just after a resume, and only then, the last height the
+    // app itself published is the better reference: nothing about coming back
+    // from a screenshot makes the screen shorter.
+    const resuming = resumedAt && (now() - resumedAt) <= RESUME_WINDOW_MS;
+    if (resuming && lastGoodHeight > 0 && height > 0
+        && height < lastGoodHeight * MIN_PLAUSIBLE_RATIO && !editableFocused()) {
+      height = lastGoodHeight;
+      rejected = true;
+    }
+    // A rejection is not a verdict, only a refusal to publish a bad number:
+    // ask again next frame in case the viewport was merely mid-transition.
+    if (rejected) schedule();
     if (height > 0) root.style.setProperty('--modal-vh', `${Math.round(height)}px`);
+    // Remember only readings the clamps did not have to touch, and only with
+    // nothing focused — a keyboard-shortened viewport is real while it lasts
+    // and is exactly what must never become the reference. A reading that is
+    // MATERIALLY SMALLER than the reference is published (a real resize must
+    // take effect at once) but is not believed until it has been reported
+    // again SHRINK_CONFIRM_MS later, past the end of any resume window.
+    if (!rejected && height > 0 && !editableFocused()) {
+      if (width) lastGoodWidth = width;
+      const confirmedShrink = pendingShrink > 0
+        && Math.abs(height - pendingShrink) <= pendingShrink * 0.05
+        && now() - pendingSince >= SHRINK_CONFIRM_MS;
+      if (lastGoodHeight <= 0 || height >= lastGoodHeight * MIN_PLAUSIBLE_RATIO || confirmedShrink) {
+        lastGoodHeight = height;
+        pendingShrink = 0;
+      } else {
+        pendingShrink = height;
+        pendingSince = now();
+        if (shrinkTimer) clearTimeout(shrinkTimer);
+        shrinkTimer = setTimeout(() => { shrinkTimer = 0; apply(); }, SHRINK_CONFIRM_MS + 20);
+      }
+    }
 
     // Both bars are in the same client-coordinate space a position:fixed
     // overlay uses, so their rects ARE the answer, with no arithmetic.
@@ -136,8 +262,27 @@ export function trackVisualViewport() {
   // software keyboard being dismissed, which is where a phantom height is born.
   // All three go through the same per-frame coalescer as everything else, so a
   // resume that fires all three still measures once.
-  const onVisible = () => { if (!document.hidden) schedule(); };
-  const onPageShow = () => schedule();
+  //
+  // 5I-SPEC2 §3.2 adds `focus` and the Page Lifecycle `resume`, and makes a
+  // resume MEAN something rather than merely schedule a measurement. An iOS
+  // screenshot can hand the app back without a `visibilitychange` at all — the
+  // window blurs to the screenshot UI and refocuses — so `focus` is the trigger
+  // that covers the reported case, and `resume` covers a page that was frozen
+  // outright. Marking the resume opens the window in which `lastGoodHeight` may
+  // arbitrate, and the settle chain re-measures until the viewport stops
+  // moving; one frame was enough for bfcache and is not enough here.
+  const markResume = () => {
+    resumedAt = now();
+    for (const timer of settleTimers.splice(0)) clearTimeout(timer);
+    for (const delay of RESUME_SETTLE_MS) {
+      settleTimers.push(setTimeout(() => { apply(); }, delay));
+    }
+    schedule();
+  };
+  const onVisible = () => { if (!document.hidden) markResume(); };
+  const onPageShow = () => markResume();
+  const onWindowFocus = () => markResume();
+  const onResume = () => markResume();
   const onFocusOut = () => schedule();
 
   apply();
@@ -146,8 +291,13 @@ export function trackVisualViewport() {
   // and the height does not change during one.
   if (vv) vv.addEventListener('resize', schedule);
   window.addEventListener('resize', schedule);
-  window.addEventListener('orientationchange', schedule);
+  // A rotation is a new rectangle, so the height history from the old one is
+  // dropped before the measurement that follows it rather than after.
+  const onOrientation = () => { lastGoodHeight = 0; lastGoodWidth = 0; schedule(); };
+  window.addEventListener('orientationchange', onOrientation);
   window.addEventListener('pageshow', onPageShow);
+  window.addEventListener('focus', onWindowFocus);
+  window.addEventListener('resume', onResume);
   window.addEventListener('focusout', onFocusOut);
   document.addEventListener('visibilitychange', onVisible);
   // The bars mount and unmount with the route (no tab bar on the TOC), and a
@@ -177,10 +327,14 @@ export function trackVisualViewport() {
 
   stop = () => {
     if (queued) cancelAnimationFrame(queued);
+    for (const timer of settleTimers.splice(0)) clearTimeout(timer);
+    if (shrinkTimer) { clearTimeout(shrinkTimer); shrinkTimer = 0; }
     if (vv) vv.removeEventListener('resize', schedule);
     window.removeEventListener('resize', schedule);
-    window.removeEventListener('orientationchange', schedule);
+    window.removeEventListener('orientationchange', onOrientation);
     window.removeEventListener('pageshow', onPageShow);
+    window.removeEventListener('focus', onWindowFocus);
+    window.removeEventListener('resume', onResume);
     window.removeEventListener('focusout', onFocusOut);
     document.removeEventListener('visibilitychange', onVisible);
     if (observer) observer.disconnect();
```

### The one NEW source file

`git diff` cannot show an untracked file without staging it, and §2
of the spec forbids staging, so `scripts/ui-verse-flow.mjs` is
reproduced here in full. It is the only new source file in the round.

```js
// VERSE FLOW: every translation-drill item, measured (5I-SPEC2 sections 3.1,
// 6.2 and 7).
//
// DISCLOSURE-RULES section 4.10 says a Bible verse is CONTINUOUS text
// everywhere and breaks only where the container breaks it. That is a claim
// about 257 drill items in twelve drills, not about the two or three anyone
// would think to open, and the two things it can go wrong in -- a forced break,
// and a prompt now long enough to overrun the card -- are both invisible
// without measurement: overflow-x is hidden app-wide, so a clipped verse
// neither scrolls nor errors.
//
// So this walks EVERY item of EVERY translation drill at the 320px floor and at
// 768px and records, per render: the continuation span's computed display, the
// prompt's computed font size, the card's, page's and prompt's horizontal
// overflow, and whether the split costs a line.
//
// THE PROBE is the part worth keeping. "Does the continuation share a line with
// the head" is the WRONG question -- a verse long enough to wrap may
// legitimately wrap at the join, and 54 of 514 renders do. The right question is
// whether the split costs a line AT ALL, so the same string is laid out twice in
// the same box, once as it renders and once as a single text node, and the
// heights are compared.
//
// This is how the dead 5F type ramp was found: 514 renders reported exactly ONE
// computed prompt size, because `.prompt.two-line` had always been outranked by
// `.prompt.greek.long` on specificity (5I-SPEC2-RESULTS-OPUS section 9.3).
//
//   npm run preview            # in another shell
//   node scripts/ui-verse-flow.mjs
//
// Not wired into `npm run verify`: it is a measurement pass, run when a verse
// surface or a prompt style changes. ui-behavior.mjs carries the standing
// per-commit assertion on chapters 7 and 8.

import { chromium } from 'playwright-core';
import { readFileSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:4173';
const OUT = process.env.OUT || 'buildout/screenshots/verse-flow.json';

const DRILLS = [
  ['chapt_7', 'c7_drill_translation'],
  ['chapt_7', 'c7_drill_translation_eimi'],
  ['chapt_8', 'c8_drill_translation'],
  ['chapt_8', 'c8_drill_translation_autos'],
  ['chapt_9', 'c9_drill_translation'],
  ['chapt_10', 'c10_drill_translation'],
  ['chapt_11', 'c11_drill_translation_this_that'],
  ['chapt_12', 'c12_drill_translation'],
  ['chapt_13', 'c13_drill_translation'],
  ['chapt_14', 'c14_drill_translation'],
  ['chapt_15', 'c15_drill_translation'],
  ['chapt_16', 'c16_drill_translation']
];

const data = id => JSON.parse(readFileSync(
  `src/data/chapt-${String(id.split('_')[1]).padStart(2, '0')}.json`, 'utf8'));
const activityOf = (chapter, id) => ['learn', 'drill', 'exercise', 'quickReview']
  .flatMap(k => chapter[k] || []).find(a => a && a.id === id);

async function launchBrowser() {
  const explicit = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
  if (explicit) return chromium.launch({ executablePath: explicit });
  try { return await chromium.launch(); } catch (original) {
    for (const channel of ['chrome', 'msedge']) {
      try { return await chromium.launch({ channel }); } catch { /* next */ }
    }
    throw original;
  }
}

const browser = await launchBrowser();
const context = await browser.newContext({ viewport: { width: 320, height: 900 } });
const page = await context.newPage();
let nav = 0;
const go = async hash => {
  await page.goto(`${BASE}/?flow=${++nav}${hash}`, { waitUntil: 'load' });
  await page.waitForSelector('.card', { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(90);
};

const report = [];
let bad = 0;
for (const { name, width, height } of [
  { name: '320', width: 320, height: 900 },
  { name: '768', width: 768, height: 1100 }
]) {
  await page.setViewportSize({ width, height });
  for (const [chapterId, activityId] of DRILLS) {
    const activity = activityOf(data(chapterId), activityId);
    await go(`#/activity/${chapterId}/${activityId}`);
    let withCont = 0;
    for (let step = 0; step < activity.items.length; step++) {
      const row = await page.evaluate(() => {
        const prompt = document.querySelector('.card .prompt');
        if (!prompt) return null;
        const cont = prompt.querySelector('.prompt-cont');
        const card = document.querySelector('.card');
        const out = {
          text: prompt.textContent.replace(/\s+/g, ' ').trim(),
          fontSize: getComputedStyle(prompt).fontSize,
          hasCont: !!cont,
          contDisplay: cont ? getComputedStyle(cont).display : null,
          noForcedBreak: null,
          taps: document.querySelectorAll('.card .prompt.greek-say').length,
          cardOverflow: Math.ceil(card.scrollWidth - card.clientWidth),
          pageOverflow: Math.ceil(document.documentElement.scrollWidth - document.documentElement.clientWidth),
          promptOverflow: Math.ceil(prompt.scrollWidth - prompt.clientWidth)
        };
        if (cont) {
          // THE PROBE. "Does the continuation share a line with the head" is
          // the wrong question: a verse long enough to wrap may legitimately
          // wrap AT the join. The right question is whether the split costs a
          // line at all -- so the same string is laid out once as it really is
          // and once as a single text node, in a clone of the same box, and the
          // two heights are compared. Equal means nothing forced a break.
          const probe = prompt.cloneNode(true);
          probe.textContent = prompt.textContent;
          probe.style.visibility = 'hidden';
          prompt.parentNode.appendChild(probe);
          out.realHeight = Math.round(prompt.getBoundingClientRect().height);
          out.probeHeight = Math.round(probe.getBoundingClientRect().height);
          probe.remove();
          out.noForcedBreak = out.realHeight === out.probeHeight;
        }
        return out;
      });
      if (row) {
        if (row.hasCont) withCont += 1;
        const ok = row.cardOverflow <= 0 && row.pageOverflow <= 0 && row.promptOverflow <= 0
          && (!row.hasCont || (row.contDisplay === 'inline' && row.noForcedBreak === true));
        if (!ok) { bad += 1; console.log(`BAD ${name} ${activityId} ${JSON.stringify(row)}`); }
        report.push({ viewport: name, chapterId, activityId, step, ...row, ok });
      }
      const next = page.locator('.card').getByRole('button', { name: 'Next', exact: true });
      if (!await next.count() || await next.isDisabled()) break;
      await next.click();
      await page.waitForTimeout(25);
    }
    console.log(`${name} ${activityId}: ${activity.items.length} items, ${withCont} with a continuation`);
  }
}
writeFileSync(OUT, JSON.stringify(report, null, 1));
const sizes = [...new Set(report.filter(r => r.viewport === '320').map(r => r.fontSize))];
console.log(`\n${report.length - bad}/${report.length} item renders clean; prompt sizes at 320px: ${sizes.join(', ')}`);
await browser.close();
process.exit(bad ? 1 : 0);
```
