/* KAIRÓS — apenas shell, sem cache de API, sessão, dados ou mídias privadas. */
const CACHE='kairos-shell-v1',SHELL=['/offline.html','/favicon.svg','/icons/icon.svg','/icons/icon-192.svg','/icons/icon-512.svg','/src/styles.css','/src/app.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(SHELL.map(x=>c.add(x)))).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(x=>x.startsWith('kairos-shell-')&&x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const req=e.request;if(req.method!=='GET')return;
 const url=new URL(req.url);if(url.origin!==self.location.origin||url.pathname.startsWith('/api/')||url.pathname.startsWith('/manifest.'))return;
 if(req.mode==='navigate'){e.respondWith(fetch(req).catch(async()=>await caches.match('/offline.html')||Response.error()));return;}
 if(!SHELL.includes(url.pathname))return;
 e.respondWith(fetch(req).then(r=>{if(r.ok){const copy=r.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(req,copy)));}return r;}).catch(async()=>await caches.match(req)||Response.error()));
});
