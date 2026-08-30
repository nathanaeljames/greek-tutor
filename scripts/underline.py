"""underline.py -- recover [[u]] runs for a field read by length prefix.

`tbk_richtext.associate()` only pairs a run table with a text region
when the two are within 64 bytes and the region is maximal-printable.
Teaching fields whose buffer carries a stale tail fail both tests, so
this walks forward from the END of the length-prefixed field looking
for the first run table whose offsets all land inside it.

Format id 0x62e is UNDERLINE against a 0x502 body; 0x6d0 is Greek and
0x594 the page heading. Verified across all three chapter TBKs.
"""
import re

import tbk_fields as _tbk_fields
import struct
import sys

UNDERLINE_FMT = 0x62e


def field(data, off):
    ln = struct.unpack_from('<H', data, off - 2)[0]
    return data[off:off + ln].decode('latin-1'), ln


def run_tables(data, lo, hi):
    out = []
    for pos in range(lo, hi - 4):
        nruns = struct.unpack_from('<H', data, pos)[0]
        if not (2 <= nruns <= 80):
            continue
        base, runs, prev, ok = pos + 2, [], -1, True
        if base + nruns * 11 > len(data):
            continue
        for k in range(nruns):
            o, fmt = struct.unpack_from('<HH', data, base + k * 11)
            if o <= prev or fmt == 0 or fmt > 0x4000:
                ok = False
                break
            prev = o
            runs.append((o, fmt))
        if ok and runs and runs[0][0] < 8:
            out.append((pos, runs))
    return out


def spans(data, off, search=4096):
    text, ln = field(data, off)
    for pos, runs in run_tables(data, off + ln, off + ln + search):
        if runs[-1][0] <= ln:
            bounds = [0] + [o for o, _ in runs] + [ln]
            fmts = [None] + [f for _, f in runs]
            return [(bounds[i], bounds[i + 1], fmts[i])
                    for i in range(len(bounds) - 1)]
    return None


def marked(data, off):
    """The field text with SENTINELS around every underlined run.

    \x02 / \x03 rather than [[u]] / [[/u]]: the markers have to survive
    the font conversion, and a literal '[' followed by a letter is a
    legacy smooth-breathing sequence that the converter would eat.
    Call unmark() after converting.
    """
    text, ln = field(data, off)
    sp = spans(data, off)
    if not sp:
        return None
    out = []
    for a, b, fmt in sp:
        chunk = text[a:b]
        if fmt == UNDERLINE_FMT and chunk.strip():
            lead = len(chunk) - len(chunk.lstrip())
            trail = len(chunk) - len(chunk.rstrip())
            out.append(chunk[:lead] + '\x02' + chunk.strip() + '\x03'
                       + (chunk[len(chunk) - trail:] if trail else ''))
        else:
            out.append(chunk)
    return ''.join(out)


DIACRITIC = re.compile(r"[a-zA-Z][<>?@#%^&$!]|[\]\[][a-zA-Z]|[a-zA-Z][\]\[]")


# Whole-word English markers. A legacy-Greek run is notation -- single
# letters, rule lines, "--" separators -- and never contains two of these.
_EN = re.compile(r'(?<![A-Za-z])(?:the|and|are|with|from|that|this|will|'
                 r'was|were|for|not|but|verb|stem|form|forms|ending|endings|'
                 r'aorist|present|future|tense|augment|added|before|after|'
                 r'when|which|they|their|there|have|has|been|its|it)'
                 r'(?![A-Za-z])', re.I)


def _run_vote(chunk):
    """GREEK, ENGLISH or ABSTAIN for one formatted run.

    Three-way, not two-way. The old two-way vote counted every
    diacritic-free run as ENGLISH, which buried the Greek format under
    its own notation: chapter 14's Greek format carries 35 accented runs
    and 28 runs that are single letters, "--" separators and rule lines
    such as "a + e = h". Those 28 are Greek NOTATION, not English, and
    counting them as English kept the format below the majority bar --
    so `sa`, `qh`, `lu`, `diwk` and `graf` shipped as roman letters in
    chapters 14, 15 and 16. A run now votes ENGLISH only on positive
    evidence: two or more whole English words. Everything else abstains.
    """
    if DIACRITIC.search(chunk):
        return 'GREEK'
    if len(_EN.findall(chunk)) >= 2:
        return 'ENGLISH'
    return 'ABSTAIN'


def vote_greek_fmts(data, offsets=None):
    """Format ids that are GREEK, voted across every field in the file.

    Voted over the CURATED teaching offsets, not the whole file: format
    ids are reused across pages, and a stale buffer holding English under
    the same id would veto a genuine Greek format.
    """
    votes, texts = {}, {}
    for off in offsets:
        sp = spans(data, off)
        if not sp:
            continue
        text, _ = field(data, off)
        for a, b, fmt in sp:
            chunk = text[a:b].strip()
            if fmt is None or not chunk:
                continue
            texts.setdefault(fmt, []).append(chunk)
            g, e = votes.get(fmt, (0, 0))
            v = _run_vote(chunk)
            if v == 'GREEK':
                votes[fmt] = (g + 1, e)
            elif v == 'ENGLISH':
                votes[fmt] = (g, e + 1)
            else:
                votes.setdefault(fmt, (g, e))
    # A format is Greek when it carries accented Greek and NO English
    # prose. Abstentions are silent on both sides.
    greek = {fmt for fmt, (g, e) in votes.items() if g >= 1 and e == 0}
    # A format whose every run is a SHORT all-lowercase token and which
    # never votes either way is notation, and notation in these fields is
    # Greek: chapter 15's suffixed sigma appears only as the two-letter
    # run "sa", under a format that carries nothing else anywhere. The
    # length and case test keeps headings ("Introduction"), continuation
    # markers ("(cont.)") and glosses ("(I saw)") out, and the underline
    # format is excluded outright.
    for fmt, (g, e) in votes.items():
        if g or e or fmt == UNDERLINE_FMT or fmt in greek:
            continue
        runs = texts.get(fmt, [])
        if runs and all(re.fullmatch(r'[a-z]{1,4}[.,;:]?', r) for r in runs):
            greek.add(fmt)
    return greek


def vote_greek_fmts_legacy(data, offsets):
    """Format ids that are GREEK, voted across MANY fields at once.

    A per-field vote misses a run that happens to carry no diacritic --
    the chapter-8 Enclitics page lists "mou, moi, me, sou, soi, se",
    every one of them accentless. Voting across every teaching field in
    the chapter catches it, because the same format id carries accented
    Greek elsewhere. The vote is a MAJORITY of runs, so one English run
    that happens to match the diacritic pattern cannot flip a format.
    """
    votes, texts = {}, {}
    for off in offsets:
        sp = spans(data, off)
        if not sp:
            continue
        text, _ = field(data, off)
        for a, b, fmt in sp:
            chunk = text[a:b].strip()
            if fmt is None or not chunk:
                continue
            g, e = votes.get(fmt, (0, 0))
            if DIACRITIC.search(chunk):
                votes[fmt] = (g + 1, e)
            else:
                votes[fmt] = (g, e + 1)
    # MAJORITY, not any-occurrence. A single English run can look Greek
    # by accident -- "Elijah?" contains a letter followed by '?', which
    # is exactly the legacy circumflex sequence -- and voting on one
    # sighting turned the entire English body format into Greek.
    return {fmt for fmt, (g, e) in votes.items() if g > 2 * e}


def marked_greek(data, off, greek_fmts=None):
    """Field text with underline runs sentinelled \x02/\x03 AND Greek
    runs sentinelled \x04/\x05.

    Token heuristics cannot see an accentless enclitic -- `mou`, `moi`,
    `me`, `sou`, `soi`, `se` carry no diacritic code and are spelled
    with plain Latin letters, and `me` is also an English word that
    appears on the very same line as its own gloss. The RUN TABLE can:
    Greek and English are always different format ids. So vote each
    format id Greek if any run carrying it holds a diacritic anywhere
    in this field, then mark every run with that id.
    """
    text, ln = field(data, off)
    sp = spans(data, off)
    if sp is None:
        return None
    if greek_fmts is None:
        greek_fmts = {fmt for a, b, fmt in sp
                      if fmt is not None and DIACRITIC.search(text[a:b])}
    out = []
    for a, b, fmt in sp:
        chunk = text[a:b]
        if not chunk.strip():
            out.append(chunk)
            continue
        lead = len(chunk) - len(chunk.lstrip())
        trail = len(chunk) - len(chunk.rstrip())
        core = chunk.strip()
        if fmt in greek_fmts:
            core = '\x04' + core + '\x05'
        if fmt == UNDERLINE_FMT:
            core = '\x02' + core + '\x03'
        out.append(chunk[:lead] + core
                   + (chunk[len(chunk) - trail:] if trail else ''))
    return ''.join(out)


def unmark(text):
    return (text.replace('\x02', '[[u]]').replace('\x03', '[[/u]]')
            .replace('\x04', '').replace('\x05', ''))


if __name__ == '__main__':
    data = open(sys.argv[1], 'rb').read()
    for a in sys.argv[2:]:
        off = int(a, 16)
        m = marked(data, off)
        print('=== %#x' % off)
        print(unmark(m) if m else '  (no run table found)')
