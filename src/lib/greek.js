// Unicode helpers shared by the chapter-2 syllable and accent activities.
// Work in NFD only while inspecting marks, then return NFC for display.

import MARK_GEOMETRY from './mark-geometry.json';

const ACCENT_MARKS = {
  '\u0301': 'Acute',
  '\u0300': 'Grave',
  '\u0342': 'Circumflex'
};

export function splitGraphemes(text) {
  if (!text) return [];
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return [...new Intl.Segmenter('el', { granularity: 'grapheme' }).segment(text)].map(part => part.segment);
  }
  const clusters = [];
  for (const char of Array.from(text.normalize('NFD'))) {
    if (/\p{M}/u.test(char) && clusters.length) clusters[clusters.length - 1] += char;
    else clusters.push(char);
  }
  return clusters.map(cluster => cluster.normalize('NFC'));
}

export function analyzeAccent(answerForm) {
  const source = splitGraphemes(answerForm);
  let type = null;
  let position = -1;
  const displayClusters = source.map((cluster, index) => {
    let stripped = '';
    for (const char of Array.from(cluster.normalize('NFD'))) {
      if (ACCENT_MARKS[char]) {
        if (type == null) {
          type = ACCENT_MARKS[char];
          position = index;
        }
      } else {
        stripped += char;
      }
    }
    return stripped.normalize('NFC');
  });
  return { type, position, displayClusters, display: displayClusters.join('') };
}

// Hyphen join, not the raised dot: that glyph is the Greek colon this very
// chapter teaches (Learn Other Marks -> Punctuation), so a dot-joined
// "ἄγ·γε·λος" would read as punctuation to a learner mid-lesson.
export function dividedForm(greek, division) {
  const gaps = new Set(division || []);
  const clusters = splitGraphemes(greek);
  return clusters.map((cluster, index) =>
    index < clusters.length - 1 && gaps.has(index + 1) ? `${cluster}-` : cluster
  ).join('');
}

// ---- Isolated / red marks (5B-SPEC2 B1, C4, C5) ----
//
// A diacritic shown OUTSIDE a word needs the SPACING codepoint, not the
// combining one: a lone combining mark has no base to sit on and renders as a
// hairline (or a dotted circle). The chapter-2 data now authors the spacing
// forms; this map is the render-time bridge for the two cells that still carry
// combining marks and for turning a word's own combining mark into the
// free-standing glyph the red overlay paints.
export const SPACING_FOR_COMBINING = {
  '́': '´',   // acute
  '̀': '`',   // grave
  '͂': '῀',   // circumflex (perispomeni, NOT a tilde)
  '̓': '᾿',   // smooth breathing / coronis
  '̔': '῾',   // rough breathing
  '̈': '¨'    // diaeresis
};

// Every codepoint that renders as a free-standing mark glyph, spacing or
// combining. Used to decide what gets the enlarged isolated-mark treatment.
export const ISOLATED_MARKS = new Set([
  '᾿', '῾', '῀', '´', '`', '¨', '᾽',
  ...Object.keys(SPACING_FOR_COMBINING)
]);

// The mark a Marking Recognition option label names, so the red overlay can
// pick ONE mark out of a multi-mark cluster (ΐ is diaeresis + acute; ὔ is
// coronis + acute). Punctuation answers have no combining form: those clusters
// ARE the mark and redden whole.
const MARK_BY_NAME = {
  'Acute': '́',
  'Grave': '̀',
  'Circumflex': '͂',
  'Smooth Breathing': '̓',
  'Rough Breathing': '̔',
  'Coronis': '̓',
  'Diaeresis': '̈'
};

export function combiningForMarkName(name) { return MARK_BY_NAME[name] || null; }

export function spacingForm(mark) { return SPACING_FOR_COMBINING[mark] || mark; }

// The overlay (below) replaces a mark the BASE would otherwise have drawn, so
// it must use the very glyph the precomposed form uses. Greek text sets its
// acute and grave from U+0384/U+1FEF -- narrower and steeper than the Latin-1
// U+00B4/U+0060 the chart cells carry -- and a swap here is visible at prompt
// size. The other four are the same drawing either way.
const OVERLAY_FOR_COMBINING = {
  ...SPACING_FOR_COMBINING,
  '́': '΄',   // acute  -> Greek tonos, not U+00B4
  '̀': '`'    // grave  -> Greek varia, not U+0060
};

export function overlayForm(mark) { return OVERLAY_FOR_COMBINING[mark] || spacingForm(mark); }

// Replace any combining mark in an isolated (base-less) string with its
// spacing twin. The Accent Possibilities chart's "Long Ultima" ultima cell
// still ships combining acute/grave; rendering them as-is is unreadable.
export function spacingMarks(text) {
  if (!text) return text || '';
  let out = '';
  for (const char of text) out += SPACING_FOR_COMBINING[char] || char;
  return out;
}

// Split a base-less string into mark / non-mark runs so a chart cell like
// "´ or ῀" can enlarge its glyphs and leave the "or" at body size.
export function splitMarkRun(text) {
  const parts = [];
  for (const char of spacingMarks(text || '')) {
    const mark = ISOLATED_MARKS.has(char);
    const last = parts[parts.length - 1];
    if (last && last.mark === mark) last.t += char;
    else parts.push({ t: char, mark });
  }
  return parts;
}

// Index (1-based) and combining char of a word's FIRST accent in NFD order --
// the Accent Rule drill's redFirstAccent contract.
export function firstAccentCluster(text) {
  const clusters = splitGraphemes(text);
  for (let i = 0; i < clusters.length; i++) {
    for (const char of clusters[i].normalize('NFD')) {
      if (ACCENT_MARKS[char]) return { index: i + 1, mark: char };
    }
  }
  return { index: -1, mark: null };
}

// ---- MARK GEOMETRY (5B-SPEC4 B, replacing SPEC3's rules M1-M6) ----
//
// Marking Recognition / Accent Rule ask about ONE mark and draw it red.
// Colouring the mark INLINE does not work: browsers keep shaping across an
// inline boundary that differs only in colour, so the mark glyph is painted
// with the BASE run's colour (verified by screenshot in the 5B patch -- the
// DOM colour was right, the pixels were not). 5B-SPEC2 C5 settled the fix:
// render the base without the mark and OVERLAY the mark as a free-standing
// glyph. SPEC3 added the FULL-OVERLAY rule -- if any mark in a cluster is
// coloured, ALL of that cluster's marks come off the base, so nothing is ever
// drawn twice in one place.
//
// What SPEC3 got wrong was WHERE. It positioned the overlay from six
// hand-written CSS rules (single / breathing+accent / breathing+circumflex /
// diaeresis+accent / capital / iota subscript). The font does not use six
// rules: it carries a distinct offset pair for each of ~220 precomposed
// characters, and they differ by base letter as much as by combination -- the
// acute over alpha sits at +0.205em, over omega at +0.334em, over iota at
// -0.028em. Six constants averaged across that, which is why VERIFY3 saw marks
// riding low, sitting right of the iota in kai, and off-centre in a diaeresis
// while the PRINTED text was always right.
//
// So the offsets now come from the font itself: scripts/make-mark-geometry.py
// reads each precomposed glyph's composite components and writes
// mark-geometry.json. Rendering the base glyph at the origin and each mark
// glyph at its recorded offset reproduces the printed character by
// construction -- which is exactly VERIFY3's instruction, "produce the word
// with the accent using the actual text, and then move the manually positioned
// accents to perfectly overlap that".
//
// Returns render segments in source order:
//   { text }                     plain ink run
//   { base, marks, bx, aw }      the target cluster: base stripped of its marks
//                                (iota subscript stays -- it is part of the base
//                                glyph), plus the mark set as
//                                { glyph, x, y, clip, red }, offsets in em from
//                                the base glyph's origin
//   { text, red: true }          the whole cluster reddens because it IS the
//                                mark (apostrophe, colon, question) -- there is
//                                no base to separate it from
//
// A target cluster carrying NO mark at all is an authoring error, not a shape
// the overlay cannot handle. Reddening it would tell the learner the answer is
// "Circumflex" while the red sits on an unmarked letter, so the cluster renders
// plain: absent signal beats false signal (XPATCH1).
const MARK_KIND = {
  '̓': 'breathing',   // smooth breathing / coronis (U+0343 decomposes here)
  '̔': 'breathing',   // rough breathing
  '́': 'accent',
  '̀': 'accent',
  '͂': 'circumflex',
  '̈': 'diaeresis'
};
// Iota subscript is part of the BASE rendering and is never lifted.
const IOTA_SUBSCRIPT = 'ͅ';

const GEOMETRY = MARK_GEOMETRY.clusters;

// Clusters that had to fall back to the legacy rule table, by NFC form. The
// build guard (scripts/check-content-shapes.mjs) proves the shipped data never
// reaches this, but a fallback in the field must be findable rather than a
// silently slightly-wrong mark.
export const markGeometryFallbacks = new Set();

// LEGACY fallback only: a combination with no precomposed codepoint (an
// NFD-only stack) has no font composite to read, so it is arranged by the old
// M1-M5 classes. Positions are approximate by construction -- that is the
// point of preferring the table.
function arrangeMarks(kinds) {
  const has = kind => kinds.includes(kind);
  if (kinds.length < 2) return { layout: 'single', slots: kinds.map(() => 'only') };
  const layout = has('diaeresis') ? 'diaeresis'
    : (has('breathing') && has('accent')) ? 'pair'
    : 'stack';
  return {
    layout,
    slots: kinds.map(kind => {
      if (layout === 'pair') return kind === 'breathing' ? 'left' : 'right';
      return kind === 'breathing' || kind === 'diaeresis' ? 'lower' : 'upper';
    })
  };
}

function legacyCluster(marks, kinds, target) {
  const { layout, slots } = arrangeMarks(kinds);
  let reddened = false;
  return {
    layout,
    marks: marks.map((mark, position) => {
      const red = !reddened && mark === target && (reddened = true);
      return { glyph: overlayForm(mark), slot: slots[position], red };
    })
  };
}

export function markOverlayParts(text, redIndex, preferredMark) {
  const clusters = splitGraphemes(text);
  const parts = [];
  const pushText = (t, red) => {
    const last = parts[parts.length - 1];
    if (!red && last && last.text != null && !last.red) last.text += t;
    else parts.push(red ? { text: t, red: true } : { text: t });
  };
  clusters.forEach((cluster, index) => {
    if (index + 1 !== redIndex) { pushText(cluster, false); return; }
    const chars = Array.from(cluster.normalize('NFD'));
    const marks = chars.filter(char => MARK_KIND[char]);
    const target = (preferredMark && marks.includes(preferredMark)) ? preferredMark : marks[0];
    if (!target) {
      // No combining mark to lift off. Either the cluster IS the mark
      // (apostrophe, colon, question -- no base letter, so it reddens whole),
      // or it is an unmarked LETTER, which means the authored index is wrong
      // and nothing should be coloured.
      pushText(cluster, !/\p{L}/u.test(cluster));
      return;
    }
    const nfc = cluster.normalize('NFC');
    const entry = GEOMETRY[nfc];
    if (entry) {
      // Every row whose mark IS the asked-about one reddens. Normally that is
      // one glyph; for the fused dialytika-tonos outline it is the two clipped
      // bands that draw the dots, which are one mark drawn in two pieces.
      parts.push({
        base: entry.base,
        bx: entry.bx || 0,
        aw: entry.aw || 0,
        marks: entry.marks.map(mark => ({
          glyph: mark.g, x: mark.x, y: mark.y, clip: mark.clip || null, red: mark.m === target
        }))
      });
      return;
    }
    if (!markGeometryFallbacks.has(nfc)) {
      markGeometryFallbacks.add(nfc);
      console.warn(`mark-geometry: no font row for "${nfc}" — falling back to the approximate rule table.`);
    }
    const base = chars.filter(char => !MARK_KIND[char]).join('').normalize('NFC');
    const kinds = marks.map(mark => MARK_KIND[mark]);
    parts.push({
      base,
      capital: /\p{Lu}/u.test(base.replace(IOTA_SUBSCRIPT, '')),
      ...legacyCluster(marks, kinds, target)
    });
  });
  return parts;
}

// ---- Greek-tap text splitting (shared by RichContent and Paradigm) ---------
// greekTaps: split a text on STANDALONE substring matches and render those
// substrings as tappable spans. Greek NOT listed stays plain. Data contract
// (chat-side pipeline, chapters 2+): a greekTaps key marks EVERY occurrence of
// that exact string whose neighbors are not Greek letters — a single-letter
// key like "ζ" can never turn part of a longer Greek word in the same
// paragraph into a tap target. Lived in RichContent.svelte until 5F-FEEDBACK2
// item 25 needed the same split inside Paradigm's note line (the emphatic
// forms ἐμοῦ, ἐμοί, ἐμέ), at which point two copies would have been two
// places for the contract to disagree.
const GREEK_LETTER = /[Ͱ-Ͽἀ-῿]/; // Greek + Greek Extended

// First occurrence of sub in text where the adjacent characters are not
// Greek letters; -1 if none.
function standaloneIndexOf(text, sub) {
  for (let i = text.indexOf(sub); i !== -1; i = text.indexOf(sub, i + 1)) {
    const before = i > 0 ? text[i - 1] : '';
    const after = text[i + sub.length] || '';
    if (!GREEK_LETTER.test(before) && !GREEK_LETTER.test(after)) return i;
  }
  return -1;
}

export function splitTaps(text, taps) {
  let parts = [{ t: text || '' }];
  if (!taps) return parts;
  for (const [sub, audio] of Object.entries(taps)) {
    const next = [];
    for (const p of parts) {
      if (p.audio || p.popup) { next.push(p); continue; }   // already claimed
      // EVERY standalone occurrence, not just the first: two identical Greek
      // words on one page must behave the same way (directive 8).
      let rest = p.t;
      for (let i = standaloneIndexOf(rest, sub); i !== -1; i = standaloneIndexOf(rest, sub)) {
        if (i > 0) next.push({ t: rest.slice(0, i) });
        next.push({ t: sub, audio });
        rest = rest.slice(i + sub.length);
      }
      if (rest) next.push({ t: rest });
    }
    parts = next;
  }
  return parts;
}
