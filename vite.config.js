import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'
import { VitePWA } from 'vite-plugin-pwa'
import { getPublishedArticles } from './src/utils/articlesData.js'

// vite-plugin-sitemap ne scanne que les fichiers HTML produits par Vite
// lui-meme (uniquement dist/index.html pour une SPA) — les autres routes
// reelles du site (y compris celles pre-rendues ensuite par
// scripts/prerender.mjs) doivent donc etre listees explicitement ici pour
// apparaitre dans sitemap.xml.
const DYNAMIC_ROUTES = [
  '/inscription',
  '/partenariats',
  '/exposition-digitale',
  '/visiter',
  '/actualites',
  ...getPublishedArticles().map(a => `/actualites/${a.slug}`),
  '/mentions-legales',
  '/politique-confidentialite',
  '/live',
  '/documentation',
  '/recommandations',
]

export default defineConfig({
  plugins: [
    react(),
    sitemap({ hostname: 'https://copaf-ports.com', dynamicRoutes: DYNAMIC_ROUTES }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifestFilename: 'manifest.json',
      includeAssets: ['copaf.png'],
      manifest: {
        name: 'COPAF 2026',
        short_name: 'COPAF',
        description: 'Conférence des Ports Africains 2026 — Casablanca, 15-17 septembre',
        lang: 'fr',
        start_url: '/',
        display: 'standalone',
        background_color: '#000E91',
        theme_color: '#000E91',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache le shell + assets statiques ; les pages HTML deja
        // visitees sont mises en cache a la volee (NetworkFirst) pour
        // fonctionner hors-ligne sans jamais servir un contenu perime.
        globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,svg,webp,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: { cacheName: 'pages-cache' },
          },
        ],
      },
    }),
  ],
  base: '/',
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'react-vendor'
          }
          if (id.includes('node_modules/@emailjs')) {
            return 'emailjs'
          }
          if (id.includes('node_modules/@supabase')) {
            return 'supabase'
          }
        },
      },
    },
  },
})