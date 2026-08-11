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
//   popupRef        an explicit id on a greekRows row (chapter 6's One/Two/
//                   Three Case panels — the GLOSS is the link, the case tag
//                   is ink).
//   underline       an [[u]]…[[/u]] run whose slug matches a popup id
//                   (chapter 8's Three Uses page: "As a pronoun" ->
//                   asAPronoun). An underlined run that matches nothing stays
//                   a plain underline, which is what keeps
//                   "he [[u]]himself[[/u]] will get the car" from becoming a
//                   link.
//   numberPopupRef  a numbered-list item's MARKER opens the popup; the Greek
//                   word inside the item plays its own audio like any other
//                   displayed Greek (chapter 7's οὐ / οὐκ / οὐχ page —
//                   Nathanael, 5F-FEEDBACK.pdf item 15). This superseded an
//                   earlier reading where the Greek word itself was the
//                   link; see DIVERGENCE-LOG D-31 / D-31r.
import { getContext, setContext } from 'svelte';
import { slugOf } from './content.js';

const KEY = Symbol('popups');

// Register an activity's popups and hand back the opener the host binds to.
// `open` is a callback the host supplies (it owns the visible sheet).
export function providePopups(popups, open) {
  const byId = {};
  for (const popup of popups || []) if (popup && popup.id) byId[popup.id] = popup;
  const register = { byId, open };
  setContext(KEY, register);
  return register;
}

export function usePopups() {
  return getContext(KEY) || null;
}

// The popup an id names, or null. Ids are matched exactly first, then by slug,
// so a link may name the popup either way. Used where the data NAMES the
// target: an explicit [[link:id]] run, a greekRows popupRef, a numbered item's
// numberPopupRef, a topic's titleLink.
export function popupFor(register, ref) {
  if (!register || !ref) return null;
  if (register.byId[ref]) return register.byId[ref];
  const slug = slugOf(ref);
  return register.byId[slug] || null;
}

// The popup an UNDERLINED RUN opens, or null — the chapters 6-8 convention,
// where the run text is the popup's own title and its slug is the id ("As a
// pronoun" -> asAPronoun). That route reads a coincidence as a link, and 5G
// produced one: chapter 9 underlines the lead-in "deponent:" inside a numbered
// teaching point AND ships a "deponent" popup opened from the topic title. The
// original prints that lead-in in plain black underline, so the port must not
// turn it blue — blue means tappable and only tappable (directive 8).
//
// The discriminator is the popup's own SHAPE, which is also the era it comes
// from: chapters 6-8's popups are the flexible-dict form (greek / gloss /
// senses / examples) and are reached by slug; a popup written as a `content[]`
// block list (5G-SPEC1 4.3) is reached only by a link the data NAMES.
export function popupForRun(register, run) {
  const popup = popupFor(register, run);
  if (!popup || Array.isArray(popup.content)) return null;
  return popup;
}
