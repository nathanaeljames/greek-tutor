#!/usr/bin/env python3
# STAGE 8.7 PROVENANCE NOTICE (2026-08-29): refuses to overwrite an existing
# chapt-14.json unless ALLOW_REGRESSIVE_REBUILD=1 after a full back-port of
# any hand repairs (PIPELINE-INSIGHTS 8.7). post_patches() re-applies ratified
# rulings so a regeneration cannot resurrect a pre-fix value.
"""assemble_ch14.py -- chapter 14 (Second Aorist Verbs) from 14_2AOR.TBK.
Cohort 5I.

  assemble_ch14.py TBK font-map.json chapt-13.json wavlist_14.txt outdir

chapt-13.json supplies the carried Quick Review verses, re-keyed to the
CHAPT_14 copies.

Chapter-specific wiring facts, all TBK-read:
  * Second Aorist Indicative Parsing Drill: 12 items (TotalNumberOfWords
    at 0x74c99). Voice x person/number keys from the AnalyzeAnswer
    script; items 4 and 8 (elabon) accept BOTH First Singular and Third
    Plural, and the drill's own Translate pool prints "I took or they
    took" for exactly those two.
  * Second Aorist Indicative Forms Drill: 13 items (0x105f86). THE A1b
    CASE, CONFIRMED: the prompt is a Greek PRESENT lemma with its
    English gloss and the three options are Greek, and the SayWord table
    at 0x106c4c dispatches the AORIST clips (n_lega, n_exwa, n_blea ...)
    -- never the paired present clips n_legp, n_exwp -- so the recording
    is the ANSWER. audioTiming is afterGuess and the A1c audio-leak gate
    applies (ledger row 126). The A/B/C key at 0x105f86 independently
    reproduces all thirteen true second aorists.
  * Second Aorist Indicative Translation Drill: 28 items (0xcb9a1), the
    largest in the project so far. The A/B/C key script yields 27 of 28
    and agrees with the rail walk's blue options on every one; item 28
    is the rail walk's alone.
  * Scripture Memory Drill: 6 items, Mat 6:10c, clips n_sm1-6 (the
    table at 0x1093b1 lists a seventh the six-word pool never reaches).
  * Review Second Aorist Indicative Forms: the original pages the
    thirteen-verb list five-and-eight behind More/Back. Per the standing
    method (NIT-LOG N-6, ruled 2026-08-29) the port STACKS it and keeps
    one say-all per half.
"""
# --------------------------------------------------------------------
# STAGE 8.7 SELF-CHECK (5I close).
#
# This assembler REPRODUCES the committed chapt-14.json exactly, so it is
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

A = 'chapt_14_'

TEACH_OFFSETS = [0x1b2fa, 0x1c13a, 0x1c4e4, 0x1e050, 0x23bc8, 0x24164,
                 0x2463c, 0x25c30, 0x26500, 0x2729c, 0x2d4cc, 0x28968]


def text_off(tbk, off):
    """The offset the field's TEXT actually starts at.

    PIPELINE FINDING (5I, chapter 14, extending chapter 13's): where a
    record carries the second length word, tbk_fields.scan() reports it two
    bytes early -- and that shift moves the FORMAT-RUN TABLE alignment too,
    not just the length. Chapter 14's English Concepts underlines came back
    as 'I lau' / 'I laugh' instead of 'laugh' / 'laughed' for exactly this
    reason, and the chapter-wide Greek-format vote came back EMPTY. Reading
    at off+2 recovers all four underline spans exactly. Every marked() and
    every format vote in this file goes through here.
    """
    outer = struct.unpack_from('<H', tbk.data, off - 2)[0]
    inner = struct.unpack_from('<H', tbk.data, off)[0]
    return off + 2 if 0 < inner <= outer - 2 else off


def marked(tbk, off):
    m = underline.marked_greek(tbk.data, text_off(tbk, off), tbk.greek_fmts)
    return m if m is not None else tfield(tbk, off)[0]


def aud(name):
    return A + name


def need(tbk, *clips):
    for c in clips:
        if not tbk.has_clip(c):
            raise SystemExit(f'STOP: {c} not referenced in TBK')


# ---------------------------------------------------------------- paradigms
PN = ['1', '2', '3']
ACT = ['ἔλαβον', 'ἔλαβες', 'ἔλαβε(ν)', 'ἐλάβομεν', 'ἐλάβετε', 'ἔλαβον']
ACT_LEG = ['e@labon', 'e@labej', 'e@labe(n)', 'e]la<bomen', 'e]la<bete']
ACT_CLIPS = ['n_lab1s', 'n_lab2s', 'n_lab3s', 'n_lab1p', 'n_lab2p', 'n_lab3p']
ACT_GL = ['I took', 'You took', 'He/she/it took', 'We took', 'You took',
          'They took']
MID = ['ἐγενόμην', 'ἐγένου', 'ἐγένετο', 'ἐγενόμεθα', 'ἐγένεσθε', 'ἐγένοντο']
MID_LEG = ['e]geno<mhn', 'e]ge<nou', 'e]ge<neto', 'e]geno<meqa', 'e]ge<nesqe',
           'e]ge<nonto']
MID_CLIPS = ['n_gin1s', 'n_gin2s', 'n_gin3s', 'n_gin1p', 'n_gin2p', 'n_gin3p']
MID_GL = ['I became', 'You became', 'He/she/it became', 'We became',
          'You became', 'They became']
MID_NOTE = ('The aorist and future passives will be formed from a different '
            'stem and learned later. Note that this aorist paradigm is '
            'deponent. Middles are usually "I brought (for myself)."')


def paradigm(tbk, off, pid, title, forms, legacy, clips, glosses, say,
             lower=False, note=None):
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
    if note:
        blk['note'] = note
    return blk


def act_chart(tbk, off, pid, say='n_labpar', lower=False):
    return paradigm(tbk, off, pid,
                    'Second Aorist Active Indicative of λαμβάνω',
                    ACT, ACT_LEG, ACT_CLIPS, ACT_GL, say, lower=lower)


def mid_chart(tbk, off, pid, say='n_ginpar', note=None, lower=False):
    return paradigm(tbk, off, pid,
                    'Second Aorist Middle Indicative of γίνομαι',
                    MID, MID_LEG, MID_CLIPS, MID_GL, say, lower=lower,
                    note=note)


# ------------------------------------------------------------- aorist stems
# (present lemma, second aorist, gloss, present clip, aorist clip)
STEMS = [
    ('ἀπέρχομαι', 'ἀπῆλθον', 'I departed', 'n_apep', 'n_apea'),
    ('ἀποθνῄσκω', 'ἀπέθανον', 'I died', 'n_apop', 'n_apoa'),
    ('βάλλω', 'ἔβαλον', 'I threw', 'n_balp', 'n_bala'),
    ('βλέπω', 'εἶδον', 'I saw', 'n_blep', 'n_blea'),
    ('γίνομαι', 'ἐγενόμην', 'I became', 'n_ginp', 'n_gina'),
    ('γινώσκω', 'ἔγνων', 'I knew', 'n_ginwp', 'n_ginwa'),
    ('εἰσέρχομαι', 'εἰσῆλθον', 'I entered', 'n_eisp', 'n_eisa'),
    ('ἐξέρχομαι', 'ἐξῆλθον', 'I went out', 'n_ecep', 'n_ecea'),
    ('ἔρχομαι', 'ἦλθον', 'I came, went', 'n_erxp', 'n_erxa'),
    ('εὑρίσκω', 'εὗρον', 'I found', 'n_eurp', 'n_eura'),
    ('ἔχω', 'ἔσχον', 'I had', 'n_exwp', 'n_exwa'),
    ('λαμβάνω', 'ἔλαβον', 'I took', 'n_lamp', 'n_lama'),
    ('λέγω', 'εἶπον', 'I said', 'n_legp', 'n_lega'),
]
BLEPW_POPUP = 'blepwEidon'


def stem_rows(tbk, conv, offsets, lo, hi):
    """The verb list, verified against the fields that print it."""
    raw = ' '.join(tfield(tbk, o)[0] for o in offsets).replace(' ', '')
    rows = []
    for lemma, aor, gl, cp, ca in STEMS[lo:hi]:
        need(tbk, cp, ca)
        row = {'greek': lemma, 'audio': aud(cp), 'gloss': f'({gl})',
               'parts': [{'text': '\u2014'},
                         {'greek': aor, 'audio': aud(ca)}]}
        if lemma == 'βλέπω':
            row['popupRef'] = BLEPW_POPUP
            row['_popup_note'] = ('C3 in-chart trigger: eidon is the hot '
                                  'text in the original (blue in the rail '
                                  'walk, hand cursor on p8).')
        rows.append(row)
    return rows


def blepw_popup(tbk, conv):
    body = para_blocks(conv, tfield(tbk, 0x28968)[0].split('\r\n'))
    if len(body) != 1 or 'second' not in body[0]['text']:
        raise SystemExit(f'STOP: blepw popup misparse: {body}')
    need(tbk, 'n_ebl', 'n_blea', 'n_ora')
    return {'id': BLEPW_POPUP, 'title': 'βλέπω  \u2014  εἶδον  (I saw)',
            'content': body,
            'audioMap': {'ἔβλεψα': aud('n_ebl'), 'εἶδον': aud('n_blea'),
                         'ὁράω': aud('n_ora')}}


# ------------------------------------------------------------------- learn
def english_concepts(tbk, conv):
    topics = []
    for tid, title, off in [('introduction', 'Introduction', 0x1b2fa),
                            ('comparison', 'Comparison with Greek', 0x1c13a),
                            ('aoristComments', 'Aorist Comments', 0x1c4e4)]:
        blocks = para_blocks(conv, marked(tbk, off).split('\r\n'))
        # Stage 8.3: the Introduction's two ways of forming the past tense
        # are a real numbered list in the original, not prose that happens
        # to start with a digit.
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
                 '[[u]]runs[[/u]]', '[[u]]ran[[/u]]']:
        if must not in joined:
            raise SystemExit(f'STOP: EC underline missing: {must}')
    return {'id': 'c14_learn_english_concepts', 'type': 'contentAudio',
            'mode': 'topicPages', 'title': 'Learn English Concepts',
            'topics': topics}


def form_topic(tbk, conv):
    blocks = para_blocks(conv, marked(tbk, 0x23bc8).split('\r\n'))
    if len(blocks) != 3 or 'augment' not in blocks[0]['text']:
        raise SystemExit(f'STOP: Form lead misparse: {blocks}')
    lead = blocks[:1]
    # the run table now converts the augment letter itself; the original
    # prints it in PARENTHESES here ("an (ε) augment"), unlike ch15's
    # quotes, and both are carried verbatim.
    raw = tfield(tbk, 0x23bc8)[0]
    for cand in ['lab', 'e@labon']:
        if cand not in raw:
            raise SystemExit(f'STOP: Form formula fragment {cand!r} missing')
    need(tbk, 'n_lab1s')
    formula = {'type': 'formula', 'align': 'center', 'gapBefore': True,
               'lines': [{'text': 'Augment + Verb stem + Connecting vowel'},
                         {'text': '+ Secondary endings'},
                         {'text': 'ε + λαβ + ο + ν = ἔλαβον',
                          'audio': aud('n_lab1s'), 'tapUnit': True},
                         {'text': 'Aug   Stem   CV   Ending'}],
               '_note': ('D-48f2 shape: the Greek line is one tap unit '
                         'playing elabon (n_lab1s); the English lines are '
                         'inert.')}
    cont_raw = [l for l in tfield(tbk, 0x24164)[0].split('\r\n') if l.strip()]
    body = ' '.join(cont_raw[1:])
    if 'connecting vowel will be' not in body:
        raise SystemExit(f'STOP: Form (cont.) misparse: {body[:80]!r}')
    cont = [{'type': 'para', 'text': 'The connecting vowel will be:',
             'gapBefore': True},
            {'type': 'para', 'text': 'ο before μ and ν\nε elsewhere',
             'flush': True,
             '_disclosure': ('C5: "Form (cont.)" is the same header with a '
                             'continuation marker; merged.')}]
    return {'id': 'form', 'title': 'Form', 'content': lead + [formula] + cont}


CONTRACTION = [('ε + α = η', 'ἤκουον', 'ἀκούω', 'l_ex1', 'l_ex2'),
               ('ε + ε = η', 'ἤγειρον', 'ἐγείρω', 'l_ex3', 'l_ex4'),
               ('ε + ο = ω', 'ὠρχούμην', 'ὀρχέομαι', 'l_ex5', 'l_ex6'),
               ('ε + αι = ῃ', 'ᾖρον', 'αἴρω', 'l_ex7', 'l_ex8'),
               ('ε + οι = ῳ', 'ᾠκοδόμουν', 'οἰκοδομέω', 'l_ex9', 'l_ex10')]


def augments_topic(tbk, conv):
    raw = tfield(tbk, 0x2463c)[0]
    if 'a + e = h' not in re.sub(r' {2,}', ' ', raw):
        raise SystemExit('STOP: contraction table missing from Augments')
    item1 = 'before consonants it is "ε"'
    item2 = ('before vowels the augment contracts with the vowel according '
             'to the following rules:\n'
             'α + ε = η      ε + ε = η      ο + ε = ω\n'
             'ει + ε = ῃ     αι + ε = ῃ     οι + ε = ῳ\n'
             'αυ + ε = ηυ    ευ + ε = ηυ')
    ex_raw = tfield(tbk, 0x24bc2)[0]
    rows = []
    for rule, augf, lem, c1, c2 in CONTRACTION:
        for f in (augf, lem):
            if nfc(f) not in nfc(conv(ex_raw)):
                raise SystemExit(f'STOP: {f!r} not in Contraction Examples')
        need(tbk, c1, c2)
        rows.append({'greek': augf, 'audio': aud(c1), 'gloss': rule,
                     'parts': [{'greek': lem, 'audio': aud(c2)},
                               {'text': '+ ε augment'}]})
    examples = {'type': 'expander', 'label': 'Contraction Examples',
                'content': [{'type': 'greekRows', 'layout': 'contraction',
                             'rows': rows}],
                '_disclosure': ('C1: chart payload behind an in-text '
                                '"Examples" link -> accordion. The clips are '
                                'chapter 12\'s l_ex1-10, duplicated into the '
                                'CHAPT_14 pack by the ISO (Stage 6 '
                                'self-containment).')}
    cont_raw = tfield(tbk, 0x25c30)[0]
    flat = cont_raw.replace(' ', '')
    for leg in ['e]kba<llw', 'e]ce<balon', 'a]poktei<nw', 'a]pe<kteina']:
        if leg.replace(' ', '') not in flat:
            raise SystemExit(f'STOP: Augments (cont.) example {leg!r} missing')
    need(tbk, 'l_ex11', 'l_ex12', 'l_ex13', 'l_ex14')
    item3 = ('Compound verbs with prepositions ending in a consonant: insert '
             'the augment between the prepositional prefix and the verb '
             'stem.\nἐκβάλλω becomes ἐξέβαλον')
    item4 = ('Compound verbs with prepositions ending in a vowel: the final '
             'vowel of the preposition is dropped and the ε augment inserted '
             'in its place.\nἀποκτείνω becomes ἀπέκτεινα')
    numbered = {'type': 'numbered', 'gapBefore': True,
                'items': [{'text': item1},
                          {'text': item2, 'below': [examples]},
                          {'text': item3}, {'text': item4}],
                '_disclosure': 'C5: "Augments (cont.)" continues the list 1-4.'}
    return {'id': 'augments', 'title': 'Augments',
            'content': [{'type': 'para',
                         'text': 'Aorist Augments = Imperfect Augments'},
                        {'type': 'para',
                         'text': 'The augment is added in four ways:'},
                        numbered],
            'audioMap': {'ἐκβάλλω': aud('l_ex11'), 'ἐξέβαλον': aud('l_ex12'),
                         'ἀποκτείνω': aud('l_ex13'),
                         'ἀπέκτεινα': aud('l_ex14')},
            '_greek_note': ('Rule lines are bare font-Greek letters in the '
                            'TBK; converted as notation, not taps.')}


def learn_second_aorist(tbk, conv):
    intro = para_blocks(conv, marked(tbk, 0x1e050).split('\r\n'))
    if len(intro) < 1:
        raise SystemExit('STOP: second aorist intro misparse')
    need(tbk, 'n_lama', 'n_gina')
    stems = {'id': 'aoristStems', 'title': 'Aorist Stems of Verbs',
             'content': [
                 {'type': 'para',
                  'text': ('Here is a list of second aorist forms of verbs '
                           'already learned.  Master these forms.')},
                 {'type': 'greekRows', 'layout': 'stemList', 'gapBefore': True,
                  'rows': stem_rows(tbk, conv, [0x26500, 0x2729c], 0, 13),
                  '_disclosure': ('C5 (NIT-LOG N-6 standing method): the '
                                  'original pages the list five-and-eight '
                                  'behind More/Back; STACKED here as one '
                                  'list.')}]}
    topics = [
        {'id': 'introduction', 'title': 'Introduction', 'content': intro},
        form_topic(tbk, conv),
        {'id': 'secondAoristActive', 'title': 'Second Aorist Active',
         'titleAudio': aud('n_lamp'),
         'content': [act_chart(tbk, 0x2073e, 'learnSecondAoristActive')]},
        {'id': 'secondAoristMiddle', 'title': 'Second Aorist Middle',
         'titleAudio': aud('n_ginp'),
         'content': [mid_chart(tbk, 0x29c12, 'learnSecondAoristMiddle',
                               note=MID_NOTE)]},
        augments_topic(tbk, conv),
        stems]
    popups = [blepw_popup(tbk, conv)]
    return {'id': 'c14_learn_second_aorist', 'type': 'contentAudio',
            'mode': 'topicPages',
            'title': 'Learn Second Aorist Indicative Verbs',
            'topics': topics, 'popups': popups, 'greekTaps': True}


# ------------------------------------------------------------------ drills
PN_BTN = {'s1': 'First Singular', 's2': 'Second Singular',
          's3': 'Third Singular', 'p1': 'First Plural',
          'p2': 'Second Plural', 'p3': 'Third Plural'}
VOICE = {'A': 'Active', 'M': 'Middle'}


def sanitized(data):
    tbl = bytes(c if 32 <= c < 127 else 32 for c in range(256))
    return data.translate(tbl).decode('latin-1')


def key_blocks(txt, lo, n, span=3000):
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
    out = {}
    for j, (num, st) in enumerate(seq):
        end = seq[j + 1][1] if j + 1 < len(seq) else st + 250
        out[num] = blk[st:end]
    return out


def parsing_drill(tbk, conv, txt):
    n = 12
    prompts = [sq(conv(x)) for x in tpool(tbk, 0xfc894, n, 'parsing prompts')]
    trans = [sq(x) for x in tpool(tbk, 0xfcd00, n, 'parsing translations')]
    keys = key_blocks(txt, 0x74c99, n)
    disp = dispatch(tbk.data, 0x109b00, 0x10a800)
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
        if len(set(voices)) != 1 or not btns:
            raise SystemExit(f'STOP: parsing item {i} key {blk[:70]!r}')
        combos = [[voices[0], PN_BTN[b]] for b in btns]
        g = prompts[i - 1]
        clip = disp.get(i) or cells.get(g) or cells.get(g + '(ν)')
        if not clip:
            raise SystemExit(f'STOP: parsing item {i}: no clip for {g!r}')
        need(tbk, clip)
        it = {'greek': g, 'translate': trans[i - 1], 'answer': combos[0],
              'audio': aud(clip), 'hintRef': 'secondAoristParadigms'}
        if len(combos) > 1:
            it['answerAlt'] = combos[1:]
            it['_ambiguous_note'] = (
                'elabon is First Singular AND Third Plural; the original\'s '
                'key accepts both and its own Translate string prints '
                '"I took or they took". ACCEPT ANY of answer + answerAlt.')
        items.append(it)
    return {
        'id': 'c14_drill_parsing', 'type': 'select', 'mode': 'twoStageGrid',
        'title': 'Second Aorist Indicative Parsing Drill',
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
        'ui': stepper_ui(hint='secondAoristParadigms', translate=True),
        '_stage_note': ('Twelve items (TotalNumberOfWords at 0x74c99). Voice '
                        'x person/number keys, including both readings of '
                        'elabon (items 4 and 8), read from the AnalyzeAnswer '
                        'script; clips are the paradigm CELL clips.'),
        'audioTiming': 'beforeGuess',
        'answerPolicy': {'advanceClass': 'manualOnIncorrect',
                         'attemptsPerItem': 1}}


def forms_drill(tbk, conv, txt):
    n = 13
    lemmas = [sq(conv(x)) for x in tpool(tbk, 0xa9fcc, n, 'forms lemmas')]
    glosses = [sq(x) for x in tpool(tbk, 0xaed70, n, 'forms glosses')]
    cols = [[sq(conv(x)) for x in tpool(tbk, o, n, 'forms col')]
            for o in (0xabc6c, 0xac478, 0xaca46)]
    keys = key_blocks(txt, 0x105f86, n)
    disp = dispatch(tbk.data, 0x106900, 0x107600)
    items = []
    for i in range(1, n + 1):
        letters = re.findall(r'=\s?([ABC])\b', keys[i])
        if not letters:
            raise SystemExit(f'STOP: forms item {i} key {keys[i][:70]!r}')
        col = 'ABC'.index(letters[0])
        ans = cols[col][i - 1]
        clip = disp.get(i)
        lemma, aor, gl, cp, ca = STEMS_BY_LEMMA[lemmas[i - 1]]
        if clip != ca:
            raise SystemExit(f'STOP: forms item {i}: dispatch {clip!r}, '
                             f'expected the AORIST clip {ca!r} (A1b)')
        if nfc(ans) != nfc(aor):
            raise SystemExit(f'STOP: forms item {i}: key column gives '
                             f'{ans!r} but the chapter\'s own stem list '
                             f'gives {aor!r}')
        need(tbk, clip)
        items.append({'greek': lemmas[i - 1], 'gloss': glosses[i - 1],
                      'options': [c[i - 1] for c in cols], 'answer': ans,
                      'audio': aud(clip)})
    return {
        'id': 'c14_drill_forms', 'type': 'select', 'mode': 'fullOptionGrid',
        'title': 'Second Aorist Indicative Forms Drill',
        'instructions': 'Click on the correct matching aorist form',
        'promptIsGreek': True, 'promptGloss': True, 'options': 'perItem',
        'optionsAreGreek': True, 'optionLayout': 'stack1col',
        'items': items, 'scored': True,
        'ui': stepper_ui(hint='secondAoristForms'),
        '_shape_note': ('Prompt panel shows the PRESENT lemma (Greek) and its '
                        'gloss; three GREEK options stacked. The correct '
                        'column per item (A/B/C) comes from the AnalyzeAnswer '
                        'script at 0x105f86 and is cross-checked against the '
                        'chapter\'s own Aorist Stems list -- all thirteen '
                        'agree.'),
        '_audio_note': ('A1b, CONFIRMED: the SayWord table at 0x106c4c '
                        'dispatches the AORIST clips (n_lega, n_exwa, '
                        'n_blea ...), never the paired present clips '
                        '(n_legp, n_exwp ...), so the recording is the '
                        'ANSWER form, not the lemma shown. afterGuess, and '
                        'the A1c gate applies: the prompt carries no tap and '
                        'Pronounce is disabled until the item is answered. '
                        'Ledger row 126.'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'manualOnIncorrect',
                         'attemptsPerItem': 1}}


STEMS_BY_LEMMA = {s[0]: s for s in STEMS}

TD_KEY_TAIL = 'B'   # item 28, rail walk p18; the key script yields 27 of 28


def translation_drill(tbk, conv, txt):
    n = 28
    greek = [sq(conv(x)) for x in tpool(tbk, 0xa0f96, n, 'td greek')]
    cols = [[sq(x) for x in tpool(tbk, o, n, 'td col')]
            for o in (0xa2f18, 0xa38e2, 0xa4092)]
    refs = [sq(x) for x in tpool(tbk, 0xa4717, n, 'td refs')]
    refs[27] = 'Jn 7:3'
    line2 = positional_pool(tbk, 0xa4ad0, n, 'td line 2')
    keys = key_blocks(txt, 0xcb9a1, n, span=3200)
    disp = dispatch(tbk.data, 0xccb00, 0xcde00)
    items = []
    for i in range(1, n + 1):
        letters = re.findall(r'=\s?([ABC])\b', keys[i])
        col = 'ABC'.index(letters[0] if letters else TD_KEY_TAIL)
        if not letters and i != n:
            raise SystemExit(f'STOP: td item {i}: no key letter')
        clip = disp.get(i)
        if clip != f'n_td{i}':
            raise SystemExit(f'STOP: td item {i} dispatch {clip!r}')
        need(tbk, clip)
        it = {'greek': greek[i - 1], 'ref': refs[i - 1],
              'options': [c[i - 1] for c in cols],
              'answer': cols[col][i - 1], 'audio': aud(clip),
              'hintRef': 'secondAoristParadigms'}
        if line2[i - 1].strip():
            it['greek2'] = sq(conv(line2[i - 1]))
        items.append(it)
    if items[0]['answer'] != 'Mary, for you have found favor with God':
        raise SystemExit(f'STOP: td item 1 {items[0]["answer"]!r}')
    return {
        'id': 'c14_drill_translation', 'type': 'select',
        'mode': 'fullOptionGrid',
        'title': 'Second Aorist Indicative Translation Drill',
        'instructions': 'Click on the correct translation',
        'promptIsGreek': True, 'options': 'perItem',
        'optionLayout': 'stack1col', 'items': items, 'scored': True,
        'ui': stepper_ui(hint='secondAoristParadigms'),
        '_answer_note': ('TWENTY-EIGHT items (TotalNumberOfWords at '
                         '0xcb9a1), the largest translation drill in the '
                         'project. The A/B/C key script yields 27 of 28 and '
                         'agrees with the BLUE option on ch14railwalk.pdf '
                         'p11-p18 for every one of them; item 28 is the rail '
                         'walk\'s alone (column B, "Therefore his brothers '
                         'said to him" -- hoi adelphoi is the subject of the '
                         'third-plural eipon). Second Greek lines come from '
                         'the positional pool at 0xa4ad0 indexed DIRECTLY by '
                         'item number.'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'manualOnIncorrect',
                         'attemptsPerItem': 1}}


# ------------------------------------------------------------------- vocab
VOC_KEYS = ['haima', 'airo', 'didasko', 'idios', 'kalos', 'mello', 'hodos',
            'polus', 'soma', 'psuche']
VOC_FREQ = [97, 101, 97, 114, 100, 109, 101, 416, 142, 103]
VOC_CLIPS = [f'n_voc{i}' for i in range(1, 11)]


def vocab_pools(tbk, conv):
    lex = [sq(conv(x)) for x in tpool(tbk, 0x167ae, 10, 'vocab lexical')]
    card = [sq(x) for x in tpool(tbk, 0x16a34, 10, 'flashcard glosses')]
    drill = [sq(x) for x in tpool(tbk, 0xb2d9a, 10, 'drill glosses')]
    spell = [sq(x) for x in tpool(tbk, 0xf3572, 10, 'speller prompts')]
    first = [sq(conv(x)) for x in tpool(tbk, 0xb85ee, 10, 'gk->en prompts')]
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
    gk = {'id': 'c14_drill_vocab_gk_en', 'type': 'select',
          'mode': 'fullOptionGrid',
          'title': 'Vocabulary:  Greek to English Drill',
          'instructions': 'Click on the matching word',
          'promptIsGreek': True, 'options': 'static', 'optionValues': drill,
          'items': [{'greek': g, 'answer': gl, 'audio': aud(c)}
                    for g, gl, c in zip(first, drill, VOC_CLIPS)],
          'audioTiming': 'beforeGuess', **common}
    en = {'id': 'c14_drill_vocab_en_gk', 'type': 'select',
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
        'id': 'c14_ex_vocab_speller', 'type': 'spell',
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
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


# ---------------------------------------------------------------- spellers
def aorist_speller(tbk, conv, parsing):
    n = 12
    prompts = [sq(x) for x in tpool(tbk, 0x7f454, n, 'speller prompts')]
    items = []
    for i, (p, src) in enumerate(zip(prompts, parsing['items']), 1):
        items.append({'prompt': p, 'answer': src['greek'],
                      'audio': src['audio']})
    if items[0]['answer'] != 'ἐλάβετε':
        raise SystemExit(f'STOP: speller item 1 {items[0]["answer"]!r}')
    return {
        'id': 'c14_ex_speller', 'type': 'spell',
        'title': 'Second Aorist Spelling Exercise',
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
                         '(0xfc894) in order; the prompts (0x7f454) name the '
                         'person and number the parsing key gives.'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


def forms_speller(tbk, conv, forms):
    n = 13
    lemmas = [sq(conv(x)) for x in tpool(tbk, 0x2f04, n, 'forms speller')]
    items = []
    for i, (lm, src) in enumerate(zip(lemmas, forms['items']), 1):
        if lm != src['greek']:
            raise SystemExit(f'STOP: forms speller {i}: {lm!r} != '
                             f'{src["greek"]!r}')
        items.append({'prompt': lm, 'answer': src['answer'],
                      'audio': src['audio']})
    return {
        'id': 'c14_ex_speller_forms', 'type': 'spell',
        'title': 'Second Aorist Forms Spelling Exercise',
        'instructions': ('Click letters below or use your keyboard to spell '
                         'the aorist form.'),
        'prompt': 'item', 'promptLabel': 'Present Tense',
        'promptIsGreek': True,
        'accentsOptional': True, 'spellerTilesRef': 'chapt_1', 'items': items,
        'ui': {'fields': ['Present Tense', 'Second Aorist Form'],
               'buttons': ['Pronounce', 'Previous', 'Score', 'Next',
                           'Check Answer', 'Greek Keyboard'],
               'checkboxes': ['Show Answer', 'With Accents',
                              'Pronounce Each Exercise'],
               'defaults': {'pronounceEach': True}},
        '_audio_note': ('A1b again: the prompt is the PRESENT lemma and the '
                        'clip is the aorist ANSWER, so afterGuess. The A1c '
                        'gate does NOT apply -- spellers are excluded by '
                        'ruling (pronouncing the target is the exercise\'s '
                        'design). Ledger row 132.'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


# --------------------------------------------------------------- scripture
VERSE = ['ὡς', 'ἐν', 'οὐρανῷ', 'καὶ', 'ἐπὶ', 'γῆς·']
VERSE_GLOSS = ['as', 'in', 'heaven', 'so also', 'on', 'earth']
SM_OPTS = ['as', 'in', 'earth', 'on', 'heaven', 'so also']


def learn_scripture(tbk, conv):
    raw = tfield(tbk, 0xd21c0)[0]
    for leg in ['w[j', 'ou]ran&?', 'gh?j']:
        if leg not in raw:
            raise SystemExit(f'STOP: {leg} not in interlinear 0xd21c0')
    words = []
    for k, (w, gl) in enumerate(zip(VERSE, VERSE_GLOSS), 1):
        need(tbk, f'n_sm{k}')
        words.append({'greek': w, 'gloss': gl, 'audio': aud(f'n_sm{k}')})
    need(tbk, 'n_mt610c')
    return {'id': 'c14_learn_scripture', 'type': 'contentAudio',
            'mode': 'interlinearVerse', 'title': 'Learn Scripture Memory',
            'reference': 'Mat 6:10c', 'words': words,
            'sayWhole': {'label': 'Say Whole Verse',
                         'audio': aud('n_mt610c')}}


def scripture_drill(tbk, conv):
    prompts = [sq(conv(x)) for x in tpool(tbk, 0x4eb8a, 6, 'sm prompts')]
    disp = dispatch(tbk.data, 0x109300, 0x109600)
    items = []
    for i, g in enumerate(prompts, 1):
        base = g.rstrip('·.,')
        clip = disp.get(i)
        if not clip or not clip.startswith('n_sm'):
            raise SystemExit(f'STOP: SM item {i} dispatch {clip!r}')
        if VERSE[int(clip[4:]) - 1].rstrip('·') != base:
            raise SystemExit(f'STOP: SM prompt {g!r} is not verse word {clip}')
        need(tbk, clip)
        items.append({'greek': base, 'answer': VERSE_GLOSS[i - 1],
                      'audio': aud(clip)})
    return {'id': 'c14_drill_scripture_memory', 'type': 'select',
            'mode': 'fullOptionGrid', 'title': 'Scripture Memory Drill',
            'instructions': 'Click on the matching word',
            'promptIsGreek': True, 'options': 'static',
            'optionValues': SM_OPTS, 'items': items, 'scored': True,
            'ui': score_ui(),
            '_audio_note': ('Six prompts, the whole of Mat 6:10c. The '
                            'SayWord table at 0x1093b1 declares a SEVENTH '
                            'entry, n_sm7, which the six-word pool never '
                            'reaches AND WHICH THE PACK DOES NOT SHIP -- a '
                            'dangling dispatch entry, the inverse of the '
                            'usual D-39 stray. Not wired; VERIFY.'),
            'audioTiming': 'beforeGuess',
            'answerPolicy': {'advanceClass': 'autoBoth',
                             'attemptsPerItem': 1}}


def scripture_speller(tbk, conv):
    hint = sq(' '.join(l.strip() for l in
                       tfield(tbk, 0x8d9cc)[0].split('\r\n') if l.strip()))
    if hint != 'as in heaven so also on earth':
        raise SystemExit(f'STOP: verse hint {hint!r}')
    return {
        'id': 'c14_ex_scripture_speller', 'type': 'spellVerse',
        'title': 'Scripture Memory Spelling Exercise',
        'instructions': 'Enter all of Mat 6:10c then click "Check Answer"',
        'reference': 'Mat 6:10c', 'answerWords': VERSE, 'translation': hint,
        'accentsOptional': True, 'punctuationOptional': True,
        'audio': aud('n_mt610c'), 'spellerTilesRef': 'chapt_1',
        'ui': {'fields': ['Spell Greek'],
               'buttons': ['Pronounce', 'Check Answer', 'Greek Keyboard',
                           'Restart Exercise'],
               'checkboxes': ['Show Answer', 'With Accents'],
               '_reveal_note': 'RULES C8 / D-30.'},
        '_repeat_note': '"Repeat This Exercise" NOT ported (D-42 retired).',
        '_punct_note': 'The ano teleia after ges is U+00B7 (NFC).',
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


# ------------------------------------------------------------- objectives
def objectives(tbk):
    raw = tfield(tbk, 0x2d4cc)[0].split('\r\n')
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
    if len(items) != 6 or 'Mat 6:10' not in items[5]:
        raise SystemExit(f'STOP: objectives: {items}')
    return items


def bibliography(tbk):
    raw = tfield(tbk, 0x1145a)[0].split('\r\n')
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
    return {'id': 'c14_learn_bibliography', 'type': 'contentAudio',
            'mode': 'textPage', 'title': 'Learn Bibliography',
            'content': [{'type': 'biblist', 'items': entries}]}


# ------------------------------------------------------------ quick review
def qr_vocab(tbk, conv):
    raw = tfield(tbk, 0xd96c0)[0]
    for g in ['blood (97)', 'much (416)']:
        if g.replace(' ', '') not in raw.replace(' ', ''):
            raise SystemExit(f'STOP: chart gloss {g!r} not in 0xd96c0')
    need(tbk, 'n_vocl14')
    return {'id': 'c14_qr_vocab', 'type': 'contentAudio',
            'mode': 'reviewVocab', 'title': 'Review Vocabulary Chart',
            'pool': 'senses', 'columns': 2, 'showNtFreq': True,
            'footnote': ('The number after the translation is the number of '
                         'times the word occurs in the New Testament.'),
            'playAll': {'label': 'Say Whole List', 'audio': aud('n_vocl14')},
            '_note': ('One page, one recording in this chapter -- unlike '
                      'chapter 13, whose chart the original paged with two '
                      'half-list clips (NIT-LOG N-6).')}


def qr_pages(tbk, conv):
    return [
        {'id': 'c14_qr_paradigms', 'type': 'contentAudio',
         'mode': 'paradigmChart', 'title': 'Review Second Aorist Paradigms',
         'paradigms': [
             dict(act_chart(tbk, 0x43f20, 'qrSecondAoristActive',
                            lower=True), name='Second Aorist Active'),
             dict(mid_chart(tbk, 0x45a2c, 'qrSecondAoristMiddle',
                            note=MID_NOTE), name='Second Aorist Middle')],
         '_disclosure': ('C9 (4.6): the original pages Active/Middle behind '
                         'a toggle; stacked, one Say Paradigm per chart.')},
        {'id': 'c14_qr_forms', 'type': 'contentAudio', 'mode': 'textPage',
         'title': 'Review Second Aorist Indicative Forms',
         'content': [
             {'type': 'para',
              'text': ('Here is a list of second aorist forms of verbs '
                       'already learned.  Master these forms.')},
             {'type': 'greekRows', 'layout': 'stemList', 'gapBefore': True,
              'rows': stem_rows(tbk, conv, [0x8d56], 0, 5)},
             {'type': 'greekRows', 'layout': 'stemList',
              'rows': stem_rows(tbk, conv, [0x9c00], 5, 13)}],
         'popups': [blepw_popup(tbk, conv)],
         '_disclosure': ('C9 + NIT-LOG N-6 standing method (ruled '
                         '2026-08-29): the original pages the list '
                         'five-and-eight behind More/Back. STACKED here, '
                         'in the original\'s own split, with no pager. '
                         'Neither half carries a say-all recording in this '
                         'chapter, so no button is drawn.')}]


def qr_scriptures(ch13, learn_scr):
    out = []
    for oid in ('c13_qr_scripture_mat633a', 'c13_qr_scripture_mat633b',
                'c13_qr_scripture_mat69', 'c13_qr_scripture_mat610a'):
        src = [a for a in ch13['quickReview'] if a['id'] == oid]
        if not src:
            raise SystemExit(f'STOP: {oid} not in chapt-13.json')
        src = src[0]
        words = [{'greek': w['greek'], 'gloss': w['gloss'],
                  'audio': w['audio'].replace('chapt_13_', A)}
                 for w in src['words']]
        out.append({'id': oid.replace('c13_', 'c14_'), 'type': 'contentAudio',
                    'mode': 'interlinearVerse', 'title': src['title'],
                    'reference': src['reference'], 'words': words,
                    'sayWhole': {'label': src['sayWhole']['label'],
                                 'audio': src['sayWhole']['audio']
                                 .replace('chapt_13_', A)}})
    out.append({'id': 'c14_qr_scripture_mat610c', 'type': 'contentAudio',
                'mode': 'interlinearVerse',
                'title': 'Review Scripture Memory:  Mat 6:10c',
                'reference': 'Mat 6:10c', 'words': learn_scr['words'],
                'sayWhole': learn_scr['sayWhole']})
    return out


def build_lexicon(tbk, conv):
    lex, first, card, drill, spell = vocab_pools(tbk, conv)
    chart = tfield(tbk, 0xd96c0)[0]
    lemmas = {}
    for k, lf, hd, gc, gd, c, f in zip(VOC_KEYS, lex, first, card, drill,
                                       VOC_CLIPS, VOC_FREQ):
        lemmas[k] = {'greek': hd, 'translit': k, 'lexicalForm': lf,
                     'gloss': gc, 'glossShort': gc, 'audio': aud(c),
                     'ntFreq': f,
                     'senses': [{'greek': hd, 'caseTag': None,
                                 'glossShort': gd, 'audio': aud(c)}]}
    return {'_comment': (
        'Chapter 14 lexicon, assembled from 14_2AOR.TBK (cohort 5I). Ten '
        'lemmas, no case splits. The flashcard pool (0x16a34), the drill '
        'pool (0xb2d9a) and the speller pool (0xf3572) are IDENTICAL in '
        'this chapter, so gloss and glossShort carry the same string; '
        'ntFreq from the Review chart (0xd96c0).'),
        'lemmas': lemmas, 'exampleWords': {}}


# -------------------------------------------------------------------- main
def main():
    committed = (sys.argv[6] if len(sys.argv) > 6 else
                 os.path.join(os.path.dirname(os.path.abspath(__file__)),
                              '..', 'src', 'data', 'chapt-14.json'))
    tbk_path, fontmap_path, ch13_path, wavlist_path, outdir = sys.argv[1:6]
    outfile = os.path.join(outdir, 'chapt-14.json')
    if os.path.exists(outfile) and not os.environ.get(
            'ALLOW_REGRESSIVE_REBUILD'):
        raise SystemExit('STOP: Stage 8.7 -- chapt-14.json exists.')
    shipped = {l.strip().lower().rsplit('.', 1)[0]
               for l in open(wavlist_path) if l.strip()}
    tbk = Tbk(tbk_path)
    tbk.greek_fmts = underline.vote_greek_fmts(
        tbk.data, [text_off(tbk, o) for o in TEACH_OFFSETS])
    conv = make_conv11(json.load(open(fontmap_path, encoding='utf-8')))
    ch13 = json.load(open(ch13_path, encoding='utf-8'))
    txt = sanitized(tbk.data)

    learn_scr = learn_scripture(tbk, conv)
    parsing = parsing_drill(tbk, conv, txt)
    forms = forms_drill(tbk, conv, txt)
    gk, en = vocab_drills(tbk, conv)
    ch = {
        '_comment': (
            'Chapter 14 (Second Aorist Verbs), assembled from 14_2AOR.TBK + '
            'CHAPT_14 audio + ch14railwalk.pdf under PIPELINE-INSIGHTS-v3 '
            'Stage 8 and DISCLOSURE-RULES. Behavior fields per '
            'DRILLBEHAVIORLEDGER.csv rows 125-134 (CONFIRMED 2026-08-29).'),
        'id': 'chapt_14', 'number': 14, 'title': 'Second Aorist Verbs',
        'objectivesPreamble': 'You will be able to:',
        'objectives': objectives(tbk), 'vocab': VOC_KEYS,
        'learn': [], 'drill': [], 'exercise': [], 'quickReview': [],
        'feedback': ch13['feedback'], 'sequence': [],
        '_audioVerify': (
            'CHAPT_14 ships 145 WAVs, all 145 present in the audio manifest. Every verb carries a PAIR: n_<verb>p '
            'is the present lemma and n_<verb>a the second aorist. The Forms '
            'Drill and the Forms Speller both dispatch the AORIST half '
            '(A1b). Strays: n_sm7 (the SayWord table lists it; the six-word '
            'Mat 6:10c pool never reaches it).')}
    ch['learn'] = [
        {'id': 'c14_learn_objectives', 'type': 'contentAudio',
         'mode': 'objectivesPage', 'title': 'Learn Chapter Objectives',
         'instructions': ''},
        english_concepts(tbk, conv), learn_second_aorist(tbk, conv),
        {'id': 'c14_learn_vocab', 'type': 'contentAudio', 'mode': 'flashcard',
         'title': 'Learn Vocabulary', 'pool': 'senses'},
        learn_scr, bibliography(tbk)]
    ch['drill'] = [parsing, forms, translation_drill(tbk, conv, txt), gk, en,
                   scripture_drill(tbk, conv)]
    ch['exercise'] = [aorist_speller(tbk, conv, parsing),
                      forms_speller(tbk, conv, forms),
                      vocab_speller(tbk, conv), scripture_speller(tbk, conv)]
    ch['quickReview'] = ([qr_vocab(tbk, conv)] + qr_pages(tbk, conv)
                         + qr_scriptures(ch13, learn_scr))
    ch['sequence'] = [
        'c14_learn_objectives', 'c14_learn_english_concepts',
        'c14_learn_second_aorist', 'c14_drill_parsing', 'c14_drill_forms',
        'c14_drill_translation', 'c14_ex_speller', 'c14_ex_speller_forms',
        'c14_learn_vocab', 'c14_drill_vocab_gk_en', 'c14_drill_vocab_en_gk',
        'c14_ex_vocab_speller', 'c14_learn_scripture',
        'c14_drill_scripture_memory', 'c14_ex_scripture_speller',
        'c14_qr_vocab', 'c14_qr_paradigms', 'c14_qr_forms',
        'c14_qr_scripture_mat633a', 'c14_qr_scripture_mat633b',
        'c14_qr_scripture_mat69', 'c14_qr_scripture_mat610a',
        'c14_qr_scripture_mat610c', 'c14_learn_bibliography']
    ch['_sequence_note'] = ('Rail order from ch14railwalk.pdf, cross-checked '
                            'against the Drill / Exercise / Quick Review '
                            'menus on its last page.')
    hint_act = act_chart(tbk, 0xfcff0, 'hintSecondAoristActive', say=None,
                         lower=True)
    hint_mid = mid_chart(tbk, 0xfcff0, 'hintSecondAoristMiddle', say=None)
    hint_act['title'] = 'Aorist Active of λαμβάνω'
    hint_mid['title'] = 'Aorist Middle of γίνομαι  (I become)'
    ch['hintCharts'] = {
        'secondAoristParadigms': {
            'charts': [hint_act, hint_mid],
            '_note': ('Field 0xfcff0 holds BOTH charts on one hint screen '
                      '(4.7 source fidelity: transcribed from the hint\'s '
                      'own screen, whose titles read "Aorist", not "Second '
                      'Aorist", and which carries no say-all and no '
                      'deponent note). Two charts -> the 4.1 toggle; the '
                      'one differing word is Greek, so the label is '
                      'More/Back, never the Greek pair (4.1, N-2).')},
        'secondAoristForms': {
            'charts': [{'type': 'paradigm', 'id': 'hintSecondAoristForms',
                        'title': 'Second Aorist Verb Forms',
                        'columns': ['Present', 'Second Aorist'],
                        'rows': [
                            {'label': gl,
                             'cells': [{'greek': lemma, 'audio': aud(cp)},
                                       {'greek': aor, 'audio': aud(ca)}]}
                            for lemma, aor, gl, cp, ca in STEMS]}],
            '_note': ('The Forms Drill hint (0xaf024) prints the whole verb '
                      'list as a two-column present/aorist table; emitted as '
                      'a paradigm so both columns tap.')}}
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
            raise SystemExit(f'STOP: emitted clip {cid} not in CHAPT_14 pack')
        if not tbk.has_clip(base) and not re.match(r'[jklm]_', base):
            raise SystemExit(f'STOP: emitted clip {cid} not referenced in TBK')
    errs = audit(ch)
    if errs:
        raise SystemExit('STOP: self-audit failed:\n' + '\n'.join(errs))
    ch = post_patches(ch)
    _self_check(ch, committed)
    os.makedirs(outdir, exist_ok=True)
    with open(outfile, 'w', encoding='utf-8') as f:
        json.dump(ch, f, ensure_ascii=False, indent=1)
    with open(os.path.join(outdir, 'lexicon-chapt14.json'), 'w',
              encoding='utf-8') as f:
        json.dump(build_lexicon(tbk, conv), f, ensure_ascii=False, indent=1)
    print(f'chapter 14: {len(ids)} distinct clips, '
          f'{len(ch["sequence"])} rail pages, '
          f'{sum(len(a.get("items", [])) for a in ch["drill"] + ch["exercise"])}'
          ' scored items. OK.')


def post_patches(doc):
    """Stage 8.7 invariants, plus ratified round-21 hand repairs."""
    # RULED 2026-08-29 (Nathanael): the TBK and ch14railwalk.pdf p3 both
    # print the augment in PARENTHESES here -- "an (e) augment" -- where
    # chapter 15 prints it in quotes. Round 21 normalised ch14 to quotes,
    # losing a real difference between the two screens. The parenthesised
    # original stands; nothing to patch.
    sp = [a for a in doc['exercise']
          if a['id'] == 'c14_ex_scripture_speller'][0]
    assert 'Repeat This Exercise' not in sp['ui']['checkboxes']   # D-42
    assert 'Major Hint' not in sp['ui']['buttons']                # C8 / D-30
    fd = [a for a in doc['drill'] if a['id'] == 'c14_drill_forms'][0]
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
            f'chapt-14.json at {len(bad)} path(s). The committed file may '
            'carry a hand repair this script does not reproduce -- absorb it '
            'into post_patches() first. Set ALLOW_REGRESSIVE_REBUILD=1 only '
            'if the difference IS the intended change.\n  '
            + '\n  '.join(sorted(bad)[:20]))


if __name__ == '__main__':
    main()
