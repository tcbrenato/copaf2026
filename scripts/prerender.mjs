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
      const url = `${BASE_URL}${route}`
      console.log('[prerender] Rendu de', url)

      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
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
