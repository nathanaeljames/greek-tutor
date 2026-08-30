#!/usr/bin/env python3
# STAGE 8.7 PROVENANCE NOTICE (2026-08-29): refuses to overwrite an existing
# chapt-16.json unless ALLOW_REGRESSIVE_REBUILD=1 after a full back-port of
# any hand repairs (PIPELINE-INSIGHTS 8.7).
"""assemble_ch16.py -- chapter 16 (Aorist and Future Passive Verbs) from
16_FAPAS.TBK. Cohort 5I, the closing chapter.

  assemble_ch16.py TBK font-map.json chapt-15.json wavlist_16.txt outdir

Chapter-specific wiring facts, all TBK-read:
  * Passive Verbs Parsing Drill: 18 items (key script 0xfa356). Stage
    one is TENSE (Aorist | Future), not voice -- the only parsing drill
    in the project with that axis. Every item has exactly ONE accepted
    cell. Clips are the paradigm cells (p_luw*, p_luwf*, p_gra*), read
    from the table at 0xfb6fa.
  * Passive Verbs Form Drill: 22 items (key 0x7f8dd), and the item count
    exceeds the ten-ish verb list because SIX verbs appear TWICE -- once
    for the aorist passive and once for the future passive. Which one an
    item asks for is not in the prompt; it is in the DISPATCHED CLIP
    (p_balap vs p_balfp, p_egea vs p_egef, ...), and the page carries
    TWO instruction strings for exactly this reason. A1b CONFIRMED at
    source: the clips are the ANSWER forms, never the present lemma, so
    afterGuess and the A1c gate applies (ledger row 146). All three of
    the cohort's Forms Drills are now confirmed rather than inferred.
  * Passive Verbs Translation Drill: 28 items (key 0x7bf9b), clips
    p_td1-28.
  * Scripture Memory Drill: 5 items on VERSE-POSITION clips p_sm1, 2, 3,
    5, 6 (table at 0xfe569) -- ta, verse position 4, is not drilled.
  * The Passive Stems chart is a THREE-column table (Present Active /
    Aorist Passive / Future Passive) whose Future column is a double
    hyphen for eight of eighteen verbs; those render as an em dash and
    carry no tap.
"""
# --------------------------------------------------------------------
# STAGE 8.7 SELF-CHECK (5I close).
#
# This assembler REPRODUCES the committed chapt-16.json exactly, so it is
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

A = 'chapt_16_'

TEACH_OFFSETS = [0x19360, 0x1a164, 0x1c214, 0x20a2c, 0x248fa, 0x264be,
                 0x21276, 0x2504e, 0x26d20, 0x2d7b0]


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
AOR1 = ['ἐλύθην', 'ἐλύθης', 'ἐλύθη', 'ἐλύθημεν', 'ἐλύθητε', 'ἐλύθησαν']
AOR1_LEG = ['e]lu<qhn', 'e]lu<qhj', 'e]lu<qh', 'e]lu<qhmen', 'e]lu<qhte',
            'e]lu<qhsan']
AOR1_CLIPS = ['p_luw1s', 'p_luw2s', 'p_luw3s', 'p_luw1p', 'p_luw2p',
              'p_luw3p']
AOR1_GL = ['I was loosed', 'You were loosed', 'He/she/it was loosed',
           'We were loosed', 'You were loosed', 'They were loosed']
AOR2 = ['ἐγράφην', 'ἐγράφης', 'ἐγράφη', 'ἐγράφημεν', 'ἐγράφητε', 'ἐγράφησαν']
AOR2_LEG = ['e]gra<fhn', 'e]gra<fhj', 'e]gra<fh', 'e]gra<fhmen', 'e]gra<fhte',
            'e]gra<fhsan']
AOR2_CLIPS = ['p_gra1s', 'p_gra2s', 'p_gra3s', 'p_gra1p', 'p_gra2p',
              'p_gra3p']
AOR2_GL = ['I was written', 'You were written', 'He/she/it was written',
           'We were written', 'You were written', 'They were written']
FUT = ['λυθήσομαι', 'λυθήσῃ', 'λυθήσεται', 'λυθησόμεθα', 'λυθήσεσθε',
       'λυθήσονται']
FUT_LEG = ['luqh<somai', 'luqh<s^', 'luqh<setai', 'luqhso<meqa',
           'luqh<sesqe', 'luqh<sontai']
FUT_CLIPS = ['p_luwf1s', 'p_luwf2s', 'p_luwf3s', 'p_luwf1p', 'p_luwf2p',
             'p_luwf3p']
FUT_GL = ['I will be loosed', 'You will be loosed',
          'He/she/it will be loosed', 'We will be loosed',
          'You will be loosed', 'They will be loosed']


def paradigm(tbk, off, pid, title, forms, legacy, clips, glosses, say,
             lower=False):
    flat = tfield(tbk, off)[0].replace(' ', '')
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


def aor1_chart(tbk, off, pid, say='p_luapar', lower=False):
    return paradigm(tbk, off, pid, 'First Aorist Passive Indicative of λύω',
                    AOR1, AOR1_LEG, AOR1_CLIPS, AOR1_GL, say, lower=lower)


def aor2_chart(tbk, off, pid, say='p_grapar', lower=False):
    return paradigm(tbk, off, pid,
                    'Second Aorist Passive Indicative of γράφω',
                    AOR2, AOR2_LEG, AOR2_CLIPS, AOR2_GL, say, lower=lower)


def fut_chart(tbk, off, pid, say='p_lufpar', lower=False):
    return paradigm(tbk, off, pid, 'Future Passive Indicative of λύω',
                    FUT, FUT_LEG, FUT_CLIPS, FUT_GL, say, lower=lower)


# ----------------------------------------------------------- passive stems
# (present active, aorist passive, future passive or None,
#  present clip, aorist clip, future clip or None)
STEMS = [
    ('ἀποστέλλω', 'ἀπεστάλην', None, 'p_apop', 'p_apoa', None),
    ('βάλλω', 'ἐβλήθην', 'βληθήσομαι', 'p_balp', 'p_bala', 'p_balf'),
    ('γίνομαι', 'ἐγενήθην', None, 'p_ginp', 'p_gina', None),
    # gamma-rho-alpha-phi-omega is NOT in the Passive Stems chart --
    # it is the chapter's SECOND AORIST passive paradigm verb, taught
    # on its own page (0x2300a). The Form Drill still drills it, so
    # it is carried here for the lemma lookup only.
    ('γράφω', 'ἐγράφην', None, 'p_grap', 'p_graa', None),
    ('γινώσκω', 'ἐγνώσθην', 'γνωσθήσομαι', 'p_ginwp', 'p_ginwa', 'p_ginwf'),
    ('διδάσκω', 'ἐδιδάχθην', None, 'p_didp', 'p_dida', None),
    ('δύναμαι', 'ἠδυνήθην', None, 'p_dunp', 'p_duna', None),
    ('ἐγείρω', 'ἠγέρθην', 'ἐγερθήσομαι', 'p_egep', 'p_egea', 'p_egef'),
    ('εὑρίσκω', 'εὑρέθην', 'εὑρεθήσομαι', 'p_eurp', 'p_eura', 'p_euraf'),
    ('θέλω', 'ἠθελήθην', None, 'p_thep', 'p_thea', None),
    ('κρίνω', 'ἐκρίθην', 'ἐκριθήσομαι', 'p_krip', 'p_kria', 'p_kriaf'),
    ('λαμβάνω', 'ἐλήμφθην', None, 'p_lamp', 'p_lama', None),
    ('λέγω', 'ἐρρέθην', None, 'p_legp', 'p_lega', None),
    ('πιστεύω', 'ἐπιστεύθην', None, 'p_pisp', 'p_pisa', None),
    ('πορεύομαι', 'ἐπορεύθην', None, 'p_porp', 'p_pora', None),
    ('σῴζω', 'ἐσώθην', 'σωθήσομαι', 'p_swzp', 'p_swza', 'p_swzf'),
]
STEMS_BY_LEMMA = {s[0]: s for s in STEMS}
EMDASH = '\u2014'


STEM_CHART = [s for s in STEMS if s[0] != 'γράφω']


def stem_rows(tbk, conv, offsets, lo, hi):
    conv_raw = nfc(conv(' '.join(tfield(tbk, o)[0] for o in offsets)
                        .replace(' ', '')))
    rows = []
    for lemma, aor, fut, cp, ca, cf in STEM_CHART[lo:hi]:
        if nfc(aor) not in conv_raw:
            raise SystemExit(f'STOP: {aor!r} not in the Passive Stems fields')
        need(tbk, cp, ca)
        cells = [{'greek': lemma, 'audio': aud(cp)},
                 {'greek': aor, 'audio': aud(ca)}]
        if fut:
            need(tbk, cf)
            cells.append({'greek': fut, 'audio': aud(cf)})
        else:
            # the original prints "--" where a verb has no future passive;
            # D2 renders it as an em dash and it carries no tap.
            cells.append({'text': EMDASH})
        rows.append({'label': None, 'cells': cells})
    return rows


def stems_chart(tbk, conv, offsets, lo, hi, pid):
    return {'type': 'paradigm', 'id': pid, 'title': 'Passive Stems',
            'columns': ['Present Active', 'Aorist Passive', 'Future Passive'],
            'rows': stem_rows(tbk, conv, offsets, lo, hi),
            '_note': ('Eight of the fifteen verbs have NO future passive in '
                      'the original and print "--"; emitted as an em dash '
                      '(D2) with no tap.')}


# ------------------------------------------------------------------- learn
ET_POPUPS = []   # chapter 16's Ending Transformations carries no popups


def english_concepts(tbk, conv):
    topics = []
    for tid, title, off in [('introduction', 'Introduction', 0x19360),
                            ('comparison', 'Comparison with Greek', 0x1a164)]:
        if tid == 'comparison':
            # E7: the six principal parts follow the lead with no blank
            # line, so para_blocks merges the whole panel into the lead
            # paragraph and the page prints the chart twice. Cut it.
            blocks = lead_para(conv, marked(tbk, off),
                               'the sixth (last) principal part.')
        else:
            blocks = para_blocks(conv, marked(tbk, off).split('\r\n'))
        topics.append({'id': tid, 'title': title, 'content': blocks})
    pp = tfield(tbk, 0x1a164)[0]
    for leg in ['ba<llw', 'balw?', 'e@balon', 'be<blhka', 'be<blhmai',
                'e]blh<qhn']:
        if leg.replace(' ', '') not in pp.replace(' ', ''):
            raise SystemExit(f'STOP: principal part {leg!r} missing')
    need(tbk, 'p_balp', 'p_balf', 'p_bala', 'p_balr', 'p_balrp', 'p_balap')
    chart = {'type': 'greekRows', 'layout': 'principalParts', 'gapBefore': True,
             'rows': [
                 {'label': 'Present', 'parts': [
                     {'greek': 'βάλλω,', 'audio': aud('p_balp')}]},
                 {'label': 'Future', 'parts': [
                     {'greek': 'βαλῶ,', 'audio': aud('p_balf')}]},
                 {'label': 'Aorist', 'parts': [
                     {'greek': 'ἔβαλον,', 'audio': aud('p_bala')}]},
                 {'label': 'Perfect', 'parts': [
                     {'greek': 'βέβληκα,', 'audio': aud('p_balr')}]},
                 {'label': 'Perf mid/pass', 'parts': [
                     {'greek': 'βέβλημαι,', 'audio': aud('p_balrp')}]},
                 {'label': 'Aorist pass', 'parts': [
                     {'greek': 'ἐβλήθην', 'audio': aud('p_balap')}]}],
             '_disclosure': ('The six principal parts print as a labelled '
                             'two-row grid in the original; emitted as '
                             'labelled rows so every form taps. The labels '
                             'are underlined in the original and render '
                             'WITHOUT the underline (3.2: green underline is '
                             'exclusive to tappable elements, and a column '
                             'label is not one).')}
    topics[1]['content'] = topics[1]['content'] + [chart]
    return {'id': 'c16_learn_english_concepts', 'type': 'contentAudio',
            'mode': 'topicPages', 'title': 'Learn English Concepts',
            'topics': topics}


def form_topic(tbk, conv):
    blocks = para_blocks(conv, marked(tbk, 0x20a2c).split('\r\n'))
    raw = tfield(tbk, 0x20a2c)[0]
    for cand in ['e]lu<qhn', 'luqh<somai', 'drop the augment']:
        if cand not in raw:
            raise SystemExit(f'STOP: Form fragment {cand!r} missing')
    lead = [b for b in blocks if 'adding' in b['text']][:1]
    if not lead:
        raise SystemExit(f'STOP: Form lead misparse: {blocks}')
    tail_src = [b for b in blocks if 'future passives add' in b['text']][:1]
    if not tail_src:
        raise SystemExit('STOP: Form future paragraph missing')
    t = tail_src[0]['text']
    cut = 'and drop the augment.'
    j = t.find(cut)
    if j < 0:
        raise SystemExit(f'STOP: future cut not in {t[:90]!r}')
    tail = [{'type': 'para', 'text': t[:j + len(cut)].strip(),
             'gapBefore': True}]
    need(tbk, 'p_luw1s', 'p_luwf1s')
    f1 = {'type': 'formula', 'align': 'center', 'gapBefore': True,
          'lines': [{'text': 'ἐ + λυ + θη + ν = ἐλύθην',
                     'audio': aud('p_luw1s'), 'tapUnit': True},
                    {'text': 'Aug   Stem   Pass   Ending   (I was loosed)'}]}
    f2 = {'type': 'formula', 'align': 'center', 'gapBefore': True,
          'lines': [{'text': 'λυ + θησ + ν = λυθήσομαι',
                     'audio': aud('p_luwf1s'), 'tapUnit': True},
                    {'text': 'Stem   Pass   Ending   (I will be loosed)'}],
          '_verify_note': ('The original prints "lu + qhs + n = luqh<somai" '
                           '-- the ending shown is nu although the form ends '
                           '-omai. Carried VERBATIM; an original slip, not a '
                           'conversion error. VERIFY.')}
    return {'id': 'form', 'title': 'Form',
            'content': lead + [f1] + tail + [f2]}


def endings_topic(tbk, conv):
    lead = lead_para(conv, marked(tbk, 0x248fa), 'is added.')
    if 'consonant' not in lead[0]['text']:
        raise SystemExit(f'STOP: Ending Transformations lead: {lead}')
    raw = tfield(tbk, 0x248fa)[0]
    for leg in ['e]diw<xqhn', 'e]lei<fqhn', 'e]gra<fhn']:
        if leg not in raw:
            raise SystemExit(f'STOP: ET example {leg!r} missing')
    need(tbk, 'p_diwa', 'p_leia', 'p_graa')
    rows = [{'label': 'Palatals:', 'parts': [{'text': 'κ and γ  become  χ'}],
             'note': 'διωκ + θη = ἐδιώχθην'},
            {'label': 'Labials:', 'parts': [{'text': 'π and β  become  φ'}],
             'note': 'λείπ + θη = ἐλείφθην'},
            {'label': None,
             'parts': [{'text': 'φ causes the θ to drop out'}],
             'note': 'γραφ + θη = ἐγράφην'}]
    chart = {'type': 'greekRows', 'layout': 'endingTransformation',
             'gapBefore': True, 'rows': rows}
    return {'id': 'endingTransformations', 'title': 'Ending Transformations',
            'content': lead + [chart],
            'audioMap': {'ἐδιώχθην': aud('p_diwa'),
                         'ἐλείφθην': aud('p_leia'),
                         'ἐγράφην': aud('p_graa')}}


def consonant_topic(tbk, conv):
    raw = tfield(tbk, 0x264be)[0]
    for leg in ['e]pei<sqhn', 'e]doca<sqhn']:
        if leg not in raw:
            raise SystemExit(f'STOP: Consonant Shifts example {leg!r} missing')
    need(tbk, 'p_peia', 'p_doca')
    rows = [{'label': 'Dentals:', 'parts': [{'text': 'τ, δ, and θ  become  σ'}],
             'note': 'πειθ + θη = ἐπείσθην'},
            {'label': 'Sibilants:',
             'parts': [{'text': 'ζ, ξ, and ψ  become  σ'}],
             'note': 'δοξαζ + θη = ἐδοξάσθην'}]
    summary = {'type': 'greekRows', 'layout': 'shiftSummary', 'gapBefore': True,
               'rows': [{'label': None, 'parts': [{'text': t}]}
                        for t in ['κ, γ      ' + EMDASH + '  χ',
                                  'π, β      ' + EMDASH + '  φ',
                                  'τ, δ, θ   ' + EMDASH + '  σ',
                                  'ζ, ξ, ψ   ' + EMDASH + '  σ']]}
    return {'id': 'consonantShifts', 'title': 'Consonant Shifts',
            'content': [{'type': 'greekRows', 'layout': 'endingTransformation',
                         'rows': rows}, summary],
            'audioMap': {'ἐπείσθην': aud('p_peia'),
                         'ἐδοξάσθην': aud('p_doca')},
            '_disclosure': ('C6: "Consonant Shifts" carries its OWN header in '
                            'the original, so it is a distinct topic rather '
                            'than a continuation of Ending Transformations '
                            '(2.7 header test).')}


def deponent_topic(tbk, conv):
    body = para_blocks(conv, marked(tbk, 0x21276).split('\r\n'))
    if not body or 'deponent' not in body[0]['text']:
        raise SystemExit(f'STOP: Deponent topic misparse: {body}')
    need(tbk, 'p_apea', 'p_gina')
    return {'id': 'deponent', 'title': 'Deponent', 'content': body,
            'audioMap': {'ἀπεκρίθην': aud('p_apea'),
                         'ἐγενήθην': aud('p_gina')},
            '_audio_note': ('egenomen is the ch14 second aorist middle and '
                            'has no clip in this pack; only the two forms '
                            'the chapter itself records are tapped.')}


def learn_passives(tbk, conv):
    intro = para_blocks(conv, marked(tbk, 0x1c214).split('\r\n'))
    if len(intro) < 2:
        raise SystemExit(f'STOP: passives intro misparse: {intro}')
    need(tbk, 'p_luw', 'p_grap')
    topics = [
        {'id': 'introduction', 'title': 'Introduction', 'content': intro},
        form_topic(tbk, conv),
        endings_topic(tbk, conv),
        consonant_topic(tbk, conv),
        {'id': 'firstAoristPassive', 'title': 'First Aorist Passive',
         'titleAudio': aud('p_luw'),
         'content': [aor1_chart(tbk, 0x1e902, 'learnFirstAoristPassive')]},
        {'id': 'secondAoristPassive', 'title': 'Second Aorist Passive',
         'titleAudio': aud('p_grap'),
         'content': [aor2_chart(tbk, 0x2300a, 'learnSecondAoristPassive')]},
        {'id': 'futurePassive', 'title': 'Future Passive',
         'titleAudio': aud('p_luw'),
         'content': [fut_chart(tbk, 0x21b38, 'learnFuturePassive')]},
        deponent_topic(tbk, conv),
        {'id': 'passiveStems', 'title': 'Passive Stems',
         'content': [stems_chart(tbk, conv, [0x2504e], 0, 7,
                                 'learnPassiveStems1'),
                     stems_chart(tbk, conv, [0x26d20], 7, 15,
                                 'learnPassiveStems2')],
         '_disclosure': ('C5 (NIT-LOG N-6 standing method): the original '
                         'pages the stem table seven-and-eight behind '
                         'More/Back; STACKED here in the original\'s own '
                         'split. Neither half carries a say-all recording, '
                         'so no button is drawn.')}]
    return {'id': 'c16_learn_passives', 'type': 'contentAudio',
            'mode': 'topicPages',
            'title': 'Learn Aorist and Future Passive Verbs',
            'topics': topics, 'greekTaps': True}


# ------------------------------------------------------------------ drills
PN_BTN = {'s1': 'First Singular', 's2': 'Second Singular',
          's3': 'Third Singular', 'p1': 'First Plural',
          'p2': 'Second Plural', 'p3': 'Third Plural'}
TENSE = {'A': 'Aorist', 'F': 'Future'}


def sanitized(data):
    tbl = bytes(c if 32 <= c < 127 else 32 for c in range(256))
    return data.translate(tbl).decode('latin-1')


def key_blocks(txt, lo, n, span=4200):  # noqa
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
    n = 18
    prompts = [sq(conv(x)) for x in tpool(tbk, 0xb8c28, n, 'parsing prompts')]
    trans = [sq(x) for x in tpool(tbk, 0xb9092, n, 'parsing translations')]
    keys = key_blocks(txt, 0xfa356, n)
    disp = dispatch(tbk.data, 0xfb600, 0xfc000)
    cells = dict(zip(AOR1 + FUT + AOR2,
                     AOR1_CLIPS + FUT_CLIPS + AOR2_CLIPS))
    items = []
    for i in range(1, n + 1):
        blk = keys[i]
        btns = []
        for b in re.findall(r'=\s?([sp]\d)\b', blk):
            if b not in btns:
                btns.append(b)
        tenses = [TENSE[t] for t in re.findall(r'=\s?([AF])\b', blk)
                  if t in TENSE]
        if len(set(tenses)) != 1 or len(btns) != 1:
            raise SystemExit(f'STOP: parsing item {i} key {blk[:70]!r}')
        g = prompts[i - 1]
        clip = disp.get(i) or cells.get(g)
        if not clip:
            raise SystemExit(f'STOP: parsing item {i}: no clip for {g!r}')
        if cells.get(g) and cells[g] != clip:
            raise SystemExit(f'STOP: parsing item {i}: dispatch {clip!r} is '
                             f'not the cell clip {cells[g]!r} for {g!r}')
        need(tbk, clip)
        items.append({'greek': g, 'translate': trans[i - 1],
                      'answer': [tenses[0], PN_BTN[btns[0]]],
                      'audio': aud(clip), 'hintRef': 'passiveParadigms'})
    return {
        'id': 'c16_drill_parsing', 'type': 'select', 'mode': 'twoStageGrid',
        'title': 'Passive Verbs Parsing Drill',
        'instructions': 'Click on the tense, then person and number',
        'promptIsGreek': True, 'options': 'static',
        'optionStages': [
            {'label': 'Tense', 'values': ['Aorist', 'Future']},
            {'label': 'Person / Number',
             'values': ['First Singular', 'First Plural', 'Second Singular',
                        'Second Plural', 'Third Singular', 'Third Plural'],
             'optionGroups': [2, 2, 2]}],
        'revealButtons': [{'label': 'Translate', 'field': 'translate'}],
        'items': items, 'scored': True,
        'ui': stepper_ui(hint='passiveParadigms', translate=True),
        '_stage_note': ('Eighteen items (0xfa356). Stage one is TENSE '
                        '(Aorist | Future), NOT voice -- the only parsing '
                        'drill in the project with that axis, because the '
                        'whole chapter is one voice. Every item has exactly '
                        'ONE accepted cell and the assembler fails if a key '
                        'names two. Each dispatched clip is asserted to be '
                        'the prompt form\'s own paradigm cell.'),
        'audioTiming': 'beforeGuess',
        'answerPolicy': {'advanceClass': 'manualOnIncorrect',
                         'attemptsPerItem': 1}}


def forms_drill(tbk, conv, txt):
    n = 22
    lemmas = [sq(conv(x)) for x in tpool(tbk, 0xa0976, n, 'forms lemmas')]
    glosses = [sq(x) for x in tpool(tbk, 0xa571a, n, 'forms glosses')]
    cols = [[sq(conv(x)) for x in tpool(tbk, o, n, 'forms col')]
            for o in (0xa2616, 0xa2e20, 0xa33f0)]
    keys = key_blocks(txt, 0x7f8dd, n)
    disp = dispatch(tbk.data, 0x100000, 0x100900)
    items = []
    for i in range(1, n + 1):
        letters = re.findall(r'=\s?([ABC])\b', keys[i])
        if not letters:
            raise SystemExit(f'STOP: forms item {i} key {keys[i][:70]!r}')
        ans = cols['ABC'.index(letters[0])][i - 1]
        lemma, aor, fut, cp, ca, cf = STEMS_BY_LEMMA[lemmas[i - 1]]
        clip = disp.get(i)
        if clip == cp:
            raise SystemExit(f'STOP: forms item {i} dispatches the PRESENT '
                             f'clip {clip!r} -- A1b does not hold here')
        # the clip suffix is what says which tense the item asks for:
        # p_<v>a / p_<v>ap = aorist passive, p_<v>f / p_<v>af / p_<v>fp =
        # future passive. Nothing in the prompt distinguishes them.
        if clip == ca or clip == cp + 'ap' or clip.endswith('ap'):
            tense = 'aorist'
        elif clip.endswith('f') or clip.endswith('fp') or clip.endswith('af'):
            tense = 'future'
        elif clip == ca:
            tense = 'aorist'
        else:
            raise SystemExit(f'STOP: forms item {i}: cannot read a tense '
                             f'from dispatch {clip!r}')
        want = aor if tense == 'aorist' else fut
        note = None
        if want is None:
            # the Passive Stems chart prints "--" for this verb's future,
            # yet the drill asks for one: the key's own column is the only
            # source. Recorded, never invented.
            want = ans
            note = ('The Passive Stems chart prints "--" for this verb\'s '
                    'future passive, but the drill asks for one and its own '
                    f'key gives {ans!r} (clip {clip}). Taken from the key; '
                    'an inconsistency in the original. VERIFY.')
        if nfc(ans) != nfc(want):
            raise SystemExit(f'STOP: forms item {i}: key gives {ans!r} but '
                             f'the Passive Stems chart gives {want!r} '
                             f'({tense}, from clip {clip})')
        need(tbk, clip)
        items.append({
            'greek': lemmas[i - 1], 'gloss': glosses[i - 1], 'tense': tense,
            'instructions': (f'Click on the correct matching {tense} form'),
            'options': [c[i - 1] for c in cols], 'answer': ans,
            'audio': aud(clip)})
        if note:
            items[-1]['_verify_note'] = note
    return {
        'id': 'c16_drill_forms', 'type': 'select', 'mode': 'fullOptionGrid',
        'title': 'Passive Verbs Form Drill',
        'instructions': 'Click on the correct matching aorist form',
        'promptIsGreek': True, 'promptGloss': True, 'options': 'perItem',
        'optionsAreGreek': True, 'optionLayout': 'stack1col',
        'instructionsPerItem': True,
        'items': items, 'scored': True,
        'ui': stepper_ui(hint='passiveStemsHint'),
        '_shape_note': ('TWENTY-TWO items for fifteen verbs: SIX verbs '
                        '(ballo, egeiro, heurisko, dunamai, ginosko, sozo) '
                        'appear TWICE, once for the aorist passive and once '
                        'for the future. Which one an item asks for is NOT '
                        'in the prompt -- the page carries TWO instruction '
                        'strings (0xa046a) and switches between them -- so '
                        'the tense is derived from the DISPATCHED CLIP '
                        '(p_balap vs p_balfp, p_egea vs p_egef ...) and '
                        'cross-checked against the Passive Stems chart. '
                        'Every item ships its own instruction line.'),
        '_audio_note': ('A1b, CONFIRMED at source: the clips are the ANSWER '
                        'forms and the assembler FAILS if any item '
                        'dispatches its present-tense clip. afterGuess, and '
                        'the A1c gate applies. Ledger row 146 -- with this '
                        'read all three of the cohort\'s Forms Drills are '
                        'confirmed rather than inferred.'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'manualOnIncorrect',
                         'attemptsPerItem': 1}}


def translation_drill(tbk, conv, txt):
    n = 28
    greek = [sq(conv(x)) for x in tpool(tbk, 0xbc634, n, 'td greek')]
    cols = [[sq(x) for x in tpool(tbk, o, n, 'td col')]
            for o in (0xbe5d6, 0xbf074, 0xbf8f8)]
    refs = [sq(x) for x in tpool(tbk, 0xc0051, n, 'td refs')]
    refs[27] = 'Jn 1:49'
    line2 = positional_pool(tbk, 0xc040a, n, 'td line 2')
    keys = key_blocks(txt, 0x7bf9b, n, span=4400)
    disp = dispatch(tbk.data, 0x7d100, 0x7e600)
    items = []
    for i in range(1, n + 1):
        letters = re.findall(r'=\s?([ABC])\b', keys[i])
        if not letters:
            raise SystemExit(f'STOP: td item {i}: no key letter')
        clip = disp.get(i)
        if clip != f'p_td{i}':
            raise SystemExit(f'STOP: td item {i} dispatch {clip!r}')
        need(tbk, clip)
        it = {'greek': greek[i - 1], 'ref': refs[i - 1],
              'options': [c[i - 1] for c in cols],
              'answer': cols['ABC'.index(letters[0])][i - 1],
              'audio': aud(clip), 'hintRef': 'passiveParadigms'}
        if line2[i - 1].strip():
            it['greek2'] = sq(conv(line2[i - 1]))
        items.append(it)
    return {
        'id': 'c16_drill_translation', 'type': 'select',
        'mode': 'fullOptionGrid',
        'title': 'Passive Verbs Translation Drill',
        'instructions': 'Click on the correct translation',
        'promptIsGreek': True, 'options': 'perItem',
        'optionLayout': 'stack1col', 'items': items, 'scored': True,
        'ui': stepper_ui(hint='passiveParadigms'),
        '_answer_note': ('Twenty-eight items (0x7bf9b); the A/B/C key script '
                         'yields all 28 and agrees with the BLUE option on '
                         'ch16railwalk.pdf p10-p17. The refs pool\'s last '
                         'entry carries a stale tail ("Jn 1:49  Cor 6:2") '
                         'cut at the screen\'s own value.'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'manualOnIncorrect',
                         'attemptsPerItem': 1}}


# ------------------------------------------------------------------- vocab
VOC_KEYS = ['aion', 'allelon', 'archiereus', 'gune', 'dunamai', 'ethnos',
            'hosos', 'polis', 'te', 'cheir']
VOC_FREQ = [122, 100, 122, 215, 210, 162, 110, 162, 215, 177]
VOC_CLIPS = [f'p_voc{i}' for i in range(1, 11)]


def vocab_pools(tbk, conv):
    lex = [sq(conv(x)) for x in tpool(tbk, 0x148d4, 10, 'vocab lexical')]
    card = [sq(x) for x in tpool(tbk, 0x14b2e, 10, 'flashcard glosses')]
    drill = [sq(x) for x in tpool(tbk, 0x9e432, 10, 'drill glosses')]
    spell = [sq(x) for x in tpool(tbk, 0x2d70, 10, 'speller prompts')]
    heads = [sq(conv(x)) for x in tpool(tbk, 0x63d02, 10, 'gk->en prompts')]
    for i, h in enumerate(heads):
        if not lex[i].startswith(h):
            raise SystemExit(f'STOP: vocab head {h!r} vs {lex[i]!r}')
    return lex, heads, card, drill, spell


def vocab_drills(tbk, conv):
    lex, heads, card, drill, spell = vocab_pools(tbk, conv)
    need(tbk, *VOC_CLIPS)
    common = {'scored': True, 'ui': score_ui(), 'poolKind': 'vocabulary',
              'answerPolicy': {'advanceClass': 'autoBoth',
                               'attemptsPerItem': 1}}
    gk = {'id': 'c16_drill_vocab_gk_en', 'type': 'select',
          'mode': 'fullOptionGrid',
          'title': 'Vocabulary:  Greek to English Drill',
          'instructions': 'Click on the matching word',
          'promptIsGreek': True, 'options': 'static', 'optionValues': drill,
          'items': [{'greek': g, 'answer': gl, 'audio': aud(c)}
                    for g, gl, c in zip(heads, drill, VOC_CLIPS)],
          'audioTiming': 'beforeGuess', **common}
    en = {'id': 'c16_drill_vocab_en_gk', 'type': 'select',
          'mode': 'fullOptionGrid',
          'title': 'Vocabulary: English to Greek Drill',
          'instructions': 'Click on the matching word',
          'options': 'static', 'optionsAreGreek': True, 'optionValues': heads,
          'items': [{'prompt': gl, 'answer': g, 'audio': aud(c)}
                    for g, gl, c in zip(heads, drill, VOC_CLIPS)],
          'audioTiming': 'afterGuess', **common}
    return gk, en


def vocab_speller(tbk, conv):
    lex, heads, card, drill, spell = vocab_pools(tbk, conv)
    return {
        'id': 'c16_ex_vocab_speller', 'type': 'spell',
        'title': 'Vocabulary Spelling Exercise',
        'instructions': ('Click letters below or use your keyboard to spell '
                         'it out.'),
        'prompt': 'item', 'promptLabel': 'English Meaning',
        'accentsOptional': True, 'spellerTilesRef': 'chapt_1',
        'items': [{'prompt': p, 'answer': g, 'audio': aud(c)}
                  for p, g, c in zip(spell, heads, VOC_CLIPS)],
        'ui': {'fields': ['English Meaning', 'Spell Greek Word'],
               'buttons': ['Pronounce', 'Previous', 'Score', 'Next',
                           'Check Answer', 'Greek Keyboard'],
               'checkboxes': ['Show Answer', 'With Accents',
                              'Pronounce Each Exercise'],
               'defaults': {'pronounceEach': True}},
        '_answer_note': ('The check literal "xei<r" at 0x4ab6 corroborates '
                         'item 10.'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


# ---------------------------------------------------------------- spellers
def passive_speller(tbk, conv, parsing):
    n = 18
    prompts = [sq(x) for x in tpool(tbk, 0xab242, n, 'speller prompts')]
    items = [{'prompt': p, 'answer': src['greek'], 'audio': src['audio']}
             for p, src in zip(prompts, parsing['items'])]
    lit = tfield(tbk, 0xac6fa)[0].strip()
    if nfc(conv(lit)) != nfc(items[17]['answer']):
        raise SystemExit(f'STOP: check literal {lit!r} disagrees with item 18')
    return {
        'id': 'c16_ex_speller', 'type': 'spell',
        'title': 'Passive Verbs Spelling Exercise',
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
        '_answer_note': ('The 18 answers ARE the Parsing Drill pool '
                         '(0xb8c28) in order and the prompts are that '
                         'drill\'s own Translate pool verbatim. Item 18 is '
                         'corroborated by the check literal "e]gra<fhsan" '
                         'at 0xac6fa.'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


def forms_speller(tbk, conv, forms):
    n = 22
    lemmas = [sq(conv(x)) for x in tpool(tbk, 0x88bdc, n, 'forms speller')]
    items = []
    for i, (lm, src) in enumerate(zip(lemmas, forms['items']), 1):
        if lm != src['greek']:
            raise SystemExit(f'STOP: forms speller {i}: {lm!r} != '
                             f'{src["greek"]!r}')
        items.append({'prompt': lm, 'answer': src['answer'],
                      'audio': src['audio'], 'tense': src['tense'],
                      'answerLabel': ('Passive Aorist Form'
                                      if src['tense'] == 'aorist'
                                      else 'Passive Future Form')})
    # the check literal is stored UNACCENTED (the speller's accents-off
    # comparison path), so it is corroborated against bare answers.
    lit = tfield(tbk, 0x89f56)[0].strip()
    if bare(conv(lit)) not in {bare(it['answer']) for it in items}:
        raise SystemExit(f'STOP: check literal {lit!r} is not a derived answer')
    return {
        'id': 'c16_ex_speller_forms', 'type': 'spell',
        'title': 'Passive Verbs Forms Spelling Exercise',
        'instructions': ('Click letters below or use your keyboard to spell '
                         'the aorist or future form as called for.'),
        'prompt': 'item', 'promptLabel': 'Present Tense',
        'promptIsGreek': True,
        'accentsOptional': True, 'spellerTilesRef': 'chapt_1', 'items': items,
        'ui': {'fields': ['Present Tense', 'Passive Aorist Form'],
               'buttons': ['Pronounce', 'Previous', 'Score', 'Next',
                           'Check Answer', 'Greek Keyboard'],
               'checkboxes': ['Show Answer', 'With Accents',
                              'Pronounce Each Exercise'],
               'defaults': {'pronounceEach': True}},
        '_shape_note': ('The answer FIELD LABEL changes per item -- '
                        '"Passive Aorist Form" or "Passive Future Form", the '
                        'two strings the original stores together at '
                        '0x88d5a. Each item carries its own answerLabel. '
                        'Corroborated by the check literal "swqhsomai" at '
                        '0x89f56, a FUTURE answer.'),
        '_audio_note': ('A1b: the clip is the aorist/future ANSWER, so '
                        'afterGuess. The A1c gate does NOT apply -- spellers '
                        'are excluded by ruling. Ledger row 152.'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


# --------------------------------------------------------------- scripture
VERSE = ['καὶ', 'ἄφες', 'ἡμῖν', 'τὰ', 'ὀφειλήματα', 'ἡμῶν,']
VERSE_GLOSS = ['and', 'forgive', 'for us', 'the', 'debts', 'our']
SM_OPTS = ['and', 'forgive', 'for us', 'debts', 'our']


def learn_scripture(tbk, conv):
    raw = tfield(tbk, 0xe1b90)[0]
    for leg in ['a@fej', 'o]feilh<mata']:
        if leg not in raw:
            raise SystemExit(f'STOP: {leg} not in interlinear 0xe1b90')
    words = []
    for k, (w, gl) in enumerate(zip(VERSE, VERSE_GLOSS), 1):
        need(tbk, f'p_sm{k}')
        words.append({'greek': w, 'gloss': gl, 'audio': aud(f'p_sm{k}')})
    need(tbk, 'p_mt612a')
    return {'id': 'c16_learn_scripture', 'type': 'contentAudio',
            'mode': 'interlinearVerse', 'title': 'Learn Scripture Memory',
            'reference': 'Mat 6:12a', 'words': words,
            'sayWhole': {'label': 'Say Whole Verse',
                         'audio': aud('p_mt612a')}}


def scripture_drill(tbk, conv):
    prompts = [sq(conv(x)) for x in tpool(tbk, 0x60fd8, 5, 'sm prompts')]
    disp = dispatch(tbk.data, 0xfe400, 0xfe800)
    items = []
    for i, g in enumerate(prompts, 1):
        base = g.rstrip('·.,')
        clip = disp.get(i)
        if not clip or not clip.startswith('p_sm'):
            raise SystemExit(f'STOP: SM item {i} dispatch {clip!r}')
        pos = int(clip[4:])
        if VERSE[pos - 1].rstrip(',') != base:
            raise SystemExit(f'STOP: SM prompt {g!r} is not verse word {pos}')
        need(tbk, clip)
        items.append({'greek': base, 'answer': VERSE_GLOSS[pos - 1],
                      'audio': aud(clip)})
    return {'id': 'c16_drill_scripture_memory', 'type': 'select',
            'mode': 'fullOptionGrid', 'title': 'Scripture Memory Drill',
            'instructions': 'Click on the matching word',
            'promptIsGreek': True, 'options': 'static',
            'optionValues': SM_OPTS, 'items': items, 'scored': True,
            'ui': score_ui(),
            '_audio_note': ('Five prompts on VERSE-POSITION clips p_sm1, 2, '
                            '3, 5, 6 (table at 0xfe569) -- ta, verse '
                            'position 4, is not drilled. Stage 8.2.'),
            'audioTiming': 'beforeGuess',
            'answerPolicy': {'advanceClass': 'autoBoth',
                             'attemptsPerItem': 1}}


def scripture_speller(tbk, conv):
    hint = sq(' '.join(l.strip() for l in
                       tfield(tbk, 0x9732e)[0].split('\r\n') if l.strip()))
    if hint != 'and pardon for us our debts':
        raise SystemExit(f'STOP: verse hint {hint!r}')
    return {
        'id': 'c16_ex_scripture_speller', 'type': 'spellVerse',
        'title': 'Scripture Memory Spelling Exercise',
        'instructions': 'Enter all of Mat 6:12a then click "Check Answer"',
        'reference': 'Mat 6:12a', 'answerWords': VERSE, 'translation': hint,
        'accentsOptional': True, 'punctuationOptional': True,
        'audio': aud('p_mt612a'), 'spellerTilesRef': 'chapt_1',
        'ui': {'fields': ['Spell Greek'],
               'buttons': ['Pronounce', 'Check Answer', 'Greek Keyboard',
                           'Restart Exercise'],
               'checkboxes': ['Show Answer', 'With Accents'],
               '_reveal_note': 'RULES C8 / D-30.'},
        '_repeat_note': '"Repeat This Exercise" NOT ported (D-42 retired).',
        '_verify_note': ('The Learn page glosses aphes "forgive" while the '
                         'speller hint reads "pardon"; both carried '
                         'verbatim from their own screens.'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


# ------------------------------------------------------------- objectives
def objectives(tbk):
    raw = tfield(tbk, 0x2d7b0)[0].split('\r\n')
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
    if len(items) != 6 or 'Mat 6:12' not in items[5]:
        raise SystemExit(f'STOP: objectives: {items}')
    return items


def bibliography(tbk):
    raw = tfield(tbk, 0xf55e)[0].split('\r\n')
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
        if len(entries) == 3 and cur and '143-46' in cur:
            entries.append(sq(cur))
            cur = None
            break
    if len(entries) != 4:
        raise SystemExit(f'STOP: expected 4 bibliography entries, '
                         f'got {len(entries)}')
    return {'id': 'c16_learn_bibliography', 'type': 'contentAudio',
            'mode': 'textPage', 'title': 'Learn Bibliography',
            'content': [{'type': 'biblist', 'items': entries}]}


# ------------------------------------------------------------ quick review
def qr_vocab(tbk, conv):
    raw = tfield(tbk, 0xe8e52)[0]
    for g in ['age, eternity (122)', 'hand (177)']:
        if g.replace(' ', '') not in raw.replace(' ', ''):
            raise SystemExit(f'STOP: chart gloss {g!r} not in 0xe8e52')
    need(tbk, 'vocl16')
    return {'id': 'c16_qr_vocab', 'type': 'contentAudio',
            'mode': 'reviewVocab', 'title': 'Review Vocabulary Chart',
            'pool': 'senses', 'columns': 2, 'showNtFreq': True,
            'footnote': ('The number after the translation is the number of '
                         'times the word occurs in the New Testament.'),
            'playAll': {'label': 'Say Whole List', 'audio': aud('vocl16')}}


def qr_pages(tbk, conv):
    return [
        {'id': 'c16_qr_aorist1', 'type': 'contentAudio',
         'mode': 'paradigmChart', 'title': 'Review First Aorist Passive Verbs',
         'paradigms': [aor1_chart(tbk, 0x49816, 'qrFirstAoristPassive')]},
        {'id': 'c16_qr_aorist2', 'type': 'contentAudio',
         'mode': 'paradigmChart',
         'title': 'Review Second Aorist Passive Verbs',
         'paradigms': [aor2_chart(tbk, 0x2b3da, 'qrSecondAoristPassive')]},
        {'id': 'c16_qr_future', 'type': 'contentAudio',
         'mode': 'paradigmChart', 'title': 'Review Future Passive Verbs',
         'paradigms': [fut_chart(tbk, 0xddbfe, 'qrFuturePassive')]},
        {'id': 'c16_qr_forms', 'type': 'contentAudio', 'mode': 'paradigmChart',
         'title': 'Review Passive Indicative Forms',
         'paradigms': [stems_chart(tbk, conv, [0x71166], 0, 7, 'qrStems1'),
                       stems_chart(tbk, conv, [0x725e6], 7, 15, 'qrStems2')],
         '_disclosure': ('C9 + NIT-LOG N-6 standing method: the original '
                         'pages the stem table seven-and-eight behind '
                         'More/Back. STACKED here in the original\'s own '
                         'split, no pager. Neither half carries a say-all '
                         'recording, so no button is drawn.')}]


def qr_scriptures(ch15, learn_scr):
    out = []
    for oid in ('c15_qr_scripture_mat69', 'c15_qr_scripture_mat611'):
        src = [a for a in ch15['quickReview'] if a['id'] == oid]
        if not src:
            raise SystemExit(f'STOP: {oid} not in chapt-15.json')
        src = src[0]
        words = [{'greek': w['greek'], 'gloss': w['gloss'],
                  'audio': w['audio'].replace('chapt_15_', A)}
                 for w in src['words']]
        out.append({'id': oid.replace('c15_', 'c16_'), 'type': 'contentAudio',
                    'mode': 'interlinearVerse', 'title': src['title'],
                    'reference': src['reference'], 'words': words,
                    'sayWhole': {'label': src['sayWhole']['label'],
                                 'audio': src['sayWhole']['audio']
                                 .replace('chapt_15_', A)}})
    # CH16 MERGES the two halves of Mat 6:10 into ONE review page titled
    # "Review Scripture Memory: Mat 6:10" (title 0x4bb28, interlinear
    # 0x4ca36, fourteen words) with its own whole-verse recording m_mt610,
    # dispatched at 0xdd3e5. Chapters 14 and 15 keep 6:10a and 6:10c apart;
    # this is the only page in the project that joins them.
    a = [x for x in ch15['quickReview']
         if x['id'] == 'c15_qr_scripture_mat610a'][0]
    c = [x for x in ch15['quickReview']
         if x['id'] == 'c15_qr_scripture_mat610c'][0]
    words = [{'greek': w['greek'], 'gloss': w['gloss'],
              'audio': w['audio'].replace('chapt_15_', A)}
             for w in a['words'] + c['words']]
    if len(words) != 14:
        raise SystemExit(f'STOP: Mat 6:10 merge gave {len(words)} words')
    out.append({'id': 'c16_qr_scripture_mat610', 'type': 'contentAudio',
                'mode': 'interlinearVerse',
                'title': 'Review Scripture Memory:  Mat 6:10',
                'reference': 'Mat 6:10', 'words': words,
                'sayWhole': {'label': 'Say Whole Verse',
                             'audio': aud('m_mt610')},
                '_note': ('The original MERGES 6:10a and 6:10c here; the '
                          'Quick Review Menu prints "Mat 6:10". The say-all '
                          'is m_mt610, a recording of the whole verse that '
                          'exists only for this page.')})
    out.append({'id': 'c16_qr_scripture_mat612a', 'type': 'contentAudio',
                'mode': 'interlinearVerse',
                'title': 'Review Scripture Memory:  Mat 6:12a',
                'reference': 'Mat 6:12a', 'words': learn_scr['words'],
                'sayWhole': learn_scr['sayWhole']})
    return out


def build_lexicon(tbk, conv):
    lex, heads, card, drill, spell = vocab_pools(tbk, conv)
    lemmas = {}
    for i, k in enumerate(VOC_KEYS):
        lemmas[k] = {'greek': heads[i], 'translit': k, 'lexicalForm': lex[i],
                     'gloss': card[i], 'glossShort': card[i],
                     'audio': aud(VOC_CLIPS[i]), 'ntFreq': VOC_FREQ[i],
                     'senses': [{'greek': heads[i], 'caseTag': None,
                                 'glossShort': drill[i],
                                 'audio': aud(VOC_CLIPS[i])}]}
    return {'_comment': (
        'Chapter 16 lexicon, assembled from 16_FAPAS.TBK (cohort 5I). Ten '
        'lemmas, no case splits. gloss/glossShort = flashcard pool '
        '(0x14b2e), which is IDENTICAL to the speller pool; '
        'senses[].glossShort = the shorter drill pool (0x9e432); ntFreq '
        'from the Review chart (0xe8e52).'),
        'lemmas': lemmas, 'exampleWords': {}}


# -------------------------------------------------------------------- main
def main():
    committed = (sys.argv[6] if len(sys.argv) > 6 else
                 os.path.join(os.path.dirname(os.path.abspath(__file__)),
                              '..', 'src', 'data', 'chapt-16.json'))
    tbk_path, fontmap_path, ch15_path, wavlist_path, outdir = sys.argv[1:6]
    outfile = os.path.join(outdir, 'chapt-16.json')
    if os.path.exists(outfile) and not os.environ.get(
            'ALLOW_REGRESSIVE_REBUILD'):
        raise SystemExit('STOP: Stage 8.7 -- chapt-16.json exists.')
    shipped = {l.strip().lower().rsplit('.', 1)[0]
               for l in open(wavlist_path) if l.strip()}
    tbk = Tbk(tbk_path)
    tbk.greek_fmts = underline.vote_greek_fmts(
        tbk.data, [text_off(tbk, o) for o in TEACH_OFFSETS])
    conv = make_conv11(json.load(open(fontmap_path, encoding='utf-8')))
    ch15 = json.load(open(ch15_path, encoding='utf-8'))
    txt = sanitized(tbk.data)

    learn_scr = learn_scripture(tbk, conv)
    parsing = parsing_drill(tbk, conv, txt)
    forms = forms_drill(tbk, conv, txt)
    gk, en = vocab_drills(tbk, conv)
    ch = {
        '_comment': (
            'Chapter 16 (Aorist and Future Passive Verbs), assembled from '
            '16_FAPAS.TBK + CHAPT_16 audio + ch16railwalk.pdf under '
            'PIPELINE-INSIGHTS-v3 Stage 8 and DISCLOSURE-RULES. Behavior '
            'fields per DRILLBEHAVIORLEDGER.csv rows 145-154 (CONFIRMED '
            '2026-08-29). Closing chapter of cohort 5I.'),
        'id': 'chapt_16', 'number': 16,
        'title': 'Aorist and Future Passive Verbs',
        'objectivesPreamble': 'You will be able to:',
        'objectives': objectives(tbk), 'vocab': VOC_KEYS,
        'learn': [], 'drill': [], 'exercise': [], 'quickReview': [],
        'feedback': ch15['feedback'], 'sequence': [],
        '_audioVerify': (
            'Verbs carry up to SIX clips here (p_<v>p present, p_<v>a aorist '
            'passive, p_<v>f future passive, plus p_balr / p_balrp / p_balap '
            'for the principal-parts chart). The Form Drill and the Forms '
            'Speller dispatch the ANSWER half (A1b, table 0x100e07).')}
    ch['learn'] = [
        {'id': 'c16_learn_objectives', 'type': 'contentAudio',
         'mode': 'objectivesPage', 'title': 'Learn Chapter Objectives',
         'instructions': ''},
        english_concepts(tbk, conv), learn_passives(tbk, conv),
        {'id': 'c16_learn_vocab', 'type': 'contentAudio', 'mode': 'flashcard',
         'title': 'Learn Vocabulary', 'pool': 'senses'},
        learn_scr, bibliography(tbk)]
    ch['drill'] = [parsing, forms, translation_drill(tbk, conv, txt), gk, en,
                   scripture_drill(tbk, conv)]
    ch['exercise'] = [passive_speller(tbk, conv, parsing),
                      forms_speller(tbk, conv, forms),
                      vocab_speller(tbk, conv), scripture_speller(tbk, conv)]
    ch['quickReview'] = ([qr_vocab(tbk, conv)] + qr_pages(tbk, conv)
                         + qr_scriptures(ch15, learn_scr))
    ch['sequence'] = [
        'c16_learn_objectives', 'c16_learn_english_concepts',
        'c16_learn_passives', 'c16_drill_parsing', 'c16_drill_forms',
        'c16_drill_translation', 'c16_ex_speller', 'c16_ex_speller_forms',
        'c16_learn_vocab', 'c16_drill_vocab_gk_en', 'c16_drill_vocab_en_gk',
        'c16_ex_vocab_speller', 'c16_learn_scripture',
        'c16_drill_scripture_memory', 'c16_ex_scripture_speller',
        'c16_qr_vocab', 'c16_qr_aorist1', 'c16_qr_aorist2', 'c16_qr_future',
        'c16_qr_forms', 'c16_qr_scripture_mat69',
        'c16_qr_scripture_mat610', 'c16_qr_scripture_mat611',
        'c16_qr_scripture_mat612a', 'c16_learn_bibliography']
    ch['_sequence_note'] = ('Rail order from ch16railwalk.pdf, cross-checked '
                            'against the Drill / Exercise / Quick Review '
                            'menus on its last page.')
    hint1 = aor1_chart(tbk, 0xb9382, 'hintFirstAoristPassive', say=None)
    hint2 = fut_chart(tbk, 0xb9382, 'hintFuturePassive', say=None)
    hint3 = aor2_chart(tbk, 0xbaa3e, 'hintSecondAoristPassive', say=None)
    ch['hintCharts'] = {
        'passiveParadigms': {
            'charts': [hint1, hint2, hint3],
            'switch': 'moreBack',
            '_note': ('THREE charts -> DISCLOSURE 4.2: Back and More as a '
                      'pair on their own centred line, both always visible, '
                      'Back disabled on the first page and More on the last. '
                      'Field 0xb9382 holds the first aorist AND the future '
                      'on one hint screen; 0xbaa3e holds the second aorist '
                      'on its own. Neither carries a say-all, so the pair is '
                      'centred (4.5).')},
        'passiveStemsHint': {
            'charts': [stems_chart(tbk, conv, [0x2504e], 0, 7,
                                   'hintStems1'),
                       stems_chart(tbk, conv, [0x26d20], 7, 15,
                                   'hintStems2')],
            'switch': 'moreBack',
            '_note': ('The Form Drill hint prints the Passive Stems table in '
                      'the original\'s own two halves.')}}
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
            raise SystemExit(f'STOP: emitted clip {cid} not in CHAPT_16 pack')
        if not tbk.has_clip(base) and not re.match(r'[klmno]_', base):
            raise SystemExit(f'STOP: emitted clip {cid} not referenced in TBK')
    errs = audit(ch)
    if errs:
        raise SystemExit('STOP: self-audit failed:\n' + '\n'.join(errs))
    ch = post_patches(ch)
    _self_check(ch, committed)
    os.makedirs(outdir, exist_ok=True)
    with open(outfile, 'w', encoding='utf-8') as f:
        json.dump(ch, f, ensure_ascii=False, indent=1)
    with open(os.path.join(outdir, 'lexicon-chapt16.json'), 'w',
              encoding='utf-8') as f:
        json.dump(build_lexicon(tbk, conv), f, ensure_ascii=False, indent=1)
    print(f'chapter 16: {len(ids)} distinct clips, '
          f'{len(ch["sequence"])} rail pages, '
          f'{sum(len(a.get("items", [])) for a in ch["drill"] + ch["exercise"])}'
          ' scored items. OK.')


def post_patches(doc):
    # RULED 2026-08-29 (Nathanael): the positional second-line pool supplies
    # a continuation that round 21's hand move lost, and the rail walk shows
    # that prompt on two lines with the first ending mid-clause. The
    # recovered line stands; nothing to patch.
    sp = [a for a in doc['exercise']
          if a['id'] == 'c16_ex_scripture_speller'][0]
    assert 'Repeat This Exercise' not in sp['ui']['checkboxes']   # D-42
    assert 'Major Hint' not in sp['ui']['buttons']                # C8 / D-30
    fd = [a for a in doc['drill'] if a['id'] == 'c16_drill_forms'][0]
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
            f'chapt-16.json at {len(bad)} path(s). The committed file may '
            'carry a hand repair this script does not reproduce -- absorb it '
            'into post_patches() first. Set ALLOW_REGRESSIVE_REBUILD=1 only '
            'if the difference IS the intended change.\n  '
            + '\n  '.join(sorted(bad)[:20]))


if __name__ == '__main__':
    main()
