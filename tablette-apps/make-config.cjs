// Écrit capacitor.config.json et la page de secours à partir de APP_ID / APP_NAME / APP_URL (variables d'environnement)
const fs = require('fs')
const { APP_ID, APP_NAME, APP_URL } = process.env
if (!APP_ID || !APP_NAME || !APP_URL) { console.error('APP_ID, APP_NAME et APP_URL sont requis'); process.exit(1) }
fs.writeFileSync('capacitor.config.json', JSON.stringify({
  appId: APP_ID,
  appName: APP_NAME,
  webDir: 'www',
  server: { url: APP_URL, cleartext: false, allowNavigation: ['copaf-ports.com'] },
  android: { allowMixedContent: false, backgroundColor: '#000E91', minWebViewVersion: 60 },
}, null, 2))
fs.writeFileSync('www/index.html', `<!doctype html>
<html lang="fr"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${APP_NAME}</title>
<style>html,body{margin:0;height:100%;background:#000E91;color:#fff;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center}</style>
</head><body><p>Chargement de ${APP_NAME}…</p><script>window.location.replace(${JSON.stringify(APP_URL)})</script></body></html>
`)
console.log('config écrite pour', APP_NAME, APP_URL)
