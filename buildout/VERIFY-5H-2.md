# VERIFY-5H-2.md — the items only Nathanael can settle

Chapters 3-12 after 5H-SPEC2 (Opus): cohort 5H's closure plus the LOOKBACK
pass. Authored by the implementer in the same round, per the new standing
rule 0.2.

Everything mechanical is already pinned and is NOT in this file. This round
ran 1094 behaviour assertions (up from 1052), 308 disclosure assertions, the
disclosure3 census at 84/84, the modal census at five device heights over 47
surfaces, a rail walk of chapters 7, 8, 11 and 12 at two widths, an offline
walk of chapters 8, 11 and 12, and a page-by-page comparison of every changed
page against the rail-walk PDFs
(`5H-VISUAL-CHECKLIST-2`, appended to `5H-VISUAL-CHECKLIST-OPUS.md`). What
those settled is listed in section 3 so you can see it was considered rather
than skipped.

**Seven items.** Every item of VERIFY-5H is answered in VERIFY-5H-RESPONSE
except (k)'s two homeless clips, which is carried here as (k2); the rest are
new. Each states what the port does NOW, so a verdict has something to land
against, and each says what changes if you answer against the default.

Letters continue VERIFY-5H's sequence and are never reused, so the order below
is (k2), (r), (s), (t), (w), (v), (u): **(w) sits next to (t) on purpose**,
because it may make (t) moot and they are the same screen.

---

## 0. How to answer

| Kind | What it needs |
| --- | --- |
| **DOSBox** | The original running under DOSBox. These ask what the ORIGINAL does; the port's behaviour is already stated in the item. |
| **Listen** | Either the WAV on the ISO (`CHAPT_11/K_VOC5.WAV`) or the app's copy (`/audio/chapt_11/k_voc5.m4a`) — both paths are given per clip. |
| **Judgement** | No machine or original can settle it. Both branches cost something and the item says what. |

Write in the blank after each arrow and add anything else under Notes. A
screenshot beats a description.

---

## 1. Items

### (k2) The two homeless chapter-12 clips *(carried from VERIFY-5H (k) — DOSBox + listen)*

- [ ] Your answer to (k) closed every row but this one. `l_a1s` says "just
  checking it out?" in English and `l_ap9` says something like
  "de-a-la-giz-an-ta"; neither is referenced by any dispatch table in
  `12_IMPERF.TBK`, and the port wires neither.

  **Port today:** both ship in the CHAPT_12 pack (they are on the ISO, so the
  pack mirrors it) and nothing plays them. `l_ap3` is the third plural ἔλυον
  of the Imperfect Active chart, which you confirmed, so they are not that.

  The question is only whether some screen in the ORIGINAL plays either — a
  page the rail walk did not stop on, or a control it did not press. If the
  answer is no, the row closes as "shipped, unwired, by the original's own
  design" (the D-39 class) and nothing changes. If yes, name the screen and
  the pipeline wires it.

  `CHAPT_12/L_A1S.WAV`, `L_AP9.WAV` (`/audio/chapt_12/l_a1s.m4a`, `l_ap9.m4a`).

  → **Nothing plays them / `l_a1s` plays on: ______________ / `l_ap9` plays on: ______________**

  Notes:

---

### (r) Does K_VOC5 recite ὅς, ἥ, ὅ, or only ὅς? *(listen)*

- [ ] Your RESPONSE 7 asked whether there is audio for all three forms of the
  relative pronoun. There is, but not in one clip that anyone has confirmed.

  **Port today:** the Learn Vocabulary flashcard and the Review Vocabulary
  Chart print the lexical form **ὅς, ἥ, ὅ** and play the lemma clip
  **`k_voc5`**. The lexicon now also carries a `parts` list wiring the three
  forms to their own paradigm-cell clips (`k_osmns`, `k_osfns`, `k_osnns`);
  nothing renders `parts` yet, and that is deliberate — which surface gets
  them depends on your answer.

  This is the same question RESPONSE 6 settled for οὗτος, where `k_voc7`
  turned out to recite all three and is now what both surfaces play (section
  2.7 of the spec, shipped this round).

  Listen to `CHAPT_11/K_VOC5.WAV` (`/audio/chapt_11/k_voc5.m4a`).

  - **If it recites all three**, the row closes exactly as οὗτος did: nothing
    changes, and the `parts` list stays unrendered provenance.
  - **If it says only ὅς**, the card is reading one word under a heading of
    three, and the fix is to render `parts` as three taps on those two
    surfaces — a renderer change of about ten lines plus its assertions, and
    the first surface in the app where one card carries three separate tap
    targets. Say so and it lands in the next round.

  → **Recites ὅς, ἥ, ὅ / says only ὅς:** ______________

  Notes:

---

### (s) Chapter 8's two Hints in the ORIGINAL — one page per item, or a stack? *(DOSBox)*

- [ ] **This is the item most likely to change what shipped**, so it is worth
  the two minutes. The rail walk gives evidence BOTH ways and only DOSBox can
  separate them.

  **What the spec said and what shipped:** the pipeline read a WordCounter
  dispatch at `8_PRONS.TBK 0x7bf39` (20 entries over 21 items) that routes
  each Aὐτός Translation Drill item to ONE of two payloads — the Third Person
  Paradigm, or the Learn topic "Three Uses". 5H-SPEC2 3.1 concluded the port
  was wrong to stack both as a two-page More/Back popup and had the key
  removed, so per-item routing governs. That is what shipped: items 1-3, 6, 8,
  10-14, 17 and 20-21 open the paradigm; items 4, 5, 7, 9, 15, 16, 18 and 19
  open Three Uses. Each opens with **Close** and nothing else.

  **What the rail walk shows, which does not obviously agree.** On
  **ch8railwalk p7 bottom-left** the drill is on item 1
  (κατὰ τὸ αὐτὸ πνεῦμα, 1 Cor 12:8) — a PARADIGM item. **p7 bottom-right** is
  the Hint it opened: the Third Person Paradigm, and its buttons read
  **More | Cancel**. **p8 top-left** is the Three Uses page with all three
  numbered points and buttons reading **Back | Cancel**. Read together that is
  a two-page stack reached from a single item, which is precisely what the
  port used to have and what this round removed.

  Both readings survive the evidence, because every hint screen in that walk
  was opened from a paradigm item:

  - **A.** The Hint is always a two-page stack, paradigm first. The dispatch
    table decides something else (which paradigm, or nothing at run time).
  - **B.** The dispatch chooses the FIRST page and More/Back reaches the
    other. Item 1 is a paradigm item, so it opened at the paradigm with More
    available — exactly the capture — and item 4 would open at Three Uses with
    Back available.

  Under either reading the port is missing the More/Back pair. Under A it is
  also opening the wrong page for eight items.

  In DOSBox, in the **Aὐτός Translation Drill**:
  1. Step to **item 4** ("λέγει ἡ μήτηρ τοῦ", Jn 2:3) and click **Hint**.
     Which page opens first, and what buttons does it carry?
  2. From whichever page opens, press **More** or **Back** and say whether the
     other page is reachable.

  And while you are in the chapter, the **Personal Pronoun Case Drill** is the
  same class and its dispatch (`0x10d820`) says each person's form opens its
  own paradigm. **ch8railwalk p8 bottom-left** shows the third-person route
  (the αὐτή item) with **Cancel only** — no navigation — which the port
  matches. Step to a **ἡμεῖς** item and a **σοι** item and click Hint on each.

  → **Item 4's Hint opens: ______________ with buttons: ______________**

  → **The other page is / is not reachable from it:** ______________

  → **Case Drill: three different charts / always the same one (which):** ______________

  Notes:

---

### (t) Chapter 12's εἰμί / ἔχω toggle labels *(judgement)*

- [ ] NIT-LOG N-2. You asked, in RESPONSE 3, where the "no Greek-only
  More/Back labels" rule was settled and for a matrix of every place it could
  bite. The rule is DISCLOSURE-RULES §4.1; the activity it was settled on is
  **ch4 Learn Nouns > Masculine Declension** (λόγος / ἄνθρωπος), followed by
  ch5's ὥρα / δόξα — both of which went to More/Back. The matrix is spec
  section 3.3 and NIT-LOG N-2; it has six rows and exactly ONE of them is
  labelled with Greek.

  **Port today:** the default was applied, because no ruling came at kickoff.
  `paradigmToggleLabels` falls back to More/Back whenever the one differing
  word of the two chart titles is GREEK, so the **Imperfect Indicative Parsing
  Drill's** hint for εἰμί and ἔχω forms now reads **More / Back** instead of
  **εἰμί / ἔχω**. It is stated as §4.1's own rule rather than as a chapter-12
  exception, so it is one rule in one place.

  The other five rows of the matrix are asserted UNCHANGED in the same
  harness pass: Present/Future (ch10 εἰμί), Active vs Middle/Passive (ch12
  λύω), Singular/Plural (ch11's four hints and three Learn toggles), and ch4's
  and ch5's existing More/Back pairs.

  What you lose by keeping it: on that one hint the button no longer names the
  verb it goes to, so a learner on an ἔχω item presses "More" without being
  told what is behind it. What you lose by reversing it: §4.1 has an exception
  in it, and the next Greek-labelled pair is a fresh argument. Reversing is a
  one-line revert plus four assertions.

  **Read (w) before answering this one** — it may make the question moot.

  → **Keep More/Back / go back to εἰμί / ἔχω:** ______________

  Notes:

---

### (w) Should that hint have TWO screens at all? *(judgement — implementer-raised)*

- [ ] **[implementer-raised, per the standing rule that a departure you never
  see is a silent divergence.]** While cropping the rail walk for (t) I
  compared the port's εἰμί hint against the original's, and they are not the
  same shape.

  **ch12railwalk p8 top-right** (and p8 bottom-left, the same panel with the
  cursor moved) shows the Imperfect Indicative Parsing Drill's Hint on an εἰμί
  form: **"Imperfect of εἰμί" and "Imperfect of ἔχω" are BOTH on one screen**,
  stacked, εἰμί above ἔχω, with a single **Cancel**. There is no More, no
  Back, and no toggle.

  **Port today:** one chart at a time behind a two-state toggle — which is
  what makes (t) a question at all. That split came in with 5H-SPEC1 and the
  5H visual checklist passed it (row 12.14) against this same panel; reading
  it again, I think the panel shows a stack and the row read it as a toggle.
  Spec 5H-SPEC2 section 3.3 describes the pair as "consecutive screens", which
  is the same reading.

  This is a DISCLOSURE-RULES departure of the kind you vetoed row by row in
  VERIFY-5H (l), and it was not on that list, which is why it is here.

  Both charts are narrow — three numbered rows, a Singular and a Plural
  column, short English glosses — so stacking them is very likely to fit at
  320 px, the way the Quick Review pages stack under §4.6. I did NOT change
  it: this spec asked only about the LABEL on the toggle, and changing the
  disclosure shape is your call, not a renderer detail I should decide inside
  a labelling item.

  - **STACK** (both charts on one scrolling hint, one Close) matches the
    original panel, and (t) disappears — there is no toggle left to label.
    Cost: one taller modal, and a `hintCharts` composite that renders stacked
    instead of disclosed, which is a renderer branch plus its assertions.
  - **KEEP THE TOGGLE** and answer (t) on its own terms. Cost: a divergence
    entry for a departure that has been shipping unlogged since 5H-SPEC1.

  → **STACK / keep the toggle:** ______________

  Notes:

---

### (v) Do H_VOC3 and H_VOC9 recite BOTH forms? *(listen)*

- [ ] **[implementer-raised, per the standing rule that a departure you never
  see is a silent divergence.]** RESPONSE 6's ruling — a card that prints
  three forms plays the clip that says all three — is a renderer rule, not a
  chapter-11 fact, and chapter 8 has two cards of the same shape: **ἐγώ /
  ἡμεῖς** and **σύ / ὑμεῖς**. Applying the rule reached them.

  **What was wrong, and it was worth finding:** chapter 8's two vocabulary
  surfaces DISAGREED with each other. Its Review Vocabulary Chart draws from
  the `lemmas` pool and has always played `h_voc3` on that row; its Learn
  Vocabulary flashcard draws from `senses` and played `h_voc3a`, one of the
  two words printed on the card. The fix aligns the flashcard with the Review
  chart's shipped, device-verified behaviour rather than inventing a third.
  Same for σύ / ὑμεῖς and `h_voc9` / `h_voc9a`.

  **Port today:** both surfaces play `h_voc3` and `h_voc9`.

  All this needs is an ear. Listen to `CHAPT_8/H_VOC3.WAV` and `H_VOC9.WAV`
  (`/audio/chapt_8/h_voc3.m4a`, `h_voc9.m4a`).

  - **If each recites both forms**, the row closes and chapter 8's two
    surfaces now agree.
  - **If either says only the first word**, then the Review chart has been
    speaking one word under a two-word heading since chapter 8 shipped, and
    the answer is the same `parts` renderer item (r) may ask for.

  → **`h_voc3` says: ______________ `h_voc9` says: ______________**

  Notes:

---

### (u) Anything the visual pass got wrong *(judgement)*

- [ ] Every page whose data or renderer changed this round was compared
  against its rail-walk panel at 320 px and 768 px and every row is PASS
  (`5H-VISUAL-CHECKLIST-2`). Three of them are worth your eye anyway, because
  they are the ones where "matches the original" and "reads well on a phone"
  could disagree:

  1. **ch8 Three Uses as a Hint.** It is the first hint in the app whose body
     is a whole teaching page: prose, a three-point numbered list with hanging
     indents, and three "Examples" accordions. It fits at every device height
     in the modal census, but it is a tall modal on a phone.
  2. **ch12 Augment Drill Hint.** The four compound forms in points 3 and 4
     are now blue taps (RESPONSE 5). The contraction table in point 2 and the
     augment vowel in point 1 stay ink — that is the map doing its job, not an
     omission, but it does mean two kinds of Greek on one screen.
  3. **ch11 Review paradigm pages.** Twelve Say Paradigm buttons became six,
     one after each Plural half (your (p) ruling). The original prints one
     button per paradigm on a single screen (ch11railwalk p20-p22), which is
     what six matches; what is new is that the button sits mid-page rather
     than at the foot.

  → ______________________________________________

---

## 2. Airplane-mode pass (directive 4, device half)

The preview half is scripted (`npm run ui:offline -- --chapters=chapt_8,chapt_11,chapt_12`:
every rail stop of all three chapters, refresh on an activity route, no console
errors). This is the part only a real iPhone can answer. Chapter 8 joins the
list because its data changed this round.

- [ ] **Chapter 8, offline, both changed Hints.** With the CHAPT_8 pack
  downloaded and airplane mode on, open the **Aὐτός Translation Drill** and
  press Hint on several items — you should see the paradigm on most and the
  Three Uses page on the rest — then the **Personal Pronoun Case Drill** and
  press Hint on a first-, second- and third-person form.

  → **PASS / FAIL at: ______________**

- [ ] **Chapter 11 objectives and vocabulary, offline.** Tap ἐκεῖνος and
  οὗτος on the Chapter Objectives page (they are taps for the first time), and
  the οὗτος, αὕτη, τοῦτο row on both the Learn Vocabulary card and the Review
  Vocabulary Chart (both now say all three).

  → **All four speak / silent at: ______________**

- [ ] **Chapter 7 objectives.** Objective 5 names εἰμί and it now taps.

  → **PASS / FAIL: ______________**

- [ ] **The four gated Pronounce buttons.** On the ch3 Greek Verb Drill, the
  ch4 Greek Noun Drill and the ch5 First Declension Noun Drill, Pronounce is
  now greyed until the item is answered — the ch12 Augment Drill rule applied
  backward, per your (d) ruling. These three have ENGLISH prompts, so nothing
  else about them changes. Confirm it does not read as a broken button.

  → **Reads as deliberate / reads as broken:** ______________

- [ ] **Anything that looks wrong.** Free text; a screenshot beats a
  description.

  → ______________________________________________

---

## 3. Appendix — settled this round, not asked

| Item | How it was settled |
| --- | --- |
| Every item of VERIFY-5H (a), (d)-(q) | Answered in VERIFY-5H-RESPONSE and applied this round; D-51 (amend) and D-52..D-56 in DIVERGENCE-LOG record each one. Only (k)'s two homeless clips are carried, as (k2) |
| Chapter 11 and chapter 7 objectives now tap | `ui-behavior.mjs` 5H-SPEC2 2.5: three taps evicted from the audio store and re-fetched by id, plus a twelve-chapter census that every other objective renders and none of them gained a tap |
| The Augment hint's four Greek taps, and what stays ink | `ui-behavior.mjs` 5H-SPEC2 2.6: four evicted-and-refetched taps, plus the negative on both rule items |
| Which activities the generalised audio gate fires on | `ui-behavior.mjs` 5H-SPEC2 4.2: the 4.1 triple is computed over every select activity in twelve chapters and yields exactly four (ch3, ch4, ch5, ch12); all four gate on screen and the autoBoth exclusion keeps a live Pronounce |
| One say-all per recording on ch11's three Review pages | `ui-behavior.mjs` 5H-SPEC2 2.9: twelve buttons to six, none of them on a Singular half; the Learn-toggle rule is asserted separately and unchanged, so the two halves of your (p) ruling cannot drift into each other |
| The other five rows of the toggle-label matrix are untouched | `ui-behavior.mjs` 5H-SPEC2 3.3, all four surfaces read in one pass |
| Chapter 8's per-item hint routing works in the PORT | `ui-behavior.mjs` 5H-SPEC2 3.1: three different charts off the Case Drill, and a chart vs the Three Uses page off the translation drill. Whether the ORIGINAL routes this way is item (s) |
| A dangling hintRef can no longer ship | `check-content-shapes.mjs`: the check used to accept any ref that matched an id ANYWHERE, which is how `threeUses` passed while resolving to nothing. It now models both renderer paths (a chart, or a topic with content) and was negative-tested against a ref that only the old check accepted |
| The retired `hintPages` route left two stale assertions behind | `ui-behavior.mjs` W1 walked More to find the Three Uses topic and now stands on an item that routes there; P3.2's "modal pager" was silently measuring the paradigm's own three-chart pager and is renamed and pinned to a named item so it cannot pass on a lucky draw |
| Modal sizing for both new ch8 hint routes | `ui-modals.mjs`, five surfaces added (three Case Drill persons, both translation routes), 47 surfaces at five device heights |
| No page whose data changed overflows at 320 px | `ui-walk.mjs` over chapters 7, 8, 11 and 12 |
| Offline behaviour did not regress | `ui-offline.mjs` over chapters 8, 11 and 12 |
