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

export function dividedForm(greek, division) {
  const gaps = new Set(division || []);
  const clusters = splitGraphemes(greek);
  return clusters.map((cluster, index) =>
    index < clusters.length - 1 && gaps.has(index + 1) ? `${cluster} · ` : cluster
  ).join('');
}
