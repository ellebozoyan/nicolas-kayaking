const CACHE_NAME = 'nicolas-kayak-v1';
const APP_SHELL = ['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png',
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_NAME).then(c => Promise.all(APP_SHELL.map(u => c.add(u).catch(()=>{})))).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;
  if (/youtube|googlevideo|ytimg|suno\.com/.test(url)) return;
  e.respondWith(caches.match(e.request).then(cached => {
    if (cached) return cached;
    return fetch(e.request).then(r => {
      if (r && r.status === 200 && (url.includes('fonts.gstatic.com') || url.startsWith(self.location.origin))) {
        const clone = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
      }
      return r;
    }).catch(() => { if (e.request.mode === 'navigate') return caches.match('./index.html'); });
  }));
});
