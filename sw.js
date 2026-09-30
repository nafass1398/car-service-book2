<meta name='viewport' content='width=device-width, initial-scale=1'/>/* سرویس‌ورکر دفترچهٔ سرویس خودرو -- کش آفلاین */
const CACHE_NAME = 'car-service-book-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

/* نصب: ذخیرهٔ فایل‌های اصلی */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* فعال‌سازی: حذف کش‌های قدیمی */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* درخواست‌ها: اول از کش، بعد از شبکه؛ پاسخ‌های جدید ذخیره می‌شوند */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetched = fetch(e.request)
        .then(res => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});