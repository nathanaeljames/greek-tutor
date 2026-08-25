# VERIFY-DISCLOSURE — judgment calls only, DISCLOSURE-SPEC1 + SPEC2

For Nathanael. Ten items, all of them things neither a harness nor I can
settle: taste on a real device, wording you may want to veto, editorial
readings, and one data edit that needs your ratification.

**What is deliberately NOT here**: anything the 2026-08-16/17 device pass
(Disclosure_Spike_Review.pdf) already settled, and anything I verified myself.
Both lists are at the end so the omissions are auditable rather than silent.

Build: SPEC1 + SPEC2 on `4f5f14d`. Nothing committed. Routes are hash paths —
`http://localhost:4173/#/activity/<chapter>/<activity>`.

---

## A. Taste on a real device (needs a phone)

### A1. The boxed accordion, and whether the padding is right

**Route** `chapt_2/c2_learn_accents`, Next Topic x3 (6 Accent Rules).
**Also** `chapt_1/c1_learn_letters` — Six Points.

Your pane (f) is what I built to. Padding is **7px vertical / 10px
horizontal**, chosen by eye against the panes and deliberately tighter than the
11px/13px you called inflated. Body text now starts at the box's own padding
edge with no second indent.

Six Points also **lost the card that used to wrap it**. That card was invisible
while the accordion was borderless — it WAS the box you saw — so once the
accordion got its own box, the card became a box inside a box, and its 16px
padding is what made the padding look inflated in your pane 1(b). It is now one
accordion box under the stepper card, and the harness pins every accordion in
the app to a single shared padding value so no host can drift again.

**The question**: is 7px/10px right, and does Six Points now sit correctly
without its card?

*Knob*: `.rc-expander summary` padding and `.rc-expander-body` padding in
`src/app.css`. Both are one-line changes.

### A2. The modal footer, on real WebKit, with a tall chart

**Route** `chapt_3/c3_drill_verb_translating` → Hint (the two-screen case, your
pane f: "Say Whole Paradigm | Endings" on one pinned line above Close).
**Then** `chapt_8/c8_drill_case` → Hint (the three-plus case: say-all left in
the scrolling content, Back/More pinned alone).

Two things here I cannot judge from Chrome:

1. **Flex-footer behaviour on iOS.** The chart owns the scroll and the pinned
   line sits outside it. My checks measure boxes in Chromium, which is not
   adequate for WebKit's scroll/flex at rest — that is the class of defect
   that produced your pane (a) and (c) complaints in the first place.
2. **The divider changed app-wide.** It was a 12px soft shadow; it is now a
   1px line with padding above and below, because your amendment asks for a
   divider with a light strip on both sides and a fading shadow is neither
   crisply one nor clearly padded. That lands on **every** modal — drill hints,
   popups, the end-of-chapter dialog, the keyboard reference — so it is worth a
   glance beyond the hints.

While you are in a hint: `chapt_10/c10_drill_parsing` → Hint, stepping Next
until the εἰμί chart comes up, is the one state with **no say button at all**.
Its lone toggle centres on its own line (§4.5, the rule your εἰμί finding
produced). You have not seen the fix.

*Knob*: `.modal-actions` and `.pg-modal-host .pg-controls` border-top and
padding in `src/app.css`.

---

## B. Wording you may want to veto (all data, so a veto costs a pipeline pass, not renderer work)

### B1. The chapter-8 short forms — PIPELINE-CHOSEN

**Route** `chapt_8/c8_learn_third_person`, Next Topic x2.

The three accordion titles read **"Pronoun Examples"**, **"Reflexive
Intensifier Examples"**, **'"Same" Examples'**. They are the pipeline's
abbreviations of "as a pronoun" / "reflexive intensifier" / 'adjective meaning
"same"'. Your §3.5 asks for a one-or-two-word qualifier, so something had to be
shortened; these are the shortenings, not your words.

### B2. The chapter-7 Greek titles — and a directive-9 asymmetry on that screen

**Route** `chapt_7/c7_learn_eimi`, Next Topic x3.

**"οὐ Examples"**, **"οὐκ Examples"**, **"οὐχ Examples"**. Greek in a control
label is new, and the amendment allows it. The intended contrast is that a
Greek word in a TITLE is a control label — green, inert — while Greek in the
page's prose is a blue audio tap. Worth confirming the green titles read as
labels rather than as broken tap targets.

**While you are there, a separate thing I found checking this and could not
settle myself.** In the three rule items above the accordions, **only οὐ is a
blue tap. οὐκ and οὐχ are plain ink.** Three parallel rule lines, one word
blue and two not:

> 1) **οὐ** before a consonant;
> 2) οὐκ before a vowel with a smooth breathing mark; and
> 3) οὐχ before a vowel with a rough breathing mark.

Cause: the page inherits the chapter's tap map, which is built from lexicon
lemmas plus activity audio maps. οὐ is a lemma with a clip; οὐκ and οὐχ are
forms of it and are in neither source. Their clips (`chapt_7_g_ouk`,
`chapt_7_g_oux`) do exist and DO play — from the headword inside each
accordion. So nothing is missing audio; the taps are just not wired in the rule
text.

This predates SPEC2 (it is how the SPEC1 conversion shipped) and it is a data
matter, so I have not touched it. Directive 9 says all displayed Greek is
tappable, which argues for adding the two forms to an `audioMap`; the counter-
argument is that the accordion headword is the tap and the rule line is
naming a spelling rather than a word. Your call which.

### B3. "Say Endings"

**Route** `chapt_3/c3_drill_verb_translating` → Hint → tap **Endings**.

The replaced state's say button reads **"Say Endings"**. It was left as your
call in SPEC1 and the device pass did not reach this state (your pane f shows
the paradigm state, not the endings state).

My observation: it reads correctly but not obviously — once the state is open
the heading above also says "Endings", so the button repeats it. The
alternative is "Say Whole Paradigm", identical to the other state's button,
letting the heading carry the difference. I kept "Say Endings" because the clip
really is the bare endings and its being a different clip from the paradigm's is
the whole reason it needed a button of its own. Yours to overrule.

*Knob*: `endingsSayLabel` in `Paradigm.svelte`, or a `sayLabel` key on the
chart's `endings` object, which the renderer already reads.

---

## C. Editorial readings

### C1. Does the chapter-1 Capitals Note read well at its restored length?

**Route** `chapt_1/c1_learn_capitals`, scroll below the letters chart.

Two screens were restored from the TBK and merged into one inline note (your
§3.8 named exception keeps it inline rather than making it an accordion). It is
noticeably longer than it was. Nobody has read it as a passage since it was
reassembled — this is a "does it read as one note" question, not a layout one.

### C2. Chapter 8's Review page now repeats its heading

**Route** `chapt_8/c8_qr_third`.

This is the page your item 4 converted from a pager to a stack. Stacking
exposed something the pager hid: the three charts carry the authored titles
**"Third Person Personal Pronouns"**, **"Third Person Pronouns"**, **"Third
Person Pronouns"**, and you now see all three at once, one above the other, two
of them near-identical.

I rendered them exactly as authored rather than deduplicating, because the data
is not mine to reshape and a rule that hides the second and third headings would
be a rule I invented. If it reads as repetitive, the fix is a data pass (drop or
differentiate the repeated titles) — the per-chart subtitles Masculine /
Feminine / Neuter already do the distinguishing work.

### C3. The chapter-8 "Three Uses" title line inside its accordion

**Route** `chapt_8/c8_learn_third_person`, Next Topic x2, open any accordion.

Chapter 8's example blocks have no Greek headword, so they head with a title
("αὐτός as a pronoun"). The spec described that line as "ink"; I set it in the
heading green, mirroring `.popup-title` — which is exactly how that same string
looked when this content was a popup, and the spec's own instruction was to
reuse the popup's layout conventions. The two readings conflict and I chose
fidelity to the popup. One line to change if you want ink.

*Knob*: `.rc-wu-title` in `src/app.css`.

---

## D. Ratify a data edit I made

### D1. Chapter 5's Review Definite Article — I restored two missing say-alls

**Route** `chapt_5/c5_qr_article`.

The delivered data for the restacked page carried **no say control on either
chart**, against the spec's own acceptance line ("two charts, two say-alls").
Under the standing §0.3 exception I restored one per chart:

- Singular → `chapt_5_e_artsg`, Plural → `chapt_5_e_artpl`
- label "Say Whole Paradigm"

Nothing was chosen: the pre-split six-column chart carried exactly those two
clips as a `sayWholeEach` pair in that order, the Learn page pairs the same two
clips with the same two charts, and the label is the string this chart already
shipped with. The delivered `_layout_note` asked the implementer to verify the
per-chart say control against the ch9 Review pattern, which is what this is.

**What to confirm**: that each button speaks the right half, and that under the
chart is where you want it.

---

## E. Print

### E1. Print one Review page

Printability is the stated rationale for §4.6, and it is the one claim in the
amendment nothing in the toolchain can test.

**Route** `chapt_8/c8_qr_third` (the page that converted).

Two specifics worth watching: whether the three charts break across pages
sensibly, and whether the thin rule drawn **between** stacked charts prints
acceptably. That rule predates this round and I left it alone — it is a content
separator inside the scroll, not a footer divider, so your §4.3 one-divider rule
does not reach it. It will show up in print.

---

## Already settled by your device pass — not re-asked

Your review is the authority on these; SPEC2 implemented them and the harness
now enforces them:

- accordion style (boxed, green title, minimal padding, no inner indent) — item 1
- pinning restricted to modals; the one footer composition; no divider between
  the nav line and Close; never a pinned say button alone — item 2
- "<Qualifier> Examples" titles — item 3 (the specific short forms are B1/B2)
- Review pages never page — item 4
- item 5 was "[nothing yet]"; nothing was built

## Already verified by me — not asked

Machine-checked in a real browser, so these are not judgment calls. 117
disclosure checks, 861 behaviour checks, 155 modal states, 105 rail stops x 2
widths, all green:

- every accordion in all ten chapters: boxed (computed border and fill), green,
  no underline, collapsed on arrival, no body indent, one shared padding value
- in-text links green and underlined; chapter 6's in-chart triggers still blue
- eleven modal states measured against the footer composition: at most one
  pinned line, exactly one divider, none between the nav line and Close,
  measured padding on both sides, Close last
- nothing in main content computes to `position: sticky`
- zero pagers on every Review page in all ten chapters; every multi-chart Review
  page stacks with one say-all per chart
- all 33 qualified "Examples" labels render as authored; no bare "Examples"
  survives; the ch7 Greek titles carry no tap target
- no "Unsupported content block" anywhere; no horizontal overflow at 320px; no
  console errors
- **airplane mode**: service worker installed, network offline, 44 rail stops
  rendered, 0 missing, refresh OK, no console errors

A device airplane-mode pass would additionally exercise iOS's own service
worker and audio cache, which Chromium does not. Say the word if you want that
back on the list.
