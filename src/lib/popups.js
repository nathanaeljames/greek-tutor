// FULL-PAGE POPUPS (5F §2.2). Chapters 6, 7 and 8 each carry a set of green
// pages behind their teaching pages: a headword, its sense lines and two or
// three worked examples with references. In the original each is a full-screen
// modal reached by tapping a blue link on the page underneath, with a Cancel
// control to come back.
//
// The popups live in an ACTIVITY-level `popups[]` array while the links that
// open them are nested arbitrarily deep inside the topic content, so the
// register travels by Svelte CONTEXT rather than as a prop drilled through
// RichContent's recursion. Context, not a module store: two activities must
// never see each other's popups, and ActivityHost's {#key activityId} remount
// is what guarantees that with context and would not with a global.
//
// THREE WAYS A LINK IS DECLARED, all of them data:
//
//   popupRef      an explicit id on a greekRows row (chapter 6's One/Two/Three
//                 Case panels — the GLOSS is the link, the case tag is ink).
//   underline     an [[u]]…[[/u]] run whose slug matches a popup id (chapter
//                 8's Three Uses page: "As a pronoun" -> asAPronoun). An
//                 underlined run that matches nothing stays a plain underline,
//                 which is what keeps "he [[u]]himself[[/u]] will get the car"
//                 from becoming a link.
//   greek         a popup carrying a `greek` headword links every standalone
//                 occurrence of that word in the page's prose (chapter 7's
//                 οὐ / οὐκ / οὐχ, whose page ships no anchors of its own).
//                 See DIVERGENCE-LOG D-31.
import { getContext, setContext } from 'svelte';
import { slugOf } from './content.js';

const KEY = Symbol('popups');

// Register an activity's popups and hand back the opener the host binds to.
// `open` is a callback the host supplies (it owns the visible sheet).
export function providePopups(popups, open) {
  const byId = {};
  for (const popup of popups || []) if (popup && popup.id) byId[popup.id] = popup;
  const register = { byId, open, byGreek: greekIndex(popups) };
  setContext(KEY, register);
  return register;
}

export function usePopups() {
  return getContext(KEY) || null;
}

// Longest headword first, so οὐχ claims its own match before οὐ could.
function greekIndex(popups) {
  return (popups || [])
    .filter(popup => popup && popup.greek)
    .sort((a, b) => b.greek.length - a.greek.length)
    .map(popup => [popup.greek, popup]);
}

// The popup an id names, or null. Ids are matched exactly first, then by slug,
// so a link may name the popup either way.
export function popupFor(register, ref) {
  if (!register || !ref) return null;
  if (register.byId[ref]) return register.byId[ref];
  const slug = slugOf(ref);
  return register.byId[slug] || null;
}
