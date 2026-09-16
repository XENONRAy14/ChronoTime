// Migration from legacy workers: remove only ChronoTime caches and unregister.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const names=await caches.keys();await Promise.all(names.filter(n=>/chronotime|chronomontagne/i.test(n)).map(n=>caches.delete(n)));
 await self.registration.unregister();await self.clients.claim();
})()));
