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

// ---- AUTOPLAY ON MOUNT (DISCLOSURE-SPEC3 W2.4) --------------------------
//
// DRILL-BEHAVIOR-RULES B-last loads a sequence-stepped activity's first item
// on mount and pronounces it there if the activity pronounces on advance. That
// is the app's FIRST un-gestured play, and iOS refuses un-gestured audio
// outright: `audio.play()` rejects with NotAllowedError. Left to the ordinary
// path that would be a toast ("Audio couldn't play") on arrival at every Learn
// Vocabulary screen on a phone — a visible defect where the rule asks only for
// a silent clip.
//
// So a mount clip is played through `playOnLoad`, which differs from `play` in
// exactly two ways and in no others:
//
//   * a blocked-autoplay rejection is SILENT (no toast, no console error). A
//     missing file still toasts, because that is a real fault and the learner
//     needs to know the audio pack is absent.
//   * the blocked clip is HELD for the first real user gesture and played
//     once there, which is the platform's own contract: the first tap unlocks
//     audio, and the item the learner is looking at is the one they hear.
//
// The held clip is abandoned the moment anything else claims the audio channel
// (`play`, `stop`, a route change, a topic switch), so it can never surface
// over a later screen. `armed` is a module-level singleton for the same reason
// `currentAudio` is: this module is the sole audio choke point.
const GESTURES = ['pointerdown', 'touchend', 'keydown'];
let armed = null;
function disarmGesture() {
  if (!armed) return;
  for (const type of GESTURES) window.removeEventListener(type, armed, true);
  armed = null;
}
function armGesture(id) {
  if (typeof window === 'undefined') return;
  disarmGesture();
  const fire = () => { disarmGesture(); play(id); };
  armed = fire;
  for (const type of GESTURES) window.addEventListener(type, fire, { capture: true, once: true });
}
// Did the browser refuse an un-gestured play, as opposed to failing to play?
const isAutoplayBlock = err => !!err && (err.name === 'NotAllowedError' || err.name === 'SecurityError');

// Set by play() when THIS id was refused for want of a gesture; read once, by
// playOnLoad below. A plain flag rather than a change to play()'s return value,
// so its contract (boolean: did the clip start) is untouched for its callers.
let blockedOnLoad = null;

export function playOnLoad(id) {
  if (!id) return Promise.resolve(false);
  blockedOnLoad = null;
  return play(id, { onLoad: true }).then(ok => {
    if (!ok && blockedOnLoad === id) armGesture(id);
    return ok;
  });
}

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

export async function play(id, options) {
  const onLoad = !!(options && options.onLoad);
  if (!onLoad) disarmGesture();   // anything the learner asked for wins the channel
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
      toastCallback(`Audio not found: ${src} — add the audio pack to public/audio/`);
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
    // W2.4: an un-gestured mount clip refused by the platform is NOT a fault —
    // it is iOS's documented behaviour. Record it for playOnLoad to hold for
    // the first gesture, and say nothing. Every other failure still toasts, and
    // a mount clip whose FILE is missing still toasts, because that one is real.
    if (onLoad && isAutoplayBlock(err)) { blockedOnLoad = id; return false; }
    if (toastCallback) toastCallback(`Audio couldn't play: ${src}`);
    return false;
  });
}

export function stop() {
  // Supersede any in-flight play() resolution, then tear down. A held mount
  // clip (W2.4) goes with it: silence was asked for.
  disarmGesture();
  playToken++;
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  revokeCurrentUrl();
}

// PLAY AND WAIT FOR THE CLIP TO FINISH (5E-SPEC2 §2.2, rule A2).
//
// An `afterGuess` surface must not put the next question on screen while the
// previous item is still being spoken — the single most confusing thing in the
// app before this round. The advance delay therefore becomes
// max(class minimum, audio duration), which the caller expresses as
//
//     Promise.all([playThrough(id), afterMinimumDelay])
//
// Duration is never measured or guessed: this resolves on the element's own
// `ended`. It also resolves on `pause` and `error`, so stop() (a route change,
// a screen-off, a new tap, or the learner pressing Next) releases the wait
// immediately instead of parking the caller for the length of a clip that is
// no longer playing. It NEVER rejects — a caller's advance must not be lost to
// a missing file.
//
// It also reports how playback ended: `true` only when the clip reached its
// own `ended`, `false` when it was paused, errored, failed to start, or was
// superseded by a newer play. Current advance callers ignore that distinction;
// either outcome releases their wait immediately.
// WHICH EVENT FIRED IS NOT THE ANSWER — `audio.ended` IS. A clip that reaches
// its end fires `pause` AND `ended` (the spec pauses the element on the way
// out, and Chrome delivers them in that order), so a listener that resolved
// false from `pause` would call every completed clip an interruption. The
// `ended` ATTRIBUTE is positional: it is already true by the time that pause
// arrives, and false when stop() pauses mid-clip. So both listeners settle on
// the attribute, and only a real `error` is false on its own account.
export async function playThrough(id) {
  const ok = await play(id);
  const audio = currentAudio;
  // Already over before we could listen: `ended` is a natural finish; nothing
  // to play, or superseded so `currentAudio` moved on, is not.
  if (!ok || !audio) return false;
  if (audio.ended || audio.paused) return audio.ended === true;
  return await new Promise(resolve => {
    const settle = value => () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
      resolve(value === null ? audio.ended === true : value);
    };
    const onEnded = settle(null);
    const onPause = settle(null);               // stop(), screen-off, new tap
    const onError = settle(false);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);
  });
}

// AUDIO STOPS WHEN THE SCREEN GOES OFF (5E-SPEC2 §3.2, rule A6) and does not
// resume by itself. `visibilitychange` covers backgrounding and lock on every
// engine that fires it; iOS Safari is unreliable there, so `pagehide` is
// listened for as well — it is the event WebKit does fire when the page is
// put into the back/forward cache on lock or app switch.
//
// stop() rather than pause(): tearing the element and its object URL down is
// what guarantees "does not resume by itself", and the next tap builds a fresh
// element anyway (at most one live object URL is an invariant of this module).
// Registered once, at module scope, because this module is the sole audio
// choke point — no component may hold a second copy of this rule.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
}
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => stop());
}
