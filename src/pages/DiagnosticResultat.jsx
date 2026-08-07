import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import { supabase } from '../supabase'
import { generateDiagnosticPDF } from '../utils/generateDiagnosticPDF'

const NAVY = '#000E91'
const BLUE = '#0073F4'

const AXES_LABELS = {
  infrastructure: 'Infrastructure digitale',
  automatisation: 'Automatisation',
  tracabilite: 'Traçabilité & données',
  ia: 'IA & décision',
  cybersecurite: 'Cybersécurité',
  surete: 'Sûreté & sécurité',
  environnement: 'Énergie & environnement',
  synchromodalite: 'Synchromodalité',
  competences: 'Compétences',
  parties_prenantes: 'Parties prenantes',
}

const NOMS_NIVEAUX = ['Nul', 'Très faible', 'Faible', 'Moyen', 'Bon', 'Très bon']

function couleurNiveau(v) {
  if (v <= 1) return '#f87171'
  if (v <= 3) return '#fbbf24'
  return '#4ade80'
}

const Ico = ({ name, size = 18, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    sparkles: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/></svg>,
    download: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  }
  return icons[name] || null
}

// ══════════════════════════════════════════
// Ecran de chargement : radar qui oscille pendant l'analyse
// ══════════════════════════════════════════
function RadarLoader() {
  const [data, setData] = useState(() =>
    Object.values(AXES_LABELS).map(axis => ({ axis, valeur: Math.random() * 5, fullMark: 5 }))
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map(d => ({ ...d, valeur: Math.random() * 5 })))
    }, 550)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 20, padding: '24px 10px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
      <div style={{ width: '100%', height: 340, opacity: 0.85 }}>
        <ResponsiveContainer>
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10.5, fill: '#94a3b8' }} />
            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
            <Radar dataKey="valeur" stroke="#60a5fa" fill={BLUE} fillOpacity={0.35} strokeWidth={2} isAnimationActive={true} animationDuration={500} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#60a5fa', animation: 'copaf-pulse 1s ease-in-out infinite' }} />
          <span style={{ fontSize: 13.5, color: '#94a3b8', fontWeight: 600 }}>Analyse de votre profil Smart Port en cours...</span>
        </div>
      </div>
      <style>{`@keyframes copaf-pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.4); } }`}</style>
    </div>
  )
}

export default function DiagnosticResultat() {
  const { id } = useParams()
  const [diag, setDiag] = useState(null)
  const [fetchDone, setFetchDone] = useState(false)
  const [minDelayDone, setMinDelayDone] = useState(false)
  const [genLoading, setGenLoading] = useState(false)
  const [genError, setGenError] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const timerStarted = useRef(false)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('diagnostics').select('*').eq('id', id).single()
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

  const genererRecommandations = async () => {
    setGenLoading(true); setGenError('')
    try {
      const { data, error } = await supabase.functions.invoke('diagnostic-recommandations', {
        body: { diagnosticId: id },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
      setDiag(d => ({ ...d, recommandations: data.recommandations }))
    } catch (err) {
      setGenError("Impossible de générer les recommandations pour le moment. Réessayez dans un instant.")
      console.error(err)
    } finally {
      setGenLoading(false)
    }
  }

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

  const wrap = { minHeight: '100vh', position: 'relative', fontFamily: "'Plus Jakarta Sans',sans-serif", padding: '40px 20px', color: '#f8fafc' }
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
              COPAF 2026 · Diagnostic Smart Port
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Calcul de votre profil...</div>
          </div>
          <RadarLoader />
        </div>
      </div>
    )
  }

  if (!diag) return (
    <div style={wrap}>
      <Fond />
        <BoutonMenu />
      <div style={{ ...card, textAlign: 'center', paddingTop: 100, color: '#f87171' }}>Diagnostic introuvable.</div>
    </div>
  )

  const scores = diag.scores || {}
  const chartData = Object.keys(AXES_LABELS).map(key => ({
    axis: AXES_LABELS[key],
    valeur: scores[key] ?? 0,
    fullMark: 5,
  }))
  const moyenne = chartData.length ? (chartData.reduce((s, d) => s + d.valeur, 0) / chartData.length) : 0

  return (
    <div style={wrap}>
      <Fond />
        <BoutonMenu />
      <div style={card}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(0, 115, 244, 0.1)', border: '1px solid rgba(0, 115, 244, 0.3)', borderRadius: 20, fontSize: 11, fontWeight: 800, color: BLUE, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>
            COPAF 2026 · Diagnostic Smart Port
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>{diag.organisation || `${diag.prenom} ${diag.nom}`}</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>{diag.pays}</div>
        </div>

        {/* Radar */}
        <div style={{ background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 20, padding: '22px 10px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', marginBottom: 18 }}>
          <div style={{ width: '100%', height: 380 }}>
            <ResponsiveContainer>
              <RadarChart data={chartData} outerRadius="72%">
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: '#cbd5e1' }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 9, fill: '#64748b' }} tickCount={6} axisLine={false} />
                <Radar name="Score" dataKey="valeur" stroke="#60a5fa" fill={BLUE} fillOpacity={0.4} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center', marginTop: 4 }}>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>Score moyen : </span>
            <span style={{ fontSize: 17, fontWeight: 900, color: '#fff' }}>{moyenne.toFixed(1)} / 5</span>
          </div>
        </div>

        {/* Detail par axe */}
        <div style={{ background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 20, padding: 22, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 }}>Détail par axe</div>
          {Object.keys(AXES_LABELS).map(key => {
            const v = scores[key] ?? 0
            const c = couleurNiveau(v)
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 12.5, color: '#cbd5e1', width: 150, flexShrink: 0 }}>{AXES_LABELS[key]}</span>
                <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${(v / 5) * 100}%`, height: '100%', background: c, borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: c, width: 90, textAlign: 'right', flexShrink: 0 }}>{v}/5 · {NOMS_NIVEAUX[v]}</span>
              </div>
            )
          })}
        </div>

        {/* Recommandations IA */}
        <div style={{ background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 20, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Ico name="sparkles" size={17} color="#60a5fa" />
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Recommandations personnalisées</div>
          </div>

          {diag.recommandations ? (
            <div style={{ fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{diag.recommandations}</div>
          ) : (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>Générez une analyse personnalisée basée sur votre profil complet.</p>
              {genError && <p style={{ fontSize: 12.5, color: '#f87171', marginBottom: 12 }}>{genError}</p>}
              <button onClick={genererRecommandations} disabled={genLoading} style={{
                padding: '13px 26px', background: 'linear-gradient(135deg,#0073F4,#000E91)', border: 'none',
                borderRadius: 12, color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 6px 20px rgba(0,115,244,0.4)',
              }}>
                {genLoading ? 'Génération en cours...' : 'Générer mes recommandations'}
              </button>
            </div>
          )}
        </div>

        {/* Telecharger PDF */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button onClick={telechargerPDF} disabled={pdfLoading} style={{
            padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12, color: '#cbd5e1', fontSize: 13, fontWeight: 700, cursor: pdfLoading ? 'default' : 'pointer',
            fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            <Ico name="download" size={15} color="#cbd5e1" />
            {pdfLoading ? 'Préparation du PDF...' : 'Télécharger en PDF'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 11.5, color: '#64748b', marginTop: 20 }}>
            Cette page reste accessible à tout moment — conservez le lien pour la retrouver.
          </p>
        </div>
      </div>
    </div>
  )
}