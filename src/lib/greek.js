// Unicode helpers shared by the chapter-2 syllable and accent activities.
// Work in NFD only while inspecting marks, then return NFC for display.

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

// Marking Recognition / Accent Rule ask about ONE mark and draw it red.
// Colouring the mark INLINE does not work: browsers keep shaping across an
// inline boundary that differs only in colour, so the mark glyph is painted
// with the BASE run's colour (verified by screenshot in the 5B patch -- the
// DOM colour was right, the pixels were not). 5B-SPEC2 C5 settles it: render
// the target cluster's BASE with the mark removed and OVERLAY the mark as a
// free-standing spacing glyph, absolutely positioned over the base. No inline
// boundary, so nothing to shape across.
//
// Returns render segments in source order:
//   { text }                     plain ink run
//   { base, overlay }            the target cluster, split for the overlay
//   { text, red: true }          the whole cluster reddens because it IS the
//                                mark (apostrophe, colon, question) -- there is
//                                no base to separate it from
//
// A target cluster carrying NO mark at all is an authoring error, not a shape
// the overlay cannot handle (chapt-02's φαρισαῖος points at cluster 6, a bare
// alpha, while its circumflex sits on 7). Reddening it would tell the learner
// the answer is "Circumflex" while the red sits on an unmarked letter, so the
// cluster renders plain: absent signal beats false signal (XPATCH1).
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
    const marks = chars.filter(char => SPACING_FOR_COMBINING[char]);
    const target = (preferredMark && marks.includes(preferredMark)) ? preferredMark : marks[0];
    if (!target) {
      // No combining mark to lift off. Either the cluster IS the mark
      // (apostrophe, colon, question -- no base letter, so it reddens whole),
      // or it is an unmarked LETTER, which means the authored index is wrong
      // and nothing should be coloured.
      pushText(cluster, !/\p{L}/u.test(cluster));
      return;
    }
    let dropped = false;
    const base = chars.filter(char => {
      if (!dropped && char === target) { dropped = true; return false; }
      return true;
    }).join('').normalize('NFC');
    parts.push({ base, overlay: spacingForm(target) });
  });
  return parts;
}
