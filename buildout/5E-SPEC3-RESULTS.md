# 5E-SPEC3-RESULTS.md — cohort 5E round 3

Base commit `8bc8f30` ("saving revisions before 5e spec 3"), which already
carried the reissued `DRILL-BEHAVIOR-RULES.md`, `DRILL-BEHAVIOR-LEDGER.csv`,
`apply-behavior-matrix.py` and the restamped `chapt-01..05.json`. Nothing
committed, nothing pushed. Working tree: 11 modified files, 2 new screenshot
directories, 2 new deliverables.

---

## 1. Six classes → four (§1)

`spellUntilRight` and `manualCorrectAutoIncorrect` are gone. Every correct
answer in the app now auto-advances.

**`src/lib/timing.js` is where the collapse happened, and it is nearly the
whole change.** `resolveAdvance` returns behavior FLAGS and no component
compares a class name, so five of the six scored surfaces needed no logic edit
at all — only their comments were wrong. The three edits that mattered:

| Edit | Effect |
| --- | --- |
| `autoOnCorrect: true` (a constant, not an expression) | rule B1a becomes structural: no class can opt out, and breaking it would be one visible line |
| `oneAttempt: advanceClass !== 'retryUntilRight'` | one "until right" class instead of two |
| `waitsForNext(advance, wasCorrect)` returns `false` whenever `wasCorrect` | one waiting outcome survives in the whole app: `manualOnIncorrect` on a WRONG answer |

`autoOnCorrect` is deliberately a constant rather than a per-class expression.
§B1a says the correct path is not a class property; encoding it as one would
have left the next class free to reintroduce the bug this round exists to
remove.

**The one surface that needed real code: `SpellActivity.svelte`.** It had no
scheduled advance at all — 5E-SPEC2 removed it when the speller became
`spellUntilRight`. It is back, and it is the token-guarded
`Promise.all([minimumTimer, playThrough(clip)])` the other surfaces use, so a
correct spelling waits `max(2000ms, clip)` and the next word never arrives on
top of the clip speaking the previous one. Cancelled by Previous, by Next and
on unmount.

**Withdrawn names are normalized at runtime and REFUSED at build time.**
`timing.js` maps `spellUntilRight → retryUntilRight` and
`manualCorrectAutoIncorrect → autoBoth` so a stale cached data file behaves
correctly rather than falling into an unknown branch; `check:shapes` and the
ledger stamper both hard-fail on either name and name the migration:

```
FAIL: chapt-01.json.exercise[7].answerPolicy.advanceClass: "spellUntilRight"
was WITHDRAWN in 5E-SPEC3 §1 — it existed only to wait for Next on a correct
answer, which rule B1a forbids. Restamp this activity as "retryUntilRight".
```

That combination is on purpose: a silently-working withdrawn name is exactly
how the six-class table survived a round without anyone noticing.

### Acceptance, measured through the UI

One class per chapter, plus both restamped chapter-2 exercises, plus every
chapter's word speller. Every figure below is a real transition timed in a
real browser; **no assertion encodes an answer key** (see §5.1).

| Surface | Class | Correct answer advanced at | Wait message |
| --- | --- | --- | --- |
| ch1 Vocabulary: English to Greek | autoBoth | 2022 ms | none |
| ch2 Vocabulary: Greek to English | autoBoth | 2054 ms | none |
| ch2 Marking Recognition | manualOnIncorrect | 2029 ms | none |
| ch2 Syllable Counting | retryUntilRight | 2027 ms | none |
| ch2 **Accent Mark Placement** | autoBoth (was manualCorrectAutoIncorrect) | 2092 ms | none |
| ch2 **Syllable Division** | autoBoth (was manualCorrectAutoIncorrect) | 2079 ms | none |
| ch3 Scripture Memory | autoBoth | 2041 ms | none |
| ch3 Verb Translating | manualOnIncorrect | 2032 ms | none |
| ch4 Scripture Memory | autoBoth | 2018 ms | none |
| ch4 Greek Noun | manualOnIncorrect | 2033 ms | none |
| ch5 Vocabulary: English to Greek | autoBoth | 2044 ms | none |
| ch5 Definite Article | manualOnIncorrect | 2022 ms | none |
| ch1 `c1_ex_speller` | retryUntilRight (was spellUntilRight) | 2067 ms | none |
| ch2 `c2_ex_speller` | retryUntilRight (was spellUntilRight) | 2049 ms | none |
| ch3 `c3_ex_verb_speller` | retryUntilRight (was spellUntilRight) | 2048 ms | none |
| ch4 `c4_ex_noun_speller` | retryUntilRight (was spellUntilRight) | 2040 ms | none |
| ch5 `c5_ex_noun_speller` | retryUntilRight (was spellUntilRight) | 2071 ms | none |

`max(2000, clip)` holds on the new speller path too. With a 3-second clip
seeded into the app's own audio store:

```
5E §6.2 afterGuess (speller): the next word waits for a clip longer than 2000ms
  advanced 3161ms after the spelling; clip ran 3059ms
5E §6.3 Next during a speller's afterGuess clip stops it and advances at once
  playing 1 -> 0 in 189ms
```

### B1b — the three whole-verse spellers

They carry `retryUntilRight` like every other speller and the auto-advance is a
no-op, exactly as §1 says. All three mark correct, play the verse, and stand
still; none drives the sequential rail; none claims to be waiting. The
"Click Next to continue" line 5E-SPEC2 put on this surface is gone with the
class that justified it.

### The wrong path is unchanged

`manualOnIncorrect` on a wrong answer is now the app's **only** waiting
outcome, and it still reveals, locks and says so. `retryUntilRight` on a wrong
answer still reveals nothing and stays open. `autoBoth` on a wrong answer still
reveals and advances on 4000 ms (ch2 Accent Placement measured at 4061 ms).

---

## 2. §5 — no speller reveals the spelling

Asserted on **all twelve**, not a sample. Each is given `ζζζ`, which is wrong
in every exercise in the app:

```
5E §5 chapt_1 c1_ex_speller             revealed 0, typed "ζζζ" -> "ζζζ"
5E §5 chapt_2 c2_ex_speller             revealed 0, typed "ζζζ" -> "ζζζ"
5E §5 chapt_3 c3_ex_verb_speller        revealed 0, typed "ζζζ" -> "ζζζ"
5E §5 chapt_3 c3_ex_vocab_speller       revealed 0, typed "ζζζ" -> "ζζζ"
5E §5 chapt_4 c4_ex_noun_speller        revealed 0, typed "ζζζ" -> "ζζζ"
5E §5 chapt_4 c4_ex_vocab_speller       revealed 0, typed "ζζζ" -> "ζζζ"
5E §5 chapt_5 c5_ex_noun_speller        revealed 0, typed "ζζζ" -> "ζζζ"
5E §5 chapt_5 c5_ex_article_speller     revealed 0, typed "ζζζ" -> "ζζζ"
5E §5 chapt_5 c5_ex_vocab_speller       revealed 0, typed "ζζζ" -> "ζζζ"
```

**Your reading was already true in the tree, and I did not have to change
anything to satisfy it.** 5E-SPEC2 §4.4 had already made every speller
non-revealing; what §5 changes is the RULE (C0a) and the class name, not the
behavior. The nine spellers §5 describes as "currently revealing" reveal
nothing in this build and revealed nothing in the last one. The two things §5
gives as evidence — that `c1_ex_speller` and `c2_ex_speller` already behave
that way, and that revealing would end the exercise — are both right; the tree
was not actually inconsistent, all twelve already agreed.

### One thing §5 does not cover, reported rather than changed

The three whole-verse spellers name the ONE word you missed
("The word you missed was: λέγει"). That is **D-13**, a divergence ratified in
5D: the original prints a bare index ("The word you missed was: 2") and telling
a learner to go and count is worse than naming it. It is a partial reveal, and
under a literal reading of C0a ("a wrong answer reveals nothing") it is a
violation.

I did not change it — §8 puts D-13 out of scope and removing it would leave the
verse speller with no diagnostic at all. It is now asserted explicitly rather
than waved past, so the harness states the exception out loud:

```
5E §5 chapt_3 c3_ex_scripture_speller: a wrong answer names one missed word
(D-13) and reveals no more — named ["λέγει"] of 14 verse words, other reveals 0
5E §5 chapt_4 ... named ["οὐδεὶς"] of 9 verse words, other reveals 0
5E §5 chapt_5 ... named ["πάντες"] of 9 verse words, other reveals 0
```

**Your call**: leave D-13, or reduce the verse spellers to a bare correct /
incorrect. I recommend leaving it.

---

## 3. §2 — 5E-SPEC2 §5.6 withdrawn

No option-grid layout changed. The 29-grid census and the permanent guard both
stay and both still pass:

```
5E §6.8 four-up at 320px is confined to the named single-glyph/number grids
  c1_ex_letter_to_name, c1_ex_name_to_letter, c1_ex_translit,
  c1_ex_transcribe, c2_drill_syllable_counting
5E §6.8 no option grid is denser at 320px than at 768px — none
```

All ten vocabulary grids measure 2-up at 320px and 4-up at 768px, all four
paradigm grids stay 2-up at both widths (D-26), and the two declared layouts
stay single-column. That is the residue §2 asks to keep.

---

## 4. §3 / §7 — the accent-rule underlines

Kept data-side, as §3 directs. **The stamper shipped with this spec is a
material change from my round-2 copy, and §7 asked me to diff before
overwriting, so here is the diff.**

| | round-2 copy (mine) | shipped with 5E-SPEC3 | kept |
| --- | --- | --- | --- |
| phrase | `Nouns are retentive.` — sentence, full stop INSIDE the underline | `Nouns are retentive` — phrase, full stop outside | **shipped** |
| scope | hint content only | every displayed string | **shipped** |
| strings marked | 4 | **10** | **shipped** |

The shipped scope is the deliberate one: §7 says "ten strings across chapter 2"
and the shipped script produces exactly ten. My narrower hint-only scoping was
the divergence, and it is discarded. The ten are the Learn topic's rule list
(2), the two expander labels (2), both drill/exercise hint copies (4), and the
Quick Review copy (2).

The expander labels were the one that could have failed loudly — a label that
did not honour `[[u]]` would print the tag characters on screen. It does honour
them; verified in the image as well as the assertion:

```
5E §5.3 ch2 Learn Accent Rules: the expander labels underline the rule name
and print no markup — ["Rule 1: Nouns are retentive", "Rule 2: Verbs are
recessive", "Rule 3: Long Ultima, no antepenult accent", ...]
```

Five surfaces are now asserted where 5E-SPEC2 asserted two.

### What I merged BACK onto the shipped script

The reissued copy had lost four things my round-2 copy carried. None of them
touches the underline rule or the four-class validator; all four are restored,
so §8's "everything else stands as shipped" actually holds:

1. **UTF-8 stdout.** Without it the script does its work and then *crashes* on
   Windows printing what it did — the report echoes Greek and the console is
   cp1252. This is a real crash, not a nicety.
2. **The app-wide typographic sweep.** The shipped copy walks only
   `chapt-NN.json`. D2 is an app-wide rule and the last displayed double
   hyphens in the tree were in `intro.json` ("WELCOME --", "-- ENJOY") and two
   chapter-1 lexicon glosses — files that loop never opens. Without the sweep,
   `check:shapes` would fail on a `--` that no tool could fix.
3. **`indent_of`.** `intro.json` is written at indent 2 and the chapter files at
   indent 1; rewriting one string without it reflows 120 lines.
4. **The spaced `--` pattern and the provenance skip** (`_`-prefixed keys plus
   `audioInventory`), so the Introduction's spaced form is caught and pipeline
   notes are not rewritten.

### One fix of my own

The script wrote in Python text mode, so on Windows every run translated LF to
CRLF and rewrote all five chapter files even when nothing changed — its own
docstring promises "running it twice changes nothing the second time". Writing
with `newline=''` makes that literally true. **Verified: the data files are
byte-identical to `8bc8f30` after this round, and no data file is in the
diff.**

---

## 5. §4 — the harness footgun that destroyed a parallel run

`scripts/ui-walk.mjs`:

- `--out` now defaults to `buildout/screenshots/walk-<YYYYMMDD-HHMMSS>`, which
  cannot collide with anything;
- it **refuses** to write into a directory that already has files in it, and
  the check runs *before the browser launches*, so a refusal costs nothing and
  cannot half-write a corpus;
- `--force` is the explicit override, and it says so in the log line.

Verified against the very directory it destroyed last round:

```
$ node scripts/ui-walk.mjs --out=buildout/screenshots/5e-spec1-sol
REFUSING to write into buildout/screenshots/5e-spec1-sol: it already contains 3 entries.
  Those may be another run's committed evidence. Pass a fresh --out=DIR,
  omit --out to use the timestamped default (buildout/screenshots/walk-20260806-131243),
  or pass --force if overwriting this directory is genuinely what you want.
exit code: 2
```

Sol's captures were untouched.

### 5.1 A harness change worth naming

The §1 acceptance driver **learns the correct answer from the app** rather than
reading one out of the data. A wrong tap on a one-attempt class reveals the
answer, so the driver spends one pass learning a prompt and a later pass
measuring it. Nothing in the §1 suite encodes what the right answer is, which
means it cannot pass by agreeing with a data file that is itself wrong.

Two real ambiguities in the delivered data are handled by evidence rather than
by an answer key, and both cost me a false failure before I understood them:

- **Two options with the same label.** Nominative and vocative plural are
  homographs in every paradigm, so more than one tile lights up. That reveal is
  discarded rather than guessed at.
- **Two items with the same prompt and different answers.** `c4_drill_greek_noun`
  ships "Brother will betray brother" (Mat 10:21) twice. A learned answer is
  wrong on the second one — which shows up as `bad` feedback on the measurement
  pass, so the prompt is struck off and the walk continues instead of reporting
  a broken advance. My first draft reported exactly that false failure.

---

## 6. Report, do not act

### 6.1 Is `attemptsPerItem: "retry"` doing anything?

**No. The class alone drives behavior, and the field is dead weight on every
shipped activity.**

`attemptsPerItem` is read in exactly one place in `src/`:

```js
// src/lib/timing.js, classOf()
function classOf(policy) {
  const declared = policy.advanceClass;
  if (declared) return LEGACY_CLASSES[declared] || declared;   // ← always taken
  if (policy.attemptsPerItem === 1) { ... }
  return 'retryUntilRight';
}
```

The field is consulted only on the FALLBACK branch, and that branch is
unreachable for delivered data: all 43 scored activities carry an explicit
`advanceClass`. Two further points:

- The string `"retry"` is never compared to anything. `classOf` returns
  `retryUntilRight` for any value that is not `1`, so `"retry"`, `"many"` and a
  missing field are indistinguishable. Only `attemptsPerItem: 1` has any
  discriminating power, and only when `advanceClass` is absent.
- A correction to §6.1's count: the stamp sets `"retry"` on **13**
  `retryUntilRight` activities, not fourteen — the twelve spellers plus
  `c2_drill_syllable_counting`. (Fourteen is the count of SPELLING exercises in
  the ledger, twelve of which are spellers; the other two are the chapter-2
  exercises, which are now `autoBoth`.)

**Recommendation for the next stamp:** remove `attemptsPerItem` entirely — but
remove the fallback branch in `classOf` with it, or an unstamped future chapter
would silently become `retryUntilRight` instead of failing. The safe order is:
make `answerPolicy` without `advanceClass` a `check:shapes` failure first, then
delete the field and the fallback together. I have not done any of this.

### 6.2 `c1_ex_pronounce` button set

**Previous, Next Letter and Check Answer all render. Nothing is missing.**

The data lists `ui.buttons: ["Next Letter", "Check Answer"]`, but the
`selfCheckStepper` mode does not read `ui.buttons` — it hard-codes its three
controls in `ContentAudio.svelte:324-328` and reads only `ui.hint` from that
object. Previous is present and disabled at the first letter; Check Answer is
disabled until a letter is showing. Confirmed in the walk capture
(`5e-spec3/320/chapt_1/c1_ex_pronounce.png`).

So the ledger's `TARGET Prev/Next? = yes` is **satisfied on screen**, and the
stamper's warning —

```
ledger wants Previous/Next but data has none: c1_ex_pronounce
```

— is a false positive: it inspects `ui.buttons` on a mode that ignores it. The
ledger's own disposition column says `KEEP AS IS`, which agrees with what
renders. I changed nothing. If you want the warning to stop, the fix is in the
stamper's check, not in the data.

---

## 7. One thing I did that the spec did not ask for

The reissued `DRILL-BEHAVIOR-RULES.md` points at **DIVERGENCE-LOG D-28** twice
(§B1a and the collapse note) and the log stopped at D-27. I wrote D-28, since a
canonical document referencing an entry that does not exist is the same class of
problem this round is fixing. It records the collapse, names it as a deliberate
departure from observed behavior rather than a fidelity claim, and notes B1b as
a no-op rather than an exception. Revert it if you would rather write it
yourself.

---

## 8. Verification

| Harness | Result |
| --- | --- |
| `npm run check:shapes` | PASS — every advanceClass is one of the **four** |
| `npm run build` | 87 modules, 27 precache entries (691.26 KiB); one pre-existing A11y warning at `DivideActivity.svelte:368` |
| `npm run check:lazy-chunk` | PASS — five chapter + five lexicon chunks, chapter data out of `index-*.js` |
| `npm run verify` | green end to end |
| `apply-behavior-matrix.py` | 50 activities from 50 confirmed rows; 28 TO FILL skipped; **byte-idempotent** |
| `ui-behavior.mjs` | **240/240**, three consecutive clean runs |
| `ui-walk.mjs` | 105 stops × 2 widths, 0 px horizontal overflow, no console errors, all expanders and chart states opened |
| offline (throwaway, not committed) | **7/7** — all five chapters render with the network cut, a hard refresh on an activity route survives, and a correct spelling with **no downloaded clip** advances at 2078 ms rather than hanging on a fetch that can never resolve |

The behavior suite grew from 203 checks to 240.

### Visual verification of the states that had never been photographed

You asked for everything not verified last round. The gap was structural:
`ui-walk.mjs` screenshots a rail stop as it ARRIVES, so no image in any corpus
had ever shown a drill *after an answer* — which is precisely where every
behavior change of cohort 5E lives.

`ui-behavior.mjs` now takes `--shots=DIR` and photographs the answered state at
the moment each assertion reads it. 37 captures in
`buildout/screenshots/5e-spec3-answered/`, covering every correct-path advance
in the table above, both chapter-2 exercises on both paths, the one remaining
waiting outcome, all three solved verses, and all twelve spellers' wrong-answer
state.

I looked at them. Worth naming:

- `06-speller-correct-auto-advancing-.png` — "Perfect!", **no** "Click Next to
  continue" line, input locked while it moves.
- `03-ch2-accent-placement-correct.png` — correct placement, answer shown, no
  wait line, on its way to item 2 of 25.
- `24-b1b-chapt-4-solved-verse-stands-still.png` — "Congratulations", standing
  still, no wait line, rail untouched.
- `01-manualonincorrect-incorrect-...png` — the app's only surviving waiting
  outcome, still saying so.
- `5e-spec3/320/chapt_2/c2_learn_accents--topic4.png` — the ten-string underline
  scope, rendering correctly in both the rule list and the expander labels,
  full stop outside the underline, no `[[u]]` leakage.

The full 474-shot arrival walk is in `buildout/screenshots/5e-spec3/`.

---

## 9. What is NOT in this round

Per §8: audio timing, the §3 lifecycle fixes, the §4 speller validation
changes, the modal work, the hanging indents and the harness coverage all stand
as 5E-SPEC2 shipped them. The six→four collapse is the only behavioral change.

No data file changed. No commit, no push.
