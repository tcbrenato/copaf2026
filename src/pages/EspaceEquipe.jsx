// src/pages/EspaceEquipe.jsx
//
// Espace équipe (/espace-equipe) pour les membres du comité d'organisation : Ma mission, Mon planning,
// Documents de la mission et Mon badge digital. Tout le contenu est saisi dans l'admin (onglet « Équipe »).
// Connexion : numéro de dossier + email, comme /intervenant. La fonction equipe_login ne renvoie que les
// données du membre identifié ; la session ne vit que dans l'onglet (sessionStorage) pour survivre aux
// rechargements automatiques de l'application sans rester ouverte sur un appareil partagé.

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import SeoHead from '../components/SeoHead'
import LangToggle from '../components/LangToggle'
import { useLang } from '../i18n/useLang'
import { normaliserDossier } from '../utils/dossierConstants'
import EquipeMission from '../components/equipe/EquipeMission'
import EquipePlanning from '../components/equipe/EquipePlanning'
import EquipeDocuments from '../components/equipe/EquipeDocuments'
import EquipeBadge from '../components/equipe/EquipeBadge'
import { NAVY, SKY, INK, MUTED, CARTE, initiales } from '../components/equipe/equipeTheme'

const CLE_SESSION = 'copaf_equipe_session'

const TR = {
  fr: {
    seoTitle: 'Espace équipe - COPAF 2026', seoDesc: "Espace réservé aux membres du comité d'organisation de la COPAF 2026.",
    eyebrow: 'COPAF 2026 · Comité d’organisation', titre: 'Espace équipe',
    connexionTexte: 'Connectez-vous avec votre numéro de dossier et l’adresse email communiquée à l’organisation.',
    dossier: 'Numéro de dossier', dossierPh: 'Ex. INT2026-010', email: 'Email', emailPh: 'Votre email',
    connecter: 'Accéder à mon espace', connexion: 'Connexion…', erreur: 'Dossier ou email incorrect.', trop: 'Trop de tentatives, réessayez dans 15 minutes.', reseau: 'Connexion impossible, réessayez.',
    deconnexion: 'Déconnexion', chargement: 'Chargement…',
    mission: 'Ma mission', planning: 'Mon planning', documents: 'Documents', badge: 'Mon badge digital',
    role: 'Rôle', equipe: 'Équipe', responsable: 'Responsable', tenue: 'Tenue / badge', consignes: 'Consignes', rdv: 'Point de rendez-vous',
    missionVide: 'Votre mission vous sera communiquée prochainement.',
    planningVide: 'Votre planning sera communiqué prochainement.', lieu: 'Lieu', aujourdhui: 'Aujourd’hui',
    docsVide: 'Les documents seront disponibles prochainement.', telecharger: 'Télécharger', bientot: 'Bientôt disponible',
    typesDoc: { charte: 'Charte de l’équipe', programme: 'Programme', plan: 'Plan du site' },
    attestation: 'Attestation de participation', attestationBtn: 'Télécharger mon attestation',
    attestationTexte: 'Disponible à partir du 21 octobre 2026.', attestationTexteOuverte: 'Votre attestation sera disponible ici dès qu’elle aura été déposée par l’organisation.',
    comiteMention: 'Comité d’organisation', biographie: 'Biographie', badgeTexte: 'Votre QR code personnel pour l’accréditation et le pointage. Présentez-le à l’accueil.',
    ouvrirBadge: 'Ouvrir mon badge', qrAlt: 'QR code personnel', badgeIndispo: 'Votre badge n’est pas encore disponible.',
  },
  en: {
    seoTitle: 'Team space - COPAF 2026', seoDesc: 'Space reserved for members of the COPAF 2026 organising committee.',
    eyebrow: 'COPAF 2026 · Organising committee', titre: 'Team space',
    connexionTexte: 'Sign in with your file number and the email address given to the organisation.',
    dossier: 'File number', dossierPh: 'E.g. INT2026-010', email: 'Email', emailPh: 'Your email',
    connecter: 'Access my space', connexion: 'Signing in…', erreur: 'Incorrect file number or email.', trop: 'Too many attempts, try again in 15 minutes.', reseau: 'Could not sign in, please try again.',
    deconnexion: 'Sign out', chargement: 'Loading…',
    mission: 'My mission', planning: 'My schedule', documents: 'Documents', badge: 'My digital badge',
    role: 'Role', equipe: 'Team', responsable: 'Manager', tenue: 'Outfit / badge', consignes: 'Instructions', rdv: 'Meeting point',
    missionVide: 'Your mission will be shared with you soon.',
    planningVide: 'Your schedule will be shared with you soon.', lieu: 'Place', aujourdhui: 'Today',
    docsVide: 'Documents will be available soon.', telecharger: 'Download', bientot: 'Coming soon',
    typesDoc: { charte: 'Team charter', programme: 'Programme', plan: 'Site map' },
    attestation: 'Certificate of participation', attestationBtn: 'Download my certificate',
    attestationTexte: 'Available from 21 October 2026.', attestationTexteOuverte: 'Your certificate will be available here as soon as the organisation has uploaded it.',
    comiteMention: 'Organising committee', biographie: 'Biography', badgeTexte: 'Your personal QR code for accreditation and check-in. Show it at the welcome desk.',
    ouvrirBadge: 'Open my badge', qrAlt: 'Personal QR code', badgeIndispo: 'Your badge is not available yet.',
  },
}

const lireSession = () => {
  try { return JSON.parse(sessionStorage.getItem(CLE_SESSION) || 'null') } catch { return null }
}
const ecrireSession = valeur => {
  try { if (valeur) sessionStorage.setItem(CLE_SESSION, JSON.stringify(valeur)); else sessionStorage.removeItem(CLE_SESSION) } catch { /* stockage indisponible : la session reste en mémoire */ }
}

const CHAMP = {
  width: '100%', boxSizing: 'border-box', height: 48, padding: '0 14px', fontSize: 16, fontFamily: 'inherit',
  border: '1.5px solid #cbd5e1', borderRadius: 12, outline: 'none', background: '#fff', color: INK,
}

export default function EspaceEquipe() {
  const lang = useLang()
  const t = TR[lang]
  const [dossier, setDossier] = useState('')
  const [email, setEmail] = useState('')
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState('')
  const [donnees, setDonnees] = useState(null)
  const [onglet, setOnglet] = useState('mission')
  const [reprise, setReprise] = useState(() => !!lireSession())

  // Page privée : ne pas l'indexer
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => document.head.removeChild(meta)
  }, [])

  const connecter = useCallback(async (d, e) => {
    setErreur('')
    const { data, error } = await supabase.rpc('equipe_login', { p_dossier: normaliserDossier(d), p_email: e.trim() })
    if (error) {
      setErreur(/tentatives/i.test(error.message || '') ? t.trop : t.reseau)
      return false
    }
    if (!data) { setErreur(t.erreur); return false }
    setDonnees(data)
    ecrireSession({ dossier: d, email: e.trim() })
    return true
  }, [t])

  // Reprise de la session de l'onglet après un rechargement
  useEffect(() => {
    const session = lireSession()
    if (!session) return undefined
    let annule = false
    connecter(session.dossier, session.email).then(ok => {
      if (annule) return
      if (!ok) ecrireSession(null)
      setReprise(false)
    })
    return () => { annule = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const soumettre = async ev => {
    ev.preventDefault()
    if (!dossier.trim() || !email.trim()) return
    setEnCours(true)
    await connecter(dossier, email)
    setEnCours(false)
  }

  const deconnecter = () => {
    ecrireSession(null)
    setDonnees(null); setDossier(''); setEmail(''); setOnglet('mission')
  }

  const fond = { minHeight: '100vh', background: '#f4f7fb', color: INK, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }
  const police = <style>{"@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');"}</style>

  if (!donnees) {
    return (
      <div style={{ ...fond, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxSizing: 'border-box' }}>
        {police}
        <SeoHead title={t.seoTitle} description={t.seoDesc} type="website" />
        <LangToggle />
        <div style={{ ...CARTE, width: '100%', maxWidth: 420, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '26px 24px 22px', background: `linear-gradient(135deg, ${NAVY}, ${SKY})`, color: '#fff' }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.9 }}>{t.eyebrow}</div>
            <h1 style={{ margin: '6px 0 0', fontSize: 24, fontWeight: 900 }}>{t.titre}</h1>
          </div>
          {reprise ? (
            <p style={{ margin: 0, padding: 24, fontSize: 14, color: MUTED }}>{t.chargement}</p>
          ) : (
            <form onSubmit={soumettre} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ margin: 0, fontSize: 13.5, color: MUTED, lineHeight: 1.5 }}>{t.connexionTexte}</p>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, fontWeight: 700, color: '#334155' }}>
                {t.dossier}
                <input value={dossier} onChange={ev => { setErreur(''); setDossier(ev.target.value) }} placeholder={t.dossierPh} autoCapitalize="characters" autoComplete="username" style={CHAMP} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, fontWeight: 700, color: '#334155' }}>
                {t.email}
                <input value={email} onChange={ev => { setErreur(''); setEmail(ev.target.value) }} placeholder={t.emailPh} type="email" autoComplete="email" style={CHAMP} />
              </label>
              {erreur && <p role="alert" style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#dc2626' }}>{erreur}</p>}
              <button type="submit" disabled={enCours || !dossier.trim() || !email.trim()} style={{ minHeight: 48, border: 'none', borderRadius: 12, background: NAVY, color: '#fff', fontSize: 15, fontWeight: 800, fontFamily: 'inherit', cursor: enCours ? 'wait' : 'pointer', opacity: enCours || !dossier.trim() || !email.trim() ? 0.6 : 1 }}>
                {enCours ? t.connexion : t.connecter}
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  const { membre, photo_url: photoUrl, badge_token: badgeToken } = donnees
  const onglets = [['mission', t.mission], ['planning', t.planning], ['documents', t.documents], ['badge', t.badge]]

  return (
    <div style={fond}>
      {police}
      <SeoHead title={t.seoTitle} description={t.seoDesc} type="website" />
      <LangToggle />

      <header style={{ background: `linear-gradient(135deg, ${NAVY}, #0a4fa3 65%, ${SKY})`, color: '#fff', padding: '64px 16px 22px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 14 }}>
          {photoUrl ? (
            <img src={photoUrl} alt={membre.nom} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', border: '3px solid rgba(255,255,255,.8)', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, background: 'rgba(255,255,255,.18)', border: '3px solid rgba(255,255,255,.6)', flexShrink: 0 }}>{initiales(membre.nom)}</div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.85 }}>{t.eyebrow}</div>
            <h1 style={{ margin: '3px 0 2px', fontSize: 21, fontWeight: 900, lineHeight: 1.2, overflowWrap: 'anywhere' }}>{membre.nom}</h1>
            {membre.role && <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.95, lineHeight: 1.4 }}>{membre.role}</div>}
          </div>
          <button type="button" onClick={deconnecter} style={{ alignSelf: 'flex-start', minHeight: 40, padding: '0 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,.4)', background: 'rgba(255,255,255,.12)', color: '#fff', fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>
            {t.deconnexion}
          </button>
        </div>
      </header>

      <nav aria-label={t.titre} style={{ position: 'sticky', top: 0, zIndex: 20, background: '#f4f7fb', borderBottom: '1px solid #e2e8f0' }}>
        <div role="tablist" style={{ maxWidth: 720, margin: '0 auto', padding: '10px 16px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {onglets.map(([id, libelle]) => {
            const actif = onglet === id
            return (
              <button key={id} type="button" role="tab" aria-selected={actif} onClick={() => setOnglet(id)} style={{
                flexShrink: 0, minHeight: 44, padding: '0 16px', borderRadius: 100, fontSize: 13.5, fontWeight: 800, fontFamily: 'inherit', whiteSpace: 'nowrap', cursor: 'pointer',
                border: actif ? 'none' : '1px solid #cbd5e1', background: actif ? NAVY : '#fff', color: actif ? '#fff' : '#475569',
              }}>
                {libelle}
              </button>
            )
          })}
        </div>
      </nav>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '16px 16px 64px' }}>
        {onglet === 'mission' && <EquipeMission membre={membre} t={t} />}
        {onglet === 'planning' && <EquipePlanning planning={donnees.planning} lang={lang} t={t} />}
        {onglet === 'documents' && <EquipeDocuments documents={donnees.documents} membre={membre} t={t} />}
        {onglet === 'badge' && <EquipeBadge membre={membre} photoUrl={photoUrl} badgeToken={badgeToken} t={t} />}
      </main>
    </div>
  )
}
