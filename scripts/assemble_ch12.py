#!/usr/bin/env python3
# STAGE 8.7 PROVENANCE NOTICE (2026-08-25): once chapt-12.json has been
# hand-repaired in the repo this assembler is provenance only; it refuses
# to overwrite an existing output unless ALLOW_REGRESSIVE_REBUILD=1 after a
# full back-port (PIPELINE-INSIGHTS 8.7). post_patches() re-applies
# ratified divergences.
"""assemble_ch12.py -- chapter 12 (Imperfect Verbs) from 12_IMPF.TBK.
Cohort 5H.

  assemble_ch12.py TBK font-map.json chapt-11.json wavlist_12.txt outdir

chapt-11.json (the file assemble_ch11.py just wrote) supplies the five
carried Quick Review verses, re-keyed to the CHAPT_12 copies.

Chapter-specific wiring facts, all TBK-read:
  * Parsing Drill keys (voice x person/number) come from the page's
    AnalyzeAnswer script; eluon and eichon accept BOTH First Singular
    and Third Plural (answerAlt). Item 23's SayWord entry is BLANK
    (the ch10 item-18 class); its form eluomen is item 5's, so l_ap1.
  * Augment Drill (NEW SHAPE): the correct option column per item is
    read from the AnalyzeAnswer script (A/B/C); clips l_ad1-19 are the
    AUGMENTED ANSWER forms, so audioTiming is afterGuess (ledger row
    108, CONFIRMED 2026-08-25; DRILL-BEHAVIOR-RULES A1b).
  * Translation Drill: 20 items (the table's 21st entry names a clip
    that never shipped); answers are the rail walk's blue options.
  * Hints are form-dependent on the Parsing Drill (D-46): luo forms ->
    Active + Middle/Passive of luo; eimi/echo forms -> Imperfect of
    eimi + Imperfect of echo (field 0x370c6, lowercase glosses).
"""
import json
import os
import re
import sys
import unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import underline
from assemble_ch9 import (Tbk, para_blocks, conv_mixed, dash, sq, stepper_ui,
                          score_ui, audit)
from assemble_ch11 import (make_conv11, nfc, bare, dispatch, literal_set)

A = 'chapt_12_'
TEACH_OFFSETS = [0x2161e, 0x26a6c, 0x27004, 0x27686, 0x2a6f2, 0x1edd2,
                 0x1fbbe, 0x301ca, 0x25086, 0x2ae8c]


def aud(name):
    return A + name


def need(tbk, *clips):
    for c in clips:
        if not tbk.has_clip(c):
            raise SystemExit(f'STOP: {c} not in TBK')


# ------------------------------------------------------------- paradigms
PN = ['1.', '2.', '3.']
ACT = ['ἔλυον', 'ἔλυες', 'ἔλυε(ν)', 'ἐλύομεν', 'ἐλύετε', 'ἔλυον']
ACT_LEG = ['e@luon', 'e@luej', 'e@lue(n)', 'e]lu<omen', 'e]lu<ete']
ACT_CLIPS = ['l_as1', 'l_as2', 'l_as3', 'l_ap1', 'l_ap2', 'l_ap3']
ACT_GL = ['I was loosing', 'You were loosing', 'He/she/it was loosing',
          'We were loosing', 'You were loosing', 'They were loosing']
MP = ['ἐλυόμην', 'ἐλύου', 'ἐλύετο', 'ἐλυόμεθα', 'ἐλύεσθε', 'ἐλύοντο']
MP_LEG = ['e]luo<mhn', 'e]lu<ou', 'e]lu<eto', 'e]luo<meqa', 'e]lu<esqe',
          'e]lu<onto']
MP_CLIPS = ['l_ms1', 'l_ms2', 'l_ms3', 'l_mp1', 'l_mp2', 'l_mp3']
MP_GL = ['I was being loosed', 'You were being loosed',
         'He/she/it was being loosed', 'We were being loosed',
         'You were being loosed', 'They were being loosed']
EIMI = ['ἤμην', 'ἦς', 'ἦν', 'ἦμεν', 'ἦτε', 'ἦσαν']
EIMI_LEG = ['h@mhn', 'h#j', 'h#n', 'h#men', 'h#te', 'h#san']
EIMI_CLIPS = ['l_eis1', 'l_eis2', 'l_eis3', 'l_eip1', 'l_eip2', 'l_eip3']
EIMI_GL = ['I was', 'You were', 'He/she/it was', 'We were', 'You were',
           'They were']
ECHO = ['εἶχον', 'εἶχες', 'εἶχε(ν)', 'εἴχομεν', 'εἴχετε', 'εἶχον']
ECHO_LEG = ['ei#xon', 'ei#xej', 'ei#xe(n)', 'ei@xomen', 'ei@xete']
ECHO_CLIPS = ['l_eixs1', 'l_eixs2', 'l_eixs3', 'l_eixp1', 'l_eixp2',
              'l_eixp3']
ECHO_GL = ['I was having', 'You were having', 'He/she/it was having',
           'We were having', 'You were having', 'They were having']
MP_NOTE = ('The above paradigm is translated using the passive voice. The '
           'middle uses exactly the same forms, which would be translated'
           '\u2014I was loosing (for myself), you were loosing (for '
           'yourself), he was loosing (for himself), etc. Context will '
           'determine whether the form should be translated middle or '
           'passive.')
ECHO_NOTE = ('Note: This is an exception. The augment is a contraction of '
             'ε + ε = ει. Another exceptional augmented form is θέλω which '
             'takes an η becoming ἤθελεν in Mat 18:30.')


def paradigm(tbk, off, pid, title, forms, legacy, clips, glosses, say,
             lower=False, note=None):
    raw = tbk.field(off)
    for leg in legacy:
        if leg not in raw:
            raise SystemExit(f'STOP: {leg} not in chart at {off:#x}')
    need(tbk, *clips)
    rows = []
    for i, label in enumerate(PN):
        cells = []
        for j in range(2):
            k = i + 3 * j
            gl = glosses[k]
            if lower:
                gl = gl[0].lower() + gl[1:]
            cells.append({'greek': forms[k], 'gloss': gl,
                          'audio': aud(clips[k])})
        rows.append({'label': label, 'cells': cells})
    blk = {'type': 'paradigm', 'id': pid, 'title': title,
           'columns': ['Singular', 'Plural'], 'rows': rows}
    if say:
        need(tbk, say)
        blk['sayWhole'] = {'label': 'Say Paradigm', 'audio': aud(say)}
    if note:
        blk['note'] = note
    return blk


def act_chart(tbk, off, pid, title='Imperfect Active Indicative of λύω'):
    return paradigm(tbk, off, pid, title, ACT, ACT_LEG, ACT_CLIPS, ACT_GL,
                    'l_ipfpar')


def mp_chart(tbk, off, pid, note=None):
    return paradigm(tbk, off, pid, 'Imperfect Middle/Passive Indicative of λύω',
                    MP, MP_LEG, MP_CLIPS, MP_GL, 'l_ipmpar', note=note)


# ---------------------------------------------------------------- learn
def english_concepts(tbk, conv):
    topics = []
    for tid, title, off in [('introduction', 'Introduction', 0x1edd2),
                            ('comparison', 'Comparison with Greek', 0x1fbbe)]:
        blocks = para_blocks(conv, tbk.marked(off).split('\r\n'))
        topics.append({'id': tid, 'title': title, 'content': blocks})
    joined = json.dumps(topics, ensure_ascii=False)
    for must in ['[[u]]drove[[/u]]', '[[u]]was driving[[/u]]',
                 '[[u]]aorist[[/u]]', '[[u]]imperfect[[/u]]']:
        if must not in joined:
            raise SystemExit(f'STOP: EC underline missing: {must}')
    return {'id': 'c12_learn_english_concepts', 'type': 'contentAudio',
            'mode': 'topicPages', 'title': 'Learn English Concepts',
            'topics': topics}


def form_topic(tbk, conv):
    raw = tbk.field(0x26a6c).split('\r\n')
    lead = para_blocks(conv, raw[:7])
    if len(lead) != 1 or 'augment' not in lead[0]['text']:
        raise SystemExit('STOP: Form lead misparse')
    lead[0]['text'] = lead[0]['text'].replace('an "e"', 'an "ε"')
    if 'e  +  lu  +  o  + n  =  e@luon' not in tbk.field(0x26a6c):
        raise SystemExit('STOP: Form formula missing')
    need(tbk, 'l_as1')
    formula = {'type': 'formula', 'align': 'center', 'gapBefore': True,
               'lines': [{'text': 'Augment + Verb stem + Connecting vowel'},
                         {'text': '+ Secondary active endings'},
                         {'text': 'ε + λυ + ο + ν = ἔλυον', 'audio': aud('l_as1'),
                          'tapUnit': True},
                         {'text': 'Aug   Stem   CV   Ending'}],
               '_note': ('D-48f2 shape: the Greek line is one tap unit '
                         'playing eluon (l_as1, the page\'s SayWord as1 '
                         'entry); the English lines are inert. The rail walk '
                         'shows hands on e, lu and eluon.')}
    cont_raw = tbk.field(0x27004).split('\r\n')
    cont = [{'type': 'para', 'text': sq(cont_raw[2]), 'gapBefore': True},
            {'type': 'para', 'text': 'ο before μ and ν\nε elsewhere',
             'flush': True,
             '_disclosure': ('C5: "Form (cont.)" is the same header with a '
                             'continuation marker; merged. VERIFY-5H (l).')}]
    if cont[0]['text'] != 'The connecting vowel will be:':
        raise SystemExit('STOP: Form (cont.) misparse')
    return {'id': 'form', 'title': 'Form', 'content': lead + [formula] + cont}


def augments_topic(tbk, conv):
    raw = tbk.field(0x27686)
    lines = raw.split('\r\n')
    if 'a + e = h      e + e = h      o + e = w' not in raw:
        raise SystemExit('STOP: contraction table missing')
    item1 = 'before consonants it is "ε"'
    item2 = ('before vowels the augment contracts with the vowel according '
             'to the following rules:\n'
             'α + ε = η      ε + ε = η      ο + ε = ω\n'
             'ει + ε = ῃ     αι + ε = ῃ     οι + ε = ῳ\n'
             'αυ + ε = ηυ    ευ + ε = ηυ')
    # Contraction Examples (field 0x29538): rule / augmented form / lemma
    ex_raw = [l for l in tbk.field(0x29538).split('\r\n')[2:7]]
    ex = [('ε + α = η', 'ἤκουον', 'ἀκούω', 'l_ex1', 'l_ex2'),
          ('ε + ε = η', 'ἤγειρον', 'ἐγείρω', 'l_ex3', 'l_ex4'),
          ('ε + ο = ω', 'ὠρχούμην', 'ὀρχέομαι', 'l_ex5', 'l_ex6'),
          ('ε + αι = ῃ', 'ᾖρον', 'αἴρω', 'l_ex7', 'l_ex8'),
          ('ε + οι = ῳ', 'ᾠκοδόμουν', 'οἰκοδομέω', 'l_ex9', 'l_ex10')]
    rows = []
    for (rule, aug, lem, c1, c2), line in zip(ex, ex_raw):
        cl = nfc(conv(line))
        for f in (aug, lem):
            if nfc(f) not in cl:
                raise SystemExit(f'STOP: {f!r} not in Contraction Examples line')
        need(tbk, c1, c2)
        rows.append({'greek': aug, 'audio': aud(c1),
                     'gloss': f'{rule}',
                     'parts': [{'greek': lem, 'audio': aud(c2)},
                               {'text': '+ ε augment'}]})
    examples = {'type': 'expander', 'label': 'Contraction Examples',
                'content': [{'type': 'greekRows', 'layout': 'contraction',
                             'rows': rows,
                             '_layout_note': ('Each row prints rule, '
                                              'augmented form, lemma + '
                                              '"ε augment"; both Greek '
                                              'forms tap (hand cursors, '
                                              'rail walk p5).')}],
                '_disclosure': ('C1: chart payload behind an in-text '
                                '"Examples" link (§6.1) -> accordion, '
                                '§3.5 title. VERIFY-5H (l).')}
    cont_raw = tbk.field(0x2a6f2)
    if 'e]kba<llw   becomes   e]ceba<llon' not in cont_raw or \
            'a]poktei<nw   becomes   a]pe<kteinon' not in cont_raw:
        raise SystemExit('STOP: Augments (cont.) examples missing')
    need(tbk, 'l_ex11', 'l_ex12', 'l_ex13', 'l_ex14')
    item3 = ('Compound verbs with prepositions ending in a consonant: insert '
             'the augment between the prepositional prefix and the verb '
             'stem.\nἐκβάλλω becomes ἐξεβάλλον')
    item4 = ('Compound verbs with prepositions ending in a vowel: the final '
             'vowel of the preposition is dropped and the ε augment inserted '
             'in its place.\nἀποκτείνω becomes ἀπέκτεινον')
    for phrase in ['Compound verbs with prepositions', 'ending in a consonant',
                   'insert the', 'the final vowel of', 'inserted in its place']:
        if phrase not in cont_raw:
            raise SystemExit(f'STOP: Augments (cont.) text {phrase!r} missing')
    numbered = {'type': 'numbered', 'gapBefore': True,
                'items': [{'text': item1},
                          {'text': item2, 'below': [examples]},
                          {'text': item3}, {'text': item4}],
                '_disclosure': ('C5: "Augments (cont.)" continues the same '
                                'numbered list 1-4 (the Augment Drill hint '
                                'prints all four on one screen). VERIFY-5H (l).')}
    return {'id': 'augments', 'title': 'Augments',
            'content': [{'type': 'para', 'text': 'The augment is added in 4 ways:'},
                        numbered],
            'audioMap': {'ἐκβάλλω': aud('l_ex11'), 'ἐξεβάλλον': aud('l_ex12'),
                         'ἀποκτείνω': aud('l_ex13'), 'ἀπέκτεινον': aud('l_ex14')},
            '_greek_note': ('Rule lines are bare font-Greek letters in the '
                            'TBK (a,e,h,o,w,ei,ai,oi,au,eu); converted as '
                            'notation, not taps.')}


def learn_imperfect(tbk, conv):
    intro = para_blocks(conv, tbk.marked(0x2161e).split('\r\n'))
    if len(intro) != 3:
        raise SystemExit('STOP: imperfect intro misparse')
    need(tbk, 'l_luw', 'l_eimi', 'l_exw', 'l_thelw', 'l_nthel')
    topics = [
        {'id': 'introduction', 'title': 'Introduction', 'content': intro},
        form_topic(tbk, conv),
        {'id': 'imperfectActive', 'title': 'Imperfect Active',
         'titleAudio': aud('l_luw'),
         'content': [act_chart(tbk, 0x38fda, 'imperfectActiveParadigm')]},
        {'id': 'imperfectMiddlePassive', 'title': 'Imperfect Middle/Passive',
         'titleAudio': aud('l_luw'),
         'content': [mp_chart(tbk, 0x25086, 'imperfectMiddlePassiveParadigm',
                              note=MP_NOTE)]},
        augments_topic(tbk, conv),
        {'id': 'eimiImperfect', 'title': 'εἰμί Imperfect',
         'titleAudio': aud('l_eimi'),
         'content': [paradigm(tbk, 0xd857, 'imperfectEimiParadigm',
                              'εἰμί Imperfect Indicative', EIMI, EIMI_LEG,
                              EIMI_CLIPS, EIMI_GL, 'l_eimpar')]},
        {'id': 'echoImperfect', 'title': 'ἔχω Imperfect',
         'titleAudio': aud('l_exw'),
         'content': [paradigm(tbk, 0x2ae8c, 'imperfectEchoParadigm',
                              'ἔχω Imperfect Indicative', ECHO, ECHO_LEG,
                              ECHO_CLIPS, ECHO_GL, 'l_eixpar', note=ECHO_NOTE)],
         'audioMap': {'θέλω': aud('l_thelw'), 'ἤθελεν': aud('l_nthel')}}]
    if 'This is an exception' not in tbk.field(0x2ae8c):
        raise SystemExit('STOP: echo note missing')
    return {'id': 'c12_learn_imperfect', 'type': 'contentAudio',
            'mode': 'topicPages', 'title': 'Learn Imperfect Indicative Verbs',
            'topics': topics, 'greekTaps': True,
            '_title_note': ('Chart-title Greek taps: luw -> l_luw (D-40), '
                            'eimi -> l_eimi, exw -> l_exw (TBK title '
                            'dispatch tokens luw/eimi/exw on each page).')}


# ----------------------------------------------------------------- drills
def parse_keys12(data, lo, hi, n):
    txt = re.sub(rb'[^\x20-\x7e]+', b' ', data[lo:hi]).decode()
    pos = [(int(m.group(1)), m.start())
           for m in re.finditer(r'= ?(\d{1,2}) ', txt)]
    seq, want = [], 1
    for num, st in pos:
        if num == want:
            seq.append((num, st))
            want += 1
        if want > n:
            break
    if len(seq) != n:
        raise SystemExit(f'STOP: key script at {lo:#x}: {len(seq)}/{n}')
    out = {}
    for i, (num, st) in enumerate(seq):
        end = seq[i + 1][1] if i + 1 < len(seq) else st + 400
        blk = txt[st:end]
        btns = sorted(set(re.findall(r'=\s?([sp]\d)', blk)),
                      key=lambda b: (b[0] != 's', b))
        letters = re.findall(r'=([A-Z])\b', blk)
        out[num] = (btns, letters)
    return out


PN_BTN = {'s1': 'First Singular', 's2': 'Second Singular',
          's3': 'Third Singular', 'p1': 'First Plural',
          'p2': 'Second Plural', 'p3': 'Third Plural'}
VOICE = {'A': 'Active', 'M': 'Middle/Passive'}
LUO_FORMS = {bare(f.replace('(ν)', '')) for f in ACT + MP} | \
            {bare(f.replace('(ν)', 'ν')) for f in ACT}


def parsing_drill(tbk, conv):
    prompts = [sq(conv(x)) for x in tbk.pool(0x36bec, 23, 'parsing prompts')]
    trans = [sq(x) for x in tbk.pool(0x3a61a, 23, 'parsing translations')]
    keys = parse_keys12(tbk.data, 0xab000, 0xacb9e, 23)
    disp = dispatch(tbk.data, 0xacb9e, 0xad100)
    all_clips = dict(zip(ACT + MP + EIMI + ECHO,
                         ACT_CLIPS + MP_CLIPS + EIMI_CLIPS + ECHO_CLIPS))
    items = []
    for i in range(1, 24):
        btns, letters = keys[i]
        voices = [VOICE[l] for l in letters if l in VOICE]
        if len(voices) != 1 or not btns:
            raise SystemExit(f'STOP: parsing item {i} key {keys[i]}')
        combos = [[voices[0], PN_BTN[b]] for b in btns]
        clip = disp.get(i)
        note = None
        if not clip:
            g = prompts[i - 1]
            clip = all_clips[g] if g in all_clips else all_clips[g + '(ν)']
            note = ('SayWord entry BLANK in the original (the ch10 item-18 '
                    f'class); the form is item 5\'s, wired to {clip}.')
        need(tbk, clip)
        it = {'greek': prompts[i - 1], 'translate': trans[i - 1],
              'answer': combos[0], 'audio': aud(clip),
              'hintRef': ('luoParadigms' if bare(prompts[i - 1]) in LUO_FORMS
                          else 'eimiEchoParadigms')}
        if len(combos) > 1:
            it['answerAlt'] = combos[1:]
            it['_ambiguous_note'] = ('The original\'s key accepts both; ACCEPT '
                                     'ANY of answer + answerAlt.')
        if note:
            it['_audio_note'] = note
        items.append(it)
    return {
        'id': 'c12_drill_parsing', 'type': 'select', 'mode': 'twoStageGrid',
        'title': 'Imperfect Indicative Parsing Drill',
        'instructions': 'Click on the voice, then person and number',
        'promptIsGreek': True, 'options': 'static',
        'optionStages': [
            {'label': 'Voice', 'values': ['Active', 'Middle/Passive']},
            {'label': 'Person / Number',
             'values': ['First Singular', 'First Plural', 'Second Singular',
                        'Second Plural', 'Third Singular', 'Third Plural'],
             'optionGroups': [2, 2, 2]}],
        'items': items, 'scored': True,
        'ui': stepper_ui(hint='luoParadigms', translate=True),
        '_stage_note': ('Keys (voice x person/number, with BOTH readings of '
                        'eluon/eichon) read from the AnalyzeAnswer script at '
                        '0xab000-0xacb9e; clips from the SayWord table at '
                        '0xacb9e. Hint is FORM-DEPENDENT per item (D-46): '
                        'luo forms -> luoParadigms, eimi/echo forms -> '
                        'eimiEchoParadigms. Menu prints "Imperfect Parsing '
                        'Indicative Drill"; the page title is used.'),
        'audioTiming': 'beforeGuess',
        'answerPolicy': {'advanceClass': 'manualOnIncorrect',
                         'attemptsPerItem': 1}}


def augment_drill(tbk, conv):
    lemmas = [sq(conv(x)) for x in tbk.pool(0x10a830, 19, 'augment lemmas')]
    glosses = [sq(x) for x in tbk.pool(0x10f834, 19, 'augment glosses')]
    refs = [sq(x) for x in tbk.pool(0x10d72a, 19, 'augment refs')]
    cols = [[sq(conv(x)) for x in tbk.pool(o, 19, 'augment col')]
            for o in (0x10c4d2, 0x10ccdc, 0x10d2ac)]
    txt = re.sub(rb'[^\x20-\x7e]+', b' ', tbk.data[0xa3000:0xa4728]).decode()
    key = {}
    for m in re.finditer(r'= (\d{1,2}) +([ABC]) 6', txt):
        key.setdefault(int(m.group(1)), 'ABC'.index(m.group(2)))
    if sorted(key) != list(range(1, 20)):
        raise SystemExit(f'STOP: augment key incomplete: {sorted(key)}')
    disp = dispatch(tbk.data, 0xa4706, 0xa4b00)
    items = []
    for i in range(19):
        opts = [c[i] for c in cols]
        ans = opts[key[i + 1]]
        clip = disp.get(i + 1)
        if clip != f'l_ad{i+1}':
            raise SystemExit(f'STOP: augment item {i+1} dispatch {clip!r}')
        need(tbk, clip)
        items.append({'greek': lemmas[i], 'gloss': glosses[i], 'ref': refs[i],
                      'options': opts, 'answer': ans, 'audio': aud(clip)})
    if items[0]['answer'] != 'ἐγίνωσκεν' or items[0]['ref'] != 'Mat 1:25':
        raise SystemExit('STOP: augment item 1 does not match the rail walk')
    return {
        'id': 'c12_drill_augment', 'type': 'select', 'mode': 'fullOptionGrid',
        'title': 'Augment Drill',
        'instructions': 'Click on the correctly augmented verb',
        'promptIsGreek': True, 'promptGloss': True, 'options': 'perItem',
        'optionsAreGreek': True, 'optionLayout': 'stack1col',
        'items': items, 'scored': True,
        'ui': {'buttons': ['Previous', 'Next', 'Pronounce', 'Hint', 'Score'],
               'checkboxes': ['Pronounce Each Drill'],
               'defaults': {'pronounceEach': True}, 'liveScore': True},
        'hint': {'title': 'The augment is added in 4 ways:',
                 'content': augment_hint(tbk, conv)},
        '_shape_note': ('NEW DRILL SHAPE (5H-SPEC1 §3.5): prompt panel shows '
                        'the present lemma (Greek), its gloss and a '
                        'reference; three GREEK options stacked. The correct '
                        'column per item (A/B/C) is read from the '
                        'AnalyzeAnswer script at 0xa3000-0xa4728.'),
        '_audio_note': ('l_ad1-19 record the AUGMENTED ANSWER form, not the '
                        'lemma shown (Nathanael, DOSBox 2026-08-25). The clip '
                        'plays AFTER the guess; the prompt lemma is not a tap '
                        'and Pronounce is disabled until the item is answered '
                        '(5H-SPEC1 §3.5, proposed D-50).'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'manualOnIncorrect',
                         'attemptsPerItem': 1}}


def augment_hint(tbk, conv):
    raw = tbk.field(0x10fae6)
    if 'The augment is added in 4 ways' not in raw:
        raise SystemExit('STOP: augment hint field')
    return [{'type': 'numbered', 'items': [
        'before consonants it is "ε"',
        ('before vowels the augment contracts with the vowel according to '
         'the following rules:\nα + ε = η      ε + ε = η      ο + ε = ω\n'
         'ει + ε = ῃ     αι + ε = ῃ     οι + ε = ῳ\nαυ + ε = ηυ    ευ + ε = ηυ'),
        ('Compound verbs with prepositions ending in a consonant: insert the '
         'augment between the prepositional prefix and the verb stem.\n'
         'ἐκβάλλω becomes ἐξεβάλλον'),
        ('Compound verbs with prepositions ending in a vowel: the final vowel '
         'of the preposition is dropped and the ε augment inserted in its '
         'place.\nἀποκτείνω becomes ἀπέκτεινον')],
        '_source': 'Transcribed from the hint\'s own field 0x10fae6 (§4.7).'}]


TD_ANSWERS = [  # ch12railwalk.pdf p9-p14, blue option per item
    'and he was not knowing her', 'then Jerusalem was going out to him',
    'and they were being baptized by him in the Jordan river',
    'they were saying to his disciples',
    'he was teaching them in their synagogue',
    'because they were regarding him as a prophet',
    'and the crowds were saying, "This is the prophet, Jesus"',
    'now there were seven brothers with us',
    'Jesus was going away from the temple',
    'but he was speaking concerning the temple of his body',
    'for he was knowing what was in man',
    'Now there was a man of the Pharisees',
    'therefore Jesus was saying to them, "Truly, truly I say to you"',
    'So they were saying to him, "Where is your father?"',
    'then he was staying two days in the place where he was',
    'and she was coming to him',
    'the disciples were looking at one another',
    'they were not having sin',
    'and because of the testimony which they were having',
    'and he was having two horns like a lamb, and he was speaking as a dragon']
TD_LAST = ['and they were having two horns like a lamb, and they were speaking as a dragon',
           'and he was having two horns like a lamb, and he was speaking as a dragon',
           'and we were having two horns like a lamb, and we were speaking as a dragon']
TD_G2 = {7: 'Ἰησοῦς', 10: 'αὐτοῦ', 13: 'λέγω ὑμῖν', 20: 'ὡς δράκων'}


def translation_drill(tbk, conv):
    n = 20
    greek = [sq(conv(x)) for x in tbk.pool(0x78002, n, 'td greek')]
    last = 'καὶ εἶχεν κέρατα δύο ὅμοια ἀρνίῳ καὶ ἐλάλει'
    if not greek[-1].startswith(last):
        raise SystemExit(f'STOP: td last prompt {greek[-1]!r}')
    greek[-1] = last
    g2_lines = [l.strip() for l in tbk.field(0x7b38c).split('\r\n')]
    cols = [[sq(x.split('\n')[0]) for x in tbk.pool(o, n, 'td col')]
            for o in (0x79d04, 0x7a52c, 0x7ab26)]
    for k, want in enumerate(TD_LAST):
        if not cols[k][n - 1].startswith(want):
            raise SystemExit(f'STOP: td last option {cols[k][n-1]!r}')
        cols[k][n - 1] = want
    refs = [sq(x) for x in tbk.pool(0x7afc2, n, 'td refs')]
    disp = dispatch(tbk.data, 0x9ede0, 0x9f300)
    items = []
    for i in range(n):
        opts = [c[i] for c in cols]
        if TD_ANSWERS[i] not in opts:
            raise SystemExit(f'STOP: td item {i+1}: {TD_ANSWERS[i]!r} not in {opts}')
        clip = disp.get(i + 1)
        if clip != f'l_td{i+1}':
            raise SystemExit(f'STOP: td item {i+1} dispatch {clip!r}')
        need(tbk, clip)
        it = {'greek': greek[i], 'ref': refs[i], 'options': opts,
              'answer': TD_ANSWERS[i], 'audio': aud(clip)}
        if (i + 1) in TD_G2:
            # the second-line pool is indexed at (item - 7): entries sit at
            # lines 0, 3, 6, 13 for items 7, 10, 13, 20 (rail walk p10-p14)
            got = sq(conv(g2_lines[i - 6]))
            if got.startswith(TD_G2[i + 1]):
                got = TD_G2[i + 1]  # stale tail on the last entry
            if got != TD_G2[i + 1]:
                raise SystemExit(f'STOP: td item {i+1} line 2 {got!r}')
            it['greek2'] = got
        items.append(it)
    return {
        'id': 'c12_drill_translation', 'type': 'select',
        'mode': 'fullOptionGrid',
        'title': 'Imperfect Indicative Translation Drill',
        'instructions': 'Click on the correct translation',
        'promptIsGreek': True, 'options': 'perItem',
        'optionLayout': 'stack1col', 'items': items, 'scored': True,
        'ui': stepper_ui(hint='luoParadigms'),
        '_answer_note': ('Answers are the BLUE options on ch12railwalk.pdf '
                         'p9-p14, all 20 items captured. The SayWord table '
                         'at 0x9ede0 lists a 21st entry (l_td21) for a clip '
                         'that never shipped; ignored. Second Greek lines '
                         '(items 7, 10, 13, 20) from the positional pool at '
                         '0x7b38c, indexed at item minus 7 in the original\'s script.'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'manualOnIncorrect',
                         'attemptsPerItem': 1}}


# ----------------------------------------------------------------- vocab
VOC_KEYS = ['apothnesko', 'ekei', 'heos', 'idou', 'hina', 'ioannes', 'men',
            'holos', 'hote', 'sun']
VOC_FREQ = [111, 105, 146, 200, 663, 135, 179, 109, 103, 128]
VOC_CLIPS = [f'l_voc{i}' for i in range(1, 11)]
CHART_GLOSS = ['I die', 'there', 'until', 'behold', 'in order that', 'John',
               'one the one hand, indeed', 'whole, entire', 'when', 'with']


def vocab_pools(tbk, conv):
    greek = []
    for x in tbk.pool(0x1a340, 10, 'vocab greek'):
        x = re.sub(r'\s+Pe<troj.*$', '', x)  # stale tail on the last line
        greek.append(sq(conv(x)))
    drill = [sq(x) for x in tbk.pool(0x1d2a, 10, 'drill glosses')]
    card = [sq(x) for x in tbk.pool(0x1a59a, 10, 'flashcard glosses')]
    if greek[9] != 'σύν' or greek[5] != 'Ἰωάννης, -ου, ὁ':
        raise SystemExit(f'STOP: vocab greek misparse {greek}')
    return greek, drill, card


def vocab_drills(tbk, conv):
    greek, gloss, _ = vocab_pools(tbk, conv)
    need(tbk, *VOC_CLIPS)
    gk_items = [{'greek': re.sub(r',.*$', '', g), 'note': None, 'answer': gl,
                 'audio': aud(c)} for g, gl, c in zip(greek, gloss, VOC_CLIPS)]
    en_items = [{'prompt': gl, 'answer': g, 'audio': aud(c)}
                for g, gl, c in zip(greek, gloss, VOC_CLIPS)]
    common = {'scored': True, 'ui': score_ui(), 'poolKind': 'vocabulary',
              'answerPolicy': {'advanceClass': 'autoBoth', 'attemptsPerItem': 1}}
    gk = {'id': 'c12_drill_vocab_gk_en', 'type': 'select',
          'mode': 'fullOptionGrid',
          'title': 'Vocabulary:  Greek to English Drill',
          'instructions': 'Click on the matching word',
          'promptIsGreek': True, 'options': 'static', 'optionValues': gloss,
          'items': gk_items, 'audioTiming': 'beforeGuess', **common}
    en = {'id': 'c12_drill_vocab_en_gk', 'type': 'select',
          'mode': 'fullOptionGrid',
          'title': 'Vocabulary: English to Greek Drill',
          'instructions': 'Click on the matching word',
          'options': 'static', 'optionsAreGreek': True, 'optionValues': greek,
          'items': en_items, 'audioTiming': 'afterGuess', **common}
    return gk, en


def vocab_speller(tbk, conv):
    greek, gloss, _ = vocab_pools(tbk, conv)
    items = [{'prompt': gl, 'answer': re.sub(r',.*$', '', g), 'audio': aud(c)}
             for gl, g, c in zip(gloss, greek, VOC_CLIPS)]
    return {
        'id': 'c12_ex_vocab_speller', 'type': 'spell',
        'title': 'Vocabulary Spelling Exercise',
        'instructions': 'Click letters below or use your keyboard to spell it out.',
        'prompt': 'item', 'promptLabel': 'English Meaning',
        'accentsOptional': True, 'spellerTilesRef': 'chapt_1', 'items': items,
        'ui': {'fields': ['English Meaning', 'Spell Greek Word'],
               'buttons': ['Pronounce', 'Previous', 'Score', 'Next',
                           'Check Answer', 'Greek Keyboard'],
               'checkboxes': ['Show Answer', 'With Accents',
                              'Pronounce Each Exercise'],
               'defaults': {'pronounceEach': True}},
        '_answer_note': ('Prompts from the short gloss pool 0x1d2a (the '
                         'rail walk shows "I die"); Ioannes is spelled by its '
                         'first form.'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


# --------------------------------------------------------------- speller
def imperfect_speller(tbk, conv):
    prompts = [sq(x) for x in tbk.pool(0x8caf6, 23, 'speller prompts')]
    forms = [sq(conv(x)) for x in tbk.pool(0x36bec, 23, 'parsing prompts')]
    disp = dispatch(tbk.data, 0xf6c47, 0xf7200)
    all_clips = dict(zip(ACT + MP + EIMI + ECHO,
                         ACT_CLIPS + MP_CLIPS + EIMI_CLIPS + ECHO_CLIPS))
    items = []
    for i, (p, f) in enumerate(zip(prompts, forms), 1):
        # cross-check: the prompt's subject must match the form's cell
        subj = p.split()[0].lower()
        pl = '(pl.)' in p or subj in ('we', 'they')
        sg = '(sg.)' in p or subj in ('i', 'he', 'she', 'it')
        if not (pl or sg) or (pl and sg):
            raise SystemExit(f'STOP: speller prompt {p!r} number unclear')
        clip = disp.get(i) or (all_clips.get(f) or all_clips.get(f + '(ν)'))
        need(tbk, clip)
        it = {'prompt': p, 'answer': f, 'audio': aud(clip)}
        if f in ('ἔλυε', 'εἶχε'):
            it['answerAlt'] = f + 'ν'
            it['_alt_note'] = 'Movable nu: either spelling is accepted (D-33).'
        items.append(it)
    return {
        'id': 'c12_ex_speller', 'type': 'spell',
        'title': 'Imperfect Indicative Spelling Exercise',
        'instructions': 'Click letters below or use your keyboard to spell it out.',
        'prompt': 'item', 'promptLabel': 'English',
        'accentsOptional': True, 'spellerTilesRef': 'chapt_1', 'items': items,
        'ui': {'fields': ['English', 'Spell Greek'],
               'buttons': ['Pronounce', 'Previous', 'Score', 'Next',
                           'Check Answer', 'Greek Keyboard'],
               'checkboxes': ['Show Answer', 'With Accents',
                              'Pronounce Each Exercise'],
               'defaults': {'pronounceEach': True}},
        '_answer_note': ('The 23 answers ARE the parsing pool (0x36bec) in '
                         'order -- the speller\'s SayWord table (0xf6c47) is '
                         'the parsing table verbatim; prompts from 0x8caf6.'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


# ------------------------------------------------------------ scripture
VERSE_69 = ['Πάτερ', 'ἡμῶν', 'ὁ', 'ἐν', 'τοῖς', 'οὐρανοῖς·', 'ἁγιασθήτω',
            'τὸ', 'ὄνομά', 'σου·']
GLOSS_69 = ['Father', 'our', 'the', 'in', 'the', 'heavens', 'hallowed', 'the',
            'name', 'your']
SM_OPTS = ['father', 'name', 'hallowed', 'our', 'heavens', 'your', 'in']
SM_GLOSS = {'Πάτερ': 'father', 'ἡμῶν': 'our', 'ἐν': 'in', 'οὐρανοῖς': 'heavens',
            'ἁγιασθήτω': 'hallowed', 'ὄνομά': 'name', 'σου': 'your'}


def learn_scripture(tbk, conv):
    raw = tbk.field(0x3129e)
    for leg in ['Pa<ter', 'a[giasqh<tw', 'o@noma<']:
        if leg not in raw:
            raise SystemExit(f'STOP: {leg} not in interlinear')
    words = []
    for k, (w, gl) in enumerate(zip(VERSE_69, GLOSS_69), 1):
        need(tbk, f'l_sm{k}')
        words.append({'greek': w, 'gloss': gl, 'audio': aud(f'l_sm{k}')})
    need(tbk, 'l_mt6_9')
    return {'id': 'c12_learn_scripture', 'type': 'contentAudio',
            'mode': 'interlinearVerse', 'title': 'Learn Scripture Memory',
            'reference': 'Mat 6:9', 'words': words,
            'sayWhole': {'label': 'Say Whole Verse', 'audio': aud('l_mt6_9')}}


def scripture_drill(tbk, conv):
    prompts = [sq(conv(x)) for x in tbk.pool(0x5bb86, 7, 'sm prompts')]
    disp = dispatch(tbk.data, 0xa6990, 0xa6c00)
    items = []
    for i, g in enumerate(prompts, 1):
        base = g.rstrip('·.,')
        clip = disp.get(i)
        pos = int(clip[4:])
        if VERSE_69[pos - 1].rstrip('·') != base:
            raise SystemExit(f'STOP: SM prompt {g!r} is not verse word {pos}')
        need(tbk, clip)
        items.append({'greek': base, 'answer': SM_GLOSS[base], 'audio': aud(clip)})
    return {'id': 'c12_drill_scripture_memory', 'type': 'select',
            'mode': 'fullOptionGrid', 'title': 'Scripture Memory Drill',
            'instructions': 'Click on the matching word',
            'promptIsGreek': True, 'options': 'static',
            'optionValues': SM_OPTS, 'items': items, 'scored': True,
            'ui': score_ui(),
            '_audio_note': ('Seven prompts (the articles are not drilled); '
                            'verse-position clips l_sm1,2,4,6,7,9,10 from the '
                            'SayWord table at 0xa6990. The original\'s 8-cell '
                            'grid leaves one cell empty.'),
            'audioTiming': 'beforeGuess',
            'answerPolicy': {'advanceClass': 'autoBoth', 'attemptsPerItem': 1}}


def scripture_speller(tbk, conv):
    return {
        'id': 'c12_ex_scripture_speller', 'type': 'spellVerse',
        'title': 'Scripture Memory Spelling Exercise',
        'instructions': 'Enter all of Mat 6:9 then click "Check Answer"',
        'reference': 'Mat 6:9', 'answerWords': VERSE_69,
        'translation': 'Our Father which art in heaven, hallowed be your name,',
        'accentsOptional': True, 'punctuationOptional': True,
        'audio': aud('l_mt6_9'), 'spellerTilesRef': 'chapt_1',
        'ui': {'fields': ['Spell Greek'],
               'buttons': ['Pronounce', 'Check Answer', 'Greek Keyboard',
                           'Restart Exercise'],
               'checkboxes': ['Show Answer', 'With Accents'],
               '_reveal_note': 'RULES C8 / D-30.'},
        '_repeat_note': '"Repeat This Exercise" NOT ported (D-42 retired).',
        '_punct_note': 'The ano teleia after ouranois and sou is U+00B7 (NFC); optional (C6/D-18).',
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


# ------------------------------------------------------------ objectives
def objectives(tbk, conv):
    raw = tbk.field(0x301ca).split('\r\n')
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
    if len(items) != 6 or 'Mat 6:9' not in items[5]:
        raise SystemExit(f'STOP: objectives: {items}')
    return items


def bibliography(tbk):
    raw = tbk.field(0x14ff0).split('\r\n')
    entries, cur = [], None
    for l in raw:
        if not l.strip():
            continue
        if re.match(r'^\s{0,4}\S', l) and not l.startswith('          '):
            if cur:
                entries.append(sq(cur))
            cur = l.strip()
        elif cur:
            cur += ' ' + l.strip()
    if cur:
        entries.append(sq(cur))
    if len(entries) != 4:
        raise SystemExit('STOP: expected 4 bibliography entries')
    return {'id': 'c12_learn_bibliography', 'type': 'contentAudio',
            'mode': 'textPage', 'title': 'Learn Bibliography',
            'content': [{'type': 'biblist', 'items': entries}]}


# ---------------------------------------------------------- quick review
def qr_vocab(tbk, conv):
    raw = tbk.field(0x65d74)
    for g in CHART_GLOSS:
        if g not in raw:
            raise SystemExit(f'STOP: chart gloss {g!r} not in 0x65d74')
    need(tbk, 'l_vocl')
    return {'id': 'c12_qr_vocab', 'type': 'contentAudio',
            'mode': 'reviewVocab', 'title': 'Review Vocabulary Chart',
            'pool': 'senses', 'columns': 2, 'showNtFreq': True,
            'footnote': ('The number after the translation is the number of '
                         'times the word occurs in the New Testament.'),
            'playAll': {'label': 'Say Whole List', 'audio': aud('l_vocl')},
            '_verify': ('men prints "one the one hand, indeed (179)" in the '
                        'original (typo); verbatim, VERIFY-5H (g).')}


def qr_paradigms(tbk, conv):
    return [
        {'id': 'c12_qr_paradigms', 'type': 'contentAudio',
         'mode': 'paradigmChart', 'title': 'Review Imperfect Paradigms',
         'paradigms': [act_chart(tbk, 0x4be02, 'qrImperfectActive'),
                       mp_chart(tbk, 0x4da54, 'qrImperfectMiddlePassive',
                                note=MP_NOTE)],
         '_disclosure': ('C9 (§4.6): the original pages Active/Middle-Passive '
                         'with a toggle and titles the page "Review Imperfect '
                         'Paradigm"; stacked, plural title per the Quick '
                         'Review Menu. VERIFY-5H (l).')},
        {'id': 'c12_qr_eimi', 'type': 'contentAudio', 'mode': 'paradigmChart',
         'title': 'Review Imperfect Indicative of εἰμί',
         'titleAudio': aud('l_eimi'),
         'paradigms': [paradigm(tbk, 0xd818, 'qrImperfectEimi',
                                'Imperfect Active Indicative of εἰμί', EIMI,
                                EIMI_LEG, EIMI_CLIPS, EIMI_GL, 'l_eimpar')],
         '_note': 'echo is NOT reviewed in the original; not added.'}]


def qr_scriptures(ch11, learn_scr):
    out = []
    for oid in ('c11_qr_scripture_jn11', 'c11_qr_scripture_rom623a',
                'c11_qr_scripture_rom623b', 'c11_qr_scripture_mat633a',
                'c11_qr_scripture_mat633b'):
        src = [a for a in ch11['quickReview'] if a['id'] == oid][0]
        words = [{'greek': w['greek'], 'gloss': w['gloss'],
                  'audio': w['audio'].replace('chapt_11_', A)} for w in src['words']]
        out.append({'id': oid.replace('c11_', 'c12_'), 'type': 'contentAudio',
                    'mode': 'interlinearVerse', 'title': src['title'],
                    'reference': src['reference'], 'words': words,
                    'sayWhole': {'label': src['sayWhole']['label'],
                                 'audio': src['sayWhole']['audio']
                                 .replace('chapt_11_', A)}})
    out.append({'id': 'c12_qr_scripture_mat69', 'type': 'contentAudio',
                'mode': 'interlinearVerse',
                'title': 'Review Scripture Memory:  Mat 6:9',
                'reference': 'Mat 6:9', 'words': learn_scr['words'],
                'sayWhole': learn_scr['sayWhole']})
    return out


def build_lexicon(tbk, conv):
    greek, drill, card = vocab_pools(tbk, conv)
    lemmas = {}
    for k, g, gd, gc, cg, c, f in zip(VOC_KEYS, greek, drill, card,
                                      CHART_GLOSS, VOC_CLIPS, VOC_FREQ):
        first = re.sub(r',.*$', '', g)
        lemmas[k] = {'greek': first, 'translit': k, 'lexicalForm': g,
                     'gloss': cg, 'glossShort': gc, 'audio': aud(c),
                     'ntFreq': f,
                     'senses': [{'greek': first, 'caseTag': None,
                                 'glossShort': gd, 'audio': aud(c)}]}
    return {'_comment': (
        'Chapter 12 lexicon, assembled from 12_IMPF.TBK (cohort 5H). Ten '
        'lemmas, no case splits. gloss = Review Vocabulary Chart (0x65d74, '
        'verbatim incl. the men typo); glossShort = flashcard pool (0x1a59a); '
        'senses[].glossShort = drill pool (0x1d2a).'),
        'lemmas': lemmas, 'exampleWords': {}}


# -------------------------------------------------------------------- main
def main():
    tbk_path, fontmap_path, ch11_path, wavlist_path, outdir = sys.argv[1:6]
    outfile = os.path.join(outdir, 'chapt-12.json')
    if os.path.exists(outfile) and not os.environ.get('ALLOW_REGRESSIVE_REBUILD'):
        raise SystemExit('STOP: Stage 8.7 -- chapt-12.json exists.')
    shipped = {l.strip().lower().rsplit('.', 1)[0]
               for l in open(wavlist_path) if l.strip()}
    tbk = Tbk(tbk_path)
    tbk.greek_fmts = underline.vote_greek_fmts(tbk.data, TEACH_OFFSETS)
    conv = make_conv11(json.load(open(fontmap_path, encoding='utf-8')))
    ch11 = json.load(open(ch11_path, encoding='utf-8'))
    learn_scr = learn_scripture(tbk, conv)
    ch = {
        '_comment': ('Chapter 12 (Imperfect Verbs), assembled from 12_IMPF.TBK '
                     '+ CHAPT_12 audio + ch12railwalk.pdf under PIPELINE-'
                     'INSIGHTS-v3 Stage 8 and DISCLOSURE-RULES. Behavior '
                     'fields per DRILLBEHAVIORLEDGER.csv rows 107-115 '
                     '(CONFIRMED 2026-08-25; row 108 afterGuess).'),
        'id': 'chapt_12', 'number': 12, 'title': 'Imperfect Verbs',
        'objectivesPreamble': 'You will be able to:',
        'objectives': objectives(tbk, conv), 'vocab': VOC_KEYS,
        'learn': [], 'drill': [], 'exercise': [], 'quickReview': [],
        'feedback': ch11['feedback'], 'sequence': [],
        '_menu_note': ('Drill Menu prints "Imperfect Parsing Indicative Drill"; '
                       'the page title "Imperfect Indicative Parsing Drill" is '
                       'used on both surfaces (5G precedent).'),
        '_audioVerify': ('CHAPT_12 ships 163 WAVs. Listens: l_ap3 (third '
                         'plural eluon vs l_a1s / l_ap9, both unreferenced), '
                         'l_ad1 (the augmented form, confirmed), l_ex1-14 '
                         'order (contraction rows then compound examples). '
                         'Unreferenced: l_a1s, l_ap9, l_td21 (never shipped).')}
    gk, en = vocab_drills(tbk, conv)
    ch['learn'] = [
        {'id': 'c12_learn_objectives', 'type': 'contentAudio',
         'mode': 'objectivesPage', 'title': 'Learn Chapter Objectives',
         'instructions': ''},
        english_concepts(tbk, conv), learn_imperfect(tbk, conv),
        {'id': 'c12_learn_vocab', 'type': 'contentAudio', 'mode': 'flashcard',
         'title': 'Learn Vocabulary', 'pool': 'senses'},
        learn_scr, bibliography(tbk)]
    ch['drill'] = [parsing_drill(tbk, conv), augment_drill(tbk, conv),
                   translation_drill(tbk, conv), gk, en,
                   scripture_drill(tbk, conv)]
    ch['exercise'] = [imperfect_speller(tbk, conv), vocab_speller(tbk, conv),
                      scripture_speller(tbk, conv)]
    ch['quickReview'] = ([qr_vocab(tbk, conv)] + qr_paradigms(tbk, conv)
                         + qr_scriptures(ch11, learn_scr))
    ch['sequence'] = [
        'c12_learn_objectives', 'c12_learn_english_concepts',
        'c12_learn_imperfect', 'c12_drill_parsing', 'c12_drill_augment',
        'c12_drill_translation', 'c12_ex_speller', 'c12_learn_vocab',
        'c12_drill_vocab_gk_en', 'c12_drill_vocab_en_gk',
        'c12_ex_vocab_speller', 'c12_learn_scripture',
        'c12_drill_scripture_memory', 'c12_ex_scripture_speller',
        'c12_qr_vocab', 'c12_qr_paradigms', 'c12_qr_eimi',
        'c12_qr_scripture_jn11', 'c12_qr_scripture_rom623a',
        'c12_qr_scripture_rom623b', 'c12_qr_scripture_mat633a',
        'c12_qr_scripture_mat633b', 'c12_qr_scripture_mat69',
        'c12_learn_bibliography']
    ch['_sequence_note'] = 'Rail order from ch12railwalk.pdf (Nathanael, 2026-08-25).'
    # hint composites (two charts each -> §4.1 toggle; labels derive from
    # the titles' one differing word: Active / Middle/Passive, eimi / echo)
    hint_act = act_chart(tbk, 0x38fda, 'hintImperfectActive')
    hint_mp = mp_chart(tbk, 0x38fda, 'hintImperfectMiddlePassive')
    for c in (hint_act, hint_mp):
        c.pop('sayWhole', None)
    hint_eimi = paradigm(tbk, 0x370c6, 'hintImperfectEimi', 'Imperfect of εἰμί',
                         EIMI, EIMI_LEG, EIMI_CLIPS, EIMI_GL, None, lower=True)
    hint_echo = paradigm(tbk, 0x370c6, 'hintImperfectEcho', 'Imperfect of ἔχω',
                         ECHO, ECHO_LEG, ECHO_CLIPS, ECHO_GL, None, lower=True)
    ch['hintCharts'] = {
        'luoParadigms': {'charts': [hint_act, hint_mp],
                         '_note': ('Field 0x38fda (both luo charts on one '
                                   'hint screen, no note, no say-all): the '
                                   '§4.1 toggle Active / Middle/Passive.')},
        'eimiEchoParadigms': {'charts': [hint_eimi, hint_echo],
                              '_note': ('Field 0x370c6, the hint\'s OWN '
                                        'titles and lowercase glosses (§4.7); '
                                        'no exception note; toggle eimi / echo.')}}
    for a in ch['drill']:
        for hr in {a.get('ui', {}).get('hintRef')} | \
                {i.get('hintRef') for i in a.get('items', [])}:
            if hr and hr not in ch['hintCharts']:
                raise SystemExit(f'STOP: dangling hintRef {hr}')
    ids = set()

    def collect(o):
        if isinstance(o, dict):
            for k, v in o.items():
                if k in ('audio', 'audioFull', 'titleAudio') and isinstance(v, str):
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
            raise SystemExit(f'STOP: emitted clip {cid} not in CHAPT_12 pack')
        if not tbk.has_clip(base) and not re.match(r'[fhijk]_', base):
            raise SystemExit(f'STOP: emitted clip {cid} not referenced in TBK')
    errs = audit(ch)
    if errs:
        raise SystemExit('STOP: self-audit failed:\n' + '\n'.join(errs))
    ch = post_patches(ch)
    os.makedirs(outdir, exist_ok=True)
    with open(outfile, 'w', encoding='utf-8') as f:
        json.dump(ch, f, ensure_ascii=False, indent=1)
    with open(os.path.join(outdir, 'lexicon-chapt12.json'), 'w',
              encoding='utf-8') as f:
        json.dump(build_lexicon(tbk, conv), f, ensure_ascii=False, indent=1)
    print(f'chapter 12: {len(ids)} distinct clips, '
          f'{len(ch["sequence"])} rail pages. OK.')


def post_patches(doc):
    sp = [a for a in doc['exercise'] if a['id'] == 'c12_ex_scripture_speller'][0]
    assert 'Repeat This Exercise' not in sp['ui']['checkboxes']
    return doc


if __name__ == '__main__':
    main()
