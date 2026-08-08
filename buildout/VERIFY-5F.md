# VERIFY-5F.md — items needing Nathanael's DOSBox pass

Only items the automated harness cannot settle. Ordered by risk.

## Chapter 6

**1. Does ἐπί print with its smooth breathing?** The Three Case
Preposition panel (`0x006606`) and the ἐπί green popup (`0x00d424`)
both read `epi<` in the field — no breathing — while the live
Prepositions Chart reads `e]pi<`. The data ships verbatim, so the port
currently prints "επί" on those two pages. Zoom the DOSBox render of
both. If the breathing is there, this is a two-page spellfix under
TYPO POLICY A1.

No breathing mark on either of those, keep verbatim.

**2. Four Translation Drill answers.** The file stores no answer key,
and the chapter's own gloss set does not separate these four. Built as
shown; please confirm against the original.

| # | Phrase | Ref | Built as | Confirmed |
| --- | --- | --- | --- | --- |
| 26 | ἐπὶ τοῖς λόγοις | Mk 10:24 | at the words | at the words |
| 32 | καθ' ἡμέραν | Mat 26:55 | during a day | daily |
| 36 | δι' ἡμερῶν | Mk 2:1 | after days | after days |
| 37 | ἐπὶ τὸν υἱὸν τοῦ ἀνθρώπου | Mk 9:12 | about the son of man | about the son of man |

confirmed

**3. Elision clip order.** `f_elis1..6` are wired in page reading
order — δι' ἐμοῦ, διά, ἐμοῦ, μεθ' ἡμέρας, μετά, ἡμέρας. The script
proves six tokens on that page but not which phrase each names. A
listen-check settles it.

All confirmed

**4. Learn Vocabulary card count.** Chapter 6's flashcard is built with
16 case-split cards over 10 lemmas. Please confirm the original steps
through 16 and not 10.

Confirmed 16

## Chapter 7

**5. Fifteen Adjective Translation Drill answers.** Derived from
adjective position and agreement rather than from a stored key. Two are
confirmed by the rail walk's answered screens ("and for any good deed",
"for good works"); the other thirteen are not. A spot-check of five
would raise confidence a lot.

**6. Underlining on the teaching pages.** I extracted underline runs
for chapter 6's Prepositional Phrase page but not for chapter 7's
3-Uses, Attributive, Predicate or Substantive pages, which the rail
walk shows as underlined. The implementer's visual pass should catch
these; flagging so it is not mistaken for done.

Shouldn't all highlighting and data extraction be done on the web side by default? Last time you handed off underlining to the implementor it handed it right back to you. I gave you exact screenshots of these pages - you should be handling underlines in the data you are handing off unless I am misunderstanding something (if I am misunderstanding the implementor is too because it believes this should be handled web-side)

## Chapter 8

**7. The Personal Pronoun Case Drill's two-stage interaction.** Please
confirm: does a wrong click on the PERSON column end the attempt
immediately, or does the original let the learner continue to the case
grid and only then judge? The spec currently says a wrong click at
either stage ends the attempt.

No, both must be selected before it comprises an "answer" - the student can change their mind on person and click something different before they select case. Please imitate this.

**8. αὐτά in the Case Drill.** The chart prints αὐτά in both the neuter
nominative plural and the neuter accusative plural. Built as
Nominative Plural.

See attached screenshot. Both should be graded as correct

**9. Four unplaced clips.** `h_kai`, `h_kagw`, `h_gs1`, `h_exx2` are
single-word clips whose surfaces the extraction did not settle. Left
unwired. If you can spot where they fire, they can be added.

`h_kai` greek 'kai', I couldn't find a surface
`h_kagw` greek 'kagw', I couldn't find a surface
`h_gs1` greek 'mou', as seen in Learn Greek Personal Pronouns > First Person Paradigm (see screenshot)
`h_exx2` greek of Jn 1:42, as shown in Learn Greek Personal Pronouns > Examples (see screenshot - all three of these verses are clickable to play audio - please ensure they are)

**10. The blank reference.** One of the forty Personal Pronoun Spelling
Exercise items has no Scripture citation in the field. Confirm the
original also shows a blank there.

Confirmed, they (fem nom 3 pl)

## Standing

**11. Unused audio, all three chapters.** Per the standing ask
(VERIFY-5E #16): chapter 6 leaves 5 of 145 unwired, chapter 7 leaves 8
of 190, chapter 8 leaves `i_rm623b` (chapter 9's, shipped forward) plus
the four in item 9. Each was checked against the TBK dispatch tables
rather than assumed. Confirm none of them has a surface.
