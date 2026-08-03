// SPELLING COMPARISON — shared by the word speller (SpellActivity) and the
// whole-verse speller (SpellVerseActivity), so the two can never drift.
//
// The policy is the one Nathanael selected at the 5D Phase 0 checkpoint:
//
//   With Accents OFF   accent/breathing/subscript-insensitive, case-
//                      insensitive, final sigma = sigma, punctuation
//                      optional, whitespace normalized.
//   With Accents ON    every mark must be exactly right — and nothing else
//                      changes: still case-insensitive, still punctuation-
//                      optional.
//
// THERE IS NO MOVABLE-NU LENIENCY (D-16 WITHDRAWN, 5D-SPEC2 §2). A final nu is
// compared like any other letter. The leniency that used to live here existed
// to cover a DERIVATION ERROR — the assembler produced λύουσιν where the
// original authors λύουσι — not a linguistic subtlety. The original's own
// OpenScript answer tables author one form per item (item 3 `lu<ousi`, item 15
// `le<gousi`, item 24 `pisteuousi`), the delivered data now carries them, and
// the assembler fails if a derived form disagrees with a recovered one.
// Movable nu is real Greek and the chapter teaches it, but it is a per-word
// authored choice, never a checker rule. Do not re-introduce it.
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

// One comparison key. Two spellings match iff their keys are equal.
export function spellingKey(text, options) {
  const {
    withAccents = false,
    punctuationOptional = true
  } = options || {};
  let out = (text || '').normalize('NFC');
  if (punctuationOptional) out = stripPunctuation(out);
  out = out.replace(/\s+/gu, ' ').trim().toLowerCase();
  if (!withAccents) out = out.normalize('NFD').replace(/\p{M}/gu, '');
  out = out.replace(/ς/gu, 'σ').normalize('NFC');
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
