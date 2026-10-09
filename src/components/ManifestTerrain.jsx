import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Chaque outil a son propre manifeste : « Ajouter à l'écran d'accueil » crée alors un raccourci qui ouvre CET outil
// (nom, icône et page de démarrage dédiés) au lieu de la page d'accueil du site. Ailleurs, manifeste d'origine.
const MANIFESTE_SITE = '/manifest.json'
const ICONE_SITE = '/icons/icon-192.png'

const APPLIS = [
  {
    test: p => p === '/terrain' || p.startsWith('/terrain/') || p === '/terrain-app' || p.startsWith('/staff/scan'),
    manifeste: '/terrain.webmanifest', icone: '/icons/terrain-192.png', titre: 'COPAF Terrain', couleur: '#00367F',
  },
  { test: p => p === '/tablette' || p.startsWith('/tablette/'), manifeste: '/tablette.webmanifest', titre: 'COPAF Tablette' },
  { test: p => p === '/vote', manifeste: '/sondage.webmanifest', titre: 'COPAF Sondage' },
  {
    test: p => (p === '/diagnostic' || p.startsWith('/diagnostic/')) && p !== '/diagnostic/projection',
    manifeste: '/diagnostic.webmanifest', titre: 'COPAF Diagnostic',
  },
]

function reglerMeta(nom, valeur) {
  let meta = document.head.querySelector(`meta[name="${nom}"]`)
  if (!meta) { meta = document.createElement('meta'); meta.name = nom; document.head.appendChild(meta) }
  meta.content = valeur
}

export default function ManifestTerrain() {
  const { pathname } = useLocation()

  useEffect(() => {
    const appli = APPLIS.find(a => a.test(pathname))
    let lien = document.head.querySelector('link[rel="manifest"]')
    if (!lien) { lien = document.createElement('link'); lien.rel = 'manifest'; document.head.appendChild(lien) }
    lien.setAttribute('href', appli ? appli.manifeste : MANIFESTE_SITE)
    const icone = document.head.querySelector('link[rel="apple-touch-icon"]')
    if (icone) icone.setAttribute('href', appli?.icone || ICONE_SITE)
    reglerMeta('apple-mobile-web-app-title', appli ? appli.titre : 'COPAF 2026')
    reglerMeta('theme-color', appli?.couleur || '#000E91')
  }, [pathname])

  return null
}
