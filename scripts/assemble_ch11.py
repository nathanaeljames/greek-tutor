#!/usr/bin/env python3
# STAGE 8.7 PROVENANCE NOTICE (2026-08-25): once chapt-11.json has been
# hand-repaired in the repo, this assembler becomes provenance only.
# post_patches() re-applies ratified divergences so a regeneration cannot
# resurrect pre-fix values. Refuses to run over a committed copy unless
# ALLOW_REGRESSIVE_REBUILD=1 after a full back-port (PIPELINE-INSIGHTS 8.7).
"""assemble_ch11.py -- chapter 11 (Demonstrative and Relative Pronouns)
from 11_DEMON.TBK. Cohort 5H.

  assemble_ch11.py TBK font-map.json chapt-05.json chapt-10.json \
      wavlist_11.txt outdir

chapt-05.json supplies the DEVICE-VERIFIED definite-article chart rows
(the Who and The Drill hint re-keys their audio to the CHAPT_11 e_*
copies); chapt-10.json supplies the four carried Quick Review verses.

Stage 8 discipline as assemble_ch9/10. Chapter-specific wiring facts,
all read from the TBK (offsets in the code):
  * Both three-stage drills carry their FULL answer key in the page
    script (case-button set x type x gender set per item); the port
    accepts every combination the original accepts (answer +
    answerAlt), so nom/acc-ambiguous neuters are not a VERIFY item.
  * Hints are FORM-DEPENDENT (D-46): Hintout/Hinteke on the two
    This-and-That drills, HintDA/HintRel on the Who and The Drill.
  * Scripture Memory Drill pool spans Mat 6:33a AND 6:33b (12 words);
    clips j_sm1,2,3,4,5,8,10,11 + k_sm2,3,4,5 by WordCounter table.
  * Vocabulary is ELEVEN entries (huper case-split); k_voc7 is the
    three-form recitation used by the flashcard, k_voc7a by the drills.
"""
import json
import os
import re
import struct
import sys
import unicodedata

# RENDERER CONTRACT (learned 2026-08-26): a `_verify` key at TOPIC, block or
# page level draws a learner-facing "pending verification" banner
# (ContentAudio.svelte / RichContent.svelte). Pipeline provenance goes in
# `_verify_note` / `_audio_note` / `_note`, never in `_verify`.

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import underline
from assemble_ch9 import (Tbk, make_conv, conv_mixed, para_blocks, dash, sq,
                          stepper_ui, score_ui, audit)

A = 'chapt_11_'
TEACH_OFFSETS = [0x597e4, 0x5b018, 0x5b3c2, 0x5a35c, 0x39620, 0x39da4,
                 0x4136e, 0x420fc, 0x436ba, 0x5e176, 0x3fb1e]


def aud(name):
    return A + name


def make_conv11(fontmap):
    """ch9's converter, plus the composite iota-subscript codes ^ (eta)
    and & (omega) treated as BASE letters so a form that BEGINS with
    one (the relative dative singulars ᾗ, ᾧ) is not dropped -- the
    shared converter parks a leading composite as a pending mark."""
    base = make_conv(fontmap)

    def conv(s):
        return base(s.replace('^', '\u1fc3').replace('&', '\u1ff3'))
    return conv


def nfc(s):
    return unicodedata.normalize('NFC', s)


def bare(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s)
                   if not unicodedata.combining(c)).lower().strip('.,;')


def greek_in_field(tbk, conv, off, forms, label):
    txt = nfc(conv(tbk.field(off)))
    for f in forms:
        if nfc(f) not in txt:
            raise SystemExit(f'STOP: {f!r} not in {label} field at {off:#x}')


# ------------------------------------------------------------- paradigms
# forms[gender][number] = [N, G, D, A]
EKEINOS = {
    'm': {'s': ['ἐκεῖνος', 'ἐκείνου', 'ἐκείνῳ', 'ἐκεῖνον'],
          'p': ['ἐκεῖνοι', 'ἐκείνων', 'ἐκείνοις', 'ἐκείνους']},
    'f': {'s': ['ἐκείνη', 'ἐκείνης', 'ἐκείνῃ', 'ἐκείνην'],
          'p': ['ἐκεῖναι', 'ἐκείνων', 'ἐκείναις', 'ἐκείνας']},
    'n': {'s': ['ἐκεῖνο', 'ἐκείνου', 'ἐκείνῳ', 'ἐκεῖνο'],
          'p': ['ἐκεῖνα', 'ἐκείνων', 'ἐκείνοις', 'ἐκεῖνα']}}
HOUTOS = {
    'm': {'s': ['οὗτος', 'τούτου', 'τούτῳ', 'τοῦτον'],
          'p': ['οὗτοι', 'τούτων', 'τούτοις', 'τούτους']},
    'f': {'s': ['αὕτη', 'ταύτης', 'ταύτῃ', 'ταύτην'],
          'p': ['αὗται', 'τούτων', 'ταύταις', 'ταύτας']},
    'n': {'s': ['τοῦτο', 'τούτου', 'τούτῳ', 'τοῦτο'],
          'p': ['ταῦτα', 'τούτων', 'τούτοις', 'ταῦτα']}}
HOS = {
    'm': {'s': ['ὅς', 'οὗ', 'ᾧ', 'ὅν'], 'p': ['οἵ', 'ὧν', 'οἷς', 'οὕς']},
    'f': {'s': ['ἥ', 'ἧς', 'ᾗ', 'ἥν'], 'p': ['αἵ', 'ὧν', 'αἷς', 'ἅς']},
    'n': {'s': ['ὅ', 'οὗ', 'ᾧ', 'ὅ'], 'p': ['ἅ', 'ὧν', 'οἷς', 'ἅ']}}
# reflexives: rows G D A only; first/second person have no neuter
REFL = {
    'first': {'m': {'s': ['ἐμαυτοῦ', 'ἐμαυτῷ', 'ἐμαυτόν'],
                    'p': ['ἑαυτῶν', 'ἑαυτοῖς', 'ἑαυτούς']},
              'f': {'s': ['ἐμαυτῆς', 'ἐμαυτῇ', 'ἐμαυτήν'],
                    'p': ['ἑαυτῶν', 'ἑαυταῖς', 'ἑαυτάς']}},
    'second': {'m': {'s': ['σεαυτοῦ', 'σεαυτῷ', 'σεαυτόν'],
                     'p': ['ἑαυτῶν', 'ἑαυτοῖς', 'ἑαυτούς']},
               'f': {'s': ['σεαυτῆς', 'σεαυτῇ', 'σεαυτήν'],
                     'p': ['ἑαυτῶν', 'ἑαυταῖς', 'ἑαυτάς']}},
    'third': {'m': {'s': ['ἑαυτοῦ', 'ἑαυτῷ', 'ἑαυτόν'],
                    'p': ['ἑαυτῶν', 'ἑαυτοῖς', 'ἑαυτούς']},
              'f': {'s': ['ἑαυτῆς', 'ἑαυτῇ', 'ἑαυτήν'],
                    'p': ['ἑαυτῶν', 'ἑαυταῖς', 'ἑαυτάς']},
              'n': {'s': ['ἑαυτοῦ', 'ἑαυτῷ', 'ἑαυτό'],
                    'p': ['ἑαυτῶν', 'ἑαυτοῖς', 'ἑαυτά']}}}
REFL_CLIP = {'first': 'k_aut', 'second': 'k_sea', 'third': 'k_eau'}
REFL_SAY = {'first': 'k_autpar', 'second': 'k_seapar', 'third': 'k_eaupar'}
REFL_TITLE = {'first': ('First Person', '"myself"'),
              'second': ('Second Person', '"yourself"'),
              'third': ('Third Person', '"him/her/itself"')}
COLS = {'m': 'Masc.', 'f': 'Fem.', 'n': 'Neut.'}
CASES = 'ngda'
REFL_NOTE = ('Note: There are no nominative forms since the personal '
             'pronouns fill that role.')
HOS_NOTE = ('Note how similar these are to the noun endings and to the '
            'definite article.')
HOUTOS_NOTE = ('Note: When there is an α or η in the ending, the stem will '
               'have an αυ, otherwise it is ου.')


def all_forms(forms):
    return [f for g in forms.values() for n in g.values() for f in n]


def split_paradigm(tbk, pid, title, forms, prefix, say_clip, note=None,
                   hint_titles=False):
    """A six-column chart as two three-column charts (Singular / Plural),
    §4.1 named toggle; both halves carry the ONE say-all clip the
    original records for the whole paradigm."""
    charts = []
    for num, name in (('s', 'Singular'), ('p', 'Plural')):
        rows = []
        for ci, case in enumerate(CASES):
            cells = []
            for g in 'mfn':
                clip = f'{prefix}{g}{case}{num}'
                if not tbk.has_clip(clip):
                    raise SystemExit(f'STOP: {clip} not in TBK')
                cells.append({'greek': forms[g][num][ci], 'audio': aud(clip)})
            rows.append({'label': case.upper(), 'cells': cells})
        ch = {'type': 'paradigm', 'name': name,
              'title': f'{title}, {name}' if hint_titles else title,
              'subtitle': name, 'columns': [COLS[g] for g in 'mfn'],
              'showGlosses': False, 'rows': rows}
        if say_clip:
            if not tbk.has_clip(say_clip):
                raise SystemExit(f'STOP: {say_clip} not in TBK')
            ch['sayWhole'] = {'label': 'Say Paradigm', 'audio': aud(say_clip)}
        if note:
            ch['note'] = note
        charts.append(ch)
    return {'type': 'paradigm', 'id': pid, 'switch': 'named',
            'charts': charts,
            '_split_note': ('Six Greek columns in the original; split '
                            'Singular/Plural per DISCLOSURE-RULES §4.1 (the '
                            'ch5 article / ch7 adjective precedent). One '
                            'say-all clip covers both halves.')}


def refl_chart(tbk, person, num):
    forms = REFL[person]
    genders = list(forms.keys())
    rows = []
    for ci, case in enumerate('gda'):
        cells = []
        for g in genders:
            clip = f'{REFL_CLIP[person]}{g}{case}{num}'
            if not tbk.has_clip(clip):
                raise SystemExit(f'STOP: {clip} not in TBK')
            cells.append({'greek': forms[g][num][ci], 'audio': aud(clip)})
        rows.append({'label': case.upper(), 'cells': cells})
    name = 'Singular' if num == 's' else 'Plural'
    ptitle, gloss = REFL_TITLE[person]
    return {'type': 'paradigm', 'name': f'{ptitle} {name}',
            'title': f'Reflexive Pronouns: {ptitle}',
            'subtitle': f'{name} {gloss}',
            'columns': [COLS[g] for g in genders], 'showGlosses': False,
            'rows': rows, 'note': REFL_NOTE,
            'sayWhole': {'label': 'Say Paradigm', 'audio': aud(REFL_SAY[person])}}


def reflexive_stack(tbk, conv):
    for person, off in (('first', 0x2f688), ('second', 0x319b4),
                        ('third', 0x33d2a)):
        greek_in_field(tbk, conv, off, all_forms(REFL[person]),
                       f'reflexive {person}')
        if not tbk.has_clip(REFL_SAY[person]):
            raise SystemExit(f'STOP: {REFL_SAY[person]} not in TBK')
    charts = [refl_chart(tbk, p, n) for p in ('first', 'second', 'third')
              for n in ('s', 'p')]
    return {'type': 'paradigm', 'id': 'reflexiveParadigms',
            'switch': 'moreBack', 'charts': charts,
            '_stack_note': ('The original pages three persons via in-page '
                            'First/Second/Third Person links; each person '
                            'is split Singular/Plural for 320px, giving a '
                            'six-chart §4.2 Back/More stack. The person\'s '
                            'one say-all clip repeats on both of its '
                            'halves. VERIFY-5H veto item (l).')}


def article_hint(tbk, ch5):
    """Definite Article "the" hint: rows lifted from the device-verified
    ch5 article chart, audio re-keyed to the CHAPT_11 e_* copies, labels
    and headers transcribed from the ch11 hint's OWN screen (§4.7):
    Nom./Gen./Dat./Acc. rows, underlined Singular/Plural headers."""
    src = None
    for a in ch5['learn']:
        for t in a.get('topics', []):
            for b in t.get('content', []):
                if isinstance(b, dict) and b.get('type') == 'paradigm' and \
                        b.get('switch') == 'named' and \
                        b['charts'][0]['rows'][0]['cells'][0]['greek'] == 'ὁ':
                    src = b
    if src is None:
        raise SystemExit('STOP: ch5 article chart not found')
    charts = []
    for c in src['charts']:
        rows = []
        for r in c['rows']:
            cells = []
            for cell in r['cells']:
                clip = cell['audio'].replace('chapt_5_', '')
                if not tbk.has_clip(clip):
                    raise SystemExit(f'STOP: article clip {clip} not in TBK')
                cells.append({'greek': cell['greek'], 'audio': aud(clip)})
            rows.append({'label': r['label'], 'cells': cells})
        charts.append({'type': 'paradigm', 'name': c['name'],
                       'title': f'Definite Article "the", {c["name"]}',
                       'headerUnderline': True,
                       'columns': ['Masc.', 'Fem.', 'Neut.'],
                       'showGlosses': False, 'rows': rows})
    return charts


# ---------------------------------------------------------- key scripts
def parse_keys(data, lo, hi, n):
    """Per-item answer key from the drill page's compiled AnalyzeAnswer
    script: '= N' blocks carrying '= sK' case buttons (parenthesised
    OR-groups for ambiguous forms) and '=X' single-letter tokens."""
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
        raise SystemExit(f'STOP: key script at {lo:#x}: {len(seq)}/{n} items')
    out = {}
    for i, (num, st) in enumerate(seq):
        end = seq[i + 1][1] if i + 1 < len(seq) else st + 400
        blk = txt[st:end]
        s = sorted({int(x) for x in re.findall(r'=\s?s(\d)', blk)})
        letters = re.findall(r'=([A-Z])\b', blk)
        out[num] = (s, letters)
    return out


CASE_BTN = {1: 'Nominative Singular', 2: 'Genitive Singular',
            3: 'Dative Singular', 4: 'Accusative Singular',
            6: 'Nominative Plural', 7: 'Genitive Plural',
            8: 'Dative Plural', 9: 'Accusative Plural'}
GENDER = {'M': 'Masculine', 'F': 'Feminine', 'N': 'Neuter'}
CASE_NUMBER_VALUES = ['Nominative Singular', 'Nominative Plural',
                      'Genitive Singular', 'Genitive Plural',
                      'Dative Singular', 'Dative Plural',
                      'Accusative Singular', 'Accusative Plural']


def dispatch(data, lo, hi):
    """WordCounter -> clip from a SayWord dispatch table: for every clip
    literal, the LAST '= N' token within the preceding 70 bytes is its
    item number (a preceding '=4' variable reference is not)."""
    seg = data[lo:hi]
    out = {}
    for m in re.finditer(rb'"([A-Za-z]_[A-Za-z0-9]+)\.', seg):
        back = seg[max(0, m.start() - 70):m.start()]
        nums = re.findall(rb'=\s?(\d{1,2})(?![\dA-Za-z])', back)
        if not nums:
            continue
        out.setdefault(int(nums[-1]), m.group(1).decode().lower())
    return out


def literal_set(tbk, conv, lo, hi):
    """Every accented answer literal (="form") the speller's own
    check script names in the region: the original's answer key."""
    lits = re.findall(rb'=\x22([ -~]{1,30})\x22', tbk.data[lo:hi])
    return {nfc(conv(l.decode('latin-1'))) for l in lits}


def check_literals(tbk, conv, items, lo, hi, label):
    """Corroboration, not source: the compiled check scripts yield only
    a PARTIAL literal set to a byte regex, so the rule is that every
    literal recovered must be a derived answer (no contradiction) and
    a third of the derived answers (eight at most) must be recovered."""
    have = literal_set(tbk, conv, lo, hi)
    answers = {nfc(it['answer']) for it in items}
    unacc = {bare(a) for a in answers}
    strays = [h for h in have if h not in answers and bare(h) not in unacc]
    if strays:
        raise SystemExit(f'STOP: {label}: check-script literals {strays} '
                         'are not derived answers')
    hit = len(answers & have)
    if hit < min(8, (len(answers) + 2) // 3):
        raise SystemExit(f'STOP: {label}: only {hit}/{len(answers)} derived '
                         'answers corroborated by check-script literals')
    return f'{hit}/{len(answers)} answers corroborated by check-script literals'


def three_stage(tbk, conv, aid, title, pool_off, n, key_lo, key_hi,
                disp_lo, disp_hi, type_letters, type_labels, hint_by_type,
                default_hint, derive_clip):
    prompts = [sq(conv(x)) for x in
               tbk.pool(pool_off, n, f'{aid} prompts', allow_blank=True)]
    if any(not p for p in prompts):
        raise SystemExit(f'STOP: blank prompt in {aid}')
    keys = parse_keys(tbk.data, key_lo, key_hi, n)
    disp = dispatch(tbk.data, disp_lo, disp_hi)
    items = []
    for i in range(1, n + 1):
        cases, letters = keys[i]
        types = [type_labels[l] for l in letters if l in type_labels]
        genders = [GENDER[l] for l in letters if l in GENDER]
        if len(types) != 1 or not genders or not cases:
            raise SystemExit(f'STOP: {aid} item {i}: key {keys[i]}')
        combos = [[types[0], g, CASE_BTN[c]] for g in genders for c in cases]
        clip = disp.get(i)
        restored = False
        if not clip:
            # a BLANK SayWord entry (the ch10 item-18 class): the key
            # names the form's cell, so the cell clip restores intent
            clip = derive_clip(prompts[i - 1], types[0], genders[0], cases[0])
            restored = True
        if not tbk.has_clip(clip):
            raise SystemExit(f'STOP: {aid} item {i}: dispatch {clip!r}')
        it = {'greek': prompts[i - 1], 'answer': combos[0],
              'audio': aud(clip), 'hintRef': hint_by_type[types[0]]}
        if restored:
            it['_audio_note'] = ('SayWord entry BLANK in the original; '
                                 'wired to the form\'s own cell clip.')
        if len(combos) > 1:
            it['answerAlt'] = combos[1:]
            it['_ambiguous_note'] = ('The original\'s key accepts every '
                                     'combination listed; ACCEPT ANY of '
                                     'answer + answerAlt.')
        items.append(it)
    return {
        'id': aid, 'type': 'select', 'mode': 'twoStageGrid', 'title': title,
        'instructions': 'Click on the translation, gender then case/number',
        'promptIsGreek': True, 'options': 'static',
        'optionStages': [
            {'label': 'translation', 'values': list(type_labels.values())},
            {'label': 'gender', 'values': ['Masculine', 'Feminine', 'Neuter']},
            {'label': 'caseNumber', 'values': CASE_NUMBER_VALUES,
             'layout': 'paradigm2col'}],
        'items': items, 'scored': True,
        'ui': stepper_ui(hint=default_hint),
        '_stage_note': ('THREE optionStages (the ch10 generalisation); the '
                        'guess commits on the final (case/number) click. '
                        'Answer keys, including every accepted alternative, '
                        'are read from the page\'s AnalyzeAnswer script '
                        f'({key_lo:#x}-{key_hi:#x}); clips from the SayWord '
                        f'table ({disp_lo:#x}-{disp_hi:#x}). Hint is '
                        'FORM-DEPENDENT per item (D-46).'),
        'audioTiming': 'beforeGuess',
        'answerPolicy': {'advanceClass': 'manualOnIncorrect',
                         'attemptsPerItem': 1}}


# ------------------------------------------------------------ translation
G2_ITEMS = {'c11_drill_translation_this_that': (8,)}  # rail walk p7
TT_ANSWERS = [  # ch11railwalk.pdf p6-p10, the blue (correct) option per item
    'upon my servants in those days', 'about this he said to them',
    'after those days, says the Lord', 'I am not of this world',
    'in that land', 'because he sees the light of this world',
    'at that hour Jesus said to the crowds',
    'by this everyone will know that you are my disciples',
    'I say to you that Sodom in that day', 'This is the bread',
    'from the Lord on that day', 'this is the work of God',
    'and those are the ones upon the ground',
    'after this he said to the disciples', 'blessed are those servants',
    'and after this he said to them', 'for the end of those things is death',
    'I say that you are Peter, and upon this rock']
TR_ANSWERS = [  # ch11railwalk.pdf p14-p17
    'there is a boy here who has 5 loaves',
    'an Israelite in whom there is no deceit',
    'it is that one with whom I dip the morsel',
    'Blessed is that slave who',
    'and the one who you have now is not your husband',
    'whom you yourselves say that "he is our God"',
    'the word which you hear is not mine',
    'which the son of man will give to you',
    'and that which you hear in the ear']


def translation(tbk, conv, aid, title, n, off_g, off_opts, off_refs, disp_lo,
                disp_hi, clipfam, answers, hint_fn, default_hint, last_opts,
                last_greek, note, off_g2=None):
    greek2 = None
    if off_g2:
        # POSITIONAL pool with blanks: drop only the field's leading CRLF
        lines = [l.strip() for l in tbk.field(off_g2).split('\r\n')]
        greek2 = [sq(conv(x)) if x else None for x in lines[:n]]
        # the buffer's tail is stale past the last authored entry; the rail
        # walk shows exactly one two-line item, so only that one is taken
        for k in range(n):
            if greek2[k] and (k + 1) not in G2_ITEMS.get(aid, ()):
                greek2[k] = None
        for k in G2_ITEMS.get(aid, ()):
            if not greek2[k - 1]:
                raise SystemExit(f'STOP: {aid} item {k}: expected line 2')
    greek = [sq(conv(x)) for x in tbk.pool(off_g, n, f'{aid} greek')]
    if not greek[n - 1].startswith(last_greek):
        raise SystemExit(f'{aid}: last prompt {greek[n-1]!r} vs rail walk')
    greek[n - 1] = last_greek  # same stale-tail cut as the option columns
    cols = [[sq(x.split('\n')[0]) for x in tbk.pool(o, n, f'{aid} col')]
            for o in off_opts]
    # Stage 4: the LAST entry of each option column runs into a stale
    # buffer tail with no separator (prefix read, screenshot cut); the
    # rail walk's answered screen supplies the cut for that one item.
    for k, want in enumerate(last_opts):
        if not cols[k][n - 1].startswith(want):
            raise SystemExit(f'{aid}: last option {cols[k][n-1]!r} does not '
                             f'start with rail-walk {want!r}')
        cols[k][n - 1] = want
    refs = [sq(x) for x in tbk.pool(off_refs, n, f'{aid} refs')]
    disp = dispatch(tbk.data, disp_lo, disp_hi)
    items = []
    for i in range(n):
        opts = [c[i] for c in cols]
        norm = [sq(o.replace('"', '"')) for o in opts]
        if answers[i] not in norm:
            raise SystemExit(f'STOP: {aid} item {i+1}: rail-walk answer '
                             f'{answers[i]!r} not among {norm}')
        clip = disp.get(i + 1)
        if clip != f'{clipfam}{i+1}' or not tbk.has_clip(clip):
            raise SystemExit(f'STOP: {aid} item {i+1} dispatch {clip!r}')
        it = {'greek': greek[i], 'ref': refs[i], 'options': norm,
              'answer': answers[i], 'audio': aud(clip)}
        if greek2 and greek2[i]:
            it['greek2'] = greek2[i]
        if bare(greek[i]).startswith('και εκεινοι'):
            it['_verify'] = ('The original types ekeinoi WITHOUT its smooth '
                             'breathing (ekei?noi<); verbatim, keep-or-fix.')
        hr = hint_fn(greek[i])
        if hr:
            it['hintRef'] = hr
        items.append(it)
    return {
        'id': aid, 'type': 'select', 'mode': 'fullOptionGrid', 'title': title,
        'instructions': 'Click on the correct translation',
        'promptIsGreek': True, 'options': 'perItem',
        'optionLayout': 'stack1col', 'items': items, 'scored': True,
        'ui': stepper_ui(hint=default_hint),
        '_answer_note': note,
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'manualOnIncorrect',
                         'attemptsPerItem': 1}}


def demonstrative_hint(greek):
    words = {bare(w) for w in greek.split()}
    has_that = bool(words & {bare(f) for f in all_forms(EKEINOS)})
    has_this = bool(words & {bare(f) for f in all_forms(HOUTOS)})
    if has_that == has_this:
        raise SystemExit(f'STOP: cannot key hint for {greek!r}')
    return 'thatParadigm' if has_that else 'thisParadigm'


# ----------------------------------------------------------------- vocab
VOC_KEYS = ['aperchomai', 'ekeinos', 'ioudaios', 'kathos', 'hos', 'hotan',
            'houtos', 'palin', 'petros', 'huper_gen', 'huper_acc']
VOC_FREQ = [117, 265, 195, 182, 1365, 123, 1388, 141, 150, 150, None]
VOC_CLIPS = ['k_voc1', 'k_voc2', 'k_voc3', 'k_voc4', 'k_voc5', 'k_voc6',
             'k_voc7a', 'k_voc8', 'k_voc9', 'k_voc10', 'k_voc11']


def vocab_pools(tbk, conv):
    greek = []
    for x in tbk.pool(0x54b36, 11, 'vocab greek'):
        m = re.match(r'^\s*(.+?)\s*(\((gen|acc)\.\))?(\s+u\[po<.*)?\s*$', x)
        g = sq(conv(m.group(1)))
        greek.append(g + (' ' + m.group(2) if m.group(2) else ''))
    gloss_drill = [sq(x) for x in tbk.pool(0x54db2, 11, 'drill glosses')]
    gloss_card = [sq(x) for x in tbk.pool(0xbb4c0, 11, 'flashcard glosses')]
    if greek[9] != 'ὑπέρ (gen.)' or greek[10] != 'ὑπέρ (acc.)':
        raise SystemExit(f'STOP: huper senses misparse: {greek[9:]}')
    return greek, gloss_drill, gloss_card


def vocab_drills(tbk, conv):
    greek, gloss, _ = vocab_pools(tbk, conv)
    for i in (1, 2, 3, 6, 7, 10, 11):  # flashcard, both drills, speller
        pass
    gk_items, en_items = [], []
    for i, (g, gl, c) in enumerate(zip(greek, gloss, VOC_CLIPS)):
        if not tbk.has_clip(c):
            raise SystemExit(f'STOP: {c} not in TBK')
        m = re.match(r'^(.*?)\s*(\((gen|acc)\.\))?$', g)
        base, tag = m.group(1), m.group(2)
        gk_items.append({'greek': base, 'note': tag, 'answer': gl,
                         'audio': aud(c)})
        en_items.append({'prompt': gl, 'answer': g, 'audio': aud(c)})
    opts_en = [i['answer'] for i in en_items]
    gk = {'id': 'c11_drill_vocab_gk_en', 'type': 'select',
          'mode': 'fullOptionGrid',
          'title': 'Vocabulary:  Greek to English Drill',
          'instructions': 'Click on the matching word',
          'promptIsGreek': True, 'options': 'static',
          'optionValues': gloss, 'items': gk_items, 'scored': True,
          'ui': score_ui(), 'poolKind': 'vocabulary', 'pool': 'senses',
          '_pool_note': ('ELEVEN entries: huper is case-split (gen./acc.) '
                         'and the original\'s 12-cell grid leaves one cell '
                         'empty. Dispatch tables at 0x12b74c/0x130e61 map '
                         'k_voc1-11 (7 -> k_voc7a).'),
          'audioTiming': 'beforeGuess',
          'answerPolicy': {'advanceClass': 'autoBoth', 'attemptsPerItem': 1}}
    en = {'id': 'c11_drill_vocab_en_gk', 'type': 'select',
          'mode': 'fullOptionGrid',
          'title': 'Vocabulary: English to Greek Drill',
          'instructions': 'Click on the matching word',
          'options': 'static', 'optionsAreGreek': True,
          'optionValues': opts_en, 'items': en_items, 'scored': True,
          'ui': score_ui(), 'poolKind': 'vocabulary', 'pool': 'senses',
          'audioTiming': 'afterGuess',
          'answerPolicy': {'advanceClass': 'autoBoth', 'attemptsPerItem': 1}}
    return gk, en


def vocab_speller(tbk, conv):
    greek, _, _ = vocab_pools(tbk, conv)
    glosses = [sq(x) for x in tbk.pool(0xa5c4a, 10, 'vocab speller glosses')]
    answers = [re.sub(r',.*$', '', g) for g in greek[:10]]  # first form
    answers = [re.sub(r'\s*\(gen\.\)$', '', a) for a in answers]
    items = [{'prompt': gl, 'answer': a, 'audio': aud(c)}
             for gl, a, c in zip(glosses, answers, VOC_CLIPS)]
    check_literals(tbk, conv, items, 0x97c00, 0x98400, 'vocab speller')
    return {
        'id': 'c11_ex_vocab_speller', 'type': 'spell',
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
        '_answer_note': ('TEN items (pool 0xa5c4a): huper appears once, '
                         'prompted "for, about (gen.)"; multi-form entries '
                         'are spelled by their first form (ekeinos, hos, '
                         'houtos, Petros), as the flashcard prompts.'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


# ---------------------------------------------------------------- spellers
def parse_tag(tag):
    m = re.match(r'\((masc|fem|neut)\. (nom|gen|dat|acc)\. (sg|pl)\.\)', tag)
    if not m:
        raise SystemExit(f'STOP: parse tag {tag!r}')
    return m.group(1)[0], m.group(2)[0], m.group(3)[0]


def this_that_speller(tbk, conv):
    prompts = [sq(x) for x in tbk.pool(0x90f68, 25, 'TT speller prompts')]
    disp = dispatch(tbk.data, 0x96700, 0x96ee0)
    items = []
    for i, p in enumerate(prompts, 1):
        word, tag = p.split(' ', 1)
        g, c, n = parse_tag(tag)
        forms = HOUTOS if word in ('this', 'these') else EKEINOS
        ans = forms[g][n][CASES.index(c)]
        clip = disp.get(i)
        if not clip:
            # entries the table scan could not pair are derived from the form
            clip = ('k_out' if forms is HOUTOS else 'k_eke') + g + c + n
        want = ('k_out' if forms is HOUTOS else 'k_eke') + g + c + n
        if clip != want:
            raise SystemExit(f'STOP: TT speller {i}: dispatch {clip} != {want}')
        if not tbk.has_clip(clip):
            raise SystemExit(f'STOP: {clip} not in TBK')
        items.append({'prompt': p, 'answer': ans, 'audio': aud(clip)})
    check_literals(tbk, conv, items, 0x120000, 0x131f00, "TT speller")
    return {
        'id': 'c11_ex_speller_this_that', 'type': 'spell',
        'title': 'This and That Spelling Exercise',
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
        '_answer_note': ('Answers derived from the two demonstrative charts '
                         'by the prompt\'s parse tag and asserted against '
                         'the SayWord table at 0x9688a, whose clip names '
                         'encode gender/case/number.'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


REFL_WORD = {'myself': 'first', 'yourself': 'second', 'yourselves': 'second',
             'ourselves': 'first', 'himself': 'third', 'herself': 'third',
             'itself': 'third', 'themselves': 'third'}


def relative_speller(tbk, conv):
    prompts = [sq(x) for x in tbk.pool(0x1b1dc, 26, 'RR speller prompts')]
    disp = dispatch(tbk.data, 0x96ee0, 0x97500)
    items = []
    for i, p in enumerate(prompts, 1):
        m = re.match(r'^(.*?)\s*(\(.*\))$', p)
        word, tag = m.group(1), m.group(2)
        g, c, n = parse_tag(tag)
        if word in REFL_WORD:
            person = REFL_WORD[word]
            ans = REFL[person][g][n]['gda'.index(c)]
            want = f'{REFL_CLIP[person]}{g}{c}{n}'
        else:
            ans = HOS[g][n][CASES.index(c)]
            want = f'k_os{g}{c}{n}'
        clip = disp.get(i) or want
        if not tbk.has_clip(want):
            raise SystemExit(f'STOP: {want} not in TBK')
        it = {'prompt': p, 'answer': ans, 'audio': aud(want)}
        if clip != want:
            it['_audio_note'] = (f'The original dispatches {clip} here, which '
                                 f'is a different cell from the answer '
                                 f'{ans}; wired to the answer\'s own cell '
                                 'clip (fidelity restoration).')
        items.append(it)
    check_literals(tbk, conv, items, 0x131f00, 0x132900, 'RR speller')
    return {
        'id': 'c11_ex_speller_relative', 'type': 'spell',
        'title': 'Relative and Reflexive Spelling Exercise',
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
        '_answer_note': ('26 prompts mixing relative and reflexive forms; '
                         'answers derived from the charts and asserted '
                         'against the SayWord table (0x974c0 region). '
                         'Prompt 24 prints "whom (masc. nom. pl.)" in the '
                         'original (expected "who"); kept verbatim, '
                         'VERIFY-5H (h).'),
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


# ------------------------------------------------------------ scripture
VERSE_633B = ['καὶ', 'ταῦτα', 'πάντα', 'προστεθήσεται', 'ὑμῖν.']
GLOSS_633B = ['and', 'these', 'all', 'will be added', 'to you.']
SM_POOL_GLOSS = {'ζητεῖτε': 'you seek', 'δὲ': 'but', 'πρῶτον': 'first',
                 'τὴν': 'the', 'βασιλείαν': 'kingdom', 'καὶ': 'and',
                 'δικαιοσύνην': 'righteousness', 'αὐτοῦ': 'his',
                 'ταῦτα': 'these', 'πάντα': 'all',
                 'προστεθήσεται': 'will be added', 'ὑμῖν': 'to you'}
SM_OPTS = ['all', 'righteousness', 'and', 'the', 'but', 'these', 'first',
           'to you', 'his', 'you seek', 'kingdom', 'will be added']


def learn_scripture(tbk, conv):
    greek_in_field(tbk, conv, 0x4f730, ['προστεθήσεται', 'ὑμῖν'], 'interlinear')
    words = []
    for k, (w, gl) in enumerate(zip(VERSE_633B, GLOSS_633B), 1):
        clip = f'k_sm{k}'
        if not tbk.has_clip(clip):
            raise SystemExit(f'STOP: {clip} not in TBK')
        words.append({'greek': w, 'gloss': gl, 'audio': aud(clip)})
    if not tbk.has_clip('k_mt633b'):
        raise SystemExit('STOP: k_mt633b not in TBK')
    return {'id': 'c11_learn_scripture', 'type': 'contentAudio',
            'mode': 'interlinearVerse', 'title': 'Learn Scripture Memory',
            'reference': 'Mat 6:33b', 'words': words,
            'sayWhole': {'label': 'Say Whole Verse', 'audio': aud('k_mt633b')}}


def scripture_drill(tbk, conv):
    prompts = [sq(conv(x)) for x in tbk.pool(0x88474, 12, 'sm prompts')]
    disp = dispatch(tbk.data, 0xa2ba4, 0xa2f00)
    items = []
    for i, g in enumerate(prompts, 1):
        clip = disp.get(i)
        if not clip or not tbk.has_clip(clip):
            raise SystemExit(f'STOP: SM item {i} dispatch {clip!r}')
        items.append({'greek': g, 'answer': SM_POOL_GLOSS[g], 'audio': aud(clip)})
    return {'id': 'c11_drill_scripture_memory', 'type': 'select',
            'mode': 'fullOptionGrid', 'title': 'Scripture Memory Drill',
            'instructions': 'Click on the matching word',
            'promptIsGreek': True, 'options': 'static',
            'optionValues': SM_OPTS, 'items': items, 'scored': True,
            'ui': score_ui(),
            '_audio_note': ('CUMULATIVE pool: the twelve prompts span Mat '
                            '6:33a and 6:33b (tou theou omitted); the SayWord '
                            'table at 0xa2ba4 dispatches j_sm1,2,3,4,5,8,10,11 '
                            '(6:33a positions, shipped forward) and k_sm2-5.'),
            'audioTiming': 'beforeGuess',
            'answerPolicy': {'advanceClass': 'autoBoth', 'attemptsPerItem': 1}}


def scripture_speller(tbk, conv):
    return {
        'id': 'c11_ex_scripture_speller', 'type': 'spellVerse',
        'title': 'Scripture Memory Spelling Exercise',
        'instructions': 'Enter all of Mat 6:33b then click "Check Answer"',
        'reference': 'Mat 6:33b', 'answerWords': VERSE_633B,
        'translation': 'and all these things will be added to you',
        'accentsOptional': True, 'punctuationOptional': True,
        'audio': aud('k_mt633b'), 'spellerTilesRef': 'chapt_1',
        'ui': {'fields': ['Spell Greek'],
               'buttons': ['Pronounce', 'Check Answer', 'Greek Keyboard',
                           'Restart Exercise'],
               'checkboxes': ['Show Answer', 'With Accents'],
               '_reveal_note': 'RULES C8 / D-30.'},
        '_repeat_note': '"Repeat This Exercise" NOT ported (D-42 retired).',
        'audioTiming': 'afterGuess',
        'answerPolicy': {'advanceClass': 'retryUntilRight',
                         'attemptsPerItem': 'retry'}}


# ----------------------------------------------------------------- learn
def english_concepts(tbk, conv):
    topics = []
    for tid, title, off in [('introduction', 'Introduction', 0x597e4),
                            ('demonstratives', 'Demonstratives', 0x5b018),
                            ('relatives', 'Relatives', 0x5b3c2),
                            ('reflexives', 'Reflexives/Reciprocals', 0x5a35c)]:
        raw = tbk.marked(off).split('\r\n')
        blocks = para_blocks(conv, raw)
        topics.append({'id': tid, 'title': title, 'content': blocks})
    joined = json.dumps(topics, ensure_ascii=False)
    for must in ['[[u]]Demonstratives[[/u]]', '[[u]]who[[/u]]',
                 '[[u]]which[[/u]]', '[[u]]Reflexive[[/u]]',
                 '[[u]]one another[[/u]]']:
        if must not in joined:
            raise SystemExit(f'STOP: EC underline missing: {must}')
    # example sentences are LINES in the original (one per line)
    d = topics[1]['content'][-1]
    d['text'] = re.sub(r'\s+(?=Pronoun:)', '\n', d['text'])
    d['flush'] = True
    r = topics[2]['content'][-1]
    r['text'] = re.sub(r'\s+(?=The keys)', '\n', r['text'])
    r['flush'] = True
    rf = topics[3]['content']
    rf[0]['text'] = re.sub(r'\s+(?=Terry threw)', '\n', rf[0]['text'])
    rf[1]['text'] = re.sub(r'\s+(?=They loved)', '\n', rf[1]['text'])
    return {'id': 'c11_learn_english_concepts', 'type': 'contentAudio',
            'mode': 'topicPages', 'title': 'Learn English Concepts',
            'topics': topics}


def demonstratives(tbk, conv):
    greek_in_field(tbk, conv, 0x1679c, all_forms(EKEINOS), 'ekeinos chart')
    greek_in_field(tbk, conv, 0x1845a, all_forms(HOUTOS), 'houtos chart')
    for c in ('k_ekemns', 'k_outmfn', 'k_ex1', 'k_ex2', 'k_ex3', 'k_ex4'):
        if not tbk.has_clip(c):
            raise SystemExit(f'STOP: {c} not in TBK')
    intro_raw = tbk.field(0x39620).split('\r\n')
    intro_lead = sq(intro_raw[2])
    tail = ' '.join(l.strip() for l in intro_raw[7:] if l.strip())
    if not intro_lead.startswith('Greek has two') or \
            not tail.startswith('These can function'):
        raise SystemExit('STOP: demonstratives intro misparse')
    more_raw = tbk.field(0x39da4).split('\r\n')
    more = para_blocks(conv, more_raw[:12])
    if len(more) != 2 or not more[1]['text'].startswith('Note that'):
        raise SystemExit('STOP: Demonstratives More page misparse')
    more.append({'type': 'para', 'gapBefore': True,
                 'text': '[[link:demonstrativeExamples]]Greek Examples[[/link]]'})
    ex_raw = tbk.field(0x3fb1e).split('\r\n')
    gl = lambda i: sq(ex_raw[i])
    def greek_line(i):
        g = sq(conv(ex_raw[i]))
        # the field prints e]]ste (a doubled smooth breathing): typographic
        # normalization (typo policy A1, third extension)
        return g.replace('\u1f10\u0313', '\u1f10')
    spec = [(greek_line(2), None, gl(3), 'k_ex1'),
            (greek_line(5), None, gl(6), 'k_ex2'),
            (greek_line(8), greek_line(9), gl(10), 'k_ex3'),
            (greek_line(12), None, gl(13), 'k_ex4')]
    rows = []
    for g, g2, glref, clip in spec:
        m = re.match(r'^(.*?)\s*\(([^)]+)\)$', glref)
        if not m or not g:
            raise SystemExit(f'STOP: Demonstrative Examples misparse: {glref!r}')
        rows.append({'greek': g, 'greek2': g2, 'gloss': m.group(1),
                     'ref': m.group(2), 'audio': aud(clip)})
    if 'τοὺτου' in rows[1]['greek']:
        rows[1]['_verify'] = ('The field types a GRAVE on toutou (tou>tou); '
                              'the drill pool has the acute. Verbatim, '
                              'VERIFY-5H keep-or-fix.')
    topics = [
        {'id': 'introduction', 'title': 'Introduction', 'content': [
            {'type': 'para', 'text': intro_lead},
            {'type': 'greekRows', 'rows': [
                {'greek': 'ἐκεῖνος', 'gloss': 'that (plural = those)',
                 'audio': aud('k_ekemns')},
                {'greek': 'οὗτος/αὕτη/τοῦτο', 'gloss': 'this (plural = these)',
                 'audio': aud('k_outmfn'),
                 '_verify': 'k_outmfn assumed to be the three-form entry.'}]},
            {'type': 'para', 'text': sq(tail), 'gapBefore': True},
            {'type': 'expander', 'label': 'Demonstratives', 'content': more,
             '_disclosure': 'C6: the More page carries its own header.'}]},
        {'id': 'thatParadigm', 'title': '"That" Paradigm', 'content': [
            split_paradigm(tbk, 'thatParadigmChart', 'ἐκεῖνος — that/those',
                           EKEINOS, 'k_eke', 'k_ekepar')]},
        {'id': 'thisParadigm', 'title': '"This" Paradigm', 'content': [
            split_paradigm(tbk, 'thisParadigmChart', 'οὗτος — this/these',
                           HOUTOS, 'k_out', 'k_outpar', note=HOUTOS_NOTE)]}]
    popups = [{'id': 'demonstrativeExamples', 'title': 'Demonstrative Examples',
               'content': [{'type': 'greekRows', 'layout': 'verseExamples',
                            'rows': rows}],
               '_disclosure': 'C3: in-text link -> modal (verses, not a chart).'}]
    return {'id': 'c11_learn_demonstratives', 'type': 'contentAudio',
            'mode': 'topicPages', 'title': 'Learn Demonstrative Pronouns',
            'topics': topics, 'popups': popups, 'greekTaps': True}


def relatives(tbk, conv):
    greek_in_field(tbk, conv, 0x2bfb2, all_forms(HOS), 'hos chart')
    intro = para_blocks(conv, tbk.marked(0x4136e).split('\r\n'))
    cont_raw = tbk.field(0x420fc)
    body = ' '.join(l.strip() for l in cont_raw.split('\r\n')[1:] if l.strip())
    parts = re.split(r'\s(?=\d\))', ' ' + body)
    cont_items = [sq(re.match(r'\d\)\s*(.*)$', p.strip(), re.S).group(1))
                  for p in parts[1:]]
    if len(cont_items) != 2:
        raise SystemExit('STOP: Relative Pronouns (cont.) misparse')
    intro.append({'type': 'numbered', 'items': cont_items, 'gapBefore': True})
    refl_raw = tbk.marked(0x436ba).split('\r\n')[:10]
    refl = para_blocks(conv, refl_raw, drop_title=False)
    if len(refl) != 2 or 'αὐτός' not in refl[0]['text']:
        raise SystemExit('STOP: Reflexive/Reciprocal misparse')
    for c in ('k_autos', 'k_allhlw', 'k_ospar'):
        if not tbk.has_clip(c):
            raise SystemExit(f'STOP: {c} not in TBK')
    topics = [
        {'id': 'introduction', 'title': 'Introduction', 'content': intro,
         '_verify_note': ('VERIFY-5H (a): in the rail walk the Introduction radio '
                     'shows the Reflexive/Reciprocal box. This text is the '
                     'TBK\'s own "Relative Pronouns" field (0x4136e) plus its '
                     '(cont.) page (0x420fc) merged as C5. Six clips '
                     '(k_agree1-4, k_under1-2) exist for examples this page '
                     'never shows and are NOT wired.')},
        {'id': 'relativesParadigm', 'title': 'Relatives Paradigm', 'content': [
            split_paradigm(tbk, 'relativeParadigmChart', 'ὅς — who/which',
                           HOS, 'k_os', 'k_ospar', note=HOS_NOTE)]},
        {'id': 'reflexiveReciprocal', 'title': 'Reflexive/Reciprocal',
         'content': refl,
         'audioMap': {'αὐτός': aud('k_autos'), 'ἀλλήλων': aud('k_allhlw')},
         '_tap_note': 'Hand cursors on autos and allelon (rail walk p11-p12).'},
        {'id': 'reflexiveParadigm', 'title': 'Reflexive Paradigm',
         'content': [reflexive_stack(tbk, conv)]}]
    return {'id': 'c11_learn_relatives', 'type': 'contentAudio',
            'mode': 'topicPages', 'title': 'Learn Relative Pronouns',
            'topics': topics, 'greekTaps': True}


def objectives(tbk, conv):
    raw = tbk.field(0x5e176).split('\r\n')
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
    items = [dash(sq(conv_mixed(conv, x))) for x in items[:7]]
    if len(items) != 7 or 'ἐκεῖνος' not in items[0]:
        raise SystemExit(f'STOP: expected 7 objectives, got {items}')
    return items


def bibliography(tbk):
    raw = tbk.field(0x516e0).split('\r\n')
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
        raise SystemExit(f'STOP: expected 4 bibliography entries')
    return {'id': 'c11_learn_bibliography', 'type': 'contentAudio',
            'mode': 'textPage', 'title': 'Learn Bibliography',
            'content': [{'type': 'biblist', 'items': entries}]}


# ---------------------------------------------------------- quick review
def qr_vocab(tbk, conv):
    raw = tbk.field(0x119102)
    for leg in ['a]pe<rxomai', 'u[pe<r', 'above, beyond (acc.)']:
        if leg not in raw:
            raise SystemExit(f'STOP: QR vocab chart field mismatch: {leg}')
    if not tbk.has_clip('k_vocl11'):
        raise SystemExit('STOP: k_vocl11 not in TBK')
    return {'id': 'c11_qr_vocab', 'type': 'contentAudio',
            'mode': 'reviewVocab', 'title': 'Review Vocabulary Chart',
            'pool': 'senses', 'columns': 2, 'showNtFreq': True,
            'footnote': ('The number after the translation is the number of '
                         'times the word occurs in the New Testament.'),
            'playAll': {'label': 'Say Whole List', 'audio': aud('k_vocl11')}}


def flatten(block):
    return [dict(c) for c in block['charts']]


def qr_paradigms(tbk, conv):
    that = split_paradigm(tbk, 'qrThat', 'ἐκεῖνος — that/those', EKEINOS,
                          'k_eke', 'k_ekepar')
    this = split_paradigm(tbk, 'qrThis', 'οὗτος — this/these', HOUTOS,
                          'k_out', 'k_outpar', note=HOUTOS_NOTE)
    hos = split_paradigm(tbk, 'qrHos', 'ὅς — who/which', HOS, 'k_os',
                         'k_ospar', note=HOS_NOTE)
    refl = reflexive_stack(tbk, conv)
    c9 = ('C9 (§4.6): every chart stacks, one say-all per chart, no '
          'toggles; a demonstrative\'s two halves share its one clip.')
    return [
        {'id': 'c11_qr_this_that', 'type': 'contentAudio',
         'mode': 'paradigmChart', 'title': 'Review This and That Paradigms',
         'paradigms': flatten(that) + flatten(this), '_disclosure': c9},
        {'id': 'c11_qr_relative', 'type': 'contentAudio',
         'mode': 'paradigmChart', 'title': 'Review Relative Pronoun Paradigm',
         'paradigms': flatten(hos), '_disclosure': c9},
        {'id': 'c11_qr_reflexive', 'type': 'contentAudio',
         'mode': 'paradigmChart',
         'title': 'Review Reflexive Pronouns Paradigms',
         'paradigms': flatten(refl), '_disclosure': c9}]


def qr_scriptures(ch10, learn_scr):
    out = []
    plan = [('c11_qr_scripture_jn11', 'c10_qr_scripture_jn11'),
            ('c11_qr_scripture_rom623a', 'c10_qr_scripture_rom623a'),
            ('c11_qr_scripture_rom623b', 'c10_qr_scripture_rom623b'),
            ('c11_qr_scripture_mat633a', 'c10_qr_scripture_mat633a')]
    by_id = {a['id']: a for a in ch10['quickReview']}
    for nid, oid in plan:
        src = by_id[oid]
        words = [{'greek': w['greek'], 'gloss': w['gloss'],
                  'audio': w['audio'].replace('chapt_10_', A)}
                 for w in src['words']]
        say = {'label': src['sayWhole']['label'],
               'audio': src['sayWhole']['audio'].replace('chapt_10_', A)}
        out.append({'id': nid, 'type': 'contentAudio',
                    'mode': 'interlinearVerse', 'title': src['title'],
                    'reference': src['reference'], 'words': words,
                    'sayWhole': say})
    out.append({'id': 'c11_qr_scripture_mat633b', 'type': 'contentAudio',
                'mode': 'interlinearVerse',
                'title': 'Review Scripture Memory:  Mat 6:33b',
                'reference': 'Mat 6:33b', 'words': learn_scr['words'],
                'sayWhole': learn_scr['sayWhole']})
    return out


# ----------------------------------------------------------------- lexicon
CHART_GLOSS = ['I go away', 'that', 'Jewish', 'as, just as', 'who, which',
               'when', 'this', 'back, again', 'Peter', 'for, about',
               'above, beyond']


def build_lexicon(tbk, conv):
    greek, gloss_drill, gloss_card = vocab_pools(tbk, conv)
    raw = tbk.field(0x119102)
    for g in CHART_GLOSS:
        if g not in raw:
            raise SystemExit(f'STOP: chart gloss {g!r} not in 0x119102')
    lemmas = {}
    for k, g, gs, gc, ch_gl, c, f in zip(VOC_KEYS, greek, gloss_drill,
                                         gloss_card, CHART_GLOSS, VOC_CLIPS,
                                         VOC_FREQ):
        m = re.match(r'^(.*?)\s*(\((gen|acc)\.\))?$', g)
        base, tag = m.group(1), m.group(2)
        first = re.sub(r',.*$', '', base)
        entry = {'greek': first, 'translit': k, 'lexicalForm': base,
                 'gloss': ch_gl, 'glossShort': gc, 'audio': aud(c),
                 'ntFreq': f,
                 'senses': [{'greek': first, 'caseTag': tag,
                             'glossShort': gs, 'audio': aud(c)}]}
        if k == 'houtos':
            entry['parts'] = [{'greek': 'οὗτος', 'audio': aud('k_voc7a')},
                              {'greek': 'αὕτη', 'audio': aud('k_voc7b')},
                              {'greek': 'τοῦτο', 'audio': aud('k_voc7c')}]
            entry['audioFull'] = aud('k_voc7')
            entry['_audio_note'] = ('k_voc7 recites all three forms '
                                    '(flashcard table 0x12856f); k_voc7a/b/c '
                                    'are the single forms (drill tables).')
        lemmas[k] = entry
    return {'_comment': (
        'Chapter 11 lexicon, assembled from 11_DEMON.TBK (cohort 5H). '
        'ELEVEN entries: huper is case-split into huper_gen ("for, about", '
        '150) and huper_acc ("above, beyond", no count printed) exactly as '
        'the Review Vocabulary Chart at 0x119102 prints them. gloss = the '
        'chart\'s printed gloss; glossShort = the flashcard pool (0xbb4c0); '
        'senses[].glossShort = the drill gloss pool (0x54db2).'),
        'lemmas': lemmas, 'exampleWords': {}}


# -------------------------------------------------------------------- main
def main():
    tbk_path, fontmap_path, ch5_path, ch10_path, wavlist_path, outdir = \
        sys.argv[1:7]
    outfile = os.path.join(outdir, 'chapt-11.json')
    if os.path.exists(outfile) and not os.environ.get('ALLOW_REGRESSIVE_REBUILD'):
        raise SystemExit('STOP: Stage 8.7 -- chapt-11.json exists; set '
                         'ALLOW_REGRESSIVE_REBUILD=1 after back-porting.')
    shipped = {l.strip().lower().rsplit('.', 1)[0]
               for l in open(wavlist_path) if l.strip()}
    tbk = Tbk(tbk_path)
    tbk.greek_fmts = underline.vote_greek_fmts(tbk.data, TEACH_OFFSETS)
    conv = make_conv11(json.load(open(fontmap_path, encoding='utf-8')))
    ch5 = json.load(open(ch5_path, encoding='utf-8'))
    ch10 = json.load(open(ch10_path, encoding='utf-8'))

    learn_scr = learn_scripture(tbk, conv)
    ch = {
        '_comment': (
            'Chapter 11 (Demonstrative and Relative Pronouns), assembled '
            'from 11_DEMON.TBK + CHAPT_11 audio + ch11railwalk.pdf under '
            'PIPELINE-INSIGHTS-v3 Stage 8 and DISCLOSURE-RULES. Behavior '
            'fields per DRILLBEHAVIORLEDGER.csv rows 96-106 (CONFIRMED '
            '2026-08-25).'),
        'id': 'chapt_11', 'number': 11,
        'title': 'Demonstrative and Relative Pronouns',
        'objectivesPreamble': 'You will be able to:',
        'objectives': objectives(tbk, conv),
        'vocab': VOC_KEYS,
        'learn': [], 'drill': [], 'exercise': [], 'quickReview': [],
        'feedback': ch10['feedback'],
        'sequence': [],
        '_menu_note': ('The TBK page name is "Relative/Reflexive Spelling '
                       'Exercise"; the page and the Exercise Menu both print '
                       '"Relative and Reflexive" -- the printed form is used.'),
        '_audioVerify': (
            'CHAPT_11 ships 245 WAVs. Listens: k_outmfn (the '
            'outos/aute/touto entry?), k_autos, k_allhlw, k_voc7/7a/7b/7c, '
            'k_voc10 vs k_voc11 (which huper sense), k_autpar/k_seapar/'
            'k_eaupar (which person). Unwired: k_agree1-4, k_under1-2 '
            '(VERIFY-5H (a)).')}

    hint_by_type = {'This': 'thisParadigm', 'That': 'thatParadigm'}
    G1 = {'Masculine': 'm', 'Feminine': 'f', 'Neuter': 'n'}
    C1 = {1: 'ns', 2: 'gs', 3: 'ds', 4: 'as', 6: 'np', 7: 'gp', 8: 'dp', 9: 'ap'}
    article_clip = {}
    for c in article_hint(tbk, ch5):
        for r in c['rows']:
            for cell in r['cells']:
                article_clip[nfc(cell['greek'])] = cell['audio'][len(A):]

    def derive_tt(prompt, typ, gender, case):
        return ('k_out' if typ == 'This' else 'k_eke') + G1[gender] + C1[case]

    def derive_wt(prompt, typ, gender, case):
        if typ == 'The':
            return article_clip[nfc(prompt)]
        return 'k_os' + G1[gender] + C1[case]
    tt = three_stage(tbk, conv, 'c11_drill_this_that', 'This and That Drill',
                     0x159a8, 30, 0xd5c00, 0xd7dc6, 0xd7dc6, 0xd8500,
                     'IA', {'I': 'This', 'A': 'That'}, hint_by_type,
                     'thisParadigm', derive_tt)
    wt = three_stage(tbk, conv, 'c11_drill_who_the', 'Who and The Drill',
                     0xc08a8, 30, 0xd9800, 0xdb640, 0xdb640, 0xdbd00,
                     'RD', {'R': 'Who/which', 'D': 'The'},
                     {'Who/which': 'relativeParadigm', 'The': 'articleParadigm'},
                     'relativeParadigm', derive_wt)
    ttd = translation(
        tbk, conv, 'c11_drill_translation_this_that',
        'This and That Translation Drill', 18, 0xc8092,
        (0xc9c92, 0xca49c, 0xcaa6c), 0xcaeea, 0x9ac01, 0x9b000, 'k_td',
        TT_ANSWERS, demonstrative_hint, 'thisParadigm',
        ['I say that you are Peter, and upon that rock',
         'I say that you are Peter, and upon this rock',
         'I say this, you are Peter, and upon the rock'],
        'λέγω ὅτι σὺ εἶ Πέτρος, καὶ ἐπὶ ταύτῃ τῇ πέτρᾳ',
        'Answers are the BLUE (correct) options on the answered screens in '
        'ch11railwalk.pdf p6-p10, all 18 items captured; each asserted to '
        'exist among the item\'s three option-column entries. Hint is '
        'form-dependent (Hinteke/Hintout on the page object list at 0x3c0f).',
        off_g2=0xcb2ac)
    rtd = translation(
        tbk, conv, 'c11_drill_translation_relative',
        'Relative Pronoun Translation Drill', 9, 0x107e64,
        (0x109b06, 0x10a310, 0x10a8e0), 0x10ad5e, 0x9ca39, 0x9cd00, 'k_trd',
        TR_ANSWERS, lambda g: None, 'relativeParadigm',
        ['and that which you hear in the ear',
         'and that which we hear in the ear',
         'and that which they hear in the ear'],
        'καὶ ὅ εἰς τὸ οὖς ἀκούετε',
        'Answers are the BLUE options on ch11railwalk.pdf p14-p17 (all 9 '
        'items captured). Single hint: the os chart (one Hint on the page '
        'object list at 0x6547e).')

    gk, en = vocab_drills(tbk, conv)
    ch['learn'] = [
        {'id': 'c11_learn_objectives', 'type': 'contentAudio',
         'mode': 'objectivesPage', 'title': 'Learn Chapter Objectives',
         'instructions': ''},
        english_concepts(tbk, conv), demonstratives(tbk, conv),
        relatives(tbk, conv),
        {'id': 'c11_learn_vocab', 'type': 'contentAudio', 'mode': 'flashcard',
         'title': 'Learn Vocabulary', 'pool': 'senses'},
        learn_scr, bibliography(tbk)]
    ch['drill'] = [tt, wt, ttd, rtd, gk, en, scripture_drill(tbk, conv)]
    ch['exercise'] = [this_that_speller(tbk, conv), relative_speller(tbk, conv),
                      vocab_speller(tbk, conv), scripture_speller(tbk, conv)]
    ch['quickReview'] = ([qr_vocab(tbk, conv)] + qr_paradigms(tbk, conv)
                         + qr_scriptures(ch10, learn_scr))
    ch['sequence'] = [
        'c11_learn_objectives', 'c11_learn_english_concepts',
        'c11_learn_demonstratives', 'c11_drill_this_that',
        'c11_drill_translation_this_that', 'c11_ex_speller_this_that',
        'c11_learn_relatives', 'c11_drill_who_the',
        'c11_drill_translation_relative', 'c11_ex_speller_relative',
        'c11_learn_vocab', 'c11_drill_vocab_gk_en', 'c11_drill_vocab_en_gk',
        'c11_ex_vocab_speller', 'c11_learn_scripture',
        'c11_drill_scripture_memory', 'c11_ex_scripture_speller',
        'c11_qr_vocab', 'c11_qr_this_that', 'c11_qr_relative',
        'c11_qr_reflexive', 'c11_qr_scripture_jn11',
        'c11_qr_scripture_rom623a', 'c11_qr_scripture_rom623b',
        'c11_qr_scripture_mat633a', 'c11_qr_scripture_mat633b',
        'c11_learn_bibliography']
    ch['_sequence_note'] = 'Rail order from ch11railwalk.pdf (Nathanael, 2026-08-25).'

    # hint composites: each a two-chart bundle -> §4.1 toggle in the modal,
    # titles differing in exactly one word (Singular/Plural) so the toggle
    # labels derive (paradigmToggleLabels)
    def hint_pair(pid, title, forms, prefix, note=None):
        blk = split_paradigm(tbk, pid, title, forms, prefix, None, note=note,
                             hint_titles=True)
        return {'charts': flatten(blk)}
    ch['hintCharts'] = {
        'thisParadigm': hint_pair('hintThis', 'οὗτος — this/these', HOUTOS,
                                  'k_out', HOUTOS_NOTE),
        'thatParadigm': hint_pair('hintThat', 'ἐκεῖνος — that/those', EKEINOS,
                                  'k_eke'),
        'relativeParadigm': hint_pair('hintHos', 'ὅς — who/which', HOS, 'k_os',
                                      HOS_NOTE),
        'articleParadigm': {'charts': article_hint(tbk, ch5)}}
    ch['_hint_note'] = ('Every hint is a Singular/Plural two-state toggle with NO '
                  'say-all (the original hints carry Cancel only), centred '
                  'per §4.5. Charts are transcribed from the hint fields '
                  '(0x1845a outos, 0xc1660 article with Nom./Gen./Dat./Acc. '
                  'labels and underlined Singular/Plural headers, 0x2bfb2/'
                  '0xc329a os). FORM-DEPENDENT per item (D-46).')
    # 8.4
    for a in ch['drill']:
        for hr in {a.get('ui', {}).get('hintRef')} | \
                {i.get('hintRef') for i in a.get('items', [])}:
            if hr and hr not in ch['hintCharts']:
                raise SystemExit(f'STOP: dangling hintRef {hr}')

    ids = set()

    def collect(o):
        if isinstance(o, dict):
            for k, v in o.items():
                if k in ('audio', 'audioFull') and isinstance(v, str):
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
            raise SystemExit(f'STOP: emitted clip {cid} not in CHAPT_11 pack')
        if not tbk.has_clip(base) and not re.match(r'[fhij]_', base):
            raise SystemExit(f'STOP: emitted clip {cid} not referenced in TBK')
    errs = audit(ch)
    if errs:
        raise SystemExit('STOP: self-audit failed:\n' + '\n'.join(errs))
    ch = post_patches(ch)
    lex = post_patches_lexicon(build_lexicon(tbk, conv))
    os.makedirs(outdir, exist_ok=True)
    with open(outfile, 'w', encoding='utf-8') as f:
        json.dump(ch, f, ensure_ascii=False, indent=1)
    with open(os.path.join(outdir, 'lexicon-chapt11.json'), 'w',
              encoding='utf-8') as f:
        json.dump(lex, f, ensure_ascii=False, indent=1)
    print(f'chapter 11: {len(ids)} distinct clips, '
          f'{len(ch["sequence"])} rail pages. OK.')


def post_patches(doc):
    """Stage 8.7: re-applies every ratified divergence so a regeneration
    cannot regress a hand-approved fix. D-52..D-54, D-56, the (p) say-all
    ruling, the (o) objectives contract and the _verify banner fix
    (2026-08-26/27). Update THIS function when a new ruling lands."""
    import json as _json
    sp = [a for a in doc['exercise'] if a['id'] == 'c11_ex_scripture_speller'][0]
    assert 'Repeat This Exercise' not in sp['ui']['checkboxes']
    # banner fix + D-52: topic-level _verify draws a learner-facing banner
    intro = doc['learn'][3]['topics'][0]
    intro.pop('_verify', None)
    intro['_verify_note'] = ('D-52 RESTORE (VERIFY-5H (a)): the original\'s '
                             'Introduction radio shows the Reflexive/Reciprocal '
                             'box; this is the TBK\'s own unshown Relative '
                             'Pronouns text (0x4136e + 0x420fc).')
    # D-53: examples modal -- one line for Jn 13:35, acute on toutou
    rows = doc['learn'][2]['popups'][0]['content'][0]['rows']
    if rows[2].get('greek2'):
        rows[2]['greek'] += ' ' + rows[2].pop('greek2')
        rows[2]['_note'] = ('Line merged per VERIFY-5H-RESPONSE item 1 (the '
                            'original wrapped for width only).')
    rows[1]['greek'] = rows[1]['greek'].replace('\u03c4\u03bf\u1f7a\u03c4\u03bf\u03c5', 'τούτου')
    rows[1].pop('_verify', None)
    rows[1]['_note'] = 'D-53: grave on toutou corrected to acute (VERIFY-5H (m)).'
    # D-53: breathing on ekeinoi (translation item 13)
    it = doc['drill'][2]['items'][12]
    it['greek'] = it['greek'].replace('\u03b5\u03ba\u03b5\u1fd6\u03bd\u03bf\u03af', 'ἐκεῖνοί')
    it.pop('_verify', None)
    it['_note'] = 'D-53: smooth breathing restored on ekeinoi (VERIFY-5H (m)).'
    # D-56: k_osnap RECORDS ous; every neuter-a cell plays k_osnns instead
    s = _json.dumps(doc, ensure_ascii=False).replace('chapt_11_k_osnap',
                                                     'chapt_11_k_osnns')
    doc = _json.loads(s)
    sp2 = [a for a in doc['exercise'] if a['id'] == 'c11_ex_speller_relative'][0]
    i24 = sp2['items'][23]
    if i24['prompt'].startswith('whom (masc. nom. pl.)'):
        i24['prompt'] = 'who (masc. nom. pl.)'
        i24['_note'] = 'D-54: "whom" corrected to "who" (VERIFY-5H (h)).'
    i14 = sp2['items'][13]
    assert i14['answer'] == 'οὕς'
    i14['audio'] = 'chapt_11_k_osnap'
    i14.pop('_audio_note', None)
    i14['_audio_note'] = ('Mirrors the original dispatch k_osnap, which RECORDS '
                          'ous (VERIFY-5H (q)); wired nowhere else.')
    # (o) objectives contract
    if isinstance(doc['objectives'][0], str):
        doc['objectives'][0] = {
            'text': doc['objectives'][0],
            'audioMap': {'ἐκεῖνος': 'chapt_11_k_ekemns',
                         'οὗτος': 'chapt_11_k_outmns'},
            '_source': ('Objectives page WordSelection table, 11_DEMON.TBK '
                        '0x5e176 region (VERIFY-5H (o): both speak in the '
                        'original).')}
    # (p) one say-all per recording on Quick Review pages
    for a in doc['quickReview']:
        if a.get('mode') != 'paradigmChart':
            continue
        ps = a['paradigms']
        for i in range(len(ps) - 1):
            if (ps[i].get('subtitle', '').startswith('Singular')
                    and ps[i + 1].get('subtitle', '').startswith('Plural')
                    and ps[i].get('sayWhole', {}).get('audio')
                    == ps[i + 1].get('sayWhole', {}).get('audio')):
                ps[i].pop('sayWhole')
                ps[i]['_say_note'] = ('One recording covers both halves; the '
                                      'button sits after the Plural half '
                                      '(VERIFY-5H (p) ruling; NIT-LOG N-1).')
        a['_disclosure'] = (a.get('_disclosure', '')
                            + ' Say-all: one button per recording, placed '
                              'after the Plural half (2026-08-26 ruling).')
    return doc


def post_patches_lexicon(lex):
    """Ratified vocabulary-audio rulings (VERIFY-5H-RESPONSE 6/7,
    VERIFY-5H-2 (r)/(v))."""
    h = lex['lemmas']['houtos']
    h['audio'] = 'chapt_11_k_voc7'
    h['_audio_note'] = ('k_voc7 recites all three forms: flashcard and Review '
                        'chart row lemma clip (VERIFY-5H-RESPONSE 6).')
    h['_parts_note'] = ('VERIFY-5H-2 (v) ruling: the chart row taps '
                        'k_voc7a/b/c per form; the flashcard plays k_voc7.')
    o = lex['lemmas']['hos']
    o.pop('parts', None)
    o['_audio_note'] = ('VERIFY-5H-2 (r) ruling: k_voc5 says only os and is '
                        'SUPPOSED to; the RESPONSE-7 parts ask was struck '
                        'through. Row and card both play k_voc5; no parts.')
    return lex


if __name__ == '__main__':
    main()
