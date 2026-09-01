# 5I-SPEC2.md — cohort 5I feedback round (chapters 13-16)

Issued by the chat pipeline (Fable), 2026-08-31, from
VERIFY-5I-RESPONSE (Nathanael's device pass, 2026-08-30). FINAL,
TBK-confirmed 2026-08-31 with the ISO mounted; supersedes the interim
spec committed at `869b4d1`. Base: repo HEAD `869b4d1`.

**DUAL MODEL.** Per the standing scheduling rule, this
patch/feedback round runs on BOTH implementers (Sol/Codex and
Opus/Claude Code) in isolated repo copies. Grading per
GRADER-PROMPT.md follows.

**Read first, in this order:** this spec; `DISCLOSURE-RULES.md` at
the commit that carries this spec (it gains §3.11, §3.12, §4.8-4.10
and amendments to §4.6, §4.7 in the same commit; §3.3 is REAFFIRMED — every one of
them is load-bearing here); `VERIFY-5I.md` + `VERIFY-5I-ADDENDUM.md`
for what this round answers; `CHAT-HANDOFF.md` for the process rules.

**Rail walks:** Nathanael attaches ch13railwalk.pdf through
ch16railwalk.pdf. They are the fidelity reference; THIS SPEC WINS on
any disagreement, and a disagreement is REPORTED in RESULTS, never
silently resolved. A hand cursor over a word is positive evidence of
a tap; a NORMAL cursor over a word is negative evidence (§4.7 as
amended) — no cursor near a word is no evidence either way.

**Why this round exists.** 5I-SPEC1 regressed several rendering
patterns that chapters 5-12 had carried by convention. Those
conventions are now written contracts, cited per item below. The
implementer's job is (a) the renderer work in §3, (b) the authorized
data edits in §4-§5, (c) the two app-wide sweeps in §6, and (d) the
standard gates, visual pass and VERIFY document.

---

## 1. Wall-clock timing

Per TURN, not per round: record the start and stop time of every
working turn in a table in the BUILD document. The BUILD document's
headline figure is the CUMULATIVE ACTIVE time across all turns,
downtime excluded. Do not reconstruct times from memory at the end.
Any addendum or patch turn ADDS its time to the main total.

## 2. Deliverables

1. `5I-SPEC2-BUILD-<MODEL>.md` — the COMPLETE exact `git diff`
   (read-only; no commit, push, or staging), the full thought/tool
   log, and the per-turn wall-clock table with the cumulative total.
   A round missing the diff or the total is auto-penalized.
2. `5I-SPEC2-RESULTS-<MODEL>.md` — the handoff: what was built, what
   deviated from this spec and why, and EVERY data edit made under
   §4-§5 as a before/after table (the same-cohort absorption rule
   consumes this table verbatim — its completeness is graded).
3. `VERIFY-5I-2.md` — authored by the WINNING implementer after
   grading/XPATCH, per §9.

**Assembler warning.** Every `assemble_ch13..16.py` self-checks
against the committed chapter and REFUSES to write on a difference.
Your §4-§5 edits will make them refuse. That is correct behavior:
DO NOT run the assemblers, do not set `ALLOW_REGRESSIVE_REBUILD`,
do not "fix" the guards. Absorption of your edits into the
assemblers is the pipeline's same-cohort duty, driven from your
RESULTS table.

---

## 3. Renderer work

### 3.1 Continuous verses (VERIFY-5I-RESPONSE G2/G3; DISCLOSURE §4.10)

Every Bible verse, everywhere, is continuous flowing text; line
breaks come only from container width. Two known forced breaks to
remove:

- `src/app.css` `.prompt-line2 { display: block; }` and the
  `SelectActivity.svelte` markup around `current.prompt2`: render
  `prompt` and `prompt2` as ONE flowing line joined by a single
  space, still one tap target, one clip. Keep `long`/type-ramp
  behavior sane for the now-longer string.
- `src/app.css` `.rc-verse-line { display: block; }` and the
  `RichContent.svelte` `row.greek2` branch: same join.

Then SCAN, don't assume: walk every surface that prints a verse
(drill prompts, Translate reveals, Learn/Review Scripture Memory,
interlinears, `verseExamples` blocks) and confirm no forced break
survives inside any verse. List every removal in RESULTS. The
`greek2` DATA key stays exactly as shipped — it is extraction
provenance (positional pool line 2), and the assemblers reproduce
it; only the RENDER joins.

### 3.2 The half-screen modal regression (VERIFY-5I-RESPONSE item 4)

The half-page modal bug is back. NOT a code revert: `src/lib/viewport.js`
is byte-identical to `6a4369c` (verified by the pipeline; the 5I
`app.css` changes are typography only). It is the clamp's known-open
device soak (CHAT-HANDOFF "Known open questions") failing on a
trigger the clamp never covered. Nathanael's observation is
diagnostic: it regresses AFTER TAKING A SCREENSHOT, even with no modal
open, even on a page with no modal — on iOS a screenshot can
background/foreground the PWA, exactly the resume-drops-resize path
the file documents. Tasks:

1. Make the clamp survive the screenshot path: re-measure on
   `visibilitychange` / `pageshow` / foregrounding, and REJECT a
   phantom shrunken height when no editable element is focused (the
   file's own stated principle — verify the trigger list actually
   covers this case and add what is missing).
2. GUARD AGAINST RE-REGRESSION, which is Nathanael's explicit ask:
   add an automated assertion to the ui harness that drives the
   resume path (or the closest scriptable proxy) and asserts modal
   height; and put a loud comment block on the clamp naming this
   round, so no future refactor trims it silently. If a scriptable
   proxy genuinely cannot reproduce the trigger, say so in RESULTS
   and the device soak in VERIFY carries it.

### 3.3 Green-underline (§3.2) sweep support and the note marker (§3.12)

Nathanael's ruling on item 9: DISCLOSURE §3.3 STANDS — in-chart
triggers keep their appearance, and that overrides §3.2 for chart
cells and labels. The ch15 Ending Transformations Palatals / Labials
/ Dentals are NOT in-chart: the railwalk (ch15railwalk.pdf p8) shows
prose rule lines with blue hot words, so they are C3 in-text links
under §3.2 and should have shipped green underlined (new §3.11
records the classification). Whatever component change lets a
`greekRows` row LABEL with a `popupRef` render green underlined
(bold kept) when the block is prose-layout, without touching actual
chart triggers. The app-wide sweep is §6.1. The circled note-marker
(ch14 εἶδον, D-59) is already shipped; confirm it takes §3.2 styling
and codify nothing else — it is now the standard.

### 3.4 Frozen header row in long-list modals (§4.9)

A modal holding ONE long list scrolls under a PINNED header row.
Implement for the ch16 Passive Verbs Form Drill's Passive Stems hint
(after the §4 data merge makes it one list). The pinned header sits
at the top of the modal's scroll area; §4.3's footer rules are
untouched. Multi-chart bundles keep §4.2 paging.

### 3.5 Paged-paradigm rendering (§4.6 surface matrix)

No new capability is expected: ch11's `switch: 'named'` two-chart
paradigms and paged hint bundles are the model. Confirm the ch13
data edits in §4.1 render exactly like ch11's (Learn: chart +
Say Paradigm + named toggle; hint modal: paged charts per §4.3 with
the say-all per §4.8). If any gap in the components blocks that,
close the gap and report it.

### 3.6 Derivation block size (VERIFY-5I-RESPONSE I-6)

ch15 Learn First Aorist → Ending Transformations: the two
liquid/nasal derivation lines (`μένω + σα = ἔμεινα`,
`ἀποστέλλω + σα = ἀπέστειλα`) come down one type step to match the
worked examples above them. Confirm the second no longer wraps at
320px after the step-down; if it still wraps, report rather than
shrink further.

---

## 4. Authorized data edits (rule 4; report EVERY one before/after)

These are content-level fixes Nathanael ruled on device. You are
authorized to edit `src/data/chapt-13..16.json` for exactly the
items below. Anything beyond them routes back to the pipeline.

### 4.1 ch13 — the πᾶς chart pages on Learn and in the hint (items 1, 2; I-1)

The Review copy (`qrPas`) is CORRECT AS SHIPPED — do not touch it.

- **Learn topic "πᾶς Adjective" (`learnPasParadigm`)**: convert the
  single six-column `columnGroups` chart into the ch11 shape —
  `{type: 'paradigm', switch: 'named', charts: [Singular, Plural]}`,
  each half three columns (Masculine/Feminine/Neuter) with the same
  cells and cell audio, subtitle Singular/Plural, and
  `sayWhole: {label: 'Say Paradigm', audio: 'chapt_13_m_paspar'}` ON
  EACH HALF (NIT-LOG N-1: the whole-paradigm clip rides every half).
- **Hint (`hintCharts.pasParadigm`)**: same split into two charts,
  paged in the modal per §4.3, and ADD the Say Paradigm button
  (`chapt_13_m_paspar`) per §4.8 — this is divergence D-58, already
  logged; cite it in a `_note` on the composite.
- The corrected πάσαις cell (D-55 precedent) carries over unchanged
  into the split charts.

### 4.2 ch13 — πᾶς, πᾶσα, πᾶν tap independently (item 3; B1) — TBK-CONFIRMED

Learn Third Declension Nouns → Introduction. The original page
carries three WordSelection buttons (13_3DECL.TBK 0x21c0b, 0x21ce9,
0x21de4). Replace the single phrase mapping
`{"πᾶς, πᾶσα, πᾶν": "chapt_13_m_voc5"}` with three word mappings:
`πᾶς → chapt_13_m_pasmns`, `πᾶσα → chapt_13_m_pasfns`,
`πᾶν → chapt_13_m_pasnns` (nominative neuter — the original's own
dispatch, not the `pasnas` fallback). Commas and spaces stay ink.
Update the topic's `_audio_note` to record that `m_voc5` speaks πᾶς
alone (the B1 listen result) and the three-button dispatch, and fix
the chapter `_audioVerify` string that still asks for a listen on
the nonexistent "m_pas" — it should name `m_voc5` and carry B1's
outcome.

### 4.3 ch14 + ch16 — tap boundaries in worked examples (item 6)

The 5G-SPEC3 canon binds: only the resulting Greek form is the tap.

- ch14 Form topic: `ε + λαβ + ο + ν = ἔλαβον` — replace
  `tapUnit: true` with
  `greekTap: {word: "ἔλαβον", audio: "chapt_14_n_lab1s"}`.
- ch16 Form topic: `ἐ + λυ + θη + ν = ἐλύθην` → greekTap ἐλύθην /
  `chapt_16_p_luw1s`; `λυ + θησ + ν = λυθήσομαι` → greekTap
  λυθήσομαι / `chapt_16_p_luwf1s` (the `_verify_note` on the nu slip
  stays).
- ch16 Ending Transformations (after the §4.4 merge): the five
  result forms tap — ἐδιώχθην → `chapt_16_p_diwa`, ἐλείφθην →
  `chapt_16_p_leia`, ἐγράφην → `chapt_16_p_graa` (the page's own dispatch; not the paradigm cell), ἐπείσθην →
  `chapt_16_p_peia`, ἐδοξάσθην → `chapt_16_p_doca`. These sit in
  `note` strings on `greekRows` rows today; if the row note cannot
  carry a word tap, extend the shape minimally (e.g. a
  `noteTap: {word, audio}` key) and report the contract addition.
  The construction morphemes (`διωκ + θη =` …) stay ink. For the
  record: the original page has buttons on ἐλείφθην and ἐγράφην only
  and the Consonant Shifts page has none; all five tap in the port
  under the standing all-Greek-taps rule because all five clips
  exist.

### 4.4 ch16 — one Ending Transformations chart (item 7; D-61)

Merge Learn topic "Consonant Shifts" into topic "Ending
Transformations": one topic, one five-row chart (Palatals, Labials,
the φ row, Dentals, Sibilants), the Consonant Shifts header GONE,
the `shiftSummary` block following the merged chart. Topic count on
the rail drops by one; the toc/progress counts must follow.

### 4.5 ch16 — Passive Stems is one list (item 11)

- Learn topic 8: the two stacked `Passive Stems` paradigm blocks
  become ONE list under ONE header row.
- Review Passive Indicative Forms: same collapse, one header.
- Form Drill hint `passiveStemsHint`: one scrolling list in the
  modal under the §3.4 frozen header — never two pages.

### 4.6 ch16 — ἐγενόμην taps (item 10)

Deponent topic: add `ἐγενόμην → chapt_16_p_ginm` to the `audioMap`
(TBK-confirmed: the page dispatches apea, apea, ginm, gina at
16_FAPAS.TBK 0x21828-0x21ab6; the railwalk shows the hand cursor).
Correct the topic's `_audio_note`, which wrongly claims no clip
exists. VERIFY carries the listen.

### 4.7 ch14 + ch15 — Forms-hint charts read gloss-LAST (I-3)

`ch14 hintCharts.secondAoristForms` and
`ch15 hintCharts.firstAoristForms` currently print the gloss as the
row label (left). Reshape so each row reads exactly like Learn
topic 6's stem list: `present — aorist (gloss)`, gloss last, both
Greek forms tapping their clips. Mechanism is your choice (render
the stemList shape inside the hint, or extend paradigm rows with a
trailing gloss); report the contract touched.

### 4.8 ch14 + ch15 — capitalized glosses (I-5; D-60)

Capitalize the paradigm glosses on ch14's Review and hint copies of
the λαμβάνω paradigm and ch15's Review copy of the λύω paradigm
("We took / You took / He/she/it took" pattern), matching their
Learn copies. Cite D-60 in a `_note` on each edited chart.

---

## 5. Conditional hints (item 12; C4; C5) — per-item hintRef tables, READ FROM THE TBKs

The renderer already supports per-item `hintRef` with drill-level
fallback; the 5I data emitted the key but pointed every item at one
composite. The pipeline decoded every Hint-button script in the four
TBKs on 2026-08-31 (recipe and offsets in PIPELINE-INSIGHTS,
"Conditional-hint extraction"). Wire the tables below AS GIVEN; they
are transcriptions, not derivations. Every other 5I drill hint is
confirmed uniform and stays as shipped (ch13 πᾶς Declining, all of
ch14, ch15 Parsing, ch16 Form).

### 5.1 ch16 — new composites

In `chapt-16.json` `hintCharts` add:
- `luwPassivePair`: charts = [First Aorist Passive Indicative of
  λύω, Future Passive Indicative of λύω] (reuse the existing two
  charts; §4.2 Back/More paging).
- `graphoPassive`: charts = [Second Aorist Passive Indicative of
  γράφω].
`passiveParadigms` stays for provenance but nothing references it
once the tables below land (note that in RESULTS).

### 5.2 ch16 Passive Verbs Parsing Drill (18 items) — 16_FAPAS.TBK 0xb5e30

`when it = 5 or 6 or 9 → Hint2; when it = 12 or 17 or 18 → Hint2;
else Hint1`. Hint1 is the λύω pair, Hint2 the γράφω chart:

| Items | hintRef |
| --- | --- |
| 5, 6, 9, 12, 17, 18 | graphoPassive |
| all other 12 | luwPassivePair |

### 5.3 ch16 Passive Verbs Translation Drill (28 items) — 16_FAPAS.TBK 0xc08a7

UNCONDITIONAL: `show Hint1`, and Hint1 (0xc1044-0xc11d1) holds the
λύω First Aorist Passive and Future Passive charts ONLY — the γράφω
chart does not belong on this drill at all. Set `ui.hintRef` and all
28 per-item values to `luwPassivePair`. (VERIFY-5I-RESPONSE item 12
assumed this drill varied like the Parsing Drill; it does not.)

### 5.4 ch15 — new composites

In `chapt-15.json` `hintCharts` add:
- `aoristPair`: [Aorist Active of λύω, Aorist Middle of λύω]
- `imperfectPair`: [Imperfect Active Indicative of λύω, Imperfect
  Middle/Passive Indicative of λύω]
`aoristVsImperfect` stays for provenance, unreferenced.

### 5.5 ch15 First Aorist Indicative Translation Drill (29 items) — 15_1AOR.TBK 0x116f1e

`when it = 1 or it = 11 → Hint2 (imperfect pair); else Hint1
(aorist pair)`:

| Items | hintRef |
| --- | --- |
| 1 (Mar 4:2), 11 (Luk 4:15) | imperfectPair |
| all other 27 | aoristPair |

Note for the record: item 6 (Mar 2:13) is an all-imperfect verse and
item 7 (Mar 12:6) is mixed, yet the original shows the AORIST charts
for both. Transcribe the original; do not "fix" it.

The ch15 Parsing Drill's `firstAoristParadigms` hint is uniform in
the original (15_1AOR.TBK 0x2a88, single `show Hint1`) and CORRECT
as shipped — untouched.

---

## 6. App-wide sweeps (checklists in RESULTS, one row per finding)

### 6.1 In-text modal triggers (§3.2; item 9)

Walk EVERY modal/popup trigger in chapters 1-16 and bring every
non-button, NON-CHART trigger to §3.2 green underline (bold kept):
prose links, list labels, prose-layout `greekRows` labels (ch15
Palatals / Labials / Dentals — the ratifying instance), the
`[[link:liquids]]` link, note markers, titleLinks (already green).
EXEMPT by Nathanael's ruling: every §3.3 in-chart trigger — chart
cells, chart labels, the ch13 Key Letter Box — keeps its shipped
appearance; do not touch them. Greek hot text keeps blue. Tabulate
every conversion and every exemption you judged in RESULTS; a
judgement call between "prose rule list" and "chart" is reported,
not silently made.

### 6.2 Verse continuity (§4.10; G2/G3)

The §3.1 scan, run app-wide with results tabulated: every surface
that prints a verse, chapters 1-16, no forced break inside a verse.

---

## 7. Machine gates

`npm run check:shapes` green across all sixteen chapters;
`npm run verify` green; ui-behavior, ui-modals, ui-disclosure,
ui-disclosure3 updated for: the joined prompt line (tap count
unchanged, one target), the ch13 πᾶς Learn toggle + hint paging +
hint say-all, the frozen-header modal, per-item hint routing on the
three §5 drills (assert at least one item of each mapping class
opens the right composite), and the §4.4 topic-count change. Zero
horizontal overflow at 320px and 768px on every touched page —
including the joined long prompts, which are the likeliest new
overflow source. DO NOT wire `scan_garble.py` into any gate.

## 8. Visual verification (mandatory, per CHAT-HANDOFF)

Load every touched page in a real browser against its railwalk
screen. Specific eyes: ch13 πᾶς Learn/hint against ch11's paged
model AND the ch13 railwalk; ch16 merged Ending Transformations
against both original screens; ch16 Passive Stems single list; the
five newly tapped result forms; joined verse prompts on the longest
ch15/ch16 verses at 320px; the hint routing on the §5 screenshot
items (λυθήσονται, ἐγράφημεν, Mar 4:2, Mar 8:26).

## 9. VERIFY-5I-2.md (authored by the winning implementer)

Opens with the PREVIOUS-RESPONSE CHECKLIST (this is a continuation
round): every ask from VERIFY-5I-RESPONSE, one or two lines each,
tick-by-looking, route line per row — items 1-12, I-1..I-6, B1, C4,
C5, G2/G3 all appear. Then the new items, judgement and listens
only; no airplane-mode items. Must include at least:

- LISTEN: `p_ginm` on ἐγενόμην — is it the aorist middle?
- LISTEN: the three Introduction taps πᾶς/πᾶσα/πᾶν
  (m_pasmns/m_pasfns/m_pasnns) — right words, right order.
- EYE: ch15 Palatals / Labials / Dentals now green underlined in
  prose; the Key Letter Box unchanged beside it.
- EYE: frozen header row while scrolling the Passive Stems hint.
- EYE: ch16 Translation Drill hint is the two λύω charts on every
  item (no γράφω chart anywhere in that drill).
- SOAK: the half-screen modal after screenshots, over days of use.
- The §3.6 derivation block at its new size on the real screen.

## 10. Out of scope — pipeline-owned, recorded here so nobody waits

- Absorption of every §4-§5 edit into `assemble_ch13..16.py`
  (same-cohort rule; consumes your RESULTS tables).
- NIT-LOG N-1/N-6 audio split/merge job — unchanged, deferred.
- Chapters 6-8 assembler reconstruction — unchanged, deferred.
