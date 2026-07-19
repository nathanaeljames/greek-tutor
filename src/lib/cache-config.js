// Single source of truth for Cache Storage bucket names. Imported by both the
// app (downloads.js) and the build (vite.config.js -> generated service
// worker). Keep this file dependency-free: it is imported into the Vite
// config's Node context.
//
// Phase 4.5: audio bytes moved to IndexedDB (src/lib/audio-store.js). Cache
// Storage now holds ONLY the app-shell precache and the manifest cache. The
// AUDIO_CACHE name below is therefore LEGACY — it names the pre-4.5 audio
// bucket that the one-time migration drains into IDB and then deletes, and that
// clearAllAudio sweeps belt-and-braces. No writer creates it anymore.

// Legacy pre-4.5 audio bucket. Kept only so the migration and clear paths can
// find and delete it during the upgrade window.
export const AUDIO_CACHE = 'greek-tutor-audio';

// The audio manifest lives in its own NetworkFirst bucket so "Clear downloaded
// audio" (which only touches audio storage) leaves it reachable offline.
export const MANIFEST_CACHE = 'greek-tutor-manifest';

// True for any cache name that holds (legacy) audio bytes — the canonical
// pre-4.5 bucket plus any workbox-default duplicate an old deploy may have
// created. clearAllAudio uses this to sweep every audio-named cache (except the
// manifest) so no stray legacy bucket can keep storage inflated.
// BREADTH WARNING: substring match — any future cache whose name contains
// "audio" is swept by clearAllAudio. If a legitimate audio-adjacent cache is
// ever added, exclude it explicitly there, in the same commit.
export function isAudioCacheName(name) {
  return typeof name === 'string' && /audio/i.test(name);
}
