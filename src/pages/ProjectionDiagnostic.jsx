import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import QRCode from 'qrcode'
import { supabase } from '../supabase'
import RetourMenu from '../components/RetourMenu'
import DiagnosticLiveMap from '../components/DiagnosticLiveMap'
import { AXES, txt } from '../utils/diagnosticAxes'
import { RESEAUX } from '../utils/diagnosticOrganisations'
import { RESEAU_COLORS } from '../data/diagnosticCountries'

const BLUE = '#0073F4'

// Ecran de projection (phase 4) : affichage plein ecran, sans interaction,
// destine a etre projete en salle de conference. Ne montre jamais de donnee
// nominative — uniquement des moyennes agregees par axe (memes RPC
// SECURITY DEFINER que le reste du diagnostic collaboratif) et un compteur
// de participants actifs. Toutes les vues actives (globale + reseaux ayant
// deja des soumissions) s'affichent simultanement sous forme de cartes ;
// une carte cliquee s'ouvre en grand dans une fenetre modale pour l'analyse
// detaillee (radar + detail des 10 axes).

const TR = {
  fr: {
    badge: 'COPAF 2026 · DIAGNOSTIC SMART PORT',
    titre: 'Vue collective en direct',
    sousTitre: "Moyenne des diagnostics soumis pendant la conférence — aucune donnée individuelle n'est affichée. Touchez une carte pour l'analyse détaillée.",
    tousPorts: 'Tous les ports',
    scoreMoyen: 'Score moyen',
    surCinq: '/ 5',
    diagnosticsSoumis: 'Diagnostics soumis',
    enLigne: 'En train de répondre',
    attenteTitre: 'En attente des premières réponses',
    attenteTexte: 'Les diagnostics soumis apparaîtront ici en direct.',
    direct: 'EN DIRECT',
    fermer: 'Fermer',
    panneauPaysLabel: 'Pays',
    panneauPortsLabel: 'Port(s) / autorité(s) en ligne',
    panneauStatutUn: 'répond actuellement',
    panneauStatutPlusieurs: n => `${n} personnes répondent actuellement`,
    panneauAttenteTitre: 'En attente de réponses',
    panneauAttenteTexte: "Dès qu'un participant sélectionne son pays, il apparaît ici en direct.",
    positionValidee: '✓ Position officielle validée',
    scannerTitre: 'Pas encore répondu ?',
    scannerTexte: 'Scannez pour participer',
    vientDeRepondre: region => `Un port de ${region} vient de valider son diagnostic !`,
    vientDeRepondreGenerique: 'Un port vient de valider son diagnostic !',
    individuelsTitre: 'Profils individuels — anonymes',
    individuelsTexte: 'Chaque toile représente un port ayant répondu. Aucune donnée d’identité — uniquement le profil, pour comparer les niveaux de maturité.',
    portLabel: n => `Port ${n}`,
    portSur: (n, total) => `Port ${n} / ${total}`,
    individuelsVide: 'Aucun diagnostic individuel à afficher pour le moment.',
    jaugeLabel: (n, total) => `${n} connecté${n > 1 ? 's' : ''} sur ${total} attendus`,
    legendCePort: 'Ce port',
    legendMoyenne: 'Moyenne conférence',
    topFlopTitre: 'Points forts & axes prioritaires — moyenne de la conférence',
    topLabel: 'Points forts',
    flopLabel: 'Axes prioritaires',
  },
  en: {
    badge: 'COPAF 2026 · SMART PORT DIAGNOSTIC',
    titre: 'Live collective view',
    sousTitre: 'Average of diagnostics submitted during the conference — no individual data is shown. Tap a card for the detailed analysis.',
    tousPorts: 'All ports',
    scoreMoyen: 'Average score',
    surCinq: '/ 5',
    diagnosticsSoumis: 'Diagnostics submitted',
    enLigne: 'Currently answering',
    attenteTitre: 'Waiting for the first responses',
    attenteTexte: 'Diagnostics submitted will appear here live.',
    direct: 'LIVE',
    fermer: 'Close',
    panneauPaysLabel: 'Country',
    panneauPortsLabel: 'Port(s) / authority(ies) online',
    panneauStatutUn: 'currently answering',
    panneauStatutPlusieurs: n => `${n} people currently answering`,
    panneauAttenteTitre: 'Waiting for responses',
    panneauAttenteTexte: 'As soon as a participant selects their country, it appears here live.',
    positionValidee: '✓ Official position validated',
    scannerTitre: "Haven't answered yet?",
    scannerTexte: 'Scan to take part',
    vientDeRepondre: region => `A port from ${region} just completed its diagnostic!`,
    vientDeRepondreGenerique: 'A port just completed its diagnostic!',
    individuelsTitre: 'Individual profiles — anonymous',
    individuelsTexte: 'Each web represents one port that answered. No identity data — just the profile, to compare maturity levels.',
    portLabel: n => `Port ${n}`,
    portSur: (n, total) => `Port ${n} / ${total}`,
    individuelsVide: 'No individual diagnostic to show yet.',
    jaugeLabel: (n, total) => `${n} connected out of ${total} expected`,
    legendCePort: 'This port',
    legendMoyenne: 'Conference average',
    topFlopTitre: 'Strengths & priority areas — conference average',
    topLabel: 'Strengths',
    flopLabel: 'Priority areas',
  },
}

const VUE_IDS = ['global', 'agpaoc', 'pmaesa', 'uapna', 'associe']

function labelVue(id, lang) {
  if (id === 'global') return TR[lang].tousPorts
  return txt(RESEAUX[id], lang)
}

function couleurScore(v) {
  if (v < 2) return '#ef4444'
  if (v < 3.5) return '#f59e0b'
  return '#22c55e'
}

// ─── Mini radar (carte de la grille individuelle) — juste la forme, sans
// axes ni legende, pour rester lisible en petit format cote a cote. ───────
function MiniRadar({ scores }) {
  const data = AXES.map(axe => ({ axis: axe.id, valeur: scores?.[axe.id] ?? 0, fullMark: 5 }))
  return (
    <ResponsiveContainer width="100%" height={120}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="rgba(255,255,255,0.12)" />
        <PolarAngleAxis dataKey="axis" tick={false} axisLine={false} />
        <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
        <Radar dataKey="valeur" stroke="#60a5fa" fill={BLUE} fillOpacity={0.45} strokeWidth={2} isAnimationActive={false} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

// ─── Detail complet d'une vue : radar + 10 axes (contenu de la modale) ─────
// `benchmark` (optionnel) superpose la moyenne de la conference en tache de
// fond sur le radar — sert uniquement pour les profils individuels, pour
// que chaque port se situe instantanement par rapport a la moyenne globale.
function DetailVue({ agg, lang, t, benchmark }) {
  const data = AXES.map(axe => ({
    axis: txt(axe.nom, lang),
    valeur: agg?.moyennes?.[axe.id] ?? 0,
    benchmark: benchmark?.[axe.id] ?? 0,
    fullMark: 5,
  }))
  return (
    <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'stretch', width: '100%' }}>
      <div style={{ flex: '1 1 480px', maxWidth: 560, minHeight: 380 }}>
        {benchmark && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginBottom: 6 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#cbd5e1', fontWeight: 700 }}>
              <span style={{ width: 16, height: 2, background: '#60a5fa', display: 'inline-block' }} /> {t.legendCePort}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#94a3b8', fontWeight: 700 }}>
              <span style={{ width: 16, height: 2, background: '#94a3b8', display: 'inline-block', borderTop: '2px dashed #94a3b8' }} /> {t.legendMoyenne}
            </span>
          </div>
        )}
        <ResponsiveContainer width="100%" height={benchmark ? 356 : 380}>
          <RadarChart data={data} outerRadius="60%">
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: '#cbd5e1' }} />
            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
            {benchmark && (
              <Radar dataKey="benchmark" stroke="#94a3b8" strokeDasharray="4 4" fill="#94a3b8" fillOpacity={0.08} strokeWidth={1.75} isAnimationActive={false} />
            )}
            <Radar dataKey="valeur" stroke="#60a5fa" fill={BLUE} fillOpacity={0.4} strokeWidth={2.5} isAnimationActive animationDuration={500} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ flex: '1 1 340px', maxWidth: 400 }}>
        {AXES.map(axe => {
          const v = agg?.moyennes?.[axe.id] ?? 0
          return (
            <div key={axe.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: '#cbd5e1', width: 170, flexShrink: 0, lineHeight: 1.25 }}>{txt(axe.nom, lang)}</span>
              <div style={{ flex: 1, height: 9, background: 'rgba(255,255,255,0.08)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ width: `${(v / 5) * 100}%`, height: '100%', background: couleurScore(v), borderRadius: 5, transition: 'width .5s ease' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: couleurScore(v), width: 30, textAlign: 'right', flexShrink: 0 }}>{v.toFixed(1)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ProjectionDiagnostic() {
  const [lang, setLang] = useState('fr')
  const t = TR[lang]

  const [aggregates, setAggregates] = useState({})
  const [participantsCount, setParticipantsCount] = useState(0)
  const [liveCountries, setLiveCountries] = useState(() => new Set())
  const [liveByCountry, setLiveByCountry] = useState(() => new Map())
  const [vueOuverte, setVueOuverte] = useState(null)
  // Liste anonyme des diagnostics individuels (un objet scores par port
  // ayant repondu, aucune donnee d'identite) — alimente la grille de toiles
  // d'araignee individuelles et sa modale de navigation prev/suivant.
  const [individuels, setIndividuels] = useState([])
  const [individuelOuvert, setIndividuelOuvert] = useState(null)
  const channelRef = useRef(null)

  // QR code statique vers le questionnaire, genere une seule fois.
  const [qrDiagnostic, setQrDiagnostic] = useState('')
  useEffect(() => {
    QRCode.toDataURL('https://copaf-ports.com/diagnostic', { width: 300, margin: 1, color: { dark: '#0b0f1c', light: '#FFFFFF' } })
      .then(setQrDiagnostic)
      .catch(() => setQrDiagnostic(''))
  }, [])

  // Ticker "dernieres reponses" — region (reseau) uniquement, jamais le
  // pays ni l'organisation (demande explicite : ne jamais devoiler qui
  // repond en projection, avec un niveau de discretion encore plus large
  // que le pays pour ces popups dynamiques). Chaque entree disparait
  // d'elle-meme apres quelques secondes.
  const [ticker, setTicker] = useState([])
  const ajouterAuTicker = reseau => {
    const id = crypto.randomUUID()
    setTicker(list => [{ id, reseau: reseau || null }, ...list].slice(0, 5))
    setTimeout(() => setTicker(list => list.filter(e => e.id !== id)), 8000)
  }

  // Jauge d'engagement : participants actuellement connectes (presence,
  // deja suivi ci-dessous) rapportes au nombre total d'inscrits a la
  // conference (RPC anonyme, aucune donnee d'identite).
  const [inscriptionsCount, setInscriptionsCount] = useState(0)
  useEffect(() => {
    const charger = () => {
      supabase.rpc('get_inscriptions_count').then(({ data }) => {
        if (typeof data === 'number') setInscriptionsCount(data)
      })
    }
    charger()
    const poll = setInterval(charger, 60000)
    return () => clearInterval(poll)
  }, [])

  // Cet ecran n'a pas de notion de "port" individuel (il agrege par
  // reseau) : le rapprochement avec une position officielle validee se
  // fait donc par nom d'organisation affiche, identique des deux cotes
  // (meme construction "Nom — Site" a la soumission et en presence live).
  const [organisationsAvecPositionOfficielle, setOrganisationsAvecPositionOfficielle] = useState(() => new Set())
  useEffect(() => {
    const chargerPositions = () => {
      supabase.rpc('list_official_positions_with_names').then(({ data }) => {
        setOrganisationsAvecPositionOfficielle(new Set((data || []).map(p => p.organisation).filter(Boolean)))
      })
    }
    chargerPositions()
    const poll = setInterval(chargerPositions, 60000)
    return () => clearInterval(poll)
  }, [])

  // Pays actuellement mis en avant dans le panneau lateral (survol/clic sur
  // la carte, ou cycle automatique parmi les pays en direct — meme
  // interaction que la carte AGPAOC/UAPNA de la page d'accueil).
  const [activeCountry, setActiveCountry] = useState(null)
  const pausedRef = useRef(false)
  const resumeTimeoutRef = useRef(null)

  const fetchAll = useCallback(async () => {
    const results = await Promise.all(VUE_IDS.map(async id => {
      const { data } = await supabase.rpc('get_diagnostic_global_aggregate', { p_reseau: id === 'global' ? null : id })
      if (!data || data.length === 0) return [id, null]
      const moyennes = {}
      let nb = 0
      data.forEach(row => { moyennes[row.axis_id] = Number(row.moyenne); nb = Math.max(nb, Number(row.nb_reponses)) })
      return [id, { moyennes, nb }]
    }))
    setAggregates(Object.fromEntries(results))

    const { data: indivData } = await supabase.rpc('get_diagnostic_individual_scores', { p_reseau: null })
    setIndividuels(indivData || [])
  }, [])

  useEffect(() => {
    fetchAll()

    const channel = supabase.channel('diagnostic-projection')
    channelRef.current = channel
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setParticipantsCount(Object.keys(state).length)
        const countries = new Set()
        const byCountry = new Map()
        Object.values(state).forEach(presences => {
          presences.forEach(p => {
            if (!p.country) return
            countries.add(p.country)
            const entry = byCountry.get(p.country) || { organisations: new Set(), count: 0 }
            entry.count += 1
            if (p.organisation) entry.organisations.add(p.organisation)
            byCountry.set(p.country, entry)
          })
        })
        setLiveCountries(countries)
        setLiveByCountry(byCountry)
      })
      .on('broadcast', { event: 'nouvelle-reponse' }, ({ payload }) => {
        fetchAll()
        ajouterAuTicker(payload?.reseau)
      })
      .subscribe()

    const poll = setInterval(fetchAll, 30000)
    return () => {
      clearInterval(poll)
      channelRef.current = null
      supabase.removeChannel(channel)
    }
  }, [fetchAll])

  // Cycle automatique du pays mis en avant, uniquement parmi les pays
  // actuellement en direct (pas de sens a mettre en avant un pays statique
  // quand personne n'y repond) — pause au survol/clic, comme sur la carte
  // d'accueil.
  useEffect(() => {
    const liveList = [...liveCountries]
    if (liveList.length === 0) { setActiveCountry(null); return }
    setActiveCountry(prev => (prev && liveList.includes(prev)) ? prev : liveList[0])
    const id = setInterval(() => {
      if (pausedRef.current) return
      setActiveCountry(prev => {
        const list = [...liveCountries]
        if (list.length === 0) return null
        const i = list.indexOf(prev)
        return list[(i + 1) % list.length]
      })
    }, 4000)
    return () => clearInterval(id)
  }, [liveCountries])

  useEffect(() => () => clearTimeout(resumeTimeoutRef.current), [])

  const survolerPays = nom => {
    pausedRef.current = true
    clearTimeout(resumeTimeoutRef.current)
    setActiveCountry(nom)
  }
  const quitterPays = () => { pausedRef.current = false }
  const cliquerPays = nom => {
    pausedRef.current = true
    clearTimeout(resumeTimeoutRef.current)
    setActiveCountry(nom)
    resumeTimeoutRef.current = setTimeout(() => { pausedRef.current = false }, 6000)
  }

  const individuelPrecedent = () => setIndividuelOuvert(i => (i === null ? null : (i - 1 + individuels.length) % individuels.length))
  const individuelSuivant = () => setIndividuelOuvert(i => (i === null ? null : (i + 1) % individuels.length))

  useEffect(() => {
    if (individuelOuvert === null) return
    const total = individuels.length
    const onKey = e => {
      if (e.key === 'ArrowLeft') setIndividuelOuvert(i => (i === null ? null : (i - 1 + total) % total))
      if (e.key === 'ArrowRight') setIndividuelOuvert(i => (i === null ? null : (i + 1) % total))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [individuelOuvert, individuels.length])

  const vuesActives = VUE_IDS.filter(id => id === 'global' || aggregates[id]?.nb > 0)
  const aggGlobal = aggregates.global
  const activeEntry = activeCountry ? liveByCountry.get(activeCountry) : null

  // Top/Flop des axes strategiques — calcule sur la moyenne globale de la
  // conference, pour donner aux decideurs une lecture immediate des forces
  // et des priorites d'investissement a l'echelle continentale.
  const axesTries = aggGlobal ? [...AXES].sort((a, b) => (aggGlobal.moyennes[b.id] ?? 0) - (aggGlobal.moyennes[a.id] ?? 0)) : []
  const axesForts = axesTries.slice(0, 3)
  const axesPrioritaires = axesTries.slice(-3).reverse()

  const wrap = { minHeight: '100vh', width: '100vw', position: 'relative', overflow: 'auto', fontFamily: "'Plus Jakarta Sans',sans-serif", color: '#f8fafc', display: 'flex', flexDirection: 'column' }
  const bgImage = { position: 'fixed', inset: 0, zIndex: -3, backgroundColor: '#0b0f1c', backgroundImage: 'url(/hero1.png)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.55) saturate(1.25)' }
  const bgOverlay = { position: 'fixed', inset: 0, zIndex: -2, backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(13,27,62,0.6) 0%, rgba(6,9,18,0.9) 75%)' }
  const bgGlow = { position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '80vw', height: '80vw', zIndex: -1, background: `radial-gradient(circle, ${BLUE}22 0%, transparent 65%)`, pointerEvents: 'none' }

  const card = { background: 'rgba(15, 23, 42, 0.68)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 22, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }

  return (
    <div style={wrap}>
      <div style={bgImage} /><div style={bgOverlay} /><div style={bgGlow} />

      <RetourMenu />

      <button onClick={() => setLang(l => l === 'fr' ? 'en' : 'fr')} type="button" style={{
        position: 'fixed', top: 16, right: 16, zIndex: 50, display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '9px 16px', borderRadius: 100, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
      }}>
        {lang === 'fr' ? 'EN · Français' : 'FR · English'}
      </button>

      {/* QR de participation — permanent, discret, pour les retardataires
          dans la salle (l'ecran de projection n'indiquait avant aucun moyen
          de rejoindre le questionnaire). */}
      {qrDiagnostic && (
        <div style={{
          ...card, position: 'fixed', bottom: 20, left: 20, zIndex: 50, padding: 14,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <img src={qrDiagnostic} alt="QR" style={{ width: 72, height: 72, borderRadius: 8, display: 'block' }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 800 }}>{t.scannerTitre}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{t.scannerTexte}</div>
          </div>
        </div>
      )}

      {/* Ticker "dernieres reponses" — region uniquement, jamais le pays ni l'organisation. */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 50, display: 'flex', flexDirection: 'column-reverse', gap: 8, alignItems: 'flex-end' }}>
        {ticker.map(entry => (
          <div key={entry.id} style={{
            ...card, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 12.5, fontWeight: 700, animation: 'copaf-proj-ticker-in .3s ease',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
            {entry.reseau && entry.reseau !== 'global' ? t.vientDeRepondre(labelVue(entry.reseau, lang)) : t.vientDeRepondreGenerique}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 40px', gap: 32, maxWidth: 1500, margin: '0 auto', width: '100%' }}>

        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(0,115,244,0.15)', border: '1px solid rgba(0,115,244,0.4)', borderRadius: 20, fontSize: 12.5, fontWeight: 800, color: '#60a5fa', letterSpacing: 1.5, marginBottom: 16 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'copaf-proj-pulse 1.4s ease-in-out infinite' }} />
            {t.badge} · {t.direct}
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 3.4vw, 46px)', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>{t.titre}</h1>
          <p style={{ fontSize: 'clamp(13px, 1.1vw, 16px)', color: '#94a3b8', margin: '10px 0 0', maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>{t.sousTitre}</p>
        </div>

        <div style={{ ...card, padding: '14px 24px', display: 'flex', flexDirection: 'column', gap: 10, minWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', flexShrink: 0, animation: 'copaf-proj-pulse 1.4s ease-in-out infinite' }} />
            <div style={{ fontSize: 14, fontWeight: 800 }}>{participantsCount}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>{t.enLigne}</div>
          </div>
          {inscriptionsCount > 0 && (
            <div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, (participantsCount / inscriptionsCount) * 100)}%`, height: '100%',
                  background: 'linear-gradient(90deg, #0073F4, #60a5fa)', borderRadius: 3, transition: 'width .6s ease',
                }} />
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, fontWeight: 600 }}>{t.jaugeLabel(participantsCount, inscriptionsCount)}</div>
            </div>
          )}
        </div>

        {/* Top/Flop des axes strategiques — moyenne globale de la conference. */}
        {aggGlobal && aggGlobal.nb > 0 && (
          <div style={{ ...card, padding: 'clamp(16px,3vw,28px)', width: '100%' }}>
            <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 800, color: '#cbd5e1', marginBottom: 18, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              {t.topFlopTitre}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#22c55e', marginBottom: 12 }}>▲ {t.topLabel}</div>
                {axesForts.map(axe => {
                  const v = aggGlobal.moyennes[axe.id] ?? 0
                  return (
                    <div key={axe.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 12.5, color: '#e2e8f0', flex: 1, lineHeight: 1.3 }}>{txt(axe.nom, lang)}</span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: couleurScore(v), flexShrink: 0 }}>{v.toFixed(1)}</span>
                    </div>
                  )
                })}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#ef4444', marginBottom: 12 }}>▼ {t.flopLabel}</div>
                {axesPrioritaires.map(axe => {
                  const v = aggGlobal.moyennes[axe.id] ?? 0
                  return (
                    <div key={axe.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 12.5, color: '#e2e8f0', flex: 1, lineHeight: 1.3 }}>{txt(axe.nom, lang)}</span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: couleurScore(v), flexShrink: 0 }}>{v.toFixed(1)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Carte vectorielle live (gauche) + panneau pays (droite) : meme
            disposition que la carte AGPAOC/UAPNA de la page d'accueil. Le
            panneau ne montre jamais de donnee individuelle — uniquement le
            pays, le(s) port(s)/autorite(s) et un statut anonymise. */}
        <div className="diag-proj-map-layout" style={{ ...card, padding: 'clamp(16px,3vw,32px)', width: '100%', display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(260px, 340px)', gap: 'clamp(20px, 3vw, 40px)', alignItems: 'center' }}>
          <div>
            <DiagnosticLiveMap
              liveCountries={liveCountries}
              activeCountry={activeCountry}
              onHoverCountry={survolerPays}
              onLeaveCountry={quitterPays}
              onClickCountry={cliquerPays}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', justifyContent: 'center', marginTop: 18 }}>
              {VUE_IDS.filter(id => id !== 'global').map(id => (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: '#cbd5e1' }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: RESEAU_COLORS[id], flexShrink: 0 }} />
                  {labelVue(id, lang)}
                </div>
              ))}
            </div>
          </div>

          <aside style={{
            padding: 22, borderRadius: 16, background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)', minHeight: 220,
          }}>
            {!activeCountry ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>{t.panneauAttenteTitre}</div>
                <p style={{ fontSize: 12.5, color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>{t.panneauAttenteTexte}</p>
              </div>
            ) : (
              <>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#60a5fa', letterSpacing: 1.5, textTransform: 'uppercase' }}>{t.panneauPaysLabel}</span>
                <h3 style={{ fontSize: 22, fontWeight: 900, margin: '6px 0 18px' }}>{activeCountry}</h3>

                <div style={{ marginBottom: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{t.panneauPortsLabel}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
                    {activeEntry && activeEntry.organisations.size > 0 ? [...activeEntry.organisations].map(nom => (
                      <div key={nom} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.5 }}>{nom}</span>
                        {organisationsAvecPositionOfficielle.has(nom) && (
                          <span style={{ fontSize: 10, fontWeight: 800, color: '#065f46', background: '#d1fae5', borderRadius: 20, padding: '2px 8px', flexShrink: 0 }}>
                            {t.positionValidee}
                          </span>
                        )}
                      </div>
                    )) : <span style={{ fontSize: 13.5, fontWeight: 700 }}>—</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0, animation: 'copaf-proj-pulse 1.4s ease-in-out infinite' }} />
                  <span style={{ fontSize: 12.5, color: '#cbd5e1', fontWeight: 600 }}>
                    {activeEntry ? (activeEntry.count === 1 ? t.panneauStatutUn : t.panneauStatutPlusieurs(activeEntry.count)) : ''}
                  </span>
                </div>
              </>
            )}
          </aside>
        </div>

        <style>{`
          @media (max-width: 760px) {
            .diag-proj-map-layout { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* Grille de cartes : toutes les vues actives affichees simultanement */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, width: '100%' }}>
          {vuesActives.map(id => {
            const agg = aggregates[id]
            const valeurs = agg ? Object.values(agg.moyennes) : []
            const score = valeurs.length ? valeurs.reduce((s, v) => s + v, 0) / valeurs.length : 0
            return (
              <button
                key={id}
                type="button"
                onClick={() => setVueOuverte(id)}
                style={{
                  ...card, padding: '22px 24px', textAlign: 'left', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 14, color: '#fff', fontFamily: 'inherit',
                  transition: 'transform .2s ease, border-color .2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(0,115,244,0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)' }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 800 }}>{labelVue(id, lang)}</div>

                {!agg ? (
                  <div style={{ padding: '20px 0', textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{t.attenteTitre}</div>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{t.attenteTexte}</p>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 32, fontWeight: 900, color: couleurScore(score), lineHeight: 1 }}>{score.toFixed(1)}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, marginTop: 4, textTransform: 'uppercase' }}>{t.scoreMoyen} {t.surCinq}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 32, fontWeight: 900, color: '#60a5fa', lineHeight: 1 }}>{agg.nb}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, marginTop: 4, textTransform: 'uppercase' }}>{t.diagnosticsSoumis}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {AXES.map(axe => (
                        <div key={axe.id} style={{ flex: 1, height: 6, borderRadius: 3, background: couleurScore(agg.moyennes[axe.id] ?? 0) }} />
                      ))}
                    </div>
                  </>
                )}
              </button>
            )
          })}
        </div>

        {/* Grille des profils individuels anonymes : une toile d'araignee par
            port ayant repondu, sans aucune donnee d'identite — seul le
            profil de maturite est affiche, pour comparaison en salle. */}
        <div style={{ width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <h2 style={{ fontSize: 'clamp(18px, 1.8vw, 24px)', fontWeight: 900, margin: 0 }}>{t.individuelsTitre}</h2>
            <p style={{ fontSize: 12.5, color: '#94a3b8', margin: '6px 0 0', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>{t.individuelsTexte}</p>
          </div>

          {individuels.length === 0 ? (
            <div style={{ ...card, padding: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>{t.individuelsVide}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
              {individuels.map((diag, i) => {
                const valeurs = Object.values(diag.scores || {})
                const score = valeurs.length ? valeurs.reduce((s, v) => s + Number(v), 0) / valeurs.length : 0
                return (
                  <button
                    key={diag.diag_id}
                    type="button"
                    onClick={() => setIndividuelOuvert(i)}
                    style={{
                      ...card, padding: '14px 14px 16px', textAlign: 'center', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: '#fff', fontFamily: 'inherit',
                      transition: 'transform .2s ease, border-color .2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(0,115,244,0.5)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)' }}
                  >
                    <MiniRadar scores={diag.scores} />
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#cbd5e1' }}>{t.portLabel(i + 1)}</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: couleurScore(score) }}>{score.toFixed(1)}</div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modale de navigation d'un profil individuel anonyme (fleches
          precedent/suivant pour parcourir tous les ports en direct). */}
      {individuelOuvert !== null && individuels[individuelOuvert] && createPortal((
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(6,9,18,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setIndividuelOuvert(null)}
        >
          <div style={{ ...card, maxWidth: 1000, width: '100%', maxHeight: '88vh', overflowY: 'auto', padding: '32px 36px', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setIndividuelOuvert(null)} style={{
              position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', fontWeight: 700,
            }}>✕</button>

            {individuels.length > 1 && (
              <>
                <button onClick={individuelPrecedent} aria-label="Precedent" style={{
                  position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', fontWeight: 900, fontSize: 18,
                }}>‹</button>
                <button onClick={individuelSuivant} aria-label="Suivant" style={{
                  position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', fontWeight: 900, fontSize: 18,
                }}>›</button>
              </>
            )}

            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 20, textAlign: 'center' }}>
              {t.portSur(individuelOuvert + 1, individuels.length)}
            </div>
            <DetailVue agg={{ moyennes: individuels[individuelOuvert].scores }} lang={lang} t={t} benchmark={aggGlobal?.moyennes} />
          </div>
        </div>
      ), document.body)}

      {/* Modale d'analyse detaillee */}
      {vueOuverte && createPortal((
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(6,9,18,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setVueOuverte(null)}
        >
          <div style={{ ...card, maxWidth: 1000, width: '100%', maxHeight: '88vh', overflowY: 'auto', padding: '32px 36px', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setVueOuverte(null)} style={{
              position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', fontWeight: 700,
            }}>✕</button>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 20 }}>{labelVue(vueOuverte, lang)}</div>
            <DetailVue agg={aggregates[vueOuverte]} lang={lang} t={t} />
          </div>
        </div>
      ), document.body)}

      <style>{`
        @keyframes copaf-proj-pulse { 0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,.5); } 50% { opacity: .6; box-shadow: 0 0 0 6px rgba(34,197,94,0); } }
        @keyframes copaf-proj-ticker-in { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  )
}
