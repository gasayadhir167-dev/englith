/* 对位英语 · 离线缓存 */
const CACHE = "duiwei-v1_6";
const CORE  = ["./", "./index.html"];
const EXTRA = ["./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-maskable.png"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      // 核心文件必须成功；图标等附加文件逐个缓存，缺一个也不影响整体注册
      c.addAll(CORE).then(() =>
        Promise.all(EXTRA.map(u => c.add(u).catch(() => {})))
      )
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* 先用网络，拿不到就用缓存——断网时照常打开 */
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
