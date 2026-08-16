# 5G-SPEC3 Results

Date: 2026-08-16

Status: implemented and verified, with one explicitly data-blocked part of the
rule-derived εἰμί extension. No file was staged, committed, or pushed.

## Outcome

The three feedback items are implemented:

- chapter 9 drill Hints disclose Present Middle and Present Passive one at a
  time, with the other state named on a right-hand toggle;
- chapter 10 drill Hints use the same one-chart disclosure for Future Active
  and Future Middle;
- the rule-derived εἰμί Hint extension discloses Present and Future one at a
  time;
- the selected chart, title, toggle target, and authored Say Paradigm action
  replace one another in place, without autoplay;
- an active whole-paradigm clip is stopped before its chart is replaced;
- the three-line future formula preserves its centered layout while giving the
  whole morpheme equation one Greek tap target and only λύσω an inline target;
- both Quick Review pages retain their simultaneous stacked charts and have no
  toggle; and
- shape, behavior, modal, full-rail, build, lazy-chunk, and offline checks are
  green.

The one data-blocked exception is prominent because it affects the literal
wording of section 4: neither inline `eimiParadigms` chart has `sayWhole`, and
the chapter 10 pack contains no authored Present-εἰμί whole-paradigm clip.
The εἰμί surface therefore has the required Present/Future toggle and working
per-cell audio, but no Say Paradigm button. I did not fabricate a clip, borrow
chapter 7 audio, concatenate cells, or edit delivered data.

## Inputs and baseline

The clean implementation baseline and `origin/main` were both:

```text
4f18b3d10a3d83224a7848ec454dbedfc50e7f7f
prepping for 5G spec 3 - missed uploading part of the feedback
```

That baseline already contains the delivered full replacement
`src/data/chapt-10.json` v2. Relative to its parent, its only data change is the
Introduction formula block described by section 3. I retained it verbatim; its
SHA-256 is
`69169F69D5DC0EBF1D7307D82FF621A444DCC625786ECF4CBDEBC8D70B997CCC`.
The working-tree diff for `src/data`, `src/lexicon`, and
`public/audio/audio-manifest.json` is empty.

I also inspected all three pages of the supplied
`F:\greekapp\5F-5G-DISCLOSURERULES-UPDATE\5G-FEEDBACK-1.pdf`
(SHA-256
`7107A62252CB38C19E1BFFC074B0F858F14E5768354AC0B070476D468D2AB5FA`).
They show the chapter 9 Middle/Passive disclosure, the centered future formula
and chapter 10 Active/Middle disclosure, and the unchanged Quick Review
treatment.

## Implementation by module

### Formula rendering and validation

`RichContent.svelte` now handles `formula` blocks explicitly. Each authored
line remains separate and centered. A `tapUnit` line is one full-width
`button.greek-tap` containing `λύ + σ + ω`, including both plus signs. A
`greekTap` line uses the existing segment renderer so only `λύσω` is a
button; parentheses, dash, and the authored English `I will loose` remain inert
ink. The plain heading line is inert. The small CSS addition preserves the
paragraph rhythm and standard blue Greek-tap semantics.

`check-content-shapes.mjs` recognizes the new block and rejects non-centered
or empty formulae, ambiguous `tapUnit`/`greekTap` ownership, misplaced or
missing audio, and a named Greek word that is not a standalone substring.
Existing manifest traversal validates both nested and line-level clip IDs.

### Scoped two-state Hint disclosure

`SelectActivity.svelte` applies the one-at-a-time policy only to
`middlePassiveParadigms`, `futureParadigms`, and `eimiParadigms`. This is the
deliberate D-48f1 departure for chapter 9 and the corresponding chapter 10
application of Disclosure Rules section 4. The existing resolver continues to
normalize referenced and inline chart bundles; unrelated Hint and Quick Review
renderers are unchanged.

The modal body renders exactly one selected chart. Its pinned footer contains
the selected chart's Say Paradigm action, when authored, and the one-word
target-labelled toggle to its right, followed by Close. State 1 is restored on
open, on toggle-back, and when an item-level Hint reference changes behind an
open modal during normal answer auto-advance. Switching state stops audio owned
by the outgoing chart, creates no new clip, and then replaces the title, chart,
Say action, and target label.

The exact normal-surface mapping is:

| Hint | State 1 / target | State 2 / target | Say clips |
| --- | --- | --- | --- |
| ch9 Middle/Passive | Present Middle / `Passive` | Present Passive / `Middle` | `chapt_9_i_midpar`, `chapt_9_i_mpar` |
| ch10 Active/Middle | Future Active / `Middle` | Future Middle / `Active` | `chapt_10_j_luwpar`, `chapt_10_j_lumpar` |
| ch10 εἰμί | Present / `Future` | Future / `Present` | none authored on the inline charts |

### Harness changes

`ui-behavior.mjs` now proves the formula's DOM and computed centering, exact
button boundaries, exact per-tap `chapt_10_j_luw1s` requests, and zero audio
from both the plain first line and the worked example outside `λύσω`. Its
audio helper evicts only the expected existing audio-cache key before a tap so
an incorrect cached clip cannot satisfy an exact-ID assertion.

For all three Hint surfaces it verifies state-1 title/target, one visible
chart, state replacement, no toggle autoplay, toggle-back restoration, and an
English-gloss negative check on a toggled state. The normal chapter 9/10
surfaces additionally pin both whole-paradigm audio IDs and prove switching
stops the old playing clip. The εἰμί route pins one exact cell clip in each
state and proves that no un-authored Say control appears. A deterministic
shuffle traversal also verifies that auto-advance across λύω/εἰμί Hint refs
resets an already-open modal to the new ref's state 1. Separate Quick Review
assertions require both charts to remain stacked and reject every disclosure
toggle.

`ui-modals.mjs` expands the matrix from 30 to 33 surfaces by capturing both
states of each new disclosure. Across all five viewports it verifies the
control row stays inside and pinned to the modal, the toggle stays on the same
line and to the right of Say on the normal surfaces, and the one-chart state is
deterministic.

`ui-walk.mjs` requires exactly one chart for the three scoped Hint refs, records
the alternate state, verifies changed title and target, then restores state 1
before Close. These are extra interaction captures rather than rail pages, so
the established 612-state checklist denominator remains unchanged.

Suite accounting:

- behavior: 873 before this round to 898, all passing;
- modal matrix: 30 surfaces / 150 viewport states to 33 surfaces / 165 states,
  all passing; and
- full rail: unchanged at 219 stops at two widths and 612 checklist states,
  with eight additional alternate-Hint captures.

## Verification evidence

| Command/check | Final result |
| --- | --- |
| `npm.cmd run verify` | PASS: shapes for all 10 chapters; 101 modules transformed; PWA precache 37 entries; 10 chapter and 10 lexicon chunks emitted and precached |
| `npm.cmd run ui:behavior` with `BASE=http://127.0.0.1:4184` | PASS: 898/898 behavior checks in 790.6 seconds |
| `npm.cmd run ui:modals -- --base=http://127.0.0.1:4184 ...` | PASS: 165/165 states in 150.020 seconds at 390x844, 390x734, 390x664, 320x360, and 768x1024; pinned/in-modal controls; toggle right of Say; zero overlay movement |
| `npm.cmd run ui:walk -- --base=http://127.0.0.1:4184 --chapters=chapt_1,...,chapt_10 ...` | PASS in 327.663 seconds: 219 stops x 2 widths; 612/612 checklist states; eight alternate-Hint captures; 0px overflow; zero rail, interaction, or console errors |
| `npm.cmd run ui:offline` with `BASE=http://127.0.0.1:4184` | PASS in 3.824 seconds: 44 stops rendered; zero missing; offline refresh OK; zero console errors |
| `node --check` on all four changed `.mjs` files | PASS |
| `git diff --check` | PASS; Git emits only the repository's LF-to-CRLF working-copy notices |

Final browser evidence is in the system temporary directory:

- behavior:
  `C:\Users\NATHAN~1\AppData\Local\Temp\greekapp-5g-spec3-behavior-final-01fa953d52cc4b84b9dfc24ab6625091`;
- modal matrix:
  `C:\Users\NATHAN~1\AppData\Local\Temp\greekapp-spec3-modals-final-20260816-022156-0b91ef987bdf41a9bc063c817011cb25`;
- full walk:
  `C:\Users\NATHAN~1\AppData\Local\Temp\greekapp-5g-spec3-final-walk-20260816-022211683`
  (`walk-report.json` SHA-256
  `DAC12B1EADD92BA39BAE4CAF251DB359B619FD3025BEC9AE4B3EE9588BE5F870`).

The production build retains the pre-existing Svelte accessibility warning at
`DivideActivity.svelte:370` (`tabIndex` on a noninteractive element). This
round does not touch that component.

## Deviations and surprises

1. **Rule-derived εἰμί extension and audio constraint.** Per Disclosure
   Rules section 4.1, I implemented and prominently flag the Present/Future
   one-chart toggle so Nathanael can reverse the extension during its objection
   window. However, the two delivered inline charts have no `sayWhole`. The
   manifest has the Future clip `chapt_10_j_eimpar` elsewhere, but no chapter
   10 Present-εἰμί whole-paradigm counterpart. Borrowing chapter 7's
   `chapt_7_g_ispar` would cross offline-pack ownership and still would not be
   the delivered chart contract. Fidelity and the inviolable-data rule take
   precedence over inventing that missing audio; this is the sole partial
   literal acceptance item.
2. The delivered `hintCharts` provenance notes still describe the older
   stacked-popup presentation. They do not render, and I left the full
   replacement JSON unedited as required.
3. `scripts/assemble_ch10.py` remains an out-of-scope, pre-v2 generator: it
   authors the old multiline paragraph and does not emit the complete current
   Hint registry. Rerunning it would regress the delivered JSON. The new shape
   guard catches the formula half of such a regression; I did not reshape the
   generator without authorization.

## Acceptance checklist

- [x] Delivered `chapt-10.json` v2 was already present and remains unedited.
- [x] Both chapter 9 drills use the Middle/Passive disclosure per section 1
      and D-48f1.
- [x] Both chapter 10 drills use the Active/Middle disclosure per section 2.
- [x] The rule-derived εἰμί Present/Future toggle is implemented and
      prominently flagged.
- [ ] A Say Paradigm action plays both εἰμί states' whole clips; the
      delivered charts and chapter 10 audio pack do not contain those two
      authored actions, so none was fabricated. Per-cell clips are verified.
- [x] Chapter 9 and chapter 10 Quick Review pages remain stacked and have no
      disclosure toggle.
- [x] Formula taps and both required negative boundaries are implemented and
      verified with exact audio-log conduct checks.
- [x] Build, shapes, lazy chunks, 898 behavior checks, 165 modal states, full
      ten-chapter rail, and 44-stop offline verification are green.
- [x] No data, lexicon, manifest, cache architecture, load-path scan, route
      remount behavior, or audio-byte writer changed.
- [x] Results and exact cumulative BUILD handoffs are delivered; nothing was
      staged, committed, or pushed.
