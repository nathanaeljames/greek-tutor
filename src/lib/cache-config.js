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

// Caches that hold live data and must NEVER be deleted by the legacy-cache
// migration. clearAllAudio may delete AUDIO_CACHE (that is its job) but must
// still never touch MANIFEST_CACHE. Guard against these names explicitly —
// do not rely on isAudioCacheName's substring accident to protect them.
export const PROTECTED_CACHES = [AUDIO_CACHE, MANIFEST_CACHE];

// True for any cache name that holds audio bytes (the canonical bucket plus any
// legacy/duplicate the SW may have default-named before cacheName was pinned).
// BREADTH WARNING: this is a substring match — any future cache whose name
// contains "audio" will be swept by clearAllAudio and (unless listed in
// PROTECTED_CACHES) deleted by migrateLegacyAudioCaches on every startup.
// If a legitimate second audio-adjacent cache is ever added, put its name in
// PROTECTED_CACHES here, in the same commit.
export function isAudioCacheName(name) {
  return typeof name === 'string' && /audio/i.test(name);
}
