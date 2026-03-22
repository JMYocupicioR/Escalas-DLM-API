// Service Worker Registration for Escalas DLM PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('[PWA] Service Worker registered, scope:', registration.scope);
        // Check for updates periodically (every 60 minutes)
        setInterval(function() {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch(function(error) {
        console.warn('[PWA] Service Worker registration failed:', error);
      });
  });
}
