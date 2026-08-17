# DISCLOSURE-SPEC2 -- Corrective round: accordion box style, modal footer discipline, C9 stacking, qualified labels

Round: DISCLOSURE, revision 2 (both implementers, separate physical
repo copies). Base: repo head `fae598e` (DISCLOSURE-SPEC1 merged, Opus
tree, no XPATCH). Authority: **DISCLOSURE-RULES.md as amended
2026-08-17** -- read the amended copy delivered with this spec, not
the committed one; Nathanael commits it with this round. The device
review that ratified these amendments is **Disclosure_Spike_Review.pdf**
(checked clean of strikethrough); it is a STANDING ATTACHMENT to this
round and its screenshot panes are the visual reference for every item
below.

This is a small, sharply-scoped round: four correction areas, five
data files. Everything DISCLOSURE-SPEC1 built that is not named below
is correct and must not drift -- run the SPEC1 harness at the end and
require it green apart from assertions this spec deliberately changes.

## 0. Standing round rules

Identical to DISCLOSURE-SPEC1 section 0 (directives 1-10; no git
writes -- read-only `git diff`/`git show` only; data copied verbatim,
visual-verification edit exception with before/after reporting; STOP
on missing or unexpected shapes; checkpoint discipline). Deliverables:
`DISCLOSURE-SPEC2-RESULTS-<MODEL>.md`,
`DISCLOSURE-SPEC2-BUILD-<MODEL>.md`,
`DISCLOSURE-VISUAL-CHECKLIST2-<MODEL>.md`. The round ends with the
airplane-mode check.

## 1. Data file inventory (5 files, delivered with this spec)

chapt-04, chapt-05, chapt-07, chapt-08, chapt-10 (.json), regenerated
from the live repo copies at `fae598e`. ONLY change: the 27 bare
"Examples" accordion labels gain qualifiers per amended §3.5. The full
label list is in DISCLOSURE-PATCH.md's second-pass section; verify
with a JSON-level diff that labels are the only change, then copy in
verbatim. No shape-guard work is needed -- no new block types.

W-order: data first (it cannot break anything -- labels only), then
W2-W5 in any order, harness last.

## 2. W2 -- Accordion box style (amended §3.1)

The borderless green-text accordion SPEC1 shipped is superseded. The
target is the boxed variation with the title in green -- pane (f) of
review item 1, and the "Rule 1: Nouns are retentive" boxes visible in
the item-2 screenshots:

1. `.rc-expander` (app.css ~682): restore the box -- `border: 1px
   solid #ddd6c2; border-radius: 10px; background: #fffdf3;` (one
   step lighter than the #fdf9e7 card, per the amended rule). Padding
   MINIMAL: summary in the neighborhood of 6-8px vertical / 10px
   horizontal (the pre-SPEC1 11px/13px read as bloated on device --
   match the PDF panes, not the old values).
2. Summary stays green var(--teal-dark) with the green caret (both
   marker pseudo-elements, as now), no underline, collapsed default.
3. **No hanging indent in the body**: `.rc-expander-body` currently
   pads `1.15em` left -- remove it. Body text starts at the box's own
   padding edge; the box determines placement (amended §3.1). Check
   `.rc-item-below .rc-expander-body` (~1597) for a second indent
   source.
4. Six Points (ch1) renders through the same `.rc-expander` -- after
   this change it must look identical to every other accordion,
   including padding (review item 1(b) flagged its padding as
   inflated; whatever nested-card spacing causes that, flatten it).
5. **Meanings is the one exception** and does not change in this
   round: green, underlined, caret, no border (rule 9 / R6 as built).
6. Interspersed `below` accordions inside numbered items keep their
   position but get the same box; confirm against the "6 Accent
   Rules" pane that box width sits inside the item's text column and
   does not inherit the number's hanging indent.

## 3. W3 -- Modal footer discipline; main-content pinning revoked (amended §4.3)

The review found five distinct wrong compositions (item 2, panes a-e).
The single correct composition, everywhere, is pane (f):

1. **Revoke main-content pinning.** Delete the sticky main-content
   branch (`.paradigm.pg-pinned-controls:not(.pg-modal-host)
   .pg-controls { position: sticky; ... }`, app.css ~1022) and any
   divider it introduced -- specifically the dark line between
   Meanings and the say-all row on Learn pages (item 2(a), the ch4
   Masculine Declension screen). Main-content control rows scroll
   with their chart.
2. **One modal footer composition**, top to bottom: scrolling
   content; thin light padding; ONE divider; thin light padding; at
   most ONE pinned line of navigation; Close. No divider between the
   nav line and Close, ever. Neither the scroll content nor the
   buttons touch the divider (panes a and c show the butting to
   avoid).
3. **Two-screen modals** (§4.1): say-all + the single toggle share
   the one pinned line (pane f: "Say Whole Paradigm | Endings" above
   Close). This kills panes b/d/e: no separate dividers around Close,
   no toggle on a different line from the say button, no say+nav
   group divided from Close.
4. **Three-plus modals** (§4.2): the Back/More pair is the pinned
   line; the say-all button is NOT pinned -- it stays in the
   scrolling content with its chart (the ch8 Third Person hint is the
   3+ case: pane on p.5 left shows say pinned above Back/More --
   wrong twice: two nav lines, and a pinned say without nav on its
   line).
5. **Never pin a say button alone** (item 2(c), the ch5 Declining
   Noun hint: single-chart modal had Say Whole List pinned). A modal
   with no navigation pins nothing above Close -- the say button
   scrolls with the chart.
6. §4.5 unchanged: a pinned nav line with no say button centres its
   control.
7. Audit EVERY modal in the app against composition 2 -- drill hints
   ch2-ch10, the main-content Endings modal, popups. One
   implementation in the shared modal footer, not per-host fixes.

## 4. W4 -- Quick Review never pages (amended §4.6)

`ContentAudio.svelte` paradigmChart mode: `stackedParadigms` (~118)
stacks only when every chart lacks a `name`, so `c8_qr_third`
(Masculine/Feminine/Neuter) pages with Back/More -- the review item 4
violation. Review pages must be PRINTABLE: all content visible in one
flowing scroll.

1. On Quick Review surfaces, ALWAYS stack `paradigms[]` -- delete the
   name-based heuristic for this host. A named chart renders its name
   as its heading (c8_qr_third's charts already carry `subtitle`;
   keep rendering that, do not double-print).
2. One say-all per chart, in the scrolling flow (they are audio
   buttons, not pagination -- §4.6). No Back/More, no toggles,
   anywhere on a Review page.
3. Sweep ALL chapters' quickReview activities: c5_qr_article,
   c9_qr_paradigms, c10_qr_paradigms already stack (unnamed) -- they
   must not regress; c8_qr_third converts. Assert in the harness:
   zero `pg-switch`/`pg-nav` elements on any /review route,
   app-wide.
4. Learn pages keep their pagers (§4.1/§4.2 unchanged there).

## 5. W5 -- Data consumption check

With the five files in place: ch3 shows its original "X Examples"
labels (unchanged); ch4/5/7/8/10 show the qualified labels. The ch7
Greek-qualified titles (οὐ Examples etc.) are control labels -- NOT
audio taps, no blue, no tap handler (amended §3.5). Verify the label
markup-stripping still applies (labels are plain text).

## 6. Verification

1. Re-run the full SPEC1 harness; expected failures are ONLY the
   assertions this spec changes (main-content pinning, QR pager,
   accordion computed styles) -- update those assertions to the
   amended rules, and say in RESULTS which ones changed.
2. New assertions: accordion box computed style (border + background
   + no body text-indent); at most one pinned nav line per modal and
   zero pinned elements outside modals; no divider between nav line
   and Close; say button unpinned in 3+ modals and in nav-less
   modals; zero pagers on /review routes; the 27 new labels render.
3. Visual checklist: one row per PDF pane (items 1-4) pairing it with
   the rebuilt screen, plus the four SPEC1 model screens for
   no-regression. Screenshot every row in a real browser.

## 7. VERIFY-DISCLOSURE2 items (human judgment only)

- iPhone pass of the boxed accordion against pane (f) taste: padding
  right?
- Modal footer feel with tall charts (ch8 Third Person hint) on
  device.
- The ch8 label short forms are PIPELINE-CHOSEN and vetoable:
  "Pronoun Examples" / "Reflexive Intensifier Examples" / '"Same"
  Examples'. The ch7 Greek titles likewise.
- Print check of one Review page (the stated rationale) if desired.
- Airplane-mode pass.

CONFIDENCE: 0.9. All four areas are traced to current code and the
amendments quote the review's own words.

KEY CAVEATS: exact box padding is matched to the PDF panes by eye, so
it lands in VERIFY; the ch8/ch7 label choices are flagged for veto;
review item 5 was "[nothing yet]" and nothing is built for it.
