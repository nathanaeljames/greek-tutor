// Progress interface (Phase 4a: localStorage-backed; Phase 6 swaps the
// backend to IndexedDB WITHOUT changing this interface).
//
// A "visited" activity has been opened; a "completed" activity is finished.
// contentAudio pages count completed on visit; scored activities on finish
// (4b). "current" is the up-next pointer: the last activity opened, used to
// drive the accordion's "up next" affordance and the Map button's default
// expansion.

import { writable } from 'svelte/store';
import { getChapter, SECTIONS, getSequence } from './content.js';

const KEY = 'greek-tutor-progress-v1';

// Reactivity bridge (B4): module state is invisible to Svelte, so every
// mutation bumps this revision store. Components subscribe ($progressRev) and
// re-read through the unchanged getter interface below — the interface stays
// synchronous so Phase 6 can swap the backend to IndexedDB behind it.
export const progressRev = writable(0);
function bumpRev() { progressRev.update(n => n + 1); }

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 1) {
        return {
          version: 1,
          visited: parsed.visited || {},
          completed: parsed.completed || {},
          current: parsed.current || null
        };
      }
    }
  } catch (_) { /* corrupt or unavailable storage -> start clean */ }
  return { version: 1, visited: {}, completed: {}, current: null };
}

let state = load();

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) { /* ignore quota/private-mode */ }
}

export function getActivityState(activityId) {
  if (state.completed[activityId]) return 'done';
  if (state.current === activityId) return 'current';
  return 'none';
}

export function markVisited(activityId) {
  state.visited[activityId] = true;
  state.current = activityId;
  save();
  bumpRev();
}

export function markCompleted(activityId) {
  state.completed[activityId] = true;
  state.visited[activityId] = true;
  save();
  bumpRev();
}

export function getSectionProgress(chapterId, section) {
  const ch = getChapter(chapterId);
  const list = (ch && ch[section]) || [];
  const done = list.filter(a => state.completed[a.id]).length;
  return { done, count: list.length };
}

export function getChapterProgress(chapterId) {
  const ch = getChapter(chapterId);
  if (!ch) return { done: 0, total: 0 };
  let done = 0, total = 0;
  for (const section of SECTIONS) {
    for (const a of ch[section] || []) {
      total += 1;
      if (state.completed[a.id]) done += 1;
    }
  }
  return { done, total };
}

// The "up next"/current activity for a chapter: the most recently opened
// activity if it belongs here and is not yet done, else the first activity
// in sequence order that is not done. Null when everything is done.
export function getCurrentActivity(chapterId) {
  const seq = getSequence(chapterId);
  if (!seq.length) return null;
  if (state.current && seq.includes(state.current) && !state.completed[state.current]) {
    return state.current;
  }
  return seq.find(id => !state.completed[id]) || null;
}
