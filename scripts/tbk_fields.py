#!/usr/bin/env python3
"""tbk_fields.py -- TBK field discovery for the Greek Tutor pipeline.

Companion to scripts/tbk_richtext.py (which recovers per-span
FORMATTING). This module answers the prior question: WHERE are the
fields, and what do they say?

Three entry points, all vectorized so a 1 MB TBK scans in well under a
second (a naive per-offset Python loop over the same file does not
finish inside this environment's tool timeout -- that is why this
exists as a module rather than a snippet):

    regions(data)      maximal printable runs -- the discovery view
    scan(data)         length-prefixed field candidates -- the reading view
    find(data, needle) locate a string and report its enclosing region

WHY BOTH VIEWS. PIPELINE-INSIGHTS Stage 4 requires reading a field by
its u16 length prefix, never by printable region, because a printable
region runs on past the field end into the next record. That rule is
right and stands. But ToolBook does NOT zero a field's buffer when it
rewrites it, so a field's allocated region frequently carries the
STALE TAIL of whatever occupied the buffer before -- in 4_NOUNS2.TBK
the Number topic's buffer still holds chapter-7 adjective prose after
its own text ends. In those cases the length prefix and the region
disagree and NEITHER alone is right.

The rule that resolves it, and it is the only safe one: the prefix
gives the read, the DOSBox screenshot gives the cut. Where a prefix
read ends mid-word, or a region continues past the end of what the
screenshot shows on the page, the assembly takes the screenshot's
boundary and records the raw region alongside it. It never applies a
trailing-garbage heuristic -- Stage 4's corollary is still in force:
if a field needs cleaning, the read is wrong.
"""
import sys
import numpy as np

PRINTABLE_LO, PRINTABLE_HI = 32, 127
_EXTRA = (13, 10, 9)


def _printable_mask(a):
    m = (a >= PRINTABLE_LO) & (a < PRINTABLE_HI)
    for b in _EXTRA:
        m |= (a == b)
    return m


def regions(data, minlen=20):
    """Maximal runs of printable-or-CRLF bytes. Returns [(start, end)]."""
    a = np.frombuffer(data, dtype=np.uint8)
    pr = _printable_mask(a).astype(np.int8)
    d = np.diff(np.concatenate(([0], pr, [0])))
    starts = np.flatnonzero(d == 1)
    ends = np.flatnonzero(d == -1)
    return [(int(s), int(e)) for s, e in zip(starts, ends) if e - s >= minlen]


def scan(data, minlen=8, maxlen=20000, printable_frac=0.98, alpha_frac=0.55):
    """Length-prefixed field candidates.

    A ToolBook field is [len:u16 LE][text: len bytes]. An offset is a
    candidate when its declared length yields a segment that is almost
    entirely printable and reads like prose rather than binary. Shorter
    candidates fully contained in an accepted longer one are dropped.
    Returns [(offset, length, text)].
    """
    a = np.frombuffer(data, dtype=np.uint8)
    n = a.size
    pr = _printable_mask(a)
    al = ((a >= 65) & (a <= 122)) | (a == 32)
    cpr = np.concatenate(([0], np.cumsum(pr, dtype=np.int64)))
    cal = np.concatenate(([0], np.cumsum(al, dtype=np.int64)))
    u16 = a[:-1].astype(np.int64) + (a[1:].astype(np.int64) << 8)
    offs = np.arange(2, n - 2)
    lens = u16[offs - 2]
    ok = (lens >= minlen) & (lens <= maxlen) & (offs + lens <= n)
    offs, lens = offs[ok], lens[ok]
    ok = ((cpr[offs + lens] - cpr[offs] >= printable_frac * lens) &
          (cal[offs + lens] - cal[offs] >= alpha_frac * lens))
    offs, lens = offs[ok], lens[ok]
    order = np.lexsort((-lens, offs))
    offs, lens = offs[order], lens[order]
    keep, covered = [], -1
    for off, ln in zip(offs.tolist(), lens.tolist()):
        if off < covered and off + ln <= covered:
            continue
        keep.append((off, ln, data[off:off + ln].decode('latin-1')))
        covered = max(covered, off + ln)
    return keep


def find(data, needle, minlen=20):
    """Every distinct region containing `needle`. Returns [(start, end, text)]."""
    nb = needle.encode('latin-1') if isinstance(needle, str) else needle
    rs = regions(data, minlen)
    out, i = [], 0
    while True:
        i = data.find(nb, i)
        if i < 0:
            break
        for s, e in rs:
            if s <= i < e:
                hit = (s, e, data[s:e].decode('latin-1'))
                if hit not in out:
                    out.append(hit)
                break
        i += 1
    return out


def field(data, off):
    """Read one length-prefixed field (Stage 4's rule, unchanged)."""
    import struct
    ln = struct.unpack_from('<H', data, off - 2)[0]
    if not (2 < ln < 20000):
        raise ValueError(f'no length prefix at {off:#x} (got {ln})')
    seg = data[off:off + ln]
    if sum(32 <= b < 127 or b in _EXTRA for b in seg) / len(seg) < 0.95:
        raise ValueError(f'field at {off:#x} is not text')
    return seg.decode('latin-1')


def lines(text, n=None):
    """CRLF list field -> stripped non-empty lines, optionally first n.

    A pool field may carry unused TRAILING entries; taking the first n
    is safe because pools are positional. A field SHORTER than expected
    is a hard failure and is never padded.
    """
    ls = [l.strip() for l in text.split('\r\n') if l.strip()]
    if n is not None:
        if len(ls) < n:
            raise ValueError(f'expected {n} lines, got {len(ls)}')
        ls = ls[:n]
    return ls


def _main(argv):
    data = open(argv[1], 'rb').read()
    mode = argv[2] if len(argv) > 2 else 'regions'
    if mode == 'find':
        for s, e, t in find(data, argv[3]):
            print(f'=== {s:#08x}-{e:#08x} len={e - s}')
            print(t.replace('\r\n', '\n  | '))
    elif mode == 'scan':
        for off, ln, t in scan(data):
            print(f'--- {off:#08x} len={ln}')
            print(t.replace('\r\n', '\n  | '))
    else:
        for s, e in regions(data):
            t = data[s:e].decode('latin-1').rstrip()
            if t.strip():
                print(f'=== {s:#08x} {e - s}')
                print(t.replace('\r\n', '\n  | '))


if __name__ == '__main__':
    _main(sys.argv)
