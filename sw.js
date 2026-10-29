// Service worker: guarda la app en la tablet para que funcione sin internet.
// Sube VERSION cada vez que publiques cambios, así la tablet descarga la nueva.
const VERSION = "plantillas-v2";
const FILES = [
  "./", "./index.html", "./manifest.json", "./css/styles.css",
  "./js/data.js", "./js/geometry.js", "./js/font.js", "./js/text.js",
  "./js/draw.js", "./js/preview.js", "./js/pdf.js", "./js/app.js",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png", "./icons/apple-touch-icon.png",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Primero internet (para tener siempre la última versión); si no hay conexión, lo guardado.
// Solo se guardan respuestas del mismo sitio.
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(r => { if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); } return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
