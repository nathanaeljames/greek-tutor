# 5D-SPEC-RESULTS-OPUS.md — Chapter 3 (Present Active Verbs), round 1

Model: Opus 5 in Claude Code. Date: 2026-07-28.
Spec: buildout/5D-SPEC.md. Base: main @ 281774a ("phase 5d spec").
Companion: 5D-SPEC-BUILD-OPUS.md (full diff + tool log + wall clock).

Data files (src/data/chapt-03.json, src/data/lexicon-chapt03.json) were
committed AS DELIVERED and never edited. Two shipped-data observations
that need Fable rather than a code change are listed under "For Fable"
at the end.

---

## Phase 0 — KEYBOARD CHECKPOINT (asked, answered, implemented)

### 1. Required-key research

A script walked every typing surface in chapters 1-3, segmented each
answer into grapheme clusters, and compared them against what the
39-tile keyboard can actually produce (25 letters + 3 composites, plus
every letter x diacritic combination the `apply` sequences can build).

| Key | Codepoint | Required by |
| --- | --- | --- |
| SPACE | U+0020 | c3_ex_scripture_speller (14-word verse); ch6 "Spell Greek Phrase" (5C recon §5) |
| `,` | U+002C | ch3 verse — `Ἰησοῦς,` |
| `·` | U+00B7 | ch3 verse — `ζωή·` |
| `Ἰ` | U+1F38 | ch3 verse AND c3_ex_vocab_speller (`Ἰησοῦς` is a ch3 lemma) |
| `Ἐ` | U+1F18 | ch3 verse — `Ἐγώ` |
| `Χ` | U+03A7 | **c1_ex_speller — already shipped** (`Χριστός`) |
| `Π` `Φ` | U+03A0 / U+03A6 | **c2_ex_speller — already shipped** |

The last three are the finding that changed the recommendation. The
capitals are not a chapter-3 problem: chapters 1 and 2 have shipped
words whose capitals no tile can type since their cohorts. With "With
Accents" OFF the old checker lowercased, so those items passed; with it
ON the comparison was exact NFC and those items were **unwinnable**,
silently, on device-verified surfaces. Nothing in the app said so.

Near-future survey (5C-RECON-FINDINGS): chapters 4-8 each add a
Scripture Memory verse (Jn 14:6b, Rom 3:23, Jn 1:1, Rom 6:23a) — same
space/comma family plus **period**; ch6 adds the Spell Greek Phrase
variant (space again) and teaches elision, which may later want `᾽`
U+1FBD. The Greek question mark is plausible but unattested in those
four verses; it was included because it costs one key now and a
keyboard revision later.

### 2-3. Proposal and Nathanael's selections

Three layouts and three checking policies were put to Nathanael with
320px wireframes. His selections:

- **Layout A** — one added bottom row: four punctuation keys + a space
  bar. Everything stays visible; no paging, because a learner who never
  opens a "punctuation" page never discovers that a space key exists.
- **Checking: marks exact under ON, case and punctuation lenient under
  both.** No shift layer.

Logged as D-15 (resolved) and D-18 in DIVERGENCE-LOG.md.

### 4. As built

`src/data/speller-tiles.json` gains a `punctuation` array and a `space`
entry — 44 tiles now. The keyboard moved into a shared component,
`SpellerKeyboard.svelte`, mounted by both spellers.

One thing the spec's "one keyboard, no per-chapter forks" required that
was not obvious from the data: **chapter 1's activity carries its own
inline `spellerTiles` copy** of the 39 tiles, and `SpellActivity` read
`activity.spellerTiles` FIRST. Shipping the new row in the shared file
alone would have left chapter 1 on the old keyboard. The component now
reads the shared contract in preference to any inline copy, which is a
component change, not a data edit; the inline copy remains only as a
fallback if the shared file is ever unreachable. Verified on device-
equivalent: the chapter-1 speller shows the punctuation row and space
bar (screenshot `keyboard-chapter1-320.png`).

At 320px the four 44px punctuation keys leave only 64px for the space
bar, which is a space bar in name only. Its flex-basis is 140px, so it
takes the remainder of the row where there is room and wraps to a
full-width row of its own where there is not.

---

## Phase 1 — registrations

All six registered; `npm run check:shapes` learns each and fails loudly
on unknowns.

1. **`paradigm` RichContent block** — `src/components/Paradigm.svelte`.
   One renderer, three hosts (Learn topic block, `paradigmChart` page,
   drill Hint popup); nothing is keyed to an activity id. Numbered
   person column, Singular/Plural columns, Greek cell over its gloss,
   Say Whole Paradigm and Endings INSIDE the chart frame. Every Greek
   cell and the lemma are tappable and play their own clip. Endings
   opens a modal AND plays `chapt_3_c_ending` behind the tap (D-10).
2. **`paradigmChart` contentAudio mode** — full-page render, chart
   title above, reuses the block renderer. No Endings button when the
   data omits the block (verified: the QR page has none).
3. **`interlinearVerse` contentAudio mode** — words wrap as whole
   units so a Greek word never parts company with its gloss; each word
   plays its `c_sm` clip; the gloss-less article (`ὁ`) renders, holds
   its column open and still plays; Say Whole Verse; reference
   right-aligned at the end.
4. **`spellVerse` activity type** — `SpellVerseActivity.svelte`.
   Free-typed whole verse, word-by-word on Check Answer, Major Hint
   always available (D-11), "Restart Exercise" (D-12), With Accents
   checkbox on the Phase 0 policy, and feedback that names the first
   wrong/missing WORD (D-13): *"The word you missed was: ὁ"*.
5. **select extensions** — per-item `optionValues`/`options` (item-level
   first, activity-level fallback), `optionsAreGreek`, `optionGroups`,
   `translate` on items. Plus two the ch3 data needs that the spec did
   not enumerate: activity-level `promptIsGreek` (the ch3 drills have no
   `promptFrom`, so the Greek-tap side is declared on the activity), and
   the `pool` convention — ch3's vocabulary surfaces name a lexicon
   bucket + the chapter's `vocab` refs instead of spelling out ten
   `{ref}` items. Both are in `content.js`, data-driven, no id cases.
6. **`advanceClass` + two shared constants** — `src/lib/timing.js`
   exports `ADVANCE_CORRECT_MS = 900`, `ADVANCE_INCORRECT_MS = 2500`
   and `resolveAdvance(answerPolicy)`. No component file contains a
   timing number any more: Select, Spell, Divide and PlaceAccent all
   read the module. Chapter 2's older
   `attemptsPerItem`/`autoAdvanceMs`/`autoAdvanceOnIncorrect` triple
   maps onto the same three classes and an explicit `autoAdvanceMs`
   still wins, so ch2's shipped ~4s feel is byte-for-byte unchanged.

Two more shared modules fell out of the work:
`src/lib/answer-check.js` (the one spelling policy, used by both
spellers so they cannot drift) and `src/components/SpellerKeyboard.svelte`.

---

## Phase 2 — build list

All 18 chapter-3 stops build and render. Nothing was stubbed.

**Learn** — objectives (as delivered, `_objectives_verify` wording
untouched); english_concepts and verbs on the existing `topicPages`
renderer with the new paradigm block and `expander` blocks for the
Voice/Person/Historical Present popups (`\n` line breaks preserved);
vocab flashcard; scripture on `interlinearVerse`; bibliography.

**Drill** — verb_translating (6 per-item options, 2x3, Translate
reveal, Hint opens the λύω paradigm as a modal via `ui.hintRef`);
greek_verb (English prompt + citation, 3 Greek options stacked, answer
audio on correct and on Pronounce); parsing (6 static options in [3,3]
groups); both vocab drills over the 10 lemmas; scripture_memory (10
static options, 2x5, `autoBoth`).

**Exercise** — verb_speller and vocab_speller on the existing spell
component (inline `{gloss, greek, audio}` items now supported alongside
`{ref}`); scripture_speller on the new `spellVerse`.

**Quick Review** — vocab (reviewVocab + playAll), paradigm
(paradigmChart), scripture (interlinearVerse).

Sequence as delivered, 18 stops; end-of-chapter dialog on the final
Next; chapter registers in the lazy chunk glob.

---

## Tests and evidence

Driven on the real built app in headless Chromium (playwright-core
installed in the scratchpad, not added to package.json — the carried
nit stands).

**Rail walks** — 64 activities (ch1 26 + ch2 20 + ch3 18) at 320px and
at 768px, online: every stop renders a card, **zero console errors,
zero console warnings**, and zero horizontal overflow after the fix
below.

**Airplane-equivalent** — service worker warmed, network cut, then a
COLD DOCUMENT load while offline: TOC renders 33 entries, all 64
activities render, 0 blank or errored. Every failed request in the
offline run is an `/audio/*.m4a` fetch (0 non-audio failures) — the
documented preview artifact: the preview ships no audio bytes and a
fresh browser profile has an empty IndexedDB.

**Behavioural suite — 49/49 pass**, console clean. Covers: paradigm
renders/blue cells/buttons in frame; Endings modal 3 rows, endings in
ink not blue, Escape closes; paradigmChart 6 cells with no Endings
button and the right chart title; interlinearVerse 14 words, gloss-less
article tappable, right-aligned reference; VTD 6 options in 2 columns,
citation printed, Translate reveals the item string, Hint opens the
paradigm as a modal, Escape closes; `manualOnIncorrect` proven — no
auto-advance after a wrong answer, "Click Next to continue" shown,
options locked; GVD 3 stacked Greek-face options with an English
prompt; parsing two groups of 3, visibly separated; SM drill 10 options
in 2 columns and `autoBoth` auto-advance observed on the longer wait;
the shared keyboard present on a CHAPTER 1 speller with 25 letters
intact, a >140px space bar and 44px punctuation targets; **ch1's
Χριστός now passes with "With Accents" ON**; spellVerse reference,
D-11/D-12/D-13 all confirmed, the unaccented verse accepted with
accents off and rejected with accents on; movable nu — `λύουσι`
accepted for `λύουσιν` (D-16).

**320px screenshots** — `buildout/screenshots/5D/`:
`paradigm-learn`, `paradigm-endings`, `paradigm-quickreview`,
`interlinear-verse`, `parsing-option-groups`, `sm-drill-grid`,
`keyboard-spellverse`, `keyboard-chapter1`, `hint-paradigm-modal`,
`verb-speller`, `verb-speller-keyboard`.

**check:shapes** — green, and taught five new things: the `paradigm`
block and `spellVerse` type; that paradigm rows must match their column
count; that spellVerse answerWords must be single whitespace-free
words; that every `contentAudio` mode has a branch (an unknown one used
to fall through to the generic chart and render a grid of nothing);
and **that every spelling answer is typeable on the shared keyboard**,
folded exactly as the checker folds. That last check is the build-time
twin of the Phase 0 finding — negative-tested by removing tiles, which
correctly fails.

**Build** — `npm run verify` green.
Precache **21 entries / 479.92 KiB -> 23 entries / 553.43 KiB**
(+2 entries, +73.51 KiB: the ch3 chunk 38.50 KiB + lexicon 1.94 KiB,
the rest the shared-component growth in index/css).
**ch1 and ch2 chunk hashes UNCHANGED**: `chapt-01-8ZoFoXk9.js`,
`lexicon-chapt01-DWCL8L3K.js`, `chapt-02-B6HjUK2Y.js`,
`lexicon-chapt02-DMecEUSp.js`. New: `chapt-03-DCLxQLAM.js` +
`lexicon-chapt03-DU3wQSch.js`.

**Spot-play wiring** — the preview has no audio bytes, so "did it play"
is not observable; WHICH clip each tap resolves to is, and that is what
breaks. Every tap below was driven on the real UI with the audio route
aborted (so IndexedDB caching could not hide a second tap), and each
resolved path was checked against the shipped pack on disk. All present:

- paradigm cells 1-6 -> `c_luw, c_luomen, c_lueis, c_luete, c_luei, c_luousi`; lemma -> `c_luw`
- Say Whole Paradigm -> `c_paipar`; Endings -> `c_ending` (D-10 restoration firing)
- sm words 1 / 4 / 14 -> `c_sm1, c_sm4, c_sm14`; Say Whole Verse -> `c_sm14_6`
- Say Whole List -> `c_vocl3`; QR paradigm cell -> `c_luw`
- VTD, one per verb family -> `c_luousn, c_akouw, c_legw, c_blepou, c_piseis`

---

## Deviations and judgment calls (all deliberate, all listed)

1. **Shared keyboard beats the inline copy** (above). A component
   change was the only way to satisfy "chapters 1-3 included, one
   keyboard, no per-chapter forks" without editing chapter-1 data.
2. **Movable-nu leniency is scoped to `-σι(ν)`, not `-ε(ν)`.** D-16
   authorizes "3rd-plural forms with or without final nu", and every
   `_verify`-flagged item in the data is `-ουσιν`. The chapter text
   also mentions words ending in ε, but a blanket `-ε(ν)` fold swallows
   the real 1st-plural ending — `λύομεν` would collapse to `λύομε` and
   the exercise would accept a genuinely wrong form. Verified against
   the lexicons: `λύομεν`, `ἦλθεν` and `κατέλαβεν` all sit in the
   collision set a broad rule would have hit.
3. **Duplicate "Paradigm" heading suppressed.** The Learn topic is
   titled "Paradigm" and so is its chart block, so the word printed
   twice. `RichContent` takes a `suppressTitle` prop from the host and
   the chart drops a title that repeats the heading above it — the same
   principle as the existing `dedupeExpanders`, and no data edit.
4. **Parsing `optionGroups` stack vertically on the phone.** Six
   46-character parsing labels cannot share 320px in two columns. The
   groups are two visibly separated blocks at phone width (divider
   between them) and sit side by side from 560px, which is the
   original's arrangement.
5. **`wide` option grids tightened from `longest <= 8` to `<= 3`.**
   Needed for the SM drill's 2x5 grid. Audited against every shipped
   option set: only ch2's syllable-counting numbers ever qualified
   under the old rule, and they still do.
6. **D-19, a pre-existing 320px clipping bug, fixed.** All three
   English-to-Greek vocabulary drills (ch1, ch2 AND ch3) put ten
   polytonic words in a four-column grid, overflowing by 26-33px;
   `overflow-x` is hidden app-wide, so the longest words were being
   cut off in silence. I confirmed it predates this cohort — the
   governing expression is identical at HEAD (`git show
   HEAD:src/components/SelectActivity.svelte`, lines 73-74, 238) —
   before touching it, so this is not a regression I introduced. I
   fixed it anyway because one of the three surfaces is a chapter-3
   page I am delivering and the spec requires new charts to pass
   320px. Greek option pools are now two-up; the 24-letter grids keep
   four columns because their generator declares `wide` explicitly.
   Flagged for VERIFY-5D since it changes two device-verified pages.
7. **Escape + initial focus added to the three NEW modals** (Endings,
   Hint, keyboard reference). The carried nit for the older modals is
   untouched.
8. **`manualOnIncorrect` on the final item.** A wrong answer on the
   last item of a one-attempt drill leaves the drill sitting on the
   revealed answer rather than reaching the "Finished!" screen; the
   activity is already marked complete and the sequential rail is live.
   This is ch2's existing behavior on its `autoAdvanceOnIncorrect:
   false` drill, which passed VERIFY-5B, so I kept parity rather than
   inventing a "Finish" affordance.

## For Fable (data-side, not edited by me)

- `chapt-03.json` exercise[0] item 27 gloss reads **"he/she believess
  believes"** (a doubled word). Rendered as delivered.
- `chapt-01.json` `c1_ex_speller` carries an inline `spellerTiles`
  duplicate of the shared 39 tiles. It is now inert — the component
  prefers the shared contract — but it is dead data that will confuse
  the next reader, and a pipeline pass could drop it in favour of
  `spellerTilesRef: "chapt_1"`, which is what ch2 and ch3 already use.

## AMENDMENT 1 (2026-07-29) — blank numbered lists on device: a RENDERER
## bug, not a pipeline failure

Nathanael's device pass caught four teaching lists rendering as bare
numbers over empty lines: **Learn English Concepts / Voice, Mood and
Person, and Learn Verbs / Translation**. Screenshots show "1. 2. 3."
with nothing after them.

His first read was that the rich-text extraction had missed the text.
It had not. **The text is in the delivered data, complete and
verbatim** — for example `chapt-03.json` learn[1].topics[2].content[1]:

```
"Active voice:  subject does the action of the verb."
"Passive voice:  subject receives the action of the verb."
"Middle voice:  where the subject acts on him/herself (reflexive) or ..."
```

The defect is mine, in `RichContent.svelte`.

**Root cause.** A `numbered` item comes in two shapes. Chapters 1-2 and
the intro ship objects — `{ label, text }` — and chapter 3 ships **bare
strings**. The renderer only ever read `it.label` and `it.text`, so a
string item produced an `<li>` with the `<ol>` marker and no content.
Valid JSON, registered block type, no console error, and a card that
renders — so the 320px/768px rail walks, which assert "a card
rendered, zero console errors", passed straight over it. This is the
chapter-2 biblist lesson repeating in a new block type (object items
rendered `[object Object]` there; string items render *nothing* here),
and I did not generalize that lesson when I read the chapter-3 data.

**Fix (code only — no data edited).**
1. `RichContent.svelte` gains `listItems(block)`, which normalizes a
   string item to `{ text }` before the `numbered` branch iterates. Same
   remedy as `dedupeExpanders` and `suppressTitle`: the data is not ours
   to edit, so the renderer absorbs the shape.
2. `scripts/check-content-shapes.mjs` gains a `numbered` rule — every
   item must be a non-empty string, or an object with a non-empty label
   or text. Negative-tested by injecting `""` and `{label: null}` into a
   scratch copy of chapt-03.json; both were caught with their exact
   paths. Green on the real data.

**Verified** by SSR-rendering the real `RichContent` against the real
blocks (temporary vite `--ssr` probe, removed after the run): all four
chapter-3 lists now print 3/3/3/2 items with text, and both chapter-1
object forms (labelled and unlabelled) plus chapter-2's authored "1)"
labels are byte-for-byte unaffected. `npm run verify` green; precache
23 entries / 553.51 KiB (+0.08 KiB, index CSS/JS only, no new entries);
**all three chapter chunk hashes unchanged** — `chapt-01-8ZoFoXk9.js`,
`chapt-02-B6HjUK2Y.js`, `chapt-03-DCLxQLAM.js` — confirming no data file
was touched.

**Process lesson for the grading/next round.** My behavioural suite
asserted structure (option counts, modal rows, advance timing) and my
rail walks asserted "renders + no console errors". Neither asserts that
authored TEXT reaches the screen. A walk that diffs rendered text
against the source strings would have caught this in Phase 2; the new
check:shapes rule is the cheap build-time substitute, but the coverage
gap is real and worth a spec line next round.

### Two genuine pipeline observations for Fable (data-side, not edited)

Both are fidelity nits, NOT the cause of the blank lists:

1. **Chapter 3 emits `numbered` items as bare strings; chapters 1-2 and
   the intro emit `{ label, text }`.** The renderer now accepts both,
   but the object form carries more: it is what drives the run-in lead
   ("Formative Period — This period extended...") and the authored-label
   path. Standardizing the assembler on `{ label, text }` would let
   chapter 3's lists read like chapter 1's.
2. **The original underlines the list lead-ins and the port does not.**
   In DOSBox, "Active voice", "Passive voice", "Middle voice",
   "Indicative mood", "First person" etc. are underlined blue hotwords
   that open the green Examples popups. Chapter 3's strings carry no
   `[[u]]` markup (ch2 uses it 22 times), so the emphasis is lost. The
   popups themselves DID port — they are the `expander` blocks under
   each list — so this is typography and the implicit list-to-expander
   linkage, not missing content. Worth checking whether
   `tbk_richtext.py` dropped the underline spans on these records or
   whether the assembler discarded them.
3. Minor, same family: the original numbers these lists "1) 2) 3)";
   bare strings get the browser's "1. 2. 3.". Chapters 1-2 preserve the
   original's punctuation through authored labels.

## Carried into VERIFY-5D

1. The five `pist*` audio clips — listen-check (D16 conflict). Wiring
   is per the delivered data; `c_pisete` etc. resolve correctly.
2. Objectives page wording (`_objectives_verify`).
3. D-10 keep/drop — the Endings button now plays `c_ending`.
4. D-16 keep/drop — movable nu, as scoped in deviation 2 above.
5. D-14 — ratify or retune 900 / 2500ms.
6. D-18 — the checking policy as felt on device, especially whether
   "With Accents" ON should also require the raised dot.
7. D-19 — the two-column English-to-Greek grids on ch1 and ch2.
8. The four numbered lists fixed in AMENDMENT 1 — re-check on device
   that Voice, Mood, Person and Translation now print their text.
