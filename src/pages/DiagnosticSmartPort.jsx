import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import RetourMenu from '../components/RetourMenu'

const NAVY = '#000E91'
const BLUE = '#0073F4'

const ECHELLE = [
  { valeur: 0, nom: 'Nul' },
  { valeur: 1, nom: 'Très faible' },
  { valeur: 2, nom: 'Faible' },
  { valeur: 3, nom: 'Moyen' },
  { valeur: 4, nom: 'Bon' },
  { valeur: 5, nom: 'Très bon' },
]

const AXES = [
  {
    id: 'infrastructure', nom: 'Infrastructure digitale & guichet unique', icone: 'infrastructure',
    definition: "Mesure à quel point les démarches administratives (déclarations, autorisations, formalités) sont numérisées et centralisées dans un système unique, accessible en ligne.",
    niveaux: [
      "Aucune démarche n'est numérisée, tout se fait sur papier.",
      "Quelques formulaires existent en version numérique, mais sans système centralisé.",
      "Un système numérique existe pour certaines procédures, utilisé de façon inégale.",
      "Un guichet unique partiel est en place, couvrant une partie des démarches.",
      "Le guichet unique couvre la majorité des démarches, avec une adoption large.",
      "Guichet unique complet, 100% dématérialisé, intégré aux systèmes des partenaires.",
    ],
  },
  {
    id: 'automatisation', nom: 'Automatisation des opérations physiques', icone: 'automatisation',
    definition: "Évalue le niveau d'automatisation des équipements physiques du port — grues, portiques, véhicules de manutention — et leur degré d'autonomie.",
    niveaux: [
      "Toutes les opérations (grues, portiques, engins) sont manuelles.",
      "Quelques équipements assistés existent, mais l'essentiel reste manuel.",
      "Une automatisation partielle est en place sur certains équipements.",
      "Une zone ou un terminal pilote est significativement automatisé.",
      "L'automatisation couvre la majorité des opérations critiques.",
      "Opérations largement autonomes (portiques, véhicules) sur l'ensemble du terminal.",
    ],
  },
  {
    id: 'tracabilite', nom: 'Traçabilité & partage de données', icone: 'tracabilite',
    definition: "Mesure la capacité à suivre en temps réel la position et le statut des marchandises, et à partager cette information avec les clients et partenaires.",
    niveaux: [
      "Aucun suivi numérique, tout par téléphone ou papier.",
      "Suivi basique via tableurs internes, non partagé.",
      "Un système de suivi existe mais reste interne, pas accessible aux clients.",
      "Une traçabilité partielle est accessible à certains partenaires.",
      "Suivi en temps quasi réel, accessible à la majorité des parties prenantes.",
      "Traçabilité temps réel complète, accessible via application aux clients et partenaires.",
    ],
  },
  {
    id: 'ia', nom: 'Intelligence artificielle & aide à la décision', icone: 'ia',
    definition: "Évalue l'usage d'outils d'analyse de données et d'IA pour anticiper et optimiser les opérations (accostage, flux, maintenance) — au-delà de la simple collecte de données.",
    niveaux: [
      "Aucun outil d'aide à la décision, tout est intuitif.",
      "Des statistiques descriptives basiques sont produites, sans analyse poussée.",
      "Des tableaux de bord existent mais sans capacité prédictive.",
      "Des outils d'aide à la décision ponctuels sont utilisés sur certains processus.",
      "Des modèles prédictifs sont utilisés sur plusieurs processus clés.",
      "IA prédictive intégrée en continu (accostage, flux, maintenance).",
    ],
  },
  {
    id: 'cybersecurite', nom: 'Cybersécurité', icone: 'cybersecurite',
    definition: "Mesure le niveau de protection des systèmes numériques contre les cyberattaques : politiques formalisées, contrôles réguliers, tests concrets.",
    niveaux: [
      "Aucune politique de cybersécurité formalisée.",
      "Quelques mesures de base (mots de passe), rien de structuré.",
      "Une politique existe mais appliquée de façon partielle.",
      "Une gouvernance cybersécurité est en place, avec des contrôles réguliers.",
      "Une gouvernance mature, testée régulièrement (audits, exercices).",
      "Cybersécurité de niveau avancé, certifiée, avec surveillance continue.",
    ],
  },
  {
    id: 'surete', nom: 'Sûreté & sécurité opérationnelle', icone: 'surete',
    definition: "Évalue les dispositifs de sûreté physique du site (contrôle d'accès, surveillance, gestion des risques) — distincts de la cybersécurité.",
    niveaux: [
      "Aucun dispositif de sûreté formalisé.",
      "Des mesures ponctuelles existent, sans coordination globale.",
      "Un dispositif de sûreté existe mais couvre une partie du site.",
      "Un dispositif de sûreté structuré couvre l'ensemble du site.",
      "Le dispositif est régulièrement audité et amélioré.",
      "Sûreté de niveau international, certifiée (ISPS et au-delà), exemplaire.",
    ],
  },
  {
    id: 'environnement', nom: 'Énergie & environnement', icone: 'environnement',
    definition: "Mesure les efforts en matière de suivi environnemental et de transition énergétique — pollution, électrification, réduction de l'empreinte carbone.",
    niveaux: [
      "Aucun suivi environnemental, pas de démarche engagée.",
      "Quelques mesures ponctuelles/manuelles de pollution.",
      "Des capteurs existent sur certaines zones, sans suivi continu.",
      "Un suivi environnemental structuré est en place sur une partie du site.",
      "La flotte/les équipements sont partiellement électrifiés ou décarbonés.",
      "Suivi continu et flotte largement décarbonée, démarche exemplaire.",
    ],
  },
  {
    id: 'synchromodalite', nom: 'Synchromodalité & intégration multimodale', icone: 'synchromodalite',
    definition: "Évalue la capacité à coordonner les différents modes de transport (route, rail, fleuve) autour des opérations portuaires, au-delà du seul quai.",
    niveaux: [
      "Aucune coordination entre modes de transport (route, rail, fleuve).",
      "Une coordination existe ponctuellement, au cas par cas.",
      "Des échanges d'informations existent entre certains modes.",
      "Une intégration partielle facilite le report modal.",
      "Une intégration avancée permet un choix modal flexible et informé.",
      "Synchromodalité pleinement intégrée, optimisée en temps réel.",
    ],
  },
  {
    id: 'competences', nom: 'Capacités organisationnelles & compétences', icone: 'competences',
    definition: "Mesure le niveau de formation et d'appropriation des outils digitaux par les équipes — le facteur humain derrière la technologie.",
    niveaux: [
      "Aucune formation digitale n'est proposée aux équipes.",
      "Quelques formations ponctuelles, non structurées.",
      "Un plan de formation existe mais touche une minorité du personnel.",
      "Un plan de formation structuré touche une majorité des équipes.",
      "Une culture digitale est largement partagée, formation continue.",
      "Compétences digitales matures à tous les niveaux, culture d'innovation forte.",
    ],
  },
  {
    id: 'parties_prenantes', nom: 'Engagement des parties prenantes', icone: 'parties_prenantes',
    definition: "Évalue la qualité de la concertation entre le port et son écosystème — douanes, transporteurs, clients, autorités — plutôt que des décisions prises en silo.",
    niveaux: [
      "Aucune concertation avec les partenaires/clients sur le digital.",
      "Des échanges ponctuels et informels existent.",
      "Une concertation existe mais reste limitée à quelques partenaires.",
      "Une concertation structurée existe avec les principales parties prenantes.",
      "Une collaboration active et régulière existe avec l'écosystème portuaire.",
      "Gouvernance partagée et collaborative avec l'ensemble de l'écosystème (ports, douanes, transporteurs, clients).",
    ],
  },
]

const Ico = ({ name, size = 20, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    check: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    arrow: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    info: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
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

  const [etape, setEtape] = useState(-1)

  const [identMode, setIdentMode] = useState('dossier')
  const [recherche, setRecherche] = useState('')
  const [chercheEnCours, setChercheEnCours] = useState(false)
  const [erreurRecherche, setErreurRecherche] = useState('')

  const [form, setForm] = useState({ prenom: '', nom: '', telephone: '', email: '', organisation: '', pays: '' })
  const [erreurForm, setErreurForm] = useState('')

  const [reponses, setReponses] = useState({})
  const [soumission, setSoumission] = useState(false)
  const [erreurSoumission, setErreurSoumission] = useState('')

  const handleFormChange = (champ, valeur) => setForm(f => ({ ...f, [champ]: valeur }))

  const handleRechercheDossier = async e => {
    e.preventDefault()
    if (!recherche.trim()) return
    setChercheEnCours(true); setErreurRecherche('')

    const valeur = recherche.trim()
    const isDossier = /^COPAF/i.test(valeur)

    let query = supabase.from('contacts').select('id, nom, prenom, organisation, pays, email, telephone')
    if (isDossier) {
      const { data: insc } = await supabase.from('inscriptions').select('contact_id').eq('dossier', valeur).limit(1)
      if (!insc || insc.length === 0) {
        setErreurRecherche('Aucun dossier trouvé avec cette référence.')
        setChercheEnCours(false)
        return
      }
      query = query.eq('id', insc[0].contact_id)
    } else {
      query = query.eq('email', valeur.toLowerCase())
    }

    const { data: rows, error } = await query.limit(1)
    setChercheEnCours(false)

    if (error || !rows || rows.length === 0) {
      setErreurRecherche("Aucune inscription trouvée avec cette référence ou cet email. Vérifiez, ou passez en saisie directe ci-dessus.")
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
    if (!form.prenom.trim() || !form.nom.trim() || !form.organisation.trim() || !form.pays.trim()) {
      setErreurForm('Merci de renseigner au moins votre nom, prénom, organisation et pays.')
      return
    }
    setErreurForm('')
    setEtape(0)
  }

  const choisir = (axisId, valeur) => {
    setReponses(r => ({ ...r, [axisId]: valeur }))
    setTimeout(() => setEtape(e => e + 1), 300)
  }

  const soumettre = async () => {
    setSoumission(true); setErreurSoumission('')
    const { data, error } = await supabase.from('diagnostics').insert([{
      nom: form.nom, prenom: form.prenom, telephone: form.telephone,
      email: form.email, organisation: form.organisation, pays: form.pays,
      scores: reponses,
    }]).select('id').single()
    setSoumission(false)

    if (error) { setErreurSoumission('Erreur : ' + error.message); return }
    navigate(`/diagnostic/resultat/${data.id}`)
  }

  useEffect(() => {
    if (etape === AXES.length + 1) soumettre()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etape])

  const wrap = { minHeight: '100vh', position: 'relative', fontFamily: "'Plus Jakarta Sans',sans-serif", padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#f8fafc' }
  const bgImage = { position: 'fixed', inset: 0, zIndex: -2, backgroundImage: 'url(/hero1.png)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.75) saturate(1.2)' }
  const bgOverlay = { position: 'fixed', inset: 0, zIndex: -1, backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(13,27,62,0.55) 0%, rgba(9,13,22,0.78) 70%)' }
  const Fond = () => <><div style={bgImage} /><div style={bgOverlay} /></>
  const BoutonMenu = () => (
    <a href="/tablette" style={{
      position: 'fixed', top: 18, left: 18, zIndex: 10, display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '9px 16px', borderRadius: 20, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.12)', color: '#cbd5e1', fontSize: 12.5, fontWeight: 700,
      textDecoration: 'none', fontFamily: "'Plus Jakarta Sans',sans-serif",
    }}>
      ← Menu
    </a>
  )
  const card = { width: '100%', maxWidth: 680 }
  const inputStyle = { width: '100%', padding: '14px 18px', fontSize: 14.5, fontFamily: 'inherit', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 12, color: '#fff', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }

  if (etape === -1) {
    return (
      <div style={wrap}>
        <Fond />
        <BoutonMenu />
        <RetourMenu />
        <div style={card}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(0, 115, 244, 0.1)', border: '1px solid rgba(0, 115, 244, 0.3)', borderRadius: 20, fontSize: 11, fontWeight: 800, color: BLUE, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
              COPAF 2026
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>Diagnostic Smart Port</div>
            <p style={{ fontSize: 14.5, color: '#94a3b8', lineHeight: 1.6, maxWidth: 500, margin: '0 auto' }}>
              Évaluez le niveau de maturité digitale de votre port sur 10 dimensions, et repartez avec des recommandations personnalisées.
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
            }}>Par numéro de dossier</button>
            <button type="button" onClick={() => setIdentMode('directe')} style={{
              flex: 1, padding: '11px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', border: 'none',
              background: identMode === 'directe' ? 'linear-gradient(135deg, #0073F4, #000E91)' : 'transparent',
              color: identMode === 'directe' ? '#fff' : '#94a3b8',
              boxShadow: identMode === 'directe' ? '0 4px 12px rgba(0,115,244,0.3)' : 'none',
              transition: 'all 0.2s'
            }}>Mes informations directement</button>
          </div>

          {identMode === 'dossier' ? (
            <form onSubmit={handleRechercheDossier} style={{ background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 20, padding: 30, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <label style={labelStyle}>Votre numéro de dossier ou votre email d'inscription</label>
              <input
                value={recherche}
                onChange={e => setRecherche(e.target.value)}
                placeholder="COPAF2026-XXXXX ou votre@email.com"
                style={{ ...inputStyle, marginBottom: 16 }}
              />
              {erreurRecherche && <p style={{ fontSize: 13, color: '#f87171', marginBottom: 16, lineHeight: 1.4 }}>{erreurRecherche}</p>}
              <button type="submit" disabled={chercheEnCours} style={{
                width: '100%', padding: '16px', background: 'linear-gradient(135deg,#0073F4,#000E91)', border: 'none',
                borderRadius: 14, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 6px 20px rgba(0,115,244,0.4)',
              }}>
                {chercheEnCours ? 'Recherche en cours...' : 'Continuer'} <Ico name="arrow" size={16} color="#fff" />
              </button>
            </form>
          ) : (
            <form onSubmit={validerIdentification} style={{ background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 20, padding: 30, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Prénom *</label>
                  <input style={inputStyle} value={form.prenom} onChange={e => handleFormChange('prenom', e.target.value)} placeholder="Votre prénom" />
                </div>
                <div>
                  <label style={labelStyle}>Nom *</label>
                  <input style={inputStyle} value={form.nom} onChange={e => handleFormChange('nom', e.target.value)} placeholder="Votre nom" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Téléphone</label>
                  <input style={inputStyle} value={form.telephone} onChange={e => handleFormChange('telephone', e.target.value)} placeholder="+xxx xxx xxx xxx" />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input style={inputStyle} type="email" value={form.email} onChange={e => handleFormChange('email', e.target.value)} placeholder="votre@email.com" />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Port / Organisation *</label>
                <input style={inputStyle} value={form.organisation} onChange={e => handleFormChange('organisation', e.target.value)} placeholder="Ex : Port Autonome de Kribi" />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Pays *</label>
                <input style={inputStyle} value={form.pays} onChange={e => handleFormChange('pays', e.target.value)} placeholder="Ex : Cameroun" />
              </div>

              {erreurForm && <p style={{ fontSize: 13, color: '#f87171', marginBottom: 16, lineHeight: 1.4 }}>{erreurForm}</p>}

              <button type="submit" style={{
                width: '100%', padding: '16px', background: 'linear-gradient(135deg,#0073F4,#000E91)', border: 'none',
                borderRadius: 14, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 6px 20px rgba(0,115,244,0.4)',
              }}>
                Continuer <Ico name="arrow" size={16} color="#fff" />
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
        <BoutonMenu />
        <RetourMenu />
        <div style={{ ...card, maxWidth: 760 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: BLUE, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Avant de commencer</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 10, letterSpacing: '-0.5px' }}>Comment fonctionne ce diagnostic</div>
            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, maxWidth: 580, margin: '0 auto' }}>
              10 dimensions du "Smart Port" à évaluer, notées de 0 à 5. Prenez un instant pour lire chaque définition — une compréhension commune garantit des résultats comparables entre tous les ports.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>Le barème de notation</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ECHELLE.map(n => (
                <div key={n.valeur} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #0073F4, #000E91)', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n.valeur}</span>
                  <span style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 600 }}>{n.nom}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {AXES.map((axe, i) => (
              <div key={axe.id} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 14, padding: '14px 18px', display: 'flex', gap: 16, alignItems: 'flex-start', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(0,115,244,0.15)', border: '1px solid rgba(0,115,244,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#60a5fa' }}>
                  <Ico name={axe.icone} size={20} color="#60a5fa" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 3 }}>{i + 1}. {axe.nom}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>{axe.definition}</div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setEtape(1)} style={{
            width: '100%', padding: '16px', background: 'linear-gradient(135deg,#0073F4,#000E91)', border: 'none',
            borderRadius: 14, color: '#fff', fontSize: 15.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(0,115,244,0.4)',
          }}>
            J'ai compris, commencer le diagnostic <Ico name="arrow" size={17} color="#fff" />
          </button>
        </div>
      </div>
    )
  }

  if (etape >= 1 && etape <= AXES.length) {
    const axe = AXES[etape - 1]
    const progression = Math.round(((etape - 1) / AXES.length) * 100)

    return (
      <div style={wrap}>
        <Fond />
        <BoutonMenu />
        <RetourMenu />
        <div style={card}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>
              <span>Axe {etape} / {AXES.length}</span>
              <span style={{ color: '#60a5fa' }}>{form.organisation}</span>
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
                <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', lineHeight: 1.3, letterSpacing: '-0.5px' }}>{axe.nom}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '12px 16px', marginBottom: 24 }}>
              <Ico name="info" size={16} color="#60a5fa" />
              <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.55, margin: 0 }}>{axe.definition}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {axe.niveaux.map((texte, i) => {
                const selected = reponses[axe.id] === i
                return (
                  <button
                    key={i}
                    onClick={() => choisir(axe.id, i)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 14,
                      textAlign: 'left', fontFamily: 'inherit', fontSize: 13.5, cursor: 'pointer',
                      border: `1.5px solid ${selected ? '#0073F4' : 'rgba(255,255,255,0.06)'}`,
                      background: selected ? 'linear-gradient(135deg, rgba(0,115,244,0.18), rgba(0,14,145,0.25))' : 'rgba(255,255,255,0.02)', 
                      color: selected ? '#fff' : '#cbd5e1',
                      boxShadow: selected ? '0 4px 20px rgba(0,115,244,0.25)' : 'none',
                      transition: 'all .15s', lineHeight: 1.4,
                    }}
                  >
                    <span style={{
                      flexShrink: 0, width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: selected ? 'linear-gradient(135deg,#0073F4,#000E91)' : 'rgba(255,255,255,0.06)', 
                      color: selected ? '#fff' : '#94a3b8', fontSize: 12.5, fontWeight: 800,
                      border: selected ? 'none' : '1px solid rgba(255,255,255,0.08)'
                    }}>{i}</span>
                    <span style={{ fontWeight: selected ? 700 : 500, flex: 1 }}>{texte}</span>
                    {selected && <Ico name="check" size={18} color="#60a5fa" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={wrap}>
      <Fond />
        <BoutonMenu />
      <RetourMenu />
      <div style={{ ...card, textAlign: 'center', paddingTop: 100 }}>
        {erreurSoumission ? (
          <p style={{ color: '#f87171', fontSize: 14 }}>{erreurSoumission}</p>
        ) : (
          <div>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(0,115,244,0.2)', borderTop: '3px solid #0073F4', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#94a3b8', fontSize: 15, fontWeight: 600 }}>Enregistrement sécurisé de votre diagnostic...</p>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}