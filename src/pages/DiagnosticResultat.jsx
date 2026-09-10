import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import { supabase } from '../supabase'
import { generateDiagnosticPDF } from '../utils/generateDiagnosticPDF'
import { AXES, AXES_LABELS, ECHELLE, txt } from '../utils/diagnosticAxes'
import DiagnosticChat from '../components/DiagnosticChat'

const NAVY = '#000E91'
const BLUE = '#0073F4'

const TR = {
  fr: {
    badge: 'COPAF 2026 · Diagnostic Smart Port',
    calcul: 'Calcul de votre profil...',
    introuvable: 'Diagnostic introuvable.',
    scoreMoyen: 'Score moyen : ',
    profil: 'Profil Smart Port',
    detailAxe: 'Détail par axe',
    lienCopie: 'Lien copié',
    copierLien: 'Copier le lien',
    preparation: 'Préparation...',
    telechargerPDF: 'Télécharger le PDF',
    recoTitre: 'Analyse personnalisée',
    recoIntro: 'Générez une analyse personnalisée basée sur votre profil complet.',
    recoGenLoading: 'Génération en cours...',
    recoGenBtn: 'Générer mes recommandations',
    recoErreur: 'Impossible de générer les recommandations pour le moment. Réessayez dans un instant.',
    diagnosticStrategiqueTitre: '💡 Diagnostic stratégique',
    prioritesTitre: "⚡ 3 priorités d'investissement",
    recommandationCATitre: '📌 Recommandation pour le Conseil d\'Administration',
    detailParDimension: 'Détail du plan d\'action par dimension',
    footer: 'Cette page reste accessible à tout moment — conservez le lien pour la retrouver.',
    planSousTitre: 'Des actions concrètes, adaptées à votre score actuel sur chaque axe.',
    tierLabel: { faible: 'Priorités à traiter', moyen: 'Prochaines étapes', bon: 'Pour aller plus loin' },
    analyseEnCours: 'Analyse de votre profil Smart Port en cours...',
    chargementMessages: [
      'Analyse de votre cyber-résilience et de votre potentiel IA en cours...',
      'Comparaison de vos scores avec les standards régionaux...',
      'Identification de vos priorités d\'investissement...',
      'Préparation de votre plan d\'action personnalisé...',
    ],
    collectifTitre: 'Vue collective de votre port',
    collectifSousTitre: n => n === 1
      ? 'Basée sur 1 diagnostic soumis pour ce port pendant la conférence (le vôtre).'
      : `Basée sur ${n} diagnostics soumis pour ce port pendant la conférence.`,
    focusTitre: '🎯 Focus COPAF 2026 — IA & Cyber-résilience',
    focusSousTitre: 'Les deux dimensions suivies en priorité par le comité d\'organisation cette année.',
  },
  en: {
    badge: 'COPAF 2026 · Smart Port Diagnostic',
    calcul: 'Calculating your profile...',
    introuvable: 'Diagnostic not found.',
    scoreMoyen: 'Average score: ',
    profil: 'Smart Port Profile',
    detailAxe: 'Breakdown by axis',
    lienCopie: 'Link copied',
    copierLien: 'Copy link',
    preparation: 'Preparing...',
    telechargerPDF: 'Download PDF',
    recoTitre: 'Personalised analysis',
    recoIntro: 'Generate a personalised analysis based on your full profile.',
    recoGenLoading: 'Generating...',
    recoGenBtn: 'Generate my recommendations',
    recoErreur: 'Unable to generate recommendations right now. Please try again shortly.',
    diagnosticStrategiqueTitre: '💡 Strategic diagnosis',
    prioritesTitre: '⚡ 3 investment priorities',
    recommandationCATitre: '📌 Board recommendation',
    detailParDimension: 'Detailed action plan by dimension',
    footer: 'This page stays accessible at any time — keep the link to find it again.',
    planSousTitre: 'Concrete actions, matched to your current score on each axis.',
    tierLabel: { faible: 'Priorities to address', moyen: 'Next steps', bon: 'To go further' },
    analyseEnCours: 'Analysing your Smart Port profile...',
    chargementMessages: [
      'Analysing your cyber-resilience and AI potential...',
      'Comparing your scores against regional benchmarks...',
      'Identifying your investment priorities...',
      'Preparing your personalised action plan...',
    ],
    collectifTitre: 'Collective view for your port',
    collectifSousTitre: n => n === 1
      ? 'Based on 1 diagnostic submitted for this port during the conference (yours).'
      : `Based on ${n} diagnostics submitted for this port during the conference.`,
    focusTitre: '🎯 COPAF 2026 Focus — AI & Cyber-resilience',
    focusSousTitre: "The two dimensions tracked as this year's organising committee priority.",
  },
}

function couleurNiveau(v) {
  if (v <= 1) return '#f87171'
  if (v <= 3) return '#fbbf24'
  return '#4ade80'
}

function tierNiveau(v) {
  if (v <= 1) return 'faible'
  if (v <= 3) return 'moyen'
  return 'bon'
}

const Ico = ({ name, size = 18, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    sparkles: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/></svg>,
    download: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    link: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
    check: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    refresh: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
    target: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill={color} stroke="none"/></svg>,
  }
  return icons[name] || null
}

// ══════════════════════════════════════════
// Ecran de chargement : radar qui oscille pendant l'analyse
// ══════════════════════════════════════════
// Tick d'axe personnalise : met en evidence IA & Cybersecurite (priorites
// COPAF 2026 de cette annee), en jaune/gras, distinctes des 8 autres axes.
function TickAxeAnime({ x, y, payload, textAnchor, lang }) {
  const axe = AXES.find(a => txt(a.nom, lang) === payload.value)
  const surligne = axe && (axe.id === 'ia' || axe.id === 'cybersecurite')
  return (
    <text x={x} y={y} textAnchor={textAnchor} fontSize={10.5} fontWeight={surligne ? 800 : 400} fill={surligne ? '#fbbf24' : '#94a3b8'}>
      {payload.value}
    </text>
  )
}

function RadarLoader({ lang = 'fr' }) {
  const [data, setData] = useState(() =>
    AXES.map(axe => ({ axis: txt(axe.nom, lang), valeur: Math.random() * 5, fullMark: 5 }))
  )
  const [messageIdx, setMessageIdx] = useState(0)
  const messages = TR[lang].chargementMessages

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map(d => ({ ...d, valeur: Math.random() * 5 })))
    }, 550)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIdx(i => (i + 1) % messages.length)
    }, 2600)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 20, padding: '24px 10px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
      <div style={{ width: '100%', height: 340, opacity: 0.85 }}>
        <ResponsiveContainer>
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis dataKey="axis" tick={<TickAxeAnime lang={lang} />} />
            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
            <Radar dataKey="valeur" stroke="#60a5fa" fill={BLUE} fillOpacity={0.35} strokeWidth={2} isAnimationActive={true} animationDuration={500} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#60a5fa', animation: 'copaf-pulse 1s ease-in-out infinite' }} />
          <span style={{ fontSize: 13.5, color: '#94a3b8', fontWeight: 600 }}>{messages[messageIdx]}</span>
        </div>
      </div>
      <style>{`@keyframes copaf-pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.4); } }`}</style>
    </div>
  )
}

export default function DiagnosticResultat() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const [diag, setDiag] = useState(null)
  const [fetchDone, setFetchDone] = useState(false)
  const [minDelayDone, setMinDelayDone] = useState(false)
  const [genLoading, setGenLoading] = useState(false)
  const [genError, setGenError] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [lienCopie, setLienCopie] = useState(false)
  const [lang, setLang] = useState(searchParams.get('lang') === 'en' ? 'en' : 'fr')
  const [collectif, setCollectif] = useState(null)
  const timerStarted = useRef(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_diagnostic_result', { p_id: id }).single()
    if (!error) setDiag(data)
    setFetchDone(true)
  }, [id])

  useEffect(() => {
    load()
    if (!timerStarted.current) {
      timerStarted.current = true
      setTimeout(() => setMinDelayDone(true), 10000)
    }
  }, [load])

  useEffect(() => {
    if (diag?.langue === 'en') setLang('en')
  }, [diag])

  useEffect(() => {
    if (!diag?.organisation_id || diag.organisation_id === 'autre') return
    supabase.rpc('get_diagnostic_live_aggregate', {
      p_organisation_id: diag.organisation_id,
      p_site_id: diag.site_id || null,
    }).then(({ data, error }) => {
      if (error || !data) return
      const parAxe = {}
      let nbReponses = 0
      data.forEach(r => {
        parAxe[r.axis_id] = Number(r.moyenne)
        nbReponses = Math.max(nbReponses, Number(r.nb_reponses))
      })
      if (nbReponses > 0) setCollectif({ parAxe, nbReponses })
    })
  }, [diag])

  const t = TR[lang]

  const genererRecommandations = async () => {
    setGenLoading(true); setGenError('')
    try {
      const { data, error } = await supabase.functions.invoke('diagnostic-recommandations', {
        body: { diagnosticId: id },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      setDiag(d => ({
        ...d,
        ...(data.recommandations_v2 ? { recommandations_v2: data.recommandations_v2 } : { recommandations: data.recommandations }),
      }))
    } catch (err) {
      setGenError(t.recoErreur)
      console.error(err)
    } finally {
      setGenLoading(false)
    }
  }

  // Lance la generation IA en arriere-plan des que le diagnostic est
  // charge, sans attendre un clic : le temps de chargement minimum
  // (10s, voir plus haut) masque deja l'appel dans le cas courant, et le
  // bouton manuel plus bas reste un filet de secours si la generation
  // n'est pas terminee a temps.
  const genAutoDeclenche = useRef(false)
  useEffect(() => {
    if (!diag?.id || genAutoDeclenche.current) return
    if (diag.recommandations_v2 || diag.recommandations) return
    genAutoDeclenche.current = true
    genererRecommandations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diag?.id])

  const telechargerPDF = async () => {
    setPdfLoading(true)
    try {
      await generateDiagnosticPDF({ diag })
    } catch (err) {
      console.error('Erreur export PDF:', err)
    } finally {
      setPdfLoading(false)
    }
  }

  const copierLien = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setLienCopie(true)
      setTimeout(() => setLienCopie(false), 2200)
    } catch (err) {
      console.error('Erreur copie du lien:', err)
    }
  }

  const wrap = { minHeight: '100vh', position: 'relative', fontFamily: "'Plus Jakarta Sans',sans-serif", padding: '40px 20px', color: '#f8fafc' }
  const bgImage = { position: 'fixed', inset: 0, zIndex: -2, backgroundColor: '#0b0f1c', backgroundImage: 'url(/hero1.png)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.75) saturate(1.2)' }
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
  const card = { maxWidth: 720, margin: '0 auto' }

  const enChargement = !fetchDone || !minDelayDone

  if (enChargement) {
    return (
      <div style={wrap}>
        <Fond />
        <BoutonMenu />
        <div style={card}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(0, 115, 244, 0.1)', border: '1px solid rgba(0, 115, 244, 0.3)', borderRadius: 20, fontSize: 11, fontWeight: 800, color: BLUE, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>
              {t.badge}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>{t.calcul}</div>
          </div>
          <RadarLoader lang={lang} />
        </div>
      </div>
    )
  }

  if (!diag) return (
    <div style={wrap}>
      <Fond />
        <BoutonMenu />
      <div style={{ ...card, textAlign: 'center', paddingTop: 100, color: '#f87171' }}>{t.introuvable}</div>
    </div>
  )

  const scores = diag.scores || {}
  const chartData = AXES.map(axe => ({
    axis: txt(AXES_LABELS[axe.id], lang),
    valeur: scores[axe.id] ?? 0,
    fullMark: 5,
  }))
  const moyenne = chartData.length ? (chartData.reduce((s, d) => s + d.valeur, 0) / chartData.length) : 0

  const normalise = s => (s || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const roomKey = diag.organisation_id && diag.organisation_id !== 'autre'
    ? `${diag.organisation_id}${diag.site_id ? ':' + diag.site_id : ''}`
    : diag.organisation ? `autre:${normalise(diag.organisation)}:${normalise(diag.pays)}` : null

  const panelStyle = { background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }

  return (
    <div style={wrap}>
      <Fond />
      <BoutonMenu />
      <style>{`
        .dash-wrap { max-width: 1080px; margin: 0 auto; }
        .dash-header {
          display: flex; align-items: flex-end; justify-content: space-between;
          gap: 20px; flex-wrap: wrap; margin-bottom: 24px;
        }
        .dash-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        .dash-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-bottom: 18px;
          align-items: start;
        }
        .plan-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 860px) {
          .dash-grid { grid-template-columns: 1fr; }
          .plan-grid { grid-template-columns: 1fr; }
          .dash-header { justify-content: center; text-align: center; }
          .analyse-row { grid-template-columns: 1fr !important; gap: 6px !important; }
        }
        .dash-btn { transition: transform .15s ease, box-shadow .15s ease; cursor: pointer; }
        .dash-btn:hover { transform: translateY(-2px); }
      `}</style>

      <div className="dash-wrap">

        {/* En-tête + actions */}
        <div className="dash-header">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(0, 115, 244, 0.1)', border: '1px solid rgba(0, 115, 244, 0.3)', borderRadius: 20, fontSize: 11, fontWeight: 800, color: BLUE, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
              {t.badge}
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
              {diag.organisation || `${diag.prenom} ${diag.nom}`}
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>{diag.pays}</div>
          </div>

          <div className="dash-actions">
            <button onClick={copierLien} className="dash-btn" style={{
              padding: '12px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12, color: '#cbd5e1', fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              <Ico name={lienCopie ? 'check' : 'link'} size={15} color={lienCopie ? '#4ade80' : '#cbd5e1'} />
              {lienCopie ? t.lienCopie : t.copierLien}
            </button>
            <button onClick={telechargerPDF} disabled={pdfLoading} className="dash-btn" style={{
              padding: '12px 22px', background: 'linear-gradient(135deg,#0073F4,#000E91)', border: 'none',
              borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
              cursor: pdfLoading ? 'default' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 6px 20px rgba(0,115,244,0.35)',
            }}>
              <Ico name="download" size={15} color="#fff" />
              {pdfLoading ? t.preparation : t.telechargerPDF}
            </button>
          </div>
        </div>

        {/* Focus COPAF 2026 : IA & Cyber-resilience — priorites suivies par
            le comite cette annee, isolees et mises en avant avant le reste
            du profil complet des 10 dimensions. */}
        <div style={{ ...panelStyle, padding: '18px 22px', marginBottom: 18, borderColor: 'rgba(251,191,36,0.25)' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#fbbf24', marginBottom: 2 }}>{t.focusTitre}</div>
          <p style={{ fontSize: 11.5, color: '#94a3b8', marginBottom: 14 }}>{t.focusSousTitre}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {['ia', 'cybersecurite'].map(id => {
              const axe = AXES.find(a => a.id === id)
              const v = scores[id] ?? 0
              const c = couleurNiveau(v)
              return (
                <div key={id} style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: c, flexShrink: 0 }}>{v}<span style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>/5</span></div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff' }}>{txt(axe?.nom, lang)}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: c }}>{txt(ECHELLE[v]?.nom, lang)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Grille dashboard : radar + score / détail par axe */}
        <div className="dash-grid">

          {/* Radar + score moyen */}
          <div style={{ ...panelStyle, padding: '22px 10px' }}>
            <div style={{ padding: '0 16px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
              {t.profil}
            </div>
            <div style={{ width: '100%', height: 340 }}>
              <ResponsiveContainer>
                <RadarChart data={chartData} outerRadius="70%">
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10.5, fill: '#cbd5e1' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 9, fill: '#64748b' }} tickCount={6} axisLine={false} />
                  <Radar name="Score" dataKey="valeur" stroke="#60a5fa" fill={BLUE} fillOpacity={0.4} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ textAlign: 'center', marginTop: 4 }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>{t.scoreMoyen}</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{moyenne.toFixed(1)} / 5</span>
            </div>
          </div>

          {/* Detail par axe */}
          <div style={{ ...panelStyle, padding: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 }}>{t.detailAxe}</div>
            {AXES.map(axe => {
              const v = scores[axe.id] ?? 0
              const c = couleurNiveau(v)
              return (
                <div key={axe.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 12.5, color: '#cbd5e1', width: 150, flexShrink: 0 }}>{txt(AXES_LABELS[axe.id], lang)}</span>
                  <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${(v / 5) * 100}%`, height: '100%', background: c, borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: c, width: 90, textAlign: 'right', flexShrink: 0 }}>{v}/5 · {txt(ECHELLE[v]?.nom, lang)}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Vue collective du port — pleine largeur */}
        {collectif && (
          <div style={{ ...panelStyle, padding: 24, marginBottom: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{t.collectifTitre}</div>
            <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>{t.collectifSousTitre(collectif.nbReponses)}</p>
            {AXES.map(axe => {
              const v = collectif.parAxe[axe.id]
              if (v === undefined) return null
              const c = couleurNiveau(v)
              return (
                <div key={axe.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: '#cbd5e1', width: 150, flexShrink: 0 }}>{txt(AXES_LABELS[axe.id], lang)}</span>
                  <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(v / 5) * 100}%`, height: '100%', background: c }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: c, width: 36, textAlign: 'right', flexShrink: 0 }}>{v.toFixed(1)}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Recommandations IA — format board-ready (diagnostic strategique,
            priorites d'investissement, recommandation CA), avec le detail
            par dimension fusionne juste en dessous au lieu d'etre duplique
            dans une section separee : la version precedente montrait deja
            un texte d'analyse par axe (analyseParAxe) au-dessus des memes
            cartes d'action par axe plus bas sur la page — c'etait la meme
            information dite deux fois. */}
        <div style={{ ...panelStyle, padding: 24, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Ico name="sparkles" size={17} color="#60a5fa" />
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{t.recoTitre}</div>
          </div>

          {diag.recommandations_v2 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>{t.diagnosticStrategiqueTitre}</div>
                <div style={{ fontSize: 14.5, color: '#fff', lineHeight: 1.7, fontWeight: 600 }}>{diag.recommandations_v2.diagnosticStrategique}</div>
              </div>

              <div>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>{t.prioritesTitre}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(diag.recommandations_v2.prioritesInvestissement || []).map((p, i) => (
                    <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px' }}>
                      <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#0073F4,#000E91)', color: '#fff', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{p.titre}</div>
                        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.55 }}>{p.explication}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'linear-gradient(135deg, rgba(0,115,244,0.14), rgba(0,14,145,0.2))', border: '1px solid rgba(0,115,244,0.3)', borderRadius: 12, padding: '16px 18px' }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>{t.recommandationCATitre}</div>
                <div style={{ fontSize: 13.5, color: '#fff', lineHeight: 1.65, fontWeight: 600 }}>{diag.recommandations_v2.recommandationCA}</div>
              </div>

              {/* Detail par dimension — fusionne ici (voir commentaire ci-dessus) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
                  <Ico name="target" size={13} color="#94a3b8" /> {t.detailParDimension}
                </div>
                <p style={{ fontSize: 11.5, color: '#64748b', marginBottom: 14 }}>{t.planSousTitre}</p>
                <div className="plan-grid">
                  {AXES.map(axe => {
                    const v = scores[axe.id] ?? 0
                    const tier = tierNiveau(v)
                    const c = couleurNiveau(v)
                    const items = axe.actions?.[tier] || []
                    if (!items.length) return null
                    return (
                      <div key={axe.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#fff' }}>{txt(axe.nom, lang)}</span>
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: c, padding: '2px 8px', borderRadius: 20, background: `${c}22`, border: `1px solid ${c}55`, whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {t.tierLabel[tier]}
                          </span>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {items.map((item, i) => (
                            <li key={i} style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>{txt(item, lang)}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : diag.recommandations ? (
            <div style={{ fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{diag.recommandations}</div>
          ) : (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>{t.recoIntro}</p>
              {genError && <p style={{ fontSize: 12.5, color: '#f87171', marginBottom: 12 }}>{genError}</p>}
              <button onClick={genererRecommandations} disabled={genLoading} className="dash-btn" style={{
                padding: '13px 26px', background: 'linear-gradient(135deg,#0073F4,#000E91)', border: 'none',
                borderRadius: 12, color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 6px 20px rgba(0,115,244,0.4)', display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
                <Ico name="sparkles" size={14} color="#fff" />
                {genLoading ? t.recoGenLoading : t.recoGenBtn}
              </button>
            </div>
          )}
        </div>

        {/* Chat entre repondants du meme port — pleine largeur */}
        {roomKey && (
          <div style={{ ...panelStyle, padding: 24, marginBottom: 18 }}>
            <DiagnosticChat roomKey={roomKey} pseudoInitial={`${diag.prenom || ''} ${diag.nom || ''}`.trim()} lang={lang} />
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 11.5, color: '#64748b' }}>
          {t.footer}
        </p>
      </div>
    </div>
  )
}
