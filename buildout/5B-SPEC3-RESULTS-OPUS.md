# 5B-SPEC3-RESULTS-FABLE.md — chapter 2 closeout round

Implementer: Fable (Claude Opus 5) in Claude Code. Base: the accepted SPEC2
tree + XPATCH1, with the SPEC3 replacement data files already in the working
tree. Nothing committed, nothing pushed. Build log and tool narrative:
`5B-SPEC3-BUILD-FABLE.md`.

Every spec item landed. Two findings are flagged for the chat side rather than
fixed here (section 8): residual `--` in chapter-1/intro/lexicon-01 data, and
the `φαρισαῖος` `redMarkCluster` index that still points at an unmarked alpha.

## 1. A. Data commit

`src/data/chapt-02.json` and `src/data/lexicon-chapt02.json` are the delivered
files, committed as-is. No implementer edits. `git diff` under `src/data/`
shows exactly those two wholesale replacements.

## 2. B. The font — DERIVED, not merely subset (the one real deviation)

**The spec's recommendation does not satisfy the spec's requirement.** Noto
Serif draws U+1FC0 as a TILDE. So does every other open polytonic font. Each of
these was subset, loaded, and rendered against `-apple-system` at 80-150px:

| Font | Greek Extended coverage | perispomeni |
| --- | --- | --- |
| Noto Serif / Noto Sans / Noto Serif Display | 233/256 | tilde |
| Gentium Plus / Gentium Book Plus | 233/256 | tilde |
| Cardo | 233/256 | tilde |
| EB Garamond | 233/256 | tilde |
| Alegreya, Literata | 233/256 | tilde |
| GFS Didot, GFS Neohellenic | 233/256 | tilde |
| Libertinus Serif | 233/256 | tilde |
| FreeSerif, FreeSans (GNU FreeFont) | full | tilde |
| DejaVu Serif, DejaVu Sans | full | tilde |
| Old Standard TT, PT Serif, Vollkorn | **0/256** | arch — but only via Chrome's per-glyph fallback to the system font, i.e. not real |

The rounded arch is Apple's system drawing (and the original ParsonsTech
font's); the tilde is the dominant convention in Greek types. Nathanael's
requirement is legitimate and the spec is right about what it wants — there is
simply nothing off the shelf that has it.

**Resolution.** `scripts/make-greek-font.py` derives the font. In Noto Serif
every perispomeni-bearing glyph is a composite over one shared `tilde`
component, and the font already contains a drawn arch (`uni0311`, combining
inverted breve). The script redraws `tilde` as that arch, stretched to the
tilde's exact bounding box so every composite's existing component offset still
lands, then instances and subsets. **119 composites** pick up the arch with no
offset edits. Verified visually: φαρισαῖος, αὐτοῦ, ῥῆμα, ἦν, πρῶτος, ἐκεῖνος,
ᾧ and the isolated ῀ all render the rounded mark, in regular and bold.

- **Family:** GreekTutor Serif (renamed — this is a modified font and must not
  claim to be Noto).
- **Source:** Google Fonts `ofl/notoserif/NotoSerif[wdth,wght].ttf`, OFL 1.1,
  no reserved font name. Licence ships at `src/assets/fonts/OFL.txt`; the
  derivation is recorded in `src/assets/fonts/NOTICE.md`.
- **Subset ranges:** U+0020-007E, U+00A0-00FF, U+0300-036F, U+0370-03FF,
  U+1F00-1FFF, U+2010-2015, U+2018-201D, U+2026, U+2032-2033. (Latin-1 and the
  combining block are in deliberately: the spacing marks the isolated-mark and
  overlay paths use are U+00B4/U+0060/U+00A8, and an NFD string must never fall
  through.)
- **Files:** `greektutor-serif-regular.woff2` **39,700 bytes**,
  `greektutor-serif-bold.woff2` **41,452 bytes** (wdth instanced to 100; wght
  instanced to 400 and 700). Bold is bundled rather than synthesised because
  `.rc-term` and the chart titles set Greek at weight 600-700.
- **Side effect, deliberate:** Latin a-tilde/n-tilde/o-tilde and U+02DC also
  draw as arches *in this font*. Nothing renders them inside a `.greek` span
  and the body face is untouched.

**Routing (B2/B3).** One `--greek-font` custom property is the whole stack:
`'GreekTutor Serif', 'SBL Greek', 'Times New Roman', Georgia, serif`. Times is
demoted to last resort. Every previously hand-rolled stack now points at the
variable: `.greek`, `.isolated-mark.as-mark` (was the system stack),
`.isolated-mark.greek`, `.greek-tap`, and `.tk-key.mark` (the speller's
diacritic tiles, which had no Greek class at all). `font-display: block`.

**Precache.** Built manifest carries **21 entries, 459.13 KiB** (was 19); both
woff2 files are present as `assets/greektutor-serif-regular-9abzY2AB.woff2` and
`assets/greektutor-serif-bold-ByRt3e5M.woff2`, read out of the generated
`dist/sw.js` rather than assumed. The chapter-1 chunk hash is unchanged
(`chapt-01-8ZoFoXk9.js`), so chapter 1 re-downloads nothing.

## 3. C. Mark geometry — the offset table (for the standing docs)

Rendering rule: **full overlay**. When any mark in a cluster must be coloured,
ALL of that cluster's marks come off the base and the whole set is drawn as
spacing glyphs — target in `--mark-red`, the rest in ink. Mixing an overlaid
mark with base-drawn marks was the actual cause of items 5 and 6; no offset
table alone could have fixed it. `markOverlayParts()` now returns
`{ base, marks:[{glyph, kind, slot, red}], layout, capital }`.

**The constants are read off the font, not eyeballed.** Precomposed polytonic
glyphs are composites of base + spacing-mark components, so the type designer's
own offsets are the table. Converting ink centres to em offsets from the base's
centre (1000-unit em):

| Rule | Case | layout / slot | `--mx` | `--my` | Read from |
| --- | --- | --- | --- | --- | --- |
| M1 | single accent | `single` / `only` | 0 | 0 | ά, ῶ, ῆ, ϋ all use y-offset 0 over lowercase |
| M2 | breathing + acute/grave | `pair` / `left` | −0.11em | 0 | ἄ `uni1FBF@119`, ὕ `uni1FFE@49` |
| M2 | " | `pair` / `right` | +0.05em | 0 | ἄ `tonos@250`, ὕ `tonos@220` |
| M3 | breathing + circumflex | `stack` / `lower` | 0 | 0 | ἆ `uni1FBF@(186,6)` |
| M3 | " | `stack` / `upper` | 0 | −0.224em | ἆ `tilde@(52,224)`, ᾧ `tilde@(181,224)` |
| M4 | diaeresis + accent | `diaeresis` / `lower` | 0 | 0 | dots at their natural seat |
| M4 | " | `diaeresis` / `upper` | 0 | −0.16em | dots' ink top 744 vs accent ink bottom 606, plus clearance |
| M5 | capital, any layout | `.capital` | anchored to the base's LEFT EDGE, +0.06em | +0.075em | Ἀ `uni1FBF@(52,−70)`, Ἠ `uni1FBF@(−40,−70)`, Ἄ `@(−116,−82)` |
| M5 | capital + pair | `.capital.pair` | left −0.10em / right +0.06em | +0.075em | Ἄ keeps M2's 0.16em spread |
| M5 | capital + stack/diaeresis | `.capital` upper | — | −0.149em | Ἄ's −82 lowering applied to M3's lift |
| M6 | iota subscript | not overlaid | — | — | stays in the base string; ᾧ keeps its subscript |

Diphthongs need no rule: in Unicode the mark already belongs to the SECOND
vowel's grapheme cluster, so M1 covers "above the second vowel" for free.

M4 deliberately departs from the font: Noto's own `dieresistonos` sets the
accent *beside* the dots, and this chapter teaches (and the PDF shows) the
accent *above* them.

**Glyph identity.** Greek text sets its acute/grave from U+0384/U+1FEF, not the
Latin-1 U+00B4/U+0060 that the chart cells carry — a visibly different width
and slope at prompt size. `overlayForm()` maps the combining mark to the Greek
spacing glyph so a reddened accent is the same drawing as the one it replaced.

**Acceptance anchors** (comparison grid: precomposed / overlay-over-ghost /
overlay alone, using the real `markOverlayParts` and the real `app.css`):
ἀκούω, ἀνθρώπου, ἄνθρωπον, ἀδελφός (M2), ἀπόστολος and ἦν (M3), Ἀχαΐα (M4 on
the ΐ, M5 on the Ἀ), Ἠσαΐας (M5 and M4), τοὔνομα (M2 coronis+acute), ᾧ (M6),
καὶ θεός ἦν (untargeted circumflex now rounded via the bundled font). All land
on the precomposed glyph with zero collisions and only the target mark red.
Pool-wide over the real data: **38 overlay clusters, 6 whole-cluster
punctuation, 1 plain** (the φαρισαῖος data bug — see section 8).

Accessibility: the reddened prompt now carries `aria-label={current.prompt}`,
because the rendered cluster is base-minus-marks plus positioned glyphs and
would otherwise be announced unaccented.

## 4. D. Interaction items

- **D1 score visibility (item 2).** `showScore` starts `false` on
  `SelectActivity`, `DivideActivity` and `PlaceAccentActivity`; the first Score
  press reveals the live-updating line and Score toggles it thereafter.
  `ui.liveScore` now means "the revealed line keeps updating", not "open by
  default". `SpellActivity`'s score dialog was already press-to-open. Asserted
  on one surface of each scored type: hidden -> shown on first press -> hidden
  on the second.
- **D2 division ergonomics (item 3).** `GAP_RATIO` 0.34 -> 0.68 and the fit is
  now per-word rather than pool-static, per the spec's "the gap buttons scale
  with the word ... filling available width". This reverses a SPEC2 decision
  (one size for the whole pool so stepping never resized the row) — the spec
  asks for the opposite and the screenshot shows why. Measured at 320px, the
  20-word pool: gap buttons **17-52px wide × 52-116px tall** (was a uniform
  ~15px wide), letters 21-76px, and **every row fits its rail**. φαρισαῖος at
  320px is the arithmetic floor — 9 clusters and 8 gaps in 260px cannot give
  both 22px targets and legible letters — so `fitRow()` treats the 22px gap
  floor as a preference the rail can veto.
- **D3 (item 4).** ἄνθρωπε carries the stand-in clip in the data and renders as
  a tappable row like its siblings in the Rule 1 chart (asserted in the UI:
  topic 4, row contains a button, colour `rgb(22, 99, 199)`). No code change.
- **D4 (item 9).** New `subheading` RichContent block: own line, left-aligned,
  heading-green, no hanging indent, prose beneath it as an ordinary `para`. The
  Nouns topic renders Gender / Number / Case as three green subheadings with
  the 1-5 case list under "Case:". The unknown-block guard was **absent**, not
  merely quiet — the dispatch had no final `else`, so an unrecognised type
  deleted its content silently. Added at both levels: a loud in-page
  placeholder, and a build-time check in `scripts/check-content-shapes.mjs`
  that fails on any block type with no renderer (proved by mutating a copy:
  exits 1 with the exact block path).
- **D5 em dashes (item 8).** Data arrives normalised. UI-authored strings
  swept: `audio.js` toast, `content.js` pending-extraction placeholder, and the
  PWA manifest description in `vite.config.js`. See section 8 for the residual
  data hits, which are the pipeline's.

## 5. Verification

| Check | Result |
| --- | --- |
| `npm run verify` (shapes + build + lazy-chunk guard) | clean; chapt-01 chunk hash unchanged; precache 21 (459.13 KiB) |
| ch2 rail walk @320 / @768 | 20/20 + end dialog, both |
| ch1 regression walk @320 / @768 | 26/26 + end dialog, both |
| Console/page errors across all four walks | 0 |
| Non-tappable blue (injected `button{color:#007aff}` WebKit probe) | none |
| Horizontal overflow at 320/768 | none |
| Score line present before first Score press | none, on any surface |
| Unknown-block placeholders | none |
| Division rows fitting the rail, 20 items @320 | 20/20 |
| Mark geometry anchors | all render per M1-M6, zero collisions |
| Unknown-block build guard | proved by mutation: exit 1 with the block path |
| Offline preview under SW control | see below |

All four rail walks were re-run on the final build, after the DivideActivity
measurement fix and the prompt `aria-label`, not on an intermediate one.

Behavioural assertions driven through the real UI (`behave.mjs`):

| Assertion | Result |
| --- | --- |
| ἄνθρωπε row in the Rule 1 chart (topic 4) | contains a button, colour `rgb(22, 99, 199)` |
| Score line on the select / divide / placeAccent surfaces | hidden -> shown on first press -> hidden on second, all three |
| Accent placement pool | "1 of 25", no banner element, the string "Extended practice" absent from the page |
| Shuffled extension items 4 and 23 | item 4 = "first, earlier" (πρῶτος), item 23 = "of him" (αὐτοῦ), each with Pronounce Word enabled |
| Speller letter tile / mark tile / target pane font | `GreekTutor Serif` on all three |
| Ἠσαΐας, Ἀχαΐα overlay | layout `diaeresis`, dots red, accent ink |
| τοὔνομα overlay | layout `pair`, coronis red, accent ink |
| ἀπόστολος overlay | layout `single`, breathing red |

## 6. Offline

Production preview, service worker installed and in control, then
`Network.emulateNetworkConditions({offline:true})`:

- SW state `activated`, `navigator.serviceWorker.controller` present.
- Hard refresh directly on an ACTIVITY route (`c2_drill_accent_rule`) renders
  under SW control: prompt present, red overlay present, `document.fonts`
  reports `GreekTutor Serif: loaded`.
- **The font is the bundled one, not a fallback**, proven by metrics rather
  than by name: the same string measures 476.3px in the `.greek` stack and
  409.7px forced to Times, offline. No fallback flash (`font-display: block`
  plus a precached file means the face is there before first paint).
- Chapter 2 rail offline: **20/20 + end dialog**. Chapter 1 rail offline:
  **26/26 + end dialog**.
- Console: **zero exceptions**. The only network failures are
  `/audio/chapt_2/*.m4a` fetches — the preview ships no audio files, so
  pronounce-each surfaces have nothing to fetch. Named by URL rather than
  assumed (a separate run mapped requestId to URL). This is the pre-existing,
  frozen-architecture behaviour XPATCH1 also recorded.

Screenshot of the offline activity route: `offline-activity.png` in the session
scratchpad (ἐχώ, red acute over ω, ink breathing over ε, bundled face).

## 7. Judgement calls

1. **Deriving the font** rather than reporting "no font satisfies B1". The spec
   is explicit that the rounded perispomeni is the requirement and names the
   source as a recommendation; the derivation is reproducible, licensed, and
   documented. Flagging it here because it is the round's largest deviation.
2. **Per-word division sizing** reverses SPEC2's pool-static choice. The spec
   text is explicit ("scale with the word"), and the alternative leaves a
   three-letter word using a third of the screen.
3. **D5 scope.** The checklist line reads "no `--` anywhere in src"; the D5 body
   scopes it to UI-authored strings. I swept user-visible strings and left code
   comments alone — this repo's comment style uses `--` as an ASCII em dash
   throughout, and rewriting ~100 comment lines would bury the round's real
   diff. Say the word and it is a one-line sweep.
4. **M4 follows the chapter, not the font** (accent above the dots).
5. The `--divide-size` clamp accepts sub-22px gap buttons on the single longest
   word rather than clipping it. Clipping is silent data loss; a 17px button is
   visible and still hittable.

## 8. Findings for the chat side (not fixed here — data is pipeline-owned)

1. **`φαρισαῖος` in the Marking Recognition pool still has
   `redMarkCluster: 6`,** which is a bare α (the circumflex is on cluster 7).
   XPATCH1's rule renders it with no red at all, so the item currently asks
   "which mark is red?" with nothing red. This is the last visible data bug in
   chapter 2.
2. **Residual `--` in rendered data fields, outside chapter 2:**
   `chapt-01.json.learn[7].content[1].text` ("family--Semitic"),
   `intro.json.learn[0].content[1].text` ("WELCOME --"),
   `intro.json.learn[0].content[3].text` ("-- ENJOY"),
   `lexicon-chapt01.json.exampleWords.anthropoi.gloss` and `.anthropois.gloss`.
   Chapter 1 and intro are out of scope for this spec; the em-dash policy will
   want them at the next regen.
3. **`bind:clientWidth` is not safe against a webfont swap.** It reported the
   probe's width once, during `font-display: block`, and never reported the
   reflow when the bundled face arrived. This shipped in SPEC2 and was
   mis-sizing the division row all along; the new font only changed the size of
   the error. Anything else that measures text should use the
   `afterUpdate` + `ResizeObserver` + `document.fonts.ready` pattern now in
   `DivideActivity`. Worth promoting to the footgun list.
4. **A `visibility: hidden` measurement probe is not reliably re-laid-out** on
   font swap in Chrome; the probe is parked off-canvas instead.

## 9. VERIFY3 candidates (expected small)

- **V3-1 Font on real iOS.** Confirm φαρισαῖος shows the ROUNDED circumflex in:
  Learn Syllables chart, division letters, marking prompt, accent-placement
  answer line, accent rule drill (target and non-target), speller target and
  mark tiles. Also confirm the Greek face itself reads acceptably — this is a
  new typeface for chapter 1 as well as chapter 2, so give the chapter-1
  alphabet pages a look.
- **V3-2 Mark anchors on device.** ἀκούω, ἀδελφός, ἆποστολος, Ἀχαΐα, Ἠσαΐας,
  τοὔνομα, καὶ θεός ἦν: one photo each if anything looks off-centre. The
  offsets are font-derived, so a systematic error would show as the same shift
  everywhere rather than per-word noise.
- **V3-3 Division ergonomics.** Does the row resizing per word feel right when
  stepping? And are the buttons now comfortable for the target user, including
  on the longest word (φαρισαῖος), where they are smallest?
- **V3-4 Airplane mode.** Standard offline pass; the font must render bundled,
  with no fallback flash.
