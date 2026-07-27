#!/usr/bin/env python3
"""Generate src/lib/mark-geometry.json from the bundled Greek font (5B-SPEC4 B1).

WHY THIS SCRIPT EXISTS. Two chapter-2 drills ask "which mark is red?", which
means one mark of a cluster has to be coloured. A mark cannot be coloured in
place: the browser shapes across an inline boundary that differs only in colour
and paints the mark with the base run's colour. So the cluster is rendered
WITHOUT its marks and the marks are drawn over it as free-standing spacing
glyphs -- "manually placed", in the VERIFY3 wording.

Through SPEC3 those overlays were positioned by a hand-written rule table: six
CSS rows (M1-M6) covering single accent / breathing+accent / breathing+
circumflex / diaeresis+accent / capitals / iota subscript. VERIFY3's finding is
that printed text is always right and manual placement is always ALMOST right --
low by a hair, off-centre in a diaeresis, a touch right of the iota in kai.

The reason is that the font does not use six rules. A precomposed polytonic
glyph is a COMPOSITE: base component plus one or two mark components, each at an
offset the type designer chose for that exact pair. There are 239 such
characters in this font and their offsets genuinely differ by base letter and by
combination -- alpha takes its tonos at x=205, iota's dialytika-tonos sits at
x=-204, a capital lowers its breathing by 70-82 units and may shift the base
right to make room. Six constants cannot express 239 positions.

So this script reads the offsets straight out of the font. Each row of the
output is the type designer's own answer for that character, which makes the
overlay reproduce the printed form by construction rather than by adjustment.
Nathanael's VERIFY3 instruction, literally: "produce the word with the accent
using the actual text, and then move the manually positioned accents to
perfectly overlap that."

    pip install fonttools brotli
    python3 scripts/make-mark-geometry.py

Re-run whenever scripts/make-greek-font.py re-derives the font; the offsets are
properties of that file, not of Unicode.
"""

import json
import sys
import unicodedata
from collections import Counter
from pathlib import Path

from fontTools.pens.recordingPen import RecordingPen
from fontTools.ttLib import TTFont

FONT = Path("src/assets/fonts/greektutor-serif-regular.woff2")
OUT = Path("src/lib/mark-geometry.json")

# The marks this course teaches, and the SPACING codepoint that draws each one
# on its own. These are the glyphs the overlay prints, so a reddened accent is
# the same drawing as the one it replaced (Greek text sets its acute from
# U+0384, not the Latin-1 U+00B4: a visibly different width and slope).
RENDER = {
    "̓": "᾿",   # smooth breathing / coronis -> GREEK PSILI
    "̔": "῾",   # rough breathing            -> GREEK DASIA
    "́": "΄",   # acute                      -> GREEK TONOS
    "̀": "`",   # grave                      -> GREEK VARIA
    "͂": "῀",   # circumflex                 -> GREEK PERISPOMENI
    "̈": "¨",   # diaeresis                  -> DIAERESIS
}
# Component glyphs are identified by whatever codepoint reaches them; several
# codepoints reach the same drawing (U+1FBD koronis and U+1FBF psili share one
# glyph). Map every such codepoint onto the combining mark it represents.
COMPONENT_MARK = {
    0x1FBD: ["̓"], 0x1FBF: ["̓"],
    0x1FFE: ["̔"],
    0x0384: ["́"], 0x00B4: ["́"], 0x1FFD: ["́"],
    0x1FEF: ["̀"], 0x0060: ["̀"],
    0x1FC0: ["͂"], 0x02DC: ["͂"],
    0x00A8: ["̈"],
    # Fused outlines: one glyph drawing two marks. Split by ink (see below).
    0x0385: ["̈", "́"], 0x1FEE: ["̈", "́"],
    0x1FED: ["̈", "̀"],
}
IOTA_SUBSCRIPT = "ͅ"
# Quantity marks (macron, vrachy). Not taught here, and their component glyphs
# are unencoded in the subset, so they would only show up as unresolved rows.
SKIP_MARKS = {"̄", "̆"}


def flatten(glyf, name, dx=0, dy=0, out=None, depth=0):
    """Composite glyph -> [(leaf glyph name, x offset, y offset)] in font units."""
    out = [] if out is None else out
    glyph = glyf[name]
    if glyph.isComposite() and depth < 6:
        for component in glyph.components:
            flatten(glyf, component.glyphName, dx + component.x, dy + component.y, out, depth + 1)
    else:
        out.append((name, dx, dy))
    return out


def ink_boxes(glyph_set, name):
    """Per-contour ink boxes, largest-height first. The fused dialytika glyphs
    are single outlines, so the only way to say where their dots end and their
    accent begins is to read the contours: two short round ones and one tall
    slanted one."""
    pen = RecordingPen()
    glyph_set[name].draw(pen)
    boxes, points = [], []
    for op, args in pen.value:
        if op == "moveTo":
            points = [args[0]]
        elif op in ("lineTo", "qCurveTo", "curveTo"):
            points.extend(point for point in args if point)
        elif op == "closePath" and points:
            xs = [p[0] for p in points]
            ys = [p[1] for p in points]
            boxes.append((min(xs), min(ys), max(xs), max(ys)))
            points = []
    return boxes


def union(boxes):
    return (min(b[0] for b in boxes), min(b[1] for b in boxes),
            max(b[2] for b in boxes), max(b[3] for b in boxes))


def fused_bands(glyph_set, fused_glyph, marks, upem):
    """A fused mark glyph draws two marks in one outline: U+0385 sets its tonos
    BETWEEN the dialytika dots (which is exactly the placement VERIFY3 asks for),
    and U+1FED does the same with a varia. It cannot be rebuilt out of the
    standalone glyphs -- its dots sit further apart than U+00A8's and its accent
    is drawn narrower than U+0384's -- so the drill would have nothing to redden
    one half of.

    The way out is that its three ink pieces are horizontally DISJOINT
    (dot | accent | dot). So the overlay prints the fused glyph three times at
    the same offset and clips each copy to one vertical band; each band is then
    coloured on its own. What gets painted is the printed glyph itself, in two
    colours, which is as exact as this can be. Bands are cut midway between
    neighbouring ink pieces and returned as em offsets from the glyph's origin.
    """
    boxes = ink_boxes(glyph_set, fused_glyph)
    if len(boxes) != 3:
        raise SystemExit(f"fused glyph {fused_glyph}: expected 3 contours, got {len(boxes)}")
    boxes.sort(key=lambda box: box[0])
    tall = max(range(3), key=lambda i: boxes[i][3] - boxes[i][1])
    if tall != 1:
        raise SystemExit(f"fused glyph {fused_glyph}: accent is piece {tall}, expected the middle one")
    cuts = [(boxes[i][2] + boxes[i + 1][0]) / 2 for i in (0, 1)]
    # marks[0] is the diaeresis, marks[1] the accent (COMPONENT_MARK order).
    edges = [-upem, cuts[0], cuts[1], 2 * upem]
    order = [marks[0], marks[1], marks[0]]
    return [(mark, round(edges[i] / upem, 4), round(edges[i + 1] / upem, 4))
            for i, mark in enumerate(order)]


def main():
    if not FONT.exists():
        sys.exit(f"{FONT} not found — run scripts/make-greek-font.py first.")
    font = TTFont(FONT)
    upem = font["head"].unitsPerEm
    cmap = font.getBestCmap()
    glyf = font["glyf"]
    hmtx = font["hmtx"]
    glyph_set = font.getGlyphSet()

    # A component glyph carries no codepoint of its own; resolve it through any
    # encoded glyph that draws exactly it and nothing else (the perispomeni
    # component is `glyph00200`, reached by U+1FC0 as a one-component composite).
    alias = {}
    for cp, name in sorted(cmap.items()):
        parts = flatten(glyf, name)
        if len(parts) == 1 and parts[0][1] == 0 and parts[0][2] == 0:
            alias.setdefault(parts[0][0], cp)

    clusters = {}
    unresolved, skipped = Counter(), Counter()
    em = lambda units: round(units / upem, 4)

    for cp in list(range(0x0370, 0x0400)) + list(range(0x1F00, 0x2000)):
        char = chr(cp)
        if unicodedata.category(char)[0] != "L":
            continue
        nfd = unicodedata.normalize("NFD", char)
        marks = [c for c in nfd[1:] if c != IOTA_SUBSCRIPT]
        if not marks:
            continue
        if any(m in SKIP_MARKS for m in marks):
            skipped[nfd[1:]] += 1
            continue
        if cp not in cmap:
            unresolved[f"U+{cp:04X} not in cmap"] += 1
            continue

        # The base is the letter plus its iota subscript: M6 keeps the subscript
        # in the base string, so it must be in the base GLYPH too or its
        # component would be mistaken for an overlay mark.
        base_str = unicodedata.normalize("NFC", nfd[0] + (IOTA_SUBSCRIPT if IOTA_SUBSCRIPT in nfd else ""))
        if len(base_str) != 1 or ord(base_str) not in cmap:
            unresolved[f"U+{cp:04X} base {base_str!r} unmapped"] += 1
            continue

        parts = flatten(glyf, cmap[cp])
        base_parts = flatten(glyf, cmap[ord(base_str)])
        # Locate the base INSIDE the composite. It is not always at the origin:
        # capitals shift the letter right to make room for a mark in front of it
        # (U+1F18 is E at +119 with the psili at -40), and every offset we emit
        # has to be relative to where the base actually lands.
        anchor = None
        for name, dx, dy in parts:
            if name != base_parts[0][0]:
                continue
            bx, by = dx - base_parts[0][1], dy - base_parts[0][2]
            if all((n, x + bx, y + by) in parts for n, x, y in base_parts):
                anchor = (bx, by)
                break
        if anchor is None:
            unresolved[f"U+{cp:04X} base glyph not found in composite"] += 1
            continue
        bx, by = anchor
        rest = list(parts)
        for name, x, y in base_parts:
            rest.remove((name, x + bx, y + by))

        rows, failed = [], False
        for name, dx, dy in rest:
            cp_alias = alias.get(name)
            component_marks = COMPONENT_MARK.get(cp_alias) if cp_alias is not None else None
            if not component_marks:
                unresolved[f"U+{cp:04X} component {name} (alias {cp_alias and hex(cp_alias)})"] += 1
                failed = True
                break
            # Relative to the base's origin, in em. y flips: font units go up,
            # CSS translate goes down.
            offset = {"x": em(dx - bx), "y": em(-(dy - by))}
            if len(component_marks) == 1:
                rows.append({"m": component_marks[0], "g": RENDER[component_marks[0]], **offset})
            else:
                fused_char = chr(cp_alias)
                for mark, left, right in fused_bands(glyph_set, name, component_marks, upem):
                    rows.append({"m": mark, "g": fused_char, **offset, "clip": [left, right]})
        if failed:
            continue
        # A fused glyph contributes more ROWS than marks (three clipped bands
        # for two marks), so compare the mark SET, not the row count.
        if sorted(set(row["m"] for row in rows)) != sorted(set(marks)):
            unresolved[f"U+{cp:04X} produced marks {set(r['m'] for r in rows)}, NFD has {set(marks)}"] += 1
            continue
        # Order the emitted rows by NFD order so the runtime can match a
        # requested mark without caring which order the font stacked them in.
        # Stable, so a fused glyph's bands keep their left-to-right order.
        rows.sort(key=lambda row: marks.index(row["m"]) if row["m"] in marks else 99)

        entry = {"base": base_str, "marks": rows}
        # bx/aw are zero for every lowercase cluster and most capitals; emit
        # them only where the composite actually shifts its base.
        if em(bx):
            entry["bx"] = em(bx)
        advance = em(hmtx[cmap[cp]][0] - hmtx[cmap[ord(base_str)]][0])
        if advance:
            entry["aw"] = advance
        clusters[char] = entry

    if unresolved:
        for key, count in unresolved.most_common():
            print(f"UNRESOLVED: {key} (x{count})", file=sys.stderr)
        sys.exit(f"{sum(unresolved.values())} unresolved rows — refusing to emit a table with holes.")

    header = {
        "_generated_by": "scripts/make-mark-geometry.py — do not hand-edit",
        "_source_font": FONT.name,
        "_note": (
            "Per-character mark offsets read out of the bundled font's composite glyphs. "
            "x/y are em offsets of the mark glyph's origin from the BASE glyph's origin "
            "(+x right, +y down, CSS sense). bx (default 0) is the base component's own x "
            "offset inside the composite and aw (default 0) the precomposed advance minus "
            "the base advance, so an overlay cluster occupies the width the printed "
            "character would. clip is a vertical band in em, used only where one outline "
            "draws two marks. Regenerate whenever the font is rebuilt."
        ),
        "upem": upem,
    }
    # One cluster per line: the file is a review artefact as much as a data file,
    # and a 221-entry pretty-print is unreadable while a single line is undiffable.
    def pair(key, value, indent):
        return f"{indent}{json.dumps(key, ensure_ascii=False)}: " + json.dumps(
            value, ensure_ascii=False, separators=(",", ":"))

    body = [pair(key, value, " ") for key, value in header.items()]
    body.append(' "clusters": {\n'
                + ",\n".join(pair(key, value, "  ") for key, value in clusters.items())
                + "\n }")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("{\n" + ",\n".join(body) + "\n}\n", encoding="utf-8")
    print(f"{OUT}: {len(clusters)} precomposed clusters, {OUT.stat().st_size} bytes"
          f" (skipped {sum(skipped.values())} macron/vrachy)")


if __name__ == "__main__":
    main()
