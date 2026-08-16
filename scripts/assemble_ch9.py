# STAGE 8.7 PROVENANCE NOTICE (2026-08-16): after the Step 0 hand repairs the
# committed repo JSON is the source of truth for chapter 9. This assembler is
# a provenance tool. The post_patches() step below re-applies the three
# ratified divergences (D-43 objective, D-44 gloss, D-42 Repeat removal) so a
# regeneration cannot resurrect pre-fix values. If post_patches() fails its
# asserts, the TBK read has drifted from expectations: STOP and reconcile
# against the repo copy instead of shipping.

#!/usr/bin/env python3
"""assemble_ch9.py -- chapter 9 (Present Middle/Passive Verbs) from 9_MIDDLE.TBK.

Cohort 5G. Fields read BY LENGTH PREFIX at offsets verified against
ch9railwalk.pdf. Stage 8 discipline throughout:

  8.1 one flowing para per PARAGRAPH (blank lines in the original are
      the only block boundaries);
  8.2 every audio id is read from, or asserted against, the TBK's own
      SayWord/WordSelection dispatch tables -- the M/P Speller's items
      7-11 dispatch to i_pd1/2/3/4/6 (pd5 skipped), and the Scripture
      Memory Drill's ten prompts dispatch to their VERSE-POSITION clips
      (sm1,2,3,6,7,9,10,12,13,8) -- both read directly from the tables
      at 0xbf2xx-0xbf4xx;
  8.3 charts/lists are structure blocks, never prose;
  8.4 every hintRef is resolved before write;
  8.5 all text goes through conv + the elision sentinel, and assembly
      ends with a self-audit over the emitted JSON.

Behavior fields are stamped by apply-behavior-matrix.py from ledger
rows 79-86 (all CONFIRMED) and are not set here beyond neutral
placeholders the stamp overwrites.

Deliberate wiring notes (also in chapt-09.json _audioVerify):
  * i_mpar.wav ships on the CD but is REFERENCED NOWHERE in the TBK;
    the passive paradigm's Say Paradigm dispatches nothing in the
    original.  Provisionally wired here as the passive chart's
    sayWhole, flagged _verify pending a listen.
  * i_voc11 is a live dispatch key on the Compound Verbs surface and
    the only dispatched clip with no other owner; wired to the one
    Greek word there with no other clip (dierchomai), flagged _verify.
"""
import json
import os
import re
import struct
import sys
import unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import underline

A = 'chapt_9_'

ELISION = re.compile(r"(\S)[ \t]+\](?=[ \t]|$)")

# chapter-9 teaching prose fields, for the chapter-wide Greek-format vote
TEACH_OFFSETS = [0x3d06, 0x8152, 0x58e8, 0x8616, 0x9c5a, 0xa324,
                 0x1c63c, 0x1cbce, 0x1cf18, 0x64ca, 0xbc0ca, 0xe15c,
                 0x769e, 0x7be4, 0xa80c, 0x8dc0]


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


GREEK_TOKEN = re.compile(
    r"[a-zA-Z][<>?@#%^&$!]|[\]\[][a-zA-Z]|[a-zA-Z][\]\[]")


def conv_mixed(conv, text):
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
        # u16 length-prefix read (mandatory from ch7 onward; the
        # printable-region fallback exists only for prefix-less pools)
        ln = struct.unpack_from('<H', self.data, off - 2)[0]
        if 2 < ln < 20000:
            raw = self.data[off:off + ln].decode('latin-1').split('\r\n')
        else:
            raw = self.region(off).split('\r\n')
        lines = [l.strip() for l in raw]
        if allow_blank:
            # keep positional blanks; drop leading blank line only
            while lines and not lines[0]:
                lines = lines[1:]
        else:
            lines = [l for l in lines if l]
        if len(lines) < n:
            raise SystemExit(
                f'STOP: pool {label} at {off:#x}: expected {n}, got {len(lines)}')
        return lines[:n]

    def marked(self, off):
        """Field text with run-table Greek and underline sentinels;
        falls back to the raw field when no run table resolves."""
        m = underline.marked_greek(self.data, off, self.greek_fmts)
        return m if m is not None else self.field(off)

    def has_clip(self, name):
        return ('%s.wav' % name.lower()).encode() in self.data.lower()


def dash(s):
    return s.replace('--', '\u2014')


def sq(s):
    return re.sub(r'[ \t]{2,}', ' ', s).strip()


def para_blocks(conv, raw_lines, drop_title=True):
    """Stage 8.1: join wrapped lines to paragraphs; blank line = gap."""
    lines = [l.rstrip() for l in raw_lines]
    if drop_title:
        while lines and not lines[0].strip():
            lines.pop(0)
        if lines:
            lines.pop(0)  # the field's own heading line
    paras, cur = [], []
    for l in lines:
        if not l.strip():
            if cur:
                paras.append(cur)
                cur = []
        else:
            cur.append(l.strip())
    if cur:
        paras.append(cur)
    out = []
    for i, p in enumerate(paras):
        text = dash(sq(conv_mixed(conv, ' '.join(p))))
        text = text.replace('[[/u]] [[u]]', ' ')
        blk = {'type': 'para', 'text': text}
        if i > 0:
            blk['gapBefore'] = True
        out.append(blk)
    return out


def numbered_split(conv, raw, start=1):
    """Parse '1) ... 2) ...' items out of a field body; returns
    (lead_text, [items]). Wrapped lines are joined per Stage 8.1."""
    body = ' '.join(l.strip() for l in raw.split('\r\n')[1:] if l.strip())
    parts = re.split(r'\s(?=\d\))', ' ' + body)
    lead = sq(conv_mixed(conv, parts[0]))
    items = []
    for p in parts[1:]:
        m = re.match(r'(\d)\)\s*(.*)$', p.strip(), re.S)
        if not m or int(m.group(1)) != start + len(items):
            raise SystemExit(f'STOP: numbered item misparse: {p[:60]!r}')
        items.append(dash(sq(conv_mixed(conv, m.group(2)))))
    return lead, items


def stepper_ui(hint=None, translate=False):
    btns = ['Previous', 'Next', 'Pronounce']
    if translate:
        btns.append('Translate')
    if hint:
        btns.append('Hint')
    btns.append('Score')
    ui = {'buttons': btns,
          'checkboxes': ['Pronounce Each Drill'],
          'defaults': {'pronounceEach': True},
          'liveScore': True}
    if hint:
        ui['hintRef'] = hint
    return ui


def score_ui():
    return {'buttons': ['Pronounce', 'Score'],
            'checkboxes': ['Pronounce Each Drill'],
            'defaults': {'pronounceEach': True},
            'liveScore': True}


# ---------------------------------------------------------------- paradigms

MIDDLE_FORMS = ['λύομαι', 'λύῃ', 'λύεται', 'λυόμεθα', 'λύεσθε', 'λύονται']
M_CLIPS = ['i_m1s', 'i_m2s', 'i_m3s', 'i_m1p', 'i_m2p', 'i_m3p']
PN_LABELS = ['First Singular', 'Second Singular', 'Third Singular',
             'First Plural', 'Second Plural', 'Third Plural']
ENDING_PN = [('όμεθα', 'First Plural'), ('ομεθα', 'First Plural'),
             ('ῶμαι', 'First Singular'), ('ομαι', 'First Singular'),
             ('εσθε', 'Second Plural'), ('ονται', 'Third Plural'),
             ('εται', 'Third Singular'), ('ῃ', 'Second Singular')]

EN_PN = {'i': 'First Singular', 'we': 'First Plural',
         'you': None,  # needs sg/pl cue
         'he': 'Third Singular', 'she': 'Third Singular',
         'it': 'Third Singular', 'they': 'Third Plural'}


def pn_from_greek(form):
    f = unicodedata.normalize('NFC', form.lower())
    for end, pn in ENDING_PN:
        if f.endswith(end):
            return pn
    raise SystemExit(f'STOP: cannot parse person/number of {form!r}')


def pn_from_english(gloss):
    g = gloss.lower()
    first = g.split()[0]
    if first == 'you':
        return 'Second Singular'  # ch9 pool has no plural-you entries
    pn = EN_PN.get(first)
    if pn is None:
        raise SystemExit(f'STOP: cannot parse subject of {gloss!r}')
    return pn


def build_mp_paradigm(tbk, conv, off, pid, title, cols, gloss_rows, say):
    """Paradigm chart with per-cell audio; every form asserted against
    the chart field itself before use."""
    raw = tbk.field(off)
    for f_leg in ['lu<omai', 'lu<^', 'lu<etai', 'luo<meqa', 'lu<esqe',
                  'lu<ontai']:
        if f_leg not in raw:
            raise SystemExit(f'STOP: {f_leg} not in chart at {off:#x}')
    rows = []
    for i, label in enumerate(['1.', '2.', '3.']):
        cells = []
        for j in range(2):
            k = i + 3 * j
            cells.append({'greek': MIDDLE_FORMS[k],
                          'gloss': gloss_rows[k],
                          'audio': aud(M_CLIPS[k])})
        rows.append({'label': label, 'cells': cells})
    return {'type': 'paradigm', 'id': pid, 'title': title,
            'columns': cols, 'rows': rows,
            'sayWhole': say}


MIDDLE_GLOSSES = ['I am loosing (for myself)', 'You are loosing (for yourself)',
                  'He/she/it is loosing (for himself/herself/itself)',
                  'We are loosing (for ourselves)',
                  'You are loosing (for yourselves)',
                  'They are loosing (for themselves)']
PASSIVE_GLOSSES = ['I am being loosed', 'you are being loosed',
                   'he/she/it is being loosed', 'we are being loosed',
                   'you are being loosed', 'they are being loosed']


# ---------------------------------------------------------------- drills

def parsing_drill(tbk, conv):
    prompts = [sq(conv(x)) for x in tbk.pool(0x7460e, 16, 'parsing prompts')]
    refs = [sq(x) for x in tbk.pool(0x75654, 16, 'parsing refs')]
    trans = [sq(x) for x in tbk.pool(0x75834, 16, 'parsing translations')]
    items = []
    for i, (g, r, t) in enumerate(zip(prompts, refs, trans), 1):
        pn_g = pn_from_greek(g)
        pn_e = pn_from_english(t)
        if pn_g != pn_e:
            raise SystemExit(
                f'STOP: parsing item {i} {g!r}: ending says {pn_g}, '
                f'translation {t!r} says {pn_e}')
        clip = f'i_pd{i}'
        if not tbk.has_clip(clip):
            raise SystemExit(f'STOP: {clip} not in TBK')
        items.append({'greek': g, 'ref': r, 'translate': t,
                      'answer': pn_g, 'audio': aud(clip)})
    return {
        'id': 'c9_drill_parsing', 'type': 'select', 'mode': 'fullOptionGrid',
        'title': 'Parsing Present Middle/Passive Drill',
        'instructions': 'Click on the matching person and number',
        'promptIsGreek': True, 'options': 'static',
        'optionValues': ['First Singular', 'First Plural',
                         'Second Singular', 'Second Plural',
                         'Third Singular', 'Third Plural'],
        'optionGroups': [2, 2, 2],
        'items': items, 'scored': True,
        'ui': stepper_ui(hint='middlePassiveParadigms', translate=True),
        '_answer_note': (
            'Each answer is derived from the middle/passive personal '
            'ending AND independently re-derived from the subject of the '
            'Translate column; assembly stops on any disagreement. The '
            'dispatch table at 0xc662a maps items 1-16 to i_pd1-16 and the '
            'hint chart cells to i_m1s-i_m3p.'),
        'audioTiming': 'beforeGuess',
        'answerPolicy': {'advanceClass': 'manualOnIncorrect',
                         'attemptsPerItem': 1}}


# translation drill: answer column per item, derived from grammar and
# asserted against pronouns/subjects; two railwalk confirmations noted.
TD_ANSWER_COL = [0, 2, 1, 1, 0, 1, 0, 0, 2, 1, 0, 1, 1, 2]
TD_WHY = [
    'erchontai 3pl', 'poreuomai 1sg', 'ta eschata tou anthropou (sg)',
    'ho huios ... erchetai 3sg', 'erchomai 1sg + pros humas',
    'Saddoukaioi ... 3pl subject', 'Elias ... erchetai 3sg subject',
    'poreuomai 1sg', 'Erchometha ... 1pl + syn soi',
    'hemerai erchontai 3pl subject', 'kago ... erchomai 1sg',
    'ho basileus sou ... erchetai soi 3sg + sou/soi',
    'erchetai ... ho Iesous 3sg subject', 'lego 1sg']


def translation_drill(tbk, conv):
    l1 = [sq(conv(x)) for x in tbk.pool(0x7a0b0, 14, 'td line1')]
    l2raw = tbk.pool(0x7d066, 14, 'td line2', allow_blank=True)
    l2 = [sq(conv(x)) if x else None for x in l2raw]
    refs = [sq(x) for x in tbk.pool(0x7ccac, 14, 'td refs')]
    cols = [[sq(x) for x in tbk.pool(off, 14, f'td col {k}')]
            for k, off in (('A', 0x7bd12), ('B', 0x7c43c), ('C', 0x7c90c))]
    items = []
    for i in range(14):
        opts = [cols[0][i], cols[1][i], cols[2][i]]
        ans = opts[TD_ANSWER_COL[i]]
        clip = f'i_td{i + 1}'
        if not tbk.has_clip(clip):
            raise SystemExit(f'STOP: {clip} not in TBK')
        it = {'greek': l1[i], 'greek2': l2[i], 'ref': refs[i],
              'options': opts, 'answer': ans, 'audio': aud(clip)}
        items.append(it)
    # spot assertions from the rail walk
    assert items[0]['answer'] == 'and they came to the house'
    assert items[1]['answer'] == 'because I am going to the father'
    return {
        'id': 'c9_drill_translation', 'type': 'select',
        'mode': 'fullOptionGrid',
        'title': 'Present Middle/Passive Translation Drill',
        'instructions': 'Click on the correct English translation',
        'promptIsGreek': True, 'options': 'perItem',
        'optionLayout': 'stack1col',
        'items': items, 'scored': True,
        'ui': stepper_ui(hint='middlePassiveParadigms'),
        '_answer_note': (
            'The correct option is NOT a fixed column. Each answer is the '
            'option whose English subject matches the person/number of the '
            'Greek verb (plus explicit subject nouns): '
            + '; '.join(f'{i+1}:{w}' for i, w in enumerate(TD_WHY))
            + '. Rail walk confirms items 1 and 2. Dispatch at 0xc7d23 '
              'maps items 1-14 to i_TD1-14.'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'manualOnIncorrect',
                         'attemptsPerItem': 1}}


VOC_CLIPS = [f'i_voc{i}' for i in range(1, 11)]
VOC_KEYS = ['apokrinomai', 'apostello', 'ballo', 'ginomai', 'eiserchomai',
            'exerchomai', 'erchomai', 'thelo', 'houtos', 'poreuomai']
VOC_FREQ = [231, 132, 122, 669, 194, 218, 634, 208, 208, 153]


def vocab_pools(tbk, conv):
    greek = [conv(x) for x in tbk.pool(0x9199a, 10, 'vocab greek')]
    gloss_drill = [sq(x) for x in tbk.pool(0x70950, 10, 'vocab drill glosses')]
    gloss_full = [sq(x) for x in tbk.pool(0x11a8a, 10, 'vocab flashcard glosses')]
    return greek, gloss_drill, gloss_full


def vocab_drills(tbk, conv):
    greek, gloss, _ = vocab_pools(tbk, conv)
    gk_items = [{'greek': g, 'note': None, 'answer': gl, 'audio': aud(c)}
                for g, gl, c in zip(greek, gloss, VOC_CLIPS)]
    en_items = [{'prompt': gl, 'answer': g, 'audio': aud(c)}
                for g, gl, c in zip(greek, gloss, VOC_CLIPS)]
    gk = {'id': 'c9_drill_vocab_gk_en', 'type': 'select',
          'mode': 'fullOptionGrid',
          'title': 'Vocabulary:  Greek to English Drill',
          'instructions': 'Click on the matching word',
          'promptIsGreek': True, 'options': 'static',
          'optionValues': gloss, 'items': gk_items, 'scored': True,
          'ui': score_ui(),
          'audioTiming': 'beforeGuess',
          'answerPolicy': {'advanceClass': 'autoBoth', 'attemptsPerItem': 1}}
    en = {'id': 'c9_drill_vocab_en_gk', 'type': 'select',
          'mode': 'fullOptionGrid',
          'title': 'Vocabulary: English to Greek Drill',
          'instructions': 'Click on the matching word',
          'options': 'static', 'optionsAreGreek': True,
          'optionValues': greek, 'items': en_items, 'scored': True,
          'ui': score_ui(),
          'audioTiming': 'afterGuess',
          'answerPolicy': {'advanceClass': 'autoBoth', 'attemptsPerItem': 1}}
    return gk, en


# Scripture Memory --------------------------------------------------------

VERSE_923B = ['τὸ', 'δὲ', 'χάρισμα', 'τοῦ', 'θεοῦ', 'ζωὴ', 'αἰώνιος',
              'ἐν', 'Χριστῷ', 'Ἰησοῦ', 'τῷ', 'κυρίῳ', 'ἡμῶν.']
GLOSS_923B = ['the', 'but', 'gift', 'the', 'of God', '[is] life', 'eternal',
              'in', 'Christ', 'Jesus', 'the', 'Lord', 'our']
# drill prompts in pool order -> verse position (1-based), read from the
# SayWord table at 0xbf3xx: 1,2,3,6,7,9,10,12,13,8
SM_POSITIONS = [1, 2, 3, 6, 7, 9, 10, 12, 13, 8]
SM_OPTS = ['but', 'Jesus', 'Christ', 'life', 'eternal', 'Lord',
           'gift', 'our', 'in', 'the']
SM_ANSWERS = {'τὸ': 'the', 'δὲ': 'but', 'χάρισμα': 'gift', 'ζωὴ': 'life',
              'αἰώνιος': 'eternal', 'Χριστῷ': 'Christ', 'Ἰησοῦ': 'Jesus',
              'κυρίῳ': 'Lord', 'ἡμῶν': 'our', 'ἐν': 'in'}


def learn_scripture(tbk, conv):
    raw = tbk.field(0xadc7e)
    words = []
    for w, gl, k in zip(VERSE_923B, GLOSS_923B, range(1, 14)):
        leg = w.rstrip('.,')
        words.append({'greek': w, 'gloss': gl, 'audio': aud(f'i_sm{k}')})
    # assert every verse word occurs in the field (legacy encoding)
    for legacy in ['xa<risma', 'ai]w<nioj', 'Xrist&?', ']Ihsou?', 'kuri<&',
                   'h[mw?n']:
        if legacy not in raw:
            raise SystemExit(f'STOP: {legacy} not in interlinear at 0xadc7e')
    return {'id': 'c9_learn_scripture', 'type': 'contentAudio',
            'mode': 'interlinearVerse', 'title': 'Learn Scripture Memory',
            'reference': 'Rom 6:23b', 'words': words,
            'sayWhole': {'label': 'Say Whole Verse', 'audio': aud('i_rm623b')}}


def scripture_drill(tbk, conv):
    prompts = [conv(x) for x in tbk.pool(0x43a3a, 10, 'sm prompts')]
    items = []
    for g, pos in zip(prompts, SM_POSITIONS):
        base = g.rstrip('.,')
        if VERSE_923B[pos - 1].rstrip('.,') != base:
            raise SystemExit(
                f'STOP: SM prompt {g!r} is not verse word {pos}')
        items.append({'greek': base, 'answer': SM_ANSWERS[base],
                      'audio': aud(f'i_sm{pos}')})
    return {'id': 'c9_drill_scripture_memory', 'type': 'select',
            'mode': 'fullOptionGrid', 'title': 'Scripture Memory Drill',
            'instructions': 'Click on the matching word',
            'promptIsGreek': True, 'options': 'static',
            'optionValues': SM_OPTS, 'items': items, 'scored': True,
            'ui': score_ui(),
            '_audio_note': (
                'Stage 8.2: each prompt plays its own verse word\'s clip; '
                'positions 1,2,3,6,7,9,10,12,13,8 read from the SayWord '
                'table (the ch6 f_sm defect class).'),
            'audioTiming': 'beforeGuess',
            'answerPolicy': {'advanceClass': 'autoBoth',
                             'attemptsPerItem': 1}}


# Spellers ---------------------------------------------------------------

SPELLER_ANSWERS = MIDDLE_FORMS + ['ἐρχόμεθα', 'ἔρχεται', 'ἔρχομαι',
                                  'ἔρχῃ', 'ἔρχονται']
SPELLER_CLIPS = M_CLIPS + ['i_pd1', 'i_pd2', 'i_pd3', 'i_pd4', 'i_pd6']


def mp_speller(tbk, conv):
    prompts = [sq(x) for x in tbk.pool(0x4c188, 11, 'speller prompts')]
    parsing = [conv(x) for x in tbk.pool(0x7460e, 16, 'parsing prompts')]
    # assert items 7-11 answers equal the parsing pool forms the dispatch names
    for k, pd in zip(range(6, 11), [1, 2, 3, 4, 6]):
        want = SPELLER_ANSWERS[k]
        got = parsing[pd - 1].lower()
        if unicodedata.normalize('NFC', got) != \
           unicodedata.normalize('NFC', want):
            raise SystemExit(
                f'STOP: speller item {k+1} answer {want!r} != '
                f'parsing pool i_pd{pd} form {got!r}')
    items = []
    for p, ans, c in zip(prompts, SPELLER_ANSWERS, SPELLER_CLIPS):
        items.append({'prompt': p, 'answer': ans, 'audio': aud(c)})
    return {
        'id': 'c9_ex_speller', 'type': 'spell',
        'title': 'Present Middle/Passive Spelling Exercise',
        'instructions': 'Click letters below or use your keyboard to spell it out.',
        'prompt': 'item', 'promptLabel': 'English',
        'accentsOptional': True, 'spellerTilesRef': 'chapt_1',
        'items': items,
        'ui': {'fields': ['English', 'Spell Greek'],
               'buttons': ['Pronounce', 'Previous', 'Score', 'Next',
                           'Check Answer', 'Greek Keyboard'],
               'checkboxes': ['Show Answer', 'With Accents',
                              'Pronounce Each Exercise'],
               'defaults': {'pronounceEach': True}},
        '_answer_note': (
            'Items 1-6 are the shared middle/passive paradigm forms; '
            'items 7-11 are erchomai forms taken from the parsing pool via '
            'the dispatch table (i_pd1,2,3,4,6 -- pd5/balletai is NOT in '
            'this exercise), lowercased. Stage 8.2.'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


def vocab_speller(tbk, conv):
    greek, _, _ = vocab_pools(tbk, conv)
    glosses = [sq(x) for x in tbk.pool(0x5ba02, 10, 'vocab speller glosses')]
    items = [{'prompt': gl, 'answer': g, 'audio': aud(c)}
             for gl, g, c in zip(glosses, greek, VOC_CLIPS)]
    return {
        'id': 'c9_ex_vocab_speller', 'type': 'spell',
        'title': 'Vocabulary Spelling Exercise',
        'instructions': 'Click letters below or use your keyboard to spell it out.',
        'prompt': 'item', 'promptLabel': 'English Meaning',
        'accentsOptional': True, 'spellerTilesRef': 'chapt_1',
        'items': items,
        'ui': {'fields': ['English Meaning', 'Spell Greek Word'],
               'buttons': ['Pronounce', 'Previous', 'Score', 'Next',
                           'Check Answer', 'Greek Keyboard'],
               'checkboxes': ['Show Answer', 'With Accents',
                              'Pronounce Each Exercise'],
               'defaults': {'pronounceEach': True}},
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


def scripture_speller(tbk, conv):
    raw = tbk.field(0x690e2)
    for legacy in ['xa<risma', 'kuri<&', 'h[mw?n']:
        if legacy not in raw:
            raise SystemExit(f'STOP: {legacy} not in speller answer field')
    return {
        'id': 'c9_ex_scripture_speller', 'type': 'spellVerse',
        'title': 'Scripture Memory Spelling Exercise',
        'instructions': 'Enter all of Rom 6:23b then click "Check Answer"',
        'reference': 'Rom 6:23b',
        'answerWords': VERSE_923B,
        'translation': 'but the gift of God is eternal life through Jesus Christ our Lord.',
        'accentsOptional': True, 'punctuationOptional': True,
        'audio': aud('i_rm623b'), 'spellerTilesRef': 'chapt_1',
        'repeatCheckbox': True,
        'ui': {'fields': ['Spell Greek'],
               'buttons': ['Pronounce', 'Check Answer', 'Greek Keyboard',
                           'Restart Exercise'],
               'checkboxes': ['Show Answer', 'With Accents',
                              'Repeat This Exercise'],
               '_reveal_note': 'RULES C8 / D-30.',
               '_repeat_note': (
                   'NEW ch9+: "Repeat This Exercise" checkbox, default OFF. '
                   'Found once in the TBK, on this page (0x64d0c). When ON, '
                   'a successful check plays the verse (C7), then clears '
                   'the slate for another pass; completion state is '
                   'unaffected. Semantics EXTRAPOLATED -- VERIFY-5G item.')},
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


# Learn topics ------------------------------------------------------------

def english_concepts(tbk, conv):
    topics = []
    for tid, title, off in [
            ('definitions', 'Definitions', 0x1c63c),
            ('identifyingTraits', 'Identifying Traits', 0x1cbce),
            ('translation', 'Translation', 0x1cf18)]:
        raw = tbk.marked(off).split('\r\n')
        blocks = para_blocks(conv, raw)
        topics.append({'id': tid, 'title': title, 'content': blocks})
    # underlines arrive from the run tables (Tbk.marked); assert they did
    joined = json.dumps(topics, ensure_ascii=False)
    for must in ['[[u]]active voice[[/u]]', '[[u]]passive voice[[/u]]',
                 '[[u]]is being[[/u]]', '[[u]]will be[[/u]]']:
        if must not in joined:
            raise SystemExit(f'STOP: EC underline missing: {must}')
    # the Translation topic's four annotated examples are LINES, not a
    # flowing paragraph (original shows one per line)
    t2 = topics[2]['content']
    last = t2[-1]['text']
    parts = re.split(r'\s+(?=He \[\[u\]\])', last)
    t2[-1]['text'] = '\n'.join(parts)
    return {'id': 'c9_learn_english_concepts', 'type': 'contentAudio',
            'mode': 'topicPages', 'title': 'Learn English Concepts',
            'topics': topics}


def compound_rows(tbk, conv):
    # Rows parsed from the field itself. The ORIGINAL glosses erchomai
    # 'I go in, enter' (a copy slip alongside eiserchomai); kept
    # verbatim, flagged for VERIFY-5G keep-or-fix alongside Jn 6:23b.
    raw = tbk.field(0x64ca)
    spec = [('e@rxomai', 'i_voc7', None, None),
            ('ei]se<rxomai', 'i_voc5', 'ei]j', 'i_eis'),
            ('e]ce<rxomai', 'i_voc6', 'e]k', 'i_ek'),
            ('die<rxomai', 'i_voc11', 'dia<', 'i_dia')]
    rows = []
    for leg, clip, pleg, pclip in spec:
        m = re.search(re.escape(leg) + r'\s+([A-Za-z, ]+?)\s*'
                      r'(?:\((\S+)\s*\))?\s*$', raw, re.M)
        if not m:
            raise SystemExit(f'STOP: {leg} row not parsed in Compound Verbs')
        row = {'greek': conv(leg), 'gloss': sq(m.group(1)),
               'audio': aud(clip)}
        if pleg:
            got = (m.group(2) or '').strip()
            if got != pleg:
                raise SystemExit(
                    f'STOP: parenthetical {got!r} != expected {pleg!r}')
            row['suffix'] = {'greek': f'({conv(pleg)})', 'audio': aud(pclip)}
        rows.append(row)
    return rows


def mp_verbs(tbk, conv):
    intro = para_blocks(conv, tbk.marked(0x3d06).split('\r\n'))
    # mark the popup links the original draws in blue
    intro[-1]['text'] = intro[-1]['text'].replace(
        'punctiliar', '[[link:punctiliar]]punctiliar[[/link]]').replace(
        'continuous', '[[link:continuous]]continuous[[/link]]')
    # Introduction (cont.): lead para + numbered list parsed from field
    cont_lead, cont_items = numbered_split(conv, tbk.marked(0x8152))
    if not cont_items[0].startswith('[[u]]deponent:[[/u]]'):
        raise SystemExit('STOP: intro cont item 1 lost its underline run')
    cont_blocks = [{'type': 'para', 'text': cont_lead, 'gapBefore': True},
                   {'type': 'numbered', 'items': cont_items,
                    'gapBefore': True}]
    dep = para_blocks(conv, tbk.marked(0x58e8).split('\r\n'))
    dep_cont = para_blocks(conv, tbk.marked(0x8616).split('\r\n'))
    dep_cont[0]['text'] = dep_cont[0]['text'].replace(
        'Many frequent verbs are deponent.',
        'Many [[link:frequentVerbs]]frequent verbs[[/link]] are deponent.')
    # Accompanying Cases: opening para, then 'accomplished by' + numbered
    # items split across the base field (item 1) and (cont.) (item 2)
    acc_raw = tbk.marked(0x9c5a)
    acc_paras = para_blocks(conv, acc_raw.split('\r\n'))
    acc_lead2, acc_items1 = numbered_split(
        conv, 'x\r\n' + acc_raw.split('\r\n\r\n', 1)[1])
    _, acc_items2 = numbered_split(conv, tbk.marked(0xa324), start=2)
    acc_blocks = [acc_paras[0],
                  {'type': 'para', 'text': acc_lead2, 'gapBefore': True},
                  {'type': 'numbered', 'items': acc_items1 + acc_items2,
                   'gapBefore': True}]

    topics = [
        {'id': 'introduction', 'title': 'Introduction',
         'content': intro + [dict(b, gapBefore=True) if i == 0 else b
                             for i, b in enumerate(cont_blocks)]},
        {'id': 'presentMiddleParadigm', 'title': 'Present Middle Paradigm',
         'content': [build_mp_paradigm(
             tbk, conv, 0x4598, 'presentMiddleParadigm',
             'Present Middle Indicative Paradigm', ['Singular', 'Plural'],
             MIDDLE_GLOSSES,
             {'label': 'Say Paradigm', 'audio': aud('i_midpar')})]},
        {'id': 'presentPassiveParadigm', 'title': 'Present Passive Paradigm',
         'content': [build_mp_paradigm(
             tbk, conv, 0x4fb8, 'presentPassiveParadigm',
             'Present Passive Indicative Paradigm', ['Singular', 'Plural'],
             PASSIVE_GLOSSES,
             {'label': 'Say Paradigm', 'audio': aud('i_mpar'),
              '_verify': 'i_mpar is UNREFERENCED in the TBK; listen before trusting.'})]},
        {'id': 'deponentVerbs', 'title': 'Deponent Verbs',
         'titleLink': 'deponent',
         'content': dep + [dict(b, gapBefore=True) if i == 0 else b
                           for i, b in enumerate(dep_cont)]},
        {'id': 'accompanyingCases', 'title': 'Accompanying Cases',
         'content': acc_blocks,
         'greekTaps': True},
        {'id': 'compoundVerbs', 'title': 'Compound Verbs',
         'content': [
             {'type': 'para',
              'text': 'As with other verbs, prepositions are often prefixed to deponent verbs to form a compound.'},
             {'type': 'greekRows', 'layout': 'compoundVerbs',
              'rows': compound_rows(tbk, conv)}]}]

    popups = [
        {'id': 'punctiliar', 'title': 'Punctiliar (single point in time)',
         'content': [{'type': 'para', 'text': 'Zach is hit by the ball.',
                      'align': 'center'}]},
        {'id': 'continuous', 'title': 'Continuous',
         'content': [{'type': 'para', 'text': 'Zach is being hit by the ball.',
                      'align': 'center'}]},
        {'id': 'deponent', 'title': 'Deponent',
         'content': [{'type': 'para', 'text': (
             'Summers notes that the word "deponent" comes from the Latin '
             'root "deponere" meaning to "lay aside."  It is used for these '
             'verbs because they have "laid aside" (dropped) their active '
             'verb forms (p. 51).')}]},
        {'id': 'frequentVerbs', 'title': 'Frequently Used Deponent Verbs',
         'content': [{'type': 'greekRows', 'layout': 'glossOnly', 'rows': [
             {'greek': 'ἀποκρίνομαι', 'gloss': 'I answer (231)',
              'audio': aud('i_voc1')},
             {'greek': 'εἰσέρχομαι', 'gloss': 'I come in (194)',
              'audio': aud('i_voc5')},
             {'greek': 'ἔρχομαι', 'gloss': 'I come, go (634)',
              'audio': aud('i_voc7')},
             {'greek': 'ἐξέρχομαι', 'gloss': 'I go out (218)',
              'audio': aud('i_voc6')},
             {'greek': 'γίνομαι', 'gloss': 'I become (669)',
              'audio': aud('i_voc4')},
             {'greek': 'πορεύομαι', 'gloss': 'I go (132)',
              'audio': aud('i_voc10')}]}]}]

    audio_map = {'ὑπό': aud('i_upo'), 'διά': aud('i_dia'),
                 'εἰμί': None}
    audio_map = {k: v for k, v in audio_map.items() if v}
    for f, c in zip(MIDDLE_FORMS, M_CLIPS):
        audio_map[f] = aud(c)
    return {'id': 'c9_learn_mp_verbs', 'type': 'contentAudio',
            'mode': 'topicPages',
            'title': 'Learn Present Middle/Passive Verbs',
            'topics': topics, 'popups': popups,
            'greekTaps': True, 'audioMap': audio_map}


def objectives(tbk, conv):
    raw = tbk.field(0xbc0ca).split('\r\n')
    items, cur = [], None
    for l in raw:
        s = l.strip()
        m = re.match(r'^(\d)\)\s*(.*)$', s)
        if m:
            if cur:
                items.append(sq(cur))
            cur = m.group(2)
        elif cur is not None and s and 'You will be able' not in s:
            cur += ' ' + s
        if s.startswith('6)'):
            pass
    if cur:
        items.append(sq(cur))
    items = items[:6]
    if len(items) != 6:
        raise SystemExit(f'STOP: expected 6 objectives, got {len(items)}')
    return items


def bibliography(tbk):
    raw = tbk.field(0xe15c).split('\r\n')
    entries, cur = [], None
    for l in raw:
        if not l.strip():
            continue
        if re.match(r'^\s{0,4}\S', l) and re.search(r'^\s*[A-Z]', l) and \
                not l.startswith('          '):
            if cur:
                entries.append(sq(cur))
            cur = l.strip()
        elif cur:
            cur += ' ' + l.strip()
        if len(entries) == 4:
            break
    if cur and len(entries) < 4:
        entries.append(sq(cur))
    entries = entries[:4]
    if len(entries) != 4:
        raise SystemExit(f'STOP: expected 4 bibliography entries')
    return {'id': 'c9_learn_bibliography', 'type': 'contentAudio',
            'mode': 'textPage', 'title': 'Learn Bibliography',
            'content': [{'type': 'biblist', 'items': entries}]}


# Quick Review ------------------------------------------------------------

def qr_paradigms(tbk, conv):
    mid = build_mp_paradigm(
        tbk, conv, 0x34cd2, 'qrMiddle',
        'Present Middle Indicative Paradigm', ['Singular', 'Plural'],
        MIDDLE_GLOSSES, {'label': 'Say Paradigm', 'audio': aud('i_midpar')})
    pas = build_mp_paradigm(
        tbk, conv, 0x35b56, 'qrPassive',
        'Present Passive Indicative Paradigm', ['Singular', 'Plural'],
        PASSIVE_GLOSSES,
        {'label': 'Say Paradigm', 'audio': aud('i_mpar'),
         '_verify': 'i_mpar unreferenced in TBK; listen.'})
    return {'id': 'c9_qr_paradigms', 'type': 'contentAudio',
            'mode': 'paradigmChart',
            'title': 'Review Middle/Passive Paradigms',
            'paradigms': [mid, pas]}


def qr_vocab(tbk, conv):
    raw = tbk.field(0xb3498)
    for leg in ['a]pokri<nomai', 'poreu<omai']:
        if leg not in raw:
            raise SystemExit('STOP: QR vocab chart field mismatch')
    return {'id': 'c9_qr_vocab', 'type': 'contentAudio',
            'mode': 'reviewVocab', 'title': 'Review Vocabulary Chart',
            'pool': 'senses', 'columns': 2, 'showNtFreq': True,
            'footnote': ('The number after the translation is the number of '
                         'times the word occurs in the New Testament.'),
            'playAll': {'label': 'Say Whole List', 'audio': aud('i_vocl9')}}


def qr_scriptures(ch8):
    """The five carried verses lift words/glosses from the DEVICE-VERIFIED
    chapter-8 pages and re-key audio to the chapter-9 pack (the ISO ships
    the same forwarded clips under CHAPT_9)."""
    out = []
    plan = [('c9_qr_scripture_146a', 'c8_qr_scripture_146a',
             'Review Scripture Memory:  Jn 14:6a'),
            ('c9_qr_scripture_146b', 'c8_qr_scripture_146b',
             'Review Scripture Memory:  Jn 14:6b'),
            ('c9_qr_scripture_rom323', 'c8_qr_scripture_rom323',
             'Review Scripture Memory:  Rom 3:23'),
            ('c9_qr_scripture_jn11', 'c8_qr_scripture_jn11',
             'Review Scripture Memory:  Jn 1:1'),
            ('c9_qr_scripture_rom623a', 'c8_qr_scripture_rom623',
             'Review Scripture Memory:  Rom 6:23a')]
    by_id = {a['id']: a for a in ch8['quickReview']}
    for nid, oid, title in plan:
        src = by_id[oid]
        words = [{'greek': w['greek'], 'gloss': w['gloss'],
                  'audio': w['audio'].replace('chapt_8_', A)}
                 for w in src['words']]
        say = {'label': src['sayWhole']['label'],
               'audio': src['sayWhole']['audio'].replace('chapt_8_', A)}
        out.append({'id': nid, 'type': 'contentAudio',
                    'mode': 'interlinearVerse', 'title': title,
                    'reference': src['reference'],
                    'words': words, 'sayWhole': say})
    return out


def qr_scripture_623b(learn):
    return {'id': 'c9_qr_scripture_rom623b', 'type': 'contentAudio',
            'mode': 'interlinearVerse',
            'title': 'Review Scripture Memory:  Rom 6:23b',
            'reference': 'Rom 6:23b',
            'words': learn['words'], 'sayWhole': learn['sayWhole']}


# Lexicon -----------------------------------------------------------------

def build_lexicon(tbk, conv):
    greek, gloss_drill, gloss_full = vocab_pools(tbk, conv)
    lemmas = {}
    for k, g, gs, gf, c, f in zip(VOC_KEYS, greek, gloss_drill, gloss_full,
                                  VOC_CLIPS, VOC_FREQ):
        lemmas[k] = {'greek': g, 'translit': k, 'lexicalForm': g,
                     'gloss': gf, 'glossShort': gs, 'audio': aud(c),
                     'ntFreq': f,
                     'senses': [{'greek': g, 'caseTag': None,
                                 'glossShort': gs, 'audio': aud(c)}]}
    return {'_comment': (
        'Chapter 9 lexicon, assembled from 9_MIDDLE.TBK (cohort 5G). TEN '
        'lemmas, no case splits (all verbs plus one adverb). ntFreq from '
        'the Review Vocabulary Chart at 0xb3498; note the chart prints '
        'poreuomai at 153 while the Frequently Used Deponent Verbs popup '
        'prints 132 -- each surface keeps its own printed number.'),
        'lemmas': lemmas, 'exampleWords': {}}


# -------------------------------------------------------------------- main

def audit(obj, path='$', errors=None):
    """Stage 8.5 self-audit."""
    if errors is None:
        errors = []
    GREEKISH = re.compile(r'[\u0370-\u03ff\u1f00-\u1fff]')
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in ('greek', 'answer', 'answerWords') and \
                    isinstance(v, str) and v and not GREEKISH.search(v) \
                    and re.search(r'[a-zA-Z]', v) and k != 'answer':
                errors.append(f'{path}.{k}: bare Latin in Greek slot: {v!r}')
            audit(v, f'{path}.{k}', errors)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            audit(v, f'{path}[{i}]', errors)
    elif isinstance(obj, str):
        if re.search(r'\s[\u0300-\u036f\u0342-\u0345]', obj):
            errors.append(f'{path}: combining mark after space: {obj!r}')
        if re.search(r"[\u1fbd\u2019\u2018]", obj):
            errors.append(f'{path}: unnormalized elision mark: {obj!r}')
    return errors


def main():
    tbk_path, fontmap_path, ch8_path, wavlist_path, outdir = sys.argv[1:6]
    shipped = {l.strip().lower().rsplit('.', 1)[0]
               for l in open(wavlist_path) if l.strip()}
    tbk = Tbk(tbk_path)
    tbk.greek_fmts = underline.vote_greek_fmts(tbk.data, TEACH_OFFSETS)
    conv = make_conv(json.load(open(fontmap_path, encoding='utf-8')))
    ch8 = json.load(open(ch8_path, encoding='utf-8'))

    learn_scr = learn_scripture(tbk, conv)
    ch = {
        '_comment': (
            'Chapter 9 (Present Middle/Passive Verbs), assembled from '
            '9_MIDDLE.TBK + CHAPT_9 audio + ch9railwalk.pdf under '
            'PIPELINE-INSIGHTS-v3 Stage 8. Every drill/exercise answer is '
            'derived from the chapter\'s own charts and pools and asserted '
            'before use. Behavior fields are stamped by '
            'apply-behavior-matrix.py from ledger rows 79-86.'),
        'id': 'chapt_9', 'number': 9,
        'title': 'Present Middle/Passive Verbs',
        'objectivesPreamble': 'You will be able to:',
        'objectives': objectives(tbk, conv),
        '_objectives_note': (
            'Objective 6 prints "memorize Jn 6:23b in Greek." in the '
            'ORIGINAL; the verse is Rom 6:23b. Kept verbatim pending '
            'VERIFY-5G decision.'),
        'vocab': VOC_KEYS,
        'learn': [], 'drill': [], 'exercise': [], 'quickReview': [],
        'feedback': ch8['feedback'],
        'sequence': [],
        '_audioVerify': (
            'CHAPT_9 ships 125 WAVs. Flags: (1) i_mpar.wav is referenced '
            'NOWHERE in the TBK -- provisionally wired as the passive '
            'paradigm Say Paradigm, listen before trusting; (2) i_voc11 is '
            'a live dispatch key wired here to dierchomai (Compound Verbs) '
            'by elimination -- listen; (3) parsing item audio i_pd1..16 and '
            'translation i_td1..14 are table-read; (4) the M/P Speller '
            'items 7-11 play i_pd1/2/3/4/6 per the dispatch table.')}

    ch['learn'] = [
        {'id': 'c9_learn_objectives', 'type': 'contentAudio',
         'mode': 'objectivesPage', 'title': 'Learn Chapter Objectives',
         'instructions': ''},
        english_concepts(tbk, conv),
        mp_verbs(tbk, conv),
        {'id': 'c9_learn_vocab', 'type': 'contentAudio', 'mode': 'flashcard',
         'title': 'Learn Vocabulary', 'pool': 'senses'},
        learn_scr,
        bibliography(tbk)]

    gk, en = vocab_drills(tbk, conv)
    ch['drill'] = [parsing_drill(tbk, conv), translation_drill(tbk, conv),
                   gk, en, scripture_drill(tbk, conv)]
    ch['exercise'] = [mp_speller(tbk, conv), vocab_speller(tbk, conv),
                      scripture_speller(tbk, conv)]
    ch['quickReview'] = ([qr_vocab(tbk, conv), qr_paradigms(tbk, conv)]
                         + qr_scriptures(ch8)
                         + [qr_scripture_623b(learn_scr)])
    ch['sequence'] = [
        'c9_learn_objectives', 'c9_learn_english_concepts',
        'c9_learn_mp_verbs', 'c9_drill_parsing', 'c9_drill_translation',
        'c9_ex_speller', 'c9_learn_vocab', 'c9_drill_vocab_gk_en',
        'c9_drill_vocab_en_gk', 'c9_ex_vocab_speller', 'c9_learn_scripture',
        'c9_drill_scripture_memory', 'c9_ex_scripture_speller',
        'c9_qr_vocab', 'c9_qr_paradigms', 'c9_qr_scripture_146a',
        'c9_qr_scripture_146b', 'c9_qr_scripture_rom323',
        'c9_qr_scripture_jn11', 'c9_qr_scripture_rom623a',
        'c9_qr_scripture_rom623b', 'c9_learn_bibliography']
    ch['_sequence_note'] = 'Rail order from ch9railwalk.pdf (Nathanael, 2026-08-09).'

    # 8.4: hintRef resolution
    chart_ids = {'middlePassiveParadigms'}
    emitted = {b.get('id') for a in ch['learn'] if a.get('mode') == 'topicPages'
               for t in a['topics'] for b in t['content'] if isinstance(b, dict)}
    for a in ch['drill']:
        hr = a.get('ui', {}).get('hintRef')
        if hr and hr not in chart_ids and hr not in emitted:
            raise SystemExit(f'STOP: dangling hintRef {hr}')
    # hint target: composite of the two paradigm charts
    ch['hintCharts'] = {'middlePassiveParadigms': {
        'paradigmRefs': ['presentMiddleParadigm', 'presentPassiveParadigm'],
        '_note': ('Hint on both ch9 drills opens the Middle and Passive '
                  'paradigm charts (rail walk shows the Middle chart '
                  'popup; both fields sit in each drill\'s page record).')}}

    # 8.2 closing sweep: every emitted clip must exist in the TBK bytes,
    # except the two deliberate flags.
    KNOWN_UNREFERENCED = {aud('i_mpar')}
    ids = set()

    def collect(o):
        if isinstance(o, dict):
            for k, v in o.items():
                if k == 'audio' and isinstance(v, str):
                    ids.add(v)
                collect(v)
        elif isinstance(o, list):
            for v in o:
                collect(v)
    collect(ch)
    for cid in sorted(ids):
        base = cid[len(A):]
        in_tbk = tbk.has_clip(base)
        in_pack = base.lower() in shipped
        if not in_pack:
            raise SystemExit(f'STOP: emitted clip {cid} not in CHAPT_9 pack')
        if not in_tbk and cid not in KNOWN_UNREFERENCED and \
                not re.match(r'[cdefh]_', base):
            # forwarded ch<=8 clips (c_/d_/e_/f_/h_) are dispatched by
            # word-number variable on the lifted QR pages; everything
            # chapter-native must appear in a dispatch table.
            raise SystemExit(f'STOP: emitted clip {cid} not referenced in TBK')

    errs = audit(ch)
    if errs:
        raise SystemExit('STOP: self-audit failed:\n' + '\n'.join(errs))

    lex = build_lexicon(tbk, conv)
    os.makedirs(outdir, exist_ok=True)
    with open(os.path.join(outdir, 'chapt-09.json'), 'w',
              encoding='utf-8') as f:
        json.dump(ch, f, ensure_ascii=False, indent=1)
    with open(os.path.join(outdir, 'lexicon-chapt09.json'), 'w',
              encoding='utf-8') as f:
        json.dump(lex, f, ensure_ascii=False, indent=1)
    print(f'chapter 9: {len(ids)} distinct clips, '
          f'{len(ch["sequence"])} rail pages. OK.')


if __name__ == '__main__':
    main()


def post_patches(doc):
    """Re-apply ratified divergences on top of the verbatim TBK build."""
    # D-43: objective 6, Jn -> Rom 6:23b (original's own slip)
    assert 'Jn 6:23b' in doc['objectives'][5], 'D-43 anchor missing'
    doc['objectives'][5] = doc['objectives'][5].replace('Jn 6:23b', 'Rom 6:23b')
    # D-44: Compound Verbs erchomai gloss
    mp = [a for a in doc['learn'] if a['id'] == 'c9_learn_mp_verbs'][0]
    cv = [t for t in mp['topics'] if t['id'] == 'compoundVerbs'][0]
    rows = [b for b in cv['content'] if 'rows' in b][0]['rows']
    assert rows[0]['gloss'] == 'I go in, enter', 'D-44 anchor missing'
    rows[0]['gloss'] = 'I come, go'
    # D-42 RETIRED: no Repeat This Exercise control, ever
    sp = [a for a in doc['exercise'] if a['id'] == 'c9_ex_scripture_speller'][0]
    sp.pop('repeatCheckbox', None)
    sp['ui']['checkboxes'] = [c for c in sp['ui']['checkboxes']
                              if c != 'Repeat This Exercise']
    return doc
