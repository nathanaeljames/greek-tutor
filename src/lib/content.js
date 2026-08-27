// Content layer: loads the read-only JSON content and resolves references.
// Separation of concerns: this module owns all data lookups; components
// never reach into raw JSON shapes beyond what these helpers return.
//
// LAZY CHAPTERS (phase 5A): chapter content + its lexicon are per-chapter
// dynamic chunks, not static imports, so cold-start JS stays constant as
// chapters 2-28 land. toc.json and intro.json stay STATIC (the TOC and the
// intro pseudo-chapter must resolve with no chunk load). A module-level
// loaded-chapters registry holds { chapter, lexicon } per id; every getter
// below keeps its synchronous signature and reads from that registry.
// loadChapter(id) fills it and is awaited once at the App route gate — every
// caller below the gate stays sync.
//
// TREE-SHAKE GUARD (audit lesson, HANDOFF-4 B5): the glob maps below MUST be
// referenced from executed top-level code (they are: chapterLoaders /
// lexiconLoaders are built at import time). An unused glob export is
// tree-shaken and NO per-chapter chunk is emitted — silently. Do not let these
// maps become unreachable.

import toc from '../data/toc.json';
import intro from '../data/intro.json';
import spellerTiles from '../data/speller-tiles.json';
import { stripMarkup } from './markup.js';

// Per-chapter chunk loaders, keyed by chapter id. Vite emits one JS chunk per
// matched file and vite-plugin-pwa precaches each (audit-proven). Filenames are
// zero-padded with a dash (chapt-01.json); ids are underscore + unpadded number
// (chapt_1) — derive the id from the filename number so no per-chapter wiring
// is needed as files land. The lexicon glob tolerates BOTH the chapter-1 naming
// (lexicon-chapt01.json) and the 2+ pattern (lexicon-chapt-02.json).
const chapterModules = import.meta.glob('../data/chapt-*.json');
const lexiconModules = import.meta.glob('../data/lexicon-chapt*.json');

const chapterLoaders = {};   // 'chapt_1' -> () => import('../data/chapt-01.json')
const lexiconLoaders = {};   // 'chapt_1' -> () => import('../data/lexicon-chapt01.json')
for (const [path, loader] of Object.entries(chapterModules)) {
  const m = path.match(/chapt-(\d+)\.json$/);
  if (m) chapterLoaders[`chapt_${parseInt(m[1], 10)}`] = loader;
}
for (const [path, loader] of Object.entries(lexiconModules)) {
  const m = path.match(/lexicon-chapt-?(\d+)\.json$/);
  if (m) lexiconLoaders[`chapt_${parseInt(m[1], 10)}`] = loader;
}

// Loaded-chapters registry: id -> { chapter, lexicon }. The Introduction is a
// learn-only pseudo-chapter that stays STATIC (small, one-off) and is seeded
// here so it resolves through every helper the same way (routes, sequence,
// progress) with no load. Sections a chapter lacks (drill/exercise/quickReview)
// degrade to empty via the `ch[section] || []` guards throughout this module.
const registry = { intro: { chapter: intro, lexicon: null } };
const inflight = {};   // id -> in-flight loadChapter promise, memoized; reset on failure

export function getToc() { return toc; }

export function getSpellerTiles(_ref) { return spellerTiles; }

// Ids of chapters whose content is BUILT — derived from the glob key paths, so
// it answers WITHOUT loading any chunk (packs.js and the TOC depend on this
// being cheap). Intro first, then chapters in glob (path-sorted) order.
export function getBuiltChapterIds() { return ['intro', ...Object.keys(chapterLoaders)]; }

// True if a chapter's chunk is present in the registry (no load, no error).
export function isChapterLoaded(id) { return !!registry[id]; }

// Load a chapter + its lexicon together into the registry. Async, idempotent,
// memoizes the in-flight promise per id. On failure the memo is RESET so a
// retry can succeed (the getPacks rejected-promise-memoized-forever bug, B7).
// The chapter and lexicon resolve as ONE unit so flashcard/reviewVocab lookups
// never race a separately-loading lexicon.
export function loadChapter(id) {
  if (registry[id]) return Promise.resolve(registry[id]);
  if (inflight[id]) return inflight[id];
  const chLoader = chapterLoaders[id];
  if (!chLoader) return Promise.reject(new Error(`No content chunk for chapter "${id}"`));
  const lexLoader = lexiconLoaders[id];
  const p = Promise.all([chLoader(), lexLoader ? lexLoader() : Promise.resolve(null)])
    .then(([chMod, lexMod]) => {
      registry[id] = {
        chapter: chMod.default || chMod,
        lexicon: lexMod ? (lexMod.default || lexMod) : null
      };
      delete inflight[id];
      return registry[id];
    })
    .catch(err => {
      delete inflight[id];   // reset memo so a retry re-imports (B7 lesson)
      throw err;
    });
  inflight[id] = p;
  return p;
}

export function getChapter(id) {
  if (!id) return null;
  const entry = registry[id];
  if (entry) return entry.chapter;
  // Availability without a load is legitimate (TOC lists, getNextChapter).
  // A getter hit on a BUILT-but-unloaded chapter is a programming error under
  // the route gate — make it loud, not a silent undefined.
  if (isChapterAvailable(id)) console.error(`getChapter("${id}") before loadChapter — route gate missing?`);
  return null;
}

// Availability answers from the built set (glob keys + intro), NOT from what is
// currently loaded — the TOC and getNextChapter must flag a chapter available
// before its chunk is ever fetched.
export function isChapterAvailable(id) { return id === 'intro' || id in chapterLoaders; }

// Lemma lookup across LOADED lexicons (the route gate guarantees the active
// chapter's lexicon is loaded alongside its content). Optional chapter/pool
// context keeps duplicated refs bound to the active chapter's self-contained
// audio pack (chapter 2 deliberately mirrors chapter 1's first ten lemmas).
const LEMMA_BUCKETS = ['lemmas', 'exampleWords', 'ch1_lemma_mirror'];

function lemmaFromLexicon(lex, ref) {
  if (!lex) return null;
  for (const bucket of LEMMA_BUCKETS) {
    if (lex[bucket] && lex[bucket][ref]) return lex[bucket][ref];
  }
  return null;
}

export function getLemma(ref, chapterId, pool) {
  if (chapterId) {
    const lex = registry[chapterId] && registry[chapterId].lexicon;
    if (!lex) return null;
    if (pool && lex[pool] && lex[pool][ref]) return lex[pool][ref];
    return lemmaFromLexicon(lex, ref);
  }
  for (const id in registry) {
    const lemma = lemmaFromLexicon(registry[id].lexicon, ref);
    if (lemma) return lemma;
  }
  return null;
}

// A teaching page may opt into every audio-backed Greek form in its chapter
// with greekTaps:true. Build that map from the already-loaded chapter lexicon;
// this is a synchronous in-memory lookup, never an app-load store scan. Longer
// forms come first so a phrase (for example "ὁ λόγος") claims its full
// standalone match before either word can claim only part of it.
//
// 5F: a chapter may also declare INFLECTED forms that are not lemmas. Chapter
// 8's pronoun paradigms are set as running prose lines (μου, μοι, με …) with no
// lexicon entry of their own, so the activities that print them carry an
// `audioMap` of form -> clip. Those maps are folded in here so the Quick Review
// charts get the same taps as the Learn pages without either surface owning a
// private copy — the map is chapter data, not activity data, in everything but
// where the pipeline chose to write it.
export function getGreekTapMap(chapterId) {
  const entry = registry[chapterId];
  if (!entry) return {};
  const entries = [];
  const lex = entry.lexicon;
  if (lex) {
    for (const bucket of LEMMA_BUCKETS) {
      for (const lemma of Object.values(lex[bucket] || {})) {
        if (lemma && lemma.greek && lemma.audio) entries.push([lemma.greek, lemma.audio]);
      }
    }
  }
  for (const [form, audio] of Object.entries(chapterAudioMap(entry.chapter))) entries.push([form, audio]);
  entries.sort((a, b) => b[0].length - a[0].length);
  return Object.fromEntries(entries);
}

// Every activity-level `audioMap` in a chapter, merged. First declaration wins,
// so a form declared once cannot mean two clips on two pages.
// 5H: chapters 11 and 12 declare the same map one level DOWN, on the topic
// that prints the forms (the reflexive prose's αὐτός/ἀλλήλων, chapter 12's
// compound-verb and θέλω lines), because only one topic of a seven-topic page
// needs them. Both levels are read here, activity first, so a form still means
// one clip chapter-wide and neither placement is a special case downstream.
export function chapterAudioMap(chapter) {
  const map = {};
  if (!chapter) return map;
  const absorb = source => {
    for (const [form, audio] of Object.entries(source || {})) {
      if (form && audio && !map[form]) map[form] = audio;
    }
  };
  for (const section of SECTIONS) {
    for (const activity of chapter[section] || []) {
      absorb(activity.audioMap);
      for (const topic of activity.topics || []) absorb(topic.audioMap);
    }
  }
  return map;
}

// Reading People, Places and Letters pools (personalNames/placeNames/letterNames)
// from a chapter's lexicon. Pass the chapter id so multi-chapter loads resolve
// the RIGHT lexicon (reading-list keys repeat across chapters); falls back to
// the first loaded lexicon that has reading lists when no id is given.
export function getReadingLists(chapterId) {
  const entry = chapterId ? registry[chapterId] : null;
  let lex = entry ? entry.lexicon : null;
  if (!lex) {
    for (const id in registry) {
      const l = registry[id].lexicon;
      if (l && l.readingLists) { lex = l; break; }
    }
  }
  return (lex && lex.readingLists) || {};
}

export const SECTIONS = ['learn', 'drill', 'exercise', 'quickReview'];

export function getActivity(chapterId, activityId) {
  const ch = getChapter(chapterId);
  if (!ch) return null;
  for (const section of SECTIONS) {
    const hit = (ch[section] || []).find(a => a.id === activityId);
    if (hit) return { ...hit, section };
  }
  return null;
}

// Which chapter owns a given activity id (only loaded chapters are searched).
export function findChapterIdOfActivity(activityId) {
  for (const id in registry) {
    if (getActivity(id, activityId)) return id;
  }
  return null;
}

// The section key ('learn'|'drill'|'exercise'|'quickReview') an activity lives in.
export function sectionOfActivity(chapterId, activityId) {
  const a = getActivity(chapterId, activityId);
  return a ? a.section : null;
}

// Ordered activity ids for a chapter. Prefer the authored "sequence" (the
// original program's interleaved Sequential-Next order); otherwise fall back
// to the section concatenation learn -> drill -> exercise -> quickReview.
export function getSequence(chapterId) {
  const ch = getChapter(chapterId);
  if (!ch) return [];
  if (Array.isArray(ch.sequence) && ch.sequence.length) return ch.sequence.slice();
  const order = [];
  for (const section of SECTIONS) for (const a of ch[section] || []) order.push(a.id);
  return order;
}

// Position of an activity within its chapter's sequence. index === -1 means
// the activity is not part of the sequence (defensive; caller degrades).
export function getSequencePosition(chapterId, activityId) {
  const seq = getSequence(chapterId);
  const total = seq.length;
  const index = seq.indexOf(activityId);
  if (index === -1) return { index: -1, total, prevId: null, nextId: null };
  return {
    index,
    total,
    prevId: index > 0 ? seq[index - 1] : null,
    nextId: index < total - 1 ? seq[index + 1] : null
  };
}

// The next chapter after this one, per the global TOC, with availability.
// The intro pseudo-chapter precedes chapter 1, so its end-of-rail dialog can
// offer "Next chapter" into Chapter 1 (R8).
export function getNextChapter(chapterId) {
  const ch = getChapter(chapterId);
  if (!ch) return null;
  const list = toc.chapters || [];
  let next = null;
  if (toc.intro && chapterId === toc.intro.id) {
    next = list[0] || null;
  } else {
    const i = list.findIndex(c => c.id === chapterId);
    if (i === -1 || i + 1 >= list.length) return null;
    next = list[i + 1];
  }
  if (!next) return null;
  return { id: next.id, number: next.number, title: next.title, available: isChapterAvailable(next.id) };
}

// Resolve an activity's items into a uniform [{display, secondary, audio, meta}]
export function resolveItems(chapter, activity) {
  const vocabDisplay = lemma => ((activity.mode === 'flashcard' || activity.mode === 'reviewVocab')
    && lemma.lexicalForm) || lemma.greek;
  const src = activity.itemsFrom;
  if (src && src.startsWith('alphabet.letters')) {
    return chapter.alphabet.letters.map(l => ({
      display: pickDisplay(l, activity.display),
      secondary: l.name,
      audio: pickAudio(l, activity.play),
      meta: l
    }));
  }
  if (src === 'alphabet.diphthongs' || (src || '').startsWith('alphabet.diphthongs')) {
    return chapter.alphabet.diphthongs.map(d => ({
      display: d.greek, secondary: d.sound, audio: d.audio, meta: d
    }));
  }
  if (src === 'alphabet.iotaSubscripts') {
    return chapter.alphabet.iotaSubscripts.map(d => ({
      display: d.greek, secondary: d.sound, audio: d.audio, meta: d
    }));
  }
  if (src === 'alphabet.vowels') {
    const v = chapter.alphabet.vowels;
    const byChar = {};
    for (const l of chapter.alphabet.letters) byChar[l.lower] = l;
    const mk = (g, label, group) => {
      const l = byChar[g] || {};
      return { display: g, secondary: label, audio: l.audioShort || null, meta: l, group };
    };
    const rows = [];
    for (const g of v.short) rows.push(mk(g, 'Short', 'short'));
    for (const g of v.longOrShort) rows.push(mk(g, 'Long or Short', 'longOrShort'));
    for (const g of v.long) rows.push(mk(g, 'Long', 'long'));
    return rows;
  }
  if (Array.isArray(activity.items)) {
    return activity.items.map(item => {
      if (item.ref) {
        const lemma = getLemma(item.ref, chapter.id, item.pool);
        return lemma ? {
          display: vocabDisplay(lemma), secondary: stripMarkup(lemma.gloss), audio: lemma.audio,
          meta: { ...lemma, ref: item.ref }
        } : { display: item.ref, secondary: '(missing lemma)', audio: null, meta: {} };
      }
      return { display: item.display || '(Greek text — extraction pending)', secondary: stripMarkup(item.answer) || '',
               audio: item.audio || null, meta: item };
    });
  }
  // 5F convention: pool "senses" is the CASE-SPLIT vocabulary surface. See
  // sensePool() for why it is not simply "one card per sense".
  if (activity.pool === 'senses') {
    return sensePool(chapter).map(card => ({
      display: card.display, secondary: stripMarkup(card.gloss), audio: card.audio, meta: card
    }));
  }
  // 5D convention: instead of spelling out ten {ref} items, an activity names
  // a lexicon BUCKET (pool: "lemmas") and the chapter's own vocab list
  // supplies the refs. Same resolved shape, so flashcard and reviewVocab are
  // untouched.
  if (activity.pool || (activity.promptFrom && activity.promptFrom.lexicon)) {
    return lemmaPool(chapter, activity).map(lemma => ({
      display: vocabDisplay(lemma), secondary: stripMarkup(lemma.gloss), audio: lemma.audio, meta: lemma
    }));
  }
  return [];
}

// The lemma list a vocabulary surface works over: either an explicit items
// array (chapters 1-2) or a named lexicon bucket over the chapter's vocab
// refs (chapter 3 onward). Both yield { ref, ...lemma } records.
function lemmaPool(chapter, activity) {
  if (Array.isArray(activity.items) && activity.items.length) {
    return activity.items.map(item => {
      const ref = typeof item === 'string' ? item : item.ref;
      const pool = typeof item === 'string' ? null : item.pool;
      return { ref, ...(getLemma(ref, chapter.id, pool) || {}) };
    });
  }
  const bucket = activity.pool || (activity.promptFrom && activity.promptFrom.lexicon) || 'lemmas';
  return (chapter.vocab || []).map(ref => ({ ref, ...(getLemma(ref, chapter.id, bucket) || {}) }));
}

// THE CASE-SPLIT VOCABULARY POOL (5F). Chapters 6 and 8 present more cards
// than they have lemmas, and they do it in two different ways which the
// lexicon records in one field, `senses[]`:
//
//   caseTag SET      the lemma is split BY CASE and each sense is its own card
//                    (chapter 6's διά/κατά/μετά/περί twice and ἐπί three times;
//                    chapter 8's παρά three ways and ὑπό two).
//   caseTag NULL     the senses are the lemma's own paired FORMS, printed on
//                    ONE card (chapter 8's ἐγώ/ἡμεῖς and σύ/ὑμεῖς, whose
//                    lexicalForm is already "ἐγώ / ἡμεῖς").
//
// So the rule is "one card per caseTag, plus one card for the untagged
// remainder", not "one card per sense" — which is what makes chapter 6 sixteen
// cards over ten lemmas and chapter 8 thirteen over ten while both drills
// legitimately list fifteen entries from their own authored items.
function sensePool(chapter) {
  const cards = [];
  for (const ref of chapter.vocab || []) {
    const lemma = getLemma(ref, chapter.id, 'lemmas');
    if (!lemma) continue;
    const senses = Array.isArray(lemma.senses) && lemma.senses.length ? lemma.senses : [null];
    let untaggedTaken = false;
    // 5H: the Review Vocabulary Chart prints each word's NT frequency after
    // its translation, and `showNtFreq` says so — but the number lives on the
    // LEMMA and this pool hands the surface a CARD, so every senses-pool
    // review chart (chapters 9, 10, 11 and 12) has been printing glosses with
    // no numbers at all. A case-split lemma carries the count ONCE, on its
    // first card: the original sets "ὑπέρ  for, about (gen.)(150)" over
    // "above, beyond (acc.)" with no second number (ch11railwalk p20).
    let freqTaken = false;
    const freqFor = () => {
      if (freqTaken || lemma.ntFreq == null) return null;
      freqTaken = true;
      return lemma.ntFreq;
    };
    for (const sense of senses) {
      if (!sense || !sense.caseTag) {
        if (untaggedTaken) continue;          // the paired forms share one card
        untaggedTaken = true;
        cards.push({
          ref, lemma, sense,
          display: lemma.lexicalForm || lemma.greek,
          greek: lemma.greek,
          gloss: lemma.gloss || lemma.glossShort || '',
          ntFreq: freqFor(),
          audio: (sense && sense.audio) || lemma.audio || null
        });
        continue;
      }
      cards.push({
        ref, lemma, sense,
        // THE CASE TAG GOES WITH THE GREEK, not with the gloss. The rail walk
        // settles it: chapter 6's Learn Vocabulary card reads
        // "Greek Word: ἀπό (with gen.)" over "Word Meaning: from", and the
        // Greek-to-English drill prints "ἐπί (with dat.)" as its prompt
        // (ch6railwalk p10). Chapter 8's lexicalForm for παρά is already
        // "παρά (with gen.)", which is the same convention written out.
        // The bare form is kept in `greek` so a surface that wants the
        // headword alone still has it.
        display: [sense.greek || lemma.greek, sense.caseTag].filter(Boolean).join(' '),
        greek: sense.greek || lemma.greek,
        caseTag: sense.caseTag || null,
        gloss: sense.gloss || sense.glossShort || '',
        ntFreq: freqFor(),
        audio: sense.audio || lemma.audio || null
      });
    }
  }
  return cards;
}

function pickDisplay(letter, mode) {
  switch (mode) {
    case 'upper': return letter.upper;
    case 'lower+translit': return `${letter.lower} = ${letter.translit}`;
    case 'lower=upper': return `${letter.lower} = ${letter.upper}`;
    default: return letter.lower;
  }
}

function pickAudio(letter, mode) {
  return letter[pickAudioField(mode)];
}

// Map a play-mode name to the letter field that holds its audio id. Letter
// pools default to audioShort (the ~1s A_*N "name only" clips) — chart taps
// and scored prompts speak the NAME, not the full name-and-sound clip.
function pickAudioField(mode) {
  switch (mode) {
    case 'audioName': return 'audioName';
    case 'audioFull': return 'audioFull';
    case 'audioShort':
    default: return 'audioShort';
  }
}

// N-STAGE SELECT (5F §2.9, chapter 8's Personal Pronoun Case Drill; generalized
// to any number of stages by 5G-SPEC1 §4.1). The item asks for a TUPLE — the
// person column then the case-and-number grid in chapter 8; tense, then voice,
// then person-and-number in chapter 10 — and the answer is a list in the same
// order as `optionStages`. Nothing below counts the stages: the builder maps
// whatever `optionStages` holds, and the surface commits when the last empty
// stage is filled, so the three-stage drill needed no new commit rule.
//
// Nothing here decides when an attempt is judged; that is the surface's job
// and rule B1a's (VERIFY-5F item 7: the learner may change their mind on the
// person as often as they like and only the LAST stage commits). This builder
// only says what the stages are, what is acceptable, and what the item plays.
//
// `answerAlt` is a list of ADDITIONAL acceptable pairs, not a near miss:
// αὐτά prints in both the neuter nominative plural and the neuter accusative
// plural and the original grades both right (VERIFY-5F item 8), so the
// accepted set is answer + answerAlt and the feedback is the correct path.
export function buildTwoStageQuestions(chapter, activity) {
  const stages = (activity.optionStages || []).map(stage => ({
    label: stage.label || '',
    // A stage that declares no layout is a plain COLUMN of its values — which
    // is what the original draws and what the instruction line calls it ("click
    // on the person then the case"). Left to the density heuristic, "Second
    // Person" would come out two-up and the person stage would read as part of
    // the 2x4 case grid under it rather than as the click before it.
    optionClass: stage.layout
      ? optionClassForLayout(stage.layout, activity, [], [])
      : (Array.isArray(stage.optionGroups) && stage.optionGroups.length ? 'grouped' : 'single'),
    // 5G-SPEC1 §4.1: a stage may split its own values into separated groups,
    // exactly as an activity-level optionGroups does. Chapter 10's person /
    // number stage declares [2, 2, 2] and the original draws it as three
    // paired rows (First Singular | First Plural, and so on).
    optionGroups: Array.isArray(stage.optionGroups) ? stage.optionGroups : null,
    options: (stage.values || []).map(value => ({ id: String(value), label: String(value) }))
  }));
  const pairKey = list => (list || []).map(value => String(value)).join(' ');
  const questions = shuffle((activity.items || []).map(item => {
    const answer = Array.isArray(item.answer) ? item.answer.map(String) : null;
    // Every acceptable pair, the authored one first. `accepted` is the same
    // set keyed for a single lookup on the commit.
    const pairs = [];
    if (answer) pairs.push(answer);
    for (const alt of item.answerAlt || []) if (Array.isArray(alt)) pairs.push(alt.map(String));
    return {
      prompt: stripMarkup(item.greek) || '',
      note: stripMarkup(item.note) || null,
      promptAudio: item.audio || null,
      citation: item.ref || null,
      // What the Translate button reveals. Chapter 8's case drill carries no
      // translations and shows no Translate control; chapter 10's parsing
      // drill carries both, and without this the button rendered permanently
      // disabled — a control the original has, that does nothing.
      translate: stripMarkup(item.translate) || null,
      gloss: stripMarkup(item.gloss) || null,
      // A parsing form may route Hint to a chart specific to that form.
      // Preserve the override through the shuffle; the surface falls back to
      // the drill-level reference when this is absent.
      hintRef: item.hintRef,
      answer,
      pairs,
      accepted: new Set(pairs.map(pairKey)),
      pending: !item.greek || !answer || answer.length !== stages.length
    };
  }));
  return { stages, questions, promptIsGreek: activity.promptIsGreek !== false, pairKey };
}

// Build question list for a select activity (generator- or items-based).
export function buildSelectQuestions(chapter, activity) {
  if (activity.generator) {
    const pool = chapter.alphabet.letters;
    const promptField = activity.generator.prompt;
    const optionField = activity.generator.options;
    // Letter prompts/Pronounce play the name-only clip. Honor an explicit
    // generator.promptAudio if a pool ever needs the full clip; default short.
    const audioField = pickAudioField(activity.generator.promptAudio || 'audioShort');
    const options = pool.map(l => ({ id: l.name, label: l[optionField] }));
    const questions = shuffle(pool.map(l => ({
      prompt: l[promptField],
      promptAudio: l[audioField],
      answerId: l.name
    })));
    // Greek-tap rule (P6-P9): the generator — not a glyph heuristic — declares
    // whether the prompt is displayed Greek (tappable, pronounces itself).
    // 'lower'/'upper' prompts are Greek letters; 'name'/'translit' are English.
    return { options, questions, optionClass: 'wide', promptIsGreek: promptField === 'lower' || promptField === 'upper' };
  }

  // AUTHORED-OPTION drills: the option set comes from the data rather than
  // from a lexicon-derived answer grid. Two flavours share this branch —
  // activity-level optionValues (one grid for the whole drill: chapter 2's
  // four drills, chapter 3's Parsing and Scripture Memory drills) and
  // PER-ITEM options (5D: the Verb Translating drill's six verb-family
  // translations, the Greek Verb Drill's three Greek forms). An item's own
  // optionValues/options win; the activity-level set is the fallback, so a
  // drill may mix the two. Missing prompt/answer fields remain in the sequence
  // as visible pending-verification questions instead of becoming bad answers.
  // 5F: `options` is the pipeline's own name for where the option set comes
  // from — "static" (the activity's optionValues) or "perItem" (each item's
  // own options[]). Both land in this branch; treating "perItem" as anything
  // else drops the drill into the lexicon-vocabulary path below, which for the
  // three translation drills would silently build ten Greek options out of the
  // chapter's lemma list instead of the three the item ships.
  if (authoredOptionSource(activity)) {
    // Chapters 4 and 5 carry the prompt inline on the item with no
    // promptFrom. Without this fallback every item resolves to
    // pending:true and the whole drill renders as a pending placeholder --
    // silently, which is how it would survive a "did the card render"
    // check. An explicit promptFrom still wins; this only fires when the
    // activity declares none and the items carry `sentence`.
    const impliedSentence = !activity.promptFrom
      && Array.isArray(activity.items)
      && activity.items.some(it => it && it.sentence != null);
    const promptField = (activity.promptFrom && activity.promptFrom.show)
      || (impliedSentence ? 'sentence' : null);
    // 5D: an activity may DECLARE its prompt side rather than implying it via
    // promptFrom (the ch3 drills have no promptFrom — their prompts are inline
    // on the items). Same Greek-tap contract either way: declared, never
    // guessed from the glyphs.
    const promptIsGreek = activity.promptIsGreek != null ? !!activity.promptIsGreek : promptField === 'greek';
    const toOptions = values => (values || []).map(value => ({ id: String(value), label: String(value) }));
    const options = toOptions(activity.optionValues);
    const questions = shuffle((activity.items || []).map(item => {
      const lemma = item.ref ? getLemma(item.ref, chapter.id, item.pool) : null;
      const prompt = promptField === 'sentence'
        ? item.sentence
        : promptIsGreek
          ? (item.greek || (lemma && lemma.greek))
          : (item.prompt != null ? item.prompt : (promptField ? item[promptField] : undefined));
      const needsUnderline = promptField === 'sentence' && !item.underline;
      const itemOptions = item.optionValues || item.options;
      const reveals = {};
      for (const button of activity.revealButtons || []) {
        if (button && button.field && item[button.field] != null) {
          reveals[button.field] = stripMarkup(item[button.field]);
        }
      }
      return {
        prompt: stripMarkup(prompt) || '',
        // 5F §2.7: a translation-drill prompt may be set over TWO lines, with
        // the second null on the items that are one line only. It is a line
        // break in the authored prompt, not a second prompt — one clip, one
        // tap target — so it travels beside `prompt` and the surface joins them.
        prompt2: stripMarkup(item.greek2) || null,
        // 5F §2.5: the case tag / parse tag / disambiguator printed beside the
        // prompt in plain ink. Never a tap target even when it holds Greek —
        // the `(not ἐκ)` case is the logged exception to directive 9.
        note: stripMarkup(item.note) || null,
        promptAudio: promptIsGreek ? (item.promptAudio || item.audio || (lemma && lemma.audio) || null) : null,
        // The answer's OWN clip, for surfaces where Pronounce speaks the
        // answer rather than the prompt (Greek Verb Drill: English prompt,
        // Greek answer). Never played before the item is finalized.
        answerAudio: promptIsGreek ? null : (item.audio || null),
        answerId: item.answer == null ? null : String(item.answer),
        options: itemOptions ? toOptions(itemOptions) : null,
        underline: stripMarkup(item.underline) || null,
        // `ref` is overloaded in the data: chapter 2's syllable drill uses it
        // as a LEXICON key, chapter 3's drills as a scripture citation to
        // print beside the prompt. Whether it resolved to a lemma is the
        // discriminator — no id-keyed special case needed.
        citation: !lemma && item.ref ? item.ref : null,
        // Revealed once the item is finalized (one-attempt drills): the gloss,
        // the properly accented form (Accent Rule), and which grapheme cluster
        // carries the mark being asked about (Marking Recognition).
        gloss: stripMarkup(item.gloss || (lemma && (lemma.glossShort || lemma.gloss))) || null,
        // 5D: what the Translate button reveals under the prompt. Distinct
        // from `gloss`, which chapter 2's one-attempt drills reveal on their
        // own once an item is answered — a translation is shown on request.
        translate: stripMarkup(item.translate) || null,
        hintRef: item.hintRef,
        reveals,
        correctForm: item.correctForm || null,
        redMarkCluster: item.redMarkCluster || null,
        pending: !prompt || item.answer == null || needsUnderline
      };
    }));
    return { options, questions, optionClass: optionClassFor(activity, options, questions), promptIsGreek };
  }

  // Vocabulary drills: options are the full lemma set. Both drills show the
  // SHORT gloss ("truly, verily", "and, even", "Christ"); the full gloss +
  // ntFreq is reserved for the Review Vocabulary Chart.
  const lemmas = lemmaPool(chapter, activity);
  // Chapters 1-2 declare the prompt side with `prompt`; chapter 3 declares it
  // as promptFrom.show. Either way it is DECLARED — the Greek-tap rule may
  // never be inferred from the glyphs (P6-P9).
  const promptSide = activity.prompt
    ? (activity.prompt === 'greek' ? 'greek' : 'gloss')
    : ((activity.promptFrom && activity.promptFrom.show) === 'greek' ? 'greek' : 'gloss');
  const optionSide = promptSide === 'greek' ? 'gloss' : 'greek';
  const label = (l, side) => (side === 'gloss' ? (l.glossShort || l.gloss) : l.greek);
  const options = lemmas.map(l => ({ id: l.ref, label: label(l, optionSide) }));
  const questions = shuffle(lemmas.map(l => ({
    prompt: label(l, promptSide),
    promptAudio: l.audio,
    answerId: l.ref
  })));
  // Gk->En: the Greek prompt word is tappable (plays the lemma). En->Gk: the
  // English prompt stays untappable; its Greek OPTIONS are answers, never taps.
  return { options, questions, optionClass: '', promptIsGreek: promptSide === 'greek' };
}

// True when the option set is AUTHORED rather than derived from a lexicon
// pool: an activity-level optionValues grid, per-item options, or the
// pipeline's own `options` declaration ("static" / "perItem"). Exported so the
// surface can ask the same question the builder did instead of re-deriving it.
export function authoredOptionSource(activity) {
  return !!activity.optionsPerItem
    || Array.isArray(activity.optionValues)
    || activity.options === 'perItem'
    || activity.options === 'static'
    || (Array.isArray(activity.items) && activity.items.some(item => item && Array.isArray(item.options)));
}

// Option-grid density, from the data — never from the activity id.
//   grouped  the drill declares optionGroups ([3,3]); the component lays the
//            groups out as separate stacks (ch3 Parsing).
//   single   labels too long for two columns (ch2's Accent Rule sentences,
//            ch3's six full parsings), or a per-item GREEK option set, which
//            the original stacks (ch3 Greek Verb Drill's three forms).
//   wide     four-up, for number/one-glyph tiles only (ch2 syllable counting).
//   ''       the two-column default: ch2's mark and part-of-speech grids,
//            ch3's 2x3 verb translations and 2x5 Scripture Memory grid.
function optionClassFor(activity, activityOptions, questions) {
  return optionClassForLayout(activity.optionLayout, activity, activityOptions, questions);
}

// 5F: `stack1col` is the pipeline's name for the one-column stack the port
// already calls `single` — the three translation drills' full-sentence options.
// Named here rather than aliased in the data so the data keeps the pipeline's
// own vocabulary and the renderer keeps its own.
function optionClassForLayout(layout, activity, activityOptions, questions) {
  if (layout === 'single' || layout === 'stack1col') return 'single';
  if (layout === 'paradigm2col') return 'paradigm2col';
  if (Array.isArray(activity.optionGroups) && activity.optionGroups.length) return 'grouped';
  if (activity.optionsPerItem && activity.optionsAreGreek) return 'single';
  const all = activityOptions.length
    ? activityOptions
    : questions.reduce((acc, q) => acc.concat(q.options || []), []);
  const longest = all.reduce((n, option) => Math.max(n, option.label.length), 0);
  if (longest > 24) return 'single';
  return longest <= 3 ? 'wide' : '';
}

// THE TOGGLE LABELS OF A TWO-STATE HINT (5G-SPEC3, DISCLOSURE-RULES 4.1).
// If a one-word contrast exists that is meaningful without the noun, the
// toggle reads that word; otherwise it falls back to More/Back. The three
// shipped pairs each differ in EXACTLY ONE word of their titles, and that
// word IS the contrast the rule asks for:
//   Present [Middle] Indicative Paradigm  / Present [Passive] Indicative Paradigm
//   Future [Active] Indicative Paradigm   / Future [Middle] Indicative Paradigm
//   [Present] Active Indicative of eimi   / [Future] Active Indicative of eimi
// So the label is DERIVED from the titles the data already carries rather
// than authored beside them: a second place to write "Passive" is a second
// place for it to disagree with the chart it names. Titles that do not
// differ in exactly one word get More/Back, the rule's own fallback.
// The returned array is indexed BY STATE: entry i is the contrast word of
// title i. Callers index it by the TARGET state, so the button names where
// it goes, not where it is.
export function paradigmToggleLabels(titles) {
  const words = (titles || []).map(title => String(title || '').trim().split(/\s+/));
  const fallback = (titles || []).map((_, index) => (index === 0 ? 'Back' : 'More'));
  if (words.length !== 2 || words[0].length !== words[1].length || !words[0].length) return fallback;
  const differing = words[0].map((word, index) => word !== words[1][index]).reduce(
    (found, differs, index) => (differs ? [...found, index] : found), []);
  if (differing.length !== 1) return fallback;
  const at = differing[0];
  return [words[0][at], words[1][at]];
}

// A hintRef names a chart source in the chapter: an existing chart by id/type/
// title, or a chapter-level hintCharts entry. Chapter 3's three verb drills all
// open the same λύω paradigm the Learn page draws; later composite entries may
// bundle referenced or inline paradigms for a surface-specific disclosure.
export function resolveHintRef(chapter, ref) {
  if (!chapter || !ref) return null;
  // A chapter-level `hintCharts` register names a COMPOSITE hint: one popup
  // holding several paradigms, either referenced by id (`paradigmRefs`) or
  // authored inline (`charts`). It resolves to one `paradigms[]` bundle whose
  // surface chooses the disclosure policy. Checked FIRST, so a composite id can never be
  // shadowed by an activity or topic that happens to share its name.
  const composite = chapter.hintCharts && chapter.hintCharts[ref];
  if (composite) {
    // Composites either reference charts authored elsewhere in the chapter or
    // own inline paradigm blocks. Normalize both forms to the same bundle.
    const paradigms = Array.isArray(composite.charts) && composite.charts.length
      ? composite.charts.filter(Boolean)
      : (composite.paradigmRefs || [])
        .map(chartRef => resolveHintRef(chapter, chartRef))
        .filter(Boolean);
    if (!paradigms.length) return null;
    if (paradigms.length === 1) return paradigms[0];
    return { paradigms, title: composite.title || null };
  }
  let found = null;
  const nestedParadigm = node => {
    let chart = null;
    const scan = value => {
      if (chart || !value) return;
      if (Array.isArray(value)) { value.forEach(scan); return; }
      if (typeof value !== 'object') return;
      if (value.type === 'paradigm' || value.type === 'pronounParadigm') { chart = value; return; }
      for (const child of Object.values(value)) scan(child);
    };
    scan(node);
    return chart;
  };
  // 5F: a hintRef may name the chart by its TITLE rather than by a block type
  // or a topic id — chapter 7's Adjective Case Drill points at
  // "adjectiveParadigm", which is the slug of the Review page's own
  // "Adjective Paradigm". Same slug convention resolveHintBlocks already uses
  // for headings, and it is tried only after the exact-id search below fails,
  // so no chapter that already resolves can change.
  const byTitle = () => {
    for (const section of SECTIONS) {
      for (const candidate of chapter[section] || []) {
        const charts = candidate.paradigm ? [candidate.paradigm] : (candidate.paradigms || []);
        for (const chart of charts) {
          for (const title of [candidate.chartTitle, chart && chart.title]) {
            if (title && slugOf(title) === ref) return chart;
          }
        }
      }
    }
    return null;
  };
  const walk = node => {
    if (found || !node) return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (typeof node !== 'object') return;
    if (node.type === ref) { found = node; return; }
    // Chapter 4+ drills point at the authored TOPIC which owns their paradigm,
    // not at a globally unique block type. Resolve the topic generically and
    // return its nested paradigm; no activity id enters the renderer contract.
    if (node.id === ref) {
      // A Review page carries its chart as a bare `paradigm` OBJECT with no
      // block type of its own (mode: paradigmChart) — 5F-FEEDBACK2 item 13
      // points a hint page at c7_qr_adjectives, so an id match falls through
      // to that field when no typed block is nested.
      found = nestedParadigm(node)
        || (node.paradigm && typeof node.paradigm === 'object' ? node.paradigm : null);
      if (found) return;
    }
    for (const key of Object.keys(node)) walk(node[key]);
  };
  for (const section of SECTIONS) walk(chapter[section]);
  return found || byTitle();
}

// ---- HEADING DEDUPLICATION (5E-R1, generalized in 5G) ----
//
// A teaching page prints its TOPIC title and, under it, the chart's own title.
// In the original those two live in different places — the radio rail at the
// left and the yellow panel's heading — and the port stacks them, so where
// they say the same thing it must print one heading, not two.
//
// TWO relationships, both of them the same heading said at two lengths:
//   EQUAL after folding    chapter 5's "First Declension—Masc" over
//                          "First Declension—Masculine". The chart's title is
//                          dropped and the topic's stands (device-verified,
//                          unchanged since 5E).
//   COVERED               chapters 9 and 10's "Present Middle Paradigm" over
//                          "Present Middle Indicative Paradigm". The chart's
//                          title is the FULLER one and it is the one the
//                          original prints in its panel, so the HOST drops its
//                          heading and the chart's stands.
// Both live here because two hosts need them and two copies of a fold rule is
// exactly how the em-dash regression happened (5E-SPEC3-RESPONSE item 1).
export function headingKey(text) {
  return String(text || '').trim().toLowerCase()
    .replace(/—|–|--/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/\bmasc\b/, 'masculine');
}

// True when `outer` says everything `inner` says, in order, and more of it.
// Word-subsequence rather than prefix: the extra word lands in the MIDDLE
// ("Present Middle [Indicative] Paradigm"), which is where the original's
// panel headings put it.
export function headingCovers(outer, inner) {
  if (!outer || !inner) return false;
  const outerWords = headingKey(outer).split(' ').filter(Boolean);
  const innerWords = headingKey(inner).split(' ').filter(Boolean);
  if (outerWords.length <= innerWords.length) return false;
  let at = 0;
  for (const word of innerWords) {
    at = outerWords.indexOf(word, at) + 1;
    if (at === 0) return false;
  }
  return true;
}

// The camelCase slug the data uses to name a page from elsewhere: hint refs,
// and the popup ids chapter 8's Three Uses page links to from its own
// underlined labels. Trailing punctuation is dropped so a label that ends in a
// quote ('Adjective meaning "same"') keys the same as its id.
export function slugOf(text) {
  return String(text || '')
    .replace(/[^A-Za-z0-9]+$/, '')
    .replace(/[^A-Za-z0-9]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^[A-Z]/, c => c.toLowerCase());
}

// An activity's Hint either carries its own blocks or REFERS to a chart that
// already exists elsewhere in the chapter (the Syllable Counting drill and the
// Division exercise both open the Three Syllable Rules). Resolving the
// reference keeps the hint from duplicating -- or inventing -- authored copy.
export function resolveHintBlocks(chapter, hint) {
  if (!hint) return [];
  if (Array.isArray(hint.content)) return hint.content;
  if (!hint.contentRef) return [];
  const toRef = text => (text || '').replace(/[^A-Za-z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^[A-Z]/, c => c.toLowerCase());
  for (const section of SECTIONS) {
    for (const candidate of chapter[section] || []) {
      const blocks = candidate.content || [];
      if (blocks.some(block => block.type === 'heading' && toRef(block.text) === hint.contentRef)) return blocks;
    }
  }
  return [];
}

// A hint PAGE may reuse a Learn topic's whole content array by that topic's id
// (5F-FEEDBACK2 item 28: the Aὐτός Translation Drill's last hint page is the
// Three Uses teaching page). Resolving by id keeps the hint from duplicating —
// or drifting from — the authored page, same principle as resolveHintBlocks.
export function resolveContentById(chapter, ref) {
  if (!chapter || !ref) return [];
  let found = null;
  const walk = node => {
    if (found || !node) return;
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (typeof node !== 'object') return;
    if (node.id === ref && Array.isArray(node.content)) { found = node.content; return; }
    for (const key of Object.keys(node)) walk(node[key]);
  };
  for (const section of SECTIONS) walk(chapter[section]);
  return found || [];
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function randomFeedback(chapter, kind) {
  const pool = (chapter.feedback && chapter.feedback[kind]) || [];
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : (kind === 'correct' ? 'Correct' : 'Try again');
}
