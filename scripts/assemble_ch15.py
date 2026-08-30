#!/usr/bin/env python3
# STAGE 8.7 PROVENANCE NOTICE (2026-08-29): refuses to overwrite an existing
# chapt-15.json unless ALLOW_REGRESSIVE_REBUILD=1 after a full back-port of
# any hand repairs (PIPELINE-INSIGHTS 8.7).
"""assemble_ch15.py -- chapter 15 (First Aorist Verbs) from 15_1AOR.TBK.
Cohort 5I.

  assemble_ch15.py TBK font-map.json chapt-14.json wavlist_15.txt outdir

Chapter-specific wiring facts, all TBK-read:
  * First Aorist Indicative Parsing Drill: 12 items (0x6c0c7), voice x
    person/number. Unlike chapters 12 and 14 NO item is ambiguous -- the
    sigmatic first aorist distinguishes every cell -- so no answerAlt.
  * First Aorist Indicative Forms Drill: 10 items (0xd1a6c). THE A1b
    CASE: the SayWord table at 0xbd183 dispatches the AORIST clips
    (o_akoa, o_apoa, o_blea ...) and never the paired present clips
    (o_akop, o_apop ...), so the recording is the ANSWER. afterGuess,
    A1c gate applies (ledger row 136). This is the chapter whose read
    chapters 14 and 16 were extrapolated from; all three now confirmed.
    The A/B/C key reproduces all ten true first aorists, and item 10 is
    independently corroborated by the check literal "e@swsa" at 0x97cd2.
  * First Aorist Indicative Translation Drill: 29 items (0x70f65). The
    A/B/C key yields all 29 and agrees with the rail walk's blue
    options.
  * Scripture Memory Drill: 6 items on VERSE-POSITION clips o_sm2, 3, 5,
    6, 7, 8 (table at 0x70b03) -- the two instances of ton (positions 1
    and 4) are not drilled.
  * Ending Transformations is a NEW topic for this cohort, with four
    C3 in-chart popups (Palatals, Labials, Dentals, Liquids).
"""
# --------------------------------------------------------------------
# STAGE 8.7 SELF-CHECK (5I close).
#
# This assembler REPRODUCES the committed chapt-15.json exactly, so it is
# not blocked the way assemble_ch6/7/8.py are -- those cannot reproduce
# their committed state, and blocking is the only safe answer there.
# Blocking a script that works just forces hand edits forever.
#
# Instead: after building, DIFF against the committed file. If they
# differ, refuse to write and print the differing paths. That cannot
# silently revert a hand repair, and it does not stand in the way of a
# legitimate regeneration. ALLOW_REGRESSIVE_REBUILD=1 overrides, for the
# case where the difference IS the intended change.
# --------------------------------------------------------------------
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
from assemble_ch13 import tfield, tpool, positional_pool
from assemble_ch14 import text_off

A = 'chapt_15_'

TEACH_OFFSETS = [0x198ae, 0x1a6ee, 0x1aa98, 0x1c710, 0x22af4, 0x2312e,
                 0x246a0, 0x2507c, 0x25cce, 0x26d14, 0x27bf2, 0x2b14c]


def aud(name):
    return A + name


def lead_para(conv, raw, marker):
    """The topic's LEAD paragraph only, never its chart.

    para_blocks merges consecutive non-blank lines, so a panel whose
    chart rows follow the lead with no blank line between them collapses
    into ONE run-on block -- and slicing [:1] then keeps the whole panel.
    That is the swallowed-panel defect: the page printed the chart twice,
    once garbled as prose and once correctly as the structured sibling.
    Cut at the marker sentence instead.
    """
    blocks = para_blocks(conv, raw.split('\r\n'))
    if not blocks:
        raise SystemExit('STOP: lead_para found no blocks')
    text = blocks[0]['text']
    i = text.find(marker)
    if i < 0:
        raise SystemExit(f'STOP: lead marker {marker!r} not in {text[:90]!r}')
    return [{'type': 'para', 'text': text[:i + len(marker)].strip()}]


def marked(tbk, off):
    m = underline.marked_greek(tbk.data, text_off(tbk, off), tbk.greek_fmts)
    return m if m is not None else tfield(tbk, off)[0]


def need(tbk, *clips):
    for c in clips:
        if not tbk.has_clip(c):
            raise SystemExit(f'STOP: {c} not referenced in TBK')


# ---------------------------------------------------------------- paradigms
PN = ['1', '2', '3']
ACT = ['ἔλυσα', 'ἔλυσας', 'ἔλυσε(ν)', 'ἐλύσαμεν', 'ἐλύσατε', 'ἔλυσαν']
ACT_LEG = ['e@lusa', 'e@lusaj', 'e@luse(n)', 'e]lu<samen', 'e]lu<sate',
           'e@lusan']
ACT_CLIPS = ['o_luwa1s', 'o_luwa2s', 'o_luwa3s', 'o_luwa1p', 'o_luwa2p',
             'o_luwa3p']
ACT_GL = ['I loosed', 'You loosed', 'He/she/it loosed', 'We loosed',
          'You loosed', 'They loosed']
MID = ['ἐλυσάμην', 'ἐλύσω', 'ἐλύσατο', 'ἐλυσάμεθα', 'ἐλύσασθε', 'ἐλύσαντο']
MID_LEG = ['e]lusa<mhn', 'e]lu<sw', 'e]lu<sato', 'e]lusa<meqa', 'e]lu<sasqe',
           'e]lu<santo']
MID_CLIPS = ['o_luwm1s', 'o_luwm2s', 'o_luwm3s', 'o_luwm1p', 'o_luwm2p',
             'o_luwm3p']
# the original prints the reflexive tag on its own line under each gloss
MID_GL = ['I loosed\n(for myself)', 'You loosed\n(for yourself)',
          'He/she/it loosed\n(for himself/herself/itself)',
          'We loosed\n(for ourselves)', 'You loosed\n(for yourselves)',
          'They loosed\n(for themselves)']


def paradigm(tbk, off, pid, title, forms, legacy, clips, glosses, say,
             lower=False):
    raw = tfield(tbk, off)[0]
    flat = raw.replace(' ', '')
    for leg in legacy:
        if leg.replace(' ', '') not in flat:
            raise SystemExit(f'STOP: {leg!r} not in chart at {off:#x}')
    need(tbk, *clips)
    rows = []
    for i, label in enumerate(PN):
        cells = []
        for j in range(2):
            k = i + 3 * j
            gl = glosses[k]
            if lower and not gl.startswith('I '):
                # The Review and hint screens really do print "we took /
                # you took" lower case, but the English first-person
                # pronoun is never lower case in any source (E13).
                gl = gl[0].lower() + gl[1:]
            cells.append({'greek': forms[k], 'gloss': gl,
                          'audio': aud(clips[k])})
        rows.append({'label': label, 'cells': cells})
    blk = {'type': 'paradigm', 'id': pid, 'title': title,
           'columns': ['Singular', 'Plural'], 'rows': rows}
    if say:
        need(tbk, say)
        blk['sayWhole'] = {'label': 'Say Paradigm', 'audio': aud(say)}
    return blk


def act_chart(tbk, off, pid, say='o_luapar', lower=False):
    return paradigm(tbk, off, pid, 'First Aorist Active Indicative of λύω',
                    ACT, ACT_LEG, ACT_CLIPS, ACT_GL, say, lower=lower)


def mid_chart(tbk, off, pid, say='o_lumpar', lower=False):
    return paradigm(tbk, off, pid, 'First Aorist Middle Indicative of λύω',
                    MID, MID_LEG, MID_CLIPS, MID_GL, say, lower=lower)


# the ch15 Translation Drill's OWN hint contrasts AORIST against IMPERFECT;
# the imperfect clips are chapter 12's, duplicated into the CHAPT_15 pack by
# the ISO (Stage 6 self-containment).
IMPF_A = ['ἔλυον', 'ἔλυες', 'ἔλυε(ν)', 'ἐλύομεν', 'ἐλύετε', 'ἔλυον']
IMPF_A_LEG = ['e@luon', 'e@luej', 'e@lue(n)', 'e]lu<omen', 'e]lu<ete']
IMPF_A_CLIPS = ['l_as1', 'l_as2', 'l_as3', 'l_ap1', 'l_ap2', 'l_ap3']
IMPF_A_GL = ['I was loosing', 'You were loosing', 'He/she/it was loosing',
             'We were loosing', 'You were loosing', 'They were loosing']
IMPF_M = ['ἐλυόμην', 'ἐλύου', 'ἐλύετο', 'ἐλυόμεθα', 'ἐλύεσθε', 'ἐλύοντο']
IMPF_M_LEG = ['e]luo<mhn', 'e]lu<ou', 'e]lu<eto', 'e]luo<meqa', 'e]lu<esqe',
              'e]lu<onto']
IMPF_M_CLIPS = ['l_ms1', 'l_ms2', 'l_ms3', 'l_mp1', 'l_mp2', 'l_mp3']
IMPF_M_GL = ['I was being loosed', 'You were being loosed',
             'He/she/it was being loosed', 'We were being loosed',
             'You were being loosed', 'They were being loosed']


# ------------------------------------------------------------- aorist stems
# (present lemma, first aorist, gloss, present clip, aorist clip)
STEMS = [
    ('ἀκούω', 'ἤκουσα', 'I heard', 'o_akop', 'o_akoa'),
    ('ἀποστέλλω', 'ἀπέστειλα', 'I sent', 'o_apop', 'o_apoa'),
    ('βλέπω', 'ἔβλεψα', 'I saw', 'o_blep', 'o_blea'),
    ('γράφω', 'ἔγραψα', 'I wrote', 'o_grap', 'o_graa'),
    ('διδάσκω', 'ἐδίδαξα', 'I taught', 'o_didp', 'o_dida'),
    ('ἐγείρω', 'ἤγειρα', 'I rose', 'o_egep', 'o_egea'),
    ('κρίνω', 'ἔκρινα', 'I judged', 'o_krip', 'o_kria'),
    ('λύω', 'ἔλυσα', 'I loosed', 'o_luwp', 'o_luwa'),
    ('μένω', 'ἔμεινα', 'I remained', 'o_menp', 'o_mena'),
    ('σῴζω', 'ἔσωσα', 'I saved', 'o_swzp', 'o_swza'),
]
STEMS_BY_LEMMA = {s[0]: s for s in STEMS}


def stem_rows(tbk, conv, offsets, lo, hi):
    raw = ' '.join(tfield(tbk, o)[0] for o in offsets).replace(' ', '')
    conv_raw = nfc(conv(raw))
    rows = []
    for lemma, aor, gl, cp, ca in STEMS[lo:hi]:
        if nfc(aor) not in conv_raw:
            raise SystemExit(f'STOP: {aor!r} not in the stem list fields')
        need(tbk, cp, ca)
        rows.append({'greek': lemma, 'audio': aud(cp), 'gloss': f'({gl})',
                     'parts': [{'text': '\u2014'},
                               {'greek': aor, 'audio': aud(ca)}]})
    return rows


# ------------------------------------------------------------------- learn
ET_POPUPS = [('palatals', 'Palatals', 0x28b72),
             ('labials', 'Labials', 0x28d62),
             ('dentals', 'Dentals', 0x28f50),
             ('liquids', 'Liquids', 0x2913e)]


def english_concepts(tbk, conv):
    topics = []
    for tid, title, off in [('introduction', 'Introduction', 0x198ae),
                            ('comparison', 'Comparison with Greek', 0x1a6ee),
                            ('aoristComments', 'Aorist Comments', 0x1aa98)]:
        blocks = para_blocks(conv, marked(tbk, off).split('\r\n'))
        lead, items = [], []
        for b in blocks:
            m = re.match(r'^(\d)\)\s*(.*)$', b['text'], re.S)
            if m:
                items.append(m.group(2))
            else:
                lead.append(b)
        if items:
            blocks = lead + [{'type': 'numbered', 'gapBefore': True,
                              'items': items}]
        topics.append({'id': tid, 'title': title, 'content': blocks})
    joined = json.dumps(topics, ensure_ascii=False)
    for must in ['[[u]]laugh[[/u]]', '[[u]]laughed[[/u]]',
                 '[[u]]runs[[/u]]', '[[u]]ran[[/u]]',
                 '[[u]]historical present[[/u]]']:
        if must not in joined:
            raise SystemExit(f'STOP: EC underline missing: {must}')
    return {'id': 'c15_learn_english_concepts', 'type': 'contentAudio',
            'mode': 'topicPages', 'title': 'Learn English Concepts',
            'topics': topics}


def form_topic(tbk, conv):
    blocks = para_blocks(conv, marked(tbk, 0x22af4).split('\r\n'))
    if not blocks or 'augment' not in blocks[0]['text']:
        raise SystemExit(f'STOP: Form lead misparse: {blocks[:1]}')
    lead = blocks[:1]
    lead[0]['text'] = lead[0]['text'].replace('"e" augment', '"ε" augment')
    raw = tfield(tbk, 0x22af4)[0]
    for cand in ['e@lusaj', 'Tense formative']:
        if cand not in raw:
            raise SystemExit(f'STOP: Form fragment {cand!r} missing')
    need(tbk, 'o_luwa2s')
    formula = {'type': 'formula', 'align': 'center', 'gapBefore': True,
               'lines': [{'text': 'Augment + Verb stem + Tense formative'},
                         {'text': '+ Secondary endings'},
                         {'text': 'ε + λυ + σα + ς = ἔλυσας',
                          'audio': aud('o_luwa2s'), 'tapUnit': True},
                         {'text': 'Aug   Stem   Tense   Ending'}],
               '_note': ('D-48f2 shape: the Greek line is one tap unit '
                         'playing elusas (o_luwa2s, the form the formula '
                         'builds); the English lines are inert.')}
    return {'id': 'firstAoristForm', 'title': 'First Aorist Form',
            'content': lead + [formula]}


CONTRACTION = [('ε + α = η', 'ἤκουον', 'ἀκούω', 'l_ex1', 'l_ex2'),
               ('ε + ε = η', 'ἤγειρον', 'ἐγείρω', 'l_ex3', 'l_ex4'),
               ('ε + ο = ω', 'ὠρχούμην', 'ὀρχέομαι', 'l_ex5', 'l_ex6'),
               ('ε + αι = ῃ', 'ᾖρον', 'αἴρω', 'l_ex7', 'l_ex8'),
               ('ε + οι = ῳ', 'ᾠκοδόμουν', 'οἰκοδομέω', 'l_ex9', 'l_ex10')]


def augments_topic(tbk, conv):
    raw = tfield(tbk, 0x2312e)[0]
    if 'a + e = h' not in re.sub(r' {2,}', ' ', raw):
        raise SystemExit('STOP: contraction table missing from Augments')
    item1 = 'before consonants it is "ε"'
    item2 = ('before vowels the augment contracts with the vowel according '
             'to the following rules:\n'
             'α + ε = η      ε + ε = η      ο + ε = ω\n'
             'ει + ε = ῃ     αι + ε = ῃ     οι + ε = ῳ\n'
             'αυ + ε = ηυ    ευ + ε = ηυ')
    ex_conv = nfc(conv(tfield(tbk, 0x236aa)[0]))
    rows = []
    for rule, augf, lem, c1, c2 in CONTRACTION:
        for f in (augf, lem):
            if nfc(f) not in ex_conv:
                raise SystemExit(f'STOP: {f!r} not in Contraction Examples')
        need(tbk, c1, c2)
        rows.append({'greek': augf, 'audio': aud(c1), 'gloss': rule,
                     'parts': [{'greek': lem, 'audio': aud(c2)},
                               {'text': '+ ε augment'}]})
    examples = {'type': 'expander', 'label': 'Contraction Examples',
                'content': [{'type': 'greekRows', 'layout': 'contraction',
                             'rows': rows}],
                '_disclosure': ('C1: chart payload behind an in-text '
                                '"Examples" link -> accordion. Clips are '
                                'chapter 12\'s l_ex1-10, duplicated into the '
                                'CHAPT_15 pack by the ISO (Stage 6).')}
    cont = tfield(tbk, 0x246a0)[0].replace(' ', '')
    for leg in ['e]kba<llw', 'e]ce<balon', 'a]poktei<nw', 'a]pe<kteina']:
        if leg.replace(' ', '') not in cont:
            raise SystemExit(f'STOP: Augments (cont.) example {leg!r} missing')
    need(tbk, 'l_ex11', 'l_ex12', 'l_ex13', 'l_ex14')
    numbered = {'type': 'numbered', 'gapBefore': True,
                'items': [
                    {'text': item1},
                    {'text': item2, 'below': [examples]},
                    {'text': ('Compound verbs with prepositions ending in a '
                              'consonant: insert the augment between the '
                              'prepositional prefix and the verb stem.\n'
                              'ἐκβάλλω becomes ἐξέβαλον')},
                    {'text': ('Compound verbs with prepositions ending in a '
                              'vowel: the final vowel of the preposition is '
                              'dropped and the ε augment inserted in its '
                              'place.\nἀποκτείνω becomes ἀπέκτεινα')}],
                '_disclosure': 'C5: "Augments (cont.)" continues the list 1-4.'}
    return {'id': 'augments', 'title': 'Augments',
            'content': [{'type': 'para',
                         'text': 'Aorist Augments = Imperfect Augments'},
                        {'type': 'para',
                         'text': 'The augment is added in 4 ways:'},
                        numbered],
            'audioMap': {'ἐκβάλλω': aud('l_ex11'), 'ἐξέβαλον': aud('l_ex12'),
                         'ἀποκτείνω': aud('l_ex13'),
                         'ἀπέκτεινα': aud('l_ex14')},
            '_greek_note': ('Rule lines are bare font-Greek letters in the '
                            'TBK; converted as notation, not taps.')}


ET_ROWS = [('Palatals', '(κ, γ, χ) + σ  become  ξ', 'palatals',
            'διδάσκω  +  σα  =  ἐδίδαξα', 'o_didp', 'o_dida'),
           ('Labials', '(π, β, φ) + σ  become  ψ', 'labials',
            'βλέπω  +  σα  =  ἔβλεψα', 'o_blep', 'o_blea'),
           ('Dentals', '(τ, δ, θ) + σ  drops the dental', 'dentals',
            'πείθω  +  σα  =  ἔπεισα', 'o_peip', 'o_peia')]


def endings_topic(tbk, conv):
    raw = tfield(tbk, 0x26d14)[0]
    lead = lead_para(conv, marked(tbk, 0x26d14), 'for future tense verbs.')
    if 'future tense' not in lead[0]['text']:
        raise SystemExit(f'STOP: Ending Transformations lead: {lead}')
    rows = []
    for label, rule, pid, ex, cp, ca in ET_ROWS:
        need(tbk, cp, ca)
        rows.append({'label': label, 'popupRef': pid,
                     'parts': [{'text': rule}], 'note': ex,
                     'noteAudioMap': {ex.split('  +')[0]: aud(cp),
                                      ex.split('=  ')[-1].strip(): aud(ca)}})
    chart = {'type': 'greekRows', 'layout': 'endingTransformation',
             'gapBefore': True, 'rows': rows,
             '_disclosure': ('C3 in-chart triggers (3.3): Palatals, Labials '
                             'and Dentals are the hot text, each opening its '
                             'own popup; they keep their existing appearance '
                             '(blue in the original), no green underline.')}
    cont_blocks = para_blocks(conv, marked(tbk, 0x27bf2).split('\r\n'))
    if not cont_blocks or 'liquids' not in cont_blocks[0]['text']:
        raise SystemExit(f'STOP: Ending Transformations (cont.): {cont_blocks}')
    # E5: "liquids" is a C3 in-text trigger opening the fourth popup, and
    # the four consonant names beside it are Greek letters, not roman.
    t = cont_blocks[0]['text']
    if 'liquids (' not in t:
        raise SystemExit(f'STOP: liquids trigger not in {t[:80]!r}')
    cont_blocks[0]['text'] = t.replace(
        'liquids (', '[[link:liquids]]liquids[[/link]] (', 1)
    # E6: the two derivations are a CHART in the original, not prose. The
    # field runs them into the following paragraph, so they are lifted out
    # and each Greek form taps the clip the topic already carries.
    # take the trailing prose from the RAW field, not from para_blocks --
    # para_blocks squeezes runs of spaces and the original prints two
    # after the first sentence.
    raw_cont = ' '.join(l.strip() for l in
                        tfield(tbk, 0x27bf2)[0].split('\r\n') if l.strip())
    cut = 'These transformations'
    j = raw_cont.find(cut)
    if j < 0:
        raise SystemExit(f'STOP: derivation cut not in {raw_cont[:90]!r}')
    tail = raw_cont
    need(tbk, 'o_menp', 'o_mena', 'o_apop', 'o_apoa')
    rows = [{'parts': [{'greek': 'μένω', 'audio': aud('o_menp')},
                       {'text': '+'}, {'text': 'σα'}, {'text': '='},
                       {'greek': 'ἔμεινα', 'audio': aud('o_mena')}]},
            {'parts': [{'greek': 'ἀποστέλλω', 'audio': aud('o_apop')},
                       {'text': '+'}, {'text': 'σα'}, {'text': '='},
                       {'greek': 'ἀπέστειλα', 'audio': aud('o_apoa')}]}]
    cont_blocks = [cont_blocks[0],
                   {'type': 'greekRows', 'layout': 'derivation',
                    'gapBefore': True, 'rows': rows},
                   {'type': 'para', 'text': tail[j:].strip()}]
    for b in cont_blocks:
        b['gapBefore'] = True
    need(tbk, 'o_menp', 'o_mena', 'o_apop', 'o_apoa')
    return {'id': 'endingTransformations', 'title': 'Ending Transformations',
            'content': lead + [chart] + cont_blocks,
            'audioMap': {'μένω': aud('o_menp'), 'ἔμεινα': aud('o_mena'),
                         'ἀποστέλλω': aud('o_apop'),
                         'ἀπέστειλα': aud('o_apoa'),
                         'διδάσκω': aud('o_didp'), 'ἐδίδαξα': aud('o_dida'),
                         'βλέπω': aud('o_blep'), 'ἔβλεψα': aud('o_blea'),
                         'πείθω': aud('o_peip'), 'ἔπεισα': aud('o_peia')},
            '_example_note': ('The three worked examples on the rule chart '
                              'tap on BOTH sides -- didasko/edidaxa, '
                              'blepo/eblepsa, peitho/epeisa. peitho is not a '
                              'chapter-15 vocabulary word and appears only '
                              'here; its pair o_peip / o_peia ships for it.'),
            '_disclosure': ('C5: "(cont.)" is the same header with a '
                            'continuation marker; merged into one scroll. '
                            'The liquids link opens the fourth popup.'),
            '_typo_note': ('The original prints "ofen" for "often" in the '
                           'continuation; carried VERBATIM (typo policy A1 '
                           'covers scholar names only). VERIFY.')}


def et_popups(tbk, conv):
    out = []
    for pid, label, off in ET_POPUPS:
        body = para_blocks(conv, tfield(tbk, off)[0].split('\r\n'),
                           drop_title=False)
        if len(body) != 1:
            raise SystemExit(f'STOP: ET popup {pid} at {off:#x}: {body}')
        out.append({'id': pid, 'title': label, 'content': body})
    return out


def learn_first_aorist(tbk, conv):
    intro = para_blocks(conv, marked(tbk, 0x1c710).split('\r\n'))
    if len(intro) != 2:
        raise SystemExit(f'STOP: first aorist intro misparse: {intro}')
    need(tbk, 'o_luwp')
    stems = {'id': 'aoristStems', 'title': 'Aorist Stems of Verbs',
             'content': [
                 {'type': 'para',
                  'text': ('Here is a list of first aorist active indicative '
                           'forms of verbs already learned.')},
                 {'type': 'greekRows', 'layout': 'stemList', 'gapBefore': True,
                  'rows': stem_rows(tbk, conv, [0x2507c, 0x25cce], 0, 10),
                  '_disclosure': ('C5 (NIT-LOG N-6 standing method): the '
                                  'original pages the list five-and-five '
                                  'behind More/Back; STACKED here. Neither '
                                  'half carries a say-all recording, so no '
                                  'button is drawn.')}]}
    topics = [
        {'id': 'introduction', 'title': 'Introduction', 'content': intro},
        form_topic(tbk, conv),
        {'id': 'firstAoristActive', 'title': 'First Aorist Active',
         'titleAudio': aud('o_luwp'),
         'content': [act_chart(tbk, 0x1edfe, 'learnFirstAoristActive')]},
        {'id': 'firstAoristMiddle', 'title': 'First Aorist Middle',
         'titleAudio': aud('o_luwp'),
         'content': [mid_chart(tbk, 0x206f0, 'learnFirstAoristMiddle')]},
        augments_topic(tbk, conv),
        stems,
        endings_topic(tbk, conv)]
    return {'id': 'c15_learn_first_aorist', 'type': 'contentAudio',
            'mode': 'topicPages',
            'title': 'Learn First Aorist Indicative Verbs',
            'topics': topics, 'popups': et_popups(tbk, conv),
            'greekTaps': True}


# ------------------------------------------------------------------ drills
PN_BTN = {'s1': 'First Singular', 's2': 'Second Singular',
          's3': 'Third Singular', 'p1': 'First Plural',
          'p2': 'Second Plural', 'p3': 'Third Plural'}
VOICE = {'A': 'Active', 'M': 'Middle'}


def sanitized(data):
    tbl = bytes(c if 32 <= c < 127 else 32 for c in range(256))
    return data.translate(tbl).decode('latin-1')


def key_blocks(txt, lo, n, span=3400):
    seg = txt[lo:lo + span]
    i = seg.find('AnalyzeAnswer')
    if i < 0:
        raise SystemExit(f'STOP: no AnalyzeAnswer near {lo:#x}')
    blk = seg[i:i + span]
    pos = [(int(m.group(1)), m.start())
           for m in re.finditer(r'=\s?(\d{1,2}) ', blk)]
    seq, want = [], 1
    for num, st in pos:
        if num == want:
            seq.append((num, st))
            want += 1
        if want > n:
            break
    if len(seq) != n:
        raise SystemExit(f'STOP: key script {lo:#x}: {len(seq)}/{n}')
    return {num: blk[st:(seq[j + 1][1] if j + 1 < len(seq) else st + 250)]
            for j, (num, st) in enumerate(seq)}


def parsing_drill(tbk, conv, txt):
    n = 12
    prompts = [sq(conv(x)) for x in tpool(tbk, 0x8a35c, n, 'parsing prompts')]
    trans = [sq(x) for x in tpool(tbk, 0x8a7c8, n, 'parsing translations')]
    keys = key_blocks(txt, 0x6c0c7, n)
    disp = dispatch(tbk.data, 0x6d000, 0x6d400)
    cells = dict(zip(ACT + MID, ACT_CLIPS + MID_CLIPS))
    items = []
    for i in range(1, n + 1):
        blk = keys[i]
        btns = []
        for b in re.findall(r'=\s?([sp]\d)\b', blk):
            if b not in btns:
                btns.append(b)
        voices = [VOICE[v] for v in re.findall(r'=\s?([AM])\b', blk)
                  if v in VOICE]
        if len(set(voices)) != 1 or len(btns) != 1:
            raise SystemExit(f'STOP: parsing item {i} key {blk[:70]!r}')
        g = prompts[i - 1]
        clip = disp.get(i) or cells.get(g)
        if not clip:
            raise SystemExit(f'STOP: parsing item {i}: no clip for {g!r}')
        need(tbk, clip)
        items.append({'greek': g, 'translate': trans[i - 1],
                      'answer': [voices[0], PN_BTN[btns[0]]],
                      'audio': aud(clip),
                      'hintRef': 'firstAoristParadigms'})
    return {
        'id': 'c15_drill_parsing', 'type': 'select', 'mode': 'twoStageGrid',
        'title': 'First Aorist Indicative Parsing Drill',
        'instructions': 'Click on the voice, then person and number',
        'promptIsGreek': True, 'options': 'static',
        'optionStages': [
            {'label': 'Voice', 'values': ['Active', 'Middle']},
            {'label': 'Person / Number',
             'values': ['First Singular', 'First Plural', 'Second Singular',
                        'Second Plural', 'Third Singular', 'Third Plural'],
             'optionGroups': [2, 2, 2]}],
        'revealButtons': [{'label': 'Translate', 'field': 'translate'}],
        'items': items, 'scored': True,
        'ui': stepper_ui(hint='firstAoristParadigms', translate=True),
        '_stage_note': ('Twelve items (0x6c0c7). EVERY item has exactly ONE '
                        'accepted cell -- unlike the ch12 and ch14 parsing '
                        'drills, the sigmatic first aorist distinguishes all '
                        'twelve, so no answerAlt is emitted and the '
                        'assembler FAILS if a key names two.'),
        'audioTiming': 'beforeGuess',
        'answerPolicy': {'advanceClass': 'manualOnIncorrect',
                         'attemptsPerItem': 1}}


def forms_drill(tbk, conv, txt):
    n = 10
    lemmas = [sq(conv(x)) for x in tpool(tbk, 0xaa454, n, 'forms lemmas')]
    glosses = [sq(x) for x in tpool(tbk, 0xaf1f8, n, 'forms glosses')]
    cols = [[sq(conv(x)) for x in tpool(tbk, o, n, 'forms col')]
            for o in (0xac0f4, 0xac900, 0xacece)]
    keys = key_blocks(txt, 0xd1a6c, n)
    disp = dispatch(tbk.data, 0xbd100, 0xbd400)
    items = []
    for i in range(1, n + 1):
        letters = re.findall(r'=\s?([ABC])\b', keys[i])
        if not letters:
            raise SystemExit(f'STOP: forms item {i} key {keys[i][:70]!r}')
        ans = cols['ABC'.index(letters[0])][i - 1]
        lemma, aor, gl, cp, ca = STEMS_BY_LEMMA[lemmas[i - 1]]
        clip = disp.get(i)
        if clip != ca:
            raise SystemExit(f'STOP: forms item {i}: dispatch {clip!r}, '
                             f'expected the AORIST clip {ca!r} (A1b)')
        if nfc(ans) != nfc(aor):
            raise SystemExit(f'STOP: forms item {i}: key gives {ans!r} but '
                             f'the chapter\'s stem list gives {aor!r}')
        need(tbk, clip)
        items.append({'greek': lemmas[i - 1], 'gloss': glosses[i - 1],
                      'options': [c[i - 1] for c in cols], 'answer': ans,
                      'audio': aud(clip)})
    lit = tfield(tbk, 0x97cd2)[0].strip()
    if nfc(conv(lit)) != nfc(items[9]['answer']):
        raise SystemExit(f'STOP: check literal {lit!r} disagrees with item 10')
    return {
        'id': 'c15_drill_forms', 'type': 'select', 'mode': 'fullOptionGrid',
        'title': 'First Aorist Indicative Forms Drill',
        'instructions': ('Click on the correct matching first aorist '
                         'indicative first person singular form'),
        'promptIsGreek': True, 'promptGloss': True, 'options': 'perItem',
        'optionsAreGreek': True, 'optionLayout': 'stack1col',
        'items': items, 'scored': True,
        'ui': stepper_ui(hint='firstAoristForms'),
        '_shape_note': ('Prompt panel shows the PRESENT lemma and its gloss; '
                        'three GREEK options stacked. The A/B/C key at '
                        '0xd1a6c is cross-checked against the chapter\'s own '
                        'Aorist Stems list -- all ten agree -- and item 10 '
                        'is independently corroborated by the check literal '
                        '"e@swsa" at 0x97cd2.'),
        '_audio_note': ('A1b, CONFIRMED: the SayWord table at 0xbd183 '
                        'dispatches the AORIST clips (o_akoa, o_apoa, '
                        'o_blea ...), never the paired present clips '
                        '(o_akop, o_apop ...), so the recording is the '
                        'ANSWER. afterGuess, and the A1c gate applies: no '
                        'prompt tap, Pronounce disabled until answered. '
                        'THIS is the read chapters 14 and 16 were '
                        'extrapolated from. Ledger row 136.'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'manualOnIncorrect',
                         'attemptsPerItem': 1}}


def translation_drill(tbk, conv, txt):
    n = 29
    greek = [sq(conv(x)) for x in tpool(tbk, 0x112d66, n, 'td greek')]
    cols = [[sq(x) for x in tpool(tbk, o, n, 'td col')]
            for o in (0x114d08, 0x115766, 0x115f96)]
    refs = [sq(x) for x in tpool(tbk, 0x11667b, n, 'td refs')]
    line2 = positional_pool(tbk, 0x116a34, n, 'td line 2')
    keys = key_blocks(txt, 0x70f65, n, span=3600)
    disp = dispatch(tbk.data, 0x72100, 0x73700)
    items = []
    for i in range(1, n + 1):
        letters = re.findall(r'=\s?([ABC])\b', keys[i])
        if not letters:
            raise SystemExit(f'STOP: td item {i}: no key letter')
        clip = disp.get(i)
        if clip != f'o_td{i}':
            raise SystemExit(f'STOP: td item {i} dispatch {clip!r}')
        need(tbk, clip)
        it = {'greek': greek[i - 1], 'ref': refs[i - 1],
              'options': [c[i - 1] for c in cols],
              'answer': cols['ABC'.index(letters[0])][i - 1],
              'audio': aud(clip), 'hintRef': 'aoristVsImperfect'}
        if line2[i - 1].strip():
            it['greek2'] = sq(conv(line2[i - 1]))
        items.append(it)
    return {
        'id': 'c15_drill_translation', 'type': 'select',
        'mode': 'fullOptionGrid',
        'title': 'First Aorist Indicative Translation Drill',
        'instructions': 'Click on the correct translation',
        'promptIsGreek': True, 'options': 'perItem',
        'optionLayout': 'stack1col', 'items': items, 'scored': True,
        'ui': stepper_ui(hint='aoristVsImperfect'),
        '_answer_note': ('TWENTY-NINE items (0x70f65). The A/B/C key script '
                         'yields all 29 and agrees with the BLUE option on '
                         'ch15railwalk.pdf p14-p22. Second Greek lines from '
                         'the positional pool at 0x116a34, which carries a '
                         'LEADING blank so entry i+1 is item i.'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'manualOnIncorrect',
                         'attemptsPerItem': 1}}


# ------------------------------------------------------------------- vocab
VOC_KEYS = ['allos', 'artos', 'dei', 'exousia', 'heteros', 'eti',
            'ophthalmos', 'teknon', 'topos', 'phos']
VOC_FREQ = [155, 97, 101, 100, 98, 93, 100, 99, 94, 73]
VOC_CLIPS = [f'o_voc{i}' for i in range(1, 11)]


def vocab_pools(tbk, conv):
    lex = [sq(conv(x)) for x in tpool(tbk, 0x14d78, 10, 'vocab lexical')]
    card = [sq(x) for x in tpool(tbk, 0x14fe8, 10, 'flashcard glosses')]
    drill = [sq(x) for x in tpool(tbk, 0x9441a, 10, 'drill glosses')]
    spell = [sq(x) for x in tpool(tbk, 0xa0344, 10, 'speller prompts')]
    gken = [sq(conv(x)) for x in tpool(tbk, 0xb8af0, 10, 'gk->en prompts')]
    # the Gk->En pool is in a DIFFERENT order (artos first, then allos);
    # realign it to the lexical order so every pool is index-comparable.
    heads = [re.sub(r',.*$', '', l) for l in lex]
    order = []
    for g in gken:
        if g not in heads:
            raise SystemExit(f'STOP: gk->en head {g!r} not a lemma head')
        order.append(heads.index(g))
    if sorted(order) != list(range(10)):
        raise SystemExit(f'STOP: gk->en pool is not a permutation: {order}')
    drill_aligned = [None] * 10
    for pos, src in enumerate(order):
        drill_aligned[src] = drill[pos]
    return lex, heads, card, drill_aligned, spell, gken, order


def vocab_drills(tbk, conv):
    lex, heads, card, drill, spell, gken, order = vocab_pools(tbk, conv)
    need(tbk, *VOC_CLIPS)
    common = {'scored': True, 'ui': score_ui(), 'poolKind': 'vocabulary',
              'answerPolicy': {'advanceClass': 'autoBoth',
                               'attemptsPerItem': 1}}
    gk = {'id': 'c15_drill_vocab_gk_en', 'type': 'select',
          'mode': 'fullOptionGrid',
          'title': 'Vocabulary:  Greek to English Drill',
          'instructions': 'Click on the matching word',
          'promptIsGreek': True, 'options': 'static',
          'optionValues': [drill[i] for i in range(10)],
          'items': [{'greek': heads[i], 'answer': drill[i],
                     'audio': aud(VOC_CLIPS[i])} for i in range(10)],
          'audioTiming': 'beforeGuess',
          '_pool_note': ('The original\'s Gk->En prompt pool (0xb8af0) runs '
                         'artos before allos while every other pool runs '
                         'alphabetically; realigned at assembly so all five '
                         'pools are index-comparable.'), **common}
    en = {'id': 'c15_drill_vocab_en_gk', 'type': 'select',
          'mode': 'fullOptionGrid',
          'title': 'Vocabulary: English to Greek Drill',
          'instructions': 'Click on the matching word',
          'options': 'static', 'optionsAreGreek': True, 'optionValues': heads,
          'items': [{'prompt': drill[i], 'answer': heads[i],
                     'audio': aud(VOC_CLIPS[i])} for i in range(10)],
          'audioTiming': 'afterGuess', **common}
    return gk, en


def vocab_speller(tbk, conv):
    lex, heads, card, drill, spell, gken, order = vocab_pools(tbk, conv)
    spell_aligned = [None] * 10
    for pos, src in enumerate(order):
        spell_aligned[src] = spell[pos]
    return {
        'id': 'c15_ex_vocab_speller', 'type': 'spell',
        'title': 'Vocabulary Spelling Exercise',
        'instructions': ('Click letters below or use your keyboard to spell '
                         'it out.'),
        'prompt': 'item', 'promptLabel': 'English Meaning',
        'accentsOptional': True, 'spellerTilesRef': 'chapt_1',
        'items': [{'prompt': spell_aligned[i], 'answer': heads[i],
                   'audio': aud(VOC_CLIPS[i])} for i in range(10)],
        'ui': {'fields': ['English Meaning', 'Spell Greek Word'],
               'buttons': ['Pronounce', 'Previous', 'Score', 'Next',
                           'Check Answer', 'Greek Keyboard'],
               'checkboxes': ['Show Answer', 'With Accents',
                              'Pronounce Each Exercise'],
               'defaults': {'pronounceEach': True}},
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


# ---------------------------------------------------------------- spellers
def aorist_speller(tbk, conv, parsing):
    n = 12
    prompts = [sq(x) for x in tpool(tbk, 0x7ed96, n, 'speller prompts')]
    items = [{'prompt': p, 'answer': src['greek'].replace('(ν)', ''),
              'audio': src['audio']}
             for p, src in zip(prompts, parsing['items'])]
    for it in items:
        if it['answer'] == 'ἔλυσε':
            it['answerAlt'] = 'ἔλυσεν'
            it['_alt_note'] = 'Movable nu: either spelling is accepted (D-33).'
    return {
        'id': 'c15_ex_speller', 'type': 'spell',
        'title': 'First Aorist Indicative Spelling Exercise',
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
        '_answer_note': ('The 12 answers ARE the Parsing Drill pool '
                         '(0x8a35c) in order. The speller pool DISAMBIGUATES '
                         'items 11 and 12, which the drill pool prints '
                         'identically as "you loosed": here they read '
                         '"you (sg.) loosed" and "you (pl.) loosed".'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


def forms_speller(tbk, conv, forms):
    n = 10
    lemmas = [sq(conv(x)) for x in tpool(tbk, 0x96870, n, 'forms speller')]
    items = []
    for i, (lm, src) in enumerate(zip(lemmas, forms['items']), 1):
        if lm != src['greek']:
            raise SystemExit(f'STOP: forms speller {i}: {lm!r} != '
                             f'{src["greek"]!r}')
        items.append({'prompt': lm, 'answer': src['answer'],
                      'audio': src['audio']})
    return {
        'id': 'c15_ex_speller_forms', 'type': 'spell',
        'title': 'Forms Spelling Exercise',
        'instructions': ('Click letters below or use your keyboard to spell '
                         'the first aorist first person singular form.'),
        'prompt': 'item', 'promptLabel': 'Present Tense',
        'promptIsGreek': True,
        'accentsOptional': True, 'spellerTilesRef': 'chapt_1', 'items': items,
        'ui': {'fields': ['Present Tense', 'Aorist Form'],
               'buttons': ['Pronounce', 'Previous', 'Score', 'Next',
                           'Check Answer', 'Greek Keyboard'],
               'checkboxes': ['Show Answer', 'With Accents',
                              'Pronounce Each Exercise'],
               'defaults': {'pronounceEach': True}},
        '_title_note': ('The page and the Exercise Menu both print "Forms '
                        'Spelling Exercise" -- NOT "First Aorist Forms '
                        'Spelling Exercise", which is what ch14\'s parallel '
                        'exercise is called. Verbatim.'),
        '_audio_note': ('A1b again: the prompt is the PRESENT lemma and the '
                        'clip is the aorist ANSWER, so afterGuess. The A1c '
                        'gate does NOT apply -- spellers are excluded by '
                        'ruling. Ledger row 142.'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


# --------------------------------------------------------------- scripture
VERSE = ['τὸν', 'ἄρτον', 'ἡμῶν', 'τὸν', 'ἐπιούσιον', 'δὸς', 'ἡμῖν',
         'σήμερον·']
VERSE_GLOSS = ['the', 'bread', 'our', 'the', 'daily portion', 'give', 'us',
               'today']
SM_OPTS = ['bread', 'our', 'daily portion', 'give', 'us', 'today']


def learn_scripture(tbk, conv):
    raw = tfield(tbk, 0xd5512)[0]
    for leg in ['a@rton', 'e]piou<sion', 'sh<meron']:
        if leg not in raw:
            raise SystemExit(f'STOP: {leg} not in interlinear 0xd5512')
    words = []
    for k, (w, gl) in enumerate(zip(VERSE, VERSE_GLOSS), 1):
        need(tbk, f'o_sm{k}')
        words.append({'greek': w, 'gloss': gl, 'audio': aud(f'o_sm{k}')})
    need(tbk, 'o_mt6_11')
    return {'id': 'c15_learn_scripture', 'type': 'contentAudio',
            'mode': 'interlinearVerse', 'title': 'Learn Scripture Memory',
            'reference': 'Mat 6:11', 'words': words,
            'sayWhole': {'label': 'Say Whole Verse',
                         'audio': aud('o_mt6_11')}}


def scripture_drill(tbk, conv):
    prompts = [sq(conv(x)) for x in tpool(tbk, 0x617ee, 6, 'sm prompts')]
    disp = dispatch(tbk.data, 0x70a00, 0x70d00)
    items = []
    for i, g in enumerate(prompts, 1):
        base = g.rstrip('·.,')
        clip = disp.get(i)
        if not clip or not clip.startswith('o_sm'):
            raise SystemExit(f'STOP: SM item {i} dispatch {clip!r}')
        pos = int(clip[4:])
        if VERSE[pos - 1].rstrip('·') != base:
            raise SystemExit(f'STOP: SM prompt {g!r} is not verse word {pos}')
        need(tbk, clip)
        items.append({'greek': base, 'answer': VERSE_GLOSS[pos - 1],
                      'audio': aud(clip)})
    return {'id': 'c15_drill_scripture_memory', 'type': 'select',
            'mode': 'fullOptionGrid', 'title': 'Scripture Memory Drill',
            'instructions': 'Click on the matching word',
            'promptIsGreek': True, 'options': 'static',
            'optionValues': SM_OPTS, 'items': items, 'scored': True,
            'ui': score_ui(),
            '_audio_note': ('Six prompts on VERSE-POSITION clips o_sm2, 3, '
                            '5, 6, 7, 8 (table at 0x70b03) -- the two '
                            'instances of ton, verse positions 1 and 4, are '
                            'not drilled. Stage 8.2: read, never sequenced.'),
            'audioTiming': 'beforeGuess',
            'answerPolicy': {'advanceClass': 'autoBoth',
                             'attemptsPerItem': 1}}


def scripture_speller(tbk, conv):
    hint = sq(' '.join(l.strip() for l in
                       tfield(tbk, 0xfc1f0)[0].split('\r\n') if l.strip()))
    if hint != 'give us today our daily portion':
        raise SystemExit(f'STOP: verse hint {hint!r}')
    return {
        'id': 'c15_ex_scripture_speller', 'type': 'spellVerse',
        'title': 'Scripture Memory Spelling Exercise',
        'instructions': 'Enter all of Mat 6:11 then click "Check Answer"',
        'reference': 'Mat 6:11', 'answerWords': VERSE, 'translation': hint,
        'accentsOptional': True, 'punctuationOptional': True,
        'audio': aud('o_mt6_11'), 'spellerTilesRef': 'chapt_1',
        'ui': {'fields': ['Spell Greek'],
               'buttons': ['Pronounce', 'Check Answer', 'Greek Keyboard',
                           'Restart Exercise'],
               'checkboxes': ['Show Answer', 'With Accents'],
               '_reveal_note': 'RULES C8 / D-30.'},
        '_repeat_note': '"Repeat This Exercise" NOT ported (D-42 retired).',
        '_punct_note': 'The ano teleia after semeron is U+00B7 (NFC).',
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


# ------------------------------------------------------------- objectives
def objectives(tbk):
    raw = tfield(tbk, 0x2b14c)[0].split('\r\n')
    items, cur = [], None
    for l in raw:
        s = l.strip()
        m = re.match(r'^(\d)\)\s*(.*)$', s)
        if m:
            if cur:
                items.append(cur)
            cur = m.group(2)
        elif cur is not None and s and 'You will be able' not in s:
            cur += ' ' + s
    if cur:
        items.append(cur)
    items = [sq(x) for x in items[:6]]
    if len(items) != 6 or 'Mat 6:11' not in items[5]:
        raise SystemExit(f'STOP: objectives: {items}')
    return items


def bibliography(tbk):
    raw = tfield(tbk, 0xfa28)[0].split('\r\n')
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
        if len(entries) == 3 and cur and '109-112' in cur:
            entries.append(sq(cur))
            cur = None
            break
    if len(entries) != 4:
        raise SystemExit(f'STOP: expected 4 bibliography entries, '
                         f'got {len(entries)}')
    return {'id': 'c15_learn_bibliography', 'type': 'contentAudio',
            'mode': 'textPage', 'title': 'Learn Bibliography',
            'content': [{'type': 'biblist', 'items': entries}]}


# ------------------------------------------------------------ quick review
def qr_vocab(tbk, conv):
    raw = tfield(tbk, 0xdcbd0)[0]
    for g in ['other (155', 'yet, still (93)']:
        if g.replace(' ', '') not in raw.replace(' ', ''):
            raise SystemExit(f'STOP: chart gloss {g!r} not in 0xdcbd0')
    need(tbk, 'o_vocl15')
    return {'id': 'c15_qr_vocab', 'type': 'contentAudio',
            'mode': 'reviewVocab', 'title': 'Review Vocabulary Chart',
            'pool': 'senses', 'columns': 2, 'showNtFreq': True,
            'footnote': ('The number after the translation is the number of '
                         'times the word occurs in the New Testament.'),
            'playAll': {'label': 'Say Whole List', 'audio': aud('o_vocl15')},
            '_verify_note': ('The chart prints "other (155 )" for allos with '
                             'a space before the bracket; carried verbatim '
                             'in the printed gloss, stripped for ntFreq.')}


def qr_pages(tbk, conv):
    return [
        {'id': 'c15_qr_paradigms', 'type': 'contentAudio',
         'mode': 'paradigmChart',
         'title': 'Review First Aorist Indicative Paradigms',
         'paradigms': [
             dict(act_chart(tbk, 0x44c4e, 'qrFirstAoristActive', lower=True),
                  name='First Aorist Active'),
             dict(mid_chart(tbk, 0x467e0, 'qrFirstAoristMiddle'),
                  name='First Aorist Middle')],
         '_disclosure': ('C9 (4.6): the original pages Active/Middle behind '
                         'a toggle; stacked, one Say Paradigm per chart.')},
        {'id': 'c15_qr_forms', 'type': 'contentAudio', 'mode': 'textPage',
         'title': 'Review First Aorist Indicative Forms',
         'content': [
             {'type': 'heading',
              'text': 'First Aorist Indicative Stems of Verbs'},
             {'type': 'para',
              'text': ('Here is a list of first aorist indicative first '
                       'person singular forms of verbs already learned.')},
             {'type': 'greekRows', 'layout': 'stemList', 'gapBefore': True,
              'rows': stem_rows(tbk, conv, [0x82b0], 0, 5)},
             {'type': 'greekRows', 'layout': 'stemList',
              'rows': stem_rows(tbk, conv, [0x8ffc], 5, 10)}],
         '_disclosure': ('C9 + NIT-LOG N-6 standing method: the original '
                         'pages the list five-and-five behind More/Back. '
                         'STACKED here in the original\'s own split, no '
                         'pager. Neither half carries a say-all recording, '
                         'so no button is drawn.')}]


def qr_scriptures(ch14, learn_scr):
    out = []
    for oid in ('c14_qr_scripture_mat633a', 'c14_qr_scripture_mat633b',
                'c14_qr_scripture_mat69', 'c14_qr_scripture_mat610a',
                'c14_qr_scripture_mat610c'):
        src = [a for a in ch14['quickReview'] if a['id'] == oid]
        if not src:
            raise SystemExit(f'STOP: {oid} not in chapt-14.json')
        src = src[0]
        words = [{'greek': w['greek'], 'gloss': w['gloss'],
                  'audio': w['audio'].replace('chapt_14_', A)}
                 for w in src['words']]
        out.append({'id': oid.replace('c14_', 'c15_'), 'type': 'contentAudio',
                    'mode': 'interlinearVerse', 'title': src['title'],
                    'reference': src['reference'], 'words': words,
                    'sayWhole': {'label': src['sayWhole']['label'],
                                 'audio': src['sayWhole']['audio']
                                 .replace('chapt_14_', A)}})
    out.append({'id': 'c15_qr_scripture_mat611', 'type': 'contentAudio',
                'mode': 'interlinearVerse',
                'title': 'Review Scripture Memory:  Mat 6:11',
                'reference': 'Mat 6:11', 'words': learn_scr['words'],
                'sayWhole': learn_scr['sayWhole']})
    return out


def build_lexicon(tbk, conv):
    lex, heads, card, drill, spell, gken, order = vocab_pools(tbk, conv)
    lemmas = {}
    for i, k in enumerate(VOC_KEYS):
        lemmas[k] = {'greek': heads[i], 'translit': k, 'lexicalForm': lex[i],
                     'gloss': card[i], 'glossShort': card[i],
                     'audio': aud(VOC_CLIPS[i]), 'ntFreq': VOC_FREQ[i],
                     'senses': [{'greek': heads[i], 'caseTag': None,
                                 'glossShort': drill[i],
                                 'audio': aud(VOC_CLIPS[i])}]}
    return {'_comment': (
        'Chapter 15 lexicon, assembled from 15_1AOR.TBK (cohort 5I). Ten '
        'lemmas, no case splits. gloss/glossShort = flashcard pool '
        '(0x14fe8); senses[].glossShort = drill pool (0x9441a), REALIGNED '
        'from the original\'s artos-first ordering; ntFreq from the Review '
        'chart (0xdcbd0).'),
        'lemmas': lemmas, 'exampleWords': {}}


# -------------------------------------------------------------------- main
def main():
    committed = (sys.argv[6] if len(sys.argv) > 6 else
                 os.path.join(os.path.dirname(os.path.abspath(__file__)),
                              '..', 'src', 'data', 'chapt-15.json'))
    tbk_path, fontmap_path, ch14_path, wavlist_path, outdir = sys.argv[1:6]
    outfile = os.path.join(outdir, 'chapt-15.json')
    if os.path.exists(outfile) and not os.environ.get(
            'ALLOW_REGRESSIVE_REBUILD'):
        raise SystemExit('STOP: Stage 8.7 -- chapt-15.json exists.')
    shipped = {l.strip().lower().rsplit('.', 1)[0]
               for l in open(wavlist_path) if l.strip()}
    tbk = Tbk(tbk_path)
    tbk.greek_fmts = underline.vote_greek_fmts(
        tbk.data, [text_off(tbk, o) for o in TEACH_OFFSETS])
    conv = make_conv11(json.load(open(fontmap_path, encoding='utf-8')))
    ch14 = json.load(open(ch14_path, encoding='utf-8'))
    txt = sanitized(tbk.data)

    learn_scr = learn_scripture(tbk, conv)
    parsing = parsing_drill(tbk, conv, txt)
    forms = forms_drill(tbk, conv, txt)
    gk, en = vocab_drills(tbk, conv)
    ch = {
        '_comment': (
            'Chapter 15 (First Aorist Verbs), assembled from 15_1AOR.TBK + '
            'CHAPT_15 audio + ch15railwalk.pdf under PIPELINE-INSIGHTS-v3 '
            'Stage 8 and DISCLOSURE-RULES. Behavior fields per '
            'DRILLBEHAVIORLEDGER.csv rows 135-144 (CONFIRMED 2026-08-29).'),
        'id': 'chapt_15', 'number': 15, 'title': 'First Aorist Verbs',
        'objectivesPreamble': 'You will be able to:',
        'objectives': objectives(tbk), 'vocab': VOC_KEYS,
        'learn': [], 'drill': [], 'exercise': [], 'quickReview': [],
        'feedback': ch14['feedback'], 'sequence': [],
        '_audioVerify': (
            'Every verb carries a PAIR: o_<verb>p is the present lemma and '
            'o_<verb>a the first aorist. The Forms Drill and the Forms '
            'Speller both dispatch the AORIST half (A1b, table 0xbd183).')}
    ch['learn'] = [
        {'id': 'c15_learn_objectives', 'type': 'contentAudio',
         'mode': 'objectivesPage', 'title': 'Learn Chapter Objectives',
         'instructions': ''},
        english_concepts(tbk, conv), learn_first_aorist(tbk, conv),
        {'id': 'c15_learn_vocab', 'type': 'contentAudio', 'mode': 'flashcard',
         'title': 'Learn Vocabulary', 'pool': 'senses'},
        learn_scr, bibliography(tbk)]
    ch['drill'] = [parsing, forms, translation_drill(tbk, conv, txt), gk, en,
                   scripture_drill(tbk, conv)]
    ch['exercise'] = [aorist_speller(tbk, conv, parsing),
                      forms_speller(tbk, conv, forms),
                      vocab_speller(tbk, conv), scripture_speller(tbk, conv)]
    ch['quickReview'] = ([qr_vocab(tbk, conv)] + qr_pages(tbk, conv)
                         + qr_scriptures(ch14, learn_scr))
    ch['sequence'] = [
        'c15_learn_objectives', 'c15_learn_english_concepts',
        'c15_learn_first_aorist', 'c15_drill_parsing', 'c15_drill_forms',
        'c15_drill_translation', 'c15_ex_speller', 'c15_ex_speller_forms',
        'c15_learn_vocab', 'c15_drill_vocab_gk_en', 'c15_drill_vocab_en_gk',
        'c15_ex_vocab_speller', 'c15_learn_scripture',
        'c15_drill_scripture_memory', 'c15_ex_scripture_speller',
        'c15_qr_vocab', 'c15_qr_paradigms', 'c15_qr_forms',
        'c15_qr_scripture_mat633a', 'c15_qr_scripture_mat633b',
        'c15_qr_scripture_mat69', 'c15_qr_scripture_mat610a',
        'c15_qr_scripture_mat610c', 'c15_qr_scripture_mat611',
        'c15_learn_bibliography']
    ch['_sequence_note'] = ('Rail order from ch15railwalk.pdf, cross-checked '
                            'against the Drill / Exercise / Quick Review '
                            'menus on its last page.')
    hint_act = act_chart(tbk, 0x8aab8, 'hintFirstAoristActive', say=None)
    hint_mid = mid_chart(tbk, 0x8aab8, 'hintFirstAoristMiddle', say=None)
    hint_act['title'] = 'Aorist Active of λύω'
    hint_mid['title'] = 'Aorist Middle of λύω'
    ch['hintCharts'] = {
        'firstAoristParadigms': {
            'charts': [hint_act, hint_mid],
            '_note': ('Field 0x8aab8 holds BOTH charts on one hint screen '
                      '(4.7 source fidelity: the hint\'s titles read '
                      '"Aorist", not "First Aorist", and carry no say-all). '
                      'Two charts -> the 4.1 toggle; the differing word is '
                      'Greek-free here (Active/Middle), so the label is that '
                      'pair, not More/Back.'),
            'switch': 'named', 'switchLabels': ['Active', 'Middle']},
        'firstAoristForms': {
            'charts': [{'type': 'paradigm', 'id': 'hintFirstAoristForms',
                        'title': 'First Aorist Verb Forms',
                        'columns': ['Present', 'First Aorist'],
                        'rows': [{'label': gl,
                                  'cells': [{'greek': lemma, 'audio': aud(cp)},
                                            {'greek': aor, 'audio': aud(ca)}]}
                                 for lemma, aor, gl, cp, ca in STEMS]}],
            '_note': ('The Forms Drill hint (0xaf4ac) prints the whole verb '
                      'list as a two-column present/aorist table.')},
        'aoristVsImperfect': {
            'charts': [
                paradigm(tbk, 0x11703e, 'hintTdAoristActive',
                         'Aorist Active of λύω', ACT, ACT_LEG, ACT_CLIPS,
                         ACT_GL, None),
                paradigm(tbk, 0x11703e, 'hintTdAoristMiddle',
                         'Aorist Middle of λύω', MID, MID_LEG, MID_CLIPS,
                         MID_GL, None),
                paradigm(tbk, 0x118df2, 'hintTdImperfectActive',
                         'Imperfect Active Indicative of λύω', IMPF_A,
                         IMPF_A_LEG, IMPF_A_CLIPS, IMPF_A_GL, None),
                paradigm(tbk, 0x118df2, 'hintTdImperfectMiddlePassive',
                         'Imperfect Middle/Passive Indicative of λύω', IMPF_M,
                         IMPF_M_LEG, IMPF_M_CLIPS, IMPF_M_GL, None)],
            'switch': 'moreBack',
            '_note': ('DISCLOSURE 4.7, transcribed from the Translation '
                      'Drill\'s OWN hint screens rather than assumed to be '
                      'the Parsing Drill\'s: fields 0x11703e (Aorist Active '
                      '+ Aorist Middle) and 0x118df2 (Imperfect Active + '
                      'Imperfect Middle/Passive). FOUR charts, so 4.2 '
                      'Back/More as a centred pair -- the point of the hint '
                      'is the AORIST-versus-IMPERFECT contrast while '
                      'translating, which the Parsing Drill\'s hint does '
                      'not show. The imperfect clips are chapter 12\'s, '
                      'duplicated into this pack by the ISO.')}}
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
                collect(v)
        elif isinstance(o, list):
            for v in o:
                collect(v)
    collect(ch)
    for cid in sorted(ids):
        base = cid[len(A):]
        if base.lower() not in shipped:
            raise SystemExit(f'STOP: emitted clip {cid} not in CHAPT_15 pack')
        if not tbk.has_clip(base) and not re.match(r'[jklmn]_', base):
            raise SystemExit(f'STOP: emitted clip {cid} not referenced in TBK')
    errs = audit(ch)
    if errs:
        raise SystemExit('STOP: self-audit failed:\n' + '\n'.join(errs))
    ch = post_patches(ch)
    _self_check(ch, committed)
    os.makedirs(outdir, exist_ok=True)
    with open(outfile, 'w', encoding='utf-8') as f:
        json.dump(ch, f, ensure_ascii=False, indent=1)
    with open(os.path.join(outdir, 'lexicon-chapt15.json'), 'w',
              encoding='utf-8') as f:
        json.dump(build_lexicon(tbk, conv), f, ensure_ascii=False, indent=1)
    print(f'chapter 15: {len(ids)} distinct clips, '
          f'{len(ch["sequence"])} rail pages, '
          f'{sum(len(a.get("items", [])) for a in ch["drill"] + ch["exercise"])}'
          ' scored items. OK.')


def post_patches(doc):
    # RULED 2026-08-29 (Nathanael): the positional second-line pool supplies
    # a continuation that round 21's hand move lost, and the rail walk shows
    # that prompt on two lines with the first ending mid-clause. The
    # recovered line stands; nothing to patch.
    sp = [a for a in doc['exercise']
          if a['id'] == 'c15_ex_scripture_speller'][0]
    assert 'Repeat This Exercise' not in sp['ui']['checkboxes']   # D-42
    assert 'Major Hint' not in sp['ui']['buttons']                # C8 / D-30
    fd = [a for a in doc['drill'] if a['id'] == 'c15_drill_forms'][0]
    assert fd['audioTiming'] == 'afterGuess'                      # A1b
    for a in doc['drill'] + doc['exercise']:
        assert a['answerPolicy']['advanceClass'] in (
            'none', 'autoBoth', 'manualOnIncorrect', 'retryUntilRight')
    return doc




def _self_check(built, committed_path):
    """Refuse to write output that differs from the committed chapter."""
    import os
    if os.environ.get('ALLOW_REGRESSIVE_REBUILD') == '1':
        return
    if not os.path.exists(committed_path):
        print(f'NOTE: no committed file at {committed_path}; '
              'self-check skipped.')
        return

    def flat(o, p='', acc=None):
        if acc is None:
            acc = {}
        if isinstance(o, dict):
            for k, v in o.items():
                flat(v, f'{p}/{k}', acc)
        elif isinstance(o, list):
            for i, v in enumerate(o):
                flat(v, f'{p}/{i}', acc)
        else:
            acc[p] = o
        return acc
    with open(committed_path, encoding='utf-8') as f:
        want = flat(json.load(f))
    got = flat(built)
    bad = ([k for k in set(got) & set(want) if got[k] != want[k]]
           + sorted(set(got) ^ set(want)))
    bad = [k for k in bad if not k.split('/')[-1].startswith('_')]
    if bad:
        raise SystemExit(
            'STOP (Stage 8.7 self-check): output differs from the committed '
            f'chapt-15.json at {len(bad)} path(s). The committed file may '
            'carry a hand repair this script does not reproduce -- absorb it '
            'into post_patches() first. Set ALLOW_REGRESSIVE_REBUILD=1 only '
            'if the difference IS the intended change.\n  '
            + '\n  '.join(sorted(bad)[:20]))


if __name__ == '__main__':
    main()
