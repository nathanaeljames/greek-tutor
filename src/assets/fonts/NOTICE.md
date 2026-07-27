# GreekTutor Serif — provenance

`greektutor-serif-regular.woff2` and `greektutor-serif-bold.woff2` are a
MODIFIED, subsetted build of Google's **Noto Serif** (Copyright 2022 The Noto
Project Authors, SIL Open Font License 1.1 — full text in `OFL.txt`; the
upstream copyright line carries no Reserved Font Name).

Two changes from upstream:

1. **The perispomeni is redrawn as a rounded arch.** Noto Serif — like Gentium
   Plus, Gentium Book Plus, Cardo, EB Garamond, GFS Didot, GFS Neohellenic,
   Literata, Libertinus Serif, FreeSerif, FreeSans, DejaVu Serif and DejaVu Sans,
   all of which were rendered and compared — draws U+1FC0 as a TILDE. That is the
   dominant Greek typographic convention, but it is not what the original
   ParsonsTech courseware draws and not what this project wants (5B-VERIFY2 item
   1). Every perispomeni-bearing glyph in Noto Serif is a composite over one
   shared `tilde` component, so `scripts/make-greek-font.py` redraws that one
   glyph as the font's own `uni0311` (combining inverted breve) stretched to the
   tilde's exact bounding box. 119 composites pick up the arch with no offset
   changes. Side effect, deliberate and harmless here: Latin a-tilde / n-tilde /
   o-tilde and U+02DC also draw as arches in THIS font. Nothing renders them
   inside a `.greek` span, and the body face is untouched.
2. **Subset** to the ranges the app renders: U+0020-007E, U+00A0-00FF,
   U+0300-036F, U+0370-03FF, U+1F00-1FFF, U+2010-2015, U+2018-201D, U+2026,
   U+2032-2033. Variable axes are instanced (wdth 100; wght 400 and 700).

Rebuild with:

    pip install fonttools brotli
    python3 scripts/make-greek-font.py NotoSerif[wdth,wght].ttf
    python3 scripts/make-mark-geometry.py

The source file is Google Fonts' `ofl/notoserif/NotoSerif[wdth,wght].ttf`.

## The second step is not optional

`src/lib/mark-geometry.json` is DERIVED FROM THIS FONT FILE. The red-mark
drills draw one diacritic in a different colour, which cannot be done in place
(the browser shapes across the inline boundary and paints the mark with the
base run's colour), so the cluster is rendered without its marks and the marks
are drawn over it. Where they go comes from this font's own composite glyph
offsets — the acute sits at +0.205em over alpha, +0.334em over omega, −0.028em
over iota — read out by `scripts/make-mark-geometry.py` (5B-SPEC4 B; SPEC3's
six-rule approximation is what VERIFY3 caught riding low and off-centre).

Change the font without regenerating the table and every manually placed mark
in chapters 2+ drifts, quietly and only by a hair. Regenerate in the same
commit. `npm run check:shapes` fails the build if a reddened cluster has no
row in the table, but it cannot tell a stale row from a fresh one.
