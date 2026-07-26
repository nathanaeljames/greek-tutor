// Inline markup carried inside authored content strings.
//
// The chapter-2 English Grammar Review pages underline the exact word or
// phrase a rule is about ("[[u]]Terry[[/u]] went to the store"). The
// underlining IS the pedagogy there, so the pipeline ships it inline rather
// than splitting every example into fragments. Only RichContent renders the
// spans; every other surface strips the markers so a marker can never reach
// the screen as literal text.

const UNDERLINE = /\[\[u\]\]([\s\S]*?)\[\[\/u\]\]/g;
const ANY_MARKER = /\[\[\/?u\]\]/g;

// [{ t, u }] segments in source order; u marks an underlined run.
export function splitUnderline(text) {
  const src = text == null ? '' : String(text);
  if (!src.includes('[[')) return [{ t: src, u: false }];
  const parts = [];
  let at = 0;
  UNDERLINE.lastIndex = 0;
  for (let m = UNDERLINE.exec(src); m; m = UNDERLINE.exec(src)) {
    if (m.index > at) parts.push({ t: src.slice(at, m.index), u: false });
    if (m[1]) parts.push({ t: m[1], u: true });
    at = m.index + m[0].length;
  }
  if (at < src.length) parts.push({ t: src.slice(at), u: false });
  // An unbalanced marker leaves stray text; strip it rather than print it.
  return parts.map(p => (p.u ? p : { ...p, t: p.t.replace(ANY_MARKER, '') }));
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

// Defensive: the same string on a surface with no underline support.
export function stripMarkup(text) {
  if (text == null) return text;
  const src = String(text);
  return src.includes('[[') ? src.replace(ANY_MARKER, '') : src;
}
