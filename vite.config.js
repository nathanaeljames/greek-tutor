import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';
// Shared cache-name constants (single source of truth for app + SW). See
// src/lib/cache-config.js — dependency-free so it imports cleanly here.
import { AUDIO_CACHE, MANIFEST_CACHE } from './src/lib/cache-config.js';

export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
        'icons/icon-maskable-512.png', 'icons/lamp-pixel-512.png'
      ],
      manifest: {
        name: 'Greek Tutor',
        short_name: 'GreekTutor',
        description: 'Learn Koine Greek -- offline-first port of the ParsonsTech Greek Tutor',
        theme_color: '#2a7d72',
        background_color: '#f5f2e8',
        display: 'standalone',
        orientation: 'portrait',
        // App icon: the retro pixel-faithful LAMP art (A5). To swap the final
        // art, point these src paths at the alternative file — one-line change.
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Precache the app shell only. Audio is fetched on demand and
        // cached at runtime (CacheFirst), per PROJECT.md caching strategy.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            // The audio manifest must stay reachable offline (Settings + hub
            // badges) yet still pick up changes online so packs can flag
            // 'update'. NetworkFirst, registered BEFORE the CacheFirst audio
            // route below so it wins the match for this one path.
            urlPattern: ({ url }) => url.pathname.endsWith('/audio/audio-manifest.json'),
            handler: 'NetworkFirst',
            options: {
              cacheName: MANIFEST_CACHE,
              expiration: { maxEntries: 2 },
              cacheableResponse: { statuses: [0, 200] },
              // P1: offline fallback must hit the stored manifest even if the
              // host varies its JSON responses (same rationale as the audio route).
              matchOptions: { ignoreVary: true }
            }
          },
          {
            // Single-writer discipline (4-STORAGE-PASS): DownloadManager bulk
            // fetches carry the x-gt-bulk-download marker (BULK_FETCH_HEADER in
            // cache-config.js) and are EXCLUDED here, so the SW never races
            // downloads.js's putSingle on the same URL. WebKit's put() honors
            // Vary and appends instead of replacing when the racing writers'
            // request headers differ — the source of the inflated/rising iOS
            // "Audio files stored" counts. LITERAL header name on purpose:
            // this function is stringified into the generated sw.js, where the
            // cache-config import does not exist. Keep in sync with
            // BULK_FETCH_HEADER.
            urlPattern: ({ url, request }) =>
              url.pathname.includes('/audio/') && !request.headers.has('x-gt-bulk-download'),
            handler: 'CacheFirst',
            options: {
              cacheName: AUDIO_CACHE,
              expiration: { maxEntries: 10000 },
              cacheableResponse: { statuses: [0, 200] },
              rangeRequests: true,
              // P1: match ignoring the response's Vary header, so playback hits
              // whatever entry downloads.js wrote instead of missing-and-
              // refetching a "different-vary" copy (that refetch path was
              // itself a duplicator — see downloads.js putSingle).
              matchOptions: { ignoreVary: true }
            }
          }
        ]
      }
    })
  ]
});
