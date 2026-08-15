# VERIFY-5G.md — the items only Nathanael can settle

Chapters 9 and 10, after 5G-SPEC1 + 5G-XPATCH1. Everything mechanical is
already pinned: 856 behaviour assertions, a 219-stop rail walk at two
widths with every popup and Hint opened, 115 modal states over five
device heights, an offline walk of both chapters, and the page-by-page
comparison against both rail walks (`5G-VISUAL-CHECKLIST.md`). Nothing
that any of those can answer is in this file.

Twelve items. Each states what the port does NOW, so a verdict has
something to land against.

---

## Audio listens (a, b, c, i)

Files are on the ISO and in the app's pack; both paths are given.

- [X] **(a) `chapt_9_i_mpar` — does the Passive chart have its own recording?**
  Port: the ch9 **Present Passive** paradigm's Say Paradigm plays
  `i_mpar`; the **Middle** paradigm plays `i_midpar`. `i_mpar` is
  referenced NOWHERE in `9_MIDDLE.TBK` — it was wired here by
  elimination, so it may be a duplicate of the middle recording, a
  distinct passive one, or something else entirely.
  Listen to `CHAPT_9/I_MPAR.WAV` (`/audio/chapt_9/i_mpar.m4a`) and to
  `I_MIDPAR.WAV` beside it, and run the original's Passive chart's Say
  Paradigm button.
  → **Same clip / distinct passive clip / neither:** ______________
  Notes: Same clip, he recorded saying identical words twice. Port works fine as wired.

- [X] **(b) `chapt_9_i_voc11` — is it διέρχομαι?**
  Port: it backs the fourth Compound Verbs row, διέρχομαι "I go
  through". Wired by elimination — it is a live dispatch key with no
  surviving surface, and the other ten `i_voc*` clips are the chapter's
  vocabulary.
  `CHAPT_9/I_VOC11.WAV` (`/audio/chapt_9/i_voc11.m4a`).
  → **PASS / FAIL (says: ______________)**
  Notes: Yes, διέρχομαι, and the port wires it correctly

- [X] **(c) `chapt_10_l_eimi` — a standalone εἰμί?**
  Port: the "Future of εἰμί" topic TITLE taps its Greek word to this
  clip. If it is a sentence, a paradigm recitation or the future forms
  rather than the bare word, the tap is wrong and the title should go
  back to plain ink.
  `CHAPT_10/L_EIMI.WAV` (`/audio/chapt_10/l_eimi.m4a`).
  → **PASS / FAIL (says: ______________)**
  Notes: Yes, a standalone εἰμί, and the port wires it correctly

- [X] **(i) `j_TvD2` and `j_palp` — genuinely orphaned?**
  Port: neither is referenced by any chapter, by design. `j_TvD2` is
  the gap in the translation drill's shifted table (item N plays
  `j_TvD(N+1)`); `j_palp` has no surface at all. Both ship in the pack
  and are downloaded; nothing plays them.
  `CHAPT_10/J_TVD2.WAV`, `CHAPT_10/J_PALP.WAV`.
  → **Both orphaned / one of them belongs somewhere:** ______________
  Notes: j_palp is luomen, as seen in Future Indicative Parsing Drill (already wired correctly so may be a duplicate); j_TvD2 sppears to be a Greek phrase or verse that never made it into the Translation Drill - don't worry about it

---

## DOSBox observations (d, g, h, j, k)

- [X] **(d) "Repeat This Exercise" — does the control exist at all?**
  **Start here, not with the semantics.** Neither rail-walk panel draws
  it: rw9 p13-2 and rw10 p14-2 both show exactly ONE checkbox on the
  Scripture Memory Spelling Exercise, "With Accents". Both captures are
  page ONE of a paged entry surface, so it may be on page two — or the
  label may sit in the TBK page record without ever being drawn.
  Port: ships the checkbox on both chapters' SM spellers, default OFF.
  When it is ON, a correct Check Answer plays the whole verse and, once
  the clip has actually finished, clears the slate for another pass;
  completion is recorded on the first success and is not affected. That
  behaviour is EXTRAPOLATED (D-42) — it was never observed.
  1. Open the ch9 SM Spelling Exercise in DOSBox and click Next Page.
     → **Checkbox present on page 1 / page 2 / nowhere:** ____________
  2. If it is nowhere: the answer retires D-42 and the control comes
     out of the port. Stop here.
  3. If it is there: tick it, spell the verse correctly, and describe
     what happens — does the verse replay, does the typed text clear,
     does anything about the score or the page counter change?
  → ______________________________________________
  Notes: It is there. In the original you get exactly one chance to 'Check Answer', then 'Major Hint' and 'Pronounce' buttons are replaced with 'Repeat This Exercise' button which clears the entire screen and starts over. I do not want to copy this behavior. As I have specified previously, making a wrong guess should NOT clear the slate but allow guess until right. I don't want to retype the whole verse which is frankly a bitch on any keyboard because I missed one accent mark.

- [X] **(g) Present-tense εἰμί in the ch10 Parsing Drill — which VOICE does the original accept?**
  Port: derives voice from the form — the four present items (εἰμί,
  εἶ, ἐστέ, εἰσί) parse **Active**; the six future ones (ἔσομαι, ἔσῃ,
  ἔσται, ἐσόμεθα, ἔσεσθε, ἔσονται) parse **Middle**, since the future
  of εἰμί is deponent. The drill offers only Active and Middle, so
  present εἰμί has to be one of them.
  Parse one present item (e.g. εἰμί) in DOSBox and record what it
  accepts.
  → **Active / Middle / accepts either:** ______________
  Notes: Only Present Active Singular is accepted for εἰμί

- [X] **(h) Does the ch10 Parsing Drill's Hint cycle past the two future charts?**
  Port: Hint opens ONE popup holding Future Active over Future Middle,
  stacked under a single Close — which is what rw10 p7-1 shows. No
  cycling is wired. The drill's page record has Present Active and
  present-εἰμί chart fields sitting next to those two, which is why the
  question exists.
  Click Hint in DOSBox and then keep clicking whatever it offers.
  → **FA+FM only / cycles to (list): ______________**
  Notes: Ah, this is the first time I have noticed this - there is no cycling, BUT if you are viewing a lusw form and click Hint you get the lusw luseis paradigm BUT it you are viewing an eimi form you see the eimi paradigm. I have attached a screenshot of that page with this response (please remind me if I missed it). Let's copy this and keep an eye out for similar behavior moving forward

- [X] **(j) Irregular Futures headers — underlined or not?**
  Port: underlines "Present" and "Future" on BOTH the Deponent Futures
  and Irregular Futures charts, because 5G-SPEC1 §3.2 says both are
  underlined and the data marks both. Panel p6-2 shows the **Irregular**
  headers NOT underlined while p5-4's Deponent headers are.
  → **Keep both underlined / drop the underline on Irregular Futures:**
  ______________
  Notes: Keep both underlined

- [X] **(k) The SM speller's Previous Page / Next Page pair.**
  Port: the whole verse is one field with one Check Answer, as every
  ported whole-verse speller has been since chapter 3. The original
  pages the entry area (panel p13-2). This is a standing pre-5G
  divergence, not something this round introduced; it is listed so it is
  a decision rather than an omission.
  → **Standing divergence stays / page the field like the original:**
  ______________
  Notes: Not sure what you are referring to, botht the original and the port have Previous/ Next buttons, but keep doing these as you are and as I have approved them since chapter 3.

---

## Decisions (e, f)

Both are the original's own slips, shipped verbatim. Either answer gets
a divergence entry; "keep" is not the free option.

- [X] **(e) Chapter 9 objective 6 reads "memorize Jn 6:23b in Greek."**
  The verse the chapter actually teaches is **Rom 6:23b** — the Learn
  Scripture Memory page, the speller's own instruction line and the
  Quick Review entry all say Rom.
  Port: prints the objective verbatim, Jn and all.
  → **Keep the typo / fix to Rom 6:23b:** ______________
  Notes: fix to Rom 6:23b

- [X] **(f) Chapter 9 glosses ἔρχομαι "I go in, enter" on the Compound Verbs page.**
  That is εἰσέρχομαι's gloss, copied one row up; the chapter's own
  vocabulary glosses ἔρχομαι "I come, go", and so does the Frequently
  Used Deponent Verbs popup two topics earlier — so the page contradicts
  itself.
  Port: prints "I go in, enter" verbatim.
  → **Keep verbatim / fix to "I come, go":** ______________
  Notes: fix to "I come, go"

---

## Airplane-mode pass (directive 4, device half)

The preview half is scripted (`npm run ui:offline`: 44 stops, refresh on
an activity route, no console errors). This is the part only a real
iPhone can answer.

- [X] **Download both packs through the app**, then turn on airplane
  mode and walk **all 44 stops** — chapter 9's 22 and chapter 10's 22.
  → **PASS / FAIL at: ______________**
  All PASS

- [X] **Tap the Greek prompt on at least one ch10 Translation Drill
  item.** This is the surface behind the round's blocking fix: all 31
  of that drill's clips were keyed in the wrong case and would have
  toasted "Audio not found" on every item. One tap that speaks is the
  proof it is fixed on device.
  → **Speaks / silent / toast:** ______________
  Speaks, tried several successfully

- [X] **Run one Repeat-checkbox exercise offline** (ch9 or ch10 SM
  speller): tick Repeat This Exercise, spell the verse correctly, and
  let the verse play to the end — the field should clear for another
  pass. Then do it again and tap **Pronounce** while the verse is still
  playing: what you typed must stay put, because an interrupted clip is
  not you hearing your verse. *(Skip if item (d) retires the control.)*
  → **PASS / FAIL:** ______________
  Remove 'Repeat This Exercise' checkbox from chapters 9 & 10 completely! Make a note moving forward that I DO NOT WANT this behavior and have deliberately decided against it - if a student wants to reset the exercise I have already provided them a Restart Exercise button. 

- [X] **Anything that looks wrong.** Free text; a screenshot beats a
  description.
  → ______________________________________________
  Everything looks good besides what I have noted in 5G-FEEDBACK1.pdf
