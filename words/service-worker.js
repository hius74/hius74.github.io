// src/page/service-worker.ts
var CACHE_NAME = "words-app-cache-v1";
var ASSETS_TO_CACHE = [
  "/",
  "/favicon.svg",
  "/index.css",
  "/index.html",
  "/index.js",
  "/settings.css",
  "/settings.html",
  "/settings.js"
];
var sw = self;
sw.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});
sw.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
