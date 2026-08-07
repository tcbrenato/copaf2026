import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import { supabase } from '../supabase'

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

const Ico = ({ name, size = 18, color = 'currentColor' }) => {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const icons = {
    sparkles: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/></svg>,
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
    <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20, padding: '24px 10px', boxShadow: '0 4px 20px rgba(0,14,145,.06)' }}>
      <div style={{ width: '100%', height: 340, opacity: 0.85 }}>
        <ResponsiveContainer>
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10.5, fill: '#94a3b8' }} />
            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} />
            <Radar dataKey="valeur" stroke={BLUE} fill={BLUE} fillOpacity={0.3} strokeWidth={2} isAnimationActive={true} animationDuration={500} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: BLUE, animation: 'copaf-pulse 1s ease-in-out infinite' }} />
          <span style={{ fontSize: 13.5, color: '#64748b', fontWeight: 600 }}>Analyse de votre profil Smart Port en cours...</span>
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
      setTimeout(() => setMinDelayDone(true), 10000) // 10s d'animation minimum, effet suspense
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

  const wrap = { minHeight: '100vh', background: 'linear-gradient(180deg,#f0f6ff 0%,#f8faff 100%)', fontFamily: "'Plus Jakarta Sans',sans-serif", padding: '32px 16px' }
  const card = { maxWidth: 720, margin: '0 auto' }

  const enChargement = !fetchDone || !minDelayDone

  if (enChargement) {
    return (
      <div style={wrap}>
        <div style={card}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: BLUE, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>COPAF 2026 · Diagnostic Smart Port</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>Calcul de votre profil...</div>
          </div>
          <RadarLoader />
        </div>
      </div>
    )
  }

  if (!diag) return <div style={wrap}><div style={{ ...card, textAlign: 'center', paddingTop: 100, color: '#dc2626' }}>Diagnostic introuvable.</div></div>

  const scores = diag.scores || {}
  const chartData = Object.keys(AXES_LABELS).map(key => ({
    axis: AXES_LABELS[key],
    valeur: scores[key] ?? 0,
    fullMark: 5,
  }))
  const moyenne = chartData.length ? (chartData.reduce((s, d) => s + d.valeur, 0) / chartData.length) : 0

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: BLUE, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>COPAF 2026 · Diagnostic Smart Port</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a' }}>{diag.organisation || `${diag.prenom} ${diag.nom}`}</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{diag.pays}</div>
        </div>

        {/* Radar */}
        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20, padding: '20px 10px', boxShadow: '0 4px 20px rgba(0,14,145,.06)', marginBottom: 18 }}>
          <div style={{ width: '100%', height: 380 }}>
            <ResponsiveContainer>
              <RadarChart data={chartData} outerRadius="72%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: '#334155' }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 9, fill: '#94a3b8' }} tickCount={6} />
                <Radar name="Score" dataKey="valeur" stroke={NAVY} fill={BLUE} fillOpacity={0.45} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center', marginTop: 4 }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>Score moyen : </span>
            <span style={{ fontSize: 16, fontWeight: 900, color: NAVY }}>{moyenne.toFixed(1)} / 5</span>
          </div>
        </div>

        {/* Detail par axe */}
        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20, padding: 20, boxShadow: '0 4px 20px rgba(0,14,145,.06)', marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>Détail par axe</div>
          {Object.keys(AXES_LABELS).map(key => {
            const v = scores[key] ?? 0
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 12.5, color: '#334155', width: 150, flexShrink: 0 }}>{AXES_LABELS[key]}</span>
                <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${(v / 5) * 100}%`, height: '100%', background: BLUE, borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: NAVY, width: 90, textAlign: 'right', flexShrink: 0 }}>{v}/5 · {NOMS_NIVEAUX[v]}</span>
              </div>
            )
          })}
        </div>

        {/* Recommandations IA */}
        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 20, padding: 22, boxShadow: '0 4px 20px rgba(0,14,145,.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Ico name="sparkles" size={17} color={BLUE} />
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Recommandations personnalisées</div>
          </div>

          {diag.recommandations ? (
            <div style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{diag.recommandations}</div>
          ) : (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Générez une analyse personnalisée basée sur votre profil complet.</p>
              {genError && <p style={{ fontSize: 12.5, color: '#dc2626', marginBottom: 12 }}>{genError}</p>}
              <button onClick={genererRecommandations} disabled={genLoading} style={{
                padding: '12px 24px', background: `linear-gradient(135deg,${BLUE},${NAVY})`, border: 'none',
                borderRadius: 12, color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {genLoading ? 'Génération en cours...' : 'Générer mes recommandations'}
              </button>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 11.5, color: '#94a3b8', marginTop: 20 }}>
          Cette page reste accessible à tout moment — conservez le lien pour la retrouver.
        </p>
      </div>
    </div>
  )
}