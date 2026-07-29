// SPELLING COMPARISON — shared by the word speller (SpellActivity) and the
// whole-verse speller (SpellVerseActivity), so the two can never drift.
//
// The policy is the one Nathanael selected at the 5D Phase 0 checkpoint:
//
//   With Accents OFF   accent/breathing/subscript-insensitive, case-
//                      insensitive, final sigma = sigma, punctuation
//                      optional, movable nu optional, whitespace normalized.
//   With Accents ON    every mark must be exactly right — and nothing else
//                      changes: still case-insensitive, still punctuation-
//                      optional, still movable-nu lenient.
//
// CASE IS NEVER REQUIRED, under either toggle, because the shared keyboard
// has no capitals and the Phase 0 decision was to keep it that way rather
// than add a shift layer. That is not only a chapter-3 concern: chapter 1's
// Χριστός and chapter 2's Π-/Φ- items have shipped since their cohorts with
// no way to type their capital, so "With Accents" ON was unwinnable on them.
// Folding case fixes those retroactively.

// Punctuation the checker may drop: the marks that appear in (or plausibly
// appear in) a Scripture Memory verse. U+0387 GREEK ANO TELEIA and U+00B7
// MIDDLE DOT are the same mark spelled two ways; NFC maps the former onto the
// latter, so both are listed for input typed before normalization.
const PUNCTUATION = /[.,;:!?'"()\[\]··;᾽’ʼ‘“”«»—–-]/gu;

export function stripPunctuation(text) {
  return (text || '').replace(PUNCTUATION, '');
}

// MOVABLE NU (divergence log D-16). Scoped deliberately to -σι(ν): that is the
// 3rd-plural case D-16 authorizes and the only one the chapter-3 data flags.
// The chapter text also mentions words ending in ε, but a blanket -ε(ν) fold
// would swallow the real 1st-plural ending: λύομεν would collapse to λύομε and
// the drill would accept a genuinely wrong form.
function foldMovableNu(word) {
  return word.replace(/σιν$/u, 'σι');
}

// One comparison key. Two spellings match iff their keys are equal.
export function spellingKey(text, options) {
  const {
    withAccents = false,
    punctuationOptional = true,
    movableNu = true
  } = options || {};
  let out = (text || '').normalize('NFC');
  if (punctuationOptional) out = stripPunctuation(out);
  out = out.replace(/\s+/gu, ' ').trim().toLowerCase();
  if (!withAccents) out = out.normalize('NFD').replace(/\p{M}/gu, '');
  out = out.replace(/ς/gu, 'σ').normalize('NFC');
  if (movableNu) out = out.split(' ').map(foldMovableNu).join(' ');
  return out;
}

export function spellingMatches(typed, answer, options) {
  return spellingKey(typed, options) === spellingKey(answer, options);
}

// Whole-verse comparison, word by word (spellVerse). Returns the index of the
// FIRST word that is wrong or missing, plus what was expected there — the
// component names that word rather than printing a bare index (D-13).
// A trailing run of extra typed words reports at answerWords.length.
export function checkVerse(typed, answerWords, options) {
  const expected = (answerWords || []).map(w => spellingKey(w, options));
  const got = spellingKey(typed, options).split(' ').filter(Boolean);
  for (let i = 0; i < expected.length; i++) {
    if (got[i] !== expected[i]) {
      return { ok: false, index: i, expected: answerWords[i], typed: got[i] || null };
    }
  }
  if (got.length > expected.length) {
    return { ok: false, index: expected.length, expected: null, typed: got[expected.length] };
  }
  return { ok: true, index: -1, expected: null, typed: null };
}
