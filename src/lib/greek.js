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

// ---- MARK GEOMETRY (5B-SPEC3 C, rules M1-M6) ----
//
// Marking Recognition / Accent Rule ask about ONE mark and draw it red.
// Colouring the mark INLINE does not work: browsers keep shaping across an
// inline boundary that differs only in colour, so the mark glyph is painted
// with the BASE run's colour (verified by screenshot in the 5B patch -- the
// DOM colour was right, the pixels were not). 5B-SPEC2 C5 settled the fix:
// render the base without the mark and OVERLAY the mark as a free-standing
// spacing glyph. 5B-SPEC3 C closes the hole that left: mixing an overlaid mark
// with marks still drawn by the base put two glyphs in one place on every
// multi-mark cluster (breathing + acute collided on anthropou/adelphos/akouo;
// circumflex sat on the breathing in apostolos).
//
// FULL-OVERLAY RULE: if any mark in a cluster must be coloured, ALL of that
// cluster's marks come off the base and the whole set is overlaid -- target in
// --mark-red, the rest in ink. Nothing is then drawn twice, and the positions
// come from one table (M1-M6, keyed by `layout` + `slot` below and realised as
// em offsets in app.css) rather than per-word nudging.
//
// Returns render segments in source order:
//   { text }                     plain ink run
//   { base, marks, layout }      the target cluster: base stripped of its marks
//                                (iota subscript stays -- M6), plus the mark set
//                                as { glyph, kind, slot, red } in source order
//   { text, red: true }          the whole cluster reddens because it IS the
//                                mark (apostrophe, colon, question) -- there is
//                                no base to separate it from
//
// A target cluster carrying NO mark at all is an authoring error, not a shape
// the overlay cannot handle (chapt-02's φαρισαῖος points at cluster 6, a bare
// alpha, while its circumflex sits on 7). Reddening it would tell the learner
// the answer is "Circumflex" while the red sits on an unmarked letter, so the
// cluster renders plain: absent signal beats false signal (XPATCH1).
const MARK_KIND = {
  '̓': 'breathing',   // smooth breathing / coronis (U+0343 decomposes here)
  '̔': 'breathing',   // rough breathing
  '́': 'accent',
  '̀': 'accent',
  '͂': 'circumflex',
  '̈': 'diaeresis'
};
// Iota subscript is part of the BASE rendering and is never lifted (M6).
const IOTA_SUBSCRIPT = 'ͅ';

// The one place the M1-M5 arrangement is decided. `layout` picks the geometry
// class; `slot` picks each mark's position within it.
//   M1 single      -> layout 'single', slot 'only'   (centred; on a diphthong
//                     the mark already belongs to the SECOND vowel's cluster,
//                     so "above the second vowel" needs no special case)
//   M2 breath+acute/grave -> 'pair',  slots 'left' (breathing) / 'right'
//   M3 breath+circumflex  -> 'stack', slots 'lower' (breathing) / 'upper'
//   M4 diaeresis+accent   -> 'diaeresis', slots 'lower' (dots) / 'upper'
//   M5 capital base       -> the same layout, flagged `capital`: the set moves
//                            to the upper LEFT of the letter instead of above it
function arrangeMarks(kinds) {
  const has = kind => kinds.includes(kind);
  if (kinds.length < 2) return { layout: 'single', slots: kinds.map(() => 'only') };
  // M4 is its own case, not a variant of M3: the dots are shorter than a
  // breathing, so the accent above them needs a different lift.
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
    const base = chars.filter(char => !MARK_KIND[char]).join('').normalize('NFC');
    const kinds = marks.map(mark => MARK_KIND[mark]);
    const { layout, slots } = arrangeMarks(kinds);
    let reddened = false;
    parts.push({
      base,
      layout,
      capital: /\p{Lu}/u.test(base.replace(IOTA_SUBSCRIPT, '')),
      marks: marks.map((mark, position) => {
        // Exactly one mark is the question, even if the cluster repeats a kind.
        const red = !reddened && mark === target && (reddened = true);
        return { glyph: overlayForm(mark), kind: kinds[position], slot: slots[position], red };
      })
    });
  });
  return parts;
}
