const cacheName = "forOffline";
const staticAssets = [
	'index.html',
	'app.js',
	'edit.png',
	'bootstrap.min.css',
	'jquery.min.js',
	'jquery-3.2.1.slim.min.js',
	'jquery.cookie.js',
	'bootstrap.min.js',
	'qrcode.min.js',
	'manifest.webmanifest'
];

self.addEventListener('install',async e=>{
	const cache = await caches.open(cacheName);
	await cache.addAll(staticAssets);
	return self.skipWaiting();
});
self.addEventListener('fetch',async e=>{
	// self.clients.claim();
	const req = e.request;
	e.respondWith(cacheFirst(req));
});
async function cacheFirst(req){
	const cachedResponse = await caches.match(req);
	return cachedResponse || fetch(req);
}
// self.addEventListener('activate',async e=>{
// 	self.clients.claim();
// });