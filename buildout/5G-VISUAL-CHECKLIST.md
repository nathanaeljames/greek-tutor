# 5G-VISUAL-CHECKLIST.md — chapters 9 and 10 against the rail walks

Standing mandate (CHAT-HANDOFF "Visual verification", ONBOARD-SOL §7):
every page built this round was loaded in a real browser, screenshotted
at 320px and 390px, and held **next to** the corresponding DOSBox panel
from `ch9railwalk.pdf` / `ch10railwalk.pdf`. The panels were extracted
with pymupdf (one PNG per panel, four per PDF page) so the comparison is
a side-by-side, not a squint — 55 panels for chapter 9, 58 for chapter
10.

**A screenshot at rest is not a pass** (5F-PATCH1). Every page below was
also interacted with: every topic stepped, every popup opened and
cancelled, every Hint opened and closed, every paradigm tapped. The
mechanical half of that is `npm run ui:walk` (which now opens every
popup on every page it walks) and `npm run ui:behavior`; this document
is the fidelity half — what the panel says versus what the page says.

Panel references are `pN-M` = page N of the rail-walk PDF, panel M
counting left-to-right, top-to-bottom.

---

## 0. Verdict

| | pages compared | matched as built | corrected this round | divergence logged |
|---|---|---|---|---|
| chapter 9 | 22 rail stops + 6 topics + 4 popups | 28 | 1 | 1 |
| chapter 10 | 22 rail stops + 8 topics + 5 popups | 28 | 5 | 2 |

Eight differences were found by holding the pages next to the panels,
and **six of them are data defects that no build-time check and no
interaction test could have caught** — the port faithfully rendered what
the pipeline extracted, and what the pipeline extracted was not what the
original prints. All eight are listed in §3 with before/after, and the
six data ones again in `5G-SPEC1-RESULTS.md` §4 where the pipeline can
absorb them.

---

## 1. Chapter 9 — Present Middle/Passive Verbs

| # | rail stop | panel | verdict |
|---|---|---|---|
| 1 | `c9_learn_objectives` | p1-2 | match. Six objectives, "1. 2. 3." markers (D-20 exception). Objective 6 keeps the original's "Jn 6:23b" typo verbatim — VERIFY-5G (e). |
| 2 | `c9_learn_english_concepts` / Definitions | p1-3 | match. Three paragraphs, blank line between each, "active voice" / "passive voice" / "middle voice" underlined. |
| 2 | ... / Identifying Traits | p1-4 | **CORRECTED** — see §3.1. The port now prints `"Zach is hit by what?" — the ball.`; the delivered data had a Greek-converted `ωηατ͂̔` where the original prints `what?"`. |
| 2 | ... / Translation | p2-1 | match. The four annotated examples are four lines in one indented block, each with its underlined helping verb and its em-dashed label. |
| 3 | `c9_learn_mp_verbs` / Introduction | p2-2 + p3-1 | match (the original's two More pages are one topic here, as in every ported chapter). `punctiliar` and `continuous` are blue links; the three middle functions are a numbered list with hanging indents; "deponent:" is an ordinary black underline, as in the panel — **not** a link (see §3.6). |
| 3 | ... / punctiliar, continuous popups | p2-3, p2-4 | match. One centred line each, Cancel returns. |
| 3 | ... / Present Middle Paradigm | p3-2 | match after the heading fix (§3.5): one heading, "Present Middle Indicative Paradigm", 2x3 grid, glosses under each form, Say Paradigm below. |
| 3 | ... / Present Passive Paradigm | p3-4 | match, same shape. `i_mpar` backs Say Paradigm — VERIFY-5G (a). |
| 3 | ... / Deponent Verbs | p4-2 + p4-4 | match. The panel title is blue in the original and is the link that opens the Deponent popup; "frequent verbs" is the second blue link. |
| 3 | ... / Deponent popup | p4-3 | match. Summers' note, one paragraph, Cancel. |
| 3 | ... / Frequently Used Deponent Verbs popup | p5-1 | match. Six Greek headwords with their glosses and NT counts, each headword tappable. |
| 3 | ... / Accompanying Cases | p5-2 + p5-4 | match. Lead paragraph, "This is accomplished by:", numbered 1) 2) with `by Zach.` and `by the ball` underlined. ὑπό and διά are blue here because they carry clips (directive 9); the original prints them black. |
| 3 | ... / Compound Verbs | p6-1 | match. Four rows, the preposition in parentheses beside the gloss and tappable on its own clip. The original's ἔρχομαι gloss "I go in, enter" ships verbatim — VERIFY-5G (f). |
| 4 | `c9_drill_parsing` | p6-4, p7-2, p7-3 | match. Six options in three paired rows reading across, exactly the panel's 2x3. Prompt, reference beneath, Previous/Next/Pronounce/Translate/Hint/Score, Pronounce Each on. |
| 4 | ... / Hint | p7-1 + p8-4 | match after §3.4: ONE popup, both paradigms stacked, one Close — the original shows one Cancel over both charts. |
| 5 | `c9_drill_translation` | p7-4, p8-1..3 | match. Two-line Greek prompt, reference under it, three full-sentence options stacked one per line. |
| 6 | `c9_ex_speller` | p9-1..3 | match. English prompt, Spell Greek field, shared keyboard, Show Answer / With Accents / Pronounce Each. |
| 7 | `c9_learn_vocab` | p9-4, p10-1 | match. Greek Word / Word Meaning panes, Show Both / Hide Greek / Hide English, Pronounce. |
| 8 | `c9_drill_vocab_gk_en` | p10-2 | match, except the grid stays two-up at 768px (D-32, extended this round). |
| 9 | `c9_drill_vocab_en_gk` | p10-3, p10-4, p11-1 | match, same D-32 note. |
| 10 | `c9_ex_vocab_speller` | p11-2..4 | match. |
| 11 | `c9_learn_scripture` | p12-1 | match. Interlinear Rom 6:23b, gloss under each word, Say Whole Verse. |
| 12 | `c9_drill_scripture_memory` | p12-2..4, p13-1 | match. Ten-option static grid. |
| 13 | `c9_ex_scripture_speller` | p13-2 | match plus the new **Repeat This Exercise** checkbox, default OFF (D-42; semantics pending VERIFY-5G (d)). The port has no Previous Page / Next Page pair: the whole verse is one field, which is how every ported whole-verse speller has worked since chapter 3. |
| 14 | `c9_qr_vocab` | (Quick Review menu p14-2) | match. Two columns, NT counts, Say Whole List, footnote. |
| 15 | `c9_qr_paradigms` | p7-1 (same charts) | match. Both charts on one page, no pager. |
| 16-21 | `c9_qr_scripture_*` (six verses) | p14-2 menu | match. Standard interlinear pages. |
| 22 | `c9_learn_bibliography` | p14-3 | match. Four entries, hanging indents, italic titles. |

## 2. Chapter 10 — Future Indicative Verbs

| # | rail stop | panel | verdict |
|---|---|---|---|
| 1 | `c10_learn_objectives` | p1-2 | match. |
| 2 | `c10_learn_english_concepts` | p1-3 | **CORRECTED** — see §3.3. No topic navigation at all (§4.2 of the spec); each quoted sentence now sits on its own indented line as the panel sets it. |
| 3 | `c10_learn_future_verbs` / Introduction | p1-4 + p2 (More pages) | match. Numbered 1) 2) 3) functions, then the centred three-line formula (Stem + Sigma + Ending / λύ + σ + ω / (λύσω — I will loose)). |
| 3 | ... / Future Active Paradigm | p2-1 | **CORRECTED** (§3.2 + §3.5): one heading, "Future Active Indicative Paradigm". |
| 3 | ... / Future Middle Paradigm | p2-3 | **CORRECTED**, same. |
| 3 | ... / 5 Stem Variations | p3-1 + p4-3 | match. Five numbered rules, each with its blue link; items 1-3 carry the bracket formula on a second, indented line, with `[ ]` and `==>` as literal text. |
| 3 | ... / palatal, labial, dental, liquid, sibilant popups | p3-2, p3-4, p4-1, p4-4, p5-1 | match after §3.7: the derivations line up in columns ("ἔχω ==> ἕξω" over "ἄγω ==> ἄξω") with the gloss beside them. |
| 3 | ... / Future of εἰμί | p5-2 | match. One heading, its Greek word tappable (`l_eimi`) — VERIFY-5G (c). |
| 3 | ... / Deponent Futures | p5-4 + p6-1 | **CORRECTED** (§3.2): γνώσομαι's gloss is "I will know"; the delivered data had "I will". Two-column chart under underlined Present / Future headers, future glosses only. |
| 3 | ... / Irregular Futures | p6-2 | match, glosses on both sides. The original does NOT underline these two headers while the port does (the spec says underlined for both; §5 of RESULTS). |
| 4 | `c10_drill_parsing` | p6-4, p7-2, p7-3 | match in content and reading order; the three stages are stacked with separators rather than columned (D-41). `optionGroups: [2,2,2]` reproduces the paired person rows exactly. |
| 4 | ... / Hint | p7-1, p8-1 | match: one popup, Future Active over Future Middle, one Close. |
| 5 | `c10_drill_translation` | p7-4, p8-2, p8-3 | **CORRECTED** (§3.8): the instruction line reads "Click on the correct translation", as the panel does. Two-line prompt, reference, three stacked options. |
| 6 | `c10_ex_speller` | p8-4, p9-1 | match. 18 items = the three paradigms. |
| 7 | `c10_ex_speller_roots` | p9-2..4 | match. 22 items = 11 present/future pairs; the second chapter-specific speller renders identically to the first, as the panels do. |
| 8 | `c10_learn_vocab` | p10-1 | match. Lexical forms ("ζωή, -ῆς, ἡ"). |
| 9-10 | `c10_drill_vocab_*` | p10-2..4, p11-1..4 | match; D-32 note as chapter 9. |
| 11 | `c10_ex_vocab_speller` | p12-1..3 | match. |
| 12 | `c10_learn_scripture` | p12-4 | match. Interlinear Mat 6:33a, eleven words. |
| 13 | `c10_drill_scripture_memory` | p13 | match. The repeated article is one option pair, "the (acc.)" / "the (gen.)". |
| 14 | `c10_ex_scripture_speller` | p14-1, p14-2 | match plus Repeat This Exercise (D-42). |
| 15 | `c10_qr_vocab` | p15-2 menu | match. |
| 16 | `c10_qr_paradigms` | p7-1 | match. Both charts stacked on one page. |
| 17-21 | `c10_qr_scripture_*` (six verses) | p15-2 menu | match. |
| 22 | `c10_learn_bibliography` | p14-3 | match. |

---

## 3. What the comparison changed

### 3.1 ch9 English Concepts: `ωηατ͂̔` where the original prints `what?"`
Panel p1-4 reads `"Zach is hit by what?"  -- the ball.` The delivered
`chapt-09.json` had `"Zach is hit by ωηατ͂̔ — the ball.` — the Greek-font
converter had taken the Latin letters `what` for Greek `ωηατ` and the
`?"` for a circumflex-plus-rough-breathing stack. The line is the whole
point of the topic ("place a 'by what' after the verb"), and it rendered
as nonsense Greek. Fixed in the data; the pipeline's `formula_conv`
guard needs to cover this field.

### 3.2 ch10 dropped words
Five fields lost their last word in extraction, all visible only against
the panel:
- Deponent Futures, γνώσομαι: gloss `"I will"` -> `"I will know"`
  (p5-4/p6-1 print "I will   know", the gap being two runs in the field).
- Four chart titles: `"Future Active Indicative"` ->
  `"Future Active Indicative Paradigm"` and the same for Middle, in the
  Learn topics and again in the Quick Review copies (p2-1, p2-3, p7-1).

### 3.3 ch10 English Concepts: the quotes belong on their own line
p1-3 sets each quoted sentence on its own indented line under its lead
("In the past we say," / `    "We went to college."`). The delivered data
had each pair as one flowing sentence. Rewritten as ONE para block per
pair with a `\n` and `flush: true` — the Stage 8.1-sanctioned shape for
a hard line break inside a paragraph, not three new blocks.

### 3.4 The composite Hint is stacked, not paged
p7-1 of both rail walks shows both paradigms in ONE panel under ONE
Cancel. The first implementation read `hintCharts.paradigmRefs` as a
More/Back stack. Rebuilt as a stack; the same rule now decides the Quick
Review pages (§4.8 / D-40's sibling rule in `check-content-shapes`).

### 3.5 One heading, not two
The original prints the topic label in its radio RAIL and the panel's
own heading inside the box; this port has no rail, so
"Present Middle Paradigm" and "Present Middle Indicative Paradigm" were
stacking. D-40 records the rule that fixed it and the surface assertion
that pins it.

### 3.6 "deponent:" was a link and should not be
p3-1 prints the numbered item's lead-in `deponent:` in plain black
underline. The port turned it blue because the chapters 6-8 convention
resolves an underlined run by SLUG, and chapter 9 happens to ship a
`deponent` popup opened from its topic title. The slug route is now
scoped to the popup shape it was built for; 5G's popups are reached only
by a link the data names. (A fidelity restoration, so not logged as a
divergence.)

### 3.7 The arrow derivations did not line up
Each row of a stem-variation popup was its own grid, so the second
arrow sat under the first future form. The block is one grid now and the
columns line up down the popup, as the panel prints them.

### 3.8 ch10 Translation Drill: one word too many in the instruction line
Panel p7-4 of the chapter-10 walk prints `Click on the correct
translation`; chapter 9's equivalent (rw9 p7-4) prints `Click on the
correct English translation`, and the chapter-10 data had chapter 9's
wording. Instruction text is directive-1 content and is never
ad-libbed in either direction, so the extra word is removed.

### 3.9 chapters 4 and 5: a line break the renderer had been swallowing
Not a chapter-9-or-10 page, but found by the same change. The Case
topic's numbered items already carried a `\n` — "Subjective case (Gk:
nominative):" then, on its own indented line, "He hit the ball." — and
the renderer collapsed it to a space, so the two ran together. ch4
railwalk p2-3 sets them on two lines exactly as the data says. A
fidelity restoration, so not a logged divergence, but it changes two
device-verified pages and RESULTS §2.6 says so. Chapter 1's Six Points
note carries `\n\n` instead — a paragraph break, not a set-apart line —
and the renderer now tells the two apart.

---

## 4. What is still open for Nathanael

Everything in §6 of `5G-SPEC1.md` — the nine VERIFY-5G items — plus one
observation the comparison raised that the spec does not cover:

- **Neither panel draws the "Repeat This Exercise" checkbox.** rw9 p13-2
  and rw10 p14-2 both show exactly one checkbox on the Scripture Memory
  Spelling Exercise — "With Accents". The spec says the control is
  present in both originals and the data records the label's address in
  the TBK, so the port ships it (default OFF), but the panels are page
  ONE of a paged entry surface and the control may be on page two, or
  may not be drawn at all. This is what VERIFY-5G (d) should establish
  FIRST; see RESULTS §5.4.

- **Irregular Futures headers.** The spec says both charts carry
  underlined Present/Future headers and the data agrees; panel p6-2
  shows the Irregular Futures headers **not** underlined while p5-4's
  Deponent Futures headers are. The spec wins per its own §0 and the
  port underlines both. Worth a keep-or-fix decision alongside items
  (e) and (f).
