# 5D-SPEC2-RESULTS.md — cohort 5D round 2 handoff

Implementer: Opus 5 in Claude Code. Base: `0fb973a`. Nothing pushed;
the work sits in the working tree on `main`.

Companion: **5D-SPEC2-BUILD.md** (full diff + tool log + machine-check
output). Owed next: **VERIFY-5D2.md**.

Every section of 5D-SPEC2 is done. The delivered data files were
committed as delivered except for four formatting corrections the
visual verification found, all listed in §7 with before/after.

---

## 1. Headline

The round-1 failure mode was passing its own tests while shipping
misrendered pages. So this round's first deliverable is not a feature:
it is **two Playwright harnesses that drive the shipped UI**, and
between them they found four defects nobody had asked about — three of
them silent horizontal clipping in chapters 1 and 2, which have both
already passed a device pass.

- `npm run ui:walk` — opens all 64 rail stops across ch1/ch2/ch3 at
  320px and 768px, steps every topicPages topic, screenshots each
  screen, and dumps the rendered emphasis/list-marker/tap-target
  structure plus a horizontal-overflow measurement.
  Output: `buildout/screenshots/5d-spec2/` (128 stop screenshots +
  per-topic screenshots + `walk-report.json`).
- `npm run ui:behavior` — 36 assertions typed and clicked through the
  real UI, including the whole A4 and A6 checking-policy tables that
  round 1's VERIFY asked Nathanael to hand-type. **36/36 pass.**
  Output: `buildout/screenshots/5d-spec2/behavior-report.txt`.

`playwright-core` is now a real devDependency (`^1.62.1`), as the spec
required.

---

## 2. §2 Movable nu — REVERTED (D-16 withdrawn)

`foldMovableNu` and the `movableNu` option are gone from
`src/lib/answer-check.js`; both spellers stopped passing the flag. A
final nu is now compared like any other letter under both toggle
settings. The file carries the reason in a comment block so it cannot
be re-added as a "fix" later: the leniency covered a DERIVATION ERROR,
not a linguistic subtlety.

Verified by machine on the shipped UI (`ui:behavior`, all PASS):

| Item | Typed | With Accents | Expected | Result |
| --- | --- | --- | --- | --- |
| 3 `they loose` λύουσι | `λυουσι` | OFF | accepted | PASS |
| 3 `they loose` λύουσι | `λύουσι` | ON | accepted | PASS |
| 3 `they loose` λύουσι | `λυουσιν` | OFF | **rejected** | PASS |
| 25 `we believe` πιστεύομεν | `πιστευομε` | OFF | **rejected** | PASS |
| 25 `we believe` πιστεύομεν | `πιστευομεν` | OFF | accepted | PASS |

The delivered data already carries the authored `-ουσι` forms
(λύουσι, ἀκούουσι, λέγουσι, βλέπουσι, πιστεύουσι); nothing needed
changing there.

---

## 3. §3 Timing — retuned and swept

`ADVANCE_CORRECT_MS` = **2000**, `ADVANCE_INCORRECT_MS` = **4000**,
`HINT_VISIBLE_MS` = 7000 unchanged.

The sweep went further than removing the literals, because "no data
file carries its own advance duration" is only true until the next
regeneration otherwise:

1. Chapter 2's six `autoAdvanceMs` entries are deleted from
   `chapt-02.json` (five `4000` and one `null`).
2. `resolveAdvance()` **no longer reads `autoAdvanceMs` at all** — the
   per-activity override is gone from the resolver, not just from the
   data. The class mapping (`attemptsPerItem` / `autoAdvanceOnIncorrect`
   → retry / manualOnIncorrect / autoBoth) is untouched, so chapter 2's
   semantics are exactly as shipped; only its durations moved.
3. `scripts/check-content-shapes.mjs` now **fails the build** if any
   data file re-introduces `autoAdvanceMs`. Without this, a regenerated
   chapter-2 file would carry a field that silently does nothing.

Sweep evidence (full output in BUILD §2):

- Every `setTimeout` in an activity component resolves through
  `src/lib/timing.js`. The only numeric literal left in
  `src/components/` is `Settings.svelte:42`'s `1600` — the tap window
  for the diagnostics easter egg, not an advance duration.
- `grep -rn "autoAdvanceMs\|advanceMs\|delayMs" src/data/` → no matches.

Measured through the UI rather than read out of the module
(`ui:behavior`):

| Surface | Class | Outcome | Still there at | Advanced by |
| --- | --- | --- | --- | --- |
| ch2 Syllable Counting | `retry` | correct | 1100ms | 2800ms |
| ch3 Scripture Memory Drill | `autoBoth` | incorrect | 2200ms | 5600ms |

### Revisiting an item resets it

Implemented on all three scored components. `SelectActivity`,
`DivideActivity` and `PlaceAccentActivity` each kept a `results` Map
whose only purpose was to restore a finalized item on revisit; all
three Maps are deleted and their `restore()` functions now present the
item fresh — selection cleared, feedback cleared, options unlocked.

The score is not rewound: `attempts`/`correct` count attempts, and the
`attemptedItems`/`attemptedWords` Sets that drive completion are sets,
so answering an item twice neither double-counts completion nor
un-completes it. Machine-verified per chapter:

| Drill | Marked tiles before → after revisit | Feedback after | Score after |
| --- | --- | --- | --- |
| ch2 Accent Rule | 2 → 0 | empty | still 1 attempt |
| ch3 Verb Translating | 2 → 0 | empty | still 1 attempt |
| ch3 Vocabulary: Greek to English | 2 → 0 | empty | still 1 attempt |
| ch1 Vocabulary Spelling | typed text cleared | — | — |

**Chapter 1 has no scored select drill with a revisit path** — asserted,
not assumed: none of its six `select` activities exposes a
Previous/Next stepper, and all six are `retry` class (an item stays
open until answered correctly), so there is nothing to reset. Its
speller does step, and stepping back presents the word fresh.

`DivideActivity`'s Clear Answer button stays: it re-opens an item
without leaving it, which the revisit rule does not cover.

---

## 4. §4 spellVerse typing — all three defects fixed

The two typing defects were in code duplicated between the two
spellers, so the fix is a **shared input model** rather than two
patches: `src/lib/speller-input.js` (pure functions over
`{ text, caret, pendingMark }`, caret measured in grapheme clusters)
plus `src/components/SpellerField.svelte` (the tappable field). Both
`SpellActivity` and `SpellVerseActivity` now mount them.

**This widens the spec's scope from spellVerse to both spellers, on
purpose.** The shared keyboard exists (D-15) precisely so a chapter
cannot fork the typing surface; letting the two components keep private
copies of "what a keystroke does" is the same fork by another route,
and it is where these defects lived. Typing at the end of the buffer —
which is all the word speller did before — behaves identically.

1. **Cursor placement.** The field is not an `<input>` or a
   `contenteditable`: on the target iPhone either one summons the system
   keyboard over the tile keyboard. Instead each grapheme cluster is its
   own tappable span, and a tap puts the caret on the side of the
   cluster that was tapped; a tap past the end sends it to the end.
   Hardware Left/Right arrows are wired too (one line each), though the
   spec did not require them. Insert, backspace and mark-application all
   act **at the caret**.
   - `ui:behavior`: typing `λγει`, tapping between λ and γ, pressing `e`
     → `λεγει`. Backspace then → `λγει`. Both PASS.
2. **Breathing after a space no longer eats the space.** A diacritic
   with no letter before the caret is HELD (`pendingMark`) and applied
   to the next letter entered; whitespace and punctuation never take a
   mark and never consume one. The held mark renders at the caret in its
   spacing form, so it reads as queued rather than lost.
   - `ui:behavior`: `ο` + rough breathing, space, smooth breathing, `ι`
     → `ὁ ἰ`, space intact. PASS.
3. **The A6 checking-policy table, run under automation.** Typed
   through the app — bare letters on the keyboard, marks on the mark
   tiles, iota subscripts on the composite tiles, punctuation on the
   punctuation tiles:

| Case | With Accents | Expected | Result |
| --- | --- | --- | --- |
| verse with no accents or breathings | OFF | accepted | PASS |
| verse fully accented | ON | accepted | PASS |
| verse with no accents | ON | rejected | PASS |
| verse without its comma and raised dot | ON | accepted | PASS |
| lowercase where the verse capitalizes | either | accepted | PASS |

One honest note on the last row: it is **structurally guaranteed, not
merely observed**. The shared keyboard ships no capitals and no shift
layer, so the harness cannot type Ἰησοῦς any other way — which is the
whole argument for D-18 rather than a separate finding.

The policy DECISION in A6 (should "With Accents" ON also require the
raised dot and comma?) is still Nathanael's; nothing here presumes it.

---

## 5. §5 Layout corrections

- **Greek option grids: two-up below 768px, four-up at 768px and
  above.** Applied via a `greek-pool` class that `SelectActivity` sets
  only for a Greek option pool that is not already `wide`, `single` or
  `grouped` — i.e. exactly the ch1/ch2/ch3 English-to-Greek vocabulary
  drills. Machine-verified 2-up at 320px and 4-up at 768px on all three;
  ch1's letter grids stay four-up at both widths.
  **768px is a judgement call worth flagging:** the app's existing
  breakpoints are 560px (large phone) and 900px (sidebar), and neither
  is "the iPad". 768px is the iPad's portrait CSS width and the wide
  half of this round's 320/768 screenshot pair. If you meant 900px, it
  is a one-line change in `app.css`.
- **Parsing Drill divider** is now 2px dark green (`--teal-dark`) on
  both axes, verified by computed style.
- **Objectives lists keep "1. 2. 3."** — confirmed by computed
  `list-style-type: decimal` on all three chapters, and pinned with an
  `.objectives-list` class so a later global list rule cannot convert
  them to the "1) 2) 3)" house style.
- Teaching lists keep "1) 2) 3)" and citations stay flush left; no
  change was needed.

---

## 6. §6 New renderer support

- **`[[g]]…[[/g]]` → dark green inline span.** `splitUnderline` in
  `lib/markup.js` now handles both markers through one regex, and
  `Marked.svelte` renders `<span class="term-green">`. Colour is
  `--accent-ink`, never `--link` — blue means tappable and only
  tappable (directive 8).
- **`labelStyle` on numbered lists.** `"underline"` renders the label
  underlined inline ahead of the text (the original's blue hotwords,
  deliberately NOT tappable — their popups are the expander cards
  below). `"plain"` renders it bold without an underline. Absent keeps
  the chapters-1/2/intro form (underlined lead + " — "), so nothing
  already device-verified moves.
  The joiner between label and text is the **item text's own opening
  punctuation**, not a renderer guess: `"—simply states…"` joins tight,
  `":  subject does…"` joins tight, `"is the person(s)…"` takes one
  space. A label style never invents a colon the data does not have.
- **`para` blocks with `emphasis: "strong"` and/or `indent: true`.**
- **`greekTaps` on `para` blocks**, declared once per activity and
  inherited by every topic and nested expander (a topic or block may
  override). λύουσιν and λύουσι in Movable Nu and λύω in Parsing Format
  are tappable and play; the "Stem + Pronominal ending — λύ + ω"
  morphemes are not, as specified.

One deliberate change to an existing rule, flagged for your call:
**a `greekTaps` key now marks EVERY standalone occurrence, not just the
first.** Parsing Format prints λύω twice; marking only the first left
one blue-and-speaking and the other black-and-silent, which reads as
"that one is not tappable" when it is the same word. The only other
`greekTaps` in the app is chapter 1's single ζ, which occurs once, so
nothing shipped changes shape.

---

## 7. Data edits made under the §0 visual-verification authorization

Four, all in `chapt-03.json`, all from comparing the built pages against
the DOSBox screenshots. The pipeline should absorb these, because a hand
edit is lost at the next regen.

**7.1 — Voice list: the colon after each underlined term.**
The original prints "1) Active voice:  subject does the action of the
verb." Round-2 data had no colon anywhere, and the renderer must not
invent one.

```
- "label": "Active voice",  "text": "subject does the action of the verb."
+ "label": "Active voice",  "text": ":  subject does the action of the verb."
```
(same for Passive voice and Middle voice)

**7.2 — Learn Verbs → Translation: colon, and NOT underlined.**
The original prints "1) Undefined action:  I loose, I run" with the term
in bold, not underlined. With no `labelStyle` the block was falling
through to the chapters-1/2 default and rendering the term underlined
with an em dash.

```
- "items": [ { "label": "Undefined action", "text": "I loose, I run" }, … ]
+ "items": [ { "label": "Undefined action", "text": ":  I loose, I run" }, … ],
+ "labelStyle": "plain"
```

**7.3 — Person example popups: the pronouns are underlined.**
RECON D3 (page 4) underlines the pronoun in all six example lines;
round 1 shipped them flat. This is the same class of miss as the
`[[u]]` runs the pipeline now recovers, in the expander content rather
than the topic body.

```
- "I studied Greek.\nWe studied Greek."
+ "[[u]]I[[/u]] studied Greek.\n[[u]]We[[/u]] studied Greek."
- "You studied Greek.\nYou both studied Greek."
+ "[[u]]You[[/u]] studied Greek.\n[[u]]You[[/u]] both studied Greek."
- "She studied Greek.\nThey studied Greek."
+ "[[u]]She[[/u]] studied Greek.\n[[u]]They[[/u]] studied Greek."
```

**7.4 — Movable Nu example line is indented in the original.**

```
  { "type": "para", "text": "λύουσιν instead of λύουσι"
+   , "indent": true }
```

Chapter 2's data change (§3, the `autoAdvanceMs` removal) is a spec
instruction, not a visual-verification edit, but it is a data edit and
is listed here for completeness.

---

## 8. Defects the harness found that the spec did not ask about

All four are silent horizontal clipping — content overrunning its
container where `overflow-x` is hidden app-wide, so nothing scrolls and
nothing errors. Three are in chapters 1 and 2, which have already passed
device passes. Fixed, and each carries its measurement in a comment.

| Where | Measured at 320px | Symptom | Fix |
| --- | --- | --- | --- |
| Quick Review vocabulary chart (ch1, ch2, ch3) | Greek 115–123px in a 102px column | the Greek word **overprinted its gloss** — "ἀπόστολος" across "apostle," | Greek column 42% → 46%, one type size down below 360px, `min-width: 0` + break-word as the backstop |
| Same chart | — | frequency read "but, yet(638)" with no space | the space was inside an `{#if}` and Svelte trimmed it; now a `margin-left` on `.rv-freq` |
| Option grids (ch1 Letter-to-Name, ch2 Greek-to-English) | 281px and 263px of grid in a 260px card | right-hand column clipped | `repeat(n, 1fr)` → `repeat(n, minmax(0, 1fr))`; a bare `1fr` floors at min-content. Tiles wrap instead |
| Definition rows inside ch2's grammar-review expanders | 249px in a 232px row | row overran the card; the term track ate the row | term track capped at 45%, value track `minmax(0, 1fr)` |
| Long Greek drill prompt (πιστεύουσι) | 268px in a 260px card | prompt tail lost | prompts over 7 clusters drop 3rem → 2.2rem. **The red-mark branch is deliberately untouched** — its offsets are em-relative and correct, and no mark geometry moves this round |

One more, cosmetic, found in the same sweep and fixed while rewriting
the field: the caret span contained a literal `|` inside a 2px-wide box,
so it painted a second ink-coloured pipe beside the teal bar — and it
occupied the space the tappable caret now needs. It is now an empty 2px
bar with its own height.

**One measured overrun is left, deliberately:** `c2_learn_marks` at
320px, a Greek chart word 2px wider than its cell (107 vs 105). That is
sub-glyph and invisible; the fixes that would close it (breaking Greek
words mid-cluster) are worse than the symptom.

---

## 9. Build numbers

| | Base `0fb973a` | This round |
| --- | --- | --- |
| `chapt-01` chunk | `chapt-01-8ZoFoXk9.js` 35.39 kB | **`chapt-01-8ZoFoXk9.js` 35.39 kB — unchanged** |
| `chapt-02` chunk | `chapt-02-B6HjUK2Y.js` 56.57 kB | `chapt-02-CFgjCaAb.js` 56.46 kB |
| `chapt-03` chunk | `chapt-03-D7Jq1Xdp.js` 38.40 kB | `chapt-03-CPP2o90H.js` 38.51 kB |
| lexicon chunks (all three) | — | unchanged |
| `index.js` | 278.76 kB / 81.41 kB gz | 285.75 kB / 82.86 kB gz |
| `index.css` | 33.54 kB | 34.35 kB |
| precache | 23 entries, 553.98 KiB | 23 entries, **561.60 KiB (+7.62 KiB)** |

Chapter 1's chunk hash is byte-identical, as it must be: `chapt-01.json`
was not touched. Chapters 2 and 3 rehash because their data changed
(§3 and §7). `check:shapes` and `check:lazy-chunk` both green.

The +7.6 KiB is the shared speller input model, the tappable field and
the new CSS. Nothing was added to the audio path or the app-load path.

---

## 10. What is left for the device pass (VERIFY-5D2)

Facts are settled; these are the judgement calls:

1. **Does 2000/4000 feel right on device?** The values are measured
   correct; whether they read as the original's pace is yours.
2. **Does the revisit-reset feel right** where a wrong answer used to
   stay on screen as a record of the miss?
3. **Is 768px the iPad breakpoint you meant** for the four-up Greek
   grids (see §5), or 900px?
4. **The A6 policy decision** — should "With Accents" ON require the
   raised dot and comma? Untouched pending your call.
5. **Tap-to-position hit targets.** A grapheme cluster at 1.35rem is a
   ~14px-wide target. It is precise on a mouse; whether it is usable
   with a thumb on a fourteen-word verse is a device question.
6. **Should a `greekTaps` word be tappable at every occurrence** (§6)?
   Shipped that way; trivially reversible.
7. **Airplane-mode ch3 walk**, which no harness can do.
8. Real WebKit audio on the pist* clips and the paradigm cells.

Everything else in the spec's §8 evidence list is in
`buildout/screenshots/5d-spec2/` and in 5D-SPEC2-BUILD.md.
