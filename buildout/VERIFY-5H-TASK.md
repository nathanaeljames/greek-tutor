# VERIFY-5H-TASK -- Authoring instructions for VERIFY-5H.md

Issued by the pipeline (Fable) 2026-08-26 for the winning 5H implementer.
Deliverable: `VERIFY-5H.md`, the human-in-the-loop document Nathanael
answers in DOSBox and on the device. Governing precedent: VERIFY-5G.md
(shape, numbering, one question per item, a proposed default on every
item that has one). Read 5H-SPEC1.md Revision 2 sections 8 and 9 and
your own RESULTS before writing a line.

## 0. Rules for the document

0.1 Ask for JUDGEMENT and DOSBox FACTS only. Anything a Playwright
    harness, `check:shapes`, or a data read can settle is NOT a VERIFY
    item; if you are tempted to ask it, settle it and cite the run.
0.2 Every item carries: the exact screen (chapter > page > topic/item
    number), the rail-walk page it corresponds to, what the port does
    today, the proposed default, and what changes if Nathanael says
    otherwise (data key, renderer, divergence entry).
0.3 Items are numbered continuously from the letters below; keep the
    letters so the spec, the ledger notes and the data's `_verify_note`
    strings stay cross-referenced.
0.4 No emoji. No bullet lists inside an item; prose or a two-column
    table.
0.5 Do not re-ask anything section 2 lists as SETTLED. Cite the
    settlement in a one-line appendix so Nathanael sees they were
    considered.
0.6 Where the port DELIBERATELY departs from the original, say so in
    the item; VERIFY is where Nathanael vetoes departures, and a
    departure he never sees is a silent divergence.

## 1. Items the pipeline supplies (carry them verbatim in substance)

(a) **Learn Relative Pronouns > Introduction (ch11railwalk p11-p12).**
    In the original, the Introduction radio shows the SAME box as the
    Reflexive/Reciprocal radio; Nathanael has confirmed this in DOSBox
    after refresh and back-and-forth navigation. The port shows
    different text. SOURCE OF THAT TEXT, stated plainly: it is the
    original's own data, not authored by the pipeline and not from any
    outside source -- two fields in 11_DEMON.TBK that the original's
    page never displays: 0x4136e, headed "Relative Pronouns" ("A
    relative pronoun often introduces a subordinate clause ... (Mounce,
    p. 109)") and 0x420fc, headed "Relative Pronouns (cont.)" (the two
    numbered points). Corroboration: the CHAPT_11 audio pack ships six
    clips no displayed screen references (k_agree1-4, k_under1-2),
    consistent with example text prepared for that page. The question:
    RESTORE (ship the TBK text under Introduction, as now, logged as a
    divergence like ch10's parsing item 18) or MIRROR (show the
    Reflexive/Reciprocal box twice, as the original does). Proposed
    default: RESTORE. Either way the "pending verification" banner is
    already removed (the key was renamed `_verify_note`; data and
    assembler patched 2026-08-26). If RESTORE: divergence entry D-51.
    If MIRROR: the Introduction topic's content becomes a copy of the
    Reflexive/Reciprocal blocks and D-51 records the duplication.

(d) **Augment Drill, Pronounce before guessing (ch12railwalk p8).**
    In DOSBox, does clicking Pronounce BEFORE choosing play the
    augmented form? The port gates the prompt (ink lemma, Pronounce
    disabled until answered). If the original leaks, the gate is a
    deliberate improvement (D-50, generalised: see section 3); if the
    original is silent or disabled before the guess, the port mirrors.

(e) **Ch12 Parsing Drill hint form-dependence (p8).** Confirm λύω items
    open the λύω Active + Middle/Passive charts and εἰμί/ἔχω items open
    "Imperfect of εἰμί" + "Imperfect of ἔχω"; confirm the Translation
    Drill's Hint opens the λύω charts only.

(f) **Ch11 hint form-dependence (p5, p6, p14).** Confirm This and That
    Drill and its Translation Drill switch between the οὗτος and
    ἐκεῖνος charts by item, and Who and The switches between the
    Definite Article and ὅς charts.

(g) **Ch12 Review Vocabulary Chart, μέν (p16).** The original prints
    "one the one hand, indeed (179)". The port ships it verbatim (typo
    policy A1); this is the note behind `_verify_note` on that page --
    nothing is displayed to the learner, the question is keep-or-fix.

(h) **Ch11 Relative and Reflexive Spelling Exercise, prompt 24.**
    Prints "whom (masc. nom. pl.)"; the answer is οἵ. Keep verbatim or
    print "who"?

(j) **Ch12 Form topic formula taps (p2-p3).** The port makes the whole
    line "ε + λυ + ο + ν = ἔλυον" one tap playing ἔλυον (the page's
    SayWord as1 entry). The rail walk shows hands on ε, λυ and ἔλυον
    separately. Does the original play anything on ε or λυ alone?

(k) **Listens (device or DOSBox):** K_OUTMFN (is it the three-form
    οὗτος/αὕτη/τοῦτο entry?), K_AUTOS, K_ALLHLW, K_VOC7 vs K_VOC7A/B/C,
    K_VOC10 vs K_VOC11 (which ὑπέρ sense), K_AUTPAR/K_SEAPAR/K_EAUPAR
    (which person each recites), L_AP3 (third-plural ἔλυον?) against
    the unreferenced L_A1S and L_AP9, L_EX1-14 order.

(l) **Disclosure vetoes** (5H-SPEC1 section 5 rows marked yes): the
    ch11 "Demonstratives" C6 accordion and its "Greek Examples" C3
    modal; the six-chart reflexive Back/More stack; the ch12 C5 merges
    of "Form (cont.)" and "Augments (cont.)"; the "Contraction
    Examples" C1 accordion; the ch12 Quick Review page title
    "Review Imperfect Paradigms" (plural, from the menu) over the
    page's singular.

(m) **Ch11 typographic slips in the original:** τοὺτου typed with a
    GRAVE in the Demonstrative Examples field (the drill pool has the
    acute); ἐκεῖνοί typed with NO breathing in This and That
    Translation item 13. Verbatim now; keep or fix?

(n) **Ch11 Vocabulary Spelling Exercise** has TEN items (ὑπέρ once,
    prompted "for, about (gen.)") while the chapter has eleven entries.
    Confirm in DOSBox that no eleventh prompt exists.

(o) **[new] Ch11 objectives taps.** The original page dispatches
    ἐκεῖνος -> k_ekemns and οὗτος -> k_outmns (WordSelection table on
    the Objectives page, 11_DEMON.TBK 0x5e176 region). The port ships
    the objectives as plain strings, so neither word taps. This is a
    PIPELINE gap, not yours: the fix is a data contract for objectives
    (an item may be `{text, audioMap}`) plus a one-line renderer read;
    it ships in the look-back spec (section 3). Ask only: confirm both
    words are taps in DOSBox.

(p) **[new] Shared say-all clips on split charts (ch11railwalk p4,
    p13, p20-p21).** The original records ONE "Say Paradigm" clip per
    paradigm (K_EKEPAR, K_OUTPAR, K_OSPAR, K_AUTPAR, K_SEAPAR,
    K_EAUPAR) reading singular then plural. The port splits each chart
    Singular/Plural and repeats the button on both halves, so the
    Plural half's button reads the singular forms first. Nathanael's
    interim ruling: modals keep the duplicated button; Quick Review
    pages get ONE button, placed after the Plural half. Ask him to
    confirm the ruling applies to the Learn toggles (only one half is
    visible at a time, so the button there is by construction the
    whole paradigm's) and whether clip splitting is wanted later
    (section 3).

## 2. SETTLED -- list in the appendix, do not ask

Revision 1 items (b) and (c) and (i): the ch11 three-stage drills'
and the ch12 Parsing Drill's answer keys, and the Scripture Memory
Drill's cumulative pool, were read from the TBK scripts and dispatch
tables (5H-SPEC1 R2 section 1). Anything your harness settled this
round (per-item hintRef switching, the answerAlt tuples, the
afterGuess gate firing on the Augment Drill and nowhere else, the
sg/pl toggle keeping its clip) is cited by run name, not asked.

## 3. What is NOT in VERIFY-5H (so nobody looks for it there)

The look-back pass over chapters 1-10 is a separate pipeline item,
LOOKBACK-SPEC1, scoped 2026-08-26 from TBK and data scans:

- Form-dependent hints: the TBK scan (a WordCounter conditional that
  shows a Hint object per item) finds NONE in chapters 1-7 and 9, the
  known one in 10, and TWO the port does not carry in chapter 8: the
  Autos Translation Drill (21 items, Hint/Hint2 by item; the port
  ships no hint at all there) and the Case Drill (Hint3/Hint2 by
  item; the port ships one hint). Pipeline data patch, then a small
  implementer verification.
- Audio-leak gate, generalised: afterGuess + Greek options + not
  autoBoth. Beyond the Augment Drill that is the ch3 Greek Verb Drill,
  ch4 Greek Noun Drill and ch5 First Declension Noun Drill (English
  prompt, Greek answer, Prev/Next). Excluded by ruling: every
  English-to-Greek vocabulary drill (autoBoth) and, proposed, every
  speller (pronouncing the target is the exercise's design).
- Shared say-all on split halves: chapter 11 only (six paradigms, 12
  Learn halves under toggles, 12 Quick Review halves). Chapters 1-10
  split only where the original had per-half clips (ch5 article, ch7
  adjectives, ch8 third person by gender).
- Greek in plain-string objectives: ch7 (εἰμί) and ch11 (ἐκεῖνος,
  οὗτος) only. Other plain-string surfaces with Greek (biblist,
  footnotes) are scanned in the same pass.

## 4. Format and handoff

Produce `VERIFY-5H.md` with sections: 0 How to answer (DOSBox vs
device vs judgement, one line each), 1 Items (a)-(p) in order, 2
Appendix: settled this round (one line each with the run or the TBK
offset). Nathanael returns `VERIFY-5H-RESULTS.md`; the pipeline turns
his answers into data patches and divergence entries; the winner
applies any renderer consequence as 5H-XPATCH1.
