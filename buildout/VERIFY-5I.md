# VERIFY-5I.md — device pass for cohort 5I (chapters 13, 14, 15, 16)

For Nathanael, on the iPhone. Every item asks for **judgement or a listen** —
anything a script could settle was settled during the build and is reported in
`5I-SPEC1-RESULTS-OPUS.md` instead. No airplane-mode items: the scripted
offline walk ran clean (chapter 16, 25 stops, nothing missing, refresh OK) and
all later testing is assumed offline — just report what does not play.

Route lines assume you start from the Table of Contents.

---

## A. PREVIOUS-RESPONSE CHECKLIST

Cohort 5H closed clean, so this carries the four rulings you made during data
production. Tick each by LOOKING, not by assuming.

- [ ] **A1. The Review Vocabulary Chart does not page.** Five rows, a **Say
      List** button, five more rows, a second **Say List** button — all ten
      words on one scroll, no More/Back anywhere.
      *Route:* ch13 → Review → Review Vocabulary Chart.

- [ ] **A2. The πᾶς Declining Drill is 16 items, and item 2 (πάντα) now REJECTS
      Masculine + Nominative Plural.** It should accept Neuter Nominative
      Plural, Neuter Accusative Plural and Masculine Accusative Singular, and
      nothing else.
      *Route:* ch13 → Drill → πᾶς Declining Drill. The counter at the foot of
      the card reads "n of 16"; press Next until you find πάντα.

- [ ] **A3. The Third Declension Translation Drill is 19 items.**
      *Route:* ch13 → Drill → Third Declension Translation Drill, press Next to
      the end and read the counter.

- [ ] **A4. ch16's Form Drill instruction line and Forms Speller field label
      change per item.** In the drill, βάλλω appears twice with an identical
      prompt panel; the line above the options must read "…matching aorist
      form" on one and "…matching future form" on the other. In the speller,
      βάλλω also appears twice and the box you type into must be captioned
      "Passive Aorist Form" on one and "Passive Future Form" on the other.
      *Route:* ch16 → Drill → Passive Verbs Form Drill (βάλλω is items 1 and
      12 in the authored order, though the drill shuffles — press Next until
      you have seen both); then ch16 → Exercise → Passive Verbs Forms Spelling
      Exercise, items 1 and 2.

---

## B. LISTENS (pipeline items, spec §9.1)

These need ears; nothing else can settle them.

- [ ] **B1. ch13 `m_voc5`** carries the Learn Introduction's three-form
      citation "πᾶς, πᾶσα, πᾶν". Confirm it recites **all three words**, not
      πᾶς alone. (CHAPT_13 ships no `m_pas` lemma clip — this is the vocabulary
      clip whose lexical form is exactly those three words. The chapter's own
      `_audioVerify` note asks for a listen on "m_pas"; there is no such clip
      in the pack, so this is the clip it meant.)
      *Route:* ch13 → Learn → Learn Third Declension Nouns → topic 1
      (Introduction); tap "πᾶς, πᾶσα, πᾶν" in the first paragraph.

- [ ] **B2. ch13 `m_pasmns`** carries the πᾶς topic title and the Quick Review
      πᾶς page title. Confirm it says the single word **πᾶς** — it is the
      chart's own masculine-nominative-singular cell, which is what those
      titles print.
      *Route:* ch13 → Review → Review Declension of Adjective πᾶς; tap the
      page title, then tap the Nom./Masculine cell and confirm they are the
      same recording.

- [ ] **B3. ch14 `n_labp` vs `n_lamp`.** Both ship. The stem list uses
      `n_lamp` for λαμβάνω's present and `n_labp` is wired to nothing. A listen
      decides which is really the present lemma.
      *Route:* ch14 → Learn → Learn Second Aorist Indicative Verbs → topic 6
      (Aorist Stems of Verbs); tap λαμβάνω. If what you hear is not the present
      "lambano", say so — the pack's other clip is the one that should be
      there.

- [ ] **B4. ch13 `m_sm4` and `m_sm8`** are both σου in Mat 6:10a. Confirm they
      are **distinct recordings** and not one clip wired twice.
      *Route:* ch13 → Learn → Learn Scripture Memory; tap the first σου· and
      then the second σου, and listen for a difference.

- [ ] **B5. Say-all naming, four chapters four conventions** (spec §9.3):
      `m_vocl` / `m_vocla` / `m_voclb` (ch13), `n_vocl14` (ch14), `o_vocl15`
      (ch15), `vocl16` (ch16 — no prefix at all). Worth one pass alongside
      B1-B4, and worth knowing before the audio split/merge job (NIT-LOG N-1
      and N-6). In particular: do `m_vocla` and `m_voclb` really recite the
      FIRST five and the SECOND five rows of ch13's chart?
      *Route:* ch13 → Review → Review Vocabulary Chart, press each Say List in
      turn; then the Review Vocabulary Chart of chapters 14, 15 and 16 and
      press Say Whole List on each.

- [ ] **B6. ch16's merged Mat 6:10 page** (spec §9.4). This is the only page in
      the project that joins 6:10a and 6:10c; chapters 14 and 15 keep them
      apart. Confirm the fourteen-word interlinear reads correctly end to end
      and that **Say Whole Verse plays the full verse**, not one half.
      *Route:* ch16 → Review → Review Scripture Memory: Mat 6:10.

---

## C. NEW SHAPES THAT WANT A HUMAN EYE (pipeline items, spec §9.5)

Everything below renders, interacts and fits — that was checked at 320px and
768px and at five device heights. What is being asked is whether it READS well.

- [ ] **C1. ch13's Key Letter Box** — six in-chart popups on one chart, a shape
      no earlier chapter has. Are six tappable labels around one small grid
      legible as labels, or do they read as clutter? Do the nine consonants
      inside the boxes read as NOT tappable (they are ink, and deliberately so
      — no clip exists for any of them)?
      *Route:* ch13 → Learn → Learn Concepts → topic 2 (Key Letter Box). Press
      each of Unvoiced, Voiced, Aspirate, Labial, Velar, Dental.

- [ ] **C2. ch13's πᾶς six-column chart at phone width.** See item I-1 below —
      this is the one that needed a decision.

- [ ] **C3. ch16's three-column Passive Stems table with em dashes.** Fifteen
      verbs, three columns, eight of them printing `—` for "no future
      passive". At the 320px floor the Greek sets small so all three columns
      fit. Is it readable on the real screen, and does the em dash read as
      "there is no form" rather than as a missing one?
      *Route:* ch16 → Learn → Learn Aorist and Future Passive Verbs → topic 9
      (Passive Stems). Also ch16 → Review → Review Passive Indicative Forms.

- [ ] **C4. ch16's three-chart hint paging.** Back and More on their own
      centred line, both always visible, Back greyed on the first chart and
      More on the last.
      *Route:* ch16 → Drill → Passive Verbs Parsing Drill → Hint. Step More
      twice and Back twice.

- [ ] **C5. ch15's four-chart hint paging** — the deepest bundle in the app.
      The point of it is the aorist-versus-imperfect contrast while
      translating, so the four charts should read as two pairs.
      *Route:* ch15 → Drill → First Aorist Indicative Translation Drill →
      Hint. Step More three times.

- [ ] **C6. ch15's Translation Drill hint is the RIGHT charts** (spec §9.4).
      The pipeline first gave this drill the Parsing Drill's aorist hint;
      it now holds four. Confirm the third and fourth are **imperfect**
      charts and that they are the ones the original shows.
      *Route:* as C5.

---

## D. CLIPS THE PACK SHIPS THAT NOTHING PLAYS

Report only — no action expected this round. Machine-verified against the
manifest and the four data files, and the list matches spec §9.2 exactly:

| Ch | Pack | Unwired |
| --- | --- | --- |
| 13 | 159 | `m_ad5`, `m_onoss`, `m_vocl`, `msargs` |
| 14 | 145 | `n_agaf1p`, `n_kri`, `n_kri1s`, `n_krif1s`, `n_labp` |
| 15 | 160 | `l_ap9`, `m_mt610`, `o_luw`, `o_nothin` |
| 16 | 159 | `m_mt610a`, `n_mt610c`, `p_balpp`, `p_eurf`, `p_ginm`, `p_krif`, `p_luwp`, `p_parp` |

("Pack" counts entries in `audio-manifest.json`. Chapters 13 and 14 declare 158
and 144 WAVs in their own `_audioVerify` notes, one fewer each than the manifest
carries — worth a glance from the pipeline, but not a device question and not
something that affects playback: every clip the data names resolves.)

The inverse case: **ch14's SayWord table names `n_sm7`, which the pack does not
ship** and the six-word Mat 6:10c pool never reaches — a dangling dispatch
entry rather than a stray clip. Nothing on the device can show this; it is
recorded here so the round has an honest history.

---

## E. IMPLEMENTATION ITEMS — questions this build raised

- [ ] **I-1. The πᾶς chart is STACKED, not six-across. This is the one real
      departure from the original in this round and it needs your ruling.**
      The original prints one chart six columns wide (Masculine / Feminine /
      Neuter, twice, under a spanning Singular / Plural header). At 320px that
      does not fit, and this app CLIPS rather than scrolls — the shipped
      six-across render lost columns off the right edge and printed its headers
      as "MASCULFEMININEUTER", with nothing to scroll and nothing to error. A
      pager is forbidden on a Review page (DISCLOSURE-RULES §4.6), and the spec
      forbids inventing one. So the port draws the **Singular block above the
      Plural block**, each three columns wide with its own case labels — which
      is what §4.6 already prescribes for a C9 page ("paradigms stack
      vertically, Singular above Plural"). Everything is on screen, nothing
      pages, one Say Paradigm beneath both halves.
      Does that read as the same chart to you, or do you want the two numbers
      side by side badly enough to accept something else (a smaller type ramp,
      a landscape-only wide layout)?
      *Route:* ch13 → Review → Review Declension of Adjective πᾶς. Also
      ch13 → Learn → Learn Third Declension Nouns → topic 6, and
      ch13 → Drill → πᾶς Declining Drill → Hint — all three copies of the
      chart render the same way.

- [ ] **I-2. The note marker beside ch14's εἶδον.** In the original, εἶδον in
      the Aorist Stems list is blue with a hand cursor and opens a note about
      which verb that aorist really belongs to. In the port that same form is
      ALSO an audio tap, and one press cannot both speak and open a page — so
      the note gets a small circled marker beside the form and the form keeps
      its clip. Is the marker legible, and is it obviously the way to the note?
      *Route:* ch14 → Learn → Learn Second Aorist Indicative Verbs → topic 6;
      the βλέπω row. The same row and marker appear at
      ch14 → Review → Review Second Aorist Indicative Forms.

- [ ] **I-3. ch14's and ch15's "Verb Forms" hint charts put the English gloss
      on the LEFT.** The original prints `ἀπέρχομαι -- ἀπῆλθον (I departed)`,
      gloss last. The delivered data models those hint charts as two-column
      paradigms with the gloss as the row LABEL, so it prints first. The Learn
      pages of the same chapters print it last, correctly. Is the hint worth
      re-shaping to match, or is it fine as a reference table?
      *Route:* ch14 → Drill → Second Aorist Indicative Forms Drill → Hint;
      compare with ch14 → Learn → …→ topic 6.

- [ ] **I-4. Should ch13's Review Vocabulary Chart keep `columns: 2`?** The
      data asks for a two-column desktop layout, but chapter 13's original page
      is a single column of five (chapters 14-16 really are two columns of
      five), and a Say List "after row 5" only makes sense down a single
      column. The renderer ignores the key while the two Say List buttons are
      present. Nothing to see on the phone — the phone is one column either
      way — but the pipeline should probably drop the key.

- [ ] **I-5. The lower-case glosses on three charts.** ch14's Review and hint
      copies of the λαμβάνω paradigm, and ch15's Review copy of the λύω
      paradigm, print "we took / you took / he/she/it took" in lower case while
      the Learn copies of the same charts capitalise them. The port reproduces
      that difference because the original appears to make it. (Only the
      English first-person "I", which was shipped as a lower-case "i", was
      corrected.) One look in DOSBox would settle whether the original really
      is inconsistent here.
      *Route:* ch14 → Review → Review Second Aorist Paradigms, against
      ch14 → Learn → …→ topic 3.

- [ ] **I-6. ch15's two liquid/nasal derivations sit one size larger than the
      worked examples above them.** `μένω + σα = ἔμεινα` and
      `ἀποστέλλω + σα = ἀπέστειλα` were shipped glued into a prose paragraph
      with the tense formative as the roman "sa"; they are restored as display
      lines and both Greek forms now tap. They render at the app's generic
      equation size, one step larger than the three worked examples in the
      chart above them, and the second wraps at 320px. Correct and complete —
      but it is the one block on that page that does not sit at the size of its
      neighbours. Leave, or bring it down a step?
      *Route:* ch15 → Learn → Learn First Aorist Indicative Verbs → topic 7
      (Ending Transformations); scroll to the bottom.

---

## F. NOT ASKED, RECORDED

Settled during the build; here so you are not asked to re-check them:

- Every one of the 98 rail stops in these four chapters loads at 320px and
  768px with zero horizontal overflow and zero console errors, and so do the
  270 stops of chapters 1-12 after this round's shared-component changes.
- All 42 new modal surfaces (six Key Letter Box popups, chapter 15's four sound
  popups, the stem-list note from both its hosts, every state of every new hint
  bundle, and the speller keyboards) open, fit and keep their pinned row still
  at five device heights, including at forced scroll.
- The A1c audio-leak gate is live on all three new Forms Drills: the prompt
  carries no tap and Pronounce is disabled until the item is answered, then
  both go live. The three Forms spellers are excluded, as ruled.
- Translate reveals correctly on all four two-stage parsing drills.
- All sixteen chapter chunks and sixteen lexicon chunks emit and are precached;
  no chapter data leaked into the main bundle.
- Thirty-two mis-attributed second prompt lines in the Translation Drills of
  chapters 13, 14 and 16, and twelve strings with unconverted Greek-font runs,
  were found and repaired. `5I-SPEC1-RESULTS-OPUS.md` §3 carries every one with
  its before and after — **the pipeline has to absorb them or they are lost at
  the next regeneration.**
