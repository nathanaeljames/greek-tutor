// Single source of truth for Cache Storage bucket names. Imported by both the
// app (downloads.js) and the build (vite.config.js -> generated service
// worker) so the DownloadManager, audio.js play-time warm, and the SW runtime
// route can never drift onto different cache names (Part B/B3). Keep this file
// dependency-free: it is imported into the Vite config's Node context.

// Every audio byte lives here — downloaded packs, play-time warms, and the SW
// CacheFirst /audio/ route all share this ONE bucket.
export const AUDIO_CACHE = 'greek-tutor-audio';

// The audio manifest lives in its own NetworkFirst bucket so "Clear downloaded
// audio" (which only touches audio caches) leaves it reachable offline.
export const MANIFEST_CACHE = 'greek-tutor-manifest';

// True for any cache name that holds audio bytes (the canonical bucket plus any
// legacy/duplicate the SW may have default-named before cacheName was pinned).
// Deliberately excludes MANIFEST_CACHE ('greek-tutor-manifest' has no 'audio').
export function isAudioCacheName(name) {
  return typeof name === 'string' && /audio/i.test(name);
}
