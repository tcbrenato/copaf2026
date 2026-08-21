import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'
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
]

export default defineConfig({
  plugins: [
    react(),
    sitemap({ hostname: 'https://copaf-ports.com', dynamicRoutes: DYNAMIC_ROUTES }),
  ],
  base: './',
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