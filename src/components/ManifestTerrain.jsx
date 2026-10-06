import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Sur /terrain, /staff/scan et /terrain-app, le navigateur propose d'installer l'application « COPAF Terrain »
// (nom, icône et page de démarrage dédiés) au lieu de l'application du site. Ailleurs, on remet le manifeste d'origine.
const MANIFESTE_SITE = '/manifest.json'
const MANIFESTE_TERRAIN = '/terrain.webmanifest'
const ICONE_SITE = '/icons/icon-192.png'
const ICONE_TERRAIN = '/icons/terrain-192.png'

const estPageTerrain = chemin => chemin === '/terrain' || chemin.startsWith('/terrain/') || chemin === '/terrain-app' || chemin.startsWith('/staff/scan')

function reglerMeta(nom, valeur) {
  let meta = document.head.querySelector(`meta[name="${nom}"]`)
  if (!meta) { meta = document.createElement('meta'); meta.name = nom; document.head.appendChild(meta) }
  meta.content = valeur
}

export default function ManifestTerrain() {
  const { pathname } = useLocation()

  useEffect(() => {
    const terrain = estPageTerrain(pathname)
    let lien = document.head.querySelector('link[rel="manifest"]')
    if (!lien) { lien = document.createElement('link'); lien.rel = 'manifest'; document.head.appendChild(lien) }
    lien.setAttribute('href', terrain ? MANIFESTE_TERRAIN : MANIFESTE_SITE)
    const icone = document.head.querySelector('link[rel="apple-touch-icon"]')
    if (icone) icone.setAttribute('href', terrain ? ICONE_TERRAIN : ICONE_SITE)
    reglerMeta('apple-mobile-web-app-title', terrain ? 'COPAF Terrain' : 'COPAF 2026')
    reglerMeta('theme-color', terrain ? '#00367F' : '#000E91')
  }, [pathname])

  return null
}
