// 오프라인 실행용 캐시. 앱 파일과 글꼴·Firebase 라이브러리만 저장하고, 실시간 데이터 통신은 건드리지 않음
const CACHE = 'matchingmon-v17';
const FILES = ['./', './index.html', './manifest.json', './firebase-config.js', './icon-192.png', './icon-512.png', './flags.woff2'];
const CACHEABLE = u => u.origin === self.location.origin || u.hostname === 'www.gstatic.com' || u.hostname.endsWith('fonts.googleapis.com') || u.hostname.endsWith('fonts.gstatic.com');
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (!CACHEABLE(u) || u.hostname === 'firestore.googleapis.com') return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
