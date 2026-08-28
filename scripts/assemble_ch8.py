#!/usr/bin/env python3
"""assemble_ch8.py -- chapter 8 data assembly (cohort 5F, pipeline-side).

Same contract as assemble_ch6.py: fields are read from 8_PRONS.TBK BY
OFFSET (5F-EXTRACTION-MAP.md sec 3), converted through font-map.json,
and every drill answer is DERIVED from the chapter's own paradigm
charts and cross-checked against the extracted option columns.

Nothing here is authored. If a field cannot be located, or a derived
answer disagrees with the chapter's own chart, the assembly STOPS
(PIPELINE-INSIGHTS Stage 7).

Usage:  python3 assemble_ch7.py 8_PRONS.TBK font-map.json outdir
"""
# --------------------------------------------------------------------
# FROZEN AT 5F CLOSE -- PIPELINE-INSIGHTS-v3 Stage 8.7.
#
# The committed chapt-08.json carries THREE rounds of device-verified
# hand repair (5F-SPEC1-PATCH1/2/3: paragraph restructures, chart
# emissions, audio re-keys, popup re-keys) that this script does NOT
# reproduce. Re-running it would silently regress the approved state.
# The committed JSON is the source of truth; this script is provenance
# only -- it documents how the FIRST cut was derived.
# --------------------------------------------------------------------
import os as _os
if _os.environ.get('ALLOW_REGRESSIVE_REBUILD') != '1':
    raise SystemExit(
        'REFUSING TO RUN: assemble_ch8.py is provenance only '
        '(Stage 8.7). The committed chapt-08.json carries PATCH1-3 '
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

A = 'chapt_8_'

# ELISION (DRILL-BEHAVIOR-RULES C9 / D-29): a ']' standing alone
# between spaces is an apostrophe bound to the preceding word, not a
# breathing. See assemble_ch6.py for the full note.
ELISION = re.compile(r"(\S)[ \t]+\](?=[ \t]|$)")


def aud(name):
    return A + name


def make_conv(fontmap):
    lower = dict(fontmap['lowercase'])
    upper = dict(fontmap['uppercase'])
    dia = {k: v['unicode'] for k, v in fontmap['diacritics_verified'].items()}
    for k, v in fontmap.get('base_verified_additions', {}).items():
        if isinstance(v, str):
            lower.setdefault(k, v)
        elif isinstance(v, dict) and 'unicode' in v:
            lower.setdefault(k, v['unicode'])

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
    Tbk.prose(), which is authoritative and catches the accentless
    enclitics a token heuristic cannot. Falls back to the diacritic
    heuristic for text that arrived without a run table.
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

    def pool(self, off, n, label, allow_blank=False):
        raw = self.region(off).split('\r\n')
        lines = [l.strip() for l in raw]
        if not allow_blank:
            lines = [l for l in lines if l]
        if len(lines) < n:
            raise SystemExit(
                f'STOP: pool {label} at {off:#x}: expected {n}, '
                f'got {len(lines)}')
        return lines[:n]

    def has_clip(self, name):
        return ('%s.wav' % name).encode() in self.data.lower()


def dash(s):
    return s.replace('--', '\u2014')


def sq(s):
    return re.sub(r'[ \t]{2,}', ' ', s).strip()


def paras(text, drop=1):
    lines = [l for l in text.split('\r\n') if l.strip()][drop:]
    return [dash(sq(l)) for l in lines]


# --------------------------------------------------------------------
# Offsets (5F-EXTRACTION-MAP.md sec 3)
# --------------------------------------------------------------------

OFF = {
    'objectives': 0x0f8f4e,
    'biblio': 0x01c7ae,
    'review_vocab': 0x0f01bc,
    'ec_definition': 0x02ab1e,
    'ec_types': 0x02b08e,
    'ec_types2': 0x02bde6,
    'ec_case': 0x02b3d8,
    'ec_number': 0x02c5e2,
    'gp_intro': 0x0130c0,
    'gp_first': 0x01375a,
    'gp_second': 0x014624,
    'gp_examples': 0x0171de,
    'gp_enclitics': 0x015a56,
    'gp_enclitics2': 0x017f5e,
    'gp_declension': 0x0163a8,
    'tp_intro': 0x122db8,
    'tp_masc': 0x124088,
    'tp_fem': 0x125026,
    'tp_neut': 0x12637e,
    'tp_uses': 0x1234cc,
    'tp_uses2': 0x127510,
    'pop_pronoun': 0x127b8c,
    'pop_reflexive': 0x1283c4,
    'pop_same': 0x128b16,
    'qr_first': 0x048852,
    'qr_second': 0x0ce53c,
    'qr_third_masc': 0x0d0dd4,
    'qr_third_fem': 0x0d20fa,
    'qr_third_neut': 0x0d2f50,
    'hint_first': 0x07fad8,
    'hint_second': 0x080a62,
    'hint_third': 0x0a79c8,
    'voc_lexical': 0x01fd1a,
    'voc_gloss': 0x0200d6,
    'voc_bare': 0x09de82,
    'voc_short': 0x056b44,
    'voc_spell_prompts': 0x09787a,
    'case_prompts': 0x0c3e16,
    'spell_prompts': 0x090f0a,
    'spell_refs': 0x092a52,
    'd2_p1': 0x07c6a8, 'd2_p2': 0x07f666,
    'd2_o1': 0x07e30a, 'd2_o2': 0x07ea34, 'd2_o3': 0x07ef04,
    'd2_refs': 0x07f2a4,
    'd3_p1': 0x0a458e, 'd3_p2': 0x0a754c,
    'd3_o1': 0x0a61f0, 'd3_o2': 0x0a691a, 'd3_o3': 0x0a6dea,
    'd3_refs': 0x0a718a,
    'sm_drill_prompts': 0x05c760,
    'learn_sm': 0x0e1838,
    'review_sm_146a': 0x00ae26,
    'review_sm_146b': 0x00d7e6,
    'review_sm_rom323': 0x008922,
    'review_sm_jn11': 0x041d56,
    'review_sm_rom623': 0x044ae6,
    'sm_spell_verse': 0x069eaa,
}

# The chapter's OWN paradigm charts, as printed. Every drill and
# exercise answer in chapter 8 is looked up here, and each Greek form
# is asserted to appear verbatim in the corresponding chart field
# before it is used.
PARADIGM = [
    # (person, gender, case, number, legacy form, gloss, clip)
    ('1', None, 'nom', 'sg', 'e]gw<', 'I', 'h_1ns'),
    ('1', None, 'gen', 'sg', 'mou', 'of me, my', 'h_1gs'),
    ('1', None, 'dat', 'sg', 'moi', 'to me', 'h_1ds'),
    ('1', None, 'acc', 'sg', 'me', 'me', 'h_1as'),
    ('1', None, 'nom', 'pl', 'h[mei?j', 'we', 'h_1np'),
    ('1', None, 'gen', 'pl', 'h[mw?n', 'of us, our', 'h_1gp'),
    ('1', None, 'dat', 'pl', 'h[mi?n', 'to us', 'h_1dp'),
    ('1', None, 'acc', 'pl', 'h[ma?j', 'us', 'h_1ap'),
    ('2', None, 'nom', 'sg', 'su<', 'you', 'h_2ns'),
    ('2', None, 'gen', 'sg', 'sou', 'of you, your', 'h_2gs'),
    ('2', None, 'dat', 'sg', 'soi', 'to you', 'h_2ds'),
    ('2', None, 'acc', 'sg', 'se', 'you', 'h_2as'),
    ('2', None, 'nom', 'pl', 'u[mei?j', 'you', 'h_2np'),
    ('2', None, 'gen', 'pl', 'u[mw?n', 'your', 'h_2gp'),
    ('2', None, 'dat', 'pl', 'u[mi?n', 'to you', 'h_2dp'),
    ('2', None, 'acc', 'pl', 'u[ma?j', 'you', 'h_2ap'),
    ('3', 'masc', 'nom', 'sg', 'au]to<j', 'he', 'h_3mns'),
    ('3', 'masc', 'gen', 'sg', 'au]tou?', 'his', 'h_3mgs'),
    ('3', 'masc', 'dat', 'sg', 'au]t&?', 'to him', 'h_3mds'),
    ('3', 'masc', 'acc', 'sg', 'au]to<n', 'him', 'h_3mas'),
    ('3', 'masc', 'nom', 'pl', 'au]toi<', 'they', 'h_3mnp'),
    ('3', 'masc', 'gen', 'pl', 'au]tw?n', 'their', 'h_3mgp'),
    ('3', 'masc', 'dat', 'pl', 'au]toi?j', 'to them', 'h_3mdp'),
    ('3', 'masc', 'acc', 'pl', 'au]tou<j', 'them', 'h_3map'),
    ('3', 'fem', 'nom', 'sg', 'au]th<', 'she', 'h_3fns'),
    ('3', 'fem', 'gen', 'sg', 'au]th?j', 'her', 'h_3fgs'),
    ('3', 'fem', 'dat', 'sg', 'au]t^?', 'to her', 'h_3fds'),
    ('3', 'fem', 'acc', 'sg', 'au]th<n', 'her', 'h_3fas'),
    ('3', 'fem', 'nom', 'pl', 'au]tai<', 'they', 'h_3fnp'),
    ('3', 'fem', 'gen', 'pl', 'au]tw?n', 'their', 'h_3fgp'),
    ('3', 'fem', 'dat', 'pl', 'au]tai?j', 'to them', 'h_3fdp'),
    ('3', 'fem', 'acc', 'pl', 'au]ta<j', 'them', 'h_3fap'),
    ('3', 'neut', 'nom', 'sg', 'au]to<', 'it', 'h_3nns'),
    ('3', 'neut', 'gen', 'sg', 'au]tou?', 'its', 'h_3ngs'),
    ('3', 'neut', 'dat', 'sg', 'au]t&?', 'to it', 'h_3nds'),
    ('3', 'neut', 'acc', 'sg', 'au]to<', 'it', 'h_3nas'),
    ('3', 'neut', 'nom', 'pl', 'au]ta<', 'they', 'h_3nnp'),
    ('3', 'neut', 'gen', 'pl', 'au]tw?n', 'their', 'h_3ngp'),
    ('3', 'neut', 'dat', 'pl', 'au]toi?j', 'to them', 'h_3ndp'),
    ('3', 'neut', 'acc', 'pl', 'au]ta<', 'them', 'h_3nap'),
]
# Emphatic first/second person singulars, taught on the paradigm pages.
EMPHATIC = [
    ('1', 'gen', 'sg', 'e]mou?', 'h_1gse'),
    ('1', 'dat', 'sg', 'e]moi<', 'h_1dse'),
    ('1', 'acc', 'sg', 'e]me<', 'h_1ase'),
]

PERSON_WORD = {'1': 'First Person', '2': 'Second Person', '3': 'Third Person'}
CASE_WORD = {'nom': 'Nominative', 'gen': 'Genitive', 'dat': 'Dative',
             'acc': 'Accusative'}
NUM_WORD = {'sg': 'Singular', 'pl': 'Plural'}

VOC_ORDER = ['autos', 'ge', 'ego', 'hemeis', 'hemera', 'hoti', 'oun',
             'ochlos', 'para_gen', 'para_dat', 'para_acc', 'su', 'humeis',
             'hupo_gen', 'hupo_acc']
VOC_CLIP = ['h_voc1', 'h_voc2', 'h_voc3a', 'h_voc3b', 'h_voc4', 'h_voc5',
            'h_voc6', 'h_voc7', 'h_voc8', 'h_voc8', 'h_voc8', 'h_voc9a',
            'h_voc9b', 'h_voc10', 'h_voc10']
LEMMA_KEYS = ['autos', 'ge', 'ego', 'hemera', 'hoti', 'oun', 'ochlos',
              'para', 'su', 'hupo']
NT_FREQ = {'autos': 5595, 'ge': 250, 'ego': 2666, 'hemera': 389,
           'hoti': 1296, 'oun': 499, 'ochlos': 175, 'para': 194,
           'su': 2905, 'hupo': 220}

# Personal Pronoun Translation Drill (20) and Autos Translation Drill
# (21). Each option triple differs ONLY in the person/number of the
# pronoun (drill 2) or in which of the three uses of autos is taken
# (drill 3), both of which the chapter's own pages settle. All 41
# separate; there are no _verify items in chapter 8's translation
# drills.
D2_ANSWER = [3, 1, 2, 1, 2, 3, 3, 2, 1, 1,
             3, 1, 3, 1, 3, 3, 2, 1, 1, 3]
D3_ANSWER = [2, 1, 3, 3, 2, 2, 3, 1, 3, 2, 3,
             3, 2, 1, 2, 1, 3, 1, 1, 2, 2]


SCORED_UI = {'buttons': ['Pronounce', 'Score'],
             'checkboxes': ['Pronounce Each Drill'],
             'defaults': {'pronounceEach': True}, 'liveScore': True}
SPELL_UI = {'fields': ['English Phrase', 'Spell Greek Phrase'],
            'buttons': ['Pronounce', 'Previous', 'Score', 'Next',
                        'Check Answer', 'Greek Keyboard'],
            'checkboxes': ['Show Answer', 'With Accents',
                           'Pronounce Each Exercise'],
            'defaults': {'pronounceEach': True}}


# Per-item Hint routing for the Case Drill, READ 2026-08-26 from the
# WordCounter dispatch table at 8_PRONS.TBK 0x10d820 and ratified by
# DOSBox (VERIFY-5H-2 (s)). Frozen here so a rebuild needs no re-decode.
CASE_HINT = [
    'thirdPersonParadigm', 'firstPersonParadigm',
    'secondPersonParadigm', 'thirdPersonParadigm',
    'firstPersonParadigm', 'thirdPersonParadigm',
    'firstPersonParadigm', 'secondPersonParadigm',
    'thirdPersonParadigm', 'secondPersonParadigm',
    'secondPersonParadigm', 'firstPersonParadigm',
    'thirdPersonParadigm', 'thirdPersonParadigm',
    'secondPersonParadigm', 'secondPersonParadigm',
    'thirdPersonParadigm', 'thirdPersonParadigm',
    'firstPersonParadigm', 'thirdPersonParadigm',
    'firstPersonParadigm', 'thirdPersonParadigm',
    'thirdPersonParadigm', 'secondPersonParadigm',
    'firstPersonParadigm', 'thirdPersonParadigm',
    'thirdPersonParadigm', 'firstPersonParadigm',
    'thirdPersonParadigm', 'secondPersonParadigm',
    'firstPersonParadigm',
]


def stepper_ui(hint=None):
    ui = {'buttons': ['Previous', 'Next', 'Pronounce', 'Hint', 'Score'],
          'checkboxes': ['Pronounce Each Drill'],
          'defaults': {'pronounceEach': True}, 'liveScore': True}
    if hint:
        ui['hintRef'] = hint
    return ui


def fp(tbk, off, n, label):
    """Read a pool BY LENGTH PREFIX (the chapter-7 rule: these buffers
    carry stale tails with no separating space run, and only the prefix
    cuts the last entry). A leading blank line is accepted."""
    lines = [l.strip() for l in tbk.field(off).split('\r\n')]
    if lines and not lines[0]:
        lines = lines[1:]
    if len(lines) < n:
        raise SystemExit('STOP: pool %s at %#x: expected %d, got %d'
                         % (label, off, n, len(lines)))
    return lines[:n]


def cut_ref(raw):
    # A BLANK reference is real data, not a read failure: the Personal
    # Pronoun Spelling Exercise prints no citation for one of its forty
    # items. Anything non-blank that will not parse is still a STOP.
    if not raw.strip():
        return None
    m = re.match(r'\s*(\d?\s?[A-Za-z]+\.?\s+\d+:\d+)', raw)
    if not m:
        raise SystemExit('STOP: reference %r does not parse' % raw)
    return re.sub(r'\s+', ' ', m.group(1)).strip()


def check_paradigms(tbk):
    """Every form in PARADIGM must appear verbatim in the chapter's own
    chart for its person/gender. If a chart changes, assembly STOPS."""
    charts = {('1', None): OFF['gp_first'], ('2', None): OFF['gp_second'],
              ('3', 'masc'): OFF['tp_masc'], ('3', 'fem'): OFF['tp_fem'],
              ('3', 'neut'): OFF['tp_neut']}
    text = {k: re.sub(r'\s+', ' ', tbk.field(v)) for k, v in charts.items()}
    for person, gender, case, num, legacy, gloss, clip in PARADIGM:
        if legacy not in text[(person, gender)]:
            raise SystemExit(
                'STOP: %s is not on the %s %s chart at %#x'
                % (legacy, person, gender or '', charts[(person, gender)]))
        if not tbk.has_clip(clip):
            raise SystemExit('STOP: clip %s is never dispatched' % clip)


def form_index(conv):
    """Greek form -> the paradigm cells that print it. The Case Drill
    asks for PERSON + CASE + NUMBER only (never gender), so the third
    person's gender syncretism does not make an item ambiguous; only a
    genuine case syncretism does."""
    idx = {}
    for person, gender, case, num, legacy, gloss, clip in PARADIGM:
        idx.setdefault(conv(legacy), []).append(
            (person, gender, case, num, clip))
    for person, case, num, legacy, clip in EMPHATIC:
        idx.setdefault(conv(legacy), []).append(
            (person, None, case, num, clip))
    return idx


def case_drill(tbk, conv):
    prompts = fp(tbk, OFF['case_prompts'], 31, 'case drill prompts')
    idx = form_index(conv)
    items = []
    for i, p in enumerate(prompts):
        g = conv(p)
        cells = idx.get(g)
        if not cells:
            raise SystemExit('STOP: case prompt %r is on no chart' % g)
        answers = {(c[0], c[2], c[3]) for c in cells}
        person, _, case, num, clip = cells[0]
        it = {'greek': g,
              'answer': [PERSON_WORD[person],
                         '%s %s' % (CASE_WORD[case], NUM_WORD[num])],
              'audio': aud(clip)}
        if len(answers) > 1:
            # The original grades EVERY cell the form prints in as
            # correct (Nathanael, VERIFY-5F item 8, with screenshot).
            it['answerAlt'] = [[PERSON_WORD[a],
                                '%s %s' % (CASE_WORD[b], NUM_WORD[c])]
                               for a, b, c in sorted(answers)
                               if [PERSON_WORD[a],
                                   '%s %s' % (CASE_WORD[b],
                                              NUM_WORD[c])] != it['answer']]
            it['_ambiguous_note'] = (
                'This form prints in more than one cell of the chart. '
                'ACCEPT ANY of answer + answerAlt.')
        items.append(it)
    return {'id': 'c8_drill_case', 'type': 'select',
            'mode': 'twoStageGrid',
            'title': 'Personal Pronoun Case Drill',
            'instructions': 'Click on the person then the case',
            'promptIsGreek': True, 'options': 'static',
            'optionStages': [
                {'label': 'person',
                 'values': ['First Person', 'Second Person', 'Third Person']},
                {'label': 'caseNumber',
                 'values': ['Nominative Singular', 'Nominative Plural',
                            'Genitive Singular', 'Genitive Plural',
                            'Dative Singular', 'Dative Plural',
                            'Accusative Singular', 'Accusative Plural'],
                 'layout': 'paradigm2col'}],
            'items': items, 'scored': True,
            'ui': stepper_ui(hint='thirdPersonParadigm'),
            '_stage_note': (
                'NEW SHAPE. The original wants TWO clicks per item: the '
                'person column, then the case-and-number grid. NOTHING is '
                'judged until BOTH are chosen -- the learner may click a '
                'person, change their mind, and click a different person, '
                'as many times as they like, and only the case click '
                'commits the answer (Nathanael, VERIFY-5F item 7). The '
                'attempt is then scored on the pair.')}


def pron_speller(tbk, conv):
    prompts = fp(tbk, OFF['spell_prompts'], 40, 'pronoun speller prompts')
    refs = fp(tbk, OFF['spell_refs'], 40, 'pronoun speller refs')
    lookup = {}
    for person, gender, case, num, legacy, gloss, clip in PARADIGM:
        lookup[(person, gender, case, num)] = (conv(legacy), clip)
    order = [(p, g, c, n) for p, g, c, n, _, _, _ in PARADIGM]
    items = []
    for i in range(40):
        person, gender, case, num = order[i]
        form, clip = lookup[(person, gender, case, num)]
        prompt = sq(prompts[i])
        m = re.match(r'^(.*?)\s*\(([^)]*)\)\s*$', prompt)
        if not m:
            raise SystemExit('STOP: speller prompt %r does not parse'
                             % prompt)
        tag = m.group(2)
        if case[:3] not in tag or num[:2] not in tag:
            raise SystemExit(
                'STOP: speller item %d is tagged %r but the paradigm order '
                'says %s %s' % (i + 1, tag, case, num))
        items.append({'prompt': m.group(1).strip(), 'note': '(%s)' % tag,
                      'ref': cut_ref(refs[i]), 'answer': form,
                      'audio': aud(clip)})
    return {'id': 'c8_ex_speller', 'type': 'spell',
            'title': 'Personal Pronoun Spelling Exercise',
            'instructions': 'Click letters below or use your keyboard to '
                            'spell it out.',
            'prompt': 'item', 'promptLabel': 'English Phrase',
            'accentsOptional': True, 'spellerTilesRef': 'chapt_1',
            'items': items, 'ui': dict(SPELL_UI),
            '_answer_note': ('The forty prompts run the three paradigms in '
                             'chart order (1st sg/pl, 2nd sg/pl, 3rd masc/'
                             'fem/neut sg/pl, four cases each); each '
                             "prompt's own case and number tag is asserted "
                             'against that order before the form is taken '
                             "from the chapter's chart.")}


def translation_drill(tbk, conv, aid, title, n, keys, answers, clip, hint):
    def col(key, label):
        return fp(tbk, OFF[key], n, '%s %s' % (aid, label))
    p1, p2 = col(keys[0], 'prompt 1'), col(keys[1], 'prompt 2')
    cols = [col(keys[2 + k], 'options %d' % (k + 1)) for k in range(3)]
    refs = col(keys[5], 'refs')
    items = []
    for i in range(n):
        opts = [sq(c[i]) for c in cols]
        if len(set(opts)) != 3:
            raise SystemExit('STOP: %s item %d has duplicate options'
                             % (aid, i + 1))
        items.append({'greek': sq(conv(p1[i])),
                      'greek2': sq(conv(p2[i])) or None,
                      'ref': cut_ref(refs[i]), 'options': opts,
                      'answer': opts[answers[i] - 1],
                      'audio': aud('%s%d' % (clip, i + 1))})
    return {'id': aid, 'type': 'select', 'mode': 'fullOptionGrid',
            'title': title,
            'instructions': 'Click on the correct English translation',
            'promptIsGreek': True, 'options': 'perItem',
            'optionLayout': 'stack1col', 'items': items, 'scored': True,
            'ui': stepper_ui(hint=hint)}


def split_glosses(line, want):
    """Split a gloss line into `want` columns.

    A fixed two-space threshold is not safe here: chapter 8 sets
    "of   sin" with three spaces INSIDE one gloss and only eight
    between the next two. So take every run of 2+ spaces as a
    CANDIDATE boundary and keep the `want - 1` widest ones -- the
    original is column-set, so the real boundaries are always the
    widest gaps on the line. STOP if there are not enough candidates.
    """
    body = line.strip()
    if want <= 1:
        return [body] if body else []
    cands = [(m.end() - m.start(), m.start(), m.end())
             for m in re.finditer(r'\s{2,}', body)]
    if len(cands) < want - 1:
        raise SystemExit('STOP: gloss line %r has %d candidate boundaries, '
                         'need %d' % (body, len(cands), want - 1))
    cands.sort(key=lambda c: (-c[0], c[1]))
    cuts = sorted(cands[:want - 1], key=lambda c: c[1])
    out, pos = [], 0
    for _, a, b in cuts:
        out.append(body[pos:a].strip())
        pos = b
    out.append(body[pos:].strip())
    return out


GAPS = {
    (0x0e1838, 0): {3},   # Learn Rom 6:23a  -- tes (the Review page
                          #                     glosses it "the")
    (0x00ae26, 0): {2},   # Review Jn 14:6a  -- ho
    (0x00d7e6, 1): {3},   # Review Jn 14:6b  -- me
}


def interlinear(f, conv, off, reference, prefix, whole, n_words, repeats=None):
    lines = [l for l in f(off).split('\r\n') if l.strip()]
    lines = [l for l in lines if not re.fullmatch(r'\s*\(?[^()]*\)?\s*',
                                                  l) or True]
    lines = [l for l in lines if not re.fullmatch(r'\s*\([^()]*\)\s*', l)]
    words = []
    for pair, i in enumerate(range(0, len(lines) - 1, 2)):
        gk = ELISION.sub("\\1'", lines[i]).split()
        en_line = re.sub(r'\s*\([^()]*\)\s*$', '', lines[i + 1])
        gaps = GAPS.get((off, pair), set())
        en = split_glosses(en_line, len(gk) - len(gaps))
        if len(en) + len(gaps) != len(gk):
            raise SystemExit(
                'STOP: %s line %d: %d Greek words, %d glosses, %d gaps'
                % (reference, pair, len(gk), len(en), len(gaps)))
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
        w['audio'] = aud('%s%d' % (prefix, (repeats or {}).get(k + 1, k + 1)))
    return {'reference': reference, 'words': words,
            'sayWhole': {'label': 'Say Whole Verse', 'audio': aud(whole)}}


JN11_REPEATS = {13: 6, 14: 13, 15: 3, 16: 4, 17: 5}
SM_OPTIONS = ['the (neut)', 'for', 'wages', 'the (fem)', 'sin', 'death']


def scripture_drill(tbk, conv):
    prompts = fp(tbk, OFF['sm_drill_prompts'], 6, 'Scripture Memory prompts')
    items = [{'greek': conv(p.split()[0]), 'answer': SM_OPTIONS[i],
              'audio': aud('h_sm%d' % (i + 1))}
             for i, p in enumerate(prompts)]
    return {'id': 'c8_drill_scripture_memory', 'type': 'select',
            'mode': 'fullOptionGrid', 'title': 'Scripture Memory Drill',
            'instructions': 'Click on the matching word',
            'promptIsGreek': True, 'options': 'static',
            'optionValues': SM_OPTIONS, 'items': items, 'scored': True,
            'ui': dict(SCORED_UI)}


def scripture_speller(tbk, conv):
    words = []
    for line in [l for l in tbk.field(OFF['sm_spell_verse']).split('\r\n')
                 if l.strip()][:2]:
        words += [conv(w) for w in line.split()]
    if len(words) != 6:
        raise SystemExit('STOP: Rom 6:23a speller expected 6 words, got %d'
                         % len(words))
    return {'id': 'c8_ex_scripture_speller', 'type': 'spellVerse',
            'title': 'Scripture Memory Spelling Exercise',
            'instructions': 'Enter all of Rom 6:23a then click "Check Answer"',
            'reference': 'Rom 6:23a', 'answerWords': words,
            'translation': 'For the wages of sin is death',
            'accentsOptional': True, 'punctuationOptional': True,
            'audio': aud('h_rm623a'), 'spellerTilesRef': 'chapt_1',
            'ui': {'fields': ['Spell Greek'],
                   'buttons': ['Pronounce', 'Check Answer', 'Greek Keyboard',
                               'Restart Exercise'],
                   'checkboxes': ['Show Answer', 'With Accents'],
                   '_reveal_note': 'RULES C8 / D-30.'}}


def vocab_rows(tbk, conv):
    bare = fp(tbk, OFF['voc_bare'], 15, 'vocabulary bare forms')
    short = fp(tbk, OFF['voc_short'], 15, 'vocabulary short glosses')
    rows = []
    for i, key in enumerate(VOC_ORDER):
        m = re.match(r'^(\S+)(?:\s*\(with (\w+)\.\))?', bare[i].strip())
        rows.append({'key': key, 'greek': conv(m.group(1)),
                     'caseTag': '(with %s.)' % m.group(2) if m.group(2)
                                else None,
                     'glossShort': re.split(r'\s{2,}', short[i])[0].strip(),
                     'audio': aud(VOC_CLIP[i])})
    return rows


def vocab_drills(tbk, conv):
    rows = vocab_rows(tbk, conv)
    def label(r):
        return r['greek'] + (' ' + r['caseTag'].replace('with ', '')
                             .replace('.', '') if r['caseTag'] else '')
    return [
        {'id': 'c8_drill_vocab_gk_en', 'type': 'select',
         'mode': 'fullOptionGrid',
         'title': 'Vocabulary:  Greek to English Drill',
         'instructions': 'Click on the matching word',
         'promptIsGreek': True, 'options': 'static',
         'optionValues': [r['glossShort'] for r in rows],
         'items': [{'greek': r['greek'], 'note': r['caseTag'],
                    'answer': r['glossShort'], 'audio': r['audio']}
                   for r in rows],
         'scored': True, 'ui': dict(SCORED_UI)},
        {'id': 'c8_drill_vocab_en_gk', 'type': 'select',
         'mode': 'fullOptionGrid',
         'title': 'Vocabulary:  English to Greek Drill',
         'instructions': 'Click on the matching word',
         'options': 'static', 'optionsAreGreek': True,
         'optionValues': [label(r) for r in rows],
         'items': [{'prompt': r['glossShort'], 'answer': label(r),
                    'audio': r['audio']} for r in rows],
         'scored': True, 'ui': dict(SCORED_UI)},
    ]


def vocab_speller(tbk, conv):
    prompts = fp(tbk, OFF['voc_spell_prompts'], 12, 'vocab speller prompts')
    keys = ['autos', 'ge', 'ego', 'hemeis', 'hemera', 'hoti', 'oun',
            'ochlos', 'para_gen', 'su', 'humeis', 'hupo_gen']
    rows = {r['key']: r for r in vocab_rows(tbk, conv)}
    items = []
    for i, key in enumerate(keys):
        p = re.split(r'\s{2,}', prompts[i].strip())[0].strip()
        m = re.match(r'^(.*?)(\s*\(with \w+\.\))?$', p)
        items.append({'prompt': m.group(1).strip(),
                      'note': (m.group(2) or '').strip() or None,
                      'answer': rows[key]['greek'],
                      'audio': rows[key]['audio']})
    return {'id': 'c8_ex_vocab_speller', 'type': 'spell',
            'title': 'Vocabulary Spelling Exercise',
            'instructions': 'Click letters below or use your keyboard to '
                            'spell it out.',
            'prompt': 'item', 'promptLabel': 'English Meaning',
            'accentsOptional': True, 'spellerTilesRef': 'chapt_1',
            'items': items,
            'ui': dict(SPELL_UI, fields=['English Meaning',
                                         'Spell Greek Word'])}


def pronoun_audio_map(conv):
    """Greek form -> clip, for the Greek-tap rule on the teaching pages.

    First occurrence wins. `mou` is overridden to h_gs1: the Learn
    First Person Paradigm page dispatches that clip, not h_1gs, which
    belongs to the drill (Nathanael, VERIFY-5F item 9).
    """
    m = {}
    for person, gender, case, num, legacy, gloss, clip in PARADIGM:
        m.setdefault(conv(legacy), aud(clip))
    for person, case, num, legacy, clip in EMPHATIC:
        m.setdefault(conv(legacy), aud(clip))
    m[conv('mou')] = aud('h_gs1')
    return m


def topic_pages(tbk, conv, aid, title, topics, popups=None, taps=False,
                audio_map=None, extra=None):
    out = {'id': aid, 'type': 'contentAudio', 'mode': 'topicPages',
           'title': title, 'topics': []}
    if taps:
        out['greekTaps'] = True
    if audio_map:
        out['audioMap'] = audio_map
    for tid, ttitle, offs in topics:
        content = []
        for off in offs:
            # Convert the WHOLE field before splitting into lines: a
            # Greek run can span a line break, and per-line conversion
            # leaves half of it unconverted and turns the other half's
            # English neighbour into Greek.
            content += [{'type': 'para', 'text': p}
                        for p in paras(conv_mixed(conv, tbk.prose(off)))]
        content += (extra or {}).get(tid, [])
        out['topics'].append({'id': tid, 'title': ttitle, 'content': content})
    if popups:
        out['popups'] = popups
    return out


def examples_rows(tbk, conv):
    """Learn Greek Personal Pronouns > Examples.

    THREE verses, each tappable (Nathanael, VERIFY-5F item 9). The
    third runs to two Greek lines. h_exx2 is the Jn 1:42 clip -- not
    h_ex2, which the TBK never dispatches on this page.
    """
    lines = [l for l in tbk.prose(OFF['gp_examples']).split('\r\n')
             if l.strip()][1:]
    spec = [(1, 'h_ex1'), (1, 'h_exx2'), (2, 'h_ex3')]
    rows, i = [], 0
    for nlines, clip in spec:
        greek = [sq(conv(lines[i + k])) for k in range(nlines)]
        i += nlines
        en = sq(lines[i])
        i += 1
        m = re.search(r'\(([^()]*\d[^()]*)\)\s*$', en)
        ref = m.group(1) if m else None
        if ref:
            en = en[:m.start()].strip()
        if not tbk.has_clip(clip):
            raise SystemExit('STOP: Examples clip %s is not dispatched'
                             % clip)
        rows.append({'greek': greek[0],
                     'greek2': greek[1] if nlines > 1 else None,
                     'gloss': en, 'ref': ref, 'audio': aud(clip)})
    return {'type': 'greekRows', 'layout': 'verseExamples', 'rows': rows}


def popup(tbk, conv, key, off, clips):
    lines = [sq(l) for l in tbk.field(off).split('\r\n') if l.strip()]
    head, rest = lines[0], lines[1:]
    examples = []
    for j in range(0, len(rest) - 1, 2):
        en = rest[j + 1]
        m = re.search(r'\(([^()]*\d[^()]*)\)\s*$', en)
        ref = m.group(1) if m else None
        if ref:
            en = en[:m.start()].strip()
        examples.append({'greek': sq(conv(rest[j])), 'gloss': en, 'ref': ref,
                         'audio': aud(clips[j // 2])})
    if len(examples) != len(clips):
        raise SystemExit('STOP: popup %s: expected %d examples, got %d'
                         % (key, len(clips), len(examples)))
    return {'id': key, 'title': conv_mixed(conv, head), 'examples': examples}


def paradigm_block(tbk, conv, off, title):
    rows = []
    for line in [l for l in tbk.field(off).split('\r\n') if l.strip()]:
        m = re.match(r'^\s*(N\.|G\.|D\.|A\.)\s+(.*)$', line)
        if m:
            rows.append({'label': m.group(1),
                         'text': conv_mixed(conv, sq(m.group(2)))})
    if len(rows) != 4:
        raise SystemExit('STOP: paradigm %s at %#x: expected 4 rows, got %d'
                         % (title, off, len(rows)))
    return {'type': 'pronounParadigm', 'title': title,
            'columns': ['Singular', 'Plural'], 'rows': rows}


def build(tbk, conv):
    f = tbk.field
    check_paradigms(tbk)
    # Vote the Greek format ids across every teaching field first, so a
    # run of accentless enclitics is still recognised as Greek.
    tbk.greek_fmts = underline.vote_greek_fmts(
        tbk.data, [OFF[k] for k in (
            'ec_definition', 'ec_types', 'ec_types2', 'ec_case', 'ec_number',
            'gp_intro', 'gp_first', 'gp_second', 'gp_examples',
            'gp_enclitics', 'gp_enclitics2', 'gp_declension', 'tp_intro',
            'tp_masc', 'tp_fem', 'tp_neut', 'tp_uses', 'tp_uses2')])
    ch = {'_comment': (
        'Chapter 8 (Personal Pronouns), assembled from 8_PRONS.TBK + '
        'CHAPT_8 audio + ch8railwalk.pdf. Fields read BY LENGTH PREFIX '
        '(5F-EXTRACTION-MAP.md sec 3). Every drill and exercise answer is '
        "looked up in the chapter's own three paradigm charts, and every "
        'form in that lookup table is asserted to appear verbatim in the '
        'chart field before it is used. Behavior fields are stamped by '
        'apply-behavior-matrix.py from the nine CONFIRMED chapter-8 rows '
        'of DRILLBEHAVIORLEDGER.csv and are not set here.'),
        'id': 'chapt_8', 'number': 8, 'title': 'Personal Pronouns'}

    lines = [l.strip() for l in f(OFF['objectives']).split('\r\n') if l.strip()]
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
    if len(body) != 7:
        raise SystemExit('STOP: expected 7 objectives, got %d' % len(body))
    ch['objectivesPreamble'] = 'You will be able to:'
    ch['objectives'] = [dash(conv_mixed(conv, sq(b.rstrip(',').rstrip('.'))))
                        for b in body]
    ch['vocab'] = list(LEMMA_KEYS)

    ch['learn'] = [
        {'id': 'c8_learn_objectives', 'type': 'contentAudio',
         'mode': 'objectivesPage', 'title': 'Learn Chapter Objectives',
         'instructions': ''},
        topic_pages(tbk, conv, 'c8_learn_english_concepts',
                    'Learn English Concepts',
                    [('definition', 'Definition', [OFF['ec_definition']]),
                     ('typesOfPronouns', 'Types of Pronouns',
                      [OFF['ec_types'], OFF['ec_types2']]),
                     ('case', 'Case', [OFF['ec_case']]),
                     ('number', 'Number', [OFF['ec_number']])]),
        topic_pages(tbk, conv, 'c8_learn_pronouns',
                    'Learn Greek Personal Pronouns',
                    [('introduction', 'Introduction', [OFF['gp_intro']]),
                     ('firstPersonParadigm', 'First Person Paradigm',
                      [OFF['gp_first']]),
                     ('secondPersonParadigm', 'Second Person Paradigm',
                      [OFF['gp_second']]),
                     ('examples', 'Examples', []),
                     ('enclitics', 'Enclitics',
                      [OFF['gp_enclitics'], OFF['gp_enclitics2']]),
                     ('declensionFormat', 'Declension Format',
                      [OFF['gp_declension']])], taps=True,
                    audio_map=pronoun_audio_map(conv),
                    extra={'examples': [examples_rows(tbk, conv)]}),
        topic_pages(tbk, conv, 'c8_learn_third_person',
                    'Learn Third Person Pronoun',
                    [('introduction', 'Introduction', [OFF['tp_intro']]),
                     ('thirdPersonParadigm', 'Third Person Paradigm',
                      [OFF['tp_masc'], OFF['tp_fem'], OFF['tp_neut']]),
                     ('threeUses', 'Three Uses',
                      [OFF['tp_uses'], OFF['tp_uses2']])],
                    audio_map=pronoun_audio_map(conv),
                    popups=[
                        popup(tbk, conv, 'asAPronoun', OFF['pop_pronoun'],
                              ['h_ex31', 'h_ex32', 'h_ex33']),
                        popup(tbk, conv, 'reflexiveIntensifier',
                              OFF['pop_reflexive'], ['h_ex3r1', 'h_ex3r2']),
                        popup(tbk, conv, 'adjectiveMeaningSame',
                              OFF['pop_same'], ['h_ex3a1', 'h_ex3a2'])],
                    taps=True),
        {'id': 'c8_learn_vocab', 'type': 'contentAudio', 'mode': 'flashcard',
         'title': 'Learn Vocabulary', 'pool': 'senses'},
        dict(interlinear(f, conv, OFF['learn_sm'], 'Rom 6:23a', 'h_sm',
                         'h_rm623a', 6),
             id='c8_learn_scripture', type='contentAudio',
             mode='interlinearVerse', title='Learn Scripture Memory'),
        bibliography(f),
    ]

    ch['drill'] = [
        translation_drill(tbk, conv, 'c8_drill_translation',
                          'Personal Pronoun Translation Drill', 20,
                          ('d2_p1', 'd2_p2', 'd2_o1', 'd2_o2', 'd2_o3',
                           'd2_refs'), D2_ANSWER, 'h_d2_',
                          'firstPersonParadigm'),
        translation_drill(tbk, conv, 'c8_drill_translation_autos',
                          'A\u1f50\u03c4\u03cc\u03c2 Translation Drill', 21,
                          ('d3_p1', 'd3_p2', 'd3_o1', 'd3_o2', 'd3_o3',
                           'd3_refs'), D3_ANSWER, 'h_d3_',
                          'thirdPersonParadigm'),
        case_drill(tbk, conv),
    ] + vocab_drills(tbk, conv) + [scripture_drill(tbk, conv)]

    ch['exercise'] = [pron_speller(tbk, conv), vocab_speller(tbk, conv),
                      scripture_speller(tbk, conv)]

    ch['quickReview'] = [
        {'id': 'c8_qr_vocab', 'type': 'contentAudio', 'mode': 'reviewVocab',
         'title': 'Review Vocabulary Chart', 'pool': 'lemmas', 'columns': 2,
         'showNtFreq': True,
         'footnote': 'The number after the translation is the number of '
                     'times the word occurs in the New Testament.',
         'playAll': {'audio': aud('h_vocl8'), 'label': 'Say Whole List'}},
        {'id': 'c8_qr_first', 'type': 'contentAudio', 'mode': 'paradigmChart',
         'title': 'Review Personal Pronouns:  1st Person',
         'paradigm': paradigm_block(tbk, conv, OFF['qr_first'],
                                    'First Person Personal Pronouns'),
         'sayWhole': {'label': 'Say Whole Paradigm', 'audio': aud('h_1par')}},
        {'id': 'c8_qr_second', 'type': 'contentAudio', 'mode': 'paradigmChart',
         'title': 'Review Personal Pronouns:  2nd Person',
         'paradigm': paradigm_block(tbk, conv, OFF['qr_second'],
                                    'Second Person Personal Pronouns'),
         'sayWhole': {'label': 'Say Whole Paradigm', 'audio': aud('h_2par')}},
        {'id': 'c8_qr_third', 'type': 'contentAudio', 'mode': 'paradigmChart',
         'title': 'Review Pronouns:  Personal 3rd Person',
         'paradigms': [
             dict(paradigm_block(tbk, conv, OFF['qr_third_masc'],
                                 'Third Person Personal Pronouns'),
                  gender='Masculine',
                  sayWhole={'label': 'Say Whole Paradigm',
                            'audio': aud('h_3mpar')}),
             dict(paradigm_block(tbk, conv, OFF['qr_third_fem'],
                                 'Third Person Pronouns'), gender='Feminine',
                  sayWhole={'label': 'Say Whole Paradigm',
                            'audio': aud('h_3fpar')}),
             dict(paradigm_block(tbk, conv, OFF['qr_third_neut'],
                                 'Third Person Pronouns'), gender='Neuter',
                  sayWhole={'label': 'Say Whole Paradigm',
                            'audio': aud('h_3npar')})],
         '_more_note': 'Masculine, then More to Feminine, then More to '
                       'Neuter, Back stepping down.'},
    ]
    for aid, title, off, ref, prefix, whole, n, rep in [
        ('c8_qr_scripture_146a', 'Review Scripture Memory:  Jn 14:6a',
         OFF['review_sm_146a'], 'John 14:6a', 'c_sm', 'c_sm14_6', 14, None),
        ('c8_qr_scripture_146b', 'Review Scripture Memory:  Jn 14:6b',
         OFF['review_sm_146b'], 'John 14:6b', 'd_sm', 'd_jn146b', 9, None),
        ('c8_qr_scripture_rom323', 'Review Scripture Memory:  Rom 3:23',
         OFF['review_sm_rom323'], 'Rom 3:23', 'e_sm', 'e_rom323', 9, None),
        ('c8_qr_scripture_jn11', 'Review Scripture Memory:  Jn 1:1',
         OFF['review_sm_jn11'], 'Jn 1:1', 'f_sm', 'f_jn1_1', 17,
         JN11_REPEATS),
        ('c8_qr_scripture_rom623', 'Review Scripture Memory:  Rom 6:23a',
         OFF['review_sm_rom623'], 'Rom 6:23a', 'h_sm', 'h_rm623a', 6, None),
    ]:
        v = interlinear(f, conv, off, ref, prefix, whole, n, rep)
        v.update({'id': aid, 'type': 'contentAudio',
                  'mode': 'interlinearVerse', 'title': title})
        ch['quickReview'].append(v)

    ch['feedback'] = {
        'correct': ['Great!', 'Congratulations', 'Perfect!', 'Right On!',
                    'Fantastic!', 'Yes'],
        'incorrect': ['Try again', 'Swing and a miss',
                      'Repetition will get it', 'Never give up',
                      'Keep trying'],
    }
    ch['sequence'] = [
        'c8_learn_objectives', 'c8_learn_english_concepts',
        'c8_learn_pronouns', 'c8_drill_translation', 'c8_learn_third_person',
        'c8_drill_translation_autos', 'c8_drill_case', 'c8_ex_speller',
        'c8_learn_vocab', 'c8_drill_vocab_gk_en', 'c8_drill_vocab_en_gk',
        'c8_ex_vocab_speller', 'c8_learn_scripture',
        'c8_drill_scripture_memory', 'c8_ex_scripture_speller',
        'c8_qr_vocab', 'c8_qr_first', 'c8_qr_second', 'c8_qr_third',
        'c8_qr_scripture_146a', 'c8_qr_scripture_146b',
        'c8_qr_scripture_rom323', 'c8_qr_scripture_jn11',
        'c8_qr_scripture_rom623', 'c8_learn_bibliography',
    ]
    ch['_sequence_note'] = ('Rail order from ch8railwalk.pdf (Nathanael, '
                            '2026-08-07).')
    ch['_audioVerify'] = (
        'CHAPT_8 ships 181 WAVs. i_rm623b is chapter 9\'s Rom 6:23b, '
        'shipped forward and NOT used here. Leave any clip the build '
        'cannot place unwired rather than inventing a surface for it; '
        'h_kai, h_kagw, h_gs1 and h_exx2 are single-word clips whose '
        'surfaces the extraction did not settle and are a VERIFY-5F ask.')
    return ch


def bibliography(f):
    txt = re.sub(r'\s+', ' ', f(OFF['biblio'])).strip()
    items = [i.strip() for i in
             re.split(r'(?=(?:Machen|Mounce|Summers|Wenham),)', txt)
             if i.strip()][:4]
    titles = ['New Testament Greek for Beginners',
              'Basics of Biblical Greek: Grammar',
              'Essentials of New Testament Greek',
              'The Elements of New Testament Greek']
    out = []
    for it, title in zip(items, titles):
        if title not in it:
            raise SystemExit('STOP: bibliography title %r not found in %r'
                             % (title, it))
        out.append(dash(it.replace(title, '[[i]]%s[[/i]]' % title)))
    return {'id': 'c8_learn_bibliography', 'type': 'contentAudio',
            'mode': 'textPage', 'title': 'Learn Bibliography',
            'content': [{'type': 'biblist', 'items': out}]}


def conv_lexical(conv, text):
    """A lexical-form line is pure Greek up to its case tag, which is
    English: "para< (with gen.)". Convert the head, keep the tag."""
    head, sep, tail = text.partition('(')
    return (conv(head.rstrip()) + ((' ' + sep + tail) if sep else '')).strip()


def build_lexicon(tbk, conv):
    rows = vocab_rows(tbk, conv)
    lex = fp(tbk, OFF['voc_lexical'], 13, 'vocabulary lexical forms')
    gl = fp(tbk, OFF['voc_gloss'], 13, 'vocabulary glosses')
    chart = re.sub(r'\s+', ' ', tbk.field(OFF['review_vocab']))
    by_key = {r['key']: r for r in rows}
    groups = {'autos': ['autos'], 'ge': ['ge'], 'ego': ['ego', 'hemeis'],
              'hemera': ['hemera'], 'hoti': ['hoti'], 'oun': ['oun'],
              'ochlos': ['ochlos'],
              'para': ['para_gen', 'para_dat', 'para_acc'],
              'su': ['su', 'humeis'], 'hupo': ['hupo_gen', 'hupo_acc']}
    lex_by_key = {}
    li = 0
    for key in LEMMA_KEYS:
        n = 3 if key == 'para' else (2 if key == 'hupo' else 1)
        lex_by_key[key] = (sq(lex[li]), [sq(g) for g in gl[li:li + n]])
        li += n
    lemmas = {}
    for key in LEMMA_KEYS:
        freq = NT_FREQ[key]
        if '(%d)' % freq not in chart:
            raise SystemExit('STOP: NT frequency %d for %s is not on the '
                             'Review Vocabulary Chart' % (freq, key))
        members = [by_key[k] for k in groups[key]]
        lemmas[key] = {
            'greek': members[0]['greek'], 'translit': key,
            'lexicalForm': conv_lexical(conv, lex_by_key[key][0]),
            'gloss': '; '.join(lex_by_key[key][1]),
            'glossShort': members[0]['glossShort'],
            'audio': members[0]['audio'], 'ntFreq': freq,
            'senses': [{'greek': m['greek'], 'caseTag': m['caseTag'],
                        'glossShort': m['glossShort'], 'audio': m['audio']}
                       for m in members],
        }
        # RATIFIED 2026-08-27 (VERIFY-5H-2 (v)): a Review chart row taps EACH
        # printed form; the flashcard plays the lemma clip. The paired
        # pronouns are the only ch8 rows that print two full forms.
        if key in ('ego', 'su'):
            # The lemma clip is the PAIRED recording that says both words
            # (h_voc3 / h_voc9, listen-confirmed 2026-08-15, VERIFY-5F-3
            # item 4) -- NOT members[0]'s single-form clip, which is what
            # the generic path above picks.
            paired = aud('h_voc3' if key == 'ego' else 'h_voc9')
            lemmas[key]['audio'] = paired
            lemmas[key]['_audio_note'] = (
                'Paired flashcard: %s says BOTH words (listen-confirmed '
                '2026-08-15, VERIFY-5F-3 item 4); senses keep the '
                'single-form clips.' % paired)
            lemmas[key]['parts'] = [{'greek': m['greek'], 'audio': m['audio']}
                                    for m in members]
            lemmas[key]['_parts_note'] = (
                'VERIFY-5H-2 (v) ruling 2026-08-27: the Review Vocabulary '
                'Chart taps each printed form independently (parts); the '
                'Learn flashcard plays the lemma audio, which recites both '
                'forms.')
    return {'_comment': (
                'Chapter 8 lexicon, assembled from 8_PRONS.TBK (cohort 5F). '
                'TEN lemmas, THIRTEEN flashcard entries and FIFTEEN drill '
                'entries: para splits three ways and hupo two by case '
                '(the chapter-6 pattern), and ego/hemeis and su/humeis are '
                'PAIRED lemmas that split into two drill entries each -- a '
                'shape no earlier chapter produced. senses[] carries the '
                'split; ntFreq values are the Review Vocabulary Chart\'s '
                'own counts (0x0f01bc).'),
            'lemmas': lemmas, 'exampleWords': {}}


def post_patches(ch):
    """Stage 8.7: ratified rulings re-applied on any rebuild (2026-08-26/27),
    so a regeneration cannot reverse a hand-approved fix. Update THIS
    function when a new ruling lands against chapter 8."""
    by_id = {a['id']: a for a in ch['drill']}
    # 5H-SPEC2 3.1 (LOOKBACK): the Case Drill's Hint is FORM-DEPENDENT in the
    # original (D-46 class) -- read from the WordCounter dispatch at
    # 8_PRONS.TBK 0x10d820: first person -> Hint (field 0xc5d4a), second ->
    # Hint2 (0xc6cd4), autos -> Hint3 (0xc4676). DOSBox-confirmed
    # (VERIFY-5H-2 (s)): each person opens its own chart, Cancel only.
    case = by_id['c8_drill_case']
    if len(case['items']) != len(CASE_HINT):
        raise SystemExit('STOP: Case Drill has %d items, the ratified hint '
                         'routing has %d -- re-read the dispatch at 0x10d820'
                         % (len(case['items']), len(CASE_HINT)))
    for it, ref in zip(case['items'], CASE_HINT):
        it['hintRef'] = ref
    case['_hint_note'] = (
        'FORM-DEPENDENT HINT (D-46 class), dispatch at 8_PRONS.TBK 0x10d820; '
        'DOSBox-confirmed VERIFY-5H-2 (s). Ratified 2026-08-27.')
    # VERIFY-5H-2 (s): the Autos Translation Drill shows the SAME hint on
    # every item -- a four-page Back/More stack (the third-person paradigm
    # split by gender, then the Three Uses page). Per-item routing REMOVED;
    # D-57 covers four pages where the original draws two.
    autos = by_id['c8_drill_translation_autos']
    for it in autos['items']:
        it.pop('hintRef', None)
    autos['ui'].pop('hintRef', None)
    autos['ui']['hintPages'] = [
        {'hintRef': 'thirdPersonParadigm', 'chartIndex': 0,
         'title': 'Third Person Paradigm: Masculine'},
        {'hintRef': 'thirdPersonParadigm', 'chartIndex': 1,
         'title': 'Third Person Paradigm: Feminine'},
        {'hintRef': 'thirdPersonParadigm', 'chartIndex': 2,
         'title': 'Third Person Paradigm: Neuter'},
        {'contentRef': 'threeUses', 'title': 'Three Uses'}]
    autos['_hint_note'] = (
        'VERIFY-5H-2 (s) ruling 2026-08-27: the original shows one paged '
        'hint on every item; the WordCounter dispatch at 0x7bf39 does not '
        'select the opening page in practice. Neuter page KEPT: items 1 and '
        '9 are neuter forms. D-57.')
    return ch


def validate(ch):
    ids = set()
    for sec in ('learn', 'drill', 'exercise', 'quickReview'):
        for a in ch[sec]:
            if a['id'] in ids:
                raise SystemExit('STOP: duplicate id %s' % a['id'])
            ids.add(a['id'])
    if set(ch['sequence']) != ids:
        raise SystemExit('STOP: sequence/activity mismatch: %r'
                         % (set(ch['sequence']) ^ ids))


def main():
    tbkpath, fontpath, outdir = sys.argv[1], sys.argv[2], sys.argv[3]
    tbk = Tbk(tbkpath)
    conv = make_conv(json.load(open(fontpath)))
    ch = build(tbk, conv)
    ch = post_patches(ch)
    validate(ch)
    lex = build_lexicon(tbk, conv)
    for name, obj in (('chapt-08.json', ch), ('lexicon-chapt08.json', lex)):
        with open('%s/%s' % (outdir, name), 'w', encoding='utf-8') as fh:
            json.dump(obj, fh, ensure_ascii=False, indent=1)
            fh.write('\n')
        print('wrote %s/%s' % (outdir, name))


if __name__ == '__main__':
    main()
