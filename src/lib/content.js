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
          display: lemma.greek, secondary: lemma.gloss, audio: lemma.audio,
          meta: { ...lemma, ref: item.ref }
        } : { display: item.ref, secondary: '(missing lemma)', audio: null, meta: {} };
      }
      return { display: item.display || '(Greek text -- extraction pending)', secondary: item.answer || '',
               audio: item.audio || null, meta: item };
    });
  }
  return [];
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

  // Static-option drills use authored optionValues rather than a lexicon-
  // derived answer grid. Missing prompt/answer fields remain in the sequence
  // as visible pending-verification questions instead of becoming bad answers.
  if (Array.isArray(activity.optionValues)) {
    const promptField = activity.promptFrom && activity.promptFrom.show;
    const promptIsGreek = promptField === 'greek';
    const options = activity.optionValues.map(value => ({ id: String(value), label: String(value) }));
    const questions = shuffle((activity.items || []).map(item => {
      const lemma = item.ref ? getLemma(item.ref, chapter.id, item.pool) : null;
      const prompt = promptField === 'sentence'
        ? item.sentence
        : promptField === 'greek'
          ? (item.greek || (lemma && lemma.greek))
          : item[promptField];
      const needsUnderline = promptField === 'sentence' && !item.underline;
      return {
        prompt: prompt || '',
        promptAudio: promptIsGreek ? (item.promptAudio || item.audio || (lemma && lemma.audio) || null) : null,
        answerId: item.answer == null ? null : String(item.answer),
        underline: item.underline || null,
        pending: !prompt || item.answer == null || needsUnderline
      };
    }));
    const optionClass = options.every(option => option.label.length <= 8) ? 'wide' : '';
    return { options, questions, optionClass, promptIsGreek };
  }

  // items-based (vocabulary drills): options are the full lemma set. Both
  // drills show the SHORT gloss ("truly, verily", "and, even", "Christ");
  // the full gloss + ntFreq is reserved for the Review Vocabulary Chart.
  const lemmas = (activity.items || []).map(item => {
    const ref = typeof item === 'string' ? item : item.ref;
    const pool = typeof item === 'string' ? null : item.pool;
    return { ref, ...(getLemma(ref, chapter.id, pool) || {}) };
  });
  const promptSide = activity.prompt === 'greek' ? 'greek' : 'gloss';
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
