// scripts/prerender.mjs
//
// Lance automatiquement apres `vite build` (voir package.json).
// 1. Demarre un serveur local qui sert le dossier dist/ deja construit.
// 2. Ouvre chaque route avec Puppeteer (Chrome headless) et attend le
//    rendu complet de React.
// 3. Sauvegarde le HTML final dans dist/<route>/index.html, pour que les
//    crawlers (moteurs de recherche ET IA) voient le vrai contenu sans
//    avoir besoin d'executer JavaScript.

import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import puppeteer from 'puppeteer'
import { getPublishedArticles } from '../src/utils/articlesData.js'

const PORT     = 4173
const BASE_URL = `http://localhost:${PORT}`
const DIST_DIR = path.resolve('dist')

const ROUTES = [
  '/',
  '/inscription',
  '/partenariats',
  '/exposition-digitale',
  '/visiter',
  '/verifier',
  '/actualites',
  // Chaque article a son propre HTML statique avec son propre titre/meta
  // (voir SeoHead.jsx) — indispensable pour que chacun ressorte sur ses
  // propres mots-cles plutot que sur le titre generique du site.
  ...getPublishedArticles().map(a => `/actualites/${a.slug}`),
  '/mentions-legales',
  '/politique-confidentialite',
  '/live',
  '/documentation',
  '/recommandations',
]

// Domaines de tracking/analytics tiers a bloquer pendant le prerendu.
// Ces scripts maintiennent souvent des connexions reseau ouvertes en
// continu (beacons, pixels, websockets), ce qui empeche Puppeteer
// d'atteindre l'etat "networkidle" et fait timeout la navigation.
// Ce blocage n'affecte QUE le prerendu : les vrais visiteurs du site
// chargeront ces scripts normalement.
const BLOCKED_DOMAINS = [
  'googletagmanager.com',
  'google-analytics.com',
  'analytics.google.com',
  'linkedin.com',
  'px.ads.linkedin.com',
  'facebook.net',
  'connect.facebook.net',
  'doubleclick.net',
]

function waitForServer(url, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const tryFetch = async () => {
      try {
        const res = await fetch(url)
        if (res.status < 500) return resolve()
      } catch {}
      if (Date.now() - start > timeoutMs) {
        return reject(new Error('Timeout en attendant le serveur de preview'))
      }
      setTimeout(tryFetch, 300)
    }
    tryFetch()
  })
}

async function main() {
  console.log('[prerender] Demarrage du serveur de preview (vite preview)...')
  const preview = spawn(
    'npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'],
    { stdio: 'inherit', shell: true }
  )

  try {
    await waitForServer(BASE_URL)

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    for (const route of ROUTES) {
      const page = await browser.newPage()
      page.on('pageerror', (err) => console.log('[prerender] ERREUR PAGE:', err.message))
      page.on('console', (msg) => { if (msg.type() === 'error') console.log('[prerender] CONSOLE:', msg.text()) })

      // Bloque les domaines de tracking pour eviter les connexions
      // reseau persistantes qui empechent l'etat "idle".
      await page.setRequestInterception(true)
      page.on('request', (req) => {
        const url = req.url()
        if (BLOCKED_DOMAINS.some(domain => url.includes(domain))) {
          req.abort()
        } else {
          req.continue()
        }
      })

      const url = `${BASE_URL}${route}`
      console.log('[prerender] Rendu de', url)

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 })
      await new Promise(r => setTimeout(r, 600))

      await page.evaluate(() => {
        document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]')
          .forEach(el => el.remove())
      })

      const html = await page.content()
      await page.close()

      const htmlCorrige = html.replace(/=(["'])\.\//g, '=$1/')

      const outDir = route === '/' ? DIST_DIR : path.join(DIST_DIR, route)
      await mkdir(outDir, { recursive: true })
      await writeFile(path.join(outDir, 'index.html'), htmlCorrige, 'utf-8')
    }

    await browser.close()
    console.log(`[prerender] Termine : ${ROUTES.length} page(s) pre-rendue(s).`)
  } finally {
    preview.kill()
  }
}

main().catch(err => {
  console.error('[prerender] Erreur :', err)
  process.exit(1)
})