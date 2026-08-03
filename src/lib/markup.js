// Inline markup carried inside authored content strings.
//
// The chapter-2 English Grammar Review pages underline the exact word or
// phrase a rule is about ("[[u]]Terry[[/u]] went to the store"). The
// underlining IS the pedagogy there, so the pipeline ships it inline rather
// than splitting every example into fragments. Only RichContent renders the
// spans; every other surface strips the markers so a marker can never reach
// the screen as literal text.
//
// TWO INLINE SPANS, one syntax:
//   [[u]]…[[/u]]  underline — the original's own emphasis
//   [[g]]…[[/g]]  dark green — a DESCRIPTIVE TERM sharing a line with the
//                 example it describes ("Come here. — command", "Terry kicked
//                 himself. — reflexive"). The original sets the example and its
//                 label in one line and relies on the reader to tell them
//                 apart; green is the port's way of doing that, and the colour
//                 is the ink/dark-green already used for asides — NEVER blue,
//                 which means tappable and only tappable (directive 8).
// The two never nest in shipped data, and the splitter is written so a nested
// pair would still emit both runs' text rather than swallowing one.

const INLINE = /\[\[([ug])\]\]([\s\S]*?)\[\[\/\1\]\]/g;
const ANY_MARKER = /\[\[\/?[ug]\]\]/g;

// [{ t, u, g }] segments in source order; u/g mark an underlined/green run.
export function splitUnderline(text) {
  const src = text == null ? '' : String(text);
  if (!src.includes('[[')) return [{ t: src, u: false, g: false }];
  const parts = [];
  let at = 0;
  INLINE.lastIndex = 0;
  for (let m = INLINE.exec(src); m; m = INLINE.exec(src)) {
    if (m.index > at) parts.push({ t: src.slice(at, m.index), u: false, g: false });
    if (m[2]) parts.push({ t: m[2], u: m[1] === 'u', g: m[1] === 'g' });
    at = m.index + m[0].length;
  }
  if (at < src.length) parts.push({ t: src.slice(at), u: false, g: false });
  // An unbalanced marker leaves stray text; strip it rather than print it.
  return parts.map(p => (p.u || p.g ? p : { ...p, t: p.t.replace(ANY_MARKER, '') }));
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

// Defensive: the same string on a surface with no inline-span support.
export function stripMarkup(text) {
  if (text == null) return text;
  const src = String(text);
  return src.includes('[[') ? src.replace(ANY_MARKER, '') : src;
}
