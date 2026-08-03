// SPELLER INPUT MODEL — the typing buffer every spell surface shares
// (SpellActivity and SpellVerseActivity). Both spellers used to keep their own
// copy of "append a character / combine a mark / drop a grapheme", which is
// exactly the per-surface fork the shared keyboard (D-15) exists to prevent.
// Two of the three VERIFY-5D A6 defects were in that duplicated code.
//
// The buffer is a string PLUS a caret, both measured in GRAPHEME CLUSTERS, not
// UTF-16 units — "ἁ" is one thing to delete, one thing to step over and one
// thing to tap on. Every function here is pure: it takes a state and returns a
// new one, so the components stay declarative and this file is testable on its
// own.
//
//   { text, caret, pendingMark }
//     text         the NFC string being graded
//     caret        cluster index in [0, clusters.length]; insertion point
//     pendingMark  combining marks typed with no letter to sit on yet
//
// PENDING MARKS are the fix for the second A6 defect. A breathing typed at the
// start of a word (`ὁ` space `᾿` `Ι`) used to be appended to whatever character
// happened to precede it — the SPACE — so the mark rendered on the space, the
// word boundary was visually eaten, and the iota that followed came out bare.
// A mark with no letter before it is now HELD and applied to the next letter
// entered. Whitespace and punctuation never take a mark and never consume one:
// the queue survives them, so "space then breathing then iota" and "breathing
// then space then iota" both produce the same ἰ.

import { splitGraphemes } from './greek.js';

export const EMPTY = { text: '', caret: 0, pendingMark: '' };

// A cluster that can carry a diacritic. Marks belong on letters; a space, a
// comma or a raised dot is never a base.
const isBase = cluster => !!cluster && /\p{L}/u.test(cluster);

export function clustersOf(state) {
  return splitGraphemes(state.text);
}

function rebuild(clusters, caret, pendingMark) {
  return {
    text: clusters.join('').normalize('NFC'),
    caret: Math.max(0, Math.min(caret, clusters.length)),
    pendingMark: pendingMark || ''
  };
}

// Insert plain text (a letter tile, a composite, punctuation, a space) at the
// caret. A held mark is consumed here — but only by a real base letter.
export function insertText(state, text) {
  if (!text) return state;
  const clusters = clustersOf(state);
  let incoming = splitGraphemes(text);
  let pending = state.pendingMark;
  if (pending && incoming.length && isBase(incoming[0])) {
    incoming = [...incoming];
    incoming[0] = (incoming[0] + pending).normalize('NFC');
    pending = '';
  }
  clusters.splice(state.caret, 0, ...incoming);
  return rebuild(clusters, state.caret + incoming.length, pending);
}

// Apply a diacritic (or a breathing+accent pair — `apply` may be two combining
// codepoints) to the cluster BEFORE the caret. With no base there, hold it.
export function applyMark(state, mark) {
  if (!mark) return state;
  const clusters = clustersOf(state);
  const at = state.caret - 1;
  const target = at >= 0 ? clusters[at] : null;
  if (!isBase(target)) {
    // No letter to sit on: queue it for the next letter rather than letting it
    // land on a space (the A6 defect) or vanish silently.
    return { ...state, pendingMark: state.pendingMark + mark };
  }
  clusters[at] = (target + mark).normalize('NFC');
  return rebuild(clusters, state.caret, state.pendingMark);
}

// Backspace. A held mark is dropped first — it is the most recent thing typed
// and it is not in `text` yet, so deleting a whole cluster instead would look
// like the key did two things at once.
export function backspace(state) {
  if (state.pendingMark) {
    const marks = [...state.pendingMark];
    marks.pop();
    return { ...state, pendingMark: marks.join('') };
  }
  if (state.caret <= 0) return state;
  const clusters = clustersOf(state);
  clusters.splice(state.caret - 1, 1);
  return rebuild(clusters, state.caret - 1, '');
}

export function clear() {
  return { ...EMPTY };
}

// Tap-to-position (the first A6 defect: entry was append-only, so a mistake in
// word one cost the whole verse). `index` is the cluster tapped and `after`
// says which half of it was hit.
export function placeCaret(state, index, after) {
  const clusters = clustersOf(state);
  const caret = Math.max(0, Math.min(index + (after ? 1 : 0), clusters.length));
  // Moving the caret abandons a held mark: it was queued for a letter in the
  // place the learner has just left.
  return { ...state, caret, pendingMark: '' };
}

export function caretToEnd(state) {
  return { ...state, caret: clustersOf(state).length, pendingMark: '' };
}

// Seed a buffer from a string (restart, or a fresh word in the stepper).
export function fromText(text) {
  const value = (text || '').normalize('NFC');
  return { text: value, caret: splitGraphemes(value).length, pendingMark: '' };
}
