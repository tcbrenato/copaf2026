import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const NAVY = '#000E91'
const BLUE = '#0073F4'

// ── Contenu partage avec le fichier Excel (memes 10 axes, memes 6 niveaux) ──
const ECHELLE = [
  { valeur: 0, nom: 'Nul' },
  { valeur: 1, nom: 'Très faible' },
  { valeur: 2, nom: 'Faible' },
  { valeur: 3, nom: 'Moyen' },
  { valeur: 4, nom: 'Bon' },
  { valeur: 5, nom: 'Très bon' },
]

const AXES = [
  { id: 'infrastructure', nom: 'Infrastructure digitale & guichet unique', niveaux: [
    "Aucune démarche n'est numérisée, tout se fait sur papier.",
    "Quelques formulaires existent en version numérique, mais sans système centralisé.",
    "Un système numérique existe pour certaines procédures, utilisé de façon inégale.",
    "Un guichet unique partiel est en place, couvrant une partie des démarches.",
    "Le guichet unique couvre la majorité des démarches, avec une adoption large.",
    "Guichet unique complet, 100% dématérialisé, intégré aux systèmes des partenaires.",
  ]},
  { id: 'automatisation', nom: 'Automatisation des opérations physiques', niveaux: [
    "Toutes les opérations (grues, portiques, engins) sont manuelles.",
    "Quelques équipements assistés existent, mais l'essentiel reste manuel.",
    "Une automatisation partielle est en place sur certains équipements.",
    "Une zone ou un terminal pilote est significativement automatisé.",
    "L'automatisation couvre la majorité des opérations critiques.",
    "Opérations largement autonomes (portiques, véhicules) sur l'ensemble du terminal.",
  ]},
  { id: 'tracabilite', nom: 'Traçabilité & partage de données', niveaux: [
    "Aucun suivi numérique, tout par téléphone ou papier.",
    "Suivi basique via tableurs internes, non partagé.",
    "Un système de suivi existe mais reste interne, pas accessible aux clients.",
    "Une traçabilité partielle est accessible à certains partenaires.",
    "Suivi en temps quasi réel, accessible à la majorité des parties prenantes.",
    "Traçabilité temps réel complète, accessible via application aux clients et partenaires.",
  ]},
  { id: 'ia', nom: 'Intelligence artificielle & aide à la décision', niveaux: [
    "Aucun outil d'aide à la décision, tout est intuitif.",
    "Des statistiques descriptives basiques sont produites, sans analyse poussée.",
    "Des tableaux de bord existent mais sans capacité prédictive.",
    "Des outils d'aide à la décision ponctuels sont utilisés sur certains processus.",
    "Des modèles prédictifs sont utilisés sur plusieurs processus clés.",
    "IA prédictive intégrée en continu (accostage, flux, maintenance).",
  ]},
  { id: 'cybersecurite', nom: 'Cybersécurité', niveaux: [
    "Aucune politique de cybersécurité formalisée.",
    "Quelques mesures de base (mots de passe), rien de structuré.",
    "Une politique existe mais appliquée de façon partielle.",
    "Une gouvernance cybersécurité est en place, avec des contrôles réguliers.",
    "Une gouvernance mature, testée régulièrement (audits, exercices).",
    "Cybersécurité de niveau avancé, certifiée, avec surveillance continue.",
  ]},
  { id: 'surete', nom: 'Sûreté & sécurité opérationnelle', niveaux: [
    "Aucun dispositif de sûreté formalisé.",
    "Des mesures ponctuelles existent, sans coordination globale.",
    "Un dispositif de sûreté existe mais couvre une partie du site.",
    "Un dispositif de sûreté structuré couvre l'ensemble du site.",
    "Le dispositif est régulièrement audité et amélioré.",
    "Sûreté de niveau international, certifiée (ISPS et au-delà), exemplaire.",
  ]},
  { id: 'environnement', nom: 'Énergie & environnement', niveaux: [
    "Aucun suivi environnemental, pas de démarche engagée.",
    "Quelques mesures ponctuelles/manuelles de pollution.",
    "Des capteurs existent sur certaines zones, sans suivi continu.",
    "Un suivi environnemental structuré est en place sur une partie du site.",
    "La flotte/les équipements sont partiellement électrifiés ou décarbonés.",
    "Suivi continu et flotte largement décarbonée, démarche exemplaire.",
  ]},
  { id: 'synchromodalite', nom: 'Synchromodalité & intégration multimodale', niveaux: [
    "Aucune coordination entre modes de transport (route, rail, fleuve).",
    "Une coordination existe ponctuellement, au cas par cas.",
    "Des échanges d'informations existent entre certains modes.",
    "Une intégration partielle facilite le report modal.",
    "Une intégration avancée permet un choix modal flexible et informé.",
    "Synchromodalité pleinement intégrée, optimisée en temps réel.",
  ]},
  { id: 'competences', nom: 'Capacités organisationnelles & compétences', niveaux: [
    "Aucune formation digitale n'est proposée aux équipes.",
    "Quelques formations ponctuelles, non structurées.",
    "Un plan de formation existe mais touche une minorité du personnel.",
    "Un plan de formation structuré touche une majorité des équipes.",
    "Une culture digitale est largement partagée, formation continue.",
    "Compétences digitales matures à tous les niveaux, culture d'innovation forte.",
  ]},
  { id: 'parties_prenantes', nom: 'Engagement des parties prenantes', niveaux: [
    "Aucune concertation avec les partenaires/clients sur le digital.",
    "Des échanges ponctuels et informels existent.",
    "Une concertation existe mais reste limitée à quelques partenaires.",
    "Une concertation structurée existe avec les principales parties prenantes.",
    "Une collaboration active et régulière existe avec l'écosystème portuaire.",
    "Gouvernance partagée et collaborative avec l'ensemble de l'écosystème (ports, douanes, transporteurs, clients).",
  ]},
]

const Ico = ({ name, size = 20, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    check: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    search: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    arrow: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  }
  return icons[name] || null
}

export default function DiagnosticSmartPort() {
  const navigate = useNavigate()

  // Etape 0 = identification, 1..10 = axes, 11 = recap/soumission
  const [etape, setEtape] = useState(0)
  const [recherche, setRecherche] = useState('')
  const [chercheEnCours, setChercheEnCours] = useState(false)
  const [erreurRecherche, setErreurRecherche] = useState('')
  const [contact, setContact] = useState(null) // { id, nom, prenom, organisation, pays }

  const [reponses, setReponses] = useState({}) // { axisId: valeur }
  const [soumission, setSoumission] = useState(false)
  const [erreurSoumission, setErreurSoumission] = useState('')

  const handleRecherche = async e => {
    e.preventDefault()
    if (!recherche.trim()) return
    setChercheEnCours(true); setErreurRecherche('')

    const valeur = recherche.trim()
    const isDossier = /^COPAF/i.test(valeur)

    let query = supabase.from('contacts').select('id, nom, prenom, organisation, pays, email')
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
      setErreurRecherche("Aucune inscription trouvée avec cette référence ou cet email. Vérifiez, ou contactez le secrétariat.")
      return
    }
    setContact(rows[0])
    setEtape(1)
  }

  const choisir = (axisId, valeur) => {
    setReponses(r => ({ ...r, [axisId]: valeur }))
    // Avance automatique apres un court delai (le temps de voir la selection)
    setTimeout(() => setEtape(e => e + 1), 350)
  }

  const soumettre = async () => {
    setSoumission(true); setErreurSoumission('')
    const { data, error } = await supabase.from('diagnostics').insert([{
      contact_id: contact.id,
      nom: contact.nom, prenom: contact.prenom,
      organisation: contact.organisation, pays: contact.pays,
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
  const card = { width: '100%', maxWidth: 640 }

  // ── Etape 0 : identification ──
  if (etape === 0) {
    return (
      <div style={wrap}>
        <div style={card}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: BLUE, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>COPAF 2026</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', marginBottom: 10 }}>Diagnostic Smart Port</div>
            <p style={{ fontSize: 14.5, color: '#64748b', lineHeight: 1.6, maxWidth: 480, margin: '0 auto' }}>
              Évaluez en 2 minutes le niveau de maturité digitale de votre port sur 10 dimensions, et repartez avec des recommandations personnalisées.
            </p>
          </div>

          <form onSubmit={handleRecherche} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,14,145,.06)' }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              Votre numéro de dossier ou votre email d'inscription
            </label>
            <input
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              placeholder="COPAF2026-XXXXX ou votre@email.com"
              style={{ width: '100%', padding: '14px 16px', fontSize: 15, fontFamily: 'inherit', border: '1.5px solid #e2e8f0', borderRadius: 12, outline: 'none', boxSizing: 'border-box', marginBottom: 14 }}
            />
            {erreurRecherche && <p style={{ fontSize: 12.5, color: '#dc2626', marginBottom: 14 }}>{erreurRecherche}</p>}
            <button type="submit" disabled={chercheEnCours} style={{
              width: '100%', padding: '15px', background: `linear-gradient(135deg,${BLUE},${NAVY})`, border: 'none',
              borderRadius: 14, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <Ico name="search" size={16} color="#fff" />
              {chercheEnCours ? 'Recherche...' : 'Commencer le diagnostic'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Etapes 1 a 10 : un axe par ecran ──
  if (etape >= 1 && etape <= AXES.length) {
    const axe = AXES[etape - 1]
    const progression = Math.round(((etape - 1) / AXES.length) * 100)

    return (
      <div style={wrap}>
        <div style={card}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>
              <span>Axe {etape} / {AXES.length}</span>
              <span>{contact.organisation}</span>
            </div>
            <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${progression}%`, height: '100%', background: BLUE, borderRadius: 3, transition: 'width .3s' }} />
            </div>
          </div>

          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20, padding: 26, boxShadow: '0 4px 20px rgba(0,14,145,.06)' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 20, lineHeight: 1.4 }}>{axe.nom}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {axe.niveaux.map((texte, i) => {
                const selected = reponses[axe.id] === i
                return (
                  <button
                    key={i}
                    onClick={() => choisir(axe.id, i)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 12,
                      textAlign: 'left', fontFamily: 'inherit', fontSize: 13.5, cursor: 'pointer',
                      border: `2px solid ${selected ? BLUE : '#e2e8f0'}`,
                      background: selected ? '#EBF3FF' : '#fff', color: selected ? NAVY : '#334155',
                      transition: 'all .15s', lineHeight: 1.4,
                    }}
                  >
                    <span style={{
                      flexShrink: 0, width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: selected ? BLUE : '#f1f5f9', color: selected ? '#fff' : '#94a3b8', fontSize: 11.5, fontWeight: 800,
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
          <p style={{ color: '#64748b', fontSize: 15 }}>Calcul de votre profil Smart Port...</p>
        )}
      </div>
    </div>
  )
}