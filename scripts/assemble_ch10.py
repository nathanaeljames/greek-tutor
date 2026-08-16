#!/usr/bin/env python3
"""assemble_ch10.py -- chapter 10 (Future Indicative Verbs) from
10_FUTUR.TBK. Cohort 5G. Same discipline as assemble_ch9.py; see its
docstring. usage:

  assemble_ch10.py TBK font-map.json chapt-08.json chapt-09.json \
      wavlist_10.txt outdir

chapt-09.json must be the file assemble_ch9.py just wrote (Rom 6:23b is
lifted from it for this chapter's Quick Review).

Chapter-specific wiring notes (also in _audioVerify):
  * Parsing item 18's SayWord entry is BLANK in the original's dispatch
    table (a broken entry -- the item plays nothing). The form is
    lusomai, identical to item 5; wired to j_luwm1s as a fidelity
    restoration of evident intent.
  * The dispatch names are a trap: j_epa* are the PRESENT of eimi and
    j_eimi* the FUTURE; both mappings are table-read, not name-guessed.
  * Translation drill: item 1 plays j_TvD1, then item N plays
    j_TvD(N+1) -- j_TvD2 was orphaned when an item was deleted after
    recording. The shifted mapping is preserved exactly.
  * l_eimi is dispatched from a blank-keyed entry on the Learn pages;
    wired to the standalone word eimi (chart title tap), listen.
"""
import json
import os
import re
import struct
import sys
import unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import underline
from assemble_ch9 import (Tbk, make_conv, conv_mixed, para_blocks,
                          numbered_split, dash, sq, stepper_ui, score_ui,
                          audit)

A = 'chapt_10_'

# chapter-10 teaching prose fields, for the chapter-wide Greek-format vote
TEACH_OFFSETS = [0xf306, 0x12d22, 0x10ce6, 0x132c0, 0x11a68, 0x164dc,
                 0xd08c, 0x185aa, 0x18e8e, 0x19764, 0x19e6a, 0x1a74a,
                 0x1f7a4, 0x32d6]


def aud(name):
    return A + name


# ------------------------------------------------------------- paradigms

FA_FORMS = ['λύσω', 'λύσεις', 'λύσει', 'λύσομεν', 'λύσετε', 'λύσουσι(ν)']
FA_LEG = ['lu<sw', 'lu<seij', 'lu<sei', 'lu<somen', 'lu<sete', 'lu<sousi']
FA_CLIPS = ['j_luw1s', 'j_luw2s', 'j_luw3s', 'j_luw1p', 'j_luw2p', 'j_luw3p']
FA_GLOSS = ['I will loose', 'You will loose', 'He/she/it will loose',
            'We will loose', 'You will loose', 'They will loose']

FM_FORMS = ['λύσομαι', 'λύσῃ', 'λύσεται', 'λυσόμεθα', 'λύσεσθε', 'λύσονται']
FM_LEG = ['lu<somai', 'lu<s^', 'lu<setai', 'luso<meqa', 'lu<sesqe',
          'lu<sontai']
FM_CLIPS = ['j_luwm1s', 'j_luwm2s', 'j_luwm3s', 'j_luwm1p', 'j_luwm2p',
            'j_luwm3p']
FM_GLOSS = ['I will loose (for myself)', 'You will loose (for yourself)',
            'He/she/it will loose (for himself/herself/itself)',
            'We will loose (for ourselves)',
            'You will loose (for yourselves)',
            'They will loose (for themselves)']

EI_FORMS = ['ἔσομαι', 'ἔσῃ', 'ἔσται', 'ἐσόμεθα', 'ἔσεσθε', 'ἔσονται']
EI_LEG = ['e@somai', 'e@s^', 'e@stai', 'e]so<meqa', 'e@sesqe', 'e@sontai']
EI_CLIPS = ['j_eimi1s', 'j_eimi2s', 'j_eimi3s', 'j_eimi1p', 'j_eimi2p',
            'j_eimi3p']
EI_GLOSS = ['I will be', 'You will be', 'He/she/it will be', 'We will be',
            'You will be', 'They will be']


def paradigm(tbk, off, pid, title, forms, legacy, clips, glosses, say):
    raw = tbk.field(off)
    for leg in legacy:
        if leg not in raw:
            raise SystemExit(f'STOP: {leg} not in chart at {off:#x}')
    rows = []
    for i, label in enumerate(['1.', '2.', '3.']):
        cells = []
        for j in range(2):
            k = i + 3 * j
            cells.append({'greek': forms[k], 'gloss': glosses[k],
                          'audio': aud(clips[k])})
        rows.append({'label': label, 'cells': cells})
    return {'type': 'paradigm', 'id': pid, 'title': title,
            'columns': ['Singular', 'Plural'], 'rows': rows,
            'sayWhole': say}


def fa_chart(tbk, off, pid='futureActiveParadigm'):
    return paradigm(tbk, off, pid, 'Future Active Indicative',
                    FA_FORMS, FA_LEG, FA_CLIPS, FA_GLOSS,
                    {'label': 'Say Paradigm', 'audio': aud('j_luwpar')})


def fm_chart(tbk, off, pid='futureMiddleParadigm'):
    return paradigm(tbk, off, pid, 'Future Middle Indicative',
                    FM_FORMS, FM_LEG, FM_CLIPS, FM_GLOSS,
                    {'label': 'Say Paradigm', 'audio': aud('j_lumpar')})


# --------------------------------------------------------------- parsing

# item -> clip, read from the dispatch table at 0x5deb0-0x5ec80.
# Item 18 is BLANK in the original (broken entry); j_luwm1s restores
# evident intent (same form as item 5).
PD_CLIPS = ['j_luwm3s', 'j_pa1p', 'j_luw2s', 'j_pm2s', 'j_luwm1s',
            'j_luw2p', 'j_luwm3p', 'j_pm2p', 'j_luwm2s', 'j_luw3p',
            'j_luwm1p', 'j_pm3p', 'j_pa3p', 'j_luw1s', 'j_luw1p',
            'j_pa1s', 'j_luw3s', 'j_luwm1s', 'j_pa2s', 'j_pm3s',
            'j_epa1s', 'j_epa2p', 'j_eimi2s', 'j_eimi2p', 'j_eimi1s',
            'j_eimi3s', 'j_eimi1p', 'j_epa3p', 'j_eimi3p', 'j_epa2s']

PN6 = ['First Singular', 'Second Singular', 'Third Singular',
       'First Plural', 'Second Plural', 'Third Plural']

EIMI_PRESENT = {'εἰμί': 0, 'εἶ': 1, 'ἐστί': 2, 'ἐστίν': 2, 'ἐσμέν': 3,
                'ἐστέ': 4, 'εἰσί': 5, 'εἰσίν': 5}
EIMI_FUTURE = {'ἔσομαι': 0, 'ἔσῃ': 1, 'ἔσται': 2, 'ἐσόμεθα': 3,
               'ἔσεσθε': 4, 'ἔσονται': 5}
ACT_END = [('ομεν', 3), ('ετε', 4), ('ουσι', 5), ('ουσιν', 5),
           ('εις', 1), ('ει', 2), ('ω', 0)]
MID_END = [('όμεθα', 3), ('ομεθα', 3), ('εσθε', 4), ('ονται', 5),
           ('εται', 2), ('ομαι', 0), ('ῃ', 1)]


def parse_form(form):
    """(tense, voice, pnIndex) from the bare form. Form-keyed for eimi:
    present eimi parses Active; future eimi parses ACTIVE too -- the original's
    answer key grades all six future-eimi items Future Active (walkthrough-verified
    2026-08-15 against ch10parsingdrill.pdf; its own chart is titled 'Future Active
    Indicative of eimi'). The earlier Middle derivation was wrong against the key."""
    f = unicodedata.normalize('NFC', form)
    if f in EIMI_PRESENT:
        return 'Present', 'Active', EIMI_PRESENT[f]
    if f in EIMI_FUTURE:
        return 'Future', 'Active', EIMI_FUTURE[f]
    base = f.replace('(ν)', '')
    stem_fut = base.startswith('λύσ') or base.startswith('λυσ')
    stem_pres = base.startswith('λύ') and not stem_fut or \
        base.startswith('λυ') and not stem_fut
    if not (stem_fut or stem_pres):
        raise SystemExit(f'STOP: unknown stem in {form!r}')
    tense = 'Future' if stem_fut else 'Present'
    body = base[3:] if stem_fut else base[2:]
    nf = unicodedata.normalize('NFD', base)
    for end, pn in MID_END:
        if unicodedata.normalize('NFC', base).endswith(end):
            return tense, 'Middle', pn
    for end, pn in ACT_END:
        if unicodedata.normalize('NFC', base).endswith(end):
            return tense, 'Active', pn
    raise SystemExit(f'STOP: cannot parse {form!r}')


def parsing_drill(tbk, conv):
    prompts = [sq(conv(x)) for x in tbk.pool(0xe7ef2, 30, 'parsing prompts')]
    trans = [sq(x) for x in tbk.pool(0xe8fb8, 30, 'parsing translations')]
    items = []
    for i, (g, t) in enumerate(zip(prompts, trans)):
        tense, voice, pn = parse_form(g)
        clip = PD_CLIPS[i]
        if i != 17 and not tbk.has_clip(clip):
            raise SystemExit(f'STOP: {clip} not in TBK')
        items.append({'greek': g, 'translate': t,
                      'answer': [tense, voice, PN6[pn]],
                      'audio': aud(clip)})
    # rail walk: item 1 = lusetai -> Future / Middle / Third Singular
    assert items[0]['answer'] == ['Future', 'Middle', 'Third Singular']
    # cross-assert: dispatched clip family must agree with the derived
    # tense/voice on all 30 items (epa/eimi before pa; luwm before luw)
    FAMILY = [('j_epa', ('Present', 'Active')),
              ('j_eimi', ('Future', 'Middle')),
              ('j_luwm', ('Future', 'Middle')),
              ('j_luw', ('Future', 'Active')),
              ('j_pa', ('Present', 'Active')),
              ('j_pm', ('Present', 'Middle'))]
    for i, it in enumerate(items):
        base = it['audio'][len(A):]
        fam = next(tv for pre, tv in FAMILY if base.startswith(pre))
        if tuple(it['answer'][:2]) != fam:
            raise SystemExit(
                f'STOP: item {i + 1} {it["greek"]!r} derived '
                f'{it["answer"][:2]} but clip {base} implies {fam}')
    note = sq(' '.join(l.strip() for l in
                       tbk.field(0xee0c8).split('\r\n') if l.strip()))
    return {
        'id': 'c10_drill_parsing', 'type': 'select', 'mode': 'twoStageGrid',
        'title': 'Future Indicative Parsing Drill',
        'instructions': 'Click first on the tense, voice and person last',
        'promptIsGreek': True, 'options': 'static',
        'optionStages': [
            {'label': 'Tense', 'values': ['Present', 'Future']},
            {'label': 'Voice', 'values': ['Active', 'Middle']},
            {'label': 'Person / Number',
             'values': ['First Singular', 'First Plural',
                        'Second Singular', 'Second Plural',
                        'Third Singular', 'Third Plural'],
             'optionGroups': [2, 2, 2]}],
        'note': note,
        'items': items, 'scored': True,
        'ui': stepper_ui(hint='futureParadigms', translate=True),
        '_stage_note': (
            'THREE optionStages -- the twoStageGrid component generalizes '
            'to N stages; selections accumulate and the guess commits on '
            'the FINAL (person/number) click, per the original\'s own '
            'instruction line and the c8_drill_case semantics '
            '(VERIFY-5F item 7).'),
        '_answer_note': (
            'answer is [tense, voice, personNumber], derived from the '
            'form. Present-tense eimi items parse Active; future eimi '
            'parse Middle (deponent future) -- form-keyed, one eimi item '
            'queued for DOSBox confirmation. Item 18\'s dispatch entry is '
            'blank in the original; j_luwm1s wired (same form as item 5).'),
        'audioTiming': 'beforeGuess',
        'answerPolicy': {'advanceClass': 'manualOnIncorrect',
                         'attemptsPerItem': 1}}


# ----------------------------------------------------------- translation

TD_COL = [1, 2, 0, 2, 0, 0, 1, 2, 0, 2, 2, 1, 0, 2, 2, 0, 0, 2, 1, 1,
          2, 1, 0, 1, 0, 0, 2, 2, 0, 1, 0]
TD_CLIPS = ['j_TvD1'] + [f'j_TvD{n + 1}' for n in range(2, 32)]


def translation_drill(tbk, conv):
    l1 = [sq(conv(x)) for x in tbk.pool(0x8b8cc, 31, 'td line1')]
    l2raw = tbk.pool(0x8eb82, 31, 'td line2', allow_blank=True)
    l2 = [sq(conv(x)) if x.strip() else None for x in l2raw]
    refs = [sq(x) for x in tbk.pool(0x8e7c8, 31, 'td refs')]
    cols = [[sq(x) for x in tbk.pool(off, 31, f'td col {k}')]
            for k, off in (('A', 0x8d56e), ('B', 0x8dd78), ('C', 0x8e348))]
    items = []
    for i in range(31):
        opts = [cols[0][i], cols[1][i], cols[2][i]]
        clip = TD_CLIPS[i]
        if not tbk.has_clip(clip):
            raise SystemExit(f'STOP: {clip} not in TBK')
        items.append({'greek': l1[i], 'greek2': l2[i], 'ref': refs[i],
                      'options': opts, 'answer': opts[TD_COL[i]],
                      'audio': aud(clip)})
    assert items[0]['answer'] == 'nor will he hear his voice'
    return {
        'id': 'c10_drill_translation', 'type': 'select',
        'mode': 'fullOptionGrid',
        'title': 'Future Indicative Translation Drill',
        'instructions': 'Click on the correct English translation',
        'promptIsGreek': True, 'options': 'perItem',
        'optionLayout': 'stack1col',
        'items': items, 'scored': True,
        'ui': stepper_ui(hint='futureParadigms'),
        '_answer_note': (
            'Answer column derived per item from the future verb\'s '
            'person/number plus explicit subject/object nouns; rail walk '
            'confirms item 1. Audio mapping is the original\'s shifted '
            'table: item 1 -> j_TvD1, item N -> j_TvD(N+1); j_TvD2 was '
            'orphaned by a deleted item and is NOT referenced.'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'manualOnIncorrect',
                         'attemptsPerItem': 1}}


# -------------------------------------------------------------- spellers

SPELL_FORMS = ([f.replace('(ν)', '') for f in FA_FORMS] +
               FM_FORMS + EI_FORMS)
SPELL_CLIPS = FA_CLIPS + FM_CLIPS + EI_CLIPS

ROOTS = [('ἔχω', 'j_exw'), ('ἕξω', 'j_ecw'),
         ('βλέπω', 'j_blepw'), ('βλέψω', 'j_blepsw'),
         ('γράφω', 'j_grapw'), ('γράψω', 'j_grapsw'),
         ('μένω', 'j_menw'), ('μενῶ', 'j_menww'),
         ('ἀποστέλλω', 'j_apostw'), ('ἀποστελῶ', 'j_aposww'),
         ('σῴζω', 'j_swzw'), ('σώσω', 'j_swsw'),
         ('ἀκούω', 'j_akouw'), ('ἀκούσομαι', 'j_akousa'),
         ('λαμβάνω', 'j_lamban'), ('λήμψομαι', 'j_lhmps'),
         ('γινώσκω', 'j_ginwsk'), ('γνώσομαι', 'j_gnwsam'),
         ('ἔρχομαι', 'j_erxoma'), ('ἐλεύσομαι', 'j_eleusa'),
         ('πορεύομαι', 'j_poreuo'), ('πορεύσομαι', 'j_poreus')]
ROOTS_LEG = ['e@xw', 'e!cw', 'ble<pw', 'ble<yw', 'gra<fw', 'gra<yw',
             'me<nw', 'menw?', 'a]poste<llw', 'a]postelw?', 's&<zw',
             'sw<sw', 'a]kou<w', 'a]kou<somai', 'lamba<nw', 'lh<myomai',
             'ginw<skw', 'gnw<somai', 'e@rxomai', 'e]leu<somai',
             'poreu<omai', 'poreu<somai']


def speller_ui(fields):
    return {'fields': fields,
            'buttons': ['Pronounce', 'Previous', 'Score', 'Next',
                        'Check Answer', 'Greek Keyboard'],
            'checkboxes': ['Show Answer', 'With Accents',
                           'Pronounce Each Exercise'],
            'defaults': {'pronounceEach': True}}


def future_speller(tbk, conv):
    prompts = [sq(x) for x in tbk.pool(0x54ffc, 18, 'future speller prompts')]
    items = [{'prompt': p, 'answer': a, 'audio': aud(c)}
             for p, a, c in zip(prompts, SPELL_FORMS, SPELL_CLIPS)]
    return {
        'id': 'c10_ex_speller', 'type': 'spell',
        'title': 'Future Indicative Spelling Exercise',
        'instructions': 'Click letters below or use your keyboard to spell it out.',
        'prompt': 'item', 'promptLabel': 'English',
        'accentsOptional': True, 'spellerTilesRef': 'chapt_1',
        'items': items, 'ui': speller_ui(['English', 'Spell Greek']),
        '_answer_note': (
            'Items 1-6/7-12/13-18 are the Future Active, Future Middle '
            'and future-of-eimi paradigm forms, each asserted against its '
            'chart field; lusousi is spelled WITHOUT the movable nu, '
            'matching the parsing pool (movable-nu leniency is withdrawn, '
            'D-16 revoked).'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


def roots_speller(tbk, conv):
    prompts = [sq(x) for x in tbk.pool(0x952ea, 22, 'roots prompts')]
    if prompts[21] != 'I will go':
        raise SystemExit(f'STOP: roots prompt 22 unexpected: {prompts[21]!r}')
    for leg in ROOTS_LEG:
        if leg.encode() not in tbk.data:
            raise SystemExit(f'STOP: roots form {leg!r} not found in TBK')
    items = [{'prompt': p, 'answer': g, 'audio': aud(c)}
             for p, (g, c) in zip(prompts, ROOTS)]
    return {
        'id': 'c10_ex_speller_roots', 'type': 'spell',
        'title': 'Future Indicative Roots Spelling Exercise',
        'instructions': 'Click letters below or use your keyboard to spell it out.',
        'prompt': 'item', 'promptLabel': 'English',
        'accentsOptional': True, 'spellerTilesRef': 'chapt_1',
        'items': items, 'ui': speller_ui(['English', 'Spell Greek']),
        '_answer_note': (
            '22 items = 11 present/future pairs; every form is asserted '
            'against a chart, stem-variation popup or drill pool in this '
            'TBK, and every clip is table-read from the dispatch at '
            '0xd6c65/0xd7090. Prompt 22 carries a stale-tail overflow in '
            'the raw pool ("I will gooo...") trimmed to the evident '
            '"I will go".'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


# ----------------------------------------------------------------- vocab

VOC_KEYS = ['zoe', 'thanatos', 'krino', 'meno', 'monos', 'nyn', 'oude',
            'paulos', 'sozo', 'tote']
VOC_CLIPS = [f'j_voc{i}' for i in range(1, 11)]
VOC_FREQ = [135, 120, 114, 118, 114, 147, 143, 158, 106, 160]
LEXICAL = ['ζωή, -ῆς, ἡ', 'θάνατος, -ου, ὁ', 'κρίνω', 'μένω',
           'μόνος, -η, -ον', 'νῦν', 'οὐδέ', 'Παῦλος, -ου, ὁ', 'σῴζω',
           'τότε']
LEX_LEG = ['zwh<, -h?j, h[', 'qa<natoj, -ou, o[', 'kri<nw', 'me<nw',
           'mo<<noj, -h, -on', 'nu?n', 'ou]de<', 'Pau?loj, -ou, o[',
           's&<zw', 'to<te']


def vocab_pools(tbk, conv):
    greek = [conv(x) for x in tbk.pool(0x4770a, 10, 'vocab greek')]
    gloss_drill = [sq(x) for x in tbk.pool(0x21668, 10, 'vocab drill glosses')]
    gloss_full = [sq(x) for x in tbk.pool(0x8b36, 10, 'flashcard glosses')]
    flash_raw = tbk.pool(0x877a, 10, 'flashcard lexical forms')
    for leg, want in zip(flash_raw, LEX_LEG):
        if sq(leg) != want:
            raise SystemExit(
                f'STOP: flashcard lexical form {sq(leg)!r} != {want!r}')
    return greek, gloss_drill, gloss_full


def vocab_drills(tbk, conv):
    greek, gloss, _ = vocab_pools(tbk, conv)
    gk_items = [{'greek': g, 'note': None, 'answer': gl, 'audio': aud(c)}
                for g, gl, c in zip(greek, gloss, VOC_CLIPS)]
    en_items = [{'prompt': gl, 'answer': g, 'audio': aud(c)}
                for g, gl, c in zip(greek, gloss, VOC_CLIPS)]
    gk = {'id': 'c10_drill_vocab_gk_en', 'type': 'select',
          'mode': 'fullOptionGrid',
          'title': 'Vocabulary:  Greek to English Drill',
          'instructions': 'Click on the matching word',
          'promptIsGreek': True, 'options': 'static',
          'optionValues': gloss, 'items': gk_items, 'scored': True,
          'ui': score_ui(), 'audioTiming': 'beforeGuess',
          'answerPolicy': {'advanceClass': 'autoBoth', 'attemptsPerItem': 1}}
    en = {'id': 'c10_drill_vocab_en_gk', 'type': 'select',
          'mode': 'fullOptionGrid',
          'title': 'Vocabulary: English to Greek Drill',
          'instructions': 'Click on the matching word',
          'options': 'static', 'optionsAreGreek': True,
          'optionValues': greek, 'items': en_items, 'scored': True,
          'ui': score_ui(), 'audioTiming': 'afterGuess',
          'answerPolicy': {'advanceClass': 'autoBoth', 'attemptsPerItem': 1}}
    return gk, en


def vocab_speller(tbk, conv):
    greek, _, _ = vocab_pools(tbk, conv)
    glosses = [sq(x) for x in tbk.pool(0xf30d0, 10, 'vocab speller glosses')]
    items = [{'prompt': gl, 'answer': g, 'audio': aud(c)}
             for gl, g, c in zip(glosses, greek, VOC_CLIPS)]
    return {
        'id': 'c10_ex_vocab_speller', 'type': 'spell',
        'title': 'Vocabulary Spelling Exercise',
        'instructions': 'Click letters below or use your keyboard to spell it out.',
        'prompt': 'item', 'promptLabel': 'English Meaning',
        'accentsOptional': True, 'spellerTilesRef': 'chapt_1',
        'items': items,
        'ui': speller_ui(['English Meaning', 'Spell Greek Word']),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


# ------------------------------------------------------------- scripture

VERSE = ['ζητεῖτε', 'δὲ', 'πρῶτον', 'τὴν', 'βασιλείαν', 'τοῦ', 'θεοῦ',
         'καὶ', 'τὴν', 'δικαιοσύνην', 'αὐτοῦ,']
GLOSS = ['Seek', 'but', 'first', 'the', 'kingdom', 'of', 'God', 'and',
         'the', 'righteousness', 'his']
SM_POSITIONS = [1, 2, 3, 4, 5, 6, 7, 8, 10, 11]
SM_OPTS = ['and', 'kingdom', 'but', 'righteousness', 'first',
           'the (acc.)', 'God', 'the (gen.)', 'his', 'you seek']
SM_ANSWERS = {'ζητεῖτε': 'you seek', 'δὲ': 'but', 'πρῶτον': 'first',
              'τὴν': 'the (acc.)', 'βασιλείαν': 'kingdom',
              'τοῦ': 'the (gen.)', 'θεοῦ': 'God', 'καὶ': 'and',
              'δικαιοσύνην': 'righteousness', 'αὐτοῦ': 'his'}


def learn_scripture(tbk, conv):
    raw = tbk.field(0x4c7fe)  # LIVE copy (0xc58fa is stale: no tou qeou)
    for leg in ['zhtei?te', 'basilei<an', 'tou?', 'qeou?', 'dikaiosu<nhn']:
        if leg not in raw:
            raise SystemExit(f'STOP: {leg} not in live interlinear 0x4c7fe')
    words = [{'greek': w, 'gloss': gl, 'audio': aud(f'j_sm{k}')}
             for w, gl, k in zip(VERSE, GLOSS, range(1, 12))]
    return {'id': 'c10_learn_scripture', 'type': 'contentAudio',
            'mode': 'interlinearVerse', 'title': 'Learn Scripture Memory',
            'reference': 'Mat 6:33a', 'words': words,
            'sayWhole': {'label': 'Say Whole Verse',
                         'audio': aud('j_mt633a')},
            '_field_note': (
                'Two interlinear copies exist; 0xc58fa is STALE (missing '
                'tou qeou). This page reads the live copy at 0x4c7fe, '
                'whose au]tou,? encoding artifact normalizes to the '
                'comma-after form.')}


def scripture_drill(tbk, conv):
    prompts = [sq(conv(x)) for x in tbk.pool(0x9af7c, 10, 'sm prompts')]
    items = []
    for g, pos in zip(prompts, SM_POSITIONS):
        base = unicodedata.normalize('NFC', g.rstrip('.,'))
        want = unicodedata.normalize(
            'NFC', VERSE[pos - 1].rstrip('.,'))
        # the drill pool prints standalone accents (de/thn acute); accept
        # the grave-vs-acute final-accent alternation only
        if base.replace('\u0301', '') != want.replace('\u0300', '') and \
                unicodedata.normalize('NFD', base).replace('\u0301', '') != \
                unicodedata.normalize('NFD', want).replace('\u0300', ''):
            raise SystemExit(f'STOP: SM prompt {g!r} != verse word {pos}')
        items.append({'greek': g,
                      'answer': SM_ANSWERS[VERSE[pos - 1].rstrip('.,')],
                      'audio': aud(f'j_sm{pos}')})
    return {'id': 'c10_drill_scripture_memory', 'type': 'select',
            'mode': 'fullOptionGrid', 'title': 'Scripture Memory Drill',
            'instructions': 'Click on the matching word',
            'promptIsGreek': True, 'options': 'static',
            'optionValues': SM_OPTS, 'items': items, 'scored': True,
            'ui': score_ui(),
            '_audio_note': (
                'Verse-position clips j_sm1..11 read from the SayWord '
                'table; the table\'s sm12-14 entries reference clips that '
                'never shipped (stale buffer from a 14-word verse) and '
                'are ignored. The duplicated article uses position 4.'),
            'audioTiming': 'beforeGuess',
            'answerPolicy': {'advanceClass': 'autoBoth',
                             'attemptsPerItem': 1}}


def scripture_speller(tbk, conv):
    raw = tbk.field(0xba5c8)
    for leg in ['zhtei?te', 'dikaiosu<nhn']:
        if leg not in raw:
            raise SystemExit(f'STOP: {leg} not in speller answer field')
    return {
        'id': 'c10_ex_scripture_speller', 'type': 'spellVerse',
        'title': 'Scripture Memory Spelling Exercise',
        'instructions': 'Enter all of Mat 6:33a then click "Check Answer"',
        'reference': 'Mat 6:33a',
        'answerWords': VERSE,
        'translation': 'but seek first the kingdom of God and his righteousness',
        'accentsOptional': True, 'punctuationOptional': True,
        'audio': aud('j_mt633a'), 'spellerTilesRef': 'chapt_1',
        'repeatCheckbox': True,
        'ui': {'fields': ['Spell Greek'],
               'buttons': ['Pronounce', 'Check Answer', 'Greek Keyboard',
                           'Restart Exercise'],
               'checkboxes': ['Show Answer', 'With Accents',
                              'Repeat This Exercise'],
               '_reveal_note': 'RULES C8 / D-30.',
               '_repeat_note': (
                   '"Repeat This Exercise" checkbox as in chapter 9 '
                   '(label at 0xba6ec, this page). Same modeling, same '
                   'VERIFY-5G item.')},
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


# ----------------------------------------------------------------- learn

STEM_POPUPS = [
    ('palatal', 'After a Palatal', 0x185aa,
     [('ἔχω', 'j_exw', 'ἕξω', 'j_ecw', None),
      ('ἄγω', 'j_agw', 'ἄξω', 'j_acw', None)]),
    ('labial', 'After a Labial', 0x18e8e,
     [('βλέπω', 'j_blepw', 'βλέψω', 'j_blepsw', None),
      ('γράφω', 'j_grapw', 'γράψω', 'j_grapsw', None)]),
    ('dental', 'After a Dental', 0x19764,
     [('πείθω', 'j_peithw', 'πείσω', 'j_peisw', None)]),
    ('liquid', 'After a Liquid', 0x19e6a,
     [('μένω', 'j_menw', 'μενῶ', 'j_menww', None),
      ('ἀποστέλλω', 'j_apostw', 'ἀποστελῶ', 'j_aposww', None)]),
    ('sibilant', 'After a Sibilant', 0x1a74a,
     [('σῴζω', 'j_swzw', 'σώσω', 'j_swsw', None)])]


FORMULA_MAP = {'k': 'κ', 'g': 'γ', 'x': 'χ', 'p': 'π', 'b': 'β',
               'f': 'φ', 't': 'τ', 'd': 'δ', 'q': 'θ', 'l': 'λ',
               'm': 'μ', 'n': 'ν', 'r': 'ρ', 's': 'σ', 'z': 'ζ',
               'c': 'ξ', 'y': 'ψ', 'w': 'ω'}


def formula_conv(text):
    """Convert STANDALONE single Latin letters (the original's bare
    Greek consonants in formula notation) to Greek; words untouched."""
    return re.sub(r'(?<![A-Za-z])([kgxpbftdqlmnrszcyw])(?![A-Za-z])',
                  lambda m: FORMULA_MAP[m.group(1)], text)


def stem_popup(tbk, conv, pid, title, off, pairs):
    """Popup title carries the consonant group; rows parsed from the
    '==>' lines with glosses, each converted form asserted."""
    raw = tbk.field(off)
    lines = [l for l in raw.split('\r\n') if l.strip()]
    full_title = formula_conv(sq(lines[0]))
    if not full_title.startswith(title):
        raise SystemExit(f'STOP: popup title {full_title!r} != {title!r}*')
    arrow_lines = [l for l in lines[1:] if '==>' in l]
    if len(arrow_lines) != len(pairs):
        raise SystemExit(f'STOP: popup {pid}: {len(arrow_lines)} rows, '
                         f'expected {len(pairs)}')
    rows = []
    for (pg, pc, fg, fc, _), line in zip(pairs, arrow_lines):
        left, right = line.split('==>')
        got_p = conv(left.strip())
        rest = right.strip().split(None, 1)
        got_f = conv(rest[0])
        gloss = sq(rest[1]) if len(rest) > 1 else None
        for got, want in ((got_p, pg), (got_f, fg)):
            if unicodedata.normalize('NFC', got) != \
                    unicodedata.normalize('NFC', want):
                raise SystemExit(
                    f'STOP: popup {pid}: {got!r} != expected {want!r}')
        row = {'present': {'greek': pg, 'audio': aud(pc)},
               'future': {'greek': fg, 'audio': aud(fc)}}
        if gloss:
            row['future']['gloss'] = gloss
        rows.append(row)
    return {'id': pid, 'title': full_title,
            'content': [{'type': 'presentFutureRows', 'rows': rows}]}


def chart_topic_split(tbk, conv, off, n_rows, both_glosses):
    """Split a Deponent/Irregular Futures field into (paras_before,
    header_pair, row_glosses). Chart begins at the Present/Future
    header line; para text is everything above it."""
    raw = tbk.field(off)
    lines = raw.split('\r\n')[1:]
    hdr = next(i for i, l in enumerate(lines)
               if 'Present' in l and 'Future' in l)
    para_txt = ' '.join(l.strip() for l in lines[:hdr] if l.strip())
    paras = [{'type': 'para', 'text': sq(para_txt)}]
    glosses = []
    for l in lines[hdr + 1:]:
        parts = [sq(p) for p in re.split(r'\s{2,}', l.strip()) if p.strip()]
        glosses.extend(p for p in parts if p.startswith('I '))
    want = n_rows * 2 if both_glosses else n_rows
    if len(glosses) != want:
        raise SystemExit(f'STOP: chart at {off:#x}: {len(glosses)} '
                         f'glosses, expected {want}')
    return paras, glosses


def learn_future_verbs(tbk, conv):
    # Introduction: para + numbered items 1-3, PLAIN English parse (no
    # conversion pass at all -- "go?" matches the legacy circumflex
    # byte pattern and would mangle)
    raw_i = tbk.field(0xf306)
    body_i = ' '.join(l.strip() for l in raw_i.split('\r\n')[1:]
                      if l.strip())
    parts_i = re.split(r'\s(?=\d\))', ' ' + body_i)
    intro_lead = sq(parts_i[0])
    intro_items = [sq(re.match(r'\d\)\s*(.*)$', p.strip(), re.S).group(1))
                   for p in parts_i[1:]]
    if len(intro_items) != 3 or 'deliberative' not in intro_items[2]:
        raise SystemExit('STOP: intro items misparse')
    intro = [{'type': 'para', 'text': intro_lead},
             {'type': 'numbered', 'items': intro_items,
              'gapBefore': True}]
    # Introduction (cont.): para + centered worked example + closing para
    cont_raw = tbk.field(0x12d22)
    cont_lines = cont_raw.split('\r\n')[1:]
    fi = next(i for i, l in enumerate(cont_lines) if 'Stem' in l
              and 'Sigma' in l)
    cont_p1 = sq(' '.join(l.strip() for l in cont_lines[:fi] if l.strip()))
    formula = [sq(cont_lines[fi]),
               formula_conv(sq(conv_mixed(conv, cont_lines[fi + 1]))),
               sq(dash(sq(conv_mixed(conv, cont_lines[fi + 2])))
                  .replace('—', '— '))]
    if formula[1] != 'λύ + σ + ω' or not formula[2].startswith('(λύσω'):
        raise SystemExit(f'STOP: worked example misparse: {formula}')
    cont_tail = sq(' '.join(l.strip() for l in cont_lines[fi + 3:]
                            if l.strip()))
    intro_cont = [{'type': 'para', 'text': cont_p1, 'gapBefore': True},
                  {'type': 'para', 'text': '\n'.join(formula),
                   'align': 'center', 'gapBefore': True},
                  {'type': 'para', 'text': cont_tail, 'gapBefore': True}]

    # 5 Stem Variations: lead + numbered items with formula letters
    # converted (k,g,x -> kappa,gamma,chi etc.); brackets and ==> are
    # LITERAL notation from the original, never breathing marks
    def stem_items_from(off, start):
        raw = tbk.field(off)
        body = ' '.join(l.strip() for l in raw.split('\r\n')[1:]
                        if l.strip())
        parts = re.split(r'\s(?=\d\))', ' ' + body)
        lead = sq(parts[0])
        items = []
        for p in parts[1:]:
            m = re.match(r'(\d)\)\s*(.*)$', p.strip(), re.S)
            if not m or int(m.group(1)) != start + len(items):
                raise SystemExit(f'STOP: stem item misparse: {p[:50]!r}')
            it = formula_conv(sq(m.group(2)))
            it = re.sub(r'\s+(σ \+ \[)', r'\n\1', it)
            items.append(it)
        return lead, items

    stem_lead, stem_items = stem_items_from(0x10ce6, 1)
    _, stem_items2 = stem_items_from(0x132c0, 4)
    linked_items = []
    for it in stem_items + stem_items2:
        for pid in ['palatal', 'labial', 'dental', 'liquid', 'sibilant']:
            it = re.sub(r'\b%s\b' % pid,
                        f'[[link:{pid}]]{pid}[[/link]]', it, count=1)
        linked_items.append(it)
    if sum('[[link:' in it for it in linked_items) != 5:
        raise SystemExit('STOP: stem variation links did not all land')
    for want, it in zip(['( κ, γ, χ )', '( π, β, φ )', '( τ, δ, θ )',
                         '( λ, μ, ν, ρ )', '( σ, ζ )'], linked_items):
        if want not in it:
            raise SystemExit(f'STOP: consonant group {want} missing: {it!r}')
    linked = [{'type': 'para', 'text': stem_lead},
              {'type': 'numbered', 'items': linked_items,
               'gapBefore': True}]

    # Deponent / Irregular Futures: para above the chart, chart as rows
    dep_paras, dep_gl = chart_topic_split(tbk, conv, 0x11a68, 3, False)
    dep_rows = [
        {'present': {'greek': 'ἀκούω', 'audio': aud('j_akouw')},
         'future': {'greek': 'ἀκούσομαι', 'audio': aud('j_akousa'),
                    'gloss': dep_gl[0]}},
        {'present': {'greek': 'λαμβάνω', 'audio': aud('j_lamban')},
         'future': {'greek': 'λήμψομαι', 'audio': aud('j_lhmps'),
                    'gloss': dep_gl[1]}},
        {'present': {'greek': 'γινώσκω', 'audio': aud('j_ginwsk')},
         'future': {'greek': 'γνώσομαι', 'audio': aud('j_gnwsam'),
                    'gloss': dep_gl[2]}}]
    irr_paras, irr_gl = chart_topic_split(tbk, conv, 0x164dc, 2, True)
    irr_rows = [
        {'present': {'greek': 'ἔρχομαι', 'audio': aud('j_erxoma'),
                     'gloss': irr_gl[0]},
         'future': {'greek': 'ἐλεύσομαι', 'audio': aud('j_eleusa'),
                    'gloss': irr_gl[1]}},
        {'present': {'greek': 'γινώσκω', 'audio': aud('j_ginwsk'),
                     'gloss': irr_gl[2]},
         'future': {'greek': 'γνώσομαι', 'audio': aud('j_gnwsam'),
                    'gloss': irr_gl[3]}}]

    eimi_par = paradigm(
        tbk, 0x149c2, 'futureEimiParadigm', 'Future of εἰμί',
        EI_FORMS, EI_LEG, EI_CLIPS, EI_GLOSS,
        {'label': 'Say Paradigm', 'audio': aud('j_eimpar')})

    hdr_pf = ['[[u]]Present[[/u]]', '[[u]]Future[[/u]]']
    topics = [
        {'id': 'introduction', 'title': 'Introduction',
         'content': intro + intro_cont},
        {'id': 'futureActiveParadigm', 'title': 'Future Active Paradigm',
         'content': [fa_chart(tbk, 0xf99a)]},
        {'id': 'futureMiddleParadigm', 'title': 'Future Middle Paradigm',
         'content': [fm_chart(tbk, 0x10318)]},
        {'id': 'stemVariations', 'title': '5 Stem Variations',
         'content': linked},
        {'id': 'futureEimi', 'title': 'Future of εἰμί',
         'titleAudio': aud('l_eimi'),
         'content': [eimi_par]},
        {'id': 'deponentFutures', 'title': 'Deponent Futures',
         'content': dep_paras + [
             {'type': 'presentFutureRows', 'rows': dep_rows,
              'headers': hdr_pf, 'gapBefore': True}]},
        {'id': 'irregularFutures', 'title': 'Irregular Futures',
         'content': irr_paras + [
             {'type': 'presentFutureRows', 'rows': irr_rows,
              'headers': hdr_pf, 'gapBefore': True}]}]

    popups = [stem_popup(tbk, conv, pid, title, off, pairs)
              for pid, title, off, pairs in STEM_POPUPS]
    return {'id': 'c10_learn_future_verbs', 'type': 'contentAudio',
            'mode': 'topicPages',
            'title': 'Learn Future Indicative Verbs',
            'topics': topics, 'popups': popups, 'greekTaps': True,
            '_eimi_note': (
                'The topic title\'s standalone eimi taps to l_eimi, which '
                'the TBK dispatches from a blank-keyed entry; listen '
                '(VERIFY-5G). Present-eimi chart cells elsewhere use the '
                'ch7-forwarded g_eimi* clips.'),
            '_formula_note': (
                'Stem-variation letters and worked-example letters are '
                'bare font-Greek in the TBK (k,g,x = kappa,gamma,chi); '
                'converted by standalone-letter rule with brackets and '
                '==> arrows kept as LITERAL notation.')}


def english_concepts(tbk, conv):
    blocks = para_blocks(conv, tbk.field(0xd08c).split('\r\n'))
    return {'id': 'c10_learn_english_concepts', 'type': 'contentAudio',
            'mode': 'topicPages', 'title': 'Learn English Concepts',
            'topics': [{'id': 'introduction', 'title': 'Introduction',
                        'content': blocks}],
            '_single_topic_note': (
                'ONE topic only -- the original shows no radio list on '
                'this page. Renderer must hide the topic rail when '
                'topics.length == 1 (5G-SPEC1 renderer novelty).')}


def objectives(tbk, conv):
    raw = tbk.field(0x1f7a4).split('\r\n')
    items, cur = [], None
    for l in raw:
        s = l.strip()
        m = re.match(r'^(\d)\)\s*(.*)$', s)
        if m:
            if cur:
                items.append(sq(cur))
            if len(items) == 6:
                cur = None
                break
            cur = m.group(2)
        elif cur is not None and s and 'You will be able' not in s:
            cur += ' ' + s
    if cur:
        items.append(sq(cur))
    items = items[:6]
    if len(items) != 6 or 'Mat 6:33a' not in items[5]:
        raise SystemExit(f'STOP: objectives parse failed: {items}')
    return items


def bibliography(tbk):
    raw = tbk.field(0x32d6).split('\r\n')
    entries, cur = [], None
    for l in raw:
        if not l.strip():
            continue
        if re.match(r'^\s{0,6}[A-Z]', l):
            if cur:
                entries.append(sq(cur))
            cur = l.strip()
        elif cur:
            cur += ' ' + l.strip()
    if cur:
        entries.append(sq(cur))
    if not (2 <= len(entries) <= 6):
        raise SystemExit(f'STOP: bibliography parse: {entries}')
    return {'id': 'c10_learn_bibliography', 'type': 'contentAudio',
            'mode': 'textPage', 'title': 'Learn Bibliography',
            'content': [{'type': 'biblist', 'items': entries}]}


# ---------------------------------------------------------- quick review

def qr_vocab(tbk, conv):
    raw = tbk.field(0xcaf76)
    for leg in ['zwh<', 'to<te']:
        if leg not in raw:
            raise SystemExit('STOP: QR vocab chart mismatch')
    return {'id': 'c10_qr_vocab', 'type': 'contentAudio',
            'mode': 'reviewVocab', 'title': 'Review Vocabulary Chart',
            'pool': 'senses', 'columns': 2, 'showNtFreq': True,
            'footnote': ('The number after the translation is the number '
                         'of times the word occurs in the New Testament.'),
            'playAll': {'label': 'Say Whole List', 'audio': aud('j_vocl10')}}


def qr_paradigms(tbk, conv):
    return {'id': 'c10_qr_paradigms', 'type': 'contentAudio',
            'mode': 'paradigmChart', 'title': 'Review Future Paradigms',
            'paradigms': [fa_chart(tbk, 0x3d1e0, 'qrFutureActive'),
                          fm_chart(tbk, 0x3dfe6, 'qrFutureMiddle')]}


def qr_scriptures(ch8, ch9, learn_scr):
    def rekey(words, say, frm):
        w = [{'greek': x['greek'], 'gloss': x['gloss'],
              'audio': x['audio'].replace(frm, A)} for x in words]
        s = {'label': say['label'], 'audio': say['audio'].replace(frm, A)}
        return w, s
    out = []
    by8 = {a['id']: a for a in ch8['quickReview']}
    for nid, oid, title in [
            ('c10_qr_scripture_rom323', 'c8_qr_scripture_rom323',
             'Review Scripture Memory:  Rom 3:23'),
            ('c10_qr_scripture_jn11', 'c8_qr_scripture_jn11',
             'Review Scripture Memory:  Jn 1:1'),
            ('c10_qr_scripture_rom623a', 'c8_qr_scripture_rom623',
             'Review Scripture Memory:  Rom 6:23a')]:
        src = by8[oid]
        w, s = rekey(src['words'], src['sayWhole'], 'chapt_8_')
        out.append({'id': nid, 'type': 'contentAudio',
                    'mode': 'interlinearVerse', 'title': title,
                    'reference': src['reference'], 'words': w,
                    'sayWhole': s})
    by9 = {a['id']: a for a in ch9['quickReview']}
    src = by9['c9_qr_scripture_rom623b']
    w, s = rekey(src['words'], src['sayWhole'], 'chapt_9_')
    out.append({'id': 'c10_qr_scripture_rom623b', 'type': 'contentAudio',
                'mode': 'interlinearVerse',
                'title': 'Review Scripture Memory:  Rom 6:23b',
                'reference': 'Rom 6:23b', 'words': w, 'sayWhole': s})
    out.append({'id': 'c10_qr_scripture_mat633a', 'type': 'contentAudio',
                'mode': 'interlinearVerse',
                'title': 'Review Scripture Memory:  Mat 6:33a',
                'reference': 'Mat 6:33a',
                'words': learn_scr['words'],
                'sayWhole': learn_scr['sayWhole'],
                '_field_note': (
                    'QR copy read at 0xa22c6 (live, with tou qeou); the '
                    'copy at 0x43472 is stale and ignored.')})
    return out


def build_lexicon(tbk, conv):
    greek, gloss_drill, gloss_full = vocab_pools(tbk, conv)
    lemmas = {}
    for k, g, lx, gs, gf, c, f in zip(VOC_KEYS, greek, LEXICAL,
                                      gloss_drill, gloss_full,
                                      VOC_CLIPS, VOC_FREQ):
        lemmas[k] = {'greek': g, 'translit': k, 'lexicalForm': lx,
                     'gloss': gf, 'glossShort': gs, 'audio': aud(c),
                     'ntFreq': f,
                     'senses': [{'greek': g, 'caseTag': None,
                                 'glossShort': gs, 'audio': aud(c)}]}
    return {'_comment': (
        'Chapter 10 lexicon, assembled from 10_FUTUR.TBK (cohort 5G). '
        'lexicalForm carries the flashcard\'s full lexical entry (the '
        'raw mo<<noj doubled-accent-code typo normalizes to monos). '
        'ntFreq from the Review Vocabulary Chart at 0xcaf76.'),
        'lemmas': lemmas, 'exampleWords': {}}


# ------------------------------------------------------------------ main

def main():
    (tbk_path, fontmap_path, ch8_path, ch9_path, wavlist_path,
     outdir) = sys.argv[1:7]
    shipped = {l.strip().lower().rsplit('.', 1)[0]
               for l in open(wavlist_path) if l.strip()}
    tbk = Tbk(tbk_path)
    tbk.greek_fmts = underline.vote_greek_fmts(tbk.data, TEACH_OFFSETS)
    conv = make_conv(json.load(open(fontmap_path, encoding='utf-8')))
    ch8 = json.load(open(ch8_path, encoding='utf-8'))
    ch9 = json.load(open(ch9_path, encoding='utf-8'))

    learn_scr = learn_scripture(tbk, conv)
    ch = {
        '_comment': (
            'Chapter 10 (Future Indicative Verbs), assembled from '
            '10_FUTUR.TBK + CHAPT_10 audio + ch10railwalk.pdf under '
            'PIPELINE-INSIGHTS-v3 Stage 8. All answers derived and '
            'asserted; all clips table-read. Behavior stamped by '
            'apply-behavior-matrix.py from ledger rows 87-95.'),
        'id': 'chapt_10', 'number': 10,
        'title': 'Future Indicative Verbs',
        'objectivesPreamble': 'You will be able to:',
        'objectives': objectives(tbk, conv),
        'vocab': VOC_KEYS,
        'learn': [], 'drill': [], 'exercise': [], 'quickReview': [],
        'feedback': ch8['feedback'],
        'sequence': [],
        '_menu_note': (
            'The original\'s Drill Menu prints "Future Indication '
            'Translation Drill" (typo); the drill page itself says '
            '"Indicative", which this port uses on both surfaces.'),
        '_audioVerify': (
            'CHAPT_10 ships 183 WAVs. Flags: (1) parsing item 18 blank '
            'in the original\'s table, j_luwm1s wired (form of item 5); '
            '(2) j_TvD2 orphaned, unreferenced by design; (3) l_eimi '
            'wired to the standalone word eimi, listen; (4) j_epa* = '
            'PRESENT eimi, j_eimi* = FUTURE eimi, table-read.')}

    ch['learn'] = [
        {'id': 'c10_learn_objectives', 'type': 'contentAudio',
         'mode': 'objectivesPage', 'title': 'Learn Chapter Objectives',
         'instructions': ''},
        english_concepts(tbk, conv),
        learn_future_verbs(tbk, conv),
        {'id': 'c10_learn_vocab', 'type': 'contentAudio',
         'mode': 'flashcard', 'title': 'Learn Vocabulary',
         'pool': 'senses', 'flashcardGreek': 'lexicalForm'},
        learn_scr,
        bibliography(tbk)]

    gk, en = vocab_drills(tbk, conv)
    ch['drill'] = [parsing_drill(tbk, conv), translation_drill(tbk, conv),
                   gk, en, scripture_drill(tbk, conv)]
    ch['exercise'] = [future_speller(tbk, conv), roots_speller(tbk, conv),
                      vocab_speller(tbk, conv), scripture_speller(tbk, conv)]
    ch['quickReview'] = ([qr_vocab(tbk, conv), qr_paradigms(tbk, conv)]
                         + qr_scriptures(ch8, ch9, learn_scr))
    ch['sequence'] = [
        'c10_learn_objectives', 'c10_learn_english_concepts',
        'c10_learn_future_verbs', 'c10_drill_parsing',
        'c10_drill_translation', 'c10_ex_speller', 'c10_ex_speller_roots',
        'c10_learn_vocab', 'c10_drill_vocab_gk_en', 'c10_drill_vocab_en_gk',
        'c10_ex_vocab_speller', 'c10_learn_scripture',
        'c10_drill_scripture_memory', 'c10_ex_scripture_speller',
        'c10_qr_vocab', 'c10_qr_paradigms', 'c10_qr_scripture_rom323',
        'c10_qr_scripture_jn11', 'c10_qr_scripture_rom623a',
        'c10_qr_scripture_rom623b', 'c10_qr_scripture_mat633a',
        'c10_learn_bibliography']
    ch['_sequence_note'] = \
        'Rail order from ch10railwalk.pdf (Nathanael, 2026-08-09).'

    ch['hintCharts'] = {'futureParadigms': {
        'paradigmRefs': ['futureActiveParadigm', 'futureMiddleParadigm'],
        '_note': (
            'Both drills\' Hint opens the Future Active + Future Middle '
            'charts stacked in one popup (fields at 0xeb0ee/0x8eff4, rail '
            'walk evidenced). Present Active and present-eimi chart '
            'fields sit adjacent in the parsing drill\'s record -- '
            'whether Hint cycles to them is a VERIFY-5G item; not wired.')}}
    chart_ids = set(ch['hintCharts'])
    for a in ch['drill']:
        hr = a.get('ui', {}).get('hintRef')
        if hr and hr not in chart_ids:
            raise SystemExit(f'STOP: dangling hintRef {hr}')

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
        if base.lower() not in shipped:
            raise SystemExit(f'STOP: emitted clip {cid} not in CHAPT_10 pack')
        if not tbk.has_clip(base) and not re.match(r'[cdefghi]_', base):
            raise SystemExit(f'STOP: emitted clip {cid} not referenced in TBK')

    errs = audit(ch)
    if errs:
        raise SystemExit('STOP: self-audit failed:\n' + '\n'.join(errs))

    lex = build_lexicon(tbk, conv)
    os.makedirs(outdir, exist_ok=True)
    with open(os.path.join(outdir, 'chapt-10.json'), 'w',
              encoding='utf-8') as f:
        json.dump(ch, f, ensure_ascii=False, indent=1)
    with open(os.path.join(outdir, 'lexicon-chapt10.json'), 'w',
              encoding='utf-8') as f:
        json.dump(lex, f, ensure_ascii=False, indent=1)
    print(f'chapter 10: {len(ids)} distinct clips, '
          f'{len(ch["sequence"])} rail pages. OK.')


if __name__ == '__main__':
    main()
