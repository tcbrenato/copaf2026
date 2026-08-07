import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

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

// ── Contenu partage avec l'Excel : definition + 6 niveaux par axe ──
const AXES = [
  {
    id: 'infrastructure', nom: 'Infrastructure digitale & guichet unique', icone: '🖥️',
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
    id: 'automatisation', nom: 'Automatisation des opérations physiques', icone: '⚙️',
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
    id: 'tracabilite', nom: 'Traçabilité & partage de données', icone: '📡',
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
    id: 'ia', nom: 'Intelligence artificielle & aide à la décision', icone: '🧠',
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
    id: 'cybersecurite', nom: 'Cybersécurité', icone: '🔒',
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
    id: 'surete', nom: 'Sûreté & sécurité opérationnelle', icone: '🛡️',
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
    id: 'environnement', nom: 'Énergie & environnement', icone: '🌱',
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
    id: 'synchromodalite', nom: 'Synchromodalité & intégration multimodale', icone: '🔀',
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
    id: 'competences', nom: 'Capacités organisationnelles & compétences', icone: '🎓',
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
    id: 'parties_prenantes', nom: 'Engagement des parties prenantes', icone: '🤝',
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
    check: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    arrow: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    info: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  }
  return icons[name] || null
}

export default function DiagnosticSmartPort() {
  const navigate = useNavigate()

  // -1 = identification, 0 = intro/definitions, 1..10 = axes, 11 = soumission
  const [etape, setEtape] = useState(-1)

  const [identMode, setIdentMode] = useState('dossier') // 'dossier' | 'directe'
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
    setTimeout(() => setEtape(e => e + 1), 350)
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

  const wrap = { minHeight: '100vh', background: 'linear-gradient(180deg,#f0f6ff 0%,#f8faff 100%)', fontFamily: "'Plus Jakarta Sans',sans-serif", padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }
  const card = { width: '100%', maxWidth: 660 }
  const inputStyle = { width: '100%', padding: '13px 16px', fontSize: 14.5, fontFamily: 'inherit', border: '1.5px solid #e2e8f0', borderRadius: 12, outline: 'none', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }

  // ══════════════════════════════════════════
  // ETAPE -1 : Identification directe
  // ══════════════════════════════════════════
  if (etape === -1) {
    return (
      <div style={wrap}>
        <div style={card}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: BLUE, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>COPAF 2026</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', marginBottom: 10 }}>Diagnostic Smart Port</div>
            <p style={{ fontSize: 14.5, color: '#64748b', lineHeight: 1.6, maxWidth: 480, margin: '0 auto' }}>
              Évaluez le niveau de maturité digitale de votre port sur 10 dimensions, et repartez avec des recommandations personnalisées.
            </p>
          </div>

          {/* Bascule entre les deux modes d'identification */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button type="button" onClick={() => setIdentMode('dossier')} style={{
              flex: 1, padding: '10px', borderRadius: 12, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', border: `1.5px solid ${identMode === 'dossier' ? BLUE : '#e2e8f0'}`,
              background: identMode === 'dossier' ? '#EBF3FF' : '#fff', color: identMode === 'dossier' ? NAVY : '#64748b',
            }}>Par numéro de dossier</button>
            <button type="button" onClick={() => setIdentMode('directe')} style={{
              flex: 1, padding: '10px', borderRadius: 12, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', border: `1.5px solid ${identMode === 'directe' ? BLUE : '#e2e8f0'}`,
              background: identMode === 'directe' ? '#EBF3FF' : '#fff', color: identMode === 'directe' ? NAVY : '#64748b',
            }}>Mes informations directement</button>
          </div>

          {identMode === 'dossier' ? (
            <form onSubmit={handleRechercheDossier} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20, padding: 26, boxShadow: '0 4px 20px rgba(0,14,145,.06)' }}>
              <label style={labelStyle}>Votre numéro de dossier ou votre email d'inscription</label>
              <input
                value={recherche}
                onChange={e => setRecherche(e.target.value)}
                placeholder="COPAF2026-XXXXX ou votre@email.com"
                style={{ ...inputStyle, marginBottom: 14 }}
              />
              {erreurRecherche && <p style={{ fontSize: 12.5, color: '#dc2626', marginBottom: 14 }}>{erreurRecherche}</p>}
              <button type="submit" disabled={chercheEnCours} style={{
                width: '100%', padding: '15px', background: `linear-gradient(135deg,${BLUE},${NAVY})`, border: 'none',
                borderRadius: 14, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                {chercheEnCours ? 'Recherche...' : 'Continuer'} <Ico name="arrow" size={16} color="#fff" />
              </button>
            </form>
          ) : (
          <form onSubmit={validerIdentification} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20, padding: 26, boxShadow: '0 4px 20px rgba(0,14,145,.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Prénom *</label>
                <input style={inputStyle} value={form.prenom} onChange={e => handleFormChange('prenom', e.target.value)} placeholder="Votre prénom" />
              </div>
              <div>
                <label style={labelStyle}>Nom *</label>
                <input style={inputStyle} value={form.nom} onChange={e => handleFormChange('nom', e.target.value)} placeholder="Votre nom" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Téléphone</label>
                <input style={inputStyle} value={form.telephone} onChange={e => handleFormChange('telephone', e.target.value)} placeholder="+xxx xxx xxx xxx" />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} type="email" value={form.email} onChange={e => handleFormChange('email', e.target.value)} placeholder="votre@email.com" />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Port / Organisation *</label>
              <input style={inputStyle} value={form.organisation} onChange={e => handleFormChange('organisation', e.target.value)} placeholder="Ex : Port Autonome de Kribi" />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Pays *</label>
              <input style={inputStyle} value={form.pays} onChange={e => handleFormChange('pays', e.target.value)} placeholder="Ex : Cameroun" />
            </div>

            {erreurForm && <p style={{ fontSize: 12.5, color: '#dc2626', marginBottom: 14 }}>{erreurForm}</p>}

            <button type="submit" style={{
              width: '100%', padding: '15px', background: `linear-gradient(135deg,${BLUE},${NAVY})`, border: 'none',
              borderRadius: 14, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              Continuer <Ico name="arrow" size={16} color="#fff" />
            </button>
          </form>
          )}
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════
  // ETAPE 0 : Introduction — les 10 axes + le bareme
  // ══════════════════════════════════════════
  if (etape === 0) {
    return (
      <div style={wrap}>
        <div style={{ ...card, maxWidth: 760 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: BLUE, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Avant de commencer</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 10 }}>Comment fonctionne ce diagnostic</div>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
              10 dimensions du "Smart Port" à évaluer, notées de 0 à 5. Prenez un instant pour lire chaque définition — une compréhension commune garantit des résultats comparables entre tous les ports.
            </p>
          </div>

          {/* Bareme */}
          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: 18, marginBottom: 16, boxShadow: '0 4px 16px rgba(0,14,145,.05)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Le barème de notation</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ECHELLE.map(n => (
                <div key={n.valeur} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#f8fafc', borderRadius: 20, border: '1px solid #e2e8f0' }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: BLUE, color: '#fff', fontSize: 10.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n.valeur}</span>
                  <span style={{ fontSize: 12.5, color: '#334155', fontWeight: 600 }}>{n.nom}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Les 10 axes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
            {AXES.map((axe, i) => (
              <div key={axe.id} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start', boxShadow: '0 2px 8px rgba(0,14,145,.04)' }}>
                <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{axe.icone}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', marginBottom: 3 }}>{i + 1}. {axe.nom}</div>
                  <div style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.5 }}>{axe.definition}</div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setEtape(1)} style={{
            width: '100%', padding: '16px', background: `linear-gradient(135deg,${BLUE},${NAVY})`, border: 'none',
            borderRadius: 14, color: '#fff', fontSize: 15.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(0,115,244,.3)',
          }}>
            J'ai compris, commencer le diagnostic <Ico name="arrow" size={17} color="#fff" />
          </button>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════
  // ETAPES 1 a 10 : un axe par ecran, redesigne
  // ══════════════════════════════════════════
  if (etape >= 1 && etape <= AXES.length) {
    const axe = AXES[etape - 1]
    const progression = Math.round(((etape - 1) / AXES.length) * 100)

    return (
      <div style={wrap}>
        <div style={card}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>
              <span>Axe {etape} / {AXES.length}</span>
              <span>{form.organisation}</span>
            </div>
            <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${progression}%`, height: '100%', background: `linear-gradient(90deg,${BLUE},${NAVY})`, borderRadius: 3, transition: 'width .3s' }} />
            </div>
          </div>

          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 22, padding: 28, boxShadow: '0 8px 28px rgba(0,14,145,.08)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 8 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16, flexShrink: 0, background: 'linear-gradient(135deg,#EBF3FF,#dbeafe)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
              }}>{axe.icone}</div>
              <div>
                <div style={{ fontSize: 19, fontWeight: 900, color: '#0f172a', lineHeight: 1.3 }}>{axe.nom}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: '#f8fafc', borderRadius: 12, padding: '10px 14px', marginBottom: 22 }}>
              <Ico name="info" size={15} color="#94a3b8" />
              <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.55, margin: 0 }}>{axe.definition}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {axe.niveaux.map((texte, i) => {
                const selected = reponses[axe.id] === i
                return (
                  <button
                    key={i}
                    onClick={() => choisir(axe.id, i)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 13,
                      textAlign: 'left', fontFamily: 'inherit', fontSize: 13.5, cursor: 'pointer',
                      border: `2px solid ${selected ? BLUE : '#e2e8f0'}`,
                      background: selected ? 'linear-gradient(135deg,#EBF3FF,#f0f6ff)' : '#fff', color: selected ? NAVY : '#334155',
                      transition: 'all .15s', lineHeight: 1.4,
                    }}
                  >
                    <span style={{
                      flexShrink: 0, width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: selected ? `linear-gradient(135deg,${BLUE},${NAVY})` : '#f1f5f9', color: selected ? '#fff' : '#94a3b8', fontSize: 12, fontWeight: 800,
                    }}>{i}</span>
                    <span style={{ fontWeight: selected ? 700 : 500 }}>{texte}</span>
                    {selected && <Ico name="check" size={16} color={BLUE} />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Soumission en cours ──
  return (
    <div style={wrap}>
      <div style={{ ...card, textAlign: 'center', paddingTop: 80 }}>
        {erreurSoumission ? (
          <p style={{ color: '#dc2626', fontSize: 14 }}>{erreurSoumission}</p>
        ) : (
          <p style={{ color: '#64748b', fontSize: 15 }}>Enregistrement de votre diagnostic...</p>
        )}
      </div>
    </div>
  )
}