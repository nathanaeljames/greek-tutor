# VERIFY-5I-ADDENDUM.md — pipeline absorption round

Appended to `VERIFY-5I.md` by the chat pipeline (Fable), 2026-08-29, after
absorbing round 21's hand repairs back into the assemblers.

**Section F of VERIFY-5I is now discharged.** It closed with: *"the
pipeline has to absorb them or they are lost at the next regeneration."*
It has. All four assemblers now regenerate their chapters from the TBKs
and reproduce the committed files, so nothing in this round is one
`assemble_chNN.py` run away from vanishing.

Three of round 21's repairs were re-examined against the source and the
rail walks, and all three came out differently. Nathanael approved the
pipeline's readings on 2026-08-29. **Those three are the only content
changes in this addendum and they are what section G below asks you to
check.**

---

## G. THE PIPELINE'S THREE CORRECTIONS (approved, needs a look)

- [ ] **G1. ch14's augment is in PARENTHESES, not quotes.** The Form topic
      should read *"It is preceded by an **(ε)** augment"*. Round 21
      normalised it to `"ε"` to match chapter 15 — but chapter 15's screen
      genuinely uses quotes and chapter 14's genuinely uses parentheses,
      and the TBK and ch14railwalk.pdf p3 both show it. Flattening the two
      lost a real difference between the screens.
      *Route:* ch14 → Learn → Learn Second Aorist Indicative Verbs →
      topic 2 (Form), first paragraph.

- [ ] **G2. ch15's Translation Drill item 29 (Mar 10:5) now has its second
      line back.** The prompt should read over two lines:
      *Πρὸς τὴν σκληροκαρδίαν ὑμῶν ἔγραψεν ὑμῖν* / *τὴν ἐντολὴν ταύτην*.
      Round 21 moved these continuation lines by hand and this one fell off
      the end. The positional-pool fix recovers it, and the first line ends
      mid-clause without it.
      *Route:* ch15 → Drill → First Aorist Indicative Translation Drill,
      press Next to the last item.

- [ ] **G3. ch16's Translation Drill item 2 (Jn 8:39) likewise.** Two
      lines: *Ἀπεκρίθησαν καὶ εἶπαν αὐτῷ, Ὁ πατὴρ ἡμῶν* / *Ἀβραάμ ἐστιν*.
      Same cause, same fix.
      *Route:* ch16 → Drill → Passive Verbs Translation Drill, item 2.

If any of the three looks wrong on the device, say so — each is a single
deletable block in its assembler and reverting is one line.

---

## H. CORRECTED IN PASSING — no device check needed

- **The manifest counts in D are reconciled.** VERIFY-5I noted that
  chapters 13 and 14 declared 158 and 144 WAVs against a manifest holding
  159 and 145. The manifest was right: it matches the ISO packs exactly,
  159 / 145 / 160 / 159, with no entry on either side that the other
  lacks. The chapter notes carried an off-by-one from a line count that
  missed a file without a trailing newline. Both notes corrected. **The
  unwired lists in section D are unaffected and still stand.**

- **ch13's `_audioVerify` note asked for a listen on "m_pas".** As
  VERIFY-5I item B1 spotted, no such clip exists; the note now names
  `m_voc5` explicitly and says so.

---

## I. WHAT THE PIPELINE FIXED, AND WHY IT WILL NOT RECUR

Recorded so the round has an honest history. Both were pipeline bugs of
mine, not implementer errors.

**The Greek-format vote was voting against itself.** `vote_greek_fmts`
counted every diacritic-free run as English. Chapter 14's Greek format
carries 35 accented runs and 28 that are single letters, `--` separators
and rule lines like `a + e = h` — all Greek *notation*, all counted as
English, which held the format below the majority bar. That is why `sa`,
`qh`, `lu`, `diwk` and `graf` shipped as roman letters. The vote is now
three-way: a run votes English only on positive evidence, two or more
whole English words; everything else abstains. A second rule catches
chapter 15's suffixed sigma, whose format appears *only* as the run `sa`.

**`tpool` was stripping leading blanks from positional pools.** That is
the whole of the second-prompt-line defect. Those pools are positional —
line *i* is item *i*, blank where an item has no continuation — and the
shift was always *leading blanks minus one*: chapter 13 had two, 14 had
three, 16 had two, 15 had one, giving +1, +2, +2 and 0. Exactly the
pattern round 21 measured. A new `positional_pool` helper indexes
directly and never strips.

The swallowed panels were a third face of the same problem:
`para_blocks` merges consecutive non-blank lines, so a chart following
its lead with no blank between collapses into one block. A new
`lead_para` cuts at a named sentence marker instead.

`scripts/scan_garble.py` adopts both of round 21's scanners as a
**human-read Stage 8 report, never a gate** — it exits 0 always, exactly
as the round-21 BUILD document warned it must. Current state across all
four chapters: **zero swallowed panels**, six garble candidates, all of
them legitimate English (`Augment + Verb stem`, `Aorist Augments =
Imperfect Augments`).

Each assembler now **diffs its own output against the committed chapter
and refuses to write if they differ**, naming the exact JSON paths.
Chapters 6, 7 and 8 are blocked outright because their scripts *cannot*
reproduce their committed state; blocking 13–16 would only force hand
edits forever, so they get the self-check instead. It cannot silently
revert a repair and it does not obstruct a legitimate regeneration.

---

## J. STILL YOURS TO RULE ON, unchanged

VERIFY-5I item **I-1** — the πᾶς chart stacked rather than six-across —
is untouched by any of this and still needs your decision. Same for
I-2 through I-6.
