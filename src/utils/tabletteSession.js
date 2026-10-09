// Connexion automatique des tablettes par lien personnel (voir supabase/migrations/20261009180000_tablette_liens_personnels.sql).
//
// Le lien /tablette?t=JETON est lu une seule fois : un script placé en tête de index.html range le jeton dans
// sessionStorage et retire « ?t=… » de la barre d'adresse AVANT le chargement des outils de mesure d'audience.
// Ici on échange ce jeton contre une session (30 jours, prolongée à chaque visite) gardée dans localStorage.
// Limite assumée : le site est statique (aucun serveur d'application) donc la session ne peut pas être un cookie
// httpOnly ; elle est vérifiée côté base à chaque ouverture et révocable à tout moment depuis l'administration.

import { supabase } from '../supabase'

const CLE_SESSION = 'copaf_tablette_session'
const CLE_IDENTITE = 'copaf_tablette_identite'
export const CLE_JETON_EN_ATTENTE = 'copaf_tablette_t'

const lire = (stockage, cle) => { try { return window[stockage].getItem(cle) } catch { return null } }
const ecrire = (stockage, cle, valeur) => { try { window[stockage].setItem(cle, valeur) } catch { /* stockage indisponible */ } }
const effacer = (stockage, cle) => { try { window[stockage].removeItem(cle) } catch { /* stockage indisponible */ } }

export const lireSession = () => lire('localStorage', CLE_SESSION)

export function lireIdentiteLocale() {
  try { return JSON.parse(lire('localStorage', CLE_IDENTITE) || 'null') } catch { return null }
}

export function effacerSession() {
  effacer('localStorage', CLE_SESSION)
  effacer('localStorage', CLE_IDENTITE)
}

// Jeton du lien : d'abord celui rangé par le script d'en-tête, sinon (navigateur sans cette étape) celui de l'adresse.
export function lireJetonEnAttente() {
  const range = lire('sessionStorage', CLE_JETON_EN_ATTENTE)
  if (range) return range
  try {
    const t = new URLSearchParams(window.location.search).get('t')
    return t ? t.trim() : null
  } catch { return null }
}

export function oublierJeton() {
  effacer('sessionStorage', CLE_JETON_EN_ATTENTE)
  try {
    if (new URLSearchParams(window.location.search).has('t')) window.history.replaceState(null, '', window.location.pathname)
  } catch { /* historique indisponible */ }
}

const erreurReseau = error => !!error && !/trop de tentatives/i.test(error.message || '')

// Échange le jeton du lien contre une session. statut : 'ok' | 'invalide' | 'limite' | 'reseau'
export async function connecterParJeton(jeton) {
  const { data, error } = await supabase.rpc('tablette_connecter', { p_token: jeton })
  if (error) return { statut: /trop de tentatives/i.test(error.message || '') ? 'limite' : 'reseau' }
  if (!data || !data.session) return { statut: 'invalide' }
  const { session, ...identite } = data
  ecrire('localStorage', CLE_SESSION, session)
  ecrire('localStorage', CLE_IDENTITE, JSON.stringify(identite))
  return { statut: 'ok', identite }
}

// Revérifie la session gardée. statut : 'ok' | 'absente' | 'invalide' | 'reseau'
export async function verifierSession() {
  const session = lireSession()
  if (!session) return { statut: 'absente' }
  const { data, error } = await supabase.rpc('tablette_session', { p_session: session })
  if (erreurReseau(error)) return { statut: 'reseau' }
  if (error || !data) return { statut: 'invalide' }
  ecrire('localStorage', CLE_IDENTITE, JSON.stringify(data))
  return { statut: 'ok', identite: data }
}
