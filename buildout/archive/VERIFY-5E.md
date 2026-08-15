# VERIFY-5E.md

This pass is limited to judgement, device reality, audio, and decisions that
the automated Chapter 1–5 walk and behavior harness cannot settle.

## Judgement calls

- [ ] **1. More/Back discoverability.** Does the switch read as “there is a second chart here,” or as a dead end? Check Chapter 4 Masculine Declension, Chapter 5 First Declension--Alpha, and Chapter 5 Definite Article Paradigm.

  **Verdict:**
  **Notes:**

- [ ] **2. Singular/Plural toggle wording.** Does the definite-article toggle read correctly when the button names the chart that is not currently shown?

  **Verdict:**
  **Notes:**

- [ ] **3. Declining Noun translation reveal.** In the original, does the translation appear automatically after an answer, or only after pressing Translate? Check both chapters in DOSBox; this behavior was deliberately not guessed from still images.

  **Verdict:**
  **Notes:**

- [ ] **4. Seven-topic phone layout.** Do the seven-topic Learn pages read well at phone width, or does the radio rail crowd the content panel?

  **Verdict:**
  **Notes:**

- [ ] **5. Repeated English Concepts page.** Is Chapter 5’s near-duplicate page tedious enough on-device to warrant a divergence, or does the original’s “proceed with haste” line handle it?

  **Verdict:**
  **Notes:**

## Audio listening pass

- [ ] **6. Paradigm audio.** Listen to individual cells and Say Whole Paradigm/Say Whole List across all four Chapter 4 charts and all four Chapter 5 charts.

  **Verdict:**
  **Notes:**

- [ ] **7. Review Vocabulary lists.** Listen to Say Whole List on both Review Vocabulary charts: `d_vocl4` and `e_vocl5`.

  **Verdict:**
  **Notes:**

- [ ] **8. Cumulative Scripture clips.** Listen to Chapter 4’s local `c_sm*` copies for John 14:6a and Chapter 5’s local `c_sm*` and `d_sm*` copies.

  **Verdict:**
  **Notes:**

- [ ] **9. Chapter 4 εἰ / μὴ assignment.** Listen-check `d_sm6`, `d_sm6b`, and `d_sm7` for εἰ, μὴ, and “εἰ μὴ” respectively. This assignment is carried from the delivered data.

  **Verdict:**
  **Notes:**

- [ ] **10. Chapter 5 `e_graphn`.** The clip is referenced on both γραφή and γραφῇ. Listen and record which form it belongs to.

  **Verdict:**
  **Notes:**

- [ ] **11. Playback interruption and exit.** Confirm audio stops on route exit and that a second tap interrupts the first clip cleanly.

  **Verdict:**
  **Notes:**

## Device reality

- [ ] **12. Airplane-mode device walk.** Download each chapter’s audio pack through the app, enable airplane mode, and walk Chapters 4 and 5.

  **Verdict:**
  **Notes:**

- [ ] **13. Widest WebKit surfaces.** Check Chapter 4’s ten-option paradigm grid and Chapter 5’s six-column Quick Review article chart on real WebKit. Chromium measured only 0.6px of headroom on the latter at 320px, and iOS text metrics can differ.

  **Verdict:**
  **Notes:**

## Decisions the build could not make

- [ ] **14. Scripture Memory option pools.** Chapter 4 ships 8 choices and Chapter 5 ships 9, while DRILL-MATRIX says 10. Both the rail walks and delivered data agree on 8/9, so neither implementer invented distractors. Keep the source-faithful pools, or author the missing distractors?

  **Verdict:**
  **Notes:**

- [ ] **15. Definite-article column headers.** The data ships one clip per gender-and-number column (`e_artms`, `e_artfs`, `e_artns`, `e_artmp`, `e_artfp`, `e_artnp`). Surfacing them makes the English headers tappable and blue, the only blue English in the app. Are those headers tap targets in the original, or should they remain ink with the clips unreferenced?

  **Verdict:**
  **Notes:**

- [ ] **16. Unused Chapter 5 article clips.** `e_artmas`, `e_artfem`, `e_artneu`, and `e_artpar` have no surface in the rail walk and neither implementation found one. Is that intentional?

  **Verdict:**
  **Notes:**

- [ ] **17. Chapter 4 `d_adepar`.** The ἀδελφός whole-paradigm clip still has no chart on any Learn page; ἀδελφός appears only as the Declining Noun Drill’s third family. Is that intentional?

  **Verdict:**
  **Notes:**

- [ ] **18. Chapter 4 Greek Noun Drill item 3.** For Matthew 5:24, the shipped underline is `brother`, while the run table said `to`. Confirm the original in DOSBox.

  **Verdict:**
  **Notes:**

- [ ] **19. δόξα merged-row label.** Should the label be `Nom./Voc` as delivered and shown in the rail walk, or `Nom./Voc.` as 5E-SPEC1 §3.2 states?

  **Verdict:**
  **Notes:**

- [ ] **20. English gloss option grids.** Both Vocabulary: Greek to English drills render four-up, while the original is two-up. This divergence predates Chapter 4, was device-verified in Chapters 1–3, and is out of this round’s scope. Decide whether a later cohort should change it.

  **Verdict:**
  **Notes:**
