import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function computeBuildHash(input: string): string {
  let hash = 5381
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i)
  }
  return (hash >>> 0).toString(36)
}

function seraOfflineSwPlugin(): Plugin {
  return {
    name: 'sera-offline-sw-plugin',
    apply: 'build',
    generateBundle(_options, bundle) {
      const emittedUrls = Object.keys(bundle)
        .filter((fileName) => !fileName.endsWith('.map') && fileName !== 'sw.js')
        .map((fileName) => `/${fileName.replace(/^\/+/, '')}`)

      const baseUrls = [
        '/',
        '/index.html',
        '/manifest.webmanifest',
        '/sera-logo.png',
        '/favicon.svg',
      ]

      const precacheUrls = Array.from(new Set([...baseUrls, ...emittedUrls]))
      const buildHash = computeBuildHash([...precacheUrls].sort().join('|'))
      const appCacheName = `sera-nanomind-app-${buildHash}`
      const mediaCacheName = 'sera-nanomind-media-v1'

      const swSource = `/* SERA NanoMind Offline Service Worker (${buildHash}) */
const APP_CACHE = ${JSON.stringify(appCacheName)};
const MEDIA_CACHE = ${JSON.stringify(mediaCacheName)};
const PRECACHE_URLS = ${JSON.stringify(precacheUrls, null, 2)};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key.startsWith('sera-nanomind-app-') && key !== APP_CACHE) {
              return caches.delete(key);
            }
            return Promise.resolve(false);
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  let url;
  try {
    url = new URL(event.request.url);
  } catch {
    return;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  if (
    url.origin === self.location.origin &&
    (url.pathname === '/sw.js' || url.pathname.startsWith('/api/'))
  ) {
    return;
  }

  if (url.origin === self.location.origin && event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(APP_CACHE).then((cache) => cache.put('/index.html', copy)).catch(() => {});
          }
          return res;
        })
        .catch(() =>
          caches
            .match('/index.html')
            .then((cached) => cached || caches.match('/'))
            .then((cached) => cached || new Response('Offline', { status: 503, statusText: 'Offline' }))
        )
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(APP_CACHE).then((cache) =>
        cache.match(event.request).then(
          (cached) =>
            cached ||
            fetch(event.request)
              .then((res) => {
                if (res && res.ok && res.type === 'basic') {
                  cache.put(event.request, res.clone()).catch(() => {});
                }
                return res;
              })
              .catch(() => new Response('', { status: 504, statusText: 'Offline' }))
        )
      )
    );
    return;
  }

  if (
    url.hostname === 'images.unsplash.com' ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(
      caches.open(MEDIA_CACHE).then((cache) =>
        cache.match(event.request).then(
          (cached) =>
            cached ||
            fetch(event.request)
              .then((res) => {
                if (res && (res.ok || res.type === 'opaque')) {
                  cache.put(event.request, res.clone()).catch(() => {});
                }
                return res;
              })
              .catch(() => new Response('', { status: 504, statusText: 'Offline' }))
        )
      )
    );
    return;
  }
});
`

      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: swSource,
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), seraOfflineSwPlugin()],
  server: {
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'react';
        },
      },
    },
  },
})
