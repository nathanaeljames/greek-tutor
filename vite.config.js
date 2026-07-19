import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';
// Shared cache-name constants (single source of truth for app + SW). See
// src/lib/cache-config.js — dependency-free so it imports cleanly here.
// NB (phase 4.5): audio bytes no longer live in Cache Storage — they are in
// IndexedDB (src/lib/audio-store.js) and play through Blob object URLs, so the
// SW is entirely out of the audio path. Only the manifest cache name is needed
// here now; there is no /audio/ runtime route and no rangeRequests plugin.
import { MANIFEST_CACHE } from './src/lib/cache-config.js';

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
        // Precache the app SHELL ONLY (~15 files). Audio bytes are NOT in Cache
        // Storage anymore — they live in IndexedDB and play via Blob object URLs
        // (phase 4.5), so cold start no longer scales with library size. The one
        // remaining runtime route is the manifest below.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            // The audio manifest must stay reachable offline (Settings + hub
            // badges) yet still pick up changes online so packs can flag
            // 'update'. This is the ONLY runtime route: there is no /audio/
            // route and no rangeRequests plugin — the SW never touches audio.
            urlPattern: ({ url }) => url.pathname.endsWith('/audio/audio-manifest.json'),
            handler: 'NetworkFirst',
            options: {
              cacheName: MANIFEST_CACHE,
              expiration: { maxEntries: 2 },
              cacheableResponse: { statuses: [0, 200] },
              // Offline fallback must hit the stored manifest even if the host
              // varies its JSON responses.
              matchOptions: { ignoreVary: true }
            }
          }
        ]
      }
    })
  ]
});
