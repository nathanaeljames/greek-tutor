#!/usr/bin/env python3
"""assemble_ch3.py -- chapter 3 data assembly (cohort 5D, pipeline-side).
Pools extracted by offset from 3_VERBS.TBK; conversion via font-map.json;
answers derived by rule and VALIDATED against the TBK's own option columns.
Prose typed from the 5D-RECON-RESULTS DOSBox screenshots (verbatim).
"""
import json, re, unicodedata

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

def lines_at(lo, hi, n=None):
    ls = [l.strip().decode('latin-1') for l in data[lo:hi].split(b'\r\n') if l.strip()]
    return ls[:n] if n else ls

def clean(s):
    return re.sub(r'(.)\1{3,}$', r'\1', s).strip()

A = 'chapt_3_'

# ---------------- pools ----------------
vg  = lines_at(0x7b25a, 0x7b2d3, 10)
vgl = [clean(x) for x in lines_at(0x99e42, 0x99f55, 10)]
vgl[9] = 'I believe'                       # padding-corrupted line
gvd_p = lines_at(0x60f42, 0x6119e, 28)
gvd_o = [lines_at(0x62a46,0x62bbf,28), lines_at(0x62d76,0x62ef2,28), lines_at(0x630a6,0x6321b,28)]
gvd_r = lines_at(0x63286, 0x633eb, 28)
vtd_p = lines_at(0x59e50, 0x59fa9, 28)
vtd_i = lines_at(0x5ac6c, 0x5af69, 28)
vtd_r = lines_at(0x5d0ae, 0x5d21a, 28)
pd_r  = lines_at(0x69aa6, 0x69bff, 28)
pd_g  = [clean(x) for x in lines_at(0x69c66, 0x69f63, 28)]
sp_p  = [clean(x) for x in lines_at(0x31e92, 0x3202c, 27)]

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
def form_of(stem, p, n):
    f = stem + END[(p, n)]
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
    gvd_items.append({'prompt': clean(gvd_p[i]), 'ref': gvd_r[i],
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
    f = form_of(fam, p, n)
    spell_items.append({'gloss': pr, 'greek': f, 'audio': clip(f),
                        '_verify': 'movable-nu leniency: checker should accept the form with or without final nu (original acceptance behavior unverified)' if (p,n)==('3','p') else None})
spell_items = [{k: v for k, v in it.items() if v is not None} for it in spell_items]

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

# ---------------- learn prose (typed verbatim from 5D-RECON-RESULTS screenshots) --
P = lambda t: {'type': 'para', 'text': t}
R = lambda t: {'type': 'refs', 'text': t}
EX = lambda lbl, c: {'type': 'expander', 'label': lbl, 'content': c}

concepts_topics = [
 {'id':'introduction','title':'Introduction','content':[
   P('Verbs are words of action or state of being.'),
   P('Zachary drove the car.\nElliott is a good kid.'),
   P('We use verbs to make statements, give commands or express wishes.'),
   P('Come here. \u2014 command\nZach may play basketball this year. \u2014 wish'),
   R('(Mounce, pp. 116.; Wenham, p. 2; Summers, pp. 11ff)')]},
 {'id':'tenseAspect','title':'Tense/Aspect','content':[
   P('Tense in English refers to the time of the action of the verb:'),
   P('Present:  Annette swims.\nPast:  Annette swam.\nFuture:  Annette will swim.'),
   P('In Greek, tense is used to refer not only to time, (when the event happened), but also to aspect (the type of action).')]},
 {'id':'voice','title':'Voice','content':[
   P('English has two voices to which Greek adds a third:'),
   {'type':'numbered','items':[
     'Active voice:  subject does the action of the verb.',
     'Passive voice:  subject receives the action of the verb.',
     'Middle voice:  where the subject acts on him/herself (reflexive) or members of a group interact among themselves (reciprocal).  In Greek, self-interest may be reflected in the middle voice.']},
   EX('Active Voice Examples',[P('Terry hit the ball.\nJoy kissed Andy.')]),
   EX('Passive Voice Examples',[P('Terry was hit by the ball.\nJoy was kissed by Andy.')]),
   EX('Middle Voice Examples',[
     P('Terry kicked himself. \u2014 reflexive\nThe players patted each other. \u2014 reciprocal'),
     P('Middle verbs in Greek are usually (75% of the time) translated as an active or the middle changes the whole root meaning from the active form.  In this program, the middle will be translated active unless otherwise indicated.'),
     R('(Mounce, p. 149; Summer, pp. 50-51)')])]},
 {'id':'mood','title':'Mood','content':[
   P('Mood refers to the kind of reality of the action, or how the action of the verb is regarded.'),
   {'type':'numbered','items':[
     'Indicative mood\u2014simply states that something happened, e.g. Peter prays.',
     'Imperative mood\u2014gives a command or exhortation, e.g.  Pray, Peter!',
     'Subjunctive mood\u2014expresses a wish, possibility or potentiality, e.g.  Peter may pray.']}]},
 {'id':'person','title':'Person','content':[
   P('There are 3 persons in Greek.'),
   {'type':'numbered','items':[
     'First person is the person(s) speaking (I or we).',
     'Second person is the person(s) spoken to (you [singular or plural]).',
     'Third person is the person(s) or thing(s) spoken about (he, she, they, it).']},
   EX('First Person Examples',[P('I studied Greek.\nWe studied Greek.')]),
   EX('Second Person Examples',[P('You studied Greek.\nYou both studied Greek.')]),
   EX('Third Person Examples',[P('She studied Greek.\nThey studied Greek.')])]},
 {'id':'numberAgreement','title':'Number and Agreement','content':[
   P('Both English and Greek distinguish between singular (I, you, he, she, it) and the plural (we, you, they).'),
   P('Verbs must agree with their subjects in both person and number.'),
   P('He hits the ball.\nThey hit the ball.  (not "they hits the ball.")'),
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
   P('The present active indicative will be our first verb paradigm.  It is the most frequently used "tense" in the New Testament (over 4000 times).  Active means that the subject does the action of the verb as opposed to the middle or passive voices.  The Indicative mood makes a statement as opposed to the Imperative or Subjunctive moods which we will study later.'),
   P('Each form will be composed of a:'),
   {'type':'para','text':'Stem + Pronominal ending \u2014 λύ + ω',
    '_note':'λύ and ω here are morpheme fragments with no standalone clips; rendered in ink, not tappable (Greek-tap exception, logged)'}]},
 {'id':'translation','title':'Translation','content':[
   P('The Present tense may denote either undefined (event simply happens) or continuous aspect (event was a process).'),
   P('Thus it can be translated:'),
   {'type':'numbered','items':['Undefined action:   I loose, I run','Continuous action:  I am loosing, I am running']},
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
   P('E.g.  λύω, present active indicative 1st person, singular from λύω meaning "I loose, destroy."')]}]

# greekTaps for prose Greek with clips
verbs_greek_taps = {'λύουσιν': A+'c_luousn', 'λύουσι': A+'c_luousi', 'λύω': A+'c_luw'}

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
 'objectives': [
   'Recognize and translate the present active indicative verb forms.',
   'Learn the present active indicative paradigm of λύω.',
   'Master ten new vocabulary words.',
   'Memorize John 14:6a.'],
 '_objectives_verify': 'Preamble TBK-confirmed; item wording to be checked against the DOSBox Objectives page (not in the D-pass screenshot set).',
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
bib_ls = [clean(l) for l in lines_at(0x52c00, 0x52fd0) if len(l.strip()) > 10]
print('BIB RAW LINES:'); [print(' ', l) for l in bib_ls]

json.dump(chapter, open('chapt-03.json','w'), ensure_ascii=False, indent=1)
json.dump(lexicon, open('lexicon-chapt03.json','w'), ensure_ascii=False, indent=1)

print('\nVALIDATION')
print('GVD answer mismatches:', errors if errors else 'none — all 28 derived answers found in TBK option columns')
print('vocab:', [(lemmas[t]['greek'], lemmas[t]['gloss']) for t in TRANSLIT])
print('VTD item 26:', vtd_items[25]['greek'], vtd_items[25]['answer'])
print('PD spot:', pd_items[3]['greek'], '->', pd_items[3]['answer'])
print('spell spot:', spell_items[0], '|', spell_items[2])
print('SM10:', [(i['greek'], i['answer']) for i in smd_items])
