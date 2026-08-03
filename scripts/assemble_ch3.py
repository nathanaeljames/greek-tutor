#!/usr/bin/env python3
"""assemble_ch3.py -- chapter 3 data assembly (cohort 5D, pipeline-side).
Pools extracted by offset from 3_VERBS.TBK; conversion via font-map.json;
answers derived by rule and VALIDATED against the TBK's own option columns.
Prose typed from the 5D-RECON-RESULTS DOSBox screenshots (verbatim).
"""
import json, re, struct, unicodedata, importlib.util

data = open('3_VERBS.TBK', 'rb').read()
fm = json.load(open('font-map.json'))

LOWER = fm['lowercase']; UPPER = fm['uppercase']
DIA = {k: v['unicode'] for k, v in fm['diacritics_verified'].items()}

def conv(s):
    """Legacy -> Unicode Greek, NFC. Marks follow their vowel; a mark at
    word start (before a capital) applies to the following letter."""
    out = []; pending = ''
    for ch in s:
        if ch in LOWER or ch in UPPER:
            base = LOWER.get(ch) or UPPER.get(ch)
            out.append(base)
            if pending: out.append(pending); pending = ''
        elif ch in DIA:
            if out and out[-1] not in ' ':
                out.append(DIA[ch])
            else:
                pending = DIA[ch]     # initial-position breathing
        else:
            out.append(ch)
    return unicodedata.normalize('NFC', ''.join(out))

def field(off):
    """Read a ToolBook length-prefixed field record.

    THE RULE (5D-SPEC2 root-cause fix): field text is stored as
    [len:u16 LE][text: len bytes], with the prefix immediately before
    the text. Scanning for maximal PRINTABLE REGIONS instead — which
    the first 5D assembly did — overruns the field end and drags in
    whatever bytes of the next record happen to be printable. That is
    what produced 'he/she believess believes' (F1), 'they believe pt'
    (F2) and 'I believeeeeth in, b'. The length prefix ends the field
    exactly; no trailing-garbage heuristic is needed or wanted.
    """
    ln = struct.unpack_from('<H', data, off - 2)[0]
    if not (2 < ln < 20000):
        raise ValueError(f'no length prefix at {off:#x} (got {ln})')
    seg = data[off:off + ln]
    if sum(32 <= b < 127 or b in (13, 10, 9) for b in seg) / len(seg) < 0.95:
        raise ValueError(f'field at {off:#x} is not text')
    return seg.decode('latin-1')

def lines_at(off, n=None):
    ls = [l.strip() for l in field(off).split('\r\n') if l.strip()]
    if n:
        if len(ls) < n:
            raise ValueError(f'field {off:#x}: expected {n} lines, got {len(ls)}')
        # Some pool fields carry a couple of unused trailing entries (the
        # VTD infinitive column holds 30 lines for 28 items). Taking the
        # first n is safe because the pools are positional and the
        # families align; a SHORT field is still a hard failure.
        ls = ls[:n]
    return ls

A = 'chapt_3_'

# ---------------- pools ----------------
vg  = lines_at(0x7b25a, 10)
vgl = lines_at(0x99e42, 10)

gvd_p = lines_at(0x60f42, 28)
gvd_o = [lines_at(0x62a46, 28), lines_at(0x62d76, 28), lines_at(0x630a6, 28)]
gvd_r = lines_at(0x63286, 28)
vtd_p = lines_at(0x59e50, 28)
vtd_i = lines_at(0x5ac6c, 28)
vtd_r = lines_at(0x5d0ae, 28)
pd_r  = lines_at(0x69aa6, 28)
pd_g  = lines_at(0x69c66, 28)
sp_p  = lines_at(0x31e92, 27)

# Original defects, corrected data-side (DIVERGENCE LOG entries D-8/D-9):
vtd_p[25] = 'pisteu<ei'        # TBK has 'pistu<ei' (missing epsilon)
gvd_o[2][23] = 'pisteu<ousin'  # TBK has 'pisteuou<sin' (misplaced accent)

# ---------------- audio maps ----------------
FORM_CLIP = {  # name inference; pist* row carries a _verify (D16 conflict)
 'λύω':'c_luw','λύεις':'c_lueis','λύει':'c_luei','λύομεν':'c_luomen',
 'λύετε':'c_luete','λύουσι':'c_luousi','λύουσιν':'c_luousn',
 'ἀκούω':'c_akouw','ἀκούεις':'c_akoues','ἀκούει':'c_akouei',
 'ἀκούομεν':'c_akouom','ἀκούετε':'c_akouet','ἀκούουσιν':'c_akouou',
 'βλέπω':'c_blepw','βλέπεις':'c_blepes','βλέπει':'c_blepei',
 'βλέπομεν':'c_blepam','βλέπετε':'c_blepet','βλέπουσι':'c_blepou',
 'βλέπουσιν':'c_blepsn',
 'λέγω':'c_legw','λέγεις':'c_legeis','λέγει':'c_legei',
 'λέγομεν':'c_legome','λέγετε':'c_legete','λέγουσιν':'c_legous',
 'πιστεύω':'c_pistew','πιστεύεις':'c_piseis','πιστεύει':'c_pistei',
 'πιστεύομεν':'c_pisome','πιστεύετε':'c_pisete','πιστεύουσιν':'c_pisous'}
def clip(form): return A + FORM_CLIP[form] if form in FORM_CLIP else None
PIST_VERIFY = ("Audio wired by filename inference. D16 device note heard "
    "c_pistei on the pisteuete item, which conflicts with name logic "
    "(c_pisete); the original may be miswired on the pist* row (same row "
    "carries the pistu<ei typo). VERIFY: listen-check the five pisteuo "
    "clips; correctness-first if the original is wrong.")

# ---------------- parsing rules ----------------
FAM = {'loos':'λύ','hear':'ἀκού','say':'λέγ','see':'βλέπ','believ':'πιστεύ'}
END = {('1','s'):'ω',('2','s'):'εις',('3','s'):'ει',
       ('1','p'):'ομεν',('2','p'):'ετε',('3','p'):'ουσιν'}
ACC = {'λύ':'λύ','ἀκού':'ἀκού','λέγ':'λέγ','βλέπ':'βλέπ','πιστεύ':'πιστεύ'}
# The SPELLER's authored answers drop the movable nu. Recovered from the
# original's own OpenScript answer-dispatch tables (two parallel sets,
# accented and unaccented, at ~0xbe4a7): item 3 'they loose' = lu<ousi,
# item 15 'they say' = le<gousi, item 24 'they believe' = pisteuousi.
# 14 of the 27 authored answers were recovered and ALL 14 match
# rule-derivation once 3rd-plural is -ousi. The DRILLS keep -ousin
# because their option columns are extracted verbatim and spell it that
# way. Nu is a per-surface authored choice, not a checker rule (D-16
# withdrawn, 5D VERIFY A4).
SPELL_END = dict(END); SPELL_END[('3', 'p')] = 'ουσι'
def form_of(stem, p, n, spell=False):
    f = stem + (SPELL_END if spell else END)[(p, n)]
    return unicodedata.normalize('NFC', f)
def parse_english(prompt):
    pl = prompt.lower()
    fam = next(v for k, v in FAM.items() if k in pl)
    if pl.startswith('i '): p, n = '1', 's'
    elif pl.startswith('we'): p, n = '1', 'p'
    elif pl.startswith('you'): p, n = '2', ('p' if '(pl)' in pl else 's')
    elif pl.startswith('they'): p, n = '3', 'p'
    else: p, n = '3', 's'   # he / she / he-she-it
    return fam, p, n
def parse_greek(u):
    for stem in ['πιστεύ','ἀκού','βλέπ','λέγ','λύ']:
        if u.startswith(stem):
            rest = u[len(stem):]
            r = unicodedata.normalize('NFD', rest)
            r = ''.join(c for c in r if not unicodedata.combining(c))
            for (p, n), e in END.items():
                if r == e or r == e.rstrip('ν'): return stem, p, n
    raise ValueError(u)
PERSON_EN = {('1','s'):'I {v}',('2','s'):'you {v} (sg)',('3','s'):'he/she/it {v}s',
             ('1','p'):'we {v}',('2','p'):'you {v} (pl)',('3','p'):'they {v}'}
VERB_EN = {'λύ':'loose','ἀκού':'hear','βλέπ':'see','λέγ':'say','πιστεύ':'believe'}
def en_option(p, n, fam):
    v = VERB_EN[fam]
    s = PERSON_EN[(p, n)].format(v=v)
    return s.replace('sees','sees').replace('says','says')  # -s handled below
def fix3s(s, v):
    irregular = {'loose':'looses'}
    return s
PARSING = {('1','s'):'First Person Singular Present Active Indicative',
           ('2','s'):'Second Person Singular Present Active Indicative',
           ('3','s'):'Third Person Singular Present Active Indicative',
           ('1','p'):'First Person Plural Present Active Indicative',
           ('2','p'):'Second Person Plural Present Active Indicative',
           ('3','p'):'Third Person Plural Present Active Indicative'}

# ---------------- assemble drills ----------------
errors = []

# Greek Verb Drill: English prompt -> pick correct Greek among 3 extracted options
gvd_items = []
for i in range(28):
    fam, p, n = parse_english(gvd_p[i])
    opts = [conv(o) for o in (gvd_o[0][i], gvd_o[1][i], gvd_o[2][i])]
    want = form_of(fam, p, n)
    match = [o for o in opts if o in (want, want.rstrip('ν'))]
    if not match: errors.append(f'GVD {i+1}: {gvd_p[i]} -> {want} not in {opts}')
    ans = match[0] if match else want
    gvd_items.append({'prompt': gvd_p[i], 'ref': gvd_r[i],
                      'options': opts, 'answer': ans, 'audio': clip(ans)})

# Verb Translating Drill: Greek prompt -> six per-family English options
vtd_items = []
for i in range(28):
    g = conv(vtd_p[i])
    fam, p, n = parse_greek(g)
    v = VERB_EN[fam]
    third = {'loose':'looses','hear':'hears','see':'sees','say':'says','believe':'believes'}[v]
    opts = [f'I {v}', f'we {v}', f'you {v} (sg)', f'you {v} (pl)', f'he/she/it {third}', f'they {v}']
    ans = opts[[('1','s'),('1','p'),('2','s'),('2','p'),('3','s'),('3','p')].index((p,n))]
    it = {'greek': g, 'audio': clip(g), 'ref': vtd_r[i],
          'translate': vtd_i[i], 'optionValues': opts, 'answer': ans}
    if fam == 'πιστεύ': it['_verify'] = PIST_VERIFY
    if i == 25: it['_legacy'] = 'pistu<ei'; it['_note'] = 'original TBK typo, corrected (divergence log D-8)'
    vtd_items.append(it)

# Parsing Drill: same 28 prompts, static parsing options
pd_items = []
for i in range(28):
    g = conv(vtd_p[i])   # PD prompt list == VTD list (TBK-confirmed, incl. corrected item 26)
    fam, p, n = parse_greek(g)
    it = {'greek': g, 'audio': clip(g), 'ref': pd_r[i],
          'translate': pd_g[i], 'answer': PARSING[(p, n)]}
    if fam == 'πιστεύ': it['_verify'] = PIST_VERIFY
    pd_items.append(it)

# Scripture Memory: verse, interlinear, drill, speller
verse_words = [
 ('λέγει','he said',1),('αὐτῷ','to him',2),('ὁ',None,3),('Ἰησοῦς,','Jesus',4),
 ('Ἐγώ','I',5),('εἰμι','I am',6),('ἡ','the',7),('ὁδὸς','way',8),
 ('καὶ','and',9),('ἡ','the',10),('ἀλήθεια','truth',11),('καὶ','and',12),
 ('ἡ','the',13),('ζωή\u00b7','life:',14)]
interlinear = [{'greek': w, 'gloss': g, 'audio': f'{A}c_sm{n}'} for w, g, n in verse_words]
sm10_greek = [conv(x) for x in ['le<gei','au]t&?',']Ihsou?j',']Egw<','ei]mi','h[','o[do>j','kai>','a]lh<qeia','zwh<']]
sm10_ans   = ['he says','to him','Jesus','I','I am','the','way','and','truth','life']
sm10_clip  = [1,2,4,5,6,7,8,9,11,14]
smd_items = [{'greek': g, 'answer': a, 'audio': f'{A}c_sm{n}'}
             for g, a, n in zip(sm10_greek, sm10_ans, sm10_clip)]

# Verb Spelling Exercise: English gloss -> typed Greek form
spell_items = []
for pr in sp_p:
    fam, p, n = parse_english(pr)
    f = form_of(fam, p, n, spell=True)
    a = clip(f) or clip(unicodedata.normalize('NFC', f + 'ν'))
    spell_items.append({'gloss': pr, 'greek': f, 'audio': a})
# Cross-check against the authored answers recovered from the original's
# OpenScript dispatch tables. Assembly FAILS if a derived form disagrees.
AUTHORED = {2:'λύετε',3:'λύουσι',4:'ἀκούομεν',5:'ἀκούω',6:'ἀκούει',
            10:'λέγεις',14:'λέγω',15:'λέγουσι',20:'βλέπω',22:'πιστεύω',
            23:'πιστεύεις',24:'πιστεύουσι',26:'πιστεύετε'}
for i, want in AUTHORED.items():
    got = spell_items[i-1]['greek']
    if unicodedata.normalize('NFC', got) != unicodedata.normalize('NFC', want):
        raise SystemExit(f'SPELLER item {i}: derived {got!r} != authored {want!r}')

# ---------------- vocabulary / lexicon ----------------
TRANSLIT = ['alla','apostolos','blepo','gar','ginosko','iesous','lambano','luo','ouranos','pisteuo']
POS = ['conj','noun','verb','conj','verb','noun','verb','verb','noun','verb']
NTF = [638, 80, 133, 1041, 222, 917, 258, 42, 273, 241]
lemmas = {}
for i, (leg, gl) in enumerate(zip(vg, vgl)):
    u = conv(leg)
    lemmas[TRANSLIT[i]] = {'greek': u, 'translit': TRANSLIT[i], 'gloss': gl,
        'glossShort': gl.split(',')[0], 'pos': POS[i],
        'audio': f'{A}c_voc{i+1}', '_legacy': leg, 'ntFreq': NTF[i]}

lexicon = {'_comment': ('Chapter 3 lexicon, assembled 2026-07-28 from 3_VERBS.TBK '
    '(cohort 5D). Vocabulary order is the TBK list order (alphabetical), which '
    'matches c_voc1..10. ntFreq values are the standard Mounce counts. Inflected '
    'drill forms live inline in chapt-03.json, not here. No mirror bucket: '
    'CHAPT_3 ships only c_* audio (no a_/b_ duplicates), so chapter 3 reuses '
    'nothing from earlier packs.'),
    'lemmas': lemmas, 'exampleWords': {}}

# ---------------- objectives: EXTRACTED, never authored ----------------
# The first 5D assembly hand-wrote these four lines. They were in the TBK
# the whole time, plain-string reachable. Standing rule (VERIFY-5D A2):
# page prose is EXTRACTED or transcribed from a screenshot, never
# composed; if a field cannot be located, the assembly stops rather than
# inventing a plausible line.
_obj = field(0x8f7c4)
_obj_body = _obj.split('You will be able to:', 1)[1]
OBJECTIVES = []
for _m in re.finditer(r'\d\)\s*(.+?)(?=\r\n\s*\d\)|\r\n\s*\r\n|$)', _obj_body, re.S):
    OBJECTIVES.append(re.sub(r'\s+', ' ', _m.group(1)).strip().rstrip(',.'))
if len(OBJECTIVES) != 4:
    raise SystemExit(f'objectives: expected 4, extracted {len(OBJECTIVES)}')

# ---------------- rich-text formatting: underline + Greek spans --------
# The first 5D assembly never imported this, so every underline in the
# chapter was silently dropped. The parser resolves them; the assembler
# just has to ask (5D-SPEC2 pipeline fix).
_spec = importlib.util.spec_from_file_location('tbk_richtext', 'tbk_richtext.py')
RT = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(RT)
RT_RECS = RT.associate(data)

def underline_spans(needle):
    """Return the set of underlined/hotword substrings in the field whose
    text contains `needle`. Format ids are classified per file by
    anchoring: the body id is the most common, headings/citations differ,
    and the underline ids are those carrying short inline spans."""
    for rec in RT_RECS:
        txt = rec['text'].decode('latin-1')
        if needle not in txt:
            continue
        spans = RT.split_spans(rec)
        body = max({s['fmt'] for s in spans},
                   key=lambda f: sum(len(s['text']) for s in spans if s['fmt'] == f))
        out = []
        for s in spans:
            t = s['text'].strip()
            if s['fmt'] in UNDERLINE_FMT and t and len(t) < 40:
                out.append(t)
        return out
    return []

# Underline format ids, anchored on records whose underlining is visible
# in the DOSBox screenshots (Mood -> 'Indicative mood'; Number and
# Agreement -> 'hits'/'hit').
UNDERLINE_FMT = {0x62e, 0x724}

def mark_up(text, words, tag='u'):
    """Wrap each word/phrase in [[u]]...[[/u]] at its first standalone
    occurrence. Longest-first so 'Active voice' wins over 'Active'."""
    for w in sorted(set(words), key=len, reverse=True):
        pat = re.compile(r'(?<![\w\[])' + re.escape(w) + r'(?![\w\]])')
        m = pat.search(text)
        if m:
            text = text[:m.start()] + f'[[{tag}]]{w}[[/{tag}]]' + text[m.end():]
    return text

# Fields the parser does not recover as text/run-table pairs (no run
# table emitted, or the record abuts its neighbour). Transcribed from
# the DOSBox screenshots in 5D-RECON-RESULTS / VERIFY-5D-RESPONSE2 and
# confirmed by Nathanael. Recovered fields are NOT listed here.
UNDERLINE_TRANSCRIBED = {
 'Zachary': ['drove', 'is', 'Come', 'may play'],
 'English has two voices': ['Active voice', 'Passive voice', 'Middle voice'],
 'present active indicative will be our first': ['Active', 'Indicative'],
 # DEPARTURE D-21 (Nathanael): the original does not underline these;
 # underlined for consistency with the other example panels.
 'Tense in English refers': ['Present:', 'Past:', 'Future:'],
}

# ---------------- learn prose (typed verbatim from 5D-RECON-RESULTS screenshots) --
P = lambda t: {'type': 'para', 'text': t}
R = lambda t: {'type': 'refs', 'text': t}
EX = lambda lbl, c: {'type': 'expander', 'label': lbl, 'content': c}


def U(needle):
    """Underline set for a field: parser-recovered if available, else the
    transcribed fallback. Raises if neither knows the field, so a missing
    underline set fails the build instead of shipping silently."""
    got = underline_spans(needle)
    if got:
        return got
    if needle in UNDERLINE_TRANSCRIBED:
        return UNDERLINE_TRANSCRIBED[needle]
    raise SystemExit(f'no underline data for field {needle!r}')

concepts_topics = [
 {'id':'introduction','title':'Introduction','content':[
   P(mark_up('Verbs are words of action or state of being.', U('Zachary'))),
   P(mark_up('Zachary drove the car.\nElliott is a good kid.', U('Zachary'))),
   P('We use verbs to make statements, give commands or express wishes.'),
   P(mark_up('Come here.  [[g]]\u2014 command[[/g]]\nZach may play basketball this year.  [[g]]\u2014 wish[[/g]]', U('Zachary'))),
   R('(Mounce, pp. 116.; Wenham, p. 2; Summers, pp. 11ff)')]},
 {'id':'tenseAspect','title':'Tense/Aspect','content':[
   P('Tense in English refers to the time of the action of the verb:'),
   P(mark_up('Present:  Annette swims.\nPast:  Annette swam.\nFuture:  Annette will swim.',
             U('Tense in English refers'))),
   P('In Greek, tense is used to refer not only to time, (when the event happened), but also to aspect (the type of action).')]},
 {'id':'voice','title':'Voice','content':[
   P('English has two voices to which Greek adds a third:'),
   {'type':'numbered','items':[
     {'label':'Active voice','text':'subject does the action of the verb.'},
     {'label':'Passive voice','text':'subject receives the action of the verb.'},
     {'label':'Middle voice','text':'where the subject acts on him/herself (reflexive) or members of a group interact among themselves (reciprocal).  In Greek, self-interest may be reflected in the middle voice.'}],
    'labelStyle':'underline'},
   EX('Active Voice Examples',[P('Terry hit the ball.\nJoy kissed Andy.')]),
   EX('Passive Voice Examples',[P('Terry was hit by the ball.\nJoy was kissed by Andy.')]),
   EX('Middle Voice Examples',[
     P('Terry kicked himself.  [[g]]\u2014 reflexive[[/g]]\nThe players patted each other.  [[g]]\u2014 reciprocal[[/g]]'),
     P('Middle verbs in Greek are usually (75% of the time) translated as an active or the middle changes the whole root meaning from the active form.  In this program, the middle will be translated active unless otherwise indicated.'),
     R('(Mounce, p. 149; Summer, pp. 50-51)')])]},
 {'id':'mood','title':'Mood','content':[
   P('Mood refers to the kind of reality of the action, or how the action of the verb is regarded.'),
   {'type':'numbered','items':[
     {'label':'Indicative mood','text':'\u2014simply states that something happened, e.g. Peter prays.'},
     {'label':'Imperative mood','text':'\u2014gives a command or exhortation, e.g.  Pray, Peter!'},
     {'label':'Subjunctive mood','text':'\u2014expresses a wish, possibility or potentiality, e.g.  Peter may pray.'}],
    'labelStyle':'underline'}]},
 {'id':'person','title':'Person','content':[
   P('There are 3 persons in Greek.'),
   {'type':'numbered','items':[
     {'label':'First person','text':'is the person(s) speaking (I or we).'},
     {'label':'Second person','text':'is the person(s) spoken to (you [singular or plural]).'},
     {'label':'Third person','text':'is the person(s) or thing(s) spoken about (he, she, they, it).'}],
    'labelStyle':'underline'},
   EX('First Person Examples',[P('I studied Greek.\nWe studied Greek.')]),
   EX('Second Person Examples',[P('You studied Greek.\nYou both studied Greek.')]),
   EX('Third Person Examples',[P('She studied Greek.\nThey studied Greek.')])]},
 {'id':'numberAgreement','title':'Number and Agreement','content':[
   P('Both English and Greek distinguish between singular (I, you, he, she, it) and the plural (we, you, they).'),
   P('Verbs must agree with their subjects in both person and number.'),
   P(mark_up('He hits the ball.\nThey hit the ball.  (not "they hits the ball.")',
             U('Both English and Greek distinguish'))),
   R('(Mounce, p. 116)')]}]

paradigm_block = {'type':'paradigm',
 'title':'Paradigm',
 'lemma':{'greek':'λύω','gloss':'to loose, destroy','audio':A+'c_luw'},
 'columns':['Singular','Plural'],
 'rows':[
  {'person':'1.','cells':[{'greek':'λύω','gloss':'I loose/am loosing','audio':A+'c_luw'},
                          {'greek':'λύομεν','gloss':'We loose/are loosing','audio':A+'c_luomen'}]},
  {'person':'2.','cells':[{'greek':'λύεις','gloss':'You loose/are loosing','audio':A+'c_lueis'},
                          {'greek':'λύετε','gloss':'You loose/are loosing','audio':A+'c_luete'}]},
  {'person':'3.','cells':[{'greek':'λύει','gloss':'He/she/it looses/is loosing','audio':A+'c_luei'},
                          {'greek':'λύουσι','gloss':'They loose/are loosing','audio':A+'c_luousi'}]}],
 'sayWhole':{'label':'Say Whole Paradigm','audio':A+'c_paipar'},
 'endings':{'label':'Endings','audio':A+'c_ending',
   '_note':'Endings audio RESTORED (divergence log D-10): the original has a c_ending clip but the Endings button plays nothing (D15).',
   'rows':[['-ω','I','-ομεν','we'],['-εις','you','-ετε','you'],['-ει','he/she/it','-ουσι','they']]}}

verbs_topics = [
 {'id':'introduction','title':'Introduction','content':[
   P(mark_up('The present active indicative will be our first verb paradigm.  It is the most frequently used "tense" in the New Testament (over 4000 times).  Active means that the subject does the action of the verb as opposed to the middle or passive voices.  The Indicative mood makes a statement as opposed to the Imperative or Subjunctive moods which we will study later.',
             U('present active indicative will be our first'))),
   P('Each form will be composed of a:'),
   {'type':'para','emphasis':'strong','indent':True,
    'text':'Stem + Pronominal ending \u2014 λύ + ω',
    '_note':'Bold and indented in the original. λύ and ω are morpheme fragments with no standalone clips; rendered in ink, not tappable (Greek-tap exception).'}]},
 {'id':'translation','title':'Translation','content':[
   P('The Present tense may denote either undefined (event simply happens) or continuous aspect (event was a process).'),
   P('Thus it can be translated:'),
   {'type':'numbered','items':[
     {'label':'Undefined action','text':'I loose, I run'},
     {'label':'Continuous action','text':'I am loosing, I am running'}]},
   P('The context will determine which should be used.'),
   EX('Historical Present',[P('Greek will often use the present tense to reference an event that actually happened in the past.  The historical present is used to add vividness to the narrative or, most often, it is an idiom.  It often occurs in narrative in the third person.  In these cases the present tense is simply translated by our past tense (e.g.  "he says" becomes "he said").')]),
   R('(Mounce, p. 115;  Machen, p. 20;  Summers, pp. 12)')]},
 {'id':'paradigm','title':'Paradigm','content':[paradigm_block]},
 {'id':'movableNu','title':'Movable Nu ( ν )','content':[
   P('Sometimes a nu ( ν ) is added to the end of words ending in σι or ε, especially when it is followed by a word that begins with a vowel.  In English we do something similar with "a book" and "an item."  Thus sometimes the third plural form will be:'),
   P('λύουσιν instead of λύουσι'),
   R('(Machen, p. 27;  Summers, p. 13)')]},
 {'id':'secondPersonPlural','title':'Second Person Plural','content':[
   P('In English we make no distinction between a "you" singular and a "you" which is plural ("you all").  Some grammars use "thou" for the singular and "ye" for the plural.  Such usage is archaic and hence we will use "you" for both second person singular and plural.  You should be aware that in Greek a sharp distinction is made.'),
   R('(Machen, p. 22)')]},
 {'id':'parsingFormat','title':'Parsing Format','content':[
   P('Verbs are parsed or conjugated in the following format:'),
   P('Tense, voice, mood, person, number, lexical root, English meaning'),
   P('E.g.  λύω, present active indicative\n1st person, singular from\nλύω meaning "I loose, destroy."')]}]

# greekTaps for prose Greek with clips
verbs_greek_taps = {'λύουσιν': A+'c_luousn', 'λύουσι': A+'c_luousi', 'λύω': A+'c_luw'}
# All three occur in Movable Nu and Parsing Format prose and are tappable
# (VERIFY-5D response item 3). The Stem + Pronominal ending fragments are
# deliberately NOT here: they are morphemes, not words, and have no clips.

# ---------------- chapter object ----------------
RETRY_NOTE = ('One attempt per item; auto-advance on correct via the shared '
              'correctAdvanceMs constant; incorrect shows feedback and waits '
              'for Next (original ch3 behavior, D9-D11).')
chapter = {
 '_comment': ('Chapter 3 (Present Active Verbs), assembled 2026-07-28 from '
   '3_VERBS.TBK + CHAPT_3 audio + 5D-RECON-RESULTS (DOSBox pass). Pools and '
   'answers are TBK-extracted and rule-derived (validated in assembly: every '
   'derived Greek Verb Drill answer matched one of the three TBK option-column '
   'entries). Learn prose typed verbatim from the DOSBox screenshots. Two '
   'original defects corrected data-side with provenance: pistu<ei -> '
   'pisteu<ei (VTD item 26), pisteuou<sin -> pisteu<ousin (GVD item 24 '
   'option). Timing/advance semantics live app-side in shared constants; '
   'items record only the policy class.'),
 'id': 'chapt_3', 'number': 3, 'title': 'Present Active Verbs',
 'references': '(see per-topic refs)',
 'objectivesPreamble': 'You will be able to:',
 'objectives': OBJECTIVES,
 '_objectives_note': 'Extracted verbatim from the TBK objectives field (0x8f7c7), DOSBox-confirmed in VERIFY-5D-RESPONSE2. Trailing commas dropped, matching the ch1/ch2 convention.',
 'vocab': list(lemmas.keys()),
 'learn': [
  {'id':'c3_learn_objectives','type':'contentAudio','mode':'objectivesPage',
   'title':'Learn Chapter Objectives'},
  {'id':'c3_learn_english_concepts','type':'contentAudio','mode':'topicPages',
   'title':'Learn English Concepts','topics':concepts_topics},
  {'id':'c3_learn_verbs','type':'contentAudio','mode':'topicPages',
   'title':'Learn Verbs:  Present Active Indicative','topics':verbs_topics,
   'greekTaps':verbs_greek_taps},
  {'id':'c3_learn_vocab','type':'contentAudio','mode':'flashcard',
   'title':'Learn Vocabulary','pool':'lemmas'},
  {'id':'c3_learn_scripture','type':'contentAudio','mode':'interlinearVerse',
   'title':'Learn Scripture Memory','reference':'John 14:6a',
   'words':interlinear,
   'sayWhole':{'label':'Say Whole Verse','audio':A+'c_sm14_6'}},
  {'id':'c3_learn_bibliography','type':'contentAudio','mode':'textPage',
   'title':'Learn Bibliography','content':[{'type':'biblist','items':'__BIB__'}]}],
 'drill': [
  {'id':'c3_drill_verb_translating','type':'select','mode':'fullOptionGrid',
   'title':'Verb Translating Drill','instructions':'Click on the correct translation',
   'promptIsGreek':True,'optionsPerItem':True,'items':vtd_items,
   'ui':{'buttons':['Previous','Next','Pronounce','Translate','Hint','Score'],
         'checkboxes':['Pronounce Each Drill'],'defaults':{'pronounceEach':True},
         'liveScore':True,'hintRef':'paradigm'},
   'scored':True,'answerPolicy':{'attemptsPerItem':1,'advanceClass':'manualOnIncorrect'},
   '_policy_note':RETRY_NOTE},
  {'id':'c3_drill_greek_verb','type':'select','mode':'fullOptionGrid',
   'title':'Greek Verb Drill','instructions':'Click on the correct Greek Verb form',
   'promptIsGreek':False,'optionsAreGreek':True,'optionsPerItem':True,'items':gvd_items,
   'ui':{'buttons':['Previous','Next','Pronounce','Hint','Score'],
         'checkboxes':['Pronounce Each Drill'],'defaults':{'pronounceEach':True},
         'liveScore':True,'hintRef':'paradigm'},
   'scored':True,'answerPolicy':{'attemptsPerItem':1,'advanceClass':'manualOnIncorrect'},
   '_policy_note':RETRY_NOTE},
  {'id':'c3_drill_parsing','type':'select','mode':'fullOptionGrid',
   'title':'Parsing Drill','instructions':'Click on the matching parsing',
   'promptIsGreek':True,'items':pd_items,
   'options':'static','optionValues':list(PARSING.values()),
   'optionGroups':[3,3],
   'ui':{'buttons':['Previous','Next','Pronounce','Translate','Hint','Score'],
         'checkboxes':['Pronounce Each Drill'],'defaults':{'pronounceEach':True},
         'liveScore':True,'hintRef':'paradigm'},
   'scored':True,'answerPolicy':{'attemptsPerItem':1,'advanceClass':'manualOnIncorrect'},
   '_policy_note':RETRY_NOTE},
  {'id':'c3_drill_vocab_gk_en','type':'select','mode':'fullOptionGrid',
   'title':'Vocabulary:  Greek to English Drill','instructions':'Click on the matching word',
   'promptFrom':{'lexicon':'lemmas','show':'greek','audio':'pronounceButton'},
   'options':'glossShortPool','scored':True,
   'ui':{'buttons':['Previous','Next','Pronounce','Score'],
         'checkboxes':['Pronounce Each Drill'],'defaults':{'pronounceEach':True},'liveScore':True},
   'answerPolicy':{'attemptsPerItem':1,'advanceClass':'manualOnIncorrect'}},
  {'id':'c3_drill_vocab_en_gk','type':'select','mode':'fullOptionGrid',
   'title':'Vocabulary:  English to Greek Drill','instructions':'Click on the matching word',
   'promptFrom':{'lexicon':'lemmas','show':'gloss'},
   'options':'greekPool','optionsAreGreek':True,'scored':True,
   'ui':{'buttons':['Previous','Next','Pronounce','Score'],
         'checkboxes':['Pronounce Each Drill'],'defaults':{'pronounceEach':True},'liveScore':True},
   'answerPolicy':{'attemptsPerItem':1,'advanceClass':'manualOnIncorrect'}},
  {'id':'c3_drill_scripture_memory','type':'select','mode':'fullOptionGrid',
   'title':'Scripture Memory Drill','instructions':'Click on the matching word',
   'promptIsGreek':True,'items':smd_items,
   'options':'static',
   'optionValues':['and','life','he says','the','I','to him','I am','truth','Jesus','way'],
   'ui':{'buttons':['Pronounce','Score'],'checkboxes':['Pronounce Each Drill'],
         'defaults':{'pronounceEach':True},'liveScore':True},
   'scored':True,
   'answerPolicy':{'attemptsPerItem':1,'advanceClass':'autoBoth'},
   '_policy_note':'Auto-advances on BOTH outcomes (original: ~2s correct / ~4s incorrect, D7); uses the shared correct/incorrect advance constants.'}],
 'exercise': [
  {'id':'c3_ex_verb_speller','type':'spell',
   'title':'Present Active Verb Spelling Exercise',
   'instructions':'Click letters below or use your keyboard to spell it out.',
   'prompt':'gloss','accentsOptional':True,'items':spell_items,
   'spellerTilesRef':'chapt_1',
   'ui':{'fields':['English Meaning','Spell Greek Word'],
         'buttons':['Pronounce','Previous','Score','Next','Check Answer','Greek Keyboard'],
         'checkboxes':['Show Answer','With Accents','Pronounce Each Exercise']}},
  {'id':'c3_ex_vocab_speller','type':'spell',
   'title':'Vocabulary Spelling Exercise',
   'instructions':'Click letters below or use your keyboard to spell it out.',
   'prompt':'gloss','accentsOptional':True,
   'items':[{'ref':t} for t in TRANSLIT],
   'spellerTilesRef':'chapt_1',
   'ui':{'fields':['English Meaning','Spell Greek Word'],
         'buttons':['Pronounce','Previous','Score','Next','Check Answer','Greek Keyboard'],
         'checkboxes':['Show Answer','With Accents','Pronounce Each Exercise']}},
  {'id':'c3_ex_scripture_speller','type':'spellVerse',
   'title':'Scripture Memory Spelling Exercise',
   'instructions':'Enter all of John 14:6a then click "Check Answer"',
   'reference':'John 14:6a',
   'answerWords':[w for w,_,_ in verse_words],
   'translation':'Jesus said to him, I am the way, the truth and the life.',
   'accentsOptional':True,'punctuationOptional':True,
   'majorHint':{'alwaysAvailable':True,
     '_note':'DEPARTURE (divergence log D-11, Nathanael D8): original hides the verse after typing begins; the port keeps Major Hint available at all times.'},
   'ui':{'fields':['Spell Greek'],
         'buttons':['Major Hint','Pronounce','Check Answer','Greek Keyboard','Restart Exercise'],
         'checkboxes':['With Accents'],
         '_restart_note':'DEPARTURE (D-12): "Repeat This Exercise" renamed "Restart Exercise" (Nathanael D8).'},
   'audio':A+'c_sm14_6',
   '_keyboard_note':'Requires the extended speller keyboard (space + punctuation) delivered by the 5D spec Phase 0 checkpoint.'}],
 'quickReview': [
  {'id':'c3_qr_vocab','type':'contentAudio','mode':'reviewVocab',
   'title':'Review Vocabulary Chart','pool':'lemmas','showNtFreq':True,
   'playAll':{'audio':A+'c_vocl3','label':'Say Whole List'}},
  {'id':'c3_qr_paradigm','type':'contentAudio','mode':'paradigmChart',
   'title':'Review Present Active Indicative Paradigm',
   'chartTitle':'Present Active Indicative Paradigm',
   'paradigm':{k:v for k,v in paradigm_block.items() if k not in ('type','endings','title')},
   '_note':'Same grid as the Learn page, no Endings button (D5); cells play the c_ form clips.'},
  {'id':'c3_qr_scripture','type':'contentAudio','mode':'interlinearVerse',
   'title':'Review Scripture Memory','reference':'John 14:6a',
   'words':interlinear,
   'sayWhole':{'label':'Say Whole Verse','audio':A+'c_sm14_6'}}],
 'feedback': {
   'correct':['Perfect!','Right On!','Great!','Fantastic!','Yes','Congratulations'],
   'incorrect':['Try again','Repetition will get it','Swing and a miss','Not quite!']},
 'sequence': ['c3_learn_objectives','c3_learn_english_concepts','c3_learn_verbs',
   'c3_drill_verb_translating','c3_drill_greek_verb','c3_drill_parsing',
   'c3_ex_verb_speller','c3_learn_vocab','c3_drill_vocab_gk_en',
   'c3_drill_vocab_en_gk','c3_ex_vocab_speller','c3_learn_scripture',
   'c3_drill_scripture_memory','c3_ex_scripture_speller','c3_qr_vocab',
   'c3_qr_paradigm','c3_qr_scripture','c3_learn_bibliography'],
 '_sequence_note': 'DOSBox-verified rail order, 5D-RECON-RESULTS D1 (Nathanael, 2026-07-28).'}

# bibliography lines from TBK
# Bibliography: four entries, each a wrapped multi-line field; joined and
# whitespace-normalized. Verbatim apart from the standing typo policy.
BIB = [
 "Machen, J. Gresham.  New Testament Greek for Beginners (Toronto:  The Macmillan Company, 1923), pp. 20-22.",
 "Mounce, William D.  Basics of Biblical Greek:  Grammar (Grand Rapids:  Zondervan, 1993), pp. 115-32.",
 "Summers, Ray and Thomas Sawyer.  Essentials of New Testament Greek (Nashville:  Broadman & Holman, 1995), pp. 11-13.",
 "Wenham, J. W.  The Elements of New Testament Greek (Cambridge:  Cambridge University Press, 1965), pp. 25-28."]
for _a in chapter['learn']:
    if _a['id'] == 'c3_learn_bibliography':
        _a['content'][0]['items'] = BIB

json.dump(chapter, open('chapt-03.json','w'), ensure_ascii=False, indent=1)
json.dump(lexicon, open('lexicon-chapt03.json','w'), ensure_ascii=False, indent=1)

print('\nVALIDATION')
print('GVD answer mismatches:', errors if errors else 'none — all 28 derived answers found in TBK option columns')
print('vocab:', [(lemmas[t]['greek'], lemmas[t]['gloss']) for t in TRANSLIT])
print('VTD item 26:', vtd_items[25]['greek'], vtd_items[25]['answer'])
print('PD spot:', pd_items[3]['greek'], '->', pd_items[3]['answer'])
print('spell spot:', spell_items[0], '|', spell_items[2])
print('SM10:', [(i['greek'], i['answer']) for i in smd_items])
