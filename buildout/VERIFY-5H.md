# VERIFY-5H.md — the items only Nathanael can settle

Chapters 11 and 12, after 5H-SPEC1 (Opus, no XPATCH) plus the pipeline's
`_verify_note` data patch of 2026-08-26. Everything mechanical is already
pinned: 1058 behaviour assertions, a 51-stop rail walk of both chapters at two
widths with every expander, chart state and Hint opened, 235 modal states over
five device heights, 303 disclosure assertions, a 270-activity initial-load
census, an offline walk of both chapters, and the page-by-page comparison
against both rail walks (`5H-VISUAL-CHECKLIST-OPUS.md`). Nothing any of those
can answer is in this file; what they settled is listed in section 2 so you can
see it was considered rather than skipped.

Fourteen items. Each states what the port does NOW, so a verdict has something
to land against, and each says what changes if you answer against the default.

---

## 0. How to answer

| Kind | What it needs |
| --- | --- |
| **DOSBox** | The original running under DOSBox. These ask what the ORIGINAL does; the port's behaviour is already stated in the item. |
| **Listen** | Either the WAV on the ISO (`CHAPT_11/K_AUTOS.WAV`) or the app's copy (`/audio/chapt_11/k_autos.m4a`) — both paths are given per clip. |
| **Judgement** | No machine or original can settle it: keep-or-fix, veto-or-accept. There is no free answer; both branches cost something and the item says what. |

Write in the blank after each arrow and add anything else under Notes. A
screenshot beats a description.

---

## 1. Items

### (a) Learn Relative Pronouns > Introduction — RESTORE or MIRROR? *(judgement)*

- [ ] **The original shows the Reflexive/Reciprocal box under BOTH the
  Introduction radio and the Reflexive/Reciprocal radio** (ch11railwalk p11-p12;
  you confirmed this in DOSBox after a refresh and back-and-forth navigation).
  The port shows different text under Introduction.

  **Where that text comes from, plainly:** it is the original's own data. Two
  fields in `11_DEMON.TBK` that the original's page never displays — `0x4136e`,
  headed "Relative Pronouns" ("A relative pronoun often introduces a subordinate
  clause ... (Mounce, p. 109)"), and `0x420fc`, headed "Relative Pronouns
  (cont.)" (the two numbered points). Nothing here was authored by the pipeline
  or taken from an outside source. Corroboration: the CHAPT_11 pack ships six
  clips no displayed screen references (`k_agree1-4`, `k_under1-2`), which is
  what you would expect of example text prepared for that page and then dropped.

  **Port today:** the TBK text, as two paragraphs and a two-point numbered list.
  The "pending verification" banner that stood under it during the build round
  is GONE — the data key was renamed `_verify_note` on 2026-08-26, and the walk
  re-run after that patch confirms nothing learner-facing remains.

  **Proposed default: RESTORE** (keep the TBK text), on the precedent of ch10's
  parsing item 18, where the original's own dispatch was broken and the port
  supplied what the original meant.

  MIRROR instead means the Introduction topic's content becomes a byte copy of
  the Reflexive/Reciprocal blocks, so the page shows the same box twice.

  Either answer is a divergence entry. **Numbering note:** the task sheet says
  "D-51" for this, but D-51 is already spent in the committed log on the ch12
  Augment Drill gate (item (d) below), and D-50 on the 2026-08-25 process rules.
  This becomes **D-52** under the log's never-renumber rule.

  → **RESTORE / MIRROR:** ______________

  Notes:

---

### (d) Augment Drill — does the original's Pronounce leak the answer? *(DOSBox)*

- [ ] **ch12railwalk p8, bottom-right.** The drill shows a present-tense lemma
  and three Greek options; its clips (`l_ad1-19`) record the **augmented
  answer**, not the lemma on screen — you established that in DOSBox on
  2026-08-25 and ledger row 108 is CONFIRMED `afterGuess` on it.

  **Port today:** before the guess the lemma renders in ink (not a tap) and
  **Pronounce is disabled**; after the guess both go live and replay the clip.
  The drill mounts silent. The condition is stated structurally in the renderer
  — Greek prompt plus Greek options plus `afterGuess` — which matches this
  activity and no other across twelve chapters.

  In DOSBox, on any Augment Drill item, click **Pronounce before choosing**.

  If it plays the augmented form, the original leaks and the port's gate is a
  deliberate improvement. If it is silent or greyed, the port is mirroring and
  only the ink lemma is a departure. Either way the entry is **D-51** as already
  committed (the task sheet's "D-50" is taken by the process rules).

  → **Plays the augmented form / silent / the button is disabled:** ____________

  Notes:

---

### (e) Chapter 12 Hint form-dependence in the ORIGINAL *(DOSBox)*

- [ ] **ch12railwalk p8 and p10.** This is the ch10 pattern you spotted in
  VERIFY-5G item (h): the Hint you get depends on the form on screen.

  **Port today:** on the Imperfect Indicative Parsing Drill, the twelve λύω
  items open "Imperfect Active Indicative of λύω" with a Middle/Passive toggle,
  and the eleven εἰμί/ἔχω items open "Imperfect of εἰμί" with an ἔχω toggle. The
  Imperfect Indicative Translation Drill has ONE hint for all twenty items, the
  λύω pair. (That the port does this is machine-pinned; see section 2. What only
  DOSBox can say is whether the original does.)

  In DOSBox, open the Parsing Drill, click Hint on a λύω form, then step to an
  εἰμί or ἔχω form and click Hint again. Then open the Translation Drill and
  click Hint on two or three different items.

  → **Parsing Drill switches / always the same chart (which): ______________**

  → **Translation Drill: λύω only / switches too (to what): ______________**

  Notes:

---

### (f) Chapter 11 Hint form-dependence in the ORIGINAL *(DOSBox)*

- [ ] **ch11railwalk p5, p6 and p14.** Same question for the three chapter-11
  drills that have two charts between them.

  **Port today:** the This and That Drill splits 15 items to the οὗτος chart and
  15 to the ἐκεῖνος chart; the This and That Translation Drill splits 9 and 9;
  the Who and The Drill sends 12 items to the Definite Article chart and 18 to
  the ὅς chart. The Relative Pronoun Translation Drill has one hint (ὅς) for all
  nine items.

  In DOSBox, click Hint on an οὗτος item and then on an ἐκεῖνος item in each of
  the first two drills, and on an article form and a relative form in Who and
  The.

  → **All three switch / list any that do not: ______________**

  Notes:

---

### (g) Chapter 12 Review Vocabulary Chart, μέν *(judgement)*

- [ ] **ch12railwalk p17, bottom-left.** The original prints μέν's gloss as
  "one the one hand, indeed (179)" — "one" where "on" was meant.

  **Port today:** verbatim, under typo policy A1. The typo appears on the Review
  Vocabulary Chart ONLY; the two vocabulary drills and the flashcard use the
  short gloss "indeed", which is not affected either way. Nothing about this is
  shown to the learner as a flag — the note behind it lives in the data as
  `_verify_note` and never renders.

  Fixing it means "on the one hand, indeed" and a divergence entry; keeping it
  also means a divergence entry, because A1 is a policy and this is the decision
  that applies it.

  → **Keep verbatim / fix to "on the one hand, indeed":** ______________

  Notes:

---

### (h) Chapter 11 Relative and Reflexive Spelling Exercise, prompt 24 *(judgement)*

- [ ] The prompt reads **"whom (masc. nom. pl.)"** and the answer is **οἵ**. A
  nominative is "who"; "whom" is the accusative English. Prompt 8 in the same
  exercise reads "whom (masc. acc. pl.)" for οὕς, which is correct, so the
  exercise contradicts itself.

  **Port today:** verbatim, "whom". The answer is οἵ either way, so no answer
  key moves whichever you choose.

  → **Keep verbatim / print "who (masc. nom. pl.)":** ______________

  Notes:

---

### (j) Chapter 12 Form topic — what do ε and λυ play? *(DOSBox)*

- [ ] **ch12railwalk p2-p3.** The Form topic prints the derivation
  "ε + λυ + ο + ν = ἔλυον", and the rail walk shows a hand cursor on **ε**, on
  **λυ** and on **ἔλυον** separately.

  **Port today:** the whole Greek line is ONE tap target playing `l_as1`
  (ἔλυον), the clip the page's own SayWord table names for it; the English lines
  above and below it are inert. That follows D-48f2, the chapter-10 formula
  shape you approved.

  In DOSBox, click **ε** alone, then **λυ** alone, on that line.

  If either plays something, the port needs three tap units and two more clip
  ids; if both are silent, the hand cursors are the original's generic
  click-target styling and the port is right as built.

  → **ε plays: ______________  λυ plays: ______________**

  Notes:

---

### (k) Listens *(listen — device or ISO)*

- [ ] Each row names what the port ASSUMES the clip is. A "no" costs one wiring
  change; a "yes" closes the row. Both file paths are given.

| Clip | The port assumes | Files |
| --- | --- | --- |
| `k_outmfn` | The compound entry "οὗτος/αὕτη/τοῦτο" on Learn Demonstrative Pronouns > Introduction — one tap for all three forms | `CHAPT_11/K_OUTMFN.WAV`, `/audio/chapt_11/k_outmfn.m4a` |
| `k_autos` | A standalone **αὐτός**, tapped inside the Reflexive/Reciprocal prose | `CHAPT_11/K_AUTOS.WAV`, `/audio/chapt_11/k_autos.m4a` |
| `k_allhlw` | A standalone **ἀλλήλων**, tapped in the same prose | `CHAPT_11/K_ALLHLW.WAV`, `/audio/chapt_11/k_allhlw.m4a` |
| `k_voc7` vs `k_voc7a/b/c` | `k_voc7` recites all three forms and backs the Learn Vocabulary flashcard; `k_voc7a/b/c` are the single forms οὗτος / αὕτη / τοῦτο and back the drills and the Review chart's three parts | `CHAPT_11/K_VOC7.WAV` and `K_VOC7A/B/C.WAV`; `/audio/chapt_11/k_voc7.m4a` etc. |
| `k_voc10` vs `k_voc11` | `k_voc10` is the ὑπέρ of "for, about (gen.)"; `k_voc11` is the ὑπέρ of "above, beyond (acc.)". If they are the same recording, say so — the wiring still works, but the Review chart's two rows would be speaking one clip | `CHAPT_11/K_VOC10.WAV`, `K_VOC11.WAV` |
| `k_autpar` / `k_seapar` / `k_eaupar` | First Person ("myself"), Second Person ("yourself"), Third Person ("him/her/itself") reflexive paradigms, in that order | `CHAPT_11/K_AUTPAR.WAV` etc. |
| `l_ap3` | Third plural **ἔλυον** of the Imperfect Active chart. `l_a1s` and `l_ap9` ship in the pack and are referenced by no dispatch table at all — if one of them is the real third plural, `l_ap3` is something else | `CHAPT_12/L_AP3.WAV`, `L_A1S.WAV`, `L_AP9.WAV` |
| `l_ex1-14` | Rows first, then compounds: `l_ex1-10` are the five contraction examples as augmented-form / lemma pairs (ἤκουον, ἀκούω, ἤγειρον, ἐγείρω, ὠρχούμην, ὀρχέομαι, ᾖρον, αἴρω, ᾠκοδόμουν, οἰκοδομέω) and `l_ex11-14` are ἐκβάλλω, ἐξεβάλλον, ἀποκτείνω, ἀπέκτεινον | `CHAPT_12/L_EX1.WAV` … `L_EX14.WAV` |

  → **All as assumed / corrections: ______________________________________**

  Notes:

---

### (l) Disclosure vetoes — six departures from the original's layout *(judgement)*

- [ ] Each row is a place where the port reorganises what the original drew,
  under DISCLOSURE-RULES. This is where they get vetoed; a departure you never
  see is a silent divergence.

| # | The original | The port | Rail walk |
| --- | --- | --- | --- |
| l.1 | Learn Demonstrative Pronouns > Introduction has a **More** button opening a second screen headed "Demonstratives" | A boxed accordion titled "Demonstratives", collapsed, in place under the prose (C6) | ch11 p3 |
| l.2 | That screen carries a **"Greek Examples"** link opening a green four-verse page | A green underlined link inside that accordion, opening a modal titled "Demonstrative Examples" (C3) | ch11 p3 |
| l.3 | The Reflexive Paradigm is three screens (First / Second / Third Person) switched by in-page person links, each showing masculine and feminine (and neuter) side by side | SIX charts on one Back/More stack — each person split Singular/Plural so nothing exceeds three Greek columns at 320 px — with the person's title and say-all on both halves | ch11 p13 |
| l.4 | Learn Imperfect > Form has a **More** button to "Form (cont.)" (the connecting-vowel rule) | Merged into the Form topic with a gap above it (C5) | ch12 p2-p3 |
| l.5 | Learn Imperfect > Augments has a **More** button to "Augments (cont.)" with rules 3 and 4, and an **Examples** link to a green contraction page | ONE numbered list 1-4 (C5 merge — the original's own Augment Drill hint prints all four on one screen), with a boxed accordion "Contraction Examples" placed right after item 2 (C1) | ch12 p5-p6 |
| l.6 | The Quick Review page prints **"Review Imperfect Paradigm"** (singular) and pages Active / Middle-Passive with a toggle | Titled **"Review Imperfect Paradigms"** (plural, from the Quick Review Menu) and stacks both charts with no toggle, because a Review page must be printable (§4.6) | ch12 p17-p18 |

  → **All accepted / veto (which rows and what instead): ______________**

  Notes:

---

### (m) Chapter 11 typographic slips in the original *(judgement)*

- [ ] Two places where the original's own typing is wrong. Both ship verbatim
  today; both branches are a divergence entry.

| Where | What the original types | Why it looks wrong |
| --- | --- | --- |
| Demonstrative Examples modal, Jn 8:23 | "ἐγὼ οὐκ εἰμὶ ἐκ τοῦ κόσμου **τοὺτου**." | A GRAVE on the penult. The same word is spelled τούτου with an acute everywhere else in the chapter, including the drill pool |
| This and That Translation Drill, item 13 (Mar 4:20) | "καὶ **εκεῖνοί** εἰσιν οἱ ἐπὶ τὴν γῆν" | No smooth breathing on the epsilon. The second acute is correct — it is the enclitic accent thrown back by εἰσιν |

  A third slip in the same modal, a doubled breathing on ἐστε, was already
  normalised under typographic policy A1/D-3 and is not asked about.

  → **Keep both verbatim / fix τοὺτου / fix ἐκεῖνοί / fix both:** ____________

  Notes:

---

### (n) Chapter 11 Vocabulary Spelling Exercise has ten items, not eleven *(DOSBox)*

- [ ] The chapter has eleven vocabulary entries (ὑπέρ counts twice, once per
  case) but the speller's pool has TEN.

  **Port today:** ten items, ὑπέρ appearing once, prompted "for, about (gen.)".
  The multi-form entries are spelled by their FIRST form only — ἐκεῖνος (not
  ἐκεῖνος, -η, -ο), ὅς, οὗτος, Πέτρος — with the prompt disambiguated as "that
  (masc.)", "who (masc.)", "this (masc.)", matching the flashcard.

  In DOSBox, step the Vocabulary Spelling Exercise to its end and count.

  → **Ten confirmed / there is an eleventh (prompt: ______________)**

  → **First-form spelling confirmed / the original wants: ______________**

  Notes:

---

### (o) Chapter 11 objectives — are ἐκεῖνος and οὗτος taps? *(DOSBox)*

- [ ] **ch11railwalk p1.** Objective 1 wraps onto an indented second line naming
  ἐκεῖνος (that) and οὗτος (this). The TBK's WordSelection table on the
  Objectives page (the `0x5e176` region) dispatches ἐκεῖνος to `k_ekemns` and
  οὗτος to `k_outmns`.

  **Port today:** neither word taps. The objectives ship as plain strings and
  the objectives renderer has no tap contract at all, so the clips have nowhere
  to attach. This is a **pipeline gap, not an implementation one** — the fix is
  a data contract (an objective may be `{text, audioMap}`) plus a one-line
  renderer read, and it is scoped into LOOKBACK-SPEC1 along with chapter 7's
  εἰμί, which has the same problem.

  Only one thing is asked here: click both words in DOSBox.

  → **Both speak / one speaks (which) / neither speaks:** ______________

  Notes:

---

### (p) One recording, two half-charts — where does the button go? *(judgement)*

- [ ] **ch11railwalk p4, p13 and p20-p21.** The original records ONE "Say
  Paradigm" clip per paradigm — `K_EKEPAR`, `K_OUTPAR`, `K_OSPAR`, `K_AUTPAR`,
  `K_SEAPAR`, `K_EAUPAR` — and each reads the singular forms and then the plural
  forms, because in the original the whole paradigm is on one screen. The port
  splits every one of those charts Singular/Plural to fit 320 px.

  **Port today:** the button is repeated on both halves and plays the same whole
  clip on each, so pressing it on a Plural half starts with the singular forms.
  That is six clips over twelve Learn halves and twelve Quick Review halves.

  **Your interim ruling, as recorded:** modals keep the duplicated button;
  Quick Review pages get ONE button, placed after the Plural half. Two notes on
  applying it here. The modal half is vacuous in these two chapters — every
  chapter-11 and chapter-12 Hint is a two-state toggle with NO say-all at all,
  because the original's hints carry Cancel only, so there is no duplicated
  button in a modal to keep. The Quick Review half is NOT yet applied: it lands
  in 5H-XPATCH1 with whatever else this document produces, so that it ships with
  your answers rather than ahead of them. It would take chapter 11's three
  Review pages from twelve buttons to six.

  Two things are asked.

  First: on the **Learn** pages the two halves are behind a Singular/Plural
  toggle, so only one is ever on screen and the button there is by construction
  the whole paradigm's, not that half's. Does the ruling leave those alone?

  Second: splitting the six recordings into twelve half-clips would make each
  button read only the forms above it. That is an audio-pipeline job, not a
  renderer one, and it is scoped in LOOKBACK-SPEC1 if you want it.

  → **Learn toggles: leave the button on both halves / one button (where):**
  ______________

  → **Split the clips later: yes / no:** ______________

  Notes:

---

### (q) Chapter 11 Relative and Reflexive Spelling Exercise, item 14's clip *(listen + judgement)*

- [ ] **[implementer-raised, per the standing rule that a departure you never
  see is a silent divergence.]** Item 14 prompts "whom (masc. acc. pl.)" and its
  answer is **οὕς**. The original's SayWord table dispatches **`k_osnap`** on
  that item — the NEUTER accusative plural cell, ἅ — which is not the answer.
  Its check script still accepts οὕς.

  **Port today:** wired to `k_osmap`, the answer οὕς's own cell clip, as a
  fidelity restoration. So the port speaks the word the learner just spelled;
  the original speaks a different word.

  This is NOT the blank-dispatch class you already ruled on in chapter 10 (item
  18): there the original played nothing. Here it plays the wrong thing.

  Listen to `CHAPT_11/K_OSNAP.WAV` and `K_OSMAP.WAV`
  (`/audio/chapt_11/k_osnap.m4a`, `k_osmap.m4a`) to confirm which is which.

  → **Keep the restoration (play οὕς) / mirror the original (play ἅ):**
  ______________

  Notes:

---

## Airplane-mode pass (directive 4, device half)

The preview half is scripted (`npm run ui:offline`: 51 stops across both
chapters, refresh on an activity route, no console errors). This is the part
only a real iPhone can answer.

- [ ] **Download both packs through the app** (CHAPT_11 is 245 clips, CHAPT_12
  is 163), then turn on airplane mode and walk **all 51 stops** — chapter 11's
  27 and chapter 12's 24.
  → **PASS / FAIL at: ______________**

- [ ] **Tap Say Paradigm on the ch11 reflexive stack, on all six charts.** Six
  halves share three clips there, so it is the surface most likely to expose a
  wrong id on device.
  → **All six speak / silent or wrong at: ______________**

- [ ] **Run one Augment Drill item on device.** Before choosing, confirm the
  lemma does not respond to a tap and Pronounce is greyed; after choosing,
  confirm both play the augmented form.
  → **PASS / FAIL: ______________**

- [ ] **Feel of the long translation clips.** Not a defect and not a question
  with a wrong answer — a heads-up, because the device is where it is felt.
  Rule A2 holds an item until its `afterGuess` clip finishes, and chapter 12's
  translation clips are the longest in the app: `l_td15` runs 9.6 s, `l_td20`
  9.2 s, `l_td3` 8.0 s. So a correct answer there can sit for nine seconds
  before advancing. That is the ratified rule working as specified; say so if it
  reads as a hang rather than as the sentence being read to you.
  → **Fine as is / too slow: ______________**

- [ ] **Anything that looks wrong.** Free text; a screenshot beats a
  description.
  → ______________________________________________

---

## 2. Appendix — settled this round, not asked

| Item | How it was settled |
| --- | --- |
| (b) the ch11 three-stage drills' answer keys, including every accepted alternative | Read from each page's own AnalyzeAnswer script (`0xd5c00-0xd7dc6` and `0xd9800-0xdb640`); 5H-SPEC1 R2 §1. The two "blank" Who and The prompts are ᾗ and ᾧ, forms whose composite iota-subscript code the shared converter had parked as a leading mark |
| (c) the ch12 Parsing Drill accepting both readings of ἔλυον and εἶχον | Read from the AnalyzeAnswer script at `0xab000-0xacb9e`; the data carries both tuples and the harness grades the alternate one correct |
| (i) the ch11 Scripture Memory Drill's cumulative pool | Read from the dispatch table at `0xa2ba4`: the first eight prompts play the Mat 6:33a position clips shipped forward (`j_sm1,2,3,4,5,8,10,11`) and the last four `k_sm2-5` |
| Per-item Hint switching actually works in the PORT | `ui-behavior.mjs`, `5H D-46 c11_drill_this_that` and `5H D-46 c12_drill_parsing`: the modal title changes between an οὗτος item and an ἐκεῖνος item, and between a λύω item and an εἰμί item |
| The `answerAlt` tuples grade correct on a three-stage item | `ui-behavior.mjs`, `5H ch11 answerAlt`: [This / Neuter / Genitive Singular] on τούτου commits as correct |
| The audio gate fires on the Augment Drill and nowhere else | `ui-behavior.mjs`, four `5H ch12 Augment Drill` assertions; the renderer's condition is a structural triple that matches one activity across twelve chapters |
| A Singular/Plural toggle keeps its say-all across states | `ui-behavior.mjs`, `5H ch11 named toggle` |
| The six-chart reflexive stack is bounded correctly | `ui-behavior.mjs`, `5H ch11 reflexive stack`: Back disabled at chart 1, More at chart 6, six distinct titles |
| The ch11 Scripture Memory grid is one static twelve-option pool | `ui-behavior.mjs`, `5H ch11 Scripture Memory Drill` |
| Every modal in both chapters fits at five device heights, with one divider and equal strips at forced scroll | `ui-modals.mjs` 235/235; `ui-disclosure.mjs` D13, 66 states over the eight new ch11/ch12 surfaces |
| All twenty new drills and exercises match their CONFIRMED ledger rows 96-115 | `ui-behavior.mjs` 5F ledger read-back, extended to both chapters |
| Every one of the 51 stops loads item 1 on mount and speaks only when its timing says to | `ui-disclosure3.mjs` 84/84, census 270 activities / 115 ledger rows / 15 changed / 251 already-loaded / 4 exempt |
| No chart clips at 320 px in either chapter | `ui-walk.mjs`: zero horizontal overflow across 51 stops, re-run after the 2026-08-26 data patch |
| Blank SayWord dispatches on ch11 This and That item 18 and ch12 Parsing item 23 | The chapter-10 item-18 class you already ruled on: the original's entry is empty and plays nothing, so the form's own cell clip is wired as a fidelity restoration. Item (q) is NOT this class and is asked |
| The ch12 Translation Drill's 21st dispatch entry, `l_td21` | Names a clip that was never shipped; ignored, exactly as ch10's `j_TvD2` was |
| Movable nu in both spellers | ἔλυε/ἔλυεν and εἶχε/εἶχεν are both accepted (D-33) |
| The Drill Menu title "Imperfect Parsing Indicative Drill" | The page's own "Imperfect Indicative Parsing Drill" prints on both surfaces, on the 5G precedent |
| The ano teleia after οὐρανοῖς and σου in the ch12 verse speller | Stored as U+00B7 and optional (C6/D-18) |
| One harness defect found while re-running for this document | The 5F advance-timing check gave a correct answer a fixed 7000 ms to auto-advance, but the rule it tests is max(2000 ms, clip) and `l_td11` is exactly 7000 ms long — so it passed or failed depending on which item the harness happened to draw. The window now stays open while a clip is still playing, with a 30 s backstop. No port behaviour changed; the run is 1058/1058 either way, and this note is here so the citation above says what it rests on |
