#!/usr/bin/env python3
"""Build the bundled Greek webfont (5B-SPEC3 B1).

WHY THIS SCRIPT EXISTS. The spec asks for a self-hosted polytonic webfont whose
perispomeni is the ROUNDED (inverted-breve) mark rather than a tilde. No open
polytonic font draws it that way: Noto Serif/Sans, Gentium Plus, Gentium Book
Plus, Cardo, EB Garamond, GFS Didot, GFS Neohellenic, Literata, Libertinus
Serif, FreeSerif/FreeSans and DejaVu Serif/Sans were each rendered and every one
draws U+1FC0 as a tilde -- that IS the dominant Greek typographic convention.
The rounded form the original ParsonsTech font uses is what Apple's system face
draws, and it cannot be bundled.

So the font is DERIVED, not merely subset. In Noto Serif every perispomeni-
bearing glyph is a composite over one shared `tilde` component, and the font
already contains a drawn arch: `uni0311`, the combining inverted breve. This
script redraws `tilde` as that arch, stretched to the tilde's exact bounding box
so every composite's existing offset still lands, which reaches all 119
composites at once without touching a single offset.

Output: src/assets/fonts/greektutor-serif-{regular,bold}.woff2, subset to the
ranges the app actually renders. Requires fontTools + brotli:
    pip install fonttools brotli
    python3 scripts/make-greek-font.py path/to/NotoSerif[wdth,wght].ttf
The upstream source is Google's Noto Serif (OFL 1.1, no reserved font name);
its licence ships beside the output as OFL.txt, with the derivation recorded in
NOTICE.md.
"""

import sys
from pathlib import Path

from fontTools.misc.transform import Transform
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.subset import Subsetter, Options
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

# The app renders Greek, Latin labels inside .greek spans, the spacing marks the
# isolated-mark and red-overlay paths use (U+00B4 U+0060 U+00A8 U+1FBD/1FBF/
# 1FC0/1FFE), the Greek colon (U+00B7) and question mark (U+003B), and em/en
# dashes. Combining marks are kept so an NFD string can never fall through.
UNICODES = (
    "U+0020-007E,U+00A0-00FF,U+0300-036F,U+0370-03FF,U+1F00-1FFF,"
    "U+2010-2015,U+2018-201D,U+2026,U+2032-2033"
)
FAMILY = "GreekTutor Serif"
OUT_DIR = Path("src/assets/fonts")

def parse_unicodes(spec):
    """"U+0020-007E,U+00B4" -> the codepoints it names."""
    out = []
    for part in spec.split(","):
        part = part.strip().replace("U+", "")
        if "-" in part:
            lo, hi = part.split("-")
            out.extend(range(int(lo, 16), int(hi, 16) + 1))
        else:
            out.append(int(part, 16))
    return out


def build_arch(font):
    """Redraw the `tilde` glyph as the font's own inverted breve, stretched to
    the tilde's exact bounding box so every composite's component offset still
    lands where it did. Every perispomeni in the font is a composite over this
    one glyph, so the arch reaches all 90 of them at once.

    Scope note: the same glyph backs Latin a-tilde / n-tilde / o-tilde and
    U+02DC, which therefore also become arches IN THIS FONT. Nothing in the app
    renders those inside a .greek span, and the body face is untouched."""
    glyf = font["glyf"]
    tilde, breve = glyf["tilde"], glyf["uni0311"]
    tilde.recalcBounds(glyf)
    breve.recalcBounds(glyf)
    scale = (tilde.xMax - tilde.xMin) / (breve.xMax - breve.xMin)
    shift = tilde.xMin - breve.xMin * scale
    pen = TTGlyphPen(font.getGlyphSet())
    font.getGlyphSet()["uni0311"].draw(TransformPen(pen, Transform(scale, 0, 0, 1, shift, 0)))
    glyf["tilde"] = pen.glyph()
    glyf["tilde"].recalcBounds(glyf)
    return scale, sum(
        1 for name in glyf.keys()
        if glyf[name].isComposite()
        and any(component.glyphName == "tilde" for component in glyf[name].components)
    )


def rename(font, style):
    """Rename the family: this is a modified font and must not claim to be Noto."""
    full = f"{FAMILY} {style}"
    postscript = full.replace(" ", "")
    for record in font["name"].names:
        text = str(record)
        if record.nameID in (1, 16):
            record.string = FAMILY
        elif record.nameID in (3, 4, 18):
            record.string = full if record.nameID != 3 else f"{full}; derived from Noto Serif"
        elif record.nameID == 6:
            record.string = postscript
        elif record.nameID == 10:
            record.string = "Derived from Noto Serif (OFL 1.1): the perispomeni is redrawn as a rounded inverted breve."
        elif "Noto Serif" in text and record.nameID not in (0, 13, 14):
            record.string = text.replace("Noto Serif", FAMILY)


def build(source, weight, style, out_name):
    font = instancer.instantiateVariableFont(TTFont(source), {"wdth": 100, "wght": weight})
    scale, reached = build_arch(font)
    rename(font, style)
    options = Options()
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.notdef_outline = True
    subsetter = Subsetter(options=options)
    subsetter.populate(unicodes=parse_unicodes(UNICODES))
    subsetter.subset(font)
    font.flavor = "woff2"
    out = OUT_DIR / out_name
    out.parent.mkdir(parents=True, exist_ok=True)
    font.save(out)
    print(f"{out}: {out.stat().st_size} bytes; arch x-scale {scale:.4f}; {reached} composites draw the arch")


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    source = sys.argv[1]
    build(source, 400, "Regular", "greektutor-serif-regular.woff2")
    build(source, 700, "Bold", "greektutor-serif-bold.woff2")


if __name__ == "__main__":
    main()
