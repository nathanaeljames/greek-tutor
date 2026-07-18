// Content layer: loads the read-only JSON content and resolves references.
// Separation of concerns: this module owns all data lookups; components
// never reach into raw JSON shapes beyond what these helpers return.

import toc from '../data/toc.json';
import chapt1 from '../data/chapt-01.json';
import intro from '../data/intro.json';
import lexicon from '../data/lexicon-chapt01.json';

// The Introduction is a learn-only pseudo-chapter registered alongside real
// chapters; it resolves through every content helper the same way (routes,
// sequence, progress). Sections it lacks (drill/exercise/quickReview) degrade
// to empty via the `ch[section] || []` guards throughout this module.
const chapters = { intro, chapt_1: chapt1 };

export function getToc() { return toc; }

// Ids of chapters whose content is actually built (drives which audio packs
// surface on chapter hubs — Settings' "Download all" still covers everything).
export function getBuiltChapterIds() { return Object.keys(chapters); }

export function getChapter(id) { return chapters[id] || null; }

export function isChapterAvailable(id) { return id in chapters; }

export function getLemma(ref) { return lexicon.lemmas[ref] || null; }

// Reading People, Places and Letters pools (personalNames/placeNames/letterNames).
export function getReadingLists() { return lexicon.readingLists || {}; }

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
  for (const id of Object.keys(chapters)) {
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
        const lemma = getLemma(item.ref);
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
    return { options, questions, optionClass: 'wide' };
  }
  // items-based (vocabulary drills): options are the full lemma set. Both
  // drills show the SHORT gloss ("truly, verily", "and, even", "Christ");
  // the full gloss + ntFreq is reserved for the Review Vocabulary Chart.
  const lemmas = (activity.items || []).map(ref => ({ ref, ...getLemma(ref) }));
  const promptSide = activity.prompt === 'greek' ? 'greek' : 'gloss';
  const optionSide = promptSide === 'greek' ? 'gloss' : 'greek';
  const label = (l, side) => (side === 'gloss' ? (l.glossShort || l.gloss) : l.greek);
  const options = lemmas.map(l => ({ id: l.ref, label: label(l, optionSide) }));
  const questions = shuffle(lemmas.map(l => ({
    prompt: label(l, promptSide),
    promptAudio: l.audio,
    answerId: l.ref
  })));
  return { options, questions, optionClass: '' };
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
