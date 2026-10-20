/* Offline cache: app shell only. Your data lives in localStorage, never here. */
var V='ft-v1',FILES=["accounts.html", "connections.html", "dashboard-preview.html", "entry-form.html", "history.html", "import.html", "settings.html", "app.css", "data.js", "my-data.js", "ui.js", "account-edit.js", "home-live.js", "manifest.webmanifest", "icon-192.png"];
self.addEventListener('install',function(e){e.waitUntil(caches.open(V).then(function(c){return c.addAll(FILES)}));self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==V}).map(function(x){return caches.delete(x)}))}));self.clients.claim()});
self.addEventListener('fetch',function(e){if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(function(r){var c=r.clone();caches.open(V).then(function(ch){ch.put(e.request,c)});return r}).catch(function(){return caches.match(e.request).then(function(m){return m||caches.match('dashboard-preview.html')})}))});
