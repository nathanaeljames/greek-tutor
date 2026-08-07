// SPELLING COMPARISON — shared by the word speller (SpellActivity) and the
// whole-verse speller (SpellVerseActivity), so the two can never drift.
//
// The policy is Nathanael's Phase 0 selection as AMENDED by the DOSBox pass
// (5E-SPEC2 §4.1/§4.2, DRILL-BEHAVIOR-RULES C4/C5):
//
//   With Accents OFF   ACCENT-insensitive (acute, grave, circumflex, and
//                      nothing else), case-insensitive, punctuation optional,
//                      whitespace normalized. Breathings, the diaeresis, the
//                      iota subscript and FINAL FORMS are all still required.
//   With Accents ON    every mark must be exactly right — and nothing else
//                      changes: still case-insensitive, still punctuation-
//                      optional.
//
// TWO LENIENCIES WERE WITHDRAWN THIS ROUND, both because the original enforces
// what the port was forgiving:
//
//   C4  FINAL FORMS ARE REQUIRED. ἄγγελος must not validate with a medial
//       sigma in final position, so ς and σ are no longer folded together.
//       The keyboard has always had both tiles (ς is the `j` key), so this
//       asks for nothing the learner cannot type.
//   C5  BREATHINGS ARE REQUIRED AT BOTH SETTINGS. "With Accents" governs
//       ACCENTS — that is what the checkbox says and what the original does.
//       ἀδελφός without its smooth breathing is a misspelling, not an
//       unaccented spelling. Stripping "\p{M}" swept breathings, diaereses and
//       subscripts away with the accents; the accent set is now named
//       explicitly so the checkbox can only ever govern those three.
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

// THE THREE ACCENTS the "With Accents" checkbox governs, and only those:
// combining acute, grave and perispomeni. U+0340/U+0341 (the deprecated
// combining tonos pair) fold onto U+0300/U+0301 under NFD and so never reach
// this set. Everything else a Greek cluster can carry — psili, dasia,
// dialytika, ypogegrammeni — is part of the SPELLING and is required at both
// settings (C5).
const ACCENTS = /[̀́͂]/gu;   // varia, oxia, perispomeni

// ---- THE ELISION MARK, AND WHY IT LOOKS LIKE A BREATHING -------------------
// `δι᾽ ἐμοῦ` (John 14:6b). That mark after the iota is NOT a breathing: it is
// the elision apostrophe, standing where διά lost its final alpha. Unicode
// calls it U+1FBD GREEK KORONIS and gives it the compatibility decomposition
// <space> + U+0313 — it is literally a smooth breathing drawn over nothing,
// which is why it looks like one, and why the original's keyboard (which has
// no apostrophe key, and neither does ours — D-15) let the learner type it
// with the smooth-breathing tile.
//
// A REAL breathing can only ever sit on a word's initial vowel, on the second
// vowel of an initial diphthong, or on an initial rho. It never floats and it
// never appears after a consonant-initial word's vowel. So a breathing outside
// those positions is not a breathing at all; it is this apostrophe, entered
// the only way the shared keyboard allows. Punctuation is optional (D-18), so
// it comes off with the rest of the punctuation.
//
// Verified across all 148 delivered spelling answers in chapters 1-5: not one
// carries a breathing in a position this rule would strip, so it can only ever
// forgive input and never change a correct answer's key. `οὐδεὶς` keeps its
// psili (initial diphthong, second vowel), `ἐμοῦ` keeps its (initial vowel),
// `ῥ`-initial words keep theirs, and `δἰ` becomes `δι` — which is what the
// answer's own `δι᾽` reduces to once its koronis is stripped as punctuation.
// (5E-SPEC3-RESPONSE item 4.)
const BREATHINGS = /[̓̔]/u;      // psili, dasia
const COMBINING = /\p{M}/u;
const GREEK_VOWEL = /[αεηιουω]/u;   // lowercased and decomposed by this point

function dropElisionMarks(word) {
  if (!BREATHINGS.test(word)) return word;
  const chars = [...word];
  const bases = chars.filter(ch => !COMBINING.test(ch));
  // The last base index a breathing may legitimately sit on, or -1 for a word
  // that cannot carry one at all.
  let lastLegal = -1;
  if (bases.length) {
    if (GREEK_VOWEL.test(bases[0])) {
      let i = 0;
      while (i < bases.length && GREEK_VOWEL.test(bases[i])) i += 1;
      lastLegal = i - 1;                 // the whole initial vowel run
    } else if (bases[0] === 'ρ') {
      lastLegal = 0;                     // ῥ-
    }
  }
  let baseIndex = -1;
  return chars.filter(ch => {
    if (!COMBINING.test(ch)) { baseIndex += 1; return true; }
    return !(BREATHINGS.test(ch) && baseIndex > lastLegal);
  }).join('');
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
  // Decompose either way: NFD is what makes the accent set above addressable
  // inside a precomposed cluster, and NFC at the end puts the survivors back
  // together so two spellings that differ only in normalization still match.
  out = out.normalize('NFD');
  if (!withAccents) out = out.replace(ACCENTS, '');
  // Word by word, because "legitimate position" is a property of a WORD.
  if (punctuationOptional) out = out.split(' ').map(dropElisionMarks).join(' ');
  return out.normalize('NFC');
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
