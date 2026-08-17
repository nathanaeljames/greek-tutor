# DISCLOSURE-SPEC1 -- App-wide disclosure conformance (R1-R7) + chapters 1-8 data consumption

Round: DISCLOSURE (one round, both implementers). Base: repo head at
round start (accepted 5G head `bbf5a6b`; guards commit `81bd9fb` also
merged). Authority documents, cited by section throughout:
**DISCLOSURE-RULES.md** (the ratified disclosure canon -- carry it as a
standing attachment to this round), DRILL-BEHAVIOR-RULES.md,
DIVERGENCE-LOG.md, TITLE-SWEEP-RULES.md.

This is the biggest single round of the project: seven app-wide
renderer items plus consuming eleven regenerated data files across ten
chapters. Budget a full window and follow the checkpoint discipline in
section 0.6 without exception.

## 0. Standing round rules

0.1 **Directives 1-10 apply** (CHAT-HANDOFF.md "Standing directives").
    Called out for this round: directive 4 (the round ends with an
    airplane-mode check), directive 6 (no emoji anywhere, including
    code comments and docs), directive 8 (blue is RESERVED for
    tappable; this round adds green underlined links as a second
    tappable affordance -- that is ratified, DISCLOSURE-RULES §3.2,
    and does not violate 8: nothing non-tappable may be blue),
    directive 10 (no full cache/store scan on load or route-mount).

0.2 **Implementers NEVER run git.** No commit, no stage, no push. All
    version control is Nathanael's. Produce diffs with read-only
    `git diff` (untracked files: `git add -N` is still a staging
    operation -- instead list new files verbatim in the BUILD doc).

0.3 **Data files are copied in verbatim, never content-edited.** The
    one standing exception remains: obviously missing formatting or
    text found during visual verification may be fixed, and every such
    edit must be reported in RESULTS with before/after so the pipeline
    can absorb it.

0.4 **STOP conditions.** If any file this spec names is absent from
    what you were given, STOP and say so -- do not substitute, infer,
    or proceed partially. If data carries a shape this spec does not
    describe and the renderer does not know, STOP and report rather
    than inventing a rendering.

0.5 **Deliverables** (both implementers, separate physical repo
    copies):
    - `DISCLOSURE-SPEC1-RESULTS-<MODEL>.md` -- the handoff: what was
      built, decisions taken, data edits if any, known gaps.
    - `DISCLOSURE-SPEC1-BUILD-<MODEL>.md` -- exact cumulative git
      diff + full thought/tool log + wall-clock time.
    - `DISCLOSURE-VISUAL-CHECKLIST-<MODEL>.md` -- the resumable visual
      checklist of section 5.3, committed state at round end.

0.6 **Checkpoint discipline (mandatory).** After completing each work
    item in section 3 (W1..W10): regenerate the cumulative diff into
    the BUILD doc and tick the visual checklist. A window death must
    never cost more than one work item. The BUILD doc is a running
    document, not an end-of-round export.

0.7 **Visual verification** applies to EVERY screen this round touches.
    The fidelity references for this round are (a) DISCLOSURE-RULES.md
    itself, which is self-describing, and (b) the named in-app model
    screens: ch2 "6 Accent Rules" for C2 interspersing, ch5 Definite
    Article Paradigm for §4.1 toggles, ch8 Third Person Paradigm for
    §4.2 Back/More, ch8 Personal 3rd Person review for C9. Load every
    touched page in a real browser and screenshot it; asserting a
    string exists in JSON is not visual verification.

0.8 The ISO and DOSBox are NOT needed this round. The one open
    provenance item (ch1 Capitals Note is a railwalk transcription)
    is byte-verified opportunistically at a future TBK mount, not now.

## 1. Round shape and sequencing (read first)

The data files and the renderer items are one round because they
interlock both ways:

- The new data carries shapes the renderer does not know (`termList`,
  `wordUsage`, the ch1 Six Points `expander`), and
  `scripts/check-content-shapes.mjs` FAILS THE BUILD on any type its
  dispatch does not handle. Committing the data first breaks the
  Netlify deploy; shipping the renderer first leaves R1-R7 pointing at
  data that is not there.
- Therefore: the eleven data files land in your WORKING COPY as the
  first work item (W1) and are committed to main by Nathanael only
  when the winning tree merges. Nothing in this round touches main
  until then.

Order of work: W1 (data + shape guard) must come first so the build is
green from the start. W2-W9 are independent of each other and may be
taken in any order; W10 (harness + checklist) runs last and
continuously.

## 2. Data file inventory (11 files, delivered with this spec)

| File | Base | What changed |
| --- | --- | --- |
| chapt-01.json | staged pass | Six Points -> standard `expander` in `content[]` (bespoke `sixPointsContent` field GONE); Capitals Note two missing screens restored inline |
| chapt-02.json | staged pass | 4 topics interspersed (C2); Parts of Speech / Sentence Parts links -> C3 popups; Identifying Verbs defList -> `termList` + popups |
| chapt-03.json | staged pass | Voice + Person interspersed (C2) |
| chapt-04.json | staged pass | Case + Inflectional Forms interspersed (C2, titled "Examples"); Introduction links -> C3 popups |
| chapt-05.json | staged pass | Same as ch4; PLUS Review Definite Article restacked: one 6-column chart -> Singular + Plural as two stacked charts, one say-all each (C9, §4.6) |
| chapt-06.json | staged pass | `poolKind: "vocabulary"` on both vocab drills |
| chapt-07.json | staged pass + AMENDMENT | οὐ/οὐκ/οὐχ -> three C2 "Examples" accordions wrapping `wordUsage` blocks (numberPopupRef retired); AMENDED 2026-08-16: both adjective paradigm blocks' `switch` corrected `moreBack` -> `named` (charts are named Singular/Plural -- a one-word contrast is `named` per §4.1/§5; the moreBack values predate ratification) |
| chapt-08.json | staged pass + CORRECTION 2026-08-16 | `poolKind` on both vocab drills; Three Uses -> C2 "Examples" accordions wrapping the former popup bodies as `wordUsage` blocks (title + examples -- ch8's popups carry no Greek headword); the three popups retired. The Three Uses conversion was OMITTED from the 2026-08-15 pass in error, caught by an implementer STOP at W1, and executed 2026-08-16 -- the corrected file supersedes the first delivery |
| lexicon-chapt08.json | staged pass | rides with chapt-08 |
| chapt-09.json | REPO copy + patch | ONLY change: `poolKind: "vocabulary"` + `_pool_note` added to both vocab drills (owed by the D-32 extension, 5G-SPEC1) |
| chapt-10.json | REPO copy + patch | Same two-key patch on both vocab drills; nothing else touched |

W1 verification: all eleven parse clean and the four ch9/10 drills'
only diff against the committed copies is the two inserted keys --
assert this with a JSON-level diff before proceeding.

## 3. Work items

### W1 -- Data in, build guard green

1. Copy the eleven files into `src/data/` verbatim.
2. Teach `scripts/check-content-shapes.mjs` the new shapes so the
   build passes:
   - `termList`: `items[]` of `{ term, def, link? }`, all strings,
     `link` optional and naming a popup id.
   - `wordUsage`: `{ title?, greek?, gloss?, condition?, audio?,
     examples[] }` with examples of `{ greek, gloss, ref?, audio? }`.
     `examples` is required and at least one of `title`/`greek` must
     be present; every other field is optional-per-source. (This is a
     former popup body inside an "Examples" accordion: ch7's variant
     carries greek/gloss/condition, ch8's carries title + examples --
     PopupSheet.svelte's ch7 and ch8 branches document both shapes.)
   - `poolKind`: if present on an activity, value must be the string
     `"vocabulary"`.
   - The guard must also accept the ch1 `expander` sitting in a
     contentAudio stepper activity's `content[]` (W3.3).
3. `npm run build` green, `npm run dev` boots, every chapter route
   mounts without an "Unsupported content block" card. This is
   checkpoint 1.

### W2 -- R1: in-text links go green (CSS only)

`src/app.css` `.popup-link` (~line 1306) changes `color: var(--link)`
to `color: var(--teal-dark)` (#1f5f57), underline kept. This restyles
every C3 link app-wide in one edit -- ch2 grammar links, ch4/ch5
Introduction links, ch6 in-chart gloss triggers EXCEPTED: per §3.3,
in-chart `popupRef` triggers KEEP their existing appearance (verify
the ch6 chart glosses do not pick up the green underline; if they
share `.popup-link`, split the class). Numbers are never part of a
link (§3.2) -- the data already excludes them; verify, don't re-fix.
Update the stale "link is blue" comment above the rule.

### W3 -- R2: accordion restyle + ch1 Six Points swap

1. `.rc-expander` restyle (app.css ~649): summary text green
   var(--teal-dark), caret/marker to the LEFT in the same green, NO
   underline, and drop the card border/background to match the
   ratified look (the ch2 "6 Accent Rules" screen is the in-app
   model). ALL expanders, ALL categories, collapsed by default, no
   exceptions (§3.1). The `summaryStyle: "green"` special case
   collapses into the universal style -- remove the conditional class,
   keep reading the key harmlessly if it stays in data.
2. Strip `[[u]]` (and any other inline markup) from accordion LABELS:
   the summary renders plain text, not <Marked> underlines. Use the
   existing `stripMarkers` in `src/lib/markup.js` (~line 93).
3. Six Points: in `ContentAudio.svelte` stepper mode, render
   `activity.content` through RichContent after the controls (the
   pattern textPage mode already uses at ~line 345), and DELETE the
   bespoke `sixPointsContent` collapsible card (~lines 380-392).
   Zero visual change intended beyond the universal restyle -- the
   panel was already an accordion.
4. R6 rides here: the Meanings affordance (`.pg-meanings` in
   Paradigm.svelte ~215) becomes green, UNDERLINED (the sole underlined
   accordion label, §3.9), left caret, no border or margins, collapsed
   by default.

### W4 -- R3: pinned control rows + centred no-say

1. **Modals**: the say-all + navigation control row is fixed to the
   modal FOOTER, outside the scroll region (D-38 amended: More/Back
   in modals is fixed to the footer; Back left, More right unchanged).
   Applies to every hint modal (ch3-ch10) and any modal a paradigm
   renders in.
2. **Main content**: the same row is sticky at the panel bottom when
   the chart is taller than the viewport (ch8 Third Person is the
   tall case). Nothing in the control row ever scrolls out of view
   (§4.3).
3. **Centred when no say-all** (§4.5, the eimi-hint finding): where a
   chart state has NO say button, the remaining toggle or Back/More
   pair is CENTRED on its own line. The current CSS
   (`.hint-paradigm-controls.no-say .hint-paradigm-toggle
   { grid-column: 2; }`, app.css ~402) right-aligns it -- that is the
   bug this rule was written from. Centre it, app-wide, every
   category.

### W5 -- R4: no modal stacking; Paradigm/Endings in place

1. In any MODAL host, a control never opens a second modal. The
   concrete case: `chart.endings` in Paradigm.svelte currently opens
   its own `.pg-endings` modal (~line 296) -- inside a drill-hint
   modal that stacks. In modal hosts the hint becomes ONE modal with
   an in-place two-state toggle labelled Paradigm/Endings (§4.1
   named-style labels; covers the ch3 x3, ch4 x2, ch5 x3 drill hints
   whose hintRefs resolve to charts carrying `endings`).
2. The Endings STATE gets its own say button playing
   `chart.endings.audio`, same slot and class as Say Whole Paradigm.
   Default label `Say Endings`; if you find this reads wrong against
   the model screens, say so in RESULTS -- it is a one-string change
   and is listed as a VERIFY item.
3. **Autoplay is removed** everywhere: `openEndings()` (~line 100)
   currently plays on open (the D-10 restoration). The clip now plays
   only from the explicit say button. D-10's audio stays restored --
   behind a tap, as its own text already requires.
4. From MAIN content (the ch3/4/5 Learn pages), the Endings button may
   keep opening its single-level modal (one level is not stacking),
   but that modal also loses the autoplay and gains the say button,
   and its Close row is a fixed footer per W4.1.

### W6 -- R5: the two-state toggle, generalized

Current state in `Paradigm.svelte`: `named` renders a single toggle on
the say-all line (correct); `moreBack` ALWAYS renders the centred
Back/More pair, even for two charts. Per §4.1/§4.2:

1. **Two charts**: ONE toggle button on the say-all line, regardless
   of switch kind. `named` labels it with the target chart's `name`
   (unchanged). `moreBack` labels it `More` on chart 0 and `Back` on
   chart 1 (alternating single button). Affected data: ch4 Masculine
   Declension (charts named after the lexical pair -- label stays
   More/Back), ch5 First Declension-Alpha (same), ch7 both adjective
   paradigms (now `named` Singular/Plural after the data amendment --
   the existing named path serves them).
2. **Three or more charts**: the centred Back/More pair beneath the
   say-all, both always visible, invalid direction disabled --
   unchanged (ch8 Third Person stays the model).
3. **Hint bundles**: replace the hardcoded `HINT_DISCLOSURE_REFS`
   allowlist in SelectActivity.svelte (~line 197) with the structural
   rule DISCLOSURE-RULES §5 states: a resolved bundle of exactly two
   paradigms renders the §4.1 toggle (labels via
   `paradigmToggleLabels`, More/Back fallback); three or more render
   §4.2. Quick Review never routes through hintRef and is unaffected.
4. **`ui.hintPages`** (ch7 Adjective Translation Drill: Adjective
   Paradigm page + Attributive & Predicate Positions page): two pages
   render with the SAME single alternating More/Back toggle in the
   pinned footer (no one-word contrast exists between those titles),
   replacing the current page nav.
5. The ch7 Adjective Case Drill hint (`hintRef: adjectiveParadigm`)
   resolves to the paradigm block whose charts are now `named`
   Singular/Plural -- confirm the toggle appears beside Say Whole
   List inside the hint modal and switches in place (§4.1, pinned per
   W4).

### W7 -- R7: termList block

New RichContent case `termList` (ch2 Identifying Verbs): each item
renders the TERM on its own line in green with its definition text
beneath (replaces the two-column defList look -- broken item 2). A
term carrying `link` is a C3 trigger: green underlined, opens its
popup via the existing popups context (`usePopups`/`popupFor`,
RichContent ~line 25). A term without `link` is plain green, not
underlined, not tappable. Existing `defList` blocks elsewhere are
untouched.

### W8 -- wordUsage block

New RichContent case `wordUsage` (ch7 + ch8 "Examples" accordions):
renders a former popup body inline, mirroring PopupSheet.svelte's
field handling -- every field renders only when present. ch7's shape:
Greek headword as a blue audio tap (directive 9), gloss and condition
in ink, then examples. ch8's shape: the `title` line (ink, as the
popup title rendered), then examples. Each example is Greek tap +
gloss + reference in both. Reuse the popup layout conventions; do not
restyle beyond fitting inside an accordion body.

### W9 -- poolKind honored

`SelectActivity.svelte` `vocabularyPool` predicate (~line 158): a
drill with `poolKind === "vocabulary"` joins the responsive D-19 class
(two-up below 768px, four-up from 768px) even though its grid is
authored. Covers all eight case-split/authored vocabulary drills in
ch6, ch8, ch9, ch10 (D-32 and its extension). No other activity's
layout may change -- assert one non-vocabulary authored grid stays
two-up at both widths.

### W10 -- Harness + visual checklist (continuous)

Extend the Playwright harness with at least: every accordion mounts
collapsed; `.popup-link` computes green; ch6 in-chart triggers do NOT;
two-chart stacks render exactly one switch button, 3+ render the pair;
opening Endings inside a hint does not add a second overlay; no audio
element starts on Endings open; the eight poolKind drills carry the
responsive class and one control drill does not; termList and
wordUsage render (no "Unsupported content block" anywhere, all ten
chapters); Six Points expander exists and is collapsed; ch5 Review
Definite Article shows two charts, two say-alls, zero toggles.

## 4. What each chapter should look like after (spot list)

- ch1: Six Points identical but restyled per R2; Capitals Note longer,
  still inline (§3.8 named exception); Vowels/Diphthongs notes inline.
- ch2: rules pages show interspersed collapsed accordions under their
  items; grammar pages show green underlined links opening modals;
  Identifying Verbs shows the termList layout.
- ch3/4/5: Voice/Person/Case/Inflectional Forms interspersed
  ("Examples" titles in ch4/5); drill hints are one modal with
  Paradigm/Endings in place; ch5 Review Definite Article restacked.
- ch6: unchanged visually except link-restyle exclusions verified;
  vocab drills four-up on tablet width.
- ch7: adjective paradigms toggle Singular/Plural on the say-all line;
  οὐ/οὐκ/οὐχ page shows three "Examples" accordions with tappable
  Greek inside; both hint revisions per W6.4/W6.5.
- ch8: Three Uses shows three "Examples" accordions; Third Person
  pair-nav pinned when tall; vocab drills responsive.
- ch9/10: no visible change except vocab drill width and the already-
  shipped hint toggles now centred when a state has no say-all.

## 5. Grading, RESULTS, and VERIFY

5.1 GRADER-PROMPT.md v2 governs; claims are audited against the BUILD
    diff. Downstream defect attribution applies.
5.2 RESULTS must include the standing data-edit report (0.3), the
    Say-Endings label observation (W5.2), and per-work-item wall
    times.
5.3 The visual checklist file lists every screen in section 4 plus the
    four model screens, one row each: route, what to look at, status
    (UNCHECKED / PASS / FAIL+note). It is the resume point after any
    window death.
5.4 VERIFY-DISCLOSURE.md (authored by the winning model after any
    XPATCH) asks Nathanael for JUDGEMENT only. Expected items: iPhone
    look of the accordion restyle; pinned rows against real WebKit
    (Chrome computed-style checks are inadequate); centred no-say
    toggle on the eimi hint; ch5 QR restack; ch1 Capitals Note reads
    well; Say Endings label keep/rename; airplane-mode pass.

## 6. Divergence-log entries this round (pipeline will apply; listed
      so RESULTS can cite them)

- D-31 amended: number-marker popups retired; οὐ/οὐκ/οὐχ is C2.
- D-38 amended: modal More/Back fixed to the footer; slot rule
  unchanged.
- New entry: DISCLOSURE-RULES adoption -- supersedes per-case
  disclosure decisions; nested modals abolished; Endings autoplay
  removed in favour of an explicit say button.

CONFIDENCE: 0.9 on the renderer work items (each traced to current
code); 0.85 on the data set (two pipeline amendments are new and
flagged in section 2).

KEY CAVEATS: the ch7 switch amendment and the ch9/10 poolKind patches
are pipeline-authored additions made at spec time -- Nathanael may
reject either before handing this spec to implementers; the Say
Endings label is deliberately left as a VERIFY decision.
