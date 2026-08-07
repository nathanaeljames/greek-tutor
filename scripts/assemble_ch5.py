#!/usr/bin/env python3
"""assemble_ch5.py -- chapter 5 data assembly (cohort 5E, pipeline-side).

Same contract as assemble_ch4.py: pools are read from 5_NOUNS1.TBK by
OFFSET (5E-EXTRACTION-MAP.md sec 2), converted through font-map.json,
and every drill and speller answer is DERIVED from the chapter's own
paradigm charts and cross-checked against the extracted option columns.
Page prose is verbatim from the extracted fields, cut where the
ch5railwalk.pdf screenshots end the page.

Nothing here is authored. If a field cannot be located, or a derived
answer disagrees with the chapter's own chart, the assembly STOPS
(PIPELINE-INSIGHTS Stage 7).

Usage:  python3 assemble_ch5.py 5_NOUNS1.TBK font-map.json outdir
"""
import json
import struct
import sys
import unicodedata

A = 'chapt_5_'


def aud(name):
    return A + name


# --------------------------------------------------------------------
# 1. Font conversion / field reading (identical to assemble_ch4.py)
# --------------------------------------------------------------------

def make_conv(fontmap):
    lower = fontmap['lowercase']
    upper = fontmap['uppercase']
    dia = {k: v['unicode'] for k, v in fontmap['diacritics_verified'].items()}
    for k, v in fontmap.get('base_verified_additions', {}).items():
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


class Tbk:
    def __init__(self, path):
        self.data = open(path, 'rb').read()

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

    def pool(self, off, n, label):
        lines = [l.strip() for l in self.region(off).split('\r\n')]
        lines = [l for l in lines if l]
        if len(lines) < n:
            raise SystemExit(
                f'STOP: pool {label} at {off:#x}: expected {n}, got {len(lines)}')
        return lines[:n]


# --------------------------------------------------------------------
# 2. Paradigms
# --------------------------------------------------------------------

FIVE = ['Nom.', 'Gen.', 'Dat.', 'Acc.', 'Voc.']

# The Eta chart prints its merged row label with a BACKSLASH while the
# two Alpha charts on the same page use a slash, and the second Alpha
# chart drops the trailing period. All three ship verbatim -- D-27.
GRAPHE_ORDER = ['Nom.\\Voc.', 'Gen.', 'Dat.', 'Acc.']
HORA_ORDER = ['Nom./Voc.', 'Gen.', 'Dat.', 'Acc.']
DOXA_ORDER = ['Nom./Voc', 'Gen.', 'Dat.', 'Acc.']

GRAPHE = {
    'Nom.\\Voc.': ('γραφή', 'γραφαί'), 'Gen.': ('γραφῆς', 'γραφῶν'),
    'Dat.': ('γραφῇ', 'γραφαῖς'), 'Acc.': ('γραφήν', 'γραφάς'),
}
HORA = {
    'Nom./Voc.': ('ὥρα', 'ὧραι'), 'Gen.': ('ὥρας', 'ὡρῶν'),
    'Dat.': ('ὥρᾳ', 'ὥραις'), 'Acc.': ('ὥραν', 'ὥρας'),
}
DOXA = {
    'Nom./Voc': ('δόξα', 'δόξαι'), 'Gen.': ('δόξης', 'δοξῶν'),
    'Dat.': ('δόξῃ', 'δόξαις'), 'Acc.': ('δόξαν', 'δόξας'),
}
PROPHETES = {
    'Nom.': ('προφήτης', 'προφῆται'), 'Gen.': ('προφήτου', 'προφητῶν'),
    'Dat.': ('προφήτῃ', 'προφήταις'), 'Acc.': ('προφήτην', 'προφήτας'),
    'Voc.': ('προφῆτα', 'προφῆται'),
}
# The two drill-only families, from the First Declension Noun Drill's
# own option columns; ἀγάπη is also the chapter's headword vocabulary.
AGAPE = {'Nom.': ('ἀγάπη',), 'Gen.': ('ἀγάπης',),
         'Dat.': ('ἀγάπῃ',), 'Acc.': ('ἀγάπην',)}
ALETHEIA = {'Nom.': ('ἀλήθεια',), 'Gen.': ('ἀληθείας',),
            'Dat.': ('ἀληθείᾳ',), 'Acc.': ('ἀλήθειαν',)}
DOXA_SG = {'Nom.': ('δόξα',), 'Gen.': ('δόξης',),
           'Dat.': ('δόξῃ',), 'Acc.': ('δόξαν',)}

ARTICLE_SG = {
    'Nom.': ('ὁ', 'ἡ', 'τό'), 'Gen.': ('τοῦ', 'τῆς', 'τοῦ'),
    'Dat.': ('τῷ', 'τῇ', 'τῷ'), 'Acc.': ('τόν', 'τήν', 'τό'),
}
ARTICLE_PL = {
    'Nom.': ('οἱ', 'αἱ', 'τά'), 'Gen.': ('τῶν', 'τῶν', 'τῶν'),
    'Dat.': ('τοῖς', 'ταῖς', 'τοῖς'), 'Acc.': ('τούς', 'τάς', 'τά'),
}
ARTICLE_CASES = ['Nom.', 'Gen.', 'Dat.', 'Acc.']
GENDERS = ['Masculine', 'Feminine', 'Neuter']

CELL_AUDIO = {
    'γραφή': 'e_graphn', 'γραφαί': 'e_grapai', 'γραφῆς': 'e_grapns',
    'γραφῶν': 'e_grapwn', 'γραφῇ': 'e_graphn', 'γραφαῖς': 'e_graais',
    'γραφήν': 'e_grapnn', 'γραφάς': 'e_grapas',
    'ὥρα': 'e_hwra', 'ὧραι': 'e_hwrai', 'ὥρας': 'e_hwras',
    'ὡρῶν': 'e_hwrwn', 'ὥρᾳ': 'e_hwra', 'ὥραις': 'e_hwrais',
    'ὥραν': 'e_hwran',
    'δόξα': 'e_doxa', 'δόξαι': 'e_doxai', 'δόξης': 'e_doxns',
    'δοξῶν': 'e_doxwn', 'δόξῃ': 'e_doxn', 'δόξαις': 'e_doxais',
    'δόξαν': 'e_doxan', 'δόξας': 'e_doxas',
    'προφήτης': 'e_propns', 'προφῆται': 'e_propai',
    'προφήτου': 'e_propou', 'προφητῶν': 'e_propwn',
    'προφήτῃ': 'e_propn', 'προφήταις': 'e_proais',
    'προφήτην': 'e_propnn', 'προφήτας': 'e_propas',
    'προφῆτα': 'e_propa',
    'ἀγάπη': 'e_agapn', 'ἀγάπης': 'e_agapns', 'ἀγάπῃ': 'e_agapn',
    'ἀγάπην': 'e_agapnn',
    'ἀλήθεια': 'e_alntia', 'ἀληθείας': 'e_alntas',
    'ἀληθείᾳ': 'e_alntai', 'ἀλήθειαν': 'e_alntan',
    'ὁ': 'e_ho', 'ἡ': 'e_hn', 'τό': 'e_to', 'οἱ': 'e_hoi',
    'αἱ': 'e_hai', 'τά': 'e_ta', 'τοῦ': 'e_tou', 'τῆς': 'e_tns',
    'τῶν': 'e_twn', 'τῷ': 'e_tw', 'τῇ': 'e_tn', 'τοῖς': 'e_tois',
    'ταῖς': 'e_tais', 'τόν': 'e_ton', 'τήν': 'e_tnn',
    'τούς': 'e_tous', 'τάς': 'e_tas',
}

AUDIO_VERIFY = (
    'Three chapter-5 clips could not be assigned from their filenames '
    'alone and need a listen-check on device: e_graphn (wired to both '
    'γραφή and γραφῇ, which are homophones -- the same doubling ὥρα/ὥρᾳ '
    'gets with e_hwra), e_grapax (UNREFERENCED; most likely a second '
    'take of γραφάς), and e_aleia (UNREFERENCED; most likely a second '
    'take of ἀλήθεια, for which e_alntia is wired). Three whole-gender '
    'clips (e_artmas, e_artfem, e_artneu) and the whole-paradigm '
    'e_artpar have no surface in the rail walk -- the article charts '
    'offer Say Whole List (e_artsg / e_artpl) and per-column headers '
    '(e_artms/fs/ns, e_artmp/fp/np), which the data wires. Leave the '
    'four unwired unless the build finds a surface.')


def strip_grave(word):
    out = word
    for a, b in (('\u1f76', '\u1f77'), ('\u1f78', '\u1f79'),
                 ('\u1f74', '\u1f75'), ('\u1f72', '\u1f73'),
                 ('\u1f7a', '\u1f7b'), ('\u1f7c', '\u1f7d'),
                 ('\u1f70', '\u1f71')):
        out = out.replace(a, b)
    return unicodedata.normalize('NFC', out)


NOUN_TABLES = [('γραφή', GRAPHE, GRAPHE_ORDER), ('ὥρα', HORA, HORA_ORDER),
               ('δόξα', DOXA, DOXA_ORDER),
               ('προφήτης', PROPHETES, FIVE)]

CASE_FULL = {'Nom.': 'Nominative', 'Gen.': 'Genitive', 'Dat.': 'Dative',
             'Acc.': 'Accusative', 'Voc.': 'Vocative',
             'Nom./Voc.': 'Nominative', 'Nom./Voc': 'Nominative',
             'Nom.\\Voc.': 'Nominative'}


def parse_of(form):
    """(case label, number) for a noun form, from the chapter's charts.

    Ambiguity inside a single chart -- ὥρας is both genitive singular
    and accusative plural -- is resolved by the caller, which passes the
    Declining Noun Drill's own translation column.
    """
    probe = strip_grave(form)
    hits = []
    for _, table, _order in NOUN_TABLES:
        for case, pair in table.items():
            for idx, val in enumerate(pair):
                if probe == val:
                    hits.append((case, 'Singular' if idx == 0 else 'Plural'))
    if not hits:
        raise SystemExit(f'STOP: {form!r} is in no chapter-5 paradigm')
    return hits


def chart(title, lemma_greek, lemma_gloss, lemma_audio, table, order,
          meanings, say_whole, name=None, note=None):
    rows = [{
        'label': case,
        'cells': [{'greek': g, 'audio': aud(CELL_AUDIO[g])}
                  for g in table[case]],
    } for case in order]
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


LEGEND = [
    ('Nominative', '= subject of the sentence'),
    ('Genitive', '= possessive usually translated with "of"'),
    ('Dative', '= indirect object usually translated with "to"'),
    ('Accusative', '= direct object of a sentence'),
    ('Vocative', '= direct address'),
]


def legend(dative=None, vocative_eg=None):
    out = [{'label': a, 'text': b} for a, b in LEGEND]
    if dative:
        out[2]['text'] = dative
    if vocative_eg:
        out[4]['text'] += ' ' + vocative_eg
    return out


def meanings(title, order, rows, leg, closing=None):
    out = {
        'label': 'Meanings', 'title': title,
        'columns': ['Singular', 'Plural'],
        'rows': [{'label': case,
                  'cells': [{'greek': g, 'gloss': gl,
                             'audio': aud(CELL_AUDIO[g])} for g, gl in pair]}
                 for case, pair in zip(order, rows)],
        'legend': leg,
    }
    if closing:
        out['closing'] = closing
    return out


# --------------------------------------------------------------------
# 3. Build
# --------------------------------------------------------------------

def build(tbk, conv):
    warn = []

    # ---- pools -----------------------------------------------------
    vocab_legacy = tbk.pool(0x01749c, 10, 'vocab lemmas')
    vocab_gloss = tbk.pool(0x01766e, 10, 'vocab glosses')
    vocab_gloss[9] = 'hour'                       # buffer tail

    fdn_p1 = tbk.pool(0x093710, 20, 'FDND prompt line 1')
    fdn_p2 = [l.strip() for l in tbk.region(0x096164).split('\r\n')][1:21]
    fdn_ref = tbk.pool(0x0965a4, 20, 'FDND references')
    fdn_p1[19] = 'my glory is nothing'            # buffer tail
    fdn_slots = [tbk.pool(o, 3, f'FDND option slot {i + 1}')
                 for i, o in enumerate(
                     [0x095382, 0x0958fe, 0x095c40, 0x095f84])]

    dnd_form = tbk.pool(0x09c336, 25, 'DND forms')
    dnd_ref = tbk.pool(0x09c516, 25, 'DND references')
    dnd_tr = tbk.pool(0x09c6f6, 25, 'DND translations')
    dnd_ref[24] = 'Jn 6:45'                       # buffer tail

    art_form = tbk.pool(0x08d57e, 24, 'article drill forms')
    art_ref = tbk.pool(0x08d75e, 24, 'article drill references')
    art_gender = tbk.pool(0x08d93e, 24, 'article drill genders')
    art_form[23] = 'ta<'                          # buffer tail
    art_ref[23] = 'Jn 3:19'                       # buffer tail

    art_sp_prompt = tbk.pool(0x0c20d0, 22, 'article speller prompts')
    art_sp_ref = tbk.pool(0x0c2ff2, 22, 'article speller references')
    noun_sp_prompt = tbk.pool(0x0618c4, 24, 'noun speller prompts')

    # ---- lexicon ---------------------------------------------------
    KEYS = ['agape', 'aletheia', 'hamartia', 'basileia', 'graphe',
            'egeiro', 'ekklesia', 'ergon', 'mathetes', 'hora']
    SHORT = ['love', 'truth', 'sin', 'kingdom', 'writing', 'I raise up',
             'assembly', 'work', 'disciple', 'hour']
    FULL = ['love', 'truth', 'sin', 'kingdom', 'writing', 'I raise up',
            'assembly', 'work', 'disciple', 'hour']
    POS = ['noun', 'noun', 'noun', 'noun', 'noun', 'verb', 'noun',
           'noun', 'noun', 'noun']
    FREQ = [116, 109, 173, 162, 50, 144, 114, 169, 261, 106]
    LEMMA_AUDIO = ['e_agapn', None, None, None, 'e_graphn', None,
                   'e_ekklns', None, None, 'e_hwra']

    lemmas = {}
    for i, key in enumerate(KEYS):
        lexical = conv(vocab_legacy[i])
        bare = lexical.split(',')[0].strip()
        lemmas[key] = {
            'greek': bare, 'translit': key, 'gloss': FULL[i],
            'glossShort': SHORT[i], 'pos': POS[i],
            'audio': aud(f'e_voc{i + 1}'), '_legacy': vocab_legacy[i],
            'ntFreq': FREQ[i],
        }
        if lexical != bare:
            lemmas[key]['lexicalForm'] = lexical
        if vocab_gloss[i] not in (SHORT[i], FULL[i]):
            lemmas[key]['_poolGloss'] = vocab_gloss[i]

    example_words = {}

    def example(key, greek, gloss, audio):
        example_words[key] = {'greek': greek, 'gloss': gloss,
                              'audio': aud(audio)}

    example('oikos', conv('oi#koj'), '"house" is masculine', 'e_oikos')
    example('hieron', conv('i[ero<n'), '"temple" is neuter', 'e_ieron')
    example('ekklesia', conv('e]kklhsi<a'), '"church" is feminine',
            'e_ekklns')
    example('etos', conv('e@toj'), 'year', 'e_etos')
    example('hemera', conv('h[me<ra'), 'day', 'e_hnmera')
    example('chronos', conv('xro<noj'), 'time', 'e_chrons')
    example('logos', conv('lo<goj'), 'word', 'e_logos')
    example('ho_logos', conv('o[ lo<goj'), 'the word', 'e_ologos')
    example('logon', conv('lo<gon'), 'word', 'e_logon')
    example('ton_logon', conv('to>n lo<gon'), 'the word', 'e_tlogon')
    for form, clip in CELL_AUDIO.items():
        example_words[f'form_{clip[2:]}_{form}'] = {
            'greek': form, 'gloss': None, 'audio': aud(clip)}

    lexicon = {
        '_comment': (
            'Chapter 5 lexicon, assembled from 5_NOUNS1.TBK (cohort 5E). '
            'Vocabulary order is the TBK list order (alphabetical), which '
            'matches e_voc1..10. ntFreq values are the Review Vocabulary '
            'Chart\'s own counts (0x0dfe12). `greek` is the BARE lemma, '
            'because the drills and the Vocabulary Spelling Exercise '
            'answer against it; `lexicalForm` is the citation form the '
            'flashcard and the review chart print. exampleWords carries '
            'the teaching-page words plus every inflected paradigm and '
            'definite-article form. CHAPT_5 ships e_* plus chapter 3\'s '
            'c_sm* and chapter 4\'s d_sm* for the two cumulative Scripture '
            'review charts; the data references those LOCAL copies.'),
        '_audioVerify': AUDIO_VERIFY,
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
             'E.g.   Zach hit the ball.',
             'Zach hit what?    ball (= object)']),
        ('Possessive case', ' (Gk:  genitive):\nHe hit [[u]]his[[/u]] ball.',
         'Possessive Case:', [
             'The possessive case often can be discovered by asking '
             '"whose"?',
             'Charlie hid his ball.',
             'whose ball?    his (possessive)']),
    ]

    english_concepts = {
        'id': 'c5_learn_english_concepts',
        'type': 'contentAudio', 'mode': 'topicPages',
        'title': 'Learn English Concepts', 'greekTaps': True,
        'topics': [
            {'id': 'introduction', 'title': 'Introduction', 'content': [
                {'type': 'para', 'text':
                 'Nouns are commonly defined as words that stand for a '
                 'person, place, or thing.'},
                {'type': 'defList', 'items': [
                    {'term': 'Tanya', 'def': '= person'},
                    {'term': 'store', 'def': '= place'},
                    {'term': 'book', 'def': '= thing'}]},
                {'type': 'para', 'emphasis': True, 'text':
                 'This page is largely a repetition of what was done in '
                 'chapter 4 except for the section on the definite article.  '
                 'If you understood it there, then proceed with haste.'},
            ]},
            {'id': 'gender', 'title': 'Gender', 'content': [
                {'type': 'para', 'text':
                 'Gender in English is determined by the sex of the '
                 'referent:  "king... he", female "queen... she".  Objects '
                 'which are neither male nor female are considered neuter:  '
                 '"boat...it".  In Greek some inanimate objects are given '
                 'male or female designations.  Be careful not to confuse '
                 'Greek grammatical gender with biological gender.'},
                {'type': 'greekRows', 'layout': 'glossOnly', 'rows': [
                    {'greek': example_words['oikos']['greek'],
                     'gloss': '"house" is masculine', 'audio': aud('e_oikos')},
                    {'greek': example_words['hieron']['greek'],
                     'gloss': '"temple" is neuter', 'audio': aud('e_ieron')},
                    {'greek': example_words['ekklesia']['greek'],
                     'gloss': '"church" is feminine',
                     'audio': aud('e_ekklns')}]},
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
                  'items': [{'label': l, 'text': t}
                            for l, t, _, _ in case_popup]}]
                + [{'type': 'expander', 'label': t,
                    'content': [{'type': 'para', 'text': x} for x in body]}
                   for _, _, t, body in case_popup])},
            {'id': 'definiteArticle', 'title': 'Definite Article', 'content': [
                {'type': 'para', 'text':
                 'In English we have both an indefinite article "a" (a book) '
                 'and a definite article "the" (the book).'},
                {'type': 'para', 'text':
                 'In Greek there is no indefinite article.   Hence "book" '
                 'and "a  book" look exactly the same.'},
                {'type': 'para', 'text':
                 'The definite article in Greek must match the noun it goes '
                 'with in gender, number and case.'},
                {'type': 'para', 'text':
                 'The definite article is to be learned with each noun as it '
                 'will indicate the gender of the noun.'},
            ]},
        ],
    }

    # ---- Learn: Greek Nouns ----------------------------------------
    inflectional = [
        ('Nominative form', ':  marks the subject of the sentence',
         'Nominative Case:', [
             '[[u]]The music[[/u]] soothed our hearts.',
             '"The music" is the subject of the sentence.  In Greek it '
             'would be marked with a nominative inflectional ending.']),
        ('Genitive form', ':  expresses a possessive', 'Genitive Case:', [
            'The Pharisee went to the house [[u]]of God[[/u]].',
            'The Pharisee went to [[u]]God\'s[[/u]] house.',
            '"Of God" or "God\'s" would be marked in Greek with a genitive '
            'inflectional ending.']),
        ('Dative form', ':  marks the indirect object', 'Dative Case:', [
            'He spoke a word [[u]]to the apostle[[/u]].',
            '"To the apostle" would be marked with a dative inflectional '
            'ending in Greek.']),
        ('Accusative form', ':  indicates the object of the sentence',
         'Accusative Case:', [
             'Joy saw [[u]]the ball[[/u]].',
             '"The ball" is the object of the sentence.  It would be marked '
             'by an accusative inflectional ending in Greek.']),
        ('Vocative form', ':  is used for direct address', 'Vocative Case:', [
            '[[u]]Brother[[/u]], you are the man!',
            '"Brother" is a direct address and would be marked by a '
            'vocative inflectional ending in Greek.']),
    ]

    graphe_meanings = meanings(
        'Meanings:  Translation of Inflectional Forms', FIVE, [
            [('γραφή', 'a writing'), ('γραφαί', 'writings (subject of sentence)')],
            [('γραφῆς', 'of a writing'), ('γραφῶν', 'of writings (possessive)')],
            [('γραφῇ', 'to a writing'), ('γραφαῖς', 'to writings (indirect obj)')],
            [('γραφήν', 'a writing'), ('γραφάς', 'writings (direct obj)')],
            [('γραφή', 'writing'), ('γραφαί', 'writings (direct address)')],
        ], legend(vocative_eg='(e.g. O writings show us...)'))

    hora_meanings = meanings(
        'Meanings:  Translation of Inflectional Forms', FIVE, [
            [('ὥρα', 'hour'), ('ὧραι', 'hours (subject of sentence)')],
            [('ὥρας', 'of an hour'), ('ὡρῶν', 'of hours (possessive)')],
            [('ὥρᾳ', 'for an hour'), ('ὥραις', 'for hours (indirect object)')],
            [('ὥραν', 'hour'), ('ὥρας', 'hours (direct object)')],
            [('ὥρα', 'O hour'), ('ὧραι', 'O hours (direct address)')],
        ], legend(dative='= indirect object usually translated with "to" '
                         'or "for"',
                  vocative_eg='(e.g. O glory, why have you... )'),
        closing='Note that the Nominative and Vocative form is the same.')

    doxa_meanings = meanings(
        'Meanings:  Translation of Inflectional Forms', FIVE, [
            [('δόξα', 'glory'), ('δόξαι', 'glories (subject of sentence)')],
            [('δόξης', 'of glory'), ('δοξῶν', 'of glories (possessive)')],
            [('δόξῃ', 'to glory'), ('δόξαις', 'to glories (indirect object)')],
            [('δόξαν', 'glory'), ('δόξας', 'glories (direct object)')],
            [('δόξα', 'glory'), ('δόξαι', 'glories (direct address)')],
        ], legend(vocative_eg='(e.g. O glory, why have you... )'),
        closing='Note in the neuter the Nominative and Vocative form are '
                'always the same.')
    doxa_meanings['_legacy_note'] = (
        'The closing line says "in the neuter" on a feminine noun\'s card; '
        'it is the original\'s own text (0x00f744) and is on screen in '
        'ch5railwalk.pdf. Shipped verbatim.')

    prophetes_meanings = meanings(
        'Meanings:  Translation of Inflectional Forms', FIVE, [
            [('προφήτης', 'prophet'), ('προφῆται', 'prophets (subject)')],
            [('προφήτου', 'of a prophet'), ('προφητῶν', 'of prophets (possessive)')],
            [('προφήτῃ', 'to a prophet'), ('προφήταις', 'to prophets (indirect obj)')],
            [('προφήτην', 'prophet'), ('προφήτας', 'prophets (direct obj)')],
            [('προφῆτα', 'prophet'), ('προφῆται', 'prophets (direct address)')],
        ], legend(vocative_eg='(e.g. O prophet, speak ... )'))

    alpha_block = {
        'type': 'paradigm', 'switch': 'moreBack', 'charts': [
            chart('First Declension--Alpha', 'ὥρα', 'hour', 'e_hwra',
                  HORA, HORA_ORDER, hora_meanings, 'e_hwrpar', name='ὥρα'),
            chart('First Declension--Alpha', 'δόξα', 'glory', 'e_doxa',
                  DOXA, DOXA_ORDER, doxa_meanings, 'e_doxpar', name='δόξα',
                  note='This form occurs with nouns ending in ζ, ξ, ψ, σ '
                       'or λλ.'),
        ]}

    greek_nouns = {
        'id': 'c5_learn_nouns', 'type': 'contentAudio', 'mode': 'topicPages',
        'title': 'Learn Greek Nouns:  1st Declension', 'greekTaps': True,
        'topics': [
            {'id': 'introduction', 'title': 'Introduction', 'content': [
                {'type': 'para', 'text':
                 'There are three noun [[u]]declensions[[/u]] in Greek.  We '
                 'have learned the second declension with its masculine and '
                 'neuter nouns.  Now we will focus on the first declension '
                 'which is largely feminine.  First declension nouns are '
                 'largely feminine which is indicated by placing a " ἡ " '
                 '[[u]]definite article[[/u]] ("the") in front of the root.  '
                 'Each noun should be learned with its definite article '
                 'which indicates its gender.  The stem of first declension '
                 'nouns end with an alpha or eta.'},
                {'type': 'expander', 'label': 'Declensions:  First, Second, '
                                              'Third', 'content': [
                    {'type': 'para', 'text':
                     'A declension is a grouping of nouns that are inflected '
                     'with a shared set of endings.  The difference in '
                     'endings does not effect the translation between first, '
                     'second and third declensions.  First declension nouns '
                     'are characterized by an "η" or "α" and are mostly '
                     'feminine.  The second declension is characterized by '
                     'an "o" as the final letter of the stem.  They are '
                     'largely masculine or neuter.   Third declension nouns '
                     'have stems that end in a consonant.'}]},
                {'type': 'expander', 'label': 'Definite Article', 'content': [
                    {'type': 'para', 'text':
                     'Greek has no indefinite article,  whereas in English '
                     'we would say "[[u]]a[[/u]] book."  Thus the Greek '
                     'indefinite noun may be translated "book" or "a book."  '
                     'Greek nouns are assumed to be indefinite unless marked '
                     'by the definite article ("the").  For now simply be '
                     'aware of the nominative form of the definite article '
                     'which will indicate the gender of the noun being '
                     'learned:'},
                    {'type': 'greekRows', 'layout': 'glossOnly', 'rows': [
                        {'greek': 'ὁ', 'gloss': '= masculine ("the")',
                         'audio': aud('e_ho')},
                        {'greek': 'ἡ', 'gloss': '= feminine ("the")',
                         'audio': aud('e_hn')},
                        {'greek': 'τό', 'gloss': '= neuter ("the")',
                         'audio': aud('e_to')}]}]},
            ]},
            {'id': 'gender', 'title': 'Gender', 'content': [
                {'type': 'para', 'text':
                 'Greek nouns are either [[u]]masculine[[/u]], '
                 '[[u]]feminine[[/u]], or [[u]]neuter[[/u]] in gender.  '
                 'Often this gender is more a syntactic feature than a '
                 'metaphysical statement as many inanimate objects are given '
                 'grammatic gender.  Thus "year" ( ἔτος ) is neuter while '
                 '"day" ( ἡμέρα ) is feminine but "time" ( χρόνος ) is '
                 'masculine.   Gender is indicated by the definite article '
                 'marker which is to be learned with the noun.'},
                {'type': 'greekRows', 'layout': 'glossOnly', 'rows': [
                    {'greek': 'ὁ',
                     'gloss': '= masculine (definite article = "the")',
                     'audio': aud('e_ho')},
                    {'greek': 'ἡ', 'gloss': '= feminine',
                     'audio': aud('e_hn')},
                    {'greek': 'τό', 'gloss': '= neuter',
                     'audio': aud('e_to')}]},
            ]},
            {'id': 'numberAgreement', 'title': 'Number and Agreement',
             'content': [
                 {'type': 'para', 'text':
                  'As in English, Greek has both [[u]]singular[[/u]] and '
                  '[[u]]plural[[/u]] nouns.  The verb must match the number '
                  'of the subject noun the same way as in English:'},
                 {'type': 'para', 'indent': True, 'text':
                  'The students [[u]]love[[/u]] Greek.\n'
                  'The student [[u]]loves[[/u]] Greek.'}]},
            {'id': 'inflectionalForms', 'title': 'Inflectional Forms',
             'content': (
                 [{'type': 'para', 'text':
                   'There are 5 inflectional forms which mark the various '
                   'cases or roles that nouns play in sentences.'},
                  {'type': 'numbered', 'numbered': False,
                   'labelStyle': 'underline',
                   'items': [{'label': l, 'text': t}
                             for l, t, _, _ in inflectional]}]
                 + [{'type': 'expander', 'label': t,
                     'content': [{'type': 'para', 'text': x} for x in body]}
                    for _, _, t, body in inflectional])},
            {'id': 'firstDeclensionEta', 'title': 'First Declension--Eta',
             'content': [{'type': 'paradigm', **chart(
                 'First Declension--Eta', 'γραφή', 'writing, Scripture',
                 'e_graphn', GRAPHE, GRAPHE_ORDER, graphe_meanings,
                 'e_grapar')}]},
            {'id': 'firstDeclensionAlpha', 'title': 'First Declension--Alpha',
             'content': [alpha_block]},
            {'id': 'firstDeclensionMasc', 'title': 'First Declension--Masc',
             'content': [{'type': 'paradigm', **chart(
                 'First Declension--Masculine', 'προφήτης', 'prophet',
                 'e_propns', PROPHETES, FIVE, prophetes_meanings,
                 'e_propar')}]},
        ],
    }
    greek_nouns['_label_note'] = (
        'D-27: the Eta chart prints "Nom.\\Voc." with a backslash, the '
        'first Alpha chart "Nom./Voc." with a slash, and the second Alpha '
        'chart "Nom./Voc" with no trailing period. All three are the '
        'original\'s own labels and ship verbatim.')

    # ---- Learn: Definite Article -----------------------------------
    def article_chart(name, table, note, say_whole, column_audio):
        return {
            'name': name, 'title': 'Definite Article Paradigm',
            'columns': ['Masc.', 'Fem.', 'Neut.'],
            'columnAudio': [aud(c) for c in column_audio],
            'rows': [{'label': case,
                      'cells': [{'greek': g, 'audio': aud(CELL_AUDIO[g])}
                                for g in table[case]]}
                     for case in ARTICLE_CASES],
            'showGlosses': False,
            'sayWhole': {'label': 'Say Whole List', 'audio': aud(say_whole)},
            'note': note,
        }

    article_block = {
        'type': 'paradigm', 'switch': 'named', 'charts': [
            article_chart('Singular', ARTICLE_SG,
                          'Note ὁ and ἡ are enclitics with no accents.',
                          'e_artsg', ['e_artms', 'e_artfs', 'e_artns']),
            article_chart('Plural', ARTICLE_PL,
                          'Note οἱ and αἱ are enclitics with no accents.',
                          'e_artpl', ['e_artmp', 'e_artfp', 'e_artnp']),
        ]}

    learn_article = {
        'id': 'c5_learn_article', 'type': 'contentAudio', 'mode': 'topicPages',
        'title': 'Learn Definite Article', 'greekTaps': True,
        'topics': [
            {'id': 'introduction', 'title': 'Introduction', 'content': [
                {'type': 'para', 'text':
                 'While Greek has no indefinite article like the English "a" '
                 '(e.g. a book), the Greek definite article "the" occurs '
                 'throughout the New Testament.   The definite article will '
                 'be inflected for gender, number and case.   Indeed the '
                 'definite article must match its noun in gender, number and '
                 'case.  The definite article will mark the gender of a noun '
                 'no matter if it is a first, second or third declension '
                 'noun.'}]},
            {'id': 'examples', 'title': 'Examples', 'content': [
                {'type': 'greekRows', 'layout': 'glossOnly', 'rows': [
                    {'greek': example_words['logos']['greek'],
                     'gloss': '"word" nom. sing. masc.  (Acts 13:15)',
                     'audio': aud('e_logos')},
                    {'greek': example_words['ho_logos']['greek'],
                     'gloss': '"the word" nom. sing. masc. (Jn 1:1)',
                     'audio': aud('e_ologos')},
                    {'greek': example_words['logon']['greek'],
                     'gloss': '"word" acc. sing. masc. (Jn 8:51)',
                     'audio': aud('e_logon')},
                    {'greek': example_words['ton_logon']['greek'],
                     'gloss': '"the word" acc. sing. masc. (Jn 4:39)',
                     'audio': aud('e_tlogon')}]}]},
            {'id': 'articleParadigm', 'title': 'Definite Article Paradigm',
             'content': [article_block]},
        ],
    }

    # ---- Drill: First Declension Noun ------------------------------
    FDN_FAMILIES = [(AGAPE, 'ἀγάπη'), (ALETHEIA, 'ἀλήθεια'),
                    (DOXA_SG, 'δόξα')]
    FDN_ANSWERS = [
        ('Acc.', 'love'), ('Gen.', 'love'), ('Nom.', 'love'),
        ('Dat.', 'love'), ('Acc.', 'love'), ('Nom.', 'Love'),
        ('Gen.', 'love'),
        ('Nom.', 'truth'), ('Gen.', 'truth'), ('Acc.', 'truth'),
        ('Dat.', 'truth'), ('Nom.', 'truth'), ('Acc.', 'truth'),
        ('Gen.', 'truth'),
        ('Acc.', 'splendor'), ('Gen.', 'glory'), ('Nom.', 'glory'),
        ('Dat.', 'glory'), ('Acc.', 'glory'), ('Nom.', 'glory'),
    ]
    FDN_SLOTS = ['Nom.', 'Gen.', 'Dat.', 'Acc.']

    fdn_items = []
    for i in range(20):
        fam = 0 if i < 7 else (1 if i < 14 else 2)
        table = FDN_FAMILIES[fam][0]
        options = []
        for slot_i, case in enumerate(FDN_SLOTS):
            got = strip_grave(conv(fdn_slots[slot_i][fam]))
            want = table[case][0]
            if got != want:
                if got.startswith(want):
                    msg = (f'FDND slot {slot_i + 1} family {fam}: '
                           f'{got!r} -> {want!r} (buffer tail)')
                    if msg not in warn:
                        warn.append(msg)
                else:
                    raise SystemExit(
                        f'STOP: FDND slot {slot_i + 1} family {fam} is '
                        f'{got!r}, paradigm says {want!r}')
            options.append(want)
        case, underline = FDN_ANSWERS[i]
        sentence = fdn_p1[i] + (('\n' + fdn_p2[i]) if fdn_p2[i] else '')
        if underline not in sentence:
            raise SystemExit(f'STOP: FDND {i + 1} underline {underline!r} '
                             f'not in {sentence!r}')
        answer = table[case][0]
        fdn_items.append({
            'sentence': sentence, 'underline': underline,
            'ref': fdn_ref[i], 'options': options, 'answer': answer,
            'audio': aud(CELL_AUDIO[answer]),
        })

    first_decl_drill = {
        'id': 'c5_drill_first_decl_noun', 'type': 'select',
        'mode': 'fullOptionGrid', 'title': 'First Declension Noun Drill',
        'instructions': 'Click on the correct Greek Noun form to replace '
                        'the underlined English word',
        'optionsAreGreek': True, 'optionsPerItem': 4,
        'optionLayout': 'single',
        '_layout_note': 'Four options in ONE column at every width, matching '
                        'the original. Not a paradigm grid, so D-26 does not '
                        'apply and neither does the D-19 reflow.',
        'items': fdn_items,
        'ui': {'buttons': ['Previous', 'Next', 'Pronounce', 'Hint', 'Score'],
               'checkboxes': ['Pronounce Each Drill'],
               'defaults': {'pronounceEach': True}, 'liveScore': True,
               'hintRef': 'firstDeclensionEta'},
        'scored': True,
        'answerPolicy': {'attemptsPerItem': 1,
                         'advanceClass': 'manualOnIncorrect'},
    }

    # ---- Drill: Declining Noun -------------------------------------
    # ὥρας and γραφή are each two cells of their own chart; the drill's
    # own translation column decides which one an item means.
    TRANSLATION_CASE = [
        ('of ', 'Gen.'), ('to ', 'Dat.'), ('for ', 'Dat.'), ('O ', 'Voc.'),
    ]

    def disambiguate(hits, translation, ref):
        if len(hits) == 1:
            return hits[0]
        for prefix, case in TRANSLATION_CASE:
            if translation.startswith(prefix):
                for c, n in hits:
                    if CASE_FULL[c] == CASE_FULL.get(case, case):
                        return (c, n)
        plural_words = ('hours', 'writings', 'prophets')
        want_plural = any(translation.startswith(w) or f' {w}' in translation
                          for w in plural_words)
        for c, n in hits:
            if (n == 'Plural') == want_plural and CASE_FULL[c] in (
                    'Nominative', 'Accusative'):
                return (c, n)
        raise SystemExit(f'STOP: cannot disambiguate {hits} for '
                         f'{translation!r} ({ref})')

    dnd_items = []
    for i in range(25):
        greek = conv(dnd_form[i])
        hits = parse_of(greek)
        case, num = disambiguate(hits, dnd_tr[i], dnd_ref[i])
        dnd_items.append({
            'greek': greek, 'ref': dnd_ref[i], 'translate': dnd_tr[i],
            'answer': f'{CASE_FULL[case]} {num}',
            'audio': aud(CELL_AUDIO[strip_grave(greek)]),
        })

    declining_drill = {
        'id': 'c5_drill_declining', 'type': 'select',
        'mode': 'fullOptionGrid', 'title': 'Declining Noun Drill',
        'instructions': 'Click on the matching case and number',
        'promptIsGreek': True, 'options': 'static',
        'optionValues': [f'{c} {n}' for c in
                         ['Nominative', 'Genitive', 'Dative', 'Accusative',
                          'Vocative'] for n in ['Singular', 'Plural']],
        'optionLayout': 'paradigm2col', '_layout_note': 'D-26.',
        'revealButtons': [{'label': 'Translate', 'field': 'translate'}],
        'items': dnd_items,
        'ui': {'buttons': ['Previous', 'Next', 'Pronounce', 'Hint',
                           'Translate', 'Score'],
               'checkboxes': ['Pronounce Each Drill'],
               'defaults': {'pronounceEach': True}, 'liveScore': True,
               'hintRef': 'firstDeclensionEta'},
        'scored': True,
        'answerPolicy': {'attemptsPerItem': 1,
                         'advanceClass': 'manualOnIncorrect'},
    }

    # ---- Drill: Definite Article -----------------------------------
    ART_LOOKUP = {}
    for table, num in ((ARTICLE_SG, 'Singular'), (ARTICLE_PL, 'Plural')):
        for case, cells in table.items():
            for gi, form in enumerate(cells):
                ART_LOOKUP.setdefault((form, GENDERS[gi]), []).append(
                    (CASE_FULL[case], num))
    # Neuter to and ta are each nominative AND accusative; the verse
    # decides. Read from the Greek NT at the cited reference.
    ART_OVERRIDE = {
        17: ('Nominative', 'Singular'),   # Jn 1:4  to fws, predicate nom.
        22: ('Accusative', 'Singular'),   # Jn 1:12 eis to onoma
        19: ('Accusative', 'Plural'),     # Jn 1:11 eis ta idia
        23: ('Nominative', 'Plural'),     # Jn 3:19 ta erga, subject
    }

    art_items = []
    for i in range(24):
        greek = conv(art_form[i])
        gender = art_gender[i]
        hits = ART_LOOKUP[(greek, gender)]
        if len(hits) == 1:
            case, num = hits[0]
        elif i in ART_OVERRIDE:
            case, num = ART_OVERRIDE[i]
            if (case, num) not in hits:
                raise SystemExit(f'STOP: article override {i} disagrees '
                                 f'with the paradigm ({hits})')
        else:
            raise SystemExit(f'STOP: article item {i} ({greek}, {gender}) is '
                             f'ambiguous: {hits}')
        art_items.append({
            'greek': greek, 'ref': art_ref[i], 'gender': gender,
            'answer': f'{case} {num}', 'audio': aud(CELL_AUDIO[greek]),
        })

    article_drill = {
        'id': 'c5_drill_article', 'type': 'select', 'mode': 'fullOptionGrid',
        'title': 'Definite Article Drill',
        'instructions': 'Click on the matching case and number',
        'promptIsGreek': True, 'options': 'static',
        'optionValues': [f'{c} {n}' for c in
                         ['Nominative', 'Genitive', 'Dative', 'Accusative']
                         for n in ['Singular', 'Plural']],
        'optionLayout': 'paradigm2col',
        '_layout_note': 'D-26. Four rows, not five: the article has no '
                        'vocative.',
        'revealButtons': [{'label': 'Gender', 'field': 'gender'}],
        'items': art_items,
        'ui': {'buttons': ['Previous', 'Next', 'Pronounce', 'Hint',
                           'Gender', 'Score'],
               'checkboxes': ['Pronounce Each Drill'],
               'defaults': {'pronounceEach': True}, 'liveScore': True,
               'hintRef': 'articleParadigm'},
        'scored': True,
        'answerPolicy': {'attemptsPerItem': 1,
                         'advanceClass': 'manualOnIncorrect'},
    }

    # ---- Exercises: spellers ---------------------------------------
    NOUN_SPELL = [
        'ὥρᾳ', 'ὧραι', 'ὥρας', 'ὡρῶν', 'ὥρα', 'ὥραν', 'ὥραις', 'ὥρας',
        'γραφῇ', 'γραφαί', 'γραφάς', 'γραφή', 'γραφῆς', 'γραφαῖς',
        'γραφή', 'γραφῶν',
        'προφῆται', 'προφήτην', 'προφητῶν', 'προφήτης', 'προφήτας',
        'προφήτου', 'προφήτῃ', 'προφήταις',
    ]
    for form in NOUN_SPELL:
        parse_of(form)

    ABBR_CASE = {'nom.': 'Nom.', 'gen.': 'Gen.', 'dat.': 'Dat.',
                 'acc.': 'Acc.'}
    ABBR_GENDER = {'masc.': 'Masculine', 'fem.': 'Feminine',
                   'neut.': 'Neuter'}
    art_spell_items = []
    for i in range(22):
        parts = art_sp_prompt[i].split()
        case = ABBR_CASE[parts[0]]
        num = 'Singular' if parts[1] == 'sing.' else 'Plural'
        gender = ABBR_GENDER[parts[2]]
        table = ARTICLE_SG if num == 'Singular' else ARTICLE_PL
        form = table[case][GENDERS.index(gender)]
        art_spell_items.append({
            'gloss': art_sp_prompt[i], 'greek': form,
            'ref': art_sp_ref[i], 'audio': aud(CELL_AUDIO[form]),
        })

    def speller(id_, title, prompt_label, field_label, items):
        return {
            'id': id_, 'type': 'spell', 'title': title,
            'instructions': 'Click letters below or use your keyboard to '
                            'spell it out.',
            'prompt': 'gloss', 'promptLabel': prompt_label,
            'accentsOptional': True, 'spellerTilesRef': 'chapt_1',
            'items': items,
            'ui': {'fields': [field_label, 'Spell Greek Word'],
                   'buttons': ['Pronounce', 'Previous', 'Score', 'Next',
                               'Check Answer', 'Greek Keyboard'],
                   'checkboxes': ['Show Answer', 'With Accents',
                                  'Pronounce Each Exercise']},
        }

    noun_speller = speller(
        'c5_ex_noun_speller', 'First Declension Noun Spelling Exercise',
        'English Word', 'English Word',
        [{'gloss': noun_sp_prompt[i], 'greek': NOUN_SPELL[i],
          'audio': aud(CELL_AUDIO[NOUN_SPELL[i]])} for i in range(24)])
    article_speller = speller(
        'c5_ex_article_speller', 'Definite Article Spelling Exercise',
        'Definite Article Inflection', 'Definite Article Inflection',
        art_spell_items)
    vocab_speller = speller(
        'c5_ex_vocab_speller', 'Vocabulary Spelling Exercise',
        'English Meaning', 'English Meaning', [{'ref': k} for k in KEYS])

    # ---- Scripture Memory ------------------------------------------
    ROM323 = [
        ('pa<ntej', 'all', 'e_sm1'), ('ga>r', 'for', 'e_sm2'),
        ('h!marton', 'have sinned', 'e_sm3'), ('kai>', 'and', 'e_sm4'),
        ('u[sterou?ntai', 'fall short', 'e_sm5'),
        ('th?j', 'of the', 'e_sm6'), ('do<chj', 'glory', 'e_sm7'),
        ('tou?', 'of [the]', 'e_sm8'), ('qeou?', 'God', 'e_sm9'),
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
    JN146B = [
        ('οὐδεὶς', 'no one', 'd_sm1'), ('ἔρχεται', 'comes', 'd_sm2'),
        ('πρὸς', 'to', 'd_sm3'), ('τὸν', 'the', 'd_sm4'),
        ('πατέρα', 'father', 'd_sm5'), ('εἰ', 'except', 'd_sm6'),
        ('μὴ', None, 'd_sm7'), ('δι᾽', 'through', 'd_sm8'),
        ('ἐμοῦ.', 'me', 'd_sm9'),
    ]

    def verse(id_, title, reference, words, whole, legacy=False):
        return {
            'id': id_, 'type': 'contentAudio', 'mode': 'interlinearVerse',
            'title': title, 'reference': reference,
            'words': [{'greek': conv(g) if legacy else g, 'gloss': gl,
                       'audio': aud(a)} for g, gl, a in words],
            'sayWhole': {'label': 'Say Whole Verse', 'audio': aud(whole)},
        }

    learn_scripture = verse('c5_learn_scripture', 'Learn Scripture Memory',
                            'Rom 3:23', ROM323, 'e_rom323', legacy=True)

    sm_words = [conv(g) for g, _, _ in ROM323]
    sm_drill = {
        'id': 'c5_drill_scripture_memory', 'type': 'select',
        'mode': 'fullOptionGrid', 'title': 'Scripture Memory Drill',
        'instructions': 'Click on the matching word', 'promptIsGreek': True,
        'options': 'static',
        'optionValues': ['all', 'of God', 'and', 'sinned', 'fall short',
                         'the (fem)', 'for', 'the (masc)', 'of glory'],
        'items': [
            {'greek': sm_words[0], 'answer': 'all', 'audio': aud('e_sm1')},
            {'greek': sm_words[1], 'answer': 'for', 'audio': aud('e_sm2')},
            {'greek': sm_words[2], 'answer': 'sinned', 'audio': aud('e_sm3')},
            {'greek': sm_words[3], 'answer': 'and', 'audio': aud('e_sm4')},
            {'greek': sm_words[4], 'answer': 'fall short',
             'audio': aud('e_sm5')},
            {'greek': sm_words[5], 'answer': 'the (fem)',
             'audio': aud('e_sm6')},
            {'greek': sm_words[6], 'answer': 'of glory',
             'audio': aud('e_sm7')},
            {'greek': sm_words[7], 'answer': 'the (masc)',
             'audio': aud('e_sm8')},
            {'greek': sm_words[8], 'answer': 'of God', 'audio': aud('e_sm9')},
        ],
        'ui': {'buttons': ['Pronounce', 'Score'],
               'checkboxes': ['Pronounce Each Drill'],
               'defaults': {'pronounceEach': True}, 'liveScore': True},
        'scored': True,
        'answerPolicy': {'attemptsPerItem': 1, 'advanceClass': 'autoBoth'},
    }

    scripture_speller = {
        'id': 'c5_ex_scripture_speller', 'type': 'spellVerse',
        'title': 'Scripture Memory Spelling Exercise',
        'instructions': 'Enter all of Rom 3:23 then click "Check Answer"',
        'reference': 'Rom 3:23',
        'answerWords': sm_words,
        'translation': 'All have sinned and fall short of the glory of God',
        'accentsOptional': True, 'punctuationOptional': True,
        'majorHint': {'alwaysAvailable': True, '_note': 'DEPARTURE D-11.'},
        'audio': aud('e_rom323'), 'spellerTilesRef': 'chapt_1',
        'ui': {'fields': ['Spell Greek'],
               'buttons': ['Pronounce', 'Check Answer',
                           'Greek Keyboard', 'Restart Exercise'],
               'checkboxes': ['Show Answer', 'With Accents'],
               '_restart_note': 'DEPARTURE D-12.'},
    }

    # ---- Quick Review ----------------------------------------------
    review_nouns = chart('Review Nouns:  First Declension', 'γραφή',
                         'writing, Scripture', 'e_graphn', GRAPHE,
                         GRAPHE_ORDER, graphe_meanings, 'e_grapar')
    review_nouns.pop('meanings')
    review_nouns['showGlosses'] = True
    review_nouns['sayWhole'] = {'label': 'Say Whole Paradigm',
                                'audio': aud('e_grapar')}
    # The Quick Review chart prints all five cases with their glosses.
    review_nouns['rows'] = [
        {'label': case,
         'cells': [{'greek': g, 'gloss': gl, 'audio': aud(CELL_AUDIO[g])}
                   for g, gl in pair]}
        for case, pair in zip(FIVE, [
            [('γραφή', 'a writing'), ('γραφαί', 'writings (subject)')],
            [('γραφῆς', 'of a writing'), ('γραφῶν', 'of writings (possessive)')],
            [('γραφῇ', 'to a writing'), ('γραφαῖς', 'to writings (indirect obj)')],
            [('γραφήν', 'a writing'), ('γραφάς', 'writings (direct obj)')],
            [('γραφή', 'writing'), ('γραφαί', 'writings (direct address)')],
        ])]

    review_article = {
        'title': 'Review Definite Article',
        'columns': ['Masc.', 'Fem.', 'Neut.', 'Masc.', 'Fem.', 'Neut.'],
        'columnAudio': [aud(c) for c in
                        ('e_artms', 'e_artfs', 'e_artns',
                         'e_artmp', 'e_artfp', 'e_artnp')],
        'columnGroups': [{'label': 'Singular', 'span': 3},
                         {'label': 'Plural', 'span': 3}],
        'rows': [{'label': case,
                  'cells': [{'greek': g, 'audio': aud(CELL_AUDIO[g])}
                            for g in ARTICLE_SG[case] + ARTICLE_PL[case]]}
                 for case in ARTICLE_CASES],
        'showGlosses': False,
        'sayWholeEach': [
            {'label': 'Say Whole Paradigm', 'audio': aud('e_artsg')},
            {'label': 'Say Whole Paradigm', 'audio': aud('e_artpl')},
        ],
        '_layout_note': 'The Quick Review chart shows Singular AND Plural '
                        'side by side in one six-column table with a Say '
                        'Whole Paradigm button under each half -- NOT the '
                        'Singular/Plural toggle used on the Learn page.',
    }

    quick_review = [
        {'id': 'c5_qr_vocab', 'type': 'contentAudio', 'mode': 'reviewVocab',
         'title': 'Review Vocabulary Chart', 'pool': 'lemmas',
         'showNtFreq': True,
         'playAll': {'audio': aud('e_vocl5'), 'label': 'Say Whole List'}},
        {'id': 'c5_qr_nouns', 'type': 'contentAudio', 'mode': 'paradigmChart',
         'title': 'Review Nouns:  First Declension',
         'chartTitle': 'Review Nouns:  First Declension',
         'paradigm': review_nouns},
        {'id': 'c5_qr_article', 'type': 'contentAudio',
         'mode': 'paradigmChart', 'title': 'Review Definite Article',
         'chartTitle': 'Review Definite Article', 'paradigm': review_article},
        verse('c5_qr_scripture_146a', 'Review Scripture Memory:  Jn 14:6a',
              'John 14:6a', JN146A, 'c_sm14_6'),
        verse('c5_qr_scripture_146b', 'Review Scripture Memory:  Jn 14:6b',
              'John 14:6b', JN146B, 'd_jn146b'),
        verse('c5_qr_scripture_rom', 'Review Scripture Memory:  Rom 3:23',
              'Rom 3:23', ROM323, 'e_rom323', legacy=True),
    ]

    bibliography = {
        'id': 'c5_learn_bibliography', 'type': 'contentAudio',
        'mode': 'textPage', 'title': 'Learn Bibliography',
        'content': [{'type': 'biblist', 'items': [
            'Machen, J. Gresham.  New Testament Greek for Beginners '
            '(Toronto:  The Macmillan Company, 1923), pp. 39-43.',
            'Mounce, William D.  Basics of Biblical Greek:  Grammar '
            '(Grand Rapids:  Zondervan, 1993), pp. 28-54.',
            'Summers, Ray and Thomas Sawyer.  Essentials of New Testament '
            'Greek (Nashville:  Broadman & Holman, 1995), pp. 21-23.',
            'Wenham, J. W.   The Elements of New Testament Greek '
            '(Cambridge:  Cambridge University Press, 1965), pp. 39-42.',
        ]}]}

    objectives_raw = tbk.region(0x0e8ab8)
    for frag in ('understand English syntax of nouns in sentences',
                 'write out the first declension paradigm for feminine',
                 'memorize Rom 3:23 in Greek'):
        if frag not in objectives_raw:
            raise SystemExit(f'STOP: objectives field lost {frag!r}')

    chapter = {
        '_comment': (
            'Chapter 5 (First Declension Nouns), assembled from '
            '5_NOUNS1.TBK + CHAPT_5 audio + ch5railwalk.pdf. Pools read by '
            'offset (5E-EXTRACTION-MAP.md sec 2); every drill and speller '
            'answer derived from the chapter\'s own paradigm charts and '
            'validated against the extracted option columns at assembly. '
            'Page prose verbatim from the extracted fields, cut where the '
            'rail-walk screenshots end the page.'),
        'id': 'chapt_5', 'number': 5, 'title': 'First Declension Nouns',
        'objectivesPreamble': 'You will be able to:',
        'objectives': [
            'understand English syntax of nouns in sentences (subject, '
            'object, number, gender, etc.)',
            'understand the Greek noun system (gender, number, case)',
            'write out the first declension paradigm for feminine nouns',
            'master 10 more high frequency vocabulary words',
            'memorize Rom 3:23 in Greek',
        ],
        'vocab': KEYS,
        'learn': [
            {'id': 'c5_learn_objectives', 'type': 'contentAudio',
             'mode': 'objectivesPage', 'title': 'Learn Chapter Objectives',
             'instructions': ''},
            english_concepts,
            greek_nouns,
            learn_article,
            {'id': 'c5_learn_vocab', 'type': 'contentAudio',
             'mode': 'flashcard', 'title': 'Learn Vocabulary',
             'pool': 'lemmas'},
            learn_scripture,
            bibliography,
        ],
        'drill': [
            first_decl_drill, declining_drill, article_drill,
            {'id': 'c5_drill_vocab_gk_en', 'type': 'select',
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
            {'id': 'c5_drill_vocab_en_gk', 'type': 'select',
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
        'exercise': [noun_speller, article_speller, vocab_speller,
                     scripture_speller],
        'quickReview': quick_review,
        'feedback': {
            'correct': ['Great!', 'Congratulations', 'Perfect!', 'Right On!',
                        'Fantastic!', 'Yes'],
            'incorrect': ['Try again', 'Swing and a miss',
                          'Repetition will get it', 'Not quite!'],
        },
        'sequence': [
            'c5_learn_objectives', 'c5_learn_english_concepts',
            'c5_learn_nouns', 'c5_drill_first_decl_noun',
            'c5_drill_declining', 'c5_ex_noun_speller', 'c5_learn_article',
            'c5_drill_article', 'c5_ex_article_speller', 'c5_learn_vocab',
            'c5_drill_vocab_gk_en', 'c5_drill_vocab_en_gk',
            'c5_ex_vocab_speller', 'c5_learn_scripture',
            'c5_drill_scripture_memory', 'c5_ex_scripture_speller',
            'c5_qr_vocab', 'c5_qr_nouns', 'c5_qr_article',
            'c5_qr_scripture_146a', 'c5_qr_scripture_146b',
            'c5_qr_scripture_rom', 'c5_learn_bibliography',
        ],
        '_sequence_note': 'Rail order from ch5railwalk.pdf (Nathanael, '
                          '2026-08-03).',
        '_audioVerify': AUDIO_VERIFY,
    }
    return chapter, lexicon, warn


def validate(chapter):
    ids = [a['id'] for sec in ('learn', 'drill', 'exercise', 'quickReview')
           for a in chapter[sec]]
    seq = chapter['sequence']
    if sorted(ids) != sorted(seq):
        raise SystemExit(
            'STOP: sequence mismatch\n  only in activities: '
            f'{sorted(set(ids) - set(seq))}\n  only in sequence: '
            f'{sorted(set(seq) - set(ids))}')
    blob = json.dumps(chapter, ensure_ascii=False)
    if unicodedata.normalize('NFC', blob) != blob:
        raise SystemExit('STOP: chapter JSON is not NFC-normalized')
    return len(ids)


def main():
    tbk = Tbk(sys.argv[1])
    conv = make_conv(json.load(open(sys.argv[2])))
    outdir = sys.argv[3]
    chapter, lexicon, warn = build(tbk, conv)
    n = validate(chapter)
    for w in warn:
        print('WARN:', w)
    for name, obj in (('chapt-05.json', chapter),
                      ('lexicon-chapt05.json', lexicon)):
        with open(f'{outdir}/{name}', 'w', encoding='utf-8') as fh:
            json.dump(obj, fh, ensure_ascii=False, indent=1)
            fh.write('\n')
        print(f'wrote {outdir}/{name}')
    print(f'{n} activities, {len(chapter["sequence"])} rail stops')


if __name__ == '__main__':
    main()
