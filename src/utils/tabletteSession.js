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

// Code du lien : d'abord celui rangé par le script d'en-tête, sinon (navigateur sans cette étape) celui de l'adresse
// (/t/CODE, ou l'ancien format /tablette?t=JETON).
export function lireJetonEnAttente() {
  const range = lire('sessionStorage', CLE_JETON_EN_ATTENTE)
  if (range) return range
  try {
    const court = window.location.pathname.match(/^\/t\/([A-Za-z0-9_-]+)\/?$/)
    if (court) return court[1]
    const t = new URLSearchParams(window.location.search).get('t')
    return t ? t.trim() : null
  } catch { return null }
}

export function oublierJeton() {
  effacer('sessionStorage', CLE_JETON_EN_ATTENTE)
  try {
    // Lien court /t/CODE : on arrive sur l'outil Diagnostic ; ancien format /tablette?t= : on reste sur /tablette
    if (/^\/t\//.test(window.location.pathname)) window.history.replaceState(null, '', '/diagnostic')
    else if (new URLSearchParams(window.location.search).has('t')) window.history.replaceState(null, '', window.location.pathname)
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

// Point d'entrée commun aux outils : échange le code du lien s'il y en a un, sinon revérifie la session gardée.
// statut : 'ok' | 'absente' | 'invalide' | 'limite' | 'reseau'
export async function ouvrirSessionTablette() {
  const jeton = lireJetonEnAttente()
  if (jeton) {
    const r = await connecterParJeton(jeton)
    if (r.statut !== 'reseau') oublierJeton() // en cas de coupure réseau on garde le code pour réessayer
    return r
  }
  if (!lireSession()) return { statut: 'absente' }
  return verifierSession()
}

// Identité complète (nom, e-mail, téléphone, port, pays, poste) pour pré-remplir l'outil Diagnostic. null si session invalide.
export async function chargerIdentiteDiagnostic() {
  const session = lireSession()
  if (!session) return null
  const { data, error } = await supabase.rpc('tablette_identite_diagnostic', { p_session: session })
  return error || !data ? null : data
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
