/**
 * Post-build script to inject PWA tags into Expo-generated index.html
 * 
 * Expo export generates index.html but doesn't support custom <head> tags.
 * This script injects the manifest link, apple-touch-icon, meta tags,
 * and service worker registration script.
 */
const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const INDEX_PATH = path.join(DIST_DIR, 'index.html');

const PWA_HEAD_TAGS = `
    <!-- PWA Meta Tags -->
    <link rel="manifest" href="/manifest.json">
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Escalas DLM">
    <meta name="theme-color" content="#0ea5e9">
`;

const SW_SCRIPT = `
    <!-- Service Worker Registration -->
    <script src="/register-sw.js"></script>
`;

function injectPWATags() {
  if (!fs.existsSync(INDEX_PATH)) {
    console.error('[PWA] dist/index.html not found. Run expo export first.');
    process.exit(1);
  }

  let html = fs.readFileSync(INDEX_PATH, 'utf8');

  // Inject meta tags before </head>
  if (!html.includes('manifest.json')) {
    html = html.replace('</head>', `${PWA_HEAD_TAGS}  </head>`);
    console.log('[PWA] Injected manifest and meta tags into <head>');
  }

  // Inject SW registration before </body>
  if (!html.includes('register-sw.js')) {
    html = html.replace('</body>', `${SW_SCRIPT}  </body>`);
    console.log('[PWA] Injected service worker registration script');
  }

  fs.writeFileSync(INDEX_PATH, html, 'utf8');
  console.log('[PWA] index.html updated successfully');
}

injectPWATags();
