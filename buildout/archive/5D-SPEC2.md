# 5D-SPEC2.md — Cohort 5D round 2: VERIFY-5D corrections

Date: 2026-07-28. Base: the 5D round-1 tree (chapter 3 shipped, device
pass returned). Companion documents: **VERIFY-5D-RESULTS** (Nathanael's
answers) and **5D-RECON-RESULTS.pdf + VERIFY-5D-RESPONSE2.pdf** (the
DOSBox screenshots) — the screenshots ride WITH this spec and are the
fidelity reference. Where the spec and a screenshot disagree, the spec
wins; where the spec is silent, the screenshot governs.

Deliverables: 5D-SPEC2-RESULTS.md + 5D-SPEC2-BUILD.md, then VERIFY-5D2.

Data files are DELIVERED WITH THIS SPEC and already carry every data
correction below — commit them as-is: `src/data/chapt-03.json`,
`src/data/lexicon-chapt03.json`, plus the revised
`scripts/assemble_ch3.py` (pipeline provenance, not a build input).
The data changes are described in §1 so the renderer work is legible;
do not re-derive them.

## 0. VISUAL VERIFICATION — process change, applies from this round on

This is the round's most important instruction, because round 1 passed
its own tests while shipping four teaching pages with flattened
formatting.

**Load every page you build in a real browser, screenshot it, and
compare it side by side against the corresponding DOSBox screenshot.**
Asserting that a string exists in the JSON is not verification — every
round-1 defect was present-but-misrendered. Compare specifically:
line breaks and indentation inside example panels; underline and other
emphasis; list markers and hanging indents; citation alignment; which
words are tappable; chart alignment.

`playwright-core` becomes a real devDependency this round (three
rounds have installed it from a scratchpad). Drive the UI with it:
navigate, click, type, screenshot. Everything in the VERIFY document
that a script can settle MUST be settled by a script before it reaches
Nathanael — his time is for judgement calls (does this timing feel
right, does this layout read well, does this clip say the right word),
not for facts a machine can check. Round 1's VERIFY asked him to
confirm 40+ items a click-through could have confirmed.

**You are now authorized to edit `src/data/*.json`** when visual
verification finds obviously missing formatting or text. This is a
standing exception to the implementers-never-edit-data rule. Report
every such edit in RESULTS with before/after so the pipeline can
absorb it.

## 1. What changed in the delivered data (context, no action)

Three root-cause pipeline fixes, all in `assemble_ch3.py`:

- **Length-prefixed field reads.** Fields are read via their `u16`
  length prefix instead of by scanning printable regions, which had
  been overrunning into the next record. This alone fixed F1
  ("he/she believess believes" → "he/she believes"), F2 ("they believe
  pt" → "they believe") and the πιστεύω gloss.
- **Objectives extracted, not authored.** Round 1 invented chapter 3's
  four objective lines. The real ones were in the TBK at 0x8f7c4. Now
  extracted verbatim; the assembler stops rather than compose prose.
  Chapters 1 and 2 were re-checked and are verbatim — no action there.
- **Rich-text underlines wired.** `assemble_ch3.py` now imports
  `tbk_richtext.py`, anchors the per-file format ids and emits `[[u]]`
  markup; fields with no run table use a transcribed fallback table.

Data-side content changes you will see: objectives replaced; `[[u]]`
markup throughout English Concepts and Learn Verbs; new `[[g]]` markup
for green descriptive terms; numbered lists now `{label, text}` objects
with `labelStyle: "underline"`; `emphasis: "strong"` + `indent: true`
on the Stem + Pronominal ending line; `\n` breaks in the Parsing Format
example; speller 3rd-plural forms are now `-ουσι` (see §2).

## 2. Movable nu — REVERT (D-16 withdrawn)

Remove the movable-nu leniency from the spelling checker entirely.
There is no special-casing of final nu; answers are compared exactly
(subject to the accent and case policy in §4).

Rationale, so it is not re-introduced: the leniency existed to cover a
DERIVATION ERROR, not a linguistic subtlety. Round 1 derived λύουσιν
for the speller; the original authors λύουσι. Recovered from the
original's own OpenScript answer tables: item 3 `lu<ousi`, item 15
`le<gousi`, item 24 `pisteuousi` — no nu, one authored answer each.
The delivered data now carries the authored forms, and the assembler
fails if a derived form disagrees with a recovered one. Movable nu is
real Greek and the chapter teaches it, but it is a per-word authored
choice, not a checker rule.

## 3. Timing — retune and sweep retroactively (D-14 ratified at new values)

- `ADVANCE_CORRECT_MS` = **2000** (was 900)
- `ADVANCE_INCORRECT_MS` = **4000** (was 2500)
- `HINT_VISIBLE_MS` = 7000 (ratified, unchanged)

Sweep every chapter onto these constants: chapter 2's per-activity
`autoAdvanceMs: 4000` literals and any 900ms component defaults are
removed in favour of the shared values. After this round no component
and no data file carries its own advance duration — grep for numeric
timeouts in activity components and report the result.

**Revisiting an item resets it.** New requirement, matching the
original: navigating BACK to an already-answered item must present it
fresh — selection cleared, feedback cleared, options unlocked, the
student may answer again. Currently the port shows the previous answer
and its styling. The recorded score for that item stands (the score
counts attempts). Applies to every scored surface in every chapter.

The full catalogue of classes, timings, and departures is in
**DRILL-MATRIX.md**, delivered with this spec and now canonical. A new
drill is assigned to an existing class; it does not get its own rule.

## 4. spellVerse typing — three defects (VERIFY-5D A6)

These blocked Nathanael from testing the checking policy at all.

1. **Cursor placement.** Tapping inside the typed text must place the
   cursor there. Currently entry is append-only, so a mistake in word
   one costs the whole verse. Arrow keys are not required; tap-to-
   position is.
2. **Breathing mark after a space eats the space.** Typing `ὁ` then
   space then `Ἰ`-with-smooth-breathing collapses the space: the mark
   is being applied as a combining mark to the preceding character
   across the space boundary. A breathing typed at the start of a word
   must attach to the NEXT letter entered, not the previous character,
   and must never consume whitespace. (This is the spacing-vs-
   combining lesson from chapter 2, resurfacing in the input path.)
3. Re-run the A6 checking-policy table under automation once 1 and 2
   are fixed, and report the results rather than sending Nathanael
   back to type them by hand.

## 5. Layout corrections

- **Greek option grids: four columns at the iPad breakpoint and above,
  two columns below** (D-19 amended). Applies to every Greek-to-English
  and English-to-Greek vocabulary drill in ch1, ch2 and ch3. Letter
  grids stay four-up at all widths.
- **Parsing Drill divider** between the singular and plural groups
  renders in dark green, to distinguish it from the card borders.
- **Objectives lists keep "1. 2. 3."** in every chapter. The "1) 2) 3)"
  house style (D-20) is for teaching lists only — confirm the
  objectives pages did not pick it up.
- Keep, as ratified: "1) 2) 3)" on teaching lists and flush-left
  citations, in ch1 and ch2 as well as ch3.

## 6. New renderer support

- `[[g]]…[[/g]]` → dark green inline span. Used where a descriptive
  term shares a line with its example ("Come here. — command"). Same
  markup path as `[[u]]`.
- Numbered list items as `{label, text}` with `labelStyle:
  "underline"` → the label renders underlined inline ahead of the text,
  matching the original's blue hotwords. (The popups those hotwords
  opened remain the expander cards below the list; do not make the
  labels tappable.)
- `para` blocks with `emphasis: "strong"` and/or `indent: true`.
- Greek words in prose that appear in `greekTaps` must be tappable and
  play — specifically λύουσιν and λύουσι in Movable Nu, and λύω in
  Parsing Format, which the data now wires. The "Stem + Pronominal
  ending — λύ + ω" fragments are deliberately NOT tappable (morphemes,
  no clips).

## 7. Confirmed keeps — no action

Endings plays `c_ending` (A3 KEEP). Major Hint 7s linger (B6). Verb
speller Show Answer stays non-tappable (B7 — Pronounce covers it).
All six πιστεύω clips verified correct (A1) — remove the `_verify`
markers, which the delivered data has already done.

## 8. Tests and evidence

- Playwright walk of ch1/ch2/ch3 rails: every stop screenshotted at
  320px and 768px, plus a side-by-side against the DOSBox images for
  every chapter-3 Learn page.
- Automated coverage of the A6 checking-policy table and the A4
  spelling cases (previously manual).
- Timing sweep evidence: grep output showing no stray durations.
- Revisit-reset demonstrated on one drill per chapter.
- check:shapes green; ch1/ch2 chunk hashes reported; precache delta.
- Airplane-mode ch3 walk (device, Nathanael).

## 9. Out of scope

Chapters 4+; the VOCAB book; any change to mark geometry or the font.

## Note on the screenshot bundle

Nathanael asked whether a PDF of relevant screenshots should accompany
this spec. It should — but it is the DOCUMENTS HE ALREADY HAS:
5D-RECON-RESULTS.pdf and VERIFY-5D-RESPONSE2.pdf together cover every
chapter-3 page whose formatting is at issue. Attach both alongside this
spec rather than generating a new bundle; a re-rendered PDF would be a
lossy copy of the originals. From 5E on, the cohort's RECON-RESULTS PDF
is a standing attachment to every coding round.
