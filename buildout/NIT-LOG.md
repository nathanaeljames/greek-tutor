# NIT-LOG.md -- running catch-all for things Nathanael does not like yet

Opened 2026-08-26 (5H closure). A nit is a fidelity or feel issue that is
NOT a defect and is NOT resolved: it rides while chapters are built, so
the fix can be scoped once across every instance instead of
chapter-by-chapter. Every new instance of an open nit is appended to
its entry at the time it ships. An entry moves to RESOLVED when a rule
or a divergence entry closes it; it is never deleted.

Numbering: N-<n>, never renumbered. Cross-reference DIVERGENCE-LOG
entries and ledger rows where they exist.

## OPEN

**N-1 | Shared say-all recordings on split charts.** The original
records ONE "Say Paradigm" clip per paradigm and shows the whole
paradigm on one screen; the port splits wide charts Singular/Plural,
so a half-chart's button reads forms that are not on screen. Ruling
2026-08-26 (VERIFY-5H (p)): Learn/Drill/Exercise surfaces keep the
button on every half (a modal or a toggle shows one half at a time,
so the button there is the whole paradigm's); Quick Review pages,
which stack both halves, get ONE button after the Plural half.
Possible future fix: split each recording into half-clips at the
longest internal silence (audio-pipeline job, one listen per cut).
Instances to date (clip -> halves):
- ch11 K_EKEPAR (ἐκεῖνος), K_OUTPAR (οὗτος), K_OSPAR (ὅς): Learn toggle
  (2 halves each) + Quick Review (2 halves each, one button as of
  5H-SPEC2).
- ch11 K_AUTPAR, K_SEAPAR, K_EAUPAR (reflexive First/Second/Third
  Person): Learn Back/More stack (2 halves each) + Quick Review (2
  halves each, one button as of 5H-SPEC2).
- Chapters 1-10: none. Every earlier split used per-half clips the
  original recorded (ch5 article E_ARTSG/E_ARTPL, ch7 adjectives
  G_AGPARS/G_AGPARP, ch8 third person H_3MPAR/H_3FPAR/H_3NPAR).
- Chapter 12: none (its charts are two columns and fit unsplit).
- APPLIED 2026-08-28 across the cohort; the Quick Review half of the
  ruling ships and ui-behavior asserts both directions. Every FUTURE
  chapter must append its instances here in the round that ships them
  -- the complete record is what Nathanael will decide the clip
  splitting against.
- APPLIED 2026-08-27 (5H-SPEC2 2.9, implementer). The Quick Review half of
  the ruling now ships: `c11_qr_this_that` 2 buttons over 4 halves,
  `c11_qr_relative` 1 over 2, `c11_qr_reflexive` 3 over 6 -- twelve buttons
  down to six, each after its Plural half. The Learn toggles and every modal
  are untouched, which is the other half of the same ruling; ui-behavior
  asserts both directions ("named toggle keeps its say-all" for the toggles,
  "no Singular half carries the button" for the Review pages) so neither can
  drift into the other.
- FULL SPLIT LIST, for the future audio-pipeline job. Six recordings, twelve
  half-charts each side of the Learn/Review divide:
  K_EKEPAR, K_OUTPAR, K_OSPAR, K_AUTPAR, K_SEAPAR, K_EAUPAR. Nothing in
  chapters 1-10 or 12 joins them. This is the complete record Nathanael asked
  for before deciding whether to cut the clips.

**N-3 | Interlinear verses flow instead of breaking at the original's
three fixed lines** (5H RESULTS 5.6; the shape has flowed since ch1).
Instances: every Learn Scripture Memory and Review Scripture Memory
page. Not yet asked; recorded so it is not forgotten.

**N-4 | Empty grid cells.** The original's fixed 12-cell and 8-cell
option grids leave a dead cell when the pool is 11 or 7 (ch11 Greek to
English drill, ch12 Scripture Memory Drill); the port's responsive
grid draws none (5H RESULTS 4.4). Recorded as a deliberate difference.

**N-5 | Hint page headings the original does not print.** The ch8 Aὐτός
Translation Drill's four-page hint titles each page "Third Person
Paradigm: Masculine / Feminine / Neuter"; the original prints ONE
heading with the gender as a section label, and pages the same three
charts that way on its own Review page (ch8railwalk p13). Nathanael
ruled KEEP AS IS 2026-08-28 (VERIFY-5H-3 (y)) and it is logged as D-57,
so this is not open work -- it is recorded because the same choice will
recur wherever a multi-chart paradigm becomes a paged hint, and a later
sweep may want them consistent. Instances: ch8 Autos Translation Drill
(3 gender pages).

**N-6 | Half-list say-all recordings on a merged Review Vocabulary
Chart.** Chapter 13 is the first chapter whose Review Vocabulary Chart
the ORIGINAL pages: five rows, More, five rows, Back, with a SEPARATE
recording per half (`vocl13a` / `vocl13b` = `m_vocla` / `m_voclb`)
behind one Say List button keyed on a `FirstHalf` flag (13_3DECL.TBK
page script 0xfc4c6). DISCLOSURE-RULES 4.6 forbids a pager on a C9
Review page, so the port shows all ten rows in one scroll. Nathanael
ruled 2026-08-29: DO NOT PAGE, and keep both recordings where they
are -- five rows, a Say List button playing `m_vocla`, five more rows,
a Say List button playing `m_voclb`. This is the first chart app-wide
carrying MORE THAN ONE say-all (chapters 1-12 each ship a single
`playAll` id), so `playAllGroups` is a new renderer contract.

RECORDED FOR THE FINAL AUDIO PASS: this is the shape Nathanael may want
to revisit when he takes the one-time audio split/merge job -- merging
`m_vocla` + `m_voclb` into a single whole-list recording would collapse
this back to one button and one `playAll`, matching every other
chapter. `m_vocl` already exists in the CHAPT_13 pack and is declared
as an alias at 0x10294 but is played by NOTHING; if a listen confirms
it is the whole ten-word list, the merge is already done and only the
wiring changes. Sits alongside N-1, which is the same decision from the
other direction (one recording shared across split halves).
STANDING METHOD (ruled 2026-08-29, applies from here on): wherever the
original pages a Review list or chart behind More/Back, the port STACKS
it in the original's own split and keeps ONE say-all per half, drawn
between the halves -- five rows, button, five rows, button. No pager.
Where a half has no recording of its own, no button is drawn there.
Instances so far: ch13 Review Vocabulary Chart (two half-list clips,
m_vocla / m_voclb); ch14 Review Second Aorist Indicative Forms (paged
five-and-eight, NO half recordings, so it stacks with no buttons).
Chapters 15-16 not yet checked.

## RESOLVED

**N-2 | Two-state toggles whose only contrast is a Greek word --
RESOLVED 2026-08-27.** DISCLOSURE-RULES §4.1 now states it as its own
rule: a Greek-only contrast is lexical, so the label is More/Back,
never the Greek pair (VERIFY-5H-2 (t)). The ch12 εἰμί/ἔχω hint was
converted in 5H-SPEC2 and the other five matrix rows are asserted
unchanged. Original instances: ch4 λόγος/ἄνθρωπος, ch5 ὥρα/δόξα (both
already More/Back), ch12 εἰμί/ἔχω (converted).

**N-0 | Vocabulary drills did not load their first item on mount.**
Rode for several chapters before becoming intolerable; resolved by
DRILL-BEHAVIOR-RULES B-last (every sequence-stepped activity loads
item 1 on mount and speaks only when its timing says to) and the
ui-disclosure3 census. Kept here as the model of what this log is for.
