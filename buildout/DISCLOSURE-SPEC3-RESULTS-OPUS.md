# DISCLOSURE-SPEC3-RESULTS-OPUS

Round: DISCLOSURE, revision 3. Implementer: Opus (claude-opus-5).
Base: repo head `967d47c` (the spec, the two amended rules files, and the two
delivered data files) on `e294683`. Date 2026-08-25.
**Nothing committed, nothing staged, nothing pushed.** Git was used read-only.

Authority: DISCLOSURE-RULES.md as further amended 2026-08-18 and
DRILL-BEHAVIOR-RULES.md as amended 2026-08-18 — the copies committed at
`967d47c`, which is what §0 asked for. Ratifying source:
Disclosure_Verify_Response.pdf items 1-7 plus the inline VERIFY responses.
Item 8 was "[nothing yet]"; nothing is built for it.

**ADDENDUM, 2026-08-25 (later the same day).** W8 shipped after the round's
first close: `ch5railwalk.pdf` arrived and Nathanael asked for the item to be
circled back on. §8 below is rewritten from BLOCKED to built; §0's disclosure
count and §9's table are updated with it. Nothing else in this document
changed, and no other work item was touched.

---

## 0. Gates

| Gate | Result |
| --- | --- |
| `npm run check:shapes` | PASS (0 failures) |
| `npm run build` | green |
| `npm run check:lazy-chunk` | PASS |
| `node scripts/ui-disclosure.mjs` | **206/206** (117 at base, +89: D13 rewritten and grown from 55 checks to 117; D16/D17/D18/D19 new, 16 between them; D20 added with the W8 addendum, 11) |
| `node scripts/ui-behavior.mjs` | **902/902** (861 at base, +41 across the new W1/W2/W3 blocks; one SPEC1 assertion adjusted) |
| `node scripts/ui-modals.mjs` | 155/155 modal states clean |
| `node scripts/ui-smoke-5f.mjs` | 73/73 over 70 rail stops |
| `node scripts/ui-walk.mjs` | 105 stops x 2 widths, no horizontal overflow, no console errors |
| `node scripts/ui-offline.mjs` (airplane mode) | 44 stops offline, 0 missing, refresh OK, no console errors |

`npm run check:docs` fails on 45 documents. **Pre-existing and unrelated**,
unchanged in cause since DISCLOSURE-SPEC1 RESULTS §7.1: the guard compares LF
blobs against a CRLF working tree and its heading normalizer (`/\s*\(.*$/`)
cannot strip a trailing parenthetical when the line ends `\r`, because `.` does
not match `\r`. The count moved 47 -> 45 because `DISCLOSURE-SPEC3.md` and
`VERIFY-DISCLOSURE.md` were committed at `967d47c` and now match HEAD. **This
round modified nothing under `buildout/` except its own three new
deliverables and its three new screenshot directories.**

### 0.1 Assertions this round deliberately changed (§9.1)

Three, each named here because §0 requires the changes to be auditable rather
than silent:

| Where | Was | Is | Why |
| --- | --- | --- | --- |
| `ui-behavior.mjs` — `5F §3 <ch> Learn Vocabulary steps through N cards` | counted N presses of Next from an empty start | counts the ARRIVAL as card 1 and presses N-1 times | W2. The pool size is what this asserts and it is unchanged; only the start moved. Decrementing the expected count instead would have let it pass silently at N-1. |
| `ui-disclosure.mjs` — `D13 … padding above and below the divider` | read `paddingBottom` off the scroller and `paddingTop` off the footer, and asked only that both be `>= 6` | **measures** the painted strips and asserts they are equal within 1px, at forced scroll, through every state | W7. The old form passed on the build the 2026-08-18 review then rejected: both declarations were >= 6 in ch8's footer while the strips the eye saw were 10px and 23px. |
| `ui-disclosure.mjs` — `D13 … exactly ONE divider` | looked for a `border-top` on `.pg-controls` / `.modal-actions` | looks for the scroller's `border-bottom` plus any top border or shadow OUTSIDE the scroller | W7. The divider moved owner; the assertion follows it, and now also fails on a second one appearing anywhere. |

No assertion was deleted. The Number-header underline §9.1 anticipated turned
out never to have had one — D16.3 is its inverse, written this round.

---

## 1. W1 — data verification

Both delivered files were already in the working copy, committed at `967d47c`.
Verified against `e294683` with a **structural JSON diff** (key-by-key over the
parsed trees, not a text diff). **Exactly five differences, all of them the
changes §1 names, and nothing else in either file:**

| File | Path | Change |
| --- | --- | --- |
| `chapt-07.json` | `.learn[3].audioMap` | ADDED `{ οὐκ: chapt_7_g_ouk, οὐχ: chapt_7_g_oux }` |
| `chapt-07.json` | `.learn[3]._audioMap_note` | ADDED |
| `chapt-08.json` | `…below[0].content[0].examples[0].audio` | `chapt_8_h_ex3r1` -> `chapt_8_h_ex3r2` |
| `chapt-08.json` | `…examples[1].audio` | `chapt_8_h_ex3r2` -> `chapt_8_h_ex3r1` |
| `chapt-08.json` | `…content[0]._audio_note` | ADDED |

No renderer work was needed for either: `audioMap` already folds into the
chapter tap map (`content.js` `chapterAudioMap`), and the ch8 topic is rendered
once and referenced twice. **Both files' effects are verified on screen and by
file**, not merely by diff:

- **ch7** — all three rule lines now carry a tap, each with the hand cursor, and
  each plays a **different** clip (D18.1-D18.3). The three accordion TITLES are
  still inert green control labels (D15.3): the new taps did not leak upward.
- **ch8** — the swap is asserted on **both surfaces**, by eviction-and-refetch
  rather than by hopeful click: the named clip is deleted from the audio store
  first, so a tap that claims it has to fetch it and the request log names the
  file. The pneuma verse fetches `ex3r2` and the Iesous verse `ex3r1`, on the
  Learn page **and** inside the Aὐτός Translation Drill's hint (which reaches
  the same topic through `contentRef`).

**The third file did not arrive.** `chapt-05.json` is byte-identical to
`e294683` and there is no `ch5railwalk.pdf` anywhere in the repo. See §8.

---

## 2. W2 — sequence-stepped activities load their first item

### 2.1 What changed, in one paragraph

`ContentAudio.svelte` gained `maybeInitialLoad`, which sets `idx = 0` the first
time items resolve and then calls **the same `onStep` the Next button calls**.
That is the whole of the audio policy: the rule is "as if Next had been pressed
once", so the mount does not declare what to pronounce — it asks the advance
path, which means a future change to what a step says moves the mount clip with
it and cannot drift. The four "Click Next to begin" screens are deleted; their
data keys (`ui.beginPrompt`, `ui.hint`) stay as inert provenance.

### 2.2 The census — every activity in all ten chapters

219 activities walked. **13 CHANGED, 4 EXEMPTED, 202 already-loaded.**

The four contentAudio modes below were the app's **entire** empty-start class.
Every other stepping surface already opened on item 1 — `SelectActivity`'s
`qIndex`, both spellers' `wordIndex`, `DivideActivity`/`PlaceAccentActivity`'s
item index, `topicPages`' `topicIndex` and `ReadingCategories`' `catIndex` all
start at 0 — and that is now asserted rather than assumed (one probe per
component type, W2.1).

**The 13 changed:**

| Ch | Activity | Mode | Pronounces on load? | Ledger row |
| --- | --- | --- | --- | --- |
| 1 | `c1_learn_letters` | stepper | **YES** — stepping plays `audioFull`, so mounting does | Learn stepper (not in ledger) |
| 1 | `c1_ex_pronounce` | selfCheckStepper | **NO** — advance is silent; the clip is Check Answer's | #7, `afterCheck` |
| 1 | `c1_ex_phonetic` | selfCheckSequence | **NO** — this exercise has no clip at all | #12, `none` |
| 1-10 | `c*_learn_vocab` (ten of them) | flashcard | **YES**, unless Hide Greek is on — P5a still governs card 1 exactly as it governs card 2 | Learn surface (not in ledger) |

**The 4 exempted** — all four of chapter 1's explore grids, `afterTap` in the
ledger, of which Letter Names and Sounds is the spec's named model. Each still
opens with no answer fields and still prints its instruction line ("Click on
letter to hear its name & sound"); the fields appear on the first **tap**.

| Ch | Activity | Ledger row |
| --- | --- | --- |
| 1 | `c1_drill_letter_names` | #1, `afterTap` |
| 1 | `c1_drill_translit` | #2, `afterTap` |
| 1 | `c1_drill_capitals` | #3, `afterTap` |
| 1 | `c1_drill_diphthong` | #4, `afterTap` |

The full 219-row table is §2.5.

### 2.3 The autoplay guard (W2.4)

`lib/audio.js` gained `playOnLoad`, and the mount clip is the only caller.
It differs from `play` in exactly two ways:

1. **A blocked-autoplay rejection is silent.** iOS refuses un-gestured audio
   with `NotAllowedError`; the ordinary path toasts on any non-abort failure,
   which would have put "Audio couldn't play" on screen every time a phone
   opened a Learn Vocabulary page. A **missing file** still toasts, because
   that one is a real fault.
2. **The refused clip is held for the first user gesture** and played once
   there — the platform's own contract, and it means the learner hears the card
   they are looking at rather than losing the clip. The held clip is abandoned
   the instant anything else claims the channel (`play`, `stop`, a route
   change, a topic switch), so it can never surface over a later screen.

**The item LOADS either way.** Loading and pronouncing are separate statements
in `maybeInitialLoad`, so a platform that refuses audio still gets item 1.

**How this was verified.** Chromium cannot refuse an un-gestured play the way
WebKit does, so the guard is verified structurally rather than by reproduction:
the mount clip goes through `playOnLoad`, `playOnLoad` is the only path that
sets `onLoad`, and `onLoad` is the only thing that suppresses the toast and
arms the gesture listener. What IS reproduced in the harness is the behaviour
that matters most — that mounting starts exactly as many clips as advancing
does, on all 13 activities (W2.2), and that no console error appears anywhere
in the walk. **A device pass is on the VERIFY list for the audible half.**

### 2.4 One judgment call worth flagging

`c1_ex_pronounce`'s begin screen printed `ui.hint` —
*"Click on 'Check Answer' to see if you are correct"* — rather than a literal
"Click Next to begin". I retired it with the other three. It is a begin prompt
in all but name (it was the empty screen's only text), and the shell already
prints that activity's own instruction line, *"What sound does this letter
make?"*, immediately above the card. Keeping it would have stacked two
instructions over a letter that is now visible. **The key stays in the data**;
say the word if you want the line back under the loaded letter.

### 2.5 Full census table

| Ch | Activity | Mode / type | Class | Ledger row / classification |
| --- | --- | --- | --- | --- |
| 1 | `c1_learn_objectives` | objectivesPage | already-loaded | not in ledger (Learn surface) |
| 1 | `c1_learn_letters` | stepper | **CHANGED** | not in ledger (Learn surface) |
| 1 | `c1_learn_translit` | equationChart | already-loaded | not in ledger (Learn surface) |
| 1 | `c1_learn_capitals` | equationChart | already-loaded | not in ledger (Learn surface) |
| 1 | `c1_learn_vowels` | vowelStair | already-loaded | not in ledger (Learn surface) |
| 1 | `c1_learn_diphthongs` | diphthongRows | already-loaded | not in ledger (Learn surface) |
| 1 | `c1_learn_iota_subscripts` | diphthongRows | already-loaded | not in ledger (Learn surface) |
| 1 | `c1_learn_history` | textPage | already-loaded | not in ledger (Learn surface) |
| 1 | `c1_learn_vocab` | flashcard | **CHANGED** | not in ledger (Learn surface) |
| 1 | `c1_learn_bibliography` | textPage | already-loaded | not in ledger (Learn surface) |
| 1 | `c1_drill_letter_names` | exploreGrid | **EXEMPTED** | ledger #1, `afterTap` |
| 1 | `c1_drill_translit` | exploreGrid | **EXEMPTED** | ledger #2, `afterTap` |
| 1 | `c1_drill_capitals` | exploreGrid | **EXEMPTED** | ledger #3, `afterTap` |
| 1 | `c1_drill_diphthong` | exploreGrid | **EXEMPTED** | ledger #4, `afterTap` |
| 1 | `c1_drill_vocab_gk_en` | fullOptionGrid | already-loaded | ledger #5, `beforeGuess` |
| 1 | `c1_drill_vocab_en_gk` | fullOptionGrid | already-loaded | ledger #6, `afterGuess` |
| 1 | `c1_ex_pronounce` | selfCheckStepper | **CHANGED** | ledger #7, `afterCheck` |
| 1 | `c1_ex_letter_to_name` | fullOptionGrid | already-loaded | ledger #8, `afterGuess` |
| 1 | `c1_ex_name_to_letter` | fullOptionGrid | already-loaded | ledger #9, `afterGuess` |
| 1 | `c1_ex_translit` | fullOptionGrid | already-loaded | ledger #10, `afterGuess` |
| 1 | `c1_ex_transcribe` | fullOptionGrid | already-loaded | ledger #11, `afterGuess` |
| 1 | `c1_ex_phonetic` | selfCheckSequence | **CHANGED** | ledger #12, `none` |
| 1 | `c1_ex_reading_people_places` | selfCheckSequence | already-loaded | ledger #13, `afterGuess` |
| 1 | `c1_ex_speller` | spell | already-loaded | ledger #14, `afterGuess` |
| 1 | `c1_qr_vocab` | reviewVocab | already-loaded | not in ledger (Learn surface) |
| 1 | `c1_qr_letters` | reviewLetters | already-loaded | not in ledger (Learn surface) |
| 2 | `c2_learn_objectives` | objectivesPage | already-loaded | not in ledger (Learn surface) |
| 2 | `c2_learn_syllables` | topicPages | already-loaded | not in ledger (Learn surface) |
| 2 | `c2_learn_accents` | topicPages | already-loaded | not in ledger (Learn surface) |
| 2 | `c2_learn_marks` | topicPages | already-loaded | not in ledger (Learn surface) |
| 2 | `c2_learn_grammar_review` | topicPages | already-loaded | not in ledger (Learn surface) |
| 2 | `c2_learn_vocab` | flashcard | **CHANGED** | not in ledger (Learn surface) |
| 2 | `c2_learn_bibliography` | textPage | already-loaded | not in ledger (Learn surface) |
| 2 | `c2_drill_syllable_counting` | fullOptionGrid | already-loaded | ledger #15, `beforeGuess` |
| 2 | `c2_drill_accent_rule` | fullOptionGrid | already-loaded | ledger #16, `beforeGuess` |
| 2 | `c2_drill_marking_recognition` | fullOptionGrid | already-loaded | ledger #17, `beforeGuess` |
| 2 | `c2_drill_part_of_speech` | fullOptionGrid | already-loaded | ledger #18, `none` |
| 2 | `c2_drill_vocab_gk_en` | fullOptionGrid | already-loaded | ledger #19, `beforeGuess` |
| 2 | `c2_drill_vocab_en_gk` | fullOptionGrid | already-loaded | ledger #20, `afterGuess` |
| 2 | `c2_ex_syllable_division` | divide | already-loaded | ledger #21, `afterGuess` |
| 2 | `c2_ex_accent_placement` | placeAccent | already-loaded | ledger #22, `afterGuess` |
| 2 | `c2_ex_speller` | spell | already-loaded | ledger #23, `afterGuess` |
| 2 | `c2_qr_syllables` | textPage | already-loaded | not in ledger (Learn surface) |
| 2 | `c2_qr_accents` | textPage | already-loaded | not in ledger (Learn surface) |
| 2 | `c2_qr_marks` | textPage | already-loaded | not in ledger (Learn surface) |
| 2 | `c2_qr_vocab` | reviewVocab | already-loaded | not in ledger (Learn surface) |
| 3 | `c3_learn_objectives` | objectivesPage | already-loaded | not in ledger (Learn surface) |
| 3 | `c3_learn_english_concepts` | topicPages | already-loaded | not in ledger (Learn surface) |
| 3 | `c3_learn_verbs` | topicPages | already-loaded | not in ledger (Learn surface) |
| 3 | `c3_learn_vocab` | flashcard | **CHANGED** | not in ledger (Learn surface) |
| 3 | `c3_learn_scripture` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 3 | `c3_learn_bibliography` | textPage | already-loaded | not in ledger (Learn surface) |
| 3 | `c3_drill_verb_translating` | fullOptionGrid | already-loaded | ledger #24, `beforeGuess` |
| 3 | `c3_drill_greek_verb` | fullOptionGrid | already-loaded | ledger #25, `afterGuess` |
| 3 | `c3_drill_parsing` | fullOptionGrid | already-loaded | ledger #26, `beforeGuess` |
| 3 | `c3_drill_vocab_gk_en` | fullOptionGrid | already-loaded | ledger #27, `beforeGuess` |
| 3 | `c3_drill_vocab_en_gk` | fullOptionGrid | already-loaded | ledger #28, `afterGuess` |
| 3 | `c3_drill_scripture_memory` | fullOptionGrid | already-loaded | ledger #29, `beforeGuess` |
| 3 | `c3_ex_verb_speller` | spell | already-loaded | ledger #30, `afterGuess` |
| 3 | `c3_ex_vocab_speller` | spell | already-loaded | ledger #31, `afterGuess` |
| 3 | `c3_ex_scripture_speller` | spellVerse | already-loaded | ledger #32, `afterGuess` |
| 3 | `c3_qr_vocab` | reviewVocab | already-loaded | not in ledger (Learn surface) |
| 3 | `c3_qr_paradigm` | paradigmChart | already-loaded | not in ledger (Learn surface) |
| 3 | `c3_qr_scripture` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 4 | `c4_learn_objectives` | objectivesPage | already-loaded | not in ledger (Learn surface) |
| 4 | `c4_learn_english_concepts` | topicPages | already-loaded | not in ledger (Learn surface) |
| 4 | `c4_learn_nouns` | topicPages | already-loaded | not in ledger (Learn surface) |
| 4 | `c4_learn_vocab` | flashcard | **CHANGED** | not in ledger (Learn surface) |
| 4 | `c4_learn_scripture` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 4 | `c4_learn_bibliography` | textPage | already-loaded | not in ledger (Learn surface) |
| 4 | `c4_drill_greek_noun` | fullOptionGrid | already-loaded | ledger #33, `afterGuess` |
| 4 | `c4_drill_declining` | fullOptionGrid | already-loaded | ledger #34, `beforeGuess` |
| 4 | `c4_drill_vocab_gk_en` | fullOptionGrid | already-loaded | ledger #35, `beforeGuess` |
| 4 | `c4_drill_vocab_en_gk` | fullOptionGrid | already-loaded | ledger #36, `afterGuess` |
| 4 | `c4_drill_scripture_memory` | fullOptionGrid | already-loaded | ledger #37, `beforeGuess` |
| 4 | `c4_ex_noun_speller` | spell | already-loaded | ledger #38, `afterGuess` |
| 4 | `c4_ex_vocab_speller` | spell | already-loaded | ledger #39, `afterGuess` |
| 4 | `c4_ex_scripture_speller` | spellVerse | already-loaded | ledger #40, `afterGuess` |
| 4 | `c4_qr_vocab` | reviewVocab | already-loaded | not in ledger (Learn surface) |
| 4 | `c4_qr_nouns` | paradigmChart | already-loaded | not in ledger (Learn surface) |
| 4 | `c4_qr_scripture_a` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 4 | `c4_qr_scripture_b` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 5 | `c5_learn_objectives` | objectivesPage | already-loaded | not in ledger (Learn surface) |
| 5 | `c5_learn_english_concepts` | topicPages | already-loaded | not in ledger (Learn surface) |
| 5 | `c5_learn_nouns` | topicPages | already-loaded | not in ledger (Learn surface) |
| 5 | `c5_learn_article` | topicPages | already-loaded | not in ledger (Learn surface) |
| 5 | `c5_learn_vocab` | flashcard | **CHANGED** | not in ledger (Learn surface) |
| 5 | `c5_learn_scripture` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 5 | `c5_learn_bibliography` | textPage | already-loaded | not in ledger (Learn surface) |
| 5 | `c5_drill_first_decl_noun` | fullOptionGrid | already-loaded | ledger #41, `afterGuess` |
| 5 | `c5_drill_declining` | fullOptionGrid | already-loaded | ledger #42, `beforeGuess` |
| 5 | `c5_drill_article` | fullOptionGrid | already-loaded | ledger #43, `beforeGuess` |
| 5 | `c5_drill_vocab_gk_en` | fullOptionGrid | already-loaded | ledger #44, `beforeGuess` |
| 5 | `c5_drill_vocab_en_gk` | fullOptionGrid | already-loaded | ledger #45, `afterGuess` |
| 5 | `c5_drill_scripture_memory` | fullOptionGrid | already-loaded | ledger #46, `beforeGuess` |
| 5 | `c5_ex_noun_speller` | spell | already-loaded | ledger #47, `afterGuess` |
| 5 | `c5_ex_article_speller` | spell | already-loaded | ledger #48, `afterGuess` |
| 5 | `c5_ex_vocab_speller` | spell | already-loaded | ledger #49, `afterGuess` |
| 5 | `c5_ex_scripture_speller` | spellVerse | already-loaded | ledger #50, `afterGuess` |
| 5 | `c5_qr_vocab` | reviewVocab | already-loaded | not in ledger (Learn surface) |
| 5 | `c5_qr_nouns` | paradigmChart | already-loaded | not in ledger (Learn surface) |
| 5 | `c5_qr_article` | paradigmChart | already-loaded | not in ledger (Learn surface) |
| 5 | `c5_qr_scripture_146a` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 5 | `c5_qr_scripture_146b` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 5 | `c5_qr_scripture_rom` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 6 | `c6_learn_objectives` | objectivesPage | already-loaded | not in ledger (Learn surface) |
| 6 | `c6_learn_english_concepts` | topicPages | already-loaded | not in ledger (Learn surface) |
| 6 | `c6_learn_prepositions` | topicPages | already-loaded | not in ledger (Learn surface) |
| 6 | `c6_learn_vocab` | flashcard | **CHANGED** | not in ledger (Learn surface) |
| 6 | `c6_learn_scripture` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 6 | `c6_learn_bibliography` | textPage | already-loaded | not in ledger (Learn surface) |
| 6 | `c6_drill_case` | fullOptionGrid | already-loaded | ledger #51, `beforeGuess` |
| 6 | `c6_drill_translation` | fullOptionGrid | already-loaded | ledger #52, `afterGuess` |
| 6 | `c6_drill_vocab_gk_en` | fullOptionGrid | already-loaded | ledger #53, `beforeGuess` |
| 6 | `c6_drill_vocab_en_gk` | fullOptionGrid | already-loaded | ledger #54, `afterGuess` |
| 6 | `c6_drill_scripture_memory` | fullOptionGrid | already-loaded | ledger #55, `beforeGuess` |
| 6 | `c6_ex_speller` | spell | already-loaded | ledger #56, `afterGuess` |
| 6 | `c6_ex_vocab_speller` | spell | already-loaded | ledger #57, `afterGuess` |
| 6 | `c6_ex_scripture_speller` | spellVerse | already-loaded | ledger #58, `afterGuess` |
| 6 | `c6_qr_vocab` | reviewVocab | already-loaded | not in ledger (Learn surface) |
| 6 | `c6_qr_prepositions` | textPage | already-loaded | not in ledger (Learn surface) |
| 6 | `c6_qr_scripture_146a` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 6 | `c6_qr_scripture_146b` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 6 | `c6_qr_scripture_rom` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 6 | `c6_qr_scripture_jn11` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 7 | `c7_learn_objectives` | objectivesPage | already-loaded | not in ledger (Learn surface) |
| 7 | `c7_learn_english_concepts` | topicPages | already-loaded | not in ledger (Learn surface) |
| 7 | `c7_learn_adjectives` | topicPages | already-loaded | not in ledger (Learn surface) |
| 7 | `c7_learn_eimi` | topicPages | already-loaded | not in ledger (Learn surface) |
| 7 | `c7_learn_vocab` | flashcard | **CHANGED** | not in ledger (Learn surface) |
| 7 | `c7_learn_scripture` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 7 | `c7_learn_bibliography` | textPage | already-loaded | not in ledger (Learn surface) |
| 7 | `c7_drill_case` | fullOptionGrid | already-loaded | ledger #59, `beforeGuess` |
| 7 | `c7_drill_translation` | fullOptionGrid | already-loaded | ledger #60, `afterGuess` |
| 7 | `c7_drill_parsing_eimi` | fullOptionGrid | already-loaded | ledger #61, `beforeGuess` |
| 7 | `c7_drill_translation_eimi` | fullOptionGrid | already-loaded | ledger #62, `afterGuess` |
| 7 | `c7_drill_vocab_gk_en` | fullOptionGrid | already-loaded | ledger #63, `beforeGuess` |
| 7 | `c7_drill_vocab_en_gk` | fullOptionGrid | already-loaded | ledger #64, `afterGuess` |
| 7 | `c7_drill_scripture_memory` | fullOptionGrid | already-loaded | ledger #65, `beforeGuess` |
| 7 | `c7_ex_speller` | spell | already-loaded | ledger #66, `afterGuess` |
| 7 | `c7_ex_speller_eimi` | spell | already-loaded | ledger #67, `afterGuess` |
| 7 | `c7_ex_vocab_speller` | spell | already-loaded | ledger #68, `afterGuess` |
| 7 | `c7_ex_scripture_speller` | spellVerse | already-loaded | ledger #69, `afterGuess` |
| 7 | `c7_qr_vocab` | reviewVocab | already-loaded | not in ledger (Learn surface) |
| 7 | `c7_qr_adjectives` | paradigmChart | already-loaded | not in ledger (Learn surface) |
| 7 | `c7_qr_eimi` | paradigmChart | already-loaded | not in ledger (Learn surface) |
| 7 | `c7_qr_scripture_146a` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 7 | `c7_qr_scripture_146b` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 7 | `c7_qr_scripture_rom` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 7 | `c7_qr_scripture_jn11` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 8 | `c8_learn_objectives` | objectivesPage | already-loaded | not in ledger (Learn surface) |
| 8 | `c8_learn_english_concepts` | topicPages | already-loaded | not in ledger (Learn surface) |
| 8 | `c8_learn_pronouns` | topicPages | already-loaded | not in ledger (Learn surface) |
| 8 | `c8_learn_third_person` | topicPages | already-loaded | not in ledger (Learn surface) |
| 8 | `c8_learn_vocab` | flashcard | **CHANGED** | not in ledger (Learn surface) |
| 8 | `c8_learn_scripture` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 8 | `c8_learn_bibliography` | textPage | already-loaded | not in ledger (Learn surface) |
| 8 | `c8_drill_translation` | fullOptionGrid | already-loaded | ledger #71, `afterGuess` |
| 8 | `c8_drill_translation_autos` | fullOptionGrid | already-loaded | ledger #72, `afterGuess` |
| 8 | `c8_drill_case` | twoStageGrid | already-loaded | ledger #70, `beforeGuess` |
| 8 | `c8_drill_vocab_gk_en` | fullOptionGrid | already-loaded | ledger #73, `beforeGuess` |
| 8 | `c8_drill_vocab_en_gk` | fullOptionGrid | already-loaded | ledger #74, `afterGuess` |
| 8 | `c8_drill_scripture_memory` | fullOptionGrid | already-loaded | ledger #75, `beforeGuess` |
| 8 | `c8_ex_speller` | spell | already-loaded | ledger #76, `afterGuess` |
| 8 | `c8_ex_vocab_speller` | spell | already-loaded | ledger #77, `afterGuess` |
| 8 | `c8_ex_scripture_speller` | spellVerse | already-loaded | ledger #78, `afterGuess` |
| 8 | `c8_qr_vocab` | reviewVocab | already-loaded | not in ledger (Learn surface) |
| 8 | `c8_qr_first` | paradigmChart | already-loaded | not in ledger (Learn surface) |
| 8 | `c8_qr_second` | paradigmChart | already-loaded | not in ledger (Learn surface) |
| 8 | `c8_qr_third` | paradigmChart | already-loaded | not in ledger (Learn surface) |
| 8 | `c8_qr_scripture_146a` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 8 | `c8_qr_scripture_146b` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 8 | `c8_qr_scripture_rom323` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 8 | `c8_qr_scripture_jn11` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 8 | `c8_qr_scripture_rom623` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 9 | `c9_learn_objectives` | objectivesPage | already-loaded | not in ledger (Learn surface) |
| 9 | `c9_learn_english_concepts` | topicPages | already-loaded | not in ledger (Learn surface) |
| 9 | `c9_learn_mp_verbs` | topicPages | already-loaded | not in ledger (Learn surface) |
| 9 | `c9_learn_vocab` | flashcard | **CHANGED** | not in ledger (Learn surface) |
| 9 | `c9_learn_scripture` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 9 | `c9_learn_bibliography` | textPage | already-loaded | not in ledger (Learn surface) |
| 9 | `c9_drill_parsing` | fullOptionGrid | already-loaded | ledger #79, `beforeGuess` |
| 9 | `c9_drill_translation` | fullOptionGrid | already-loaded | ledger #80, `afterGuess` |
| 9 | `c9_drill_vocab_gk_en` | fullOptionGrid | already-loaded | ledger #81, `beforeGuess` |
| 9 | `c9_drill_vocab_en_gk` | fullOptionGrid | already-loaded | ledger #82, `afterGuess` |
| 9 | `c9_drill_scripture_memory` | fullOptionGrid | already-loaded | ledger #83, `beforeGuess` |
| 9 | `c9_ex_speller` | spell | already-loaded | ledger #84, `afterGuess` |
| 9 | `c9_ex_vocab_speller` | spell | already-loaded | ledger #85, `afterGuess` |
| 9 | `c9_ex_scripture_speller` | spellVerse | already-loaded | ledger #86, `afterGuess` |
| 9 | `c9_qr_vocab` | reviewVocab | already-loaded | not in ledger (Learn surface) |
| 9 | `c9_qr_paradigms` | paradigmChart | already-loaded | not in ledger (Learn surface) |
| 9 | `c9_qr_scripture_146a` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 9 | `c9_qr_scripture_146b` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 9 | `c9_qr_scripture_rom323` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 9 | `c9_qr_scripture_jn11` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 9 | `c9_qr_scripture_rom623a` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 9 | `c9_qr_scripture_rom623b` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 10 | `c10_learn_objectives` | objectivesPage | already-loaded | not in ledger (Learn surface) |
| 10 | `c10_learn_english_concepts` | topicPages | already-loaded | not in ledger (Learn surface) |
| 10 | `c10_learn_future_verbs` | topicPages | already-loaded | not in ledger (Learn surface) |
| 10 | `c10_learn_vocab` | flashcard | **CHANGED** | not in ledger (Learn surface) |
| 10 | `c10_learn_scripture` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 10 | `c10_learn_bibliography` | textPage | already-loaded | not in ledger (Learn surface) |
| 10 | `c10_drill_parsing` | twoStageGrid | already-loaded | ledger #87, `beforeGuess` |
| 10 | `c10_drill_translation` | fullOptionGrid | already-loaded | ledger #88, `afterGuess` |
| 10 | `c10_drill_vocab_gk_en` | fullOptionGrid | already-loaded | ledger #89, `beforeGuess` |
| 10 | `c10_drill_vocab_en_gk` | fullOptionGrid | already-loaded | ledger #90, `afterGuess` |
| 10 | `c10_drill_scripture_memory` | fullOptionGrid | already-loaded | ledger #91, `beforeGuess` |
| 10 | `c10_ex_speller` | spell | already-loaded | ledger #92, `afterGuess` |
| 10 | `c10_ex_speller_roots` | spell | already-loaded | ledger #93, `afterGuess` |
| 10 | `c10_ex_vocab_speller` | spell | already-loaded | ledger #94, `afterGuess` |
| 10 | `c10_ex_scripture_speller` | spellVerse | already-loaded | ledger #95, `afterGuess` |
| 10 | `c10_qr_vocab` | reviewVocab | already-loaded | not in ledger (Learn surface) |
| 10 | `c10_qr_paradigms` | paradigmChart | already-loaded | not in ledger (Learn surface) |
| 10 | `c10_qr_scripture_rom323` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 10 | `c10_qr_scripture_jn11` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 10 | `c10_qr_scripture_rom623a` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 10 | `c10_qr_scripture_rom623b` | interlinearVerse | already-loaded | not in ledger (Learn surface) |
| 10 | `c10_qr_scripture_mat633a` | interlinearVerse | already-loaded | not in ledger (Learn surface) |

---

## 3. W3 — the keyboard's Shift key

### 3.1 Layout

The bottom row is now **Shift + space bar**, on one line, `flex-wrap: nowrap`.
The punctuation keys moved up to a row of their own.

That is not a liberty — it is the only arrangement in which your instruction
means anything. The space bar had *already* wrapped clear of the five
punctuation keys at every width the app supports (five 44px keys plus gaps
leave 85px inside 390px, under the bar's 140px flex-basis), so a Shift key
parked at the head of the punctuation row would have cost the space bar
**nothing**. With the two sharing a line, "subtract its width from the
spacebar" is literally true and unconditional: Shift is `flex: 0 0 auto` at
62px, the bar is `flex: 1 1 0`, so the bar is exactly the row minus 62px minus
one 5px gap, at 320px and at 390px alike. Measured: 320px row = 62 + 5 + 193;
390px row = 62 + 5 + 263. No wrap, no overflow (W3.2/W3.5).

**One consequence to eyeball**: the punctuation keys now **stretch** to fill
their row (`flex: 1 1 44px`), because the space bar leaving it would otherwise
have left a ragged right edge. Same five keys, same order, nothing added or
removed. Checklist row 3.1.

### 3.2 Behaviour

One-shot, like a phone keyboard. Tap Shift: the key inverts to teal-on-white
and **every letter face becomes its capital**, so you can see what the next tap
will type rather than having to try one. Tap a letter: the capital is typed and
the state reverts by itself. Tap Shift twice: disarmed. Only a **letter** tile
spends the shift — marks, composites and punctuation leave it armed, which is
what §3.2's own wording asks for ("the next letter tile types its capital").

The state lives in `SpellerKeyboard.svelte` and the component dispatches the
character it has already resolved, so **neither speller learns that a shift key
exists**. That is deliberate: two hosts with two ideas of when a shift is spent
is the D-15 fork this component exists to prevent, and it is where the
VERIFY-5D A6 defects lived. Present on all 29 spell surfaces in the app.

### 3.3 The capital table

Written out rather than derived from `toUpperCase()`, for two reasons that are
not style:

- **ς.** Unicode gives final sigma the same capital as medial sigma. W3.3 names
  that behaviour, so the table names it: `ς -> Σ`, `σ -> Σ`.
- **The composites.** `'ᾳ'.toUpperCase()` is `'ΑΙ'` — **two** characters, the
  Unicode full-uppercase mapping for an iota subscript. A shift key that turned
  one tile into two letters would be a spelling bug. Only the 25 letter tiles
  are in the table; a composite, a mark or a punctuation tile is not a key that
  shifts.

### 3.4 Physical-keyboard parity and the checker

`greekForKey(key)` is exported from the same module and is now the single entry
point both spellers use: it folds the key for the lookup and applies the
capital table when the key was upper case. `Shift+A -> Α`, `Shift+J -> Σ`.

**Scoring is unchanged.** `answer-check.js` still folds case at both "With
Accents" settings. The file's comment used to say the keyboard has no capitals
and that the Phase 0 decision was to keep it that way; it now says why the
folding survives the keyboard getting some — W3.1 is explicit that this is an
input capability, and making the port start rejecting χριστός after ten
chapters of accepting it would be a regression dressed as a feature. Verified
by round-trip: a chapter-1 word typed with its first letter capitalized still
grades **correct** (W3.1).

---

## 4. W4 — the half-screen modal bug

### 4.1 What was built

`lib/viewport.js`, two defences, because either alone would be a guess:

**Measure more often (W4.1).** Added `pageshow` (WebKit's back/forward-cache
resume, the path that drops `resize` on an iOS PWA), `visibilitychange` ->
visible (a foregrounding that does not go through bfcache), and `focusout` (the
keyboard being dismissed, which is where a phantom height is born). All three
go through the existing per-frame coalescer, so a resume that fires all three
still measures once.

**And AT EVERY MODAL OPEN, before first paint.** This landed in the
`MutationObserver` the file already had rather than in a per-modal hook. A
MutationObserver callback is a **microtask**: it runs at the end of the task
that inserted the node and before the browser renders it, so an overlay that
has just appeared can be measured for while it is still unpainted. One door,
and no dialog — including one written next year — has to remember to use it.
`apply()` for that case only; ordinary Svelte re-renders stay coalesced.

**Refuse an implausible height (W4.2).** A published height below **60%** of
`window.innerHeight` while **nothing editable is focused** cannot be a
keyboard, because a keyboard implies a focused field. `innerHeight` is
published instead and a re-measure is scheduled for the next frame.

**The threshold, and why 0.6.** It has to sit below every legitimate short
viewport and above the keyboard case. iOS software keyboards take 40-55% of the
screen, leaving 45-60%; the browser toolbars this file already exists to handle
take 12-20%, leaving 80-88%. There is a wide gap and 0.6 is in it. Pinch-zoom
also shrinks the visual viewport, but zooming takes a gesture and cannot happen
while the app is backgrounded — and the next-frame re-measure restores it
anyway.

Nothing the file already handled was touched: the svh/vh fallback chain, the
chrome-top/bottom rects and the per-frame coalescing are as they were.

### 4.2 Definition of done, honoured literally (W4.4)

**This is NOT claimed fixed.** The root cause is a hypothesis with a strong
circumstantial fit — kill-and-restart curing it is exactly what "the height is
stale" predicts — and the trigger is a real iOS resume, which Chromium is not.
What is proven, in D19, with `visualViewport` replaced by a controllable
stand-in installed before the app boots (nothing in `src/` knows):

| | Claim | Result |
| --- | --- | --- |
| D19.1 | a short height **with an editable focused** is honoured — a real keyboard is not clamped | 382px published, 382px honoured |
| D19.2 | the clamp **rejects a phantom** (short, nothing focused) | 382px refused, 780px published |
| D19.3 | a legitimately short viewport (toolbars) is **not** clamped | 663px published untouched |
| D19.4 | a **silent** height change leaves the published value stale — the bug's own shape, which no clamp can catch | 663px, stale by design |
| D19.5 | **opening a modal re-measures**, and the dialog is sized to the real viewport | overlay 780px against a stale 663px |

D19.4/D19.5 together are the important pair: they show the failure the clamp
cannot see, and then the trigger that catches it anyway.

**It stays a VERIFY device-soak item.**

---

## 5. W5 — green underline is exclusive to tappable elements

### 5.1 The ch8 Number chart

`headerUnderline` is now inert provenance, like `numberPopupRef`: the
`head-underline` class binding is deleted from `RichContent.svelte` and the
`.rc-greekrows.head-underline .rc-greekhead span` rule is deleted from
`app.css`. There is no path left that can act on the key, which is what makes
this a removal rather than a rule waiting to be re-enabled. The headers print
plain; the header rule under them still separates head from rows, so the chart
still reads as a chart (checklist 5.1).

### 5.2 The app-wide audit, and what it found

Swept **before** the fix and again after: every activity in all ten chapters,
every topic, with **every accordion opened** so bodies were judged too — a
closed accordion hides its body from `getComputedStyle` entirely, and an
offender inside one would have been invisible. 306 screens.

**Three hosts found, all of them authored `[[u]]` runs sitting inside green
text.** All three now render without the underline:

| Host | Where | What it was marking |
| --- | --- | --- |
| `.rc-term` | ch6 Learn English Concepts, topic 1 | the term half of a definition row ("on", "after") |
| `.rc-greekgloss` | ch7 Learn Adjectives, topics 4-7 | the adjective inside the English gloss under an example verse |
| `.rc-pfhead` | ch10 Learn Future Verbs, topics 6-7 | the **Present** / **Future** column headers |

Two of those are plainly the amendment's own case — column labels and a chart
header. **The third is a real editorial loss and I want it flagged rather than
buried**: in ch7 the underline was marking *which word in the gloss is the
adjective* ("good", "last", "righteous"), and that cue is now gone. The
alternative would have been to keep it in a non-green treatment, which is a
style neither the original nor any rule authorises, so I applied the rule as
written. Checklist row 5.4; a one-line veto restores it.

### 5.3 `[[u]]` in prose is untouched (W5.3)

The same sweep found **fifteen** distinct `<u>` hosts in the app: the three
green ones above, and **twelve INK ones, which keep their authored underlines** — chapter
2's grammar pages, chapter 3's and 4's rule lists, chapter 7's example lines,
the select drills' underlined sentence fragments. The rule the app now enforces
is mechanical and states itself: **green underline means "tap me"; ink
underline means emphasis.**

The CSS is three selectors (`.rc-term u, .rc-greekgloss u, .rc-pfhead u`)
rather than one broad `.rich u` rule, because the broad version would have
flattened every ink underline as well. **The list is not the guard** — D16.1 is:
it sweeps 306 screens for anything computing green **and** underlined that is
not a link, a button or a summary, and names the offender in its own failure
text. Result: **zero**.

---

## 6. W6 — title links go green

**The answer to the review's question is: no rule ever governed title links.**
§3.3 ratifies blue for **in-chart triggers** (chapter 6's case-chart glosses,
where the gloss is the hot text and a green underline would collide with the
blue Greek-tap convention beside it), and directive 9 gives blue to **Greek
audio taps**. A topic title that opens a popup is neither. `.topic-title-link`
restated `color: var(--link)` on top of the `.popup-link` its markup already
carried, and the R1 conversion simply missed the class.

Fix: the colour override is **deleted**, one declaration. The title now
inherits `.popup-link`'s green underline rather than fighting it.

Swept every `titleLink` in the data — there is exactly **one**, ch9's Deponent
Verbs. (Chapter 10's Future of εἰμί, which §6 also names, is `titleAudio`, not
`titleLink`: a blue Greek audio tap, explicitly untouched by W6's last line, and
asserted still blue.) The sweep is driven from the data, so a `titleLink` added
to any chapter is covered without a harness edit.

Verified: green, underlined, `cursor: pointer`, a `<button>`, still opens its
popup, and now **matches the "frequent verbs" link three lines below it** —
which is the exact comparison the review made (D17.2-D17.4). The counter-case
is asserted in the same breath: §3.3's in-chart triggers are still blue, so
"everything is green now" cannot pass (D17.5).

---

## 7. W7 — the modal divider, universalized

### 7.1 Root cause, measured

Before the fix, at 390x520 with the content forced to scroll:

| Composition | Divider owner | Strip above | Strip below |
| --- | --- | --- | --- |
| `.modal-scroll` + `.modal-actions` (ch2, ch9, ch10) | `.modal-actions` border-top | 12-22px | 11px |
| `.pg-modal-host` + `.pg-controls` (ch3, ch5, **ch7 Case, ch8 Case**) | `.pg-controls` border-top | 10px | **21-23px** |
| `.pg-modal-host` + `.modal-actions` (**ch7 Translation**, ch8 Aὐτός) | `.modal-actions` border-top | 24px | 11-23px |

That is your report exactly: ch8's Personal Pronoun Case footer had 10px above
and 23px below — which next to 23px reads as *no* padding above and *double*
below.

**FOUR contributors, in three files, none of which knew about the others:**

1. **Two selectors could each draw the divider** (`.modal-actions` and
   `.pg-controls`), each with its own idea of the padding, so the two
   compositions were free to disagree — and did.
2. **The control rows inside a pinned line carried their own top margins**
   (`.pg-actions` 12px, `.pg-nav` 10px, `.hint-page-nav` 12px) which stacked
   *under* the footer's 10px strip. That is the 23px.
3. **`.paradigm`'s standing `margin: 6px 0 2px`** put 2px between the chart's
   bottom edge and the footer in a modal host, where the chart's bottom edge is
   the divider.
4. **A `padding: 8px 0 14px` shorthand in the `max-height: 420px` media query**
   silently overrode the strip below the divider on every short viewport — a
   shorthand reaching a property that rule had no business setting.

And, from the other side, **the last content block's bottom margin escaped its
wrappers** and added a second, invisible strip above the line (ch2's Syllable
Division hint: 20px above against 10px below).

### 7.2 The convergence

**The scroller draws the line.** Not the footer, not the pinned row — the
scrolling content's own `border-bottom`, in every modal in the app, from a
single rule. To make one selector reach both compositions, `Paradigm.svelte`'s
`.pg-body` now also carries `.modal-scroll` in a modal host: while a chart's
scroller was the only one in the app with a different name, the divider needed
a second selector to reach it, and a second selector is how this drifted.

Everything under the line is spaced by **`--modal-divider-pad`**, one custom
property read by both the scroller's `padding-bottom` and the footer's
`padding-top`, so the two strips **cannot** differ by composition. The four
contributors above are each neutralized where they live, with a comment saying
which defect they caused. The last-child spine is flattened for six levels —
deliberately a **spine**, not a subtree, because `.modal-scroll :last-child`
would say it in one line and also tighten trailing gaps that are doing real
work between siblings.

Only one rule in the app still overrides the divider pad, and it overrides it
*downward*: when a paradigm pins a nav line, `.modal-actions` supplies an 8px
button gap instead — because the one divider is already above that line and a
second between the nav and Close is panes (b) and (e).

### 7.3 Result

**10px above, 10px below, exactly one divider — every modal, every state, at
forced scroll.** D13 walks **18 modals through 31 states** at 390x520 and
asserts `|above - below| <= 1` on each: the fifteen drill-hint, popup and
Endings modals through their replaced states, plus the three modals the A2
response named that are not hints at all — the keyboard reference, the
end-of-chapter dialog and the Settings confirm. 29 of the 31 states were
measured while the content was genuinely scrolling (the last two are short
dialogs that cannot be made to scroll without entering the `max-height: 420px`
compaction, which is a different composition question), and that count is
itself asserted so the walk cannot pass on a shelf of modals that all happened
to fit.

It measures the **painted** strips — last content edge down to the line, line
down to the first control — not the declarations, because the declarations
were >= 6 in ch8's footer while the strips the eye saw were 10px and 23px.
Checklist rows S.1-S.9; screenshots 20-27, with the review's GOOD and BAD panes
side by side as shots 20 and 21.

### 7.4 The standing checklist item (W7.3)

Added to `DISCLOSURE-VISUAL-CHECKLIST3-OPUS.md` as its **first** section, above
the work items, phrased as an instruction rather than as a result, and marked
as applying to **every railwalk from this round on**:

> Resize the window until the modal's content is forced to scroll, scroll it to
> the end, then confirm the white padding appears **above AND below** the
> divider, with **no extra or doubled padding on either side**, and that there
> is **exactly one** divider in the dialog.

---

## 8. W8 — ch5 hint chart uncollapse: BUILT (addendum)

`ch5railwalk.pdf` arrived after the round's first close and Nathanael asked for
the item to be circled back on, so §8.1's prohibition — "do not author chart
rows yourself" — is spent: with the railwalk in hand the rows are TRANSCRIBED,
which is what it was protecting against.

### 8.1 What the railwalk actually shows

The item said the hint prints Nom. and Voc. as separate rows. It does — and it
also turns out not to be the Learn chart in any other respect either. p10
(First Declension Noun Drill → Hint) and p11 (Declining Noun Drill → Hint)
print the SAME screen, and that screen is:

| | The Learn chart the port was reusing (p7) | The hint's own screen (p10, p11) |
| --- | --- | --- |
| rows | **4**, `Nom.\Voc.` merged | **5**, Nom. and Voc. separate |
| English | none on the chart | **beside every form** |
| title | "First Declension—Eta" | none |
| lemma line | γραφή = writing, Scripture | none |
| Meanings control | yes | none |
| Say button | Say Whole List | none |
| footer | — | Cancel alone |

So the fix is not "un-merge one row"; it is a different screen, which is exactly
what new §4.7 says to expect. Transcribing only the row split would have left
five of those six differences in place.

**A second witness.** The hint's table body is the same table the Learn page's
own **Meanings** popup prints (p7, bottom-left) — minus that popup's title and
its five-line legend. That popup was transcribed in an earlier round and is
already in the file, so the new rows could be checked against an independently
authored copy of the same table: **all 5 rows × 2 cells agree exactly**, Greek,
gloss and clip. That check runs in the authoring script and would have failed
the edit rather than shipping a discrepancy.

### 8.2 The data edit — before / after (§0.3)

Under the standing §0.3 visual-verification exception, reported rather than
silent. Structural JSON diff of `chapt-05.json` against `e294683`: **exactly
three differences.**

| Path | Before | After |
| --- | --- | --- |
| `.drill[0].ui.hintRef` (First Declension Noun Drill) | `firstDeclensionEta` | `firstDeclensionHint` |
| `.drill[1].ui.hintRef` (Declining Noun Drill) | `firstDeclensionEta` | `firstDeclensionHint` |
| `.hintCharts` | absent | ADDED: `firstDeclensionHint`, one inline paradigm — Singular/Plural, `showGlosses`, five rows, plus a `_note` |

**Nothing was chosen.** Every Greek form, gloss and row label is read off p10
and p11. Every **audio id** is the clip this chapter already wires to that
form — the authoring script builds a form→clip map from the file's own charts
and asserts every form is in it, so no clip was assigned by judgement. The
chart carries **no** title, lemma, Meanings or `sayWhole`, because its screen
has none of them.

The register is `hintCharts`, the chapter-level home the resolver already has
for charts that belong to a hint rather than to a page — which is precisely
what §4.7 describes. It resolves a one-chart entry to that chart, so no
composite-disclosure behaviour is triggered.

`_note` records where the rows came from, that the Learn page's Meanings popup
prints the same body, and that a correction to one of these glosses belongs in
both places.

### 8.3 On screen

Both hints, at 390x780: five rows, Nom. and Voc. separate, English beside each
form, Singular/Plural headers, and Close alone under the divider.

Before / after screenshots: `buildout/screenshots/disclosure3-w8/`. Those are a
one-off pair — the "before" state no longer exists to be regenerated — and the
after-state is in the regenerable set as shots 59 and 60 of
`disclosure3-harness/`.

### 8.4 What is now asserted, permanently

`ui-disclosure.mjs` **D20**, eleven checks. It pins **both** halves, because
either alone is satisfiable by the wrong answer — five rows everywhere, or four
rows everywhere:

| | Claim |
| --- | --- |
| D20.1 | each ch5 drill's Hint prints the five railwalk rows, cell for cell |
| D20.2 | ...and is that screen rather than the Learn chart: no title, no lemma, no Meanings, no Say, Singular/Plural headers |
| D20.3/D20.4 | all ten cells are live taps, and the **Vocative** cell — a form the port did not previously display — plays its clip (directive 9) |
| D20.5 | the ch5 **Learn** chart is UNCHANGED: four rows, `Nom.\Voc.` still merged, because its own screen merges them |
| D20.6 | ...and keeps the furniture the hint does not have |
| D20.7 | the Learn page's Meanings popup still prints five rows AND its legend |

The two modals also re-passed **D13** unchanged — one divider, 10px above and
10px below, at forced scroll — which was worth confirming because the addendum
replaced the contents of two dialogs whose geometry W7 had just converged.

### 8.5 Scope of the re-run

Per Nathanael's instruction, this addendum did not re-run the full regression:
`check:shapes` (which guards the new `hintCharts` entry and the two re-pointed
`hintRef`s), `npm run build`, and the whole of `ui-disclosure` (206/206) were
run. `ui-behavior`, `ui-modals`, `ui-walk`, `ui-offline` and `ui-smoke` stand at
their §0 results from the round's close; the addendum touches one chapter's
data and adds one harness block, and no assertion in those files reads the ch5
hint chart.

## 9. New assertions (§9.2)

| §9.2 clause | Where | What it does |
| --- | --- | --- |
| initial-load state per activity class | `ui-behavior` W2 | 219-activity census; all 13 auto-load activities render item 1 on mount, no begin screen survives, each pronounces on load exactly as it pronounces on advance (compared against the app's own Next, not a table); all 4 selection-driven keep an empty start AND their instruction line and fill on the first tap; one probe per already-loaded component type |
| shift key present, one-shot, spacebar narrowed, no 320px overflow | `ui-behavior` W3 | present on all 29 spell surfaces; corner position and `space = row − shift − gap` measured at 320 and 390; armed state, capital faces, one-shot spend, double-tap disarm, ς/σ -> Σ, physical `Shift+A`/`Shift+J` |
| capital input round-trips the checker | `ui-behavior` W3.1 | a mark-free chapter-1 word, read off the shipped data, typed with a capital, graded **correct** |
| green-underline exclusivity sweep (5.2) | `ui-disclosure` D16.1-D16.3 | 306 screens, every accordion opened; plus the ch8 Number headers asserted **present and plain** (so "no underline" cannot be satisfied by the headers vanishing) |
| title links green and tappable | `ui-disclosure` D17.1-D17.5 | data-driven `titleLink` sweep; colour, underline, cursor, element, popup opens, matches the in-text links on the same screen; and in-chart triggers still blue |
| divider symmetry at forced scroll, all modal states | `ui-disclosure` D13 | 18 modals x 31 states at 390x520 — including the keyboard reference, the end-of-chapter dialog and the Settings confirm; one divider, none between nav and Close, strips equal within 1px, and 29 of the 31 states measured while actually scrolling |
| the viewport clamp rejects a phantom height | `ui-disclosure` D19.1-D19.5 | five cases, including the silent-change case no clamp can catch and the modal-open measurement that catches it |
| the ch8 swapped clips, on both surfaces | `ui-behavior` W1 | eviction-and-refetch on the Learn page and inside the drill hint |
| οὐ/οὐκ/οὐχ all carry taps | `ui-disclosure` D18.1-D18.3 | the RULE LINES specifically, not the accordions (the clips always played from the headwords, so a page-wide check would have passed before the fix); hand cursor asserted; three distinct clips |
| **§4.7 hint-modal source fidelity** (added with the W8 addendum) | `ui-disclosure` D20.1-D20.7 | both ch5 hints print their own five-row screen; the Learn chart still merges; the Meanings popup still carries its legend |

W3.5's 320px clause also rides on `ui-walk`'s existing per-stop structural
overflow measurement, which covers `.tk-bottom` on every speller stop at 320px
and reports zero.

---

## 10. VERIFY-DISCLOSURE3 — what still needs you

1. **Device soak for the half-screen bug.** Keyboard up, background the app,
   resume, open a hint — across a few days of normal use, since the trigger is
   intermittent. This is the one item this round explicitly does not claim.
2. **The Shift key on a real device**: placement, the width taken from the
   spacebar, and whether the one-shot *feels* right under a thumb. Also whether
   the punctuation keys stretching to fill their row reads well (§3.1).
3. **Initial-load feel** on ch1 Learn Letters and one Learn Vocabulary: right
   item, right audio timing, no blank flash. And whether the ch1 Pronounce
   Letters instruction line should come back under the loaded letter (§2.4).
4. **The ch8 reflexive clips by ear**, on the Learn page AND in the Aὐτός
   Translation Drill hint. The harness proves the right FILE is fetched; only
   you can confirm the file says the right words.
5. **The three ch7 taps**, and that the rule lines show the tap affordance.
6. **ch9 Deponent Verbs** title link: green reads as intended.
7. **The ch7 gloss underline (§5.2)** — the one editorial loss in W5. Veto if
   the emphasis mattered more than the exclusivity rule does on that screen.
8. **The ch5 First Declension hint**, now that it is built: five rows with the
   English beside each form, and no Say button — the original has none, so the
   port has none. If you want a say-all there it is a deliberate divergence
   rather than a restoration, so it needs your word.
9. **Airplane-mode device pass** (standing).
