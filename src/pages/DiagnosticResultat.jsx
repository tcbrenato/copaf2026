import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { supabase } from '../supabase'

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
    shield: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  }
  return icons[name] || null
}

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
    <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(0, 115, 244, 0.3)', borderRadius: 24, padding: '30px 16px', boxShadow: '0 12px 40px rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }}>
      <div style={{ width: '100%', height: 320, opacity: 0.9 }}>
        <ResponsiveContainer>
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} />
            <Radar dataKey="valeur" stroke={BLUE} fill={BLUE} fillOpacity={0.35} strokeWidth={2} isAnimationActive={true} animationDuration={500} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(0,115,244,0.1)', border: '1px solid rgba(0,115,244,0.3)', padding: '8px 16px', borderRadius: 20 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: BLUE, animation: 'copaf-pulse 1s ease-in-out infinite' }} />
          <span style={{ fontSize: 13, color: '#60a5fa', fontWeight: 700, letterSpacing: 0.5 }}>SYNCHRONISATION DES MATRICES SMART PORT...</span>
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
  const captureRef = useRef(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('diagnostics').select('*').eq('id', id).single()
    if (!error) setDiag(data)
    setFetchDone(true)
  }, [id])

  useEffect(() => {
    load()
    if (!timerStarted.current) {
      timerStarted.current = true
      setTimeout(() => setMinDelayDone(true), 8000)
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
      setGenError("Impossible de générer les recommandations. Réessayez dans un instant.")
      console.error(err)
    } finally {
      setGenLoading(false)
    }
  }

  const telechargerPDF = async () => {
    if (!captureRef.current) return
    setPdfLoading(true)
    try {
      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        backgroundColor: '#090d16',
        useCORS: true,
        logging: false
      })
      const imgData = canvas.toDataURL('image/png')

      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight
      }

      const nomFichier = (diag.organisation || `${diag.prenom}-${diag.nom}` || 'diagnostic').replace(/[^a-z0-9]+/gi, '-')
      pdf.save(`Rapport-SmartPort-${nomFichier}.pdf`)
    } catch (err) {
      console.error('Erreur export PDF:', err)
    } finally {
      setPdfLoading(false)
    }
  }

  const wrap = { minHeight: '100vh', background: '#090d16', backgroundImage: 'radial-gradient(circle at 50% 0%, #0d1b3e 0%, #090d16 70%)', fontFamily: "'Plus Jakarta Sans',sans-serif", padding: '40px 16px', color: '#f8fafc' }
  const card = { maxWidth: 800, margin: '0 auto' }

  const enChargement = !fetchDone || !minDelayDone

  if (enChargement) {
    return (
      <div style={wrap}>
        <div style={card}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(0,115,244,0.1)', border: '1px solid rgba(0,115,244,0.3)', borderRadius: 20, fontSize: 11, fontWeight: 800, color: BLUE, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>COPAF 2026</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Analyse Smart Port en cours...</div>
          </div>
          <RadarLoader />
        </div>
      </div>
    )
  }

  if (!diag) return <div style={wrap}><div style={{ ...card, textAlign: 'center', paddingTop: 100, color: '#f87171' }}>Diagnostic introuvable.</div></div>

  const scores = diag.scores || {}
  const chartData = Object.keys(AXES_LABELS).map(key => ({
    axis: AXES_LABELS[key],
    valeur: scores[key] ?? 0,
    fullMark: 5,
  }))
  const moyenne = chartData.length ? (chartData.reduce((s, d) => s + d.valeur, 0) / chartData.length) : 0

  return (
    <div style={wrap}>
      <div style={card} ref={captureRef}>
        {/* En-tête institutionnel High-Tech */}
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 20, padding: 24, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: BLUE, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
              <Ico name="shield" size={14} color={BLUE} /> COPAF 2026 · Smart Port Index
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>{diag.organisation || `${diag.prenom} ${diag.nom}`}</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>{diag.pays} &bull; Évaluation numérique certifiée</div>
          </div>
          <div style={{ textAlign: 'right', background: 'rgba(0, 115, 244, 0.1)', border: '1px solid rgba(0, 115, 244, 0.3)', padding: '12px 18px', borderRadius: 14 }}>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Score Global</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>{moyenne.toFixed(1)} <span style={{ fontSize: 13, color: '#60a5fa' }}>/ 5</span></div>
          </div>
        </div>

        {/* Radar Chart Card */}
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 20, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', marginBottom: 20, backdropFilter: 'blur(12px)' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>Cartographie multidimensionnelle de maturité</div>
          <div style={{ width: '100%', height: 380 }}>
            <ResponsiveContainer>
              <RadarChart data={chartData} outerRadius="72%">
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: '#cbd5e1' }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 9, fill: '#64748b' }} tickCount={6} />
                <Radar name="Score" dataKey="valeur" stroke="#60a5fa" fill={BLUE} fillOpacity={0.4} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Détail par axe en grille 2 colonnes pour un rendu plus propre */}
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 20, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', marginBottom: 20, backdropFilter: 'blur(12px)' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 }}>Analyse détaillée par axe stratégique</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px 16px' }}>
            {Object.keys(AXES_LABELS).map(key => {
              const v = scores[key] ?? 0
              return (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '12px 14px', borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12.5, color: '#e2e8f0', fontWeight: 600 }}>{AXES_LABELS[key]}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa' }}>{v}/5 &bull; {NOMS_NIVEAUX[v]}</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(v / 5) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #0073F4, #60a5fa)', borderRadius: 3 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recommandations IA */}
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 20, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', marginBottom: 20, backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Ico name="sparkles" size={18} color="#60a5fa" />
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Feuille de route & Recommandations Stratégiques</div>
          </div>

          {diag.recommandations ? (
            <div style={{ fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{diag.recommandations}</div>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>Générez votre plan d'action intelligent sur mesure basé sur vos écarts de performance.</p>
              {genError && <p style={{ fontSize: 12.5, color: '#f87171', marginBottom: 12 }}>{genError}</p>}
              <button onClick={genererRecommandations} disabled={genLoading} style={{
                padding: '12px 24px', background: 'linear-gradient(135deg,#0073F4,#000E91)', border: 'none',
                borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 6px 20px rgba(0,115,244,0.4)',
              }}>
                {genLoading ? 'Génération en cours...' : 'Générer la feuille de route IA'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bouton de téléchargement PDF hors capture */}
      <div style={{ ...card, textAlign: 'center', marginTop: 24 }}>
        <button onClick={telechargerPDF} disabled={pdfLoading} style={{
          padding: '14px 28px', background: 'linear-gradient(135deg,#0073F4,#000E91)', border: 'none',
          borderRadius: 14, color: '#fff', fontSize: 14, fontWeight: 700, cursor: pdfLoading ? 'default' : 'pointer',
          fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 10,
          boxShadow: '0 6px 20px rgba(0,115,244,0.4)',
        }}>
          {pdfLoading ? 'Génération du rapport PDF...' : '📄 Télécharger le rapport officiel (PDF)'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#64748b', marginTop: 16 }}>
          Ce lien sécurisé reste actif pour vos revues de direction. Conservez-le précieusement.
        </p>
      </div>
    </div>
  )
}