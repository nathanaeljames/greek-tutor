# DISCLOSURE-RULES.md — canonical disclosure and paging rules

Status: CANONICAL LIVING DOCUMENT, ratified by Nathanael 2026-08-11
(DISCLOSURE-RULES3.pdf, including its strikethrough deletions: rule 3e
and rule-6 examples b/e/f/h are struck and void) from the two-round
review in DISCLOSURE-REVIEW.md. AMENDED 2026-08-17 from the post-
DISCLOSURE-SPEC1 device pass (Disclosure_Spike_Review.pdf, checked
clean of strikethrough): §3.1 boxed accordion style, §3.5 qualified
"Examples" titles, §4.3 pinning restricted to modals with a fixed
footer composition, §4.6 no-pager enforcement on Quick Review.
Governs how every piece of chapter content is
disclosed: accordion vs modal vs flowing scroll vs paged. Sits
alongside DRILL-BEHAVIOR-RULES.md (drill behaviour) and
TITLE-SWEEP-RULES.md (inventory) as a standing constraint on both the
pipeline and the implementer. When the pipeline or implementer decides
how to visually represent chapter content, it classifies the content
into one category below, logs the decision, and renders per this sheet.
The examples cited in the source rules are NOT exhaustive: the
categories apply to every screen in every chapter, present and future,
by extrapolation (ratified 2026-08-11).

Screenshot note: the GOOD/BAD screenshots in the source PDFs were
review provenance only. Future specs need no screenshots — the named
in-app model screens (ch2 6 Accent Rules for C2, ch5 Definite Article
Paradigm for §4.1, ch8 Third Person Paradigm for §4.2, ch8 Personal
3rd Person review for C9) are the visual reference, and this document
is self-describing.

Standing preservation rule: learn material sometimes reappears slightly
paraphrased or reworded in later Hint dialogs. Those structurings and
phrasings are left as they are unless this document or a divergence
entry says otherwise.

---

## 1. The nine categories

| Code | Category | Rendering |
| --- | --- | --- |
| C1 | One-off explanation or chart | Accordion |
| C2 | Rule list | Interspersed accordions, one under each rule |
| C3 | In-text or in-chart citation or aside | Green underlined link → modal |
| C4 | Hint | Modal |
| C5 | Continuing text in main | Flowing scroll |
| C6 | Segmented text in main | Accordion |
| C7 | Continuing text in modal | Flowing scroll |
| C8 | Segmented text in modal | Two-state toggle; More/Back at 3+ screens |
| C9 | Quick Review | One page, vertical scaling, no pagination controls |

## 2. Classification procedure

Work down this list; first match wins.

1. Is it a Hint behind a drill/exercise Hint button? → **C4**.
   (Exception: the original's "Major Hint" renders as Show Answer,
   not a modal — already standing app-wide.)
2. Is it inside a Quick Review activity? → **C9**.
3. Is the disclosed payload a chart or paradigm? → **C1** (this
   outranks C3 even when the original's trigger was an in-text blue
   link — the Accent Possibilities precedent).
4. Is it a rule list — a numbered closed set where EVERY item carries
   disclosure (linked numbers in the original are the usual sign, and
   surrounding text often calls them "rules")? → **C2**.
5. Is it an in-text or in-chart link where NOT every item of the
   surrounding list is linked, or no list at all? → **C3**.
6. Is it a one-off Note-style explanation about the page (the
   original's `Note` buttons, Six Points, Historical Present)? → **C1**.
7. Is it main-area yellow-box text split across screens in the
   original?
   - Continuation of the same prose, no distinct header → **C5**
     (merge into the scroll).
   - Related but distinct material with its own header → **C6**
     (accordion). Two distinct PARADIGMS are neither: they are C8-style
     paged charts in main (see §4).
8. Is it modal content split across screens? → **C8**.
9. Otherwise it is ordinary content → **C5** / **C7** flowing scroll.

The C5/C6 test is mechanical: **does the second screen carry its own
header in the original?** Header → C6. No header → C5.

## 3. Styling and trigger rules

1. **Accordions** (AMENDED 2026-08-17, superseding the borderless
   render DISCLOSURE-SPEC1 shipped): every accordion is a BOX —
   1px border (#ddd6c2), rounded, background one visible step
   LIGHTER than the containing card (#fffdf3 on the #fdf9e7 card),
   MINIMAL padding — with the title in green (#1f5f57), caret to the
   left in the same green, NEVER underlined, ALWAYS collapsed by
   default. Body text is NOT additionally indented: the box itself
   determines text placement — no hanging indent inside an accordion,
   body text starts at the box's own padding edge. This is the
   variation approved after the 2026-08-14 accordion experiments,
   with the title in green. Applies to every accordion of every
   category in every chapter, present and future, INCLUDING ch1 Six
   Points, EXCEPT the Meanings affordance (rule 9 below keeps its own
   style). The renderer strips `[[u]]` markup from any string used as
   an accordion label.
2. **In-text links (C3)**: green, underlined, open a modal. Numbers
   are never part of the link even where the original linked only the
   number ("Pronoun", not "4. Pronoun").
3. **In-chart triggers (C3)**: keep their existing appearance — the
   gloss itself is the hot text; no green underline (it would collide
   with the blue Greek-tap convention).
4. **All other clickable blue** — audio taps, Greek forms, chart
   headers — stays blue, formatted as it currently appears.
5. **C2 accordion titles** (AMENDED 2026-08-17, inverting the
   bare-"Examples" rule): where a one-or-two-word qualifier for the
   rule item exists, the title is **"<Qualifier> Examples"** — the
   ch3 pattern ("Active Voice Examples"), preferred by Nathanael even
   when the qualifier repeats the term visible in the rule above.
   Bare **"Examples"** only where no short qualifier exists. Applies
   to all chapters, present and future. Greek qualifiers are allowed
   (οὐ Examples); a Greek word inside an accordion TITLE is a control
   label like an option button and is NOT an audio tap (standing
   directive-9 treatment of controls).
6. **C2 placement**: each accordion sits immediately after and beneath
   the numbered item it belongs to (`below` in the data), never
   grouped at the end of the topic.
7. **C1 size floor**: content shorter than roughly two lines stays
   inline, but still in a Note block (the ch2 Apostrophe note).
8. **Chapter-1 exception (ratified 2026-08-11, amending source rules
   3b/3c)**: the three ch1 Note panels — Learn Capital Letters,
   Learn Vowels, Learn Diphthongs — are NOT accordions. They stay
   inline exactly as shipped, owing to the simplicity and sparsity of
   chapter 1. This is a named exception; it does not generalize.
9. **Meanings** is a sub-object on a paradigm chart — a chart
   affordance, not page content. Green text, UNDERLINED (the one
   accordion label that carries an underline — ratified 2026-08-11),
   caret, no borders or margins, collapsed by default. It is not swept
   into C1's placement rules.
10. **Anything with a scroll bar in the original scrolls in the port**
   (ch1 bibliography, ch1 letters chart).

## 4. Paged charts and toggles (C8 and main-area paradigm pairs)

1. **Two screens** (Singular/Plural, Paradigm/Endings, λόγος/ἄνθρωπος,
   Middle/Passive hints): ONE toggle button, same line, to the right
   of Say Whole Paradigm / Say Whole List. Clicking replaces the chart
   and the say-all audio in place.
   - Label: if a one-word contrast exists that is meaningful without
     the noun, the button toggles between those words
     (Singular/Plural, Paradigm/Endings, Middle/Passive,
     Active/Middle). Otherwise the label toggles More/Back
     (λόγος/ἄνθρωπος, whose contrast is lexical).
2. **Three or more screens** (ch8 Third Person Paradigm): Back and
   More as a pair on their own centered line beneath the say-all
   button. BOTH always visible; Back disabled on the first page, More
   disabled on the last. Buttons never disappear or move.
3. **Pinning happens in MODALS ONLY** (AMENDED 2026-08-17; the
   earlier main-content sticky is REVOKED — main-content control rows
   scroll with their chart, and no divider is drawn between Meanings
   and the say-all row in main content). Inside a modal, the fixed
   footer has EXACTLY this composition, top to bottom: the scrolling
   content; a thin strip of light padding; ONE divider; a thin strip
   of light padding; AT MOST ONE pinned line of navigation; the Close
   button. Neither the content nor the buttons ever butt directly
   against the divider, and NO divider ever separates the nav line
   from Close.
   - TWO-screen modal (§4.1): the say-all button and the single
     toggle share that one pinned line.
   - THREE-plus modal (§4.2): the Back/More pair is the pinned line;
     the say-all button is NOT pinned — it stays in the scrolling
     content with its chart.
   - A say button is NEVER pinned unless a navigation control shares
     its line. A modal with no navigation pins nothing above Close.
   (D-38 remains the slot rule: Back left, More right.)
4. **Never stack modals.** A control inside a modal replaces that
   modal's content in place; it does not open a second modal on top
   (broken item 3). Replaced states that carry audio get their own
   Say Whole Paradigm button; nothing autoplays on state change.
5. **Centred navigation where there is no say-all button.** The
   control row's layout assumes a say-all button anchoring it. Where a
   chart or modal state has NO Say Paradigm / Say Whole List button,
   the navigation control that remains — the §4.1 single toggle or the
   §4.2 Back/More pair — is CENTRED on its own line rather than left
   where the pair would have sat. Applies app-wide, every category
   (added 2026-08-16 from the εἰμί hint, whose charts carry no say-all).

6. **C9 pages** show everything at once: paradigms stack vertically
   (Singular above Plural, Middle above Passive), one say-all button
   per chart, no toggles, no More/Back, no topic rail. Audio buttons
   are not pagination and stay. RATIONALE AND ENFORCEMENT (added
   2026-08-17): students may want to PRINT Review pages, so all
   content must be visible in one flowing scroll — pagers are fine on
   Learn pages but never on Review pages. The renderer stacks a
   Review page's charts REGARDLESS of whether they carry names; a
   named chart prints its name as its heading. (The ch8 Personal 3rd
   Person page was cited as the C9 in-app model while it still paged
   — the model is its STACKED render, not what shipped before this
   amendment.)

## 5. Data-model vocabulary (pipeline)

- Accordion = `expander` block. Interspersed C2 accordions live in the
  numbered item's `below` array.
- C3 link = `[[link:id]]` markup targeting a `popups[]` entry; popups
  carry the same block vocabulary as topics (`content[]` lists).
- `numberPopupRef` is RETIRED. No new data uses it; ch7's existing use
  converts to C2 (see §7). `popupRef` on chart rows remains the
  in-chart C3 trigger.
- Paradigm paging = `switch` on the paradigm block: `named` when a
  one-word contrast labels the toggle (value pair supplied in data),
  `moreBack` otherwise or at 3+ charts.
- Hint charts = `hintCharts` with `paradigmRefs`; two refs render per
  §4.1 (toggle), three or more per §4.2.
- Every classification decision made during assembly is logged (the
  extraction map or a `_disclosure` note), same discipline as drill
  behaviour.

## 6. Precedence lines (settled disputes — do not relitigate)

1. **Content type beats trigger type**: a chart payload is C1 even if
   the original triggered it from a blue in-text link (rule 3f / A2).
2. **All-items-linked beats the C3 examples**: every item linked → C2,
   even for screens once listed as C3 (Breathing Marks, ch3
   Voice/Person, ch4/5 Inflectional Forms) (A3).
3. **C2 beats D-31**: ch7's οὐ/οὐκ/οὐχ page is a rule list; the
   number-marker popup mechanism is retired and D-31 is amended
   accordingly (A4).
4. **C6 vs C5** is decided by the header test (§2.7), which also keeps
   D-37 (ch8's merged broken More page — headerless → C5) correct.
5. **Ch2 Brief Background of Accents** is C6: an accordion with its
   distinct header (rule 8a; the competing continuation reading was
   STRUCK from the source document — rejected, not reconciled).

## 7. Divergence-log amendments required

- **D-31 (amend)**: number-marker popups retired. οὐ/οὐκ/οὐχ becomes a
  C2 rule list: three interspersed accordions titled "Examples" (titles
  would repeat the terms); the Greek words remain ordinary audio taps.
- **D-38 (amend)**: More/Back in modals is fixed to the modal footer;
  the fixed-slot rule (Back left, More right) is unchanged.
- **New entry**: this document's adoption, superseding per-case
  disclosure decisions; nested modals abolished; Endings autoplay
  removed in favour of an explicit say button.

## 8. Full revision matrix (post-ratification verdicts)

A "Keep" verdict is STRUCTURAL only: the screen keeps its category and
placement. The universal restyling still applies to every screen —
all accordions get R2 (green, caret, no underline, collapsed), all C3
links get R1 (green, underlined), in every chapter, Keep or Revise.

Verdicts against the shipped ch1-10 data. Screens with no disclosure
decision (spellers, flashcards, interlinear verses, objectives, vocab
drills) are omitted. "Data" = pipeline workstream; "Renderer" =
implementer workstream.

### Chapter 1

| Screen | Cat | Verdict | Workstream |
| --- | --- | --- | --- |
| Learn Letters > Six Points | C1 | Keep visually — data refactor only: the content moves from the bespoke `sixPointsContent` field into a standard `expander` block so R2 styling and collapse-default apply mechanically. The rendered accordion does not change | Data |
| Learn Capital Letters > Note | C1-exc | Revise — stays INLINE (§3.8) but the two missing screens are RESTORED from the TBK as one longer inline note (broken item 1, settled 2026-08-11) | Data |
| Learn Vowels > Note | C1-exc | Keep inline (§3.8) | — |
| Learn Diphthongs > Note | C1-exc | Keep inline (§3.8) | — |
| Learn Greek Language History | C5 | Keep | — |
| Learn Bibliography; Review Letters Quick Chart | C5/C9 | Keep (§3.9) | — |

### Chapter 2

| Screen | Cat | Verdict | Workstream |
| --- | --- | --- | --- |
| Learn Syllables > Three Syllable Rules | C2 | Revise — intersperse the 3 accordions via `below` | Data |
| Learn 3 Accents > Introduction (Brief Background) | C6 | Keep (§6.5, settled) | — |
| Learn 3 Accents > Potential Placement | C2 | Revise — intersperse | Data |
| Learn 3 Accents > 6 Accent Rules | C2 | Keep — the in-app model for C2 interspersing; labels strip `[[u]]` | Renderer |
| Learn 3 Accents > Chart: Accent Possibilities | C1 | Keep (trailing accordion) | — |
| Learn 3 Accents > Words with No Accents | C2 | Revise — intersperse | Data |
| Learn Other Marks > Breathing Marks | C2 | Revise — intersperse (was grouped) | Data |
| Learn Other Marks > Apostrophe note | C1 floor | Keep inline Note (§3.7) | — |
| Learn Grammar Review > Parts of Speech ("Pronouns") | C3 | Revise — green underlined link on "Pronoun", number excluded, → modal | Data |
| Learn Grammar Review > Sentence Parts | C3 | Revise — 4 green underlined links → modals; numbers excluded | Data |
| Learn Grammar Review > Identifying Verbs | C3 | Revise — links → modals AND term-on-own-line-in-green layout replaces the two-column defList (broken item 2) | Data + Renderer |
| Review Syllable/Accent/Marks pages | C9 | Keep | — |
| Syllable Division Exercise > "Hint: Rules" | C4 | Keep — the modal resolves from the activity's own `hint` field and displays the Three Syllable Rules correctly (verified in data, confirmed on device) | — |

### Chapter 3

| Screen | Cat | Verdict | Workstream |
| --- | --- | --- | --- |
| English Concepts > Voice | C2 | Revise — intersperse the 3 accordions | Data |
| English Concepts > Mood | C5 | Keep — SETTLED: the original has no modals or examples here; Mood is removed from rule 5h | — |
| English Concepts > Person | C2 | Revise — intersperse | Data |
| Learn Verbs > Translation > Historical Present | C1 | Keep | — |
| All three drills > Hint (Paradigm/Endings) | C4+C8 | Revise — one modal, in-place two-state toggle labelled Paradigm/Endings; add Say Whole Paradigm to the Endings state; remove autoplay (broken item 3, §4.4) | Renderer |
| Review pages | C9 | Keep | — |

### Chapter 4

| Screen | Cat | Verdict | Workstream |
| --- | --- | --- | --- |
| English Concepts > Case | C2 | Revise — intersperse; titles become "Examples" (§3.5) | Data |
| Learn Nouns > Introduction | C3 | Revise — green underlined links → modals | Data |
| Learn Nouns > Inflectional Forms | C2 | Revise — intersperse; titles "Examples" | Data |
| Learn Nouns > Masculine Declension | C8-main | Revise — single More/Back toggle button on the say-all line (§4.1) | Renderer |
| Learn Nouns > Meanings (both charts + Neuter) | chart affordance | Revise — green, caret, no border, collapsed (§3.8) | Renderer |
| Both drills > Hint | C4+C8 | Revise — as ch3 | Renderer |
| Review Nouns | C9 | Keep | — |

### Chapter 5

| Screen | Cat | Verdict | Workstream |
| --- | --- | --- | --- |
| English Concepts > Case | C2 | Revise — intersperse; titles "Examples" | Data |
| Learn Nouns > Introduction | C3 | Revise — links → modals | Data |
| Learn Nouns > Inflectional Forms | C2 | Revise — intersperse; titles "Examples" | Data |
| Learn Nouns > First Declension—Alpha | C8-main | Revise — single toggle button (§4.1) | Renderer |
| Learn Nouns > Meanings (all charts) | chart affordance | Revise — styling per §3.8 | Renderer |
| Learn Definite Article > Paradigm | C8-main | Keep — the in-app model for §4.1 | — |
| All three drills > Hint | C4+C8 | Revise — as ch3 | Renderer |
| Review Definite Article | C9 | Revise — stack Singular above Plural as two 3-column charts, one say-all each (§4.5) | Renderer |
| Review Nouns | C9 | Keep | — |

### Chapter 6

| Screen | Cat | Verdict | Workstream |
| --- | --- | --- | --- |
| Learn Prepositions > case-chart gloss popups (11) | C3-chart | Keep — in-chart triggers keep their appearance (§3.3) | — |
| Learn Prepositions > Prepositions Chart (SVG) | C1 | Keep | — |
| The 11 preposition popups | C7 | Keep | — |
| Review Prepositions Chart | C9 | Keep | — |

### Chapter 7

| Screen | Cat | Verdict | Workstream |
| --- | --- | --- | --- |
| Learn Adjectives > Adjective Paradigm | C8-main | Revise — single button toggling Singular/Plural on the say-all line (R5) | Renderer |
| Learn Adjectives > 2nd Adjective Paradigm | C8-main | Revise — same | Renderer |
| Learn εἰμί > οὐ, οὐκ and οὐχ | C2 | Revise — three interspersed accordions titled "Examples"; retire `numberPopupRef`; Greek words stay audio taps; amend D-31 | Data |
| Adjective Case Drill > Hint | C4+C8 | Revise — §4.1 single toggle (Singular/Plural) beside Say Whole List, pinned per §4.3 (R5). The hintRef resolves fine — the earlier "dangling" note was stale | Renderer |
| Adjective Translation Drill > Hint | C4+C8 | Revise — §4.1 single toggle (paradigm page / positions page) per R5 | Renderer |
| Both εἰμί drills > Hint | C4 | Keep — single-chart hint, hintRef `eimiParadigm` resolves | — |
| Review Adjectives Paradigm; Review εἰμί | C9 | Keep | — |

### Chapter 8

| Screen | Cat | Verdict | Workstream |
| --- | --- | --- | --- |
| Learn Personal Pronouns > Introduction | C5 | Keep (D-37, headerless merge) | — |
| Learn Third Person > Third Person Paradigm | C8-main 3+ | Keep — the in-app model for §4.2 | — |
| Learn Third Person > Three Uses | C2 | Revise — SETTLED: three interspersed accordions titled "Examples" (all items linked; same shape as οὐ/οὐκ/οὐχ) | Data |
| All three drills > Hint | C4 | Revise — fixed footer per §4.3 | Renderer |
| Review pages incl. Personal 3rd Person | C9 | Revise (2026-08-17) — the shipped page PAGED its three charts, violating §4.6; it stacks Masculine/Feminine/Neuter vertically, one say-all each. Its stacked render is the C9 model | Renderer |

### Chapter 9

| Screen | Cat | Verdict | Workstream |
| --- | --- | --- | --- |
| Learn MP Verbs > Introduction links (punctiliar, continuous) | C3 | Revise — style only: green underlined | Renderer |
| Learn MP Verbs > Introduction item 1 "deponent:" | — | Keep — NOT clickable in the original; the `deponent` popup was never orphaned, it is wired to the Deponent Verbs topic header (`titleLink`) | — |
| Learn MP Verbs > Deponent Verbs (frequentVerbs link) | C3 | Revise — style only | Renderer |
| Both drills > Hint (Middle + Passive stacked) | C4+C8 | Revise — two-state toggle labelled Middle/Passive (§4.1, R5) | Renderer |
| Review Middle/Passive Paradigms | C9 | Keep | — |

### Chapter 10

| Screen | Cat | Verdict | Workstream |
| --- | --- | --- | --- |
| Learn Future Verbs > 5 Stem Variations | C2 | Revise — rule 5e: five interspersed accordions, one under each variation; titles become "Examples" (§3.5, titles repeat the terms); `[[link:]]` modals retired here | Data |
| Learn Future Verbs > everything else | C5/charts | Keep | — |
| Both drills > Hint (FA + FM stacked) | C4+C8 | Revise — rule 9c: two-state toggle labelled Active/Middle | Renderer |
| Review Future Paradigms | C9 | Keep | — |

### Tally (final, all items settled)

Screen-level revisions (mostly data-layer, per chapter):

| Chapter | Revisions | Screens |
| --- | --- | --- |
| 1 | 2 | Six Points (data refactor ONLY, zero visual change — see the row note in §8); Capitals Note missing text restored as one longer INLINE note |
| 2 | 7 | Three Syllable Rules; Potential Placement; Words with No Accents; Breathing Marks (all: intersperse); Parts of Speech, Sentence Parts, Identifying Verbs (links → modals) |
| 3 | 2 | Voice; Person (intersperse) |
| 4 | 3 | Case; Introduction; Inflectional Forms |
| 5 | 4 | Case; Introduction; Inflectional Forms; Review Definite Article (vertical restack) |
| 6 | 0 | — |
| 7 | 1 | οὐ/οὐκ/οὐχ → C2 "Examples" accordions (retire numberPopupRef, amend D-31). Both ch7 drill-hint restyles live under R5 |
| 8 | 1 | Three Uses → C2 "Examples" accordions |
| 9 | 0 | — |
| 10 | 1 | 5 Stem Variations → C2 "Examples" accordions (retire the [[link:]] modals there) |
| **Total** | **21** | |

App-wide renderer items (one implementation each, applied everywhere):

| # | Item |
| --- | --- |
| R1 | ALL in-text citation and aside links render green underlined — every chapter, existing and converted alike |
| R2 | Accordion styling: green #1f5f57, left caret, `[[u]]` stripped from labels, collapsed by default without exception |
| R3 | Pinned control row: say-all + toggle / Back-More never scrolls off screen — fixed modal footer, sticky in main (D-38 amendment). Where a state has NO say-all button, the remaining control is CENTRED (§4.5) |
| R4 | No modal stacking; in-modal controls replace content in place; replaced states with audio get their own Say button; no autoplay (covers the ch3/4/5 Paradigm-Endings hints) |
| R5 | Two-state single toggle button on the say-all line (covers ch4 Masculine, ch5 Alpha, ch7 both adjective learn paradigms, ch7 Adjective Case Drill hint, ch7 Adjective Translation Drill hint, ch3/4/5 Paradigm-Endings hints with R4, ch9 Middle/Passive hint, ch10 Active/Middle hint) |
| R6 | Meanings chart affordance: green, UNDERLINED (sole exception to R2's no-underline rule), caret, no border |
| R7 | Term-block defList style in modals: term on its own line in green, text beneath (replaces the two-column layout; broken item 2) |

Grand total: **28 revision items** (21 screen-level + 7 app-wide).
All open items resolved; the matrix is final.

## 9. Open items

NONE.

Settled for the record (2026-08-11): ch3 Mood stays as-is (no panels
in the original; removed from rule 5h); ch8 Three Uses is C2 with
"Examples" titles; Meanings elements were already collapsed; the three
ch1 Notes are the named inline exception (§3.8), with Capitals Note's
missing text restored inline; the ch2 Syllable Division hint resolves
from the activity's own `hint` field (never dangling); the ch7
hintRefs `adjectiveParadigm` / `eimiParadigm` resolve to topics of
those ids (the "dangling" rows were a stale carryover from a
mid-cohort VERIFY document — my error, corrected); the ch9 `deponent`
popup was never orphaned — it is wired to the Deponent Verbs topic
header via `titleLink`, and the Introduction's "deponent:" term stays
non-clickable as in the original.

## 10. Execution plan

1. The Data workstream is a pipeline pass over chapt-01..10.json —
   the 27 screen-level revisions (accordion placement and `below`
   moves, link markup, `numberPopupRef` retirement, orphan popup
   wiring, ch1 Note restoration from the TBK, dangling ch7 hint
   charts, ch5 QR restructure). Delivered as regenerated data files
   plus a DISCLOSURE-PATCH note per chapter.
2. The Renderer workstream is one implementer round implementing the
   seven app-wide items R1-R7.
3. Both workstreams cite this document by section number in their
   specs. The two run in parallel; neither blocks the other.
