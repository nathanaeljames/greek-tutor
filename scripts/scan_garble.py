#!/usr/bin/env python3
"""scan_garble.py -- Stage 8 HUMAN-READ report, not a gate.

    scan_garble.py src/data/chapt-13.json [more...]

Two detectors, both adopted from the round-21 implementer's scanners
(5I-SPEC1-BUILD-OPUS.md 3.6) after they caught fourteen defects the
build-time gates did not see.

  1. SWALLOWED PANEL -- a `para` whose text contains, verbatim, a string
     that a sibling structured block in the same `content[]` also holds.
     That is the signature of a field whose chart rows collapsed into the
     lead paragraph, so the page prints the panel twice: once garbled as
     prose, once correctly as the chart.

  2. GARBLE -- a romanised run standing where Greek belongs: adjacent to
     `+` or `=`, or alone beside Greek.

READ THE OUTPUT; DO NOT GATE ON IT. Over chapters 1-12 the single-letter
pattern flags legitimate English -- `the "p" in Peter`, `Machen, p. 9` --
at a rate that is fine for review and fatal for a pass/fail check. Exit
status is always 0 for that reason.
"""
import json
import re
import sys

PAT = re.compile(
    r'(?:[A-Za-z]{1,6}\s*[+=]|[+=]\s*[A-Za-z]{1,6})(?![A-Za-z]*[a-z]{4})')
PAREN = re.compile(r'\(\s*[a-z]\s*(?:,|and)\s*[a-z]\s*[,)]')
TOKENS = re.compile(r'(?<![A-Za-z])(qh[a-z]?|sa|lu|diwk|graf|luw)(?![A-Za-z])')
SINGLE = re.compile(
    r'(?<![A-Za-z0-9\u0370-\u03ff\u1f00-\u1fff"\'])'
    r'([bcdfghjklmnpqrstuvwxyz])'
    r'(?![A-Za-z0-9\u0370-\u03ff\u1f00-\u1fff"\'.])')
GREEK = re.compile(r'[\u0370-\u03ff\u1f00-\u1fff]')

# audio ids are not displayed copy and legitimately contain luw, lu, sa
SKIP_KEYS = {'audio', 'audioFull', 'titleAudio', 'id', 'audioMap',
             'noteAudioMap', 'hintRef', 'popupRef', 'spellerTilesRef',
             'translit', 'pool', 'poolKind', 'mode', 'type', 'layout',
             'switch'}


def displayed(node, path='', out=None):
    """Every displayed string, with its path. Provenance keys skipped."""
    if out is None:
        out = []
    if isinstance(node, dict):
        for k, v in node.items():
            if k.startswith('_') or k in SKIP_KEYS:
                continue
            displayed(v, f'{path}/{k}', out)
    elif isinstance(node, list):
        for i, v in enumerate(node):
            displayed(v, f'{path}/{i}', out)
    elif isinstance(node, str):
        out.append((path, node))
    return out


def swallowed_panels(doc):
    """Paragraphs that contain a sibling structured block's own text."""
    hits = []

    def walk(node, path=''):
        if isinstance(node, dict):
            for k, v in node.items():
                if k == 'content' and isinstance(v, list):
                    paras = [(i, b) for i, b in enumerate(v)
                             if isinstance(b, dict) and b.get('type') == 'para']
                    others = [b for b in v
                              if isinstance(b, dict) and b.get('type') != 'para']
                    strings = set()
                    for b in others:
                        for _p, s in displayed(b):
                            if len(s.strip()) >= 4:
                                strings.add(s.strip())
                    for i, b in paras:
                        text = b.get('text', '')
                        for s in strings:
                            if s in text:
                                hits.append((f'{path}/content/{i}', s, text))
                                break
                if not k.startswith('_'):
                    walk(v, f'{path}/{k}')
        elif isinstance(node, list):
            for i, v in enumerate(node):
                walk(v, f'{path}/{i}')
    walk(doc)
    return hits


def garbles(doc):
    hits = []
    for path, s in displayed(doc):
        why = []
        if PAT.search(s):
            why.append('adjacent to +/=')
        if PAREN.search(s):
            why.append('bare letter pair in parens')
        if TOKENS.search(s):
            why.append('known romanised token')
        if GREEK.search(s) and SINGLE.search(s):
            why.append('single roman letter beside Greek')
        if why:
            hits.append((path, s, ', '.join(why)))
    return hits


def main():
    for f in sys.argv[1:]:
        doc = json.load(open(f, encoding='utf-8'))
        sw = swallowed_panels(doc)
        gb = garbles(doc)
        print(f'=== {f}')
        print(f'    swallowed panels: {len(sw)}   garble candidates: '
              f'{len(gb)}')
        for path, s, text in sw:
            print(f'    PANEL {path}\n          repeats {s[:70]!r}\n'
                  f'          in     {text[:90]!r}')
        for path, s, why in gb:
            print(f'    GARBLE {path}  [{why}]\n           {s[:110]!r}')
    print('\nHuman-read report. Triage the output; do NOT gate on it.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
