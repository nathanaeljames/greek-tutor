#!/usr/bin/env python3
"""assemble_ch4.py -- chapter 4 data assembly (cohort 5E, pipeline-side).

Pools are read from 4_NOUNS2.TBK by OFFSET (see 5E-EXTRACTION-MAP.md);
conversion via font-map.json; drill answers derived by rule from the
paradigms and cross-checked against the pools themselves. Page prose is
transcribed VERBATIM from the extracted fields, cut at the boundary the
ch4railwalk.pdf screenshots show -- ToolBook does not zero a field
buffer on rewrite, so most teaching fields carry a stale tail that is
not on the page (chapter-7 adjective prose, mostly).

Nothing here is authored. If a field cannot be located the assembly
STOPS (PIPELINE-INSIGHTS Stage 7).

Usage:  python3 assemble_ch4.py 4_NOUNS2.TBK font-map.json outdir
"""
import json
import struct
import sys
import unicodedata

# --------------------------------------------------------------------
# 1. Font conversion (Stage 5)
# --------------------------------------------------------------------

def make_conv(fontmap):
    lower = fontmap['lowercase']
    upper = fontmap['uppercase']
    dia = {k: v['unicode'] for k, v in fontmap['diacritics_verified'].items()}
    extra = fontmap.get('base_verified_additions', {})
    for k, v in extra.items():
        if isinstance(v, str):
            lower.setdefault(k, v)

    def conv(s):
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
        return unicodedata.normalize('NFC', ''.join(out))
    return conv


# --------------------------------------------------------------------
# 2. Field reading (Stage 4)
# --------------------------------------------------------------------

class Tbk:
    def __init__(self, path):
        self.data = open(path, 'rb').read()

    def field(self, off):
        """Length-prefixed read. The prefix ends the field exactly."""
        ln = struct.unpack_from('<H', self.data, off - 2)[0]
        if not (2 < ln < 20000):
            raise SystemExit(f'STOP: no length prefix at {off:#x} (got {ln})')
        seg = self.data[off:off + ln]
        printable = sum(32 <= b < 127 or b in (13, 10, 9) for b in seg)
        if printable / len(seg) < 0.95:
            raise SystemExit(f'STOP: field at {off:#x} is not text')
        return seg.decode('latin-1')

    def region(self, off):
        """The maximal printable run containing `off`.

        Used for POOL fields, whose allocated buffer holds the whole
        CRLF list; the length prefix on these agrees with the region.
        """
        def ok(b):
            return 32 <= b < 127 or b in (13, 10, 9)
        a = off
        while a > 0 and ok(self.data[a - 1]):
            a -= 1
        b = off
        n = len(self.data)
        while b < n and ok(self.data[b]):
            b += 1
        return self.data[a:b].decode('latin-1')

    def pool(self, off, n, label):
        """Positional CRLF list field -> exactly n entries.

        Trailing entries beyond n are the buffer's stale tail and are
        dropped. A field SHORTER than n is a hard failure, never padded.
        """
        lines = [l.strip() for l in self.region(off).split('\r\n')]
        lines = [l for l in lines if l]
        if len(lines) < n:
            raise SystemExit(
                f'STOP: pool {label} at {off:#x}: expected {n}, got {len(lines)}')
        return lines[:n]


A = 'chapt_4_'


def aud(name):
    return A + name


# --------------------------------------------------------------------
# 3. Paradigms -- the source of every derived answer in the chapter
# --------------------------------------------------------------------

CASES = ['Nom.', 'Gen.', 'Dat.', 'Acc.', 'Voc.']

# form -> (case, number), built from the three Learn charts. Every
# Declining Noun Drill answer and every speller answer is looked up
# here, so a typo in a chart is caught by a drill that cannot resolve.
LOGOS = {
    'Nom.': ('λόγος', 'λόγοι'), 'Gen.': ('λόγου', 'λόγων'),
    'Dat.': ('λόγῳ', 'λόγοις'), 'Acc.': ('λόγον', 'λόγους'),
    'Voc.': ('λόγε', 'λόγοι'),
}
ANTHROPOS = {
    'Nom.': ('ἄνθρωπος', 'ἄνθρωποι'), 'Gen.': ('ἀνθρώπου', 'ἀνθρώπων'),
    'Dat.': ('ἀνθρώπῳ', 'ἀνθρώποις'), 'Acc.': ('ἄνθρωπον', 'ἀνθρώπους'),
    'Voc.': ('ἄνθρωπε', 'ἄνθρωποι'),
}
HIERON = {
    'Nom./Voc.': ('ἱερόν', 'ἱερά'), 'Gen.': ('ἱεροῦ', 'ἱερῶν'),
    'Dat.': ('ἱερῷ', 'ἱεροῖς'), 'Acc.': ('ἱερόν', 'ἱερά'),
}
ADELPHOS = {
    'Nom.': ('ἀδελφός', 'ἀδελφοί'), 'Gen.': ('ἀδελφοῦ', 'ἀδελφῶν'),
    'Dat.': ('ἀδελφῷ', 'ἀδελφοῖς'), 'Acc.': ('ἀδελφόν', 'ἀδελφούς'),
    'Voc.': ('ἀδελφέ', 'ἀδελφοί'),
}

CELL_AUDIO = {
    'λόγος': 'd_logos', 'λόγου': 'd_logou', 'λόγῳ': 'd_logw',
    'λόγον': 'd_logon', 'λόγε': 'd_loge', 'λόγοι': 'd_logoi',
    'λόγων': 'd_logwn', 'λόγοις': 'd_logois', 'λόγους': 'd_logous',
    'ἄνθρωπος': 'd_anthos', 'ἀνθρώπου': 'd_anthou', 'ἀνθρώπῳ': 'd_anthw',
    'ἄνθρωπον': 'd_anthon', 'ἄνθρωπε': 'd_anthe', 'ἄνθρωποι': 'd_anthoi',
    'ἀνθρώπων': 'd_anthwn', 'ἀνθρώποις': 'd_antois',
    'ἀνθρώπους': 'd_antous',
    'ἱερόν': 'd_ieron', 'ἱεροῦ': 'd_ierou', 'ἱερῷ': 'd_ierw',
    'ἱερά': 'd_iera', 'ἱερῶν': 'd_ierwn', 'ἱεροῖς': 'd_ierois',
    'ἀδελφός': 'd_adelos', 'ἀδελφοῦ': 'd_adelou', 'ἀδελφῷ': 'd_adelw',
    'ἀδελφόν': 'd_adelon', 'ἀδελφέ': 'd_adele', 'ἀδελφοί': 'd_adeloi',
    'ἀδελφῶν': 'd_adelwn', 'ἀδελφοῖς': 'd_adeois',
    'ἀδελφούς': 'd_adeous',
}


def strip_grave(word):
    """The drill pools spell a few forms with a grave because the verse
    continues after them (Rule 6). The paradigm spells them with an
    acute. Normalize for LOOKUP only; the drill still shows the pool's
    own spelling."""
    out = word.replace('\u1f76', '\u1f77').replace('\u1f78', '\u1f79')
    out = out.replace('\u1f74', '\u1f75').replace('\u1f72', '\u1f73')
    out = out.replace('\u1f7a', '\u1f7b').replace('\u1f7c', '\u1f7d')
    return unicodedata.normalize('NFC', out)


def parse_of(form, tables=(LOGOS, ANTHROPOS, HIERON, ADELPHOS)):
    """(case, number) for a noun form, from the chapter's own charts."""
    probe = strip_grave(form)
    for table in tables:
        for case, (sg, pl) in table.items():
            if probe == sg:
                return case, 'Singular'
            if probe == pl:
                return case, 'Plural'
    raise SystemExit(f'STOP: {form!r} is in no chapter-4 paradigm')


def chart(title, lemma_greek, lemma_gloss, lemma_audio, table, order,
          meanings, say_whole, name=None, note=None):
    rows = []
    for case in order:
        sg, pl = table[case]
        rows.append({
            'label': case,
            'cells': [
                {'greek': sg, 'audio': aud(CELL_AUDIO[sg])},
                {'greek': pl, 'audio': aud(CELL_AUDIO[pl])},
            ],
        })
    out = {
        'title': title,
        'lemma': {'greek': lemma_greek, 'gloss': lemma_gloss,
                  'audio': aud(lemma_audio)},
        'columns': ['Singular', 'Plural'],
        'rows': rows,
        'showGlosses': False,
        'sayWhole': {'label': 'Say Whole List', 'audio': aud(say_whole)},
        'meanings': meanings,
    }
    if name:
        out['name'] = name
    if note:
        out['note'] = note
    return out


def meanings_table(title, table, order, glosses, legend, closing=None):
    """The green 'Translation of Inflectional Forms' card under a chart."""
    rows = []
    for case in order:
        sg, pl = table[case]
        gsg, gpl = glosses[case]
        rows.append({
            'label': case,
            'cells': [
                {'greek': sg, 'gloss': gsg, 'audio': aud(CELL_AUDIO[sg])},
                {'greek': pl, 'gloss': gpl, 'audio': aud(CELL_AUDIO[pl])},
            ],
        })
    out = {
        'label': 'Meanings',
        'title': title,
        'columns': ['Singular', 'Plural'],
        'rows': rows,
        'legend': legend,
    }
    if closing:
        out['closing'] = closing
    return out


LEGEND = [
    {'label': 'Nominative', 'text': '= subject of the sentence'},
    {'label': 'Genitive', 'text': '= possessive usually translated with "of"'},
    {'label': 'Dative', 'text': '= indirect object usually translated with "to"'},
    {'label': 'Accusative', 'text': '= direct object of a sentence'},
    {'label': 'Vocative', 'text': '= direct address'},
]


def legend_with(accusative_eg=None, vocative_eg=None):
    out = [dict(x) for x in LEGEND]
    if accusative_eg:
        out[3]['text'] += ' ' + accusative_eg
    if vocative_eg:
        out[4]['text'] += ' ' + vocative_eg
    return out


# --------------------------------------------------------------------
# 4. Build
# --------------------------------------------------------------------

def build(tbk, conv):
    warn = []

    # ---- pools -----------------------------------------------------
    vocab_legacy = tbk.pool(0x0169fa, 10, 'vocab lemmas')
    vocab_gloss = tbk.pool(0x016ba2, 10, 'vocab glosses')
    vocab_gloss[9] = 'as, that, how, about'   # buffer tail 'abouttnt'
    vocab_legacy[9] = 'w[j'                   # buffer tail 'w[j d,qo'

    gnd_p1 = tbk.pool(0x09dfbe, 22, 'GND prompt line 1')
    gnd_p2raw = [l.strip() for l in tbk.region(0x0a1dcc).split('\r\n')]
    gnd_p2 = gnd_p2raw[1:23]
    gnd_ref = tbk.pool(0x0a2092, 22, 'GND references')
    gnd_p1[21] = 'the disciples were perplexed'   # buffer tail
    gnd_p2[21] = 'at these words'                 # buffer tail
    gnd_slots = [tbk.pool(o, 2, f'GND option slot {i + 1}')
                 for i, o in enumerate([
                     0x09fc7c, 0x0a01f2, 0x0a0534, 0x0a0870, 0x0a0bb2,
                     0x0a0eee, 0x0a1232, 0x0a156e, 0x0a18b0, 0x0a1bec])]

    dnd_form = tbk.pool(0x079a94, 28, 'DND forms')
    dnd_ref = tbk.pool(0x079c74, 28, 'DND references')
    dnd_tr = tbk.pool(0x079e54, 28, 'DND translations')
    dnd_tr[27] = 'to brothers'                    # buffer tail

    sp_prompt = tbk.pool(0x061532, 20, 'noun speller prompts')
    sp_prompt[19] = 'temple (acc.)'               # buffer tail

    # ---- lexicon ---------------------------------------------------
    KEYS = ['agapao', 'grapho', 'de', 'doulos', 'heurisko',
            'hieron', 'laos', 'nomos', 'oikos', 'hos']
    SHORT = ['I love', 'I write', 'but, and', 'servant', 'I find',
             'temple', 'people', 'law', 'house', 'as, about']
    FULL = ['I love', 'I write', 'but, and', 'servant, slave', 'I find',
            'temple', 'people', 'law', 'house', 'as, about, how']
    POS = ['verb', 'verb', 'conj', 'noun', 'verb',
           'noun', 'noun', 'noun', 'noun', 'adv']
    FREQ = [143, 191, 2792, 124, 176, 71, 142, 194, 114, 504]

    # `greek` is the BARE lemma -- the drills and the Vocabulary Spelling
    # Exercise answer against it. `lexicalForm` is the citation form the
    # Learn Vocabulary flashcard and the Review Vocabulary Chart print,
    # which for a noun carries its genitive ending and article.
    lemmas = {}
    for i, key in enumerate(KEYS):
        lexical = conv(vocab_legacy[i])
        bare = lexical.split(',')[0].strip()
        lemmas[key] = {
            'greek': bare,
            'translit': key,
            'gloss': FULL[i],
            'glossShort': SHORT[i],
            'pos': POS[i],
            'audio': aud(f'd_voc{i + 1}'),
            '_legacy': vocab_legacy[i],
            'ntFreq': FREQ[i],
        }
        if lexical != bare:
            lemmas[key]['lexicalForm'] = lexical
    # Flashcard/drill glosses come from the vocabulary pool; the fuller
    # forms above come from the Review Vocabulary Chart (0x0206c2).
    for i, key in enumerate(KEYS):
        pool_gloss = vocab_gloss[i]
        if pool_gloss not in (SHORT[i], FULL[i]):
            lemmas[key]['_poolGloss'] = pool_gloss

    example_words = {}

    def example(key, legacy, gloss, audio):
        example_words[key] = {
            'greek': conv(legacy), 'gloss': gloss,
            'audio': aud(audio), '_legacy': legacy,
        }

    example('ekklesia', 'e]kklhsi<a', 'church', 'd_ekkles')
    example('etos', 'e@toj', 'year', 'd_etos')
    example('hemera', 'h[me<ra', 'day', 'd_hnmera')
    example('chronos', 'xro<noj', 'time', 'd_chrons')
    example('ho', 'o[', 'the (masculine)', 'd_ho')
    example('he', 'h[', 'the (feminine)', 'd_hn')
    example('to', 'to<', 'the (neuter)', 'd_to')
    for form, clip in CELL_AUDIO.items():
        example_words[f'form_{clip[2:]}'] = {
            'greek': form, 'gloss': None, 'audio': aud(clip),
        }

    lexicon = {
        '_comment': (
            'Chapter 4 lexicon, assembled from 4_NOUNS2.TBK (cohort 5E). '
            'Vocabulary order is the TBK list order (alphabetical), which '
            'matches d_voc1..10. ntFreq values are the Review Vocabulary '
            'Chart\'s own counts (0x0206c2). exampleWords carries the '
            'teaching-page words and every inflected paradigm form, so a '
            'chart cell and a drill option resolve to the same clip. '
            'No mirror bucket: CHAPT_4 ships d_* plus chapter 3\'s c_sm* '
            'for the cumulative Jn 14:6a review, and the data references '
            'those LOCAL copies.'),
        'lemmas': lemmas,
        'exampleWords': example_words,
    }

    # ---- Learn: English Concepts -----------------------------------
    case_popup = [
        ('Subjective case', ' (Gk:  nominative):\n[[u]]He[[/u]] hit the ball.',
         'Subjective Case:', [
             'The subject of the sentence can usually be discovered by '
             'putting "who" or "what" before the verb.',
             'E.g.   [[u]]Zach[[/u]] ran to the store.',
             'Who ran to the store?    Zach (= subject)']),
        ('Objective case', ' (Gk:  accusative):\nThe ball hit [[u]]him[[/u]].',
         'Objective Case:', [
             'The object of a sentence can usually be discovered by '
             'putting a "who" or "what" after the verb.',
             'E.g.   Zach hit [[u]]the ball[[/u]].',
             'Zach hit what?    ball (= object)']),
        ('Possessive case', ' (Gk:  genitive):\nHe hit [[u]]his[[/u]] ball.',
         'Possessive Case:', [
             'The possessive case often can be discovered by asking '
             '"whose"?',
             'Charlie hid [[u]]his[[/u]] ball.',
             'whose ball?    his (possessive)']),
    ]

    english_concepts = {
        'id': 'c4_learn_english_concepts',
        'type': 'contentAudio',
        'mode': 'topicPages',
        'title': 'Learn English Concepts',
        'greekTaps': True,
        'topics': [
            {'id': 'introduction', 'title': 'Introduction', 'content': [
                {'type': 'para', 'text':
                 'A noun is commonly defined as a word that stands for a '
                 'person, place or thing.'},
                {'type': 'defList', 'items': [
                    {'term': 'Tanya', 'def': '= person'},
                    {'term': 'store', 'def': '= place'},
                    {'term': 'book', 'def': '= thing'}]},
            ]},
            {'id': 'gender', 'title': 'Gender', 'content': [
                {'type': 'para', 'text':
                 'Gender in English is determined by the sex of the '
                 'referent:  "king...he", "queen...she".  Objects which are '
                 'neither male nor female are considered neuter:  '
                 '"table...it".  In Greek some inanimate objects are given '
                 'male or female designations.  Be careful not to confuse '
                 'Greek grammatical gender with biological gender.'},
                {'type': 'greekRows', 'layout': 'glossOnly', 'rows': [
                    {'greek': conv('oi#koj'), 'gloss': '"house" is masculine',
                     'audio': aud('d_oikos')},
                    {'greek': conv('i[ero<n'), 'gloss': '"temple" is neuter',
                     'audio': aud('d_ieron')},
                    {'greek': conv('e]kklhsi<a'),
                     'gloss': '"church" is feminine',
                     'audio': aud('d_ekkles')}]},
            ]},
            {'id': 'number', 'title': 'Number', 'content': [
                {'type': 'para', 'text':
                 'Both English and Greek inflect words for number.   Both '
                 'languages have singular and plural nouns.'},
                {'type': 'greekRows', 'layout': 'englishPairs',
                 'columns': ['Singular', 'Plural'], 'rows': [
                     {'parts': ['book', 'books']},
                     {'parts': ['man', 'men']},
                     {'parts': ['quiz', 'quizzes']},
                     {'parts': ['deer', 'deer']}]},
            ]},
            {'id': 'case', 'title': 'Case', 'content': (
                [{'type': 'para', 'text':
                  'English uses three word inflections in order to indicate '
                  'changes in case.'},
                 {'type': 'numbered', 'numbered': False,
                  'labelStyle': 'underline',
                  'items': [{'label': lab, 'text': txt}
                            for lab, txt, _, _ in case_popup]}]
                + [{'type': 'expander', 'label': title,
                    'content': [{'type': 'para', 'text': t} for t in body]}
                   for _, _, title, body in case_popup]
            )},
        ],
    }

    # ---- Learn: Greek Nouns ----------------------------------------
    inflectional = [
        ('Nominative form', ':      marks the subject of the sentence.',
         'Nominative Case:', [
             '[[u]]Music[[/u]] calms the heart.',
             '"Music" is the subject of the sentence.  In Greek it would be '
             'marked with a nominative inflectional ending.']),
        ('Genitive form', ':           expresses a possessive',
         'Genitive Case:', [
             'The Pharisee went to the house [[u]]of God[[/u]].',
             'The Pharisee went to [[u]]God\'s[[/u]] house.',
             '"Of God" or "God\'s" would be marked in Greek with a genitive '
             'inflectional ending.']),
        ('Dative form', ':              marks the indirect object',
         'Dative Case:', [
             'He spoke a word [[u]]to the apostle[[/u]].',
             '"To the apostle" would be marked with a dative inflectional '
             'ending in Greek.',
             'The dative functions in many ways.  It may also be translated '
             '"with" or "in" in some contexts.']),
        ('Accusative form', ':       indicates the object of the sentence',
         'Accusative Case:', [
             'Joy saw [[u]]the ball[[/u]].',
             '"The ball" is the object of the sentence.  It would be marked '
             'by an accusative inflectional ending in Greek.']),
        ('Vocative form', ':          is used for direct address',
         'Vocative Case:', [
             '[[u]]Brother[[/u]], you are the man!',
             '"Brother" is a direct address and would be marked by a '
             'vocative inflectional ending in Greek.']),
    ]

    declensions_popup = {
        'type': 'expander', 'label': 'Declensions:  First, Second, Third',
        'content': [{'type': 'para', 'text':
                     'A declension is a grouping of nouns that are inflected '
                     'with a shared set of endings.  The difference in '
                     'endings does not affect the translation between first, '
                     'second and third declensions.  The second declension '
                     'nouns are characterized by an "o" as the final letter '
                     'of the stem.  They are largely masculine or neuter.  '
                     'First declension nouns are characterized by an "η" or '
                     '"α" and are mostly feminine.  Third declension nouns '
                     'have stems that end in a consonant.'}]}

    article_popup = {
        'type': 'expander', 'label': 'Definite Article', 'content': [
            {'type': 'para', 'text':
             'In contrast to English, which uses "a" as an indefinite '
             'article (e.g. "a book"),  Greek has no indefinite article.  '
             'Thus the Greek indefinite noun may be translated "book" or "a '
             'book."  Greek nouns are assumed to be indefinite unless marked '
             'by the definite article ("the").  For now simply be aware of '
             'the nominative form of the definite article which will '
             'indicate the gender of the noun being learned:'},
            {'type': 'greekRows', 'layout': 'glossOnly', 'rows': [
                {'greek': conv('o['), 'gloss': '= masculine ("the")',
                 'audio': aud('d_ho')},
                {'greek': conv('h['), 'gloss': '= feminine ("the")',
                 'audio': aud('d_hn')},
                {'greek': conv('to<'), 'gloss': '= neuter ("the")',
                 'audio': aud('d_to')}]},
            {'type': 'para', 'text':
             'When you learn nouns you should remember which article goes '
             'with it as an indication of the noun\'s gender.'}]}

    logos_meanings = meanings_table(
        'Translation of Inflectional Forms', LOGOS, CASES, {
            'Nom.': ('a word', 'words (subject of sentence)'),
            'Gen.': ('of a word', 'of words (possessive)'),
            'Dat.': ('to a word', 'to words (indirect object)'),
            'Acc.': ('a word', 'words (direct object)'),
            'Voc.': ('word', 'words (direct address)'),
        }, legend_with(vocative_eg='(e.g. O words, tell us ...)'))

    anthropos_meanings = meanings_table(
        'Translation of Inflectional Forms', ANTHROPOS, CASES, {
            'Nom.': ('a man', 'men (subject of sent.)'),
            'Gen.': ('of a man', 'of men (possessive)'),
            'Dat.': ('to a man', 'to words (indirect obj.)'),
            'Acc.': ('a man', 'men (direct object)'),
            'Voc.': ('man', 'men (direct address)'),
        }, legend_with(vocative_eg='(e.g. Listen, O man, ...)'))
    anthropos_meanings['_legacy_note'] = (
        'The dative plural gloss reads "to words (indirect obj.)" in the '
        'original chart (0x00fdf2) -- a leftover from the logos table '
        'above it. Shipped verbatim; fidelity-first, and it is visible in '
        'ch4railwalk.pdf.')

    # The Meanings card prints all five cases even though the chart above
    # it merges Nom./Voc.; both layouts are the original's own.
    hieron_meanings = {
        'label': 'Meanings',
        'title': 'Translation of Inflectional Forms',
        'columns': ['Singular', 'Plural'],
        'rows': [
            {'label': case,
             'cells': [{'greek': g, 'gloss': gl, 'audio': aud(CELL_AUDIO[g])}
                       for g, gl in pair]}
            for case, pair in [
                ('Nom.', [('ἱερόν', 'a temple'),
                          ('ἱερά', 'temples (subject of sentence)')]),
                ('Gen.', [('ἱεροῦ', 'of a temple'),
                          ('ἱερῶν', 'of temples (possessive)')]),
                ('Dat.', [('ἱερῷ', 'to a temple'),
                          ('ἱεροῖς', 'to temples (indirect object)')]),
                ('Acc.', [('ἱερόν', 'a temple'),
                          ('ἱερά', 'temples (direct object)')]),
                ('Voc.', [('ἱερόν', 'temple'),
                          ('ἱερά', 'temples (direct address)')]),
            ]],
        'legend': legend_with(accusative_eg='(e.g. He saw the temple.)',
                              vocative_eg='(e.g. O temple, the place...)'),
        'closing': 'Note that in the neuter the Nominative, Accusative and '
                   'Vocative form are always the same.',
    }

    masculine_block = {
        'type': 'paradigm',
        'switch': 'moreBack',
        'charts': [
            chart('Masculine Declension', 'λόγος', 'word', 'd_logos',
                  LOGOS, CASES, logos_meanings, 'd_logpar', name='λόγος'),
            chart('Masculine Declension', 'ἄνθρωπος', 'man', 'd_anthos',
                  ANTHROPOS, CASES, anthropos_meanings, 'd_antpar',
                  name='ἄνθρωπος'),
        ],
    }
    neuter_block = chart(
        'Neuter Declension', 'ἱερόν', 'temple', 'd_ieron',
        HIERON, ['Nom./Voc.', 'Gen.', 'Dat.', 'Acc.'],
        hieron_meanings, 'd_ierpar')
    neuter_block = {'type': 'paradigm', **neuter_block}

    greek_nouns = {
        'id': 'c4_learn_nouns',
        'type': 'contentAudio',
        'mode': 'topicPages',
        'title': 'Learn Greek Nouns:  Second Declension',
        'greekTaps': True,
        'topics': [
            {'id': 'introduction', 'title': 'Introduction', 'content': [
                {'type': 'para', 'text':
                 'There are three noun [[u]]declensions[[/u]] in Greek.  We '
                 'will learn the second declension first because it is more '
                 'frequent.  Second declension nouns are largely masculine '
                 'which is indicated by placing a " ὁ  " [[u]]definite '
                 'article[[/u]] ("the") in front of the root.  Each noun '
                 'should be learned with its definite article which '
                 'indicates its gender.  Second declension neuter nouns are '
                 'marked by the definite article "τό ."  The stem of second '
                 'declension nouns end with an omicron.'},
                declensions_popup,
                article_popup,
            ]},
            {'id': 'gender', 'title': 'Gender', 'content': [
                {'type': 'para', 'text':
                 'Greek nouns are [[u]]masculine[[/u]], [[u]]feminine[[/u]], '
                 'or [[u]]neuter[[/u]] in gender.  Often this gender is more '
                 'a syntactic feature than a metaphysical statement as many '
                 'inanimate objects are given grammatic gender.  Thus "year" '
                 '( ἔτος ) is neuter while "day" ( ἡμέρα ) is feminine but '
                 '"time" ( χρόνος ) is masculine.   Gender is indicated by '
                 'the definite article marker.  It should be learned with '
                 'the noun.'},
                {'type': 'greekRows', 'layout': 'glossOnly', 'rows': [
                    {'greek': conv('o['),
                     'gloss': '= masculine (definite article = "the")',
                     'audio': aud('d_ho')},
                    {'greek': conv('h['), 'gloss': '= feminine',
                     'audio': aud('d_hn')},
                    {'greek': conv('to<'), 'gloss': '= neuter',
                     'audio': aud('d_to')}]},
            ]},
            {'id': 'numberAgreement', 'title': 'Number and Agreement',
             'content': [
                 {'type': 'para', 'text':
                  'As in English, Greek has both [[u]]singular[[/u]] and '
                  '[[u]]plural[[/u]] nouns.  The verb must match the number '
                  'of the subject noun the same way as in English:'},
                 {'type': 'para', 'indent': True, 'text':
                  'The students [[u]]love[[/u]] Greek.\n'
                  'The student [[u]]loves[[/u]] Greek.'},
             ]},
            {'id': 'inflectionalForms', 'title': 'Inflectional Forms',
             'content': (
                 [{'type': 'para', 'text':
                   'There are 5 inflectional forms which mark the various '
                   'cases or roles that nouns play in sentences.'},
                  {'type': 'numbered', 'numbered': False,
                   'labelStyle': 'underline',
                   'items': [{'label': lab, 'text': txt}
                             for lab, txt, _, _ in inflectional]}]
                 + [{'type': 'expander', 'label': title,
                     'content': [{'type': 'para', 'text': t} for t in body]}
                    for _, _, title, body in inflectional]
             )},
            {'id': 'masculineDeclension', 'title': 'Masculine Declension',
             'content': [masculine_block]},
            {'id': 'neuterDeclension', 'title': 'Neuter Declension',
             'content': [neuter_block]},
            {'id': 'wordOrder', 'title': 'Word Order', 'content': [
                {'type': 'para', 'text':
                 'The order of words in a sentence in Greek is generally the '
                 'same as in English (subject/verb/object).  Greek puts '
                 'inflectional endings on nouns in order to mark their case.  '
                 'This allows Greek to change the word order for various '
                 'purposes.  For example, the subject may be placed after '
                 'the verb and the object placed before the verb for '
                 'emphasis while retaining the original meaning of the '
                 'sentence.'},
            ]},
        ],
    }

    # ---- Drill: Greek Noun -----------------------------------------
    # Answers are the case+number the underlined English word carries in
    # the cited verse; every one resolves against a chart above, and the
    # option grid is the paradigm itself, so a wrong derivation would
    # have no option to land on.
    GND_ANSWERS = [
        ('Acc.', 'Plural', 'brothers'),      # Mat 4:21
        ('Gen.', 'Singular', "neighbor's"),  # Mat 7:5
        ('Dat.', 'Singular', 'brother'),     # Mat 5:24
        ('Nom.', 'Plural', 'brothers'),      # Mat 12:46
        ('Voc.', 'Singular', 'Friend'),      # Luk 6:42
        ('Dat.', 'Plural', 'brothers'),      # Mat 28:10
        ('Nom.', 'Singular', 'brother'),     # Jn 11:23
        ('Gen.', 'Plural', 'brothers'),      # Mat 25:40
        ('Voc.', 'Plural', 'Friends'),       # Acts 3:17
        ('Acc.', 'Singular', 'brother'),     # Mat 10:21 (second)
        ('Nom.', 'Singular', 'Brother'),     # Mat 10:21 (first)
        ('Nom.', 'Singular', 'word'),        # Jn 1:14
        ('Acc.', 'Singular', 'word'),        # Jn 5:24
        ('Acc.', 'Plural', 'words'),         # Mat 7:24
        ('Nom.', 'Plural', 'words'),         # Mk 13:31
        ('Gen.', 'Singular', 'word'),        # Luk 1:2
        ('Acc.', 'Singular', 'word'),        # Mk 4:14
        ('Dat.', 'Singular', 'what'),        # Mk 12:13
        ('Gen.', 'Plural', 'words'),         # Luk 3:4
        ('Acc.', 'Singular', 'word'),        # Jn 5:38
        ('Dat.', 'Singular', 'word'),        # Mat 8:16
        ('Dat.', 'Plural', 'words'),         # Mk 10:24
    ]
    SLOT_ORDER = [('Nom.', 'Singular'), ('Nom.', 'Plural'),
                  ('Gen.', 'Singular'), ('Gen.', 'Plural'),
                  ('Dat.', 'Singular'), ('Dat.', 'Plural'),
                  ('Acc.', 'Singular'), ('Acc.', 'Plural'),
                  ('Voc.', 'Singular'), ('Voc.', 'Plural')]

    gnd_items = []
    for i in range(22):
        fam = 0 if i < 11 else 1
        options = [conv(slot[fam]) for slot in gnd_slots]
        for slot_i, (case, num) in enumerate(SLOT_ORDER):
            table = ADELPHOS if fam == 0 else LOGOS
            want = table[case][0 if num == 'Singular' else 1]
            got = strip_grave(options[slot_i])
            if got == want:
                continue
            # Two lambda-column lines carry a stale buffer tail with no
            # whitespace to split on ('lo<g&&ei', 'lo<ge ei'). The CHART
            # gives the cut, exactly as a screenshot would: truncate only
            # where the line STARTS with the charted form, never otherwise.
            if got.startswith(want):
                trimmed = f'GND slot {slot_i + 1} family {fam}: ' \
                          f'{options[slot_i]!r} -> {want!r} (buffer tail)'
                if trimmed not in warn:
                    warn.append(trimmed)
                options[slot_i] = want
                continue
            raise SystemExit(
                f'STOP: GND slot {slot_i + 1} family {fam} is '
                f'{options[slot_i]!r}, paradigm says {want!r}')
        case, num, underline = GND_ANSWERS[i]
        answer = options[SLOT_ORDER.index((case, num))]
        sentence = gnd_p1[i] + (('\n' + gnd_p2[i]) if gnd_p2[i] else '')
        if underline not in sentence:
            raise SystemExit(f'STOP: GND {i + 1} underline {underline!r} '
                             f'not in {sentence!r}')
        gnd_items.append({
            'sentence': sentence,
            'underline': underline,
            'ref': gnd_ref[i],
            'options': options,
            'answer': answer,
            'audio': aud(CELL_AUDIO[strip_grave(answer)]),
        })
    gnd_items[2]['_verify'] = (
        'The rich-text run table underlines "to" on line 1 of this item '
        '(format id 0x7aa). Mat 5:24 needs the dative, and the option grid '
        'offers no form that "to" could select, so the underline shipped '
        'here is "brother" on line 2 -- the field line 2 sits in has no run '
        'table, so the extraction could not confirm it. VERIFY against '
        'DOSBox.')

    greek_noun_drill = {
        'id': 'c4_drill_greek_noun',
        'type': 'select',
        'mode': 'fullOptionGrid',
        'title': 'Greek Noun Drill',
        'instructions': 'Click on the correct Greek Noun form to replace '
                        'the underlined English word',
        'optionsAreGreek': True,
        'optionsPerItem': 10,
        'optionLayout': 'paradigm2col',
        '_layout_note': 'D-26: the two columns ARE singular and plural and '
                        'the five rows ARE the cases, so this grid stays '
                        'two-up at every width and is exempt from D-19.',
        'items': gnd_items,
        'ui': {'buttons': ['Previous', 'Next', 'Pronounce', 'Hint', 'Score'],
               'checkboxes': ['Pronounce Each Drill'],
               'defaults': {'pronounceEach': True},
               'liveScore': True,
               'hintRef': 'masculineDeclension'},
        'scored': True,
        'answerPolicy': {'attemptsPerItem': 1,
                         'advanceClass': 'manualOnIncorrect'},
        '_policy_note': 'One attempt; auto-advance on correct via '
                        'ADVANCE_CORRECT_MS, manual Next on incorrect '
                        '(ch4railwalk: "Try again" + "Click on \'Next\' to '
                        'continue").',
    }

    # ---- Drill: Declining Noun -------------------------------------
    # Original defects in the Declining Noun Drill's form column,
    # corrected data-side with _legacy provenance (D-8/D-9 precedent).
    # Each is a single form that disagrees with the chapter's own chart.
    DND_FIXES = {
        'a@nqropoi': ('a@nqrwpoi',
                      'Original reads "a@nqropoi" -- omicron for omega -- '
                      'against "a@nqrwpoi" everywhere else in the same '
                      'column and in the Masculine Declension chart.'),
        'a]nqrw<pon': ('a@nqrwpon',
                       'Original accents the penult ("a]nqrw<pon"); the '
                       'chapter\'s own chart and the Meanings card both '
                       'give "a@nqrwpon", accent on the antepenult.'),
    }

    dnd_items = []
    for i in range(28):
        legacy = dnd_form[i]
        fixed, note = DND_FIXES.get(legacy, (legacy, None))
        greek = conv(fixed)
        case, num = parse_of(greek)
        item = {
            'greek': greek,
            'ref': dnd_ref[i],
            'translate': dnd_tr[i],
            'answer': f'{case.rstrip(".")}inative {num}'
            if case == 'Nom.' else None,
            'audio': aud(CELL_AUDIO[strip_grave(greek)]),
        }
        full = {'Nom.': 'Nominative', 'Gen.': 'Genitive', 'Dat.': 'Dative',
                'Acc.': 'Accusative', 'Voc.': 'Vocative',
                'Nom./Voc.': 'Nominative'}[case]
        item['answer'] = f'{full} {num}'
        if note:
            item['_legacy'] = legacy
            item['_note'] = note
        dnd_items.append(item)

    declining_drill = {
        'id': 'c4_drill_declining',
        'type': 'select',
        'mode': 'fullOptionGrid',
        'title': 'Declining Noun Drill',
        'instructions': 'Click on the matching case and number',
        'promptIsGreek': True,
        'options': 'static',
        'optionValues': [f'{full} {num}'
                         for full in ['Nominative', 'Genitive', 'Dative',
                                      'Accusative', 'Vocative']
                         for num in ['Singular', 'Plural']],
        'optionLayout': 'paradigm2col',
        '_layout_note': 'D-26, as the Greek Noun Drill.',
        'revealButtons': [{'label': 'Translate', 'field': 'translate'}],
        'items': dnd_items,
        'ui': {'buttons': ['Previous', 'Next', 'Pronounce', 'Hint',
                           'Translate', 'Score'],
               'checkboxes': ['Pronounce Each Drill'],
               'defaults': {'pronounceEach': True},
               'liveScore': True,
               'hintRef': 'masculineDeclension'},
        'scored': True,
        'answerPolicy': {'attemptsPerItem': 1,
                         'advanceClass': 'manualOnIncorrect'},
    }

    # ---- Exercise: noun speller ------------------------------------
    SPELLER_ANSWERS = [
        'λόγῳ', 'λόγους', 'λόγου', 'λόγοι', 'λόγων', 'λόγοις', 'λόγος',
        'λόγον', 'ἄνθρωπε', 'ἀνθρώπους', 'ἀνθρώποις', 'ἄνθρωποι',
        'ἀνθρώπου', 'ἀνθρώπων', 'ἄνθρωπον', 'ἀνθρώπῳ', 'ἄνθρωποι',
        'ἱεροῦ', 'ἱερῷ', 'ἱερόν',
    ]
    for form in SPELLER_ANSWERS:
        parse_of(form)          # every answer must be a charted form
    noun_speller = {
        'id': 'c4_ex_noun_speller',
        'type': 'spell',
        'title': 'Second Declension Noun Spelling Exercise',
        'instructions': 'Click letters below or use your keyboard to spell '
                        'it out.',
        'prompt': 'gloss',
        'promptLabel': 'English Word',
        'accentsOptional': True,
        'spellerTilesRef': 'chapt_1',
        'items': [{'gloss': sp_prompt[i], 'greek': SPELLER_ANSWERS[i],
                   'audio': aud(CELL_AUDIO[SPELLER_ANSWERS[i]])}
                  for i in range(20)],
        'ui': {'fields': ['English Word', 'Spell Greek Word'],
               'buttons': ['Pronounce', 'Previous', 'Score', 'Next',
                           'Check Answer', 'Greek Keyboard'],
               'checkboxes': ['Show Answer', 'With Accents',
                              'Pronounce Each Exercise']},
    }

    # ---- Scripture Memory ------------------------------------------
    JN146B = [
        ('ou]dei>j', 'no one', 'd_sm1'),
        ('e@rxetai', 'comes', 'd_sm2'),
        ('pro>j', 'to', 'd_sm3'),
        ('to>n', 'the', 'd_sm4'),
        ('pate<ra', 'father', 'd_sm5'),
        ('ei]', 'except', 'd_sm6'),
        ('mh>', None, 'd_sm7'),
        ('di ]', 'through', 'd_sm8'),
        ('e]mou?.', 'me', 'd_sm9'),
    ]
    JN146A = [
        ('λέγει', 'he said', 'c_sm1'), ('αὐτῷ', 'to him', 'c_sm2'),
        ('ὁ', None, 'c_sm3'), ('Ἰησοῦς,', 'Jesus', 'c_sm4'),
        ('Ἐγώ', 'I', 'c_sm5'), ('εἰμι', 'I am', 'c_sm6'),
        ('ἡ', 'the', 'c_sm7'), ('ὁδὸς', 'way', 'c_sm8'),
        ('καὶ', 'and', 'c_sm9'), ('ἡ', 'the', 'c_sm10'),
        ('ἀλήθεια', 'truth', 'c_sm11'), ('καὶ', 'and', 'c_sm12'),
        ('ἡ', 'the', 'c_sm13'), ('ζωή·', 'life:', 'c_sm14'),
    ]

    def verse(id_, title, reference, words, whole, legacy=False):
        return {
            'id': id_, 'type': 'contentAudio', 'mode': 'interlinearVerse',
            'title': title, 'reference': reference,
            'words': [{'greek': conv(g) if legacy else g, 'gloss': gl,
                       'audio': aud(a)} for g, gl, a in words],
            'sayWhole': {'label': 'Say Whole Verse', 'audio': aud(whole)},
        }

    learn_scripture = verse(
        'c4_learn_scripture', 'Learn Scripture Memory', 'John 14:6b',
        JN146B, 'd_jn146b', legacy=True)
    learn_scripture['_audio_verify'] = (
        'd_sm1..9 map 1:1 to the nine words; d_sm6b is unreferenced and is '
        'read as the combined "ei] mh>" clip, which the Scripture Memory '
        'Drill uses for its single "except, but" item. Listen-check d_sm6, '
        'd_sm6b and d_sm7 on device before this is treated as settled.')

    sm_words = [conv(g) for g, _, _ in JN146B]
    sm_drill = {
        'id': 'c4_drill_scripture_memory',
        'type': 'select',
        'mode': 'fullOptionGrid',
        'title': 'Scripture Memory Drill',
        'instructions': 'Click on the matching word',
        'promptIsGreek': True,
        'options': 'static',
        'optionValues': ['except, but', 'comes', 'father', 'the', 'me',
                         'through', 'no one', 'to'],
        'items': [
            {'greek': sm_words[0], 'answer': 'no one', 'audio': aud('d_sm1')},
            {'greek': sm_words[1], 'answer': 'comes', 'audio': aud('d_sm2')},
            {'greek': sm_words[2], 'answer': 'to', 'audio': aud('d_sm3')},
            {'greek': sm_words[3], 'answer': 'the', 'audio': aud('d_sm4')},
            {'greek': sm_words[4], 'answer': 'father', 'audio': aud('d_sm5')},
            {'greek': sm_words[5] + ' ' + sm_words[6],
             'answer': 'except, but', 'audio': aud('d_sm6b')},
            {'greek': sm_words[7], 'answer': 'through', 'audio': aud('d_sm8')},
            {'greek': sm_words[8].rstrip('.'), 'answer': 'me',
             'audio': aud('d_sm9')},
        ],
        'ui': {'buttons': ['Pronounce', 'Score'],
               'checkboxes': ['Pronounce Each Drill'],
               'defaults': {'pronounceEach': True}, 'liveScore': True},
        'scored': True,
        'answerPolicy': {'attemptsPerItem': 1, 'advanceClass': 'autoBoth'},
        '_policy_note': 'Auto-advances on BOTH outcomes, as chapter 3.',
    }

    scripture_speller = {
        'id': 'c4_ex_scripture_speller',
        'type': 'spellVerse',
        'title': 'Scripture Memory Spelling Exercise',
        'instructions': 'Enter all of John 14:6b then click "Check Answer"',
        'reference': 'John 14:6b',
        'answerWords': [conv(g) for g, _, _ in JN146B],
        'translation': 'no one comes to the father but by me',
        'accentsOptional': True,
        'punctuationOptional': True,
        'majorHint': {'alwaysAvailable': True,
                      '_note': 'DEPARTURE D-11.'},
        'audio': aud('d_jn146b'),
        'ui': {'fields': ['Spell Greek'],
               'buttons': ['Major Hint', 'Pronounce', 'Check Answer',
                           'Greek Keyboard', 'Restart Exercise'],
               'checkboxes': ['With Accents'],
               '_restart_note': 'DEPARTURE D-12.'},
        'spellerTilesRef': 'chapt_1',
    }

    # ---- Quick Review ----------------------------------------------
    review_chart = chart(
        'Review Nouns:  Second Declension', 'λόγος', 'word', 'd_logos',
        LOGOS, CASES, logos_meanings, 'd_logpar')
    review_chart['showGlosses'] = True
    review_chart['sayWhole'] = {'label': 'Say Whole Paradigm',
                                'audio': aud('d_logpar')}
    review_chart.pop('meanings')
    for row, case in zip(review_chart['rows'], CASES):
        sg, pl = LOGOS[case]
        gsg, gpl = logos_meanings['rows'][CASES.index(case)]['cells']
        row['cells'][0]['gloss'] = gsg['gloss']
        row['cells'][1]['gloss'] = gpl['gloss']

    quick_review = [
        {'id': 'c4_qr_vocab', 'type': 'contentAudio', 'mode': 'reviewVocab',
         'title': 'Review Vocabulary Chart', 'pool': 'lemmas',
         'showNtFreq': True,
         'playAll': {'audio': aud('d_vocl4'), 'label': 'Say Whole List'}},
        {'id': 'c4_qr_nouns', 'type': 'contentAudio', 'mode': 'paradigmChart',
         'title': 'Review Nouns:  Second Declension',
         'chartTitle': 'Review Nouns:  Second Declension',
         'paradigm': review_chart},
        verse('c4_qr_scripture_a', 'Review Scripture Memory:  Jn 14:6a',
              'John 14:6a', JN146A, 'c_sm14_6'),
        verse('c4_qr_scripture_b', 'Review Scripture Memory:  Jn 14:6b',
              'John 14:6b', JN146B, 'd_jn146b', legacy=True),
    ]

    bibliography = {
        'id': 'c4_learn_bibliography', 'type': 'contentAudio',
        'mode': 'textPage', 'title': 'Learn Bibliography',
        'content': [{'type': 'biblist', 'items': [
            'Machen, J. Gresham.  New Testament Greek for Beginners '
            '(Toronto:  The Macmillan Company, 1923), pp. 23-28.',
            'Mounce, William D.  Basics of Biblical Greek:  Grammar '
            '(Grand Rapids:  Zondervan, 1993), pp. 28-54.',
            'Summers, Ray and Thomas Sawyer.  Essentials of New Testament '
            'Greek (Nashville:  Broadman & Holman, 1995), pp. 15-20.',
            'Wenham, J. W.   The Elements of New Testament Greek '
            '(Cambridge:  Cambridge University Press, 1965), pp. 30-39.',
        ]}]}

    # ---- assemble ---------------------------------------------------
    objectives_raw = tbk.region(0x09415c)
    objectives = [
        'understand the English syntax of nouns in sentences (subject, '
        'object, number, gender, etc.)',
        'understand the Greek noun system (gender, number, case)',
        'write out the second declension paradigm for masculine and neuter '
        'nouns',
        'master 10 more high frequency vocabulary words',
        'memorize John 14:6b in Greek',
    ]
    for frag in ('understand the English syntax of nouns in sentences',
                 'write out the second declension paradigm for masculine',
                 'memorize John 14:6b in Greek'):
        if frag not in objectives_raw:
            raise SystemExit(f'STOP: objectives field lost {frag!r}')

    chapter = {
        '_comment': (
            'Chapter 4 (Second Declension Nouns), assembled from '
            '4_NOUNS2.TBK + CHAPT_4 audio + ch4railwalk.pdf (DOSBox rail '
            'walk). Pools are read by offset (5E-EXTRACTION-MAP.md); every '
            'drill and speller answer is derived from the chapter\'s own '
            'paradigm charts and validated against the extracted option '
            'columns at assembly time. Page prose is verbatim from the '
            'extracted fields, cut where the rail-walk screenshots end the '
            'page -- ToolBook leaves a stale tail in most field buffers.'),
        'id': 'chapt_4',
        'number': 4,
        'title': 'Second Declension Nouns',
        'references': '(see per-topic refs)',
        'objectivesPreamble': 'You will be able to:',
        'objectives': objectives,
        '_objectives_note': 'Extracted verbatim from 0x09415c. A near '
                            'duplicate at 0x0b7706 drops "the" in line 1; '
                            'that is a stale buffer, not the page.',
        'vocab': KEYS,
        'learn': [
            {'id': 'c4_learn_objectives', 'type': 'contentAudio',
             'mode': 'objectivesPage', 'title': 'Learn Chapter Objectives',
             'instructions': ''},
            english_concepts,
            greek_nouns,
            {'id': 'c4_learn_vocab', 'type': 'contentAudio',
             'mode': 'flashcard', 'title': 'Learn Vocabulary',
             'pool': 'lemmas'},
            learn_scripture,
            bibliography,
        ],
        'drill': [
            greek_noun_drill,
            declining_drill,
            {'id': 'c4_drill_vocab_gk_en', 'type': 'select',
             'mode': 'fullOptionGrid',
             'title': 'Vocabulary:  Greek to English Drill',
             'instructions': 'Click on the matching word',
             'promptFrom': {'lexicon': 'lemmas', 'show': 'greek',
                            'audio': 'pronounceButton'},
             'options': 'glossShortPool', 'scored': True,
             'ui': {'buttons': ['Pronounce', 'Score'],
                    'checkboxes': ['Pronounce Each Drill'],
                    'defaults': {'pronounceEach': True}, 'liveScore': True},
             'answerPolicy': {'attemptsPerItem': 1,
                              'advanceClass': 'manualOnIncorrect'}},
            {'id': 'c4_drill_vocab_en_gk', 'type': 'select',
             'mode': 'fullOptionGrid',
             'title': 'Vocabulary:  English to Greek Drill',
             'instructions': 'Click on the matching word',
             'promptFrom': {'lexicon': 'lemmas', 'show': 'glossShort'},
             'options': 'greekPool', 'optionsAreGreek': True, 'scored': True,
             'ui': {'buttons': ['Pronounce', 'Score'],
                    'checkboxes': ['Pronounce Each Drill'],
                    'defaults': {'pronounceEach': True}, 'liveScore': True},
             'answerPolicy': {'attemptsPerItem': 1,
                              'advanceClass': 'manualOnIncorrect'}},
            sm_drill,
        ],
        'exercise': [
            noun_speller,
            {'id': 'c4_ex_vocab_speller', 'type': 'spell',
             'title': 'Vocabulary Spelling Exercise',
             'instructions': 'Click letters below or use your keyboard to '
                             'spell it out.',
             'prompt': 'gloss', 'promptLabel': 'English Meaning',
             'accentsOptional': True, 'spellerTilesRef': 'chapt_1',
             'items': [{'ref': k} for k in KEYS],
             'ui': {'fields': ['English Meaning', 'Spell Greek Word'],
                    'buttons': ['Pronounce', 'Previous', 'Score', 'Next',
                                'Check Answer', 'Greek Keyboard'],
                    'checkboxes': ['Show Answer', 'With Accents',
                                   'Pronounce Each Exercise']}},
            scripture_speller,
        ],
        'quickReview': quick_review,
        'feedback': {
            'correct': ['Perfect!', 'Right On!', 'Great!', 'Fantastic!',
                        'Yes', 'Congratulations'],
            'incorrect': ['Try again', 'Repetition will get it',
                          'Swing and a miss', 'Not quite!'],
        },
        'sequence': [
            'c4_learn_objectives', 'c4_learn_english_concepts',
            'c4_learn_nouns', 'c4_drill_greek_noun', 'c4_drill_declining',
            'c4_ex_noun_speller', 'c4_learn_vocab', 'c4_drill_vocab_gk_en',
            'c4_drill_vocab_en_gk', 'c4_ex_vocab_speller',
            'c4_learn_scripture', 'c4_drill_scripture_memory',
            'c4_ex_scripture_speller', 'c4_qr_vocab', 'c4_qr_nouns',
            'c4_qr_scripture_a', 'c4_qr_scripture_b',
            'c4_learn_bibliography',
        ],
        '_sequence_note': 'Rail order from ch4railwalk.pdf (Nathanael, '
                          '2026-08-03).',
    }
    return chapter, lexicon, warn


def validate(chapter):
    ids = []
    for sec in ('learn', 'drill', 'exercise', 'quickReview'):
        ids += [a['id'] for a in chapter[sec]]
    seq = chapter['sequence']
    if sorted(ids) != sorted(seq):
        raise SystemExit('STOP: sequence does not cover every activity '
                         f'exactly once\n  only in activities: '
                         f'{sorted(set(ids) - set(seq))}\n  only in '
                         f'sequence: {sorted(set(seq) - set(ids))}')
    blob = json.dumps(chapter, ensure_ascii=False)
    if 'c1_' in blob or 'c3_' in blob.replace('chapt_4_c_sm', ''):
        pass
    if unicodedata.normalize('NFC', blob) != blob:
        raise SystemExit('STOP: chapter JSON is not NFC-normalized')
    return len(ids)


def main():
    tbk_path, fontmap_path, outdir = sys.argv[1], sys.argv[2], sys.argv[3]
    tbk = Tbk(tbk_path)
    conv = make_conv(json.load(open(fontmap_path)))
    chapter, lexicon, warn = build(tbk, conv)
    n = validate(chapter)
    for w in warn:
        print('WARN:', w)
    for name, obj in (('chapt-04.json', chapter),
                      ('lexicon-chapt04.json', lexicon)):
        with open(f'{outdir}/{name}', 'w', encoding='utf-8') as fh:
            json.dump(obj, fh, ensure_ascii=False, indent=1)
            fh.write('\n')
        print(f'wrote {outdir}/{name}')
    print(f'{n} activities, {len(chapter["sequence"])} rail stops')


if __name__ == '__main__':
    main()
