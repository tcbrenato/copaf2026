// src/pages/EspaceTraducteur.jsx
//
// Espace traducteurs (/espace-traducteur) : infos clés (8 cartes qui ouvrent chacune une fenêtre) et documents de travail.
// Entièrement bilingue FR/EN (sélecteur de langue du site). Tout le contenu est saisi dans l'admin (onglet « Traducteurs »).
// Connexion : numéro de dossier + e-mail, comme /intervenant et /espace-equipe ; la fonction traducteur_login ne renvoie
// que le contenu de l'espace et les noms des collègues (jamais e-mail, téléphone ni données des autres intervenants).
// La session ne vit que dans l'onglet (sessionStorage).

import { useCallback, useEffect, useState } from 'react'
import { BookText, CalendarClock, CalendarDays, Headphones, Info, Languages, Mic, PhoneCall, ShieldCheck, Bell } from 'lucide-react'
import { supabase } from '../supabase'
import SeoHead from '../components/SeoHead'
import LangToggle from '../components/LangToggle'
import { useLang } from '../i18n/useLang'
import { normaliserDossier } from '../utils/dossierConstants'
import { NAVY, SKY, INK, MUTED, CARTE, initiales } from '../components/equipe/equipeTheme'
import TraducteurModale from '../components/traducteur/TraducteurModale'
import TraducteurTexte from '../components/traducteur/TraducteurTexte'
import { ContenuGlossaire, ContenuIntervenants, ContenuPlanning, ContenuProgramme } from '../components/traducteur/TraducteurContenus'
import { dans } from '../components/traducteur/traducteurUtils'
import TraducteurDocuments from '../components/traducteur/TraducteurDocuments'

const CLE_SESSION = 'copaf_traducteur_session'
const cleVu = dossier => `copaf_trad_vu_${dossier}`

const TR = {
  fr: {
    seoTitle: 'Espace traducteurs - COPAF 2026', seoDesc: 'Espace réservé aux traducteurs-interprètes de la COPAF 2026.',
    eyebrow: 'COPAF 2026 · Interprétation', titre: 'Espace traducteurs',
    connexionTexte: 'Connectez-vous avec votre numéro de dossier et l’adresse email communiquée à l’organisation.',
    dossier: 'Numéro de dossier', dossierPh: 'Ex. INT2026-014', email: 'Email', emailPh: 'Votre email',
    connecter: 'Accéder à mon espace', connexion: 'Connexion…', erreur: 'Dossier ou email incorrect.', trop: 'Trop de tentatives, réessayez dans 15 minutes.', reseau: 'Connexion impossible, réessayez.',
    deconnexion: 'Déconnexion', chargement: 'Chargement…', fermer: 'Fermer',
    accueil: 'Accueil', documents: 'Documents', bienvenue: 'Les informations clés de la mission, en un coup d’œil. Touchez une carte pour l’ouvrir.',
    nouveauxDocs: n => (n > 1 ? `${n} nouveaux documents sont disponibles` : '1 nouveau document est disponible'), voirDocs: 'Voir les documents',
    indices: { conference: 'Thème, dates, lieu, organisateurs', programme: 'Jour par jour · visite de terrain le jour 3', planning: 'Vos sessions et les relais', intervenants: 'Qui parle, quand, et comment le prononcer', glossaire: 'Termes et sigles, avec recherche', logistique: 'Cabine, matériel, pauses', contacts: 'Qui appeler en cas de problème', regles: 'Confidentialité, ponctualité, tenue, badge' },
    jour: 'Jour', jour3: 'Jour 3 : visite de terrain au Port de Casablanca. Les conditions d’interprétation changent.', aCompleter: 'À compléter', horaireACompleter: 'Horaire : À compléter',
    equipeTrad: 'Équipe d’interprétation', mesSessions: 'Mes sessions', vous: 'Vous', traducteurLabel: 'Traducteur', relais: 'Relais',
    prononciation: 'Prononciation', langueIntervention: 'Langue', session: 'Session',
    toutes: 'Tout', catPortuaire: 'Portuaire', catIA: 'IA', catCyber: 'Cybersécurité', catSigles: 'Sigles', rechercher: 'Rechercher un terme…', categories: 'Catégories',
    disponibles: 'disponible(s)', enAttente: 'en attente', ajouteLe: 'Ajouté le', statutDisponible: 'Disponible', statutAttente: 'En attente', nouveau: 'Nouveau', telecharger: 'Télécharger', pasEncore: 'Pas encore disponible',
    categoriesDoc: { programme: 'Programme officiel', carnet: 'Carnet de la conférence', intervenants: 'Liste des intervenants', presentations: 'Présentations et discours des intervenants', glossaire: 'Glossaire', plan: 'Plan du lieu et des salles', note: 'Note de cadrage des traducteurs', magazine: 'Magazine AMP/MPA' },
  },
  en: {
    seoTitle: 'Interpreters space - COPAF 2026', seoDesc: 'Space reserved for the COPAF 2026 interpreters.',
    eyebrow: 'COPAF 2026 · Interpreting', titre: 'Interpreters space',
    connexionTexte: 'Sign in with your file number and the email address given to the organisation.',
    dossier: 'File number', dossierPh: 'E.g. INT2026-014', email: 'Email', emailPh: 'Your email',
    connecter: 'Access my space', connexion: 'Signing in…', erreur: 'Incorrect file number or email.', trop: 'Too many attempts, try again in 15 minutes.', reseau: 'Could not sign in, please try again.',
    deconnexion: 'Sign out', chargement: 'Loading…', fermer: 'Close',
    accueil: 'Home', documents: 'Documents', bienvenue: 'The key information for your mission at a glance. Tap a card to open it.',
    nouveauxDocs: n => (n > 1 ? `${n} new documents are available` : '1 new document is available'), voirDocs: 'View documents',
    indices: { conference: 'Theme, dates, venue, organisers', programme: 'Day by day · field visit on day 3', planning: 'Your sessions and handovers', intervenants: 'Who speaks, when, and how to pronounce', glossaire: 'Terms and acronyms, searchable', logistique: 'Booth, equipment, breaks', contacts: 'Who to call if there is a problem', regles: 'Confidentiality, punctuality, dress code, badge' },
    jour: 'Day', jour3: 'Day 3: field visit to the Port of Casablanca. Interpreting conditions change.', aCompleter: 'To be completed', horaireACompleter: 'Time: To be completed',
    equipeTrad: 'Interpreting team', mesSessions: 'My sessions', vous: 'You', traducteurLabel: 'Interpreter', relais: 'Handover',
    prononciation: 'Pronunciation', langueIntervention: 'Language', session: 'Session',
    toutes: 'All', catPortuaire: 'Port', catIA: 'AI', catCyber: 'Cybersecurity', catSigles: 'Acronyms', rechercher: 'Search a term…', categories: 'Categories',
    disponibles: 'available', enAttente: 'pending', ajouteLe: 'Added on', statutDisponible: 'Available', statutAttente: 'Pending', nouveau: 'New', telecharger: 'Download', pasEncore: 'Not available yet',
    categoriesDoc: { programme: 'Official programme', carnet: 'Conference booklet', intervenants: 'List of speakers', presentations: 'Speakers’ presentations and speeches', glossaire: 'Glossary', plan: 'Venue and room plan', note: 'Interpreters’ briefing note', magazine: 'AMP/MPA magazine' },
  },
}

const ICONES = { conference: Info, programme: CalendarDays, planning: CalendarClock, intervenants: Mic, glossaire: BookText, logistique: Headphones, contacts: PhoneCall, regles: ShieldCheck }

const lireSession = () => {
  try { return JSON.parse(sessionStorage.getItem(CLE_SESSION) || 'null') } catch { return null }
}
const ecrireSession = valeur => {
  try { if (valeur) sessionStorage.setItem(CLE_SESSION, JSON.stringify(valeur)); else sessionStorage.removeItem(CLE_SESSION) } catch { /* stockage indisponible : la session reste en mémoire */ }
}
const lireVu = dossier => { try { return localStorage.getItem(cleVu(dossier)) } catch { return null } }
const ecrireVu = dossier => { try { localStorage.setItem(cleVu(dossier), new Date().toISOString()) } catch { /* stockage indisponible */ } }

const CHAMP = {
  width: '100%', boxSizing: 'border-box', height: 48, padding: '0 14px', fontSize: 16, fontFamily: 'inherit',
  border: '1.5px solid #cbd5e1', borderRadius: 12, outline: 'none', background: '#fff', color: INK,
}

export default function EspaceTraducteur() {
  const lang = useLang()
  const t = TR[lang]
  const [dossier, setDossier] = useState('')
  const [email, setEmail] = useState('')
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState('')
  const [donnees, setDonnees] = useState(null)
  const [onglet, setOnglet] = useState('accueil')
  const [ouverte, setOuverte] = useState(null) // identifiant de la carte ouverte
  const [vuAvant, setVuAvant] = useState(null)
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
    const { data, error } = await supabase.rpc('traducteur_login', { p_dossier: normaliserDossier(d), p_email: e.trim() })
    if (error) {
      setErreur(/tentatives/i.test(error.message || '') ? t.trop : t.reseau)
      return false
    }
    if (!data) { setErreur(t.erreur); return false }
    // Documents devenus disponibles depuis la dernière visite : la première visite sert de référence (rien n'est « nouveau »)
    const vu = lireVu(data.traducteur.dossier)
    setVuAvant(vu)
    if (!vu) ecrireVu(data.traducteur.dossier)
    setDonnees(data)
    ecrireSession({ dossier: d, email: e.trim() })
    return true
  }, [t])

  // Reprise de la session de l'onglet après un rechargement
  useEffect(() => {
    const session = lireSession()
    if (!session) return undefined
    let annule = false
    const minuteur = setTimeout(() => {
      connecter(session.dossier, session.email).then(ok => {
        if (annule) return
        if (!ok) ecrireSession(null)
        setReprise(false)
      })
    }, 0)
    return () => { annule = true; clearTimeout(minuteur) }
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
    setDonnees(null); setDossier(''); setEmail(''); setOnglet('accueil'); setOuverte(null)
  }

  const allerAuxDocuments = () => {
    setOnglet('documents')
    if (donnees) ecrireVu(donnees.traducteur.dossier) // les badges « Nouveau » restent visibles pendant cette visite
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
            <form onSubmit={soumettre} style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
              <p style={{ margin: '0 0 14px', fontSize: 13.5, color: MUTED, lineHeight: 1.5 }}>{t.connexionTexte}</p>
              <label style={{ display: 'flex', flexDirection: 'column', marginBottom: 14, fontSize: 12.5, fontWeight: 700, color: '#334155' }}>
                <span style={{ marginBottom: 6 }}>{t.dossier}</span>
                <input value={dossier} onChange={ev => { setErreur(''); setDossier(ev.target.value) }} placeholder={t.dossierPh} autoCapitalize="characters" autoComplete="username" style={CHAMP} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', marginBottom: 14, fontSize: 12.5, fontWeight: 700, color: '#334155' }}>
                <span style={{ marginBottom: 6 }}>{t.email}</span>
                <input value={email} onChange={ev => { setErreur(''); setEmail(ev.target.value) }} placeholder={t.emailPh} type="email" autoComplete="email" style={CHAMP} />
              </label>
              {erreur && <p role="alert" style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#dc2626' }}>{erreur}</p>}
              <button type="submit" disabled={enCours || !dossier.trim() || !email.trim()} style={{ minHeight: 48, border: 'none', borderRadius: 12, background: NAVY, color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', opacity: enCours || !dossier.trim() || !email.trim() ? 0.6 : 1 }}>
                {enCours ? t.connexion : t.connecter}
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  const { traducteur, traducteurs, cartes, programme, planning, intervenants, glossaire, documents } = donnees
  const nomComplet = `${traducteur.prenom || ''} ${traducteur.nom || ''}`.trim()
  const nouveaux = new Set(documents.filter(d => d.statut === 'disponible' && d.url && d.disponible_le && vuAvant && d.disponible_le > vuAvant).map(d => d.id))
  const carteOuverte = cartes.find(c => c.id === ouverte)
  const attente = documents.filter(d => !(d.statut === 'disponible' && d.url)).length

  const contenuModale = () => {
    if (!carteOuverte) return null
    if (carteOuverte.id === 'programme') return <ContenuProgramme carte={carteOuverte} programme={programme} lang={lang} t={t} />
    if (carteOuverte.id === 'planning') return <ContenuPlanning carte={carteOuverte} planning={planning} traducteurs={traducteurs} dossier={traducteur.dossier} lang={lang} t={t} />
    if (carteOuverte.id === 'intervenants') return <ContenuIntervenants carte={carteOuverte} intervenants={intervenants} lang={lang} t={t} />
    if (carteOuverte.id === 'glossaire') return <ContenuGlossaire carte={carteOuverte} glossaire={glossaire} lang={lang} t={t} />
    return <TraducteurTexte texte={dans(carteOuverte, 'contenu', lang)} />
  }

  const onglets = [['accueil', t.accueil, () => setOnglet('accueil')], ['documents', t.documents, allerAuxDocuments]]

  return (
    <div style={fond}>
      {police}
      <SeoHead title={t.seoTitle} description={t.seoDesc} type="website" />
      <LangToggle />

      <header style={{ background: `linear-gradient(135deg, ${NAVY}, #0a4fa3 65%, ${SKY})`, color: '#fff', padding: '64px 16px 22px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center' }}>
          {traducteur.photo_url ? (
            <img src={traducteur.photo_url} alt={nomComplet} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', border: '3px solid rgba(255,255,255,.8)', flexShrink: 0, marginRight: 14 }} />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, background: 'rgba(255,255,255,.18)', border: '3px solid rgba(255,255,255,.5)', flexShrink: 0, marginRight: 14 }}>{initiales(nomComplet)}</div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.85 }}>{t.eyebrow}</div>
            <h1 style={{ margin: '3px 0 2px', fontSize: 21, fontWeight: 900, lineHeight: 1.2, overflowWrap: 'anywhere' }}>{nomComplet}</h1>
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.95 }}>FR ↔ EN</div>
          </div>
          <button type="button" onClick={deconnecter} style={{ alignSelf: 'flex-start', minHeight: 44, padding: '0 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,.4)', background: 'rgba(255,255,255,.12)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginLeft: 8 }}>
            {t.deconnexion}
          </button>
        </div>
      </header>

      <nav aria-label={t.titre} style={{ position: 'sticky', top: 0, zIndex: 20, background: '#f4f7fb', borderBottom: '1px solid #e2e8f0' }}>
        <div role="tablist" style={{ maxWidth: 760, margin: '0 auto', padding: '10px 16px', display: 'flex', overflowX: 'auto' }}>
          {onglets.map(([id, libelle, action]) => {
            const actif = onglet === id
            return (
              <button key={id} type="button" role="tab" aria-selected={actif} onClick={action} style={{
                flexShrink: 0, minHeight: 46, padding: '0 20px', marginRight: 8, borderRadius: 100, fontSize: 14, fontWeight: 800, fontFamily: 'inherit', whiteSpace: 'nowrap', cursor: 'pointer',
                border: actif ? 'none' : '1px solid #cbd5e1', background: actif ? NAVY : '#fff', color: actif ? '#fff' : '#475569',
              }}>
                {libelle}
                {id === 'documents' && attente > 0 && <span style={{ marginLeft: 8, padding: '1px 8px', borderRadius: 100, background: actif ? '#fcd34d' : '#fef3c7', color: '#92400e', fontSize: 12, fontWeight: 900 }}>{attente}</span>}
              </button>
            )
          })}
        </div>
      </nav>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '16px 16px 64px' }}>
        {onglet === 'accueil' && (
          <>
            {nouveaux.size > 0 && (
              <button type="button" onClick={allerAuxDocuments} style={{ display: 'flex', alignItems: 'center', width: '100%', textAlign: 'left', minHeight: 54, padding: '10px 16px', marginBottom: 14, borderRadius: 14, border: '1.5px solid #86efac', background: '#f0fdf4', color: '#166534', fontSize: 14.5, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
                <Bell size={20} aria-hidden="true" style={{ marginRight: 10, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{t.nouveauxDocs(nouveaux.size)}</span>
                <span style={{ textDecoration: 'underline', marginLeft: 10 }}>{t.voirDocs}</span>
              </button>
            )}
            <p style={{ margin: '0 0 14px', fontSize: 14.5, color: MUTED, lineHeight: 1.5 }}>
              <Languages size={16} aria-hidden="true" style={{ verticalAlign: '-3px', marginRight: 6 }} />{t.bienvenue}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -6px' }}>
              {cartes.map(c => {
                const Icone = ICONES[c.id] || Info
                return (
                  <div key={c.id} style={{ width: '50%', minWidth: 240, flexGrow: 1, boxSizing: 'border-box', padding: 6 }}>
                    <button type="button" onClick={() => setOuverte(c.id)} aria-haspopup="dialog"
                      style={{ ...CARTE, width: '100%', minHeight: 112, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'flex-start', border: '1px solid #dbe5f1', boxSizing: 'border-box' }}>
                      <span style={{ width: 46, height: 46, borderRadius: 14, background: NAVY, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 14 }}>
                        <Icone size={23} aria-hidden="true" />
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: 16, fontWeight: 900, color: INK, lineHeight: 1.25 }}>{dans(c, 'titre', lang)}</span>
                        <span style={{ display: 'block', fontSize: 13, color: MUTED, marginTop: 4, lineHeight: 1.4 }}>{t.indices[c.id]}</span>
                      </span>
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}
        {onglet === 'documents' && <TraducteurDocuments documents={documents} nouveaux={nouveaux} lang={lang} t={t} />}
      </main>

      {carteOuverte && (
        <TraducteurModale titre={dans(carteOuverte, 'titre', lang)} libelleFermer={t.fermer} fermer={() => setOuverte(null)}>
          {contenuModale()}
        </TraducteurModale>
      )}
    </div>
  )
}
