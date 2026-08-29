#!/usr/bin/env python3
# STAGE 8.7 PROVENANCE NOTICE (2026-08-29): this assembler refuses to
# overwrite an existing chapt-13.json unless ALLOW_REGRESSIVE_REBUILD=1 after
# a full back-port of any hand repairs (PIPELINE-INSIGHTS 8.7). post_patches()
# re-applies ratified divergences so a regeneration cannot resurrect a
# pre-fix value.
"""assemble_ch13.py -- chapter 13 (Third Declension Nouns) from 13_3DECL.TBK.
Cohort 5I, the first VOLUME cohort.

  assemble_ch13.py TBK font-map.json chapt-12.json wavlist_13.txt outdir

chapt-12.json supplies the five carried Quick Review verses, re-keyed to
the CHAPT_13 copies (Rom 6:23a/b, Mat 6:33a/b, Mat 6:9).

Chapter-specific wiring facts, all TBK-read:
  * Third Declension Declining Drill: 30 items (TotalNumberOfWords at
    0x55281). Case/number keys read from the AnalyzeAnswer script at
    0x55340-0x56800; items 3/11/16/28 carry the original's own accepted
    ALTERNATES (nom/acc ambiguity of pisteis, onoma, onomata).
    Clips are the paradigm CELL clips, read from the SayWord table at
    0x54931. FOUR Hint buttons (Hint1-4) -> D-46 form-dependent hint,
    dispatched by the prompt's lemma family, cross-checked against the
    clip prefix the dispatch table itself names.
  * pas Declining Drill (NEW SHAPE for this chapter): 16 items
    (TotalNumberOfWords at 0x5e10f), gender THEN case/number, keys at
    0x5e10f-0x5f500 including every accepted gender x case combination.
    Its Translate pool holds only FIFTEEN entries for sixteen items --
    the sixteenth is ABSENT in the original (see PAS_TRANSLATE_NOTE).
  * Third Declension Translation Drill: 19 items (0xf49d7), three
    English columns, clips m_td1-19. Hints are form-dependent
    (Hintsar / Hintxar / Hintono / Hintpis, four charts at
    0x74faa-0x77b70) -> D-46.
  * Scripture Memory Drill: FIVE items dispatching to VERSE-POSITION
    clips m_sm1/3/4/5/7 (table at 0x105a6d) -- not sequential ids.
  * Review Vocabulary Chart: the original PAGES it (five rows, More,
    five rows, Back) with TWO half-list recordings, vocl13a / vocl13b,
    behind one "Say List" button keyed on a FirstHalf flag
    (0xfc4c6). C9 forbids a pager on a Review page, so the port merges
    to one ten-row chart; the say-all carries BOTH clips (see
    SAY_LIST_NOTE -- OPEN, awaiting Nathanael's ruling).
  * UNREFERENCED clips in the CHAPT_13 pack (D-39 class): m_vocl (the
    whole-list recording -- declared as an alias at 0x10294, played by
    nothing), m_ad5 (an orphan of chapter 12's l_ad augment family),
    msargs (missing underscore, a duplicate of m_sargs), m_onoss.
"""
import json
import os
import re
import struct
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import underline
from assemble_ch9 import (Tbk, para_blocks, dash, sq, stepper_ui, score_ui,
                          audit)
from assemble_ch11 import make_conv11, nfc, bare, dispatch

A = 'chapt_13_'

# chapter-13 teaching prose fields, for the chapter-wide Greek-format vote
TEACH_OFFSETS = [0x6207c, 0x63e78, 0x630a4, 0x6484c, 0x21806, 0x3020c,
                 0x24ace, 0x26f98, 0x2870e, 0x2579e, 0x2ac74]

SAY_LIST_NOTE = (
    'RULED 2026-08-29 (Nathanael): DO NOT PAGE. The chart shows all ten rows '
    'in one flowing scroll (C9 / 4.6) with the two half-list recordings kept '
    'as they are -- the first five rows, then a Say List button playing '
    'm_vocla, then the next five rows, then a Say List button playing '
    'm_voclb. This is the first chart app-wide to carry MORE THAN ONE '
    'say-all (chapters 1-12 all ship a single playAll id), so playAllGroups '
    'is a NEW renderer contract: an ordered list of {afterRow, label, audio} '
    'drawn between the rows. The original pages the halves behind '
    'More/Back with one button keyed on a FirstHalf flag (page script '
    '0xfc4c6); the port keeps both recordings and drops the pager. '
    'NIT-LOG N-5 records this for the final audio split/merge pass.')

PAS_TRANSLATE_NOTE = (
    'The Translate pool at 0x11a548 is byte-exactly FIFTEEN entries (outer '
    'length 160; the region beyond it is the Declining Drill pool\'s stale '
    'tail) while the page declares SIXTEEN items and keys all sixteen. '
    'RESOLVED 2026-08-29 by Nathanael\'s DOSBox pass: the Translate button '
    'is NOT disabled on item 16 and shows "every" -- the pool\'s LAST LINE, '
    'which therefore serves both item 15 (pasai) and item 16 (pasan). '
    'Emitted that way rather than left empty; no renderer rule is needed for '
    'a missing translate.')


def aud(name):
    return A + name


def need(tbk, *clips):
    for c in clips:
        if not tbk.has_clip(c):
            raise SystemExit(f'STOP: {c} not referenced in TBK')


# ------------------------------------------------------- FIELD RECORD LAYOUT
# A ToolBook field record carries TWO u16 length words in a row:
#
#     [buffer size:u16][text length:u16][text][stale tail out to buffer size]
#
# PIPELINE-INSIGHTS Stage 4's rule -- read the u16 IMMEDIATELY BEFORE the
# text -- is correct and always has been: it lands on the TEXT LENGTH word.
# Chapters 1-12 read it correctly; sampling the 66 offsets their assemblers
# use found not one instance of the problem below.
#
# The catch is offset SELECTION, not framing. tbk_fields.scan() locates a
# field by testing whether the u16 at off-2 yields a plausible read, and
# prefers the LONGEST non-overlapping candidate. The buffer-size word also
# passes that test and is longer, so scan() reports the record two bytes
# EARLY -- and a read from there returns the whole buffer, stale tail and
# all. Every "stale tail" in this chapter's extraction came from that.
#
# The offsets in this file are scan()'s, so tfield() compensates: read the
# next u16 as the real length when it fits inside the buffer. This is exactly
# equivalent to reading at off+2 with the standard reader, and the guard (a
# never-rewritten field has no second word) makes it safe either way -- six
# of this chapter's nineteen fields fall back to the plain read correctly.
# Recorded in PIPELINE-INSIGHTS Stage 4 so the next chapter does not
# re-derive it.
#
# NOT every stale tail has a length to recover: assemble_ch12's
# re.sub(r'\s+Pe<troj.*$') on the vocabulary Greek pool is legitimate,
# because that field has no usable length word at either offset.


def tfield(tbk, off):
    """Field text: the real length word, whichever of the two it is."""
    outer = struct.unpack_from('<H', tbk.data, off - 2)[0]
    if not (2 < outer < 20000):
        raise SystemExit(f'STOP: no length prefix at {off:#x} ({outer})')
    inner = struct.unpack_from('<H', tbk.data, off)[0]
    if 0 < inner <= outer - 2:
        return tbk.data[off + 2:off + 2 + inner].decode('latin-1'), True
    return tbk.data[off:off + outer].decode('latin-1'), False


def tpool(tbk, off, n, label, allow_blank=False):
    raw, trimmed = tfield(tbk, off)
    lines = [l.strip() for l in raw.split('\r\n')]
    if allow_blank:
        while lines and not lines[0]:
            lines = lines[1:]
    else:
        lines = [l for l in lines if l]
    if len(lines) < n:
        raise SystemExit(f'STOP: pool {label} at {off:#x}: expected {n}, '
                         f'got {len(lines)} (second length word '
                         f'{"used" if trimmed else "absent"})')
    return lines[:n]


# Format id 1744 is this file's GREEK run format (it carries pa?j, pa?sa,
# pa?n on the Learn Introduction and the labial/velar/dental rows on
# Transformations). Two accentless Greek runs -- the genitive ending `oj`
# on the two Introduction screens -- carry no diacritic code, so the token
# heuristic cannot see them and the run boundaries in this file sit one byte
# off the field text. They are substituted explicitly, asserted first, and
# both are confirmed on ch13railwalk.pdf p3 and p5 as Greek sigma-final.
GREEK_NOTATION = [('the oj off of the genitive', 'the ος off of the genitive'),
                  ('the oj ending off of the genitive',
                   'the ος ending off of the genitive')]


def greekize(text):
    for legacy, greek in GREEK_NOTATION:
        if legacy in text:
            text = text.replace(legacy, greek)
    return text


# ---------------------------------------------------------------- paradigms
# Each entry: key -> (title, lemma line, gloss, clip stem, forms)
# forms = [[nom sg, nom pl], [gen ...], [dat ...], [acc ...]]
NOUNS = {
    'kappa': ('Kappa Final Stems', 'σάρξ, σαρκός, ἡ', 'flesh', 'sar',
              [['σάρξ', 'σάρκες'], ['σαρκός', 'σαρκῶν'],
               ['σαρκί', 'σαρξί(ν)'], ['σάρκα', 'σάρκας']],
              ['sa<rc', 'sa<rkej', 'sarko<j', 'sarkw?n', 'sarki<',
               'sarci< (n)', 'sa<rka', 'sa<rkaj']),
    'tauDelta': ('Tau/Delta Final Stems', 'χάρις, χάριτος, ἡ', 'grace', 'xar',
                 [['χάρις', 'χάριτες'], ['χάριτος', 'χαρίτων'],
                  ['χάριτι', 'χάρισι(ν)'], ['χάριν', 'χάριτας']],
                 ['xa<rij', 'xa<ritej', 'xa<ritoj', 'xari<twn', 'xa<riti',
                  'xa<risi (n)', 'xa<rin', 'xa<ritaj']),
    'iota': ('Iota Final Stems', 'πίστις, πίστεως, ἡ', 'faith', 'pis',
             [['πίστις', 'πίστεις'], ['πίστεως', 'πίστεων'],
              ['πίστει', 'πίστεσι(ν)'], ['πίστιν', 'πίστεις']],
             ['pi<stij', 'pi<steij', 'pi<stewj', 'pi<stewn', 'pi<stei',
              'pi<stesi (n)', 'pi<stin', 'pi<steij']),
    'mat': ('ματ Final Stems', 'ὄνομα, ὀνόματος, τό', 'name', 'ono',
            [['ὄνομα', 'ὀνόματα'], ['ὀνόματος', 'ὀνομάτων'],
             ['ὀνόματι', 'ὀνόμασι(ν)'], ['ὄνομα', 'ὀνόματα']],
            ['o@noma', 'o]no<mata', 'o]no<matoj', 'o]noma<twn', 'o]no<mati',
             'o]no<masi (n)', 'o@noma', 'o]no<mata']),
}
CASE_ROWS = ['Nom.', 'Gen.', 'Dat.', 'Acc.']
CELL_SUFFIX = [['ns', 'np'], ['gs', 'gp'], ['ds', 'dp'], ['as', 'ap']]

PAS_FORMS = [
    ['πᾶς', 'πᾶσα', 'πᾶν', 'πάντες', 'πᾶσαι', 'πάντα'],
    ['παντός', 'πάσης', 'παντός', 'πάντων', 'πασῶν', 'πάντων'],
    ['παντί', 'πάσῃ', 'παντί', 'πᾶσι(ν)', 'πάσαις', 'πᾶσι(ν)'],
    ['πάντα', 'πᾶσαν', 'πᾶν', 'πάντας', 'πάσας', 'πάντα'],
]
PAS_LEG = ['pa?j', 'pa?sa', 'pa?n', 'pa<ntej', 'pa?sai', 'pa<nta',
           'panto<j', 'pa<shj', 'pa<ntwn', 'pasw?n',
           'panti<', 'pa<s^', 'pa?si(n)', 'pa<saij',
           'pa?san', 'pa<ntaj', 'pa<saj']
PAS_COL = ['m', 'f', 'n', 'm', 'f', 'n']
PAS_NUM = ['s', 's', 's', 'p', 'p', 'p']


# The two Tau/Delta HINT screens (and only those) misprint the genitive
# plural as xari<tw?n -- an acute AND a circumflex on the same syllable, an
# impossible accentuation. The chapter's own Learn chart (0x26f98) and Quick
# Review chart (0x45276) both print xari<twn. Likewise the pas HINT screen
# alone prints pa?saij for the feminine dative plural where the Learn and
# Review charts print pa<saij. Both are ORIGINAL TYPOS, corrected here on the
# ch12 D-55 precedent ("one the one hand"), recorded per chart and carried to
# VERIFY. DISCLOSURE 4.7 governs STRUCTURE -- row sets are never merged or
# collapsed -- not the propagation of a misaccented cell.
CHART_TYPOS = {'xari<twn': 'xari<tw?n', 'pa<saij': 'pa?saij'}


def _find_legacy(raw, leg):
    """Present as printed, or as the known original typo. Returns the typo
    spelling when that is what the screen carries, else None."""
    flat = raw.replace(' ', '')
    if leg in raw or leg.replace(' ', '') in flat:
        return None
    typo = CHART_TYPOS.get(leg)
    if typo and (typo in raw or typo.replace(' ', '') in flat):
        return typo
    raise SystemExit(f'STOP: {leg!r} not in chart at ...')


def noun_chart(tbk, conv, off, key, cid, say=True, title=None):
    """One four-by-two third-declension chart, verified against `off`."""
    name, lemma, gloss, stem, forms, legacy = NOUNS[key]
    raw = tfield(tbk, off)[0]
    typos = []
    for leg in legacy:
        t = _find_legacy(raw, leg)
        if t:
            typos.append((t, leg))
    rows = []
    for r, label in enumerate(CASE_ROWS):
        cells = []
        for c in range(2):
            clip = f'm_{stem}{CELL_SUFFIX[r][c]}'
            need(tbk, clip)
            cells.append({'greek': forms[r][c], 'audio': aud(clip)})
        rows.append({'label': label, 'cells': cells})
    need(tbk, f'm_{stem}')
    blk = {'type': 'paradigm', 'id': cid, 'title': title or name,
           'lemma': {'greek': lemma, 'gloss': gloss, 'audio': aud(f'm_{stem}')},
           'columns': ['Singular', 'Plural'], 'rows': rows,
           'showGlosses': False}
    if say:
        need(tbk, f'm_{stem}par')
        blk['sayWhole'] = {'label': 'Say Paradigm', 'audio': aud(f'm_{stem}par')}
    if typos:
        blk['_verify_note'] = (
            f'This screen ({off:#x}) misprints '
            + '; '.join(f'{t} where the chapter\'s Learn and Review charts '
                        f'print {c}' for t, c in typos)
            + '. Shipped CORRECTED on the D-55 precedent; VERIFY.')
    return blk


def pas_chart(tbk, conv, off, cid, title='πᾶς  (all) Forms', say=True):
    raw = tfield(tbk, off)[0]
    typos = []
    for leg in PAS_LEG:
        t = _find_legacy(raw, leg)
        if t:
            typos.append((t, leg))
    rows = []
    for r, label in enumerate(CASE_ROWS):
        cells = []
        for c in range(6):
            clip = f'm_pas{PAS_COL[c]}{CELL_SUFFIX[r][0][0]}{PAS_NUM[c]}'
            need(tbk, clip)
            cells.append({'greek': PAS_FORMS[r][c], 'audio': aud(clip)})
        rows.append({'label': label, 'cells': cells})
    blk = {'type': 'paradigm', 'id': cid, 'title': title,
           'columns': ['Masculine', 'Feminine', 'Neuter',
                       'Masculine', 'Feminine', 'Neuter'],
           'columnGroups': [{'label': 'Singular', 'span': 3},
                            {'label': 'Plural', 'span': 3}],
           'rows': rows, 'showGlosses': False}
    if say:
        need(tbk, 'm_paspar')
        blk['sayWhole'] = {'label': 'Say Paradigm', 'audio': aud('m_paspar')}
    if typos:
        blk['_verify_note'] = (
            f'This screen ({off:#x}) misprints '
            + '; '.join(f'{t} where the Learn and Review charts print {c}'
                        for t, c in typos)
            + '. Shipped CORRECTED on the D-55 precedent; VERIFY.')
    return blk


# ------------------------------------------------------------------- learn
KLB_POPUPS = [
    ('unvoiced', 'Unvoiced', 0x65a62),
    ('voiced', 'Voiced', 0x6585c),
    ('aspirate', 'Aspirate', 0x65c6c),
    ('labial', 'Labial', 0x6530c),
    ('velar', 'Velar', 0x654d0),
    ('dental', 'Dental', 0x65696),
]
KLB_ROWS = [('Labial', ['π', 'β', 'φ']), ('Velar', ['κ', 'γ', 'χ']),
            ('Dental', ['τ', 'δ', 'θ'])]


def learn_concepts(tbk, conv):
    # C5: "Introduction (cont.)" continues the same header -> merged scroll.
    intro = para_blocks(conv, tfield(tbk, 0x6207c)[0].split('\r\n'))
    cont = para_blocks(conv, tfield(tbk, 0x63e78)[0].split('\r\n'))
    for b in cont:
        b['text'] = greekize(b['text'])
    if len(intro) != 1 or 'consonant' not in intro[0]['text']:
        raise SystemExit(f'STOP: Concepts intro misparse: {intro}')
    if len(cont) != 2 or 'genitive' not in cont[0]['text']:
        raise SystemExit(f'STOP: Concepts intro (cont.) misparse: {cont}')
    if cont[1]['text'] != ('To find the stem of third declension nouns, take '
                           'the ος off of the genitive form.'):
        raise SystemExit(f'STOP: stem line misparse: {cont[1]["text"]!r}')
    for b in cont:
        b['gapBefore'] = True
    intro_topic = {
        'id': 'introduction', 'title': 'Introduction', 'content': intro + cont,
        '_disclosure': ('C5: "Introduction (cont.)" is the same header with a '
                        'continuation marker; merged into one scroll '
                        '(DISCLOSURE-RULES 2.7 header test).'),
        '_source_note': ('Both fields carry a heavy STALE TAIL holding an '
                         'earlier draft ("built off the genitive ... pay '
                         'particular attention to and memorize"); the rail '
                         'walk gives the cut and the shipped wording is the '
                         'shorter, printed one (tbk_fields prefix-vs-region '
                         'rule).')}

    klb_raw = tfield(tbk, 0x630a4)[0]
    lead = para_blocks(conv, klb_raw.split('\r\n')[:7])
    if len(lead) != 1 or 'Mounce, p. 78' not in lead[0]['text']:
        raise SystemExit(f'STOP: Key Letter Box lead misparse: {lead}')
    popups = []
    for pid, label, off in KLB_POPUPS:
        body = para_blocks(conv, tfield(tbk, off)[0].split('\r\n'),
                           drop_title=False)
        if len(body) != 1:
            raise SystemExit(f'STOP: KLB popup {pid} at {off:#x}: {body}')
        popups.append({'id': pid, 'title': label, 'content': body})
    chart = {'type': 'greekRows', 'layout': 'keyLetterBox',
             'columns': [{'label': 'Unvoiced', 'popupRef': 'unvoiced'},
                         {'label': 'Voiced', 'popupRef': 'voiced'},
                         {'label': 'Aspirate', 'popupRef': 'aspirate'}],
             'rows': [{'label': label, 'popupRef': label.lower(),
                       'parts': [{'text': g} for g in letters]}
                      for label, letters in KLB_ROWS],
             'gapBefore': True,
             '_disclosure': ('C3 in-chart triggers (3.3): the three column '
                             'headers and the three row labels are the hot '
                             'text, each opening its own popup; they keep '
                             'their existing appearance, no green underline.'),
             '_greek_note': ('The nine cells are bare font-Greek consonants '
                             'printed as NOTATION -- no clip exists for any '
                             'of them and the rail walk shows no hand over '
                             'one. Same treatment as ch12\'s augment rule '
                             'lines; directive 9 has nothing to play.')}
    klb_topic = {'id': 'keyLetterBox', 'title': 'Key Letter Box',
                 'content': lead + [chart]}

    tr_raw = tfield(tbk, 0x6484c)[0]
    tr_lead = para_blocks(conv, tr_raw.split('\r\n')[:7])
    if len(tr_lead) != 1 or 'contract into one' not in tr_lead[0]['text']:
        raise SystemExit(f'STOP: Transformations lead misparse: {tr_lead}')
    for leg in ['p, b, f', 'k, g, x', 't, d, q']:
        if leg not in tr_raw:
            raise SystemExit(f'STOP: transformation row {leg!r} missing')
    rules = {'type': 'greekRows', 'layout': 'transformation', 'gapBefore': True,
             'rows': [{'label': 'Labials:',
                       'parts': [{'text': 'π, β, φ  +  σ  =  ψ'}]},
                      {'label': 'Velars:',
                       'parts': [{'text': 'κ, γ, χ  +  σ  =  ξ'}]},
                      {'label': 'Dentals:',
                       'parts': [{'text': 'τ, δ, θ  +  σ  =  σ'}]}],
             '_greek_note': 'Notation, not taps (no clips; see Key Letter Box.)'}
    nu = {'type': 'para', 'gapBefore': True,
          'text': 'Nu drops out when followed by a sigma.'}
    tr_topic = {'id': 'transformations', 'title': 'Transformations',
                'content': tr_lead + [rules, nu]}
    return {'id': 'c13_learn_concepts', 'type': 'contentAudio',
            'mode': 'topicPages', 'title': 'Learn Concepts',
            'topics': [intro_topic, klb_topic, tr_topic],
            'popups': popups,
            '_popup_note': ('popups is an ARRAY of {id, title, content} at '
                            'ACTIVITY level -- the register is per-activity '
                            '(providePopups + Svelte context), so a topic-'
                            'level dict never reaches the renderer.')}


def learn_third_declension(tbk, conv):
    intro = para_blocks(conv, tfield(tbk, 0x21806)[0].split('\r\n'))
    for b in intro:
        b['text'] = greekize(b['text'])
    if len(intro) != 2 or 'four paradigms' not in intro[0]['text']:
        raise SystemExit(f'STOP: 3rd-decl intro misparse: {intro}')
    intro[1]['gapBefore'] = True
    need(tbk, 'm_voc5', 'm_pasmns')
    topics = [
        {'id': 'introduction', 'title': 'Introduction', 'content': intro,
         'audioMap': {'πᾶς, πᾶσα, πᾶν': aud('m_voc5')},
         '_audio_note': ('CHAPT_13 ships NO m_pas lemma clip (unlike m_sar, '
                         'm_xar, m_pis and m_ono). The three-form citation '
                         'plays m_voc5, whose lexical form in the vocabulary '
                         'pool IS "pas, pasa, pan"; the topic title plays '
                         'm_pasmns, the chart\'s own masculine-nominative-'
                         'singular cell, which is the single word the title '
                         'prints. Both wanted on the listen list.'),
         '_underline_note': ('genitive form is underlined on both screens '
                             '(rail walk p5); [[u]] comes from the run '
                             'table, not a fallback table.')},
        {'id': 'kappaFinalStems', 'title': 'Kappa Final Stems',
         'content': [noun_chart(tbk, conv, 0x24ace, 'kappa',
                                'learnKappaParadigm')]},
        {'id': 'tauDeltaFinalStems', 'title': 'Tau/Delta Final Stems',
         'content': [noun_chart(tbk, conv, 0x26f98, 'tauDelta',
                                'learnTauDeltaParadigm')]},
        {'id': 'iotaFinalStems', 'title': 'Iota Final Stems',
         'content': [noun_chart(tbk, conv, 0x2870e, 'iota',
                                'learnIotaParadigm')]},
        {'id': 'matFinalStems', 'title': 'ματ Final Stems',
         'content': [noun_chart(tbk, conv, 0x2579e, 'mat',
                                'learnMatParadigm')]},
        {'id': 'pasAdjective', 'title': 'πᾶς Adjective',
         'titleAudio': aud('m_pasmns'),
         'content': [pas_chart(tbk, conv, 0x2ac74, 'learnPasParadigm')]},
    ]
    return {'id': 'c13_learn_third_declension', 'type': 'contentAudio',
            'mode': 'topicPages', 'title': 'Learn Third Declension Nouns',
            'topics': topics}


# ------------------------------------------------------------------ drills
CASE_BTN = {'ns': 'Nominative Singular', 'gs': 'Genitive Singular',
            'ds': 'Dative Singular', 'as': 'Accusative Singular',
            'np': 'Nominative Plural', 'gp': 'Genitive Plural',
            'dp': 'Dative Plural', 'ap': 'Accusative Plural'}
CASE_NUMBER_VALUES = ['Nominative Singular', 'Nominative Plural',
                      'Genitive Singular', 'Genitive Plural',
                      'Dative Singular', 'Dative Plural',
                      'Accusative Singular', 'Accusative Plural']
GENDER_BTN = {'m': 'Masculine', 'f': 'Feminine', 'n': 'Neuter'}
# (gender label, case label) -> the form the chapter's own pas chart prints
PAS_CELL = {}
STEM_HINT = {'sar': 'kappaParadigm', 'xar': 'tauDeltaParadigm',
             'pis': 'iotaParadigm', 'ono': 'matParadigm'}


def sanitized(data):
    """Length-preserving printable view: byte offsets stay true."""
    tbl = bytes(c if 32 <= c < 127 else 32 for c in range(256))
    return data.translate(tbl).decode('latin-1')


def key_blocks(txt, lo, hi, n):
    """Split an AnalyzeAnswer script into its n numbered condition blocks."""
    seg = txt[lo:hi]
    pos = [(int(m.group(1)), m.start())
           for m in re.finditer(r'=\s?(\d{1,2}) ', seg)]
    seq, want = [], 1
    for num, st in pos:
        if num == want:
            seq.append((num, st))
            want += 1
        if want > n:
            break
    if len(seq) != n:
        raise SystemExit(f'STOP: key script {lo:#x}: {len(seq)}/{n} items')
    out = {}
    for i, (num, st) in enumerate(seq):
        end = seq[i + 1][1] if i + 1 < len(seq) else st + 400
        out[num] = seg[st:end]
    return out


def cases_in(blk):
    """The case buttons a condition block names. `as` is compiled to '%'."""
    found = []
    for tok in re.findall(r'=\s{0,2}(ns|gs|ds|np|gp|dp|ap|%)(?![A-Za-z])',
                          blk, re.I):
        tok = 'as' if tok == '%' else tok.lower()
        if tok not in found:
            found.append(tok)
    return found


def declining_drill(tbk, conv, txt):
    n = 30
    prompts = [sq(conv(x)) for x in tpool(tbk, 0xaddee, n, 'declining prompts')]
    trans = [sq(x) for x in tpool(tbk, 0xaff22, n, 'declining translations')]
    disp = dispatch(tbk.data, 0x54800, 0x55100)
    blocks = key_blocks(txt, 0x55340, 0x56800, n)
    items = []
    for i in range(1, n + 1):
        cases = cases_in(blocks[i])
        if not cases:
            raise SystemExit(f'STOP: declining item {i}: no case in key')
        clip, restored = disp.get(i), False
        if not clip:
            # BLANK SayWord entry (the ch10 item-18 / ch12 item-23 class):
            # the form is a REPEAT of an earlier item, so that item's clip
            # restores the original's intent. Assert the forms are equal.
            twin = [j for j in range(1, i)
                    if prompts[j - 1] == prompts[i - 1] and disp.get(j)]
            if not twin:
                raise SystemExit(f'STOP: declining item {i}: blank SayWord '
                                 'entry and no earlier item with the same '
                                 'form')
            clip, restored = disp[twin[0]], True
        if not clip.startswith('m_'):
            raise SystemExit(f'STOP: declining item {i} dispatch {clip!r}')
        stem = clip[2:5]
        if stem not in STEM_HINT:
            raise SystemExit(f'STOP: declining item {i} clip family {clip!r}')
        # cross-check: the clip's own cell must be one of the keyed cells
        if clip[5:] not in cases:
            raise SystemExit(f'STOP: declining item {i}: clip {clip} is not '
                             f'a keyed cell {cases}')
        need(tbk, clip)
        it = {'greek': prompts[i - 1], 'translate': trans[i - 1],
              'answer': CASE_BTN[cases[0]], 'audio': aud(clip),
              'hintRef': STEM_HINT[stem]}
        if restored:
            it['_audio_note'] = ('SayWord entry BLANK in the original (items '
                                 '21 and 28); the form repeats an earlier '
                                 f'item, so it is wired to {clip}.')
        if len(cases) > 1:
            it['answerAlt'] = [CASE_BTN[c] for c in cases[1:]]
            it['_ambiguous_note'] = ("The original's key accepts either "
                                     'reading; ACCEPT ANY of answer + '
                                     'answerAlt.')
        items.append(it)
    return {
        'id': 'c13_drill_declining', 'type': 'select', 'mode': 'fullOptionGrid',
        'title': 'Third Declension Declining Drill',
        'instructions': 'Click on the correct case/number',
        'promptIsGreek': True, 'options': 'static',
        'optionValues': CASE_NUMBER_VALUES, 'optionLayout': 'paradigm2col',
        '_layout_note': 'D-26 / RULES D5: paradigm-shaped grid, two columns.',
        'revealButtons': [{'label': 'Translate', 'field': 'translate'}],
        'items': items, 'scored': True,
        'ui': stepper_ui(hint='kappaParadigm', translate=True),
        '_stage_note': (
            'Thirty items (TotalNumberOfWords at 0x55281). Case/number keys, '
            'including every accepted alternative, read from the '
            'AnalyzeAnswer script at 0x55340-0x56800; the accusative-singular '
            'button compiles to "%". Clips are the paradigm CELL clips from '
            'the SayWord table at 0x54931 and every one is asserted to be a '
            'cell the key itself names. The page carries FOUR Hint buttons '
            '(Hint1-4): the hint is FORM-DEPENDENT per item (D-46), '
            'dispatched by the clip family the SayWord table names.'),
        'audioTiming': 'beforeGuess',
        'answerPolicy': {'advanceClass': 'manualOnIncorrect',
                         'attemptsPerItem': 1}}


def pas_drill(tbk, conv, txt):
    if not PAS_CELL:
        for r, case in enumerate(['ns', 'gs', 'ds', 'as']):
            for c in range(6):
                num = 'p' if c >= 3 else 's'
                PAS_CELL[(GENDER_BTN[PAS_COL[c]],
                          CASE_BTN[case[0] + num])] = \
                    PAS_FORMS[r][c].replace('(ν)', '')
    n = 16
    prompts = [sq(conv(x)) for x in tpool(tbk, 0x118308, n, 'pas prompts')]
    trans = [sq(x) for x in tpool(tbk, 0x11a548, 15, 'pas translations')]
    disp = dispatch(tbk.data, 0x5f000, 0x60200)
    blocks = key_blocks(txt, 0x5e2c0, 0x5f560, n)
    items = []
    for i in range(1, n + 1):
        blk = blocks[i]
        cases = cases_in(blk)
        genders = []
        for g in re.findall(r'=\s?([mfn])\b', blk):
            if g not in genders:
                genders.append(g)
        if not cases or not genders:
            raise SystemExit(f'STOP: pas item {i}: key {blk[:80]!r}')
        clip = disp.get(i)
        if not clip or not clip.startswith('m_pas'):
            raise SystemExit(f'STOP: pas item {i} dispatch {clip!r}')
        if clip[5] not in genders or clip[6:] not in cases:
            raise SystemExit(f'STOP: pas item {i}: clip {clip} outside key '
                             f'{genders}/{cases}')
        need(tbk, clip)
        combos = [[GENDER_BTN[g], CASE_BTN[c]] for g in genders for c in cases]
        # The original's condition is a compiled OR-of-ORs, so a two-part key
        # accepts the whole CROSS PRODUCT. Check it against the chart the
        # chapter itself teaches and report any cell the key over-accepts.
        licensed = [x for x in combos
                    if PAS_CELL.get((x[0], x[1])) == prompts[i - 1]]
        clip_combo = [GENDER_BTN[clip[5]], CASE_BTN[clip[6:]]]
        if clip_combo not in licensed:
            raise SystemExit(f'STOP: pas item {i}: dispatched cell '
                             f'{clip_combo} is not a chart cell for '
                             f'{prompts[i - 1]!r}')
        # DOSBox-CONFIRMED 2026-08-29 (ch13decliningdrill screenshots, all 16
        # items): the buttons the original lights blue are exactly the cross
        # product this key names, so the key parse above is right and the
        # over-acceptance on item 2 is real.
        #
        # RULED 2026-08-29 (Nathanael): the port ships only the parses the
        # chapter's OWN pas chart licenses. This is a RESTRICTION of a
        # compiled-condition defect, not a departure from the original's
        # teaching, so it is deliberately NOT a divergence-log entry.
        combos = [clip_combo] + [x for x in licensed if x != clip_combo]
        it = {'greek': prompts[i - 1], 'answer': combos[0], 'audio': aud(clip),
              'hintRef': 'pasParadigm'}
        full = [[GENDER_BTN[g], CASE_BTN[c]]
                for g in genders for c in cases]
        over = [x for x in full if x not in licensed]
        if over:
            it['_restriction_note'] = (
                'The original\'s compiled key here is '
                f'(({" or ".join(cases)}) and ({" or ".join(genders)})), an '
                'OR-of-ORs. The drill commits on TWO clicks (gender, then '
                'case/number), and that condition shape cannot express '
                '"this gender only with that case", so it evaluates to the '
                'whole CROSS PRODUCT and accepts '
                + '; '.join(f'{a} {b}' for a, b in over) +
                ' as well -- cells that hold '
                + ', '.join(sorted({PAS_CELL[tuple(x)] for x in over}))
                + ', not this form. The DOSBox screenshots '
                '(ch13decliningdrill, image 2) confirm the original lights '
                'every one of them blue. RULED 2026-08-29 (Nathanael): the '
                'port accepts ONLY the '
                f'{len(licensed)} parses the chapter\'s own pas chart '
                'licenses. A compiled-condition defect corrected, not a '
                'departure from the original\'s teaching -- deliberately '
                'NOT a divergence-log entry.')
        # 15 lines for 16 items: the last line serves items 15 AND 16
        # (Nathanael, DOSBox 2026-08-29 -- item 16 shows "every").
        it['translate'] = trans[min(i, len(trans)) - 1]
        if i > len(trans):
            it['_note'] = ('The Translate pool ends at fifteen lines; this '
                           'item reuses the last one, which is what the '
                           'original shows.')
        if len(combos) > 1:
            it['answerAlt'] = combos[1:]
            it['_ambiguous_note'] = ("The original's key accepts every "
                                     'combination listed; ACCEPT ANY of '
                                     'answer + answerAlt.')
        items.append(it)
    return {
        'id': 'c13_drill_pas_declining', 'type': 'select',
        'mode': 'twoStageGrid', 'title': 'πᾶς Declining Drill',
        'instructions': 'Click on the correct gender then case/number',
        'promptIsGreek': True, 'options': 'static',
        'optionStages': [
            {'label': 'gender', 'values': ['Masculine', 'Feminine', 'Neuter']},
            {'label': 'caseNumber', 'values': CASE_NUMBER_VALUES,
             'layout': 'paradigm2col'}],
        'revealButtons': [{'label': 'Translate', 'field': 'translate'}],
        'items': items, 'scored': True,
        'ui': stepper_ui(hint='pasParadigm', translate=True),
        '_stage_note': (
            'TWO optionStages; the guess commits on the case/number click. '
            'Sixteen items (TotalNumberOfWords at 0x5e10f), keys at '
            '0x5e2c0-0x5f560 carrying every accepted gender x case pair '
            '(panta is neuter nom/acc plural OR masculine accusative '
            'singular). Clips from the SayWord table at 0x5f5c7, each '
            'asserted to sit inside its own item\'s key.'),
        '_verify_note': PAS_TRANSLATE_NOTE,
        '_key_note': (
            'Fifteen of the sixteen items are unaffected by the OR-of-ORs '
            'key shape: where a key names two genders or two cases, both '
            'readings really are this form (pasi is masculine AND neuter '
            'dative plural, pantos masculine AND neuter genitive singular, '
            'and so on). Item 2 (panta) is the only one whose cross product '
            'reaches cells holding a different word; see its '
            '_restriction_note.'),
        'audioTiming': 'beforeGuess',
        'answerPolicy': {'advanceClass': 'manualOnIncorrect',
                         'attemptsPerItem': 1}}


TD_ANSWERS = [  # ch13railwalk.pdf p9-p14, the BLUE (correct) option per item
    'and the grace of God was upon him',
    'grace to you and peace from God our Father and the Lord Jesus Christ',
    'but by the grace of God I am what I am',
    'the grace of the Lord Jesus Christ be with your spirit',
    'the grace of our Lord Jesus Christ be with all of you',
    'and the God of all grace',
    'and the two shall become one flesh',
    'for the flesh desires against the Spirit',
    'who in the days of his flesh',
    'for all that is in the world, the lust of the flesh',
    'but you are not in the flesh but in the Spirit',
    'for a spirit does not have flesh and bones',
    'you judge according to the flesh, I judge no one',
    'and you will call his name Jesus',
    'What is your name?',
    'the names of the 12 apostles are these',
    'but now endure faith, hope, love',
    'even the righteousness of God through faith in Jesus Christ',
    'and whatever is not from faith is sin']
# stale-tail cuts, every one confirmed against the rail-walk screen
TD_CUTS = {
    ('greek', 19): 'δὲ ὃ οὐκ ἐκ πίστεως ἁμαρτία ἐστίν',
    ('a', 19): 'and whatever is not from faith is sin',
    ('b', 19): 'and faith is not that which is sin',
    ('c', 19): 'and sin is not by faith',
    ('ref', 19): 'Rom 14:23'}
TD_HINT = [('χαρ', 'tauDeltaParadigm'), ('χάρ', 'tauDeltaParadigm'),
           ('σαρ', 'kappaParadigm'), ('σάρ', 'kappaParadigm'),
           ('ονομ', 'matParadigm'), ('όνομ', 'matParadigm'),
           ('ὄνομ', 'matParadigm'), ('ὀνόμ', 'matParadigm'),
           ('πιστ', 'iotaParadigm'), ('πίστ', 'iotaParadigm')]


def td_hint_for(greek):
    b = bare(greek)
    for frag, ref in TD_HINT:
        if bare(frag) in b:
            return ref
    raise SystemExit(f'STOP: no hint family for {greek!r}')


def translation_drill(tbk, conv):
    n = 19
    greek = [sq(conv(x)) for x in tpool(tbk, 0x715c0, n, 'td greek')]
    cols = {k: [sq(x) for x in tpool(tbk, o, n, f'td col {k}')]
            for k, o in (('a', 0x732c2), ('b', 0x73acc), ('c', 0x7409c))}
    refs = [sq(x) for x in tpool(tbk, 0x7451c, n, 'td refs')]
    # positional second-Greek-line pool: 18 lines for 19 items -- entry k is
    # item k, and item 19 (which has no second line) simply runs off the end.
    line2 = tpool(tbk, 0x748de, 18, 'td line 2', allow_blank=True) + ['']
    for (field, idx), want in TD_CUTS.items():
        src = {'greek': greek, 'ref': refs}.get(field, cols.get(field))
        if not src[idx - 1].startswith(want):
            raise SystemExit(f'STOP: td {field} {idx} cut: {src[idx-1]!r}')
        src[idx - 1] = want
    disp = dispatch(tbk.data, 0x9d200, 0x9e200)
    items = []
    for i in range(n):
        opts = [cols['a'][i], cols['b'][i], cols['c'][i]]
        if TD_ANSWERS[i] not in opts:
            raise SystemExit(f'STOP: td item {i+1}: {TD_ANSWERS[i]!r} '
                             f'not in {opts}')
        clip = disp.get(i + 1)
        if clip != f'm_td{i+1}':
            raise SystemExit(f'STOP: td item {i+1} dispatch {clip!r}')
        need(tbk, clip)
        it = {'greek': greek[i], 'ref': refs[i], 'options': opts,
              'answer': TD_ANSWERS[i], 'audio': aud(clip),
              'hintRef': td_hint_for(greek[i])}
        if line2[i].strip():
            it['greek2'] = sq(conv(line2[i]))
        items.append(it)
    return {
        'id': 'c13_drill_translation', 'type': 'select',
        'mode': 'fullOptionGrid',
        'title': 'Third Declension Translation Drill',
        'instructions': 'Click on the correct translation',
        'promptIsGreek': True, 'options': 'perItem',
        'optionLayout': 'stack1col', 'items': items, 'scored': True,
        'ui': stepper_ui(hint='kappaParadigm'),
        '_answer_note': (
            'Nineteen items (TotalNumberOfWords at 0xf49d7). Answers are the '
            'BLUE options on ch13railwalk.pdf p9-p14, all 19 captured. Second '
            'Greek lines (items 2, 4, 5, 13, 16) come from the positional '
            'pool at 0x748de indexed DIRECTLY by item number -- not ch12\'s '
            'item-minus-7 offset. The page carries FOUR named hint buttons '
            '(Hintsar / Hintxar / Hintono / Hintpis, charts at '
            '0x74faa-0x77b70): the hint is FORM-DEPENDENT per item (D-46), '
            'dispatched by which third-declension noun the verse contains.'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'manualOnIncorrect',
                         'attemptsPerItem': 1}}


# ------------------------------------------------------------------- vocab
VOC_KEYS = ['aner', 'basileus', 'dunamis', 'onoma', 'pas', 'pater', 'pistis',
            'pneuma', 'sarx', 'charis']
VOC_FREQ = [216, 115, 119, 231, 1244, 413, 243, 379, 147, 155]
VOC_CLIPS = [f'm_voc{i}' for i in range(1, 11)]
CHART_GLOSS = ['man, husband', 'king', 'power, miracle', 'name, reputation',
               'each, every, all', 'father', 'faith, belief', 'spirit, wind',
               'flesh, body', 'grace, kindness']


def vocab_pools(tbk, conv):
    lex = [sq(conv(x)) for x in tpool(tbk, 0x17da0, 10, 'vocab lexical forms')]
    card = [sq(x) for x in tpool(tbk, 0x17fdc, 10, 'flashcard glosses')]
    drill = [sq(x) for x in tpool(tbk, 0x52724, 10, 'drill glosses')]
    spell = [sq(x) for x in tpool(tbk, 0x79a20, 10, 'speller prompts')]
    first = [sq(conv(x)) for x in tpool(tbk, 0x97568, 10, 'gk->en prompts')]
    card[9] = 'grace, kindness'   # stale tail on the last flashcard line
    spell[9] = 'grace, kindness'  # ditto
    drill[9] = 'grace'            # ditto
    if lex[0] != 'ἀνήρ, ἀνδρός, ὁ' or first[8] != 'σάρξ':
        raise SystemExit(f'STOP: vocab misparse {lex[0]!r} / {first[8]!r}')
    for i, f in enumerate(first):
        if not lex[i].startswith(f):
            raise SystemExit(f'STOP: vocab head {f!r} vs {lex[i]!r}')
    return lex, first, card, drill, spell


def vocab_drills(tbk, conv):
    lex, first, card, drill, spell = vocab_pools(tbk, conv)
    need(tbk, *VOC_CLIPS)
    common = {'scored': True, 'ui': score_ui(), 'poolKind': 'vocabulary',
              'answerPolicy': {'advanceClass': 'autoBoth',
                               'attemptsPerItem': 1}}
    gk = {'id': 'c13_drill_vocab_gk_en', 'type': 'select',
          'mode': 'fullOptionGrid',
          'title': 'Vocabulary:  Greek to English Drill',
          'instructions': 'Click on the matching word',
          'promptIsGreek': True, 'options': 'static', 'optionValues': drill,
          'items': [{'greek': g, 'answer': gl, 'audio': aud(c)}
                    for g, gl, c in zip(first, drill, VOC_CLIPS)],
          'audioTiming': 'beforeGuess', **common}
    en = {'id': 'c13_drill_vocab_en_gk', 'type': 'select',
          'mode': 'fullOptionGrid',
          'title': 'Vocabulary: English to Greek Drill',
          'instructions': 'Click on the matching word',
          'options': 'static', 'optionsAreGreek': True, 'optionValues': first,
          'items': [{'prompt': gl, 'answer': g, 'audio': aud(c)}
                    for g, gl, c in zip(first, drill, VOC_CLIPS)],
          'audioTiming': 'afterGuess', **common}
    return gk, en


def vocab_speller(tbk, conv):
    lex, first, card, drill, spell = vocab_pools(tbk, conv)
    return {
        'id': 'c13_ex_vocab_speller', 'type': 'spell',
        'title': 'Vocabulary Spelling Exercise',
        'instructions': ('Click letters below or use your keyboard to spell '
                         'it out.'),
        'prompt': 'item', 'promptLabel': 'English Meaning',
        'accentsOptional': True, 'spellerTilesRef': 'chapt_1',
        'items': [{'prompt': p, 'answer': g, 'audio': aud(c)}
                  for p, g, c in zip(spell, first, VOC_CLIPS)],
        'ui': {'fields': ['English Meaning', 'Spell Greek Word'],
               'buttons': ['Pronounce', 'Previous', 'Score', 'Next',
                           'Check Answer', 'Greek Keyboard'],
               'checkboxes': ['Show Answer', 'With Accents',
                              'Pronounce Each Exercise'],
               'defaults': {'pronounceEach': True}},
        '_answer_note': ('Prompts from the speller pool 0x79a20 (the FULL '
                         'glosses, not the drill pool); answers are the '
                         'lemma head forms.'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


# ----------------------------------------------------------------- speller
def declension_speller(tbk, conv, decl):
    prompts = [sq(x) for x in tpool(tbk, 0x8ba26, 30, 'speller prompts')]
    CASE_TAG = {'nom': 'Nominative', 'gen': 'Genitive', 'dat': 'Dative',
                'acc': 'Accusative'}
    NUM_TAG = {'sg': 'Singular', 'pl': 'Plural'}
    items = []
    for i, (p, src) in enumerate(zip(prompts, decl['items']), 1):
        m = re.search(r'\((nom|gen|dat|acc)\.\s*(sg|pl)\.\)\s*$', p)
        if not m:
            raise SystemExit(f'STOP: speller {i}: no parse tag in {p!r}')
        label = f'{CASE_TAG[m.group(1)]} {NUM_TAG[m.group(2)]}'
        accepted = [src['answer']] + src.get('answerAlt', [])
        if label not in accepted:
            raise SystemExit(f'STOP: speller {i}: tag {label!r} is not a '
                             f'keyed case of declining item {i} {accepted}')
        ans = src['greek']
        it = {'prompt': p, 'answer': ans, 'audio': src['audio']}
        if '(' in ans:  # the movable-nu cells print sarci<(n) etc.
            raise SystemExit(f'STOP: speller {i}: bracketed answer {ans!r}')
        items.append(it)
    if items[8]['answer'] != 'σάρκες':
        raise SystemExit(f'STOP: speller item 9 {items[8]["answer"]!r} '
                         'disagrees with the check literal "sarkej"')
    return {
        'id': 'c13_ex_speller', 'type': 'spell',
        'title': 'Third Declension Spelling Exercise',
        'instructions': ('Click letters below or use your keyboard to spell '
                         'it out.'),
        'prompt': 'item', 'promptLabel': 'English',
        'accentsOptional': True, 'spellerTilesRef': 'chapt_1', 'items': items,
        'ui': {'fields': ['English', 'Spell Greek'],
               'buttons': ['Pronounce', 'Previous', 'Score', 'Next',
                           'Check Answer', 'Greek Keyboard'],
               'checkboxes': ['Show Answer', 'With Accents',
                              'Pronounce Each Exercise'],
               'defaults': {'pronounceEach': True}},
        '_answer_note': (
            'The 30 answers ARE the Declining Drill pool (0xaddee) in order. '
            'Each prompt carries a PARSE TAG which is asserted, item by item, '
            'to be one of the cases that drill\'s own AnalyzeAnswer key '
            'accepts -- a stronger check than comparing the glosses, which '
            'deliberately differ in wording (item 3 is "faiths" here and '
            '"beliefs" in the drill). Item 9 corroborated by the check '
            'literal "sarkej" at 0x8d08a.'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


# --------------------------------------------------------------- scripture
VERSE = ['ἐλθέτω', 'ἡ', 'βασιλεία', 'σου·', 'γενηθήτω', 'τό', 'θέλημά', 'σου,']
VERSE_GLOSS = ['let come', 'the', 'kingdom', 'your', 'let happen', 'the',
               'will', 'your']
SM_OPTS = ['kingdom', 'will', 'let come', 'your', 'let happen']
SM_GLOSS = {'ἐλθέτω': 'let come', 'βασιλεία': 'kingdom', 'σου': 'your',
            'γενηθήτω': 'let happen', 'θέλημά': 'will'}


def learn_scripture(tbk, conv):
    raw = tfield(tbk, 0xd6cba)[0]
    for leg in ['e]lqe<tw', 'basilei<a', 'genhqh<tw', 'qe<lhma<']:
        if leg not in raw:
            raise SystemExit(f'STOP: {leg} not in interlinear 0xd6cba')
    words = []
    for k, (w, gl) in enumerate(zip(VERSE, VERSE_GLOSS), 1):
        need(tbk, f'm_sm{k}')
        words.append({'greek': w, 'gloss': gl, 'audio': aud(f'm_sm{k}')})
    need(tbk, 'm_mt610a')
    return {'id': 'c13_learn_scripture', 'type': 'contentAudio',
            'mode': 'interlinearVerse', 'title': 'Learn Scripture Memory',
            'reference': 'Mat 6:10a', 'words': words,
            'sayWhole': {'label': 'Say Whole Verse', 'audio': aud('m_mt610a')},
            '_punct_note': ('The ano teleia after sou is U+00B7 (NFC per '
                            'Stage 5 rule 2).')}


def scripture_drill(tbk, conv):
    prompts = [sq(conv(x)) for x in tpool(tbk, 0x1c34e, 5, 'sm prompts')]
    disp = dispatch(tbk.data, 0x105900, 0x105c00)
    items = []
    for i, g in enumerate(prompts, 1):
        base = g.rstrip('·.,')
        clip = disp.get(i)
        if not clip or not clip.startswith('m_sm'):
            raise SystemExit(f'STOP: SM item {i} dispatch {clip!r}')
        pos = int(clip[4:])
        if VERSE[pos - 1].rstrip('·,') != base:
            raise SystemExit(f'STOP: SM prompt {g!r} is not verse word {pos}')
        need(tbk, clip)
        items.append({'greek': base, 'answer': SM_GLOSS[base],
                      'audio': aud(clip)})
    return {'id': 'c13_drill_scripture_memory', 'type': 'select',
            'mode': 'fullOptionGrid', 'title': 'Scripture Memory Drill',
            'instructions': 'Click on the matching word',
            'promptIsGreek': True, 'options': 'static',
            'optionValues': SM_OPTS, 'items': items, 'scored': True,
            'ui': score_ui(),
            '_audio_note': ('Five prompts (the articles and the repeated sou '
                            'are not drilled); VERSE-POSITION clips m_sm1, 3, '
                            '4, 5, 7 read from the SayWord table at 0x105a6d '
                            '-- NOT sequential ids (Stage 8.2). The '
                            'original\'s six-cell grid leaves one cell '
                            'empty (NIT-LOG N-4).'),
            'audioTiming': 'beforeGuess',
            'answerPolicy': {'advanceClass': 'autoBoth',
                             'attemptsPerItem': 1}}


def scripture_speller(tbk, conv):
    raw = tfield(tbk, 0x83a32)[0]
    if 'e]lqe<tw h[ basilei<a sou:' not in raw:
        raise SystemExit('STOP: whole-verse field 0x83a32')
    hint = sq(' '.join(l.strip() for l in
                       tfield(tbk, 0x888f8)[0].split('\r\n') if l.strip()))
    if hint != 'Your kingdom come, your will be done,':
        raise SystemExit(f'STOP: verse hint {hint!r}')
    return {
        'id': 'c13_ex_scripture_speller', 'type': 'spellVerse',
        'title': 'Scripture Memory Spelling Exercise',
        'instructions': 'Enter all of Mat 6:10a then click "Check Answer"',
        'reference': 'Mat 6:10a', 'answerWords': VERSE,
        'translation': hint,
        'accentsOptional': True, 'punctuationOptional': True,
        'audio': aud('m_mt610a'), 'spellerTilesRef': 'chapt_1',
        'ui': {'fields': ['Spell Greek'],
               'buttons': ['Pronounce', 'Check Answer', 'Greek Keyboard',
                           'Restart Exercise'],
               'checkboxes': ['Show Answer', 'With Accents'],
               '_reveal_note': 'RULES C8 / D-30: Major Hint renders as '
                               'Show Answer.'},
        '_repeat_note': '"Repeat This Exercise" NOT ported (D-42 retired).',
        '_answer_note': ('Eight words, corroborated word by word against the '
                         'AnalyzeSelectionWithAccents script at 0x5fe00 '
                         '(TotalNumberOfWords 8).'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


# ------------------------------------------------------------- objectives
CONGRATS = ('Congratulations!  After mastering this chapter, you will know '
            'all the noun forms in the New Testament.')


def objectives(tbk):
    raw = tfield(tbk, 0x3020c)[0].split('\r\n')
    items, cur = [], None
    for l in raw:
        s = l.strip()
        m = re.match(r'^(\d)\)\s*(.*)$', s)
        if m:
            if cur:
                items.append(cur)
            cur = m.group(2)
        elif cur is not None and s and not s.startswith('Congratulations'):
            cur += ' ' + s
        elif s.startswith('Congratulations'):
            break
    if cur:
        items.append(cur)
    items = [sq(x) for x in items[:6]]
    if len(items) != 6 or 'Mat 6:10' not in items[5]:
        raise SystemExit(f'STOP: objectives: {items}')
    joined = ' '.join(l.strip() for l in raw)
    if 'all the noun forms in the New Testament' not in joined:
        raise SystemExit('STOP: objectives postamble missing')
    return items


def bibliography(tbk):
    raw = tfield(tbk, 0x12a4a)[0].split('\r\n')
    entries, cur = [], None
    for l in raw:
        if not l.strip():
            continue
        if l.startswith('   ') and not l.startswith('        '):
            if cur:
                entries.append(sq(cur))
            cur = l.strip()
        elif cur is not None:
            cur += ' ' + l.strip()
        if len(entries) == 3 and cur and '115-126' in cur:
            entries.append(sq(cur))
            cur = None
            break
    if len(entries) != 4:
        raise SystemExit(f'STOP: expected 4 bibliography entries, got '
                         f'{len(entries)}')
    return {'id': 'c13_learn_bibliography', 'type': 'contentAudio',
            'mode': 'textPage', 'title': 'Learn Bibliography',
            'content': [{'type': 'biblist', 'items': entries}],
            '_source_note': ('Field 0x12a4a carries a long STALE TAIL '
                             'holding two earlier chapters\' bibliographies; '
                             'the cut is the Wenham 115-126 entry.')}


# ------------------------------------------------------------ quick review
def qr_vocab(tbk, conv):
    raw = tfield(tbk, 0xde674)[0]
    for g in CHART_GLOSS:
        if g not in raw:
            raise SystemExit(f'STOP: chart gloss {g!r} not in 0xde674')
    need(tbk, 'm_vocla', 'm_voclb')
    return {'id': 'c13_qr_vocab', 'type': 'contentAudio',
            'mode': 'reviewVocab', 'title': 'Review Vocabulary Chart',
            'pool': 'senses', 'columns': 2, 'showNtFreq': True,
            'footnote': ('The number after the translation is the number of '
                         'times the word occurs in the New Testament.'),
            'playAllGroups': [
                {'afterRow': 5, 'label': 'Say List', 'audio': aud('m_vocla')},
                {'afterRow': 10, 'label': 'Say List', 'audio': aud('m_voclb')}],
            '_disclosure': ('C9 / 4.6: the original pages this chart '
                            'five-and-five behind More/Back; Review pages '
                            'never page, so the ten rows are merged into one '
                            'flowing scroll.'),
            '_note': SAY_LIST_NOTE}


def qr_paradigms(tbk, conv):
    charts = [noun_chart(tbk, conv, 0x445b6, 'kappa', 'qrKappa'),
              noun_chart(tbk, conv, 0x45276, 'tauDelta', 'qrTauDelta'),
              noun_chart(tbk, conv, 0x47972, 'iota', 'qrIota'),
              noun_chart(tbk, conv, 0x48672, 'mat', 'qrMat')]
    for c in charts:
        c['name'] = c['title']
    return [
        {'id': 'c13_qr_paradigms', 'type': 'contentAudio',
         'mode': 'paradigmChart', 'title': 'Review Third Declension Paradigms',
         'paradigms': charts,
         '_disclosure': ('C9 (4.6): the original pages the four charts behind '
                         'a Kappa / Tau-Delta / Iota / Mat button row with '
                         'the current one disabled; stacked here, one Say '
                         'Paradigm per chart, no toggles.')},
        {'id': 'c13_qr_pas', 'type': 'contentAudio', 'mode': 'paradigmChart',
         'title': 'Review Declension of Adjective πᾶς',
         'titleAudio': aud('m_pasmns'),
         'paradigms': [pas_chart(tbk, conv, 0xa6b8, 'qrPas')]}]


def qr_scriptures(ch12, learn_scr):
    out = []
    for oid in ('c12_qr_scripture_rom623a', 'c12_qr_scripture_rom623b',
                'c12_qr_scripture_mat633a', 'c12_qr_scripture_mat633b',
                'c12_qr_scripture_mat69'):
        src = [a for a in ch12['quickReview'] if a['id'] == oid]
        if not src:
            raise SystemExit(f'STOP: {oid} not in chapt-12.json')
        src = src[0]
        words = [{'greek': w['greek'], 'gloss': w['gloss'],
                  'audio': w['audio'].replace('chapt_12_', A)}
                 for w in src['words']]
        out.append({'id': oid.replace('c12_', 'c13_'), 'type': 'contentAudio',
                    'mode': 'interlinearVerse', 'title': src['title'],
                    'reference': src['reference'], 'words': words,
                    'sayWhole': {'label': src['sayWhole']['label'],
                                 'audio': src['sayWhole']['audio']
                                 .replace('chapt_12_', A)}})
    out.append({'id': 'c13_qr_scripture_mat610a', 'type': 'contentAudio',
                'mode': 'interlinearVerse',
                'title': 'Review Scripture Memory:  Mat 6:10a',
                'reference': 'Mat 6:10a', 'words': learn_scr['words'],
                'sayWhole': learn_scr['sayWhole']})
    return out


def build_lexicon(tbk, conv):
    lex, first, card, drill, spell = vocab_pools(tbk, conv)
    lemmas = {}
    for k, lf, hd, gc, gd, cg, c, f in zip(VOC_KEYS, lex, first, card, drill,
                                           CHART_GLOSS, VOC_CLIPS, VOC_FREQ):
        lemmas[k] = {'greek': hd, 'translit': k, 'lexicalForm': lf,
                     'gloss': cg, 'glossShort': gc, 'audio': aud(c),
                     'ntFreq': f,
                     'senses': [{'greek': hd, 'caseTag': None,
                                 'glossShort': gd, 'audio': aud(c)}]}
    return {'_comment': (
        'Chapter 13 lexicon, assembled from 13_3DECL.TBK (cohort 5I). Ten '
        'lemmas, no case splits. gloss = Review Vocabulary Chart (0xde674, '
        'verbatim); glossShort = flashcard pool (0x17fdc); '
        'senses[].glossShort = drill pool (0x52724). Every lexical form '
        'prints as ONE entry with one clip (m_voc1-10): the two-surface '
        'parts rule (5H canon (v)) does NOT apply here -- pas, pasa, pan is '
        'a single lexical citation with a single recording, not three '
        'independently recorded words.'),
        'lemmas': lemmas, 'exampleWords': {}}


# -------------------------------------------------------------------- main
def main():
    tbk_path, fontmap_path, ch12_path, wavlist_path, outdir = sys.argv[1:6]
    outfile = os.path.join(outdir, 'chapt-13.json')
    if os.path.exists(outfile) and not os.environ.get(
            'ALLOW_REGRESSIVE_REBUILD'):
        raise SystemExit('STOP: Stage 8.7 -- chapt-13.json exists.')
    shipped = {l.strip().lower().rsplit('.', 1)[0]
               for l in open(wavlist_path) if l.strip()}
    tbk = Tbk(tbk_path)
    tbk.greek_fmts = underline.vote_greek_fmts(tbk.data, TEACH_OFFSETS)
    fontmap = json.load(open(fontmap_path, encoding='utf-8'))
    # FONT-MAP FINDING (5I, chapter 13): '{' is ROUGH BREATHING + GRAVE.
    # Two clean Greek witnesses, both in the Translation Drill pool and both
    # confirmed on ch13railwalk.pdf: o{j = hos (Heb 5:7, p11) and o{ = ho
    # (Rom 14:23, p14), each printing with a grave in the original. This is
    # one of the six codes PIPELINE-INSIGHTS Stage 3 still lists as unknown
    # ("witnessed only inside font-metric binary junk") -- the other six
    # occurrences in this TBK are indeed compiled-script bytes. It carries
    # TWO of the three required evidence sources (word cross-reference +
    # DOSBox screenshot); glyph rendering is outstanding, exactly as '$' and
    # '!' were carried at 5C. Applied LOCALLY here rather than written into
    # font-map.json, which is a canonical living file and needs its own
    # delivery.
    fontmap['diacritics_verified']['{'] = {
        'unicode': '\u0314\u0300', 'name': 'rough breathing + grave',
        'evidence': ('13_3DECL.TBK translation pool 0x715c0: o{j = hos '
                     '(Heb 5:7), o{ = ho (Rom 14:23); both print with a '
                     'grave on ch13railwalk.pdf p11/p14.')}
    conv = make_conv11(fontmap)
    ch12 = json.load(open(ch12_path, encoding='utf-8'))
    txt = sanitized(tbk.data)

    learn_scr = learn_scripture(tbk, conv)
    decl = declining_drill(tbk, conv, txt)
    gk, en = vocab_drills(tbk, conv)
    ch = {
        '_comment': (
            'Chapter 13 (Third Declension Nouns), assembled from '
            '13_3DECL.TBK + CHAPT_13 audio + ch13railwalk.pdf under '
            'PIPELINE-INSIGHTS-v3 Stage 8 and DISCLOSURE-RULES. Behavior '
            'fields per DRILLBEHAVIORLEDGER.csv rows 116-124 (EXTRAPOLATED '
            '2026-08-29, pending Nathanael\'s DOSBox pass).'),
        'id': 'chapt_13', 'number': 13, 'title': 'Third Declension Nouns',
        'objectivesPreamble': 'You will be able to:',
        'objectives': objectives(tbk),
        'objectivesPostamble': CONGRATS,
        '_postamble_note': (
            'NEW KEY: the objectives field 0x3020c prints a closing '
            'paragraph BELOW the numbered list ("Congratulations! ... all '
            'the noun forms in the New Testament."). No chapter 1-12 '
            'objectives page has one and objectivesPage renders only '
            'preamble + list, so the renderer needs a one-line addition. '
            'The text is verbatim; it is not an objective and must not be '
            'folded into the list.'),
        'vocab': VOC_KEYS,
        'learn': [], 'drill': [], 'exercise': [], 'quickReview': [],
        'feedback': ch12['feedback'], 'sequence': [],
        '_audioVerify': (
            'CHAPT_13 ships 158 WAVs. UNREFERENCED (D-39 class): m_vocl '
            '(declared as an alias at 0x10294, played by nothing -- the '
            'Review chart plays the halves vocl13a/vocl13b instead), m_ad5 '
            '(an orphan of chapter 12\'s l_ad family), msargs (missing '
            'underscore, duplicate of m_sargs), m_onoss. Listens wanted: '
            'm_vocla / m_voclb (confirm they are the first and second five '
            'rows), m_pas (confirm it recites pas, pasa, pan and not pas '
            'alone), m_sm4 vs m_sm8 (both are sou).'),
        '_menu_note': ('Drill Menu and page titles agree in this chapter; '
                       'no title sweep divergence.')}
    ch['learn'] = [
        {'id': 'c13_learn_objectives', 'type': 'contentAudio',
         'mode': 'objectivesPage', 'title': 'Learn Chapter Objectives',
         'instructions': ''},
        learn_concepts(tbk, conv), learn_third_declension(tbk, conv),
        {'id': 'c13_learn_vocab', 'type': 'contentAudio', 'mode': 'flashcard',
         'title': 'Learn Vocabulary', 'pool': 'senses'},
        learn_scr, bibliography(tbk)]
    ch['drill'] = [decl, pas_drill(tbk, conv, txt),
                   translation_drill(tbk, conv), gk, en,
                   scripture_drill(tbk, conv)]
    ch['exercise'] = [declension_speller(tbk, conv, decl),
                      vocab_speller(tbk, conv), scripture_speller(tbk, conv)]
    ch['quickReview'] = ([qr_vocab(tbk, conv)] + qr_paradigms(tbk, conv)
                         + qr_scriptures(ch12, learn_scr))
    ch['sequence'] = [
        'c13_learn_objectives', 'c13_learn_concepts',
        'c13_learn_third_declension', 'c13_drill_declining',
        'c13_drill_pas_declining', 'c13_drill_translation', 'c13_ex_speller',
        'c13_learn_vocab', 'c13_drill_vocab_gk_en', 'c13_drill_vocab_en_gk',
        'c13_ex_vocab_speller', 'c13_learn_scripture',
        'c13_drill_scripture_memory', 'c13_ex_scripture_speller',
        'c13_qr_vocab', 'c13_qr_paradigms', 'c13_qr_pas',
        'c13_qr_scripture_rom623a', 'c13_qr_scripture_rom623b',
        'c13_qr_scripture_mat633a', 'c13_qr_scripture_mat633b',
        'c13_qr_scripture_mat69', 'c13_qr_scripture_mat610a',
        'c13_learn_bibliography']
    ch['_sequence_note'] = ('Rail order from ch13railwalk.pdf, cross-checked '
                            'against the Drill / Exercise / Quick Review '
                            'menus on its last page.')

    # hint charts (D-46 form-dependent on two drills)
    ch['hintCharts'] = {}
    for key, off, cid in (('kappa', 0xaf06a, 'hintKappa'),
                          ('tauDelta', 0xae244, 'hintTauDelta'),
                          ('iota', 0xb0212, 'hintIota'),
                          ('mat', 0xb1058, 'hintMat')):
        chart = noun_chart(tbk, conv, off, key, cid, say=False)
        ch['hintCharts'][f'{key}Paradigm'] = {
            'charts': [chart],
            '_note': (f'Transcribed from the Declining Drill\'s OWN hint '
                      f'field at {off:#x} (4.7 source fidelity), not from '
                      'the Learn chart it resembles. The Translation Drill '
                      'carries the same four charts at 0x74faa-0x77b70 and '
                      'resolves to these refs.')}
    ch['hintCharts']['pasParadigm'] = {
        'charts': [pas_chart(tbk, conv, 0x11875e, 'hintPas',
                             title='πᾶς  Forms', say=False)],
        '_note': ('The pas drill\'s own hint field at 0x11875e; its title is '
                  '"pas Forms", NOT the Learn page\'s "pas (all) Forms".')}
    for a in ch['drill']:
        refs = {a.get('ui', {}).get('hintRef')}
        refs |= {i.get('hintRef') for i in a.get('items', [])}
        for hr in refs:
            if hr and hr not in ch['hintCharts']:
                raise SystemExit(f'STOP: dangling hintRef {hr}')

    ids = set()

    def collect(o):
        if isinstance(o, dict):
            for k, v in o.items():
                if k in ('audio', 'audioFull', 'titleAudio') and \
                        isinstance(v, str):
                    ids.add(v)
                if k == 'audioMap':
                    ids.update(v.values())
                if k == 'parts' and isinstance(v, list) and \
                        all(isinstance(x, str) for x in v):
                    ids.update(v)
                collect(v)
        elif isinstance(o, list):
            for v in o:
                collect(v)
    collect(ch)
    for cid in sorted(ids):
        base = cid[len(A):]
        if base.lower() not in shipped:
            raise SystemExit(f'STOP: emitted clip {cid} not in CHAPT_13 pack')
        if not tbk.has_clip(base) and not re.match(r'[hijkl]_', base):
            raise SystemExit(f'STOP: emitted clip {cid} not referenced in TBK')
    errs = audit(ch)
    if errs:
        raise SystemExit('STOP: self-audit failed:\n' + '\n'.join(errs))
    ch = post_patches(ch)
    os.makedirs(outdir, exist_ok=True)
    with open(outfile, 'w', encoding='utf-8') as f:
        json.dump(ch, f, ensure_ascii=False, indent=1)
    with open(os.path.join(outdir, 'lexicon-chapt13.json'), 'w',
              encoding='utf-8') as f:
        json.dump(build_lexicon(tbk, conv), f, ensure_ascii=False, indent=1)
    print(f'chapter 13: {len(ids)} distinct clips, '
          f'{len(ch["sequence"])} rail pages, '
          f'{sum(len(a.get("items", [])) for a in ch["drill"] + ch["exercise"])}'
          ' scored items. OK.')


def post_patches(doc):
    """Stage 8.7: ratified rulings re-applied on rebuild. Nothing has been
    hand-repaired yet (chapter 13 is new); the asserts guard the invariants
    that earlier cohorts had to fix by hand."""
    sp = [a for a in doc['exercise']
          if a['id'] == 'c13_ex_scripture_speller'][0]
    assert 'Repeat This Exercise' not in sp['ui']['checkboxes']   # D-42
    assert 'Major Hint' not in sp['ui']['buttons']                # C8 / D-30
    for a in doc['drill'] + doc['exercise']:
        assert a['answerPolicy']['advanceClass'] in (
            'none', 'autoBoth', 'manualOnIncorrect', 'retryUntilRight')  # B1
    return doc


if __name__ == '__main__':
    main()
