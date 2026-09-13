import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/i18n.js'
import App from './App.jsx'

// Le service worker (autoUpdate + skipWaiting/clientsClaim, voir
// vite.config.js) prend la main sur un onglet deja ouvert des qu'un nouveau
// deploiement est detecte, sans prevenir le JS deja charge en memoire. Si
// l'onglet reste ouvert (change d'onglet puis retour) et qu'on navigue
// ensuite vers un chunk code-splitte dont le hash a change entre-temps, le
// fetch de l'ancien chunk echoue silencieusement — vu comme un "plantage
// aleatoire". Un seul rechargement controle des que le nouveau SW prend le
// controle evite ce decalage, plutot que de laisser tourner une version
// figee dont les chunks ne correspondent plus a ce que sert le serveur.
//
// Piege classique (deja rencontre — cause d'un ecran blanc "useCallback is
// not defined" juste apres deploiement) : le tout premier controllerchange
// d'un onglet correspond simplement a l'activation initiale du service
// worker (aucun controleur -> ce SW), pas a une vraie mise a jour vers une
// nouvelle version. Recharger sur CET evenement-la recharge la page en
// pleine installation du SW (cache de precache pas encore garanti complet),
// ce qui peut servir un jeu de fichiers incoherent. On n'ecoute donc que les
// changements de controleur qui suivent un premier controleur deja en place.
if ('serviceWorker' in navigator) {
  let hadController = !!navigator.serviceWorker.controller
  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) { hadController = true; return }
    if (refreshing) return
    refreshing = true
    window.location.reload()
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
