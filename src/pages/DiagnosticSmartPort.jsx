import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import RetourMenu from '../components/RetourMenu'
import { AXES, ECHELLE, txt } from '../utils/diagnosticAxes'
import { RESEAUX, ORG_AUTRE, getOrganisationsByNetwork, findOrganisationById, searchOrganisations } from '../utils/diagnosticOrganisations'

const NAVY = '#000E91'
const BLUE = '#0073F4'

const TR = {
  fr: {
    intro: "Évaluez le niveau de maturité digitale de votre port sur 10 dimensions, et repartez avec des recommandations personnalisées.",
    tabDossier: 'Par numéro de dossier',
    tabDirecte: 'Mes informations directement',
    dossierLabel: "Votre numéro de dossier ou votre email d'inscription",
    dossierPlaceholder: 'COPAF2026-XXXXX ou votre@email.com',
    dossierErreur: "Aucune inscription trouvée avec cette référence ou cet email. Vérifiez, ou passez en saisie directe ci-dessus.",
    recherche: 'Recherche en cours...',
    continuer: 'Continuer',
    prenom: 'Prénom *', prenomP: 'Votre prénom',
    nom: 'Nom *', nomP: 'Votre nom',
    telephone: 'Téléphone', telephoneP: '+xxx xxx xxx xxx',
    email: 'Email', emailP: 'votre@email.com',
    organisation: 'Organisation *',
    organisationSearch: 'Rechercher votre organisation, votre pays...',
    organisationAucun: 'Aucune organisation trouvée pour cette recherche.',
    site: 'Site précis évalué *',
    siteAide: 'Cette organisation gère plusieurs sites — précisez celui concerné par ce diagnostic.',
    autreOrgNom: "Nom de votre organisation *", autreOrgNomP: 'Ex : Port Autonome de Kribi',
    autrePays: 'Pays *', autrePaysP: 'Ex : Cameroun',
    changer: 'Changer',
    erreurForm: 'Merci de renseigner au moins votre nom, prénom et organisation.',
    avantCommencer: 'Avant de commencer',
    commentFonctionne: 'Comment fonctionne ce diagnostic',
    explication: "10 dimensions du « Smart Port » à évaluer, notées de 0 à 5. Prenez un instant pour lire chaque définition — une compréhension commune garantit des résultats comparables entre tous les ports.",
    bareme: 'Le barème de notation',
    dixDimensions: 'Les 10 dimensions évaluées',
    jaiCompris: "J'ai compris, commencer le diagnostic",
    axe: 'Axe', sur: '/',
    precedent: 'Précédent',
    suivant: 'Suivant',
    terminer: 'Terminer le diagnostic',
    enregistrement: 'Enregistrement sécurisé de votre diagnostic...',
    erreur: 'Erreur : ',
    liveAutres: n => n === 1
      ? '1 autre personne remplit aussi ce diagnostic pour ce site en ce moment.'
      : `${n} autres personnes remplissent aussi ce diagnostic pour ce site en ce moment.`,
    liveAgregatTitre: 'Moyenne collective actuelle pour ce site',
    liveAgregatNote: n => `${n} diagnostic${n > 1 ? 's' : ''} déjà soumis pour ce site pendant la conférence.`,
  },
  en: {
    intro: "Assess your port's digital maturity across 10 dimensions, and leave with personalised recommendations.",
    tabDossier: 'By registration number',
    tabDirecte: 'My information directly',
    dossierLabel: 'Your registration number or registration email',
    dossierPlaceholder: 'COPAF2026-XXXXX or your@email.com',
    dossierErreur: 'No registration found with this reference or email. Please check, or switch to direct entry above.',
    recherche: 'Searching...',
    continuer: 'Continue',
    prenom: 'First name *', prenomP: 'Your first name',
    nom: 'Last name *', nomP: 'Your last name',
    telephone: 'Phone', telephoneP: '+xxx xxx xxx xxx',
    email: 'Email', emailP: 'your@email.com',
    organisation: 'Organisation *',
    organisationSearch: 'Search your organisation, your country...',
    organisationAucun: 'No organisation found for this search.',
    site: 'Specific site being assessed *',
    siteAide: 'This organisation runs several sites — specify which one this diagnostic covers.',
    autreOrgNom: 'Your organisation name *', autreOrgNomP: 'E.g.: Port Autonome de Kribi',
    autrePays: 'Country *', autrePaysP: 'E.g.: Cameroon',
    changer: 'Change',
    erreurForm: 'Please provide at least your first name, last name and organisation.',
    avantCommencer: 'Before you start',
    commentFonctionne: 'How this diagnostic works',
    explication: '10 "Smart Port" dimensions to assess, scored from 0 to 5. Take a moment to read each definition — a shared understanding ensures results are comparable across all ports.',
    bareme: 'The scoring scale',
    dixDimensions: 'The 10 dimensions assessed',
    jaiCompris: 'Got it, start the diagnostic',
    axe: 'Dimension', sur: '/',
    precedent: 'Previous',
    suivant: 'Next',
    terminer: 'Finish the diagnostic',
    enregistrement: 'Securely saving your diagnostic...',
    erreur: 'Error: ',
    liveAutres: n => n === 1
      ? '1 other person is also filling out this diagnostic for this site right now.'
      : `${n} other people are also filling out this diagnostic for this site right now.`,
    liveAgregatTitre: 'Current collective average for this site',
    liveAgregatNote: n => `${n} diagnostic${n > 1 ? 's' : ''} already submitted for this site during the conference.`,
  },
}

const Ico = ({ name, size = 20, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    check: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    arrow: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    arrowLeft: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    info: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    globe: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    search: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    infrastructure: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    automatisation: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    tracabilite: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
    ia: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 1 7.54 16.63"/><path d="M12 12v9"/><path d="M12 2a10 10 0 0 0-7.54 16.63"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>,
    cybersecurite: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    surete: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    environnement: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22s2-2 5-2 5 2 8 2 5-2 5-2V3s-2 2-5 2-5-2-8-2-5 2-5 2z"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    synchromodalite: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>,
    competences: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
    parties_prenantes: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  }
  return icons[name] || null
}

export default function DiagnosticSmartPort() {
  const navigate = useNavigate()

  const [lang, setLang] = useState('fr')
  const t = TR[lang]

  const [etape, setEtape] = useState(-1)

  const [identMode, setIdentMode] = useState('dossier')
  const [recherche, setRecherche] = useState('')
  const [chercheEnCours, setChercheEnCours] = useState(false)
  const [erreurRecherche, setErreurRecherche] = useState('')

  const [form, setForm] = useState({ prenom: '', nom: '', telephone: '', email: '', organisation: '', pays: '' })
  const [erreurForm, setErreurForm] = useState('')

  // Identification a deux niveaux : organisation, puis site precis si
  // l'organisation en gere plusieurs. "autre" declenche la saisie libre.
  const [orgQuery, setOrgQuery] = useState('')
  const [orgId, setOrgId] = useState('')
  const [siteId, setSiteId] = useState('')
  const [autreOrgNom, setAutreOrgNom] = useState('')
  const [autrePays, setAutrePays] = useState('')

  const [reponses, setReponses] = useState({})
  const [soumission, setSoumission] = useState(false)
  const [erreurSoumission, setErreurSoumission] = useState('')

  // Session collaborative (phase 2) : des qu'une organisation + site precis
  // est choisi, on rejoint un canal Realtime partage par tous les
  // repondants de ce meme site (compteur de participants en ligne +
  // moyenne collective en direct, calculee cote serveur via une RPC qui ne
  // renvoie que des agregats, jamais de reponse individuelle).
  const [participantsCount, setParticipantsCount] = useState(1)
  const [liveAggregate, setLiveAggregate] = useState(null)
  const channelRef = useRef(null)

  const handleFormChange = (champ, valeur) => setForm(f => ({ ...f, [champ]: valeur }))

  const orgSelectionnee = orgId && orgId !== ORG_AUTRE.id ? findOrganisationById(orgId) : null
  const siteSelectionne = orgSelectionnee?.sites?.find(s => s.id === siteId)
  const siteKey = orgSelectionnee ? `${orgId}${siteSelectionne ? ':' + siteId : ''}` : null

  useEffect(() => {
    if (!siteKey) {
      setParticipantsCount(1)
      setLiveAggregate(null)
      channelRef.current = null
      return
    }
    let active = true

    const chargerAgregat = async () => {
      const { data, error } = await supabase.rpc('get_diagnostic_live_aggregate', {
        p_organisation_id: orgId,
        p_site_id: siteId || null,
      })
      if (!active || error || !data || data.length === 0) { if (active) setLiveAggregate(null); return }
      const moyennes = {}
      let nbReponses = 0
      data.forEach(row => {
        moyennes[row.axis_id] = Number(row.moyenne)
        nbReponses = Math.max(nbReponses, Number(row.nb_reponses))
      })
      setLiveAggregate({ moyennes, nbReponses })
    }

    const channel = supabase.channel(`diagnostic-live-${siteKey}`, { config: { presence: { key: crypto.randomUUID() } } })
    channelRef.current = channel

    channel
      .on('presence', { event: 'sync' }, () => {
        if (!active) return
        setParticipantsCount(Object.keys(channel.presenceState()).length || 1)
      })
      .on('broadcast', { event: 'nouvelle-reponse' }, () => { chargerAgregat() })
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          channel.track({ online_at: new Date().toISOString() })
          chargerAgregat()
        }
      })

    return () => {
      active = false
      channelRef.current = null
      supabase.removeChannel(channel)
    }
  }, [siteKey])

  // Canal global (phase 4) : independant du site choisi, rejoint des l'arrivee
  // sur le diagnostic. Sert uniquement au mode projection plein ecran (compteur
  // de participants actifs toutes organisations confondues + notification de
  // nouvelle soumission pour rafraichir l'ecran en direct) — aucune donnee
  // individuelle n'y transite, juste une presence et un signal de rafraichissement.
  const globalChannelRef = useRef(null)
  useEffect(() => {
    const channel = supabase.channel('diagnostic-projection', { config: { presence: { key: crypto.randomUUID() } } })
    globalChannelRef.current = channel
    channel.subscribe(status => {
      if (status === 'SUBSCRIBED') channel.track({ online_at: new Date().toISOString() })
    })
    return () => {
      globalChannelRef.current = null
      supabase.removeChannel(channel)
    }
  }, [])

  const choisirOrganisation = id => {
    setOrgId(id)
    setSiteId('')
    setOrgQuery('')
  }

  const handleRechercheDossier = async e => {
    e.preventDefault()
    if (!recherche.trim()) return
    setChercheEnCours(true); setErreurRecherche('')

    const valeur = recherche.trim()
    const isDossier = /^COPAF/i.test(valeur)

    const { data: rows, error } = await supabase.rpc('lookup_contact_for_diagnostic', isDossier
      ? { p_dossier: valeur, p_email: null }
      : { p_dossier: null, p_email: valeur.toLowerCase() })
    setChercheEnCours(false)

    if (error || !rows || rows.length === 0) {
      setErreurRecherche(t.dossierErreur)
      return
    }
    const c = rows[0]
    setForm({
      prenom: c.prenom || '', nom: c.nom || '', telephone: c.telephone || '',
      email: c.email || '', organisation: c.organisation || '', pays: c.pays || '',
    })
    setEtape(0)
  }

  const validerIdentification = e => {
    e.preventDefault()
    const orgOk = orgId === ORG_AUTRE.id ? autreOrgNom.trim() : !!orgId && (!orgSelectionnee?.sites?.length || siteId)
    if (!form.prenom.trim() || !form.nom.trim() || !orgOk) {
      setErreurForm(t.erreurForm)
      return
    }
    setErreurForm('')
    const organisationNom = orgId === ORG_AUTRE.id
      ? autreOrgNom.trim()
      : [txt(orgSelectionnee?.nom, lang), siteSelectionne ? txt(siteSelectionne.nom, lang) : null].filter(Boolean).join(' — ')
    const pays = orgId === ORG_AUTRE.id ? autrePays.trim() : (orgSelectionnee?.country || '')
    setForm(f => ({ ...f, organisation: organisationNom, pays }))
    setEtape(0)
  }

  // Selectionne une reponse sans avancer automatiquement : la navigation
  // se fait desormais explicitement via les boutons Precedent / Suivant.
  const choisir = (axisId, valeur) => {
    setReponses(r => ({ ...r, [axisId]: valeur }))
  }

  const allerPrecedent = () => setEtape(e => Math.max(0, e - 1))
  const allerSuivant = () => setEtape(e => e + 1)

  const soumettre = async () => {
    setSoumission(true); setErreurSoumission('')
    const id = crypto.randomUUID()
    const { error } = await supabase.from('diagnostics').insert([{
      id, nom: form.nom, prenom: form.prenom, telephone: form.telephone,
      email: form.email, organisation: form.organisation, pays: form.pays,
      scores: reponses,
      organisation_id: orgId || null,
      site_id: siteId || null,
      site_nom: siteSelectionne ? txt(siteSelectionne.nom, lang) : null,
      reseau: orgSelectionnee?.network || null,
      langue: lang,
    }])
    setSoumission(false)

    if (error) { setErreurSoumission(t.erreur + error.message); return }
    channelRef.current?.send({ type: 'broadcast', event: 'nouvelle-reponse', payload: {} })
    globalChannelRef.current?.send({ type: 'broadcast', event: 'nouvelle-reponse', payload: {} })
    navigate(`/diagnostic/resultat/${id}?lang=${lang}`)
  }

  useEffect(() => {
    if (etape === AXES.length + 1) soumettre()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etape])

  const wrap = { minHeight: '100vh', position: 'relative', fontFamily: "'Plus Jakarta Sans',sans-serif", padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#f8fafc' }
  const bgImage = { position: 'fixed', inset: 0, zIndex: -2, backgroundColor: '#0b0f1c', backgroundImage: 'url(/hero1.png)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.75) saturate(1.2)' }
  const bgOverlay = { position: 'fixed', inset: 0, zIndex: -1, backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(13,27,62,0.55) 0%, rgba(9,13,22,0.78) 70%)' }
  const Fond = () => <><div style={bgImage} /><div style={bgOverlay} /></>
  const BoutonLang = () => (
    <button onClick={() => setLang(l => l === 'fr' ? 'en' : 'fr')} type="button" style={{
      position: 'fixed', top: 18, right: 18, zIndex: 10, display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '9px 16px', borderRadius: 20, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.12)', color: '#cbd5e1', fontSize: 12.5, fontWeight: 700,
      cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif",
    }}>
      <Ico name="globe" size={14} color="#60a5fa" />
      {lang === 'fr' ? 'FR · English' : 'EN · Français'}
    </button>
  )
  const card = { width: '100%', maxWidth: 680 }
  const inputStyle = { width: '100%', padding: '14px 18px', fontSize: 14.5, fontFamily: 'inherit', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 12, color: '#fff', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }

  if (etape === -1) {
    const reseauxAvecOrgs = getOrganisationsByNetwork()
    const resultatsRecherche = orgQuery.trim() ? searchOrganisations(orgQuery, lang) : null

    return (
      <div style={wrap}>
        <Fond />
        <RetourMenu />
        <BoutonLang />
        <div style={card}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(0, 115, 244, 0.1)', border: '1px solid rgba(0, 115, 244, 0.3)', borderRadius: 20, fontSize: 11, fontWeight: 800, color: BLUE, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
              COPAF 2026
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>Diagnostic Smart Port</div>
            <p style={{ fontSize: 14.5, color: '#94a3b8', lineHeight: 1.6, maxWidth: 500, margin: '0 auto' }}>
              {t.intro}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
            <button type="button" onClick={() => setIdentMode('dossier')} style={{
              flex: 1, padding: '11px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', border: 'none',
              background: identMode === 'dossier' ? 'linear-gradient(135deg, #0073F4, #000E91)' : 'transparent',
              color: identMode === 'dossier' ? '#fff' : '#94a3b8',
              boxShadow: identMode === 'dossier' ? '0 4px 12px rgba(0,115,244,0.3)' : 'none',
              transition: 'all 0.2s'
            }}>{t.tabDossier}</button>
            <button type="button" onClick={() => setIdentMode('directe')} style={{
              flex: 1, padding: '11px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', border: 'none',
              background: identMode === 'directe' ? 'linear-gradient(135deg, #0073F4, #000E91)' : 'transparent',
              color: identMode === 'directe' ? '#fff' : '#94a3b8',
              boxShadow: identMode === 'directe' ? '0 4px 12px rgba(0,115,244,0.3)' : 'none',
              transition: 'all 0.2s'
            }}>{t.tabDirecte}</button>
          </div>

          {identMode === 'dossier' ? (
            <form onSubmit={handleRechercheDossier} style={{ background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 20, padding: 30, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <label style={labelStyle}>{t.dossierLabel}</label>
              <input
                value={recherche}
                onChange={e => setRecherche(e.target.value)}
                placeholder={t.dossierPlaceholder}
                style={{ ...inputStyle, marginBottom: 16 }}
              />
              {erreurRecherche && <p style={{ fontSize: 13, color: '#f87171', marginBottom: 16, lineHeight: 1.4 }}>{erreurRecherche}</p>}
              <button type="submit" disabled={chercheEnCours} style={{
                width: '100%', padding: '16px', background: 'linear-gradient(135deg,#0073F4,#000E91)', border: 'none',
                borderRadius: 14, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 6px 20px rgba(0,115,244,0.4)',
              }}>
                {chercheEnCours ? t.recherche : t.continuer} <Ico name="arrow" size={16} color="#fff" />
              </button>
            </form>
          ) : (
            <form onSubmit={validerIdentification} style={{ background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 20, padding: 30, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>{t.prenom}</label>
                  <input style={inputStyle} value={form.prenom} onChange={e => handleFormChange('prenom', e.target.value)} placeholder={t.prenomP} />
                </div>
                <div>
                  <label style={labelStyle}>{t.nom}</label>
                  <input style={inputStyle} value={form.nom} onChange={e => handleFormChange('nom', e.target.value)} placeholder={t.nomP} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>{t.telephone}</label>
                  <input style={inputStyle} value={form.telephone} onChange={e => handleFormChange('telephone', e.target.value)} placeholder={t.telephoneP} />
                </div>
                <div>
                  <label style={labelStyle}>{t.email}</label>
                  <input style={inputStyle} type="email" value={form.email} onChange={e => handleFormChange('email', e.target.value)} placeholder={t.emailP} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>{t.organisation}</label>

                {orgId && orgId !== ORG_AUTRE.id ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '13px 16px', background: 'rgba(0,115,244,0.12)', border: '1px solid rgba(0,115,244,0.35)', borderRadius: 12 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: '#fff' }}>{txt(orgSelectionnee?.nom, lang)}</span>
                    <button type="button" onClick={() => choisirOrganisation('')} style={{ background: 'none', border: 'none', color: '#93c5fd', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{t.changer}</button>
                  </div>
                ) : orgId === ORG_AUTRE.id ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '13px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: '#fff' }}>{txt(ORG_AUTRE.nom, lang)}</span>
                    <button type="button" onClick={() => choisirOrganisation('')} style={{ background: 'none', border: 'none', color: '#93c5fd', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{t.changer}</button>
                  </div>
                ) : (
                  <>
                    <div style={{ position: 'relative', marginBottom: 10 }}>
                      <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                        <Ico name="search" size={15} color="#64748b" />
                      </div>
                      <input
                        style={{ ...inputStyle, paddingLeft: 38 }}
                        value={orgQuery}
                        onChange={e => setOrgQuery(e.target.value)}
                        placeholder={t.organisationSearch}
                      />
                    </div>
                    <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, background: 'rgba(15,23,42,0.5)' }}>
                      {resultatsRecherche ? (
                        resultatsRecherche.length === 0 ? (
                          <div style={{ padding: 16, fontSize: 12.5, color: '#64748b', textAlign: 'center' }}>{t.organisationAucun}</div>
                        ) : resultatsRecherche.map(o => (
                          <button key={o.id} type="button" onClick={() => choisirOrganisation(o.id)} style={{
                            display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'transparent',
                            border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: 13,
                            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                          }}>{txt(o.nom, lang)} <span style={{ color: '#64748b', fontWeight: 500 }}>· {o.country}</span></button>
                        ))
                      ) : (
                        reseauxAvecOrgs.map(grp => (
                          <div key={grp.network}>
                            <div style={{ padding: '8px 14px', fontSize: 10.5, fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: 0.6, background: 'rgba(0,115,244,0.06)' }}>
                              {txt(grp.label, lang)}
                            </div>
                            {grp.organisations.map(o => (
                              <button key={o.id} type="button" onClick={() => choisirOrganisation(o.id)} style={{
                                display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'transparent',
                                border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: 13,
                                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                              }}>{txt(o.nom, lang)}</button>
                            ))}
                          </div>
                        ))
                      )}
                      <button type="button" onClick={() => choisirOrganisation(ORG_AUTRE.id)} style={{
                        display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'rgba(255,255,255,0.03)',
                        border: 'none', color: '#93c5fd', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                      }}>{txt(ORG_AUTRE.nom, lang)}</button>
                    </div>
                  </>
                )}
              </div>

              {orgSelectionnee?.sites?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>{t.site}</label>
                  <p style={{ fontSize: 12, color: '#94a3b8', marginTop: -4, marginBottom: 10, lineHeight: 1.4 }}>{t.siteAide}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {orgSelectionnee.sites.map(s => (
                      <button key={s.id} type="button" onClick={() => setSiteId(s.id)} style={{
                        padding: '9px 16px', borderRadius: 20, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                        border: `1.5px solid ${siteId === s.id ? '#0073F4' : 'rgba(255,255,255,0.12)'}`,
                        background: siteId === s.id ? 'linear-gradient(135deg, #0073F4, #000E91)' : 'rgba(255,255,255,0.03)',
                        color: siteId === s.id ? '#fff' : '#cbd5e1',
                      }}>{txt(s.nom, lang)}</button>
                    ))}
                  </div>
                </div>
              )}

              {orgId === ORG_AUTRE.id && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>{t.autreOrgNom}</label>
                    <input style={inputStyle} value={autreOrgNom} onChange={e => setAutreOrgNom(e.target.value)} placeholder={t.autreOrgNomP} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>{t.autrePays}</label>
                    <input style={inputStyle} value={autrePays} onChange={e => setAutrePays(e.target.value)} placeholder={t.autrePaysP} />
                  </div>
                </>
              )}

              {erreurForm && <p style={{ fontSize: 13, color: '#f87171', marginTop: 4, marginBottom: 16, lineHeight: 1.4 }}>{erreurForm}</p>}

              <button type="submit" style={{
                width: '100%', padding: '16px', background: 'linear-gradient(135deg,#0073F4,#000E91)', border: 'none',
                borderRadius: 14, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 6px 20px rgba(0,115,244,0.4)',
              }}>
                {t.continuer} <Ico name="arrow" size={16} color="#fff" />
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  if (etape === 0) {
    return (
      <div style={wrap}>
        <Fond />
        <RetourMenu />
        <BoutonLang />
        <style>{`
          .diag-axes-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          @media (max-width: 680px) {
            .diag-axes-grid { grid-template-columns: 1fr; }
          }
          .diag-axe-card {
            transition: transform .15s ease, border-color .15s ease;
          }
          .diag-axe-card:hover {
            transform: translateY(-2px);
            border-color: rgba(0,115,244,0.35) !important;
          }
        `}</style>
        <div style={{ ...card, maxWidth: 920 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: BLUE, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{t.avantCommencer}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 10, letterSpacing: '-0.5px' }}>{t.commentFonctionne}</div>
            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, maxWidth: 580, margin: '0 auto' }}>
              {t.explication}
            </p>
          </div>

          {(participantsCount > 1 || liveAggregate) && (
            <div style={{ background: 'rgba(0,115,244,0.08)', border: '1px solid rgba(0,115,244,0.25)', borderRadius: 16, padding: '16px 20px', marginBottom: 20 }}>
              {participantsCount > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#dbeafe', fontWeight: 600, marginBottom: liveAggregate ? 12 : 0 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 0 3px rgba(74,222,128,0.25)', flexShrink: 0 }} />
                  {t.liveAutres(participantsCount - 1)}
                </div>
              )}
              {liveAggregate && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>
                    {t.liveAgregatTitre} · {t.liveAgregatNote(liveAggregate.nbReponses)}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {AXES.filter(axe => liveAggregate.moyennes[axe.id] !== undefined).map(axe => (
                      <div key={axe.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: 20, fontSize: 12, color: '#e2e8f0' }}>
                        <span style={{ fontWeight: 700 }}>{liveAggregate.moyennes[axe.id].toFixed(1)}</span>
                        <span style={{ color: '#94a3b8' }}>{txt(axe.nom, lang)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>{t.bareme}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ECHELLE.map(n => (
                <div key={n.valeur} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #0073F4, #000E91)', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n.valeur}</span>
                  <span style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 600 }}>{txt(n.nom, lang)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Axes : grille 2 colonnes au lieu d'une liste verticale */}
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
            {t.dixDimensions}
          </div>
          <div className="diag-axes-grid" style={{ marginBottom: 24 }}>
            {AXES.map((axe, i) => (
              <div key={axe.id} className="diag-axe-card" style={{
                background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 14,
                padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,115,244,0.15)', border: '1px solid rgba(0,115,244,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#60a5fa' }}>
                  <Ico name={axe.icone} size={18} color="#60a5fa" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#fff', marginBottom: 4, lineHeight: 1.3 }}>
                    <span style={{ color: '#60a5fa', marginRight: 6 }}>{String(i + 1).padStart(2, '0')}</span>{txt(axe.nom, lang)}
                  </div>
                  <div style={{ fontSize: 12.5, color: '#94a3b8', lineHeight: 1.5 }}>{txt(axe.definition, lang)}</div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setEtape(1)} style={{
            width: '100%', padding: '16px', background: 'linear-gradient(135deg,#0073F4,#000E91)', border: 'none',
            borderRadius: 14, color: '#fff', fontSize: 15.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(0,115,244,0.4)',
          }}>
            {t.jaiCompris} <Ico name="arrow" size={17} color="#fff" />
          </button>
        </div>
      </div>
    )
  }

  if (etape >= 1 && etape <= AXES.length) {
    const axe = AXES[etape - 1]
    const progression = Math.round(((etape - 1) / AXES.length) * 100)
    const reponseActuelle = reponses[axe.id]
    const estDerniereAxe = etape === AXES.length

    return (
      <div style={wrap}>
        <Fond />
        <RetourMenu />
        <BoutonLang />
        <style>{`
          .diag-niveaux-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }
          @media (max-width: 760px) {
            .diag-niveaux-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (max-width: 480px) {
            .diag-niveaux-grid { grid-template-columns: 1fr; }
          }
          .diag-niveau-card {
            transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
          }
          .diag-niveau-card:hover {
            transform: translateY(-2px);
          }
          .diag-nav-btn:disabled {
            opacity: 0.35;
            cursor: not-allowed;
          }
        `}</style>
        <div style={{ ...card, maxWidth: 900 }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>
              <span>{t.axe} {etape} {t.sur} {AXES.length}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {participantsCount > 1 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 20, color: '#4ade80', fontSize: 11, fontWeight: 700 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} /> {participantsCount}
                  </span>
                )}
                <span style={{ color: '#60a5fa' }}>{form.organisation}</span>
              </span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${progression}%`, height: '100%', background: 'linear-gradient(90deg,#0073F4,#000E91)', borderRadius: 3, transition: 'width .3s' }} />
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 24, padding: 32, boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
              <div style={{
                width: 54, height: 54, borderRadius: 16, flexShrink: 0, background: 'linear-gradient(135deg, rgba(0,115,244,0.2), rgba(0,14,145,0.4))',
                border: '1px solid rgba(0,115,244,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa'
              }}>
                <Ico name={axe.icone} size={28} color="#60a5fa" />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', lineHeight: 1.3, letterSpacing: '-0.5px' }}>{txt(axe.nom, lang)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '12px 16px', marginBottom: 24 }}>
              <Ico name="info" size={16} color="#60a5fa" />
              <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.55, margin: 0 }}>{txt(axe.definition, lang)}</p>
            </div>

            {/* Cartes de niveau : 3 colonnes x 2 lignes sur desktop */}
            <div className="diag-niveaux-grid">
              {axe.niveaux.map((niveau, i) => {
                const selected = reponseActuelle === i
                return (
                  <button
                    key={i}
                    className="diag-niveau-card"
                    onClick={() => choisir(axe.id, i)}
                    style={{
                      display: 'flex', flexDirection: 'column', gap: 10, padding: '18px 16px', borderRadius: 14,
                      textAlign: 'left', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', height: '100%',
                      border: `1.5px solid ${selected ? '#0073F4' : 'rgba(255,255,255,0.06)'}`,
                      background: selected ? 'linear-gradient(135deg, rgba(0,115,244,0.18), rgba(0,14,145,0.25))' : 'rgba(255,255,255,0.02)',
                      color: selected ? '#fff' : '#cbd5e1',
                      boxShadow: selected ? '0 4px 20px rgba(0,115,244,0.25)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        flexShrink: 0, width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: selected ? 'linear-gradient(135deg,#0073F4,#000E91)' : 'rgba(255,255,255,0.06)',
                        color: selected ? '#fff' : '#94a3b8', fontSize: 12.5, fontWeight: 800,
                        border: selected ? 'none' : '1px solid rgba(255,255,255,0.08)'
                      }}>{i}</span>
                      {selected && <Ico name="check" size={16} color="#60a5fa" />}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.6, color: selected ? '#93c5fd' : '#64748b' }}>
                      {txt(ECHELLE[i].nom, lang)}
                    </span>
                    <span style={{ fontWeight: selected ? 600 : 500, lineHeight: 1.4, flex: 1 }}>{txt(niveau, lang)}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Navigation Precedent / Suivant */}
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button
              className="diag-nav-btn"
              onClick={allerPrecedent}
              style={{
                flex: '0 0 auto', padding: '14px 22px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, color: '#cbd5e1',
                fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <Ico name="arrowLeft" size={16} color="#cbd5e1" /> {t.precedent}
            </button>

            <button
              className="diag-nav-btn"
              onClick={allerSuivant}
              disabled={reponseActuelle === undefined}
              style={{
                flex: 1, padding: '14px 22px', background: 'linear-gradient(135deg,#0073F4,#000E91)', border: 'none',
                borderRadius: 14, color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: reponseActuelle === undefined ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: reponseActuelle === undefined ? 'none' : '0 6px 20px rgba(0,115,244,0.4)',
              }}
            >
              {estDerniereAxe ? t.terminer : t.suivant} <Ico name="arrow" size={16} color="#fff" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={wrap}>
      <Fond />
      <RetourMenu />
      <BoutonLang />
      <div style={{ ...card, textAlign: 'center', paddingTop: 100 }}>
        {erreurSoumission ? (
          <p style={{ color: '#f87171', fontSize: 14 }}>{erreurSoumission}</p>
        ) : (
          <div>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(0,115,244,0.2)', borderTop: '3px solid #0073F4', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#94a3b8', fontSize: 15, fontWeight: 600 }}>{t.enregistrement}</p>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
