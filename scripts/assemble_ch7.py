#!/usr/bin/env python3
"""assemble_ch7.py -- chapter 7 data assembly (cohort 5F, pipeline-side).

Same contract as assemble_ch6.py: fields are read from 7_ADJS.TBK BY
OFFSET (5F-EXTRACTION-MAP.md sec 2), converted through font-map.json,
and every drill answer is DERIVED from the chapter's own paradigm
charts and cross-checked against the extracted option columns.

Chapter 7 hands the pipeline one genuinely new lever: the Adjective
Case Drill and the Adjective Spelling Exercise are the SAME twenty
items in the same order -- the drill shows the Greek form and asks for
the parse, the exercise shows the parse and asks for the Greek form.
So each activity IS the other's answer key, and the assembly asserts
the two pools agree on all twenty Scripture references before using
either. Nothing is guessed.

Nothing here is authored. If a field cannot be located, or a derived
answer disagrees with the chapter's own chart, the assembly STOPS
(PIPELINE-INSIGHTS Stage 7).

Usage:  python3 assemble_ch7.py 7_ADJS.TBK font-map.json outdir
"""
# --------------------------------------------------------------------
# FROZEN AT 5F CLOSE -- PIPELINE-INSIGHTS-v3 Stage 8.7.
#
# The committed chapt-07.json carries THREE rounds of device-verified
# hand repair (5F-SPEC1-PATCH1/2/3: paragraph restructures, chart
# emissions, audio re-keys, popup re-keys) that this script does NOT
# reproduce. Re-running it would silently regress the approved state.
# The committed JSON is the source of truth; this script is provenance
# only -- it documents how the FIRST cut was derived.
# --------------------------------------------------------------------
import os as _os
if _os.environ.get('ALLOW_REGRESSIVE_REBUILD') != '1':
    raise SystemExit(
        'REFUSING TO RUN: assemble_ch7.py is provenance only '
        '(Stage 8.7). The committed chapt-07.json carries PATCH1-3 '
        'hand repairs this script does not reproduce. Set '
        'ALLOW_REGRESSIVE_REBUILD=1 only after back-porting every patch '
        'change, and diff the output against the committed file before '
        'trusting it.')

import json
import re
import struct
import sys
import unicodedata

import underline

A = 'chapt_7_'

# ELISION (DRILL-BEHAVIOR-RULES C9 / D-29): a ']' standing alone
# between spaces is an apostrophe bound to the preceding word, not a
# breathing. See assemble_ch6.py for the full note.
ELISION = re.compile(r"(\S)[ \t]+\](?=[ \t]|$)")


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


# A legacy-Greek token: a letter carrying a diacritic code, a breathing
# code before a letter, or a breathing code AFTER a letter (o[ = ho,
# h[ = he). The leading class is ] and [ ONLY -- a double quote or an
# apostrophe before a letter is English punctuation ("is"), not a
# breathing, and treating it as Greek turned "is" into a Greek word.
GREEK_TOKEN = re.compile(
    r"[a-zA-Z][<>?@#%^&$!]|[\]\[][a-zA-Z]|[a-zA-Z][\]\[]")


def conv_mixed(conv, text):
    """Convert the Greek on a mixed Greek/English line.

    Prefers the RUN-TABLE marking (\x04...\x05) laid down by
    Tbk.prose(), which is authoritative. The token heuristic below is a
    fallback only: it cannot see accentless Greek, and it MIS-fires on
    English words that happen to contain a letter+punctuation pair
    ("Elijah?" became a Greek word before the run table was wired in).
    """
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

    def prose(self, off):
        """A teaching field WITH its underline runs marked.

        Underlining is DATA, not a rendering decision: the run table
        beside each field says which words the original underlines, and
        the port must not be left to guess from a screenshot. Falls
        back to the plain field only if no run table indexes it, and
        says so rather than failing silently."""
        m = underline.marked_greek(self.data, off, self.greek_fmts)
        if m is None:
            self.no_runs.append(off)
            return self.field(off)
        return m

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
        raw = self.region(off).split('\r\n')
        lines = [l.strip() for l in raw]
        if not allow_blank:
            lines = [l for l in lines if l]
        if len(lines) < n:
            raise SystemExit(
                f'STOP: pool {label} at {off:#x}: expected {n}, '
                f'got {len(lines)}')
        return lines[:n]

    def has_clip(self, name):
        return ('%s.wav' % name).encode() in self.data.lower()


def dash(s):
    return s.replace('--', '\u2014')


def sq(s):
    return re.sub(r'[ \t]{2,}', ' ', s).strip()


def paras(text, drop=1):
    lines = [l for l in text.split('\r\n') if l.strip()][drop:]
    return [dash(sq(l)) for l in lines]


# --------------------------------------------------------------------
# Offsets (5F-EXTRACTION-MAP.md sec 2)
# --------------------------------------------------------------------

OFF = {
    'objectives': 0x0f34ae,
    'biblio': 0x0233ba,
    'review_vocab': 0x0ea40e,
    'review_vocab_note': 0x0ec880,
    'ec_definition': 0x02f9d8,
    'ec_uses': 0x02ff48,
    'ec_examples': 0x0302be,
    'ga_intro': 0x0155ee,
    'ga_par_sg': 0x015ce6,
    'ga_par_pl': 0x01a4aa,
    'ga_par2_sg': 0x0171b2,
    'ga_par2_pl': 0x01ba78,
    'ga_attributive': 0x01852e,
    'ga_predicate': 0x01d1d6,
    'ga_substantive': 0x019348,
    'ga_pred_or_attr': 0x01cd68,
    'ga_hint_aga': 0x057410,
    'ga_hint_dik': 0x059bae,
    'ga_hint_positions': 0x0a6cdc,
    'eimi_intro': 0x0d0890,
    'eimi_present': 0x0d1082,
    'eimi_examples': 0x0d1a90,
    'eimi_ou': 0x0d60c0,
    'eimi_hint': 0x0ad2cc,
    'pop_ou': 0x0d6d1e,
    'pop_ouk': 0x0d7468,
    'pop_oux': 0x0d7b84,
    'voc_lexical': 0x026930,
    'voc_gloss': 0x026cec,
    'voc_bare': 0x0be544,
    'voc_short': 0x091ff0,
    'voc_spell_prompts': 0x07cacc,
    'case_prompts': 0x055960,
    'case_refs': 0x056d54,
    'adj_spell_prompts': 0x066742,
    'adj_spell_refs': 0x067e26,
    'atd_prompt1': 0x0a15dc,
    'atd_prompt2': 0x0a4592,
    'atd_opt1': 0x0a323e,
    'atd_opt2': 0x0a3968,
    'atd_opt3': 0x0a3e38,
    'atd_refs': 0x0a41d8,
    'parse_prompts': 0x0ac0b8,
    'parse_refs': 0x0ad01a,
    'etd_prompt1': 0x094214,
    'etd_prompt2': 0x0971ca,
    'etd_opt1': 0x095e76,
    'etd_opt2': 0x0965a0,
    'etd_opt3': 0x096a70,
    'etd_refs': 0x096e10,
    'eimi_spell_prompts': 0x0990fe,
    'eimi_spell_refs': 0x09a7e4,
    'sm_drill_prompts': 0x05e03e,
    'learn_sm': 0x0e28ba,
    'review_sm_jn11': 0x03f2e6,
    'review_sm_146a': 0x04b744,
    'review_sm_146b': 0x031918,
    'review_sm_rom': 0x000d24,
    'sm_spell_verse': 0x08a15c,
}

VOC_ORDER = ['agathos', 'hagios', 'dikaios', 'eimi', 'ioudaios', 'megas',
             'nekros', 'ou', 'protos', 'phone']

# --------------------------------------------------------------------
# Answer keys, DERIVED and cross-checked (see the notes in each builder)
# --------------------------------------------------------------------

# Adjective Translation Drill (15 items). DERIVED from the prompt's own
# adjective position and agreement, then CONFIRMED against Nathanael's
# DOSBox pass (Ch7AdjectiveTranslationDrill.pdf, 2026-08-08), which
# answered all fifteen. Fourteen of fifteen derivations were right;
# item 4 (Rom 13:3) was wrong -- "they are not fearful to good work",
# not "...to good deeds" -- and is corrected here. This is now a
# verified key, not a derivation.
ATD_ANSWER = [3, 1, 3, 2, 2, 3, 1, 3, 2, 3, 1, 1, 1, 2, 3]

# "Eimi" Translation Drill (14 items): the option column whose PERSON
# and NUMBER match the eimi form in the prompt, read off the chapter's
# own Present Indicative chart. Every one of the fourteen separates on
# that alone -- the three options differ only in person.
ETD_ANSWER = [2, 1, 2, 1, 3, 1, 3, 2, 2, 1, 3, 2, 3, 1]

# "eimi" paradigm, from OFF['eimi_present'] / OFF['eimi_hint'].
EIMI = [
    ('1s', 'First Person Singular', 'ei]mi<', 'I am'),
    ('2s', 'Second Person Singular', 'ei#', 'you are'),
    ('3s', 'Third Person Singular', 'e]sti<(n)', 'he/she/it is'),
    ('1p', 'First Person Plural', 'e]sme<n', 'we are'),
    ('2p', 'Second Person Plural', 'e]ste<', 'you are'),
    ('3p', 'Third Person Plural', 'ei]si<(n)', 'they are'),
]
PARSE_OPTIONS = [p[1] for p in EIMI]

CASE_WORD = {'nom': 'Nominative', 'gen': 'Genitive', 'dat': 'Dative',
             'acc': 'Accusative', 'voc': 'Vocative'}
NUM_WORD = {'sg': 'Singular', 'pl': 'Plural'}
CASE_LETTER = {'nom': 'n', 'gen': 'g', 'dat': 'd', 'acc': 'a', 'voc': 'v'}
GENDER_LETTER = {'masc': 'm', 'fem': 'f', 'neut': 'n'}
NUM_LETTER = {'sg': 's', 'pl': 'p'}
STEM_OF = {'good': 'aga', 'righteous': 'dik'}


# --------------------------------------------------------------------
# The twenty-item adjective pool: one pool, two activities
# --------------------------------------------------------------------

PARSE_RE = re.compile(
    r'^(good|righteous)\s*\(\s*(nom|gen|dat|acc|voc)\.?\s+'
    r'(?:(sg|pl)\.?\s+(masc|fem|neut)|(masc|fem|neut)\.?\s+(sg|pl))\.?\s*\)')


def cut_ref(raw):
    m = re.match(r'\s*(\d?\s?[A-Za-z]+\.?\s+\d+:\d+)', raw)
    if not m:
        raise SystemExit('STOP: reference %r does not parse' % raw)
    return re.sub(r'\s+', ' ', m.group(1)).strip()


def adjective_pool(tbk, conv):
    """The Adjective Case Drill and the Adjective Spelling Exercise are
    the same twenty items in the same order. Each is the other's key."""
    forms = fp(tbk, OFF['case_prompts'], 20, 'adjective forms')
    frefs = fp(tbk, OFF['case_refs'], 20, 'case drill refs')
    parses = fp(tbk, OFF['adj_spell_prompts'], 20, 'adjective parses')
    prefs = fp(tbk, OFF['adj_spell_refs'], 20, 'speller refs')

    def norm(r):
        # The 20th line of each reference column runs on into the buffer's
        # stale tail; a reference is book + chapter:verse and stops there.
        m = re.match(r'\s*(\d?\s?[A-Za-z]+\.?\s+\d+:\d+)', r)
        if not m:
            raise SystemExit('STOP: reference %r does not parse' % r)
        return (re.sub(r'[.\s]+', ' ', m.group(1))
                .replace('Luk ', 'Lk ').strip())

    items = []
    for i in range(20):
        if norm(frefs[i]) != norm(prefs[i]):
            raise SystemExit(
                'STOP: item %d: the case drill cites %r and the speller '
                'cites %r; the two pools are not parallel'
                % (i + 1, frefs[i], prefs[i]))
        m = PARSE_RE.match(parses[i].strip())
        if not m:
            raise SystemExit('STOP: parse label %r does not parse'
                             % parses[i])
        lemma, case = m.group(1), m.group(2)
        num = m.group(3) or m.group(6)
        gender = m.group(4) or m.group(5)
        clip = 'g_%s%s%s%s' % (STEM_OF[lemma], CASE_LETTER[case],
                               GENDER_LETTER[gender], NUM_LETTER[num])
        if not tbk.has_clip(clip):
            raise SystemExit('STOP: item %d derives clip %s, which the TBK '
                             'never dispatches' % (i + 1, clip))
        items.append({
            'greek': conv(forms[i]),
            'parse': sq(parses[i]),
            'caseNumber': '%s %s' % (CASE_WORD[case], NUM_WORD[num]),
            'drillRef': cut_ref(frefs[i]),
            'spellRef': cut_ref(prefs[i]),
            'audio': aud(clip),
        })
    return items


def case_drill(tbk, conv):
    pool = adjective_pool(tbk, conv)
    return {
        'id': 'c7_drill_case', 'type': 'select', 'mode': 'fullOptionGrid',
        'title': 'Adjective Case Drill',
        'instructions': 'Click on the matching case and number',
        'promptIsGreek': True, 'options': 'static',
        'optionValues': ['Nominative Singular', 'Nominative Plural',
                         'Genitive Singular', 'Genitive Plural',
                         'Dative Singular', 'Dative Plural',
                         'Accusative Singular', 'Accusative Plural',
                         'Vocative Singular', 'Vocative Plural'],
        'optionLayout': 'paradigm2col', '_layout_note': 'D-26.',
        'items': [{'greek': p['greek'], 'ref': p['drillRef'],
                   'answer': p['caseNumber'], 'audio': p['audio']}
                  for p in pool],
        'scored': True,
        'ui': stepper_ui(hint='adjectiveParadigm'),
        '_answer_note': ('Derived from the Adjective Spelling Exercise, '
                         'which is the same twenty items in the same order '
                         'with the parse spelled out; the two pools are '
                         'asserted to cite the same twenty references.'),
    }


def adj_speller(tbk, conv):
    pool = adjective_pool(tbk, conv)
    m = re.match(r'^(good|righteous)\s*\(', pool[0]['parse'])
    items = []
    for p in pool:
        gloss = p['parse'].split('(')[0].strip()
        tag = '(' + p['parse'].split('(', 1)[1]
        items.append({'prompt': gloss, 'note': sq(tag), 'ref': p['spellRef'],
                      'answer': p['greek'], 'audio': p['audio']})
    ui = dict(SPELL_UI)
    ui['fields'] = ['English Translation', 'Spell Greek Phrase']
    return {'id': 'c7_ex_speller', 'type': 'spell',
            'title': 'Adjective Spelling Exercise',
            'instructions': 'Click letters below or use your keyboard to '
                            'spell it out.',
            'prompt': 'item', 'promptLabel': 'English Translation',
            'accentsOptional': True, 'spellerTilesRef': 'chapt_1',
            'items': items, 'ui': ui}


SCORED_UI = {'buttons': ['Pronounce', 'Score'],
             'checkboxes': ['Pronounce Each Drill'],
             'defaults': {'pronounceEach': True}, 'liveScore': True}

SPELL_UI = {'fields': ['English Meaning', 'Spell Greek Word'],
            'buttons': ['Pronounce', 'Previous', 'Score', 'Next',
                        'Check Answer', 'Greek Keyboard'],
            'checkboxes': ['Show Answer', 'With Accents',
                           'Pronounce Each Exercise'],
            'defaults': {'pronounceEach': True}}


def stepper_ui(hint=None):
    ui = {'buttons': ['Previous', 'Next', 'Pronounce', 'Hint', 'Score'],
          'checkboxes': ['Pronounce Each Drill'],
          'defaults': {'pronounceEach': True}, 'liveScore': True}
    if hint:
        ui['hintRef'] = hint
    return ui


# --------------------------------------------------------------------
# Two-line translation drills
# --------------------------------------------------------------------

def fp(tbk, off, n, label):
    """Read a pool BY LENGTH PREFIX. The prefix is the only read that
    cuts the last entry correctly -- every one of these buffers carries
    a stale tail from an earlier chapter. Some buffers open with a
    blank line before item 1 and some do not; both are accepted, and a
    short pool is a hard failure (never padded)."""
    lines = [l.strip() for l in tbk.field(off).split('\r\n')]
    if lines and not lines[0]:
        lines = lines[1:]
    if len(lines) < n:
        raise SystemExit('STOP: pool %s at %#x: expected %d, got %d'
                         % (label, off, n, len(lines)))
    return lines[:n]


def fpool(tbk, off, n, label):
    lines = [l.strip() for l in tbk.field(off).split('\r\n')]
    if lines[0]:
        raise SystemExit('STOP: pool %s at %#x: expected a leading blank '
                         'line, got %r' % (label, off, lines[0]))
    lines = lines[1:]
    if len(lines) < n:
        raise SystemExit('STOP: pool %s at %#x: expected %d, got %d'
                         % (label, off, n, len(lines)))
    return lines[:n]


def translation_drill(tbk, conv, aid, title, n, keys, answers, clip,
                      hint=None):
    # All six columns are read BY LENGTH PREFIX, not by printable
    # region: these buffers carry a long chapter-6 tail, and the prefix
    # is the only thing that cuts the last item correctly. Every one
    # opens with a single blank line before item 1.
    def col(key, label):
        return fpool(tbk, OFF[key], n, '%s %s' % (aid, label))
    p1 = col(keys[0], 'prompt line 1')
    p2 = col(keys[1], 'prompt line 2')
    cols = [col(keys[2 + k], 'options %d' % (k + 1)) for k in range(3)]
    refs = col(keys[5], 'refs')
    items = []
    for i in range(n):
        opts = [sq(c[i]) for c in cols]
        if len(set(opts)) != 3:
            raise SystemExit('STOP: %s item %d has duplicate options'
                             % (aid, i + 1))
        greek = sq(conv(p1[i]))
        second = sq(conv(p2[i]))
        items.append({'greek': greek, 'greek2': second or None,
                      'ref': cut_ref(refs[i]), 'options': opts,
                      'answer': opts[answers[i] - 1],
                      'audio': aud('%s%d' % (clip, i + 1))})
    a = {'id': aid, 'type': 'select', 'mode': 'fullOptionGrid',
         'title': title,
         'instructions': 'Click on the correct English translation',
         'promptIsGreek': True, 'options': 'perItem',
         'optionLayout': 'stack1col', 'items': items, 'scored': True,
         'ui': stepper_ui(hint=hint)}
    return a


def parsing_drill(tbk, conv):
    prompts = fp(tbk, OFF['parse_prompts'], 6, 'parsing prompts')
    refs = fp(tbk, OFF['parse_refs'], 6, 'parsing refs')
    def key(w):
        # The drill's own prompt column accents these forms differently
        # from the paradigm chart (estin vs esti(n), eimi vs eimi) and the
        # moveable nu may or may not be printed. Compare on the bare
        # letters, which is exactly what the chapter teaches is the same
        # form (Present Indicative page, note 2).
        w = unicodedata.normalize('NFD', w)
        w = ''.join(c for c in w if not unicodedata.combining(c))
        return w.replace('(', '').replace(')', '').rstrip('\u03bd').lower()

    by_form = {}
    for code, label, legacy, _ in EIMI:
        by_form.setdefault(key(conv(legacy)), (code, label))
    items = []
    for i, p in enumerate(prompts):
        g = conv(p.strip())
        hit = [v for k, v in by_form.items() if k == key(g)]
        if len(hit) != 1:
            raise SystemExit('STOP: parsing prompt %r matches %d paradigm '
                             'forms' % (g, len(hit)))
        code, label = hit[0]
        items.append({'greek': g, 'ref': cut_ref(refs[i]), 'answer': label,
                      'audio': aud('g_eimi%s' % code)})
    return {'id': 'c7_drill_parsing_eimi', 'type': 'select',
            'mode': 'fullOptionGrid', 'title': 'Parsing \u03b5\u1f30\u03bc\u03af Drill',
            'instructions': 'Click on the matching case',
            'promptIsGreek': True, 'options': 'static',
            'optionValues': ['First Person Singular', 'First Person Plural',
                             'Second Person Singular', 'Second Person Plural',
                             'Third Person Singular', 'Third Person Plural'],
            'optionLayout': 'paradigm2col', '_layout_note': 'D-26.',
            'items': items, 'scored': True,
            'ui': stepper_ui(hint='eimiParadigm'),
            '_answer_note': ("Derived from the chapter's own Present "
                             'Indicative chart; each prompt matches exactly '
                             'one paradigm cell, moveable nu allowed.')}


def eimi_speller(tbk, conv):
    prompts = fp(tbk, OFF['eimi_spell_prompts'], 6, 'eimi speller prompts')
    refs = fp(tbk, OFF['eimi_spell_refs'], 6, 'eimi speller refs')
    form_of = {code: conv(legacy) for code, _, legacy, _ in EIMI}
    label_of = {code: label for code, label, _, _ in EIMI}
    alias = {'he is': 'he/she/it is', 'you (sg) are': 'you are',
             'you (pl) are': 'you are'}
    # Person/number disambiguation for the two English glosses the
    # paradigm prints twice ("you are"), taken from the prompt's own
    # (sg)/(pl) tag.
    forced = {'you (sg) are': '2s', 'you (pl) are': '2p'}

    def resolve(text):
        want = alias.get(text, text)
        if text in forced:
            c = forced[text]
            return [(c, form_of[c], label_of[c])]
        return [(c, form_of[c], label_of[c]) for c, _, _, gl in EIMI
                if gl == want]

    items = []
    for i, p in enumerate(prompts):
        # The prompt buffer can carry a stray fragment of the stale tail
        # with no separating run of spaces ("you (sg) are m"). Read the
        # whole line, then shorten from the right until it names exactly
        # one paradigm cell -- the prefix gives the read, the match gives
        # the cut. STOP if nothing matches.
        toks = p.strip().split()
        cands, g = [], None
        for cut in range(len(toks), 0, -1):
            g = ' '.join(toks[:cut])
            cands = resolve(g)
            if len(cands) == 1:
                break
        if len(cands) != 1:
            raise SystemExit('STOP: eimi speller prompt %r matches no '
                             'paradigm cell at any prefix' % p.strip())
        code, form, label = cands[0]
        items.append({'prompt': g, 'ref': cut_ref(refs[i]),
                      'answer': form.replace('(', '').replace(')', ''),
                      'answerAlt': form,
                      'audio': aud('g_eimi%s' % code)})
    ui = dict(SPELL_UI)
    ui['fields'] = ['English Translation', 'Spell Greek Phrase']
    return {'id': 'c7_ex_speller_eimi', 'type': 'spell',
            'title': '\u03b5\u1f30\u03bc\u03af Spelling Exercise',
            'instructions': 'Click letters below or use your keyboard to '
                            'spell it out.',
            'prompt': 'item', 'promptLabel': 'English Translation',
            'accentsOptional': True, 'spellerTilesRef': 'chapt_1',
            'items': items, 'ui': ui,
            '_moveable_nu_note': ('The third singular and plural may take a '
                                 'moveable nu, which the chapter teaches on '
                                 'the Present Indicative page; `answerAlt` '
                                 'carries the printed (n) form.')}


# --------------------------------------------------------------------
# Learn pages, review pages, vocabulary
# --------------------------------------------------------------------

# Chapter 7's verse pages gloss MORE than chapters 5 and 6 did: ton is
# glossed "the" on both Jn 1:1 pages and ho is glossed "the" on Jn 14:6a,
# where the earlier chapters left them blank. Only Jn 14:6b still has a
# gap. Per-chapter extraction is why this is caught rather than inherited.
GAPS = {
    (0x031918, 1): {3},   # Review Jn 14:6b -- me
}


def interlinear(f, conv, off, reference, prefix, whole, n_words, repeats=None):
    raw = f(off)
    lines = [l for l in raw.split('\r\n') if l.strip()]
    lines = [l for l in lines if not re.fullmatch(r'\s*\([^()]*\)\s*', l)]
    words = []
    for pair, i in enumerate(range(0, len(lines) - 1, 2)):
        gk = ELISION.sub("\\1'", lines[i]).split()
        en_line = re.sub(r'\s*\([^()]*\)\s*$', '', lines[i + 1])
        en = [e.strip() for e in re.split(r'\s{2,}', en_line.strip())
              if e.strip()]
        gaps = GAPS.get((off, pair), set())
        if len(en) + len(gaps) != len(gk):
            raise SystemExit(
                'STOP: %s line %d: %d Greek words, %d glosses, %d declared '
                'gaps' % (reference, pair, len(gk), len(en), len(gaps)))
        k = 0
        for j, w in enumerate(gk):
            if j in gaps:
                words.append({'greek': conv(w), 'gloss': None})
            else:
                words.append({'greek': conv(w), 'gloss': en[k]})
                k += 1
    if len(words) != n_words:
        raise SystemExit('STOP: %s: expected %d words, got %d'
                         % (reference, n_words, len(words)))
    for k, w in enumerate(words):
        idx = (repeats or {}).get(k + 1, k + 1)
        w['audio'] = aud('%s%d' % (prefix, idx))
    return {'reference': reference, 'words': words,
            'sayWhole': {'label': 'Say Whole Verse', 'audio': aud(whole)}}


# Jn 1:1 in full is seventeen words over thirteen distinct clips: the
# repeats reuse the clip of their first occurrence, which is how the
# original wires them and how chapters 5 and 6 wired their own repeats.
JN11_REPEATS = {13: 6, 14: 13, 15: 3, 16: 4, 17: 5}


def learn_pages(tbk, conv):
    f = tbk.field
    ec = [
        ('definition', 'Definition', OFF['ec_definition']),
        ('threeUses', '3 Uses of Adjectives', OFF['ec_uses']),
        ('examples', 'Examples', OFF['ec_examples']),
    ]
    ec_topics = []
    for tid, title, off in ec:
        ec_topics.append({'id': tid, 'title': title,
                          'content': [{'type': 'para', 'text': p}
                                      for p in paras(
                                          conv_mixed(conv, tbk.prose(off)))]})

    ga = [
        ('introduction', 'Introduction', OFF['ga_intro']),
        ('adjectiveParadigm', 'Adjective Paradigm', OFF['ga_par_sg']),
        ('secondAdjectiveParadigm', '2nd Adjective Paradigm',
         OFF['ga_par2_sg']),
        ('attributivePosition', 'Attributive Position', OFF['ga_attributive']),
        ('predicatePosition', 'Predicate Position', OFF['ga_predicate']),
        ('substantiveUse', 'Substantive Use', OFF['ga_substantive']),
        ('predicateOrAttributive', 'Predicate or Attributive',
         OFF['ga_pred_or_attr']),
    ]
    ga_topics = []
    for tid, title, off in ga:
        ga_topics.append({'id': tid, 'title': title,
                          'content': [{'type': 'para', 'text': p}
                                      for p in paras(
                                          conv_mixed(conv, tbk.prose(off)))]})

    ev = [
        ('introduction', 'Introduction', OFF['eimi_intro']),
        ('presentIndicative',
         'Present Indicative of \u03b5\u1f30\u03bc\u03af', OFF['eimi_present']),
        ('examples', 'Examples', OFF['eimi_examples']),
        ('ouOukOuch',
         '\u03bf\u1f50, \u03bf\u1f50\u03ba and \u03bf\u1f50\u03c7',
         OFF['eimi_ou']),
    ]
    ev_topics = []
    for tid, title, off in ev:
        ev_topics.append({'id': tid, 'title': title,
                          'content': [{'type': 'para', 'text': p}
                                      for p in paras(
                                          conv_mixed(conv, tbk.prose(off)))]})

    pops = []
    for key, off, clip in [('ou', OFF['pop_ou'], 'g_ou'),
                           ('ouk', OFF['pop_ouk'], 'g_ouk'),
                           ('ouch', OFF['pop_oux'], 'g_oux')]:
        lines = [sq(l) for l in f(off).split('\r\n') if l.strip()]
        head, rest = lines[0], lines[1:]
        cond = []
        while rest and rest[0].startswith('('):
            cond.append(rest.pop(0))
        examples = []
        for j in range(0, len(rest) - 1, 2):
            en = rest[j + 1]
            m = re.search(r'\(([^()]*\d[^()]*)\)\s*$', en)
            ref = m.group(1) if m else None
            if ref:
                en = en[:m.start()].strip()
            examples.append({'greek': sq(conv(rest[j])), 'gloss': en,
                             'ref': ref, 'audio': aud('%s%d' % (clip, j // 2 + 1))})
        if len(examples) != 2:
            raise SystemExit('STOP: popup %s: expected 2 examples, got %d'
                             % (key, len(examples)))
        pops.append({'id': key, 'greek': conv(head.split()[0]),
                     'gloss': ' '.join(head.split()[1:]),
                     'condition': ' '.join(cond).strip('()'),
                     'audio': aud(clip), 'examples': examples})

    return [
        {'id': 'c7_learn_objectives', 'type': 'contentAudio',
         'mode': 'objectivesPage', 'title': 'Learn Chapter Objectives',
         'instructions': ''},
        {'id': 'c7_learn_english_concepts', 'type': 'contentAudio',
         'mode': 'topicPages', 'title': 'Learn English Concepts',
         'topics': ec_topics},
        {'id': 'c7_learn_adjectives', 'type': 'contentAudio',
         'mode': 'topicPages', 'title': 'Learn Greek Adjectives',
         'greekTaps': True, 'topics': ga_topics,
         '_paradigm_note': ('The Adjective Paradigm and 2nd Adjective '
                            'Paradigm topics each carry a Singular chart '
                            'with a More button to the Plural chart '
                            '(%#x / %#x). The charts themselves are emitted '
                            'as quickReview paradigms and referenced from '
                            'here.' % (OFF['ga_par_pl'], OFF['ga_par2_pl']))},
        {'id': 'c7_learn_eimi', 'type': 'contentAudio', 'mode': 'topicPages',
         'title': 'Learn Verb:  \u03b5\u1f30\u03bc\u03af', 'greekTaps': True,
         'topics': ev_topics, 'popups': pops},
        {'id': 'c7_learn_vocab', 'type': 'contentAudio', 'mode': 'flashcard',
         'title': 'Learn Vocabulary', 'pool': 'lemmas'},
        learn_scripture(f, conv),
        bibliography(f),
    ]


def learn_scripture(f, conv):
    v = interlinear(f, conv, OFF['learn_sm'], 'Jn 1:1', 'f_sm', 'f_jn1_1',
                    17, JN11_REPEATS)
    v.update({'id': 'c7_learn_scripture', 'type': 'contentAudio',
              'mode': 'interlinearVerse', 'title': 'Learn Scripture Memory'})
    return v


def bibliography(f):
    txt = re.sub(r'\s+', ' ', f(OFF['biblio'])).strip()
    items = re.split(r'(?=(?:Machen|Mounce|Summers|Wenham),)', txt)
    items = [dash(i.strip()) for i in items if i.strip()][:4]
    if len(items) != 4:
        raise SystemExit('STOP: expected 4 bibliography entries')
    titles = ['New Testament Greek for Beginners',
              'Basics of Biblical Greek: Grammar',
              'Essentials of New Testament Greek',
              'The Elements of New Testament Greek']
    out = []
    for it, title in zip(items, titles):
        if title not in it:
            raise SystemExit('STOP: bibliography title %r not found in %r'
                             % (title, it))
        out.append(it.replace(title, '[[i]]%s[[/i]]' % title))
    return {'id': 'c7_learn_bibliography', 'type': 'contentAudio',
            'mode': 'textPage', 'title': 'Learn Bibliography',
            'content': [{'type': 'biblist', 'items': out}]}


SM_OPTIONS = ['in', 'beginning', 'was', 'the (nom)', 'word', 'and', 'with',
              'the (acc)', 'God']


def scripture_drill(tbk, conv):
    prompts = fp(tbk, OFF['sm_drill_prompts'], 9, 'Scripture Memory prompts')
    items = [{'greek': conv(p.split()[0]), 'answer': SM_OPTIONS[i],
              'audio': aud('f_sm%d' % (i + 1))}
             for i, p in enumerate(prompts)]
    return {'id': 'c7_drill_scripture_memory', 'type': 'select',
            'mode': 'fullOptionGrid', 'title': 'Scripture Memory Drill',
            'instructions': 'Click on the matching word',
            'promptIsGreek': True, 'options': 'static',
            'optionValues': SM_OPTIONS, 'items': items, 'scored': True,
            'ui': dict(SCORED_UI)}


def scripture_speller(tbk, conv):
    verse = tbk.field(OFF['sm_spell_verse'])
    words = []
    for line in [l for l in verse.split('\r\n') if l.strip()]:
        words += [conv(w) for w in ELISION.sub("\\1'", line).split()]
    if len(words) != 17:
        raise SystemExit('STOP: Jn 1:1 speller expected 17 words, got %d'
                         % len(words))
    return {'id': 'c7_ex_scripture_speller', 'type': 'spellVerse',
            'title': 'Scripture Memory Spelling Exercise',
            'instructions': 'Enter all of John 1:1 then click "Check Answer"',
            'reference': 'Jn 1:1', 'answerWords': words,
            'translation': 'In the beginning was the word and the word was '
                           'with God and the word was God.',
            'accentsOptional': True, 'punctuationOptional': True,
            'audio': aud('f_jn1_1'), 'spellerTilesRef': 'chapt_1',
            'ui': {'fields': ['Spell Greek'],
                   'buttons': ['Pronounce', 'Check Answer', 'Greek Keyboard',
                               'Restart Exercise'],
                   'checkboxes': ['Show Answer', 'With Accents'],
                   '_reveal_note': 'RULES C8 / D-30: Show Answer is the one '
                                   'reveal control. No Major Hint button.'}}


# --------------------------------------------------------------------
# Paradigm charts (quick review) and vocabulary
# --------------------------------------------------------------------

GENDERS = ['Masculine', 'Feminine', 'Neuter']
ADJ_AUDIO_GENDER = ['m', 'f', 'n']


def adj_chart(tbk, conv, sg_off, pl_off, lemma_legacy, gloss, stem):
    rows = []
    for off, num in ((sg_off, 's'), (pl_off, 'p')):
        for line in [l for l in tbk.field(off).split('\r\n') if l.strip()]:
            m = re.match(r'^\s*(N\.V\.|N\.|G\.|D\.|A\.|V\.)\s+(.*)$', line)
            if not m:
                continue
            label = m.group(1)
            cells = m.group(2).split()
            if len(cells) < 3:
                continue
            case = {'N.': 'nom', 'N.V.': 'nom', 'G.': 'gen', 'D.': 'dat',
                    'A.': 'acc', 'V.': 'voc'}[label]
            row = {'label': label, 'number': num, 'cells': []}
            for gi, cell in enumerate(cells[:3]):
                clip = 'g_%s%s%s%s' % (stem, CASE_LETTER[case],
                                       ADJ_AUDIO_GENDER[gi], num)
                row['cells'].append({
                    'greek': conv(cell),
                    'audio': aud(clip) if tbk.has_clip(clip) else None})
            rows.append(row)
    if len(rows) != 9:
        raise SystemExit('STOP: %s chart: expected 9 rows, got %d'
                         % (stem, len(rows)))
    return {'lemma': conv(lemma_legacy), 'gloss': gloss,
            'columns': GENDERS, 'rows': rows,
            'sayWhole': {'label': 'Say Whole List',
                         'audio': aud('g_%spar' % ('aga' if stem == 'aga'
                                                   else 'dk'))}}


def eimi_chart(conv):
    return {'title': '"\u03b5\u1f30\u03bc\u03af" Paradigm',
            'columns': ['Singular', 'Plural'],
            'rows': [
                {'cells': [{'greek': conv(EIMI[0][2]), 'gloss': EIMI[0][3],
                            'audio': aud('g_eimi1s')},
                           {'greek': conv(EIMI[3][2]), 'gloss': EIMI[3][3],
                            'audio': aud('g_eimi1p')}]},
                {'cells': [{'greek': conv(EIMI[1][2]), 'gloss': EIMI[1][3],
                            'audio': aud('g_eimi2s')},
                           {'greek': conv(EIMI[4][2]), 'gloss': EIMI[4][3],
                            'audio': aud('g_eimi2p')}]},
                {'cells': [{'greek': conv(EIMI[2][2]), 'gloss': EIMI[2][3],
                            'audio': aud('g_eimi3s')},
                           {'greek': conv(EIMI[5][2]), 'gloss': EIMI[5][3],
                            'audio': aud('g_eimi3p')}]},
            ],
            'sayWhole': {'label': 'Say Whole List', 'audio': aud('g_ispar')}}


def quick_review(tbk, conv):
    f = tbk.field
    out = [
        {'id': 'c7_qr_vocab', 'type': 'contentAudio', 'mode': 'reviewVocab',
         'title': 'Review Vocabulary Chart', 'pool': 'lemmas', 'columns': 2,
         'showNtFreq': True, 'footnote': sq(f(OFF['review_vocab_note'])),
         'playAll': {'audio': aud('g_vocl7'), 'label': 'Say Whole List'}},
        {'id': 'c7_qr_adjectives', 'type': 'contentAudio',
         'mode': 'paradigmChart', 'title': 'Review Adjectives Paradigm',
         'chartTitle': 'Adjective Paradigm',
         'paradigm': adj_chart(tbk, conv, OFF['ga_par_sg'], OFF['ga_par_pl'],
                               'a]gaqo<j', 'good', 'aga')},
        {'id': 'c7_qr_eimi', 'type': 'contentAudio', 'mode': 'paradigmChart',
         'title': 'Review Present Indicative of "Eimi"',
         'chartTitle': 'Present Indicative of \u03b5\u1f30\u03bc\u03af',
         'paradigm': eimi_chart(conv)},
    ]
    for aid, title, off, ref, prefix, whole, n, rep in [
        ('c7_qr_scripture_146a', 'Review Scripture Memory:  Jn 14:6a',
         OFF['review_sm_146a'], 'John 14:6a', 'c_sm', 'c_sm14_6', 14, None),
        ('c7_qr_scripture_146b', 'Review Scripture Memory:  Jn 14:6b',
         OFF['review_sm_146b'], 'John 14:6b', 'd_sm', 'd_jn146b', 9, None),
        ('c7_qr_scripture_rom', 'Review Scripture Memory:  Rom 3:23',
         OFF['review_sm_rom'], 'Rom 3:23', 'e_sm', 'e_rom323', 9, None),
        ('c7_qr_scripture_jn11', 'Review Scripture Memory:  Jn 1:1',
         OFF['review_sm_jn11'], 'Jn 1:1', 'f_sm', 'f_jn1_1', 17,
         JN11_REPEATS),
    ]:
        v = interlinear(f, conv, off, ref, prefix, whole, n, rep)
        v.update({'id': aid, 'type': 'contentAudio',
                  'mode': 'interlinearVerse', 'title': title})
        out.append(v)
    return out


def vocab_rows(tbk, conv):
    lex = fp(tbk, OFF['voc_lexical'], 10, 'vocabulary lexical forms')
    gl = fp(tbk, OFF['voc_gloss'], 10, 'vocabulary glosses')
    bare = fp(tbk, OFF['voc_bare'], 10, 'vocabulary bare forms')
    short = fp(tbk, OFF['voc_short'], 10, 'vocabulary short glosses')
    rows = []
    for i, key in enumerate(VOC_ORDER):
        rows.append({
            'key': key,
            'greek': conv(bare[i].strip()),
            'lexicalForm': conv(sq(lex[i])),
            'gloss': re.split(r'\s{2,}', gl[i].strip())[0].strip(),
            'glossShort': re.split(r'\s{2,}', short[i].strip())[0].strip(),
            'audio': aud('g_voc%d' % (i + 1)),
        })
    return rows


NT_FREQ = {'agathos': 102, 'hagios': 233, 'dikaios': 79, 'eimi': 2460,
           'ioudaios': 195, 'megas': 243, 'nekros': 128, 'ou': 1606,
           'protos': 155, 'phone': 139}


def vocab_drills(tbk, conv):
    return [
        {'id': 'c7_drill_vocab_gk_en', 'type': 'select',
         'mode': 'fullOptionGrid',
         'title': 'Vocabulary:  Greek to English Drill',
         'instructions': 'Click on the matching word',
         'promptFrom': {'lexicon': 'lemmas', 'show': 'greek',
                        'audio': 'pronounceButton'},
         'options': 'glossShortPool', 'scored': True, 'ui': dict(SCORED_UI)},
        {'id': 'c7_drill_vocab_en_gk', 'type': 'select',
         'mode': 'fullOptionGrid',
         'title': 'Vocabulary:  English to Greek Drill',
         'instructions': 'Click on the matching word',
         'promptFrom': {'lexicon': 'lemmas', 'show': 'glossShort'},
         'options': 'greekPool', 'optionsAreGreek': True, 'scored': True,
         'ui': dict(SCORED_UI)},
    ]


def vocab_speller(tbk, conv):
    prompts = fp(tbk, OFF['voc_spell_prompts'], 10, 'vocab speller prompts')
    items = []
    for i, key in enumerate(VOC_ORDER):
        items.append({'ref': key,
                      'prompt': re.split(r'\s{2,}', prompts[i].strip())[0]})
    return {'id': 'c7_ex_vocab_speller', 'type': 'spell',
            'title': 'Vocabulary Spelling Exercise',
            'instructions': 'Click letters below or use your keyboard to '
                            'spell it out.',
            'prompt': 'item', 'promptLabel': 'English Meaning',
            'accentsOptional': True, 'spellerTilesRef': 'chapt_1',
            'items': items, 'ui': dict(SPELL_UI)}


def build(tbk, conv):
    f = tbk.field
    tbk.greek_fmts = underline.vote_greek_fmts(
        tbk.data, [OFF[k] for k in ['ec_definition', 'ec_uses', 'ec_examples', 'ga_intro', 'ga_par_sg', 'ga_par_pl', 'ga_par2_sg', 'ga_par2_pl', 'ga_attributive', 'ga_predicate', 'ga_substantive', 'ga_pred_or_attr', 'eimi_intro', 'eimi_present', 'eimi_examples', 'eimi_ou']])
    ch = {}
    ch['_comment'] = (
        'Chapter 7 (Adjectives; the verb eimi), assembled from 7_ADJS.TBK + '
        'CHAPT_7 audio + ch7railwalk.pdf. Fields read by offset '
        '(5F-EXTRACTION-MAP.md sec 2). The Adjective Case Drill and the '
        'Adjective Spelling Exercise are the same twenty items in the same '
        'order and are used as each other\'s answer key, asserted parallel '
        'on all twenty references. Behavior fields are stamped by '
        'apply-behavior-matrix.py from the eleven CONFIRMED chapter-7 rows '
        'of DRILLBEHAVIORLEDGER.csv and are not set here.')
    ch['id'] = 'chapt_7'
    ch['number'] = 7
    ch['title'] = 'Adjectives'

    lines = [l.strip() for l in f(OFF['objectives']).split('\r\n') if l.strip()]
    if lines[0] != 'You will be able to:':
        raise SystemExit('STOP: objectives preamble moved')
    body, cur = [], ''
    for l in lines[1:]:
        if re.match(r'^\d\)', l):
            if cur:
                body.append(cur)
            cur = re.sub(r'^\d\)\s*', '', l)
        elif cur:
            cur += ' ' + l
    if cur:
        body.append(cur)
    if len(body) != 7:
        raise SystemExit('STOP: expected 7 objectives, got %d' % len(body))
    ch['objectivesPreamble'] = 'You will be able to:'
    ch['objectives'] = [dash(conv_mixed(conv, sq(b.rstrip(',').rstrip('.'))))
                        for b in body]
    ch['vocab'] = list(VOC_ORDER)

    ch['learn'] = learn_pages(tbk, conv)
    ch['drill'] = [
        case_drill(tbk, conv),
        translation_drill(tbk, conv, 'c7_drill_translation',
                          'Adjective Translation Drill', 15,
                          ('atd_prompt1', 'atd_prompt2', 'atd_opt1',
                           'atd_opt2', 'atd_opt3', 'atd_refs'),
                          ATD_ANSWER, 'g_atd', hint='adjectivePositions'),
        parsing_drill(tbk, conv),
        translation_drill(tbk, conv, 'c7_drill_translation_eimi',
                          '\u03b5\u1f30\u03bc\u03af Translation Drill', 14,
                          ('etd_prompt1', 'etd_prompt2', 'etd_opt1',
                           'etd_opt2', 'etd_opt3', 'etd_refs'),
                          ETD_ANSWER, 'g_etd', hint='eimiParadigm'),
    ] + vocab_drills(tbk, conv) + [scripture_drill(tbk, conv)]
    ch['exercise'] = [
        adj_speller(tbk, conv),
        eimi_speller(tbk, conv),
        vocab_speller(tbk, conv),
        scripture_speller(tbk, conv),
    ]
    ch['quickReview'] = quick_review(tbk, conv)

    # Observed in the DOSBox pass of the Adjective Translation Drill
    # (Ch7AdjectiveTranslationDrill.pdf): Awesome!, Yes, Good student!,
    # Well done! on the correct side and Persistence, Practice makes
    # perfect, Not quite on the incorrect side, none of which chapters
    # 1-5 had surfaced.
    ch['feedback'] = {
        'correct': ['Great!', 'Congratulations', 'Perfect!', 'Right On!',
                    'Fantastic!', 'Yes', 'Awesome!', 'Good student!',
                    'Well done!'],
        'incorrect': ['Try again', 'Swing and a miss',
                      'Repetition will get it', 'Never give up',
                      'Keep trying', 'Persistence', 'Practice makes perfect',
                      'Not quite'],
    }
    ch['sequence'] = [
        'c7_learn_objectives', 'c7_learn_english_concepts',
        'c7_learn_adjectives', 'c7_drill_case', 'c7_drill_translation',
        'c7_ex_speller', 'c7_learn_eimi', 'c7_drill_parsing_eimi',
        'c7_drill_translation_eimi', 'c7_ex_speller_eimi', 'c7_learn_vocab',
        'c7_drill_vocab_gk_en', 'c7_drill_vocab_en_gk', 'c7_ex_vocab_speller',
        'c7_learn_scripture', 'c7_drill_scripture_memory',
        'c7_ex_scripture_speller', 'c7_qr_vocab', 'c7_qr_adjectives',
        'c7_qr_eimi', 'c7_qr_scripture_146a', 'c7_qr_scripture_146b',
        'c7_qr_scripture_rom', 'c7_qr_scripture_jn11',
        'c7_learn_bibliography',
    ]
    ch['_sequence_note'] = ('Rail order from ch7railwalk.pdf (Nathanael, '
                            '2026-08-07).')
    ch['_audioVerify'] = (
        'CHAPT_7 ships 190 WAVs; 182 are wired. UNWIRED, each checked '
        'against the dispatch tables rather than assumed: c_sm10 and '
        'd_sm6b (second takes inside the two cumulative Jn 14:6 review '
        'verses, exactly as chapters 5 and 6 left them); g_dikvfp (the '
        'vocative feminine plural of dikaios -- the chart merges N.V. in '
        'the plural, so no cell claims it); and g_ei, g_estin, g_este, '
        'g_eisin, g_esmen (bare eimi-form clips superseded by the '
        'g_eimi1s..3p paradigm-cell family, which is what the TBK actually '
        'dispatches). Leave all eight unwired unless the build finds a '
        'surface.')
    return ch


def build_lexicon(tbk, conv):
    rows = vocab_rows(tbk, conv)
    chart = re.sub(r'\s+', ' ', tbk.field(OFF['review_vocab']))
    lemmas = {}
    for r in rows:
        freq = NT_FREQ[r['key']]
        if '(%d)' % freq not in chart:
            raise SystemExit('STOP: NT frequency %d for %s is not on the '
                             'Review Vocabulary Chart' % (freq, r['key']))
        lemmas[r['key']] = {
            'greek': r['greek'], 'translit': r['key'], 'gloss': r['gloss'],
            'glossShort': r['glossShort'],
            'pos': 'verb' if r['key'] == 'eimi' else
                   ('adverb' if r['key'] == 'ou' else
                    ('noun' if r['key'] == 'phone' else 'adjective')),
            'audio': r['audio'], 'ntFreq': freq,
            'lexicalForm': r['lexicalForm'],
        }
    # RATIFIED 2026-08-27 (VERIFY-5H-3 4.3) and CORRECTED 2026-08-28 by
    # Nathanael after seeing it on the device: on the Review chart
    # ou -> g_voc8, and ouk AND ouch BOTH -> g_voc8b. 5H-SPEC3 4.3 put the
    # middle form on g_voc8a; that was the spec's reading of his mapping, not
    # his mapping. g_voc8a is the all-three recitation and is the LEMMA clip
    # only -- what the flashcard plays under the (v) two-surface rule, and
    # nothing the chart taps. audioAlt is retired for parts.
    lemmas['ou']['audio'] = aud('g_voc8a')
    lemmas['ou'].pop('audioAlt', None)
    lemmas['ou']['parts'] = [{'greek': 'οὐ', 'audio': aud('g_voc8')},
                             {'greek': 'οὐκ', 'audio': aud('g_voc8b')},
                             {'greek': 'οὐχ', 'audio': aud('g_voc8b')}]
    lemmas['ou']['_audio_note'] = (
        'VERIFY-5H-3 (x) answered pre-round (Nathanael, 2026-08-27) and '
        'CORRECTED by him 2026-08-28 after seeing it on the device: on the '
        'Review chart ou -> g_voc8, and ouk AND ouch BOTH -> g_voc8b. '
        '5H-SPEC3 4.3 rendered the middle form as g_voc8a; that was the '
        "spec's reading of his mapping, not his mapping. g_voc8a is the clip "
        'that recites all three and is now the LEMMA clip only, which per the '
        '(v) two-surface rule is what the flashcard plays. Implementer '
        'hand-edit, 5H-SPEC3-RESULTS section 3.6; the pipeline needs to '
        'absorb it.')
    example = {}
    for pop in [a for a in [] ]:
        pass
    return {'_comment': (
                'Chapter 7 lexicon, assembled from 7_ADJS.TBK (cohort 5F). '
                'Vocabulary order is the TBK list order (alphabetical), '
                'which matches g_voc1..10. ntFreq values are the Review '
                'Vocabulary Chart\'s own counts (0x0ea40e). CHAPT_7 ships '
                'g_* plus chapters 3-6\'s c_sm*, d_sm*, e_sm* and f_sm* for '
                'the four cumulative Scripture review charts; the data '
                'references those LOCAL copies.'),
            'lemmas': lemmas, 'exampleWords': example}


def post_patches(ch):
    """Stage 8.7: ratified rulings re-applied on any rebuild, so a
    regeneration cannot reverse a hand-approved fix. Update THIS function
    when a new ruling lands against chapter 7."""
    # 5H-SPEC2 2.5 (VERIFY-5H (o)): objectives may carry per-word audio.
    hit = [i for i, o in enumerate(ch['objectives'])
           if isinstance(o, str) and 'εἰμί' in o]
    if len(hit) != 1:
        raise SystemExit('STOP: expected exactly one objective naming eimi, '
                         'found %r -- the objectives text moved and the '
                         'audioMap index must be re-derived' % hit)
    i = hit[0]
    ch['objectives'][i] = {
        'text': ch['objectives'][i],
        'audioMap': {'εἰμί': aud('g_eimi1s')},
        '_source': ('Objectives page WordSelection table dispatches g_eimi1s '
                    '(7_ADJS.TBK, 0xf34b6 region); VERIFY-5H (o) confirmed '
                    'both original objectives taps speak.')}
    return ch


def validate(ch):
    ids = set()
    for sec in ('learn', 'drill', 'exercise', 'quickReview'):
        for a in ch[sec]:
            if a['id'] in ids:
                raise SystemExit('STOP: duplicate id %s' % a['id'])
            ids.add(a['id'])
    if set(ch['sequence']) != ids:
        raise SystemExit('STOP: sequence/activity mismatch: %r'
                         % (set(ch['sequence']) ^ ids))


def main():
    tbkpath, fontpath, outdir = sys.argv[1], sys.argv[2], sys.argv[3]
    tbk = Tbk(tbkpath)
    conv = make_conv(json.load(open(fontpath)))
    ch = build(tbk, conv)
    ch = post_patches(ch)
    validate(ch)
    lex = build_lexicon(tbk, conv)
    for name, obj in (('chapt-07.json', ch), ('lexicon-chapt07.json', lex)):
        with open('%s/%s' % (outdir, name), 'w', encoding='utf-8') as fh:
            json.dump(obj, fh, ensure_ascii=False, indent=1)
            fh.write('\n')
        print('wrote %s/%s' % (outdir, name))


if __name__ == '__main__':
    main()
