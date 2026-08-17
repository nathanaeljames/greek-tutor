# DISCLOSURE-SPEC2-RESULTS-OPUS

Handoff for the DISCLOSURE corrective round (§0). Implementer: Opus
(claude-opus-5). Base: repo head `4f5f14d` (spec + data), which sits on
`fae598e` (DISCLOSURE-SPEC1 merged). Date: 2026-08-17.

Authority: DISCLOSURE-RULES.md **as amended 2026-08-17** (the copy in the
repo, read fresh), with Disclosure_Spike_Review.pdf as the standing
attachment and its panes as the visual reference.

No git was run beyond read-only `git diff` / `git show` (§0). Nothing is
committed, staged or pushed.

## 0. Status

All four correction areas are complete and every gate is green.

| Gate | Result |
| --- | --- |
| `npm run check:shapes` | PASS (0 failures) |
| `npm run build` | green |
| `npm run check:lazy-chunk` | PASS |
| `node scripts/ui-disclosure.mjs` | 117/117 (was 53; 64 added this round) |
| `node scripts/ui-behavior.mjs` | 861/861 |
| `node scripts/ui-modals.mjs` | 155/155 modal states clean |
| `node scripts/ui-smoke-5f.mjs` | 73/73 over 70 rail stops |
| `node scripts/ui-walk.mjs` | 105 stops x 2 widths, no horizontal overflow, no console errors |
| `node scripts/ui-offline.mjs` (airplane mode) | 44 stops offline, 0 missing, refresh OK, no console errors |

`npm run check:docs` still fails on 47 documents. Unchanged from
DISCLOSURE-SPEC1 RESULTS §7.1 and unrelated to this round: the guard
compares LF blobs against a CRLF working tree and its heading normalizer
(`/\s*\(.*$/`) cannot strip a trailing parenthetical when the line ends
`\r`, because `.` does not match `\r`. Nothing in `buildout/` was
modified by this round except the three new deliverables.

## 1. W1 — data verification

The five files were already in the working copy, committed at `4f5f14d`.
Verified against `fae598e` with a structural JSON diff (not a text diff):
**exactly 27 changes, every one of them an accordion `label`, and nothing
else in any of the five files.** ch4 8, ch5 8, ch7 3, ch8 3, ch10 5 —
matching DISCLOSURE-PATCH.md's second-pass list line for line. No
shape-guard work was needed; no new block types.

## 2. W2 — accordion box style (amended §3.1)

`.rc-expander` gets its box back: `1px solid #ddd6c2`, `border-radius:
10px`, `background: #fffdf3` — one visible step lighter than the
`#fdf9e7` card. The title stays green with the green caret (both marker
pseudo-elements), no underline, collapsed by default.

- **Padding is 7px/10px**, deliberately below the pre-SPEC1 11px/13px the
  review called inflated. Matched to the PDF panes by eye; it is a VERIFY
  item (§6.1).
- **The body's hanging indent is gone.** `.rc-expander-body` was
  `padding: 2px 0 10px 1.15em`; it is now `padding: 0 10px 8px`, so the
  body starts at the box's own padding edge, level with the summary. The
  second indent source the spec flagged (`.rc-item-below
  .rc-expander-body` in the ≤359px media query) was checked: it reclaims
  padding at the 320px floor rather than adding any, and is left alone.
- **Six Points lost its card wrapper.** DISCLOSURE-SPEC1 wrapped chapter
  1's stepper content in a `.card`, which was invisible while the
  accordion was borderless — the card WAS the box you saw. With a box on
  the accordion, that card became a box inside a box, and its 16px
  padding around a one-line summary is exactly the inflated spacing the
  review flagged in item 1(b). Unwrapped, Six Points is one accordion
  box, and the harness now asserts that every accordion in the app
  resolves to the SAME summary padding (D2.8), which is what makes this
  impossible to reintroduce from any host.
- **Interspersed `below` accordions** sit inside the numbered item's text
  column, not the number's hanging indent — confirmed against the 6
  Accent Rules screen (checklist row 1.5).
- **Meanings is untouched**, per §3.1's own exception and W2.5.

## 3. W3 — modal footer discipline; main-content pinning revoked

**Main-content pinning is deleted, not narrowed.** The sticky rule
(`.paradigm.pg-pinned-controls:not(.pg-modal-host) .pg-controls`) and its
`box-shadow` divider are gone, and with them the dark line between
Meanings and the say-all row on the ch4 Masculine Declension page (item
2(a)). `pinnedControls` no longer exists in `Paradigm.svelte`. The
harness assertion that used to require the row to stay on screen is
inverted: D8.1 now measures that the row moves exactly as far as the page
scrolls, and D8.1b asserts nothing in main content computes to
`position: sticky`.

**One modal footer composition, everywhere.** Top to bottom: scrolling
content, padding, ONE divider, padding, at most ONE pinned line of
navigation, Close — with no divider between the nav line and Close.

- The divider is now a 1px line rather than a 12px `box-shadow` gradient
  on `.modal-actions`. The amended rule asks for a divider with a light
  strip above AND below it, and a shadow fading into the content is
  neither crisply one nor clearly padded. This is the shared footer, so
  it lands on every modal in the app at once — which is the point, since
  the review found five different compositions across the chapters.
- `.paradigm.pg-pins-nav + .modal-actions` zeroes the footer's own
  divider whenever a pinned line precedes it. That is what kills panes
  (b) and (e): there is never a second divider around Close.
- **Two-screen modals** put the say-all and the single toggle on the one
  pinned line (pane f).
- **Three-plus modals** pin the Back/More pair only; the say-all stays in
  the scrolling content with its chart. This fixes the p.5-left pane,
  which was wrong twice (two pinned lines, and a pinned say with no nav
  on its line).
- **A say button is never pinned alone.** A modal with no navigation pins
  nothing above Close (item 2(c), the ch5 Declining Noun hint).
- §4.5 is unchanged in effect but broader in reach: `no-say` now also
  covers a three-plus composite bundle whose say button is deliberately
  unpinned, so the remaining control still centres.
- **Audited every modal in the app**, not per host: D13 walks eleven
  modal states (drill hints ch2-ch9, the main-content Endings modal, a
  chapter-6 popup) and measures all five composition rules against each.

One structural change was needed to do this without duplicating markup:
the say-all row now has two possible placements (pinned, or in flow), so
it was extracted into `src/components/ParadigmActions.svelte`. Two copies
of that markup differing only by parent is exactly how the two would come
to disagree.

## 4. W4 — Quick Review never pages (amended §4.6)

`ContentAudio.svelte`'s `stackedParadigms` no longer reads chart names:
`paradigmChart` mode is used by `quickReview` activities and nothing
else, so it IS the C9 host, and it now stacks any `paradigms[]` it is
given. `c8_qr_third` converts from a Masculine/Feminine/Neuter pager to
three stacked charts, each printing its own authored title and subtitle
and carrying its own say-all. `c5_qr_article`, `c9_qr_paradigms` and
`c10_qr_paradigms` already stacked and are unchanged — asserted, not
assumed (D14.2).

The Review pager markup is deleted outright, which also removes the
second copy of `.pg-nav` in the app: `Paradigm.svelte` is now the only
renderer of the Back/More pair, so there is one fewer place for it to
drift. The name/no-name distinction is still real and still decides
paging on LEARN pages; it simply has no authority on a Review page.

D14.1 sweeps every `quickReview` activity in all ten chapters and
asserts zero `pg-switch`/`pg-nav` elements.

## 5. W5 — data consumption

- ch3's original "X Examples" labels are unchanged (checklist row 3.3).
- ch4/5/7/8/10 show the qualified labels; all 27 render as authored
  (D15.2 reads them from the shipped data and matches them against the
  screen, so it cannot pass by agreeing with itself).
- No bare "Examples" label survives anywhere in the data (D15.1).
- **The ch7 Greek-qualified titles are control labels, not audio taps**:
  green, no `button` or `.greek-tap` inside the summary, verified as
  computed style plus element count (D15.3). The Greek οὐ in the rule
  text ABOVE each accordion remains a blue audio tap, which is the
  contrast the amended §3.5 is drawing.
- Label markup-stripping is unchanged and still applies: `stripMarkup`
  on the summary, and D2.4 asserts no label prints `[[`.

## 6. Harness: what changed and why (§6.1)

Five assertions asserted the state the amendments reverse. Each was
rewritten to the amended rule rather than deleted, and each names what
changed:

| # | Assertion | Was | Now |
| --- | --- | --- | --- |
| 1 | `ui-disclosure` D8.1 | the ch8 Third Person LEARN control row stays on screen at both ends of the scroll | it SCROLLS with its chart; plus D8.1b, nothing in main content computes sticky |
| 2 | `ui-behavior` 5F §2.8 | drove the ch8 Review pager through Masculine → Feminine → Neuter | the three charts are on the page at once, each naming itself, nothing paging between them |
| 3 | `ui-behavior` 5F §2.8 (A4) | audio stops on a chart switch, tested on the Review page | same rule, moved to the ch8 LEARN page, which is where a chart switch still exists |
| 4 | `ui-behavior` 5G G8 | "ch8 third person stays a More/Back sequence (its charts are named)" | it is a STACK on its Review page, with no pager |
| 5 | `ui-behavior` 5G-SPEC2 stem variations | label is exactly `"Examples"` | label is `"<Qualifier> Examples"` per item; the placement half is untouched |
| 6 | `ui-behavior` QR say-whole census | `stacked = charts.length > 1 && every(!name)` | `stacked = charts.length > 1` |
| 7 | `ui-behavior` P3.2 nav-pair list | included `ch8 Review Third Person (ContentAudio pager)` | removed with the pager it measured |

New assertions added (64 checks, `ui-disclosure.mjs` 53 → 117):

- **D2.6/D2.7/D2.8** — every accordion in the app is the box (computed
  border and background), no body is indented past its summary, and every
  summary resolves to the SAME padding.
- **D13** — the footer composition across eleven modal states: at most one
  pinned line and only in a modal; a say button pinned only beside a nav
  control; exactly one divider; none between the nav line and Close;
  measured padding above and below it; Close last. A divider is read as
  border-top OR box-shadow, so swapping one for the other cannot pass.
- **D14** — zero pagers on every Review page app-wide, and every
  multi-chart Review page stacks all its charts with one say-all each.
- **D15** — no bare "Examples" survives; all qualified labels render as
  authored; the ch7 Greek titles are control labels with no tap target.

## 7. Known gaps

- **Box padding (7px/10px) is matched to the PDF panes by eye**, as the
  spec's own caveat anticipates. It is the first VERIFY item.
- **Review item 5 was "[nothing yet]"** and nothing was built for it.
- **`.rc-word-popup` / `.rc-num-popup` remain dead paths** (carried over
  from SPEC1 §7.3); no data uses `numberPopupRef`.
- **The `paradigm-stack-rule` divider** between stacked Review charts is
  unchanged from SPEC1. It is a content separator inside a scroll, not a
  footer divider, so §4.3's one-divider rule does not reach it — flagged
  because a printed page will show it.

## 8. VERIFY-DISCLOSURE2 items (human judgment only)

1. **iPhone pass of the boxed accordion against pane (f): is the padding
   right?** 7px/10px is my read of the panes. The knob is
   `.rc-expander summary` padding in `src/app.css`; the body follows from
   `.rc-expander-body`.
2. **Modal footer feel with tall charts on device** — the ch8 Third
   Person hint is the case: say-all in the scroll, Back/More pinned.
3. **The ch8 label short forms are pipeline-chosen and vetoable**:
   "Pronoun Examples" / "Reflexive Intensifier Examples" / '"Same"
   Examples'. The ch7 Greek titles likewise (οὐ Examples). Both are data,
   so a veto costs a data pass, not a renderer change.
4. **Print check of one Review page** — the stated rationale for §4.6.
   `c8_qr_third` is the page that changed; worth checking the
   between-chart rules print acceptably (§7 above).
5. **Airplane-mode pass on device.**

## 9. Divergence-log entries to cite

- **§3.1 amended**: accordions are boxed again; the borderless render
  DISCLOSURE-SPEC1 shipped is superseded, and the body's hanging indent
  is removed with it.
- **§3.5 inverted**: "<Qualifier> Examples" is the rule and bare
  "Examples" the exception; Greek is allowed in a title and a Greek word
  in an accordion TITLE is a control label, not an audio tap.
- **§4.3 amended**: pinning is modals only. The main-content sticky added
  by DISCLOSURE-SPEC1 is REVOKED. Exactly one pinned nav line, one
  divider, never between the nav line and Close; a say button is pinned
  only beside a nav control.
- **§4.6 enforced**: Review pages never page, regardless of chart names,
  because they must be printable. `c8_qr_third` converts from pager to
  stack; the ContentAudio Review pager is deleted.
