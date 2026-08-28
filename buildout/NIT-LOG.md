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

**N-2 | Two-state toggles whose only contrast is a Greek word.**
DISCLOSURE-RULES §4.1 sends a lexical contrast to More/Back
(λόγος/ἄνθρωπος). ch12's Parsing Drill hint for εἰμί/ἔχω forms shipped
with the toggle labelled εἰμί / ἔχω (5H-SPEC1). Matrix of every
two-form pair in chapters 1-12 supplied with 5H-SPEC2 section 3.3;
decision pending Nathanael. Instances: ch4 Learn Nouns λόγος/ἄνθρωπος
(More/Back), ch5 Learn Nouns ὥρα/δόξα (More/Back), ch12 Parsing Drill
hint εἰμί/ἔχω (Greek labels).

DEFAULT APPLIED 2026-08-27 (5H-SPEC2 3.3, no kickoff ruling to the
contrary). `paradigmToggleLabels` falls back to More/Back whenever the one
differing word of the two titles is GREEK, so the ch12 εἰμί/ἔχω hint now
reads More / Back and joins the other two lexical contrasts. Stated as the
§4.1 rule rather than as a chapter-12 exception, so it is one rule in one
place. The five English contrasts in the section 3.3 matrix are asserted
UNCHANGED in the same ui-behavior pass (Present/Future on ch10,
Middle/Passive on ch12's λύω pair, Singular/Plural on ch11). Reversing it is
a one-line revert plus those assertions; VERIFY-5H-2 (t) asks Nathanael to
confirm or reverse.

**N-3 | Interlinear verses flow instead of breaking at the original's
three fixed lines** (5H RESULTS 5.6; the shape has flowed since ch1).
Instances: every Learn Scripture Memory and Review Scripture Memory
page. Not yet asked; recorded so it is not forgotten.

**N-4 | Empty grid cells.** The original's fixed 12-cell and 8-cell
option grids leave a dead cell when the pool is 11 or 7 (ch11 Greek to
English drill, ch12 Scripture Memory Drill); the port's responsive
grid draws none (5H RESULTS 4.4). Recorded as a deliberate difference.

## RESOLVED

**N-0 | Vocabulary drills did not load their first item on mount.**
Rode for several chapters before becoming intolerable; resolved by
DRILL-BEHAVIOR-RULES B-last (every sequence-stepped activity loads
item 1 on mount and speaks only when its timing says to) and the
ui-disclosure3 census. Kept here as the model of what this log is for.
