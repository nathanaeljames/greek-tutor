// Audio pack model. The runtime manifest (public/audio/audio-manifest.json,
// ~8.5k entries) is the single source of truth for what audio exists; it is
// fetched at runtime and NEVER bundled/imported into the JS build. A "pack" is
// all audio under one top-level folder (chapt_1, intro, john, ...); packs are
// the unit the download manager operates on.

import { getToc, getBuiltChapterIds } from './content.js';

const MANIFEST_URL = '/audio/audio-manifest.json';

let manifestPromise = null;   // memoized { hash, entries }
let packsPromise = null;      // memoized [{ id, label, count, srcs[] }]

// Normalize a manifest `src` ("audio/chapt_1/a_alpha.m4a") to the absolute
// path the player and the SW runtime route use ("/audio/chapt_1/a_alpha.m4a").
function normSrc(src) {
  return src.startsWith('/') ? src : '/' + src;
}

// First path segment after "audio/": "/audio/chapt_1/a_alpha.m4a" -> "chapt_1".
export function packIdOf(src) {
  const parts = normSrc(src).split('/').filter(Boolean); // ['audio','chapt_1','a_alpha.m4a']
  return parts[1] || null;
}

async function sha256Hex(text) {
  if (!(globalThis.crypto && crypto.subtle)) return 'nohash';
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// Fetch + parse the manifest once per session. hash = SHA-256 hex of the raw
// manifest text (drives coarse pack-versioning). Reachable offline via the SW
// NetworkFirst route registered for this URL in vite.config.js.
export function loadManifest() {
  if (!manifestPromise) {
    manifestPromise = (async () => {
      const res = await fetch(MANIFEST_URL);
      if (!res.ok) throw new Error(`manifest fetch failed: ${res.status}`);
      const text = await res.text();
      const hash = await sha256Hex(text);
      const raw = JSON.parse(text);
      // Manifest shape: { "<audioId>": { orig, src }, ... }
      const entries = Object.entries(raw).map(([id, v]) => ({
        id, orig: v.orig, src: normSrc(v.src)
      }));
      return { hash, entries };
    })().catch(err => {
      manifestPromise = null;   // allow a later retry (e.g. came back online)
      throw err;
    });
  }
  return manifestPromise;
}

// Human label for a pack id, resolved from the TOC (chapter number + title;
// "Introduction" for intro; special books by their TOC titles). Packs with no
// TOC match fall back to their raw id (defensive).
function buildLabelMap() {
  const toc = getToc();
  const map = {};
  if (toc.intro) map[toc.intro.id] = toc.intro.title;
  for (const c of toc.chapters || []) map[c.id] = c.number != null ? `${c.number}. ${c.title}` : c.title;
  for (const s of toc.special || []) map[s.id] = s.title;
  return map;
}

export function packLabel(packId) {
  return buildLabelMap()[packId] || packId;
}

// All packs, grouped from the manifest and sorted by TOC order (intro,
// chapters 1..28, then specials, then anything else). Memoized.
export function getPacks() {
  if (!packsPromise) {
    packsPromise = loadManifest().then(({ entries }) => {
      const byId = new Map();
      for (const e of entries) {
        const pid = packIdOf(e.src);
        if (!pid) continue;
        if (!byId.has(pid)) byId.set(pid, []);
        byId.get(pid).push(e.src);
      }
      const order = packOrder();
      const packs = [...byId.entries()].map(([id, srcs]) => ({
        id, label: packLabel(id), count: srcs.length, srcs
      }));
      packs.sort((a, b) => (order.indexOf(a.id) + 1 || 999) - (order.indexOf(b.id) + 1 || 999) || a.id.localeCompare(b.id));
      return packs;
    }).catch(err => {
      packsPromise = null;   // don't memoize failure (mirror loadManifest) — allow retry
      throw err;
    });
  }
  return packsPromise;
}

// Preferred display order of pack ids, from the TOC.
function packOrder() {
  const toc = getToc();
  const ids = [];
  if (toc.intro) ids.push(toc.intro.id);
  for (const c of toc.chapters || []) ids.push(c.id);
  for (const s of toc.special || []) ids.push(s.id);
  return ids;
}

export async function getPack(packId) {
  const packs = await getPacks();
  return packs.find(p => p.id === packId) || null;
}

// Packs that correspond to BUILT content (surfaced on chapter hubs and in the
// Settings "Downloaded packs" list). Derived from the content layer, not hardcoded.
export async function getBuiltPacks() {
  const built = new Set(getBuiltChapterIds());
  const packs = await getPacks();
  return packs.filter(p => built.has(p.id));
}
