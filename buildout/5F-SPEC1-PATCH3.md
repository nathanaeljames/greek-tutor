# 5F-SPEC1-PATCH3.md — final chapter 6-8 edits, and what now stands between us and a fourth round

Nothing committed, nothing pushed. This addresses the six items of
Nathanael's 2026-08-10 follow-up ("Fantastic round, here are some final
edits"), and then answers the question that matters more than any single
item: **what changed in the harnesses and the process so these regression
classes stay caught, and how certain that catch actually is** — stated
honestly, class by class, at the end.

## The six items

**1 — Labeled paradigm pages.** Both chapter-7 adjective stacks (Adjective
Paradigm, 2nd Adjective Paradigm) now carry a green **Singular / Plural**
band beneath the chart title and above the lemma — the same `subtitle`
mechanism (and the same `.pg-subtitle` green) the chapter-8 pronoun
reviews already use. The Adjective Case Drill's Hint shows the same
labels automatically (it renders the same block), so the PATCH2 change
that renamed its buttons to Plural/Singular is REVERSED: the buttons are
plain **More / Back** again and the page identity lives in the title, as
requested. The `hintSwitchLabels` mechanism stays in Paradigm.svelte but
nothing uses it (D-38 updated). The app-wide audit of every multi-chart
stack is at the bottom of this document — three stacks remain unlabeled,
listed **for review, deliberately not changed** (two of them already
identify their page another way).

**2 — The predicate-position clips.** The reported swap is real and went
deeper than the Hint. Ground truth was taken from the ORIGINAL program
itself: 7_ADJS.TBK was extracted from GreekTutor.iso and its
WordSelection handlers read directly. The Predicate Position page wires
exactly five hotspots: **pp1a** (ἀγαθὸς ὁ λόγος), **pp2a** (ὁ λόγος
ἀγαθός), **pp3** (the whole Lk 2:25 verse), and **pp4 twice** (both
displayed lines of Mat 23:28) — and wires `g_pp1`/`g_pp2` to NOTHING
(they sit in the page's preload table unused). Clip durations corroborate
(pp3 = 4.69s and pp4 = 4.49s are full verses; pp2a = 2.61s is a
three-word phrase). So, both in the Hint's second page AND on the Learn
Predicate Position page (same defect, same source):
- ἀγαθὸς ὁ λόγος → `chapt_7_g_pp1a` (was pp1)
- ὁ λόγος ἀγαθός → `chapt_7_g_pp2a` (was pp1a)
- Lk 2:25 verse → one tap, `chapt_7_g_pp3` (was pp2 + the invented
  per-line pp2a split)
- Mat 23:28 verse → one tap, `chapt_7_g_pp4` (was pp3 + pp4 split)

The `audio2` per-line mechanism PATCH2 invented for these two verses is
**removed from the renderer entirely** — it existed only to serve a
mis-keying, and the original's own wiring (both lines → the same
full-verse clip) is what one two-line tap target already does.

**3 — οὐ / οὐκ / οὐχ (D-31r2).** The number AND the word are now the same
link: both open the popup, the word is a `popup-link` rather than an
audio tap, and hearing the word is the popup title's job. This is the
third reading of this trigger; DIVERGENCE-LOG D-31 now carries the full
history (word-only → number-opens/word-speaks → both-open) and flags the
current reading as final unless Nathanael says otherwise.

**4 — λέγω and ἐγὼ λέγω tappable.** Both now play. Facts first, from the
ISO: the original wires no tap to either phrase on that page and ships
**no "ἐγὼ λέγω" phrase recording anywhere on the disc** — so a phrase
clip could not be honoured, only invented. Instead: **ἐγὼ** plays
`H_1NSE`, the original's own emphatic-nominative recording (made for
precisely this emphatic-ἐγώ teaching point), and **λέγω** plays the
chapter-1 vocabulary recording of the same word, *copied into the
chapter-8 pack* as `h_legw.m4a` (packs are per-directory; a cross-pack
reference would fail offline). In "ἐγὼ λέγω" the two words are two
adjacent taps. Recorded as D-39 so a future pass doesn't "fix" the
borrowed clips away.

**5 — The emphatic triads, on every surface they appear.** Four surfaces:
Learn First Person Paradigm (had it from PATCH2), Learn Second Person
Paradigm, Review 1st Person, Review 2nd Person. All four notes now make
each parenthesised form its own tap. First person plays the dedicated
emphatic clips (`h_1gse/1dse/1ase`); second person has no dedicated
recordings on the ISO (no H_2GSE/2DSE/2ASE exist), so σοῦ/σοί/σέ play the
enclitic recordings `h_2gs/2ds/2as` — same phonemes; the accent is
prosodic only (D-39).

**6 — Justified Back/More on Review Pronouns: 3rd Person.** Root cause is
an old acquaintance: **a second copy of the nav layout.**
ContentAudio.svelte's Review pager still had its own centred flex row
from before PATCH2 moved Paradigm to fixed slots — the exact "two
renderers for one thing" failure mode PATCH1 documented for
PronounParadigm. It now renders the identical `.pg-nav` fixed-slot row
(Back hard left, More hard right, empty slot keeps its cell). No centred
variant of this layout exists in the app any more, and the harness now
*measures* that instead of trusting it (P3.2 below).

## Files

| File | What |
| --- | --- |
| `src/components/ContentAudio.svelte` | Review pager → fixed-slot `.pg-nav` (item 6). |
| `src/components/RichContent.svelte` | `numberPopupRef` items: the Greek word renders as `.rc-word-popup`, a popup link (item 3); the `audio2` verse branch removed (item 2). |
| `src/data/chapt-07.json` | Subtitles on both adjective stacks; `hintSwitchLabels` removed; predicate clips re-keyed on both surfaces (items 1, 2). |
| `src/data/chapt-08.json` | noteTaps on Learn Second Person + both Review notes; Introduction `greekTaps` for λέγω/ἐγὼ (items 4, 5). |
| `public/audio/chapt_8/h_legw.m4a` + `audio-manifest.json` | The chapter-1 λέγω recording copied into the chapter-8 pack, manifest entry added (item 4). |
| `scripts/check-content-shapes.mjs` | New build guard: every audio id named anywhere in chapter data must exist in the audio manifest (negative-tested — see below). |
| `scripts/ui-behavior.mjs` | New §P3.1–P3.5: pinned clip mappings, nav geometry on every paging surface, per-page stack labels, the word-popup contract, tap counts with end-to-end file verification. Suite grew 587 → **629 checks**. |
| `buildout/DIVERGENCE-LOG.md` | D-31r2, D-38 amended (labels reversal + one nav layout), D-39 (borrowed clips). |
| `buildout/ONBOARD-SOL.md` | §7 addition: the audio-verification method (below). |
| `scripts/shots-patch3.mjs` | Evidence captures → `buildout/screenshots/5f-patch3/`. |

## How the harness and process changed, class by class — and how certain the catch is

These chapters were the project's worst regressions. That happened
because three defect classes had **no mechanical detector at all**:
text-arrangement fidelity, audio→word mapping, and layout uniformity
across duplicate renderers. Here is what now exists for each, what it
provably catches, and where its edge is.

**Class 1: paragraph/line structure (the "double spacing" family).**
`check-content-shapes.mjs` fails the build on a para ending mid-sentence
whose successor continues it lowercase — the exact authoring signature
that produced 17 broken pages. It found all 17 retroactively and passes
chapters 1–5 with zero false positives. *Certainty on recurrence:*
effectively certain for this signature; a NEW extraction that split lines
differently (e.g. at sentence boundaries) would evade it, which is why
the extraction-side rule (a paragraph is one block; the original's line
breaks are never block boundaries) is also written into ONBOARD-SOL §7.

**Class 2: audio.** Split into three sub-cases, because they have three
different answers:
- *An id that names no file* now fails the build (the manifest-existence
  guard). This was negative-tested: a planted `chapt_6_f_sm999` failed
  the build with the exact JSON path in the message, then was removed.
  Certainty: total, for every id anywhere in chapter data.
- *A regression of a mapping we have already verified* now fails
  ui-behavior P3.1: the scripture-drill and predicate-position pairs the
  last two rounds fixed are pinned id-by-id in assertions, and one tap
  per surface is driven end-to-end with the network log proving the tap
  fetched the pinned FILE (blob playback hides the src, so the fetch is
  the observable). Certainty: total for these particular bugs — they
  cannot silently return.
- *A wrong-but-existing clip we have NOT yet verified* is the honest
  gap: no build check can hear. What changed is the **method**: this
  round demonstrated that the original's TBK page scripts are readable
  ground truth — pycdlib pulls any .TBK off the ISO, and its
  WordSelection/alias tables state exactly which word plays which WAV
  (that is how item 2 was settled without ears, and it also proved
  `g_pp1`/`g_pp2` were never wired to anything). ONBOARD-SOL §7 now
  requires future chapter extractions to take word→clip wiring from the
  TBK handlers, never from filename sequence — filename-sequence
  assumption is what caused both item 17 and item 2. Certainty for
  *future* chapters: high if the process is followed, because the
  wiring is copied rather than guessed; for *already-shipped* chapters
  1–8, unverified mappings could still hide a wrong clip, and only
  listening (or a systematic TBK cross-check pass, which I'd recommend
  as its own small phase) retires that risk fully.

**Class 3: layout uniformity across duplicate renderers (the centred
Back/More).** Two changes. Structurally, the duplicate is gone —
ContentAudio uses the same `.pg-nav` markup. Mechanically, ui-behavior
P3.2 no longer trusts structure: it walks **seven paging surfaces**
(Learn stacks, the Review pager, chart hints, both modal hint pagers),
steps every page of each, and asserts Back's left edge and More's right
edge sit on the nav row's own edges within 2px. A third copy of this
layout drifting centred — or a CSS change re-centring the existing one —
fails with coordinates in the message. Certainty: total for any surface
that renders `.pg-nav`; a future surface that pages some *other* way
would need adding to the list, and the P3.2 comment says so.

**Class 4: unlabeled/indistinguishable chart pages.** ui-behavior P3.3
steps every labeled stack and asserts the on-screen green label changes
page-by-page to each chart's own subtitle. The build-time gap — a NEW
multi-chart stack authored with no subtitles at all — is deliberately
not a hard failure yet, because three shipped stacks are pending your
review (list below); once you rule on those, the natural next step is a
shapes-check rule that every `charts[]`/`paradigms[]` stack must label
its pages, at which point this class closes completely.

**Class 5: tap-target contracts (items 3/4/5's family).** P3.4 asserts
the word-and-number popup contract on the οὐ page; P3.5 asserts the
exact tap counts on all five new tap surfaces and end-to-end file
resolution on their first plays. These are pins on the specific
surfaces, not a general "every parenthesised Greek list is tappable"
rule — that generalisation isn't true (some parenthesised Greek is
deliberately inert ink, per the "(not ἐκ)" exception), so it cannot be
a blanket check.

**The meta-change** from all three rounds together, now standing policy
in ONBOARD-SOL §7: every defect class that reaches a feedback PDF gets,
in the same patch, (a) the fix, (b) the check that would have caught it,
and (c) a negative test of that check where feasible — this round's
manifest guard was deliberately broken and observed to fail before being
trusted. "The suite passed" is only worth what the suite asserts.

## Multi-chart stacks still unlabeled — for review (item 1's audit)

| Where | Pages | How a page identifies itself today | Suggested |
| --- | --- | --- | --- |
| ch4 Learn > Masculine Declension | λόγος, ἄνθρωπος | Each page's lemma line ("λόγος = word" / "ἄνθρωπος = man") | Arguably sufficient as-is; a green lemma-name band would be redundant with the lemma line directly below it |
| ch5 Learn > First Declension—Alpha | ὥρα, δόξα | Same — lemma line per page | Same as above |
| ch5 Learn > Definite Article Paradigm | Singular, Plural | **Nothing on the page itself** — only the named switch button (which names the *other* page) | The one real candidate: add green Singular/Plural subtitles exactly like the ch7 adjective stacks |

Say the word on the article paradigm (and/or the two noun stacks) and
it's a two-line data change each; the P3.3 harness check then extends to
them automatically.

## Verification

| | |
| --- | --- |
| `npm run verify` | PASS (incl. the new manifest guard across all 8 chapters) |
| Manifest guard negative test | Planted bogus id → build FAILED with exact path → removed |
| `ui-behavior.mjs` | **629/629** (587 existing + 42 new P3 checks) — superseded by the addendum run below |
| `ui-modals.mjs` | 85/85 |
| `ui-walk.mjs` (ch6–8) | 70 stops × 2 widths, clean |
| Evidence shots | `buildout/screenshots/5f-patch3/` — every item, including both pages of the titled case-drill hint and the justified Review pager |

---

## Addendum (2026-08-10, after user testing): the More/Back pair is CENTRED, and both buttons are always visible

Nathanael's revision after testing the justified layout: *"instead of
Back button justified left and More button justified right, I actually
want, for all occurrences, both buttons to be centered after all. The
Back and More buttons should always be visible even on first and last
screens with the invalid option greyed out ... they shouldn't disappear
which causes the buttons to jump around."*

**What changed.** All three `.pg-nav` render sites — Paradigm's chart
switch, ContentAudio's Review pager, and SelectActivity's modal hint
pager — now render BOTH buttons on every page of a stack, as a centred
pair (`justify-content: center`), with the invalid direction `disabled`
(the app's existing `.btn:disabled` grey, opacity 0.4) instead of
removed: Back greyed on the first page, More greyed on the last, and
neither button ever changes position or vanishes while paging. The
left/right slot markup and its CSS are gone. This supersedes both the
item-27 fixed-slot model and item 6's justified reading; DIVERGENCE-LOG
D-38 records the full sequence (wrapped inline row → fixed slots
left/right → centred always-visible pair) so the layout is not
re-litigated from an older document.

**Harness.** The two places that encoded the old model were rewritten
rather than patched: §2.8 now asserts both buttons visible on every ch8
Review page with the correct one disabled (its old assertions counted
buttons *disappearing*, which is now itself the defect); P3.2 now walks
all seven paging surfaces asserting, on every page: both buttons
present and visible, Back disabled exactly on page 1, More disabled
exactly on the last page, the pair's centre on the nav row's centre
within 2px, and the buttons' coordinates IDENTICAL page-to-page (the
"jumping around" Nathanael named is now a measured failure, not a
judgement call). One flake was found and fixed while re-running: the
whole-run audio request log used by P3.1/P3.5 attached its listener
mid-suite, so a clip first played by an earlier section escaped the
log; the listener now attaches before the first navigation.

**Addendum verification:** `npm run verify` PASS; `ui-behavior.mjs`
**683/683** (the P3.2 rewrite asserts per-page, so the count grew);
`ui-modals.mjs` 85/85; `ui-walk.mjs` ch6–8 clean; evidence shots in
`buildout/screenshots/5f-patch3/` re-captured under the final layout
(`i1-adj-paradigm-singular.png` shows page 1's greyed-out Back beside a
live More, centred; `i6-qr-third-p2-justified.png` shows the Review
pager's centred pair mid-stack).

---

## Second addendum (2026-08-10, device testing): item 4 reversed, and why every audio pack said "Update audio"

Two findings from Nathanael's on-device pass, one correction and one
explanation — and they turn out to be the same event.

**Item 4 reversed — λέγω / ἐγὼ λέγω are plain ink again.** Nathanael:
*"I misled you on one point ... legw and egw legw were never clickable,
and that is why you didn't find the audio to map."* The TBK evidence had
in fact said exactly this (no WordSelection handler on that page, no
phrase recording anywhere on the ISO), and this patch had noted it in
D-39 while building the borrowed-clip workaround anyway. Reverted in
full: the `greekTaps` removed from the Introduction paragraph, the
copied `h_legw.m4a` deleted from the chapter-8 pack, its manifest entry
removed, and ui-behavior P3.5's tap assertion replaced with its inverse
— a pin that both phrases render as plain ink with zero tap targets, so
a future pass cannot re-invent the taps. D-39 is rewritten around the
reversal (its second-person half — enclitic clips speaking for the
σοῦ/σοί/σέ emphatics — still stands). The lesson is now in the log
verbatim: when the original wires no handler and ships no clip, that IS
the original's answer; say so before building a workaround from
borrowed audio.

**Why every pack said "Update audio."** Pack versioning is one SHA-256
hash of the raw `audio-manifest.json` text (packs.js — "coarse
pack-versioning" is literal). Adding the single `chapt_8_h_legw` entry
changed that global hash, which flipped ALL eight downloaded packs to
"Update audio" and left chapter 8 at "179 of 180 saved" (the device's
pack predated the added file). **No audio bytes were touched, moved or
corrupted at any point** — one line in the index changed and the coarse
versioning did the rest. The revert restores the manifest
**byte-identical** to its pre-PATCH3 state (SHA-256 verified equal to
the committed 766dcc3 blob), so once this deploys, the hash the app
computes matches the one the device's packs were downloaded under and
the prompts disappear on their own. If the partial chapter-8 re-download
was resumed in the meantime, the fetched extra file sits as a harmless
orphan row in the audio store; nothing reads it.

**Process consequence**, written into ONBOARD-SOL §8 as a named footgun:
the audio corpus is complete and frozen, and the manifest must be
treated as frozen with it — ANY manifest edit is a full "Update audio"
prompt on every device, not a per-pack delta. A future change that
genuinely must touch it should say so in the handoff, in those terms.

**Verification of this addendum:** `npm run verify` PASS (shapes guard
confirms no dangling `chapt_8_h_legw` reference survives);
`ui-behavior.mjs` **683/683** including the new plain-ink pin;
`ui-walk.mjs` chapter 8 clean; manifest hash equality with the
pre-PATCH3 commit verified directly; the restored page captured as
`i4-intro-plain-ink-restored.png` (the superseded tap screenshot is
removed so the evidence folder cannot mislead a later reviewer).
