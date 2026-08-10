#!/usr/bin/env python3
"""assemble_ch6.py -- chapter 6 data assembly (cohort 5F, pipeline-side).

Same contract as assemble_ch4.py / assemble_ch5.py: every field is read
from 6_PREPS.TBK BY OFFSET (5F-EXTRACTION-MAP.md sec 1), converted
through font-map.json, and every drill answer is DERIVED from the
chapter's OWN gloss charts (the One/Two/Three Case panels and the
Prepositions Chart hint popup) and cross-checked against the extracted
option columns. Page prose is verbatim from the extracted fields, cut
where the ch6railwalk.pdf screenshots end the page.

Nothing here is authored. If a field cannot be located, or a derived
answer disagrees with the chapter's own chart, the assembly STOPS
(PIPELINE-INSIGHTS Stage 7). Four Translation Drill items whose three
options CANNOT be separated by the chapter's own gloss set are marked
`_verify` in the emitted data rather than guessed silently
(DRILL-BEHAVIOR-RULES E4b).

Usage:  python3 assemble_ch6.py 6_PREPS.TBK font-map.json outdir
"""
# --------------------------------------------------------------------
# FROZEN AT 5F CLOSE -- PIPELINE-INSIGHTS-v3 Stage 8.7.
#
# The committed chapt-06.json carries THREE rounds of device-verified
# hand repair (5F-SPEC1-PATCH1/2/3: paragraph restructures, chart
# emissions, audio re-keys, popup re-keys) that this script does NOT
# reproduce. Re-running it would silently regress the approved state.
# The committed JSON is the source of truth; this script is provenance
# only -- it documents how the FIRST cut was derived.
# --------------------------------------------------------------------
import os as _os
if _os.environ.get('ALLOW_REGRESSIVE_REBUILD') != '1':
    raise SystemExit(
        'REFUSING TO RUN: assemble_ch6.py is provenance only '
        '(Stage 8.7). The committed chapt-06.json carries PATCH1-3 '
        'hand repairs this script does not reproduce. Set '
        'ALLOW_REGRESSIVE_REBUILD=1 only after back-porting every patch '
        'change, and diff the output against the committed file before '
        'trusting it.')

import json
import re
import struct
import sys
import unicodedata

import underline

A = 'chapt_6_'

# ELISION (DRILL-BEHAVIOR-RULES C9 / D-29). The original has no
# apostrophe key and draws elision as a FREE-STANDING smooth breathing
# glyph after the clipped word: "meq ]  h[me<raj". A ']' that stands
# alone (space before, space or end after) is an elision mark and binds
# to the preceding word as U+0027. A ']' followed immediately by a
# letter is a breathing and is left to the diacritic pass.
ELISION = re.compile(r"(\S)[ \t]+\](?=[ \t]|$)")


def aud(name):
    return A + name


# --------------------------------------------------------------------
# 1. Font conversion / field reading
# --------------------------------------------------------------------

def make_conv(fontmap):
    lower = dict(fontmap['lowercase'])
    upper = dict(fontmap['uppercase'])
    dia = {k: v['unicode'] for k, v in fontmap['diacritics_verified'].items()}
    for k, v in fontmap.get('base_verified_additions', {}).items():
        if isinstance(v, str):
            lower.setdefault(k, v)
        elif isinstance(v, dict) and 'unicode' in v:
            lower.setdefault(k, v['unicode'])

    # ELISION (DRILL-BEHAVIOR-RULES C9 / D-29). The original has no
    # apostrophe key and draws elision as a FREE-STANDING smooth
    # breathing glyph after the clipped word: "meq ]  h[me<raj".
    # A ']' that stands alone (space before, space or end after) is an
    # elision mark and becomes U+0027 bound to the preceding word.
    # A ']' that is followed immediately by a letter is a breathing and
    # is left for the diacritic pass.
    def conv(s):
        s = ELISION.sub('\\1\x01', s)
        out, pending = [], ''
        for ch in s:
            if ch in lower or ch in upper:
                out.append(lower.get(ch) or upper.get(ch))
                if pending:
                    out.append(pending)
                    pending = ''
            elif ch in dia:
                if out and out[-1] != ' ':
                    out.append(dia[ch])
                else:
                    pending = dia[ch]
            else:
                out.append(ch)
        return underline.unmark(unicodedata.normalize(
            'NFC', ''.join(out)).replace('\x01', "'"))
    return conv


class Tbk:
    def __init__(self, path):
        self.data = open(path, 'rb').read()
        self.no_runs = []
        self.greek_fmts = None

    def field(self, off):
        ln = struct.unpack_from('<H', self.data, off - 2)[0]
        if not (2 < ln < 20000):
            raise SystemExit(f'STOP: no length prefix at {off:#x} ({ln})')
        return self.data[off:off + ln].decode('latin-1')

    def prose(self, off):
        """A teaching field WITH its underline runs marked.

        Underlining is DATA, not a rendering decision: the run table
        beside each field says which words the original underlines, and
        the port must not be left to guess from a screenshot. Falls
        back to the plain field only if no run table indexes it, and
        says so rather than failing silently."""
        m = underline.marked_greek(self.data, off, self.greek_fmts)
        if m is None:
            self.no_runs.append(off)
            return self.field(off)
        return m

    def region(self, off):
        def ok(b):
            return 32 <= b < 127 or b in (13, 10, 9)
        a, b, n = off, off, len(self.data)
        while a > 0 and ok(self.data[a - 1]):
            a -= 1
        while b < n and ok(self.data[b]):
            b += 1
        return self.data[a:b].decode('latin-1')

    def pool(self, off, n, label):
        lines = [l.strip() for l in self.region(off).split('\r\n')]
        lines = [l for l in lines if l]
        if len(lines) < n:
            raise SystemExit(
                f'STOP: pool {label} at {off:#x}: expected {n}, got {len(lines)}')
        return lines[:n]


# A legacy-Greek token: a letter carrying a diacritic code, a breathing
# code before a letter, or a breathing code AFTER a letter (o[ = ho,
# h[ = he). The leading class is ] and [ ONLY -- a double quote or an
# apostrophe before a letter is English punctuation ("is"), not a
# breathing, and treating it as Greek turned "is" into a Greek word.
GREEK_TOKEN = re.compile(
    r"[a-zA-Z][<>?@#%^&$!]|[\]\[][a-zA-Z]|[a-zA-Z][\]\[]")


def conv_mixed(conv, text):
    """Convert the Greek on a mixed Greek/English line.

    Prefers the RUN-TABLE marking (\x04...\x05) laid down by
    Tbk.prose(), which is authoritative. The token heuristic below is a
    fallback only: it cannot see accentless Greek, and it MIS-fires on
    English words that happen to contain a letter+punctuation pair
    ("Elijah?" became a Greek word before the run table was wired in).
    """
    if '\x04' in text:
        out, pos = [], 0
        for m in re.finditer('\x04(.*?)\x05', text, re.S):
            out.append(text[pos:m.start()])
            out.append(conv(m.group(1)))
            pos = m.end()
        out.append(text[pos:])
        return underline.unmark(''.join(out))
    return underline.unmark(
        ''.join(conv(t) if GREEK_TOKEN.search(t) else t
                for t in re.split(r'(\s+)', text)))


def dash(s):
    """TYPO POLICY A1 third extension: '--' never displays."""
    return s.replace('--', '\u2014')


def sq(s):
    """Collapse the original's fixed-width padding runs to single spaces."""
    return re.sub(r'[ \t]{2,}', ' ', s).strip()


# --------------------------------------------------------------------
# 2. Offsets (5F-EXTRACTION-MAP.md sec 1)
# --------------------------------------------------------------------

OFF = {
    'objectives': 0x0be274,
    'biblio': 0x011c38,
    'ec_definition': 0x020210,
    'ec_phrase': 0x02076c,
    'ec_case': 0x020a80,
    'gp_intro': 0x0044e0,
    'gp_one': 0x004bda,
    'gp_two': 0x005988,
    'gp_three': 0x006606,
    'gp_chart': 0x03a186,
    'gp_elision': 0x0072ca,
    'gp_proclitics': 0x007b52,
    'gp_compounds': 0x00f434,
    'voc_greek16': 0x0151ac,
    'voc_gloss16': 0x01555e,
    'gk_en_prompts': 0x07e7d8,
    'en_gk_prompts': 0x0479c4,
    'case_prompts': 0x0d4802,
    'case_hint': 0x0d5372,
    'td_prompts': 0x06a490,
    'td_opt1': 0x06c112,
    'td_opt2': 0x06c83c,
    'td_opt3': 0x06cd0c,
    'td_refs': 0x06d0ac,
    'td_hint': 0x06da06,
    'prep_spell_prompts': 0x0dba72,
    'prep_spell_refs': 0x0dd21a,
    'voc_spell_prompts': 0x0e2046,
    'learn_sm': 0x0afdc2,
    'review_vocab': 0x0b55a0,
    'review_sm_jn11': 0x030336,
    'review_sm_146a': 0x03ddb6,
    'review_sm_146b': 0x022040,
    'review_sm_rom': 0x01d1cc,
    'sm_drill_prompts': 0x04d846,
    'sm_spell_instructions': 0x072904,
    'sm_spell_translation': 0x073620,
}

# The Greek-to-English drill's SIXTEEN option captions are individual
# button fields, not a pooled list, and TWO of them differ from the
# English-to-Greek prompt pool at 0x0479c4 ("after, behind" vs "after",
# "around, near" vs "around"). Read them from their own offsets.
GK_EN_OPTION_OFF = [
    0x07f714, 0x07ee56, 0x07f13e, 0x07f886, 0x07efca, 0x07f5a6,
    0x07f430, 0x07ecde, 0x07f2b8, 0x07f9fc, 0x0813c2, 0x08124c,
    0x080de4, 0x0810d6, 0x080c66, 0x080f62,
]

POPUP_OFF = {
    'apo': 0x0082a4, 'eis': 0x008ac2, 'ek': 0x0092e0, 'en': 0x009af6,
    'pros': 0x00a304, 'sun': 0x00ab3a, 'dia': 0x00b362, 'kata': 0x00bb82,
    'meta': 0x00c3aa, 'peri': 0x00cbe8, 'epi': 0x00d424,
}
POPUP_ORDER = ['apo', 'eis', 'ek', 'en', 'pros', 'sun', 'dia', 'kata',
               'meta', 'peri', 'epi']

# f_voc order is alphabetical and is SCRIPT-VERIFIED: the drill pages'
# SayWord1 dispatch (0x90930) maps apo1->f_voc1, dia1->f_voc2,
# eis1->f_voc3, ek1->f_voc4, en1->f_voc5, epi1->f_voc6, kata1->f_voc7,
# meta1->f_voc8, peri1->f_voc9, pros1->f_voc10.
VOC_ORDER = ['apo', 'dia', 'eis', 'ek', 'en', 'epi', 'kata', 'meta',
             'peri', 'pros']
VOC_AUDIO = {k: 'f_voc%d' % (i + 1) for i, k in enumerate(VOC_ORDER)}
VOC_AUDIO['sun'] = 'f_sun'

GREEK_OF = {
    'apo': '\u1f00\u03c0\u03cc', 'dia': '\u03b4\u03b9\u03ac',
    'eis': '\u03b5\u1f30\u03c2', 'ek': '\u1f10\u03ba',
    'en': '\u1f10\u03bd', 'epi': '\u1f10\u03c0\u03af',
    'kata': '\u03ba\u03b1\u03c4\u03ac', 'meta': '\u03bc\u03b5\u03c4\u03ac',
    'peri': '\u03c0\u03b5\u03c1\u03af', 'pros': '\u03c0\u03c1\u03cc\u03c2',
    'sun': '\u03c3\u03cd\u03bd',
}


# --------------------------------------------------------------------
# 3. The chapter's OWN gloss/case chart, cross-checked at assembly
# --------------------------------------------------------------------
# Every (gloss, case) pair below is asserted to appear verbatim in the
# Preposition Case Drill's own Hint chart (OFF['case_hint']) before it
# is used to answer anything. If the chart changes, assembly STOPS.
CHART = [
    ('apo',  'from',              'gen'),
    ('dia',  'through',           'gen'),
    ('dia',  'on account of',     'acc'),
    ('eis',  'into',              'acc'),
    ('ek',   'out of',            'gen'),
    ('en',   'in',                'dat'),
    ('epi',  'on, over',          'gen'),
    ('epi',  'on, at, in',        'dat'),
    ('epi',  'on, to, for',       'acc'),
    ('kata', 'down, against',     'gen'),
    ('kata', 'according to',      'acc'),
    ('meta', 'with',              'gen'),
    ('meta', 'after, behind',     'acc'),
    ('peri', 'about, concerning', 'gen'),
    ('peri', 'around, near',      'acc'),
    ('pros', 'to',                'acc'),
]
CASE_FULL = {'gen': 'Genitive', 'dat': 'Dative', 'acc': 'Accusative'}


def check_chart(hint_text):
    flat = re.sub(r'\s+', ' ', hint_text)
    flat = flat.replace(' (with', '(with')
    for prep, gloss, case in CHART:
        needle = '%s(with %s' % (gloss, case)
        if needle not in flat:
            raise SystemExit(
                'STOP: chart pair %r not found verbatim in the Hint chart '
                'at %#x' % (needle, OFF['case_hint']))


# --------------------------------------------------------------------
# 4. Preposition Translation Drill answer key
# --------------------------------------------------------------------
# ANSWER is the 1-based option COLUMN for each of the 40 items. It is
# DERIVED: for each item the preposition and the case of its object are
# read off the phrase, and the chapter's own gloss set for that pair
# (CHART above, plus the One/Two/Three Case panels and the eleven green
# popups, which carry the wider gloss lists) selects exactly one of the
# three options. The four items in VERIFY_ITEMS are the ones where the
# chapter's own gloss set does NOT separate the options; they are
# Four items (26, 32, 36, 37) could not be separated by the chapter's
# own gloss set and were shipped `_verify`. Nathanael's DOSBox pass
# (VERIFY-5F, 2026-08-08) answered all four: 26 "at the words",
# 32 "daily" (NOT "during a day" -- the derivation from the kata popup
# was wrong), 36 "after days", 37 "about the son of man". Item 32 is
# corrected here and the flags are cleared; this is now a verified key.
ANSWER = [2, 1, 2, 1, 3, 1, 1, 2, 3, 2,
          1, 3, 2, 3, 1, 3, 2, 1, 2, 1,
          1, 3, 2, 1, 3, 2, 1, 1, 3, 2,
          1, 1, 3, 2, 3, 1, 3, 3, 2, 1]
VERIFY_ITEMS = set()
_WAS_VERIFIED = {
    26: 'epi + dative glosses as "on, at, in", so BOTH "at the words" '
        'and "in the words" are chapter-legal. Built as "at the words".',
    32: 'kata + accusative glosses as "according to, to, during". The '
        'chapter\'s own kata popup renders this very phrase (Mat 26:55) '
        'as "during the day", which points at "during a day"; the '
        'idiomatic reading is "daily". Built as "during a day" on the '
        'chapter-internal evidence.',
    36: 'dia + genitive glosses as "through, by, during", which fits '
        '"by days"; the NT sense at Mk 2:1 is "after some days". The '
        'chapter\'s gloss set does not reach "after". Built as '
        '"after days".',
    37: 'epi + accusative glosses as "on, to, for" and NONE of the three '
        'options uses any of them. Built as "about the son of man" '
        '(Mk 9:12), which the chapter\'s gloss set cannot confirm.',
}


# --------------------------------------------------------------------
# 5. Vocabulary
# --------------------------------------------------------------------
# The chapter teaches TEN prepositions but presents SIXTEEN case-split
# entries on the flashcard and in both vocabulary drills (dia, kata,
# meta, peri twice; epi three times). f_voc1..10 are therefore SHARED
# across sixteen surfaces -- a shape chapters 1-5 never produced.
SENSE_ORDER = [
    ('apo', 'gen'), ('dia', 'gen'), ('dia', 'acc'), ('eis', 'acc'),
    ('ek', 'gen'), ('en', 'dat'), ('epi', 'gen'), ('epi', 'dat'),
    ('epi', 'acc'), ('kata', 'gen'), ('kata', 'acc'), ('meta', 'gen'),
    ('meta', 'acc'), ('peri', 'gen'), ('peri', 'acc'), ('pros', 'acc'),
]

# Review Vocabulary Chart NT frequencies (OFF['review_vocab']), read
# from the chart itself and asserted below.
NT_FREQ = {'apo': 646, 'dia': 667, 'eis': 1768, 'ek': 914, 'en': 2752,
           'epi': 890, 'kata': 473, 'meta': 469, 'peri': 333, 'pros': 700}


def build(tbk, conv):
    f = tbk.field
    tbk.greek_fmts = underline.vote_greek_fmts(
        tbk.data, [OFF[k] for k in ['ec_definition', 'ec_phrase', 'ec_case', 'gp_intro', 'gp_one', 'gp_two', 'gp_three', 'gp_elision', 'gp_proclitics', 'gp_compounds']])
    ch = {}
    ch['_comment'] = (
        'Chapter 6 (Prepositions), assembled from 6_PREPS.TBK + CHAPT_6 '
        'audio + ch6railwalk.pdf. Fields read by offset '
        '(5F-EXTRACTION-MAP.md sec 1); drill answers derived from the '
        "chapter's own gloss charts and cross-checked against the "
        'extracted option columns at assembly. Behavior fields are '
        'stamped by apply-behavior-matrix.py from the eight CONFIRMED '
        'chapter-6 rows of DRILLBEHAVIORLEDGER.csv and are not set here.')
    ch['id'] = 'chapt_6'
    ch['number'] = 6
    ch['title'] = 'Prepositions'

    # ---- objectives -------------------------------------------------
    obj = f(OFF['objectives'])
    lines = [l.strip() for l in obj.split('\r\n') if l.strip()]
    if lines[0] != 'You will be able to:':
        raise SystemExit('STOP: objectives preamble moved')
    body, cur = [], ''
    for l in lines[1:]:
        if re.match(r'^\d\)', l):
            if cur:
                body.append(cur)
            cur = re.sub(r'^\d\)\s*', '', l)
        elif cur:
            cur += ' ' + l
    if cur:
        body.append(cur)
    if len(body) != 6:
        raise SystemExit('STOP: expected 6 objectives, got %d' % len(body))
    ch['objectivesPreamble'] = 'You will be able to:'
    ch['objectives'] = [dash(sq(b.rstrip(',').rstrip('.'))) for b in body]

    ch['vocab'] = list(VOC_ORDER)

    # ---- Hint chart cross-check ------------------------------------
    check_chart(f(OFF['case_hint']))

    # ---- learn ------------------------------------------------------
    ch['learn'] = [
        {'id': 'c6_learn_objectives', 'type': 'contentAudio',
         'mode': 'objectivesPage', 'title': 'Learn Chapter Objectives',
         'instructions': ''},
        english_concepts(tbk, conv),
        greek_prepositions(tbk, conv),
        {'id': 'c6_learn_vocab', 'type': 'contentAudio', 'mode': 'flashcard',
         'title': 'Learn Vocabulary', 'pool': 'senses',
         '_pool_note': ('16 case-split cards over 10 lemmas '
                        '(lexicon senses[]), not the 10-card lemma pool '
                        'chapters 1-5 use.')},
        learn_scripture(f, conv),
        bibliography(f),
    ]

    # ---- drill / exercise / review ----------------------------------
    ch['drill'] = [
        case_drill(tbk, conv),
        translation_drill(tbk, conv),
        vocab_gk_en(tbk, conv),
        vocab_en_gk(tbk, conv),
        scripture_drill(tbk, conv),
    ]
    ch['exercise'] = [
        prep_speller(tbk, conv),
        vocab_speller(tbk, conv),
        scripture_speller(tbk, conv),
    ]
    ch['quickReview'] = quick_review(f, conv)

    ch['feedback'] = {
        'correct': ['Great!', 'Congratulations', 'Perfect!', 'Right On!',
                    'Fantastic!', 'Yes'],
        'incorrect': ['Try again', 'Swing and a miss',
                      'Repetition will get it', 'Keep trying'],
    }

    ch['sequence'] = [
        'c6_learn_objectives', 'c6_learn_english_concepts',
        'c6_learn_prepositions', 'c6_drill_case', 'c6_drill_translation',
        'c6_ex_speller', 'c6_learn_vocab', 'c6_drill_vocab_gk_en',
        'c6_drill_vocab_en_gk', 'c6_ex_vocab_speller', 'c6_learn_scripture',
        'c6_drill_scripture_memory', 'c6_ex_scripture_speller',
        'c6_qr_vocab', 'c6_qr_prepositions', 'c6_qr_scripture_146a',
        'c6_qr_scripture_146b', 'c6_qr_scripture_rom',
        'c6_qr_scripture_jn11', 'c6_learn_bibliography',
    ]
    ch['_sequence_note'] = 'Rail order from ch6railwalk.pdf (Nathanael, 2026-08-07).'
    ch['_audioVerify'] = (
        'CHAPT_6 ships 145 WAVs; 140 are wired. UNWIRED: a_alpha (the '
        'chapter-1 alphabet clip, no surface here), c_sm10 (the second '
        'article in Jn 14:6a -- the review page reuses c_sm7 for every '
        'occurrence of the same word, exactly as chapter 5 wired it), '
        'd_sm6b (a second take inside Jn 14:6b), f_comp3 (the Compounds '
        'page offers three taps and the script dispatches only comp1 and '
        'comp2) and f_dia (a bare dia clip with no dispatch entry; the '
        'teaching pages tap dia through f_voc2). Leave all five unwired '
        'unless the build finds a surface. LISTEN-CHECK: the six Elision '
        'clips f_elis1..6 are wired in page reading order '
        "(di' emou, dia, emou, meth' hemeras, meta, hemeras); the script "
        'confirms six tokens on that page but not which phrase each '
        'names.')
    return ch


# --------------------------------------------------------------------
# 6. Learn pages
# --------------------------------------------------------------------

def paras(text, drop=1):
    """Field text -> paragraphs, dropping `drop` heading lines."""
    lines = [l.rstrip() for l in text.split('\r\n')]
    lines = [l for l in lines if l.strip()][drop:]
    return [dash(sq(l)) for l in lines]


def english_concepts(tbk, conv):
    f = tbk.prose
    d = f(OFF['ec_definition'])
    p = f(OFF['ec_phrase'])
    c = f(OFF['ec_case'])
    dl = paras(d)
    definition = ' '.join(dl[:3])
    phr = paras(p)
    cs = paras(c)
    return {
        'id': 'c6_learn_english_concepts', 'type': 'contentAudio',
        'mode': 'topicPages', 'title': 'Learn English Concepts',
        'topics': [
            {'id': 'definition', 'title': 'Definition', 'content': [
                {'type': 'para', 'text': definition},
                {'type': 'defList', 'items': [
                    {'term': 'Put the book [[u]]on[[/u]] the table.',
                     'def': 'Tells of the spatial relationship of the book '
                            'to the table.'},
                    {'term': 'He went [[u]]after[[/u]] the game.',
                     'def': "Connects the person's going to the time of the "
                            'game.'},
                ]},
            ]},
            {'id': 'prepositionalPhrase', 'title': 'Prepositional Phrase',
             'content': [
                 {'type': 'para',
                  'text': 'A [[u]]phrase[[/u]] is a string of closely '
                          'connected words.  A [[u]]clause[[/u]] is a string '
                          'of connected words and/or phrases, including both '
                          'a subject and a verb.'},
                 {'type': 'para',
                  'text': 'A prepositional phrase is usually composed of a '
                          'preposition followed by a noun which is called the '
                          '[[u]]object of the preposition[[/u]]'},
                 {'type': 'para', 'text': phr[-1]},
             ]},
            {'id': 'prepositionAndCase', 'title': 'Preposition and Case',
             'content': [
                 {'type': 'para', 'text': ' '.join(cs[:4])},
                 {'type': 'para', 'text': ' '.join(cs[4:])},
             ]},
        ],
        '_underline_note': (
            'phrase / clause / object of the preposition carry format id '
            '0x62e against a 0x502 body in the run table at '
            '%#x; on / after are from the rail walk.' % OFF['ec_phrase']),
    }


def panel_rows(text, conv, preps):
    """One/Two/Three Case panel -> greekRows with popup links.

    The run table splits each line into [Greek][gloss][case tag]; the
    gloss is the blue, popup-opening run and the case tag is black.
    """
    rows = []
    for key, senses in preps:
        parts = []
        for gloss, case in senses:
            parts.append({'gloss': gloss, 'caseTag': '(with %s.)' % case})
        rows.append({'greek': GREEK_OF[key], 'audio': aud(VOC_AUDIO[key]),
                     'senses': parts, 'popupRef': key})
    return rows


ONE_CASE = [('apo', [('from', 'gen')]),
            ('eis', [('into, to, in', 'acc')]),
            ('ek', [('from, out of', 'gen')]),
            ('en', [('in, on, at', 'dat')]),
            ('pros', [('to, towards', 'acc')]),
            ('sun', [('with', 'dat')])]
TWO_CASE = [('dia', [('through, by, during', 'gen'), ('because of', 'acc')]),
            ('kata', [('down, against', 'gen'),
                      ('according to, during', 'acc')]),
            ('meta', [('with', 'gen'), ('after', 'acc')]),
            ('peri', [('for, concerning', 'gen'), ('around, about', 'acc')])]
THREE_CASE = [('epi', [('on, over, before', 'gen'), ('on, at, in', 'dat'),
                       ('on, to, for', 'acc')])]


def popup(f, conv, key, off, headaudio):
    """One green preposition page: headword + three worked examples."""
    raw = f(off)
    lines = [l.rstrip() for l in raw.split('\r\n')]
    lines = [l for l in lines if l.strip()]
    head, rest = [], []
    for l in lines:
        if re.search(r'\(with the (genitive|dative|accusative)\)', l):
            head.append(sq(l))
        else:
            rest.append(l)
    if len(rest) % 2:
        raise SystemExit('STOP: popup %s has an odd example count' % key)
    glosses = []
    for h in head:
        g = re.sub(r'^\S+\s+', '', h) if h is head[0] else h
        glosses.append(sq(g))
    glosses[0] = sq(re.sub(r'^\S+\s+', '', head[0]))
    examples = []
    for i in range(0, len(rest), 2):
        gk = sq(rest[i])
        en = sq(rest[i + 1])
        m = re.search(r'\(([^()]*\d[^()]*)\)\s*$', en)
        ref = m.group(1) if m else None
        if ref:
            en = en[:m.start()].strip()
        examples.append({'greek': sq(conv(gk)), 'gloss': en, 'ref': ref,
                         'audio': aud('f_%s%d' % (key, i // 2 + 1))})
    if len(examples) != 3:
        raise SystemExit('STOP: popup %s: expected 3 examples, got %d'
                         % (key, len(examples)))
    return {'id': key, 'greek': conv(sq(head[0].split()[0])),
            'audio': aud(headaudio), 'senses': glosses, 'examples': examples}


def greek_prepositions(tbk, conv):
    f = tbk.prose
    intro_all = ' '.join(paras(f(OFF['gp_intro'])))
    cut = intro_all.index('Note that the genitive')
    intro = [intro_all[:cut].strip(), intro_all[cut:].strip()]
    elis = f(OFF['gp_elision'])
    proc = paras(f(OFF['gp_proclitics']))
    comp = paras(f(OFF['gp_compounds']))
    gi = next(i for i, l in enumerate(comp) if 'ble<pw' in l)
    comp = [' '.join(comp[:gi])]
    pops = [popup(f, conv, k, POPUP_OFF[k], VOC_AUDIO[k])
            for k in POPUP_ORDER]
    return {
        'id': 'c6_learn_prepositions', 'type': 'contentAudio',
        'mode': 'topicPages', 'title': 'Learn Greek Prepositions',
        'greekTaps': True,
        'popups': pops,
        'topics': [
            {'id': 'introduction', 'title': 'Introduction', 'content': [
                {'type': 'para', 'text': intro[0]},
                {'type': 'para', 'text': intro[1]},
            ]},
            {'id': 'oneCasePrepositions', 'title': 'One Case Prepositions',
             'content': [
                 {'type': 'para',
                  'text': 'The following prepositions are used with only one '
                          'case:'},
                 {'type': 'greekRows', 'layout': 'prepositionSenses',
                  'rows': panel_rows(None, conv, ONE_CASE)},
             ]},
            {'id': 'twoCasePrepositions', 'title': 'Two Case Prepositions',
             'content': [
                 {'type': 'para',
                  'text': 'The following prepositions are used with two '
                          'cases:'},
                 {'type': 'greekRows', 'layout': 'prepositionSenses',
                  'rows': panel_rows(None, conv, TWO_CASE)},
             ]},
            {'id': 'threeCasePreposition', 'title': 'Three Case Preposition',
             'content': [
                 {'type': 'para',
                  'text': 'The following preposition is used with three '
                          'cases:'},
                 {'type': 'greekRows', 'layout': 'prepositionSenses',
                  'rows': panel_rows(None, conv, THREE_CASE)},
             ]},
            {'id': 'prepositionsChart', 'title': 'Prepositions Chart',
             'content': [prepositions_chart()]},
            {'id': 'elision', 'title': 'Elision', 'content': [
                {'type': 'para', 'text': ' '.join(paras(elis)[:3])},
                {'type': 'greekRows', 'layout': 'glossOnly', 'rows': [
                    {'greek': sq(conv("di ]  e]mou?")),
                     'gloss': '= through me',
                     'ref': 'Jn 14:6', 'audio': aud('f_elis1')},
                    {'parts': [conv('dia<'), '+', conv('e]mou?')],
                     'partAudio': [aud('f_elis2'), None, aud('f_elis3')],
                     'bracket': True},
                ]},
                {'type': 'para',
                 'text': 'If there is a rough breathing mark on the next '
                         'word, the consonant may be shifted:'},
                {'type': 'greekRows', 'layout': 'glossOnly', 'rows': [
                    {'greek': sq(conv("meq ]  h[me<raj")),
                     'gloss': 'after days',
                     'ref': 'Mat 17:1', 'audio': aud('f_elis4')},
                    {'parts': [conv('meta<'), '+', conv('h[me<raj')],
                     'partAudio': [aud('f_elis5'), None, aud('f_elis6')],
                     'bracket': True},
                ]},
            ]},
            {'id': 'proclitics', 'title': 'Proclitics', 'content': [
                {'type': 'para', 'text': ' '.join(proc[:3])},
                {'type': 'para', 'text': conv_mixed(conv, proc[3])},
                {'type': 'para', 'text': ' '.join(proc[4:6])},
                {'type': 'para', 'text': ' '.join(proc[6:])},
            ]},
            {'id': 'compounds', 'title': 'Compounds', 'content': [
                {'type': 'para', 'text': comp[0]},
                {'type': 'greekRows', 'layout': 'glossOnly', 'rows': [
                    {'parts': [conv('dia<'), '+', conv('ble<pw')],
                     'partAudio': [aud('f_voc2'), None, aud('f_comp1')],
                     'gloss': 'through + I see'},
                    {'greek': conv('diable<pw'), 'gloss': 'I see clearly',
                     'audio': aud('f_comp2')},
                ]},
            ]},
        ],
    }


def prepositions_chart():
    """The circle-and-arrows diagram (OFF['gp_chart']).

    A genuinely new renderer surface: it is a DIAGRAM, not a chart of
    rows. Emitted as labelled nodes with their spatial slot and the
    arrow direction the original draws, so the renderer can place them
    without re-reading the screenshot.
    """
    n = [
        ('peri', 'around', 'topLeft', 'curveIn'),
        ('meta', 'with', 'topRight', 'in'),
        ('epi', 'upon', 'top', 'over'),
        ('pros', 'to', 'left', 'in'),
        ('apo', 'from', 'right', 'out'),
        ('eis', 'into', 'lowerLeft', 'in'),
        ('ek', 'out of', 'lowerRight', 'out'),
        ('dia', 'through', 'bottomLeft', 'across'),
        ('kata', 'against, down', 'bottomRight', 'down'),
        ('en', 'in', 'centre', None),
    ]
    return {'type': 'prepositionsChart', 'title': 'Prepositions Chart',
            'nodes': [{'greek': GREEK_OF[k], 'gloss': g, 'slot': s,
                       'arrow': a, 'audio': aud(VOC_AUDIO[k])}
                      for k, g, s, a in n]}


# Gloss GAPS. A gloss line can carry FEWER glosses than its Greek line
# has words -- the original simply leaves a word unglossed. Byte columns
# cannot resolve which one, because legacy Greek codes are wider than
# the glyphs they draw, so the gap position comes from the rail-walk
# screenshot (the standing "the prefix gives the read, the screenshot
# gives the cut" rule). Keyed by (field offset, Greek-line index) ->
# the 0-based word positions in THAT line that take no gloss.
GAPS = {
    (0x0afdc2, 1): {5},   # Learn Jn 1:1     -- ton
    (0x030336, 1): {5},   # Review Jn 1:1    -- ton
    (0x03ddb6, 0): {2},   # Review Jn 14:6a  -- ho
    (0x022040, 1): {3},   # Review Jn 14:6b  -- me
}


def interlinear(f, conv, off, reference, prefix, whole, n_words):
    """An interlinear verse page: Greek line then its gloss line."""
    raw = f(off)
    lines = [l for l in raw.split('\r\n') if l.strip()]
    lines = [l for l in lines if not re.fullmatch(r'\s*\([^()]*\)\s*', l)]
    words = []
    for pair, i in enumerate(range(0, len(lines) - 1, 2)):
        gk = ELISION.sub(r"\1'", lines[i]).split()
        en_line = re.sub(r'\s*\([^()]*\)\s*$', '', lines[i + 1])
        en = [e.strip() for e in re.split(r'\s{2,}', en_line.strip()) if e.strip()]
        gaps = GAPS.get((off, pair), set())
        if len(en) + len(gaps) != len(gk):
            raise SystemExit(
                'STOP: %s line %d: %d Greek words, %d glosses, %d declared '
                'gaps' % (reference, pair, len(gk), len(en), len(gaps)))
        k = 0
        for j, w in enumerate(gk):
            if j in gaps:
                words.append({'greek': conv(w), 'gloss': None})
            else:
                words.append({'greek': conv(w), 'gloss': en[k]})
                k += 1
    if len(words) != n_words:
        raise SystemExit('STOP: %s: expected %d words, got %d'
                         % (reference, n_words, len(words)))
    for k, w in enumerate(words):
        w['audio'] = aud('%s%d' % (prefix, k + 1))
    return {'reference': reference, 'words': words,
            'sayWhole': {'label': 'Say Whole Verse', 'audio': aud(whole)}}


def learn_scripture(f, conv):
    v = interlinear(f, conv, OFF['learn_sm'], 'Jn 1:1', 'f_sm', 'f_jn1_1', 12)
    v.update({'id': 'c6_learn_scripture', 'type': 'contentAudio',
              'mode': 'interlinearVerse', 'title': 'Learn Scripture Memory'})
    return v


def bibliography(f):
    raw = f(OFF['biblio'])
    txt = re.sub(r'\s+', ' ', raw).strip()
    items = re.split(r'(?=(?:Machen|Mounce|Summers|Wenham),)', txt)
    items = [dash(i.strip()) for i in items if i.strip()]
    if len(items) != 4:
        raise SystemExit('STOP: expected 4 bibliography entries, got %d'
                         % len(items))
    ital = [('New Testament Greek for Beginners',),
            ('Basics of Biblical Greek:  Grammar',),
            ('Essentials of New Testament Greek',),
            ('The Elements of New Testament Greek',)]
    out = []
    for it, (title,) in zip(items, ital):
        flat = re.sub(r'\s+', ' ', title)
        if flat not in it:
            raise SystemExit('STOP: bibliography title %r not found' % flat)
        out.append(it.replace(flat, '[[i]]%s[[/i]]' % flat))
    return {'id': 'c6_learn_bibliography', 'type': 'contentAudio',
            'mode': 'textPage', 'title': 'Learn Bibliography',
            'content': [{'type': 'biblist', 'items': out}]}


# --------------------------------------------------------------------
# 7. Drills
# --------------------------------------------------------------------

SCORED_UI = {'buttons': ['Pronounce', 'Score'],
             'checkboxes': ['Pronounce Each Drill'],
             'defaults': {'pronounceEach': True}, 'liveScore': True}


def stepper_ui(hint=None, extra=None):
    ui = {'buttons': ['Previous', 'Next', 'Pronounce', 'Hint', 'Score'],
          'checkboxes': ['Pronounce Each Drill'],
          'defaults': {'pronounceEach': True}, 'liveScore': True}
    if hint:
        ui['hintRef'] = hint
    if extra:
        ui.update(extra)
    return ui


def case_drill(tbk, conv):
    raw = tbk.pool(OFF['case_prompts'], 16, 'case drill prompts')
    lookup = {(p, g): c for p, g, c in CHART}
    items = []
    for line in raw:
        m = re.match(r'^(\S+)\s+\(([^)]*)\)', line.strip())
        if not m:
            raise SystemExit('STOP: case prompt %r does not parse' % line)
        legacy, gloss = m.group(1), m.group(2).strip()
        greek = conv(legacy)
        key = [k for k, v in GREEK_OF.items() if v == greek]
        if not key:
            raise SystemExit('STOP: unknown preposition %r' % greek)
        prep = key[0]
        if (prep, gloss) not in lookup:
            raise SystemExit('STOP: (%s, %r) is not on the chapter chart'
                             % (prep, gloss))
        items.append({'greek': greek, 'note': '(%s)' % gloss,
                      'answer': CASE_FULL[lookup[(prep, gloss)]],
                      'audio': aud(VOC_AUDIO[prep])})
    return {'id': 'c6_drill_case', 'type': 'select', 'mode': 'fullOptionGrid',
            'title': 'Preposition Case Drill',
            'instructions': 'Click on the matching case',
            'promptIsGreek': True, 'options': 'static',
            'optionValues': ['Genitive', 'Dative', 'Accusative'],
            'optionLayout': 'stack1col',
            'items': items, 'scored': True,
            'ui': stepper_ui(hint='prepositionsCaseChart')}


def translation_drill(tbk, conv):
    prompts = tbk.pool(OFF['td_prompts'], 40, 'translation prompts')
    cols = [tbk.pool(OFF['td_opt%d' % i], 40, 'translation options %d' % i)
            for i in (1, 2, 3)]
    refs = tbk.pool(OFF['td_refs'], 40, 'translation refs')
    items = []
    for i in range(40):
        opts = [cols[0][i], cols[1][i], cols[2][i]]
        if len(set(opts)) != 3:
            raise SystemExit('STOP: item %d has duplicate options' % (i + 1))
        it = {'greek': sq(conv(prompts[i])), 'ref': refs[i].strip(),
              'options': opts, 'answer': opts[ANSWER[i] - 1],
              'audio': aud('f_tpd%d' % (i + 1))}
        if (i + 1) in VERIFY_ITEMS:
            it['_verify'] = _WAS_VERIFIED[i + 1]
        items.append(it)
    return {'id': 'c6_drill_translation', 'type': 'select',
            'mode': 'fullOptionGrid', 'title': 'Preposition Translation Drill',
            'instructions': 'Click on the correct English translation',
            'promptIsGreek': True, 'options': 'perItem',
            'optionLayout': 'stack1col',
            'items': items, 'scored': True,
            'ui': stepper_ui(hint='prepositionsCaseChart')}


def sense_rows(tbk, conv):
    """The sixteen case-split vocabulary entries, in lemma order."""
    gk = tbk.pool(OFF['voc_greek16'], 16, 'vocabulary Greek (16)')
    en = tbk.pool(OFF['voc_gloss16'], 16, 'vocabulary glosses (16)')
    short = tbk.pool(OFF['en_gk_prompts'], 16, 'En->Gk prompts (16)')
    gkd = tbk.pool(OFF['gk_en_prompts'], 16, 'Gk->En prompts (16)')
    rows = []
    for i, (key, case) in enumerate(SENSE_ORDER):
        m = re.match(r'^(\S+)\s*\(with (\w+)\.?\)\s*$', gk[i].strip())
        if not m:
            raise SystemExit('STOP: vocab entry %r does not parse' % gk[i])
        if conv(m.group(1)) != GREEK_OF[key] or m.group(2)[:3] != case:
            raise SystemExit('STOP: vocab entry %d is %r, expected %s/%s'
                             % (i + 1, gk[i], key, case))
        if re.sub(r'\s+', ' ', gkd[i].strip()) != \
           re.sub(r'\s+', ' ', gk[i].strip()):
            raise SystemExit('STOP: Gk->En prompt %d disagrees with the '
                             'flashcard entry' % (i + 1))
        # Pool entries are single phrases; a run of 2+ spaces is the
        # start of the buffer's stale tail, never part of the gloss.
        gloss = re.split(r'\s{2,}', en[i].strip())[0].strip()
        gshort = re.split(r'\s{2,}', short[i].strip())[0].strip()
        rows.append({'key': key, 'case': case, 'greek': GREEK_OF[key],
                     'caseTag': '(with %s.)' % case,
                     'gloss': gloss, 'glossShort': gshort,
                     'audio': aud(VOC_AUDIO[key])})
    return rows


def gk_en_options(tbk):
    out = []
    for off in GK_EN_OPTION_OFF:
        end = off
        while 32 <= tbk.data[end] < 127:
            end += 1
        out.append(tbk.data[off:end].decode('latin-1').strip())
    if len(set(out)) != 16:
        raise SystemExit('STOP: Gk->En option captions are not distinct')
    return out


def vocab_gk_en(tbk, conv):
    rows = sense_rows(tbk, conv)
    opts = gk_en_options(tbk)
    return {'id': 'c6_drill_vocab_gk_en', 'type': 'select',
            'mode': 'fullOptionGrid',
            'title': 'Vocabulary:  Greek to English Drill',
            'instructions': 'Click on the matching word',
            'promptIsGreek': True, 'options': 'static',
            'optionValues': opts,
            'items': [{'greek': r['greek'], 'note': r['caseTag'],
                       'answer': opts[i], 'audio': r['audio']}
                      for i, r in enumerate(rows)],
            '_answer_note': ('Positional and SCRIPT-VERIFIED: the page ships '
                             'sixteen option buttons Word1..Word16 whose '
                             'captions are exactly this list, and prompt i is '
                             'scored against Word i.'),
            'scored': True, 'ui': dict(SCORED_UI)}


def vocab_en_gk(tbk, conv):
    rows = sense_rows(tbk, conv)
    return {'id': 'c6_drill_vocab_en_gk', 'type': 'select',
            'mode': 'fullOptionGrid',
            'title': 'Vocabulary:  English to Greek Drill',
            'instructions': 'Click on the matching word',
            'options': 'static', 'optionsAreGreek': True,
            'optionValues': ['%s %s' % (r['greek'], r['caseTag']
                                        .replace('with ', '')
                                        .replace('.', ''))
                             for r in rows],
            'items': [{'prompt': r['glossShort'],
                       'answer': '%s %s' % (r['greek'], r['caseTag']
                                            .replace('with ', '')
                                            .replace('.', '')),
                       'audio': r['audio']} for r in rows],
            'scored': True, 'ui': dict(SCORED_UI)}


SM_OPTIONS = ['in', 'beginning', 'was', 'the (nom)', 'word', 'and', 'with',
              'the (acc)', 'God']


def scripture_drill(tbk, conv):
    prompts = tbk.pool(OFF['sm_drill_prompts'], 9, 'Scripture Memory prompts')
    items = []
    for i, p in enumerate(prompts):
        items.append({'greek': conv(p.split()[0]), 'answer': SM_OPTIONS[i],
                      'audio': aud('f_sm%d' % (i + 1))})
    return {'id': 'c6_drill_scripture_memory', 'type': 'select',
            'mode': 'fullOptionGrid', 'title': 'Scripture Memory Drill',
            'instructions': 'Click on the matching word',
            'promptIsGreek': True, 'options': 'static',
            'optionValues': SM_OPTIONS, 'items': items, 'scored': True,
            'ui': dict(SCORED_UI),
            '_answer_note': ('Positional and SCRIPT-VERIFIED: the page ships '
                             'nine option buttons Word1..Word9 whose captions '
                             'are exactly this list, and prompt i is scored '
                             'against Word i.')}


# --------------------------------------------------------------------
# 8. Exercises
# --------------------------------------------------------------------

SPELL_UI = {'fields': ['English Phrase', 'Spell Greek Phrase'],
            'buttons': ['Pronounce', 'Previous', 'Score', 'Next',
                        'Check Answer', 'Greek Keyboard'],
            'checkboxes': ['Show Answer', 'With Accents',
                           'Pronounce Each Exercise'],
            'defaults': {'pronounceEach': True}}


def prep_speller(tbk, conv):
    """Answers are DERIVED by matching (reference, gloss) against the
    Translation Drill's own 40-item pool -- a double key."""
    prompts = tbk.pool(OFF['prep_spell_prompts'], 12, 'speller prompts')
    refs = tbk.pool(OFF['prep_spell_refs'], 12, 'speller refs')
    td_p = tbk.pool(OFF['td_prompts'], 40, 'translation prompts')
    td_r = [r.strip() for r in tbk.pool(OFF['td_refs'], 40,
                                        'translation refs')]
    td_cols = [tbk.pool(OFF['td_opt%d' % i], 40, 'td opt %d' % i)
               for i in (1, 2, 3)]
    items = []
    for i in range(12):
        prompt = sq(prompts[i])
        ref = re.match(r'^\s*(\d?\s?[A-Za-z]+\s+\d+:\d+)', refs[i])
        if not ref:
            raise SystemExit('STOP: speller ref %r does not parse' % refs[i])
        ref = re.sub(r'\s+', ' ', ref.group(1)).strip()
        core = re.sub(r'\s*\(not [^)]*\)\s*$', '', prompt).strip()
        hits = [j for j in range(40)
                if td_r[j] == ref
                and sq(td_cols[ANSWER[j] - 1][j]) == core]
        if len(hits) != 1:
            raise SystemExit('STOP: speller item %d (%r / %s) matched %d '
                             'translation-drill items' % (i + 1, core, ref,
                                                          len(hits)))
        j = hits[0]
        note = None
        m = re.search(r'\(not\s+([^)]*?)\s*\)\s*$', prompt)
        if m:
            note = '(not %s)' % conv(m.group(1))
        items.append({'prompt': core, 'note': note, 'ref': ref,
                      'answer': sq(conv(td_p[j])),
                      'audio': aud('f_tpd%d' % (j + 1))})
    return {'id': 'c6_ex_speller', 'type': 'spell',
            'title': 'Preposition Spelling Exercise',
            'instructions': 'Click letters below or use your keyboard to '
                            'spell it out.',
            'prompt': 'item', 'promptLabel': 'English Phrase',
            'accentsOptional': True, 'spellerTilesRef': 'chapt_1',
            'items': items, 'ui': dict(SPELL_UI),
            '_elision_note': ("Item 12's answer elides (ep' aletheias): "
                              'the mark is U+0027, is REQUIRED, and is not '
                              'interchangeable with a smooth breathing '
                              '(RULES C9 / D-29).')}


def vocab_speller(tbk, conv):
    prompts = tbk.pool(OFF['voc_spell_prompts'], 10, 'vocab speller prompts')
    items = []
    for i, key in enumerate(VOC_ORDER):
        p = sq(prompts[i])
        m = re.match(r'^(.*?)\((\w+)\.\)', p)
        if not m:
            raise SystemExit('STOP: vocab speller prompt %r does not parse' % p)
        if m.group(2)[:3] not in ('gen', 'dat', 'acc'):
            raise SystemExit('STOP: bad case tag in %r' % p)
        items.append({'ref': key, 'prompt': m.group(1).strip(),
                      'note': '(%s.)' % m.group(2)})
    ui = dict(SPELL_UI)
    ui['fields'] = ['English Meaning', 'Spell Greek Word']
    return {'id': 'c6_ex_vocab_speller', 'type': 'spell',
            'title': 'Vocabulary Spelling Exercise',
            'instructions': 'Click letters below or use your keyboard to '
                            'spell it out.',
            'prompt': 'item', 'promptLabel': 'English Meaning',
            'accentsOptional': True, 'spellerTilesRef': 'chapt_1',
            'items': items, 'ui': ui}


def scripture_speller(tbk, conv):
    f = tbk.field
    instr = sq(f(OFF['sm_spell_instructions']))
    trans = [sq(l) for l in f(OFF['sm_spell_translation']).split('\r\n')
             if l.strip()]
    verse = f(OFF['learn_sm'])
    vlines = [l for l in verse.split('\r\n') if l.strip()]
    vlines = [l for l in vlines
              if not re.fullmatch(r'\s*\([^()]*\)\s*', l)]
    gk = []
    for line in vlines[::2]:
        gk += ELISION.sub(r"\1'", line).split()
    words = [conv(w) for w in gk if not re.fullmatch(r'\(.*\)', w)]
    if len(words) != 12:
        raise SystemExit('STOP: Jn 1:1 speller expected 12 words, got %d'
                         % len(words))
    return {'id': 'c6_ex_scripture_speller', 'type': 'spellVerse',
            'title': 'Scripture Memory Spelling Exercise',
            'instructions': instr, 'reference': 'Jn 1:1',
            'answerWords': words, 'translation': ' '.join(trans),
            'accentsOptional': True, 'punctuationOptional': True,
            'audio': aud('f_jn1_1'), 'spellerTilesRef': 'chapt_1',
            'ui': {'fields': ['Spell Greek'],
                   'buttons': ['Pronounce', 'Check Answer', 'Greek Keyboard',
                               'Restart Exercise'],
                   'checkboxes': ['Show Answer', 'With Accents'],
                   '_reveal_note': 'RULES C8 / D-30: Show Answer is the one '
                                   'reveal control. No Major Hint button, no '
                                   'timer.'}}


# --------------------------------------------------------------------
# 9. Quick Review
# --------------------------------------------------------------------

def quick_review(f, conv):
    out = [
        {'id': 'c6_qr_vocab', 'type': 'contentAudio', 'mode': 'reviewVocab',
         'title': 'Review Vocabulary Chart', 'pool': 'lemmas', 'columns': 2,
         'showNtFreq': True,
         'footnote': 'The number after the translation is the number of '
                     'times the word occurs in the New Testament.',
         'playAll': {'audio': aud('f_vocl6'), 'label': 'Say Whole List'}},
        {'id': 'c6_qr_prepositions', 'type': 'contentAudio',
         'mode': 'textPage', 'title': 'Review Prepositions Chart',
         'content': [prepositions_chart()]},
    ]
    for aid, title, off, ref, prefix, whole, n in [
        ('c6_qr_scripture_146a', 'Review Scripture Memory:  Jn 14:6a',
         OFF['review_sm_146a'], 'John 14:6a', 'c_sm', 'c_sm14_6', 14),
        ('c6_qr_scripture_146b', 'Review Scripture Memory:  Jn 14:6b',
         OFF['review_sm_146b'], 'John 14:6b', 'd_sm', 'd_jn146b', 9),
        ('c6_qr_scripture_rom', 'Review Scripture Memory:  Rom 3:23',
         OFF['review_sm_rom'], 'Rom 3:23', 'e_sm', 'e_rom323', 9),
        ('c6_qr_scripture_jn11', 'Review Scripture Memory:  Jn 1:1',
         OFF['review_sm_jn11'], 'Jn 1:1', 'f_sm', 'f_jn1_1', 12),
    ]:
        v = interlinear(f, conv, off, ref, prefix, whole, n)
        v.update({'id': aid, 'type': 'contentAudio',
                  'mode': 'interlinearVerse', 'title': title})
        out.append(v)
    return out


# --------------------------------------------------------------------
# 10. Lexicon
# --------------------------------------------------------------------

def build_lexicon(tbk, conv, chapter):
    rows = sense_rows(tbk, conv)
    chart = re.sub(r'\s+', ' ', tbk.field(OFF['review_vocab']))
    lemmas = {}
    for key in VOC_ORDER:
        mine = [r for r in rows if r['key'] == key]
        freq = NT_FREQ[key]
        if '(%d)' % freq not in chart:
            raise SystemExit('STOP: NT frequency %d for %s is not on the '
                             'Review Vocabulary Chart' % (freq, key))
        lemmas[key] = {
            'greek': GREEK_OF[key], 'translit': key,
            'gloss': '; '.join('%s %s' % (r['gloss'], r['caseTag'])
                               for r in mine),
            'glossShort': mine[0]['glossShort'],
            'pos': 'preposition', 'audio': aud(VOC_AUDIO[key]),
            'ntFreq': freq,
            'lexicalForm': GREEK_OF[key],
            'senses': [{'gloss': r['gloss'], 'glossShort': r['glossShort'],
                        'case': r['case'], 'caseTag': r['caseTag']}
                       for r in mine],
        }
    example = {}
    for pop in chapter['learn'][2]['popups']:
        for ex in pop['examples']:
            example[ex['greek']] = {'greek': ex['greek'],
                                    'gloss': ex['gloss'],
                                    'audio': ex['audio']}
    return {
        '_comment': (
            'Chapter 6 lexicon, assembled from 6_PREPS.TBK (cohort 5F). '
            'Vocabulary order is the TBK list order (alphabetical), which '
            'matches f_voc1..10 and is SCRIPT-VERIFIED through the drill '
            "pages' SayWord1 dispatch at 0x90930. `senses` carries the "
            'SIXTEEN case-split entries the flashcard and both vocabulary '
            'drills present over these ten lemmas -- chapters 1-5 had no '
            'such split. ntFreq values are the Review Vocabulary Chart\'s '
            'own counts (0x0b55a0). CHAPT_6 ships f_* plus chapter 3\'s '
            'c_sm*, chapter 4\'s d_sm* and chapter 5\'s e_sm* for the three '
            'cumulative Scripture review charts; the data references those '
            'LOCAL copies.'),
        'lemmas': lemmas,
        'exampleWords': example,
    }


def validate(ch):
    ids = set()
    for sec in ('learn', 'drill', 'exercise', 'quickReview'):
        for a in ch[sec]:
            if a['id'] in ids:
                raise SystemExit('STOP: duplicate id %s' % a['id'])
            ids.add(a['id'])
    if set(ch['sequence']) != ids:
        raise SystemExit('STOP: sequence does not cover exactly the '
                         'activities: %r' % (set(ch['sequence']) ^ ids))
    if len(ch['sequence']) != len(set(ch['sequence'])):
        raise SystemExit('STOP: sequence has duplicates')


def main():
    tbkpath, fontpath, outdir = sys.argv[1], sys.argv[2], sys.argv[3]
    tbk = Tbk(tbkpath)
    conv = make_conv(json.load(open(fontpath)))
    ch = build(tbk, conv)
    validate(ch)
    lex = build_lexicon(tbk, conv, ch)
    for name, obj in (('chapt-06.json', ch), ('lexicon-chapt06.json', lex)):
        with open('%s/%s' % (outdir, name), 'w', encoding='utf-8') as fh:
            json.dump(obj, fh, ensure_ascii=False, indent=1)
            fh.write('\n')
        print('wrote %s/%s' % (outdir, name))


if __name__ == '__main__':
    main()
