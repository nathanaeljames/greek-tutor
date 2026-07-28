#!/usr/bin/env python3
"""tbk_richtext.py -- ToolBook 3.0 rich-text record parser (5C experiment).

Recovers field text plus per-span formatting runs from ParsonsTech Greek
Tutor .TBK files. Two structures, empirically derived from known
plaintext-to-binary correspondences in 2_ACCENT.TBK (chapter-2 DOSBox
ground truth) and validated against 1_ALPHAB.TBK / plain-string dumps:

TEXT RECORD (field text property):
    [b0:1] [len:u16 LE] [text: len bytes]
  b0 observed as 0x01/0x02/0x04 (meaning unknown; not needed).
  Text is CP-ASCII with CRLF line breaks; Greek is legacy font-coded.
  The length prefix is validated (>=95% printable) before acceptance;
  where it disagrees with the printable region, the printable region
  wins (some fields chain -- see LIMITS below).

FORMAT-RUN TABLE (follows its text, possibly at a short distance):
    [tagbyte:1=0x5d|others] [sub:1] [00 00] [nruns:u16] [nruns:u16]
    [00 00] [01 00] [7 bytes] then nruns * 11-byte records:
        [charOffset:u16 LE] [formatId:u16 LE] [7 bytes aux]
  charOffset is a plain BYTE offset into the field text (CRLF = 2).
  formatId indexes a fontface/format record; within one field the ids
  are consistent: e.g. underline spans got 0x07e4 vs default 0x0001 in
  the chapter-2 part-of-speech pool; Greek-font spans got 0x082c vs
  English 0x0d1e in the chapter-2 vocabulary field. Absolute ids vary
  per file/page; CLASSIFY PER FIELD by anchoring on spans whose text is
  unambiguous (pure-ASCII English words => that id is 'english';
  spans containing legacy diacritic codes => 'greek'), then propagate.

DETECTION is empirical, not container-walking: we scan for printable
regions and for run tables independently, then associate a run table
with the nearest preceding text region it indexes cleanly (all offsets
< len(text), strictly increasing).

LIMITS (declared, not hidden):
  * We do not parse the ToolBook object tree; field NAMES are found by
    proximity heuristics only.
  * Adjacent fields can abut with no binary separator; the length
    prefix resolves most cases but not all. Unresolved boundaries are
    reported, not guessed.
  * The 7 aux bytes per run are not understood (sometimes carry data).
  * formatId -> concrete style (underline vs font vs size) is resolved
    per-field by anchoring, not by decoding the format records
    themselves.
"""
import re
import struct
import sys

PRINTABLE = set(range(0x20, 0x7f)) | {0x0d, 0x0a, 0x09}


def find_text_regions(data, min_len=24):
    """Maximal runs of printable-or-CRLF bytes."""
    regions = []
    i, n = 0, len(data)
    start = None
    for i in range(n):
        if data[i] in PRINTABLE:
            if start is None:
                start = i
        else:
            if start is not None and i - start >= min_len:
                regions.append((start, i))
            start = None
    if start is not None and n - start >= min_len:
        regions.append((start, n))
    return regions


def find_run_tables(data):
    """Scan for plausible 11-byte-stride run tables.

    Signature: u16 nruns, u16 nruns (repeated), u16 0, u16 1, 9 bytes,
    then nruns records of [u16 off][u16 fmt][7 aux] with offsets
    strictly increasing and first offset small.
    """
    tables = []
    for m in re.finditer(rb'(..)\1\x00\x00\x01\x00', data, re.S):
        nruns = struct.unpack('<H', m.group(1))[0]
        if not (2 <= nruns <= 2000):
            continue
        base = m.end() + 7  # 7 unknown bytes then records
        nrec = nruns - 1    # run 0 is implicit (offset 0, default format)
        end = base + nrec * 11
        if end > len(data):
            continue
        runs = []
        ok = True
        prev = -1
        for k in range(nrec):
            off, fmt = struct.unpack_from('<HH', data, base + k * 11)
            if off <= prev or fmt == 0:
                ok = False
                break
            prev = off
            runs.append((off, fmt))
        if ok and runs and runs[0][0] < 512:
            tables.append({'pos': m.start(), 'nruns': nruns,
                           'runs': runs, 'end': end})
    return tables


def associate(data, min_text=24, max_gap=64):
    """Pair each run table with the nearest preceding text region that
    it indexes cleanly. Returns list of dicts."""
    regions = find_text_regions(data, min_text)
    tables = find_run_tables(data)
    out = []
    for t in tables:
        cands = [r for r in regions if r[1] <= t['pos'] and
                 t['pos'] - r[1] <= max_gap]
        if not cands:
            continue
        r = cands[-1]
        text = data[r[0]:r[1]]
        maxoff = t['runs'][-1][0]
        if maxoff > len(text):
            # try extending start earlier: text_start = region_end - maxoff…
            continue
        # refine: text may START before the region if leading bytes were
        # binary -- but by construction region is maximal printable.
        out.append({'text_start': r[0], 'text_end': r[1],
                    'text': text, 'table': t})
    return out


# Strong anchors only. Greek: legacy diacritic codes BETWEEN letters
# (kai<, a]rx^?, w$rai) or a letter directly followed by a mark code.
GREEK_ANCHOR = re.compile(r"[a-zA-Z][<>?@#%^&$!]|[\][\"'][a-zA-Z]")
ENGLISH_ANCHOR = re.compile(
    r"\b(the|and|of|to|in|is|are|or|with|for|which|that|will|not|"
    r"before|word|say|breathing|accent|noun|verb|chapter)\b", re.I)


def split_spans(rec):
    text = rec['text'].decode('latin-1')
    runs = rec['table']['runs']
    bounds = [0] + [off for off, _ in runs if off <= len(text)] + [len(text)]
    fmts = [None] + [fmt for off, fmt in runs if off <= len(text)]
    spans = []
    for i in range(len(bounds) - 1):
        spans.append({'off': bounds[i], 'fmt': fmts[i],
                      'text': text[bounds[i]:bounds[i + 1]]})
    return spans


def build_format_map(recs):
    """File-global formatId -> greek/english classification from
    high-confidence span anchors across all recovered records."""
    votes = {}
    for rec in recs:
        for sp in split_spans(rec):
            st = sp['text'].strip()
            if not st or sp['fmt'] is None:
                continue
            g = bool(GREEK_ANCHOR.search(st))
            e = (not g) and bool(re.fullmatch(
                r"[A-Za-z0-9 ,.;:()'\-/&?!\r\n]+", st)) \
                and bool(ENGLISH_ANCHOR.search(st)) and len(st) > 6
            if g:
                votes.setdefault(sp['fmt'], []).append('greek')
            elif e:
                votes.setdefault(sp['fmt'], []).append('english')
    fmap = {}
    for fmt, vs in votes.items():
        g, e = vs.count('greek'), vs.count('english')
        if g > 2 * e:
            fmap[fmt] = 'greek'
        elif e > 2 * g:
            fmap[fmt] = 'english'
        else:
            fmap[fmt] = 'mixed'
    return fmap


def classify_spans(rec, fmap=None):
    spans = split_spans(rec)
    for sp in spans:
        sp['class'] = (fmap or {}).get(sp['fmt'], 'unknown')
    return spans


def main(path, limit=20):
    data = open(path, 'rb').read()
    recs = associate(data)
    fmap = build_format_map(recs)
    print(f'{path}: {len(recs)} text-record/run-table pairs')
    print('format map:', {hex(k): v for k, v in sorted(fmap.items())})
    for rec in recs[:limit]:
        t = rec['table']
        print(f"\n=== text @{rec['text_start']:08x} len={len(rec['text'])} "
              f"runs={t['nruns']} table@{t['pos']:08x}")
        spans = classify_spans(rec, fmap)
        for sp in spans:
            st = sp['text'].replace('\r\n', '\\n')
            if st.strip():
                print(f"  [{sp['class'] or '?':>7}] fmt={sp['fmt'] and hex(sp['fmt'])} "
                      f"off={sp['off']:4d} {st.strip()[:70]!r}")


if __name__ == '__main__':
    main(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 20)
