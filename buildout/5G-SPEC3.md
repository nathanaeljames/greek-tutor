# 5G-SPEC3.md — 5G-FEEDBACK-1 items (hint toggles + intro taps)

Scope: the three items from 5G-FEEDBACK-1.pdf, none of which were in
5G-SPEC2 (the feedback document postdated that spec's inputs). Small
round. Base: the ACCEPTED Sol tree as it stands after 5G-XPATCH2.
Graded per GRADER-PROMPT.md against the BUILD diff.

Delivered input: `chapt-10.json` (v2, FULL replacement — one block
changed versus the copy already in your tree; see section 3).

## 0. Ground rules

1. **NO git commit, NO git push, NO staging — ever.** All version
   control is Nathanael's. You may run read-only `git diff` / `git
   status` to produce the BUILD diff. For the replaced data file and
   any new files, list them in RESULTS with their provenance; do not
   add them to the index.
2. Data layer is inviolable: place the delivered `chapt-10.json` in
   `src/data/` as-is. If anything in it looks wrong, STOP and report.
3. Directives 4 (offline verification), 9 (Greek-tap), 10 (no
   load-path scans) stand. No emoji. Deliver `5G-SPEC3-RESULTS.md`
   plus the diff.
4. DISCLOSURE-RULES.md section 4 governs the toggle design below;
   cite it by section in RESULTS where you make a judgment call.

## 1. ch9 drill hints: Middle/Passive two-state toggle (feedback item 1)

Current: both ch9 drills' Hint stacks the Present Middle and Present
Passive paradigms in one scrolling modal. New design (a deliberate
departure — the ORIGINAL shows only the one Middle chart; log the
divergence-entry reference D-48f1 in RESULTS):

- The modal shows ONE paradigm at a time. State 1: Present Middle
  Indicative Paradigm. State 2: Present Passive Indicative Paradigm.
- A single toggle button sits on the SAME line, to the RIGHT of the
  Say Paradigm button. Its label is the OTHER state's name: it reads
  "Passive" while Middle is shown, "Middle" while Passive is shown
  (one-word contrast rule, DISCLOSURE-RULES section 4.1).
- Toggling replaces the chart AND the Say Paradigm audio in place:
  Middle state says `chapt_9_i_midpar`, Passive state says
  `chapt_9_i_mpar` (both exist and are wired to these charts today).
  Nothing autoplays on toggle.
- The control row (Say Paradigm + toggle) and the Close button are
  pinned per section 4.3; chart content alone scrolls if needed.
- Applies to BOTH ch9 drills (parsing and translation) — they share
  the hint surface.

## 2. ch10 drill hints: Active/Middle two-state toggle (feedback item 3)

Same treatment for the `futureParadigms` hint used by both ch10
drills: state 1 Future Active Indicative Paradigm, state 2 Future
Middle Indicative Paradigm, toggle labeled "Middle"/"Active"
respectively, per-state Say Paradigm audio as wired today, pinned
control row, no autoplay.

The **Review Future Paradigms page is UNTOUCHED** — Quick Review
pages show everything at once by rule C9. Same for ch9's Review
Middle/Passive page.

**εἰμί hint (rule-derived extension, objection window):** the
`eimiParadigms` hint from 5G-SPEC2 is also a two-chart popup, so
section 4.1 gives it the same treatment: states "Present Active
Indicative of εἰμί" / "Future Active Indicative of εἰμί", toggle
labeled "Future"/"Present". This one is derived from DISCLOSURE-RULES
rather than stated in the feedback: implement it, but flag it
prominently in RESULTS so Nathanael can reverse it in review if the
extension is unwanted.

## 3. ch10 intro formula taps (feedback item 2)

The delivered `chapt-10.json` converts the Introduction's centered
formula block to a `formula` block:

- Line "Stem + Sigma + Ending" — English, NOT tappable.
- Line "λύ + σ + ω" — the WHOLE line (letters and plus marks, one tap
  unit) plays `chapt_10_j_luw1s` (the λύσω clip).
- Line "(λύσω — I will loose)" — the word λύσω is a standard inline
  Greek tap to the same clip; the parentheses and English are not.

Implement the `formula` block renderer: centered lines, `tapUnit`
lines are a single full-line tap target styled as the standard Greek
tap (blue), `greekTap` lines wrap only the named word. Keep the
visual identical to the current centered paragraph apart from the
tap affordances.

## 4. Harness

- Toggle behavior, all three hint surfaces: opening shows state 1;
  the toggle swaps chart title and label; Say Paradigm plays the
  state's clip (audio-log method, P3.1); toggling back restores
  state 1. Assert NO audio plays on toggle itself.
- Port the XPATCH2 gloss-plays-nothing negative check onto at least
  one toggled state per surface.
- Intro formula: tapping the "λύ + σ + ω" line plays j_luw1s;
  tapping λύσω plays j_luw1s; tapping "Stem + Sigma + Ending" plays
  NOTHING (negative check, audio-log method).
- Review pages: assert ch9 and ch10 Quick Review paradigm pages still
  render ALL charts stacked with no toggle present.
- Update any 5G-SPEC2 assertions that pinned the stacked-hint DOM.
  Report old/new suite totals.

## 5. Out of scope

Everything in DISCLOSURE-SPEC1 (R1-R7 app-wide, ch1-8 data,
poolKind). The ch3/4/5 Paradigm-Endings hint modals keep their
current behavior this round — their in-place toggle is R4/R5 work.
Do not generalize the toggle component beyond the three ch9/ch10
hint surfaces and do not restyle anything else.

## 6. Acceptance checklist

- [ ] Delivered chapt-10.json in place, unedited
- [ ] ch9 hint: Middle/Passive toggle per section 1, both drills
- [ ] ch10 hint: Active/Middle toggle per section 2, both drills
- [ ] εἰμί hint: Present/Future toggle, flagged in RESULTS
- [ ] Review pages untouched (asserted)
- [ ] Formula taps per section 3, with the negative check
- [ ] Harness green; totals reported; ui:offline 44 stops green
- [ ] 5G-SPEC3-RESULTS.md + read-only diff delivered; NOTHING
      committed, staged, or pushed
