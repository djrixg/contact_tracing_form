const cacheName = "forOffline";
const staticAssets = [
	'index.html',
	'css/bootstrap.min.css',
	'js/jquery.min.js',
	'js/jquery-3.2.1.slim.min.js',
	'js/bootstrap.min.js',
	'js/qrcode.min.js',
	'manifest.webmanifest'
];

self.addEventListener('install',async e=>{
	const cache = await caches.open(cacheName);
	await cache.addAll(staticAssets);
	return self.skipWaiting();
});
self.addEventListener('activate',async e=>{
	self.clients.claim();
});