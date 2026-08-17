# DISCLOSURE-PATCH.md — Step 0 pipeline data pass, 2026-08-15

One consolidated note for the full ten-chapter data pass executed
after 5G closed. Base copies: the committed repo JSONs (ch1-10data.zip
export). Every file below is a FULL replacement.

## Files changed

chapt-01 through chapt-10.json (all ten) and lexicon-chapt08.json.
All parse clean; 17-point marker audit passes.

## Sequencing — which round commits what

- **chapt-09.json, chapt-10.json ride with 5G-SPEC2** (that round also
  implements the per-item hintRef and removes the Repeat control from
  the renderer).
- **chapt-01..08.json + lexicon-chapt08.json ride with
  DISCLOSURE-SPEC1** (that round implements R1-R7, honors poolKind,
  and swaps the ch1 Six Points button for the expander).
- Inert-until-renderer keys: `poolKind` (ch6/ch8), per-item `hintRef`
  + `hintCharts.eimiParadigms` (ch10), the ch1 Six Points expander,
  `termList` (ch2). Everything else renders on the current
  components (below-expanders and popups already exist app-wide).

## 5G closure edits (chapt-09, chapt-10)

- ch9 objective 6: Jn -> Rom 6:23b (D-44).
- ch9 Compound Verbs ἔρχομαι gloss -> "I come, go" (D-45).
- ch9 + ch10 SM spellers: "Repeat This Exercise" checkbox REMOVED
  (D-42 retired; DO-NOT-RE-ADD notes in both files).
- ch10 Parsing Drill: six future-εἰμί answers Middle -> ACTIVE (D-46),
  from the pixel-extracted 30/30 walkthrough key; `assemble_ch10.py`
  parse_form synced so regeneration reproduces.
- ch10 form-dependent Hint (D-47): hintCharts.eimiParadigms added
  (Present + Future εἰμί, titles verbatim from field 0xec4b2, present
  cells on the ch7-forwarded g_eimi* clips — all six confirmed in the
  CHAPT_10 pack); per-item hintRef on the ten εἰμί items.
- Both translation drills carry WALKTHROUGH-VERIFIED notes (ch9 14/14;
  ch10 30/31 covered, zero contradictions).
- _audioVerify updated: i_mpar intentional duplicate, i_voc11, l_eimi
  confirmed; j_palp = λύομεν duplicate; j_TvD2 unused phrase.

## Disclosure pass (edit log, verbatim from execution)

ch02 c2_learn_syllables/rules: 3 expanders interspersed (C2)
ch02 c2_learn_accents/placement: 3 expanders interspersed (C2)
ch02 c2_learn_accents/noaccents: 2 expanders interspersed (C2)
ch02 c2_learn_marks/breathing: 2 expanders interspersed (C2)
ch02 pos: Pronouns -> C3 link+popup (number excluded)
ch02 sentence: 4 expanders -> C3 links+popups (numbers excluded)
ch02 verbs: defList -> termList; 4 expanders -> C3 popups
ch03 c3_learn_english_concepts/voice: 3 expanders interspersed (C2)
ch03 c3_learn_english_concepts/person: 3 expanders interspersed (C2)
ch04 c4_learn_english_concepts/case: 3 expanders interspersed (C2), titled 'Examples'
ch04 c4_learn_nouns/inflectionalForms: 5 expanders interspersed (C2), titled 'Examples'
ch04 introduction: 2 expanders -> C3 links+popups
ch05 c5_learn_english_concepts/case: 3 expanders interspersed (C2), titled 'Examples'
ch05 c5_learn_nouns/inflectionalForms: 5 expanders interspersed (C2), titled 'Examples'
ch05 introduction: 2 expanders -> C3 links+popups
ch10 stemVariations: 5 link-popups -> "Examples" below-expanders (items promoted to dicts)
ch05 QR article: 6-col chart -> Singular + Plural stacked (C9)
ch01: Six Points -> standard expander (no visual change); Capitals Note two missing screens RESTORED inline from railwalk p6
ch08 threeUses: 3 expanders interspersed (C2), titled "Examples", wrapping the former popup bodies as wordUsage blocks (title + examples); popups asAPronoun/reflexiveIntensifier/adjectiveMeaningSame retired. OMITTED FROM THE 2026-08-15 PASS IN ERROR -- caught by an implementer STOP at DISCLOSURE-SPEC1 W1 and executed 2026-08-16.

## Provenance flags

- ch1 Capitals Note restoration is a RAILWALK TRANSCRIPTION
  (ch1railwalk.pdf p.6), not TBK bytes — byte-verify opportunistically
  when 1_ALPHABET.TBK is next mounted.
- ch7 "Examples" accordions wrap the former popup bodies as a
  `wordUsage` block (headword, gloss, condition, example verses) —
  same fields the popup renderer drew. ch8's variant (2026-08-16)
  carries title + examples only, mirroring its popups' own shape
  (no Greek headword) — wordUsage fields are optional-per-source.
- Assemblers for ch9/ch10 remain provenance tools; after this pass the
  repo JSONs are the source of truth (Stage 8.7), with assemble_ch10
  updated so a regeneration cannot resurrect the Middle answers.

## Second pass, 2026-08-16/17 (post-SPEC1 device review)

Base copies: the LIVE repo JSONs at `fae598e`. Full replacements:
chapt-04, chapt-05, chapt-07, chapt-08, chapt-10.

ONLY change: the 27 bare "Examples" accordion labels gain their
qualifiers per the amended DISCLOSURE-RULES §3.5 (Disclosure_Spike_
Review.pdf item 3; PDF checked clean of strikethrough).

ch04/ch05 (8 each, derived from the item labels): Subjective Case /
Objective Case / Possessive Case Examples; Nominative / Genitive /
Dative / Accusative / Vocative Form Examples.
ch07 (3): οὐ Examples; οὐκ Examples; οὐχ Examples. Greek in a title is
a control label, not an audio tap (amended §3.5).
ch08 (3): Pronoun Examples; Reflexive Intensifier Examples; "Same"
Examples. PIPELINE-CHOSEN short forms of "as a pronoun" / "reflexive
intensifier" / "adjective meaning \"same\"" -- listed for veto.
ch10 (5): Palatal / Labial / Dental / Liquid / Sibilant Examples.
