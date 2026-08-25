# DISCLOSURE-SPEC3 -- Verify follow-through: initial load, keyboard shift, viewport bug, underline exclusivity, three data fixes

Round: DISCLOSURE, revision 3. Base: repo head `e294683` (SPEC2
merged). Authority: **DISCLOSURE-RULES.md as further amended
2026-08-18** and **DRILL-BEHAVIOR-RULES.md as amended 2026-08-18**
(both copies delivered with this spec -- read them, not the committed
ones; Nathanael commits them with this round). Ratifying sources:
Disclosure_Verify_Response.pdf (checked clean of strikethrough) --
its numbered items 1-7 plus the inline VERIFY responses. Item 8 was
"[nothing yet]"; nothing is built for it.

Settled by the responses, requiring NO work: accordion box and
padding (A1), Six Points (A1), the ch10 centred lone toggle (A2),
label short forms (B1), "Say Endings" stays (B3), Capitals Note (C1),
ch8 Review stack and headings (C2), wordUsage title green (C3), the
ch5 say-all restoration is RATIFIED (D1), print check skipped (E1).

## 0. Standing round rules

Identical to SPEC1/SPEC2 section 0: directives 1-10; git READ-ONLY;
data verbatim with the §0.3 visual-verification exception (report
before/after); STOP on missing shapes or files; checkpoint discipline;
airplane-mode close. Deliverables: DISCLOSURE-SPEC3-RESULTS-<MODEL>.md,
DISCLOSURE-SPEC3-BUILD-<MODEL>.md, DISCLOSURE-VISUAL-CHECKLIST3-
<MODEL>.md. The SPEC1+SPEC2 harness must end green apart from
assertions this spec deliberately changes, each named in RESULTS.

## 1. Data files (2 delivered now, 1 to follow)

| File | Base | Change |
| --- | --- | --- |
| chapt-08.json | repo `e294683` | ONLY change: the two Reflexive Intensifier example `audio` values are SWAPPED (item 5 -- the clips were crossed; the pneuma verse now plays ex3r2, the Iesous verse ex3r1), plus an `_audio_note`. Because the ch8 Translation Drill hint renders this same topic via `contentRef`, one fix covers the Learn page and every hint instance -- verify BOTH surfaces by ear |
| chapt-07.json | repo `e294683` | ONLY change: `audioMap` { οὐκ, οὐχ } + note on `c7_learn_eimi` (B2 response; §4.7 hand-cursor rule). All three rule lines become taps; οὐ already resolves via its lexicon lemma. The clips exist and already play from the accordion headwords |
| chapt-05.json | PENDING | The ch5 hint chart fix (item 6) requires ch5railwalk.pdf, which the pipeline does not have in-context -- authoring the uncollapsed rows without it would be invented content. The file ships as a round addendum once the railwalk is provided. If it has not arrived when every other item is done, note it in RESULTS and close the round without it |

Verify both delivered files against `e294683` with a structural JSON
diff before copying in: the changes above and their `_note` keys must
be the ONLY differences.

## 2. W2 -- Sequence-stepped activities load their first item (item 1; DRILL-BEHAVIOR-RULES B-last)

The new rule, in one line: anything advanced with Previous/Next loads
item 1 on mount as if Next had been pressed once, pronouncing it on
load exactly when it would pronounce on advance; anything where the
USER picks the item keeps its empty start.

1. Full rail walk of ALL activities in all ten chapters. Classify
   each: sequence-stepped (auto-load) vs selection-driven (empty
   start, ledger `afterTap` -- ch1 Letter Names and Sounds Drill is
   the named model). RESULTS lists EVERY activity in one table:
   changed / already-loaded / exempted, each with its ledger row or
   Learn-stepper classification. Named starters from the review: ch1
   Learn Letters, ch1 pronounce-letters exercise, every chapter's
   Learn Vocabulary.
2. Pronounce-on-load follows the activity's existing advance
   behavior: if stepping Next pronounces the item (ledger
   `beforeGuess`, Learn-stepper pronounce-on-advance, pronounceEach
   default ON), the initial item pronounces on mount too; if advance
   is silent, mount is silent. Do not invent new audio behavior --
   the rule is "as if Next had been pressed once", nothing more.
3. "Click Next to begin" / beginPrompt screens are retired for the
   auto-load class (ContentAudio.svelte carries four such fallbacks).
   Instruction lines on selection-driven surfaces ("Click on a letter
   to hear its name & sound") STAY.
4. Guard the autoplay-on-mount against the iOS gesture requirement:
   if the platform blocks un-gestured audio, the item still LOADS and
   the pronunciation fires on the first user gesture or not at all --
   never a blank screen, never a console error. State in RESULTS how
   this was handled and verified.

## 3. W3 -- Keyboard shift key (item 2)

SpellerKeyboard.svelte (the ONE shared keyboard, D-15 -- change lands
everywhere at once, no forks):

1. Answer checking is case-insensitive (answer-check.js folds), so
   this is an input capability, not a scoring change. Capitals are
   currently untypeable on tiles.
2. Add a **Shift key at the bottom-left corner** of the keyboard, its
   width SUBTRACTED from the spacebar (Nathanael's stated layout).
   One-shot behavior like a phone keyboard: tap Shift, the next
   letter tile types its capital, state reverts; visible
   pressed/active state while armed; tapping Shift again disarms.
   Tile faces show capitals while armed.
3. Capital mapping is the standard Greek uppercase table; ς has no
   distinct capital and shifts to Σ like σ.
4. Physical-keyboard parity: uppercase roman input maps through the
   same table (A -> Α etc.) so the desktop convenience layer matches
   the tiles.
5. No layout regression at 320px: the added key must not overflow the
   row (ui-walk covers this; add a width assertion).

## 4. W4 -- The half-screen modal bug (item 3)

Symptom: modals sometimes open at roughly half height; killing and
reopening the app fixes it; it happens on current builds. Root-cause
hypothesis, from src/lib/viewport.js as shipped: `--modal-vh` is
published from `visualViewport.height` and re-measured ONLY on
resize/orientationchange. iOS PWAs are known to drop resize events on
resume-from-background, so a height snapshotted while the SOFTWARE
KEYBOARD was up (spell exercises -- the keyboard eats roughly half
the screen) survives backgrounding, and every modal opened after
resume is sized to a phantom keyboard. Kill-and-restart re-measures,
which is exactly the reported recovery.

1. Re-measure on `pageshow`, on `visibilitychange` -> visible, on
   `focusout` (keyboard dismissal), and AT EVERY MODAL OPEN (measure
   before first paint of the modal).
2. Sanity clamp: if the published height is implausibly small
   (below ~60% of `window.innerHeight`) while NO editable element is
   focused, fall back to `innerHeight` and schedule a re-measure next
   frame. State the chosen threshold in RESULTS.
3. Do not regress the things viewport.js already handles (its own
   comments document three prior failures): the svh/vh fallback
   chain, the chrome-top/bottom rects, the per-frame coalescing.
4. This bug is intermittent and device-bound, so the DEFINITION OF
   DONE is: the triggers above demonstrably fire in a simulated
   sequence (keyboard up -> background -> resume), the clamp
   provably rejects a phantom height in a unit-style harness check,
   and the fix is flagged as a VERIFY device-soak item rather than
   claimed fixed.

## 5. W5 -- Green-underline exclusivity (item 4; amended §3.2)

1. The ch8 Number chart headers stop underlining: the
   `headerUnderline` key becomes inert provenance -- the renderer
   drops the `head-underline` styling path (RichContent.svelte ~415
   binds it; app.css styles it). Headers render plain.
2. App-wide audit, then harness assertion: EVERY element computing
   green + underlined must be genuinely tappable (link, button, or
   summary with a handler). The Meanings label conforms (tappable).
   Any other non-tappable green underline found in the audit is
   fixed under this item and listed in RESULTS.
3. `[[u]]` in header/label contexts renders without underline, same
   treatment as accordion labels. Authored `[[u]]` in PROSE (rule
   items, ink underlines) is untouched -- the rule is about green
   underline, not about emphasis in running text.

## 6. W6 -- Title links go green (item 7; amended §3.2)

`.topic-title-link` (app.css ~1682) still uses `var(--link)` -- blue.
Answer to the review's question, for RESULTS: no rule ever governed
title links; only in-chart triggers (§3.3) are ratified blue, and R1
simply missed the title-link class. Fix: title links take the
`.popup-link` green underlined style. Sweep every `titleLink` in data
(ch9 Deponent Verbs, ch10 Future of εἰμί; grep for others) and
confirm each renders green, underlined, tappable, opening its popup.
In-chart triggers and blue Greek audio taps are UNTOUCHED.

## 7. W7 -- Modal divider padding, universalized for real (A2 response; amended §4.3)

The two-screen footer (ch7 Adjective Translation hint) is correct:
padding above AND below the divider. The three-plus footer (ch8
Personal Pronoun Case hint) is wrong twice: no padding above the
divider, double below. Both confirmed in-app and in Safari.

1. Root-cause the drift: the two compositions take different CSS
   paths (`.pg-pins-nav` zeroing `.modal-actions`' divider while the
   pinned `pg-controls` carries its own border with its own spacing).
   Converge on ONE divider owner with symmetric padding that cannot
   differ by composition -- if two selectors can each draw the
   divider, this bug returns.
2. Measure, do not eyeball: harness-assert (a) exactly one divider
   per modal, (b) the padding above equals the padding below within
   1px, (c) across ALL modal states in the D13 walk, at a viewport
   height that forces the content to scroll.
3. The forced-scroll divider check is now a STANDING checklist item
   (amended §4.3): every modal, every railwalk, resize until content
   scrolls, padding above AND below, no doubling. Add it to the
   visual checklist template this round and every future round.

## 8. W8 -- ch5 hint chart uncollapse (item 6; new §4.7) -- DATA-GATED

The original ch5 First Declension hint modal prints Nom. and Voc. as
SEPARATE rows; the shipped hint reuses the Learn chart, which merges
them ("Nom.\\Voc.") as the chapter legitimately does elsewhere. Under
new §4.7 a hint is transcribed from its OWN screen.

1. BLOCKED on data: the corrected chapt-05.json (dedicated hint
   chart) ships once the pipeline has ch5railwalk.pdf. Do not author
   chart rows yourself -- that is pipeline work from the railwalk.
2. When the file arrives: copy verbatim, confirm the hint modal
   prints five rows as the railwalk does, confirm the Learn page
   chart is UNCHANGED (its merged row is faithful to its own screen),
   and confirm both drills' hints pick up the dedicated chart.
3. If the file has not arrived by the time all other items are done,
   close the round and say so in RESULTS.

## 9. Verification

1. SPEC1+SPEC2 harness green, with deliberate changes named (the
   Number-header underline assertion, if one exists, inverts).
2. New assertions: initial-load state per activity class (auto-load
   activities render item 1 on mount; selection-driven render their
   instruction line); shift key present, one-shot, spacebar narrowed,
   no 320px overflow; capital input round-trips the checker; green-
   underline exclusivity sweep (5.2); title links green and tappable;
   divider symmetry at forced scroll across all modal states; the
   viewport clamp rejects a phantom height; the ch8 swapped clips map
   to the right verses ON BOTH SURFACES; οὐ/οὐκ/οὐχ all carry taps.
3. Visual checklist: one row per touched screen plus the new standing
   forced-scroll divider row for EVERY modal state; screenshot each.

## 10. VERIFY-DISCLOSURE3 items (human judgment)

- Device soak for the half-screen bug: keyboard up, background the
  app, resume, open a hint -- across a few days of normal use, since
  the trigger is intermittent (W4.4).
- Shift key: placement, width taken from the spacebar, one-shot feel.
- Initial-load feel on ch1 Learn Letters and one Learn Vocabulary:
  right item, right audio timing, no blank flash.
- The ch8 reflexive clips, by ear, on the Learn page AND in the
  Translation Drill hint.
- The three ch7 taps, and that the rule lines now show the tap
  affordance.
- ch9 Deponent Verbs / ch10 Future of εἰμί title links: green reads
  as intended.
- Airplane-mode device pass (standing).

CONFIDENCE: 0.88. Every renderer item is traced to current code at
`e294683`; the W4 root cause is a hypothesis with strong circumstantial
fit (the recovery behavior matches exactly), so its done-definition is
trigger coverage plus device soak, not a fixed claim.

KEY CAVEATS: W8 is data-gated on ch5railwalk.pdf and the round may
close without it; W4 cannot be proven fixed off-device; the W2 sweep's
changed-activity list is the implementer's to produce and the pipeline
will audit it against the ledger at grading.
