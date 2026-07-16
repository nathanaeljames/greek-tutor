// Accordion expansion memory for the chapter hub. Module-level (NOT
// persisted): keeps hub <-> activity round trips feeling stable, but resets
// on reload. Keyed by chapterId -> Set of expanded section keys.

const expandedByChapter = new Map();

function ensure(chapterId) {
  if (!expandedByChapter.has(chapterId)) expandedByChapter.set(chapterId, new Set());
  return expandedByChapter.get(chapterId);
}

export function getExpanded(chapterId) {
  return [...ensure(chapterId)];
}

export function isExpanded(chapterId, section) {
  return ensure(chapterId).has(section);
}

export function setExpanded(chapterId, sections) {
  expandedByChapter.set(chapterId, new Set(sections));
}

export function toggleExpanded(chapterId, section) {
  const set = ensure(chapterId);
  if (set.has(section)) set.delete(section);
  else set.add(section);
}

export function hasAnyExpanded(chapterId) {
  return ensure(chapterId).size > 0;
}
