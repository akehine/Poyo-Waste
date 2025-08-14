const CACHE_NAME = "pwa-cache-v1";
const urlsToCache = [
  "/",
  "/get_started.html",
  "/login.html",
  "/sign_up.html",
  "/main_page.html",
  "/add_item.html",
  "/bucket.html",
  "/more_data.html",
  "/Javascript/login.js",
  "/Javascript/main_page.js",
  "/Javascript/register.js",
  "/login&signup.css",
  "/main_pages.css",
  "/manifest.json",
  "/user-image/chat.png",
  "/user-image/home.png",
  "/user-image/indicator.png",
  "/user-image/login-curve.png",
  "/user-image/logo.png",
  "/user-image/Manage.png",
  "/user-image/plus.png",
  "/user-image/profile.png",
  "/user-image/test2.png",
  "/user-image/tracking.png"
];

// Install service worker and cache files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch files from cache if offline
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
