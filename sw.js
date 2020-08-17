const cacheName = "forOffline";
const staticAssets = [
	'/index.html',
	'bootstrap.min.css',
	'/jquery.min.js',
	'/jquery-3.2.1.slim.min.js',
	'/bootstrap.min.js',
	'/qrcode.min.js',
	'/manifest.webmanifest'
];

self.addEventListener('install',async e=>{
	const cache = await caches.open(cacheName);
	await cache.addAll(staticAssets);
	return self.skipWaiting();
});
self.addEventListener('activate',async e=>{
	self.clients.claim();
});