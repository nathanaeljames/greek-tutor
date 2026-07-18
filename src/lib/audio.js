// Audio service. Resolves audio IDs (naming contract: "chapt_1_a_alpha")
// to file paths ("/audio/chapt_1/a_alpha.m4a") and plays them.
// Gracefully reports missing files (the audio pack is dropped into
// public/audio/ by the user after local transcoding).

const DIR_PATTERN = /^(chapt_\d+|vocab\d*|john\d*|rev_par|rev_voc|intro)_(.+)$/;

let currentAudio = null;
let toastCallback = null;

export function onAudioProblem(cb) { toastCallback = cb; }

export function audioPath(id) {
  if (!id) return null;
  const m = id.match(DIR_PATTERN);
  if (!m) return null;
  return `/audio/${m[1]}/${m[2]}.m4a`;
}

function warmCache(src) {
  // Play-time cache-into (the no-pack fallback). Safari plays media via ranged
  // requests (206), which are not cacheable; fetch the complete file once so the
  // SW stores a full 200 response that rangeRequests:true can slice offline.
  // Bulk cache population is now owned by the download manager (downloads.js),
  // which writes the SAME 'greek-tutor-audio' cache — there is no on-load
  // full-chapter warm anymore (downloads are explicit taps only). This per-play
  // warm must stay so offline audio never regresses for users who never tap
  // Download and just play a file once while online.
  if (!('caches' in window)) return;
  caches.match(src).then(hit => {
    if (!hit) fetch(src).catch(() => { });
  }).catch(() => { });   // cache API failure must not surface as unhandled
}

export function play(id) {
  const src = audioPath(id);
  if (!src) return Promise.resolve(false);
  warmCache(src);
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  const audio = new Audio(src);
  currentAudio = audio;
  return audio.play().then(() => true).catch(() => {
    if (toastCallback) toastCallback(`Audio not found: ${src} -- add the audio pack to public/audio/`);
    return false;
  });
}

export function stop() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}
