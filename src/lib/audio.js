// Audio service. Resolves audio IDs (naming contract: "chapt_1_a_alpha")
// to file paths ("/audio/chapt_1/a_alpha.m4a") and plays them.
//
// Phase 4.5: audio bytes live in IndexedDB (audio-store.js), not Cache Storage.
// Playback reads the Blob and plays a URL.createObjectURL(blob) — seeking is
// native and local, so there is NO fetch, NO service worker, and NO Range
// header anywhere in the audio path. This module is the sole audio choke point
// (verified since HANDOFF-4B §5); nothing else opens the audio DB or builds an
// <audio src="/audio/...">.

import { getBlob, putMany } from './audio-store.js';

const DIR_PATTERN = /^(chapt_\d+|vocab\d*|john\d*|rev_par|rev_voc|intro)_(.+)$/;

// Single hard-timeout fetch for the play-time miss path: a wedged connection
// must never leave play() pending forever (same rationale as downloads.js's
// bulkFetch, but no retries — one clip, one attempt).
const PLAY_FETCH_TIMEOUT_MS = 15000;
async function fetchWithTimeout(src) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), PLAY_FETCH_TIMEOUT_MS);
  try { return await fetch(src, { signal: ctl.signal }); }
  finally { clearTimeout(timer); }
}

let currentAudio = null;
let currentUrl = null;     // the one live object URL (kept at most one; revoked)
let playToken = 0;         // bumped by every play()/stop(); stale resolutions bail
let toastCallback = null;

export function onAudioProblem(cb) { toastCallback = cb; }

export function audioPath(id) {
  if (!id) return null;
  const m = id.match(DIR_PATTERN);
  if (!m) return null;
  return `/audio/${m[1]}/${m[2]}.m4a`;
}

// Revoke the live object URL if any. Called on ended, on stop(), and before
// creating the next URL — so at most one object URL is ever live (no leaks).
function revokeCurrentUrl() {
  if (currentUrl) {
    try { URL.revokeObjectURL(currentUrl); } catch (_) { /* ignore */ }
    currentUrl = null;
  }
}

export async function play(id) {
  const src = audioPath(id);
  if (!src) return false;

  // Claim this play; any later play()/stop() bumps the token so this call
  // abandons silently instead of stomping a newer clip (the async gaps below
  // — IDB read, network — are where a rapid second tap would interleave).
  const token = ++playToken;

  // 1) IDB hit -> play local bytes.
  let blob = null;
  try { blob = await getBlob(src); } catch (_) { blob = null; }

  // 2) IDB miss + online -> fetch once, store for offline (first-play-while-
  //    online-caches-for-offline parity with the pre-4.5 warmCache), then play.
  if (!blob) {
    try {
      const resp = await fetchWithTimeout(src);
      if (resp && resp.ok) {
        blob = await resp.blob();
        putMany([{ path: src, blob }]).catch(() => { /* best-effort persist */ });
      }
    } catch (_) { /* offline / timeout -> blob stays null (toast below) */ }
  }

  // A newer play()/stop() landed while we awaited: the user is getting that
  // clip (or asked for silence) — abandon without touching audio or toasting.
  if (token !== playToken) return false;

  // 3) Still no bytes -> the user gets no audio: toast (the round-1 contract is
  //    LAW — toast iff no audio).
  if (!blob) {
    if (toastCallback) {
      toastCallback(`Audio not found: ${src} -- add the audio pack to public/audio/`);
    }
    return false;
  }

  // Tear down whatever was playing and its URL before starting ours.
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  revokeCurrentUrl();

  const url = URL.createObjectURL(blob);
  currentUrl = url;
  const audio = new Audio(url);
  currentAudio = audio;
  audio.addEventListener('ended', () => {
    if (audio === currentAudio) { revokeCurrentUrl(); currentAudio = null; }
  }, { once: true });

  return audio.play().then(() => true).catch((err) => {
    // AbortError = interrupted by a newer play()/stop(): the user is getting the
    // newer clip — silent (device bug F6 was blanket-toasting this).
    if (err && err.name === 'AbortError') return false;
    // Superseded while rejecting for any other reason: the newer play() owns its
    // own feedback.
    if (audio !== currentAudio) return false;
    // We had valid local bytes, so this is a real playback failure, never a
    // missing file. Free the URL and say so.
    revokeCurrentUrl();
    currentAudio = null;
    if (toastCallback) toastCallback(`Audio couldn't play: ${src}`);
    return false;
  });
}

export function stop() {
  // Supersede any in-flight play() resolution, then tear down.
  playToken++;
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  revokeCurrentUrl();
}
