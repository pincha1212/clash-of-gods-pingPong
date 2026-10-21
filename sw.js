/* Clash of Gods PWA shell. Keep this list in sync with the static app shell. */
const CACHE_PREFIX = 'clash-of-gods-shell-';
const CACHE_NAME = `${CACHE_PREFIX}0.2.75`;
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './styles.css',
  './menu.css',
  './characters.css',
  './arena.css',
  './responsive.css',
  './game.js',
  './config.js',
  './state.js',
  './characters.js',
  './navigation.js',
  './input.js',
  './settings.js',
  './physics.js',
  './effects.js',
  './hud.js',
  './audio.js',
  './abilities.js',
  './powerups.js',
  './mutation.js',
  './arena-events.js',
  './arena-director.js',
  './arena-art.js',
  './codex-profiles.js',
  './codex-relations.js',
  './pwa.js',
  './pwa.css',
  './survival.js',
  './survival.css',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Fail installation if an essential local file is missing; partial offline
    // installs are worse than keeping the previous working version active.
    await cache.addAll(APP_SHELL.map(path => new Request(new URL(path, self.registration.scope).href, { cache: 'reload' })));
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Navigation is offline-first: the versioned shell is a coherent snapshot.
    if (request.mode === 'navigate') {
      const cachedPage = await cache.match(new URL('./index.html', self.registration.scope).href);
      if (cachedPage) return cachedPage;
      try { return await fetch(request); }
      catch { return new Response('Clash of Gods no está disponible sin conexión todavía. Abrí el juego una vez con internet para prepararlo.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }); }
    }

    const cached = await cache.match(request, { ignoreSearch: false });
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic' && /\.(?:js|css|webmanifest|png|svg|woff2?)$/i.test(url.pathname)) {
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      return new Response('Recurso no disponible sin conexión.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});
