# 5E-SPEC3-PATCH.md — the four device reports from 5E-SPEC3-RESPONSE

Nothing committed, nothing pushed. FIVE rounds of device reports from one
conversation, each addendum appended as it was fixed. A full index of all
twelve items is at the END of this document; read that first for handoff.

  items 1-4  (`de9a536`)  heading, modal attempt 1, arrival audio, elision
  item  5    addendum 1   the apostrophe key (D-29)
  items 6-8  addendum 2   caret drag, modal at rest, straight glyph
  items 9-10 addendum 3   elision required as U+0027, modal vs the app bars
  items 11-12 addendum 4  caret visible while dragging, Show Answer (D-30)

| File | What |
| --- | --- |
| `src/app.css` | Item 2. The modal no longer scrolls itself; the overlay scrolls the whole modal. Also removes the keyboard grid's own 50vh scroll. |
| `src/components/RichContent.svelte` | Item 1. The heading dedup key no longer depends on which dash the typographic pass chose. |
| `src/components/SelectActivity.svelte` | Item 3. The arrival clip reads its timing from the data, not from a reactive value that does not exist yet. |
| `src/lib/answer-check.js` | Item 4. A breathing in a position Greek cannot put one is the elision apostrophe, and comes off with the punctuation. |
| `scripts/ui-behavior.mjs` | The assertion that passed on the broken modal, rewritten; plus new assertions per item. **283 checks.** |
| `scripts/ui-modals.mjs` | **New.** A modal visual pass at real device heights. |
| `src/data/speller-tiles.json` | Item 5. The apostrophe tile (D-29), app-wide via the shared D-15 contract. |
| `src/components/SpellerKeyboard.svelte` | Item 5. The `'` physical key types U+1FBD; the reference popup names it. |
| `scripts/check-content-shapes.mjs` | Item 5. Build fails if displayed punctuation in a spelling answer has no tile. |
| `buildout/DIVERGENCE-LOG.md` | D-29. |

---

## Item 2 — the modals, and why the last "fix" made it worse

**You were right that it got worse, and the test that said otherwise was
mine.** Worth being precise about both halves.

### What shipped

5E-SPEC2 capped `.modal` at `calc(100dvh - 40px)` and gave it
`overflow-y: auto`. Measured on your exact surface — chapter 5 First Declension
Hint with Meanings open — at 390×734:

```
modal height        694px   (capped to the viewport)
modal content      1175px
overlay scroll range   0px   ← the overlay had nothing left to scroll
Close button at     y=1129   ← 435px below the fold, inside the modal
```

So every pixel of travel lived in a **nested scroll region inside a
`position: fixed` overlay**, which is the one thing iOS touch scrolling is
worst at grabbing. "I can barely click on the button" and then "I can't click
on it at all" is an accurate description of that arrangement getting slightly
taller. The previous shape (86vh + flex centring) overflowed at both ends
unscrollably; this one moved the trap inward rather than removing it.

### Why the test passed anyway

The §6.7 check called `close.scrollIntoViewIfNeeded()` and then measured. That
helper drives **whatever** scroll container the element sits in, including the
inner one. It proved the button existed somewhere scrollable — never in doubt —
and said nothing about whether a thumb could reach it. Playwright got there;
you could not. That is the actual defect in this round, and it is a testing
defect, not a CSS one.

### The fix

Your sentence is the specification: *"You should be able to scroll until you
can see the top border and bottom border of the modal popup on any popup in the
app."* That rules out any inner scroll, so:

- `.modal` gets **no `max-height` and no `overflow`**. It is as tall as its
  content.
- `.modal-overlay` is the **single** scroll container. Scrolling it end to end
  therefore passes both borders — at any viewport height, on any engine, with
  no `dvh` support required.
- The overlay's height is pinned to `100dvh` (with a `100vh` fallback) so its
  bottom edge on iOS is the bottom you can *see*, not the one behind the
  toolbar. `.app` already pinned itself the same way.
- Flex + `margin: auto` centring stays and is safe: when the modal is shorter
  than the overlay it centres; when it is taller the free space is negative,
  auto margins resolve to zero (CSS Flexbox §8.1) and it falls back to the top,
  which is the scrollable arrangement. The browser picks between them.

**One more nested scroller found and removed while in there:**
`.kb-ref .kb-grid` capped the Greek Keyboard reference's tile grid at 50vh with
its own scroll — the same trap, one tap away from every speller. Gone; the
overlay scrolls the whole reference card.

### Measured, at your device's real sizes

iPhone 14 is 390×844 CSS px; Safari showing its toolbars leaves about 390×734,
and with the URL bar expanded about 390×664. All three are now in the harness,
along with 320×360 and the iPad breakpoint.

| Viewport | modal | overlay scroll | top border | bottom border | Close |
| --- | --- | --- | --- | --- | --- |
| 390×844 iPhone 14 | 1175px | 371px | 20 ✓ | 824 / 844 ✓ | 758–802 ✓ |
| 390×734 toolbars | 1175px | 481px | 20 ✓ | 714 / 734 ✓ | 648–692 ✓ |
| 390×664 URL bar | 1175px | 551px | 20 ✓ | 644 / 664 ✓ | 578–622 ✓ |
| 320×360 | 1451px | 1011px | 20 ✓ | 340 / 360 ✓ | 394–438 ✓ |
| 768×1024 iPad | 1126px | 142px | 20 ✓ | 1004 / 1024 ✓ | 938–982 ✓ |

### The new test

`checkCloseReachable` no longer uses `scrollIntoViewIfNeeded`. It drives
**only** `overlay.scrollTop` — the one container a finger can grab — and
asserts your four things: top border on screen at scroll 0, bottom border on
screen at scroll end, Close fully inside the viewport there, and **zero**
scrollable elements anywhere under the overlay.

**Negative control**: with the shipped CSS restored, that loop produces **24
failures**, including the case you hit — `ch4 Greek Noun Hint + Meanings at
390×844: close 1170..1214, viewport 844`. The old loop reported all 24 as
passes.

---

## Item 1 — the duplicated heading

Chapter 5's seventh Learn topic is titled `First Declension—Masc`; its chart is
titled `First Declension—Masculine`. `RichContent` has deduplicated exactly
this pair since 5E-SPEC1 — **by matching the literal string `--Masc`**.

Then the D2 typographic rule rewrote every displayed `--` as an em dash. The
two titles stopped keying the same and the heading came back doubled. A
typographic rule silently disarmed a deduplication rule that was matching on
the old punctuation, and nothing failed.

The key now folds every dash form, case and spacing before comparing, so it
cannot be broken again by a decision about punctuation. Your instruction —
"just keep the title at the top" — is what it does: the topic's own heading
stays, the chart's is suppressed. Verified in
`5e-spec3/768/chapt_5/c5_learn_nouns--topic7.png`.

Also added: a sweep over every topic/chart title pair in chapters 1–5 that
fails if a **second** abbreviation ever appears. Today `masc` is the only one,
which is what makes a one-word expansion safe.

**Negative control**: with the old key restored, the assertion reports
`["topic-heading: First Declension—Masc", "pg-title: First Declension—Masculine"]`.

---

## Item 3 — the first word no longer read on arrival

Real bug, and a nasty little one. `SelectActivity.init()` runs in the
component's instance body. Svelte does not evaluate `$:` declarations until
**after** that body returns — so when `init()` called `maybePronounce()`, the
reactive `audioTiming` was still `undefined`, the guard
`if (audioTiming !== 'beforeGuess') return;` fired, and the first item arrived
silent. Item 2 onward spoke normally, because by then the reactive pass had
run.

That "everything after the first one works" shape is exactly why it survived a
round of testing: every audio assertion in the harness answered an item before
looking, so none of them ever observed arrival.

`maybePronounce` now reads `activity.audioTiming` from the data directly. All
16 `beforeGuess` drills in chapters 1–5 are now asserted to speak on arrival
with **no click and no keystroke**.

**Negative control**: with the reactive read restored, all 16 fail with
"no clip was created at all".

---

## Item 4 — the free-floating mark, answered

**No, a free-floating breathing is never correct in Koine — and that mark is
not a breathing.**

`δι᾽ ἐμοῦ` is διά with its final alpha elided before a vowel, and the mark is
the **elision apostrophe**. Unicode calls it U+1FBD GREEK KORONIS and gives it
the compatibility decomposition `<space> + U+0313 combining comma above` — it
is *literally* a smooth breathing drawn over nothing. That is why it looks like
one, why the original's keyboard let you enter it with the smooth-breathing
key, and why your instinct that something was off was right.

A real breathing can only sit in three places: on a word's initial vowel, on
the second vowel of an initial diphthong (`οὐ`, `εἰ`), or on an initial rho
(`ῥ`). It never floats and it never appears after a consonant-initial word's
vowel. So on `δι` — a word starting with δ — no breathing is possible at all,
and what you typed could only ever have meant the apostrophe.

**Your other two observations were also correct:**

- The port draws it slightly *after* the iota because it is its own character
  with its own advance width; the original's font drew it tucked over the
  preceding letter. Same character, different metrics.
- Chapter 3's `Ἰησοῦς` and `Ἐγώ` put the breathing *before* the letter because
  they are **capitals**. Greek sets a breathing to the upper-left of a capital
  rather than above it. You guessed that and you were right — it is not the
  same phenomenon as `δι᾽`.

**How would you type it?** You would not, and now you do not have to. The
shared keyboard's punctuation row is comma, raised dot, period, question mark —
no apostrophe — and neither did the original's. So the fix is on the grading
side, which is what the original was doing all along:

> When punctuation is optional (D-18), a breathing in a position Greek cannot
> put one in is the elision apostrophe, and comes off with the punctuation.

All three forms are now accepted for `δι᾽`: `δἰ` (your typing), `δι` (nothing
at all), and `δι᾽` verbatim.

**This can only ever forgive input, never change a correct answer.** Swept all
**148** delivered spelling answers across chapters 1–5: not one carries a
breathing in a position this rule would strip. `οὐδεὶς` keeps its psili
(initial diphthong), `ἐμοῦ` keeps its (initial vowel), `ῥ`-initial words keep
theirs. And the leniency is asserted to be scoped — a verse stripped of its
*real* breathings is still rejected.

**Negative control**: without the rule, `δἰ` fails with `feedback bad`.

**On the original being unwinnable** (your chapter-3 note): I did not touch
that. You said the ported version behaves as you expect there, and the port
does not clear the slate on a wrong answer, so nothing about chapter 3's
speller changes here.

---

## Verification

| Harness | Result |
| --- | --- |
| `npm run check:shapes` | PASS |
| `npm run build` | 27 precache entries; one pre-existing A11y warning at `DivideActivity.svelte:368` |
| `npm run check:lazy-chunk` | PASS |
| `npm run verify` | green |
| `ui-behavior.mjs` | **280/280**, three consecutive runs (was 240; +40 for this patch) |
| `ui-modals.mjs` | **55/55 modal states clean** — 11 surfaces × 5 viewports |
| `ui-walk.mjs` | 105 stops × 2 widths, 0px overflow, no console errors |
| offline (throwaway) | 7/7 |

### Visual verification

Two corpora, both regenerated:

- `buildout/screenshots/5e-spec3-modals/` — **110 new PNGs.** Every modal
  surface at each of the five viewports, captured **twice**: at the top of the
  overlay's scroll and at the end of it. The pair *is* the evidence for your
  rule, because the first image must show the top border and the second must
  show the bottom border and the close control.
- `buildout/screenshots/5e-spec3/` and `5e-spec3-answered/` — the rail walk and
  the answered-state captures, re-run against this build.

I looked at the images rather than only the numbers. Specifically:
`iphone14-844--ch5-first-decl-hint-meanings--1-top.png` (title and top border
on screen) and `--2-bottom.png` (Close fully visible with the modal's bottom
border below it) — the exact modal in your second screenshot;
`short-320x360--ch5-first-decl-hint-meanings--2-bottom.png` for the cruel case;
and `5e-spec3/768/chapt_5/c5_learn_nouns--topic7.png` for item 1's single
heading.

### On "did you not visually verify this"

Partly. Last round's walk photographed 474 rail stops and this round's harness
photographed 37 answered drills — but **no image in any corpus had ever shown a
modal**, so the one surface the round was supposed to fix was the one surface
nobody looked at. That is what `ui-modals.mjs` exists to prevent, and why it
captures both scroll ends rather than one representative shot. It also carries
the same refuse-to-overwrite guard as `ui-walk.mjs`.

---

## Not touched

Concurrent edits of yours are in the working tree and I left all of them alone:
`buildout/DRILL-BEHAVIOR-LEDGER.csv` renamed to `DRILLBEHAVIORLEDGER.csv`, plus
new `GRADER-PROMPT.md`, `PROJECT.md`, `scripts/transcode_audio.py` and a
modified `ONBOARD-SOL.md`.

One consequence worth flagging rather than fixing: `apply-behavior-matrix.py`
takes the ledger path as an argument so it still runs, but the invocation
recorded in its own docstring and in 5E-SPEC3-BUILD §5 names the old filename.
Say the word and I will update the references.

---

# Addendum — item 5: the apostrophe key (D-29)

Added 2026-08-07, after your DOSBox follow-up. Base for this addendum is the
same working tree; `speller-tiles.json`, `SpellerKeyboard.svelte`,
`check-content-shapes.mjs`, `ui-behavior.mjs` and `DIVERGENCE-LOG.md` changed.

## Your understanding, confirmed — with one correction

You wrote that the original *"seems to represent it as a breathing mark, depict
it as a breathing mark above the iota, and accept it as a smooth breathing mark
above the iota even while it actually rejects an apostrophe."*

**Confirmed on all four counts**, and your two DOSBox screenshots are what
confirm the last one: `δι'` typed with a real apostrophe returns
*"The word you missed was: 8"* — word 8 is `δι᾽` — while the smooth-breathing
form is accepted. Combined with the Major Hint drawing the mark *over* the
iota, the original is representing and comparing this as a combining breathing.

**The one correction**: I cannot tell from outside whether the original stores
a combining breathing, or simply has no notion of the apostrophe character at
all and rejects it as unknown input. Both explain the screenshots. The
distinction does not change anything we do, but it is the difference between
"the original models elision as a breathing" and "the original cannot represent
elision at all", and I do not want to assert the first when the evidence
supports either.

What is not in doubt: **a free-floating breathing is not legal Greek**, and the
original renders and grades one anyway. So it is working around its own missing
key, and the port should not inherit the workaround as though it were the
language.

## Also confirmed: the Iesous exercise is fine

Your first screenshot ends in *"Yes! that's right"*. The earlier failure was
the `η`→`ε` substitution in `Ιεσους`, exactly as I guessed — nothing to do with
breathings, and the capitals fold as they should. Nothing was changed for it.

## What the curriculum already says — the real argument for the key

This is the part that decided it, and it is stronger than anything I said
yesterday. **Chapter 2 teaches elision by name, three times:**

- **Learn Marks → topic "Apostrophe"**: *"Greek also uses an apostrophe to mark
  the missing letter(s). The final letter of a preposition, if it is a vowel,
  is dropped when it precedes a word that begins with a vowel"*, deriving
  `διά + αὐτοῦ` → `δι᾽ αὐτοῦ`, with the note *"the 'a' lost is replaced by an
  apostrophe; Jn 1:3,7 cf. Jn 1:39"*.
- **Marking Recognition Drill**: two scored items, `δι᾽ αὐτοῦ` and
  `παρ᾽ αὐτῷ`, whose answer is **"Apostrophe"** — from an option list that
  *separately* contains **"Smooth Breathing"** and **"Coronis"**.
- **Quick Review, Marks chart**: *"Apostrophe: ( ᾽ ) elided letters"*.

So the app teaches the mark, then drills the learner on telling it apart from a
breathing, and then two chapters later asks them to type it with no key for it.
That is the gap, and it is the app's own gap rather than an inherited one.

## The change

**1. A 40th tile.** `src/data/speller-tiles.json` gains an `apostrophe`
punctuation tile inserting **U+1FBD GREEK KORONIS** — the character the
delivered verses and the chapter-2 marks chart both use. Because that file is
the shared D-15 contract, the key appears on **every** spell surface in the app
at once and on the Greek Keyboard reference; no chapter can have a different
keyboard. The punctuation row is now `, · . ; ᾽` + space.

**2. The physical key.** `PUNCT_KEYS` maps `'` to U+1FBD — so the desktop
apostrophe key types the Greek elision mark, not the ASCII one. Both are
accepted, but what lands in the field should be the character the data uses.

**3. Grading accepts all three forms**, deliberately:

| Typed | Accepted | Why |
| --- | --- | --- |
| `δι᾽` — the new tile | ✓ | the correct character |
| `δι’` (U+2019) / `δι'` (U+0027) / U+02BC | ✓ | every Unicode spelling of the apostrophe |
| `δἰ` — smooth breathing on the iota | ✓ | **the original's own form**, so the habit it taught is never punished |
| `δι` — nothing at all | ✓ | punctuation is optional (D-18) |

The breathing leniency stays exactly as scoped as before: a breathing in a
position Greek *can* put one is still required. `οὐδεὶς`, `ἐμοῦ` and `ῥ`-initial
words are unaffected, and a verse stripped of its real breathings is still
rejected — asserted.

**4. A build guard so this cannot recur.** `check:shapes` previously deleted
punctuation before asking "is this answer typeable", which is right for
*whether the answer can be entered* (D-18 makes it optional) but meant `δι᾽`
counted as typeable while no key could produce the mark. It now *also* fails
when displayed punctuation in a spelling answer has no tile:

```
FAIL: chapt-04.json.exercise[2]: "δι᾽" displays punctuation "᾽" (U+1FBD) that
no speller tile can produce. It is optional under D-18, but a learner who
tries to type it has no key.
```

That is a negative control: removing the tile reproduces it exactly.

**5. `DIVERGENCE-LOG.md` D-29** records the 40th tile as a deliberate departure
from the original's inventory, with the chapter-2 teaching as its justification
and the original's breathing workaround described rather than copied.

## Verification

| | |
| --- | --- |
| `ui-behavior.mjs` | **283/283** (was 280; +3 for this item) |
| `npm run verify` | green, including the new punctuation guard |
| `ui-modals.mjs` | 55/55 — the keyboard reference grew a tile and still scrolls to both borders at all five viewports |
| `ui-walk.mjs` | 105 stops × 2 widths, 0px overflow, no console errors |
| offline | 7/7 |

The John 14:6b verse is now typed **verbatim** in the harness — apostrophe and
all — through the real tiles. That test could not be written before today: it
threw `no punctuation tile inserts "᾽"`, which was the defect stated as a stack
trace. The smooth-breathing form is now the fallback case rather than the only
one.

Visual: `buildout/screenshots/5e-spec3-answered/39-d29-apostrophe-tile.png`
shows the new key in the punctuation row with `δι᾽ ` typed into the field
entirely by tapping tiles.

## One thing worth your eye

The apostrophe tile and the smooth-breathing tile look nearly identical on
screen — they are the same comma-above shape, which is precisely why the
original conflated them. They sit in different rows (marks vs punctuation) and
the tile carries an `apostrophe` tooltip, and the Greek Keyboard reference now
says *"' is the apostrophe that marks an elided letter (δι᾽ ἐμοῦ)"*. If that
still reads as ambiguous on device, the cheap fix is a distinct label on the
punctuation tile rather than the bare glyph — say the word.

Chapter 1 ships an inline `spellerTiles` fallback that predates the 5D
punctuation row entirely (it has no punctuation or space keys at all), so it
was left alone: the shared contract always wins, and adding one key to a
fallback that is already three keys behind would only look like it was current.

---

# Addendum 2 — items 6, 7, 8 (2026-08-07, iPhone 14 / iOS 26.5.2)

Base commit `f0a75d0` ("finalizing phase 5e"). Six files changed, one added.

| File | What |
| --- | --- |
| `src/components/SpellerField.svelte` | Item 6. Hold-and-drag sweeps the caret; native selection and the iOS callout are suppressed. |
| `src/lib/viewport.js` | **New.** Item 7. Publishes `--modal-vh`, the height the user can actually see. |
| `src/App.svelte` | Item 7. Starts that tracking on mount. |
| `src/app.css` | Items 6 + 7. The field claims the gesture; the modal fits the screen and pins its actions. |
| `src/data/speller-tiles.json` | Item 8. The apostrophe key is printed straight. |
| `scripts/ui-behavior.mjs` | New assertions for all three; the modal contract rewritten again. **307 checks.** |
| `scripts/ui-modals.mjs` | Captures the at-rest state instead of the two scroll extremes. |

---

## Item 7 — the modal, third time. What kept going wrong.

You asked: *"What is going on that we keep failing at this simple
requirement?"* It is a fair question and it has a specific answer, in two
parts.

### Part one: I solved the wrong problem last round

Your words were *"you should be able to scroll until you can see the top border
and bottom border."* I read that as **reachable by scrolling** and built
exactly that — and it passed, and it was still unusable, because *"I cannot
pull and click at the same time."* Reachable-while-scrolling was never the
requirement; **at rest** was. That one is on me, not on the code: the tests I
wrote encoded my reading rather than your need.

### Part two: no CSS unit describes an iPhone

This is what defeated the *first two* attempts, and it is worth stating plainly
because it will bite anything else that sizes itself to the screen:

- `100vh` is the **largest** viewport — browser chrome hidden. It overstates
  the visible height by the height of the toolbars.
- `100dvh` tracks the current state, but a `position: fixed` element is laid
  out against the **layout** viewport, which is not the rectangle you are
  looking at.

So a modal capped at `100dvh - 40px` measures as fitting in every desktop
browser and is still taller than an iPhone's screen. That is precisely what
5E-SPEC2 shipped, and why "capped to the viewport" produced a dialog with both
ends off screen. **Chrome cannot reproduce it, which is why three rounds of
green tests meant nothing.**

### The fix — three things, all of them needed

1. **The box fits.** `--modal-vh` is now measured from `window.visualViewport`
   — the one API that reports the actual on-screen rectangle — published by the
   new `src/lib/viewport.js` and updated on rotation, toolbar changes and
   keyboard show/hide. The CSS fallback beneath it is **`100svh`**, the *small*
   viewport, which can only ever be too short, never too tall. Erring short
   costs a little air around the dialog; erring tall is what put your close
   button under the toolbar.

2. **The content scrolls, not the modal.** The modal is the only scroll
   container, and both of its edges are on screen, so you are scrolling
   something whose boundaries you can see.

3. **The actions are pinned.** `.modal-actions` is sticky to the bottom of the
   modal, so **Close is on screen the instant the dialog opens and never has to
   be scrolled to at all.** This is the part that makes your complaint
   structurally impossible to hit again: even if the height measurement were
   still off by some margin, the buttons are inside the box rather than at the
   end of its content. There is no longer any state in which you must pull and
   click at once.

### Measured at rest — nothing scrolled, hands off

Your surface, chapter 5 First Declension Hint with Meanings open:

| Viewport | modal top | modal bottom | Close | overlay range |
| --- | --- | --- | --- | --- |
| 390×844 iPhone 14 | 20 | 824 / 844 | 758–802 | **0** |
| 390×734 toolbars | 20 | 714 / 734 | 648–692 | **0** |
| 390×664 URL bar | 20 | 644 / 664 | 578–622 | **0** |
| 320×360 | 20 | 340 / 360 | 274–318 | **0** |
| 768×1024 iPad | 20 | 1004 / 1024 | 938–982 | **0** |

An overlay scroll range of zero *is* the "it fits" assertion — range there
would mean the box was taller than the screen.

### The test now asserts at rest, and scrolls nothing

`checkCloseReachable` no longer touches any scroll position. It measures the
state the dialog opened in: both borders on screen, Close fully on screen,
overlay range zero, and the modal the only scroller. **Negative control**:
restoring last round's model gives **28 failures**, e.g. `320×360: modal
-233..340 of 360, overlay range 253` — the top border 233px above the screen.

`ui-modals.mjs` was rewritten to match: it photographs each surface **at rest**,
then a second time with the content scrolled to its end, to show the action
block staying put while the content moves under it. 110 images, 55/55 clean.
The pair for your exact modal is
`iphone14-844--ch5-first-decl-hint-meanings--1-at-rest.png` and
`--2-content-scrolled.png`.

---

## Item 6 — hold and drag to move the cursor

The field is deliberately **not** an `<input>` (a real one summons the system
keyboard over the tile keyboard, which the shared speller must never do), so
the caret is a drawn `<span>`. That left a press-and-drag doing the worst
available thing: starting a native text selection and raising the Copy / Look
Up / Translate callout over the exercise — a selection nothing in the app could
act on, which is what your first screenshot caught.

It now works like the Syllable Division exercise. `pointerdown` captures the
pointer and every `pointermove` re-places the caret at the nearest position,
computed from the **laid-out clusters**, so wrapping, kerning and the Greek
font are the browser's business rather than arithmetic. On a wrapped verse the
nearest position on the nearest **line** wins, so dragging past the end of a
line lands at the end of that line instead of jumping to whatever is
horizontally closest two lines down.

Four CSS declarations make it stick, all load-bearing on iOS: `touch-action:
none` (or the browser takes the drag as a page scroll), `user-select: none`
(or it is a selection), `-webkit-touch-callout: none` (or the long press raises
the Copy/Look Up bar), and the existing text cursor.

Tapping still works exactly as before — same code path, zero-length drag — so
VERIFY-5D A6 defect 1 stays fixed.

**Asserted**: the caret sweeps `4 → 3 → 0` across a drag and stays at 0 after
release; no selection exists afterwards; a plain tap still lands where tapped;
and typing at a dragged caret inserts in place (`λυει` → `λχυει`) rather than
appending. **Negative control**: without the CSS the first check reports
`touchAction: manipulation, userSelect: auto`.

---

## Item 8 — a straight apostrophe

Yes, and you named the right character. **U+0027 APOSTROPHE** is the straight
vertical form with no curl — distinct from the smooth breathing, and from the
acute and the grave, which both slant.

The key is now **printed** with U+0027 and still **inserts** U+1FBD. That split
is deliberate: the label is what you need to tell two keys apart, while the
inserted character has to stay the one the delivered verses and the chapter-2
marks chart actually use, so what you type matches what the exercise shows you.
Grading accepts every form regardless, so nothing rides on it.

Worth noting this is the same confusion that made the original conflate the two
marks in the first place — U+1FBD really is a smooth breathing drawn over
nothing. Printing it straight is the app declining to repeat that.

Capture:
`buildout/screenshots/5e-spec3-answered/40-r8-straight-apostrophe-key.png` —
the punctuation row now reads `, · . ; '` with the tick unmistakably different
from the curled breathing two rows above.

---

## Verification

| | |
| --- | --- |
| `ui-behavior.mjs` | **307/307** (was 283), two consecutive runs |
| `npm run verify` | green |
| `ui-modals.mjs` | 55/55 at rest, across five viewports |
| `ui-walk.mjs` | 105 stops × 2 widths, 0px overflow, no console errors |
| offline | 7/7 |

Three negative controls, one per item, each confirming its assertion catches
its defect rather than merely passing alongside the fix.

**What still needs your device**, honestly: `visualViewport` and `svh` cannot
be exercised meaningfully in Chrome at a fixed viewport size — the whole class
of bug lives in the gap between what desktop CSS reports and what iOS shows.
The at-rest geometry above is real, and the pinned Close button does not depend
on the measurement at all, but the measurement itself is the one thing only
your iPhone can confirm.

---

# Addendum 3 — items 9 and 10 (2026-08-07)

| File | What |
| --- | --- |
| `src/lib/answer-check.js` | Item 9. The elision mark is required, and is no longer treated as droppable punctuation. |
| `src/data/*.json` | Item 9. Every displayed elision mark is now U+0027 (14 strings). |
| `src/data/speller-tiles.json`, `SpellerKeyboard.svelte` | Item 9. The key types U+0027. |
| `scripts/apply-behavior-matrix.py` | Item 9. A pipeline rule, so a regenerated chapter cannot bring the koronis back. |
| `scripts/check-content-shapes.mjs` | Item 9. The mark must be typeable, not merely omissible. |
| `src/lib/viewport.js`, `src/app.css` | Item 10. The modal is sized to the gap **between the app's bars**. |
| `EndOfChapterDialog`, `Paradigm`, `SelectActivity`, `Settings`, `SpellerKeyboard` | Item 10. A scroll region so the action block is a real footer. |
| `scripts/ui-behavior.mjs`, `scripts/ui-modals.mjs` | Both items. **307 checks.** |

---

## Item 9 — the elision mark is an apostrophe, and it is required

You are right and the original was wrong. A breathing is a diacritic that sits
on a vowel; an elision mark is a spacing character standing in for a dropped
letter. They are different things that happen to share a glyph shape, which is
how the original — with no apostrophe key — came to conflate them.

**Swept the whole app.** Every elision mark in rendered data was U+1FBD GREEK
KORONIS (`δι᾽`, `παρ᾽`, and the chapter-2 marks-chart label). All 14 strings
are now U+0027, across chapters 2, 4 and 5 and the chapter-2 lexicon. The rule
lives in `apply-behavior-matrix.py` beside the em-dash rule, so regenerating a
chapter cannot quietly restore the koronis.

**The keyboard** types U+0027 and prints U+0027 — what you type is now exactly
what the verse stores.

**The grader** accepts the apostrophe (in any of its Unicode spellings) *or* a
smooth breathing on the preceding vowel — the original's form, so nobody
trained on it is punished — and **rejects the mark's absence**. `δι` on its own
is now a misspelling. That required taking the apostrophe out of the droppable
punctuation class: it is not sentence punctuation, and D-18 should never have
covered it.

### The hazard the sweep caught

The sweep found four Greek words carrying a breathing that Greek "cannot"
place: **κἀγώ** and **τοὔνομα**. Those are not elisions — they are **crasis**,
and the mark is a **coronis**, which is legitimate. Chapter 2 ships both and
scores them in the Marking Recognition Drill under "Coronis", an answer it
lists separately from "Apostrophe".

My previous rule — "a breathing Greek cannot place is an elision mark" — would
have silently rewritten both. The rule is now positional, which separates them
cleanly:

| | mark position | verdict |
| --- | --- | --- |
| `δἰ` elision | on the word's **final** cluster | → apostrophe |
| `κἀγώ`, `τοὔνομα` coronis | **inside** the word, letters follow | untouched |
| `οὐ`, `εἰ`, `ῥ-` | initial vowel run / initial rho | untouched |

Verified: κἀγώ and τοὔνομα still grade correct, and still *require* their
coronis (`καγώ` is rejected).

**Negative controls**: with the apostrophe droppable again, `δι` passes for
`δι'` — the assertion bites. The build guard fires too if a displayed
punctuation mark has no key.

Capture: `5e-spec3-answered/41-elision-typed-as-u0027.png` — `δι' εμου` typed
entirely from the tiles, with the straight mark.

---

## Item 10 — the modal, fourth time. This one is the actual cause.

**Your suggestion was the fix.** "Can you not do 100vh minus the width of the
top and bottom bars to get the true viewport size?" — yes, and that is exactly
what was missing.

### What was wrong

Every previous attempt sized the modal to **the viewport**. But the app draws a
fixed top bar and a fixed bottom tab bar, and the modal overlay spans the whole
screen *underneath* them. Measured at 390×844 with your Hint open, before this
change:

```
top bar     0 .. 56
tab bar   790 .. 844
modal      20 .. 824     ← inside the viewport, under a bar at BOTH ends
```

20px of clearance at each end — which is why it looked so nearly right, and why
"inside the viewport" passed every test I wrote while the title sat behind the
header and Close sat behind the tab bar. I was asserting the wrong rectangle
three rounds running.

### The fix

`viewport.js` now measures the two bars' own rects — they are in the same
client-coordinate space a `position: fixed` overlay uses, so no arithmetic is
needed — and publishes `--chrome-top` / `--chrome-bottom`. The modal is capped
to the **gap between them**, with `env()` as the floor for routes that have no
bar (the table of contents has no tab bar). Re-measured on resize, rotation,
and DOM changes, so a bar appearing or disappearing is followed.

Measured after, at your device's real heights:

| Viewport | gap between bars | modal | Close |
| --- | --- | --- | --- |
| 390×844 iPhone 14 | 56 … 790 | 68 … 778 | ends 756 |
| 390×734 toolbars | 56 … 680 | 68 … 668 | ends 646 |
| 390×664 URL bar | 56 … 610 | 68 … 598 | ends 576 |
| 320×360 | 56 … 306 | 68 … 294 | ends 272 |

Both borders and the whole Close button, inside the gap, at rest, on every one.

### And a second defect found while fixing it

The pinned Close button was `position: sticky`, and Chrome left the sticky
block hanging **16px below the modal's own bottom edge until something
scrolled** — correct once moved, wrong at rest. Since "at rest" is the entire
requirement, sticky was the wrong tool. The modal is now a flex column: a
`.modal-scroll` region holds the content and `.modal-actions` is a real footer
with `flex: 0 0 auto`. It has no unstuck state to get wrong. That needed a
wrapper element in all five modal components, which is why they are in the
file list.

One consequence worth naming: at 320×360 the end-of-chapter dialog's four
stacked buttons are 234px tall in a 226px gap — no positioning can pin what
does not fit — so below 420px of height the action buttons compact to 40px.
That is a landscape-iPhone-SE case, not a portrait phone.

### The test now measures against the bars

`checkCloseReachable` asserts the modal's borders and Close against
`.topbar`'s bottom and `.bottom-bar`'s top, at rest, scrolling nothing.
**Negative control**: sizing to the viewport again produces **33 failures**,
e.g. `modal 20..340 inside gap 56..306`.

`ui-modals.mjs` reports the gap alongside the modal box in every line and
captures each surface at rest plus once with the content scrolled, to show the
footer holding still.

---

## Verification

| | |
| --- | --- |
| `ui-behavior.mjs` | **307/307** |
| `npm run verify` | green |
| `ui-modals.mjs` | 55/55 at rest, five viewports, every one clearing the bars |
| `ui-walk.mjs` | 105 stops × 2 widths, 0px overflow, no console errors |
| offline | 7/7 |
| stamper | idempotent; elision rule applied 14 strings on first run, 0 on second |

Images to look at: `5e-spec3-modals/iphone14-844--ch5-first-decl-hint-meanings--1-at-rest.png`
is your exact modal, title and both borders and Close all clear of the bars
with nothing scrolled.

**Still only your device can confirm** the `visualViewport` measurement itself.
But the bar-relative sizing does not depend on it: `--chrome-top` and
`--chrome-bottom` come from the bars' real rects on whatever device is running,
so even if the height estimate were off, the modal is positioned against the
things that were actually covering it.

---

# Addendum 4 — items 11 and 12 (2026-08-07)

| File | What |
| --- | --- |
| `src/app.css` | Item 11. The caret stops blinking while a drag is held. |
| `src/components/SpellerField.svelte` | Item 11. Publishes `.dragging` on the field. |
| `src/components/SpellVerseActivity.svelte` | Item 12. `Major Hint` → a `Show Answer` checkbox below the keyboard, no timer. |
| `src/lib/timing.js` | Item 12. `HINT_VISIBLE_MS` deleted — nothing races a clock any more. |
| `src/data/chapt-03/04/05.json`, `assemble_ch3/4/5.py` | Item 12. The declared control set matches what renders. |
| `buildout/DIVERGENCE-LOG.md` | D-30. |
| `scripts/ui-behavior.mjs` | Both items. **321 checks.** |

---

## Item 11 — the caret was invisible for the whole drag

Real bug with a precise cause, and it was mine from the previous round.

```css
.caret { animation: blink 1s step-start infinite; }
@keyframes blink { 50% { opacity: 0; } }
```

`step-start` jumps to a keyframe interval's END value at its START, so the
interval `[0%, 50%)` renders at the **50% value — opacity 0**. The caret is
therefore invisible for the first 500ms of every cycle.

And the caret is a `<span>` inside the `{#each}` whose position changes, so
**every `pointermove` destroys and re-creates it**, restarting the animation.
During a continuous drag it never got past its invisible half. It appeared
~500ms after the last movement — which is exactly "does not appear until I lift
my finger".

The fix is the Syllable Division divider's own idiom: while the drag is held,
the caret stops blinking and thickens slightly (2px → 3px), so it tracks the
finger solidly. The blink resumes on release.

**Negative control**: without the rule, the assertion reads
`{"dragging":true,"opacity":0,"animationName":"blink"}` mid-drag — the reported
symptom, measured.

On "the letters get bigger as feedback": nothing in the app does that
deliberately — there is no `:active` or scale rule on the clusters. It is most
likely iOS's own touch feedback on the element now that it owns the gesture. If
it is unwanted, say so and I will look properly.

---

## Item 12 — Show Answer on the scripture spellers

The whole-verse spellers had the app's only second reveal idiom: a `Major Hint`
**button** opening a panel **above** the keyboard that **withdrew itself after
7 seconds**. Every other speller and drill uses a `Show Answer` **checkbox**
whose panel appears **below** the keyboard and clears **when typing resumes**.

All three now use the shared idiom:

- `Major Hint` button — **gone**.
- `Show Answer` checkbox sits beside `With Accents`.
- The panel draws **below the keyboard**, carrying the reference, the verse and
  the translation (on this surface the "answer" is the whole verse).
- **No timer.** Asserted still open after 7.6s — past the life of the old panel.
- It clears the instant typing resumes, through the same `typingResumed()`
  gate the word spellers use. Caret moves deliberately do **not** clear it:
  repositioning is not typing, and that matches the word spellers.
- `Restart Exercise` resets it, as `Next` does elsewhere.

`HINT_VISIBLE_MS` is deleted from `timing.js`, with a note saying not to
reintroduce it. **Nothing in the app now makes a learner race a clock.**

Housekeeping that goes with it: the three chapters' `ui.buttons` still listed
`"Major Hint"` and their `ui.checkboxes` did not list `Show Answer`. Both are
corrected in the data **and in `assemble_ch3/4/5.py`**, so regenerating a
chapter cannot reintroduce a control the component does not render. (This is
the same class of stale-declaration problem I reported for `c1_ex_pronounce` in
§6.2 of the RESULTS — worth fixing here since I was in the file.)

**D-30** logs the change. D-11's substance stands: the verse is still available
at any time, which the original does not allow; only the mechanism changed.

Capture: `5e-spec3-answered/43-r12-answer-below-keyboard.png` — the panel under
the keyboard, with `δι'` in the straight apostrophe from item 9.

---

## Verification

| | |
| --- | --- |
| `ui-behavior.mjs` | **321/321** (was 307) |
| `npm run verify` | green |
| `ui-modals.mjs` | 55/55 at rest, clearing the bars |
| `ui-walk.mjs` | 105 stops × 2 widths, 0px overflow, no console errors |
| offline | 7/7 |

---

# Round index

Everything in this conversation, in the order it was reported and fixed:

| # | Item | Where |
| --- | --- | --- |
| 1 | Duplicated `First Declension—Masc` heading (em-dash broke the dedup key) | main |
| 2 | Modal scroll model, first attempt | main |
| 3 | `beforeGuess` clip silent on arrival (Svelte `$:` not yet evaluated in `init()`) | main |
| 4 | Elision mark rejected when typed as a breathing | main |
| 5 | Apostrophe key added to the shared keyboard (D-29) | addendum 1 |
| 6 | Hold-and-drag moves the caret; native selection suppressed | addendum 2 |
| 7 | Modal at rest, sized from `visualViewport` | addendum 2 |
| 8 | Straight apostrophe glyph on the key | addendum 2 |
| 9 | Elision mark is U+0027 app-wide and REQUIRED; coronis preserved | addendum 3 |
| 10 | Modal sized to the gap between the app's bars; flex footer | addendum 3 |
| 11 | Caret visible while dragging | addendum 4 |
| 12 | `Show Answer` replaces `Major Hint` on the verse spellers (D-30) | addendum 4 |

Behavior suite over the round: **240 → 321 checks**. Two divergences logged
(D-29, D-30). Three harness defects found and fixed along the way — an
assertion that passed via `scrollIntoViewIfNeeded`, one that measured the
viewport instead of the usable gap, and a same-hash navigation that silently
skipped captures. No commits, no pushes.
