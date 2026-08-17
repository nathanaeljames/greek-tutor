// Inline markup carried inside authored content strings.
//
// The chapter-2 English Grammar Review pages underline the exact word or
// phrase a rule is about ("[[u]]Terry[[/u]] went to the store"). The
// underlining IS the pedagogy there, so the pipeline ships it inline rather
// than splitting every example into fragments. Only RichContent renders the
// spans; every other surface strips the markers so a marker can never reach
// the screen as literal text.
//
// THREE INLINE SPANS, one syntax:
//   [[u]]…[[/u]]  underline — the original's own emphasis
//   [[g]]…[[/g]]  dark green — a DESCRIPTIVE TERM sharing a line with the
//                 example it describes ("Come here. — command", "Terry kicked
//                 himself. — reflexive"). The original sets the example and its
//                 label in one line and relies on the reader to tell them
//                 apart; green is the port's way of doing that, and the colour
//                 is the ink/dark-green already used for asides — NEVER blue,
//                 which means tappable and only tappable (directive 8).
//   [[i]]…[[/i]]  italic — bibliographic titles emphasized by the original.
// The spans never nest in shipped data, and the splitter is written so a nested
// pair would still emit both runs' text rather than swallowing one.
//
// FOUR, since 5G: [[link:id]]…[[/link]] names the popup a run opens. Chapters
// 6-8 could key their links off the underlined run's own slug because the run
// text WAS the popup's title ("As a pronoun" -> asAPronoun); chapters 9 and 10
// link ordinary words to popups whose titles are something else entirely
// ("punctiliar" -> "Punctiliar (single point in time)", "frequent verbs" ->
// "Frequently Used Deponent Verbs"), so the target is named explicitly rather
// than derived. The slug route still works and is untouched.

const INLINE_SOURCE = /\[\[([ugi])\]\]([\s\S]*?)\[\[\/\1\]\]|\[\[link:([^\]]+)\]\]([\s\S]*?)\[\[\/link\]\]/;
const ANY_MARKER = /\[\[\/?(?:[ugi]|link(?::[^\]]+)?)\]\]/g;

// SPANS NEST, as of the DISCLOSURE data pass. The chapter 4 and 5 Learn Nouns
// Introductions author their C3 links as [[u]][[link:declensions]]…[[/link]][[/u]]
// — the pipeline underlining the link as well as naming it. This module's
// header used to record "the spans never nest in shipped data" as a standing
// assumption, and a flat splitter treated the inner pair as literal TEXT: all
// four of those links printed "[[link:declensions]]declensions[[/link]]" at the
// learner, and the unbreakable run pushed the paragraph 3px past the card at
// the 320px floor (ui-walk.mjs, chapters 4 and 5). Nesting is a legitimate way
// to author "an underlined thing that is also a link", so the splitter now
// RECURSES into a run's inner text and carries the outer flags inward, instead
// of the data being edited to work around it.
// A segment can therefore carry several flags at once; Marked.svelte resolves
// `link` first, which is right — a C3 link already draws its own underline
// (§3.2), so the outer [[u]] adds nothing to draw twice.

// [{ t, u, g, i, link }] segments in source order; flags mark authored inline
// runs and `link` carries the popup id a [[link:…]] run opens.
export function splitUnderline(text) {
  return splitRuns(text == null ? '' : String(text), { u: false, g: false, i: false, link: null });
}

function splitRuns(src, inherited) {
  if (!src.includes('[[')) return [{ t: src, ...inherited }];
  const parts = [];
  let at = 0;
  // A FRESH regex per call: the recursion below re-enters this function while
  // an outer loop is mid-scan, and a shared /g literal would have its lastIndex
  // trampled by the inner run.
  const inline = new RegExp(INLINE_SOURCE.source, 'g');
  for (let m = inline.exec(src); m; m = inline.exec(src)) {
    if (m.index > at) parts.push({ t: src.slice(at, m.index), ...inherited });
    if (m[3] != null) {
      if (m[4]) parts.push(...splitRuns(m[4], { ...inherited, link: m[3] }));
    } else if (m[2]) {
      parts.push(...splitRuns(m[2], {
        ...inherited,
        u: inherited.u || m[1] === 'u',
        g: inherited.g || m[1] === 'g',
        i: inherited.i || m[1] === 'i'
      }));
    }
    at = m.index + m[0].length;
  }
  if (at < src.length) parts.push({ t: src.slice(at), ...inherited });
  // An unbalanced marker leaves stray text; strip it rather than print it.
  return parts.map(p => (p.u || p.g || p.i || p.link ? p : { ...p, t: p.t.replace(ANY_MARKER, '') }));
}

// ---- Isolated marks in parentheses (5B-SPEC2 B1) ----
//
// The chapter's teaching prose names each mark by showing it alone in
// parentheses: "Acute ( ´ )", "Question Mark ( ; )", "Coronis:  ( ᾿ )  words
// joined". Two things go wrong if that is left as plain text: the mark glyph
// is body-text sized (the original deliberately enlarges it) and the group can
// break across lines, stranding the closing paren on its own (feedback 8).
// Every "( x )" group therefore renders as one no-wrap unit, with the mark
// itself enlarged.
//
// The pattern deliberately requires whitespace INSIDE both parens, so ordinary
// prose parentheticals -- "(e.g. book)", "(Present tense)", "(Jn 1:15)" --
// never match.
const MARK_GROUP = /\(\s+([^\s()]{1,3})\s+\)/g;

// [{ t }] plain runs and { group: inner } no-wrap "( inner )" groups.
export function splitMarkGroups(text) {
  const src = text == null ? '' : String(text);
  if (!src.includes('(')) return [{ t: src }];
  const parts = [];
  let at = 0;
  MARK_GROUP.lastIndex = 0;
  for (let m = MARK_GROUP.exec(src); m; m = MARK_GROUP.exec(src)) {
    if (m.index > at) parts.push({ t: src.slice(at, m.index) });
    parts.push({ group: m[1] });
    at = m.index + m[0].length;
  }
  if (at < src.length) parts.push({ t: src.slice(at) });
  return parts.length ? parts : [{ t: src }];
}

// Defensive: the same string on a surface with no inline-span support. Strips
// the OPENING [[link:id]] too, marker and target both — a select prompt that
// kept "[[link:palatal]]" would print the id at the learner.
export function stripMarkup(text) {
  if (text == null) return text;
  const src = String(text);
  return src.includes('[[') ? src.replace(ANY_MARKER, '') : src;
}
